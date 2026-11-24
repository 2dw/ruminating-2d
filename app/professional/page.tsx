"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Sparkles, Lightbulb, Linkedin, ExternalLink, Zap, Network, Layers, ShieldCheck, Compass, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

const sections = [
  {
    title: "Me Until Now",
    badge: "Trajectory & Leadership",
    highlight: "Stanford Ph.D. · 3 Startups · 2 Acquisitions",
    description:
      "Two decades at the intersection of engineering, distributed energy, and the conviction that a sustainable future must also be an equitable one. From algorithmic foundations to building and scaling mission-critical platforms.",
    icon: <BookOpen className="h-6 w-6" />,
    href: "/professional/me",
    accent: "from-emerald-500/10 via-teal-500/5 to-transparent",
    border: "hover:border-emerald-400 dark:hover:border-emerald-500",
    glow: "group-hover:shadow-emerald-500/15 dark:group-hover:shadow-emerald-950/60",
    tags: ["Distributed Optimization", "Product Strategy", "VPP Scale"],
  },
  {
    title: "Tiny Endeavors",
    badge: "Applied Research & Live Hardware",
    highlight: "IEEE Publications · EcoFlow Home Microgrid",
    description:
      "Research publications and living projects demonstrating distributed control in practice. Academic IEEE papers on microgrid optimization alongside a real-time residential solar + battery DER dispatch system.",
    icon: <Sparkles className="h-6 w-6" />,
    href: "/professional/endeavors",
    accent: "from-teal-500/10 via-emerald-500/5 to-transparent",
    border: "hover:border-teal-400 dark:hover:border-teal-500",
    glow: "group-hover:shadow-teal-500/15 dark:group-hover:shadow-teal-950/60",
    tags: ["IEEE Control Papers", "Real-Time Telemetry", "Solar + Storage VPP"],
  },
  {
    title: "Mission Musings",
    badge: "Philosophy as Architecture",
    highlight: "Esse Quam Videri · The Living Nexus · Seeding Networks",
    description:
      "Electrons are the network through which our resources communicate. Thoughts on distributed intelligence, the nexus of energy and water and food and waste, and what an equitable energy transition actually requires.",
    icon: <Lightbulb className="h-6 w-6" />,
    href: "/professional/musings",
    accent: "from-amber-500/10 via-emerald-500/5 to-transparent",
    border: "hover:border-amber-400 dark:hover:border-amber-500",
    glow: "group-hover:shadow-amber-500/15 dark:group-hover:shadow-amber-950/60",
    tags: ["Systems Nexus", "Decentralized Agency", "Technical Roadmaps"],
  },
]

const PRACTICE_PILLARS = [
  {
    id: "optimization",
    label: "Distributed Optimization",
    icon: Network,
    desc: "Mathematical control algorithms that balance volatile renewables at the extreme grid edge without centralized fragility.",
  },
  {
    id: "vpp",
    label: "Virtual Power Plants",
    icon: Zap,
    desc: "Aggregating millions of batteries, EVs, and smart thermals into coordinated civic assets that replace polluting peaker plants.",
  },
  {
    id: "resilience",
    label: "Community Resilience",
    icon: ShieldCheck,
    desc: "Neighborhood islanding, Red Cross resilience hubs, and Oakland EcoBlock microgrids ensuring survival during utility shutoffs.",
  },
  {
    id: "agency",
    label: "Democratized Agency",
    icon: Compass,
    desc: "Shifting passive consumers into active resource co-stewards with transparent algorithmic governance and local wealth creation.",
  },
]

export default function ProfessionalPage() {
  const router = useRouter()
  const [activePillar, setActivePillar] = useState(0)

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
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Infrastructure &bull; Distributed Energy &bull; Product Strategy
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-slate-900 dark:text-white mb-5 tracking-tight">
            Professional Repertoire
          </h1>
          <p className="mx-auto max-w-3xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-serif">
            Engineering and product leadership at the frontier of distributed energy—building platforms that prove intelligent systems and equitable access are not in conflict, but mutually reinforcing.
          </p>

          {/* Core Metrics Ribbon */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {[
              { val: "20+ Years", label: "Distributed Grid Focus" },
              { val: "Stanford Ph.D.", label: "Energy Optimization & Control" },
              { val: "3 Startups", label: "2 Strategic Acquisitions" },
              { val: "Living Nexus", label: "Energy · Water · Food · Equity" },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-200/80 bg-white/70 p-3.5 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-950/60 text-center"
              >
                <p className="font-serif text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-300">
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/40 shadow-xs transition-transform duration-300 group-hover:scale-105">
                      {section.icon}
                    </div>
                    <span className="font-mono text-[9.5px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                      {section.badge}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    {section.title}
                  </h2>

                  <p className="mt-1 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
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

                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-600 group-hover:text-emerald-700 dark:text-emerald-400 dark:group-hover:text-emerald-300 transition-colors">
                    <span>Explore Space</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </section>

        {/* Interactive Systems Architecture Pillars (Infographic) */}
        <section className="mb-16 rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/90 via-slate-50/70 to-white/90 p-6 sm:p-8 backdrop-blur-xl shadow-lg dark:border-slate-800/80 dark:from-slate-950/90 dark:via-slate-900/60 dark:to-slate-950/90">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/60 pb-5 mb-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                Living Architecture &bull; Guiding Principles
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                The Four Pillars of Modern Grid Strategy
              </h3>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 self-start sm:self-auto">
              Select any pillar to inspect system implications
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            {PRACTICE_PILLARS.map((p, i) => {
              const PIcon = p.icon
              const isSelected = activePillar === i
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePillar(i)}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all min-h-[50px] touch-manipulation ${
                    isSelected
                      ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 border-emerald-600 shadow-md scale-[1.02]"
                      : "bg-white/80 hover:bg-slate-100/80 dark:bg-slate-900/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/60"
                  }`}
                >
                  <PIcon className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-serif font-semibold leading-tight">{p.label}</span>
                </button>
              )
            })}
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/40">
                {(() => {
                  const CurrentIcon = PRACTICE_PILLARS[activePillar].icon
                  return <CurrentIcon className="h-5 w-5" />
                })()}
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  {PRACTICE_PILLARS[activePillar].label}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                  {PRACTICE_PILLARS[activePillar].desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Thought Leadership Venues Strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-14 text-center"
        >
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 font-mono font-semibold">
            Industry Keynotes &bull; Thought Leadership &bull; Advisory
          </p>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {[
              "Distributech", "RE+ Grid Edge", "NABCEP Keynote", "IEEE Tech Expo",
              "Smart Grid Symposium", "Wood Mackenzie Grid Edge Summit", "Stanford Energy Seminar",
              "NY Climate Week", "Interchange Recharged Podcast",
              "Microgrid Knowledge", "GridTECH", "International Microgrid Symposium",
            ].map(venue => (
              <span
                key={venue}
                className="rounded-full border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3.5 py-1 text-xs font-mono text-slate-600 dark:text-slate-400 shadow-2xs hover:border-emerald-400/50 transition-colors"
              >
                {venue}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Connect on LinkedIn */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center"
        >
          <a
            href="https://www.linkedin.com/in/trudie/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3.5 rounded-2xl border border-emerald-300/80 bg-emerald-50/80 px-6 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-900/10 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:hover:border-emerald-500 dark:hover:shadow-emerald-950/50"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white transition-colors duration-300 group-hover:bg-emerald-700 shadow-sm">
              <Linkedin className="h-5 w-5" />
            </span>
            <span className="text-left">
              <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Professional Network &bull; Advisory
              </span>
              <span className="block font-serif text-lg font-bold text-slate-900 dark:text-white">
                Connect on LinkedIn
              </span>
            </span>
            <ExternalLink className="h-4 w-4 text-emerald-600 transition-transform duration-300 group-hover:translate-x-1 dark:text-emerald-400 ml-1" />
          </a>
        </motion.div>

      </main>
    </div>
  )
}

