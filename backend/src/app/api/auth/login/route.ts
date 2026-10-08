import { NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { jsonSuccess, jsonError, handleApiError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || typeof email !== 'string') {
      return jsonError('Valid email address is required', 'VALIDATION_ERROR', 400);
    }

    const admin = getAdminClient();
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Query existing profile from database
    const { data: existingProfile, error } = await admin
      .from('profiles')
      .select('*, department:departments(id, name, code)')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('[AUTH_LOGIN] Database lookup warning:', error);
    }

    if (existingProfile) {
      if (!existingProfile.is_active) {
        return jsonError('Account has been deactivated. Please contact campus admin.', 'FORBIDDEN', 403);
      }

      return jsonSuccess({
        user: {
          id: existingProfile.id,
          email: existingProfile.email,
          role: existingProfile.role,
          name: existingProfile.full_name,
          department_id: existingProfile.department_id,
          student_id: existingProfile.student_id,
          profile: existingProfile,
        },
      });
    }

    // 2. Dynamic student registration for institutional emails
    const isStudent = role === 'STUDENT' || normalizedEmail.includes('student');
    const assignedRole = isStudent ? 'STUDENT' : 'OFFICER';

    const namePart = normalizedEmail
      .split('@')[0]
      .replace(/^student\./, '')
      .replace(/^officer\./, '')
      .replace(/[._-]/g, ' ');
    const formattedName =
      namePart
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || 'Campus Student';

    const newId = crypto.randomUUID();
    const newProfile = {
      id: newId,
      full_name: formattedName,
      email: normalizedEmail,
      role: assignedRole,
      department_id: null,
      student_id: isStudent ? `CS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}` : null,
      phone: '+1-555-0199',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await admin
      .from('profiles')
      .insert(newProfile)
      .select('*')
      .single();

    if (insertError) {
      console.warn('[AUTH_LOGIN] Auto-registration fallback:', insertError);
      return jsonSuccess({
        user: {
          id: newProfile.id,
          email: newProfile.email,
          role: newProfile.role,
          name: newProfile.full_name,
          department_id: null,
          student_id: newProfile.student_id,
          profile: newProfile,
        },
      });
    }

    return jsonSuccess({
      user: {
        id: inserted.id,
        email: inserted.email,
        role: inserted.role,
        name: inserted.full_name,
        department_id: inserted.department_id,
        student_id: inserted.student_id,
        profile: inserted,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
