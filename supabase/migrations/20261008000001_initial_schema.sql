-- ==============================================================================
-- SMART STUDENT GRIEVANCE MANAGEMENT SYSTEM
-- Migration 01: Initial Database Schema, Enums, Tables & Indexes
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS & DOMAIN CONSTRAINTS
-- ------------------------------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'STUDENT',
        'OFFICER',
        'DEPARTMENT_ADMIN',
        'SUPER_ADMIN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE grievance_status AS ENUM (
        'SUBMITTED',
        'UNDER_REVIEW',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLUTION_PROPOSED',
        'STUDENT_VERIFICATION',
        'CLOSED',
        'REOPENED',
        'REJECTED',
        'ESCALATED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE grievance_priority AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level AS ENUM (
        'LOW',
        'MODERATE',
        'HIGH',
        'CRITICAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE urgency_level AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'IMMEDIATE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 2. SEQUENCES & HELPER FUNCTIONS
-- ------------------------------------------------------------------------------

CREATE SEQUENCE IF NOT EXISTS grievance_ticket_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    current_yr TEXT := to_char(CURRENT_DATE, 'YYYY');
    seq_val BIGINT := nextval('grievance_ticket_seq');
BEGIN
    RETURN 'GRV-' || current_yr || '-' || lpad(seq_val::text, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. CORE TABLES
-- ------------------------------------------------------------------------------

-- Table 1: Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2: Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'STUDENT',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    student_id TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 3: SLA Rules
CREATE TABLE IF NOT EXISTS sla_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    priority grievance_priority NOT NULL UNIQUE,
    default_hours INTEGER NOT NULL CHECK (default_hours > 0),
    warning_threshold_percent INTEGER NOT NULL DEFAULT 75 CHECK (warning_threshold_percent BETWEEN 1 AND 99),
    escalation_role user_role NOT NULL DEFAULT 'DEPARTMENT_ADMIN',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 4: Grievance Clusters (duplicate / grouping support for AI & Admins)
CREATE TABLE IF NOT EXISTS grievance_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT,
    category TEXT NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    priority grievance_priority NOT NULL DEFAULT 'MEDIUM',
    affected_count INTEGER NOT NULL DEFAULT 1 CHECK (affected_count >= 1),
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 5: Grievances (Core Entity)
CREATE TABLE IF NOT EXISTS grievances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    priority grievance_priority NOT NULL DEFAULT 'MEDIUM',
    priority_score INTEGER NOT NULL DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
    priority_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    status grievance_status NOT NULL DEFAULT 'SUBMITTED',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    location TEXT,
    affected_students INTEGER NOT NULL DEFAULT 1 CHECK (affected_students >= 1),
    severity severity_level NOT NULL DEFAULT 'MODERATE',
    urgency urgency_level NOT NULL DEFAULT 'MEDIUM',
    recurrence BOOLEAN NOT NULL DEFAULT false,
    is_confidential BOOLEAN NOT NULL DEFAULT false,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    ai_summary TEXT,
    ai_confidence NUMERIC(4,3) CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1)),
    sla_hours INTEGER NOT NULL DEFAULT 24 CHECK (sla_hours > 0),
    due_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    resolution_notes TEXT,
    cluster_id UUID REFERENCES grievance_clusters(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 6: Grievance Assignments (Audit history of assignments/reassignments)
CREATE TABLE IF NOT EXISTS grievance_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    officer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT
);

-- Table 7: Grievance Comments (Student <-> Officer dialogue & internal notes)
CREATE TABLE IF NOT EXISTS grievance_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 8: Grievance Attachments (Supabase Storage metadata)
CREATE TABLE IF NOT EXISTS grievance_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 9: Grievance Status History / Audit Trail
CREATE TABLE IF NOT EXISTS grievance_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    old_status grievance_status,
    new_status grievance_status NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 10: Grievance Escalations
CREATE TABLE IF NOT EXISTS grievance_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    escalated_from UUID REFERENCES profiles(id) ON DELETE SET NULL,
    escalated_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    escalated_to_role user_role NOT NULL DEFAULT 'DEPARTMENT_ADMIN',
    reason TEXT NOT NULL,
    sla_breached BOOLEAN NOT NULL DEFAULT false,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 11: Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    grievance_id UUID REFERENCES grievances(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 12: Grievance Feedback (Student Closed-Loop Evaluation)
CREATE TABLE IF NOT EXISTS grievance_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grievance_id UUID NOT NULL UNIQUE REFERENCES grievances(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_priority ON grievances(priority);
CREATE INDEX IF NOT EXISTS idx_grievances_category ON grievances(category);
CREATE INDEX IF NOT EXISTS idx_grievances_department_id ON grievances(department_id);
CREATE INDEX IF NOT EXISTS idx_grievances_assigned_to ON grievances(assigned_to);
CREATE INDEX IF NOT EXISTS idx_grievances_student_id ON grievances(student_id);
CREATE INDEX IF NOT EXISTS idx_grievances_due_at ON grievances(due_at);
CREATE INDEX IF NOT EXISTS idx_grievances_created_at ON grievances(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grievances_cluster_id ON grievances(cluster_id);
CREATE INDEX IF NOT EXISTS idx_grievances_ticket_number ON grievances(ticket_number);

CREATE INDEX IF NOT EXISTS idx_grievance_assignments_grievance ON grievance_assignments(grievance_id);
CREATE INDEX IF NOT EXISTS idx_grievance_assignments_officer ON grievance_assignments(officer_id);
CREATE INDEX IF NOT EXISTS idx_grievance_comments_grievance ON grievance_comments(grievance_id);
CREATE INDEX IF NOT EXISTS idx_grievance_attachments_grievance ON grievance_attachments(grievance_id);
CREATE INDEX IF NOT EXISTS idx_grievance_history_grievance ON grievance_status_history(grievance_id);
CREATE INDEX IF NOT EXISTS idx_grievance_escalations_grievance ON grievance_escalations(grievance_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department_id);

-- ------------------------------------------------------------------------------
-- 5. AUTOMATIC TRIGGERS
-- ------------------------------------------------------------------------------

-- Ensure ticket_number is auto-generated before insert if not provided
CREATE OR REPLACE FUNCTION trg_set_grievance_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_grievance_ticket_number ON grievances;
CREATE TRIGGER trg_grievance_ticket_number
BEFORE INSERT ON grievances
FOR EACH ROW
EXECUTE FUNCTION trg_set_grievance_ticket_number();

-- Auto update updated_at timestamps
DROP TRIGGER IF EXISTS trg_departments_updated_at ON departments;
CREATE TRIGGER trg_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_grievances_updated_at ON grievances;
CREATE TRIGGER trg_grievances_updated_at
BEFORE UPDATE ON grievances
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_grievance_clusters_updated_at ON grievance_clusters;
CREATE TRIGGER trg_grievance_clusters_updated_at
BEFORE UPDATE ON grievance_clusters
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_grievance_comments_updated_at ON grievance_comments;
CREATE TRIGGER trg_grievance_comments_updated_at
BEFORE UPDATE ON grievance_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sla_rules_updated_at ON sla_rules;
CREATE TRIGGER trg_sla_rules_updated_at
BEFORE UPDATE ON sla_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
