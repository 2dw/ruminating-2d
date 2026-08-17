"use client"

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

let _seed = 777
function srng() {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff
  return (_seed >>> 0) / 0xffffffff
}
function resetSeed() { _seed = 777 }

interface Star { x: number; y: number; r: number; baseAlpha: number; phase: number }
interface Root { points: [number, number][]; depth: number }
interface TreeBranch { x1: number; y1: number; x2: number; y2: number; thickness: number; depth: number }
interface LeafNode { x: number; y: number; r: number; phase: number }
interface TierCluster {
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

// Tree fills top 60%, roots bottom 35%, thin overlap at ground line
const CANOPY_ZONE = [0.0, 0.58]
const TRUNK_ZONE  = [0.30, 0.65]
const ROOT_ZONE   = [0.62, 1.0]

const TIER_CLUSTERS: Omit<TierCluster, "cx" | "cy" | "leaves">[] = [
  { radius: 48, label: "Constellatory Ideations", href: "#thought-pieces", icon: "\u2606" },
  { radius: 52, label: "Seeding Networks",        href: "#deep-dives",     icon: "\u26A1" },
]

const COLORS = {
  dark: {
    starFill: "rgba(148, 163, 184, VAR)",
    starGlow: "rgba(96, 165, 250, VAR)",
    lineStroke: "rgba(96, 165, 250, VAR)",
    trunkStroke: "rgba(34, 197, 94, VAR)",
    trunkGlow: "rgba(74, 222, 128, VAR)",
    leafFill: "rgba(34, 197, 94, VAR)",
    leafGlow: "rgba(74, 222, 128, VAR)",
    leafRing: "rgba(74, 222, 128, VAR)",
    rootStroke: "rgba(22, 163, 74, VAR)",
    rootGlow: "rgba(34, 197, 94, VAR)",
    rootNode: "rgba(34, 197, 94, VAR)",
    particleColor: "rgba(74, 222, 128, VAR)",
  },
  light: {
    starFill: "rgba(71, 85, 105, VAR)",
    starGlow: "rgba(34, 197, 94, VAR)",
    lineStroke: "rgba(34, 197, 94, VAR)",
    trunkStroke: "rgba(20, 83, 45, VAR)",
    trunkGlow: "rgba(34, 197, 94, VAR)",
    leafFill: "rgba(34, 197, 94, VAR)",
    leafGlow: "rgba(74, 222, 128, VAR)",
    leafRing: "rgba(34, 197, 94, VAR)",
    rootStroke: "rgba(21, 128, 61, VAR)",
    rootGlow: "rgba(34, 197, 94, VAR)",
    rootNode: "rgba(20, 83, 45, VAR)",
    particleColor: "rgba(34, 197, 94, VAR)",
  },
}

function generateBgStars(w: number, h: number, count: number): Star[] {
  resetSeed()
  return Array.from({ length: count }, () => ({
    x: srng() * w,
    y: srng() * h,
    r: 0.4 + srng() * 1.4,
    baseAlpha: 0.1 + srng() * 0.25,
    phase: srng() * Math.PI * 2,
  }))
}

function generateBgConnections(stars: Star[], maxDist: number, count: number): [number, number][] {
  resetSeed()
  const conns: [number, number][] = []
  for (let i = 0; i < stars.length && conns.length < count; i++) {
    for (let j = i + 1; j < stars.length && conns.length < count; j++) {
      const dx = stars[i].x - stars[j].x
      const dy = stars[i].y - stars[j].y
      if (Math.sqrt(dx * dx + dy * dy) < maxDist && srng() < 0.2) {
        conns.push([i, j])
      }
    }
  }
  return conns
}

function generateTree(w: number, h: number): { branches: TreeBranch[]; leafNodes: LeafNode[]; trunkBaseY: number } {
  resetSeed()
  const branches: TreeBranch[] = []
  const leafNodes: LeafNode[] = []
  const cx = w / 2
  const trunkTop = TRUNK_ZONE[0] * h
  const trunkBot = TRUNK_ZONE[1] * h
  const trunkH = trunkBot - trunkTop

  function grow(x: number, y: number, angle: number, len: number, thick: number, depth: number) {
    if (depth > 6 || len < 3) return
    const x2 = x + Math.cos(angle) * len
    const y2 = y + Math.sin(angle) * len
    branches.push({ x1: x, y1: y, x2, y2, thickness: thick, depth })

    // Leaves at tips and junctions
    if (depth >= 2 && srng() < 0.55) {
      leafNodes.push({
        x: x2 + (srng() - 0.5) * 10,
        y: y2 + (srng() - 0.5) * 10,
        r: 0.7 + srng() * 2.0,
        phase: srng() * Math.PI * 2,
      })
    }

    const spread = 0.28 + srng() * 0.32
    const shrink = 0.6 + srng() * 0.12
    if (srng() < 0.7) {
      grow(x2, y2, angle - spread, len * shrink, thick * 0.65, depth + 1)
      grow(x2, y2, angle + spread, len * shrink, thick * 0.65, depth + 1)
    } else {
      grow(x2, y2, angle + (srng() - 0.5) * 0.28, len * 0.75, thick * 0.75, depth + 1)
    }
  }

  // Main trunk — thick and prominent
  const trunkBaseX = cx + (srng() - 0.5) * w * 0.02
  const trunkTopX = cx + (srng() - 0.5) * w * 0.01
  branches.push({ x1: trunkBaseX, y1: trunkBot, x2: trunkTopX, y2: trunkTop + trunkH * 0.28, thickness: 9, depth: 0 })

  // Crown — wide, reaching high into canopy
  const crownY = trunkTop + trunkH * 0.28
  const spread = w * 0.16
  grow(trunkTopX - spread * 0.35, crownY, -Math.PI / 2 - 0.3, trunkH * 0.3, 5, 1)
  grow(trunkTopX + spread * 0.35, crownY, -Math.PI / 2 + 0.3, trunkH * 0.3, 5, 1)
  grow(trunkTopX, crownY - trunkH * 0.05, -Math.PI / 2, trunkH * 0.35, 5.5, 1)
  grow(trunkTopX - spread * 0.15, crownY + trunkH * 0.04, -Math.PI / 2 - 0.5, trunkH * 0.24, 3.5, 1)
  grow(trunkTopX + spread * 0.15, crownY + trunkH * 0.04, -Math.PI / 2 + 0.5, trunkH * 0.24, 3.5, 1)
  grow(trunkTopX - spread * 0.5, crownY + trunkH * 0.08, -Math.PI / 2 - 0.6, trunkH * 0.2, 3, 1)
  grow(trunkTopX + spread * 0.5, crownY + trunkH * 0.08, -Math.PI / 2 + 0.6, trunkH * 0.2, 3, 1)

  // Mid branches
  const midY = trunkBot - trunkH * 0.18
  grow(trunkBaseX - 3, midY, -Math.PI / 2 - 0.6, trunkH * 0.16, 3, 2)
  grow(trunkBaseX + 3, midY, -Math.PI / 2 + 0.6, trunkH * 0.16, 3, 2)

  return { branches, leafNodes, trunkBaseY: trunkBot }
}

function generateRoots(w: number, h: number, trunkBaseY: number): Root[] {
  resetSeed()
  const roots: Root[] = []
  const cx = w / 2
  const rootBot = ROOT_ZONE[1] * h
  // All roots originate from the trunk base
  const origins = [
    { x: cx, offset: 0 },
    { x: cx - w * 0.03, offset: 0.02 },
    { x: cx + w * 0.03, offset: -0.02 },
    { x: cx - w * 0.06, offset: 0.05 },
    { x: cx + w * 0.06, offset: -0.05 },
  ]

  function grow(x: number, y: number, angle: number, depth: number, path: [number, number][]) {
    if (depth > 5 || y > rootBot || x < -20 || x > w + 20) return
    const len = (10 + srng() * 18) * (1 - depth * 0.1)
    const nx = x + Math.cos(angle) * len
    const ny = y + Math.sin(angle) * len * 1.2
    path.push([nx, ny])
    roots.push({ points: [...path], depth })
    const spread = 0.25 + srng() * 0.3
    if (srng() < 0.55) {
      grow(nx, ny, angle - spread, depth + 1, [...path])
      grow(nx, ny, angle + spread, depth + 1, [...path])
    } else {
      grow(nx, ny, angle + (srng() - 0.5) * 0.2, depth + 1, [...path])
    }
  }

  origins.forEach((o) => {
    const angle = Math.PI / 2 + o.offset + (srng() - 0.5) * 0.3
    grow(o.x, trunkBaseY, angle, 0, [[o.x, trunkBaseY]])
  })

  return roots
}

function generateTierClusters(w: number, h: number): TierCluster[] {
  resetSeed()
  const midY = (CANOPY_ZONE[0] + CANOPY_ZONE[1]) / 2 * h
  const positions = [
    { x: w * 0.12, y: midY + h * 0.02 },
    { x: w * 0.88, y: midY + h * 0.02 },
  ]

  return TIER_CLUSTERS.map((def, i) => {
    const cx = positions[i].x
    const cy = positions[i].y
    const leafCount = 10 + Math.floor(srng() * 5)
    const leaves = Array.from({ length: leafCount }, () => ({
      x: cx + (srng() - 0.5) * def.radius * 1.8,
      y: cy + (srng() - 0.5) * def.radius * 1.4,
      r: 1 + srng() * 2.5,
      phase: srng() * Math.PI * 2,
    }))
    return { ...def, cx, cy, leaves }
  })
}

function generateCanopyLeaves(w: number, h: number): LeafNode[] {
  resetSeed()
  const leaves: LeafNode[] = []
  const canopyTop = CANOPY_ZONE[0] * h + h * 0.02
  const canopyBot = CANOPY_ZONE[1] * h - h * 0.04
  const count = Math.floor(w * 0.06)
  for (let i = 0; i < count; i++) {
    leaves.push({
      x: srng() * w,
      y: canopyTop + srng() * (canopyBot - canopyTop),
      r: 0.5 + srng() * 1.8,
      phase: srng() * Math.PI * 2,
    })
  }
  return leaves
}

function spawnParticles(w: number, h: number, count: number): EnergyParticle[] {
  resetSeed()
  return Array.from({ length: count }, () => ({
    x: w * 0.38 + srng() * w * 0.24,
    y: ROOT_ZONE[0] * h + srng() * (CANOPY_ZONE[1] * h - ROOT_ZONE[0] * h),
    speed: 0.1 + srng() * 0.25,
    size: 0.5 + srng() * 1.0,
    alpha: 0.12 + srng() * 0.3,
    phase: srng() * Math.PI * 2,
  }))
}

export function MotherTreeCanvas({ summary, className }: MotherTreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>(0)
  const dataRef = useRef<{
    bgStars: Star[]; bgConns: [number, number][]
    branches: TreeBranch[]; treeLeafNodes: LeafNode[]
    canopyLeaves: LeafNode[]
    roots: Root[]; tierClusters: TierCluster[]
    particles: EnergyParticle[]; w: number; h: number
  } | null>(null)
  const mouseRef = useRef<{ x: number; y: number }>({ x: -999, y: -999 })
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

  const buildData = useCallback((w: number, h: number) => {
    const isMobile = w < 640
    const bgStarCount = isMobile ? 18 : 35
    const bgStars = generateBgStars(w, h, bgStarCount)
    const { branches, leafNodes: treeLeafNodes, trunkBaseY } = generateTree(w, h)
    dataRef.current = {
      bgStars,
      bgConns: generateBgConnections(bgStars, w * 0.1, isMobile ? 8 : 16),
      branches,
      treeLeafNodes,
      canopyLeaves: generateCanopyLeaves(w, h),
      roots: generateRoots(w, h, trunkBaseY),
      tierClusters: generateTierClusters(w, h),
      particles: spawnParticles(w, h, isMobile ? 8 : 18),
      w, h,
    }
  }, [])

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
      buildData(w, h)
    }

    resize()
    window.addEventListener("resize", resize)

    const palette = isDark ? COLORS.dark : COLORS.light
    const alpha = (rgba: string, a: number) => rgba.replace("VAR", String(Math.max(0, Math.min(1, a))))

    let t = 0
    const draw = () => {
      if (!running || !dataRef.current) return
      const { bgStars, bgConns, branches, treeLeafNodes, canopyLeaves, roots, tierClusters, particles, w, h } = dataRef.current
      t += 0.012

      ctx.clearRect(0, 0, w, h)

      // ── Background constellation ──
      bgConns.forEach(([i, j]) => {
        const a = bgStars[i], b = bgStars[j]
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = alpha(palette.lineStroke, 0.05)
        ctx.lineWidth = 0.3
        ctx.setLineDash([2, 5])
        ctx.stroke()
        ctx.setLineDash([])
      })
      bgStars.forEach((s) => {
        const flicker = 0.4 + 0.6 * Math.sin(t * 0.7 + s.phase)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = alpha(palette.starFill, s.baseAlpha * flicker)
        ctx.fill()
      })

      // ── Energy particles ──
      particles.forEach((p) => {
        p.y -= p.speed
        p.x += Math.sin(t * 1.5 + p.phase) * 0.2
        if (p.y < CANOPY_ZONE[0] * h) {
          p.y = TRUNK_ZONE[1] * h
          p.x = w * 0.38 + Math.random() * w * 0.24
        }
        const a = p.alpha * (0.3 + 0.7 * (Math.sin(t * 1.3 + p.phase) * 0.5 + 0.5))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = alpha(palette.particleColor, a)
        ctx.fill()
      })

      // ── Roots (faded, from trunk base) ──
      roots.forEach((r) => {
        if (r.points.length < 2) return
        const fade = Math.max(0.12, 0.55 - r.depth * 0.1)
        ctx.beginPath()
        ctx.moveTo(r.points[0][0], r.points[0][1])
        for (let i = 1; i < r.points.length; i++) {
          const prev = r.points[i - 1]
          const curr = r.points[i]
          const mx = (prev[0] + curr[0]) / 2 + (srng() - 0.5) * 4
          const my = (prev[1] + curr[1]) / 2
          ctx.quadraticCurveTo(prev[0], prev[1], mx, my)
        }
        const last = r.points[r.points.length - 1]
        ctx.lineTo(last[0], last[1])
        ctx.strokeStyle = alpha(palette.rootStroke, fade)
        ctx.lineWidth = Math.max(0.3, 1.0 - r.depth * 0.18)
        ctx.lineCap = "round"
        ctx.stroke()

        // Root glow
        ctx.beginPath()
        ctx.moveTo(r.points[0][0], r.points[0][1])
        for (let i = 1; i < r.points.length; i++) {
          const prev = r.points[i - 1]
          const curr = r.points[i]
          const mx = (prev[0] + curr[0]) / 2
          const my = (prev[1] + curr[1]) / 2
          ctx.quadraticCurveTo(prev[0], prev[1], mx, my)
        }
        ctx.lineTo(last[0], last[1])
        ctx.strokeStyle = alpha(palette.rootGlow, fade * 0.2)
        ctx.lineWidth = Math.max(0.6, 2.5 - r.depth * 0.3)
        ctx.stroke()

        // Root tip glow nodes
        if (r.depth >= 3) {
          ctx.beginPath()
          ctx.arc(last[0], last[1], 1.2, 0, Math.PI * 2)
          ctx.fillStyle = alpha(palette.rootNode, fade * 0.4)
          ctx.fill()
        }
      })

      // ── Tree (large, prominent, strong green) ──
      branches.forEach((b) => {
        const a = Math.max(0.5, 1 - b.depth * 0.08)
        // Glow layer
        ctx.beginPath()
        ctx.moveTo(b.x1, b.y1)
        ctx.lineTo(b.x2, b.y2)
        ctx.strokeStyle = alpha(palette.trunkGlow, a * 0.12)
        ctx.lineWidth = Math.max(1.5, b.thickness * 2.5)
        ctx.lineCap = "round"
        ctx.stroke()
        // Core stroke
        ctx.beginPath()
        ctx.moveTo(b.x1, b.y1)
        ctx.lineTo(b.x2, b.y2)
        ctx.strokeStyle = alpha(palette.trunkStroke, a)
        ctx.lineWidth = Math.max(0.8, b.thickness)
        ctx.lineCap = "round"
        ctx.stroke()
      })

      // ── Permanent canopy leaf stars ──
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      canopyLeaves.forEach((leaf) => {
        const dist = Math.sqrt((mx - leaf.x) ** 2 + (my - leaf.y) ** 2)
        const near = dist < 35
        const flicker = 0.35 + 0.65 * Math.sin(t * 1.8 + leaf.phase)
        const a = near ? 0.75 + 0.25 * flicker : 0.15 + 0.2 * flicker
        const r = near ? leaf.r * 1.5 : leaf.r

        // glow
        ctx.beginPath()
        ctx.arc(leaf.x, leaf.y, r * (near ? 4.5 : 2.5), 0, Math.PI * 2)
        ctx.fillStyle = alpha(palette.leafGlow, a * (near ? 0.18 : 0.04))
        ctx.fill()
        // core
        ctx.beginPath()
        ctx.arc(leaf.x, leaf.y, r, 0, Math.PI * 2)
        ctx.fillStyle = alpha(palette.leafFill, a)
        ctx.fill()
      })

      // ── Tree branch leaf nodes ──
      treeLeafNodes.forEach((leaf) => {
        const dist = Math.sqrt((mx - leaf.x) ** 2 + (my - leaf.y) ** 2)
        const near = dist < 30
        const flicker = 0.4 + 0.6 * Math.sin(t * 2.0 + leaf.phase)
        const a = near ? 0.85 + 0.15 * flicker : 0.25 + 0.3 * flicker
        const r = near ? leaf.r * 1.6 : leaf.r

        ctx.beginPath()
        ctx.arc(leaf.x, leaf.y, r * (near ? 5 : 3), 0, Math.PI * 2)
        ctx.fillStyle = alpha(palette.leafGlow, a * (near ? 0.2 : 0.06))
        ctx.fill()
        ctx.beginPath()
        ctx.arc(leaf.x, leaf.y, r, 0, Math.PI * 2)
        ctx.fillStyle = alpha(palette.leafFill, a)
        ctx.fill()
      })

      // ── Tier clusters (always visible, brighter on hover) ──
      tierClusters.forEach((cluster, ci) => {
        const dist = Math.sqrt((mx - cluster.cx) ** 2 + (my - cluster.cy) ** 2)
        const isHovered = dist < cluster.radius * 2.0

        // Lines between leaves
        for (let i = 0; i < cluster.leaves.length; i++) {
          for (let j = i + 1; j < cluster.leaves.length; j++) {
            const la = cluster.leaves[i], lb = cluster.leaves[j]
            const d = Math.sqrt((la.x - lb.x) ** 2 + (la.y - lb.y) ** 2)
            if (d < cluster.radius * 0.8) {
              ctx.beginPath()
              ctx.moveTo(la.x, la.y)
              ctx.lineTo(lb.x, lb.y)
              ctx.strokeStyle = alpha(palette.leafRing, isHovered ? 0.3 : 0.08)
              ctx.lineWidth = isHovered ? 0.7 : 0.25
              ctx.stroke()
            }
          }
        }

        // Leaf dots (always visible)
        cluster.leaves.forEach((leaf) => {
          const flicker = 0.4 + 0.6 * Math.sin(t * 1.5 + leaf.phase)
          const a = isHovered ? 0.8 + 0.2 * flicker : 0.18 + 0.18 * flicker
          const r = isHovered ? leaf.r * 1.4 : leaf.r

          ctx.beginPath()
          ctx.arc(leaf.x, leaf.y, r * (isHovered ? 4.5 : 2), 0, Math.PI * 2)
          ctx.fillStyle = alpha(palette.leafGlow, a * (isHovered ? 0.2 : 0.05))
          ctx.fill()
          ctx.beginPath()
          ctx.arc(leaf.x, leaf.y, r, 0, Math.PI * 2)
          ctx.fillStyle = alpha(palette.leafFill, a)
          ctx.fill()
        })

        if (isHovered) {
          ctx.beginPath()
          ctx.arc(cluster.cx, cluster.cy, cluster.radius * 0.35, 0, Math.PI * 2)
          ctx.fillStyle = alpha(palette.leafGlow, 0.04)
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
  }, [isDark, buildData])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    mouseRef.current = { x, y }

    const yNorm = y / rect.height
    setHoveredTrunk(yNorm >= TRUNK_ZONE[0] - 0.05 && yNorm <= TRUNK_ZONE[1] + 0.05)

    if (dataRef.current) {
      let found: number | null = null
      for (let i = 0; i < dataRef.current.tierClusters.length; i++) {
        const c = dataRef.current.tierClusters[i]
        if (Math.sqrt((x - c.cx) ** 2 + (y - c.cy) ** 2) < c.radius * 2.0) {
          found = i
          break
        }
      }
      setHoveredCluster(found)
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -999, y: -999 }
    setHoveredCluster(null)
    setHoveredTrunk(false)
  }, [])

  const handleLeafClick = useCallback((href: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const handleCanvasClick = useCallback(() => {
    if (window.innerWidth < 640) setHoveredTrunk((h) => !h)
  }, [])

  const activeCluster = dataRef.current && hoveredCluster !== null ? dataRef.current.tierClusters[hoveredCluster] : null

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      style={{ height: "clamp(360px, 50vw, 520px)" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCanvasClick}
    >
      <canvas ref={canvasRef} className="absolute inset-0" style={{ cursor: hoveredCluster !== null ? "pointer" : "default" }} />

      {/* Tier cluster tooltip */}
      <AnimatePresence>
        {activeCluster && (
          <motion.div
            key={`tier-tip-${hoveredCluster}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute z-20 -translate-x-1/2"
            style={{ left: activeCluster.cx, top: activeCluster.cy - activeCluster.radius - 22 }}
          >
            <span className="whitespace-nowrap rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-green-300 backdrop-blur-sm dark:bg-slate-950/80 dark:text-green-200">
              {activeCluster.icon} {activeCluster.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clickable tier cluster buttons */}
      {dataRef.current && dataRef.current.tierClusters.map((cluster, i) => (
        <button
          key={i}
          onClick={(e) => handleLeafClick(cluster.href, e)}
          className="absolute z-30 rounded-full bg-transparent"
          style={{
            left: cluster.cx - cluster.radius,
            top: cluster.cy - cluster.radius,
            width: cluster.radius * 2,
            height: cluster.radius * 2,
          }}
          aria-label={`Go to ${cluster.label}`}
        />
      ))}

      {/* Trunk hover summary */}
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
