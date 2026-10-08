/**
 * Dynamic Session & API Helper for Student & Admin Frontends
 * Connects dynamically to backend API routes with real-time and session support.
 */

export type UserRole = 'STUDENT' | 'DEPT_OFFICER' | 'DEPT_ADMIN' | 'ADMIN' | 'SUPER_ADMIN';

export interface DynamicSessionUser {
  id: string;
  role: UserRole;
  email?: string;
  name?: string;
  studentId?: string;
  departmentId?: string | null;
  profile?: Record<string, any>;
}

// Default fallback ID for rapid local testing if no session exists in browser storage
export const DEFAULT_DEMO_STUDENT_ID = '00000000-0000-0000-0000-000000000006';
export const DEFAULT_DEMO_STUDENT_ROLE = 'STUDENT';
export const DEFAULT_DEMO_ADMIN_ID = '00000000-0000-0000-0000-000000000001';
export const DEFAULT_DEMO_ADMIN_ROLE = 'SUPER_ADMIN';

export function getStoredUser(): DynamicSessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sg_active_user') || sessionStorage.getItem('sg_active_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed;
    }
  } catch {}
  return null;
}

export function setStoredUser(user: DynamicSessionUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('sg_active_user', JSON.stringify(user));
  } catch {}
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('sg_active_user');
    sessionStorage.removeItem('sg_active_user');
  } catch {}
}

/**
 * Returns dynamic authentication headers:
 * Prioritizes the active logged-in user in storage, falling back cleanly to demo headers for local testing.
 */
export function getDynamicAuthHeaders(customHeaders?: HeadersInit): HeadersInit {
  const stored = getStoredUser();
  const userId = stored?.id || DEFAULT_DEMO_STUDENT_ID;
  const userRole = stored?.role || DEFAULT_DEMO_STUDENT_ROLE;

  const baseHeaders: Record<string, string> = {
    'x-demo-user-id': userId,
    'x-demo-user-role': userRole,
  };

  if (stored?.departmentId) {
    baseHeaders['x-demo-dept-id'] = stored.departmentId;
  }

  // Merge any custom headers
  if (customHeaders instanceof Headers) {
    const merged = new Headers(baseHeaders);
    customHeaders.forEach((value, key) => merged.set(key, value));
    return merged;
  }

  if (Array.isArray(customHeaders)) {
    const merged: Record<string, string> = { ...baseHeaders };
    customHeaders.forEach(([k, v]) => {
      merged[k] = v;
    });
    return merged;
  }

  return {
    ...baseHeaders,
    ...(customHeaders as Record<string, string>),
  };
}

/**
 * Convenience wrapper around native fetch with dynamic authentication headers
 */
export async function dynamicFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = getDynamicAuthHeaders(options.headers);
  return fetch(url, {
    ...options,
    headers,
  });
}
