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

    // Filter for webp files only
    const webpFiles = (response.Contents || [])
      .filter((obj) => obj.Key?.toLowerCase().endsWith(".webp"))
      .map((obj) => {
        // Use custom endpoint if available, otherwise fall back to Cloudflare endpoint
        const baseUrl = process.env.R2_CUSTOM_ENDPOINT 
          ? process.env.R2_CUSTOM_ENDPOINT
          : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
        
        return {
          key: obj.Key,
          name: obj.Key?.split("/").pop() || "",
          url: `${baseUrl}/${obj.Key}`,
          lastModified: obj.LastModified,
        }
      })
      .sort((a, b) => {
        const dateA = a.lastModified?.getTime() || 0
        const dateB = b.lastModified?.getTime() || 0
        return dateB - dateA // Sort newest first
      })

    console.log(`[Photos API] Found ${webpFiles.length} webp files`)
    
    return Response.json({
      success: true,
      photos: webpFiles,
      count: webpFiles.length,
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
