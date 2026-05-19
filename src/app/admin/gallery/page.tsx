"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, Search, Loader2, Image as ImageIcon, Video } from "lucide-react"
import { useState, useEffect } from "react"
import { ImageUpload } from "@/components/upload/ImageUpload"
import { VideoUpload } from "@/components/upload/VideoUpload"

interface GalleryItem {
  id: string
  title: string
  type: "IMAGE" | "VIDEO"
  url: string
  thumbnail: string | null
  alt: string | null
  caption: string | null
  folder: string
  status: string
  order: number
  createdAt: string
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("ALL")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    type: "IMAGE" as "IMAGE" | "VIDEO",
    url: "",
    thumbnail: "",
    alt: "",
    caption: "",
    folder: "gallery",
    status: "ACTIVE",
    order: 0,
  })

  const fetchItems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterType !== "ALL") params.set("type", filterType)

      const response = await fetch(`/api/admin/gallery?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch gallery items')
      }

      const data = await response.json()
      setItems(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [filterType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.url) {
      alert('Title and URL are required')
      return
    }

    try {
      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          thumbnail: formData.thumbnail || null,
        }),
      })

      if (response.ok) {
        setShowCreateDialog(false)
        setFormData({
          title: "",
          type: "IMAGE",
          url: "",
          thumbnail: "",
          alt: "",
          caption: "",
          folder: "gallery",
          status: "ACTIVE",
          order: 0,
        })
        fetchItems()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create item')
      }
    } catch (err) {
      console.error('Error creating item:', err)
      alert('Failed to create item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchItems()
      }
    } catch (err) {
      console.error('Error deleting item:', err)
    }
  }

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && items.length === 0) {
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
          <h1 className="text-3xl font-bold text-foreground">Gallery Management</h1>
          <p className="text-muted-foreground mt-1">Manage photos and videos</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus size={18} className="mr-2" />
          Add Media
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search gallery..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="IMAGE">Images</SelectItem>
              <SelectItem value="VIDEO">Videos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {filteredItems.length} items
        </div>
      </div>

      {/* Gallery Grid */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="p-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No gallery items found. Add your first media!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                  {item.type === 'IMAGE' ? (
                    <img src={item.url} alt={item.alt || item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black/90">
                      <Video size={48} className="text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <p className="text-white text-sm font-medium text-center px-2">{item.title}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                    <p className="text-white text-xs truncate">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Gallery Media</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Media title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as "IMAGE" | "VIDEO", url: "" }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="HIDDEN">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Media *</Label>
              {formData.type === 'IMAGE' ? (
                <ImageUpload
                  folder="gallery"
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, url }))}
                />
              ) : (
                <VideoUpload
                  folder="gallery/videos"
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, url }))}
                />
              )}
              {formData.url && (
                <div className="mt-2">
                  {formData.type === 'IMAGE' ? (
                    <img src={formData.url} alt="Preview" className="w-full h-32 object-cover rounded" />
                  ) : (
                    <video src={formData.url} className="w-full h-32 object-cover rounded" controls />
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={formData.alt}
                onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
                placeholder="Alternative text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                value={formData.caption}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Optional caption"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder">Folder</Label>
              <Input
                id="folder"
                value={formData.folder}
                onChange={(e) => setFormData(prev => ({ ...prev, folder: e.target.value }))}
                placeholder="gallery"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Media</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}