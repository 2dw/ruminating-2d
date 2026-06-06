"use client"

import { useEffect, useRef } from "react"

interface Star {
  x: number
  y: number
  z: number // depth factor for parallax/size 0..1
  baseAlpha: number
  twinklePhase: number
  twinkleSpeed: number
  // glow energy raised by mouse proximity, decays over time
  energy: number
}

interface ConstellationBackgroundProps {
  /** Accent color for the connection lines, RGB tuple */
  accent?: [number, number, number]
  /** Base star density per 10,000 px^2 */
  density?: number
}

export function ConstellationBackground({
  accent = [125, 211, 252], // sky-300-ish
  density = 0.12,
}: ConstellationBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -9999, y: -9999, active: false })
  const rafRef = useRef<number>(0)
  const dimsRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 })
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    reducedMotionRef.current = prefersReduced.matches
    const onReducedChange = () => {
      reducedMotionRef.current = prefersReduced.matches
    }
    prefersReduced.addEventListener("change", onReducedChange)

    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const createStar = (w: number, h: number, atY?: number): Star => {
      const z = Math.random()
      return {
        x: Math.random() * w,
        y: atY !== undefined ? atY : Math.random() * h,
        z,
        baseAlpha: 0.25 + Math.random() * 0.6,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.4 + Math.random() * 1.2,
        energy: 0,
      }
    }

    const targetCount = () => {
      const { w, h } = dimsRef.current
      return Math.round(((w * h) / 10000) * density)
    }

    const seedStars = () => {
      const { w, h } = dimsRef.current
      const count = targetCount()
      const stars: Star[] = []
      for (let i = 0; i < count; i++) stars.push(createStar(w, h))
      starsRef.current = stars
    }

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      dimsRef.current = { w, h }
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (starsRef.current.length === 0) {
        seedStars()
      } else {
        // keep stars in-bounds on resize
        for (const s of starsRef.current) {
          if (s.x > w) s.x = Math.random() * w
          if (s.y > h) s.y = Math.random() * h
        }
      }
    }

    resize()

    // Add a burst of new stars when scrolling, so the field "extends".
    let lastScrollY = window.scrollY
    let scrollAccum = 0
    const MAX_STARS = 320
    const onScroll = () => {
      const { w, h } = dimsRef.current
      const dy = window.scrollY - lastScrollY
      lastScrollY = window.scrollY
      scrollAccum += Math.abs(dy)
      // every ~60px of scroll, spawn a couple of stars near the leading edge
      while (scrollAccum > 60) {
        scrollAccum -= 60
        if (starsRef.current.length >= MAX_STARS) {
          // recycle: drop a faint one
          starsRef.current.shift()
        }
        const enteringTop = dy < 0
        const spawnY = enteringTop ? Math.random() * h * 0.2 : h - Math.random() * h * 0.2
        const star = createStar(w, h, spawnY)
        star.energy = 0.5 // brief glow as it appears
        starsRef.current.push(star)
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true }
    }
    const onMouseLeave = () => {
      mouseRef.current.active = false
    }

    const [ar, ag, ab] = accent
    const HOVER_RADIUS = 150
    const LINK_DIST = 130

    const render = (t: number) => {
      const { w, h } = dimsRef.current
      const stars = starsRef.current
      const mouse = mouseRef.current
      const time = t / 1000

      ctx.clearRect(0, 0, w, h)

      // Find stars near the mouse for constellation networking
      const near: Star[] = []

      for (const s of stars) {
        // mouse proximity raises energy
        if (mouse.active) {
          const dx = s.x - mouse.x
          const dy = s.y - mouse.y
          const dist = Math.hypot(dx, dy)
          if (dist < HOVER_RADIUS) {
            const influence = 1 - dist / HOVER_RADIUS
            s.energy = Math.min(1, s.energy + influence * 0.08)
            near.push(s)
          }
        }
        // decay energy over time
        s.energy *= 0.96

        // twinkle
        const twinkle = reducedMotionRef.current
          ? 1
          : 0.65 + 0.35 * Math.sin(time * s.twinkleSpeed + s.twinklePhase)
        const size = (0.6 + s.z * 1.6) * (1 + s.energy * 1.2)
        const alpha = Math.min(1, s.baseAlpha * twinkle + s.energy * 0.7)

        // glow halo for energized stars
        if (s.energy > 0.05) {
          const glowR = size * 6
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR)
          g.addColorStop(0, `rgba(${ar}, ${ag}, ${ab}, ${0.35 * s.energy})`)
          g.addColorStop(1, `rgba(${ar}, ${ag}, ${ab}, 0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.beginPath()
        ctx.fillStyle = `rgba(${220 + s.z * 35}, ${235}, ${255}, ${alpha})`
        ctx.arc(s.x, s.y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw constellation network among stars near the mouse
      if (mouse.active && near.length > 1) {
        for (let i = 0; i < near.length; i++) {
          for (let j = i + 1; j < near.length; j++) {
            const a = near[i]
            const b = near[j]
            const dx = a.x - b.x
            const dy = a.y - b.y
            const dist = Math.hypot(dx, dy)
            if (dist < LINK_DIST) {
              const strength = (1 - dist / LINK_DIST) * Math.min(a.energy, b.energy)
              if (strength <= 0.02) continue
              ctx.beginPath()
              ctx.strokeStyle = `rgba(${ar}, ${ag}, ${ab}, ${strength * 0.6})`
              ctx.lineWidth = 0.6 + strength
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
            }
          }
          // also link each near star to the cursor for a "neural" feel
          const a = near[i]
          const dx = a.x - mouse.x
          const dy = a.y - mouse.y
          const dist = Math.hypot(dx, dy)
          const strength = (1 - dist / HOVER_RADIUS) * a.energy
          if (strength > 0.04) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${ar}, ${ag}, ${ab}, ${strength * 0.35})`
            ctx.lineWidth = 0.5
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()
          }
        }
      }

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    window.addEventListener("resize", resize)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("mouseleave", onMouseLeave)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
      prefersReduced.removeEventListener("change", onReducedChange)
    }
  }, [accent, density])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden dark:block"
    >
      {/* Dark blue sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060c1a] via-[#0a1530] to-[#050a16]" />
      {/* Subtle radial vignette glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(56,108,189,0.18),transparent_60%)]" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
