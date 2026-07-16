"use client"
/**
 * app/professional/endeavors/energy/page.tsx
 *
 * KEY FIX: loading state now clears even on error, so charts always render.
 * Charts fall back to "no data yet" message instead of infinite spinner.
 *
 * New: PG&E historical load profile panel (reads from R2 pge/aggregate/hourly_all.json)
 */

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft, Zap, Eye, Lock, Sun, Battery,
  Activity, Thermometer, DollarSign, TrendingUp,
  ToggleLeft, ToggleRight, Cloud, AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, loading: () => (
  <div className="h-48 flex items-center justify-center">
    <p className="text-xs text-gray-500 font-mono animate-pulse">loading chart...</p>
  </div>
)})

// ── Types ─────────────────────────────────────────────────────────────────────

interface LiveReading {
  timestamp: number; timestamp_iso: string
  soc: number; soh: number
  power_in: number; power_out: number; solar_in: number
  ac_in: number; ac_out: number; temp_c: number
  remain_dsg_min: number; remain_chg_min: number
  min_dsg_soc: number; max_chg_soc: number
  error?: string
}

interface HistoryPoint {
  timestamp_iso: string; soc: number; solar_in: number
  power_out: number; power_in: number; temp_c: number
}

interface PgeHourly {
  timestamp_iso: string; kwh: number; cost_est: number; is_peak: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000
  if (d < 60) return "just now"
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  return `${Math.floor(d / 3600)}h ago`
}

function fmt(m: number) {
  if (!m) return "—"
  const h = Math.floor(m / 60), min = m % 60
  return h === 0 ? `${min}m` : min === 0 ? `${h}h` : `${h}h ${min}m`
}

function socColor(s: number) {
  return s >= 70 ? "#4ade80" : s >= 30 ? "#fbbf24" : "#f87171"
}

function isPeak(date = new Date()) { return date.getHours() >= 16 && date.getHours() < 21 }

function getRate(date = new Date()) {
  const summer = date.getMonth() >= 5 && date.getMonth() <= 8
  return summer ? (isPeak(date) ? 0.52 : 0.28) : (isPeak(date) ? 0.43 : 0.26)
}

function buildPeakShapes(times: string[]) {
  if (!times.length) return []
  const shapes: any[] = []
  const d = new Date(times[0]); d.setHours(0,0,0,0)
  const end = new Date(times[times.length-1])
  while (d <= end) {
    const ps = new Date(d); ps.setHours(16,0,0,0)
    const pe = new Date(d); pe.setHours(21,0,0,0)
    shapes.push({ type:"rect", xref:"x", yref:"paper",
      x0: ps.toISOString(), x1: pe.toISOString(), y0:0, y1:1,
      fillcolor:"rgba(248,113,113,0.07)", line:{width:0} })
    d.setDate(d.getDate()+1)
  }
  return shapes
}

// ── Electron Flow ─────────────────────────────────────────────────────────────

function ElectronFlow({ live }: { live: LiveReading | null }) {
  const soc    = live?.soc ?? 50
  const solar  = live?.solar_in ?? 0
  const gridIn = live?.ac_in ?? 0
  const acOut  = Math.abs(live?.ac_out ?? 0)
  const net    = (live?.power_in ?? 0) - (live?.power_out ?? 0)
  const hasSolar = solar > 10, hasGrid = gridIn > 10, hasLoad = acOut > 10
  const col = socColor(soc)
  const spd = (w: number, base = 400) => Math.max(0.6, 2.8 - w / base)

  return (
    <div className="w-full">
      <style>{`
        @keyframes dash-fwd { from{stroke-dashoffset:48}to{stroke-dashoffset:0} }
        @keyframes node-pulse { 0%,100%{opacity:1}50%{opacity:0.55} }
      `}</style>
      <svg viewBox="0 0 640 300" className="w-full" style={{ maxHeight: 280 }}>
        {/* Solar → Battery */}
        <path d="M 120 80 Q 200 80 262 142" fill="none"
          stroke={hasSolar ? "#fbbf24" : "#1f2937"} strokeWidth="2.5" strokeDasharray="10 6"
          style={hasSolar ? { animation:`dash-fwd ${spd(solar,500)}s linear infinite` } : {}} />
        {hasSolar && <text x="178" y="97" fill="#fbbf24" fontSize="9" fontFamily="monospace" textAnchor="middle">{solar.toFixed(0)}W →</text>}

        {/* Grid → Battery */}
        <path d="M 520 80 Q 440 80 378 142" fill="none"
          stroke={hasGrid ? "#60a5fa" : "#1f2937"} strokeWidth="2.5" strokeDasharray="10 6"
          style={hasGrid ? { animation:`dash-fwd ${spd(gridIn,1800)}s linear infinite` } : {}} />
        {hasGrid && <text x="462" y="97" fill="#60a5fa" fontSize="9" fontFamily="monospace" textAnchor="middle">← {gridIn.toFixed(0)}W</text>}

        {/* Battery → House */}
        <path d="M 320 188 L 320 238" fill="none"
          stroke={hasLoad ? col : "#1f2937"} strokeWidth="3" strokeDasharray="10 6"
          style={hasLoad ? { animation:`dash-fwd ${spd(acOut,1800)}s linear infinite` } : {}} />
        {hasLoad && <text x="336" y="216" fill={col} fontSize="9" fontFamily="monospace">{acOut.toFixed(0)}W</text>}

        {/* House → Grid export (dim) */}
        <path d="M 348 250 Q 480 260 510 96" fill="none" stroke="rgba(167,139,250,0.18)" strokeWidth="1.5" strokeDasharray="5 10" />

        {/* ── Solar node ── */}
        <g>
          {hasSolar && <circle cx="80" cy="70" r="46" fill="none" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.25" style={{animation:"node-pulse 2s ease-in-out infinite"}} />}
          <circle cx="80" cy="70" r="38" fill="#0f0a00" stroke="#fbbf24" strokeWidth={hasSolar?2:1} strokeOpacity={hasSolar?1:0.2} />
          {hasSolar && [0,45,90,135,180,225,270,315].map(a=>(
            <line key={a} x1={80+32*Math.cos(a*Math.PI/180)} y1={70+32*Math.sin(a*Math.PI/180)}
              x2={80+42*Math.cos(a*Math.PI/180)} y2={70+42*Math.sin(a*Math.PI/180)}
              stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.5"/>
          ))}
          <circle cx="80" cy="70" r="17" fill="#fbbf24" fillOpacity={hasSolar?0.9:0.12} />
          <text x="80" y="123" textAnchor="middle" fill="#fbbf24" fontSize="10" fontFamily="monospace" opacity={hasSolar?1:0.3}>☀ Solar</text>
          <text x="80" y="136" textAnchor="middle" fill="#fbbf24" fontSize="9" fontFamily="monospace" opacity={hasSolar?0.8:0.2}>{solar.toFixed(0)} W</text>
        </g>

        {/* ── Battery node ── */}
        <g>
          <circle cx="320" cy="150" r="52" fill="none" stroke={col} strokeWidth="1" strokeOpacity="0.18" style={{animation:"node-pulse 3s ease-in-out infinite"}} />
          <circle cx="320" cy="150" r="44" fill="#080d10" stroke={col} strokeWidth="2.5" />
          {(() => {
            const R=36,cx=320,cy=150,startDeg=-225,totalDeg=270
            const filledDeg=(soc/100)*totalDeg
            const rad=(d:number)=>d*Math.PI/180
            const sx=cx+R*Math.cos(rad(startDeg)),sy=cy+R*Math.sin(rad(startDeg))
            const ex=cx+R*Math.cos(rad(startDeg+totalDeg)),ey=cy+R*Math.sin(rad(startDeg+totalDeg))
            const fx=cx+R*Math.cos(rad(startDeg+filledDeg)),fy=cy+R*Math.sin(rad(startDeg+filledDeg))
            return (<>
              <path d={`M ${sx} ${sy} A ${R} ${R} 0 1 1 ${ex} ${ey}`} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5"/>
              <path d={`M ${sx} ${sy} A ${R} ${R} 0 ${filledDeg>180?1:0} 1 ${fx} ${fy}`} fill="none" stroke={col} strokeWidth="5" strokeLinecap="round" style={{transition:"stroke 0.8s"}}/>
            </>)
          })()}
          <text x="320" y="144" textAnchor="middle" fill={col} fontSize="20" fontWeight="700" fontFamily="monospace">{soc.toFixed(1)}%</text>
          <text x="320" y="160" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">SOC · SOH {live?.soh??100}%</text>
          <text x="320" y="206" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="monospace">⚡ Delta Pro 3 · 4096 Wh</text>
        </g>

        {/* ── Grid node ── */}
        <g>
          {hasGrid && <circle cx="560" cy="70" r="46" fill="none" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.22" style={{animation:"node-pulse 2.5s ease-in-out infinite"}} />}
          <circle cx="560" cy="70" r="38" fill="#00081a" stroke={hasGrid?"#60a5fa":"#1f2937"} strokeWidth={hasGrid?2:1} strokeOpacity={hasGrid?1:0.25} />
          {[-8,0,8].map((dx,i)=>(
            <g key={i}>
              <line x1={560+dx} y1="55" x2={560+dx} y2="85" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity={hasGrid?0.8:0.18}/>
              {i===1&&<><line x1="548" y1="63" x2="572" y2="63" stroke="#60a5fa" strokeWidth="1" strokeOpacity={hasGrid?0.5:0.12}/><line x1="551" y1="73" x2="569" y2="73" stroke="#60a5fa" strokeWidth="1" strokeOpacity={hasGrid?0.5:0.12}/></>}
            </g>
          ))}
          <text x="560" y="123" textAnchor="middle" fill="#60a5fa" fontSize="10" fontFamily="monospace" opacity={hasGrid?1:0.25}>⚡ Grid</text>
          <text x="560" y="136" textAnchor="middle" fill="#60a5fa" fontSize="9" fontFamily="monospace" opacity={hasGrid?0.8:0.2}>{hasGrid?`${gridIn.toFixed(0)} W`:"standby"}</text>
        </g>

        {/* ── House node ── */}
        <g>
          <circle cx="320" cy="263" r="28" fill="#0a0010" stroke="#a78bfa" strokeWidth="2" strokeOpacity={hasLoad?1:0.28}/>
          <polygon points="320,248 308,260 332,260" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity={hasLoad?0.9:0.28}/>
          <rect x="312" y="260" width="16" height="10" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity={hasLoad?0.9:0.28}/>
          {hasLoad && <rect x="317" y="262" width="6" height="5" fill="#a78bfa" fillOpacity="0.4"/>}
          <text x="320" y="302" textAnchor="middle" fill="#a78bfa" fontSize="9" fontFamily="monospace">🏠 {acOut.toFixed(0)} W</text>
        </g>

        {/* Status */}
        <rect x="8" y="282" width="220" height="14" rx="7" fill="rgba(255,255,255,0.04)"/>
        <text x="118" y="293" textAnchor="middle" fill="rgba(255,255,255,0.28)" fontSize="8" fontFamily="monospace">
          {net>0?"↑ charging":"↓ discharging"} · net {Math.abs(net).toFixed(0)}W · {live?timeAgo(live.timestamp_iso):"—"}
        </text>
        <rect x="420" y="282" width="212" height="14" rx="7" fill={isPeak()?"rgba(248,113,113,0.1)":"rgba(74,222,128,0.08)"}/>
        <text x="526" y="293" textAnchor="middle" fill={isPeak()?"#f87171":"#4ade80"} fontSize="8" fontFamily="monospace">
          {isPeak()?"⚠ peak hours":"✓ off-peak"} · ${getRate().toFixed(3)}/kWh
        </text>
      </svg>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, unit, color="", sub }: any) {
  return (
    <Card className="border-slate-800 bg-slate-950/60">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold font-mono" style={{color}}>
              {value}{unit&&<span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
            </p>
            {sub&&<p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
          </div>
          <div className="rounded-xl p-2 bg-slate-800"><Icon className="h-4 w-4 text-green-500"/></div>
        </div>
      </CardContent>
    </Card>
  )
}

function TraceToggle({ label, color, active, onToggle }: any) {
  return (
    <button onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono border transition-all
        ${active?"border-current bg-current/10":"border-slate-700 text-slate-600 opacity-40"}`}
      style={{color:active?color:undefined}}>
      <span className="h-2 w-2 rounded-full inline-block" style={{background:active?color:"#374151"}}/>
      {label}
    </button>
  )
}

// ── Chart base ────────────────────────────────────────────────────────────────

const CLAYOUT: any = {
  paper_bgcolor:"rgba(0,0,0,0)", plot_bgcolor:"rgba(0,0,0,0)",
  font:{color:"#6b7280",family:"JetBrains Mono, monospace",size:11},
  margin:{l:50,r:20,t:24,b:56},
  hoverlabel:{bgcolor:"#0a0f14",bordercolor:"#374151",font:{color:"#e5e7eb",size:11}},
  hovermode:"x unified" as const, dragmode:"pan" as const,
  xaxis:{
    gridcolor:"rgba(55,65,81,0.3)", zeroline:false,
    rangeslider:{visible:true,bgcolor:"rgba(15,23,32,0.8)",bordercolor:"#374151",thickness:0.07},
    rangeselector:{
      bgcolor:"rgba(15,23,32,0.9)",bordercolor:"#374151",borderwidth:1,
      font:{color:"#9ca3af",size:10},
      buttons:[
        {count:3,label:"3h",step:"hour",stepmode:"backward"},
        {count:6,label:"6h",step:"hour",stepmode:"backward"},
        {count:12,label:"12h",step:"hour",stepmode:"backward"},
        {count:1,label:"1d",step:"day",stepmode:"backward"},
        {step:"all",label:"all"},
      ],
    },
  },
  yaxis:{gridcolor:"rgba(55,65,81,0.3)",zeroline:false},
}

const PCFG = {displayModeBar:true,modeBarButtonsToRemove:["lasso2d","select2d","autoScale2d"],
  displaylogo:false,responsive:true,scrollZoom:true}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function EnergyDashboardPage() {
  const router = useRouter()
  const [live, setLive]       = useState<LiveReading|null>(null)
  const [apiError, setApiError] = useState<string|null>(null)
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [pge, setPge]         = useState<PgeHourly[]>([])
  const [loading, setLoading] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [traces, setTraces] = useState({soc:true,solar:true,powerIn:true,powerOut:true,temp:false})
  const [showEnv, setShowEnv] = useState(true)
  const [activeTab, setActiveTab] = useState<"battery"|"pge">("battery")

  const toggle = (k: keyof typeof traces) => setTraces(p=>({...p,[k]:!p[k]}))

  // ── CRITICAL FIX: always clear loading in finally ──────────────────────────
  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch("/api/ecoflow/latest", {cache:"no-store"})
      const data = await res.json()
      if (data.error) {
        setApiError(data.error + (data.hint ? ` · ${data.hint}` : ""))
      } else {
        setLive(data)
        setApiError(null)
        setHistory(prev => [...prev, {
          timestamp_iso: data.timestamp_iso, soc: data.soc,
          solar_in: data.solar_in,
          power_out: Math.abs(data.power_out || data.ac_out || 0),
          power_in: data.power_in, temp_c: data.temp_c,
        }].slice(-300))
      }
    } catch(e) {
      setApiError(`Network error: ${e}`)
    } finally {
      setLoading(false)  // ← ALWAYS clears loading
    }
  }, [])

  const fetchDaily = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0,10)
      const [y,m,d] = today.split("-")
      const key = `telemetry/daily/${y}/${m}/${d}.jsonl`
      const res = await fetch(`/api/ecoflow/admin?action=download&key=${encodeURIComponent(key)}`,
        {headers:{Authorization:`Bearer ${process.env.NEXT_PUBLIC_ECOFLOW_VIEWER_TOKEN||""}`}})
      if (res.ok) {
        const text = await res.text()
        const pts: HistoryPoint[] = text.trim().split("\n").filter(Boolean).map(l=>{
          try { const d=JSON.parse(l); return {timestamp_iso:d.timestamp_iso,soc:d.soc,
            solar_in:d.solar_in,power_out:Math.abs(d.power_out||d.ac_out||0),
            power_in:d.power_in,temp_c:d.temp_c} } catch{return null}
        }).filter(Boolean) as HistoryPoint[]
        if (pts.length>0) setHistory(pts)
      }
    } catch(_) {}
  }, [])

  const fetchPge = useCallback(async () => {
    try {
      const res = await fetch("/api/ecoflow/pge-history?days=90")
      if (res.ok) {
        const json = await res.json()
        setPge(json.data || [])
      }
    } catch(_) {}
  }, [])

  useEffect(() => {
    fetchLive(); fetchDaily(); fetchPge()
    const iv = setInterval(fetchLive, 120_000)
    return () => clearInterval(iv)
  }, [fetchLive, fetchDaily, fetchPge])

  // ── Derived ────────────────────────────────────────────────────────────────

  const times  = history.map(h=>h.timestamp_iso)
  const socs   = history.map(h=>h.soc)
  const solars = history.map(h=>h.solar_in)
  const pouts  = history.map(h=>h.power_out)
  const pins   = history.map(h=>h.power_in)
  const temps  = history.map(h=>h.temp_c)

  const minSoc = live?.min_dsg_soc??12
  const maxSoc = live?.max_chg_soc??100
  const isCharging = (live?.power_in??0)>(live?.power_out??0)
  const net = (live?.power_in??0)-(live?.power_out??0)

  // Solar savings estimate
  let solarOffset=0, peakAvoid=0
  for (let i=1;i<history.length;i++) {
    const dt = new Date(history[i].timestamp_iso)
    const dh = (new Date(history[i].timestamp_iso).getTime()-new Date(history[i-1].timestamp_iso).getTime())/3_600_000
    const rate = getRate(dt)
    solarOffset += Math.min(history[i].solar_in, history[i].power_out)*dh/1000*rate
    if (isPeak(dt)) peakAvoid += Math.max(0,history[i].power_out-history[i].solar_in)*dh/1000*(rate-0.28)
  }
  const totalSaved = Math.max(0,solarOffset)+Math.max(0,peakAvoid)

  // Annotations
  const annotations: any[] = []
  if (history.length>5) {
    const minIdx = socs.indexOf(Math.min(...socs.filter(s=>s>0)))
    if (minIdx>0) annotations.push({
      x:times[minIdx],y:socs[minIdx],xref:"x",yref:"y",
      text:`low ${socs[minIdx].toFixed(0)}%`,showarrow:true,arrowhead:2,arrowsize:0.8,
      arrowcolor:"#fbbf24",font:{color:"#fbbf24",size:9},ax:0,ay:-28,
      bgcolor:"rgba(10,15,20,0.85)",bordercolor:"rgba(251,191,36,0.4)",
    })
    const maxSolIdx = solars.indexOf(Math.max(...solars))
    if (maxSolIdx>0&&solars[maxSolIdx]>50) annotations.push({
      x:times[maxSolIdx],y:socs[maxSolIdx],xref:"x",yref:"y",
      text:"☀ solar peak",showarrow:true,arrowhead:2,arrowsize:0.8,
      arrowcolor:"#fbbf24",font:{color:"#fbbf24",size:9},ax:0,ay:-40,
      bgcolor:"rgba(10,15,20,0.85)",bordercolor:"rgba(251,191,36,0.3)",
    })
  }

  // Battery traces
  const batTraces: any[] = []
  if (traces.soc) batTraces.push({
    x:times,y:socs,name:"SOC %",type:"scatter",mode:"lines",
    fill:"tozeroy",fillcolor:`${socColor(live?.soc??50)}18`,
    line:{color:socColor(live?.soc??50),width:2.5},
    hovertemplate:"<b>%{y:.1f}%</b> SOC<extra></extra>",yaxis:"y",
  })
  if (showEnv&&traces.soc) {
    batTraces.push({x:times,y:times.map(()=>maxSoc),mode:"lines",name:`max ${maxSoc}%`,
      line:{color:"#f87171",width:1,dash:"dot"},hovertemplate:`max charge ${maxSoc}%<extra></extra>`,yaxis:"y"})
    batTraces.push({x:times,y:times.map(()=>minSoc),mode:"lines",name:`min ${minSoc}%`,
      line:{color:"#fbbf24",width:1,dash:"dot"},hovertemplate:`min discharge ${minSoc}%<extra></extra>`,yaxis:"y"})
  }
  if (traces.solar) batTraces.push({
    x:times,y:solars,name:"Solar W",type:"bar",
    marker:{color:"rgba(251,191,36,0.65)"},
    hovertemplate:"<b>%{y:.0f}W</b> solar<extra></extra>",yaxis:"y2",
  })
  if (traces.powerIn) batTraces.push({
    x:times,y:pins,name:"Power In",type:"scatter",mode:"lines",
    fill:"tozeroy",fillcolor:"rgba(96,165,250,0.1)",line:{color:"#60a5fa",width:1.5},
    hovertemplate:"<b>%{y:.0f}W</b> in<extra></extra>",yaxis:"y2",
  })
  if (traces.powerOut) batTraces.push({
    x:times,y:pouts,name:"Power Out",type:"scatter",mode:"lines",
    fill:"tozeroy",fillcolor:"rgba(248,113,113,0.1)",line:{color:"#f87171",width:1.5},
    hovertemplate:"<b>%{y:.0f}W</b> out<extra></extra>",yaxis:"y2",
  })
  if (traces.temp) batTraces.push({
    x:times,y:temps,name:"Temp °C",type:"scatter",mode:"lines",
    line:{color:"#a78bfa",width:1.5,dash:"dot"},
    hovertemplate:"<b>%{y}°C</b><extra></extra>",yaxis:"y3",
  })

  const batLayout: any = {
    ...CLAYOUT, height:460,
    shapes: buildPeakShapes(times),
    annotations,
    yaxis:{...CLAYOUT.yaxis,title:{text:"SOC %",font:{size:10}},domain:[0.38,1],range:[0,105]},
    yaxis2:{...CLAYOUT.yaxis,title:{text:"Watts",font:{size:10}},domain:[0,0.33]},
    yaxis3: traces.temp ? {overlaying:"y2" as const,side:"right" as const,gridcolor:"rgba(0,0,0,0)",title:{text:"°C",font:{size:10}}} : undefined,
    grid:{rows:2,columns:1,pattern:"independent" as const},
    legend:{bgcolor:"rgba(8,13,18,0.85)",bordercolor:"#374151",borderwidth:1,font:{size:10},orientation:"h" as const,y:-0.18,x:0},
  }

  // PG&E traces (last 90 days hourly)
  const pgeTimes  = pge.map(p=>p.timestamp_iso)
  const pgeKwh    = pge.map(p=>p.kwh)
  const pgeCost   = pge.map(p=>p.cost_est)

  // Forecast solar
  const fTimes: string[]=[], fWatts: number[]=[]
  const now2 = new Date()
  for (let h=0;h<24;h++) {
    const t=new Date(now2); t.setHours(now2.getHours()+h,0,0,0)
    fTimes.push(t.toISOString())
    const hr=t.getHours()
    fWatts.push(hr>=6&&hr<=19?Math.max(0,Math.round(460*Math.sin(((hr-6)/13)*Math.PI))):0)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  // Loading state — but with timeout safety
  if (loading) return (
    <div className="min-h-screen bg-[#080d10] flex items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-green-400 text-sm font-mono animate-pulse">reading the battery...</p>
        <p className="text-gray-600 text-xs font-mono">connecting to Cloudflare R2</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fcff] pt-24 dark:bg-[#080d10] dark:text-white transition-colors duration-500">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="space-y-6">

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
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 dark:border-green-800 px-3 py-1 text-xs text-green-700 dark:text-green-400">
                  <Eye className="h-3 w-3"/> view only
                </span>
                {live&&!apiError&&(
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse inline-block"/>
                    {timeAgo(live.timestamp_iso)}
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                EcoFlow Delta Pro 3 · solar · PG&E E-TOU-C · Cloudflare Worker → R2 · polled every 30 min
              </p>
            </div>
          </div>

          {/* API Error banner */}
          {apiError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-900/50 bg-red-950/20 p-4">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0"/>
              <div>
                <p className="text-sm text-red-400 font-medium">R2 connection error</p>
                <p className="text-xs text-red-400/70 mt-1 font-mono">{apiError}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Check Vercel env vars: <code className="text-gray-400">ECOFLOW_R2_ACCESS_KEY_ID</code> and <code className="text-gray-400">ECOFLOW_R2_SECRET_ACCESS_KEY</code>
                </p>
              </div>
            </div>
          )}

          {/* Admin hint */}
          <div>
            <button onClick={()=>setShowHint(v=>!v)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-green-500 transition-colors">
              <Lock className="h-3 w-3"/>{showHint?"hide":"admin access"}
            </button>
            {showHint&&<p className="text-xs text-slate-400 mt-1">Full controls via local Python dashboard — charge limits, scheduling, dispatch settings.</p>}
          </div>

          {/* Stats row */}
          {live&&!apiError&&(
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard icon={Battery} label="SOC" value={live.soc.toFixed(1)} unit="%" color={socColor(live.soc)} sub={`SOH ${live.soh.toFixed(0)}%`}/>
              <StatCard icon={Sun} label="Solar" value={live.solar_in.toFixed(0)} unit="W" color="#fbbf24" sub={live.solar_in>10?"generating":"offline"}/>
              <StatCard icon={Activity} label={isCharging?"Charging":"Output"} value={Math.abs(net).toFixed(0)} unit="W" color={isCharging?"#4ade80":"#f87171"} sub={isCharging?`full in ${fmt(live.remain_chg_min)}`:`${fmt(live.remain_dsg_min)} left`}/>
              <StatCard icon={Thermometer} label="Temp" value={live.temp_c} unit="°C" color="#60a5fa"/>
              <StatCard icon={DollarSign} label="Rate Now" value={`$${getRate().toFixed(3)}`} unit="/kWh" color={isPeak()?"#f87171":"#4ade80"} sub={isPeak()?"⚠ peak":"✓ off-peak"}/>
              <StatCard icon={TrendingUp} label="Saved Today" value={`$${totalSaved.toFixed(2)}`} color="#a78bfa" sub="vs grid-only"/>
            </div>
          )}

          {/* Flow + state */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <Card className="border-slate-800 bg-slate-950/40 lg:col-span-3">
              <CardHeader className="pb-1"><CardTitle className="text-xs text-green-500 uppercase tracking-widest">Live Energy Flow</CardTitle></CardHeader>
              <CardContent className="pt-0"><ElectronFlow live={apiError?null:live}/></CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-950/40 lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-xs text-green-500 uppercase tracking-widest">System State</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {live&&!apiError ? [
                  {label:"Solar In",v:live.solar_in,max:500,color:"#fbbf24",unit:"W"},
                  {label:"Grid / AC In",v:live.ac_in,max:1800,color:"#60a5fa",unit:"W"},
                  {label:"AC Out",v:Math.abs(live.ac_out),max:1800,color:"#f87171",unit:"W"},
                  {label:"Net Flow",v:net,max:1800,color:net>=0?"#4ade80":"#f87171",unit:"W"},
                  {label:"SOC",v:live.soc,max:100,color:socColor(live.soc),unit:"%"},
                ].map(r=>(
                  <div key={r.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{r.label}</span>
                      <span className="font-mono" style={{color:r.color}}>{r.v>=0?"":"−"}{Math.abs(r.v).toFixed(0)}{r.unit}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        animate={{width:`${Math.min(100,Math.abs(r.v)/r.max*100)}%`}}
                        transition={{duration:1.2,ease:"easeOut"}} style={{background:r.color}}/>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-gray-500 py-4 text-center">Waiting for live data...</p>
                )}

                {live&&!apiError&&(
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Charge Envelope</p>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-amber-400">min {minSoc}%</span>
                      <span className="text-red-400">max {maxSoc}%</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-slate-800 overflow-hidden">
                      <div className="absolute inset-y-0 rounded-full bg-amber-400/15" style={{left:0,width:`${minSoc}%`}}/>
                      <motion.div className="absolute inset-y-0 rounded-full"
                        animate={{width:`${Math.max(0,live.soc-minSoc)}%`,left:`${minSoc}%`}}
                        transition={{duration:1.2}} style={{background:socColor(live.soc),opacity:0.75}}/>
                      <div className="absolute inset-y-0 w-0.5 bg-amber-400" style={{left:`${minSoc}%`}}/>
                      <div className="absolute inset-y-0 w-0.5 bg-red-400" style={{left:`${maxSoc}%`}}/>
                    </div>
                    <p className="text-xs text-gray-600 font-mono">
                      {isCharging?`↑ charging · full in ${fmt(live.remain_chg_min)}`:`↓ discharging · ${fmt(live.remain_dsg_min)} remain`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2">
            {(["battery","pge"] as const).map(tab=>(
              <button key={tab} onClick={()=>setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono border transition-all ${activeTab===tab
                  ?"border-green-600 bg-green-600/15 text-green-400"
                  :"border-slate-700 text-slate-500 hover:border-slate-500"}`}>
                {tab==="battery"?"⚡ Battery History":"⚡ PG&E Grid Usage"}
              </button>
            ))}
          </div>

          {/* ── BATTERY TIME SERIES ── */}
          {activeTab==="battery"&&(
            <Card className="border-slate-800 bg-slate-950/40">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-xs text-green-500 uppercase tracking-widest mb-1">Battery Time Series</CardTitle>
                    <p className="text-xs text-gray-500">scroll to zoom · drag to pan · hover for values · red bands = peak hours (4–9 PM)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">limits</span>
                    <button onClick={()=>setShowEnv(v=>!v)} className="text-green-500">
                      {showEnv?<ToggleRight className="h-5 w-5"/>:<ToggleLeft className="h-5 w-5"/>}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <TraceToggle label="SOC %" color={socColor(live?.soc??50)} active={traces.soc} onToggle={()=>toggle("soc")}/>
                  <TraceToggle label="Solar W" color="#fbbf24" active={traces.solar} onToggle={()=>toggle("solar")}/>
                  <TraceToggle label="Power In" color="#60a5fa" active={traces.powerIn} onToggle={()=>toggle("powerIn")}/>
                  <TraceToggle label="Power Out" color="#f87171" active={traces.powerOut} onToggle={()=>toggle("powerOut")}/>
                  <TraceToggle label="Temp °C" color="#a78bfa" active={traces.temp} onToggle={()=>toggle("temp")}/>
                </div>
              </CardHeader>
              <CardContent>
                {history.length>1?(
                  <Plot data={batTraces} layout={batLayout} config={PCFG} style={{width:"100%"}} useResizeHandler/>
                ):(
                  <div className="h-64 flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-gray-500">No history yet for today.</p>
                    <p className="text-xs text-gray-600">The Cloudflare Worker polls every 30 minutes — check back later, or verify the Worker is running at <code className="text-gray-500">ecoflow-poller.argo2d.workers.dev/health</code></p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── PG&E HISTORY ── */}
          {activeTab==="pge"&&(
            <Card className="border-slate-800 bg-slate-950/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs text-green-500 uppercase tracking-widest mb-1">PG&E Grid Usage — Last 90 Days</CardTitle>
                <p className="text-xs text-gray-500">
                  8+ years of 15-min interval data (Apr 2018 → Jul 2026) · avg 3.0 kWh/day · red bands = peak hours
                </p>
              </CardHeader>
              <CardContent>
                {pge.length>0?(
                  <Plot
                    data={[
                      {x:pgeTimes,y:pgeKwh,name:"Usage kWh",type:"bar" as const,
                        marker:{color:pgeTimes.map(t=>isPeak(new Date(t))?"rgba(248,113,113,0.7)":"rgba(96,165,250,0.5)") as any},
                        hovertemplate:"<b>%{y:.3f} kWh</b><extra>grid usage</extra>"},
                      {x:pgeTimes,y:pgeCost,name:"Est. Cost $",type:"scatter" as const,mode:"lines" as const,
                        line:{color:"#a78bfa",width:1.5},yaxis:"y2" as const,
                        hovertemplate:"<b>$%{y:.4f}</b><extra>est. cost</extra>"},
                    ]}
                    layout={{
                      ...CLAYOUT, height:380,
                      shapes: buildPeakShapes(pgeTimes.slice(0,200)),
                      yaxis:{...CLAYOUT.yaxis,title:{text:"kWh",font:{size:10}}},
                      yaxis2:{...CLAYOUT.yaxis,title:{text:"$ cost",font:{size:10}},overlaying:"y" as const,side:"right" as const,gridcolor:"rgba(0,0,0,0)"},
                      legend:{bgcolor:"rgba(8,13,18,0.85)",bordercolor:"#374151",borderwidth:1,font:{size:10},orientation:"h" as const,y:-0.22,x:0},
                    }}
                    config={PCFG} style={{width:"100%"}} useResizeHandler
                  />
                ):(
                  <div className="h-64 flex flex-col items-center justify-center gap-2">
                    <p className="text-sm text-gray-500">PG&E history not yet uploaded to R2.</p>
                    <p className="text-xs text-gray-600">Run <code className="text-gray-400">python backfill_pge_to_r2.py --upload</code> to populate.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Solar forecast + value stacking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="border-slate-800 bg-slate-950/40">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-green-500"/>
                  <CardTitle className="text-xs text-green-500 uppercase tracking-widest">24h Solar Forecast vs Actual</CardTitle>
                </div>
                <p className="text-xs text-gray-500 mt-1">Solar position model · Open-Meteo cloud cover correction in Python dashboard</p>
              </CardHeader>
              <CardContent>
                <Plot
                  data={[
                    {x:fTimes,y:fWatts,type:"scatter" as const,mode:"lines" as const,
                      fill:"tozeroy",fillcolor:"rgba(251,191,36,0.1)",
                      line:{color:"#fbbf24",width:2,dash:"dot" as const},
                      name:"Forecast",hovertemplate:"<b>%{y}W</b> forecast<extra></extra>"},
                    ...(history.length>1?[{
                      x:times,y:solars,type:"scatter" as const,mode:"lines" as const,
                      line:{color:"#f97316",width:2},
                      name:"Actual",hovertemplate:"<b>%{y}W</b> actual<extra></extra>",
                    }]:[]),
                  ]}
                  layout={{...CLAYOUT,height:220,
                    margin:{l:44,r:16,t:16,b:48},
                    xaxis:{...CLAYOUT.xaxis,rangeslider:{visible:false}},
                    yaxis:{...CLAYOUT.yaxis,title:{text:"W",font:{size:10}}},
                    shapes:buildPeakShapes(fTimes),
                    legend:{bgcolor:"rgba(0,0,0,0)",font:{size:10},orientation:"h" as const,y:-0.35},
                  }}
                  config={{...PCFG,displayModeBar:false}} style={{width:"100%"}} useResizeHandler
                />
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-950/40">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500"/>
                  <CardTitle className="text-xs text-green-500 uppercase tracking-widest">Value Stacking · Today</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Plot
                  data={[
                    {x:["Today"],y:[Math.max(0,solarOffset)],type:"bar" as const,name:"Solar offset",
                      marker:{color:"#fbbf24"},hovertemplate:"<b>$%{y:.3f}</b> solar offset<extra></extra>"},
                    {x:["Today"],y:[Math.max(0,peakAvoid)],type:"bar" as const,name:"Peak avoidance",
                      marker:{color:"#4ade80"},hovertemplate:"<b>$%{y:.3f}</b> peak avoidance<extra></extra>"},
                  ]}
                  layout={{...CLAYOUT,height:140,barmode:"stack" as const,
                    margin:{l:44,r:16,t:8,b:40},
                    xaxis:{...CLAYOUT.xaxis,rangeslider:{visible:false}},
                    yaxis:{...CLAYOUT.yaxis,title:{text:"$",font:{size:10}}},
                    legend:{bgcolor:"rgba(0,0,0,0)",font:{size:10},orientation:"h" as const,y:-0.45},
                  }}
                  config={{...PCFG,displayModeBar:false}} style={{width:"100%"}} useResizeHandler
                />
                <div className={`rounded-xl p-3 border ${isPeak()?"border-red-900/40 bg-red-950/20":"border-green-900/40 bg-green-950/15"}`}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Current rate</span>
                    <span className={`text-xl font-bold font-mono ${isPeak()?"text-red-400":"text-green-400"}`}>
                      ${getRate().toFixed(3)}<span className="text-xs font-normal text-gray-500 ml-1">/kWh</span>
                    </span>
                  </div>
                  <p className={`text-xs ${isPeak()?"text-red-400":"text-green-400"}`}>
                    {isPeak()?"⚠ Peak 4–9 PM · discharge battery to offset grid costs":"✓ Off-peak · good window to charge from grid if needed"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                  {[["Summer peak","$0.52","#f87171"],["Summer off","$0.28","#4ade80"],["Winter peak","$0.43","#fbbf24"],["Winter off","$0.26","#4ade80"]].map(([l,v,c])=>(
                    <div key={l as string} className="flex justify-between">
                      <span className="text-gray-500">{l}</span>
                      <span style={{color:c as string}}>{v}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project footer */}
          <Card className="border-slate-800 bg-slate-950/30">
            <CardContent className="pt-5 grid md:grid-cols-2 gap-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>A full-stack home energy management system applying distributed optimization principles from two decades of professional work at Heila, GELI, and EPRI — now running live on an EcoFlow Delta Pro 3, rooftop solar, and 8 years of PG&E interval data, monitored through open APIs and serverless Cloudflare infrastructure.</p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li>⚡ EcoFlow Open API (HMAC-SHA256) · api-a.ecoflow.com · US region</li>
                <li>☀️ Open-Meteo solar irradiance + cloud cover · no API key required</li>
                <li>🔋 Python + Plotly Dash · local admin with full battery controls</li>
                <li>☁️ Cloudflare Worker + R2 · serverless 24/7 archival · zero cost</li>
                <li>📊 SQLite + Ridge regression load model · counterfactual PG&E baseline</li>
                <li>⚡ PG&E interval data · 282,880 rows · Apr 2018 → Jul 2026</li>
                <li>🔮 EcoFlow export · 42,745 rows · Jan 2025 → present</li>
              </ul>
            </CardContent>
          </Card>

        </motion.div>
      </main>
    </div>
  )
}
