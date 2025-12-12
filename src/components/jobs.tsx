"use client"

import { useEffect, useState } from "react"
import { Briefcase, MapPin, Globe, TrendingUp, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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


export default function JobsSection() {
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState("japan")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const [jobStats, setJobStats] = useState([
    { label: "Active Listings", value: "...", icon: Briefcase },
    { label: "Average Salary", value: "...", icon: TrendingUp },
    { label: "Successful Placements", value: "...", icon: Globe },
  ])

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const url = searchQuery
          ? `/api/jobs/search?query=${encodeURIComponent(searchQuery)}&country=${selectedCountry}`
          : `/api/jobs?country=${selectedCountry}`
        const response = await fetch(url)
        const result = await response.json()

        if (result.success) {
          setJobs(result.jobs)
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
  }, [selectedCountry, searchQuery])

  useEffect(() => {
    if (jobs.length > 0) {
      const activeListings = jobs.length.toString()

      const calculateAverageSalary = () => {
        const salaries = jobs
          .map((job) => {
            const salary = job.salary.replace(/[^0-9.-]+/g, "")
            return salary ? parseFloat(salary) : 0
          })
          .filter((salary) => salary > 0)

        if (salaries.length === 0) return "N/A"

        const average = salaries.reduce((a, b) => a + b, 0) / salaries.length
        return `$${Math.round(average).toLocaleString()}`
      }

      setJobStats([
        { label: "Active Listings", value: activeListings, icon: Briefcase },
        { label: "Average Salary", value: calculateAverageSalary(), icon: TrendingUp },
        { label: "Successful Placements", value: "1000+", icon: Globe },
      ])
    }
  }, [jobs])


  return (
    <section className="py-20 md:py-10 bg-background border-t border-border">
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

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2   mx-auto w-full">
            <Input
              type="text"
              placeholder="Search jobs by title, company, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-8 bg-accent/10 mb-4 max-w-full"
            />
            <Button
              onClick={() => setIsSearching(!isSearching)}
              variant={isSearching ? "default" : "outline"}
              className="p-8"
            >
              Search
            </Button>
          </div>

          {/* Country Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { key: "japan", label: "🇯🇵 Japan" },
              { key: "korea", label: "🇰🇷 Korea" },
              { key: "uk", label: "🇬🇧 UK" },
              { key: "us", label: "🇺🇸 US" },
              { key: "australia", label: "🇦🇺 Australia" },
            ].map((country) => (
              <Button
                key={country.key}
                onClick={() => setSelectedCountry(country.key)}
                variant={selectedCountry === country.key ? "default" : "outline"}
                className={selectedCountry === country.key ? "bg-accent text-accent-foreground" : ""}
              >
                {country.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Job Listings */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">{searchQuery ? "Search Results" : "Featured Opportunities"}</h3>

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
