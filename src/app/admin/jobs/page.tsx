"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit2, Eye, Trash2, Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import CreateJobForm from "@/components/admin/CreateJobForm"

interface Job {
  id: string
  title: string
  company: string
  location: string
  languageRequired: string
  languageLevel: string
  status: string
  createdAt: string
  _count: {
    applications: number
  }
}

interface PaginatedResponse {
  data: Job[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      const response = await fetch(`/api/admin/jobs?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }

      const data: PaginatedResponse = await response.json()
      setJobs(data.data)
      setTotalPages(data.pagination.totalPages)
      setTotalJobs(data.pagination.total)
      setCurrentPage(data.pagination.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs(currentPage)
  }, [currentPage])

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    fetchJobs(currentPage) // Refresh the jobs list
  }

  const handleCreateCancel = () => {
    setShowCreateDialog(false)
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        <p>Failed to load jobs: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Jobs Board Management</h1>
          <p className="text-muted-foreground mt-1">Post and manage job listings</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus size={18} className="mr-2" />
          Post Job
        </Button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {totalJobs} jobs
        </div>
      </div>

      {/* Jobs Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-foreground font-semibold">Title</th>
                <th className="text-left p-4 text-foreground font-semibold">Company</th>
                <th className="text-left p-4 text-foreground font-semibold">Location</th>
                <th className="text-left p-4 text-foreground font-semibold">Language</th>
                <th className="text-left p-4 text-foreground font-semibold">Level</th>
                <th className="text-left p-4 text-foreground font-semibold">Applications</th>
                <th className="text-left p-4 text-foreground font-semibold">Status</th>
                <th className="text-left p-4 text-foreground font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="p-4 text-foreground font-medium">{job.title}</td>
                  <td className="p-4 text-foreground">{job.company}</td>
                  <td className="p-4 text-foreground">{job.location}</td>
                  <td className="p-4 text-foreground">{job.languageRequired}</td>
                  <td className="p-4 text-foreground">{job.languageLevel}</td>
                  <td className="p-4 text-foreground">{job._count.applications}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Edit Job"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/80"
                        title="Delete Job"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Job Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post New Job Listing</DialogTitle>
          </DialogHeader>
          <CreateJobForm onSuccess={handleCreateSuccess} onCancel={handleCreateCancel} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
