import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { requireAdmin } from '@/lib/auth-middleware';

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 200);

  const article = await prisma.article.findUnique({
    where: { slug: 'student-feedback' },
    select: { id: true },
  });

  if (!article) {
    return ApiResponse.success({ comments: [] });
  }

  const comments = await prisma.comment.findMany({
    where: { articleId: article.id },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, address: true },
      },
    },
  });

  return ApiResponse.success({
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      user: { name: c.user.name, address: c.user.address },
      isApproved: c.isApproved,
    })),
  });
});

