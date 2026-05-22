"use client"

import { motion } from "framer-motion"
import { BookOpen, ExternalLink, Lightbulb, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const professionalSections = [
  {
    title: "Me Until Now",
    subtitle: "Background, education, and resume",
    description:
      "A focused overview of my academic path, systems expertise, current mission, and professional resume.",
    href: "/professional/me",
    icon: BookOpen,
  },
  {
    title: "Tiny Endeavors",
    subtitle: "Research, publications, and experience",
    description:
      "Selected publications and professional work across distributed energy resources, controls, and sustainable systems.",
    href: "/professional/endeavors",
    icon: Sparkles,
  },
  {
    title: "Mission Musings",
    subtitle: "Principles behind the work",
    description:
      "Reflections on planetary healing, equitable access, and interconnected infrastructure.",
    href: "/professional/musings",
    icon: Lightbulb,
  },
]

export default function ProfessionalPage() {
  const router = useRouter()

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white"
    >
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Professional Repertoire</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                My journey through engineering, research, and advocacy for equitable energy solutions and sustainable systems.
              </p>
            </div>
          </div>

          <section className="grid gap-6 md:grid-cols-3">
            {professionalSections.map((section, index) => {
              const Icon = section.icon

              return (
                <motion.div
                  key={section.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                >
                  <Card className="h-full border-slate-200 bg-slate-50/90 transition hover:-translate-y-1 hover:border-green-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/80 dark:hover:border-green-600">
                    <button type="button" onClick={() => router.push(section.href)} className="h-full w-full text-left">
                      <CardHeader>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-200">
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-green-700 dark:text-green-300">{section.title}</CardTitle>
                        <CardDescription>{section.subtitle}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{section.description}</p>
                        <div className="mt-4 text-sm font-medium text-green-600 dark:text-green-300">Open section →</div>
                      </CardContent>
                    </button>
                  </Card>
                </motion.div>
              )
            })}
          </section>

          <motion.section
            className="pt-2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
              <CardContent className="pt-6">
                <h2 className="mb-4 text-2xl font-serif text-green-800 dark:text-green-300">
                  Let's Build a Sustainable Future Together
                </h2>
                <p className="mb-6 text-gray-700 dark:text-gray-300">
                  Interested in collaborating on energy equity projects or discussing sustainable systems? I'd love to connect and explore how we can create positive impact together.
                </p>
                <Button
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => window.open("https://www.linkedin.com/in/trudie/", "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect on LinkedIn
                </Button>
              </CardContent>
            </Card>
          </motion.section>
        </motion.div>
      </main>
    </div>
  )
}
