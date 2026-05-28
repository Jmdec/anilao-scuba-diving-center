"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Users,
  Award,
  Waves,
  Fish,
  Camera,
  Video,
  Eye,
  Hotel,
  ArrowRight,
  GraduationCap,
  Clock,
  Sparkles,
} from "lucide-react"
import { Navigation } from "@/components//ui/navigation"
import { BubbleAnimation } from "@/components/ui/bubble-animation"
import { TestimonialsDisplay } from "@/components/testimonials-display"
import { TestimonialForm } from "@/components/testimonial-form"
import { Footer } from "@/components/footer"
import Link from "next/link"

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

// Define DiveSite interface locally without removed fields
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

export default function HomePage() {
  const [diveSites, setDiveSites] = useState<DiveSite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallbackData, setUsingFallbackData] = useState(false)

  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [certificatesLoading, setCertificatesLoading] = useState(true)

  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = useState("")

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [apiVideos, setApiVideos] = useState<VideoPost[]>([])
  const [isLoadingVideos, setIsLoadingVideos] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoadingVideos(true)
        setVideoError(null)

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
              : "/underwater-diving-video-thumbnail.png",
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
        setApiVideos(transformedVideos.slice(0, 6)) // Limit to 6 videos for slider
      } catch (err) {
        console.error("[v0] Error fetching videos:", err)
        setVideoError(err instanceof Error ? err.message : "Failed to load videos")
      } finally {
        setIsLoadingVideos(false)
      }
    }

    fetchVideos()
  }, [])

  const imageItems = [
    {
      src: "/underwater-coral-reef-diving-colorful-fish.png",
      title: "Coral Garden Paradise",
      description: "Explore vibrant coral formations teeming with marine life",
      badge: "Coral Reef",
      stats: { depth: "15-25m", visibility: "30m+", difficulty: "Beginner" },
    },
    {
      src: "/underwater-diving-scene-with-tropical-fish.png",
      title: "Tropical Fish Haven",
      description: "Swim alongside schools of colorful tropical fish",
      badge: "Marine Life",
      stats: { depth: "10-20m", visibility: "25m+", difficulty: "All Levels" },
    },
    {
      src: "/scuba-diver-exploring-coral-reef.png",
      title: "Deep Reef Exploration",
      description: "Discover the mysteries of Anilao's deeper reefs",
      badge: "Adventure",
      stats: { depth: "20-30m", visibility: "20m+", difficulty: "Advanced" },
    },
  ]

  const videoItems =
    apiVideos.length > 0
      ? apiVideos.map((video) => ({
          src: video.videoUrl,
          poster: video.thumbnail,
          title: video.title,
          description: video.description,
          badge: video.category
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          duration: video.duration,
          views: video.views,
          likes: video.likes,
        }))
      : [
          {
            src: "/IMG_9294.MP4",
            poster: "/underwater-diving-video-thumbnail-with-diver-explo.png",
            title: "Dive Into Adventure",
            description: "Experience the thrill of underwater exploration",
            badge: "Live Experience",
            duration: "2:30",
            views: 1200,
            likes: 89,
          },
          {
            src: "/underwater-diving-video-thumbnail.png",
            poster: "/diving-video-thumbnail-with-coral-reef.png",
            title: "Deep Sea Discovery",
            description: "Journey into the depths of Anilao's waters",
            badge: "Deep Dive",
            duration: "3:45",
            views: 850,
            likes: 67,
          },
          {
            src: "/scuba-diving-video-preview.png",
            poster: "/scuba-diver-exploring-coral-reef.png",
            title: "Marine Life Encounters",
            description: "Get up close with incredible sea creatures",
            badge: "Wildlife",
            duration: "4:12",
            views: 2100,
            likes: 156,
          },
        ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageItems.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageItems.length) % imageItems.length)
  }

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videoItems.length)
  }

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videoItems.length) % videoItems.length)
  }

  const mediaItems = [
    {
      type: "image",
      src: "/underwater-coral-reef-with-colorful-fish-and-marin.png",
      title: "Anilao's Coral Gardens",
      description: "Home to over 300 species of marine life",
      badge: "Marine Paradise",
      icon: Fish,
    },
    {
      type: "video",
      src: "/IMG_9294.MP4",
      poster: "/underwater-diving-video-thumbnail-with-diver-explo.png",
      title: "Dive Into Adventure",
      description: "Experience the thrill of underwater exploration",
      badge: "Live Experience",
      icon: Play,
    },
    {
      type: "image",
      src: "/underwater-coral-reef-anilao-diving.png",
      title: "Crystal Clear Waters",
      description: "Perfect visibility for underwater photography",
      badge: "Photo Paradise",
      icon: Eye,
    },
  ]

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length)
  }

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return "/underwater-coral-reef-diving.png"

    // If it's already a full URL, return as is
    if (imagePath.startsWith("http")) return imagePath

    // Construct URL using Laravel backend URL
    const apiUrl = process.env.NEXT_PUBLIC_IMAGE_API_URL || "http://localhost:8000"
    return `${apiUrl}/uploads/dive-sites/${imagePath}`
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-emerald-200/50"
      case "intermediate":
        return "bg-amber-100 text-amber-800 border-amber-300 shadow-amber-200/50"
      case "advanced":
        return "bg-rose-100 text-rose-800 border-rose-300 shadow-rose-200/50"
      default:
        return "bg-slate-100 text-slate-800 border-slate-300 shadow-slate-200/50"
    }
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

  useEffect(() => {
    const fetchDiveSites = async () => {
      try {
        setLoading(true)

        // Check if API URL is configured
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) {
          console.log("[v0] NEXT_PUBLIC_API_URL not configured, using demo data")

          setUsingFallbackData(true)
          setError(null)
          setLoading(false)
          return
        }

        console.log("[v0] Fetching dive sites from:", `${apiUrl}/dive-sites`)

        const response = await fetch(`${apiUrl}/dive-sites?featured=1&active=1`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

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

        if (sitesData.length > 0) {
          console.log("[v0] Using live data from API")
          setDiveSites(sitesData)
          setUsingFallbackData(false)
        } else {
          console.log("[v0] API returned empty data, using demo data")

          setUsingFallbackData(true)
        }

        setError(null)
      } catch (err) {
        console.log(
          "[v0] API connection failed, using demo data:",
          err instanceof Error ? err.message : "Unknown error",
        )

        setUsingFallbackData(true)
        setError(null) // Don't show error to user since we have fallback data
      } finally {
        setLoading(false)
      }
    }

    fetchDiveSites()
  }, [])

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setCertificatesLoading(true)
        const response = await fetch("/api/certificate")
        const data = await response.json()

        if (response.ok && data.success) {
          // Show only first 3 certifications for homepage preview
          setCertificates((data.certifications || []).slice(0, 3))
        } else {
          console.error("Failed to fetch certificates:", data.message)
        }
      } catch (error) {
        console.error("Error fetching certificates:", error)
      } finally {
        setCertificatesLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  const handleNewsletterSubscription = async (e: any) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setSubscriptionMessage("Please enter a valid email address")
      return
    }

    setIsSubscribing(true)
    setSubscriptionMessage("")

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubscriptionMessage("Thank you for subscribing! Check your email for confirmation.")
        setEmail("")
      } else {
        setSubscriptionMessage(data.message || "Subscription failed. Please try again.")
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error)
      setSubscriptionMessage("Network error. Please try again later.")
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-slate-900 via-blue-300 to-teal-300">
      {/* Navigation Header */}
      <Navigation />

      {/* Bubble Animation Background */}
      <BubbleAnimation />

      {/* Video Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/underwater-coral-reef-anilao-diving.png"
        >
          <source src="/IMG_9294.MP4" type="video/webm" />
          <source src="/IMG_9294.MP4" type="video/mp4" />
          {/* Fallback image */}
          <img
            src="/underwater-coral-reef-anilao-diving.png"
            alt="Underwater coral reef in Anilao"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Enhanced Ocean Overlay with animated waves */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-blue-900/40 to-teal-900/60" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-teal-900/80 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="wave-animation">
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-teal-300 mr-3 animate-pulse" />
                <span className="text-teal-200 text-sm sm:text-lg font-medium tracking-wider uppercase bg-slate-900/30 px-3 py-2 sm:px-4 rounded-full backdrop-blur-sm border border-teal-400/30">
                  World-Class Diving Experience
                </span>
                <Sparkles className="h-8 w-8 text-teal-300 ml-3 animate-pulse" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 sm:mb-8 leading-tight drop-shadow-2xl px-2">
                <span className="block sm:inline">Discover the</span>{" "}
                <span className="block sm:inline">Underwater World of</span>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 relative block sm:inline">
                  Anilao
                  <div className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-1 sm:h-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-full blur-sm"></div>
                </span>
              </h1>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-teal-100 max-w-4xl mx-auto mb-8 sm:mb-12 drop-shadow-lg leading-relaxed font-light bg-slate-900/20 p-4 sm:p-6 rounded-2xl backdrop-blur-sm border border-teal-400/20">
              Experience world-class diving with professional PADI certification courses and luxurious accommodation at
              the heart of the Philippines' diving capital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
              <Link href="/booking">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white px-12 py-6 text-xl font-semibold shadow-2xl hover:shadow-teal-600/40 transition-all duration-300 rounded-full border-2 border-teal-300/30 backdrop-blur-sm group transform hover:scale-105"
                >
                  <Hotel className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Book Your Stay
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/certification">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-teal-300 text-teal-100 hover:bg-teal-300 hover:text-slate-900 bg-slate-900/30 backdrop-blur-sm px-12 py-6 text-xl font-semibold shadow-2xl transition-all duration-300 rounded-full group transform hover:scale-105"
                >
                  <GraduationCap className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Get Certified
                </Button>
              </Link>
            </div>
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-4 sm:gap-8 text-teal-200 px-4">
              <div className="flex items-center gap-2 bg-slate-900/30 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm border border-teal-400/20">
                <Award className="h-4 sm:h-5 w-4 sm:w-5 text-teal-300" />
                <span className="text-xs sm:text-sm font-medium">PADI 5-Star Resort</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/30 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm border border-teal-400/20">
                <Users className="h-4 sm:h-5 w-4 sm:w-5 text-teal-300" />
                <span className="text-xs sm:text-sm font-medium">2000+ Happy Divers</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/30 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm border border-teal-400/20">
                <Star className="h-4 sm:h-5 w-4 sm:w-5 text-teal-300 fill-teal-300" />
                <span className="text-xs sm:text-sm font-medium">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
      </section>

      <section className="py-20 bg-gradient-to-b from-slate-900/95 via-teal-900/90 to-blue-900/95 backdrop-blur-sm relative border-t border-cyan-400/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold  mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
              Experience the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                Underwater Magic
              </span>
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl text-teal-100 max-w-4xl mx-auto mb-12 drop-shadow-lg leading-relaxed font-light bg-slate-900/20 p-6 rounded-2xl backdrop-blur-sm border border-teal-400/20">
              Immerse yourself in the breathtaking beauty of Anilao's marine life through our stunning image gallery and
              captivating video experiences
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Image Slider */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-secondary/20 rounded-xl border border-secondary/30">
                    <Camera className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-teal-300">Photo Gallery</h3>
                    <p className="text-md font-bold text-teal-300">Stunning underwater photography</p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-b from-teal-900/90 to-blue-900/90 backdrop-blur-sm relative border-t border-teal-400/20 group hover:shadow-primary/20 transition-all duration-500">
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={imageItems[currentImageIndex].src || "/placeholder.svg"}
                      alt={imageItems[currentImageIndex].title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                    {/* Navigation Arrows */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card backdrop-blur-sm p-3 rounded-full border border-border hover:border-primary/50 transition-all duration-300 group/btn"
                    >
                      <ChevronLeft className="h-5 w-5 text-foreground group-hover/btn:text-primary" />
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card backdrop-blur-sm p-3 rounded-full border border-border hover:border-primary/50 transition-all duration-300 group/btn"
                    >
                      <ChevronRight className="h-5 w-5 text-foreground group-hover/btn:text-primary" />
                    </button>

                    {/* Image Badge */}
                    <div className="absolute top-6 left-6">
                      <div className="flex items-center gap-2 bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/30">
                        <Camera className="h-4 w-4 text-primary-foreground" />
                        <span className="text-primary-foreground font-medium text-sm">
                          {imageItems[currentImageIndex].badge}
                        </span>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <h4 className="text-2xl font-bold text-teal-300 mb-2">{imageItems[currentImageIndex].title}</h4>
                      <p className="text-gray-200 text-lg">{imageItems[currentImageIndex].description}</p>
                    </div>
                  </div>

                  {/* Image Thumbnails */}
                  <div className="p-6 bg-gradient-to-b from-teal-900/90 to-blue-900/90 backdrop-blur-sm relative border-t border-teal-400/20">
                    <div className="flex items-center justify-center gap-3">
                      {imageItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative overflow-hidden rounded-lg transition-all duration-300 border-2 ${
                            index === currentImageIndex
                              ? "border-primary scale-110 shadow-lg shadow-primary/30"
                              : "border-border hover:border-primary/50 hover:scale-105"
                          }`}
                        >
                          <div className="w-16 h-10 relative">
                            <img
                              src={item.src || "/placeholder.svg"}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            {index === currentImageIndex && <div className="absolute inset-0 bg-primary/20" />}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Progress Indicators */}
                    <div className="flex justify-center mt-4 gap-2">
                      {imageItems.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            index === currentImageIndex ? "w-8 bg-primary" : "w-2 bg-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Slider */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-secondary/20 rounded-xl border border-secondary/30">
                    <Video className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-teal-300">Video Gallery</h3>
                    <p className="text-md font-bold text-teal-300">
                      {isLoadingVideos ? "Loading videos..." : "Immersive diving experiences"}
                    </p>
                  </div>
                </div>

                {videoError ? (
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-card border border-border p-8 text-center">
                    <div className="text-muted-foreground mb-4">
                      <Video className="h-12 w-12 mx-auto mb-2 opacity-50 text-teal-300" />
                      <p className="text-teal-300">Unable to load videos from server</p>
                      <p className="text-sm mt-2 text-teal-300">Showing sample content</p>
                    </div>
                  </div>
                ) : null}

                <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-card border border-border group hover:shadow-secondary/20 transition-all duration-500">
                  <div className="relative h-80 overflow-hidden">
                    {videoItems[currentVideoIndex].src.endsWith(".MP4") ||
                    videoItems[currentVideoIndex].src.includes("video") ? (
                      <video
                        key={currentVideoIndex}
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                        className="w-full h-full object-cover"
                        poster={videoItems[currentVideoIndex].poster}
                      >
                        <source src={videoItems[currentVideoIndex].src} type="video/mp4" />
                      </video>
                    ) : (
                      <div className="relative w-full h-full bg-slate-800 flex items-center justify-center">
                        <img
                          src={videoItems[currentVideoIndex].poster || "/placeholder.svg" || "/placeholder.svg"}
                          alt={videoItems[currentVideoIndex].title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                          <div className="bg-teal-300/90 backdrop-blur-sm p-4 rounded-full">
                            <Play className="h-8 w-8 text-teal-foreground" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                    {/* Navigation Arrows */}
                    <button
                      onClick={prevVideo}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card backdrop-blur-sm p-3 rounded-full border border-border hover:border-teal-300/50 transition-all duration-300 group/btn"
                    >
                      <ChevronLeft className="h-5 w-5 text-foreground group-hover/btn:text-teal-300" />
                    </button>

                    <button
                      onClick={nextVideo}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card backdrop-blur-sm p-3 rounded-full border border-border hover:border-teal-300/50 transition-all duration-300 group/btn"
                    >
                      <ChevronRight className="h-5 w-5 text-foreground group-hover/btn:text-teal-300" />
                    </button>

                    {/* Video Badge */}
                    <div className="absolute top-6 left-6">
                      <div className="flex items-center gap-2 bg-teal-300/90 backdrop-blur-sm px-4 py-2 rounded-full border border-teal-300/30">
                        <Video className="h-4 w-4 text-teal-foreground" />
                        <span className="text-teal-foreground font-medium text-sm">
                          {videoItems[currentVideoIndex].badge}
                        </span>
                      </div>
                    </div>

                    <div className="absolute top-6 right-6">
                      <div className="flex items-center gap-3">
                        {videoItems[currentVideoIndex].duration && (
                          <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-teal-300 text-sm font-medium">
                              {videoItems[currentVideoIndex].duration}
                            </span>
                          </div>
                        )}
                        {videoItems[currentVideoIndex].views && (
                          <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full">
                            <Eye className="h-3 w-3 text-teal-300" />
                            <span className="text-teal-300 text-sm font-medium">
                              {videoItems[currentVideoIndex].views > 1000
                                ? `${(videoItems[currentVideoIndex].views / 1000).toFixed(1)}K`
                                : videoItems[currentVideoIndex].views}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Video Thumbnails */}
                  <div className="p-6 bg-gradient-to-b from-teal-900/90 to-blue-900/90 backdrop-blur-sm relative border-t border-teal-400/20">
                    <div className="flex items-center justify-center gap-3">
                      {videoItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentVideoIndex(index)}
                          className={`relative overflow-hidden rounded-lg transition-all duration-300 border-2 ${
                            index === currentVideoIndex
                              ? "border-teal-300 scale-110 shadow-lg shadow-teal-300/30"
                              : "border-border hover:border-teal-300/50 hover:scale-105"
                          }`}
                        >
                          <div className="w-16 h-10 relative">
                            <img
                              src={item.poster || "/placeholder.svg"}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                              <Play className="h-3 w-3 text-teal-300" />
                            </div>
                            {index === currentVideoIndex && <div className="absolute inset-0 bg-teal-300/20" />}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Progress Indicators */}
                    <div className="flex justify-center mt-4 gap-2">
                      {videoItems.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            index === currentVideoIndex ? "w-8 bg-teal-300" : "w-2 bg-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-teal-900/90 to-blue-900/90 backdrop-blur-sm relative border-t border-teal-400/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-teal-100 mb-4">
              Professional{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                PADI Certification
              </span>
            </h2>
            <p className="text-xl text-teal-200 max-w-3xl mx-auto leading-relaxed">
              Advance your diving skills with our comprehensive certification courses led by experienced PADI
              instructors
            </p>
          </div>

          {certificatesLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-teal-400 border-t-transparent mx-auto mb-6"></div>
                <p className="text-teal-200 text-lg font-medium">Loading certification courses...</p>
              </div>
            </div>
          ) : certificates.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certificates.map((course) => (
                  <Link key={course.id} href={`/certification/${course.id}`} className="block">
                    <Card className="group overflow-hidden border-0 hover:shadow-2xl hover:shadow-teal-600/30 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-sm rounded-xl border border-teal-400/20 hover:border-teal-300/40">
                      {course.image && (
                        <div className="relative overflow-hidden -m-6 mb-0">
                          <img
                            src={`${
                              process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"
                            }/${course.image}`}
                            alt={course.name}
                            className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                          <div className="absolute top-6 right-7">
                            <Badge className={`text-xs font-medium ${getLevelColor(course.level)}`}>
                              {course.level}
                            </Badge>
                          </div>
                        </div>
                      )}

                      <CardContent className="p-5">
                        <h3 className="text-xl font-bold text-teal-100 group-hover:text-teal-300 transition-colors mb-2 leading-tight">
                          {course.name}
                        </h3>

                        <p className="text-teal-200 text-sm mb-4 leading-relaxed line-clamp-2 group-hover:text-teal-100 transition-colors">
                          {course.description.substring(0, 80)}...
                        </p>

                        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                          <div className="flex items-center gap-2 p-2 bg-teal-900/50 rounded-lg border border-teal-400/20">
                            <Clock className="h-3 w-3 text-teal-300" />
                            <div>
                              <div className="text-teal-300 font-medium">Duration</div>
                              <div className="text-teal-100 font-bold">{course.duration_days} days</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-2 bg-cyan-900/50 rounded-lg border border-cyan-400/20">
                            <Users className="h-3 w-3 text-cyan-300" />
                            <div>
                              <div className="text-cyan-300 font-medium">Min Age</div>
                              <div className="text-cyan-100 font-bold">{course.min_age}+</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-teal-400/20">
                          <div className="text-2xl font-bold text-teal-300">
                            ₱{Number(course.price).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 text-teal-300 group-hover:text-teal-100 transition-colors">
                            <span className="text-sm font-medium">Learn More</span>
                            <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-16">
                <Link href="/certification">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-10 py-4 text-lg rounded-full bg-gradient-to-r from-slate-800/80 to-blue-900/80 backdrop-blur-sm border-2 border-teal-300/50 text-teal-200 hover:bg-teal-300/20 hover:text-teal-100 hover:border-teal-300 shadow-2xl hover:shadow-teal-600/30 transition-all duration-300 group transform hover:scale-105"
                  >
                    <GraduationCap className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                    View All Certifications
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-sm rounded-2xl p-16 max-w-md mx-auto border-2 border-teal-400/30 shadow-2xl">
                <GraduationCap className="h-20 w-20 text-teal-300 mx-auto mb-6" />
                <p className="text-teal-200 text-xl font-medium">Certification courses coming soon!</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-blue-900/90 to-teal-900/90 backdrop-blur-sm relative border-t border-cyan-400/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-teal-100 mb-4">
              Top Dive Sites in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">Anilao</span>
            </h2>
            <p className="text-xl text-teal-200 max-w-3xl mx-auto leading-relaxed">
              Explore the most spectacular underwater destinations that make Anilao the diving capital of the
              Philippines
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-teal-400 border-t-transparent mx-auto mb-6"></div>
                <p className="text-teal-200 text-lg font-medium">Discovering amazing dive sites...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-red-900/80 to-red-800/80 border-2 border-red-400/30 rounded-2xl p-10 max-w-md mx-auto shadow-2xl backdrop-blur-sm">
                <div className="text-red-400 text-5xl mb-4">⚠️</div>
                <p className="text-red-200 mb-6 text-lg font-medium">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-400/50 text-red-200 hover:bg-red-400/20 px-6 py-3 rounded-full backdrop-blur-sm"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {diveSites.map((site, index) => (
                <Link key={site.id} href={`/dive-sites/${site.id}`} className="block">
                  <Card className="group overflow-hidden border-0 hover:shadow-2xl hover:shadow-teal-600/30 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-sm rounded-xl border border-teal-400/20 hover:border-teal-300/40">
                    <div className="relative overflow-hidden -m-6 mb-0">
                      <img
                        src={
                          getImageUrl(site.image) ||
                          "/placeholder.svg?height=200&width=400&query=underwater coral reef diving" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={site.name}
                        className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    </div>

                    <CardContent className="p-5">
                      <h3 className="text-xl font-bold text-teal-100 group-hover:text-teal-300 transition-colors mb-2 leading-tight">
                        {site.name}
                      </h3>

                      <p className="text-teal-200 text-sm mb-4 leading-relaxed line-clamp-1 group-hover:text-teal-100 transition-colors">
                        {site.description}
                      </p>

                      {/* Compact info grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                        <div className="flex items-center gap-2 p-2 bg-teal-900/50 rounded-lg border border-teal-400/20">
                          <Waves className="h-3 w-3 text-teal-300" />
                          <div>
                            <div className="text-teal-300 font-medium">Depth</div>
                            <div className="text-teal-100 font-bold">
                              {site.depth_min}-{site.depth_max}m
                            </div>
                          </div>
                        </div>

                        {site.visibility && (
                          <div className="flex items-center gap-2 p-2 bg-cyan-900/50 rounded-lg border border-cyan-400/20">
                            <Eye className="h-3 w-3 text-cyan-300" />
                            <div>
                              <div className="text-cyan-300 font-medium">Visibility</div>
                              <div className="text-cyan-100 font-bold">{site.visibility}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Location and explore button */}
                      <div className="flex items-center justify-between pt-3 border-t border-teal-400/20">
                        <div className="flex items-center gap-2 text-teal-300">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">{site.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-teal-300 group-hover:text-teal-100 transition-colors">
                          <span className="text-sm font-medium">Explore</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!loading && !error && diveSites.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-sm rounded-2xl p-16 max-w-md mx-auto border-2 border-teal-400/20 shadow-2xl">
                <Fish className="h-20 w-20 text-teal-300 mx-auto mb-6" />
                <p className="text-teal-200 text-xl font-medium">No featured dive sites available at the moment.</p>
              </div>
            </div>
          )}

          {!loading && !error && diveSites.length > 0 && (
            <div className="text-center mt-16">
              <Link href="/dive-sites">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-10 py-4 text-lg rounded-full bg-gradient-to-r from-slate-800/80 to-blue-900/80 backdrop-blur-sm border-2 border-teal-300/50 text-teal-200 hover:bg-teal-300/20 hover:text-teal-100 hover:border-teal-300 shadow-2xl hover:shadow-teal-600/30 transition-all duration-300 group transform hover:scale-105"
                >
                  View All Dive Sites
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-teal-900/90 to-slate-900/90 backdrop-blur-sm relative border-t border-cyan-400/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-teal-100 mb-4">
              What Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                Divers Say
              </span>
            </h2>
            <p className="text-xl text-teal-200 max-w-3xl mx-auto leading-relaxed">
              Real experiences from fellow diving enthusiasts who discovered the magic of Anilao
            </p>
          </div>

          {/* Testimonials Display Section */}
          <TestimonialsDisplay />

          <div className="text-center mt-16">
            <h3 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 mb-6">
              Share Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                Diving Story
              </span>
            </h3>
            <p className="text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed mb-8">
              Your experience matters! Help other diving enthusiasts discover the magic of Anilao through your story
            </p>

            <TestimonialForm />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-slate-900 via-teal-900 to-blue-900 relative overflow-hidden border-t border-teal-400/20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-teal-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800/60 to-blue-900/60 backdrop-blur-sm rounded-3xl p-12 border border-teal-400/30 shadow-2xl">
            <div className="flex items-center justify-center mb-8">
              <div className="p-4 bg-gradient-to-br from-teal-600/30 to-cyan-600/30 rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-teal-400/40">
                <Waves className="h-12 w-12 text-teal-300" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 mb-4 sm:mb-6 px-4">
              Dive Into Our Updates
            </h3>
            <p className="text-teal-100 mb-8 sm:mb-10 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed px-4">
              Get the latest dive tips, special offers, and underwater photography straight to your inbox. Join our
              community of ocean explorers!
            </p>

            <form
              onSubmit={handleNewsletterSubscription}
              className="flex flex-col gap-4 justify-center max-w-lg mx-auto mb-6 px-4"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 rounded-full border-2 border-teal-400/30 focus:outline-none focus:ring-4 focus:ring-teal-400/30 focus:border-teal-400 text-slate-900 text-base sm:text-lg shadow-lg bg-white/95 backdrop-blur-sm placeholder-slate-500 disabled:opacity-50"
                required
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                size="lg"
                className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-teal-600/50 transition-all duration-300 group transform hover:scale-105 border border-teal-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubscribing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-white border-t-transparent mr-3"></div>
                    Joining...
                  </>
                ) : (
                  <>
                    <Waves className="mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                    Subscribe
                    <ArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {subscriptionMessage && (
              <div
                className={`mb-6 p-4 rounded-full text-center font-medium ${
                  subscriptionMessage.includes("Thank you")
                    ? "bg-green-900/50 text-green-200 border border-green-400/30"
                    : "bg-red-900/50 text-red-200 border border-red-400/30"
                }`}
              >
                {subscriptionMessage}
              </div>
            )}

            <div className="flex items-center justify-center gap-6 text-teal-300 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>5,000+ diving enthusiasts</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-teal-300" />
                <span>Weekly dive tips</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Exclusive offers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
