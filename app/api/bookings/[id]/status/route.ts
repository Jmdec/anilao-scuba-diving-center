import { type NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bookingId } = await params;
    const { status } = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!backendUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "NEXT_PUBLIC_API_URL environment variable is not set",
        },
        { status: 500 },
      );
    }

    const validStatuses = ["confirmed", "cancelled", "completed", "pending"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status",
        },
        { status: 400 },
      );
    }

    const authHeader = request.headers.get("authorization");
    const cookie = request.headers.get("cookie");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    if (cookie) {
      headers.Cookie = cookie;
    }

    // Log the URL to verify it's correct
    const url = `${backendUrl}/bookings/${bookingId}/status`;
    console.log("[bookings] PUT URL:", url, "status:", status);

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("[bookings] Backend error response:", errorText);
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully",
      booking: data.booking || data,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update booking status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
