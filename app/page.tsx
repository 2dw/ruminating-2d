"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Sparkles, Lightbulb, Camera, Palette, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccessibilityControls } from "@/components/accessibility-controls"
import { useAccessibility } from "@/contexts/accessibility-context"
import { StarryBackground } from "@/components/starry-background"
import { InteractiveConstellationPoint } from "@/components/interactive-constellation-point"
import { AnimatedConstellationPath } from "@/components/animated-constellation-path"
import { ConstellationInteractionHint } from "@/components/constellation-interaction-hint"
import { ConstellationParticles } from "@/components/constellation-particles"
import { constellationPaths } from "@/config/constellation-paths"

export default function PortalPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [hoveredWorld, setHoveredWorld] = useState<"professional" | "personal" | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { highContrast, announceToScreenReader } = useAccessibility()
  const constellationRef = useRef<HTMLDivElement>(null)
  const [constellationDimensions, setConstellationDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    // Get the dimensions of the constellation container for positioning
    if (constellationRef.current) {
      const updateDimensions = () => {
        const rect = constellationRef.current?.getBoundingClientRect()
        if (rect) {
          setConstellationDimensions({
            width: rect.width,
            height: rect.height,
          })
        }
      }

      updateDimensions()

      // Update dimensions on resize
      window.addEventListener("resize", updateDimensions)
      return () => window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const navigateTo = (path: string, worldName: string) => {
    announceToScreenReader(`Navigating to ${worldName}`)
    router.push(path)
  }

  return (
    <div
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

          {/* Interactive Origin Point */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <InteractiveConstellationPoint
              x={0}
              y={0}
              size={4}
              color="rgb(20, 184, 166)"
              glowColor="rgba(20, 184, 166, 0.7)"
              label="Origin"
              tooltipTitle="Origin"
              tooltipDescription="The starting point of my journey, where professional purpose and personal passion converge."
              tooltipPosition="top"
              delay={0}
            />
          </div>
        </div>

        {/* Mycelium-inspired connector - constellation-like forking trail */}
        <div className="relative my-8" ref={constellationRef} aria-hidden="true">
          {/* Constellation interaction hint */}
          <ConstellationInteractionHint show={true} />

          {/* Constellation Particles */}
          <ConstellationParticles paths={constellationPaths} />

          {/* SVG container for the constellation paths */}
          <svg
            className="absolute w-full h-40"
            viewBox="0 0 1000 160"
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            {/* Main vertical stem from title - extended to connect directly with title */}
            <AnimatedConstellationPath
              d="M500,-20 C500,0 500,20 500,40"
              stroke="rgb(20, 184, 166)"
              strokeWidth={1.5}
              strokeDasharray="3,3"
              fill="none"
              filter="drop-shadow(0 0 4px rgba(20, 184, 166, 0.7))"
              initialDelay={0}
              animationDuration={1.5}
              pathVariants={{
                d: ["M500,-20 C500,0 500,20 500,40", "M502,-20 C502,0 501,20 500,40", "M498,-20 C498,0 499,20 500,40"],
                duration: 8,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 3px rgba(20, 184, 166, 0.7))",
                  "drop-shadow(0 0 6px rgba(20, 184, 166, 0.9))",
                  "drop-shadow(0 0 3px rgba(20, 184, 166, 0.7))",
                ],
                duration: 8,
              }}
              id="path-origin-nexus"
            />

            {/* Horizontal connecting line */}
            <AnimatedConstellationPath
              d="M250,40 L750,40"
              stroke="rgb(20, 184, 166)"
              strokeWidth={1.5}
              strokeDasharray="3,3"
              fill="none"
              filter="drop-shadow(0 0 4px rgba(20, 184, 166, 0.7))"
              initialDelay={1}
              animationDuration={2}
              pathVariants={{
                d: ["M250,40 L750,40", "M250,42 L750,38", "M250,38 L750,42"],
                duration: 10,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 3px rgba(20, 184, 166, 0.7))",
                  "drop-shadow(0 0 6px rgba(20, 184, 166, 0.9))",
                  "drop-shadow(0 0 3px rgba(20, 184, 166, 0.7))",
                ],
                duration: 10,
              }}
              id="path-nexus-horizontal"
            />

            {/* Left branch - to Professional World */}
            <AnimatedConstellationPath
              d="M250,40 C250,60 230,100 200,160"
              stroke="rgb(74, 222, 128)"
              strokeWidth={1.5}
              strokeDasharray="3,3"
              fill="none"
              filter="drop-shadow(0 0 4px rgba(74, 222, 128, 0.7))"
              initialDelay={3}
              animationDuration={1.5}
              pathVariants={{
                d: [
                  "M250,40 C250,60 230,100 200,160",
                  "M250,40 C250,65 225,105 200,160",
                  "M250,40 C250,55 235,95 200,160",
                ],
                duration: 12,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 3px rgba(74, 222, 128, 0.7))",
                  "drop-shadow(0 0 6px rgba(74, 222, 128, 0.9))",
                  "drop-shadow(0 0 3px rgba(74, 222, 128, 0.7))",
                ],
                duration: 12,
              }}
              id="path-nexus-professional"
            />

            {/* Right branch - to Personal World */}
            <AnimatedConstellationPath
              d="M750,40 C750,60 770,100 800,160"
              stroke="rgb(56, 189, 248)"
              strokeWidth={1.5}
              strokeDasharray="3,3"
              fill="none"
              filter="drop-shadow(0 0 4px rgba(56, 189, 248, 0.7))"
              initialDelay={3}
              animationDuration={1.5}
              pathVariants={{
                d: [
                  "M750,40 C750,60 770,100 800,160",
                  "M750,40 C750,65 775,105 800,160",
                  "M750,40 C750,55 765,95 800,160",
                ],
                duration: 12,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 3px rgba(56, 189, 248, 0.7))",
                  "drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))",
                  "drop-shadow(0 0 3px rgba(56, 189, 248, 0.7))",
                ],
                duration: 12,
              }}
              id="path-nexus-personal"
            />

            {/* Connection between Growth and Purpose */}
            <AnimatedConstellationPath
              d="M350,40 C330,30 290,30 250,40"
              stroke="rgb(74, 222, 128)"
              strokeWidth={1.5}
              strokeDasharray="3,3"
              fill="none"
              filter="drop-shadow(0 0 4px rgba(74, 222, 128, 0.7))"
              initialDelay={4.5}
              animationDuration={1.2}
              pathVariants={{
                d: ["M350,40 C330,30 290,30 250,40", "M350,40 C330,32 290,32 250,40", "M350,40 C330,28 290,28 250,40"],
                duration: 8,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 3px rgba(74, 222, 128, 0.6))",
                  "drop-shadow(0 0 5px rgba(74, 222, 128, 0.8))",
                  "drop-shadow(0 0 3px rgba(74, 222, 128, 0.6))",
                ],
                duration: 8,
              }}
              id="path-growth-purpose"
            />

            {/* Connection between Creativity and Passion */}
            <AnimatedConstellationPath
              d="M650,40 C670,30 710,30 750,40"
              stroke="rgb(56, 189, 248)"
              strokeWidth={1.5}
              strokeDasharray="3,3"
              fill="none"
              filter="drop-shadow(0 0 4px rgba(56, 189, 248, 0.7))"
              initialDelay={4.5}
              animationDuration={1.2}
              pathVariants={{
                d: ["M650,40 C670,30 710,30 750,40", "M650,40 C670,32 710,32 750,40", "M650,40 C670,28 710,28 750,40"],
                duration: 8,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 3px rgba(56, 189, 248, 0.6))",
                  "drop-shadow(0 0 5px rgba(56, 189, 248, 0.8))",
                  "drop-shadow(0 0 3px rgba(56, 189, 248, 0.6))",
                ],
                duration: 8,
              }}
              id="path-creativity-passion"
            />

            {/* Diagonal connection from Nexus to Purpose */}
            <AnimatedConstellationPath
              d="M500,40 C450,30 350,30 250,40"
              stroke="rgb(20, 184, 166)"
              strokeWidth={1}
              strokeDasharray="2,4"
              fill="none"
              filter="drop-shadow(0 0 3px rgba(20, 184, 166, 0.6))"
              initialDelay={6}
              animationDuration={1.8}
              pathVariants={{
                d: ["M500,40 C450,30 350,30 250,40", "M500,40 C450,32 350,32 250,40", "M500,40 C450,28 350,28 250,40"],
                duration: 10,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 2px rgba(20, 184, 166, 0.5))",
                  "drop-shadow(0 0 4px rgba(20, 184, 166, 0.7))",
                  "drop-shadow(0 0 2px rgba(20, 184, 166, 0.5))",
                ],
                duration: 10,
              }}
              id="path-nexus-purpose"
            />

            {/* Diagonal connection from Nexus to Passion */}
            <AnimatedConstellationPath
              d="M500,40 C550,30 650,30 750,40"
              stroke="rgb(20, 184, 166)"
              strokeWidth={1}
              strokeDasharray="2,4"
              fill="none"
              filter="drop-shadow(0 0 3px rgba(20, 184, 166, 0.6))"
              initialDelay={6}
              animationDuration={1.8}
              pathVariants={{
                d: ["M500,40 C550,30 650,30 750,40", "M500,40 C550,32 650,32 750,40", "M500,40 C550,28 650,28 750,40"],
                duration: 10,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 2px rgba(20, 184, 166, 0.5))",
                  "drop-shadow(0 0 4px rgba(20, 184, 166, 0.7))",
                  "drop-shadow(0 0 2px rgba(20, 184, 166, 0.5))",
                ],
                duration: 10,
              }}
              id="path-nexus-passion"
            />

            {/* Connection from Purpose to Professional */}
            <AnimatedConstellationPath
              d="M250,40 C240,80 220,120 200,160"
              stroke="rgb(74, 222, 128)"
              strokeWidth={1.5}
              strokeDasharray="3,3"
              fill="none"
              filter="drop-shadow(0 0 4px rgba(74, 222, 128, 0.7))"
              initialDelay={7.5}
              animationDuration={1.5}
              pathVariants={{
                d: [
                  "M250,40 C240,80 220,120 200,160",
                  "M250,40 C245,80 225,120 200,160",
                  "M250,40 C235,80 215,120 200,160",
                ],
                duration: 12,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 3px rgba(74, 222, 128, 0.6))",
                  "drop-shadow(0 0 5px rgba(74, 222, 128, 0.8))",
                  "drop-shadow(0 0 3px rgba(74, 222, 128, 0.6))",
                ],
                duration: 12,
              }}
              id="path-purpose-professional"
            />

            {/* Connection from Passion to Personal */}
            <AnimatedConstellationPath
              d="M750,40 C760,80 780,120 800,160"
              stroke="rgb(56, 189, 248)"
              strokeWidth={1.5}
              strokeDasharray="3,3"
              fill="none"
              filter="drop-shadow(0 0 4px rgba(56, 189, 248, 0.7))"
              initialDelay={7.5}
              animationDuration={1.5}
              pathVariants={{
                d: [
                  "M750,40 C760,80 780,120 800,160",
                  "M750,40 C755,80 775,120 800,160",
                  "M750,40 C765,80 785,120 800,160",
                ],
                duration: 12,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 3px rgba(56, 189, 248, 0.6))",
                  "drop-shadow(0 0 5px rgba(56, 189, 248, 0.8))",
                  "drop-shadow(0 0 3px rgba(56, 189, 248, 0.6))",
                ],
                duration: 12,
              }}
              id="path-passion-personal"
            />

            {/* Cross-connection from Growth to Personal (showing unexpected connections) */}
            <AnimatedConstellationPath
              d="M350,40 C450,100 650,120 800,160"
              stroke="rgb(125, 211, 252)"
              strokeWidth={1}
              strokeDasharray="2,5"
              fill="none"
              filter="drop-shadow(0 0 3px rgba(125, 211, 252, 0.5))"
              initialDelay={9}
              animationDuration={2}
              pathVariants={{
                d: [
                  "M350,40 C450,100 650,120 800,160",
                  "M350,40 C450,105 650,125 800,160",
                  "M350,40 C450,95 650,115 800,160",
                ],
                duration: 15,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 2px rgba(125, 211, 252, 0.4))",
                  "drop-shadow(0 0 4px rgba(125, 211, 252, 0.6))",
                  "drop-shadow(0 0 2px rgba(125, 211, 252, 0.4))",
                ],
                duration: 15,
              }}
              id="path-growth-personal"
            />

            {/* Cross-connection from Creativity to Professional (showing unexpected connections) */}
            <AnimatedConstellationPath
              d="M650,40 C550,100 350,120 200,160"
              stroke="rgb(134, 239, 172)"
              strokeWidth={1}
              strokeDasharray="2,5"
              fill="none"
              filter="drop-shadow(0 0 3px rgba(134, 239, 172, 0.5))"
              initialDelay={9}
              animationDuration={2}
              pathVariants={{
                d: [
                  "M650,40 C550,100 350,120 200,160",
                  "M650,40 C550,105 350,125 200,160",
                  "M650,40 C550,95 350,115 200,160",
                ],
                duration: 15,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 2px rgba(134, 239, 172, 0.4))",
                  "drop-shadow(0 0 4px rgba(134, 239, 172, 0.6))",
                  "drop-shadow(0 0 2px rgba(134, 239, 172, 0.4))",
                ],
                duration: 15,
              }}
              id="path-creativity-professional"
            />

            {/* Connection from Origin to Nexus */}
            <AnimatedConstellationPath
              d="M500,-20 C500,0 500,20 500,40"
              stroke="rgb(20, 184, 166)"
              strokeWidth={1.5}
              strokeDasharray="3,3"
              fill="none"
              filter="drop-shadow(0 0 4px rgba(20, 184, 166, 0.7))"
              initialDelay={0}
              animationDuration={1.5}
              pathVariants={{
                d: ["M500,-20 C500,0 500,20 500,40", "M502,-20 C502,0 501,20 500,40", "M498,-20 C498,0 499,20 500,40"],
                duration: 8,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 3px rgba(20, 184, 166, 0.7))",
                  "drop-shadow(0 0 6px rgba(20, 184, 166, 0.9))",
                  "drop-shadow(0 0 3px rgba(20, 184, 166, 0.7))",
                ],
                duration: 8,
              }}
              id="path-origin-nexus-2"
            />

            {/* Subtle connection between Professional and Personal worlds */}
            <AnimatedConstellationPath
              d="M200,160 C350,200 650,200 800,160"
              stroke="rgb(139, 92, 246)"
              strokeWidth={1}
              strokeDasharray="1,6"
              fill="none"
              filter="drop-shadow(0 0 3px rgba(139, 92, 246, 0.5))"
              initialDelay={10.5}
              animationDuration={2.5}
              pathVariants={{
                d: [
                  "M200,160 C350,200 650,200 800,160",
                  "M200,160 C350,205 650,205 800,160",
                  "M200,160 C350,195 650,195 800,160",
                ],
                duration: 20,
              }}
              filterVariants={{
                filter: [
                  "drop-shadow(0 0 2px rgba(139, 92, 246, 0.4))",
                  "drop-shadow(0 0 4px rgba(139, 92, 246, 0.6))",
                  "drop-shadow(0 0 2px rgba(139, 92, 246, 0.4))",
                ],
                duration: 20,
              }}
              id="path-professional-personal"
            />
          </svg>

          {/* Interactive Constellation Points */}
          {constellationDimensions.width > 0 && (
            <>
              {/* Nexus Point */}
              <InteractiveConstellationPoint
                x={constellationDimensions.width / 2}
                y={40}
                size={3}
                color="rgb(20, 184, 166)"
                glowColor="rgba(20, 184, 166, 0.9)"
                label="Nexus"
                tooltipTitle="Nexus"
                tooltipDescription="The central connection point where professional and personal worlds meet, creating a unified vision."
                tooltipPosition="top"
                delay={1.5}
                initialAnimation={true}
              />

              {/* Growth Point */}
              <InteractiveConstellationPoint
                x={constellationDimensions.width * 0.35}
                y={40}
                size={2}
                color="rgb(74, 222, 128)"
                glowColor="rgba(74, 222, 128, 0.8)"
                label="Growth"
                tooltipTitle="Growth"
                tooltipDescription="The continuous development of skills and knowledge that shapes my professional identity."
                tooltipPosition="top"
                delay={4}
                initialAnimation={true}
              />

              {/* Creativity Point */}
              <InteractiveConstellationPoint
                x={constellationDimensions.width * 0.65}
                y={40}
                size={2}
                color="rgb(56, 189, 248)"
                glowColor="rgba(56, 189, 248, 0.8)"
                label="Creativity"
                tooltipTitle="Creativity"
                tooltipDescription="The wellspring of imagination and innovation that fuels my personal projects and artistic expression."
                tooltipPosition="top"
                delay={4}
                initialAnimation={true}
              />

              {/* Purpose Point */}
              <InteractiveConstellationPoint
                x={constellationDimensions.width * 0.25}
                y={40}
                size={3}
                color="rgb(74, 222, 128)"
                glowColor="rgba(74, 222, 128, 0.8)"
                label="Purpose"
                tooltipTitle="Purpose"
                tooltipDescription="My mission to create energy systems that heal our planet while ensuring equitable access for all communities."
                tooltipPosition="bottom"
                delay={5}
                initialAnimation={true}
              />

              {/* Passion Point */}
              <InteractiveConstellationPoint
                x={constellationDimensions.width * 0.75}
                y={40}
                size={3}
                color="rgb(56, 189, 248)"
                glowColor="rgba(56, 189, 248, 0.8)"
                label="Passion"
                tooltipTitle="Passion"
                tooltipDescription="The creative drive that inspires my artistic endeavors, writing, and exploration of interconnected natural systems."
                tooltipPosition="bottom"
                delay={5}
                initialAnimation={true}
              />

              {/* Professional Destination */}
              <InteractiveConstellationPoint
                x={constellationDimensions.width * 0.2}
                y={160}
                size={3}
                color="rgb(74, 222, 128)"
                glowColor="rgba(74, 222, 128, 0.9)"
                label="Professional"
                tooltipTitle="Professional Repertoire"
                tooltipDescription="My engineering work, research, and advocacy for equitable energy solutions and sustainable systems."
                tooltipPosition="left"
                delay={7}
                initialAnimation={true}
              />

              {/* Personal Destination */}
              <InteractiveConstellationPoint
                x={constellationDimensions.width * 0.8}
                y={160}
                size={3}
                color="rgb(56, 189, 248)"
                glowColor="rgba(56, 189, 248, 0.9)"
                label="Personal"
                tooltipTitle="Mind Wandering"
                tooltipDescription="My creative pursuits, artistic expression, and ongoing narrative explorations of interconnectedness."
                tooltipPosition="right"
                delay={7}
                initialAnimation={true}
              />
            </>
          )}
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
                    navigateTo("/professional", "Me Until Now")
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
                    navigateTo("/professional", "Tiny Endeavors")
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
                    navigateTo("/professional", "Mission Musings")
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
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateTo("/personal", "Creative Endeavors")
                  }}
                >
                  <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span>Creative Endeavors</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateTo("/personal", "Imagery Meanderings")
                  }}
                >
                  <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span>Imagery Meanderings</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateTo("/personal", "The Story Is Being Written")
                  }}
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
