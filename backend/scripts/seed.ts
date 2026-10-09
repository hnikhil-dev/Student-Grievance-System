import { getAdminClient } from '../src/lib/supabase/admin';

async function main() {
  console.log('🌱 Starting database seeding...');
  const admin = getAdminClient();

  // 1. Departments
  console.log('Inserting departments...');
  const departments = [
    { id: 'a0000000-0000-0000-0000-000000000001', name: 'Information Technology', code: 'IT', description: 'Campus network, LMS, lab workstations, Wi-Fi and student portal services', is_active: true },
    { id: 'a0000000-0000-0000-0000-000000000002', name: 'Academic Affairs', code: 'ACADEMICS', description: 'Course registration, grading queries, hall tickets, timetable and examinations', is_active: true },
    { id: 'a0000000-0000-0000-0000-000000000003', name: 'Hostel & Housing', code: 'HOSTEL', description: 'Hostel rooms, water heaters, hygiene, mess coordination and security', is_active: true },
    { id: 'a0000000-0000-0000-0000-000000000004', name: 'Campus Maintenance', code: 'MAINTENANCE', description: 'Civil, electrical, plumbing, sanitation and classroom infrastructure', is_active: true },
    { id: 'a0000000-0000-0000-0000-000000000005', name: 'Transport Services', code: 'TRANSPORT', description: 'College shuttle buses, route timings, driver grievances and passes', is_active: true },
    { id: 'a0000000-0000-0000-0000-000000000006', name: 'Central Library', code: 'LIBRARY', description: 'Digital repository, book returns, study halls, noise control and journal access', is_active: true },
    { id: 'a0000000-0000-0000-0000-000000000007', name: 'Administration', code: 'ADMINISTRATION', description: 'Fee clearance, scholarships, certificates, ID cards and identity documents', is_active: true },
    { id: 'a0000000-0000-0000-0000-000000000008', name: 'Canteen & Food Services', code: 'CANTEEN', description: 'Cafeteria food hygiene, nutrition, pricing and cafeteria cleanliness', is_active: true },
    { id: 'a0000000-0000-0000-0000-000000000009', name: 'Student Affairs', code: 'STUDENT_AFFAIRS', description: 'Clubs, cultural events, anti-ragging cell, grievance council and welfare', is_active: true },
  ];

  for (const dept of departments) {
    await admin.from('departments').upsert(dept, { onConflict: 'code' });
  }

  // 2. SLA Rules
  console.log('Inserting default SLA rules...');
  const slaRules = [
    { id: 'b0000000-0000-0000-0000-000000000001', priority: 'CRITICAL', default_hours: 4, warning_threshold_percent: 75, escalation_role: 'DEPARTMENT_ADMIN', is_active: true },
    { id: 'b0000000-0000-0000-0000-000000000002', priority: 'HIGH', default_hours: 12, warning_threshold_percent: 75, escalation_role: 'DEPARTMENT_ADMIN', is_active: true },
    { id: 'b0000000-0000-0000-0000-000000000003', priority: 'MEDIUM', default_hours: 24, warning_threshold_percent: 75, escalation_role: 'DEPARTMENT_ADMIN', is_active: true },
    { id: 'b0000000-0000-0000-0000-000000000004', priority: 'LOW', default_hours: 48, warning_threshold_percent: 75, escalation_role: 'DEPARTMENT_ADMIN', is_active: true },
  ];

  for (const rule of slaRules) {
    await admin.from('sla_rules').upsert(rule, { onConflict: 'priority' });
  }

  // 3. Demo Profiles
  console.log('Inserting demo profiles...');
  const profiles = [
    { id: '00000000-0000-0000-0000-000000000001', full_name: 'Dr. Sarah Jenkins', email: 'superadmin@campus.edu', role: 'SUPER_ADMIN', department_id: null, student_id: null, phone: '+1-555-0101', is_active: true },
    { id: '00000000-0000-0000-0000-000000000002', full_name: 'Prof. Alan Vance', email: 'admin.it@campus.edu', role: 'DEPARTMENT_ADMIN', department_id: 'a0000000-0000-0000-0000-000000000001', student_id: null, phone: '+1-555-0102', is_active: true },
    { id: '00000000-0000-0000-0000-000000000003', full_name: 'Col. Ramesh Roy', email: 'admin.hostel@campus.edu', role: 'DEPARTMENT_ADMIN', department_id: 'a0000000-0000-0000-0000-000000000003', student_id: null, phone: '+1-555-0103', is_active: true },
    { id: '00000000-0000-0000-0000-000000000004', full_name: 'Mark Sterling', email: 'officer.it@campus.edu', role: 'OFFICER', department_id: 'a0000000-0000-0000-0000-000000000001', student_id: null, phone: '+1-555-0104', is_active: true },
    { id: '00000000-0000-0000-0000-000000000005', full_name: 'Deepa Sharma', email: 'officer.hostel@campus.edu', role: 'OFFICER', department_id: 'a0000000-0000-0000-0000-000000000003', student_id: null, phone: '+1-555-0105', is_active: true },
    { id: '00000000-0000-0000-0000-000000000006', full_name: 'Alex Mercer', email: 'student.alex@campus.edu', role: 'STUDENT', department_id: null, student_id: 'CS-2023-014', phone: '+1-555-0106', is_active: true },
    { id: '00000000-0000-0000-0000-000000000007', full_name: 'Priya Nair', email: 'student.priya@campus.edu', role: 'STUDENT', department_id: null, student_id: 'EC-2023-088', phone: '+1-555-0107', is_active: true },
    { id: '00000000-0000-0000-0000-000000000008', full_name: 'Rahul Verma', email: 'student.rahul@campus.edu', role: 'STUDENT', department_id: null, student_id: 'ME-2022-032', phone: '+1-555-0108', is_active: true },
  ];

  for (const prof of profiles) {
    await admin.from('profiles').upsert(prof as any, { onConflict: 'id' });
  }

  // 4. Grievance Clusters
  console.log('Inserting grievance clusters...');
  const clusters = [
    {
      id: 'c1000000-0000-0000-0000-000000000001',
      title: 'Computer Science Block Network & Hardware Outages',
      summary: 'Multiple complaints reporting core switch and access point drops across CS labs',
      category: 'IT',
      department_id: 'a0000000-0000-0000-0000-000000000001',
      priority: 'CRITICAL',
      affected_count: 60,
      status: 'ACTIVE',
    },
    {
      id: 'c1000000-0000-0000-0000-000000000002',
      title: 'Hostel Block 4 Water Supply & Plumbing Outages',
      summary: 'Overhead piping leakage impacting multiple dormitory corridors and washrooms',
      category: 'MAINTENANCE',
      department_id: 'a0000000-0000-0000-0000-000000000004',
      priority: 'HIGH',
      affected_count: 45,
      status: 'ACTIVE',
    },
  ];

  for (const cluster of clusters) {
    await admin.from('grievance_clusters').upsert(cluster as any, { onConflict: 'id' });
  }

  // 5. Rich Demo Grievances
  console.log('Inserting rich demo grievances for judge evaluation...');
  const now = new Date();
  const fourHoursAgo = new Date(now.getTime() - 4 * 3600 * 1000).toISOString();
  const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
  const dueIn2Hours = new Date(now.getTime() + 2 * 3600 * 1000).toISOString();
  const dueIn8Hours = new Date(now.getTime() + 8 * 3600 * 1000).toISOString();
  const dueIn18Hours = new Date(now.getTime() + 18 * 3600 * 1000).toISOString();
  const overdueBy1Hour = new Date(now.getTime() - 1 * 3600 * 1000).toISOString();

  const demoGrievances = [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      ticket_number: 'GRV-2026-00001',
      student_id: '00000000-0000-0000-0000-000000000006',
      title: 'Computer Lab 3 Core Switch Failure during Semester Project Submissions',
      description: 'All 60 workstations in Computer Lab 3 lost internet connectivity right before our capstone submission deadline. The rack switches are flashing red and no student can access GitHub or local staging repositories.',
      category: 'IT',
      subcategory: 'Hardware / Networking',
      priority: 'CRITICAL',
      priority_score: 92,
      priority_reasons: ['Critical lab outage during capstone freeze window', 'Mass cohort affected: 60 students', 'Rack hardware failure alert', 'Elevated urgency: IMMEDIATE'],
      status: 'ESCALATED',
      department_id: 'a0000000-0000-0000-0000-000000000001',
      assigned_to: '00000000-0000-0000-0000-000000000004',
      location: 'Science Block B, Room 304 (Lab 3)',
      affected_students: 60,
      severity: 'CRITICAL',
      urgency: 'IMMEDIATE',
      recurrence: true,
      is_confidential: false,
      is_anonymous: false,
      sla_hours: 4,
      due_at: overdueBy1Hour,
      cluster_id: 'c1000000-0000-0000-0000-000000000001',
      created_at: fourHoursAgo,
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      ticket_number: 'GRV-2026-00002',
      student_id: '00000000-0000-0000-0000-000000000006',
      title: 'Severe Water Pipe Rupture Flooding Corridor and Electrical Conduits',
      description: 'The main overhead water pipe has burst outside washroom 2B on the second floor of Hostel Block 4. High-pressure water is flooding into dormitory rooms and dripping onto electrical switchboards near the staircase.',
      category: 'MAINTENANCE',
      subcategory: 'Civil & Plumbing',
      priority: 'HIGH',
      priority_score: 82,
      priority_reasons: ['Hazardous water ingress near electrical panels', 'Severe residential living disruption', 'Affects 45 students in Block 4'],
      status: 'IN_PROGRESS',
      department_id: 'a0000000-0000-0000-0000-000000000004',
      assigned_to: '00000000-0000-0000-0000-000000000005',
      location: 'Boys Hostel Block 4, 2nd Floor Corridor',
      affected_students: 45,
      severity: 'HIGH',
      urgency: 'HIGH',
      recurrence: false,
      is_confidential: false,
      is_anonymous: false,
      sla_hours: 12,
      due_at: dueIn8Hours,
      cluster_id: 'c1000000-0000-0000-0000-000000000002',
      created_at: twoHoursAgo,
    },
    {
      id: 'c0000000-0000-0000-0000-000000000003',
      ticket_number: 'GRV-2026-00003',
      student_id: '00000000-0000-0000-0000-000000000006',
      title: 'Exam Conflict: CS-401 and CS-408 Scheduled Simultaneously',
      description: 'Both the mid-term examinations for Distributed Systems (CS-401) and Machine Learning (CS-408) have been scheduled for Friday at 10:00 AM in Examination Hall 2. 35 dual-major students cannot sit for two mandatory papers simultaneously.',
      category: 'ACADEMICS',
      subcategory: 'Examination Timetable',
      priority: 'HIGH',
      priority_score: 75,
      priority_reasons: ['Direct academic examination schedule clash', 'Affects 35 dual-major students', 'High institutional impact'],
      status: 'RESOLUTION_PROPOSED',
      department_id: 'a0000000-0000-0000-0000-000000000002',
      assigned_to: null,
      location: 'Examination Hall 2 / Academic Block A',
      affected_students: 35,
      severity: 'HIGH',
      urgency: 'HIGH',
      recurrence: false,
      is_confidential: false,
      is_anonymous: false,
      sla_hours: 12,
      due_at: dueIn2Hours,
      resolution_notes: 'Examination board approved rescheduling CS-408 (Machine Learning) to Saturday at 2:00 PM in Hall 4. Revised hall ticket issued to all 35 students.',
      created_at: fourHoursAgo,
    },
    {
      id: 'c0000000-0000-0000-0000-000000000004',
      ticket_number: 'GRV-2026-00004',
      student_id: '00000000-0000-0000-0000-000000000006',
      title: 'Overhead Ceiling Fan Sparking in Classroom 402',
      description: 'During the afternoon lecture in Room 402, the central ceiling fan began emitting loud grinding noises and intermittent sparks. Classes had to be temporarily suspended.',
      category: 'MAINTENANCE',
      subcategory: 'Electrical',
      priority: 'HIGH',
      priority_score: 74,
      priority_reasons: ['Classroom safety hazard', 'Academic lecture disrupted', '50 students relocated'],
      status: 'ASSIGNED',
      department_id: 'a0000000-0000-0000-0000-000000000004',
      assigned_to: '00000000-0000-0000-0000-000000000005',
      location: 'Academic Block 4, Room 402',
      affected_students: 50,
      severity: 'HIGH',
      urgency: 'HIGH',
      recurrence: false,
      is_confidential: false,
      is_anonymous: false,
      sla_hours: 12,
      due_at: dueIn18Hours,
      created_at: twoHoursAgo,
    },
  ];

  for (const g of demoGrievances) {
    await admin.from('grievances').upsert(g as any, { onConflict: 'id' });
  }

  // 6. Notifications for Student
  console.log('Inserting demo notifications...');
  const notifications = [
    {
      id: 'n1000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000006',
      grievance_id: 'c0000000-0000-0000-0000-000000000003',
      type: 'RESOLUTION_PROPOSED',
      title: 'Resolution Proposed for Exam Conflict',
      message: 'Academic Affairs has proposed a resolution: CS-408 has been moved to Saturday 2:00 PM. Please verify and confirm.',
      is_read: false,
      created_at: now.toISOString(),
    },
    {
      id: 'n1000000-0000-0000-0000-000000000002',
      user_id: '00000000-0000-0000-0000-000000000006',
      grievance_id: 'c0000000-0000-0000-0000-000000000001',
      type: 'ESCALATED',
      title: 'SLA Sentinel Escalated Grievance',
      message: 'Ticket GRV-2026-00001 has been escalated to Department Admin Prof. Alan Vance due to approaching SLA target.',
      is_read: false,
      created_at: twoHoursAgo,
    },
    {
      id: 'n1000000-0000-0000-0000-000000000003',
      user_id: '00000000-0000-0000-0000-000000000006',
      grievance_id: 'c0000000-0000-0000-0000-000000000002',
      type: 'ASSIGNED',
      title: 'Officer Assigned to Pipe Rupture',
      message: 'Officer Deepa Sharma has been dispatched to Boys Hostel Block 4 for on-site inspection.',
      is_read: true,
      created_at: fourHoursAgo,
    },
  ];

  for (const notif of notifications) {
    await admin.from('notifications').upsert(notif as any, { onConflict: 'id' });
  }

  // 7. Multi-Agent Execution Logs
  console.log('Inserting multi-agent execution traces...');
  const agentLogs = [
    {
      id: 'l1000000-0000-0000-0000-000000000001',
      grievance_id: 'c0000000-0000-0000-0000-000000000001',
      agent_name: 'TRIAGE_AGENT',
      action_taken: 'CLASSIFY_AND_SCORE',
      thought_process: '[INTENT ANALYSIS] Grievance text identified core switch outage during capstone submission freeze. Cohort size: 60 students. Multi-factor priority weighted at 92/100 (CRITICAL). Routed to IT department with 4-hour SLA.',
      confidence: 0.985,
      metadata: { priority: 'CRITICAL', score: 92, slaHours: 4 },
      created_at: fourHoursAgo,
    },
    {
      id: 'l1000000-0000-0000-0000-000000000002',
      grievance_id: 'c0000000-0000-0000-0000-000000000001',
      agent_name: 'SLA_SENTINEL',
      action_taken: 'ESCALATE_TICKET',
      thought_process: '[SLA MONITORING] Grievance GRV-2026-00001 breached 75% warning threshold without verified on-site fix. Sentinel autonomously initiated Level-1 administrative escalation to Department Admin Prof. Alan Vance.',
      confidence: 0.99,
      metadata: { level: 1, escalatedToRole: 'DEPARTMENT_ADMIN' },
      created_at: twoHoursAgo,
    },
    {
      id: 'l1000000-0000-0000-0000-000000000003',
      grievance_id: 'c0000000-0000-0000-0000-000000000003',
      agent_name: 'RESOLUTION_VERIFIER',
      action_taken: 'EVALUATE_RESOLUTION_PROOF',
      thought_process: '[RESOLUTION AUDIT] Academic Board submission verified: Rescheduling notice officially published for CS-408 with new hall tickets generated. Resolution proposed to student with closed-loop verification requested.',
      confidence: 0.94,
      metadata: { newExamTime: 'Saturday 2:00 PM' },
      created_at: twoHoursAgo,
    },
  ];

  for (const log of agentLogs) {
    await admin.from('agent_execution_logs').upsert(log as any, { onConflict: 'id' });
  }

  console.log('✅ Seed data processed successfully! Note: For full database schema and SQL execution, run supabase/migrations/ via Supabase CLI or SQL editor.');
}

main().catch((err) => {
  console.error('Seeding encountered notice (Check Supabase credentials in .env):', err.message);
});
