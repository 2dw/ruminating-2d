"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, RefreshCw, FileText, Film, Presentation, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Photo {
  key: string
  name: string
  url: string
  mediaType?: string
  lastModified?: string
}

interface ProjectConstellationProps {
  prefix: string
  captions?: Record<string, string>
  className?: string
  mediaPrefix?: string
  mediaFilter?: string[]
  noMediaMessage?: string
}

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
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

function getMediaIcon(mediaType?: string) {
  switch (mediaType) {
    case "animation":
    case "video":
      return Film
    case "document":
    case "text":
      return FileText
    case "slide":
      return Presentation
    default:
      return File
  }
}

function orderByFilename(photos: Photo[]): Photo[] {
  return [...photos].sort((a, b) => {
    const numA = parseInt(a.name.match(/\d+/)?.[0] || "0", 10)
    const numB = parseInt(b.name.match(/\d+/)?.[0] || "0", 10)
    return numA - numB
  })
}

function calculateStarSize(count: number, area: number): number {
  const targetDensity = count / (area / 10000)
  if (targetDensity < 3) return 80
  if (targetDensity < 6) return 72
  if (targetDensity < 10) return 64
  return 56
}

function distributePositions(
  count: number,
  width: number,
  height: number,
  starRadius: number,
): { x: number; y: number }[] {
  if (count === 0) return []
  if (count === 1) return [{ x: width / 2, y: height / 2 }]

  const margin = starRadius + 16
  const minDist = starRadius * 2 + 12
  const positions: { x: number; y: number }[] = []

  for (let attempt = 0; attempt < 200; attempt++) {
    positions.length = 0
    let success = true

    for (let i = 0; i < count; i++) {
      let placed = false
      for (let tries = 0; tries < 60; tries++) {
        const x = margin + Math.random() * (width - margin * 2)
        const y = margin + Math.random() * (height - margin * 2)

        const tooClose = positions.some(
          (p) => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) < minDist,
        )

        if (!tooClose) {
          positions.push({ x, y })
          placed = true
          break
        }
      }

      if (!placed) {
        const angle = (i / count) * Math.PI * 2 + (attempt * 0.5)
        const radius = Math.min(width, height) * 0.35
        positions.push({
          x: width / 2 + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5),
          y: height / 2 + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5),
        })
      }
    }

    if (success) break
  }

  for (let iter = 0; iter < 30; iter++) {
    let moved = false
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[j].x - positions[i].x
        const dy = positions[j].y - positions[i].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < minDist && dist > 0) {
          const push = (minDist - dist) / 2 + 2
          const nx = (dx / dist) * push
          const ny = (dy / dist) * push
          positions[i].x = Math.max(margin, Math.min(width - margin, positions[i].x - nx))
          positions[i].y = Math.max(margin, Math.min(height - margin, positions[i].y - ny))
          positions[j].x = Math.max(margin, Math.min(width - margin, positions[j].x + nx))
          positions[j].y = Math.max(margin, Math.min(height - margin, positions[j].y + ny))
          moved = true
        }
      }
    }
    if (!moved) break
  }

  return positions
}

function buildConstellationLines(
  positions: { x: number; y: number }[],
): [number, number][] {
  if (positions.length < 2) return []

  const lines: [number, number][] = []

  for (let i = 0; i < positions.length - 1; i++) {
    lines.push([i, i + 1])
  }

  if (positions.length > 3) {
    for (let i = 0; i < positions.length; i++) {
      const dists = positions
        .map((p, j) => ({ j, dist: Math.sqrt((p.x - positions[i].x) ** 2 + (p.y - positions[i].y) ** 2) }))
        .filter((d) => d.j !== i && Math.abs(d.j - i) > 1)
        .sort((a, b) => a.dist - b.dist)

      for (const d of dists.slice(0, 1)) {
        if (d.dist < 250) {
          const key = [Math.min(i, d.j), Math.max(i, d.j)].join("-")
          if (!lines.some(([a, b]) => `${a}-${b}` === key || `${b}-${a}` === key)) {
            lines.push([i, d.j])
          }
        }
      }
    }
  }

  return lines
}

export function ProjectConstellation({ prefix, captions = {}, className, mediaPrefix, mediaFilter, noMediaMessage }: ProjectConstellationProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const stars = useMemo(() => generateStars(60), [])

  const loadPhotos = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const requestPrefix = mediaPrefix || prefix
      const response = await fetch(`/api/photos?prefix=${encodeURIComponent(requestPrefix)}`, {
        cache: "no-store",
      })
      if (!response.ok) throw new Error(`Failed to load (${response.status})`)
      const data = await response.json()
      if (!data.success) throw new Error(data.message || "Failed to load photos")

      let loaded = (Array.isArray(data.photos) ? data.photos : []).sort(
        (a: Photo, b: Photo) => (a.name || "").localeCompare(b.name || ""),
      )

      if (mediaFilter && mediaFilter.length > 0) {
        const lowerFilters = mediaFilter.map((f) => f.toLowerCase())
        loaded = loaded.filter((photo: Photo) => {
          const name = photo.name.toLowerCase()
          return lowerFilters.some((f) => name.includes(f))
        })
      }

      const EXCLUDED_EXTENSIONS = [".docx", ".doc", ".txt", ".md", ".rtf", ".pptx", ".ppt"]
      loaded = loaded.filter((photo: Photo) => {
        const lower = photo.name.toLowerCase()
        return !EXCLUDED_EXTENSIONS.some((ext) => lower.endsWith(ext))
      })

      setPhotos(orderByFilename(loaded))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load project media")
    } finally {
      setIsLoading(false)
    }
  }, [prefix, mediaPrefix, mediaFilter])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  const containerArea = 900 * 620
  const starSize = useMemo(() => calculateStarSize(photos.length, containerArea), [photos.length])

  const positions = useMemo(() => {
    if (photos.length === 0) return []
    return distributePositions(photos.length, 800, 620, starSize / 2)
  }, [photos.length, starSize])

  const lines = useMemo(() => buildConstellationLines(positions), [positions])

  const activePhoto = activeIndex !== null ? photos[activeIndex] : null
  const hasMultiple = photos.length > 1

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0))
  }, [photos.length])

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : 0))
  }, [photos.length])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (activeIndex === null) return
      if (e.key === "Escape") setActiveIndex(null)
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [activeIndex, goNext, goPrev])

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
    return (
      <div className={cn("flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 p-8 text-center dark:border-slate-700 dark:bg-slate-900/30", className)}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <svg className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{noMediaMessage || "No media yet"}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">Media uploaded to this folder will appear here</p>
      </div>
    )
  }

  return (
    <>
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
            animate={{ opacity: [0.08, 0.5, 0.08] }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <svg
          className="absolute inset-0 h-full w-full"
          style={{ filter: "drop-shadow(0 0 3px rgba(96, 165, 250, 0.12))" }}
        >
          {lines.map(([i, j], idx) => (
            <motion.line
              key={idx}
              x1={positions[i].x}
              y1={positions[i].y}
              x2={positions[j].x}
              y2={positions[j].y}
              className="text-blue-500/20"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: idx * 0.02, ease: "easeOut" }}
            />
          ))}
        </svg>

        <div
          className="relative z-10 mx-auto"
          style={{ height: "620px", width: "100%", maxWidth: "900px" }}
        >
          {photos.map((photo, index) => {
            const pos = positions[index]
            const isActive = activeIndex === index
            const isHovered = hoveredIndex === index
            const highlighted = isActive || isHovered

            return (
              <button
                key={photo.key}
                type="button"
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="absolute"
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: starSize,
                  height: starSize,
                  transform: "translate(-50%, -50%)",
                  zIndex: highlighted ? 20 : 10,
                }}
                aria-label={getPhotoTitle(photo.name)}
              >
                <motion.div
                  className="relative h-full w-full"
                  whileHover={{ scale: 1.2 }}
                  animate={{ scale: isActive ? 1.2 : 1 }}
                  transition={{ type: "spring", stiffness: 250, damping: 16 }}
                >
                  <div
                    className={cn(
                      "relative h-full w-full overflow-hidden rounded-full border shadow-lg transition-shadow duration-500",
                      highlighted
                        ? "border-blue-400/80"
                        : "border-blue-400/15",
                    )}
                    style={{
                      boxShadow: highlighted
                        ? "0 0 24px 4px rgba(96, 165, 250, 0.45), 0 0 60px 12px rgba(96, 165, 250, 0.15)"
                        : "0 0 8px 0 rgba(96, 165, 250, 0.08)",
                    }}
                  >
                    {photo.mediaType === "image" || photo.mediaType === "animation" || !photo.mediaType ? (
                      <Image
                        src={getVersionedUrl(photo)}
                        alt={getPhotoTitle(photo.name)}
                        fill
                        draggable={false}
                        className="object-cover"
                        sizes={`${starSize}px`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-800/80">
                        {(() => {
                          const Icon = getMediaIcon(photo.mediaType)
                          return <Icon className="h-1/2 w-1/2 text-blue-300/60" />
                        })()}
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
                    {highlighted && (
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.25) 0%, transparent 70%)",
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              </button>
            )
          })}
        </div>

        {hasMultiple && (
          <div className="relative z-10 pb-5 text-center">
            <p className="text-xs text-blue-300/40 tracking-wide">
              {photos.length} stars &middot; click any star to explore
            </p>
          </div>
        )}

        {hoveredIndex !== null && hoveredIndex < photos.length && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-30"
            style={{
              left: positions[hoveredIndex].x,
              top: positions[hoveredIndex].y - starSize / 2 - 12,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="whitespace-nowrap rounded-lg bg-slate-800/90 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm border border-slate-700/50 shadow-lg">
              {captions[photos[hoveredIndex].key] || getPhotoTitle(photos[hoveredIndex].name)}
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {activePhoto && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveIndex(null)}
          >
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="relative flex h-full w-full items-center justify-center p-4 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {hasMultiple && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white/70 backdrop-blur hover:bg-white/20 hover:text-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white/70 backdrop-blur hover:bg-white/20 hover:text-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              <motion.div
                key={activePhoto.key}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.25 }}
                className="relative max-h-[85vh] max-w-[90vw]"
              >
                {activePhoto.mediaType === "video" ? (
                  <video
                    src={getVersionedUrl(activePhoto)}
                    controls
                    autoPlay
                    className="max-h-[85vh] max-w-[90vw] rounded-lg"
                  />
                ) : activePhoto.mediaType === "animation" ? (
                  <Image
                    src={getVersionedUrl(activePhoto)}
                    alt={getPhotoTitle(activePhoto.name)}
                    width={1200}
                    height={900}
                    draggable={false}
                    className="h-auto w-auto max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
                    sizes="90vw"
                    priority
                    unoptimized
                  />
                ) : activePhoto.mediaType === "document" && activePhoto.name.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={getVersionedUrl(activePhoto)}
                    title={getPhotoTitle(activePhoto.name)}
                    className="h-[85vh] w-[90vw] rounded-lg border-0 bg-white"
                  />
                ) : activePhoto.mediaType === "document" || activePhoto.mediaType === "text" || activePhoto.mediaType === "slide" ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-48 w-64 flex-col items-center justify-center rounded-lg border border-slate-600 bg-slate-800/80 p-6 text-center">
                      {(() => {
                        const Icon = getMediaIcon(activePhoto.mediaType)
                        return <Icon className="mb-4 h-16 w-16 text-blue-300/60" />
                      })()}
                      <p className="text-sm text-white/80">{getPhotoTitle(activePhoto.name)}</p>
                      <p className="mt-1 text-xs text-white/40">{activePhoto.mediaType?.toUpperCase()}</p>
                    </div>
                    <a
                      href={getVersionedUrl(activePhoto)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4"
                    >
                      Open file in new tab
                    </a>
                  </div>
                ) : (
                  <Image
                    src={getVersionedUrl(activePhoto)}
                    alt={getPhotoTitle(activePhoto.name)}
                    width={1200}
                    height={900}
                    draggable={false}
                    className="h-auto w-auto max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
                    sizes="90vw"
                    priority
                  />
                )}
                <p className="mt-3 text-center text-sm text-white/60">
                  {getPhotoTitle(activePhoto.name)}
                </p>
              </motion.div>
            </div>

            {hasMultiple && (
              <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-xs text-white/40 tracking-wide">
                {activeIndex !== null ? `${activeIndex + 1} of ${photos.length}` : ""}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
