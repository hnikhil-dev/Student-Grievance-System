/**
 * ============================================================================
 * DESIGN SYSTEM TYPES & DOMAIN STATUS MAPS
 * Student Experience - Smart Student Grievance System
 * ============================================================================
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'ai' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type InputSize = 'sm' | 'md' | 'lg';

export type BadgeSize = 'sm' | 'md' | 'lg';

// Canonical Grievance Lifecycle Statuses
export type GrievanceStatusType =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLUTION_PROPOSED'
  | 'STUDENT_VERIFICATION'
  | 'AWAITING_VERIFICATION'
  | 'RESOLVED'
  | 'REOPENED'
  | 'CLOSED'
  | 'REJECTED'
  | 'ESCALATED';

// Grievance Priority Levels
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// SLA Health Statuses
export type SlaHealthStatus = 'ON_TRACK' | 'WARNING' | 'BREACHED' | 'OVERDUE';

// Alert Variant
export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'ai';

// Toast Notification Spec
export interface ToastMessage {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  duration?: number;
}

// Timeline Stage Item
export interface TimelineItem {
  id: string;
  status: GrievanceStatusType;
  title: string;
  timestamp: string;
  description?: string;
  actorRole?: 'STUDENT' | 'OFFICER' | 'DEPARTMENT_ADMIN' | 'SYSTEM' | 'AI';
  actorName?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

// Metric Card Data
export interface MetricCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'emerald' | 'amber' | 'indigo' | 'rose' | 'neutral';
}
