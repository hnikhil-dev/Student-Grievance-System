import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { jsonSuccess, jsonError, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return jsonError('Not authenticated', 'UNAUTHORIZED', 401);
    }
    return jsonSuccess({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
