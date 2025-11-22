import { NextResponse } from "next/server"

async function fetchFromJSearchAPI(query: string, country: string, apiKey: string) {
  const countryMap: any = {
    japan: "JP",
    korea: "KR",
    uk: "GB",
    us: "US",
    australia: "AU",
  }

  const countryCode = countryMap[country] || "JP"

  const finalQuery = `${query} jobs in ${country}`

  const url = `https://jsearch.p.rapidapi.com/v2/search?query=${encodeURIComponent(
    finalQuery
  )}&country=${countryCode}&page=1&num_pages=1`

  console.log("[JSearch] Fetching:", url)

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
  })

  console.log("[JSearch] Status:", response.status)

  if (!response.ok) {
    console.error("[JSearch] Error:", await response.text())
    throw new Error("JSearch API failed")
  }

  const json = await response.json()

  return {
    success: true,
    source: "jsearch",
    data:
      json.data?.map((job: any) => ({
        id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        location: `${job.job_city}, ${job.job_country}`,
        type: job.job_employment_type || "FULL_TIME",
        salary: job.job_salary_max
          ? `${job.job_salary_currency} ${job.job_salary_max}`
          : "Competitive",
        description: job.job_description,
        applications: Math.floor(Math.random() * 200 + 50),
        url: job.job_apply_link,
      })) || [],
  }
}
// Improved RemoteOK Fetch
async function fetchFromRemoteOK(country: string) {
  const url = "https://remoteok.com/api"

  console.log("\n[RemoteOK] Fetching:", url)

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  if (!res.ok) throw new Error("RemoteOK API failed")

  let data = await res.json()

  // remove first metadata object
  data = data.filter((job: any) => job.position)

  console.log(`[RemoteOK] Fetched ${data.length} total jobs`)

  // NEW: Country mapping
  const matchMap: Record<string, string[]> = {
    japan: ["japan", "tokyo", "osaka", "kyoto", "asia", "apac"],
    korea: ["korea", "south korea", "seoul", "asia", "apac"],
    australia: ["australia", "sydney", "melbourne", "brisbane", "apac"],
    uk: ["united kingdom", "london", "england", "europe"],
    us: ["united states", "usa", "us", "remote"],
  }

  const keywords = matchMap[country.toLowerCase()] || []

  const filtered = data.filter((job: any) => {
    const loc = job.location?.toLowerCase() || ""
    const tags = job.tags?.join(" ").toLowerCase() || ""
    const title = job.position?.toLowerCase() || ""

    // match any keyword
    return keywords.some((key) =>
      loc.includes(key) || tags.includes(key) || title.includes(key)
    )
  })

  console.log(`[RemoteOK] Filtered to ${filtered.length} jobs for: ${country}`)

  // fallback if no result
  const finalResults = filtered.length > 0 ? filtered : data.slice(0, 10)

  return finalResults.map((job: any) => ({
    id: job.id,
    title: job.position,
    company: job.company,
    location: job.location || "Remote / Global",
    type: "full_time", // Default type
    languageLevel: "intermediate", // Default language level
    salary: "Competitive", // Default salary
    applications: Math.floor(Math.random() * 50) + 1, // Random applications count
    url: `https://remoteok.com/remote-jobs/${job.slug}`,
    source: "RemoteOK",
  }))
}


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const country = searchParams.get("country")?.toLowerCase() || "japan"



  try {
    const jobs = await fetchFromRemoteOK(country)

    return NextResponse.json({
      success: true,
      source: "RemoteOK",
      total: jobs.length,
      jobs,
    })
  } catch (err) {
    console.error("Failed →", err)

    return NextResponse.json({
      success: false,
      message: "Failed to load jobs from RemoteOK.",
      jobs: [],
    })
  }
}