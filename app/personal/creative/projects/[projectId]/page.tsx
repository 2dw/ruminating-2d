"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, FolderKanban, Tags as TagsIcon } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ProjectConstellation } from "@/components/project-constellation"
import { getCreativeProjectConfig, type CreativeProjectConfig } from "@/config/creative-projects"

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

  const project = useMemo(
    () => (projectId ? projects.find((item) => item.id === projectId) : undefined),
    [projectId, projects],
  )

  const projectConfig: CreativeProjectConfig | undefined = useMemo(
    () => (projectId ? getCreativeProjectConfig(projectId) : undefined),
    [projectId],
  )

  const title = projectConfig?.title ?? project?.title ?? "Project Not Found"
  const tags = projectConfig?.tags ?? []
  const prefix = project?.prefix ?? `projects/${projectId}/`

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#f8fcff] pb-16 pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white"
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
            <div className="min-w-0 flex-1">
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">
                {loading ? "Creative Project" : title}
              </h1>
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <TagsIcon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-white/60 px-3 py-0.5 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <ProjectConstellation prefix={prefix} />
        </motion.div>
      </main>
    </div>
  )
}
