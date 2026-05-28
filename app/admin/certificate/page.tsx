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
import { Plus, Edit, Trash2, Search, Upload, ImageIcon } from "lucide-react"

interface Certificate {
  id: number
  name: string
  level: string
  description: string
  prerequisites: string[]
  duration_days: number
  price: number
  min_age: number
  max_depth: number
  image?: string
  created_at?: string
  updated_at?: string
}

export default function CertificatePage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const response = await fetch("/api/certificate")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCertificates(data.certifications || [])
        }
      }
    } catch (error) {
      console.error("Error fetching certificates:", error)
      toast({
        title: "Error",
        description: "Failed to load certificates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("level", formData.level)
      formDataToSend.append("description", formData.description)

      const prerequisitesArray = formData.prerequisites
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p)

      prerequisitesArray.forEach((prerequisite, index) => {
        formDataToSend.append(`prerequisites[${index}]`, prerequisite)
      })

      formDataToSend.append("duration_days", formData.duration_days)
      formDataToSend.append("price", formData.price)
      formDataToSend.append("min_age", formData.min_age)
      formDataToSend.append("max_depth", formData.max_depth)

      if (selectedImage) {
        formDataToSend.append("image", selectedImage)
      }

      const response = await fetch("/api/certificate", {
        method: "POST",
        body: formDataToSend,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Certificate created successfully",
          })
          setIsCreateDialogOpen(false)
          resetForm()
          fetchCertificates()
        }
      } else {
        throw new Error("Failed to create certificate")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create certificate",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleEditCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCertificate) return

    setUploading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("level", formData.level)
      formDataToSend.append("description", formData.description)

      const prerequisitesArray = formData.prerequisites
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p)

      prerequisitesArray.forEach((prerequisite, index) => {
        formDataToSend.append(`prerequisites[${index}]`, prerequisite)
      })

      formDataToSend.append("duration_days", formData.duration_days)
      formDataToSend.append("price", formData.price)
      formDataToSend.append("min_age", formData.min_age)
      formDataToSend.append("max_depth", formData.max_depth)

      if (selectedImage) {
        formDataToSend.append("image", selectedImage)
      }

      const response = await fetch(`/api/certificate/${editingCertificate.id}`, {
        method: "PUT",
        body: formDataToSend,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Certificate updated successfully",
          })
          setIsEditDialogOpen(false)
          setEditingCertificate(null)
          resetForm()
          fetchCertificates()
        }
      } else {
        throw new Error("Failed to update certificate")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update certificate",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteCertificate = async (certificateId: number) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return

    try {
      const response = await fetch(`/api/certificate/${certificateId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Certificate deleted successfully",
          })
          fetchCertificates()
        }
      } else {
        throw new Error("Failed to delete certificate")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete certificate",
        variant: "destructive",
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      level: "",
      description: "",
      prerequisites: "",
      duration_days: "",
      price: "",
      min_age: "",
      max_depth: "",
    })
    setSelectedImage(null)
    setImagePreview(null)
  }

  const openEditDialog = (certificate: Certificate) => {
    setEditingCertificate(certificate)
    setFormData({
      name: certificate.name,
      level: certificate.level,
      description: certificate.description,
      prerequisites: Array.isArray(certificate.prerequisites)
        ? certificate.prerequisites.join(", ")
        : certificate.prerequisites || "",
      duration_days: certificate.duration_days.toString(),
      price: certificate.price.toString(),
      min_age: certificate.min_age.toString(),
      max_depth: certificate.max_depth.toString(),
    })
    setImagePreview(
      certificate.image ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${certificate.image}` : null,
    )
    setSelectedImage(null)
    setIsEditDialogOpen(true)
  }

  const filteredCertificates = certificates.filter(
    (certificate) =>
      certificate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.level.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-blue-100 text-blue-800"
      case "Advanced":
        return "bg-orange-100 text-orange-800"
      case "Professional":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const [formData, setFormData] = useState({
    name: "",
    level: "",
    description: "",
    prerequisites: "",
    duration_days: "",
    price: "",
    min_age: "",
    max_depth: "",
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-cyan-900">Certificate Management</h2>
          <p className="text-cyan-600">Manage diving certifications and requirements</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Certificate</DialogTitle>
              <DialogDescription>Add a new diving certification to the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCertificate} className="space-y-4">
              <div>
                <Label htmlFor="image">Certificate Image</Label>
                <div className="mt-2">
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Certificate preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Certificate Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Open Water Diver"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price (₱)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="350.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (Days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    placeholder="3"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="min_age">Minimum Age</Label>
                  <Input
                    id="min_age"
                    type="number"
                    value={formData.min_age}
                    onChange={(e) => setFormData({ ...formData, min_age: e.target.value })}
                    placeholder="12"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_depth">Maximum Depth (m)</Label>
                  <Input
                    id="max_depth"
                    type="number"
                    value={formData.max_depth}
                    onChange={(e) => setFormData({ ...formData, max_depth: e.target.value })}
                    placeholder="18"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Certificate description..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="prerequisites">Prerequisites (comma-separated)</Label>
                <Textarea
                  id="prerequisites"
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  placeholder="Swimming ability, Medical clearance, Basic water confidence"
                  rows={2}
                />
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
                    "Create Certificate"
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
              <CardTitle>Certificates</CardTitle>
              <CardDescription>
                {filteredCertificates.length} certificate{filteredCertificates.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search certificates..."
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
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Min Age</TableHead>
                  <TableHead>Max Depth</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading certificates...
                    </TableCell>
                  </TableRow>
                ) : filteredCertificates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No certificates found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCertificates.map((certificate) => (
                    <TableRow key={certificate.id}>
                      <TableCell>
                        {certificate.image ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/${certificate.image}`}
                            alt={certificate.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{certificate.name}</TableCell>
                      <TableCell>
                        <Badge className={getLevelColor(certificate.level)}>{certificate.level}</Badge>
                      </TableCell>
                      <TableCell>₱{certificate.price}</TableCell>
                      <TableCell>{certificate.duration_days} days</TableCell>
                      <TableCell>{certificate.min_age} years</TableCell>
                      <TableCell>{certificate.max_depth}m</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(certificate)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCertificate(certificate.id)}
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
            <DialogTitle>Edit Certificate</DialogTitle>
            <DialogDescription>Update certificate information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCertificate} className="space-y-4">
            <div>
              <Label htmlFor="edit-image">Certificate Image</Label>
              <div className="mt-2">
                <Input id="edit-image" type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Certificate preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Certificate Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-level">Level</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-price">Price (₱)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (Days)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-min_age">Minimum Age</Label>
                <Input
                  id="edit-min_age"
                  type="number"
                  value={formData.min_age}
                  onChange={(e) => setFormData({ ...formData, min_age: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-max_depth">Maximum Depth (m)</Label>
                <Input
                  id="edit-max_depth"
                  type="number"
                  value={formData.max_depth}
                  onChange={(e) => setFormData({ ...formData, max_depth: e.target.value })}
                  required
                />
              </div>
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
              <Label htmlFor="edit-prerequisites">Prerequisites (comma-separated)</Label>
              <Textarea
                id="edit-prerequisites"
                value={formData.prerequisites}
                onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                rows={2}
              />
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
                  "Update Certificate"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
