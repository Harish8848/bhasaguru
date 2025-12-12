import { CourseStatus } from '@/generated/prisma/client';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

// GET - Get single course
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          lessons: true,
          enrollments: true,
          mockTests: true,
        },
      },
    },
  });

  if (!course) {
    return ApiResponse.notFound('Course not found');
  }

  return ApiResponse.success(course);
});

// PATCH - Update course
export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;
  const body = await request.json();

  // Generate slug if title is being updated
  const updateData = { ...body };
  if (body.title) {
    updateData.slug = body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  // Handle publishedAt based on status
  if (body.status === 'PUBLISHED' && !body.publishedAt) {
    updateData.publishedAt = new Date();
  } else if (body.status === 'DRAFT') {
    updateData.publishedAt = null;
  }

  const course = await prisma.course.update({
    where: { id },
    data: updateData,
  });

  return ApiResponse.success(course, 'Course updated successfully');
});

// DELETE - Delete course
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await requireAdmin();

  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    return ApiResponse.notFound('Course not found');
  }

  await prisma.course.delete({
    where: { id },
  });

  return ApiResponse.success(null, 'Course deleted successfully');
});
