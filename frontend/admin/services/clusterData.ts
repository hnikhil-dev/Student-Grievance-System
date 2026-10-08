import { PriorityLevel } from '../types/domain';

export type ClusterStatus = 'GROWING_RAPIDLY' | 'STABLE' | 'RESOLVING' | 'NEW';

export interface ClusterTrendPoint {
  date: string;
  count: number;
}

export interface ClusterRecentItem {
  id: string;
  ticketNumber: string;
  title: string;
  studentName: string;
  priority: PriorityLevel;
  date: string;
}

export interface ClusterDetailItem {
  id: string;
  name: string;
  grievanceCount: number;
  growthPercentage: number;
  priority: PriorityLevel;
  status: ClusterStatus;
  statusLabel: string;
  trendDirection: 'UP' | 'DOWN' | 'FLAT';
  rootCauseSummary: string;
  topSymptoms: string[];
  affectedDepartments: string[];
  relatedCategories: string[];
  priorityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  trendHistory: ClusterTrendPoint[];
  recentGrievances: ClusterRecentItem[];
}

export interface ClusterMetrics {
  totalClusters: number;
  activeClusters: number;
  growingClusters: number;
  newClusters: number;
}

export const MOCK_CLUSTER_METRICS: ClusterMetrics = {
  totalClusters: 12,
  activeClusters: 8,
  growingClusters: 4,
  newClusters: 2,
};

export const MOCK_CLUSTERS: ClusterDetailItem[] = [
  {
    id: 'cls-01',
    name: 'Authentication & SSO Outages',
    grievanceCount: 428,
    growthPercentage: 34,
    priority: 'HIGH',
    status: 'GROWING_RAPIDLY',
    statusLabel: 'Growing Rapidly',
    trendDirection: 'UP',
    rootCauseSummary: 'Session timeout and 504 gateway responses on LDAP identity broker during peak registration hours.',
    topSymptoms: [
      '504 Gateway Timeout on SSO redirect',
      'Roll number OTP not delivered to registered email',
      'Session expired immediately after 2FA challenge',
      'Cached credentials rejected on portal refresh',
    ],
    affectedDepartments: ['Technical', 'Support'],
    relatedCategories: ['Technical Issue', 'Portal Accounts', 'Student ERP'],
    priorityDistribution: { critical: 28, high: 140, medium: 210, low: 50 },
    trendHistory: [
      { date: 'Oct 02', count: 24 },
      { date: 'Oct 03', count: 38 },
      { date: 'Oct 04', count: 52 },
      { date: 'Oct 05', count: 48 },
      { date: 'Oct 06', count: 72 },
      { date: 'Oct 07', count: 96 },
      { date: 'Oct 08', count: 98 },
    ],
    recentGrievances: [
      { id: 't-1', ticketNumber: 'GRV-2026-00412', title: 'Cannot login to semester portal with university SSO', studentName: 'Aarav Sharma', priority: 'HIGH', date: '25m ago' },
      { id: 't-2', ticketNumber: 'GRV-2026-00398', title: 'Two-factor auth loop on exam registration page', studentName: 'Diya Sen', priority: 'HIGH', date: '1h ago' },
      { id: 't-3', ticketNumber: 'GRV-2026-00382', title: '504 gateway timeout when accessing course enrollment', studentName: 'Rohan Mehta', priority: 'MEDIUM', date: '2h ago' },
    ],
  },
  {
    id: 'cls-02',
    name: 'Hostel Water & Plumbing Hazards',
    grievanceCount: 284,
    growthPercentage: 22,
    priority: 'CRITICAL',
    status: 'GROWING_RAPIDLY',
    statusLabel: 'Growing Rapidly',
    trendDirection: 'UP',
    rootCauseSummary: 'Overhead reservoir rust sediment leaking into residential block dispenser lines.',
    topSymptoms: [
      'Yellow/brown tinted water from drinking fountains',
      'Low pressure on 3rd floor bathroom lines',
      'Corrosion particles accumulating in cooler filters',
    ],
    affectedDepartments: ['Hostel', 'Maintenance'],
    relatedCategories: ['Hostel Facilities', 'Water Supply', 'Sanitation'],
    priorityDistribution: { critical: 64, high: 110, medium: 80, low: 30 },
    trendHistory: [
      { date: 'Oct 02', count: 18 },
      { date: 'Oct 03', count: 26 },
      { date: 'Oct 04', count: 34 },
      { date: 'Oct 05', count: 32 },
      { date: 'Oct 06', count: 48 },
      { date: 'Oct 07', count: 62 },
      { date: 'Oct 08', count: 64 },
    ],
    recentGrievances: [
      { id: 't-4', ticketNumber: 'GRV-2026-00002', title: 'Hostel Block D Drinking Water Cooler Turbidity', studentName: 'Pooja Hegde', priority: 'CRITICAL', date: '4h ago' },
      { id: 't-5', ticketNumber: 'GRV-2026-00005', title: 'Rust sediment from primary corridor cooler', studentName: 'Nitin Rao', priority: 'CRITICAL', date: '5h ago' },
    ],
  },
  {
    id: 'cls-03',
    name: 'Payment Gateway Double Deductions',
    grievanceCount: 196,
    growthPercentage: -12,
    priority: 'HIGH',
    status: 'RESOLVING',
    statusLabel: 'Resolving',
    trendDirection: 'DOWN',
    rootCauseSummary: 'Bank webhook timeout on high-concurrency payment callback endpoint.',
    topSymptoms: [
      'Bank debited but fee receipt status remains pending',
      'Duplicate transaction requests triggered on page reload',
    ],
    affectedDepartments: ['Accounts'],
    relatedCategories: ['Accounts & Billing', 'Fee Clearance', 'Exam Fees'],
    priorityDistribution: { critical: 12, high: 98, medium: 64, low: 22 },
    trendHistory: [
      { date: 'Oct 02', count: 42 },
      { date: 'Oct 03', count: 36 },
      { date: 'Oct 04', count: 30 },
      { date: 'Oct 05', count: 28 },
      { date: 'Oct 06', count: 24 },
      { date: 'Oct 07', count: 20 },
      { date: 'Oct 08', count: 16 },
    ],
    recentGrievances: [
      { id: 't-6', ticketNumber: 'GRV-2026-00411', title: 'Double payment deduction for hostel semester fee', studentName: 'Pooja Hegde', priority: 'HIGH', date: '1h ago' },
      { id: 't-7', ticketNumber: 'GRV-2026-00091', title: 'Double deduction on semester exam fee gateway', studentName: 'Vikram Rajput', priority: 'HIGH', date: '5h ago' },
    ],
  },
  {
    id: 'cls-04',
    name: 'Shuttle Route Timing & Punctuality',
    grievanceCount: 142,
    growthPercentage: 8,
    priority: 'MEDIUM',
    status: 'STABLE',
    statusLabel: 'Stable',
    trendDirection: 'FLAT',
    rootCauseSummary: 'Morning metro connection delays caused by municipal highway construction detours.',
    topSymptoms: [
      'Route 7 morning shuttle 20-30 min delay',
      'Overcrowding on south campus shuttle 2',
    ],
    affectedDepartments: ['Transport'],
    relatedCategories: ['Transport Logistics', 'Bus Routes'],
    priorityDistribution: { critical: 4, high: 24, medium: 74, low: 40 },
    trendHistory: [
      { date: 'Oct 02', count: 18 },
      { date: 'Oct 03', count: 22 },
      { date: 'Oct 04', count: 20 },
      { date: 'Oct 05', count: 19 },
      { date: 'Oct 06', count: 21 },
      { date: 'Oct 07', count: 22 },
      { date: 'Oct 08', count: 20 },
    ],
    recentGrievances: [
      { id: 't-8', ticketNumber: 'GRV-2026-00029', title: 'Morning Route 7 Shuttle Repeated 25-Minute Delay', studentName: 'Harsh Vardhan', priority: 'MEDIUM', date: '3h ago' },
    ],
  },
  {
    id: 'cls-05',
    name: 'Digital Library Journal Proxy Expiry',
    grievanceCount: 88,
    growthPercentage: 45,
    priority: 'MEDIUM',
    status: 'NEW',
    statusLabel: 'New Cluster',
    trendDirection: 'UP',
    rootCauseSummary: 'Institutional EZproxy SSL certificate renewal mismatch for IEEE & Springer databases.',
    topSymptoms: [
      'IEEE Xplore asks for individual credit card payment',
      'Proxy certificate error when accessing science direct off-campus',
    ],
    affectedDepartments: ['Library', 'Technical'],
    relatedCategories: ['Library Services', 'E-Journals'],
    priorityDistribution: { critical: 2, high: 18, medium: 46, low: 22 },
    trendHistory: [
      { date: 'Oct 02', count: 2 },
      { date: 'Oct 03', count: 4 },
      { date: 'Oct 04', count: 6 },
      { date: 'Oct 05', count: 12 },
      { date: 'Oct 06', count: 18 },
      { date: 'Oct 07', count: 22 },
      { date: 'Oct 08', count: 24 },
    ],
    recentGrievances: [
      { id: 't-9', ticketNumber: 'GRV-2026-00407', title: 'IEEE Xplore institutional access expired on terminals', studentName: 'Abhishek Roy', priority: 'MEDIUM', date: '6h ago' },
    ],
  },
  {
    id: 'cls-06',
    name: 'Biometric Attendance Logging Clashes',
    grievanceCount: 164,
    growthPercentage: 14,
    priority: 'HIGH',
    status: 'GROWING_RAPIDLY',
    statusLabel: 'Growing Rapidly',
    trendDirection: 'UP',
    rootCauseSummary: 'Time synchronization drift between Hall 301 readers and central academic ERP DB.',
    topSymptoms: [
      'Present marked as absent during 9 AM lecture',
      'Attendance percentage dropped below 75% due to scanner fault',
    ],
    affectedDepartments: ['Academic', 'Technical'],
    relatedCategories: ['Academics', 'Attendance'],
    priorityDistribution: { critical: 10, high: 62, medium: 72, low: 20 },
    trendHistory: [
      { date: 'Oct 02', count: 14 },
      { date: 'Oct 03', count: 18 },
      { date: 'Oct 04', count: 22 },
      { date: 'Oct 05', count: 24 },
      { date: 'Oct 06', count: 26 },
      { date: 'Oct 07', count: 30 },
      { date: 'Oct 08', count: 30 },
    ],
    recentGrievances: [
      { id: 't-10', ticketNumber: 'GRV-2026-00015', title: 'Biometric Attendance Discrepancy in CS-301 Midterm Eligibility', studentName: 'Gaurav Kulkarni', priority: 'HIGH', date: '2h ago' },
    ],
  },
];
