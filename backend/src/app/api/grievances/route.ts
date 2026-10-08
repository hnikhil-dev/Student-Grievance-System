import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { createGrievanceSchema } from '@/lib/validation/grievance';
import { createGrievance } from '@/lib/grievance/service';
import { CreateGrievanceDTO } from '@/types/grievance';
import { jsonSuccess, handleApiError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const validatedData = createGrievanceSchema.parse(body);

    const grievance = await createGrievance(validatedData as CreateGrievanceDTO, user);

    return jsonSuccess(grievance, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
