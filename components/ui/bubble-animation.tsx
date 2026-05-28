"use client"
import { useEffect, useState } from "react"

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
}

export function BubbleAnimation() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    // Create initial bubbles
    const initialBubbles: Bubble[] = []
    for (let i = 0; i < 15; i++) {
      initialBubbles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 10,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.2
      })
    }
    setBubbles(initialBubbles)

    // Animate bubbles
    const interval = setInterval(() => {
      setBubbles(prev => prev.map(bubble => ({
        ...bubble,
        y: bubble.y <= -10 ? 110 : bubble.y - bubble.speed * 0.5,
        x: bubble.x + Math.sin(Date.now() * 0.001 + bubble.id) * 0.5
      })))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-gradient-to-t from-cyan-200/40 to-white/60 backdrop-blur-sm animate-pulse"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            opacity: bubble.opacity,
            animation: `float ${3 + bubble.speed}s ease-in-out infinite`,
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
      `}</style>
    </div>
  )
}
