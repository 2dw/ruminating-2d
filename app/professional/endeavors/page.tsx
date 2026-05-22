"use client"

import { motion } from "framer-motion"
import { ArrowLeft, GraduationCap, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentCard } from "@/components/document-card"

export default function ProfessionalEndeavorsPage() {
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
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Tiny Endeavors</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Research publications and professional experience across energy systems and optimization.
              </p>
            </div>
          </div>

          <section className="grid gap-8 md:grid-cols-2">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">Research Publications</CardTitle>
                <CardDescription>Academic contributions to energy systems and optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <DocumentCard
                    title="Dynamic Control and Optimization of Distributed Energy Resources in a Microgrid"
                    description="Advanced optimization techniques for distributed energy resource management (2015)"
                    type="pdf"
                    url="https://assets.trudie.dpdns.org/professional/2015%20Dynamic%20Control%20and%20Optimization%20of%20Distributed%20Energy%20Resources%20in%20a%20Microgrid.pdf"
                    icon={<GraduationCap className="h-6 w-6" />}
                    color="green"
                  />
                  <DocumentCard
                    title="Control and Optimization of Grid-Tied Photovoltaic Storage Systems Using Model Predictive Control"
                    description="Control theory applications in sustainable energy systems (2014)"
                    type="pdf"
                    url="https://assets.trudie.dpdns.org/professional/2014%20Control%20and%20Optimization%20of%20Grid-Tied%20Photovoltaic%20Storage%20Systems%20Using%20Model%20Predictive%20Control.pdf"
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
                    <h2 className="font-semibold text-green-600 dark:text-green-400">Energy Systems Engineer</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Developing optimization algorithms for renewable energy integration</p>
                  </div>
                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">Research Collaborator</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Working on equitable energy access solutions for underserved communities</p>
                  </div>
                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">Sustainability Advocate</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Promoting inclusive approaches to clean energy transition</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </motion.div>
      </main>
    </div>
  )
}
