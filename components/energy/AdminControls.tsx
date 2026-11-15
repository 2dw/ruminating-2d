"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings, Check, AlertCircle, RefreshCw, Power,
  Zap, Radio, BatteryCharging, ShieldAlert, Info,
  CheckCircle2, Loader2, PlugZap, Gauge
} from "lucide-react"
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

  // Battery Limit States
  const [minSoc, setMinSoc] = useState(0)
  const [backup, setBackup] = useState(50)
  const [maxSoc, setMaxSoc] = useState(100)
  const [chargeLimitWatts, setChargeLimitWatts] = useState(4000)

  // Binary Switch States (Delta Pro 3)
  const [acLvOn, setAcLvOn] = useState(false)
  const [acHvOn, setAcHvOn] = useState(false)
  const [dc12vOn, setDc12vOn] = useState(false)
  const [acLvWatts, setAcLvWatts] = useState(0)
  const [acHvWatts, setAcHvWatts] = useState(0)
  const [dc12vWatts, setDc12vWatts] = useState(0)

  // Grid / AC Input State
  const [acInConnected, setAcInConnected] = useState(false)
  const [acInWatts, setAcInWatts] = useState(0)

  // Switch action loading states
  const [toggling, setToggling] = useState<{ lv?: boolean; hv?: boolean; dc?: boolean }>({})

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
        setMinSoc(lo)
        setMaxSoc(hi)
        setBackup(br)
        setChargeLimitWatts(wl)

        // Switches & telemetry
        setAcLvOn(Boolean(d.ac_lv_out_en))
        setAcHvOn(Boolean(d.ac_hv_out_en))
        setDc12vOn(Boolean(d.dc_12v_out_en))
        setAcLvWatts(Number(d.ac_lv_watts ?? 0))
        setAcHvWatts(Number(d.ac_hv_watts ?? 0))
        setDc12vWatts(Number(d.dc_12v_watts ?? 0))
        setAcInConnected(Boolean(d.ac_in_connected))
        setAcInWatts(Number(d.ac_in_watts ?? 0))
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchSettings() }, [])

  useEffect(() => { setBackup(prev => clamp(prev, minSoc + 1, maxSoc - 1)) }, [minSoc, maxSoc])

  // Direct toggle switch handler
  async function toggleSwitch(type: "lv" | "hv" | "dc") {
    const isCurrentlyOn = type === "lv" ? acLvOn : type === "hv" ? acHvOn : dc12vOn
    const nextState = !isCurrentlyOn
    const command = type === "lv" ? "set_ac_lv_switch" : type === "hv" ? "set_ac_hv_switch" : "set_dc_12v_switch"
    const label = type === "lv" ? "AC (LV)" : type === "hv" ? "AC (HV)" : "12V DC"

    setToggling(prev => ({ ...prev, [type]: true }))
    setFeedback(null)

    // Optimistic UI update
    if (type === "lv") setAcLvOn(nextState)
    else if (type === "hv") setAcHvOn(nextState)
    else setDc12vOn(nextState)

    try {
      const res = await fetch("/api/ecoflow/admin/battery", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ command, params: { enabled: nextState } }),
      })
      const result = await res.json()
      if (result.success) {
        setFeedback({
          type: "success",
          message: `${label} power switched ${nextState ? "ON" : "OFF"}`
        })
      } else {
        // Revert on error
        if (type === "lv") setAcLvOn(isCurrentlyOn)
        else if (type === "hv") setAcHvOn(isCurrentlyOn)
        else setDc12vOn(isCurrentlyOn)
        setFeedback({ type: "error", message: result.error || `Failed to switch ${label}` })
      }
    } catch (err) {
      if (type === "lv") setAcLvOn(isCurrentlyOn)
      else if (type === "hv") setAcHvOn(isCurrentlyOn)
      else setDc12vOn(isCurrentlyOn)
      setFeedback({ type: "error", message: "Network error sending command" })
    } finally {
      setToggling(prev => ({ ...prev, [type]: false }))
      setTimeout(() => setFeedback(null), 5000)
    }
  }

  async function applySettings() {
    setSending(true)
    setFeedback(null)
    try {
      const res = await fetch("/api/ecoflow/admin/battery", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          command: "set_all",
          params: {
            lowerLimit: minSoc,
            upperLimit: maxSoc,
            backupSoc: backup,
            acLvOutEn: acLvOn,
            acHvOutEn: acHvOn,
            dc12vOutEn: dc12vOn,
          }
        }),
      })
      const result = await res.json()
      if (result.success) {
        setFeedback({ type: "success", message: "Battery limits applied successfully" })
      } else {
        setFeedback({ type: "error", message: result.error || "Failed to apply settings" })
      }
    } catch {
      setFeedback({ type: "error", message: "Connection error applying settings" })
    }
    setSending(false)
    setTimeout(() => setFeedback(null), 4000)
  }

  if (loading) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60">
        <CardContent className="pt-6 pb-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
          <Loader2 className="h-4 w-4 animate-spin text-green-500" />
          Loading EcoFlow DELTA Pro 3 controls...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-green-600 dark:text-green-500" />
            <CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest font-semibold">
              DELTA Pro 3 Admin Controls
            </CardTitle>
          </div>
          <button
            onClick={fetchSettings}
            disabled={loading}
            title="Refresh device state"
            className="p-1 rounded-md text-slate-400 hover:text-green-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time binary output switches, charging state, and battery SOC envelope.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Output Power Switches (EcoFlow App Style Cards) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Output Power Switches</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Binary API Controls
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Card 1: AC (LV) Switch */}
            <div
              className={`relative rounded-xl border p-3.5 transition-all duration-200 ${
                acLvOn
                  ? "bg-emerald-500/[0.05] border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                  : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <PlugZap className={`h-4 w-4 ${acLvOn ? "text-emerald-500" : "text-slate-400"}`} />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      AC (LV)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">120V Outlets</span>
                </div>

                <button
                  onClick={() => toggleSwitch("lv")}
                  disabled={toggling.lv}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 ${
                    acLvOn
                      ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95"
                      : "bg-white dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95"
                  } disabled:opacity-50`}
                  title={`Turn ${acLvOn ? "Off" : "On"} AC Low Voltage`}
                >
                  {toggling.lv ? (
                    <Loader2 className="h-4 w-4 animate-spin text-current" />
                  ) : (
                    <Power className="h-4 w-4 stroke-[2.2]" />
                  )}
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-baseline justify-between font-mono">
                <span className="text-[11px] text-slate-400">Power</span>
                <span className={`text-sm font-semibold ${acLvOn && acLvWatts > 0 ? "text-amber-500" : "text-slate-700 dark:text-slate-300"}`}>
                  {acLvWatts} W
                </span>
              </div>
            </div>

            {/* Card 2: AC (HV) Switch */}
            <div
              className={`relative rounded-xl border p-3.5 transition-all duration-200 ${
                acHvOn
                  ? "bg-emerald-500/[0.05] border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                  : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Radio className={`h-4 w-4 ${acHvOn ? "text-emerald-500" : "text-slate-400"}`} />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      AC (HV)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">240V Output</span>
                </div>

                <button
                  onClick={() => toggleSwitch("hv")}
                  disabled={toggling.hv}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 ${
                    acHvOn
                      ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95"
                      : "bg-white dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95"
                  } disabled:opacity-50`}
                  title={`Turn ${acHvOn ? "Off" : "On"} AC High Voltage`}
                >
                  {toggling.hv ? (
                    <Loader2 className="h-4 w-4 animate-spin text-current" />
                  ) : (
                    <Power className="h-4 w-4 stroke-[2.2]" />
                  )}
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-baseline justify-between font-mono">
                <span className="text-[11px] text-slate-400">Power</span>
                <span className={`text-sm font-semibold ${acHvOn && acHvWatts > 0 ? "text-amber-500" : "text-slate-700 dark:text-slate-300"}`}>
                  {acHvWatts} W
                </span>
              </div>
            </div>

            {/* Card 3: 12V DC Switch */}
            <div
              className={`relative rounded-xl border p-3.5 transition-all duration-200 ${
                dc12vOn
                  ? "bg-emerald-500/[0.05] border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                  : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Gauge className={`h-4 w-4 ${dc12vOn ? "text-emerald-500" : "text-slate-400"}`} />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      12V DC
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Auxiliary Port</span>
                </div>

                <button
                  onClick={() => toggleSwitch("dc")}
                  disabled={toggling.dc}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 ${
                    dc12vOn
                      ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95"
                      : "bg-white dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95"
                  } disabled:opacity-50`}
                  title={`Turn ${dc12vOn ? "Off" : "On"} 12V DC`}
                >
                  {toggling.dc ? (
                    <Loader2 className="h-4 w-4 animate-spin text-current" />
                  ) : (
                    <Power className="h-4 w-4 stroke-[2.2]" />
                  )}
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-baseline justify-between font-mono">
                <span className="text-[11px] text-slate-400">Power</span>
                <span className={`text-sm font-semibold ${dc12vOn && dc12vWatts > 0 ? "text-amber-500" : "text-slate-700 dark:text-slate-300"}`}>
                  {dc12vWatts} W
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid & Mains Connection Information Section */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BatteryCharging className={`h-4 w-4 ${acInConnected ? "text-blue-500" : "text-slate-400"}`} />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Grid / Mains Status
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  acInConnected
                    ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                    : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${acInConnected ? "bg-blue-500 animate-pulse" : "bg-slate-400"}`} />
                {acInConnected ? "Mains Connected" : "Off-Grid / Disconnected"}
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-semibold">
                {acInWatts} W
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
            <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
            <div className="space-y-1">
              <p className="leading-relaxed">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Mains vs. Off-Grid Switch Note: </span>
                EcoFlow power stations are designed with an internal automatic transfer relay. When physically connected to a live AC outlet, the unit defaults to grid-bypass/passthrough and standby mode.
              </p>
              <p className="leading-relaxed text-[10px] text-slate-400">
                There is <em>no software API command to electronically open the internal AC input transfer relay</em> while the physical plug is hot. Software controls can pause charging by clamping Max SOC or setting charge wattage to 0W, but complete galvanic off-grid isolation requires an external smart plug / relay or physical disconnect.
              </p>
            </div>
          </div>
        </div>

        {/* Battery SOC Envelope Sliders */}
        <div className="space-y-3 pt-1 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Battery SOC Limits
            </span>
            <span className="text-[10px] text-slate-400">
              Min Discharge · Backup Reserve · Max Charge
            </span>
          </div>

          <CombinedSOCBar
            minSoc={minSoc}
            backup={backup}
            maxSoc={maxSoc}
            onMin={setMinSoc}
            onBackup={setBackup}
            onMax={setMaxSoc}
          />
        </div>

        {/* AC Charge Rate (Read-Only / Fixed info) */}
        <div className="opacity-40 pointer-events-none select-none">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">AC Charge Rate</span>
            <span className="w-14 text-center font-mono text-xs py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-purple-500">
              {chargeLimitWatts}
            </span>
            <span className="text-xs text-purple-500 font-mono">W</span>
          </div>
          <div className="relative">
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${clamp(((chargeLimitWatts - 500) / (4000 - 500)) * 100, 0, 100)}%`, backgroundColor: "#a855f7" }} />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white/40 shadow-md pointer-events-none"
              style={{ left: `${clamp(((chargeLimitWatts - 500) / (4000 - 500)) * 100, 0, 100)}%`, backgroundColor: "#a855f7" }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>500W</span>
            <span className="text-slate-500">Configured via EcoFlow App / API Limits</span>
            <span>4000W</span>
          </div>
        </div>

        {/* Action Controls & Notifications */}
        <div className="flex items-center gap-3 pt-1 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={applySettings}
            disabled={sending}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {sending ? "Applying..." : "Apply SOC Limits"}
          </button>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-1.5 text-xs font-medium ${
                feedback.type === "success"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {feedback.type === "success" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
              {feedback.message}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
