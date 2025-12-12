import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const test = await prisma.mockTest.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          attempts: true,
          questions: true,
        },
      },
    },
  });

  if (!test) {
    return ApiResponse.notFound('Test not found');
  }

  return ApiResponse.success(test);
});

export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const body = await request.json();
  const { id } = await params;

  const test = await prisma.mockTest.update({
    where: { id },
    data: body,
    include: {
      _count: {
        select: {
          attempts: true,
          questions: true,
        },
      },
    },
  });

  return ApiResponse.success(test, 'Test updated successfully');
});

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  await prisma.mockTest.delete({
    where: { id },
  });

  return ApiResponse.success(null, 'Test deleted successfully');
});
