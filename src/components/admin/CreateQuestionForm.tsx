"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { ImageUpload } from "@/components/upload/ImageUpload"
import { FileUpload } from "@/components/upload/FileUpload"
import {
  getAllowedQuestionTypes,
  QUESTION_TYPE_LABELS,
  TEST_TYPE_LABELS,
  getMediaRequirements
} from "@/lib/question-mapping"

interface CreateQuestionFormProps {
  testId: string
  testType: string
  testLanguage?: string
  onSuccess: () => void
  onCancel: () => void
}

export default function CreateQuestionForm({ testId, testType, testLanguage, onSuccess, onCancel }: CreateQuestionFormProps) {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTestType, setSelectedTestType] = useState(testType)
  const [selectedQuestionType, setSelectedQuestionType] = useState("")

  const [formData, setFormData] = useState({
    testId,
    questionText: "",
    type: "" as any,
    difficulty: "medium",
    order: 1,
    points: 1,
    audioUrl: "",
    imageUrl: "",
    videoUrl: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    // Test-specific fields
    questionPassage: "",
    questionSubSection: "",
    language: testLanguage || "",
    module: "",
    section: "",
    standardSection: "",
    // Speaking-specific fields
    preparationTime: 60,
    speakingTime: 120,
    cueCardContent: "",
    followUpQuestions: [] as string[],
    // Matching fields
    matchingPairs: [{ left: "", right: "" }],
    // Fill in the blanks fields
    blanks: [""]
  })

  // Get the next order number
  useEffect(() => {
    const fetchNextOrder = async () => {
      try {
        // Fetch questions ordered by order desc to get the highest order number
        const response = await fetch(`/api/admin/mock-test/questions?testId=${testId}&limit=1000`)
        if (response.ok) {
          const data = await response.json()
          const nextOrder = data.data.length > 0 ? Math.max(...data.data.map((q: any) => q.order)) + 1 : 1
          setFormData(prev => ({ ...prev, order: nextOrder }))
        }
      } catch (error) {
        console.error('Failed to fetch next order:', error)
      }
    }

    fetchNextOrder()
  }, [testId])

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

    if (formData.type === 'MATCHING') {
      if (formData.matchingPairs.some(p => !p.left.trim() || !p.right.trim())) {
        alert('All matching pairs must be completed')
        return
      }
    }

    setLoading(true)

    try {
      // Format options properly for the database
      let formattedOptions: any = undefined;
      let finalCorrectAnswer = formData.correctAnswer;

      if (formData.type === 'MULTIPLE_CHOICE') {
        formattedOptions = formData.options.map((text, index) => ({
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
        correctAnswer: finalCorrectAnswer,
      }

      // Cleanup
      delete submitData.matchingPairs;
      delete submitData.blanks;

      const response = await fetch('/api/admin/mock-test/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        console.error('Create Question API Error:', JSON.stringify(error, null, 2), error)
        alert(error.message || 'Failed to create question')
      }
    } catch (error) {
      console.error('Error creating question:', error)
      alert('Failed to create question')
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
      const newPairs = formData.matchingPairs.filter((_, i) => i !== index)
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
      const newBlanks = formData.blanks.filter((_, i) => i !== index)
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
    const newQuestions = formData.followUpQuestions.filter((_, i) => i !== index)
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

  // Step navigation functions
  const nextStep = () => {
    if (currentStep === 1 && !selectedTestType) {
      alert('Please select a test type');
      return;
    }
    if (currentStep === 2 && !selectedQuestionType) {
      alert('Please select a question type');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleTestTypeSelect = (testType: string) => {
    setSelectedTestType(testType);
    setSelectedQuestionType(""); // Reset question type when test type changes
  };

  const handleQuestionTypeSelect = (questionType: string) => {
    setSelectedQuestionType(questionType);
    handleInputChange('type', questionType);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}>
            {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < 3 && (
            <div className={`w-12 h-0.5 mx-2 ${
              currentStep > step ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Step 1: Select Test Type</h3>
              <p className="text-muted-foreground">Choose the type of test this question belongs to</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(TEST_TYPE_LABELS).map(([value, label]) => (
                <Card
                  key={value}
                  className={`cursor-pointer transition-all ${
                    selectedTestType === value
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleTestTypeSelect(value)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="font-medium">{label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        const allowedTypes = getAllowedQuestionTypes(selectedTestType);
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Step 2: Select Question Type</h3>
              <p className="text-muted-foreground">
                Choose the type of question for {TEST_TYPE_LABELS[selectedTestType]}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {allowedTypes.map((questionType) => (
                <Card
                  key={questionType}
                  className={`cursor-pointer transition-all ${
                    selectedQuestionType === questionType
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleQuestionTypeSelect(questionType)}
                >
                  <CardContent className="p-4">
                    <div className="font-medium">{QUESTION_TYPE_LABELS[questionType]}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <form id="question-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Step 3: Configure Question</h3>
              <p className="text-muted-foreground">
                {TEST_TYPE_LABELS[selectedTestType]} • {QUESTION_TYPE_LABELS[selectedQuestionType]}
              </p>
            </div>

            {/* Question Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Dynamic form fields based on question type */}
            {renderDynamicFormFields()}

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
          </form>
        );

      default:
        return null;
    }
  };

  const renderDynamicFormFields = () => {
    const mediaRequirements = getMediaRequirements(selectedTestType, selectedQuestionType);

    return (
      <>
        {/* Media Uploads */}
        <div className="space-y-4">
          <Label>Media {mediaRequirements.audioRequired ? '(Required)' : '(Optional)'}</Label>

          {mediaRequirements.audioRequired && (
            <div className="space-y-2">
              <Label htmlFor="audioUrl" className="text-red-500">Audio File *</Label>
              <FileUpload
                accept={["audio/*"]}
                onUploadComplete={(url) => handleInputChange('audioUrl', url)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image</Label>
            <ImageUpload
              onUploadComplete={(url) => handleInputChange('imageUrl', url)}
              currentImage={formData.imageUrl}
            />
          </div>

          {mediaRequirements.videoAllowed && (
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                placeholder="Enter video URL (optional)"
              />
            </div>
          )}
        </div>

        {/* Question type specific fields */}
        {renderQuestionTypeSpecificFields()}
      </>
    );
  };

  const renderQuestionTypeSpecificFields = () => {
    switch (selectedQuestionType) {
      case 'MULTIPLE_CHOICE':
        return (
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
        );

      case 'TRUE_FALSE':
        return (
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
        );

      case 'FILL_BLANK':
        return (
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
              {formData.blanks.map((blank, index) => (
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
        );

      case 'MATCHING':
        return (
          <div className="space-y-4 border p-4 rounded-md bg-muted/30">
            <div className="flex justify-between items-center">
              <Label>Matching Pairs *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPair}>
                <Plus className="w-4 h-4 mr-2" /> Add Pair
              </Button>
            </div>
            {formData.matchingPairs.map((pair, index) => (
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
        );

      case 'SPEAKING_PART1':
      case 'SPEAKING_PART2':
      case 'SPEAKING_PART3':
        return (
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

            {selectedQuestionType === 'SPEAKING_PART2' && (
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

            {selectedQuestionType === 'SPEAKING_PART3' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Follow-up Questions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFollowUp}>
                    <Plus className="w-4 h-4 mr-2" /> Add Question
                  </Button>
                </div>
                {formData.followUpQuestions.map((q, index) => (
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      {renderStepIndicator()}

      <div className="min-h-400px">
        {renderStepContent()}
      </div>

      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 1 ? onCancel : prevStep}
          disabled={loading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </Button>

        {currentStep < 3 ? (
          <Button onClick={nextStep}>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button type="submit" form="question-form" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Question
          </Button>
        )}
      </div>
    </div>
  )
}
