"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { motion, useAnimationControls } from "framer-motion"
import { RetraceButton } from "./retrace-button"

interface ConstellationAnimationControllerProps {
  children: React.ReactNode
  onAnimationComplete?: () => void
}

export function ConstellationAnimationController({
  children,
  onAnimationComplete,
}: ConstellationAnimationControllerProps) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isRetracing, setIsRetracing] = useState(false)
  const overlayControls = useAnimationControls()
  const textControls = useAnimationControls()

  // Initial animation sequence
  useEffect(() => {
    // Set ready after short delay to ensure all DOM elements are ready
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Track whether animation has run once
  useEffect(() => {
    if (isReady && !hasAnimated) {
      setHasAnimated(true)

      // Initial animation sequence
      overlayControls.start({
        backgroundColor: "rgba(0,0,0,0)",
        transition: { duration: 2, delay: 11 },
      })

      textControls.start({
        opacity: 0,
        transition: { duration: 1, delay: 11 },
      })

      // Notify parent when animation completes
      const timer = setTimeout(() => {
        if (onAnimationComplete) onAnimationComplete()
      }, 13000)

      return () => clearTimeout(timer)
    }
  }, [isReady, hasAnimated, overlayControls, textControls, onAnimationComplete])

  // Function to manually retrace the constellation
  const handleRetrace = useCallback(() => {
    if (isRetracing) return

    setIsRetracing(true)

    // Show overlay with text
    overlayControls.start({
      backgroundColor: "rgba(0,0,0,0.7)",
      transition: { duration: 0.5 },
    })

    textControls.start({
      opacity: 1,
      transition: { duration: 0.5 },
    })

    // Trigger custom event that path components will listen for
    const event = new CustomEvent("retrace-constellation")
    document.dispatchEvent(event)

    // Hide overlay after animation completes
    setTimeout(() => {
      overlayControls.start({
        backgroundColor: "rgba(0,0,0,0)",
        transition: { duration: 1.5 },
      })

      textControls.start({
        opacity: 0,
        transition: { duration: 1 },
      })

      setTimeout(() => {
        setIsRetracing(false)
      }, 1500)
    }, 10000)
  }, [isRetracing, overlayControls, textControls])

  return (
    <div className="relative">
      {/* Animation overlay that fades out after animation completes */}
      {isReady && (
        <motion.div
          className="fixed inset-0 z-[60] pointer-events-none"
          initial={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          animate={overlayControls}
        >
          <motion.div
            className="text-white text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-light"
            initial={{ opacity: 1 }}
            animate={textControls}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 10, times: [0, 0.05, 1] }}
            >
              Mapping connections...
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Retrace button */}
      {hasAnimated && <RetraceButton onClick={handleRetrace} isRetracing={isRetracing} />}

      {children}
    </div>
  )
}
