import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { JobStatus } from '@/generated/prisma/client';

// GET - List active job listings with pagination and optional filters

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');
  const language = searchParams.get('language');
  const location = searchParams.get('location');

  const where: any = {
    status: JobStatus.ACTIVE,
  };

  if (language) {
    where.languageRequired = language;
  }

  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { requirements: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [jobs, total] = await Promise.all([
    prisma.jobListing.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.jobListing.count({ where }),
  ]);

  const result = {
    data: jobs,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  return ApiResponse.success(result);
});
