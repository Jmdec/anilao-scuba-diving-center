import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const response = await fetch(`${API_BASE_URL}/dive-sites/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: "Dive site not found" },
          { status: 404 },
        );
      }
      throw new Error(`Laravel API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: data.success,
      diveSite: data.data,
    });
  } catch (error) {
    console.error("Error fetching dive site from Laravel:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dive site from backend" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const formData = await request.formData();

    const processedFormData = new FormData();

    // Add method spoofing for Laravel — this is the key fix
    processedFormData.append("_method", "PUT");

    for (const [key, value] of formData.entries()) {
      if (key === "visibility") {
        processedFormData.append(
          key,
          Number.parseInt(value as string).toString(),
        );
      } else if (key === "is_featured" || key === "is_active") {
        const boolValue = value === "true" || value === "1";
        processedFormData.append(key, boolValue ? "1" : "0");
      } else if (
        key === "depth_min" ||
        key === "depth_max" ||
        key === "sort_order"
      ) {
        const numValue = Number.parseInt(value as string);
        processedFormData.append(
          key,
          isNaN(numValue) ? "0" : numValue.toString(),
        );
      } else {
        processedFormData.append(key, value);
      }
    }

    // Use POST instead of PUT so FormData works with Laravel
    const response = await fetch(`${API_BASE_URL}/dive-sites/${params.id}`, {
      method: "POST",
      body: processedFormData,
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: "Dive site not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to update dive site",
          errors: data.errors || {},
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: data.success,
      diveSite: data.data,
      message: data.message,
    });
  } catch (error) {
    console.error("Error updating dive site via Laravel:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update dive site in backend" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const response = await fetch(`${API_BASE_URL}/dive-sites/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: "Dive site not found" },
          { status: 404 },
        );
      }
      throw new Error(`Laravel API responded with status: ${response.status}`);
    }

    return NextResponse.json({
      success: data.success,
      message: data.message,
    });
  } catch (error) {
    console.error("Error deleting dive site via Laravel:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete dive site from backend" },
      { status: 500 },
    );
  }
}
