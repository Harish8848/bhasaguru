
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/lib/api-response'
import { withErrorHandler } from '@/lib/api-wrapper'
import { QuestionType } from '@/generated/prisma/enums'

interface SpeakingResponse {
  questionId: string
  audioUrl: string
  duration: number
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return ApiResponse.error('Unauthorized', 401)
  }

  const body = await request.json()
  const { testId, responses }: {
    testId: string
    responses: { [questionId: string]: { audioUrl: string; duration: number } }
  } = body

  if (!testId || !responses) {
    return ApiResponse.error('Test ID and responses are required', 400)
  }

  try {
    // Verify test exists and get test info
    const test = await prisma.mockTest.findUnique({
      where: { id: testId },
      select: {
        id: true,
        title: true,
        passingScore: true,
        questionsCount: true,
        duration: true
      }
    })

    if (!test) {
      return ApiResponse.error('Test not found', 404)
    }

    // Verify all questions exist and are speaking questions
    const questionIds = Object.keys(responses)
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        testId: testId
      },
      select: {
        id: true,
        type: true,
        points: true
      }
    })

    if (questions.length !== questionIds.length) {
      return ApiResponse.error('Some questions not found or not part of this test', 400)
    }


    // Validate speaking question types
    const speakingQuestions = questions.filter(q => 
      q.type === QuestionType.SPEAKING_PART1 || 
      q.type === QuestionType.SPEAKING_PART2 || 
      q.type === QuestionType.SPEAKING_PART3
    )

    if (speakingQuestions.length !== questions.length) {
      return ApiResponse.error('All questions must be speaking questions', 400)
    }

    // Calculate speaking-specific metrics
    const totalDuration = Object.values(responses).reduce((sum, response) => sum + response.duration, 0)
    const averageResponseTime = totalDuration / Object.keys(responses).length

    // Create test attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        userId: session.user.id,
        testId: testId,
        score: 0, // Will be calculated after scoring
        correctAnswers: 0, // Not applicable for speaking tests
        totalQuestions: questions.length,
        passed: false, // Will be set after scoring
        timeSpent: Math.floor(totalDuration / 1000), // Convert to seconds
        completedAt: new Date(),
      },
    })

    // Save speaking responses (without isCorrect since speaking tests are manually scored)
    const speakingAnswers = Object.entries(responses).map(([questionId, response]) => ({
      attemptId: attempt.id,
      questionId: questionId,
      audioUrl: response.audioUrl,
      textAnswer: `Duration: ${response.duration}ms`,
      isCorrect: false, // Speaking tests require manual scoring
      answeredAt: new Date(),
    }))

    await prisma.answer.createMany({
      data: speakingAnswers,
    })



    // Create speaking score entry (initially ungraded)
    await prisma.speakingScore.create({
      data: {
        attemptId: attempt.id,
        fluencyCoherence: 0, // To be filled by examiner
        lexicalResource: 0,
        grammaticalRange: 0,
        pronunciation: 0,
        overallBand: 0,
        notes: 'Pending manual scoring'
      }
    })

    return ApiResponse.success({
      attemptId: attempt.id,
      message: 'Speaking test submitted successfully. Awaiting manual scoring.',
      totalQuestions: questions.length,
      totalDuration: Math.floor(totalDuration / 1000), // Convert to seconds
      averageResponseTime: Math.floor(averageResponseTime / 1000), // Convert to seconds
      status: 'submitted_for_scoring',
      test: {
        id: test.id,
        title: test.title,
        passingScore: test.passingScore
      }
    })

  } catch (error) {
    console.error('Error submitting speaking test:', error)
    return ApiResponse.error('Failed to submit speaking test', 500)
  }
})

// GET endpoint to get speaking test results for an attempt
export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return ApiResponse.error('Unauthorized', 401)
  }

  const { searchParams } = new URL(request.url)
  const attemptId = searchParams.get('attemptId')

  if (!attemptId) {
    return ApiResponse.error('Attempt ID is required', 400)
  }

  try {
    // Get speaking test results
    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: attemptId,
        userId: session.user.id
      },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            passingScore: true
          }
        },

        answers: {
          include: {
            question: {
              select: {
                id: true,
                type: true,
                questionText: true,
                order: true
              }
            }
          },
          orderBy: {
            question: {
              order: 'asc'
            }
          }
        },
        speakingScore: true
      }
    })

    if (!attempt) {
      return ApiResponse.error('Attempt not found', 404)
    }

    return ApiResponse.success({
      attempt: {
        id: attempt.id,
        test: attempt.test,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        answers: attempt.answers,
        speakingScore: attempt.speakingScore
      }
    })

  } catch (error) {
    console.error('Error fetching speaking test results:', error)
    return ApiResponse.error('Failed to fetch speaking test results', 500)
  }
})
