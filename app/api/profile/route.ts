import { type NextRequest, NextResponse } from "next/server"

interface User {
  id: number
  name: string
  email: string
}

interface Booking {
  id: number
  user_id: number
  room_id: number
  check_in_date: string
  check_out_date: string
  guests: number
  total_price: number
  special_requests?: string
  status: "confirmed" | "cancelled" | "completed"
  created_at: string
  updated_at: string
  room: {
    id: number
    name: string
    type: string
    price_per_night: number
    max_guests: number
    image_url?: string
    description?: string
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

    console.log("[v0] Getting user info from Laravel API")

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

    console.log("[v0] Fetching bookings for user ID:", user.id)

    // Then fetch bookings for that user
    const bookingsResponse = await fetch(`${LARAVEL_API_BASE}/bookings/user/${user.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!bookingsResponse.ok) {
      const errorData = await bookingsResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Failed to fetch bookings",
        },
        { status: bookingsResponse.status },
      )
    }

    const bookingsData = await bookingsResponse.json()
    console.log("[v0] Successfully fetched bookings from Laravel")

    return NextResponse.json({
      success: true,
      user: user,
      bookings: bookingsData.bookings || bookingsData.data || [],
    })
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to update profile" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

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

    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required",
        },
        { status: 422 },
      )
    }

    console.log("[v0] Cancelling booking via Laravel API")

    const response = await fetch(`${LARAVEL_API_BASE}/bookings/${bookingId}/cancel`, {
      method: "POST", // Laravel route uses POST for cancel
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Failed to cancel booking",
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      message: data.message || "Booking cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
