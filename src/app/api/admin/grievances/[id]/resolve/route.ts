import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { STAFF_ROLES } from '@/constants/roles';
import { resolveGrievanceSchema } from '@/lib/validation/grievance';
import { transitionGrievanceStatus } from '@/lib/grievance/service';
import { GRIEVANCE_STATUSES } from '@/constants/statuses';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, STAFF_ROLES);
    const { id } = await params;
    const body = await req.json();
    const validated = resolveGrievanceSchema.parse(body);

    const updated = await transitionGrievanceStatus(
      id,
      GRIEVANCE_STATUSES.STUDENT_VERIFICATION,
      user,
      'Resolution proposed by officer; awaiting student confirmation',
      validated.resolution_notes
    );

    return jsonSuccess({
      grievance: updated,
      message: 'Resolution proposed successfully. Grievance is now pending student verification.',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
