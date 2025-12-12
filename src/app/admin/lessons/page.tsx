"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit2, Trash2, Eye, Search, FileText, ImageIcon, Video } from "lucide-react"
import { useState, useEffect } from "react"
import CreateLessonForm from "@/components/admin/CreateLessonForm"
import EditLessonForm from "@/components/admin/EditLessonForm"

interface Lesson {
  id: string
  title: string
  type: string
  duration: number | null
  course: {
    title: string
  }
  _count: {
    progress: number
  }
}

const typeConfig = {
  VIDEO: { icon: Video, label: "Video", color: "bg-blue-500/20 text-blue-400" },
  TEXT: { icon: FileText, label: "Text", color: "bg-green-500/20 text-green-400" },
  AUDIO: { icon: FileText, label: "Audio", color: "bg-purple-500/20 text-purple-400" },
  INTERACTIVE: { icon: FileText, label: "Interactive", color: "bg-orange-500/20 text-orange-400" },
  QUIZ: { icon: FileText, label: "Quiz", color: "bg-red-500/20 text-red-400" },
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch('/api/admin/lessons')
        const result = await response.json()

        if (result.success) {
          setLessons(result.data)
        } else {
          setError(result.message || 'Failed to fetch lessons')
        }
      } catch (err) {
        setError('Failed to fetch lessons')
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [])

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || lesson.type === filterType
    return matchesSearch && matchesType
  })

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "-"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}m`
  }

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    // Refetch lessons
    window.location.reload()
  }

  const handleCreateCancel = () => {
    setShowCreateDialog(false)
  }

  const handleEditLesson = (lessonId: string) => {
    setEditingLessonId(lessonId)
    setShowEditDialog(true)
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    setEditingLessonId(null)
    // Refetch lessons
    window.location.reload()
  }

  const handleEditCancel = () => {
    setShowEditDialog(false)
    setEditingLessonId(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lessons Management</h1>
            <p className="text-muted-foreground mt-1">Loading lessons...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Lessons Management</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Lessons Management</h1>
          <p className="text-muted-foreground mt-1">Manage photos, videos, and PDF lessons</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus size={18} className="mr-2" />
          Create Lesson
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {["all", "VIDEO", "TEXT", "AUDIO", "INTERACTIVE", "QUIZ"].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
              className={
                filterType === type
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }
            >
              {type === "all" ? "All Types" : typeConfig[type as keyof typeof typeConfig].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Lessons Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-foreground font-semibold">Title</th>
                <th className="text-left p-4 text-foreground font-semibold">Course</th>
                <th className="text-left p-4 text-foreground font-semibold">Type</th>
                <th className="text-left p-4 text-foreground font-semibold">Duration / Size</th>
                <th className="text-left p-4 text-foreground font-semibold">Students</th>
                <th className="text-left p-4 text-foreground font-semibold">Status</th>
                <th className="text-left p-4 text-foreground font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson) => {
                const type = typeConfig[lesson.type as keyof typeof typeConfig]
                const TypeIcon = type.icon
                return (
                  <tr key={lesson.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-foreground font-medium">{lesson.title}</td>
                    <td className="p-4 text-foreground text-sm">{lesson.course.title}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${type.color}`}
                      >
                        <TypeIcon size={14} />
                        {type.label}
                      </span>
                    </td>
                    <td className="p-4 text-foreground text-sm">
                      {formatDuration(lesson.duration)}
                    </td>
                    <td className="p-4 text-foreground">{lesson._count.progress.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        Active
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Preview"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit"
                          onClick={() => handleEditLesson(lesson.id)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/80"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Results summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredLessons.length} of {lessons.length} lessons
      </div>

      {/* Create Lesson Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Lesson</DialogTitle>
          </DialogHeader>
          <CreateLessonForm onSuccess={handleCreateSuccess} onCancel={handleCreateCancel} />
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          {editingLessonId && (
            <EditLessonForm
              lessonId={editingLessonId}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
