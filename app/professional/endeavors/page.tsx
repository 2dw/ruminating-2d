"use client"

import { motion } from "framer-motion"
import { ArrowLeft, GraduationCap, Sparkles, Zap, ArrowRight, ShieldCheck, Activity, Cpu } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentCard } from "@/components/document-card"
import BatteryViewer from "@/components/BatteryViewer"
import { assetUrl } from "@/lib/assets"

export default function ProfessionalEndeavorsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white">
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-10">
          
          {/* Header */}
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/professional")}
              className="mt-1 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
              aria-label="Back to professional sections"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/40 shadow-xs">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
                  Tiny Endeavors
                </h1>
                <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Applied Research &bull; Live Hardware
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Where theoretical algorithms meet physical hardware. Peer-reviewed IEEE research in distributed optimization alongside an active residential solar + battery microgrid proving these principles 24/7.
              </p>
            </div>
          </div>

          {/* Conceptual Bridge Strip */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 sm:p-5 backdrop-blur-md shadow-xs dark:border-slate-800/80 dark:bg-slate-950/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                  Theory in Steel & Silicon
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Algorithm optimization proven on Stanford compute clusters, now deployed on an active living home node.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                Model Predictive Control
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                LFP Battery Telemetry
              </span>
            </div>
          </div>

          {/* Main 2-Column Showcase */}
          <section className="grid gap-8 md:grid-cols-2">
            
            {/* Research Publications Card */}
            <Card className="rounded-3xl border-slate-200/90 bg-white/80 dark:border-slate-800/90 dark:bg-slate-950/70 shadow-md overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Academic Peer-Reviewed Work
                    </span>
                  </div>
                  <CardTitle className="font-serif text-xl sm:text-2xl text-slate-900 dark:text-white">
                    Research Publications
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Mathematical contributions to distributed energy resource management and optimal microgrid control.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <DocumentCard
                    title="Dynamic Control and Optimization of Distributed Energy Resources in a Microgrid"
                    description="Advanced optimization techniques for distributed energy resource management (2015). Published in IEEE Transactions on Smart Grid."
                    type="pdf"
                    url={assetUrl("professional/2015%20Dynamic%20Control%20and%20Optimization%20of%20Distributed%20Energy%20Resources%20in%20a%20Microgrid.pdf")}
                    icon={<GraduationCap className="h-6 w-6" />}
                    color="green"
                  />
                  <DocumentCard
                    title="Control and Optimization of Grid-Tied Photovoltaic Storage Systems Using Model Predictive Control"
                    description="Control theory applications in sustainable energy systems (2014). Formulating receding-horizon battery dispatch under fluctuating solar generation."
                    type="pdf"
                    url={assetUrl("professional/2014%20Control%20and%20Optimization%20of%20Grid-Tied%20Photovoltaic%20Storage%20Systems%20Using%20Model%20Predictive%20Control.pdf")}
                    icon={<GraduationCap className="h-6 w-6" />}
                    color="green"
                  />
                </CardContent>
              </div>

              <div className="p-6 pt-0">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Stanford University Energy Systems Lab</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">IEEE Citations</span>
                </div>
              </div>
            </Card>

            {/* Home Energy Dashboard Card */}
            <Card className="rounded-3xl border-slate-200/90 bg-white/80 dark:border-slate-800/90 dark:bg-slate-950/70 shadow-md overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Live Telemetry &bull; Active Microgrid
                    </span>
                  </div>
                  <CardTitle className="font-serif text-xl sm:text-2xl text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Home Energy Dashboard</span>
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Real-time solar + battery monitoring, probabilistic production forecasting, and dynamic PG&E tariff optimization.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {/* Live battery widget */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800/80 dark:bg-slate-900/80 shadow-xs">
                    <BatteryViewer />
                  </div>
                </CardContent>
              </div>

              <div className="p-6 pt-0">
                <button
                  type="button"
                  onClick={() => router.push("/professional/endeavors/energy")}
                  className="group w-full rounded-2xl border border-emerald-400/50 bg-emerald-50 hover:bg-emerald-100 py-3 px-4 text-xs font-mono font-semibold text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-300 transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Open Full Live Energy Dashboard</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </Card>

          </section>
        </motion.div>
      </main>
    </div>
  )
}

