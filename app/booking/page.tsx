"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { Footer } from "@/components/footer"

interface Room {
  id: string
  name: string
  type: string
  capacity: number
  price: number
  amenities: string[]
  description: string
  image: string
}

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
}

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder.svg"
  if (imagePath.startsWith("http")) return imagePath
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || ""
  return `${baseUrl}${imagePath}`
}

export default function BookingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    specialRequests: "",
  })
  const [showBookingForm, setShowBookingForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("/api/rooms")
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] API response:", data)

          let roomsArray = data
          if (data && typeof data === "object" && !Array.isArray(data)) {
            roomsArray = data.data || data.rooms || []
          }

          if (!Array.isArray(roomsArray)) {
            console.log("[v0] Invalid data format, expected array but got:", typeof roomsArray)
            throw new Error("Invalid data format received from server")
          }

          const transformedRooms = roomsArray.map((room: any) => ({
            id: room.id.toString(),
            name: room.name,
            type: room.type,
            capacity: room.max_guests,
            price: Number.parseFloat(room.price_per_night),
            amenities: Array.isArray(room.amenities) ? room.amenities : JSON.parse(room.amenities || "[]"),
            description: room.description,
            image: room.image_url,
          }))
          setRooms(transformedRooms)
        } else {
          console.log("[v0] API response not ok:", response.status, response.statusText)
          toast({
            title: "Error",
            description: "Failed to load rooms. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("[v0] Error fetching rooms:", error)
        toast({
          title: "Error",
          description: "Failed to load rooms. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchRooms()
  }, [])

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

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room)
    setShowBookingForm(true)
  }

  const handleInputChange = (field: string, value: string | number) => {
    setBookingData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0
    const checkIn = new Date(bookingData.checkIn)
    const checkOut = new Date(bookingData.checkOut)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    if (!selectedRoom) return 0
    return selectedRoom.price * calculateNights()
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to make a booking.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!selectedRoom) {
      console.log("[v0] No selected room!")
      return
    }

    console.log("[v0] Selected room:", selectedRoom)
    console.log("[v0] Selected room ID:", selectedRoom.id)
    console.log("[v0] Selected room ID type:", typeof selectedRoom.id)
    console.log("[v0] Room ID as number:", Number(selectedRoom.id))
    console.log("[v0] Room ID number type:", typeof Number(selectedRoom.id))
    console.log("[v0] Is room ID valid?:", selectedRoom.id !== null && selectedRoom.id !== undefined)

    try {
      const roomId = selectedRoom?.id ? Number(selectedRoom.id) : null
      console.log("[v0] Final room_id:", roomId)

      if (!roomId || isNaN(roomId)) {
        console.log("[v0] Invalid room ID detected!")
        toast({
          title: "Error",
          description: "Please select a valid room.",
          variant: "destructive",
        })
        return
      }

      const bookingPayload = {
        room_id: roomId,
        check_in_date: bookingData.checkIn,
        check_out_date: bookingData.checkOut,
        guests: bookingData.guests,
        special_requests: bookingData.specialRequests,
      }

      console.log("[v0] Booking payload:", bookingPayload)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(bookingPayload),
      })

      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (response.ok) {
        toast({
          title: "Booking Submitted!",
          description: `Your reservation for ${selectedRoom.name} has been submitted.`,
        })
        router.push("/booking")
      } else {
        console.log("[v0] Booking failed:", data)
        toast({
          title: "Booking failed",
          description: data.message || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.log("[v0] Booking error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cyan-50 to-blue-100">
      <main className="flex-1 container mx-auto px-4 py-8">
        {!showBookingForm ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-cyan-800 mb-4">Choose Your Room</h2>
              <p className="text-lg text-cyan-700">Select from our comfortable accommodations</p>
            </div>

            {rooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-cyan-700">No rooms available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {rooms.map((room) => (
                  <Card key={room.id} className="border-cyan-200 hover:shadow-lg transition-shadow">
                    <div className="aspect-[3/2] overflow-hidden rounded-t-lg">
                      <img
                        src={getImageUrl(room.image) || "/placeholder.svg"}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-cyan-800 text-sm truncate">{room.name}</h3>
                            <p className="text-xs text-gray-600">
                              {room.type} • {room.capacity} guests
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <div className="text-sm font-bold text-cyan-800">₱{room.price.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">per night</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 2).map((amenity, index) => (
                            <span key={index} className="px-1.5 py-0.5 bg-cyan-100 text-cyan-800 text-xs rounded">
                              {amenity}
                            </span>
                          ))}
                          {room.amenities.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              +{room.amenities.length - 2}
                            </span>
                          )}
                        </div>

                        <Button
                          onClick={() => handleRoomSelect(room)}
                          className="w-full bg-cyan-600 hover:bg-cyan-700 text-xs py-1.5 h-auto"
                        >
                          Select Room
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-7xl mx-auto">
            <Button
              onClick={() => setShowBookingForm(false)}
              variant="outline"
              className="mb-6 border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-transparent"
            >
              ← Back to Rooms
            </Button>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Comprehensive Room Details */}
              <div className="space-y-6">
                <Card className="border-cyan-200">
                  <CardHeader>
                    <CardTitle className="text-2xl text-cyan-800">{selectedRoom?.name}</CardTitle>
                    <CardDescription className="text-lg">
                      {selectedRoom?.type} • Up to {selectedRoom?.capacity} guests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Room Image */}
                    <div className="aspect-[4/3] overflow-hidden rounded-lg">
                      <img
                        src={
                          getImageUrl(selectedRoom?.image || "") ||
                          "/placeholder.svg?height=400&width=600&query=luxury hotel room"
                        }
                        alt={selectedRoom?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Room Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-cyan-800 mb-2">Description</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedRoom?.description ||
                          "Experience comfort and luxury in this beautifully appointed room featuring modern amenities and elegant furnishings designed for your perfect stay."}
                      </p>
                    </div>

                    {/* Room Amenities */}
                    <div>
                      <h3 className="text-lg font-semibold text-cyan-800 mb-3">Amenities</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedRoom?.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                            <span className="text-gray-700 text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                        <h4 className="font-semibold text-cyan-800 mb-1">Room Type</h4>
                        <p className="text-gray-700">{selectedRoom?.type}</p>
                      </div>
                      <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                        <h4 className="font-semibold text-cyan-800 mb-1">Max Capacity</h4>
                        <p className="text-gray-700">{selectedRoom?.capacity} guests</p>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 rounded-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-1">₱{selectedRoom?.price.toLocaleString()}</div>
                        <div className="text-cyan-100">per night</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Booking Form */}
              <div>
                <Card className="border-cyan-200 sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-xl text-cyan-800">Complete Your Booking</CardTitle>
                    <CardDescription>Fill in your details to reserve this room</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBookingSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="checkIn">Check-in Date</Label>
                          <Input
                            id="checkIn"
                            type="date"
                            value={bookingData.checkIn}
                            onChange={(e) => handleInputChange("checkIn", e.target.value)}
                            required
                            className="border-cyan-200 focus:border-cyan-400"
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="checkOut">Check-out Date</Label>
                          <Input
                            id="checkOut"
                            type="date"
                            value={bookingData.checkOut}
                            onChange={(e) => handleInputChange("checkOut", e.target.value)}
                            required
                            className="border-cyan-200 focus:border-cyan-400"
                            min={bookingData.checkIn || new Date().toISOString().split("T")[0]}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guests">Number of Guests</Label>
                        <Select onValueChange={(value) => handleInputChange("guests", Number.parseInt(value))}>
                          <SelectTrigger className="border-cyan-200 focus:border-cyan-400">
                            <SelectValue placeholder="Select number of guests" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: selectedRoom?.capacity || 1 }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1} Guest{i > 0 ? "s" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                        <Textarea
                          id="specialRequests"
                          placeholder="Any special requests or requirements..."
                          value={bookingData.specialRequests}
                          onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                          className="border-cyan-200 focus:border-cyan-400"
                          rows={3}
                        />
                      </div>

                      {/* Booking Summary */}
                      {bookingData.checkIn && bookingData.checkOut && (
                        <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                          <h3 className="font-semibold text-cyan-800 mb-3">Booking Summary</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Room:</span>
                              <span className="font-medium">{selectedRoom?.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Check-in:</span>
                              <span>{new Date(bookingData.checkIn).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Check-out:</span>
                              <span>{new Date(bookingData.checkOut).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Nights:</span>
                              <span>{calculateNights()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Guests:</span>
                              <span>{bookingData.guests}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rate per night:</span>
                              <span>₱{selectedRoom?.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-cyan-800 pt-2 border-t border-cyan-200 text-base">
                              <span>Total:</span>
                              <span>₱{calculateTotal().toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3"
                        disabled={!bookingData.checkIn || !bookingData.checkOut}
                      >
                        Confirm Booking
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
