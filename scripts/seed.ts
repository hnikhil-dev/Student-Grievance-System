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

  console.log('✅ Seed data processed successfully! Note: For full database schema and SQL execution, run supabase/migrations/ via Supabase CLI or SQL editor.');
}

main().catch((err) => {
  console.error('Seeding encountered notice (Check Supabase credentials in .env):', err.message);
});
