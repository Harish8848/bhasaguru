"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { ImageUpload } from "@/components/upload/ImageUpload"
import { FileUpload } from "@/components/upload/FileUpload"

interface Question {
  id: string
  questionText: string
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK" | "MATCHING" | "AUDIO_QUESTION" | "SPEAKING_PART1" | "SPEAKING_PART2" | "SPEAKING_PART3" | "WRITING" | "READING_COMPREHENSION" | "LISTENING_COMPREHENSION"
  difficulty?: string
  order: number
  points: number
  audioUrl?: string
  imageUrl?: string
  videoUrl?: string
  options?: any
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
  testLanguage?: string
  onSuccess: () => void
  onCancel: () => void
}

export default function EditQuestionForm({ question, testType, testLanguage, onSuccess, onCancel }: EditQuestionFormProps) {
  const [loading, setLoading] = useState(false)

  // Initialize complex fields based on question type
  const initialMatchingPairs = question.type === 'MATCHING' && question.options?.pairs 
    ? question.options.pairs 
    : [{ left: "", right: "" }];
    
  const initialBlanks = question.type === 'FILL_BLANK' && question.options?.blanks
    ? question.options.blanks
    : [""];

  const [formData, setFormData] = useState({
    questionText: question.questionText || "",
    type: question.type as any,
    difficulty: question.difficulty || "medium",
    order: question.order || 1,
    points: question.points || 1,
    audioUrl: question.audioUrl || "",
    imageUrl: question.imageUrl || "",
    videoUrl: question.videoUrl || "",
    options: Array.isArray(question.options) ? question.options : ["", "", "", ""],
    correctAnswer: question.correctAnswer || "",
    explanation: question.explanation || "",
    // Test-specific fields
    questionPassage: question.questionPassage || "",
    questionSubSection: question.questionSubSection || "",
    language: question.language || testLanguage || "",
    module: question.module || "",
    section: question.section || "",
    standardSection: question.standardSection || "",
    // Speaking-specific fields
    preparationTime: question.preparationTime || 60,
    speakingTime: question.speakingTime || 120,
    cueCardContent: question.cueCardContent || "",
    followUpQuestions: Array.isArray(question.followUpQuestions) ? question.followUpQuestions : [],
    // Complex fields
    matchingPairs: initialMatchingPairs,
    blanks: initialBlanks
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.questionText.trim()) {
      alert('Question text is required')
      return
    }

    if (formData.type === 'MULTIPLE_CHOICE') {
      if (formData.options.some((opt: string) => !opt.trim())) {
        alert('All options are required for multiple choice questions')
        return
      }
      if (!formData.correctAnswer) {
        alert('Correct answer is required')
        return
      }
    }

    if (formData.type === 'MATCHING') {
      if (formData.matchingPairs.some((p: any) => !p.left.trim() || !p.right.trim())) {
        alert('All matching pairs must be completed')
        return
      }
    }

    setLoading(true)

    try {
      // Format options properly for the database
      let formattedOptions: any = undefined;
      
      if (formData.type === 'MULTIPLE_CHOICE') {
        formattedOptions = formData.options.map((text: string, index: number) => ({
          id: String.fromCharCode(65 + index),
          text: text,
        }));
      } else if (formData.type === 'MATCHING') {
        formattedOptions = {
          pairs: formData.matchingPairs
        };
      } else if (formData.type === 'FILL_BLANK') {
        formattedOptions = {
          blanks: formData.blanks
        };
      }

      const submitData: any = {
        ...formData,
        options: formattedOptions,
      }

      // Cleanup
      delete submitData.matchingPairs;
      delete submitData.blanks;

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

  const handlePairChange = (index: number, side: 'left' | 'right', value: string) => {
    const newPairs = [...formData.matchingPairs]
    newPairs[index][side] = value
    setFormData(prev => ({ ...prev, matchingPairs: newPairs }))
  }

  const addPair = () => {
    setFormData(prev => ({
      ...prev,
      matchingPairs: [...prev.matchingPairs, { left: "", right: "" }]
    }))
  }

  const removePair = (index: number) => {
    if (formData.matchingPairs.length > 1) {
      const newPairs = formData.matchingPairs.filter((_: any, i: number) => i !== index)
      setFormData(prev => ({ ...prev, matchingPairs: newPairs }))
    }
  }

  const handleBlankChange = (index: number, value: string) => {
    const newBlanks = [...formData.blanks]
    newBlanks[index] = value
    setFormData(prev => ({ ...prev, blanks: newBlanks }))
  }

  const addBlank = () => {
    setFormData(prev => ({ ...prev, blanks: [...prev.blanks, ""] }))
  }

  const removeBlank = (index: number) => {
    if (formData.blanks.length > 1) {
      const newBlanks = formData.blanks.filter((_: any, i: number) => i !== index)
      setFormData(prev => ({ ...prev, blanks: newBlanks }))
    }
  }

  const handleFollowUpChange = (index: number, value: string) => {
    const newQuestions = [...formData.followUpQuestions]
    newQuestions[index] = value
    setFormData(prev => ({ ...prev, followUpQuestions: newQuestions }))
  }

  const addFollowUp = () => {
    setFormData(prev => ({
      ...prev,
      followUpQuestions: [...prev.followUpQuestions, ""]
    }))
  }

  const removeFollowUp = (index: number) => {
    const newQuestions = formData.followUpQuestions.filter((_: any, i: number) => i !== index)
    setFormData(prev => ({ ...prev, followUpQuestions: newQuestions }))
  }

  const renderTestSpecificFields = () => {
    const upperTestType = testType.toUpperCase()

    switch (upperTestType) {
      case 'IELTS':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="questionPassage">Context Passage / Script (Optional)</Label>
              <Textarea
                id="questionPassage"
                value={formData.questionPassage}
                onChange={(e) => handleInputChange('questionPassage', e.target.value)}
                placeholder="Enter the reading passage or listening script context"
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="questionSubSection">IELTS Section</Label>
              <Select
                value={formData.questionSubSection}
                onValueChange={(value) => handleInputChange('questionSubSection', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
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
              <Label htmlFor="questionSubSection">JLPT Component</Label>
              <Select
                value={formData.questionSubSection}
                onValueChange={(value) => handleInputChange('questionSubSection', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select component" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vocabulary">Vocabulary (文字・語彙)</SelectItem>
                  <SelectItem value="grammar">Grammar (文法)</SelectItem>
                  <SelectItem value="reading">Reading (読解)</SelectItem>
                  <SelectItem value="listening">Listening (聴解)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(formData.questionSubSection === 'reading' || formData.questionSubSection === 'grammar') && (
              <div className="space-y-2">
                <Label htmlFor="questionPassage">Reading/Grammar Context</Label>
                <Textarea
                  id="questionPassage"
                  value={formData.questionPassage}
                  onChange={(e) => handleInputChange('questionPassage', e.target.value)}
                  placeholder="Enter the passage or sentence context"
                  rows={6}
                />
              </div>
            )}
          </>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
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
              <SelectItem value="WRITING">Writing / Essay</SelectItem>
              <SelectItem value="READING_COMPREHENSION">Reading Comprehension</SelectItem>
              <SelectItem value="LISTENING_COMPREHENSION">Listening Comprehension</SelectItem>
              {(testLanguage?.toLowerCase() === 'english' || testType.toUpperCase() === 'IELTS') && (
                <>
                  <SelectItem value="SPEAKING_PART1">Speaking Part 1</SelectItem>
                  <SelectItem value="SPEAKING_PART2">Speaking Part 2</SelectItem>
                  <SelectItem value="SPEAKING_PART3">Speaking Part 3</SelectItem>
                </>
              )}
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

      {/* Matching Type UI */}
      {formData.type === 'MATCHING' && (
        <div className="space-y-4 border p-4 rounded-md bg-muted/30">
          <div className="flex justify-between items-center">
            <Label>Matching Pairs *</Label>
            <Button type="button" variant="outline" size="sm" onClick={addPair}>
              <Plus className="w-4 h-4 mr-2" /> Add Pair
            </Button>
          </div>
          {formData.matchingPairs.map((pair: any, index: number) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <Input
                  value={pair.left}
                  onChange={(e) => handlePairChange(index, 'left', e.target.value)}
                  placeholder={`Left Item ${index + 1}`}
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  value={pair.right}
                  onChange={(e) => handlePairChange(index, 'right', e.target.value)}
                  placeholder={`Right Item ${index + 1}`}
                  required
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePair(index)}
                disabled={formData.matchingPairs.length <= 1}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Fill in the Blank Type UI */}
      {formData.type === 'FILL_BLANK' && (
        <div className="space-y-4 border p-4 rounded-md bg-muted/30">
          <div className="flex justify-between items-center">
            <div>
              <Label>Correct Answers for Blanks *</Label>
              <p className="text-xs text-muted-foreground">Add the correct word(s) for each blank in the question text.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addBlank}>
              <Plus className="w-4 h-4 mr-2" /> Add Blank
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formData.blanks.map((blank: string, index: number) => (
              <div key={index} className="flex gap-2 items-center">
                <span className="text-sm font-medium">#{index + 1}</span>
                <Input
                  value={blank}
                  onChange={(e) => handleBlankChange(index, e.target.value)}
                  placeholder="Correct word"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBlank(index)}
                  disabled={formData.blanks.length <= 1}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Speaking-specific fields */}
      {(formData.type === 'SPEAKING_PART1' || formData.type === 'SPEAKING_PART2' || formData.type === 'SPEAKING_PART3') && (
        <div className="space-y-4 border p-4 rounded-md bg-blue-50/10 border-blue-200/20">
          <Label className="text-blue-400">Speaking Configuration</Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preparationTime">Preparation Time (seconds)</Label>
              <Input
                id="preparationTime"
                type="number"
                min="0"
                value={formData.preparationTime}
                onChange={(e) => handleInputChange('preparationTime', parseInt(e.target.value) || 0)}
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
              />
            </div>
          </div>

          {formData.type === 'SPEAKING_PART2' && (
            <div className="space-y-2">
              <Label htmlFor="cueCardContent">Cue Card Content / Prompts</Label>
              <Textarea
                id="cueCardContent"
                value={formData.cueCardContent}
                onChange={(e) => handleInputChange('cueCardContent', e.target.value)}
                placeholder="Describe a place you visited... You should say: Where it was, Who you went with..."
                rows={4}
              />
            </div>
          )}

          {formData.type === 'SPEAKING_PART3' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Follow-up Questions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFollowUp}>
                  <Plus className="w-4 h-4 mr-2" /> Add Question
                </Button>
              </div>
              {formData.followUpQuestions.map((q: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={q}
                    onChange={(e) => handleFollowUpChange(index, e.target.value)}
                    placeholder={`Follow-up question ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFollowUp(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
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
