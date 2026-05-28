"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Heart, Bookmark, Eye, Calendar, Clock, Tag } from "lucide-react"

interface BlogPost {
  id: number
  title: string
  description: string
  content: string | null
  category: string
  video_url: string | null
  thumbnail_url: string | null
  duration: string | null
  views: number
  likes: number
  comments_count: number
  status: string
  created_at: string
  updated_at: string
}

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  useEffect(() => {
    if (params.id) {
      const likedVideos = JSON.parse(localStorage.getItem("likedVideos") || "[]")
      setIsLiked(likedVideos.includes(params.id.toString()))
    }
  }, [params.id])

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) {
          throw new Error("API URL not configured")
        }

        const response = await fetch(`${apiUrl}/blogs/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch blog")
        }

        const data = await response.json()
        setBlog(data.blog || data)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load blog")
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBlog()
    }
  }, [params.id])

  const getFullUrl = (url: string | null) => {
    if (!url) return null
    if (url.startsWith("http")) return url
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) return url

    const baseUrl = apiUrl.replace("/api", "").replace(/\/$/, "") // Remove trailing slash
    const cleanUrl = url.startsWith("/") ? url : `/${url}` // Ensure leading slash
    const fullUrl = `${baseUrl}${cleanUrl}`

    // Debug logging to see what URLs are being generated
    console.log("[v0] Original URL:", url)
    console.log("[v0] API URL:", apiUrl)
    console.log("[v0] Base URL:", baseUrl)
    console.log("[v0] Clean URL:", cleanUrl)
    console.log("[v0] Full URL:", fullUrl)

    return fullUrl
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCategory = (category: string) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      "scuba-diving": "bg-blue-500/20 text-blue-300 border-blue-500/30",
      freediving: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      "underwater-photography": "bg-purple-500/20 text-purple-300 border-purple-500/30",
      "marine-life": "bg-green-500/20 text-green-300 border-green-500/30",
      "dive-sites": "bg-teal-500/20 text-teal-300 border-teal-500/30",
      "diving-equipment": "bg-orange-500/20 text-orange-300 border-orange-500/30",
      "diving-safety": "bg-red-500/20 text-red-300 border-red-500/30",
      "diving-courses": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    }
    return colors[category as keyof typeof colors] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
  }

  const handleLike = async () => {
    if (!blog || isLiking || isLiked) return

    setIsLiking(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) {
        throw new Error("API URL not configured")
      }

      const response = await fetch(`${apiUrl}/blogs/${blog.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to update like")
      }

      const data = await response.json()

      const likedVideos = JSON.parse(localStorage.getItem("likedVideos") || "[]")
      likedVideos.push(blog.id.toString())
      localStorage.setItem("likedVideos", JSON.stringify(likedVideos))

      // Update the blog state with new like count
      setBlog((prev) => (prev ? { ...prev, likes: data.likes || prev.likes + 1 } : null))
      setIsLiked(true)
    } catch (err) {
      console.error("[v0] Like error:", err)
      // Revert optimistic update on error
    } finally {
      setIsLiking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-100 to-cyan-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-700 text-lg">Loading video...</p>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-100 to-cyan-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <p className="text-red-400 text-lg mb-4">{error || "Video not found"}</p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-cyan-500 text-cyan-700 hover:bg-cyan-100"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-100 to-cyan-200">
      {/* Floating Bubbles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-600/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-cyan-200">
          <div className="container mx-auto px-4 py-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="text-cyan-700 hover:text-cyan-800 hover:bg-cyan-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Videos
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-cyan-300 shadow-lg">
                {blog.video_url ? (
                  <video
                    controls
                    poster={getFullUrl(blog.thumbnail_url) || "/video-thumbnail.png"}
                    className="w-full h-full object-cover cursor-pointer"
                    preload="metadata"
                    style={{ zIndex: 10, position: "relative" }}
                    onError={(e) => {
                      console.error("[v0] Video failed to load:", getFullUrl(blog.video_url))
                      const videoElement = e.currentTarget as HTMLVideoElement
                      if (videoElement.error) {
                        console.error("[v0] Video error:", videoElement.error.message)
                      }
                    }}
                    onClick={(e) => {
                      console.log("[v0] Video clicked")
                      const video = e.currentTarget as HTMLVideoElement
                      if (video.paused) {
                        video.play().catch((err) => console.error("[v0] Play failed:", err))
                      } else {
                        video.pause()
                      }
                    }}
                  >
                    <source src={getFullUrl(blog.video_url) || undefined} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-200">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
                      <p className="text-cyan-700">Video not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <Card className="bg-white/80 backdrop-blur-sm border-cyan-300 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">{blog.title}</h1>
                      <Badge className={`${getCategoryColor(blog.category)} border`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {formatCategory(blog.category)}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 mb-6">
                    <Button
                      onClick={handleLike}
                      disabled={isLiking || isLiked}
                      variant="outline"
                      className={`border-cyan-400 ${isLiked ? "bg-red-100 text-red-600" : "text-cyan-700"} hover:bg-cyan-100 disabled:opacity-50`}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                      {isLiked ? "Liked" : "Like"} ({blog.likes})
                    </Button>
                    <Button
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      variant="outline"
                      className={`border-cyan-400 ${isBookmarked ? "bg-cyan-100 text-cyan-700" : "text-cyan-700"} hover:bg-cyan-100`}
                    >
                      <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                      Save
                    </Button>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <p className="text-gray-800 text-lg leading-relaxed">{blog.description}</p>

                    {blog.content && (
                      <div className="prose prose-gray max-w-none">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{blog.content}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-cyan-300 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Eye className="w-4 h-4 mr-2 text-cyan-600" />
                        Views
                      </div>
                      <span className="text-gray-900 font-medium">{blog.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Heart className="w-4 h-4 mr-2 text-red-500" />
                        Likes
                      </div>
                      <span className="text-gray-900 font-medium">{blog.likes.toLocaleString()}</span>
                    </div>
                    {blog.duration && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-blue-500" />
                          Duration
                        </div>
                        <span className="text-gray-900 font-medium">{blog.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-green-500" />
                        Status
                      </div>
                      <Badge
                        className={`${
                          blog.status === "published"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : blog.status === "draft"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                              : "bg-gray-100 text-gray-700 border-gray-300"
                        } border`}
                      >
                        {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-cyan-300 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <div className="flex items-center text-gray-600 mb-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          Published
                        </div>
                        <p className="text-gray-900 font-medium">{formatDate(blog.created_at)}</p>
                      </div>
                    </div>
                    {blog.updated_at !== blog.created_at && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="flex items-center text-gray-600 mb-1">
                            <Calendar className="w-4 h-4 mr-2" />
                            Last Updated
                          </div>
                          <p className="text-gray-900 font-medium">{formatDate(blog.updated_at)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-30px) rotate(120deg); }
          66% { transform: translateY(-60px) rotate(240deg); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  )
}
