/**
 * app/api/ecoflow/latest/route.js
 * Next.js API route that serves the latest EcoFlow reading from R2.
 * Used by the view-only embed on your website.
 *
 * GET /api/ecoflow/latest
 * Returns: { soc, solar_in, power_out, temp_c, timestamp_iso, ... }
 */

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function getR2Object(key) {
  const cmd = new GetObjectCommand({
    Bucket: "ecoflow-history",
    Key: key,
  });
  const resp = await r2.send(cmd);
  const text = await resp.Body.transformToString();
  return JSON.parse(text);
}

export async function GET() {
  try {
    const data = await getR2Object("telemetry/latest.json");
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (err) {
    return Response.json(
      { error: "No data available", detail: err.message },
      { status: 503 }
    );
  }
}
