const ASSETS_BASE_FALLBACK = "https://pub-18df5dc6358149feba2604128db81afa.r2.dev"

const assetsBase = process.env.NEXT_PUBLIC_ASSETS_BASE_URL?.trim() || ASSETS_BASE_FALLBACK

export function assetUrl(path: string): string {
  return `${assetsBase.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`
}
