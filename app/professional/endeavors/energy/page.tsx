"use client"
/**
 * app/professional/endeavors/energy/page.tsx
 * Uses recharts (already in project) for interactive charts:
 *  - Stock-market style time series with zoom/pan brush
 *  - Metric toggles, crosshair tooltip, SOC envelope bands
 *  - Animated SVG electron flow
 *  - Solar forecast vs actual
 *  - Value stacking savings chart
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft, Zap, Eye, Lock, Sun, Battery, Activity,
  Thermometer, DollarSign, TrendingUp, Cloud,
  AlertCircle, RefreshCw, ToggleLeft, ToggleRight, Settings,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Brush, ReferenceLine, ReferenceArea,
  ResponsiveContainer, BarChart,
} from "recharts"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Live {
  timestamp: number; timestamp_iso: string
  soc: number; soh: number
  power_in: number; power_out: number; solar_in: number
  ac_in: number; ac_out: number; dc_out: number; temp_c: number
  remain_dsg_min: number; remain_chg_min: number
  min_dsg_soc: number; max_chg_soc: number
}
interface Pt {
  timestamp_iso: string; label: string
  soc: number; solar_in: number
  power_out: number; power_in: number; temp_c: number
  isPeak: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}
const hhmm = (m: number) => {
  if (!m) return "—"
  const h = Math.floor(m / 60), mm = m % 60
  return h === 0 ? `${mm}m` : mm === 0 ? `${h}h` : `${h}h ${mm}m`
}
const socCol  = (s: number) => s >= 70 ? "#4ade80" : s >= 30 ? "#fbbf24" : "#f87171"
const isPeak  = (d = new Date()) => d.getHours() >= 16 && d.getHours() < 21
const getRate = (d = new Date()) => {
  const su = d.getMonth() >= 5 && d.getMonth() <= 8
  return su ? (isPeak(d) ? 0.52 : 0.28) : (isPeak(d) ? 0.43 : 0.26)
}
const fmtTime = (iso: string) => {
  const d = new Date(iso)
  const mon = d.toLocaleString([], { month: "short" })
  const day = d.getDate()
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${mon} ${day}, ${hh}:${mm}`
}
// Short version for dense x-axis ticks (when zoomed in to a single day)
const fmtTimeShort = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}
// ISO datetime-local value for <input type="datetime-local">
const toLocalInput = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const fromLocalInput = (val: string) => new Date(val).toISOString()

// ── Custom crosshair tooltip ──────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, dark }: any) {
  if (!active || !payload?.length) return null
  const bg   = dark ? "#0a0f14" : "#f8fafc"
  const bord = dark ? "#374151" : "#cbd5e1"
  const fc   = dark ? "#e5e7eb" : "#1e293b"
  return (
    <div style={{
      background: bg, border: `1px solid ${bord}`, borderRadius: 8,
      padding: "8px 12px", fontSize: 11, fontFamily: "JetBrains Mono, monospace",
      color: fc, boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    }}>
      <p style={{ marginBottom: 4, opacity: 0.6, fontSize: 10 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ fontWeight: 700 }}>
            {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
            {p.unit ?? ""}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Peak shading component ────────────────────────────────────────────────────

function PeakAreas({ data, yMin, yMax }: { data: Pt[]; yMin: number; yMax: number }) {
  const areas: { start: string; end: string }[] = []
  let inPeak = false, startLabel = ""
  data.forEach((d, i) => {
    if (d.isPeak && !inPeak) { inPeak = true; startLabel = d.label }
    if (!d.isPeak && inPeak) { inPeak = false; areas.push({ start: startLabel, end: data[i-1].label }) }
  })
  if (inPeak) areas.push({ start: startLabel, end: data[data.length-1].label })
  return (
    <>
      {areas.map((a, i) => (
        <ReferenceArea key={i} x1={a.start} x2={a.end}
          fill="rgba(239,68,68,0.07)" strokeOpacity={0} />
      ))}
    </>
  )
}

// ── Electron flow diagram ─────────────────────────────────────────────────────

function Flow({ live, dark }: { live: Live | null; dark: boolean }) {
  const soc  = live?.soc ?? 50
  const sol  = live?.solar_in ?? 0
  const gin  = live?.ac_in ?? 0
  const aout = Math.abs(live?.ac_out ?? 0)
  const net  = (live?.power_in ?? 0) - (live?.power_out ?? 0)
  const hs = sol > 10, hg = gin > 10, hl = aout > 10
  const col = socCol(soc)
  const dim = dark ? "#1f2937" : "#e2e8f0"
  const mu  = dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)"
  const spd = (w: number, b = 400) => Math.max(0.6, 2.8 - w / b)
  return (
    <div className="w-full">
      <style>{`
        @keyframes efd{from{stroke-dashoffset:48}to{stroke-dashoffset:0}}
        @keyframes efp{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>
      <svg viewBox="0 0 640 300" className="w-full" style={{ maxHeight: 260 }}>
        {/* Connections */}
        <path d="M 120 78 Q 200 78 262 140" fill="none" stroke={hs?"#fbbf24":dim} strokeWidth="2.5" strokeDasharray="10 6"
          style={hs?{animation:`efd ${spd(sol,500)}s linear infinite`}:{}}/>
        {hs&&<text x="178" y="97" fill="#d97706" fontSize="9" fontFamily="monospace" textAnchor="middle">{sol.toFixed(0)}W →</text>}
        <path d="M 520 78 Q 440 78 378 140" fill="none" stroke={hg?"#60a5fa":dim} strokeWidth="2.5" strokeDasharray="10 6"
          style={hg?{animation:`efd ${spd(gin,1800)}s linear infinite`}:{}}/>
        {hg&&<text x="462" y="97" fill="#2563eb" fontSize="9" fontFamily="monospace" textAnchor="middle">← {gin.toFixed(0)}W</text>}
        <path d="M 320 188 L 320 238" fill="none" stroke={hl?col:dim} strokeWidth="3" strokeDasharray="10 6"
          style={hl?{animation:`efd ${spd(aout,1800)}s linear infinite`}:{}}/>
        {hl&&<text x="338" y="216" fill={col} fontSize="9" fontFamily="monospace">{aout.toFixed(0)}W</text>}
        <path d="M 348 250 Q 480 260 510 96" fill="none" stroke="rgba(167,139,250,0.15)" strokeWidth="1.5" strokeDasharray="5 10"/>
        {/* Solar node */}
        <g>
          {hs&&<circle cx="80" cy="70" r="46" fill="none" stroke="#fbbf24" strokeWidth="1" strokeOpacity=".3" style={{animation:"efp 2s ease-in-out infinite"}}/>}
          <circle cx="80" cy="70" r="38" fill={dark?"#0f0a00":"#fefce8"} stroke="#fbbf24" strokeWidth={hs?2:1} strokeOpacity={hs?1:0.3}/>
          {hs&&[0,45,90,135,180,225,270,315].map(a=><line key={a} x1={80+32*Math.cos(a*Math.PI/180)} y1={70+32*Math.sin(a*Math.PI/180)} x2={80+42*Math.cos(a*Math.PI/180)} y2={70+42*Math.sin(a*Math.PI/180)} stroke="#fbbf24" strokeWidth="1.5" strokeOpacity=".5"/>)}
          <circle cx="80" cy="70" r="17" fill="#fbbf24" fillOpacity={hs?.9:.15}/>
          <text x="80" y="123" textAnchor="middle" fill="#d97706" fontSize="10" fontFamily="monospace" opacity={hs?1:.35}>☀ Solar</text>
          <text x="80" y="136" textAnchor="middle" fill="#d97706" fontSize="9" fontFamily="monospace" opacity={hs?.8:.25}>{sol.toFixed(0)} W</text>
        </g>
        {/* Battery node */}
        <g>
          <circle cx="320" cy="150" r="52" fill="none" stroke={col} strokeWidth="1" strokeOpacity=".2" style={{animation:"efp 3s ease-in-out infinite"}}/>
          <circle cx="320" cy="150" r="44" fill={dark?"#080d10":"#f0fdf4"} stroke={col} strokeWidth="2.5"/>
          {(()=>{
            const R=36,cx=320,cy=150,sd=-225,td=270,fd=(soc/100)*td
            const r2=(d:number)=>d*Math.PI/180
            const [sx,sy]=[cx+R*Math.cos(r2(sd)),cy+R*Math.sin(r2(sd))]
            const [ex,ey]=[cx+R*Math.cos(r2(sd+td)),cy+R*Math.sin(r2(sd+td))]
            const [fx,fy]=[cx+R*Math.cos(r2(sd+fd)),cy+R*Math.sin(r2(sd+fd))]
            return(<>
              <path d={`M ${sx} ${sy} A ${R} ${R} 0 1 1 ${ex} ${ey}`} fill="none" stroke="rgba(148,163,184,.15)" strokeWidth="5"/>
              <path d={`M ${sx} ${sy} A ${R} ${R} 0 ${fd>180?1:0} 1 ${fx} ${fy}`} fill="none" stroke={col} strokeWidth="5" strokeLinecap="round" style={{transition:"stroke .8s"}}/>
            </>)
          })()}
          <text x="320" y="144" textAnchor="middle" fill={col} fontSize="20" fontWeight="700" fontFamily="monospace">{soc.toFixed(1)}%</text>
          <text x="320" y="160" textAnchor="middle" fill={mu} fontSize="8" fontFamily="monospace">SOC · SOH {live?.soh??100}%</text>
          <text x="320" y="205" textAnchor="middle" fill={mu} fontSize="9" fontFamily="monospace">⚡ Delta Pro 3 · 4096 Wh</text>
        </g>
        {/* Grid node */}
        <g>
          {hg&&<circle cx="560" cy="70" r="46" fill="none" stroke="#60a5fa" strokeWidth="1" strokeOpacity=".25" style={{animation:"efp 2.5s ease-in-out infinite"}}/>}
          <circle cx="560" cy="70" r="38" fill={dark?"#00081a":"#eff6ff"} stroke={hg?"#60a5fa":dim} strokeWidth={hg?2:1} strokeOpacity={hg?1:.3}/>
          {[-8,0,8].map((dx,i)=><g key={i}><line x1={560+dx} y1="55" x2={560+dx} y2="85" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity={hg?.8:.2}/>{i===1&&<><line x1="548" y1="63" x2="572" y2="63" stroke="#3b82f6" strokeWidth="1" strokeOpacity={hg?.5:.1}/><line x1="551" y1="73" x2="569" y2="73" stroke="#3b82f6" strokeWidth="1" strokeOpacity={hg?.5:.1}/></>}</g>)}
          <text x="560" y="123" textAnchor="middle" fill="#2563eb" fontSize="10" fontFamily="monospace" opacity={hg?1:.3}>⚡ Grid</text>
          <text x="560" y="136" textAnchor="middle" fill="#2563eb" fontSize="9" fontFamily="monospace" opacity={hg?.8:.22}>{hg?`${gin.toFixed(0)} W`:"standby"}</text>
        </g>
        {/* House node */}
        <g>
          <circle cx="320" cy="263" r="28" fill={dark?"#0a0010":"#faf5ff"} stroke="#7c3aed" strokeWidth="2" strokeOpacity={hl?1:.3}/>
          <polygon points="320,248 308,260 332,260" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity={hl?.9:.3}/>
          <rect x="312" y="260" width="16" height="10" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity={hl?.9:.3}/>
          {hl&&<rect x="317" y="262" width="6" height="5" fill="#7c3aed" fillOpacity=".35"/>}
          <text x="320" y="302" textAnchor="middle" fill="#7c3aed" fontSize="9" fontFamily="monospace">🏠 {aout.toFixed(0)} W</text>
        </g>
        {/* Status strips */}
        <rect x="8" y="282" width="220" height="14" rx="7" fill="rgba(148,163,184,.08)"/>
        <text x="118" y="293" textAnchor="middle" fill={mu} fontSize="8" fontFamily="monospace">
          {net>0?"↑ charging":"↓ discharging"} · {live?ago(live.timestamp_iso):"—"}
        </text>
        <rect x="420" y="282" width="212" height="14" rx="7" fill={isPeak()?"rgba(239,68,68,.1)":"rgba(34,197,94,.1)"}/>
        <text x="526" y="293" textAnchor="middle" fill={isPeak()?"#dc2626":"#16a34a"} fontSize="8" fontFamily="monospace">
          {isPeak()?"⚠ peak":"✓ off-peak"} · ${getRate().toFixed(3)}/kWh
        </text>
      </svg>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function SC({ icon: Icon, label, value, unit="", color="", sub="" }: any) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold font-mono" style={{color}}>
              {value}{unit&&<span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
            </p>
            {sub&&<p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <div className="rounded-xl p-2 bg-green-50 dark:bg-slate-800">
            <Icon className="h-4 w-4 text-green-600 dark:text-green-500"/>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Metric toggle button ──────────────────────────────────────────────────────

function TT({ label, color, active, onToggle }: any) {
  return (
    <button onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono border transition-all
        ${active?"border-current bg-current/10":"border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 opacity-50"}`}
      style={{color:active?color:undefined}}>
      <span className="h-2 w-2 rounded-full inline-block" style={{background:active?color:"#94a3b8"}}/>
      {label}
    </button>
  )
}

// ── Synchronized charts (SOC + Power + Solar) ───────────────────────────────

function SyncedCharts({ history, dark, show, live, minS, maxS, socMin, socMax, wMin, wMax, zoomLevel }: {
  history: Pt[]; dark: boolean; show: any; live: Live | null
  minS: number; maxS: number; socMin: number; socMax: number
  wMin: number; wMax: number | undefined; zoomLevel: number
}) {
  const len = history.length
  const defaultWindow = Math.min(len, 96)
  const [brushStart, setBrushStart] = useState(Math.max(0, len - defaultWindow))
  const [brushEnd, setBrushEnd] = useState(len)
  const containerRef = useRef<HTMLDivElement>(null)

  // Clamp brush indices whenever history length changes
  useEffect(() => {
    setBrushStart(prev => {
      const clamped = Math.max(0, Math.min(prev, len - 1))
      return clamped
    })
    setBrushEnd(prev => {
      const clamped = Math.max(1, Math.min(prev, len))
      return clamped
    })
  }, [len])

  const grid = dark ? "rgba(55,65,81,0.35)" : "rgba(203,213,222,0.6)"
  const fc   = dark ? "#9ca3af" : "#475569"
  const inputBg = dark ? "bg-slate-900" : "bg-white"
  const inputBorder = dark ? "border-slate-700" : "border-slate-300"
  const inputText = dark ? "text-slate-300" : "text-slate-700"

  // Current visible range dates
  const safeStart = Math.max(0, Math.min(brushStart, len - 1))
  const safeEnd   = Math.max(0, Math.min(brushEnd - 1, len - 1))
  const rangeStart = history[safeStart]?.timestamp_iso ?? ""
  const rangeEnd   = history[safeEnd]?.timestamp_iso ?? ""

  // Synced Brush handler — clamp to valid range, skip if unchanged to prevent loop
  const handleBrushChange = (range: any) => {
    if (range && typeof range.startIndex === "number" && typeof range.endIndex === "number") {
      const s = Math.max(0, Math.min(range.startIndex, len - 1))
      const e = Math.max(s + 3, Math.min(range.endIndex + 1, len))
      if (s !== brushStart || e !== brushEnd) {
        setBrushStart(s)
        setBrushEnd(e)
      }
    }
  }

  // Jump to date range via datetime picker
  const jumpToRange = useCallback((startIso: string, endIso: string) => {
    const startTime = new Date(startIso).getTime()
    const endTime = new Date(endIso).getTime()
    let startIdx = 0
    let endIdx = history.length
    for (let i = 0; i < history.length; i++) {
      const t = new Date(history[i].timestamp_iso).getTime()
      if (t >= startTime && startIdx === 0 && i > 0) startIdx = i - 1
      if (t >= startTime && startIdx === 0) startIdx = i
      if (t <= endTime) endIdx = i + 1
    }
    setBrushStart(startIdx)
    setBrushEnd(Math.max(startIdx + 3, endIdx))
  }, [history])

  // Zoom via scroll wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    const total = history.length
    const currentRange = brushEnd - brushStart
    const mid = (brushStart + brushEnd) / 2
    const factor = e.deltaY > 0 ? 1.3 : 0.7
    const newRange = Math.max(6, Math.min(total, Math.round(currentRange * factor)))
    const newStart = Math.max(0, Math.min(total - newRange, Math.round(mid - newRange / 2)))
    setBrushStart(newStart)
    setBrushEnd(newStart + newRange)
  }, [history.length, brushStart, brushEnd])

  // Zoom via buttons
  const prevZoomRef = useRef(1)
  useEffect(() => {
    if (zoomLevel === prevZoomRef.current) return
    prevZoomRef.current = zoomLevel
    const total = history.length
    const newRange = Math.max(6, Math.round(total / zoomLevel))
    const mid = (brushStart + brushEnd) / 2
    const newStart = Math.max(0, Math.min(total - newRange, Math.round(mid - newRange / 2)))
    setBrushStart(newStart)
    setBrushEnd(newStart + newRange)
  }, [zoomLevel, history.length])

  // Decide tick format based on visible range size
  const visibleDays = rangeStart && rangeEnd
    ? (new Date(rangeEnd).getTime() - new Date(rangeStart).getTime()) / 86_400_000
    : 1
  const tickFmt = visibleDays > 1.5 ? fmtTime : fmtTimeShort

  // Common chart props
  const sharedXAxis = {
    dataKey: "label" as const,
    tick: { fontSize: 9, fill: fc },
    interval: "preserveStartEnd" as const,
    minTickGap: 50,
    tickFormatter: (val: string) => {
      // val is the full label like "Aug 12, 14:30" — trim to time-only when zoomed in
      if (visibleDays <= 1.5) {
        const parts = val.split(", ")
        return parts.length > 1 ? parts[1] : val
      }
      return val
    },
  }
  const sharedTooltip = <ChartTooltip dark={dark}/>
  const sharedCursor = { stroke: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)", strokeWidth: 1, strokeDasharray: "4 2" }
  const sharedLegend = { style: { fontSize: 10, fontFamily: "JetBrains Mono, monospace" } }

  // Responsive brush sizing — bigger for touch on mobile
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const brushProps = {
    startIndex: brushStart,
    endIndex: Math.max(brushStart, Math.min(brushEnd - 1, len - 1)),
    height: isMobile ? 28 : 18,
    stroke: dark ? "#374151" : "#cbd5e1",
    fill: dark ? "rgba(15,23,32,0.8)" : "rgba(241,245,249,0.9)",
    travellerWidth: isMobile ? 12 : 6,
    onChange: handleBrushChange,
  }

  const brushWrap = (children: React.ReactNode, chartHeight: number) => (
    <div ref={containerRef} onWheel={handleWheel} style={{ height: chartHeight + (isMobile ? 40 : 30) }}>
      {children}
    </div>
  )

  return (
    <div className="space-y-1">
      {/* Range display + datetime pickers */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 mb-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">Viewing:</span>
          <span className="font-mono text-slate-600 dark:text-slate-300">
            {rangeStart ? fmtTime(rangeStart) : "—"}
          </span>
          <span className="text-slate-400">→</span>
          <span className="font-mono text-slate-600 dark:text-slate-300">
            {rangeEnd ? fmtTime(rangeEnd) : "—"}
          </span>
          <span className="text-slate-400 font-mono">
            ({brushEnd - brushStart} pts · {visibleDays.toFixed(1)}d)
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:ml-auto flex-wrap">
          <label className="text-[10px] text-slate-400 uppercase">From</label>
          <input
            type="datetime-local"
            value={rangeStart ? toLocalInput(rangeStart) : ""}
            onChange={(e) => {
              if (e.target.value && rangeEnd) {
                jumpToRange(fromLocalInput(e.target.value), rangeEnd)
              }
            }}
            className={`w-32 sm:w-40 px-2 py-1 rounded border text-xs font-mono ${inputBorder} ${inputBg} ${inputText}`}
          />
          <label className="text-[10px] text-slate-400 uppercase">To</label>
          <input
            type="datetime-local"
            value={rangeEnd ? toLocalInput(rangeEnd) : ""}
            onChange={(e) => {
              if (e.target.value && rangeStart) {
                jumpToRange(rangeStart, fromLocalInput(e.target.value))
              }
            }}
            className={`w-32 sm:w-40 px-2 py-1 rounded border text-xs font-mono ${inputBorder} ${inputBg} ${inputText}`}
          />
        </div>
      </div>

      {/* SOC chart */}
      <p className="text-xs text-slate-400 mb-1 font-mono">State of Charge (%)</p>
      {brushWrap(
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={history} margin={{left:0,right:8,top:4,bottom:4}}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3"/>
            <XAxis {...sharedXAxis} />
            <YAxis domain={[socMin, socMax]} tick={{fontSize:9,fill:fc}} width={32} unit="%"/>
            <Tooltip content={sharedTooltip} cursor={sharedCursor}/>
            <Legend wrapperStyle={sharedLegend}/>
            <PeakAreas data={history} yMin={socMin} yMax={socMax}/>
            {show.envelope&&<>
              <ReferenceLine y={maxS} stroke="#f87171" strokeDasharray="4 3" strokeWidth={1}
                label={{value:`max ${maxS}%`,position:"insideTopRight",fontSize:9,fill:"#f87171"}}/>
              <ReferenceLine y={minS} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1}
                label={{value:`min ${minS}%`,position:"insideBottomRight",fontSize:9,fill:"#f59e0b"}}/>
            </>}
            {show.soc&&<Area type="monotone" dataKey="soc" name="SOC %" unit="%" stroke={socCol(live?.soc??50)} strokeWidth={2} fill={socCol(live?.soc??50)} fillOpacity={0.1} dot={false} activeDot={{r:4}}/>}
            {show.temp&&<Line type="monotone" dataKey="temp_c" name="Temp" unit="°C" stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="4 2" dot={false}/>}
            <Brush {...brushProps} />
          </ComposedChart>
        </ResponsiveContainer>,
        230
      )}

      {/* Power chart */}
      <p className="text-xs text-slate-400 mt-2 mb-1 font-mono">Power Flow (W)</p>
      {brushWrap(
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={history} margin={{left:0,right:8,top:4,bottom:4}}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3"/>
            <XAxis {...sharedXAxis} />
            <YAxis domain={[wMin, wMax??'auto']} tick={{fontSize:9,fill:fc}} width={38} unit="W"/>
            <Tooltip content={sharedTooltip} cursor={sharedCursor}/>
            <Legend wrapperStyle={sharedLegend}/>
            <PeakAreas data={history} yMin={0} yMax={2000}/>
            {show.solar&&<Bar dataKey="solar_in" name="Solar" unit="W" fill="rgba(251,191,36,0.6)" maxBarSize={12}/>}
            {show.pIn&&<Area type="monotone" dataKey="power_in" name="Power In" unit="W" stroke="#2563eb" strokeWidth={1.5} fill="rgba(37,99,235,0.1)" dot={false} activeDot={{r:4}}/>}
            {show.pOut&&<Area type="monotone" dataKey="power_out" name="Power Out" unit="W" stroke="#dc2626" strokeWidth={1.5} fill="rgba(220,38,38,0.1)" dot={false} activeDot={{r:4}}/>}
            <Brush {...brushProps} />
          </ComposedChart>
        </ResponsiveContainer>,
        210
      )}

      {/* Solar chart */}
      <p className="text-xs text-slate-400 mt-2 mb-1 font-mono">Solar Production (W)</p>
      {brushWrap(
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={history} margin={{left:0,right:8,top:4,bottom:4}}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3"/>
            <XAxis {...sharedXAxis} />
            <YAxis tick={{fontSize:9,fill:fc}} width={38} unit="W"/>
            <Tooltip content={sharedTooltip} cursor={sharedCursor}/>
            <Legend wrapperStyle={sharedLegend}/>
            <Area type="monotone" dataKey="solar_in" name="Solar" unit="W"
              stroke="#d97706" strokeWidth={2} fill="rgba(217,119,6,0.1)" dot={false}/>
            <Brush {...brushProps} />
          </ComposedChart>
        </ResponsiveContainer>,
        210
      )}

      <p className="text-[10px] text-slate-500 mt-1 text-center font-mono">
        {isMobile ? "pinch to zoom · drag brush to pan" : "Ctrl+scroll to zoom · drag brush to pan"} · all charts synchronized
      </p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

function EnergyDashboardContent() {
  const router = useRouter()

  const [dark, setDark] = useState(false)
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains("dark"))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  const [live, setLive]         = useState<Live | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [history, setHistory]   = useState<Pt[]>([])
  const [loading, setLoading]   = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [tab, setTab]           = useState<"battery"|"pge">("battery")

  // Metric visibility toggles
  const [show, setShow] = useState({
    soc: true, solar: true, pIn: true, pOut: true, temp: false,
    envelope: true,
  })
  const tog = (k: keyof typeof show) => setShow(p => ({...p, [k]: !p[k]}))

  // Y-axis range controls
  const [socMin, setSocMin] = useState(0)
  const [socMax, setSocMax] = useState(105)
  const [wMin,   setWMin]   = useState(0)
  const [wMax,   setWMax]   = useState<number|undefined>(undefined)

  // Zoom level (1 = full range, higher = zoomed in)
  const [zoomLevel, setZoomLevel] = useState(1)

  const grid = dark ? "rgba(55,65,81,0.35)" : "rgba(203,213,225,0.6)"
  const fc   = dark ? "#9ca3af" : "#475569"

  // Fetch live
  const fetchLive = useCallback(async () => {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    try {
      const res  = await fetch("/api/ecoflow/latest", { cache:"no-store", signal:ctrl.signal })
      const data = await res.json()
      if (data.error) setApiError(data.error)
      else { setLive(data); setApiError(null) }
    } catch (e: any) {
      setApiError(e.name==="AbortError"?"Request timed out":e.message)
    } finally { clearTimeout(t); setLoading(false) }
  }, [])

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/ecoflow/history?days=7", { cache:"no-store" })
      if (!res.ok) return
      const json = await res.json()
      const pts: Pt[] = (json.data ?? []).map((d: any) => {
        const dt = new Date(d.timestamp_iso)
        return {
          timestamp_iso: d.timestamp_iso,
          label: fmtTime(d.timestamp_iso),
          soc:       d.soc,
          solar_in:  d.solar_in,
          power_out: Math.abs(d.power_out || d.ac_out || 0),
          power_in:  d.power_in,
          temp_c:    d.temp_c,
          isPeak:    dt.getHours() >= 16 && dt.getHours() < 21,
        }
      })
      if (pts.length > 0) setHistory(pts.sort((a, b) => new Date(a.timestamp_iso).getTime() - new Date(b.timestamp_iso).getTime()))
    } catch (_) {}
  }, [])

  useEffect(() => {
    fetchLive(); fetchHistory()
    const iv = setInterval(() => { fetchLive(); fetchHistory() }, 120_000)
    return () => clearInterval(iv)
  }, [fetchLive, fetchHistory])

  // Derived
  const isC  = (live?.power_in??0) > (live?.power_out??0)
  const net  = (live?.power_in??0) - (live?.power_out??0)
  const minS = live?.min_dsg_soc ?? 12
  const maxS = live?.max_chg_soc ?? 100

  // Savings
  let solOff=0, pkAv=0
  for (let i=1;i<history.length;i++){
    const dt=new Date(history[i].timestamp_iso)
    const dh=(new Date(history[i].timestamp_iso).getTime()-new Date(history[i-1].timestamp_iso).getTime())/3_600_000
    const r=getRate(dt)
    solOff+=Math.min(history[i].solar_in,history[i].power_out)*dh/1000*r
    if(isPeak(dt)) pkAv+=Math.max(0,history[i].power_out-history[i].solar_in)*dh/1000*(r-0.28)
  }
  const saved = Math.max(0,solOff)+Math.max(0,pkAv)

  // Value stacking data
  const valueData = [
    { name: "Solar offset", value: Math.max(0, solOff), fill: "#d97706" },
    { name: "Peak avoidance", value: Math.max(0, pkAv), fill: "#16a34a" },
  ]

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-[#080d10] flex items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-green-600 dark:text-green-400 text-sm font-mono animate-pulse">reading the battery...</p>
        <p className="text-slate-400 text-xs font-mono">connecting to Cloudflare R2</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white dark:bg-[#080d10] pt-24 text-slate-900 dark:text-white transition-colors duration-500">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.6}} className="space-y-6">

          {/* Header */}
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={()=>router.push("/professional/endeavors")}
              className="mt-1 text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950/40">
              <ArrowLeft className="h-5 w-5"/>
            </Button>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
              <Zap className="h-7 w-7"/>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Home Energy Dashboard</h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-300 dark:border-green-800 px-3 py-1 text-xs text-green-700 dark:text-green-400">
                  <Eye className="h-3 w-3"/> view only
                </span>
                {live&&!apiError&&(
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse inline-block"/>
                    {ago(live.timestamp_iso)}
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                EcoFlow Delta Pro 3 · solar · PG&E E-TOU-C · Cloudflare Worker → R2 · polled every 30 min
              </p>
            </div>
            <div className="shrink-0">
                <button
                  onClick={() => router.push("/admin/login?redirect=/professional/endeavors/energy")}
                  className="text-xs text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Admin Login
                </button>
            </div>
          </div>

          {/* Error */}
          {apiError&&(
            <div className="flex items-start gap-3 rounded-xl border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0"/>
              <div className="flex-1">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Connection error</p>
                <p className="text-xs text-red-500/80 mt-1 font-mono">{apiError}</p>
              </div>
              <button onClick={fetchLive} className="text-red-500 hover:text-red-600"><RefreshCw className="h-4 w-4"/></button>
            </div>
          )}

          {/* Admin hint */}
          <div>
            <button onClick={()=>setShowHint(v=>!v)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              <Lock className="h-3 w-3"/>{showHint?"hide":"admin access"}
            </button>
            {showHint&&<p className="text-xs text-slate-400 mt-1">Full controls via local Python dashboard.</p>}
          </div>

          {/* Stat cards */}
          {live&&!apiError&&(
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <SC icon={Battery} label="SOC" value={live.soc.toFixed(1)} unit="%" color={socCol(live.soc)} sub={`SOH ${live.soh}%`}/>
              <SC icon={Sun} label="Solar" value={live.solar_in.toFixed(0)} unit="W" color="#d97706" sub={live.solar_in>10?"generating":"offline"}/>
              <SC icon={Activity} label={isC?"Charging":"Output"} value={Math.abs(net).toFixed(0)} unit="W" color={isC?"#16a34a":"#dc2626"} sub={isC?`full in ${hhmm(live.remain_chg_min)}`:`${hhmm(live.remain_dsg_min)} left`}/>
              <SC icon={Thermometer} label="Temp" value={live.temp_c} unit="°C" color="#2563eb"/>
              <SC icon={DollarSign} label="Rate Now" value={`$${getRate().toFixed(3)}`} unit="/kWh" color={isPeak()?"#dc2626":"#16a34a"} sub={isPeak()?"⚠ peak":"✓ off-peak"}/>
              <SC icon={TrendingUp} label="Saved Today" value={`$${saved.toFixed(2)}`} color="#7c3aed" sub="vs grid-only"/>
            </div>
          )}

          {/* Flow + state */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 lg:col-span-3">
              <CardHeader className="pb-1"><CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest">Live Energy Flow</CardTitle></CardHeader>
              <CardContent className="pt-0"><Flow live={apiError?null:live} dark={dark}/></CardContent>
            </Card>
            <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest">System State</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {live&&!apiError?[
                  {label:"Solar In",   v:live.solar_in,         max:500,  color:"#d97706",unit:"W"},
                  {label:"Grid / AC In",v:live.ac_in,           max:1800, color:"#2563eb",unit:"W"},
                  {label:"AC Out",     v:Math.abs(live.ac_out), max:1800, color:"#dc2626",unit:"W"},
                  {label:"Net Flow",   v:net,                    max:1800, color:net>=0?"#16a34a":"#dc2626",unit:"W"},
                  {label:"SOC",        v:live.soc,               max:100,  color:socCol(live.soc),unit:"%"},
                ].map(r=>(
                  <div key={r.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400">{r.label}</span>
                      <span className="font-mono" style={{color:r.color}}>{r.v>=0?"":"−"}{Math.abs(r.v).toFixed(0)}{r.unit}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        animate={{width:`${Math.min(100,Math.abs(r.v)/r.max*100)}%`}}
                        transition={{duration:1.2,ease:"easeOut"}} style={{background:r.color}}/>
                    </div>
                  </div>
                )):<p className="text-xs text-slate-400 py-4 text-center">Waiting for live data...</p>}
                {live&&!apiError&&(
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Charge Envelope</p>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-amber-600 dark:text-amber-400">min {minS}%</span>
                      <span className="text-red-600 dark:text-red-400">max {maxS}%</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="absolute inset-y-0 rounded-full bg-amber-200 dark:bg-amber-400/15" style={{left:0,width:`${minS}%`}}/>
                      <motion.div className="absolute inset-y-0 rounded-full"
                        animate={{width:`${Math.max(0,live.soc-minS)}%`,left:`${minS}%`}}
                        transition={{duration:1.2}} style={{background:socCol(live.soc),opacity:.8}}/>
                      <div className="absolute inset-y-0 w-0.5 bg-amber-500" style={{left:`${minS}%`}}/>
                      <div className="absolute inset-y-0 w-0.5 bg-red-500" style={{left:`${maxS}%`}}/>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {isC?`↑ charging · full in ${hhmm(live.remain_chg_min)}`:`↓ discharging · ${hhmm(live.remain_dsg_min)} remain`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tab bar */}
          <div className="flex gap-2 flex-wrap">
            {(["battery","pge"] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono border transition-all ${tab===t
                  ?"border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                  :"border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`}>
                {t==="battery"?"⚡ Battery History":"📊 PG&E Grid Usage"}
              </button>
            ))}
          </div>

          {/* ── INTERACTIVE BATTERY TIME SERIES ── */}
          {tab==="battery"&&(
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest mb-1">
                      Battery Time Series
                    </CardTitle>
                    <p className="text-xs text-slate-400">
                      scroll to zoom · drag to pan · hover for crosshair · red bands = peak hours (4–9 PM)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Zoom controls */}
                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
                      <button onClick={()=>setZoomLevel(z=>Math.min(8,z*1.5))}
                        className="px-2 py-1 text-xs font-mono rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400" title="Zoom in">+</button>
                      <button onClick={()=>setZoomLevel(1)}
                        className="px-2 py-1 text-xs font-mono rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400" title="Reset zoom">1:1</button>
                      <button onClick={()=>setZoomLevel(z=>Math.max(1,z/1.5))}
                        className="px-2 py-1 text-xs font-mono rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400" title="Zoom out">−</button>
                    </div>
                    {/* Envelope toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">SOC limits</span>
                      <button onClick={()=>tog("envelope")} className="text-green-600 dark:text-green-500">
                        {show.envelope?<ToggleRight className="h-5 w-5"/>:<ToggleLeft className="h-5 w-5"/>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metric toggles */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <TT label="SOC %" color={socCol(live?.soc??50)} active={show.soc} onToggle={()=>tog("soc")}/>
                  <TT label="Solar W" color="#d97706" active={show.solar} onToggle={()=>tog("solar")}/>
                  <TT label="Power In" color="#2563eb" active={show.pIn} onToggle={()=>tog("pIn")}/>
                  <TT label="Power Out" color="#dc2626" active={show.pOut} onToggle={()=>tog("pOut")}/>
                  <TT label="Temp °C" color="#7c3aed" active={show.temp} onToggle={()=>tog("temp")}/>
                </div>
              </CardHeader>
              <CardContent>
                {history.length >= 1 ? (
                  <SyncedCharts
                    history={history}
                    dark={dark}
                    show={show}
                    live={live}
                    minS={minS}
                    maxS={maxS}
                    socMin={socMin}
                    socMax={socMax}
                    wMin={wMin}
                    wMax={wMax}
                    zoomLevel={zoomLevel}
                  />
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center gap-3">
                    <p className="text-sm text-slate-500">No history data yet.</p>
                    <a href="https://ecoflow-poller.argo2d.workers.dev/health" target="_blank" rel="noopener noreferrer"
                      className="text-xs text-green-600 dark:text-green-400 underline">
                      Check Worker health →
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* PG&E tab */}
          {tab==="pge"&&(
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest mb-1">PG&E Grid Usage History</CardTitle>
                <p className="text-xs text-slate-400">282,880 rows · Apr 2018 → Jul 2026 · avg 3.0 kWh/day</p>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex flex-col items-center justify-center gap-2">
                  <p className="text-sm text-slate-500">Run backfill to populate PG&E history in R2.</p>
                  <code className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded">
                    python data/backfill_pge_to_r2.py --upload
                  </code>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Value stacking — full width */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500"/>
                <CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest">
                  Value Stacking · Today
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={valueData} layout="vertical" margin={{left:8,right:16,top:4,bottom:4}}>
                  <CartesianGrid stroke={grid} strokeDasharray="3 3" horizontal={false}/>
                  <XAxis type="number" tick={{fontSize:9,fill:fc}} unit="$" tickFormatter={v=>v.toFixed(3)}/>
                  <YAxis type="category" dataKey="name" tick={{fontSize:9,fill:fc}} width={90}/>
                  <Tooltip content={<ChartTooltip dark={dark}/>}
                    cursor={{fill: dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"}}
                    formatter={(v:any)=>[`$${Number(v).toFixed(4)}`,"value"]}/>
                  <Bar dataKey="value" radius={[0,4,4,0]}>
                    {valueData.map((d,i)=>(
                      <rect key={i} fill={d.fill}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className={`rounded-xl p-3 border ${isPeak()
                ?"border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20"
                :"border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-950/15"}`}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Current rate</span>
                  <span className={`text-xl font-bold font-mono ${isPeak()?"text-red-600 dark:text-red-400":"text-green-600 dark:text-green-400"}`}>
                    ${getRate().toFixed(3)}<span className="text-xs font-normal text-slate-400 ml-1">/kWh</span>
                  </span>
                </div>
                <p className={`text-xs ${isPeak()?"text-red-600 dark:text-red-400":"text-green-600 dark:text-green-400"}`}>
                  {isPeak()?"⚠ Peak 4–9 PM · discharge battery to offset grid costs":"✓ Off-peak · good window to charge from grid if needed"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                {[["Summer peak","$0.52","text-red-600 dark:text-red-400"],
                  ["Summer off","$0.28","text-green-600 dark:text-green-400"],
                  ["Winter peak","$0.43","text-amber-600 dark:text-amber-400"],
                  ["Winter off","$0.26","text-green-600 dark:text-green-400"]].map(([l,v,c])=>(
                  <div key={l} className="flex justify-between">
                    <span className="text-slate-400">{l}</span><span className={c}>{v}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30">
            <CardContent className="pt-5 grid md:grid-cols-2 gap-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>A full-stack home energy management system applying distributed optimization principles from two decades of work at Heila, GELI, and EPRI — running live on an EcoFlow Delta Pro 3, rooftop solar, and 8 years of PG&E interval data.</p>
              <ul className="space-y-1 text-xs text-slate-500">
                <li>⚡ EcoFlow Open API (HMAC-SHA256) · api-a.ecoflow.com</li>
                <li>☀️ Open-Meteo solar irradiance · no API key</li>
                <li>🔋 Python + Plotly Dash · local admin with full controls</li>
                <li>☁️ Cloudflare Worker + R2 · serverless 24/7 archival</li>
                <li>📊 SQLite + Ridge regression · counterfactual PG&E baseline</li>
                <li>⚡ PG&E interval data · 282,880 rows · Apr 2018 → Jul 2026</li>
              </ul>
            </CardContent>
          </Card>

        </motion.div>
      </main>
    </div>
  )
}

export default function EnergyDashboardPage() {
  return <EnergyDashboardContent />
}
