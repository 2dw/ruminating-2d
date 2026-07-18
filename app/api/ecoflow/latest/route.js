/**
 * app/api/ecoflow/latest/route.js
 * Serves latest battery reading from Cloudflare R2.
 */
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, s-maxage=90, stale-while-revalidate=60",
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function GET() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKey = process.env.ECOFLOW_R2_ACCESS_KEY_ID
  const secretKey = process.env.ECOFLOW_R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKey || !secretKey) {
    return Response.json({
      error: "Missing R2 env vars",
      missing: [
        !accountId && "R2_ACCOUNT_ID",
        !accessKey && "ECOFLOW_R2_ACCESS_KEY_ID",
        !secretKey && "ECOFLOW_R2_SECRET_ACCESS_KEY",
      ].filter(Boolean),
    }, { status: 503, headers: CORS })
  }

  try {
    const r2 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    })
    const resp = await r2.send(new GetObjectCommand({
      Bucket: "ecoflow-history",
      Key: "telemetry/latest.json",
    }))
    const text = await resp.Body.transformToString()
    return Response.json(JSON.parse(text), { headers: CORS })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[api/ecoflow/latest]", msg)
    return Response.json({ error: msg }, { status: 503, headers: CORS })
  }
}
