"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ShootingStar } from "./shooting-star"

interface StarryBackgroundProps {
  shootingStarCount?: number
  isDarkMode?: boolean
}

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  delay: number
}

interface Connection {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  opacity: number
}

interface PointerGlow {
  x: number
  y: number
  active: boolean
}

interface MyceliumNode {
  id: string
  x: number
  y: number
  size: number
  depth: number
}

interface MyceliumPath {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  cp1X: number  // cubic bezier control point 1
  cp1Y: number
  cp2X: number  // cubic bezier control point 2
  cp2Y: number
  startNodeId: string | null
  endNodeId: string
  depth: number
}

// Seeded deterministic pseudo-random so the grid is stable across re-renders
let _seed = 42
function srng() {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff
  return ((_seed >>> 0) / 0xffffffff)
}
function resetSrng() { _seed = 42 }

// Green palette shades for mycelium nodes (dark mode) keyed by depth
const GREEN_SHADES_DARK = [
  "rgba(21, 128, 61, 0.9)",   // depth 0 – forest-green root
  "rgba(22, 163, 74, 0.85)",  // depth 1
  "rgba(34, 197, 94, 0.82)",  // depth 2
  "rgba(74, 222, 128, 0.78)", // depth 3
  "rgba(134, 239, 172, 0.7)", // depth 4 – light emerald tips
]
const GREEN_SHADES_LIGHT = [
  "rgba(20, 83, 45, 0.85)",   // depth 0
  "rgba(21, 128, 61, 0.75)",  // depth 1
  "rgba(22, 163, 74, 0.68)",  // depth 2
  "rgba(34, 197, 94, 0.58)",  // depth 3
  "rgba(74, 222, 128, 0.48)", // depth 4
]

function generateMyceliumGrid() {
  resetSrng()
  const paths: MyceliumPath[] = []
  const nodes: MyceliumNode[] = []
  
  // Root origins along the top header area (percentages of screen width)
  const origins = [5, 15, 28, 42, 56, 70, 83, 94]
  let nodeId = 0
  let pathId = 0
  
  function grow(
    x: number, y: number,
    angle: number, length: number,
    depth: number, parentNodeId: string | null
  ) {
    if (depth > 5) return
    
    const endX = x + Math.cos(angle) * length
    const endY = y + Math.sin(angle) * length * 1.2
    
    // Keep roots in the top ~38% of screen to overlap with the transparent header
    if (endX < -2 || endX > 102 || endY < -1 || endY > 38) return
    
    // Cubic bezier control points — pull them sideways to create a meander
    const drift1 = (srng() - 0.5) * length * 1.8
    const drift2 = (srng() - 0.5) * length * 1.4
    const cp1X = x + (endX - x) * 0.3 + drift1
    const cp1Y = y + (endY - y) * 0.3 + (srng() - 0.3) * length * 0.6
    const cp2X = x + (endX - x) * 0.7 + drift2
    const cp2Y = y + (endY - y) * 0.7 + (srng() - 0.3) * length * 0.5

    const nodeKey = `mycelium-node-${nodeId++}`
    const pathKey = `mycelium-path-${pathId++}`
    
    nodes.push({
      id: nodeKey,
      x: endX,
      y: endY,
      size: 1.2 + (5 - depth) * 0.45,
      depth,
    })
    
    paths.push({
      id: pathKey,
      startX: x, startY: y,
      endX, endY,
      cp1X, cp1Y, cp2X, cp2Y,
      startNodeId: parentNodeId,
      endNodeId: nodeKey,
      depth,
    })
    
    // Vary branching based on depth: denser near root
    const branchChance = depth < 2 ? 0.72 : 0.48
    const spread = 0.18 + srng() * 0.38
    if (srng() < branchChance) {
      grow(endX, endY, angle - spread, length * (0.68 + srng() * 0.12), depth + 1, nodeKey)
      grow(endX, endY, angle + spread, length * (0.68 + srng() * 0.12), depth + 1, nodeKey)
    } else {
      grow(endX, endY, angle + (srng() * 0.28 - 0.14), length * (0.75 + srng() * 0.1), depth + 1, nodeKey)
    }
  }
  
  origins.forEach((origX) => {
    const startAngle = Math.PI / 2 + (srng() * 0.4 - 0.2)
    grow(origX, 0, startAngle, 4.5 + srng() * 3.5, 0, null)
  })
  
  return { paths, nodes }
}

function randomFrom(seed: number) {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

export function StarryBackground({ shootingStarCount = 3, isDarkMode = false }: StarryBackgroundProps) {
  const [shootingStars, setShootingStars] = useState<React.ReactNode[]>([])
  const [stars, setStars] = useState<Star[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [pointerGlow, setPointerGlow] = useState<PointerGlow>({ x: 0, y: 0, active: false })
  
  const [mycelium, setMycelium] = useState<{ paths: MyceliumPath[]; nodes: MyceliumNode[] }>({ paths: [], nodes: [] })
  const [activeMyceliumNodes, setActiveMyceliumNodes] = useState<Record<string, number>>({})
  const [activeMyceliumPaths, setActiveMyceliumPaths] = useState<Record<string, number>>({})
  // Normalised 0-1 position of pointer within viewport height (0 = top, 1 = bottom)
  const [pointerYNorm, setPointerYNorm] = useState(0)
  
  const starsRef = useRef<Star[]>([])
  const myceliumRef = useRef<{ paths: MyceliumPath[]; nodes: MyceliumNode[] }>({ paths: [], nodes: [] })
  const frameRef = useRef<number | null>(null)
  const clearRef = useRef<number | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const grid = generateMyceliumGrid()
    myceliumRef.current = grid
    setMycelium(grid)
  }, [])

  useEffect(() => {
    // Create multiple shooting stars with different delays and properties.
    const stars = Array.from({ length: shootingStarCount }).map((_, index) => {
      const delay = index * 5 + Math.random() * 10
      const duration = 1 + Math.random() * 1.5
      const size = 1 + Math.random() * 2
      const colors = ["rgba(255, 255, 255, 0.8)", "rgba(220, 240, 255, 0.8)", "rgba(255, 250, 220, 0.8)"]
      const color = colors[Math.floor(Math.random() * colors.length)]

      return <ShootingStar key={`shooting-star-${index}`} delay={delay} duration={duration} size={size} color={color} />
    })

    setShootingStars(stars)
  }, [shootingStarCount])

  useEffect(() => {
    const createStars = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const density = width < 640 ? 0.00018 : width < 1024 ? 0.00014 : 0.00011
      const count = Math.min(280, Math.max(110, Math.floor(width * height * density)))
      const nextStars = Array.from({ length: count }, (_, index) => {
        const seed = index + width * 0.131 + height * 0.173

        return {
          id: index,
          x: randomFrom(seed) * 100,
          y: randomFrom(seed + 37.2) * 100,
          size: 2.4 + randomFrom(seed + 9.4) * 3.4,
          opacity: 0.48 + randomFrom(seed + 16.8) * 0.38,
          delay: randomFrom(seed + 24.1) * -8,
        }
      })

      starsRef.current = nextStars
      setStars(nextStars)
    }

    createStars()
    window.addEventListener("resize", createStars)

    return () => {
      window.removeEventListener("resize", createStars)
    }
  }, [])

  useEffect(() => {
    const updateConstellation = () => {
      frameRef.current = null

      const width = window.innerWidth
      const height = window.innerHeight
      const radius = width < 640 ? 150 : 210
      const maxConnectionDistance = width < 640 ? 98 : 128
      const pointer = pointerRef.current
      const nearby = starsRef.current
        .map((star) => {
          const x = (star.x / 100) * width
          const y = (star.y / 100) * height
          const distance = Math.hypot(x - pointer.x, y - pointer.y)

          return { ...star, px: x, py: y, distance }
        })
        .filter((star) => star.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 28)

      const nextConnections: Connection[] = []

      for (let index = 0; index < nearby.length; index += 1) {
        for (let nextIndex = index + 1; nextIndex < nearby.length; nextIndex += 1) {
          const star = nearby[index]
          const nextStar = nearby[nextIndex]
          const distance = Math.hypot(star.px - nextStar.px, star.py - nextStar.py)

          if (distance > maxConnectionDistance) {
            continue
          }

          const pointerStrength = 1 - Math.max(star.distance, nextStar.distance) / radius
          const lineStrength = 1 - distance / maxConnectionDistance

          nextConnections.push({
            id: `${star.id}-${nextStar.id}`,
            x1: star.px,
            y1: star.py,
            x2: nextStar.px,
            y2: nextStar.py,
            opacity: Math.min(0.78, pointerStrength * lineStrength * 0.95),
          })

          if (nextConnections.length >= 54) {
            break
          }
        }

        if (nextConnections.length >= 54) {
          break
        }
      }

      setConnections(nextConnections)
      setPointerGlow({ x: pointer.x, y: pointer.y, active: true })

      // Track vertical position for colour morphing (0 = top, 1 = bottom)
      setPointerYNorm(Math.min(1, Math.max(0, pointer.y / window.innerHeight)))

      // Calculate distances for mycelium nodes
      const nextActiveNodes: Record<string, number> = {}
      myceliumRef.current.nodes.forEach((node) => {
        const px = (node.x / 100) * width
        const py = (node.y / 100) * height
        const distance = Math.hypot(px - pointer.x, py - pointer.y)
        if (distance <= radius) {
          const strength = 1 - distance / radius
          nextActiveNodes[node.id] = strength
        }
      })
      setActiveMyceliumNodes(nextActiveNodes)

      // Calculate activity for mycelium paths
      const nextActivePaths: Record<string, number> = {}
      myceliumRef.current.paths.forEach((path) => {
        let s1 = 0
        if (path.startNodeId) {
          s1 = nextActiveNodes[path.startNodeId] || 0
        } else {
          const startPx = (path.startX / 100) * width
          const startPy = 0
          const dist = Math.hypot(startPx - pointer.x, startPy - pointer.y)
          s1 = dist < radius ? 1 - dist / radius : 0
        }
        const s2 = nextActiveNodes[path.endNodeId] || 0
        const activity = Math.max(s1, s2)
        if (activity > 0) {
          nextActivePaths[path.id] = activity
        }
      })
      setActiveMyceliumPaths(nextActivePaths)
    }

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY }

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updateConstellation)
      }

      if (clearRef.current !== null) {
        window.clearTimeout(clearRef.current)
      }

      clearRef.current = window.setTimeout(() => {
        setConnections([])
        setActiveMyceliumNodes({})
        setActiveMyceliumPaths({})
        setPointerGlow((current) => ({ ...current, active: false }))
      }, 1400)
    }

    const handlePointerLeave = () => {
      setConnections([])
      setActiveMyceliumNodes({})
      setActiveMyceliumPaths({})
      setPointerGlow((current) => ({ ...current, active: false }))
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerleave", handlePointerLeave)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerleave", handlePointerLeave)

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }

      if (clearRef.current !== null) {
        window.clearTimeout(clearRef.current)
      }
    }
  }, [])

  const starColor = isDarkMode ? "rgba(232, 248, 255, 1)" : "rgba(15, 81, 104, 1)"
  const lineColor = isDarkMode ? "rgba(103, 232, 249, 1)" : "rgba(8, 126, 164, 1)"
  const glowColor = isDarkMode ? "rgba(20, 184, 166, 0.16)" : "rgba(8, 145, 178, 0.13)"

  // Lerp a color channel value from green zone → sky-blue zone based on pointer Y
  // pointerYNorm: 0 = top header area, 1 = bottom of page
  // mycelium zone = top 0–30%, constellation zone = 30%+
  const morphT = Math.min(1, Math.max(0, (pointerYNorm - 0.15) / 0.45))
  // Green electron: rgb(34, 197, 94) → Sky-blue electron: rgb(56, 189, 248)
  const electronR = Math.round(34 + (56 - 34) * morphT)
  const electronG = Math.round(197 + (189 - 197) * morphT)
  const electronB = Math.round(94 + (248 - 94) * morphT)
  const electronColor = `rgb(${electronR}, ${electronG}, ${electronB})`
  // Dimmer version for mycelium strands
  const electronColorLight = isDarkMode
    ? `rgba(${electronR}, ${electronG}, ${electronB}, 0.75)`
    : `rgba(${Math.round(electronR * 0.7)}, ${Math.round(electronG * 0.7)}, ${Math.round(electronB * 0.5)}, 0.8)`

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 overflow-hidden"
        style={{
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 24%, rgba(45, 212, 191, 0.07), transparent 28%), radial-gradient(circle at 78% 39%, rgba(96, 165, 250, 0.09), transparent 25%)",
          }}
        />

        {/* Render normal constellation stars */}
        {stars.map((star) => (
          <span
            key={star.id}
            className="constellation-star absolute rounded-full"
            style={{
              animationDelay: `${star.delay}s`,
              backgroundColor: starColor,
              boxShadow: `0 0 ${star.size * 3}px ${starColor}`,
              height: `${star.size}px`,
              left: `${star.x}%`,
              opacity: star.opacity,
              top: `${star.y}%`,
              width: `${star.size}px`,
            }}
          />
        ))}

        {/* Render mycelium network nodes */}
        {mycelium.nodes.map((node) => {
          const activity = activeMyceliumNodes[node.id] || 0
          const baseOpacity = isDarkMode ? 0.16 : 0.10
          const activeOpacity = activity * 0.85
          const totalOpacity = Math.min(1, baseOpacity + activeOpacity)
          const palette = isDarkMode ? GREEN_SHADES_DARK : GREEN_SHADES_LIGHT
          const nodeColor = palette[Math.min(node.depth, palette.length - 1)]
          
          return (
            <span
              key={node.id}
              className="absolute rounded-full transition-all duration-300"
              style={{
                backgroundColor: nodeColor,
                boxShadow: activity > 0
                  ? `0 0 ${node.size * (4 + activity * 6)}px ${nodeColor}, 0 0 ${node.size * (2 + activity * 3)}px #fff`
                  : `0 0 ${node.size * 2.5}px ${nodeColor}`,
                height: `${node.size + activity * 1.8}px`,
                left: `${node.x}%`,
                opacity: totalOpacity,
                top: `${node.y}%`,
                width: `${node.size + activity * 1.8}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )
        })}

        <svg className="absolute inset-0 h-full w-full" role="presentation">
          <defs>
            <filter id="constellation-glow">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="mycelium-biolume">
              <feGaussianBlur stdDeviation="3.2" result="blur1" />
              <feGaussianBlur stdDeviation="1.2" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render mycelium network paths as curved bezier strands */}
          {mycelium.paths.map((path) => {
            const activity = activeMyceliumPaths[path.id] || 0
            const palette = isDarkMode ? GREEN_SHADES_DARK : GREEN_SHADES_LIGHT
            const strandColor = palette[Math.min(path.depth, palette.length - 1)]
            const baseOpacity = isDarkMode ? 0.10 : 0.065
            const activeOpacity = activity * 0.58
            const totalOpacity = baseOpacity + activeOpacity
            
            const showPulse = activity > 0.05

            // Build the cubic bezier path string using percentage-based coords
            // SVG percentage coordinates work on viewBox but we use absolute pixel
            // percentages as attributes directly (they resolve at render time).
            const d = [
              `M ${path.startX}% ${path.startY}%`,
              `C ${path.cp1X}% ${path.cp1Y}%`,
              `  ${path.cp2X}% ${path.cp2Y}%`,
              `  ${path.endX}% ${path.endY}%`,
            ].join(" ")

            // Approximate arc length for speed calculation (rough but sufficient)
            const approxDist = Math.hypot(
              ((path.endX - path.startX) / 100) * (typeof window !== "undefined" ? window.innerWidth : 1000),
              ((path.endY - path.startY) / 100) * (typeof window !== "undefined" ? window.innerHeight : 800)
            ) * 1.35  // bezier is ~35% longer than straight chord
            const duration = Math.max(0.3, approxDist / 150)

            return (
              <g key={path.id}>
                {/* Base curved mycelium strand */}
                <path
                  d={d}
                  stroke={strandColor}
                  strokeLinecap="round"
                  strokeOpacity={totalOpacity}
                  strokeWidth={1.0 + activity * 2.0}
                  fill="none"
                  filter="url(#mycelium-biolume)"
                  className="transition-all duration-300"
                />

                {/* Traveling morphing electron pulse */}
                {showPulse && (
                  <motion.path
                    d={d}
                    stroke={electronColorLight}
                    strokeLinecap="round"
                    strokeOpacity={activity}
                    strokeWidth={1.8 + activity * 1.8}
                    fill="none"
                    strokeDasharray="6, 14"
                    animate={{
                      strokeDashoffset: [0, -20],
                    }}
                    transition={{
                      strokeDashoffset: {
                        repeat: Infinity,
                        ease: "linear",
                        duration,
                      },
                    }}
                    filter="url(#constellation-glow)"
                  />
                )}
              </g>
            )
          })}

          {/* Render normal constellation connections with morphing electron pulses */}
          {connections.map((connection) => {
            const distance = Math.hypot(connection.x2 - connection.x1, connection.y2 - connection.y1)
            const speed = 175 // pixels per second (balanced for a gentle, organic flow)
            const duration = Math.max(0.25, distance / speed)

            return (
              <g key={connection.id}>
                {/* Base connection line */}
                <line
                  x1={connection.x1}
                  y1={connection.y1}
                  x2={connection.x2}
                  y2={connection.y2}
                  stroke={lineColor}
                  strokeLinecap="round"
                  strokeOpacity={connection.opacity * 0.48}
                  strokeWidth={1.1 + connection.opacity * 1.7}
                  filter="url(#constellation-glow)"
                />
                {/* Traveling morphing electron pulse */}
                <motion.line
                  x1={connection.x1}
                  y1={connection.y1}
                  x2={connection.x2}
                  y2={connection.y2}
                  stroke={electronColor}
                  strokeLinecap="round"
                  strokeOpacity={connection.opacity}
                  strokeWidth={1.8 + connection.opacity * 1.8}
                  strokeDasharray="6, 18"
                  animate={{
                    strokeDashoffset: [0, -24],
                  }}
                  transition={{
                    strokeDashoffset: {
                      repeat: Infinity,
                      ease: "linear",
                      duration,
                    },
                  }}
                  filter="url(#constellation-glow)"
                />
              </g>
            )
          })}
        </svg>

        {pointerGlow.active ? (
          <span
            className="absolute rounded-full transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle, ${glowColor}, transparent 68%)`,
              height: 300,
              left: pointerGlow.x,
              opacity: 1,
              top: pointerGlow.y,
              transform: "translate(-50%, -50%)",
              width: 300,
            }}
          />
        ) : null}
      </div>
      {shootingStars}
    </>
  )
}
