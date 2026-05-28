import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Failed to fetch bookings" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Get user bookings error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
