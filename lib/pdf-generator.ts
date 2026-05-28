import puppeteer from "puppeteer"
import { readFileSync } from "fs"
import { join } from "path"

function formatDate(dateString: string): string {
  if (!dateString || dateString === "undefined" || dateString === "null") {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    })
  }

  const date = new Date(dateString)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    })
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const month = months[date.getMonth()]
  const day = date.getDate().toString().padStart(2, "0")
  const year = date.getFullYear()

  return `${month} ${day}, ${year}`
}

export async function generateCertificatePDF({
  userName,
  certificationName,
  completionDate,
  certificateId,
}: {
  userName: string
  certificationName: string
  completionDate: string
  certificateId: string
}) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()

    let logoBase64 = ""
    try {
      const logoPath = join(process.cwd(), "public", "logo.png")
      const logoBuffer = readFileSync(logoPath)
      logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString("base64")}`
    } catch (error) {
      console.log("[v0] Logo file not found, using placeholder")
      logoBase64 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    }

    let signatureBase64 = ""
    try {
      const signaturePath = join(process.cwd(), "public", "signature.png")
      const signatureBuffer = readFileSync(signaturePath)
      signatureBase64 = `data:image/png;base64,${signatureBuffer.toString("base64")}`
    } catch (error) {
      console.log("[v0] Signature file not found, using placeholder")
    }

    const formattedDate = formatDate(completionDate)

    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Certificate</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
            
            body { 
              margin: 0; 
              padding: 0; 
              font-family: 'Inter', sans-serif;
              background: #ffffff;
            }
            
            /* Enlarged certificate and removed outer padding */
            .certificate-container { 
              width: 100vw; 
              height: 100vh; 
              margin: 0;
              background: white;
              position: relative;
              border: 6px solid #1e40af;
              box-shadow: none;
              box-sizing: border-box;
            }
            
            /* Adjusted inner border for larger size */
            .inner-border {
              position: absolute;
              inset: 20px;
              border: 3px solid #0ea5e9;
              background: white;
            }
            
            /* Scaled up decorative corners */
            .decorative-corners {
              position: absolute;
              width: 40px;
              height: 40px;
              border: 3px solid #06b6d4;
            }
            
            .corner-tl { top: 40px; left: 40px; border-right: none; border-bottom: none; }
            .corner-tr { top: 40px; right: 40px; border-left: none; border-bottom: none; }
            .corner-bl { bottom: 40px; left: 40px; border-right: none; border-top: none; }
            .corner-br { bottom: 40px; right: 40px; border-left: none; border-top: none; }
            
            /* Increased logo size from 80px to 120px */
            .logo {
              position: absolute;
              top: 60px;
              left: 50%;
              transform: translateX(-50%);
              width: 120px;
              height: 120px;
              object-fit: contain;
              z-index: 10;
            }
            
            /* Increased content padding and font sizes */
            .content {
              position: relative;
              z-index: 10;
              text-align: center;
              padding: 160px 80px 60px;
            }
            
            .title {
              font-family: 'Playfair Display', serif;
              font-size: 3rem;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 1.5rem;
              letter-spacing: 2px;
            }
            
            .subtitle {
              font-size: 1.3rem;
              color: #475569;
              margin-bottom: 2rem;
              font-weight: 400;
            }
            
            .name {
              font-family: 'Playfair Display', serif;
              font-size: 2.5rem;
              font-weight: 600;
              color: #1e3a8a;
              margin-bottom: 2rem;
              border-bottom: 4px solid #0ea5e9;
              padding-bottom: 0.8rem;
              display: inline-block;
              min-width: 400px;
            }
            
            .cert-name {
              font-family: 'Playfair Display', serif;
              font-size: 2rem;
              font-weight: 600;
              color: #0ea5e9;
              margin-bottom: 1.5rem;
              font-style: italic;
            }
            
            .completion-text {
              font-size: 1.3rem;
              color: #64748b;
              margin-bottom: 3rem;
            }
            
            /* Increased bottom section size and spacing */
            .bottom-section {
              position: absolute;
              bottom: 40px;
              left: 80px;
              right: 80px;
              height: 100px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            
            /* Updated signature section to be positioned on the left */
            .signature-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              flex-shrink: 0;
              margin: 0;
            }

            .signature-image {
              width: 180px;
              height: 70px;
              object-fit: contain;
              margin-bottom: 2px;
            }
            
            .signature-line {
              border-top: 2px solid #64748b;
              width: 180px;
              margin-bottom: 4px;
            }
            
            .signature-text {
              font-size: 1rem;
              color: #475569;
              font-weight: 500;
            }
            
            /* Improved certificate info alignment and spacing */
            .cert-info {
              text-align: left;
              font-size: 1rem;
              color: #64748b;
              line-height: 1.4;
              flex-shrink: 0;
              min-width: 220px;
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
            }
            
            .cert-info div {
              margin-bottom: 4px;
              font-weight: 500;
            }
            
            .cert-info div:last-child {
              margin-bottom: 0;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="inner-border">
              <div class="decorative-corners corner-tl"></div>
              <div class="decorative-corners corner-tr"></div>
              <div class="decorative-corners corner-bl"></div>
              <div class="decorative-corners corner-br"></div>
              
              <img src="${logoBase64}" class="logo" alt="Logo" />
              
              <div class="content">
                <h1 class="title">CERTIFICATE OF COMPLETION</h1>
                <div class="subtitle">This is to certify that</div>
                <div class="name">${userName}</div>
                <div class="subtitle">has successfully completed the</div>
                <div class="cert-name">${certificationName}</div>
                <div class="completion-text">Completed on ${formattedDate}</div>
              </div>
              
              <div class="bottom-section">
                <div class="signature-section">
                  ${signatureBase64 ? `<img src="${signatureBase64}" class="signature-image" alt="Instructor Signature" />` : '<div class="signature-line"></div>'}
                  <div class="signature-text">Certified Instructor</div>
                </div>
                
                <div class="cert-info">
                 
                  <div><strong>Issue Date:</strong> ${formattedDate}</div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    await page.setContent(fullHTML, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
