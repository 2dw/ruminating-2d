"use client"

/**
 * app/professional/endeavors/energy/page.tsx
 * Full home energy dashboard — charts + live data from R2.
 * View-only for visitors. Admin controls require local dashboard.
 */

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Zap, Eye, Lock, ExternalLink,
         Thermometer, Battery, Sun, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

// Dynamically import Plotly to avoid SSR issues
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

function formatRuntime(minutes: number) {
  if (!minutes) return "—"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function socColor(soc: number) {
  if (soc >= 70) return "#4ade80"
  if (soc >= 30) return "#fbbf24"
  return "#f87171"
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, unit, color = "#4ade80", sub }: {
  icon: any, label: string, value: string | number, unit?: string,
  color?: string, sub?: string
}) {
  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold font-mono" style={{ color }}>
              {value}
              {unit && (
                <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
              )}
            </p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
          <div className="rounded-xl p-2 bg-green-50 dark:bg-green-950/40">
            <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── SOC arc SVG ───────────────────────────────────────────────────────────────

function SocArc({ soc }: { soc: number }) {
  const r = 54, cx = 70, cy = 70, sw = 8, gap = 30
  const start = 90 + gap / 2
  const sweep = 360 - gap
  const filled = (soc / 100) * sweep
  const color = socColor(soc)

  function pt(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }
  function arc(a1: number, a2: number) {
    const s = pt(a1), e = pt(a2)
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${e.x} ${e.y}`
  }

  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <path d={arc(start, start + sweep)} fill="none"
        stroke="rgba(74,222,128,0.1)" strokeWidth={sw} strokeLinecap="round" />
      <path d={arc(start, start + filled)} fill="none"
        stroke={color} strokeWidth={sw} strokeLinecap="round"
        style={{ transition: "stroke 0.5s" }} />
      <text x={cx} y={cy - 8} textAnchor="middle" fill={color}
        fontSize="24" fontWeight="700" fontFamily="monospace">
        {soc.toFixed(1)}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle"
        fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily="monospace">
        % SOC
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle"
        fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="monospace">
        SOH {100}%
      </text>
    </svg>
  )
}

// ── Plotly chart defaults ─────────────────────────────────────────────────────

const LAYOUT_BASE = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { color: "#9ca3af", family: "JetBrains Mono, monospace", size: 11 },
  margin: { l: 44, r: 12, t: 28, b: 36 },
  xaxis: { gridcolor: "rgba(55,65,81,0.4)", showgrid: true, zeroline: false },
  yaxis: { gridcolor: "rgba(55,65,81,0.4)", showgrid: true, zeroline: false },
  legend: { bgcolor: "rgba(0,0,0,0)", font: { size: 10 } },
  hovermode: "x unified" as const,
}

const CONFIG = { displayModeBar: false, responsive: true }

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EnergyDashboardPage() {
  const router = useRouter()
  const [live, setLive] = useState<LiveReading | null>(null)
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [showLoginHint, setShowLoginHint] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Fetch latest reading
  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch("/api/ecoflow/latest", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setLive(data)
        setLastUpdated(data.timestamp_iso)
        // Add to history for sparkline
        setHistory(prev => {
          const next = [...prev, {
            timestamp_iso: data.timestamp_iso,
            soc: data.soc,
            solar_in: data.solar_in,
            power_out: data.power_out,
            power_in: data.power_in,
            temp_c: data.temp_c,
          }].slice(-48) // keep last 48 readings (~24h at 30min polls)
          return next
        })
      }
    } catch (_) {}
    finally { setLoading(false) }
  }, [])

  // Fetch today's R2 daily file for richer history
  const fetchDailyHistory = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const year = today.slice(0, 4)
      const month = today.slice(5, 7)
      const day = today.slice(8, 10)
      const key = `telemetry/daily/${year}/${month}/${day}.jsonl`
      const res = await fetch(`/api/ecoflow/admin?action=download&key=${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_ECOFLOW_VIEWER_TOKEN || ""}` }
      })
      if (res.ok) {
        const text = await res.text()
        const points: HistoryPoint[] = text.trim().split("\n")
          .filter(Boolean)
          .map(line => {
            try { return JSON.parse(line) } catch { return null }
          })
          .filter(Boolean)
          .map((d: any) => ({
            timestamp_iso: d.timestamp_iso,
            soc: d.soc,
            solar_in: d.solar_in,
            power_out: Math.abs(d.power_out || d.ac_out || 0),
            power_in: d.power_in,
            temp_c: d.temp_c,
          }))
        if (points.length > 0) setHistory(points)
      }
    } catch (_) {}
  }, [])

  useEffect(() => {
    fetchLive()
    fetchDailyHistory()
    const interval = setInterval(fetchLive, 120_000)
    return () => clearInterval(interval)
  }, [fetchLive, fetchDailyHistory])

  // ── Chart data ─────────────────────────────────────────────────────────────

  const times = history.map(h => h.timestamp_iso)
  const socs  = history.map(h => h.soc)
  const solar = history.map(h => h.solar_in)
  const pout  = history.map(h => Math.abs(h.power_out))
  const pin   = history.map(h => h.power_in)
  const temps = history.map(h => h.temp_c)

  const isCharging = live ? live.power_in > live.power_out : false
  const isSolar    = live ? live.solar_in > 10 : false
  const netFlow    = live ? live.power_in - live.power_out : 0

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-[#0a1015] flex items-center justify-center">
      <p className="text-green-400 text-sm font-mono animate-pulse">reading the battery...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500">
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >

          {/* Header */}
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon"
              onClick={() => router.push("/professional/endeavors")}
              className="mt-1 text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950/40">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl
                            bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
              <Zap className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">
                  Home Energy Dashboard
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border
                                 border-green-200 dark:border-green-800 px-3 py-1
                                 text-xs text-green-700 dark:text-green-400">
                  <Eye className="h-3 w-3" /> view only
                </span>
                {lastUpdated && (
                  <span className="text-xs text-gray-400">
                    · updated {timeAgo(lastUpdated)}
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Live monitoring of home solar, EcoFlow Delta Pro 3 battery, and grid draw —
                polled every 30 minutes via Cloudflare Worker and stored in R2.
              </p>
            </div>
          </div>

          {/* Admin hint */}
          <button
            onClick={() => setShowLoginHint(v => !v)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400
                       hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <Lock className="h-3 w-3" />
            {showLoginHint ? "hide" : "admin access"}
          </button>
          {showLoginHint && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-slate-400 -mt-2"
            >
              Full controls (charge limits, scheduling, settings) available via the local
              Python dashboard when running at home.
            </motion.p>
          )}

          {/* Live stats row */}
          {live && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={Battery}
                label="State of Charge"
                value={live.soc.toFixed(1)}
                unit="%"
                color={socColor(live.soc)}
                sub={`SOH ${live.soh.toFixed(0)}%`}
              />
              <StatCard
                icon={Sun}
                label="Solar Input"
                value={live.solar_in.toFixed(0)}
                unit="W"
                color="#fbbf24"
                sub={isSolar ? "generating" : "offline"}
              />
              <StatCard
                icon={Activity}
                label={isCharging ? "Charging" : "Output"}
                value={Math.abs(netFlow).toFixed(0)}
                unit="W"
                color={isCharging ? "#4ade80" : "#f87171"}
                sub={isCharging ? "net charging" : "net drawing"}
              />
              <StatCard
                icon={Thermometer}
                label="Cell Temp"
                value={live.temp_c}
                unit="°C"
                color="#60a5fa"
                sub={isCharging
                  ? `full in ${formatRuntime(live.remain_chg_min)}`
                  : `${formatRuntime(live.remain_dsg_min)} runtime`}
              />
            </div>
          )}

          {/* SOC arc + status */}
          {live && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-green-200 dark:border-green-800 flex items-center justify-center py-4">
                <CardContent className="flex flex-col items-center gap-2 pt-0">
                  <SocArc soc={live.soc} />
                  <div className="flex gap-2 flex-wrap justify-center">
                    <span className="text-xs rounded-full border border-green-200 dark:border-green-800
                                     px-2.5 py-0.5 text-green-700 dark:text-green-400">
                      min {live.min_dsg_soc}% discharge limit
                    </span>
                    <span className="text-xs rounded-full border border-green-200 dark:border-green-800
                                     px-2.5 py-0.5 text-green-700 dark:text-green-400">
                      max {live.max_chg_soc}% charge limit
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Power flow bars */}
              <Card className="border-green-200 dark:border-green-800 md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-700 dark:text-green-400">
                    Power Flow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Solar In", value: live.solar_in, max: 500, color: "#fbbf24" },
                    { label: "Grid / AC In", value: live.ac_in, max: 1800, color: "#60a5fa" },
                    { label: "AC Out", value: Math.abs(live.ac_out), max: 1800, color: "#f87171" },
                    { label: "Net Flow", value: netFlow, max: 1800,
                      color: netFlow >= 0 ? "#4ade80" : "#f87171" },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                        <span className="font-mono" style={{ color: row.color }}>
                          {row.value >= 0 ? "" : "−"}{Math.abs(row.value).toFixed(0)} W
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, Math.abs(row.value) / row.max * 100)}%`,
                            background: row.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* SOC history chart */}
          {history.length > 1 && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-700 dark:text-green-400">
                  SOC History — Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Plot
                  data={[
                    {
                      x: times, y: socs,
                      type: "scatter", mode: "lines",
                      name: "SOC %",
                      fill: "tozeroy",
                      fillcolor: "rgba(74,222,128,0.12)",
                      line: { color: "#4ade80", width: 2 },
                      hovertemplate: "%{y:.1f}%<extra>SOC</extra>",
                    },
                  ]}
                  layout={{
                    ...LAYOUT_BASE,
                    title: { text: "", font: { size: 12 } },
                    yaxis: { ...LAYOUT_BASE.yaxis, title: "SOC %", range: [0, 105] },
                    height: 220,
                  }}
                  config={CONFIG}
                  style={{ width: "100%" }}
                />
              </CardContent>
            </Card>
          )}

          {/* Solar + Power chart */}
          {history.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-700 dark:text-green-400">
                    Solar Input
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Plot
                    data={[{
                      x: times, y: solar,
                      type: "bar",
                      name: "Solar W",
                      marker: { color: "#fbbf24", opacity: 0.8 },
                      hovertemplate: "%{y:.0f}W<extra>Solar</extra>",
                    }]}
                    layout={{
                      ...LAYOUT_BASE,
                      yaxis: { ...LAYOUT_BASE.yaxis, title: "W" },
                      height: 200,
                    }}
                    config={CONFIG}
                    style={{ width: "100%" }}
                  />
                </CardContent>
              </Card>

              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-700 dark:text-green-400">
                    Power In vs Out
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Plot
                    data={[
                      {
                        x: times, y: pin,
                        type: "scatter", mode: "lines",
                        name: "In", fill: "tozeroy",
                        fillcolor: "rgba(74,222,128,0.15)",
                        line: { color: "#4ade80", width: 1.5 },
                      },
                      {
                        x: times, y: pout.map(v => -v),
                        type: "scatter", mode: "lines",
                        name: "Out", fill: "tozeroy",
                        fillcolor: "rgba(248,113,113,0.15)",
                        line: { color: "#f87171", width: 1.5 },
                      },
                    ]}
                    layout={{
                      ...LAYOUT_BASE,
                      yaxis: { ...LAYOUT_BASE.yaxis, title: "W" },
                      height: 200,
                    }}
                    config={CONFIG}
                    style={{ width: "100%" }}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Temperature chart */}
          {history.length > 1 && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-700 dark:text-green-400">
                  Cell Temperature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Plot
                  data={[{
                    x: times, y: temps,
                    type: "scatter", mode: "lines",
                    name: "°C",
                    line: { color: "#60a5fa", width: 2 },
                    hovertemplate: "%{y}°C<extra>Temp</extra>",
                  }]}
                  layout={{
                    ...LAYOUT_BASE,
                    yaxis: { ...LAYOUT_BASE.yaxis, title: "°C" },
                    height: 180,
                  }}
                  config={CONFIG}
                  style={{ width: "100%" }}
                />
              </CardContent>
            </Card>
          )}

          {/* No history fallback */}
          {history.length <= 1 && !loading && (
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-gray-400">
                  Charts populate as polling data accumulates throughout the day.
                  Check back in a few hours for SOC history and power flow trends.
                </p>
              </CardContent>
            </Card>
          )}

          {/* About the project */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-sm text-green-700 dark:text-green-400 uppercase tracking-wider">
                About this project
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 text-sm
                                     text-gray-700 dark:text-gray-300 leading-relaxed">
              <div className="space-y-3">
                <p>
                  A full-stack home energy management system built from scratch — integrating
                  real-time battery telemetry, solar production, weather forecasting, and PG&E
                  utility rate data into a unified monitoring and optimization stack.
                </p>
                <p>
                  The 48-hour forecast engine uses a Ridge regression load model trained on
                  counterfactual-reconstructed home load (battery and solar effects stripped out),
                  with PG&E E-TOU-C rate scheduling to recommend optimal charge windows.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Stack</h4>
                <ul className="space-y-1.5 text-gray-600 dark:text-gray-400">
                  <li>⚡ EcoFlow Open API — HMAC-signed REST, 30-min polling</li>
                  <li>☀️ Open-Meteo — solar irradiance + cloud cover forecast</li>
                  <li>🔋 Python + Plotly Dash — local admin dashboard</li>
                  <li>☁️ Cloudflare Worker + R2 — serverless archival, no machine needed</li>
                  <li>📊 SQLite + APScheduler — local history + background jobs</li>
                  <li>⚡ PG&E Green Button Share My Data API — in progress</li>
                  <li>🌐 Next.js + Vercel — this viewer page</li>
                </ul>
              </div>
            </CardContent>
          </Card>

        </motion.div>
      </main>
    </div>
  )
}
