import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendCertificateEmail({
  to,
  userName,
  certificationName,
  pdfBuffer,
}: {
  to: string
  userName: string
  certificationName: string
  pdfBuffer: Buffer
}) {
  console.log("[v0] Sending certificate email to:", to)

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: `🎉 Congratulations! Your ${certificationName} Certificate`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin-bottom: 10px;">Congratulations, ${userName}!</h1>
          <p style="font-size: 18px; color: #374151;">You have successfully completed your certification!</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; margin-top: 0;">Certificate Details</h2>
          <p><strong>Certification:</strong> ${certificationName}</p>
          <p><strong>Recipient:</strong> ${userName}</p>
          <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; color: #065f46;">
            <strong>📎 Your certificate is attached to this email as a PDF file.</strong>
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
          This certificate serves as official proof of your successful completion of the ${certificationName} program.
          Please keep it for your records.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px;">
            This email was sent automatically. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `${certificationName.replace(/\s+/g, "_")}_Certificate_${userName.replace(/\s+/g, "_")}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log("[v0] Certificate email sent successfully")
  } catch (error) {
    console.error("[v0] Failed to send certificate email:", error)
    throw error
  }
}
