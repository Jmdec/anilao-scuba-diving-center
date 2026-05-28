import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    console.log("[v0] Auth header:", authHeader ? "Present" : "Missing")
    console.log("[v0] Token extracted:", token ? "Present" : "Missing")

    if (!token) {
      return NextResponse.json({ success: false, message: "Authorization token required" }, { status: 401 })
    }

    console.log("[v0] Making request to Laravel API:", `${process.env.NEXT_PUBLIC_API_URL}/profile`)
    console.log("[v0] Request body:", JSON.stringify(body, null, 2))

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        phone: body.phone,
        emergency_contact_name: body.emergency_contact_name,
        emergency_contact_phone: body.emergency_contact_phone,
        medical_conditions: body.medical_conditions,
        diving_experience: body.diving_experience,
        current_certification_level: body.current_certification_level,
      }),
    })

    const data = await response.json()

    console.log("[v0] Laravel response status:", response.status)
    console.log("[v0] Laravel response data:", JSON.stringify(data, null, 2))

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to update profile",
          errors: data.errors,
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: data.user,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
