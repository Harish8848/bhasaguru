import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { JobStatus, JobType, LanguageLevel } from '@/generated/prisma/client';

// GET - List all job listings (admin)
export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search');
  const status = searchParams.get('status') as JobStatus | null;

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
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

  return ApiResponse.success({
    data: jobs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// POST - Create new job listing
export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const body = await request.json();
  const {
    title,
    company,
    location,
    type,
    description,
    requirements,
    languageRequired,
    languageLevel,
    salary,
    currency,
    applicationUrl,
    email,
    expiresAt,
    status,
  } = body;

  if (!title || !company || !location || !type || !description || !requirements || !languageRequired) {
    return ApiResponse.error('Required fields missing', 400);
  }

  // Generate slug
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.jobListing.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const job = await prisma.jobListing.create({
    data: {
      slug,
      title,
      company,
      location,
      type: type as JobType,
      description,
      requirements,
      languageRequired,
      languageLevel: (languageLevel as LanguageLevel) || 'INTERMEDIATE',
      salary: salary || null,
      currency: currency || null,
      applicationUrl: applicationUrl || null,
      email: email || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      status: (status as JobStatus) || 'ACTIVE',
    },
  });

  return ApiResponse.success(job, undefined, 201);
});
