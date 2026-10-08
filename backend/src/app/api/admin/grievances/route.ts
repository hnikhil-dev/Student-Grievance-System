import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';
import { STAFF_ROLES, USER_ROLES } from '@/constants/roles';
import { paginationQuerySchema } from '@/lib/validation/common';
import { calculateSlaStatus } from '@/lib/sla/engine';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, STAFF_ROLES);
    const { searchParams } = new URL(req.url);

    const queryParams = paginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      pageSize: searchParams.get('pageSize') || 20,
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      search: searchParams.get('search') || undefined,
    });

    const admin = getAdminClient();
    let query = admin
      .from('grievances')
      .select(`
        *,
        student:profiles!grievances_student_id_fkey(id, full_name, email, student_id),
        department:departments(id, name, code),
        assignee:profiles!grievances_assigned_to_fkey(id, full_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Enforce role-based scoping
    if (user.role === USER_ROLES.DEPARTMENT_ADMIN && user.profile.department_id) {
      query = query.eq('department_id', user.profile.department_id);
    } else if (user.role === USER_ROLES.OFFICER) {
      if (user.profile.department_id) {
        query = query.or(`assigned_to.eq.${user.id},department_id.eq.${user.profile.department_id}`);
      } else {
        query = query.eq('assigned_to', user.id);
      }
    }

    // Apply explicit query filters
    if (queryParams.status) {
      query = query.eq('status', queryParams.status);
    }
    if (queryParams.priority) {
      query = query.eq('priority', queryParams.priority);
    }
    if (queryParams.departmentId) {
      query = query.eq('department_id', queryParams.departmentId);
    }
    if (queryParams.assignedTo) {
      query = query.eq('assigned_to', queryParams.assignedTo);
    }
    if (queryParams.search) {
      query = query.or(`title.ilike.%${queryParams.search}%,description.ilike.%${queryParams.search}%,ticket_number.ilike.%${queryParams.search}%`);
    }

    const from = (queryParams.page - 1) * queryParams.pageSize;
    const to = from + queryParams.pageSize - 1;
    query = query.range(from, to);

    const { data: grievances, count, error } = await query;
    if (error) throw error;

    // Attach computed SLA status
    const enriched = ((grievances as any[]) || []).map((g) => ({
      ...g,
      sla_status: calculateSlaStatus(g.created_at, g.due_at, g.resolved_at),
    }));

    return jsonSuccess(enriched, 200, {
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      totalCount: count || 0,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
