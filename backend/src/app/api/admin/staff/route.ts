import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { STAFF_ROLES } from '@/constants/roles';
import { getAdminClient } from '@/lib/supabase/admin';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, STAFF_ROLES);
    const admin = getAdminClient();

    const { data: staff, error } = await admin
      .from('profiles')
      .select('id, full_name, email, role, department_id, department:departments(id, name, code)')
      .in('role', ['OFFICER', 'DEPARTMENT_ADMIN', 'SUPER_ADMIN'])
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) throw error;

    return jsonSuccess(staff || []);
  } catch (err) {
    return handleApiError(err);
  }
}
