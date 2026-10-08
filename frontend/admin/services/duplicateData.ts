import { PriorityLevel, GrievanceStatus } from '../types/domain';

export type DuplicateStatus = 'AWAITING_REVIEW' | 'MERGED' | 'DISMISSED';

export interface GrievanceSummary {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  department: string;
  priority: PriorityLevel;
  createdDate: string;
  studentName: string;
  studentId: string;
  status: GrievanceStatus;
}

export interface DuplicatePairItem {
  id: string;
  primaryGrievance: GrievanceSummary;
  candidateGrievance: GrievanceSummary;
  similarityScore: number; // 0 - 100
  sharedKeywords: string[];
  semanticMatchReason: string;
  department: string;
  created: string;
  status: DuplicateStatus;
  mergedAt?: string;
  reviewedBy?: string;
}

export interface DuplicateMetrics {
  potentialDuplicates: number;
  highSimilarity: number;
  awaitingReview: number;
  mergedToday: number;
}

export const MOCK_DUPLICATE_METRICS: DuplicateMetrics = {
  potentialDuplicates: 38,
  highSimilarity: 24, // >= 80%
  awaitingReview: 18,
  mergedToday: 9,
};

export const MOCK_DUPLICATE_PAIRS: DuplicatePairItem[] = [
  {
    id: 'dup-01',
    primaryGrievance: {
      id: 'g-4821',
      ticketNumber: 'GRV-2026-04821',
      subject: 'Unable to login to account with university credentials',
      description: 'Entering my student roll number on SSO login produces 504 gateway timeout on university portal.',
      category: 'Technical Issue',
      department: 'Technical',
      priority: 'HIGH',
      createdDate: 'Today at 09:14 AM',
      studentName: 'Aarav Sharma',
      studentId: 'CS-2024-042',
      status: 'IN_PROGRESS',
    },
    candidateGrievance: {
      id: 'g-4712',
      ticketNumber: 'GRV-2026-04712',
      subject: 'Portal login 504 error during credential authentication',
      description: 'University SSO gateway fails with 504 gateway timeout when verifying roll number OTP.',
      category: 'Technical Issue',
      department: 'Technical',
      priority: 'HIGH',
      createdDate: 'Today at 08:52 AM',
      studentName: 'Rohan Mehta',
      studentId: 'ME-2022-094',
      status: 'UNDER_REVIEW',
    },
    similarityScore: 94,
    sharedKeywords: ['login', '504 gateway timeout', 'credentials', 'university portal', 'roll number'],
    semanticMatchReason: '94% cosine embedding match on SSO gateway timeout symptoms in the same 30-minute window.',
    department: 'Technical',
    created: '25m ago',
    status: 'AWAITING_REVIEW',
  },
  {
    id: 'dup-02',
    primaryGrievance: {
      id: 'g-4821',
      ticketNumber: 'GRV-2026-04821',
      subject: 'Unable to login to account with university credentials',
      description: 'Entering my student roll number on SSO login produces 504 gateway timeout on university portal.',
      category: 'Technical Issue',
      department: 'Technical',
      priority: 'HIGH',
      createdDate: 'Today at 09:14 AM',
      studentName: 'Aarav Sharma',
      studentId: 'CS-2024-042',
      status: 'IN_PROGRESS',
    },
    candidateGrievance: {
      id: 'g-4582',
      ticketNumber: 'GRV-2026-04582',
      subject: 'Authentication loop on student ERP login page',
      description: 'Student ERP redirects back to empty login screen without error message.',
      category: 'Technical Issue',
      department: 'Technical',
      priority: 'MEDIUM',
      createdDate: 'Yesterday at 04:15 PM',
      studentName: 'Sneha Patil',
      studentId: 'EC-2023-118',
      status: 'ASSIGNED',
    },
    similarityScore: 89,
    sharedKeywords: ['login', 'authentication', 'student ERP', 'portal'],
    semanticMatchReason: 'Shared authentication failure intent with related identity broker tokens.',
    department: 'Technical',
    created: '1h ago',
    status: 'AWAITING_REVIEW',
  },
  {
    id: 'dup-03',
    primaryGrievance: {
      id: 'g-4821',
      ticketNumber: 'GRV-2026-04821',
      subject: 'Unable to login to account with university credentials',
      description: 'Entering my student roll number on SSO login produces 504 gateway timeout on university portal.',
      category: 'Technical Issue',
      department: 'Technical',
      priority: 'HIGH',
      createdDate: 'Today at 09:14 AM',
      studentName: 'Aarav Sharma',
      studentId: 'CS-2024-042',
      status: 'IN_PROGRESS',
    },
    candidateGrievance: {
      id: 'g-4411',
      ticketNumber: 'GRV-2026-04411',
      subject: 'WiFi captive portal certificate error on laptop',
      description: 'Campus WiFi captive portal says SSL certificate invalid when connecting.',
      category: 'Technical Issue',
      department: 'Technical',
      priority: 'LOW',
      createdDate: 'Yesterday at 11:30 AM',
      studentName: 'Kunal Verma',
      studentId: 'EE-2024-075',
      status: 'CLOSED',
    },
    similarityScore: 82,
    sharedKeywords: ['portal', 'error', 'credentials'],
    semanticMatchReason: 'Network access credentials domain match.',
    department: 'Technical',
    created: '2h ago',
    status: 'AWAITING_REVIEW',
  },
  {
    id: 'dup-04',
    primaryGrievance: {
      id: 'g-3012',
      ticketNumber: 'GRV-2026-03012',
      subject: 'Hostel Block D 3rd floor water cooler muddy water',
      description: 'The drinking water dispenser on 3rd floor Block D is dispensing discolored yellowish brown sediment water.',
      category: 'Hostel Facilities',
      department: 'Hostel',
      priority: 'CRITICAL',
      createdDate: 'Today at 07:45 AM',
      studentName: 'Pooja Hegde',
      studentId: 'BT-2023-019',
      status: 'IN_PROGRESS',
    },
    candidateGrievance: {
      id: 'g-3008',
      ticketNumber: 'GRV-2026-03008',
      subject: 'Rust particles and turbidity in Block D water cooler',
      description: 'Heavy rust sediment from corridor cooler in Block D residential wing. Unfit for consumption.',
      category: 'Hostel Facilities',
      department: 'Hostel',
      priority: 'CRITICAL',
      createdDate: 'Today at 07:20 AM',
      studentName: 'Nitin Rao',
      studentId: 'CV-2024-061',
      status: 'SUBMITTED',
    },
    similarityScore: 96,
    sharedKeywords: ['Block D', 'water cooler', 'sediment', 'turbidity', 'rust'],
    semanticMatchReason: 'Identical physical dispenser asset and identical hazardous contamination report.',
    department: 'Hostel',
    created: '3h ago',
    status: 'MERGED',
    mergedAt: 'Today at 08:30 AM',
    reviewedBy: 'Admin Officer',
  },
];
