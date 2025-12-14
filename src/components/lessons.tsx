"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Video, FileText, ImageIcon, Play, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"

const languages = [
  { id: "Japanese", name: "Japanese", flag: "🇯🇵" },
  { id: "Korean", name: "Korean", flag: "🇰🇷" },
  { id: "English", name: "English", flag: "🇬🇧" },

]

const typeConfig = {
  video: { icon: Video, label: "Video", color: "bg-blue-500/20 text-blue-400", bgHover: "hover:bg-blue-500/30" },
  text: { icon: FileText, label: "Text", color: "bg-purple-500/20 text-purple-400", bgHover: "hover:bg-purple-500/30" },
  audio: { icon: FileText, label: "Audio", color: "bg-green-500/20 text-green-400", bgHover: "hover:bg-green-500/30" },
  interactive: { icon: ImageIcon, label: "Interactive", color: "bg-orange-500/20 text-orange-400", bgHover: "hover:bg-orange-500/30" },
  quiz: { icon: ImageIcon, label: "Quiz", color: "bg-red-500/20 text-red-400", bgHover: "hover:bg-red-500/30" },
}

interface Lesson {
  id: string
  title: string
  course: string
  language: string
  type: string
  duration?: string
  views: number
  level: string
  description?: string
  isFree: boolean
  slug: string
}

export default function LessonsPage() {
  const searchParams = useSearchParams()
  const [selectedLanguage, setSelectedLanguage] = useState("Japanese")
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initialize state from URL parameters
  useEffect(() => {
    const language = searchParams.get("language")
    const level = searchParams.get("level")

    if (language) {
      setSelectedLanguage(language)
    }
    if (level) {
      setSelectedLevel(level)
    }
  }, [searchParams])

  // Fetch lessons from API
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          language: selectedLanguage,
          ...(selectedLevel && { level: selectedLevel }),
          ...(searchTerm && { search: searchTerm }),
        })

        const response = await fetch(`/api/lessons?${params}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch lessons")
        }

        setLessons(data.lessons || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch lessons")
        setLessons([])
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [selectedLanguage, selectedLevel, searchTerm])

  const selectedLanguageData = languages.find((l) => l.id === selectedLanguage)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      })
    }
  }

  const handleLanguageChange = (languageId: string) => {
    setSelectedLanguage(languageId)
    setSelectedLevel(null) // Reset level when language changes
    setSearchTerm("")
  }

  return (

    
    <div className="min-h-screen bg-background">
      {/* Header */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
        {/* Search Bar */}
        <div className="max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-input border-border text-foreground placeholder:text-muted-foreground text-base"
            />
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Select Language</h2>
          <div className="relative">
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background border border-border rounded-full p-2 hover:bg-muted transition-colors"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide px-12"
              style={{ scrollBehavior: "smooth" }}
            >
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`flex flex-col items-center gap-2 px-4 py-4 rounded-lg border-2 transition-all whitespace-nowrap shrink-0 ${
                    selectedLanguage === lang.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <span className="text-3xl">{lang.flag}</span>
                  <span className="text-sm font-medium text-foreground">{lang.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background border border-border rounded-full p-2 hover:bg-muted transition-colors"
            >
              <ChevronRight size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {selectedLanguageData?.name} Lessons
              {selectedLevel && <span className="text-primary ml-2">({selectedLevel})</span>}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? "Loading..." : `${lessons.length} lesson${lessons.length !== 1 ? "s" : ""} available`}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading lessons...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 rounded-lg border-2 border-dashed border-destructive/50">
            <div className="text-destructive mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-destructive mb-1">Error loading lessons</h3>
            <p className="text-muted-foreground text-center">{error}</p>
          </div>
        )}

        {/* Lessons Grid */}
        {!loading && !error && lessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => {
              const typeInfo = typeConfig[lesson.type as keyof typeof typeConfig] || typeConfig.text
              const TypeIcon = typeInfo.icon
              return (
                <Card
                  key={lesson.id}
                  className={`bg-card border-border hover:border-primary/50 transition-all cursor-pointer group overflow-hidden ${typeInfo.bgHover}`}
                >
                  {/* Type Badge */}
                  <div className="relative h-32 bg-linear-to-br from-muted/50 to-muted flex items-center justify-center">
                    <div className={`p-4 rounded-lg ${typeInfo.color}`}>
                      <TypeIcon size={32} />
                    </div>
                    {lesson.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/80">
                        <Play size={40} className="text-primary fill-primary" />
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <div className="space-y-2">
                      <CardTitle className="text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {lesson.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">{lesson.course}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                        <TypeIcon size={12} className="inline mr-1" />
                        {typeInfo.label}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground">
                        {lesson.level}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{lesson.views.toLocaleString()} views</span>
                      {lesson.duration && <span>{lesson.duration}</span>}
                    </div>

                    {/* CTA Button */}
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
                      Start Lesson
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : !loading && !error && (
          <div className="flex flex-col items-center justify-center py-12 rounded-lg border-2 border-dashed border-border">
            <Search size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No lessons found</h3>
            <p className="text-muted-foreground">Try searching with different keywords or select a different language</p>
          </div>
        )}
      </main>
    </div>
  )
}
