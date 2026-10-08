import {
  getDynamicAuthHeaders,
  DEFAULT_DEMO_ADMIN_ID,
  DEFAULT_DEMO_ADMIN_ROLE,
} from '../../lib/api';
import {
  MOCK_COMMAND_CENTER_DATA,
  CriticalIssue,
  DepartmentWorkload,
  VolumeTrendPoint,
  PriorityDistributionItem,
  SlaHealthMetrics,
} from './commandCenterData';
import { MOCK_DEPARTMENTS, DepartmentDetailData } from './departmentData';

export interface AdminGrievanceFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  departmentId?: string;
  assignedTo?: string;
  search?: string;
}

export interface BackendDepartment {
  id: string;
  name: string;
  code: string;
}

export interface BackendOverviewMetrics {
  totalGrievances: number;
  openCount: number;
  inProgressCount: number;
  pendingVerificationCount: number;
  closedCount: number;
  escalatedCount: number;
  overdueCount: number;
  avgResolutionHours: number;
  averageSatisfaction: number;
  totalFeedbackResponses: number;
}

/**
 * Service providing real-time backend communication for the Admin Portal
 * with graceful fallback to institutional defaults if offline or empty.
 */
export const adminApiService = {
  /**
   * Fetch authenticated admin session profile
   */
  async getAdminSession() {
    try {
      const res = await fetch('/api/auth/me', {
        headers: getDynamicAuthHeaders({
          'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
          'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        return data.data.user;
      }
    } catch (err) {
      console.warn('[adminApiService] Error fetching auth/me, using demo fallback:', err);
    }
    return {
      id: DEFAULT_DEMO_ADMIN_ID,
      role: DEFAULT_DEMO_ADMIN_ROLE,
      email: 'admin.director@campus.edu',
      profile: {
        id: DEFAULT_DEMO_ADMIN_ID,
        full_name: 'Dr. Arthur Vance (Dean)',
        role: DEFAULT_DEMO_ADMIN_ROLE,
      },
    };
  },

  /**
   * Fetch active campus departments
   */
  async getDepartments(): Promise<BackendDepartment[]> {
    try {
      const res = await fetch('/api/departments', {
        headers: getDynamicAuthHeaders({
          'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
          'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        return data.data;
      }
    } catch (err) {
      console.warn('[adminApiService] Error fetching departments:', err);
    }
    return MOCK_DEPARTMENTS.map((d) => ({ id: d.id, name: d.name, code: d.code }));
  },

  /**
   * Fetch real admin analytics overview
   */
  async getOverviewAnalytics(): Promise<BackendOverviewMetrics | null> {
    try {
      const res = await fetch('/api/admin/analytics/overview', {
        headers: getDynamicAuthHeaders({
          'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
          'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    } catch (err) {
      console.warn('[adminApiService] Error fetching analytics overview:', err);
    }
    return null;
  },

  /**
   * Fetch 14-day volume trends from backend
   */
  async getVolumeTrends(): Promise<VolumeTrendPoint[]> {
    try {
      const res = await fetch('/api/admin/analytics/trends', {
        headers: getDynamicAuthHeaders({
          'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
          'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        return data.data.map((t: any) => ({
          date: t.date ? new Date(t.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : t.date,
          incoming: Number(t.incoming || t.submitted || 0),
          resolved: Number(t.resolved || 0),
        }));
      }
    } catch (err) {
      console.warn('[adminApiService] Error fetching trends:', err);
    }
    return MOCK_COMMAND_CENTER_DATA.trends;
  },

  /**
   * Fetch department workload metrics from backend
   */
  async getDepartmentWorkloads(): Promise<DepartmentWorkload[]> {
    try {
      const res = await fetch('/api/admin/analytics/departments', {
        headers: getDynamicAuthHeaders({
          'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
          'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        return data.data.map((d: any) => ({
          id: d.id || d.department_id,
          name: d.name || d.department_name || 'Department',
          code: d.code || 'DEPT',
          totalGrievances: d.totalGrievances || d.total || 0,
          resolutionRate: d.resolutionRate || 85,
          slaPercentage: d.slaPercentage || d.slaRate || 92,
          active: d.activeCount || d.active || 0,
          resolved: d.resolvedCount || d.resolved || 0,
          headName: d.headName || 'Department Dean',
          atRiskCount: d.atRiskCount || d.overdueCount || 0,
        }));
      }
    } catch (err) {
      console.warn('[adminApiService] Error fetching department workloads:', err);
    }
    return MOCK_COMMAND_CENTER_DATA.departments;
  },

  /**
   * Fetch SLA health metrics from backend
   */
  async getSlaHealth(): Promise<SlaHealthMetrics> {
    try {
      const res = await fetch('/api/admin/analytics/sla', {
        headers: getDynamicAuthHeaders({
          'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
          'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        const total = (d.healthyCount || 0) + (d.atRiskCount || 0) + (d.breachedCount || 0) || 1;
        return {
          healthyCount: d.healthyCount || 0,
          atRiskCount: d.atRiskCount || 0,
          breachedCount: d.breachedCount || 0,
          healthyPercent: Math.round(((d.healthyCount || 0) / total) * 100),
          atRiskPercent: Math.round(((d.atRiskCount || 0) / total) * 100),
          breachedPercent: Math.round(((d.breachedCount || 0) / total) * 100),
        };
      }
    } catch (err) {
      console.warn('[adminApiService] Error fetching SLA analytics:', err);
    }
    return MOCK_COMMAND_CENTER_DATA.slaHealth;
  },

  /**
   * Fetch scoped grievances from backend
   */
  async getGrievances(filters: AdminGrievanceFilters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', String(filters.page));
      if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`/api/admin/grievances?${params.toString()}`, {
        headers: getDynamicAuthHeaders({
          'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
          'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return {
          items: data.data,
          meta: data.meta || { totalCount: data.data.length, page: 1, pageSize: 20 },
        };
      }
    } catch (err) {
      console.warn('[adminApiService] Error fetching grievances:', err);
    }
    return { items: [], meta: { totalCount: 0, page: 1, pageSize: 20 } };
  },

  /**
   * Fetch Critical Issues mapped to CriticalIssue interface
   */
  async getCriticalIssues(): Promise<CriticalIssue[]> {
    try {
      const res = await this.getGrievances({
        pageSize: 15,
        priority: 'CRITICAL',
      });

      if (res.items.length > 0) {
        return res.items.map((g: any) => {
          const slaRemainingMinutes = g.sla_status?.remainingMinutes ?? 60;
          const isBreached = g.sla_status?.isOverdue ?? false;
          const isWarning = g.sla_status?.isWarning ?? false;
          const slaHealth = isBreached ? 'BREACHED' : isWarning ? 'AT_RISK' : 'HEALTHY';

          const createdTime = new Date(g.created_at).getTime();
          const elapsedMins = Math.round((Date.now() - createdTime) / 60000);
          const reportedAgo =
            elapsedMins < 60
              ? `${elapsedMins}m ago`
              : `${Math.round(elapsedMins / 60)}h ago`;

          return {
            id: g.id,
            ticketNumber: g.ticket_number,
            title: g.title,
            category: g.category || 'General',
            department: g.department?.name || 'General Operations',
            priority: g.priority || 'CRITICAL',
            priorityScore: g.priority_score || 90,
            status: g.status || 'IN_PROGRESS',
            cohortImpact: g.affected_students || 1,
            assignedOfficer: g.assignee?.full_name || 'Unassigned',
            slaRemainingMinutes: Math.max(0, slaRemainingMinutes),
            slaHealth,
            reportedAgo,
            location: g.location || 'Campus Wide',
            description: g.description || '',
          };
        });
      }
    } catch (err) {
      console.warn('[adminApiService] Error mapping critical issues:', err);
    }
    return MOCK_COMMAND_CENTER_DATA.criticalIssues;
  },

  /**
   * Assign grievance to a department and/or officer
   */
  async assignGrievance(id: string, departmentId: string, officerId?: string, notes?: string) {
    const res = await fetch(`/api/admin/grievances/${id}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getDynamicAuthHeaders({
          'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
          'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
        }),
      },
      body: JSON.stringify({
        department_id: departmentId,
        officer_id: officerId || undefined,
        notes: notes || 'Assigned via Admin Command Center',
      }),
    });
    return res.json();
  },

  /**
   * Propose resolution notes for closed-loop student verification
   */
  async resolveGrievance(id: string, resolutionNotes: string) {
    const res = await fetch(`/api/admin/grievances/${id}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getDynamicAuthHeaders({
          'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
          'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
        }),
      },
      body: JSON.stringify({
        resolution_notes: resolutionNotes,
      }),
    });
    return res.json();
  },

  /**
   * Escalate grievance to higher authority
   */
  async escalateGrievance(id: string, reason: string, escalatedTo?: string) {
    const res = await fetch(`/api/admin/grievances/${id}/escalate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getDynamicAuthHeaders({
          'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
          'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
        }),
      },
      body: JSON.stringify({
        reason,
        escalated_to: escalatedTo || undefined,
      }),
    });
    return res.json();
  },

  /**
   * Update grievance priority, status, or notes
   */
  async updateGrievance(id: string, payload: { priority?: string; status?: string; reason?: string }) {
    const res = await fetch(`/api/admin/grievances/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getDynamicAuthHeaders({
          'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
          'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
        }),
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  /**
   * Analyze grievance using AI Boundary / Rules engine
   */
  async analyzeWithAi(params: {
    title: string;
    description: string;
    category?: string;
    affected_students?: number;
  }) {
    const res = await fetch('/api/ai/analyze-grievance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getDynamicAuthHeaders({
          'x-demo-user-id': DEFAULT_DEMO_ADMIN_ID,
          'x-demo-user-role': DEFAULT_DEMO_ADMIN_ROLE,
        }),
      },
      body: JSON.stringify(params),
    });
    return res.json();
  },
};
