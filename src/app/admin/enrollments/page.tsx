"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Search, Users, Filter, User, MapPin, Phone, Mail } from "lucide-react"
import { useState, useEffect } from "react"

interface Enrollment {
  id: string
  status: string
  completedLessons: number
  progressPercent: number
  enrolledAt: string
  completedAt: string | null
  lastAccessedAt: string | null
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
    address: string | null
  }
  course: {
    id: string
    title: string
    language: string
  }
}

interface Course {
  id: string
  title: string
  language: string
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    courseId: "",
    status: "ACTIVE",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollmentsRes, coursesRes] = await Promise.all([
          fetch('/api/admin/enrollments', { cache: 'no-store' }),
          fetch('/api/admin/courses', { cache: 'no-store' }),
        ])

        const [enrollmentsData, coursesData] = await Promise.all([
          enrollmentsRes.json(),
          coursesRes.json(),
        ])

        if (enrollmentsData.success) {
          setEnrollments(enrollmentsData.data)
        }
        if (coursesData.success) {
          setCourses(coursesData.data)
        }
      } catch (err) {
        setError('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreate = async () => {
    if (!formData.email) {
      alert('Please enter email')
      return
    }
    if (!formData.courseId) {
      alert('Please select a course')
      return
    }

    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()

      if (result.success) {
        setShowCreateDialog(false)
        setFormData({ name: '', email: '', phone: '', address: '', courseId: '', status: 'ACTIVE' })
        window.location.reload()
      } else {
        alert(result.message || 'Failed to create enrollment')
      }
    } catch (err) {
      alert('Failed to create enrollment')
    }
  }

  const handleEdit = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment)
    setShowEditDialog(true)
  }

  const handleUpdate = async () => {
    if (!editingEnrollment) return

    try {
      const response = await fetch(`/api/admin/enrollments/${editingEnrollment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editingEnrollment.status,
          completedLessons: editingEnrollment.completedLessons,
          progressPercent: editingEnrollment.progressPercent,
        }),
      })
      const result = await response.json()

      if (result.success) {
        setShowEditDialog(false)
        setEditingEnrollment(null)
        window.location.reload()
      } else {
        alert(result.message || 'Failed to update enrollment')
      }
    } catch (err) {
      alert('Failed to update enrollment')
    }
  }

  const handleDelete = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to delete this enrollment?')) return

    try {
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        setEnrollments(enrollments.filter(e => e.id !== enrollmentId))
      } else {
        alert(result.message || 'Failed to delete enrollment')
      }
    } catch (err) {
      alert('Failed to delete enrollment')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400'
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-400'
      case 'DROPPED':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Enrollments Management</h1>
          <p className="text-muted-foreground mt-1">Loading enrollments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Enrollments Management</h1>
          <p className="text-red-500 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Enrollments Management</h1>
          <p className="text-muted-foreground mt-1">Manage all course enrollments</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus size={18} className="mr-2" />
          New Enrollment
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by user or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-180px bg-input border-border">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="DROPPED">Dropped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Users size={24} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Enrollments</p>
              <p className="text-2xl font-bold text-foreground">
                {enrollments.filter(e => e.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">
                {enrollments.filter(e => e.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Users size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Enrollments</p>
              <p className="text-2xl font-bold text-foreground">{enrollments.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-foreground font-semibold">Student</th>
                <th className="text-left p-4 text-foreground font-semibold">Contact</th>
                <th className="text-left p-4 text-foreground font-semibold">Course</th>
                <th className="text-left p-4 text-foreground font-semibold">Progress</th>
                <th className="text-left p-4 text-foreground font-semibold">Status</th>
                <th className="text-left p-4 text-foreground font-semibold">Enrolled</th>
                <th className="text-left p-4 text-foreground font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {enrollment.user.name || 'Not specified'}
                      </p>
                      {enrollment.user.address && (
                        <p className="text-xs text-muted-foreground truncate max-w-150px">
                          {enrollment.user.address}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="text-xs text-foreground">{enrollment.user.email}</p>
                      {enrollment.user.phone && (
                        <p className="text-xs text-muted-foreground">{enrollment.user.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-foreground">{enrollment.course.title}</p>
                    <p className="text-xs text-muted-foreground">{enrollment.course.language}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${enrollment.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-foreground">{enrollment.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={getStatusColor(enrollment.status)}>
                      {enrollment.status.charAt(0) + enrollment.status.slice(1).toLowerCase()}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(enrollment)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/80"
                        onClick={() => handleDelete(enrollment.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEnrollments.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No enrollments found
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md" aria-describedby="create-desc">
          <DialogHeader>
            <DialogTitle>New Enrollment</DialogTitle>
          </DialogHeader>
            <span id="create-desc" className="sr-only">Create new enrollment</span>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter student name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseId">Course *</Label>
              <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title} ({course.language})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Enrollment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md" aria-describedby="edit-desc">
          <DialogHeader>
            <span id="edit-desc" className="sr-only">Edit enrollment details</span>
            <DialogTitle>Edit Enrollment</DialogTitle>
          </DialogHeader>
          {editingEnrollment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-medium text-foreground">
                    {editingEnrollment.user.name || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground">{editingEnrollment.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium text-foreground">{editingEnrollment.course.title}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select value={editingEnrollment.status} onValueChange={(value) => setEditingEnrollment({ ...editingEnrollment, status: value })}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="DROPPED">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="completedLessons">Completed Lessons</Label>
                <Input
                  id="completedLessons"
                  type="number"
                  min="0"
                  value={editingEnrollment.completedLessons}
                  onChange={(e) =>
                    setEditingEnrollment({
                      ...editingEnrollment,
                      completedLessons: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="progressPercent">Progress (%)</Label>
                <Input
                  id="progressPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={editingEnrollment.progressPercent}
                  onChange={(e) =>
                    setEditingEnrollment({
                      ...editingEnrollment,
                      progressPercent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                    })
                  }
                  className="bg-input border-border"
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Enrollment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
