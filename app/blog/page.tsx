"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Play, Eye, Heart, Search, Calendar, Waves, Fish, Camera,
  Anchor, Sparkles, FileText, X, Clock, ChevronLeft, ChevronRight,
  Video, ImageIcon, BookOpen
} from "lucide-react"
import { Footer } from "@/components/footer"

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoPost {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  duration: string
  views: number
  likes: number
  comments: number
  category: string
  publishedAt: string
  featured: boolean
}

interface PhotoPost {
  id: string
  title: string
  description: string
  image_url: string       // first image, used as card thumbnail
  images: string[]        // all images for carousel (at least one entry)
  badge: string
  category: string
  created_at: string
  updated_at: string
}

interface BlogPost {
  id: string
  title: string
  description: string
  content: string
  category: string
  created_at: string
  updated_at: string
  thumbnail?: string
  video_poster?: string  // video_url used as card/poster preview when no thumbnail_url exists
  image_url?: string
  video_url?: string
  media_type?: "video" | "photo" | null
}

type ContentItem =
  | (VideoPost & { type: "video" })
  | (PhotoPost & { type: "photo" })
  | (BlogPost & { type: "blog" })

type CategoryFilter =
  | "all"
  | "scuba-diving"
  | "freediving"
  | "underwater-photography"
  | "marine-life"
  | "dive-sites"
  | "diving-equipment"
  | "diving-safety"
  | "diving-courses"

// ─── Shared helpers (used in both modal and page) ─────────────────────────────

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "scuba-diving": "bg-gradient-to-r from-cyan-400 to-blue-500 text-white",
    freediving: "bg-gradient-to-r from-green-400 to-green-500 text-white",
    "underwater-photography": "bg-gradient-to-r from-purple-400 to-purple-500 text-white",
    "marine-life": "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
    "dive-sites": "bg-gradient-to-r from-red-400 to-red-500 text-white",
    "diving-equipment": "bg-gradient-to-r from-gray-400 to-gray-500 text-white",
    "diving-safety": "bg-gradient-to-r from-pink-400 to-pink-500 text-white",
    "diving-courses": "bg-gradient-to-r from-teal-400 to-teal-500 text-white",
  }
  return colors[category] || "bg-gray-100 text-gray-800"
}

const getCategoryLabel = (cat: string) =>
  cat.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

const formatDateLong = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

const formatDateShort = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const escapeSvgText = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const getPlaceholderThumbnail = (title: string) => {
  const safeTitle = escapeSvgText((title || "Untitled Video").trim()).slice(0, 48)
  const parts = safeTitle.length > 24 ? [safeTitle.slice(0, 24), safeTitle.slice(24)] : [safeTitle]
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#071b2f" />
          <stop offset="100%" stop-color="#0f3a57" />
        </linearGradient>
        <linearGradient id="p" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" rx="40" fill="url(#g)" />
      <rect x="60" y="60" width="1160" height="600" rx="40" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" stroke-width="2" />
      <circle cx="640" cy="360" r="120" fill="rgba(255,255,255,0.08)" />
      <path d="M610 320 L610 400 L690 360 Z" fill="url(#p)" />
      ${parts.map((line, index) => `
        <text x="640" y="520" text-anchor="middle" fill="#f8fafc" font-family="Inter, sans-serif" font-size="48" font-weight="700" letter-spacing="-0.03em" dy="${index * 64}em">${line}</text>
      `).join("")}
      <rect x="80" y="38" width="260" height="56" rx="28" fill="rgba(255,255,255,0.08)" />
      <text x="210" y="72" text-anchor="middle" fill="#cbd5e1" font-family="Inter, sans-serif" font-size="22" font-weight="600">Video Preview</text>
      <rect x="1000" y="560" width="160" height="36" rx="18" fill="rgba(255,255,255,0.08)" />
      <text x="1080" y="585" text-anchor="middle" fill="#94a3b8" font-family="Inter, sans-serif" font-size="18" font-weight="500">Anilao</text>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const getSafeThumbnail = (
  title: string,
  thumbnail?: string | null
) => {
  return thumbnail && thumbnail.trim() !== ""
    ? thumbnail
    : getPlaceholderThumbnail(title)
}

const PhotoCard = ({ item, className, onClick }: { item: PhotoPost; className: string; onClick: () => void }) => {
  const [carouselIndex, setCarouselIndex] = useState(0)

  useEffect(() => {
    setCarouselIndex(0)
  }, [item.id])

  const imageSources = item.images?.length
    ? item.images
    : [
      item.image_url ||
      getPlaceholderThumbnail(item.title)
    ]
  const currentImage = imageSources[carouselIndex] || imageSources[0]

  return (
    <Card key={item.id} className={className} onClick={onClick}>
      <div className="group relative overflow-hidden h-52 bg-slate-900">
        <img
          src={currentImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.currentTarget.src = getPlaceholderThumbnail(item.title)
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {imageSources.length > 1 && (
          <>
            <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {carouselIndex + 1}/{imageSources.length}
            </span>
          </>
        )}

        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          <ImageIcon className="w-3 h-3" /> Photo
        </span>
      </div>

      <CardContent className="p-6 flex flex-col flex-1">
        <Badge className={`mb-4 text-sm font-medium rounded-full px-3 py-1 self-start border-0 ${getCategoryColor(item.category)}`}>
          {getCategoryLabel(item.category)}
        </Badge>
        <h3 className="font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors text-xl leading-tight">
          {item.title}
        </h3>
        <p className="text-slate-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">
          {item.description}
        </p>
        <div className="flex items-center justify-between text-sm text-slate-500 mt-auto pt-4 border-t border-slate-100">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateShort(item.created_at)}</span>
          <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
            {imageSources.length} photo{imageSources.length > 1 ? "s" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Modal Component ──────────────────────────────────────────────────────────

interface ContentModalProps {
  item: ContentItem | null
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}

const ContentModal = ({ item, onClose, onPrev, onNext, hasPrev, hasNext }: ContentModalProps) => {
  useEffect(() => {
    if (!item) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && hasPrev) onPrev()
      if (e.key === "ArrowRight" && hasNext) onNext()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [item, onClose, onPrev, onNext, hasPrev, hasNext])

  const [carouselIndex, setCarouselIndex] = useState(0)

  // Reset carousel when item changes
  useEffect(() => {
    setCarouselIndex(0)
  }, [item?.id])

  if (!item) return null

  // Type pill shown in the modal top bar
  const TypeBadge = () => {
    if (item.type === "video") return (
      <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
        <Video className="w-3.5 h-3.5" /> Video
      </span>
    )
    if (item.type === "photo") return (
      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
        <ImageIcon className="w-3.5 h-3.5" /> Photo
      </span>
    )
    return (
      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
        <BookOpen className="w-3.5 h-3.5" /> Article
      </span>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">

        {/* ── Sticky top bar: Prev | type pill | Next + Close ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white/95 backdrop-blur-sm shrink-0 z-10">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-50"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-50"
              aria-label="Next"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1">

          {/* ── VIDEO modal ── */}
          {item.type === "video" && (
            <>
              <div className="bg-black aspect-video w-full">
                {item.videoUrl && item.videoUrl !== "#" ? (
                  <video
                    src={item.videoUrl}
                    poster={item.thumbnail}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={item.thumbnail || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-60"
                      onError={(e) => {
                        e.currentTarget.src = getPlaceholderThumbnail(item.title)
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <Play className="w-8 h-8 text-cyan-500 translate-x-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <Badge className={`rounded-full px-3 py-1 text-sm font-medium border-0 ${getCategoryColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </Badge>
                  {item.featured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 rounded-full px-3 py-1 text-sm font-medium">
                      ⭐ Featured
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 leading-tight">{item.title}</h2>
                <p className="text-slate-600 text-base leading-relaxed mb-6">{item.description}</p>
                <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 pt-5 border-t border-slate-100">
                  <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-cyan-500" />{formatNumber(item.views)} views</span>
                  <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500" />{formatNumber(item.likes)} likes</span>
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" />{item.duration}</span>
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" />{formatDateLong(item.publishedAt)}</span>
                </div>
              </div>
            </>
          )}

          {/* ── PHOTO modal ── */}
          {item.type === "photo" && (
            <>
              {/* Carousel */}
              <div className="relative bg-slate-950 flex items-center justify-center select-none" style={{ minHeight: "320px", maxHeight: "65vh" }}>
                <img
                  key={carouselIndex}
                  src={
                    item.images?.[carouselIndex] ||
                    item.image_url ||
                    getPlaceholderThumbnail(item.title)
                  }
                  alt={`${item.title} – ${carouselIndex + 1} of ${item.images?.length ?? 1}`}
                  className="w-full object-contain transition-opacity duration-300"
                  style={{ maxHeight: "65vh" }}
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderThumbnail(item.title)
                  }}
                />

                {/* Prev / Next arrows — only when multiple images */}
                {(item.images?.length ?? 1) > 1 && (
                  <>
                    <button
                      onClick={() => setCarouselIndex((i) => Math.max(0, i - 1))}
                      disabled={carouselIndex === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 disabled:opacity-20 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCarouselIndex((i) => Math.min((item.images?.length ?? 1) - 1, i + 1))}
                      disabled={carouselIndex === (item.images?.length ?? 1) - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 disabled:opacity-20 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-3 left-4 flex items-center gap-1.5">
                      {item.images?.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCarouselIndex(idx)}
                          className={`rounded-full transition-all ${idx === carouselIndex ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
                          aria-label={`Go to photo ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Bottom-right counter + quick next button */}
                    <div className="absolute bottom-3 right-4 flex items-center gap-2 bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      <span>{carouselIndex + 1} / {item.images?.length}</span>
                      <button
                        onClick={() => setCarouselIndex((i) => Math.min((item.images?.length ?? 1) - 1, i + 1))}
                        disabled={carouselIndex === (item.images?.length ?? 1) - 1}
                        className="rounded-full bg-white/10 hover:bg-white/20 p-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail strip — only when multiple images */}
              {(item.images?.length ?? 1) > 1 && (
                <div className="flex gap-2 px-4 py-3 bg-slate-900 overflow-x-auto">
                  {item.images?.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${idx === carouselIndex ? "border-cyan-400 opacity-100" : "border-transparent opacity-50 hover:opacity-80"}`}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = getPlaceholderThumbnail(item.title)
                        }} />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <Badge className={`rounded-full px-3 py-1 text-sm font-medium border-0 ${getCategoryColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </Badge>
                  <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <ImageIcon className="w-3.5 h-3.5" /> {item.badge}
                  </span>
                  {(item.images?.length ?? 1) > 1 && (
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {item.images?.length} photos
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 leading-tight">{item.title}</h2>
                <p className="text-slate-600 text-base leading-relaxed mb-6">{item.description}</p>
                <div className="flex items-center gap-5 text-sm text-slate-500 pt-5 border-t border-slate-100">
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" />{formatDateLong(item.created_at)}</span>
                </div>
              </div>
            </>
          )}

          {/* ── BLOG modal ── */}
          {item.type === "blog" && (
            <>
              {/* Media header */}
              {item.media_type === "video" && item.video_url ? (
                <div className="bg-black aspect-video w-full">
                  <video
                    src={item.video_url}
                    poster={item.thumbnail || item.video_poster || getPlaceholderThumbnail(item.title)}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : item.media_type === "photo" && (item.image_url || item.thumbnail) ? (
                <div className="bg-slate-950 overflow-hidden" style={{ maxHeight: "40vh" }}>
                  <img
                    src={item.image_url || item.thumbnail || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full object-cover"
                    style={{ maxHeight: "40vh" }}
                    onError={(e) => {
                      e.currentTarget.src = getPlaceholderThumbnail(item.title)
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600" />
              )}

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <Badge className={`rounded-full px-3 py-1 text-sm font-medium border-0 ${getCategoryColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </Badge>
                  {item.media_type === "video" && (
                    <span className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      <Video className="w-3.5 h-3.5" /> Contains Video
                    </span>
                  )}
                  {item.media_type === "photo" && (
                    <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <ImageIcon className="w-3.5 h-3.5" /> Contains Photo
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 leading-tight">{item.title}</h2>
                <p className="text-slate-500 text-base italic mb-6 leading-relaxed border-l-4 border-cyan-400 pl-4 bg-cyan-50/50 py-3 pr-4 rounded-r-xl">
                  {item.description}
                </p>
                {item.content ? (
                  <div
                    className="blog-content text-slate-700 text-base"
                    style={{ lineHeight: "1.8" }}
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                ) : (
                  <p className="text-slate-400 italic text-center py-8">No content available for this article.</p>
                )}
                <div className="flex items-center gap-5 text-sm text-slate-500 pt-6 mt-6 border-t border-slate-100">
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" />{formatDateLong(item.created_at)}</span>
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-cyan-500" />Article</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Blog content base styles */}
      <style>{`
        .blog-content h1,.blog-content h2,.blog-content h3,.blog-content h4{font-weight:700;color:#1e293b;margin:1.5em 0 0.5em}
        .blog-content h1{font-size:1.75rem}.blog-content h2{font-size:1.4rem}.blog-content h3{font-size:1.15rem}
        .blog-content p{margin:0 0 1em}
        .blog-content a{color:#0891b2;text-decoration:none}.blog-content a:hover{text-decoration:underline}
        .blog-content ul,.blog-content ol{padding-left:1.5rem;margin:0 0 1em}.blog-content li{margin-bottom:0.25em}
        .blog-content img{max-width:100%;border-radius:12px;margin:1em 0}
        .blog-content blockquote{border-left:4px solid #22d3ee;padding:0.5em 1em;margin:1em 0;background:#f0fdfe;border-radius:0 8px 8px 0;color:#475569;font-style:italic}
        .blog-content pre{background:#f1f5f9;padding:1em;border-radius:8px;overflow-x:auto;font-size:0.875rem}
        .blog-content code{background:#f1f5f9;padding:0.1em 0.4em;border-radius:4px;font-size:0.875em}
        .blog-content pre code{background:none;padding:0}
        .blog-content strong{font-weight:700;color:#1e293b}
        .blog-content hr{border:none;border-top:1px solid #e2e8f0;margin:2em 0}
        .blog-content table{width:100%;border-collapse:collapse;margin:1em 0;font-size:0.9rem}
        .blog-content th,.blog-content td{border:1px solid #e2e8f0;padding:0.5em 0.75em;text-align:left}
        .blog-content th{background:#f8fafc;font-weight:600}
      `}</style>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const VideoBlogPage = () => {
  const [videos, setVideos] = useState<VideoPost[]>([])
  const [photos, setPhotos] = useState<PhotoPost[]>([])
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [tempThumbnails, setTempThumbnails] = useState<Record<string, string>>({})
  const [allContent, setAllContent] = useState<ContentItem[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const videosPerPage = 12

  // Generate a temporary thumbnail (data URL) from a remote video URL by capturing a short frame.
  const generateVideoThumbnail = async (url: string): Promise<string | null> => {
    if (!url || url === "#" || typeof document === "undefined") return null
    return new Promise((resolve) => {
      const video = document.createElement("video")
      let settled = false
      const cleanup = () => {
        try { video.pause() } catch (e) { }
        video.src = ""
        video.remove()
      }

      const finish = (dataUrl: string | null) => {
        if (settled) return
        settled = true
        cleanup()
        resolve(dataUrl)
      }

      video.crossOrigin = "anonymous"
      video.muted = true
      video.playsInline = true
      video.preload = "auto"
      video.src = url

      const onLoadedData = () => {
        try {
          // Seek slightly into the video to avoid black frames
          video.currentTime = Math.min(0.1, (video.duration || 0))
        } catch (e) {
          finish(null)
        }
      }

      const onSeeked = () => {
        try {
          const w = video.videoWidth || 640
          const h = video.videoHeight || 360
          const canvas = document.createElement("canvas")
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext("2d")
          if (!ctx) return finish(null)
          ctx.drawImage(video, 0, 0, w, h)
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
          finish(dataUrl)
        } catch (e) {
          finish(null)
        }
      }

      const onError = () => finish(null)

      video.addEventListener("loadeddata", onLoadedData)
      video.addEventListener("seeked", onSeeked)
      video.addEventListener("error", onError)

      // Start loading
      try { video.load() } catch (e) { finish(null) }

      // Safety timeout
      setTimeout(() => finish(null), 3500)
    })
  }

  // Populate temporary thumbnails for videos (videos list and blog posts without thumbnails)
  useEffect(() => {
    const pending: Array<Promise<void>> = []

    const ensureThumbFor = async (id: string, src?: string) => {
      if (!id || !src) return
      if (tempThumbnails[id]) return
      const data = await generateVideoThumbnail(src)
      if (data) setTempThumbnails((s) => ({ ...s, [id]: data }))
    }

    // Videos array
    videos.forEach((v) => {
      if ((!v.thumbnail || v.thumbnail === "/video-thumbnail.png") && v.videoUrl && v.videoUrl !== "#") {
        pending.push(ensureThumbFor(v.id, v.videoUrl))
      }
    })

    // Blog video posts
    blogs.forEach((b) => {
      const needs = !b.thumbnail && (b.video_poster || b.video_url)
      const src = b.video_poster || b.video_url
      if (needs && src) pending.push(ensureThumbFor(b.id, src))
    })

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.all(pending).catch(() => { })
  }, [videos, blogs, tempThumbnails])

  const openModal = useCallback((item: ContentItem, index: number) => {
    setSelectedItem(item)
    setSelectedIndex(index)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedItem(null)
    setSelectedIndex(-1)
  }, [])

  const navigateModal = useCallback((direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? selectedIndex - 1 : selectedIndex + 1
    if (newIndex >= 0 && newIndex < filteredContent.length) {
      setSelectedItem(filteredContent[newIndex])
      setSelectedIndex(newIndex)
    }
  }, [selectedIndex, filteredContent])

  // ── Fetch ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) throw new Error("API URL not configured")

        const [videosRes, photosRes, blogsRes] = await Promise.all([
          fetch(`${apiUrl}/videos`),
          fetch(`${apiUrl}/photos?status=published`),
          fetch(`${apiUrl}/blogs`),
        ])

        if (!videosRes.ok) throw new Error(`Failed to fetch videos: ${videosRes.status}`)
        if (!photosRes.ok) throw new Error(`Failed to fetch photos: ${photosRes.status}`)
        if (!blogsRes.ok) throw new Error(`Failed to fetch blogs: ${blogsRes.status}`)

        const [videosData, photosData, blogsData] = await Promise.all([
          videosRes.json(),
          photosRes.json(),
          blogsRes.json(),
        ])

        const base = apiUrl.replace("/api", "")

        const transformedVideos: VideoPost[] = (videosData.videos || videosData || [])
          .filter((v: any) => v.status === "published")
          .map((video: any) => ({
            id: video.id.toString(),
            title: video.title || "Untitled Video",
            description: video.description || "No description available",
            thumbnail: getSafeThumbnail(
              video.title || "Untitled Video",
              video.thumbnail_url
                ? `${base}${video.thumbnail_url}`
                : null
            ), videoUrl: video.video_url ? `${base}${video.video_url}` : "#",
            duration: video.duration || "0:00",
            views: video.views || 0,
            likes: video.likes || 0,
            comments: video.comments_count || 0,
            category: video.category || "scuba-diving",
            publishedAt: video.created_at || new Date().toISOString(),
            featured: video.featured === 1 || video.featured === true,
          }))

        const transformedPhotos: PhotoPost[] = (photosData.photos || photosData || [])
          .filter((p: any) => p.status === "published")
          .map((photo: any) => {
            // Build full images array: prefer photo.images[], fall back to image_url
            const rawImages: string[] = Array.isArray(photo.images) && photo.images.length > 0
              ? photo.images
              : photo.image_url ? [photo.image_url] : []
            const images = Array.from(new Set(rawImages.map((url: string) =>
              url.startsWith("http") ? url : `${base}${url}`
            )))
            const firstImage =
              images[0] ||
              getPlaceholderThumbnail(
                photo.title || "Untitled Photo"
              )
            return {
              id: photo.id.toString(),
              title: photo.title || "Untitled Photo",
              description: photo.description || "No description available",
              image_url: firstImage,
              images,
              badge: photo.badge || photo.category
                .split("-")
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
              category: photo.category || "scuba-diving",
              created_at: photo.created_at || new Date().toISOString(),
              updated_at: photo.updated_at || new Date().toISOString(),
            }
          })

        const groupedPhotos: PhotoPost[] = Object.values(
          transformedPhotos.reduce((acc, photo) => {
            const groupKey = `${photo.title}|${photo.description}|${photo.category}|${photo.badge}`
            if (!acc[groupKey]) {
              acc[groupKey] = { ...photo, images: [...photo.images] }
            } else {
              const existing = acc[groupKey]
              acc[groupKey] = {
                ...existing,
                images: Array.from(new Set([...existing.images, ...photo.images])),
                image_url: existing.image_url || photo.image_url,
                updated_at: existing.updated_at >= photo.updated_at ? existing.updated_at : photo.updated_at,
                created_at: existing.created_at >= photo.created_at ? existing.created_at : photo.created_at,
              }
            }
            return acc
          }, {} as Record<string, PhotoPost>)
        )

        const transformedBlogs: BlogPost[] = (blogsData.blogs || blogsData || [])
          .filter((b: any) => b.status === "published")
          .map((blog: any) => {
            const hasVideo = !!blog.video_url
            const hasPhoto = !!blog.image_url || !!blog.thumbnail_url
            return {
              id: blog.id.toString(),
              title: blog.title || "Untitled Blog",
              description: blog.description || "No description available",
              content: blog.content || "",
              category: blog.category || "scuba-diving",
              created_at: blog.created_at || new Date().toISOString(),
              updated_at: blog.updated_at || new Date().toISOString(),
              // Real image thumbnail (only when thumbnail_url exists)
              thumbnail: getSafeThumbnail(
                blog.title || "Untitled Blog",
                blog.thumbnail_url
                  ? `${base}${blog.thumbnail_url}`
                  : null
              ),
              // Fallback: use video_url as poster/preview source when no thumbnail image
              video_poster: !blog.thumbnail_url && blog.video_url
                ? `${base}${blog.video_url}`
                : undefined,
              image_url: blog.image_url ? `${base}${blog.image_url}` : undefined,
              video_url: blog.video_url ? `${base}${blog.video_url}` : undefined,
              media_type: hasVideo ? "video" : hasPhoto ? "photo" : null,
            }
          })

        setVideos(transformedVideos)
        setPhotos(groupedPhotos)
        setBlogs(transformedBlogs)
      } catch (err) {
        console.error("[v0] Error fetching content:", err)
        setError(err instanceof Error ? err.message : "Failed to load content")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [])

  useEffect(() => {
    const combined: ContentItem[] = [
      ...videos.map((v) => ({ ...v, type: "video" as const })),
      ...photos.map((p) => ({ ...p, type: "photo" as const })),
      ...blogs.map((b) => ({ ...b, type: "blog" as const })),
    ]
    setAllContent(combined)
    setFilteredContent(combined)
  }, [videos, photos, blogs])

  useEffect(() => {
    let filtered = allContent
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          ("content" in item && item.content?.toLowerCase().includes(q))
      )
    }
    setFilteredContent(filtered)
    setCurrentPage(1)
  }, [selectedCategory, searchQuery, allContent])

  const categories = [
    { key: "all", label: "All Content" },
    { key: "scuba-diving", label: "Scuba Diving" },
    { key: "freediving", label: "Freediving" },
    { key: "underwater-photography", label: "Photography" },
    { key: "marine-life", label: "Marine Life" },
    { key: "dive-sites", label: "Dive Sites" },
    { key: "diving-equipment", label: "Equipment" },
    { key: "diving-safety", label: "Safety" },
    { key: "diving-courses", label: "Courses" },
  ].map((c) => ({
    ...c,
    count: c.key === "all" ? allContent.length : allContent.filter((i) => i.category === c.key).length,
  }))

  const totalPages = Math.ceil(filteredContent.length / videosPerPage)
  const startIndex = (currentPage - 1) * videosPerPage
  const paginatedContent = filteredContent.slice(startIndex, startIndex + videosPerPage)
  const featuredVideos = videos.filter((v) => v.featured).slice(0, 3)

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Failed to load content</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  const cardBase = "group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-white/95 backdrop-blur-sm overflow-hidden rounded-3xl shadow-lg hover:bg-white flex flex-col"

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('/background-pattern.png')` }} />
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100/90 via-cyan-50/95 to-blue-100/90" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 right-20 w-12 h-12 bg-blue-200/30 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-cyan-300/20 rounded-full animate-bounce" style={{ animationDelay: "2s" }} />
        <div className="absolute top-32 left-1/3 animate-pulse" style={{ animationDelay: "0.5s" }}><Sparkles className="w-6 h-6 text-cyan-400/60" /></div>
        <div className="absolute bottom-32 right-1/4 animate-pulse" style={{ animationDelay: "2.5s" }}><Sparkles className="w-4 h-4 text-blue-400/60" /></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">

        {/* Hero */}
        <div className="text-center mb-20 relative">
          <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent mb-8 animate-pulse">
            Diving Gallery
          </h1>
          <p className="text-2xl text-slate-700 leading-relaxed font-medium max-w-4xl mx-auto mb-12">
            Dive into the depths of the ocean through breathtaking videos and stunning underwater photography
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: Fish, label: "Marine Life", color: "text-cyan-500" },
              { icon: Camera, label: "Photography", color: "text-blue-500" },
              { icon: Anchor, label: "Adventures", color: "text-indigo-500" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Icon className={`w-6 h-6 ${color} animate-bounce`} />
                <span className="text-lg font-semibold text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured */}
        {featuredVideos.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-4 rounded-full shadow-xl">
                <div className="w-3 h-10 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full animate-pulse" />
                <h2 className="text-4xl font-bold text-slate-800">Featured Depths</h2>
                <Waves className="w-8 h-8 text-cyan-500 animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {featuredVideos.map((video, index) => {
                const thumb =
                  tempThumbnails[video.id] ||
                  video.thumbnail
                return (
                  <Card
                    key={video.id}
                    className={`group cursor-pointer hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 border-0 overflow-hidden bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl ${index === 0 ? "lg:col-span-8" : "lg:col-span-4"}`}
                    onClick={() => {
                      const globalIndex = filteredContent.findIndex((i) => i.id === video.id && i.type === "video")
                      openModal({ ...video, type: "video" }, globalIndex)
                    }}
                  >
                    <div className="relative overflow-hidden">
                      {thumb ? (
                        <img src={thumb} alt={video.title} className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${index === 0 ? "h-96" : "h-56"}`} />
                      ) : video.videoUrl && video.videoUrl !== "#" ? (
                        <video
                          src={video.videoUrl}
                          className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${index === 0 ? "h-96" : "h-56"}`}
                          muted
                          playsInline
                          preload="metadata"
                          onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).currentTime = 0.1 }}
                          onError={(e) => {
                            e.currentTarget.src = getPlaceholderThumbnail(video.title)
                          }}
                        />
                      ) : (
                        <img src={getPlaceholderThumbnail(video.title)} alt={video.title}
                          className={`w-full object-cover ${index === 0 ? "h-96" : "h-56"}`}
                          onError={(e) => {
                            e.currentTarget.src = getPlaceholderThumbnail(video.title)
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/95 rounded-full flex items-center justify-center group-hover:scale-125 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500 shadow-2xl">
                          <Play className="w-8 h-8 translate-x-0.5" fill="currentColor" />
                        </div>
                      </div>
                      <Badge className="absolute top-6 left-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-bold px-4 py-2 rounded-full shadow-lg">⭐ Featured</Badge>
                      <Badge className="absolute bottom-6 right-6 bg-black/90 text-white border-0 px-3 py-1 rounded-full">{video.duration}</Badge>
                      <div className="absolute bottom-6 left-6 text-white">
                        <h3 className={`font-bold mb-3 ${index === 0 ? "text-3xl" : "text-xl"}`}>{video.title}</h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full"><Eye className="w-4 h-4" />{formatNumber(video.views)}</span>
                          <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full"><Heart className="w-4 h-4" />{formatNumber(video.likes)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Search + Categories */}
        <div className="mb-16">
          <div className="relative mb-12">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6" />
            <Input
              placeholder="Search the depths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 h-16 border-0 bg-white/90 backdrop-blur-sm text-xl rounded-2xl shadow-xl"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
            {categories.map((category) => {
              const icons: Record<string, any> = {
                all: Waves, "scuba-diving": Anchor, freediving: Fish,
                "underwater-photography": Camera, "marine-life": Fish,
                "dive-sites": Anchor, "diving-equipment": Anchor,
                "diving-safety": Heart, "diving-courses": Anchor,
              }
              const IconComponent = icons[category.key] || Waves
              const active = selectedCategory === category.key
              return (
                <Button
                  key={category.key}
                  variant={active ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.key as CategoryFilter)}
                  className={`flex flex-col items-center gap-3 h-auto py-6 px-4 rounded-2xl transition-all duration-300 ${active
                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl scale-105 border-0"
                    : "bg-white/90 hover:bg-white text-slate-700 border-0 hover:shadow-lg hover:scale-105 backdrop-blur-sm"
                    }`}
                >
                  <IconComponent className={`w-6 h-6 ${active ? "animate-bounce" : ""}`} />
                  <span className="text-sm font-semibold text-center leading-tight">{category.label}</span>
                  <Badge className={`text-xs font-medium rounded-full px-2 py-1 ${active ? "bg-white/30 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {category.count}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Grid */}
        {filteredContent.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-40 h-40 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-bounce">
              <Search className="w-16 h-16 text-cyan-500" />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-4">No content found in these depths</h3>
            <p className="text-slate-600 text-xl">Try adjusting your search or explore different categories</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedContent.map((item, index) => {
                const globalIndex = startIndex + index

                // ── Video card ──
                if (item.type === "video") {
                  const thumb =
                    tempThumbnails[item.id] ||
                    item.thumbnail
                  return (
                    <Card key={item.id} className={cardBase} onClick={() => openModal(item, globalIndex)}>
                      <div className="group relative overflow-hidden h-52 bg-slate-900">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.currentTarget.src = getPlaceholderThumbnail(item.title)
                            }}
                          />
                        ) : item.videoUrl && item.videoUrl !== "#" ? (
                          <video
                            src={item.videoUrl}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            muted
                            playsInline
                            preload="metadata"
                            onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).currentTime = 0.1 }}
                            onError={(e) => {
                              e.currentTarget.src = getPlaceholderThumbnail(item.title)
                            }}
                          />
                        ) : (
                          <img
                            src={getPlaceholderThumbnail(item.title)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = getPlaceholderThumbnail(item.title)
                            }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                          <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-6 h-6 text-cyan-500 translate-x-0.5" fill="currentColor" />
                          </div>
                        </div>
                        {/* Top-right: type badge */}
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-slate-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                          <Video className="w-3 h-3" /> Video
                        </span>
                        {/* Bottom-right: duration */}
                        <span className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-medium px-2 py-0.5 rounded-md">
                          {item.duration}
                        </span>
                      </div>
                      <CardContent className="p-6 flex flex-col flex-1">
                        <Badge className={`mb-4 text-sm font-medium rounded-full px-3 py-1 self-start border-0 ${getCategoryColor(item.category)}`}>
                          {getCategoryLabel(item.category)}
                        </Badge>
                        <h3 className="font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors text-xl leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-slate-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-slate-500 mt-auto pt-4 border-t border-slate-100">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateShort(item.publishedAt)}</span>
                          <Video className="w-4 h-4 text-cyan-500" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                }

                // ── Photo card ──
                if (item.type === "photo") {
                  return (
                    <PhotoCard
                      key={item.id}
                      item={item}
                      className={cardBase}
                      onClick={() => openModal(item, globalIndex)}
                    />
                  )
                }

                // ── Blog card ──
                if (item.type === "blog") {
                  const hasRealThumb = !!item.thumbnail
                  const useVideoPreview = item.media_type === "video" && !hasRealThumb && !!item.video_poster
                  const imgSrc = item.media_type === "photo"
                    ? (item.image_url || item.thumbnail)
                    : hasRealThumb ? item.thumbnail : null
                  const thumb =
                    tempThumbnails[item.id] ||
                    item.thumbnail ||
                    (useVideoPreview ? item.video_poster : imgSrc)

                  return (
                    <Card key={item.id} className={cardBase} onClick={() => openModal(item, globalIndex)}>
                      {(() => {
                        return (
                          <div className="group relative overflow-hidden h-52 bg-slate-900">
                            {thumb ? (
                              <img src={thumb} alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => {
                                  e.currentTarget.src = getPlaceholderThumbnail(item.title)
                                }}
                              />
                            ) : useVideoPreview ? (
                              <video
                                src={item.video_poster}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                muted
                                playsInline
                                preload="metadata"
                                onLoadedMetadata={(e) => { (e.target as HTMLVideoElement).currentTime = 0.1 }}
                              />
                            ) : (
                              <img src={getPlaceholderThumbnail(item.title)} alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = getPlaceholderThumbnail(item.title)
                                }}
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            {item.media_type === "video" && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-2xl">
                                  <Play className="w-6 h-6 text-cyan-500 translate-x-0.5" fill="currentColor" />
                                </div>
                              </div>
                            )}
                            {/* Top-right: content type badge */}
                            <span className={`absolute top-3 right-3 inline-flex items-center gap-1 text-white text-xs font-semibold px-2.5 py-1 rounded-full ${item.media_type === "video"
                              ? "bg-slate-900/90"
                              : "bg-gradient-to-r from-cyan-500 to-blue-600"
                              }`}>
                              {item.media_type === "video"
                                ? <><Video className="w-3 h-3" /> Blog</>
                                : <><ImageIcon className="w-3 h-3" /> Blog</>
                              }
                            </span>
                          </div>
                        )
                      })()}
                      <CardContent className="p-6 flex flex-col flex-1">
                        <Badge className={`mb-4 text-sm font-medium rounded-full px-3 py-1 self-start border-0 ${getCategoryColor(item.category)}`}>
                          {getCategoryLabel(item.category)}
                        </Badge>
                        <h3 className="font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors text-xl leading-tight">{item.title}</h3>
                        <p className="text-slate-600 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">{item.description}</p>
                        <div className="flex items-center justify-between text-sm text-slate-500 mt-auto pt-4 border-t border-slate-100">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateShort(item.created_at)}</span>
                          <FileText className="w-4 h-4 text-cyan-500" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                }

                return null
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-16">
                <Button variant="outline" size="lg" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="bg-white/90 border-0 hover:bg-white rounded-2xl px-6 py-3 text-lg font-semibold">← Previous</Button>
                <div className="flex items-center gap-3">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                    if (pageNum > totalPages) return null
                    return (
                      <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="lg" onClick={() => setCurrentPage(pageNum)}
                        className={`rounded-2xl min-w-14 h-14 text-lg font-semibold ${currentPage === pageNum ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl border-0" : "bg-white/90 border-0 hover:bg-white text-slate-700"}`}>
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button variant="outline" size="lg" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="bg-white/90 border-0 hover:bg-white rounded-2xl px-6 py-3 text-lg font-semibold">Next →</Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      <ContentModal
        item={selectedItem}
        onClose={closeModal}
        onPrev={() => navigateModal("prev")}
        onNext={() => navigateModal("next")}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < filteredContent.length - 1}
      />
    </div>
  )
}

export { VideoBlogPage }
export default VideoBlogPage