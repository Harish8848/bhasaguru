"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/upload/ImageUpload"

interface CulturePost {
  id: string
  title: string
  excerpt: string | null
  content: string
  language: string
  featuredImage: string | null
  status: string
  readTime: number | null
  authorName: string | null
}

interface EditCulturePostFormProps {
  postId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function EditCulturePostForm({ postId, onSuccess, onCancel }: EditCulturePostFormProps) {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    language: "Japanese",
    featuredImage: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    readTime: "",
    authorName: "",
  })

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/admin/culture/${postId}`)
        const result = await response.json()

        if (result.success) {
          const post = result.data
          setFormData({
            title: post.title || "",
            excerpt: post.excerpt || "",
            content: post.content || "",
            language: post.language || "Japanese",
            featuredImage: post.featuredImage || "",
            status: post.status || "DRAFT",
            readTime: post.readTime ? post.readTime.toString() : "",
            authorName: post.authorName || "",
          })
        } else {
          alert(result.message || 'Failed to fetch post')
        }
      } catch (error) {
        console.error('Error fetching post:', error)
        alert('Failed to fetch post')
      } finally {
        setFetchLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Title is required')
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
        excerpt: formData.excerpt || null,
        featuredImage: formData.featuredImage || null,
        readTime: formData.readTime ? parseInt(formData.readTime) : null,
        authorName: formData.authorName || null,
      }

      const response = await fetch(`/api/admin/culture/${postId}`, {
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
        alert(error.message || 'Failed to update post')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post')
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
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter culture post title"
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
              <SelectItem value="English">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="readTime">Read Time (minutes)</Label>
          <Input
            id="readTime"
            type="number"
            value={formData.readTime}
            onChange={(e) => handleInputChange('readTime', e.target.value)}
            placeholder="Estimated read time (optional)"
            min="1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => handleInputChange('excerpt', e.target.value)}
          placeholder="Brief summary of the post (optional)"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          placeholder="Full post content (HTML, Markdown, or plain text)"
          rows={6}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Featured Image</Label>
        <ImageUpload
          folder="culture"
          onUploadComplete={(url) => {
            handleInputChange('featuredImage', url);
          }}
          currentImage={formData.featuredImage}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="authorName">Author Name</Label>
        <Input
          id="authorName"
          value={formData.authorName}
          onChange={(e) => handleInputChange('authorName', e.target.value)}
          placeholder="Post author name (optional)"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Post
        </Button>
      </div>
    </form>
  )
}