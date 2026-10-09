import { AdminRouteId } from '../types/navigation';

export type InsightType =
  | 'CRITICAL_INSIGHT'
  | 'TREND_INSIGHT'
  | 'SLA_INSIGHT'
  | 'DEPARTMENT_INSIGHT'
  | 'EMERGING_ISSUE'
  | 'RECOMMENDATION';

export type InsightPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFORMATIONAL';

export interface AiInsightItem {
  id: string;
  icon: string;
  title: string;
  type: InsightType;
  typeLabel: string;
  priority: InsightPriority;
  summary: string;
  whatHappened: string;
  whyAiThinksThis: string;
  evidence: string[];
  impactCohort: string;
  confidence: number; // 0 - 100
  recommendedAction: string;
  relatedRoute: AdminRouteId;
  relatedActionLabel: string;
  affectedDepartments: string[];
  detectedAt: string;
}

export const MOCK_AI_INSIGHTS: AiInsightItem[] = [
  {
    id: 'ins-01',
    icon: 'alert',
    title: 'Surging SSO Authentication Failures During Midterms',
    type: 'EMERGING_ISSUE',
    typeLabel: 'Emerging Issue',
    priority: 'CRITICAL',
    summary: 'Authentication-related grievances increased 34% over the last 7 days due to LDAP identity broker session timeouts.',
    whatHappened: '428 students reported 504 gateway timeouts when attempting to view exam timetables and download hall tickets.',
    whyAiThinksThis: 'High frequency cluster analysis matched semantic keywords across 428 tickets submitted in identical time windows.',
    evidence: [
      '34% weekly grievance intake spike mapped to identity broker subnet',
      'Average ticket resolution time jumped from 1.2h to 3.8h in IT queue',
      'Correlated with CS-301 and EC-202 exam eligibility release schedules',
    ],
    impactCohort: '420+ Engineering and Computing students',
    confidence: 91,
    recommendedAction: 'Scale LDAP token broker pod replicas and dispatch immediate announcement advising browser cache purge.',
    relatedRoute: 'clusters',
    relatedActionLabel: 'View Cluster',
    affectedDepartments: ['Technical', 'Support'],
    detectedAt: '25m ago',
  },
  {
    id: 'ins-02',
    icon: 'clock',
    title: 'Hostel Sector Approaching Severe SLA Breach Risk',
    type: 'SLA_INSIGHT',
    typeLabel: 'SLA Insight',
    priority: 'CRITICAL',
    summary: 'Residential hostel facilities SLA compliance has fallen to 88.4%, 6.6% below the university compliance threshold.',
    whatHappened: 'Multiple drinking water contamination tickets in Block D remained unassigned for > 2 hours during shift rotation.',
    whyAiThinksThis: 'SLA Sentinel Watchdog detected 14 tickets in the warning zone with only 2 plumbing technicians logged on duty.',
    evidence: [
      'Hostel resolution rate degraded from 94% to 88.4% in current term',
      'Average response latency increased from 1.5h to 2.8h',
      '68 active open tickets backlog with 8 active Level-2 escalations',
    ],
    impactCohort: '120 Resident students in Hostel Block D',
    confidence: 94,
    recommendedAction: 'Reassign cross-departmental maintenance contractor team and dispatch bottled water reserves.',
    relatedRoute: 'sla',
    relatedActionLabel: 'Review SLA Radar',
    affectedDepartments: ['Hostel', 'Maintenance'],
    detectedAt: '1h ago',
  },
  {
    id: 'ins-03',
    icon: 'lightbulb',
    title: 'High Duplicate Inflow on Fee Double-Deduction Inquiries',
    type: 'RECOMMENDATION',
    typeLabel: 'Recommendation',
    priority: 'HIGH',
    summary: '94% duplicate similarity detected across 38 incoming tuition fee receipt tickets.',
    whatHappened: 'Students refreshing the bank redirect page triggered multiple simultaneous transaction queries in student accounts.',
    whyAiThinksThis: 'Embedding matching identified identical bank clearing codes and transaction ID prefixes with 89-96% similarity.',
    evidence: [
      '24 candidate pairs pending merge authorization in Duplicate Detection',
      'Shared webhook settlement delay from HDFC acquiring gateway',
    ],
    impactCohort: '38 Individual student bank transfers',
    confidence: 89,
    recommendedAction: 'Bulk-merge candidate duplicates into master incident and configure automated bank reconciliation notice.',
    relatedRoute: 'duplicates',
    relatedActionLabel: 'Review Duplicates',
    affectedDepartments: ['Accounts'],
    detectedAt: '2h ago',
  },
  {
    id: 'ins-04',
    icon: 'landmark',
    title: 'Academic Wing Achieving Benchmark Turnaround Velocity',
    type: 'DEPARTMENT_INSIGHT',
    typeLabel: 'Department Insight',
    priority: 'INFORMATIONAL',
    summary: 'Academic & Examination department resolved 98.1% of grievances within 3.6 hours, leading campus metrics.',
    whatHappened: 'Fast automated classification of biometric attendance inquiries allowed proctors to verify sensor raw logs rapidly.',
    whyAiThinksThis: 'Longitudinal resolution time analysis demonstrates consistent sub-4h turnaround across 2,020 total tickets.',
    evidence: [
      '98.6% SLA compliance rate maintained for 30 consecutive days',
      'Average initial response time under 54 minutes',
    ],
    impactCohort: 'All academic student cohorts',
    confidence: 96,
    recommendedAction: 'Adopt the Academic wing triage routing rules as institutional standard template for other departments.',
    relatedRoute: 'departments',
    relatedActionLabel: 'View Department',
    affectedDepartments: ['Academic'],
    detectedAt: '3h ago',
  },
  {
    id: 'ins-05',
    icon: 'trending-up',
    title: 'Library Digital Proxy Renewal Expiry Pattern',
    type: 'TREND_INSIGHT',
    typeLabel: 'Trend Insight',
    priority: 'MEDIUM',
    summary: 'Predictive alert: Digital e-journal license tokens expire every 90 days, triggering recurring quarterly complaint spikes.',
    whatHappened: 'Quarterly pattern identified: 88 complaints regarding IEEE and Springer off-campus access emerged this week.',
    whyAiThinksThis: 'Time-series similarity matched identical quarterly complaint peaks in October 2025 and January 2026.',
    evidence: [
      '45% weekly grievance surge in Library category',
      '100% of reported errors point to EZproxy SSL authentication gateway',
    ],
    impactCohort: 'Postgraduate research scholars & final-year students',
    confidence: 88,
    recommendedAction: 'Initiate proactive automated proxy token renewal 14 days before certificate expiration.',
    relatedRoute: 'analytics',
    relatedActionLabel: 'Inspect Analytics',
    affectedDepartments: ['Library', 'Technical'],
    detectedAt: '5h ago',
  },
];
