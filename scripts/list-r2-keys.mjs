import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { readFileSync } from "node:fs"

const env = {}
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2]
}

const prefix = process.argv[2] || "photography/"
if (!prefix.endsWith("/")) {
  // allow folder-style input
}

const s3 = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  endpoint: env.R2_ENDPOINT,
})

let token
let count = 0
const keys = []
do {
  const res = await s3.send(
    new ListObjectsV2Command({ Bucket: env.R2_BUCKET_NAME, Prefix: prefix, ContinuationToken: token }),
  )
  for (const obj of res.Contents || []) {
    count++
    keys.push({ key: obj.Key, size: obj.Size, lastModified: obj.LastModified })
  }
  token = res.IsTruncated ? res.NextContinuationToken : undefined
} while (token)

console.log(`prefix "${prefix}": ${count} objects`)
for (const k of keys) {
  console.log(`- ${k.key} (${k.size} bytes, ${k.lastModified?.toISOString().slice(0, 10)})`)
}
