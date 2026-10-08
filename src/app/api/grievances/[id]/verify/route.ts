import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { verifyResolutionSchema } from '@/lib/validation/grievance';
import { transitionGrievanceStatus } from '@/lib/grievance/service';
import { GRIEVANCE_STATUSES } from '@/constants/statuses';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(req);
    const { id } = await params;
    const body = await req.json();
    const validated = verifyResolutionSchema.parse(body);

    const targetStatus = validated.accepted ? GRIEVANCE_STATUSES.CLOSED : GRIEVANCE_STATUSES.REOPENED;

    const updated = await transitionGrievanceStatus(
      id,
      targetStatus,
      user,
      validated.reason || (validated.accepted ? 'Resolution accepted by student' : 'Resolution rejected by student')
    );

    return jsonSuccess({
      grievance: updated,
      accepted: validated.accepted,
      message: validated.accepted
        ? 'Grievance confirmed resolved and closed successfully'
        : 'Grievance has been reopened with your feedback',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
