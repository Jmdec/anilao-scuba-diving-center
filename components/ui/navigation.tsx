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
import { Menu, Waves, User, LogOut, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { installPWA, isPWAPromptAvailable } from "@/lib/pwa-install";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Booking", href: "/booking" },
  { name: "Certification", href: "/certification" },
  { name: "Gallery", href: "/blog" },
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

    // Check immediately on mount — catches event that fired before this component rendered
    if (isPWAPromptAvailable()) {
      setShowInstallButton(true);
    }

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
    <header className="bg-white/95 backdrop-blur-sm border-b border-cyan-200 sticky top-0 z-50 shadow-sm">
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

          <div className="flex items-center gap-2 md:hidden">
            {showInstallButton && (
              <Button
                onClick={handleInstallClick}
                size="sm"
                variant="outline"
                className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-transparent flex items-center gap-1 px-3 py-2"
              >
                <Download className="w-4 h-4" />
                <span className="text-xs">Install</span>
              </Button>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-700 hover:bg-cyan-50"
                >
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] bg-white"
              >
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden>

                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 pb-6 border-b border-cyan-200">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-3ELqEflKG9JM1LqUKAwrlDfkC9fdyr.png"
                      alt="ASDC Logo"
                      className="w-10 h-10"
                    />
                    <div>
                      <h2 className="text-lg font-bold text-cyan-800">
                        ASDC Anilao
                      </h2>
                      <p className="text-sm text-cyan-600">
                        Scuba Diving Center
                      </p>
                    </div>
                  </div>

                  <nav className="flex flex-col space-y-4 py-6 flex-1">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "text-base font-medium px-4 py-2 rounded-md transition-colors",
                          pathname === item.href
                            ? "text-cyan-700 bg-cyan-50 border-l-4 border-cyan-600"
                            : "text-gray-700 hover:text-cyan-700 hover:bg-cyan-50",
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  <div className="border-t border-cyan-200 pt-6 space-y-3">
                    {isLoggedIn ? (
                      <>
                        <Link href="/profile" onClick={() => setIsOpen(false)}>
                          <Button
                            variant="outline"
                            className="w-full border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-transparent"
                          >
                            <User className="w-4 h-4 mr-2" />
                            Profile
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          <Button
                            variant="outline"
                            className="w-full border-cyan-300 text-cyan-700 hover:bg-cyan-50 bg-transparent"
                          >
                            Login
                          </Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsOpen(false)}>
                          <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                            Register
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="border-t border-cyan-200 pt-4 mt-4">
                    <div className="flex items-center justify-center gap-2 text-cyan-600">
                      <Waves className="w-4 h-4" />
                      <span className="text-sm">Dive into Adventure</span>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
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

          <div className="hidden md:flex items-center gap-3">
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
  );
}
