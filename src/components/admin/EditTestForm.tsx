"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"

interface Course {
  id: string
  title: string
  language: string
}

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
}

interface EditTestFormProps {
  test?: MockTest
  onSuccess: () => void
  onCancel: () => void
}

export default function EditTestForm({ test, onSuccess, onCancel }: EditTestFormProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [coursesLoading, setCoursesLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: test?.title || "",
    description: test?.description || "",
    courseId: test?.courseId || "",
    type: test?.type || "PRACTICE" as "PRACTICE" | "FINAL" | "CERTIFICATION",
    duration: test?.duration || 30,
    passingScore: test?.passingScore || 60,
    questionsCount: test?.questionsCount || 10,
    shuffleQuestions: test?.shuffleQuestions ?? true,
    shuffleOptions: test?.shuffleOptions ?? true,
    showResults: test?.showResults ?? true,
    allowRetake: test?.allowRetake ?? true,
  })

  // Fetch courses for selection
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/admin/courses?limit=100')
        if (response.ok) {
          const data = await response.json()
          setCourses(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }

    if (formData.questionsCount < 1) {
      alert('Questions count must be at least 1')
      return
    }

    if (formData.duration < 1) {
      alert('Duration must be at least 1 minute')
      return
    }

    setLoading(true)

    try {
      const url = test ? `/api/admin/mock-tests/${test.id}` : '/api/admin/mock-test/create'
      const method = test ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          courseId: formData.courseId === "none" ? null : formData.courseId || null,
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.message || `Failed to ${test ? 'update' : 'create'} test`)
      }
    } catch (error) {
      console.error(`Error ${test ? 'updating' : 'creating'} test:`, error)
      alert(`Failed to ${test ? 'update' : 'create'} test`)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Test Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter test title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Test Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleInputChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select test type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRACTICE">Practice</SelectItem>
              <SelectItem value="FINAL">Final</SelectItem>
              <SelectItem value="CERTIFICATION">Certification</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter test description (optional)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="courseId">Associated Course (Optional)</Label>
        <Select
          value={formData.courseId}
          onValueChange={(value) => handleInputChange('courseId', value)}
          disabled={coursesLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select a course"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No course (General test)</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title} ({course.language})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes) *</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 30)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passingScore">Passing Score (%) *</Label>
          <Input
            id="passingScore"
            type="number"
            min="0"
            max="100"
            value={formData.passingScore}
            onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value) || 60)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="questionsCount">Questions Count *</Label>
          <Input
            id="questionsCount"
            type="number"
            min="1"
            value={formData.questionsCount}
            onChange={(e) => handleInputChange('questionsCount', parseInt(e.target.value) || 10)}
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Test Settings</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="shuffleQuestions"
              checked={formData.shuffleQuestions}
              onCheckedChange={(checked: boolean) => handleInputChange('shuffleQuestions', checked)}
            />
            <Label htmlFor="shuffleQuestions" className="text-sm">Shuffle questions</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="shuffleOptions"
              checked={formData.shuffleOptions}
              onCheckedChange={(checked: boolean) => handleInputChange('shuffleOptions', checked)}
            />
            <Label htmlFor="shuffleOptions" className="text-sm">Shuffle options</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="showResults"
              checked={formData.showResults}
              onCheckedChange={(checked: boolean) => handleInputChange('showResults', checked)}
            />
            <Label htmlFor="showResults" className="text-sm">Show results after completion</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowRetake"
              checked={formData.allowRetake}
              onCheckedChange={(checked: boolean) => handleInputChange('allowRetake', checked)}
            />
            <Label htmlFor="allowRetake" className="text-sm">Allow retake</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {test ? 'Update Test' : 'Create Test'}
        </Button>
      </div>
    </form>
  )
}
