import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// GET - Fetch single certificate
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/certifications/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const contentType = response.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")

    let data
    if (isJson) {
      data = await response.json()
    } else {
      const htmlText = await response.text()
      console.error("[v0] Laravel returned HTML instead of JSON:", htmlText.substring(0, 200))

      return NextResponse.json(
        {
          success: false,
          message: "Server error: Laravel returned HTML error page instead of JSON response",
          error: `HTTP ${response.status} - Check Laravel logs for details`,
        },
        { status: 500 },
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Certificate not found",
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      certificate: data.certification || data.data,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch certificate",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// PUT - Update certificate
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()

    const response = await fetch(`${API_BASE_URL}/certifications/${params.id}`, {
      method: "POST", // Laravel uses POST with _method=PUT for FormData
      body: (() => {
        formData.append("_method", "PUT")
        return formData
      })(),
    })

    const contentType = response.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")

    let data
    if (isJson) {
      data = await response.json()
    } else {
      const htmlText = await response.text()
      console.error("[v0] Laravel returned HTML instead of JSON:", htmlText.substring(0, 200))

      return NextResponse.json(
        {
          success: false,
          message: "Server error: Laravel returned HTML error page instead of JSON response",
          error: `HTTP ${response.status} - Check Laravel logs for details`,
        },
        { status: 500 },
      )
    }

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            message: "Authentication required. Please check your Laravel routes configuration.",
            error: "Unauthorized access to admin routes",
          },
          { status: 401 },
        )
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            success: false,
            message: "Access forbidden. Admin routes require authentication.",
            error: "Forbidden access",
          },
          { status: 403 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to update certificate",
          errors: data.errors || null,
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Certificate updated successfully",
      certificate: data.certification || data.data,
    })
  } catch (error) {
    console.error("[v0] Certificate update error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update certificate",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete certificate
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/certifications/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const contentType = response.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")

    let data
    if (isJson) {
      data = await response.json()
    } else {
      const htmlText = await response.text()
      console.error("[v0] Laravel returned HTML instead of JSON:", htmlText.substring(0, 200))

      return NextResponse.json(
        {
          success: false,
          message: "Server error: Laravel returned HTML error page instead of JSON response",
          error: `HTTP ${response.status} - Check Laravel logs for details`,
        },
        { status: 500 },
      )
    }

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          {
            success: false,
            message: "Authentication required. Please check your Laravel routes configuration.",
            error: "Unauthorized access to admin routes",
          },
          { status: 401 },
        )
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            success: false,
            message: "Access forbidden. Admin routes require authentication.",
            error: "Forbidden access",
          },
          { status: 403 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          message: data.message || "Certificate not found",
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Certificate deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Certificate deletion error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete certificate",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
