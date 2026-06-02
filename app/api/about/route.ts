import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const aboutFilePath = path.join(process.cwd(), "data", "about.json");

async function readAboutData() {
    try {
        const raw = await fs.readFile(aboutFilePath, "utf-8");
        return JSON.parse(raw);
    } catch (error: any) {
        if (error.code === "ENOENT") return {};
        console.error("Failed to read about data:", error);
        return {};
    }
}

async function writeAboutData(data: unknown) {
    try {
        await fs.mkdir(path.dirname(aboutFilePath), { recursive: true });
        await fs.writeFile(
            aboutFilePath,
            JSON.stringify(data, null, 2),
            "utf-8"
        );
        return true;
    } catch (error) {
        console.error("Failed to write about data:", error);
        return false;
    }
}

export async function GET() {
    const data = await readAboutData();

    return NextResponse.json({
        success: true,
        data,
    });
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

        const saved = await writeAboutData(payload);

        if (!saved) {
            return NextResponse.json(
                { success: false, message: "Could not save about content" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "About content updated",
            data: payload,
        });
    } catch (error) {
        console.error("About save error:", error);

        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}