import { AuthenticatedUser } from '@/types/auth';
import { GrievanceRow } from '@/types/database';
import { USER_ROLES, UserRole, STAFF_ROLES, ADMIN_ROLES } from '@/constants/roles';

export function isSuperAdmin(user: AuthenticatedUser): boolean {
  return user.role === USER_ROLES.SUPER_ADMIN;
}

export function isDepartmentAdmin(user: AuthenticatedUser, departmentId?: string | null): boolean {
  if (user.role === USER_ROLES.SUPER_ADMIN) return true;
  if (user.role === USER_ROLES.DEPARTMENT_ADMIN) {
    if (!departmentId) return true;
    return user.profile.department_id === departmentId;
  }
  return false;
}

export function isStaff(user: AuthenticatedUser): boolean {
  return STAFF_ROLES.includes(user.role);
}

export function canAccessGrievance(user: AuthenticatedUser, grievance: GrievanceRow): boolean {
  if (user.role === USER_ROLES.SUPER_ADMIN) return true;
  if (user.role === USER_ROLES.DEPARTMENT_ADMIN) {
    return user.profile.department_id === grievance.department_id;
  }
  if (user.role === USER_ROLES.OFFICER) {
    return (
      grievance.assigned_to === user.id ||
      user.profile.department_id === grievance.department_id
    );
  }
  // Student can only access their own
  return grievance.student_id === user.id;
}

export function canViewInternalComments(user: AuthenticatedUser): boolean {
  return isStaff(user);
}

export function canAssignGrievance(user: AuthenticatedUser): boolean {
  return ADMIN_ROLES.includes(user.role);
}

export function canEscalateGrievance(user: AuthenticatedUser): boolean {
  return isStaff(user);
}
