"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ShootingStar } from "./shooting-star"

interface StarryBackgroundProps {
  shootingStarCount?: number
}

export function StarryBackground({ shootingStarCount = 3 }: StarryBackgroundProps) {
  const [shootingStars, setShootingStars] = useState<React.ReactNode[]>([])

  useEffect(() => {
    // Create multiple shooting stars with different delays and properties
    const stars = Array.from({ length: shootingStarCount }).map((_, index) => {
      const delay = index * 5 + Math.random() * 10 // Stagger initial appearances
      const duration = 1 + Math.random() * 1.5 // Random duration between 1-2.5s
      const size = 1 + Math.random() * 2 // Random size between 1-3px

      // Randomize colors between white, blue-ish, and yellow-ish
      const colors = ["rgba(255, 255, 255, 0.8)", "rgba(220, 240, 255, 0.8)", "rgba(255, 250, 220, 0.8)"]
      const color = colors[Math.floor(Math.random() * colors.length)]

      return <ShootingStar key={`shooting-star-${index}`} delay={delay} duration={duration} size={size} color={color} />
    })

    setShootingStars(stars)
  }, [shootingStarCount])

  return <>{shootingStars}</>
}
