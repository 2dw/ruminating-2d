"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Download, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface DocumentViewerProps {
  src: string
  title: string
  type: "pdf" | "image"
  isOpen: boolean
  onClose: () => void
}

export function DocumentViewer({ src, title, type, isOpen, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1)

  if (!isOpen) return null

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-6xl max-h-[90vh] w-full flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{title}</h3>
          <div className="flex items-center gap-2">
            {type === "image" && (
              <>
                <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" asChild>
              <a href={src} download>
                <Download className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {type === "pdf" ? (
            <iframe src={src} className="w-full h-full min-h-[600px]" title={title} />
          ) : (
            <div className="flex items-center justify-center p-4 h-full">
              <div style={{ transform: `scale(${zoom})` }} className="transition-transform">
                <Image
                  src={src || "/placeholder.svg"}
                  alt={title}
                  width={800}
                  height={600}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
