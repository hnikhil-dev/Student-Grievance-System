# API Reference
**System:** Smart Student Grievance Management System  
**Base URL:** `http://localhost:3000` (or production host)  
**Standard Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <supabase_jwt_token>` (or session cookie)
- Optional Demo Testing: `x-demo-user-id: <uuid>`, `x-demo-user-role: STUDENT | OFFICER | DEPARTMENT_ADMIN | SUPER_ADMIN`

---

## 1. Authentication

### `GET /api/auth/me`
Fetches current session user information, role, and profile.
- **Access:** Authenticated
- **Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "00000000-0000-0000-0000-000000000006",
      "email": "student.alex@campus.edu",
      "role": "STUDENT",
      "profile": {
        "id": "00000000-0000-0000-0000-000000000006",
        "full_name": "Alex Mercer",
        "student_id": "CS-2023-014",
        "role": "STUDENT"
      }
    }
  }
}
```

---

## 2. Departments

### `GET /api/departments`
Lists all active campus departments for form dropdowns.
- **Access:** Public / Authenticated
- **Response `200`:**
```json
{
  "success": true,
  "data": [
    { "id": "a0000000-0000-0000-0000-000000000002", "name": "Academic Affairs", "code": "ACADEMICS" },
    { "id": "a0000000-0000-0000-0000-000000000001", "name": "Information Technology", "code": "IT" }
  ]
}
```

---

## 3. Student Grievances

### `POST /api/grievances`
Submit a new student grievance. Ticket number, priority score, and SLA due date are automatically generated.
- **Access:** `STUDENT`
- **Request Body:**
```json
{
  "title": "Computer Lab 3 Core Switch Failure",
  "description": "All 60 machines in Lab 3 lost network connectivity ahead of the capstone project code freeze.",
  "category": "IT",
  "subcategory": "Network",
  "location": "Block B, 3rd Floor, Lab 3",
  "affected_students": 60,
  "severity": "CRITICAL",
  "urgency": "IMMEDIATE",
  "recurrence": false,
  "is_confidential": false,
  "is_anonymous": false
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": "c0000000-0000-0000-0000-000000000001",
    "ticket_number": "GRV-2026-00001",
    "status": "SUBMITTED",
    "priority": "CRITICAL",
    "priority_score": 95,
    "priority_reasons": ["Critical severity impact reported", "Immediate urgency", "Widespread cohort impact: 60 students affected"],
    "sla_hours": 4,
    "due_at": "2026-10-08T18:00:00.000Z",
    "created_at": "2026-10-08T14:00:00.000Z"
  }
}
```

### `GET /api/grievances/my`
List complaints submitted by the authenticated student.
- **Access:** `STUDENT`
- **Query Parameters:** `page=1`, `pageSize=20`, `status=IN_PROGRESS`, `priority=CRITICAL`, `search=Lab`
- **Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "c0000000-0000-0000-0000-000000000001",
      "ticket_number": "GRV-2026-00001",
      "title": "Computer Lab 3 Core Switch Failure",
      "status": "IN_PROGRESS",
      "priority": "CRITICAL",
      "sla_status": {
        "slaHours": 4,
        "dueAt": "2026-10-08T18:00:00.000Z",
        "isOverdue": false,
        "isWarning": false,
        "remainingMinutes": 150,
        "elapsedPercent": 37
      }
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "totalCount": 1 }
}
```

### `GET /api/grievances/:id`
Fetch single grievance details with comments, attachments, status history, and computed SLA metrics.
- **Access:** Owner student or authorized staff
- **Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "c0000000-0000-0000-0000-000000000001",
    "ticket_number": "GRV-2026-00001",
    "title": "Computer Lab 3 Core Switch Failure",
    "status": "IN_PROGRESS",
    "comments": [...],
    "attachments": [...],
    "history": [...],
    "sla_status": { "remainingMinutes": 150, "elapsedPercent": 37, "isOverdue": false, "isWarning": false }
  }
}
```

### `POST /api/grievances/:id/comments`
Add a comment to a grievance.
- **Access:** Owner student or authorized staff
- **Request Body:**
```json
{
  "message": "Replacement switch unit has arrived at Lab 3.",
  "is_internal": false
}
```
*(Note: Students attempting `is_internal: true` receive a 403 Forbidden).*

### `POST /api/grievances/:id/verify`
Student closed-loop resolution verification.
- **Access:** Owner student
- **Request Body (Accept):**
```json
{
  "accepted": true
}
```
- **Request Body (Reject & Reopen):**
```json
{
  "accepted": false,
  "reason": "Only 10 computers are working; the other rows still cannot connect."
}
```
- **Response `200`:**
```json
{
  "success": true,
  "data": {
    "accepted": true,
    "message": "Grievance confirmed resolved and closed successfully"
  }
}
```

### `POST /api/grievances/:id/reopen`
Reopen a grievance.
- **Access:** Owner student
- **Request Body:**
```json
{
  "reason": "Issue has resurfaced following afternoon lecture."
}
```

### `POST /api/grievances/:id/feedback`
Submit student satisfaction rating on a **`CLOSED`** ticket.
- **Access:** Owner student
- **Request Body:**
```json
{
  "rating": 5,
  "comment": "Swift resolution! Lab switch was restored within 2 hours."
}
```

---

## 4. Admin & Officer Operations

### `GET /api/admin/grievances`
List grievances scoped by staff role and department.
- **Access:** `OFFICER`, `DEPARTMENT_ADMIN`, `SUPER_ADMIN`
- **Query Parameters:** `page`, `pageSize`, `status`, `priority`, `departmentId`, `assignedTo`, `search`

### `PATCH /api/admin/grievances/:id`
Update grievance attributes, status, or priority. (Recalculates SLA due date if priority changes).
- **Access:** Staff
- **Request Body:**
```json
{
  "priority": "CRITICAL",
  "reason": "Escalated to critical due to upcoming campus accreditation inspection."
}
```

### `POST /api/admin/grievances/:id/assign`
Assign or reassign ticket to department or officer.
- **Access:** `DEPARTMENT_ADMIN`, `SUPER_ADMIN`
- **Request Body:**
```json
{
  "department_id": "a0000000-0000-0000-0000-000000000001",
  "officer_id": "00000000-0000-0000-0000-000000000004",
  "notes": "Assigned to network engineer Mark Sterling for immediate diagnostic."
}
```

### `POST /api/admin/grievances/:id/resolve`
Officer proposes resolution notes and transitions ticket to `STUDENT_VERIFICATION`.
- **Access:** Staff
- **Request Body:**
```json
{
  "resolution_notes": "Replaced faulty Cisco core switch with spare unit. Tested connectivity on all 60 workstations."
}
```

### `POST /api/admin/grievances/:id/escalate`
Manual administrative escalation.
- **Access:** Staff
- **Request Body:**
```json
{
  "reason": "Requires procurement approval for replacement equipment exceeding departmental budget."
}
```

---

## 5. Analytics & Dashboard Endpoints

### `GET /api/admin/analytics/overview`
- **Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalGrievances": 18,
    "openCount": 11,
    "inProgressCount": 4,
    "pendingVerificationCount": 2,
    "closedCount": 5,
    "escalatedCount": 2,
    "overdueCount": 1,
    "avgResolutionHours": 3.8,
    "averageSatisfaction": 4.8,
    "totalFeedbackResponses": 5
  }
}
```

### `GET /api/admin/analytics/categories`
Category volume breakdown with average priority score and resolution rates.

### `GET /api/admin/analytics/departments`
Department-level workload, resolution rates, and SLA breach counters.

### `GET /api/admin/analytics/sla`
SLA compliance percentage, warning counts, on-track counts, and breach distribution.

### `GET /api/admin/analytics/trends`
14-day daily volume trends of submitted vs resolved grievances.

---

## 6. AI Boundary Endpoint

### `POST /api/ai/analyze-grievance`
- **Access:** Anyone
- **Request Body:**
```json
{
  "title": "Broken Water Cooler in Hostel D",
  "description": "Dirty yellow water leaking from water cooler on floor 2.",
  "category": "HOSTEL",
  "affected_students": 120
}
```
- **Response `200`:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "category": "HOSTEL",
      "subcategory": null,
      "severity": "CRITICAL",
      "urgency": "IMMEDIATE",
      "priority": "CRITICAL",
      "priorityScore": 98,
      "priorityReasons": [
        "Critical severity impact reported",
        "Immediate urgency requiring emergency response",
        "Massive campus impact: 120+ students affected"
      ],
      "department": "HOSTEL",
      "summary": "Broken Water Cooler in Hostel D: Dirty yellow water leaking...",
      "confidence": 0.88
    },
    "isAiEnhanced": false,
    "note": "Analysis generated via institutional rule-engine baseline with Gemini fallback guarantee."
  }
}
```
