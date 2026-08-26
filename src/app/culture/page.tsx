"use client"

import dynamic from 'next/dynamic'
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import Link from "next/link"

const Navbar = dynamic(() => import("@/components/navbar"), { ssr: false })
const Footer = dynamic(() => import("@/components/footer"), { ssr: false })
const CultureSection = dynamic(() => import("@/components/culture"), { ssr: false })

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

export default function CulturePage() {
  const [posts, setPosts] = useState<CulturePost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/culture?status=PUBLISHED')
        const result = await response.json()

        if (result.success) {
          setPosts(result.data.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch culture posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow container mx-auto  py-4">
        {/* Search */}
        <div className="grow container  max-w-4xl mx-auto ">
          <div className="relative max-w-sm flex-1 mx-auto">
            <Search className="absolute  left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search culture posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10  bg-accent/10 border-border text-foreground placeholder:text-muted-foreground text-base"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-muted-foreground">
          Showing {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
            <h3 className="text-xl font-semibold text-foreground mb-2">No culture posts found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try a different search term." : "Check back soon for new content."}
            </p>
          </div>
        ) : (
          <CultureSection posts={filteredPosts} />
        )}
      </main>
      <Footer />
    </div>
  )
}
