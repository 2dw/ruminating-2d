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
      className="absolute -top-16 right-4 z-20"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 8 }} // Show after initial animation completes
    >
      <motion.div className="relative" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        {/* Soft background blob */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-100/80 to-blue-100/80 dark:from-teal-900/30 dark:to-blue-900/30 rounded-full blur-sm transform scale-110"></div>

        <Button
          onClick={onClick}
          disabled={isRetracing}
          className="relative bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/50 dark:to-blue-950/50 
                     border-2 border-teal-200/60 dark:border-teal-700/60 
                     hover:from-teal-100 hover:to-blue-100 dark:hover:from-teal-900/60 dark:hover:to-blue-900/60
                     hover:border-teal-300/80 dark:hover:border-teal-600/80
                     text-slate-700 dark:text-slate-300 
                     shadow-lg hover:shadow-xl
                     transition-all duration-300 ease-out
                     rounded-full px-3 py-1.5"
          aria-label="Retrace constellation paths"
        >
          <motion.span
            animate={isRetracing ? { rotate: 360 } : { rotate: 0 }}
            transition={{
              duration: 2,
              repeat: isRetracing ? Number.POSITIVE_INFINITY : 0,
              ease: "linear",
            }}
            className="mr-1.5 text-teal-600 dark:text-teal-400"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </motion.span>
          <span className="text-xs font-medium lowercase tracking-wide">
            {isRetracing ? "tracing paths..." : "retrace paths"}
          </span>
        </Button>

        {/* Subtle glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/20 to-blue-400/20 blur-md"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </motion.div>
  )
}
