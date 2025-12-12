"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit2, Eye, Trash2, Search, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import CreateArticleForm from "@/components/admin/CreateArticleForm"
import EditArticleForm from "@/components/admin/EditArticleForm"

interface Article {
  id: string
  title: string
  category: string
  language: string
  viewCount: number
  status: string
  _count?: {
    comments: number
  }
}

export default function CulturePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/articles')
      const result = await response.json()

      if (result.success) {
        setArticles(result.data)
      } else {
        setError(result.message || 'Failed to fetch articles')
      }
    } catch (err) {
      setError('Failed to fetch articles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    fetchArticles() // Refresh the articles list
  }

  const handleCreateCancel = () => {
    setShowCreateDialog(false)
  }

  const filteredArticles = articles.filter((article) => article.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleEdit = (articleId: string) => {
    setEditingArticleId(articleId)
    setShowEditDialog(true)
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    setEditingArticleId(null)
    fetchArticles()
  }

  const handleEditCancel = () => {
    setShowEditDialog(false)
    setEditingArticleId(null)
  }

  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        setArticles(articles.filter(article => article.id !== articleId))
      } else {
        alert(result.message || 'Failed to delete article')
      }
    } catch (err) {
      alert('Failed to delete article')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Culture Content Management</h1>
            <p className="text-muted-foreground mt-1">Loading articles...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Culture Content Management</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Culture Content Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage culture articles</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus size={18} className="mr-2" />
          Create Article
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArticles.map((article) => (
          <Card
            key={article.id}
            className="bg-card border-border hover:border-primary/50 transition-colors flex flex-col"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-foreground text-base line-clamp-2">{article.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-2">{article.category}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                    article.status === "PUBLISHED"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {article.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{article.language}</p>
                <p className="text-sm text-muted-foreground mt-2">{article.viewCount} views</p>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
                >
                  <Eye size={14} className="mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
                  onClick={() => handleEdit(article.id)}
                >
                  <Edit2 size={14} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-destructive hover:bg-destructive/10 bg-transparent"
                  onClick={() => handleDelete(article.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Article Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
          </DialogHeader>
          <CreateArticleForm onSuccess={handleCreateSuccess} onCancel={handleCreateCancel} />
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
          </DialogHeader>
          {editingArticleId && (
            <EditArticleForm
              articleId={editingArticleId}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
