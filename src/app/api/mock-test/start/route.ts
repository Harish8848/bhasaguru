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
  const language = searchParams.get('language');
  const difficulty = searchParams.get('difficulty');
  const module = searchParams.get('module');
  const section = searchParams.get('section');
  const standardSection = searchParams.get('standardSection');
  const limit = parseInt(searchParams.get('limit') || '20');

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

  // Validate that at least one filter is provided
  if (!language && !difficulty && !module && !section && !standardSection) {
    return ApiResponse.error(
      'At least one filter parameter (language, difficulty, module, section, or standardSection) is required',
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
