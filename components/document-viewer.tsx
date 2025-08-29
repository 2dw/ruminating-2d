"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  url: string
  type: "pdf" | "image"
}

export function DocumentViewer({ isOpen, onClose, title, url, type }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setError(false)
      // Simulate loading time for better UX
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleDownload = () => {
    window.open(url, "_blank")
  }

  const handleExternalView = () => {
    window.open(url, "_blank")
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-4 md:inset-8 bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{title}</h2>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline" onClick={handleExternalView}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative overflow-hidden" style={{ height: "calc(100% - 73px)" }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Loading document...</p>
                </div>
              </div>
            )}

            {!isLoading && !error && type === "pdf" && (
              <iframe src={url} className="w-full h-full border-0" title={title} onError={() => setError(true)} />
            )}

            {!isLoading && !error && type === "image" && (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={url || "/placeholder.svg"}
                  alt={title}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setError(true)}
                />
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to display document in viewer</p>
                  <Button onClick={handleExternalView} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
