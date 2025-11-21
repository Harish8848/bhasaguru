import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
export const POST = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin();
  
    const body = await request.json();
  
    // Generate slug
    const slug = body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
    const lesson = await prisma.lesson.create({
      data: {
        ...body,
        slug,
      },
    });
  
    // Update course lesson count
    await prisma.course.update({
      where: { id: body.courseId },
      data: {
        lessonsCount: { increment: 1 },
      },
    });
  
    return ApiResponse.success(lesson, 'Lesson created successfully', 201);
  });
  