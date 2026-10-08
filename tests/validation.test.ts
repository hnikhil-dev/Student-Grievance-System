import { describe, it, expect } from 'vitest';
import { createGrievanceSchema, verifyResolutionSchema } from '@/lib/validation/grievance';
import { createFeedbackSchema } from '@/lib/validation/feedback';
import { aiAnalysisSchema } from '@/lib/validation/ai';

describe('Zod Validation Contracts', () => {
  it('validates valid grievance submission input', () => {
    const input = {
      title: 'Water filter broken in Block C',
      description: 'The filter is leaking dirty water on the floor for 2 days.',
      category: 'HOSTEL',
      affected_students: 15,
      severity: 'HIGH',
      urgency: 'HIGH',
      recurrence: true,
    };

    const parsed = createGrievanceSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it('rejects grievance with short title or description', () => {
    const invalid = {
      title: 'Bad',
      description: 'Short',
      category: 'HOSTEL',
    };

    const parsed = createGrievanceSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('rejects feedback with rating outside 1 to 5', () => {
    expect(createFeedbackSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(createFeedbackSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(createFeedbackSchema.safeParse({ rating: 5, comment: 'Great service' }).success).toBe(true);
  });

  it('requires reason when resolution is not accepted during verification', () => {
    const acceptedNoReason = { accepted: true };
    expect(verifyResolutionSchema.safeParse(acceptedNoReason).success).toBe(true);

    const rejectedNoReason = { accepted: false };
    expect(verifyResolutionSchema.safeParse(rejectedNoReason).success).toBe(false);

    const rejectedWithReason = { accepted: false, reason: 'Issue still persists on location' };
    expect(verifyResolutionSchema.safeParse(rejectedWithReason).success).toBe(true);
  });

  it('validates structured AI output schema', () => {
    const aiOutput = {
      category: 'IT',
      subcategory: 'Network',
      severity: 'CRITICAL',
      urgency: 'IMMEDIATE',
      priority: 'CRITICAL',
      priorityScore: 92,
      priorityReasons: ['Massive impact', 'Switch failure'],
      department: 'IT',
      summary: 'Computer Lab 3 network failure',
      confidence: 0.94,
    };

    const parsed = aiAnalysisSchema.safeParse(aiOutput);
    expect(parsed.success).toBe(true);
  });
});
