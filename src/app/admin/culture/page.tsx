"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit2, Eye, Trash2, Search, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import CreateCulturePostForm from "@/components/admin/CreateCulturePostForm"
import EditCulturePostForm from "@/components/admin/EditCulturePostForm"

interface CulturePost {
  id: string
  slug: string
  title: string
  language: string
  viewCount: number
  status: string
}

export default function CulturePage() {
  const [posts, setPosts] = useState<CulturePost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/culture')
      const result = await response.json()

      if (result.success) {
        setPosts(result.data?.data || [])
      } else {
        setError(result.message || 'Failed to fetch posts')
      }
    } catch (err) {
      setError('Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    fetchPosts()
  }

  const handleCreateCancel = () => {
    setShowCreateDialog(false)
  }

  const filteredPosts = posts.filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleEdit = (postId: string) => {
    setEditingPostId(postId)
    setShowEditDialog(true)
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    setEditingPostId(null)
    fetchPosts()
  }

  const handleEditCancel = () => {
    setShowEditDialog(false)
    setEditingPostId(null)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/admin/culture/${postId}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        setPosts(posts.filter(post => post.id !== postId))
      } else {
        alert(result.message || 'Failed to delete post')
      }
    } catch (err) {
      alert('Failed to delete post')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Culture Posts Management</h1>
            <p className="text-muted-foreground mt-1">Loading posts...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Culture Posts Management</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Culture Posts Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage culture posts</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus size={18} className="mr-2" />
          Create Post
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts.map((post) => (
          <Card
            key={post.id}
            className="bg-card border-border hover:border-primary/50 transition-colors flex flex-col"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-foreground text-base line-clamp-2">{post.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-2">{post.language}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                    post.status === "PUBLISHED"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {post.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-sm text-muted-foreground mt-2">{post.viewCount} views</p>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
                  onClick={() => window.open(`/culture/${post.slug}`, '_blank')}
                >
                  <Eye size={14} className="mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border text-foreground hover:bg-secondary bg-transparent"
                  onClick={() => handleEdit(post.id)}
                >
                  <Edit2 size={14} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-destructive hover:bg-destructive/10 bg-transparent"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found. Create your first culture post!</p>
        </div>
      )}

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <CreateCulturePostForm onSuccess={handleCreateSuccess} onCancel={handleCreateCancel} />
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          {editingPostId && (
            <EditCulturePostForm
              postId={editingPostId}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}