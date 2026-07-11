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
                Professional Repertoire
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
                      I earned my PhD and MS in Mechanical Engineering at Stanford University.
                      My doctoral research focused on the dynamic integration and optimization
                      of distributed energy resources within the power grid using model
                      predictive control and distributed optimization. This work established
                      algorithmic foundations for proactive microgrids and virtual power plants
                      and shaped the trajectory of my career in distributed energy systems.
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
                      Distributed optimization and control. Microgrids. Virtual power plants.
                      DERMS. Transactive energy. Forecasting and predictive modeling. Product
                      strategy and roadmapping. Systems level design across the nexus of
                      energy, water, food, and waste. Equitable clean energy deployment.
                      ISO and RTO markets including CAISO, PJM, and ERCOT.
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
                      Vice President of Innovation · Vice President of Product · Product Strategy Lead · 2020–2024
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      As Vice President of Innovation, Vice President of Product, and Product
                      Strategy Lead from 2020 to 2024, I guided innovation, product strategy,
                      and distributed optimization for an MIT born microgrid and distributed
                      energy control platform. I defined the long term technical vision and
                      product roadmap and supported acquisition due diligence. I led algorithm
                      and product teams to deliver significant improvements in optimization
                      performance across global deployments and enabled value stacking,
                      resilience services, and market participation.
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
                      From 2015 to 2020, I developed forecasting, optimization, and
                      aggregation algorithms for early virtual power plant architectures and
                      distributed energy control systems. I contributed to the company's
                      acquisition through technical leadership and international deployments
                      including ARPA E NODES pilots in the United States and New Zealand.
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
                      Between 2010 and 2015, I advanced distributed control strategies for
                      distributed energy resource integration. I managed integration pilots
                      at SolarCity and developed dynamic distributed control algorithms at
                      EPRI using model predictive control and distributed optimization.
                      I quantified load balancing potential using real utility data and helped
                      shape early approaches to distributed control.
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
                  My work has always been guided by two north stars. Humanity must learn to
                  live sustainably with the planet, and resource equity must be treated as a
                  core design principle rather than an afterthought. I believe the energy
                  transition will only succeed if end users, communities, and grid operators
                  are empowered participants in the systems that shape their lives.
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Throughout my career I have focused on building distributed energy platforms,
                  microgrids, virtual power plants, and optimization systems that support this
                  vision. I have worked across algorithms, engineering, product architecture,
                  commercial strategy, and industry leadership. This range allows me to connect
                  technical and executive domains, translate across disciplines, and design
                  systems that scale in real environments. My deployments have spanned climate
                  resilience hubs, community microgrids, wastewater treatment facilities, and
                  international pilots, each grounded in the belief that technology, economics,
                  and human impact must move together.
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  What motivates me is the opportunity to take everything I have built and
                  learned and scale it with intention. I want to help shape the next generation
                  of this industry and contribute to a future where sustainable infrastructure
                  is accessible to all. My goal is to work in environments where communities
                  and grid stakeholders are treated as partners, where transparency and aligned
                  incentives guide the work, and where systems are designed to be resilient,
                  equitable, and future ready.
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
