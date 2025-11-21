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
}

// This API route fetches jobs from external APIs
// Uses JSearch API with fallback to RemoteOK

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get("country") || "japan"

  const apiKey = process.env.RAPIDAPI_KEY

  try {
    let jobs = []
    let source = ""

    // Try JSearch API first if API key is available
    if (apiKey) {
      try {
        const jsearchResponse = await fetchFromJSearchAPI(country, apiKey)
        const jsearchData = await jsearchResponse
        if (jsearchData.success && jsearchData.data.length > 0) {
          jobs = jsearchData.data
          source = "jsearch"
        } else {
          throw new Error("No jobs from JSearch")
        }
      } catch (error) {
        console.error("[v0] JSearch API failed, falling back to RemoteOK:", error)
        // Fallback to RemoteOK API (limited search capability)
        const remoteOkJobs = await fetchFromRemoteOKAPI(country)
        jobs = remoteOkJobs
        source = "remoteok"
      }
    } else {
      // No API key, use RemoteOK
      const remoteOkJobs = await fetchFromRemoteOKAPI(country)
      jobs = remoteOkJobs
      source = "remoteok"
    }

    
    // If no jobs are found, return an empty array
    if (jobs.length === 0) {
      console.log(`[v0] No jobs found for country: ${country}`)
    }


    return NextResponse.json({
      success: true,
      data: jobs,
      source: source,
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

// Fetch from JSearch API (RapidAPI) with country filter
async function fetchFromJSearchAPI(country: string, apiKey: string) {
  const countryCodes = {
    japan: "JP",
    korea: "KR",
    uk: "GB",
    us: "US",
    australia: "AU",
  }

  const countryCode = countryCodes[country as keyof typeof countryCodes] || "US"

  const options: RequestInit = {
    method: "GET",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
  }


  let query = '';

  switch (country) {
    case 'korea':
      query = 'developer jobs in South Korea';
      break;
    case 'uk':
      query = 'developer jobs in United Kingdom';
      break;
    case 'australia':
      query = 'developer jobs in Australia';
      break;
    default:
      query = 'developer';
  }


  const response = await fetch(
    `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&country=${encodeURIComponent(countryCode)}&page=1&num_pages=1`,
    options,
  )

  if (!response.ok) throw new Error("JSearch API failed")

  const data = await response.json()

  let transformedJobs =
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

  // For Korea, filter to only South Korea jobs
  if (country === 'korea') {
    transformedJobs = transformedJobs.filter((job: Job) =>
      job.location.toLowerCase().includes('south korea') || job.location.toLowerCase().includes('seoul')
    )
  }

  return {
    success: true,
    data: transformedJobs,
    source: "jsearch",
  }
}

// Fetch from RemoteOK API with basic filtering (limited search)
async function fetchFromRemoteOKAPI(country: string) {
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

    // Filter jobs by country, excluding North Korea
    const filteredJobs = allJobs
      .filter((job: Job) =>
        countryNames.some(name =>
          job.location?.toLowerCase().includes(name.toLowerCase())
        ) && !job.location?.toLowerCase().includes('north')
      )
      .slice(0, 10)

    if (country === 'korea') {
      console.log(`[RemoteOK] Filtered jobs for korea:`, filteredJobs.map(j => j.location))
    }

    console.log(`[RemoteOK] Filtered to ${filteredJobs.length} jobs for country: ${country}`)

    return filteredJobs.map((job: Job) => ({
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
  } catch (error) {
    console.error("[v0] RemoteOK API error:", error)
    return []
  }
}
