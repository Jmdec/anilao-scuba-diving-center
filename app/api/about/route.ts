import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";
const PUBLIC_IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_API_URL;

function rewriteImageUrl(url: unknown): string {
  if (typeof url !== "string") return "";
  if (!PUBLIC_IMAGE_BASE) return url;
  try {
    const parsed = new URL(url);
    return `${PUBLIC_IMAGE_BASE.replace(/\/$/, "")}${parsed.pathname}`;
  } catch {
    return url.startsWith("/")
      ? `${PUBLIC_IMAGE_BASE.replace(/\/$/, "")}${url}`
      : url;
  }
}

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/about`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Backend returned an error" },
        { status: response.status },
      );
    }

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: "Backend reported failure" },
        { status: 500 },
      );
    }

    if (!data.data) {
      return NextResponse.json({
        success: true,
        data: {
          title: "About Us",
          slug: "about-us",
          stories: [],
          values: [],
          teamMembers: [],
          storyImages: [],
        },
      });
    }

    const raw = data.data;

    const normalized = {
      title: raw.title ?? "About Us",
      slug: raw.slug ?? "about-us",
      stories: Array.isArray(raw.stories) ? raw.stories : [],
      values: Array.isArray(raw.values) ? raw.values : [],
      teamMembers: Array.isArray(raw.teamMembers) ? raw.teamMembers : [],
      storyImages: Array.isArray(raw.storyImages)
        ? raw.storyImages.map(rewriteImageUrl)
        : [],
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error("[about/route] GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load about data" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    if (!payload || Array.isArray(payload)) {
      return NextResponse.json(
        { success: false, message: "Invalid about payload" },
        { status: 400 },
      );
    }

    const response = await fetch(`${BACKEND_URL}/about`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to save",
          errors: data.errors ?? undefined,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[about/route] POST failed:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
