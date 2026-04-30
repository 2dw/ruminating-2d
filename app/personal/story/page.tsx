"use client"

import { motion } from "framer-motion"
import { PenTool } from "lucide-react"
import { DynamicFrame } from "@/components/dynamic-frame"

export default function PersonalStoryPage() {
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
              <PenTool className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">The Story Is Being Written</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                A novel exploring interconnectedness, natural systems, and the stories we tell ourselves about the world.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DynamicFrame className="border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
              <div className="p-6">
                <h3 className="text-lg font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">
                  The Mycelium Chronicles
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  I'm currently writing a speculative fiction novel set in a near-future world where humans have learned to communicate with mycelium networks. This ongoing project explores themes of interconnectedness, collective intelligence, and our relationship with the natural world.
                </p>
                <div className="prose prose-blue dark:prose-invert max-w-none">
                  <blockquote className="italic text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-4">
                    <p>
                      "The first time Maya heard the mycelium speak, she was kneeling in her grandmother's garden, hands deep in the rich soil. It wasn't a voice, exactly—more like a feeling that formed itself into words in her mind. A gentle hum that resolved into meaning.
                    </p>
                    <p>'We have been waiting for you,' it seemed to say. 'For someone who would listen.'</p>
                    <p>
                      Maya withdrew her hands quickly, heart racing. She had heard the stories, of course—everyone had, since the Great Reconnection—but she had always assumed they were exaggerations. Metaphors for the new environmental awareness that had swept through society after the Climate Crisis of the 2030s.
                    </p>
                    <p>But this was no metaphor. This was a conversation."</p>
                  </blockquote>
                </div>
              </div>
            </DynamicFrame>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <DynamicFrame className="border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                <div className="p-6">
                  <h3 className="text-lg font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">
                    Story Themes
                  </h3>
                  <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                    <motion.li
                      className="flex items-start gap-2"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <span>The wisdom embedded in natural systems and what humans can learn from them</span>
                    </motion.li>
                    <motion.li
                      className="flex items-start gap-2"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <span>
                        Bridging cultural and generational divides through shared connection to the earth
                      </span>
                    </motion.li>
                    <motion.li
                      className="flex items-start gap-2"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <span>
                        Reimagining technology as an extension of natural processes rather than separate from them
                      </span>
                    </motion.li>
                    <motion.li
                      className="flex items-start gap-2"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                      <span>Finding hope and resilience in times of environmental crisis</span>
                    </motion.li>
                  </ul>
                </div>
              </DynamicFrame>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <DynamicFrame className="border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                <div className="p-6">
                  <h3 className="text-lg font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">
                    Writing Process
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    This story grows organically, much like the mycelium networks that inspire it. I don't follow a rigid outline, instead allowing the narrative to branch and connect in unexpected ways.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    I write most often in the early mornings or while traveling, capturing ideas in a small notebook before developing them further. The story is intentionally always "in progress"—a living document that evolves as my own understanding of interconnectedness deepens.
                  </p>
                </div>
              </DynamicFrame>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <DynamicFrame className="mt-8 border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
              <div className="p-6">
                <h3 className="text-lg font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">
                  Short Stories
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  In addition to my novel-in-progress, I write short stories that explore similar themes of connection, nature, and identity. These shorter pieces allow me to experiment with different voices and perspectives.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    className="border border-blue-100 dark:border-blue-800 rounded-md p-4"
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                  >
                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">"The Listener"</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      A scientist develops technology to hear plant communications, only to discover they've been speaking to her all along.
                    </p>
                  </motion.div>
                  <motion.div
                    className="border border-blue-100 dark:border-blue-800 rounded-md p-4"
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                  >
                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">"Roots and Branches"</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      An intergenerational story about a family's connection to a forest that holds their ancestors' memories.
                    </p>
                  </motion.div>
                </div>
              </div>
            </DynamicFrame>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
