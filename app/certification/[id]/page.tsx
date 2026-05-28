"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toast"
import { ArrowLeft, Clock, Users, CheckCircle, Award, Star, Calendar, Shield, Waves } from "lucide-react"
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

export default function CertificationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationData, setApplicationData] = useState({
    emergencyContact: "",
    emergencyPhone: "",
    medicalConditions: "",
    divingExperience: "",
    loggedDives: "",
    lastDive: "",
    agreeTerms: false,
    medicalClearance: false,
    paymentMethod: "",
    paymentScreenshot: null as File | null,
  })

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
    const fetchCertificate = async () => {
      if (!params.id) return

      try {
        setIsLoading(true)
        const response = await fetch("/api/certificate")
        const data = await response.json()

        if (response.ok && data.success) {
          const foundCertificate = data.certifications?.find(
            (cert: Certificate) => cert.id === Number.parseInt(params.id as string),
          )
          if (foundCertificate) {
            setCertificate(foundCertificate)
          } else {
            toast({
              title: "Certificate not found",
              description: "The requested certification could not be found.",
              variant: "destructive",
            })
            router.push("/certification")
          }
        } else {
          throw new Error(data.message || "Failed to fetch certificate")
        }
      } catch (error) {
        console.error("Error fetching certificate:", error)
        toast({
          title: "Error",
          description: "Failed to load certification details.",
          variant: "destructive",
        })
        router.push("/certification")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCertificate()
  }, [params.id, router])

  const handleInputChange = (field: string, value: string | boolean) => {
    setApplicationData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setApplicationData((prev) => ({ ...prev, paymentScreenshot: file }))
    }
  }

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !certificate) return

    if (!applicationData.agreeTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      })
      return
    }

    if (!applicationData.paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method.",
        variant: "destructive",
      })
      return
    }

    if (applicationData.paymentMethod !== "cash" && !applicationData.paymentScreenshot) {
      toast({
        title: "Payment screenshot required",
        description: "Please upload a screenshot of your payment.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("certification_id", certificate.id.toString())
      formData.append(
        "preferred_start_date",
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      )
      formData.append("diving_experience_years", (Number.parseInt(applicationData.divingExperience) || 0).toString())
      formData.append("total_dives", (Number.parseInt(applicationData.loggedDives) || 0).toString())
      formData.append("deepest_dive", "0")
      formData.append("last_dive_date", applicationData.lastDive || "")
      formData.append("medical_conditions", applicationData.medicalConditions)
      formData.append("emergency_contact_name", applicationData.emergencyContact)
      formData.append("emergency_contact_phone", applicationData.emergencyPhone)
      formData.append("emergency_contact_relationship", "Emergency Contact")
      formData.append("payment_method", applicationData.paymentMethod)

      if (applicationData.paymentScreenshot) {
        formData.append("screenshot_payment", applicationData.paymentScreenshot)
      }

      const response = await fetch("/api/certifications/apply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Application submitted!",
          description: `Your application for ${certificate.name} has been submitted successfully.`,
        })
        router.push("/certification")
      } else {
        toast({
          title: "Application failed",
          description: data.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Application error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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

  const getSkillsForCertificate = (certificateName: string) => {
    const name = certificateName.toLowerCase()

    if (name.includes("open water") || name.includes("beginner")) {
      return [
        "Basic diving techniques and safety procedures",
        "Equipment setup and pre-dive safety checks",
        "Underwater hand signals and communication",
        "Buoyancy control and underwater navigation",
        "Emergency ascent procedures",
        "Marine life awareness and conservation basics",
      ]
    } else if (name.includes("advanced") || name.includes("adventure")) {
      return [
        "Advanced diving techniques and safety procedures",
        "Deep water diving protocols and decompression theory",
        "Underwater navigation with compass and natural references",
        "Night diving and limited visibility techniques",
        "Wreck diving safety and penetration procedures",
        "Advanced marine life identification and photography",
      ]
    } else if (name.includes("rescue") || name.includes("emergency")) {
      return [
        "Emergency response and rescue techniques",
        "Victim recognition and stress management",
        "In-water rescue and emergency ascent procedures",
        "First aid and CPR for diving emergencies",
        "Accident prevention and risk assessment",
        "Emergency action plan development and execution",
      ]
    } else if (name.includes("divemaster") || name.includes("professional")) {
      return [
        "Professional diving leadership and supervision",
        "Dive planning and group management techniques",
        "Teaching assistance and student evaluation",
        "Equipment maintenance and dive site assessment",
        "Business aspects of diving and customer service",
        "Advanced rescue techniques and emergency management",
      ]
    } else if (name.includes("nitrox") || name.includes("enriched")) {
      return [
        "Enriched air nitrox theory and gas management",
        "Oxygen exposure limits and dive planning",
        "Nitrox equipment handling and analysis",
        "Extended bottom time calculations",
        "Oxygen toxicity prevention and recognition",
        "Advanced dive computer programming for nitrox",
      ]
    } else if (name.includes("wreck")) {
      return [
        "Wreck diving safety and penetration techniques",
        "Historical wreck identification and preservation",
        "Advanced buoyancy control in confined spaces",
        "Wreck mapping and underwater archaeology basics",
        "Emergency procedures for overhead environments",
        "Specialized wreck diving equipment usage",
      ]
    } else if (name.includes("deep")) {
      return [
        "Deep water diving protocols and safety procedures",
        "Decompression theory and dive planning",
        "Nitrogen narcosis recognition and management",
        "Deep water emergency ascent procedures",
        "Advanced dive computer usage and backup planning",
        "Deep water marine life identification",
      ]
    } else {
      // Default skills for any other certification
      return [
        `${certificateName} specific techniques and procedures`,
        "Equipment handling and maintenance for this certification",
        "Safety protocols and emergency procedures",
        "Underwater skills and communication methods",
        "Environmental awareness and conservation practices",
        "Certification-specific dive planning and execution",
      ]
    }
  }

  if (isLoading) {
    return <DiverLoader message="Loading Certification Details..." size="lg" />
  }

  if (!certificate) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-6">
          <Button
            onClick={() => router.push("/certification")}
            variant="ghost"
            className="mb-4 text-white hover:text-cyan-200 hover:bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Certifications
          </Button>

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Course Header */}
            <div className="lg:col-span-2 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Badge className={`${getLevelColor(certificate.level)} text-sm px-3 py-1`}>{certificate.level}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm ml-1">(4.9)</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-3">{certificate.name}</h1>
              <p className="text-cyan-100 text-lg mb-4 leading-relaxed">{certificate.description}</p>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-cyan-300" />
                  <div className="text-xl font-bold">{certificate.duration_days}</div>
                  <div className="text-xs text-cyan-200">Days</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <Users className="w-5 h-5 mx-auto mb-1 text-blue-300" />
                  <div className="text-xl font-bold">{certificate.min_age}+</div>
                  <div className="text-xs text-cyan-200">Min Age</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <Waves className="w-5 h-5 mx-auto mb-1 text-teal-300" />
                  <div className="text-xl font-bold">{certificate.max_depth}m</div>
                  <div className="text-xs text-cyan-200">Max Depth</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <Award className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
                  <div className="text-xl font-bold">PADI</div>
                  <div className="text-xs text-cyan-200">Certified</div>
                </div>
              </div>

              <div className="text-3xl font-bold text-yellow-400">
                ₱{Number(certificate.price).toLocaleString()}
                <span className="text-lg text-cyan-200 font-normal ml-2">total course fee</span>
              </div>
            </div>

            {/* Course Image */}
            {certificate.image && (
              <div className="lg:col-span-1">
                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"}/${certificate.image}`}
                    alt={certificate.name}
                    className="w-full h-64 lg:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Course Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* What You'll Learn */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-cyan-600" />
                    What You'll Master
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {getSkillsForCertificate(certificate.name).map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Prerequisites */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-orange-600" />
                    Prerequisites & Requirements
                  </h3>
                  <div className="space-y-3">
                    {certificate.prerequisites.map((prereq, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border-l-4 border-orange-400 bg-orange-50">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{prereq}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Course Schedule */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    Course Schedule
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Theory Sessions</h4>
                      <p className="text-sm text-blue-700">2 days of classroom learning</p>
                      <p className="text-xs text-blue-600 mt-1">Includes materials and certification</p>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-teal-800 mb-2">Practical Training</h4>
                      <p className="text-sm text-teal-700">{certificate.duration_days - 2} day/s of diving</p>
                      <p className="text-xs text-teal-600 mt-1">Open water and pool sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Application Form */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-0 sticky top-6">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Start Your Journey</h2>
                    <p className="text-gray-600 text-sm">Join thousands of certified divers</p>
                  </div>

                  <form onSubmit={handleApplicationSubmit} className="space-y-4">
                    {/* Emergency Contact */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Emergency Contact</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <Input
                          placeholder="Full name"
                          value={applicationData.emergencyContact}
                          onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                          required
                          className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                        <Input
                          type="tel"
                          placeholder="+63 912 345 6789"
                          value={applicationData.emergencyPhone}
                          onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                          required
                          className="border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Diving Experience */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Diving Experience</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Input
                            type="number"
                            placeholder="Years"
                            value={applicationData.divingExperience}
                            onChange={(e) => handleInputChange("divingExperience", e.target.value)}
                            className="border-gray-300 focus:border-cyan-500 text-center"
                          />
                          <Label className="text-xs text-gray-500 text-center block mt-1">Experience</Label>
                        </div>
                        <div>
                          <Input
                            type="number"
                            placeholder="Dives"
                            value={applicationData.loggedDives}
                            onChange={(e) => handleInputChange("loggedDives", e.target.value)}
                            className="border-gray-300 focus:border-cyan-500 text-center"
                          />
                          <Label className="text-xs text-gray-500 text-center block mt-1">Logged</Label>
                        </div>
                        <div>
                          <Input
                            type="date"
                            value={applicationData.lastDive}
                            onChange={(e) => handleInputChange("lastDive", e.target.value)}
                            className="border-gray-300 focus:border-cyan-500 text-center"
                          />
                          <Label className="text-xs text-gray-500 text-center block mt-1">Last Dive</Label>
                        </div>
                      </div>
                    </div>

                    {/* Medical Conditions */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Medical Information</Label>
                      <Textarea
                        placeholder="Any medical conditions or medications..."
                        value={applicationData.medicalConditions}
                        onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                        className="border-gray-300 focus:border-cyan-500 resize-none"
                        rows={2}
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Payment Method</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {
                            id: "gcash",
                            label: "GCash",
                            number: "09456754591",
                          },
                          {
                            id: "maya",
                            label: "Maya",
                            number: "09456754591",
                          },
                          {
                            id: "bank",
                            label: "Bank Transfer",
                            number: "",
                          },
                          {
                            id: "cash",
                            label: "Cash Payment",
                            number: "",
                          },
                        ].map((method) => (
                          <div
                            key={method.id}
                            className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50"
                          >
                            <input
                              type="radio"
                              id={method.id}
                              name="paymentMethod"
                              value={method.id}
                              checked={applicationData.paymentMethod === method.id}
                              onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                              className="h-4 w-4 text-cyan-600"
                            />
                            <Label htmlFor={method.id} className="text-sm cursor-pointer">
                              <div className="font-medium">{method.label}</div>
                              {method.number && <div className="text-xs text-gray-500">{method.number}</div>}
                            </Label>
                          </div>
                        ))}
                      </div>

                      {applicationData.paymentMethod === "bank" && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <h4 className="text-sm font-semibold text-blue-800 mb-2">Bank Details:</h4>
                          <div className="text-xs space-y-1">
                            <div>
                              <strong>BPI:</strong> 1234-5678-90
                            </div>
                            <div>
                              <strong>BDO:</strong> 9876-5432-10
                            </div>
                            <div>
                              <strong>Name:</strong> Dive Center Philippines
                            </div>
                          </div>
                        </div>
                      )}

                      {applicationData.paymentMethod && applicationData.paymentMethod !== "cash" && (
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                            className="border-gray-300 focus:border-cyan-500"
                          />
                          <p className="text-xs text-gray-500">Upload payment screenshot</p>
                        </div>
                      )}

                      {applicationData.paymentMethod === "cash" && (
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <p className="text-xs text-yellow-800">Pay at our dive center during registration.</p>
                        </div>
                      )}
                    </div>

                    {/* Course Summary */}
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
                      <h4 className="font-semibold text-gray-800 mb-2">Course Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{certificate.duration_days} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Level:</span>
                          <span>{certificate.level}</span>
                        </div>
                        <div className="flex justify-between font-bold text-cyan-800 pt-2 border-t">
                          <span>Total:</span>
                          <span>₱{Number(certificate.price).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Agreements */}
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="medicalClearance"
                          checked={applicationData.medicalClearance}
                          onCheckedChange={(checked) => handleInputChange("medicalClearance", checked as boolean)}
                          className="mt-1"
                        />
                        <Label htmlFor="medicalClearance" className="text-xs leading-tight">
                          I confirm medical fitness and will provide clearance if required
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="agreeTerms"
                          checked={applicationData.agreeTerms}
                          onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                          className="mt-1"
                        />
                        <Label htmlFor="agreeTerms" className="text-xs leading-tight">
                          I agree to terms, conditions, and liability waivers
                        </Label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg"
                      disabled={isSubmitting || !applicationData.agreeTerms || !applicationData.paymentMethod}
                    >
                      {isSubmitting ? "Processing..." : "Enroll Now"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
