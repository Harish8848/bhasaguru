"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Mic, FileText } from "lucide-react"

interface QuestionTypePreviewProps {
  questionType: string
  questionText: string
  options?: string[]
  cueCardContent?: string
  followUpQuestions?: string[]
}

export default function QuestionTypePreview({
  questionType,
  questionText,
  options,
  cueCardContent,
  followUpQuestions
}: QuestionTypePreviewProps) {
  const renderQuestionContent = () => {
    switch (questionType) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-4">
            <p className="text-lg">{questionText}</p>
            <div className="grid gap-2">
              {options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                  <span className="font-medium w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 'TRUE_FALSE':
        return (
          <div className="space-y-4">
            <p className="text-lg">{questionText}</p>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">True</Button>
              <Button variant="outline" className="flex-1">False</Button>
            </div>
          </div>
        )

      case 'FILL_BLANK':
        return (
          <div className="space-y-4">
            <p className="text-lg">{questionText}</p>
            <div className="flex items-center gap-2">
              <span>Answer:</span>
              <input
                type="text"
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="Type your answer here..."
              />
            </div>
          </div>
        )

      case 'AUDIO_QUESTION':
        return (
          <div className="space-y-4">
            <p className="text-lg">{questionText}</p>
            <div className="flex items-center gap-4 p-4 bg-accent rounded-lg">
              <Button size="sm">
                <Play className="w-4 h-4 mr-2" />
                Play Audio
              </Button>
              <span className="text-sm text-muted-foreground">Listen to the question</span>
            </div>
          </div>
        )

      case 'SPEAKING_PART1':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Part 1</Badge>
              <span className="text-sm text-muted-foreground">Introduction & Interview</span>
            </div>
            <p className="text-lg">{questionText}</p>
            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
              <div className="text-sm">
                <p className="font-medium">Preparation: 0 seconds</p>
                <p className="text-muted-foreground">Speaking time: 60 seconds</p>
              </div>
            </div>
          </div>
        )

      case 'SPEAKING_PART2':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Part 2</Badge>
              <span className="text-sm text-muted-foreground">Individual Long Turn</span>
            </div>
            <p className="text-lg">{questionText}</p>

            {cueCardContent && (
              <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Cue Card
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{cueCardContent}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Mic className="w-4 h-4 mr-2" />
                Start Speaking
              </Button>
              <div className="text-sm">
                <p className="font-medium">Preparation: 60 seconds</p>
                <p className="text-muted-foreground">Speaking time: 120 seconds</p>
              </div>
            </div>
          </div>
        )

      case 'SPEAKING_PART3':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Part 3</Badge>
              <span className="text-sm text-muted-foreground">Two-way Discussion</span>
            </div>
            <p className="text-lg">{questionText}</p>

            {followUpQuestions && followUpQuestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Follow-up Questions:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {followUpQuestions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Mic className="w-4 h-4 mr-2" />
                Start Discussion
              </Button>
              <div className="text-sm">
                <p className="font-medium">Preparation: 30 seconds</p>
                <p className="text-muted-foreground">Discussion time: 180 seconds</p>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <p className="text-lg">{questionText}</p>
            <p className="text-muted-foreground">Question type: {questionType}</p>
          </div>
        )
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Question Preview</CardTitle>
          <Badge variant="outline">{questionType.replace('_', ' ')}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {renderQuestionContent()}
      </CardContent>
    </Card>
  )
}
