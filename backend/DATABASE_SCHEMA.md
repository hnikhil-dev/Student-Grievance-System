# Database Schema Documentation
**System:** Smart Student Grievance Management System  
**Database Engine:** PostgreSQL 15+ (Supabase)  
**Location of Migrations:** `supabase/migrations/`

---

## 1. Custom Enums

```sql
CREATE TYPE user_role AS ENUM (
    'STUDENT',
    'OFFICER',
    'DEPARTMENT_ADMIN',
    'SUPER_ADMIN'
);

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

CREATE TYPE grievance_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

CREATE TYPE severity_level AS ENUM (
    'LOW',
    'MODERATE',
    'HIGH',
    'CRITICAL'
);

CREATE TYPE urgency_level AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'IMMEDIATE'
);
```

---

## 2. Tables & Schema Definitions

### 1. `departments`
Stores academic and campus administrative service divisions.
- `id` (UUID, Primary Key, default: `gen_random_uuid()`)
- `name` (TEXT, NOT NULL, UNIQUE)
- `code` (TEXT, NOT NULL, UNIQUE) - e.g., 'IT', 'HOSTEL', 'ACADEMICS'
- `description` (TEXT)
- `is_active` (BOOLEAN, default: `true`)
- `created_at` (TIMESTAMPTZ, default: `now()`)
- `updated_at` (TIMESTAMPTZ, default: `now()`)

### 2. `profiles`
User metadata extending Supabase `auth.users`.
- `id` (UUID, Primary Key, references `auth.users(id)` ON DELETE CASCADE)
- `full_name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL, UNIQUE)
- `role` (`user_role`, default: `'STUDENT'`)
- `department_id` (UUID, references `departments(id)` ON DELETE SET NULL)
- `student_id` (TEXT) - e.g., 'CS-2023-014'
- `phone` (TEXT)
- `avatar_url` (TEXT)
- `is_active` (BOOLEAN, default: `true`)
- `created_at` (TIMESTAMPTZ, default: `now()`)
- `updated_at` (TIMESTAMPTZ, default: `now()`)

### 3. `sla_rules`
Institutional SLA rules configured per priority level.
- `id` (UUID, Primary Key, default: `gen_random_uuid()`)
- `priority` (`grievance_priority`, NOT NULL, UNIQUE)
- `default_hours` (INTEGER, NOT NULL) - Default: CRITICAL=4, HIGH=12, MEDIUM=24, LOW=48
- `warning_threshold_percent` (INTEGER, default: `75`)
- `escalation_role` (`user_role`, default: `'DEPARTMENT_ADMIN'`)
- `is_active` (BOOLEAN, default: `true`)
- `created_at` (TIMESTAMPTZ, default: `now()`)
- `updated_at` (TIMESTAMPTZ, default: `now()`)

### 4. `grievance_clusters`
AI & Admin grouping for duplicate or widespread incidents.
- `id` (UUID, Primary Key, default: `gen_random_uuid()`)
- `title` (TEXT, NOT NULL)
- `summary` (TEXT)
- `category` (TEXT, NOT NULL)
- `department_id` (UUID, references `departments(id)`)
- `priority` (`grievance_priority`, default: `'MEDIUM'`)
- `affected_count` (INTEGER, default: `1`)
- `status` (TEXT, default: `'ACTIVE'`)
- `created_at` (TIMESTAMPTZ, default: `now()`)
- `updated_at` (TIMESTAMPTZ, default: `now()`)

### 5. `grievances`
Core student complaint record.
- `id` (UUID, Primary Key, default: `gen_random_uuid()`)
- `ticket_number` (TEXT, NOT NULL, UNIQUE) - e.g., `GRV-2026-00001`
- `student_id` (UUID, NOT NULL, references `profiles(id)`)
- `title` (TEXT, NOT NULL)
- `description` (TEXT, NOT NULL)
- `category` (TEXT, NOT NULL)
- `subcategory` (TEXT)
- `priority` (`grievance_priority`, NOT NULL, default: `'MEDIUM'`)
- `priority_score` (INTEGER, NOT NULL, default: `50`, CHECK `0-100`)
- `priority_reasons` (JSONB, NOT NULL, default: `'[]'`)
- `status` (`grievance_status`, NOT NULL, default: `'SUBMITTED'`)
- `department_id` (UUID, references `departments(id)`)
- `assigned_to` (UUID, references `profiles(id)`)
- `location` (TEXT)
- `affected_students` (INTEGER, NOT NULL, default: `1`)
- `severity` (`severity_level`, NOT NULL, default: `'MODERATE'`)
- `urgency` (`urgency_level`, NOT NULL, default: `'MEDIUM'`)
- `recurrence` (BOOLEAN, NOT NULL, default: `false`)
- `is_confidential` (BOOLEAN, NOT NULL, default: `false`)
- `is_anonymous` (BOOLEAN, NOT NULL, default: `false`)
- `ai_summary` (TEXT)
- `ai_confidence` (NUMERIC(4,3), CHECK `0.000 - 1.000`)
- `sla_hours` (INTEGER, NOT NULL, default: `24`)
- `due_at` (TIMESTAMPTZ, NOT NULL)
- `resolved_at` (TIMESTAMPTZ)
- `closed_at` (TIMESTAMPTZ)
- `resolution_notes` (TEXT)
- `cluster_id` (UUID, references `grievance_clusters(id)`)
- `created_at` (TIMESTAMPTZ, default: `now()`)
- `updated_at` (TIMESTAMPTZ, default: `now()`)

### 6. `grievance_assignments`
Tracks officer assignment history.
- `id` (UUID, Primary Key, default: `gen_random_uuid()`)
- `grievance_id` (UUID, NOT NULL, references `grievances(id)` ON DELETE CASCADE)
- `department_id` (UUID, NOT NULL, references `departments(id)`)
- `officer_id` (UUID, references `profiles(id)`)
- `assigned_by` (UUID, NOT NULL, references `profiles(id)`)
- `assigned_at` (TIMESTAMPTZ, default: `now()`)
- `accepted_at` (TIMESTAMPTZ)
- `completed_at` (TIMESTAMPTZ)
- `notes` (TEXT)

### 7. `grievance_comments`
Discussion stream supporting public student dialogue and internal staff notes.
- `id` (UUID, Primary Key, default: `gen_random_uuid()`)
- `grievance_id` (UUID, NOT NULL, references `grievances(id)` ON DELETE CASCADE)
- `user_id` (UUID, NOT NULL, references `profiles(id)`)
- `message` (TEXT, NOT NULL)
- `is_internal` (BOOLEAN, NOT NULL, default: `false`)
- `created_at` (TIMESTAMPTZ, default: `now()`)
- `updated_at` (TIMESTAMPTZ, default: `now()`)

### 8. `grievance_attachments`
Metadata for files stored in Supabase Storage.
- `id` (UUID, Primary Key, default: `gen_random_uuid()`)
- `grievance_id` (UUID, NOT NULL, references `grievances(id)` ON DELETE CASCADE)
- `uploaded_by` (UUID, NOT NULL, references `profiles(id)`)
- `file_name` (TEXT, NOT NULL)
- `file_path` (TEXT, NOT NULL)
- `file_type` (TEXT, NOT NULL)
- `file_size` (INTEGER, NOT NULL)
- `created_at` (TIMESTAMPTZ, default: `now()`)

### 9. `grievance_status_history`
Audit log recording every lifecycle status transition.
- `id` (UUID, Primary Key, default: `gen_random_uuid()`)
- `grievance_id` (UUID, NOT NULL, references `grievances(id)` ON DELETE CASCADE)
- `old_status` (`grievance_status`)
- `new_status` (`grievance_status`, NOT NULL)
- `changed_by` (UUID, references `profiles(id)`)
- `reason` (TEXT)
- `metadata` (JSONB, default: `'{}'`)
- `created_at` (TIMESTAMPTZ, default: `now()`)

### 10. `grievance_escalations`
Records automated SLA breaches or manual admin escalations.
- `id` (UUID, Primary Key, default: `gen_random_uuid()`)
- `grievance_id` (UUID, NOT NULL, references `grievances(id)` ON DELETE CASCADE)
- `level` (INTEGER, NOT NULL, default: `1`)
- `escalated_from` (UUID, references `profiles(id)`)
- `escalated_to` (UUID, references `profiles(id)`)
- `escalated_to_role` (`user_role`, default: `'DEPARTMENT_ADMIN'`)
- `reason` (TEXT, NOT NULL)
- `sla_breached` (BOOLEAN, NOT NULL, default: `false`)
- `resolved` (BOOLEAN, default: `false`)
- `resolved_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ, default: `now()`)

### 11. `notifications`
In-app alert queue for students and staff.
- `id` (UUID, Primary Key, default: `gen_random_uuid()`)
- `user_id` (UUID, NOT NULL, references `profiles(id)` ON DELETE CASCADE)
- `grievance_id` (UUID, references `grievances(id)` ON DELETE CASCADE)
- `type` (TEXT, NOT NULL)
- `title` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `is_read` (BOOLEAN, default: `false`)
- `metadata` (JSONB, default: `'{}'`)
- `created_at` (TIMESTAMPTZ, default: `now()`)

### 12. `grievance_feedback`
Closed-loop student satisfaction rating and review.
- `id` (UUID, Primary Key, default: `gen_random_uuid()`)
- `grievance_id` (UUID, NOT NULL, UNIQUE, references `grievances(id)` ON DELETE CASCADE)
- `student_id` (UUID, NOT NULL, references `profiles(id)`)
- `rating` (INTEGER, NOT NULL, CHECK `1 BETWEEN 5`)
- `comment` (TEXT)
- `created_at` (TIMESTAMPTZ, default: `now()`)

---

## 3. Database Indexes

```sql
CREATE INDEX idx_grievances_status ON grievances(status);
CREATE INDEX idx_grievances_priority ON grievances(priority);
CREATE INDEX idx_grievances_category ON grievances(category);
CREATE INDEX idx_grievances_department_id ON grievances(department_id);
CREATE INDEX idx_grievances_assigned_to ON grievances(assigned_to);
CREATE INDEX idx_grievances_student_id ON grievances(student_id);
CREATE INDEX idx_grievances_due_at ON grievances(due_at);
CREATE INDEX idx_grievances_created_at ON grievances(created_at DESC);
CREATE INDEX idx_grievances_ticket_number ON grievances(ticket_number);

CREATE INDEX idx_grievance_comments_grievance ON grievance_comments(grievance_id);
CREATE INDEX idx_grievance_status_history_grievance ON grievance_status_history(grievance_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_profiles_role ON profiles(role);
```

---

## 4. Sequence & Triggers

1. **`grievance_ticket_seq`**: Generates incremental ticket numbers (e.g. `GRV-2026-00001`).
2. **`trg_grievance_ticket_number`**: Automatically formats and populates `ticket_number` before row insertion if null.
3. **`update_updated_at_column()`**: Auto-updates `updated_at` timestamps on row mutation across all core tables.
4. **`prevent_profile_role_self_escalation()`**: Rejects any non-superadmin client attempting to elevate their own role.
