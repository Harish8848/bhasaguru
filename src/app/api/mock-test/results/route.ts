import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return ApiResponse.error('Unauthorized', 401);
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const type = searchParams.get('type'); // 'practice', 'formal', or null for all

  try {
    // Build where clause
    const where: any = {
      userId: session.user.id,
      completedAt: { not: null }, // Only completed attempts
    };

    if (type === 'practice') {
      where.testId = null; // Practice sessions have null testId
    } else if (type === 'formal') {
      where.testId = { not: null }; // Formal tests have testId
    }

    // Get attempts with pagination
    const [attempts, total] = await Promise.all([
      prisma.testAttempt.findMany({
        where,
        include: {
          test: {
            select: {
              id: true,
              title: true,
              language: true,
              module: true,
              section: true,
              standardSection: true,
              type: true,
            },
          },
          _count: {
            select: {
              answers: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.testAttempt.count({ where }),
    ]);

    // Transform the data for better client consumption
    const transformedAttempts = attempts.map(attempt => ({
      id: attempt.id,
      type: attempt.testId ? 'formal' : 'practice',
      score: Math.round(attempt.score * 100) / 100,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      passed: attempt.passed,
      timeSpent: attempt.timeSpent,
      completedAt: attempt.completedAt,
      test: attempt.test ? {
        id: attempt.test.id,
        title: attempt.test.title,
        language: attempt.test.language,
        module: attempt.test.module,
        section: attempt.test.section,
        standardSection: attempt.test.standardSection,
        type: attempt.test.type,
      } : null,
      answersCount: attempt._count.answers,
    }));

    return ApiResponse.paginated(transformedAttempts, total, page, limit);

  } catch (error) {
    console.error('Error fetching test results:', error);
    return ApiResponse.error('Failed to fetch results', 500);
  }
});
