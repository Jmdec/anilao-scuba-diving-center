import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const response = await fetch(`${BACKEND_URL}/api/upload-image`, {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: formData,
        });

        // Read as text first to safely handle HTML error pages
        const text = await response.text();

        let data: Record<string, unknown>;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("[upload-image] Non-JSON backend response:", text.slice(0, 300));
            return NextResponse.json(
                { success: false, message: `Backend error (${response.status}) — check Laravel logs` },
                { status: 502 }
            );
        }

        // app/api/upload-image/route.ts
        if (!response.ok || !data.success) {
            return NextResponse.json(
                { success: false, message: (data.message as string) || "Upload failed" },
                { status: response.status }
            );
        }

        // Rewrite relative → absolute using the server-side BACKEND_URL
        if (typeof data.url === "string" && data.url.startsWith("/")) {
            data.url = `${BACKEND_URL}${data.url}`;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[upload-image] failed:", error);
        return NextResponse.json(
            { success: false, message: "Upload failed" },
            { status: 500 }
        );
    }
}