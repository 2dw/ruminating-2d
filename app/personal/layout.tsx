"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Camera, Home, Palette, PenTool } from "lucide-react"

const tabs = [
  { title: "Creative Endeavors", href: "/personal/creative", icon: <Palette className="h-4 w-4" /> },
  { title: "Imagery Meanderings", href: "/personal/imagery", icon: <Camera className="h-4 w-4" /> },
  { title: "The Story Is Being Written", href: "/personal/story", icon: <PenTool className="h-4 w-4" /> },
]

export default function PersonalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/personal"

  return (
    <div className="min-h-screen w-full bg-[#f8fcff] text-[#0e0f11] dark:bg-[#0a1015] dark:text-white transition-colors duration-500">
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/85 dark:bg-[#0a1015]/85 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950 dark:text-blue-300 dark:hover:border-blue-500 dark:hover:bg-blue-950/50">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Personal World</p>
                <Link href="/personal" className="group inline-flex items-center gap-2 text-2xl font-serif font-bold text-blue-700 dark:text-blue-300 transition hover:text-blue-900 dark:hover:text-blue-100">
                  <span>Mind Wanderings</span>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm text-blue-700 transition group-hover:border-blue-300 group-hover:bg-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-blue-300 dark:group-hover:border-blue-500 dark:group-hover:bg-blue-900/80">
                    ↺
                  </span>
                </Link>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href || (tab.href !== "/personal" && pathname.startsWith(tab.href))
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "border-blue-300 bg-blue-100 text-blue-800 shadow-sm dark:border-blue-500 dark:bg-blue-950/80 dark:text-blue-200"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/70"
                    }`}
                  >
                    {tab.icon}
                    {tab.title}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
