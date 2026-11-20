"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Compass, Cpu, Layers, ShieldCheck, ArrowRight, CheckCircle2, History } from "lucide-react"

interface EvolutionCard {
  id: string
  title: string
  icon: typeof Compass
  badge: string
  seedQuote2004: string
  seedContext: string
  maturedProof2024: string
  proofDetails: string[]
  takeaway: string
}

const EVOLUTIONS: EvolutionCard[] = [
  {
    id: "agency",
    title: "Grassroots Responsibility → Distributed Grid Architecture",
    icon: Compass,
    badge: "Agency as Architecture",
    seedQuote2004: "The empire collapses when the base no longer believes in supporting it. The solution requires a grassroots effort... moving ourselves from apathy to active responsibility.",
    seedContext: "Early philosophical realization that centralized, top-down enforcement inherently breeds fragility and disempowerment.",
    maturedProof2024: "Distributed Energy Resources (DERs), microgrids, and Virtual Power Plants (VPPs) are grassroots responsibility made physical in copper, silicon, and optimization code.",
    proofDetails: [
      "Stanford Ph.D. research in distributed optimization and transactive control algorithms.",
      "Engineering residential and commercial microgrids that island during utility feeder failure.",
      "Empowering communities to generate, store, and trade their own kilowatt-hours locally.",
    ],
    takeaway: "The essay was never just about energy; it was about agency. The grid became the proof of concept.",
  },
  {
    id: "participants",
    title: "Passive Consumers → Active Resource Co-Stewards",
    icon: Layers,
    badge: "Participant Paradigm",
    seedQuote2004: "For generations we have readily exercised our freedoms but have rarely taken responsibility... lulled into a stupor where we no longer know what our interests are.",
    seedContext: "Critique of consumer passivity, where citizens become mere spectators dependent on centralized monopolies.",
    maturedProof2024: "Transforming every rooftop, battery storage unit, and electric vehicle into a bidirectional participant that stabilizes the larger commons.",
    proofDetails: [
      "Vehicle-to-Grid (V2G) transactive dispatch and smart EV charging integration.",
      "Oakland EcoBlock: Multi-tenant block sharing a single neighborhood DC microgrid.",
      "Democratizing control away from distant utility boardrooms to local building automation.",
    ],
    takeaway: "The future requires participants rather than consumers. Distributing agency is the ultimate goal.",
  },
  {
    id: "adaptation",
    title: "Decarbonization Alone → Climate Adaptation & Geopolitics",
    icon: ShieldCheck,
    badge: "Strategic Resilience",
    seedQuote2004: "Lead us away from the fossil fuels that spawn violence, inequality, and destruction... towards a more sustainable planet.",
    seedContext: "Early environmental focus centered almost exclusively on clean generation to halt carbon emissions.",
    maturedProof2024: "A dual mandate: Deep decarbonization (mitigation) coupled with immediate community hardening (adaptation), supply chain sovereignty, and critical mineral strategy.",
    proofDetails: [
      "Red Cross Community Resilience Hubs providing continuous medical and cooling lifelines.",
      "Accounting for critical mineral supply chains, transformer shortages, and geopolitical bottlenecks.",
      "Designing systems capable of enduring wildfires, heat domes, and atmospheric river storms.",
    ],
    takeaway: "Sustainability without adaptation is an illusion. The energy transition is both environmental and strategic.",
  },
  {
    id: "ai",
    title: "Information Commons → AI as a Resource Allocation Engine",
    icon: Cpu,
    badge: "Algorithmic Stewardship",
    seedQuote2004: "A revolution taking place... due in no small part to technologies that empower us to connect with one another and share information.",
    seedContext: "Early optimism regarding the democratization of information and distributed networks.",
    maturedProof2024: "Artificial intelligence has become the primary resource allocation engine. The questions of agency, concentration, and ethics now apply directly to algorithmic models.",
    proofDetails: [
      "Autonomous real-time bidding algorithms across CAISO, PJM, and ERCOT wholesale markets.",
      "Preventing algorithmic rent-extraction by enforcing transparent, community-aligned objective functions.",
      "Using neural networks and probabilistic forecasting to balance erratic renewable generation.",
    ],
    takeaway: "The same principles of agency, transparency, and stewardship that govern physical energy must govern computational intelligence.",
  },
]

export function EvolutionArcMatrix() {
  const [activeTab, setActiveTab] = useState<string>("agency")
  const current = EVOLUTIONS.find((e) => e.id === activeTab) || EVOLUTIONS[0]
  const Icon = current.icon

  return (
    <div className="my-14 rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/80 to-slate-50/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl dark:border-slate-800/80 dark:from-slate-900/80 dark:to-slate-950/60 dark:shadow-slate-950/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
              The Two-Decade Trajectory
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white mt-1">
            The Philosophy Never Changed — The Career Became the Proof of Concept
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Tracing how early philosophical inquiries into human responsibility and systems fragility matured into Stanford research, venture startups, and distributed grid engineering.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="my-6 grid grid-cols-2 md:grid-cols-4 gap-2">
        {EVOLUTIONS.map((item) => {
          const isSelected = item.id === activeTab
          const ItemIcon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 border-emerald-600 shadow-md scale-[1.02]"
                  : "bg-white/60 hover:bg-slate-100/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <ItemIcon className="h-4 w-4 shrink-0" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                  {item.badge}
                </span>
              </div>
              <span className="text-xs font-serif font-semibold line-clamp-1">
                {item.title.split("→")[0]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Comparison Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl border border-slate-200/70 bg-white/70 p-5 sm:p-6 dark:border-slate-800/70 dark:bg-slate-900/60">
        {/* Left: 2004 Seed Inquiry */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400">
                The 2004 Philosophical Seed
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200/50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700">
                Foundational Tenet
              </span>
            </div>
            <blockquote className="font-serif italic text-sm text-slate-800 dark:text-slate-200 leading-relaxed my-2 border-l-2 border-amber-500/60 pl-3">
              &ldquo;{current.seedQuote2004}&rdquo;
            </blockquote>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {current.seedContext}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-500/20">
            <span className="font-mono text-[10px] uppercase text-amber-700 dark:text-amber-400 font-bold">
              Core Instinct:
            </span>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Grassroots agency and distributed moral responsibility must supersede top-down coercion.
            </p>
          </div>
        </div>

        {/* Right: 2024 Deployed Reality */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                The 2024 Engineering Architecture
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-200/50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700">
                Proof in Steel & Silicon
              </span>
            </div>
            <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white leading-snug mb-2">
              {current.maturedProof2024}
            </h4>
            <ul className="space-y-1.5 my-2">
              {current.proofDetails.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-500/20">
            <span className="font-mono text-[10px] uppercase text-emerald-700 dark:text-emerald-400 font-bold">
              Architectural Takeaway:
            </span>
            <p className="text-xs font-medium text-emerald-900 dark:text-emerald-300">
              {current.takeaway}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
