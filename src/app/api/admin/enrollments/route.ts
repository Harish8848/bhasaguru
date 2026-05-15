import { EnrollmentStatus } from '@/generated/prisma/client';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') as EnrollmentStatus | null;
  const userId = searchParams.get('userId');
  const courseId = searchParams.get('courseId');

  const where: any = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;
  if (courseId) where.courseId = courseId;

  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            language: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    }),
    prisma.enrollment.count({ where }),
  ]);

  return ApiResponse.paginated(enrollments, total, page, limit);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  await requireAdmin();

  const body = await request.json();
  const { name, email, phone, address, courseId, status } = body;

  if (!email) {
    return ApiResponse.error('Email is required', 400);
  }
  if (!courseId) {
    return ApiResponse.error('Course selection is required', 400);
  }

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: name || '',
        email,
        phone: phone || null,
        address: address || null,
      },
    });
  }

  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  });

  if (existing) {
    return ApiResponse.error('This user is already enrolled in this course', 400);
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });
  if (!course) {
    return ApiResponse.error('Course not found', 404);
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: user.id,
      courseId,
      status: status || 'ACTIVE',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          language: true,
        },
      },
    },
  });

  await prisma.course.update({
    where: { id: courseId },
    data: { studentsCount: { increment: 1 } },
  });

  return ApiResponse.success(enrollment, 'Enrollment created successfully', 201);
});
