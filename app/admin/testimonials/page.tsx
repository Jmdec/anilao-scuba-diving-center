"use client"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { Check, Edit, Eye, MapPin, Plus, Search, Star, Trash2, User, X } from "lucide-react"
import { MessageSquare } from "lucide-react" // Import MessageSquare here

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
  ip_address?: string
  user_agent?: string
  moderated_at?: string
  created_at: string
  updated_at: string
}

const experienceOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
]

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
]

const getStatusColor = (status: string) => {
  const statusOption = statusOptions.find((option) => option.value === status)
  return statusOption?.color || "bg-gray-100 text-gray-800"
}

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
  ))
}

const AdminTestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [experienceFilter, setExperienceFilter] = useState("beginner")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [ratingFilter, setRatingFilter] = useState("5")
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<{
    name: string
    email: string
    location: string
    diving_experience: string
    rating: number
    testimonial: string
    course_taken: string
    status: "pending" | "approved" | "rejected"
  }>({
    name: "",
    email: "",
    location: "",
    diving_experience: "beginner",
    rating: 5,
    testimonial: "",
    course_taken: "",
    status: "pending",
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] API Response:", data)
        if (data.success) {
          setTestimonials(data.data || [])
          console.log("[v0] Testimonials set:", data.data || [])
        }
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast({
        title: "Error",
        description: "Failed to load testimonials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTestimonial = async () => {
    if (!formData.name || !formData.email || !formData.testimonial) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          location: formData.location || null,
          diving_experience: formData.diving_experience || null,
          rating: formData.rating,
          testimonial: formData.testimonial,
          course_taken: formData.course_taken || null,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: "Testimonial created successfully",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchTestimonials()
      } else {
        console.error("Create testimonial error:", data)
        toast({
          title: "Error",
          description: data.message || "Failed to create testimonial",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Network error:", error)
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTestimonial = async () => {
    if (!selectedTestimonial || !formData.name || !formData.email || !formData.testimonial) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${selectedTestimonial.id}`, {
        method: "PUT",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          location: formData.location || null,
          diving_experience: formData.diving_experience || null,
          rating: formData.rating,
          testimonial: formData.testimonial,
          course_taken: formData.course_taken || null,
          status: formData.status,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: "Testimonial updated successfully",
        })
        setIsEditDialogOpen(false)
        resetForm()
        fetchTestimonials()
      } else {
        console.error("Update testimonial error:", data)
        toast({
          title: "Error",
          description: data.message || "Failed to update testimonial",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Network error:", error)
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTestimonial = async () => {
    if (!testimonialToDelete) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/testimonials/${testimonialToDelete.id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Testimonial deleted successfully",
          })
          fetchTestimonials()
        }
      } else {
        throw new Error("Failed to delete testimonial")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setTestimonialToDelete(null)
    }
  }

  const handleQuickStatusUpdate = async (testimonial: Testimonial, newStatus: "pending" | "approved" | "rejected") => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/testimonials/${testimonial.id}/status`, {
        method: "PATCH",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: `Testimonial ${newStatus} successfully`,
        })
        fetchTestimonials()
      } else {
        console.error("Update testimonial error:", data)
        toast({
          title: "Error",
          description: data.message || "Failed to update testimonial status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Network error:", error)
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      location: "",
      diving_experience: "beginner",
      rating: 5,
      testimonial: "",
      course_taken: "",
      status: "pending",
    })
    setSelectedTestimonial(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      email: testimonial.email,
      location: testimonial.location || "",
      diving_experience: testimonial.diving_experience || "beginner",
      rating: testimonial.rating,
      testimonial: testimonial.testimonial,
      course_taken: testimonial.course_taken || "",
      status: testimonial.status,
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial)
    setIsViewDialogOpen(true)
  }

  const openDeleteDialog = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial)
    setIsDeleteDialogOpen(true)
  }

  const filteredTestimonials = testimonials.filter((testimonial) => {
    const matchesSearch =
      testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.testimonial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (testimonial.location && testimonial.location.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesExperience = experienceFilter === "all" || testimonial.diving_experience === experienceFilter
    const matchesStatus = statusFilter === "all" || testimonial.status === statusFilter
    const matchesRating = ratingFilter === "all" || testimonial.rating.toString() === ratingFilter

    return matchesSearch && matchesExperience && matchesStatus && matchesRating
  })

  const totalTestimonials = filteredTestimonials.length
  const approvedTestimonials = filteredTestimonials.filter((t) => t.status === "approved").length
  const pendingTestimonials = filteredTestimonials.filter((t) => t.status === "pending").length
  const averageRating =
    filteredTestimonials.length > 0
      ? (filteredTestimonials.reduce((sum, t) => sum + t.rating, 0) / filteredTestimonials.length).toFixed(1)
      : "0.0"

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value as "pending" | "approved" | "rejected" })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Testimonial Management</h2>
          <p className="text-slate-600">Manage customer testimonials and reviews</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold">{totalTestimonials}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Approved</p>
                <p className="text-2xl font-bold">{approvedTestimonials}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold">{pendingTestimonials}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-600 fill-current" />
              <div>
                <p className="text-sm text-slate-600">Avg Rating</p>
                <p className="text-2xl font-bold">{averageRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Testimonials</CardTitle>
              <CardDescription>
                {filteredTestimonials.length} testimonial{filteredTestimonials.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search testimonials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-[200px]"
                />
              </div>
              {/* Experience Filter */}
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experience</SelectItem>
                  {experienceOptions.map((exp) => (
                    <SelectItem key={exp.value} value={exp.value}>
                      {exp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Rating Filter */}
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-full sm:w-[100px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading testimonials...
                    </TableCell>
                  </TableRow>
                ) : filteredTestimonials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No testimonials found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTestimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell className="max-w-[250px]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate" title={testimonial.name}>
                              {testimonial.name}
                            </div>
                            {testimonial.location && (
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {testimonial.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {testimonial.diving_experience ? (
                          <Badge variant="outline">
                            {experienceOptions.find((e) => e.value === testimonial.diving_experience)?.label ||
                              testimonial.diving_experience}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {renderStars(testimonial.rating)}
                          <span className="ml-1 text-sm text-gray-600">({testimonial.rating})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {testimonial.course_taken ? (
                          <span className="text-sm">{testimonial.course_taken}</span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(testimonial.status)}>
                          {statusOptions.find((s) => s.value === testimonial.status)?.label || testimonial.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(testimonial.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openViewDialog(testimonial)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(testimonial)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {testimonial.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickStatusUpdate(testimonial, "approved")}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                title="Approve Testimonial"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuickStatusUpdate(testimonial, "rejected")}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                title="Reject Testimonial"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {testimonial.status === "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickStatusUpdate(testimonial, "rejected")}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              title="Reject Testimonial"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                          {testimonial.status === "rejected" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickStatusUpdate(testimonial, "approved")}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                              title="Approve Testimonial"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(testimonial)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Testimonial Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Testimonial</DialogTitle>
            <DialogDescription>Create a new customer testimonial</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Label htmlFor="diving_experience">Diving Experience</Label>
                <Select
                  value={formData.diving_experience}
                  onValueChange={(value) => setFormData({ ...formData, diving_experience: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Not specified</SelectItem>
                    {experienceOptions.map((exp) => (
                      <SelectItem key={exp.value} value={exp.value}>
                        {exp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Rating *</Label>
                <Select
                  value={formData.rating.toString()}
                  onValueChange={(value) => setFormData({ ...formData, rating: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars - Excellent</SelectItem>
                    <SelectItem value="4">4 Stars - Very Good</SelectItem>
                    <SelectItem value="3">3 Stars - Good</SelectItem>
                    <SelectItem value="2">2 Stars - Fair</SelectItem>
                    <SelectItem value="1">1 Star - Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="course_taken">Course Taken</Label>
                <Input
                  id="course_taken"
                  value={formData.course_taken}
                  onChange={(e) => setFormData({ ...formData, course_taken: e.target.value })}
                  placeholder="e.g., Open Water Diver"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="testimonial">Testimonial *</Label>
              <Textarea
                id="testimonial"
                value={formData.testimonial}
                onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                placeholder="Customer's testimonial..."
                rows={5}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTestimonial}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <X className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Testimonial"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Testimonial Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>Update testimonial details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Label htmlFor="edit-diving_experience">Diving Experience</Label>
                <Select
                  value={formData.diving_experience}
                  onValueChange={(value) => setFormData({ ...formData, diving_experience: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Not specified</SelectItem>
                    {experienceOptions.map((exp) => (
                      <SelectItem key={exp.value} value={exp.value}>
                        {exp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-rating">Rating *</Label>
                <Select
                  value={formData.rating.toString()}
                  onValueChange={(value) => setFormData({ ...formData, rating: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars - Excellent</SelectItem>
                    <SelectItem value="4">4 Stars - Very Good</SelectItem>
                    <SelectItem value="3">3 Stars - Good</SelectItem>
                    <SelectItem value="2">2 Stars - Fair</SelectItem>
                    <SelectItem value="1">1 Star - Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-course_taken">Course Taken</Label>
                <Input
                  id="edit-course_taken"
                  value={formData.course_taken}
                  onChange={(e) => setFormData({ ...formData, course_taken: e.target.value })}
                  placeholder="e.g., Open Water Diver"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-testimonial">Testimonial *</Label>
              <Textarea
                id="edit-testimonial"
                value={formData.testimonial}
                onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                placeholder="Customer's testimonial..."
                rows={5}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateTestimonial}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <X className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Testimonial"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Testimonial Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTestimonial?.name}</DialogTitle>
            <DialogDescription>
              {selectedTestimonial?.email} • {selectedTestimonial?.location}
            </DialogDescription>
          </DialogHeader>
          {selectedTestimonial && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {renderStars(selectedTestimonial.rating)}
                  <span className="ml-2 font-semibold">{selectedTestimonial.rating}/5</span>
                </div>
                <Badge className={getStatusColor(selectedTestimonial.status)}>
                  {statusOptions.find((s) => s.value === selectedTestimonial.status)?.label ||
                    selectedTestimonial.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Experience Level:</strong>{" "}
                  {selectedTestimonial.diving_experience
                    ? experienceOptions.find((e) => e.value === selectedTestimonial.diving_experience)?.label
                    : "Not specified"}
                </div>
                <div>
                  <strong>Course Taken:</strong> {selectedTestimonial.course_taken || "Not specified"}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Testimonial</h3>
                <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {selectedTestimonial.testimonial}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <strong>Submitted:</strong> {new Date(selectedTestimonial.created_at).toLocaleDateString()}
                </div>
                <div>
                  <strong>Updated:</strong> {new Date(selectedTestimonial.updated_at).toLocaleDateString()}
                </div>
              </div>

              {selectedTestimonial.moderated_at && (
                <div className="text-sm text-gray-500">
                  <strong>Moderated:</strong> {new Date(selectedTestimonial.moderated_at).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex flex-col items-center justify-center gap-4">
            <Trash2 className="w-12 h-12 text-red-600" />
            <h3 className="text-lg font-semibold text-red-600">Delete Testimonial</h3>
            <p className="text-sm text-center text-gray-600">
              Are you sure you want to delete the testimonial from "{testimonialToDelete?.name}"? This action cannot be
              undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDeleteTestimonial} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                Delete
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminTestimonialsPage
