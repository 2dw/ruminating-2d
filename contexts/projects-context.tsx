"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo } from "react"

interface R2Project {
  id: string
  title: string
  subtitle: string
  description: string
  prefix: string
  cover?: string
}

interface ProjectsContextType {
  projects: R2Project[]
  loading: boolean
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<R2Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetch("/api/projects", { cache: "no-store" })
        const data = await response.json()
        if (active && data.success && Array.isArray(data.projects)) {
          setProjects(data.projects)
        }
      } catch (error) {
        console.warn("Failed to load projects:", error)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const value = useMemo(() => ({ projects, loading }), [projects, loading])

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const ctx = useContext(ProjectsContext)
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider")
  return ctx
}
