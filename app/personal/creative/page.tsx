"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brush,
  Compass,
  FolderKanban,
  Hammer,
  Layers,
  Palette,
  PenTool,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProjects } from "@/contexts/projects-context"
import { creativeProjectOverrides } from "@/config/creative-projects"

interface CreativeProjectCard {
  id: string
  title: string
  subtitle: string
  description: string
  href: string
  image: string
  icon: LucideIcon
  prefix?: string
  previewFit?: "cover" | "contain"
  category: "art" | "builds" | "adventures" | "words"
  tags?: string[]
}

const baseCreativeProjects: CreativeProjectCard[] = [
  {
    id: "digital-art",
    title: "Mind wandering outwards: tunneling visions into graphite, cellulose and lignin",
    subtitle: "Collecting inspirations through graphite, cellulose & lignin",
    description:
      "A living gallery of artwork and visual studies pulled directly from R2, channelling voices of empowerment, resilience, and quiet natural wisdom.",
    href: "/personal/creative/art",
    image: "/creative-art-fallback.svg",
    icon: Brush,
    prefix: "art/",
    category: "art",
    tags: ["Graphite", "Fine Art", "Living Gallery", "Visual Studies"],
  },
  {
    id: "poetry",
    title: "Poetry & Reflections",
    subtitle: "Language, identity, and natural systems",
    description:
      "Poems and reflective fragments that process belonging, connection, and the quiet wisdom of the natural world.",
    href: "/personal/creative/poetry",
    image: "/creative-poetry-fallback.svg",
    icon: PenTool,
    category: "words",
    tags: ["Verse", "Identity", "Cadence", "Reflections"],
  },
]

const CREATIVE_MEDIUMS = [
  {
    key: "all",
    label: "All Endeavors",
    icon: Layers,
    description: "The complete constellation of physical, visual, and literary explorations",
  },
  {
    key: "art",
    label: "Graphite & Vision",
    icon: Brush,
    description: "Line work, graphite manifestos, and visual explorations on paper & canvas",
  },
  {
    key: "builds",
    label: "Kinetics & Solar",
    icon: Hammer,
    description: "Turbine fabrication, community solar arrays, and hands-on physical building",
  },
  {
    key: "adventures",
    label: "Storyboards & Keepsakes",
    icon: Compass,
    description: "Coastal sandstone scrambles, road sign capers, and lasting keepsakes",
  },
  {
    key: "words",
    label: "Verse & Gastronomy",
    icon: UtensilsCrossed,
    description: "Food science emulsions, nutrient-dense alchemy, and contemplative verse",
  },
] as const

function inferCategory(id: string): "art" | "builds" | "adventures" | "words" {
  const lower = id.toLowerCase()
  if (lower.includes("turbine") || lower.includes("habitat") || lower.includes("grid-alternatives") || lower.includes("solar")) {
    return "builds"
  }
  if (lower.includes("dollar") || lower.includes("tweedy") || lower.includes("climb")) {
    return "adventures"
  }
  if (lower.includes("edible") || lower.includes("cheese") || lower.includes("poetry")) {
    return "words"
  }
  if (lower.includes("graphite") || lower.includes("art") || lower.includes("drawing") || lower.includes("tunneling")) {
    return "art"
  }
  return "adventures"
}

async function loadFirstImage(prefix: string) {
  const response = await fetch(`/api/photos?prefix=${encodeURIComponent(prefix)}`, { cache: "no-store" })
  if (!response.ok) return null
  const data = await response.json()
  if (!data.success || !Array.isArray(data.photos) || data.photos.length === 0) return null
  return data.photos[0]?.url ?? null
}

export default function PersonalCreativePage() {
  const router = useRouter()
  const { projects: r2Projects, loading: projectsLoading } = useProjects()
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [selectedMedium, setSelectedMedium] = useState<string>("all")

  const dynamicProjects: CreativeProjectCard[] = useMemo(
    () =>
      r2Projects.map((project) => {
        const override = creativeProjectOverrides[project.id]
        const cat = inferCategory(project.id)
        return {
          id: `r2-${project.id}`,
          title: override?.title ?? project.title,
          subtitle: override?.subtitle ?? project.subtitle,
          description: override?.description ?? project.description,
          href: `/personal/creative/projects/${project.id}`,
          image:
            project.cover && project.cover !== "/creative-project-fallback.svg"
              ? project.cover
              : "/creative-project-fallback.svg",
          icon:
            cat === "builds"
              ? Hammer
              : cat === "adventures"
              ? Compass
              : cat === "words"
              ? UtensilsCrossed
              : FolderKanban,
          prefix: project.prefix,
          previewFit: override?.previewFit ?? project.previewFit ?? "cover",
          category: cat,
          tags: override?.tags?.slice(0, 3),
        }
      }),
    [r2Projects],
  )

  const creativeProjects = useMemo(
    () => [...baseCreativeProjects, ...dynamicProjects],
    [dynamicProjects],
  )

  const filteredProjects = useMemo(() => {
    if (selectedMedium === "all") return creativeProjects
    return creativeProjects.filter((p) => p.category === selectedMedium)
  }, [creativeProjects, selectedMedium])

  useEffect(() => {
    let active = true
    const loadPreviews = async () => {
      const nextPreviews: Record<string, string> = {}
      const artPreview = await loadFirstImage("art/").catch(() => null)
      if (artPreview) nextPreviews["digital-art"] = artPreview
      for (const project of dynamicProjects) {
        if (project.image && project.image !== "/creative-project-fallback.svg") {
          nextPreviews[project.id] = project.image
        } else if (project.prefix) {
          const url = await loadFirstImage(project.prefix).catch(() => null)
          if (url) nextPreviews[project.id] = url
        }
      }
      if (active) setPreviews(nextPreviews)
    }
    loadPreviews()
    return () => {
      active = false
    }
  }, [dynamicProjects])

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white"
    >
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          {/* Header & Philosophy */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 shadow-sm dark:bg-sky-950/60 dark:text-sky-300">
                <Palette className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/60 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
                    <Sparkles className="h-3 w-3" />
                    Tangible Explorations
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {projectsLoading
                      ? "Discovering works..."
                      : `${creativeProjects.length} creative project${creativeProjects.length !== 1 ? "s" : ""}`}
                  </span>
                </div>
                <h1 className="mt-2 text-4xl font-serif font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                  Creative Endeavors
                </h1>
                <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
                  Where thought takes physical form: tactile pencil strokes, carbon fiber wind blades, community rooftop solar, coastal bluff scrambles, and kitchen culinary experiments.
                </p>
              </div>
            </div>
          </div>

          {/* Mediums Infographic Strip */}
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white/90 via-sky-50/30 to-slate-100/60 p-5 shadow-sm backdrop-blur-sm sm:p-6 dark:border-slate-800/80 dark:from-slate-900/90 dark:via-sky-950/20 dark:to-slate-950/60">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                Creative Mediums & Streams
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select a medium to filter projects
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {CREATIVE_MEDIUMS.map((medium) => {
                const Icon = medium.icon
                const isActive = selectedMedium === medium.key
                const count =
                  medium.key === "all"
                    ? creativeProjects.length
                    : creativeProjects.filter((p) => p.category === medium.key).length

                return (
                  <button
                    key={medium.key}
                    type="button"
                    onClick={() => setSelectedMedium(medium.key)}
                    className={`group flex flex-col justify-between rounded-2xl p-3.5 text-left transition-all duration-300 touch-manipulation ${
                      isActive
                        ? "border border-sky-400/80 bg-sky-100/70 shadow-md shadow-sky-500/10 dark:border-sky-500/80 dark:bg-sky-950/60"
                        : "border border-slate-200/60 bg-white/60 hover:border-sky-300 hover:bg-sky-50/40 dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:border-sky-800 dark:hover:bg-sky-950/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                          isActive
                            ? "bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950"
                            : "bg-slate-100 text-slate-700 group-hover:bg-sky-100 group-hover:text-sky-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-sky-900/40 dark:group-hover:text-sky-300"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isActive
                            ? "bg-sky-200/80 text-sky-900 dark:bg-sky-900 dark:text-sky-200"
                            : "bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div
                        className={`text-sm font-semibold transition ${
                          isActive
                            ? "text-sky-950 dark:text-white"
                            : "text-slate-800 group-hover:text-sky-700 dark:text-slate-200 dark:group-hover:text-sky-300"
                        }`}
                      >
                        {medium.label}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                        {medium.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Project Cards Grid */}
          <section>
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredProjects.map((project, index) => {
                  const Icon = project.icon
                  const previewSrc = previews[project.id] ?? project.image

                  return (
                    <motion.div
                      layout
                      key={project.href}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.25) }}
                    >
                      <Card className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10 dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:border-sky-600 dark:hover:shadow-sky-950/30">
                        {/* Ambient card top glow */}
                        <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/15 via-transparent to-transparent dark:from-sky-500/15" />

                        <button
                          type="button"
                          onClick={() => router.push(project.href)}
                          className="flex h-full w-full flex-col text-left touch-manipulation"
                        >
                          {/* Image preview frame */}
                          <div
                            className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-950/80"
                            onContextMenu={(event) => event.preventDefault()}
                          >
                            <Image
                              src={previewSrc}
                              alt=""
                              fill
                              draggable={false}
                              className={`protected-media transition-transform duration-700 ease-out group-hover:scale-105 ${
                                project.previewFit === "contain" ? "object-contain p-4" : "object-cover"
                              }`}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-40 transition-opacity group-hover:opacity-60" />

                            {/* Category badge atop image */}
                            <div className="absolute top-3 right-3">
                              <span className="rounded-full bg-slate-950/70 px-2.5 py-1 text-[11px] font-medium tracking-wide text-sky-200 backdrop-blur-md border border-sky-400/30">
                                {project.category === "art"
                                  ? "Visual Art"
                                  : project.category === "builds"
                                  ? "Physical Build"
                                  : project.category === "adventures"
                                  ? "Keepsake & Story"
                                  : "Verse & Science"}
                              </span>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="flex flex-1 flex-col justify-between p-6">
                            <div>
                              <CardHeader className="p-0">
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 transition duration-300 group-hover:bg-sky-200 group-hover:text-sky-900 dark:bg-sky-950/60 dark:text-sky-300 dark:group-hover:bg-sky-900 dark:group-hover:text-sky-100">
                                  <Icon className="h-5 w-5" />
                                </div>
                                <CardTitle className="line-clamp-2 text-lg font-bold text-slate-900 transition-colors duration-200 group-hover:text-sky-600 sm:text-xl dark:text-white dark:group-hover:text-sky-300">
                                  {project.title}
                                </CardTitle>
                                <CardDescription className="mt-1 line-clamp-1 text-xs text-sky-700/80 dark:text-sky-300/80">
                                  {project.subtitle}
                                </CardDescription>
                              </CardHeader>

                              <CardContent className="mt-3 p-0">
                                <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                                  {project.description}
                                </p>

                                {project.tags && project.tags.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {project.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-md border border-slate-200 bg-slate-100/70 px-2 py-0.5 text-[10px] text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </div>

                            <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-sky-600 transition duration-200 group-hover:gap-2.5 dark:text-sky-400">
                              <span>Open Project</span>
                              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                            </div>
                          </div>
                        </button>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </section>
        </motion.div>
      </main>
    </div>
  )
}
