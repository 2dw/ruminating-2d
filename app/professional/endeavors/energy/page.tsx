"use client"
/**
 * app/professional/endeavors/energy/page.tsx
 *
 * Replaces react-plotly.js with custom SVG charts — eliminates all
 * dynamic import / SSR / hydration issues that were preventing render.
 *
 * Charts implemented:
 *  - SOC history line chart with peak shading and envelope bands
 *  - Power flow bar/line chart (solar, power in, power out)
 *  - Solar forecast vs actual
 *  - Value stacking bar chart
 *  - Animated electron flow diagram
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft, Zap, Eye, Lock, Sun, Battery, Activity,
  Thermometer, DollarSign, TrendingUp, Cloud, AlertCircle, RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  timestamp_iso: string
  soc: number; solar_in: number
  power_out: number; power_in: number; temp_c: number
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

// ── SVG Chart primitives ──────────────────────────────────────────────────────

function useDims(ref: React.RefObject<HTMLDivElement>) {
  const [w, setW] = useState(600)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(entries => setW(entries[0].contentRect.width))
    ro.observe(ref.current)
    setW(ref.current.offsetWidth)
    return () => ro.disconnect()
  }, [ref])
  return w
}

interface ChartProps {
  data: Pt[]
  height?: number
  minSoc?: number
  maxSoc?: number
  showEnv?: boolean
  dark?: boolean
}

function SocChart({ data, height = 200, minSoc = 12, maxSoc = 100, showEnv = true, dark = false }: ChartProps) {
  const ref  = useRef<HTMLDivElement>(null)
  const W    = useDims(ref)
  const H    = height
  const pad  = { l: 38, r: 12, t: 16, b: 28 }
  const cw   = W - pad.l - pad.r
  const ch   = H - pad.t - pad.b

  if (data.length < 1) return <div ref={ref} style={{ height }} className="flex items-center justify-center"><p className="text-xs text-slate-400">No data yet</p></div>

  const socs  = data.map(d => d.soc)
  const minY  = 0, maxY = 105
  const scaleX = (i: number) => (i / Math.max(data.length - 1, 1)) * cw
  const scaleY = (v: number) => ch - ((v - minY) / (maxY - minY)) * ch

  const linePts = data.map((d, i) => `${scaleX(i)},${scaleY(d.soc)}`).join(" ")
  const areaPts = `${scaleX(0)},${ch} ` + linePts + ` ${scaleX(data.length - 1)},${ch}`

  // Peak hour shading
  const peakBands: { x: number; w: number }[] = []
  data.forEach((d, i) => {
    const hr = new Date(d.timestamp_iso).getHours()
    if (hr >= 16 && hr < 21 && i < data.length - 1) {
      peakBands.push({ x: scaleX(i), w: scaleX(i + 1) - scaleX(i) })
    }
  })

  const col = socCol(socs[socs.length - 1] ?? 50)
  const grid = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
  const fc   = dark ? "#9ca3af" : "#64748b"
  const labelY = [0, 25, 50, 75, 100]

  // Time labels
  const timeLabels = [0, Math.floor(data.length / 2), data.length - 1].filter(i => i < data.length)

  return (
    <div ref={ref} style={{ height }}>
      <svg width={W} height={H}>
        <g transform={`translate(${pad.l},${pad.t})`}>
          {/* Grid */}
          {labelY.map(v => (
            <g key={v}>
              <line x1={0} y1={scaleY(v)} x2={cw} y2={scaleY(v)} stroke={grid} strokeWidth="1" />
              <text x={-4} y={scaleY(v) + 4} textAnchor="end" fontSize="9" fill={fc}>{v}%</text>
            </g>
          ))}

          {/* Peak shading */}
          {peakBands.map((b, i) => (
            <rect key={i} x={b.x} y={0} width={b.w} height={ch}
              fill="rgba(239,68,68,0.08)" />
          ))}

          {/* Envelope bands */}
          {showEnv && (
            <>
              <line x1={0} y1={scaleY(maxSoc)} x2={cw} y2={scaleY(maxSoc)}
                stroke="#f87171" strokeWidth="1" strokeDasharray="4 3" />
              <line x1={0} y1={scaleY(minSoc)} x2={cw} y2={scaleY(minSoc)}
                stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 3" />
              <text x={cw - 2} y={scaleY(maxSoc) - 3} textAnchor="end" fontSize="8" fill="#f87171">max {maxSoc}%</text>
              <text x={cw - 2} y={scaleY(minSoc) - 3} textAnchor="end" fontSize="8" fill="#fbbf24">min {minSoc}%</text>
            </>
          )}

          {/* Area fill */}
          <polygon points={areaPts} fill={col} fillOpacity="0.12" />

          {/* Line */}
          <polyline points={linePts} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round" />

          {/* Current value dot */}
          <circle cx={scaleX(data.length - 1)} cy={scaleY(socs[socs.length - 1])}
            r="3.5" fill={col} />

          {/* Time labels */}
          {timeLabels.map(i => (
            <text key={i} x={scaleX(i)} y={ch + 18} textAnchor="middle" fontSize="8" fill={fc}>
              {new Date(data[i].timestamp_iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </text>
          ))}
        </g>
      </svg>
    </div>
  )
}

function PowerChart({ data, height = 160, dark = false }: ChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const W   = useDims(ref)
  const H   = height
  const pad = { l: 42, r: 12, t: 8, b: 24 }
  const cw  = W - pad.l - pad.r
  const ch  = H - pad.t - pad.b

  if (data.length < 1) return <div ref={ref} style={{ height }} />

  const maxW = Math.max(...data.map(d => Math.max(d.power_in, d.power_out, d.solar_in)), 100)
  const scaleX = (i: number) => (i / Math.max(data.length - 1, 1)) * cw
  const scaleY = (v: number) => ch - (v / maxW) * ch
  const grid = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
  const fc   = dark ? "#9ca3af" : "#64748b"

  const line = (vals: number[], color: string) =>
    vals.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ")

  return (
    <div ref={ref} style={{ height }}>
      <svg width={W} height={H}>
        <g transform={`translate(${pad.l},${pad.t})`}>
          {[0, maxW / 2, maxW].map(v => (
            <g key={v}>
              <line x1={0} y1={scaleY(v)} x2={cw} y2={scaleY(v)} stroke={grid} strokeWidth="1" />
              <text x={-4} y={scaleY(v) + 4} textAnchor="end" fontSize="8" fill={fc}>
                {v >= 1000 ? `${(v/1000).toFixed(1)}k` : Math.round(v)}
              </text>
            </g>
          ))}

          {/* Solar bars */}
          {data.map((d, i) => {
            const bw = Math.max(1, cw / data.length - 1)
            return d.solar_in > 0 ? (
              <rect key={i} x={scaleX(i) - bw / 2} y={scaleY(d.solar_in)}
                width={bw} height={ch - scaleY(d.solar_in)}
                fill="rgba(251,191,36,0.5)" />
            ) : null
          })}

          {/* Power in line */}
          <polyline points={line(data.map(d => d.power_in), "#60a5fa")}
            fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Power out line */}
          <polyline points={line(data.map(d => d.power_out), "#f87171")}
            fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Legend */}
          {[["#fbbf24","Solar"],["#60a5fa","In"],["#f87171","Out"]].map(([c,l],i) => (
            <g key={l} transform={`translate(${i * 48},${ch + 14})`}>
              <line x1={0} y1={0} x2={12} y2={0} stroke={c} strokeWidth="2" />
              <text x={15} y={4} fontSize="8" fill={fc}>{l}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

function ForecastChart({ actual, dark = false }: { actual: Pt[]; dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const W   = useDims(ref)
  const H   = 160
  const pad = { l: 38, r: 12, t: 8, b: 24 }
  const cw  = W - pad.l - pad.r
  const ch  = H - pad.t - pad.b

  const now = new Date()
  const forecast = Array.from({ length: 24 }, (_, h) => {
    const t = new Date(now); t.setHours(now.getHours() + h, 0, 0, 0)
    const hr = t.getHours()
    return { t: t.toISOString(), w: hr >= 6 && hr <= 19 ? Math.max(0, Math.round(460 * Math.sin(((hr - 6) / 13) * Math.PI))) : 0 }
  })

  const maxW = Math.max(...forecast.map(f => f.w), 100)
  const scaleX = (i: number, total: number) => (i / Math.max(total - 1, 1)) * cw
  const scaleY = (v: number) => ch - (v / maxW) * ch
  const grid = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
  const fc   = dark ? "#9ca3af" : "#64748b"

  const fPts = forecast.map((f, i) => `${scaleX(i, forecast.length)},${scaleY(f.w)}`).join(" ")
  const fArea = `${scaleX(0, forecast.length)},${ch} ${fPts} ${scaleX(forecast.length-1, forecast.length)},${ch}`

  return (
    <div ref={ref} style={{ height: H }}>
      <svg width={W} height={H}>
        <g transform={`translate(${pad.l},${pad.t})`}>
          {[0, maxW/2, maxW].map(v => (
            <g key={v}>
              <line x1={0} y1={scaleY(v)} x2={cw} y2={scaleY(v)} stroke={grid} strokeWidth="1"/>
              <text x={-4} y={scaleY(v)+4} textAnchor="end" fontSize="8" fill={fc}>{Math.round(v)}W</text>
            </g>
          ))}
          <polygon points={fArea} fill="rgba(251,191,36,0.12)"/>
          <polyline points={fPts} fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2"/>
          {actual.length > 0 && (
            <polyline
              points={actual.map((d,i)=>`${scaleX(i,actual.length)},${scaleY(d.solar_in)}`).join(" ")}
              fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round"/>
          )}
          <g transform={`translate(0,${ch+14})`}>
            <line x1={0} y1={0} x2={12} y2={0} stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2"/>
            <text x={15} y={4} fontSize="8" fill={fc}>Forecast</text>
            <line x1={55} y1={0} x2={67} y2={0} stroke="#f97316" strokeWidth="2"/>
            <text x={70} y={4} fontSize="8" fill={fc}>Actual</text>
          </g>
        </g>
      </svg>
    </div>
  )
}

function ValueChart({ solarOff, peakAv, dark = false }: { solarOff: number; peakAv: number; dark?: boolean }) {
  const total = solarOff + peakAv || 0.01
  const W = 200, H = 32
  const fc = dark ? "#9ca3af" : "#64748b"
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-amber-600 dark:text-amber-400">☀ solar ${solarOff.toFixed(3)}</span>
        <span className="text-green-600 dark:text-green-400">⚡ peak ${peakAv.toFixed(3)}</span>
      </div>
      <div className="h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex">
        <div className="h-full bg-amber-500 transition-all duration-700"
          style={{ width: `${(solarOff / total) * 100}%` }} />
        <div className="h-full bg-green-500 transition-all duration-700"
          style={{ width: `${(peakAv / total) * 100}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>solar offset</span>
        <span>peak avoidance</span>
      </div>
    </div>
  )
}

// ── Electron flow ─────────────────────────────────────────────────────────────

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
        {/* Lines */}
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

        {/* Solar */}
        <g>{hs&&<circle cx="80" cy="70" r="46" fill="none" stroke="#fbbf24" strokeWidth="1" strokeOpacity=".3" style={{animation:"efp 2s ease-in-out infinite"}}/>}
          <circle cx="80" cy="70" r="38" fill={dark?"#0f0a00":"#fefce8"} stroke="#fbbf24" strokeWidth={hs?2:1} strokeOpacity={hs?1:0.3}/>
          {hs&&[0,45,90,135,180,225,270,315].map(a=><line key={a} x1={80+32*Math.cos(a*Math.PI/180)} y1={70+32*Math.sin(a*Math.PI/180)} x2={80+42*Math.cos(a*Math.PI/180)} y2={70+42*Math.sin(a*Math.PI/180)} stroke="#fbbf24" strokeWidth="1.5" strokeOpacity=".5"/>)}
          <circle cx="80" cy="70" r="17" fill="#fbbf24" fillOpacity={hs?.9:.15}/>
          <text x="80" y="123" textAnchor="middle" fill="#d97706" fontSize="10" fontFamily="monospace" opacity={hs?1:.35}>☀ Solar</text>
          <text x="80" y="136" textAnchor="middle" fill="#d97706" fontSize="9" fontFamily="monospace" opacity={hs?.8:.25}>{sol.toFixed(0)} W</text>
        </g>

        {/* Battery */}
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

        {/* Grid */}
        <g>{hg&&<circle cx="560" cy="70" r="46" fill="none" stroke="#60a5fa" strokeWidth="1" strokeOpacity=".25" style={{animation:"efp 2.5s ease-in-out infinite"}}/>}
          <circle cx="560" cy="70" r="38" fill={dark?"#00081a":"#eff6ff"} stroke={hg?"#60a5fa":dim} strokeWidth={hg?2:1} strokeOpacity={hg?1:.3}/>
          {[-8,0,8].map((dx,i)=><g key={i}><line x1={560+dx} y1="55" x2={560+dx} y2="85" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity={hg?.8:.2}/>
            {i===1&&<><line x1="548" y1="63" x2="572" y2="63" stroke="#3b82f6" strokeWidth="1" strokeOpacity={hg?.5:.1}/><line x1="551" y1="73" x2="569" y2="73" stroke="#3b82f6" strokeWidth="1" strokeOpacity={hg?.5:.1}/></>}</g>)}
          <text x="560" y="123" textAnchor="middle" fill="#2563eb" fontSize="10" fontFamily="monospace" opacity={hg?1:.3}>⚡ Grid</text>
          <text x="560" y="136" textAnchor="middle" fill="#2563eb" fontSize="9" fontFamily="monospace" opacity={hg?.8:.22}>{hg?`${gin.toFixed(0)} W`:"standby"}</text>
        </g>

        {/* House */}
        <g>
          <circle cx="320" cy="263" r="28" fill={dark?"#0a0010":"#faf5ff"} stroke="#7c3aed" strokeWidth="2" strokeOpacity={hl?1:.3}/>
          <polygon points="320,248 308,260 332,260" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity={hl?.9:.3}/>
          <rect x="312" y="260" width="16" height="10" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity={hl?.9:.3}/>
          {hl&&<rect x="317" y="262" width="6" height="5" fill="#7c3aed" fillOpacity=".35"/>}
          <text x="320" y="302" textAnchor="middle" fill="#7c3aed" fontSize="9" fontFamily="monospace">🏠 {aout.toFixed(0)} W</text>
        </g>

        {/* Status */}
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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function EnergyDashboardPage() {
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
  const [showEnv, setShowEnv]   = useState(true)
  const [tab, setTab]           = useState<"battery"|"pge">("battery")

  const fetchLive = useCallback(async () => {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    try {
      const res  = await fetch("/api/ecoflow/latest", { cache:"no-store", signal:ctrl.signal })
      const data = await res.json()
      if (data.error) { setApiError(data.error) }
      else { setLive(data); setApiError(null) }
    } catch (e: any) {
      setApiError(e.name === "AbortError" ? "Request timed out" : e.message)
    } finally { clearTimeout(t); setLoading(false) }
  }, [])

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/ecoflow/history?days=2", { cache:"no-store" })
      if (!res.ok) return
      const json = await res.json()
      const pts: Pt[] = (json.data ?? []).map((d: any) => ({
        timestamp_iso: d.timestamp_iso,
        soc:       d.soc,
        solar_in:  d.solar_in,
        power_out: Math.abs(d.power_out || d.ac_out || 0),
        power_in:  d.power_in,
        temp_c:    d.temp_c,
      }))
      if (pts.length > 0) setHistory(pts)
    } catch (_) {}
  }, [])

  useEffect(() => {
    fetchLive(); fetchHistory()
    const iv = setInterval(() => { fetchLive(); fetchHistory() }, 120_000)
    return () => clearInterval(iv)
  }, [fetchLive, fetchHistory])

  // Savings
  let solOff=0, pkAv=0
  for (let i=1;i<history.length;i++){
    const dt=new Date(history[i].timestamp_iso)
    const dh=(new Date(history[i].timestamp_iso).getTime()-new Date(history[i-1].timestamp_iso).getTime())/3_600_000
    const r=getRate(dt)
    solOff+=Math.min(history[i].solar_in,history[i].power_out)*dh/1000*r
    if(isPeak(dt)) pkAv+=Math.max(0,history[i].power_out-history[i].solar_in)*dh/1000*(r-0.28)
  }

  const isC  = (live?.power_in??0)>(live?.power_out??0)
  const net  = (live?.power_in??0)-(live?.power_out??0)
  const minS = live?.min_dsg_soc??12
  const maxS = live?.max_chg_soc??100

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

          {/* Admin */}
          <div>
            <button onClick={()=>setShowHint(v=>!v)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              <Lock className="h-3 w-3"/>{showHint?"hide":"admin access"}
            </button>
            {showHint&&<p className="text-xs text-slate-400 mt-1">Full controls via local Python dashboard.</p>}
          </div>

          {/* Stats */}
          {live&&!apiError&&(
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <SC icon={Battery} label="SOC" value={live.soc.toFixed(1)} unit="%" color={socCol(live.soc)} sub={`SOH ${live.soh}%`}/>
              <SC icon={Sun} label="Solar" value={live.solar_in.toFixed(0)} unit="W" color="#d97706" sub={live.solar_in>10?"generating":"offline"}/>
              <SC icon={Activity} label={isC?"Charging":"Output"} value={Math.abs(net).toFixed(0)} unit="W" color={isC?"#16a34a":"#dc2626"} sub={isC?`full in ${hhmm(live.remain_chg_min)}`:`${hhmm(live.remain_dsg_min)} left`}/>
              <SC icon={Thermometer} label="Temp" value={live.temp_c} unit="°C" color="#2563eb"/>
              <SC icon={DollarSign} label="Rate Now" value={`$${getRate().toFixed(3)}`} unit="/kWh" color={isPeak()?"#dc2626":"#16a34a"} sub={isPeak()?"⚠ peak":"✓ off-peak"}/>
              <SC icon={TrendingUp} label="Saved Today" value={`$${(Math.max(0,solOff)+Math.max(0,pkAv)).toFixed(2)}`} color="#7c3aed" sub="vs grid-only"/>
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
                  {label:"Solar In",v:live.solar_in,max:500,color:"#d97706",unit:"W"},
                  {label:"Grid / AC In",v:live.ac_in,max:1800,color:"#2563eb",unit:"W"},
                  {label:"AC Out",v:Math.abs(live.ac_out),max:1800,color:"#dc2626",unit:"W"},
                  {label:"Net Flow",v:net,max:1800,color:net>=0?"#16a34a":"#dc2626",unit:"W"},
                  {label:"SOC",v:live.soc,max:100,color:socCol(live.soc),unit:"%"},
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
          <div className="flex gap-2">
            {(["battery","pge"] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono border transition-all ${tab===t
                  ?"border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                  :"border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`}>
                {t==="battery"?"⚡ Battery History":"📊 PG&E Grid Usage"}
              </button>
            ))}
          </div>

          {/* Battery charts */}
          {tab==="battery"&&(
            <div className="space-y-4">
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest mb-1">SOC History</CardTitle>
                      <p className="text-xs text-slate-400">red bands = peak hours (4–9 PM)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">limits</span>
                      <button onClick={()=>setShowEnv(v=>!v)}
                        className="text-xs px-2 py-0.5 rounded-full border border-green-300 dark:border-green-700 text-green-600 dark:text-green-400">
                        {showEnv?"hide":"show"}
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <SocChart data={history} minSoc={minS} maxSoc={maxS} showEnv={showEnv} dark={dark}/>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest">Power Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <PowerChart data={history} dark={dark}/>
                </CardContent>
              </Card>
            </div>
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

          {/* Solar forecast + savings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-green-600 dark:text-green-500"/>
                  <CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest">24h Solar Forecast vs Actual</CardTitle>
                </div>
              </CardHeader>
              <CardContent><ForecastChart actual={history} dark={dark}/></CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500"/>
                  <CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest">Value Stacking · Today</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ValueChart solarOff={Math.max(0,solOff)} peakAv={Math.max(0,pkAv)} dark={dark}/>
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
                  {[["Summer peak","$0.52","text-red-600 dark:text-red-400"],["Summer off","$0.28","text-green-600 dark:text-green-400"],
                    ["Winter peak","$0.43","text-amber-600 dark:text-amber-400"],["Winter off","$0.26","text-green-600 dark:text-green-400"]].map(([l,v,c])=>(
                    <div key={l} className="flex justify-between">
                      <span className="text-slate-400">{l}</span><span className={c}>{v}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

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
