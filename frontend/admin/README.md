# Admin & AI Dashboard (`frontend/admin`)
**Lead Developer:** Member 3 (AI + Admin Dashboard)

---

## 🎯 Core Features to Build

1. **Executive Analytics Overview:**
   - Pre-computed aggregated metrics via `GET /api/admin/analytics/overview`:
     - Total Grievances, Active Count, In-Progress Count, Escalated Count, Overdue Count.
     - Average Resolution Time (Hours).
     - Student Satisfaction Average Rating (1–5 Stars).
   - Category Breakdown via `GET /api/admin/analytics/categories`.
   - Department Workload & Breaches via `GET /api/admin/analytics/departments`.
   - SLA Compliance Rate via `GET /api/admin/analytics/sla`.
   - 14-Day Timeline via `GET /api/admin/analytics/trends`.

2. **AI Complaint Classification Boundary:**
   - Endpoint: `POST /api/ai/analyze-grievance`.
   - Input: `{ title, description, category, location, affected_students }`.
   - Structured Output validated by Zod:
     ```json
     {
       "category": "IT",
       "severity": "CRITICAL",
       "urgency": "IMMEDIATE",
       "priority": "CRITICAL",
       "priorityScore": 95,
       "priorityReasons": ["..."],
       "department": "IT",
       "summary": "...",
       "confidence": 0.88
     }
     ```
   - Connect your Gemini API call directly to enhance classification or duplicate detection!

3. **Grievance Triage & Workload Queue:**
   - Fetches from `GET /api/admin/grievances`.
   - Filterable by department, status, priority, and assigned officer.
   - Assign/Reassign officer: `POST /api/admin/grievances/:id/assign`.
   - Propose Resolution: `POST /api/admin/grievances/:id/resolve`.
   - Manual Escalation: `POST /api/admin/grievances/:id/escalate`.
