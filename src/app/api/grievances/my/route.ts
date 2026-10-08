import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';
import { jsonSuccess, handleApiError } from '@/lib/api-response';
import { paginationQuerySchema } from '@/lib/validation/common';
import { calculateSlaStatus } from '@/lib/sla/engine';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);

    const queryParams = paginationQuerySchema.parse({
      page: searchParams.get('page') || 1,
      pageSize: searchParams.get('pageSize') || 20,
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      search: searchParams.get('search') || undefined,
    });

    const admin = getAdminClient();
    let query = admin
      .from('grievances')
      .select(`
        *,
        department:departments(id, name, code),
        assignee:profiles!grievances_assigned_to_fkey(id, full_name, email)
      `, { count: 'exact' })
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (queryParams.status) {
      query = query.eq('status', queryParams.status);
    }
    if (queryParams.priority) {
      query = query.eq('priority', queryParams.priority);
    }
    if (queryParams.search) {
      query = query.or(`title.ilike.%${queryParams.search}%,description.ilike.%${queryParams.search}%,ticket_number.ilike.%${queryParams.search}%`);
    }

    const from = (queryParams.page - 1) * queryParams.pageSize;
    const to = from + queryParams.pageSize - 1;
    query = query.range(from, to);

    const { data: grievances, count, error } = await query;

    if (error) {
      throw error;
    }

    // Attach computed SLA status to each grievance
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
