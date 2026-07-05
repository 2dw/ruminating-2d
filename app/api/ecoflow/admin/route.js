/**
 * app/api/ecoflow/admin/route.js
 * Admin API for R2 data management.
 * Requires Authorization: Bearer <ADMIN_SECRET> header.
 *
 * GET  /api/ecoflow/admin?action=stats           → storage stats
 * GET  /api/ecoflow/admin?action=list&prefix=... → list files
 * GET  /api/ecoflow/admin?action=download&key=.. → download a file
 * POST /api/ecoflow/admin  { action: "delete_before", date: "2024-01-01" }
 * POST /api/ecoflow/admin  { action: "delete_keys", keys: [...] }
 */

import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || "ecoflow-history";
const ADMIN_SECRET = process.env.ECOFLOW_ADMIN_SECRET;

function checkAuth(request) {
  const auth = request.headers.get("Authorization");
  if (!ADMIN_SECRET) return false; // misconfigured — deny
  return auth === `Bearer ${ADMIN_SECRET}`;
}

async function listAllObjects(prefix = "") {
  const objects = [];
  let token;
  do {
    const cmd = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      ContinuationToken: token,
    });
    const resp = await r2.send(cmd);
    (resp.Contents || []).forEach(obj => objects.push(obj));
    token = resp.NextContinuationToken;
  } while (token);
  return objects;
}

// ── GET handler ───────────────────────────────────────────────────────────────

export async function GET(request) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "stats";

  // Storage stats
  if (action === "stats") {
    const objects = await listAllObjects();
    const totalBytes = objects.reduce((sum, o) => sum + (o.Size || 0), 0);

    // Group by prefix
    const byPrefix = {};
    for (const obj of objects) {
      const prefix = obj.Key.split("/").slice(0, 2).join("/");
      if (!byPrefix[prefix]) byPrefix[prefix] = { count: 0, bytes: 0 };
      byPrefix[prefix].count++;
      byPrefix[prefix].bytes += obj.Size || 0;
    }

    // Date range of telemetry
    const telemetryKeys = objects
      .map(o => o.Key)
      .filter(k => k.startsWith("telemetry/daily/"))
      .sort();

    return Response.json({
      bucket: BUCKET,
      total_files: objects.length,
      total_mb: (totalBytes / 1024 / 1024).toFixed(2),
      free_tier_gb: 10,
      used_pct: ((totalBytes / 1024 / 1024 / 1024 / 10) * 100).toFixed(3),
      by_prefix: byPrefix,
      telemetry_oldest: telemetryKeys[0] || null,
      telemetry_newest: telemetryKeys[telemetryKeys.length - 1] || null,
      r2_free_tier_info: {
        storage: "10 GB free",
        class_a_ops: "1M writes/month free",
        class_b_ops: "10M reads/month free",
        egress: "free",
      },
    });
  }

  // List files
  if (action === "list") {
    const prefix = searchParams.get("prefix") || "telemetry/";
    const objects = await listAllObjects(prefix);
    return Response.json({
      prefix,
      count: objects.length,
      files: objects.map(o => ({
        key: o.Key,
        size_kb: ((o.Size || 0) / 1024).toFixed(1),
        last_modified: o.LastModified,
      })),
    });
  }

  // Download a specific file
  if (action === "download") {
    const key = searchParams.get("key");
    if (!key) return Response.json({ error: "key required" }, { status: 400 });

    try {
      const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
      const resp = await r2.send(cmd);
      const text = await resp.Body.transformToString();
      return new Response(text, {
        headers: {
          "Content-Type": key.endsWith(".json")
            ? "application/json"
            : "application/x-ndjson",
          "Content-Disposition": `attachment; filename="${key.split("/").pop()}"`,
        },
      });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 404 });
    }
  }

  // Preview data age distribution
  if (action === "age_report") {
    const objects = await listAllObjects("telemetry/daily/");
    const now = new Date();
    const report = { "<1yr": 0, "1-2yr": 0, "2-3yr": 0, "3+yr": 0 };

    for (const obj of objects) {
      if (!obj.LastModified) continue;
      const ageDays = (now - new Date(obj.LastModified)) / (1000 * 60 * 60 * 24);
      if (ageDays < 365) report["<1yr"]++;
      else if (ageDays < 730) report["1-2yr"]++;
      else if (ageDays < 1095) report["2-3yr"]++;
      else report["3+yr"]++;
    }

    return Response.json({ age_distribution: report, total: objects.length });
  }

  return Response.json({ error: "unknown action" }, { status: 400 });
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(request) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  // Delete everything before a given date
  if (action === "delete_before") {
    const { date, dry_run = true } = body;
    if (!date) return Response.json({ error: "date required (YYYY-MM-DD)" }, { status: 400 });

    const cutoff = new Date(date);
    if (isNaN(cutoff)) return Response.json({ error: "invalid date" }, { status: 400 });

    // Only allow deleting telemetry/daily and telemetry/hourly — never backfill or latest
    const objects = await listAllObjects("telemetry/");
    const toDelete = objects.filter(obj => {
      if (!obj.Key.startsWith("telemetry/daily/") &&
          !obj.Key.startsWith("telemetry/hourly/")) return false;
      return new Date(obj.LastModified) < cutoff;
    });

    if (dry_run) {
      return Response.json({
        dry_run: true,
        would_delete: toDelete.length,
        oldest: toDelete[0]?.Key,
        newest: toDelete[toDelete.length - 1]?.Key,
        total_mb: (toDelete.reduce((s, o) => s + (o.Size || 0), 0) / 1024 / 1024).toFixed(2),
        warning: "Set dry_run: false to actually delete",
      });
    }

    // Delete in batches of 1000 (S3 API limit)
    let deleted = 0;
    for (let i = 0; i < toDelete.length; i += 1000) {
      const batch = toDelete.slice(i, i + 1000);
      const cmd = new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: batch.map(o => ({ Key: o.Key })) },
      });
      const resp = await r2.send(cmd);
      deleted += resp.Deleted?.length || 0;
    }

    return Response.json({
      deleted,
      cutoff_date: date,
      message: `Deleted ${deleted} files older than ${date}`,
    });
  }

  // Delete specific keys
  if (action === "delete_keys") {
    const { keys, dry_run = true } = body;
    if (!keys?.length) return Response.json({ error: "keys array required" }, { status: 400 });

    // Safety: never allow deleting backfill or latest
    const safe = keys.filter(k =>
      k.startsWith("telemetry/daily/") || k.startsWith("telemetry/hourly/")
    );
    const blocked = keys.length - safe.length;

    if (dry_run) {
      return Response.json({
        dry_run: true,
        would_delete: safe.length,
        blocked_unsafe: blocked,
        keys: safe,
      });
    }

    for (let i = 0; i < safe.length; i += 1000) {
      const batch = safe.slice(i, i + 1000);
      const cmd = new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: batch.map(k => ({ Key: k })) },
      });
      await r2.send(cmd);
    }

    return Response.json({ deleted: safe.length, blocked_unsafe: blocked });
  }

  return Response.json({ error: "unknown action" }, { status: 400 });
}
