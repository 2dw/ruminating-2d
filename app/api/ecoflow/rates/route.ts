import { NextRequest, NextResponse } from "next/server"

const SUMMER_PEAK = 0.52, SUMMER_OFF = 0.28, WINTER_PEAK = 0.43, WINTER_OFF = 0.26
const isSummer = (d: Date) => d.getMonth() >= 5 && d.getMonth() <= 8
const isPeak = (d: Date) => d.getHours() >= 16 && d.getHours() < 21
const getRate = (d: Date) => isSummer(d) ? (isPeak(d) ? SUMMER_PEAK : SUMMER_OFF) : (isPeak(d) ? WINTER_PEAK : WINTER_OFF)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = Math.min(168, Math.max(24, parseInt(searchParams.get("hours") ?? "48")))
    const now = new Date(); now.setMinutes(0, 0, 0)
    const rates = []
    for (let h = 0; h < hours; h++) {
      const ts = new Date(now.getTime() + h * 3_600_000)
      rates.push({ timestamp: ts.toISOString(), rate: getRate(ts), is_peak: isPeak(ts), is_summer: isSummer(ts) })
    }
    const heatmapData: { day: string; hours: number[] }[] = []
    const dayMap = new Map<string, number[]>()
    for (const r of rates) {
      const d = new Date(r.timestamp); const dayKey = d.toISOString().slice(0, 10); const hour = d.getHours()
      if (!dayMap.has(dayKey)) dayMap.set(dayKey, new Array(24).fill(0))
      dayMap.get(dayKey)![hour] = r.rate
    }
    for (const [day, hrs] of dayMap) heatmapData.push({ day, hours: hrs })
    return NextResponse.json({
      current_rate: getRate(now), is_peak_now: isPeak(now), is_summer_now: isSummer(now), rates, heatmap: heatmapData,
      schedule: { summer_peak: SUMMER_PEAK, summer_off: SUMMER_OFF, winter_peak: WINTER_PEAK, winter_off: WINTER_OFF, peak_hours: "4 PM - 9 PM", summer_months: "June - September" },
    })
  } catch { return NextResponse.json({ error: "Rates calculation failed" }, { status: 500 }) }
}
