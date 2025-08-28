import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AccessibilityProvider } from "@/contexts/accessibility-context"

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
      <body className={inter.className}>
        <AccessibilityProvider>
          {children}

          {/* Screen reader announcer */}
          <div id="screen-reader-announcer" className="sr-only" aria-live="polite" aria-atomic="true"></div>
        </AccessibilityProvider>
      </body>
    </html>
  )
}
