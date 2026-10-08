import { PriorityLevel, GrievanceStatus, SlaHealth } from '../types/domain';

export interface DateRangeOption {
  id: string;
  label: string;
  days: number;
}

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { id: 'today', label: 'Today (Past 24h)', days: 1 },
  { id: 'week', label: 'Last 7 Days', days: 7 },
  { id: 'month', label: 'Last 30 Days', days: 30 },
  { id: 'term', label: 'Current Academic Term', days: 90 },
];

export interface CommandCenterKPI {
  title: string;
  value: string;
  numericValue: number;
  subtitle?: string;
  icon: string;
  comparison: string;
  isPositive: boolean;
  accentColor: string;
}

export interface VolumeTrendPoint {
  date: string;
  incoming: number;
  resolved: number;
}

export interface PriorityDistributionItem {
  level: PriorityLevel;
  count: number;
  percentage: number;
  scoreRange: string;
}

export interface DepartmentWorkload {
  id: string;
  name: string;
  code: string;
  totalGrievances: number;
  resolutionRate: number; // percentage
  slaPercentage: number;   // percentage
  active: number;
  resolved: number;
  headName: string;
  atRiskCount: number;
}

export interface SlaHealthMetrics {
  healthyPercent: number;
  atRiskPercent: number;
  breachedPercent: number;
  healthyCount: number;
  atRiskCount: number;
  breachedCount: number;
}

export type ActivityEventType =
  | 'AI_CLASSIFIED'
  | 'DUPLICATE_DETECTED'
  | 'SLA_APPROACHING'
  | 'GRIEVANCE_ESCALATED'
  | 'GRIEVANCE_RESOLVED';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: ActivityEventType;
  typeLabel: string;
  ticketNumber: string;
  title: string;
  actor: string;
  department: string;
  level: 'info' | 'warning' | 'danger' | 'success';
}

export interface CriticalIssue {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  department: string;
  priority: PriorityLevel;
  priorityScore: number;
  status: GrievanceStatus;
  cohortImpact: number;
  assignedOfficer: string;
  slaRemainingMinutes: number;
  slaHealth: SlaHealth;
  reportedAgo: string;
  location: string;
  description: string;
}

export const MOCK_COMMAND_CENTER_DATA = {
  kpis: [
    {
      title: 'Total Grievances',
      value: '12,482',
      numericValue: 12482,
      subtitle: 'Across all university sectors',
      icon: '📋',
      comparison: '+12.4% from last period',
      isPositive: true,
      accentColor: '#427B65',
    },
    {
      title: 'Open Grievances',
      value: '348',
      numericValue: 348,
      subtitle: 'Currently in active resolution pipelines',
      icon: '⏳',
      comparison: '-4.2% from last period',
      isPositive: true, // Lower open is good
      accentColor: '#6A9282',
    },
    {
      title: 'SLA At Risk',
      value: '18',
      numericValue: 18,
      subtitle: '14 approaching deadline • 4 breached',
      icon: '⏱️',
      comparison: '+2 from yesterday',
      isPositive: false, // More at risk is bad
      accentColor: '#C99A4A',
    },
    {
      title: 'Escalations',
      value: '7',
      numericValue: 7,
      subtitle: 'Level-2 leadership intervention required',
      icon: '📣',
      comparison: '+1 from yesterday',
      isPositive: false, // More escalations is bad
      accentColor: '#C86B62',
    },
  ] as CommandCenterKPI[],

  // Line/area chart trend points: incoming grievances vs resolved grievances
  trends: [
    { date: 'Oct 02', incoming: 42, resolved: 38 },
    { date: 'Oct 03', incoming: 48, resolved: 44 },
    { date: 'Oct 04', incoming: 56, resolved: 49 },
    { date: 'Oct 05', incoming: 38, resolved: 45 },
    { date: 'Oct 06', incoming: 64, resolved: 58 },
    { date: 'Oct 07', incoming: 72, resolved: 65 },
    { date: 'Oct 08', incoming: 59, resolved: 53 },
  ] as VolumeTrendPoint[],

  // Priority Distribution
  priorityDistribution: [
    { level: 'CRITICAL', count: 48, percentage: 3.9, scoreRange: '85-100' },
    { level: 'HIGH', count: 212, percentage: 17.0, scoreRange: '70-84' },
    { level: 'MEDIUM', count: 584, percentage: 46.8, scoreRange: '40-69' },
    { level: 'LOW', count: 404, percentage: 32.3, scoreRange: '0-39' },
  ] as PriorityDistributionItem[],

  // Department Performance with total grievances, resolution rate, SLA percentage
  departments: [
    {
      id: 'd1',
      name: 'Information Technology & Networks',
      code: 'IT',
      totalGrievances: 3420,
      resolutionRate: 96.2,
      slaPercentage: 97.4,
      active: 48,
      resolved: 3372,
      headName: 'Dr. M. S. Sundaram',
      atRiskCount: 3,
    },
    {
      id: 'd2',
      name: 'Hostel & Residential Facilities',
      code: 'HOSTEL',
      totalGrievances: 2980,
      resolutionRate: 91.5,
      slaPercentage: 89.2,
      active: 84,
      resolved: 2896,
      headName: 'Prof. Arvind Nambiar',
      atRiskCount: 6,
    },
    {
      id: 'd3',
      name: 'Campus Maintenance & Works',
      code: 'MAINTENANCE',
      totalGrievances: 2640,
      resolutionRate: 94.0,
      slaPercentage: 93.8,
      active: 52,
      resolved: 2588,
      headName: 'Er. Rajesh Kulkarni',
      atRiskCount: 4,
    },
    {
      id: 'd4',
      name: 'Academic & Examination Wing',
      code: 'ACADEMICS',
      totalGrievances: 2150,
      resolutionRate: 98.1,
      slaPercentage: 98.6,
      active: 28,
      resolved: 2122,
      headName: 'Dr. Meenakshi Iyer',
      atRiskCount: 2,
    },
    {
      id: 'd5',
      name: 'Canteen & Food Safety',
      code: 'CANTEEN',
      totalGrievances: 1292,
      resolutionRate: 88.6,
      slaPercentage: 91.0,
      active: 36,
      resolved: 1256,
      headName: 'Mr. Vikram Joshi',
      atRiskCount: 3,
    },
  ] as DepartmentWorkload[],

  // SLA Health: Healthy, At Risk, Breached
  slaHealth: {
    healthyPercent: 84,
    atRiskPercent: 12,
    breachedPercent: 4,
    healthyCount: 292,
    atRiskCount: 42,
    breachedCount: 14,
  } as SlaHealthMetrics,

  // Recent Activity including the 5 prompt examples:
  // - AI classified grievance
  // - Duplicate detected
  // - SLA approaching
  // - Grievance escalated
  // - Grievance resolved
  recentActivity: [
    {
      id: 'act-01',
      timestamp: '6 mins ago',
      type: 'SLA_APPROACHING',
      typeLabel: 'SLA approaching',
      ticketNumber: 'GRV-2026-00001',
      title: 'SLA approaching: 45 minutes remaining on Lab 3 switch outage before threshold breach',
      actor: 'SLA Sentinel Watchdog',
      department: 'IT',
      level: 'warning',
    },
    {
      id: 'act-02',
      timestamp: '18 mins ago',
      type: 'AI_CLASSIFIED',
      typeLabel: 'AI classified grievance',
      ticketNumber: 'GRV-2026-00389',
      title: 'AI classified grievance: categorized as Electrical Infrastructure (Priority Score: 95)',
      actor: 'Triage & Diagnostics Engine',
      department: 'MAINTENANCE',
      level: 'info',
    },
    {
      id: 'act-03',
      timestamp: '32 mins ago',
      type: 'DUPLICATE_DETECTED',
      typeLabel: 'Duplicate detected',
      ticketNumber: 'GRV-2026-00388',
      title: 'Duplicate detected: 3 incoming water cooler reports clustered into parent incident',
      actor: 'Clustering & Similarity Agent',
      department: 'HOSTEL',
      level: 'info',
    },
    {
      id: 'act-04',
      timestamp: '47 mins ago',
      type: 'GRIEVANCE_ESCALATED',
      typeLabel: 'Grievance escalated',
      ticketNumber: 'GRV-2026-00003',
      title: 'Grievance escalated: Lecture Hall 402 AC refrigerant fault escalated to Facilities Dean',
      actor: 'Admin Dispatcher',
      department: 'MAINTENANCE',
      level: 'danger',
    },
    {
      id: 'act-05',
      timestamp: '1h 12m ago',
      type: 'GRIEVANCE_RESOLVED',
      typeLabel: 'Grievance resolved',
      ticketNumber: 'GRV-2026-00361',
      title: 'Grievance resolved: Central Library RADIUS authentication server restored and verified',
      actor: 'Er. Rajesh Kulkarni',
      department: 'IT',
      level: 'success',
    },
  ] as ActivityEvent[],

  // Critical Attention: most important issues that require admin action
  criticalIssues: [
    {
      id: 'crit-01',
      ticketNumber: 'GRV-2026-00001',
      title: 'Engineering Lab 3 Switch Burnout & PoE Terminal Arc Breakdown',
      category: 'IT & Networks',
      department: 'IT',
      priority: 'CRITICAL',
      priorityScore: 95,
      status: 'IN_PROGRESS',
      cohortImpact: 60,
      assignedOfficer: 'Er. Rajesh Kulkarni',
      slaRemainingMinutes: 45,
      slaHealth: 'AT_RISK',
      reportedAgo: '1h 35m ago',
      location: 'Block C, Floor 2, Lab 3',
      description: 'PoE power distribution burnout impacting 60 workstations right before scheduled CS-301 laboratory exams.',
    },
    {
      id: 'crit-02',
      ticketNumber: 'GRV-2026-00002',
      title: 'Hostel Block D Drinking Water Cooler Turbidity & Rust Sediment',
      category: 'Hostel & Facilities',
      department: 'HOSTEL',
      priority: 'HIGH',
      priorityScore: 88,
      status: 'SUBMITTED',
      cohortImpact: 120,
      assignedOfficer: 'Unassigned',
      slaRemainingMinutes: -25,
      slaHealth: 'BREACHED',
      reportedAgo: '4h 25m ago',
      location: 'Hostel Block D, 3rd Floor Wing',
      description: 'Yellow tinted water with heavy particulate sediment from primary corridor cooler affecting 120 resident students.',
    },
    {
      id: 'crit-03',
      ticketNumber: 'GRV-2026-00003',
      title: 'Lecture Hall 402 Air Handling Unit Gas Leak During Exams',
      category: 'Campus Facilities',
      department: 'MAINTENANCE',
      priority: 'HIGH',
      priorityScore: 82,
      status: 'ESCALATED',
      cohortImpact: 80,
      assignedOfficer: 'Mr. Vikram Joshi',
      slaRemainingMinutes: 70,
      slaHealth: 'AT_RISK',
      reportedAgo: '50m ago',
      location: 'Academic Block 4, Hall 402',
      description: 'Freon venting and ambient temperature rising above 39°C with 80 students seated for midterms.',
    },
  ] as CriticalIssue[],
};
