"use client"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface StatsData {
  activeLearners: number
  expertCourses: number
  satisfactionRate: number
  jobPlacements: number
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/statistics')
        const result = await response.json()

        if (result.success) {
          setStats(result.data)
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  const statItems = stats ? [
    {
      number: stats.activeLearners.toString(),
      label: "Active Learners",
      description: "From 85+ countries learning with BhasaGuru",
    },
    {
      number: `${stats.expertCourses}+`,
      label: "Expert Courses",
      description: "From beginner to advanced proficiency levels",
    },
    {
      number: `${stats.satisfactionRate}%`,
      label: "Satisfaction Rate",
      description: "Learners recommend BhasaGuru to others",
    },
    {
      number: stats.jobPlacements.toString(),
      label: "Job Placements",
      description: "Successful placements in 2024 alone",
    },
  ] : []

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {statItems.map((stat, index) => (
            <div
              key={index}
              className="text-center space-y-3 p-6 rounded-lg border border-border hover:border-accent/50 transition-colors"
            >
              <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                {stat.number}
              </div>
              <h3 className="text-lg font-semibold">{stat.label}</h3>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
