"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Lightbulb, Zap, FileText, X, ChevronLeft, ChevronRight,
  File, Film, Presentation, Eye,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionGate } from "@/components/section-gate"
import { MotherTreeCanvas } from "@/components/mother-tree-canvas"

interface R2Photo {
  key: string; name: string; url: string
  mediaType?: string; lastModified?: string; size?: number
}

interface TierItem { title: string; body: string }

interface ContentTier {
  id: string; title: string; icon: typeof Lightbulb; description: string
  r2Prefix?: string; mediaFilter?: string[]; items: TierItem[]
}

const TIERS: ContentTier[] = [
  {
    id: "thought-pieces",
    title: "Thought Pieces",
    icon: Lightbulb,
    description: "Core principles and the philosophy guiding my work in sustainable, equitable energy systems.",
    items: [
      {
        title: "Healing Our Planet",
        body: "Every energy system we design should contribute to planetary healing. This means considering not just efficiency, but regenerative impact on ecosystems and communities. A solar array isn\u2019t just kilowatt-hours \u2014 it\u2019s a statement about what kind of future we\u2019re building.",
      },
      {
        title: "Equitable Access",
        body: "Clean energy shouldn\u2019t be a privilege. My work focuses on ensuring that sustainable solutions are accessible to all communities, especially those historically marginalized. The decentralized nature of solar + storage is inherently democratizing \u2014 if we design it that way.",
      },
      {
        title: "Interconnected Systems",
        body: "Like mycelium networks in nature, our energy systems should be interconnected, resilient, and mutually supportive. The future isn\u2019t a few massive power plants \u2014 it\u2019s millions of distributed nodes creating webs of sustainability, sharing resources through intelligent networks.",
      },
    ],
  },
  {
    id: "deep-dives",
    title: "Deep Dives",
    icon: Zap,
    description: "Strategic vision with guiding architecture, blueprints, and roadmaps for execution.",
    r2Prefix: "thought pieces/",
    items: [],
  },
  {
    id: "whitepapers",
    title: "Whitepapers",
    icon: FileText,
    description: "In-depth research and analysis on energy systems, policy, and technology.",
    items: [],
  },
]

function getVersionedUrl(photo: R2Photo) {
  if (!photo.lastModified) return photo.url
  const sep = photo.url.includes("?") ? "&" : "?"
  return `${photo.url}${sep}v=${encodeURIComponent(photo.lastModified)}`
}

function getPhotoTitle(name: string) {
  return name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
}

function getMediaIcon(mediaType?: string) {
  switch (mediaType) {
    case "animation": case "video": return Film
    case "document": case "text": return FileText
    case "slide": return Presentation
    default: return File
  }
}

function orderByFilename(photos: R2Photo[]): R2Photo[] {
  return [...photos].sort((a, b) => {
    const numA = parseInt(a.name.match(/\d+/)?.[0] || "0", 10)
    const numB = parseInt(b.name.match(/\d+/)?.[0] || "0", 10)
    return numA - numB || a.name.localeCompare(b.name)
  })
}

function useTierMedia(prefix?: string, filter?: string[]) {
  const [photos, setPhotos] = useState<R2Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!prefix) return
    let cancelled = false
    setLoading(true)
    fetch(`/api/photos?prefix=${encodeURIComponent(prefix)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return
        let loaded: R2Photo[] = Array.isArray(json.photos) ? json.photos : []
        if (filter?.length) {
          const lower = filter.map((f) => f.toLowerCase())
          loaded = loaded.filter((p) => lower.some((f) => p.name.toLowerCase().includes(f)))
        }
        const EXCLUDED = [".docx", ".doc", ".txt", ".md", ".rtf", ".pptx", ".ppt"]
        loaded = loaded.filter((p) => !EXCLUDED.some((ext) => p.name.toLowerCase().endsWith(ext)))
        setPhotos(orderByFilename(loaded))
      })
      .catch((e) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [prefix, filter?.join(",")])

  return { photos, loading, error }
}

function TierConstellation({ photos, loading, error }: { photos: R2Photo[]; loading: boolean; error: string | null }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const activePhoto = activeIdx !== null ? photos[activeIdx] : null

  const navigate = useCallback((dir: number) => {
    setActiveIdx((prev) => {
      if (prev === null) return null
      const next = prev + dir
      if (next < 0 || next >= photos.length) return prev
      return next
    })
  }, [photos.length])

  useEffect(() => {
    if (activeIdx === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIdx(null)
      if (e.key === "ArrowLeft") navigate(-1)
      if (e.key === "ArrowRight") navigate(1)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [activeIdx, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
        <span className="ml-3 text-sm text-slate-400">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
        Could not load media: {error}
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <p className="py-8 text-center text-sm italic text-slate-400">
        Media coming soon.
      </p>
    )
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center justify-center gap-4 py-4 sm:gap-6">
        {photos.map((photo, i) => {
          const Icon = getMediaIcon(photo.mediaType)
          const isImg = photo.mediaType === "image" || photo.mediaType === "animation"
          return (
            <button key={photo.key} onClick={() => setActiveIdx(i)} className="group relative flex flex-col items-center gap-2">
              <div
                className="relative h-16 w-16 overflow-hidden rounded-full border border-green-400/20 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-green-400/50 group-hover:shadow-green-500/20 sm:h-20 sm:w-20"
                style={{ boxShadow: "0 0 12px 0 rgba(34,197,94,0.1)" }}
              >
                {isImg ? (
                  <img src={getVersionedUrl(photo)} alt={getPhotoTitle(photo.name)} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-800/80">
                    <Icon className="h-1/2 w-1/2 text-green-300/60" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
              </div>
              <span className="max-w-[90px] truncate text-center text-[10px] text-slate-400 group-hover:text-green-400 sm:max-w-[110px] sm:text-xs">
                {getPhotoTitle(photo.name)}
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-center text-xs text-slate-500/60">
        {photos.length} items \u00b7 click to explore
      </p>

      <AnimatePresence>
        {activePhoto && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveIdx(null)}
          >
            <button
              onClick={() => setActiveIdx(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(-1) }}
                  className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white sm:left-4"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(1) }}
                  className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white sm:right-4"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
              {activePhoto.mediaType === "image" || activePhoto.mediaType === "animation" ? (
                <img src={getVersionedUrl(activePhoto)} alt={getPhotoTitle(activePhoto.name)} className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain" />
              ) : activePhoto.mediaType === "document" && activePhoto.name.toLowerCase().endsWith(".pdf") ? (
                <iframe src={getVersionedUrl(activePhoto)} title={getPhotoTitle(activePhoto.name)} className="h-[85vh] w-[90vw] rounded-lg border-0 bg-white" />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-48 w-64 flex-col items-center justify-center rounded-lg border border-slate-600 bg-slate-800/80 p-6 text-center">
                    {(() => { const Ic = getMediaIcon(activePhoto.mediaType); return <Ic className="mb-4 h-16 w-16 text-green-300/60" /> })()}
                    <p className="text-sm text-white/80">{getPhotoTitle(activePhoto.name)}</p>
                  </div>
                  <a href={getVersionedUrl(activePhoto)} target="_blank" rel="noopener noreferrer" className="text-sm text-green-400 underline underline-offset-2 hover:text-green-300">
                    Open file in new tab
                  </a>
                </div>
              )}
              <p className="text-xs text-white/40">{activeIdx! + 1} of {photos.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TierSection({ tier }: { tier: ContentTier }) {
  const { photos, loading, error } = useTierMedia(tier.r2Prefix, tier.mediaFilter)
  const Icon = tier.icon
  const hasItems = tier.items.length > 0
  const hasMedia = !!tier.r2Prefix

  if (!hasItems && !hasMedia && !loading) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">{tier.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{tier.description}</p>
        </div>
      </div>

      {hasItems && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tier.items.map((item) => (
            <Card key={item.title} className="border-green-200 dark:border-green-800/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-green-700 dark:text-green-400">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasMedia && (
        <TierConstellation photos={photos} loading={loading} error={error} />
      )}
    </motion.section>
  )
}

function MissionSummary() {
  return (
    <div className="space-y-3 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-green-400/80">My Mission</p>
      <h2 className="text-2xl font-serif font-bold text-white sm:text-3xl">
        From Vision to Network
      </h2>
      <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-300/80">
        Taking the dream from my head and making it happen \u2014 spreading ideas through
        a decentralized network of mycelium, connecting communities through sustainable
        energy systems that heal our planet and empower everyone.
      </p>
    </div>
  )
}

export default function ProfessionalMusingsPage() {
  return (
    <SectionGate path="/professional/musings">
      <div className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white">
        <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-10">
            <div className="flex items-start gap-4">
              <Link
                href="/professional"
                className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950/40"
                aria-label="Back to professional sections"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                <Lightbulb className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Mission Musings</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                  The principles, strategic vision, and knowledge base behind my work in sustainable and equitable energy systems.
                </p>
              </div>
            </div>

            <MotherTreeCanvas summary={<MissionSummary />} />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl space-y-4 text-center"
            >
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Like a mother tree nurturing the forest floor through fungal networks,
                my work connects communities through decentralized energy systems \u2014 sharing
                resources, knowledge, and resilience across the grid.
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Explore the sections below to understand the philosophy, dive into strategic
                blueprints, and follow the mycelium network as it grows.
              </p>
            </motion.div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300/40 to-transparent dark:via-green-700/30" />
              <Eye className="h-4 w-4 text-green-400/50" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300/40 to-transparent dark:via-green-700/30" />
            </div>

            <div className="space-y-12">
              {TIERS.map((tier) => (
                <TierSection key={tier.id} tier={tier} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </SectionGate>
  )
}
