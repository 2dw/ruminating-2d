"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type AccessibilityContextType = {
  highContrast: boolean
  toggleHighContrast: () => void
  announceToScreenReader: (message: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false)

  // Initialize from localStorage if available (client-side only)
  useEffect(() => {
    const savedPreference = localStorage.getItem("highContrastMode")
    if (savedPreference === "true") {
      setHighContrast(true)
      document.documentElement.classList.add("high-contrast")
    }
  }, [])

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const newValue = !prev
      localStorage.setItem("highContrastMode", String(newValue))

      if (newValue) {
        document.documentElement.classList.add("high-contrast")
      } else {
        document.documentElement.classList.remove("high-contrast")
      }

      return newValue
    })
  }

  // Function to announce messages to screen readers
  const announceToScreenReader = (message: string) => {
    // Create or update the aria-live region
    let announcer = document.getElementById("screen-reader-announcer")

    if (!announcer) {
      announcer = document.createElement("div")
      announcer.id = "screen-reader-announcer"
      announcer.className = "sr-only"
      announcer.setAttribute("aria-live", "polite")
      announcer.setAttribute("aria-atomic", "true")
      document.body.appendChild(announcer)
    }

    // Set the message
    announcer.textContent = message

    // Clear the message after a delay to prevent repeated announcements
    setTimeout(() => {
      announcer.textContent = ""
    }, 1000)
  }

  return (
    <AccessibilityContext.Provider value={{ highContrast, toggleHighContrast, announceToScreenReader }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}
