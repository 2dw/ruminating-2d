"use client"

import { motion } from "framer-motion"
import { ArrowLeft, GraduationCap, Sparkles, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentCard } from "@/components/document-card"
import BatteryViewer from "@/components/BatteryViewer"

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
                Research publications and live projects at the intersection of energy systems and personal infrastructure.
              </p>
            </div>
          </div>

          <section className="grid gap-8 md:grid-cols-2">
            {/* Research Publications — unchanged */}
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

            {/* Home Energy Dashboard — new */}
            <Card className="border-green-200 dark:border-green-800 overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-green-700 dark:text-green-400 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Home Energy Dashboard
                    </CardTitle>
                    <CardDescription>
                      Live solar + battery monitoring, forecasting, and PG&E integration
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Live battery widget */}
                <BatteryViewer />

                {/* Link to full dashboard */}
                <button
                  onClick={() => router.push("/professional/endeavors/energy")}
                  className="w-full rounded-lg border border-green-200 dark:border-green-800 py-2.5 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                >
                  open full dashboard →
                </button>
              </CardContent>
            </Card>
          </section>
        </motion.div>
      </main>
    </div>
  )
}
