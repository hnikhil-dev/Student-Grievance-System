# Student Experience Portal (`frontend/student`)
**Lead Developer:** Member 2 (Frontend / Student Experience)

---

## 🎯 Core Features to Build

1. **Grievance Submission Form:**
   - Input fields: Title, Category (IT, Academics, Hostel, Maintenance, etc.), Description, Location, Affected Students Count, Urgency.
   - Submits to `POST /api/grievances`.
   - Displays returned ticket number (e.g., `GRV-2026-00001`) and SLA target.

2. **My Grievances Dashboard:**
   - Fetches from `GET /api/grievances/my`.
   - Displays complaint list with color-coded status badges (`SUBMITTED`, `IN_PROGRESS`, `STUDENT_VERIFICATION`, `CLOSED`, `REOPENED`).
   - Displays live SLA countdown and warning badges (`sla_status.remainingMinutes`, `sla_status.isWarning`, `sla_status.isOverdue`).

3. **Closed-Loop Resolution Verification Modal:**
   - When a ticket status is `STUDENT_VERIFICATION`, display **Accept Resolution** and **Reopen** buttons.
   - Accept: Calls `POST /api/grievances/:id/verify` with `{ accepted: true }` -> Marks ticket `CLOSED`.
   - Reopen: Calls `POST /api/grievances/:id/verify` with `{ accepted: false, reason: "..." }` -> Marks ticket `REOPENED`.

4. **Post-Resolution Rating & Feedback:**
   - When ticket status is `CLOSED`, display a 1 to 5 star rating widget and comment box.
   - Calls `POST /api/grievances/:id/feedback` with `{ rating: 5, comment: "..." }`.

5. **Student ↔ Officer Communication:**
   - Chat/comment box calling `GET` & `POST /api/grievances/:id/comments`.
