"use client"

import { motion } from "framer-motion"
import { Palette } from "lucide-react"
import { DynamicFrame } from "@/components/dynamic-frame"
import Image from "next/image"

export default function PersonalCreativePage() {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500 pt-24"
    >
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              <Palette className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Creative Endeavors</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Beyond my professional work, I explore creativity through various mediums. These personal projects allow me to process my experiences, connect with others, and find joy in the process of making.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <DynamicFrame className="h-full border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                <div className="h-48 bg-blue-100 dark:bg-blue-900/30 relative">
                  <Image
                    src="/placeholder.svg?height=192&width=384&text=Digital+Art"
                    alt="Digital Art"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-serif font-semibold mb-2 text-blue-700 dark:text-blue-300">
                    Digital Art Explorations
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    I create digital illustrations that explore the relationship between humanity and nature. Many of my pieces incorporate mycelium-inspired patterns and connections, reflecting my belief in our interconnectedness.
                  </p>
                </div>
              </DynamicFrame>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <DynamicFrame className="h-full border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                <div className="h-48 bg-blue-100 dark:bg-blue-900/30 relative">
                  <Image
                    src="/placeholder.svg?height=192&width=384&text=Poetry"
                    alt="Poetry"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-serif font-semibold mb-2 text-blue-700 dark:text-blue-300">
                    Poetry & Reflections
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Writing poetry helps me process complex emotions and ideas. My poems often explore themes of identity, belonging, and our relationship with the natural world.
                  </p>
                </div>
              </DynamicFrame>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <DynamicFrame className="mt-8 border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
              <div className="p-6">
                <h3 className="text-lg font-serif font-semibold mb-4 text-blue-700 dark:text-blue-300">
                  Featured Poem: Mycelium Dreams
                </h3>
                <div className="prose prose-blue dark:prose-invert max-w-none">
                  <blockquote className="italic text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-4">
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
        </motion.div>
      </main>
    </div>
  )
}
