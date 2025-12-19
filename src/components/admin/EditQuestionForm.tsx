"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/upload/ImageUpload"
import { FileUpload } from "@/components/upload/FileUpload"

interface Question {
  id: string
  questionText: string
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "MATCHING" | "AUDIO_QUESTION" | "SPEAKING_PART1" | "SPEAKING_PART2" | "SPEAKING_PART3"
  difficulty?: string
  order: number
  points: number
  audioUrl?: string
  imageUrl?: string
  videoUrl?: string
  options?: string[]
  correctAnswer?: string
  explanation?: string
  questionPassage?: string
  questionSubSection?: string
  language?: string
  module?: string
  section?: string
  standardSection?: string
  preparationTime?: number
  speakingTime?: number
  cueCardContent?: string
  followUpQuestions?: any
}

interface EditQuestionFormProps {
  question: Question
  testType: string
  onSuccess: () => void
  onCancel: () => void
}

export default function EditQuestionForm({ question, testType, onSuccess, onCancel }: EditQuestionFormProps) {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    questionText: question.questionText || "",
    type: question.type,
    difficulty: question.difficulty || "",
    order: question.order || 1,
    points: question.points || 1,
    audioUrl: question.audioUrl || "",
    imageUrl: question.imageUrl || "",
    videoUrl: question.videoUrl || "",
    options: question.options || ["", "", "", ""],
    correctAnswer: question.correctAnswer || "",
    explanation: question.explanation || "",
    // Test-specific fields
    questionPassage: question.questionPassage || "",
    questionSubSection: question.questionSubSection || "",
    language: question.language || "",
    module: question.module || "",
    section: question.section || "",
    standardSection: question.standardSection || "",
    // Speaking-specific fields
    preparationTime: question.preparationTime || 60,
    speakingTime: question.speakingTime || 120,
    cueCardContent: question.cueCardContent || "",
    followUpQuestions: question.followUpQuestions || [],
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.questionText.trim()) {
      alert('Question text is required')
      return
    }

    if (formData.type === 'MULTIPLE_CHOICE') {
      if (formData.options.some(opt => !opt.trim())) {
        alert('All options are required for multiple choice questions')
        return
      }
      if (!formData.correctAnswer) {
        alert('Correct answer is required')
        return
      }
    }

    setLoading(true)

    try {
      const submitData: any = {
        ...formData,
        options: formData.type === 'MULTIPLE_CHOICE' ? formData.options : undefined,
        correctAnswer: formData.type === 'MULTIPLE_CHOICE' || formData.type === 'TRUE_FALSE' ? formData.correctAnswer : undefined,
      }

      // Remove undefined and empty string fields to avoid sending them to the API
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined || submitData[key] === '') {
          delete submitData[key]
        }
      })

      const response = await fetch(`/api/admin/mock-test/questions?id=${question.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update question')
      }
    } catch (error) {
      console.error('Error updating question:', error)
      alert('Failed to update question')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({ ...prev, options: newOptions }))
  }

  const renderTestSpecificFields = () => {
    const upperTestType = testType.toUpperCase()

    switch (upperTestType) {
      case 'IELTS':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="questionPassage">Question Passage</Label>
              <Textarea
                id="questionPassage"
                value={formData.questionPassage}
                onChange={(e) => handleInputChange('questionPassage', e.target.value)}
                placeholder="Enter the passage text for this question"
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questionSubSection">Question Sub-section</Label>
              <Select
                value={formData.questionSubSection}
                onValueChange={(value) => handleInputChange('questionSubSection', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="listening_part_1">Listening Part 1</SelectItem>
                  <SelectItem value="listening_part_2">Listening Part 2</SelectItem>
                  <SelectItem value="listening_part_3">Listening Part 3</SelectItem>
                  <SelectItem value="listening_part_4">Listening Part 4</SelectItem>
                  <SelectItem value="reading_passage_1">Reading Passage 1</SelectItem>
                  <SelectItem value="reading_passage_2">Reading Passage 2</SelectItem>
                  <SelectItem value="reading_passage_3">Reading Passage 3</SelectItem>
                  <SelectItem value="writing_task_1">Writing Task 1</SelectItem>
                  <SelectItem value="writing_task_2">Writing Task 2</SelectItem>
                  <SelectItem value="speaking_part_1">Speaking Part 1</SelectItem>
                  <SelectItem value="speaking_part_2">Speaking Part 2</SelectItem>
                  <SelectItem value="speaking_part_3">Speaking Part 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case 'JLPT':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="questionSubSection">JLPT Question Type</Label>
              <Select
                value={formData.questionSubSection}
                onValueChange={(value) => handleInputChange('questionSubSection', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vocabulary">Vocabulary</SelectItem>
                  <SelectItem value="grammar">Grammar</SelectItem>
                  <SelectItem value="reading">Reading Passage</SelectItem>
                  <SelectItem value="kanji">Kanji</SelectItem>
                  <SelectItem value="listening">Listening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.questionSubSection === 'reading' && (
              <div className="space-y-2">
                <Label htmlFor="questionPassage">Reading Passage</Label>
                <Textarea
                  id="questionPassage"
                  value={formData.questionPassage}
                  onChange={(e) => handleInputChange('questionPassage', e.target.value)}
                  placeholder="Enter the reading passage text"
                  rows={6}
                />
              </div>
            )}
          </>
        )

      case 'TOPIK':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="questionSubSection">TOPIK Question Type</Label>
              <Select
                value={formData.questionSubSection}
                onValueChange={(value) => handleInputChange('questionSubSection', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="listening">Listening</SelectItem>
                  <SelectItem value="grammar_reading">Grammar/Reading</SelectItem>
                  <SelectItem value="vocabulary_fill_blank">Vocabulary Fill-in-the-blank</SelectItem>
                  <SelectItem value="reading_comprehension">Reading Comprehension</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.questionSubSection === 'listening' && (
              <div className="space-y-2">
                <Label htmlFor="audioUrl">Audio URL (for listening questions)</Label>
                <Input
                  id="audioUrl"
                  value={formData.audioUrl}
                  onChange={(e) => handleInputChange('audioUrl', e.target.value)}
                  placeholder="Enter audio URL"
                />
              </div>
            )}
          </>
        )

      case 'PTE':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="questionSubSection">PTE Question Type</Label>
              <Select
                value={formData.questionSubSection}
                onValueChange={(value) => handleInputChange('questionSubSection', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="speaking">Speaking</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="listening">Listening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Common Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Question Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleInputChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
              <SelectItem value="TRUE_FALSE">True/False</SelectItem>
              <SelectItem value="FILL_BLANK">Fill in the Blank</SelectItem>
              <SelectItem value="MATCHING">Matching</SelectItem>
              <SelectItem value="AUDIO_QUESTION">Audio Question</SelectItem>
              <SelectItem value="SPEAKING_PART1">Speaking Part 1</SelectItem>
              <SelectItem value="SPEAKING_PART2">Speaking Part 2</SelectItem>
              <SelectItem value="SPEAKING_PART3">Speaking Part 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => handleInputChange('difficulty', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order">Order Number *</Label>
          <Input
            id="order"
            type="number"
            min="1"
            value={formData.order}
            onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="points">Points *</Label>
          <Input
            id="points"
            type="number"
            min="1"
            value={formData.points}
            onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 1)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="questionText">Question Text *</Label>
        <Textarea
          id="questionText"
          value={formData.questionText}
          onChange={(e) => handleInputChange('questionText', e.target.value)}
          placeholder="Enter the question text"
          rows={3}
          required
        />
      </div>

      {/* Media Uploads */}
      <div className="space-y-4">
        <Label>Media (Optional)</Label>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image</Label>
          <ImageUpload
            onUploadComplete={(url) => handleInputChange('imageUrl', url)}
            currentImage={formData.imageUrl}
          />
        </div>

        {(formData.type === 'AUDIO_QUESTION' || testType.toUpperCase() === 'IELTS' || testType.toUpperCase() === 'TOPIK') && (
          <div className="space-y-2">
            <Label htmlFor="audioUrl">Audio File</Label>
            <FileUpload
              accept={["audio/*"]}
              onUploadComplete={(url) => handleInputChange('audioUrl', url)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="videoUrl">Video URL</Label>
          <Input
            id="videoUrl"
            value={formData.videoUrl}
            onChange={(e) => handleInputChange('videoUrl', e.target.value)}
            placeholder="Enter video URL (optional)"
          />
        </div>
      </div>

      {/* Options for Multiple Choice */}
      {formData.type === 'MULTIPLE_CHOICE' && (
        <div className="space-y-4">
          <Label>Options *</Label>
          {formData.options.map((option, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`option-${index}`}>Option {String.fromCharCode(65 + index)}</Label>
              <Input
                id={`option-${index}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                required
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label>Correct Answer *</Label>
            <RadioGroup
              value={formData.correctAnswer}
              onValueChange={(value) => handleInputChange('correctAnswer', value)}
            >
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={String.fromCharCode(65 + index)} id={`correct-${index}`} />
                  <Label htmlFor={`correct-${index}`}>{String.fromCharCode(65 + index)}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      )}

      {/* True/False Options */}
      {formData.type === 'TRUE_FALSE' && (
        <div className="space-y-2">
          <Label>Correct Answer *</Label>
          <RadioGroup
            value={formData.correctAnswer}
            onValueChange={(value) => handleInputChange('correctAnswer', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="correct-true" />
              <Label htmlFor="correct-true">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="correct-false" />
              <Label htmlFor="correct-false">False</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Speaking-specific fields */}
      {(formData.type === 'SPEAKING_PART1' || formData.type === 'SPEAKING_PART2' || formData.type === 'SPEAKING_PART3') && (
        <div className="space-y-4">
          <Label>Speaking Configuration</Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preparationTime">Preparation Time (seconds)</Label>
              <Input
                id="preparationTime"
                type="number"
                min="0"
                value={formData.preparationTime}
                onChange={(e) => handleInputChange('preparationTime', parseInt(e.target.value) || 0)}
                placeholder="60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="speakingTime">Speaking Time (seconds)</Label>
              <Input
                id="speakingTime"
                type="number"
                min="1"
                value={formData.speakingTime}
                onChange={(e) => handleInputChange('speakingTime', parseInt(e.target.value) || 60)}
                placeholder="120"
              />
            </div>
          </div>

          {formData.type === 'SPEAKING_PART2' && (
            <div className="space-y-2">
              <Label htmlFor="cueCardContent">Cue Card Content</Label>
              <Textarea
                id="cueCardContent"
                value={formData.cueCardContent}
                onChange={(e) => handleInputChange('cueCardContent', e.target.value)}
                placeholder="Enter the cue card content for Part 2 speaking"
                rows={4}
              />
            </div>
          )}

          {formData.type === 'SPEAKING_PART3' && (
            <div className="space-y-2">
              <Label htmlFor="followUpQuestions">Follow-up Questions (JSON format)</Label>
              <Textarea
                id="followUpQuestions"
                value={JSON.stringify(formData.followUpQuestions, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    handleInputChange('followUpQuestions', parsed)
                  } catch (error) {
                    // Invalid JSON, keep as string for now
                    handleInputChange('followUpQuestions', e.target.value)
                  }
                }}
                placeholder='["Question 1?", "Question 2?"]'
                rows={4}
              />
            </div>
          )}
        </div>
      )}

      {/* Test-specific fields */}
      {renderTestSpecificFields()}

      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation (Optional)</Label>
        <Textarea
          id="explanation"
          value={formData.explanation}
          onChange={(e) => handleInputChange('explanation', e.target.value)}
          placeholder="Enter explanation for the correct answer"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Question
        </Button>
      </div>
    </form>
  )
}
