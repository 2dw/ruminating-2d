"use client"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar, Zap, Sun, Shield, Activity, Sparkles, Clock,
  Settings2, Sliders, Check, AlertCircle, Trash2, Plus,
  ChevronRight, RefreshCw, Layers, ArrowUpRight, CheckCircle2,
  Info, Cpu
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer, ComposedChart, Area, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea
} from "recharts"
import { useAuth } from "@/lib/auth-context"

export interface ScheduleTask {
  id: string
  name: string
  enabled: boolean
  startTime: string
  endTime: string
  actionType: "ac_discharge" | "ac_charge" | "solar_charge" | "dc_discharge"
  actionDetail?: string
  minSocCondition?: number
  targetSocCutoff?: number
  repeatDays: number[]
  priority: number
}

export interface OptimizationProfile {
  strategy: "arbitrage" | "solar" | "resilience" | "health" | "multi_objective"
  minSoc: number
  maxSoc: number
  backupReserve: number
  cyclingPenaltyWeight: number
  solarWeight: number
  arbitrageWeight: number
  resilienceWeight: number
}

const STRATEGIES = [
  {
    id: "multi_objective",
    title: "Multi Objective Stacked",
    subtitle: "Thesis formulation balancing arbitrage, solar recapture, reserve SOC, and battery life",
    icon: Sparkles,
    color: "#22c55e",
  },
  {
    id: "arbitrage",
    title: "Economic Arbitrage",
    subtitle: "Maximize peak price discharge between 16:00 and 21:05 with low cost overnight charging",
    icon: Zap,
    color: "#eab308",
  },
  {
    id: "solar",
    title: "Solar Recapture",
    subtitle: "Prioritize daytime solar absorption and shift excess PV generation into evening load",
    icon: Sun,
    color: "#f97316",
  },
  {
    id: "resilience",
    title: "Resilience and Backup",
    subtitle: "Maintain elevated reserve capacity and protect critical loads during contingency events",
    icon: Shield,
    color: "#3b82f6",
  },
  {
    id: "health",
    title: "Battery Health Protection",
    subtitle: "Constrain cycling between 30% and 85% to minimize electrode degradation",
    icon: Activity,
    color: "#a855f7",
  },
] as const

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"]

function daysToBitmask(repeatDays: number[]): number {
  if (!repeatDays || repeatDays.length === 0) return 127
  let mask = 0
  for (const d of repeatDays) {
    mask |= (1 << d)
  }
  return mask
}

function ChartTooltip({ active, payload, label, dark }: any) {
  if (!active || !payload?.length) return null
  const bg = dark ? "#0a0f14" : "#f8fafc"
  const bord = dark ? "#374151" : "#cbd5e1"
  const fc = dark ? "#e5e7eb" : "#1e293b"
  return (
    <div style={{
      background: bg,
      border: `1px solid ${bord}`,
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 11,
      fontFamily: "JetBrains Mono, monospace",
      color: fc,
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
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

export default function SmartScheduler({ dark = false }: { dark?: boolean }) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const [currentSoc, setCurrentSoc] = useState(50)
  const socRef = useRef(50)
  const [isSummer, setIsSummer] = useState(false)
  const [profile, setProfile] = useState<OptimizationProfile>({
    strategy: "multi_objective",
    minSoc: 20,
    maxSoc: 100,
    backupReserve: 50,
    cyclingPenaltyWeight: 1.0,
    solarWeight: 1.0,
    arbitrageWeight: 1.0,
    resilienceWeight: 1.0,
  })
  const [tasks, setTasks] = useState<ScheduleTask[]>([])
  const [optimization, setOptimization] = useState<any>(null)

  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null)
  const [isNewTask, setIsNewTask] = useState(false)
  const [showPayloadPreview, setShowPayloadPreview] = useState(false)

  const fetchBatterySoc = useCallback(async () => {
    try {
      const res = await fetch("/api/ecoflow/admin/battery", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const d = await res.json()
        if (d.success && d.battery?.soc_percent !== undefined) {
          setCurrentSoc(Math.round(d.battery.soc_percent))
        }
      }
    } catch {}
  }, [token])

  const fetchScheduleData = useCallback(async (strategyOverride?: string, socOverride?: number) => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({
        soc: String(socOverride ?? currentSoc),
        strategy: strategyOverride || profile.strategy,
      })
      const res = await fetch(`/api/ecoflow/admin/schedules?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const d = await res.json()
        if (d.success) {
          if (d.profile) setProfile(d.profile)
          if (d.tasks) setTasks(d.tasks)
          if (d.optimization) setOptimization(d.optimization)
          if (d.isSummer !== undefined) setIsSummer(d.isSummer)
        }
      }
    } catch {}
    setLoading(false)
  }, [currentSoc, profile.strategy, token])

  useEffect(() => {
    socRef.current = currentSoc
  }, [currentSoc])

  useEffect(() => {
    fetchBatterySoc()
  }, [fetchBatterySoc])

  useEffect(() => {
    if (currentSoc > 0) fetchScheduleData()
  }, [currentSoc])

  const handleStrategyChange = async (strategy: OptimizationProfile["strategy"]) => {
    const newProfile: OptimizationProfile = {
      ...profile,
      strategy,
      minSoc: strategy === "health" ? 30 : 20,
      maxSoc: strategy === "health" ? 85 : 100,
      backupReserve: strategy === "resilience" ? 75 : 50,
      cyclingPenaltyWeight: strategy === "health" ? 1.5 : 0.5,
      solarWeight: strategy === "solar" ? 1.5 : 1.0,
      arbitrageWeight: strategy === "arbitrage" ? 1.5 : 1.0,
      resilienceWeight: strategy === "resilience" ? 2.0 : 1.0,
    }
    setProfile(newProfile)
    fetchScheduleData(strategy)
  }

  const handleToggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, enabled: !t.enabled } : t)
    setTasks(updatedTasks)
    await saveSchedule(updatedTasks, profile, false)
  }

  const handleDeleteTask = async (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId)
    setTasks(updatedTasks)
    setEditingTask(null)
    await saveSchedule(updatedTasks, profile, false)
  }

  const handleSaveTaskModal = async () => {
    if (!editingTask) return
    let updatedTasks: ScheduleTask[]
    if (isNewTask) {
      updatedTasks = [...tasks, { ...editingTask, id: `task_${Date.now()}` }]
    } else {
      updatedTasks = tasks.map(t => t.id === editingTask.id ? editingTask : t)
    }
    setTasks(updatedTasks)
    setEditingTask(null)
    setIsNewTask(false)
    await saveSchedule(updatedTasks, profile, false)
  }

  const saveSchedule = async (
    tasksToSave: ScheduleTask[],
    profileToSave: OptimizationProfile,
    syncDevice = false
  ) => {
    if (syncDevice) setSyncing(true)
    else setSaving(true)
    setFeedback(null)

    try {
      const res = await fetch("/api/ecoflow/admin/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tasks: tasksToSave,
          profile: profileToSave,
          currentSoc,
          syncDevice,
        }),
      })
      const result = await res.json()
      if (result.success) {
        setOptimization(result.optimization)
        setFeedback({
          type: "success",
          message: syncDevice ? "All tasks and limits synced to EcoFlow battery" : "Schedule saved to cloud storage",
        })
      } else {
        setFeedback({ type: "error", message: result.error || "Failed to update schedule" })
      }
    } catch {
      setFeedback({ type: "error", message: "Network connection error" })
    }

    setSaving(false)
    setSyncing(false)
    setTimeout(() => setFeedback(null), 4000)
  }

  const openNewTaskModal = () => {
    setIsNewTask(true)
    setEditingTask({
      id: "temp",
      name: "Custom Scheduled Task",
      enabled: true,
      startTime: "16:00",
      endTime: "21:05",
      actionType: "ac_discharge",
      actionDetail: "Turn on AC: AC (LV) switch",
      minSocCondition: 20,
      targetSocCutoff: 20,
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      priority: tasks.length + 1,
    })
  }

  const chartData = optimization?.trajectory ?? []
  const metrics = optimization?.metrics ?? {
    dailySavings: 0,
    monthlySavings: 0,
    solarCapturedKWh: 0,
    peakGridOffsetKWh: 0,
    estimatedDailyCycles: 0,
  }

  const grid = dark ? "rgba(55,65,81,0.35)" : "rgba(203,213,222,0.6)"
  const fc = dark ? "#9ca3af" : "#475569"

  const generatedDevicePayload = useMemo(() => {
    return {
      limits: {
        cfgMinDsgSoc: profile.minSoc,
        cfgMaxChgSoc: profile.maxSoc,
        cfgEnergyBackup: {
          energyBackupStartSoc: profile.backupReserve,
          energyBackupEn: true,
        },
      },
      tasks: tasks.map((t, idx) => {
        const [sh, sm] = t.startTime.split(":").map(Number)
        const [eh, em] = t.endTime.split(":").map(Number)
        const startMin = (sh || 0) * 60 + (sm || 0)
        const endMin = (eh || 0) * 60 + (em || 0)
        const timeTable = (endMin << 16) | startMin
        return {
          taskIndex: idx,
          isCfg: true,
          isEnable: Boolean(t.enabled),
          timeMode: "TIME_TASK_MODE_PER_WEEK",
          timeParam: daysToBitmask(t.repeatDays),
          timeTable,
          taskType:
            t.actionType === "ac_discharge"
              ? "TIME_TASK_TYPE_AC_DSG"
              : t.actionType === "solar_charge"
              ? "TIME_TASK_TYPE_DC_CHG"
              : t.actionType === "ac_charge"
              ? "TIME_TASK_TYPE_AC_CHG"
              : "TIME_TASK_TYPE_DC_DSG",
          taskParam: 0,
        }
      }),
    }
  }, [profile, tasks])

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-900">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest">
                Smart Battery Schedule Optimizer
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Model predictive control and stacked task dispatch for EcoFlow Delta Pro 3
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchScheduleData()}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-green-500 transition-colors"
              title="Refresh schedule data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowPayloadPreview(!showPayloadPreview)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors"
            >
              {showPayloadPreview ? "Hide Payload" : "Inspect Payload"}
            </button>
          </div>
        </div>
      </CardHeader>

      {loading && !optimization ? (
        <CardContent className="pt-5">
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="grid grid-cols-5 gap-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
            </div>
            <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4].map(i => <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
            </div>
          </div>
        </CardContent>
      ) : (
      <CardContent className="space-y-6 pt-5">
        {/* Strategy Presets */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              Optimization Strategy
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-400">
                Season: {isSummer ? "Summer Peak ($0.52/kWh)" : "Winter Peak ($0.43/kWh)"}
              </span>
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-mono text-slate-400">SOC:</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={currentSoc}
                  onChange={e => {
                    const val = Math.max(0, Math.min(100, Number(e.target.value)))
                    setCurrentSoc(val)
                    socRef.current = val
                  }}
                  onBlur={() => fetchScheduleData(undefined, socRef.current)}
                  className="w-14 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-300 text-center focus:outline-none focus:border-green-500"
                />
                <span className="text-[11px] font-mono text-slate-400">%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {STRATEGIES.map(s => {
              const Icon = s.icon
              const isSelected = profile.strategy === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => handleStrategyChange(s.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-green-500 bg-green-500/10 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="p-1.5 rounded-lg"
                        style={{ backgroundColor: `${s.color}20`, color: s.color }}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-mono font-bold text-green-600 dark:text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {s.title}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                      {s.subtitle}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 24-Hour Visual Horizon Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/30 dark:bg-slate-900/20 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                24 Hour Optimized Horizon Simulation
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Red band: PG&E On Peak (16:00 to 21:00) · Amber: Solar PV generation · Green: Battery SOC %
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-amber-500">☀ Solar Peak</span>
              <span className="text-red-500">⚡ TOU Peak</span>
              <span className="text-green-500">🔋 Battery SOC</span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                <CartesianGrid stroke={grid} strokeDasharray="3 3" />
                <XAxis dataKey="timeLabel" tick={{ fontSize: 9, fill: fc }} interval={2} />
                <YAxis
                  yAxisId="soc"
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: fc }}
                  width={32}
                  unit="%"
                  orientation="left"
                />
                <YAxis
                  yAxisId="power"
                  domain={[0, "auto"]}
                  tick={{ fontSize: 9, fill: fc }}
                  width={36}
                  unit="W"
                  orientation="right"
                />
                <Tooltip content={<ChartTooltip dark={dark} />} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }} />
                
                {/* Highlight on peak hours */}
                {chartData.map((d: any, i: number) =>
                  d.isPeak && (i === 0 || !chartData[i - 1]?.isPeak) ? (
                    <ReferenceArea
                      key={i}
                      yAxisId="soc"
                      x1={d.timeLabel}
                      x2={chartData.slice(i).find((dd: any, j: number) => j > 0 && !dd.isPeak)?.timeLabel ?? d.timeLabel}
                      fill="rgba(239,68,68,0.08)"
                      strokeOpacity={0}
                    />
                  ) : null
                )}

                <Bar
                  yAxisId="power"
                  dataKey="solarW"
                  name="Solar Gen (W)"
                  fill="rgba(245,158,11,0.3)"
                  radius={[2, 2, 0, 0]}
                />
                <Line
                  yAxisId="soc"
                  type="monotone"
                  dataKey="soc"
                  name="Battery SOC %"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  yAxisId="power"
                  type="stepAfter"
                  dataKey="loadW"
                  name="Home Load (W)"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Financial & Energy Value Stacking Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase">Projected Daily Savings</p>
              <p className="text-base font-bold text-green-600 dark:text-green-400">
                ${metrics.dailySavings.toFixed(2)}
                <span className="text-[10px] font-normal text-slate-400 ml-1">/day</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase">Monthly Value Stack</p>
              <p className="text-base font-bold text-green-600 dark:text-green-400">
                ${metrics.monthlySavings.toFixed(2)}
                <span className="text-[10px] font-normal text-slate-400 ml-1">/mo</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase">Solar Recaptured</p>
              <p className="text-base font-bold text-amber-500">
                {metrics.solarCapturedKWh}
                <span className="text-[10px] font-normal text-slate-400 ml-1">kWh</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase">Peak Grid Offset</p>
              <p className="text-base font-bold text-blue-500">
                {metrics.peakGridOffsetKWh}
                <span className="text-[10px] font-normal text-slate-400 ml-1">kWh</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stacked Tasks Section matching EcoFlow App */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider">
                Stacked Task Schedule
              </p>
              <p className="text-[11px] text-slate-400">
                Automated battery dispatch rules mirroring EcoFlow mobile task settings
              </p>
            </div>
            <button
              onClick={openNewTaskModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.map(task => {
              const isDischarge = task.actionType === "ac_discharge"
              const isSolar = task.actionType === "solar_charge"
              const isCharge = task.actionType === "ac_charge"

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between flex-wrap gap-3 ${
                    task.enabled
                      ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                      : "border-slate-200/50 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/30 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isDischarge
                          ? "bg-amber-500/10 text-amber-500"
                          : isSolar
                          ? "bg-orange-500/10 text-orange-500"
                          : isCharge
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-purple-500/10 text-purple-500"
                      }`}
                    >
                      {isDischarge ? (
                        <Zap className="h-4 w-4" />
                      ) : isSolar ? (
                        <Sun className="h-4 w-4" />
                      ) : isCharge ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <Cpu className="h-4 w-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {task.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
                          {task.startTime} to {task.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                        <span className="text-slate-300 dark:text-slate-400">
                          {task.actionDetail || task.actionType}
                        </span>
                        {task.minSocCondition !== undefined && task.minSocCondition > 0 && (
                          <span>· If SOC &gt; {task.minSocCondition}%</span>
                        )}
                        {task.targetSocCutoff !== undefined && (
                          <span>· Cutoff: {task.targetSocCutoff}%</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Days indicator */}
                    <div className="flex gap-1">
                      {DAYS_OF_WEEK.map((day, idx) => (
                        <span
                          key={idx}
                          className={`w-4 h-4 text-[9px] font-mono flex items-center justify-center rounded-full ${
                            task.repeatDays.includes(idx)
                              ? "bg-blue-600 text-white font-bold"
                              : "bg-slate-100 dark:bg-slate-900 text-slate-400"
                          }`}
                        >
                          {day}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-3">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors ${
                          task.enabled
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        {task.enabled ? "Active" : "Disabled"}
                      </button>

                      <button
                        onClick={() => {
                          setIsNewTask(false)
                          setEditingTask(task)
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="Edit Task"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Payload Preview */}
        {showPayloadPreview && (
          <div className="p-3.5 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
              <span>Generated EcoFlow Open API Device Quota Payload</span>
              <span>cmdId: 17 · cmdFunc: 254 · cfgTimeTaskV2Item</span>
            </div>
            <pre className="overflow-x-auto text-[11px] text-green-400 leading-relaxed">
              {JSON.stringify(generatedDevicePayload, null, 2)}
            </pre>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => saveSchedule(tasks, profile, true)}
              disabled={syncing || saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {syncing ? "Syncing with Battery..." : "Sync Schedule to EcoFlow"}
            </button>

            <button
              onClick={() => saveSchedule(tasks, profile, false)}
              disabled={saving || syncing}
              className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-mono transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save to Cloud"}
            </button>
          </div>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-1.5 text-xs font-mono ${
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
      )}

      {/* Task Modal matching EcoFlow mobile app screenshot */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#12161f] border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl space-y-6 font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100">
                  {isNewTask ? "New Task" : "Edit Task"}
                </h3>
                <button
                  onClick={() => setEditingTask(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* IF Section */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">If (Time Window)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#1a202c] border border-slate-700/60 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block mb-1">Start Time (24h)</span>
                    <input
                      type="text"
                      placeholder="16:00"
                      value={editingTask.startTime}
                      onChange={e => setEditingTask({ ...editingTask, startTime: e.target.value })}
                      className="w-full bg-transparent font-mono text-base font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div className="p-3 bg-[#1a202c] border border-slate-700/60 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block mb-1">End Time (24h)</span>
                    <input
                      type="text"
                      placeholder="21:05"
                      value={editingTask.endTime}
                      onChange={e => setEditingTask({ ...editingTask, endTime: e.target.value })}
                      className="w-full bg-transparent font-mono text-base font-bold text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* THEN Section */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Then (Action)</label>
                <div className="space-y-2">
                  {[
                    {
                      type: "ac_discharge",
                      label: "AC discharging switch",
                      detail: "Turn on AC: AC (LV) switch",
                    },
                    {
                      type: "solar_charge",
                      label: "Solar/Car charging",
                      detail: "Solar/Car charging, Solar",
                    },
                    {
                      type: "ac_charge",
                      label: "AC charging",
                      detail: "Grid charging off peak",
                    },
                    {
                      type: "dc_discharge",
                      label: "12V DC discharging switch",
                      detail: "Maintain auxiliary 12V output",
                    },
                  ].map(act => {
                    const isSelected = editingTask.actionType === act.type
                    return (
                      <div
                        key={act.type}
                        onClick={() =>
                          setEditingTask({
                            ...editingTask,
                            actionType: act.type as any,
                            actionDetail: act.detail,
                          })
                        }
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-800 bg-[#1a202c]/60 hover:border-slate-700"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-100">{act.label}</p>
                          <p className="text-[11px] text-slate-400">{act.detail}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-blue-500 bg-blue-500"
                              : "border-slate-600 bg-transparent"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* REPEAT Section */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Repeat</label>
                <div className="flex justify-between gap-1 p-2 bg-[#1a202c] border border-slate-700/60 rounded-2xl">
                  {DAYS_OF_WEEK.map((day, idx) => {
                    const isDaySelected = editingTask.repeatDays.includes(idx)
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const days = isDaySelected
                            ? editingTask.repeatDays.filter(d => d !== idx)
                            : [...editingTask.repeatDays, idx]
                          setEditingTask({ ...editingTask, repeatDays: days })
                        }}
                        className={`w-8 h-8 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-colors ${
                          isDaySelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Footer Modal Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                {!isNewTask && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(editingTask.id)}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    Delete task
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTaskModal}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                  >
                    Save Task
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Card>
  )
}
