"use client"

import { memo, useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"

interface ShootingStarProps {
  delay?: number
  duration?: number
  size?: number
  color?: string
}

export const ShootingStar = memo(function ShootingStar({
  delay = 0,
  duration = 1.5,
  size = 2,
  color = "rgba(255, 255, 255, 0.8)",
}: ShootingStarProps) {
  const [position, setPosition] = useState({ x: 0, y: 0, angle: -45 })
  const [isVisible, setIsVisible] = useState(false)

  const generateRandomPosition = useCallback(() => {
    const x = Math.random() * 100
    const y = Math.random() * 30
    const angle = -30 - Math.random() * 30
    setPosition({ x, y, angle })
  }, [])

  useEffect(() => {
    generateRandomPosition()

    const intervalId = setInterval(
      () => {
        setIsVisible(false)
        setTimeout(() => {
          generateRandomPosition()
          setIsVisible(true)
          setTimeout(() => { setIsVisible(false) }, duration * 1000)
        }, 300)
      },
      (30 + Math.random() * 20) * 1000,
    )

    const initialTimeout = setTimeout(() => {
      setIsVisible(true)
      setTimeout(() => { setIsVisible(false) }, duration * 1000)
    }, delay * 1000)

    return () => {
      clearInterval(intervalId)
      clearTimeout(initialTimeout)
    }
  }, [delay, duration, generateRandomPosition])

  const distance = 150
  const endX = position.x + distance * Math.cos((position.angle * Math.PI) / 180)
  const endY = position.y + distance * Math.sin((position.angle * Math.PI) / 180) * -1

  return (
    <div
      className="fixed pointer-events-none z-10"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        opacity: isVisible ? 1 : 0,
      }}
      aria-hidden="true"
    >
      <motion.div
        initial={{ x: 0, y: 0, opacity: 0, scale: 0.8 }}
        animate={
          isVisible
            ? {
                x: `${endX - position.x}%`,
                y: `${endY - position.y}%`,
                opacity: [0, 1, 0.8, 0],
                scale: [1, 0.8, 0.4, 0],
              }
            : {}
        }
        transition={{
          duration,
          ease: "easeOut",
          times: [0, 0.1, 0.8, 1],
        }}
        style={{
          width: `${size}px`,
          height: `${size * 30}px`,
          background: `linear-gradient(to bottom, transparent, ${color})`,
          borderRadius: `${size}px`,
          transform: `rotate(${position.angle}deg)`,
          transformOrigin: "center top",
          boxShadow: `0 0 ${size * 2}px ${color}`,
        }}
      />
    </div>
  )
})
