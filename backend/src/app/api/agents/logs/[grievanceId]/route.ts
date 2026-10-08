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

    const logs = await AgentOrchestrator.getLogsForGrievance(grievanceId);

    return jsonSuccess({
      grievanceId,
      logCount: logs.length,
      logs,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
