/**
 * app/api/ecoflow/history/route.ts
 * Serves battery telemetry history from R2.
 * Uses Pacific time to match Worker key format.
 */

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
}

function getR2() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     process.env.ECOFLOW_R2_ACCESS_KEY_ID     ?? "",
      secretAccessKey: process.env.ECOFLOW_R2_SECRET_ACCESS_KEY ?? "",
    },
  })
}

function getPacificDateParts(offsetDays = 0): { y: string; m: string; d: string } {
  const ts = Date.now() - offsetDays * 86_400_000
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(ts))
  return {
    y: parts.find(p => p.type === "year")!.value,
    m: parts.find(p => p.type === "month")!.value,
    d: parts.find(p => p.type === "day")!.value,
  }
}

async function fetchDay(r2: S3Client, y: string, m: string, d: string): Promise<any[]> {
  const key = `telemetry/daily/${y}/${m}/${d}.jsonl`
  try {
    const resp = await r2.send(new GetObjectCommand({
      Bucket: "ecoflow-history",
      Key: key,
    }))
    const text = await resp.Body!.transformToString()
    if (!text.trim()) return []
    return text.trim().split("\n")
      .filter(l => l.trim())
      .map(l => { try { return JSON.parse(l) } catch { return null } })
      .filter(Boolean)
  } catch {
    return []
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = Math.min(30, Math.max(1, parseInt(searchParams.get("days") ?? "1")))

  try {
    const r2  = getR2()
    const all: any[] = []

    for (let i = 0; i < days; i++) {
      const { y, m, d } = getPacificDateParts(i)
      const pts = await fetchDay(r2, y, m, d)
      all.push(...pts)
    }

    all.sort((a, b) => a.timestamp_iso.localeCompare(b.timestamp_iso))

    // Debug info to help diagnose issues
    const { y, m, d } = getPacificDateParts(0)
    return Response.json({
      count: all.length,
      days,
      pacific_date: `${y}/${m}/${d}`,
      key_checked: `telemetry/daily/${y}/${m}/${d}.jsonl`,
      data: all,
    }, { headers: CORS })

  } catch (err) {
    return Response.json(
      { error: String(err), count: 0, data: [] },
      { status: 503, headers: CORS }
    )
  }
}
