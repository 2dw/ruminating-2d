"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimationControls } from "framer-motion"

interface AnimatedConstellationPathProps {
  d: string
  stroke: string
  strokeWidth: number
  strokeDasharray: string
  fill: string
  filter: string
  initialDelay: number
  animationDuration: number
  pathVariants?: {
    [key: string]: any
  }
  filterVariants?: {
    [key: string]: any
  }
  id?: string
}

export function AnimatedConstellationPath({
  d,
  stroke,
  strokeWidth,
  strokeDasharray,
  fill,
  filter,
  initialDelay,
  animationDuration,
  pathVariants = {},
  filterVariants = {},
  id,
}: AnimatedConstellationPathProps) {
  const pathControls = useAnimationControls()
  const [hasAnimated, setHasAnimated] = useState(false)
  const pathRef = useRef<SVGPathElement>(null)
  const hasValidPath = typeof d === "string" && d.trim().length > 0
  const hasValidPathAnimation = typeof pathVariants.d === "string" && pathVariants.d.trim().length > 0

  if (!hasValidPath) {
    // A missing or invalid SVG path should not block the entire constellation overlay.
    // TODO: restore the exact path data here once a valid `d` value can be supplied.
    return null
  }

  // Initial animation
  useEffect(() => {
    const sequence = async () => {
      // Initial trace animation
      await pathControls.start({
        pathLength: 1,
        opacity: [0, 0.6, 1],
        transition: {
          pathLength: { duration: animationDuration, ease: "easeOut", delay: initialDelay },
          opacity: { duration: animationDuration, delay: initialDelay },
        },
      })

      // Start the continuous animation after the initial trace
      if (hasValidPathAnimation) {
        pathControls.start({
          d: pathVariants.d,
          filter: filterVariants.filter,
          transition: {
            d: { duration: pathVariants.duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            filter: { duration: filterVariants.duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          },
        })
      }

      setHasAnimated(true)
    }

    sequence()
  }, [pathControls, animationDuration, initialDelay, hasValidPathAnimation, pathVariants, filterVariants])

  // Listen for retrace event
  useEffect(() => {
    const handleRetrace = () => {
      // Reset and replay the animation
      pathControls.set({ pathLength: 0, opacity: 0 })

      const sequence = async () => {
        // Trace animation
        await pathControls.start({
          pathLength: 1,
          opacity: [0, 0.6, 1],
          transition: {
            pathLength: { duration: animationDuration, ease: "easeOut", delay: initialDelay },
            opacity: { duration: animationDuration, delay: initialDelay },
          },
        })

        // Restart the continuous animation
        if (hasAnimated && hasValidPathAnimation) {
          pathControls.start({
            d: pathVariants.d,
            filter: filterVariants.filter,
            transition: {
              d: { duration: pathVariants.duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
              filter: { duration: filterVariants.duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            },
          })
        }
      }

      sequence()
    }

    document.addEventListener("retrace-constellation", handleRetrace)
    return () => {
      document.removeEventListener("retrace-constellation", handleRetrace)
    }
  }, [pathControls, animationDuration, initialDelay, hasAnimated, hasValidPathAnimation, pathVariants, filterVariants])

  return (
    <motion.path
      ref={pathRef}
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      fill={fill}
      filter={filter}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={pathControls}
      id={id}
    />
  )
}
