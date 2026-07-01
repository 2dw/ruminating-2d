"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { ShootingStar } from "./shooting-star"

interface StarryBackgroundProps {
  shootingStarCount?: number
  isDarkMode?: boolean
}

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  delay: number
}

interface Connection {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  opacity: number
}

interface PointerGlow {
  x: number
  y: number
  active: boolean
}

function randomFrom(seed: number) {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

export function StarryBackground({ shootingStarCount = 3, isDarkMode = false }: StarryBackgroundProps) {
  const [shootingStars, setShootingStars] = useState<React.ReactNode[]>([])
  const [stars, setStars] = useState<Star[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [pointerGlow, setPointerGlow] = useState<PointerGlow>({ x: 0, y: 0, active: false })
  const starsRef = useRef<Star[]>([])
  const frameRef = useRef<number | null>(null)
  const clearRef = useRef<number | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Create multiple shooting stars with different delays and properties.
    const stars = Array.from({ length: shootingStarCount }).map((_, index) => {
      const delay = index * 5 + Math.random() * 10
      const duration = 1 + Math.random() * 1.5
      const size = 1 + Math.random() * 2
      const colors = ["rgba(255, 255, 255, 0.8)", "rgba(220, 240, 255, 0.8)", "rgba(255, 250, 220, 0.8)"]
      const color = colors[Math.floor(Math.random() * colors.length)]

      return <ShootingStar key={`shooting-star-${index}`} delay={delay} duration={duration} size={size} color={color} />
    })

    setShootingStars(stars)
  }, [shootingStarCount])

  useEffect(() => {
    const createStars = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const density = width < 640 ? 0.00018 : width < 1024 ? 0.00014 : 0.00011
      const count = Math.min(280, Math.max(110, Math.floor(width * height * density)))
      const nextStars = Array.from({ length: count }, (_, index) => {
        const seed = index + width * 0.131 + height * 0.173

        return {
          id: index,
          x: randomFrom(seed) * 100,
          y: randomFrom(seed + 37.2) * 100,
          size: 2.4 + randomFrom(seed + 9.4) * 3.4,
          opacity: 0.48 + randomFrom(seed + 16.8) * 0.38,
          delay: randomFrom(seed + 24.1) * -8,
        }
      })

      starsRef.current = nextStars
      setStars(nextStars)
    }

    createStars()
    window.addEventListener("resize", createStars)

    return () => {
      window.removeEventListener("resize", createStars)
    }
  }, [])

  useEffect(() => {
    const updateConstellation = () => {
      frameRef.current = null

      const width = window.innerWidth
      const height = window.innerHeight
      const radius = width < 640 ? 150 : 210
      const maxConnectionDistance = width < 640 ? 98 : 128
      const pointer = pointerRef.current
      const nearby = starsRef.current
        .map((star) => {
          const x = (star.x / 100) * width
          const y = (star.y / 100) * height
          const distance = Math.hypot(x - pointer.x, y - pointer.y)

          return { ...star, px: x, py: y, distance }
        })
        .filter((star) => star.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 28)

      const nextConnections: Connection[] = []

      for (let index = 0; index < nearby.length; index += 1) {
        for (let nextIndex = index + 1; nextIndex < nearby.length; nextIndex += 1) {
          const star = nearby[index]
          const nextStar = nearby[nextIndex]
          const distance = Math.hypot(star.px - nextStar.px, star.py - nextStar.py)

          if (distance > maxConnectionDistance) {
            continue
          }

          const pointerStrength = 1 - Math.max(star.distance, nextStar.distance) / radius
          const lineStrength = 1 - distance / maxConnectionDistance

          nextConnections.push({
            id: `${star.id}-${nextStar.id}`,
            x1: star.px,
            y1: star.py,
            x2: nextStar.px,
            y2: nextStar.py,
            opacity: Math.min(0.78, pointerStrength * lineStrength * 0.95),
          })

          if (nextConnections.length >= 54) {
            break
          }
        }

        if (nextConnections.length >= 54) {
          break
        }
      }

      setConnections(nextConnections)
      setPointerGlow({ x: pointer.x, y: pointer.y, active: true })
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY }

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updateConstellation)
      }

      if (clearRef.current !== null) {
        window.clearTimeout(clearRef.current)
      }

      clearRef.current = window.setTimeout(() => {
        setConnections([])
        setPointerGlow((current) => ({ ...current, active: false }))
      }, 1400)
    }

    const handlePointerLeave = () => {
      setConnections([])
      setPointerGlow((current) => ({ ...current, active: false }))
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerleave", handlePointerLeave)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerleave", handlePointerLeave)

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }

      if (clearRef.current !== null) {
        window.clearTimeout(clearRef.current)
      }
    }
  }, [])

  const starColor = isDarkMode ? "rgba(232, 248, 255, 1)" : "rgba(15, 81, 104, 1)"
  const lineColor = isDarkMode ? "rgba(103, 232, 249, 1)" : "rgba(8, 126, 164, 1)"
  const glowColor = isDarkMode ? "rgba(20, 184, 166, 0.16)" : "rgba(8, 145, 178, 0.13)"

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 overflow-hidden"
        style={{
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 24%, rgba(45, 212, 191, 0.07), transparent 28%), radial-gradient(circle at 78% 39%, rgba(96, 165, 250, 0.09), transparent 25%)",
          }}
        />

        {stars.map((star) => (
          <span
            key={star.id}
            className="constellation-star absolute rounded-full"
            style={{
              animationDelay: `${star.delay}s`,
              backgroundColor: starColor,
              boxShadow: `0 0 ${star.size * 3}px ${starColor}`,
              height: `${star.size}px`,
              left: `${star.x}%`,
              opacity: star.opacity,
              top: `${star.y}%`,
              width: `${star.size}px`,
            }}
          />
        ))}

        <svg className="absolute inset-0 h-full w-full" role="presentation">
          <defs>
            <filter id="constellation-glow">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {connections.map((connection) => (
            <line
              key={connection.id}
              x1={connection.x1}
              y1={connection.y1}
              x2={connection.x2}
              y2={connection.y2}
              stroke={lineColor}
              strokeLinecap="round"
              strokeOpacity={connection.opacity}
              strokeWidth={1.25 + connection.opacity * 1.8}
              filter="url(#constellation-glow)"
            />
          ))}
        </svg>

        {pointerGlow.active ? (
          <span
            className="absolute rounded-full transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle, ${glowColor}, transparent 68%)`,
              height: 300,
              left: pointerGlow.x,
              opacity: 1,
              top: pointerGlow.y,
              transform: "translate(-50%, -50%)",
              width: 300,
            }}
          />
        ) : null}
      </div>
      {shootingStars}
    </>
  )
}
