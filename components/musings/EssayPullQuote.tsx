"use client"

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
      bar: "bg-green-500/60",
      glow: "from-green-500/8 via-emerald-500/4 to-transparent",
      text: "text-green-800 dark:text-green-300",
      badge: "text-green-700 bg-green-100/70 border-green-300 dark:text-green-300 dark:bg-green-950/50 dark:border-green-800",
      wrapper: "border-green-500/20 dark:border-green-400/20",
    },
    emerald: {
      bar: "bg-emerald-500/60",
      glow: "from-emerald-500/8 via-teal-500/4 to-transparent",
      text: "text-emerald-900 dark:text-emerald-200",
      badge: "text-emerald-700 bg-emerald-100/70 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800",
      wrapper: "border-emerald-500/20 dark:border-emerald-400/20",
    },
    amber: {
      bar: "bg-amber-500/60",
      glow: "from-amber-500/8 via-yellow-500/4 to-transparent",
      text: "text-amber-950 dark:text-amber-200",
      badge: "text-amber-800 bg-amber-100/70 border-amber-300 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-800",
      wrapper: "border-amber-500/20 dark:border-amber-400/20",
    },
    cyan: {
      bar: "bg-cyan-500/60",
      glow: "from-cyan-500/8 via-blue-500/4 to-transparent",
      text: "text-cyan-950 dark:text-cyan-200",
      badge: "text-cyan-800 bg-cyan-100/70 border-cyan-300 dark:text-cyan-300 dark:bg-cyan-950/50 dark:border-cyan-800",
      wrapper: "border-cyan-500/20 dark:border-cyan-400/20",
    },
  }[accent]

  return (
    <figure
      className={`relative my-8 flex gap-4 sm:gap-5 rounded-2xl border ${accents.wrapper} bg-gradient-to-r ${accents.glow} px-4 py-6 sm:px-8 sm:py-8 backdrop-blur-md transition-all duration-300 hover:shadow-lg dark:hover:shadow-emerald-950/30 ${
        align === "center" ? "text-center flex-col items-center" : "text-left items-start"
      }`}
    >
      {align === "left" && (
        <div className={`shrink-0 mt-1 w-1 self-stretch rounded-full ${accents.bar}`} />
      )}
      {align === "center" && (
        <div className={`mx-auto mb-1 h-0.5 w-12 rounded-full ${accents.bar}`} />
      )}
      <div className="relative z-10">
        <blockquote className={`font-serif text-base sm:text-xl md:text-2xl font-semibold italic leading-relaxed tracking-tight ${accents.text}`}>
          {quote}
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
