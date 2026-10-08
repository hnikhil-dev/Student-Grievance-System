import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { STAFF_ROLES, USER_ROLES } from '@/constants/roles';
import { escalateGrievanceSchema } from '@/lib/validation/grievance';
import { getAdminClient } from '@/lib/supabase/admin';
import { transitionGrievanceStatus } from '@/lib/grievance/service';
import { GRIEVANCE_STATUSES } from '@/constants/statuses';
import { sendNotification } from '@/lib/notification/service';
import { jsonSuccess, handleApiError } from '@/lib/api-response';
import { NotFoundError } from '@/lib/errors';
import { GrievanceRow } from '@/types/database';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, STAFF_ROLES);
    const { id } = await params;
    const body = await req.json();
    const validated = escalateGrievanceSchema.parse(body);

    const admin = getAdminClient();
    const { data: grievance, error: grvError } = await admin
      .from('grievances')
      .select('*')
      .eq('id', id)
      .single();

    if (grvError || !grievance) {
      throw new NotFoundError('Grievance not found');
    }

    const current = grievance as GrievanceRow;

    // Transition status to ESCALATED
    const updated = await transitionGrievanceStatus(
      id,
      GRIEVANCE_STATUSES.ESCALATED,
      user,
      validated.reason
    );

    // Record escalation entry
    await admin.from('grievance_escalations').insert({
      grievance_id: id,
      level: 1,
      escalated_from: user.id,
      escalated_to: validated.escalated_to || null,
      escalated_to_role: USER_ROLES.DEPARTMENT_ADMIN,
      reason: validated.reason,
      sla_breached: false,
      resolved: false,
    } as any);

    // Notify target administrator or department head
    if (validated.escalated_to) {
      await sendNotification({
        userId: validated.escalated_to,
        grievanceId: id,
        type: 'ESCALATED',
        title: `Manual Escalation: ${current.ticket_number}`,
        message: `Grievance has been escalated by ${user.profile.full_name}. Reason: ${validated.reason}`,
      });
    }

    return jsonSuccess({
      grievance: updated,
      message: 'Grievance escalated successfully',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
