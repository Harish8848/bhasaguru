import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const [tests, total] = await Promise.all([
    prisma.mockTest.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            attempts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.mockTest.count(),
  ]);

  return ApiResponse.paginated(tests, total, page, limit);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin();
  
    const body = await request.json();
  
    const test = await prisma.mockTest.create({
      data: body,
    });
  
    return ApiResponse.success(test, 'Test created successfully', 201);
  });
