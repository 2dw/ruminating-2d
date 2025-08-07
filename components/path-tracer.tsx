"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface PathTracerProps {
  pathId: string
  color: string
  delay: number
  duration: number
}

export function PathTracer({ pathId, color, delay, duration }: PathTracerProps) {
  const [path, setPath] = useState<SVGPathElement | null>(null)
  const [pathLength, setPathLength] = useState(0)

  useEffect(() => {
    const pathElement = document.getElementById(pathId) as SVGPathElement
    if (pathElement) {
      setPath(pathElement)
      setPathLength(pathElement.getTotalLength())
    }
  }, [pathId])

  if (!path) return null

  return (
    <motion.circle
      r={4}
      fill={color}
      filter={`drop-shadow(0 0 5px ${color})`}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 0],
        offsetDistance: ["0%", "100%"],
      }}
      style={{
        offsetPath: `path("${path.getAttribute("d")}")`,
        offsetRotate: "auto",
      }}
      transition={{
        duration,
        delay,
        ease: "easeInOut",
      }}
    />
  )
}
