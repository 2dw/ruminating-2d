"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Archive, ChevronDown, ChevronUp, Clock, BookOpen, Sparkles } from "lucide-react"

export function ArchiveDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"esse" | "musing1" | "musing2">("esse")

  return (
    <div className="my-16 overflow-hidden rounded-3xl border border-slate-200/90 bg-white/70 backdrop-blur-xl shadow-lg dark:border-slate-800/90 dark:bg-slate-900/60 dark:shadow-slate-950/40">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Archive className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                Foundational Archive &bull; Unedited Manuscripts
              </span>
            </div>
            <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mt-1">
              The Genesis Manuscripts: Original Musings & Early Essays
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Preserved verbatim. The raw, unfiltered initial philosophical inquiries that ignited a lifetime in distributed energy.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all border border-amber-400/60 bg-amber-50 hover:bg-amber-100 text-amber-900 dark:border-amber-600/40 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:text-amber-200 shadow-sm self-start sm:self-center"
        >
          <span>{isOpen ? "Close Archive Drawer" : "Explore Initial Manuscripts"}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="p-6 sm:p-8 space-y-6">
              {/* Retrospective Author Note */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="flex items-center gap-2 mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Author&apos;s Archival Note: On Looking Back</span>
                </div>
                <p>
                  Reading initial writings from the start of an intellectual journey is an exercise in vulnerability. The early arguments are impatient, occasionally intense, and filled with the fierce idealism of an aspiring engineer refusing to accept that human apathy is an immutable law. We preserve these essays here in full because they demonstrate a fundamental truth: <em>the core instinct never altered</em>. The initial call for grassroots responsibility against systemic inertia simply grew into the current and future engineering architectures—community microgrids, virtual power plants, and distributed energy networks—that make that agency real.
                </p>
              </div>

              {/* Sub-Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
                {[
                  { id: "esse", title: "Original Essay: esse quam videri" },
                  { id: "musing1", title: "Musing #1: Early Engineering Bio" },
                  { id: "musing2", title: "Musing #2: On Idealism & The Incumbent Game" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {tab.title}
                  </button>
                ))}
              </div>

              {/* Tab Content Display */}
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 dark:border-slate-800/70 dark:bg-slate-950/40 p-6 font-serif text-sm leading-relaxed text-slate-700 dark:text-slate-300 max-h-[460px] overflow-y-auto space-y-4">
                {activeTab === "esse" && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">esse quam videri</h4>
                      <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Initial Essay &bull; Unedited</p>
                    </div>
                    <p>
                      There is much and little to be said about the pharisaic magnate who happily lauds the failings of Marxism, and just as much and as little to be said about the degenerate dictator who sanctimoniously scorns Capitalism.
                    </p>
                    <p>
                      Human beings cannot hope to reach the democratic utopias envisioned by such idealistic political philosophies until they begin to recognize that the hurdles we encounter with every prodigal architecture will continue to exist if we persist in using top-down enforcement. Our inability to truly model the envisioned ideologies cannot be remedied via some controlling authoritative body. As has been observed empirically, persons with power rarely gain that power without compromising some inherent value system, be it consciously or unconsciously.
                    </p>
                    <p>
                      I am hard pressed to put much stock in any form of government that is not run by an active majority, the emphasis being on the word <em>active</em>. Metrics have empirically been necessary because of the way corporations and governments are built, with no obligations or responsibilities to anyone&apos;s welfare but their own... The empire collapses when the base no longer believes in supporting it.
                    </p>
                    <p>
                      The solution requires a grassroots effort. If we postulate that some innate morality exists, then each and every human being must strive to propel this goodness from the core of their being into the fabric of their existence. The power-mongering we have become so familiar with is fed by human apathy. This apathy renders the bystander no less attributable to the failings of society...
                    </p>
                    <p>
                      We should never blindly stick to what we presume to be right, especially since we have a tendency to judge somewhat subjectively. One of my most strongly held tenets is that we should never stop questioning and challenging things. We should be perpetually seeking out better alternatives since we are without doubt capable of thinking things up that are better than the status quo.
                    </p>
                    <p>
                      If we can conceive of such idealistic theories, why is it correct to use human nature as rationalization for human vice? Nothing about us is set in stone. And by further extension, we can adapt recursively and eventually reach the ideal. This human ability to adapt coupled with the capacity to pass above-board moral judgment on ourselves is what fuels my own aspirations to derive a more sustainable world.
                    </p>
                  </div>
                )}

                {activeTab === "musing1" && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">Musing #1: Early Engineering Bio & Motivations</h4>
                      <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Initial Perspective &bull; Unedited</p>
                    </div>
                    <p>
                      Having devoted much of my education and life to the development of renewable energy technologies, my ultimate passion has been and will always be technologies that help channel us toward a more sustainable planet. Renewable energy and helping to tackle the energy crisis that looms somewhat forebodingly in our future have been my sole motivations for as far back as I can remember and continues to remain my primary reason for pursuing a degree in engineering.
                    </p>
                    <p>
                      In the last several years, I have become increasingly convinced that redesigning the electric grid is vital to solving our energy crisis. Realization of a smarter grid would not only help deal with the intermittency of renewable sources and hence make them a serious contender against fossil fuels, but it would also dramatically reduce (possibly reduce altogether) our dependency on gasoline and other CO2 emitting fuels for transportation via vehicle-to-grid (V2G) plug-in concepts. Demand response and distributed generation in a much more intelligently designed grid has essentially become my vision for the future of this planet.
                    </p>
                    <p>
                      I am at once an environmental idealist and an engineer. As such, I am no stranger to skepticism. But I have never once been daunted by the doubt of others because I know that progress can only be stimulated by fantastic ideas, regardless of how implausible and ridiculous they may seem at first. As an engineer, it is my duty and obligation to realize such ideas, to have the perseverance and foresight to take us into a world of distributed, clean and universally accessible energy.
                    </p>
                  </div>
                )}

                {activeTab === "musing2" && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">Musing #2: On Idealism & The Incumbent Game</h4>
                      <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Initial Reflection &bull; Unedited</p>
                    </div>
                    <p>
                      There is a fine but distinct line between naivety and idealism. The latter is unfortunately far too often brandished as the former when the idealist is more often than not someone who understands the world very well and is disillusioned enough to want an overturn of the system and a revolution in thought.
                    </p>
                    <p>
                      The biggest flaw in the system is that it has become a vicious self-fulfilling cycle. The only players who stand to control the board and win big are those who flourish on greed and self-interest... Dreaming for a better world should not be written off as naivety, a system inefficiency, or worse yet, criminalized as an undesirable human trait that needs to be evicted and ostracized. Instead, it should be recognized for its ability to achieve something far more beautiful and recognized as the only sustainable solution and cure to our current business-as-usual mindset.
                    </p>
                    <p>
                      We are not inherently bad. We are all just a part of a beautiful balance of life that in resonant mode manages to strike something more beautiful than the Aurora at night. This transcends the concept of self.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
