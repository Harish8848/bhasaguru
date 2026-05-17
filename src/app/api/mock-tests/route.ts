import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { cacheHelpers } from '@/lib/cache';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const language = searchParams.get('language');

  const cacheKey = `mock-tests:public:${language || 'all'}:${page}:${limit}`;

  const cachedData = await cacheHelpers.get(cacheKey);
  if (cachedData) {
    return ApiResponse.success(cachedData);
  }

  const where: any = {};
  if (language && language !== 'all') {
    where.language = language;
  }

  const [tests, total] = await Promise.all([
    prisma.mockTest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            attempts: true,
            questions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.mockTest.count({ where }),
  ]);

  // If session exists, check enrollment for each test
  let testsWithEnrollment = tests;
  const isAdmin = session?.user?.role === 'ADMIN';

  if (session && !isAdmin) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        courseId: true,
      },
    });

    const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));

    testsWithEnrollment = tests.map(test => ({
      ...test,
      isLocked: test.courseId ? !enrolledCourseIds.has(test.courseId) : false,
      isEnrolled: test.courseId ? enrolledCourseIds.has(test.courseId) : true, 
    }));
  } else if (isAdmin) {
    // Admin has access to everything
    testsWithEnrollment = tests.map(test => ({
      ...test,
      isLocked: false,
      isEnrolled: true,
    }));
  } else {
    // If no session, all course-specific tests are locked
    testsWithEnrollment = tests.map(test => ({
      ...test,
      isLocked: !!test.courseId,
      isEnrolled: false,
    }));
  }

  const result = {
    data: testsWithEnrollment,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  };

  // Cache for 5 minutes
  await cacheHelpers.set(cacheKey, result, 300);

  return ApiResponse.success(result);
});
