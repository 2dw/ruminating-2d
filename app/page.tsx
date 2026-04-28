"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AccessibilityControls } from "@/components/accessibility-controls"
import { useAccessibility } from "@/contexts/accessibility-context"
import { StarryBackground } from "@/components/starry-background"
import { ArrowRight, BookOpen, Sparkles, Lightbulb, Camera, Palette, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PortalPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [hoveredWorld, setHoveredWorld] = useState<"professional" | "personal" | null>(null)
  const { highContrast, announceToScreenReader } = useAccessibility()

  // Initialize dark mode from localStorage after component mounts
  useEffect(() => {
    const isDarkFromStorage = localStorage.getItem("isDarkMode") === "true"
    const isDarkFromSystem = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = isDarkFromStorage || isDarkFromSystem

    setIsDarkMode(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem("isDarkMode", String(newDarkMode))
    document.documentElement.classList.toggle("dark")
  }

  const navigateTo = (path: string, worldName: string, tabName?: string) => {
    announceToScreenReader(`Navigating to ${worldName}`)
    if (tabName) {
      // Store the target tab in sessionStorage so the destination page can read it
      sessionStorage.setItem("targetTab", tabName)
    }
    router.push(path)
  }

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen w-full transition-colors duration-500 ${
        isDarkMode ? "dark bg-[#0a1015] text-white" : "bg-[#f8fcff] text-[#0e0f11]"
      } ${highContrast ? "high-contrast" : ""} overflow-hidden`}
    >
      {/* Shooting Stars */}
      <StarryBackground shootingStarCount={3} />

      {/* Accessibility Controls */}
      <AccessibilityControls isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Header with Neural Network Background */}
      <header className="fixed top-0 w-full z-40 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Neural Network Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/neural-network-reference.jpg')`,
            filter: "brightness(0.6) contrast(1.1) hue-rotate(20deg) saturate(1.3)",
          }}
        >
          {/* Lighter overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-slate-800/50 to-indigo-900/60"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center h-16">
            <div className="flex items-center">
              <motion.h1
                className="text-2xl font-bold text-white tracking-wide"
                style={{
                  fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                  fontWeight: "700",
                  letterSpacing: "0.05em",
                  textShadow:
                    "0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.6), 0 0 40px rgba(147, 197, 253, 0.4)",
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{
                  textShadow:
                    "0 2px 6px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.7), 0 0 60px rgba(147, 197, 253, 0.6)",
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

        {/* Two Worlds - with more playful elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {/* Professional World */}
          <motion.div
            className={`relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer ${
              hoveredWorld === "professional"
                ? "border-green-400 shadow-lg shadow-green-100 dark:shadow-green-900/20"
                : hoveredWorld === "personal"
                  ? "border-gray-200 dark:border-gray-800 opacity-80"
                  : "border-gray-200 dark:border-gray-800"
            } dynamic-frame`}
            onMouseEnter={() => setHoveredWorld("professional")}
            onMouseLeave={() => setHoveredWorld(null)}
            onClick={() => navigateTo("/professional", "Professional Repertoire")}
            whileHover={{ y: -8, rotate: -1 }}
            transition={{ duration: 0.3 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              transformOrigin: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 z-0"></div>

            {/* Mycelium-inspired background pattern - moved to bottom to avoid overlap */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/3 opacity-5 dark:opacity-10 z-0 overflow-hidden"
              aria-hidden="true"
            >
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                  d="M0,80 Q25,60 50,80 T100,80"
                  stroke="currentColor"
                  className="text-green-600"
                  fill="none"
                  strokeWidth="0.5"
                  animate={{
                    d: ["M0,80 Q25,60 50,80 T100,80", "M0,80 Q25,65 50,75 T100,80", "M0,80 Q25,60 50,80 T100,80"],
                  }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
                <motion.path
                  d="M0,90 Q25,70 50,90 T100,90"
                  stroke="currentColor"
                  className="text-green-600"
                  fill="none"
                  strokeWidth="0.5"
                  animate={{
                    d: ["M0,90 Q25,70 50,90 T100,90", "M0,90 Q25,75 50,85 T100,90", "M0,90 Q25,70 50,90 T100,90"],
                  }}
                  transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
                />
              </svg>
            </div>

            <div className="relative z-10 p-8 bg-white/90 dark:bg-gray-950/90 rounded-xl">
              <motion.div
                className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-6"
                whileHover={{ rotate: 15, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                aria-hidden="true"
              >
                <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
              </motion.div>
              <h2 className="text-2xl font-serif mb-4 text-green-800 dark:text-green-300">Professional Repertoire</h2>
              <p className="mb-8 text-gray-700 dark:text-gray-300">
                Explore my professional journey, tiny endeavors, and the mission musings that define my path to help
                heal our planet.
              </p>

              <div className="grid grid-cols-1 gap-4 mb-8">
                <motion.div
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateTo("/professional", "Me Until Now", "Me Until Now")
                  }}
                >
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                  <span>Me Until Now</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateTo("/professional", "Tiny Endeavors", "Tiny Endeavors")
                  }}
                >
                  <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                  <span>Tiny Endeavors</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateTo("/professional", "Mission Musings", "Mission Musings")
                  }}
                >
                  <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                  <span>Mission Musings</span>
                </motion.div>
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateTo("/professional", "Professional Repertoire")
                }}
                className="group bg-green-600 hover:bg-green-700 text-white overflow-hidden relative"
                aria-label="Enter Professional World section"
              >
                <span className="relative z-10 flex items-center">
                  Enter Professional World
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
                <motion.span
                  className="absolute inset-0 bg-green-500"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                  aria-hidden="true"
                />
              </Button>
            </div>
          </motion.div>

          {/* Personal World */}
          <motion.div
            className={`relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer ${
              hoveredWorld === "personal"
                ? "border-blue-400 shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
                : hoveredWorld === "professional"
                  ? "border-gray-200 dark:border-gray-800 opacity-80"
                  : "border-gray-200 dark:border-gray-800"
            } dynamic-frame`}
            onMouseEnter={() => setHoveredWorld("personal")}
            onMouseLeave={() => setHoveredWorld(null)}
            onClick={() => navigateTo("/personal", "Mind Wandering")}
            whileHover={{ y: -8, rotate: 1 }}
            transition={{ duration: 0.3 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              transformOrigin: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 z-0"></div>

            {/* Mycelium-inspired background pattern - moved to bottom to avoid overlap */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/3 opacity-5 dark:opacity-10 z-0 overflow-hidden"
              aria-hidden="true"
            >
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                  d="M0,80 Q25,100 50,80 T100,80"
                  stroke="currentColor"
                  className="text-blue-600"
                  fill="none"
                  strokeWidth="0.5"
                  animate={{
                    d: ["M0,80 Q25,100 50,80 T100,80", "M0,80 Q25,95 50,85 T100,80", "M0,80 Q25,100 50,80 T100,80"],
                  }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
                <motion.path
                  d="M0,90 Q25,110 50,90 T100,90"
                  stroke="currentColor"
                  className="text-blue-600"
                  fill="none"
                  strokeWidth="0.5"
                  animate={{
                    d: ["M0,90 Q25,110 50,90 T100,90", "M0,90 Q25,105 50,95 T100,90", "M0,90 Q25,110 50,90 T100,90"],
                  }}
                  transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
                />
              </svg>
            </div>

            <div className="relative z-10 p-8 bg-white/90 dark:bg-gray-950/90 rounded-xl">
              <motion.div
                className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-6"
                whileHover={{ rotate: -15, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                aria-hidden="true"
              >
                <Palette className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <h2 className="text-2xl font-serif mb-4 text-blue-800 dark:text-blue-300">Mind Wandering</h2>
              <p className="mb-8 text-gray-700 dark:text-gray-300">
                Discover my creative endeavors, imagery meanderings, and the story that continues to unfold in my
                imagination.
              </p>

              <div className="grid grid-cols-1 gap-4 mb-8">
                <motion.div
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-default transition-colors"
                  whileHover={{ x: 0 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span>Creative Endeavors</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-default transition-colors"
                  whileHover={{ x: 0 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span>Imagery Meanderings</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-default transition-colors"
                  whileHover={{ x: 0 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <PenTool className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span>The Story Is Being Written</span>
                </motion.div>
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateTo("/personal", "Mind Wandering")
                }}
                className="group bg-blue-600 hover:bg-blue-700 text-white overflow-hidden relative"
                aria-label="Enter Personal World section"
              >
                <span className="relative z-10 flex items-center">
                  Enter Personal World
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
                <motion.span
                  className="absolute inset-0 bg-blue-500"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                  aria-hidden="true"
                />
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
              <p className="text-gray-600 dark:text-gray-400">© 2025 Trudie Wang. All rights reserved.</p>
            </div>
            <motion.p
              className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center md:text-right font-serif italic"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              "Like mycelium connects all living things in nature, our stories connect us all in the web of humanity."
            </motion.p>
          </div>
        </div>
      </footer>
    </div>
  )
}
