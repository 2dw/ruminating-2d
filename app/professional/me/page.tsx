"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Briefcase,
  Compass,
  Cpu,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Layers,
  Lightbulb,
  Linkedin,
  MapPin,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { DocumentCard } from "@/components/document-card"
import { EssayPullQuote } from "@/components/musings/EssayPullQuote"
import { assetUrl } from "@/lib/assets"

const stats = [
  { value: 20, suffix: "+", label: "Years in distributed energy" },
  { value: 3, suffix: "", label: "Startups built" },
  { value: 2, suffix: "", label: "Acquisitions delivered" },
  { value: 5, suffix: "", label: "Regions deployed" },
]

const endeavorOfferings = [
  {
    title: "Distributed energy strategy",
    icon: Compass,
    description:
      "Microgrid, storage, and virtual power plant strategy that balances resilience, operational performance, market participation, regulatory compliance, and customer objectives.",
  },
  {
    title: "Technology due diligence",
    icon: ShieldCheck,
    description:
      "Technical and commercial diligence on battery storage, inverters, controls, EMS, and DERMS, covering interoperability, regulatory alignment, incentive eligibility, and deployment risk.",
  },
  {
    title: "Product strategy for energy platforms",
    icon: Target,
    description:
      "Roadmap prioritization, product requirements, and KPI frameworks that align technical capability with market opportunity.",
  },
  {
    title: "Decision-support architecture",
    icon: Network,
    description:
      "Digital platforms and decision-support frameworks for DER planning, forecasting, performance management, and lifecycle optimization across distributed energy portfolios.",
  },
  {
    title: "Measurement and verification",
    icon: Activity,
    description:
      "Measurement and verification methodologies, performance guarantees, and operational metrics that support long-term asset performance.",
  },
  {
    title: "Deployment and market navigation",
    icon: Rocket,
    description:
      "Technology selection and deployment strategies that help organizations navigate utility programs, incentive structures, and electrification initiatives.",
  },
]

const experiences = [
  {
    id: "heila",
    company: "Heila Technologies",
    tag: "Acquired",
    location: "Boston, MA and Oakland, CA",
    period: "2020 to 2024",
    roles: [
      { title: "Product Strategy Lead", period: "2020 to 2021" },
      { title: "VP of Product", period: "2021 to 2023" },
      { title: "VP of Innovation", period: "2023 to 2024" },
    ],
    description:
      "Led innovation, product strategy, and distributed optimization for an MIT born microgrid and distributed energy control platform. Defined the long term technical vision and product roadmap, supported acquisition due diligence, and guided algorithm and product teams to improve optimization performance across global deployments, enabling value stacking, resilience services, and market participation.",
  },
  {
    id: "geli",
    company: "Growing Energy Labs",
    tag: "Acquired",
    location: "San Francisco, CA",
    period: "2015 to 2020",
    roles: [
      { title: "Senior Analytics Engineer", period: "2015 to 2017" },
      { title: "Staff Analytics Engineer", period: "2017 to 2020" },
    ],
    description:
      "Developed forecasting, optimization, and aggregation algorithms for early virtual power plant architectures and distributed energy control systems. Technical leadership contributed to the company's acquisition and supported international deployments including ARPA E NODES pilots in the United States and New Zealand.",
  },
  {
    id: "solarcity",
    company: "SolarCity",
    location: "San Francisco, CA",
    period: "2014 to 2015",
    roles: [{ title: "Power Systems Engineer", period: "2014 to 2015" }],
    description:
      "Managed distributed energy resource integration pilots and developed models and analytics to accelerate renewable penetration and improve grid reliability with real utility data.",
  },
  {
    id: "epri",
    company: "Electric Power Research Institute",
    short: "EPRI",
    location: "Palo Alto, CA",
    period: "2010 to 2012",
    roles: [{ title: "Graduate Research Intern", period: "2010 to 2012" }],
    description:
      "Developed dynamic and distributed control algorithms for distributed energy resources using model predictive control and distributed optimization, quantifying load balancing potential and grid benefits from real-world data.",
  },
]

const education = [
  {
    level: "Graduate",
    school: "Stanford University",
    degree: "Ph.D. and M.S., Mechanical Engineering",
    description:
      "Doctoral research focused on the dynamic integration and optimization of distributed energy resources within the power grid using model predictive control and distributed optimization, establishing algorithmic foundations for proactive microgrids and virtual power plants.",
  },
  {
    level: "Undergraduate",
    school: "UC Berkeley",
    degree: "B.S., Mechanical Engineering (Honors)",
    description:
      "Bachelor of Science in Mechanical Engineering with Honors from the University of California, Berkeley.",
  },
]

const expertiseGroups = [
  {
    label: "Algorithms and Optimization",
    icon: Cpu,
    accent: "green",
    items: [
      "Distributed optimization and control (MPC, ADMM)",
      "Forecasting and predictive modeling",
      "Transactive energy",
      "Distributed energy markets and value stacking",
    ],
  },
  {
    label: "Grid Architectures",
    icon: Network,
    accent: "emerald",
    items: [
      "Microgrids",
      "Virtual power plants",
      "DERMS",
      "Digital energy platforms and DER orchestration",
    ],
  },
  {
    label: "Product and Systems Strategy",
    icon: Layers,
    accent: "cyan",
    items: [
      "Product strategy and roadmapping",
      "Systems level design across the nexus of energy, water, food, and waste",
      "Equitable clean energy deployment and circular systems",
    ],
  },
  {
    label: "Markets and Reach",
    icon: Globe,
    accent: "amber",
    items: [
      "Utilities, EPCs, developers, financiers, and communities",
      "ISO and RTO markets including CAISO, PJM, and ERCOT",
      "Global deployments across North America, Europe, Asia, Australia, and Central America",
    ],
  },
  {
    label: "Leadership and Voice",
    icon: Users,
    accent: "green",
    items: [
      "Technical leadership, team building, and mentorship",
      "Public speaking and thought leadership",
    ],
  },
]

const groupAccents: Record<string, string> = {
  green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
}

function useCountUp(target: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    let frame = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(target * eased))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, start, duration])

  return value
}

function Stat({
  value,
  suffix,
  label,
  started,
}: {
  value: number
  suffix: string
  label: string
  started: boolean
}) {
  const current = useCountUp(value, started)

  return (
    <div className="rounded-2xl border border-green-200/70 bg-white/70 px-3 py-4 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-green-400 hover:shadow-md hover:shadow-green-900/5 dark:border-green-800/60 dark:bg-slate-900/60 dark:hover:border-green-500 dark:hover:shadow-green-400/10">
      <div className="font-serif text-3xl font-bold text-green-700 dark:text-green-400">
        {current}
        {suffix}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase leading-tight tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </div>
    </div>
  )
}

function StatsStrip() {
  const [started, setStarted] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
    >
      {stats.map((stat) => (
        <Stat key={stat.label} {...stat} started={started} />
      ))}
    </motion.div>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
      className="space-y-3 text-center"
    >
      <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
        <Icon className="h-3.5 w-3.5" />
        {eyebrow}
      </span>
      <h2 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
        {title}
      </h2>
      <p className="mx-auto max-w-xl text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">
        {description}
      </p>
    </motion.div>
  )
}

function Divider({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300/40 to-transparent dark:via-green-700/30" />
      <Icon className="h-4 w-4 text-green-500/60" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300/40 to-transparent dark:via-green-700/30" />
    </div>
  )
}

export default function ProfessionalMePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white">
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-10 sm:space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-start gap-3 sm:gap-4"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/professional")}
              className="mt-1 text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950/40"
              aria-label="Back to professional sections"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700 shadow-sm sm:h-14 sm:w-14 sm:rounded-3xl dark:bg-green-900 dark:text-green-200">
              <BookOpen className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-serif font-bold text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
                  Professional Repertoire
                </h1>
                <span className="rounded-full border border-green-300 bg-green-100 px-2.5 py-0.5 font-mono text-xs font-semibold text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                  Distributed by Design
                </span>
              </div>
              <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-slate-600 sm:mt-2 sm:text-base dark:text-slate-400">
                Two decades at the intersection of engineering, distributed energy, and the
                conviction that a sustainable future must also be an equitable one.
              </p>
            </div>
          </motion.div>

          {/* Impact stats */}
          <StatsStrip />

          {/* Mission: standalone glowing section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            {/* Halo glow layer */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 rounded-[2.5rem] opacity-60 blur-2xl transition-opacity duration-700 dark:opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(34,197,94,0.18), rgba(34,197,94,0.06) 55%, transparent 80%)",
              }}
            />
            <div className="relative rounded-[2rem] border border-green-200/80 bg-white/95 p-8 shadow-lg shadow-green-900/5 ring-1 ring-green-100/60 sm:p-10 dark:border-green-800/60 dark:bg-slate-950/80 dark:shadow-green-400/5 dark:ring-green-800/30">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                    Two North Stars
                  </span>
                  <h2 className="font-serif text-2xl font-semibold text-slate-900 dark:text-white">
                    Mission
                  </h2>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[15px]/relaxed text-gray-700 dark:text-gray-300">
                  My work has always been guided by two north stars. Humanity must learn to
                  live sustainably with the planet, and resource equity and democratization
                  must be treated as core design principles rather than afterthoughts. I
                  believe the energy transition will only succeed if end users, communities,
                  and grid operators are empowered participants in the systems that shape
                  their lives.
                </p>
                <p className="text-[15px]/relaxed text-gray-700 dark:text-gray-300">
                  Throughout my career I have focused on building distributed energy platforms,
                  microgrids, virtual power plants, and optimization systems that support this
                  vision. My work has spanned algorithms, engineering, product architecture,
                  commercial strategy, and industry leadership, and it includes startup
                  formation, scale up, and acquisition due diligence. This range allows me to
                  connect engineering, product, commercial, and policy stakeholders into
                  aligned ecosystems that translate across disciplines, design systems that
                  scale in real environments, and deliver measurable impact. Deployments have
                  spanned North America, Europe, Asia, Australia, and Central America, and
                  included climate resilience hubs, community microgrids, wastewater treatment
                  facilities, and international pilots, each grounded in the belief that
                  technology, economics, and human impact must move together.
                </p>
                <p className="text-[15px]/relaxed text-gray-700 dark:text-gray-300">
                  What motivates me is the opportunity to take everything I have built and
                  learned and scale it with intention. I want to help shape the next generation
                  of this industry and lead through action, mentorship, and collaboration,
                  contributing to a future where sustainable infrastructure is accessible to
                  all. My goal is to work in environments where communities and grid
                  stakeholders are treated as partners, where transparency and aligned
                  incentives guide the work, and where systems are designed to be resilient,
                  equitable, and future ready.
                </p>
              </div>
            </div>
          </motion.section>

          <EssayPullQuote
            quote="The energy transition will only succeed if end users, communities, and grid operators are empowered participants in the systems that shape their lives."
            context="Guiding Conviction"
            accent="green"
          />

          <Divider icon={Sparkles} />

          {/* Current Endeavors */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-green-200/80 bg-gradient-to-br from-green-50 via-white to-white p-6 shadow-lg shadow-green-900/5 ring-1 ring-green-100/60 sm:p-10 dark:border-green-800/60 dark:bg-gradient-to-br dark:from-green-950/50 dark:via-slate-950/90 dark:to-slate-950/80 dark:shadow-green-400/5 dark:ring-green-800/30">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                    What I Provide Now
                  </span>
                  <h2 className="font-serif text-2xl font-semibold text-slate-900 dark:text-white">
                    Current Endeavors
                  </h2>
                </div>
                <span className="ml-auto rounded-full border border-green-300 bg-green-100 px-3 py-1 font-mono text-[11px] font-semibold text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                  Independent advisor · Oakland, California · 2025 to present
                </span>
              </div>

              <p className="max-w-4xl text-[15px]/relaxed text-gray-700 dark:text-gray-300">
                I advise developers, EPCs, operators, municipalities, financiers, and
                mission-driven organizations on the distributed energy decisions that determine
                whether a project gets built, performs as promised, and creates lasting value.
                This work pairs engineering depth with product and commercial judgment, so
                technical strategy never loses sight of deployment reality, market structure,
                and the communities these systems serve.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {endeavorOfferings.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      className="group rounded-2xl border border-green-100 bg-white/80 p-5 ring-1 ring-green-100/60 transition-all duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-lg hover:shadow-green-900/10 dark:border-green-800/50 dark:bg-slate-900/70 dark:ring-green-800/30 dark:hover:border-green-500 dark:hover:shadow-green-400/10"
                    >
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700 transition-colors duration-300 group-hover:bg-green-600 group-hover:text-white dark:bg-green-950 dark:text-green-300 dark:group-hover:bg-green-500 dark:group-hover:text-slate-950">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-[13px]/relaxed text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </motion.div>
                  )
                })}
              </div>

              <p className="mt-7 border-t border-green-100 pt-5 text-[14px]/relaxed text-gray-600 dark:border-green-800/50 dark:text-gray-400">
                Across every engagement I work as a strategic partner to engineering, product,
                commercial, and executive teams, translating complex energy systems into
                actionable investment, deployment, and growth decisions.
              </p>
            </div>
          </motion.section>

          <Divider icon={Zap} />

          {/* Professional Experience: timeline */}
          <section className="space-y-8">
            <SectionHeader
              eyebrow="Career Trajectory"
              title="Professional Experience"
              description="Two decades building and scaling distributed energy platforms, from research intern to VP of Innovation."
              icon={Briefcase}
            />

            <div className="relative mx-auto max-w-3xl">
              <div
                aria-hidden="true"
                className="absolute bottom-4 left-[7px] top-4 w-px bg-gradient-to-b from-green-500/60 via-green-400/30 to-transparent"
              />
              <div className="space-y-5">
                {experiences.map((exp, i) => (
                  <motion.article
                    key={exp.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: i * 0.08 }}
                    className="relative pl-8 sm:pl-10"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-5 h-3.5 w-3.5 rounded-full border-2 border-[#f8fcff] bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.18)] dark:border-[#0a1015]"
                    />
                    <div className="group rounded-2xl border border-green-200/70 bg-white/70 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-green-400 hover:shadow-lg hover:shadow-green-900/5 dark:border-green-800/60 dark:bg-slate-900/60 dark:hover:border-green-500 dark:hover:shadow-green-400/10">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                              {exp.company}
                            </h3>
                            {exp.tag && (
                              <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                                {exp.tag}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-green-700 dark:text-green-400">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {exp.location}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {exp.period}
                        </span>
                      </div>

                      <div className="mt-4 space-y-1.5 border-l-2 border-green-200 pl-3 dark:border-green-800">
                        {exp.roles.map((role) => (
                          <div
                            key={role.title}
                            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"
                          >
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {role.title}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {role.period}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="mt-4 text-[14px]/relaxed text-slate-600 dark:text-slate-300">
                        {exp.description}
                      </p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <Divider icon={Layers} />

          {/* Education */}
          <section className="space-y-8">
            <SectionHeader
              eyebrow="Foundations"
              title="Education"
              description="The academic grounding in mechanical engineering, controls, and optimization that set the trajectory."
              icon={GraduationCap}
            />

            <div className="grid gap-5 md:grid-cols-2">
              {education.map((item, i) => (
                <motion.div
                  key={item.school}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="group rounded-2xl border border-green-200/70 bg-white/70 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-green-400 hover:shadow-lg hover:shadow-green-900/5 dark:border-green-800/60 dark:bg-slate-900/60 dark:hover:border-green-500 dark:hover:shadow-green-400/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 transition-colors duration-300 group-hover:bg-green-600 group-hover:text-white dark:bg-green-950 dark:text-green-300 dark:group-hover:bg-green-500 dark:group-hover:text-slate-950">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="mt-4 block font-mono text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                    {item.level}
                  </span>
                  <h3 className="mt-1 font-serif text-lg font-bold text-slate-900 dark:text-white">
                    {item.school}
                  </h3>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    {item.degree}
                  </p>
                  <p className="mt-2 text-[13px]/relaxed text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Core Expertise */}
          <section className="space-y-8">
            <SectionHeader
              eyebrow="Capabilities"
              title="Core Expertise"
              description="Two decades of depth across algorithms, grid architectures, product strategy, and the markets that determine what gets built."
              icon={Target}
            />

            <div className="space-y-5">
              {expertiseGroups.map((group, i) => {
                const Icon = group.icon
                return (
                  <motion.div
                    key={group.label}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: i * 0.06 }}
                    className="rounded-2xl border border-green-200/70 bg-white/70 p-5 backdrop-blur-md transition-colors duration-300 hover:border-green-300 dark:border-green-800/60 dark:bg-slate-900/60 dark:hover:border-green-600"
                  >
                    <div className="mb-3 flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${groupAccents[group.accent]}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {group.label}
                      </span>
                      <span className="ml-auto font-mono text-[10px] text-slate-400 dark:text-slate-500">
                        {String(group.items.length).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-green-200/70 bg-white/70 px-3 py-1.5 text-[13px] leading-snug text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-green-400 hover:bg-green-50 hover:shadow-sm dark:border-green-800/60 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-green-500 dark:hover:bg-green-950/50"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>

          <Divider icon={Sparkles} />

          {/* Resume */}
          <section>
            <h2 className="mb-4 flex items-center font-serif text-xl font-semibold text-green-700 dark:text-green-400">
              <FileText className="mr-2 h-5 w-5" />
              Resume
            </h2>
            <DocumentCard
              title="Trudie Wang, Resume"
              description="Complete professional background, experience, and qualifications"
              type="pdf"
              url={assetUrl("professional/Trudie_Wang_Resume.pdf")}
              icon={<FileText className="h-6 w-6" />}
              color="green"
            />

            <a
              href="https://www.linkedin.com/in/trudie/"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 flex items-center justify-between rounded-2xl border border-green-200/70 bg-white/70 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-green-400 hover:shadow-lg hover:shadow-green-900/5 dark:border-green-800/60 dark:bg-slate-900/60 dark:hover:border-green-500 dark:hover:shadow-green-400/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700 transition-colors duration-300 group-hover:bg-green-600 group-hover:text-white dark:bg-green-950 dark:text-green-300 dark:group-hover:bg-green-500 dark:group-hover:text-slate-950">
                  <Linkedin className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                    Professional Network
                  </span>
                  <p className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                    Connect on LinkedIn
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-green-600 dark:group-hover:text-green-400" />
            </a>
          </section>
        </div>
      </main>
    </div>
  )
}
