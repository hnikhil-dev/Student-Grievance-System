import { GrievancePriority, SeverityLevel, UrgencyLevel } from '../constants/priorities';
import { GrievanceStatus } from '../constants/statuses';
import { GrievanceRow, ProfileRow, DepartmentRow, GrievanceCommentRow, GrievanceAttachmentRow, GrievanceStatusHistoryRow } from './database';

export interface PriorityCalculationResult {
  priority: GrievancePriority;
  score: number;
  reasons: string[];
}

export interface SlaStatusResult {
  slaHours: number;
  dueAt: string;
  isOverdue: boolean;
  isWarning: boolean;
  remainingMinutes: number;
  elapsedPercent: number;
}

export interface GrievanceWithDetails extends GrievanceRow {
  student?: ProfileRow;
  department?: DepartmentRow;
  assignee?: ProfileRow;
  comments?: GrievanceCommentRow[];
  attachments?: GrievanceAttachmentRow[];
  history?: GrievanceStatusHistoryRow[];
  sla_status?: SlaStatusResult;
}

export interface CreateGrievanceDTO {
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  location?: string | null;
  affected_students?: number;
  severity?: SeverityLevel;
  urgency?: UrgencyLevel;
  recurrence?: boolean;
  is_confidential?: boolean;
  is_anonymous?: boolean;
  department_id?: string | null;
}

export interface AiAnalysisOutput {
  category: string;
  subcategory?: string;
  severity: SeverityLevel;
  urgency: UrgencyLevel;
  priority: GrievancePriority;
  priorityScore: number;
  priorityReasons: string[];
  department?: string;
  summary: string;
  confidence: number;
}
