"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Mic, 
  Target, 
  BookOpen, 
  Ear,
  PenTool,
  HelpCircle,
  Type,
  Volume2
} from "lucide-react"
import { toast } from "sonner"
import { QuestionType, Question, SpeakingQuestion, QuestionOption } from "@/lib/types/test"
import { 
  AnswerPayload, 
  MultipleChoiceAnswer, 
  TrueFalseAnswer, 
  FillBlankAnswer,
  MatchingAnswer,
  AudioQuestionAnswer,
  WritingAnswer,
  SpeakingAnswer,
  ReadingComprehensionAnswer,
  ListeningComprehensionAnswer
} from "@/lib/types/evaluation"
import AudioRecorder from "@/components/speaking/AudioRecorder"

interface UnifiedAnswerFormProps {
  question: Question | SpeakingQuestion
  questionIndex: number
  totalQuestions: number
  onAnswerChange: (answer: AnswerPayload) => void
  onTimeUpdate: (timeSpent: number) => void
  disabled?: boolean
  showValidation?: boolean
  initialAnswer?: AnswerPayload | null
}

interface AnswerState {
  isRecording?: boolean
  recordingDuration?: number
  currentAudio?: string | null
  isPlaying?: boolean
  textInput?: string
  selectedOptions?: string[]
  matchingPairs?: { [leftItemId: string]: string }
  subAnswers?: { [questionId: string]: any }
  audioBlob?: Blob
  duration?: number
}

// Helper interface for Matching Question structure
interface MatchingQuestion extends Question {
  rows?: { id: string; text: string }[] // Left side items
}

// Helper interface for Comprehension Question structure
interface ComprehensionQuestion extends Question {
  passage?: string
  questions?: Question[]
}

export default function UnifiedAnswerForm({
  question,
  questionIndex,
  totalQuestions,
  onAnswerChange,
  onTimeUpdate,
  disabled = false,
  showValidation = false,
  initialAnswer = null
}: UnifiedAnswerFormProps) {
  const [answerState, setAnswerState] = useState<AnswerState>({})
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState(Date.now())

  // Track time spent
  useEffect(() => {
    if (disabled) return

    const interval = setInterval(() => {
      const spent = Math.floor((Date.now() - startTime) / 1000)
      setTimeSpent(spent)
      onTimeUpdate(spent)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, onTimeUpdate, disabled])

  // Initialize from existing answer
  useEffect(() => {
    if (initialAnswer && initialAnswer.questionId === question.id) {
      // Basic initialization logic
      if ('userAnswer' in initialAnswer) {
        const ua = initialAnswer.userAnswer as any
        
        // Handle specific types
        if (question.type === QuestionType.MULTIPLE_CHOICE && ua.selectedOption) {
          setAnswerState(prev => ({ ...prev, selectedOptions: [ua.selectedOption] }))
        } else if (question.type === QuestionType.TRUE_FALSE && ua.value !== undefined) {
          setAnswerState(prev => ({ ...prev, textInput: ua.value ? 'true' : 'false' }))
        } else if (question.type === QuestionType.FILL_BLANK && ua.answers) {
          setAnswerState(prev => ({ ...prev, textInput: Object.values(ua.answers).join(', ') }))
        } else if (question.type === QuestionType.MATCHING && ua.matches) {
          setAnswerState(prev => ({ ...prev, matchingPairs: ua.matches }))
        } else if ((question.type === QuestionType.READING_COMPREHENSION || question.type === QuestionType.LISTENING_COMPREHENSION) && ua.answers) {
          setAnswerState(prev => ({ ...prev, subAnswers: ua.answers }))
        } else if (ua.textAnswer) {
          setAnswerState(prev => ({ ...prev, textInput: ua.textAnswer }))
        } else if (ua.content) {
          setAnswerState(prev => ({ ...prev, textInput: ua.content }))
        } else if (ua.audioUrl) {
          setAnswerState(prev => ({ ...prev, currentAudio: ua.audioUrl, duration: ua.duration }))
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  const createAnswerPayload = useCallback((): AnswerPayload => {
    const baseData = {
      questionId: question.id,
      questionType: question.type,
      timeSpent,
      timestamp: new Date(),
      isPartial: false,
      metadata: {
        questionIndex,
        totalQuestions,
        uiInteraction: true
      }
    }

    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return {
          ...baseData,
          questionType: QuestionType.MULTIPLE_CHOICE,
          userAnswer: {
            selectedOption: answerState.selectedOptions?.[0] || '',
            isOptionIds: answerState.selectedOptions
          }
        } as MultipleChoiceAnswer

      case QuestionType.TRUE_FALSE:
        const trueFalseValue = answerState.textInput?.toLowerCase().trim()
        return {
          ...baseData,
          questionType: QuestionType.TRUE_FALSE,
          userAnswer: {
            value: trueFalseValue === 'true' || trueFalseValue === '1' || trueFalseValue === 'yes'
          }
        } as TrueFalseAnswer

      case QuestionType.FILL_BLANK:
        const fillBlankAnswers = answerState.textInput?.split(',').map(s => s.trim()) || []
        return {
          ...baseData,
          questionType: QuestionType.FILL_BLANK,
          userAnswer: {
            answers: fillBlankAnswers.reduce((acc, answer, index) => {
              acc[index] = answer
              return acc
            }, {} as { [blankIndex: number]: string }),
            fullText: answerState.textInput || '',
            synonyms: true
          }
        } as FillBlankAnswer

      case QuestionType.MATCHING:
        return {
          ...baseData,
          questionType: QuestionType.MATCHING,
          userAnswer: {
            matches: answerState.matchingPairs || {},
            partialCredit: true
          }
        } as MatchingAnswer

      case QuestionType.AUDIO_QUESTION:
        return {
          ...baseData,
          questionType: QuestionType.AUDIO_QUESTION,
          userAnswer: {
            selectedOption: answerState.selectedOptions?.[0],
            textAnswer: answerState.textInput,
            audioResponse: answerState.audioBlob ? {
              audioUrl: URL.createObjectURL(answerState.audioBlob),
              duration: answerState.duration || 0
            } : undefined
          }
        } as AudioQuestionAnswer

      case QuestionType.WRITING:
        return {
          ...baseData,
          questionType: QuestionType.WRITING,
          userAnswer: {
            essayType: 'task2',
            wordCount: answerState.textInput?.split(/\s+/).length || 0,
            content: answerState.textInput || '',
            planningNotes: ''
          }
        } as WritingAnswer

      case QuestionType.SPEAKING_PART1:
      case QuestionType.SPEAKING_PART2:
      case QuestionType.SPEAKING_PART3:
        return {
          ...baseData,
          questionType: question.type,
          userAnswer: {
            audioUrl: answerState.currentAudio || '',
            duration: answerState.duration || 0
          }
        } as SpeakingAnswer

      case QuestionType.READING_COMPREHENSION:
        return {
          ...baseData,
          questionType: QuestionType.READING_COMPREHENSION,
          userAnswer: {
            passageId: question.id,
            answers: answerState.subAnswers || {},
            timeOnPassage: timeSpent
          }
        } as ReadingComprehensionAnswer

      case QuestionType.LISTENING_COMPREHENSION:
        return {
          ...baseData,
          questionType: QuestionType.LISTENING_COMPREHENSION,
          userAnswer: {
            audioId: question.id,
            answers: answerState.subAnswers || {},
            timeOnAudio: timeSpent
          }
        } as ListeningComprehensionAnswer

      default:
        return {
          ...baseData,
          questionType: question.type,
          userAnswer: {
            textAnswer: answerState.textInput || ''
          }
        } as any
    }
  }, [question, answerState, timeSpent, questionIndex, totalQuestions])

  // Notify parent when answer changes
  useEffect(() => {
    const payload = createAnswerPayload()
    onAnswerChange(payload)
  }, [answerState, timeSpent, createAnswerPayload, onAnswerChange])

  const handleOptionSelect = (optionId: string, isMultiSelect = false) => {
    if (disabled) return
    setAnswerState(prev => ({
      ...prev,
      selectedOptions: isMultiSelect 
        ? [...(prev.selectedOptions || []), optionId]
        : [optionId]
    }))
  }

  const handleTextChange = (value: string) => {
    if (disabled) return
    setAnswerState(prev => ({ ...prev, textInput: value }))
  }

  const handleMatchingChange = (leftItemId: string, rightItemId: string) => {
    if (disabled) return
    setAnswerState(prev => ({
      ...prev,
      matchingPairs: {
        ...prev.matchingPairs,
        [leftItemId]: rightItemId
      }
    }))
  }

  const handleSubAnswerChange = (questionId: string, value: any) => {
    if (disabled) return
    setAnswerState(prev => ({
      ...prev,
      subAnswers: {
        ...prev.subAnswers,
        [questionId]: value
      }
    }))
  }

  const handleRecordingComplete = (audioBlob: Blob) => {
    if (disabled) return
    const audioUrl = URL.createObjectURL(audioBlob)
    
    // Calculate rough duration if not provided
    const duration = answerState.recordingDuration || 0
    
    setAnswerState(prev => ({
      ...prev,
      audioBlob,
      currentAudio: audioUrl,
      duration: duration
    }))
    
    toast.success("Recording saved successfully")
  }

  const playAudio = (audioUrl: string) => {
    if (disabled) return
    try {
      const audio = new Audio(audioUrl)
      audio.addEventListener('ended', () => {
        setAnswerState(prev => ({ ...prev, isPlaying: false }))
      })
      audio.play()
      setAnswerState(prev => ({ ...prev, isPlaying: true }))
    } catch (error) {
      toast.error("Failed to play audio")
    }
  }

  // --- Render Functions ---

  const renderMatchingInput = () => {
    const matchingQ = question as MatchingQuestion
    // Fallback: If no rows defined, try to use question text or generic placeholders
    const rows = matchingQ.rows || [
      { id: 'row1', text: 'Item 1' },
      { id: 'row2', text: 'Item 2' },
      { id: 'row3', text: 'Item 3' }
    ]
    const options = matchingQ.options || []

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="font-semibold text-muted-foreground">Items</div>
          <div className="font-semibold text-muted-foreground">Matches</div>
          
          {rows.map((row) => (
            <div key={row.id} className="contents">
              <div className="flex items-center p-3 bg-muted/50 rounded-md">
                {row.text}
              </div>
              <div className="flex items-center">
                <Select
                  value={answerState.matchingPairs?.[row.id] || ""}
                  onValueChange={(value) => handleMatchingChange(row.id, value)}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a match..." />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderComprehensionInput = (isListening: boolean) => {
    const compQ = question as ComprehensionQuestion
    const subQuestions = compQ.questions || []

    return (
      <div className="space-y-6">
        {/* Content Section */}
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          {isListening ? (
            <div className="flex flex-col items-center space-y-4">
               <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                 <Ear className="h-8 w-8 text-primary" />
               </div>
               <h3 className="font-medium">Audio Passage</h3>
               {compQ.audioUrl && (
                  <Button
                    variant="outline"
                    onClick={() => playAudio(compQ.audioUrl!)}
                    disabled={disabled || answerState.isPlaying}
                  >
                    {answerState.isPlaying ? (
                      <>
                        <Pause size={16} className="mr-2" />
                        Playing...
                      </>
                    ) : (
                      <>
                        <Play size={16} className="mr-2" />
                        Play Passage
                      </>
                    )}
                  </Button>
               )}
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
                <BookOpen className="h-5 w-5" />
                Reading Passage
              </h3>
              <div className="whitespace-pre-wrap">{compQ.passage || compQ.questionText}</div>
            </div>
          )}
        </div>

        {/* Questions Section */}
        <div className="space-y-8">
          {subQuestions.map((subQ, idx) => (
            <div key={subQ.id} className="border-t pt-6 first:border-0 first:pt-0">
              <div className="mb-2 font-medium">
                Q{idx + 1}. {subQ.questionText}
              </div>
              
              {/* Simplified rendering for sub-questions */}
              {subQ.type === QuestionType.MULTIPLE_CHOICE && (
                <RadioGroup
                  value={answerState.subAnswers?.[subQ.id]?.selectedOption || ""}
                  onValueChange={(val) => handleSubAnswerChange(subQ.id, { selectedOption: val })}
                  disabled={disabled}
                >
                  {subQ.options?.map((opt) => (
                    <div key={opt.id} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={opt.id} id={`${subQ.id}-${opt.id}`} />
                      <Label htmlFor={`${subQ.id}-${opt.id}`}>{opt.text}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {subQ.type === QuestionType.TRUE_FALSE && (
                 <div className="flex gap-4">
                   <Button
                     variant={answerState.subAnswers?.[subQ.id]?.value === true ? "default" : "outline"}
                     onClick={() => handleSubAnswerChange(subQ.id, { value: true })}
                     disabled={disabled}
                     size="sm"
                   >
                     True
                   </Button>
                   <Button
                     variant={answerState.subAnswers?.[subQ.id]?.value === false ? "default" : "outline"}
                     onClick={() => handleSubAnswerChange(subQ.id, { value: false })}
                     disabled={disabled}
                     size="sm"
                   >
                     False
                   </Button>
                 </div>
              )}

              {subQ.type === QuestionType.FILL_BLANK && (
                <Input
                  value={answerState.subAnswers?.[subQ.id]?.textAnswer || ""}
                  onChange={(e) => handleSubAnswerChange(subQ.id, { textAnswer: e.target.value })}
                  placeholder="Type your answer..."
                  disabled={disabled}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderAnswerInput = () => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        const optionsData = (question as Question).options;
        const multipleChoiceOptions = Array.isArray(optionsData) ? optionsData : [];
        return (
          <RadioGroup
            value={answerState.selectedOptions?.[0] || ""}
            onValueChange={(value) => handleOptionSelect(value)}
            disabled={disabled}
          >
            {multipleChoiceOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label
                  htmlFor={option.id}
                  className="text-foreground cursor-pointer flex-1 leading-relaxed"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case QuestionType.TRUE_FALSE:
        return (
          <div className="space-y-2">
            <Label htmlFor="true-false-answer" className="text-foreground">
              Your Answer
            </Label>
            <div className="flex gap-4">
               <Button
                 variant={answerState.textInput?.toLowerCase() === 'true' ? "default" : "outline"}
                 onClick={() => handleTextChange('true')}
                 disabled={disabled}
                 className="w-24"
               >
                 True
               </Button>
               <Button
                 variant={answerState.textInput?.toLowerCase() === 'false' ? "default" : "outline"}
                 onClick={() => handleTextChange('false')}
                 disabled={disabled}
                 className="w-24"
               >
                 False
               </Button>
            </div>
          </div>
        )

      case QuestionType.FILL_BLANK:
        return (
          <div className="space-y-2">
            <Label htmlFor="fill-blank-answer" className="text-foreground">
              Fill in the blank(s)
            </Label>
            <Textarea
              id="fill-blank-answer"
              value={answerState.textInput || ""}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter your answer(s), separated by commas if multiple blanks"
              disabled={disabled}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              rows={3}
            />
          </div>
        )

      case QuestionType.MATCHING:
        return renderMatchingInput()

      case QuestionType.READING_COMPREHENSION:
        return renderComprehensionInput(false)

      case QuestionType.LISTENING_COMPREHENSION:
        return renderComprehensionInput(true)

      case QuestionType.AUDIO_QUESTION:
        const audioOptions = (question as Question).options || []
        return (
          <div className="space-y-4">
            {audioOptions.length > 0 && (
              <RadioGroup
                value={answerState.selectedOptions?.[0] || ""}
                onValueChange={(value) => handleOptionSelect(value)}
                disabled={disabled}
              >
                {audioOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label
                      htmlFor={option.id}
                      className="text-foreground cursor-pointer flex-1 leading-relaxed"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="audio-text-answer" className="text-foreground">
                Or type your answer
              </Label>
              <Textarea
                id="audio-text-answer"
                value={answerState.textInput || ""}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Type what you heard..."
                disabled={disabled}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                rows={3}
              />
            </div>

            {(question as Question).audioUrl && (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => playAudio((question as Question).audioUrl!)}
                  disabled={disabled || answerState.isPlaying}
                  className="bg-transparent border-border text-foreground hover:bg-secondary"
                >
                  {answerState.isPlaying ? (
                    <>
                      <Pause size={16} className="mr-2" />
                      Playing...
                    </>
                  ) : (
                    <>
                      <Play size={16} className="mr-2" />
                      Play Audio
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )

      case QuestionType.WRITING:
        return (
          <div className="space-y-2">
            <Label htmlFor="writing-answer" className="text-foreground">
              Your Essay
            </Label>
            <Textarea
              id="writing-answer"
              value={answerState.textInput || ""}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Write your essay here..."
              disabled={disabled}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-200px"
            />
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>Word count: {answerState.textInput?.split(/\s+/).filter(w => w.length > 0).length || 0}</span>
            </div>
          </div>
        )

      case QuestionType.SPEAKING_PART1:
      case QuestionType.SPEAKING_PART2:
      case QuestionType.SPEAKING_PART3:
        const speakingQ = question as SpeakingQuestion
        return (
          <div className="space-y-4">
            <div className="mb-4 text-sm text-muted-foreground bg-muted p-3 rounded">
               {speakingQ.preparationTime && (
                 <div className="font-semibold text-primary mb-1">Preparation Time: {speakingQ.preparationTime}s</div>
               )}
               {speakingQ.speakingTime && (
                 <div>Speaking Time: {speakingQ.speakingTime}s</div>
               )}
            </div>

            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              maxDuration={speakingQ.speakingTime || 120}
              disabled={disabled}
              className="w-full"
            />
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="default-answer" className="text-foreground">
              Your Answer
            </Label>
            <Textarea
              id="default-answer"
              value={answerState.textInput || ""}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter your answer"
              disabled={disabled}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              rows={3}
            />
          </div>
        )
    }
  }

  const getQuestionTypeIcon = () => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return <Target className="h-4 w-4 text-blue-500" />
      case QuestionType.TRUE_FALSE:
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case QuestionType.FILL_BLANK:
        return <Type className="h-4 w-4 text-orange-500" />
      case QuestionType.MATCHING:
        return <Target className="h-4 w-4 text-purple-500" />
      case QuestionType.AUDIO_QUESTION:
        return <Volume2 className="h-4 w-4 text-yellow-500" />
      case QuestionType.WRITING:
        return <PenTool className="h-4 w-4 text-indigo-500" />
      case QuestionType.SPEAKING_PART1:
      case QuestionType.SPEAKING_PART2:
      case QuestionType.SPEAKING_PART3:
        return <Mic className="h-4 w-4 text-red-500" />
      case QuestionType.READING_COMPREHENSION:
        return <BookOpen className="h-4 w-4 text-teal-500" />
      case QuestionType.LISTENING_COMPREHENSION:
        return <Ear className="h-4 w-4 text-cyan-500" />
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />
    }
  }

  // Import Volume2 if not imported
  // (Adding Volume2 to imports at top of file, ensuring no duplication)
  
  return (
    <div className="space-y-4">
      
      {/* Question Text */}
      {question.questionText && (
        <div className="text-lg font-medium text-foreground leading-relaxed whitespace-pre-wrap">
          {question.questionText}
        </div>
      )}
      
      {!question.questionText && (
        <div className="text-lg text-muted-foreground italic">
          No question text available
        </div>
      )}
      
      {/* Question Image if available */}
      {'imageUrl' in question && question.imageUrl && (
        <div className="my-4">
          <img 
            src={question.imageUrl} 
            alt="Question image" 
            className="max-w-full h-auto rounded-lg border border-border"
          />
        </div>
      )}
      
      {/* Audio player for questions with audio (not speaking questions) */}
      {'audioUrl' in question && question.audioUrl && 
       question.type !== QuestionType.SPEAKING_PART1 && 
       question.type !== QuestionType.SPEAKING_PART2 && 
       question.type !== QuestionType.SPEAKING_PART3 && (
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={() => playAudio(question.audioUrl!)}
            disabled={disabled || answerState.isPlaying}
          >
            {answerState.isPlaying ? (
              <>
                <Pause size={16} className="mr-2" />
                Playing...
              </>
            ) : (
              <>
                <Volume2 size={16} className="mr-2" />
                Play Audio
              </>
            )}
          </Button>
        </div>
      )}
      
      {renderAnswerInput()}
      
      {showValidation && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
          {/* Validation feedback can be added here */}
          <div className="text-muted-foreground italic">
            Answer recorded automatically.
          </div>
        </div>
      )}
    </div>
  )
}
