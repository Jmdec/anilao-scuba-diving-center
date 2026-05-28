import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params

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
    const response = await fetch(`${apiUrl}/testimonials/${id}`, {
      method: "PUT",
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
        status: body.status || "pending",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Failed to update testimonial" }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: "Testimonial updated successfully",
      data: data.data,
    })
  } catch (error) {
    console.error("Testimonial update API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL not configured")
      return NextResponse.json({ message: "API configuration error" }, { status: 500 })
    }

    // Send delete request to Laravel backend
    const response = await fetch(`${apiUrl}/testimonials/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Failed to delete testimonial" }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully",
    })
  } catch (error) {
    console.error("Testimonial delete API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      return NextResponse.json({ message: "API configuration error" }, { status: 500 })
    }

    // Fetch single testimonial from Laravel backend
    const response = await fetch(`${apiUrl}/testimonials/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ message: data.message || "Failed to fetch testimonial" }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      testimonial: data.data,
    })
  } catch (error) {
    console.error("Testimonial fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
