import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { STAFF_ROLES } from '@/constants/roles';
import { getAdminClient } from '@/lib/supabase/admin';
import { GRIEVANCE_STATUSES, GrievanceStatus } from '@/constants/statuses';
import { GrievanceRow, GrievanceFeedbackRow } from '@/types/database';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, STAFF_ROLES);
    const admin = getAdminClient();

    // Fetch all grievances for aggregated metrics
    const { data: grievances, error } = await admin
      .from('grievances')
      .select('id, status, priority, due_at, created_at, resolved_at, closed_at');

    if (error) throw error;

    const all = (grievances || []) as Array<Pick<GrievanceRow, 'id' | 'status' | 'priority' | 'due_at' | 'created_at' | 'resolved_at' | 'closed_at'>>;
    const totalGrievances = all.length;

    const openStatuses: GrievanceStatus[] = [
      GRIEVANCE_STATUSES.SUBMITTED,
      GRIEVANCE_STATUSES.UNDER_REVIEW,
      GRIEVANCE_STATUSES.ASSIGNED,
      GRIEVANCE_STATUSES.IN_PROGRESS,
      GRIEVANCE_STATUSES.REOPENED,
    ];

    const openCount = all.filter((g) => openStatuses.includes(g.status)).length;
    const inProgressCount = all.filter((g) => g.status === GRIEVANCE_STATUSES.IN_PROGRESS).length;
    const pendingVerificationCount = all.filter((g) =>
      [GRIEVANCE_STATUSES.STUDENT_VERIFICATION, GRIEVANCE_STATUSES.RESOLUTION_PROPOSED].includes(g.status as any)
    ).length;
    const closedCount = all.filter((g) => g.status === GRIEVANCE_STATUSES.CLOSED).length;
    const escalatedCount = all.filter((g) => g.status === GRIEVANCE_STATUSES.ESCALATED).length;

    const now = Date.now();
    const overdueCount = all.filter((g) => {
      if ([GRIEVANCE_STATUSES.CLOSED, GRIEVANCE_STATUSES.REJECTED].includes(g.status as any)) return false;
      return new Date(g.due_at).getTime() < now;
    }).length;

    // Calculate average resolution time for resolved/closed tickets
    const resolvedGrievances = all.filter((g) => g.resolved_at || g.closed_at);
    let avgResolutionHours = 0;
    if (resolvedGrievances.length > 0) {
      const totalHours = resolvedGrievances.reduce((acc, g) => {
        const endTime = new Date(g.resolved_at || g.closed_at!).getTime();
        const startTime = new Date(g.created_at).getTime();
        return acc + Math.max(0, endTime - startTime) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round((totalHours / resolvedGrievances.length) * 10) / 10;
    }

    // Calculate average student satisfaction rating
    const { data: feedbackData } = await admin
      .from('grievance_feedback')
      .select('rating');

    const feedback = (feedbackData || []) as Array<Pick<GrievanceFeedbackRow, 'rating'>>;
    let averageSatisfaction = 0;
    if (feedback.length > 0) {
      const sum = feedback.reduce((acc, f) => acc + f.rating, 0);
      averageSatisfaction = Math.round((sum / feedback.length) * 10) / 10;
    }

    return jsonSuccess({
      totalGrievances,
      openCount,
      inProgressCount,
      pendingVerificationCount,
      closedCount,
      escalatedCount,
      overdueCount,
      avgResolutionHours,
      averageSatisfaction,
      totalFeedbackResponses: feedbackData?.length || 0,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
