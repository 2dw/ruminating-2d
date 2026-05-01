"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Camera } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DynamicFrame } from "@/components/dynamic-frame"

interface PhotoAlbum {
  id: string
  title: string
  subtitle: string
  description: string
  prefix: string
  cover?: string
}

export default function PersonalImageryPage() {
  const router = useRouter()
  const [albums, setAlbums] = useState<PhotoAlbum[]>([])
  const [albumPreviews, setAlbumPreviews] = useState<Record<string, string>>({})
  const [loadingPreviews, setLoadingPreviews] = useState(true)

  useEffect(() => {
    let active = true

    const loadAlbumsAndPreviews = async () => {
      setLoadingPreviews(true)

      try {
        // First load albums
        const albumsResponse = await fetch('/api/albums')
        const albumsData = await albumsResponse.json()

        if (!albumsData.success || !Array.isArray(albumsData.albums)) {
          console.warn('Failed to load albums')
          if (active) setLoadingPreviews(false)
          return
        }

        const discoveredAlbums = albumsData.albums
        if (active) setAlbums(discoveredAlbums)

        // Then load previews
        const previews: Record<string, string> = {}

        await Promise.all(
          discoveredAlbums.map(async (album: PhotoAlbum) => {
            if (album.cover && album.cover !== "/placeholder.jpg") {
              previews[album.id] = album.cover
              return
            }

            try {
              const response = await fetch(`/api/photos?prefix=${encodeURIComponent(album.prefix)}`)
              if (!response.ok) return

              const data = await response.json()
              if (data.success && Array.isArray(data.photos) && data.photos.length > 0) {
                previews[album.id] = data.photos[0].url
              }
            } catch (error) {
              console.warn(`Failed to load preview for ${album.id}:`, error)
            }
          })
        )

        if (active) {
          setAlbumPreviews(previews)
          setLoadingPreviews(false)
        }
      } catch (error) {
        console.warn('Failed to load albums and previews:', error)
        if (active) setLoadingPreviews(false)
      }
    }

    loadAlbumsAndPreviews()
    return () => {
      active = false
    }
  }, [])

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500 pt-24"
    >
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              <Camera className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Imagery Meanderings</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Photography allows me to document my travels and capture the beauty of interconnected natural systems. Through my lens, I seek to reveal the patterns and relationships that might otherwise go unnoticed.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Card key={album.id} className="overflow-hidden border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 cursor-pointer transition hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-600">
                <button
                  type="button"
                  onClick={() => router.push(`/personal/albums/${album.id}`)}
                  className="text-left w-full"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <Image
                      src={albumPreviews[album.id] ?? album.cover ?? "/placeholder.jpg"}
                      alt={`${album.title} cover`}
                      fill
                      className="object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-blue-700 dark:text-blue-300">{album.title}</CardTitle>
                    <CardDescription>{album.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{album.description}</p>
                    <div className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-300">Open album →</div>
                  </CardContent>
                </button>
              </Card>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <DynamicFrame className="mt-8 border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
              <div className="p-6">
                <h3 className="text-lg font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">
                  Photo Essay: The Hidden Networks
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  This ongoing photo series explores the visible manifestations of nature's interconnected systems—from the branching patterns of rivers and trees to the intricate structures of fungi and coral reefs. Through these images, I hope to inspire viewers to recognize the similar patterns that connect us all.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="aspect-video bg-blue-100 dark:bg-blue-900/30 relative rounded-md overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=180&width=320&text=Network+1"
                      alt="Network photo 1"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="aspect-video bg-blue-100 dark:bg-blue-900/30 relative rounded-md overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=180&width=320&text=Network+2"
                      alt="Network photo 2"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </DynamicFrame>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
