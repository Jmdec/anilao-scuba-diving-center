import { WavePattern } from "@/components/ui/wave-pattern"
import { Facebook, Mail, Phone, MapPin, Waves } from "lucide-react"
import { FaTiktok } from "react-icons/fa" // Import TikTok icon
export function Footer() {
  return (
    <>
      {/* Wave Pattern Footer */}
      <WavePattern className="mt-auto" />

      <footer className="bg-gradient-to-br from-cyan-900 via-cyan-800 to-blue-900 text-white relative z-10 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-cyan-400 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-blue-400 blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <img src="/logo.png" alt="ASDC Logo" className="w-12 h-12 brightness-0 invert" />
                  <div className="absolute -inset-2 bg-cyan-400/20 rounded-full blur-sm"></div>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">ASDC Anilao</h3>
                  <p className="text-cyan-200 font-medium">Scuba Diving Center</p>
                </div>
              </div>
              <p className="text-cyan-100 leading-relaxed mb-4 max-w-md">
                Discover the underwater wonders of Anilao, Batangas. From vibrant coral reefs to diverse marine life,
                we're your trusted partner for unforgettable diving adventures in the Philippines.
              </p>

              {/* Social Links */}
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/AnilaoScubaDiveCenter"
                  className="group p-3 bg-white/10 rounded-full hover:bg-cyan-400 transition-all duration-300 hover:scale-110"
                >
                  <Facebook className="w-5 h-5 group-hover:text-white" />
                </a>
                <a
                  href="https://www.tiktok.com/@ginafaith05"
                  className="group p-3 bg-white/10 rounded-full hover:bg-black transition-all duration-300 hover:scale-110"
                >
                  <FaTiktok className="w-5 h-5 group-hover:text-white transition-all duration-300 hover:scale-110" />
                </a>
                <a
                  href="mailto:fgbaoin@yahoo.com"
                  className="group p-3 bg-white/10 rounded-full hover:bg-green-500 transition-all duration-300 hover:scale-110"
                >
                  <Mail className="w-5 h-5 group-hover:text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
           <div className="mt-8">
  <h4 className="font-semibold text-lg mb-4 text-white flex items-center gap-2">
    <Waves className="w-5 h-5 text-cyan-400" />
    Quick Links
  </h4>
  <ul className="space-y-2">
    {[
      { text: "Booking", href: "/booking" },
      { text: "Certifications", href: "/certifications" },
      { text: "Gallery", href: "/blog" },
    ].map((item) => (
      <li key={item.text}>
        <a
          href={item.href}
          className="text-cyan-200 hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
        >
          {item.text}
        </a>
      </li>
    ))}
  </ul>
</div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-lg mb-4 text-white">Get in Touch</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-cyan-100 text-sm leading-relaxed">
                      Anilao, Mabini
                      <br />
                      Batangas, Philippines
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <a href="tel:+63" className="text-cyan-100 hover:text-white transition-colors">
                    +63 905 435 2513
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <a href="mailto:fgbaoin@yahoo.com" className="text-cyan-100 hover:text-white transition-colors">
                    fgbaoin@yahoo.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          {/* <div className="border-t border-cyan-700/50 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-cyan-200 text-sm">© 2024 ASDC Anilao Scuba Diving Center. All rights reserved.</p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-cyan-200 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-cyan-200 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-cyan-200 hover:text-white transition-colors">
                  Safety Guidelines
                </a>
              </div>
            </div>
          </div> */}
        </div>
      </footer>
    </>
  )
}
