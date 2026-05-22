"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Brush } from "lucide-react"
import { useRouter } from "next/navigation"

import { ArtworkCarousel } from "@/components/artwork-carousel"
import { Button } from "@/components/ui/button"
import { artworkCaptions } from "@/config/artwork-captions"

export default function CreativeArtPage() {
  const router = useRouter()

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white"
    >
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/personal/creative")}
              className="mt-1 text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
              aria-label="Back to creative projects"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
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
        </motion.div>
      </main>
    </div>
  )
}
