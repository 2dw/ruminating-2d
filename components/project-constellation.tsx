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

interface MeanderingPathResult {
  pathD: string
  sparkles: Array<{ x: number; y: number; r: number; color: string; delay: number; dur: number }>
}

function buildMeanderingFlowPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  fieldWidth: number,
  fieldHeight: number,
): MeanderingPathResult {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len

  // Random contour style for each unique expansion:
  // 0: S-curve wave, 1: Grand sweeping arch, 2: Swooping undulating river
  const style = Math.floor(Math.random() * 3)
  const sign = Math.random() < 0.5 ? 1 : -1

  let d1: number, d2: number, d3: number
  if (style === 0) {
    d1 = sign * (len * (0.16 + Math.random() * 0.12))
    d2 = -sign * (len * (0.16 + Math.random() * 0.12))
    d3 = sign * (len * (0.12 + Math.random() * 0.10))
  } else if (style === 1) {
    d1 = sign * (len * (0.20 + Math.random() * 0.10))
    d2 = sign * (len * (0.25 + Math.random() * 0.12))
    d3 = sign * (len * (0.18 + Math.random() * 0.10))
  } else {
    d1 = sign * (len * (0.22 + Math.random() * 0.10))
    d2 = (Math.random() - 0.5) * (len * 0.12)
    d3 = -sign * (len * (0.18 + Math.random() * 0.10))
  }

  const t1 = 0.25 + (Math.random() - 0.5) * 0.06
  const t2 = 0.50 + (Math.random() - 0.5) * 0.06
  const t3 = 0.75 + (Math.random() - 0.5) * 0.06

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))

  const w1 = {
    x: clamp(from.x + dx * t1 + nx * d1, 80, fieldWidth - 80),
    y: clamp(from.y + dy * t1 + ny * d1, 90, fieldHeight - 90),
  }
  const w2 = {
    x: clamp(from.x + dx * t2 + nx * d2, 80, fieldWidth - 80),
    y: clamp(from.y + dy * t2 + ny * d2, 90, fieldHeight - 90),
  }
  const w3 = {
    x: clamp(from.x + dx * t3 + nx * d3, 80, fieldWidth - 80),
    y: clamp(from.y + dy * t3 + ny * d3, 90, fieldHeight - 90),
  }

  const controlPoints = [from, w1, w2, w3, to]
  const samples: { x: number; y: number }[] = []
  const numSegments = controlPoints.length - 1
  const samplesPerSegment = 9

  for (let seg = 0; seg < numSegments; seg++) {
    const p0 = controlPoints[Math.max(0, seg - 1)]
    const p1 = controlPoints[seg]
    const p2 = controlPoints[seg + 1]
    const p3 = controlPoints[Math.min(controlPoints.length - 1, seg + 2)]
    for (let step = 0; step <= samplesPerSegment; step++) {
      if (seg > 0 && step === 0) continue
      const t = step / samplesPerSegment
      const t2 = t * t
      const t3 = t2 * t
      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3)
      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
      samples.push({ x, y })
    }
  }

  let pathD = `M ${samples[0].x.toFixed(1)} ${samples[0].y.toFixed(1)}`
  for (let i = 0; i < samples.length - 1; i++) {
    const p0 = samples[Math.max(0, i - 1)]
    const p1 = samples[i]
    const p2 = samples[i + 1]
    const p3 = samples[Math.min(samples.length - 1, i + 2)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }

  // Delicate translucent stardust sparkles along the trail
  const sparkles = Array.from({ length: 20 }, (_, k) => {
    const idx = Math.floor(2 + (k / 19) * (samples.length - 5))
    const pt = samples[idx]
    const prev = samples[Math.max(0, idx - 1)]
    const next = samples[Math.min(samples.length - 1, idx + 1)]
    const tx = next.x - prev.x, ty = next.y - prev.y
    const tlen = Math.hypot(tx, ty) || 1
    const snx = -ty / tlen, sny = tx / tlen
    const envelope = Math.sin((k / 19) * Math.PI)
    const jitter = (Math.sin(k * 4.7) * 0.7 + Math.cos(k * 2.3) * 0.3) * 10 * envelope
    const x = pt.x + snx * jitter
    const y = pt.y + sny * jitter
    const r = 0.5 + (k % 3 === 0 ? 0.7 : k % 2 === 0 ? 0.4 : 0.2)
    const isGold = k % 5 === 0
    const isCyan = k % 3 === 1
    const color = isGold ? "rgba(253, 230, 138, 0.25)" : isCyan ? "rgba(165, 243, 252, 0.25)" : "rgba(224, 242, 254, 0.25)"
    return { x, y, r, color, delay: (k * 0.25) % 2.5, dur: 2.0 + (k % 4) * 0.5 }
  })

  return { pathD, sparkles }
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
  const [expansionSeed, setExpansionSeed] = useState(() => Math.random())
  const containerRef = useRef<HTMLDivElement>(null)

  // Active cluster is owned by the page when it drives it (milestone jumps),
  // otherwise the sky keeps its own state so standalone callers behave as before.
  const isControlled = focusedCluster !== undefined
  const activeCluster = isControlled ? focusedCluster : internalActive
  const setActive = useCallback(
    (clusterId: string | null) => {
      setExpansionSeed(Math.random())
      if (isControlled) onFocusedClusterChange?.(clusterId)
      else setInternalActive(clusterId)
    },
    [isControlled, onFocusedClusterChange],
  )

  const stars = useMemo(() => generateStars(60), [])

  const isClustered = (clusters?.length ?? 0) > 0
  const fieldWidth = isClustered ? CLUSTER_FIELD_WIDTH : SOLO_FIELD_WIDTH

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
        let expandedLocal: { x: number; y: number }[]
        if (indices.length === 2) {
          // Unique random placement with generous distance and organic height variation
          const x0 = 120 + Math.random() * 180
          const x1 = 500 + Math.random() * 180
          let y0 = 140 + Math.random() * 340
          let y1 = 140 + Math.random() * 340
          if (Math.abs(y1 - y0) < 50) {
            y1 = y1 > 310 ? y1 - 80 : y1 + 80
          }
          expandedLocal = [{ x: x0, y: y0 }, { x: x1, y: y1 }]
        } else {
          expandedLocal = distributePositions(indices.length, SOLO_LAYOUT_WIDTH, FIELD_HEIGHT, expandedSize / 2)
        }

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

      const flowPaths = new Map<number, MeanderingPathResult>()
      lines.forEach(([i, j], idx) => {
        const from = positions[i]
        const to = positions[j]
        if (!from || !to) return
        const isFlow = /making of/i.test(photos[i]?.name ?? '') && !/making of/i.test(photos[j]?.name ?? '')
        if (isFlow) {
          flowPaths.set(idx, buildMeanderingFlowPath(from, to, fieldWidth, FIELD_HEIGHT))
        }
      })

      return { positions, starSizes, lines, flowPaths }
    }

    const starSize = calculateStarSize(photos.length, SOLO_FIELD_WIDTH * FIELD_HEIGHT)
    const positions =
      photos.length > 0
        ? distributePositions(photos.length, SOLO_LAYOUT_WIDTH, FIELD_HEIGHT, starSize / 2)
        : []
    const lines = buildConstellationLines(positions)
    const flowPaths = new Map<number, MeanderingPathResult>()
    lines.forEach(([i, j], idx) => {
      const from = positions[i]
      const to = positions[j]
      if (!from || !to) return
      const isFlow = /making of/i.test(photos[i]?.name ?? '') && !/making of/i.test(photos[j]?.name ?? '')
      if (isFlow) {
        flowPaths.set(idx, buildMeanderingFlowPath(from, to, fieldWidth, FIELD_HEIGHT))
      }
    })

    return {
      positions,
      starSizes: photos.map(() => starSize),
      lines,
      flowPaths,
    }
  }, [photos, clusters, activeCluster, fieldWidth, expansionSeed])

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

        <div
          className="relative z-10 mx-auto"
          style={{
            height: FIELD_HEIGHT,
            width: "100%",
            maxWidth: fieldWidth,
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${fieldWidth} ${FIELD_HEIGHT}`}
            preserveAspectRatio="none"
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
                  <linearGradient
                    key={`grad-${idx}`}
                    id={`trail-grad-${idx}`}
                    gradientUnits="userSpaceOnUse"
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                  >
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.0" />
                    <stop offset="25%" stopColor="#60a5fa" stopOpacity="0.08" />
                    <stop offset="65%" stopColor="#93c5fd" stopOpacity="0.16" />
                    <stop offset="85%" stopColor="#bae6fd" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.04" />
                  </linearGradient>
                )
              })}
            </defs>

            {layout.lines.map(([i, j], idx) => {
              const from = layout.positions[i]
              const to = layout.positions[j]
              if (!from || !to) return null
              const flow = layout.flowPaths.get(idx)
              if (flow) {
                const { pathD, sparkles } = flow
                const pathId = `flow-path-${idx}`
                return (
                  <motion.g
                    key={`flow-${activeCluster ?? 'none'}-${idx}-${expansionSeed}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2.8, ease: "easeOut" }}
                  >
                    <path id={pathId} d={pathD} fill="none" stroke="none" />

                    {/* Subtle diffuse starlight glow */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="rgba(96, 165, 250, 0.03)"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />

                    {/* Ethereal translucent shooting-star trail */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={`url(#trail-grad-${idx})`}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />

                    {/* Delicate dashed starlight thread */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="rgba(147, 197, 253, 0.12)"
                      strokeWidth="0.75"
                      strokeDasharray="2 5"
                      strokeLinecap="round"
                    />

                    {/* Translucent stardust sparkles */}
                    {sparkles.map((sp, k) => (
                      <g key={k}>
                        <circle cx={sp.x} cy={sp.y} r={sp.r} fill={sp.color}>
                          <animate
                            attributeName="opacity"
                            values="0.03;0.22;0.03"
                            dur={`${sp.dur}s`}
                            begin={`${sp.delay}s`}
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="r"
                            values={`${sp.r * 0.7};${sp.r * 1.2};${sp.r * 0.7}`}
                            dur={`${sp.dur}s`}
                            begin={`${sp.delay}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                        {k % 4 === 0 && (
                          <path
                            d={`M ${sp.x - sp.r * 2} ${sp.y} L ${sp.x + sp.r * 2} ${sp.y} M ${sp.x} ${sp.y - sp.r * 2} L ${sp.x} ${sp.y + sp.r * 2}`}
                            stroke={sp.color}
                            strokeWidth="0.5"
                            opacity="0.25"
                          >
                            <animate
                              attributeName="opacity"
                              values="0.02;0.18;0.02"
                              dur={`${sp.dur}s`}
                              begin={`${sp.delay}s`}
                              repeatCount="indefinite"
                            />
                          </path>
                        )}
                      </g>
                    ))}

                    {/* Whimsical rocket ship */}
                    <g opacity="0.85">
                      <ellipse cx="-6" cy="0" rx="3.5" ry="1.2" fill="#f59e0b" opacity="0.85">
                        <animate attributeName="rx" values="2.5;4.5;2.5" dur="0.25s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.7;1;0.7" dur="0.25s" repeatCount="indefinite" />
                      </ellipse>
                      <ellipse cx="-4.5" cy="0" rx="1.8" ry="0.6" fill="#fef08a" opacity="0.95" />

                      <path
                        d="M -4 -2.8 L 7.5 0 L -4 2.8 L -2 0 Z"
                        fill="#e0f2fe"
                        stroke="#60a5fa"
                        strokeWidth="0.7"
                      />

                      <path d="M -3 -2.8 L -6 -5 L -1.5 -2.8 Z" fill="#60a5fa" />
                      <path d="M -3 2.8 L -6 5 L -1.5 2.8 Z" fill="#60a5fa" />

                      <circle cx="1" cy="0" r="1.1" fill="#0f172a" stroke="#93c5fd" strokeWidth="0.5" />

                      <animateMotion
                        dur="5.5s"
                        repeatCount="indefinite"
                        rotate="auto"
                        keyPoints="0;1"
                        keyTimes="0;1"
                        calcMode="spline"
                        keySplines="0.4 0 0.6 1"
                      >
                        <mpath href={`#${pathId}`} />
                      </animateMotion>
                    </g>
                  </motion.g>
                )
              }
              return (
                <motion.line
                  key={idx}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className="text-blue-500/12"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeDasharray="2 5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2.4, ease: "easeOut" }}
                />
              )
            })}</svg>
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
                 initial={{ left: `${(pos.x / fieldWidth) * 100}%`, top: `${(pos.y / FIELD_HEIGHT) * 100}%` }}
                 animate={{ left: `${(pos.x / fieldWidth) * 100}%`, top: `${(pos.y / FIELD_HEIGHT) * 100}%` }}
                 transition={{ type: "spring", stiffness: 120, damping: 18 }}
                 className="absolute transition-opacity duration-300"
                 style={{
                   left: `${(pos.x / fieldWidth) * 100}%`,
                   top: `${(pos.y / FIELD_HEIGHT) * 100}%`,
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
              left: hoveredPos ? `${(hoveredPos.x / fieldWidth) * 100}%` : undefined,
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
