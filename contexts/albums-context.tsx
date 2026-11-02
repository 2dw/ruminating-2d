"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useRef } from "react"

interface PhotoAlbum {
  id: string
  title: string
  subtitle: string
  description: string
  prefix: string
  cover?: string
  year?: number
  meta?: {
    location: { lat: number; lng: number; label: string } | null
    dateRange: { start: string; end?: string; ongoing?: boolean } | null
  } | null
}

interface AlbumsContextType {
  albums: PhotoAlbum[]
  loading: boolean
}

const AlbumsContext = createContext<AlbumsContextType | undefined>(undefined)

export function AlbumsProvider({ children }: { children: React.ReactNode }) {
  const [albums, setAlbums] = useState<PhotoAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const albumsRef = useRef<PhotoAlbum[]>([])

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch("/api/albums", { cache: "no-store" })
        const data = await response.json()
        if (active && data.success && Array.isArray(data.albums)) {
          const next = data.albums as PhotoAlbum[]
          // Only swap state when the payload actually changed, so a refetch on
          // window focus never cascades into re-rendering every album preview.
          if (JSON.stringify(next) !== JSON.stringify(albumsRef.current)) {
            albumsRef.current = next
            setAlbums(next)
          }
        }
      } catch (error) {
        console.warn("Failed to load albums:", error)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    // Albums are added in R2 over time, so refresh whenever the tab regains
    // focus to keep the map and timeline in step with the bucket.
    const handleFocus = () => load()
    const handleVisibility = () => {
      if (document.visibilityState === "visible") load()
    }
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      active = false
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  const value = useMemo(() => ({ albums, loading }), [albums, loading])

  return (
    <AlbumsContext.Provider value={value}>
      {children}
    </AlbumsContext.Provider>
  )
}

export function useAlbums() {
  const ctx = useContext(AlbumsContext)
  if (!ctx) throw new Error("useAlbums must be used within AlbumsProvider")
  return ctx
}
