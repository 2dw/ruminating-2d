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

function toTitle(path: string) {
  return path
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function toId(path: string) {
  return path.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: "projects/",
    })

    const response = await s3Client.send(command)
    const projectPaths = new Set<string>()

    ;(response.Contents || []).forEach((obj) => {
      const key = obj.Key
      if (!key?.startsWith("projects/")) return

      const projectPath = key.replace("projects/", "").split("/")[0]
      if (projectPath) projectPaths.add(projectPath)
    })

    const projects = Array.from(projectPaths)
      .sort()
      .map((projectPath) => {
        const title = toTitle(projectPath)

        return {
          id: toId(projectPath),
          title,
          subtitle: "Creative Project",
          description: `A creative project collection from ${title}.`,
          prefix: `projects/${projectPath}/`,
          cover: "/creative-project-fallback.svg",
        }
      })

    return Response.json(
      {
        success: true,
        projects,
        count: projects.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching creative projects from R2:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to fetch creative projects",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
