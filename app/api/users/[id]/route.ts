import { NextRequest, NextResponse } from "next/server"

const LARAVEL_API_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.LARAVEL_API_URL

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!LARAVEL_API_URL) {
      return NextResponse.json(
        { success: false, message: "Backend API URL not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()

    console.log(`[users] Updating user ${params.id} with`, body)

    const response = await fetch(`${LARAVEL_API_URL}/users/${params.id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[users] Laravel API error: ${errorText}`)
      return NextResponse.json(
        {
          success: false,
          message: `Backend API error: ${response.status}`,
          error: errorText,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[users] Error updating user:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    )
  }
}
