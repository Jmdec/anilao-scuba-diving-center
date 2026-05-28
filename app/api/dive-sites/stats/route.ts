import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// GET /api/dive-sites/stats - Get dive site statistics from Laravel backend
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/dive-sites/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Laravel API responded with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: data.success,
      stats: data.data,
    })
  } catch (error) {
    console.error("Error fetching dive site stats from Laravel:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics from backend",
      },
      { status: 500 },
    )
  }
}
