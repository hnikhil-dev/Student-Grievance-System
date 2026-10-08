import { UserRole } from '../constants/roles';
import { GrievanceStatus } from '../constants/statuses';
import { GrievancePriority, SeverityLevel, UrgencyLevel } from '../constants/priorities';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface DepartmentRow {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department_id: string | null;
  student_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GrievanceRow {
  id: string;
  ticket_number: string;
  student_id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  priority: GrievancePriority;
  priority_score: number;
  priority_reasons: string[];
  status: GrievanceStatus;
  department_id: string | null;
  assigned_to: string | null;
  location: string | null;
  affected_students: number;
  severity: SeverityLevel;
  urgency: UrgencyLevel;
  recurrence: boolean;
  is_confidential: boolean;
  is_anonymous: boolean;
  ai_summary: string | null;
  ai_confidence: number | null;
  sla_hours: number;
  due_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  resolution_notes: string | null;
  cluster_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GrievanceAssignmentRow {
  id: string;
  grievance_id: string;
  department_id: string;
  officer_id: string | null;
  assigned_by: string;
  assigned_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  notes: string | null;
}

export interface GrievanceCommentRow {
  id: string;
  grievance_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface GrievanceAttachmentRow {
  id: string;
  grievance_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface GrievanceStatusHistoryRow {
  id: string;
  grievance_id: string;
  old_status: GrievanceStatus | null;
  new_status: GrievanceStatus;
  changed_by: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SlaRuleRow {
  id: string;
  priority: GrievancePriority;
  default_hours: number;
  warning_threshold_percent: number;
  escalation_role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GrievanceEscalationRow {
  id: string;
  grievance_id: string;
  level: number;
  escalated_from: string | null;
  escalated_to: string | null;
  escalated_to_role: UserRole;
  reason: string;
  sla_breached: boolean;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  grievance_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GrievanceFeedbackRow {
  id: string;
  grievance_id: string;
  student_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface GrievanceClusterRow {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  department_id: string | null;
  priority: GrievancePriority;
  affected_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: DepartmentRow;
        Insert: Partial<DepartmentRow> & { name: string; code: string };
        Update: Partial<DepartmentRow>;
      };
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { full_name: string; email: string };
        Update: Partial<ProfileRow>;
      };
      grievances: {
        Row: GrievanceRow;
        Insert: Partial<GrievanceRow> & {
          title: string;
          description: string;
          category: string;
          student_id: string;
          due_at: string;
        };
        Update: Partial<GrievanceRow>;
      };
      grievance_assignments: {
        Row: GrievanceAssignmentRow;
        Insert: Partial<GrievanceAssignmentRow> & {
          grievance_id: string;
          department_id: string;
          assigned_by: string;
        };
        Update: Partial<GrievanceAssignmentRow>;
      };
      grievance_comments: {
        Row: GrievanceCommentRow;
        Insert: Partial<GrievanceCommentRow> & {
          grievance_id: string;
          user_id: string;
          message: string;
        };
        Update: Partial<GrievanceCommentRow>;
      };
      grievance_attachments: {
        Row: GrievanceAttachmentRow;
        Insert: Partial<GrievanceAttachmentRow> & {
          grievance_id: string;
          uploaded_by: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
        };
        Update: Partial<GrievanceAttachmentRow>;
      };
      grievance_status_history: {
        Row: GrievanceStatusHistoryRow;
        Insert: Partial<GrievanceStatusHistoryRow> & {
          grievance_id: string;
          new_status: GrievanceStatus;
        };
        Update: Partial<GrievanceStatusHistoryRow>;
      };
      sla_rules: {
        Row: SlaRuleRow;
        Insert: Partial<SlaRuleRow> & {
          priority: GrievancePriority;
          default_hours: number;
        };
        Update: Partial<SlaRuleRow>;
      };
      grievance_escalations: {
        Row: GrievanceEscalationRow;
        Insert: Partial<GrievanceEscalationRow> & {
          grievance_id: string;
          reason: string;
        };
        Update: Partial<GrievanceEscalationRow>;
      };
      notifications: {
        Row: NotificationRow;
        Insert: Partial<NotificationRow> & {
          user_id: string;
          type: string;
          title: string;
          message: string;
        };
        Update: Partial<NotificationRow>;
      };
      grievance_feedback: {
        Row: GrievanceFeedbackRow;
        Insert: Partial<GrievanceFeedbackRow> & {
          grievance_id: string;
          student_id: string;
          rating: number;
        };
        Update: Partial<GrievanceFeedbackRow>;
      };
      grievance_clusters: {
        Row: GrievanceClusterRow;
        Insert: Partial<GrievanceClusterRow> & {
          title: string;
          category: string;
        };
        Update: Partial<GrievanceClusterRow>;
      };
    };
  };
}
