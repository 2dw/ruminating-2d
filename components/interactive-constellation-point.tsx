"use client"

import { useState, useEffect } from "react"
import { motion, useAnimationControls } from "framer-motion"
import { ConstellationTooltip } from "./constellation-tooltip"
import { useRouter } from "next/navigation"

interface InteractiveConstellationPointProps {
  x: number
  y: number
  size?: number
  color: string
  glowColor: string
  label: string
  tooltipTitle: string
  tooltipDescription: string
  tooltipPosition?: "top" | "bottom" | "left" | "right"
  delay?: number
  pulseAnimation?: boolean
  initialAnimation?: boolean
  className?: string
  navigateTo?: string // Add navigation capability
}

export function InteractiveConstellationPoint({
  x,
  y,
  size = 3,
  color,
  glowColor,
  label,
  tooltipTitle,
  tooltipDescription,
  tooltipPosition = "top",
  delay = 0,
  pulseAnimation = true,
  initialAnimation = false,
  className = "",
  navigateTo,
}: InteractiveConstellationPointProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isTouched, setIsTouched] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const pointControls = useAnimationControls()
  const router = useRouter()

  // Handle touch events for mobile
  const handleTouch = () => {
    setIsTouched(!isTouched)
  }

  // Handle click navigation
  const handleClick = () => {
    if (navigateTo) {
      setIsClicked(true)
      // Add a small delay for visual feedback
      setTimeout(() => {
        router.push(navigateTo)
      }, 150)
    }
  }

  // Show tooltip if either hovered or touched
  const showTooltip = isHovered || isTouched

  // Initial animation
  useEffect(() => {
    if (initialAnimation) {
      pointControls.start({
        scale: [0, 1.5, 1],
        opacity: [0, 1],
        boxShadow: [`0 0 0px ${glowColor}`, `0 0 20px ${glowColor}`, `0 0 8px ${glowColor}`],
        transition: {
          duration: 1.5,
          delay,
        },
      })
    } else if (pulseAnimation) {
      pointControls.start({
        scale: [1, 1.2, 1],
        boxShadow: [`0 0 4px ${glowColor}`, `0 0 12px ${glowColor}`, `0 0 4px ${glowColor}`],
        transition: {
          duration: 2.5,
          repeat: Number.POSITIVE_INFINITY,
        },
      })
    }
  }, [initialAnimation, pulseAnimation, pointControls, glowColor, delay])

  // Listen for retrace event
  useEffect(() => {
    const handleRetrace = () => {
      if (initialAnimation) {
        // Reset and replay the animation
        pointControls.set({ scale: 0, opacity: 0 })
        pointControls
          .start({
            scale: [0, 1.5, 1],
            opacity: [0, 1],
            boxShadow: [`0 0 0px ${glowColor}`, `0 0 20px ${glowColor}`, `0 0 8px ${glowColor}`],
            transition: {
              duration: 1.5,
              delay,
            },
          })
          .then(() => {
            if (pulseAnimation) {
              pointControls.start({
                scale: [1, 1.2, 1],
                boxShadow: [`0 0 4px ${glowColor}`, `0 0 12px ${glowColor}`, `0 0 4px ${glowColor}`],
                transition: {
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                },
              })
            }
          })
      }
    }

    document.addEventListener("retrace-constellation", handleRetrace)
    return () => {
      document.removeEventListener("retrace-constellation", handleRetrace)
    }
  }, [initialAnimation, pulseAnimation, pointControls, glowColor, delay])

  return (
    <div
      className={`absolute ${className}`}
      style={{ left: `${x}px`, top: `${y}px` }}
      aria-label={`${label} constellation point. ${tooltipTitle}: ${tooltipDescription}`}
    >
      {/* The constellation point */}
      <motion.div
        className={`relative ${navigateTo ? "cursor-pointer" : "cursor-default"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouch}
        onClick={handleClick}
        initial={initialAnimation ? { scale: 0, opacity: 0 } : { scale: 1 }}
        animate={pointControls}
        whileHover={{
          scale: 1.5,
          boxShadow: `0 0 15px ${glowColor}`,
        }}
        whileTap={navigateTo ? { scale: 1.2 } : {}}
        style={{
          width: `${size * 2}px`,
          height: `${size * 2}px`,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 8px ${glowColor}`,
          transform: "translate(-50%, -50%)",
          zIndex: 10,
        }}
      />

      {/* The tooltip */}
      <ConstellationTooltip
        title={tooltipTitle}
        description={tooltipDescription}
        color={color}
        isVisible={showTooltip}
        position={tooltipPosition}
      />
    </div>
  )
}
