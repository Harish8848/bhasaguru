"use client"

import dynamic from 'next/dynamic'
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Search, Calendar, Clock, User } from "lucide-react"
import Link from "next/link"

const Navbar = dynamic(() => import("@/components/navbar"), { ssr: false })
const Footer = dynamic(() => import("@/components/footer"), { ssr: false })

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  language: string
  category: string
  tags: string[]
  featuredImage: string | null
  viewCount: number
  readTime: number | null
  authorName: string | null
  createdAt: string
  publishedAt: string | null
  _count: {
    comments: number
  }
}

interface ArticlesResponse {
  data: Article[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({ status: 'PUBLISHED' })

        const response = await fetch(`/api/articles?${params}`)
        const json = await response.json()

        // API returns { success, data: { data: [...], meta: {...} } }
        const articlesData = json.data?.data || []
        setArticles(Array.isArray(articlesData) ? articlesData : [])

        // Extract unique categories
        const cats = [...new Set(articlesData.map((a: Article) => a.category))]
        setCategories(cats as string[])
      } catch (err) {
        console.error("Error fetching articles:", err)
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [selectedCategory])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
  }

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow container mx-auto  py-4">
        <div className="text-center ">
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4  max-w-4xl mx-auto">
        <div className="relative flex-1 max-w-sm mx-auto">
          <Search className=" absolute  top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10  p-6 bg-accent/10 border-border  text-foreground placeholder:text-muted-foreground text-base "
          />
        </div>
        <div className=" gap-2 ">
          {categories.slice(0, 5).map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles Count */}
      <div className="mb-6 text-muted-foreground">
        Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-foreground mb-2">No articles found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try a different search term." : "Check back soon for new content."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Link key={article.id} href={`/blog/${article.slug}`}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                {article.featuredImage && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
                    {article.title}
                  </h2>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {article.excerpt || stripHtml(article.content)}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{article.authorName || "Anonymous"}</span>
                    </div>
                    {article.readTime && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{article.readTime} min read</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
      </main>
      <Footer />
    </div>
  )
}