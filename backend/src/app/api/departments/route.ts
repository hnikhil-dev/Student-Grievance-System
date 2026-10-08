import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const admin = getAdminClient();
    const { data: departments, error } = await admin
      .from('departments')
      .select('id, name, code, description')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    return jsonSuccess(departments || []);
  } catch (err) {
    return handleApiError(err);
  }
}
