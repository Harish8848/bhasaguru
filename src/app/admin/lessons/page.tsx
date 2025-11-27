"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit2, Trash2, Eye, Search, FileText, ImageIcon, Video } from "lucide-react"
import { useState } from "react"

const lessons = [
  {
    id: 1,
    title: "Hiragana Introduction",
    course: "Japanese N5 Fundamentals",
    type: "video",
    duration: "12:45",
    fileSize: "245 MB",
    status: "Published",
    students: 342,
  },
  {
    id: 2,
    title: "Katakana Writing Guide",
    course: "Japanese N5 Fundamentals",
    type: "pdf",
    duration: "-",
    fileSize: "5.2 MB",
    status: "Published",
    students: 298,
  },
  {
    id: 3,
    title: "Korean Alphabet Basics",
    course: "Korean Topic I",
    type: "photo",
    duration: "-",
    fileSize: "8.4 MB",
    status: "Published",
    students: 256,
  },
  {
    id: 4,
    title: "IELTS Listening Techniques",
    course: "English IELTS Preparation",
    type: "video",
    duration: "18:30",
    fileSize: "312 MB",
    status: "Draft",
    students: 189,
  },
  {
    id: 5,
    title: "Grammar Rules Summary",
    course: "Japanese N4 Grammar",
    type: "pdf",
    duration: "-",
    fileSize: "3.8 MB",
    status: "Published",
    students: 145,
  },
  {
    id: 6,
    title: "Verb Conjugation Examples",
    course: "Korean Topic II",
    type: "photo",
    duration: "-",
    fileSize: "12.1 MB",
    status: "Published",
    students: 167,
  },
  {
    id: 7,
    title: "Reading Comprehension Video",
    course: "English IELTS Preparation",
    type: "video",
    duration: "25:15",
    fileSize: "428 MB",
    status: "Published",
    students: 203,
  },
]

const typeConfig = {
  video: { icon: Video, label: "Video", color: "bg-blue-500/20 text-blue-400" },
  pdf: { icon: FileText, label: "PDF", color: "bg-purple-500/20 text-purple-400" },
  photo: { icon: ImageIcon, label: "Photo", color: "bg-orange-500/20 text-orange-400" },
}

export default function LessonsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || lesson.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lessons Management</h1>
          <p className="text-muted-foreground mt-1">Manage photos, videos, and PDF lessons</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus size={18} className="mr-2" />
          Create Lesson
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {["all", "video", "pdf", "photo"].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
              className={
                filterType === type
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }
            >
              {type === "all" ? "All Types" : typeConfig[type as keyof typeof typeConfig].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Lessons Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-foreground font-semibold">Title</th>
                <th className="text-left p-4 text-foreground font-semibold">Course</th>
                <th className="text-left p-4 text-foreground font-semibold">Type</th>
                <th className="text-left p-4 text-foreground font-semibold">Duration / Size</th>
                <th className="text-left p-4 text-foreground font-semibold">Students</th>
                <th className="text-left p-4 text-foreground font-semibold">Status</th>
                <th className="text-left p-4 text-foreground font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson) => {
                const type = typeConfig[lesson.type as keyof typeof typeConfig]
                const TypeIcon = type.icon
                return (
                  <tr key={lesson.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-foreground font-medium">{lesson.title}</td>
                    <td className="p-4 text-foreground text-sm">{lesson.course}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${type.color}`}
                      >
                        <TypeIcon size={14} />
                        {type.label}
                      </span>
                    </td>
                    <td className="p-4 text-foreground text-sm">
                      <div className="space-y-1">
                        <div>{lesson.duration !== "-" ? lesson.duration : lesson.fileSize}</div>
                        <div className="text-muted-foreground text-xs">{lesson.fileSize}</div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">{lesson.students.toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          lesson.status === "Published"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {lesson.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Preview"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/80"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Results summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredLessons.length} of {lessons.length} lessons
      </div>
    </div>
  )
}
