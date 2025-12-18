"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import SpeakingTestInterface from "@/components/speaking/SpeakingTestInterface"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { QuestionType, SpeakingQuestion } from "@/lib/types/test"

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

export default function SpeakingTestPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [test, setTest] = useState<MockTest | null>(null)
  const [questions, setQuestions] = useState<SpeakingQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const testId = params.testId as string

  // Fetch test data and questions on mount
  useEffect(() => {
    if (session && testId) {
      fetchTestData()
    }
  }, [session, testId])

  const fetchTestData = async () => {
    try {
      setLoading(true)

      // First, fetch the test metadata
      const testResponse = await fetch(`/api/admin/mock-tests/${testId}`)
      if (!testResponse.ok) {
        throw new Error('Test not found')
      }
      
      const testData = await testResponse.json()
      const testInfo = testData.data
      setTest(testInfo)

      // Then fetch questions for this specific test
      const questionsResponse = await fetch(`/api/mock-test/start?testId=${testId}`)
      
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        const fetchedQuestions = questionsData.data?.questions || []
        
        // Filter only speaking questions
        const speakingQuestions = fetchedQuestions.filter((q: any) => 
          q.type === QuestionType.SPEAKING_PART1 || 
          q.type === QuestionType.SPEAKING_PART2 || 
          q.type === QuestionType.SPEAKING_PART3
        )
        
        setQuestions(speakingQuestions)
        
        if (speakingQuestions.length === 0) {
          toast.error('No speaking questions found for this test')
          router.push('/mock-tests')
        }
      } else {
        const errorData = await questionsResponse.json()
        throw new Error(errorData.message || 'Failed to load questions')
      }
    } catch (error) {
      console.error('Failed to fetch test data:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load test')
      router.push('/mock-tests')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (responses: { [questionId: string]: { audioUrl: string; duration: number } }) => {
    try {
      setSubmitting(true)

      const response = await fetch('/api/speaking/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          responses
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit speaking test')
      }

      const resultData = await response.json()
      toast.success('Speaking test submitted successfully!')
      
      // Navigate to results page or back to tests
      router.push('/mock-tests')
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to submit speaking test')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExit = () => {
    router.push('/mock-tests')
  }

  if (!session) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to take speaking tests.</p>
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
            <h2 className="text-2xl font-bold text-foreground mb-2">No Speaking Questions Available</h2>
            <p className="text-muted-foreground mb-6">Unable to load speaking test questions.</p>
            <Button onClick={() => router.push('/mock-tests')}>
              Back to Tests
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Navbar />
      
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SpeakingTestInterface
            testId={testId}
            testTitle={test?.title || 'IELTS Speaking Test'}
            questions={questions}
            onSubmit={handleSubmit}
            onExit={handleExit}
            disabled={submitting}
          />
        </div>
      </div>

      <Footer />
    </main>
  )
}
