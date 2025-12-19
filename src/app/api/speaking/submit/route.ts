import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/lib/api-response'
import { withErrorHandler } from '@/lib/api-wrapper'
import { UnifiedEvaluationService, SpeakingAnswer } from '@/lib/unified-evaluation-service'
import { resultGenerationService } from '@/lib/result-generation-service'
import { TestType, EvaluationContext } from '@/lib/types/evaluation'
import { QuestionType } from '@/lib/types/test'

interface SpeakingResponse {
  questionId: string
  audioUrl: string
  duration: number
  transcript?: string
  preparationTime?: number
  timeSpent: number
  timestamp: Date
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return ApiResponse.error('Unauthorized', 401)
  }

  const body = await request.json()
  const { testId, responses }: {
    testId: string
    responses: { [questionId: string]: SpeakingResponse }
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
        type: true,
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
        points: true,
        preparationTime: true,
        speakingTime: true
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

    // Initialize Unified Evaluation Service
    const evaluationService = new UnifiedEvaluationService()

    // Create evaluation context
    const evaluationContext: EvaluationContext = {
      userId: session.user.id,
      testId,
      examType: test.type as TestType,
      config: {
        allowPartialCredit: false,
        synonymSupport: false,
        caseSensitive: false,
      }
    }

    // Transform responses to unified answer format
    const unifiedAnswers: SpeakingAnswer[] = Object.entries(responses).map(([questionId, response]) => {
      const question = questions.find(q => q.id === questionId)
      if (!question) {
        throw new Error(`Question ${questionId} not found`)
      }

      // Cast to the specific speaking question type
      const speakingType = question.type as QuestionType.SPEAKING_PART1 | QuestionType.SPEAKING_PART2 | QuestionType.SPEAKING_PART3

      return {
        questionId,
        questionType: speakingType,
        timeSpent: response.timeSpent,
        timestamp: response.timestamp,
        userAnswer: {
          audioUrl: response.audioUrl,
          duration: response.duration,
          transcript: response.transcript,
          preparationTime: response.preparationTime
        }
      }
    })

    // Batch evaluate speaking responses
    const evaluationResults = await evaluationService.evaluateBatch(
      questions,
      unifiedAnswers,
      evaluationContext
    )

    if (!evaluationResults.success) {
      console.error('Evaluation errors:', evaluationResults.errors)
      return ApiResponse.error('Failed to evaluate speaking responses', 400)
    }

    // Calculate total duration and create test attempt
    const totalDuration = Object.values(responses).reduce((sum, response) => sum + response.duration, 0)
    const averageResponseTime = totalDuration / Object.keys(responses).length

    // Create test attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        userId: session.user.id,
        testId: testId,
        score: 0, // Will be calculated after result generation
        correctAnswers: 0, // Not applicable for speaking tests
        totalQuestions: questions.length,
        passed: false, // Will be set after result generation
        timeSpent: Math.floor(totalDuration / 1000), // Convert to seconds
        completedAt: new Date(),
      },
    })

    // Save speaking responses with evaluation results
    const speakingAnswers = evaluationResults.results!.map(result => {
      const response = responses[result.questionId]
      return {
        attemptId: attempt.id,
        questionId: result.questionId,
        audioUrl: response.audioUrl,
        textAnswer: response.transcript || `Duration: ${response.duration}ms`,
        isCorrect: false, // Speaking tests require manual scoring
        answeredAt: new Date(),
      }
    })

    await prisma.answer.createMany({
      data: speakingAnswers,
    })

    // Generate comprehensive result
    const testResult = await resultGenerationService.generateComprehensiveResult(
      attempt.id,
      evaluationResults.results!
    )

    // Update attempt with final scores
    await prisma.testAttempt.update({
      where: { id: attempt.id },
      data: {
        score: testResult.percentage,
        correctAnswers: testResult.correctAnswers,
        passed: testResult.status === 'pass',
      },
    })

    // Create or update speaking score with AI evaluation results
    const speakingResults = evaluationResults.results!.filter(r => 
      r.questionType.startsWith('SPEAKING_')
    )
    
    if (speakingResults.length > 0) {
      const averageBands = calculateAverageSpeakingBands(speakingResults)
      
      await prisma.speakingScore.upsert({
        where: { attemptId: attempt.id },
        update: {
          fluencyCoherence: averageBands.fluencyCoherence,
          lexicalResource: averageBands.lexicalResource,
          grammaticalRange: averageBands.grammaticalRange,
          pronunciation: averageBands.pronunciation,
          overallBand: averageBands.overallBand,
          notes: 'AI evaluated - ready for manual review'
        },
        create: {
          attemptId: attempt.id,
          fluencyCoherence: averageBands.fluencyCoherence,
          lexicalResource: averageBands.lexicalResource,
          grammaticalRange: averageBands.grammaticalRange,
          pronunciation: averageBands.pronunciation,
          overallBand: averageBands.overallBand,
          notes: 'AI evaluated - ready for manual review'
        }
      })
    }

    return ApiResponse.success({
      attemptId: attempt.id,
      result: testResult,
      message: 'Speaking test submitted and evaluated successfully.',
      totalQuestions: questions.length,
      totalDuration: Math.floor(totalDuration / 1000),
      averageResponseTime: Math.floor(averageResponseTime / 1000),
      status: 'evaluated',
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

// Helper function to calculate average speaking bands
function calculateAverageSpeakingBands(speakingResults: any[]) {
  let totalFluency = 0
  let totalLexical = 0
  let totalGrammar = 0
  let totalPronunciation = 0

  speakingResults.forEach(result => {
    if (result.ieltsBands) {
      totalFluency += result.ieltsBands.fluencyCoherence
      totalLexical += result.ieltsBands.lexicalResource
      totalGrammar += result.ieltsBands.grammaticalRange
      totalPronunciation += result.ieltsBands.pronunciation
    }
  })

  const count = speakingResults.length
  const overall = (totalFluency + totalLexical + totalGrammar + totalPronunciation) / (4 * count)

  return {
    fluencyCoherence: Math.round((totalFluency / count) * 10) / 10,
    lexicalResource: Math.round((totalLexical / count) * 10) / 10,
    grammaticalRange: Math.round((totalGrammar / count) * 10) / 10,
    pronunciation: Math.round((totalPronunciation / count) * 10) / 10,
    overallBand: Math.round(overall * 10) / 10
  }
}

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
    // Get speaking test results using ResultGenerationService
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
