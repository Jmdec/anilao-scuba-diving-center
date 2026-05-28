import { type NextRequest, NextResponse } from "next/server"
import { generateCertificatePDF } from "@/lib/pdf-generator"
import nodemailer from "nodemailer"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: applicationId } = params
    const { status } = await request.json()

    console.log("[v0] Processing application ID:", applicationId, "with status:", status)

    const statusUpdateUrl = `${process.env.NEXT_PUBLIC_API_URL}/certification-applications/${applicationId}/status`
    console.log("[v0] Updating status at URL:", statusUpdateUrl)

    // First, update the status in Laravel backend
    const statusResponse = await fetch(statusUpdateUrl, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    if (!statusResponse.ok) {
      console.log("[v0] Status update failed:", statusResponse.status, statusResponse.statusText)
      throw new Error(`Failed to update status: ${statusResponse.status} ${statusResponse.statusText}`)
    }

    const statusData = await statusResponse.json()
    console.log("[v0] Status updated successfully:", statusData)

    // If status is completed, generate and send certificate
    if (status === "completed") {
      const allApplicationsUrl = `${process.env.NEXT_PUBLIC_API_URL}/certification-applications`
      console.log("[v0] Fetching all applications from:", allApplicationsUrl)

      const response = await fetch(allApplicationsUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.log("[v0] API response not ok:", response.status, response.statusText)
        throw new Error(`Failed to fetch applications: ${response.status} ${statusResponse.statusText}`)
      }

      const allData = await response.json()
      console.log("[v0] Successfully fetched all applications:", allData)

      const applications = allData.data || allData.applications || allData
      const applicationData = applications.find((app: any) => app.id === Number.parseInt(applicationId))

      if (!applicationData) {
        throw new Error(`Application with ID ${applicationId} not found`)
      }

      const application = {
        id: Number.parseInt(applicationId),
        user: {
          name: applicationData.user?.name || applicationData.name || "Unknown User",
          email: applicationData.user?.email || applicationData.email || "no-email@example.com",
        },
        certification: {
          name: applicationData.certification?.name || applicationData.certification_name || "Unknown Certification",
        },
        completed_at: applicationData.completed_at || applicationData.completion_date || new Date().toISOString(),
      }

      // Generate certificate PDF
      const pdfBuffer = await generateCertificatePDF({
        userName: application.user.name,
        certificationName: application.certification.name,
        completionDate: new Date(application.completed_at).toLocaleDateString(),
        certificateId: `CERT-${applicationId}-${Date.now()}`,
      })

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number.parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      // Send email with certificate
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: application.user.email,
        subject: `Your ${application.certification.name} Certificate`,
        html: `
          <h2>Congratulations ${application.user.name}!</h2>
          <p>You have successfully completed the <strong>${application.certification.name}</strong> certification.</p>
          <p>Please find your certificate attached to this email.</p>
          <p>Certificate ID: CERT-${applicationId}-${Date.now()}</p>
          <p>Completion Date: ${new Date(application.completed_at).toLocaleDateString()}</p>
        `,
        attachments: [
          {
            filename: `certificate-${applicationId}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      })

      return NextResponse.json({
        success: true,
        message: "Status updated and certificate sent successfully",
        application: application,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      data: statusData,
    })
  } catch (error) {
    console.error("[v0] Error processing certificate:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process certificate",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
