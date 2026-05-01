import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"

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
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: "photography/",
    })

    const response = await s3Client.send(command)

    // Extract unique album directories from all object keys
    const albumPaths = new Set<string>()

    ;(response.Contents || []).forEach((obj) => {
      const key = obj.Key
      if (key && key.startsWith("photography/")) {
        // Remove "photography/" prefix and get the album directory
        const albumPath = key.replace("photography/", "").split("/")[0]
        if (albumPath && albumPath.length > 0) {
          albumPaths.add(albumPath)
        }
      }
    })

    // Convert to album objects
    const albums = Array.from(albumPaths)
      .sort()
      .map((albumPath) => {
        // Convert path to a readable title
        const title = albumPath
          .split(/[-_\s]+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")

        // Create a slug ID from the path
        const id = albumPath.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

        return {
          id,
          title,
          subtitle: "Photography Collection",
          description: `A collection of photographs from ${title}.`,
          prefix: `photography/${albumPath}/`,
          cover: "/placeholder.jpg",
        }
      })

    console.log(`[Albums API] Found ${albums.length} albums:`, albums.map(a => a.id))

    return Response.json({
      success: true,
      albums,
      count: albums.length,
    })
  } catch (error) {
    console.error("Error fetching albums from R2:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to fetch albums",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}