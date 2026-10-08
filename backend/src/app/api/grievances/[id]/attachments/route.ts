import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { canAccessGrievance } from '@/lib/auth/rbac';
import { jsonSuccess, handleApiError } from '@/lib/api-response';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import { GrievanceRow } from '@/types/database';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const attachmentMetadataSchema = z.object({
  file_name: z.string().min(1).max(255),
  file_path: z.string().min(1).max(1024),
  file_type: z.string().refine((type) => ALLOWED_MIME_TYPES.includes(type.toLowerCase()), {
    message: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
  }),
  file_size: z.number().int().positive().max(MAX_FILE_SIZE_BYTES, {
    message: 'File size must not exceed 10 MB',
  }),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser(req);
    const { id } = await params;
    const body = await req.json();
    const validated = attachmentMetadataSchema.parse(body);

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
      throw new ForbiddenError('Not authorized to attach files to this grievance');
    }

    // Verify safe file extension matching MIME type
    const ext = validated.file_name.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'txt'];
    if (!ext || !validExtensions.includes(ext)) {
      throw new ValidationError('File extension does not match authorized file types');
    }

    const { data: attachment, error: insertError } = await admin
      .from('grievance_attachments')
      .insert({
        grievance_id: id,
        uploaded_by: user.id,
        file_name: validated.file_name,
        file_path: validated.file_path,
        file_type: validated.file_type.toLowerCase(),
        file_size: validated.file_size,
      } as any)
      .select('*')
      .single();

    if (insertError) throw insertError;

    return jsonSuccess(attachment, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
