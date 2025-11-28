"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createTestSchema } from "@/lib/validation"
import { toast } from "sonner"

type TestFormData = {
  courseId?: string
  title: string
  description?: string
  language?: string
  module?: string
  section?: string
  standardSection?: string
  type: "PRACTICE" | "FINAL" | "CERTIFICATION"
  duration: number
  passingScore: number
  questionsCount: number
  shuffleQuestions?: boolean
  shuffleOptions?: boolean
  showResults?: boolean
  allowRetake?: boolean
}

const languages = [
  { value: "Japanese", label: "Japanese" },
  { value: "Korean", label: "Korean" },
  { value: "English", label: "English" },
  { value: "Chinese", label: "Chinese" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Spanish", label: "Spanish" },
]

const japaneseModules = [
  { value: "GRAMMAR", label: "Grammar" },
  { value: "VOCABULARY", label: "Vocabulary" },
  { value: "READING", label: "Reading" },
  { value: "LISTENING", label: "Listening" },
  { value: "WRITING", label: "Writing" },
]

const koreanModules = [
  { value: "GRAMMAR", label: "Grammar" },
  { value: "VOCABULARY", label: "Vocabulary" },
  { value: "READING", label: "Reading" },
  { value: "LISTENING", label: "Listening" },
  { value: "WRITING", label: "Writing" },
]

const englishModules = [
  { value: "READING", label: "Reading" },
  { value: "LISTENING", label: "Listening" },
  { value: "WRITING", label: "Writing" },
  { value: "SPEAKING", label: "Speaking" },
]

const testTypes = [
  { value: "PRACTICE", label: "Practice" },
  { value: "FINAL", label: "Final" },
  { value: "CERTIFICATION", label: "Certification" },
]

export default function CreateMockTestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Array<{id: string, title: string}>>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TestFormData>({
    resolver: zodResolver(createTestSchema),
    defaultValues: {
      type: "PRACTICE",
      duration: 60,
      passingScore: 70,
      questionsCount: 50,
      shuffleQuestions: true,
      shuffleOptions: true,
      showResults: true,
      allowRetake: true,
    },
  })

  const selectedLanguage = watch("language")

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/admin/courses?page=1&limit=100')
        if (response.ok) {
          const data = await response.json()
          setCourses(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      }
    }
    fetchCourses()
  }, [])

  const getModulesForLanguage = (language?: string) => {
    switch (language) {
      case "Japanese":
        return japaneseModules
      case "Korean":
        return koreanModules
      case "English":
        return englishModules
      default:
        return []
    }
  }

  const onSubmit = async (data: TestFormData) => {
    try {
      setLoading(true)

      const response = await fetch('/api/admin/mock-test/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create test')
      }

      const result = await response.json()
      toast.success('Mock test created successfully!')

      // Redirect to mock tests list
      router.push('/admin/mock-tests')
    } catch (error) {
      console.error('Error creating test:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create test')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/mock-tests')}
          className="bg-transparent border-border text-foreground hover:bg-secondary"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Tests
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Mock Test</h1>
          <p className="text-muted-foreground mt-1">Set up a new language proficiency assessment</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">Test Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., JLPT N5 Grammar Practice Test"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Brief description of the test"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseId" className="text-foreground">Associated Course</Label>
                <Select onValueChange={(value) => setValue('courseId', value === 'none' ? undefined : value)}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select a course (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No associated course</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-foreground">Test Type *</Label>
                <Select onValueChange={(value: any) => setValue('type', value)}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    {testTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Language Configuration */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Language Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-foreground">Language</Label>
                <Select onValueChange={(value) => setValue('language', value)}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="module" className="text-foreground">Module</Label>
                <Select onValueChange={(value) => setValue('module', value)}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModulesForLanguage(selectedLanguage).map((module) => (
                      <SelectItem key={module.value} value={module.value}>
                        {module.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="section" className="text-foreground">Section</Label>
                  <Input
                    id="section"
                    {...register('section')}
                    placeholder="e.g., Part 1"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="standardSection" className="text-foreground">Standard Section</Label>
                  <Input
                    id="standardSection"
                    {...register('standardSection')}
                    placeholder="e.g., Academic"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Test Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-foreground">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    {...register('duration', { valueAsNumber: true })}
                    className="bg-input border-border text-foreground"
                  />
                  {errors.duration && (
                    <p className="text-sm text-destructive">{errors.duration.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passingScore" className="text-foreground">Passing Score (%) *</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    {...register('passingScore', { valueAsNumber: true })}
                    className="bg-input border-border text-foreground"
                  />
                  {errors.passingScore && (
                    <p className="text-sm text-destructive">{errors.passingScore.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionsCount" className="text-foreground">Questions Count *</Label>
                <Input
                  id="questionsCount"
                  type="number"
                  {...register('questionsCount', { valueAsNumber: true })}
                  className="bg-input border-border text-foreground"
                />
                {errors.questionsCount && (
                  <p className="text-sm text-destructive">{errors.questionsCount.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Options */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Test Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Shuffle Questions</Label>
                  <p className="text-sm text-muted-foreground">Randomize question order</p>
                </div>
                <Switch
                  checked={watch('shuffleQuestions')}
                  onCheckedChange={(checked) => setValue('shuffleQuestions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Shuffle Options</Label>
                  <p className="text-sm text-muted-foreground">Randomize answer options</p>
                </div>
                <Switch
                  checked={watch('shuffleOptions')}
                  onCheckedChange={(checked) => setValue('shuffleOptions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Show Results</Label>
                  <p className="text-sm text-muted-foreground">Display results after completion</p>
                </div>
                <Switch
                  checked={watch('showResults')}
                  onCheckedChange={(checked) => setValue('showResults', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-foreground">Allow Retake</Label>
                  <p className="text-sm text-muted-foreground">Permit multiple attempts</p>
                </div>
                <Switch
                  checked={watch('allowRetake')}
                  onCheckedChange={(checked) => setValue('allowRetake', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Creating Test...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Create Mock Test
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
