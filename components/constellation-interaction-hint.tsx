"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MousePointerClick } from "lucide-react"

interface ConstellationInteractionHintProps {
  show: boolean
}

export function ConstellationInteractionHint({ show }: ConstellationInteractionHintProps) {
  const [dismissed, setDismissed] = useState(false)

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (show && !dismissed) {
      const timer = setTimeout(() => {
        setDismissed(true)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [show, dismissed])

  if (!show || dismissed) return null

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-900/90 px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-sm cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={() => setDismissed(true)}
      whileHover={{ scale: 1.05 }}
      aria-label="Click the retrace button to replay the constellation animation"
    >
      <MousePointerClick className="h-4 w-4 text-blue-500" />
      <span>Click to retrace the constellation</span>
    </motion.div>
  )
}
