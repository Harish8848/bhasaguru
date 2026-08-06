import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { cacheHelpers } from '@/lib/cache';

// GET - List mock tests with pagination and optional filters

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const language = searchParams.get('language');
  const type = searchParams.get('type');
  const search = searchParams.get('search');

  const where: any = {};

  if (language) {
    where.language = language;
  }

  if (type) {
    where.type = type;
  }

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const [tests, total] = await Promise.all([
    prisma.mockTest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            attempts: true,
            questions: true,
          },
        },
      },
    }),
    prisma.mockTest.count({ where }),
  ]);

  const result = {
    data: tests,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  return ApiResponse.success(result);
});
