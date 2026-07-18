"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useAlbums } from "@/contexts/albums-context"

interface Photo {
  key: string
  name: string
  url: string
  mediaType?: string
  lastModified?: string
}

function getPhotoCaption(
  photo: Photo,
  index: number,
  albumTitle: string,
  captions?: Record<string, string>,
): string {
  if (captions?.[photo.key]) return captions[photo.key]
  if (captions?.[photo.name]) return captions[photo.name]
  return `${albumTitle} — ${index + 1}`
}

export default function AlbumDetailPage() {
  const router = useRouter()
  const routeParams = useParams()
  const albumId = Array.isArray(routeParams?.albumId) ? routeParams.albumId[0] :routeParams?.albumId
  const { albums, loading: albumLoading } = useAlbums()

  const album = useMemo(
    () => (albumId ? albums.find((item) => item.id === albumId) : undefined),
    [albumId, albums],
  )

  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const selectedPhoto = photos[selectedIndex] ?? photos[0]

  const clampZoom = useCallback((v: number) => Math.min(5, Math.max(0.25, v)), [])

  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const goNext = useCallback(() => {
    if (photos.length === 0) return
    setSelectedIndex((i) => (i + 1) % photos.length)
    resetView()
  }, [photos.length, resetView])

  const goPrev = useCallback(() => {
    if (photos.length === 0) return
    setSelectedIndex((i) => (i - 1 + photos.length) % photos.length)
    resetView()
  }, [photos.length, resetView])

  const zoomIn = useCallback(() => setZoom((z) => clampZoom(z * 1.3)), [clampZoom])
  const zoomOut = useCallback(() => setZoom((z) => clampZoom(z / 1.3)), [clampZoom])

  // Load photos
  useEffect(() => {
    if (!album || albumLoading) return
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
    return () => { active = false }
  }, [album])

  // Keyboard controls
  useEffect(() => {
    if (!expanded) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false)
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); goNext() }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goPrev() }
      if (e.key === "+" || e.key === "=") zoomIn()
      if (e.key === "-") zoomOut()
      if (e.key === "0") resetView()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [expanded, goNext, goPrev, zoomIn, zoomOut, resetView])

  // Reset view when changing photo
  useEffect(() => {
    resetView()
  }, [selectedIndex, resetView])

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.1 : 0.9
      setZoom((z) => clampZoom(z * factor))
    },
    [clampZoom],
  )

  // Pan handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (zoom <= 1) return
      setIsPanning(true)
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [zoom, pan],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return
      const dx = e.clientX - panStart.current.x
      const dy = e.clientY - panStart.current.y
      setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy })
    },
    [isPanning],
  )

  const handlePointerUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Prevent download
  const preventContext = useCallback((e: React.MouseEvent) => e.preventDefault(), [])

  // Loading / not-found states
  if (albumId === undefined || albumLoading) {
    return (
      <div className="min-h-screen bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 text-center shadow-xl dark:border-slate-800 dark:bg-slate-950/80">
            <p className="text-lg text-slate-800 dark:text-slate-200">{albumLoading ? "Loading albums…" : "Resolving album…"}</p>
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
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Looking for <span className="font-semibold text-slate-900 dark:text-white">{albumId ?? "unknown"}</span>
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
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
            {/* Album overview */}
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 dark:border-slate-800 dark:bg-slate-950/80">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Album overview</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">{album.description}</p>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Browse the thumbnails and select one to preview it instantly in the larger image pane.
              </p>
            </div>

            {/* Two-panel layout */}
            <div className="grid gap-6 lg:grid-cols-[1.6fr_0.95fr] items-start">
              {/* Main preview */}
              <div className="relative rounded-[2rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/80">
                {selectedPhoto ? (
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    onContextMenu={preventContext}
                    className="group relative block overflow-hidden rounded-[1.5rem] bg-slate-900 w-full"
                    aria-label="Open expanded image preview"
                  >
                    <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
                      <Image
                        src={selectedPhoto.url}
                        alt={getPhotoCaption(selectedPhoto, selectedIndex, album.title)}
                        fill
                        draggable={false}
                        className="protected-media object-contain transition duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 1024px) 100vw, 60vw"
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-4 text-white">
                      <p className="text-sm font-semibold">
                        {getPhotoCaption(selectedPhoto, selectedIndex, album.title)}
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="flex h-[44rem] items-center justify-center text-slate-500">No photo available</div>
                )}
              </div>

              {/* Thumbnail grid */}
              <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/80 min-h-[44rem]">
                <div className="max-h-[40rem] min-h-[40rem] overflow-y-auto pr-1 custom-scrollbar">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {photos.map((photo, index) => (
                      <button
                        key={photo.key}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        onContextMenu={preventContext}
                        className={cn(
                          "overflow-hidden rounded-3xl border p-0 transition",
                          index === selectedIndex
                            ? "border-blue-500 shadow-lg shadow-blue-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-400",
                        )}
                      >
                        <div className="relative h-28 w-full">
                          <Image
                            src={photo.url}
                            alt={getPhotoCaption(photo, index, album.title)}
                            fill
                            draggable={false}
                            className="protected-media object-cover"
                            sizes="200px"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Expanded lightbox viewer */}
      <AnimatePresence>
        {expanded && selectedPhoto && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onContextMenu={preventContext}
          >
            {/* Top bar */}
            <div className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpanded(false)}
                  className="h-9 w-9 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white/90">{album.title}</p>
                  <p className="text-xs text-white/50">
                    {selectedIndex + 1} of {photos.length}
                  </p>
                </div>
              </div>

              {/* Center: navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goPrev}
                  disabled={photos.length <= 1}
                  className="h-9 w-9 rounded-full text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="min-w-[4rem] text-center text-xs text-white/50 tabular-nums">
                  {selectedIndex + 1} / {photos.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goNext}
                  disabled={photos.length <= 1}
                  className="h-9 w-9 rounded-full text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Right: zoom controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={zoomOut}
                  className="h-9 w-9 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="min-w-[3rem] text-center text-xs text-white/50 tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={zoomIn}
                  className="h-9 w-9 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="mx-1 h-4 w-px bg-white/15" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetView}
                  className="h-9 w-9 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Reset zoom"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Image area */}
            <div
              ref={imageContainerRef}
              className="relative flex-1 overflow-hidden"
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
            >
              {/* Side arrows (visible on larger screens when zoomed out) */}
              {zoom <= 1 && photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/70 backdrop-blur-sm transition hover:bg-black/60 hover:text-white hidden sm:flex"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/70 backdrop-blur-sm transition hover:bg-black/60 hover:text-white hidden sm:flex"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <div className="flex h-full w-full items-center justify-center">
                <div
                  className="relative transition-transform duration-150 ease-out"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                >
                  <Image
                    src={selectedPhoto.url}
                    alt={getPhotoCaption(selectedPhoto, selectedIndex, album.title)}
                    width={1200}
                    height={900}
                    draggable={false}
                    className="protected-media max-h-[80vh] max-w-[90vw] object-contain"
                    style={{ pointerEvents: "none" }}
                    priority
                    unoptimized
                  />
                </div>
              </div>

              {/* Caption overlay */}
              <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none">
                <div className="bg-gradient-to-t from-black/60 to-transparent px-6 pt-8 pb-4">
                  <p className="text-center text-sm text-white/80">
                    {getPhotoCaption(selectedPhoto, selectedIndex, album.title)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom bar: zoom slider */}
            <div className="relative z-10 flex items-center justify-center gap-3 px-6 py-2.5">
              <ZoomOut className="h-3.5 w-3.5 text-white/40" />
              <input
                type="range"
                min={25}
                max={500}
                value={Math.round(zoom * 100)}
                onChange={(e) => setZoom(clampZoom(Number(e.target.value) / 100))}
                className="w-40 sm:w-56 accent-blue-500 h-1 cursor-pointer"
              />
              <ZoomIn className="h-3.5 w-3.5 text-white/40" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
