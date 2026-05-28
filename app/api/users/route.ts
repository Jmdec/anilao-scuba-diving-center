import { NextResponse } from "next/server"

const LARAVEL_API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.LARAVEL_API_URL

export async function GET() {
  try {
    if (!LARAVEL_API_URL) {
      console.error("[users] API URL not configured")
      return NextResponse.json(
        {
          success: false,
          message: "Backend API URL not configured",
        },
        { status: 500 }
      )
    }

    console.log(`[users] Fetching users from Laravel: ${LARAVEL_API_URL}/users`)

    const response = await fetch(`${LARAVEL_API_URL}/users`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.error(`[users] Laravel API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        {
          success: false,
          message: `Backend API error: ${response.status}`,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`[users] Successfully fetched ${data.users?.length || 0} users`)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[users] Error connecting to Laravel backend:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to backend API",
      },
      { status: 500 }
    )
  }
}
