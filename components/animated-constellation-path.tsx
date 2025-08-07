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

  // Initial animation
  useEffect(() => {
    const sequence = async () => {
      // Initial trace animation
      await pathControls.start({
        pathLength: 1,
        opacity: [0, 0.8, 1, 0.8],
        transition: {
          pathLength: { duration: animationDuration, ease: "easeOut", delay: initialDelay },
          opacity: { duration: animationDuration + 0.5, delay: initialDelay },
        },
      })

      // Start the continuous animation after the initial trace
      if (Object.keys(pathVariants).length > 0) {
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
  }, [pathControls, animationDuration, initialDelay, pathVariants, filterVariants])

  // Listen for retrace event
  useEffect(() => {
    const handleRetrace = () => {
      // Reset and replay the animation
      pathControls.set({ pathLength: 0, opacity: 0 })

      const sequence = async () => {
        // Trace animation
        await pathControls.start({
          pathLength: 1,
          opacity: [0, 0.8, 1, 0.8],
          transition: {
            pathLength: { duration: animationDuration, ease: "easeOut", delay: initialDelay },
            opacity: { duration: animationDuration + 0.5, delay: initialDelay },
          },
        })

        // Restart the continuous animation
        if (hasAnimated && Object.keys(pathVariants).length > 0) {
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
  }, [pathControls, animationDuration, initialDelay, pathVariants, filterVariants, hasAnimated])

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
