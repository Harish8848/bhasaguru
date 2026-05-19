import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

// GET - Get single culture post
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const post = await prisma.culturePost.findUnique({
    where: { id },
  });

  if (!post) {
    return ApiResponse.notFound('Culture post not found');
  }

  return ApiResponse.success(post);
});

// PATCH - Update culture post
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

    // Check for existing slugs (excluding current post) and append counter if needed
    while (await prisma.culturePost.findUnique({ where: { slug, NOT: { id } } })) {
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

  const post = await prisma.culturePost.update({
    where: { id },
    data: updateData,
  });

  return ApiResponse.success(post, 'Culture post updated successfully');
});

// DELETE - Delete culture post
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const post = await prisma.culturePost.findUnique({
    where: { id },
  });

  if (!post) {
    return ApiResponse.notFound('Culture post not found');
  }

  await prisma.culturePost.delete({
    where: { id },
  });

  return ApiResponse.success(null, 'Culture post deleted successfully');
});