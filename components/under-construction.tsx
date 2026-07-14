"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"

interface UnderConstructionProps {
  quote?: string
  author?: string
  className?: string
}

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }))
}

function generateShootingStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: Math.random() * 60 + 20,
    startY: Math.random() * 30,
    angle: Math.random() * 30 + 15,
    delay: Math.random() * 8 + i * 4,
    duration: Math.random() * 1.5 + 1,
  }))
}

const myceliumPath = [
  { x: 15, y: 85 },
  { x: 18, y: 78 },
  { x: 22, y: 72 },
  { x: 20, y: 65 },
  { x: 25, y: 58 },
  { x: 28, y: 52 },
  { x: 24, y: 45 },
  { x: 30, y: 40 },
  { x: 35, y: 35 },
  { x: 32, y: 28 },
  { x: 38, y: 22 },
  { x: 42, y: 18 },
  { x: 48, y: 20 },
  { x: 55, y: 18 },
  { x: 60, y: 22 },
  { x: 65, y: 28 },
  { x: 68, y: 35 },
  { x: 72, y: 42 },
  { x: 75, y: 50 },
  { x: 78, y: 58 },
  { x: 82, y: 65 },
  { x: 85, y: 72 },
  { x: 88, y: 80 },
  { x: 90, y: 88 },
]

const branches = [
  [{ x: 25, y: 58 }, { x: 18, y: 55 }, { x: 12, y: 50 }, { x: 8, y: 45 }],
  [{ x: 35, y: 35 }, { x: 40, y: 30 }, { x: 48, y: 28 }],
  [{ x: 65, y: 28 }, { x: 70, y: 22 }, { x: 78, y: 18 }, { x: 85, y: 15 }],
  [{ x: 75, y: 50 }, { x: 82, y: 48 }, { x: 88, y: 42 }],
  [{ x: 55, y: 18 }, { x: 52, y: 12 }, { x: 48, y: 8 }],
  [{ x: 30, y: 40 }, { x: 22, y: 38 }, { x: 15, y: 42 }],
]

const mushroomPositions = [
  { pathIdx: 2, offset: -3, size: 0.9, appearAt: 2 },
  { pathIdx: 5, offset: 3, size: 0.75, appearAt: 5 },
  { pathIdx: 8, offset: -2.5, size: 1, appearAt: 8 },
  { pathIdx: 11, offset: 2, size: 0.85, appearAt: 11 },
  { pathIdx: 15, offset: -2, size: 0.95, appearAt: 15 },
  { pathIdx: 19, offset: 3, size: 0.8, appearAt: 19 },
  { pathIdx: 22, offset: -2, size: 0.7, appearAt: 22 },
]

function Mushroom({ cx, cy, size, mounted, isDark }: {
  cx: number; cy: number; size: number; mounted: boolean; isDark: boolean
}) {
  const stemColor = isDark ? "#e8dcc8" : "#8b7355"
  const capColor = isDark ? "#c44d56" : "#a0303a"
  const spotColor = "#f5e6d3"

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={mounted ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: "backOut" }}
    >
      <g transform={`translate(${cx}, ${cy}) scale(${size * 0.3})`}>
        <rect x="-2" y="-10" width="4" height="12" rx="2" fill={stemColor} />
        <ellipse cx="0" cy="-12" rx="8" ry="5.5" fill={capColor} />
        <circle cx="-3" cy="-13" r="1.8" fill={spotColor} opacity="0.85" />
        <circle cx="2.5" cy="-10.5" r="1.4" fill={spotColor} opacity="0.85" />
        <circle cx="0.5" cy="-15" r="1.2" fill={spotColor} opacity="0.85" />
      </g>
    </motion.g>
  )
}

export function UnderConstruction({
  quote = "Not all those who wander are lost",
  author = "J.R.R. Tolkien",
  className = "",
}: UnderConstructionProps) {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [pathProgress, setPathProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const stars = useMemo(() => generateStars(120), [])
  const shootingStars = useMemo(() => generateShootingStars(3), [])

  // Detect dark mode from DOM
  const detectDark = useCallback(() => {
    if (typeof document === "undefined") return false
    const html = document.documentElement
    return (
      html.classList.contains("dark") ||
      html.getAttribute("data-theme") === "dark" ||
      html.getAttribute("style")?.includes("color-scheme: dark") === true
    )
  }, [])

  useEffect(() => {
    setIsDark(detectDark())
    setMounted(true)

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(detectDark())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    })
    return () => observer.disconnect()
  }, [detectDark])

  // Path growth for mushroom timing
  useEffect(() => {
    if (!mounted) return
    const totalNodes = myceliumPath.length
    const interval = setInterval(() => {
      setPathProgress((prev) => {
        if (prev >= totalNodes) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 300)
    return () => clearInterval(interval)
  }, [mounted])

  const bgColor = isDark
    ? "bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a0f1a]"
    : "bg-gradient-to-b from-[#e8f0f8] via-[#f0f4f8] to-[#e8f0f8]"
  const borderColor = isDark ? "border-slate-700/50" : "border-slate-200"
  const pathColor = isDark ? "rgba(147, 197, 253, 0.25)" : "rgba(100, 116, 139, 0.3)"
  const nodeColor = isDark ? "#93c5fd" : "#64748b"
  const starColor = isDark ? "bg-white" : "bg-slate-500"
  const textColor = isDark ? "text-white" : "text-slate-800"
  const authorColor = isDark ? "text-blue-300/60" : "text-slate-500"
  const badgeBorder = isDark ? "border-blue-400/20" : "border-slate-300"
  const badgeBg = isDark ? "bg-blue-500/10" : "bg-slate-100"
  const badgeText = isDark ? "text-blue-300/70" : "text-slate-500"
  const dotColor = isDark ? "bg-blue-400" : "bg-slate-400"
  const quoteGlow = isDark
    ? "0 0 30px rgba(147, 197, 253, 0.6), 0 0 60px rgba(147, 197, 253, 0.3), 0 0 90px rgba(147, 197, 253, 0.15)"
    : "0 0 20px rgba(100, 116, 139, 0.4), 0 0 40px rgba(100, 116, 139, 0.25), 0 0 60px rgba(100, 116, 139, 0.1)"

  return (
    <div
      ref={containerRef}
      className={`relative min-h-[500px] overflow-hidden rounded-3xl border ${borderColor} ${bgColor} ${className}`}
    >
      {/* Stars */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className={`absolute rounded-full ${starColor}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* North Star */}
      <motion.div
        className="absolute"
        style={{ left: "50%", top: "12%", transform: "translate(-50%, -50%)" }}
        animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative">
          <div
            className={`h-3 w-3 rounded-full ${
              isDark
                ? "bg-yellow-200 shadow-[0_0_15px_5px_rgba(253,224,71,0.4)]"
                : "bg-amber-500 shadow-[0_0_12px_4px_rgba(245,158,11,0.3)]"
            }`}
          />
          <div
            className={`absolute inset-0 h-3 w-3 animate-ping rounded-full opacity-30 ${
              isDark ? "bg-yellow-200" : "bg-amber-400"
            }`}
          />
        </div>
      </motion.div>

      {/* Mycelium network */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {myceliumPath.slice(0, -1).map((point, i) => {
          const next = myceliumPath[i + 1]
          return (
            <motion.line
              key={`main-${i}`}
              x1={point.x} y1={point.y} x2={next.x} y2={next.y}
              stroke={pathColor} strokeWidth="0.25" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={mounted ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 2, delay: i * 0.3, ease: "easeOut" }}
            />
          )
        })}

        {branches.map((branch, bi) =>
          branch.slice(0, -1).map((point, i) => {
            const next = branch[i + 1]
            return (
              <motion.line
                key={`branch-${bi}-${i}`}
                x1={point.x} y1={point.y} x2={next.x} y2={next.y}
                stroke={pathColor} strokeWidth="0.15" strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={mounted ? { pathLength: 1, opacity: 0.7 } : {}}
                transition={{ duration: 1.5, delay: 3 + bi * 1.5 + i * 0.4, ease: "easeOut" }}
              />
            )
          })
        )}

        {myceliumPath.map((point, i) => (
          <motion.circle
            key={`node-${i}`} cx={point.x} cy={point.y} r="0.5" fill={nodeColor}
            initial={{ opacity: 0, scale: 0 }}
            animate={mounted ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: i * 0.3 + 0.5 }}
          />
        ))}

        {branches.map((branch, bi) => {
          const tip = branch[branch.length - 1]
          return (
            <motion.circle
              key={`tip-${bi}`} cx={tip.x} cy={tip.y} r="0.35" fill={nodeColor}
              initial={{ opacity: 0, scale: 0 }}
              animate={mounted ? { opacity: 0.7, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 3 + bi * 1.5 + (branch.length - 1) * 0.4 + 0.5 }}
            />
          )
        })}

        {mushroomPositions.map((m, i) => {
          const pt = myceliumPath[m.pathIdx]
          if (!pt) return null
          return (
            <Mushroom
              key={`mush-${i}`} cx={pt.x + m.offset} cy={pt.y}
              size={m.size} mounted={pathProgress >= m.appearAt} isDark={isDark}
            />
          )
        })}
      </svg>

      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <motion.div
          key={`shooting-${star.id}`}
          className="absolute h-0.5 w-16 origin-left"
          style={{
            left: `${star.startX}%`, top: `${star.startY}%`,
            transform: `rotate(${star.angle}deg)`,
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={mounted
            ? { opacity: [0, 1, 1, 0], scaleX: [0, 1, 1, 0], x: [0, 100, 200] }
            : {}
          }
          transition={{
            duration: star.duration, delay: star.delay,
            repeat: Infinity, repeatDelay: 7, ease: "easeOut",
          }}
        >
          <div
            className={`h-full w-full rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.3)] ${
              isDark
                ? "bg-gradient-to-r from-transparent via-white to-transparent"
                : "bg-gradient-to-r from-transparent via-slate-400 to-transparent"
            }`}
          />
        </motion.div>
      ))}

      {/* Quote content */}
      <div className="relative z-10 flex min-h-[500px] flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 1 }}
        >
          <p
            className={`font-serif text-2xl italic leading-relaxed md:text-3xl lg:text-4xl ${textColor}`}
            style={{ textShadow: quoteGlow }}
          >
            {quote}
          </p>
          <p className={`mt-4 text-sm tracking-widest uppercase ${authorColor}`}>
            &mdash; {author}
          </p>
        </motion.div>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 2.5 }}
        >
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wider uppercase ${badgeBorder} ${badgeBg} ${badgeText}`}
          >
            <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${dotColor}`} />
            Under Construction
          </span>
        </motion.div>
      </div>
    </div>
  )
}
