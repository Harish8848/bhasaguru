import { EnrollmentStatus } from '@/generated/prisma/client';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          language: true,
          level: true,
        },
      },
    },
  });

  if (!enrollment) {
    return ApiResponse.notFound('Enrollment not found');
  }

  return ApiResponse.success(enrollment);
});

export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;
  const body = await request.json();

  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
  });

  if (!enrollment) {
    return ApiResponse.notFound('Enrollment not found');
  }

  const updateData: any = {};
  
  if (body.status) {
    updateData.status = body.status;
    if (body.status === 'COMPLETED' && !enrollment.completedAt) {
      updateData.completedAt = new Date();
    }
  }
  
  if (typeof body.completedLessons === 'number') {
    updateData.completedLessons = body.completedLessons;
  }
  
  if (typeof body.progressPercent === 'number') {
    updateData.progressPercent = Math.min(100, Math.max(0, body.progressPercent));
  }

  const updated = await prisma.enrollment.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
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

  return ApiResponse.success(updated, 'Enrollment updated successfully');
});

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
  });

  if (!enrollment) {
    return ApiResponse.notFound('Enrollment not found');
  }

  await prisma.enrollment.delete({
    where: { id },
  });

  await prisma.course.update({
    where: { id: enrollment.courseId },
    data: { studentsCount: { decrement: 1 } },
  });

  return ApiResponse.success(null, 'Enrollment deleted successfully');
});
