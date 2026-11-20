"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Network, Server, Users, ShieldCheck, AlertTriangle, ArrowRight, RefreshCw, Zap, Leaf } from "lucide-react"

export function ArchitectureComparisonVisualizer() {
  const [mode, setMode] = useState<"centralized" | "distributed">("distributed")
  const [selectedAspect, setSelectedAspect] = useState<number>(0)

  const aspects = [
    {
      title: "Agency & Role of People",
      icon: Users,
      centralized: {
        headline: "Passive Consumers",
        description: "Individuals and neighborhoods are downstream recipients with zero visibility or control. Power and decisions flow in one direction; vulnerability is borne locally while authority remains distant.",
        status: "Agency Concentrated at Center",
        statusColor: "text-amber-500",
      },
      distributed: {
        headline: "Active Participants & Co-Stewards",
        description: "Homes, schools, and local businesses generate, store, and balance resources. Transforming passive consumers into active stewards who contribute to shared grid reliability and communal self-determination.",
        status: "Agency Distributed Across Nodes",
        statusColor: "text-emerald-500",
      },
    },
    {
      title: "Resilience & Failure Modes",
      icon: ShieldCheck,
      centralized: {
        headline: "Single-Point Fragility",
        description: "A severed transmission line, extreme weather event, or cyber vulnerability can blackout millions simultaneously. Efficiency is prioritized over redundancy, creating catastrophic failure modes.",
        status: "Brittle Under Shock",
        statusColor: "text-rose-500",
      },
      distributed: {
        headline: "Biomimetic Redundancy",
        description: "Modeled after living ecosystems. If one feeder or substation falters, microgrids seamlessly island into self-sustaining nodes while Virtual Power Plants dynamically reroute capacity.",
        status: "Adaptive & Islandable",
        statusColor: "text-emerald-500",
      },
    },
    {
      title: "Incentives & Equity",
      icon: Leaf,
      centralized: {
        headline: "Concentrated Gains, Distributed Externalities",
        description: "Economic yields accrue to central utilities and holding companies, while emissions, infrastructure strain, and climate disruptions disproportionately burden frontline communities.",
        status: "Equity as an Afterthought",
        statusColor: "text-amber-500",
      },
      distributed: {
        headline: "Inseparable Equity & Value Democratization",
        description: "Decentralized energy builds community wealth. Clean power and resilience are deployed directly where people live—from Oakland EcoBlock to Red Cross resilience hubs—ensuring no neighborhood is left behind.",
        status: "Equity as a Structural Requirement",
        statusColor: "text-emerald-500",
      },
    },
    {
      title: "Information & Decision Flow",
      icon: Zap,
      centralized: {
        headline: "Opaque Top-Down Dispatch",
        description: "Closed proprietary algorithms and hierarchical command-and-control. Decision logic is obscured, making it difficult for communities to align energy use with their environmental values.",
        status: "Information Asymmetry",
        statusColor: "text-rose-500",
      },
      distributed: {
        headline: "Decentralized Intelligence & Transparent AI",
        description: "Open communication standards and transparent predictive optimization. Automated resource allocation ensures local batteries and EVs serve the common good before extracting economic rents.",
        status: "Coordinated Multi-Agent Optimization",
        statusColor: "text-emerald-500",
      },
    },
  ]

  const active = aspects[selectedAspect]

  return (
    <div className="my-12 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-6 sm:p-8 backdrop-blur-xl shadow-lg dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-slate-950/40">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
              Architectural Systems Model
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white mt-1">
            Centralized Hierarchy vs. Distributed Agency
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            The difference is not merely ideological; it is the physical and structural layout of agency, resilience, and stewardship.
          </p>
        </div>

        {/* Paradigm Toggle */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 self-start sm:self-center">
          <button
            onClick={() => setMode("centralized")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              mode === "centralized"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-amber-300"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Centralized Model
          </button>
          <button
            onClick={() => setMode("distributed")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              mode === "distributed"
                ? "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Distributed Model
          </button>
        </div>
      </div>

      {/* Interactive Topology Diagram */}
      <div className="relative my-6 rounded-2xl border border-slate-200/60 bg-gradient-to-b from-slate-50/50 to-slate-100/30 p-4 sm:p-6 dark:border-slate-800/50 dark:from-slate-950/40 dark:to-slate-900/20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* SVG Canvas */}
          <div className="md:col-span-6 flex items-center justify-center">
            <svg viewBox="0 0 400 260" className="w-full max-w-sm h-auto select-none">
              <defs>
                <linearGradient id="centralGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="distributedGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                </linearGradient>
                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {mode === "centralized" ? (
                // CENTRALIZED TOPOLOGY
                <g className="transition-all duration-500">
                  {/* Central Power Monolith */}
                  <circle cx="200" cy="70" r="32" fill="url(#centralGlow)" filter="url(#softGlow)" />
                  <text x="200" y="66" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700" fontFamily="sans-serif">
                    CENTRAL
                  </text>
                  <text x="200" y="78" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="600" fontFamily="sans-serif">
                    MONOLITH
                  </text>

                  {/* Radiating One-Way Lines */}
                  {[
                    { x: 70, y: 195, label: "Consumer 1" },
                    { x: 135, y: 215, label: "Consumer 2" },
                    { x: 200, y: 220, label: "Community" },
                    { x: 265, y: 215, label: "Consumer 4" },
                    { x: 330, y: 195, label: "Consumer 5" },
                  ].map((node, i) => (
                    <g key={i}>
                      <line
                        x1="200"
                        y1="102"
                        x2={node.x}
                        y2={node.y - 12}
                        stroke="#f59e0b"
                        strokeWidth="1.8"
                        strokeDasharray="4 4"
                        strokeOpacity="0.6"
                      />
                      {/* Arrowhead indicator */}
                      <circle cx={(200 + node.x) / 2} cy={(102 + node.y - 12) / 2} r="2.5" fill="#f59e0b" />
                      {/* Downstream node */}
                      <circle cx={node.x} cy={node.y} r="14" fill="#cbd5e1" className="dark:fill-slate-700" stroke="#94a3b8" strokeWidth="1.5" />
                      <circle cx={node.x} cy={node.y} r="4" fill="#64748b" />
                      <text x={node.x} y={node.y + 24} textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="sans-serif">
                        {node.label}
                      </text>
                    </g>
                  ))}

                  <text x="200" y="145" textAnchor="middle" fill="#d97706" fontSize="9.5" fontWeight="600" fontFamily="monospace">
                    ↓ 1-WAY EXTRACTION & EMISSION ↓
                  </text>
                </g>
              ) : (
                // DISTRIBUTED TOPOLOGY
                <g className="transition-all duration-500">
                  {/* Outer Interconnected Mesh Nodes */}
                  {[
                    { x: 80, y: 70, label: "Microgrid" },
                    { x: 200, y: 40, label: "VPP / Storage" },
                    { x: 320, y: 70, label: "Resilience Hub" },
                    { x: 320, y: 180, label: "Community Solar" },
                    { x: 200, y: 210, label: "Civic Node" },
                    { x: 80, y: 180, label: "EcoBlock" },
                  ].map((node, i, arr) => {
                    const next = arr[(i + 1) % arr.length]
                    const cross = arr[(i + 3) % arr.length]
                    return (
                      <g key={i}>
                        {/* Mesh Interconnect Lines */}
                        <line
                          x1={node.x}
                          y1={node.y}
                          x2={next.x}
                          y2={next.y}
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeOpacity="0.45"
                        />
                        {i < 3 && (
                          <line
                            x1={node.x}
                            y1={node.y}
                            x2={cross.x}
                            y2={cross.y}
                            stroke="#059669"
                            strokeWidth="1.2"
                            strokeDasharray="3 3"
                            strokeOpacity="0.3"
                          />
                        )}
                        {/* Bi-directional node */}
                        <circle cx={node.x} cy={node.y} r="18" fill="url(#distributedGlow)" filter="url(#softGlow)" />
                        <circle cx={node.x} cy={node.y} r="7" fill="#ffffff" fillOpacity="0.95" />
                        <text x={node.x} y={node.y + 28} textAnchor="middle" fill="#059669" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">
                          {node.label}
                        </text>
                      </g>
                    )
                  })}

                  {/* Dynamic Mesh Heart */}
                  <circle cx="200" cy="125" r="22" fill="#10b981" fillOpacity="0.12" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" />
                  <text x="200" y="122" textAnchor="middle" fill="#047857" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                    TRANSACTIVE
                  </text>
                  <text x="200" y="133" textAnchor="middle" fill="#047857" fontSize="8" fontWeight="600" fontFamily="monospace">
                    AGENCY
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Mode Highlights Panel */}
          <div className="md:col-span-6 space-y-3">
            <div
              className={`rounded-xl p-4 border transition-all ${
                mode === "centralized"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                  {mode === "centralized" ? "Legacy Paradigm" : "Living Systems Paradigm"}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    mode === "centralized"
                      ? "bg-amber-200/50 border-amber-400 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      : "bg-emerald-200/50 border-emerald-400 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  }`}
                >
                  {mode === "centralized" ? "Extract & Isolate" : "Reciprocity & Agency"}
                </span>
              </div>
              <h4 className="text-base font-bold font-serif mb-1">
                {mode === "centralized" ? active.centralized.headline : active.distributed.headline}
              </h4>
              <p className="text-xs leading-relaxed opacity-90">
                {mode === "centralized" ? active.centralized.description : active.distributed.description}
              </p>
              <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] font-mono">
                <span>System Property:</span>
                <span className={`font-semibold ${mode === "centralized" ? active.centralized.statusColor : active.distributed.statusColor}`}>
                  {mode === "centralized" ? active.centralized.status : active.distributed.status}
                </span>
              </div>
            </div>

            {/* Quick Switch Aspect Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {aspects.map((asp, idx) => {
                const Icon = asp.icon
                return (
                  <button
                    key={asp.title}
                    onClick={() => setSelectedAspect(idx)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${
                      selectedAspect === idx
                        ? "bg-white dark:bg-slate-800 border-emerald-500/60 shadow-sm"
                        : "bg-transparent border-slate-200/60 hover:bg-white/40 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${selectedAspect === idx ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                      {asp.title}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
