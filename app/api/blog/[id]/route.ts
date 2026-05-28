import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    //  Updated endpoint to match Laravel routes
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${params.id}`, {
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
      data = { message: "Server returned non-JSON response" }
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Blog not found" },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      blog: data.blog,
    })
  } catch (error) {
    console.error("Error fetching blog:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()

    //  Fixed PUT request to use proper method and removed Content-Type header for FormData
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${params.id}`, {
      method: "POST", // Laravel expects POST with _method=PUT for file uploads
      headers: {
        Authorization: request.headers.get("Authorization") || "",
      },
      body: (() => {
        // Add _method field for Laravel to recognize this as PUT request
        formData.append('_method', 'PUT')
        return formData
      })(),
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
      console.error("Update error:", data)
      return NextResponse.json(
        { success: false, message: data.message || "Failed to update blog", error: data },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Blog updated successfully",
      blog: data.blog,
    })
  } catch (error) {
    console.error("Error updating blog:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    //  Updated endpoint to match Laravel routes
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${params.id}`, {
      method: "DELETE",
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
      data = { message: "Server returned non-JSON response" }
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to delete blog" },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting blog:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
