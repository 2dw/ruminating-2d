"use client"

import { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Map, Timer } from "lucide-react"
import { useAlbums } from "@/contexts/albums-context"

const WORLD_MAP_W = 1000
const WORLD_MAP_H = 500

// Approximate land dot positions for a recognizable constellation-style world map
// Each [x, y] represents a dot on land
const LAND_DOTS: number[][] = [
  // North America
  [80,80],[95,70],[110,65],[130,60],[145,55],[160,50],[175,48],[190,52],[205,55],[220,60],[235,65],[250,70],[265,75],[280,80],[295,85],[310,90],[325,95],[340,100],[355,110],[365,120],[370,130],[375,140],[370,150],[365,160],[355,170],[345,180],[335,190],[325,200],[315,210],[305,215],[295,220],[285,225],[275,220],[265,215],[255,210],[245,205],[235,200],[225,195],[215,190],[205,185],[195,180],[185,175],[175,170],[165,165],[155,160],[145,155],[135,150],[125,145],[115,140],[105,135],[95,130],[85,125],[80,115],
  [100,65],[115,58],[130,52],[148,48],[165,45],[182,42],[200,45],[218,50],[235,55],[252,60],[268,65],[285,72],[302,78],[318,85],[335,92],[350,100],[360,108],[368,118],[372,130],
  // Greenland
  [350,25],[365,20],[380,18],[398,22],[410,30],[415,40],[408,50],[395,55],[380,52],[365,48],[355,40],[350,32],
  [370,15],[385,12],[400,15],[412,22],[418,32],[412,42],[400,50],[385,50],[375,45],[370,35],
  // South America
  [220,280],[240,270],[260,275],[278,285],[295,300],[310,320],[322,345],[328,370],[325,395],[318,420],[308,440],[295,455],[278,465],[260,468],[245,460],[235,445],[228,425],[222,400],[218,375],[215,350],[212,325],[210,300],
  [235,285],[255,280],[275,290],[292,310],[305,340],[315,370],[318,400],[312,430],[300,450],[282,462],[265,465],[250,458],[240,442],[232,420],[225,395],[220,370],[218,345],[216,320],
  // Europe
  [470,65],[485,55],[500,50],[515,48],[530,52],[540,58],[548,68],[550,80],[545,92],[538,102],[528,112],[518,120],[508,128],[498,135],[488,140],[478,138],[470,132],[465,122],[462,110],[460,98],[462,85],
  [510,60],[525,55],[540,58],[550,68],[552,80],[548,92],[540,102],[530,110],[520,115],[510,118],
  // Scandinavia
  [540,35],[555,30],[570,32],[575,42],[570,52],[558,58],[548,52],[542,42],
  [585,30],[598,28],[608,35],[610,48],[605,58],[595,60],[585,55],[580,45],
  // British Isles
  [465,75],[472,68],[478,72],[475,82],[468,85],[462,80],
  // Africa
  [455,210],[470,200],[488,198],[508,200],[525,210],[540,225],[555,245],[565,270],[572,300],[575,330],[572,360],[565,390],[552,415],[535,435],[518,448],[500,452],[482,448],[468,435],[455,415],[445,390],[440,360],[438,330],[440,300],[445,270],[450,245],
  [475,215],[492,212],[510,218],[528,230],[542,255],[552,285],[558,320],[558,355],[552,385],[540,410],[525,430],[510,442],[492,448],[475,445],[460,430],[450,410],[445,380],[442,350],[442,320],[445,290],[448,260],
  // Middle East
  [560,170],[575,165],[590,170],[600,180],[605,195],[600,210],[590,220],[575,222],[565,215],[558,205],
  // India
  [640,210],[660,215],[680,225],[695,245],[690,270],[675,285],[660,280],[648,265],[640,245],
  // Southeast Asia
  [695,200],[715,195],[735,200],[750,210],[760,225],[765,245],[760,265],[750,280],[735,285],[720,280],[708,265],[700,245],[698,225],
  // East Asia
  [720,140],[740,130],[760,125],[780,130],[800,140],[815,155],[825,170],[828,190],[820,205],[805,215],[785,220],[765,215],[748,205],[735,190],[728,170],[725,150],
  // Japan
  [835,110],[848,105],[858,115],[860,130],[855,145],[845,140],[835,130],[832,120],
  // Indonesia
  [710,285],[730,290],[750,295],[770,300],[790,305],[810,310],[820,315],[825,325],[820,335],[800,340],[775,340],[750,335],[730,325],[718,310],[712,300],
  // Australia
  [820,345],[845,335],[870,340],[895,355],[910,380],[915,410],[908,440],[890,458],[865,465],[840,460],[820,445],[805,425],[795,400],[790,375],[800,355],
  // New Zealand
  [920,440],[932,435],[942,445],[940,460],[928,468],[918,458],
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  return { x: ((lng + 180) / 360) * WORLD_MAP_W, y: ((90 - lat) / 180) * WORLD_MAP_H }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function getAlbumPosition(album: { id: string; title: string; meta?: { location: { lat: number; lng: number; label: string }; dateRange: { start: string; end?: string } } | null }) {
  if (album.meta) {
    return {
      lat: album.meta.location.lat,
      lng: album.meta.location.lng,
      label: album.meta.location.label,
      dateStart: album.meta.dateRange.start,
      dateEnd: album.meta.dateRange.end,
      hasMeta: true,
    }
  }
  const h = hashString(album.id)
  const lat = ((h % 180) - 90)
  const lng = ((Math.floor(h / 180) % 360) - 180)
  const yearOffset = (h % 60) * 30 * 24 * 60 * 60 * 1000
  const startDate = new Date("2020-01-01").getTime() + yearOffset
  const startStr = new Date(startDate).toISOString().slice(0, 7)
  const hasEnd = h % 3 === 0
  const endOffset = hasEnd ? (h % 24) * 30 * 24 * 60 * 60 * 1000 : 0
  const endStr = hasEnd ? new Date(startDate + endOffset).toISOString().slice(0, 7) : undefined
  return { lat, lng, label: album.title, dateStart: startStr, dateEnd: endStr, hasMeta: false }
}

function MushroomCap({ x, y, size, color, active, onClick }: { x: number; y: number; size: number; color: string; active: boolean; onClick: () => void }) {
  return (
    <g className="cursor-pointer" onClick={onClick} role="button" aria-label="album" tabIndex={0}>
      <circle cx={x} cy={y} r={size * 0.5} fill={color} opacity={active ? 1 : 0.7} />
      <ellipse cx={x} cy={y - size * 0.15} rx={size * 0.4} ry={size * 0.35} fill={color} opacity={active ? 0.9 : 0.6} />
      {active && (
        <>
          <circle cx={x} cy={y} r={size * 1.2} fill={color} opacity={0.2} />
          <circle cx={x} cy={y} r={size * 2.0} fill={color} opacity={0.06} />
          <circle cx={x} cy={y} r={size * 0.15} fill="white" opacity={0.9} />
          <circle cx={x - size * 0.2} cy={y - size * 0.2} r={size * 0.08} fill="white" opacity={0.6} />
          <circle cx={x + size * 0.15} cy={y - size * 0.15} r={size * 0.06} fill="white" opacity={0.5} />
        </>
      )}
    </g>
  )
}

export default function AlbumNavigation() {
  const router = useRouter()
  const { albums } = useAlbums()
  const [view, setView] = useState<"map" | "timeline">("map")
  const [hoveredAlbum, setHoveredAlbum] = useState<string | null>(null)

  const positionedAlbums = useMemo(() => {
    return albums.map((album) => ({ album, pos: getAlbumPosition(album) }))
  }, [albums])

  const sortedByDate = useMemo(() => {
    return [...positionedAlbums].sort((a, b) => new Date(a.pos.dateStart).getTime() - new Date(b.pos.dateStart).getTime())
  }, [positionedAlbums])

  const timelineStart = useMemo(() => new Date("2020-01-01").getTime(), [])
  const timelineEnd = useMemo(() => new Date("2025-12-31").getTime(), [])
  const timelineRange = timelineEnd - timelineStart

  const dateToX = (dateStr: string, endStr?: string) => {
    const start = new Date(dateStr).getTime()
    const end = endStr ? new Date(endStr).getTime() : start
    const mid = (start + end) / 2
    return ((mid - timelineStart) / timelineRange) * 100
  }

  const dateToWidth = (dateStr: string, endStr?: string) => {
    const start = new Date(dateStr).getTime()
    const end = endStr ? new Date(endStr).getTime() : start
    return Math.max(2, ((end - start) / timelineRange) * 100)
  }

  const handleAlbumClick = useCallback((albumId: string) => {
    router.push(`/personal/albums/${albumId}`)
  }, [router])

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
      {/* View toggle buttons */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button onClick={() => setView("map")} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${view === "map" ? "bg-teal-600/80 text-white shadow-lg" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>
            <Map className="h-4 w-4" /> Constellation Map
          </button>
          <button onClick={() => setView("timeline")} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${view === "timeline" ? "bg-green-600/80 text-white shadow-lg" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>
            <Timer className="h-4 w-4" /> Life Timeline
          </button>
        </div>
        <span className="text-xs text-slate-400">{albums.length} albums</span>
      </div>

      {/* MAP VIEW */}
      {view === "map" && (
        <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#060a0f]">
          <svg viewBox={`0 0 ${WORLD_MAP_W} ${WORLD_MAP_H}`} className="w-full" style={{ aspectRatio: "2/1" }}>
            <defs>
              <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgb(20, 184, 166)" stopOpacity={0.1} />
                <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity={0} />
              </radialGradient>
              <filter id="starGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <filter id="mushGlow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>

            <rect width={WORLD_MAP_W} height={WORLD_MAP_H} fill="#060a0f" />
            <rect width={WORLD_MAP_W} height={WORLD_MAP_H} fill="url(#mapGlow)" />

            {/* Grid lines */}
            <g opacity={0.1}>
              {Array.from({ length: 18 }, (_, i) => (
                <line key={`vg${i}`} x1={(i / 18) * WORLD_MAP_W} y1={0} x2={(i / 18) * WORLD_MAP_W} y2={WORLD_MAP_H} stroke="rgb(20, 184, 166)" strokeWidth={0.5} />
              ))}
              {Array.from({ length: 9 }, (_, i) => (
                <line key={`hg${i}`} x1={0} y1={(i / 9) * WORLD_MAP_H} x2={WORLD_MAP_W} y2={(i / 9) * WORLD_MAP_H} stroke="rgb(20, 184, 166)" strokeWidth={0.5} />
              ))}
            </g>

            {/* Land dots - constellation style */}
            <g>
              {LAND_DOTS.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={1.2} fill="rgb(20, 184, 166)" opacity={0.5} />
              ))}
            </g>

            {/* Album markers */}
            {positionedAlbums.map(({ album, pos }) => {
              const { x, y } = latLngToSvg(pos.lat, pos.lng)
              const isHovered = hoveredAlbum === album.id
              const size = isHovered ? 10 : 6
              return (
                <g key={album.id} onMouseEnter={() => setHoveredAlbum(album.id)} onMouseLeave={() => setHoveredAlbum(null)}>
                  <MushroomCap x={x} y={y} size={size} color={isHovered ? "rgb(74, 222, 128)" : "rgb(20, 184, 166)"} active={isHovered} onClick={() => handleAlbumClick(album.id)} />
                  {isHovered && (
                    <text x={x} y={y - size - 8} textAnchor="middle" fill="rgb(20, 184, 166)" fontSize={9} fontFamily="Inter, sans-serif" fontWeight={600}>{album.title}</text>
                  )}
                </g>
              )
            })}
          </svg>
          <div className="absolute bottom-3 left-3 text-[10px] text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-400 mr-1" />
            <span className="inline-block w-2 h-3 rounded-full bg-green-400 mr-1" />
            Hover for title · Click to open album
          </div>
        </div>
      )}

      {/* TIMELINE VIEW */}
      {view === "timeline" && (
        <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#060a0f] p-4 sm:p-6">
          <div className="relative" style={{ height: 220 }}>
            {/* Timeline axis */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-gradient-to-r from-transparent via-teal-600/50 to-transparent" />

            {/* Year markers */}
            {[2020, 2021, 2022, 2023, 2024, 2025].map((year) => {
              const x = ((new Date(`${year}-06-01`).getTime() - timelineStart) / timelineRange) * 100
              return (
                <div key={year} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${x}%` }}>
                  <div className="w-px h-4 bg-teal-600/50" />
                  <div className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">{year}</div>
                </div>
              )
            })}

            {/* Album markers */}
            {sortedByDate.map(({ album, pos }, i) => {
              const x = dateToX(pos.dateStart, pos.dateEnd)
              const width = dateToWidth(pos.dateStart, pos.dateEnd)
              const isHovered = hoveredAlbum === album.id
              const isRange = !!pos.dateEnd

              return (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="absolute cursor-pointer"
                  style={{ left: `${x}%`, transform: "translateX(-50%)", top: "50%", marginTop: -10 }}
                  onMouseEnter={() => setHoveredAlbum(album.id)}
                  onMouseLeave={() => setHoveredAlbum(null)}
                  onClick={() => handleAlbumClick(album.id)}
                >
                  {/* Range line */}
                  {isRange && (
                    <div className="absolute top-1/2 -translate-y-1/2 rounded" style={{
                      left: `-${width / 2}%`, width: `${width}%`, height: 3,
                      background: isHovered ? "rgb(74, 222, 128)" : "rgb(20, 184, 166)",
                      opacity: isHovered ? 0.7 : 0.3,
                    }} />
                  )}
                  {/* Mushroom marker */}
                  <MushroomCap
                    x={0} y={0}
                    size={isHovered ? 14 : 9}
                    color={isHovered ? "rgb(74, 222, 128)" : "rgb(20, 184, 166)"}
                    active={isHovered}
                    onClick={() => handleAlbumClick(album.id)}
                  />
                  {/* Tooltip */}
                  {isHovered && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 whitespace-nowrap rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-teal-300 backdrop-blur-sm dark:bg-slate-950/90"
                      style={{ zIndex: 50 }}>
                      <div className="font-semibold">{album.title}</div>
                      <div className="text-slate-400">{formatDate(pos.dateStart)}{pos.dateEnd ? ` — ${formatDate(pos.dateEnd)}` : ""}</div>
                      <div className="text-slate-500">{pos.label}</div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-teal-400" /> Single date</div>
            <div className="flex items-center gap-2"><div className="h-1 w-8 rounded bg-teal-400/50" /> Date range</div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
