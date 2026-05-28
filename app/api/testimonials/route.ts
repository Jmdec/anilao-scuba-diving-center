import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { name, email, rating, testimonial } = body

    if (!name || !email || !rating || !testimonial) {
      return NextResponse.json({ message: "Name, email, rating, and testimonial are required" }, { status: 400 })
    }

    // Validate rating is between 1-5
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Please provide a valid email address" }, { status: 400 })
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL not configured")
      return NextResponse.json({ message: "API configuration error" }, { status: 500 })
    }

    // Send to Laravel backend
    const response = await fetch(`${apiUrl}/testimonials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        location: body.location || null,
        diving_experience: body.diving_experience || null,
        rating: Number.parseInt(rating),
        testimonial,
        course_taken: body.course_taken || null,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Failed to submit testimonial" }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: "Testimonial submitted successfully",
      data: data.data,
    })
  } catch (error) {
    console.error("Testimonial API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      return NextResponse.json({ message: "API configuration error" }, { status: 500 })
    }

    // Fetch approved testimonials from Laravel backend
    const response = await fetch(`${apiUrl}/testimonials?status=approved&limit=10`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Failed to fetch testimonials" }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      testimonials: data.data || [],
    })
  } catch (error) {
    console.error("Testimonials fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
