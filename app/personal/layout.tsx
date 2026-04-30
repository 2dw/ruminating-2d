"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Camera, Home, Palette, PenTool, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

const tabs = [
  { title: "Creative Endeavors", href: "/personal/creative", icon: <Palette className="h-4 w-4" /> },
  { title: "Imagery Meanderings", href: "/personal/imagery", icon: <Camera className="h-4 w-4" /> },
  { title: "The Story Is Being Written", href: "/personal/story", icon: <PenTool className="h-4 w-4" /> },
]

export default function PersonalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/personal"
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const [hoverStyle, setHoverStyle] = useState({})
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const index = tabs.findIndex(
      (tab) => pathname === tab.href || (tab.href !== "/personal" && pathname.startsWith(tab.href))
    )
    setActiveIndex(index >= 0 ? index : 0)
  }, [pathname])

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex]
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        })
      }
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
  }, [activeIndex])

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setIsDarkMode(isDark)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500">
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-[#0a1015]/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950 dark:text-blue-300 dark:hover:border-blue-500 dark:hover:bg-blue-950/50"
              >
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
              <motion.h1
                className="text-xl font-serif font-bold text-blue-700 dark:text-blue-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                Mind Wanderings
              </motion.h1>
            </div>

            <div className="relative hidden md:block">
              <div
                className="absolute h-[30px] transition-all duration-300 ease-out bg-blue-100/50 dark:bg-blue-900/30 rounded-[6px] flex items-center"
                style={{
                  ...hoverStyle,
                  opacity: hoveredIndex !== null ? 1 : 0,
                }}
              />

              <motion.div
                className="absolute bottom-[-16px] h-[2px] bg-blue-600 dark:bg-blue-400 transition-all duration-300 ease-out"
                style={activeStyle}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />

              <div className="relative flex space-x-[6px] items-center">
                {tabs.map((tab, index) => (
                  <motion.div
                    key={tab.href}
                    ref={(el) => {
                      if (el) tabRefs.current[index] = el
                    }}
                    className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
                      index === activeIndex ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href={tab.href} className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full gap-1.5">
                      {tab.icon}
                      {tab.title}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center">
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
