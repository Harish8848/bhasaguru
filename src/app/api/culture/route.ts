import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { ArticleStatus } from '@/generated/prisma/client';
import { cacheHelpers } from '@/lib/cache';

// GET - List published culture posts with pagination and optional filters

interface WhereClause {
  status?: ArticleStatus;
  language?: string;
}

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') as ArticleStatus;
  const language = searchParams.get('language');

  const cacheKey = `culture:${status || 'published'}:${language || 'all'}:${page}:${limit}`;

  const cachedData = await cacheHelpers.get(cacheKey);
  if (cachedData) {
    return ApiResponse.success(cachedData);
  }

  const where: WhereClause = {};

  // Default to published posts only for public API
  if (status) {
    where.status = status;
  } else {
    where.status = 'PUBLISHED';
  }

  if (language) where.language = language;

  const [posts, total] = await Promise.all([
    prisma.culturePost.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.culturePost.count({ where }),
  ]);

  const result = {
    data: posts,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  };

  await cacheHelpers.set(cacheKey, result, 300);

  return ApiResponse.success(result);
});