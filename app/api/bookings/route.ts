import { NextResponse } from "next/server"

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL

    if (!backendUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "NEXT_PUBLIC_API_URL environment variable is not set. Please add it in Project Settings.",
          bookings: [],
        },
        { status: 500 },
      )
    }

    const response = await fetch(`${backendUrl}/bookings`, {
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
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error calling Laravel API:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to Laravel backend",
        error: error instanceof Error ? error.message : "Unknown error",
        bookings: [],
      },
      { status: 500 },
    )
  }
}
