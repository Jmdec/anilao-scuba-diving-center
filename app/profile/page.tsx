"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MapPin,
  Star,
  Mail,
  BookOpen,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MoreHorizontal,
  Phone,
  Award,
  Clock,
  Activity,
  Edit,
  Save,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Booking {
  id: number
  user_id: number
  room_id: number
  check_in_date: string
  check_out_date: string
  guests: number
  total_price: number
  special_requests?: string
  status: "confirmed" | "cancelled" | "completed"
  created_at: string
  updated_at: string
  room: {
    id: number
    name: string
    type: string
    price_per_night: number
    max_guests: number
    image_url?: string
    description?: string
  }
}

interface UserProfile {
  id: number
  name: string
  lastName: string
  email: string
  phone?: string
  bio?: string
  emergency_contact?: string
  diving_experience?: string
  current_certification_level?: string
}

interface UserCertification {
  id: number
  certificate_id: number
  status: "pending" | "approved" | "ongoing" | "completed" | "cancelled" | "rejected"
  applied_at: string
  approved_at?: string
  certificate: {
    id: number
    name: string
    level: string
    description: string
    image?: string
    duration_days: number
    price: number
  }
}

type BookingFilter = "all" | "confirmed" | "completed" | "cancelled"

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [userCertifications, setUserCertifications] = useState<UserCertification[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState<BookingFilter>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const bookingsPerPage = 6

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    medical_conditions: "",
    diving_experience: "",
    current_certification_level: "",
  })

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to view your profile.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        setBookings(data.bookings || [])

        // Set form data for editing
        setEditForm({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          emergency_contact_name: data.user.emergency_contact_name || "",
          emergency_contact_phone: data.user.emergency_contact_phone || "",
          medical_conditions: data.user.medical_conditions || "",
          diving_experience: data.user.diving_experience || "",
          current_certification_level: data.user.current_certification_level || "",
        })

        // Fetch user certifications
        await fetchUserCertifications()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch profile data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
      toast({
        title: "Error",
        description: "Something went wrong while fetching your profile.",
        variant: "destructive",
      })
    }
  }

  const fetchUserCertifications = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user-certifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUserCertifications(data.certifications || [])
        }
      }
    } catch (error) {
      console.error("Error fetching user certifications:", error)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to update your profile.",
          variant: "destructive",
        })
        setIsUpdating(false)
        return
      }

      const response = await fetch("/api/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        setIsEditDialogOpen(false)
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Something went wrong while updating your profile.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    const booking = bookings.find((b) => b.id === bookingId)

    if (!booking) {
      toast({
        title: "Error",
        description: "Booking not found",
        variant: "destructive",
      })
      return
    }

    if (booking.status === "cancelled") {
      toast({
        title: "Error",
        description: "This booking is already cancelled",
        variant: "destructive",
      })
      return
    }

    if (booking.status === "completed") {
      toast({
        title: "Error",
        description: "Cannot cancel a completed booking",
        variant: "destructive",
      })
      return
    }

    setCancellingBookingId(bookingId)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: "cancelled" as const, updated_at: new Date().toISOString() }
              : booking,
          ),
        )

        toast({
          title: "Booking cancelled",
          description: "Your booking has been successfully cancelled.",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to cancel booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast({
        title: "Error",
        description: "Something went wrong while cancelling your booking.",
        variant: "destructive",
      })
    } finally {
      setCancellingBookingId(null)
    }
  }

  // ... existing code for booking management functions ...

  const getBookingStats = () => {
    const totalBookings = bookings.length
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length
    const completedBookings = bookings.filter((b) => b.status === "completed").length
    const totalSpent = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => {
        const price = Number(b.total_price) || 0
        return sum + price
      }, 0)

    return { totalBookings, confirmedBookings, completedBookings, totalSpent }
  }

  const getCertificationStats = () => {
    const totalCertifications = userCertifications.length
    const activeCertifications = userCertifications.filter(
      (c) => c.status === "approved" || c.status === "ongoing" || c.status === "completed",
    ).length
    const pendingCertifications = userCertifications.filter((c) => c.status === "pending").length

    return { totalCertifications, activeCertifications, pendingCertifications }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "approved":
        return <CheckCircle className="w-3 h-3 text-emerald-600" />
      case "cancelled":
      case "rejected":
        return <XCircle className="w-3 h-3 text-red-500" />
      case "completed":
        return <Star className="w-3 h-3 text-blue-600" />
      case "ongoing":
        return <Activity className="w-3 h-3 text-purple-600" />
      case "pending":
        return <Clock className="w-3 h-3 text-yellow-600" />
      default:
        return <AlertCircle className="w-3 h-3 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "cancelled":
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200"
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "ongoing":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const canCancelBooking = (booking: Booking) => {
    const checkInDate = new Date(booking.check_in_date)
    const today = new Date()
    const daysDifference = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return booking.status === "confirmed" && daysDifference > 1
  }

  const getFilteredBookings = () => {
    if (activeFilter === "all") return bookings
    return bookings.filter((booking) => booking.status === activeFilter)
  }

  const getPaginatedBookings = () => {
    const filtered = getFilteredBookings()
    const startIndex = (currentPage - 1) * bookingsPerPage
    const endIndex = startIndex + bookingsPerPage
    return filtered.slice(startIndex, endIndex)
  }

  const getTotalPages = () => {
    const filtered = getFilteredBookings()
    return Math.ceil(filtered.length / bookingsPerPage)
  }

  const handleFilterChange = (filter: BookingFilter) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  const getFilterCounts = () => {
    return {
      all: bookings.length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }
  }

  const stats = getBookingStats()
  const certStats = getCertificationStats()
  const filteredBookings = getPaginatedBookings()
  const totalPages = getTotalPages()
  const filterCounts = getFilterCounts()

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('/background-pattern.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-6 pt-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="relative flex-shrink-0">
                    {/* <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white/20 shadow-lg">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "Guest"}`} />
                      <AvatarFallback className="text-xl sm:text-2xl font-bold bg-white/20 text-white">
                        {user?.name?.charAt(0) || "G"}
                      </AvatarFallback>
                    </Avatar> */}
                    {/* <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/30"
                    >
                      <Camera className="h-4 w-4" />
                    </Button> */}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-2xl sm:text-3xl mb-2 font-bold break-words">
                      {user?.name} {user?.lastName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-blue-100 text-base sm:text-lg mb-2 break-all">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="truncate">{user?.email}</span>
                    </CardDescription>
                    {user?.phone && (
                      <CardDescription className="flex items-center gap-2 text-blue-100 text-sm sm:text-base">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{user.phone}</span>
                      </CardDescription>
                    )}
                  </div>
                </div>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white/20 hover:bg-white/30 border-white/30 text-white w-full sm:w-auto">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>Update your personal information and diving details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      {/* Basic Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            placeholder="+63 XXX XXX XXXX"
                          />
                        </div>
                      </div>

                      {/* Emergency Contact Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Emergency Contact</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="emergency_contact_name">Contact Name</Label>
                            <Input
                              id="emergency_contact_name"
                              value={editForm.emergency_contact_name}
                              onChange={(e) => setEditForm({ ...editForm, emergency_contact_name: e.target.value })}
                              placeholder="Full name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                            <Input
                              id="emergency_contact_phone"
                              value={editForm.emergency_contact_phone}
                              onChange={(e) => setEditForm({ ...editForm, emergency_contact_phone: e.target.value })}
                              placeholder="+63 XXX XXX XXXX"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Medical & Diving Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          Medical & Diving Information
                        </h3>
                        <div>
                          <Label htmlFor="medical_conditions">Medical Conditions</Label>
                          <Textarea
                            id="medical_conditions"
                            value={editForm.medical_conditions}
                            onChange={(e) => setEditForm({ ...editForm, medical_conditions: e.target.value })}
                            placeholder="List any medical conditions or allergies..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="diving_experience">Diving Experience</Label>
                          <Textarea
                            id="diving_experience"
                            value={editForm.diving_experience}
                            onChange={(e) => setEditForm({ ...editForm, diving_experience: e.target.value })}
                            placeholder="Describe your diving experience, number of dives, locations..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="current_certification_level">Current Certification Level</Label>
                          <Input
                            id="current_certification_level"
                            value={editForm.current_certification_level}
                            onChange={(e) => setEditForm({ ...editForm, current_certification_level: e.target.value })}
                            placeholder="e.g., Open Water, Advanced Open Water, Rescue Diver"
                            readOnly
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                          {isUpdating ? (
                            <>
                              <Save className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Update Profile
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 truncate">
                    Total Bookings
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 truncate">
                    Active Bookings
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.confirmedBookings}</p>
                </div>
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-full flex-shrink-0">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 truncate">
                    Certifications
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">{certStats.activeCertifications}</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 truncate">
                    Total Spent
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 break-all">
                    {formatCurrency(stats.totalSpent)}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-100 rounded-full flex-shrink-0">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Bookings and Certifications */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Certifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Your Bookings</h2>
            </div>

            <div className="mb-8">
              <div className="flex flex-wrap gap-3">
                {[
                  { key: "all", label: "All", count: filterCounts.all },
                  { key: "confirmed", label: "Active", count: filterCounts.confirmed },
                  { key: "completed", label: "Completed", count: filterCounts.completed },
                  { key: "cancelled", label: "Cancelled", count: filterCounts.cancelled },
                ].map((filter) => (
                  <Button
                    key={filter.key}
                    variant={activeFilter === filter.key ? "default" : "outline"}
                    onClick={() => handleFilterChange(filter.key as BookingFilter)}
                    className={`flex items-center gap-2 h-11 px-6 rounded-full font-medium transition-all duration-200 ${
                      activeFilter === filter.key
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                        : "bg-white/90 backdrop-blur-sm hover:bg-white border-gray-200 hover:shadow-md"
                    }`}
                  >
                    {filter.label}
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        activeFilter === filter.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {filter.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {bookings.length === 0 ? (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="text-center py-20">
                  <div className="p-4 bg-blue-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">No bookings yet</h3>
                  <p className="mb-8 text-gray-600 text-lg">Start your journey by making your first booking.</p>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    <Calendar className="w-5 h-5 mr-2" />
                    Make Your First Booking
                  </Button>
                </CardContent>
              </Card>
            ) : filteredBookings.length === 0 ? (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="text-center py-20">
                  <div className="p-4 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    No {activeFilter === "all" ? "" : activeFilter} bookings found
                  </h3>
                  <p className="text-gray-600 text-lg">Try selecting a different filter to view your bookings.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-8">
                  {filteredBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="shadow-lg border-0 hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl group hover:scale-105"
                    >
                      <div className="relative">
                        <img
                          src={
                            booking.room.image_url
                              ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${booking.room.image_url}`
                              : `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(booking.room.name + " hotel room")}`
                          }
                          alt={booking.room.name}
                          className="w-full h-48 sm:h-52 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                          <Badge className={`text-xs font-semibold ${getStatusColor(booking.status)} shadow-sm`}>
                            <div className="flex items-center gap-1.5">
                              {getStatusIcon(booking.status)}
                              <span className="hidden sm:inline">
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                          </Badge>
                        </div>
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm">
                              <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {canCancelBooking(booking) && (
                                <DropdownMenuItem
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Booking
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <CardContent className="p-4 sm:p-6">
                        <div className="mb-4">
                          <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-2 break-words">
                            {booking.room.name}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="truncate">{booking.room.type}</span>
                          </p>
                        </div>

                        <div className="space-y-3 mb-5">
                          <div className="flex items-center justify-between text-sm gap-2">
                            <span className="text-gray-600 font-medium flex-shrink-0">Check-in</span>
                            <span className="font-semibold text-gray-900 text-right">
                              {formatDateShort(booking.check_in_date)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm gap-2">
                            <span className="text-gray-600 font-medium flex-shrink-0">Check-out</span>
                            <span className="font-semibold text-gray-900 text-right">
                              {formatDateShort(booking.check_out_date)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm gap-2">
                            <span className="text-gray-600 font-medium flex-shrink-0">Guests</span>
                            <span className="font-semibold text-gray-900">{booking.guests}</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <div className="text-xs sm:text-sm text-gray-600 mb-1">
                            Total for {calculateNights(booking.check_in_date, booking.check_out_date)} nights
                          </div>
                          <div className="text-lg sm:text-xl font-bold text-gray-900 break-all">
                            {formatCurrency(booking.total_price)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Your Certifications</h2>
            </div>

            {userCertifications.length === 0 ? (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardContent className="text-center py-20">
                  <div className="p-4 bg-purple-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Award className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">No certifications yet</h3>
                  <p className="mb-8 text-gray-600 text-lg">
                    Start your journey by applying for your first certification.
                  </p>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    <Award className="w-5 h-5 mr-2" />
                    Apply for Your First Certification
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {userCertifications.map((cert) => (
                  <Card
                    key={cert.id}
                    className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl group hover:scale-105"
                  >
                    <div className="relative">
                      <img
                        src={
                          cert.certificate.image
                            ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${cert.certificate.image}`
                            : `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(cert.certificate.name + " diving certification")}`
                        }
                        alt={cert.certificate.name}
                        className="w-full h-44 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                        <Badge className={`text-xs font-semibold ${getStatusColor(cert.status)} shadow-sm`}>
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(cert.status)}
                            <span className="hidden sm:inline">
                              {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                            </span>
                          </div>
                        </Badge>
                      </div>
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                        <Badge className="bg-white/90 text-gray-800 text-xs truncate max-w-20">
                          {cert.certificate.level}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4 sm:p-6">
                      <div className="mb-4">
                        <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-2 break-words">
                          {cert.certificate.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-3 break-words">{cert.certificate.description}</p>
                      </div>

                      <div className="space-y-3 mb-5">
                        <div className="flex items-center justify-between text-sm gap-2">
                          <span className="text-gray-600 font-medium flex-shrink-0">Applied</span>
                          <span className="font-semibold text-gray-900 text-right text-xs sm:text-sm">
                            {formatDate(cert.applied_at)}
                          </span>
                        </div>
                        {cert.approved_at && (
                          <div className="flex items-center justify-between text-sm gap-2">
                            <span className="text-gray-600 font-medium flex-shrink-0">Approved</span>
                            <span className="font-semibold text-gray-900 text-right text-xs sm:text-sm">
                              {formatDate(cert.approved_at)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm gap-2">
                          <span className="text-gray-600 font-medium flex-shrink-0">Duration</span>
                          <span className="font-semibold text-gray-900">{cert.certificate.duration_days} days</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Course Fee</div>
                        <div className="text-lg sm:text-xl font-bold text-gray-900 break-all">
                          {formatCurrency(cert.certificate.price)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
