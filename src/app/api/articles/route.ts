import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { ArticleStatus } from '@/generated/prisma/client';
import { cacheHelpers } from '@/lib/cache';

// GET - List published articles with optional filtering

interface WhereClause {
  status?: ArticleStatus;
  language?: string;
  category?: string;
}

// GET - List published articles with pagination and optional filters

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') as ArticleStatus;
  const language = searchParams.get('language');
  const category = searchParams.get('category');

  const cacheKey = `articles:${status || 'published'}:${language || 'all'}:${category || 'all'}:${page}:${limit}`;

  const cachedData = await cacheHelpers.get(cacheKey);
  if (cachedData) {
    return ApiResponse.success(cachedData);
  }

  const where: WhereClause = {};

  // Default to published articles only for public API
  if (status) {
    where.status = status;
  } else {
    where.status = 'PUBLISHED';
  }

  if (language) where.language = language;
  if (category) where.category = category;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.article.count({ where }),
  ]);

  const result = {
    data: articles,
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
