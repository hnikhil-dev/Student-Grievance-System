import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const admin = getAdminClient();

    const { data: notifications, error } = await admin
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const list = (notifications || []) as import('@/types/database').NotificationRow[];
    const unreadCount = list.filter((n) => !n.is_read).length;

    return jsonSuccess({
      notifications: list,
      unreadCount,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
