import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { getGrievanceById } from '@/lib/grievance/service';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(req);
    const { id } = await params;
    const grievance = await getGrievanceById(id, user);

    return jsonSuccess(grievance);
  } catch (err) {
    return handleApiError(err);
  }
}
