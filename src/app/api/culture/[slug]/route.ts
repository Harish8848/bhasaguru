import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

interface Params {
  params: Promise<{ slug: string }>
}

// GET - Get single culture post by slug
export const GET = withErrorHandler(async (request: NextRequest, { params }: Params) => {
  const { slug } = await params;

  const post = await prisma.culturePost.findUnique({
    where: { slug },
  });

  if (!post) {
    return ApiResponse.notFound('Culture post not found');
  }

  // Increment view count
  await prisma.culturePost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  });

  return ApiResponse.success(post);
});