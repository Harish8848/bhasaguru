"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, Search, Loader2, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import CreateArticleForm from "@/components/admin/CreateArticleForm"

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string | null
  language: string
  category: string
  status: string
  viewCount: number
  readTime: number | null
  authorName: string | null
  createdAt: string
  publishedAt: string | null
  _count: {
    comments: number
  }
}

interface PaginatedResponse {
  data: Article[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// API returns { success, data, pagination }
interface ApiResult {
  success: boolean
  data: Article[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalArticles, setTotalArticles] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchArticles = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      if (statusFilter !== "ALL") params.set("status", statusFilter)

      const response = await fetch(`/api/admin/articles?${params}`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }

      const json: ApiResult = await response.json()
      setArticles(json.data || [])
      setTotalPages(json.pagination.totalPages)
      setTotalArticles(json.pagination.total)
      setCurrentPage(json.pagination.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles(currentPage)
  }, [currentPage, statusFilter])

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    fetchArticles(currentPage)
  }

  const handleCreateCancel = () => {
    setShowCreateDialog(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const response = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchArticles(currentPage)
      }
    } catch (err) {
      console.error('Error deleting article:', err)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Articles Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage blog articles</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus size={18} className="mr-2" />
          Create Article
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {totalArticles} articles
        </div>
      </div>

      {/* Articles Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-foreground font-semibold">Title</th>
                <th className="text-left p-4 text-foreground font-semibold">Category</th>
                <th className="text-left p-4 text-foreground font-semibold">Language</th>
                <th className="text-left p-4 text-foreground font-semibold">Views</th>
                <th className="text-left p-4 text-foreground font-semibold">Comments</th>
                <th className="text-left p-4 text-foreground font-semibold">Status</th>
                <th className="text-left p-4 text-foreground font-semibold">Created</th>
                <th className="text-left p-4 text-foreground font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-foreground font-medium max-w-xs truncate">{article.title}</td>
                  <td className="p-4 text-foreground">{article.category}</td>
                  <td className="p-4 text-foreground">{article.language}</td>
                  <td className="p-4 text-foreground">{article.viewCount}</td>
                  <td className="p-4 text-foreground">{article._count.comments}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      article.status === "PUBLISHED" ? "bg-green-500/20 text-green-400" :
                      article.status === "DRAFT" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="p-4 text-foreground">{formatDate(article.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="View Article"
                        onClick={() => window.open(`/blog/${article.slug}`, '_blank')}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/80"
                        title="Delete Article"
                        onClick={() => handleDelete(article.id)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
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
      </Card>

      {/* Create Article Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
          </DialogHeader>
          <CreateArticleForm onSuccess={handleCreateSuccess} onCancel={handleCreateCancel} />
        </DialogContent>
      </Dialog>
    </div>
  )
}