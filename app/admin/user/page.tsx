"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

// User type matches your Laravel $fillable
type User = {
  id: number
  name: string
  email: string
  phone: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  medical_conditions: string | null
  diving_experience: string | null
  current_certification_level: string | null
}

// Grouped certification levels
const CERT_GROUPS = {
  "Entry Level": ["None", "Beginner"],
  "Recreational": [
    "Open Water",
    "Advanced",
    "Advanced Open Water",
    "Rescue Diver",
  ],
  Professional: ["Divemaster", "Instructor", "Professional"],
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedLevel, setSelectedLevel] = useState<{ [key: number]: string }>(
    {}
  )
  const { toast } = useToast()

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch users",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const updateCertification = async (userId: number) => {
    const newLevel = selectedLevel[userId]
    if (!newLevel) {
      toast({
        title: "Warning",
        description: "Please select a certification level first",
      })
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_certification_level: newLevel }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        toast({
          title: "Updated",
          description: "Certification updated successfully",
        })
        fetchUsers()
      } else {
        throw new Error(data.message || "Failed to update")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Emergency Contact</TableHead>
            <TableHead>Medical Conditions</TableHead>
            <TableHead>Diving Experience</TableHead>
            <TableHead>Certification Level</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone || "-"}</TableCell>
              <TableCell>
                {user.emergency_contact_name
                  ? `${user.emergency_contact_name} (${user.emergency_contact_phone || "-"})`
                  : "-"}
              </TableCell>
              <TableCell>{user.medical_conditions || "-"}</TableCell>
              <TableCell>{user.diving_experience || "-"}</TableCell>
              <TableCell>{user.current_certification_level || "None"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(value) =>
                      setSelectedLevel((prev) => ({ ...prev, [user.id]: value }))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CERT_GROUPS).map(([group, levels]) => (
                        <div key={group}>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                            {group}
                          </div>
                          {levels.map((lvl) => (
                            <SelectItem key={lvl} value={lvl}>
                              {lvl}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => updateCertification(user.id)}
                    size="sm"
                  >
                    Update
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
