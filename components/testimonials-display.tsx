"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star, User, MapPin, Quote, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

interface Testimonial {
  id: number
  name: string
  email: string
  location?: string
  diving_experience?: "beginner" | "intermediate" | "advanced" | "expert"
  rating: number
  testimonial: string
  course_taken?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

const experienceLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
}

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
  ))
}

export function TestimonialsDisplay() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  const openModal = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTestimonial(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1) // Mobile: 1 item
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2) // Tablet: 2 items
      } else {
        setItemsPerView(3) // Desktop: 3 items
      }
    }

    updateItemsPerView()
    window.addEventListener("resize", updateItemsPerView)
    return () => window.removeEventListener("resize", updateItemsPerView)
  }, [])

  useEffect(() => {
    if (testimonials.length <= itemsPerView) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = testimonials.length - itemsPerView
        return prev >= maxIndex ? 0 : prev + 1
      })
    }, 5000) // Auto-advance every 5 seconds

    return () => clearInterval(interval)
  }, [testimonials.length, itemsPerView])

  useEffect(() => {
    const fetchApprovedTestimonials = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) {
          console.log("[v0] NEXT_PUBLIC_API_URL not configured")
          // For demo purposes, add some mock data
          setTestimonials([
            {
              id: 1,
              name: "Sarah Johnson",
              email: "sarah@example.com",
              location: "Miami, FL",
              diving_experience: "intermediate",
              rating: 5,
              testimonial: "Amazing diving experience! The instructors were professional and made me feel safe throughout the entire course. I learned so much and can't wait to go diving again!",
              course_taken: "Open Water Diver",
              status: "approved",
              created_at: "2024-01-15T10:30:00Z"
            },
            {
              id: 2,
              name: "Mike Chen",
              email: "mike@example.com",
              location: "San Diego, CA",
              diving_experience: "advanced",
              rating: 5,
              testimonial: "Fantastic deep water diving course. The equipment was top-notch and the dive sites were absolutely breathtaking. Highly recommend this diving center!",
              course_taken: "Advanced Open Water",
              status: "approved",
              created_at: "2024-01-20T14:15:00Z"
            },
            {
              id: 3,
              name: "Emma Rodriguez",
              email: "emma@example.com",
              location: "Key West, FL",
              diving_experience: "beginner",
              rating: 4,
              testimonial: "Great introduction to scuba diving. The pool training was thorough and helped build my confidence before the ocean dives.",
              course_taken: "Discover Scuba",
              status: "approved",
              created_at: "2024-01-25T09:45:00Z"
            },
            {
              id: 4,
              name: "James Wilson",
              email: "james@example.com",
              location: "Tampa, FL",
              diving_experience: "expert",
              rating: 5,
              testimonial: "Excellent wreck diving experience. The guides knew the sites very well and pointed out amazing marine life. Will definitely be back!",
              course_taken: "Wreck Diving Specialty",
              status: "approved",
              created_at: "2024-02-01T11:20:00Z"
            }
          ])
          setLoading(false)
          return
        }

        const response = await fetch(`${apiUrl}/testimonials?status=approved`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setTestimonials(data.data)
          }
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApprovedTestimonials()
  }, [])

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, testimonials.length - itemsPerView)
      return prev > 0 ? prev - 1 : maxIndex
    })
  }

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, testimonials.length - itemsPerView)
      return prev >= maxIndex ? 0 : prev + 1
    })
  }

  const goToSlide = (index: number) => {
    const maxIndex = Math.max(0, testimonials.length - itemsPerView)
    setCurrentIndex(Math.min(index, maxIndex))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-teal-200 font-medium">Loading testimonials...</p>
        </div>
      </div>
    )
  }

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border-2 border-teal-400/20 shadow-2xl">
          <Quote className="h-12 w-12 text-teal-300 mx-auto mb-4" />
          <p className="text-teal-200 font-medium">No testimonials available yet.</p>
          <p className="text-teal-300 text-sm mt-2">Be the first to share your diving experience!</p>
        </div>
      </div>
    )
  }

  // Calculate visible testimonials based on current index and items per view
  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + itemsPerView)
  const totalDots = Math.ceil(testimonials.length / itemsPerView)

  return (
    <>
      <div className="relative px-2 md:px-0">
        <div className="overflow-hidden">
          <div className="grid gap-6" style={{ 
            gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))` 
          }}>
            {visibleTestimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-sm border border-teal-400/30 shadow-2xl hover:shadow-teal-600/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full"
                onClick={() => openModal(testimonial)}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-600/30 rounded-full flex items-center justify-center border border-teal-400/40 flex-shrink-0">
                      <User className="w-5 h-5 text-teal-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-teal-100 truncate">{testimonial.name}</h4>
                      {testimonial.location && (
                        <div className="flex items-center gap-1 text-teal-300 text-sm">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{testimonial.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">{renderStars(testimonial.rating)}</div>
                    {testimonial.diving_experience && (
                      <span className="text-xs bg-teal-900/50 text-teal-200 px-2 py-1 rounded-full border border-teal-400/30 self-start">
                        {experienceLabels[testimonial.diving_experience]}
                      </span>
                    )}
                  </div>

                  <blockquote className="text-teal-100 text-sm leading-relaxed mb-3 line-clamp-4">
                    "{testimonial.testimonial}"
                  </blockquote>

                  {testimonial.course_taken && (
                    <div className="text-xs text-teal-300 bg-cyan-900/30 px-2 py-1 rounded border border-cyan-400/30 mb-2">
                      Course: {testimonial.course_taken}
                    </div>
                  )}

                  <div className="text-xs text-teal-400 opacity-70">Click to read full testimonial</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {testimonials.length > itemsPerView && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 bg-slate-800/80 border-teal-400/30 text-teal-300 hover:bg-teal-600/20 hover:text-teal-100 z-10"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 bg-slate-800/80 border-teal-400/30 text-teal-300 hover:bg-teal-600/20 hover:text-teal-100 z-10"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {testimonials.length > itemsPerView && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalDots }, (_, index) => {
              const isActive = Math.floor(currentIndex / itemsPerView) === index
              return (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive ? "bg-teal-400 w-6" : "bg-teal-400/30 hover:bg-teal-400/50 w-2"
                  }`}
                  onClick={() => goToSlide(index * itemsPerView)}
                />
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="bg-gradient-to-br from-slate-800 to-blue-900 border border-teal-400/30 text-teal-100 max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTestimonial && (
            <>
              <DialogHeader>
                <DialogTitle className="text-teal-100 text-xl font-bold">Diving Experience</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-teal-600/30 rounded-full flex items-center justify-center border-2 border-teal-400/40">
                    <User className="w-8 h-8 text-teal-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-teal-100">{selectedTestimonial.name}</h3>
                    {selectedTestimonial.location && (
                      <div className="flex items-center gap-2 text-teal-300">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedTestimonial.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating and Experience */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-teal-200 font-medium">Rating:</span>
                    <div className="flex items-center gap-1">{renderStars(selectedTestimonial.rating)}</div>
                  </div>
                  {selectedTestimonial.diving_experience && (
                    <span className="bg-teal-900/50 text-teal-200 px-3 py-1 rounded-full border border-teal-400/30 self-start">
                      {experienceLabels[selectedTestimonial.diving_experience]}
                    </span>
                  )}
                </div>

                {/* Course */}
                {selectedTestimonial.course_taken && (
                  <div className="bg-cyan-900/30 p-3 rounded-lg border border-cyan-400/30">
                    <span className="text-cyan-300 font-medium">Course Taken: </span>
                    <span className="text-teal-100">{selectedTestimonial.course_taken}</span>
                  </div>
                )}

                {/* Full Testimonial */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-teal-400/20">
                  <Quote className="w-6 h-6 text-teal-400 mb-2" />
                  <blockquote className="text-teal-100 leading-relaxed text-base">
                    "{selectedTestimonial.testimonial}"
                  </blockquote>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-teal-300 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Shared on {formatDate(selectedTestimonial.created_at)}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}