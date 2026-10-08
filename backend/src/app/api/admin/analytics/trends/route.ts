import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { STAFF_ROLES } from '@/constants/roles';
import { getAdminClient } from '@/lib/supabase/admin';
import { GrievanceRow } from '@/types/database';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, STAFF_ROLES);
    const admin = getAdminClient();

    // Fetch grievances created in the last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: grievances, error } = await admin
      .from('grievances')
      .select('id, created_at, resolved_at, closed_at')
      .gte('created_at', fourteenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    const daysMap: Record<string, { date: string; submitted: number; resolved: number }> = {};

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      daysMap[dateKey] = { date: dateKey, submitted: 0, resolved: 0 };
    }

    const all = (grievances || []) as Array<Pick<GrievanceRow, 'id' | 'created_at' | 'resolved_at' | 'closed_at'>>;
    for (const g of all) {
      const createdDate = g.created_at.split('T')[0];
      if (daysMap[createdDate]) {
        daysMap[createdDate].submitted += 1;
      }

      if (g.resolved_at || g.closed_at) {
        const resolvedDate = (g.resolved_at || g.closed_at)!.split('T')[0];
        if (daysMap[resolvedDate]) {
          daysMap[resolvedDate].resolved += 1;
        }
      }
    }

    const trends = Object.values(daysMap);

    return jsonSuccess({ trends });
  } catch (err) {
    return handleApiError(err);
  }
}
