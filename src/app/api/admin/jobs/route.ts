import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

// GET - List job listings with pagination and optional status filter 
export const GET = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin();
  
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
  
    const where: any = {};
    if (status) where.status = status;
  
    const [jobs, total] = await Promise.all([
      prisma.jobListing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.jobListing.count({ where }),
    ]);
  
    return ApiResponse.paginated(jobs, total, page, limit);
  });
  
  // POST - Create job listing
  export const POST = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin();
  
    const body = await request.json();
  
    // Generate slug
    const slug = `${body.title}-${body.company}`
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  
    const job = await prisma.jobListing.create({
      data: {
        ...body,
        slug,
      },
    });
  
    return ApiResponse.success(job, 'Job listing created successfully', 201);
  });