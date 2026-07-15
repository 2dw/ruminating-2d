"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, FolderKanban, Sparkles, Target, Tags as TagsIcon, Star, MapPin, Building2, ChevronDown, ChevronRight } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ProjectConstellation } from "@/components/project-constellation"
import { UnderConstruction } from "@/components/under-construction"
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
  const description = projectConfig?.description ?? ""
  const inspiration = projectConfig?.inspiration
  const mission = projectConfig?.mission
  const milestones = projectConfig?.milestones ?? []
  const subprojects = projectConfig?.subprojects ?? []
  const [expandedSub, setExpandedSub] = useState<string | null>(null)

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
              {description && (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
          </div>

          {inspiration && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-3xl border border-amber-200/60 bg-amber-50/50 p-8 dark:border-amber-800/40 dark:bg-amber-950/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-slate-900 dark:text-white">
                    Inspiration
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {inspiration.narrative}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {mission && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-3xl border border-emerald-200/60 bg-emerald-50/50 p-8 dark:border-emerald-800/40 dark:bg-emerald-950/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-slate-900 dark:text-white">
                    Mission
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {mission.narrative}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {milestones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-3xl border border-slate-200 bg-white/95 p-8 dark:border-slate-800 dark:bg-slate-950/80"
            >
              <div className="mb-8 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-xs font-medium tracking-wider text-blue-700 uppercase dark:text-blue-300">
                  <Star className="h-3 w-3" />
                  The Journey
                  <Star className="h-3 w-3" />
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 dark:from-blue-800 dark:via-blue-500 dark:to-blue-800" />

                {milestones.map((milestone, index) => {
                  const isLeft = index % 2 === 0

                  return (
                    <div key={index} className="relative mb-10 last:mb-0">
                      <div className={`flex items-start ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                        <div className={`w-1/2 ${isLeft ? "pr-8 text-right" : "pl-8 text-left"}`}>
                          {milestone.location ? (
                            <span className="group/pin relative inline-flex items-center gap-1 text-xs font-medium tracking-wider text-blue-500">
                              <Building2 className="h-3.5 w-3.5" />
                              <svg className="h-3 w-4" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="30" height="20" rx="1" fill="#DE2910" />
                                <g transform="translate(15,10)">
                                  <g fill="white">
                                    <ellipse cx="0" cy="-5" rx="1.8" ry="4" transform="rotate(0)" />
                                    <ellipse cx="0" cy="-5" rx="1.8" ry="4" transform="rotate(72)" />
                                    <ellipse cx="0" cy="-5" rx="1.8" ry="4" transform="rotate(144)" />
                                    <ellipse cx="0" cy="-5" rx="1.8" ry="4" transform="rotate(216)" />
                                    <ellipse cx="0" cy="-5" rx="1.8" ry="4" transform="rotate(288)" />
                                  </g>
                                  <circle cx="0" cy="0" r="1.5" fill="#DE2910" />
                                </g>
                              </svg>
                              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1 text-[11px] text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/pin:opacity-100">
                                {milestone.location}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium tracking-wider text-blue-500">
                              <MapPin className="h-3.5 w-3.5" />
                            </span>
                          )}
                          <h3 className="mt-1 font-serif text-lg font-semibold text-slate-900 dark:text-white">
                            {milestone.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            {milestone.description}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-start justify-center" style={{ width: "32px" }}>
                          <div className="relative z-10 mt-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        </div>

                        <div className="w-1/2" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Subprojects section */}
          {subprojects.length > 0 && project && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <h2 className="font-serif text-2xl font-semibold text-slate-900 dark:text-white">
                Collection
              </h2>
              {subprojects.map((sub) => {
                const isExpanded = expandedSub === sub.id
                const subPrefix = `${project.prefix}${sub.id}/`
                return (
                  <div
                    key={sub.id}
                    className="rounded-3xl border border-slate-200 bg-white/95 overflow-hidden dark:border-slate-800 dark:bg-slate-950/80"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedSub(isExpanded ? null : sub.id)}
                      className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">
                          {sub.title}
                        </h3>
                        {sub.summary && (
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {sub.summary}
                          </p>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                      )}
                    </button>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        <div className="p-6">
                          {sub.journey && (
                            <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                              {sub.journey}
                            </p>
                          )}
                          <ProjectConstellation
                            prefix={subPrefix}
                            mediaPrefix={sub.mediaPrefix}
                            mediaFilter={sub.mediaFilter}
                            noMediaMessage={`No media in ${sub.title} yet`}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </motion.div>
          )}

          {/* Main project constellation (only for projects without subprojects) */}
          {project && subprojects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ProjectConstellation prefix={project.prefix} />
            </motion.div>
          )}

          {/* PLACEHOLDER: Replace this UnderConstruction component with actual content when ready */}
          {!projectConfig && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <UnderConstruction />
            </motion.div>
          )}
          {/* END PLACEHOLDER */}
        </motion.div>
      </main>
    </div>
  )
}
