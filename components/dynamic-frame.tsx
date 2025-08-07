"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion } from "framer-motion"

interface DynamicFrameProps {
  children: React.ReactNode
  className?: string
}

export function DynamicFrame({ children, className = "" }: DynamicFrameProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const frameRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (frameRef.current) {
      const { left, top, width, height } = frameRef.current.getBoundingClientRect()
      const x = (e.clientX - left) / width
      const y = (e.clientY - top) / height
      setMousePosition({ x, y })
    }
  }

  return (
    <motion.div
      ref={frameRef}
      className={`relative overflow-hidden rounded-lg ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Dynamic gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-0 bg-gradient-to-r from-green-300/10 to-blue-300/10 z-10 pointer-events-none"
        animate={{
          opacity: isHovered ? 0.7 : 0,
          background: isHovered
            ? `radial-gradient(circle at ${mousePosition.x * 100}% ${
                mousePosition.y * 100
              }%, rgba(74, 222, 128, 0.08), rgba(59, 130, 246, 0.03))`
            : "none",
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Dynamic border */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none z-20"
        animate={{
          boxShadow: isHovered
            ? `0 0 0 1px rgba(255, 255, 255, 0.2) inset, 
               0 ${10 - mousePosition.y * 20}px ${20 - mousePosition.y * 10}px rgba(0, 0, 0, 0.07)`
            : "0 0 0 0 rgba(0, 0, 0, 0) inset, 0 0 0 0 rgba(0, 0, 0, 0)",
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Content */}
      <div className="relative z-0">{children}</div>
    </motion.div>
  )
}
