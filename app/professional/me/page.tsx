"use client"

import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentCard } from "@/components/document-card"

export default function ProfessionalMePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white">
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/professional")}
              className="mt-1 text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950/40"
              aria-label="Back to professional sections"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
              <BookOpen className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">
                Me Until Now
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                A systems‑level journey across engineering, distributed energy, and mission‑driven leadership.
              </p>
            </div>
          </div>

          {/* Two‑Column Section */}
          <section className="grid gap-8 lg:grid-cols-2">
            {/* Background & Education */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">
                  Background and Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">

                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">
                      Stanford University
                    </h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Ph.D., Mechanical Engineering  
                      Focus on renewable energy systems, distributed optimization, model predictive control, and the integration of distributed energy resources into real‑world grid operations.
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      M.S., Mechanical Engineering
                    </p>
                  </div>

                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">
                      UC Berkeley
                    </h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      B.S., Mechanical Engineering (Honors)
                    </p>
                  </div>

                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">
                      Core Expertise
                    </h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Distributed optimization and control, microgrids, virtual power plants, DERMS, forecasting, transactive energy, and systems‑level design across energy, water, food, and waste.  
                      My work centers on building architectures that perform under operational, regulatory, and economic constraints while enabling equitable access to clean, intelligent infrastructure.
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Current Mission */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">
                  Current Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  My mission is to build energy systems that are intelligent, resilient, and equitable.  
                  I focus on the architectures and decision frameworks that allow communities, utilities, and businesses to participate meaningfully in decarbonization.  
                  I approach the energy transition as a systems challenge that demands technical rigor, transparency, and a commitment to real‑world performance.  
                  I am driven by the responsibility to ensure that the benefits of this transition reach every community.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Resume Section */}
          <section>
            <h2 className="mb-4 flex items-center text-xl font-semibold text-green-700 dark:text-green-400">
              <FileText className="mr-2 h-5 w-5" />
              Resume
            </h2>

            <DocumentCard
              title="Trudie Wang — Resume"
              description="Complete professional background, experience, and qualifications"
              type="pdf"
              url="https://assets.trudie.dpdns.org/professional/Trudie's%20resume.pdf"
              icon={<FileText className="h-6 w-6" />}
              color="green"
            />
          </section>

        </motion.div>
      </main>
    </div>
  )
}
