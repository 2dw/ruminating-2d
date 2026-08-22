"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface DailyData { date: string; total_solar_wh: number; total_out_wh: number; avg_soc: number; sample_count: number }
function fmtDate(dateStr: string) { return new Date(dateStr + "T12:00:00").toLocaleString([], { month: "short", day: "numeric" }) }
function ChartTooltip({ active, payload, label, dark }: any) {
  if (!active || !payload?.length) return null
  const bg = dark ? "#0a0f14" : "#f8fafc", bord = dark ? "#374151" : "#cbd5e1", fc = dark ? "#e5e7eb" : "#1e293b"
  return <div style={{ background: bg, border: `1px solid ${bord}`, borderRadius: 8, padding: "8px 12px", fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: fc }}><p style={{ marginBottom: 4, opacity: 0.6, fontSize: 10 }}>{label}</p>{payload.map((p: any) => <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span style={{ color: p.color }}>{p.name}</span><span style={{ fontWeight: 700 }}>{(p.value / 1000).toFixed(2)} kWh</span></div>)}</div>
}

export default function DailySummaryChart({ dark = false }: { dark?: boolean }) {
  const [data, setData] = useState<{ count: number; data: DailyData[] } | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/ecoflow/daily-summary?days=30").then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false)) }, [])
  if (loading) return <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60"><CardContent className="pt-4 pb-3"><p className="text-xs text-slate-400 font-mono">Loading daily summary...</p></CardContent></Card>
  if (!data?.data?.length) return <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60"><CardContent className="pt-4 pb-3"><p className="text-xs text-slate-400 font-mono">No daily data available. Run backfill first.</p></CardContent></Card>
  const chartData = data.data.map(d => ({ date: fmtDate(d.date), Solar: d.total_solar_wh, Usage: d.total_out_wh }))
  const grid = dark ? "rgba(55,65,81,0.35)" : "rgba(203,213,222,0.6)", fc = dark ? "#9ca3af" : "#475569"
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-green-600 dark:text-green-500" /><CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest">Daily Energy Summary</CardTitle></div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: fc }} interval="preserveStartEnd" minTickGap={30} />
            <YAxis tick={{ fontSize: 9, fill: fc }} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`} unit=" Wh" />
            <Tooltip content={<ChartTooltip dark={dark} />} />
            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }} />
            <Bar dataKey="Solar" fill="rgba(251,191,36,0.7)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Usage" fill="rgba(96,165,250,0.7)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
