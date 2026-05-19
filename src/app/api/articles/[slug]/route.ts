import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  const article = await prisma.article.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  // Increment view count
  await prisma.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  });

  return ApiResponse.success(article);
});