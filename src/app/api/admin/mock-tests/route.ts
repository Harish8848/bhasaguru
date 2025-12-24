import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { cacheHelpers } from '@/lib/cache';

export const GET = withErrorHandler(async (request: NextRequest) => {
  // Check cache first before auth check to speed up if possible? 
  // No, admin route should always check auth.
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const cacheKey = `mock-tests:list:${page}:${limit}`;

  const cachedData = await cacheHelpers.get(cacheKey);
  if (cachedData) {
    return ApiResponse.success(cachedData);
  }

  const [tests, total] = await Promise.all([
    prisma.mockTest.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            attempts: true,
            questions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.mockTest.count(),
  ]);

  const result = {
    data: tests,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  };

  await cacheHelpers.set(cacheKey, result, 300);

  return ApiResponse.paginated(tests, total, page, limit);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin();
  
    const body = await request.json();
  
    const test = await prisma.mockTest.create({
      data: body,
    });

    await cacheHelpers.deletePattern('mock-tests:*');
  
    return ApiResponse.success(test, 'Test created successfully', 201);
  });
