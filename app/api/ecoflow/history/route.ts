/**
 * app/api/ecoflow/history/route.ts
 * Public API — serves battery telemetry history from R2.
 * No auth required. Place at app/api/ecoflow/history/route.ts
 *
 * GET /api/ecoflow/history        → today only
 * GET /api/ecoflow/history?days=3 → last N days (max 30)
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

async function fetchDay(r2: S3Client, date: Date): Promise<any[]> {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  try {
    const resp = await r2.send(new GetObjectCommand({
      Bucket: "ecoflow-history",
      Key: `telemetry/daily/${y}/${m}/${d}.jsonl`,
    }))
    const text = await resp.Body!.transformToString()
    return text.trim().split("\n").filter(Boolean).map(l => {
      try { return JSON.parse(l) } catch { return null }
    }).filter(Boolean)
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
    const r2 = getR2()
    const all: any[] = []
    for (let i = 0; i < days; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      all.push(...await fetchDay(r2, d))
    }
    all.sort((a, b) => a.timestamp_iso.localeCompare(b.timestamp_iso))
    return Response.json({ count: all.length, days, data: all }, { headers: CORS })
  } catch (err) {
    return Response.json(
      { error: String(err), count: 0, data: [] },
      { status: 503, headers: CORS }
    )
  }
}
