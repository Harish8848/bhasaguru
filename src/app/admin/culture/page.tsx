"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit2, Eye, Trash2, Search } from "lucide-react"
import { useState } from "react"

const articles = [
  {
    id: 1,
    title: "Traditions of Japanese Tea Ceremony",
    category: "Traditions",
    language: "Japanese",
    views: 1203,
    status: "PUBLISHED",
  },
  {
    id: 2,
    title: "Korean Cuisine: Kimchi and Beyond",
    category: "Food",
    language: "Korean",
    views: 892,
    status: "PUBLISHED",
  },
  {
    id: 3,
    title: "Cherry Blossom Festival Guide",
    category: "Festivals",
    language: "Japanese",
    views: 567,
    status: "PUBLISHED",
  },
  { id: 4, title: "English Breakfast Traditions", category: "Food", language: "English", views: 234, status: "DRAFT" },
  { id: 5, title: "Korean Fashion Tips", category: "Lifestyle", language: "Korean", views: 445, status: "PUBLISHED" },
]

export default function CulturePage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredArticles = articles.filter((article) => article.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Culture Content Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage culture articles</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                <p className="text-sm text-muted-foreground mt-2">{article.views} views</p>
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
                >
                  <Edit2 size={14} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-destructive hover:bg-destructive/10 bg-transparent"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
