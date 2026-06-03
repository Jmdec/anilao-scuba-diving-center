import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";
const PUBLIC_IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_API_URL;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const response = await fetch(`${BACKEND_URL}/upload-image`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });

    const text = await response.text();

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      console.error(
        "[upload-image] Non-JSON backend response:",
        text.slice(0, 300),
      );
      return NextResponse.json(
        {
          success: false,
          message: `Backend error (${response.status}) — check Laravel logs`,
        },
        { status: 502 },
      );
    }

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          message: (data.message as string) || "Upload failed",
        },
        { status: response.status },
      );
    }

    // Rewrite image URL to use NEXT_PUBLIC_IMAGE_API_URL as base
    const rawUrl = data.url;
    if (typeof rawUrl === "string" && PUBLIC_IMAGE_BASE) {
      try {
        const parsed = new URL(rawUrl);
        data.url = `${PUBLIC_IMAGE_BASE.replace(/\/$/, "")}${parsed.pathname}`;
      } catch {
        if (rawUrl.startsWith("/")) {
          data.url = `${PUBLIC_IMAGE_BASE.replace(/\/$/, "")}${rawUrl}`;
        }
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[upload-image] failed:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 },
    );
  }
}
