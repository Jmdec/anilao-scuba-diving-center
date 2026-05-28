"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Waves, Eye, Calendar, Fish, Clock, Users, Star, Thermometer } from "lucide-react"
import Link from "next/link"

interface DiveSite {
  id: number
  name: string
  description: string
  image: string
  location: string
  depth_min: number
  depth_max: number
  difficulty_level: "beginner" | "intermediate" | "advanced"
  visibility: string
  best_time_to_visit: string
  marine_life: string
  is_featured: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export default function DiveSiteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [diveSite, setDiveSite] = useState<DiveSite | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return "/underwater-coral-reef-diving.png"
    if (imagePath.startsWith("http")) return imagePath
    const apiUrl = process.env.NEXT_PUBLIC_IMAGE_API_URL || "http://localhost:8000"
    return `${apiUrl}/uploads/dive-sites/${imagePath}`
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-emerald-700 bg-emerald-50 border-emerald-200"
      case "intermediate":
        return "text-amber-700 bg-amber-50 border-amber-200"
      case "advanced":
        return "text-red-700 bg-red-50 border-red-200"
      default:
        return "text-slate-700 bg-slate-50 border-slate-200"
    }
  }

  const getExpectationsForDiveSite = (diveSite: DiveSite) => {
    const expectations = []

    let duration = "45-60 minutes"
    if (diveSite.depth_max > 30) {
      duration = "25-35 minutes"
    } else if (diveSite.depth_max > 18) {
      duration = "35-45 minutes"
    } else if (diveSite.difficulty_level === "beginner") {
      duration = "45-60 minutes"
    }

    expectations.push({
      icon: Clock,
      title: "Dive Duration",
      value: duration,
    })

    let groupSize = "Max 8 divers"
    if (diveSite.difficulty_level === "advanced") {
      groupSize = "Max 4 divers"
    } else if (diveSite.difficulty_level === "intermediate") {
      groupSize = "Max 6 divers"
    }

    expectations.push({
      icon: Users,
      title: "Group Size",
      value: groupSize,
    })

    return expectations
  }

  useEffect(() => {
    const fetchDiveSite = async () => {
      try {
        setLoading(true)
        console.log("[v0] Fetching dive site with ID:", params.id)
        console.log("[v0] API URL will be:", `/api/dive-sites/${params.id}`)

        const response = await fetch(`/api/dive-sites/${params.id}`)
        console.log("[v0] Response status:", response.status)
        console.log("[v0] Response ok:", response.ok)

        if (!response.ok) {
          const errorText = await response.text()
          console.log("[v0] Error response text:", errorText)
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log("[v0] Full response data:", data)

        if (data.success && data.diveSite) {
          console.log("[v0] Setting dive site data:", data.diveSite)
          setDiveSite(data.diveSite)
          setError(null)
        } else {
          console.log("[v0] API returned success=false or no diveSite data")
          console.log("[v0] Data structure:", Object.keys(data))
          throw new Error(data.error || data.message || "Failed to fetch dive site")
        }
      } catch (err) {
        console.error("[v0] Error fetching dive site:", err)
        setError(err instanceof Error ? err.message : "Failed to load dive site details.")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchDiveSite()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg">Loading dive site details...</p>
        </div>
      </div>
    )
  }

  if (error || !diveSite) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="border border-red-200 rounded-lg p-8">
            <p className="text-red-600 mb-6 text-lg">{error || "Dive site not found"}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.back()} variant="outline" className="border-slate-300">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Link href="/">
                <Button>View All Sites</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200 sticky top-0 z-50 bg-white">
        <div className="container mx-auto px-6 py-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dive Sites
          </Button>
        </div>
      </div>

      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Main Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    className={`${getDifficultyColor(diveSite.difficulty_level)} border text-sm px-3 py-1 font-medium`}
                  >
                    {diveSite.difficulty_level.charAt(0).toUpperCase() + diveSite.difficulty_level.slice(1)}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">4.8</span>
                    <span>(124 reviews)</span>
                  </div>
                  {diveSite.is_featured && (
                    <Badge variant="secondary" className="text-sm">
                      Featured Site
                    </Badge>
                  )}
                </div>
              </div>

              {/* Title and Location */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">{diveSite.name}</h1>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">{diveSite.location}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <p className="text-slate-700 leading-relaxed text-lg">{diveSite.description}</p>
              </div>
            </div>

            {/* Image */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <img
                  src={
                    getImageUrl(diveSite.image) ||
                    "/placeholder.svg?height=400&width=600&query=underwater coral reef diving scene" ||
                    "/placeholder.svg"
                  }
                  alt={diveSite.name}
                  className="w-full h-80 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-y border-slate-200">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <Waves className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <p className="font-bold text-xl text-slate-900 mb-1">
                  {diveSite.depth_min}m - {diveSite.depth_max}m
                </p>
                <p className="text-slate-600">Depth Range</p>
              </div>
            </div>

            {diveSite.visibility && (
              <div className="text-center">
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <Eye className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <p className="font-bold text-xl text-slate-900 mb-1">{diveSite.visibility}m</p>
                  <p className="text-slate-600">Visibility</p>
                </div>
              </div>
            )}

            <div className="text-center">
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <p className="font-bold text-xl text-slate-900 mb-1">{diveSite.best_time_to_visit}</p>
                <p className="text-slate-600">Best Season</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <Thermometer className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <p className="font-bold text-xl text-slate-900 mb-1">26-28°C</p>
                <p className="text-slate-600">Water Temp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Marine Life Card */}
              <Card className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Fish className="h-6 w-6 text-white" />
                    </div>
                    Marine Life Encounters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {diveSite.marine_life.split(",").map((species, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
                      >
                        {species.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* What to Expect Card */}
              <Card className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900">What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getExpectationsForDiveSite(diveSite).map((expectation, index) => (
                      <div key={index} className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="bg-blue-600 p-2 rounded-lg">
                            <expectation.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">{expectation.title}</p>
                            <p className="text-slate-600">{expectation.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Dive Conditions Card */}
              <Card className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <div className="bg-slate-600 p-2 rounded-lg">
                      <Waves className="h-5 w-5 text-white" />
                    </div>
                    Dive Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-600">Current</span>
                      <span className="font-medium text-slate-900">Mild to Moderate</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-600">Entry Type</span>
                      <span className="font-medium text-slate-900">Boat Dive</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-600">Certification</span>
                      <Badge className={`${getDifficultyColor(diveSite.difficulty_level)} border`}>
                        {diveSite.difficulty_level.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
