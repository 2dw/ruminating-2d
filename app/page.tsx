"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AccessibilityControls } from "@/components/accessibility-controls"
import { useAccessibility } from "@/contexts/accessibility-context"
import { ArrowRight, BookOpen, Sparkles, Lightbulb, Camera, Palette, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PortalPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [hoveredWorld, setHoveredWorld] = useState<"professional" | "personal" | null>(null)
  const { highContrast, announceToScreenReader } = useAccessibility()

  // Initialize dark mode from localStorage after component mounts
  useEffect(() => {
    const isDarkFromStorage = localStorage.getItem("theme-mode") === "dark"
    const isDarkFromSystem = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = isDarkFromStorage || isDarkFromSystem

    setIsDarkMode(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    try { localStorage.setItem("theme-mode", newDarkMode ? "dark" : "light") } catch (_) {}
    document.documentElement.classList.toggle("dark")
  }

  const navigateTo = (path: string, worldName: string, tabName?: string) => {
    announceToScreenReader(`Navigating to ${worldName}`)
    router.push(path)
  }

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen w-full transition-colors duration-500 ${
        isDarkMode ? "dark bg-[#0a1015] text-white" : "bg-[#f8fcff] text-[#0e0f11]"
      } ${highContrast ? "high-contrast" : ""} overflow-hidden`}
    >
      {/* Accessibility Controls */}
      <AccessibilityControls isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-40 backdrop-blur-md border-b border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-[#0a1015]/40 transition-colors duration-500">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center h-16">
            <div className="flex items-center">
              <motion.h1
                className="text-2xl font-bold text-slate-800 dark:text-white tracking-wide"
                style={{
                  fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                  textShadow: isDarkMode
                    ? "0 2px 8px rgba(0, 0, 0, 0.4), 0 0 16px rgba(45, 212, 191, 0.4)"
                    : "0 2px 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(15, 118, 110, 0.2)",
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{
                  textShadow: isDarkMode
                    ? "0 2px 12px rgba(0, 0, 0, 0.6), 0 0 24px rgba(45, 212, 191, 0.6)"
                    : "0 2px 12px rgba(255, 255, 255, 0.6), 0 0 24px rgba(15, 118, 110, 0.3)",
                  scale: 1.05,
                  letterSpacing: "0.08em",
                }}
              >
                trudie wang
              </motion.h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Portal */}
      <main id="main-content" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" tabIndex={-1}>
        <div className="text-center mb-6 relative">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.span
              className="absolute left-1/2 top-6 h-40 w-40 -translate-x-1/2 rounded-full bg-teal-300/10 blur-3xl"
              animate={{ scale: [1, 1.08, 1], x: [0, 12, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="absolute right-10 top-24 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl"
              animate={{ y: [0, 16, 0], x: [0, -16, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-4xl md:text-5xl font-serif mb-6 text-teal-700 dark:text-teal-400 relative inline-block bg-white/70 dark:bg-[#0a1015]/70 px-4 py-2 rounded-lg">
              imagining constellations from north stars
              <motion.span
                className="absolute -top-6 -right-6 text-yellow-400 dark:text-yellow-300"
                animate={{
                  rotate: [0, 15, 0, -15, 0],
                  scale: [1, 1.2, 1, 1.2, 1],
                }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
                aria-hidden="true"
              >
                ✦
              </motion.span>
              <motion.span
                className="absolute -bottom-2 -left-6 text-blue-400 dark:text-blue-300"
                animate={{
                  rotate: [0, -15, 0, 15, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                aria-hidden="true"
              >
                ✧
              </motion.span>
            </h1>
          </motion.div>
          <motion.p
            className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-[#0a1015]/70 px-4 py-2 rounded-lg inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Explore the interconnected paths of my professional journey and personal wanderings, like mycelium
            connecting all living things in nature.
          </motion.p>

        </div>

        {/* Two Worlds - Refined with professional ambient glow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Professional World */}
          <motion.div
            className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 cursor-pointer ${
              hoveredWorld === "professional"
                ? "border-emerald-500/80 shadow-2xl shadow-emerald-500/20 ring-1 ring-emerald-400/30 dark:border-emerald-400 dark:shadow-emerald-950/70"
                : hoveredWorld === "personal"
                  ? "border-slate-200/60 dark:border-slate-800/60 opacity-85"
                  : "border-slate-200/80 dark:border-slate-800/80 shadow-md hover:border-emerald-400/50"
            }`}
            onMouseEnter={() => setHoveredWorld("professional")}
            onMouseLeave={() => setHoveredWorld(null)}
            onClick={() => navigateTo("/professional", "Professional Repertoire")}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Ambient Radial Glow on Hover */}
            <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-400/15 via-teal-500/5 to-transparent z-0" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/70 via-white/80 to-emerald-100/40 dark:from-emerald-950/25 dark:via-slate-950/80 dark:to-emerald-900/15 z-0" />

            {/* Mycelium-inspired background pattern */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/3 opacity-10 dark:opacity-20 z-0 overflow-hidden pointer-events-none"
              aria-hidden="true"
            >
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                  d="M0,80 Q25,60 50,80 T100,80"
                  stroke="currentColor"
                  className="text-emerald-500 dark:text-emerald-400"
                  fill="none"
                  strokeWidth="0.6"
                  animate={{
                    d: ["M0,80 Q25,60 50,80 T100,80", "M0,80 Q25,65 50,75 T100,80", "M0,80 Q25,60 50,80 T100,80"],
                  }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
                <motion.path
                  d="M0,90 Q25,70 50,90 T100,90"
                  stroke="currentColor"
                  className="text-emerald-500 dark:text-emerald-400"
                  fill="none"
                  strokeWidth="0.6"
                  animate={{
                    d: ["M0,90 Q25,70 50,90 T100,90", "M0,90 Q25,75 50,85 T100,90", "M0,90 Q25,70 50,90 T100,90"],
                  }}
                  transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
                />
              </svg>
            </div>

            <div className="relative z-10 p-7 sm:p-9 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md rounded-3xl m-1 border border-white/60 dark:border-slate-800/40">
              <div className="flex items-center justify-between mb-5">
                <div
                  className="w-14 h-14 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300/40 dark:border-emerald-700/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shadow-sm transition-transform duration-300 group-hover:scale-105"
                  aria-hidden="true"
                >
                  <BookOpen className="h-7 w-7" />
                </div>
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300/60 dark:border-emerald-800/60">
                  Systems &bull; Energy &bull; Agency
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3 text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                Professional Repertoire
              </h2>
              <p className="mb-7 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Two decades of engineering and leadership at the frontier of distributed energy, proving that intelligent systems and equitable access are not in conflict.
              </p>

              <div className="grid grid-cols-1 gap-3 mb-8">
                <div
                  className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-emerald-300/50 hover:bg-emerald-50/60 dark:hover:border-emerald-800/50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer group/link"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateTo("/professional/me", "Me Until Now")
                  }}
                >
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 group-hover/link:text-emerald-700 dark:group-hover/link:text-emerald-300">
                    <div className="p-1.5 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="font-serif font-medium text-sm">Me Until Now</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 opacity-0 group-hover/link:opacity-100 transition-opacity">
                    Trajectory &rarr;
                  </span>
                </div>

                <div
                  className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-emerald-300/50 hover:bg-emerald-50/60 dark:hover:border-emerald-800/50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer group/link"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateTo("/professional/endeavors", "Tiny Endeavors")
                  }}
                >
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 group-hover/link:text-emerald-700 dark:group-hover/link:text-emerald-300">
                    <div className="p-1.5 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="font-serif font-medium text-sm">Tiny Endeavors</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 opacity-0 group-hover/link:opacity-100 transition-opacity">
                    Research & Live DERs &rarr;
                  </span>
                </div>

                <div
                  className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-emerald-300/50 hover:bg-emerald-50/60 dark:hover:border-emerald-800/50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer group/link"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateTo("/professional/musings", "Mission Musings")
                  }}
                >
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 group-hover/link:text-emerald-700 dark:group-hover/link:text-emerald-300">
                    <div className="p-1.5 rounded-lg bg-emerald-100/60 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                      <Lightbulb className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="font-serif font-medium text-sm">Mission Musings</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 opacity-0 group-hover/link:opacity-100 transition-opacity">
                    Esse Quam Videri &rarr;
                  </span>
                </div>
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateTo("/professional", "Professional Repertoire")
                }}
                className="group/btn bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl px-5 py-2.5 shadow-md shadow-emerald-900/10 transition-all"
                aria-label="Enter Professional World section"
              >
                <span className="flex items-center text-sm font-mono font-semibold">
                  Enter Professional World
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Button>
            </div>
          </motion.div>

          {/* Personal World */}
          <motion.div
            className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 cursor-pointer ${
              hoveredWorld === "personal"
                ? "border-sky-500/80 shadow-2xl shadow-sky-500/20 ring-1 ring-sky-400/30 dark:border-sky-400 dark:shadow-sky-950/70"
                : hoveredWorld === "professional"
                  ? "border-slate-200/60 dark:border-slate-800/60 opacity-85"
                  : "border-slate-200/80 dark:border-slate-800/80 shadow-md hover:border-sky-400/50"
            }`}
            onMouseEnter={() => setHoveredWorld("personal")}
            onMouseLeave={() => setHoveredWorld(null)}
            onClick={() => navigateTo("/personal", "Mind Wandering")}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Ambient Radial Glow on Hover */}
            <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/15 via-blue-500/5 to-transparent z-0" />
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/70 via-white/80 to-blue-100/40 dark:from-sky-950/25 dark:via-slate-950/80 dark:to-blue-900/15 z-0" />

            {/* Mycelium-inspired background pattern */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/3 opacity-10 dark:opacity-20 z-0 overflow-hidden pointer-events-none"
              aria-hidden="true"
            >
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                  d="M0,80 Q25,100 50,80 T100,80"
                  stroke="currentColor"
                  className="text-sky-500 dark:text-sky-400"
                  fill="none"
                  strokeWidth="0.6"
                  animate={{
                    d: ["M0,80 Q25,100 50,80 T100,80", "M0,80 Q25,95 50,85 T100,80", "M0,80 Q25,100 50,80 T100,80"],
                  }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
                <motion.path
                  d="M0,90 Q25,110 50,90 T100,90"
                  stroke="currentColor"
                  className="text-sky-500 dark:text-sky-400"
                  fill="none"
                  strokeWidth="0.6"
                  animate={{
                    d: ["M0,90 Q25,110 50,90 T100,90", "M0,90 Q25,105 50,95 T100,90", "M0,90 Q25,110 50,90 T100,90"],
                  }}
                  transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
                />
              </svg>
            </div>

            <div className="relative z-10 p-7 sm:p-9 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md rounded-3xl m-1 border border-white/60 dark:border-slate-800/40">
              <div className="flex items-center justify-between mb-5">
                <div
                  className="w-14 h-14 rounded-2xl bg-sky-100/80 dark:bg-sky-950/80 border border-sky-300/40 dark:border-sky-700/40 flex items-center justify-center text-sky-700 dark:text-sky-300 shadow-sm transition-transform duration-300 group-hover:scale-105"
                  aria-hidden="true"
                >
                  <Palette className="h-7 w-7" />
                </div>
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-sky-700 dark:text-sky-400 bg-sky-100/70 dark:bg-sky-950/60 px-3 py-1 rounded-full border border-sky-300/60 dark:border-sky-800/60">
                  Art &bull; Imagery &bull; Narrative
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-3 text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
                Mind Wandering
              </h2>
              <p className="mb-7 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                A calm space for creative explorations, photography meanderings across continents, and written fragments that continue to unfold.
              </p>

              <div className="grid grid-cols-1 gap-3 mb-8">
                <div
                  className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-sky-300/50 hover:bg-sky-50/60 dark:hover:border-sky-800/50 dark:hover:bg-sky-950/40 transition-all cursor-pointer group/link"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateTo("/personal/creative", "Creative Endeavors")
                  }}
                >
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 group-hover/link:text-sky-700 dark:group-hover/link:text-sky-300">
                    <div className="p-1.5 rounded-lg bg-sky-100/60 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                      <Palette className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="font-serif font-medium text-sm">Creative Endeavors</span>
                  </div>
                  <span className="text-xs font-mono text-sky-600 dark:text-sky-400 opacity-0 group-hover/link:opacity-100 transition-opacity">
                    Art & Projects &rarr;
                  </span>
                </div>

                <div
                  className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-sky-300/50 hover:bg-sky-50/60 dark:hover:border-sky-800/50 dark:hover:bg-sky-950/40 transition-all cursor-pointer group/link"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateTo("/personal/imagery", "Imagery Meanderings")
                  }}
                >
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 group-hover/link:text-sky-700 dark:group-hover/link:text-sky-300">
                    <div className="p-1.5 rounded-lg bg-sky-100/60 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                      <Camera className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="font-serif font-medium text-sm">Imagery Meanderings</span>
                  </div>
                  <span className="text-xs font-mono text-sky-600 dark:text-sky-400 opacity-0 group-hover/link:opacity-100 transition-opacity">
                    Photo Journeys &rarr;
                  </span>
                </div>

                <div
                  className="flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-sky-300/50 hover:bg-sky-50/60 dark:hover:border-sky-800/50 dark:hover:bg-sky-950/40 transition-all cursor-pointer group/link"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateTo("/personal/story", "The Story Is Being Written")
                  }}
                >
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 group-hover/link:text-sky-700 dark:group-hover/link:text-sky-300">
                    <div className="p-1.5 rounded-lg bg-sky-100/60 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                      <PenTool className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="font-serif font-medium text-sm">The Story Is Being Written</span>
                  </div>
                  <span className="text-xs font-mono text-sky-600 dark:text-sky-400 opacity-0 group-hover/link:opacity-100 transition-opacity">
                    Fragments & Writing &rarr;
                  </span>
                </div>
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateTo("/personal", "Mind Wandering")
                }}
                className="group/btn bg-sky-700 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white rounded-xl px-5 py-2.5 shadow-md shadow-sky-900/10 transition-all"
                aria-label="Enter Personal World section"
              >
                <span className="flex items-center text-sm font-mono font-semibold">
                  Enter Personal World
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer - more playful */}
      <footer className="bg-gray-50 dark:bg-gray-900/50 py-8 mt-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-400">© 2026 Trudie Wang. All rights reserved.</p>
            </div>
            <motion.p
              className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center md:text-right font-serif italic"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              Not all those who wander are lost. If you happen on my path, greet a fellow traveler!{" "}
            </motion.p>
          </div>
        </div>
      </footer>
    </div>
  )
}
