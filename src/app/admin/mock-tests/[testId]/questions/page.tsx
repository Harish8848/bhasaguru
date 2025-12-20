"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, Edit2, Trash2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import CreateQuestionForm from "@/components/admin/CreateQuestionForm"
import EditQuestionForm from "@/components/admin/EditQuestionForm"

interface Question {
  id: string
  questionText: string
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "MATCHING" | "AUDIO_QUESTION" | "SPEAKING_PART1" | "SPEAKING_PART2" | "SPEAKING_PART3"
  points: number
  order: number
  difficulty?: string
  audioUrl?: string
  imageUrl?: string
  videoUrl?: string
  options?: any[]
  correctAnswer?: string
  explanation?: string
  questionPassage?: string
  questionSubSection?: string
  language?: string
  module?: string
  section?: string
  standardSection?: string
  preparationTime?: number
  speakingTime?: number
  cueCardContent?: string
  followUpQuestions?: any
}

interface MockTest {
  id: string
  title: string
  description?: string
  type: string
  language?: string
  questionsCount: number
}

export default function TestQuestionsPage() {
  const params = useParams()
  const testId = params.testId as string

  const [test, setTest] = useState<MockTest | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchTestAndQuestions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }

      // Add cache-busting timestamp
      const timestamp = Date.now()
      
      // Fetch test details
      const testResponse = await fetch(`/api/admin/mock-tests/${testId}?_t=${timestamp}`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (!testResponse.ok) {
        throw new Error('Failed to fetch test details')
      }
      const testData = await testResponse.json()
      setTest(testData.data)

      // Fetch questions - get all questions for this test (no pagination in admin)
      const questionsResponse = await fetch(`/api/admin/mock-test/questions?testId=${testId}&limit=1000&_t=${timestamp}`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        console.log('Fetched questions:', questionsData.data) // Debug logging
        setQuestions(questionsData.data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (testId) {
      fetchTestAndQuestions()
    }
  }, [testId])

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    fetchTestAndQuestions(true) // Refresh the questions list without showing full-page loader
  }

  const handleEditClick = (question: Question) => {
    setSelectedQuestion(question)
    setEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
    setSelectedQuestion(null)
    fetchTestAndQuestions(true) // Refresh the questions list without showing full-page loader
  }

  const handleDeleteClick = (question: Question) => {
    setSelectedQuestion(question)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedQuestion || isDeleting) return

    try {
      setIsDeleting(true)
      
      // Optimistically remove the question from the UI first
      const questionIdToDelete = selectedQuestion.id
      setQuestions(prev => prev.filter(q => q.id !== questionIdToDelete))
      setDeleteDialogOpen(false)
      setSelectedQuestion(null)
      
      const response = await fetch(`/api/admin/mock-test/questions?id=${questionIdToDelete}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Success - refresh to sync with server
        fetchTestAndQuestions(true)
      } else {
        const error = await response.json()
        console.error('Delete API Error:', error)
        // Revert the optimistic update on error
        fetchTestAndQuestions(true)
        alert(error.message || 'Failed to delete question')
      }
    } catch (error) {
      console.error('Delete Question Error:', error)
      // Revert on error
      fetchTestAndQuestions(true)
      alert('Failed to delete question')
    } finally {
      setIsDeleting(false)
    }
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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Questions</h2>
            {isRefreshing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(question)}
                      >
                        <Edit2 size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(question)}
                      >
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
            testLanguage={test.language}
            onSuccess={handleCreateSuccess}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <EditQuestionForm
              question={selectedQuestion}
              testType={test.type}
              testLanguage={test.language}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setEditDialogOpen(false)
                setSelectedQuestion(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question
              "{selectedQuestion?.questionText?.substring(0, 50)}..." and remove it from the test.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedQuestion(null)} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
