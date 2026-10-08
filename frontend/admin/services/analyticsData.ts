export interface AnalyticsVolumePoint {
  period: string;
  incoming: number;
  resolved: number;
}

export interface DepartmentPerfMetric {
  department: string;
  avgResponseHours: number;
  avgResolutionHours: number;
  slaCompliancePercent: number;
  totalVolume: number;
}

export interface CategoryShareItem {
  category: string;
  count: number;
  percentage: number;
}

export interface AiAnalyticsData {
  averageConfidence: number;
  autoAcceptedPercent: number;
  manualOverridePercent: number;
  duplicateDetectionRate: number;
  confidenceBuckets: { range: string; count: number }[];
}

export interface EscalationAnalyticsData {
  totalEscalations: number;
  byReason: { reason: string; count: number; percentage: number }[];
  byDepartment: { department: string; count: number }[];
}

export interface AnalyticsSummaryObservation {
  id: string;
  type: 'growth' | 'risk' | 'improvement';
  text: string;
  metric: string;
}

export const MOCK_ANALYTICS_OBSERVATIONS: AnalyticsSummaryObservation[] = [
  {
    id: 'obs-1',
    type: 'growth',
    text: 'Grievance volume increased 18.4% over the past 30 days due to semester midterm registration.',
    metric: '+18.4% Volume',
  },
  {
    id: 'obs-2',
    type: 'risk',
    text: 'Hostel & Residential sector shows the lowest SLA compliance (88.4%) driven by plumbing hardware delays.',
    metric: 'Hostel SLA Risk',
  },
  {
    id: 'obs-3',
    type: 'improvement',
    text: 'Average resolution time across campus improved from 6.2 hours to 4.4 hours after AI triage deployment.',
    metric: '-29% Resolution Time',
  },
];

export const MOCK_VOLUME_TIMELINE: AnalyticsVolumePoint[] = [
  { period: 'Week 1', incoming: 240, resolved: 220 },
  { period: 'Week 2', incoming: 280, resolved: 265 },
  { period: 'Week 3', incoming: 310, resolved: 290 },
  { period: 'Week 4', incoming: 340, resolved: 335 },
  { period: 'Week 5', incoming: 390, resolved: 370 },
  { period: 'Week 6', incoming: 420, resolved: 395 },
];

export const MOCK_DEPARTMENT_PERF: DepartmentPerfMetric[] = [
  { department: 'Technical', avgResponseHours: 0.8, avgResolutionHours: 3.4, slaCompliancePercent: 96.8, totalVolume: 3182 },
  { department: 'Academic', avgResponseHours: 0.9, avgResolutionHours: 3.6, slaCompliancePercent: 98.2, totalVolume: 2020 },
  { department: 'Administration', avgResponseHours: 1.4, avgResolutionHours: 3.9, slaCompliancePercent: 97.2, totalVolume: 1212 },
  { department: 'Support', avgResponseHours: 1.1, avgResolutionHours: 4.2, slaCompliancePercent: 95.4, totalVolume: 1882 },
  { department: 'Transport', avgResponseHours: 1.6, avgResolutionHours: 5.1, slaCompliancePercent: 93.8, totalVolume: 738 },
  { department: 'Accounts', avgResponseHours: 2.4, avgResolutionHours: 6.5, slaCompliancePercent: 92.1, totalVolume: 1481 },
  { department: 'Hostel', avgResponseHours: 2.8, avgResolutionHours: 7.8, slaCompliancePercent: 88.4, totalVolume: 2517 },
  { department: 'Library', avgResponseHours: 0.6, avgResolutionHours: 2.1, slaCompliancePercent: 98.6, totalVolume: 1001 },
];

export const MOCK_TOP_CATEGORIES: CategoryShareItem[] = [
  { category: 'Network & WiFi Connectivity', count: 3420, percentage: 27.4 },
  { category: 'Hostel Infrastructure & Water', count: 2517, percentage: 20.2 },
  { category: 'Academic Eligibility & Attendance', count: 2020, percentage: 16.2 },
  { category: 'Accounts & Fee Clearance', count: 1481, percentage: 11.9 },
  { category: 'Portal SSO & Access', count: 1240, percentage: 9.9 },
  { category: 'Campus Library & Reprints', count: 1001, percentage: 8.0 },
  { category: 'Transport Logistics', count: 738, percentage: 5.9 },
];

export const MOCK_AI_ANALYTICS: AiAnalyticsData = {
  averageConfidence: 88.2,
  autoAcceptedPercent: 84.6,
  manualOverridePercent: 4.8,
  duplicateDetectionRate: 92.4,
  confidenceBuckets: [
    { range: '90–100% (High)', count: 780 },
    { range: '80–89% (Strong)', count: 262 },
    { range: '70–79% (Medium)', count: 114 },
    { range: '60–69% (Review)', count: 34 },
    { range: '<60% (Low)', count: 58 },
  ],
};

export const MOCK_ESCALATION_ANALYTICS: EscalationAnalyticsData = {
  totalEscalations: 14,
  byReason: [
    { reason: 'SLA Window Breach', count: 6, percentage: 42.8 },
    { reason: 'Student Safety / Health Risk', count: 4, percentage: 28.6 },
    { reason: 'Exam Disruption Imminent', count: 3, percentage: 21.4 },
    { reason: 'Disputed Monetary Deductions', count: 1, percentage: 7.2 },
  ],
  byDepartment: [
    { department: 'Hostel', count: 5 },
    { department: 'Technical', count: 4 },
    { department: 'Accounts', count: 3 },
    { department: 'Maintenance', count: 2 },
  ],
};
