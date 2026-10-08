# 🚀 Team Onboarding & Hackathon Inspection Guide
**Smart Student Grievance Management System (Autonomous Agentic Platform)**

---

## ⚡ 1. 60-Second Quickstart for Team Members

Run these exact commands from the project root:

```bash
# 1. Pull the latest dynamic backend and fullstack code
git pull origin main

# 2. Install all dependencies (automatically targets backend)
npm run install:all

# 3. Create your local environment file
cp .env.example backend/.env.local
# (Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are filled in backend/.env.local)

# 4. Start the live development server
npm run dev
```

Visit:
- 📱 **Student Portal:** [http://localhost:3000/student/page](http://localhost:3000/student/page)
- 🛡️ **Admin Command Center:** [http://localhost:3000/admin/page](http://localhost:3000/admin/page)
- 🔐 **Institutional Login:** [http://localhost:3000/login](http://localhost:3000/login)

---

## 🔑 2. Ready-to-Use Demo Accounts

Any campus email can be typed into the login page. For instant evaluator testing, use any of these pre-seeded institutional accounts (Password: `password123`):

| Role | Email | Name / Sector | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@campus.edu` | Dr. Sarah Jenkins | Full institutional governance & provost escalation |
| **Dept Admin** | `admin.it@campus.edu` | Prof. Alan Vance | IT department lead, SLA adjustments |
| **Dept Admin** | `admin.hostel@campus.edu` | Col. Ramesh Roy | Hostel warden & residential lead |
| **Officer** | `officer.it@campus.edu` | Mark Sterling | Field IT technician, ticket assignment |
| **Officer** | `officer.hostel@campus.edu` | Deepa Sharma | Maintenance engineer, hostel repairs |
| **Student** | `student.alex@campus.edu` | Alex Mercer (CS-2023-014) | Grievance submission, evidence vault, tracking |
| **Student** | `student.priya@campus.edu` | Priya Nair (EC-2023-088) | Grievance submission, closed-loop verification |

*(You can also click the one-click **"⚡ Student Demo (Alex Mercer)"** or **"⚡ Administrative Demo"** buttons on `/login` to authenticate instantly without typing).*

---

## 🏆 3. Our USP (Unique Selling Propositions) for Judges

When judges or inspectors ask *"Why is this different from existing campus ticketing systems (like Freshdesk, Jira, or Google Forms)?"*, highlight these **5 core differentiators**:

1. **Autonomous Multi-Agent Sentinel Pipeline**:
   - Grievances are not sitting in an inbox. 4 specialized AI agents run continuously:
     - **Triage Sentinel:** Classifies department, subcategory, urgency, and calculates SLA in $< 2$ seconds.
     - **Duplicate & Cluster Sentinel:** Matches semantic vectors across campus to group duplicate tickets and detect widespread systemic issues (e.g. 50 students reporting the same Wi-Fi router failure).
     - **Escalation Watchdog:** Tracks SLA burn-down rates and automatically escalates at-risk tickets from Officer $\to$ Department Lead $\to$ Dean of Student Affairs $\to$ Provost.
     - **Feedback Sentiment Analyzer:** Evaluates student sentiment after resolution.

2. **Agentic Evidence System (Tamper-Evident Forensic Vault)**:
   - Students upload photo/document evidence that is cryptographically hashed with **SHA-256**, stripped of EXIF tampering, and verified by AI vision for authenticity and relevance score ($0\text{--}100\%$).

3. **Multi-Factor Priority Engine (Mathematical Formulation)**:
   - Priority isn't a subjective guess. It uses an objective institutional formula:
     $$P = 0.35 \times \text{Severity} + 0.25 \times \text{Urgency} + 0.20 \times \text{BlastRadius} + 0.10 \times \text{Recurrence} + 0.10 \times \text{Confidentiality}$$
   - High blast-radius issues (e.g., water leak flooding an entire hostel block affecting 45 students) are automatically elevated to **CRITICAL**.

4. **True Closed-Loop Verification**:
   - An administrator cannot unilaterally mark a complaint "Resolved" without student validation.
   - The student receives a verification prompt to either **Confirm Resolution (with 1–5 star rating)** or **Reopen Grievance** with mandatory corrective action.

5. **100% Dynamic 3NF Normalized Relational Database**:
   - Zero hardcoded mock data. 14 interconnected PostgreSQL tables in Supabase with foreign keys, indexes, triggers, and live streaming WebSockets.

---

## 🛠️ 4. Useful Terminal Commands

All scripts can be run from the root directory or `backend/`:

```bash
# Start local development server
npm run dev

# Run automated test suite (40 Vitest tests)
npm test

# Verify TypeScript types across the entire project
npm run typecheck

# Build for production (compiles all 32 Next.js routes)
npm run build

# Seed fresh sample data into Supabase
npm run seed
```

---

## 🌿 5. Git Workflow for Team Members

### How to pull the latest changes cleanly:
```bash
git checkout main
git pull origin main
```

### If you are working on your own feature:
```bash
# 1. Create your branch
git checkout -b feature/your-name-component

# 2. Make your edits and check status
git status

# 3. Add and commit
git add .
git commit -m "feat(portal): add component name"

# 4. Push to remote
git push origin feature/your-name-component
```

---

## 📂 6. Architecture & File Structure

```
.
├── package.json              # Root workspace scripts (proxies to backend)
├── .env.example              # Environment variables template
├── TEAM_GUIDE.md             # This guide
├── README.md                 # Project overview & quickstart
├── backend/                  # Next.js 15 Fullstack Engine
│   ├── src/app/api/          # 18 REST endpoints (auth, grievances, admin, evidence, agents)
│   ├── src/lib/              # Supabase clients, auth session, engines, agents
│   ├── supabase/migrations/  # 5 PostgreSQL migration scripts (14 normalized 3NF tables)
│   └── tests/                # 40 passing Vitest unit & integration tests
└── frontend/                 # UI Portals & Dashboards
    ├── student/              # Student Portal (wizard, tracking, feedback, evidence)
    └── admin/                # Admin Command Center (10 operational monitoring consoles)
```
