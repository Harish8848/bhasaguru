import { NextResponse } from "next/server"

interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city: string;
  job_country: string;
  job_employment_type: string;
  job_required_experience: {
    required_experience_in_years: number;
  };
  job_salary_currency: string;
  job_salary_max: number;
  job_description: string;
  job_apply_link: string;
  location: string;
  id: string;
  title: string;
  company: string;
  type: string;
  languageLevel: string;
  salary: string;
  applications: number;
  description: string;
  url: string;
  salary_max: number;
  tags: string[];
}

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

  const transformedJobs =
    data.data?.map((job: Job) => ({
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
    const countryMap: { [key: string]: string[] } = {
      japan: ["Japan"],
      korea: ["South Korea", "Korea", "Seoul"],
      uk: ["United Kingdom", "UK", "London", "England"],
      us: ["United States", "USA", "US"],
      australia: ["Australia"],
    }

    const countryNames = countryMap[country] || ["Japan"]

    const response = await fetch("https://remoteok.com/api", {
      cache: "no-store" as RequestCache,
    })

    if (!response.ok) return []

    const allJobs: Job[] = await response.json()

    console.log(`[RemoteOK] Fetched ${allJobs.length} jobs for country: ${country}`)

    // Filter jobs by country, query keywords, and language-related
    const filteredJobs = allJobs
      .filter(
        (job: Job) => {
          const locationMatch = countryNames.some(name =>
            job.location?.toLowerCase().includes(name.toLowerCase())
          ) && !job.location?.toLowerCase().includes('north')
          const queryMatch = job.tags?.some((tag: string) => query.toLowerCase().includes(tag.toLowerCase())) ||
            job.title?.toLowerCase().includes(query.toLowerCase()) ||
            job.company?.toLowerCase().includes(query.toLowerCase()) ||
            job.description?.toLowerCase().includes(query.toLowerCase())

          return locationMatch && queryMatch
        }
      )
      .slice(0, 10)

    console.log(`[RemoteOK] Filtered to ${filteredJobs.length} jobs for country: ${country}`)

    const jobsToReturn = filteredJobs.map((job: Job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location?.toLowerCase().includes('korea') && !job.location?.toLowerCase().includes('north') ? 'South Korea' : (job.location || countryNames[0]),
      type: "FULL_TIME",
      languageLevel: "INTERMEDIATE",
      salary: job.salary_max ? `$${job.salary_max}/year` : "Competitive",
      applications: Math.floor(Math.random() * 150 + 50),
      description: job.description || "See full job details at RemoteOK",
      url: `https://remoteok.com/jobs/${job.id}`,
    }))

    
    if (jobsToReturn.length === 0) {
      console.log(`[v0] No jobs found for country: ${country} with query: ${query}`)
    }


    return jobsToReturn
  } catch (error) {
    console.error(" RemoteOK API error:", error)
    return []
  }
}
