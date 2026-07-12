"use client"

import { motion } from "framer-motion"
import { BookOpen, Sparkles, Lightbulb } from "lucide-react"
import { useRouter } from "next/navigation"
const sections = [
  {
    title: "Me Until Now",
    description:
      "Two decades at the intersection of engineering, distributed energy, and the conviction that a sustainable future must also be an equitable one. Stanford Ph.D. · three startups · two acquisitions.",
    icon: <BookOpen className="h-5 w-5" />,
    href: "/professional/me",
  },
  {
    title: "Tiny Endeavors",
    description:
      "Research publications, live projects, and a home energy dashboard — where the engineering becomes tangible. IEEE papers on DER control plus a live solar and battery system built from scratch.",
    icon: <Sparkles className="h-5 w-5" />,
    href: "/professional/endeavors",
  },
  {
    title: "Mission Musings",
    description:
      "Electrons are the network through which our resources communicate. Thoughts on distributed intelligence, the nexus of energy and water and food and waste, and what an equitable energy transition actually requires.",
    icon: <Lightbulb className="h-5 w-5" />,
    href: "/professional/musings",
  },
]

export default function ProfessionalPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500 pt-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="text-5xl font-serif font-bold text-green-700 dark:text-green-300 mb-6">
            Professional Repertoire
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-700 dark:text-gray-300">
            Engineering and product leadership at the frontier of distributed energy —
            building platforms, scaling acquisitions, and proving that intelligent systems
            and equitable access are not in conflict.
          </p>
        </motion.div>

        <section className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => (
            <button
              key={section.title}
              type="button"
              onClick={() => router.push(section.href)}
              className="group rounded-3xl border border-slate-200 bg-white p-8 text-left transition hover:-translate-y-1 hover:border-green-300 hover:bg-green-50/80 dark:border-slate-800 dark:bg-slate-950/80 dark:hover:border-green-500 dark:hover:bg-green-950/60"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                {section.icon}
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {section.description}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-300">
                Open section
                <span aria-hidden="true">→</span>
              </div>
            </button>
          ))}
        </section>

        {/* Thought leadership strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <p className="text-xs text-center text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            Thought Leadership
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Distributech", "RE+ Grid Edge", "NABCEP", "IEEE Tech Expo",
              "Smart Grid", "Wood Mackenzie Grid Edge Summit", "Stanford Energy Seminar",
              "NY Climate Week", "Interchange Recharged Podcast",
              "Microgrid Knowledge", "GridTECH", "International Microgrid Symposium",
            ].map(venue => (
              <span
                key={venue}
                className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs text-slate-500 dark:text-slate-400"
              >
                {venue}
              </span>
            ))}
          </div>
        </motion.div>

      </main>
    </div>
  )
}
