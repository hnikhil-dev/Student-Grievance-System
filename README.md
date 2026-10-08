# Smart Student Grievance Management System

> **24-Hour Hackathon Project**  
> An intelligent, closed-loop student grievance platform that allows students to submit complaints and enables the institution to classify, prioritize, route, track, escalate, resolve, and verify grievances.

---

## 👥 Team Roles

- **Member 1 (Backend / Data Engineer):** Database schema, PostgreSQL migrations, Supabase RLS, SLA engine, priority calculation, API route handlers, and contracts. *(Completed in `backend/`)*
- **Member 2 (Frontend / Student Experience):** Student portal UI, complaint submission experience, tracking, and closed-loop verification.
- **Member 3 (AI + Admin Dashboard):** Intelligent classification, duplicate/cluster detection, and administrative analytics dashboard.
- **Member 4 (Presentation + Documentation + QA):** Presentation deck, walkthrough scripts, and QA test coordination.

---

## 📁 Repository Structure

```
.
├── backend/                  # Backend & Data Foundation (Next.js 15, Supabase, TypeScript, Zod)
│   ├── src/                  # App Router API routes, domain engines & types
│   ├── supabase/migrations/  # PostgreSQL schemas, RLS policies & seed data
│   ├── tests/                # Automated Vitest test suites (25 passing tests)
│   ├── scripts/              # Database seeding scripts
│   ├── BACKEND_CONTRACT.md   # Architectural & API integration contract
│   ├── DATABASE_SCHEMA.md    # 12-table relational schema & constraints
│   ├── API_REFERENCE.md      # Detailed REST endpoint specifications
│   └── SETUP.md              # Local development & setup guide
├── README.md
```

---

## 🚀 Quickstart for Team Members

Run directly from the root workspace:

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure environment variables
cp .env.example backend/.env.local
# (Fill in NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)

# 3. Start development server
npm run dev

# 4. Run automated test suite (40 Vitest tests)
npm test
```

- 📱 **Student Portal:** `http://localhost:3000/student/page`
- 🛡️ **Admin Command Center:** `http://localhost:3000/admin/page`
- 🔐 **Institutional Login:** `http://localhost:3000/login`

> 📘 **Detailed Guides:**
> - [TEAM_GUIDE.md](file:///c:/Users/HNikhil/OneDrive/Desktop/Comp_Lang/Projects/Student%20Grievance%20System/TEAM_GUIDE.md) - Complete team onboarding, pre-seeded demo accounts & Hackathon Judges USP sheet.
> - [backend/SETUP.md](file:///c:/Users/HNikhil/OneDrive/Desktop/Comp_Lang/Projects/Student%20Grievance%20System/backend/SETUP.md) - Deep dive database setup & architecture.
