"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap, FileText, X, ExternalLink, Download,
  Network, Layers,
} from "lucide-react"
import { assetUrl } from "@/lib/assets"

interface Document {
  id: string
  title: string
  subtitle: string
  description: string
  tags: string[]
  pages: string
  pdfUrl: string
  accentColor: string
  accentDark: string
  icon: typeof FileText
  badge: string
}

const DOCUMENTS: Document[] = [
  {
    id: "paradigm-shift",
    title: "The Decentralized Paradigm Shift",
    subtitle: "Transforming the Power Grid Through Intelligent, Autonomous Building Blocks",
    description:
      "A systems architecture framework for transitioning centralized utility infrastructure toward distributed, community-owned energy networks—detailing control hierarchies, transactive dispatch logic, and resilience proofs.",
    tags: ["Grid Architecture", "DERMS", "Transactive Control", "Resilience"],
    pages: "11 pages",
    pdfUrl: assetUrl("thought pieces/The Decentralized Paradigm Shift.pdf"),
    accentColor: "emerald",
    accentDark: "emerald",
    icon: Network,
    badge: "Strategic Framework",
  },
  {
    id: "transactive-roadmap",
    title: "Transactive Energy Roadmap",
    subtitle: "A Technical Blueprint for Peer-to-Peer Energy Markets and VPP Integration",
    description:
      "An engineering roadmap covering transactive energy market design, virtual power plant (VPP) aggregation, real-time bidding algorithms, and community microgrid governance from pilot to scale.",
    tags: ["Transactive Energy", "VPP", "P2P Markets", "Market Design"],
    pages: "11+ pages",
    pdfUrl: assetUrl("thought pieces/Transactive Energy Roadmap.pdf"),
    accentColor: "cyan",
    accentDark: "cyan",
    icon: Layers,
    badge: "Technical Roadmap",
  },
]

// ── Portal PDF Viewer ────────────────────────────────────────────────────────

function PdfViewer({ doc, onClose }: { doc: Document; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex flex-col bg-slate-950/95 backdrop-blur-sm"
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {/* Toolbar */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-${doc.accentColor}-900/60 text-${doc.accentColor}-300`}>
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{doc.title}</p>
              <p className="font-mono text-[10px] text-slate-400">{doc.pages}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <a
              href={doc.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open tab</span>
            </a>
            <a
              href={doc.pdfUrl}
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-red-900/50 hover:text-red-300 transition-colors"
              aria-label="Close viewer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* PDF iframe — full remaining viewport */}
        <div className="relative flex-1 overflow-hidden">
          <iframe
            src={`${doc.pdfUrl}#toolbar=1&navpanes=1`}
            className="absolute inset-0 h-full w-full border-none"
            title={doc.title}
          />
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

// ── Document Card ────────────────────────────────────────────────────────────

function DocumentCard({ doc, index }: { doc: Document; index: number }) {
  const [openViewer, setOpenViewer] = useState(false)
  const Icon = doc.icon

  const accentClasses = {
    emerald: {
      icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60",
      badge: "text-emerald-700 bg-emerald-100/80 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800",
      tag: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
      cta: "bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500",
      ctaOutline: "border-emerald-500/50 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40",
      glow: "from-emerald-500/5 to-transparent",
      bar: "bg-emerald-500/50",
    },
    cyan: {
      icon: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-300/60 dark:border-cyan-700/60",
      badge: "text-cyan-700 bg-cyan-100/80 border-cyan-300 dark:text-cyan-300 dark:bg-cyan-950/60 dark:border-cyan-800",
      tag: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60",
      cta: "bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-700 dark:hover:bg-cyan-600",
      ctaOutline: "border-cyan-500/50 text-cyan-700 hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-950/40",
      glow: "from-cyan-500/5 to-transparent",
      bar: "bg-cyan-500/50",
    },
  }[doc.accentColor as "emerald" | "cyan"]

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br ${accentClasses.glow} bg-white/80 p-6 shadow-md transition-all duration-300 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-slate-950/40`}
      >
        {/* Accent bar */}
        <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${accentClasses.bar}`} />

        <div className="pl-3">
          {/* Card Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${accentClasses.icon} shadow-inner`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${accentClasses.badge}`}>
                  {doc.badge}
                </span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{doc.pages}</span>
              </div>
              <h4 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-white leading-snug">
                {doc.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic font-serif">
                {doc.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-4">
            {doc.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {doc.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${accentClasses.tag}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setOpenViewer(true)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold font-mono transition-all shadow-sm ${accentClasses.cta}`}
            >
              <FileText className="h-3.5 w-3.5" />
              Read Document
            </button>
            <a
              href={doc.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold font-mono transition-all ${accentClasses.ctaOutline}`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Tab
            </a>
            <a
              href={doc.pdfUrl}
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold font-mono text-slate-600 hover:bg-slate-100 transition-all dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </div>
        </div>
      </motion.article>

      {openViewer && <PdfViewer doc={doc} onClose={() => setOpenViewer(false)} />}
    </>
  )
}

// ── Main Section ─────────────────────────────────────────────────────────────

export function SeedingNetworksSection() {
  return (
    <motion.section
      id="deep-dives"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="my-16 scroll-mt-24"
    >
      <div className="overflow-visible rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white/90 via-slate-50/60 to-white/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl dark:border-slate-800/90 dark:from-slate-900/90 dark:via-slate-950/70 dark:to-slate-900/90 dark:shadow-slate-950/50">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-b border-slate-200/70 pb-6 dark:border-slate-800/70">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Deep Dives
                </span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  Technical Blueprints
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white mt-1.5">
                Seeding Networks
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Systems philosophy translated into executable architecture. These roadmaps and whitepapers
                seed distributed, community-scale infrastructure—the applied proof of concept for every
                philosophical conviction expressed in the essay above.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 self-start md:self-auto shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Expanding Repository</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              New documents added as research matures
            </p>
          </div>
        </div>

        {/* Focus Pillars */}
        <div className="my-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase font-semibold text-slate-400 dark:text-slate-500 mr-1">
            Focus Areas:
          </span>
          {[
            "Transactive Energy Markets",
            "Distributed Optimization & DERMS",
            "Virtual Power Plant Control",
            "Community Microgrid Governance",
          ].map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-mono px-3 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/70 shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Document Cards Grid */}
        <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {DOCUMENTS.map((doc, i) => (
            <DocumentCard key={doc.id} doc={doc} index={i} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <p className="italic">
            New architectural roadmaps and whitepapers are added as ongoing research and microgrid deployments progress.
          </p>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 shrink-0">
            <span>R2 Connected</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>

      </div>
    </motion.section>
  )
}
