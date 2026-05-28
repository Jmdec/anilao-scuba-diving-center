import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-300 via-cyan-400 to-blue-600 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md mx-auto">
        <div className="relative">
          <div className="text-8xl font-bold text-white/20 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white text-balance">Lost in the Deep</h1>
          <p className="text-white/90 text-lg leading-relaxed">
            Looks like you've drifted too far from the main current. The page you're looking for has disappeared into
            the depths.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm p-6 border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
          <p className="text-white/80 text-sm relative z-10">
            Don't worry, even the best divers sometimes lose their way. Let's get you back to the surface.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
            <Link href="/">Return to Surface</Link>
          </Button>
{/*           <Button
            asChild
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm bg-transparent"
          >
            <Link href="/profile">View Profile</Link>
          </Button> */}
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-bounce"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-bounce"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </div>
    </div>
  )
}
