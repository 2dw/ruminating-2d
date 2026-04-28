"use client"

import { motion } from "framer-motion"
import { Camera, Palette, PenTool } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const sections = [
  {
    title: "Creative Endeavors",
    description: "Art, design, and experimental thinking in a calm, focused space.",
    icon: <Palette className="h-5 w-5" />,
    href: "/personal/creative",
  },
  {
    title: "Imagery Meanderings",
    description: "Albums and photography journeys that unfold in dedicated pages.",
    icon: <Camera className="h-5 w-5" />,
    href: "/personal/imagery",
  },
  {
    title: "The Story Is Being Written",
    description: "Notes, essays, and story fragments that are still growing.",
    icon: <PenTool className="h-5 w-5" />,
    href: "/personal/story",
  },
]

export default function PersonalWorld() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500">
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="text-5xl font-serif font-bold text-blue-700 dark:text-blue-300 mb-6">
            Mind Wanderings
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-700 dark:text-gray-300">
            A calm overview of my creative practice, photography journeys, and the writing that is still unfolding.
          </p>
        </motion.div>

        <section className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => (
            <button
              key={section.title}
              type="button"
              onClick={() => router.push(section.href)}
              className="group rounded-3xl border border-slate-200 bg-white p-8 text-left transition hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50/80 dark:border-slate-800 dark:bg-slate-950/80 dark:hover:border-blue-500 dark:hover:bg-blue-950/60"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                {section.icon}
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{section.description}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-300">
                Open section
                <span aria-hidden="true">→</span>
              </div>
            </button>
          ))}
        </section>
      </main>
    </div>
  )
}
