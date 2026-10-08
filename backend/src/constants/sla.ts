import { GrievancePriority } from './priorities';

export const DEFAULT_SLA_HOURS: Record<GrievancePriority, number> = {
  CRITICAL: 4,
  HIGH: 12,
  MEDIUM: 24,
  LOW: 48,
};

export const SLA_WARNING_PERCENT = 75; // 75% time elapsed triggers SLA warning
