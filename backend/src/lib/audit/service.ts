import { getAdminClient } from '@/lib/supabase/admin';
import { GrievanceStatus } from '@/constants/statuses';

export interface AuditRecordInput {
  grievanceId: string;
  oldStatus?: GrievanceStatus | null;
  newStatus: GrievanceStatus;
  changedBy?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Creates an immutable audit trail entry in grievance_status_history.
 */
export async function recordStatusHistory(input: AuditRecordInput): Promise<void> {
  const admin = getAdminClient();
  try {
    const { error } = await admin.from('grievance_status_history').insert({
      grievance_id: input.grievanceId,
      old_status: input.oldStatus || null,
      new_status: input.newStatus,
      changed_by: input.changedBy || null,
      reason: input.reason || null,
      metadata: input.metadata || {},
    } as any);

    if (error) {
      console.error('[AUDIT_LOG_ERROR] Failed to record status history:', error);
    }
  } catch (err) {
    console.error('[AUDIT_LOG_EXCEPTION]', err);
  }
}
