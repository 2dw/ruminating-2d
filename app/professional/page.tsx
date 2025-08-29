"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, Sparkles, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DynamicFrame } from "@/components/dynamic-frame"
import { DocumentCard } from "@/components/document-card"
import Image from "next/image"
import { AccessibilityControls } from "@/components/accessibility-controls"
import { useAccessibility } from "@/contexts/accessibility-context"

const tabs = ["Me Until Now", "Tiny Endeavors", "Mission Musings"]

export default function ProfessionalWorld() {
  const router = useRouter()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverStyle, setHoverStyle] = useState({})
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const { highContrast, announceToScreenReader } = useAccessibility()

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

  const handleTabChange = (index: number) => {
    setActiveIndex(index)
    announceToScreenReader(`Tab changed to ${tabs[index]}`)
  }

  const tabIcons = [
    <BookOpen key="biography" className="h-4 w-4" />,
    <Sparkles key="endeavors" className="h-4 w-4" />,
    <Lightbulb key="mission" className="h-4 w-4" />,
  ]

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        isDarkMode ? "dark bg-[#0a1015] text-white" : "bg-[#f8fcff] text-[#0e0f11]"
      } ${highContrast ? "high-contrast" : ""}`}
    >
      {/* Accessibility Controls */}
      <AccessibilityControls isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <div className="relative">
        <div className="absolute inset-0 opacity-5 dark:opacity-10 z-0 pointer-events-none"></div>
        <div className="relative z-10">
          {/* Header with Tabs */}
          <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-[#0a1015]/80 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.1, rotate: -5 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push("/")}
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                      aria-label="Return to home page"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </motion.div>
                  <motion.h1
                    className="text-xl font-serif font-bold text-green-700 dark:text-green-400"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Professional Repertoire
                  </motion.h1>
                </div>

                {/* Tabs Navigation */}
                <nav className="relative hidden md:block" aria-label="Professional section tabs">
                  {/* Hover Highlight */}
                  <div
                    className="absolute h-[30px] transition-all duration-300 ease-out bg-green-100/50 dark:bg-green-900/30 rounded-[6px] flex items-center"
                    style={{
                      ...hoverStyle,
                      opacity: hoveredIndex !== null ? 1 : 0,
                    }}
                    aria-hidden="true"
                  />

                  {/* Active Indicator */}
                  <motion.div
                    className="absolute bottom-[-16px] h-[2px] bg-green-600 dark:bg-green-400 transition-all duration-300 ease-out tab-active"
                    style={activeStyle}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                    aria-hidden="true"
                  />

                  {/* Tabs */}
                  <div className="relative flex space-x-[6px] items-center" role="tablist">
                    {tabs.map((tab, index) => (
                      <motion.div
                        key={index}
                        ref={(el) => (tabRefs.current[index] = el)}
                        className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
                          index === activeIndex
                            ? "text-green-700 dark:text-green-300"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => handleTabChange(index)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        role="tab"
                        tabIndex={0}
                        aria-selected={index === activeIndex}
                        aria-controls={`panel-${tab.toLowerCase().replace(/\s+/g, "-")}`}
                        id={`tab-${tab.toLowerCase().replace(/\s+/g, "-")}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            handleTabChange(index)
                          }
                        }}
                      >
                        <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full gap-1.5">
                          {tabIcons[index]}
                          {tab}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                    className="text-green-600 dark:text-green-400"
                    aria-label="Open mobile menu"
                  >
                    Menu
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12" tabIndex={-1}>
            {/* Me Until Now Section */}
            <div
              id="panel-me-until-now"
              role="tabpanel"
              aria-labelledby="tab-me-until-now"
              hidden={activeIndex !== 0}
              tabIndex={activeIndex === 0 ? 0 : -1}
            >
              {activeIndex === 0 && (
                <section className="space-y-8">
                  <motion.div
                    className="flex flex-col md:flex-row gap-8 items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="w-48 h-48 rounded-full overflow-hidden bg-green-100 dark:bg-green-900/30 flex-shrink-0 border-2 border-green-200 dark:border-green-700"
                      whileHover={{ rotate: 5, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Image
                        src="/placeholder.svg?height=192&width=192"
                        alt="Portrait of Trudie Wang"
                        width={192}
                        height={192}
                        className="object-cover"
                      />
                    </motion.div>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-serif font-bold text-green-700 dark:text-green-300">Trudie Wang</h2>
                      <h3 className="text-xl text-green-600 dark:text-green-400">Mission-Driven Technology Leader</h3>
                      <p className="max-w-2xl text-gray-700 dark:text-gray-300">
                        I'm a technology leader with nearly two decades of experience developing disruptive products and
                        technologies that drive sustainability and innovation in the energy sector.
                      </p>
                    </div>
                  </motion.div>

                  {/* Documents Section */}
                  <div className="mt-8">
                    <h3 className="text-xl font-serif font-semibold mb-6 text-green-700 dark:text-green-300">
                      Key Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DocumentCard
                        title="Professional Resume"
                        description="Comprehensive overview of my professional experience, skills, and accomplishments in energy technology leadership."
                        src="/documents/professional/wang resume 12-2024.pdf"
                        type="pdf"
                        thumbnail="/documents/professional/thumbnails/resume-thumb.png"
                        tags={["Resume", "Experience", "Leadership"]}
                      />
                      <DocumentCard
                        title="PhD Thesis"
                        description="Dynamic Control and Optimization of Distributed Energy Resources - my doctoral research on smart grid technologies."
                        src="/documents/professional/thesis.pdf"
                        type="pdf"
                        thumbnail="/documents/professional/thumbnails/thesis-thumb.png"
                        tags={["PhD", "Research", "Smart Grid", "Optimization"]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <DynamicFrame className="h-full border border-green-200 dark:border-green-800 bg-white/95 dark:bg-gray-950/95">
                      <div className="p-6">
                        <h3 className="text-lg font-serif font-semibold mb-3 text-green-700 dark:text-green-300">
                          Professional Journey
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          I've held leadership positions at Heila Technologies and Growing Energy Labs Inc, driving
                          product strategy and innovation in distributed energy resources (DERs) and virtual power
                          plants.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mt-4">
                          My earlier work at SolarCity and the Electric Power Research Institute (EPRI) provided a
                          strong foundation in power systems engineering and grid integration.
                        </p>
                      </div>
                    </DynamicFrame>

                    <DynamicFrame className="h-full border border-green-200 dark:border-green-800 bg-white/95 dark:bg-gray-950/95">
                      <div className="p-6">
                        <h3 className="text-lg font-serif font-semibold mb-3 text-green-700 dark:text-green-300">
                          Key Accomplishments
                        </h3>
                        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                          <motion.li
                            className="flex items-start gap-2"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" aria-hidden="true"></div>
                            <span>
                              Led the development and deployment of scalable, market-driven solutions at Heila
                              Technologies.
                            </span>
                          </motion.li>
                          <motion.li
                            className="flex items-start gap-2"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" aria-hidden="true"></div>
                            <span>
                              Spearheaded innovation and technical strategy for next-generation DER control platforms.
                            </span>
                          </motion.li>
                          <motion.li
                            className="flex items-start gap-2"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" aria-hidden="true"></div>
                            <span>
                              Developed aggregation architecture and algorithms for virtual power plant optimization and
                              control policies at Growing Energy Labs Inc.
                            </span>
                          </motion.li>
                          <motion.li
                            className="flex items-start gap-2"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" aria-hidden="true"></div>
                            <span>
                              Authored publications in IEEE Transactions on Smart Grid and Journal of Applied Physics.
                            </span>
                          </motion.li>
                        </ul>
                      </div>
                    </DynamicFrame>
                  </div>

                  <DynamicFrame className="mt-6 border border-green-200 dark:border-green-800 bg-white/95 dark:bg-gray-950/95">
                    <div className="p-6">
                      <h3 className="text-lg font-serif font-semibold mb-3 text-green-700 dark:text-green-300">
                        Professional Philosophy
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        I'm committed to creating equitable energy solutions for underserved communities. As an Asian
                        female engineer, I strive to lead by example and break barriers in the sustainable energy
                        sector.
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mt-4">
                        I believe that true sustainability must include social equity. Just as mycelium networks connect
                        and nourish forest ecosystems, our energy systems should connect and support all communities
                        equitably. This philosophy guides my approach to every project and initiative I undertake.
                      </p>
                    </div>
                  </DynamicFrame>
                </section>
              )}
            </div>

            {/* Tiny Endeavors Section */}
            <div
              id="panel-tiny-endeavors"
              role="tabpanel"
              aria-labelledby="tab-tiny-endeavors"
              hidden={activeIndex !== 1}
              tabIndex={activeIndex === 1 ? 0 : -1}
            >
              {activeIndex === 1 && (
                <section className="space-y-8">
                  <h2 className="text-2xl font-serif font-bold mb-6 text-green-700 dark:text-green-300 bg-white/80 dark:bg-gray-950/80 inline-block px-3 py-1 rounded-md">
                    Tiny Endeavors
                  </h2>

                  {/* Research Papers */}
                  <div className="mb-12">
                    <h3 className="text-xl font-serif font-semibold mb-6 text-green-700 dark:text-green-300">
                      Research Publications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DocumentCard
                        title="Dynamic Control and Optimization of Distributed Energy Resources in a Microgrid"
                        description="Published in IEEE Transactions on Smart Grid - A comprehensive approach to decentralized power grid management with real-time optimization of EVs, PV generation, and battery storage."
                        src="/documents/professional/papers/2015_wang_admm.pdf"
                        type="pdf"
                        thumbnail="/documents/professional/thumbnails/ieee-paper-thumb.png"
                        tags={["IEEE", "Smart Grid", "Distributed Control", "Optimization"]}
                      />
                      <DocumentCard
                        title="Control and Optimization of Grid-Tied Photovoltaic Storage Systems Using Model Predictive Control"
                        description="Published in Journal of Applied Physics - Advanced MPC techniques for optimizing PV storage systems with dynamic adaptation to changing conditions and price signals."
                        src="/documents/professional/papers/2014_wang_mpc.pdf"
                        type="pdf"
                        thumbnail="/documents/professional/thumbnails/jap-paper-thumb.png"
                        tags={["Journal of Applied Physics", "MPC", "Photovoltaic", "Energy Storage"]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <DynamicFrame className="h-full border border-green-200 dark:border-green-800 bg-white/95 dark:bg-gray-950/95">
                        <div className="h-48 bg-green-100 dark:bg-green-900/30 relative">
                          <Image
                            src="/placeholder.svg?height=192&width=384&text=Smart+Grid+Control"
                            alt="Smart Grid Control illustration"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-serif font-semibold mb-2 text-green-700 dark:text-green-300">
                            Dynamic Control and Optimization of Distributed Energy Resources in a Microgrid
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Developed a method to realize the shift from a centrally run power grid to a decentralized
                            network, enabling real-time management and scheduling of EVs, PV generation, partially
                            curtailable load, and battery storage.
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4" aria-label="Project tags">
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs rounded-full">
                              Smart Grid
                            </span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs rounded-full">
                              Distributed Optimization
                            </span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs rounded-full">
                              Electric Vehicles
                            </span>
                          </div>
                        </div>
                      </DynamicFrame>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <DynamicFrame className="h-full border border-green-200 dark:border-green-800 bg-white/95 dark:bg-gray-950/95">
                        <div className="h-48 bg-green-100 dark:bg-green-900/30 relative">
                          <Image
                            src="/placeholder.svg?height=192&width=384&text=PV+Storage+Control"
                            alt="PV Storage Control illustration"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-serif font-semibold mb-2 text-green-700 dark:text-green-300">
                            Control and Optimization of Grid-Tied Photovoltaic Storage Systems Using Model Predictive
                            Control
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Developed optimization and control methods for a grid-tied photovoltaic (PV) storage system,
                            using Model Predictive Control (MPC) to dynamically adapt to changes in PV output and
                            respond to external price signals.
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4" aria-label="Project tags">
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs rounded-full">
                              Photovoltaic Systems
                            </span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs rounded-full">
                              Energy Storage
                            </span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs rounded-full">
                              Model Predictive Control
                            </span>
                          </div>
                        </div>
                      </DynamicFrame>
                    </motion.div>
                  </div>

                  <DynamicFrame className="mt-6 border border-green-200 dark:border-green-800 bg-white/95 dark:bg-gray-950/95">
                    <div className="p-6">
                      <h3 className="text-lg font-serif font-semibold mb-3 text-green-700 dark:text-green-300">
                        Mentorship and Team Building
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        I have dedicated myself to mentoring engineers, product managers, and cross-functional teams,
                        fostering a culture of accountability, innovation, and strategic execution.
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        This includes championing a "fail fast, iterate, and learn" culture, enabling teams to
                        experiment with emerging technologies and refine optimization algorithms for continuous
                        improvement.
                      </p>
                    </div>
                  </DynamicFrame>
                </section>
              )}
            </div>

            {/* Mission Musings Section */}
            <div
              id="panel-mission-musings"
              role="tabpanel"
              aria-labelledby="tab-mission-musings"
              hidden={activeIndex !== 2}
              tabIndex={activeIndex === 2 ? 0 : -1}
            >
              {activeIndex === 2 && (
                <section className="space-y-8">
                  <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-serif font-bold mb-6 text-green-700 dark:text-green-300 bg-white/80 dark:bg-gray-950/80 inline-block px-3 py-1 rounded-md">
                      Mission Musings
                    </h2>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <DynamicFrame className="mb-8 border border-green-200 dark:border-green-800 bg-white/95 dark:bg-gray-950/95">
                        <div className="p-6">
                          <h3 className="text-xl font-serif font-semibold mb-4 text-green-700 dark:text-green-300">
                            My Mission Statement
                          </h3>
                          <blockquote className="border-l-4 border-green-500 pl-4 italic text-gray-700 dark:text-gray-300">
                            "To create energy systems that heal our planet while ensuring that every community has
                            equitable access to clean, affordable, and reliable power. Like mycelium connects all living
                            things in nature, I aim to connect technical innovation with social equity to build a more
                            sustainable and just world."
                          </blockquote>
                        </div>
                      </DynamicFrame>
                    </motion.div>

                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <DynamicFrame className="border border-green-200 dark:border-green-800 bg-white/95 dark:bg-gray-950/95">
                          <div className="p-6">
                            <h3 className="text-lg font-serif font-semibold mb-3 text-green-700 dark:text-green-300">
                              Rethinking Energy Access: A Framework for Equity
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                              Traditional approaches to energy development often prioritize profit and efficiency over
                              community needs. I propose a new framework that centers equity from the beginning of the
                              design process.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                              This framework includes community co-design processes, transparent decision-making, and
                              metrics that measure success not just in kilowatt-hours but in quality-of-life
                              improvements. By integrating social equity considerations into technical design, we can
                              create energy systems that truly serve everyone.
                            </p>
                          </div>
                        </DynamicFrame>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <DynamicFrame className="border border-green-200 dark:border-green-800 bg-white/95 dark:bg-gray-950/95">
                          <div className="p-6">
                            <h3 className="text-lg font-serif font-semibold mb-3 text-green-700 dark:text-green-300">
                              The Mycelium Model: Interconnected Energy Systems
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                              Mycelium networks in nature distribute resources where they're needed most, creating
                              resilient ecosystems. Our energy systems should function similarly, with distributed
                              generation and storage that can adapt to changing needs and conditions.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                              I advocate for decentralized, community-owned energy systems that prioritize local
                              resilience while maintaining connections to larger grids. This approach not only improves
                              reliability but also democratizes energy production and consumption.
                            </p>
                          </div>
                        </DynamicFrame>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <DynamicFrame className="border border-green-200 dark:border-green-800 bg-white/95 dark:bg-gray-950/95">
                          <div className="p-6">
                            <h3 className="text-lg font-serif font-semibold mb-3 text-green-700 dark:text-green-300">
                              Breaking Barriers: Women in Sustainable Energy
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                              As an Asian female engineer, I've experienced firsthand the challenges of working in a
                              field dominated by men. Diverse perspectives are essential for creating truly inclusive
                              energy solutions. I believe that increasing representation of women and minorities in
                              engineering is not just about fairness—it's about building better systems.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                              Through mentorship programs and advocacy, I work to create pathways for more women to
                              enter and thrive in sustainable energy fields. By sharing my experiences and providing
                              support, I hope to inspire the next generation of diverse energy leaders.
                            </p>
                          </div>
                        </DynamicFrame>
                      </motion.div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-green-50 dark:bg-green-950/30 py-8 mt-12 border-t border-green-100 dark:border-green-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-gray-600 dark:text-gray-400">© 2025 Trudie Wang. All rights reserved.</p>
                </div>
                <motion.p
                  className="text-sm text-green-600 dark:text-green-400 max-w-md text-center md:text-right font-serif italic"
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                >
                  "Like mycelium connects all living things in nature, sustainable energy connects us all to a brighter
                  future."
                </motion.p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
