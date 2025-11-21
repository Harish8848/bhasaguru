import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
export const PATCH = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    await requireAdmin();
  
    const body = await request.json();
  
    const lesson = await prisma.lesson.update({
      where: { id: params.id },
      data: body,
    });
  
    return ApiResponse.success(lesson, 'Lesson updated successfully');
  });
  
  // DELETE - Delete lesson
  export const DELETE = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    await requireAdmin();
  
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
    });
  
    if (!lesson) {
      return ApiResponse.notFound('Lesson not found');
    }
  
    await prisma.lesson.delete({
      where: { id: params.id },
    });
  
    // Update course lesson count
    await prisma.course.update({
      where: { id: lesson.courseId },
      data: {
        lessonsCount: { decrement: 1 },
      },
    });
  
    return ApiResponse.success(null, 'Lesson deleted successfully');
  });