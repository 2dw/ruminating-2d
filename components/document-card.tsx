"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink, Eye, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DocumentViewer } from "./document-viewer"

interface DocumentCardProps {
  title: string
  description: string
  type: "pdf" | "image"
  url: string
  icon: React.ReactNode
  color: "green" | "blue" | "purple"
}

export function DocumentCard({ title, description, type, url, icon, color }: DocumentCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const colorClasses = {
    green: {
      border: "border-green-200 dark:border-green-800",
      title: "text-green-700 dark:text-green-400",
      icon: "text-green-600 dark:text-green-400",
      button: "bg-green-600 hover:bg-green-700",
      hover: "hover:border-green-300 dark:hover:border-green-700",
    },
    blue: {
      border: "border-blue-200 dark:border-blue-800",
      title: "text-blue-700 dark:text-blue-400",
      icon: "text-blue-600 dark:text-blue-400",
      button: "bg-blue-600 hover:bg-blue-700",
      hover: "hover:border-blue-300 dark:hover:border-blue-700",
    },
    purple: {
      border: "border-purple-200 dark:border-purple-800",
      title: "text-purple-700 dark:text-purple-400",
      icon: "text-purple-600 dark:text-purple-400",
      button: "bg-purple-600 hover:bg-purple-700",
      hover: "hover:border-purple-300 dark:hover:border-purple-700",
    },
  }

  const colors = colorClasses[color]

  const handleView = () => {
    setIsViewerOpen(true)
  }

  const handleDownload = () => {
    window.open(url, "_blank")
  }

  return (
    <>
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
        <Card className={`${colors.border} ${colors.hover} transition-all duration-200 cursor-pointer`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`${colors.icon}`}>{icon}</div>
                <div>
                  <CardTitle className={`text-lg ${colors.title}`}>{title}</CardTitle>
                  <CardDescription className="text-sm mt-1">{description}</CardDescription>
                </div>
              </div>
              <ExternalLink className={`h-4 w-4 ${colors.icon} opacity-60`} />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleView} className={`${colors.button} text-white flex-1`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                className={`${colors.border} ${colors.title} hover:bg-gray-50 dark:hover:bg-gray-800`}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <DocumentViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={title}
        url={url}
        type={type}
      />
    </>
  )
}
