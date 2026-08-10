"use client"

import { useState, useEffect, type ComponentProps } from "react"
import type { ProjectConstellation as ProjectConstellationType } from "./project-constellation"

export function LazyProjectConstellation(props: ComponentProps<typeof ProjectConstellationType>) {
  const [Component, setComponent] = useState<typeof ProjectConstellationType | null>(null)

  useEffect(() => {
    import("./project-constellation").then((mod) => setComponent(() => mod.ProjectConstellation))
  }, [])

  if (!Component) {
    return (
      <div className="flex min-h-[16rem] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 dark:border-slate-700 dark:bg-slate-900/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-300" />
      </div>
    )
  }

  return <Component {...props} />
}
