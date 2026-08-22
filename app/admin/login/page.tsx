"use client"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Zap, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

import { AuthProvider } from "@/lib/auth-context"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const redirectTo = searchParams.get("redirect") ?? "/professional/endeavors/energy"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/ecoflow/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return }
      login(data.token)
      router.push(redirectTo)
    } catch { setError("Connection error"); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center font-mono">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm mx-4">
        <button onClick={() => router.push("/professional/endeavors/energy")}
          className="flex items-center gap-2 text-[#8b949e] hover:text-[#58a6ff] text-xs mb-6 transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back to dashboard
        </button>
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-green-900/50 flex items-center justify-center">
              <Zap className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">EcoFlow Dashboard</h1>
              <p className="text-[10px] text-[#8b949e] uppercase tracking-wider">Admin Access</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1.5 uppercase tracking-wider">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required
                className="w-full bg-[#0d1117] border border-[#30363d] text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-green-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1.5 uppercase tracking-wider">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required
                className="w-full bg-[#0d1117] border border-[#30363d] text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-green-500 transition-colors" />
            </div>
            {error && <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-[10px] text-[#8b949e] mt-4">Battery controls are live — changes apply immediately.</p>
      </motion.div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#0d1117] flex items-center justify-center"><p className="text-[#8b949e] text-sm font-mono">Loading...</p></div>}>
        <LoginForm />
      </Suspense>
    </AuthProvider>
  )
}
