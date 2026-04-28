"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccessibilityControls } from "@/components/accessibility-controls"
import { useAccessibility } from "@/contexts/accessibility-context"
import { StarryBackground } from "@/components/starry-background"
import { PHOTO_ALBUMS } from "@/lib/photo-albums"

export default function PhotoAlbumsPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { highContrast } = useAccessibility()
  const [albumPreviews, setAlbumPreviews] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadPreviews = async () => {
      const previews: Record<string, string> = {}

      await Promise.all(
        PHOTO_ALBUMS.map(async (album) => {
          try {
            const response = await fetch(`/api/photos?prefix=${encodeURIComponent(album.prefix)}`)
            if (!response.ok) {
              return
            }

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
        setLoading(false)
      }
    }

    loadPreviews()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setIsDarkMode(isDark)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen w-full transition-colors duration-300 ${
        isDarkMode ? "dark bg-[#0a1015] text-white" : "bg-[#f8fcff] text-[#0e0f11]"
      } ${highContrast ? "high-contrast" : ""}`}
    >
      <StarryBackground shootingStarCount={3} />

      <AccessibilityControls isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-[#0a1015]/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/personal")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                aria-label="Return to personal page"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
                </svg>
              </Button>
              <motion.h1
                className="text-xl font-serif font-bold text-blue-700 dark:text-blue-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                Imagery Meanderings
              </motion.h1>
            </div>

            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-serif font-bold text-blue-700 dark:text-blue-300">Photo Collections</h2>
              <p className="mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                Each album has its own page. Choose a collection to open the album detail view with a polished preview and full-size expand experience.
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? "Loading album previews..." : `${PHOTO_ALBUMS.length} collection${PHOTO_ALBUMS.length !== 1 ? "s" : ""} available`}
            </p>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTO_ALBUMS.map((album) => {
            const previewSrc = albumPreviews[album.id] ?? "/placeholder.jpg"

            return (
              <button
                key={album.id}
                type="button"
                onClick={() => router.push(`/personal/albums/${album.id}`)}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/90 dark:hover:border-blue-500"
              >
                <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <Image
                    src={previewSrc}
                    alt={`Preview for ${album.title}`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent opacity-20" />
                </div>
                <div className="p-6 text-left">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{album.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{album.subtitle}</p>
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{album.description}</p>
                  <div className="mt-6 text-sm font-medium text-blue-600 dark:text-blue-300">Open album →</div>
                </div>
              </button>
            )
          })}
        </section>
      </main>
    </div>
  )
}
