# Frontend Applications Directory

Welcome to the **Frontend** workspace for the Smart Student Grievance Management System.

This folder contains the frontend portals for the hackathon team:
- **`student/`** (Managed primarily by **Member 2 - Student Experience**): Student complaint logging, live ticket tracking, closed-loop resolution verification, and feedback.
- **`admin/`** (Managed primarily by **Member 3 - AI + Admin Dashboard**): Administrative triage, AI complaint classification, SLA tracking, manual & automated escalation, and institutional analytics.

---

## 🔗 Backend API Integration

The backend is live in `../backend` and provides full REST endpoints:
- **Base URL:** `http://localhost:3000`
- **Full API Specification:** See `../backend/API_REFERENCE.md`
- **Team Integration Contract:** See `../backend/BACKEND_CONTRACT.md`

### Rapid Testing Headers (No Login Screen Required)
When developing frontend views locally without active Supabase authentication:
- For Student Portal:
  - `x-demo-user-id: 00000000-0000-0000-0000-000000000006`
  - `x-demo-user-role: STUDENT`
- For Admin Portal:
  - `x-demo-user-id: 00000000-0000-0000-0000-000000000001`
  - `x-demo-user-role: SUPER_ADMIN`

---

## 🚀 Admin Portal Backend Integration Status
- **Live Command Center**: Connects to `/api/admin/analytics/overview`, `/trends`, `/departments`, and `/sla`.
- **Live Ticket Queues**: Queries `/api/admin/grievances` for critical and at-risk issues.
- **Assignment & Escalation**: Connected directly to `/api/admin/grievances/:id/assign` and `/escalate`.
- **Closed-Loop Resolution**: Dispatches `/api/admin/grievances/:id/resolve` for student verification.
- **Real-time Synchronization**: Subscribed to Supabase table changes via `useRealtimeGrievances`.
