"use client";
import type React from "react";
import { useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Home,
  Bed,
  Award,
  Settings,
  BarChart3,
  LogOut,
  ImageIcon,
  Anchor,
  Star,
  FileText,
  Camera,
  Video,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";
import AuthGuard from "@/components/AuthGuard";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [galleryExpanded, setGalleryExpanded] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navigationItems = [
    { href: "/admin", icon: Home, label: "Dashboard" },
    { href: "/admin/AppliedCertificate", icon: Award, label: "Applications" },
    { href: "/admin/bookings", icon: BarChart3, label: "Bookings" },
    { href: "/admin/certificate", icon: Award, label: "Certificate" },
    {
      href: "/admin/blog",
      icon: ImageIcon,
      label: "Gallery Management",
      hasSubmenu: true,
      subitems: [
        { href: "/admin/blog", icon: FileText, label: "Blog Posts" },
        { href: "/admin/gallery/photo", icon: Camera, label: "Photo Gallery" },
        { href: "/admin/gallery/video", icon: Video, label: "Video Gallery" },
      ],
    },
    { href: "/admin/rooms", icon: Bed, label: "Rooms" },
    { href: "/admin/testimonials", icon: Star, label: "Testimonials" },
    { href: "/admin/top-dive-site", icon: Anchor, label: "Top Dive Site" },
    // { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <AuthGuard>
      <div className="font-sans bg-gradient-to-br from-slate-50 to-cyan-50 min-h-screen">
        <SidebarProvider>
          <Sidebar className="border-r border-slate-200/60 bg-white/80 backdrop-blur-sm">
            <SidebarHeader className="border-b border-slate-200/60 bg-gradient-to-r from-cyan-500 to-teal-600">
              <div className="flex items-center gap-3 px-4 py-6">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <Anchor className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">ASDC Admin</h2>
                  <p className="text-xs text-cyan-100 font-medium">
                    Anilao Diving Center
                  </p>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent className="px-3 py-4">
              <SidebarMenu className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  const isSubActive = item.subitems?.some(
                    (subitem) => pathname === subitem.href
                  );
                  const Icon = item.icon;

                  if (item.hasSubmenu) {
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          onClick={() => setGalleryExpanded(!galleryExpanded)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer w-full",
                            (isActive || isSubActive || galleryExpanded)
                              ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/25"
                              : "text-slate-700 hover:bg-slate-100 hover:text-cyan-700",
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-5 h-5 transition-transform duration-200",
                              (isActive || isSubActive || galleryExpanded)
                                ? "text-white"
                                : "text-slate-500 group-hover:text-cyan-600",
                              "group-hover:scale-110",
                            )}
                          />
                          <span
                            className={cn(
                              "font-medium text-sm flex-1",
                              (isActive || isSubActive || galleryExpanded)
                                ? "text-white"
                                : "group-hover:text-cyan-700",
                            )}
                          >
                            {item.label}
                          </span>
                          {galleryExpanded ? (
                            <ChevronDown className="w-4 h-4 text-white" />
                          ) : (
                            <ChevronRight
                              className={cn(
                                "w-4 h-4",
                                (isActive || isSubActive)
                                  ? "text-white"
                                  : "text-slate-500 group-hover:text-cyan-600",
                              )}
                            />
                          )}
                        </SidebarMenuButton>
                        {galleryExpanded && item.subitems && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.subitems.map((subitem) => {
                              const isSubItemActive = pathname === subitem.href;
                              const SubIcon = subitem.icon;
                              return (
                                <SidebarMenuItem key={subitem.href}>
                                  <SidebarMenuButton asChild>
                                    <Link
                                      href={subitem.href}
                                      className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                                        isSubItemActive
                                          ? "bg-cyan-100 text-cyan-700"
                                          : "text-slate-600 hover:bg-slate-100 hover:text-cyan-700",
                                      )}
                                    >
                                      <SubIcon
                                        className={cn(
                                          "w-4 h-4 transition-transform duration-200",
                                          isSubItemActive
                                            ? "text-cyan-600"
                                            : "text-slate-400 group-hover:text-cyan-600",
                                          "group-hover:scale-110",
                                        )}
                                      />
                                      <span
                                        className={cn(
                                          "font-medium text-xs",
                                          isSubItemActive
                                            ? "text-cyan-700"
                                            : "group-hover:text-cyan-700",
                                        )}
                                      >
                                        {subitem.label}
                                      </span>
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              );
                            })}
                          </div>
                        )}
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                            isActive
                              ? "bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/25"
                              : "text-slate-700 hover:bg-slate-100 hover:text-cyan-700",
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-5 h-5 transition-transform duration-200",
                              isActive
                                ? "text-white"
                                : "text-slate-500 group-hover:text-cyan-600",
                              "group-hover:scale-110",
                            )}
                          />
                          <span
                            className={cn(
                              "font-medium text-sm",
                              isActive
                                ? "text-white"
                                : "group-hover:text-cyan-700",
                            )}
                          >
                            {item.label}
                          </span>
                          {isActive && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full shadow-sm" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}

                <SidebarMenuItem className="mt-8 pt-4 border-t border-slate-200">
                  <SidebarMenuButton
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-all duration-200 group w-full"
                  >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium text-sm">Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200/60 px-6 bg-white/80 backdrop-blur-sm">
              <SidebarTrigger className="-ml-1 hover:bg-slate-100 rounded-md p-2 transition-colors duration-200" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Anchor className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-700 to-teal-700 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-6 p-6 bg-gradient-to-br from-slate-50/50 to-cyan-50/50">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-6">
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </div>
    </AuthGuard>
  );
}
