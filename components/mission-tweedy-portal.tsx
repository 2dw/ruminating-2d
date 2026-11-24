"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  RotateCcw,
  Sparkles,
  Layers,
  ZoomIn,
  Heart,
  Quote,
  Film,
  Compass,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ASSETS_BASE } from "@/lib/assets"

interface MissionTweedyPortalProps {
  prefix?: string
}

const MACRO_TILES = [
  {
    id: "s1",
    name: "s1.jpg",
    label: "Left Edge & Start",
    char: "Tw... / 陶...",
    description: "The pristine left border and opening characters of the official sign.",
  },
  {
    id: "s2",
    name: "s2.jpg",
    label: "Tweed Core",
    char: "Tweed... / 陶域...",
    description: "The traditional English and Chinese street name lettering.",
  },
  {
    id: "s3",
    name: "s3.jpg",
    label: "The Custom 'Y'",
    char: "...eedy R... / 域道",
    description: "The fateful 'y' sneaked onto Tweed Road to rename it for Tweedy.",
  },
  {
    id: "s4",
    name: "s4.jpg",
    label: "Road Ending",
    char: "...y Road / 戈道",
    description: "The English suffix and traditional Chinese street character.",
  },
  {
    id: "s5",
    name: "s5.jpg",
    label: "Right Margin",
    char: "...ad & Bolts",
    description: "The right border showing mounting bolt holes from the heist.",
  },
]

const STORY_SNIPPETS = [
  {
    author: "The 'Y' Alterer",
    quote:
      "I have a confession to make. The 'y' on the previous 'Tweedy Road' yes. That was me, that whole time. It was me! They replaced the sign without the alter... HA! Well we took care of [it] didn't we?",
    badge: "The Confession",
    color: "from-amber-500/20 to-amber-500/5 text-amber-700 dark:text-amber-300 border-amber-300/40",
  },
  {
    author: "Dina & Susan",
    quote:
      "Illegal actions have been taken just for you :) Watch the video it's a lot of fun. Can't believe that it's done - there's no more road sign! haha, it's all for you trudz! keep this sign forever! ... Remember dinosaurs crush turtles! :D *hugz*",
    badge: "The Mission Note",
    color: "from-rose-500/20 to-rose-500/5 text-rose-700 dark:text-rose-300 border-rose-300/40",
  },
  {
    author: "High School Friends",
    quote:
      "Take care of yourself, work hard but play hard & sleep hard too!! ... miss u trudz! Miss us? Miss me? Rudy. Take care please. Talk 2 u soon! 2D 10/04/02",
    badge: "Farewell Keepsake",
    color: "from-blue-500/20 to-blue-500/5 text-blue-700 dark:text-blue-300 border-blue-300/40",
  },
]

export function MissionTweedyPortal({ prefix = "projects/mission: Tweedy/" }: MissionTweedyPortalProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [activeTab, setActiveTab] = useState<"sign" | "macros" | "motion">("sign")
  const [selectedMacro, setSelectedMacro] = useState<string>("s3")
  const [activeSnippet, setActiveSnippet] = useState<number | null>(0)

  const frontUrl = `${ASSETS_BASE}/${encodeURI(prefix)}sign%2011_mod.jpg`
  const backUrl = `${ASSETS_BASE}/${encodeURI(prefix)}sign%2009_mod.jpg`
  const animGifUrl = `${ASSETS_BASE}/${encodeURI(prefix)}sign.gif`
  const animPerspectiveUrl = `${ASSETS_BASE}/${encodeURI(prefix)}sign-perspective.gif`

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur transition dark:border-slate-800 dark:bg-slate-950/80 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Keepsake Portal
          </div>
          <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Mission impossible: Codename Tweedy
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Explore both sides of the liberated Hong Kong street sign: the iconic green-and-white face with the clandestine &apos;y&apos;, and the reverse memory board signed by high school friends.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => setActiveTab("sign")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition",
              activeTab === "sign"
                ? "bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Double-Sided Sign
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("macros")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition",
              activeTab === "macros"
                ? "bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            Macro Strip
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("motion")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition",
              activeTab === "motion"
                ? "bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            <Film className="h-3.5 w-3.5" />
            Stop-Motion
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {activeTab === "sign" && (
            <motion.div
              key="sign-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Interactive Flippable Signboard Container */}
              <div className="relative mx-auto max-w-4xl [perspective:1400px]">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Current view: </span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {isFlipped ? "Reverse Side (Farewell Canvas & Notes)" : "Front Side (Tweedy Road / 陶域道)"}
                    </strong>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFlipped((prev) => !prev)}
                    className="flex items-center gap-2 border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Flip to {isFlipped ? "Front Sign" : "Reverse Notes"}
                  </Button>
                </div>

                {/* 3D Card */}
                <div
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="group relative h-[280px] w-full cursor-pointer select-none rounded-3xl border-4 border-slate-800 bg-slate-900 shadow-2xl transition-all duration-700 [transform-style:preserve-3d] hover:shadow-blue-500/10 sm:h-[380px] md:h-[440px]"
                  style={{
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                  title="Click anywhere to flip the sign"
                >
                  {/* FRONT FACE */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[20px] bg-slate-950 [backface-visibility:hidden]">
                    <div className="relative h-full w-full">
                      <Image
                        src={frontUrl}
                        alt="Front of Tweedy Road Street Sign"
                        fill
                        className="object-contain p-2 sm:p-4"
                        sizes="(max-width: 1024px) 100vw, 896px"
                        priority
                      />
                    </div>
                    {/* Mounting holes visual accent */}
                    <div className="pointer-events-none absolute left-4 top-4 h-3.5 w-3.5 rounded-full border border-slate-400 bg-slate-800/80 shadow-inner" />
                    <div className="pointer-events-none absolute right-4 top-4 h-3.5 w-3.5 rounded-full border border-slate-400 bg-slate-800/80 shadow-inner" />
                    <div className="pointer-events-none absolute bottom-4 left-4 h-3.5 w-3.5 rounded-full border border-slate-400 bg-slate-800/80 shadow-inner" />
                    <div className="pointer-events-none absolute bottom-4 right-4 h-3.5 w-3.5 rounded-full border border-slate-400 bg-slate-800/80 shadow-inner" />

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-300 backdrop-blur">
                      Click to flip & view handwritten notes →
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[20px] bg-[#2a241e] [backface-visibility:hidden]"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src={backUrl}
                        alt="Reverse Memory Board of Tweedy Road Sign"
                        fill
                        className="object-contain p-2 sm:p-4"
                        sizes="(max-width: 1024px) 100vw, 896px"
                      />
                    </div>
                    {/* Mounting holes visual accent */}
                    <div className="pointer-events-none absolute left-4 top-4 h-3.5 w-3.5 rounded-full border border-amber-800 bg-black/60 shadow-inner" />
                    <div className="pointer-events-none absolute right-4 top-4 h-3.5 w-3.5 rounded-full border border-amber-800 bg-black/60 shadow-inner" />
                    <div className="pointer-events-none absolute bottom-4 left-4 h-3.5 w-3.5 rounded-full border border-amber-800 bg-black/60 shadow-inner" />
                    <div className="pointer-events-none absolute bottom-4 right-4 h-3.5 w-3.5 rounded-full border border-amber-800 bg-black/60 shadow-inner" />

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-3 py-1 text-[11px] font-medium text-amber-200 backdrop-blur">
                      Click to flip back to front sign ←
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                  Tip: Click anywhere on the sign or use the button above to flip between the street sign front and the memory canvas back.
                </p>
              </div>

              {/* Story Quotes Accordion / Highlights */}
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {STORY_SNIPPETS.map((snippet, idx) => {
                  const isSelected = activeSnippet === idx
                  return (
                    <div
                      key={snippet.badge}
                      onClick={() => setActiveSnippet(isSelected ? null : idx)}
                      className={cn(
                        "cursor-pointer rounded-2xl border p-4 transition duration-200",
                        snippet.color,
                        isSelected
                          ? "ring-2 ring-blue-400/50 shadow-md bg-white/80 dark:bg-slate-900/80"
                          : "bg-white/40 hover:bg-white/70 dark:bg-slate-900/40 dark:hover:bg-slate-900/70",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold dark:bg-slate-800">
                          {snippet.badge}
                        </span>
                        <Quote className="h-4 w-4 opacity-40" />
                      </div>
                      <p className="mt-3 text-xs leading-relaxed italic text-slate-700 dark:text-slate-300">
                        &ldquo;{snippet.quote}&rdquo;
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <Heart className="h-3 w-3 text-rose-500" />
                        <span>— {snippet.author}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "macros" && (
            <motion.div
              key="macros-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="rounded-2xl bg-slate-50/70 p-4 dark:bg-slate-900/40">
                <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">
                  Macro Pan Strip: Traversing the Sign Face
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Select any segment below to inspect the sequential camera pans across the face of the road sign, from the left border across the infamous added &apos;y&apos; to the right mounting edge.
                </p>
              </div>

              {/* Active Macro Display */}
              {(() => {
                const active = MACRO_TILES.find((m) => m.id === selectedMacro) || MACRO_TILES[2]
                const macroUrl = `${ASSETS_BASE}/${encodeURI(prefix)}${active.name}`
                return (
                  <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 dark:border-slate-800">
                    <div className="relative mx-auto h-[320px] w-full sm:h-[400px]">
                      <Image
                        src={macroUrl}
                        alt={active.label}
                        fill
                        className="rounded-xl object-contain"
                        sizes="(max-width: 1024px) 100vw, 896px"
                      />
                    </div>
                    <div className="mt-3 flex flex-col justify-between gap-2 border-t border-slate-800 pt-3 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-white">{active.label}</span>
                          <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-mono font-medium text-blue-300">
                            {active.char}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{active.description}</p>
                      </div>
                      <span className="text-xs font-mono text-slate-500">{active.name}</span>
                    </div>
                  </div>
                )
              })()}

              {/* Segment Selector Thumbnails */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {MACRO_TILES.map((tile) => {
                  const tileUrl = `${ASSETS_BASE}/${encodeURI(prefix)}${tile.name}`
                  const isSelected = selectedMacro === tile.id
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => setSelectedMacro(tile.id)}
                      className={cn(
                        "group relative flex flex-col overflow-hidden rounded-2xl border p-2 text-left transition duration-200",
                        isSelected
                          ? "border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-400/40 dark:border-blue-400 dark:bg-blue-950/40"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60",
                      )}
                    >
                      <div className="relative h-20 w-full overflow-hidden rounded-lg bg-slate-950">
                        <Image
                          src={tileUrl}
                          alt={tile.label}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-105"
                          sizes="180px"
                        />
                        {isSelected && (
                          <div className="absolute right-1 top-1 rounded-full bg-blue-600 p-0.5 text-white">
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <p className="truncate text-xs font-medium text-slate-900 dark:text-white">
                          {tile.label}
                        </p>
                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {tile.char}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "motion" && (
            <motion.div
              key="motion-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                {/* 12-Frame Stop-Motion Walkthrough */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-4 dark:border-slate-800">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-serif font-bold text-white">Full Sign Stop-Motion</span>
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] font-mono text-blue-300">
                      sign.gif (12 frames)
                    </span>
                  </div>
                  <div className="relative h-64 w-full sm:h-72">
                    <Image
                      src={animGifUrl}
                      alt="Animated stop-motion frames around the sign"
                      fill
                      unoptimized
                      className="rounded-xl object-contain"
                    />
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    A sequence of 12 handheld photo frames revolving around the liberated street sign on the floor, capturing the metallic reflections and the handwritten graffiti.
                  </p>
                </div>

                {/* Perspective Tilt GIF */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-4 dark:border-slate-800">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-serif font-bold text-white">Perspective Tilt</span>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-mono text-emerald-300">
                      sign-perspective.gif
                    </span>
                  </div>
                  <div className="relative h-64 w-full sm:h-72">
                    <Image
                      src={animPerspectiveUrl}
                      alt="Perspective animation of the street sign"
                      fill
                      unoptimized
                      className="rounded-xl object-contain"
                    />
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    Perspective shift revealing the street-grade enamel gloss, thickness of the sign plate, and the tactile nostalgia of high school years.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
