"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Camera, Palette, PenTool, ArrowRight, Sparkles, Compass, Eye, Heart } from "lucide-react"
import { useRouter } from "next/navigation"

const sections = [
  {
    title: "Creative Endeavors",
    badge: "Fine Art & Hands-On Explorations",
    highlight: "Graphite, Cellulose & Lignin · Adventures · Heists & Storyboards",
    description:
      "Fine artwork, independent builds, and playful keepsakes. From tunneling visions onto paper with graphite and carbon fiber turbines to coastal sandstone scrambles and liberated Hong Kong street signs.",
    icon: <Palette className="h-6 w-6" />,
    href: "/personal/creative",
    accent: "from-sky-500/10 via-blue-500/5 to-transparent",
    border: "hover:border-sky-400 dark:hover:border-sky-500",
    glow: "group-hover:shadow-sky-500/15 dark:group-hover:shadow-sky-950/60",
    tags: ["Graphite Studies", "Living Galleries", "Nostalgic Keepsakes"],
  },
  {
    title: "Imagery Meanderings",
    badge: "Photography Archives",
    highlight: "Curated Albums · Architectural Vistas · Natural Landscapes",
    description:
      "Visual journeys across continents and natural habitats. Photographs capturing light, geometry, quiet moments, and the delicate equilibrium of landscapes across the Pacific and beyond.",
    icon: <Camera className="h-6 w-6" />,
    href: "/personal/imagery",
    accent: "from-cyan-500/10 via-sky-500/5 to-transparent",
    border: "hover:border-cyan-400 dark:hover:border-cyan-500",
    glow: "group-hover:shadow-cyan-500/15 dark:group-hover:shadow-cyan-950/60",
    tags: ["Urban Geometries", "Wild Landscapes", "Curated Series"],
  },
  {
    title: "The Story Is Being Written",
    badge: "Essays & Unfolding Narratives",
    highlight: "Reflective Fragments · Observations on Belonging",
    description:
      "Notes, essay drafts, and story fragments exploring identity, belonging, and the quiet lessons offered by natural ecosystems. An unfolding archive of thoughts that refuse to be rushed.",
    icon: <PenTool className="h-6 w-6" />,
    href: "/personal/story",
    accent: "from-indigo-500/10 via-blue-500/5 to-transparent",
    border: "hover:border-indigo-400 dark:hover:border-indigo-500",
    glow: "group-hover:shadow-indigo-500/15 dark:group-hover:shadow-indigo-950/60",
    tags: ["Personal Essays", "Living Systems Metaphors", "Reflections"],
  },
]

const TRIAD_ELEMENTS = [
  {
    label: "Vision",
    icon: Palette,
    summary: "Translating internal intuitions and subconscious queries into tangible art, structures, and artifacts.",
  },
  {
    label: "Light",
    icon: Camera,
    summary: "Capturing fleeting atmospheric geometry, perspective, and the raw beauty of natural ecosystems.",
  },
  {
    label: "Word",
    icon: PenTool,
    summary: "Crafting narratives and reflections that synthesize lived experience with systems thinking.",
  },
]

export default function PersonalWorld() {
  const router = useRouter()
  const [activeTriad, setActiveTriad] = useState(0)

  return (
    <div className="min-h-screen w-full bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500 pt-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center relative"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-4">
            <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            Creative Practice &bull; Photography &bull; Narrative
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-slate-900 dark:text-white mb-5 tracking-tight">
            Mind Wanderings
          </h1>
          <p className="mx-auto max-w-3xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-serif">
            A calm space for artistic practice, photography meanderings across continents, and written fragments that explore the quiet, delicate connections binding human beings to the natural world.
          </p>

          {/* Creative Ribbons */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {[
              { val: "Living Galleries", label: "Dynamic R2 Artwork" },
              { val: "Storyboards", label: "Adventures & Keepsakes" },
              { val: "Photo Journeys", label: "Curated Global Albums" },
              { val: "Unfolding Words", label: "Reflective Manuscripts" },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-200/80 bg-white/70 p-3.5 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-950/60 text-center"
              >
                <p className="font-serif text-lg sm:text-xl font-bold text-sky-700 dark:text-sky-300">
                  {metric.val}
                </p>
                <p className="font-mono text-[10.5px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 3 Main World Section Cards */}
        <section className="grid gap-6 md:grid-cols-3 mb-16">
          {sections.map((section, idx) => (
            <motion.button
              key={section.title}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => router.push(section.href)}
              className={`group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/80 p-7 sm:p-8 text-left transition-all duration-300 shadow-sm hover:shadow-xl dark:border-slate-800/90 dark:bg-slate-950/70 ${section.border} ${section.glow}`}
            >
              {/* Subtle Ambient Gradient on Hover */}
              <div className={`pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${section.accent} z-0`} />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-300/40 dark:border-sky-700/40 shadow-xs transition-transform duration-300 group-hover:scale-105">
                      {section.icon}
                    </div>
                    <span className="font-mono text-[9.5px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                      {section.badge}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
                    {section.title}
                  </h2>

                  <p className="mt-1 font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                    {section.highlight}
                  </p>

                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {section.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {section.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-sky-600 group-hover:text-sky-700 dark:text-sky-400 dark:group-hover:text-sky-300 transition-colors">
                    <span>Enter Space</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </section>

        {/* The Triad of Wandering (Infographic Strip) */}
        <section className="mb-12 rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/90 via-slate-50/70 to-white/90 p-6 sm:p-8 backdrop-blur-xl shadow-lg dark:border-slate-800/80 dark:from-slate-950/90 dark:via-slate-900/60 dark:to-slate-950/90">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/60 pb-5 mb-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-sky-600 dark:text-sky-400 font-semibold">
                Triad of Wandering &bull; Living Expression
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                Vision, Light, and Words
              </h3>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 self-start sm:self-auto">
              The creative current beneath systems thinking
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {TRIAD_ELEMENTS.map((elem, i) => {
              const EIcon = elem.icon
              const isSelected = activeTriad === i
              return (
                <button
                  key={elem.label}
                  type="button"
                  onClick={() => setActiveTriad(i)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border transition-all text-center sm:text-left min-h-[50px] touch-manipulation ${
                    isSelected
                      ? "bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950 border-sky-600 shadow-md scale-[1.02]"
                      : "bg-white/80 hover:bg-slate-100/80 dark:bg-slate-900/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/60"
                  }`}
                >
                  <EIcon className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-serif font-semibold">{elem.label}</span>
                </button>
              )
            })}
          </div>

          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-300/40 dark:border-sky-700/40">
                {(() => {
                  const CurrentIcon = TRIAD_ELEMENTS[activeTriad].icon
                  return <CurrentIcon className="h-5 w-5" />
                })()}
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  The Dimension of {TRIAD_ELEMENTS[activeTriad].label}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                  {TRIAD_ELEMENTS[activeTriad].summary}
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}

