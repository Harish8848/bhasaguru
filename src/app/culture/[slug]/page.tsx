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

interface CulturePost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  language: string
  featuredImage: string | null
  viewCount: number
  readTime: number | null
  authorName: string | null
  createdAt: string
  publishedAt: string | null
}

export default function CulturePostPage() {
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<CulturePost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/culture/${slug}`)

        if (!response.ok) {
          throw new Error('Post not found')
        }

        const data = await response.json()
        setPost(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchPost()
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

  const sharePost = async () => {
    if (!post) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
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

  if (error || !post) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Culture Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Link href="/culture">
            <Button>
              <ArrowLeft size={16} className="mr-2" />
              Back to Culture
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/culture" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} className="mr-2" />
        Back to Culture
      </Link>

      <article className="max-w-3xl mx-auto">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {post.language}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            {post.readTime && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {post.readTime} min read
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <span>{post.authorName || "Anonymous"}</span>
            </div>
            <span>|</span>
            <span>{post.viewCount} views</span>
          </div>
        </header>

        {/* Content */}
        <Card className="p-6 md:p-8 mb-8">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Card>

        {/* Share */}
        <div className="flex items-center justify-between border-t pt-6">
          <Link href="/culture">
            <Button variant="outline">
              <ArrowLeft size={16} className="mr-2" />
              More Culture Posts
            </Button>
          </Link>
          <Button variant="outline" onClick={sharePost}>
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