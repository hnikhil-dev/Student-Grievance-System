import { ALLOWED_STATUS_TRANSITIONS, GRIEVANCE_STATUSES, GrievanceStatus } from '@/constants/statuses';
import { USER_ROLES, UserRole } from '@/constants/roles';
import { ConflictError, ForbiddenError, ValidationError } from '@/lib/errors';

export interface StatusTransitionRequest {
  currentStatus: GrievanceStatus;
  newStatus: GrievanceStatus;
  userRole: UserRole;
  isOwnerStudent: boolean;
  reason?: string;
  resolutionNotes?: string;
}

export interface TransitionValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates whether a requested grievance status transition is permissible
 * according to institutional workflow and caller role.
 */
export function validateStatusTransition(req: StatusTransitionRequest): void {
  const { currentStatus, newStatus, userRole, isOwnerStudent, reason, resolutionNotes } = req;

  // 1. Check if same status
  if (currentStatus === newStatus) {
    throw new ValidationError(`Grievance is already in status '${currentStatus}'`);
  }

  // 2. Check workflow transition graph
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!allowedNext || !allowedNext.includes(newStatus)) {
    throw new ConflictError(
      `Invalid transition: '${currentStatus}' cannot transition directly to '${newStatus}'. Allowed: [${(allowedNext || []).join(', ')}]`
    );
  }

  // 3. Prevent direct closure without student verification / resolution proposal
  if (newStatus === GRIEVANCE_STATUSES.CLOSED) {
    if (currentStatus !== GRIEVANCE_STATUSES.STUDENT_VERIFICATION && currentStatus !== GRIEVANCE_STATUSES.RESOLUTION_PROPOSED) {
      throw new ConflictError(
        `Direct closure from '${currentStatus}' is not permitted. A resolution must first be proposed and verified by the student.`
      );
    }
  }

  // 4. Role-based constraints:
  if (userRole === USER_ROLES.STUDENT) {
    if (!isOwnerStudent) {
      throw new ForbiddenError('Students can only update their own grievances');
    }
    // Students can only accept (to CLOSED) or reject (to REOPENED) during verification
    if (
      (currentStatus === GRIEVANCE_STATUSES.STUDENT_VERIFICATION || currentStatus === GRIEVANCE_STATUSES.RESOLUTION_PROPOSED) &&
      (newStatus === GRIEVANCE_STATUSES.CLOSED || newStatus === GRIEVANCE_STATUSES.REOPENED)
    ) {
      // Allowed student actions
    } else {
      throw new ForbiddenError(
        `Students are only permitted to accept (verify) or reopen grievances awaiting verification. Attempted: '${currentStatus}' -> '${newStatus}'`
      );
    }
  }

  // 5. Resolution notes requirement when proposing resolution
  if (newStatus === GRIEVANCE_STATUSES.RESOLUTION_PROPOSED || newStatus === GRIEVANCE_STATUSES.STUDENT_VERIFICATION) {
    if (resolutionNotes !== undefined && resolutionNotes.trim().length < 5) {
      throw new ValidationError('Resolution notes are required when proposing a resolution (minimum 5 characters)');
    }
  }

  // 6. Mandatory reason when reopening
  if (newStatus === GRIEVANCE_STATUSES.REOPENED) {
    if (!reason || reason.trim().length < 5) {
      throw new ValidationError('A detailed reason is required to reopen a grievance (minimum 5 characters)');
    }
  }

  // 7. Mandatory reason when rejecting
  if (newStatus === GRIEVANCE_STATUSES.REJECTED) {
    if (!reason || reason.trim().length < 5) {
      throw new ValidationError('A formal rejection reason is required (minimum 5 characters)');
    }
  }
}
