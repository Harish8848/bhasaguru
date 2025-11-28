"use client"
import { BookOpen, Users, Globe, Clock, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { languages, levels } from "@/lib/data"
import { useState, useEffect } from "react"

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
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [languageStats, setLanguageStats] = useState<{[key: string]: {courses: number, learners: number}}>({})

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses')
        const result = await response.json()

        if (result.courses) {
          console.log('Fetched courses:', result.courses)
          setCourses(result.courses.slice(0, 6)) // Limit to 6 for featured section

          // Calculate language statistics
          const stats: {[key: string]: {courses: number, learners: number}} = {}
          result.courses.forEach((course: Course) => {
            // Map database language values to lib/data codes
            const languageMap: {[key: string]: string} = {
              'Japanese': 'japanese',
              'Korean': 'korean',
              'English': 'english'
            }
            const lang = languageMap[course.language] || course.language.toLowerCase()
            console.log(`Course: ${course.title}, Language: ${course.language}, Mapped to: ${lang}`)
            if (!stats[lang]) {
              stats[lang] = { courses: 0, learners: 0 }
            }
            stats[lang].courses += 1
            stats[lang].learners += course.studentsCount || 0
          })
          console.log('Calculated language stats:', stats)
          setLanguageStats(stats)
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return (
    <section className="py-20 md:py-32 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Languages Offered */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              <span className="text-accent">Master</span> Global Languages
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Choose from Japanese, Korean, English, and more. Each with expert-curated curriculum
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {languages.map((lang) => {
              const stats = languageStats[lang.code] || { courses: lang.courses, learners: lang.learners }
              return (
                <Card key={lang.code} className="hover:shadow-lg transition-shadow border-border group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{lang.icon}</span>
                      <Globe className="w-5 h-5 text-accent/60 group-hover:text-accent transition-colors" />
                    </div>
                    <CardTitle className="text-2xl">{lang.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-accent" />
                        <span>{stats.courses} Courses Available</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-accent" />
                        <span>{stats.learners.toLocaleString()} Active Learners</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        Beginner
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Advanced
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Language Levels - CEFR Framework */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Learn at <span className="text-accent">Your Level</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              CEFR framework ensures structured progression from A1 to C2 proficiency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels.map((item, index) => (
              <Card key={item.level} className="border-border hover:border-accent/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-accent">{item.label}</span>
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="font-semibold text-base">{item.description}</h3>
                    <div className="flex gap-1 pt-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${i < index + 1 ? "bg-accent" : "bg-border"}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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

                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
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
