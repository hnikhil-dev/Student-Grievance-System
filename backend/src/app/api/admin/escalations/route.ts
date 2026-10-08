import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { STAFF_ROLES } from '@/constants/roles';
import { getAdminClient } from '@/lib/supabase/admin';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, STAFF_ROLES);
    const admin = getAdminClient();

    // Fetch escalated grievances with joined department and assignee
    const { data: escalations, error } = await admin
      .from('grievances')
      .select(`
        id,
        ticket_number,
        title,
        description,
        category,
        priority,
        priority_score,
        status,
        sla_hours,
        due_at,
        created_at,
        department:departments(id, name, code),
        assignee:profiles!grievances_assigned_to_fkey(id, full_name, email)
      `)
      .or('status.eq.ESCALATED,priority.eq.CRITICAL')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped = ((escalations || []) as any[]).map((g) => {
      const isBreached = new Date(g.due_at).getTime() < Date.now();
      return {
        id: g.id,
        ticketNumber: g.ticket_number,
        title: g.title,
        category: g.category,
        department: g.department?.name || 'Central Administration',
        priority: g.priority,
        priorityScore: g.priority_score,
        status: g.status,
        level: g.priority === 'CRITICAL' ? 2 : 1,
        slaTargetHours: g.sla_hours || 12,
        isSlaBreached: isBreached,
        assignedTo: g.assignee?.full_name || 'Department Dean',
        escalatedAt: g.created_at,
        reason: g.status === 'ESCALATED' ? 'SLA breach threshold reached without officer resolution' : 'High blast-radius incident flagged by Autonomous Sentinel',
      };
    });

    return jsonSuccess({
      escalations: mapped,
      totalCount: mapped.length,
      breachedCount: mapped.filter((e) => e.isSlaBreached).length,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
