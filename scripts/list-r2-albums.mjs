import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { readFileSync } from "node:fs"

const env = {}
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2]
}

const s3 = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  endpoint: env.R2_ENDPOINT,
})

const albums = new Map()
let token
let total = 0
do {
  const res = await s3.send(
    new ListObjectsV2Command({ Bucket: env.R2_BUCKET_NAME, Prefix: "photography/", ContinuationToken: token }),
  )
  for (const obj of res.Contents || []) {
    total++
    const key = obj.Key
    if (!key || !key.startsWith("photography/")) continue
    const rest = key.slice("photography/".length)
    const seg = rest.split("/")[0]
    if (!seg || !rest.includes("/")) continue // skip loose files at photography/ root
    const a = albums.get(seg) || { count: 0, oldest: obj.LastModified, newest: obj.LastModified, sample: key }
    a.count++
    if (obj.LastModified < a.oldest) a.oldest = obj.LastModified
    if (obj.LastModified > a.newest) a.newest = obj.LastModified
    albums.set(seg, a)
  }
  token = res.IsTruncated ? res.NextContinuationToken : undefined
} while (token)

console.log(`total objects under photography/: ${total}`)
console.log(`album folders: ${albums.size}`)
for (const [name, a] of [...albums.entries()].sort()) {
  console.log(`- "${name}" | files=${a.count} | first=${a.oldest.toISOString().slice(0, 10)} last=${a.newest.toISOString().slice(0, 10)}`)
}
