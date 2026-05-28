"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight, Star, MapPin, Eye, Waves, Fish, Search, Filter, Calendar, Users, Camera } from "lucide-react"

// Define DiveSite interface
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

export default function DiveSitesPage() {
  const [diveSites, setDiveSites] = useState<DiveSite[]>([])
  const [filteredSites, setFilteredSites] = useState<DiveSite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return "/placeholder.svg?key=87zpt"

    // If it's already a full URL, return as is
    if (imagePath.startsWith("http")) return imagePath

    // Construct URL using Laravel backend URL
    const apiUrl = process.env.NEXT_PUBLIC_IMAGE_API_URL || "http://localhost:8000"
    return `${apiUrl}/uploads/dive-sites/${imagePath}`
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "intermediate":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "advanced":
        return "bg-rose-100 text-rose-800 border-rose-300"
      default:
        return "bg-slate-100 text-slate-800 border-slate-300"
    }
  }

  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case "beginner":
        return "🟢"
      case "intermediate":
        return "🟡"
      case "advanced":
        return "🔴"
      default:
        return "⚪"
    }
  }

  useEffect(() => {
    const fetchDiveSites = async () => {
      try {
        setLoading(true)
        console.log("[v0] Fetching all dive sites...")

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        const response = await fetch(`${apiUrl}/dive-sites?active=1`)

        console.log("[v0] Response status:", response.status)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("[v0] API response data:", data)

        let sitesData = []
        if (Array.isArray(data)) {
          sitesData = data
        } else if (data.data && Array.isArray(data.data)) {
          sitesData = data.data
        } else if (data.success && data.data) {
          sitesData = data.data
        }

        console.log("[v0] Processed sites data:", sitesData)
        setDiveSites(sitesData)
        setFilteredSites(sitesData)
        setError(null)
      } catch (err) {
        console.error("[v0] Error fetching dive sites:", err)
        setError("Failed to load dive sites. Please check your backend connection.")
      } finally {
        setLoading(false)
      }
    }

    fetchDiveSites()
  }, [])

  // Filter and sort dive sites
  useEffect(() => {
    const filtered = diveSites.filter((site) => {
      const matchesSearch =
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.marine_life.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDifficulty = difficultyFilter === "all" || site.difficulty_level === difficultyFilter

      return matchesSearch && matchesDifficulty
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "difficulty":
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
          return difficultyOrder[a.difficulty_level] - difficultyOrder[b.difficulty_level]
        case "depth":
          return a.depth_min - b.depth_min
        case "featured":
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
        default:
          return 0
      }
    })

    setFilteredSites(filtered)
  }, [diveSites, searchTerm, difficultyFilter, sortBy])

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-blue-100">
      {/* <Navigation /> */}

      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-r from-cyan-600 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/ocean-waves-pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Waves className="h-10 w-10 text-white/80 mr-4" />
            <h1 className="text-5xl lg:text-6xl font-bold text-white">
              All Dive Sites in <span className="text-cyan-200">Anilao</span>
            </h1>
            <Waves className="h-10 w-10 text-white/80 ml-4" />
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
            Explore every underwater paradise that Anilao has to offer. From beginner-friendly shallow reefs to advanced
            deep-water adventures.
          </p>
          <div className="flex items-center justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Fish className="h-5 w-5" />
              <span>{diveSites.length} Dive Sites</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <span>World-Class Photography</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Expert Guides</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 bg-white/60 backdrop-blur-sm sticky top-0 z-40 border-b border-cyan-200/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-cyan-600" />
                <Input
                  placeholder="Search dive sites, locations, or marine life..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-3 border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-cyan-600" />
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-40 border-cyan-200 focus:border-cyan-400 rounded-xl">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">🟢 Beginner</SelectItem>
                    <SelectItem value="intermediate">🟡 Intermediate</SelectItem>
                    <SelectItem value="advanced">🔴 Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 border-cyan-200 focus:border-cyan-400 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="depth">Depth</SelectItem>
                  <SelectItem value="featured">Featured First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-center">
            <p className="text-cyan-700">
              Showing <span className="font-bold text-cyan-800">{filteredSites.length}</span> of{" "}
              <span className="font-bold text-cyan-800">{diveSites.length}</span> dive sites
            </p>
          </div>
        </div>
      </section>

      {/* Dive Sites Grid */}
      <section className="py-16 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-cyan-600 border-t-transparent mx-auto mb-6"></div>
                <p className="text-cyan-700 text-lg font-medium">Loading dive sites...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-10 max-w-md mx-auto shadow-lg">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <p className="text-red-700 mb-6 text-lg font-medium">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 px-6 py-3 rounded-full"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-white to-cyan-50 backdrop-blur-sm rounded-2xl p-16 max-w-md mx-auto border-2 border-cyan-200 shadow-lg">
                <Fish className="h-20 w-20 text-cyan-600 mx-auto mb-6" />
                <p className="text-cyan-700 text-xl font-medium mb-4">No dive sites found</p>
                <p className="text-cyan-600">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSites.map((site, index) => (
                <Link key={site.id} href={`/dive-sites/${site.id}`} className="block">
                  <Card className="group overflow-hidden border-0 hover:shadow-xl hover:shadow-blue-600/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 bg-white rounded-xl h-full">
                    <div className="relative overflow-hidden">
                      {/* Compact badge positioning */}
                      {site.is_featured && (
                        <div className="absolute top-2 left-2 z-20">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md rounded-full px-2 py-1 text-xs">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        </div>
                      )}

                      <div className="absolute top-2 right-2 z-20">
                        <Badge
                          className={`${getDifficultyColor(site.difficulty_level)} border-0 rounded-full px-2 py-1 font-medium text-xs`}
                        >
                          {getDifficultyIcon(site.difficulty_level)}
                        </Badge>
                      </div>

                      <img
                        src={getImageUrl(site.image) || "/placeholder.svg"}
                        alt={site.name}
                        className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 leading-tight line-clamp-1">
                          {site.name}
                        </h3>

                        <p className="text-slate-600 text-sm mb-3 leading-relaxed line-clamp-2">{site.description}</p>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Waves className="h-3 w-3 text-blue-600" />
                              <span className="text-slate-600 font-medium">
                                Depth:  {site.depth_min}-{site.depth_max}m
                              </span>
                            </div>
                            {site.visibility && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3 text-slate-400" />
                                <span className="text-xs text-slate-500">Visibility: {site.visibility}m</span>
                              </div>
                            )}
                          </div>

                          {site.best_time_to_visit && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-700 text-xs font-medium">
                                Best Time: {site.best_time_to_visit}
                              </span>
                            </div>
                          )}

                          {site.marine_life && (
                            <div className="flex items-start gap-2">
                              <Fish className="h-3 w-3 text-teal-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-teal-700 line-clamp-2 leading-relaxed">
                                Marine Life: {site.marine_life}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs font-medium truncate">{site.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 group-hover:text-blue-700 transition-colors">
                          <span className="text-xs font-semibold">Explore</span>
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/ocean-waves-pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold text-white mb-6">Ready to Dive?</h3>
            <p className="text-white/90 mb-10 text-xl leading-relaxed">
              Book your diving adventure today and explore the underwater wonders of Anilao with our expert guides.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <Button className="bg-white text-cyan-600 hover:bg-gray-100 px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group">
                  Book Diving Trip
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/certification">
                <Button
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-cyan-600 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 bg-transparent"
                >
                  Get Certified
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
