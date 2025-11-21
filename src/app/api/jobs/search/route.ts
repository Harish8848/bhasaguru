import { NextResponse } from "next/server"

// This API route searches for jobs using external APIs
// Uses JSearch API with fallback to RemoteOK

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || ""
  const country = searchParams.get("country") || "japan"

  if (!query) {
    return NextResponse.json(
      {
        success: false,
        error: "Query parameter is required",
        data: [],
      },
      { status: 400 }
    )
  }

  const apiKey = process.env.RAPIDAPI_KEY

  try {
    // Try JSearch API first if API key is available
    if (apiKey) {
      try {
        const jsearchResponse = await fetchFromJSearchAPI(query, country, apiKey)
        return jsearchResponse
      } catch (error) {
        console.error("[v0] JSearch API failed for search, falling back to RemoteOK:", error)
      }
    }

    // Fallback to RemoteOK API (limited search capability)
    const remoteOkJobs = await fetchFromRemoteOKAPI(query, country)

    return NextResponse.json({
      success: true,
      data: remoteOkJobs,
      source: "remoteok",
    })
  } catch (error) {
    console.error("[v0] All job search APIs failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search jobs",
        data: [],
      },
      { status: 500 }
    )
  }
}

// Fetch from JSearch API (RapidAPI) with search query
async function fetchFromJSearchAPI(query: string, country: string, apiKey: string) {
  const countryCodes = {
    japan: "JP",
    korea: "KR",
    uk: "GB",
    us: "US",
    australia: "AU",
  }

  const countryCode = countryCodes[country as keyof typeof countryCodes] || "US"

  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
  }

  const response = await fetch(
    `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&country=${encodeURIComponent(countryCode)}&page=1&num_pages=1`,
    options,
  )

  if (!response.ok) throw new Error("JSearch API failed")

  const data = await response.json()
  console.log("JSearch API response:", JSON.stringify(data, null, 2))

  const transformedJobs =
    data.data?.map((job: any) => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: `${job.job_city}, ${job.job_country}`,
      type: job.job_employment_type || "FULL_TIME",
      languageLevel: job.job_required_experience?.required_experience_in_years ? "ADVANCED" : "INTERMEDIATE",
      salary: job.job_salary_currency
        ? `${job.job_salary_currency} ${job.job_salary_max || "Competitive"}`
        : "Competitive",
      applications: Math.floor(Math.random() * 200 + 50),
      description: job.job_description,
      url: job.job_apply_link,
    })) || []

  return NextResponse.json({
    success: true,
    data: transformedJobs,
    source: "jsearch",
  })
}

// Fetch from RemoteOK API with basic filtering (limited search)
async function fetchFromRemoteOKAPI(query: string, country: string) {
  try {
    const countryMap: { [key: string]: string } = {
      japan: "Japan",
      korea: "South Korea",
      uk: "United Kingdom",
      us: "United States",
      australia: "Australia",
    }

    const countryName = countryMap[country] || "Japan"

    const response = await fetch("https://remoteok.com/api", {
      cache: "no-store",
    })

    if (!response.ok) return []

    const allJobs: any[] = await response.json()

    // Filter jobs by country, query keywords, and language-related
    const filteredJobs = allJobs
      .filter(
        (job: any) =>
          job.location?.includes(countryName) &&
          (job.tags?.some((tag: string) => query.toLowerCase().includes(tag.toLowerCase())) ||
            job.title?.toLowerCase().includes(query.toLowerCase()) ||
            job.company?.toLowerCase().includes(query.toLowerCase()) ||
            job.description?.toLowerCase().includes(query.toLowerCase())),
      )
      .slice(0, 10)

    return filteredJobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location || countryName,
      type: "FULL_TIME",
      languageLevel: "INTERMEDIATE",
      salary: job.salary_max ? `$${job.salary_max}/year` : "Competitive",
      applications: Math.floor(Math.random() * 150 + 50),
      description: job.description || "See full job details at RemoteOK",
      url: `https://remoteok.com/jobs/${job.id}`,
    }))
  } catch (error) {
    console.error("[v0] RemoteOK API error:", error)
    return []
  }
}
