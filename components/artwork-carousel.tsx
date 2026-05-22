"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "framer-motion"
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DynamicFrame } from "@/components/dynamic-frame"
import { cn } from "@/lib/utils"

interface Artwork {
  key: string
  name: string
  url: string
  lastModified?: string
}

interface ArtworkCarouselProps {
  prefix?: string
  refreshIntervalMs?: number
  autoRotate?: boolean
  autoRotateIntervalMs?: number
  captionMode?: "none" | "filename"
  captions?: Record<string, string>
}

function getArtworkTitle(name: string) {
  return name
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function getVersionedUrl(artwork: Artwork) {
  if (!artwork.lastModified) return artwork.url

  const separator = artwork.url.includes("?") ? "&" : "?"
  return `${artwork.url}${separator}v=${encodeURIComponent(artwork.lastModified)}`
}

function getArtworkCaption(
  artwork: Artwork,
  captions: Record<string, string>,
  captionMode: "none" | "filename",
) {
  const override = captions[artwork.key] ?? captions[artwork.name]
  if (override !== undefined) return override
  if (captionMode === "filename") return getArtworkTitle(artwork.name)
  return ""
}

export function ArtworkCarousel({
  prefix = "art/",
  refreshIntervalMs = 60000,
  autoRotate = false,
  autoRotateIntervalMs = 5200,
  captionMode = "none",
  captions = {},
}: ArtworkCarouselProps) {
  const [artwork, setArtwork] = useState<Artwork[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    loop: artwork.length > 1,
  })
  const latestRequestRef = useRef(0)

  const activeArtwork = artwork[selectedIndex]
  const hasMultipleItems = artwork.length > 1
  const activeCaption = activeArtwork ? getArtworkCaption(activeArtwork, captions, captionMode) : ""

  const loadArtwork = useCallback(
    async (showRefreshingState = false) => {
      const requestId = latestRequestRef.current + 1
      latestRequestRef.current = requestId

      if (showRefreshingState) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      try {
        const response = await fetch(`/api/photos?prefix=${encodeURIComponent(prefix)}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Artwork could not be loaded (${response.status})`)
        }

        const data = await response.json()
        if (requestId !== latestRequestRef.current) return

        if (!data.success) {
          throw new Error(data.message || "Artwork could not be loaded")
        }

        const nextArtwork = Array.isArray(data.photos) ? data.photos : []
        setArtwork(nextArtwork)
        setError(null)
        setSelectedIndex((currentIndex) => {
          if (nextArtwork.length === 0) return 0
          return Math.min(currentIndex, nextArtwork.length - 1)
        })
      } catch (err) {
        if (requestId !== latestRequestRef.current) return
        setError(err instanceof Error ? err.message : "Artwork could not be loaded")
      } finally {
        if (requestId === latestRequestRef.current) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    },
    [prefix],
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  useEffect(() => {
    loadArtwork()
  }, [loadArtwork])

  useEffect(() => {
    if (!refreshIntervalMs) return

    const refreshArtwork = () => loadArtwork(true)
    const intervalId = window.setInterval(refreshArtwork, refreshIntervalMs)
    window.addEventListener("focus", refreshArtwork)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", refreshArtwork)
    }
  }, [loadArtwork, refreshIntervalMs])

  useEffect(() => {
    if (!emblaApi) return

    const updateSelected = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    updateSelected()
    emblaApi.on("select", updateSelected)
    emblaApi.on("reInit", updateSelected)

    return () => {
      emblaApi.off("select", updateSelected)
      emblaApi.off("reInit", updateSelected)
    }
  }, [emblaApi])

  useEffect(() => {
    if (!autoRotate || !emblaApi || !hasMultipleItems || isPaused) return

    const intervalId = window.setInterval(() => {
      emblaApi.scrollNext()
    }, autoRotateIntervalMs)

    return () => window.clearInterval(intervalId)
  }, [autoRotate, autoRotateIntervalMs, emblaApi, hasMultipleItems, isPaused, artwork.length])

  useEffect(() => {
    emblaApi?.reInit()
  }, [artwork.length, emblaApi])

  const statusText = useMemo(() => {
    if (isLoading) return "Loading artwork..."
    if (artwork.length === 0) return "No artwork found yet."
    return `${selectedIndex + 1} of ${artwork.length}`
  }, [artwork.length, isLoading, selectedIndex])

  if (isLoading) {
    return (
      <DynamicFrame className="border border-blue-200 bg-white/95 dark:border-blue-800 dark:bg-gray-950/95">
        <div className="flex min-h-[28rem] items-center justify-center p-6">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700 dark:border-blue-900 dark:border-t-blue-300" />
        </div>
      </DynamicFrame>
    )
  }

  if (error) {
    return (
      <DynamicFrame className="border border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/30">
        <div className="flex min-h-[22rem] flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-300" />
          <div>
            <h2 className="font-serif text-2xl font-semibold text-red-800 dark:text-red-200">Artwork unavailable</h2>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <Button variant="outline" onClick={() => loadArtwork(true)}>
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Retry
          </Button>
        </div>
      </DynamicFrame>
    )
  }

  if (artwork.length === 0) {
    return (
      <DynamicFrame className="border border-blue-200 bg-white/95 dark:border-blue-800 dark:bg-gray-950/95">
        <div className="flex min-h-[22rem] items-center justify-center p-8 text-center">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-blue-700 dark:text-blue-300">Digital Art Explorations</h2>
            <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400">
              No artwork was found in the art folder yet. New images added to R2 will appear here automatically.
            </p>
          </div>
        </div>
      </DynamicFrame>
    )
  }

  return (
    <DynamicFrame className="border border-blue-200 bg-white/95 dark:border-blue-800 dark:bg-gray-950/95">
      <section
        className="p-4 sm:p-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onContextMenu={(event) => event.preventDefault()}
        aria-label="Artwork carousel"
      >
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Live from R2
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-blue-700 dark:text-blue-300">
              Digital Art Explorations
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-300">
              Browse the artwork in the art folder. Add, remove, or replace files in R2 and this carousel refreshes from the bucket.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="min-w-16 text-right text-sm text-slate-500 dark:text-slate-400">{statusText}</span>
            <Button variant="outline" size="icon" onClick={() => loadArtwork(true)} aria-label="Refresh artwork">
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>

        <div className="relative">
          <div ref={emblaRef} className="overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex touch-pan-y">
              {artwork.map((piece, index) => (
                <motion.div
                  key={piece.key}
                  className="min-w-0 flex-[0_0_92%] px-2 py-3 sm:flex-[0_0_78%] lg:flex-[0_0_68%]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-white shadow-sm dark:bg-slate-950">
                    <Image
                      src={getVersionedUrl(piece)}
                      alt={getArtworkCaption(piece, captions, captionMode) || getArtworkTitle(piece.name) || "Artwork"}
                      fill
                      draggable={false}
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                      className="protected-media object-contain"
                      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 78vw, 760px"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {hasMultipleItems && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                className="absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-white/90 shadow-sm backdrop-blur dark:bg-slate-950/90"
                aria-label="Previous artwork"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                className="absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-white/90 shadow-sm backdrop-blur dark:bg-slate-950/90"
                aria-label="Next artwork"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            {activeCaption && (
              <h3 className="truncate font-serif text-lg font-semibold text-slate-900 dark:text-white">
                {activeCaption}
              </h3>
            )}
            {activeArtwork.lastModified && (
              <p className={cn("text-xs text-slate-500 dark:text-slate-400", activeCaption && "mt-1")}>
                Updated {new Date(activeArtwork.lastModified).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {hasMultipleItems && (
            <div className="custom-scrollbar-horizontal flex max-w-full gap-2 overflow-x-auto pb-3">
              {artwork.map((piece, index) => (
                <button
                  key={piece.key}
                  type="button"
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "relative h-16 w-20 shrink-0 overflow-hidden rounded-md border bg-slate-100 transition dark:bg-slate-900",
                    selectedIndex === index
                      ? "border-blue-500 ring-2 ring-blue-500/30"
                      : "border-slate-200 opacity-70 hover:opacity-100 dark:border-slate-800",
                  )}
                  aria-label={`Show ${getArtworkTitle(piece.name)}`}
                  aria-current={selectedIndex === index}
                >
                  <Image
                    src={getVersionedUrl(piece)}
                    alt={getArtworkCaption(piece, captions, captionMode) || ""}
                    fill
                    draggable={false}
                    className="protected-media object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </DynamicFrame>
  )
}
