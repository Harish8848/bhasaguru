"use client"
import { BookOpen, Users, Globe, Clock, Loader2, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Course {
  id: string
  slug: string
  title: string
  description: string
  language: string
  level: string
  thumbnail: string | null
  duration: number | null
  lessonsCount: number
  studentsCount: number
  publishedAt: string | null
}

export default function CoursesSection() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [languages, setLanguages] = useState<{code: string, label: string, icon: string}[]>([])
  const [languageStats, setLanguageStats] = useState<{[key: string]: {courses: number, learners: number}}>({})
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const handleStartLearning = (course: Course) => {
    router.push(`/lessons?language=${course.language}&level=${course.level}`)
  }

  // CEFR Levels based on database enum
  

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (selectedLanguage && selectedLanguage !== "all") {
          params.append("language", selectedLanguage)
        }
        if (searchQuery) {
          params.append("search", searchQuery)
        }

        const url = `/api/courses${params.toString() ? `?${params.toString()}` : ''}`
        const response = await fetch(url)
        const result = await response.json()

        if (result.courses) {
          console.log('Fetched courses:', result.courses)
          setCourses(result.courses.slice(0, 6)) // Limit to 6 for featured section

          // Calculate distinct languages from courses
          const languageSet = new Set<string>()
          const languageStats: {[key: string]: {courses: number, learners: number}} = {}

          result.courses.forEach((course: Course) => {
            languageSet.add(course.language)
            const langCode = course.language  // Use original case to match codes
            if (!languageStats[langCode]) {
              languageStats[langCode] = { courses: 0, learners: 0 }
            }
            languageStats[langCode].courses += 1
            languageStats[langCode].learners += course.studentsCount || 0
          })

          // Create language objects with icons
          const languageIcons: {[key: string]: string} = {
            'Japanese': '🇯🇵',
            'Korean': '🇰🇷',
            'English': '🇺🇸'
          }

          const dynamicLanguages = Array.from(languageSet).map(lang => ({
            code: lang,  // Use the original case to match database
            label: lang,
            icon: languageIcons[lang] || '🌍'
          }))

          setLanguages(dynamicLanguages)
          setLanguageStats(languageStats)
          console.log('Calculated language stats:', languageStats)
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [selectedLanguage, searchQuery])

  return (
    <section className="py-12 md:py-12 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Featured Courses */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              <span className="text-accent">Featured</span> Courses
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Start your language learning journey with our most popular courses
            </p>
          </div>

          {/* Search and Language Selection */}
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-input border-border text-foreground placeholder:text-muted-foreground text-base"
                />
              </div>
            </div>

            {/* Language Selection */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={() => setSelectedLanguage("all")}
                variant={selectedLanguage === "all" ? "default" : "outline"}
                className={selectedLanguage === "all" ? "bg-accent text-accent-foreground" : ""}
              >
                🌍 All Languages
              </Button>
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  variant={selectedLanguage === lang.code ? "default" : "outline"}
                  className={selectedLanguage === lang.code ? "bg-accent text-accent-foreground" : ""}
                >
                  {lang.icon} {lang.label}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : courses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="border-border hover:shadow-lg transition-shadow group cursor-pointer overflow-hidden">
                  <div className="aspect-video bg-muted overflow-hidden relative">
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full bg-center bg-cover object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="text-xs">
                        {course.level}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{course.lessonsCount} lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{course.studentsCount} students</span>
                        </div>
                      </div>
                      {course.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{course.duration}h</span>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => handleStartLearning(course)}
                    >
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
