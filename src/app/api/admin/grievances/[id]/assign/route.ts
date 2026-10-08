import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { ADMIN_ROLES } from '@/constants/roles';
import { GRIEVANCE_STATUSES } from '@/constants/statuses';
import { assignGrievanceSchema } from '@/lib/validation/assignment';
import { getAdminClient } from '@/lib/supabase/admin';
import { recordStatusHistory } from '@/lib/audit/service';
import { sendNotification } from '@/lib/notification/service';
import { jsonSuccess, handleApiError } from '@/lib/api-response';
import { NotFoundError } from '@/lib/errors';
import { GrievanceRow } from '@/types/database';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, ADMIN_ROLES);
    const { id } = await params;
    const body = await req.json();
    const validated = assignGrievanceSchema.parse(body);

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

    // Update grievance record
    const nextStatus = current.status === GRIEVANCE_STATUSES.SUBMITTED ? GRIEVANCE_STATUSES.ASSIGNED : current.status;
    const { data: updated, error: updateError } = await admin
      .from('grievances')
      .update({
        department_id: validated.department_id,
        assigned_to: validated.officer_id || null,
        status: nextStatus,
      } as any)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) throw updateError;

    // Record into grievance_assignments
    await admin.from('grievance_assignments').insert({
      grievance_id: id,
      department_id: validated.department_id,
      officer_id: validated.officer_id || null,
      assigned_by: user.id,
      notes: validated.notes || 'Assigned by administrator',
    } as any);

    // Record audit status history if status changed
    if (nextStatus !== current.status) {
      await recordStatusHistory({
        grievanceId: id,
        oldStatus: current.status,
        newStatus: nextStatus,
        changedBy: user.id,
        reason: validated.notes || 'Assigned to officer/department',
      });
    }

    // Notify assigned officer
    if (validated.officer_id) {
      await sendNotification({
        userId: validated.officer_id,
        grievanceId: id,
        type: 'ASSIGNED',
        title: `Grievance Assigned: ${current.ticket_number}`,
        message: `You have been assigned to ticket '${current.title}'. Notes: ${validated.notes || 'None'}`,
      });
    }

    return jsonSuccess({
      grievance: updated,
      message: 'Grievance assigned successfully',
    });
  } catch (err) {
    return handleApiError(err);
  }
}
