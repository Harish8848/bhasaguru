import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/api-wrapper';
import { requireAdmin } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';

export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    await requireAdmin();

    const applications = await prisma.jobApplication.findMany({
      where: { jobId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return ApiResponse.success(applications);
  });
