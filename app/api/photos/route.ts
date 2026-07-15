import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3"

export const dynamic = "force-dynamic"

const s3Client = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  endpoint: process.env.R2_ENDPOINT,
})

function getMediaType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || ""
  if (["jpg", "jpeg", "png", "webp", "avif"].includes(ext)) return "image"
  if (ext === "gif") return "animation"
  if (["mp4", "webm", "mov"].includes(ext)) return "video"
  if (["pdf"].includes(ext)) return "document"
  if (["docx", "doc", "txt", "md", "rtf"].includes(ext)) return "text"
  if (["pptx", "ppt"].includes(ext)) return "slide"
  if (["svg"].includes(ext)) return "image"
  return "unknown"
}

function getBaseUrl() {
  const customEndpoint = process.env.R2_CUSTOM_ENDPOINT
  const endpoint = process.env.R2_ENDPOINT
  const bucket = process.env.R2_BUCKET_NAME || ""
  const accountId = process.env.R2_ACCOUNT_ID

  if (customEndpoint) return customEndpoint

  if (endpoint && bucket) {
    try {
      const endpointUrl = new URL(endpoint)
      endpointUrl.hostname = `${bucket}.${endpointUrl.hostname}`
      endpointUrl.pathname = ""
      return endpointUrl.toString().replace(/\/$/, "")
    } catch {
      return endpoint
    }
  }

  if (bucket && accountId) {
    return `https://${bucket}.${accountId}.r2.cloudflarestorage.com`
  }

  return ""
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get("prefix") || "photography/"
    const includeText = searchParams.get("includeText") === "true"

    console.log(`[Photos API] Requested prefix: ${prefix}`)

    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: prefix,
    })

    const response = await s3Client.send(command)
    const baseUrl = getBaseUrl()

    const files = (response.Contents || [])
      .filter((obj) => {
        const key = obj.Key?.toLowerCase() || ""
        return (
          key.endsWith(".webp") ||
          key.endsWith(".jpg") ||
          key.endsWith(".jpeg") ||
          key.endsWith(".png") ||
          key.endsWith(".avif") ||
          key.endsWith(".gif") ||
          key.endsWith(".mp4") ||
          key.endsWith(".webm") ||
          key.endsWith(".mov") ||
          key.endsWith(".pdf") ||
          key.endsWith(".docx") ||
          key.endsWith(".doc") ||
          key.endsWith(".txt") ||
          key.endsWith(".md") ||
          key.endsWith(".rtf") ||
          key.endsWith(".pptx") ||
          key.endsWith(".ppt") ||
          key.endsWith(".svg")
        )
      })
      .map((obj) => {
        const filename = obj.Key?.split("/").pop() || ""
        const encodedKey = encodeURI(obj.Key || "")
        const url = baseUrl ? new URL(encodedKey, baseUrl).toString() : encodedKey
        const mediaType = getMediaType(filename)

        return {
          key: obj.Key,
          name: filename,
          url,
          mediaType,
          lastModified: obj.LastModified,
          size: obj.Size,
        }
      })
      .sort((a, b) => {
        // Sort by numeric prefix if present, otherwise by date
        const numA = parseInt(a.name.match(/^\d+/)?.[0] || "9999")
        const numB = parseInt(b.name.match(/^\d+/)?.[0] || "9999")
        if (numA !== numB) return numA - numB
        const dateA = a.lastModified?.getTime() || 0
        const dateB = b.lastModified?.getTime() || 0
        return dateB - dateA
      })

    console.log(`[Photos API] Found ${files.length} files`)

    return Response.json(
      {
        success: true,
        photos: files,
        count: files.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching photos from R2:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to fetch photos",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
