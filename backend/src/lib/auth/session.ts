import { NextRequest } from 'next/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { AuthenticatedUser } from '@/types/auth';
import { ProfileRow } from '@/types/database';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { UserRole, USER_ROLES } from '@/constants/roles';

export async function getCurrentUser(req?: NextRequest): Promise<AuthenticatedUser | null> {
  // Support Demo / Testing impersonation header if explicitly enabled in development
  const demoUserId = req?.headers.get('x-demo-user-id');
  if (process.env.NODE_ENV !== 'production' && demoUserId) {
    const demoRole = (req?.headers.get('x-demo-user-role') as UserRole) || USER_ROLES.STUDENT;
    const demoDeptId = req?.headers.get('x-demo-dept-id') || null;

    const admin = getAdminClient();
    const { data: dbProfile } = await admin
      .from('profiles')
      .select('*')
      .eq('id', demoUserId)
      .single();

    if (dbProfile) {
      return {
        id: demoUserId,
        email: dbProfile.email,
        role: dbProfile.role as UserRole,
        profile: dbProfile,
      };
    }

    return {
      id: demoUserId,
      email: `${demoRole.toLowerCase()}@campus.edu`,
      role: demoRole,
      profile: {
        id: demoUserId,
        full_name: demoRole === USER_ROLES.STUDENT ? 'Alex Mercer' : `Campus ${demoRole}`,
        email: `${demoRole.toLowerCase()}@campus.edu`,
        role: demoRole,
        department_id: demoDeptId,
        student_id: demoRole === USER_ROLES.STUDENT ? 'CS-2023-014' : null,
        phone: '+1-555-0100',
        avatar_url: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  try {
    const supabase = await getAuthenticatedSupabaseClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Fetch profile using admin client to guarantee profile retrieval
    const admin = getAdminClient();
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Default to student role if profile not yet completed
      const defaultProfile: ProfileRow = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous Student',
        email: user.email || 'student@campus.edu',
        role: USER_ROLES.STUDENT,
        department_id: null,
        student_id: null,
        phone: null,
        avatar_url: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return {
        id: user.id,
        email: user.email || '',
        role: USER_ROLES.STUDENT,
        profile: defaultProfile,
      };
    }

    const userProfile = profile as unknown as ProfileRow;
    return {
      id: user.id,
      email: user.email || userProfile.email,
      role: userProfile.role as UserRole,
      profile: userProfile,
    };
  } catch (err) {
    console.error('[AUTH_ERROR]', err);
    return null;
  }
}

export async function requireUser(req?: NextRequest): Promise<AuthenticatedUser> {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new UnauthorizedError('Authentication token or session cookie missing or expired');
  }
  return user;
}

export async function requireRole(req: NextRequest | undefined, allowedRoles: UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireUser(req);
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`Role ${user.role} is not authorized for this resource`);
  }
  return user;
}
