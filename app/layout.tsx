import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AccessibilityProvider } from "@/contexts/accessibility-context"
import { LazyStarryBackground } from "@/components/lazy-starry-background"
import { ScrollToTop } from "@/components/scroll-to-top"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Trudie Wang - Portfolio",
  description: "Professional portfolio showcasing energy systems engineering and equity advocacy work",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AccessibilityProvider>
          <LazyStarryBackground />
          {children}
          <ScrollToTop />

          {/* Screen reader announcer */}
          <div id="screen-reader-announcer" className="sr-only" aria-live="polite" aria-atomic="true"></div>
        </AccessibilityProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                // Restore dark mode from localStorage before paint
                try {
                  const mode = localStorage.getItem("theme-mode");
                  if (mode === "dark") {
                    document.documentElement.classList.add("dark");
                  } else if (mode === "light") {
                    document.documentElement.classList.remove("dark");
                  }
                } catch (_) {}

                const stripBisAttributes = (root = document) => {
                  root.querySelectorAll?.("[bis_skin_checked]").forEach((node) => {
                    node.removeAttribute("bis_skin_checked")
                  })
                }

                stripBisAttributes()

                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === "attributes" && mutation.attributeName === "bis_skin_checked") {
                      mutation.target.removeAttribute("bis_skin_checked")
                    }

                    mutation.addedNodes.forEach((node) => {
                      if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node
                        element.removeAttribute?.("bis_skin_checked")
                        stripBisAttributes(element)
                      }
                    })
                  })
                })

                observer.observe(document.documentElement, {
                  attributes: true,
                  childList: true,
                  subtree: true,
                  attributeFilter: ["bis_skin_checked"],
                })

                window.addEventListener("load", () => observer.disconnect(), { once: true })
              })()
            `,
          }}
        />
      </body>
    </html>
  )
}
