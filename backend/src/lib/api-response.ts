import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';
import { ApiErrorResponse, ApiSuccessResponse } from '@/types/api';

export function jsonSuccess<T>(data: T, status = 200, meta?: ApiSuccessResponse<T>['meta']): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status }
  );
}

export function jsonError(
  message: string,
  code = 'INTERNAL_ERROR',
  status = 500,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

export function handleApiError(err: unknown): NextResponse<ApiErrorResponse> {
  if (err instanceof AppError) {
    return jsonError(err.message, err.code, err.statusCode, err.details);
  }

  if (err instanceof ZodError) {
    return jsonError('Validation failed', 'VALIDATION_ERROR', 400, err.flatten().fieldErrors);
  }

  const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
  console.error('[API_ERROR]', err);
  return jsonError(errorMessage, 'INTERNAL_SERVER_ERROR', 500);
}
