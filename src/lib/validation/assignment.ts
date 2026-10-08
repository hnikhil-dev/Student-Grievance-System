import { z } from 'zod';

export const assignGrievanceSchema = z.object({
  department_id: z.string().uuid({ message: 'Valid department UUID is required' }),
  officer_id: z.string().uuid({ message: 'Valid officer UUID is required' }).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type AssignGrievanceInput = z.infer<typeof assignGrievanceSchema>;
