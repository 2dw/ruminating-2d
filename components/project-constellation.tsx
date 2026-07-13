"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Photo {
  key: string
  name: string
  url: string
  lastModified?: string
}

interface ProjectConstellationProps {
  prefix: string
  className?: string
}

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2,
  }))
}

function getVersionedUrl(photo: Photo) {
  if (!photo.lastModified) return photo.url
  const separator = photo.url.includes("?") ? "&" : "?"
  return `${photo.url}${separator}v=${encodeURIComponent(photo.lastModified)}`
}

function getPhotoTitle(name: string) {
  return name
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function ProjectConstellation({ prefix, className }: ProjectConstellationProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([])

  const stars = useMemo(() => generateStars(40), [])

  const activePhoto = photos[activeIndex]
  const hasMultiple = photos.length > 1

  const loadPhotos = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/photos?prefix=${encodeURIComponent(prefix)}`, {
        cache: "no-store",
      })
      if (!response.ok) throw new Error(`Failed to load (${response.status})`)
      const data = await response.json()
      if (!data.success) throw new Error(data.message || "Failed to load photos")

      const loaded = (Array.isArray(data.photos) ? data.photos : []).sort(
        (a: Photo, b: Photo) => (a.name || "").localeCompare(b.name || ""),
      )
      setPhotos(loaded)
      setActiveIndex((i) => Math.min(i, loaded.length - 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load project media")
    } finally {
      setIsLoading(false)
    }
  }, [prefix])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  const goTo = useCallback((index: number) => {
    setActiveIndex(index)
    nodeRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [])

  if (isLoading) {
    return (
      <div className={cn("flex min-h-[24rem] items-center justify-center rounded-3xl", className)}>
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700 dark:border-blue-900 dark:border-t-blue-300" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex min-h-[18rem] flex-col items-center justify-center gap-4 rounded-3xl border border-red-200 bg-red-50/60 p-8 text-center dark:border-red-900 dark:bg-red-950/30", className)}>
        <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        <Button variant="outline" size="sm" onClick={loadPhotos}>
          <RefreshCw className="mr-2 h-3 w-3" /> Retry
        </Button>
      </div>
    )
  }

  if (photos.length === 0) {
    return null
  }

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden rounded-3xl", className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 dark:from-black dark:via-slate-950 dark:to-black" />

      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-xs font-medium tracking-wider text-blue-300 uppercase">
            <span className="text-blue-400">✦</span>
            Connecting the Dots
            <span className="text-blue-400">✦</span>
          </span>
        </div>

        <AnimatePresence mode="wait">
          {activePhoto && (
            <motion.div
              key={activePhoto.key}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="relative mx-auto mb-8 aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-2xl border border-blue-400/20 bg-slate-800 shadow-2xl"
            >
              <Image
                src={getVersionedUrl(activePhoto)}
                alt={getPhotoTitle(activePhoto.name)}
                fill
                draggable={false}
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 pt-12">
                <p className="text-sm font-medium text-white/90">{getPhotoTitle(activePhoto.name)}</p>
              </div>
              {hasMultiple && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => goTo((activeIndex - 1 + photos.length) % photos.length)}
                    className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/30 text-white/80 backdrop-blur hover:bg-black/50 hover:text-white"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => goTo((activeIndex + 1) % photos.length)}
                    className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/30 text-white/80 backdrop-blur hover:bg-black/50 hover:text-white"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {hasMultiple && (
          <>
            <svg className="absolute left-0 right-0 mx-auto h-8 w-full max-w-3xl text-blue-500/20" viewBox="0 0 600 32" preserveAspectRatio="none" style={{ bottom: "7rem" }}>
              <path
                d={(() => {
                  const count = photos.length
                  const spacing = 600 / (count + 1)
                  const points = Array.from({ length: count }, (_, i) => ({
                    x: spacing * (i + 1),
                    y: i % 2 === 0 ? 4 : 28,
                  }))
                  return points
                    .map((p, i) => {
                      if (i === 0) return `M${p.x},${p.y}`
                      const prev = points[i - 1]
                      const cx = (prev.x + p.x) / 2
                      return `Q${cx},${prev.y} ${cx},${(prev.y + p.y) / 2} Q${cx},${p.y} ${p.x},${p.y}`
                    })
                    .join(" ")
                })()}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            </svg>

            <div className="custom-scrollbar-horizontal flex gap-3 overflow-x-auto pb-2">
              {photos.map((photo, index) => {
                const isActive = index === activeIndex
                return (
                  <button
                    key={photo.key}
                    type="button"
                    ref={(el) => {
                      nodeRefs.current[index] = el
                    }}
                    onClick={() => goTo(index)}
                    className={cn(
                      "relative shrink-0 overflow-hidden rounded-full border-2 transition-all duration-300",
                      isActive
                        ? "border-blue-400 shadow-[0_0_16px_rgba(96,165,250,0.5)] scale-110"
                        : "border-blue-400/20 opacity-60 hover:opacity-90 hover:scale-105",
                    )}
                    style={{ width: "56px", height: "56px" }}
                    aria-label={getPhotoTitle(photo.name)}
                  >
                    <Image
                      src={getVersionedUrl(photo)}
                      alt={getPhotoTitle(photo.name)}
                      fill
                      draggable={false}
                      className="object-cover"
                      sizes="56px"
                    />
                  </button>
                )
              })}
            </div>

            <p className="mt-4 text-center text-xs text-blue-300/50">
              {activeIndex + 1} of {photos.length}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
