import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

// GET - List articles with pagination and optional status filter

export const GET = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin();
  
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
  
    const where: any = {};
    if (status) where.status = status;
  
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
        orderBy: { createdAt: 'desc' },
      }),
      prisma.article.count({ where }),
    ]);
  
    return ApiResponse.paginated(articles, total, page, limit);
  });
  
  // POST - Create article
  export const POST = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin();
  
    const body = await request.json();
  
    // Generate slug
    const slug = body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
    const article = await prisma.article.create({
      data: {
        ...body,
        slug,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
      },
    });
  
    return ApiResponse.success(article, 'Article created successfully', 201);
  });
  