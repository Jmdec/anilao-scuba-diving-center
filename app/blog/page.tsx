"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Play, Eye, Heart, Search, Calendar, Waves, Fish, Camera, Anchor, Sparkles } from "lucide-react"
import { Footer } from "@/components/footer"

interface VideoPost {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  duration: string
  views: number
  likes: number
  comments: number
  category: string
  publishedAt: string
  featured: boolean
}

type CategoryFilter =
  | "all"
  | "scuba-diving"
  | "freediving"
  | "underwater-photography"
  | "marine-life"
  | "dive-sites"
  | "diving-equipment"
  | "diving-safety"
  | "diving-courses"

const VideoBlogPage = () => {
  const [videos, setVideos] = useState<VideoPost[]>([])
  const [filteredVideos, setFilteredVideos] = useState<VideoPost[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const videosPerPage = 12

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) {
          throw new Error("API URL not configured")
        }

        const response = await fetch(`${apiUrl}/blogs`)

        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.status}`)
        }

        const data = await response.json()
        console.log("[v0] API Response:", data)

        const blogsArray = data.blogs || data || []

        const transformedVideos: VideoPost[] = blogsArray
          .filter((blog: any) => blog.status === "published")
          .map((blog: any) => ({
            id: blog.id.toString(),
            title: blog.title || "Untitled Video",
            description: blog.description || "No description available",
            thumbnail: blog.thumbnail_url
              ? `${apiUrl.replace("/api", "")}${blog.thumbnail_url}`
              : "/video-thumbnail.png",
            videoUrl: blog.video_url ? `${apiUrl.replace("/api", "")}${blog.video_url}` : "#",
            duration: blog.duration || "0:00",
            views: blog.views || 0,
            likes: blog.likes || 0,
            comments: blog.comments_count || 0,
            category: blog.category || "scuba-diving",
            publishedAt: blog.created_at || new Date().toISOString(),
            featured: blog.featured === 1 || blog.featured === true || false,
          }))

        console.log("[v0] Transformed videos:", transformedVideos)
        setVideos(transformedVideos)
        setFilteredVideos(transformedVideos)
      } catch (err) {
        console.error("[v0] Error fetching videos:", err)
        setError(err instanceof Error ? err.message : "Failed to load videos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideos()
  }, [])

  // Filter and search functionality
  useEffect(() => {
    let filtered = videos

    if (selectedCategory !== "all") {
      filtered = filtered.filter((video) => video.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredVideos(filtered)
    setCurrentPage(1)
  }, [selectedCategory, searchQuery, videos])

  const categories = [
    { key: "all", label: "All Videos", count: videos.length },
    { key: "scuba-diving", label: "Scuba Diving", count: videos.filter((v) => v.category === "scuba-diving").length },
    { key: "freediving", label: "Freediving", count: videos.filter((v) => v.category === "freediving").length },
    {
      key: "underwater-photography",
      label: "Photography",
      count: videos.filter((v) => v.category === "underwater-photography").length,
    },
    { key: "marine-life", label: "Marine Life", count: videos.filter((v) => v.category === "marine-life").length },
    { key: "dive-sites", label: "Dive Sites", count: videos.filter((v) => v.category === "dive-sites").length },
    {
      key: "diving-equipment",
      label: "Equipment",
      count: videos.filter((v) => v.category === "diving-equipment").length,
    },
    { key: "diving-safety", label: "Safety", count: videos.filter((v) => v.category === "diving-safety").length },
    { key: "diving-courses", label: "Courses", count: videos.filter((v) => v.category === "diving-courses").length },
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      "scuba-diving": "bg-gradient-to-r from-cyan-400 to-blue-500 text-white",
      freediving: "bg-gradient-to-r from-green-400 to-green-500 text-white",
      "underwater-photography": "bg-gradient-to-r from-purple-400 to-purple-500 text-white",
      "marine-life": "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
      "dive-sites": "bg-gradient-to-r from-red-400 to-red-500 text-white",
      "diving-equipment": "bg-gradient-to-r from-gray-400 to-gray-500 text-white",
      "diving-safety": "bg-gradient-to-r from-pink-400 to-pink-500 text-white",
      "diving-courses": "bg-gradient-to-r from-teal-400 to-teal-500 text-white",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleVideoClick = (video: VideoPost) => {
    window.location.href = `/blog/${video.id}`
  }

  // Pagination
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage)
  const startIndex = (currentPage - 1) * videosPerPage
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + videosPerPage)
  const featuredVideos = videos.filter((video) => video.featured).slice(0, 3)

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 float-animation">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Failed to load videos</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/background-pattern.png')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100/90 via-cyan-50/95 to-blue-100/90" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-40 right-20 w-12 h-12 bg-blue-200/30 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-40 left-1/4 w-20 h-20 bg-cyan-300/20 rounded-full animate-bounce"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-60 right-1/3 w-8 h-8 bg-blue-300/40 rounded-full animate-pulse"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute bottom-20 right-10 w-14 h-14 bg-sky-200/30 rounded-full animate-bounce"
          style={{ animationDelay: "4s" }}
        />

        <div className="absolute top-32 left-1/3 animate-pulse" style={{ animationDelay: "0.5s" }}>
          <Sparkles className="w-6 h-6 text-cyan-400/60" />
        </div>
        <div className="absolute bottom-32 right-1/4 animate-pulse" style={{ animationDelay: "2.5s" }}>
          <Sparkles className="w-4 h-4 text-blue-400/60" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="text-center mb-20 relative">
          <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent mb-8 animate-pulse">
            Diving Stories
          </h1>

          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-2xl text-slate-700 leading-relaxed font-medium">
              Dive into the depths of the ocean through breathtaking videos, expert tutorials, and mesmerizing marine
              life documentaries
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-12">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Fish className="w-6 h-6 text-cyan-500 animate-bounce" />
              <span className="text-lg font-semibold text-slate-700">Marine Life</span>
            </div>
            <div
              className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ animationDelay: "1s" }}
            >
              <Camera className="w-6 h-6 text-blue-500 animate-bounce" />
              <span className="text-lg font-semibold text-slate-700">Photography</span>
            </div>
            <div
              className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ animationDelay: "2s" }}
            >
              <Anchor className="w-6 h-6 text-indigo-500 animate-bounce" />
              <span className="text-lg font-semibold text-slate-700">Adventures</span>
            </div>
          </div>
        </div>

        {featuredVideos.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-4 rounded-full shadow-xl">
                <div className="w-3 h-10 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full animate-pulse"></div>
                <h2 className="text-4xl font-bold text-slate-800">Featured Depths</h2>
                <Waves className="w-8 h-8 text-cyan-500 animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto">
              {featuredVideos.map((video, index) => (
                <Card
                  key={video.id}
                  className={`group cursor-pointer hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 border-0 overflow-hidden bg-white/95 backdrop-blur-sm hover:bg-white ${
                    index === 0 ? "lg:col-span-8 lg:row-span-2" : index === 1 ? "lg:col-span-4" : "lg:col-span-4"
                  } rounded-3xl shadow-xl`}
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                        index === 0 ? "h-96" : "h-56"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/40 transition-all duration-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 bg-white/95 rounded-full flex items-center justify-center group-hover:scale-125 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500 shadow-2xl">
                        <Play className="w-10 h-10 ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-bold text-sm px-4 py-2 shadow-lg rounded-full">
                        ⭐ Featured
                      </Badge>
                    </div>
                    <div className="absolute bottom-6 right-6">
                      <Badge className="bg-black/90 text-white border-0 font-medium px-3 py-1 rounded-full">
                        {video.duration}
                      </Badge>
                    </div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className={`font-bold mb-3 ${index === 0 ? "text-3xl" : "text-xl"}`}>{video.title}</h3>
                      <div className="flex items-center gap-6 text-sm opacity-90">
                        <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <Eye className="w-4 h-4" />
                          {formatNumber(video.views)}
                        </span>
                        <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <Heart className="w-4 h-4" />
                          {formatNumber(video.likes)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mb-16">
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-500 w-6 h-6" />
              <Input
                placeholder="Search the depths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-16 h-16 border-0 focus:border-cyan-400 bg-white/90 backdrop-blur-sm text-xl rounded-2xl shadow-xl focus:shadow-2xl transition-all duration-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
            {categories.map((category, index) => {
              const icons = {
                all: Waves,
                "scuba-diving": Anchor,
                freediving: Fish,
                "underwater-photography": Camera,
                "marine-life": Fish,
                "dive-sites": Anchor,
                "diving-equipment": Anchor,
                "diving-safety": Heart,
                "diving-courses": Anchor,
              }
              const IconComponent = icons[category.key as keyof typeof icons] || Waves

              return (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.key as CategoryFilter)}
                  className={`flex flex-col items-center gap-3 h-auto py-6 px-4 rounded-2xl transition-all duration-300 ${
                    selectedCategory === category.key
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-xl scale-105 border-0"
                      : "bg-white/90 hover:bg-white text-slate-700 border-0 hover:shadow-lg hover:scale-105 backdrop-blur-sm"
                  }`}
                >
                  <IconComponent className={`w-6 h-6 ${selectedCategory === category.key ? "animate-bounce" : ""}`} />
                  <span className="text-sm font-semibold text-center leading-tight">{category.label}</span>
                  <Badge
                    className={`text-xs font-medium ${
                      selectedCategory === category.key ? "bg-white/30 text-white" : "bg-slate-100 text-slate-600"
                    } rounded-full px-2 py-1`}
                  >
                    {category.count}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-40 h-40 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-bounce">
              <Search className="w-16 h-16 text-cyan-500" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-4">No videos found in these depths</h3>
            <p className="text-slate-600 text-xl">Try adjusting your search or explore different categories</p>
          </div>
        ) : (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
              {paginatedVideos.map((video, index) => (
                <Card
                  key={video.id}
                  className="group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-white/95 backdrop-blur-sm overflow-hidden break-inside-avoid mb-8 rounded-3xl shadow-lg hover:bg-white"
                  onClick={() => handleVideoClick(video)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/30 transition-all duration-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="w-18 h-18 bg-white/95 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-7 h-7 text-cyan-500 ml-1" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-black/90 text-white border-0 text-sm font-medium px-3 py-1 rounded-full">
                        {video.duration}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <Badge
                      className={`mb-4 text-sm font-medium rounded-full px-3 py-1 ${getCategoryColor(video.category)}`}
                    >
                      {video.category
                        .split("-")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </Badge>
                    <h3 className="font-bold text-slate-800 mb-4 line-clamp-2 group-hover:text-cyan-600 transition-colors duration-300 text-xl leading-tight">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                          <Eye className="w-4 h-4" />
                          {formatNumber(video.views)}
                        </span>
                        <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                          <Heart className="w-4 h-4" />
                          {formatNumber(video.likes)}
                        </span>
                      </div>
                      <span className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(video.publishedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-16">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-white/90 border-0 hover:bg-white hover:shadow-lg rounded-2xl px-6 py-3 text-lg font-semibold"
                >
                  ← Previous
                </Button>

                <div className="flex items-center gap-3">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                    if (pageNum > totalPages) return null
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="lg"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`rounded-2xl min-w-14 h-14 text-lg font-semibold ${
                          currentPage === pageNum
                            ? "bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-xl border-0"
                            : "bg-white/90 border-0 hover:bg-white hover:shadow-lg text-slate-700"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-white/90 border-0 hover:bg-white hover:shadow-lg rounded-2xl px-6 py-3 text-lg font-semibold"
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  )
}

export { VideoBlogPage }
export default VideoBlogPage
