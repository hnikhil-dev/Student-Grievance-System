import { getAdminClient } from '@/lib/supabase/admin';

export interface NotificationInput {
  userId: string;
  grievanceId?: string | null;
  type:
    | 'SUBMITTED'
    | 'ASSIGNED'
    | 'STATUS_UPDATE'
    | 'COMMENT_ADDED'
    | 'SLA_WARNING'
    | 'SLA_BREACH'
    | 'RESOLUTION_PROPOSED'
    | 'VERIFICATION_REQUIRED'
    | 'REOPENED'
    | 'CLOSED'
    | 'ESCALATED';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Dispatches an in-app notification to a specific user.
 */
export async function sendNotification(input: NotificationInput): Promise<void> {
  const admin = getAdminClient();
  try {
    const { error } = await admin.from('notifications').insert({
      user_id: input.userId,
      grievance_id: input.grievanceId || null,
      type: input.type,
      title: input.title,
      message: input.message,
      is_read: false,
      metadata: input.metadata || {},
    } as any);

    if (error) {
      console.error('[NOTIFICATION_ERROR] Failed to insert notification:', error);
    }
  } catch (err) {
    console.error('[NOTIFICATION_EXCEPTION]', err);
  }
}
