"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface CreateArticleFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function CreateArticleForm({ onSuccess, onCancel }: CreateArticleFormProps) {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    language: "",
    category: "",
    tags: "",
    featuredImage: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    readTime: "",
    metaTitle: "",
    metaDescription: "",
    authorName: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Article title is required')
      return
    }

    if (!formData.content.trim()) {
      alert('Article content is required')
      return
    }

    if (!formData.language.trim()) {
      alert('Language is required')
      return
    }

    if (!formData.category.trim()) {
      alert('Category is required')
      return
    }

    setLoading(true)

    try {
      const submitData = {
        ...formData,
        excerpt: formData.excerpt || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        featuredImage: formData.featuredImage || null,
        readTime: formData.readTime ? parseInt(formData.readTime) : null,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
        authorName: formData.authorName || null,
      }

      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create article')
      }
    } catch (error) {
      console.error('Error creating article:', error)
      alert('Failed to create article')
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
          <Label htmlFor="title">Article Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter article title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language *</Label>
          <Input
            id="language"
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            placeholder="e.g., English, Spanish, French"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            placeholder="e.g., Culture, History, Language"
            required
          />
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
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => handleInputChange('excerpt', e.target.value)}
          placeholder="Brief summary of the article (optional)"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          placeholder="Full article content (HTML, Markdown, or plain text)"
          rows={6}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            placeholder="Comma-separated tags (optional)"
          />
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
        <Label htmlFor="featuredImage">Featured Image URL</Label>
        <Input
          id="featuredImage"
          value={formData.featuredImage}
          onChange={(e) => handleInputChange('featuredImage', e.target.value)}
          placeholder="URL of the featured image (optional)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="authorName">Author Name</Label>
          <Input
            id="authorName"
            value={formData.authorName}
            onChange={(e) => handleInputChange('authorName', e.target.value)}
            placeholder="Article author name (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={formData.metaTitle}
            onChange={(e) => handleInputChange('metaTitle', e.target.value)}
            placeholder="SEO meta title (optional)"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaDescription">Meta Description</Label>
        <Textarea
          id="metaDescription"
          value={formData.metaDescription}
          onChange={(e) => handleInputChange('metaDescription', e.target.value)}
          placeholder="SEO meta description (optional)"
          rows={2}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Article
        </Button>
      </div>
    </form>
  )
}
