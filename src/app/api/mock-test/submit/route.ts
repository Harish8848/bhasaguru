import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';

interface AnswerSubmission {
  questionId: string;
  selectedOption?: string;
  textAnswer?: string;
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return ApiResponse.error('Unauthorized', 401);
  }


  const body = await request.json();
  const { answers, timeSpent, testId, sessionFilters }: {
    answers: AnswerSubmission[];
    timeSpent: number;
    testId?: string;
    sessionFilters?: {
      language?: string;
      difficulty?: string;
      module?: string;
      section?: string;
      standardSection?: string;
    };
  } = body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return ApiResponse.error('Answers array is required', 400);
  }

  if (!timeSpent || typeof timeSpent !== 'number') {
    return ApiResponse.error('Valid timeSpent is required', 400);
  }


  try {
    let testInfo = null;
    let passingScore = 60; // Default for practice sessions

    // If testId is provided, get test info and validate
    if (testId) {
      testInfo = await prisma.mockTest.findUnique({
        where: { id: testId },
        select: {
          id: true,
          title: true,
          passingScore: true,
        },
      });

      if (!testInfo) {
        return ApiResponse.error('Test not found', 404);
      }

      passingScore = testInfo.passingScore;
    }

    // Fetch all questions that were answered to validate and grade them
    const questionIds = answers.map(a => a.questionId);
    const whereClause = testId ? { id: { in: questionIds }, testId } : { id: { in: questionIds } };
    
    const questions = await prisma.question.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
        correctAnswer: true,
        options: true,
        points: true,
      },
    });

    if (questions.length !== answers.length) {
      return ApiResponse.error('Some questions not found', 400);
    }

    // Create question lookup map
    const questionMap = new Map(questions.map(q => [q.id, q]));

    // Grade answers
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const gradedAnswers = answers.map(answer => {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        throw new Error(`Question ${answer.questionId} not found`);
      }

      let isCorrect = false;

      if (question.type === 'MULTIPLE_CHOICE') {
        const options: any = question.options;
        const correctOption = options?.find((o: any) => o.isCorrect);
        isCorrect = answer.selectedOption === correctOption?.id;
      } else if (question.type === 'TRUE_FALSE' || question.type === 'FILL_BLANK') {
        isCorrect = answer.textAnswer?.toLowerCase() === question.correctAnswer?.toLowerCase();
      }

      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }
      totalPoints += question.points;

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        textAnswer: answer.textAnswer,
        isCorrect,
      };
    });


    // Calculate score percentage
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= passingScore;

    // Create test attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        userId: session.user.id,
        testId: testId || null, // Use testId if provided, null for practice session
        score,
        correctAnswers,
        totalQuestions: questions.length,
        passed,
        timeSpent,
        completedAt: new Date(),
      },
    });

    // Save graded answers
    const answersWithAttemptId = gradedAnswers.map(answer => ({
      ...answer,
      attemptId: attempt.id,
    }));

    await prisma.answer.createMany({
      data: answersWithAttemptId,
    });

    return ApiResponse.success({
      attemptId: attempt.id,
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      correctAnswers,
      totalQuestions: questions.length,
      passed,
      timeSpent,
      earnedPoints,
      totalPoints,
      sessionFilters,
    });

  } catch (error) {
    console.error('Error submitting practice test:', error);
    return ApiResponse.error('Failed to submit test', 500);
  }
});
