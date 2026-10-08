# Admin Frontend: Phase 0 Foundation (`frontend/admin`)
**Visual Identity:** Soft Botanical Green + Warm Neutral Enterprise Platform

---

## 🎨 Design Tokens & Palette

The admin system uses a calming botanical and academic visual identity:

- **Primary Green:** `#427B65` (Primary buttons, active navigation, primary indicators)
- **Deep Forest Green:** `#14433D` (Sidebar, key headings, high-emphasis text)
- **Secondary Green:** `#6A9282` (Icons, supporting indicators)
- **Light Botanical:** `#E6F3EE` (Selected states, light cards, subtle highlights)
- **Admin Background:** `#F6F8F6` (Main canvas background)
- **Card / Surface:** `#FDFDFD` (1px solid `#D7E4DF`, subtle shadows)
- **Soft Sky:** `#E1EEF7` (Informational & AI badges)
- **Warm Cream / Soft Beige:** `#F6F2E9` / `#EBD8C0` (Subtle accent pills)
- **Primary Text:** `#234E42`
- **Secondary Text:** `#71847E`
- **Status Colors:**
  - Success: `#4F8A70`
  - Warning: `#C99A4A`
  - Danger: `#C86B62`

---

## 🧭 Information Architecture (Navigation Hierarchy)

```
ADMIN
  └─ Command Center            (/admin/command-center)

OPERATIONS
  └─ Departments               (/admin/departments)

AI OPERATIONS
  ├─ AI Classification         (/admin/classification)
  ├─ Priority Engine           (/admin/priority)
  ├─ Duplicate Detection       (/admin/duplicates)
  └─ Clustering                (/admin/clusters)

SERVICE MANAGEMENT
  ├─ SLA Monitoring            (/admin/sla)
  └─ Escalation                (/admin/escalation)

INTELLIGENCE
  ├─ Analytics                 (/admin/analytics)
  └─ AI Insights               (/admin/insights)
```

---

## 🧱 Phase 0 Reusable Component Library

Located in `frontend/admin/components/`:

- **Layout:**
  - `AdminLayout`: Desktop / tablet / mobile layout container with drawer support.
  - `AdminSidebar`: Deep forest green navigation with collapsible mode, icons, and badges.
  - `AdminHeader`: Surface header with breadcrumbs, search input, notification bell, and system health status.
- **UI Foundation:**
  - `Button`: Primary, secondary, outline, ghost, danger variants with loading states.
  - `Card`: Surface cards with `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`.
  - `StatCard`: Enterprise metric cards with title, value, subtitle, trend indicators, and bottom accent line.
  - `Badge`, `StatusBadge`, `PriorityBadge`: Semantic status and priority indicators.
  - `SearchInput`: Accessible search with magnifying icon and clear button.
  - `FilterDropdown`: Custom styled select dropdown.
  - `Tabs`: Accessible tab navigation with count pills.
  - `DataTable`: Horizontally scrollable table with alternating rows and empty fallbacks.
  - `LoadingState`: Spinner, inline, and skeleton loaders.
  - `EmptyState`: Botanical icon, title, description, and action button.
  - `ErrorState`: Semantic danger warning with retry handler.
  - `Modal`: Accessible dialog with backdrop blur and Escape key dismissal.

---

## 🚀 Implementation Roadmap

- [x] **PHASE 0:** Admin Foundation (Layout, Sidebar, Header, Design System, UI Components, State Handlers)
- [x] **PHASE 1:** Admin Command Center (Operational Header, Date Selector, Live Refresh, KPI Cards, Volume Trend, Priority Breakdown, Department Performance, SLA Health, Activity Feed, Critical Attention Issues)
- [x] **PHASE 2:** Department Dashboard (Top Metrics, 8 Departments Table, Visual Benchmarks with Sorting, Deep Detail Drill-down with Trend & Category Charts, Multi-Dimensional Filters)
- [x] **PHASE 3:** AI Classification (Explainable Categorization, Confidence Scores, Feature Attribution, Supervised Overrides)
- [x] **PHASE 4:** Priority Engine (Transparent Severity Scoring Matrix, Policy Rules, Confirmed Overrides)
- [x] **PHASE 5:** Duplicate Detection (Side-by-Side Comparison, Keyword Entity Matching, Authorized Merges)
- [x] **PHASE 6:** Clustering (Systemic Theme Patterns, Root Cause Hypotheses, Growth Trajectories)
- [x] **PHASE 7:** SLA Monitoring (Real-time Threshold Radar, At-Risk & Breached Queues, Countdown Surveillance)
- [x] **PHASE 8:** Escalation (Level 1–3 Governance, Vertical Event Chronology, Policy Directives, Ratification)
- [x] **PHASE 9:** Analytics (Longitudinal Trends, Resolution Velocity, Sector Benchmarks, AI Accuracy Audit)
- [x] **PHASE 10:** AI Insights (Administrative Intelligence, Explainability Answers, Evidence Traces, Cross-Linking)
- [x] **FINAL:** Complete UI/UX, Design Consistency, Accessibility, and Code Quality Audit
