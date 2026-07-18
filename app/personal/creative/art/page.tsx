import Link from "next/link"
import { Brush } from "lucide-react"
import { FadeIn } from "@/components/fade-in"
import { ArtworkCarousel } from "@/components/artwork-carousel"
import { artworkCaptions } from "@/config/artwork-captions"

export default function CreativeArtPage() {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white"
    >
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn className="space-y-8">
          <div className="flex items-start gap-4">
            <Link
              href="/personal/creative"
              className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
              aria-label="Back to creative projects"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              <Brush className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Digital Art Explorations</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Digital illustrations and visual studies gathered from the art folder in R2. The gallery refreshes from the bucket as files are added, removed, or replaced.
              </p>
            </div>
          </div>

          <ArtworkCarousel prefix="art/" captions={artworkCaptions} />
        </FadeIn>
      </main>
    </div>
  )
}
