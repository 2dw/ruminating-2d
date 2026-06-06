import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"

export const dynamic = "force-dynamic"

const s3Client = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  endpoint: process.env.R2_ENDPOINT,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get("prefix") || "photography/"
    
    console.log(`[Photos API] Requested prefix: ${prefix}`)

    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: prefix,
    })

    const response = await s3Client.send(command)

    // Filter for common image file types, including animated project GIFs
    const imageFiles = (response.Contents || [])
      .filter((obj) => {
        const key = obj.Key?.toLowerCase() || ""
        return (
          key.endsWith(".webp") ||
          key.endsWith(".jpg") ||
          key.endsWith(".jpeg") ||
          key.endsWith(".png") ||
          key.endsWith(".avif") ||
          key.endsWith(".gif")
        )
      })
      .map((obj) => {
        // Public base URL for serving R2 assets. R2_CUSTOM_ENDPOINT takes
        // priority (used in production). If it isn't available (e.g. in the
        // v0 preview sandbox), fall back to the known public custom domain.
        // We intentionally do NOT fall back to the S3 API endpoint
        // (*.r2.cloudflarestorage.com) since that requires signed requests
        // and is not publicly fetchable from a browser.
        const baseUrl = process.env.R2_CUSTOM_ENDPOINT || "https://assets.trudie.dpdns.org"

        const encodedKey = encodeURI(obj.Key || "")
        const url = baseUrl ? new URL(encodedKey, baseUrl).toString() : encodedKey

        return {
          key: obj.Key,
          name: obj.Key?.split("/").pop() || "",
          url,
          lastModified: obj.LastModified,
        }
      })
      .sort((a, b) => {
        const dateA = a.lastModified?.getTime() || 0
        const dateB = b.lastModified?.getTime() || 0
        return dateB - dateA // Sort newest first
      })

    console.log(`[Photos API] Found ${imageFiles.length} image files`)
    
    return Response.json(
      {
        success: true,
        photos: imageFiles,
        count: imageFiles.length,
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
