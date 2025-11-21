"use client"

import { useEffect, useState } from "react"
import { Briefcase, MapPin, Globe, TrendingUp, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface JobListing {
  id: string | number
  title: string
  company: string
  location: string
  type: string
  languageLevel: string
  salary: string
  applications: number
  description?: string
  url?: string
}

const jobStats = [
  { label: "Active Listings", value: "1,200+", icon: Briefcase },
  { label: "Average Salary", value: "$52K/year", icon: TrendingUp },
  { label: "Successful Placements", value: "8,500+", icon: Globe },
]

export default function JobsSection() {
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState("japan")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/jobs?country=${selectedCountry}`)
        const result = await response.json()

        if (result.success) {
          setJobs(result.data)
          setError(null)
        } else {
          throw new Error(result.error || "Failed to fetch jobs")
        }
      } catch (err) {
        console.error("[v0] Jobs fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [selectedCountry])

  return (
    <section className="py-20 md:py-32 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            <span className="text-accent">1000+</span> International Job Opportunities
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Get matched with positions that fit your language skills. Start your career abroad today.
          </p>
        </div>

        {/* Job Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {jobStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="border-border">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-center">
                    <Icon className="w-8 h-8 text-accent mx-auto" />
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Country Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {["japan", "korea"].map((country) => (
            <Button
              key={country}
              onClick={() => setSelectedCountry(country)}
              variant={selectedCountry === country ? "default" : "outline"}
              className={selectedCountry === country ? "bg-accent text-accent-foreground" : ""}
            >
              {country === "japan" ? "🇯🇵 Japan" : "🇰🇷 Korea"}
            </Button>
          ))}
        </div>

        {/* Featured Job Listings */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Featured Opportunities</h3>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading job opportunities...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card className="border-border">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{error}. Showing featured opportunities instead.</p>
              </CardContent>
            </Card>
          )}

          {/* Jobs List */}
          {!loading && jobs.length > 0 && (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id} className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Job Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold leading-tight mb-2">{job.title}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground mb-3">
                            <span className="font-medium text-foreground">{job.company}</span>
                            <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="w-fit bg-accent/10 text-accent border-accent/20">
                          {job.type.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      {/* Job Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-border">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Required Level</p>
                          <p className="font-semibold text-sm">{job.languageLevel.replace(/_/g, " ")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Salary</p>
                          <p className="font-semibold text-sm">{job.salary}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Applications</p>
                          <p className="font-semibold text-sm">{job.applications} applied</p>
                        </div>
                      </div>

                      {/* Apply Button */}
                      <div className="flex justify-end">
                        <Button
                          className="bg-gradient-accent hover:opacity-90 text-accent-foreground"
                          onClick={() => job.url && window.open(job.url, "_blank")}
                        >
                          View & Apply
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Jobs State */}
          {!loading && jobs.length === 0 && !error && (
            <Card className="border-border">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  No jobs found for the selected country. Try another country.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Browse All CTA */}
        <div className="text-center pt-8">
          <Button size="lg" variant="outline" className="border-accent text-accent bg-transparent hover:bg-accent/10">
            Browse All Job Listings
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
