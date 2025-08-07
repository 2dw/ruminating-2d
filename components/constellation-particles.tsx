"use client"

import { useEffect, useState } from "react"
import { PathParticles } from "./path-particles"

interface PathConfig {
  id: string
  color: string
  duration: number
  delay: number
  particleCount?: number
  particleSize?: number
}

interface ConstellationParticlesProps {
  paths: PathConfig[]
}

export function ConstellationParticles({ paths }: ConstellationParticlesProps) {
  const [isRetracing, setIsRetracing] = useState(false)

  // Listen for retrace event
  useEffect(() => {
    const handleRetrace = () => {
      setIsRetracing(true)

      // Reset after animation completes
      setTimeout(() => {
        setIsRetracing(false)
      }, 12000) // Slightly longer than the full animation
    }

    document.addEventListener("retrace-constellation", handleRetrace)
    return () => {
      document.removeEventListener("retrace-constellation", handleRetrace)
    }
  }, [])

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" style={{ overflow: "visible" }}>
      {paths.map((path) => (
        <PathParticles
          key={path.id}
          pathId={path.id}
          color={path.color}
          particleCount={path.particleCount || 5}
          pathDuration={path.duration}
          particleSize={path.particleSize || 2}
          particleDelay={path.delay}
          isRetracing={isRetracing}
        />
      ))}
    </svg>
  )
}
