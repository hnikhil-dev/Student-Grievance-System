import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { reopenGrievanceSchema } from '@/lib/validation/grievance';
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
    const validated = reopenGrievanceSchema.parse(body);

    const updated = await transitionGrievanceStatus(
      id,
      GRIEVANCE_STATUSES.REOPENED,
      user,
      validated.reason
    );

    return jsonSuccess({
      grievance: updated,
      message: 'Grievance reopened successfully',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
