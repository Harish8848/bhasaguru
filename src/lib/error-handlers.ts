import { Prisma } from '@/lib/prisma/client';
import { ZodError } from 'zod';
import { ApiResponse } from '@/lib/api-response';

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return ApiResponse.error(
      'Validation failed',
      400,
      error.issues.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return ApiResponse.error('A record with this value already exists', 409);
      case 'P2025':
        return ApiResponse.notFound('Record not found');
      case 'P2003':
        return ApiResponse.error('Referenced record does not exist', 400);
      default:
        return ApiResponse.serverError('Database error');
    }
  }

  // Custom application errors
  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return ApiResponse.unauthorized();
    }
    if (error.message.startsWith('Forbidden')) {
      return ApiResponse.forbidden(error.message);
    }
    return ApiResponse.error(error.message, 400);
  }

  // Unknown errors
  return ApiResponse.serverError();
}
