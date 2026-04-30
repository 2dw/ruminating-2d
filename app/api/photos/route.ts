import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"

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

    // Filter for common image file types
    const imageFiles = (response.Contents || [])
      .filter((obj) => {
        const key = obj.Key?.toLowerCase() || ""
        return key.endsWith(".webp") || key.endsWith(".jpg") || key.endsWith(".jpeg") || key.endsWith(".png") || key.endsWith(".avif")
      })
      .map((obj) => {
        const customEndpoint = process.env.R2_CUSTOM_ENDPOINT
        const endpoint = process.env.R2_ENDPOINT
        const bucket = process.env.R2_BUCKET_NAME || ""
        const accountId = process.env.R2_ACCOUNT_ID

        let baseUrl = customEndpoint || ""

        if (!baseUrl && endpoint && bucket) {
          try {
            const endpointUrl = new URL(endpoint)
            endpointUrl.hostname = `${bucket}.${endpointUrl.hostname}`
            endpointUrl.pathname = ""
            baseUrl = endpointUrl.toString().replace(/\/$/, "")
          } catch {
            baseUrl = endpoint
          }
        }

        if (!baseUrl && bucket && accountId) {
          baseUrl = `https://${bucket}.${accountId}.r2.cloudflarestorage.com`
        }

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
    
    return Response.json({
      success: true,
      photos: imageFiles,
      count: imageFiles.length,
    })
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
