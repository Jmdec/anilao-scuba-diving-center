"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Clock, Users, MapPin } from 'lucide-react'
import DiverLoader from "@/components/diver-loader"
import { Footer } from "@/components/footer"

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  current_certification_level: string
}

interface Certificate {
  id: number
  name: string
  level: string
  duration_days: number
  price: number
  prerequisites: string[]
  description: string
  min_age: number
  max_depth: number
  image?: string
}

export default function CertificationPage() {
  const [user, setUser] = useState<User | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setIsLoadingCertificates(true)
        const response = await fetch("/api/certificate")
        const data = await response.json()

        if (response.ok && data.success) {
          setCertificates(data.certifications || [])
        } else {
          console.error("Failed to fetch certificates:", data.message)
          toast({
            title: "Error",
            description: "Failed to load certifications. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching certificates:", error)
        toast({
          title: "Error",
          description: "Failed to load certifications. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCertificates(false)
      }
    }

    fetchCertificates()
  }, [])

  //  Updated to navigate to detail page instead of showing modal
  const handleCourseSelect = (course: Certificate) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply for certification.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    router.push(`/certification/${course.id}`)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "Intermediate":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Advanced":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Professional":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isLoadingCertificates) {
    return <DiverLoader message="Loading Certifications..." size="lg" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-blue-100 flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-cyan-800 mb-4">Diving Certification Courses</h2>
          <p className="text-lg text-cyan-700">Advance your diving skills with professional training</p>
          {user && (
            <p className="text-sm text-cyan-600 mt-2">
              Your current level: {(user.current_certification_level || "beginner").replace("-", " ").toUpperCase()}
            </p>
          )}
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-cyan-700 mb-2">No certifications available</h3>
            <p className="text-cyan-600">Check back later for new certification courses.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {certificates.map((course) => (
              <Card
                key={course.id}
                className="group relative overflow-hidden border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => handleCourseSelect(course)}
              >
                {course.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"}/${course.image}`}
                      alt={course.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge className={`text-xs font-medium ${getLevelColor(course.level)}`}>
                        {course.level}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg mb-1 drop-shadow-md">{course.name}</h3>
                      <div className="flex items-center gap-3 text-white/90 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration_days} days
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.min_age}+
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-cyan-700">
                      ₱{Number(course.price).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {course.max_depth}m depth
                    </div>
                  </div>

                  {/*  Shortened description preview */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                    {course.description.substring(0, 80)}...
                  </p>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCourseSelect(course)
                    }}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    View Details & Apply
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
