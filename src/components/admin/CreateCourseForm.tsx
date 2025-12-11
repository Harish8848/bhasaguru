"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/upload/ImageUpload"

interface CreateCourseFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function CreateCourseForm({ onSuccess, onCancel }: CreateCourseFormProps) {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    language: "",
    level: "BEGINNER" as "BEGINNER" | "ELEMENTARY" | "INTERMEDIATE" | "UPPER_INTERMEDIATE" | "ADVANCED" | "PROFICIENT",
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
    thumbnail: "",
    metaTitle: "",
    metaDescription: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }

    if (!formData.language.trim()) {
      alert('Language is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create course')
      }
    } catch (error) {
      console.error('Error creating course:', error)
      alert('Failed to create course')
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
          <Label htmlFor="title">Course Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter course title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language *</Label>
          <Select
            value={formData.language}
            onValueChange={(value) => handleInputChange('language', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Japanese">Japanese</SelectItem>
              <SelectItem value="Korean">Korean</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Chinese">Chinese</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="German">German</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="level">Level *</Label>
          <Select
            value={formData.level}
            onValueChange={(value) => handleInputChange('level', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="ELEMENTARY">Elementary</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="UPPER_INTERMEDIATE">Upper Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
              <SelectItem value="PROFICIENT">Proficient</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
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
          placeholder="Enter course description (optional)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Course Thumbnail</Label>
        <ImageUpload
          folder="courses"
          onUploadComplete={(url, publicId) => {
            handleInputChange('thumbnail', url);
          }}
          currentImage={formData.thumbnail}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
          <Input
            id="metaTitle"
            value={formData.metaTitle}
            onChange={(e) => handleInputChange('metaTitle', e.target.value)}
            placeholder="SEO title (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
          <Input
            id="metaDescription"
            value={formData.metaDescription}
            onChange={(e) => handleInputChange('metaDescription', e.target.value)}
            placeholder="SEO description (optional)"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Course
        </Button>
      </div>
    </form>
  )
}
