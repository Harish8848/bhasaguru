"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit2, Trash2, Eye, Search } from "lucide-react"
import { useState, useEffect } from "react"
import CreateCourseForm from "@/components/admin/CreateCourseForm"
import EditCourseForm from "@/components/admin/EditCourseForm"

interface Course {
  id: string
  title: string
  language: string
  level: string
  lessons: number
  students: number
  status: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/admin/courses', { cache: 'no-store' })
        const result = await response.json()

        if (result.success) {
          const mappedCourses: Course[] = result.data.map((course: any) => ({
            id: course.id,
            title: course.title,
            language: course.language,
            level: course.level,
            lessons: course._count.lessons,
            students: course._count.enrollments,
            status: course.status === 'PUBLISHED' ? 'Published' : course.status === 'DRAFT' ? 'Draft' : course.status,
          }))
          setCourses(mappedCourses)
        } else {
          setError(result.message || 'Failed to fetch courses')
        }
      } catch (err) {
        setError('Failed to fetch courses')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const filteredCourses = courses.filter((course) => course.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    // Refetch courses
    window.location.reload()
  }

  const handleCreateCancel = () => {
    setShowCreateDialog(false)
  }

  const handleEdit = (courseId: string) => {
    setEditingCourseId(courseId)
    setShowEditDialog(true)
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    setEditingCourseId(null)
    // Refetch courses
    window.location.reload()
  }

  const handleEditCancel = () => {
    setShowEditDialog(false)
    setEditingCourseId(null)
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        setCourses(courses.filter(course => course.id !== courseId))
      } else {
        alert(result.message || 'Failed to delete course')
      }
    } catch (err) {
      alert('Failed to delete course')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Courses Management</h1>
            <p className="text-muted-foreground mt-1">Loading courses...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Courses Management</h1>
            <p className="text-red-500 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Courses Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage all courses</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus size={18} className="mr-2" />
          Create Course
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Courses Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-foreground font-semibold">Title</th>
                <th className="text-left p-4 text-foreground font-semibold">Language</th>
                <th className="text-left p-4 text-foreground font-semibold">Level</th>
                <th className="text-left p-4 text-foreground font-semibold">Lessons</th>
                <th className="text-left p-4 text-foreground font-semibold">Students</th>
                <th className="text-left p-4 text-foreground font-semibold">Status</th>
                <th className="text-left p-4 text-foreground font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-foreground">{course.title}</td>
                  <td className="p-4 text-foreground">{course.language}</td>
                  <td className="p-4 text-foreground">{course.level}</td>
                  <td className="p-4 text-foreground">{course.lessons}</td>
                  <td className="p-4 text-foreground">{course.students}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.status === "Published"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {/* TODO: View course */}}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(course.id)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/80"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Course Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <CreateCourseForm onSuccess={handleCreateSuccess} onCancel={handleCreateCancel} />
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          {editingCourseId && (
            <EditCourseForm
              courseId={editingCourseId}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
