import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { cacheHelpers } from '@/lib/cache';


export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return ApiResponse.error('Unauthorized', 401);
  }

  const { searchParams } = new URL(request.url);
  const testId = searchParams.get('testId');
  const language = searchParams.get('language');
  const difficulty = searchParams.get('difficulty');
  const module = searchParams.get('module');
  const section = searchParams.get('section');
  const standardSection = searchParams.get('standardSection');
  const limit = parseInt(searchParams.get('limit') || '20');

  // If testId is provided, fetch questions for that specific test
  if (testId) {
    const cacheKey = `test-questions:${testId}`;
    
    // Try to fetch from cache first
    const cachedData = await cacheHelpers.get(cacheKey);
    if (cachedData) {
      return ApiResponse.success(cachedData);
    }

    try {
      // First verify the test exists
      const test = await prisma.mockTest.findUnique({
        where: { id: testId },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          questionsCount: true,
          passingScore: true,
          language: true,
          module: true,
          section: true,
          standardSection: true,
          type: true,
        }
      });

      if (!test) {
        return ApiResponse.error('Test not found', 404);
      }

      // Get questions for this test
      const questions = await prisma.question.findMany({
        where: {
          testId: testId,
        },
        select: {
          id: true,
          type: true,
          questionText: true,
          audioUrl: true,
          imageUrl: true,
          options: true,
          points: true,
          explanation: true,
        },
        orderBy: {
          order: 'asc',
        },
      });

      const responseData = {
        questions,
        test,
        totalQuestions: questions.length,
      };

      // Cache for 1 hour
      await cacheHelpers.set(cacheKey, responseData, 3600);

      return ApiResponse.success(responseData);

    } catch (error) {
      console.error('Error fetching test questions:', error);
      return ApiResponse.error('Failed to fetch test questions', 500);
    }
  }

  // Original filtering logic for practice questions (when no testId)
  // Build where clause for filtering questions
  const where: any = {};

  if (language) {
    where.language = language;
  }

  if (difficulty) {
    where.difficulty = difficulty;
  }

  if (module) {
    where.module = module;
  }

  if (section) {
    where.section = section;
  }

  if (standardSection) {
    where.standardSection = standardSection;
  }

  // Validate that at least one filter is provided for practice questions
  if (!language && !difficulty && !module && !section && !standardSection) {
    return ApiResponse.error(
      'At least one filter parameter (language, difficulty, module, section, or standardSection) is required, or provide testId',
      400
    );
  }

  try {
    // Get all questions matching the filters first
    const allQuestions = await prisma.question.findMany({
      where,
      select: {
        id: true,
        type: true,
        questionText: true,
        audioUrl: true,
        imageUrl: true,
        options: true,
        points: true,
        explanation: true,
        language: true,
        module: true,
        section: true,
        standardSection: true,
        difficulty: true,
      },
    });

    if (allQuestions.length === 0) {
      return ApiResponse.error('No questions found matching the specified filters', 404);
    }

    // Randomize and limit the results
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
    const questions = shuffledQuestions.slice(0, Math.min(limit, shuffledQuestions.length));

    return ApiResponse.success({
      questions,
      totalQuestions: questions.length,
      availableQuestions: allQuestions.length,
      filters: {
        language,
        difficulty,
        module,
        section,
        standardSection,
      },
    });
  } catch (error) {
    console.error('Error fetching practice questions:', error);
    return ApiResponse.error('Failed to fetch questions', 500);
  }
});
