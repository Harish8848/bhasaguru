"use client"


import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import AudioRecorder from "./AudioRecorder"
import {
  Clock,
  Mic,
  PlayCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Volume2,
  Users,
  MessageSquare,
  FileText,
  Timer
} from "lucide-react"
import { toast } from "sonner"
import { SpeakingQuestion } from "@/lib/types/test"

interface SpeakingTestInterfaceProps {
  testId: string
  testTitle: string
  questions: SpeakingQuestion[]
  onSubmit: (responses: { [questionId: string]: { audioUrl: string; duration: number } }) => void
  onExit: () => void
  disabled?: boolean
}

interface TestState {
  currentSection: 'part1' | 'part2' | 'part3'
  currentQuestionIndex: number
  responses: { [questionId: string]: { audioUrl: string; duration: number; startedAt: number } }
  isRecording: boolean
  preparationTime: number
  speakingTime: number
  timeRemaining: number
}

export default function SpeakingTestInterface({
  testId,
  testTitle,
  questions,
  onSubmit,
  onExit,
  disabled = false
}: SpeakingTestInterfaceProps) {
  const [state, setState] = useState<TestState>({
    currentSection: 'part1',
    currentQuestionIndex: 0,
    responses: {},
    isRecording: false,
    preparationTime: 0,
    speakingTime: 0,
    timeRemaining: 0
  })

  const [currentQuestion, setCurrentQuestion] = useState<SpeakingQuestion | null>(null)

  // Get questions for each part
  const part1Questions = questions.filter(q => q.type === 'SPEAKING_PART1')
  const part2Questions = questions.filter(q => q.type === 'SPEAKING_PART2')
  const part3Questions = questions.filter(q => q.type === 'SPEAKING_PART3')

  // Set current question when section or index changes
  useEffect(() => {
    let question: SpeakingQuestion | null = null
    
    switch (state.currentSection) {
      case 'part1':
        question = part1Questions[state.currentQuestionIndex] || null
        break
      case 'part2':
        question = part2Questions[state.currentQuestionIndex] || null
        break
      case 'part3':
        question = part3Questions[state.currentQuestionIndex] || null
        break
    }
    
    setCurrentQuestion(question)
    
    if (question) {
      // Reset timing for new question
      if (question.type === 'SPEAKING_PART2' && question.preparationTime) {
        setState(prev => ({ 
          ...prev, 
          preparationTime: question!.preparationTime!,
          speakingTime: question!.speakingTime || 120,
          timeRemaining: question!.preparationTime!
        }))
      } else if (question.type === 'SPEAKING_PART3' || question.type === 'SPEAKING_PART1') {
        setState(prev => ({ 
          ...prev, 
          preparationTime: 0,
          speakingTime: question!.speakingTime || 60,
          timeRemaining: question!.speakingTime || 60
        }))
      }
    }
  }, [state.currentSection, state.currentQuestionIndex, part1Questions, part2Questions, part3Questions])

  // Timer effect
  useEffect(() => {
    if (state.timeRemaining > 0 && !state.isRecording) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }))
      }, 1000)
      
      return () => clearTimeout(timer)
    } else if (state.timeRemaining === 0) {
      if (state.currentSection === 'part2' && state.preparationTime > 0) {
        // Preparation time is over, move to speaking
        setState(prev => ({ 
          ...prev, 
          timeRemaining: prev.speakingTime,
          preparationTime: 0 
        }))
        toast.info("Preparation time is over. Please start speaking.")
      } else if (state.speakingTime > 0) {
        // Speaking time is over
        toast.warning("Time is up! Please submit your response.")
      }
    }
  }, [state.timeRemaining, state.isRecording, state.currentSection, state.preparationTime, state.speakingTime])

  const getCurrentQuestions = () => {
    switch (state.currentSection) {
      case 'part1': return part1Questions
      case 'part2': return part2Questions
      case 'part3': return part3Questions
      default: return []
    }
  }

  const getTotalQuestions = () => {
    return questions.length
  }

  const getCurrentQuestionNumber = () => {
    const currentQuestions = getCurrentQuestions()
    return currentQuestions.length > 0 ? state.currentQuestionIndex + 1 : 0
  }

  const getTotalQuestionsInCurrentSection = () => {
    return getCurrentQuestions().length
  }

  const canGoNext = () => {
    const currentQuestions = getCurrentQuestions()
    return state.currentQuestionIndex < currentQuestions.length - 1
  }

  const canGoPrevious = () => {
    return state.currentQuestionIndex > 0 || 
           (state.currentSection === 'part2' && part1Questions.length > 0) ||
           (state.currentSection === 'part3' && (part1Questions.length > 0 || part2Questions.length > 0))
  }

  const goToNextQuestion = () => {
    const currentQuestions = getCurrentQuestions()
    
    if (state.currentQuestionIndex < currentQuestions.length - 1) {
      // Next question in current section
      setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }))
    } else if (state.currentSection === 'part1' && part2Questions.length > 0) {
      // Move to Part 2
      setState(prev => ({ 
        ...prev, 
        currentSection: 'part2', 
        currentQuestionIndex: 0 
      }))
      toast.info("Moving to Part 2: Long Turn")
    } else if (state.currentSection === 'part2' && part3Questions.length > 0) {
      // Move to Part 3
      setState(prev => ({ 
        ...prev, 
        currentSection: 'part3', 
        currentQuestionIndex: 0 
      }))
      toast.info("Moving to Part 3: Discussion")
    }
  }

  const goToPreviousQuestion = () => {
    if (state.currentQuestionIndex > 0) {
      // Previous question in current section
      setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 }))
    } else if (state.currentSection === 'part3' && (part1Questions.length > 0 || part2Questions.length > 0)) {
      // Move to Part 2
      setState(prev => ({ 
        ...prev, 
        currentSection: 'part2', 
        currentQuestionIndex: part2Questions.length - 1 
      }))
    } else if (state.currentSection === 'part2' && part1Questions.length > 0) {
      // Move to Part 1
      setState(prev => ({ 
        ...prev, 
        currentSection: 'part1', 
        currentQuestionIndex: part1Questions.length - 1 
      }))
    }
  }

  const handleRecordingComplete = (questionId: string, audioBlob: Blob, duration: number) => {
    // Create blob URL for immediate playback
    const audioUrl = URL.createObjectURL(audioBlob)
    
    setState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: {
          audioUrl,
          duration,
          startedAt: Date.now()
        }
      }
    }))
    
    toast.success("Response recorded successfully!")
    

    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (canGoNext()) {
        goToNextQuestion()
      } else {
        // Check if this was the last question overall
        const totalAnswered = Object.keys(state.responses).length + 1
        if (totalAnswered >= getTotalQuestions()) {
          handleSubmitTest()
        }
      }
    }, 2000)
  }

  const handleSubmitTest = () => {
    const responses = state.responses

    // Ensure all questions have responses
    const unansweredQuestions = questions.filter(q => !responses[q.id])

    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`)
      return
    }

    // Transform responses to match API expectations (remove startedAt property)
    const apiResponses: { [questionId: string]: { audioUrl: string; duration: number } } = {}
    Object.entries(responses).forEach(([questionId, response]) => {
      apiResponses[questionId] = {
        audioUrl: response.audioUrl,
        duration: response.duration
      }
    })

    onSubmit(apiResponses)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'part1': return <MessageSquare className="h-4 w-4" />
      case 'part2': return <FileText className="h-4 w-4" />
      case 'part3': return <Users className="h-4 w-4" />
      default: return <Mic className="h-4 w-4" />
    }
  }

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'part1': return "Part 1: Introduction & Interview"
      case 'part2': return "Part 2: Long Turn (Cue Card)"
      case 'part3': return "Part 3: Discussion"
      default: return "Speaking Test"
    }
  }

  const getSectionDescription = (section: string) => {
    switch (section) {
      case 'part1': return "Personal questions about yourself, your family, work or studies, and interests"
      case 'part2': return "Speak for 1-2 minutes on a given topic after 1 minute preparation"
      case 'part3': return "Discussion of abstract ideas and issues related to the Part 2 topic"
      default: return ""
    }
  }

  if (!currentQuestion) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            No questions available for this test.
          </div>
          <Button onClick={onExit} className="mt-4">
            Exit Test
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{testTitle}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                IELTS Speaking Test • Question {Object.keys(state.responses).length + 1} of {getTotalQuestions()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {getSectionIcon(state.currentSection)}
                {getSectionTitle(state.currentSection)}
              </Badge>
              {state.timeRemaining > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {formatTime(state.timeRemaining)}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Progress */}
          <div className="mt-4">
            <Progress 
              value={(Object.keys(state.responses).length / getTotalQuestions()) * 100} 
              className="h-2"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Section Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {getSectionIcon(state.currentSection)}
            <span className="font-medium">{getSectionTitle(state.currentSection)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {getSectionDescription(state.currentSection)}
          </p>
          
          {state.currentSection === 'part2' && state.preparationTime > 0 && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Preparation Time: {formatTime(state.preparationTime)}</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Take notes during this time. You will have {formatTime(state.speakingTime)} to speak.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Question Text */}
            <div>
              <h3 className="text-lg font-medium mb-3">
                Question {getCurrentQuestionNumber()} of {getTotalQuestionsInCurrentSection()}
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-base leading-relaxed">{currentQuestion.questionText}</p>
              </div>
            </div>

            {/* Cue Card for Part 2 */}
            {currentQuestion.type === 'SPEAKING_PART2' && currentQuestion.cueCardContent && (
              <div className="p-4 border border-border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Cue Card
                </h4>
                <div className="whitespace-pre-line text-sm">{currentQuestion.cueCardContent}</div>
              </div>
            )}

            {/* Follow-up Questions for Part 3 */}
            {currentQuestion.type === 'SPEAKING_PART3' && currentQuestion.followUpQuestions && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Follow-up Questions
                </h4>
                <div className="space-y-1">
                  {currentQuestion.followUpQuestions.map((followUp, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {followUp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Recorder */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Your Response
              </h4>
              
              <AudioRecorder
                maxDuration={state.speakingTime || 120}
                disabled={disabled}
                onRecordingComplete={(audioBlob) => 
                  handleRecordingComplete(currentQuestion.id, audioBlob, state.speakingTime - state.timeRemaining)
                }
              />

              {/* Existing Response Playback */}
              {state.responses[currentQuestion.id] && (
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Response Recorded</span>
                  </div>
                  <audio 
                    src={state.responses[currentQuestion.id].audioUrl} 
                    controls 
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={!canGoPrevious()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {canGoNext() ? (
                <Button onClick={goToNextQuestion}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmitTest}
                  disabled={Object.keys(state.responses).length < getTotalQuestions()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Test
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Summary */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Progress Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Part 1</div>
              <div className="font-medium">
                {Object.keys(state.responses).filter(id => 
                  questions.find(q => q.id === id)?.type === 'SPEAKING_PART1'
                ).length} / {part1Questions.length}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Part 2</div>
              <div className="font-medium">
                {Object.keys(state.responses).filter(id => 
                  questions.find(q => q.id === id)?.type === 'SPEAKING_PART2'
                ).length} / {part2Questions.length}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Part 3</div>
              <div className="font-medium">
                {Object.keys(state.responses).filter(id => 
                  questions.find(q => q.id === id)?.type === 'SPEAKING_PART3'
                ).length} / {part3Questions.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
