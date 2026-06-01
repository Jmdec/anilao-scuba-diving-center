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
import { Search, Eye, Edit, Plus, Video, ImageIcon, Loader2, Play, Heart, Trash2, Upload } from "lucide-react"

interface VideoPost {
  id: number
  title: string
  description: string
  content: string
  category: string
  video_url?: string
  thumbnail_url?: string
  duration?: string
  views: number
  likes: number
  comments_count: number
  status: "published" | "draft" | "archived"
  created_at: string
  updated_at: string
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

const AdminVideosPage = () => {
  const [videos, setVideos] = useState<VideoPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVideo, setSelectedVideo] = useState<VideoPost | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<VideoPost | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

  const [formData, setFormData] = useState<{
    title: string
    description: string
    content: string
    category: string
    duration: string
    status: "published" | "draft" | "archived"
  }>({
    title: "",
    description: "",
    content: "",
    category: "",
    duration: "",
    status: "draft",
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/videos`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setVideos(data.videos || [])
        }
      }
    } catch (error) {
      console.error("Error fetching videos:", error)
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVideo = async () => {
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
      formDataToSend.append("duration", formData.duration)
      formDataToSend.append("status", formData.status)

      if (videoFile) {
        formDataToSend.append("video", videoFile)
      }
      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile)
      }

      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/videos`, {
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
          description: "Video created successfully",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchVideos()
      } else {
        console.error("Create video error:", data)
        const errorMessage = data.error 
          ? (typeof data.error === 'object' ? Object.values(data.error).flat().join(', ') : data.error)
          : data.message || "Failed to create video"
        toast({
          title: "Error",
          description: errorMessage,
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

  const handleUpdateVideo = async () => {
    if (!selectedVideo || !formData.title || !formData.description || !formData.category) {
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
      formDataToSend.append("_method", "PUT")
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("content", formData.content)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("duration", formData.duration)
      formDataToSend.append("status", formData.status)

      if (videoFile) {
        formDataToSend.append("video", videoFile)
      }
      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile)
      }

      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/videos/${selectedVideo.id}`, {
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
          description: "Video updated successfully",
        })
        setIsEditDialogOpen(false)
        resetForm()
        fetchVideos()
      } else {
        console.error("Update video error:", data)
        const errorMessage = data.error 
          ? (typeof data.error === 'object' ? Object.values(data.error).flat().join(', ') : data.error)
          : data.message || "Failed to update video"
        toast({
          title: "Error",
          description: errorMessage,
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

  const handleDeleteVideo = async () => {
    if (!videoToDelete) return

    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/videos/${videoToDelete.id}`, {
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
            description: "Video deleted successfully",
          })
          fetchVideos()
        }
      } else {
        throw new Error("Failed to delete video")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setVideoToDelete(null)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      category: "",
      duration: "",
      status: "draft",
    })
    setVideoFile(null)
    setThumbnailFile(null)
    setSelectedVideo(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (video: VideoPost) => {
    setSelectedVideo(video)
    setFormData({
      title: video.title,
      description: video.description,
      content: video.content,
      category: video.category,
      duration: video.duration || "",
      status: video.status,
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (video: VideoPost) => {
    setSelectedVideo(video)
    setIsViewDialogOpen(true)
  }

  const openDeleteDialog = (video: VideoPost) => {
    setVideoToDelete(video)
    setIsDeleteDialogOpen(true)
  }

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || video.category === categoryFilter
    const matchesStatus = statusFilter === "all" || video.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalVideos = filteredVideos.length
  const publishedVideos = filteredVideos.filter((video) => video.status === "published").length
  const totalViews = filteredVideos.reduce((sum, video) => sum + video.views, 0)
  const totalLikes = filteredVideos.reduce((sum, video) => sum + video.likes, 0)

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value as "published" | "draft" | "archived" })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Video Gallery Management</h2>
          <p className="text-slate-600">Create and manage diving videos</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Video
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Total Videos</p>
                <p className="text-2xl font-bold">{totalVideos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Published</p>
                <p className="text-2xl font-bold">{publishedVideos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Total Views</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-slate-600">Total Likes</p>
                <p className="text-2xl font-bold">{totalLikes.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Videos</CardTitle>
              <CardDescription>
                {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search videos..."
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
                  <TableHead>Video</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading videos...
                    </TableCell>
                  </TableRow>
                ) : filteredVideos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No videos found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVideos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell className="max-w-[300px]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {video.thumbnail_url ? (
                              <img
                                src={getFullUrl(video.thumbnail_url) || "/placeholder.svg"}
                                alt={video.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = "none"
                                  target.nextElementSibling?.classList.remove("hidden")
                                }}
                              />
                            ) : (
                              <Video className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate" title={video.title}>
                              {video.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate" title={video.description}>
                              {video.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryOptions.find((c) => c.value === video.category)?.label || video.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{video.duration || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {video.views.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {video.likes.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(video.status)}>
                          {statusOptions.find((s) => s.value === video.status)?.label || video.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(video.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openViewDialog(video)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(video)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(video)}
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

      {/* Create Video Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Video</DialogTitle>
            <DialogDescription>Add a new diving video to your gallery</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter video title"
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
                placeholder="Brief description of the video"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Full video content/description"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 5:30"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="video">Video File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                  <Upload className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  />
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateVideo} className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Add Video"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Video Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>Update your video details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter video title"
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
                placeholder="Brief description of the video"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Full video content/description"
                rows={5}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 5:30"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-video">Video File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  />
                  <Upload className="w-4 h-4 text-gray-400" />
                </div>
                {selectedVideo?.video_url && (
                  <p className="text-xs text-gray-500 mt-1">Current: {selectedVideo.video_url.split("/").pop()}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-thumbnail">Thumbnail Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  />
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                </div>
                {selectedVideo?.thumbnail_url && (
                  <p className="text-xs text-gray-500 mt-1">Current: {selectedVideo.thumbnail_url.split("/").pop()}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateVideo} className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Video"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Video Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
            <DialogDescription>
              {categoryOptions.find((c) => c.value === selectedVideo?.category)?.label} • {selectedVideo?.duration}
            </DialogDescription>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {selectedVideo.video_url ? (
                  <video
                    controls
                    className="w-full h-full object-cover"
                    poster={selectedVideo.thumbnail_url ? getFullUrl(selectedVideo.thumbnail_url) : undefined}
                    onError={(e) => {
                      console.log("[v0] Video failed to load:", selectedVideo.video_url)
                      const target = e.target as HTMLVideoElement
                      target.style.display = "none"
                      const fallback = target.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = "block"
                    }}
                  >
                    <source src={getFullUrl(selectedVideo.video_url)} type="video/mp4" />
                    <source src={getFullUrl(selectedVideo.video_url)} type="video/webm" />
                    <source src={getFullUrl(selectedVideo.video_url)} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                ) : selectedVideo.thumbnail_url ? (
                  <img
                    src={getFullUrl(selectedVideo.thumbnail_url) || "/placeholder.svg"}
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Video className="w-12 h-12" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>Views: {selectedVideo.views}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Likes: {selectedVideo.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-500" />
                  <span>Duration: {selectedVideo.duration || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedVideo.status)}>{selectedVideo.status}</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{selectedVideo.description}</p>
              </div>

              {selectedVideo.content && (
                <div>
                  <h3 className="font-semibold mb-2">Content</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedVideo.content}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <strong>Created:</strong> {new Date(selectedVideo.created_at).toLocaleDateString()}
                </div>
                <div>
                  <strong>Updated:</strong> {new Date(selectedVideo.updated_at).toLocaleDateString()}
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
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{videoToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setVideoToDelete(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVideo} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { AdminVideosPage }
export default AdminVideosPage
