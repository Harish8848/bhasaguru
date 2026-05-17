import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { requireAdmin } from '@/lib/auth-middleware';


export const DELETE = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  // Fail fast if admin auth is missing/invalid.
  await requireAdmin();


  const { id } = await params;

  // Ensure this comment is part of the dedicated student-feedback container.
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      article: {
        select: { slug: true },
      },
    },
  });

  if (!comment) {
    return ApiResponse.notFound('Comment not found');
  }

  if (comment.article.slug !== 'student-feedback') {
    return ApiResponse.forbidden('Cannot delete this comment');
  }

  await prisma.comment.delete({ where: { id } });

  return ApiResponse.success(null, 'Student feedback deleted successfully');
});

