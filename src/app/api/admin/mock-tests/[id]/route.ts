import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { cacheHelpers } from '@/lib/cache';

// GET - Get single mock test (admin)
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const test = await prisma.mockTest.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: {
          attempts: true,
          questions: true,
        },
      },
    },
  });

  if (!test) {
    return ApiResponse.notFound('Mock test not found');
  }

  return ApiResponse.success(test);
});

// PATCH - Update mock test
export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;
  const body = await request.json();

  const updateData: any = { ...body };

  // Convert numeric fields
  if (body.duration) updateData.duration = parseInt(body.duration);
  if (body.passingScore) updateData.passingScore = parseInt(body.passingScore);
  if (body.questionsCount) updateData.questionsCount = parseInt(body.questionsCount);

  const test = await prisma.mockTest.update({
    where: { id },
    data: updateData,
  });

  // Invalidate cache so both admin and user list reflect the update
  await cacheHelpers.deletePattern('mock-tests:*');
  await cacheHelpers.deletePattern('admin-mock-tests:*');

  return ApiResponse.success(test, 'Mock test updated successfully');
});

// DELETE - Delete mock test
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const test = await prisma.mockTest.findUnique({
    where: { id },
  });

  if (!test) {
    return ApiResponse.notFound('Mock test not found');
  }

  await prisma.mockTest.delete({
    where: { id },
  });

  // Invalidate cache so deleted test no longer appears to users
  await cacheHelpers.deletePattern('mock-tests:*');
  await cacheHelpers.deletePattern('admin-mock-tests:*');

  return ApiResponse.success(null, 'Mock test deleted successfully');
});
