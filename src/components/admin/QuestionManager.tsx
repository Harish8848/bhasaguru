"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Pause,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Volume2,
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react"
import { toast } from "sonner"

interface Question {
  id: string
  type: string
  questionText: string
  audioUrl?: string
  imageUrl?: string
  options?: any
  correctAnswer?: string
  points: number
  order: number
  explanation?: string
  language?: string
  module?: string
  section?: string
  standardSection?: string
  difficulty?: string
}

interface MockTest {
  id: string
  title: string
  language?: string
  module?: string
  section?: string
  standardSection?: string
}

const difficultyOptions = [
  "N5", "N4", "N3", "N2", "N1",
  "TOPIK1", "TOPIK2", "TOPIK3-6",
  "IELTS Academic", "IELTS General",
  "PTE Core", "PTE Academic"
]

export default function QuestionManager() {
  const [tests, setTests] = useState<MockTest[]>([])
  const [selectedTestId, setSelectedTestId] = useState<string>("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("")
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map())

  // Fetch tests on component mount
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch('/api/admin/mock-tests?page=1&limit=100')
        if (response.ok) {
          const data = await response.json()
          setTests(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch tests:', error)
        toast.error('Failed to load tests')
      }
    }
    fetchTests()
  }, [])

  // Fetch questions when test is selected
  useEffect(() => {
    if (selectedTestId) {
      fetchQuestions(selectedTestId)
    } else {
      setQuestions([])
    }
  }, [selectedTestId])

  const fetchQuestions = async (testId: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ testId })
      const response = await fetch(`/api/admin/mock-test/questions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.data || [])
      } else {
        toast.error('Failed to load questions')
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const playAudio = async (questionId: string, audioUrl: string) => {
    try {
      // Stop any currently playing audio
      if (playingAudio) {
        const currentAudio = audioElements.get(playingAudio)
        if (currentAudio) {
          currentAudio.pause()
          currentAudio.currentTime = 0
        }
        setPlayingAudio(null)
      }

      // Create or get audio element
      let audio = audioElements.get(questionId)
      if (!audio) {
        audio = new Audio(audioUrl)
        audio.addEventListener('ended', () => {
          setPlayingAudio(null)
        })
        audio.addEventListener('error', () => {
          toast.error('Failed to play audio')
          setPlayingAudio(null)
        })
        setAudioElements(prev => new Map(prev.set(questionId, audio!)))
      }

      await audio.play()
      setPlayingAudio(questionId)
    } catch (error) {
      console.error('Audio playback error:', error)
      toast.error('Failed to play audio')
    }
  }

  const stopAudio = (questionId: string) => {
    const audio = audioElements.get(questionId)
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setPlayingAudio(null)
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/mock-test/questions?id=${questionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Question deleted successfully')
        if (selectedTestId) {
          fetchQuestions(selectedTestId)
        }
      } else {
        toast.error('Failed to delete question')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete question')
    }
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = !searchTerm ||
      question.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.explanation?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDifficulty = !difficultyFilter || difficultyFilter === "all" || question.difficulty === difficultyFilter

    return matchesSearch && matchesDifficulty
  })

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'TRUE_FALSE':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FILL_BLANK':
        return <FileText className="h-4 w-4 text-purple-500" />
      case 'MATCHING':
        return <CheckCircle className="h-4 w-4 text-orange-500" />
      case 'AUDIO_QUESTION':
        return <Volume2 className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Question Manager</h2>
        <p className="text-muted-foreground mt-1">Manage questions for mock tests</p>
      </div>

      {/* Controls */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Select Test</Label>
              <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Choose a test" />
                </SelectTrigger>
                <SelectContent>
                  {tests.map((test) => (
                    <SelectItem key={test.id} value={test.id}>
                      {test.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Filter by Difficulty</Label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="All difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All difficulties</SelectItem>
                  {difficultyOptions.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-foreground">Search Questions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search by question text or explanation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {!selectedTestId ? (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Select a Test</h3>
              <p className="text-muted-foreground">Choose a mock test from the dropdown above to manage its questions.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">
                  Questions ({filteredQuestions.length})
                </h3>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Add Question
                </Button>
              </div>

              {filteredQuestions.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No Questions Found</h3>
                      <p className="text-muted-foreground">
                        {questions.length === 0
                          ? "This test doesn't have any questions yet."
                          : "No questions match your current filters."
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map((question) => (
                    <Card key={question.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            {/* Question Header */}
                            <div className="flex items-center gap-3">
                              {getQuestionTypeIcon(question.type)}
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {question.type.replace('_', ' ')}
                                </Badge>
                                {question.difficulty && (
                                  <Badge variant="secondary" className="text-xs">
                                    {question.difficulty}
                                  </Badge>
                                )}
                                <span className="text-sm text-muted-foreground">
                                  {question.points} point{question.points !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>

                            {/* Question Text */}
                            <div>
                              <p className="text-foreground font-medium">{question.questionText}</p>
                              {question.explanation && (
                                <p className="text-sm text-muted-foreground mt-1">{question.explanation}</p>
                              )}
                            </div>

                            {/* Audio Player */}
                            {question.audioUrl && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => playingAudio === question.id
                                    ? stopAudio(question.id)
                                    : playAudio(question.id, question.audioUrl!)
                                  }
                                  className="bg-transparent border-border text-foreground hover:bg-secondary"
                                >
                                  {playingAudio === question.id ? (
                                    <Pause size={16} className="mr-1" />
                                  ) : (
                                    <Play size={16} className="mr-1" />
                                  )}
                                  {playingAudio === question.id ? 'Stop' : 'Play Audio'}
                                </Button>
                                <span className="text-xs text-muted-foreground">Audio available</span>
                              </div>
                            )}

                            {/* Metadata */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Order: {question.order}</span>
                              {question.language && <span>Language: {question.language}</span>}
                              {question.module && <span>Module: {question.module}</span>}
                              {question.section && <span>Section: {question.section}</span>}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-border text-foreground hover:bg-secondary"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="bg-transparent border-border text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
