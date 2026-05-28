"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignupRequired() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-300 via-cyan-400 to-blue-600 flex items-center justify-center p-4 relative overflow-hidden">
      <Card className="w-full max-w-md bg-white/15 backdrop-blur-lg border-white/30 text-white relative z-10 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-white/25 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
            <svg className="w-8 h-8 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>

          <CardTitle className="text-2xl font-bold text-balance drop-shadow-sm">Ready to Dive In?</CardTitle>

          <CardDescription className="text-white/90 text-base leading-relaxed drop-shadow-sm">
            You need to sign up first in order to continue diving into our underwater world of adventures and
            discoveries.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white drop-shadow-sm">
              <div className="w-2 h-2 bg-white/80 rounded-full flex-shrink-0 shadow-sm"></div>
              <span className="text-sm font-medium">Access exclusive diving locations</span>
            </div>
            <div className="flex items-center gap-3 text-white drop-shadow-sm">
              <div className="w-2 h-2 bg-white/80 rounded-full flex-shrink-0 shadow-sm"></div>
              <span className="text-sm font-medium">Track your underwater adventures</span>
            </div>
            <div className="flex items-center gap-3 text-white drop-shadow-sm">
              <div className="w-2 h-2 bg-white/80 rounded-full flex-shrink-0 shadow-sm"></div>
              <span className="text-sm font-medium">Connect with fellow divers</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-white/25 hover:bg-white/35 text-white border-white/40 backdrop-blur-sm shadow-lg font-medium"
            >
              <Link href="/register">Start Your Diving Journey</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-white/40 text-white hover:bg-white/15 backdrop-blur-sm bg-transparent shadow-lg font-medium"
            >
              <Link href="/login">Already Have an Account?</Link>
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-white/80 hover:text-white text-sm underline underline-offset-4 drop-shadow-sm"
            >
              Return to Homepage
            </Link>
          </div>
        </CardContent>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
      </Card>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute bottom-0 left-1/4 w-3 h-3 bg-white/70 rounded-full animate-bounce shadow-lg"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        ></div>
        <div
          className="absolute bottom-10 left-1/3 w-4 h-4 bg-white/60 rounded-full animate-bounce shadow-md"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        ></div>
        <div
          className="absolute bottom-5 right-1/4 w-2 h-2 bg-white/80 rounded-full animate-bounce shadow-sm"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/3 w-3 h-3 bg-white/65 rounded-full animate-bounce shadow-lg"
          style={{ animationDelay: "0.5s", animationDuration: "4.5s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/6 w-2 h-2 bg-white/75 rounded-full animate-bounce shadow-md"
          style={{ animationDelay: "1.5s", animationDuration: "3.2s" }}
        ></div>
        <div
          className="absolute bottom-16 right-1/6 w-3 h-3 bg-white/55 rounded-full animate-bounce shadow-lg"
          style={{ animationDelay: "2.5s", animationDuration: "4.2s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/2 w-2 h-2 bg-white/70 rounded-full animate-bounce shadow-md"
          style={{ animationDelay: "3s", animationDuration: "3.8s" }}
        ></div>
        <div
          className="absolute bottom-8 left-3/4 w-4 h-4 bg-white/50 rounded-full animate-bounce shadow-lg"
          style={{ animationDelay: "1.8s", animationDuration: "4.3s" }}
        ></div>

        <div className="absolute top-8 -left-8 animate-pulse" style={{ animationDelay: "0s", animationDuration: "6s" }}>
          <div className="flex items-center" style={{ animation: "swim-right 12s linear infinite" }}>
            <svg className="w-8 h-8 text-orange-300 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>

        <div
          className="absolute top-16 -right-8 animate-pulse"
          style={{ animationDelay: "3s", animationDuration: "7s" }}
        >
          <div className="flex items-center" style={{ animation: "swim-left 15s linear infinite" }}>
            <svg
              className="w-6 h-6 text-yellow-300 drop-shadow-md transform scale-x-[-1]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>

        <div
          className="absolute bottom-24 -left-6 animate-pulse"
          style={{ animationDelay: "4s", animationDuration: "8s" }}
        >
          <div className="flex items-center" style={{ animation: "swim-right 18s linear infinite" }}>
            <svg className="w-7 h-7 text-pink-300 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>

        <div
          className="absolute bottom-32 -right-6 animate-pulse"
          style={{ animationDelay: "6s", animationDuration: "9s" }}
        >
          <div className="flex items-center" style={{ animation: "swim-left 14s linear infinite" }}>
            <svg
              className="w-6 h-6 text-blue-300 drop-shadow-md transform scale-x-[-1]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>

        <div
          className="absolute top-4 -left-10 animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "10s" }}
        >
          <div className="flex items-center" style={{ animation: "swim-right 16s linear infinite" }}>
            <svg className="w-5 h-5 text-teal-200 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-0 left-8 w-6 h-16 opacity-80">
          <div
            className="w-full h-full bg-gradient-to-t from-pink-400 to-pink-300 rounded-t-full animate-pulse"
            style={{ animationDuration: "4s" }}
          ></div>
          <div
            className="absolute top-4 left-2 w-2 h-8 bg-gradient-to-t from-coral-500 to-coral-400 rounded-t-full animate-pulse"
            style={{ animationDelay: "1s", animationDuration: "3s" }}
          ></div>
        </div>

        <div className="absolute bottom-0 right-12 w-8 h-20 opacity-75">
          <div
            className="w-full h-full bg-gradient-to-t from-purple-400 to-purple-300 rounded-t-full animate-pulse"
            style={{ animationDuration: "5s" }}
          ></div>
          <div
            className="absolute top-6 right-1 w-3 h-10 bg-gradient-to-t from-violet-500 to-violet-400 rounded-t-full animate-pulse"
            style={{ animationDelay: "2s", animationDuration: "4s" }}
          ></div>
        </div>

        <div className="absolute bottom-0 left-1/3 w-4 h-12 opacity-70">
          <div
            className="w-full h-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-full animate-pulse"
            style={{ animationDuration: "3.5s" }}
          ></div>
        </div>

        <div className="absolute bottom-0 right-1/4 w-5 h-14 opacity-85">
          <div
            className="w-full h-full bg-gradient-to-t from-red-400 to-red-300 rounded-t-full animate-pulse"
            style={{ animationDelay: "1.5s", animationDuration: "4.5s" }}
          ></div>
          <div
            className="absolute top-3 left-1 w-2 h-6 bg-gradient-to-t from-red-500 to-red-400 rounded-t-full animate-pulse"
            style={{ animationDelay: "0.5s", animationDuration: "3.2s" }}
          ></div>
        </div>

        <div
          className="absolute bottom-0 left-0 w-2 bg-gradient-to-t from-green-500/80 to-transparent h-32 rounded-t-full"
          style={{ animation: "sway 6s ease-in-out infinite" }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-2 bg-gradient-to-t from-green-600/70 to-transparent h-24 rounded-t-full"
          style={{ animation: "sway 8s ease-in-out infinite", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-0 left-1/5 w-1 bg-gradient-to-t from-green-400/85 to-transparent h-28 rounded-t-full"
          style={{ animation: "sway 5s ease-in-out infinite", animationDelay: "1s" }}
        ></div>

        <div
          className="absolute top-1/6 left-1/3 w-2 h-2 bg-yellow-300/80 rounded-full animate-ping shadow-lg"
          style={{ animationDelay: "2s", animationDuration: "4s" }}
        ></div>
        <div
          className="absolute top-2/3 right-1/5 w-1 h-1 bg-yellow-200/70 rounded-full animate-ping shadow-md"
          style={{ animationDelay: "1s", animationDuration: "5s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/6 w-2 h-2 bg-yellow-400/75 rounded-full animate-ping shadow-lg"
          style={{ animationDelay: "3s", animationDuration: "3.5s" }}
        ></div>
        <div
          className="absolute top-3/4 right-1/3 w-1 h-1 bg-amber-300/60 rounded-full animate-ping shadow-sm"
          style={{ animationDelay: "4s", animationDuration: "4.2s" }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes swim-right {
          0% { transform: translateX(-100px) translateY(0px); }
          25% { transform: translateX(25vw) translateY(-10px); }
          50% { transform: translateX(50vw) translateY(5px); }
          75% { transform: translateX(75vw) translateY(-5px); }
          100% { transform: translateX(calc(100vw + 100px)) translateY(0px); }
        }
        
        @keyframes swim-left {
          0% { transform: translateX(100px) translateY(0px); }
          25% { transform: translateX(-25vw) translateY(8px); }
          50% { transform: translateX(-50vw) translateY(-12px); }
          75% { transform: translateX(-75vw) translateY(6px); }
          100% { transform: translateX(calc(-100vw - 100px)) translateY(0px); }
        }
        
        @keyframes sway {
          0%, 100% { transform: rotate(0deg) translateX(0px); }
          25% { transform: rotate(2deg) translateX(2px); }
          50% { transform: rotate(0deg) translateX(0px); }
          75% { transform: rotate(-2deg) translateX(-2px); }
        }
      `}</style>
    </div>
  )
}
