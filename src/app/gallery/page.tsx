"use client"

import dynamic from 'next/dynamic'
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Image as ImageIcon, Video, Play } from "lucide-react"

const Navbar = dynamic(() => import("@/components/navbar"), { ssr: false })
const Footer = dynamic(() => import("@/components/footer"), { ssr: false })

interface GalleryItem {
  id: string
  title: string
  type: "IMAGE" | "VIDEO"
  url: string
  thumbnail: string | null
  alt: string | null
  caption: string | null
  createdAt: string
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL")
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (selectedFilter !== "ALL") params.set("type", selectedFilter)

        const response = await fetch(`/api/gallery?${params}`)
        const data = await response.json()
        setItems(data.data || [])
      } catch (err) {
        console.error("Error fetching gallery:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchGallery()
  }, [selectedFilter])

  const images = items.filter(item => item.type === "IMAGE")
  const videos = items.filter(item => item.type === "VIDEO")

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
      <main className="grow container mx-auto px-4 py-8">
      

      {/* Filter Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        <Button
          variant={selectedFilter === "ALL" ? "default" : "outline"}
          onClick={() => setSelectedFilter("ALL")}
        >
          All ({items.length})
        </Button>
        <Button
          variant={selectedFilter === "IMAGE" ? "default" : "outline"}
          onClick={() => setSelectedFilter("IMAGE")}
        >
          <ImageIcon size={16} className="mr-2" />
          Photos ({images.length})
        </Button>
        <Button
          variant={selectedFilter === "VIDEO" ? "default" : "outline"}
          onClick={() => setSelectedFilter("VIDEO")}
        >
          <Video size={16} className="mr-2" />
          Videos ({videos.length})
        </Button>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No media yet</h3>
          <p className="text-muted-foreground">
            Check back soon for photos and videos from our community.
          </p>
        </div>
      ) : (
        <>
          {/* Images Grid */}
          {selectedFilter !== "VIDEO" && images.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Photos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <img
                      src={item.url}
                      alt={item.alt || item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">{item.title}</p>
                      {item.caption && (
                        <p className="text-white/80 text-xs mt-1">{item.caption}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Grid */}
          {selectedFilter !== "IMAGE" && videos.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Videos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {videos.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-video rounded-lg overflow-hidden bg-black cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <video
                      src={item.url}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      poster={item.thumbnail || undefined}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                        <Play size={24} className="ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/70 to-transparent">
                      <p className="text-white text-sm font-medium">{item.title}</p>
                      {item.caption && (
                        <p className="text-white/80 text-xs mt-1">{item.caption}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-4xl font-bold"
            onClick={() => setSelectedItem(null)}
          >
            &times;
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            {selectedItem.type === "IMAGE" ? (
              <img
                src={selectedItem.url}
                alt={selectedItem.alt || selectedItem.title}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={selectedItem.url}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-lg"
              />
            )}
            <div className="text-center mt-4">
              <h3 className="text-white text-lg font-semibold">{selectedItem.title}</h3>
              {selectedItem.caption && (
                <p className="text-white/70 mt-1">{selectedItem.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
      </main>
      <Footer />
    </div>
  )
}