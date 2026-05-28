"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toast"
import { Plus, Edit, Trash2, Search, Upload, X } from "lucide-react"

interface Room {
  id: number
  name: string
  type: string
  price_per_night: number
  max_guests: number
  description: string
  amenities: string[]
  image_url?: string
  is_available: boolean
  created_at?: string
  updated_at?: string
}

const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return "/placeholder.svg"

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) return imagePath

  // If it's a relative path, prepend the backend URL
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || ""
  return `${backendUrl}${imagePath}`
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRooms(data.rooms || [])
        }
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const submitData = new FormData()
      submitData.append("name", formData.name)
      submitData.append("type", formData.type)
      submitData.append("description", formData.description)
      submitData.append("price_per_night", formData.price_per_night)
      submitData.append("max_guests", formData.max_guests)
      submitData.append("is_available", formData.is_available.toString())

      const amenitiesArray = formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a)

      amenitiesArray.forEach((amenity, index) => {
        submitData.append(`amenities[${index}]`, amenity)
      })

      if (selectedFile) {
        submitData.append("image", selectedFile)
      }

      const response = await fetch("/api/rooms", {
        method: "POST",
        body: submitData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Room created successfully",
          })
          setIsCreateDialogOpen(false)
          resetForm()
          fetchRooms()
        }
      } else {
        throw new Error("Failed to create room")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRoom) return

    setUploading(true)

    try {
      const submitData = new FormData()
      submitData.append("name", formData.name)
      submitData.append("type", formData.type)
      submitData.append("description", formData.description)
      submitData.append("price_per_night", formData.price_per_night)
      submitData.append("max_guests", formData.max_guests)
      submitData.append("is_available", formData.is_available.toString())

      const amenitiesArray = formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a)

      amenitiesArray.forEach((amenity, index) => {
        submitData.append(`amenities[${index}]`, amenity)
      })

      if (selectedFile) {
        submitData.append("image", selectedFile)
      }

      const response = await fetch(`/api/rooms/${editingRoom.id}`, {
        method: "PUT",
        body: submitData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Room updated successfully",
          })
          setIsEditDialogOpen(false)
          setEditingRoom(null)
          resetForm()
          fetchRooms()
        }
      } else {
        throw new Error("Failed to update room")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm("Are you sure you want to delete this room?")) return

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Room deleted successfully",
          })
          fetchRooms()
        }
      } else {
        throw new Error("Failed to delete room")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      price_per_night: "",
      max_guests: "",
      description: "",
      amenities: "",
      image_url: "",
      is_available: true,
    })
    setSelectedFile(null)
    setPreviewUrl("")
  }

  const openEditDialog = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      type: room.type,
      price_per_night: room.price_per_night.toString(),
      max_guests: room.max_guests.toString(),
      description: room.description,
      amenities: Array.isArray(room.amenities) ? room.amenities.join(", ") : room.amenities || "",
      image_url: room.image_url || "",
      is_available: room.is_available,
    })
    setSelectedFile(null)
    setPreviewUrl(getImageUrl(room.image_url))
    setIsEditDialogOpen(true)
  }

  const clearImage = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    setFormData({ ...formData, image_url: "" })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getStatusText = (isAvailable: boolean) => {
    return isAvailable ? "Available" : "Unavailable"
  }

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    price_per_night: "",
    max_guests: "",
    description: "",
    amenities: "",
    image_url: "",
    is_available: true,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-cyan-900">Room Management</h2>
          <p className="text-cyan-600">Manage accommodation rooms and availability</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
              <DialogDescription>Add a new room to the accommodation system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Deluxe Ocean View"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Room Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., Deluxe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price per Night ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                    placeholder="150.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Max Guests</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.max_guests}
                    onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                    placeholder="2"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Availability</Label>
                <Select
                  value={formData.is_available.toString()}
                  onValueChange={(value) => setFormData({ ...formData, is_available: value === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Available</SelectItem>
                    <SelectItem value="false">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Room description..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Textarea
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Air conditioning, WiFi, Ocean view, Mini bar"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="image">Room Image</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input id="image" type="file" accept="image/*" onChange={handleFileSelect} className="flex-1" />
                    {previewUrl && (
                      <Button type="button" variant="outline" size="sm" onClick={clearImage}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {previewUrl && (
                    <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Room"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Rooms</CardTitle>
              <CardDescription>
                {filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Max Guests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading rooms...
                    </TableCell>
                  </TableRow>
                ) : filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No rooms found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>${room.price_per_night}</TableCell>
                      <TableCell>{room.max_guests} guests</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(room.is_available)}>{getStatusText(room.is_available)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(room)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRoom(room.id)}
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>Update room information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditRoom} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Room Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Room Type</Label>
                <Input
                  id="edit-type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price per Night ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-capacity">Max Guests</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={formData.max_guests}
                  onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-status">Availability</Label>
              <Select
                value={formData.is_available.toString()}
                onValueChange={(value) => setFormData({ ...formData, is_available: value === "true" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Available</SelectItem>
                  <SelectItem value="false">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-amenities">Amenities (comma-separated)</Label>
              <Textarea
                id="edit-amenities"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="edit-image">Room Image</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input id="edit-image" type="file" accept="image/*" onChange={handleFileSelect} className="flex-1" />
                  {previewUrl && (
                    <Button type="button" variant="outline" size="sm" onClick={clearImage}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {previewUrl && (
                  <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                    <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={uploading}>
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Room"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
