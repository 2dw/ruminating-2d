"use client"

import { useState, useMemo, useCallback, useEffect, type ReactNode, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { MapIcon, Timer, Search, MapPin, X, RotateCcw } from "lucide-react"
import { useAlbums } from "@/contexts/albums-context"
import { resolveAlbumMeta } from "@/config/albums"
import { WORLD_COUNTRIES, WORLD_MAP_W, WORLD_MAP_H, latToY, lngToX } from "@/components/world-map-data"

const TIMELINE_H = 360
const AXIS_Y = 180
const LANE_H = 34
const LANE_GAP = 78
const MAP_MIN_GAP = 17

type AlbumMeta = {
  location: { lat: number; lng: number; label: string } | null
  dateRange: { start: string; end?: string; ongoing?: boolean } | null
}

function getAlbumMeta(album: { id: string; title: string; meta?: AlbumMeta | null }): AlbumMeta {
  if (album.meta) return album.meta
  return resolveAlbumMeta(album)
}

function formatDateRange(range: { start: string; end?: string; ongoing?: boolean }): string {
  if (!range.end || range.end === range.start) return range.start
  if (range.ongoing) return `${range.start} to now`
  return `${range.start} to ${range.end}`
}

function parseYearQuery(text: string): { y0: number; y1: number } | null {
  const nums = Array.from(text.matchAll(/(\d{4})/g), (m) => parseInt(m[1], 10))
  if (nums.length === 0) return null
  return { y0: Math.min(...nums), y1: Math.max(...nums) }
}

function matchesWhen(range: AlbumMeta["dateRange"], text: string): boolean {
  const t = text.trim()
  if (!t) return true
  if (!range) return false
  const parsed = parseYearQuery(t)
  if (parsed) {
    const start = parseInt(range.start, 10)
    const end = parseInt(range.end || range.start, 10)
    return start <= parsed.y1 && end >= parsed.y0
  }
  return formatDateRange(range).toLowerCase().includes(t.toLowerCase())
}

function matchesWhere(meta: AlbumMeta, title: string, text: string): boolean {
  const t = text.trim().toLowerCase()
  if (!t) return true
  const label = meta.location?.label.toLowerCase() ?? ""
  return label.includes(t) || title.toLowerCase().includes(t)
}

function MushroomCap({
  x,
  y,
  size,
  color,
  active,
  onClick,
  label,
}: {
  x: number
  y: number
  size: number
  color: string
  active: boolean
  onClick: () => void
  label: string
}) {
  const s = size
  return (
    <g
      className="cursor-pointer"
      onClick={onClick}
      role="button"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {active && <circle cx={x} cy={y} r={s * 2.2} fill={color} opacity={0.12} />}
      {active && <circle cx={x} cy={y} r={s * 1.3} fill={color} opacity={0.22} />}
      <ellipse cx={x} cy={y + s * 0.45} rx={s * 0.22} ry={s * 0.42} fill={color} opacity={active ? 0.95 : 0.8} />
      <path
        d={`M ${x - s} ${y + s * 0.12} A ${s} ${s * 0.82} 0 0 1 ${x + s} ${y + s * 0.12} Z`}
        fill={color}
        opacity={active ? 1 : 0.85}
      />
      <circle cx={x - s * 0.32} cy={y - s * 0.3} r={s * 0.17} fill="white" opacity={active ? 0.85 : 0.45} />
      <circle cx={x + s * 0.28} cy={y - s * 0.12} r={s * 0.11} fill="white" opacity={active ? 0.7 : 0.35} />
      <circle cx={x} cy={y + s * 0.12} r={s * 0.09} fill="white" opacity={active ? 0.6 : 0.3} />
    </g>
  )
}

function ViewToggle({
  view,
  onChange,
}: {
  view: "map" | "timeline"
  onChange: (v: "map" | "timeline") => void
}) {
  const item = (
    active: boolean,
    onClick: () => void,
    icon: ReactNode,
    children: ReactNode,
    activeClass: string,
  ) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
        active
          ? activeClass
          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      }`}
    >
      {icon}
      {children}
    </button>
  )
  return (
    <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {item(
        view === "map",
        () => onChange("map"),
        <MapIcon className="h-4 w-4" />,
        "Constellation Map",
        "bg-teal-600/80 text-white shadow-lg",
      )}
      {item(
        view === "timeline",
        () => onChange("timeline"),
        <Timer className="h-4 w-4" />,
        "Life Timeline",
        "bg-green-600/80 text-white shadow-lg",
      )}
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onRemove}
      className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-100 dark:bg-teal-900/40 dark:text-teal-300 dark:hover:bg-teal-900/70"
      aria-label={`Remove filter ${label}`}
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  )
}

export default function AlbumNavigation() {
  const router = useRouter()
  const { albums, loading } = useAlbums()
  const [view, setView] = useState<"map" | "timeline">("map")
  const [mode, setMode] = useState<"collapsed" | "results">("collapsed")
  const [field, setField] = useState<"where" | "when" | null>(null)
  const [where, setWhere] = useState("")
  const [when, setWhen] = useState("")
  const [hoveredAlbum, setHoveredAlbum] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requested = params.get("view")
    if (requested === "timeline" || requested === "map") {
      setView(requested)
      setMode("results")
    }
    const focusParam = params.get("focus")
    if (focusParam === "where" || focusParam === "when") setField(focusParam)
  }, [])

  const items = useMemo(() => albums.map((album) => ({ album, meta: getAlbumMeta(album) })), [albums])

  const filtered = useMemo(
    () =>
      items.filter(
        ({ album, meta }) => matchesWhere(meta, album.title, where) && matchesWhen(meta.dateRange, when),
      ),
    [items, where, when],
  )

  const stats = useMemo(() => {
    let min = Number.MAX_SAFE_INTEGER
    let max = Number.MIN_SAFE_INTEGER
    const places = new Set<string>()
    for (const { meta } of items) {
      if (meta.location) places.add(meta.location.label)
      if (meta.dateRange) {
        min = Math.min(min, parseInt(meta.dateRange.start, 10))
        max = Math.max(max, parseInt(meta.dateRange.end || meta.dateRange.start, 10))
      }
    }
    return {
      total: items.length,
      places: places.size,
      span: min <= max ? `${min} to ${max}` : "",
    }
  }, [items])

  const whereSuggestions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const { album, meta } of items) {
      if (!matchesWhen(meta.dateRange, when)) continue
      const label = meta.location?.label
      if (!label) continue
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
    const t = where.trim().toLowerCase()
    return Array.from(counts.entries())
      .filter(([label]) => label.toLowerCase().includes(t))
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }, [items, where, when])

  const whenSuggestions = useMemo(() => {
    const counts = new Map<number, number>()
    for (const { album, meta } of items) {
      if (!matchesWhere(meta, album.title, where)) continue
      if (!meta.dateRange) continue
      const start = parseInt(meta.dateRange.start, 10)
      const end = parseInt(meta.dateRange.end || meta.dateRange.start, 10)
      for (let y = start; y <= end; y++) counts.set(y, (counts.get(y) ?? 0) + 1)
    }
    const t = when.trim()
    const parsed = parseYearQuery(t)
    return Array.from(counts.entries())
      .filter(([year]) => (parsed ? year >= parsed.y0 && year <= parsed.y1 : String(year).includes(t)))
      .sort((a, b) => a[0] - b[0])
  }, [items, where, when])

  const openResults = useCallback(() => {
    setField(null)
    setMode("results")
  }, [])

  const resetAll = useCallback(() => {
    setWhere("")
    setWhen("")
    setField(null)
    setMode("collapsed")
  }, [])

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      openResults()
    },
    [openResults],
  )

  const mapPoints = useMemo(() => {
    const pts = filtered
      .filter((item) => item.meta.location)
      .map((item) => {
        const ox = lngToX(item.meta.location!.lng)
        const oy = latToY(item.meta.location!.lat)
        return { ...item, ox, oy, x: ox, y: oy }
      })

    for (let iter = 0; iter < 160; iter++) {
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i]
          const b = pts[j]
          let dx = b.x - a.x
          let dy = b.y - a.y
          let d = Math.hypot(dx, dy)
          if (d < 0.001) {
            dx = Math.random() - 0.5
            dy = Math.random() - 0.5
            d = Math.hypot(dx, dy) || 1
          }
          if (d < MAP_MIN_GAP) {
            const push = (MAP_MIN_GAP - d) / 2
            const ux = dx / d
            const uy = dy / d
            a.x -= ux * push
            a.y -= uy * push
            b.x += ux * push
            b.y += uy * push
          }
        }
      }
      for (const p of pts) {
        p.x += (p.ox - p.x) * 0.015
        p.y += (p.oy - p.y) * 0.015
        p.x = Math.max(8, Math.min(WORLD_MAP_W - 8, p.x))
        p.y = Math.max(8, Math.min(WORLD_MAP_H - 8, p.y))
      }
    }
    return pts
  }, [filtered])

  const timeline = useMemo(() => {
    const ranged = filtered.filter((item) => item.meta.dateRange)
    if (ranged.length === 0) return null

    let minYear = Number.MAX_SAFE_INTEGER
    let maxYear = Number.MIN_SAFE_INTEGER
    for (const { meta } of ranged) {
      const range = meta.dateRange!
      minYear = Math.min(minYear, parseInt(range.start, 10))
      maxYear = Math.max(maxYear, parseInt(range.end || range.start, 10))
    }
    const t0 = minYear
    const t1 = maxYear + 1
    const yearToX = (year: number) => ((year - t0) / (t1 - t0)) * WORLD_MAP_W

    const placed = ranged
      .map(({ album, meta }) => {
        const range = meta.dateRange!
        const start = parseInt(range.start, 10)
        const end = parseInt(range.end || range.start, 10)
        return {
          album,
          meta,
          range,
          x: yearToX(start + 0.5),
          xStart: yearToX(start),
          xEnd: yearToX(end + 1),
          lane: 0,
          y: AXIS_Y,
        }
      })
      .sort((a, b) => a.x - b.x)

    const laneLastX: number[] = []
    for (const entry of placed) {
      let lane = laneLastX.findIndex((last) => entry.x - last >= LANE_GAP)
      if (lane === -1) {
        lane = laneLastX.length
        laneLastX.push(0)
      }
      laneLastX[lane] = entry.x
      entry.lane = lane
      const dir = lane % 2 === 0 ? -1 : 1
      entry.y = AXIS_Y + dir * (Math.floor(lane / 2) + 1) * LANE_H
    }

    const years: number[] = []
    for (let y = t0; y <= maxYear; y++) years.push(y)

    return { placed, years, minYear, maxYear, yearToX }
  }, [filtered])

  const hovered = useMemo(
    () => filtered.find((i) => i.album.id === hoveredAlbum) || null,
    [filtered, hoveredAlbum],
  )
  const hoveredMapPoint = useMemo(
    () => mapPoints.find((p) => p.album.id === hoveredAlbum) || null,
    [mapPoints, hoveredAlbum],
  )
  const hoveredTimeline = useMemo(
    () => timeline?.placed.find((p) => p.album.id === hoveredAlbum) || null,
    [timeline, hoveredAlbum],
  )

  const activeChips: { key: string; label: string; remove: () => void }[] = []
  if (where.trim()) activeChips.push({ key: "where", label: `Where: ${where.trim()}`, remove: () => setWhere("") })
  if (when.trim()) activeChips.push({ key: "when", label: `When: ${when.trim()}`, remove: () => setWhen("") })

  const suggestionPanel = field && (
    <motion.div
      key={field}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/95 dark:shadow-black/40">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
          {field === "where" ? "Destinations" : "Years"}
        </div>

        {field === "where" ? (
          whereSuggestions.length ? (
            <ul className="max-h-64 overflow-y-auto">
              {whereSuggestions.map(([label, count]) => (
                <li key={label}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setWhere(label)
                      setField("when")
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      where.trim() === label
                        ? "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70"
                    }`}
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-teal-500" />
                    <span className="flex-1 truncate">{label}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {count} {count === 1 ? "album" : "albums"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-6 text-sm text-slate-400">
              No destinations match those years. Clear the years to see every place.
            </p>
          )
        ) : whenSuggestions.length ? (
          <div className="flex flex-wrap gap-2 px-2 pb-2 pt-1">
            {whenSuggestions.map(([year, count]) => (
              <button
                key={year}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setWhen(String(year))
                  setField(null)
                }}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                  when.trim() === String(year)
                    ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                    : "border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-teal-700 dark:hover:text-teal-300"
                }`}
              >
                {year}
                <span className="text-xs opacity-60">{count}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="px-3 py-6 text-sm text-slate-400">
            No years hold albums for that destination. Clear the destination to browse every year.
          </p>
        )}
      </div>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className="min-w-0 flex-1"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setField(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setField(null)
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="flex items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-teal-400 focus-within:shadow-md focus-within:shadow-teal-500/10 dark:border-slate-700 dark:bg-slate-950/80 dark:focus-within:border-teal-600"
          >
          <label className="min-w-0 flex-1 px-4 py-2.5">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              Where
            </span>
            <span className="flex items-center gap-2">
              <input
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                onFocus={() => setField("where")}
                placeholder="Search destinations"
                aria-label="Search by destination"
                className="w-full bg-transparent py-0.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-600"
              />
              {where && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setWhere("")}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  aria-label="Clear destination"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          </label>

          <div className="w-px bg-slate-200 dark:bg-slate-800" />

          <label className="min-w-0 flex-1 px-4 py-2.5">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              When
            </span>
            <span className="flex items-center gap-2">
              <input
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                onFocus={() => setField("when")}
                placeholder="Add a year or range"
                aria-label="Search by year"
                className="w-full bg-transparent py-0.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-600"
              />
              {when && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setWhen("")}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  aria-label="Clear years"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          </label>

          <button
            type="submit"
            className="m-1.5 flex items-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-500 active:scale-[0.98]"
            aria-label="Search albums"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

          <AnimatePresence initial={false} mode="wait">
            {suggestionPanel}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4 sm:pl-2">
          <div className="text-right">
            <div className="text-4xl font-serif font-bold leading-none text-teal-600 dark:text-teal-400">
              {mode === "results" ? filtered.length : stats.total}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              {mode === "results" ? "Matching" : "Albums"}
            </div>
          </div>
          <div className="h-11 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {mode === "results" ? (
              <>
                of {stats.total} total
                <br />
                {stats.span}
              </>
            ) : (
              <>
                {stats.span}
                <br />
                {stats.places} destinations
              </>
            )}
          </div>
        </div>
      </div>

      {mode === "results" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <ViewToggle view={view} onChange={setView} />
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <FilterChip key={chip.key} label={chip.label} onRemove={chip.remove} />
              ))}
              {(activeChips.length > 0 || mode === "results") && (
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear search
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
              <MapIcon className="mx-auto mb-3 h-7 w-7 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No albums match this search yet. Adjust the destination or years above.
              </p>
              <button
                onClick={resetAll}
                className="mt-4 rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                Clear search
              </button>
            </div>
          ) : view === "map" ? (
            <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-[#060a0f] dark:border-slate-700">
              <svg
                viewBox={`0 0 ${WORLD_MAP_W} ${WORLD_MAP_H}`}
                className="block w-full"
                role="img"
                aria-label="World map of album locations"
              >
                <defs>
                  <radialGradient id="mapGlow" cx="50%" cy="45%" r="65%">
                    <stop offset="0%" stopColor="rgb(20, 184, 166)" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity={0} />
                  </radialGradient>
                  <filter id="landGlow" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur stdDeviation="1.4" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <rect width={WORLD_MAP_W} height={WORLD_MAP_H} fill="#060a0f" />
                <rect width={WORLD_MAP_W} height={WORLD_MAP_H} fill="url(#mapGlow)" />

                <g opacity={0.07} stroke="rgb(20, 184, 166)" strokeWidth={0.5}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <line
                      key={`v${i}`}
                      x1={((i + 1) * WORLD_MAP_W) / 12}
                      y1={0}
                      x2={((i + 1) * WORLD_MAP_W) / 12}
                      y2={WORLD_MAP_H}
                    />
                  ))}
                  {Array.from({ length: 7 }, (_, i) => (
                    <line key={`h${i}`} x1={0} y1={(i * WORLD_MAP_H) / 6} x2={WORLD_MAP_W} y2={(i * WORLD_MAP_H) / 6} />
                  ))}
                </g>

                <g filter="url(#landGlow)">
                  {WORLD_COUNTRIES.map((country) => (
                    <path
                      key={country.name}
                      d={country.d}
                      fill="rgba(20, 184, 166, 0.10)"
                      stroke="rgba(45, 212, 191, 0.45)"
                      strokeWidth={0.5}
                      strokeLinejoin="round"
                    />
                  ))}
                </g>

                {mapPoints.map((p) => {
                  if (Math.hypot(p.x - p.ox, p.y - p.oy) <= 6) return null
                  return (
                    <g key={`lead-${p.album.id}`}>
                      <line
                        x1={p.ox}
                        y1={p.oy}
                        x2={p.x}
                        y2={p.y}
                        stroke="rgba(45, 212, 191, 0.35)"
                        strokeWidth={0.6}
                        strokeDasharray="2 2"
                      />
                      <circle cx={p.ox} cy={p.oy} r={1.6} fill="rgba(45, 212, 191, 0.7)" />
                    </g>
                  )
                })}

                {mapPoints.map((p) => {
                  const isHovered = hoveredAlbum === p.album.id
                  return (
                    <g
                      key={p.album.id}
                      onMouseEnter={() => setHoveredAlbum(p.album.id)}
                      onMouseLeave={() => setHoveredAlbum(null)}
                    >
                      <MushroomCap
                        x={p.x}
                        y={p.y}
                        size={isHovered ? 9 : 6}
                        color={isHovered ? "rgb(74, 222, 128)" : "rgb(20, 184, 166)"}
                        active={isHovered}
                        onClick={() => router.push(`/personal/albums/${p.album.id}`)}
                        label={`${p.album.title}, open album`}
                      />
                      {isHovered && (
                        <text
                          x={p.x}
                          y={p.y - 13}
                          textAnchor="middle"
                          fill="rgb(153, 246, 228)"
                          fontSize={9}
                          fontFamily="Inter, sans-serif"
                          fontWeight={600}
                        >
                          {p.album.title}
                        </text>
                      )}
                    </g>
                  )
                })}
              </svg>

              {hoveredMapPoint && hovered && (
                <div
                  className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm"
                  style={{
                    left: `${Math.min(88, Math.max(12, (hoveredMapPoint.x / WORLD_MAP_W) * 100))}%`,
                    top: `${((hoveredMapPoint.y - 14) / WORLD_MAP_H) * 100}%`,
                    marginTop: -6,
                  }}
                >
                  <div className="font-semibold text-teal-200">{hovered.album.title}</div>
                  {hovered.meta.location && <div className="text-slate-400">{hovered.meta.location.label}</div>}
                  {hovered.meta.dateRange && (
                    <div className="text-slate-500">{formatDateRange(hovered.meta.dateRange)}</div>
                  )}
                </div>
              )}

              <div className="absolute bottom-3 left-3 text-[10px] text-slate-500">
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-teal-400" />
                Hover for details, click to open the album
              </div>
            </div>
          ) : timeline ? (
            <div className="relative w-full overflow-x-auto rounded-2xl border border-slate-200 bg-[#060a0f] p-4 dark:border-slate-700 sm:p-6">
              <div className="relative" style={{ minWidth: 720 }}>
                <svg
                  viewBox={`0 0 ${WORLD_MAP_W} ${TIMELINE_H}`}
                  className="block w-full"
                  role="img"
                  aria-label="Timeline of albums by year"
                >
                  <defs>
                    <linearGradient id="axisFade" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgb(20, 184, 166)" stopOpacity={0} />
                      <stop offset="8%" stopColor="rgb(20, 184, 166)" stopOpacity={0.6} />
                      <stop offset="92%" stopColor="rgb(20, 184, 166)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <g>
                    {timeline.years.map((year) => {
                      const x = timeline.yearToX(year)
                      const major = (year - timeline.minYear) % 5 === 0 || year === timeline.maxYear
                      return (
                        <g key={year}>
                          <line
                            x1={x}
                            y1={AXIS_Y - (major ? 10 : 5)}
                            x2={x}
                            y2={AXIS_Y + (major ? 10 : 5)}
                            stroke="rgb(20, 184, 166)"
                            strokeWidth={major ? 1 : 0.5}
                            opacity={major ? 0.6 : 0.3}
                          />
                          {major && (
                            <text
                              x={x}
                              y={AXIS_Y + 24}
                              textAnchor={x < 24 ? "start" : x > WORLD_MAP_W - 24 ? "end" : "middle"}
                              fill="rgb(148, 163, 184)"
                              fontSize={11}
                              fontFamily="Inter, sans-serif"
                            >
                              {year}
                            </text>
                          )}
                        </g>
                      )
                    })}
                    <line x1={0} y1={AXIS_Y} x2={WORLD_MAP_W} y2={AXIS_Y} stroke="url(#axisFade)" strokeWidth={1.5} />
                  </g>

                  {timeline.placed.map((entry) =>
                    entry.range.end && entry.range.end !== entry.range.start ? (
                      <line
                        key={`bar-${entry.album.id}`}
                        x1={entry.xStart}
                        y1={AXIS_Y}
                        x2={entry.xEnd}
                        y2={AXIS_Y}
                        stroke={hoveredAlbum === entry.album.id ? "rgb(74, 222, 128)" : "rgb(20, 184, 166)"}
                        strokeWidth={4}
                        strokeLinecap="round"
                        opacity={hoveredAlbum === entry.album.id ? 0.9 : 0.4}
                      />
                    ) : null,
                  )}

                  {timeline.placed.map((entry) => {
                    const isHovered = hoveredAlbum === entry.album.id
                    const dir = entry.y > AXIS_Y ? 1 : -1
                    const color = isHovered ? "rgb(74, 222, 128)" : "rgb(20, 184, 166)"
                    return (
                      <g
                        key={entry.album.id}
                        onMouseEnter={() => setHoveredAlbum(entry.album.id)}
                        onMouseLeave={() => setHoveredAlbum(null)}
                      >
                        <line
                          x1={entry.x}
                          y1={AXIS_Y}
                          x2={entry.x}
                          y2={entry.y - dir * 6}
                          stroke={color}
                          strokeWidth={0.8}
                          opacity={isHovered ? 0.8 : 0.35}
                        />
                        <MushroomCap
                          x={entry.x}
                          y={entry.y}
                          size={isHovered ? 9 : 7}
                          color={color}
                          active={isHovered}
                          onClick={() => router.push(`/personal/albums/${entry.album.id}`)}
                          label={`${entry.album.title}, open album`}
                        />
                        <text
                          x={entry.x}
                          y={entry.y + dir * 17}
                          textAnchor="middle"
                          fill={isHovered ? "rgb(153, 246, 228)" : "rgb(148, 163, 184)"}
                          fontSize={9.5}
                          fontFamily="Inter, sans-serif"
                        >
                          {formatDateRange(entry.range)}
                        </text>
                      </g>
                    )
                  })}
                </svg>

                {hoveredTimeline && hovered && (
                  <div
                    className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm"
                    style={{
                      left: `${Math.min(88, Math.max(12, (hoveredTimeline.x / WORLD_MAP_W) * 100))}%`,
                      top: `${((hoveredTimeline.y - 20) / TIMELINE_H) * 100}%`,
                      marginTop: -6,
                    }}
                  >
                    <div className="font-semibold text-teal-200">{hovered.album.title}</div>
                    {hovered.meta.location && <div className="text-slate-400">{hovered.meta.location.label}</div>}
                    <div className="text-slate-500">{formatDateRange(hoveredTimeline.range)}</div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-teal-400" /> Album marker
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-1 w-8 rounded bg-teal-400/50" /> Multi year collection
                </span>
                <span>Hover for details, click to open the album</span>
              </div>
            </div>
          ) : null}
        </motion.div>
      )}

      {loading && albums.length === 0 && (
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">Charting the collection...</p>
      )}
    </motion.div>
  )
}




