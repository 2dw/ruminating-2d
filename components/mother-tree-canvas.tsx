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
interface LeafCluster {
  cx: number; cy: number; radius: number
  label: string; href: string; icon: string
  leaves: { x: number; y: number; r: number; phase: number }[]
}
interface EnergyParticle {
  x: number; y: number; speed: number; size: number; alpha: number; phase: number
}

interface MotherTreeCanvasProps {
  summary: ReactNode
  className?: string
}

// ── Layout zones (percentages of canvas height) ─────────────────────────────
const CANOPY_ZONE = [0, 0.50]
const TRUNK_ZONE = [0.40, 0.65]
const ROOT_ZONE  = [0.60, 1.0]

// ── Tier leaf clusters (positioned in canopy) ───────────────────────────────
const LEAF_CLUSTERS: Omit<LeafCluster, "cx" | "cy" | "leaves">[] = [
  { radius: 55, label: "Thought Pieces", href: "#thought-pieces", icon: "\u2606" },
  { radius: 60, label: "Deep Dives",     href: "#deep-dives",     icon: "\u26A1" },
  { radius: 50, label: "Whitepapers",    href: "#whitepapers",    icon: "\u2605" },
]

// ── Color palette ───────────────────────────────────────────────────────────
const COLORS = {
  dark: {
    starFill: "rgba(148, 163, 184, VAR)",
    starGlow: "rgba(96, 165, 250, VAR)",
    lineStroke: "rgba(96, 165, 250, VAR)",
    trunkStroke: "rgba(34, 197, 94, VAR)",
    leafGlow: "rgba(74, 222, 128, VAR)",
    leafFill: "rgba(34, 197, 94, VAR)",
    leafRing: "rgba(74, 222, 128, VAR)",
    particleColor: "rgba(74, 222, 128, VAR)",
    rootStroke: ["rgba(21,128,61,VAR)", "rgba(22,163,74,VAR)", "rgba(34,197,94,VAR)", "rgba(74,222,128,VAR)", "rgba(134,239,172,VAR)"],
    rootNode: "rgba(34, 197, 94, VAR)",
  },
  light: {
    starFill: "rgba(71, 85, 105, VAR)",
    starGlow: "rgba(34, 197, 94, VAR)",
    lineStroke: "rgba(34, 197, 94, VAR)",
    trunkStroke: "rgba(20, 83, 45, VAR)",
    leafGlow: "rgba(34, 197, 94, VAR)",
    leafFill: "rgba(20, 83, 45, VAR)",
    leafRing: "rgba(34, 197, 94, VAR)",
    particleColor: "rgba(34, 197, 94, VAR)",
    rootStroke: ["rgba(20,83,45,VAR)", "rgba(21,128,61,VAR)", "rgba(22,163,74,VAR)", "rgba(34,197,94,VAR)", "rgba(74,222,128,VAR)"],
    rootNode: "rgba(20, 83, 45, VAR)",
  },
}

// ── Generators ──────────────────────────────────────────────────────────────
function generateStars(w: number, h: number, count: number): Star[] {
  resetSeed()
  const stars: Star[] = []
  const zoneTop = CANOPY_ZONE[0] * h
  const zoneBot = CANOPY_ZONE[1] * h
  for (let i = 0; i < count; i++) {
    stars.push({
      x: srng() * w,
      y: zoneTop + srng() * (zoneBot - zoneTop),
      r: 0.6 + srng() * 1.8,
      baseAlpha: 0.2 + srng() * 0.4,
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
      if (Math.sqrt(dx * dx + dy * dy) < maxDist && srng() < 0.3) {
        conns.push([i, j])
      }
    }
  }
  return conns
}

function generateLeafClusters(w: number, h: number): LeafCluster[] {
  resetSeed()
  const canopyMid = (CANOPY_ZONE[0] + CANOPY_ZONE[1]) / 2 * h
  const canopyH = (CANOPY_ZONE[1] - CANOPY_ZONE[0]) * h
  const spacing = w / (LEAF_CLUSTERS.length + 1)

  return LEAF_CLUSTERS.map((def, i) => {
    const cx = spacing * (i + 1) + (srng() - 0.5) * spacing * 0.3
    const cy = canopyMid + (srng() - 0.5) * canopyH * 0.3
    const leafCount = 8 + Math.floor(srng() * 6)
    const leaves = Array.from({ length: leafCount }, () => ({
      x: cx + (srng() - 0.5) * def.radius * 1.6,
      y: cy + (srng() - 0.5) * def.radius * 1.2,
      r: 1 + srng() * 2.5,
      phase: srng() * Math.PI * 2,
    }))
    return { ...def, cx, cy, leaves }
  })
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

  const trunkBase = cx + (srng() - 0.5) * w * 0.04
  const trunkTopX = cx + (srng() - 0.5) * w * 0.02
  branches.push({ x1: trunkBase, y1: trunkBot, x2: trunkTopX, y2: trunkTop + trunkH * 0.35, thickness: 5, depth: 0 })

  const crownY = trunkTop + trunkH * 0.35
  const crownSpread = w * 0.12
  grow(trunkTopX - crownSpread * 0.3, crownY, -Math.PI / 2 - 0.4, trunkH * 0.22, 3, 1)
  grow(trunkTopX + crownSpread * 0.3, crownY, -Math.PI / 2 + 0.4, trunkH * 0.22, 3, 1)
  grow(trunkTopX, crownY - trunkH * 0.05, -Math.PI / 2, trunkH * 0.25, 3.5, 1)

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

function spawnParticles(w: number, h: number, count: number): EnergyParticle[] {
  resetSeed()
  return Array.from({ length: count }, () => ({
    x: w * 0.35 + srng() * w * 0.3,
    y: ROOT_ZONE[0] * h + srng() * (CANOPY_ZONE[1] * h - ROOT_ZONE[0] * h),
    speed: 0.15 + srng() * 0.35,
    size: 0.8 + srng() * 1.5,
    alpha: 0.2 + srng() * 0.4,
    phase: srng() * Math.PI * 2,
  }))
}

// ── Component ───────────────────────────────────────────────────────────────
export function MotherTreeCanvas({ summary, className }: MotherTreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>(0)
  const dataRef = useRef<{
    stars: Star[]; connections: [number, number][]
    branches: TreeBranch[]; roots: Root[]
    leafClusters: LeafCluster[]; particles: EnergyParticle[]
    w: number; h: number
  } | null>(null)
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1, y: -1 })
  const [hoveredCluster, setHoveredCluster] = useState<number | null>(null)
  const [hoveredTrunk, setHoveredTrunk] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  const regenerate = useCallback((w: number, h: number) => {
    const isMobile = w < 640
    const starCount = isMobile ? 25 : 50
    const connCount = isMobile ? 12 : 25
    const stars = generateStars(w, h, starCount)
    dataRef.current = {
      stars,
      connections: generateConnections(stars, w * 0.12, connCount),
      branches: generateTree(w, h),
      roots: generateRoots(w, h),
      leafClusters: generateLeafClusters(w, h),
      particles: spawnParticles(w, h, isMobile ? 12 : 25),
      w, h,
    }
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

      const isMobile = w < 640
      const starCount = isMobile ? 25 : 50
      const connCount = isMobile ? 12 : 25
      const stars = generateStars(w, h, starCount)
      dataRef.current = {
        stars,
        connections: generateConnections(stars, w * 0.12, connCount),
        branches: generateTree(w, h),
        roots: generateRoots(w, h),
        leafClusters: generateLeafClusters(w, h),
        particles: spawnParticles(w, h, isMobile ? 12 : 25),
        w, h,
      }
    }

    resize()
    window.addEventListener("resize", resize)

    const palette = isDark ? COLORS.dark : COLORS.light
    const alpha = (rgba: string, a: number) => rgba.replace("VAR", String(Math.max(0, Math.min(1, a))))

    let t = 0
    const draw = () => {
      if (!running || !dataRef.current) return
      const { stars, connections, branches, roots, leafClusters, particles, w, h } = dataRef.current
      t += 0.012

      ctx.clearRect(0, 0, w, h)

      // ── Background constellation lines ──
      connections.forEach(([i, j]) => {
        const a = stars[i], b = stars[j]
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = alpha(palette.lineStroke, 0.08)
        ctx.lineWidth = 0.4
        ctx.setLineDash([2, 4])
        ctx.stroke()
        ctx.setLineDash([])
      })

      // ── Background stars ──
      stars.forEach((s) => {
        const flicker = 0.5 + 0.5 * Math.sin(t * 1.0 + s.phase)
        const a = s.baseAlpha * flicker
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = alpha(palette.starGlow, a * 0.1)
        ctx.fill()
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

      // ── Energy particles flowing upward ──
      particles.forEach((p) => {
        p.y -= p.speed
        p.x += Math.sin(t * 2 + p.phase) * 0.3
        if (p.y < CANOPY_ZONE[0] * h) {
          p.y = ROOT_ZONE[0] * h
          p.x = w * 0.35 + Math.random() * w * 0.3
        }
        const progress = 1 - (p.y - ROOT_ZONE[0] * h) / (CANOPY_ZONE[1] * h - ROOT_ZONE[0] * h)
        const a = p.alpha * (0.3 + 0.7 * Math.sin(t * 1.5 + p.phase) * 0.5 + 0.5)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = alpha(palette.particleColor, a * (0.4 + progress * 0.6))
        ctx.fill()
      })

      // ── Mycelium roots ──
      roots.forEach((r) => {
        if (r.points.length < 2) return
        const colorIdx = Math.min(r.depth, palette.rootStroke.length - 1)
        const a = Math.max(0.2, 1 - r.depth * 0.15)
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
        if (r.depth >= 3) {
          ctx.beginPath()
          ctx.arc(last[0], last[1], 1.5, 0, Math.PI * 2)
          ctx.fillStyle = alpha(palette.rootNode, a * 0.6)
          ctx.fill()
        }
      })

      // ── Root node highlights ──
      const rootTop = ROOT_ZONE[0] * h
      ;[0.35, 0.42, 0.5, 0.58, 0.65].forEach((ox) => {
        ctx.beginPath()
        ctx.arc(ox * w, rootTop, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = alpha(palette.rootNode, 0.7)
        ctx.fill()
      })

      // ── Leaf cluster canopy constellations ──
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      leafClusters.forEach((cluster, ci) => {
        const dist = Math.sqrt((mx - cluster.cx) ** 2 + (my - cluster.cy) ** 2)
        const isNear = dist < cluster.radius * 1.8
        const glowIntensity = isNear ? 1.0 : 0.0

        // Cluster connecting lines
        for (let i = 0; i < cluster.leaves.length; i++) {
          for (let j = i + 1; j < cluster.leaves.length; j++) {
            const la = cluster.leaves[i], lb = cluster.leaves[j]
            const d = Math.sqrt((la.x - lb.x) ** 2 + (la.y - lb.y) ** 2)
            if (d < cluster.radius * 0.9) {
              ctx.beginPath()
              ctx.moveTo(la.x, la.y)
              ctx.lineTo(lb.x, lb.y)
              ctx.strokeStyle = alpha(palette.leafRing, isNear ? 0.25 : 0.06)
              ctx.lineWidth = isNear ? 0.8 : 0.3
              ctx.stroke()
            }
          }
        }

        // Leaf nodes
        cluster.leaves.forEach((leaf) => {
          const flicker = 0.5 + 0.5 * Math.sin(t * 1.8 + leaf.phase)
          const baseA = isNear ? 0.7 + 0.3 * flicker : 0.15 + 0.15 * flicker
          const r = isNear ? leaf.r * 1.4 : leaf.r

          // glow
          ctx.beginPath()
          ctx.arc(leaf.x, leaf.y, r * (isNear ? 5 : 3), 0, Math.PI * 2)
          ctx.fillStyle = alpha(palette.leafGlow, baseA * (isNear ? 0.2 : 0.06))
          ctx.fill()

          // core
          ctx.beginPath()
          ctx.arc(leaf.x, leaf.y, r, 0, Math.PI * 2)
          ctx.fillStyle = alpha(palette.leafFill, baseA)
          ctx.fill()
        })

        // Cluster center glow when hovered
        if (isNear) {
          ctx.beginPath()
          ctx.arc(cluster.cx, cluster.cy, cluster.radius * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = alpha(palette.leafGlow, 0.06)
          ctx.fill()
        }
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

  // Mouse tracking for leaf hover detection
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    mouseRef.current = { x, y }

    const yNorm = y / rect.height
    setHoveredTrunk(yNorm >= TRUNK_ZONE[0] - 0.05 && yNorm <= TRUNK_ZONE[1] + 0.05)

    if (dataRef.current) {
      const { leafClusters } = dataRef.current
      let found: number | null = null
      for (let i = 0; i < leafClusters.length; i++) {
        const c = leafClusters[i]
        if (Math.sqrt((x - c.cx) ** 2 + (y - c.cy) ** 2) < c.radius * 1.5) {
          found = i
          break
        }
      }
      setHoveredCluster(found)
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1, y: -1 }
    setHoveredCluster(null)
    setHoveredTrunk(false)
  }, [])

  const handleLeafClick = useCallback((href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const handleTrunkTap = useCallback(() => {
    if (window.innerWidth < 640) setHoveredTrunk((h) => !h)
  }, [])

  const activeCluster = dataRef.current && hoveredCluster !== null ? dataRef.current.leafClusters[hoveredCluster] : null

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      style={{ height: "clamp(320px, 45vw, 480px)" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleTrunkTap}
    >
      <canvas ref={canvasRef} className="absolute inset-0" style={{ cursor: hoveredCluster !== null ? "pointer" : "default" }} />

      {/* Leaf cluster tooltip */}
      <AnimatePresence>
        {activeCluster && (
          <motion.div
            key={`leaf-tip-${hoveredCluster}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute z-20 -translate-x-1/2"
            style={{ left: activeCluster.cx, top: activeCluster.cy - activeCluster.radius - 20 }}
          >
            <span className="whitespace-nowrap rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-green-300 backdrop-blur-sm dark:bg-slate-950/80 dark:text-green-200">
              {activeCluster.icon} {activeCluster.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clickable leaf cluster buttons (invisible overlay) */}
      {dataRef.current && dataRef.current.leafClusters.map((cluster, i) => (
        <button
          key={i}
          onClick={(e) => { e.stopPropagation(); handleLeafClick(cluster.href) }}
          className="absolute z-30 rounded-full opacity-0 hover:opacity-100 focus:opacity-100 focus:outline-none"
          style={{
            left: cluster.cx - cluster.radius,
            top: cluster.cy - cluster.radius,
            width: cluster.radius * 2,
            height: cluster.radius * 2,
          }}
          aria-label={`Go to ${cluster.label}`}
        />
      ))}

      {/* Trunk hover summary overlay */}
      <AnimatePresence>
        {hoveredTrunk && (
          <motion.div
            key="trunk-summary"
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
