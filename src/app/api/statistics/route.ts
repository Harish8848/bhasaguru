import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

export const GET = withErrorHandler(async () => {
  const [
    totalUsers,
    activeUsers,
    totalCourses,
    publishedCourses,
    totalArticles,
    publishedArticles,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.course.count(),
    prisma.course.count({ where: { status: 'PUBLISHED' } }),
    prisma.article.count(),
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
  ]);

  // Calculate total enrollments/students across all courses
  const totalStudents = await prisma.enrollment.count({ where: { status: 'ACTIVE' } });

  return ApiResponse.success({
    activeLearners: activeUsers,
    expertCourses: publishedCourses,
    satisfactionRate: 95,
  });
});
