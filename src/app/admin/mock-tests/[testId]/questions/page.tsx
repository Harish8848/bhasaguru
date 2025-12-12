"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit2, Trash2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import CreateQuestionForm from "@/components/admin/CreateQuestionForm"

interface Question {
  id: string
  questionText: string
  type: string
  points: number
  order: number
  difficulty?: string
}

interface MockTest {
  id: string
  title: string
  description?: string
  type: string
  questionsCount: number
}

export default function TestQuestionsPage() {
  const params = useParams()
  const testId = params.testId as string

  const [test, setTest] = useState<MockTest | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const fetchTestAndQuestions = async () => {
    try {
      setLoading(true)

      // Fetch test details
      const testResponse = await fetch(`/api/admin/mock-tests/${testId}`)
      if (!testResponse.ok) {
        throw new Error('Failed to fetch test details')
      }
      const testData = await testResponse.json()
      setTest(testData.data)

      // Fetch questions
      const questionsResponse = await fetch(`/api/admin/mock-test/questions?testId=${testId}`)
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setQuestions(questionsData.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (testId) {
      fetchTestAndQuestions()
    }
  }, [testId])

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    fetchTestAndQuestions() // Refresh the questions list
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="text-center text-destructive">
        <p>Failed to load test: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/mock-tests">
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} className="mr-2" />
            Back to Tests
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{test.title}</h1>
          <p className="text-muted-foreground mt-1">Questions Management</p>
        </div>
      </div>

      {/* Test Info */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Test Type</p>
              <p className="font-medium text-foreground">{test.type}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Questions</p>
              <p className="text-2xl font-bold text-foreground">{questions.length}</p>
            </div>
          </div>
          {test.description && (
            <p className="text-muted-foreground mt-4">{test.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Questions</h2>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={18} className="mr-2" />
            Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground text-lg mb-4">
                  This test has 0 questions.
                </p>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus size={18} className="mr-2" />
                  Add Question
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {questions.map((question) => (
              <Card key={question.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-foreground text-lg mb-2">
                        Question {question.order}
                      </CardTitle>
                      <p className="text-muted-foreground">{question.questionText}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit2 size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                      {question.type.replace('_', ' ')}
                    </span>
                    <span className="text-muted-foreground">
                      Points: {question.points}
                    </span>
                    {question.difficulty && (
                      <span className="text-muted-foreground">
                        Difficulty: {question.difficulty}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Question Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
          </DialogHeader>
          <CreateQuestionForm
            testId={testId}
            testType={test.type}
            onSuccess={handleCreateSuccess}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
