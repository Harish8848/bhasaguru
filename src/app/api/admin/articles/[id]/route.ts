import { ArticleStatus } from '@/generated/prisma/client';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

// GET - Get single article
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  if (!article) {
    return ApiResponse.notFound('Article not found');
  }

  return ApiResponse.success(article);
});

// PATCH - Update article
export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;
  const body = await request.json();

  // Generate unique slug if title is being updated
  const updateData = { ...body };
  if (body.title) {
    let baseSlug = body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let slug = baseSlug;
    let counter = 1;

    // Check for existing slugs (excluding current article) and append counter if needed
    while (await prisma.article.findUnique({ where: { slug, NOT: { id } } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    updateData.slug = slug;
  }

  // Handle publishedAt based on status
  if (body.status === 'PUBLISHED' && !body.publishedAt) {
    updateData.publishedAt = new Date();
  } else if (body.status === 'DRAFT') {
    updateData.publishedAt = null;
  }

  const article = await prisma.article.update({
    where: { id },
    data: updateData,
  });

  return ApiResponse.success(article, 'Article updated successfully');
});

// DELETE - Delete article
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    return ApiResponse.notFound('Article not found');
  }

  await prisma.article.delete({
    where: { id },
  });

  return ApiResponse.success(null, 'Article deleted successfully');
});
