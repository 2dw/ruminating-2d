"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { PathParticle } from "./path-particle"

interface PathParticlesProps {
  pathId: string
  color: string
  particleCount?: number
  pathDuration: number
  particleSize?: number
  particleDelay?: number
  isRetracing?: boolean
}

export function PathParticles({
  pathId,
  color,
  particleCount = 5,
  pathDuration,
  particleSize = 2,
  particleDelay = 0,
  isRetracing = false,
}: PathParticlesProps) {
  const [particles, setParticles] = useState<React.ReactNode[]>([])
  const [key, setKey] = useState(0)

  // Generate particles with staggered delays
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: particleCount }).map((_, index) => {
        // Calculate staggered delay for each particle
        // First particle starts with the path, others follow with increasing delays
        const staggerDelay = (pathDuration / particleCount) * index
        const totalDelay = particleDelay + staggerDelay

        return (
          <PathParticle
            key={`${pathId}-particle-${index}-${key}`}
            pathId={pathId}
            color={color}
            size={particleSize * (0.7 + Math.random() * 0.6)} // Slightly randomize size
            delay={totalDelay}
            duration={pathDuration * 0.8} // Particles move slightly faster than the path traces
            fadeIn={index !== 0} // Only the first particle doesn't fade in
            fadeOut={index !== particleCount - 1} // Only the last particle doesn't fade out
          />
        )
      })

      setParticles(newParticles)
    }

    generateParticles()
  }, [pathId, color, particleCount, pathDuration, particleSize, particleDelay, key])

  // Listen for retrace event
  useEffect(() => {
    const handleRetrace = () => {
      // Regenerate particles with a new key to force re-render
      setKey((prevKey) => prevKey + 1)
    }

    document.addEventListener("retrace-constellation", handleRetrace)
    return () => {
      document.removeEventListener("retrace-constellation", handleRetrace)
    }
  }, [])

  return <>{particles}</>
}
