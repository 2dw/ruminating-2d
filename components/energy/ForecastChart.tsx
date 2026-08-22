"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from "recharts"

interface ForecastPoint { timestamp: string; soc: number; solar_w: number; load_w: number; net_w: number; grid_draw_w: number; rate_per_kwh: number; is_peak: boolean; action: string }
interface ForecastData { forecasts: ForecastPoint[]; recommendation: { optimal_charge_start: string | null; peak_window_start: string | null; min_soc_forecast: number; max_soc_forecast: number; projected_cost_24h: number; current_rate: number; is_peak_now: boolean } }

function fmtTime(iso: string) { const d = new Date(iso); return `${d.toLocaleString([], { month: "short" })} ${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:00` }

function ChartTooltip({ active, payload, label, dark }: any) {
  if (!active || !payload?.length) return null
  const bg = dark ? "#0a0f14" : "#f8fafc", bord = dark ? "#374151" : "#cbd5e1", fc = dark ? "#e5e7eb" : "#1e293b"
  return (
    <div style={{ background: bg, border: `1px solid ${bord}`, borderRadius: 8, padding: "8px 12px", fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: fc, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
      <p style={{ marginBottom: 4, opacity: 0.6, fontSize: 10 }}>{label}</p>
      {payload.map((p: any) => <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span style={{ color: p.color }}>{p.name}</span><span style={{ fontWeight: 700 }}>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}{p.unit ?? ""}</span></div>)}
    </div>
  )
}

export default function ForecastChart({ dark = false }: { dark?: boolean }) {
  const [data, setData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/ecoflow/forecast?hours=48&soc=50").then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false)) }, [])
  if (loading) return <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60"><CardContent className="pt-4 pb-3"><p className="text-xs text-slate-400 font-mono">Loading forecast...</p></CardContent></Card>
  if (!data?.forecasts?.length) return <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60"><CardContent className="pt-4 pb-3"><p className="text-xs text-slate-400 font-mono">No forecast data available</p></CardContent></Card>
  const chartData = data.forecasts.map(f => ({ ...f, label: fmtTime(f.timestamp) }))
  const grid = dark ? "rgba(55,65,81,0.35)" : "rgba(203,213,222,0.6)", fc = dark ? "#9ca3af" : "#475569"
  const rec = data.recommendation
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" /><CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest">48-Hour Forecast</CardTitle></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-xs font-mono">
          <div className={`px-3 py-1.5 rounded-lg border ${rec.is_peak_now ? "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400" : "border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/15 text-green-600 dark:text-green-400"}`}>{rec.is_peak_now ? "⚠ Peak" : "✓ Off-peak"} · ${rec.current_rate.toFixed(3)}/kWh</div>
          {rec.optimal_charge_start && <div className="px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/15 text-blue-600 dark:text-blue-400">Best charge: {fmtTime(rec.optimal_charge_start)}</div>}
          <div className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500">Projected 24h cost: ${rec.projected_cost_24h.toFixed(2)}</div>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1 font-mono">SOC Trajectory (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: fc }} interval="preserveStartEnd" minTickGap={50} />
              <YAxis domain={[0, 105]} tick={{ fontSize: 9, fill: fc }} width={32} unit="%" />
              <Tooltip content={<ChartTooltip dark={dark} />} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }} />
              {chartData.map((d, i) => d.is_peak && (i === 0 || !chartData[i - 1].is_peak) ? <ReferenceArea key={i} x1={d.label} x2={chartData.slice(i).find((dd, j) => j > 0 && !dd.is_peak)?.label ?? d.label} fill="rgba(239,68,68,0.07)" strokeOpacity={0} /> : null)}
              <Area type="monotone" dataKey="soc" name="SOC %" stroke="#4ade80" strokeWidth={2} fill="#4ade80" fillOpacity={0.1} dot={false} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1 font-mono">Solar vs Load (W)</p>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: fc }} interval="preserveStartEnd" minTickGap={50} />
              <YAxis tick={{ fontSize: 9, fill: fc }} width={38} unit="W" />
              <Tooltip content={<ChartTooltip dark={dark} />} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }} />
              <Bar dataKey="solar_w" name="Solar" fill="rgba(251,191,36,0.6)" maxBarSize={12} />
              <Line type="monotone" dataKey="load_w" name="Load" stroke="#f87171" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="grid_draw_w" name="Grid" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
