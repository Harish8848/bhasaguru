"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Play,
  Clock,
  Users,
  Search,
  Filter,
  BookOpen,
  GraduationCap,
  Target,
  Loader2
} from "lucide-react"

interface MockTest {
  id: string
  title: string
  description?: string
  language?: string
  module?: string
  section?: string
  standardSection?: string
  type: string
  duration: number
  questionsCount: number
  passingScore: number
  _count: {
    attempts: number
  }
}

const categories = [
  { id: "all", name: "All Tests", icon: BookOpen },
  { id: "Japanese", name: "Japanese (JLPT)", icon: Target },
  { id: "Korean", name: "Korean (TOPIK)", icon: GraduationCap },
  { id: "IELTS", name: "IELTS", icon: BookOpen },
  { id: "PTE", name: "PTE", icon: Target },
]

const japaneseLevels = ["N5", "N4", "N3", "N2", "N1"]
const koreanLevels = ["TOPIK1", "TOPIK2", "TOPIK3-6"]
const ieltsLevels = ["Academic", "General"]
const pteLevels = ["Core", "Academic"]

export default function MockTestsPage() {
  const router = useRouter()
  const [tests, setTests] = useState<MockTest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/mock-tests?page=1&limit=100')
      if (response.ok) {
        const data = await response.json()
        setTests(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelsForCategory = (category: string) => {
    switch (category) {
      case "Japanese":
        return japaneseLevels
      case "Korean":
        return koreanLevels
      case "IELTS":
        return ieltsLevels
      case "PTE":
        return pteLevels
      default:
        return []
    }
  }

  const filteredTests = tests.filter(test => {
    // Category filter
    if (selectedCategory !== "all" && test.language !== selectedCategory) {
      return false
    }

    // Level filter
    if (selectedLevel && selectedLevel !== "all" && !test.title.toLowerCase().includes(selectedLevel.toLowerCase()) &&
        !test.module?.toLowerCase().includes(selectedLevel.toLowerCase())) {
      return false
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return test.title.toLowerCase().includes(searchLower) ||
             test.description?.toLowerCase().includes(searchLower) ||
             test.module?.toLowerCase().includes(searchLower)
    }

    return true
  })

  const handleStartTest = (testId: string) => {
    router.push(`/mock-tests/start/${testId}`)
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.icon || BookOpen
  }

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="py-5 md:py-5 bg-linear-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="text-primary">Mock Tests</span> for Language Proficiency
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Practice with our comprehensive mock tests designed for Japanese (JLPT), Korean (TOPIK),
              IELTS, and PTE examinations. Build confidence and track your progress.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setSelectedLevel("")
                    }}
                    className="flex items-center gap-2"
                  >
                    <Icon size={16} />
                    {category.name}
                  </Button>
                )
              })}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Level Filter */}
              {selectedCategory !== "all" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Level</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All levels</SelectItem>
                      {getLevelsForCategory(selectedCategory).map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Search */}
              <div className="space-y-2 flex-1 lg:flex-initial">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full lg:w-64"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tests Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredTests.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No Tests Found</h3>
              <p className="text-muted-foreground">
                {tests.length === 0
                  ? "No mock tests are available at the moment."
                  : "Try adjusting your filters to find more tests."
                }
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedCategory === "all" ? "All Tests" : categories.find(c => c.id === selectedCategory)?.name}
                  <span className="text-muted-foreground font-normal ml-2">
                    ({filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''})
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => {
                  const CategoryIcon = getCategoryIcon(test.language || "all")

                  return (
                    <Card key={test.id} className="bg-card border-border hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <CardTitle className="text-lg text-foreground line-clamp-2">
                              {test.title}
                            </CardTitle>
                            {test.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {test.description}
                              </p>
                            )}
                          </div>
                          <CategoryIcon className="h-6 w-6 text-primary shrink-0 ml-2" />
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {test.language && (
                            <Badge variant="secondary" className="text-xs">
                              {test.language}
                            </Badge>
                          )}
                          {test.module && (
                            <Badge variant="outline" className="text-xs">
                              {test.module}
                            </Badge>
                          )}
                          {test.standardSection && (
                            <Badge variant="outline" className="text-xs">
                              {test.standardSection}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Test Stats */}
                        <div className="grid grid-cols-3 gap-4 py-3 border-t border-border">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                              <Clock size={14} />
                              <span className="text-xs">Duration</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{test.duration}m</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                              <Target size={14} />
                              <span className="text-xs">Questions</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{test.questionsCount}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                              <Users size={14} />
                              <span className="text-xs">Attempts</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{test._count.attempts}</p>
                          </div>
                        </div>

                        {/* Start Button */}
                        <Button
                          onClick={() => handleStartTest(test.id)}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          size="lg"
                        >
                          <Play size={16} className="mr-2" />
                          Start Test
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
