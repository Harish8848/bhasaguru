"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface CreateJobFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function CreateJobForm({ onSuccess, onCancel }: CreateJobFormProps) {
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "FULL_TIME" as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP",
    description: "",
    requirements: "",
    languageRequired: "",
    languageLevel: "BEGINNER" as "BEGINNER" | "ELEMENTARY" | "INTERMEDIATE" | "UPPER_INTERMEDIATE" | "ADVANCED" | "PROFICIENT",
    salary: "",
    currency: "USD",
    applicationUrl: "",
    email: "",
    expiresAt: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Job title is required')
      return
    }

    if (!formData.company.trim()) {
      alert('Company name is required')
      return
    }

    if (!formData.location.trim()) {
      alert('Location is required')
      return
    }

    if (!formData.description.trim()) {
      alert('Job description is required')
      return
    }

    if (!formData.requirements.trim()) {
      alert('Job requirements are required')
      return
    }

    if (!formData.languageRequired.trim()) {
      alert('Required language is required')
      return
    }

    setLoading(true)

    try {
      const submitData = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        salary: formData.salary || null,
        currency: formData.salary ? formData.currency : null,
        applicationUrl: formData.applicationUrl || null,
        email: formData.email || null,
      }

      const response = await fetch('/api/admin/jobs', {
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
        alert(error.message || 'Failed to create job listing')
      }
    } catch (error) {
      console.error('Error creating job:', error)
      alert('Failed to create job listing')
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter job title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            placeholder="Enter company name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Enter job location"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Job Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleInputChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_TIME">Full Time</SelectItem>
              <SelectItem value="PART_TIME">Part Time</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="INTERNSHIP">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="languageRequired">Required Language *</Label>
          <Input
            id="languageRequired"
            value={formData.languageRequired}
            onChange={(e) => handleInputChange('languageRequired', e.target.value)}
            placeholder="e.g., English, Spanish, French"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="languageLevel">Language Level *</Label>
          <Select
            value={formData.languageLevel}
            onValueChange={(value) => handleInputChange('languageLevel', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="ELEMENTARY">Elementary</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="UPPER_INTERMEDIATE">Upper Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
              <SelectItem value="PROFICIENT">Proficient</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            value={formData.salary}
            onChange={(e) => handleInputChange('salary', e.target.value)}
            placeholder="Enter salary (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => handleInputChange('currency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
              <SelectItem value="AUD">AUD</SelectItem>
              <SelectItem value="JPY">JPY</SelectItem>
              <SelectItem value="INR">INR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Job Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter detailed job description"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements *</Label>
        <Textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => handleInputChange('requirements', e.target.value)}
          placeholder="Enter job requirements and qualifications"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="applicationUrl">Application URL</Label>
          <Input
            id="applicationUrl"
            value={formData.applicationUrl}
            onChange={(e) => handleInputChange('applicationUrl', e.target.value)}
            placeholder="External application URL (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Contact Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Contact email for applications (optional)"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Application Deadline</Label>
        <Input
          id="expiresAt"
          type="datetime-local"
          value={formData.expiresAt}
          onChange={(e) => handleInputChange('expiresAt', e.target.value)}
          placeholder="Application deadline (optional)"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Job Listing
        </Button>
      </div>
    </form>
  )
}
