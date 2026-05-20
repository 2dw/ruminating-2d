"use client"

import { motion } from "framer-motion"
import { ArrowLeft, PenTool } from "lucide-react"
import { useRouter } from "next/navigation"

import { DynamicFrame } from "@/components/dynamic-frame"
import { Button } from "@/components/ui/button"

export default function CreativePoetryPage() {
  const router = useRouter()

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white"
    >
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
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
              <PenTool className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Poetry & Reflections</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Writing that explores identity, belonging, and our relationship with the natural world.
              </p>
            </div>
          </div>

          <DynamicFrame className="border border-blue-200 bg-white/95 dark:border-blue-800 dark:bg-gray-950/95">
            <div className="p-6 sm:p-8">
              <h2 className="mb-4 text-lg font-serif font-semibold text-blue-700 dark:text-blue-300">
                Featured Poem: Mycelium Dreams
              </h2>
              <div className="prose prose-blue max-w-none dark:prose-invert">
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300">
                  <p>
                    Beneath our feet, a quiet conversation
                    <br />
                    Threads of life, weaving through the dark
                    <br />
                    Mycelium whispers, ancient and wise
                    <br />
                    Connecting what seems separate, healing what's harmed.
                  </p>

                  <p>
                    I dream of human networks, just as kind
                    <br />
                    Resources flowing where they're needed most
                    <br />
                    No life too small, no corner left behind
                    <br />A wisdom older than our youngest boast.
                  </p>

                  <p>
                    In engineering steel and silicon
                    <br />
                    Can we remember fungal filaments?
                    <br />
                    The strength in softness, power in connection
                    <br />
                    The quiet work that needs no monument.
                  </p>
                </blockquote>
              </div>
            </div>
          </DynamicFrame>
        </motion.div>
      </main>
    </div>
  )
}
