"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Brush, Palette, PenTool } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const creativeProjects = [
  {
    title: "Digital Art Explorations",
    subtitle: "Illustrations and visual experiments",
    description:
      "A living gallery of artwork pulled directly from the art folder in R2, designed to update as the collection changes.",
    href: "/personal/creative/art",
    image: "/placeholder.svg?height=224&width=448&text=Digital+Art",
    icon: Brush,
  },
  {
    title: "Poetry & Reflections",
    subtitle: "Language, identity, and natural systems",
    description:
      "Poems and reflective fragments that help me process belonging, connection, and the quiet wisdom of the natural world.",
    href: "/personal/creative/poetry",
    image: "/placeholder.svg?height=224&width=448&text=Poetry",
    icon: PenTool,
  },
]

export default function PersonalCreativePage() {
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
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              <Palette className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Creative Endeavors</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Beyond my professional work, I explore creativity through various mediums. Choose a project to open its dedicated space.
              </p>
            </div>
          </div>

          <section className="grid gap-6 sm:grid-cols-2">
            {creativeProjects.map((project, index) => {
              const Icon = project.icon

              return (
                <motion.div
                  key={project.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                >
                  <Card className="h-full overflow-hidden border-slate-200 bg-slate-50/90 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/80 dark:hover:border-blue-600">
                    <button
                      type="button"
                      onClick={() => router.push(project.href)}
                      className="group h-full w-full text-left"
                    >
                      <div
                        className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-900"
                        onContextMenu={(event) => event.preventDefault()}
                      >
                        <Image
                          src={project.image}
                          alt=""
                          fill
                          draggable={false}
                          className="protected-media object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent opacity-20" />
                      </div>
                      <CardHeader>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200">
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-blue-700 dark:text-blue-300">{project.title}</CardTitle>
                        <CardDescription>{project.subtitle}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{project.description}</p>
                        <div className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-300">Open project →</div>
                      </CardContent>
                    </button>
                  </Card>
                </motion.div>
              )
            })}
          </section>
        </motion.div>
      </main>
    </div>
  )
}
