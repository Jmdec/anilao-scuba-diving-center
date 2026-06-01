import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { ConditionalNavigation } from "@/components/conditional-navigation";
import FloatingSocialMedia from "@/components/floating-soc-med";
import { ServiceWorkerProvider } from "@/components/service-worker-provider";
import "@/lib/pwa-install";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ASDC Anilao Scuba Diving Center",
  description: "Book your diving adventure and PADI certifications at Anilao",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ASDC Anilao",
    startupImage: "/icon512_maskable.png",
  },
  applicationName: "ASDC Anilao",
  keywords: [
    "scuba diving",
    "PADI",
    "Anilao",
    "diving center",
    "certification",
    "Batangas",
    "Philippines",
  ],
  authors: [{ name: "ASDC Anilao" }],
  creator: "ASDC Anilao",
  publisher: "ASDC Anilao",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "ASDC Anilao",
    url: "https://anilao-scuba-diving-center.vercel.app/",
    title: "ASDC Anilao Scuba Diving Center",
    description: "Book your diving adventure and PADI certifications at Anilao",
    images: [
      {
        url: "https://anilao-scuba-diving-center.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ASDC Anilao Scuba Diving Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASDC Anilao Scuba Diving Center",
    description: "Book your diving adventure and PADI certifications at Anilao",
    images: ["https://anilao-scuba-diving-center.vercel.app/og-image.jpg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1ae6ea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ASDC Anilao" />
        <link rel="apple-touch-icon" href="/icon512_maskable.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icon512_rounded.png"
        />
        <link rel="shortcut icon" href="/icon512_rounded.png" />
      </head>

      <body className="font-sans antialiased">
        <ToastProvider>
          <ConditionalNavigation />
          <main className="min-h-screen">{children}</main>
          <FloatingSocialMedia />
          <ServiceWorkerProvider />
        </ToastProvider>
      </body>
    </html>
  );
}
