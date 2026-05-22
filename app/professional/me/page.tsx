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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/professional")} className="mt-1 text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950/40" aria-label="Back to professional sections">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Me Until Now</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Background, education, core expertise, and resume.
              </p>
            </div>
          </div>

          <section className="grid gap-8 lg:grid-cols-2">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">Background & Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">Stanford University</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ph.D., Mechanical Engineering - Renewable energy systems, distributed optimization, controls, DER integration</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">M.S., Mechanical Engineering</p>
                  </div>
                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">UC Berkeley</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">B.S., Mechanical Engineering (Honors)</p>
                  </div>
                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">Core Expertise</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Distributed optimization and control (MPC, ADMM), microgrids, VPPs, DERMS, transactive energy, forecasting, analytics, and systems thinking across energy, water, food, and waste</p>
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
                  As an Asian female engineer, I'm passionate about creating energy systems that not only heal our planet but ensure equitable access for all communities. My work focuses on the intersection of technology, sustainability, and social justice.
                </p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-4 flex items-center text-xl font-semibold text-green-700 dark:text-green-400">
              <FileText className="mr-2 h-5 w-5" />
              Resume
            </h2>
            <DocumentCard
              title="Trudie Wang - Resume"
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
