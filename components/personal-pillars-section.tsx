"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  Binary,
  Compass,
  Cpu,
  Layers,
  Leaf,
  Network,
  Radio,
  Sliders,
  Sparkles,
  Waves,
  Zap,
} from "lucide-react"

// ============================================================================
// INFOGRAPHIC 1: SOMATIC TELEMETRY & ENTRAINMENT TUNER
// ============================================================================
export const SomaticEntrainmentTuner: React.FC = () => {
  // 0 = High Cognitive Override (Desynchronized), 100 = Paced Resonance (0.1 Hz Coherence)
  const [coherence, setCoherence] = useState<number>(45)
  const [activeLayer, setActiveLayer] = useState<"all" | "enteric" | "interoception" | "entrainment">("all")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let animationFrameId: number
    let phase = 0

    const render = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
      }
      ctx.save()
      ctx.scale(dpr, dpr)
      const width = rect.width
      const height = rect.height
      const midY = height / 2

      ctx.clearRect(0, 0, width, height)

      // Detect dark theme
      const isDark = document.documentElement.classList.contains("dark")

      // Subtle architectural grid lines
      ctx.strokeStyle = isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(28, 27, 25, 0.06)"
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += 36) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.moveTo(0, midY)
      ctx.lineTo(width, midY)
      ctx.stroke()

      const syncFactor = coherence / 100
      const targetFreq = 0.02
      const targetAmp = height * 0.28

      const drawWave = (
        freq: number,
        amp: number,
        phaseOffset: number,
        noiseAmt: number,
        color: string,
        glowColor: string,
        lineWidth: number,
        isDimmed: boolean,
      ) => {
        ctx.save()
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
        ctx.globalAlpha = isDimmed ? 0.15 : 0.95

        if (!isDimmed && isDark) {
          ctx.shadowColor = glowColor
          ctx.shadowBlur = 8
        }

        ctx.beginPath()
        for (let x = 0; x <= width; x += 2) {
          const currentFreq = freq * (1 - syncFactor) + targetFreq * syncFactor
          const currentPhase = phase * (1 - syncFactor * 0.25) + phaseOffset * (1 - syncFactor)
          const jitter = (1 - syncFactor) * noiseAmt * Math.sin(x * 0.09 + phase * 2.2) * Math.cos(x * 0.04 - phase * 1.5)
          const y = midY + Math.sin(x * currentFreq + currentPhase) * amp + jitter
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.restore()
      }

      // 1. Enteric wave (Emerald/Moss)
      drawWave(
        0.012,
        targetAmp * 0.82,
        0,
        3.5,
        isDark ? "#34d399" : "#059669",
        "#10b981",
        2.2,
        activeLayer !== "all" && activeLayer !== "enteric",
      )

      // 2. Interoceptive / Cardiac wave (Terracotta / Coral)
      drawWave(
        0.042,
        targetAmp * 0.62,
        1.7,
        9.0,
        isDark ? "#fb923c" : "#ea580c",
        "#f97316",
        2.0,
        activeLayer !== "all" && activeLayer !== "interoception",
      )

      // 3. Neural / Cortical oscillation (Sky / Cyan)
      drawWave(
        0.082,
        targetAmp * 0.48,
        3.4,
        14.0,
        isDark ? "#38bdf8" : "#0284c7",
        "#0ea5e9",
        1.75,
        activeLayer !== "all" && activeLayer !== "entrainment",
      )

      ctx.restore()
      phase += 0.03
      animationFrameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationFrameId)
  }, [coherence, activeLayer])

  const layerNotes = {
    all: {
      label: "System Telemetry Overview",
      detail:
        coherence > 75
          ? "Phase-Locked Resonance (~0.1 Hz): Enteric slow waves, heart rate variability (HRV), and cortical rhythms align into a coherent carrier wave—optimizing somatic energy flow."
          : "Asynchronous Load: Cognitive prefrontal override introduces high-frequency noise, dampening subtle autonomic and visceral telemetry.",
    },
    enteric: {
      label: "Enteric Base (The Somatic Microgrid)",
      detail:
        "Over 100 million neurons in the gut wall generate autonomous slow-wave motility and neurotransmitter synthesis without waiting for executive commands from the brain.",
    },
    interoception: {
      label: "Interoception (Vagal Telemetry)",
      detail:
        "Afferent vagal and spinal pathways stream continuous visceral pressure, cardiac pacing, and metabolic state upward to the insular cortex before conscious thought.",
    },
    entrainment: {
      label: "Entrainment (Harmonic Synchronization)",
      detail:
        "Paced diaphragmatic breath (~0.1 Hz / 6 breaths/min) and circadian light entrain biological oscillators into resonance, expanding resilience to friction.",
    },
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/80">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3 dark:border-slate-800/70">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Somatic Telemetry &bull; Oscillator Tuner
          </h4>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-700 dark:bg-slate-800 dark:text-emerald-300">
          Coherence: {coherence}%
        </span>
      </div>

      {/* Layer Selector Pills */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {[
          { id: "all", label: "All Telemetry", dot: "bg-slate-400 dark:bg-slate-500" },
          { id: "enteric", label: "Enteric Base", dot: "bg-emerald-500" },
          { id: "interoception", label: "Interoception", dot: "bg-orange-500" },
          { id: "entrainment", label: "Entrainment", dot: "bg-sky-500" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveLayer(tab.id as typeof activeLayer)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition touch-manipulation ${
              activeLayer === tab.id
                ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${tab.dot}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Live Waveform Canvas */}
      <div className="relative mb-4 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-950/90 dark:border-slate-800 dark:bg-slate-950">
        <canvas ref={canvasRef} className="block h-36 w-full" />
      </div>

      {/* Resonance Slider */}
      <div className="mb-3.5">
        <div className="mb-1.5 flex justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <span>&larr; Cognitive Override (Stress Noise)</span>
          <span>Paced Resonance (0.1 Hz Coherence) &rarr;</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={coherence}
          onChange={(e) => setCoherence(Number(e.target.value))}
          aria-label="Somatic Coherence Slider"
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600 dark:bg-slate-800 dark:accent-emerald-400"
        />
      </div>

      {/* Contextual Annotation */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
        <span className="font-semibold text-emerald-800 dark:text-emerald-300">
          {layerNotes[activeLayer].label}:
        </span>{" "}
        {layerNotes[activeLayer].detail}
      </div>
    </div>
  )
}

// ============================================================================
// INFOGRAPHIC 2: BIOMIMETIC FIELD NOTES (NATURE <-> ARCHITECTURE)
// ============================================================================
interface Specimen {
  id: string
  name: string
  locationNote: string
  naturalPrinciple: string
  ecologicalRule: string
  architecturalMirror: string
  systemProof: string
}

const SPECIMENS: Specimen[] = [
  {
    id: "mycelium",
    name: "Mycelial Hyphae",
    locationNote: "Forest Floor & Subsurface Soil",
    naturalPrinciple: "Decentralized Nutrient Routing",
    ecologicalRule:
      "Fungal threads redistribute carbon, phosphorus, and moisture across root networks without a central dispatcher—treating redundancy as vitality.",
    architecturalMirror: "Peer-to-Peer Microgrids & VPPs",
    systemProof:
      "Distributed DER edge nodes share local PV surplus, islanding gracefully to protect community nodes when utility feeders sever.",
  },
  {
    id: "sandstone",
    name: "Coastal Sandstone Strata",
    locationNote: "Pacific Headlands & Scramble Bluffs",
    naturalPrinciple: "Yielding Geometry Under Stress",
    ecologicalRule:
      "Sedimentary rock absorbs ocean wind and tidal shear through micro-fracturing and honeycomb friction rather than brittle resistance.",
    architecturalMirror: "Graceful Degradation & Fault Localization",
    systemProof:
      "Control algorithms allow sub-second voltage sag without tripping wholesale protective breakers, containing disturbances locally.",
  },
  {
    id: "watershed",
    name: "Dendritic Watersheds",
    locationNote: "Mountain Basins & River Tributaries",
    naturalPrinciple: "Scale-Invariant Flow Distribution",
    ecologicalRule:
      "Branching channels equalize hydraulic pressure across scales—from capillary rills to wide river basins—using minimal path resistance.",
    architecturalMirror: "Multi-Scale Resource Topology",
    systemProof:
      "Unifying localized home storage, commercial chillers, and sub-transmission interfaces into self-balancing hydraulic-like networks.",
  },
  {
    id: "intertidal",
    name: "Intertidal Zone",
    locationNote: "Pacific Rocky Shorelines",
    naturalPrinciple: "Thriving in Boundary Volatility",
    ecologicalRule:
      "Organisms between low and high tide develop dual-state resilience: surviving deep immersion and desiccating exposure twice daily.",
    architecturalMirror: "Grid-Connected / Islanded Duality",
    systemProof:
      "Grid-forming inverters that transition between wholesale market arbitrage and autonomous off-grid black-start operation without hesitation.",
  },
]

export const BiomimeticFieldNotes: React.FC = () => {
  const [selectedId, setSelectedId] = useState("mycelium")
  const active = SPECIMENS.find((s) => s.id === selectedId) || SPECIMENS[0]

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/80">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3 dark:border-slate-800/70">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Field Sketchbook &bull; Structural Homology
          </h4>
        </div>
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{active.locationNote}</span>
      </div>

      {/* Specimen Tabs */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SPECIMENS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            className={`rounded-xl border p-2 text-left text-xs font-medium transition touch-manipulation ${
              selectedId === item.id
                ? "border-sky-500 bg-sky-50 text-sky-900 shadow-xs dark:border-sky-400 dark:bg-sky-950/70 dark:text-sky-200"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Split Comparison Cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 dark:border-amber-500/20 dark:bg-amber-950/20">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold">
            Nature &bull; {active.naturalPrinciple}
          </span>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
            {active.ecologicalRule}
          </p>
        </div>

        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 dark:border-sky-500/20 dark:bg-sky-950/20">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold">
            Architecture &bull; {active.architecturalMirror}
          </span>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
            {active.systemProof}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// INFOGRAPHIC 3: THE THRESHOLD SANDBOX (TRANSITION / TRANSLATION / TRANSCENDENCE)
// ============================================================================
export const ThresholdSandbox: React.FC = () => {
  const [mode, setMode] = useState<"transition" | "translation" | "transcendence">("transcendence")
  const [translationView, setTranslationView] = useState<"raw" | "architecture" | "poetic">("poetic")
  const [escapeVelocity, setEscapeVelocity] = useState(85)
  const [pulseActive, setPulseActive] = useState(false)

  const triggerPulse = () => {
    setPulseActive(true)
    setTimeout(() => setPulseActive(false), 900)
  }

  // Velocity calculation: 0 to 11.2 km/s
  const currentSpeed = (escapeVelocity * 0.112).toFixed(1)
  const isEscapeAchieved = escapeVelocity >= 75

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/80">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3 dark:border-slate-800/70">
        <div className="flex items-center gap-2">
          <Binary className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            The Threshold Sandbox &bull; Currency of Electrons
          </h4>
        </div>
        <div className="flex gap-1">
          {(["transition", "translation", "transcendence"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition touch-manipulation ${
                mode === m
                  ? "bg-indigo-600 text-white dark:bg-indigo-500 dark:text-slate-950 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* MODE 1: TRANSITION */}
      {mode === "transition" && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
              Analog physical phenomenon crosses the sensor threshold into discrete state:
            </p>
            <button
              type="button"
              onClick={triggerPulse}
              className="rounded-full border border-indigo-300 bg-indigo-50 px-2.5 py-1 text-[11px] font-mono font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
            >
              ⚡ Pulse Signal
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60 flex flex-col justify-between">
              <div>
                <span className="block font-bold text-slate-900 dark:text-white">Physical World</span>
                <span className="mt-1 block text-[11px] text-slate-500">Photons &bull; Kinetic &bull; Heat</span>
              </div>
              <span
                className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-mono transition-colors ${
                  pulseActive
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                Continuous Wave
              </span>
            </div>

            <div
              className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all duration-300 ${
                pulseActive
                  ? "border-indigo-400 bg-indigo-500/25 scale-[1.03] shadow-md shadow-indigo-500/20"
                  : "border-indigo-500/40 bg-indigo-500/10"
              }`}
            >
              <span className="font-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                &harr; e&minus; Membrane &harr;
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Transduction & Sampling</span>
              <span className="font-mono text-[9px] text-indigo-600 dark:text-indigo-400 mt-1">
                {pulseActive ? "Sampling: 1000 Hz" : "Ready"}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60 flex flex-col justify-between">
              <div>
                <span className="block font-bold text-slate-900 dark:text-white">Digital World</span>
                <span className="mt-1 block text-[11px] text-slate-500">Telemetry &bull; State &bull; Grid</span>
              </div>
              <span
                className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-mono transition-colors ${
                  pulseActive
                    ? "bg-sky-400 text-slate-950 font-bold"
                    : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                }`}
              >
                {pulseActive ? "0xA4 // SAMPLED" : "Discrete Quanta"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: TRANSLATION */}
      {mode === "translation" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Three perceptual decoders for the exact same underlying electron telemetry:
            </p>
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-800 font-mono text-[10.5px]">
              {[
                { id: "raw" as const, label: "Machine JSON" },
                { id: "architecture" as const, label: "Systems OPF" },
                { id: "poetic" as const, label: "Human Narrative" },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setTranslationView(v.id)}
                  className={`px-2 py-0.5 rounded-md transition ${
                    translationView === v.id
                      ? "bg-white text-slate-900 dark:bg-slate-950 dark:text-white font-bold shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {translationView === "raw" && (
            <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-[11px] text-emerald-400">
{`{
  "node_id": "oakland_ecoblock_04",
  "solar_gen_kw": 4.82,
  "battery_soc_pct": 88.4,
  "grid_frequency_hz": 60.002,
  "dlmp_clearing_usd_kwh": 0.042,
  "transactive_mode": "ISLAND_READY // RECIPROCAL_EXPORT"
}`}
            </pre>
          )}

          {translationView === "architecture" && (
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3.5 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
              <div className="flex justify-between border-b border-sky-500/10 pb-1">
                <span className="text-sky-700 dark:text-sky-400 font-bold">Consensus State:</span>
                <span>Converged (ADMM Iteration #14)</span>
              </div>
              <div className="flex justify-between border-b border-sky-500/10 pb-1">
                <span className="text-sky-700 dark:text-sky-400 font-bold">Nodal Margin (DLMP):</span>
                <span>$0.042 / kWh &bull; Exporting 2.1 kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sky-700 dark:text-sky-400 font-bold">Voltage Constraint:</span>
                <span>1.018 p.u. (Within &plusmn;5% ANSI Limits)</span>
              </div>
            </div>
          )}

          {translationView === "poetic" && (
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
              <span className="font-sans font-bold text-indigo-700 dark:text-indigo-400 block mb-1">
                Human & Ecological Sense: Quiet Abundance
              </span>
              Afternoon sunlight has quietly filled the community battery to 88%. The block is self-sufficient, steady at 60.0 Hz, and buffering clean power to neighboring families without burning gas at a peaker plant or placing stress on the regional grid.
            </div>
          )}
        </div>
      )}

      {/* MODE 3: TRANSCENDENCE */}
      {mode === "transcendence" && (
        <div className="space-y-4">
          {/* Orbital Flightpath Graphic */}
          <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 p-3.5 text-white">
            <div className="flex items-center justify-between mb-2 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-bold tracking-wider uppercase text-indigo-200">
                  Escape Velocity Trajectory
                </span>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  isEscapeAchieved
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30"
                }`}
              >
                v = {currentSpeed} km/s {isEscapeAchieved ? "• Escaped Gravity" : "• Sub-Orbital"}
              </span>
            </div>

            {/* Flightpath Progress Bar */}
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-indigo-900/60 relative">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-400 transition-all duration-200"
                style={{ width: `${escapeVelocity}%` }}
              />
              {/* Escape Velocity Threshold Mark */}
              <div className="absolute top-0 bottom-0 left-3/4 w-0.5 bg-white/80 z-10" />
            </div>

            <div className="mt-1 flex justify-between font-mono text-[9.5px] text-slate-400">
              <span>0 km/s (Grounded Friction)</span>
              <span className="text-indigo-300 font-semibold">11.2 km/s (Escape Threshold)</span>
              <span>Constellation</span>
            </div>
          </div>

          {/* Escape Velocity Slider */}
          <div>
            <div className="mb-1 flex justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
              <span>&larr; Tactile Craft (Grounded Anchor)</span>
              <span>Systems Optimization</span>
              <span>Transcendence (Better Planet) &rarr;</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={escapeVelocity}
              onChange={(e) => setEscapeVelocity(Number(e.target.value))}
              aria-label="Escape Velocity Slider"
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-800 dark:accent-indigo-400"
            />
          </div>

          {/* Dynamic Content Panel */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            {escapeVelocity < 35 && (
              <>
                <strong className="text-slate-900 dark:text-white block font-sans mb-1 text-sm">
                  Stage I &bull; Gravitational Anchor (Tactile Craft)
                </strong>
                Friction of the physical: the raw drag of pencil lead digging into cellulose paper grain, hand-shaping carbon fiber turbine blades, torquing solar rails in the afternoon sun. Grounded, unmediated, and rooted in the physical reality of materials.
              </>
            )}
            {escapeVelocity >= 35 && escapeVelocity < 75 && (
              <>
                <strong className="text-indigo-700 dark:text-indigo-300 block font-sans mb-1 text-sm">
                  Stage II &bull; Atmospheric Acceleration (Systems Architecture)
                </strong>
                Scaling the machine: multi-period AC optimal power flow, second-by-second transactive consensus, and stochastic digital twins. Rigorous computation deployed to coordinate millions of distributed devices.
              </>
            )}
            {escapeVelocity >= 75 && (
              <>
                <strong className="text-emerald-700 dark:text-emerald-400 block font-sans mb-1 text-sm">
                  Stage III &bull; Escape Velocity & Transcendence (Better Self & Better Planet)
                </strong>
                Breaking free of artificial silos. Technology ceases to be an extractive mechanism and becomes a living instrument of human agency and planetary reciprocity. Telemetry breathes as organic art, engineering serves community sovereignty, and analytical rigor unites with poetic humility to lift both self and planet.
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT: PERSONAL PILLARS SECTION
// ============================================================================
export function PersonalPillarsSection() {
  const [expandedPillar, setExpandedPillar] = useState<number>(0)

  const PILLARS = [
    {
      num: "01",
      kicker: "Somatic • Biological • Rhythmic",
      title: "Neural networks and heartbeats: enteric intelligence, interoception, and entrainment",
      subtitle: "The Inner Microgrid",
      axiom: "Sensing > Forcing",
      essay: [
        "Long before I studied distributed optimization in power grids, my own nervous system was teaching me the danger of top-down control. Modern life trains us to run our bodies like centralized utilities—issuing executive commands from the prefrontal cortex and overriding fatigue, hunger, or tension until a breaker trips.",
        "Real resilience works differently. Beneath conscious thought, the enteric nervous system operates like a localized microgrid in the gut, processing chemistry and rhythm without waiting for permission from the brain. Interoception is the telemetry layer—the quiet practice of reading those internal signals before they escalate into alarms. And entrainment is the synchronization protocol: using breath, movement, and circadian light to bring heart rate, gut motility, and neural oscillations into phase. Leading by example starts here—maintaining an internal grid that can island, regulate, and recover on its own.",
      ],
      tags: ["Enteric Intelligence", "Interoception", "Biological Entrainment", "Sensing > Forcing"],
      component: <SomaticEntrainmentTuner />,
    },
    {
      num: "02",
      kicker: "Ecological • Tactile • Grounded",
      title: "Planet earth and mother nature: external inspirations",
      subtitle: "The Living Blueprint",
      axiom: "Reciprocity > Extraction",
      essay: [
        "When I scramble up coastal sandstone or trace the geometry of wind-carved ridges through a camera lens, I am not looking for an escape from engineering. I am looking at the primary source code.",
        "Nature does not separate aesthetics from structural integrity. A watershed allocates resources without a central dispatcher; a forest floor trades nutrients through fungal mycelium where redundancy is treated as strength rather than waste. Every rock face, tidal pool, and canopy is a lesson in how systems endure volatility by adapting to local terrain rather than fighting it. Paying close attention—through sketching with graphite, cultivating crucifers and fungi, or wandering across continents—keeps my sense of scale honest.",
      ],
      tags: ["Living Systems", "Natural Geometry", "Field Observations", "Reciprocity > Extraction"],
      component: <BiomimeticFieldNotes />,
    },
    {
      num: "03",
      kicker: "Liminal • Kinetic • Digital",
      title: "The interface: experimenting between the transition, translation, and transcendence of worlds through the currency of electrons",
      subtitle: "The Liminal Medium & Escape Velocity",
      axiom: "Agency > Automation",
      essay: [
        "Whether moving across a utility transformer or a glowing glass screen, electrons are the quiet currency that turns intent into action. Yet most digital interfaces treat human beings as passive endpoints—smoothing away friction until agency quietly disappears.",
        "I treat the interface as a threshold worth testing. Transition is the crossing between physical sensation and digital state; translation is the craft of turning raw telemetry, code, or light into something a human nervous system can intuitively grasp; and transcendence is achieving escape velocity beyond artificial silos—refusing to choose between analytical rigor and poetic wonder, between building scalable infrastructure and cultivating the spirit. It is the leap where technology stops merely optimizing efficiency and begins elevating human agency, ecological reciprocity, and a better planet.",
      ],
      tags: ["Digital Craft", "Human-Machine Threshold", "Electron Currency", "Escape Velocity", "Transcendence"],
      component: <ThresholdSandbox />,
    },
  ]

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-3">
          <Sparkles className="h-3 w-3" />
          Guiding Currents &bull; Lived Philosophy
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-slate-900 dark:text-white">
          Pillars of Practice
        </h2>
        <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
          How I move through the world, build with intention, and lead by example—anchored by the quiet dialogue between inner biology, ecological systems, and the digital medium.
        </p>
      </div>

      {/* Pillars Accordion / Stack */}
      <div className="space-y-6">
        {PILLARS.map((pillar, idx) => {
          const isExpanded = expandedPillar === idx

          return (
            <motion.div
              key={pillar.num}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
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
                    <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                      Pillar {pillar.num}
                    </span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {pillar.kicker}
                    </span>
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300/40 dark:border-sky-800/40">
                      {pillar.axiom}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                    {pillar.title}
                  </h3>
                  <p className="font-mono text-xs text-sky-700/80 dark:text-sky-300/80 font-medium">
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
