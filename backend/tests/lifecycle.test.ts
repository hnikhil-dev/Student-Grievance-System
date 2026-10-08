import { describe, it, expect } from 'vitest';
import { validateStatusTransition } from '@/lib/grievance/lifecycle';
import { GRIEVANCE_STATUSES } from '@/constants/statuses';
import { USER_ROLES } from '@/constants/roles';
import { ConflictError, ForbiddenError, ValidationError } from '@/lib/errors';

describe('Grievance Lifecycle & Status Transitions', () => {
  it('allows valid officer transition from ASSIGNED to IN_PROGRESS', () => {
    expect(() => {
      validateStatusTransition({
        currentStatus: GRIEVANCE_STATUSES.ASSIGNED,
        newStatus: GRIEVANCE_STATUSES.IN_PROGRESS,
        userRole: USER_ROLES.OFFICER,
        isOwnerStudent: false,
      });
    }).not.toThrow();
  });

  it('rejects illegal jump from SUBMITTED directly to CLOSED', () => {
    expect(() => {
      validateStatusTransition({
        currentStatus: GRIEVANCE_STATUSES.SUBMITTED,
        newStatus: GRIEVANCE_STATUSES.CLOSED,
        userRole: USER_ROLES.OFFICER,
        isOwnerStudent: false,
      });
    }).toThrow(ConflictError);
  });

  it('rejects illegal jump from IN_PROGRESS directly to CLOSED (must go through student verification)', () => {
    expect(() => {
      validateStatusTransition({
        currentStatus: GRIEVANCE_STATUSES.IN_PROGRESS,
        newStatus: GRIEVANCE_STATUSES.CLOSED,
        userRole: USER_ROLES.OFFICER,
        isOwnerStudent: false,
      });
    }).toThrow(ConflictError);
  });

  it('allows student to accept resolution when in STUDENT_VERIFICATION (transitions to CLOSED)', () => {
    expect(() => {
      validateStatusTransition({
        currentStatus: GRIEVANCE_STATUSES.STUDENT_VERIFICATION,
        newStatus: GRIEVANCE_STATUSES.CLOSED,
        userRole: USER_ROLES.STUDENT,
        isOwnerStudent: true,
      });
    }).not.toThrow();
  });

  it('allows student to reject resolution when in STUDENT_VERIFICATION with a reason (transitions to REOPENED)', () => {
    expect(() => {
      validateStatusTransition({
        currentStatus: GRIEVANCE_STATUSES.STUDENT_VERIFICATION,
        newStatus: GRIEVANCE_STATUSES.REOPENED,
        userRole: USER_ROLES.STUDENT,
        isOwnerStudent: true,
        reason: 'Water cooler is still leaking dirty yellow water',
      });
    }).not.toThrow();
  });

  it('rejects student reopening without a valid reason', () => {
    expect(() => {
      validateStatusTransition({
        currentStatus: GRIEVANCE_STATUSES.STUDENT_VERIFICATION,
        newStatus: GRIEVANCE_STATUSES.REOPENED,
        userRole: USER_ROLES.STUDENT,
        isOwnerStudent: true,
        reason: '',
      });
    }).toThrow(ValidationError);
  });

  it('prevents students from changing status during IN_PROGRESS', () => {
    expect(() => {
      validateStatusTransition({
        currentStatus: GRIEVANCE_STATUSES.IN_PROGRESS,
        newStatus: GRIEVANCE_STATUSES.RESOLUTION_PROPOSED,
        userRole: USER_ROLES.STUDENT,
        isOwnerStudent: true,
      });
    }).toThrow(ForbiddenError);
  });

  it('prevents non-owner student from verifying grievance', () => {
    expect(() => {
      validateStatusTransition({
        currentStatus: GRIEVANCE_STATUSES.STUDENT_VERIFICATION,
        newStatus: GRIEVANCE_STATUSES.CLOSED,
        userRole: USER_ROLES.STUDENT,
        isOwnerStudent: false,
      });
    }).toThrow(ForbiddenError);
  });
});
