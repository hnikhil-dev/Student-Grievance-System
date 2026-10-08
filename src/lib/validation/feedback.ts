import { z } from 'zod';

export const createFeedbackSchema = z.object({
  rating: z
    .coerce
    .number()
    .int()
    .min(1, { message: 'Rating must be at least 1 star' })
    .max(5, { message: 'Rating cannot exceed 5 stars' }),
  comment: z
    .string()
    .max(1000, { message: 'Comment must not exceed 1000 characters' })
    .optional()
    .nullable(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
