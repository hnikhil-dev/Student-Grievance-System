import { GRIEVANCE_PRIORITIES, GrievancePriority, SeverityLevel, UrgencyLevel } from '@/constants/priorities';
import { PriorityCalculationResult } from '@/types/grievance';

export interface PriorityCalculationInput {
  severity: SeverityLevel;
  urgency: UrgencyLevel;
  affected_students: number;
  recurrence?: boolean;
  category?: string;
  title?: string;
  description?: string;
}

const CRITICAL_KEYWORDS = [
  'fire',
  'spark',
  'shock',
  'water',
  'contamination',
  'leak',
  'medical',
  'hospital',
  'health',
  'safety',
  'harassment',
  'ragging',
  'exam',
  'midterm',
  'hall ticket',
  'outage',
];

/**
 * Deterministic and explainable priority scoring engine.
 * Calculates score (0-100), maps to Priority band, and produces justification reasons.
 */
export function calculatePriority(input: PriorityCalculationInput): PriorityCalculationResult {
  const { severity, urgency, affected_students, recurrence = false, category = '', title = '', description = '' } = input;

  let score = 0;
  const reasons: string[] = [];

  // 1. Severity Contribution (Max 40)
  switch (severity) {
    case 'CRITICAL':
      score += 40;
      reasons.push('Critical severity impact reported');
      break;
    case 'HIGH':
      score += 25;
      reasons.push('High severity operational impairment');
      break;
    case 'MODERATE':
      score += 15;
      reasons.push('Moderate severity grievance');
      break;
    case 'LOW':
    default:
      score += 5;
      reasons.push('Low severity minor inconvenience');
      break;
  }

  // 2. Urgency Contribution (Max 30)
  switch (urgency) {
    case 'IMMEDIATE':
      score += 30;
      reasons.push('Immediate urgency requiring emergency response');
      break;
    case 'HIGH':
      score += 20;
      reasons.push('High urgency with time-sensitive academic or residential deadline');
      break;
    case 'MEDIUM':
      score += 10;
      reasons.push('Standard operational urgency');
      break;
    case 'LOW':
    default:
      score += 0;
      break;
  }

  // 3. Scale of Impact - Affected Students (Max 20)
  if (affected_students >= 100) {
    score += 20;
    reasons.push(`Massive campus impact: ${affected_students}+ students affected`);
  } else if (affected_students >= 50) {
    score += 15;
    reasons.push(`Widespread cohort impact: ${affected_students} students affected`);
  } else if (affected_students >= 10) {
    score += 10;
    reasons.push(`Group impact: ${affected_students} students affected`);
  } else if (affected_students >= 2) {
    score += 5;
    reasons.push(`Multiple students affected (${affected_students})`);
  } else {
    reasons.push('Single individual grievance');
  }

  // 4. Recurrence / History (Max 10)
  if (recurrence) {
    score += 10;
    reasons.push('Repeated / recurring issue indicating systemic failure');
  }

  // 5. Keyword & Critical Domain Safety Multiplier (Max 10)
  const combinedText = `${category} ${title} ${description}`.toLowerCase();
  const matchedKeyword = CRITICAL_KEYWORDS.find((k) => combinedText.includes(k));
  if (matchedKeyword) {
    score += 10;
    reasons.push(`Critical safety or academic keyword detected: '${matchedKeyword}'`);
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine Priority Band
  let priority: GrievancePriority;
  if (finalScore >= 80) {
    priority = GRIEVANCE_PRIORITIES.CRITICAL;
  } else if (finalScore >= 60) {
    priority = GRIEVANCE_PRIORITIES.HIGH;
  } else if (finalScore >= 35) {
    priority = GRIEVANCE_PRIORITIES.MEDIUM;
  } else {
    priority = GRIEVANCE_PRIORITIES.LOW;
  }

  return {
    priority,
    score: finalScore,
    reasons,
  };
}
