import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { ArticleStatus } from '@/generated/prisma/client';

// GET - List all culture posts
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') as ArticleStatus;

  const where: { status?: ArticleStatus } = {};
  if (status) where.status = status;

  const [posts, total] = await Promise.all([
    prisma.culturePost.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.culturePost.count({ where }),
  ]);

  return ApiResponse.success({
    data: posts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// POST - Create new culture post
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();

  const {
    title,
    slug,
    excerpt,
    content,
    language,
    featuredImage,
    status,
    readTime,
    authorName,
  } = body;

  // Generate slug if not provided
  let postSlug = slug;
  if (!postSlug) {
    postSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  }

  // Check if slug already exists
  const existing = await prisma.culturePost.findUnique({
    where: { slug: postSlug },
  });

  if (existing) {
    return ApiResponse.error('A culture post with this slug already exists', 400);
  }

  const post = await prisma.culturePost.create({
    data: {
      title,
      slug: postSlug,
      excerpt,
      content,
      language: language || 'Japanese',
      featuredImage,
      status: status || 'DRAFT',
      readTime: readTime ? parseInt(readTime) : null,
      authorName,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
  });

  return ApiResponse.success(post, undefined, 201);
});