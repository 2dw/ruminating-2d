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
}

interface MyceliumPath {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  startNodeId: string | null
  endNodeId: string
}

function generateMyceliumGrid() {
  const paths: MyceliumPath[] = []
  const nodes: MyceliumNode[] = []
  
  // Root origins along the top header area (percentages of screen width)
  const origins = [8, 20, 36, 50, 64, 80, 92]
  let nodeId = 0
  let pathId = 0
  
  function grow(x: number, y: number, angle: number, length: number, depth: number, parentNodeId: string | null) {
    if (depth > 4) return
    
    const rad = angle
    const endX = x + Math.cos(rad) * length
    const endY = y + Math.sin(rad) * length * 1.3 // stretch vertically slightly
    
    // keep it in the top 35% of the screen to blend with header
    if (endX < 0 || endX > 100 || endY < 0 || endY > 35) return
    
    const nodeKey = `mycelium-node-${nodeId++}`
    const pathKey = `mycelium-path-${pathId++}`
    
    nodes.push({
      id: nodeKey,
      x: endX,
      y: endY,
      size: 1.0 + (4 - depth) * 0.4,
    })
    
    paths.push({
      id: pathKey,
      startX: x,
      startY: y,
      endX,
      endY,
      startNodeId: parentNodeId,
      endNodeId: nodeKey,
    })
    
    const branchChance = 0.55
    if (Math.random() < branchChance) {
      grow(endX, endY, angle - (0.2 + Math.random() * 0.35), length * 0.72, depth + 1, nodeKey)
      grow(endX, endY, angle + (0.2 + Math.random() * 0.35), length * 0.72, depth + 1, nodeKey)
    } else {
      grow(endX, endY, angle + (Math.random() * 0.3 - 0.15), length * 0.78, depth + 1, nodeKey)
    }
  }
  
  origins.forEach((origX) => {
    // Start grow pointing mostly downwards (PI/2 = 90 deg)
    grow(origX, 0, Math.PI / 2 + (Math.random() * 0.3 - 0.15), 5 + Math.random() * 3, 0, null)
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
          const nodeColor = isDarkMode ? "rgba(45, 212, 191, 0.9)" : "rgba(13, 148, 136, 0.75)"
          
          return (
            <span
              key={node.id}
              className="absolute rounded-full transition-all duration-300"
              style={{
                backgroundColor: nodeColor,
                boxShadow: activity > 0
                  ? `0 0 ${node.size * (4 + activity * 6)}px ${nodeColor}, 0 0 ${node.size * (2 + activity * 3)}px #ffffff`
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

          {/* Render mycelium network paths */}
          {mycelium.paths.map((path) => {
            const activity = activeMyceliumPaths[path.id] || 0
            const baseOpacity = isDarkMode ? 0.10 : 0.06
            const activeOpacity = activity * 0.58
            const totalOpacity = baseOpacity + activeOpacity
            
            // Traveling electron pulse properties
            const showPulse = activity > 0.05
            const distance = Math.hypot(
              ((path.endX - path.startX) / 100) * (typeof window !== "undefined" ? window.innerWidth : 1000),
              ((path.endY - path.startY) / 100) * (typeof window !== "undefined" ? window.innerHeight : 800)
            )
            const speed = 150 // pixels per second (balanced for a gentle, organic flow)
            const duration = Math.max(0.3, distance / speed)

            return (
              <g key={path.id}>
                {/* Base mycelium strand */}
                <line
                  x1={`${path.startX}%`}
                  y1={`${path.startY}%`}
                  x2={`${path.endX}%`}
                  y2={`${path.endY}%`}
                  stroke={lineColor}
                  strokeLinecap="round"
                  strokeOpacity={totalOpacity}
                  strokeWidth={1.0 + activity * 2.0}
                  filter="url(#mycelium-biolume)"
                  className="transition-all duration-300"
                />

                {/* Traveling electron pulse along the mycelium strand */}
                {showPulse && (
                  <motion.line
                    x1={`${path.startX}%`}
                    y1={`${path.startY}%`}
                    x2={`${path.endX}%`}
                    y2={`${path.endY}%`}
                    stroke={isDarkMode ? "#2dd4bf" : "#0f766e"}
                    strokeLinecap="round"
                    strokeOpacity={activity}
                    strokeWidth={1.8 + activity * 1.8}
                    strokeDasharray="6, 14"
                    animate={{
                      strokeDashoffset: [0, -20],
                    }}
                    transition={{
                      strokeDashoffset: {
                        repeat: Infinity,
                        ease: "linear",
                        duration: duration,
                      },
                    }}
                    filter="url(#constellation-glow)"
                  />
                )}
              </g>
            )
          })}

          {/* Render normal constellation connections with electron pulses */}
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
                {/* Traveling electron pulse */}
                <motion.line
                  x1={connection.x1}
                  y1={connection.y1}
                  x2={connection.x2}
                  y2={connection.y2}
                  stroke={isDarkMode ? "#38bdf8" : "#0284c7"}
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
                      duration: duration,
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
