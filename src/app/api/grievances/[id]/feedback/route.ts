import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';
import { createFeedbackSchema } from '@/lib/validation/feedback';
import { GRIEVANCE_STATUSES } from '@/constants/statuses';
import { jsonSuccess, handleApiError } from '@/lib/api-response';
import { ConflictError, ForbiddenError, NotFoundError } from '@/lib/errors';
import { GrievanceRow } from '@/types/database';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(req);
    const { id } = await params;
    const body = await req.json();
    const validated = createFeedbackSchema.parse(body);

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

    if (typedGrievance.student_id !== user.id) {
      throw new ForbiddenError('Only the student who submitted the grievance can submit feedback');
    }

    if (typedGrievance.status !== GRIEVANCE_STATUSES.CLOSED) {
      throw new ConflictError(
        `Feedback can only be submitted after the grievance is CLOSED. Current status: '${typedGrievance.status}'`
      );
    }

    // Check if feedback already submitted
    const { data: existingFeedback } = await admin
      .from('grievance_feedback')
      .select('id')
      .eq('grievance_id', id)
      .limit(1);

    if (existingFeedback && existingFeedback.length > 0) {
      throw new ConflictError('Feedback has already been submitted for this grievance');
    }

    const { data: feedback, error: insertError } = await admin
      .from('grievance_feedback')
      .insert({
        grievance_id: id,
        student_id: user.id,
        rating: validated.rating,
        comment: validated.comment || null,
      } as any)
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }

    return jsonSuccess(feedback, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
