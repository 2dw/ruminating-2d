"use client"

import { Quote } from "lucide-react"

interface EssayPullQuoteProps {
  quote: string
  context?: string
  align?: "left" | "center"
  accent?: "green" | "emerald" | "amber" | "cyan"
}

export function EssayPullQuote({
  quote,
  context,
  align = "center",
  accent = "emerald",
}: EssayPullQuoteProps) {
  const accents = {
    green: {
      border: "border-green-500/40 dark:border-green-400/40",
      glow: "from-green-500/10 via-emerald-500/5 to-transparent",
      text: "text-green-800 dark:text-green-300",
      icon: "text-green-600/30 dark:text-green-400/20",
      badge: "text-green-700 bg-green-100/70 border-green-300 dark:text-green-300 dark:bg-green-950/50 dark:border-green-800",
    },
    emerald: {
      border: "border-emerald-500/40 dark:border-emerald-400/40",
      glow: "from-emerald-500/10 via-teal-500/5 to-transparent",
      text: "text-emerald-900 dark:text-emerald-200",
      icon: "text-emerald-600/30 dark:text-emerald-400/20",
      badge: "text-emerald-700 bg-emerald-100/70 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800",
    },
    amber: {
      border: "border-amber-500/40 dark:border-amber-400/40",
      glow: "from-amber-500/10 via-yellow-500/5 to-transparent",
      text: "text-amber-950 dark:text-amber-200",
      icon: "text-amber-600/30 dark:text-amber-400/20",
      badge: "text-amber-800 bg-amber-100/70 border-amber-300 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-800",
    },
    cyan: {
      border: "border-cyan-500/40 dark:border-cyan-400/40",
      glow: "from-cyan-500/10 via-blue-500/5 to-transparent",
      text: "text-cyan-950 dark:text-cyan-200",
      icon: "text-cyan-600/30 dark:text-cyan-400/20",
      badge: "text-cyan-800 bg-cyan-100/70 border-cyan-300 dark:text-cyan-300 dark:bg-cyan-950/50 dark:border-cyan-800",
    },
  }[accent]

  return (
    <figure
      className={`relative my-8 overflow-hidden rounded-2xl border ${accents.border} bg-gradient-to-r ${accents.glow} p-6 sm:p-8 backdrop-blur-md transition-all duration-300 hover:shadow-lg dark:hover:shadow-emerald-950/30 ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      <Quote
        className={`absolute -top-3 -left-3 h-16 w-16 -rotate-6 select-none pointer-events-none ${accents.icon}`}
      />
      <div className="relative z-10">
        <blockquote className={`font-serif text-lg sm:text-xl md:text-2xl font-semibold leading-relaxed tracking-tight ${accents.text}`}>
          &ldquo;{quote}&rdquo;
        </blockquote>
        {context && (
          <figcaption className="mt-3 flex items-center justify-center gap-2">
            <span
              className={`inline-block font-mono text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${accents.badge}`}
            >
              {context}
            </span>
          </figcaption>
        )}
      </div>
    </figure>
  )
}
