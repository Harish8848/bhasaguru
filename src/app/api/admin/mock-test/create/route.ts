import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { createTestSchema, validateBody } from '@/lib/validation';

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const validation = await validateBody(request, createTestSchema);
  if (validation.errors) {
    return ApiResponse.error('Validation failed', 400, validation.errors.format());
  }

  // Verify course exists if courseId is provided
  if (validation.data.courseId) {
    const course = await prisma.course.findUnique({
      where: { id: validation.data.courseId },
      select: { id: true, title: true },
    });

    if (!course) {
      return ApiResponse.error('Course not found', 404);
    }
  }

  const test = await prisma.mockTest.create({
    data: validation.data,
    include: {
      course: {
        select: {
          id: true,
          title: true,
          language: true,
        },
      },
    },
  });

  return ApiResponse.success(test, 'Mock test created successfully', 201);
});
