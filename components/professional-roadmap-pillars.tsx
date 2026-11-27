"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Battery,
  CheckCircle2,
  Cpu,
  Globe,
  Layers,
  Network,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react"

// ============================================================================
// INFOGRAPHIC 1: SELF-HEALING EDGE TOPOLOGY (SLIDE 2 & 3)
// ============================================================================
export const SelfHealingEdgeSimulator: React.FC = () => {
  const [isSevered, setIsSevered] = useState(false)

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/80">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3 dark:border-slate-800/70">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Edge Topology &bull; Dynamic Self-Healing
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setIsSevered(!isSevered)}
          className={`rounded-full px-3 py-1 font-mono text-xs font-semibold transition touch-manipulation flex items-center gap-1.5 ${
            isSevered
              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
          }`}
        >
          {isSevered ? (
            <>
              <AlertTriangle className="h-3 w-3" />
              Fault Active &bull; Restore Feeder
            </>
          ) : (
            <>
              <Zap className="h-3 w-3" />
              Simulate Central Feeder Sever
            </>
          )}
        </button>
      </div>

      {/* SVG Topology Network */}
      <div className="relative mb-3.5 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-950 p-4">
        <svg viewBox="0 0 400 200" className="w-full h-44">
          {/* Background grid */}
          <pattern id="grid-sim" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid-sim)" />

          {/* Central Grid Feeder Line */}
          <line
            x1="30"
            y1="100"
            x2="130"
            y2="100"
            stroke={isSevered ? "#ef4444" : "#10b981"}
            strokeWidth={isSevered ? "1.5" : "2.5"}
            strokeDasharray={isSevered ? "4 4" : "none"}
            className={isSevered ? "opacity-60" : "animate-pulse"}
          />

          {/* Ring Interconnect Lines */}
          <polygon
            points="180,45 280,45 330,100 280,155 180,155 130,100"
            fill="none"
            stroke={isSevered ? "#34d399" : "#64748b"}
            strokeWidth={isSevered ? "2.5" : "1.5"}
            className={isSevered ? "transition-all duration-500" : ""}
          />

          {/* Self-healing flow arrows when severed */}
          {isSevered && (
            <>
              <circle cx="205" cy="45" r="3" fill="#34d399">
                <animate attributeName="cx" from="155" to="255" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="205" cy="155" r="3" fill="#34d399">
                <animate attributeName="cx" from="155" to="255" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </>
          )}

          {/* Central Utility Node */}
          <g transform="translate(30, 100)">
            <circle
              r="14"
              fill={isSevered ? "#450a0a" : "#064e3b"}
              stroke={isSevered ? "#ef4444" : "#10b981"}
              strokeWidth="2"
            />
            <text y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="monospace">
              GRID
            </text>
            <text y="24" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
              {isSevered ? "SEVERED" : "FEEDER"}
            </text>
          </g>

          {/* Edge Microgrid Nodes */}
          {[
            { x: 130, y: 100, label: "Gateway", desc: "Edge Inverter" },
            { x: 180, y: 45, label: "Solar DER", desc: "50 kW PV" },
            { x: 280, y: 45, label: "Battery", desc: "100 kWh" },
            { x: 330, y: 100, label: "Critical", desc: "Hospital/Civic" },
            { x: 280, y: 155, label: "EV Fleet", desc: "Bidirectional" },
            { x: 180, y: 155, label: "EcoBlock", desc: "Microgrid" },
          ].map((n, i) => (
            <g key={i} transform={`translate(${n.x}, ${n.y})`}>
              <circle
                r="13"
                fill={isSevered && i === 3 ? "#065f46" : "#0f172a"}
                stroke={isSevered ? "#34d399" : "#38bdf8"}
                strokeWidth="2"
              />
              <text y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace">
                N{i + 1}
              </text>
              <text y="21" textAnchor="middle" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
        {isSevered ? (
          <p>
            <strong className="text-emerald-800 dark:text-emerald-300">Self-Healing Protocol Active:</strong> Central feeder severed. Local edge agents dynamically sever the fault point, coordinate with battery node N3 and solar node N2, and reroute power across the ring. Critical load N4 experiences <span className="font-semibold text-emerald-600 dark:text-emerald-400">0 ms interruption</span>.
          </p>
        ) : (
          <p>
            <strong className="text-slate-900 dark:text-white">Normal Grid-Connected Interconnect:</strong> Second-by-second distributed consensus maintains localized voltage and frequency while exchanging power with the macro-grid.
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// INFOGRAPHIC 2: VALUE STACKING SIMULATOR (SLIDE 7)
// ============================================================================
export const ValueStackingSimulator: React.FC = () => {
  const [layers, setLayers] = useState({
    decarb: true,
    gridServices: true,
    demandCharge: true,
    resilience: true,
  })

  const toggleLayer = (k: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [k]: !prev[k] }))
  }

  const activeCount = Object.values(layers).filter(Boolean).length
  const savingsPct = Math.round(activeCount * 12.5 + (layers.demandCharge ? 18 : 0))
  const co2Reduction = activeCount * 45

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/80">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3 dark:border-slate-800/70">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Value Stacking &bull; Doing More With Less
          </h4>
        </div>
        <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          {activeCount} of 4 Streams Active
        </span>
      </div>

      {/* 4 Stacking Toggles */}
      <div className="grid gap-2 mb-4">
        {[
          {
            key: "decarb" as const,
            title: "Decarbonization",
            desc: "Maximize local PV recapture & eliminate fossil peaker dispatch",
            tag: "Emissions",
            accent: "emerald",
          },
          {
            key: "gridServices" as const,
            title: "Grid Services & VPP",
            desc: "T&D deferral, fast frequency response & wholesale capacity export",
            tag: "Revenue",
            accent: "sky",
          },
          {
            key: "demandCharge" as const,
            title: "Demand Charge Management (DCM)",
            desc: "Stochastic peak shaving navigating complex BTM utility tariffs",
            tag: "OpEx Reduction",
            accent: "amber",
          },
          {
            key: "resilience" as const,
            title: "Community Resilience Hub",
            desc: "Autonomous off-grid islanding for disaster relief (e.g. Red Cross)",
            tag: "Zero-Downtime",
            accent: "indigo",
          },
        ].map((item) => {
          const on = layers[item.key]
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleLayer(item.key)}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition touch-manipulation ${
                on
                  ? "border-emerald-500/70 bg-emerald-50/60 dark:border-emerald-500/70 dark:bg-emerald-950/40"
                  : "border-slate-200 bg-slate-50/60 opacity-60 dark:border-slate-800 dark:bg-slate-900/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    on ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600 dark:bg-slate-700"
                  }`}
                >
                  {on ? "✓" : "−"}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.title}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{item.desc}</span>
                </div>
              </div>
              <span className="rounded-md bg-white/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                {item.tag}
              </span>
            </button>
          )
        })}
      </div>

      {/* Compounded Impact Metrics */}
      <div className="grid grid-cols-2 gap-2 text-center font-mono">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Avoided Cost / Bill Offset</span>
          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">+{savingsPct}%</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Carbon Abatement</span>
          <span className="text-lg font-bold text-sky-600 dark:text-sky-400">{co2Reduction} Tons/Yr</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// INFOGRAPHIC 3: POWER FLOW ISLANDING SIMULATOR (SLIDE 6)
// ============================================================================
export const PowerFlowIslandingSimulator: React.FC = () => {
  // Timeline scrub from 0:00 to 1:00 (0 to 60)
  const [time, setTime] = useState(25)

  // t < 20: Normal Grid Connected
  // t = 20: Islanding Trigger
  // t > 20: Islanded Mode
  const isTriggered = time >= 20

  const gridPower = time < 20 ? 100 : 0
  const solarPower = Math.min(45, Math.round(15 + time * 0.5))
  // Battery spikes at t=20 to catch transient, then levels to meet 50kW critical load
  const batteryPower =
    time < 20 ? 0 : time < 25 ? 80 - (time - 20) * 8 : Math.max(10, 50 - solarPower)
  const criticalLoad = 50 // perfectly continuous

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/80">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3 dark:border-slate-800/70">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Black Swan Stress-Testing &bull; Slide 6 Telemetry
          </h4>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${
            isTriggered
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {isTriggered ? "Islanded &bull; Microgrid Active" : "Grid-Tied Steady State"}
        </span>
      </div>

      {/* Time scrubber */}
      <div className="mb-4">
        <div className="mb-1 flex justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <span>0:00 (Pre-Fault)</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">0:20 (Trigger)</span>
          <span>1:00 (Islanded Equilibrium)</span>
        </div>
        <input
          type="range"
          min={0}
          max={60}
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
          aria-label="Islanding Response Timeline"
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600 dark:bg-slate-800 dark:accent-emerald-400"
        />
      </div>

      {/* Telemetry Readout Bars */}
      <div className="space-y-2 mb-4 font-mono text-xs">
        <div>
          <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-0.5">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400" /> Grid Power
            </span>
            <span className="font-bold">{gridPower} kW</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-slate-400 transition-all duration-200" style={{ width: `${gridPower}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-0.5">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Battery Discharge (Fast Response)
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{batteryPower} kW</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-200"
              style={{ width: `${Math.min(100, batteryPower)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-700 dark:text-slate-300 mb-0.5">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Local Solar Generation
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{solarPower} kW</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-200" style={{ width: `${solarPower * 1.5}%` }} />
          </div>
        </div>

        <div className="pt-1 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex justify-between text-emerald-800 dark:text-emerald-300 font-bold mb-0.5">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Critical Load Preserved
            </span>
            <span>{criticalLoad} kW (100% Uptime)</span>
          </div>
          <div className="h-2 w-full bg-emerald-100 dark:bg-emerald-950/60 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: "100%" }} />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        Reproduced from roadmap Slide 6: Digital Twin stress-testing ensures that when the transfer switch drops the utility at t=0:20, behind-the-meter battery inverters step in sub-cycle, guaranteeing zero loss to critical municipal loads.
      </p>
    </div>
  )
}

// ============================================================================
// INFOGRAPHIC 4: THE INFRASTRUCTURE NEXUS (SLIDE 7 & 8)
// ============================================================================
export const InfrastructureNexusSandbox: React.FC = () => {
  const [activeSite, setActiveSite] = useState<"ports" | "wwtp" | "parks">("ports")

  const SITES = {
    ports: {
      title: "Global Ports & Multi-Modal Hubs",
      flow: "Vessel Cold-Ironing &bull; Heavy Drayage Fleet &bull; Stationary BESS",
      detail:
        "Electrifying multi-modal drayage trucks while buffering massive megawatt cold-ironing shore power spikes. Localized energy markets balance shore supply in real-time, eliminating diesel emissions without overloading utility substations.",
      kpi: "Zero Externalized Maritime Emissions",
    },
    wwtp: {
      title: "Wastewater Treatment Plants (WWTPs)",
      flow: "Water-Energy Nexus &bull; Digester Biogas &bull; Aeration Demand Response",
      detail:
        "Critical municipal nodes managing continuous hydraulic throughput. Utilizing anaerobic digester biogas cogen with variable-frequency aeration blowers to provide massive flexible demand response to regional grids.",
      kpi: "Net-Positive Municipal Resource Loop",
    },
    parks: {
      title: "Industrial Campuses & EcoBlocks",
      flow: "Multi-Tenant PV &bull; Thermal Ice Storage &bull; Shared Transactive Bus",
      detail:
        "Dense heterogeneous campuses aggregating commercial cold storage, rooftop solar arrays, and district heating into a resilient microgrid that trades energy peer-to-peer across property boundaries.",
      kpi: "30-40% Demand Charge Reduction",
    },
  }

  const current = SITES[activeSite]

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/80">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3 dark:border-slate-800/70">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            The Proving Grounds &bull; Slide 7 & 8 Nexus
          </h4>
        </div>
      </div>

      {/* Site Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-3.5">
        {[
          { id: "ports" as const, label: "Global Ports" },
          { id: "wwtp" as const, label: "WWTP Plants" },
          { id: "parks" as const, label: "Industrial Parks" },
        ].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSite(s.id)}
            className={`rounded-xl border p-2 text-center text-xs font-medium transition touch-manipulation ${
              activeSite === s.id
                ? "border-emerald-600 bg-emerald-600 text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950 font-bold"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex justify-between items-center mb-1.5">
          <h5 className="font-serif font-bold text-sm text-slate-900 dark:text-white">{current.title}</h5>
          <span className="font-mono text-[10px] rounded-md bg-emerald-100 px-2 py-0.5 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
            {current.kpi}
          </span>
        </div>
        <div className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 mb-2">{current.flow}</div>
        <p className="font-serif text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {current.detail}
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// INFOGRAPHIC 5: PARETO EFFICIENCY FRONTIER (SLIDE 5)
// ============================================================================
export const ParetoOptimalExplorer: React.FC = () => {
  const [forecastAccuracy, setForecastAccuracy] = useState(70)

  // As accuracy increases, gap to prescient optimal shrinks
  const efficiencyGap = Math.max(3, 100 - forecastAccuracy)
  const costReduction = Math.round(15 + forecastAccuracy * 0.35)

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/80">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3 dark:border-slate-800/70">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Approaching Prescient Optimal &bull; Slide 5 KPI
          </h4>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-3.5">
        <div className="mb-1.5 flex justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <span>Coarse Heuristic Forecast</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">Adaptive ML Digital Twin</span>
        </div>
        <input
          type="range"
          min={30}
          max={98}
          value={forecastAccuracy}
          onChange={(e) => setForecastAccuracy(Number(e.target.value))}
          aria-label="Algorithm Forecasting Accuracy"
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600 dark:bg-slate-800 dark:accent-emerald-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-center font-mono">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Gap to Prescient Bound</span>
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{efficiencyGap}%</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">OpEx Cost Optimization</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{costReduction}%</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-serif">
        Success is measured by how closely control algorithms approach the theoretical maximum efficiency of a system if it possessed perfect future knowledge. Adaptive dynamic twins eliminate constraint violations along the Pareto frontier.
      </p>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT: PROFESSIONAL ROADMAP PILLARS
// ============================================================================
export function ProfessionalRoadmapPillars() {
  const [expandedPillar, setExpandedPillar] = useState<number>(0)

  const PILLARS = [
    {
      num: "01",
      title: "Autonomous Edge Optimization & Self-Healing Topologies",
      subtitle: "Re-architecting Grid Control from Center to Edge",
      axiom: "Self-Healing > Central Vulnerability",
      tags: ["Adaptability", "Resiliency", "Scalability", "Hardware Agnosticism"],
      essay: [
        "The legacy grid relies on centralized dispatch, creating single points of failure where a severed transmission line or failing substation can plunge entire regions into darkness. In an era of intense climate volatility and millions of distributed energy resources (DERs), centralized AC optimal power flow models cannot scale.",
        "We push intelligence directly to the edge. By deploying modular, hardware-agnostic controllers running distributed consensus algorithms, disparate assets—rooftop PV, behind-the-meter storage, and bidirectional EVs—transform into autonomous transacting building blocks that balance local voltage, isolate faults, and self-heal within cycles.",
      ],
      component: <SelfHealingEdgeSimulator />,
    },
    {
      num: "02",
      title: "Transactive Markets, Dynamic Value Stacking & Virtual Power Plants",
      subtitle: "BTM Tariffs as the Trojan Horse for Decentralized Energy",
      axiom: "Coordinated Agency > Passive Load",
      tags: ["Economics", "Reliability", "Scalability", "Dynamic Demand Response"],
      essay: [
        "Mastering complex, legacy behind-the-meter (BTM) demand tariffs is the Trojan horse required to construct tomorrow's fully democratized energy market. Customers urgently need forecasting and battery degradation optimization today to manage exorbitant utility bills.",
        "By deploying distributed intelligence platforms to solve immediate tariff friction, we quietly embed the operating system required for tomorrow's transactive Virtual Power Plants (VPPs)—allowing facilities to stack multiple value streams simultaneously: decarbonization, peak demand charge management, wholesale grid services, and community resilience.",
      ],
      component: <ValueStackingSimulator />,
    },
    {
      num: "03",
      title: "Uncompromising Resilience through Stochastic Digital Twins",
      subtitle: "Black Swan Stress-Testing & Sub-Cycle Islanding",
      axiom: "Prescient Optimal > Reactive Response",
      tags: ["Resiliency", "Reliability", "Sustainability", "Zero-Downtime"],
      essay: [
        "Resilience cannot be an afterthought retrofitted onto aging infrastructure. Success is measured by how closely our control algorithms match the theoretical maximum efficiency of a system if it possessed perfect future knowledge—the Prescient Optimal.",
        "Before steel touches soil or inverters are commissioned, our agent-based digital twins subject microgrid architectures to millions of stochastic weather scenarios, climate disasters, and severe duck-curve volatility. When an acute grid outage strikes, automatic transfer switches and fast-inverter dispatch trigger seamless islanding, sustaining critical municipal loads indefinitely.",
      ],
      component: <PowerFlowIslandingSimulator />,
    },
    {
      num: "04",
      title: "The Proving Grounds: Infrastructure & Mycelium Nexus",
      subtitle: "Global Ports, WWTPs & Industrial Circularity",
      axiom: "Systemic Nexus > Siloed Assets",
      tags: ["Sustainability", "Enablement", "Scalability", "Circular Economy"],
      essay: [
        "To prove global circularity and zero-externalized environmental costs, transactive networks must be deployed across the most demanding microcosms of human civilization: global ports with massive cold-ironing shore power spikes, municipal wastewater treatment plants balancing energy and water flow, and industrial campuses.",
        "Inspired by nature's decentralized mycelium networks, this approach treats infrastructure not as isolated silos, but as an interdependent nexus of energy, water, waste, and community agency—transforming energy consumers into active stewards of local abundance.",
      ],
      component: <InfrastructureNexusSandbox />,
    },
    {
      num: "05",
      title: "Democratized Agency, Energy-as-a-Service & Global Equity",
      subtitle: "Leapfrogging Fragile Hub-and-Spoke Grids",
      axiom: "Empowerment > Central Monopoly",
      tags: ["Empowerment", "Enablement", "Economics", "Energy Equity"],
      essay: [
        "Access to clean, reliable energy is a fundamental matter of equity. Renewable generation must never discriminate based on class or geography. Yet municipal authorities and communities face strictly constrained capital budgets.",
        "Through Energy-as-a-Service (EaaS) performance contracting, financing and operational risks are absorbed, funding deployments purely through verified operational savings. By exporting this validated infrastructure playbook internationally, developing nations can bypass fragile, centralized hub-and-spoke grids entirely—leapfrogging directly to resilient, democratized microgrid networks.",
      ],
      component: <ParetoOptimalExplorer />,
    },
  ]

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-3">
          <Sparkles className="h-3 w-3" />
          Living Architecture &bull; Roadmap Pillars
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-slate-900 dark:text-white">
          The Transactive Energy Roadmap
        </h2>
        <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
          Strategic and tactical implementation pillars for a sustainable, equitable future—re-architecting centralized grid monopolies into intelligent, decentralized networks of edge agency.
        </p>
      </div>

      {/* Pillars Stack */}
      <div className="space-y-6">
        {PILLARS.map((pillar, idx) => {
          const isExpanded = expandedPillar === idx

          return (
            <motion.div
              key={pillar.num}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white/95 via-slate-50/70 to-white/95 shadow-sm transition-all duration-300 dark:border-slate-800/90 dark:from-slate-950/95 dark:via-slate-900/60 dark:to-slate-950/95"
            >
              {/* Header Button */}
              <button
                type="button"
                onClick={() => setExpandedPillar(isExpanded ? -1 : idx)}
                className="flex w-full items-start justify-between p-6 sm:p-8 text-left touch-manipulation hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition"
              >
                <div className="space-y-2 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Pillar {pillar.num}
                    </span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-800/40">
                      {pillar.axiom}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                    {pillar.title}
                  </h3>
                  <p className="font-mono text-xs text-emerald-700/80 dark:text-emerald-300/80 font-medium">
                    {pillar.subtitle}
                  </p>
                </div>

                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  <span className="text-base font-mono">{isExpanded ? "−" : "+"}</span>
                </div>
              </button>

              {/* Collapsible Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                  >
                    <div className="border-t border-slate-200/80 px-6 pb-8 pt-6 sm:px-8 dark:border-slate-800/80">
                      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
                        {/* Essay Column */}
                        <div className="space-y-4 lg:col-span-6 font-serif text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                          {pillar.essay.map((paragraph, pIdx) => (
                            <p key={pIdx}>{paragraph}</p>
                          ))}

                          <div className="pt-2 flex flex-wrap gap-1.5 font-sans">
                            {pillar.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md border border-slate-200 bg-slate-100/70 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Component Column */}
                        <div className="lg:col-span-6">{pillar.component}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
