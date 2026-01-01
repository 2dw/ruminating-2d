"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MousePointerClick, RotateCcw } from "lucide-react"

interface ConstellationInteractionHintProps {
  show: boolean
}

export function ConstellationInteractionHint({ show }: ConstellationInteractionHintProps) {
  const [dismissed, setDismissed] = useState(false)

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (show && !dismissed) {
      const timer = setTimeout(() => {
        setDismissed(true)
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [show, dismissed])

  if (!show || dismissed) return null

  return (
    <motion.div
      className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-gray-900/90 px-4 py-3 rounded-lg shadow-md max-w-xs cursor-pointer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => setDismissed(true)}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start gap-3">
        <MousePointerClick className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Explore the Constellation</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Hover over points to learn more, click the glowing destinations to navigate, or use the retrace button to
            replay the animation.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
        <RotateCcw className="h-3 w-3" />
        <span>Click to dismiss</span>
      </div>
    </motion.div>
  )
}
