import { describe, it, expect } from 'vitest';
import { calculateDueAt, calculateSlaStatus, getSlaHoursForPriority } from '@/lib/sla/engine';

describe('SLA Engine', () => {
  it('correctly maps priority to default SLA hours', () => {
    expect(getSlaHoursForPriority('CRITICAL')).toBe(4);
    expect(getSlaHoursForPriority('HIGH')).toBe(12);
    expect(getSlaHoursForPriority('MEDIUM')).toBe(24);
    expect(getSlaHoursForPriority('LOW')).toBe(48);
  });

  it('calculates due date accurately', () => {
    const base = new Date('2026-10-08T10:00:00.000Z');
    const dueIso = calculateDueAt(base, 4);
    const expected = new Date('2026-10-08T14:00:00.000Z').toISOString();
    expect(dueIso).toBe(expected);
  });

  it('detects SLA warning state when 75% or more time has elapsed', () => {
    const created = new Date('2026-10-08T00:00:00.000Z').toISOString();
    const due = new Date('2026-10-08T10:00:00.000Z').toISOString(); // 10 hour window
    const resolvedAtSimulated = new Date('2026-10-08T08:00:00.000Z').toISOString(); // 80% elapsed

    const status = calculateSlaStatus(created, due, resolvedAtSimulated);
    expect(status.elapsedPercent).toBe(80);
    expect(status.isWarning).toBe(true);
    expect(status.isOverdue).toBe(false);
  });

  it('detects SLA breach / overdue state when due date has passed', () => {
    const created = new Date('2026-10-08T00:00:00.000Z').toISOString();
    const due = new Date('2026-10-08T04:00:00.000Z').toISOString(); // 4 hours
    const resolvedAtSimulated = new Date('2026-10-08T05:30:00.000Z').toISOString(); // 5.5 hours

    const status = calculateSlaStatus(created, due, resolvedAtSimulated);
    expect(status.isOverdue).toBe(true);
    expect(status.remainingMinutes).toBeLessThan(0);
  });
});
