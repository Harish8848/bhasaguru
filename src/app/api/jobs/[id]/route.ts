import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

// GET - Get a single job listing by id and increment view count

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const job = await prisma.jobListing.findUnique({
    where: { id },
  });

  if (!job) {
    return ApiResponse.notFound('Job not found');
  }

  // Increment view count
  await prisma.jobListing.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return ApiResponse.success(job);
});
