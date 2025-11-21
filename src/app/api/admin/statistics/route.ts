import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-middleware';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

export const GET = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin();
  
    const [
      totalUsers,
      activeUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalTests,
      totalJobs,
      activeJobs,
      totalArticles,
      publishedArticles,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.course.count(),
      prisma.course.count({ where: { status: 'PUBLISHED' } }),
      prisma.enrollment.count(),
      prisma.mockTest.count(),
      prisma.jobListing.count(),
      prisma.jobListing.count({ where: { status: 'ACTIVE' } }),
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
    ]);
  
    // Recent activity
    const recentEnrollments = await prisma.enrollment.findMany({
      take: 10,
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    });
  
    const recentTestAttempts = await prisma.testAttempt.findMany({
      take: 10,
      where: { completedAt: { not: null } },
      orderBy: { completedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        test: { select: { title: true } },
      },
    });
  
    // User growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    });
  
    // Most popular courses
    const popularCourses = await prisma.course.findMany({
      take: 5,
      orderBy: { studentsCount: 'desc' },
      select: {
        id: true,
        title: true,
        studentsCount: true,
        lessonsCount: true,
        language: true,
        level: true,
      },
    });
  
    return ApiResponse.success({
      overview: {
        totalUsers,
        activeUsers,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalTests,
        totalJobs,
        activeJobs,
        totalArticles,
        publishedArticles,
        newUsersLast30Days,
      },
      recentActivity: {
        enrollments: recentEnrollments,
        testAttempts: recentTestAttempts,
      },
      popularCourses,
    });
  });
  