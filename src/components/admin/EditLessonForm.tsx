"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { UnifiedFileUpload } from "@/components/upload/UnifiedFileUpload"

interface Course {
  id: string
  title: string
  language: string
  level: string
}

interface Lesson {
  id: string
  title: string
  description: string
  courseId: string
  type: "VIDEO" | "TEXT" | "AUDIO" | "INTERACTIVE" | "QUIZ"
  content: string
  attachments: any[]
  duration: number | null
  order: number
  isFree: boolean
}

interface EditLessonFormProps {
  lessonId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function EditLessonForm({ lessonId, onSuccess, onCancel }: EditLessonFormProps) {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    type: "VIDEO" as "VIDEO" | "TEXT" | "AUDIO" | "INTERACTIVE" | "QUIZ",
    content: "",
    attachments: [] as any[],
    duration: "",
    order: 1,
    isFree: false,
  })

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/admin/courses')
        const result = await response.json()

        if (result.success) {
          setCourses(result.data)
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(`/api/admin/lessons/${lessonId}`)
        const result = await response.json()

        if (result.success) {
          const lesson = result.data
          setFormData({
            title: lesson.title || "",
            description: lesson.description || "",
            courseId: lesson.courseId || "",
            type: lesson.type || "VIDEO",
            content: lesson.content || "",
            attachments: lesson.attachments || [],
            duration: lesson.duration?.toString() || "",
            order: lesson.order || 1,
            isFree: lesson.isFree || false,
          })
        } else {
          alert(result.message || 'Failed to fetch lesson')
        }
      } catch (error) {
        console.error('Error fetching lesson:', error)
        alert('Failed to fetch lesson')
      } finally {
        setFetchLoading(false)
      }
    }

    fetchLesson()
  }, [lessonId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }

    if (!formData.courseId) {
      alert('Course is required')
      return
    }

    if (!formData.content.trim()) {
      alert('Content is required')
      return
    }

    setLoading(true)

    try {
      const submitData = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null,
      }

      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update lesson')
      }
    } catch (error) {
      console.error('Error updating lesson:', error)
      alert('Failed to update lesson')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Lesson Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter lesson title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="courseId">Course *</Label>
          <Select
            value={formData.courseId}
            onValueChange={(value) => handleInputChange('courseId', value)}
            disabled={coursesLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select course"} />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title} ({course.language} - {course.level})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Lesson Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleInputChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lesson type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIDEO">Video</SelectItem>
              <SelectItem value="TEXT">Text</SelectItem>
              <SelectItem value="AUDIO">Audio</SelectItem>
              <SelectItem value="INTERACTIVE">Interactive</SelectItem>
              <SelectItem value="QUIZ">Quiz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
            placeholder="Lesson order (1, 2, 3...)"
            min="1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter lesson description (optional)"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          placeholder="Enter lesson content (text, HTML, or markdown)"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Attachments</Label>
        <UnifiedFileUpload
          onAttachmentsChange={(attachments) => {
            handleInputChange('attachments', attachments);
          }}
          existingAttachments={formData.attachments}
          folder="lessons"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', e.target.value)}
            placeholder="Duration in minutes (optional)"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="isFree">Free Lesson</Label>
          <Select
            value={formData.isFree.toString()}
            onValueChange={(value) => handleInputChange('isFree', value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Is this lesson free?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Paid (requires enrollment)</SelectItem>
              <SelectItem value="true">Free (accessible without enrollment)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Lesson
        </Button>
      </div>
    </form>
  )
}
