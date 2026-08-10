"use client"

import { useState, useEffect } from "react"
import type { UnderConstruction as UnderConstructionType } from "./under-construction"

export function LazyUnderConstruction() {
  const [Component, setComponent] = useState<typeof UnderConstructionType | null>(null)

  useEffect(() => {
    import("./under-construction").then((mod) => setComponent(() => mod.UnderConstruction))
  }, [])

  if (!Component) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/40 dark:border-slate-700 dark:bg-slate-900/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-300" />
      </div>
    )
  }

  return <Component />
}
