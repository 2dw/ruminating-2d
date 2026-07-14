"use client"

import { useEffect, useMemo, useState } from "react"
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
    delay: Math.random() * 8 + i * 3,
    duration: Math.random() * 1.5 + 1,
  }))
}

const piscesConstellation = [
  { x: 75, y: 25 },
  { x: 78, y: 28 },
  { x: 80, y: 32 },
  { x: 82, y: 36 },
  { x: 85, y: 40 },
  { x: 83, y: 44 },
  { x: 80, y: 48 },
  { x: 77, y: 52 },
  { x: 74, y: 56 },
  { x: 71, y: 60 },
  { x: 68, y: 64 },
  { x: 65, y: 68 },
]

const northStar = { x: 50, y: 15 }

export function UnderConstruction({
  quote = "Not all those who wander are lost",
  author = "J.R.R. Tolkien",
  className = "",
}: UnderConstructionProps) {
  const stars = useMemo(() => generateStars(150), [])
  const shootingStars = useMemo(() => generateShootingStars(4), [])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={`relative min-h-[500px] overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a0f1a] ${className}`}
    >
      {/* Starry background */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* North Star with glow */}
      <motion.div
        className="absolute"
        style={{
          left: `${northStar.x}%`,
          top: `${northStar.y}%`,
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          opacity: [0.8, 1, 0.8],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          <div className="h-3 w-3 rounded-full bg-yellow-200 shadow-[0_0_15px_5px_rgba(253,224,71,0.5)]" />
          <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-yellow-200 opacity-30" />
        </div>
      </motion.div>

      {/* Pisces constellation */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Constellation lines */}
        {piscesConstellation.slice(0, -1).map((point, i) => {
          const next = piscesConstellation[i + 1]
          return (
            <motion.line
              key={`line-${i}`}
              x1={point.x}
              y1={point.y}
              x2={next.x}
              y2={next.y}
              stroke="rgba(147, 197, 253, 0.3)"
              strokeWidth="0.2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={mounted ? { pathLength: 1, opacity: 1 } : {}}
              transition={{
                duration: 1.5,
                delay: i * 0.15,
                ease: "easeOut",
              }}
            />
          )
        })}

        {/* Constellation stars */}
        {piscesConstellation.map((point, i) => (
          <motion.circle
            key={`star-${i}`}
            cx={point.x}
            cy={point.y}
            r="0.6"
            fill="#93c5fd"
            initial={{ opacity: 0, scale: 0 }}
            animate={mounted ? { opacity: 1, scale: 1 } : {}}
            transition={{
              duration: 0.5,
              delay: i * 0.15 + 0.5,
            }}
          />
        ))}
      </svg>

      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <motion.div
          key={`shooting-${star.id}`}
          className="absolute h-0.5 w-16 origin-left"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            transform: `rotate(${star.angle}deg)`,
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={
            mounted
              ? {
                  opacity: [0, 1, 1, 0],
                  scaleX: [0, 1, 1, 0],
                  x: [0, 100, 200],
                }
              : {}
          }
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "easeOut",
          }}
        >
          <div className="h-full w-full rounded-full bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]" />
        </motion.div>
      ))}

      {/* Quote content */}
      <div className="relative z-10 flex min-h-[500px] flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <p className="font-serif text-2xl italic leading-relaxed text-white/90 md:text-3xl lg:text-4xl">
            &ldquo;{quote}&rdquo;
          </p>
          <p className="mt-4 text-sm tracking-widest text-blue-300/60 uppercase">
            &mdash; {author}
          </p>
        </motion.div>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-xs font-medium tracking-wider text-blue-300/70 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            Under Construction
          </span>
        </motion.div>
      </div>
    </div>
  )
}
