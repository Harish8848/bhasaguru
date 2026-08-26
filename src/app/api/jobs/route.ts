import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { JobStatus } from '@/generated/prisma/client';
import { fetchExternalJobs } from '@/lib/job-fetcher';

// GET - List active job listings with pagination and optional filters
// Combines database jobs with external jobs from Adzuna and RemoteOK

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');
  const language = searchParams.get('language');
  const location = searchParams.get('location');
  const type = searchParams.get('type');
  const source = searchParams.get('source'); // 'db' | 'external' | 'all'

  const where: any = {
    status: JobStatus.ACTIVE,
  };

  if (language) {
    where.languageRequired = language;
  }

  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }

  if (type) {
    where.type = type;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { requirements: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Fetch database jobs
  const [dbJobs, total] = await Promise.all([
    prisma.jobListing.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.jobListing.count({ where }),
  ]);

  // Fetch external jobs from Adzuna and RemoteOK
  // Only fetch on first page to avoid excessive API calls
  let externalJobs: any[] = [];
  if (page === 1 && source !== 'db') {
    try {
      const country = location || 'japan';
      externalJobs = await fetchExternalJobs(search || '', country, limit);
      // Apply type filter to external jobs too
      if (type) {
        externalJobs = externalJobs.filter((job: any) => job.type === type);
      }
    } catch (err) {
      console.error('[Jobs API] External fetch error:', err);
    }
  }

  // Combine results
  let combinedJobs: any[] = [];
  let combinedTotal = total;

  if (source === 'external') {
    combinedJobs = externalJobs;
    combinedTotal = externalJobs.length;
  } else if (source === 'db') {
    combinedJobs = dbJobs;
  } else {
    // Merge: external jobs first (newest), then database jobs
    combinedJobs = [...externalJobs, ...dbJobs];
    combinedTotal = total + externalJobs.length;
  }

  const result = {
    data: combinedJobs,
    meta: {
      total: combinedTotal,
      page,
      limit,
      totalPages: Math.ceil(combinedTotal / limit),
      sources: {
        database: dbJobs.length,
        external: externalJobs.length,
      },
    },
  };

  return ApiResponse.success(result);
});