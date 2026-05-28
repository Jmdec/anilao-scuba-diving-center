"use client"

import { Facebook, MessageCircle, Mail, Phone, Send, Share2 } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"

export default function FloatingSocialMedia() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  // Hide floating social media on /signup-required and /app/not-found pages
  const isSignupRequiredPage = pathname === "/signup-required"
  const isNotFoundPage = pathname === "/app/not-found"

  // If on the signup-required or not-found page, don't show the floating social media
  if (isSignupRequiredPage || isNotFoundPage) {
    return null
  }

  if (pathname?.startsWith("/admin")) {
    return null
  }

  const socialLinks = [
    {
      icon: Facebook,
      href: "https://www.facebook.com/AnilaoScubaDiveCenter",
      label: "Facebook",
      bgColorClass: "bg-blue-600",
      iconColorClass: "text-white",
      hoverEffectClass: "hover:brightness-90",
    },
    {
      icon: MessageCircle,
      href: "https://wa.me/09054352513",
      label: "WhatsApp",
      bgColorClass: "bg-green-600",
      iconColorClass: "text-white",
      hoverEffectClass: "hover:brightness-90",
    },
    {
      icon: Send,
      href: "https://t.me/09054352513",
      label: "Telegram",
      bgColorClass: "bg-sky-500",
      iconColorClass: "text-white",
      hoverEffectClass: "hover:brightness-90",
    },
    {
      icon: Mail,
      href: "mailto:fgbaoin@yahoo.com",
      label: "Email",
      bgColorClass: "bg-red-600",
      iconColorClass: "text-white",
      hoverEffectClass: "hover:brightness-90",
    },
    {
      icon: Phone,
      href: "tel:+639054352513",
      label: "Call Us",
      bgColorClass: "bg-blue-500",
      iconColorClass: "text-white",
      hoverEffectClass: "hover:brightness-90",
    },
  ]

  return (
    <>
      {/* Mobile Layout */}
      <div className="fixed right-6 bottom-6 z-50 md:hidden">
        <div
          className={`flex flex-col items-center space-y-3 transition-all duration-500 ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}`}
        >
          {socialLinks.map((social, index) => {
            const Icon = social.icon
            return (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-14 h-14 shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group ${social.bgColorClass} ${social.hoverEffectClass}`}
                title={social.label}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <Icon className={`h-9 w-9 ${social.iconColorClass}`} />
                <span className="absolute right-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {social.label}
                </span>
              </a>
            )
          })}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 mt-4"
          title="Social Media"
        >
          <div className={`transform transition-transform duration-300 ${isExpanded ? "rotate-45" : "rotate-0"}`}>
            {isExpanded ? (
              <div className="w-6 h-0.5 bg-white relative">
                <div className="w-6 h-0.5 bg-white absolute top-0 rotate-90"></div>
              </div>
            ) : (
              <Share2 className="h-7 w-7" />
            )}
          </div>
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 flex-col gap-2 z-50 hidden md:flex">
        {socialLinks.map((social, index) => {
          const Icon = social.icon
          return (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-12 h-12 shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group ${social.bgColorClass} ${social.hoverEffectClass}`}
              title={social.label}
            >
              <Icon className={`h-6 w-6 ${social.iconColorClass}`} />
              <span className="absolute right-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {social.label}
              </span>
            </a>
          )
        })}
      </div>
    </>
  )
}
