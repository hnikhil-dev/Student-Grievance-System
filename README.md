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

## 🚀 Quickstart for Backend

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Fill in NEXT_PUBLIC_SUPABASE_URL and keys
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

Refer to [backend/SETUP.md](file:///c:/Users/HNikhil/OneDrive/Desktop/Comp_Lang/Projects/Student%20Grievance%20System/backend/SETUP.md) for full instructions.
