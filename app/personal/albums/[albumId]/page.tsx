"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PHOTO_ALBUMS } from "@/lib/photo-albums"

interface Photo {
  key: string
  name: string
  url: string
}

export default function AlbumDetailPage() {
  const router = useRouter()
  const routeParams = useParams()
  const albumId = Array.isArray(routeParams?.albumId) ? routeParams.albumId[0] : routeParams?.albumId
  const album = useMemo(
    () => (albumId ? PHOTO_ALBUMS.find((item) => item.id === albumId) : undefined),
    [albumId]
  )
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const selectedPhoto = photos[selectedIndex] ?? photos[0]

  useEffect(() => {
    if (!album) return

    let active = true
    const loadPhotos = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/photos?prefix=${encodeURIComponent(album.prefix)}`)
        const data = await response.json()
        if (active && data.success && Array.isArray(data.photos)) {
          setPhotos(data.photos)
          setSelectedIndex(0)
        }
      } catch (error) {
        console.warn("Failed to load album photos:", error)
        if (active) setPhotos([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPhotos()
    return () => {
      active = false
    }
  }, [album])

  if (albumId === undefined) {
    return (
      <div className="min-h-screen bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-950/80">
            <p className="text-lg text-slate-800 dark:text-slate-200">Resolving album…</p>
          </div>
        </main>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Button variant="ghost" size="icon" onClick={() => router.push("/personal/albums")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white/90 p-10 text-center dark:border-slate-800 dark:bg-slate-950/80">
            <p className="text-lg text-slate-800 dark:text-slate-200">Album not found.</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Looking for <span className="font-semibold text-slate-900 dark:text-white">{albumId ?? "unknown"}</span></p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-blue-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-blue-300">
            <span className="text-lg font-semibold">📷</span>
          </div>
          <div className="mt-6">
            <h1 className="text-5xl font-serif font-bold tracking-tight text-slate-900 dark:text-white">{album.title}</h1>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 max-w-3xl">{album.subtitle}</p>
          </div>
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            {photos.length > 0 ? `${photos.length} photos available` : "Loading photos..."}
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 text-center dark:border-slate-800 dark:bg-slate-950/80">
            <p className="text-slate-700 dark:text-slate-300">Loading album…</p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 dark:border-slate-800 dark:bg-slate-950/80">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Album overview</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">{album.description}</p>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Browse the thumbnails and select one to preview it instantly in the larger image pane.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.6fr_0.95fr] items-start">
              <div className="relative rounded-[2rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/80">
                {selectedPhoto ? (
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="group relative block overflow-hidden rounded-[1.5rem] bg-slate-900"
                    aria-label="Open expanded image preview"
                  >
                    <Image
                      src={selectedPhoto.url}
                      alt={selectedPhoto.name || album.title}
                      width={1200}
                      height={900}
                      className="h-[44rem] w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-4 text-white">
                      <p className="text-sm font-semibold">
                        {selectedPhoto.name || `Photo ${selectedIndex + 1}`}
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="flex h-[44rem] items-center justify-center text-slate-500">No photo available</div>
                )}
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/80 min-h-[44rem]">
                <div className="max-h-[40rem] min-h-[40rem] overflow-y-auto pr-3 custom-scrollbar">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {photos.map((photo, index) => (
                      <button
                        key={photo.key}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        className={`overflow-hidden rounded-3xl border p-0 transition ${
                          index === selectedIndex
                            ? "border-blue-500 shadow-lg shadow-blue-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                        }`}
                      >
                        <Image
                          src={photo.url}
                          alt={photo.name || `Thumbnail ${index + 1}`}
                          width={400}
                          height={300}
                          className="h-28 w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {expanded && selectedPhoto && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute right-6 top-6">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-full bg-white/90 p-3 text-slate-950 shadow-lg"
                aria-label="Close expanded preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative h-[85vh] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-black">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.name || album.title}
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

