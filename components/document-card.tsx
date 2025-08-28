"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, ImageIcon, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DocumentViewer } from "./document-viewer"
import Image from "next/image"

interface DocumentCardProps {
  title: string
  description?: string
  src: string
  type: "pdf" | "image"
  thumbnail?: string
  tags?: string[]
}

export function DocumentCard({ title, description, src, type, thumbnail, tags }: DocumentCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const Icon = type === "pdf" ? FileText : ImageIcon

  return (
    <>
      <motion.div
        className="border border-green-200 dark:border-green-800 rounded-lg overflow-hidden bg-white/95 dark:bg-gray-950/95 hover:shadow-lg transition-shadow cursor-pointer"
        whileHover={{ y: -5 }}
        onClick={() => setIsViewerOpen(true)}
      >
        {/* Thumbnail */}
        <div className="h-48 bg-green-100 dark:bg-green-900/30 relative overflow-hidden">
          {thumbnail ? (
            <Image src={thumbnail || "/placeholder.svg"} alt={`${title} thumbnail`} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Icon className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <Button variant="secondary" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View {type === "pdf" ? "Document" : "Image"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-serif font-semibold mb-2 text-green-700 dark:text-green-300">{title}</h3>
          {description && <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{description}</p>}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <DocumentViewer
        src={src}
        title={title}
        type={type}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  )
}
