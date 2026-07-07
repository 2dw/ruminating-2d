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
                Two decades at the intersection of engineering, distributed energy, and the
                conviction that a sustainable future must also be an equitable one.
              </p>
            </div>
          </div>

          {/* Three‑column section */}
          <section className="grid gap-8 lg:grid-cols-3">

            {/* Background & Education */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">
                  Background and Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">

                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">
                      Stanford University
                    </h2>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Ph.D. and M.S., Mechanical Engineering — doctoral research focused on
                      dynamically integrating and optimizing distributed energy resources into
                      the power grid using model predictive control and distributed optimization
                      (MPC, ADMM), laying algorithmic foundations for proactive microgrids
                      and virtual power plants.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">
                      UC Berkeley
                    </h2>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      B.S., Mechanical Engineering (Honors)
                    </p>
                  </div>

                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">
                      Core Expertise
                    </h2>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Distributed optimization and control · microgrids · VPPs · DERMS ·
                      transactive energy · forecasting and predictive modeling · product
                      strategy and roadmapping · systems‑level design across the nexus of
                      energy, water, food, and waste · equitable clean energy deployment ·
                      ISO/RTO markets (CAISO, PJM, ERCOT)
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Professional Experience */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">
                  Professional Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">

                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">
                      Heila Technologies <span className="font-normal text-gray-500 dark:text-gray-400 text-xs">(Acquired)</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      VP of Innovation · VP of Product · Product Strategy Lead · 2020–2024
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Led innovation, product strategy, and distributed optimization for an
                      MIT‑born microgrid and DER control platform. Played a decisive role in
                      Heila's acquisition by Kohler — defining the product roadmap, presenting
                      the long‑term technical vision, and providing domain expertise through
                      due diligence. Directed algorithm and product teams to significantly
                      improve optimization performance across all production sites, enabling
                      value stacking, resilience services, and market participation globally.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">
                      Growing Energy Labs <span className="font-normal text-gray-500 dark:text-gray-400 text-xs">(Acquired)</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Staff / Senior Analytics Engineer · 2015–2020
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Developed forecasting, optimization, and aggregation algorithms for early
                      VPP architectures and DER control systems. Contributed to GELI's
                      acquisition through technical leadership and international deployments
                      including ARPA‑E NODES pilots in the US and New Zealand.
                    </p>
                  </div>

                  <div>
                    <h2 className="font-semibold text-green-600 dark:text-green-400">
                      SolarCity · EPRI
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Power Systems Engineer · Graduate Research Intern · 2010–2015
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Managed DER integration pilots at SolarCity and developed dynamic
                      distributed control algorithms for DERs at EPRI using MPC and ADMM,
                      quantifying load‑balancing potential with real‑world utility data.
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Mission */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">
                  Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  My mission is to build energy systems that are intelligent, resilient, and
                  equitable — and to do it with the urgency this moment demands. The energy
                  transition is not just a technological challenge. It is a systems‑level
                  opportunity to redesign how resources are generated, shared, and governed
                  so that the benefits reach every community.
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Across three startups and two acquisitions, I have led the architecture and
                  deployment of distributed optimization platforms for microgrids, VPPs, and
                  community resilience hubs — from the Oakland EcoBlock and Red Cross
                  resilience sites to California's first microgrid‑enabled wastewater treatment
                  facility. I have represented this work at Distributech, RE+, Stanford, Wood
                  Mackenzie, IEEE, and NY Climate Week, and I have served as a technical
                  lead on NSF and ARPA‑E programs advancing distributed control and
                  transactive energy.
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  I lead with infectious enthusiasm and a do‑more‑with‑less mindset. I believe
                  electrons are the network through which our resources communicate — and
                  that designing intelligent, circular systems across the nexus of energy, water,
                  food, and waste is how we build a future worth living in.
                </p>
              </CardContent>
            </Card>

          </section>

          {/* Resume */}
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
