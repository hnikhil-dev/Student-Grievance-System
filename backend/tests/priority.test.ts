import { describe, it, expect } from 'vitest';
import { calculatePriority } from '@/lib/priority/engine';

describe('Priority Engine', () => {
  it('calculates CRITICAL priority for high severity, immediate urgency, and large student cohort', () => {
    const result = calculatePriority({
      severity: 'CRITICAL',
      urgency: 'IMMEDIATE',
      affected_students: 120,
      recurrence: true,
      category: 'HOSTEL',
      title: 'Water contamination crisis in Hostel Block D',
      description: 'Yellow water leaking and multiple students sick',
    });

    expect(result.priority).toBe('CRITICAL');
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.reasons).toContain('Critical severity impact reported');
    expect(result.reasons).toContain('Immediate urgency requiring emergency response');
    expect(result.reasons).toContain('Massive campus impact: 120+ students affected');
    expect(result.reasons).toContain('Repeated / recurring issue indicating systemic failure');
  });

  it('calculates LOW priority for low severity, low urgency, single student query', () => {
    const result = calculatePriority({
      severity: 'LOW',
      urgency: 'LOW',
      affected_students: 1,
      recurrence: false,
      category: 'GENERAL',
      title: 'Lost blue pen in study area',
      description: 'Misplaced a blue ballpoint pen on desk 12',
    });

    expect(result.priority).toBe('LOW');
    expect(result.score).toBeLessThan(35);
    expect(result.reasons).toContain('Low severity minor inconvenience');
    expect(result.reasons).toContain('Single individual grievance');
  });

  it('boosts score and flags keyword when critical safety term is detected', () => {
    const withoutKeyword = calculatePriority({
      severity: 'MODERATE',
      urgency: 'MEDIUM',
      affected_students: 1,
      category: 'MAINTENANCE',
      title: 'Maintenance request for room 101',
      description: 'Please inspect the room',
    });

    const withKeyword = calculatePriority({
      severity: 'MODERATE',
      urgency: 'MEDIUM',
      affected_students: 1,
      category: 'MAINTENANCE',
      title: 'Electrical spark in room 101',
      description: 'The wall switch emitted spark',
    });

    expect(withKeyword.score).toBeGreaterThan(withoutKeyword.score);
    expect(withKeyword.reasons.some((r) => r.includes('spark'))).toBe(true);
  });
});
