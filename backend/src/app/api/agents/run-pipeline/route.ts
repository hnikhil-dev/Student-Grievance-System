import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';
import { jsonSuccess, jsonError, handleApiError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();

    const { action, payload } = body;

    if (!action) {
      return jsonError('Missing required field "action" (triage | verify-evidence | patrol-sla | verify-resolution)', 'BAD_REQUEST', 400);
    }

    switch (action) {
      case 'triage': {
        const triageResult = await AgentOrchestrator.runTriage({
          grievanceId: payload?.grievanceId,
          title: payload?.title || '',
          description: payload?.description || '',
          category: payload?.category,
          severity: payload?.severity,
          urgency: payload?.urgency,
          affectedStudents: payload?.affectedStudents,
          recurrence: payload?.recurrence,
          location: payload?.location,
        });
        return jsonSuccess(triageResult);
      }

      case 'verify-evidence': {
        const evidenceResult = await AgentOrchestrator.runEvidenceVerification({
          grievanceId: payload?.grievanceId,
          uploadedBy: user.id,
          fileName: payload?.fileName || 'document.pdf',
          fileType: payload?.fileType || 'application/pdf',
          fileSize: payload?.fileSize || 1024,
          filePath: payload?.filePath || `evidence/${payload?.grievanceId}/${payload?.fileName}`,
          evidenceType: payload?.evidenceType || 'PHOTO',
          isResolutionProof: Boolean(payload?.isResolutionProof),
          grievanceTitle: payload?.grievanceTitle || '',
          grievanceDescription: payload?.grievanceDescription || '',
          grievanceCategory: payload?.grievanceCategory,
        });
        return jsonSuccess(evidenceResult);
      }

      case 'patrol-sla': {
        const patrolResult = await AgentOrchestrator.runSlaSentinelPatrol(payload?.grievanceId);
        return jsonSuccess(patrolResult);
      }

      case 'verify-resolution': {
        const resolutionResult = await AgentOrchestrator.runResolutionVerification({
          grievanceId: payload?.grievanceId,
          initialDescription: payload?.initialDescription || '',
          resolutionNotes: payload?.resolutionNotes || '',
          officerEvidence: payload?.officerEvidence,
          initialEvidence: payload?.initialEvidence,
        });
        return jsonSuccess(resolutionResult);
      }

      default:
        return jsonError(`Unsupported agent pipeline action: ${action}`, 'BAD_REQUEST', 400);
    }
  } catch (err) {
    return handleApiError(err);
  }
}
