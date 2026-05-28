import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Get the authorization header from the request
    const authHeader = request.headers.get("authorization")

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

    const response = await fetch(`${API_BASE_URL}/certifications/apply`, {
      method: "POST",
      headers: {
        ...(authHeader && { Authorization: authHeader }),
        // Don't set Content-Type for FormData - let the browser set it with boundary
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Certification application failed",
          errors: data.errors || null,
        },
        { status: response.status },
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Certification application error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
