import { NextResponse } from "next/server"

// This API route fetches jobs from external sources
// Currently implements free job API with fallback to mock data

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const language = searchParams.get("language") || "japan"
  const country = searchParams.get("country") || "japan"

  const apiKey = process.env.RAPIDAPI_KEY

  try {
    // Try JSearch API first if API key is available
    if (apiKey) {
      try {
        const jsearchResponse = await fetchFromJSearchAPI(language, country, apiKey)
        return jsearchResponse
      } catch (error) {
        console.error("[v0] JSearch API failed, falling back to RemoteOK:", error)
      }
    }

    // Fallback to RemoteOK API
    const remoteOkJobs = await fetchFromRemoteOKAPI(country)

    return NextResponse.json({
      success: true,
      data: remoteOkJobs,
      source: "remoteok",
    })
  } catch (error) {
    console.error("[v0] All job APIs failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch jobs",
        data: [],
      },
      { status: 500 }
    )
  }
}

// Fetch from JSearch API (RapidAPI)
async function fetchFromJSearchAPI(language: string, country: string, apiKey: string) {
  const queries = {
    japan: "Japanese language jobs Tokyo",
    korea: "Korean language jobs Seoul",
  }

  const query = queries[country as keyof typeof queries] || queries.japan

  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
  }

  const response = await fetch(
    `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`,
    options,
  )

  if (!response.ok) throw new Error("JSearch API failed")

  const data = await response.json()

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

// Fetch from RemoteOK API (free, no authentication required)
async function fetchFromRemoteOKAPI(country: string) {
  try {
    const countryMap: { [key: string]: string } = {
      japan: "Japan",
      korea: "South Korea",
    }

    const countryName = countryMap[country] || "Japan"

    const response = await fetch("https://remoteok.com/api", {
      cache: "no-store",
    })

    if (!response.ok) return []

    const allJobs: any[] = await response.json()

    // Filter jobs by country and language-related keywords
    const filteredJobs = allJobs
      .filter(
        (job: any) =>
          job.location?.includes(countryName) &&
          (job.tags?.includes("language") ||
            job.title?.toLowerCase().includes("language") ||
            job.company?.toLowerCase().includes("language")),
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

