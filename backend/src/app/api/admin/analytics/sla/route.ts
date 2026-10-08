import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { STAFF_ROLES } from '@/constants/roles';
import { getAdminClient } from '@/lib/supabase/admin';
import { GrievanceRow } from '@/types/database';
import { calculateSlaStatus } from '@/lib/sla/engine';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, STAFF_ROLES);
    const admin = getAdminClient();

    const { data: grievances, error } = await admin
      .from('grievances')
      .select('id, status, priority, created_at, due_at, resolved_at');

    if (error) throw error;

    const all = (grievances || []) as Array<Pick<GrievanceRow, 'id' | 'status' | 'priority' | 'created_at' | 'due_at' | 'resolved_at'>>;
    let breachedCount = 0;
    let warningCount = 0;
    let onTrackCount = 0;
    let resolvedOnTime = 0;
    let totalResolved = 0;

    const breachByPriority: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    for (const g of all) {
      const metrics = calculateSlaStatus(g.created_at, g.due_at, g.resolved_at);

      if (g.resolved_at || g.status === 'CLOSED') {
        totalResolved += 1;
        if (!metrics.isOverdue) {
          resolvedOnTime += 1;
        }
      } else if (g.status !== 'REJECTED') {
        if (metrics.isOverdue) {
          breachedCount += 1;
          breachByPriority[g.priority] = (breachByPriority[g.priority] || 0) + 1;
        } else if (metrics.isWarning) {
          warningCount += 1;
        } else {
          onTrackCount += 1;
        }
      }
    }

    const complianceRate = totalResolved > 0 ? Math.round((resolvedOnTime / totalResolved) * 100) : 100;

    return jsonSuccess({
      complianceRate,
      resolvedOnTime,
      totalResolved,
      activeTickets: {
        breachedCount,
        warningCount,
        onTrackCount,
      },
      breachByPriority,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
