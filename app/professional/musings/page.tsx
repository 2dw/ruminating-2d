"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Lightbulb, Zap, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionGate } from "@/components/section-gate"
import { MotherTreeCanvas } from "@/components/mother-tree-canvas"
import { ProjectConstellation } from "@/components/project-constellation"

interface TierItem { title: string; body: string }

interface ContentTier {
  id: string; title: string; icon: typeof Lightbulb; description: string
  r2Prefix?: string; mediaFilter?: string[]; items: TierItem[]
}

const TIERS: ContentTier[] = [
  {
    id: "thought-pieces",
    title: "Thought Pieces",
    icon: Lightbulb,
    description: "Core principles and the philosophy guiding my work in sustainable, equitable energy systems.",
    items: [
      {
        title: "Healing Our Planet",
        body: "Every energy system we design should contribute to planetary healing. That means considering not just efficiency, but the regenerative impact on ecosystems and communities. A solar array is not just kilowatt hours. It is a statement about the kind of future we are building together.",
      },
      {
        title: "Equitable Access",
        body: "Clean energy should never be a privilege. My work centers on ensuring sustainable solutions reach all communities, especially those historically left behind. The decentralized nature of solar and storage is inherently democratizing, if we design it that way.",
      },
      {
        title: "Interconnected Systems",
        body: "Like mycelium networks in nature, our energy systems should be interconnected, resilient, and mutually supportive. The future is not a few massive power plants. It is millions of distributed nodes creating webs of sustainability, sharing resources through intelligent networks.",
      },
    ],
  },
  {
    id: "deep-dives",
    title: "Deep Dives",
    icon: Zap,
    description: "Strategic vision with guiding architecture, blueprints, and roadmaps for execution.",
    r2Prefix: "thought pieces/",
    items: [],
  },
]

function TierSection({ tier }: { tier: ContentTier }) {
  const Icon = tier.icon
  const hasItems = tier.items.length > 0
  const hasMedia = !!tier.r2Prefix

  if (!hasItems && !hasMedia) return null

  return (
    <motion.section
      id={tier.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">{tier.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{tier.description}</p>
        </div>
      </div>

      {hasItems && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tier.items.map((item) => (
            <Card key={item.title} className="border-green-200 dark:border-green-800/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-green-700 dark:text-green-400">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasMedia && tier.r2Prefix && (
        <ProjectConstellation
          prefix={tier.r2Prefix}
          mediaFilter={tier.mediaFilter}
          noMediaMessage="Media coming soon."
        />
      )}
    </motion.section>
  )
}

function MissionSummary() {
  return (
    <div className="space-y-3 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-green-400/80">My Mission</p>
      <h2 className="text-2xl font-serif font-bold text-white sm:text-3xl">
        From Vision to Network
      </h2>
      <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-300/80">
        Turning the dream into reality, one connection at a time. Spreading ideas through
        a decentralized network of mycelium, linking communities through sustainable
        energy systems that heal our planet and empower everyone.
      </p>
    </div>
  )
}

export default function ProfessionalMusingsPage() {
  return (
    <SectionGate path="/professional/musings">
      <div className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white">
        <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-10">
            <div className="flex items-start gap-4">
              <Link
                href="/professional"
                className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950/40"
                aria-label="Back to professional sections"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                <Lightbulb className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Mission Musings</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                  The principles, strategic vision, and knowledge base behind my work in sustainable and equitable energy systems.
                </p>
              </div>
            </div>

            <MotherTreeCanvas summary={<MissionSummary />} />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl space-y-4 text-center"
            >
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Like a mother tree nurturing the forest floor through fungal networks,
                my work connects communities through decentralized energy systems, sharing
                resources, knowledge, and resilience across the grid.
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Explore the sections below to understand the philosophy, dive into strategic
                blueprints, and follow the mycelium network as it grows.
              </p>
            </motion.div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300/40 to-transparent dark:via-green-700/30" />
              <Eye className="h-4 w-4 text-green-400/50" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green-300/40 to-transparent dark:via-green-700/30" />
            </div>

            <div className="space-y-12">
              {TIERS.map((tier) => (
                <TierSection key={tier.id} tier={tier} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </SectionGate>
  )
}
