"use client"


import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

import SpeakingTestInterface from "@/components/speaking/SpeakingTestInterface"
import UnifiedAnswerForm from "@/components/test/UnifiedAnswerForm"
import { QuestionType, Question } from "@/lib/types/test"
import { AnswerPayload } from "@/lib/types/evaluation"
import {
  ArrowLeft,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  AlertCircle,
  Loader2,
  Send,
  Volume2,
  FileText
} from "lucide-react"
import { toast } from "sonner"

interface MockTest {
  id: string
  title: string
  description?: string
  language?: string
  module?: string
  section?: string
  standardSection?: string
  type: string
  duration: number
  questionsCount: number
  passingScore: number
}

interface TestResult {
  attemptId: string
  score: number
  correctAnswers: number
  totalQuestions: number
  passed: boolean
  timeSpent: number
  earnedPoints: number
  totalPoints: number
}

export default function TakeTestPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [test, setTest] = useState<MockTest | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, AnswerPayload>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [startTime] = useState(Date.now())

  const testId = params.testId as string

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !testCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !testCompleted && questions.length > 0) {
      handleSubmitTest()
    }
  }, [timeLeft, testCompleted, questions.length])

  // Fetch questions on mount
  useEffect(() => {
    if (session && testId) {
      fetchQuestions()
    }
  }, [session, testId])





  const fetchQuestions = async () => {
    try {
      setLoading(true)


      // First, fetch the test metadata
      const testResponse = await fetch(`/api/mock-tests/${testId}`)
      if (!testResponse.ok) {
        if (testResponse.status === 401) {
          throw new Error('Authentication required')
        }
        throw new Error('Test not found')
      }
      
      const testData = await testResponse.json()
      const testInfo = testData.data
      setTest(testInfo)
      
      // Set timer based on test duration
      setTimeLeft(testInfo.duration * 60) // Convert minutes to seconds

      // Then fetch questions for this specific test
      const questionsResponse = await fetch(`/api/mock-test/start?testId=${testId}`)
      
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        const fetchedQuestions = questionsData.data?.questions || []
        setQuestions(fetchedQuestions)
        
        if (fetchedQuestions.length === 0) {
          toast.error('No questions found for this test')
          router.push('/mock-tests')
        } else {
          // Check if this is a speaking test
          const hasSpeakingQuestions = fetchedQuestions.some((q: any) => 
            q.type === QuestionType.SPEAKING_PART1 || 
            q.type === QuestionType.SPEAKING_PART2 || 
            q.type === QuestionType.SPEAKING_PART3
          )
          
          if (hasSpeakingQuestions) {
            // Redirect to speaking test interface
            toast.success('Speaking test detected! Loading speaking interface...')
            router.push(`/mock-tests/speaking/${testId}`)
          }
        }
      } else if (questionsResponse.status === 401) {
        // Authentication required - redirect to auth page
        toast.error('Please sign in to take this test')
        router.push('/auth')
        return
      } else {
        const errorData = await questionsResponse.json()
        throw new Error(errorData.message || 'Failed to load questions')
      }
    } catch (error) {
      console.error('Failed to fetch test data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load test'
      
      if (errorMessage === 'Authentication required') {
        toast.error('Please sign in to take this test')
        router.push('/auth')
        return
      }
      
      // Don't navigate away on error, let user see the error and decide
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = useCallback((answer: AnswerPayload) => {
    setAnswers(prev => ({
      ...prev,
      [answer.questionId]: answer
    }))
  }, [])

  const handleTimeUpdate = useCallback((questionId: string, timeSpent: number) => {
    // Optionally track time per question
  }, [])

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const playAudio = async (questionId: string, audioUrl: string) => {
    try {
      const audio = new Audio(audioUrl)
      audio.addEventListener('ended', () => setPlayingAudio(null))
      audio.addEventListener('error', () => {
        toast.error('Failed to play audio')
        setPlayingAudio(null)
      })

      await audio.play()
      setPlayingAudio(questionId)
    } catch (error) {
      console.error('Audio playback error:', error)
      toast.error('Failed to play audio')
    }
  }

  const handleSubmitTest = async () => {
    if (submitting) return

    try {
      setSubmitting(true)
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)

      // Format answers for the backend
      const answersArray = questions.map(question => {
        const answer = answers[question.id]
        
        if (!answer) {
          // Provide a skipped answer format if not answered
          return {
            questionId: question.id,
            questionType: question.type,
            timeSpent: 0,
            timestamp: new Date(),
            userAnswer: {} // Empty answer for skipped
          }
        }
        
        // Extract the userAnswer part which the backend expects in a specific way
        // The backend expects: questionId, selectedOption, textAnswer, audioResponse, matches, answers, timeSpent, timestamp
        const backendAnswer: any = {
          questionId: answer.questionId,
          timeSpent: answer.timeSpent,
          timestamp: answer.timestamp
        }

        const ua = (answer as any).userAnswer
        if (ua) {
          if (ua.selectedOption) backendAnswer.selectedOption = ua.selectedOption
          if (ua.textAnswer) backendAnswer.textAnswer = ua.textAnswer
          if (ua.value !== undefined) backendAnswer.textAnswer = String(ua.value)
          if (ua.answers) backendAnswer.answers = ua.answers
          if (ua.matches) backendAnswer.matches = ua.matches
          if (ua.audioResponse) backendAnswer.audioResponse = ua.audioResponse
          if (ua.content) backendAnswer.textAnswer = ua.content // For writing
        }

        return backendAnswer
      })

      const response = await fetch('/api/mock-test/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: answersArray,
          timeSpent,
          testId,
          sessionFilters: test ? {
            language: test.language,
            module: test.module,
            section: test.section,
            standardSection: test.standardSection
          } : undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit test')
      }

      const resultData = await response.json()
      
      // Map API response to TestResult interface
      const apiResult = resultData.data.result
      setResult({
        attemptId: resultData.data.attemptId,
        score: apiResult.percentage,
        correctAnswers: apiResult.correctAnswers,
        totalQuestions: apiResult.totalQuestions || questions.length,
        passed: apiResult.status === 'pass',
        timeSpent: apiResult.timeSpent,
        earnedPoints: apiResult.totalScore,
        totalPoints: apiResult.maxScore
      })
      
      setTestCompleted(true)
      toast.success('Test submitted successfully!')
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to submit test')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'TRUE_FALSE':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FILL_BLANK':
        return <FileText className="h-4 w-4 text-purple-500" />
      case 'MATCHING':
        return <CheckCircle className="h-4 w-4 text-orange-500" />
      case 'AUDIO_QUESTION':
        return <Volume2 className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  if (!session) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to take tests.</p>
            <Button onClick={() => router.push('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Questions Available</h2>
            <p className="text-muted-foreground mb-6">Unable to load test questions.</p>
            <Button onClick={() => router.push('/mock-tests')}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Tests
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (testCompleted && result) {
    return (
      <main>
        <Navbar />

        <section className="py-16 bg-linear-to-br from-primary/10 via-background to-secondary/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-lg font-medium ${
                result.passed
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {result.passed ? (
                  <CheckCircle size={24} />
                ) : (
                  <XCircle size={24} />
                )}
                {result.passed ? 'Test Passed!' : 'Test Completed'}
              </div>

              <h1 className="text-4xl font-bold text-foreground">Your Results</h1>

              {/* Score Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                <Card className="bg-card border-border">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {result.score.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {result.correctAnswers}
                    </div>
                    <p className="text-sm text-muted-foreground">Correct</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">
                      {result.totalQuestions - result.correctAnswers}
                    </div>
                    <p className="text-sm text-muted-foreground">Incorrect</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                    </div>
                    <p className="text-sm text-muted-foreground">Time Spent</p>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button onClick={() => router.push('/mock-tests')} variant="outline">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Tests
                </Button>
                <Button onClick={() => router.push('/mock-test/results')}>
                  View All Results
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestion.id]

  return (
    <main>
      <Navbar />

      {/* Test Header */}
      <section className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/mock-tests')}
                className="bg-transparent border-border text-foreground hover:bg-secondary"
              >
                <ArrowLeft size={16} className="mr-2" />
                Exit Test
              </Button>

              <div>
                <h1 className="text-lg font-medium text-foreground">
                  {test?.title || 'Mock Test'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                  {test?.language && ` • ${test.language}`}
                  {test?.module && ` • ${test.module}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Progress */}
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Progress</div>
                <div className="text-lg font-medium text-foreground">
                  {getAnsweredCount()}/{questions.length} answered
                </div>
              </div>

              {/* Timer */}
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Time Left</div>
                <div className={`text-lg font-mono font-medium ${
                  timeLeft < 300 ? 'text-red-600' : 'text-foreground'
                }`}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitTest}
                disabled={submitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Submit Test
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress
              value={(getAnsweredCount() / questions.length) * 100}
              className="h-2"
            />
          </div>
        </div>
      </section>

      {/* Question Navigation */}
      <section className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestionIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuestionJump(index)}
                className={`w-10 h-10 p-0 ${
                  answers[questions[index].id]
                    ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
                    : currentQuestionIndex === index
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-transparent border-border text-foreground hover:bg-secondary'
                }`}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Question Content */}
      <section className="py-8 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                {getQuestionTypeIcon(currentQuestion.type)}
                <Badge variant="outline">
                  {currentQuestion.type.replace('_', ' ')}
                </Badge>
                <Badge variant="secondary">
                  {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <UnifiedAnswerForm
                key={currentQuestion.id}
                question={currentQuestion}
                questionIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                onAnswerChange={handleAnswerChange}
                onTimeUpdate={(time) => handleTimeUpdate(currentQuestion.id, time)}
                initialAnswer={answers[currentQuestion.id]}
                disabled={submitting}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="bg-transparent border-border text-foreground hover:bg-secondary"
                >
                  Previous
                </Button>

                <div className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="bg-transparent border-border text-foreground hover:bg-secondary"
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  )
}
