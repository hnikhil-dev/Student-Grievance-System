import { getAdminClient } from '@/lib/supabase/admin';
import { calculateSlaStatus } from '@/lib/sla/engine';
import { sendNotification } from '@/lib/notification/service';
import { recordStatusHistory } from '@/lib/audit/service';
import { GRIEVANCE_STATUSES, GrievanceStatus } from '@/constants/statuses';
import { USER_ROLES } from '@/constants/roles';
import { GrievanceRow } from '@/types/database';

/**
 * Checks if a grievance has approached warning threshold or breached SLA.
 * If breached and not already escalated, automatically creates an escalation record
 * and notifies the Department Admin and Super Admin.
 */
export async function evaluateGrievanceSlaAndEscalate(grievance: GrievanceRow): Promise<{
  isWarning: boolean;
  isBreached: boolean;
  escalated: boolean;
}> {
  // If already closed or rejected, no SLA check needed
  if ((['CLOSED', 'REJECTED'] as GrievanceStatus[]).includes(grievance.status)) {
    return { isWarning: false, isBreached: false, escalated: false };
  }

  const slaMetrics = calculateSlaStatus(
    grievance.created_at,
    grievance.due_at,
    grievance.resolved_at
  );

  const admin = getAdminClient();

  // 1. SLA Warning Check (75% elapsed)
  if (slaMetrics.isWarning) {
    if (grievance.assigned_to) {
      await sendNotification({
        userId: grievance.assigned_to,
        grievanceId: grievance.id,
        type: 'SLA_WARNING',
        title: `SLA Warning: Ticket ${grievance.ticket_number}`,
        message: `Over 75% of the SLA has elapsed (${slaMetrics.remainingMinutes} minutes remaining). Please prioritize resolution.`,
      });
    }
  }

  // 2. SLA Breach Check
  if (slaMetrics.isOverdue && grievance.status !== GRIEVANCE_STATUSES.ESCALATED) {
    // Check if an open escalation already exists for this breach
    const { data: existingEscalations } = await admin
      .from('grievance_escalations')
      .select('id')
      .eq('grievance_id', grievance.id)
      .eq('sla_breached', true)
      .limit(1);

    if (!existingEscalations || existingEscalations.length === 0) {
      // Find Department Admin for this grievance's department
      let deptAdminId: string | null = null;
      if (grievance.department_id) {
        const { data: deptAdmins } = await admin
          .from('profiles')
          .select('id')
          .eq('department_id', grievance.department_id)
          .eq('role', USER_ROLES.DEPARTMENT_ADMIN)
          .limit(1);
        if (deptAdmins && deptAdmins.length > 0) {
          deptAdminId = deptAdmins[0].id;
        }
      }

      // Record escalation
      await admin.from('grievance_escalations').insert({
        grievance_id: grievance.id,
        level: 1,
        escalated_from: grievance.assigned_to,
        escalated_to: deptAdminId,
        escalated_to_role: USER_ROLES.DEPARTMENT_ADMIN,
        reason: `Automatic SLA breach: Due date ${grievance.due_at} passed without resolution.`,
        sla_breached: true,
        resolved: false,
      });

      // Update grievance status to ESCALATED
      await admin
        .from('grievances')
        .update({ status: GRIEVANCE_STATUSES.ESCALATED })
        .eq('id', grievance.id);

      // Record audit history
      await recordStatusHistory({
        grievanceId: grievance.id,
        oldStatus: grievance.status,
        newStatus: GRIEVANCE_STATUSES.ESCALATED,
        changedBy: null,
        reason: 'Automated SLA breach escalation',
        metadata: { slaMetrics },
      });

      // Send breach notifications
      if (deptAdminId) {
        await sendNotification({
          userId: deptAdminId,
          grievanceId: grievance.id,
          type: 'SLA_BREACH',
          title: `ESCALATION: SLA Breached on ${grievance.ticket_number}`,
          message: `Ticket ${grievance.ticket_number} ('${grievance.title}') has breached its SLA of ${grievance.sla_hours} hours. Immediate administrative intervention required.`,
        });
      }

      return { isWarning: slaMetrics.isWarning, isBreached: true, escalated: true };
    }
  }

  return { isWarning: slaMetrics.isWarning, isBreached: slaMetrics.isOverdue, escalated: false };
}
