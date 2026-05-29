"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Menu,
  User,
  LogOut,
  Download,
  X,
  Anchor,
  BookOpen,
  Camera,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { installPWA, isPWAPromptAvailable } from "@/lib/pwa-install";

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Booking", href: "/booking", icon: Anchor },
  { name: "Certification", href: "/certification", icon: BookOpen },
  { name: "Gallery", href: "/blog", icon: Camera },
];

export function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const pathname = usePathname();
  const [showInstallButton, setShowInstallButton] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  React.useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;
    if (isPWAPromptAvailable()) setShowInstallButton(true);
    const onAvailable = () => setShowInstallButton(true);
    const onInstalled = () => setShowInstallButton(false);
    window.addEventListener("pwa-install-available", onAvailable);
    window.addEventListener("pwa-installed", onInstalled);
    return () => {
      window.removeEventListener("pwa-install-available", onAvailable);
      window.removeEventListener("pwa-installed", onInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const accepted = await installPWA();
    if (!accepted && !isPWAPromptAvailable()) {
      alert(
        "To install this app:\n\n• Chrome/Edge: Look for the install icon in the address bar\n• Safari: Use 'Add to Home Screen' from the share menu\n• Firefox: Look for the install prompt or use 'Install' from the menu",
      );
    }
    setShowInstallButton(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        .nav-sheet-overlay {
          backdrop-filter: blur(4px);
        }
        .dive-menu-panel {
          background: linear-gradient(180deg, #0c2340 0%, #0a3d5c 40%, #0f5e7a 100%) !important;
          border-left: none !important;
        }
        .dive-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          border-radius: 12px;
          color: rgba(255,255,255,0.9);
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.01em;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .dive-nav-link:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.1);
        }
        .dive-nav-link.active {
          color: #ffffff;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .dive-nav-link .nav-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .dive-nav-link.active .nav-icon {
          background: rgba(56, 189, 248, 0.25);
        }
        .dive-nav-link:hover .nav-icon {
          background: rgba(255,255,255,0.15);
        }
        .dive-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: background 0.2s;
        }
        .dive-close-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        .dive-auth-btn-outline {
          width: 100%;
          padding: 11px 16px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.85);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
        }
        .dive-auth-btn-outline:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.4);
          color: white;
        }
        .dive-auth-btn-primary {
          width: 100%;
          padding: 11px 16px;
          border-radius: 10px;
          background: #0ea5e9;
          border: none;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
        }
        .dive-auth-btn-primary:hover {
          background: #38bdf8;
        }
        .dive-auth-btn-danger {
          width: 100%;
          padding: 11px 16px;
          border-radius: 10px;
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .dive-auth-btn-danger:hover {
          background: rgba(239,68,68,0.25);
          border-color: rgba(239,68,68,0.5);
          color: #fecaca;
        }
        .wave-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          margin: 4px 0;
        }
        .marquee-track {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
        }
        .marquee-inner {
          display: flex;
          align-items: center;
          width: max-content;
          animation: swim-marquee 22s linear infinite;
        }
        .marquee-inner:hover { animation-play-state: paused; }
        @keyframes swim-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .fish-item {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 14px;
          color: rgba(186,230,253,0.6);
          font-size: 11.5px;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .fish-flip { display: inline-block; transform: scaleX(-1); }
        .mobile-nav-header {
          background: linear-gradient(135deg, #0c2340 0%, #0a3d5c 60%, #0f5e7a 100%);
          border-bottom: 1px solid rgba(56,189,248,0.2);
          overflow: hidden;
          position: relative;
        }
        .water-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .water-wave {
          position: absolute;
          width: 200%;
          height: 80px;
          bottom: -30px;
          left: -50%;
          border-radius: 40%;
          opacity: 0.08;
          background: #7dd3fc;
        }
        .wave1 { animation: wave-roll 7s linear infinite; }
        .wave2 { animation: wave-roll 10s linear infinite reverse; opacity: 0.05; bottom: -20px; }
        @keyframes wave-roll {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .water-bubbles { position: absolute; inset: 0; }
        .nav-bubble {
          position: absolute;
          bottom: -10px;
          border-radius: 50%;
          background: rgba(186,230,253,0.25);
          border: 1px solid rgba(186,230,253,0.3);
          animation: nav-bubble-rise linear infinite;
        }
        @keyframes nav-bubble-rise {
          0%   { transform: translateY(0) scale(1);   opacity: 0.6; }
          80%  { opacity: 0.2; }
          100% { transform: translateY(-72px) scale(0.5); opacity: 0; }
        }
        .hamburger-btn-ocean {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .hamburger-btn-ocean:hover {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.35);
        }
        .depth-badge {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(56,189,248,0.8);
          background: rgba(56,189,248,0.1);
          padding: 3px 8px;
          border-radius: 20px;
          border: 1px solid rgba(56,189,248,0.2);
        }
        .hamburger-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: transparent;
          border: 1.5px solid #bae6fd;
          color: #0e7490;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .hamburger-btn:hover {
          background: #e0f2fe;
          border-color: #0ea5e9;
        }
        .bubbles-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          opacity: 0.4;
        }
        .bubble {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          animation: float-up 8s infinite ease-in-out;
        }
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { opacity: 0.15; }
          100% { transform: translateY(-120px) scale(0.6); opacity: 0; }
        }
      `}</style>

      {/* Mobile-only ocean navbar */}
      <header className="mobile-nav-header md:hidden sticky top-0 z-50">
        {/* Animated water layer */}
        <div className="water-bg" aria-hidden="true">
          <div className="water-wave wave1" />
          <div className="water-wave wave2" />
          <div className="water-bubbles">
            {[
              { s: 5, l: "8%", d: "0s", dur: "6s" },
              { s: 7, l: "22%", d: "1.5s", dur: "8s" },
              { s: 4, l: "38%", d: "3s", dur: "5s" },
              { s: 6, l: "54%", d: "0.8s", dur: "7s" },
              { s: 5, l: "68%", d: "2.2s", dur: "9s" },
              { s: 8, l: "80%", d: "4s", dur: "6.5s" },
              { s: 4, l: "92%", d: "1s", dur: "7.5s" },
            ].map((b, i) => (
              <span
                key={i}
                className="nav-bubble"
                style={{
                  width: b.s,
                  height: b.s,
                  left: b.l,
                  animationDelay: b.d,
                  animationDuration: b.dur,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-3ELqEflKG9JM1LqUKAwrlDfkC9fdyr.png"
              alt="ASDC Logo"
              className="w-10 h-10"
            />
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                ASDC Anilao
              </h1>
              <p className="text-xs text-sky-200/80">Scuba Diving Center</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {showInstallButton && (
              <Button
                onClick={handleInstallClick}
                size="sm"
                variant="outline"
                className="border-sky-300/50 text-white hover:bg-white/10 bg-transparent flex items-center gap-1 px-3 py-2"
              >
                <Download className="w-4 h-4" />
                <span className="text-xs">Install</span>
              </Button>
            )}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="hamburger-btn-ocean">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Open menu</span>
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="dive-menu-panel w-[300px] sm:w-[340px] p-0 overflow-hidden"
              >
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <div className="bubbles-bg" aria-hidden="true">
                  <div
                    className="bubble"
                    style={{
                      width: 12,
                      height: 12,
                      bottom: "20%",
                      left: "15%",
                      animationDelay: "0s",
                    }}
                  />
                  <div
                    className="bubble"
                    style={{
                      width: 8,
                      height: 8,
                      bottom: "35%",
                      left: "70%",
                      animationDelay: "2s",
                    }}
                  />
                  <div
                    className="bubble"
                    style={{
                      width: 16,
                      height: 16,
                      bottom: "10%",
                      left: "45%",
                      animationDelay: "4s",
                    }}
                  />
                  <div
                    className="bubble"
                    style={{
                      width: 6,
                      height: 6,
                      bottom: "50%",
                      left: "85%",
                      animationDelay: "1s",
                    }}
                  />
                </div>
                <div className="relative flex flex-col h-full px-5 py-6 z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-3ELqEflKG9JM1LqUKAwrlDfkC9fdyr.png"
                        alt="ASDC Logo"
                        className="w-10 h-10"
                      />
                      <div>
                        <p className="text-white font-bold text-base leading-tight">
                          ASDC Anilao
                        </p>
                        <p className="text-sky-300 text-xs">
                          Scuba Diving Center
                        </p>
                      </div>
                    </div>
                    <button
                      className="dive-close-btn"
                      onClick={() => setIsOpen(false)}
                      aria-label="Close menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-sky-300/80 mb-3 px-1">
                    Navigate
                  </p>
                  <nav className="flex flex-col gap-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn("dive-nav-link", isActive && "active")}
                        >
                          <span className="nav-icon">
                            <Icon className="w-4 h-4" />
                          </span>
                          {item.name}
                          {isActive && (
                            <span className="ml-auto depth-badge">Current</span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="wave-divider my-6" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-sky-300/80 mb-3 px-1">
                    Account
                  </p>
                  <div className="flex flex-col gap-2">
                    {isLoggedIn ? (
                      <>
                        <Link
                          href="/profile"
                          onClick={() => setIsOpen(false)}
                          className="dive-auth-btn-outline"
                        >
                          <User className="w-4 h-4" />
                          My Profile & Bookings
                        </Link>
                        <button
                          className="dive-auth-btn-danger"
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="dive-auth-btn-outline"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsOpen(false)}
                          className="dive-auth-btn-primary"
                        >
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="mt-auto pt-8">
                    <div className="wave-divider mb-4" />
                    <div className="marquee-track">
                      <div className="marquee-inner">
                        {[
                          { emoji: "🐠", label: "Explore the deep" },
                          { emoji: "🐡", label: "Dive with us" },
                          { emoji: "🐟", label: "Anilao awaits" },
                          { emoji: "🦈", label: "Feel the ocean" },
                          { emoji: "🐙", label: "Go deeper" },
                          { emoji: "🐠", label: "Explore the deep" },
                          { emoji: "🐡", label: "Dive with us" },
                          { emoji: "🐟", label: "Anilao awaits" },
                          { emoji: "🦈", label: "Feel the ocean" },
                          { emoji: "🐙", label: "Go deeper" },
                        ].map((item, i) => (
                          <span key={i} className="fish-item">
                            <span className={i % 3 === 1 ? "fish-flip" : ""}>
                              {item.emoji}
                            </span>
                            {item.label}
                            <span style={{ opacity: 0.3, fontSize: 10 }}>
                              〰
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Desktop navbar — unchanged */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-cyan-200 sticky top-0 z-50 shadow-sm hidden md:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-3ELqEflKG9JM1LqUKAwrlDfkC9fdyr.png"
                alt="ASDC Logo"
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-cyan-800">
                  ASDC Anilao
                </h1>
                <p className="text-xs sm:text-sm text-cyan-600">
                  Scuba Diving Center
                </p>
              </div>
            </Link>
            {/* Desktop nav */}
            <nav className="flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-cyan-600 relative",
                    pathname === item.href
                      ? "text-cyan-700 after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-cyan-600"
                      : "text-gray-700",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop auth */}
            <div className="flex items-center gap-3">
              {showInstallButton && (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  variant="outline"
                  className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-transparent flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </Button>
              )}
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50"
                  >
                    <Link href="/profile" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      My Bookings
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-transparent"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-transparent"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
