import { z } from 'zod';

export const createCommentSchema = z.object({
  message: z
    .string()
    .min(1, { message: 'Comment message cannot be empty' })
    .max(2000, { message: 'Comment message must not exceed 2000 characters' }),
  is_internal: z.boolean().default(false),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
