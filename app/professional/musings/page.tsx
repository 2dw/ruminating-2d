"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Lightbulb, Eye, Compass, Leaf, Shield, Cpu, Sparkles, Layers, Zap } from "lucide-react"
import { SectionGate } from "@/components/section-gate"
import { MotherTreeCanvas } from "@/components/mother-tree-canvas"
import { ArchitectureComparisonVisualizer } from "@/components/musings/ArchitectureComparisonVisualizer"
import { NexusInteractiveDiagram } from "@/components/musings/NexusInteractiveDiagram"
import { EvolutionArcMatrix } from "@/components/musings/EvolutionArcMatrix"
import { EssayPullQuote } from "@/components/musings/EssayPullQuote"
import { SeedingNetworksSection } from "@/components/musings/SeedingNetworksSection"
import { ArchiveDrawer } from "@/components/musings/ArchiveDrawer"

function MissionSummary() {
  return (
    <div className="space-y-3 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">My Mission</p>
      <h2 className="text-2xl font-serif font-bold text-white sm:text-3xl">
        From Vision to Network &bull; The Architecture of Agency
      </h2>
      <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-300">
        The evolution is not ideological. It is architectural. Like a mother tree nurturing the forest
        floor through fungal networks, our mission is to transform passive consumers into active co-stewards—democratizing
        agency through distributed energy, community resilience, and living systems design.
      </p>
    </div>
  )
}

export default function ProfessionalMusingsPage() {
  return (
    <SectionGate path="/professional/musings">
      <div className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white">
        <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-12">
            
            {/* Header & Back Navigation */}
            <div className="flex items-start gap-4">
              <Link
                href="/professional"
                className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40 transition-colors"
                aria-label="Back to professional repertoire"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 shadow-sm">
                <Lightbulb className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">
                    Mission Musings
                  </h1>
                  <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    Esse Quam Videri
                  </span>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Philosophical foundations, systems architecture, and the unbroken arc from initial inquiries to current and future architectures.
                  Exploring how distributed intelligence, resource equity, and ecological stewardship redefine human agency.
                </p>
              </div>
            </div>

            {/* Mother Tree Interactive Canvas */}
            <MotherTreeCanvas summary={<MissionSummary />} />

            {/* Editorial Lead-in & Organizing Maxim */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl space-y-4 text-center"
            >
              <p className="text-base sm:text-lg font-serif italic text-slate-700 dark:text-slate-200">
                &ldquo;The evolution is not ideological. It is architectural. The most compelling story is not that the philosophy changed, but that the philosophy never changed—and an entire career became the proof of concept.&rdquo;
              </p>
              <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400">
                PhD &bull; Climate Leader &bull; Product Executive &bull; Infrastructure Strategist
              </p>
            </motion.div>

            {/* Visual Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent dark:via-emerald-700/30" />
              <Eye className="h-4 w-4 text-emerald-500/50" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent dark:via-emerald-700/30" />
            </div>

            {/* 1. TOP SECTION: CONSTELLATORY IDEATIONS (#thought-pieces) */}
            <section id="thought-pieces" className="scroll-mt-24 space-y-12">
              
              {/* Trajectory Matrix */}
              <EvolutionArcMatrix />

              {/* The Cornerstone Essay as Center of Gravity */}
              <div className="relative mx-auto max-w-4xl space-y-10">
                <div className="text-center space-y-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                    Cornerstone Essay &bull; Center of Gravity
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                    Esse Quam Videri
                  </h2>
                  <p className="font-serif italic text-base sm:text-lg text-slate-600 dark:text-slate-400">
                    To Be, Rather Than To Seem
                  </p>
                  <div className="h-0.5 w-16 mx-auto bg-emerald-500/60 rounded-full my-4" />
                </div>

                {/* Chapter 1: The Questions That Endured */}
                <div className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
                  <p>
                    Reading something written twenty years ago is usually an exercise in embarrassment. The arguments tend to feel unfinished, the confidence occasionally exceeds the available evidence, and entire passages reveal the unmistakable fingerprints of a younger mind still discovering both the world and its own place within it. What surprised me while revisiting these essays was not how much had changed, but how little.
                  </p>
                  <p>
                    Certainly the world itself looks very different from the one in which these thoughts were first written. Climate change has moved from a future concern to a lived reality. Entire industries have emerged around technologies that once occupied only the margins of serious discussion. Artificial intelligence has altered our relationship with information, and geopolitical competition increasingly manifests through energy systems, critical resources, manufacturing, and control of digital infrastructure. Yet beneath those changes I found many of the same questions, often in surprisingly recognizable form. They appeared less refined, less informed by experience, and occasionally more impatient than I would write them today, but their underlying concerns remain unchanged. Most of the major decisions I have made throughout my life can ultimately be traced back to those early attempts to understand the relationship between human systems and the outcomes they produce.
                  </p>
                  <p>
                    For a long time, I believed my primary interest was renewable energy. Later, I thought it was distributed energy systems, microgrids, optimization, forecasting, and the architecture of the future grid. Later still, my attention expanded toward resilience, resource equity, community infrastructure, ecological design, and the relationships between energy, water, food, waste, housing, transportation, and human well-being. Looking back, however, these no longer appear to be separate interests. They appear to be different approaches to the same inquiry.
                  </p>
                  <p>
                    Why do human societies so often produce outcomes that are inconsistent with their own aspirations? We possess extraordinary capacities for innovation, cooperation, empathy, and adaptation. We repeatedly demonstrate an ability to solve problems that previous generations would have considered insurmountable. Yet we also seem remarkably adept at constructing systems that reward short-term behavior while undermining long-term well-being, concentrating benefits while distributing costs, and generating forms of fragility that become visible only after they have become deeply embedded. The contradiction has fascinated me for as long as I can remember, and the more I studied it the less convinced I became that any single discipline possessed an adequate explanation.
                  </p>
                  <p>
                    Engineering could describe technical constraints but not always human behavior. Economics could describe incentives but often struggled to account for values that resist quantification. Ecology provided profound insight into interconnected systems yet could not fully explain the institutions human beings create. Politics, policy, and governance offered partial explanations while frequently overlooking deeper cultural assumptions. The challenge seemed to exist somewhere in the spaces between these disciplines. Increasingly, it appeared that many of the defining problems of our time were not failures of individual systems, but failures to understand the relationships between them.
                  </p>
                </div>

                {/* Pull Quote 1 */}
                <EssayPullQuote
                  quote="The goal is not merely to sustain humanity. It is to create systems worthy of sustaining."
                  context="Systems Architecture"
                  accent="emerald"
                />

                {/* Chapter 2: The Fallacy of Discrete Categories */}
                <div className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
                  <p>
                    One of the defining characteristics of modern civilization is its tendency to partition reality into discrete categories. Energy becomes separate from transportation. Transportation becomes separate from housing. Housing becomes separate from public health. Public health becomes separate from ecology. Such boundaries are useful for administration, research, and expertise, yet they often obscure a more important truth: the world itself remains uninterested in our categories.
                  </p>
                  <p>
                    Energy influences water. Water influences food. Food influences land use. Land use influences ecosystems. Ecosystems influence climate. Climate, in turn, influences nearly everything else. When viewed from this perspective, many of the challenges that dominate contemporary discourse cease to appear as independent problems competing for attention. They reveal themselves instead as symptoms of a civilization still learning how to operate within increasingly interconnected systems.
                  </p>
                  <p>
                    This realization has profoundly shaped the way I think about sustainability. Sustainability is often discussed as though it were an environmental objective, primarily concerned with emissions, efficiency, or resource consumption. While these concerns are unquestionably important, I have gradually come to view sustainability as something broader. At its core, sustainability is a question of relationships. It asks whether the systems upon which we depend can continue functioning without undermining the conditions necessary for their own existence. Viewed in this way, sustainability is no longer merely about energy, carbon, ecosystems, or technology. It becomes a question about whether human systems are capable of recognizing their dependence upon larger systems and behaving accordingly.
                  </p>
                </div>

                {/* Visual Component: The Multi-System Nexus */}
                <NexusInteractiveDiagram />

                {/* Chapter 3: Nature as Complexity Engine */}
                <div className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
                  <p>
                    The more I pursued this inquiry, the more frequently I found myself returning to natural systems. Not because nature should be romanticized, nor because ecological systems provide direct templates for human institutions, but because nature offers perhaps the longest-running experiment in managing complexity ever conducted.
                  </p>
                  <p>
                    Forests, coral reefs, watersheds, and mycelial networks all confront challenges involving resource allocation, information exchange, resilience, adaptation, and long-term survival. What repeatedly struck me was not their efficiency, but their capacity for resilience. They achieve stability without central control. They adapt without requiring comprehensive oversight. They distribute intelligence throughout the system rather than concentrating it at any single point. Local actors retain agency while simultaneously contributing to larger patterns of behavior. Diversity strengthens resilience. Redundancy becomes a source of strength rather than inefficiency. Relationships become as important as components.
                  </p>
                  <p>
                    The lesson I drew from these observations was not that human societies should imitate nature literally. Rather, it was that resilience appears to emerge through participation. Systems become more adaptive when meaningful agency remains distributed among their participants. This principle resurfaced with surprising consistency in fields that initially appeared unrelated. Communities become more resilient when responsibility is broadly shared rather than narrowly concentrated. Organizations become more adaptive when information flows across boundaries rather than through rigid hierarchies. Infrastructure becomes more robust when local actors retain the capacity to respond to changing conditions without waiting for centralized direction. The pattern appeared so consistently that it eventually became impossible for me to ignore.
                  </p>
                </div>

                {/* Pull Quote 2 */}
                <EssayPullQuote
                  quote="Participation creates resilience. Systems become more adaptive when meaningful agency remains distributed among their participants."
                  context="Biomimetic Principle"
                  accent="cyan"
                />

                {/* Chapter 4: The Distribution of Agency */}
                <div className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
                  <p>
                    This realization ultimately led me toward distributed energy systems. What fascinated me was never the hardware itself. Solar panels, batteries, microgrids, and distributed control systems are undeniably important, but they were never the central idea. They represented something larger. They embodied a shift in the relationship between individuals and the systems that serve them.
                  </p>
                  <p>
                    For much of modern history, people have interacted with essential systems primarily as consumers. Energy is consumed. Information is consumed. Resources are consumed. Participation in the operation of those systems is often minimal or entirely absent. Distributed energy resources suggested an alternative possibility. They transformed individuals, buildings, and communities from passive recipients into active participants. The significance of that transformation extends well beyond energy. It alters the distribution of agency itself.
                  </p>
                </div>

                {/* Visual Component: Architecture Comparison */}
                <ArchitectureComparisonVisualizer />

                {/* Chapter 5: Equity as a Systems Requirement */}
                <div className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
                  <p>
                    This perspective has also shaped my understanding of equity. Sustainability and equity are frequently discussed as separate concerns, as though one can be achieved independently of the other. My own experience has led me to the opposite conclusion.
                  </p>
                  <p>
                    Systems that concentrate benefits while distributing risks rarely remain stable over extended periods of time. Likewise, systems that expand prosperity by degrading the ecological conditions upon which future prosperity depends ultimately undermine themselves. Equity is not simply a moral aspiration layered on top of technical progress. It is a systems requirement.
                  </p>
                  <p>
                    The distribution of resources influences the distribution of opportunity, and the distribution of opportunity influences who is able to participate meaningfully in shaping the future. Resilience accessible only to the privileged is not resilience. Sustainability available only to affluent communities is not sustainability. A transition that leaves large portions of humanity behind cannot reasonably be described as successful.
                  </p>
                  <p>
                    This is why I have never been particularly persuaded by attempts to separate environmental questions from social ones. The distinction often appears more administrative than real. Environmental degradation disproportionately affects those with the fewest resources to adapt. Access to energy influences access to economic opportunity. Infrastructure influences health outcomes. Educational opportunity shapes participation in civic and economic life. Again and again, seemingly separate challenges reveal themselves to be intertwined manifestations of larger patterns. The question is not merely how to optimize individual systems. The question is how to design systems whose success becomes inseparable from broader human flourishing.
                  </p>
                </div>

                {/* Pull Quote 3 */}
                <EssayPullQuote
                  quote="The future requires participants rather than consumers. The goal is not simply to distribute technologies. The goal is to distribute agency."
                  context="Democratic Infrastructure"
                  accent="green"
                />

                {/* Chapter 6: Pragmatism & Idealism */}
                <div className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
                  <p>
                    The older I become, the more frequently I encounter the accusation that such aspirations are idealistic. The observation is usually intended as both compliment and criticism. I have never found it particularly troubling because the distinction between idealism and naïveté has always seemed important.
                  </p>
                  <p>
                    Naïveté assumes that problems will somehow resolve themselves. Idealism begins from the recognition that current conditions are insufficient and asks whether alternatives might be possible. Throughout history, many of the ideas we now consider self-evident once appeared impractical or unrealistic. Universal education, environmental protection, scientific inquiry, democratic participation, and renewable energy all spent considerable periods of time being dismissed as unattainable, economically irrational, or incompatible with prevailing assumptions. The more interesting question is not whether an idea is idealistic. The more important question is whether it remains attentive to evidence, willing to adapt, and capable of confronting reality without surrendering its aspirations.
                  </p>
                  <p>
                    One argument I have never found persuasive is the tendency to invoke human nature as an explanation for human failure. The reasoning appears circular. If human beings are capable of imagining systems that are more just, resilient, compassionate, and sustainable than those presently in existence, then the capacity to imagine such possibilities must itself be part of human nature. We possess an unusual ability to evaluate ourselves against standards we have not yet achieved. We can imagine futures that differ from the present, recognize shortcomings in existing arrangements, and modify our behavior accordingly. This recursive capacity for self-assessment may be one of the defining characteristics of our species. It is also the foundation upon which every meaningful form of progress rests. Humanity&apos;s greatest achievements have rarely emerged from contentment with existing circumstances. They have emerged from dissatisfaction paired with imagination.
                  </p>
                </div>

                {/* Pull Quote 4 */}
                <EssayPullQuote
                  quote="Pragmatism determines execution. Idealism determines direction."
                  context="Guiding Maxim"
                  accent="amber"
                />

                {/* Chapter 7: The Destination */}
                <div className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif">
                  <p>
                    For this reason, I remain optimistic despite many of the challenges confronting our world. Not optimistic in the sense that positive outcomes are inevitable. History offers little support for such complacency. Rather, optimistic because the future remains unfinished. The systems we inhabit today are not permanent features of reality. They are expressions of human choices, accumulated over time and embedded within institutions, technologies, infrastructures, and cultural norms. As products of human choice, they remain subject to revision. Whether they will be revised wisely remains uncertain. Yet the capacity exists.
                  </p>
                  <p>
                    That possibility has always been my north star. The destination was never renewable energy itself. It was never any particular technology, institution, or policy framework. The destination has always been a civilization capable of stewarding its resources, technologies, ecosystems, and communities with sufficient wisdom to leave the world better than it was found. I continue to believe such a future is possible, not because progress is guaranteed, but because human beings retain the capacity to participate consciously in its creation. The question, as it has always been, is whether we choose to exercise that capacity.
                  </p>
                </div>

                {/* Pull Quote 5 */}
                <EssayPullQuote
                  quote="The destination is not sustainability alone. The destination is a civilization that understands resilience, prosperity, equity, and ecological stewardship are not competing objectives."
                  context="The Horizon"
                  accent="emerald"
                />
              </div>

              {/* The Three Philosophical Pillars */}
              <div className="space-y-6 pt-6">
                <div className="text-center space-y-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                    Core Axioms
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
                    The Three Philosophical Pillars
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                    Translating high-level systems theory into specific operational postures for technology and policy.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pillar 1 */}
                  <div className="rounded-2xl border border-emerald-200/80 bg-white/70 p-6 backdrop-blur-md shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/60 flex flex-col justify-between">
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mb-4">
                        <Leaf className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                        Pillar I
                      </span>
                      <h4 className="text-lg font-serif font-bold text-slate-900 dark:text-white mt-1 mb-2">
                        Healing Our Planet
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        Environmental crises are not merely tool deficits; they express an unbalanced relationship. The atmosphere, watersheds, and biodiversity are not economic externalities. Healing requires shifting from extractive exploitation toward biological reciprocity.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
                      Reciprocity &gt; Extraction
                    </div>
                  </div>

                  {/* Pillar 2 */}
                  <div className="rounded-2xl border border-emerald-200/80 bg-white/70 p-6 backdrop-blur-md shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/60 flex flex-col justify-between">
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 mb-4">
                        <Shield className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-cyan-600 dark:text-cyan-400">
                        Pillar II
                      </span>
                      <h4 className="text-lg font-serif font-bold text-slate-900 dark:text-white mt-1 mb-2">
                        Equitable Access & Agency
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        Access determines whether technological progress expands opportunity or merely reinforces entrenched privilege. Equity is not an afterthought layered over engineering—it is a non-negotiable systems requirement for long-term civilizational stability.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-cyan-700 dark:text-cyan-300 font-semibold">
                      Distributed Agency &gt; Privilege
                    </div>
                  </div>

                  {/* Pillar 3 */}
                  <div className="rounded-2xl border border-emerald-200/80 bg-white/70 p-6 backdrop-blur-md shadow-sm dark:border-emerald-900/60 dark:bg-slate-900/60 flex flex-col justify-between">
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 mb-4">
                        <Compass className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                        Pillar III
                      </span>
                      <h4 className="text-lg font-serif font-bold text-slate-900 dark:text-white mt-1 mb-2">
                        Interconnected Systems
                      </h4>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        The world does not care about administrative categories. Optimizing single components in isolation creates invisible fragility. Systems thinking is a practice of humility: designing for the living connections between energy, water, soil, and communities.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-amber-700 dark:text-amber-300 font-semibold">
                      Living Nexus &gt; Disciplinary Silos
                    </div>
                  </div>
                </div>
              </div>

              {/* The Modern Frontier */}
              <div className="space-y-6 pt-6">
                <div className="text-center space-y-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                    The Modern Frontier
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
                    Emerging Dimensions: Adaptation, Geopolitics & AI
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                    How empirical experience expanded the framework from initial inquiries into current and future strategic execution.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                          Climate Adaptation Alongside Decarbonization
                        </h4>
                        <p className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 uppercase">
                          Dual Mandate Architecture
                        </p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      Early climate efforts focused predominantly on decarbonization. Today, volatility is already locked into the biosphere. Resilient infrastructure must simultaneously mitigate future emissions and adapt to present hazards—islanding microgrids, cooling heat domes, and safeguarding public health.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                        <Compass className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                          Geopolitics & Strategic Supply Chains
                        </h4>
                        <p className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 uppercase">
                          Sovereign Energy Security
                        </p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      The energy transition is no longer solely an environmental aspiration; it is the arena of geopolitical security. Critical mineral access, transformer supply chains, and sovereign manufacturing dictate which nations and communities maintain self-determination in an unstable world.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        <Cpu className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                          AI as an Algorithmic Resource Allocation Engine
                        </h4>
                        <p className="font-mono text-[10px] text-purple-600 dark:text-purple-400 uppercase">
                          Stewardship Over Extraction
                        </p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      Artificial intelligence is rapidly becoming the central nervous system for grid dispatch and societal resource distribution. The same foundational questions of agency, transparency, concentration of power, and public stewardship apply directly to automated algorithmic decision-making.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800/80 dark:bg-slate-900/60 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                          Community Proofs of Concept in Practice
                        </h4>
                        <p className="font-mono text-[10px] text-amber-600 dark:text-amber-400 uppercase">
                          EcoBlock &bull; Resilience Hubs &bull; Wastewater DERs
                        </p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      The philosophy is validated by real infrastructure: from the Oakland EcoBlock neighborhood microgrid to Red Cross Community Resilience Hubs and municipal wastewater reclamation DERs. Theory becomes undeniable when it keeps lights on, water flowing, and neighbors safe.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Visual Divider */}
            <div className="flex items-center gap-4 my-10">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent dark:via-emerald-700/30" />
              <Zap className="h-4 w-4 text-emerald-500/50" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent dark:via-emerald-700/30" />
            </div>

            {/* 2. SEEDING NETWORKS: DEEP DIVES (BELOW CONSTELLATORY IDEATIONS, ABOVE ARCHIVAL DOCS) */}
            <SeedingNetworksSection />

            {/* Visual Divider */}
            <div className="flex items-center gap-4 my-10">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent dark:via-amber-700/30" />
              <Layers className="h-4 w-4 text-amber-500/50" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent dark:via-amber-700/30" />
            </div>

            {/* 3. FOUNDATIONAL ARCHIVE: ORIGINAL MANUSCRIPTS */}
            <ArchiveDrawer />

          </div>
        </main>
      </div>
    </SectionGate>
  )
}
