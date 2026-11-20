"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Droplets, Sprout, Wind, Home, ShieldAlert, Sparkles, RefreshCcw } from "lucide-react"

interface NexusDomain {
  id: string
  name: string
  icon: typeof Sun
  accent: string
  ringColor: string
  summary: string
  connections: { target: string; relationship: string; engineeringProof: string }[]
}

const NEXUS_DOMAINS: NexusDomain[] = [
  {
    id: "energy",
    name: "Distributed Energy",
    icon: Sun,
    accent: "#10b981",
    ringColor: "rgba(16, 185, 129, 0.4)",
    summary: "The electrical lifeblood through which human systems communicate. When distributed, electrons carry both power and democratic agency.",
    connections: [
      {
        target: "Water & Sanitation",
        relationship: "Powers energy-intensive wastewater treatment, desalination, and critical pumping stations without grid vulnerability.",
        engineeringProof: "Resilient on-site microgrids at wastewater reclamation plants prevent catastrophic sewage overflows during severe storms.",
      },
      {
        target: "Food & Agriculture",
        relationship: "Supplies solar irrigation and cold storage, smoothing seasonal demand via transactive load shifting.",
        engineeringProof: "Agrivoltaics: Dual-use solar canopies protect shade crops from scorching while generating clean power for refrigeration.",
      },
      {
        target: "Community Equity",
        relationship: "Shields frontline residents from escalating utility rates and brownouts through neighborhood Virtual Power Plants (VPPs).",
        engineeringProof: "The Oakland EcoBlock project proves how multi-tenant urban blocks can share local generation to cut energy burdens.",
      },
    ],
  },
  {
    id: "water",
    name: "Water & Sanitation",
    icon: Droplets,
    accent: "#06b6d4",
    ringColor: "rgba(6, 182, 212, 0.4)",
    summary: "Essential for all biological life, agriculture, and power generation. Treating water as a circular loop rather than a linear disposal.",
    connections: [
      {
        target: "Distributed Energy",
        relationship: "Provides dynamic flexibility; municipal water reservoirs and pumps act as massive physical batteries for peak shaving.",
        engineeringProof: "Pumped-storage and scheduled pumping algorithms soak up excess midday solar without requiring lithium chemical batteries.",
      },
      {
        target: "Ecosystems & Climate",
        relationship: "Restores watershed aquifers and wetlands, sequestering carbon and naturally buffering coastal storm surges.",
        engineeringProof: "Decentralized wastewater treatment enables localized greywater reuse for urban green canopies and canopy cooling.",
      },
    ],
  },
  {
    id: "food",
    name: "Food & Soil Systems",
    icon: Sprout,
    accent: "#84cc16",
    ringColor: "rgba(132, 204, 22, 0.4)",
    summary: "The foundation of civilization. Regenerative food production couples land stewardship with low-carbon supply chains.",
    connections: [
      {
        target: "Distributed Energy",
        relationship: "Transforms organic agricultural and food waste into biopower and localized micro-digester generation.",
        engineeringProof: "Anaerobic digesters at rural cooperatives generate steady dispatchable baseload power while generating organic fertilizer.",
      },
      {
        target: "Water & Sanitation",
        relationship: "Soil organic matter increases sponge-capacity, dramatically reducing irrigation volume and runoff pollution.",
        engineeringProof: "Precision solar moisture-sensing arrays trigger micro-drip irrigation only during optimal nocturnal cycles.",
      },
    ],
  },
  {
    id: "climate",
    name: "Climate Adaptation",
    icon: Wind,
    accent: "#38bdf8",
    ringColor: "rgba(56, 189, 248, 0.4)",
    summary: "Mitigation is the promise to future generations; adaptation is survival in the climate volatility already locked into the biosphere.",
    connections: [
      {
        target: "Distributed Energy",
        relationship: "Hardens the grid against wildfire shutoffs, heat domes, and atmospheric rivers via intentional islanding.",
        engineeringProof: "Microgrids maintain critical medical and refrigeration loads when extreme heat forces regional utility blackouts.",
      },
      {
        target: "Community Equity",
        relationship: "Reduces deadly urban heat island disparities through reflective solar roofs and community cooling hubs.",
        engineeringProof: "Red Cross Community Resilience Hubs equipped with islandable battery storage offer emergency shelter during disasters.",
      },
    ],
  },
  {
    id: "community",
    name: "Community & Agency",
    icon: Home,
    accent: "#f59e0b",
    ringColor: "rgba(245, 158, 11, 0.4)",
    summary: "Where all systems converge: human flourishing, civic self-determination, and the shared conviction that resilience belongs to everyone.",
    connections: [
      {
        target: "Distributed Energy",
        relationship: "Transforms residents from passive rate-payers into active resource co-stewards and grid participants.",
        engineeringProof: "Community microgrid governance structures allow neighbors to collectively decide storage reserves during emergencies.",
      },
      {
        target: "Climate Adaptation",
        relationship: "Social cohesion and localized emergency infrastructure form the highest predictor of disaster survival.",
        engineeringProof: "Neighborhood resilience hubs serve as day-to-day community centers that transition into lifeline power islands during crises.",
      },
    ],
  },
]

export function NexusInteractiveDiagram() {
  const [selectedDomain, setSelectedDomain] = useState<string>("energy")

  const current = NEXUS_DOMAINS.find((d) => d.id === selectedDomain) || NEXUS_DOMAINS[0]
  const Icon = current.icon

  return (
    <div className="my-12 rounded-3xl border border-slate-200/80 bg-white/70 p-6 sm:p-8 backdrop-blur-xl shadow-lg dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-slate-950/40">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/60 pb-5 dark:border-slate-800/60">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
            Interactive Systems Nexus
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white mt-1">
            The Living Interconnection: Energy &bull; Water &bull; Food &bull; Climate &bull; Community
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            The world does not respect disciplinary silos. Select any domain below to see how relationships generate systemic resilience.
          </p>
        </div>
      </div>

      {/* Domain Selection Pills - Auto-resizes to fit on a single line */}
      <div className="my-6 grid grid-cols-5 gap-1 sm:gap-2 w-full">
        {NEXUS_DOMAINS.map((domain) => {
          const DIcon = domain.icon
          const isSelected = domain.id === selectedDomain
          return (
            <button
              key={domain.id}
              onClick={() => setSelectedDomain(domain.id)}
              className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2 md:px-3 py-2 rounded-xl text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md scale-[1.02]"
                  : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700/60"
              }`}
            >
              <DIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" style={{ color: isSelected ? undefined : domain.accent }} />
              <span className="truncate">{domain.name}</span>
            </button>
          )
        })}
      </div>

      {/* Active Domain Spotlight & Interactive Feedback Connections */}
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/70 to-slate-100/40 p-5 sm:p-6 dark:border-slate-800/80 dark:from-slate-950/50 dark:to-slate-900/40">
        <div className="flex items-start gap-4 mb-5">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner"
            style={{ backgroundColor: `${current.accent}20`, border: `1.5px solid ${current.accent}` }}
          >
            <Icon className="h-6 w-6" style={{ color: current.accent }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
                {current.name}
              </h4>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase"
                style={{ backgroundColor: `${current.accent}20`, color: current.accent }}
              >
                Nexus Node
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {current.summary}
            </p>
          </div>
        </div>

        {/* Feedback Loops Grid */}
        <div className="space-y-3">
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Systems Feedback Loops & Engineering Realizations:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {current.connections.map((conn, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 transition-all hover:border-emerald-400/50"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>&harr; {conn.target}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {conn.relationship}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-[9.5px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                    Proof in Practice:
                  </span>
                  <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400 italic">
                    {conn.engineeringProof}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
