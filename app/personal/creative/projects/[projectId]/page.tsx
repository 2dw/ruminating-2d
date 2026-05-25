"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, FolderKanban } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ArtworkCarousel } from "@/components/artwork-carousel"

interface R2Project {
  id: string
  title: string
  subtitle: string
  description: string
  prefix: string
}

export default function CreativeProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = Array.isArray(params?.projectId) ? params.projectId[0] : params?.projectId
  const [projects, setProjects] = useState<R2Project[]>([])
  const [loading, setLoading] = useState(true)

  const project = useMemo(
    () => (projectId ? projects.find((item) => item.id === projectId) : undefined),
    [projectId, projects],
  )

  useEffect(() => {
    let active = true

    const loadProjects = async () => {
      try {
        const response = await fetch("/api/projects", { cache: "no-store" })
        const data = await response.json()
        if (active && data.success && Array.isArray(data.projects)) {
          setProjects(data.projects)
        }
      } catch (error) {
        console.warn("Failed to load creative projects:", error)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProjects()
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
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/personal/creative")}
              className="mt-1 text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
              aria-label="Back to creative projects"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              <FolderKanban className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">
                {loading ? "Creative Project" : project?.title ?? "Project Not Found"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                {project?.description ?? (loading ? "Loading project details..." : "This project could not be found in the R2 projects folder.")}
              </p>
            </div>
          </div>

          {project && (
            <ArtworkCarousel
              title={project.title}
              description={`${project.subtitle}. Browse the project media from R2 without cropping the original frame.`}
              prefix={project.prefix}
              captionMode="none"
              emptyTitle={project.title}
              emptyDescription="No project media was found in this folder yet."
            />
          )}
        </motion.div>
      </main>
    </div>
  )
}
