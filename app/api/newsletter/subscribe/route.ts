import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Valid email address is required" }, { status: 400 })
    }

    // Get Laravel backend URL
    const laravelApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

    // Send subscription request to Laravel backend
    const response = await fetch(`${laravelApiUrl}/newsletter/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Subscription failed" }, { status: response.status })
    }

    return NextResponse.json({
      message: "Successfully subscribed to newsletter!",
      data: data.data,
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
