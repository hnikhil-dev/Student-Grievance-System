import { z } from 'zod';
import { GRIEVANCE_STATUSES } from '@/constants/statuses';
import { GRIEVANCE_PRIORITIES, SEVERITY_LEVELS, URGENCY_LEVELS } from '@/constants/priorities';

export const createGrievanceSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters long' })
    .max(200, { message: 'Title must not exceed 200 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters long' })
    .max(4000, { message: 'Description must not exceed 4000 characters' }),
  category: z.string().min(2, { message: 'Category is required' }),
  subcategory: z.string().optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  affected_students: z.coerce.number().int().min(1).default(1),
  severity: z.nativeEnum(SEVERITY_LEVELS).default('MODERATE'),
  urgency: z.nativeEnum(URGENCY_LEVELS).default('MEDIUM'),
  recurrence: z.boolean().default(false),
  is_confidential: z.boolean().default(false),
  is_anonymous: z.boolean().default(false),
  department_id: z.string().uuid().optional().nullable(),
});

export type CreateGrievanceInput = z.infer<typeof createGrievanceSchema>;

export const updateGrievanceSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(4000).optional(),
  category: z.string().min(2).optional(),
  subcategory: z.string().optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  priority: z.nativeEnum(GRIEVANCE_PRIORITIES).optional(),
  status: z.nativeEnum(GRIEVANCE_STATUSES).optional(),
  resolution_notes: z.string().max(3000).optional().nullable(),
  reason: z.string().max(1000).optional(),
});

export type UpdateGrievanceInput = z.infer<typeof updateGrievanceSchema>;

export const resolveGrievanceSchema = z.object({
  resolution_notes: z
    .string()
    .min(10, { message: 'Detailed resolution notes are required to propose resolution' })
    .max(3000),
});

export type ResolveGrievanceInput = z.infer<typeof resolveGrievanceSchema>;

export const verifyResolutionSchema = z.object({
  accepted: z.boolean(),
  reason: z.string().max(1000).optional(),
}).refine(
  (data) => data.accepted || (data.reason && data.reason.trim().length >= 5),
  {
    message: 'A clear reason is required if rejecting resolution and reopening grievance',
    path: ['reason'],
  }
);

export type VerifyResolutionInput = z.infer<typeof verifyResolutionSchema>;

export const reopenGrievanceSchema = z.object({
  reason: z
    .string()
    .min(5, { message: 'Please provide a reason of at least 5 characters for reopening' })
    .max(1000),
});

export type ReopenGrievanceInput = z.infer<typeof reopenGrievanceSchema>;

export const escalateGrievanceSchema = z.object({
  reason: z
    .string()
    .min(5, { message: 'Reason for escalation is required' })
    .max(1000),
  escalated_to: z.string().uuid().optional().nullable(),
});

export type EscalateGrievanceInput = z.infer<typeof escalateGrievanceSchema>;
