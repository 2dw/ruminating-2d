"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, GraduationCap, ExternalLink, Download, BookOpen, Sparkles, Lightbulb, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AccessibilityControls } from "@/components/accessibility-controls"
import { useAccessibility } from "@/contexts/accessibility-context"
import { StarryBackground } from "@/components/starry-background"
import { DocumentCard } from "@/components/document-card"
import { useRouter } from "next/navigation"

const tabs = ["Me Until Now", "Tiny Endeavors", "Mission Musings"]

const tabIcons = [
  <BookOpen key="me" className="h-4 w-4" />,
  <Sparkles key="endeavors" className="h-4 w-4" />,
  <Lightbulb key="musings" className="h-4 w-4" />,
]

export default function ProfessionalPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { announceToScreenReader } = useAccessibility()
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const tabRefs = useRef([])
  const [hoverStyle, setHoverStyle] = useState({})
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const navigateBack = () => {
    announceToScreenReader("Navigating back to main portal")
    router.push("/")
  }

  useEffect(() => {
    // Check if dark mode is enabled in localStorage or system preference
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

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-500 ${
        isDarkMode ? "dark bg-[#0a1015] text-white" : "bg-[#f8fcff] text-[#0e0f11]"
      }`}
    >
      {/* Shooting Stars */}
      <StarryBackground shootingStarCount={2} />

      {/* Accessibility Controls */}
      <AccessibilityControls isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

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
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                  aria-label="Return to main portal"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    <path d="M12 1L3 10v11h6v-6h6v6h6V10L12 1zm0 2.69L19 11v8h-2v-6H7v6H5v-8l7-7.31z" opacity="0.3" />
                  </svg>
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
            <div className="relative hidden md:block">
              {/* Hover Highlight */}
              <div
                className="absolute h-[30px] transition-all duration-300 ease-out bg-green-100/50 dark:bg-green-900/30 rounded-[6px] flex items-center"
                style={{
                  ...hoverStyle,
                  opacity: hoveredIndex !== null ? 1 : 0,
                }}
              />

              {/* Active Indicator */}
              <motion.div
                className="absolute bottom-[-16px] h-[2px] bg-green-600 dark:bg-green-400 transition-all duration-300 ease-out"
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
                      index === activeIndex ? "text-green-700 dark:text-green-300" : "text-gray-600 dark:text-gray-400"
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
              <Button variant="ghost" size="sm" onClick={() => {}} className="text-green-600 dark:text-green-400">
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
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif mb-6 text-green-700 dark:text-green-400">
            Professional Repertoire
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300">
            My journey through engineering, research, and advocacy for equitable energy solutions and sustainable
            systems that heal our planet.
          </p>
        </motion.div>

        {/* Me Until Now Section */}
        {activeIndex === 0 && (
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-3xl font-serif mb-8 text-green-800 dark:text-green-300">Me Until Now</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-400">Background & Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-600 dark:text-green-400">Stanford University</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        MS in Management Science & Engineering (2015)
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        BS in Management Science & Engineering (2014)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-600 dark:text-green-400">Focus Areas</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Energy systems optimization, sustainable technology, and equitable resource distribution
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-400">Current Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    As an Asian female engineer, I'm passionate about creating energy systems that not only heal our
                    planet but ensure equitable access for all communities. My work focuses on the intersection of
                    technology, sustainability, and social justice.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Resume Document */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-green-700 dark:text-green-400 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Resume
              </h3>
              <DocumentCard
                title="Trudie Wang - Resume"
                description="Complete professional background, experience, and qualifications"
                type="pdf"
                url="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_bJvsLY6mweQTzYafHqxWBK1koIJ9/DwhIK8rL2TLUCR2C1ue2qm/app/documents/professional/wang%20resume%2012-2024.pdf"
                icon={<FileText className="h-6 w-6" />}
                color="green"
              />
            </div>
          </motion.section>
        )}

        {/* Tiny Endeavors Section */}
        {activeIndex === 1 && (
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <h2 className="text-3xl font-serif mb-8 text-green-800 dark:text-green-300">Tiny Endeavors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-400">Research Publications</CardTitle>
                  <CardDescription>Academic contributions to energy systems and optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <DocumentCard
                      title="ADMM for Distributed Energy Systems"
                      description="Advanced optimization techniques for distributed energy resource management (2015)"
                      type="pdf"
                      url="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_bJvsLY6mweQTzYafHqxWBK1koIJ9/BDhG59ESWeANJdLH-iNrwL/app/documents/professional/papers/2015_wang_admm.pdf"
                      icon={<GraduationCap className="h-6 w-6" />}
                      color="green"
                    />
                    <DocumentCard
                      title="Model Predictive Control Applications"
                      description="Control theory applications in sustainable energy systems (2014)"
                      type="pdf"
                      url="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_bJvsLY6mweQTzYafHqxWBK1koIJ9/5LJzoTcNhCDLjbqr3HRZNT/app/documents/professional/papers/2014_wang_mpc.pdf"
                      icon={<GraduationCap className="h-6 w-6" />}
                      color="green"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-400">Professional Experience</CardTitle>
                  <CardDescription>Key roles and contributions in the energy sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-600 dark:text-green-400">Energy Systems Engineer</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Developing optimization algorithms for renewable energy integration
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-600 dark:text-green-400">Research Collaborator</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Working on equitable energy access solutions for underserved communities
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-600 dark:text-green-400">Sustainability Advocate</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Promoting inclusive approaches to clean energy transition
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.section>
        )}

        {/* Mission Musings Section */}
        {activeIndex === 2 && (
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <h2 className="text-3xl font-serif mb-8 text-green-800 dark:text-green-300">Mission Musings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-400">Healing Our Planet</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    Every energy system we design should contribute to planetary healing. This means considering not
                    just efficiency, but regenerative impact on ecosystems and communities.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-400">Equitable Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    Clean energy shouldn't be a privilege. My work focuses on ensuring that sustainable solutions are
                    accessible to all communities, especially those historically marginalized.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-700 dark:text-green-400">Interconnected Systems</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    Like mycelium networks in nature, our energy systems should be interconnected, resilient, and
                    mutually supportive, creating webs of sustainability.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.section>
        )}

        {/* Call to Action */}
        <motion.section
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-serif mb-4 text-green-800 dark:text-green-300">
                Let's Build a Sustainable Future Together
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Interested in collaborating on energy equity projects or discussing sustainable systems? I'd love to
                connect and explore how we can create positive impact together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect on LinkedIn
                </Button>
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>
    </div>
  )
}
