"use client"

import dynamic from 'next/dynamic'
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Calendar, Clock, User, ArrowLeft, Share2 } from "lucide-react"
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

export default function ArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/articles/${slug}`)

        if (!response.ok) {
          throw new Error('Article not found')
        }

        const data = await response.json()
        setArticle(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchArticle()
    }
  }, [slug])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const shareArticle = async () => {
    if (!article) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || '',
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Link href="/blog">
          <Button>
            <ArrowLeft size={16} className="mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} className="mr-2" />
        Back to Blog
      </Link>

      <article className="max-w-3xl mx-auto">
        {/* Featured Image */}
        {article.featuredImage && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {article.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
            {article.readTime && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {article.readTime} min read
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <span>{article.authorName || "Anonymous"}</span>
            </div>
            <span>|</span>
            <span>{article.viewCount} views</span>
          </div>
        </header>

        {/* Content */}
        <Card className="p-6 md:p-8 mb-8">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </Card>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="flex items-center justify-between border-t pt-6">
          <Link href="/blog">
            <Button variant="outline">
              <ArrowLeft size={16} className="mr-2" />
              More Articles
            </Button>
          </Link>
          <Button variant="outline" onClick={shareArticle}>
            <Share2 size={16} className="mr-2" />
            Share
          </Button>
        </div>
      </article>
      </main>
      <Footer />
    </div>
  )
}