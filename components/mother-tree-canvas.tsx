"use client"

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

let _seed = 777
function srng() {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff
  return (_seed >>> 0) / 0xffffffff
}
function resetSeed() { _seed = 777 }

interface Branch { x1: number; y1: number; x2: number; y2: number; thickness: number; depth: number }
interface CanopyLeaf { x: number; y: number; r: number; phase: number; inCluster: number }
interface Root { points: [number, number][]; depth: number }
interface EnergyParticle { x: number; y: number; speed: number; size: number; alpha: number; phase: number }
interface TierCluster {
  cx: number; cy: number; radius: number
  label: string; href: string; icon: string
  leaves: { x: number; y: number; r: number; phase: number }[]
}

interface MotherTreeCanvasProps { summary: ReactNode; className?: string }

const TIER_CLUSTERS: Omit<TierCluster, "cx" | "cy" | "leaves">[] = [
  { radius: 50, label: "Constellatory Ideations", href: "#thought-pieces", icon: "\u2606" },
  { radius: 55, label: "Seeding Networks",        href: "#deep-dives",     icon: "\u26A1" },
]

const COLORS = {
  dark: {
    trunk: "rgba(34, 197, 94, VAR)",
    trunkGlow: "rgba(74, 222, 128, VAR)",
    branch: "rgba(34, 197, 94, VAR)",
    leaf: "rgba(74, 222, 128, VAR)",
    leafCore: "rgba(134, 239, 172, VAR)",
    leafRing: "rgba(74, 222, 128, VAR)",
    root: "rgba(22, 163, 74, VAR)",
    rootGlow: "rgba(34, 197, 94, VAR)",
    particle: "rgba(74, 222, 128, VAR)",
    bgStar: "rgba(148, 163, 184, VAR)",
    bgLine: "rgba(96, 165, 250, VAR)",
  },
  light: {
    trunk: "rgba(20, 83, 45, VAR)",
    trunkGlow: "rgba(34, 197, 94, VAR)",
    branch: "rgba(20, 83, 45, VAR)",
    leaf: "rgba(34, 197, 94, VAR)",
    leafCore: "rgba(74, 222, 128, VAR)",
    leafRing: "rgba(34, 197, 94, VAR)",
    root: "rgba(21, 128, 61, VAR)",
    rootGlow: "rgba(34, 197, 94, VAR)",
    particle: "rgba(34, 197, 94, VAR)",
    bgStar: "rgba(71, 85, 105, VAR)",
    bgLine: "rgba(34, 197, 94, VAR)",
  },
}

// ── Tree generation: single trunk, wide dome canopy ────────────────────────
function generateTree(w: number, h: number) {
  resetSeed()
  const cx = w / 2
  const groundY = h * 0.62
  const trunkTop = h * 0.32
  const trunkH = groundY - trunkTop

  const branches: Branch[] = []

  // Main trunk — thick, single, prominent
  const trunkW = Math.max(6, w * 0.008)
  branches.push({ x1: cx, y1: groundY, x2: cx, y2: trunkTop, thickness: trunkW, depth: 0 })

  // Major scaffold branches — spread into dome shape
  const scaffoldAngles = [-0.7, -0.35, 0, 0.35, 0.7]
  const scaffoldLengths = [trunkH * 0.45, trunkH * 0.5, trunkH * 0.55, trunkH * 0.5, trunkH * 0.45]
  const scaffoldStartY = trunkTop + trunkH * 0.05

  scaffoldAngles.forEach((angle, i) => {
    const startX = cx + Math.cos(angle + Math.PI / 2) * 3
    const startY = scaffoldStartY
    const len = scaffoldLengths[i]
    const endX = startX + Math.sin(angle) * len
    const endY = startY - Math.cos(angle) * len * 0.7
    branches.push({ x1: startX, y1: startY, x2: endX, y2: endY, thickness: trunkW * 0.5, depth: 1 })

    // Sub-branches from each scaffold
    const subCount = 2 + Math.floor(srng() * 2)
    for (let s = 0; s < subCount; s++) {
      const t = 0.3 + srng() * 0.6
      const bx = startX + (endX - startX) * t
      const by = startY + (endY - startY) * t
      const subAngle = angle + (srng() - 0.5) * 0.6
      const subLen = len * (0.2 + srng() * 0.25)
      const subEndX = bx + Math.sin(subAngle) * subLen
      const subEndY = by - Math.cos(subAngle) * subLen * 0.6
      branches.push({ x1: bx, y1: by, x2: subEndX, y2: subEndY, thickness: trunkW * 0.3, depth: 2 })

      // Tertiary twigs
      if (srng() < 0.6) {
        const tx = subEndX + (srng() - 0.5) * 20
        const ty = subEndY - srng() * 15
        branches.push({ x1: subEndX, y1: subEndY, x2: tx, y2: ty, thickness: trunkW * 0.15, depth: 3 })
      }
    }
  })

  // Generate dome canopy leaf positions
  const canopyCenterY = trunkTop - trunkH * 0.05
  const canopyRadiusX = w * 0.32
  const canopyRadiusY = trunkH * 0.38
  const leafCount = Math.floor(w * 0.08)
  const canopyLeaves: CanopyLeaf[] = []

  for (let i = 0; i < leafCount; i++) {
    // Distribute in dome shape (ellipse, denser toward center)
    const angle = srng() * Math.PI * 2
    const r = Math.sqrt(srng()) // denser toward center
    const lx = cx + Math.cos(angle) * canopyRadiusX * r
    const ly = canopyCenterY + Math.sin(angle) * canopyRadiusY * r * 0.7 - canopyRadiusY * 0.15
    canopyLeaves.push({
      x: lx,
      y: ly,
      r: 0.6 + srng() * 1.8,
      phase: srng() * Math.PI * 2,
      inCluster: -1,
    })
  }

  // Generate tier cluster positions (integrated into canopy)
  const tierClusters: TierCluster[] = TIER_CLUSTERS.map((def, i) => {
    const clusterAngle = i === 0 ? Math.PI * 0.75 : Math.PI * 0.25
    const clusterR = 0.45
    const clusterCx = cx + Math.cos(clusterAngle) * canopyRadiusX * clusterR
    const clusterCy = canopyCenterY + Math.sin(clusterAngle) * canopyRadiusY * clusterR * 0.7 - canopyRadiusY * 0.1
    const leafCount = 12 + Math.floor(srng() * 5)
    const leaves = Array.from({ length: leafCount }, () => ({
      x: clusterCx + (srng() - 0.5) * def.radius * 1.6,
      y: clusterCy + (srng() - 0.5) * def.radius * 1.2,
      r: 1.2 + srng() * 2.2,
      phase: srng() * Math.PI * 2,
    }))
    return { ...def, cx: clusterCx, cy: clusterCy, leaves }
  })

  return { branches, canopyLeaves, tierClusters, groundY, trunkBaseX: cx }
}

function generateRoots(w: number, trunkBaseX: number, groundY: number): Root[] {
  resetSeed()
  const roots: Root[] = []
  const rootBot = groundY + (1.0 - 0.62) * (groundY / 0.62) * 0.62

  function grow(x: number, y: number, angle: number, depth: number, path: [number, number][]) {
    if (depth > 5 || y > rootBot || x < -20 || x > w + 20) return
    const len = (8 + srng() * 14) * (1 - depth * 0.1)
    const nx = x + Math.cos(angle) * len
    const ny = y + Math.sin(angle) * len * 1.1
    path.push([nx, ny])
    roots.push({ points: [...path], depth })
    const spread = 0.25 + srng() * 0.25
    if (srng() < 0.5) {
      grow(nx, ny, angle - spread, depth + 1, [...path])
      grow(nx, ny, angle + spread, depth + 1, [...path])
    } else {
      grow(nx, ny, angle + (srng() - 0.5) * 0.2, depth + 1, [...path])
    }
  }

  // All roots from the single trunk base
  const rootAngles = [-0.6, -0.3, 0, 0.3, 0.6]
  rootAngles.forEach((a) => {
    grow(trunkBaseX, groundY, Math.PI / 2 + a + (srng() - 0.5) * 0.15, 0, [[trunkBaseX, groundY]])
  })

  return roots
}

function generateBgStars(w: number, h: number, count: number) {
  resetSeed()
  return Array.from({ length: count }, () => ({
    x: srng() * w, y: srng() * h,
    r: 0.4 + srng() * 1.2,
    a: 0.1 + srng() * 0.2,
    phase: srng() * Math.PI * 2,
  }))
}

function spawnParticles(w: number, h: number, count: number): EnergyParticle[] {
  resetSeed()
  return Array.from({ length: count }, () => ({
    x: w * 0.42 + srng() * w * 0.16,
    y: h * 0.3 + srng() * h * 0.3,
    speed: 0.08 + srng() * 0.2,
    size: 0.4 + srng() * 0.8,
    alpha: 0.1 + srng() * 0.25,
    phase: srng() * Math.PI * 2,
  }))
}

export function MotherTreeCanvas({ summary, className }: MotherTreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number>(0)
  const treeDataRef = useRef<{
    tree: ReturnType<typeof generateTree>
    roots: Root[]
    bgStars: { x: number; y: number; r: number; a: number; phase: number }[]
    particles: EnergyParticle[]
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
    const tree = generateTree(w, h)
    treeDataRef.current = {
      tree,
      roots: generateRoots(w, tree.trunkBaseX, tree.groundY),
      bgStars: generateBgStars(w, h, 30),
      particles: spawnParticles(w, h, 15),
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
      const w = rect.width, h = rect.height
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
    const a = (rgba: string, v: number) => rgba.replace("VAR", String(Math.max(0, Math.min(1, v))))
    const w = () => canvas.width / (window.devicePixelRatio || 1)
    const h = () => canvas.height / (window.devicePixelRatio || 1)

    let t = 0
    const draw = () => {
      if (!running || !treeDataRef.current) return
      const { tree, roots, bgStars, particles } = treeDataRef.current
      const W = w(), H = h()
      const mx = mouseRef.current.x, my = mouseRef.current.y
      t += 0.012

      ctx.clearRect(0, 0, W, H)

      // ── Background stars ──
      bgStars.forEach((s) => {
        const f = 0.4 + 0.6 * Math.sin(t * 0.6 + s.phase)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = a(palette.bgStar, s.a * f)
        ctx.fill()
      })

      // ── Energy particles ──
      particles.forEach((p) => {
        p.y -= p.speed
        p.x += Math.sin(t * 1.2 + p.phase) * 0.15
        if (p.y < H * 0.05) { p.y = tree.groundY; p.x = W * 0.42 + Math.random() * W * 0.16 }
        const pa = p.alpha * (0.3 + 0.7 * (Math.sin(t + p.phase) * 0.5 + 0.5))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = a(palette.particle, pa)
        ctx.fill()
      })

      // ── Roots (faded, all from trunk base) ──
      roots.forEach((r) => {
        if (r.points.length < 2) return
        const fade = Math.max(0.1, 0.45 - r.depth * 0.08)
        // Glow
        ctx.beginPath()
        ctx.moveTo(r.points[0][0], r.points[0][1])
        for (let i = 1; i < r.points.length; i++) {
          const prev = r.points[i - 1], curr = r.points[i]
          ctx.quadraticCurveTo(prev[0], prev[1], (prev[0] + curr[0]) / 2, (prev[1] + curr[1]) / 2)
        }
        const last = r.points[r.points.length - 1]
        ctx.lineTo(last[0], last[1])
        ctx.strokeStyle = a(palette.rootGlow, fade * 0.25)
        ctx.lineWidth = Math.max(0.5, 2.5 - r.depth * 0.3)
        ctx.lineCap = "round"
        ctx.stroke()
        // Core
        ctx.beginPath()
        ctx.moveTo(r.points[0][0], r.points[0][1])
        for (let i = 1; i < r.points.length; i++) {
          const prev = r.points[i - 1], curr = r.points[i]
          ctx.quadraticCurveTo(prev[0], prev[1], (prev[0] + curr[0]) / 2, (prev[1] + curr[1]) / 2)
        }
        ctx.lineTo(last[0], last[1])
        ctx.strokeStyle = a(palette.root, fade)
        ctx.lineWidth = Math.max(0.3, 1.0 - r.depth * 0.15)
        ctx.stroke()
        // Tip glow
        if (r.depth >= 3) {
          ctx.beginPath()
          ctx.arc(last[0], last[1], 1.0, 0, Math.PI * 2)
          ctx.fillStyle = a(palette.root, fade * 0.4)
          ctx.fill()
        }
      })

      // ── Trunk + branches ──
      tree.branches.forEach((b) => {
        const ba = Math.max(0.45, 1 - b.depth * 0.12)
        // Glow
        ctx.beginPath()
        ctx.moveTo(b.x1, b.y1)
        ctx.lineTo(b.x2, b.y2)
        ctx.strokeStyle = a(palette.trunkGlow, ba * 0.1)
        ctx.lineWidth = Math.max(1.5, b.thickness * 2.5)
        ctx.lineCap = "round"
        ctx.stroke()
        // Core
        ctx.beginPath()
        ctx.moveTo(b.x1, b.y1)
        ctx.lineTo(b.x2, b.y2)
        ctx.strokeStyle = a(b.depth === 0 ? palette.trunk : palette.branch, ba)
        ctx.lineWidth = Math.max(0.6, b.thickness)
        ctx.lineCap = "round"
        ctx.stroke()
      })

      // ── Canopy constellation ──
      // Lines between nearby leaves
      const leaves = tree.canopyLeaves
      for (let i = 0; i < leaves.length; i++) {
        for (let j = i + 1; j < leaves.length; j++) {
          const dx = leaves[i].x - leaves[j].x
          const dy = leaves[i].y - leaves[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 55) {
            const near = Math.sqrt((mx - (leaves[i].x + leaves[j].x) / 2) ** 2 + (my - (leaves[i].y + leaves[j].y) / 2) ** 2) < 60
            ctx.beginPath()
            ctx.moveTo(leaves[i].x, leaves[i].y)
            ctx.lineTo(leaves[j].x, leaves[j].y)
            ctx.strokeStyle = a(palette.leafRing, near ? 0.18 : 0.04)
            ctx.lineWidth = near ? 0.6 : 0.2
            ctx.stroke()
          }
        }
      }

      // Leaf nodes
      leaves.forEach((leaf) => {
        const dist = Math.sqrt((mx - leaf.x) ** 2 + (my - leaf.y) ** 2)
        const near = dist < 35
        const f = 0.3 + 0.7 * Math.sin(t * 1.6 + leaf.phase)
        const la = near ? 0.7 + 0.3 * f : 0.12 + 0.18 * f
        const lr = near ? leaf.r * 1.6 : leaf.r

        // Glow
        ctx.beginPath()
        ctx.arc(leaf.x, leaf.y, lr * (near ? 5 : 2.5), 0, Math.PI * 2)
        ctx.fillStyle = a(palette.leaf, la * (near ? 0.18 : 0.04))
        ctx.fill()
        // Core
        ctx.beginPath()
        ctx.arc(leaf.x, leaf.y, lr, 0, Math.PI * 2)
        ctx.fillStyle = a(palette.leafCore, la)
        ctx.fill()
      })

      // ── Tier clusters (always visible, integrated in canopy) ──
      tree.tierClusters.forEach((cluster, ci) => {
        const cDist = Math.sqrt((mx - cluster.cx) ** 2 + (my - cluster.cy) ** 2)
        const isHovered = cDist < cluster.radius * 2

        // Lines
        for (let i = 0; i < cluster.leaves.length; i++) {
          for (let j = i + 1; j < cluster.leaves.length; j++) {
            const la = cluster.leaves[i], lb = cluster.leaves[j]
            const d = Math.sqrt((la.x - lb.x) ** 2 + (la.y - lb.y) ** 2)
            if (d < cluster.radius * 0.75) {
              ctx.beginPath()
              ctx.moveTo(la.x, la.y)
              ctx.lineTo(lb.x, lb.y)
              ctx.strokeStyle = a(palette.leafRing, isHovered ? 0.3 : 0.08)
              ctx.lineWidth = isHovered ? 0.7 : 0.25
              ctx.stroke()
            }
          }
        }

        // Dots
        cluster.leaves.forEach((leaf) => {
          const f = 0.4 + 0.6 * Math.sin(t * 1.4 + leaf.phase)
          const la = isHovered ? 0.8 + 0.2 * f : 0.2 + 0.2 * f
          const lr = isHovered ? leaf.r * 1.4 : leaf.r

          ctx.beginPath()
          ctx.arc(leaf.x, leaf.y, lr * (isHovered ? 4.5 : 2.2), 0, Math.PI * 2)
          ctx.fillStyle = a(palette.leaf, la * (isHovered ? 0.2 : 0.05))
          ctx.fill()
          ctx.beginPath()
          ctx.arc(leaf.x, leaf.y, lr, 0, Math.PI * 2)
          ctx.fillStyle = a(palette.leafCore, la)
          ctx.fill()
        })
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
    const x = e.clientX - rect.left, y = e.clientY - rect.top
    mouseRef.current = { x, y }
    setHoveredTrunk(y / rect.height >= 0.30 && y / rect.height <= 0.65)

    if (treeDataRef.current) {
      let found: number | null = null
      for (let i = 0; i < treeDataRef.current.tierClusters.length; i++) {
        const c = treeDataRef.current.tierClusters[i]
        if (Math.sqrt((x - c.cx) ** 2 + (y - c.cy) ** 2) < c.radius * 2) { found = i; break }
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
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const handleCanvasClick = useCallback(() => {
    if (window.innerWidth < 640) setHoveredTrunk((h) => !h)
  }, [])

  const activeCluster = treeDataRef.current && hoveredCluster !== null ? treeDataRef.current.tree.tierClusters[hoveredCluster] : null

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      style={{ height: "clamp(380px, 52vw, 540px)" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCanvasClick}
    >
      <canvas ref={canvasRef} className="absolute inset-0" style={{ cursor: hoveredCluster !== null ? "pointer" : "default" }} />

      <AnimatePresence>
        {activeCluster && (
          <motion.div
            key={`tip-${hoveredCluster}`}
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

      {treeDataRef.current && treeDataRef.current.tree.tierClusters.map((cluster, i) => (
        <button
          key={i}
          onClick={(e) => handleLeafClick(cluster.href, e)}
          className="absolute z-30 rounded-full bg-transparent"
          style={{ left: cluster.cx - cluster.radius, top: cluster.cy - cluster.radius, width: cluster.radius * 2, height: cluster.radius * 2 }}
          aria-label={`Go to ${cluster.label}`}
        />
      ))}

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
