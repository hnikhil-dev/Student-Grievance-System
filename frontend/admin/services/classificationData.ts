import { PriorityLevel, GrievanceStatus } from '../types/domain';

export type SentimentType = 'Positive' | 'Neutral' | 'Negative';
export type ClassificationStatus = 'PENDING_REVIEW' | 'ACCEPTED' | 'MODIFIED' | 'FLAGGED';

export interface ClassificationExplanation {
  factor: string;
  evidence: string;
  weightPercent: number;
}

export interface ClassifiedGrievanceItem {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  studentName: string;
  studentId: string;
  category: string;
  categoryConfidence: number; // 0-100
  subcategory: string;
  subcategoryConfidence: number; // 0-100
  sentiment: SentimentType;
  sentimentConfidence: number; // 0-100
  status: ClassificationStatus;
  suggestedDepartment: string;
  priority: PriorityLevel;
  createdAt: string;
  reasons: string[];
  explanations: ClassificationExplanation[];
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ClassificationMetrics {
  totalClassified: number;
  highConfidence: number;
  needsReview: number;
  lowConfidence: number;
}

export const MOCK_CLASSIFICATION_METRICS: ClassificationMetrics = {
  totalClassified: 1248,
  highConfidence: 1042, // >= 80%
  needsReview: 148,     // 60 - 79%
  lowConfidence: 58,    // < 60%
};

export const MOCK_CLASSIFIED_GRIEVANCES: ClassifiedGrievanceItem[] = [
  {
    id: 'cls-101',
    ticketNumber: 'GRV-2026-00412',
    subject: 'Cannot login to semester portal with university SSO credentials',
    description: 'Every time I enter my roll number and OTP, the login redirects to a timeout 504 error page. Unable to view exam timetable.',
    studentName: 'Aarav Sharma',
    studentId: 'CS-2024-042',
    category: 'Technical Issue',
    categoryConfidence: 91,
    subcategory: 'Login Problem',
    subcategoryConfidence: 84,
    sentiment: 'Negative',
    sentimentConfidence: 89,
    status: 'PENDING_REVIEW',
    suggestedDepartment: 'Technical',
    priority: 'HIGH',
    createdAt: '25 mins ago',
    reasons: [
      'Login failure & timeout keywords detected in complaint body',
      'Authentication SSO domain URL pattern matched',
      '37 similar historical grievances mapped to Technical SSO gateway',
    ],
    explanations: [
      { factor: 'Keyword Semantics', evidence: '"login", "SSO credentials", "OTP", "504 error"', weightPercent: 45 },
      { factor: 'Historical Clustering', evidence: 'High cosine similarity with ticket cluster #CLS-04 (SSO Outages)', weightPercent: 35 },
      { factor: 'Entity Extraction', evidence: 'Identified affected target: "Semester Portal / Auth Gateway"', weightPercent: 20 },
    ],
  },
  {
    id: 'cls-102',
    ticketNumber: 'GRV-2026-00411',
    subject: 'Double payment deduction for hostel semester fee on gateway',
    description: 'Amount deducted twice from HDFC account for autumn term hostel charges. Transaction ref TXN-994102. Bank says university received both.',
    studentName: 'Pooja Hegde',
    studentId: 'BT-2023-019',
    category: 'Accounts & Billing',
    categoryConfidence: 96,
    subcategory: 'Fee Clearance',
    subcategoryConfidence: 92,
    sentiment: 'Negative',
    sentimentConfidence: 85,
    status: 'ACCEPTED',
    suggestedDepartment: 'Accounts',
    priority: 'HIGH',
    createdAt: '1h 10m ago',
    reasons: [
      'Payment transaction codes and bank deduction identifiers identified',
      'High confidence monetary dispute classification',
      'Routed to finance reconciliation queue automatically',
    ],
    explanations: [
      { factor: 'Financial Tokens', evidence: 'Detected "deducted twice", "TXN-", "hostel fee"', weightPercent: 55 },
      { factor: 'Bank Metadata', evidence: 'Recognized bank clearing pattern and settlement phrase', weightPercent: 30 },
      { factor: 'Urgency Metric', evidence: 'Unresolved monetary transactions flagged for 24h SLA priority', weightPercent: 15 },
    ],
  },
  {
    id: 'cls-103',
    ticketNumber: 'GRV-2026-00410',
    subject: 'Yellow turbid drinking water from cooler on Block D 3rd floor',
    description: 'Drinking water has strong metallic odor and rusty particulate precipitate. Students feeling uneasy after drinking.',
    studentName: 'Nitin Rao',
    studentId: 'CV-2024-061',
    category: 'Hostel Facilities',
    categoryConfidence: 88,
    subcategory: 'Water Supply',
    subcategoryConfidence: 86,
    sentiment: 'Negative',
    sentimentConfidence: 94,
    status: 'PENDING_REVIEW',
    suggestedDepartment: 'Hostel',
    priority: 'CRITICAL',
    createdAt: '2h 15m ago',
    reasons: [
      'Health & sanitation keywords identified ("turbid water", "uneasy")',
      'Residential Block D geographic tag detected',
      'Escalated to critical safety priority cohort',
    ],
    explanations: [
      { factor: 'Sanitation Lexicon', evidence: 'Matched terms: "drinking water", "turbid", "metallic odor"', weightPercent: 50 },
      { factor: 'Cohort Risk', evidence: 'Residential facility shared by 120+ occupants', weightPercent: 30 },
      { factor: 'Health Sentiment', evidence: 'Negative sentiment intensity scored 0.94 due to student sickness risk', weightPercent: 20 },
    ],
  },
  {
    id: 'cls-104',
    ticketNumber: 'GRV-2026-00409',
    subject: 'Request for migration certificate bonafide for internship visa',
    description: 'Need certified bonafide stamped by registrar for German research internship visa submission by upcoming Monday.',
    studentName: 'Meera Namboodiri',
    studentId: 'ME-2021-088',
    category: 'Administration',
    categoryConfidence: 94,
    subcategory: 'Certificates & Documents',
    subcategoryConfidence: 89,
    sentiment: 'Neutral',
    sentimentConfidence: 91,
    status: 'ACCEPTED',
    suggestedDepartment: 'Administration',
    priority: 'MEDIUM',
    createdAt: '3h 30m ago',
    reasons: [
      'Administrative documentation request vocabulary matched',
      'Standard non-adversarial inquiry pattern',
    ],
    explanations: [
      { factor: 'Document Parsing', evidence: '"migration certificate", "bonafide", "stamped by registrar"', weightPercent: 60 },
      { factor: 'Tone Analysis', evidence: 'Polite inquiry with strict timeline constraints', weightPercent: 40 },
    ],
  },
  {
    id: 'cls-105',
    ticketNumber: 'GRV-2026-00408',
    subject: 'Noise during late evening near university gate bus turnaround',
    description: 'Loud revving of engines and horns during 10 PM to 12 AM making studying in north wing quiet rooms difficult.',
    studentName: 'Kunal Verma',
    studentId: 'EE-2024-075',
    category: 'Campus Facilities',
    categoryConfidence: 68,
    subcategory: 'Noise Disturbance',
    subcategoryConfidence: 59,
    sentiment: 'Neutral',
    sentimentConfidence: 72,
    status: 'FLAGGED',
    suggestedDepartment: 'Transport',
    priority: 'LOW',
    createdAt: '5h 10m ago',
    reasons: [
      'Ambiguous department routing between Campus Security and Transport Logistics',
      'Low subcategory confidence score (<60%) triggered review requirement',
    ],
    explanations: [
      { factor: 'Boundary Ambiguity', evidence: 'Mentions "bus turnaround" (Transport) and "late night quiet" (Campus Warden)', weightPercent: 50 },
      { factor: 'Low Keyword Density', evidence: 'Sparse domain-specific terminology', weightPercent: 50 },
    ],
  },
  {
    id: 'cls-106',
    ticketNumber: 'GRV-2026-00407',
    subject: 'IEEE Xplore institutional access expired on library terminals',
    description: 'When searching IEEE digital library on workstation 14, asks for personal credit card payment rather than institutional IP authentication.',
    studentName: 'Abhishek Roy',
    studentId: 'CS-2023-012',
    category: 'Library Services',
    categoryConfidence: 89,
    subcategory: 'Digital Subscriptions',
    subcategoryConfidence: 87,
    sentiment: 'Neutral',
    sentimentConfidence: 80,
    status: 'ACCEPTED',
    suggestedDepartment: 'Library',
    priority: 'MEDIUM',
    createdAt: '6h 20m ago',
    reasons: [
      'Recognized academic database name (IEEE Xplore)',
      'Library digital portal routing verified',
    ],
    explanations: [
      { factor: 'Subscription Match', evidence: '"IEEE Xplore", "institutional IP authentication"', weightPercent: 65 },
      { factor: 'Facility Mapping', evidence: 'Library terminal pool IP subnet verified', weightPercent: 35 },
    ],
  },
];
