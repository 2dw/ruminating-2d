"use client"

/**
 * app/professional/endeavors/energy/page.tsx
 * Full home energy dashboard — view-only for visitors,
 * full controls accessible with admin login.
 *
 * Embeds the Python Dash dashboard at /view when available,
 * falls back to the R2-backed BatteryViewer when not running.
 */

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Zap, ExternalLink, Lock, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BatteryViewer from "@/components/BatteryViewer"

// ── Config ────────────────────────────────────────────────────────────────────
// When your local dashboard is running, set this to your machine's local IP.
// Leave as null to use the R2-backed widget only.
const LOCAL_DASHBOARD_URL: string | null = null
// const LOCAL_DASHBOARD_URL: string | null = "http://YOUR_LOCAL_IP:8050"
// e.g. "http://192.168.1.42:8050"

export default function EnergyDashboardPage() {
  const router = useRouter()
  const [dashboardReachable, setDashboardReachable] = useState(false)
  const [checking, setChecking] = useState(!!LOCAL_DASHBOARD_URL)
  const [showLoginHint, setShowLoginHint] = useState(false)

  // Check if local Python dashboard is reachable
  useEffect(() => {
    if (!LOCAL_DASHBOARD_URL) return
    const controller = new AbortController()
    fetch(`${LOCAL_DASHBOARD_URL}/view`, { signal: controller.signal, mode: "no-cors" })
      .then(() => setDashboardReachable(true))
      .catch(() => setDashboardReachable(false))
      .finally(() => setChecking(false))
    return () => controller.abort()
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fcff] pt-24 text-[#0e0f11] transition-colors duration-500 dark:bg-[#0a1015] dark:text-white">
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/professional/endeavors")}
              className="mt-1 text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950/40"
              aria-label="Back to Tiny Endeavors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
              <Zap className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">
                  Home Energy Dashboard
                </h1>
                {/* View-only badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 dark:border-green-800 px-3 py-1 text-xs text-green-700 dark:text-green-400">
                  <Eye className="h-3 w-3" />
                  view only
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Live monitoring of home solar production, EcoFlow Delta Pro 3 battery storage,
                and PG&E grid integration — built with Python, Plotly Dash, Cloudflare R2, and
                the EcoFlow Open API.
              </p>
            </div>
          </div>

          {/* Admin login hint */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLoginHint(v => !v)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <Lock className="h-3 w-3" />
              {showLoginHint ? "hide" : "admin access"}
            </button>
            {showLoginHint && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-slate-400"
              >
                — visit{" "}
                <a
                  href={LOCAL_DASHBOARD_URL ? `${LOCAL_DASHBOARD_URL}/login` : "#"}
                  className="text-green-600 dark:text-green-400 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  the local dashboard
                </a>{" "}
                and log in for full controls
              </motion.span>
            )}
          </div>

          {/* Main content */}
          {checking ? (
            <p className="text-sm text-slate-400">checking dashboard status...</p>
          ) : dashboardReachable && LOCAL_DASHBOARD_URL ? (
            // ── Full Dash embed when local dashboard is running ──────────────
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                live dashboard running
                <a
                  href={`${LOCAL_DASHBOARD_URL}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-1 underline underline-offset-2"
                >
                  open fullscreen <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-green-200 dark:border-green-800"
                   style={{ height: "85vh" }}>
                <iframe
                  src={`${LOCAL_DASHBOARD_URL}/view`}
                  className="w-full h-full"
                  title="EcoFlow Home Energy Dashboard — View Only"
                  allow="fullscreen"
                />
              </div>
            </div>
          ) : (
            // ── R2-backed widget when dashboard is offline ───────────────────
            <div className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Live battery widget */}
                <div className="md:col-span-1">
                  <BatteryViewer />
                </div>

                {/* Project description */}
                <Card className="border-green-200 dark:border-green-800 md:col-span-1 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-green-700 dark:text-green-400 text-base">
                      About this project
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      A full-stack home energy management system built from scratch, integrating
                      real-time battery telemetry, solar production estimates, weather forecasting,
                      and utility rate data into a unified dashboard.
                    </p>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-green-600 dark:text-green-400">Stack</h3>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                        <li>⚡ EcoFlow Open API (HMAC-signed REST + MQTT) for live battery data</li>
                        <li>☀️ Open-Meteo weather API for solar irradiance forecasting</li>
                        <li>🔋 Python / Plotly Dash for the interactive dashboard</li>
                        <li>☁️ Cloudflare Worker + R2 for serverless 24/7 data archival</li>
                        <li>📊 SQLite + APScheduler for local history and background jobs</li>
                        <li>⚡ PG&E Green Button Share My Data API (in progress)</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-green-600 dark:text-green-400">Forecasting</h3>
                      <p>
                        48-hour SOC forecasts using a Ridge regression load model trained on
                        counterfactual-reconstructed home load (battery and solar effects stripped out),
                        with PG&E E-TOU-C rate scheduling to recommend optimal charge windows.
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 pt-2">
                      The full interactive dashboard (SOC history, power flow, forecast charts,
                      rate heatmap, and battery controls) is available when the local server is running.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

        </motion.div>
      </main>
    </div>
  )
}
