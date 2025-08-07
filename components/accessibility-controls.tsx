"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAccessibility } from "@/contexts/accessibility-context"
import { Moon, Sun, Contrast, PanelRightClose, PanelRightOpen } from "lucide-react"

interface AccessibilityControlsProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

export function AccessibilityControls({ isDarkMode, toggleDarkMode }: AccessibilityControlsProps) {
  const { highContrast, toggleHighContrast, announceToScreenReader } = useAccessibility()
  const [panelOpen, setPanelOpen] = useState(false)

  const handleToggleHighContrast = () => {
    toggleHighContrast()
    announceToScreenReader(highContrast ? "High contrast mode disabled" : "High contrast mode enabled")
  }

  const handleToggleDarkMode = () => {
    toggleDarkMode()
    announceToScreenReader(isDarkMode ? "Light mode enabled" : "Dark mode enabled")
  }

  const togglePanel = () => {
    setPanelOpen(!panelOpen)
    announceToScreenReader(panelOpen ? "Accessibility panel closed" : "Accessibility panel opened")
  }

  return (
    <>
      {/* Skip to content link - visible on focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>

      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePanel}
          aria-label={panelOpen ? "Close accessibility panel" : "Open accessibility panel"}
          className="bg-white dark:bg-gray-800 shadow-md"
        >
          {panelOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
        </Button>

        {panelOpen && (
          <div className="absolute bottom-full right-0 mb-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col gap-2 min-w-[200px]">
            <h2 className="text-sm font-medium mb-2">Accessibility Options</h2>

            <div className="flex items-center justify-between">
              <span className="text-sm">Dark Mode</span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleDarkMode}
                aria-pressed={isDarkMode}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">High Contrast</span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleHighContrast}
                aria-pressed={highContrast}
                aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
                className={highContrast ? "bg-yellow-300 text-black" : ""}
              >
                <Contrast className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
