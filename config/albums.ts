export interface AlbumMeta {
  id: string
  location: {
    lat: number
    lng: number
    label: string
  }
  dateRange: {
    start: string
    end?: string
  }
}

export const albumMeta: Record<string, AlbumMeta> = {
  "wilderness-coastal-dawn": {
    id: "wilderness-coastal-dawn",
    location: { lat: 47.6, lng: -122.3, label: "Pacific Northwest" },
    dateRange: { start: "2024-03", end: "2024-06" },
  },
  "mushroom-network-foundations": {
    id: "mushroom-network-foundations",
    location: { lat: 51.5, lng: -0.1, label: "London, UK" },
    dateRange: { start: "2023-09", end: "2024-01" },
  },
  "mycelium-migration": {
    id: "mycelium-migration",
    location: { lat: 35.7, lng: 139.7, label: "Tokyo, Japan" },
    dateRange: { start: "2024-07", end: "2024-10" },
  },
  "constellation-tides": {
    id: "constellation-tides",
    location: { lat: -33.9, lng: 18.4, label: "Cape Town, South Africa" },
    dateRange: { start: "2025-01", end: "2025-04" },
  },
  "energy-and-equity": {
    id: "energy-and-equity",
    location: { lat: 38.9, lng: -77.0, label: "Washington, D.C." },
    dateRange: { start: "2023-01", end: "2023-06" },
  },
  "forest-canopy-study": {
    id: "forest-canopy-study",
    location: { lat: 52.5, lng: 13.4, label: "Berlin, Germany" },
    dateRange: { start: "2024-11" },
  },
  "river-delta-patterns": {
    id: "river-delta-patterns",
    location: { lat: 29.8, lng: -95.4, label: "Houston, TX" },
    dateRange: { start: "2025-05" },
  },
  "urban-fungal-networks": {
    id: "urban-fungal-networks",
    location: { lat: 48.9, lng: 2.3, label: "Paris, France" },
    dateRange: { start: "2023-07", end: "2023-12" },
  },
  "tidal-ecosystem-portraits": {
    id: "tidal-ecosystem-portraits",
    location: { lat: -33.9, lng: 151.2, label: "Sydney, Australia" },
    dateRange: { start: "2025-08" },
  },
  "boreal-canopy-lights": {
    id: "boreal-canopy-lights",
    location: { lat: 64.1, lng: -21.9, label: "Reykjavik, Iceland" },
    dateRange: { start: "2024-01", end: "2024-03" },
  },
}
