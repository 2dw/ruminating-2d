"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Settings, Check, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

function CombinedSOCBar({ minSoc, backup, maxSoc, onMin, onBackup, onMax }: {
  minSoc: number; backup: number; maxSoc: number
  onMin: (v: number) => void; onBackup: (v: number) => void; onMax: (v: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<"min" | "backup" | "max" | null>(null)

  const [minText, setMinText] = useState(String(minSoc))
  const [backupText, setBackupText] = useState(String(backup))
  const [maxText, setMaxText] = useState(String(maxSoc))

  useEffect(() => { setMinText(String(minSoc)) }, [minSoc])
  useEffect(() => { setBackupText(String(backup)) }, [backup])
  useEffect(() => { setMaxText(String(maxSoc)) }, [maxSoc])

  const pctFromX = useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    return clamp(Math.round(((clientX - rect.left) / rect.width) * 100), 0, 100)
  }, [])

  const onPointerDown = useCallback((thumb: "min" | "backup" | "max") => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = thumb
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const v = pctFromX(e.clientX)
    if (dragRef.current === "min") onMin(clamp(v, 0, maxSoc - 1))
    else if (dragRef.current === "backup") onBackup(clamp(v, minSoc + 1, maxSoc - 1))
    else onMax(clamp(v, minSoc + 1, 100))
  }, [minSoc, maxSoc, onMin, onBackup, onMax, pctFromX])

  const onPointerUp = useCallback(() => { dragRef.current = null }, [])

  const inputCls = "w-12 text-center font-mono text-xs py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-amber-500 font-semibold">Min</span>
          <input type="number" min={0} max={maxSoc - 1} value={minText}
            onChange={e => setMinText(e.target.value)}
            onBlur={() => { const v = clamp(parseInt(minText) || 0, 0, maxSoc - 1); onMin(v); setMinText(String(v)) }}
            onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
            className={inputCls + " text-amber-500"} />
          <span className="text-amber-500 font-mono text-[10px]">%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-green-500 font-semibold">Backup</span>
          <input type="number" min={minSoc + 1} max={maxSoc - 1} value={backupText}
            onChange={e => setBackupText(e.target.value)}
            onBlur={() => { const v = clamp(parseInt(backupText) || backup, minSoc + 1, maxSoc - 1); onBackup(v); setBackupText(String(v)) }}
            onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
            className={inputCls + " text-green-500"} />
          <span className="text-green-500 font-mono text-[10px]">%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-blue-500 font-semibold">Max</span>
          <input type="number" min={minSoc + 1} max={100} value={maxText}
            onChange={e => setMaxText(e.target.value)}
            onBlur={() => { const v = clamp(parseInt(maxText) || maxSoc, minSoc + 1, 100); onMax(v); setMaxText(String(v)) }}
            onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
            className={inputCls + " text-blue-500"} />
          <span className="text-blue-500 font-mono text-[10px]">%</span>
        </div>
      </div>

      <div ref={trackRef} className="relative cursor-pointer touch-none select-none"
        onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="relative h-full rounded-full bg-gradient-to-r from-amber-500/60 via-green-500/40 to-blue-500/60"
            style={{ marginLeft: `${minSoc}%`, width: `${maxSoc - minSoc}%` }}>
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-amber-500 border-2 border-white/50 shadow-lg cursor-grab active:cursor-grabbing z-10"
              style={{ left: "0%" }}
              onPointerDown={onPointerDown("min")} />
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-green-500 border-2 border-white/50 shadow-lg cursor-grab active:cursor-grabbing z-20"
              style={{ left: `${((backup - minSoc) / (maxSoc - minSoc)) * 100}%` }}
              onPointerDown={onPointerDown("backup")} />
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-blue-500 border-2 border-white/50 shadow-lg cursor-grab active:cursor-grabbing z-30"
              style={{ left: "100%" }}
              onPointerDown={onPointerDown("max")} />
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 mt-3">
          <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>
      </div>
    </div>
  )
}

export default function AdminControls() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const [minSoc, setMinSoc] = useState(0)
  const [backup, setBackup] = useState(50)
  const [maxSoc, setMaxSoc] = useState(100)
  const [watts, setWatts] = useState(4000)
  const wattsRef = useRef<HTMLInputElement>(null)
  const [wattsText, setWattsText] = useState("4000")

  async function fetchSettings() {
    setLoading(true)
    try {
      const res = await fetch("/api/ecoflow/admin/battery", { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const d = await res.json()
        const lo = d.discharge_lower ?? 0
        const hi = d.charge_upper ?? 100
        const br = clamp(d.backup_reserve ?? 50, lo + 1, hi - 1)
        const wl = d.charge_limit_watts ?? 4000
        setMinSoc(lo); setMaxSoc(hi); setBackup(br)
        setWatts(wl); setWattsText(String(wl))
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchSettings() }, [])

  useEffect(() => { setBackup(prev => clamp(prev, minSoc + 1, maxSoc - 1)) }, [minSoc, maxSoc])

  async function applySettings() {
    setSending(true); setFeedback(null)
    try {
      const res = await fetch("/api/ecoflow/admin/battery", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ command: "set_all", params: { lowerLimit: minSoc, upperLimit: maxSoc, backupSoc: backup } }),
      })
      const result = await res.json()
      if (result.success) setFeedback({ type: "success", message: "Settings applied" })
      else setFeedback({ type: "error", message: result.error })
    } catch { setFeedback({ type: "error", message: "Connection error" }) }
    setSending(false); setTimeout(() => setFeedback(null), 4000)
  }

  const wattsInputCls = "w-14 text-center font-mono text-xs py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
  const wPct = ((watts - 500) / (4000 - 500)) * 100

  if (loading) return <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60"><CardContent className="pt-4 pb-3"><p className="text-xs text-slate-400 font-mono">Loading battery settings...</p></CardContent></Card>

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Settings className="h-4 w-4 text-green-600 dark:text-green-500" /><CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest">Battery Controls</CardTitle></div>
          <button onClick={fetchSettings} className="text-slate-400 hover:text-green-500 transition-colors"><RefreshCw className="h-3.5 w-3.5" /></button>
        </div>
        <p className="text-xs text-slate-400 mt-1">Drag sliders or type values directly.</p>
      </CardHeader>
      <CardContent className="space-y-5">

        <CombinedSOCBar minSoc={minSoc} backup={backup} maxSoc={maxSoc}
          onMin={setMinSoc} onBackup={setBackup} onMax={setMaxSoc} />

        <div className="opacity-40 pointer-events-none select-none">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">AC Charge Rate</span>
            <span className="w-14 text-center font-mono text-xs py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-500">4000</span>
            <span className="text-xs text-purple-500 font-mono">W</span>
          </div>
          <div className="relative">
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "100%", backgroundColor: "#a855f7" }} />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white/40 shadow-md pointer-events-none"
              style={{ left: "100%", backgroundColor: "#a855f7" }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>500W</span>
            <span className="text-slate-500">Requires EcoFlow app to adjust</span>
            <span>4000W</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button onClick={applySettings} disabled={sending}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors disabled:opacity-50">
            {sending ? "Applying..." : "Apply Settings"}
          </button>
          {feedback && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-1.5 text-xs ${feedback.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {feedback.type === "success" ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              {feedback.message}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
