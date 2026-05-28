import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bed, Users, Award, BarChart3 } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-cyan-900">Dashboard Overview</h2>
        <p className="text-cyan-600">Welcome to ASDC Anilao Admin Panel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-cyan-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-900">Total Rooms</CardTitle>
            <Bed className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-900">4</div>
            <p className="text-xs text-cyan-600">Available room types</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-900">Active Bookings</CardTitle>
            <BarChart3 className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-900">12</div>
            <p className="text-xs text-cyan-600">Current reservations</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-900">Registered Users</CardTitle>
            <Users className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-900">48</div>
            <p className="text-xs text-cyan-600">Total members</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-900">Certifications</CardTitle>
            <Award className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-900">23</div>
            <p className="text-xs text-cyan-600">Applications pending</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
