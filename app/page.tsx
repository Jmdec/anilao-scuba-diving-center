"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Users,
  Award,
  Waves,
  Fish,
  Camera,
  Video,
  Eye,
  Hotel,
  ArrowRight,
  GraduationCap,
  Clock,
  Sparkles,
  ImageOff,
  VideoOff,
} from "lucide-react";
import { Navigation } from "@/components//ui/navigation";
import { BubbleAnimation } from "@/components/ui/bubble-animation";
import { TestimonialsDisplay } from "@/components/testimonials-display";
import { TestimonialForm } from "@/components/testimonial-form";
import { Footer } from "@/components/footer";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface VideoPost {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  videoUrl: string;
  duration: string;
  views: number;
  likes: number;
  comments: number;
  category: string;
  publishedAt: string;
  featured: boolean;
}

interface DiveSite {
  id: number;
  name: string;
  description: string;
  image: string;
  location: string;
  depth_min: number;
  depth_max: number;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  visibility: string;
  best_time_to_visit: string;
  marine_life: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface Certificate {
  id: number;
  name: string;
  level: string;
  duration_days: number;
  price: number;
  prerequisites: string[];
  description: string;
  min_age: number;
  max_depth: number;
  image?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared gallery sub-components
// ─────────────────────────────────────────────────────────────────────────────

function formatViews(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

function NavBtn({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous" : "Next"}
      className={[
        "absolute top-1/2 -translate-y-1/2 z-20",
        "flex items-center justify-center rounded-full",
        "bg-slate-900/75 hover:bg-slate-900/95",
        "border border-teal-400/25 hover:border-teal-400/50",
        "transition-all duration-200",
        "w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11",
        direction === "prev"
          ? "left-2 sm:left-3 md:left-4"
          : "right-2 sm:right-3 md:right-4",
      ].join(" ")}
    >
      {direction === "prev" ? (
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
      ) : (
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
      )}
    </button>
  );
}

function Dots({
  count,
  current,
  color = "bg-teal-400",
}: {
  count: number;
  current: number;
  color?: string;
}) {
  return (
    <div className="flex justify-center gap-1.5 mt-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={[
            "h-[3px] rounded-full transition-all duration-300",
            i === current ? `w-7 ${color}` : "w-2 bg-white/20",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4 sm:mb-5">
      <div className="p-2 sm:p-2.5 bg-teal-400/15 rounded-xl border border-teal-400/25 shrink-0">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-teal-300" />
      </div>
      <div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-teal-300 leading-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-teal-300/70 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Image Gallery
// ─────────────────────────────────────────────────────────────────────────────

interface ImageItem {
  src: string;
  title: string;
  badge: string;
}

function ImageGallery({
  items,
  isLoading,
}: {
  items: ImageItem[];
  isLoading: boolean;
}) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + items.length) % items.length),
    [items.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % items.length),
    [items.length],
  );

  return (
    <div>
      <PanelHeader
        icon={Camera}
        title="Photo Gallery"
        subtitle={
          isLoading ? "Loading photos…" : "Stunning underwater photography"
        }
      />

      <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-teal-900/90 to-blue-900/90 border border-teal-400/20">
        {isLoading ? (
          /* Loading state */
          <div className="w-full aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-teal-400 border-t-transparent mx-auto mb-3" />
              <p className="text-teal-300 text-sm">Loading photos…</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Empty state — no photos from API */
          <div className="w-full aspect-video flex items-center justify-center">
            <div className="text-center">
              <ImageOff className="w-12 h-12 text-teal-400/50 mx-auto mb-3" />
              <p className="text-teal-300/70 text-sm">
                No photos available yet
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Main image */}
            <div className="relative w-full aspect-video overflow-hidden group">
              <img
                key={current}
                src={items[current].src}
                alt={items[current].title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent pointer-events-none" />

              <NavBtn direction="prev" onClick={prev} />
              <NavBtn direction="next" onClick={next} />

              {/* Badge */}
              <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 bg-teal-500/90 text-white text-[11px] sm:text-xs font-medium px-3 py-1.5 rounded-full">
                  <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {items[current].badge}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="px-3 sm:px-4 pt-3 pb-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-teal-400/30 justify-start lg:justify-center">
                {items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`View ${item.title}`}
                    className={[
                      "relative shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200",
                      "w-14 h-10 sm:w-16 sm:h-11 md:w-20 md:h-[52px]",
                      i === current
                        ? "border-teal-400 scale-105 shadow-md shadow-teal-400/30"
                        : "border-white/15 hover:border-teal-400/50",
                    ].join(" ")}
                  >
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {i === current && (
                      <div className="absolute inset-0 bg-teal-400/20" />
                    )}
                  </button>
                ))}
              </div>
              <Dots
                count={items.length}
                current={current}
                color="bg-teal-400"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Video Gallery
// ─────────────────────────────────────────────────────────────────────────────

interface VideoItem {
  src: string;
  poster: string | null;
  title: string;
  badge: string;
  duration?: string;
  views?: number;
}

function VideoGallery({
  items,
  isLoading,
}: {
  items: VideoItem[];
  isLoading: boolean;
}) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + items.length) % items.length),
    [items.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % items.length),
    [items.length],
  );

  const item = items[current] ?? null;

  return (
    <div>
      <PanelHeader
        icon={Video}
        title="Video Gallery"
        subtitle={
          isLoading ? "Loading videos…" : "Immersive diving experiences"
        }
      />

      <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-teal-900/90 to-blue-900/90 border border-teal-400/20">
        {isLoading ? (
          /* Loading state */
          <div className="w-full aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-teal-300 border-t-transparent mx-auto mb-3" />
              <p className="text-teal-300 text-sm">Loading videos…</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Empty state — no videos from API */
          <div className="w-full aspect-video flex items-center justify-center">
            <div className="text-center">
              <VideoOff className="w-12 h-12 text-teal-400/50 mx-auto mb-3" />
              <p className="text-teal-300/70 text-sm">
                No videos available yet
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Main video */}
            <div className="relative w-full aspect-video overflow-hidden">
              {item && (
                <video
                  key={current}
                  src={item.src}
                  poster={item.poster ?? undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="relative z-10 w-full h-full object-cover"
                />
              )}

              {/* Gradient – pointer-events-none keeps video controls clickable */}
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent pointer-events-none" />

              {/* Nav sits above gradient (z-20) */}
              <NavBtn direction="prev" onClick={prev} />
              <NavBtn direction="next" onClick={next} />

              {/* Top-left badge */}
              {item && (
                <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 bg-teal-300/90 text-slate-900 text-[11px] sm:text-xs font-medium px-3 py-1.5 rounded-full">
                    <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {item.badge}
                  </span>
                </div>
              )}

              {/* Top-right meta */}
              {item && (
                <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 flex flex-col sm:flex-row gap-1.5 pointer-events-none">
                  {item.duration && (
                    <span className="bg-black/75 text-teal-300 text-[11px] sm:text-xs px-2.5 py-1 rounded-full">
                      {item.duration}
                    </span>
                  )}
                  {!!item.views && item.views > 0 && (
                    <span className="inline-flex items-center gap-1 bg-black/75 text-teal-300 text-[11px] sm:text-xs px-2.5 py-1 rounded-full">
                      <Eye className="w-3 h-3" />
                      {formatViews(item.views)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="px-3 sm:px-4 pt-3 pb-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-teal-400/30 justify-start lg:justify-center">
                {items.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Play ${v.title}`}
                    className={[
                      "relative shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 bg-slate-800",
                      "w-14 h-10 sm:w-16 sm:h-11 md:w-20 md:h-[52px]",
                      i === current
                        ? "border-teal-300 scale-105 shadow-md shadow-teal-300/30"
                        : "border-white/15 hover:border-teal-300/50",
                    ].join(" ")}
                  >
                    {v.poster ? (
                      <img
                        src={v.poster}
                        alt={v.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-teal-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                      <Play className="w-3 h-3 text-teal-300 fill-teal-300" />
                    </div>
                  </button>
                ))}
              </div>
              <Dots
                count={items.length}
                current={current}
                color="bg-teal-300"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  // ── Dive sites ──────────────────────────────────────────────────────────────
  const [diveSites, setDiveSites] = useState<DiveSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Certificates ────────────────────────────────────────────────────────────
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(true);

  // ── Newsletter ──────────────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");

  // ── Videos ──────────────────────────────────────────────────────────────────
  const [apiVideos, setApiVideos] = useState<VideoPost[]>([]);
  const [videoThumbnails, setVideoThumbnails] = useState<
    Record<string, string>
  >({});
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  // ── Photos ──────────────────────────────────────────────────────────────────
  const [apiPhotos, setApiPhotos] = useState<ImageItem[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);

  // ── Thumbnail generator ─────────────────────────────────────────────────────
  const generateVideoThumbnail = async (
    url: string,
  ): Promise<string | null> => {
    if (typeof document === "undefined" || !url || url === "#") return null;

    return new Promise((resolve) => {
      const video = document.createElement("video");
      let settled = false;

      const cleanup = () => {
        video.pause();
        video.src = "";
        video.remove();
      };
      const finish = (dataUrl: string | null) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(dataUrl);
      };

      video.addEventListener("loadeddata", () => {
        try {
          video.currentTime = Math.min(0.1, video.duration || 0);
        } catch {
          finish(null);
        }
      });

      video.addEventListener("seeked", () => {
        try {
          const w = video.videoWidth || 640;
          const h = video.videoHeight || 360;
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return finish(null);
          ctx.drawImage(video, 0, 0, w, h);
          finish(canvas.toDataURL("image/jpeg", 0.8));
        } catch {
          finish(null);
        }
      });

      video.addEventListener("error", () => finish(null));
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.src = url;

      try {
        video.load();
      } catch {
        finish(null);
      }

      setTimeout(() => finish(null), 3500);
    });
  };

  // ── Fetch videos ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoadingVideos(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("API URL not configured");

        const [blogsRes, videosRes] = await Promise.all([
          fetch(`${apiUrl}/blogs`),
          fetch(`${apiUrl}/videos`),
        ]);

        const blogsData = blogsRes.ok ? await blogsRes.json() : { blogs: [] };
        const videosData = videosRes.ok
          ? await videosRes.json()
          : { videos: [] };
        const base = apiUrl.replace("/api", "");

        const fromBlogs: VideoPost[] = (blogsData.blogs || blogsData || [])
          .filter((b: any) => b.status === "published" && b.video_url)
          .map((b: any) => ({
            id: `blog-${b.id}`,
            title: b.title || "Untitled",
            description: b.description || "",
            thumbnail: b.thumbnail_url ? `${base}${b.thumbnail_url}` : null,
            videoUrl: `${base}${b.video_url}`,
            duration: b.duration || "0:00",
            views: b.views || 0,
            likes: b.likes || 0,
            comments: b.comments_count || 0,
            category: b.category || "scuba-diving",
            publishedAt: b.created_at || new Date().toISOString(),
            featured: b.featured === 1 || b.featured === true,
          }));

        const fromVideos: VideoPost[] = (videosData.videos || videosData || [])
          .filter((v: any) => v.status === "published")
          .map((v: any) => ({
            id: `video-${v.id}`,
            title: v.title || "Untitled Video",
            description: v.description || "",
            thumbnail: v.thumbnail_url ? `${base}${v.thumbnail_url}` : null,
            videoUrl: v.video_url ? `${base}${v.video_url}` : "#",
            duration: v.duration || "0:00",
            views: v.views || 0,
            likes: v.likes || 0,
            comments: v.comments_count || 0,
            category: v.category || "scuba-diving",
            publishedAt: v.created_at || new Date().toISOString(),
            featured: v.featured === 1 || v.featured === true,
          }));

        setApiVideos([...fromVideos, ...fromBlogs].slice(0, 6));
      } catch (err) {
        console.error("[HomePage] Error fetching videos:", err);
        setApiVideos([]);
      } finally {
        setIsLoadingVideos(false);
      }
    };
    fetchVideos();
  }, []);

  // ── Generate missing thumbnails ─────────────────────────────────────────────
  useEffect(() => {
    const generate = async () => {
      const requests = apiVideos
        .filter(
          (v) =>
            !v.thumbnail &&
            v.videoUrl &&
            v.videoUrl !== "#" &&
            !videoThumbnails[v.id],
        )
        .map((v) =>
          generateVideoThumbnail(v.videoUrl).then((dataUrl) => {
            if (dataUrl)
              setVideoThumbnails((prev) => ({ ...prev, [v.id]: dataUrl }));
          }),
        );
      if (requests.length) await Promise.all(requests).catch(() => {});
    };
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiVideos]);

  // ── Fetch photos ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoadingPhotos(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("API URL not configured");

        const res = await fetch(`${apiUrl}/photos?status=published`);
        if (!res.ok) throw new Error(`Failed to fetch photos: ${res.status}`);

        const data = await res.json();
        const base = apiUrl.replace("/api", "");

        const transformed: ImageItem[] = (data.photos || data || [])
          .filter((p: any) => p.status === "published" && p.image_url)
          .map((p: any) => ({
            src: `${base}${p.image_url}`,
            title: p.title || "Untitled Photo",
            badge:
              p.badge ||
              (p.category as string)
                .split("-")
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
          }));

        setApiPhotos(transformed);
      } catch (err) {
        console.error("[HomePage] Error fetching photos:", err);
        setApiPhotos([]);
      } finally {
        setIsLoadingPhotos(false);
      }
    };
    fetchPhotos();
  }, []);

  // ── Fetch dive sites ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDiveSites = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${apiUrl}/dive-sites?featured=1&active=1`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const sites: DiveSite[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : data?.success && data?.data
              ? data.data
              : [];

        setDiveSites(sites);
        setError(null);
      } catch {
        setError("Failed to load dive sites.");
      } finally {
        setLoading(false);
      }
    };
    fetchDiveSites();
  }, []);

  // ── Fetch certificates ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setCertificatesLoading(true);
        const res = await fetch("/api/certificate");
        const data = await res.json();
        if (res.ok && data.success)
          setCertificates((data.certifications || []).slice(0, 3));
      } catch (err) {
        console.error("Error fetching certificates:", err);
      } finally {
        setCertificatesLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  // ── Newsletter ──────────────────────────────────────────────────────────────
  const handleNewsletterSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setSubscriptionMessage("Please enter a valid email address");
      return;
    }
    setIsSubscribing(true);
    setSubscriptionMessage("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscriptionMessage(
          "Thank you for subscribing! Check your email for confirmation.",
        );
        setEmail("");
      } else {
        setSubscriptionMessage(
          data.message || "Subscription failed. Please try again.",
        );
      }
    } catch {
      setSubscriptionMessage("Network error. Please try again later.");
    } finally {
      setIsSubscribing(false);
    }
  };

  // ── Derived gallery data ────────────────────────────────────────────────────
  const videoItems: VideoItem[] = apiVideos.map((v) => ({
    src: v.videoUrl,
    poster: v.thumbnail ?? videoThumbnails[v.id] ?? null,
    title: v.title,
    badge: v.category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    duration: v.duration,
    views: v.views,
  }));

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const base =
      process.env.NEXT_PUBLIC_IMAGE_API_URL || "http://localhost:8000";
    return `${base}/uploads/dive-sites/${imagePath}`;
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "intermediate":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "advanced":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "Intermediate":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Advanced":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Professional":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-slate-900 via-blue-300 to-teal-300">
      <Navigation />
      <BubbleAnimation />

      {/* ── Hero ── */}
      <section className="relative min-h-[700px] sm:min-h-[800px] lg:h-screen w-full overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105 lg:scale-100"
          poster="/underwater-coral-reef-anilao-diving.png"
        >
          <source src="/IMG_9294.MP4" type="video/mp4" />
          <img
            src="/underwater-coral-reef-anilao-diving.png"
            alt="Underwater coral reef in Anilao"
            className="w-full h-full object-cover"
          />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-blue-900/40 to-teal-900/60" />
        <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-teal-900/80 to-transparent" />

        <div className="relative z-10 min-h-[700px] sm:min-h-[800px] lg:h-full flex items-center justify-center py-20 lg:py-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="wave-animation">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <Sparkles className="hidden sm:block h-6 w-6 lg:h-8 lg:w-8 text-teal-300 mr-3 animate-pulse" />
                <span className="text-xs sm:text-sm lg:text-lg font-medium tracking-wider uppercase bg-slate-900/30 px-3 py-2 sm:px-4 rounded-full backdrop-blur-sm border border-teal-400/30 text-teal-200">
                  World-Class Diving Experience
                </span>
                <Sparkles className="hidden sm:block h-6 w-6 lg:h-8 lg:w-8 text-teal-300 ml-3 animate-pulse" />
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 leading-[1.1] drop-shadow-2xl px-2">
                <span className="block sm:inline">Discover the</span>{" "}
                <span className="block sm:inline">Underwater World of</span>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 relative block sm:inline">
                  Anilao
                  <div className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-1 sm:h-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-full blur-sm" />
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-teal-100 max-w-4xl mx-auto mb-8 sm:mb-10 lg:mb-12 drop-shadow-lg leading-relaxed font-light bg-slate-900/20 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-teal-400/20">
              Experience world-class diving with professional PADI certification
              courses and luxurious accommodation at the heart of the
              Philippines' diving capital.
            </p>

            <div className="flex flex-col md:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-center px-4">
              <Link href="/booking">
                <Button
                  size="lg"
                  className="w-full md:w-auto min-w-[250px] bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white px-6 sm:px-10 py-5 sm:py-6 text-base sm:text-lg lg:text-xl font-semibold shadow-2xl hover:shadow-teal-600/40 transition-all duration-300 rounded-full border-2 border-teal-300/30 backdrop-blur-sm group transform hover:scale-105"
                >
                  <Hotel className="mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                  Book Your Stay
                  <ArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/certification">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full md:w-auto min-w-[250px] border-2 border-teal-300 text-teal-100 hover:bg-teal-300 hover:text-slate-900 bg-slate-900/30 backdrop-blur-sm px-6 sm:px-10 py-5 sm:py-6 text-base sm:text-lg lg:text-xl font-semibold shadow-2xl transition-all duration-300 rounded-full group transform hover:scale-105"
                >
                  <GraduationCap className="mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                  Get Certified
                </Button>
              </Link>
            </div>

            <div className="mt-8 sm:mt-10 lg:mt-12 flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 text-teal-200 px-4">
              <div className="flex items-center gap-2 bg-slate-900/30 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm border border-teal-400/20 whitespace-nowrap">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-teal-300" />
                <span className="text-xs sm:text-sm font-medium">
                  PADI 5-Star Resort
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/30 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm border border-teal-400/20 whitespace-nowrap">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-teal-300" />
                <span className="text-xs sm:text-sm font-medium">
                  2000+ Happy Divers
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/30 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm border border-teal-400/20 whitespace-nowrap">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-teal-300 fill-teal-300" />
                <span className="text-xs sm:text-sm font-medium">
                  4.9/5 Rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Media Gallery ── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-slate-900/95 via-teal-900/90 to-blue-900/95 backdrop-blur-sm border-t border-cyan-400/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300 leading-tight">
              Experience the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                Underwater Magic
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed font-light bg-slate-900/20 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl backdrop-blur-sm border border-teal-400/20">
              Immerse yourself in the breathtaking beauty of Anilao's marine
              life through our stunning image gallery and captivating video
              experiences
            </p>
          </div>

          {/* Two-column gallery grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <ImageGallery items={apiPhotos} isLoading={isLoadingPhotos} />
            <VideoGallery items={videoItems} isLoading={isLoadingVideos} />
          </div>
        </div>
      </section>

      {/* ── Certifications ── */}
      <section className="py-24 bg-gradient-to-b from-teal-900/90 to-blue-900/90 backdrop-blur-sm border-t border-teal-400/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-teal-100 mb-4">
              Professional{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                PADI Certification
              </span>
            </h2>
            <p className="text-xl text-teal-200 max-w-3xl mx-auto leading-relaxed">
              Advance your diving skills with our comprehensive certification
              courses led by experienced PADI instructors
            </p>
          </div>

          {certificatesLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-teal-400 border-t-transparent mx-auto mb-6" />
                <p className="text-teal-200 text-lg font-medium">
                  Loading certification courses…
                </p>
              </div>
            </div>
          ) : certificates.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {certificates.map((course) => (
                  <Link
                    key={course.id}
                    href={`/certification/${course.id}`}
                    className="block"
                  >
                    <Card className="group overflow-hidden hover:shadow-2xl hover:shadow-teal-600/30 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-sm rounded-xl border border-teal-400/20 hover:border-teal-300/40">
                      {course.image && (
                        <div className="relative overflow-hidden -m-6 mb-0">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"}/${course.image}`}
                            alt={course.name}
                            className="h-40 sm:h-44 md:h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                          <div className="absolute top-6 right-7">
                            <Badge
                              className={`text-xs font-medium ${getLevelColor(course.level)}`}
                            >
                              {course.level}
                            </Badge>
                          </div>
                        </div>
                      )}
                      <CardContent className="p-5">
                        <h3 className="text-xl font-bold text-teal-100 group-hover:text-teal-300 transition-colors mb-2 leading-tight">
                          {course.name}
                        </h3>
                        <p className="text-teal-200 text-sm mb-4 leading-relaxed line-clamp-2 group-hover:text-teal-100 transition-colors">
                          {course.description.substring(0, 80)}…
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                          <div className="flex items-center gap-2 p-2 bg-teal-900/50 rounded-lg border border-teal-400/20">
                            <Clock className="h-3 w-3 text-teal-300" />
                            <div>
                              <div className="text-teal-300 font-medium">
                                Duration
                              </div>
                              <div className="text-teal-100 font-bold">
                                {course.duration_days} days
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-cyan-900/50 rounded-lg border border-cyan-400/20">
                            <Users className="h-3 w-3 text-cyan-300" />
                            <div>
                              <div className="text-cyan-300 font-medium">
                                Min Age
                              </div>
                              <div className="text-cyan-100 font-bold">
                                {course.min_age}+
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-teal-400/20">
                          <div className="text-2xl font-bold text-teal-300">
                            ₱{Number(course.price).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 text-teal-300 group-hover:text-teal-100 transition-colors">
                            <span className="text-sm font-medium">
                              Learn More
                            </span>
                            <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-16">
                <Link href="/certification">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-10 py-4 text-lg rounded-full bg-gradient-to-r from-slate-800/80 to-blue-900/80 backdrop-blur-sm border-2 border-teal-300/50 text-teal-200 hover:bg-teal-300/20 hover:text-teal-100 hover:border-teal-300 shadow-2xl hover:shadow-teal-600/30 transition-all duration-300 group transform hover:scale-105"
                  >
                    <GraduationCap className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                    View All Certifications
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-sm rounded-2xl p-16 max-w-md mx-auto border-2 border-teal-400/30 shadow-2xl">
                <GraduationCap className="h-20 w-20 text-teal-300 mx-auto mb-6" />
                <p className="text-teal-200 text-xl font-medium">
                  Certification courses coming soon!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Dive Sites ── */}
      <section className="py-24 bg-gradient-to-b from-blue-900/90 to-teal-900/90 backdrop-blur-sm border-t border-cyan-400/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-teal-100 mb-4">
              Top Dive Sites in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                Anilao
              </span>
            </h2>
            <p className="text-xl text-teal-200 max-w-3xl mx-auto leading-relaxed">
              Explore the most spectacular underwater destinations that make
              Anilao the diving capital of the Philippines
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-teal-400 border-t-transparent mx-auto mb-6" />
                <p className="text-teal-200 text-lg font-medium">
                  Discovering amazing dive sites…
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-red-900/80 to-red-800/80 border-2 border-red-400/30 rounded-2xl p-10 max-w-md mx-auto shadow-2xl backdrop-blur-sm">
                <p className="text-red-200 mb-6 text-lg font-medium">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-400/50 text-red-200 hover:bg-red-400/20 px-6 py-3 rounded-full backdrop-blur-sm"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {diveSites.map((site) => (
                <Link
                  key={site.id}
                  href={`/dive-sites/${site.id}`}
                  className="block"
                >
                  <Card className="group overflow-hidden hover:shadow-2xl hover:shadow-teal-600/30 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-sm rounded-xl border border-teal-400/20 hover:border-teal-300/40">
                    {getImageUrl(site.image) && (
                      <div className="relative overflow-hidden -m-6 mb-0">
                        <img
                          src={getImageUrl(site.image)!}
                          alt={site.name}
                          className="h-40 sm:h-44 md:h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <h3 className="text-xl font-bold text-teal-100 group-hover:text-teal-300 transition-colors mb-2 leading-tight">
                        {site.name}
                      </h3>
                      <p className="text-teal-200 text-sm mb-4 leading-relaxed line-clamp-1 group-hover:text-teal-100 transition-colors">
                        {site.description}
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                        <div className="flex items-center gap-2 p-2 bg-teal-900/50 rounded-lg border border-teal-400/20">
                          <Waves className="h-3 w-3 text-teal-300" />
                          <div>
                            <div className="text-teal-300 font-medium">
                              Depth
                            </div>
                            <div className="text-teal-100 font-bold">
                              {site.depth_min}–{site.depth_max}m
                            </div>
                          </div>
                        </div>
                        {site.visibility && (
                          <div className="flex items-center gap-2 p-2 bg-cyan-900/50 rounded-lg border border-cyan-400/20">
                            <Eye className="h-3 w-3 text-cyan-300" />
                            <div>
                              <div className="text-cyan-300 font-medium">
                                Visibility
                              </div>
                              <div className="text-cyan-100 font-bold">
                                {site.visibility}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-teal-400/20">
                        <div className="flex items-center gap-2 text-teal-300">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {site.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-teal-300 group-hover:text-teal-100 transition-colors">
                          <span className="text-sm font-medium">Explore</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!loading && !error && diveSites.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/80 backdrop-blur-sm rounded-2xl p-16 max-w-md mx-auto border-2 border-teal-400/20 shadow-2xl">
                <Fish className="h-20 w-20 text-teal-300 mx-auto mb-6" />
                <p className="text-teal-200 text-xl font-medium">
                  No featured dive sites available at the moment.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && diveSites.length > 0 && (
            <div className="text-center mt-16">
              <Link href="/dive-sites">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-10 py-4 text-lg rounded-full bg-gradient-to-r from-slate-800/80 to-blue-900/80 backdrop-blur-sm border-2 border-teal-300/50 text-teal-200 hover:bg-teal-300/20 hover:text-teal-100 hover:border-teal-300 shadow-2xl hover:shadow-teal-600/30 transition-all duration-300 group transform hover:scale-105"
                >
                  View All Dive Sites
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-gradient-to-b from-teal-900/90 to-slate-900/90 backdrop-blur-sm border-t border-cyan-400/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-teal-100 mb-4">
              What Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                Divers Say
              </span>
            </h2>
            <p className="text-xl text-teal-200 max-w-3xl mx-auto leading-relaxed">
              Real experiences from fellow diving enthusiasts who discovered the
              magic of Anilao
            </p>
          </div>
          <TestimonialsDisplay />
          <div className="text-center mt-16">
            <h3 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 mb-6">
              Share Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                Diving Story
              </span>
            </h3>
            <p className="text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed mb-8">
              Your experience matters! Help other diving enthusiasts discover
              the magic of Anilao through your story
            </p>
            <TestimonialForm />
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-teal-900 to-blue-900 border-t border-teal-400/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-teal-400/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-500" />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="flex items-center justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-teal-600/30 to-cyan-600/30 rounded-2xl border border-teal-400/40">
              <Waves className="h-12 w-12 text-teal-300" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 mb-4 sm:mb-6 px-4">
            Dive Into Our Updates
          </h3>
          <p className="text-teal-100 mb-8 sm:mb-10 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed px-4">
            Get the latest dive tips, special offers, and underwater photography
            straight to your inbox. Join our community of ocean explorers!
          </p>

          <form
            onSubmit={handleNewsletterSubscription}
            className="flex flex-col gap-4 justify-center max-w-lg mx-auto mb-6 px-4"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubscribing}
              required
              className="w-full px-6 sm:px-8 py-3 sm:py-4 rounded-full border-2 border-teal-400/30 focus:outline-none focus:ring-4 focus:ring-teal-400/30 focus:border-teal-400 text-slate-900 text-base sm:text-lg shadow-lg bg-white/95 backdrop-blur-sm placeholder-slate-500 disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={isSubscribing}
              size="lg"
              className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-teal-600/50 transition-all duration-300 group transform hover:scale-105 border border-teal-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubscribing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-white border-t-transparent mr-3" />
                  Joining…
                </>
              ) : (
                <>
                  <Waves className="mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                  Subscribe
                  <ArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {subscriptionMessage && (
            <div
              className={[
                "mb-6 p-4 rounded-full text-center font-medium",
                subscriptionMessage.includes("Thank you")
                  ? "bg-green-900/50 text-green-200 border border-green-400/30"
                  : "bg-red-900/50 text-red-200 border border-red-400/30",
              ].join(" ")}
            >
              {subscriptionMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-teal-300 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>5,000+ diving enthusiasts</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-teal-300" />
              <span>Weekly dive tips</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Exclusive offers</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
