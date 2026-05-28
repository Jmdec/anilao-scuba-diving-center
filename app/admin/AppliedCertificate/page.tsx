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
import { Search, Eye, Edit, FileImage, Loader2 } from "lucide-react"
import type { CertificationApplication } from "@/types/certification"

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-800" },
  { value: "ongoing", label: "Ongoing", color: "bg-blue-100 text-blue-800" },
  { value: "completed", label: "Completed", color: "bg-purple-100 text-purple-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
]

const getStatusColor = (status: string) => {
  const statusOption = statusOptions.find((option) => option.value === status)
  return statusOption?.color || "bg-gray-100 text-gray-800"
}

const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null
  if (imagePath.startsWith("http")) return imagePath
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || ""
  return `${backendUrl}/${imagePath}`
}

export default function AppliedCertificatePage() {
  const [applications, setApplications] = useState<CertificationApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplication, setSelectedApplication] = useState<CertificationApplication | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/certifications/applications")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] API Response:", data) // Debug log to see the response structure
        if (data.success) {
          setApplications(data.applications || [])
        }
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !newStatus) return

    setIsUpdatingStatus(true)

    try {
      const response = await fetch(`/api/certifications/applications/${selectedApplication.id}/status`, {
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
            description:
              newStatus === "completed"
                ? "Status updated successfully! Certificate will be sent to the user's email."
                : "Status updated successfully",
          })
          setIsStatusDialogOpen(false)
          setSelectedApplication(null)
          setNewStatus("")
          fetchApplications()
        }
      } else {
        throw new Error("Failed to update status")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const openViewDialog = (application: CertificationApplication) => {
    setSelectedApplication(application)
    setIsViewDialogOpen(true)
  }

  const openStatusDialog = (application: CertificationApplication) => {
    setSelectedApplication(application)
    setNewStatus(application.status)
    setIsStatusDialogOpen(true)
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.certification?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false

    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-cyan-900">Certification Applications</h2>
          <p className="text-cyan-600">Manage certification applications and track progress</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Applications</CardTitle>
              <CardDescription>
                {filteredApplications.length} application{filteredApplications.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search applications..."
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
                  <TableHead>Applicant</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.user?.name}</div>
                          <div className="text-sm text-gray-500">{application.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{application.certification?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {application.payment_method}
                          {application.screenshot_payment && <FileImage className="w-4 h-4 text-green-600" />}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(application.preferred_start_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(application.status)}>
                          {statusOptions.find((s) => s.value === application.status)?.label || application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openViewDialog(application)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openStatusDialog(application)}>
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

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApplication?.certification?.name} - {selectedApplication?.user?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-cyan-800">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Name:</strong> {selectedApplication.user?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedApplication.user?.email}
                    </p>
                    <p>
                      <strong>Preferred Start:</strong>{" "}
                      {new Date(selectedApplication.preferred_start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-800">Emergency Contact</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Name:</strong> {selectedApplication.user?.emergency_contact_name}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedApplication.user?.emergency_contact_phone}
                    </p>
                    <p>
                      <strong>Relationship:</strong> {selectedApplication.emergency_contact_relationship}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-800">Diving Experience</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Years:</strong> {selectedApplication.diving_experience_years}
                    </p>
                    <p>
                      <strong>Total Dives:</strong> {selectedApplication.total_dives}
                    </p>
                    <p>
                      <strong>Deepest Dive:</strong> {selectedApplication.deepest_dive}m
                    </p>
                    <p>
                      <strong>Last Dive:</strong>{" "}
                      {selectedApplication.last_dive_date
                        ? new Date(selectedApplication.last_dive_date).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-800">Payment Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Method:</strong> {selectedApplication.payment_method}
                    </p>
                    {selectedApplication.screenshot_payment && (
                      <div>
                        <p>
                          <strong>Payment Screenshot:</strong>
                        </p>
                        <img
                          src={getImageUrl(selectedApplication.screenshot_payment) || "/placeholder.svg"}
                          alt="Payment Screenshot"
                          className="w-full max-w-xs h-32 object-cover border rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {selectedApplication.user?.medical_conditions && (
                <div>
                  <h4 className="font-semibold text-cyan-800">Medical Conditions</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedApplication.user?.medical_conditions}</p>
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
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>Change the status for {selectedApplication?.user?.name}'s application</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Status</label>
              <p className="text-sm text-gray-600">
                {statusOptions.find((s) => s.value === selectedApplication?.status)?.label}
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
            {newStatus === "completed" && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  📧 When you update the status to "Completed", a certificate will be automatically generated and sent
                  to the user's email address.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                className="bg-cyan-600 hover:bg-cyan-700"
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

      {/* Removed Toaster component */}
    </div>
  )
}
