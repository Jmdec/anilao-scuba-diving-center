import { type NextRequest, NextResponse } from "next/server"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.LARAVEL_API_URL

export async function GET() {
  try {
    if (!LARAVEL_API_URL) {
      console.error("[v0] NEXT_PUBLIC_API_URL or LARAVEL_API_URL not configured")
      return NextResponse.json(
        {
          success: false,
          message: "Backend API URL not configured",
        },
        { status: 500 },
      )
    }

    console.log(`[v0] Fetching rooms from Laravel backend: ${LARAVEL_API_URL}/rooms`)

    const response = await fetch(`${LARAVEL_API_URL}/rooms`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.error(`[v0] Laravel API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        {
          success: false,
          message: `Backend API error: ${response.status}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`[v0] Successfully fetched ${data.rooms?.length || 0} rooms from Laravel`)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error connecting to Laravel backend:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to backend API",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!LARAVEL_API_URL) {
      console.error("[v0] NEXT_PUBLIC_API_URL or LARAVEL_API_URL not configured")
      return NextResponse.json(
        {
          success: false,
          message: "Backend API URL not configured",
        },
        { status: 500 },
      )
    }

    const formData = await request.formData()

    const isAvailable = formData.get("is_available")
    if (isAvailable !== null) {
      formData.set("is_available", isAvailable === "true" ? "1" : "0")
    }

    console.log("[v0] Creating new room via Laravel backend with FormData")

    const response = await fetch(`${LARAVEL_API_URL}/rooms`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    })

    if (!response.ok) {
      console.error(`[v0] Laravel API error: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error(`[v0] Laravel error response:`, errorText)

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: "Unknown error" }
      }

      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            message: "The route rooms could not be found.",
            hint: "Check if your Laravel server is running and the API routes are properly defined",
          },
          { status: 404 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          message: errorData.message || `Backend API error: ${response.status}`,
          errors: errorData.errors || undefined,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`[v0] Successfully created room via Laravel: ${data.room?.name}`)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating room via Laravel backend:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to backend API",
        hint: "Make sure your Laravel server is running and accessible",
      },
      { status: 500 },
    )
  }
}
