import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
interface WhereClause {
  status?: string;
  language?: string;
}

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const language = searchParams.get('language');

  const where: WhereClause = {};
  if (status) where.status = status;
  if (language) where.language = language;

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            lessons: true,
            enrollments: true,
            mockTests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.course.count({ where }),
  ]);

  return ApiResponse.paginated(courses, total, page, limit);
});
  
  // POST - Create new course
  export const POST = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin();
  
    const body = await request.json();
  
    // Generate slug
    const slug = body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
    const course = await prisma.course.create({
      data: {
        ...body,
        slug,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
      },
    });
  
    return ApiResponse.success(course, 'Course created successfully', 201);
  });