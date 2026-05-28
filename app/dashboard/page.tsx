"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Hotel,
  Award,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  User,
  BookOpen,
  Waves,
  Trophy,
  Clock,
  ChevronRight,
  Activity,
} from "lucide-react"

interface DashboardUser {
  id: number
  name: string
  lastName: string
  email: string
  role: string
  current_certification_level: string
}

interface UserCertification {
  id: number
  certificate_id: number
  status: "pending" | "approved" | "ongoing" | "completed" | "cancelled" | "rejected"
  applied_at: string
  certificate: {
    id: number
    name: string
    level: string
    image?: string
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [userCertifications, setUserCertifications] = useState<UserCertification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    try {
      setUser(JSON.parse(userData))
      fetchUserCertifications()
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const fetchUserCertifications = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/user-certifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Certifications response:", data)
        if (data.success) {
          setUserCertifications(data.certifications || [])
        }
      } else {
        console.error("[v0] Failed to fetch certifications:", response.status)
      }
    } catch (error) {
      console.error("Error fetching user certifications:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-cyan-700 font-medium">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const certificationLevel = (user.current_certification_level || "beginner").replace("-", " ").toUpperCase()
  const getCertificationColor = (level: string) => {
    if (level.includes("ADVANCED") || level.includes("RESCUE")) return "text-orange-600"
    if (level.includes("OPEN WATER")) return "text-blue-600"
    if (level.includes("DIVEMASTER") || level.includes("INSTRUCTOR")) return "text-purple-600"
    return "text-green-600"
  }

  const getProgressValue = (level: string) => {
    if (level.includes("BEGINNER")) return 20
    if (level.includes("OPEN WATER")) return 40
    if (level.includes("ADVANCED")) return 60
    if (level.includes("RESCUE")) return 80
    if (level.includes("DIVEMASTER") || level.includes("INSTRUCTOR")) return 100
    return 10
  }

  const pendingCertifications = userCertifications.filter((cert) => cert.status === "pending")
  const activeCertifications = userCertifications.filter(
    (cert) => cert.status === "approved" || cert.status === "ongoing" || cert.status === "completed",
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-200/30 to-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-200/30 to-cyan-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="mb-12">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-4 border-white/30 shadow-lg">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                    <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl lg:text-3xl font-bold mb-3">Welcome back, {user.name}! 🌊</h1>
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="w-6 h-6" />
                      <span className="text-lg font-semibold">Current Level:</span>
                      <Badge className="bg-white/20 text-white border-white/30 text-lg px-3 py-1">
                        {certificationLevel}
                      </Badge>
                    </div>
                    <div className="max-w-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress to Next Level</span>
                        <span className="text-sm">{getProgressValue(certificationLevel)}%</span>
                      </div>
                      <Progress value={getProgressValue(certificationLevel)} className="h-2 bg-white/20" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold">12</div>
                    <div className="text-sm opacity-90">Dives Logged</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold">{activeCertifications.length}</div>
                    <div className="text-sm opacity-90">Certifications</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Applications</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingCertifications.length}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Completed Courses</p>
                  <p className="text-2xl font-bold text-green-600">
                    {userCertifications.filter((cert) => cert.status === "completed").length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Next Dive</p>
                  <p className="text-lg font-bold text-blue-600">Tomorrow</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Waves className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Dive Hours</p>
                  <p className="text-2xl font-bold text-purple-600">48</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-cyan-50/50 backdrop-blur-sm hover:-translate-y-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                  <Hotel className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Starting from</div>
                  <div className="text-lg font-bold text-cyan-600">₱1,500</div>
                </div>
              </div>
              <CardTitle className="text-xl text-gray-800 group-hover:text-cyan-700 transition-colors">
                Book a Room
              </CardTitle>
              <CardDescription className="text-gray-600">Reserve your oceanfront accommodation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Experience luxury at our diving resort with stunning ocean views and easy access to the best dive sites.
              </p>
              <Link href="/booking">
                <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Available Rooms
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/50 backdrop-blur-sm hover:-translate-y-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Next Level</div>
                  <div className="text-lg font-bold text-orange-600">Advanced</div>
                </div>
              </div>
              <CardTitle className="text-xl text-gray-800 group-hover:text-orange-700 transition-colors">
                PADI Certification
              </CardTitle>
              <CardDescription className="text-gray-600">Advance your diving skills and knowledge</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Take your diving to the next level with our comprehensive PADI certification courses.
              </p>
              <Link href="/certification">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Apply for Certification
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/50 backdrop-blur-sm hover:-translate-y-2 md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                  <User className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Profile</div>
                  <div className="text-lg font-bold text-purple-600">85% Complete</div>
                </div>
              </div>
              <CardTitle className="text-xl text-gray-800 group-hover:text-purple-700 transition-colors">
                Your Profile
              </CardTitle>
              <CardDescription className="text-gray-600">Manage your account and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Update your personal information, view certifications, and track your diving progress.
              </p>
              <Link href="/profile">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group">
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Certifications */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <MapPin className="w-5 h-5 text-cyan-600" />
                Recent Dive Sites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Sombrero Island", "Beatrice Rock", "Cathedral Rock"].map((site, index) => (
                  <div
                    key={site}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-700">{site}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{(4.5 + index * 0.2).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Award className="w-5 h-5 text-orange-600" />
                Your Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userCertifications.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No certifications yet</p>
                    <p className="text-sm text-gray-400">Apply for your first certification!</p>
                  </div>
                ) : (
                  userCertifications.slice(0, 3).map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {cert.certificate.image && (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${cert.certificate.image}`}
                            alt={cert.certificate.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-700">{cert.certificate.name}</div>
                          <div className="text-sm text-gray-500">{cert.certificate.level}</div>
                        </div>
                      </div>
                      <Badge
                        className={
                          cert.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : cert.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : cert.status === "ongoing"
                                ? "bg-purple-100 text-purple-800"
                                : cert.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : cert.status === "cancelled"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-red-100 text-red-800"
                        }
                      >
                        {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                      </Badge>
                    </div>
                  ))
                )}
                {userCertifications.length > 3 && (
                  <Link href="/profile">
                    <Button variant="ghost" className="w-full text-cyan-600 hover:text-cyan-700">
                      View All Certifications
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
