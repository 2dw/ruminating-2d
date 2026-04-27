"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { DynamicFrame } from "@/components/dynamic-frame"

interface Photo {
  key: string
  name: string
  url: string
  lastModified?: string
}

interface PhotoGallerySectionProps {
  title: string
  description?: string
  prefix: string
  columns?: number
}

export function PhotoGallerySection({
  title,
  description,
  prefix,
  columns = 3,
}: PhotoGallerySectionProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true)
        const encodedPrefix = encodeURIComponent(prefix)
        const url = `/api/photos?prefix=${encodedPrefix}`
        console.log(`[PhotoGallery] Fetching from: ${url}`)
        
        const response = await fetch(url)
        console.log(`[PhotoGallery] Response status: ${response.status}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch photos: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`[PhotoGallery] Response data:`, data)

        if (data.success && data.photos && data.photos.length > 0) {
          console.log(`[PhotoGallery] Setting ${data.photos.length} photos`)
          setPhotos(data.photos)
        } else if (data.success && (!data.photos || data.photos.length === 0)) {
          console.log(`[PhotoGallery] No photos found for prefix: ${prefix}`)
          setPhotos([])
        } else {
          setError(data.message || "Failed to load photos")
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load photos"
        console.error(`[PhotoGallery] Error:`, errorMsg)
        setError(errorMsg)
        console.error("Error fetching photos:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [prefix])

  if (loading) {
    return (
      <div className="mb-12">
        <h3 className="text-xl font-serif font-semibold mb-6 text-blue-700 dark:text-blue-300">
          {title}
        </h3>
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500 dark:text-gray-400">Loading photos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-12">
        <h3 className="text-xl font-serif font-semibold mb-6 text-blue-700 dark:text-blue-300">
          {title}
        </h3>
        <DynamicFrame className="border border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/30">
          <div className="p-6">
            <p className="text-red-700 dark:text-red-300">Error: {error}</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              Make sure R2 credentials are configured in .env.local
            </p>
          </div>
        </DynamicFrame>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="mb-12">
        <h3 className="text-xl font-serif font-semibold mb-6 text-blue-700 dark:text-blue-300">
          {title}
        </h3>
        <DynamicFrame className="border border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400">No photos found in this collection.</p>
          </div>
        </DynamicFrame>
      </div>
    )
  }

  const gridColsClass = {
    1: "grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  }[columns] || "md:grid-cols-3"

  return (
    <div className="mb-12">
      <h3 className="text-xl font-serif font-semibold mb-6 text-blue-700 dark:text-blue-300">
        {title}
      </h3>
      {description && (
        <p className="text-gray-700 dark:text-gray-300 mb-6">{description}</p>
      )}
      <div className={`grid grid-cols-1 ${gridColsClass} gap-4`}>
        {photos.map((photo, index) => (
          <motion.div
            key={photo.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="relative group"
          >
            <div className="relative aspect-square rounded-md overflow-hidden bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <Image
                src={photo.url}
                alt={photo.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm font-medium truncate">
                  {photo.name.replace(/\.[^/.]+$/, "")}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        {photos.length} photo{photos.length !== 1 ? "s" : ""} found
      </p>
    </div>
  )
}
