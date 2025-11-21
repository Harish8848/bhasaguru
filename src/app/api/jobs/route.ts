import { NextResponse } from "next/server"
import { countryCodes, queries } from "@/lib/data"
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
        console.error("JSearch API failed:", error)
      }
    }

  } catch (error) {
    console.error(" All job APIs failed:", error)
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
  

  const query = queries[country as keyof typeof queries] || "jobs"
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
