import { type NextRequest, NextResponse } from "next/server"

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.LARAVEL_API_URL

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const roomId = params.id
    console.log(`[v0] Fetching room ${roomId} from Laravel backend: ${LARAVEL_API_URL}/rooms/${roomId}`)

    const response = await fetch(`${LARAVEL_API_URL}/rooms/${roomId}`, {
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
          message: response.status === 404 ? "Room not found" : `Backend API error: ${response.status}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`[v0] Successfully fetched room: ${data.room?.name}`)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching room from Laravel backend:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to backend API",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const roomId = params.id
    const formData = await request.formData()

    const isAvailable = formData.get("is_available")
    if (isAvailable !== null) {
      formData.set("is_available", isAvailable === "true" ? "1" : "0")
    }

    formData.append("_method", "PUT")

    console.log(`[v0] Updating room ${roomId} via Laravel backend using POST with method override`)

    const response = await fetch(`${LARAVEL_API_URL}/rooms/${roomId}`, {
      method: "POST", // Changed from PUT to POST
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
    console.log(`[v0] Successfully updated room: ${data.room?.name}`)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating room via Laravel backend:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to backend API",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const roomId = params.id
    console.log(`[v0] Deleting room ${roomId} via Laravel backend`)

    const response = await fetch(`${LARAVEL_API_URL}/rooms/${roomId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
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

      return NextResponse.json(
        {
          success: false,
          message: errorData.message || `Backend API error: ${response.status}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`[v0] Successfully deleted room`)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error deleting room via Laravel backend:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to backend API",
      },
      { status: 500 },
    )
  }
}
