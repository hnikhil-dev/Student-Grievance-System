import { z } from 'zod';
import { GRIEVANCE_PRIORITIES, SEVERITY_LEVELS, URGENCY_LEVELS } from '@/constants/priorities';

export const aiAnalysisSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional().nullable(),
  severity: z.nativeEnum(SEVERITY_LEVELS),
  urgency: z.nativeEnum(URGENCY_LEVELS),
  priority: z.nativeEnum(GRIEVANCE_PRIORITIES),
  priorityScore: z.number().min(0).max(100),
  priorityReasons: z.array(z.string()).min(1, 'At least one priority reason is required'),
  department: z.string().optional().nullable(),
  summary: z.string().min(5, 'Summary is required'),
  confidence: z.number().min(0).max(1),
});

export type AiAnalysisData = z.infer<typeof aiAnalysisSchema>;

export const aiAnalyzeRequestSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  category: z.string().optional(),
  location: z.string().optional(),
  affected_students: z.number().int().min(1).optional(),
});

export type AiAnalyzeRequest = z.infer<typeof aiAnalyzeRequestSchema>;
