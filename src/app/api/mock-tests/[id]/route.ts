import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // Allow both authenticated and public access to test metadata
  const session = await getServerSession(authOptions);
  
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
  // Only allow authenticated users (not necessarily admin) to update tests
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return ApiResponse.error('Authentication required', 401);
  }

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
  // Only allow admin to delete tests
  const { requireAdmin } = await import('@/lib/auth-middleware');
  await requireAdmin();

  const { id } = await params;

  await prisma.mockTest.delete({
    where: { id },
  });

  return ApiResponse.success(null, 'Test deleted successfully');
});
