"use client"

/**
 * app/professional/endeavors/energy/page.tsx
 * Full home energy dashboard with:
 *  - Animated electron flow diagram (SVG, CSS animations)
 *  - Interactive stock-market-style time series (Plotly with full interactivity)
 *  - Solar forecast correlated with weather
 *  - TOU cost savings tracker
 *  - Live stat cards with hover details
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Zap, Eye, Lock, Sun, Battery,
  Activity, Thermometer, DollarSign, Cloud,
  TrendingUp, ToggleLeft, ToggleRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

// ── Types ─────────────────────────────────────────────────────────────────────

interface LiveReading {
  timestamp: number
  timestamp_iso: string
  soc: number
  soh: number
  power_in: number
  power_out: number
  solar_in: number
  ac_in: number
  ac_out: number
  temp_c: number
  remain_dsg_min: number
  remain_chg_min: number
  min_dsg_soc: number
  max_chg_soc: number
}

interface HistoryPoint {
  timestamp_iso: string
  soc: number
  solar_in: number
  power_out: number
  power_in: number
  temp_c: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function formatRuntime(m: number) {
  if (!m) return "—"
  const h = Math.floor(m / 60), min = m % 60
  return h === 0 ? `${min}m` : min === 0 ? `${h}h` : `${h}h ${min}m`
}

function socColor(soc: number) {
  return soc >= 70 ? "#4ade80" : soc >= 30 ? "#fbbf24" : "#f87171"
}

// PG&E E-TOU-C: peak 4-9pm every day
function getCurrentRate(date = new Date()) {
  const h = date.getHours()
  const summer = date.getMonth() >= 5 && date.getMonth() <= 8
  const peak = h >= 16 && h < 21
  if (summer) return peak ? 0.52 : 0.28
  return peak ? 0.43 : 0.26
}

// ── Animated Electron Flow ────────────────────────────────────────────────────

function ElectronFlow({ live }: { live: LiveReading | null }) {
  const soc = live?.soc ?? 50
  const solar = live?.solar_in ?? 0
  const gridIn = live?.ac_in ?? 0
  const acOut = Math.abs(live?.ac_out ?? 0)
  const isCharging = (live?.power_in ?? 0) > (live?.power_out ?? 0)
  const hasSolar = solar > 10
  const hasGrid = gridIn > 10
  const col = socColor(soc)

  // Flow intensities — control animation speed
  const solarSpeed = hasSolar ? Math.max(0.8, 2.5 - solar / 400) : 0
  const gridSpeed = hasGrid ? Math.max(0.8, 2.5 - gridIn / 600) : 0
  const outSpeed = acOut > 10 ? Math.max(0.8, 2.5 - acOut / 400) : 0

  return (
    <div className="relative w-full" style={{ minHeight: 280 }}>
      <style>{`
        @keyframes flow-right { from { stroke-dashoffset: 40 } to { stroke-dashoffset: 0 } }
        @keyframes flow-left  { from { stroke-dashoffset: 0  } to { stroke-dashoffset: 40 } }
        @keyframes flow-down  { from { stroke-dashoffset: 40 } to { stroke-dashoffset: 0 } }
        @keyframes electron-pulse { 0%,100% { r: 3; opacity: 0.9 } 50% { r: 5; opacity: 0.5 } }
        @keyframes glow-pulse { 0%,100% { filter: drop-shadow(0 0 4px currentColor) }
                                 50% { filter: drop-shadow(0 0 10px currentColor) } }
        .flow-solar { animation: flow-right ${solarSpeed}s linear infinite; }
        .flow-grid  { animation: flow-right ${gridSpeed}s linear infinite; }
        .flow-out   { animation: flow-right ${outSpeed}s linear infinite; }
        .flow-bat   { animation: ${isCharging ? 'flow-right' : 'flow-left'} 1.8s linear infinite; }
        .node-glow  { animation: glow-pulse 2s ease-in-out infinite; }
      `}</style>

      <svg viewBox="0 0 600 260" className="w-full h-full" style={{ maxHeight: 280 }}>

        {/* ── Node positions:
              Solar(80,60)  Battery(300,130)  Grid(520,60)
                                House(300,220)
        ── */}

        {/* Connection lines */}
        {/* Solar → Battery */}
        <line x1="130" y1="80" x2="250" y2="130" stroke={hasSolar ? "#fbbf24" : "#374151"} strokeWidth="2.5" strokeDasharray="8 6">
          {hasSolar && <animate attributeName="stroke-dashoffset" from="40" to="0" dur={`${solarSpeed}s`} repeatCount="indefinite" />}
        </line>

        {/* Grid → Battery */}
        <line x1="470" y1="80" x2="350" y2="130" stroke={hasGrid ? "#60a5fa" : "#374151"} strokeWidth="2.5" strokeDasharray="8 6">
          {hasGrid && <animate attributeName="stroke-dashoffset" from="40" to="0" dur={`${gridSpeed}s`} repeatCount="indefinite" />}
        </line>

        {/* Battery → House */}
        <line x1="300" y1="155" x2="300" y2="200" stroke={col} strokeWidth="3" strokeDasharray="8 6">
          {acOut > 10 && <animate attributeName="stroke-dashoffset" from="40" to="0" dur={`${outSpeed}s`} repeatCount="indefinite" />}
        </line>

        {/* House → Grid (export, if any) */}
        <line x1="330" y1="210" x2="490" y2="90" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="5 8" strokeOpacity="0.4" />

        {/* ── Solar node ── */}
        <g className="node-glow" style={{ color: "#fbbf24" }}>
          <circle cx="80" cy="65" r="36" fill="#1f1a08" stroke="#fbbf24" strokeWidth={hasSolar ? "2.5" : "1"} strokeOpacity={hasSolar ? 1 : 0.3} />
          {/* Sun rays */}
          {hasSolar && [0,45,90,135,180,225,270,315].map(a => (
            <line key={a}
              x1={80 + 30 * Math.cos(a * Math.PI/180)}
              y1={65 + 30 * Math.sin(a * Math.PI/180)}
              x2={80 + 40 * Math.cos(a * Math.PI/180)}
              y2={65 + 40 * Math.sin(a * Math.PI/180)}
              stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.6" />
          ))}
          <circle cx="80" cy="65" r="16" fill="#fbbf24" fillOpacity={hasSolar ? 0.9 : 0.2} />
          <text x="80" y="112" textAnchor="middle" fill="#fbbf24" fontSize="10" fontFamily="monospace" opacity={hasSolar ? 1 : 0.5}>
            ☀ {solar.toFixed(0)}W
          </text>
        </g>

        {/* ── Battery node ── */}
        <g>
          <circle cx="300" cy="130" r="44" fill="#0a1015" stroke={col} strokeWidth="3" />
          {/* SOC arc */}
          {(() => {
            const r = 36, cx2 = 300, cy2 = 130
            const startAngle = -Math.PI * 0.75
            const endAngle = startAngle + (soc / 100) * Math.PI * 1.5
            const x1 = cx2 + r * Math.cos(startAngle), y1 = cy2 + r * Math.sin(startAngle)
            const x2 = cx2 + r * Math.cos(endAngle),   y2 = cy2 + r * Math.sin(endAngle)
            const large = soc > 50 ? 1 : 0
            return (
              <>
                <path d={`M ${cx2 + r * Math.cos(startAngle)} ${cy2 + r * Math.sin(startAngle)} A ${r} ${r} 0 1 1 ${cx2 + r * Math.cos(-Math.PI*0.75 + Math.PI*1.5)} ${cy2 + r * Math.sin(-Math.PI*0.75 + Math.PI*1.5)}`}
                  fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                  fill="none" stroke={col} strokeWidth="4" strokeLinecap="round" />
              </>
            )
          })()}
          <text x="300" y="125" textAnchor="middle" fill={col} fontSize="16" fontWeight="700" fontFamily="monospace">
            {soc.toFixed(1)}%
          </text>
          <text x="300" y="142" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">SOC</text>
          <text x="300" y="185" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="monospace">
            🔋 Delta Pro 3
          </text>
        </g>

        {/* ── Grid node ── */}
        <g style={{ color: "#60a5fa" }}>
          <circle cx="520" cy="65" r="34" fill="#0a1220" stroke={hasGrid ? "#60a5fa" : "#374151"} strokeWidth={hasGrid ? "2" : "1"} strokeOpacity={hasGrid ? 1 : 0.4} />
          {/* Grid icon lines */}
          {[-10,0,10].map(dx => (
            <g key={dx}>
              <line x1={520+dx} y1="50" x2={520+dx} y2="80" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity={hasGrid ? 0.8 : 0.2} />
              <line x1={510} y1={65+dx} x2={530} y2={65+dx} stroke="#60a5fa" strokeWidth="0.8" strokeOpacity={hasGrid ? 0.4 : 0.1} />
            </g>
          ))}
          <text x="520" y="112" textAnchor="middle" fill="#60a5fa" fontSize="10" fontFamily="monospace" opacity={hasGrid ? 1 : 0.4}>
            ⚡ {hasGrid ? `${gridIn.toFixed(0)}W` : "grid"}
          </text>
        </g>

        {/* ── House node ── */}
        <g>
          <circle cx="300" cy="220" r="30" fill="#0a1015" stroke="#a78bfa" strokeWidth="2" />
          {/* Simple house icon */}
          <polygon points="300,200 284,216 316,216" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
          <rect x="291" y="216" width="18" height="12" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
          <text x="300" y="260" textAnchor="middle" fill="#a78bfa" fontSize="10" fontFamily="monospace">
            🏠 {acOut.toFixed(0)}W
          </text>
        </g>

        {/* ── Flow labels ── */}
        {hasSolar && (
          <text x="175" y="95" textAnchor="middle" fill="#fbbf24" fontSize="9" fontFamily="monospace" opacity="0.8">
            solar charging
          </text>
        )}
        {hasGrid && (
          <text x="425" y="95" textAnchor="middle" fill="#60a5fa" fontSize="9" fontFamily="monospace" opacity="0.8">
            grid in
          </text>
        )}
        {acOut > 10 && (
          <text x="316" y="178" textAnchor="start" fill={col} fontSize="9" fontFamily="monospace" opacity="0.8">
            {isCharging ? "↓ discharging" : "→ supplying"}
          </text>
        )}

        {/* ── Status badge ── */}
        <rect x="10" y="238" width="140" height="18" rx="9" fill="rgba(255,255,255,0.05)" />
        <text x="80" y="251" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="monospace">
          {isCharging ? "● charging" : "● discharging"} · {live ? timeAgo(live.timestamp_iso) : "—"}
        </text>
      </svg>
    </div>
  )
}

// ── Plotly chart config ───────────────────────────────────────────────────────

const LAYOUT_BASE: any = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { color: "#9ca3af", family: "JetBrains Mono, monospace", size: 11 },
  margin: { l: 50, r: 20, t: 24, b: 48 },
  xaxis: {
    gridcolor: "rgba(55,65,81,0.3)", showgrid: true, zeroline: false,
    rangeslider: { visible: true, bgcolor: "rgba(17,24,39,0.6)", bordercolor: "#374151", thickness: 0.08 },
    rangeselector: {
      bgcolor: "rgba(17,24,39,0.8)", bordercolor: "#374151", borderwidth: 1,
      font: { color: "#9ca3af", size: 10 },
      buttons: [
        { count: 3, label: "3h", step: "hour", stepmode: "backward" },
        { count: 6, label: "6h", step: "hour", stepmode: "backward" },
        { count: 1, label: "1d", step: "day", stepmode: "backward" },
        { step: "all", label: "all" },
      ],
    },
  },
  yaxis: { gridcolor: "rgba(55,65,81,0.3)", showgrid: true, zeroline: false },
  legend: {
    bgcolor: "rgba(10,16,21,0.85)", bordercolor: "#374151", borderwidth: 1,
    font: { size: 10 }, orientation: "h" as const, y: -0.22, x: 0,
  },
  hovermode: "x unified" as const,
  hoverlabel: { bgcolor: "#0a1015", bordercolor: "#374151", font: { color: "#e5e7eb", size: 11 } },
  dragmode: "pan" as const,
}

const CONFIG = {
  displayModeBar: true,
  modeBarButtonsToRemove: ["autoScale2d", "lasso2d", "select2d"],
  modeBarButtonsToAdd: [],
  displaylogo: false,
  responsive: true,
  scrollZoom: true,
}

// ── Cost savings ──────────────────────────────────────────────────────────────

function estimateDailySavings(history: HistoryPoint[]): number {
  if (history.length < 2) return 0
  let savings = 0
  for (let i = 1; i < history.length; i++) {
    const dt = new Date(history[i].timestamp_iso)
    const rate = getCurrentRate(dt)
    const dh = (new Date(history[i].timestamp_iso).getTime() - new Date(history[i-1].timestamp_iso).getTime()) / 3_600_000
    // Energy discharged from battery avoids grid purchase at current rate
    const discharged = Math.max(0, history[i].power_out - history[i].solar_in) * dh / 1000
    savings += discharged * rate
  }
  return Math.round(savings * 100) / 100
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, unit, color = "#4ade80", sub }: any) {
  return (
    <Card className="border-green-200 dark:border-green-900/60">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold font-mono" style={{ color }}>
              {value}
              {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
            </p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
          <div className="rounded-xl p-2 bg-green-50 dark:bg-green-950/30">
            <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Toggle button ─────────────────────────────────────────────────────────────

function TraceToggle({ label, color, active, onToggle }: any) {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono
                  border transition-all ${active
                    ? "border-current bg-current/10"
                    : "border-gray-700 text-gray-600 dark:text-gray-500 opacity-50"}`}
      style={{ color: active ? color : undefined }}
    >
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: active ? color : "#374151" }} />
      {label}
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EnergyDashboardPage() {
  const router = useRouter()
  const [live, setLive] = useState<LiveReading | null>(null)
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [showLoginHint, setShowLoginHint] = useState(false)

  // Trace visibility toggles
  const [traces, setTraces] = useState({
    soc: true, solar: true, powerIn: true, powerOut: true, temp: false,
  })

  // Y-axis bounds
  const [socBounds, setSocBounds] = useState({ min: 0, max: 100 })
  const [showEnvelopes, setShowEnvelopes] = useState(true)

  const toggleTrace = (key: keyof typeof traces) =>
    setTraces(prev => ({ ...prev, [key]: !prev[key] }))

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch("/api/ecoflow/latest", { cache: "no-store" })
      if (res.ok) {
        const data: LiveReading = await res.json()
        setLive(data)
        setHistory(prev => {
          const next = [...prev, {
            timestamp_iso: data.timestamp_iso,
            soc: data.soc,
            solar_in: data.solar_in,
            power_out: Math.abs(data.power_out || data.ac_out || 0),
            power_in: data.power_in,
            temp_c: data.temp_c,
          }].slice(-200)
          return next
        })
      }
    } catch (_) {}
    finally { setLoading(false) }
  }, [])

  // Fetch today's R2 daily JSONL for richer history
  const fetchDailyHistory = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const [y, m, d] = today.split("-")
      const key = `telemetry/daily/${y}/${m}/${d}.jsonl`
      const res = await fetch(`/api/ecoflow/admin?action=download&key=${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_ECOFLOW_VIEWER_TOKEN || ""}` },
      })
      if (res.ok) {
        const text = await res.text()
        const pts: HistoryPoint[] = text.trim().split("\n").filter(Boolean).map(l => {
          try {
            const d = JSON.parse(l)
            return { timestamp_iso: d.timestamp_iso, soc: d.soc, solar_in: d.solar_in,
                     power_out: Math.abs(d.power_out || d.ac_out || 0), power_in: d.power_in, temp_c: d.temp_c }
          } catch { return null }
        }).filter(Boolean) as HistoryPoint[]
        if (pts.length > 0) setHistory(pts)
      }
    } catch (_) {}
  }, [])

  useEffect(() => {
    fetchLive()
    fetchDailyHistory()
    const iv = setInterval(fetchLive, 120_000)
    return () => clearInterval(iv)
  }, [fetchLive, fetchDailyHistory])

  // ── Chart data ─────────────────────────────────────────────────────────────

  const times      = history.map(h => h.timestamp_iso)
  const socs       = history.map(h => h.soc)
  const solars     = history.map(h => h.solar_in)
  const pouts      = history.map(h => h.power_out)
  const pins       = history.map(h => h.power_in)
  const temps      = history.map(h => h.temp_c)

  const minSoc     = live?.min_dsg_soc ?? 12
  const maxSoc     = live?.max_chg_soc ?? 100
  const dailySavings = estimateDailySavings(history)
  const currentRate  = getCurrentRate()
  const isPeak       = new Date().getHours() >= 16 && new Date().getHours() < 21

  // Build Plotly traces
  const plotData: any[] = []

  if (traces.soc) plotData.push({
    x: times, y: socs, name: "SOC %", type: "scatter", mode: "lines",
    fill: "tozeroy", fillcolor: "rgba(74,222,128,0.08)",
    line: { color: "#4ade80", width: 2 },
    hovertemplate: "<b>%{y:.1f}%</b> SOC<extra></extra>",
    yaxis: "y",
  })

  // SOC envelope bands
  if (showEnvelopes && traces.soc) {
    plotData.push({
      x: [...times, ...times.slice().reverse()],
      y: [...times.map(() => maxSoc), ...times.map(() => 100)],
      fill: "toself", fillcolor: "rgba(248,113,113,0.06)",
      line: { width: 0 }, showlegend: false, hoverinfo: "skip", yaxis: "y",
      name: "above max",
    })
    plotData.push({
      x: times, y: times.map(() => maxSoc),
      line: { color: "#f87171", width: 1, dash: "dot" },
      mode: "lines", name: `max ${maxSoc}%`, yaxis: "y",
      hovertemplate: `max charge ${maxSoc}%<extra></extra>`,
    })
    plotData.push({
      x: times, y: times.map(() => minSoc),
      line: { color: "#fbbf24", width: 1, dash: "dot" },
      mode: "lines", name: `min ${minSoc}%`, yaxis: "y",
      hovertemplate: `min discharge ${minSoc}%<extra></extra>`,
    })
  }

  if (traces.solar) plotData.push({
    x: times, y: solars, name: "Solar W", type: "bar",
    marker: { color: "rgba(251,191,36,0.7)" },
    hovertemplate: "<b>%{y:.0f}W</b> solar<extra></extra>",
    yaxis: "y2",
  })

  if (traces.powerIn) plotData.push({
    x: times, y: pins, name: "Power In W", type: "scatter", mode: "lines",
    fill: "tozeroy", fillcolor: "rgba(96,165,250,0.1)",
    line: { color: "#60a5fa", width: 1.5 },
    hovertemplate: "<b>%{y:.0f}W</b> in<extra></extra>",
    yaxis: "y2",
  })

  if (traces.powerOut) plotData.push({
    x: times, y: pouts, name: "Power Out W", type: "scatter", mode: "lines",
    fill: "tozeroy", fillcolor: "rgba(248,113,113,0.1)",
    line: { color: "#f87171", width: 1.5 },
    hovertemplate: "<b>%{y:.0f}W</b> out<extra></extra>",
    yaxis: "y2",
  })

  if (traces.temp) plotData.push({
    x: times, y: temps, name: "Temp °C", type: "scatter", mode: "lines",
    line: { color: "#a78bfa", width: 1.5, dash: "dot" },
    hovertemplate: "<b>%{y}°C</b><extra></extra>",
    yaxis: "y3",
  })

  const plotLayout: any = {
    ...LAYOUT_BASE,
    height: 420,
    yaxis: {
      ...LAYOUT_BASE.yaxis,
      title: { text: "SOC %", font: { size: 10 } },
      range: [socBounds.min, socBounds.max],
      domain: [0.35, 1],
    },
    yaxis2: {
      ...LAYOUT_BASE.yaxis,
      title: { text: "Watts", font: { size: 10 } },
      domain: [0, 0.30],
      overlaying: undefined,
    },
    yaxis3: traces.temp ? {
      overlaying: "y2" as const,
      side: "right" as const,
      gridcolor: "rgba(0,0,0,0)",
      title: { text: "°C", font: { size: 10 } },
    } : undefined,
    grid: { rows: 2, columns: 1, pattern: "independent" as const },
  }

  // Solar forecast — simple sinusoidal based on current time + cloud cover hint
  const forecastTimes: string[] = []
  const forecastSolar: number[] = []
  const now = new Date()
  for (let h = 0; h < 24; h++) {
    const t = new Date(now)
    t.setHours(now.getHours() + h, 0, 0, 0)
    forecastTimes.push(t.toISOString())
    const hr = t.getHours()
    // Simple model: peak at solar noon (~13:00), zero before 6am and after 7pm
    const solar = hr >= 6 && hr <= 19
      ? Math.max(0, 480 * Math.sin(((hr - 6) / 13) * Math.PI))
      : 0
    forecastSolar.push(Math.round(solar))
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a1015] flex items-center justify-center">
      <p className="text-green-400 text-sm font-mono animate-pulse">reading the battery...</p>
    </div>
  )

  const isCharging = live ? live.power_in > live.power_out : false
  const netFlow    = live ? live.power_in - live.power_out : 0

  return (
    <div className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">

          {/* Header */}
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/professional/endeavors")}
              className="mt-1 text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950/40">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
              <Zap className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">
                  Home Energy Dashboard
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 dark:border-green-800 px-3 py-1 text-xs text-green-700 dark:text-green-400">
                  <Eye className="h-3 w-3" /> view only
                </span>
                {live && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    live · {timeAgo(live.timestamp_iso)}
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                EcoFlow Delta Pro 3 · solar monitoring · PG&E E-TOU-C rate optimization · polled every 30 min via Cloudflare Worker
              </p>
            </div>
          </div>

          {/* Admin hint */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowLoginHint(v => !v)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              <Lock className="h-3 w-3" />
              {showLoginHint ? "hide" : "admin access"}
            </button>
            {showLoginHint && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-slate-400">
                — charge limits, scheduling, and battery controls available via local Python dashboard
              </motion.p>
            )}
          </div>

          {/* Stat cards */}
          {live && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard icon={Battery} label="SOC" value={live.soc.toFixed(1)} unit="%" color={socColor(live.soc)}
                sub={`SOH ${live.soh.toFixed(0)}%`} />
              <StatCard icon={Sun} label="Solar" value={live.solar_in.toFixed(0)} unit="W" color="#fbbf24"
                sub={live.solar_in > 10 ? "generating" : "offline"} />
              <StatCard icon={Activity} label={isCharging ? "Charging" : "Output"} value={Math.abs(netFlow).toFixed(0)} unit="W"
                color={isCharging ? "#4ade80" : "#f87171"}
                sub={isCharging ? formatRuntime(live.remain_chg_min) + " to full" : formatRuntime(live.remain_dsg_min) + " left"} />
              <StatCard icon={Thermometer} label="Temp" value={live.temp_c} unit="°C" color="#60a5fa" />
              <StatCard icon={DollarSign} label="Rate Now" value={`$${currentRate.toFixed(3)}`} unit="/kWh"
                color={isPeak ? "#f87171" : "#4ade80"} sub={isPeak ? "peak hours" : "off-peak"} />
              <StatCard icon={TrendingUp} label="Est. Saved Today" value={`$${dailySavings.toFixed(2)}`}
                color="#a78bfa" sub="vs grid-only" />
            </div>
          )}

          {/* Electron flow + live settings */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="border-green-200 dark:border-green-900/60 lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-700 dark:text-green-400">Live Energy Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <ElectronFlow live={live} />
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-900/60 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-700 dark:text-green-400">System State</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {live && [
                  { label: "Solar In", value: live.solar_in, max: 500, color: "#fbbf24", unit: "W" },
                  { label: "Grid / AC In", value: live.ac_in, max: 1800, color: "#60a5fa", unit: "W" },
                  { label: "AC Out", value: Math.abs(live.ac_out), max: 1800, color: "#f87171", unit: "W" },
                  { label: "Net Flow", value: netFlow, max: 1800, color: netFlow >= 0 ? "#4ade80" : "#f87171", unit: "W" },
                  { label: "Battery SOC", value: live.soc, max: 100, color: socColor(live.soc), unit: "%" },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                      <span className="font-mono" style={{ color: row.color }}>
                        {row.value >= 0 ? "" : "−"}{Math.abs(row.value).toFixed(0)}{row.unit}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        animate={{ width: `${Math.min(100, Math.abs(row.value) / row.max * 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ background: row.color }} />
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Charge Limits</p>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-amber-400">min {live?.min_dsg_soc ?? 12}% discharge</span>
                    <span className="text-green-400">max {live?.max_chg_soc ?? 100}% charge</span>
                  </div>
                  <div className="relative h-3 rounded-full bg-gray-100 dark:bg-gray-800">
                    {live && (
                      <>
                        <div className="absolute h-full rounded-full bg-amber-400/20"
                          style={{ left: 0, width: `${live.min_dsg_soc}%` }} />
                        <div className="absolute h-full rounded-full"
                          style={{ left: `${live.min_dsg_soc}%`, width: `${live.soc - live.min_dsg_soc}%`, background: socColor(live.soc), opacity: 0.7 }} />
                        <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400"
                          style={{ left: `${live.min_dsg_soc}%` }} />
                        <div className="absolute top-0 bottom-0 w-0.5 bg-red-400"
                          style={{ left: `${live.max_chg_soc}%` }} />
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive time-series */}
          <Card className="border-green-200 dark:border-green-900/60">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <CardTitle className="text-sm text-green-700 dark:text-green-400">
                  Time Series — scroll to zoom · drag to pan · hover for details
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">envelopes</span>
                  <button onClick={() => setShowEnvelopes(v => !v)}
                    className="text-green-500 hover:text-green-400 transition-colors">
                    {showEnvelopes ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {/* Trace toggles */}
              <div className="flex flex-wrap gap-2 pt-2">
                <TraceToggle label="SOC %" color="#4ade80" active={traces.soc} onToggle={() => toggleTrace("soc")} />
                <TraceToggle label="Solar W" color="#fbbf24" active={traces.solar} onToggle={() => toggleTrace("solar")} />
                <TraceToggle label="Power In" color="#60a5fa" active={traces.powerIn} onToggle={() => toggleTrace("powerIn")} />
                <TraceToggle label="Power Out" color="#f87171" active={traces.powerOut} onToggle={() => toggleTrace("powerOut")} />
                <TraceToggle label="Temp °C" color="#a78bfa" active={traces.temp} onToggle={() => toggleTrace("temp")} />
              </div>
            </CardHeader>
            <CardContent>
              {history.length > 1 ? (
                <Plot
                  data={plotData}
                  layout={plotLayout}
                  config={CONFIG}
                  style={{ width: "100%" }}
                  useResizeHandler
                />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Charts populate as data accumulates — check back in a few hours.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Solar forecast + savings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Solar forecast */}
            <Card className="border-green-200 dark:border-green-900/60">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-green-500" />
                  <CardTitle className="text-sm text-green-700 dark:text-green-400">
                    24h Solar Forecast
                  </CardTitle>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Estimated production based on solar position model · actual varies with cloud cover
                </p>
              </CardHeader>
              <CardContent>
                <Plot
                  data={[
                    {
                      x: forecastTimes,
                      y: forecastSolar,
                      type: "scatter" as const,
                      mode: "lines" as const,
                      fill: "tozeroy",
                      fillcolor: "rgba(251,191,36,0.15)",
                      line: { color: "#fbbf24", width: 2 },
                      name: "Forecast W",
                      hovertemplate: "<b>%{y}W</b> est. solar<extra></extra>",
                    },
                    // Overlay actual if available
                    ...(history.length > 1 ? [{
                      x: times,
                      y: solars,
                      type: "scatter" as const,
                      mode: "lines" as const,
                      line: { color: "#f97316", width: 1.5, dash: "dot" as const },
                      name: "Actual W",
                      hovertemplate: "<b>%{y}W</b> actual<extra></extra>",
                    }] : []),
                  ]}
                  layout={{
                    ...LAYOUT_BASE,
                    height: 220,
                    margin: { l: 44, r: 16, t: 16, b: 40 },
                    xaxis: { ...LAYOUT_BASE.xaxis, rangeslider: { visible: false } },
                    yaxis: { ...LAYOUT_BASE.yaxis, title: { text: "W", font: { size: 10 } } },
                    legend: { ...LAYOUT_BASE.legend, y: -0.3 },
                  }}
                  config={{ ...CONFIG, displayModeBar: false }}
                  style={{ width: "100%" }}
                />
              </CardContent>
            </Card>

            {/* Cost savings */}
            <Card className="border-green-200 dark:border-green-900/60">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <CardTitle className="text-sm text-green-700 dark:text-green-400">
                    TOU Rate & Savings
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Current rate highlight */}
                <div className={`rounded-xl p-4 border ${isPeak
                  ? "border-red-900/40 bg-red-950/20" : "border-green-900/40 bg-green-950/20"}`}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider text-gray-400">Current rate</span>
                    <span className={`text-2xl font-bold font-mono ${isPeak ? "text-red-400" : "text-green-400"}`}>
                      ${currentRate.toFixed(3)}<span className="text-sm font-normal text-gray-400">/kWh</span>
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${isPeak ? "text-red-400" : "text-green-400"}`}>
                    {isPeak ? "⚠ Peak hours (4–9 PM) — discharge battery to avoid grid costs"
                             : "✓ Off-peak — good time to charge from grid if needed"}
                  </p>
                </div>

                {/* Rate schedule */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">PG&E E-TOU-C Schedule</p>
                  {[
                    { label: "Summer peak (Jun–Sep, 4–9pm)", rate: "$0.52", color: "#f87171" },
                    { label: "Summer off-peak", rate: "$0.28", color: "#4ade80" },
                    { label: "Winter peak (4–9pm)", rate: "$0.43", color: "#fbbf24" },
                    { label: "Winter off-peak", rate: "$0.26", color: "#4ade80" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">{r.label}</span>
                      <span className="font-mono" style={{ color: r.color }}>{r.rate}/kWh</span>
                    </div>
                  ))}
                </div>

                {/* Estimated savings */}
                <div className="rounded-lg bg-purple-950/20 border border-purple-900/30 p-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Est. saved today</span>
                    <span className="text-xl font-bold font-mono text-purple-300">
                      ${dailySavings.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Battery discharge during peak vs. purchasing from grid at peak rates
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project notes */}
          <Card className="border-green-200 dark:border-green-900/60">
            <CardHeader>
              <CardTitle className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                About this project
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <div className="space-y-3">
                <p>
                  A full-stack home energy management system integrating real-time battery telemetry,
                  solar production, weather forecasting, and PG&E utility rate data — built entirely
                  from scratch as a working demonstration of the same distributed energy optimization
                  principles developed professionally at Heila, GELI, and EPRI.
                </p>
                <p>
                  The 48-hour forecast uses Ridge regression trained on counterfactual-reconstructed
                  home load (battery and solar contributions stripped out via the ESPI Green Button
                  data pipeline), with E-TOU-C rate scheduling to recommend optimal charge windows.
                </p>
              </div>
              <ul className="space-y-1.5 text-gray-600 dark:text-gray-400 text-xs">
                <li>⚡ EcoFlow Open API — HMAC-SHA256 signed REST, 30-min polling</li>
                <li>☀️ Open-Meteo — solar irradiance + cloud cover, no API key</li>
                <li>🔋 Python + Plotly Dash — local admin dashboard with full controls</li>
                <li>☁️ Cloudflare Worker + R2 — serverless 24/7 archival, zero ongoing cost</li>
                <li>📊 SQLite + APScheduler — local time-series + background jobs</li>
                <li>⚡ PG&E Green Button Share My Data (ESPI) — in progress</li>
                <li>🌐 Next.js + Vercel — this viewer</li>
                <li>🔮 42,745 rows of historical data (Jan 2025–present) from EcoFlow export</li>
              </ul>
            </CardContent>
          </Card>

        </motion.div>
      </main>
    </div>
  )
}
