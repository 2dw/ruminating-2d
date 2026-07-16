/**
 * app/api/ecoflow/pge-history/route.js
 * Serves PG&E historical usage data from R2.
 *
 * GET /api/ecoflow/pge-history?days=30        → last N days hourly
 * GET /api/ecoflow/pge-history?date=2024-06-15 → single day 15-min intervals
 * GET /api/ecoflow/pge-history?summary=true    → all-time hourly aggregate
 */

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

function getR2() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.ECOFLOW_R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.ECOFLOW_R2_SECRET_ACCESS_KEY || "",
    },
  });
}

async function getObject(key) {
  const r2 = getR2();
  const resp = await r2.send(new GetObjectCommand({ Bucket: "ecoflow-history", Key: key }));
  return resp.Body.transformToString();
}

const CORS = { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, s-maxage=3600" };

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const days    = parseInt(searchParams.get("days") || "30");
  const date    = searchParams.get("date");
  const summary = searchParams.get("summary") === "true";

  try {
    // Single day — return 15-min intervals
    if (date) {
      const [y, m, d] = date.split("-");
      const key  = `pge/daily/${y}/${m}/${d}.jsonl`;
      const text = await getObject(key);
      const rows = text.trim().split("\n").filter(Boolean).map(l => JSON.parse(l));
      return Response.json({ date, count: rows.length, intervals: rows }, { headers: CORS });
    }

    // All-time hourly aggregate
    if (summary) {
      const text = await getObject("pge/aggregate/hourly_all.json");
      const data = JSON.parse(text);
      return Response.json({ count: data.length, data }, { headers: CORS });
    }

    // Last N days — fetch each daily file and combine
    const results = [];
    const now = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      try {
        const text = await getObject(`pge/daily/${y}/${m}/${day}.jsonl`);
        const rows = text.trim().split("\n").filter(Boolean).map(l => JSON.parse(l));
        // Aggregate to hourly for efficiency
        const hourly = {};
        for (const r of rows) {
          const h = r.timestamp_iso.slice(0, 13) + ":00:00";
          if (!hourly[h]) hourly[h] = { timestamp_iso: h, kwh: 0, cost_est: 0, is_peak: r.is_peak };
          hourly[h].kwh      += r.kwh;
          hourly[h].cost_est += r.cost_est;
        }
        results.push(...Object.values(hourly));
      } catch (_) {
        // Day not available — skip silently
      }
    }

    results.sort((a, b) => a.timestamp_iso.localeCompare(b.timestamp_iso));
    return Response.json({ days, count: results.length, data: results }, { headers: CORS });

  } catch (err) {
    return Response.json(
      { error: "PG&E history unavailable", detail: String(err) },
      { status: 503, headers: CORS }
    );
  }
}
