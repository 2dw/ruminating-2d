import { NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"

const CORS = { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" }

function getR2() {
  return new S3Client({
    region: "auto", endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.ECOFLOW_R2_ACCESS_KEY_ID ?? "", secretAccessKey: process.env.ECOFLOW_R2_SECRET_ACCESS_KEY ?? "" },
  })
}

function getPacificDateParts(offsetDays = 0): { y: string; m: string; d: string } {
  const ts = Date.now() - offsetDays * 86_400_000
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(ts))
  return { y: parts.find(p => p.type === "year")!.value, m: parts.find(p => p.type === "month")!.value, d: parts.find(p => p.type === "day")!.value }
}

async function fetchDay(r2: S3Client, y: string, m: string, d: string): Promise<any[]> {
  try {
    const resp = await r2.send(new GetObjectCommand({ Bucket: "ecoflow-history", Key: `telemetry/daily/${y}/${m}/${d}.jsonl` }))
    const text = await resp.Body!.transformToString()
    if (!text.trim()) return []
    return text.trim().split("\n").filter(l => l.trim()).map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
  } catch { return [] }
}

export async function OPTIONS() { return new Response(null, { status: 204, headers: CORS }) }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") ?? "30")))
  try {
    const r2 = getR2()
    const dailySummaries: any[] = []
    for (let i = 0; i < days; i++) {
      const { y, m, d } = getPacificDateParts(i)
      const pts = await fetchDay(r2, y, m, d)
      if (pts.length === 0) continue
      let totalSolarWh = 0, totalOutWh = 0, totalInWh = 0, socSum = 0, socMin = 100, socMax = 0
      for (const pt of pts) {
        totalSolarWh += (pt.solar_in ?? 0) * 0.3; totalOutWh += (pt.power_out ?? pt.ac_out ?? 0) * 0.3
        totalInWh += (pt.power_in ?? 0) * 0.3; socSum += pt.soc ?? 0
        socMin = Math.min(socMin, pt.soc ?? 0); socMax = Math.max(socMax, pt.soc ?? 0)
      }
      dailySummaries.push({ date: `${y}-${m}-${d}`, total_solar_wh: Math.round(totalSolarWh), total_out_wh: Math.round(totalOutWh), total_in_wh: Math.round(totalInWh), avg_soc: Math.round((socSum / pts.length) * 10) / 10, min_soc: socMin, max_soc: socMax, sample_count: pts.length })
    }
    dailySummaries.sort((a, b) => a.date.localeCompare(b.date))
    return Response.json({ count: dailySummaries.length, days, data: dailySummaries }, { headers: CORS })
  } catch (err) { return Response.json({ error: String(err), count: 0, data: [] }, { status: 503, headers: CORS }) }
}
