"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  DollarSign,
  Layers,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Clock,
  Compass,
  CheckCircle,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ASSETS_BASE } from "@/lib/assets"

interface EarningADollarPortalProps {
  prefix?: string
}

const CHRONO_STEPS = [
  {
    step: 1,
    time: "6:43:38 PM",
    file: "IMG_3016.jpg",
    stage: "The Beach",
    title: "The Distant Bluff",
    desc: "Looking up at the towering coastal sandstone cliffs from the water's edge across the wide sandy beach.",
  },
  {
    step: 2,
    time: "6:54:25 PM",
    file: "IMG_3019.jpg",
    stage: "The Approach",
    title: "Walking to the Base",
    desc: "Striding across the sand directly toward the foot of the bluffs to find a climbable line.",
  },
  {
    step: 3,
    time: "6:56:14 PM",
    file: "IMG_3026.jpg",
    stage: "Initial Scramble",
    title: "Scoping the Rock",
    desc: "Hands and sneakers on the lower sandstone bench, testing crumbly footholds and committing to the pitch.",
  },
  {
    step: 4,
    time: "7:14:20 PM",
    file: "IMG_3063.jpg",
    stage: "The Chimney",
    title: "Into the Slot",
    desc: "Wedging inside the deep, narrow sandstone chimney crevice where friction is everything.",
  },
  {
    step: 5,
    time: "7:15:05 PM",
    file: "IMG_3070.jpg",
    stage: "The Chimney",
    title: "Stemming the Crevice",
    desc: "Stemming between opposite rock walls, inching upward with back and feet bracing on sandstone.",
  },
  {
    step: 6,
    time: "7:15:19 PM",
    file: "IMG_3073.jpg",
    stage: "The Chimney",
    title: "Upper Chute",
    desc: "Pushing through the steepest portion of the vertical slot as daylight begins to filter in.",
  },
  {
    step: 7,
    time: "7:24:55 PM",
    file: "IMG_3076.jpg",
    stage: "Open Face",
    title: "Exiting to the Ridge",
    desc: "Emerging onto the open sunlit ridge with exposure falling away below toward the sea.",
  },
  {
    step: 8,
    time: "7:25:12 PM",
    file: "IMG_3078.jpg",
    stage: "Open Face",
    title: "The Golden Pitch",
    desc: "Working up the crumbly golden sandstone slope with the Pacific afternoon light illuminating the rock.",
  },
  {
    step: 9,
    time: "7:26:09 PM",
    file: "IMG_3084.jpg",
    stage: "Upper Ridge",
    title: "Ascending the Spine",
    desc: "Scaling the steep knife-edge spine with only the deep blue sky remaining overhead.",
  },
  {
    step: 10,
    time: "7:27:20 PM",
    file: "IMG_3088.jpg",
    stage: "Upper Ridge",
    title: "Upper Sandstone Band",
    desc: "Careful foot placement on loose dirt and layered clay bands just below the crest.",
  },
  {
    step: 11,
    time: "7:27:22 PM",
    file: "IMG_3089.jpg",
    stage: "Upper Ridge",
    title: "Last Moves Below Rim",
    desc: "Reaching for final handholds on the upper ridge lip with the summit now in grasp.",
  },
  {
    step: 12,
    time: "7:29:38 PM",
    file: "IMG_3104.jpg",
    stage: "The Crest",
    title: "Pulling Over the Top",
    desc: "Cresting the final lip and hauling up onto the flat vegetation of the summit ridge.",
  },
  {
    step: 13,
    time: "7:30:37 PM",
    file: "IMG_3106.jpg",
    stage: "Summit",
    title: "Standing on the Peak",
    desc: "Standing upright against the vast Pacific blue sky, triumphant after navigating the bluffs.",
  },
  {
    step: 14,
    time: "7:30:46 PM",
    file: "IMG_3107.jpg",
    stage: "Summit Victory",
    title: "The Grin of Success",
    desc: "A bright victory smile atop the bluffs. The climb is conquered, and the dollar is officially earned.",
  },
]

export function EarningADollarPortal({ prefix = "projects/earning a dollar/" }: EarningADollarPortalProps) {
  const [activeTab, setActiveTab] = useState<"storyboard" | "dollar" | "filmstrip">("storyboard")
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const storyboardUrl = `${ASSETS_BASE}/${encodeURI(prefix)}dollarstoryline.JPG`
  const dollarUrl = `${ASSETS_BASE}/${encodeURI(prefix)}dollar.jpg`

  const activeStep = CHRONO_STEPS[currentStepIndex]
  const currentStepImgUrl = `${ASSETS_BASE}/${encodeURI(prefix)}${activeStep.file}`

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur transition dark:border-slate-800 dark:bg-slate-950/80 sm:p-8">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Ascent & Storyboard Portal
          </div>
          <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            The football&apos;s journey: how to earn a dollar
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            October 7, 2006 · A vertical scramble up crumbly Pacific coastal bluffs, immortalized in a classic 10-panel comic storyboard and a signed Federal Reserve note.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => setActiveTab("storyboard")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition",
              activeTab === "storyboard"
                ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            Full Storyboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dollar")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition",
              activeTab === "dollar"
                ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            <DollarSign className="h-3.5 w-3.5" />
            The $1 Bounty
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("filmstrip")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition",
              activeTab === "filmstrip"
                ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            14-Step Scrubber
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {/* TAB 1: STORYBOARD */}
          {activeTab === "storyboard" && (
            <motion.div
              key="storyboard-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-xl dark:border-slate-800">
                <div className="relative h-[480px] w-full sm:h-[620px] md:h-[720px]">
                  <Image
                    src={storyboardUrl}
                    alt="How to Earn a Dollar Comic Storyboard"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 896px"
                    priority
                  />
                </div>
                <div className="mt-4 flex flex-col justify-between gap-2 border-t border-slate-800 pt-3 text-xs text-slate-400 sm:flex-row sm:items-center">
                  <span>Storyline Collage: 10 ascent panels + signed Series 2003A dollar bill</span>
                  <a
                    href={storyboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Open full-resolution image
                  </a>
                </div>
              </div>

              {/* Story Narrative Card */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <span className="font-serif font-bold text-slate-900 dark:text-white">1. The Beach Dare</span>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    Looking up from the low tide sands at the crumbly sandstone headlands. A wager was struck: scramble to the summit of the sheer bluffs without ropes, and claim one dollar.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <span className="font-serif font-bold text-slate-900 dark:text-white">2. The Chimney & Ridge</span>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    A vertical stem up a dark crevice, wedging knees, sneakers, and elbows. Every foot of elevation tested friction on fragile, sun-baked California clay.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <span className="font-serif font-bold text-slate-900 dark:text-white">3. The Summit & Note</span>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    Cresting the summit overlooking the Pacific horizon, hands dusty and knees scraped, receiving the signed dollar bill: &apos;2d, I don&apos;t kneed this anymore!&apos;
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DOLLAR BILL */}
          {activeTab === "dollar" && (
            <motion.div
              key="dollar-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-6 shadow-2xl dark:border-slate-800">
                <div className="relative h-[280px] w-full sm:h-[380px] md:h-[440px]">
                  <Image
                    src={dollarUrl}
                    alt="Signed One Dollar Bill: 2d, I don't kneed this anymore!"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 896px"
                    priority
                  />
                </div>
              </div>

              {/* Inscription & Historical Breakdown */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 dark:border-emerald-800/60 dark:bg-slate-900/60">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                      The Hand Inscription: &ldquo;2d, I don&apos;t kneed this anymore!&rdquo;
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    Written in black permanent ink directly over the seal of the Federal Reserve Bank of San Francisco. Notice the clever climbing pun:
                  </p>
                  <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span><strong>&ldquo;kneed&rdquo;</strong> refers to both the financial &ldquo;need&rdquo; and the physical knees scraped and wedged during the chimney stem scramble up the sandstone bluffs.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span><strong>&ldquo;2d&rdquo;</strong> is Trudie&apos;s longstanding nickname, matching the initials stamped across her high school and college creative works.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/40">
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                    Artifact Metadata
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-slate-200/60 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                      <span className="text-slate-400">Currency</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Series 2003A $1 Note</p>
                    </div>
                    <div className="rounded-xl border border-slate-200/60 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                      <span className="text-slate-400">Issuing Bank</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Federal Reserve (San Francisco)</p>
                    </div>
                    <div className="rounded-xl border border-slate-200/60 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                      <span className="text-slate-400">Serial Number</span>
                      <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">L 16266932 E</p>
                    </div>
                    <div className="rounded-xl border border-slate-200/60 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                      <span className="text-slate-400">Settled On</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">October 28, 2006</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: 14-STEP CHRONOLOGICAL FILMSTRIP */}
          {activeTab === "filmstrip" && (
            <motion.div
              key="filmstrip-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Step Hero View */}
              <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-xl dark:border-slate-800">
                <div className="relative mx-auto h-[320px] w-full sm:h-[420px] md:h-[480px]">
                  <Image
                    src={currentStepImgUrl}
                    alt={activeStep.title}
                    fill
                    className="rounded-xl object-contain"
                    sizes="(max-width: 1024px) 100vw, 896px"
                  />
                  {/* Prev/Next Overlay Buttons */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : CHRONO_STEPS.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
                    aria-label="Previous step"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentStepIndex((prev) => (prev < CHRONO_STEPS.length - 1 ? prev + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
                    aria-label="Next step"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>

                {/* Step Metadata Footer */}
                <div className="mt-4 flex flex-col justify-between gap-3 border-t border-slate-800 pt-3 text-slate-300 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                        Step {activeStep.step} of 14 · {activeStep.stage}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {activeStep.time}
                      </span>
                    </div>
                    <h4 className="mt-1 font-serif text-lg font-bold text-white">{activeStep.title}</h4>
                    <p className="mt-1 text-xs text-slate-400">{activeStep.desc}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-slate-500">{activeStep.file}</span>
                </div>
              </div>

              {/* Scrubber Filmstrip Thumbnails */}
              <div>
                <p className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Ascent Timeline (Chronological Order: 6:43 PM → 7:30 PM)
                </p>
                <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin">
                  {CHRONO_STEPS.map((s, idx) => {
                    const isSelected = idx === currentStepIndex
                    const thumbUrl = `${ASSETS_BASE}/${encodeURI(prefix)}${s.file}`
                    return (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => setCurrentStepIndex(idx)}
                        className={cn(
                          "group relative flex w-24 shrink-0 flex-col overflow-hidden rounded-xl border p-1 text-left transition duration-200 sm:w-28",
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-400/50 shadow-md dark:border-emerald-400 dark:bg-emerald-950/40"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60",
                        )}
                      >
                        <div className="relative h-14 w-full overflow-hidden rounded-lg bg-slate-950 sm:h-16">
                          <Image
                            src={thumbUrl}
                            alt={s.title}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-105"
                            sizes="120px"
                          />
                          <div className="absolute left-1 top-1 rounded bg-black/70 px-1 py-0.5 text-[10px] font-mono text-white">
                            #{s.step}
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="truncate text-[10px] font-medium text-slate-800 dark:text-slate-200">
                            {s.stage}
                          </p>
                          <p className="truncate text-[9px] font-mono text-slate-500">
                            {s.time}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
