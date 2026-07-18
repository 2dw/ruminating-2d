import Link from "next/link"
import { Lightbulb } from "lucide-react"
import { FadeIn } from "@/components/fade-in"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfessionalMusingsPage() {
  return (
    <div className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white">
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn className="space-y-8">
          <div className="flex items-start gap-4">
            <Link
              href="/professional"
              className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950/40"
              aria-label="Back to professional sections"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
              <Lightbulb className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Mission Musings</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                The principles behind my work in sustainable and equitable systems.
              </p>
            </div>
          </div>

          <section className="grid gap-8 lg:grid-cols-3">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">Healing Our Planet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  Every energy system we design should contribute to planetary healing. This means considering not just efficiency, but regenerative impact on ecosystems and communities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">Equitable Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  Clean energy shouldn't be a privilege. My work focuses on ensuring that sustainable solutions are accessible to all communities, especially those historically marginalized.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">Interconnected Systems</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  Like mycelium networks in nature, our energy systems should be interconnected, resilient, and mutually supportive, creating webs of sustainability.
                </p>
              </CardContent>
            </Card>
          </section>
        </FadeIn>
      </main>
    </div>
  )
}
