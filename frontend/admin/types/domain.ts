/**
 * Typed domain interfaces for Student Management Grievance System.
 * Prepares the Admin Foundation for seamless future API integration.
 */

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type GrievanceStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ESCALATED'
  | 'RESOLUTION_PROPOSED'
  | 'STUDENT_VERIFICATION'
  | 'CLOSED'
  | 'REOPENED';

export type SlaHealth = 'HEALTHY' | 'AT_RISK' | 'BREACHED';

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  departmentId?: string;
  departmentName?: string;
  status: GrievanceStatus;
  priority: PriorityLevel;
  priorityScore: number;
  createdAt: string;
  dueAt: string;
  resolvedAt?: string;
  student: {
    id: string;
    fullName: string;
    email: string;
    studentId?: string;
  };
  assignedTo?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headName?: string;
  activeTickets: number;
  resolvedTickets: number;
  slaComplianceRate: number;
}

export interface Classification {
  ticketId: string;
  predictedCategory: string;
  confidence: number;
  reasons: string[];
  suggestedDepartment: string;
}

export interface PriorityEvaluation {
  ticketId: string;
  score: number;
  level: PriorityLevel;
  factors: {
    severity: string;
    urgency: string;
    cohortImpact: number;
  };
}

export interface DuplicateCandidate {
  primaryTicketId: string;
  candidateTicketId: string;
  similarityScore: number;
  sharedKeywords: string[];
}

export interface Cluster {
  id: string;
  name: string;
  category: string;
  ticketCount: number;
  rootCauseSummary: string;
  firstReportedAt: string;
}

export interface SlaMonitor {
  ticketId: string;
  health: SlaHealth;
  elapsedPercent: number;
  remainingMinutes: number;
  isBreached: boolean;
}

export interface EscalationRecord {
  id: string;
  ticketId: string;
  level: number;
  escalatedToRole: string;
  reason: string;
  escalatedAt: string;
}

export interface InsightItem {
  id: string;
  type: 'TREND' | 'ANOMALY' | 'BOTTLENECK' | 'RECOMMENDATION';
  title: string;
  description: string;
  impactScore: number;
  recommendedAction: string;
}
