"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { Search, Eye, Edit, Plus, ImageIcon, Loader2, Camera, Trash2, Upload, X, ChevronLeft, ChevronRight } from "lucide-react"

interface Photo {
  id: number
  title: string
  description: string
  content: string
  category: string
  image_url: string
  badge: string
  status: "published" | "draft" | "archived"
  created_at: string
  updated_at: string
}

interface PhotoGroup extends Photo {
  ids: number[]
  images: string[]
  count: number
}

const categoryOptions = [
  { value: "scuba-diving", label: "Scuba Diving" },
  { value: "freediving", label: "Freediving" },
  { value: "underwater-photography", label: "Underwater Photography" },
  { value: "marine-life", label: "Marine Life" },
  { value: "dive-sites", label: "Dive Sites" },
  { value: "diving-equipment", label: "Diving Equipment" },
  { value: "diving-safety", label: "Diving Safety" },
  { value: "diving-courses", label: "Diving Courses" },
]

const statusOptions = [
  { value: "published", label: "Published", color: "bg-green-100 text-green-800" },
  { value: "draft", label: "Draft", color: "bg-yellow-100 text-yellow-800" },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-800" },
]

const getStatusColor = (status: string) => {
  const statusOption = statusOptions.find((option) => option.value === status)
  return statusOption?.color || "bg-gray-100 text-gray-800"
}

const getFullUrl = (url: string | null): string => {
  if (!url) return "/placeholder.svg"
  if (url.startsWith("http")) return url
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || ""
  return `${baseUrl}${url}`
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const groupPhotos = (photos: Photo[]): PhotoGroup[] => {
  const grouped = photos.reduce((acc, photo) => {
    const key = `${photo.title}|${photo.description}|${photo.content}|${photo.category}|${photo.badge}|${photo.status}`
    if (!acc[key]) {
      acc[key] = {
        ...photo,
        ids: [photo.id],
        images: photo.image_url ? [photo.image_url] : [],
        count: 1,
      }
    } else {
      const existing = acc[key]
      const images = photo.image_url ? [...existing.images] : [...existing.images]
      if (photo.image_url && !images.includes(photo.image_url)) {
        images.push(photo.image_url)
      }
      acc[key] = {
        ...existing,
        ids: [...existing.ids, photo.id],
        images,
        count: existing.count + 1,
        updated_at: existing.updated_at >= photo.updated_at ? existing.updated_at : photo.updated_at,
      }
    }
    return acc
  }, {} as Record<string, PhotoGroup>)

  return Object.values(grouped)
}

const AdminPhotosPage = () => {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoGroup | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<PhotoGroup | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Changed: support multiple files
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const [formData, setFormData] = useState<{
    title: string
    description: string
    content: string
    category: string
    badge: string
    status: "published" | "draft" | "archived"
  }>({
    title: "",
    description: "",
    content: "",
    category: "",
    badge: "",
    status: "draft",
  })

  useEffect(() => {
    fetchPhotos()
  }, [])

  const groupedPhotos = groupPhotos(photos)

  const filteredPhotos = groupedPhotos.filter((photo) => {
    const matchesSearch =
      photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || photo.category === categoryFilter
    const matchesStatus = statusFilter === "all" || photo.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalPhotos = photos.length
  const publishedPhotos = photos.filter((photo) => photo.status === "published").length

  const fetchPhotos = async () => {
    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/photos`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPhotos(data.photos || [])
        }
      }
    } catch (error) {
      console.error("Error fetching photos:", error)
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePhoto = async () => {
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("content", formData.content)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("badge", formData.badge)
      formDataToSend.append("status", formData.status)

      // Append all selected files
      imageFiles.forEach((file) => {
        formDataToSend.append("images[]", file)
      })

      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/photos`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: `Photo${imageFiles.length > 1 ? "s" : ""} created successfully`,
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchPhotos()
      } else {
        console.error("Create photo error:", data)
        toast({
          title: "Error",
          description: data.message || "Failed to create photo",
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

  const handleUpdatePhoto = async () => {
    if (!selectedPhoto || !formData.title || !formData.description || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("content", formData.content)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("badge", formData.badge)
      formDataToSend.append("status", formData.status)
      formDataToSend.append("_method", "PUT")

      // Append all selected files
      imageFiles.forEach((file) => {
        formDataToSend.append("images[]", file)
      })

      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/photos/${selectedPhoto.id}`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: "Photo updated successfully",
        })
        setIsEditDialogOpen(false)
        resetForm()
        fetchPhotos()
      } else {
        console.error("Update photo error:", data)
        toast({
          title: "Error",
          description: data.message || "Failed to update photo",
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

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return

    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const responses = await Promise.all(
        photoToDelete.ids.map((id) =>
          fetch(`${apiUrl}/photos/${id}`, {
            method: "DELETE",
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
              "Content-Type": "application/json",
            },
          })
        )
      )

      const allSucceeded = await Promise.all(responses.map((res) => res.ok ? res.json() : Promise.resolve({ success: false })))
      if (allSucceeded.every((data) => data.success)) {
        toast({
          title: "Success",
          description: photoToDelete.ids.length > 1 ? "Photo group deleted successfully" : "Photo deleted successfully",
        })
        fetchPhotos()
      } else {
        throw new Error("Failed to delete one or more photos")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setPhotoToDelete(null)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      category: "",
      badge: "",
      status: "draft",
    })
    setImageFiles([])
    setSelectedPhoto(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (photo: PhotoGroup) => {
    setSelectedPhoto(photo)
    setFormData({
      title: photo.title,
      description: photo.description,
      content: photo.content,
      category: photo.category,
      badge: photo.badge,
      status: photo.status,
    })
    setImageFiles([])
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (photo: PhotoGroup) => {
    setSelectedPhoto(photo)
    setCarouselIndex(0)
    setIsViewDialogOpen(true)
  }

  const openDeleteDialog = (photo: PhotoGroup) => {
    setPhotoToDelete(photo)
    setIsDeleteDialogOpen(true)
  }

  // Handle multiple file selection — merge with existing files, deduplicate by name+size
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || [])
    setImageFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`))
      const newFiles = incoming.filter((f) => !existingKeys.has(`${f.name}-${f.size}`))
      return [...prev, ...newFiles]
    })
    // Reset input so the same file can be re-added after removal
    e.target.value = ""
  }

  // Remove a specific file from the list
  const removeFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }


  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value as "published" | "draft" | "archived" })
  }

  // Reusable file upload section used in both create and edit dialogs
  const FileUploadSection = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div>
      <Label htmlFor={isEdit ? "edit-image" : "image"}>
        Photo Files
        {imageFiles.length > 0 && (
          <span className="ml-2 text-xs text-blue-600 font-normal">{imageFiles.length} file{imageFiles.length > 1 ? "s" : ""} selected</span>
        )}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={isEdit ? "edit-image" : "image"}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="flex-1"
        />
        <Upload className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>

      {/* File list preview */}
      {imageFiles.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {imageFiles.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate text-gray-700" title={file.name}>{file.name}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatFileSize(file.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {isEdit && selectedPhoto?.image_url && imageFiles.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">Current: {selectedPhoto.image_url.split("/").pop()}</p>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Photo Gallery Management</h2>
          <p className="text-slate-600">Create and manage diving photos</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Photo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Total Photos</p>
                <p className="text-2xl font-bold">{totalPhotos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Published</p>
                <p className="text-2xl font-bold">{publishedPhotos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Categories</p>
                <p className="text-2xl font-bold">{categoryOptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Photos</CardTitle>
              <CardDescription>
                {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-[200px]"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading photos...
                    </TableCell>
                  </TableRow>
                ) : filteredPhotos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No photos found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPhotos.map((photo) => (
                    <TableRow key={photo.id}>
                      <TableCell className="max-w-[300px]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {photo.image_url ? (
                              <img
                                src={getFullUrl(photo.image_url) || "/placeholder.svg"}
                                alt={photo.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = "none"
                                  target.nextElementSibling?.classList.remove("hidden")
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate" title={photo.title}>
                              {photo.title}
                              {photo.count > 1 && (
                                <span className="ml-2 text-xs text-slate-500">({photo.count} photos)</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 truncate" title={photo.description}>
                              {photo.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryOptions.find((c) => c.value === photo.category)?.label || photo.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{photo.badge}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(photo.status)}>
                          {statusOptions.find((s) => s.value === photo.status)?.label || photo.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(photo.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openViewDialog(photo)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(photo)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(photo)}
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

      {/* Create Photo Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Photo</DialogTitle>
            <DialogDescription>Add a new diving photo to your gallery</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter photo title"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the photo"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Full photo content/description"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="badge">Badge</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g., Featured, New, Popular"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
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
            </div>

            <FileUploadSection />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePhoto} className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Add Photo"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Photo Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Photo</DialogTitle>
            <DialogDescription>Update your photo details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter photo title"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the photo"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Full photo content/description"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-badge">Badge</Label>
                <Input
                  id="edit-badge"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g., Featured, New, Popular"
                />
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
            </div>

            <FileUploadSection isEdit />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePhoto} className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Photo"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Photo Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.title}</DialogTitle>
            <DialogDescription>
              {categoryOptions.find((c) => c.value === selectedPhoto?.category)?.label} • {selectedPhoto?.badge}
            </DialogDescription>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {selectedPhoto.images.length > 0 ? (
                  <img
                    src={getFullUrl(selectedPhoto.images[carouselIndex]) || "/placeholder.svg"}
                    alt={`${selectedPhoto.title} (${carouselIndex + 1}/${selectedPhoto.images.length})`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}

                {selectedPhoto.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCarouselIndex((idx) => Math.max(0, idx - 1))
                      }}
                      disabled={carouselIndex === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-opacity disabled:opacity-25 disabled:cursor-not-allowed"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCarouselIndex((idx) => Math.min(selectedPhoto.images.length - 1, idx + 1))
                      }}
                      disabled={carouselIndex === selectedPhoto.images.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-opacity disabled:opacity-25 disabled:cursor-not-allowed"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {carouselIndex + 1}/{selectedPhoto.images.length}
                    </span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedPhoto.badge}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedPhoto.status)}>{selectedPhoto.status}</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{selectedPhoto.description}</p>
              </div>

              {selectedPhoto.content && (
                <div>
                  <h3 className="font-semibold mb-2">Content</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedPhoto.content}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <strong>Created:</strong> {new Date(selectedPhoto.created_at).toLocaleDateString()}
                </div>
                <div>
                  <strong>Updated:</strong> {new Date(selectedPhoto.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{photoToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setPhotoToDelete(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePhoto} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { AdminPhotosPage }
export default AdminPhotosPage