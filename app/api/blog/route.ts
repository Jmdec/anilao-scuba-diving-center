import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    //  Updated endpoint to match Laravel routes and added better error handling
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, {
      method: "POST",
      headers: {
        Authorization: request.headers.get("Authorization") || "",
        // Don't set Content-Type for FormData - let browser set it with boundary
      },
      body: formData,
    })

    const contentType = response.headers.get("content-type")
    let data

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      // If response is not JSON (likely HTML error page), get text content
      const textContent = await response.text()
      console.error("Non-JSON response received:", textContent)
      data = { message: "Server returned non-JSON response", details: textContent }
    }

    if (!response.ok) {
      console.error("Backend error:", data)
      return NextResponse.json(
        { success: false, message: data.message || "Failed to create blog", error: data },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Blog created successfully",
      blog: data.blog,
    })
  } catch (error) {
    console.error("Error creating blog:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error", 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const status = searchParams.get("status") || ""
    const page = searchParams.get("page") || "1"

    const queryParams = new URLSearchParams({
      ...(search && { search }),
      ...(category && { category }),
      ...(status && { status }),
      page,
    })

    //  Updated endpoint and added better error logging
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: request.headers.get("Authorization") || "",
        "Content-Type": "application/json",
      },
    })

    const contentType = response.headers.get("content-type")
    let data

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      const textContent = await response.text()
      console.error("Non-JSON response received:", textContent)
      data = { message: "Server returned non-JSON response", details: textContent }
    }

    if (!response.ok) {
      console.error("Backend error:", data)
      return NextResponse.json(
        { success: false, message: data.message || "Failed to fetch blogs", error: data },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      blogs: data.blogs || [],
      pagination: data.pagination,
      total: data.total,
    })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
