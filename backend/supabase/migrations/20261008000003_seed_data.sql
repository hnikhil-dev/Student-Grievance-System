-- ==============================================================================
-- SMART STUDENT GRIEVANCE MANAGEMENT SYSTEM
-- Migration 03: Seed Realistic Departments, SLA Rules, Users & Grievances
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEED DEPARTMENTS
-- ------------------------------------------------------------------------------

INSERT INTO departments (id, name, code, description, is_active) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Information Technology', 'IT', 'Campus network, LMS, lab workstations, Wi-Fi and student portal services', true),
    ('a0000000-0000-0000-0000-000000000002', 'Academic Affairs', 'ACADEMICS', 'Course registration, grading queries, hall tickets, timetable and examinations', true),
    ('a0000000-0000-0000-0000-000000000003', 'Hostel & Housing', 'HOSTEL', 'Hostel rooms, water heaters, hygiene, mess coordination and security', true),
    ('a0000000-0000-0000-0000-000000000004', 'Campus Maintenance', 'MAINTENANCE', 'Civil, electrical, plumbing, sanitation and classroom infrastructure', true),
    ('a0000000-0000-0000-0000-000000000005', 'Transport Services', 'TRANSPORT', 'College shuttle buses, route timings, driver grievances and passes', true),
    ('a0000000-0000-0000-0000-000000000006', 'Central Library', 'LIBRARY', 'Digital repository, book returns, study halls, noise control and journal access', true),
    ('a0000000-0000-0000-0000-000000000007', 'Administration', 'ADMINISTRATION', 'Fee clearance, scholarships, certificates, ID cards and identity documents', true),
    ('a0000000-0000-0000-0000-000000000008', 'Canteen & Food Services', 'CANTEEN', 'Cafeteria food hygiene, nutrition, pricing and cafeteria cleanliness', true),
    ('a0000000-0000-0000-0000-000000000009', 'Student Affairs', 'STUDENT_AFFAIRS', 'Clubs, cultural events, anti-ragging cell, grievance council and welfare', true)
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ------------------------------------------------------------------------------
-- 2. SEED SLA RULES
-- ------------------------------------------------------------------------------

INSERT INTO sla_rules (id, priority, default_hours, warning_threshold_percent, escalation_role, is_active) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'CRITICAL', 4, 75, 'DEPARTMENT_ADMIN', true),
    ('b0000000-0000-0000-0000-000000000002', 'HIGH', 12, 75, 'DEPARTMENT_ADMIN', true),
    ('b0000000-0000-0000-0000-000000000003', 'MEDIUM', 24, 75, 'DEPARTMENT_ADMIN', true),
    ('b0000000-0000-0000-0000-000000000004', 'LOW', 48, 75, 'DEPARTMENT_ADMIN', true)
ON CONFLICT (priority) DO UPDATE
SET default_hours = EXCLUDED.default_hours, warning_threshold_percent = EXCLUDED.warning_threshold_percent;

-- ------------------------------------------------------------------------------
-- 3. SEED DEMO USERS IN AUTH & PROFILES
-- ------------------------------------------------------------------------------

-- Safely insert demo users into auth.users if supported by the instance
DO $$
DECLARE
    user_rec RECORD;
    demo_users CONSTANT jsonb := '[
        {"id": "00000000-0000-0000-0000-000000000001", "email": "superadmin@campus.edu", "name": "Dr. Sarah Jenkins", "role": "SUPER_ADMIN", "dept": null, "student_id": null},
        {"id": "00000000-0000-0000-0000-000000000002", "email": "admin.it@campus.edu", "name": "Prof. Alan Vance", "role": "DEPARTMENT_ADMIN", "dept": "a0000000-0000-0000-0000-000000000001", "student_id": null},
        {"id": "00000000-0000-0000-0000-000000000003", "email": "admin.hostel@campus.edu", "name": "Warden Col. Ramesh Roy", "role": "DEPARTMENT_ADMIN", "dept": "a0000000-0000-0000-0000-000000000003", "student_id": null},
        {"id": "00000000-0000-0000-0000-000000000004", "email": "officer.it@campus.edu", "name": "Mark Sterling", "role": "OFFICER", "dept": "a0000000-0000-0000-0000-000000000001", "student_id": null},
        {"id": "00000000-0000-0000-0000-000000000005", "email": "officer.hostel@campus.edu", "name": "Deepa Sharma", "role": "OFFICER", "dept": "a0000000-0000-0000-0000-000000000003", "student_id": null},
        {"id": "00000000-0000-0000-0000-000000000006", "email": "student.alex@campus.edu", "name": "Alex Mercer", "role": "STUDENT", "dept": null, "student_id": "CS-2023-014"},
        {"id": "00000000-0000-0000-0000-000000000007", "email": "student.priya@campus.edu", "name": "Priya Nair", "role": "STUDENT", "dept": null, "student_id": "EC-2023-088"},
        {"id": "00000000-0000-0000-0000-000000000008", "email": "student.rahul@campus.edu", "name": "Rahul Verma", "role": "STUDENT", "dept": null, "student_id": "ME-2022-032"}
    ]'::jsonb;
BEGIN
    FOR user_rec IN SELECT * FROM jsonb_to_recordset(demo_users) AS x(id UUID, email TEXT, name TEXT, role user_role, dept UUID, student_id TEXT)
    LOOP
        -- Insert into auth.users if auth schema exists
        BEGIN
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
            VALUES (
                user_rec.id,
                user_rec.email,
                '$2a$10$demoHashedPasswordDummyStringForTestingPurposes12345678',
                NOW(),
                jsonb_build_object('full_name', user_rec.name),
                NOW(),
                NOW()
            )
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION
            WHEN undefined_table THEN
                -- In case auth.users table is not accessible in this context
                null;
        END;

        -- Insert into public.profiles
        INSERT INTO profiles (id, full_name, email, role, department_id, student_id, phone, is_active)
        VALUES (
            user_rec.id,
            user_rec.name,
            user_rec.email,
            user_rec.role,
            user_rec.dept,
            user_rec.student_id,
            '+1-555-010' || substring(user_rec.id::text from 36 for 1),
            true
        )
        ON CONFLICT (id) DO UPDATE
        SET full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            department_id = EXCLUDED.department_id,
            student_id = EXCLUDED.student_id;
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- 4. SEED REALISTIC GRIEVANCES
-- ------------------------------------------------------------------------------

INSERT INTO grievances (
    id, ticket_number, student_id, title, description, category, subcategory,
    priority, priority_score, priority_reasons, status, department_id, assigned_to,
    location, affected_students, severity, urgency, recurrence, is_confidential, is_anonymous,
    sla_hours, due_at, created_at, updated_at
) VALUES
-- 1. CRITICAL IT Issue - Under In Progress
(
    'c0000000-0000-0000-0000-000000000001',
    'GRV-2026-00001',
    '00000000-0000-0000-0000-000000000006',
    'Computer Lab 3 Core Switch Failure during Semester Project Submissions',
    'All 60 machines in Lab 3 lost internet and local server access. Tomorrow is the final capstone project code freeze. Students cannot test or upload build deliverables.',
    'IT',
    'Network Outage',
    'CRITICAL',
    95,
    '["More than 50 students affected", "Critical semester submission deadline within 24h", "Entire facility network down"]'::jsonb,
    'IN_PROGRESS',
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    'Engineering Block B, 3rd Floor, Lab 3',
    60,
    'CRITICAL',
    'IMMEDIATE',
    false,
    false,
    false,
    4,
    NOW() + INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '30 minutes'
),
-- 2. CRITICAL Hostel Issue - Overdue / Escalated
(
    'c0000000-0000-0000-0000-000000000002',
    'GRV-2026-00002',
    '00000000-0000-0000-0000-000000000007',
    'Drinking Water Contamination in Block D Hostel Cooler',
    'The water dispenser on Floor 2 of Girls Hostel Block D is dispensing discolored yellowish water with strong sulfur odor. Multiple residents reported stomach distress.',
    'HOSTEL',
    'Water & Sanitation',
    'CRITICAL',
    98,
    '["Health and safety hazard", "Over 120 residents dependent on cooler", "Immediate medical concern"]'::jsonb,
    'ESCALATED',
    'a0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000005',
    'Girls Hostel Block D, Floor 2 Cooler Area',
    120,
    'CRITICAL',
    'IMMEDIATE',
    true,
    false,
    false,
    4,
    NOW() - INTERVAL '1 hour', -- OVERDUE!
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '10 minutes'
),
-- 3. HIGH Academic Issue - Submitted
(
    'c0000000-0000-0000-0000-000000000003',
    'GRV-2026-00003',
    '00000000-0000-0000-0000-000000000008',
    'Discrepancy in Midterm Grade Publication on Portal',
    'My Database Systems midterm score is showing as Absent (0/50) even though I signed the physical attendance sheet and submitted the paper to Proctor Dr. Clark.',
    'ACADEMICS',
    'Grade Evaluation',
    'HIGH',
    75,
    '["Academic record error", "Prerequisite for next term registration affected"]'::jsonb,
    'SUBMITTED',
    'a0000000-0000-0000-0000-000000000002',
    null,
    'Academic Affairs Examination Branch',
    1,
    'HIGH',
    'HIGH',
    false,
    false,
    false,
    12,
    NOW() + INTERVAL '10 hours',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
),
-- 4. HIGH Maintenance Issue - Assigned
(
    'c0000000-0000-0000-0000-000000000004',
    'GRV-2026-00004',
    '00000000-0000-0000-0000-000000000006',
    'Overhead Ceiling Fan Sparking in Classroom 402',
    'The rear ceiling fan made loud grinding noises and emitted smoke and sparks during today morning lecture. Power was switched off by the instructor.',
    'MAINTENANCE',
    'Electrical Safety',
    'HIGH',
    82,
    '["Fire safety hazard", "Classroom in daily operation", "High urgency"]'::jsonb,
    'ASSIGNED',
    'a0000000-0000-0000-0000-000000000004',
    null,
    'Main Building, Classroom 402',
    45,
    'HIGH',
    'IMMEDIATE',
    false,
    false,
    false,
    12,
    NOW() + INTERVAL '8 hours',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '1 hour'
),
-- 5. MEDIUM Canteen Issue - Under Review
(
    'c0000000-0000-0000-0000-000000000005',
    'GRV-2026-00005',
    '00000000-0000-0000-0000-000000000007',
    'Unregulated Pricing and Lack of Clean Cutlery in South Wing Cafeteria',
    'The prices listed on the official mess board do not match POS terminal charges. Utensils had grease stains during lunch service today.',
    'CANTEEN',
    'Hygiene & Billing',
    'MEDIUM',
    55,
    '["General student convenience", "Hygiene standard requirement"]'::jsonb,
    'UNDER_REVIEW',
    'a0000000-0000-0000-0000-000000000008',
    null,
    'South Wing Cafeteria',
    150,
    'MODERATE',
    'MEDIUM',
    true,
    false,
    false,
    24,
    NOW() + INTERVAL '20 hours',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '4 hours'
),
-- 6. HIGH Transport Issue - Resolution Proposed (Awaiting Student Verification)
(
    'c0000000-0000-0000-0000-000000000006',
    'GRV-2026-00006',
    '00000000-0000-0000-0000-000000000008',
    'Route 12 Shuttle Bus Skipping North Metro Station Pickups',
    'The 7:45 AM shuttle has consistently departed 10 minutes early or bypassed the North Metro pickup stop, stranding over 30 day-scholar students.',
    'TRANSPORT',
    'Bus Schedule',
    'HIGH',
    78,
    '["Persistent recurring route skipping", "30+ day-scholars late to morning lectures"]'::jsonb,
    'STUDENT_VERIFICATION',
    'a0000000-0000-0000-0000-000000000005',
    null,
    'North Metro Shuttle Stop',
    35,
    'HIGH',
    'HIGH',
    true,
    false,
    false,
    12,
    NOW() + INTERVAL '4 hours',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '15 minutes'
),
-- 7. MEDIUM IT Issue - Closed with Feedback
(
    'c0000000-0000-0000-0000-000000000007',
    'GRV-2026-00007',
    '00000000-0000-0000-0000-000000000006',
    'Campus Wi-Fi eduroam authentication certificate expired on iOS devices',
    'Students cannot connect to eduroam after radius certificate renewal on Sunday. Request updated configuration profile.',
    'IT',
    'Wireless Access',
    'MEDIUM',
    52,
    '["Affects iOS users", "Known configuration profile issue"]'::jsonb,
    'CLOSED',
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    'Campus-wide Wi-Fi APs',
    200,
    'MODERATE',
    'MEDIUM',
    false,
    false,
    false,
    24,
    NOW() - INTERVAL '10 hours',
    NOW() - INTERVAL '30 hours',
    NOW() - INTERVAL '5 hours'
),
-- 8. LOW Library Issue - Reopened by Student
(
    'c0000000-0000-0000-0000-000000000008',
    'GRV-2026-00008',
    '00000000-0000-0000-0000-000000000007',
    'Broken Air Conditioning Unit in 2nd Floor Silent Reading Room',
    'The AC unit was marked resolved yesterday, but it continues to blow warm air and leak condensate on table 14.',
    'LIBRARY',
    'Air Conditioning',
    'LOW',
    35,
    '["Thermal comfort in study zone", "Previous fix ineffective"]'::jsonb,
    'REOPENED',
    'a0000000-0000-0000-0000-000000000006',
    null,
    'Central Library, 2nd Floor Room 2B',
    20,
    'LOW',
    'LOW',
    true,
    false,
    false,
    48,
    NOW() + INTERVAL '30 hours',
    NOW() - INTERVAL '36 hours',
    NOW() - INTERVAL '2 hours'
)
ON CONFLICT (ticket_number) DO NOTHING;

-- Update resolution timestamps on closed grievance
UPDATE grievances
SET resolved_at = NOW() - INTERVAL '6 hours',
    closed_at = NOW() - INTERVAL '5 hours',
    resolution_notes = 'Pushed renewed 802.1X Root CA profile link to campus IT portal and updated DNS records.'
WHERE id = 'c0000000-0000-0000-0000-000000000007';

UPDATE grievances
SET resolved_at = NOW() - INTERVAL '20 minutes',
    resolution_notes = 'Issued formal memo to Route 12 contractor; GPS telemetry tracker reset and substitute driver deployed.'
WHERE id = 'c0000000-0000-0000-0000-000000000006';

-- ------------------------------------------------------------------------------
-- 5. SEED ASSIGNMENTS
-- ------------------------------------------------------------------------------

INSERT INTO grievance_assignments (grievance_id, department_id, officer_id, assigned_by, notes) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'High priority Lab 3 switch outage. Hardware replacement dispatch ordered.'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000003',
    'Immediate inspection of Block D cooler and plumbing connection.'
),
(
    'c0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'Resolved radius certificate distribution profile.'
);

-- ------------------------------------------------------------------------------
-- 6. SEED COMMENTS
-- ------------------------------------------------------------------------------

INSERT INTO grievance_comments (grievance_id, user_id, message, is_internal) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    'I have arrived at Lab 3. The 48-port Cisco Gigabit switch power supply failed. Getting a spare from IT inventory.',
    false
),
(
    'c0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    'INTERNAL NOTE: Replacement unit serial #SW-4089 being configured on VLAN 20.',
    true
),
(
    'c0000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000008',
    'Thank you. We will check the 7:45 AM shuttle tomorrow morning to verify the pickup occurs on time.',
    false
);

-- ------------------------------------------------------------------------------
-- 7. SEED STATUS HISTORY
-- ------------------------------------------------------------------------------

INSERT INTO grievance_status_history (grievance_id, old_status, new_status, changed_by, reason) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    null,
    'SUBMITTED',
    '00000000-0000-0000-0000-000000000006',
    'Grievance logged by student'
),
(
    'c0000000-0000-0000-0000-000000000001',
    'SUBMITTED',
    'ASSIGNED',
    '00000000-0000-0000-0000-000000000002',
    'Assigned to IT Network Officer Mark Sterling'
),
(
    'c0000000-0000-0000-0000-000000000001',
    'ASSIGNED',
    'IN_PROGRESS',
    '00000000-0000-0000-0000-000000000004',
    'Officer on-site diagnosing hardware'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'IN_PROGRESS',
    'ESCALATED',
    '00000000-0000-0000-0000-000000000001',
    'CRITICAL SLA breach: 4 hours elapsed without certified water purification clearance'
),
(
    'c0000000-0000-0000-0000-000000000007',
    'STUDENT_VERIFICATION',
    'CLOSED',
    '00000000-0000-0000-0000-000000000006',
    'Student verified Wi-Fi works seamlessly with new certificate'
);

-- ------------------------------------------------------------------------------
-- 8. SEED ESCALATIONS
-- ------------------------------------------------------------------------------

INSERT INTO grievance_escalations (grievance_id, level, escalated_from, escalated_to, escalated_to_role, reason, sla_breached) VALUES
(
    'c0000000-0000-0000-0000-000000000002',
    1,
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000003',
    'DEPARTMENT_ADMIN',
    'Breached 4-hour SLA threshold on health safety critical hazard.',
    true
);

-- ------------------------------------------------------------------------------
-- 9. SEED FEEDBACK
-- ------------------------------------------------------------------------------

INSERT INTO grievance_feedback (grievance_id, student_id, rating, comment) VALUES
(
    'c0000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000006',
    5,
    'Quick fix! Instructions for installing the root certificate profile were very easy to follow.'
)
ON CONFLICT (grievance_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 10. SEED NOTIFICATIONS
-- ------------------------------------------------------------------------------

INSERT INTO notifications (user_id, grievance_id, type, title, message, is_read) VALUES
(
    '00000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000001',
    'STATUS_UPDATE',
    'Grievance In Progress',
    'Your grievance GRV-2026-00001 is now being actively worked on by Mark Sterling.',
    false
),
(
    '00000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000002',
    'SLA_BREACH',
    'CRITICAL SLA Breached: Hostel Water Grievance',
    'Grievance GRV-2026-00002 has breached the 4-hour SLA. Immediate intervention required.',
    false
),
(
    '00000000-0000-0000-0000-000000000008',
    'c0000000-0000-0000-0000-000000000006',
    'VERIFICATION_REQUIRED',
    'Resolution Proposed: Action Required',
    'Officer has submitted a resolution for GRV-2026-00006. Please verify if the issue is solved.',
    false
);
