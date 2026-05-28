"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, User, MessageSquare, ArrowRight, CheckCircle } from "lucide-react"

interface TestimonialFormData {
  name: string
  email: string
  location: string
  diving_experience: string
  rating: number
  testimonial: string
  course_taken?: string
}

export function TestimonialForm() {
  const [formData, setFormData] = useState<TestimonialFormData>({
    name: "",
    email: "",
    location: "",
    diving_experience: "",
    rating: 5,
    testimonial: "",
    course_taken: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setSubmitMessage("Thank you for sharing your diving experience! Your testimonial has been submitted.")
        setFormData({
          name: "",
          email: "",
          location: "",
          diving_experience: "",
          rating: 5,
          testimonial: "",
          course_taken: "",
        })
      } else {
        setSubmitMessage(data.message || "Failed to submit testimonial. Please try again.")
      }
    } catch (error) {
      console.error("Testimonial submission error:", error)
      setSubmitMessage("Network error. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="max-w-md mx-auto bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-sm border border-teal-400/30 shadow-2xl">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-2 bg-gradient-to-br from-green-600/30 to-teal-600/30 rounded-full border border-green-400/40">
              <CheckCircle className="h-6 w-6 text-green-300" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-green-300 mb-2">Testimonial Submitted!</h3>
          <p className="text-teal-100 mb-3 text-xs">{submitMessage}</p>
          <Button
            onClick={() => setIsSuccess(false)}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-4 py-1.5 rounded-full font-semibold shadow-lg transition-all duration-300 text-sm"
          >
            Submit Another Testimonial
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-sm border border-teal-400/30 shadow-2xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-center mb-3">
          <div className="p-2 bg-gradient-to-br from-teal-600/30 to-cyan-600/30 rounded-full border border-teal-400/40">
            <MessageSquare className="h-6 w-6 text-teal-300" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300 text-center mb-1">
          Share Your Experience
        </h3>
        <p className="text-teal-200 text-center mb-4 text-xs">Help fellow divers discover the magic of Anilao</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-teal-200 font-medium mb-1 text-xs">
                <User className="inline h-3 w-3 mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-1.5 rounded-md border border-teal-400/30 bg-slate-900/50 text-teal-100 placeholder-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/50 focus:border-teal-400 backdrop-blur-sm text-xs"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-teal-200 font-medium mb-1 text-xs">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-1.5 rounded-md border border-teal-400/30 bg-slate-900/50 text-teal-100 placeholder-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/50 focus:border-teal-400 backdrop-blur-sm text-xs"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-teal-200 font-medium mb-1 text-xs">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 rounded-md border border-teal-400/30 bg-slate-900/50 text-teal-100 placeholder-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/50 focus:border-teal-400 backdrop-blur-sm text-xs"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-teal-200 font-medium mb-1 text-xs">Experience</label>
              <select
                name="diving_experience"
                value={formData.diving_experience}
                onChange={handleInputChange}
                className="w-full px-2 py-1.5 rounded-md border border-teal-400/30 bg-slate-900/50 text-teal-100 focus:outline-none focus:ring-1 focus:ring-teal-400/50 focus:border-teal-400 backdrop-blur-sm text-xs"
              >
                <option value="">Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-teal-200 font-medium mb-1 text-xs">Course (Optional)</label>
            <input
              type="text"
              name="course_taken"
              value={formData.course_taken}
              onChange={handleInputChange}
              className="w-full px-2 py-1.5 rounded-md border border-teal-400/30 bg-slate-900/50 text-teal-100 placeholder-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/50 focus:border-teal-400 backdrop-blur-sm text-xs"
              placeholder="e.g., Open Water, Advanced"
            />
          </div>

          <div>
            <label className="block text-teal-200 font-medium mb-1 text-xs">
              <Star className="inline h-3 w-3 mr-1" />
              Rating *
            </label>
            <div className="flex gap-1 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className={`p-0.5 rounded transition-all duration-200 ${
                    star <= formData.rating
                      ? "text-yellow-400 bg-yellow-400/20 border border-yellow-400/40"
                      : "text-teal-400 bg-slate-900/50 border border-teal-400/30 hover:bg-teal-400/10"
                  }`}
                >
                  <Star className={`h-3 w-3 ${star <= formData.rating ? "fill-yellow-400" : ""}`} />
                </button>
              ))}
              <span className="ml-1 text-teal-200 text-xs">
                {formData.rating} star{formData.rating !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-teal-200 font-medium mb-1 text-xs">Your Experience *</label>
            <textarea
              name="testimonial"
              value={formData.testimonial}
              onChange={handleInputChange}
              required
              rows={2}
              className="w-full px-2 py-1.5 rounded-md border border-teal-400/30 bg-slate-900/50 text-teal-100 placeholder-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/50 focus:border-teal-400 backdrop-blur-sm resize-none text-xs"
              placeholder="Share your diving experience..."
            />
          </div>

          {submitMessage && (
            <div
              className={`p-2 rounded-md text-center font-medium text-xs ${
                submitMessage.includes("Thank you")
                  ? "bg-green-900/50 text-green-200 border border-green-400/30"
                  : "bg-red-900/50 text-red-200 border border-red-400/30"
              }`}
            >
              {submitMessage}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white py-2 text-xs font-semibold shadow-2xl hover:shadow-teal-600/40 transition-all duration-300 group transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                Share Your Story
                <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
