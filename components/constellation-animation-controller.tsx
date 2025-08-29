"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { RetraceButton } from "./retrace-button"

interface ConstellationAnimationControllerProps {
  children: React.ReactNode
  onAnimationComplete?: () => void
}

export function ConstellationAnimationController({
  children,
  onAnimationComplete,
}: ConstellationAnimationControllerProps) {
  const [isRetracing, setIsRetracing] = useState(false)

  // Function to manually retrace the constellation
  const handleRetrace = useCallback(() => {
    if (isRetracing) return

    setIsRetracing(true)

    // Trigger custom event that path components will listen for
    const event = new CustomEvent("retrace-constellation")
    document.dispatchEvent(event)

    // Reset retracing state after animation completes
    setTimeout(() => {
      setIsRetracing(false)
    }, 12000)
  }, [isRetracing])

  return (
    <div className="relative">
      {/* Retrace button */}
      <RetraceButton onClick={handleRetrace} isRetracing={isRetracing} />

      {children}
    </div>
  )
}
