import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const role = req.cookies.get("role")?.value

  // If accessing /admin but not logged in or not admin
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!token || role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

// Only run middleware on these routes
export const config = {
  matcher: ["/admin/:path*"],
}
