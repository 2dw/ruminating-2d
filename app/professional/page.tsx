"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Sparkles, Lightbulb, ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AccessibilityControls } from "@/components/accessibility-controls"
import { useAccessibility } from "@/contexts/accessibility-context"
import { StarryBackground } from "@/components/starry-background"
import { useRouter } from "next/navigation"

const sections = [
  {
    title: "Me Until Now",
    icon: BookOpen,
    href: "/professional/me",
    description:
      "Two decades at the intersection of engineering, distributed energy, and the conviction that a sustainable future must also be an equitable one. Stanford Ph.D. · three startups · two acquisitions.",
    tags: ["Microgrids", "VPPs", "DER Optimization", "MPC · ADMM"],
  },
  {
    title: "Tiny Endeavors",
    icon: Sparkles,
    href: "/professional/endeavors",
    description:
      "Research publications, live projects, and the home energy dashboard — where the engineering work becomes tangible. IEEE publications on DER control, plus a live solar + battery system built from scratch.",
    tags: ["IEEE Publications", "Home Energy", "EcoFlow API", "Cloudflare R2"],
  },
  {
    title: "Mission Musings",
    icon: Lightbulb,
    href: "/professional/musings",
    description:
      "Electrons are the network through which our resources communicate. Thoughts on distributed intelligence, the nexus of energy and water and food and waste, and what an equitable energy transition actually requires.",
    tags: ["Systems Thinking", "Energy Equity", "Circular Economy", "Decarbonization"],
  },
]

export default function ProfessionalPage() {
  const router = useRouter()
  const { announceToScreenReader } = useAccessibility()
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setIsDarkMode(isDark)
  }, [])

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen w-full transition-colors duration-500 ${
        isDarkMode ? "dark bg-[#0a1015] text-white" : "bg-[#f8fcff] text-[#0e0f11]"
      }`}
    >
      <StarryBackground shootingStarCount={2} />
      <AccessibilityControls isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

        {/* Hero */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif mb-5 text-green-700 dark:text-green-400">
            Professional Repertoire
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed">
            Engineering and product leadership at the frontier of distributed energy —
            building platforms, scaling acquisitions, and proving that intelligent systems
            and equitable access are not in conflict.
          </p>
        </motion.div>

        {/* Section cards */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 mb-14">
          {sections.map((section, i) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
              >
                <Card
                  className="border-green-200 dark:border-green-800 h-full cursor-pointer group
                             hover:border-green-400 dark:hover:border-green-600
                             hover:shadow-md transition-all duration-200"
                  onClick={() => router.push(section.href)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl
                                      bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300
                                      group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-green-400 dark:text-green-600
                                             opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <CardTitle className="text-green-700 dark:text-green-400 mt-3">
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {section.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {section.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-block rounded-full border border-green-200 dark:border-green-800
                                     px-2.5 py-0.5 text-xs text-green-700 dark:text-green-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Thought leadership strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mb-14"
        >
          <Card className="border-green-200 dark:border-green-800 bg-green-50/60 dark:bg-green-950/20">
            <CardContent className="pt-6 pb-5">
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-400
                             uppercase tracking-widest mb-4">
                Thought Leadership
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Distributech", "RE+ Grid Edge", "NABCEP", "IEEE Tech Expo",
                  "Smart Grid", "Wood Mackenzie Grid Edge Summit", "Stanford Energy Seminar",
                  "NY Climate Week", "Interchange Recharged Podcast",
                  "Microgrid Knowledge", "GridTECH", "International Microgrid Symposium",
                ].map(venue => (
                  <span
                    key={venue}
                    className="rounded-full bg-white dark:bg-green-950/40 border border-green-200
                               dark:border-green-800 px-3 py-1 text-xs text-gray-600 dark:text-gray-400"
                  >
                    {venue}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Interested in collaborating on energy equity, distributed systems, or climate technology?
          </p>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => window.open("https://www.linkedin.com/in/trudie/", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Connect on LinkedIn
          </Button>
        </motion.div>

      </main>
    </div>
  )
}
