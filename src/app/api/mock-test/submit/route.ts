import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-wrapper';
import { UnifiedEvaluationService, AnswerPayload } from '@/lib/unified-evaluation-service';
import { resultGenerationService } from '@/lib/result-generation-service';
import { TestType, EvaluationContext } from '@/lib/types/evaluation';
import { QuestionType } from '@/lib/types/test';

interface AnswerSubmission {
  questionId: string;
  selectedOption?: string;
  textAnswer?: string;
  audioResponse?: {
    audioUrl: string;
    duration: number;
    transcript?: string;
  };
  matches?: { [leftItemId: string]: string };
  answers?: { [key: string]: string };
  timeSpent: number;
  timestamp: Date;
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
    let examType = TestType.PRACTICE;

    // If testId is provided, get test info and validate
    if (testId) {
      testInfo = await prisma.mockTest.findUnique({
        where: { id: testId },
        select: {
          id: true,
          title: true,
          type: true,
          passingScore: true,
        },
      });

      if (!testInfo) {
        return ApiResponse.error('Test not found', 404);
      }

      passingScore = testInfo.passingScore;
      examType = testInfo.type as TestType;
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
        questionText: true,
        preparationTime: true,
      },
    });

    if (questions.length !== answers.length) {
      return ApiResponse.error('Some questions not found', 400);
    }

    // Initialize Unified Evaluation Service
    const evaluationService = new UnifiedEvaluationService();

    // Create evaluation context
    const evaluationContext: EvaluationContext = {
      userId: session.user.id,
      testId,
      examType,
      config: {
        allowPartialCredit: true,
        synonymSupport: true,
        caseSensitive: false,
      },
      sectionFilters: sessionFilters,
    };

    // Transform answers to unified format with proper type casting
    const unifiedAnswers: AnswerPayload[] = answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) {
        throw new Error(`Question ${answer.questionId} not found`);
      }

      // Transform based on question type
      switch (question.type) {
        case QuestionType.MULTIPLE_CHOICE:
          if (!answer.selectedOption) {
            // throw new Error(`Selected option is required for question ${answer.questionId}`);
            // Allow empty answers for skipping
          }
          return {
            questionId: answer.questionId,
            questionType: QuestionType.MULTIPLE_CHOICE,
            timeSpent: answer.timeSpent,
            timestamp: answer.timestamp,
            userAnswer: {
              selectedOption: answer.selectedOption || '',
            },
          } as AnswerPayload;

        case QuestionType.TRUE_FALSE:
          return {
            questionId: answer.questionId,
            questionType: QuestionType.TRUE_FALSE,
            timeSpent: answer.timeSpent,
            timestamp: answer.timestamp,
            userAnswer: {
              value: answer.textAnswer?.toLowerCase() === 'true',
            },
          } as AnswerPayload;

        case QuestionType.FILL_BLANK:
          return {
            questionId: answer.questionId,
            questionType: QuestionType.FILL_BLANK,
            timeSpent: answer.timeSpent,
            timestamp: answer.timestamp,
            userAnswer: {
              answers: answer.answers || {},
              synonyms: true,
            },
          } as AnswerPayload;

        case QuestionType.MATCHING:
          return {
            questionId: answer.questionId,
            questionType: QuestionType.MATCHING,
            timeSpent: answer.timeSpent,
            timestamp: answer.timestamp,
            userAnswer: {
              matches: answer.matches || {},
              partialCredit: true,
            },
          } as AnswerPayload;

        case QuestionType.AUDIO_QUESTION:
          return {
            questionId: answer.questionId,
            questionType: QuestionType.AUDIO_QUESTION,
            timeSpent: answer.timeSpent,
            timestamp: answer.timestamp,
            userAnswer: {
              audioResponse: answer.audioResponse,
              textAnswer: answer.textAnswer,
              selectedOption: answer.selectedOption,
            },
          } as AnswerPayload;

        case QuestionType.SPEAKING_PART1:
        case QuestionType.SPEAKING_PART2:
        case QuestionType.SPEAKING_PART3:
          return {
            questionId: answer.questionId,
            questionType: question.type,
            timeSpent: answer.timeSpent,
            timestamp: answer.timestamp,
            userAnswer: {
              audioUrl: answer.audioResponse?.audioUrl || '',
              duration: answer.audioResponse?.duration || 0,
              transcript: answer.audioResponse?.transcript,
              preparationTime: question.preparationTime || 0,
            },
          } as AnswerPayload;

        case QuestionType.WRITING:
          return {
            questionId: answer.questionId,
            questionType: QuestionType.WRITING,
            timeSpent: answer.timeSpent,
            timestamp: answer.timestamp,
            userAnswer: {
              essayType: 'task2', // Default to task2 for now
              content: answer.textAnswer || '',
              wordCount: answer.textAnswer?.trim().split(/\s+/).length || 0,
            },
          } as AnswerPayload;

        case QuestionType.READING_COMPREHENSION:
          return {
            questionId: answer.questionId,
            questionType: QuestionType.READING_COMPREHENSION,
            timeSpent: answer.timeSpent,
            timestamp: answer.timestamp,
            userAnswer: {
              passageId: question.id,
              answers: answer.answers || {},
              timeOnPassage: answer.timeSpent,
            },
          } as AnswerPayload;

        case QuestionType.LISTENING_COMPREHENSION:
          return {
            questionId: answer.questionId,
            questionType: QuestionType.LISTENING_COMPREHENSION,
            timeSpent: answer.timeSpent,
            timestamp: answer.timestamp,
            userAnswer: {
              audioId: question.id,
              answers: answer.answers || {},
              timeOnAudio: answer.timeSpent,
            },
          } as AnswerPayload;

        default:
          return {
            questionId: answer.questionId,
            questionType: question.type as QuestionType,
            timeSpent: answer.timeSpent,
            timestamp: answer.timestamp,
            userAnswer: {
              textAnswer: answer.textAnswer,
            },
          } as AnswerPayload;
      }
    });

    // Batch evaluate all answers
    const evaluationResults = await evaluationService.evaluateBatch(
      questions,
      unifiedAnswers,
      evaluationContext
    );

    if (!evaluationResults.success) {
      console.error('Evaluation errors:', evaluationResults.errors);
      return ApiResponse.error('Failed to evaluate answers', 400);
    }

    // Create test attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        userId: session.user.id,
        testId: testId || null, // Use testId if provided, null for practice session
        score: 0, // Will be updated after result generation
        correctAnswers: 0, // Will be updated after result generation
        totalQuestions: questions.length,
        passed: false, // Will be updated after result generation
        timeSpent,
        completedAt: new Date(),
      },
    });

    // Save answers to database
    const answersWithAttemptId = evaluationResults.results!.map(result => {
      const answer = answers.find(a => a.questionId === result.questionId);
      return {
        attemptId: attempt.id,
        questionId: result.questionId,
        selectedOption: (result as any).selectedOption,
        textAnswer: (result as any).textAnswer || answer?.textAnswer,
        audioUrl: answer?.audioResponse?.audioUrl,
        isCorrect: result.isCorrect,
        answeredAt: new Date(),
      };
    });

    await prisma.answer.createMany({
      data: answersWithAttemptId,
    });

    // Generate comprehensive result
    const testResult = await resultGenerationService.generateComprehensiveResult(
      attempt.id,
      evaluationResults.results!
    );

    // Update attempt with final scores
    await prisma.testAttempt.update({
      where: { id: attempt.id },
      data: {
        score: testResult.percentage,
        correctAnswers: testResult.correctAnswers,
        passed: testResult.status === 'pass',
      },
    });

    return ApiResponse.success({
      attemptId: attempt.id,
      result: testResult,
      sessionFilters,
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    return ApiResponse.error('Failed to submit test', 500);
  }
});
