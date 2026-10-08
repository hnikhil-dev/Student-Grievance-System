import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { getGrievanceById, transitionGrievanceStatus } from '@/lib/grievance/service';
import { STAFF_ROLES } from '@/constants/roles';
import { updateGrievanceSchema } from '@/lib/validation/grievance';
import { getAdminClient } from '@/lib/supabase/admin';
import { recordStatusHistory } from '@/lib/audit/service';
import { sendNotification } from '@/lib/notification/service';
import { calculateDueAt, getSlaHoursForPriority } from '@/lib/sla/engine';
import { jsonSuccess, handleApiError } from '@/lib/api-response';
import { NotFoundError } from '@/lib/errors';
import { GrievanceRow } from '@/types/database';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, STAFF_ROLES);
    const { id } = await params;
    const grievance = await getGrievanceById(id, user);

    return jsonSuccess(grievance);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(req, STAFF_ROLES);
    const { id } = await params;
    const body = await req.json();
    const validated = updateGrievanceSchema.parse(body);

    const admin = getAdminClient();
    const { data: current, error: fetchError } = await admin
      .from('grievances')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      throw new NotFoundError('Grievance not found');
    }

    const currentGrievance = current as GrievanceRow;

    // Handle status transition if status is being modified
    if (validated.status && validated.status !== currentGrievance.status) {
      return jsonSuccess(
        await transitionGrievanceStatus(
          id,
          validated.status,
          user,
          validated.reason,
          validated.resolution_notes || undefined
        )
      );
    }

    const updatePayload: Partial<GrievanceRow> = {};

    if (validated.title) updatePayload.title = validated.title;
    if (validated.description) updatePayload.description = validated.description;
    if (validated.category) updatePayload.category = validated.category;
    if (validated.subcategory !== undefined) updatePayload.subcategory = validated.subcategory;
    if (validated.location !== undefined) updatePayload.location = validated.location;
    if (validated.department_id !== undefined) updatePayload.department_id = validated.department_id;
    if (validated.assigned_to !== undefined) updatePayload.assigned_to = validated.assigned_to;
    if (validated.resolution_notes !== undefined) updatePayload.resolution_notes = validated.resolution_notes;

    // If priority is updated, recalculate SLA hours & due_at
    if (validated.priority && validated.priority !== currentGrievance.priority) {
      const newSlaHours = getSlaHoursForPriority(validated.priority);
      const newDueAt = calculateDueAt(currentGrievance.created_at, newSlaHours);
      updatePayload.priority = validated.priority;
      updatePayload.sla_hours = newSlaHours;
      updatePayload.due_at = newDueAt;

      await recordStatusHistory({
        grievanceId: id,
        oldStatus: currentGrievance.status,
        newStatus: currentGrievance.status,
        changedBy: user.id,
        reason: `Priority adjusted from ${currentGrievance.priority} to ${validated.priority}`,
        metadata: { oldPriority: currentGrievance.priority, newPriority: validated.priority, newSlaHours },
      });
    }

    const { data: updated, error: updateError } = await admin
      .from('grievances')
      .update(updatePayload as any)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) throw updateError;
    const updatedRow = updated as unknown as GrievanceRow;

    // If assigned_to changed, record assignment and notify officer
    if (validated.assigned_to && validated.assigned_to !== currentGrievance.assigned_to) {
      await admin.from('grievance_assignments').insert({
        grievance_id: id,
        department_id: updatedRow.department_id || currentGrievance.department_id,
        officer_id: validated.assigned_to,
        assigned_by: user.id,
        notes: validated.reason || 'Assigned via admin panel',
      } as any);

      await sendNotification({
        userId: validated.assigned_to,
        grievanceId: id,
        type: 'ASSIGNED',
        title: `Assigned: Ticket ${currentGrievance.ticket_number}`,
        message: `You have been assigned grievance '${currentGrievance.title}'.`,
      });
    }

    return jsonSuccess(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
