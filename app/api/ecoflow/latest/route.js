/**
 * app/api/ecoflow/latest/route.js
 * Serves latest battery reading from Cloudflare R2.
 * Fixed: proper error handling, correct env var names, CORS headers.
 */

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.ECOFLOW_R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.ECOFLOW_R2_SECRET_ACCESS_KEY || "",
    },
  });
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, s-maxage=90, stale-while-revalidate=60",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET() {
  // Config check
  if (!process.env.R2_ACCOUNT_ID) {
    return Response.json(
      { error: "R2_ACCOUNT_ID not set in Vercel env vars" },
      { status: 503, headers: CORS }
    );
  }
  if (!process.env.ECOFLOW_R2_ACCESS_KEY_ID) {
    return Response.json(
      { error: "ECOFLOW_R2_ACCESS_KEY_ID not set in Vercel env vars" },
      { status: 503, headers: CORS }
    );
  }

  try {
    const r2 = getR2Client();
    const cmd = new GetObjectCommand({
      Bucket: "ecoflow-history",
      Key: "telemetry/latest.json",
    });
    const resp = await r2.send(cmd);
    const text = await resp.Body.transformToString();
    const data = JSON.parse(text);

    return Response.json(data, { headers: CORS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/ecoflow/latest] error:", msg);

    // Return structured error so the dashboard can show it
    return Response.json(
      {
        error: "Failed to fetch from R2",
        detail: msg,
        hint: "Check ECOFLOW_R2_ACCESS_KEY_ID and ECOFLOW_R2_SECRET_ACCESS_KEY in Vercel",
      },
      { status: 503, headers: CORS }
    );
  }
}
