"use client"

import { Calendar, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

interface CulturePost {
  id: string
  slug: string
  title: string
  excerpt?: string
  language: string
  status: string
  viewCount: number
  authorName?: string
  publishedAt?: string
  featuredImage?: string
  createdAt: string
}

interface CultureSectionProps {
  posts: CulturePost[]
}

export default function CultureSection({ posts }: CultureSectionProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <section className="py-8 md:py-8 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/culture/${post.slug}`}>
            <Card
              className="border-border overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
            >
              <div className="aspect-video bg-muted overflow-hidden relative">
                <Image
                  src={post.featuredImage || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false}
                  loading="lazy"
                />
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit text-xs">
                    {post.language}
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}