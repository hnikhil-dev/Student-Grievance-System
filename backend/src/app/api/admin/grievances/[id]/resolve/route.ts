import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { STAFF_ROLES } from '@/constants/roles';
import { resolveGrievanceSchema } from '@/lib/validation/grievance';
import { transitionGrievanceStatus } from '@/lib/grievance/service';
import { GRIEVANCE_STATUSES } from '@/constants/statuses';
import { getAdminClient } from '@/lib/supabase/admin';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';
import { EvidenceType } from '@/lib/agents/types';
import { jsonSuccess, jsonError, handleApiError } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, STAFF_ROLES);
    const { id } = await params;
    const contentType = req.headers.get('content-type') || '';

    let resolutionNotes = '';
    let evidenceFile: File | null = null;
    let evidenceType: EvidenceType = 'PHOTO';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      resolutionNotes = (formData.get('resolution_notes') as string) || '';
      evidenceFile = formData.get('file') as File | null;
      evidenceType = ((formData.get('evidenceType') as string) || 'PHOTO') as EvidenceType;
    } else {
      const body = await req.json();
      resolutionNotes = body.resolution_notes || '';
      evidenceType = (body.evidenceType || 'PHOTO') as EvidenceType;
    }

    const validated = resolveGrievanceSchema.parse({
      resolution_notes: resolutionNotes,
    });

    const admin = getAdminClient();
    const { data: current, error: currentErr } = await admin
      .from('grievances')
      .select('*')
      .eq('id', id)
      .single();

    if (currentErr || !current) {
      return jsonError('Grievance not found', 'NOT_FOUND', 404);
    }

    // Step 1: Process Solved Media / Counter-Evidence upload if provided
    let evidenceResult = null;
    const officerEvidenceList: Array<{
      fileName: string;
      fileType: string;
      description?: string;
      sha256?: string;
    }> = [];

    if (evidenceFile && evidenceFile.size > 0) {
      const fileName = evidenceFile.name;
      const fileType = evidenceFile.type || 'image/jpeg';
      const fileSize = evidenceFile.size;
      const arrayBuffer = await evidenceFile.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      let filePath = `evidence/${id}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      try {
        const { data: uploadData, error: uploadErr } = await admin.storage
          .from('grievance-files')
          .upload(filePath, fileBuffer, {
            contentType: fileType,
            upsert: true,
          });

        if (uploadErr) {
          console.warn(`[ResolutionUpload] Storage note: ${uploadErr.message}`);
          filePath = `local/evidence/${fileName}`;
        } else if (uploadData?.path) {
          filePath = uploadData.path;
        }
      } catch (err: any) {
        console.warn(`[ResolutionUpload] Storage fallback: ${err?.message}`);
        filePath = `local/evidence/${fileName}`;
      }

      // Execute Evidence Agent pipeline for counter-evidence verification & SHA-256 hashing
      evidenceResult = await AgentOrchestrator.runEvidenceVerification({
        grievanceId: id,
        uploadedBy: user.id,
        fileName,
        fileType,
        fileSize,
        fileBuffer,
        filePath,
        evidenceType,
        isResolutionProof: true,
        grievanceTitle: current.title,
        grievanceDescription: current.description,
        grievanceCategory: current.category,
      });

      if (evidenceResult?.data?.sha256Hash) {
        officerEvidenceList.push({
          fileName,
          fileType,
          description: evidenceResult.data.aiDescription || 'Counter-evidence proof',
          sha256: evidenceResult.data.sha256Hash,
        });
      }
    }

    // Check existing resolution proofs if any
    const existingEvidence = await AgentOrchestrator.getEvidenceForGrievance(id);
    for (const ev of existingEvidence) {
      if (ev.is_resolution_proof && !officerEvidenceList.some((o) => o.fileName === ev.file_name)) {
        officerEvidenceList.push({
          fileName: ev.file_name,
          fileType: ev.file_type || 'image/jpeg',
          description: ev.ai_description || 'Existing counter-evidence proof',
          sha256: ev.sha256_hash,
        });
      }
    }

    // Step 2: Trigger Resolution Verifier Agent
    const verifierResult = await AgentOrchestrator.runResolutionVerification({
      grievanceId: id,
      initialDescription: current.description,
      resolutionNotes: validated.resolution_notes,
      officerEvidence: officerEvidenceList,
    });

    // Step 3: Transition status safely to STUDENT_VERIFICATION
    if (current.status === GRIEVANCE_STATUSES.SUBMITTED) {
      await transitionGrievanceStatus(
        id,
        GRIEVANCE_STATUSES.ASSIGNED,
        user,
        'Assigned to department officer for resolution triage'
      );
    }

    const { data: midState } = await admin.from('grievances').select('*').eq('id', id).single();
    if (midState && (midState.status === GRIEVANCE_STATUSES.ASSIGNED || midState.status === GRIEVANCE_STATUSES.UNDER_REVIEW)) {
      await transitionGrievanceStatus(
        id,
        GRIEVANCE_STATUSES.IN_PROGRESS,
        user,
        'Work initiated by administrative officer prior to resolution proposal'
      );
    }

    const updated = await transitionGrievanceStatus(
      id,
      GRIEVANCE_STATUSES.STUDENT_VERIFICATION,
      user,
      `Resolution proposed by officer with verification: ${verifierResult.data.verdict}`,
      validated.resolution_notes
    );

    return jsonSuccess({
      grievance: updated,
      verificationResult: verifierResult.data,
      agentLog: verifierResult,
      evidence: evidenceResult?.data || null,
      message: `Resolution proposed successfully (${verifierResult.data.verdict}). Grievance is now pending student verification.`,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
