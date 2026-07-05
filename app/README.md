# EcoFlow Serverless Integration — Cloudflare Worker + Next.js

No machine required. Runs entirely on Cloudflare's free tier + Vercel.

---

## Architecture

```
EcoFlow API (api-a.ecoflow.com)
        ↓  every 30 min
Cloudflare Worker (ecoflow-poller)
        ↓  writes
Cloudflare R2 (ecoflow-history bucket)
     ↙           ↘
Next.js API      Python dashboard
/api/ecoflow/*   (local, reads R2 via boto3)
        ↓
Your website viewer page
```

---

## Files

```
ecoflow_worker/
  index.js          ← Cloudflare Worker (poll + store)
  wrangler.toml     ← Worker config + cron schedule

nextjs_integration/
  app/
    api/ecoflow/
      latest/route.js   ← GET /api/ecoflow/latest
      admin/route.js    ← Admin API (stats, download, delete)
    admin/battery/
      page.jsx          ← Admin UI at /admin/battery
```

---

## Step 1 — Deploy the Cloudflare Worker

```bash
npm install -g wrangler
cd ecoflow_worker
wrangler login

# Set secrets (never hardcode these)
wrangler secret put ECOFLOW_ACCESS_KEY
wrangler secret put ECOFLOW_SECRET_KEY
wrangler secret put ECOFLOW_DEVICE_SN
wrangler secret put WORKER_SECRET   # any random string, e.g. openssl rand -hex 32

# Deploy
wrangler deploy
```

The Worker will:
- Poll EcoFlow every 30 minutes via cron
- Write to R2: `telemetry/latest.json`, `telemetry/hourly/...`, `telemetry/daily/...`
- Expose `https://ecoflow-poller.<your-account>.workers.dev/latest` publicly

Test it:
```bash
# Check latest reading
curl https://ecoflow-poller.<your-account>.workers.dev/latest

# Manual poll trigger
curl -X POST https://ecoflow-poller.<your-account>.workers.dev/poll \
  -H "X-Worker-Secret: your_worker_secret"
```

---

## Step 2 — Add to your Next.js project

Copy these files into your Next.js repo:
- `app/api/ecoflow/latest/route.js`
- `app/api/ecoflow/admin/route.js`
- `app/admin/battery/page.jsx`

Install the S3 client:
```bash
npm install @aws-sdk/client-s3
```

Add to Vercel environment variables:
```
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_token_key
R2_SECRET_ACCESS_KEY=your_r2_token_secret
R2_BUCKET_NAME=ecoflow-history
ECOFLOW_ADMIN_SECRET=a_different_random_secret_for_the_admin_ui
```

---

## Step 3 — Embed the viewer in your website

Anywhere on your site, fetch from your own API:

```jsx
// Simple React component
export default async function BatteryWidget() {
  const data = await fetch('/api/ecoflow/latest').then(r => r.json());
  return (
    <div>
      <span>🔋 {data.soc?.toFixed(1)}%</span>
      <span>☀️ {data.solar_in}W</span>
    </div>
  );
}
```

Or iframe the Python dashboard viewer:
```html
<iframe src="http://your-local-ip:8050/view" ... />
```

---

## Step 4 — Admin UI

Visit `/admin/battery` on your website.
Enter your `ECOFLOW_ADMIN_SECRET` to access.

Features:
- Storage stats (files, MB used, % of free tier)
- Browse and download daily files
- Delete old data with dry-run preview
- Age distribution report

**Recommended retention policy:**
- Keep last 2 years in R2 (hot storage)
- Download yearly archives before deleting
- At your data rate (~2MB/year), you have ~500 years of free tier anyway

---

## Cost

| Service | Usage | Cost |
|---------|-------|------|
| Cloudflare Worker | 48 invocations/day | Free (100k/day limit) |
| R2 storage | ~2MB/year | Free (10GB limit) |
| R2 writes | ~17,520/year | Free (1M/month limit) |
| R2 reads | ~1,000/day | Free (10M/month limit) |
| Vercel API routes | Low traffic | Free tier |

**Total: $0/month**

---

## Troubleshooting

**Worker not polling:**
Check `wrangler tail` for live logs:
```bash
wrangler tail ecoflow-poller
```

**R2 access denied from Next.js:**
Make sure your R2 API token has "Object Read & Write" on the `ecoflow-history` bucket specifically.

**Admin UI shows Unauthorized:**
Check `ECOFLOW_ADMIN_SECRET` in Vercel env vars matches what you type in the UI.
