"use client"

import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Users, BookOpen, BarChart3, Briefcase, FileText, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface StatisticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalCourses: number
    publishedCourses: number
    totalEnrollments: number
    totalTests: number
    totalJobs: number
    activeJobs: number
    totalArticles: number
    publishedArticles: number
    newUsersLast30Days: number
  }
  popularCourses: Array<{
    id: string
    title: string
    studentsCount: number
    lessonsCount: number
    language: string
    level: string
  }>
}

export default function DashboardPage() {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/admin/statistics')
        if (!response.ok) {
          throw new Error('Failed to fetch statistics')
        }
        const data = await response.json()
        setStatistics(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        <p>Failed to load dashboard data: {error}</p>
      </div>
    )
  }

  if (!statistics) {
    return null
  }
  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's your platform analytics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Users"
          value={statistics.overview.totalUsers.toLocaleString()}
          subtext={`${statistics.overview.activeUsers} active users`}
          trend="up"
          trendValue={`+${statistics.overview.newUsersLast30Days} this month`}
          icon={<Users size={24} />}
        />
        <StatCard
          title="Total Courses"
          value={statistics.overview.totalCourses.toString()}
          subtext={`${statistics.overview.publishedCourses} published`}
          icon={<BookOpen size={24} />}
        />
        <StatCard
          title="Enrollments"
          value={statistics.overview.totalEnrollments.toLocaleString()}
          subtext="Total student enrollments"
          icon={<BarChart3 size={24} />}
        />
        <StatCard
          title="Mock Tests"
          value={statistics.overview.totalTests.toString()}
          subtext="Available assessments"
          icon={<BarChart3 size={24} />}
        />
        <StatCard
          title="Job Listings"
          value={statistics.overview.totalJobs.toString()}
          subtext={`${statistics.overview.activeJobs} active`}
          icon={<Briefcase size={24} />}
        />
        <StatCard
          title="Culture Posts"
          value={statistics.overview.totalArticles.toString()}
          subtext={`${statistics.overview.publishedArticles} published`}
          icon={<FileText size={24} />}
        />
      </div>

      {/* Popular Courses Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses by Enrollment */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Top Courses by Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statistics.popularCourses.length > 0 ? (
                statistics.popularCourses.map((course, idx) => (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.language} • {course.level} • {course.lessonsCount} lessons
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{course.studentsCount}</p>
                      <p className="text-xs text-muted-foreground">students</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No courses available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Platform Overview */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">User Registration Rate</span>
                <span className="text-sm font-medium">
                  +{statistics.overview.newUsersLast30Days} this month
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Course Completion Rate</span>
                <span className="text-sm font-medium">
                  {statistics.overview.totalEnrollments > 0
                    ? Math.round((statistics.overview.totalEnrollments / statistics.overview.totalUsers) * 100)
                    : 0
                  }% avg enrollments per user
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Content Quality</span>
                <span className="text-sm font-medium">
                  {statistics.overview.publishedCourses}/{statistics.overview.totalCourses} courses published
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Job Market Activity</span>
                <span className="text-sm font-medium">
                  {statistics.overview.activeJobs}/{statistics.overview.totalJobs} jobs active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
