import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status } = body

    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status value" }, { status: 400 })
    }

    // Forward request to Laravel backend using PATCH method
    const response = await fetch(`${API_BASE_URL}/testimonials/${params.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Forward authorization header if present
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization")!,
        }),
      },
      body: JSON.stringify({ status }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating testimonial status:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
