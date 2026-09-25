export interface ResolvedAlbumMeta {
  location: { lat: number; lng: number; label: string } | null
  dateRange: { start: string; end?: string; ongoing?: boolean } | null
}

interface Place {
  phrases: string[]
  lat: number
  lng: number
  label: string
}

// Longest phrase wins, matched against the lowercased album title.
const PLACES: Place[] = [
  { phrases: ["maui honolulu", "maui+honolulu", "maui and honolulu"], lat: 21.0, lng: -157.2, label: "Maui and Honolulu, Hawaii" },
  { phrases: ["half moon bay"], lat: 37.46, lng: -122.43, label: "Half Moon Bay, California" },
  { phrases: ["san francisco"], lat: 37.77, lng: -122.42, label: "San Francisco, California" },
  { phrases: ["san diego"], lat: 32.72, lng: -117.16, label: "San Diego, California" },
  { phrases: ["baja california"], lat: 26.5, lng: -112.5, label: "Baja California, Mexico" },
  { phrases: ["mongolia china"], lat: 46.0, lng: 106.0, label: "Mongolia and China" },
  { phrases: ["big island"], lat: 19.72, lng: -155.98, label: "Big Island, Hawaii" },
  { phrases: ["costa rica"], lat: 9.75, lng: -83.75, label: "Costa Rica" },
  { phrases: ["mexico city"], lat: 19.43, lng: -99.13, label: "Mexico City, Mexico" },
  { phrases: ["sf bay area"], lat: 37.75, lng: -122.15, label: "San Francisco Bay Area" },
  { phrases: ["guilin"], lat: 25.28, lng: 110.29, label: "Guilin, China" },
  { phrases: ["berkeley"], lat: 37.87, lng: -122.27, label: "Berkeley, California" },
  { phrases: ["stanford"], lat: 37.43, lng: -122.17, label: "Stanford, California" },
  { phrases: ["oakland"], lat: 37.8, lng: -122.25, label: "Oakland, California" },
  { phrases: ["tokyo"], lat: 35.68, lng: 139.69, label: "Tokyo, Japan" },
  { phrases: ["cairns"], lat: -16.92, lng: 145.77, label: "Cairns, Australia" },
  { phrases: ["donner"], lat: 39.32, lng: -120.34, label: "Donner Pass, California" },
  { phrases: ["santorini"], lat: 36.39, lng: 25.46, label: "Santorini, Greece" },
  { phrases: ["crete"], lat: 35.24, lng: 24.81, label: "Crete, Greece" },
  { phrases: ["rome"], lat: 41.9, lng: 12.5, label: "Rome, Italy" },
  { phrases: ["toronto"], lat: 43.65, lng: -79.38, label: "Toronto, Canada" },
  { phrases: ["boston"], lat: 42.36, lng: -71.06, label: "Boston, Massachusetts" },
  { phrases: ["adelaide"], lat: -34.93, lng: 138.6, label: "Adelaide, Australia" },
  { phrases: ["austin"], lat: 30.27, lng: -97.74, label: "Austin, Texas" },
  { phrases: ["new york"], lat: 40.71, lng: -74.01, label: "New York" },
  { phrases: ["singapore"], lat: 1.35, lng: 103.82, label: "Singapore" },
  { phrases: ["colombia"], lat: 4.7, lng: -74.0, label: "Colombia" },
  { phrases: ["panama"], lat: 8.98, lng: -79.52, label: "Panama" },
  { phrases: ["illinois"], lat: 40.0, lng: -89.0, label: "Illinois" },
  { phrases: ["indiana"], lat: 39.9, lng: -86.4, label: "Indiana" },
  { phrases: ["nevada"], lat: 39.5, lng: -116.7, label: "Nevada" },
  { phrases: ["hawaii"], lat: 20.8, lng: -156.5, label: "Hawaii" },
]

function matchPlace(title: string): { lat: number; lng: number; label: string } | null {
  const lower = title.toLowerCase()
  let best: Place | null = null
  let bestLen = 0
  for (const place of PLACES) {
    for (const phrase of place.phrases) {
      if (lower.includes(phrase) && phrase.length > bestLen) {
        best = place
        bestLen = phrase.length
      }
    }
  }
  return best ? { lat: best.lat, lng: best.lng, label: best.label } : null
}

function matchDates(title: string): ResolvedAlbumMeta["dateRange"] {
  const years = Array.from(title.matchAll(/(\d{4})/g), (m) => parseInt(m[1], 10))
  const ongoing = /20\s*x{2}/i.test(title)
  if (years.length === 0) return null

  const currentYear = new Date().getFullYear()
  const start = years[0]

  if (years.length >= 2) {
    const end = years[1]
    return { start: String(start), end: String(end), ongoing: end >= currentYear }
  }
  if (ongoing) {
    return { start: String(start), end: String(currentYear), ongoing: true }
  }
  return { start: String(start), end: String(start) }
}

// Manual overrides, keyed by album id. Titles are the primary source of truth,
// so this only needs entries for albums whose title does not say enough.
export const albumMetaOverrides: Record<string, Partial<ResolvedAlbumMeta>> = {}

export function resolveAlbumMeta(album: { id: string; title: string }): ResolvedAlbumMeta {
  const override = albumMetaOverrides[album.id] || {}
  return {
    location: override.location !== undefined ? override.location : matchPlace(album.title),
    dateRange: override.dateRange !== undefined ? override.dateRange : matchDates(album.title),
  }
}
