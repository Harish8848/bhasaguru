import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api-wrapper';
import { requireAdmin } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';

export const POST = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    await requireAdmin();
  
    const body = await request.json();
    const { status } = body; // 'PUBLISHED' or 'DRAFT'
  
    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    });
  
    return ApiResponse.success(
      course,
      `Course ${status === 'PUBLISHED' ? 'published' : 'unpublished'} successfully`
    );
  });
  