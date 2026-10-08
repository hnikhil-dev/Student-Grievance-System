import { GrievancePriority, SeverityLevel, UrgencyLevel } from '@/constants/priorities';
import { GrievanceStatus } from '@/constants/statuses';

export type Priority = GrievancePriority;
export type Severity = SeverityLevel;
export type Urgency = UrgencyLevel;

export type AgentName =
  | 'TRIAGE_AGENT'
  | 'EVIDENCE_AGENT'
  | 'SLA_SENTINEL'
  | 'RESOLUTION_VERIFIER';

export type EvidenceType = 'PHOTO' | 'RECEIPT' | 'DOCUMENT' | 'SCREENSHOT';

export type AuthenticityStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'SUSPICIOUS'
  | 'INCONCLUSIVE';

export type ResolutionVerdict =
  | 'VERIFIED_RESOLVED'
  | 'DEFICIENT_RESOLUTION'
  | 'FURTHER_EVIDENCE_REQUIRED';

export interface AgentExecutionLog {
  id: string;
  grievance_id: string;
  agent_name: AgentName;
  action_taken: string;
  thought_process: string;
  confidence: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface GrievanceEvidence {
  id: string;
  grievance_id: string;
  uploaded_by: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  sha256_hash: string;
  evidence_type: EvidenceType;
  is_resolution_proof: boolean;
  ai_analyzed: boolean;
  ai_description: string | null;
  relevance_score: number | null;
  authenticity_status: AuthenticityStatus;
  agent_confidence: number | null;
  verification_notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AgentResult<T = any> {
  success: boolean;
  agentName: AgentName;
  actionTaken: string;
  thoughtProcess: string;
  confidence: number;
  data: T;
  error?: string;
}

// 1. Triage Agent Types
export interface TriageInput {
  grievanceId: string;
  title: string;
  description: string;
  category?: string;
  severity?: Severity;
  urgency?: Urgency;
  affectedStudents?: number;
  recurrence?: boolean;
  location?: string;
}

export interface TriageOutput {
  suggestedCategory: string;
  suggestedDepartmentCode: string;
  suggestedDepartmentId?: string;
  priority: Priority;
  priorityScore: number;
  priorityReasons: string[];
  slaHours: number;
  summary: string;
  urgencyLevel: string;
}

// 2. Evidence Agent Types
export interface EvidenceInput {
  grievanceId: string;
  uploadedBy: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileBuffer?: Buffer;
  filePath: string;
  evidenceType?: EvidenceType;
  isResolutionProof?: boolean;
  grievanceTitle: string;
  grievanceDescription: string;
  grievanceCategory?: string;
}

export interface EvidenceOutput {
  sha256Hash: string;
  authenticityStatus: AuthenticityStatus;
  relevanceScore: number; // 0 - 100
  confidence: number; // 0.0 - 1.0
  aiDescription: string;
  verificationNotes: string;
  metadata: {
    visualChecks: {
      integrityValid: boolean;
      fileExtensionValid: boolean;
      sizeWithinBounds: boolean;
      contextualMatch: boolean;
    };
    detectedKeywords: string[];
  };
}

// 3. SLA Sentinel Agent Types
export interface SlaSentinelInput {
  grievanceId: string;
  ticketNumber: string;
  status: GrievanceStatus;
  priority: Priority;
  slaHours: number;
  dueAt: string;
  createdAt: string;
  departmentId?: string;
  assignedTo?: string | null;
}

export interface SlaSentinelOutput {
  elapsedHours: number;
  remainingHours: number;
  percentageConsumed: number;
  isOverdue: boolean;
  isWarning: boolean;
  recommendedAction: 'NO_ACTION' | 'WARN_OFFICER' | 'AUTO_ESCALATE';
  sentinelMemo: string;
  escalatedNow: boolean;
}

// 4. Resolution Verifier Agent Types
export interface ResolutionVerifierInput {
  grievanceId: string;
  initialDescription: string;
  resolutionNotes: string;
  officerEvidence?: Array<{
    fileName: string;
    fileType: string;
    description?: string;
    sha256?: string;
  }>;
  initialEvidence?: Array<{
    fileName: string;
    fileType: string;
    description?: string;
  }>;
}

export interface ResolutionVerifierOutput {
  verdict: ResolutionVerdict;
  confidence: number; // 0.0 - 1.0
  isApproved: boolean;
  counterEvidenceVerified: boolean;
  comparisonAnalysis: string;
  verificationNotes: string;
  checklist: {
    issueAddressed: boolean;
    proofProvided: boolean;
    satisfactoryQuality: boolean;
  };
}
