import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';
import { jsonSuccess, jsonError, handleApiError } from '@/lib/api-response';
import { computeSha256 } from '@/lib/evidence/hasher';
import { EvidenceType } from '@/lib/agents/types';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const contentType = req.headers.get('content-type') || '';

    let grievanceId = '';
    let fileName = '';
    let fileType = '';
    let fileSize = 0;
    let filePath = '';
    let fileBuffer: Buffer | undefined;
    let evidenceType: EvidenceType = 'PHOTO';
    let isResolutionProof = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      grievanceId = (formData.get('grievanceId') as string) || '';
      evidenceType = ((formData.get('evidenceType') as string) || 'PHOTO') as EvidenceType;
      isResolutionProof = formData.get('isResolutionProof') === 'true';

      if (!file) {
        return jsonError('No file provided in form data', 'BAD_REQUEST', 400);
      }
      if (!grievanceId) {
        return jsonError('grievanceId is required', 'BAD_REQUEST', 400);
      }

      fileName = file.name;
      fileType = file.type || 'application/octet-stream';
      fileSize = file.size;

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      // Upload to Supabase Storage bucket 'grievance-files'
      const admin = getAdminClient();
      const storageKey = `evidence/${grievanceId}/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const { data: uploadData, error: uploadError } = await admin.storage
        .from('grievance-files')
        .upload(storageKey, fileBuffer, {
          contentType: fileType,
          upsert: true,
        });

      if (uploadError) {
        console.warn(`[EvidenceUpload] Storage upload warning: ${uploadError.message}`);
        filePath = `local/evidence/${fileName}`;
      } else {
        filePath = uploadData?.path || storageKey;
      }
    } else {
      // JSON payload
      const body = await req.json();
      grievanceId = body.grievanceId;
      fileName = body.fileName || 'evidence.jpg';
      fileType = body.fileType || 'image/jpeg';
      fileSize = body.fileSize || 1024;
      filePath = body.filePath || `evidence/${grievanceId}/${fileName}`;
      evidenceType = (body.evidenceType || 'PHOTO') as EvidenceType;
      isResolutionProof = Boolean(body.isResolutionProof);

      if (body.fileBase64) {
        fileBuffer = Buffer.from(body.fileBase64, 'base64');
        fileSize = fileBuffer.byteLength;
      }
    }

    if (!grievanceId) {
      return jsonError('grievanceId is required', 'BAD_REQUEST', 400);
    }

    // Fetch grievance context for multimodal cross-referencing
    const admin = getAdminClient();
    const { data: grievance } = await admin
      .from('grievances')
      .select('id, title, description, category')
      .eq('id', grievanceId)
      .single();

    const title = grievance?.title || 'Reported Student Issue';
    const description = grievance?.description || 'Details of the incident';
    const category = grievance?.category || 'CAMPUS';

    // Run Evidence Agent pipeline
    const agentResult = await AgentOrchestrator.runEvidenceVerification({
      grievanceId,
      uploadedBy: user.id,
      fileName,
      fileType,
      fileSize,
      fileBuffer,
      filePath,
      evidenceType,
      isResolutionProof,
      grievanceTitle: title,
      grievanceDescription: description,
      grievanceCategory: category,
    });

    return jsonSuccess(
      {
        evidence: {
          grievanceId,
          fileName,
          filePath,
          fileType,
          fileSize,
          sha256: agentResult.data.sha256Hash,
          authenticityStatus: agentResult.data.authenticityStatus,
          relevanceScore: agentResult.data.relevanceScore,
          aiDescription: agentResult.data.aiDescription,
          isResolutionProof,
        },
        agentAnalysis: agentResult,
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
