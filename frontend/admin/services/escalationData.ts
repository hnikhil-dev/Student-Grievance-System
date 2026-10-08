import { PriorityLevel, GrievanceStatus } from '../types/domain';

export type EscalationLevel = 'Level 1 (Department Lead)' | 'Level 2 (Executive Dean)' | 'Level 3 (Academic Provost)';
export type EscalationStatus = 'PENDING' | 'IN_REVIEW' | 'RESOLVED';

export interface TimelineCheckpoint {
  id: string;
  stage: string;
  timestamp: string;
  actor: string;
  description: string;
  completed: boolean;
  statusType: 'success' | 'warning' | 'danger' | 'info';
}

export interface EscalationRuleItem {
  id: string;
  name: string;
  condition: string;
  action: string;
  active: boolean;
  triggerCount: number;
}

export interface EscalationItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  reason: string;
  department: string;
  priority: PriorityLevel;
  escalationLevel: EscalationLevel;
  assignedTo: string;
  age: string;
  status: EscalationStatus;
  escalatedAt: string;
  studentName: string;
  studentId: string;
  timeline: TimelineCheckpoint[];
  notes?: string;
}

export interface EscalationMetrics {
  totalEscalations: number;
  criticalCount: number;
  pendingCount: number;
  resolvedCount: number;
}

export const MOCK_ESCALATION_METRICS: EscalationMetrics = {
  totalEscalations: 14,
  criticalCount: 5,
  pendingCount: 6,
  resolvedCount: 3,
};

export const MOCK_ESCALATION_RULES: EscalationRuleItem[] = [
  {
    id: 'er-1',
    name: 'Critical SLA Breach Policy',
    condition: 'IF Priority = Critical AND SLA Remaining < 15 minutes',
    action: 'THEN Escalate to Level 2 (Executive Dean) & Dispatch SMS Memo',
    active: true,
    triggerCount: 9,
  },
  {
    id: 'er-2',
    name: 'Hazardous Student Health Breach',
    condition: 'IF Category = Health & Sanitation AND Cohort Affected > 50',
    action: 'THEN Auto-Assign Chief Medical Warden & Level 2 Interlock',
    active: true,
    triggerCount: 4,
  },
  {
    id: 'er-3',
    name: 'Unresolved Financial Hold',
    condition: 'IF Status = Stalled > 48 Hours AND Impact = Exam Barred',
    action: 'THEN Elevate to Level 3 (Academic Provost)',
    active: true,
    triggerCount: 2,
  },
];

export const MOCK_ESCALATIONS: EscalationItem[] = [
  {
    id: 'esc-01',
    ticketNumber: 'GRV-2026-00001',
    title: 'Engineering Lab 3 Switch Burnout & PoE Terminal Arc Breakdown',
    description: 'PoE power distribution burnout impacting 60 workstations right before scheduled CS-301 laboratory exams.',
    reason: 'SLA Breach Threat & Exam Disruption Risk',
    department: 'Technical',
    priority: 'CRITICAL',
    escalationLevel: 'Level 2 (Executive Dean)',
    assignedTo: 'Er. Rajesh Kulkarni',
    age: '1h 35m',
    status: 'PENDING',
    escalatedAt: 'Today at 09:40 AM',
    studentName: 'Aarav Sharma',
    studentId: 'CS-2024-042',
    timeline: [
      { id: 'tl-1', stage: 'Created', timestamp: '08:05 AM', actor: 'Aarav Sharma', description: 'Grievance submitted via portal', completed: true, statusType: 'info' },
      { id: 'tl-2', stage: 'Assigned', timestamp: '08:15 AM', actor: 'Automated Dispatcher', description: 'Assigned to Technical Field Team', completed: true, statusType: 'info' },
      { id: 'tl-3', stage: 'SLA Warning', timestamp: '09:20 AM', actor: 'SLA Sentinel Watchdog', description: '75% time elapsed without field resolution', completed: true, statusType: 'warning' },
      { id: 'tl-4', stage: 'Escalated', timestamp: '09:40 AM', actor: 'Admin Dispatcher', description: 'Elevated to Level 2 Executive Dean due to midterm exam impact', completed: true, statusType: 'danger' },
      { id: 'tl-5', stage: 'Reassigned', timestamp: '09:55 AM', actor: 'Dean Facilities', description: 'Emergency electrician contractor dispatched to Block C', completed: false, statusType: 'info' },
      { id: 'tl-6', stage: 'Resolved', timestamp: 'Pending', actor: 'Field Officer', description: 'Post-replacement PoE verification', completed: false, statusType: 'success' },
    ],
  },
  {
    id: 'esc-02',
    ticketNumber: 'GRV-2026-00002',
    title: 'Hostel Block D Drinking Water Cooler Turbidity & Rust Sediment',
    description: 'Yellow tinted water with heavy particulate sediment from primary corridor cooler affecting 120 resident students.',
    reason: 'Active SLA Breach & Student Health Hazard',
    department: 'Hostel',
    priority: 'CRITICAL',
    escalationLevel: 'Level 2 (Executive Dean)',
    assignedTo: 'Prof. Arvind Nambiar',
    age: '4h 25m',
    status: 'IN_REVIEW',
    escalatedAt: 'Today at 10:15 AM',
    studentName: 'Pooja Hegde',
    studentId: 'BT-2023-019',
    timeline: [
      { id: 'tl-11', stage: 'Created', timestamp: '06:00 AM', actor: 'Pooja Hegde', description: 'Grievance submitted with photo evidence', completed: true, statusType: 'info' },
      { id: 'tl-12', stage: 'Assigned', timestamp: '07:30 AM', actor: 'Hostel Supervisor', description: 'Assigned to Residential Plumber', completed: true, statusType: 'info' },
      { id: 'tl-13', stage: 'SLA Warning', timestamp: '09:30 AM', actor: 'SLA Sentinel Watchdog', description: 'Standard 4h window expired', completed: true, statusType: 'warning' },
      { id: 'tl-14', stage: 'Escalated', timestamp: '10:15 AM', actor: 'Chief Warden', description: 'Breached threshold memo sent to Dean of Student Welfare', completed: true, statusType: 'danger' },
      { id: 'tl-15', stage: 'Reassigned', timestamp: '10:45 AM', actor: 'Dean Welfare', description: 'Bottled emergency drinking water dispatched to Block D', completed: true, statusType: 'info' },
      { id: 'tl-16', stage: 'Resolved', timestamp: 'In Progress', actor: 'Maintenance Team', description: 'Deep tank cleaning & UV filter swap', completed: false, statusType: 'success' },
    ],
  },
  {
    id: 'esc-03',
    ticketNumber: 'GRV-2026-00055',
    title: 'National Merit Scholarship Second Tranche Reconciliation Delay',
    description: 'Semester tuition clearance hold impacting pending hall ticket issuance for upcoming final exam.',
    reason: 'Examination Debarment Risk',
    department: 'Accounts',
    priority: 'HIGH',
    escalationLevel: 'Level 1 (Department Lead)',
    assignedTo: 'Mr. S. Ramanathan',
    age: '7h 02m',
    status: 'PENDING',
    escalatedAt: 'Today at 11:30 AM',
    studentName: 'Tanvi Joshi',
    studentId: 'CH-2022-019',
    timeline: [
      { id: 'tl-21', stage: 'Created', timestamp: '04:30 AM', actor: 'Tanvi Joshi', description: 'Ticket created with scholarship endorsement attachment', completed: true, statusType: 'info' },
      { id: 'tl-22', stage: 'Assigned', timestamp: '08:30 AM', actor: 'Accounts Clerk', description: 'Queued for manual reconciliation', completed: true, statusType: 'info' },
      { id: 'tl-23', stage: 'SLA Warning', timestamp: '10:45 AM', actor: 'SLA Sentinel Watchdog', description: 'Approaching exam freeze deadline', completed: true, statusType: 'warning' },
      { id: 'tl-24', stage: 'Escalated', timestamp: '11:30 AM', actor: 'Student Welfare Cell', description: 'Escalated to Finance Controller for manual hall ticket unblock', completed: true, statusType: 'danger' },
      { id: 'tl-25', stage: 'Reassigned', timestamp: 'Pending', actor: 'Finance Controller', description: 'Direct unblock approval pending', completed: false, statusType: 'info' },
      { id: 'tl-26', stage: 'Resolved', timestamp: 'Pending', actor: 'Controller', description: 'Provisional hall ticket generated', completed: false, statusType: 'success' },
    ],
  },
  {
    id: 'esc-04',
    ticketNumber: 'GRV-2026-00003',
    title: 'Lecture Hall 402 Air Handling Unit Gas Leak During Exams',
    description: 'Freon venting and ambient temperature rising above 39°C with 80 students seated for midterms.',
    reason: 'Classroom Safety & Thermal Hazard',
    department: 'Maintenance',
    priority: 'HIGH',
    escalationLevel: 'Level 2 (Executive Dean)',
    assignedTo: 'Mr. Vikram Joshi',
    age: '5h 00m',
    status: 'RESOLVED',
    escalatedAt: 'Yesterday at 02:15 PM',
    studentName: 'Student Union Rep',
    studentId: 'SU-2024-001',
    timeline: [
      { id: 'tl-31', stage: 'Created', timestamp: 'Yesterday 09:15 AM', actor: 'Hall Proctor', description: 'Proctor flagged refrigerant odor', completed: true, statusType: 'info' },
      { id: 'tl-32', stage: 'Assigned', timestamp: 'Yesterday 09:30 AM', actor: 'Facilities Lead', description: 'HVAC technician dispatched', completed: true, statusType: 'info' },
      { id: 'tl-33', stage: 'SLA Warning', timestamp: 'Yesterday 12:00 PM', actor: 'Sentinel Watchdog', description: 'Ambient temp exceeded 35°C threshold', completed: true, statusType: 'warning' },
      { id: 'tl-34', stage: 'Escalated', timestamp: 'Yesterday 02:15 PM', actor: 'Exam Controller', description: 'Emergency hall relocation ordered to Hall 201', completed: true, statusType: 'danger' },
      { id: 'tl-35', stage: 'Reassigned', timestamp: 'Yesterday 03:00 PM', actor: 'Lead HVAC Engineer', description: 'Compressor valve replaced and pressure verified', completed: true, statusType: 'info' },
      { id: 'tl-36', stage: 'Resolved', timestamp: 'Yesterday 05:30 PM', actor: 'Dean Facilities', description: 'Hall 402 inspected, certified, and reopened', completed: true, statusType: 'success' },
    ],
  },
];
