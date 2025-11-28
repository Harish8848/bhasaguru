import { ArticleStatus } from '@/generated/prisma/client';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

// PATCH - Update article
export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin();

  const body = await request.json();

  // Generate slug if title is being updated
  const updateData = { ...body };
  if (body.title) {
    updateData.slug = body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  // Handle publishedAt based on status
  if (body.status === 'PUBLISHED' && !body.publishedAt) {
    updateData.publishedAt = new Date();
  } else if (body.status === 'DRAFT') {
    updateData.publishedAt = null;
  }

  const article = await prisma.article.update({
    where: { id: params.id },
    data: updateData,
  });

  return ApiResponse.success(article, 'Article updated successfully');
});

// DELETE - Delete article
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin();

  const article = await prisma.article.findUnique({
    where: { id: params.id },
  });

  if (!article) {
    return ApiResponse.notFound('Article not found');
  }

  await prisma.article.delete({
    where: { id: params.id },
  });

  return ApiResponse.success(null, 'Article deleted successfully');
});
