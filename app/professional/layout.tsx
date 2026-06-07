"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Home, Lightbulb, Moon, Sparkles, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

const tabs = [
  { title: "Me Until Now", href: "/professional/me", icon: <BookOpen className="h-4 w-4" /> },
  { title: "Tiny Endeavors", href: "/professional/endeavors", icon: <Sparkles className="h-4 w-4" /> },
  { title: "Mission Musings", href: "/professional/musings", icon: <Lightbulb className="h-4 w-4" /> },
]

export default function ProfessionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/professional"
  const isRoot = pathname === "/professional" || pathname === "/professional/"
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const [hoverStyle, setHoverStyle] = useState({})
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const index = tabs.findIndex((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`))
    setActiveIndex(index >= 0 ? index : 0)
  }, [pathname])

  useEffect(() => {
    if (hoveredIndex === null) return

    const hoveredElement = tabRefs.current[hoveredIndex]
    if (hoveredElement) {
      const { offsetLeft, offsetWidth } = hoveredElement
      setHoverStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      })
    }
  }, [hoveredIndex])

  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex]
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      })
    }
  }, [activeIndex, pathname])

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"))
  }, [])

  const toggleDarkMode = () => {
    const nextDarkMode = !isDarkMode
    setIsDarkMode(nextDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fcff] text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-[#0a1015]/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-green-600 shadow-sm transition hover:border-green-300 hover:bg-green-50 dark:border-slate-800 dark:bg-slate-950 dark:text-green-300 dark:hover:border-green-500 dark:hover:bg-green-950/50"
              >
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
              <motion.h1
                className="text-xl font-serif font-bold text-green-700 dark:text-green-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                Professional Repertoire
              </motion.h1>
            </div>

            <div className="relative hidden md:block">
              <div
                className="absolute flex h-[30px] items-center rounded-[6px] bg-green-100/50 transition-all duration-300 ease-out dark:bg-green-900/30"
                style={{
                  ...hoverStyle,
                  opacity: hoveredIndex !== null ? 1 : 0,
                }}
              />

              <motion.div
                className="absolute bottom-[-16px] h-[2px] bg-green-600 transition-all duration-300 ease-out dark:bg-green-400"
                style={activeStyle}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />

              <div className="relative flex items-center space-x-[6px]">
                {tabs.map((tab, index) => {
                  const anchorHref = isRoot ? `#${tab.href.split("/").pop()}` : tab.href

                  return (
                    <motion.div
                      key={tab.href}
                      ref={(el) => {
                        tabRefs.current[index] = el
                      }}
                      className={`h-[30px] cursor-pointer px-3 py-2 transition-colors duration-300 ${
                        index === activeIndex ? "text-green-700 dark:text-green-300" : "text-gray-600 dark:text-gray-400"
                      }`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isRoot ? (
                        <a href={anchorHref} className="flex h-full items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium leading-5">
                          {tab.icon}
                          {tab.title}
                        </a>
                      ) : (
                        <Link href={anchorHref} className="flex h-full items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium leading-5">
                          {tab.icon}
                          {tab.title}
                        </Link>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <div className="hidden items-center md:flex">
              <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="ml-4">
                {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
