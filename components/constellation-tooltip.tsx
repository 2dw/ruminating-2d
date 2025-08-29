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
  const [tooltipBg, setTooltipBg] = useState("rgba(255, 255, 255, 0.95)")
  const [tooltipBorder, setTooltipBorder] = useState(color)

  // Create proper background colors based on the constellation color
  useEffect(() => {
    if (color.startsWith("rgb")) {
      const rgbMatch = color.match(/rgb$$(\d+),\s*(\d+),\s*(\d+)$$/)
      if (rgbMatch) {
        const [_, r, g, b] = rgbMatch
        setTooltipBg(`rgba(${r}, ${g}, ${b}, 0.1)`)
        setTooltipBorder(`rgba(${r}, ${g}, ${b}, 0.8)`)
      }
    }
  }, [color])

  // Position styles based on direction
  const positionStyles = {
    top: "bottom-full mb-3 left-1/2 transform -translate-x-1/2",
    bottom: "top-full mt-3 left-1/2 transform -translate-x-1/2",
    left: "right-full mr-3 top-1/2 transform -translate-y-1/2",
    right: "left-full ml-3 top-1/2 transform -translate-y-1/2",
  }

  // Arrow styles for each position
  const arrowStyles = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent",
    bottom:
      "bottom-full left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent",
    left: "left-full top-1/2 transform -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent",
    right:
      "right-full top-1/2 transform -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent",
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`absolute z-50 pointer-events-none ${positionStyles[position]} ${className}`}
          initial={{
            opacity: 0,
            scale: 0.8,
            y: position === "top" ? 10 : position === "bottom" ? -10 : 0,
            x: position === "left" ? 10 : position === "right" ? -10 : 0,
          }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{
            opacity: 0,
            scale: 0.8,
            y: position === "top" ? 10 : position === "bottom" ? -10 : 0,
            x: position === "left" ? 10 : position === "right" ? -10 : 0,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Tooltip Content */}
          <div
            className="relative rounded-lg p-4 backdrop-blur-md shadow-lg min-w-[200px] max-w-[280px]"
            style={{
              backgroundColor: tooltipBg,
              border: `2px solid ${tooltipBorder}`,
              boxShadow: `0 4px 20px ${color}40, 0 0 0 1px ${color}20`,
            }}
          >
            {/* Arrow */}
            <div
              className={`absolute ${arrowStyles[position]}`}
              style={{
                borderTopColor: position === "bottom" ? tooltipBorder : "transparent",
                borderBottomColor: position === "top" ? tooltipBorder : "transparent",
                borderLeftColor: position === "right" ? tooltipBorder : "transparent",
                borderRightColor: position === "left" ? tooltipBorder : "transparent",
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              <h4 className="text-sm font-semibold mb-2 leading-tight" style={{ color }}>
                {title}
              </h4>
              <p className="text-xs leading-relaxed opacity-90" style={{ color }}>
                {description}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
