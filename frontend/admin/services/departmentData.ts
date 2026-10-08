import { PriorityLevel, GrievanceStatus } from '../types/domain';

export type DepartmentHealthStatus = 'HEALTHY' | 'ATTENTION' | 'CRITICAL';

export interface DepartmentTrendPoint {
  date: string;
  incoming: number;
  resolved: number;
}

export interface DepartmentCategoryShare {
  category: string;
  count: number;
  percentage: number;
}

export interface DepartmentPrioritySplit {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface DepartmentGrievanceItem {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  studentName: string;
  studentId: string;
  priority: PriorityLevel;
  priorityScore: number;
  status: GrievanceStatus;
  createdAt: string;
  slaTimeRemaining: string;
  slaHealth: 'HEALTHY' | 'AT_RISK' | 'BREACHED';
}

export interface DepartmentDetailData {
  id: string;
  name: string;
  code: string;
  headName: string;
  email: string;
  location: string;
  open: number;
  pending: number;
  resolved: number;
  escalated: number;
  totalGrievances: number;
  slaPercentage: number;
  resolutionRate: number;
  avgResponseTime: string;
  avgResolutionTime: string;
  avgResolutionHours: number;
  status: DepartmentHealthStatus;
  trends: DepartmentTrendPoint[];
  priorityDistribution: DepartmentPrioritySplit;
  categoryDistribution: DepartmentCategoryShare[];
  recentGrievances: DepartmentGrievanceItem[];
}

export interface DepartmentFilterState {
  departmentId: string;
  dateRange: string;
  status: string;
  priority: string;
  searchQuery: string;
}

export interface DepartmentTopMetrics {
  totalDepartments: number;
  totalGrievances: number;
  avgResolutionTime: string;
  overallSlaPercentage: number;
}

export const MOCK_DEPARTMENT_METRICS: DepartmentTopMetrics = {
  totalDepartments: 8,
  totalGrievances: 12482,
  avgResolutionTime: '4.8 hrs',
  overallSlaPercentage: 94.6,
};

export const MOCK_DEPARTMENTS: DepartmentDetailData[] = [
  {
    id: 'dept-tech',
    name: 'Technical',
    code: 'TECH',
    headName: 'Dr. M. S. Sundaram',
    email: 'tech.support@university.edu',
    location: 'Science & Computing Block, 3rd Floor',
    open: 42,
    pending: 16,
    resolved: 3120,
    escalated: 4,
    totalGrievances: 3182,
    slaPercentage: 96.8,
    resolutionRate: 98.1,
    avgResponseTime: '0.8 hrs',
    avgResolutionTime: '3.4 hrs',
    avgResolutionHours: 3.4,
    status: 'HEALTHY',
    trends: [
      { date: 'Oct 02', incoming: 18, resolved: 17 },
      { date: 'Oct 03', incoming: 22, resolved: 20 },
      { date: 'Oct 04', incoming: 28, resolved: 25 },
      { date: 'Oct 05', incoming: 16, resolved: 19 },
      { date: 'Oct 06', incoming: 31, resolved: 29 },
      { date: 'Oct 07', incoming: 35, resolved: 32 },
      { date: 'Oct 08', incoming: 26, resolved: 24 },
    ],
    priorityDistribution: { critical: 12, high: 48, medium: 142, low: 98 },
    categoryDistribution: [
      { category: 'Network & WiFi', count: 1240, percentage: 39 },
      { category: 'Lab Workstations', count: 860, percentage: 27 },
      { category: 'Software Licenses', count: 590, percentage: 19 },
      { category: 'Smart Classroom AV', count: 492, percentage: 15 },
    ],
    recentGrievances: [
      {
        id: 't-101',
        ticketNumber: 'GRV-2026-00001',
        title: 'Engineering Lab 3 Switch Burnout & PoE Terminal Breakdown',
        category: 'Lab Workstations',
        studentName: 'Aarav Sharma',
        studentId: 'CS-2024-042',
        priority: 'CRITICAL',
        priorityScore: 95,
        status: 'IN_PROGRESS',
        createdAt: '1h 35m ago',
        slaTimeRemaining: '45m remaining',
        slaHealth: 'AT_RISK',
      },
      {
        id: 't-102',
        ticketNumber: 'GRV-2026-00084',
        title: 'Central Library WiFi Authentication Gateway Timeout',
        category: 'Network & WiFi',
        studentName: 'Sneha Patil',
        studentId: 'EC-2023-118',
        priority: 'HIGH',
        priorityScore: 78,
        status: 'ASSIGNED',
        createdAt: '3h 10m ago',
        slaTimeRemaining: '2h 15m remaining',
        slaHealth: 'HEALTHY',
      },
      {
        id: 't-103',
        ticketNumber: 'GRV-2026-00072',
        title: 'MATLAB Distributed Cluster License Key Expired in CAD Lab',
        category: 'Software Licenses',
        studentName: 'Rohan Mehta',
        studentId: 'ME-2022-094',
        priority: 'MEDIUM',
        priorityScore: 56,
        status: 'RESOLUTION_PROPOSED',
        createdAt: '6h 40m ago',
        slaTimeRemaining: 'Completed',
        slaHealth: 'HEALTHY',
      },
    ],
  },
  {
    id: 'dept-support',
    name: 'Support',
    code: 'SUPP',
    headName: 'Ms. Anita Nair',
    email: 'helpdesk.support@university.edu',
    location: 'Central Administrative Building, Ground Floor',
    open: 28,
    pending: 12,
    resolved: 1840,
    escalated: 2,
    totalGrievances: 1882,
    slaPercentage: 95.4,
    resolutionRate: 97.8,
    avgResponseTime: '1.1 hrs',
    avgResolutionTime: '4.2 hrs',
    avgResolutionHours: 4.2,
    status: 'HEALTHY',
    trends: [
      { date: 'Oct 02', incoming: 12, resolved: 11 },
      { date: 'Oct 03', incoming: 15, resolved: 14 },
      { date: 'Oct 04', incoming: 18, resolved: 16 },
      { date: 'Oct 05', incoming: 10, resolved: 13 },
      { date: 'Oct 06', incoming: 22, resolved: 20 },
      { date: 'Oct 07', incoming: 25, resolved: 23 },
      { date: 'Oct 08', incoming: 19, resolved: 18 },
    ],
    priorityDistribution: { critical: 6, high: 24, medium: 94, low: 76 },
    categoryDistribution: [
      { category: 'Student ID Cards', count: 780, percentage: 41 },
      { category: 'Portal Account Access', count: 560, percentage: 30 },
      { category: 'Orientation & Inquiries', count: 320, percentage: 17 },
      { category: 'General Helpdesk', count: 222, percentage: 12 },
    ],
    recentGrievances: [
      {
        id: 't-201',
        ticketNumber: 'GRV-2026-00089',
        title: 'RFID Student ID Card Turnstile De-sync at North Gate',
        category: 'Student ID Cards',
        studentName: 'Kunal Verma',
        studentId: 'EE-2024-075',
        priority: 'MEDIUM',
        priorityScore: 62,
        status: 'UNDER_REVIEW',
        createdAt: '2h 15m ago',
        slaTimeRemaining: '3h 45m remaining',
        slaHealth: 'HEALTHY',
      },
      {
        id: 't-202',
        ticketNumber: 'GRV-2026-00067',
        title: 'Two-Factor Authentication Reset Loop on Student Portal',
        category: 'Portal Account Access',
        studentName: 'Diya Sen',
        studentId: 'BT-2023-031',
        priority: 'HIGH',
        priorityScore: 74,
        status: 'ASSIGNED',
        createdAt: '4h 30m ago',
        slaTimeRemaining: '1h 10m remaining',
        slaHealth: 'AT_RISK',
      },
    ],
  },
  {
    id: 'dept-accounts',
    name: 'Accounts',
    code: 'ACCT',
    headName: 'Mr. S. Ramanathan',
    email: 'finance.accounts@university.edu',
    location: 'Administrative Block, 1st Floor',
    open: 34,
    pending: 22,
    resolved: 1420,
    escalated: 5,
    totalGrievances: 1481,
    slaPercentage: 92.1,
    resolutionRate: 95.9,
    avgResponseTime: '2.4 hrs',
    avgResolutionTime: '6.5 hrs',
    avgResolutionHours: 6.5,
    status: 'ATTENTION',
    trends: [
      { date: 'Oct 02', incoming: 9, resolved: 8 },
      { date: 'Oct 03', incoming: 14, resolved: 11 },
      { date: 'Oct 04', incoming: 16, resolved: 13 },
      { date: 'Oct 05', incoming: 8, resolved: 10 },
      { date: 'Oct 06', incoming: 19, resolved: 16 },
      { date: 'Oct 07', incoming: 22, resolved: 17 },
      { date: 'Oct 08', incoming: 15, resolved: 14 },
    ],
    priorityDistribution: { critical: 8, high: 32, medium: 78, low: 52 },
    categoryDistribution: [
      { category: 'Fee Clearance & Receipts', count: 620, percentage: 42 },
      { category: 'Scholarship Disbursal', count: 410, percentage: 28 },
      { category: 'Caution Deposit Refund', count: 260, percentage: 18 },
      { category: 'Hostel Mess Billing', count: 191, percentage: 12 },
    ],
    recentGrievances: [
      {
        id: 't-301',
        ticketNumber: 'GRV-2026-00055',
        title: 'National Merit Scholarship Second Tranche Reconciliation Delay',
        category: 'Scholarship Disbursal',
        studentName: 'Tanvi Joshi',
        studentId: 'CH-2022-019',
        priority: 'HIGH',
        priorityScore: 81,
        status: 'ESCALATED',
        createdAt: '1d ago',
        slaTimeRemaining: '30m remaining',
        slaHealth: 'AT_RISK',
      },
      {
        id: 't-302',
        ticketNumber: 'GRV-2026-00091',
        title: 'Double Deduction on Semester Exam Fee Gateway',
        category: 'Fee Clearance & Receipts',
        studentName: 'Vikram Rajput',
        studentId: 'CS-2023-145',
        priority: 'HIGH',
        priorityScore: 76,
        status: 'IN_PROGRESS',
        createdAt: '5h ago',
        slaTimeRemaining: '1h 45m remaining',
        slaHealth: 'HEALTHY',
      },
    ],
  },
  {
    id: 'dept-admin',
    name: 'Administration',
    code: 'ADMIN',
    headName: 'Dr. Kavita Menon',
    email: 'registrar.office@university.edu',
    location: 'Main Administrative Complex, Level 2',
    open: 22,
    pending: 9,
    resolved: 1180,
    escalated: 1,
    totalGrievances: 1212,
    slaPercentage: 97.2,
    resolutionRate: 97.4,
    avgResponseTime: '1.4 hrs',
    avgResolutionTime: '3.9 hrs',
    avgResolutionHours: 3.9,
    status: 'HEALTHY',
    trends: [
      { date: 'Oct 02', incoming: 7, resolved: 7 },
      { date: 'Oct 03', incoming: 10, resolved: 9 },
      { date: 'Oct 04', incoming: 12, resolved: 11 },
      { date: 'Oct 05', incoming: 6, resolved: 8 },
      { date: 'Oct 06', incoming: 14, resolved: 13 },
      { date: 'Oct 07', incoming: 16, resolved: 15 },
      { date: 'Oct 08', incoming: 11, resolved: 11 },
    ],
    priorityDistribution: { critical: 4, high: 18, medium: 62, low: 48 },
    categoryDistribution: [
      { category: 'Bonafide & Migration Certs', count: 540, percentage: 45 },
      { category: 'Campus Security Badges', count: 320, percentage: 26 },
      { category: 'Event & Auditorium Booking', count: 210, percentage: 17 },
      { category: 'Lost & Found Claims', count: 142, percentage: 12 },
    ],
    recentGrievances: [
      {
        id: 't-401',
        ticketNumber: 'GRV-2026-00049',
        title: 'Emergency Passport Endorsement Verification Request',
        category: 'Bonafide & Migration Certs',
        studentName: 'Meera Namboodiri',
        studentId: 'ME-2021-088',
        priority: 'MEDIUM',
        priorityScore: 68,
        status: 'ASSIGNED',
        createdAt: '3h 50m ago',
        slaTimeRemaining: '4h 10m remaining',
        slaHealth: 'HEALTHY',
      },
    ],
  },
  {
    id: 'dept-library',
    name: 'Library',
    code: 'LIB',
    headName: 'Dr. P. Venkataraman',
    email: 'chief.librarian@university.edu',
    location: 'Central University Library Complex',
    open: 16,
    pending: 5,
    resolved: 980,
    escalated: 0,
    totalGrievances: 1001,
    slaPercentage: 98.6,
    resolutionRate: 97.9,
    avgResponseTime: '0.6 hrs',
    avgResolutionTime: '2.1 hrs',
    avgResolutionHours: 2.1,
    status: 'HEALTHY',
    trends: [
      { date: 'Oct 02', incoming: 5, resolved: 5 },
      { date: 'Oct 03', incoming: 8, resolved: 8 },
      { date: 'Oct 04', incoming: 10, resolved: 9 },
      { date: 'Oct 05', incoming: 4, resolved: 5 },
      { date: 'Oct 06', incoming: 11, resolved: 10 },
      { date: 'Oct 07', incoming: 12, resolved: 12 },
      { date: 'Oct 08', incoming: 9, resolved: 8 },
    ],
    priorityDistribution: { critical: 2, high: 12, medium: 46, low: 68 },
    categoryDistribution: [
      { category: 'Digital E-Journal Access', count: 480, percentage: 48 },
      { category: 'Book Circulation & Holds', count: 280, percentage: 28 },
      { category: 'Study Carrel Reservations', count: 150, percentage: 15 },
      { category: 'Print & Scanner Facilities', count: 91, percentage: 9 },
    ],
    recentGrievances: [
      {
        id: 't-501',
        ticketNumber: 'GRV-2026-00038',
        title: 'IEEE Xplore Institutional Proxy Gateway Token Revoked',
        category: 'Digital E-Journal Access',
        studentName: 'Abhishek Roy',
        studentId: 'CS-2023-012',
        priority: 'HIGH',
        priorityScore: 72,
        status: 'UNDER_REVIEW',
        createdAt: '1h 10m ago',
        slaTimeRemaining: '3h 50m remaining',
        slaHealth: 'HEALTHY',
      },
    ],
  },
  {
    id: 'dept-hostel',
    name: 'Hostel',
    code: 'HOST',
    headName: 'Prof. Arvind Nambiar',
    email: 'chief.warden@university.edu',
    location: 'Residential Life Office, Hostel Block A',
    open: 68,
    pending: 31,
    resolved: 2410,
    escalated: 8,
    totalGrievances: 2517,
    slaPercentage: 88.4,
    resolutionRate: 95.7,
    avgResponseTime: '2.8 hrs',
    avgResolutionTime: '7.8 hrs',
    avgResolutionHours: 7.8,
    status: 'CRITICAL',
    trends: [
      { date: 'Oct 02', incoming: 19, resolved: 15 },
      { date: 'Oct 03', incoming: 24, resolved: 18 },
      { date: 'Oct 04', incoming: 30, resolved: 22 },
      { date: 'Oct 05', incoming: 18, resolved: 17 },
      { date: 'Oct 06', incoming: 34, resolved: 26 },
      { date: 'Oct 07', incoming: 38, resolved: 29 },
      { date: 'Oct 08', incoming: 28, resolved: 21 },
    ],
    priorityDistribution: { critical: 18, high: 64, medium: 122, low: 78 },
    categoryDistribution: [
      { category: 'Water Supply & Plumbing', count: 980, percentage: 39 },
      { category: 'Electricity & Room Power', count: 680, percentage: 27 },
      { category: 'Mess Food Quality', count: 510, percentage: 20 },
      { category: 'Room Maintenance & Locks', count: 347, percentage: 14 },
    ],
    recentGrievances: [
      {
        id: 't-601',
        ticketNumber: 'GRV-2026-00002',
        title: 'Hostel Block D Drinking Water Cooler Turbidity & Rust Sediment',
        category: 'Water Supply & Plumbing',
        studentName: 'Pooja Hegde',
        studentId: 'BT-2023-019',
        priority: 'HIGH',
        priorityScore: 88,
        status: 'SUBMITTED',
        createdAt: '4h 25m ago',
        slaTimeRemaining: '25m overdue',
        slaHealth: 'BREACHED',
      },
      {
        id: 't-602',
        ticketNumber: 'GRV-2026-00044',
        title: 'Corridor Exhaust Fan Electrical Short & Burning Odor',
        category: 'Electricity & Room Power',
        studentName: 'Nitin Rao',
        studentId: 'CV-2024-061',
        priority: 'CRITICAL',
        priorityScore: 91,
        status: 'IN_PROGRESS',
        createdAt: '2h 10m ago',
        slaTimeRemaining: '1h 15m remaining',
        slaHealth: 'AT_RISK',
      },
    ],
  },
  {
    id: 'dept-transport',
    name: 'Transport',
    code: 'TRANS',
    headName: 'Mr. B. K. Yadav',
    email: 'fleet.manager@university.edu',
    location: 'Campus Motor Pool & Logistics Depot',
    open: 19,
    pending: 8,
    resolved: 710,
    escalated: 1,
    totalGrievances: 738,
    slaPercentage: 93.8,
    resolutionRate: 96.2,
    avgResponseTime: '1.6 hrs',
    avgResolutionTime: '5.1 hrs',
    avgResolutionHours: 5.1,
    status: 'ATTENTION',
    trends: [
      { date: 'Oct 02', incoming: 4, resolved: 4 },
      { date: 'Oct 03', incoming: 6, resolved: 5 },
      { date: 'Oct 04', incoming: 8, resolved: 7 },
      { date: 'Oct 05', incoming: 3, resolved: 4 },
      { date: 'Oct 06', incoming: 9, resolved: 8 },
      { date: 'Oct 07', incoming: 11, resolved: 10 },
      { date: 'Oct 08', incoming: 7, resolved: 7 },
    ],
    priorityDistribution: { critical: 3, high: 14, medium: 36, low: 42 },
    categoryDistribution: [
      { category: 'Route Timing & Punctuality', count: 320, percentage: 43 },
      { category: 'Shuttle Overcrowding', count: 210, percentage: 28 },
      { category: 'Bus Pass QR Validation', count: 120, percentage: 16 },
      { category: 'Driver Behavior & Safety', count: 88, percentage: 13 },
    ],
    recentGrievances: [
      {
        id: 't-701',
        ticketNumber: 'GRV-2026-00029',
        title: 'Morning Route 7 Shuttle Repeated 25-Minute Delay at Metro Point',
        category: 'Route Timing & Punctuality',
        studentName: 'Harsh Vardhan',
        studentId: 'ME-2023-112',
        priority: 'MEDIUM',
        priorityScore: 64,
        status: 'UNDER_REVIEW',
        createdAt: '3h ago',
        slaTimeRemaining: '2h 30m remaining',
        slaHealth: 'HEALTHY',
      },
    ],
  },
  {
    id: 'dept-academic',
    name: 'Academic',
    code: 'ACAD',
    headName: 'Dr. Meenakshi Iyer',
    email: 'dean.academics@university.edu',
    location: 'Dean of Academic Affairs, Block 1',
    open: 26,
    pending: 11,
    resolved: 1980,
    escalated: 3,
    totalGrievances: 2020,
    slaPercentage: 98.2,
    resolutionRate: 98.0,
    avgResponseTime: '0.9 hrs',
    avgResolutionTime: '3.6 hrs',
    avgResolutionHours: 3.6,
    status: 'HEALTHY',
    trends: [
      { date: 'Oct 02', incoming: 11, resolved: 11 },
      { date: 'Oct 03', incoming: 16, resolved: 15 },
      { date: 'Oct 04', incoming: 18, resolved: 17 },
      { date: 'Oct 05', incoming: 9, resolved: 11 },
      { date: 'Oct 06', incoming: 20, resolved: 19 },
      { date: 'Oct 07', incoming: 24, resolved: 23 },
      { date: 'Oct 08', incoming: 16, resolved: 15 },
    ],
    priorityDistribution: { critical: 5, high: 26, medium: 98, low: 72 },
    categoryDistribution: [
      { category: 'Attendance Discrepancy', count: 820, percentage: 41 },
      { category: 'Course Credit Transfer', count: 540, percentage: 27 },
      { category: 'Exam Schedule Clashes', count: 390, percentage: 19 },
      { category: 'Grading & Re-evaluation', count: 270, percentage: 13 },
    ],
    recentGrievances: [
      {
        id: 't-801',
        ticketNumber: 'GRV-2026-00015',
        title: 'Biometric Attendance Discrepancy in CS-301 Midterm Eligibility',
        category: 'Attendance Discrepancy',
        studentName: 'Gaurav Kulkarni',
        studentId: 'CS-2023-089',
        priority: 'HIGH',
        priorityScore: 79,
        status: 'IN_PROGRESS',
        createdAt: '2h 45m ago',
        slaTimeRemaining: '1h 15m remaining',
        slaHealth: 'HEALTHY',
      },
    ],
  },
];
