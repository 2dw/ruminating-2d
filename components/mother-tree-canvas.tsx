"use client"

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

// ── Seeded PRNG (deterministic) ─────────────────────────────────────────────
let _seed = 777
function srng() {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff
  return (_seed >>> 0) / 0xffffffff
}
function resetSeed() { _seed = 777 }

// ── Types ───────────────────────────────────────────────────────────────────
interface Star { x: number; y: number; r: number; baseAlpha: number; phase: number }
interface Root { points: [number, number][]; depth: number }
interface TreeBranch { x1: number; y1: number; x2: number; y2: number; thickness: number; depth: number }

interface MotherTreeCanvasProps {
  summary: ReactNode
  className?: string
}

// ── Layout constants (percentages of canvas) ─────────────────────────────────
const CONSTELLATION_ZONE = [0, 0.42]    // top 42%
const TRUNK_ZONE = [0.38, 0.62]        // center ~24%
const ROOT_ZONE = [0.58, 1.0]          // bottom 42%

// ── Color palette ───────────────────────────────────────────────────────────
const COLORS = {
  dark: {
    starFill: "rgba(148, 163, 184, VAR)",
    starGlow: "rgba(96, 165, 250, VAR)",
    lineStroke: "rgba(96, 165, 250, VAR)",
    trunkStroke: "rgba(34, 197, 94, VAR)",
    trunkFill: "rgba(34, 197, 94, VAR)",
    rootStroke: ["rgba(21,128,61,VAR)", "rgba(22,163,74,VAR)", "rgba(34,197,94,VAR)", "rgba(74,222,128,VAR)", "rgba(134,239,172,VAR)"],
    rootNode: "rgba(34, 197, 94, VAR)",
    bg: "transparent",
  },
  light: {
    starFill: "rgba(71, 85, 105, VAR)",
    starGlow: "rgba(34, 197, 94, VAR)",
    lineStroke: "rgba(34, 197, 94, VAR)",
    trunkStroke: "rgba(20, 83, 45, VAR)",
    trunkFill: "rgba(20, 83, 45, VAR)",
    rootStroke: ["rgba(20,83,45,VAR)", "rgba(21,128,61,VAR)", "rgba(22,163,74,VAR)", "rgba(34,197,94,VAR)", "rgba(74,222,128,VAR)"],
    rootNode: "rgba(20, 83, 45, VAR)",
    bg: "transparent",
  },
}

// ── Generators ──────────────────────────────────────────────────────────────
function generateStars(w: number, h: number, count: number): Star[] {
  resetSeed()
  const stars: Star[] = []
  const zoneTop = CONSTELLATION_ZONE[0] * h
  const zoneBot = CONSTELLATION_ZONE[1] * h
  for (let i = 0; i < count; i++) {
    stars.push({
      x: srng() * w,
      y: zoneTop + srng() * (zoneBot - zoneTop),
      r: 0.8 + srng() * 2.2,
      baseAlpha: 0.3 + srng() * 0.5,
      phase: srng() * Math.PI * 2,
    })
  }
  return stars
}

function generateConnections(stars: Star[], maxDist: number, count: number): [number, number][] {
  resetSeed()
  const conns: [number, number][] = []
  for (let i = 0; i < stars.length && conns.length < count; i++) {
    for (let j = i + 1; j < stars.length && conns.length < count; j++) {
      const dx = stars[i].x - stars[j].x
      const dy = stars[i].y - stars[j].y
      if (Math.sqrt(dx * dx + dy * dy) < maxDist && srng() < 0.35) {
        conns.push([i, j])
      }
    }
  }
  return conns
}

function generateTree(w: number, h: number): TreeBranch[] {
  resetSeed()
  const branches: TreeBranch[] = []
  const cx = w / 2
  const trunkTop = TRUNK_ZONE[0] * h
  const trunkBot = TRUNK_ZONE[1] * h
  const trunkH = trunkBot - trunkTop

  function grow(x: number, y: number, angle: number, len: number, thick: number, depth: number) {
    if (depth > 5 || len < 4) return
    const x2 = x + Math.cos(angle) * len
    const y2 = y + Math.sin(angle) * len
    branches.push({ x1: x, y1: y, x2, y2, thickness: thick, depth })
    const spread = 0.35 + srng() * 0.3
    const shrink = 0.65 + srng() * 0.1
    if (srng() < 0.7) {
      grow(x2, y2, angle - spread, len * shrink, thick * 0.7, depth + 1)
      grow(x2, y2, angle + spread, len * shrink, thick * 0.7, depth + 1)
    } else {
      grow(x2, y2, angle + (srng() - 0.5) * 0.3, len * 0.8, thick * 0.8, depth + 1)
    }
  }

  // Main trunk
  const trunkBase = cx + (srng() - 0.5) * w * 0.04
  const trunkTopX = cx + (srng() - 0.5) * w * 0.02
  branches.push({ x1: trunkBase, y1: trunkBot, x2: trunkTopX, y2: trunkTop + trunkH * 0.35, thickness: 5, depth: 0 })

  // Crown branches
  const crownY = trunkTop + trunkH * 0.35
  const crownSpread = w * 0.12
  grow(trunkTopX - crownSpread * 0.3, crownY, -Math.PI / 2 - 0.4, trunkH * 0.22, 3, 1)
  grow(trunkTopX + crownSpread * 0.3, crownY, -Math.PI / 2 + 0.4, trunkH * 0.22, 3, 1)
  grow(trunkTopX, crownY - trunkH * 0.05, -Math.PI / 2, trunkH * 0.25, 3.5, 1)

  // Lower branches
  const midY = trunkBot - trunkH * 0.15
  grow(trunkBase - 2, midY, -Math.PI / 2 - 0.7, trunkH * 0.15, 2.5, 2)
  grow(trunkBase + 2, midY, -Math.PI / 2 + 0.7, trunkH * 0.15, 2.5, 2)

  return branches
}

function generateRoots(w: number, h: number): Root[] {
  resetSeed()
  const roots: Root[] = []
  const origins = [0.35, 0.42, 0.5, 0.58, 0.65]
  const rootTop = ROOT_ZONE[0] * h
  const rootBot = ROOT_ZONE[1] * h

  function grow(x: number, y: number, angle: number, depth: number, path: [number, number][]) {
    if (depth > 5 || y > rootBot || x < -20 || x > w + 20) return
    const len = (15 + srng() * 25) * (1 - depth * 0.12)
    const nx = x + Math.cos(angle) * len
    const ny = y + Math.sin(angle) * len * 1.3
    path.push([nx, ny])
    roots.push({ points: [...path], depth })
    const spread = 0.3 + srng() * 0.35
    if (srng() < 0.65) {
      grow(nx, ny, angle - spread, depth + 1, [...path])
      grow(nx, ny, angle + spread, depth + 1, [...path])
    } else {
      grow(nx, ny, angle + (srng() - 0.5) * 0.25, depth + 1, [...path])
    }
  }

  origins.forEach((ox) => {
    const startX = ox * w
    grow(startX, rootTop, Math.PI / 2 + (srng() - 0.5) * 0.5, 0, [[startX, rootTop]])
  })

  return roots
}

// ── Component ───────────────────────────────────────────────────────────────
export function MotherTreeCanvas({ summary, className }: MotherTreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>(0)
  const dataRef = useRef<{
    stars: Star[]; connections: [number, number][]
    branches: TreeBranch[]; roots: Root[]
    w: number; h: number
  } | null>(null)
  const [hovered, setHovered] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Detect dark mode
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  // Generate data on resize
  const regenerate = useCallback((w: number, h: number) => {
    const isMobile = w < 640
    const starCount = isMobile ? 30 : 60
    const connCount = isMobile ? 15 : 30
    const stars = generateStars(w, h, starCount)
    const connections = generateConnections(stars, w * 0.15, connCount)
    const branches = generateTree(w, h)
    const roots = generateRoots(w, h)
    dataRef.current = { stars, connections, branches, roots, w, h }
  }, [])

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let running = true

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const w = rect.width
      const h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      regenerate(w, h)
    }

    resize()
    window.addEventListener("resize", resize)

    const palette = isDark ? COLORS.dark : COLORS.light
    const alpha = (rgba: string, a: number) => rgba.replace("VAR", String(a))

    let t = 0
    const draw = () => {
      if (!running || !dataRef.current) return
      const { stars, connections, branches, roots, w, h } = dataRef.current
      t += 0.015

      ctx.clearRect(0, 0, w, h)

      // ── Constellation lines ──
      connections.forEach(([i, j]) => {
        const a = stars[i], b = stars[j]
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = alpha(palette.lineStroke, 0.12)
        ctx.lineWidth = 0.5
        ctx.setLineDash([3, 4])
        ctx.stroke()
        ctx.setLineDash([])
      })

      // ── Stars ──
      stars.forEach((s) => {
        const flicker = 0.6 + 0.4 * Math.sin(t * 1.2 + s.phase)
        const a = s.baseAlpha * flicker
        // glow
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = alpha(palette.starGlow, a * 0.15)
        ctx.fill()
        // core
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = alpha(palette.starFill, a)
        ctx.fill()
      })

      // ── Tree trunk + branches ──
      branches.forEach((b) => {
        ctx.beginPath()
        ctx.moveTo(b.x1, b.y1)
        ctx.lineTo(b.x2, b.y2)
        const a = Math.max(0.3, 1 - b.depth * 0.15)
        ctx.strokeStyle = alpha(palette.trunkStroke, a)
        ctx.lineWidth = Math.max(0.5, b.thickness)
        ctx.lineCap = "round"
        ctx.stroke()
      })

      // ── Mycelium roots ──
      roots.forEach((r) => {
        if (r.points.length < 2) return
        const colorIdx = Math.min(r.depth, palette.rootStroke.length - 1)
        const a = Math.max(0.25, 1 - r.depth * 0.15)
        ctx.beginPath()
        ctx.moveTo(r.points[0][0], r.points[0][1])
        for (let i = 1; i < r.points.length; i++) {
          const prev = r.points[i - 1]
          const curr = r.points[i]
          const mx = (prev[0] + curr[0]) / 2 + (srng() - 0.5) * 6
          const my = (prev[1] + curr[1]) / 2
          ctx.quadraticCurveTo(prev[0], prev[1], mx, my)
        }
        const last = r.points[r.points.length - 1]
        ctx.lineTo(last[0], last[1])
        ctx.strokeStyle = alpha(palette.rootStroke[colorIdx], a)
        ctx.lineWidth = Math.max(0.4, 1.5 - r.depth * 0.25)
        ctx.lineCap = "round"
        ctx.stroke()

        // root tip glow
        if (r.depth >= 3) {
          ctx.beginPath()
          ctx.arc(last[0], last[1], 1.5, 0, Math.PI * 2)
          ctx.fillStyle = alpha(palette.rootNode, a * 0.6)
          ctx.fill()
        }
      })

      // ── Root node highlights at trunk base ──
      const rootTop = ROOT_ZONE[0] * h
      const cx = w / 2
      ;[0.35, 0.42, 0.5, 0.58, 0.65].forEach((ox) => {
        ctx.beginPath()
        ctx.arc(ox * w, rootTop, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = alpha(palette.rootNode, 0.7)
        ctx.fill()
      })

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)

    return () => {
      running = false
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [isDark, regenerate])

  // Determine hover zone (center trunk area)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const yNorm = (e.clientY - rect.top) / rect.height
    setHovered(yNorm >= TRUNK_ZONE[0] - 0.05 && yNorm <= TRUNK_ZONE[1] + 0.05)
  }, [])

  const handleMouseLeave = useCallback(() => setHovered(false), [])

  // Mobile tap
  const handleTap = useCallback(() => {
    if (window.innerWidth < 640) setHovered((h) => !h)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      style={{ height: "clamp(280px, 40vw, 420px)" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleTap}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Mobile tap hint */}
      {!hovered && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 sm:hidden">
          <span className="rounded-full bg-slate-800/60 px-3 py-1 text-[10px] text-slate-300/70 backdrop-blur-sm">
            tap the tree to read
          </span>
        </div>
      )}

      {/* Mission summary overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <div className="mx-4 max-w-2xl rounded-2xl border border-green-500/20 bg-slate-900/70 px-6 py-5 backdrop-blur-md sm:mx-8 sm:px-10 sm:py-8 dark:border-green-400/15 dark:bg-slate-950/60">
              {summary}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
