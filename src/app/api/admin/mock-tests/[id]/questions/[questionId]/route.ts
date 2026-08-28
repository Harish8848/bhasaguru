import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { cacheHelpers } from '@/lib/cache';

export const dynamic = 'force-dynamic';

// PATCH - Update a question (admin)
export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) => {
  await requireAdmin();

  const { id, questionId } = await params;
  const body = await request.json();

  const question = await prisma.question.findFirst({
    where: { id: questionId, testId: id },
  });

  if (!question) {
    return ApiResponse.notFound('Question not found');
  }

  const updateData: any = { ...body };

  // Convert numeric fields
  if (body.points) updateData.points = parseInt(body.points);
  if (body.order) updateData.order = parseInt(body.order);
  if (body.preparationTime) updateData.preparationTime = parseInt(body.preparationTime);
  if (body.speakingTime) updateData.speakingTime = parseInt(body.speakingTime);

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: updateData,
  });

  // Invalidate cache
  await cacheHelpers.deletePattern('mock-tests:*');
  await cacheHelpers.deletePattern('admin-mock-tests:*');

  return ApiResponse.success(updated, 'Question updated successfully');
});

// DELETE - Delete a question (admin)
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) => {
  await requireAdmin();

  const { id, questionId } = await params;

  const question = await prisma.question.findFirst({
    where: { id: questionId, testId: id },
  });

  if (!question) {
    return ApiResponse.notFound('Question not found');
  }

  await prisma.question.delete({
    where: { id: questionId },
  });

  // Update questionsCount on the mock test
  const questionCount = await prisma.question.count({ where: { testId: id } });
  await prisma.mockTest.update({
    where: { id },
    data: { questionsCount: questionCount },
  });

  // Invalidate cache
  await cacheHelpers.deletePattern('mock-tests:*');
  await cacheHelpers.deletePattern('admin-mock-tests:*');

  return ApiResponse.success(null, 'Question deleted successfully');
});