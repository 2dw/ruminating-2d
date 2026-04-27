"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccessibilityControls } from "@/components/accessibility-controls"
import { useAccessibility } from "@/contexts/accessibility-context"
import { StarryBackground } from "@/components/starry-background"
import { PhotoGallerySection } from "@/components/photo-gallery-section"

// Define your photo collections/albums
const PHOTO_ALBUMS = [
  {
    id: "baja-2006",
    title: "2006 Baja California",
    subtitle: "Earthwatch Research Expedition",
    description: "Documentation from my Earthwatch research expedition to Baja California, exploring the interconnected ecosystems and biodiversity of this unique region.",
    prefix: "photography/2006 baja california/",
  },
  // Add more albums here as you organize them
  // {
  //   id: "forest-2023",
  //   title: "Old Growth Forests",
  //   subtitle: "2023 Pacific Northwest",
  //   description: "Exploring ancient forest systems...",
  //   prefix: "photography/forests/",
  // },
]

export default function PhotoAlbumsPage() {
  const router = useRouter()
  const [selectedAlbumIndex, setSelectedAlbumIndex] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  const { highContrast } = useAccessibility()

  const currentAlbum = PHOTO_ALBUMS[selectedAlbumIndex]

  const handlePrevious = () => {
    setSelectedAlbumIndex((prev) => (prev === 0 ? PHOTO_ALBUMS.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedAlbumIndex((prev) => (prev === PHOTO_ALBUMS.length - 1 ? 0 : prev + 1))
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  useEffect(() => {
    // Initialize from DOM on mount to avoid hydration mismatch
    const isDark = document.documentElement.classList.contains("dark")
    setIsDarkMode(isDark)
  }, [])

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen w-full transition-colors duration-300 ${
        isDarkMode ? "dark bg-[#0a1015] text-white" : "bg-[#f8fcff] text-[#0e0f11]"
      } ${highContrast ? "high-contrast" : ""}`}
    >
      <StarryBackground shootingStarCount={3} />

      {/* Accessibility Controls */}
      <AccessibilityControls isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-[#0a1015]/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/personal")}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  aria-label="Return to personal page"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
                  </svg>
                </Button>
              </motion.div>
              <motion.h1
                className="text-xl font-serif font-bold text-blue-700 dark:text-blue-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                Imagery Meanderings
              </motion.h1>
            </div>

            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Album Carousel Selector */}
        {PHOTO_ALBUMS.length > 1 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6 text-blue-700 dark:text-blue-300">
              Photo Collections
            </h2>

            <div className="relative flex items-center gap-4">
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                className="flex-shrink-0 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                aria-label="Previous album"
              >
                <ChevronLeft className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </button>

              {/* Carousel Container */}
              <div className="flex-1 overflow-hidden">
                <div ref={carouselRef} className="flex gap-4">
                  <AnimatePresence mode="wait">
                    {PHOTO_ALBUMS.map((album, index) => (
                      <motion.div
                        key={album.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: index === selectedAlbumIndex ? 1 : 0.5, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setSelectedAlbumIndex(index)}
                        className={`flex-shrink-0 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          index === selectedAlbumIndex
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                            : "border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
                        }`}
                      >
                        <div className="min-w-max">
                          <h3 className="font-semibold text-blue-700 dark:text-blue-300">{album.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{album.subtitle}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="flex-shrink-0 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                aria-label="Next album"
              >
                <ChevronRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </button>
            </div>
          </div>
        )}

        {/* Current Album Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAlbum.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold mb-2 text-blue-700 dark:text-blue-300">
                {currentAlbum.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{currentAlbum.description}</p>
            </div>

            {/* Photo Gallery */}
            <PhotoGallerySection
              title={`${currentAlbum.title} - Photos`}
              prefix={currentAlbum.prefix}
              columns={3}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-blue-50 dark:bg-blue-950/30 py-8 mt-12 border-t border-blue-100 dark:border-blue-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-400">© 2025 Trudie Wang. All rights reserved.</p>
            </div>
            <motion.p
              className="text-sm text-blue-600 dark:text-blue-400 max-w-md text-center md:text-right font-serif italic"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              "Like mycelium connects all living things in nature, our stories connect us all in the web of
              existence."
            </motion.p>
          </div>
        </div>
      </footer>
    </div>
  )
}
