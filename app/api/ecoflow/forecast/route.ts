import { NextRequest, NextResponse } from "next/server"

const LAT = 37.8716, LON = -122.2727, BATTERY_CAPACITY_WH = 4096, BATTERY_EFFICIENCY = 0.90
const SUMMER_PEAK = 0.52, SUMMER_OFF = 0.28, WINTER_PEAK = 0.43, WINTER_OFF = 0.26
const isSummer = (d: Date) => d.getMonth() >= 5 && d.getMonth() <= 8
const isPeak = (d: Date) => d.getHours() >= 16 && d.getHours() < 21
const getRate = (d: Date) => isSummer(d) ? (isPeak(d) ? SUMMER_PEAK : SUMMER_OFF) : (isPeak(d) ? WINTER_PEAK : WINTER_OFF)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = Math.min(72, Math.max(6, parseInt(searchParams.get("hours") ?? "48")))
    const currentSoc = parseFloat(searchParams.get("soc") ?? "50")
    const forecastParams = new URLSearchParams({
      latitude: String(LAT), longitude: String(LON),
      hourly: "temperature_2m,cloudcover,shortwave_radiation,precipitation_probability",
      forecast_days: "4", timezone: "America/Los_Angeles",
    })
    const weatherResp = await fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams}`)
    if (!weatherResp.ok) return NextResponse.json({ error: "Weather API failed" }, { status: 502 })
    const weatherData = await weatherResp.json()
    const hourly = weatherData.hourly ?? {}
    const times: string[] = hourly.time ?? []
    const radiation: number[] = hourly.shortwave_radiation ?? []
    const cloudCover: number[] = hourly.cloudcover ?? []
    const now = new Date()
    const typicalLoad = [350,320,310,300,310,340,400,500,520,480,450,430,420,430,440,460,500,600,750,850,800,700,600,450]
    let soc = currentSoc, cumCost = 0
    const forecasts = []
    for (let h = 0; h < hours; h++) {
      const ts = new Date(now.getTime() + h * 3_600_000)
      const hourOfDay = ts.getHours(), rate = getRate(ts), peak = isPeak(ts)
      const tsKey = ts.toISOString().slice(0, 13) + ":00"
      let rad = 0, cloud = 0
      const idx = times.findIndex(t => t.startsWith(tsKey.slice(0, 13)))
      if (idx >= 0) { rad = radiation[idx] ?? 0; cloud = cloudCover[idx] ?? 0 }
      const solarW = rad * 4.0 * 0.20 * 0.90 * (1 - (cloud / 100) * 0.7)
      const loadW = typicalLoad[hourOfDay] ?? 400
      let netW = solarW - loadW, gridW = 0, action = "idle"
      if (solarW > loadW * 1.1 && soc < 98) { netW = Math.min(solarW - loadW, 3000); action = "solar" }
      else if (peak && soc > 30) { netW = -Math.min(loadW, 1800); action = "discharge" }
      else if (!peak && soc < 85 && solarW < 100) { netW = 1800; gridW = 1800 + loadW; action = "charge" }
      else { gridW = Math.max(0, loadW - solarW); netW = solarW - loadW }
      const deltaWh = netW > 0 ? netW * BATTERY_EFFICIENCY : netW
      soc = Math.max(0, Math.min(100, soc + (deltaWh / BATTERY_CAPACITY_WH) * 100))
      cumCost += (gridW / 1000) * rate
      forecasts.push({ timestamp: ts.toISOString(), soc: Math.round(soc * 10) / 10, solar_w: Math.round(solarW), load_w: Math.round(loadW), net_w: Math.round(netW), grid_draw_w: Math.round(gridW), rate_per_kwh: rate, is_peak: peak, action, cum_cost_usd: Math.round(cumCost * 10000) / 10000 })
    }
    const offPeakHours = forecasts.filter(f => !f.is_peak && f.action === "charge").sort((a, b) => a.rate_per_kwh - b.rate_per_kwh)
    const peakHours = forecasts.filter(f => f.is_peak)
    const recommendation = {
      optimal_charge_start: offPeakHours[0]?.timestamp ?? null, peak_window_start: peakHours[0]?.timestamp ?? null,
      min_soc_forecast: Math.min(...forecasts.map(f => f.soc)), max_soc_forecast: Math.max(...forecasts.map(f => f.soc)),
      projected_cost_24h: forecasts.slice(0, 24).at(-1)?.cum_cost_usd ?? 0,
      solar_peak_hour: forecasts.reduce((max, f) => f.solar_w > max.solar_w ? f : max, forecasts[0])?.timestamp ?? null,
      total_solar_wh: forecasts.reduce((sum, f) => sum + f.solar_w, 0), current_rate: getRate(now), is_peak_now: isPeak(now),
    }
    return NextResponse.json({ count: forecasts.length, current_soc: currentSoc, forecasts, recommendation })
  } catch { return NextResponse.json({ error: "Forecast failed" }, { status: 500 }) }
}
