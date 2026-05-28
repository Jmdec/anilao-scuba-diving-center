"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"

export function ConditionalNavigation() {
  const pathname = usePathname()

  // Check if we are on an admin, login, register, or signup-required page
  const isAdminPage =
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard")
  const isAuthPage = pathname === "/login" || pathname === "/register"
  const isSignupRequiredPage = pathname === "/signup-required"

  // Base valid routes
  const validRoutes = [
    "/login",
    "/register",
    "/signup-required",
    "/certification",
    "/booking",
    "/blog",
    "/dive-sites",
  ]

  // Allow dynamic certification/[id] and booking/[id] routes
  const isCertificationPage =
    pathname === "/certification" || pathname.startsWith("/certification/")
  const isBookingPage = pathname === "/booking" || pathname.startsWith("/booking/")
  
  // Allow dynamic dive-sites/[id] route
  const isDiveSitePage = pathname === "/dive-sites" || pathname.startsWith("/dive-sites/")

  const isValidRoute =
    validRoutes.includes(pathname) ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    isCertificationPage ||
    isBookingPage ||
    isDiveSitePage

  const isNotFoundPage = !isValidRoute

  // If on an admin, auth, signup-required, or not-found page, don't show navigation
  if (isAdminPage || isAuthPage || isSignupRequiredPage || isNotFoundPage) {
    return null
  }

  return <Navigation />
}
