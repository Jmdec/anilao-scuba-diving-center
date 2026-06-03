import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function GET() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/about`, {
            cache: "no-store",
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: "Backend returned an error" },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Backend returns { success, data: { ... } } or { success, data: null }
        if (!data.success) {
            return NextResponse.json(
                { success: false, message: "Backend reported failure" },
                { status: 500 }
            );
        }

        // Handle null (no about page created yet)
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

        // Field names are confirmed from the Laravel controller.
        // Just guard each array in case Eloquent returns null.
        const normalized = {
            title:       raw.title                                          ?? "About Us",
            slug:        raw.slug                                           ?? "about-us",
            stories:     Array.isArray(raw.stories)     ? raw.stories      : [],
            values:      Array.isArray(raw.values)      ? raw.values       : [],
            teamMembers: Array.isArray(raw.teamMembers) ? raw.teamMembers  : [],
            storyImages: Array.isArray(raw.storyImages) ? raw.storyImages  : [],
        };

        return NextResponse.json({ success: true, data: normalized });
    } catch (error) {
        console.error("[about/route] GET failed:", error);
        return NextResponse.json(
            { success: false, message: "Failed to load about data" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        if (!payload || Array.isArray(payload)) {
            return NextResponse.json(
                { success: false, message: "Invalid about payload" },
                { status: 400 }
            );
        }

        const response = await fetch(`${BACKEND_URL}/api/about`, {
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
                    // Surface Laravel validation errors if present
                    errors: data.errors ?? undefined,
                },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[about/route] POST failed:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}