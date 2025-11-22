import { NextResponse } from "next/server"

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  languageLevel: string
  salary: string
  applications: number
  description: string
  url: string
  tags?: string[]
  salary_max?: number
}

// MAIN SEARCH HANDLER
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || ""
  const country = searchParams.get("country")?.toLowerCase() || "japan"

  if (!query.trim()) {
    return NextResponse.json({
      success: false,
      error: "Query is required",
      data: [],
    }, { status: 400 })
  }

 

  try {
    // Only RemoteOK because JSearch is not subscribed
    const results = await fetchFromRemoteOK(query, country)

    return NextResponse.json({
      success: true,
      source: "RemoteOK",
      total: results.length,
      data: results,
    })
  } catch (err) {
    console.error("[Search] Fatal error:", err)
    return NextResponse.json({
      success: false,
      data: [],
      error: "Search failed",
    }, { status: 500 })
  }
}

// REMOTEOK SEARCH FUNCTION
async function fetchFromRemoteOK(query: string, country: string) {
  const response = await fetch("https://remoteok.com/api", {
    cache: "no-store",
    headers: { "Content-Type": "application/json" }
  })

  if (!response.ok) {
    console.error("[RemoteOK] API Error:", response.status)
    return []
  }

  let data = await response.json()

  // Remove the first metadata object
  data = data.filter((job: any) => job.position)

  console.log(`[RemoteOK] Fetched ${data.length} total jobs`)

  // Improved keyword mapping
  const map: Record<string, string[]> = {
    japan: ["japan", "tokyo", "osaka", "kyoto", "asia", "apac"],
    korea: ["korea", "south korea", "seoul", "busan", "asia", "apac"],
    australia: ["australia", "sydney", "melbourne", "brisbane", "apac"],
    uk: ["united kingdom", "london", "england", "europe"],
    us: ["united states", "usa", "us", "remote"],
  }

  const keywords = map[country] || []
  const q = query.toLowerCase()

  const filtered = data.filter((job: any) => {
    const loc = job.location?.toLowerCase() || ""
    const tags = Array.isArray(job.tags) ? job.tags.join(" ").toLowerCase() : ""
    const title = job.position?.toLowerCase() || ""
    const company = job.company?.toLowerCase() || ""
    const desc = job.description?.toLowerCase() || ""

    const matchCountry = keywords.some(k =>
      loc.includes(k) || tags.includes(k) || title.includes(k)
    )

    const matchQuery =
      title.includes(q) ||
      company.includes(q) ||
      desc.includes(q) ||
      tags.includes(q)

    return matchCountry && matchQuery
  })

  console.log(`[RemoteOK] Filtered to ${filtered.length} matching jobs`)

  // If no results → return top 10 fallback
  const final = filtered.length > 0 ? filtered : data.slice(0, 10)

  return final.map((job: any) => ({
    id: String(job.id),
    title: job.position,
    company: job.company,
    location: job.location || "Remote / Global",
    type: "FULL_TIME",
    languageLevel: "INTERMEDIATE",
    salary: job.salary_max ? `$${job.salary_max}/year` : "Competitive",
    applications: Math.floor(Math.random() * 120 + 20),
    description: job.description,
    url: `https://remoteok.com/remote-jobs/${job.slug}`,
  }))
}