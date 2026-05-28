"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toast"
import { Search, Eye, Edit, Calendar, Users, Loader2, AudioLines as PhilippinePeso } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  phone?: string
}

interface Room {
  id: number
  name: string
  type: string
  price_per_night: number
  max_guests: number
}

interface Booking {
  id: number
  user_id: number
  room_id: number
  check_in_date: string
  check_out_date: string
  guests: number
  total_price: number
  special_requests?: string
  status: string
  created_at: string
  user?: User
  room?: Room
}

const statusOptions = [
  { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
  { value: "completed", label: "Completed", color: "bg-blue-100 text-blue-800" },
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
]

const getStatusColor = (status: string) => {
  const statusOption = statusOptions.find((option) => option.value === status)
  return statusOption?.color || "bg-gray-100 text-gray-800"
}

const calculateNights = (checkIn: string, checkOut: string) => {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] API Response:", data)
        if (data.success) {
          setBookings(data.bookings || [])
        }
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) return

    setIsUpdatingStatus(true)

    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Booking status updated successfully",
          })
          setIsStatusDialogOpen(false)
          setSelectedBooking(null)
          setNewStatus("")
          fetchBookings()
        }
      } else {
        throw new Error("Failed to update status")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const openViewDialog = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsViewDialogOpen(true)
  }

  const openStatusDialog = (booking: Booking) => {
    setSelectedBooking(booking)
    setNewStatus(booking.status)
    setIsStatusDialogOpen(true)
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalRevenue = filteredBookings
    .filter((booking) => booking.status === "completed")
    .reduce((sum, booking) => {
      const price =
        typeof booking.total_price === "string" ? Number.parseFloat(booking.total_price) : booking.total_price
      return sum + (isNaN(price) ? 0 : price)
    }, 0)

  const upcomingBookings = filteredBookings.filter((booking) => {
    const checkInDate = new Date(booking.check_in_date)
    const today = new Date()
    return checkInDate > today && booking.status === "confirmed"
  }).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Booking Management</h2>
          <p className="text-slate-600">Manage hotel bookings and track reservations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Total Bookings</p>
                <p className="text-2xl font-bold">{filteredBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PhilippinePeso className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm text-slate-600">Revenue</p>
                <p className="text-2xl font-bold">
                  ₱{totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                {filteredBookings.filter((b) => b.status === "confirmed").length} Confirmed
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>
                {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-[250px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by status" />
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Booked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.user?.name}</div>
                          <div className="text-sm text-gray-500">{booking.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.room?.name}</div>
                          <div className="text-sm text-gray-500">{booking.room?.type}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(booking.check_in_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(booking.check_out_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {booking.guests}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">₱{booking.total_price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {statusOptions.find((s) => s.value === booking.status)?.label || booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(booking.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openViewDialog(booking)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openStatusDialog(booking)}>
                            <Edit className="w-4 h-4" />
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

      {/* View Booking Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              {selectedBooking?.room?.name} - {selectedBooking?.user?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-800">Guest Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Name:</strong> {selectedBooking.user?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedBooking.user?.email}
                    </p>
                    {selectedBooking.user?.phone && (
                      <p>
                        <strong>Phone:</strong> {selectedBooking.user?.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Room Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Room:</strong> {selectedBooking.room?.name}
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedBooking.room?.type}
                    </p>
                    <p>
                      <strong>Rate:</strong> ₱{selectedBooking.room?.price_per_night}/night
                    </p>
                    <p>
                      <strong>Max Guests:</strong> {selectedBooking.room?.max_guests}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Stay Details</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Check-in:</strong> {new Date(selectedBooking.check_in_date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Check-out:</strong> {new Date(selectedBooking.check_out_date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Nights:</strong>{" "}
                      {calculateNights(selectedBooking.check_in_date, selectedBooking.check_out_date)}
                    </p>
                    <p>
                      <strong>Guests:</strong> {selectedBooking.guests}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Booking Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Total Price:</strong> ₱{selectedBooking.total_price.toLocaleString()}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <Badge className={getStatusColor(selectedBooking.status)}>
                        {statusOptions.find((s) => s.value === selectedBooking.status)?.label || selectedBooking.status}
                      </Badge>
                    </p>
                    <p>
                      <strong>Booked:</strong> {new Date(selectedBooking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              {selectedBooking.special_requests && (
                <div>
                  <h4 className="font-semibold text-slate-800">Special Requests</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedBooking.special_requests}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>Change the status for {selectedBooking?.user?.name}'s booking</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Status</label>
              <p className="text-sm text-gray-600">
                {statusOptions.find((s) => s.value === selectedBooking?.status)?.label}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                className="bg-slate-900 hover:bg-slate-800"
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
