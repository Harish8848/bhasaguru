import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { fetchExternalJobs } from '@/lib/job-fetcher';

// GET - Get a single job listing by id and increment view count
// Handles both database jobs and external jobs (adzuna-* / remoteok-*)

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  // Check if this is an external job
  if (id.startsWith('adzuna-') || id.startsWith('remoteok-')) {
    // Use cached fetchExternalJobs to avoid hitting the API on every request
    const externalJobs = await fetchExternalJobs('', 'japan', 50);
    const job = externalJobs.find((j) => j.id === id);

    if (!job) {
      return ApiResponse.notFound('Job not found');
    }

    return ApiResponse.success(job);
  }

  // Regular database job
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
