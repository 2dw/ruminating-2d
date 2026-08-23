"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface RateData { current_rate: number; is_peak_now: boolean; heatmap: { day: string; hours: number[] }[]; schedule: { summer_peak: number; summer_off: number; winter_peak: number; winter_off: number; peak_hours: string; summer_months: string } }

export default function RateHeatmap({ dark = false }: { dark?: boolean }) {
  const [data, setData] = useState<RateData | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/ecoflow/rates?hours=72").then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false)) }, [])
  if (loading) return <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60"><CardContent className="pt-4 pb-3"><p className="text-xs text-slate-400 font-mono">Loading rates...</p></CardContent></Card>
  if (!data) return <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60"><CardContent className="pt-4 pb-3"><p className="text-xs text-slate-400 font-mono">No rate data</p></CardContent></Card>
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-green-600 dark:text-green-500" /><CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest">TOU Rate Schedule</CardTitle></div>
          <div className={`px-3 py-1 rounded-lg text-xs font-mono ${data.is_peak_now ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50" : "bg-green-50 dark:bg-green-950/15 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50"}`}>${data.current_rate.toFixed(3)}/kWh</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          {[["Summer peak", `$${data.schedule.summer_peak}`, "text-red-600 dark:text-red-400"], ["Summer off", `$${data.schedule.summer_off}`, "text-green-600 dark:text-green-400"], ["Winter peak", `$${data.schedule.winter_peak}`, "text-amber-600 dark:text-amber-400"], ["Winter off", `$${data.schedule.winter_off}`, "text-green-600 dark:text-green-400"]].map(([l, v, c]) => (
            <div key={l} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"><span className="text-slate-400">{l}</span><span className={c}>{v}</span></div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-24 gap-px text-[8px] font-mono text-center mb-1">{Array.from({ length: 24 }, (_, i) => <div key={i} className="text-slate-400">{i}</div>)}</div>
            {data.heatmap.map(row => (
              <div key={row.day} className="grid grid-cols-24 gap-px mb-px">
                {row.hours.map((rate, h) => (
                  <div key={h} className={`h-5 rounded-sm ${rate > 0.4 ? "bg-red-400 dark:bg-red-600" : rate > 0.25 ? "bg-amber-300 dark:bg-amber-500" : "bg-green-300 dark:bg-green-600"}`}
                    title={`${row.day} ${h}:00 — $${rate.toFixed(3)}/kWh`} />
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 mt-1"><span>← midnight</span><span>{data.schedule.peak_hours}</span><span>midnight →</span></div>
        </div>
        <p className="text-[10px] text-slate-500 text-center font-mono">Peak: {data.schedule.peak_hours} · {data.schedule.summer_months}</p>
      </CardContent>
    </Card>
  )
}
