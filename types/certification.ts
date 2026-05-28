export interface User {
  id: number
  name: string
  email: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_conditions?: string
}

export interface Certification {
  id: number
  name: string
  description?: string
  duration?: string
  price?: number
}

export interface CertificationApplication {
  id: number
  user_id: number
  certification_id: number
  status: "pending" | "approved" | "ongoing" | "completed" | "cancelled" | "rejected"
  payment_method: string
  preferred_start_date: string
  diving_experience_years: number
  total_dives: number
  deepest_dive: number
  last_dive_date?: string
  emergency_contact_relationship: string
  screenshot_payment?: string
  created_at: string
  updated_at: string
  user?: User
  certification?: Certification
}
