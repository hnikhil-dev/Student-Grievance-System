import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { STAFF_ROLES } from '@/constants/roles';
import { getAdminClient } from '@/lib/supabase/admin';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, STAFF_ROLES);
    const admin = getAdminClient();

    const [deptRes, grvRes] = await Promise.all([
      admin.from('departments').select('id, name, code'),
      admin.from('grievances').select('id, department_id, status, due_at, resolved_at'),
    ]);

    if (deptRes.error) throw deptRes.error;
    if (grvRes.error) throw grvRes.error;

    const departments = (deptRes.data || []) as any[];
    const grievances = (grvRes.data || []) as any[];
    const now = Date.now();

    const deptStats = departments.map((dept) => {
      const deptGrievances = grievances.filter((g) => g.department_id === dept.id);
      const total = deptGrievances.length;
      const closed = deptGrievances.filter((g) => g.status === 'CLOSED').length;
      const inProgress = deptGrievances.filter((g) => g.status === 'IN_PROGRESS' || g.status === 'ASSIGNED').length;
      const overdue = deptGrievances.filter((g) => {
        if (g.status === 'CLOSED' || g.status === 'REJECTED') return false;
        return new Date(g.due_at).getTime() < now;
      }).length;

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        total,
        closed,
        inProgress,
        overdue,
        resolutionRate: total > 0 ? Math.round((closed / total) * 100) : 0,
      };
    }).sort((a, b) => b.total - a.total);

    return jsonSuccess({ departments: deptStats });
  } catch (err) {
    return handleApiError(err);
  }
}
