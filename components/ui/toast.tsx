"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  children?: React.ReactNode
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

export function Toast({
  variant = "default",
  children,
  className,
  ...props
}: ToastProps & { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 shadow-lg max-w-sm",
        variant === "destructive" ? "border-red-200 bg-red-50 text-red-800" : "border-cyan-200 bg-white text-cyan-800",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function ToastTitle({
  children,
  className,
  ...props
}: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("font-semibold mb-1", className)} {...props}>
      {children}
    </div>
  )
}

export function ToastDescription({
  children,
  className,
  ...props
}: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-sm opacity-90", className)} {...props}>
      {children}
    </div>
  )
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
          <Toast key={index} variant={toast.variant}>
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </Toast>
        ))}
      </div>
    </>
  )
}

export function Toaster() {
  return null // This component is not needed since ToastProvider handles rendering
}

export type ToastActionElement = React.ReactElement<any, string | React.JSXElementConstructor<any>>

export type { ToastProps }
