import { NextResponse } from "next/server"

export async function GET() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

    if (!API_BASE_URL) {
      return NextResponse.json(
        {
          success: false,
          message: "API_BASE_URL environment variable is not configured",
        },
        { status: 500 },
      )
    }

    const response = await fetch(`${API_BASE_URL}/certification-applications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.log("[v0] Laravel API error:", response.status, response.statusText)
      throw new Error(`Laravel API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[v0] Fetched applications data:", data)

    return NextResponse.json({
      success: true,
      applications: data.data || data.applications || data,
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch applications",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
