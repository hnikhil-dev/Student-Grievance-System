import { DEFAULT_SLA_HOURS, SLA_WARNING_PERCENT } from '@/constants/sla';
import { GrievancePriority } from '@/constants/priorities';
import { SlaStatusResult } from '@/types/grievance';

/**
 * Calculates SLA hours allocated for a given priority.
 */
export function getSlaHoursForPriority(priority: GrievancePriority, customRules?: Record<GrievancePriority, number>): number {
  if (customRules && customRules[priority]) {
    return customRules[priority];
  }
  return DEFAULT_SLA_HOURS[priority] || 24;
}

/**
 * Calculates due date given creation timestamp and SLA hours.
 * Uses ISO strings for reliable timezone handling.
 */
export function calculateDueAt(fromTime: Date | string, slaHours: number): string {
  const baseDate = typeof fromTime === 'string' ? new Date(fromTime) : fromTime;
  const dueDate = new Date(baseDate.getTime() + slaHours * 60 * 60 * 1000);
  return dueDate.toISOString();
}

/**
 * Evaluates SLA tracking state (remaining minutes, percentage consumed, warning, breach).
 * Server-side time is strictly used for now.
 */
export function calculateSlaStatus(
  createdAtStr: string,
  dueAtStr: string,
  resolvedAtStr?: string | null,
  warningPercent = SLA_WARNING_PERCENT
): SlaStatusResult {
  const createdAt = new Date(createdAtStr).getTime();
  const dueAt = new Date(dueAtStr).getTime();
  const totalWindowMs = Math.max(1, dueAt - createdAt);
  const slaHours = Math.round(totalWindowMs / (1000 * 60 * 60));

  const compareTime = resolvedAtStr ? new Date(resolvedAtStr).getTime() : Date.now();
  const elapsedMs = compareTime - createdAt;
  const remainingMs = dueAt - compareTime;

  const remainingMinutes = Math.round(remainingMs / (1000 * 60));
  const elapsedPercent = Math.min(999, Math.round((elapsedMs / totalWindowMs) * 100));

  const isOverdue = remainingMs < 0;
  const isWarning = !isOverdue && elapsedPercent >= warningPercent;

  return {
    slaHours,
    dueAt: dueAtStr,
    isOverdue,
    isWarning,
    remainingMinutes,
    elapsedPercent,
  };
}
