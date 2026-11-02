import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { resolveAlbumMeta } from "@/config/albums"

export const dynamic = "force-dynamic"

const s3Client = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  endpoint: process.env.R2_ENDPOINT,
})

export async function GET() {
  try {
    // Album folder name to the earliest upload date seen for it. The upload
    // year is only a fallback for folders whose name carries no year.
    const albumPaths = new Map<string, Date>()
    let continuationToken: string | undefined

    // R2/S3 returns max 1000 objects per request, so page through all of them
    do {
      const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        Prefix: "photography/",
        ContinuationToken: continuationToken,
      })

      const response = await s3Client.send(command)

      ;(response.Contents || []).forEach((obj) => {
        const key = obj.Key
        if (key && key.startsWith("photography/")) {
          const albumPath = key.replace("photography/", "").split("/")[0]
          if (albumPath && albumPath.length > 0) {
            const existing = albumPaths.get(albumPath)
            const modified = obj.LastModified
            if (!existing || (modified && modified < existing)) {
              albumPaths.set(albumPath, modified ?? existing ?? new Date())
            }
          }
        }
      })

      continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined
    } while (continuationToken)

    // Convert to album objects
    const albums = Array.from(albumPaths.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([albumPath, firstUpload]) => {
        const title = albumPath
          .split(/[-_\s]+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")

        const id = albumPath.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

        const year = firstUpload.getUTCFullYear()
        const meta = resolveAlbumMeta({ id, title, year })

        return {
          id,
          title,
          subtitle: "Photography Collection",
          description: `A collection of photographs from ${title}.`,
          prefix: `photography/${albumPath}/`,
          cover: "/placeholder.jpg",
          year,
          meta,
        }
      })

    console.log(`[Albums API] Found ${albums.length} albums:`, albums.map(a => a.id))

    return Response.json(
      {
        success: true,
        albums,
        count: albums.length,
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    console.error("Error fetching albums from R2:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to fetch albums",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
