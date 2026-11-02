// The single place the public assets domain is defined. This is the R2 custom
// domain that masks the bucket's dev r2.dev address. Every photo, PDF and
// download on the site builds its URL from this one constant, so swapping the
// domain later means editing this line and nothing else.
export const ASSETS_BASE = "https://assets.trudie.dpdns.org".replace(/\/+$/, "")

export function assetUrl(path: string): string {
  return `${ASSETS_BASE}/${path.replace(/^\/+/, "")}`
}
