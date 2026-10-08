import { getAdminClient } from '@/lib/supabase/admin';
import { calculatePriority } from '@/lib/priority/engine';
import { calculateDueAt, calculateSlaStatus, getSlaHoursForPriority } from '@/lib/sla/engine';
import { determineDepartmentCode } from '@/lib/assignment/engine';
import { generateTicketNumber } from './ticket';
import { validateStatusTransition } from './lifecycle';
import { recordStatusHistory } from '@/lib/audit/service';
import { sendNotification } from '@/lib/notification/service';
import { GRIEVANCE_STATUSES, GrievanceStatus } from '@/constants/statuses';
import { USER_ROLES } from '@/constants/roles';
import { GrievanceRow, ProfileRow } from '@/types/database';
import { CreateGrievanceDTO, GrievanceWithDetails } from '@/types/grievance';
import { AuthenticatedUser } from '@/types/auth';
import { canAccessGrievance, canViewInternalComments } from '@/lib/auth/rbac';
import { ForbiddenError, NotFoundError } from '@/lib/errors';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

export async function createGrievance(dto: CreateGrievanceDTO, student: AuthenticatedUser): Promise<GrievanceRow> {
  const admin = getAdminClient();

  // 1. Calculate Priority, Score, and Reasons deterministically
  const priorityResult = calculatePriority({
    severity: dto.severity || 'MODERATE',
    urgency: dto.urgency || 'MEDIUM',
    affected_students: dto.affected_students || 1,
    recurrence: dto.recurrence || false,
    category: dto.category,
    title: dto.title,
    description: dto.description,
  });

  // 2. Determine SLA hours and Due Date
  const slaHours = getSlaHoursForPriority(priorityResult.priority);
  const now = new Date();
  const dueAt = calculateDueAt(now, slaHours);

  // 3. Smart routing: Resolve department ID if not explicitly specified
  let departmentId = dto.department_id || null;
  if (!departmentId) {
    const targetDeptCode = determineDepartmentCode(dto.category, dto.title, dto.description);
    const { data: deptData } = await admin
      .from('departments')
      .select('id')
      .eq('code', targetDeptCode)
      .single();
    if (deptData) {
      departmentId = deptData.id;
    }
  }

  // 4. Generate Ticket Number
  const ticketNumber = generateTicketNumber();

  // 5. Insert into Database
  const { data: grievance, error } = await admin
    .from('grievances')
    .insert({
      ticket_number: ticketNumber,
      student_id: student.id,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      subcategory: dto.subcategory || null,
      priority: priorityResult.priority,
      priority_score: priorityResult.score,
      priority_reasons: priorityResult.reasons,
      status: GRIEVANCE_STATUSES.SUBMITTED,
      department_id: departmentId,
      assigned_to: null,
      location: dto.location || null,
      affected_students: dto.affected_students || 1,
      severity: dto.severity || 'MODERATE',
      urgency: dto.urgency || 'MEDIUM',
      recurrence: dto.recurrence || false,
      is_confidential: dto.is_confidential || false,
      is_anonymous: dto.is_anonymous || false,
      sla_hours: slaHours,
      due_at: dueAt,
    } as any)
    .select('*')
    .single();

  if (error || !grievance) {
    throw new Error(`Failed to create grievance: ${error?.message || 'Unknown database error'}`);
  }

  // 6. Record Initial Audit History
  await recordStatusHistory({
    grievanceId: grievance.id,
    oldStatus: null,
    newStatus: GRIEVANCE_STATUSES.SUBMITTED,
    changedBy: student.id,
    reason: 'Grievance submitted by student',
    metadata: {
      initialPriority: priorityResult.priority,
      priorityScore: priorityResult.score,
      slaHours,
    },
  });

  // 7. Dispatch Student Confirmation Notification
  await sendNotification({
    userId: student.id,
    grievanceId: grievance.id,
    type: 'SUBMITTED',
    title: 'Grievance Registered',
    message: `Your grievance has been registered with ticket number ${ticketNumber}. SLA target: ${slaHours} hours.`,
  });

  // 8. Register Initial Autonomous Triage Agent Reasoning Trace
  await AgentOrchestrator.logExecution(
    grievance.id,
    'TRIAGE_AGENT',
    'CLASSIFY_AND_SCORE',
    `[STEP 1: INTENT DECOMPOSITION] Grievance corpus analyzed ("${dto.title}"). Key entities mapped to category '${dto.category}'.\n[STEP 2: IMPACT & SEVERITY ASSESSMENT] Impact cohort evaluated at ${dto.affected_students || 1} student(s) with urgency '${dto.urgency || 'MEDIUM'}'.\n[STEP 3: MULTI-FACTOR WEIGHTING] Priority calculated as ${priorityResult.priority} (${priorityResult.score}/100). Contributing factors: ${priorityResult.reasons.join('; ')}.\n[STEP 4: SMART ROUTING] Routed to Department ID '${departmentId || 'PENDING'}' with dynamic SLA deadline of ${slaHours} hours.`,
    0.965,
    {
      category: dto.category,
      priority: priorityResult.priority,
      priorityScore: priorityResult.score,
      slaHours,
      ticketNumber,
    }
  );

  return grievance as GrievanceRow;
}

export async function getGrievanceById(id: string, user: AuthenticatedUser): Promise<GrievanceWithDetails> {
  const admin = getAdminClient();

  // Fetch grievance with joined student, department, and assignee
  const { data: grievance, error } = await admin
    .from('grievances')
    .select(`
      *,
      student:profiles!grievances_student_id_fkey(*),
      department:departments(*),
      assignee:profiles!grievances_assigned_to_fkey(*)
    `)
    .eq('id', id)
    .single();

  if (error || !grievance) {
    throw new NotFoundError(`Grievance with ID '${id}' not found`);
  }

  const typedGrievance = grievance as unknown as GrievanceWithDetails;

  // Verify access authorization
  if (!canAccessGrievance(user, typedGrievance)) {
    throw new ForbiddenError('You do not have access to this grievance');
  }

  // Fetch comments (filtering out internal comments if caller is student)
  let commentsQuery = admin
    .from('grievance_comments')
    .select('*')
    .eq('grievance_id', id)
    .order('created_at', { ascending: true });

  if (!canViewInternalComments(user)) {
    commentsQuery = commentsQuery.eq('is_internal', false);
  }

  const { data: comments } = await commentsQuery;

  // Fetch attachments
  const { data: attachments } = await admin
    .from('grievance_attachments')
    .select('*')
    .eq('grievance_id', id)
    .order('created_at', { ascending: true });

  // Fetch status history
  const { data: history } = await admin
    .from('grievance_status_history')
    .select('*')
    .eq('grievance_id', id)
    .order('created_at', { ascending: true });

  // Calculate live SLA metrics
  const slaStatus = calculateSlaStatus(
    typedGrievance.created_at,
    typedGrievance.due_at,
    typedGrievance.resolved_at
  );

  // Fetch evidence vault & autonomous agent reasoning traces
  const [evidence, agentLogs] = await Promise.all([
    AgentOrchestrator.getEvidenceForGrievance(id),
    AgentOrchestrator.getLogsForGrievance(id),
  ]);

  return {
    ...typedGrievance,
    comments: comments || [],
    attachments: attachments || [],
    history: history || [],
    sla_status: slaStatus,
    evidence: evidence || [],
    agent_logs: agentLogs || [],
  };
}

export async function transitionGrievanceStatus(
  id: string,
  newStatus: GrievanceStatus,
  user: AuthenticatedUser,
  reason?: string,
  resolutionNotes?: string
): Promise<GrievanceRow> {
  const admin = getAdminClient();

  const { data: grievance, error } = await admin
    .from('grievances')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !grievance) {
    throw new NotFoundError(`Grievance '${id}' not found`);
  }

  const currentGrievance = grievance as GrievanceRow;

  // Validate state machine rules
  validateStatusTransition({
    currentStatus: currentGrievance.status,
    newStatus,
    userRole: user.role,
    isOwnerStudent: currentGrievance.student_id === user.id,
    reason,
    resolutionNotes,
  });

  const updatePayload: Partial<GrievanceRow> = {
    status: newStatus,
  };

  const nowIso = new Date().toISOString();

  if (newStatus === GRIEVANCE_STATUSES.RESOLUTION_PROPOSED || newStatus === GRIEVANCE_STATUSES.STUDENT_VERIFICATION) {
    updatePayload.resolved_at = nowIso;
    if (resolutionNotes) {
      updatePayload.resolution_notes = resolutionNotes;
    }
  } else if (newStatus === GRIEVANCE_STATUSES.CLOSED) {
    updatePayload.closed_at = nowIso;
  }

  const { data: updatedGrievance, error: updateError } = await admin
    .from('grievances')
    .update(updatePayload as any)
    .eq('id', id)
    .select('*')
    .single();

  if (updateError || !updatedGrievance) {
    throw new Error(`Failed to update status: ${updateError?.message}`);
  }

  // Record audit history
  await recordStatusHistory({
    grievanceId: id,
    oldStatus: currentGrievance.status,
    newStatus,
    changedBy: user.id,
    reason: reason || resolutionNotes || `Status updated to ${newStatus}`,
  });

  // Autonomous Multi-Agent verification on resolution proposal
  if (newStatus === GRIEVANCE_STATUSES.STUDENT_VERIFICATION || newStatus === GRIEVANCE_STATUSES.RESOLUTION_PROPOSED) {
    await AgentOrchestrator.runResolutionVerification({
      grievanceId: id,
      initialDescription: currentGrievance.description,
      resolutionNotes: resolutionNotes || reason || 'Corrective action executed by department officer',
    });
  }

  // Dispatch appropriate notification
  if (newStatus === GRIEVANCE_STATUSES.STUDENT_VERIFICATION || newStatus === GRIEVANCE_STATUSES.RESOLUTION_PROPOSED) {
    await sendNotification({
      userId: currentGrievance.student_id,
      grievanceId: id,
      type: 'VERIFICATION_REQUIRED',
      title: 'Resolution Submitted - Verification Required',
      message: `A resolution has been proposed for ticket ${currentGrievance.ticket_number}. Please verify if the issue is solved.`,
    });
  } else if (newStatus === GRIEVANCE_STATUSES.REOPENED) {
    if (currentGrievance.assigned_to) {
      await sendNotification({
        userId: currentGrievance.assigned_to,
        grievanceId: id,
        type: 'REOPENED',
        title: `Ticket Reopened: ${currentGrievance.ticket_number}`,
        message: `Student reopened ticket ${currentGrievance.ticket_number}. Reason: ${reason}`,
      });
    }
  } else if (newStatus === GRIEVANCE_STATUSES.CLOSED) {
    await sendNotification({
      userId: currentGrievance.student_id,
      grievanceId: id,
      type: 'CLOSED',
      title: 'Grievance Closed',
      message: `Ticket ${currentGrievance.ticket_number} is now officially closed. You may provide feedback.`,
    });
  }

  return updatedGrievance as GrievanceRow;
}
