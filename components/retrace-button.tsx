"use client"
import { motion } from "framer-motion"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RetraceButtonProps {
  onClick: () => void
  isRetracing: boolean
}

export function RetraceButton({ onClick, isRetracing }: RetraceButtonProps) {
  return (
    <motion.div
      className="absolute top-2 right-2 z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 12 }} // Show after initial animation completes
    >
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={isRetracing}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
        aria-label="Retrace constellation paths"
      >
        <motion.span
          animate={isRetracing ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 2, repeat: isRetracing ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
          className="mr-2"
        >
          <RefreshCw className="h-4 w-4" />
        </motion.span>
        {isRetracing ? "Tracing..." : "Retrace Paths"}
      </Button>
    </motion.div>
  )
}
