# Setup and Developer Guide
**System:** Smart Student Grievance Management System  
**Stack:** Next.js 15, TypeScript, Supabase (PostgreSQL), Zod, Vitest

---

## 1. Prerequisites
- **Node.js:** v18+ (v22 LTS recommended)
- **npm:** v9+
- **Supabase Account / CLI** (or a free cloud project at [supabase.com](https://supabase.com))

---

## 2. Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd "Student Grievance System"
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Security Note:** `SUPABASE_SERVICE_ROLE_KEY` is server-only. It must **never** be exposed in browser client code or prefixed with `NEXT_PUBLIC_`.

---

## 4. Database Setup & Migrations

The migrations in `supabase/migrations/` establish the entire schema, triggers, and RLS policies.

### Option A: Via Supabase Web Dashboard (Fastest)
1. Navigate to your Supabase Project Dashboard -> **SQL Editor**.
2. Open each file in `supabase/migrations/` in order:
   - `20261008000001_initial_schema.sql` (Creates enums, tables, sequences, indexes, triggers)
   - `20261008000002_row_level_security.sql` (Enables and configures RLS policies)
   - `20261008000003_seed_data.sql` (Populates realistic departments, demo users, and demo grievances)
3. Click **Run** for each migration.

### Option B: Via Supabase CLI
```bash
supabase db push
# or
supabase migration up
```

---

## 5. Seeding Demo Data

Once the database is created, you can seed or refresh data via:
```bash
npm run seed
```

This ensures the database contains:
- 9 realistic university departments (IT, Academics, Hostel, Maintenance, etc.)
- 4 SLA priority rules (Critical 4h, High 12h, Medium 24h, Low 48h)
- 8 demo accounts (Super Admin, Dept Admins, Officers, Students)
- Realistic grievances across all statuses (Active, Overdue, Escalated, Resolved, Reopened)

---

## 6. Running Locally

Start the Next.js development server:
```bash
npm run dev
```

The application and all API endpoints are now available at:
`http://localhost:3000`

Test the health check / auth endpoint:
```bash
curl http://localhost:3000/api/departments
```

---

## 7. Running Automated Tests

Run the test suite:
```bash
npm test
```

Watch mode for development:
```bash
npm run test:watch
```

Run TypeScript strict type checking:
```bash
npm run typecheck
```

---

## 8. Demo User Credentials & Impersonation for Frontend / AI Testing

When developing the Frontend (Member 2) or AI Dashboard (Member 3) without requiring full login screens:

You can pass the following headers in any HTTP request during local development:
- `x-demo-user-id: 00000000-0000-0000-0000-000000000006`
- `x-demo-user-role: STUDENT`

Or for Super Admin testing:
- `x-demo-user-id: 00000000-0000-0000-0000-000000000001`
- `x-demo-user-role: SUPER_ADMIN`

| Role | Demo Email | UUID |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@campus.edu` | `00000000-0000-0000-0000-000000000001` |
| **IT Dept Admin** | `admin.it@campus.edu` | `00000000-0000-0000-0000-000000000002` |
| **Hostel Dept Admin**| `admin.hostel@campus.edu`| `00000000-0000-0000-0000-000000000003` |
| **IT Officer** | `officer.it@campus.edu` | `00000000-0000-0000-0000-000000000004` |
| **Hostel Officer** | `officer.hostel@campus.edu` | `00000000-0000-0000-0000-000000000005` |
| **Student 1 (Alex)**| `student.alex@campus.edu` | `00000000-0000-0000-0000-000000000006` |
| **Student 2 (Priya)**| `student.priya@campus.edu`| `00000000-0000-0000-0000-000000000007` |
| **Student 3 (Rahul)**| `student.rahul@campus.edu`| `00000000-0000-0000-0000-000000000008` |
