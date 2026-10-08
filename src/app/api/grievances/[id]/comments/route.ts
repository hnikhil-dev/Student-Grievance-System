import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';
import { createCommentSchema } from '@/lib/validation/comment';
import { canAccessGrievance, isStaff } from '@/lib/auth/rbac';
import { sendNotification } from '@/lib/notification/service';
import { jsonSuccess, handleApiError } from '@/lib/api-response';
import { ForbiddenError, NotFoundError } from '@/lib/errors';
import { GrievanceRow } from '@/types/database';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(req);
    const { id } = await params;
    const admin = getAdminClient();

    const { data: grievance, error: grvError } = await admin
      .from('grievances')
      .select('*')
      .eq('id', id)
      .single();

    if (grvError || !grievance) {
      throw new NotFoundError('Grievance not found');
    }

    if (!canAccessGrievance(user, grievance as GrievanceRow)) {
      throw new ForbiddenError('Not authorized to access this grievance');
    }

    let query = admin
      .from('grievance_comments')
      .select(`
        *,
        author:profiles(id, full_name, email, role, avatar_url)
      `)
      .eq('grievance_id', id)
      .order('created_at', { ascending: true });

    if (!isStaff(user)) {
      query = query.eq('is_internal', false);
    }

    const { data: comments, error } = await query;
    if (error) throw error;

    return jsonSuccess(comments || []);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(req);
    const { id } = await params;
    const body = await req.json();
    const validated = createCommentSchema.parse(body);

    const admin = getAdminClient();
    const { data: grievance, error: grvError } = await admin
      .from('grievances')
      .select('*')
      .eq('id', id)
      .single();

    if (grvError || !grievance) {
      throw new NotFoundError('Grievance not found');
    }

    const typedGrievance = grievance as GrievanceRow;
    if (!canAccessGrievance(user, typedGrievance)) {
      throw new ForbiddenError('Not authorized to comment on this grievance');
    }

    // Students cannot post internal comments
    if (validated.is_internal && !isStaff(user)) {
      throw new ForbiddenError('Students cannot create internal notes');
    }

    const { data: comment, error: insertError } = await admin
      .from('grievance_comments')
      .insert({
        grievance_id: id,
        user_id: user.id,
        message: validated.message,
        is_internal: validated.is_internal,
      } as any)
      .select(`
        *,
        author:profiles(id, full_name, email, role)
      `)
      .single();

    if (insertError || !comment) {
      throw new Error(`Failed to post comment: ${insertError?.message}`);
    }

    // Notify appropriate counterparty if not an internal note
    if (!validated.is_internal) {
      if (user.id === typedGrievance.student_id && typedGrievance.assigned_to) {
        // Student commented -> notify assigned officer
        await sendNotification({
          userId: typedGrievance.assigned_to,
          grievanceId: id,
          type: 'COMMENT_ADDED',
          title: `New Comment on ${typedGrievance.ticket_number}`,
          message: `Student commented: "${validated.message.slice(0, 100)}..."`,
        });
      } else if (user.id !== typedGrievance.student_id) {
        // Staff commented -> notify student
        await sendNotification({
          userId: typedGrievance.student_id,
          grievanceId: id,
          type: 'COMMENT_ADDED',
          title: `Officer Update on ${typedGrievance.ticket_number}`,
          message: `New message: "${validated.message.slice(0, 100)}..."`,
        });
      }
    }

    return jsonSuccess(comment, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
