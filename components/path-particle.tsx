"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface PathParticleProps {
  pathId: string
  color: string
  size?: number
  delay: number
  duration: number
  fadeIn?: boolean
  fadeOut?: boolean
}

export function PathParticle({
  pathId,
  color,
  size = 2,
  delay,
  duration,
  fadeIn = true,
  fadeOut = true,
}: PathParticleProps) {
  const [path, setPath] = useState<SVGPathElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Find the path element by ID
    const pathElement = document.getElementById(pathId) as SVGPathElement
    if (pathElement) {
      setPath(pathElement)
      setIsVisible(true)
    }
  }, [pathId])

  if (!path || !isVisible) return null

  // Create a glow filter for the particle
  const glowColor = color.replace("rgb", "rgba").replace(")", ", 0.8)")
  const glowFilter = `drop-shadow(0 0 ${size * 1.5}px ${glowColor})`

  return (
    <motion.circle
      r={size}
      fill={color}
      style={{
        offsetPath: `path("${path.getAttribute("d")}")`,
        offsetRotate: "auto",
        filter: glowFilter,
      }}
      initial={{
        offsetDistance: "0%",
        opacity: fadeIn ? 0 : 1,
        scale: fadeIn ? 0 : 1,
      }}
      animate={{
        offsetDistance: "100%",
        opacity: [fadeIn ? 0 : 1, 1, fadeOut ? 0 : 1],
        scale: [fadeIn ? 0 : 1, 1.2, fadeOut ? 0 : 1],
      }}
      transition={{
        offsetDistance: {
          duration,
          delay,
          ease: "easeInOut",
        },
        opacity: {
          duration,
          delay,
          times: [0, 0.1, 1],
        },
        scale: {
          duration,
          delay,
          times: [0, 0.1, 1],
        },
      }}
    />
  )
}
