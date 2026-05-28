import { type NextRequest, NextResponse } from "next/server"

interface User {
  id: number
  name: string
  email: string
}

interface CertificationApplication {
  id: number
  user_id: number
  certification_id: number
  status: "pending" | "approved" | "ongoing" | "completed" | "cancelled" | "rejected"
  preferred_start_date: string
  diving_experience_years: number
  total_dives: number
  deepest_dive: number
  last_dive_date?: string
  medical_conditions?: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  payment_method: string
  screenshot_payment?: string
  instructor_notes?: string
  created_at: string
  updated_at: string
  certification: {
    id: number
    name: string
    level: string
    description: string
    prerequisites: string[]
    duration_days: number
    price: number
    min_age: number
    max_depth: number
    image?: string
  }
}

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token required",
        },
        { status: 401 },
      )
    }

    const token = authHeader.substring(7)

    console.log("[v0] Getting user certifications from Laravel API")

    // First get the authenticated user
    const userResponse = await fetch(`${LARAVEL_API_BASE}/auth/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Failed to get user info",
        },
        { status: userResponse.status },
      )
    }

    const userData = await userResponse.json()
    const user: User = userData.user || userData

    console.log("[v0] Fetching certifications for user ID:", user.id)

    // Then fetch certifications for that user
    const certificationsResponse = await fetch(`${LARAVEL_API_BASE}/certifications/user/${user.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!certificationsResponse.ok) {
      const errorData = await certificationsResponse.json().catch(() => ({}))
      console.log("[v0] Error response:", errorData)
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Failed to fetch certifications",
        },
        { status: certificationsResponse.status },
      )
    }

    const certificationsData = await certificationsResponse.json()
    console.log("[v0] Raw certifications data:", certificationsData)

    const allApplications: CertificationApplication[] = certificationsData.applications || certificationsData.data || []

    const filteredCertifications = allApplications
      .filter((app) => app.status === "pending" || app.status === "ongoing" || app.status === "completed")
      .map((app) => ({
        id: app.id,
        certificate_id: app.certification_id,
        status: app.status,
        applied_at: app.created_at,
        certificate: {
          id: app.certification.id,
          name: app.certification.name,
          level: app.certification.level,
          image: app.certification.image,
          price: app.certification.price,
          duration_days: app.certification.duration_days,
        },
      }))

    console.log("[v0] Filtered certifications:", filteredCertifications)

    return NextResponse.json({
      success: true,
      certifications: filteredCertifications,
    })
  } catch (error) {
    console.error("[v0] Error fetching user certifications:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
