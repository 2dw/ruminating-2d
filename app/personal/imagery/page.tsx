"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Camera } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PHOTO_ALBUMS } from "@/lib/photo-albums"

export default function PersonalImageryPage() {
  const router = useRouter()
  const [albumPreviews, setAlbumPreviews] = useState<Record<string, string>>({})
  const [loadingPreviews, setLoadingPreviews] = useState(true)

  useEffect(() => {
    let active = true

    const loadPreviews = async () => {
      const previews: Record<string, string> = {}

      await Promise.all(
        PHOTO_ALBUMS.map(async (album) => {
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
    }

    loadPreviews()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/20"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              <Camera className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Imagery Meanderings</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                A dedicated subpage for photography, visual storytelling, and album journeys. From here you can explore each album in its own space.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PHOTO_ALBUMS.map((album) => (
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
        </motion.div>
      </main>
    </div>
  )
}
