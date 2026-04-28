"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { PenTool, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PersonalStoryPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/personal")}
          className="mb-8 text-blue-600 dark:text-blue-300"
          aria-label="Back to personal overview"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/20"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              <PenTool className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">The Story Is Being Written</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                A quieter corner for essays, drafts, and evolving narratives that connect the personal, the ecological, and the imaginative.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300">In-progress writing</h2>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              This section houses continuing stories and essay fragments. It is less finished than the other pages and designed to hold ideas that are still growing.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
