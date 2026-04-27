"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Palette, Camera, PenTool, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { DynamicFrame } from "@/components/dynamic-frame"

const tabs = ["Creative Endeavors", "Imagery Meanderings", "The Story Is Being Written"]

const tabIcons = [
  <Palette key="creative" className="h-4 w-4" />,
  <Camera key="imagery" className="h-4 w-4" />,
  <PenTool key="story" className="h-4 w-4" />,
]

export default function PersonalWorld() {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const tabRefs = useRef([])
  const [hoverStyle, setHoverStyle] = useState({})
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  useEffect(() => {
    // Initialize from DOM on mount to avoid hydration mismatch
    const isDark = document.documentElement.classList.contains("dark")
    setIsDarkMode(isDark)
  }, [])

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

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen w-full transition-colors duration-500 ${
        isDarkMode ? "dark bg-[#0a1015] text-white" : "bg-[#f8fcff] text-[#0e0f11]"
      }`}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-[#0a1015]/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/")}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  aria-label="Return to main portal"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h3v-6h6v6h6V10L12 1zm0 2.69L19 11v8h-2v-6H7v6H5v-8l7-7.31z" />
                  </svg>
                </Button>
              </motion.div>
              <motion.h1
                className="text-xl font-serif font-bold text-blue-700 dark:text-blue-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                Mind Wandering
              </motion.h1>
            </div>

            {/* Tabs Navigation */}
            <div className="relative hidden md:block">
              {/* Hover Highlight */}
              <div
                className="absolute h-[30px] transition-all duration-300 ease-out bg-blue-100/50 dark:bg-blue-900/30 rounded-[6px] flex items-center"
                style={{
                  ...hoverStyle,
                  opacity: hoveredIndex !== null ? 1 : 0,
                }}
              />

              {/* Active Indicator */}
              <motion.div
                className="absolute bottom-[-16px] h-[2px] bg-blue-600 dark:bg-blue-400 transition-all duration-300 ease-out"
                style={activeStyle}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Tabs */}
              <div className="relative flex space-x-[6px] items-center">
                {tabs.map((tab, index) => (
                  <motion.div
                    key={index}
                    ref={(el) => (tabRefs.current[index] = el)}
                    className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
                      index === activeIndex ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setActiveIndex(index)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full gap-1.5">
                      {tabIcons[index]}
                      {tab}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-blue-600 dark:text-blue-400">
                {isMobileMenuOpen ? "✕" : "☰"}
              </Button>
            </div>

            {/* Dark Mode Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="ml-4">
              {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-3 space-y-2 border-t border-gray-200 dark:border-gray-800"
            >
              {tabs.map((tab, index) => (
                <motion.button
                  key={`mobile-${index}`}
                  onClick={() => {
                    setActiveIndex(index)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    activeIndex === index ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"
                  }`}
                  whileHover={{ x: 5 }}
                >
                  {tabIcons[index]}
                  {tab}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-5xl font-serif font-bold mb-6 text-blue-700 dark:text-blue-300">Discover My Personal World</h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-12">
            Explore my creative endeavors, photography collections, and the stories that shape my imagination.
          </p>
        </motion.div>

        {/* Tab Content */}
        <div className="space-y-12">
          {activeIndex === 0 && (
            <motion.section
              key="creative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-3xl font-serif font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <Palette className="h-8 w-8" />
                  Creative Endeavors
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  Exploring creativity through art, design, and writing. This is where my imagination comes to life.
                </p>
              </div>

              <DynamicFrame className="border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                <div className="p-8 space-y-6">
                  <div>
                    <h4 className="text-xl font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">Visual Art</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      From digital illustrations to physical mediums, I explore how visual storytelling can communicate complex ecological and emotional concepts.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xl font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">Design</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      Thoughtful design that bridges science, nature, and human experience. Creating interfaces and experiences that feel natural and intuitive.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xl font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">Writing</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      Crafting narratives that explore the interconnectedness of all living systems and the stories we tell ourselves about nature.
                    </p>
                  </div>
                </div>
              </DynamicFrame>
            </motion.section>
          )}

          {activeIndex === 1 && (
            <motion.section
              key="imagery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-3xl font-serif font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <Camera className="h-8 w-8" />
                  Imagery Meanderings
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  Photography from research trips, travels, and moments of beauty captured around the world.
                </p>
              </div>

              <DynamicFrame className="border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                <div className="p-8 space-y-6">
                  <p className="text-gray-700 dark:text-gray-300">
                    My camera has documented ecosystems, wildlife, and landscapes across continents. Each photograph tells a story of the natural world's beauty and fragility.
                  </p>

                  <Button
                    onClick={() => router.push("/personal/albums")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Browse Photo Collections
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Card className="border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                      <CardHeader>
                        <CardTitle className="text-blue-700 dark:text-blue-300">2006 Baja California</CardTitle>
                        <CardDescription>Earthwatch Research Expedition</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Documenting marine biodiversity and conservation efforts during my first research expedition.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                      <CardHeader>
                        <CardTitle className="text-blue-700 dark:text-blue-300">Coming Soon</CardTitle>
                        <CardDescription>Additional collections</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          More photo albums from future travels and research expeditions will be added here.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </DynamicFrame>
            </motion.section>
          )}

          {activeIndex === 2 && (
            <motion.section
              key="story"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-3xl font-serif font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <PenTool className="h-8 w-8" />
                  The Story Is Being Written
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  A novel exploring interconnectedness, natural systems, and the stories we tell ourselves about the world.
                </p>
              </div>

              <DynamicFrame className="border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                <div className="p-8 space-y-6">
                  <div>
                    <h4 className="text-xl font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">Novel in Progress</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      A literary exploration of how individual stories interweave with the larger narrative of our relationship with the natural world.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="border border-blue-100 dark:border-blue-800 rounded-lg p-6">
                      <h5 className="font-serif font-semibold text-lg mb-2 text-blue-700 dark:text-blue-300">"The Listener"</h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        A scientist develops technology to hear plant communications, discovering that the forest has been speaking all along.
                      </p>
                    </div>

                    <div className="border border-blue-100 dark:border-blue-800 rounded-lg p-6">
                      <h5 className="font-serif font-semibold text-lg mb-2 text-blue-700 dark:text-blue-300">"Roots and Branches"</h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        An intergenerational story about a family's connection to a forest, tracing how we inherit both land and responsibility.
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 italic mt-6">
                    More stories and excerpts coming soon as this collection grows...
                  </p>
                </div>
              </DynamicFrame>
            </motion.section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-50 dark:bg-blue-950/30 py-8 mt-16 border-t border-blue-100 dark:border-blue-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-600 dark:text-gray-400">© 2025 Trudie Wang. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}