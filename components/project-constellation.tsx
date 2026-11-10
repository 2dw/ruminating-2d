"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, RefreshCw, FileText, Film, Presentation, File, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Photo {
  key: string
  name: string
  url: string
  mediaType?: string
  lastModified?: string
  /** Set when the photo was loaded as part of a star cluster. */
  clusterId?: string
}

/** A labelled group of photos rendered as its own region of the night sky. */
export interface ConstellationCluster {
  id: string
  /** Place name shown on the cluster label, e.g. "San Bruno". */
  label: string
  /** When the photos were taken, e.g. "May 26, 2007". */
  date: string
  /** Short setting note, e.g. "Flat tar-and-gravel roof". */
  detail?: string
  /** Full R2 prefix for this cluster's folder. */
  prefix: string
  mediaFilter?: string[]
}

interface ProjectConstellationProps {
  prefix: string
  /** When provided, photos are grouped into labelled clusters instead of one loose field. */
  clusters?: ConstellationCluster[]
  captions?: Record<string, string>
  className?: string
  mediaPrefix?: string
  mediaFilter?: string[]
  noMediaMessage?: string
  /**
   * Externally controlled focus, e.g. a journey milestone jumping to its
   * rooftop. When passed, the sky no longer keeps its own focus state.
   */
  focusedCluster?: string | null
  /** Reports focus changes back to the owner while focus is controlled. */
  onFocusedClusterChange?: (clusterId: string | null) => void
}

const FIELD_HEIGHT = 620
const SOLO_FIELD_WIDTH = 900
const SOLO_LAYOUT_WIDTH = 800
const CLUSTER_FIELD_WIDTH = 1000
const EXCLUDED_EXTENSIONS = [".docx", ".doc", ".txt", ".md", ".rtf", ".pptx", ".ppt"]

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

function buildFlowPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const steps = 14
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const baseX = from.x + dx * t
    const baseY = from.y + dy * t
    const wave = Math.sin(t * Math.PI * 3) * (len * 0.16) + Math.cos(t * Math.PI * 5) * (len * 0.06)
    pts.push({ x: baseX + nx * wave, y: baseY + ny * wave })
  }
  // Catmull-Rom-ish smooth path through the points.
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
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

export function ProjectConstellation({
  prefix,
  clusters,
  captions = {},
  className,
  mediaPrefix,
  mediaFilter,
  noMediaMessage,
  focusedCluster,
  onFocusedClusterChange,
}: ProjectConstellationProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [internalActive, setInternalActive] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Active cluster is owned by the page when it drives it (milestone jumps),
  // otherwise the sky keeps its own state so standalone callers behave as before.
  const isControlled = focusedCluster !== undefined
  const activeCluster = isControlled ? focusedCluster : internalActive
  const setActive = useCallback(
    (clusterId: string | null) => {
      if (isControlled) onFocusedClusterChange?.(clusterId)
      else setInternalActive(clusterId)
    },
    [isControlled, onFocusedClusterChange],
  )

  const stars = useMemo(() => generateStars(60), [])

  const isClustered = (clusters?.length ?? 0) > 0

  const loadFromPrefix = useCallback(
    async (requestPrefix: string, filters?: string[]): Promise<Photo[]> => {
      const response = await fetch(`/api/photos?prefix=${encodeURIComponent(requestPrefix)}`, {
        cache: "no-store",
      })
      if (!response.ok) throw new Error(`Failed to load (${response.status})`)
      const data = await response.json()
      if (!data.success) throw new Error(data.message || "Failed to load photos")

      let loaded: Photo[] = (Array.isArray(data.photos) ? data.photos : []).sort(
        (a: Photo, b: Photo) => (a.name || "").localeCompare(b.name || ""),
      )

      if (filters && filters.length > 0) {
        const lowerFilters = filters.map((f) => f.toLowerCase())
        loaded = loaded.filter((photo) => {
          const name = photo.name.toLowerCase()
          return lowerFilters.some((f) => name.includes(f))
        })
      }

      loaded = loaded.filter((photo) => {
        const lower = photo.name.toLowerCase()
        return !EXCLUDED_EXTENSIONS.some((ext) => lower.endsWith(ext))
      })

      return orderByFilename(loaded)
    },
    [],
  )

  const loadPhotos = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const clusterList = clusters && clusters.length > 0 ? clusters : null

      if (clusterList) {
        const results = await Promise.all(
          clusterList.map(async (cluster) => ({
            cluster,
            photos: await loadFromPrefix(cluster.prefix, cluster.mediaFilter),
          })),
        )
        const grouped: Photo[] = []
        for (const { cluster, photos: clusterPhotos } of results) {
          for (const photo of clusterPhotos) grouped.push({ ...photo, clusterId: cluster.id })
        }
        setPhotos(grouped)
      } else {
        setPhotos(await loadFromPrefix(mediaPrefix || prefix, mediaFilter))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load project media")
    } finally {
      setIsLoading(false)
    }
  }, [prefix, mediaPrefix, mediaFilter, clusters, loadFromPrefix])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  const layout = useMemo(() => {
    if (clusters && clusters.length > 0 && photos.length > 0) {
      const groupIndices = new Map<string, number[]>()
      photos.forEach((photo, index) => {
        const key = photo.clusterId ?? ""
        const bucket = groupIndices.get(key)
        if (bucket) bucket.push(index)
        else groupIndices.set(key, [index])
      })

      const positions: { x: number; y: number }[] = []
      const starSizes: number[] = []
      const lines: [number, number][] = []

      // Three compact, faded clusters distributed across the sky panel. The
      // active one expands into a full constellation; the others stay faint.
      const zoneWidth = CLUSTER_FIELD_WIDTH / clusters.length
      const compactW = 160
      const compactH = 160

      clusters.forEach((cluster, zone) => {
        const indices = (groupIndices.get(cluster.id) ?? []).slice().sort((a, b) => {
          const aMaking = /making of/i.test(photos[a]?.name ?? '') ? 0 : 1
          const bMaking = /making of/i.test(photos[b]?.name ?? '') ? 0 : 1
          return aMaking - bMaking
        })
        const isActive = activeCluster === cluster.id
        const expandedSize = calculateStarSize(indices.length, SOLO_LAYOUT_WIDTH * FIELD_HEIGHT)
        const compactSize = 48

        const compactOffsetX = zone * zoneWidth + (zoneWidth - compactW) / 2
        const compactOffsetY = (FIELD_HEIGHT - compactH) / 2

        const compactLocal = distributePositions(indices.length, compactW, compactH, compactSize / 2)
        const expandedLocal =
          indices.length === 2
            ? [{ x: SOLO_LAYOUT_WIDTH * 0.28, y: FIELD_HEIGHT / 2 }, { x: SOLO_LAYOUT_WIDTH * 0.72, y: FIELD_HEIGHT / 2 }]
            : distributePositions(indices.length, SOLO_LAYOUT_WIDTH, FIELD_HEIGHT, expandedSize / 2)

        indices.forEach((photoIndex, i) => {
          if (isActive) {
            positions[photoIndex] = { x: 100 + expandedLocal[i].x, y: expandedLocal[i].y }
            starSizes[photoIndex] = expandedSize
          } else {
            positions[photoIndex] = {
              x: compactOffsetX + compactLocal[i].x,
              y: compactOffsetY + compactLocal[i].y,
            }
            starSizes[photoIndex] = compactSize
          }
        })

        if (isActive) {
          for (const [a, b] of buildConstellationLines(expandedLocal)) {
            const from = indices[a]
            const to = indices[b]
            if (from !== undefined && to !== undefined) lines.push([from, to])
          }
        }
      })

      return { positions, starSizes, lines }
    }

    const starSize = calculateStarSize(photos.length, SOLO_FIELD_WIDTH * FIELD_HEIGHT)
    const positions =
      photos.length > 0
        ? distributePositions(photos.length, SOLO_LAYOUT_WIDTH, FIELD_HEIGHT, starSize / 2)
        : []
    return {
      positions,
      starSizes: photos.map(() => starSize),
      lines: buildConstellationLines(positions),
    }
  }, [photos, clusters, activeCluster])

  const activePhoto = activeIndex !== null ? photos[activeIndex] : null
  const activePhotoCluster = activePhoto?.clusterId
    ? clusters?.find((cluster) => cluster.id === activePhoto.clusterId)
    : undefined
  const hasMultiple = photos.length > 1

  const titleFor = (photo: Photo) => {
    const label = photo.clusterId
      ? clusters?.find((cluster) => cluster.id === photo.clusterId)?.label
      : undefined
    const title = getPhotoTitle(photo.name)
    return label ? `${label} · ${title}` : title
  }

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0))
  }, [photos.length])

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : 0))
  }, [photos.length])

  // Hover captions sit above their star, but the top row has no room for one
  // inside the clipped sky, so those flip below the star instead.
  const hoveredPos = hoveredIndex !== null ? layout.positions[hoveredIndex] : undefined
  const hoveredSize = hoveredIndex !== null ? (layout.starSizes[hoveredIndex] ?? 64) : 64
  const tooltipAbove = hoveredPos !== undefined && hoveredPos.y - hoveredSize / 2 - 12 >= 36

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
          viewBox="0 0 1000 620"
          preserveAspectRatio="xMidYMid meet"
          style={{ filter: "drop-shadow(0 0 3px rgba(96, 165, 250, 0.12))" }}
        >
          <defs>
            {layout.lines.map(([i, j], idx) => {
              const from = layout.positions[i]
              const to = layout.positions[j]
              if (!from || !to) return null
              const isFlow = /making of/i.test(photos[i]?.name ?? '') && !/making of/i.test(photos[j]?.name ?? '')
              if (!isFlow) return null
              return (
                <linearGradient key={`grad-${idx}`} id={`trail-grad-${idx}`} gradientUnits="userSpaceOnUse"
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}>
                  <stop offset="0%" stopColor="rgba(96,165,250,0)" />
                  <stop offset="30%" stopColor="rgba(96,165,250,0.18)" />
                  <stop offset="70%" stopColor="rgba(147,210,255,0.55)" />
                  <stop offset="88%" stopColor="rgba(224,242,254,0.85)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              )
            })}
            <symbol id="rocket-symbol" viewBox="-10 -7 20 14" overflow="visible">
              <path d="M -6 -3.5 L 7.5 0 L -6 3.5 L -2.5 0 Z"
                fill="rgba(224,242,254,0.95)" stroke="rgba(96,165,250,0.9)" strokeWidth="0.6" />
              <circle cx="-1" cy="0" r="1.5" fill="rgba(15,23,42,0.85)" stroke="rgba(147,210,255,0.6)" strokeWidth="0.5" />
              <path d="M -6 -3.5 L -9 -7 L -4 -3.5 Z" fill="rgba(96,165,250,0.8)" />
              <path d="M -6 3.5 L -9 7 L -4 3.5 Z" fill="rgba(96,165,250,0.8)" />
              <ellipse cx="-7.5" cy="0" rx="3" ry="1.4" fill="rgba(251,191,36,0.55)" />
              <ellipse cx="-6.5" cy="0" rx="1.8" ry="0.8" fill="rgba(252,211,77,0.75)" />
            </symbol>
          </defs>

          {layout.lines.map(([i, j], idx) => {
            const from = layout.positions[i]
            const to = layout.positions[j]
            if (!from || !to) return null
            const isFlow = /making of/i.test(photos[i]?.name ?? '') && !/making of/i.test(photos[j]?.name ?? '')
            if (isFlow) {
              const pathD = buildFlowPath(from, to)
              const sparkles = Array.from({ length: 18 }, (_, k) => {
                const t = (k + 0.5) / 18
                const dx = to.x - from.x, dy = to.y - from.y
                const len = Math.hypot(dx, dy) || 1
                const nx = -dy / len, ny = dx / len
                const wave = Math.sin(t * Math.PI * 3) * (len * 0.16) + Math.cos(t * Math.PI * 5) * (len * 0.06)
                const jitter = (Math.sin(k * 7.3 + 1.2) * 0.5 + Math.cos(k * 3.7) * 0.5) * 14
                return {
                  x: from.x + dx * t + nx * (wave + jitter),
                  y: from.y + dy * t + ny * (wave + jitter),
                  r: 0.6 + Math.abs(Math.sin(k * 2.1)) * 1.4,
                  opacity: 0.25 + Math.abs(Math.cos(k * 1.9)) * 0.65,
                  delay: t * 1.4 + idx * 0.02,
                }
              })
              const pathId = `flow-path-${idx}`
              return (
                <g key={`flow-${idx}`}>
                  <path id={pathId} d={pathD} fill="none" stroke="none" />
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke={`url(#trail-grad-${idx})`}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.4, delay: idx * 0.02, ease: "easeOut" }}
                  />
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke="rgba(96,165,250,0.12)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.4, delay: idx * 0.02, ease: "easeOut" }}
                  />
                  {sparkles.map((sp, k) => (
                    <motion.circle
                      key={k}
                      cx={sp.x}
                      cy={sp.y}
                      r={sp.r}
                      fill="white"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, sp.opacity, sp.opacity * 0.5, sp.opacity, 0], scale: [0, 1, 0.7, 1, 0] }}
                      transition={{
                        duration: 2.8 + Math.abs(Math.sin(k)) * 1.2,
                        delay: sp.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 1.2 }}
                  >
                    <use href="#rocket-symbol">
                      <animateMotion
                        dur="6s"
                        repeatCount="indefinite"
                        rotate="auto"
                        keyPoints="0;1"
                        keyTimes="0;1"
                        calcMode="spline"
                        keySplines="0.4 0 0.6 1"
                      >
                        <mpath href={`#${pathId}`} />
                      </animateMotion>
                    </use>
                    <circle r="4" fill="rgba(251,191,36,0.3)">
                      <animate attributeName="r" values="3;6;3" dur="0.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0.15;0.4" dur="0.8s" repeatCount="indefinite" />
                      <animateMotion
                        dur="6s"
                        repeatCount="indefinite"
                        rotate="auto"
                        keyPoints="0;1"
                        keyTimes="0;1"
                        calcMode="spline"
                        keySplines="0.4 0 0.6 1"
                      >
                        <mpath href={`#${pathId}`} />
                      </animateMotion>
                    </circle>
                  </motion.g>
                </g>
              )
            }
            return (
              <motion.line
                key={idx}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className="text-blue-500/20"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: idx * 0.02, ease: "easeOut" }}
              />
            )
          })}
        </svg>

        <div
          className="relative z-10 mx-auto"
          style={{
            height: FIELD_HEIGHT,
            width: "100%",
            maxWidth: isClustered ? CLUSTER_FIELD_WIDTH : SOLO_FIELD_WIDTH,
          }}
        >
          {photos.map((photo, index) => {
            const pos = layout.positions[index]
            if (!pos) return null
            const size = layout.starSizes[index] ?? 64
            const isActive = activeIndex === index
            const isHovered = hoveredIndex === index
            const highlighted = isActive || isHovered
            const clusterActive = activeCluster === photo.clusterId

            return (
              <motion.button
                key={photo.key}
                type="button"
                onClick={() => {
                  if (!isClustered || clusterActive) setActiveIndex(index)
                  else setActive(photo.clusterId ?? null)
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                 initial={{ left: (pos.x / CLUSTER_FIELD_WIDTH * 100) + "%", top: (pos.y / FIELD_HEIGHT * 100) + "%" }}
                 animate={{ left: (pos.x / CLUSTER_FIELD_WIDTH * 100) + "%", top: (pos.y / FIELD_HEIGHT * 100) + "%" }}
                 transition={{ type: "spring", stiffness: 120, damping: 18 }}
                 className="absolute transition-opacity duration-300"
                 style={{
                   left: (pos.x / CLUSTER_FIELD_WIDTH * 100) + "%",
                   top: (pos.y / FIELD_HEIGHT * 100) + "%",
                   width: size,
                   height: size,
                   zIndex: highlighted ? 20 : 10,
                   opacity: clusterActive || isHovered ? 1 : 0.08,
                   filter: clusterActive || isHovered ? "none" : "grayscale(1) brightness(0.6)",
                   transform: "translate(-50%, -50%)",
                 }}
                 aria-label={titleFor(photo)}
              >
                <motion.div
                  className="relative h-full w-full"
                  animate={{ scale: isActive ? 1.2 : 1 }}
                  whileHover={{ scale: 1.15 }}
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
                        sizes={`${size}px`}
                        unoptimized={photo.mediaType === "animation"}
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
              </motion.button>
            )
          })}


        </div>

        {isClustered && clusters && (
          <div
            className="relative z-10 mx-auto px-4 pb-5"
            style={{ width: "100%", maxWidth: CLUSTER_FIELD_WIDTH }}
          >
            <div
              className="grid gap-2 sm:gap-3"
              style={{ gridTemplateColumns: `repeat(${clusters.length}, minmax(0, 1fr))` }}
            >
              {clusters.map((cluster) => {
                const count = photos.filter((photo) => photo.clusterId === cluster.id).length
                const isActive = activeCluster === cluster.id
                const isDimmed = activeCluster !== null && !isActive

                return (
                  <button
                    key={cluster.id}
                    type="button"
                    onClick={() => setActive(isActive ? null : cluster.id)}
                    aria-pressed={isActive}
                    className={cn(
                      "rounded-2xl border px-3 py-2.5 text-center transition-all duration-300",
                      isActive
                        ? "border-blue-400/60 bg-blue-500/15 shadow-[0_0_18px_rgba(96,165,250,0.25)]"
                        : "border-blue-400/10 bg-white/[0.03] hover:border-blue-400/40 hover:bg-blue-500/10",
                      isDimmed && "opacity-40",
                    )}
                  >
                    <span className="flex items-center justify-center gap-1.5 text-sm font-medium text-white/90">
                      <MapPin className="h-3.5 w-3.5 text-blue-300/70" />
                      {cluster.label}
                    </span>
                    <span className="mt-1 block text-xs text-blue-200/70">{cluster.date}</span>
                    {cluster.detail && (
                      <span className="mt-0.5 block text-[11px] text-slate-400">{cluster.detail}</span>
                    )}
                    <span className="mt-1 block text-[11px] tracking-wide text-blue-300/50">
                      {count} {count === 1 ? "photo" : "photos"}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-center text-xs tracking-wide text-blue-300/40">
              {photos.length} stars &middot; {clusters.length} rooftops &middot; ordered by date &middot;
              click any star to explore
            </p>
          </div>
        )}

        {!isClustered && hasMultiple && (
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
              left: hoveredPos ? (hoveredPos.x / CLUSTER_FIELD_WIDTH * 100) + "%" : undefined,
              top: hoveredPos
                ? (tooltipAbove
                    ? (hoveredPos.y / FIELD_HEIGHT * 100) - (hoveredSize / 2 + 12) / FIELD_HEIGHT * 100
                    : (hoveredPos.y / FIELD_HEIGHT * 100) + (hoveredSize / 2 + 12) / FIELD_HEIGHT * 100) + "%"
                : undefined,
            }}
          >
            <div
              className={cn(
                "whitespace-nowrap rounded-lg border border-slate-700/50 bg-slate-800/90 px-3 py-1.5 text-xs text-white/80 shadow-lg backdrop-blur-sm",
                // Anchored here rather than on the motion wrapper, whose
                // transform Framer Motion owns while it animates.
                tooltipAbove ? "-translate-x-1/2 -translate-y-full" : "-translate-x-1/2",
              )}
            >
              {captions[photos[hoveredIndex].key] || titleFor(photos[hoveredIndex])}
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
                  {activePhotoCluster && (
                    <span className="text-blue-300/70">{activePhotoCluster.label} &middot; </span>
                  )}
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
