"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit2, Copy, Trash2, Search, Loader2, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import CreateTestForm from "@/components/admin/CreateTestForm"
import EditTestForm from "@/components/admin/EditTestForm"

interface MockTest {
  id: string
  title: string
  description?: string
  courseId?: string
  type: "PRACTICE" | "FINAL" | "CERTIFICATION"
  duration: number
  passingScore: number
  questionsCount: number
  shuffleQuestions: boolean
  shuffleOptions: boolean
  showResults: boolean
  allowRetake: boolean
  course?: {
    title: string
  }
  _count: {
    attempts: number
  }
}

interface PaginatedResponse {
  data: MockTest[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function MockTestsPage() {
  const router = useRouter()
  const [tests, setTests] = useState<MockTest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTests, setTotalTests] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null)

  const fetchTests = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      const response = await fetch(`/api/admin/mock-tests?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tests')
      }

      const data: PaginatedResponse = await response.json()
      setTests(data.data)
      setTotalPages(data.pagination.totalPages)
      setTotalTests(data.pagination.total)
      setCurrentPage(data.pagination.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTests(currentPage)
  }, [currentPage])

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    fetchTests(currentPage) // Refresh the tests list
  }

  const handleEditTest = (test: MockTest) => {
    setSelectedTest(test)
    setEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
    setSelectedTest(null)
    fetchTests(currentPage) // Refresh the tests list
  }

  const handleDeleteTest = async (test: MockTest) => {
    if (!confirm(`Are you sure you want to delete "${test.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/mock-tests/${test.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTests(currentPage) // Refresh the tests list
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to delete test')
      }
    } catch (error) {
      console.error('Error deleting test:', error)
      alert('Failed to delete test')
    }
  }

  const handleManageQuestions = (testId: string) => {
    router.push(`/admin/mock-tests/${testId}/questions`)
  }

  if (loading && tests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        <p>Failed to load tests: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mock Tests Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage assessments</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={18} className="mr-2" />
          Create Test
        </Button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {totalTests} tests
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((test) => (
          <Card key={test.id} className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-foreground text-lg">{test.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {test.course?.title || 'General Test'} • {test.type}
                  </p>
                </div>
                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                  {test.type}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Questions</p>
                  <p className="text-lg font-bold text-foreground">{test.questionsCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-lg font-bold text-foreground">{test.duration}m</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Attempts</p>
                  <p className="text-lg font-bold text-foreground">{test._count.attempts}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManageQuestions(test.id)}
                  className="border-border text-foreground hover:bg-secondary bg-transparent"
                >
                  <FileText size={16} className="mr-1" />
                  Questions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTest(test)}
                  className="border-border text-foreground hover:bg-secondary bg-transparent"
                >
                  <Edit2 size={16} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-secondary bg-transparent"
                >
                  <Copy size={16} className="mr-1" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTest(test)}
                  className="border-border text-destructive hover:bg-destructive/10 bg-transparent"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {tests.length === 0 && !loading && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No tests found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border bg-card rounded-lg">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Create Test Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Test</DialogTitle>
          </DialogHeader>
          <CreateTestForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Test Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Test</DialogTitle>
          </DialogHeader>
          {selectedTest && (
            <EditTestForm
              test={selectedTest}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setEditDialogOpen(false)
                setSelectedTest(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
