import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { STAFF_ROLES } from '@/constants/roles';
import { getAdminClient } from '@/lib/supabase/admin';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, STAFF_ROLES);
    const admin = getAdminClient();

    const { data: grievances, error } = await admin
      .from('grievances')
      .select('category, priority_score, status');

    if (error) throw error;

    const all = (grievances || []) as any[];
    const total = all.length;

    const categoryMap: Record<string, { count: number; totalScore: number; closedCount: number }> = {};

    for (const g of all) {
      const cat = g.category || 'General';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, totalScore: 0, closedCount: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].totalScore += g.priority_score || 0;
      if (g.status === 'CLOSED') {
        categoryMap[cat].closedCount += 1;
      }
    }

    const categories = Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      count: stats.count,
      percentage: total > 0 ? Math.round((stats.count / total) * 100) : 0,
      avgPriorityScore: Math.round(stats.totalScore / stats.count),
      resolutionRate: Math.round((stats.closedCount / stats.count) * 100),
    })).sort((a, b) => b.count - a.count);

    return jsonSuccess({ categories, total });
  } catch (err) {
    return handleApiError(err);
  }
}
