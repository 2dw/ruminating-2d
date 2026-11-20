"use client"

import { motion } from "framer-motion"
import { Zap, FileText, Sparkles, Compass, Network, ArrowUpRight } from "lucide-react"
import { ProjectConstellation } from "@/components/project-constellation"

export function SeedingNetworksSection() {
  return (
    <motion.section
      id="deep-dives"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="my-16 scroll-mt-24"
    >
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white/90 via-slate-50/60 to-white/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl dark:border-slate-800/90 dark:from-slate-900/90 dark:via-slate-950/70 dark:to-slate-900/90 dark:shadow-slate-950/50">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-b border-slate-200/70 pb-6 dark:border-slate-800/70">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Deep Dives &bull; Technical Blueprints
                </span>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  Living Constellation
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                Seeding Networks
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Translating overarching systems philosophy into executable architecture. Detailed roadmaps, whitepapers,
                and technical frameworks designed to seed distributed, community-scale infrastructure.
              </p>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="flex flex-col sm:items-end gap-1.5 self-start md:self-auto shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Expanding Repository</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              Click any star node to explore
            </p>
          </div>
        </div>

        {/* Thematic Focus Pills */}
        <div className="my-5 flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono uppercase font-semibold text-slate-400 dark:text-slate-500 mr-1">
            Focus Areas:
          </span>
          {[
            "Transactive Energy Roadmaps",
            "Distributed Optimization & DERMS",
            "Virtual Power Plant (VPP) Control",
            "Community Microgrid Governance",
          ].map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-mono px-3 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/70 shadow-2xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Embedded Project Constellation Canvas */}
        <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 shadow-2xl dark:border-slate-800">
          <div className="absolute top-3 right-3 z-10 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[10px] font-mono text-slate-300 pointer-events-none">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span>Interactive Sky &bull; Drag to pan &bull; Click to open</span>
          </div>

          <ProjectConstellation
            prefix="thought pieces/"
            noMediaMessage="Media coming soon."
          />
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <p className="italic">
            New architectural roadmaps and whitepapers are added as ongoing research and microgrid deployments progress.
          </p>
          <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 shrink-0">
            <span>R2 Connected</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>

      </div>
    </motion.section>
  )
}
