import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

export const GET = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin();
  
    const { searchParams } = new URL(request.url);
    const pending = searchParams.get('pending') === 'true';
  
    const where: any = {};
    if (pending) where.isApproved = false;
  
    const comments = await prisma.comment.findMany({
      where,
      take: 50,
      include: {
        user: {
          select: { name: true, email: true },
        },
        article: {
          select: { title: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  
    return ApiResponse.success(comments);
  });