"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Map, Timer, ArrowLeft } from "lucide-react"
import { albumMeta, AlbumMeta } from "@/config/albums"
import { useAlbums } from "@/contexts/albums-context"

const WORLD_MAP_W = 1000
const WORLD_MAP_H = 500

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * WORLD_MAP_W
  const y = ((90 - lat) / 180) * WORLD_MAP_H
  return { x, y }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function MushroomMarker({
  x, y, size, color, active, onClick, label,
}: {
  x: number
  y: number
  size: number
  color: string
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <g
      className="cursor-pointer"
      onClick={onClick}
      role="button"
      aria-label={label}
      tabIndex={0}
    >
      <circle cx={x} cy={y} r={size * 0.4} fill={color} opacity={active ? 1 : 0.7} />
      <ellipse cx={x} cy={y - size * 0.1} rx={size * 0.3} ry={size * 0.25} fill={color} opacity={active ? 0.9 : 0.6} />
      <circle cx={x} cy={y} r={size * 0.15} fill="white" opacity={active ? 0.8 : 0.4} />
      {active && (
        <>
          <circle cx={x} cy={y} r={size * 0.7} fill={color} opacity={0.15} />
          <circle cx={x} cy={y} r={size * 1.1} fill={color} opacity={0.05} />
        </>
      )}
    </g>
  )
}

export default function AlbumNavigation() {
  const { albums } = useAlbums()
  const [view, setView] = useState<"map" | "timeline">("map")
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null)

  const albumsWithMeta = useMemo(() => {
    return albums
      .map((album) => {
        const meta = albumMeta[album.id]
        if (!meta) return null
        return { ...album, meta }
      })
      .filter((a): a is NonNullable<typeof a> & { meta: AlbumMeta } => a !== null)
  }, [albums])

  const sortedByDate = useMemo(() => {
    return [...albumsWithMeta].sort((a, b) => {
      const aStart = new Date(a.meta.dateRange.start).getTime()
      const bStart = new Date(b.meta.dateRange.start).getTime()
      return aStart - bStart
    })
  }, [albumsWithMeta])

  const timelineMin = useMemo(() => {
    if (sortedByDate.length === 0) return 0
    return Math.min(...sortedByDate.map((a) => new Date(a.meta.dateRange.start).getTime()))
  }, [sortedByDate])

  const timelineMax = useMemo(() => {
    if (sortedByDate.length === 0) return 0
    const maxEnds = sortedByDate
      .map((a) => a.meta.dateRange.end ? new Date(a.meta.dateRange.end).getTime() : new Date(a.meta.dateRange.start).getTime())
    return Math.max(...maxEnds)
  }, [sortedByDate])

  const timelineRange = timelineMax - timelineMin || 1

  const dateToX = (dateStr: string, endStr?: string) => {
    const start = new Date(dateStr).getTime()
    const end = endStr ? new Date(endStr).getTime() : start
    const mid = (start + end) / 2
    return ((mid - timelineMin) / timelineRange) * 100
  }

  const dateToWidth = (dateStr: string, endStr?: string) => {
    const start = new Date(dateStr).getTime()
    const end = endStr ? new Date(endStr).getTime() : start
    return Math.max(1.5, ((end - start) / timelineRange) * 100)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
              view === "map"
                ? "bg-teal-600/80 text-white shadow-lg"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Map className="h-4 w-4" />
            Constellation Map
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
              view === "timeline"
                ? "bg-green-600/80 text-white shadow-lg"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Timer className="h-4 w-4" />
            Life Timeline
          </button>
        </div>
        <span className="text-xs text-slate-400">{albumsWithMeta.length} albums</span>
      </div>

      {view === "map" && (
        <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#060a0f]">
          <svg
            viewBox={`0 0 ${WORLD_MAP_W} ${WORLD_MAP_H}`}
            className="w-full"
            style={{ aspectRatio: "2/1" }}
          >
            <defs>
              <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgb(20, 184, 166)" stopOpacity={0.08} />
                <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity={0} />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width={WORLD_MAP_W} height={WORLD_MAP_H} fill="#060a0f" />
            <rect width={WORLD_MAP_W} height={WORLD_MAP_H} fill="url(#mapGlow)" />

            <g opacity={0.15}>
              {Array.from({ length: 36 }, (_, i) => (
                <line key={`vg${i}`} x1={(i / 36) * WORLD_MAP_W} y1={0} x2={(i / 36) * WORLD_MAP_W} y2={WORLD_MAP_H} stroke="rgb(20, 184, 166)" strokeWidth={0.5} />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`hg${i}`} x1={0} y1={(i / 10) * WORLD_MAP_H} x2={WORLD_MAP_W} y2={(i / 10) * WORLD_MAP_H} stroke="rgb(20, 184, 166)" strokeWidth={0.5} />
              ))}
            </g>

            <g opacity={0.3}>
              <path d="M120,80 L180,70 L220,90 L240,120 L230,160 L200,180 L170,200 L150,220 L130,200 L110,170 L100,140 Z" fill="rgb(20, 184, 166)" opacity={0.2} stroke="rgb(20, 184, 166)" strokeWidth={0.8} />
              <path d="M180,220 L220,210 L260,240 L280,300 L270,360 L250,400 L220,420 L190,400 L170,360 L160,300 L170,260 Z" fill="rgb(20, 184, 166)" opacity={0.2} stroke="rgb(20, 184, 166)" strokeWidth={0.8} />
              <path d="M420,70 L480,60 L520,80 L530,120 L510,160 L470,170 L440,150 L430,110 Z" fill="rgb(20, 184, 166)" opacity={0.2} stroke="rgb(20, 184, 166)" strokeWidth={0.8} />
              <path d="M440,180 L480,170 L520,200 L530,260 L510,320 L470,350 L440,330 L430,280 L430,220 Z" fill="rgb(20, 184, 166)" opacity={0.2} stroke="rgb(20, 184, 166)" strokeWidth={0.8} />
              <path d="M560,80 L640,70 L720,90 L760,120 L740,160 L680,180 L620,170 L580,140 Z" fill="rgb(20, 184, 166)" opacity={0.2} stroke="rgb(20, 184, 166)" strokeWidth={0.8} />
              <path d="M600,200 L660,190 L700,220 L710,280 L690,340 L650,360 L620,340 L600,300 Z" fill="rgb(20, 184, 166)" opacity={0.2} stroke="rgb(20, 184, 166)" strokeWidth={0.8} />
              <path d="M740,60 L800,50 L860,80 L870,140 L840,180 L780,170 L750,120 Z" fill="rgb(20, 184, 166)" opacity={0.2} stroke="rgb(20, 184, 166)" strokeWidth={0.8} />
              <path d="M800,200 L830,190 L850,210 L840,240 L810,240 L800,220 Z" fill="rgb(20, 184, 166)" opacity={0.2} stroke="rgb(20, 184, 166)" strokeWidth={0.8} />
              <path d="M900,30 L960,50 L980,100 L960,150 L920,160 L900,120 Z" fill="rgb(20, 184, 166)" opacity={0.2} stroke="rgb(20, 184, 166)" strokeWidth={0.8} />
            </g>

            {albumsWithMeta.map((album) => {
              const { x, y } = latLngToSvg(album.meta.location.lat, album.meta.location.lng)
              const isActive = activeAlbum === album.id
              return (
                <g key={album.id}>
                  <circle cx={x} cy={y} r={isActive ? 14 : 8} fill="rgb(20, 184, 166)" opacity={isActive ? 0.15 : 0.08} />
                  <circle cx={x} cy={y} r={isActive ? 7 : 4.5} fill={isActive ? "rgb(74, 222, 128)" : "rgb(20, 184, 166)"} stroke={isActive ? "rgb(74, 222, 128)" : "rgb(20, 184, 166)"} strokeWidth={1.5} opacity={isActive ? 1 : 0.8} style={{ cursor: "pointer" }} onClick={() => setActiveAlbum(isActive ? null : album.id)} filter={isActive ? "url(#glow)" : undefined} />
                  {isActive && (
                    <g>
                      <text x={x} y={y - 14} textAnchor="middle" fill="rgb(20, 184, 166)" fontSize={9} fontFamily="Inter, sans-serif" fontWeight={600}>{album.meta.location.label}</text>
                      <text x={x} y={y + 22} textAnchor="middle" fill="rgb(20, 184, 166)" fontSize={7} fontFamily="Inter, sans-serif" opacity={0.7}>{formatDate(album.meta.dateRange.start)}</text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-400" />
            <span className="inline-block w-3 h-3 rounded-full bg-green-400" />
            <span>Marker = album location · Green = active</span>
          </div>
        </div>
      )}

      {view === "timeline" && (
        <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#060a0f] p-6 sm:p-8">
          <div className="relative" style={{ height: 200 }}>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-teal-600/40 to-transparent" />

            <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gradient-to-r from-transparent via-green-600/30 to-transparent" />

            {sortedByDate.map((album, i) => {
              const x = dateToX(album.meta.dateRange.start, album.meta.dateRange.end)
              const width = dateToWidth(album.meta.dateRange.start, album.meta.dateRange.end)
              const isActive = activeAlbum === album.id
              const isRange = !!album.meta.dateRange.end

              return (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="absolute cursor-pointer"
                  style={{ left: `${x}%`, transform: "translateX(-50%)", top: "50%", marginTop: -12 }}
                  onClick={() => setActiveAlbum(isActive ? null : album.id)}
                >
                  <div className="relative">
                    {isRange && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 rounded-full border"
                        style={{
                          left: `-${width / 2}%`,
                          width: `${width}%`,
                          height: 4,
                          borderColor: isActive ? "rgb(74, 222, 128)" : "rgb(20, 184, 166)",
                          borderWidth: 1,
                          borderStyle: "dashed",
                          opacity: isActive ? 0.6 : 0.3,
                          background: isActive ? "rgb(74, 222, 128)" : "transparent",
                        }}
                      />
                    )}
                    <div
                      className="rounded-full transition-all duration-300 hover:scale-125"
                      style={{
                        width: isActive ? 24 : 16,
                        height: isActive ? 24 : 16,
                        background: isActive ? "rgb(74, 222, 128)" : "rgb(20, 184, 166)",
                        boxShadow: isActive ? "0 0 16px rgb(74, 222, 128), 0 0 32px rgb(20, 184, 166)" : "0 0 8px rgb(20, 184, 166)",
                      }}
                    >
                      {isActive && (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-[8px] font-bold text-white">★</span>
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs text-teal-300 backdrop-blur-sm dark:bg-slate-950/90"
                        style={{ zIndex: 50 }}
                      >
                        <div className="font-semibold">{album.title}</div>
                        <div className="text-slate-400">{formatDate(album.meta.dateRange.start)}{album.meta.dateRange.end ? ` — ${formatDate(album.meta.dateRange.end)}` : ""}</div>
                        <div className="text-slate-500">{album.meta.location.label}</div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )
            })}

            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-500 px-1">
              {sortedByDate.length > 0 && (
                <>
                  <span>{formatDate(sortedByDate[0].meta.dateRange.start)}</span>
                  <span>{formatDate(sortedByDate[sortedByDate.length - 1].meta.dateRange.start)}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-teal-400" />
              <span>Single date</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 rounded-full border border-teal-400 border-dashed" />
              <span>Date range</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
