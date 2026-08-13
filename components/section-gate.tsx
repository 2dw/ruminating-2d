"use client"

import { type ReactNode } from "react"
import { UNDER_CONSTRUCTION_SECTIONS } from "@/config/under-construction"
import { LazyUnderConstruction } from "./lazy-under-construction"

/**
 * Wraps page content and conditionally shows the "Under Construction"
 * placeholder instead.
 *
 * Usage:
 *   <SectionGate path="/personal/story">
 *     <OriginalContent />
 *   </SectionGate>
 *
 * To restore the original content, remove the path from
 * `UNDER_CONSTRUCTION_SECTIONS` in config/under-construction.ts.
 * The real content is preserved in the source file and reappears immediately.
 */

interface SectionGateProps {
  /** The route path to match against the under-construction list */
  path: string
  /** The real content to show when the section is NOT under construction */
  children: ReactNode
  /** Optional custom quote for the under-construction card */
  quote?: string
  author?: string
}

export function SectionGate({ path, children, quote, author }: SectionGateProps) {
  if (UNDER_CONSTRUCTION_SECTIONS.has(path)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <LazyUnderConstruction quote={quote} author={author} />
      </div>
    )
  }
  return <>{children}</>
}
