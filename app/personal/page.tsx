"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Moon, Sun, ArrowLeft, Palette, Camera, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DynamicFrame } from "@/components/dynamic-frame"
import Image from "next/image"

const tabs = ["Creative Endeavors", "Imagery Meanderings", "The Story Is Being Written"]

export default function PersonalWorld() {
  const router = useRouter()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverStyle, setHoverStyle] = useState({})
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])

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
    requestAnimationFrame(() => {
      const overviewElement = tabRefs.current[0]
      if (overviewElement) {
        const { offsetLeft, offsetWidth } = overviewElement
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        })
      }
    })
  }, [])

  useEffect(() => {
    // Check if dark mode is enabled in localStorage or system preference
    const isDark = document.documentElement.classList.contains("dark")
    setIsDarkMode(isDark)
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const tabIcons = [
    <Palette key="creative" className="h-4 w-4" />,
    <Camera key="photography" className="h-4 w-4" />,
    <PenTool key="fiction" className="h-4 w-4" />,
  ]

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        isDarkMode ? "dark bg-[#0a1015] text-white" : "bg-[#f8fcff] text-[#0e0f11]"
      }`}
    >
      {/* Add this to the main container div if there are any background patterns */}
      <div className="relative">
        {/* If there are any background patterns, add this */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10 z-0 pointer-events-none"></div>

        {/* Main content with better contrast */}
        <div className="relative z-10">
          {/* Header with Tabs */}
          <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-[#0a1015]/80 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px:8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push("/")}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <ArrowLeft className="h-5 w-5" />
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
                          index === activeIndex
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-600 dark:text-gray-400"
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
                  <Button variant="ghost" size="sm" onClick={() => {}} className="text-blue-600 dark:text-blue-400">
                    Menu
                  </Button>
                </div>

                {/* Dark Mode Toggle */}
                <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="ml-4">
                  {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Creative Endeavors Section */}
            {activeIndex === 0 && (
              <section className="space-y-8">
                <h2 className="text-2xl font-serif font-bold mb-6 text-blue-700 dark:text-blue-300 bg-white/80 dark:bg-gray-950/80 inline-block px-3 py-1 rounded-md">
                  Creative Endeavors
                </h2>

                <div className="prose prose-blue dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 text-lg">
                    Beyond my professional work, I explore creativity through various mediums. These personal projects
                    allow me to process my experiences, connect with others, and find joy in the process of making.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <DynamicFrame className="h-full border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                      <div className="h-48 bg-blue-100 dark:bg-blue-900/30 relative">
                        <Image
                          src="/placeholder.svg?height=192&width=384&text=Digital+Art"
                          alt="Digital Art"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-serif font-semibold mb-2 text-blue-700 dark:text-blue-300">
                          Digital Art Explorations
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          I create digital illustrations that explore the relationship between humanity and nature. Many
                          of my pieces incorporate mycelium-inspired patterns and connections, reflecting my belief in
                          our interconnectedness.
                        </p>
                      </div>
                    </DynamicFrame>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <DynamicFrame className="h-full border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                      <div className="h-48 bg-blue-100 dark:bg-blue-900/30 relative">
                        <Image
                          src="/placeholder.svg?height=192&width=384&text=Poetry"
                          alt="Poetry"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-serif font-semibold mb-2 text-blue-700 dark:text-blue-300">
                          Poetry & Reflections
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          Writing poetry helps me process complex emotions and ideas. My poems often explore themes of
                          identity, belonging, and our relationship with the natural world.
                        </p>
                      </div>
                    </DynamicFrame>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <DynamicFrame className="mt-8 border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                    <div className="p-6">
                      <h3 className="text-lg font-serif font-semibold mb-4 text-blue-700 dark:text-blue-300">
                        Featured Poem: Mycelium Dreams
                      </h3>
                      <div className="prose prose-blue dark:prose-invert max-w-none">
                        <blockquote className="italic text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-4">
                          <p>
                            Beneath our feet, a quiet conversation
                            <br />
                            Threads of life, weaving through the dark
                            <br />
                            Mycelium whispers, ancient and wise
                            <br />
                            Connecting what seems separate, healing what's harmed.
                          </p>

                          <p>
                            I dream of human networks, just as kind
                            <br />
                            Resources flowing where they're needed most
                            <br />
                            No life too small, no corner left behind
                            <br />A wisdom older than our youngest boast.
                          </p>

                          <p>
                            In engineering steel and silicon
                            <br />
                            Can we remember fungal filaments?
                            <br />
                            The strength in softness, power in connection
                            <br />
                            The quiet work that needs no monument.
                          </p>
                        </blockquote>
                      </div>
                    </div>
                  </DynamicFrame>
                </motion.div>
              </section>
            )}

            {/* Imagery Meanderings Section */}
            {activeIndex === 1 && (
              <section className="space-y-8">
                <h2 className="text-2xl font-serif font-bold mb-6 text-blue-700 dark:text-blue-300 bg-white/80 dark:bg-gray-950/80 inline-block px-3 py-1 rounded-md">
                  Imagery Meanderings
                </h2>

                <div className="prose prose-blue dark:prose-invert max-w-none mb-8">
                  <p className="text-gray-700 dark:text-gray-300 text-lg">
                    Photography allows me to document my travels and capture the beauty of interconnected natural
                    systems. Through my lens, I seek to reveal the patterns and relationships that might otherwise go
                    unnoticed.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: item * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <DynamicFrame className="border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                        <div className="aspect-square bg-blue-100 dark:bg-blue-900/30 relative">
                          <Image
                            src={`/placeholder.svg?height=300&width=300&text=Photo+${item}`}
                            alt={`Photography sample ${item}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </DynamicFrame>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <DynamicFrame className="mt-8 border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                    <div className="p-6">
                      <h3 className="text-lg font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">
                        Photo Essay: The Hidden Networks
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        This ongoing photo series explores the visible manifestations of nature's interconnected
                        systems—from the branching patterns of rivers and trees to the intricate structures of fungi and
                        coral reefs. Through these images, I hope to inspire viewers to recognize the similar patterns
                        that connect us all.
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="aspect-video bg-blue-100 dark:bg-blue-900/30 relative rounded-md overflow-hidden">
                          <Image
                            src="/placeholder.svg?height=180&width=320&text=Network+1"
                            alt="Network photo 1"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="aspect-video bg-blue-100 dark:bg-blue-900/30 relative rounded-md overflow-hidden">
                          <Image
                            src="/placeholder.svg?height=180&width=320&text=Network+2"
                            alt="Network photo 2"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </DynamicFrame>
                </motion.div>
              </section>
            )}

            {/* The Story Is Being Written Section */}
            {activeIndex === 2 && (
              <section className="space-y-8">
                <h2 className="text-2xl font-serif font-bold mb-6 text-blue-700 dark:text-blue-300 bg-white/80 dark:bg-gray-950/80 inline-block px-3 py-1 rounded-md">
                  The Story Is Being Written
                </h2>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <DynamicFrame className="border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                    <div className="p-6">
                      <h3 className="text-lg font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">
                        The Mycelium Chronicles
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        I'm currently writing a speculative fiction novel set in a near-future world where humans have
                        learned to communicate with mycelium networks. This ongoing project explores themes of
                        interconnectedness, collective intelligence, and our relationship with the natural world.
                      </p>
                      <div className="prose prose-blue dark:prose-invert max-w-none">
                        <blockquote className="italic text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-4">
                          <p>
                            "The first time Maya heard the mycelium speak, she was kneeling in her grandmother's garden,
                            hands deep in the rich soil. It wasn't a voice, exactly—more like a feeling that formed
                            itself into words in her mind. A gentle hum that resolved into meaning.
                          </p>
                          <p>'We have been waiting for you,' it seemed to say. 'For someone who would listen.'</p>
                          <p>
                            Maya withdrew her hands quickly, heart racing. She had heard the stories, of course—everyone
                            had, since the Great Reconnection—but she had always assumed they were exaggerations.
                            Metaphors for the new environmental awareness that had swept through society after the
                            Climate Crisis of the 2030s.
                          </p>
                          <p>But this was no metaphor. This was a conversation."</p>
                        </blockquote>
                      </div>
                    </div>
                  </DynamicFrame>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <DynamicFrame className="border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                      <div className="p-6">
                        <h3 className="text-lg font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">
                          Story Themes
                        </h3>
                        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                          <motion.li
                            className="flex items-start gap-2"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                            <span>The wisdom embedded in natural systems and what humans can learn from them</span>
                          </motion.li>
                          <motion.li
                            className="flex items-start gap-2"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                            <span>
                              Bridging cultural and generational divides through shared connection to the earth
                            </span>
                          </motion.li>
                          <motion.li
                            className="flex items-start gap-2"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                            <span>
                              Reimagining technology as an extension of natural processes rather than separate from them
                            </span>
                          </motion.li>
                          <motion.li
                            className="flex items-start gap-2"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                            <span>Finding hope and resilience in times of environmental crisis</span>
                          </motion.li>
                        </ul>
                      </div>
                    </DynamicFrame>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <DynamicFrame className="border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                      <div className="p-6">
                        <h3 className="text-lg font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">
                          Writing Process
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          This story grows organically, much like the mycelium networks that inspire it. I don't follow
                          a rigid outline, instead allowing the narrative to branch and connect in unexpected ways.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          I write most often in the early mornings or while traveling, capturing ideas in a small
                          notebook before developing them further. The story is intentionally always "in progress"—a
                          living document that evolves as my own understanding of interconnectedness deepens.
                        </p>
                      </div>
                    </DynamicFrame>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <DynamicFrame className="mt-8 border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-gray-950/95">
                    <div className="p-6">
                      <h3 className="text-lg font-serif font-semibold mb-3 text-blue-700 dark:text-blue-300">
                        Short Stories
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        In addition to my novel-in-progress, I write short stories that explore similar themes of
                        connection, nature, and identity. These shorter pieces allow me to experiment with different
                        voices and perspectives.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          className="border border-blue-100 dark:border-blue-800 rounded-md p-4"
                          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                        >
                          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">"The Listener"</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            A scientist develops technology to hear plant communications, only to discover they've been
                            speaking to her all along.
                          </p>
                        </motion.div>
                        <motion.div
                          className="border border-blue-100 dark:border-blue-800 rounded-md p-4"
                          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                        >
                          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">"Roots and Branches"</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            An intergenerational story about a family's connection to a forest that holds their
                            ancestors' memories.
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </DynamicFrame>
                </motion.div>
              </section>
            )}
          </main>

          {/* Footer */}
          <footer className="bg-blue-50 dark:bg-blue-950/30 py-8 mt-12 border-t border-blue-100 dark:border-blue-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-gray-600 dark:text-gray-400">© 2025 Trudie Wang. All rights reserved.</p>
                </div>
                <motion.p
                  className="text-sm text-blue-600 dark:text-blue-400 max-w-md text-center md:text-right font-serif italic"
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                >
                  "Like mycelium connects all living things in nature, our stories connect us all in the web of
                  humanity."
                </motion.p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
