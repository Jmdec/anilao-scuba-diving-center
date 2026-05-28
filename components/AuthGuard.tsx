"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (!token || !user) {
      router.push("/login") // not logged in
      return
    }

    const parsedUser = JSON.parse(user)

    // ✅ Check if accessing /admin and role is not admin
    if (pathname.startsWith("/admin") && parsedUser.role !== "admin") {
      router.push("/") // redirect to home or unauthorized page
      return
    }

    setLoading(false)
  }, [router, pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-cyan-700 font-medium">Checking authentication...</p>
      </div>
    )
  }

  return <>{children}</>
}
