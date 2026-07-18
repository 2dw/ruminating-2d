"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useMemo } from "react"

interface PhotoAlbum {
  id: string
  title: string
  subtitle: string
  description: string
  prefix: string
  cover?: string
}

interface AlbumsContextType {
  albums: PhotoAlbum[]
  loading: boolean
}

const AlbumsContext = createContext<AlbumsContextType | undefined>(undefined)

export function AlbumsProvider({ children }: { children: React.ReactNode }) {
  const [albums, setAlbums] = useState<PhotoAlbum[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetch("/api/albums")
        const data = await response.json()
        if (active && data.success && Array.isArray(data.albums)) {
          setAlbums(data.albums)
        }
      } catch (error) {
        console.warn("Failed to load albums:", error)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
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
