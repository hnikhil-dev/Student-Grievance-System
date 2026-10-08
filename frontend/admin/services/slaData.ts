import { PriorityLevel, GrievanceStatus, SlaHealth } from '../types/domain';

export interface SlaGrievanceItem {
  id: string;
  ticketNumber: string;
  title: string;
  department: string;
  priority: PriorityLevel;
  slaTargetHours: number;
  slaTargetFormatted: string;
  elapsedPercent: number; // 0 - 150% (over 100 means breached)
  timeRemainingMinutes: number; // negative = breached
  timeRemainingFormatted: string;
  health: SlaHealth;
  owner: string;
  createdAt: string;
  firstResponseAt: string;
  currentStatus: GrievanceStatus;
  escalationLevel: string;
  breachReason?: string;
  studentName: string;
}

export interface SlaMonitoringMetrics {
  overallSlaPercentage: number;
  withinSlaCount: number;
  atRiskCount: number;
  breachedCount: number;
  criticalAtRisk30m: number;
}

export const MOCK_SLA_METRICS: SlaMonitoringMetrics = {
  overallSlaPercentage: 94.6,
  withinSlaCount: 324,
  atRiskCount: 18,
  breachedCount: 6,
  criticalAtRisk30m: 4,
};

export const MOCK_SLA_GRIEVANCES: SlaGrievanceItem[] = [
  {
    id: 'sla-01',
    ticketNumber: 'GRV-2026-00001',
    title: 'Engineering Lab 3 Switch Burnout & PoE Terminal Arc Breakdown',
    department: 'Technical',
    priority: 'CRITICAL',
    slaTargetHours: 2,
    slaTargetFormatted: '2.0 Hours (Critical Immediate)',
    elapsedPercent: 78,
    timeRemainingMinutes: 26,
    timeRemainingFormatted: '26 mins remaining',
    health: 'AT_RISK',
    owner: 'Er. Rajesh Kulkarni',
    createdAt: '1h 34m ago',
    firstResponseAt: '12m after submission',
    currentStatus: 'IN_PROGRESS',
    escalationLevel: 'Level 1 (Field Dispatch)',
    studentName: 'Aarav Sharma',
  },
  {
    id: 'sla-02',
    ticketNumber: 'GRV-2026-00002',
    title: 'Hostel Block D Drinking Water Cooler Turbidity & Rust Sediment',
    department: 'Hostel',
    priority: 'CRITICAL',
    slaTargetHours: 4,
    slaTargetFormatted: '4.0 Hours (Sanitation Standard)',
    elapsedPercent: 110,
    timeRemainingMinutes: -25,
    timeRemainingFormatted: '25 mins overdue',
    health: 'BREACHED',
    owner: 'Unassigned',
    createdAt: '4h 25m ago',
    firstResponseAt: 'Pending Initial Triage',
    currentStatus: 'SUBMITTED',
    escalationLevel: 'Level 2 (Automatic Escalation Triggered)',
    breachReason: 'Field specialist team unavailable during afternoon shift transition.',
    studentName: 'Pooja Hegde',
  },
  {
    id: 'sla-03',
    ticketNumber: 'GRV-2026-00055',
    title: 'National Merit Scholarship Second Tranche Reconciliation Delay',
    department: 'Accounts',
    priority: 'HIGH',
    slaTargetHours: 8,
    slaTargetFormatted: '8.0 Hours (Financial Inquiry)',
    elapsedPercent: 88,
    timeRemainingMinutes: 58,
    timeRemainingFormatted: '58 mins remaining',
    health: 'AT_RISK',
    owner: 'Mr. S. Ramanathan',
    createdAt: '7h 02m ago',
    firstResponseAt: '1h 20m after submission',
    currentStatus: 'UNDER_REVIEW',
    escalationLevel: 'Level 1 (Finance Lead)',
    studentName: 'Tanvi Joshi',
  },
  {
    id: 'sla-04',
    ticketNumber: 'GRV-2026-00084',
    title: 'Central Library WiFi Authentication Gateway Timeout',
    department: 'Technical',
    priority: 'HIGH',
    slaTargetHours: 6,
    slaTargetFormatted: '6.0 Hours',
    elapsedPercent: 42,
    timeRemainingMinutes: 210,
    timeRemainingFormatted: '3h 30m remaining',
    health: 'HEALTHY',
    owner: 'Er. Rajesh Kulkarni',
    createdAt: '2h 30m ago',
    firstResponseAt: '25m after submission',
    currentStatus: 'ASSIGNED',
    escalationLevel: 'Nominal Operations',
    studentName: 'Sneha Patil',
  },
  {
    id: 'sla-05',
    ticketNumber: 'GRV-2026-00015',
    title: 'Biometric Attendance Discrepancy in CS-301 Midterm Eligibility',
    department: 'Academic',
    priority: 'HIGH',
    slaTargetHours: 6,
    slaTargetFormatted: '6.0 Hours',
    elapsedPercent: 35,
    timeRemainingMinutes: 235,
    timeRemainingFormatted: '3h 55m remaining',
    health: 'HEALTHY',
    owner: 'Dr. Meenakshi Iyer',
    createdAt: '2h 05m ago',
    firstResponseAt: '40m after submission',
    currentStatus: 'IN_PROGRESS',
    escalationLevel: 'Nominal Operations',
    studentName: 'Gaurav Kulkarni',
  },
  {
    id: 'sla-06',
    ticketNumber: 'GRV-2026-00003',
    title: 'Lecture Hall 402 Air Handling Unit Gas Leak During Exams',
    department: 'Maintenance',
    priority: 'HIGH',
    slaTargetHours: 4,
    slaTargetFormatted: '4.0 Hours',
    elapsedPercent: 125,
    timeRemainingMinutes: -60,
    timeRemainingFormatted: '1 hour overdue',
    health: 'BREACHED',
    owner: 'Mr. Vikram Joshi',
    createdAt: '5h 00m ago',
    firstResponseAt: '45m after submission',
    currentStatus: 'ESCALATED',
    escalationLevel: 'Level 2 (Dean of Infrastructure)',
    breachReason: 'Specialized compressor valve replacement part awaiting vendor delivery.',
    studentName: 'Student Union Rep',
  },
];
