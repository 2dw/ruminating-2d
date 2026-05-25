"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Brush, FolderKanban, Palette, PenTool, type LucideIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
}

interface R2Project {
  id: string
  title: string
  subtitle: string
  description: string
  prefix: string
  cover?: string
}

const baseCreativeProjects: CreativeProjectCard[] = [
  {
    id: "digital-art",
    title: "Digital Art Explorations",
    subtitle: "Illustrations and visual experiments",
    description:
      "A living gallery of artwork pulled directly from the art folder in R2, designed to update as the collection changes.",
    href: "/personal/creative/art",
    image: "/creative-art-fallback.svg",
    icon: Brush,
    prefix: "art/",
  },
  {
    id: "poetry",
    title: "Poetry & Reflections",
    subtitle: "Language, identity, and natural systems",
    description:
      "Poems and reflective fragments that help me process belonging, connection, and the quiet wisdom of the natural world.",
    href: "/personal/creative/poetry",
    image: "/creative-poetry-fallback.svg",
    icon: PenTool,
  },
]

async function loadFirstImage(prefix: string) {
  const response = await fetch(`/api/photos?prefix=${encodeURIComponent(prefix)}`, { cache: "no-store" })
  if (!response.ok) return null

  const data = await response.json()
  if (!data.success || !Array.isArray(data.photos) || data.photos.length === 0) return null

  return data.photos[0]?.url ?? null
}

export default function PersonalCreativePage() {
  const router = useRouter()
  const [dynamicProjects, setDynamicProjects] = useState<CreativeProjectCard[]>([])
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [loadingProjects, setLoadingProjects] = useState(true)

  const creativeProjects = useMemo(
    () => [...baseCreativeProjects, ...dynamicProjects],
    [dynamicProjects],
  )

  useEffect(() => {
    let active = true

    const loadCreativeProjects = async () => {
      setLoadingProjects(true)

      try {
        const [artPreview, projectsResponse] = await Promise.all([
          loadFirstImage("art/").catch(() => null),
          fetch("/api/projects", { cache: "no-store" }),
        ])

        const nextPreviews: Record<string, string> = {}
        if (artPreview) nextPreviews["digital-art"] = artPreview

        const projectsData = await projectsResponse.json()
        const discoveredProjects: CreativeProjectCard[] =
          projectsData.success && Array.isArray(projectsData.projects)
            ? projectsData.projects.map((project: R2Project) => ({
                id: `r2-${project.id}`,
                title: project.title,
                subtitle: project.subtitle,
                description: project.description,
                href: `/personal/creative/projects/${project.id}`,
                image: project.cover ?? "/creative-project-fallback.svg",
                icon: FolderKanban,
                prefix: project.prefix,
                previewFit: "contain",
              }))
            : []

        await Promise.all(
          discoveredProjects.map(async (project) => {
            if (!project.prefix) return
            const preview = await loadFirstImage(project.prefix).catch(() => null)
            if (preview) nextPreviews[project.id] = preview
          }),
        )

        if (active) {
          setDynamicProjects(discoveredProjects)
          setPreviews(nextPreviews)
        }
      } catch (error) {
        console.warn("Failed to load creative project previews:", error)
      } finally {
        if (active) setLoadingProjects(false)
      }
    }

    loadCreativeProjects()
    return () => {
      active = false
    }
  }, [])

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
          className="space-y-8"
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                <Palette className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Creative Endeavors</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                  Beyond my professional work, I explore creativity through various mediums. Choose a project to open its dedicated space.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loadingProjects ? "Loading creative projects..." : `${creativeProjects.length} project${creativeProjects.length !== 1 ? "s" : ""} available`}
            </p>
          </div>

          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {creativeProjects.map((project, index) => {
              const Icon = project.icon
              const previewSrc = previews[project.id] ?? project.image

              return (
                <motion.div
                  key={project.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.32) }}
                >
                  <Card className="h-full overflow-hidden border-slate-200 bg-slate-50/90 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/80 dark:hover:border-blue-600">
                    <button
                      type="button"
                      onClick={() => router.push(project.href)}
                      className="group h-full w-full text-left"
                    >
                      <div
                        className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-900"
                        onContextMenu={(event) => event.preventDefault()}
                      >
                        <Image
                          src={previewSrc}
                          alt=""
                          fill
                          draggable={false}
                          className={`protected-media transition duration-500 group-hover:scale-105 ${
                            project.previewFit === "contain" ? "object-contain p-3" : "object-cover"
                          }`}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent opacity-20" />
                      </div>
                      <CardHeader>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200">
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-blue-700 dark:text-blue-300">{project.title}</CardTitle>
                        <CardDescription>{project.subtitle}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{project.description}</p>
                        <div className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-300">Open project →</div>
                      </CardContent>
                    </button>
                  </Card>
                </motion.div>
              )
            })}
          </section>
        </motion.div>
      </main>
    </div>
  )
}
