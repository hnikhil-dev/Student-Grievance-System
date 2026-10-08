import { PriorityLevel } from '../types/domain';

export interface ScoreFactor {
  factor: string;
  points: number;
  maxPoints: number;
  rationale: string;
}

export interface PriorityRuleItem {
  id: string;
  name: string;
  condition: string;
  action: string;
  active: boolean;
  triggerCount: number;
}

export interface PriorityGrievanceItem {
  id: string;
  ticketNumber: string;
  subject: string;
  department: string;
  priority: PriorityLevel;
  score: number; // 0 - 100
  slaRemaining: string;
  slaMinutesRemaining: number;
  reason: string;
  studentName: string;
  cohortImpact: number;
  scoringBreakdown: ScoreFactor[];
  overriddenBy?: string;
  overriddenReason?: string;
}

export interface PriorityEngineMetrics {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  priorityChangesToday: number;
  averagePriorityScore: number;
  criticalUnresolved: number;
}

export const MOCK_PRIORITY_METRICS: PriorityEngineMetrics = {
  criticalCount: 14,
  highCount: 48,
  mediumCount: 182,
  lowCount: 104,
  priorityChangesToday: 8,
  averagePriorityScore: 68.4,
  criticalUnresolved: 6,
};

export const MOCK_PRIORITY_RULES: PriorityRuleItem[] = [
  {
    id: 'rule-1',
    name: 'SLA Escalation Trigger',
    condition: 'IF Urgency = High AND SLA Remaining < 30 minutes',
    action: 'THEN Increase Priority to CRITICAL (+15 score adjustment)',
    active: true,
    triggerCount: 12,
  },
  {
    id: 'rule-2',
    name: 'Cohort Impact Multiplier',
    condition: 'IF Affected Students > 50 AND Category = Infrastructure',
    action: 'THEN Assign Customer Impact = +30 (Maximum Cap)',
    active: true,
    triggerCount: 8,
  },
  {
    id: 'rule-3',
    name: 'Examination Window Urgency',
    condition: 'IF Event Window = Active Midterms AND Department = Academics/IT',
    action: 'THEN Set Urgency Multiplier = 1.4x',
    active: true,
    triggerCount: 19,
  },
  {
    id: 'rule-4',
    name: 'Repeat Issue Multiplier',
    condition: 'IF Identical Location Reported > 3 times in 48 hours',
    action: 'THEN Upgrade Priority from Low/Medium to High',
    active: true,
    triggerCount: 6,
  },
];

export const MOCK_PRIORITY_GRIEVANCES: PriorityGrievanceItem[] = [
  {
    id: 'p-101',
    ticketNumber: 'GRV-2026-00001',
    subject: 'Engineering Lab 3 Switch Burnout & PoE Terminal Arc Breakdown',
    department: 'Technical',
    priority: 'CRITICAL',
    score: 95,
    slaRemaining: '45 mins',
    slaMinutesRemaining: 45,
    reason: 'Active CS-301 lab exam scheduled with 60 students seated + hardware electrical failure',
    studentName: 'Aarav Sharma',
    cohortImpact: 60,
    scoringBreakdown: [
      { factor: 'Customer Impact', points: 30, maxPoints: 30, rationale: '60 students actively unable to complete exams' },
      { factor: 'Urgency', points: 25, maxPoints: 25, rationale: 'Immediate examination failure ongoing' },
      { factor: 'SLA Risk', points: 18, maxPoints: 20, rationale: '< 1 hour before SLA breach threshold' },
      { factor: 'Department Load', points: 12, maxPoints: 15, rationale: 'Technical queue currently at 88% capacity' },
      { factor: 'Safety / Risk', points: 10, maxPoints: 10, rationale: 'Electrical arc odor requires safety precaution' },
    ],
  },
  {
    id: 'p-102',
    ticketNumber: 'GRV-2026-00002',
    subject: 'Hostel Block D Drinking Water Cooler Turbidity & Rust Sediment',
    department: 'Hostel',
    priority: 'CRITICAL',
    score: 88,
    slaRemaining: 'Overdue (25m)',
    slaMinutesRemaining: -25,
    reason: 'Water supply contaminated affecting entire 3rd floor wing of residential block',
    studentName: 'Pooja Hegde',
    cohortImpact: 120,
    scoringBreakdown: [
      { factor: 'Customer Impact', points: 28, maxPoints: 30, rationale: '120 resident students without safe water' },
      { factor: 'Urgency', points: 23, maxPoints: 25, rationale: 'Immediate health and sanitation hazard' },
      { factor: 'SLA Risk', points: 20, maxPoints: 20, rationale: 'Breached response deadline' },
      { factor: 'Department Load', points: 10, maxPoints: 15, rationale: 'Hostel queue has 68 open tickets' },
      { factor: 'Student Health', points: 7, maxPoints: 10, rationale: 'Risk of waterborne illness reported' },
    ],
  },
  {
    id: 'p-103',
    ticketNumber: 'GRV-2026-00055',
    subject: 'National Merit Scholarship Second Tranche Reconciliation Delay',
    department: 'Accounts',
    priority: 'HIGH',
    score: 81,
    slaRemaining: '1h 15m',
    slaMinutesRemaining: 75,
    reason: 'Semester tuition clearance hold impacting pending hall ticket issuance',
    studentName: 'Tanvi Joshi',
    cohortImpact: 1,
    scoringBreakdown: [
      { factor: 'Customer Impact', points: 18, maxPoints: 30, rationale: 'Direct individual examination eligibility impediment' },
      { factor: 'Urgency', points: 24, maxPoints: 25, rationale: 'Hall ticket issuance closes in 24 hours' },
      { factor: 'SLA Risk', points: 17, maxPoints: 20, rationale: '78% of resolution SLA window elapsed' },
      { factor: 'Department Load', points: 14, maxPoints: 15, rationale: 'Finance department processing 34 fee inquiries' },
      { factor: 'Institutional Penalty', points: 8, maxPoints: 10, rationale: 'Scholarship agency compliance audit liability' },
    ],
  },
  {
    id: 'p-104',
    ticketNumber: 'GRV-2026-00015',
    subject: 'Biometric Attendance Discrepancy in CS-301 Midterm Eligibility',
    department: 'Academic',
    priority: 'HIGH',
    score: 79,
    slaRemaining: '2h 30m',
    slaMinutesRemaining: 150,
    reason: 'Student attendance de-sync from sensor log resulting in debarment flag',
    studentName: 'Gaurav Kulkarni',
    cohortImpact: 1,
    scoringBreakdown: [
      { factor: 'Customer Impact', points: 20, maxPoints: 30, rationale: 'Direct academic course standing impact' },
      { factor: 'Urgency', points: 22, maxPoints: 25, rationale: 'De-registration automatic freeze in 48 hours' },
      { factor: 'SLA Risk', points: 14, maxPoints: 20, rationale: 'Normal resolution trajectory' },
      { factor: 'Department Load', points: 15, maxPoints: 15, rationale: 'Academic wing under heavy midterm load' },
      { factor: 'System Discrepancy', points: 8, maxPoints: 10, rationale: 'Sensor raw logs show physical presence verified' },
    ],
  },
  {
    id: 'p-105',
    ticketNumber: 'GRV-2026-00049',
    subject: 'Emergency Passport Endorsement Verification Request',
    department: 'Administration',
    priority: 'MEDIUM',
    score: 68,
    slaRemaining: '4h 10m',
    slaMinutesRemaining: 250,
    reason: 'International internship visa appointment scheduled for Monday',
    studentName: 'Meera Namboodiri',
    cohortImpact: 1,
    scoringBreakdown: [
      { factor: 'Customer Impact', points: 15, maxPoints: 30, rationale: 'External consular appointment milestone' },
      { factor: 'Urgency', points: 18, maxPoints: 25, rationale: '3 days remaining until consular interview' },
      { factor: 'SLA Risk', points: 12, maxPoints: 20, rationale: 'Comfortably within standard admin turnaround' },
      { factor: 'Department Load', points: 13, maxPoints: 15, rationale: 'Registrar office operating at nominal pace' },
      { factor: 'Verification Standard', points: 10, maxPoints: 10, rationale: 'Official institutional seal required' },
    ],
  },
  {
    id: 'p-106',
    ticketNumber: 'GRV-2026-00029',
    subject: 'Morning Route 7 Shuttle Repeated 25-Minute Delay at Metro Point',
    department: 'Transport',
    priority: 'LOW',
    score: 38,
    slaRemaining: '6h 45m',
    slaMinutesRemaining: 405,
    reason: 'Off-peak shuttle timing variability due to road construction detour',
    studentName: 'Harsh Vardhan',
    cohortImpact: 15,
    scoringBreakdown: [
      { factor: 'Customer Impact', points: 10, maxPoints: 30, rationale: 'Commuter inconvenience with alternate route available' },
      { factor: 'Urgency', points: 8, maxPoints: 25, rationale: 'Scheduled service runs every 30 minutes' },
      { factor: 'SLA Risk', points: 6, maxPoints: 20, rationale: 'Over 6 hours before review threshold' },
      { factor: 'Department Load', points: 9, maxPoints: 15, rationale: 'Motor pool handling standard routes' },
      { factor: 'External Dependency', points: 5, maxPoints: 10, rationale: 'Municipal roadwork outside campus control' },
    ],
  },
];
