import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { createQuestionSchema, updateQuestionSchema, validateBody } from '@/lib/validation';

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const testId = searchParams.get('testId');
  const difficulty = searchParams.get('difficulty');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Build where clause
  const where: any = {};
  if (testId) {
    where.testId = testId;
  }

  // Note: The schema doesn't have a difficulty field on questions directly
  // Difficulty might be inferred from the test or need to be added to schema
  // For now, we'll skip the difficulty filter since it's not in the current schema

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        test: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { order: 'asc' },
    }),
    prisma.question.count({ where }),
  ]);

  return ApiResponse.paginated(questions, total, page, limit);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const validation = await validateBody(request, createQuestionSchema);
  if (validation.errors) {
    return ApiResponse.error('Validation failed', 400, validation.errors.format());
  }

  const question = await prisma.question.create({
    data: validation.data,
    include: {
      test: {
        select: {
          id: true,
          title: true,
          type: true,
        },
      },
    },
  });

  return ApiResponse.success(question, 'Question created successfully', 201);
});

export const PUT = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return ApiResponse.error('Question ID is required', 400);
  }

  const validation = await validateBody(request, updateQuestionSchema);
  if (validation.errors) {
    return ApiResponse.error('Validation failed', 400, validation.errors.format());
  }

  const question = await prisma.question.update({
    where: { id },
    data: validation.data,
    include: {
      test: {
        select: {
          id: true,
          title: true,
          type: true,
        },
      },
    },
  });

  return ApiResponse.success(question, 'Question updated successfully');
});

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return ApiResponse.error('Question ID is required', 400);
  }

  await prisma.question.delete({
    where: { id },
  });

  return ApiResponse.success(null, 'Question deleted successfully');
});
