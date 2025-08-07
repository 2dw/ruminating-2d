"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface ConstellationTooltipProps {
  title: string
  description: string
  color: string
  isVisible: boolean
  position: "top" | "bottom" | "left" | "right"
  className?: string
}

export function ConstellationTooltip({
  title,
  description,
  color,
  isVisible,
  position = "top",
  className = "",
}: ConstellationTooltipProps) {
  const [tooltipColor, setTooltipColor] = useState(color)

  // Parse the RGB color to create a semi-transparent version
  useEffect(() => {
    if (color.startsWith("rgb")) {
      // Extract RGB values
      const rgbMatch = color.match(/rgb$$(\d+),\s*(\d+),\s*(\d+)$$/)
      if (rgbMatch) {
        const [_, r, g, b] = rgbMatch
        setTooltipColor(`rgba(${r}, ${g}, ${b}, 0.1)`)
      }
    }
  }, [color])

  // Position styles based on direction
  const positionStyles = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`absolute z-50 pointer-events-none ${positionStyles[position]} ${className}`}
          initial={{
            opacity: 0,
            y: position === "top" ? 10 : position === "bottom" ? -10 : 0,
            x: position === "left" ? 10 : position === "right" ? -10 : 0,
          }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{
            opacity: 0,
            y: position === "top" ? 10 : position === "bottom" ? -10 : 0,
            x: position === "left" ? 10 : position === "right" ? -10 : 0,
          }}
          transition={{ duration: 0.2 }}
          style={{
            width: "max-content",
            maxWidth: "200px",
            textShadow: `0 0 4px ${color}`,
          }}
        >
          <div
            className="rounded-lg p-3 backdrop-blur-md"
            style={{
              backgroundColor: tooltipColor,
              border: `1px solid ${color}`,
              boxShadow: `0 0 8px ${color}`,
            }}
          >
            <h4 className="text-sm font-medium mb-1" style={{ color }}>
              {title}
            </h4>
            <p className="text-xs opacity-90" style={{ color }}>
              {description}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
