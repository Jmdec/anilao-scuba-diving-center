"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { Search, Eye, Edit, Plus, Trash2, MapPin, Waves, Loader2 } from "lucide-react"

interface DiveSite {
  id: number
  name: string
  description: string
  image: string
  location: string
  depth_min: number
  depth_max: number
  difficulty_level: "beginner" | "intermediate" | "advanced"
  visibility: string
  best_time_to_visit: string
  marine_life: string
  is_featured: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

const difficultyOptions = [
  { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
  { value: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-800" },
  { value: "advanced", label: "Advanced", color: "bg-red-100 text-red-800" },
]

const getDifficultyColor = (difficulty: string) => {
  const option = difficultyOptions.find((opt) => opt.value === difficulty)
  return option?.color || "bg-gray-100 text-gray-800"
}

const LARAVEL_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"

export default function AdminDiveSitesPage() {
  const [diveSites, setDiveSites] = useState<DiveSite[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [selectedSite, setSelectedSite] = useState<DiveSite | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<Partial<DiveSite>>({})

  useEffect(() => {
    fetchDiveSites()
  }, [])

  const fetchDiveSites = async () => {
    try {
      const response = await fetch("/api/dive-sites")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] API Response:", data)
        if (data.success) {
          setDiveSites(data.diveSites || [])
        }
      }
    } catch (error) {
      console.error("Error fetching dive sites:", error)
      toast({
        title: "Error",
        description: "Failed to load dive sites",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Error",
        description: "Name and description are required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const submitData = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          submitData.append(key, value.toString())
        }
      })

      // Add image file if selected
      if (imageFile) {
        submitData.append("image", imageFile)
      }

      const url = selectedSite ? `/api/dive-sites/${selectedSite.id}` : "/api/dive-sites"
      const method = selectedSite ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: submitData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: selectedSite ? "Dive site updated successfully" : "Dive site created successfully",
          })
          setIsEditDialogOpen(false)
          setIsAddDialogOpen(false)
          setSelectedSite(null)
          setFormData({})
          setImageFile(null)
          fetchDiveSites()
        }
      } else {
        throw new Error("Failed to save dive site")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save dive site",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (site: DiveSite) => {
    if (!confirm(`Are you sure you want to delete "${site.name}"?`)) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/dive-sites/${site.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Dive site deleted successfully",
          })
          fetchDiveSites()
        }
      } else {
        throw new Error("Failed to delete dive site")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete dive site",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const openViewDialog = (site: DiveSite) => {
    setSelectedSite(site)
    setIsViewDialogOpen(true)
  }

  const openEditDialog = (site: DiveSite) => {
    setSelectedSite(site)
    setFormData(site)
    setIsEditDialogOpen(true)
  }

  const openAddDialog = () => {
    setSelectedSite(null)
    setFormData({
      difficulty_level: "beginner",
      is_featured: false,
      is_active: true,
      sort_order: 0,
    })
    setIsAddDialogOpen(true)
  }

  const filteredSites = diveSites.filter((site) => {
    const matchesSearch =
      site.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.marine_life?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false

    const matchesDifficulty = difficultyFilter === "all" || site.difficulty_level === difficultyFilter

    return matchesSearch && matchesDifficulty
  })

  const activeSites = filteredSites.filter((site) => site.is_active).length
  const featuredSites = filteredSites.filter((site) => site.is_featured).length
  const beginnerSites = filteredSites.filter((site) => site.difficulty_level === "beginner").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dive Sites Management</h2>
          <p className="text-slate-600">Manage diving locations and site information</p>
        </div>
        <Button onClick={openAddDialog} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Dive Site
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-600" />
              <div>
                <p className="text-sm text-slate-600">Total Sites</p>
                <p className="text-2xl font-bold">{filteredSites.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Active Sites</p>
                <p className="text-2xl font-bold">{activeSites}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
              <div>
                <p className="text-sm text-slate-600">Featured</p>
                <p className="text-2xl font-bold">{featuredSites}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Beginner</Badge>
              <div>
                <p className="text-sm text-slate-600">Beginner</p>
                <p className="text-2xl font-bold">{beginnerSites}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Dive Sites</CardTitle>
              <CardDescription>
                {filteredSites.length} site{filteredSites.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search dive sites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-[250px]"
                />
              </div>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {difficultyOptions.map((difficulty) => (
                    <SelectItem key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
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
                  <TableHead>Site</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Depth</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading dive sites...
                    </TableCell>
                  </TableRow>
                ) : filteredSites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No dive sites found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              site.image
                                ? `${LARAVEL_BASE_URL}/uploads/dive-sites/${site.image}`
                                : "/placeholder.svg?height=40&width=60"
                            }
                            alt={site.name}
                            className="w-15 h-10 object-cover rounded-lg"
                          />
                          <div>
                            <div className="font-medium">{site.name}</div>
                            {site.is_featured && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">Featured</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{site.location}</TableCell>
                      <TableCell>
                        {site.depth_min}m - {site.depth_max}m
                      </TableCell>
                      <TableCell>
                        <Badge className={getDifficultyColor(site.difficulty_level)}>
                          {difficultyOptions.find((d) => d.value === site.difficulty_level)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={site.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {site.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openViewDialog(site)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(site)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(site)}
                            disabled={isDeleting}
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSite?.name}</DialogTitle>
            <DialogDescription>{selectedSite?.location}</DialogDescription>
          </DialogHeader>
          {selectedSite && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={
                    selectedSite.image
                      ? `${LARAVEL_BASE_URL}/uploads/dive-sites/${selectedSite.image}`
                      : "/placeholder.svg?height=200&width=300"
                  }
                  alt={selectedSite.name}
                  className="w-full max-w-md h-48 object-cover rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-800">Site Details</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Depth:</strong> {selectedSite.depth_min}m - {selectedSite.depth_max}m
                    </p>
                    <p>
                      <strong>Difficulty:</strong> {selectedSite.difficulty_level}
                    </p>
                    <p>
                      <strong>Visibility:</strong> {selectedSite.visibility}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Best Time</h4>
                  <p className="text-sm">{selectedSite.best_time_to_visit}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Description</h4>
                <p className="text-sm">{selectedSite.description}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Marine Life</h4>
                <p className="text-sm">{selectedSite.marine_life}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setIsEditDialogOpen(false)
            setFormData({})
            setImageFile(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSite ? "Edit Dive Site" : "Add New Dive Site"}</DialogTitle>
            <DialogDescription>
              {selectedSite ? "Update dive site information" : "Create a new dive site"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Site Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter site name"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Anilao, Batangas"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the dive site..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="image">Site Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="depth_min">Min Depth (m)</Label>
                <Input
                  id="depth_min"
                  type="number"
                  value={formData.depth_min || ""}
                  onChange={(e) => setFormData({ ...formData, depth_min: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="depth_max">Max Depth (m)</Label>
                <Input
                  id="depth_max"
                  type="number"
                  value={formData.depth_max || ""}
                  onChange={(e) => setFormData({ ...formData, depth_max: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficulty_level || "beginner"}
                onValueChange={(value) => setFormData({ ...formData, difficulty_level: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Input
                id="visibility"
                value={formData.visibility || ""}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                placeholder="e.g., 15-25 meters"
              />
            </div>

            <div>
              <Label htmlFor="best_time">Best Time to Visit</Label>
              <Input
                id="best_time"
                value={formData.best_time_to_visit || ""}
                onChange={(e) => setFormData({ ...formData, best_time_to_visit: e.target.value })}
                placeholder="e.g., November to May"
              />
            </div>

            <div>
              <Label htmlFor="marine_life">Marine Life</Label>
              <Textarea
                id="marine_life"
                value={formData.marine_life || ""}
                onChange={(e) => setFormData({ ...formData, marine_life: e.target.value })}
                placeholder="Describe the marine life that can be seen..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="is_featured">Featured Site</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active !== false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setIsEditDialogOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : selectedSite ? (
                  "Update Site"
                ) : (
                  "Create Site"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
