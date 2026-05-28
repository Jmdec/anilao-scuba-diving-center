"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

const toastQueue: ToastProps[] = []
const toastListeners: ((toasts: ToastProps[]) => void)[] = []

export function toast({ title, description, variant = "default" }: ToastProps) {
  const newToast = { title, description, variant }
  toastQueue.push(newToast)

  // Notify all listeners
  toastListeners.forEach((listener) => listener([...toastQueue]))

  // Auto remove after 5 seconds
  setTimeout(() => {
    const index = toastQueue.indexOf(newToast)
    if (index > -1) {
      toastQueue.splice(index, 1)
      toastListeners.forEach((listener) => listener([...toastQueue]))
    }
  }, 5000)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  React.useEffect(() => {
    toastListeners.push(setToasts)
    return () => {
      const index = toastListeners.indexOf(setToasts)
      if (index > -1) {
        toastListeners.splice(index, 1)
      }
    }
  }, [])

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <div
            key={index}
            className={cn(
              "rounded-lg border p-4 shadow-lg max-w-sm",
              toast.variant === "destructive"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-cyan-200 bg-white text-cyan-800",
            )}
          >
            {toast.title && <div className="font-semibold mb-1">{toast.title}</div>}
            {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
          </div>
        ))}
      </div>
    </>
  )
}

export function Toaster() {
  return null // This component is not needed since ToastProvider handles rendering
}

