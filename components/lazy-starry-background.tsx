"use client"

import { useState, useEffect } from "react"

export function LazyStarryBackground() {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    import("@/components/starry-background").then((m) => {
      setComponent(() => m.StarryBackground)
    })
  }, [])

  if (!Component) return null
  return <Component />
}
