import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// GET - Fetch all certificates
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/certifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Fixed response mapping to match Laravel API structure
    return NextResponse.json({
      success: data.success,
      certifications: data.certifications || [], // Laravel returns "certifications" key
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch certificates",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST - Create new certificate (store method)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    console.log("[v0] Sending request to:", `${API_BASE_URL}/certifications`)
    console.log("[v0] FormData entries:")
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, typeof value === "string" ? value : `[File: ${value.constructor.name}]`)
    }

    const response = await fetch(`${API_BASE_URL}/certifications`, {
      method: "POST",
      body: formData, // Send FormData directly to Laravel
    })

    console.log("[v0] Laravel response status:", response.status)
    console.log("[v0] Laravel response headers:", Object.fromEntries(response.headers.entries()))

    const contentType = response.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")

    let data
    if (isJson) {
      data = await response.json()
    } else {
      // Laravel returned HTML error page instead of JSON
      const htmlText = await response.text()
      console.error("[v0] Laravel returned HTML instead of JSON:")
      console.error("[v0] Status:", response.status)
      console.error("[v0] Content-Type:", contentType)
      console.error("[v0] HTML Response (first 500 chars):", htmlText.substring(0, 500))

      const errorMatch = htmlText.match(/<title>(.*?)<\/title>/i)
      const errorTitle = errorMatch ? errorMatch[1] : "Unknown Laravel Error"

      return NextResponse.json(
        {
          success: false,
          message: `Laravel Error: ${errorTitle}`,
          error: `HTTP ${response.status} - Check Laravel logs. Possible issues: database connection, missing table/columns, or PHP errors`,
          debug: {
            contentType,
            htmlPreview: htmlText.substring(0, 200),
          },
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
          message: data.message || "Failed to create certificate",
          errors: data.errors || null,
        },
        { status: response.status },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: data.message || "Certificate created successfully",
        certificate: data.certification || data.data,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Certificate creation error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create certificate",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
