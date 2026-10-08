import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ grievanceId: string }> }
) {
  try {
    await requireUser(req);
    const { grievanceId } = await params;

    const evidence = await AgentOrchestrator.getEvidenceForGrievance(grievanceId);

    return jsonSuccess({
      grievanceId,
      totalEvidenceCount: evidence.length,
      evidence,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
