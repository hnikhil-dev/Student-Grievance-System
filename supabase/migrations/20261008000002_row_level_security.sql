-- ==============================================================================
-- SMART STUDENT GRIEVANCE MANAGEMENT SYSTEM
-- Migration 02: Row Level Security (RLS) & Authorization Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HELPER FUNCTIONS FOR RLS (Security Definer with search_path secured)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_current_user_department()
RETURNS UUID AS $$
    SELECT department_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_department_admin_for(target_dept_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND (role = 'SUPER_ADMIN' OR (role = 'DEPARTMENT_ADMIN' AND department_id = target_dept_id))
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_assigned_or_dept_officer(target_grv_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM grievances g
        JOIN profiles p ON p.id = auth.uid()
        WHERE g.id = target_grv_id
          AND (
              p.role = 'SUPER_ADMIN'
              OR (p.role = 'DEPARTMENT_ADMIN' AND g.department_id = p.department_id)
              OR (p.role = 'OFFICER' AND (g.assigned_to = p.id OR g.department_id = p.department_id))
          )
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION can_view_grievance(target_grv_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM grievances g
        JOIN profiles p ON p.id = auth.uid()
        WHERE g.id = target_grv_id
          AND (
              p.role = 'SUPER_ADMIN'
              OR (p.role = 'DEPARTMENT_ADMIN' AND g.department_id = p.department_id)
              OR (p.role = 'OFFICER' AND (g.assigned_to = p.id OR g.department_id = p.department_id))
              OR (g.student_id = p.id)
          )
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ------------------------------------------------------------------------------

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievance_feedback ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. POLICIES: DEPARTMENTS
-- ------------------------------------------------------------------------------

-- Everyone authenticated can view active departments
DROP POLICY IF EXISTS "Departments: Authenticated users can view active departments" ON departments;
CREATE POLICY "Departments: Authenticated users can view active departments"
ON departments FOR SELECT
TO authenticated
USING (is_active = true OR is_super_admin());

-- Only super admins can insert/update/delete departments
DROP POLICY IF EXISTS "Departments: Only Super Admin can mutate departments" ON departments;
CREATE POLICY "Departments: Only Super Admin can mutate departments"
ON departments FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- ------------------------------------------------------------------------------
-- 4. POLICIES: PROFILES
-- ------------------------------------------------------------------------------

-- Users can read their own profile, staff can read profiles for routing/officer assignment
DROP POLICY IF EXISTS "Profiles: View own profile or staff view all" ON profiles;
CREATE POLICY "Profiles: View own profile or staff view all"
ON profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid()
    OR get_current_user_role() IN ('OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN')
);

-- Users can update their own personal info (avatar, phone, etc.)
DROP POLICY IF EXISTS "Profiles: Users can update their own details" ON profiles;
CREATE POLICY "Profiles: Users can update their own details"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Prevent users from elevating their own role via trigger
CREATE OR REPLACE FUNCTION prevent_profile_role_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role AND NOT is_super_admin() THEN
        RAISE EXCEPTION 'Only SUPER_ADMIN can modify user roles';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_profile_role_self_escalation ON profiles;
CREATE TRIGGER trg_profile_role_self_escalation
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_profile_role_self_escalation();

-- ------------------------------------------------------------------------------
-- 5. POLICIES: GRIEVANCES
-- ------------------------------------------------------------------------------

-- SELECT Policy:
-- - Students view their own grievances
-- - Officers view grievances assigned to them OR in their department
-- - Dept Admins view their department grievances
-- - Super Admins view all
DROP POLICY IF EXISTS "Grievances: View permitted grievances" ON grievances;
CREATE POLICY "Grievances: View permitted grievances"
ON grievances FOR SELECT
TO authenticated
USING (
    student_id = auth.uid()
    OR get_current_user_role() = 'SUPER_ADMIN'
    OR (get_current_user_role() = 'DEPARTMENT_ADMIN' AND department_id = get_current_user_department())
    OR (get_current_user_role() = 'OFFICER' AND (assigned_to = auth.uid() OR department_id = get_current_user_department()))
);

-- INSERT Policy:
-- Authenticated students (or staff) can insert a grievance for themselves
DROP POLICY IF EXISTS "Grievances: Students can submit grievance" ON grievances;
CREATE POLICY "Grievances: Students can submit grievance"
ON grievances FOR INSERT
TO authenticated
WITH CHECK (
    student_id = auth.uid()
    AND status = 'SUBMITTED'
);

-- UPDATE Policy:
-- - Staff (Officers, Dept Admins, Super Admins) can update according to their scope
-- - Students can ONLY update their own grievance when in STUDENT_VERIFICATION to CLOSED or REOPENED
DROP POLICY IF EXISTS "Grievances: Authorized update" ON grievances;
CREATE POLICY "Grievances: Authorized update"
ON grievances FOR UPDATE
TO authenticated
USING (
    is_super_admin()
    OR (get_current_user_role() = 'DEPARTMENT_ADMIN' AND department_id = get_current_user_department())
    OR (get_current_user_role() = 'OFFICER' AND (assigned_to = auth.uid() OR department_id = get_current_user_department()))
    OR (student_id = auth.uid() AND status IN ('STUDENT_VERIFICATION', 'RESOLUTION_PROPOSED'))
)
WITH CHECK (
    is_super_admin()
    OR (get_current_user_role() = 'DEPARTMENT_ADMIN' AND department_id = get_current_user_department())
    OR (get_current_user_role() = 'OFFICER' AND (assigned_to = auth.uid() OR department_id = get_current_user_department()))
    OR (student_id = auth.uid() AND status IN ('CLOSED', 'REOPENED'))
);

-- ------------------------------------------------------------------------------
-- 6. POLICIES: GRIEVANCE COMMENTS
-- ------------------------------------------------------------------------------

-- SELECT Comments:
-- - Internal notes: only staff can see
-- - Public notes: anyone who has access to the grievance
DROP POLICY IF EXISTS "Comments: View comments" ON grievance_comments;
CREATE POLICY "Comments: View comments"
ON grievance_comments FOR SELECT
TO authenticated
USING (
    can_view_grievance(grievance_id)
    AND (
        NOT is_internal
        OR get_current_user_role() IN ('OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN')
    )
);

-- INSERT Comments:
-- - Students can post public comments on their grievances
-- - Staff can post public or internal comments on their authorized grievances
DROP POLICY IF EXISTS "Comments: Post comments" ON grievance_comments;
CREATE POLICY "Comments: Post comments"
ON grievance_comments FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND can_view_grievance(grievance_id)
    AND (
        NOT is_internal
        OR get_current_user_role() IN ('OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN')
    )
);

-- ------------------------------------------------------------------------------
-- 7. POLICIES: GRIEVANCE ATTACHMENTS
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Attachments: View attachments" ON grievance_attachments;
CREATE POLICY "Attachments: View attachments"
ON grievance_attachments FOR SELECT
TO authenticated
USING (can_view_grievance(grievance_id));

DROP POLICY IF EXISTS "Attachments: Upload attachments" ON grievance_attachments;
CREATE POLICY "Attachments: Upload attachments"
ON grievance_attachments FOR INSERT
TO authenticated
WITH CHECK (
    uploaded_by = auth.uid()
    AND can_view_grievance(grievance_id)
);

-- ------------------------------------------------------------------------------
-- 8. POLICIES: STATUS HISTORY & AUDIT
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Status History: View history" ON grievance_status_history;
CREATE POLICY "Status History: View history"
ON grievance_status_history FOR SELECT
TO authenticated
USING (can_view_grievance(grievance_id));

DROP POLICY IF EXISTS "Status History: Insert history" ON grievance_status_history;
CREATE POLICY "Status History: Insert history"
ON grievance_status_history FOR INSERT
TO authenticated
WITH CHECK (can_view_grievance(grievance_id));

-- ------------------------------------------------------------------------------
-- 9. POLICIES: ASSIGNMENTS & ESCALATIONS
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Assignments: View assignments" ON grievance_assignments;
CREATE POLICY "Assignments: View assignments"
ON grievance_assignments FOR SELECT
TO authenticated
USING (
    can_view_grievance(grievance_id)
);

DROP POLICY IF EXISTS "Assignments: Manage assignments" ON grievance_assignments;
CREATE POLICY "Assignments: Manage assignments"
ON grievance_assignments FOR INSERT
TO authenticated
WITH CHECK (
    get_current_user_role() IN ('DEPARTMENT_ADMIN', 'SUPER_ADMIN')
);

DROP POLICY IF EXISTS "Escalations: View escalations" ON grievance_escalations;
CREATE POLICY "Escalations: View escalations"
ON grievance_escalations FOR SELECT
TO authenticated
USING (can_view_grievance(grievance_id));

DROP POLICY IF EXISTS "Escalations: Create escalations" ON grievance_escalations;
CREATE POLICY "Escalations: Create escalations"
ON grievance_escalations FOR INSERT
TO authenticated
WITH CHECK (
    get_current_user_role() IN ('OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN')
);

-- ------------------------------------------------------------------------------
-- 10. POLICIES: NOTIFICATIONS
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Notifications: User reads own notifications" ON notifications;
CREATE POLICY "Notifications: User reads own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Notifications: User updates own notifications" ON notifications;
CREATE POLICY "Notifications: User updates own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 11. POLICIES: FEEDBACK
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Feedback: View feedback" ON grievance_feedback;
CREATE POLICY "Feedback: View feedback"
ON grievance_feedback FOR SELECT
TO authenticated
USING (
    student_id = auth.uid()
    OR get_current_user_role() IN ('OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN')
);

-- Only student who owns the grievance can insert feedback when status = CLOSED
DROP POLICY IF EXISTS "Feedback: Student inserts feedback on closed grievance" ON grievance_feedback;
CREATE POLICY "Feedback: Student inserts feedback on closed grievance"
ON grievance_feedback FOR INSERT
TO authenticated
WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM grievances g
        WHERE g.id = grievance_id
          AND g.student_id = auth.uid()
          AND g.status = 'CLOSED'
    )
);

-- ------------------------------------------------------------------------------
-- 12. POLICIES: SLA RULES & CLUSTERS
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "SLA Rules: Read-only for authenticated" ON sla_rules;
CREATE POLICY "SLA Rules: Read-only for authenticated"
ON sla_rules FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "SLA Rules: Admin modification" ON sla_rules;
CREATE POLICY "SLA Rules: Admin modification"
ON sla_rules FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Clusters: View clusters" ON grievance_clusters;
CREATE POLICY "Clusters: View clusters"
ON grievance_clusters FOR SELECT
TO authenticated
USING (get_current_user_role() IN ('OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Clusters: Manage clusters" ON grievance_clusters;
CREATE POLICY "Clusters: Manage clusters"
ON grievance_clusters FOR ALL
TO authenticated
USING (get_current_user_role() IN ('DEPARTMENT_ADMIN', 'SUPER_ADMIN'))
WITH CHECK (get_current_user_role() IN ('DEPARTMENT_ADMIN', 'SUPER_ADMIN'));
