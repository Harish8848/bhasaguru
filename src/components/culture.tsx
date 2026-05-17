"use client"

import { useState, useEffect, memo } from "react"
import { ArrowRight, Calendar, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Article {
  id: string
  title: string
  excerpt?: string
  category: string
  language: string
  status: string
  viewCount: number
  authorName?: string
  publishedAt?: string
  featuredImage?: string
  createdAt: string
}

export default function CultureSection() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles?status=PUBLISHED')
        const result = await response.json()

        if (result.success) {
          setArticles(result.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch articles:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const filteredPosts = articles.filter(post => post.language === 'Japanese')

  if (loading) {
    return (
      <section className="py-20 md:py-32 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 md:py-8  border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid md:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="border-border overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
            >
              <div className="aspect-video bg-muted overflow-hidden relative">
                <Image
                  src={post.featuredImage || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className=" object-contain group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                  loading="lazy"
                />
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit text-xs">
                    {post.category}
                  </Badge>
                  <h3 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{post.authorName || 'Anonymous'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
