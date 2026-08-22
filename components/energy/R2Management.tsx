"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Download } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface R2Stats { bucket: string; total_files: number; total_mb: string; telemetry_oldest: string | null; telemetry_newest: string | null; by_prefix: Record<string, { count: number; bytes: number }> }
interface R2File { key: string; size_kb: string; last_modified: string }

export default function R2Management({ dark = false }: { dark?: boolean }) {
  const { token } = useAuth()
  const [stats, setStats] = useState<R2Stats | null>(null)
  const [files, setFiles] = useState<R2File[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<"overview" | "files" | "cleanup">("overview")
  const [deleteDate, setDeleteDate] = useState("")
  const [dryRunResult, setDryRunResult] = useState<any>(null)
  const [deleteResult, setDeleteResult] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)
  const headers = { Authorization: `Bearer ${token}` }

  async function loadStats() { setLoading(true); try { const res = await fetch("/api/ecoflow/admin?action=stats", { headers }); setStats(await res.json()) } catch {} setLoading(false) }
  async function loadFiles() { setLoading(true); try { const res = await fetch("/api/ecoflow/admin?action=list&prefix=telemetry/daily/", { headers }); const data = await res.json(); setFiles(data.files || []) } catch {} setLoading(false) }
  async function handleDryRun() { if (!deleteDate) return; setDeleting(true); try { const res = await fetch("/api/ecoflow/admin", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete_before", date: deleteDate, dry_run: true }) }); setDryRunResult(await res.json()); setDeleteResult(null) } catch {} setDeleting(false) }
  async function handleDelete() { if (!deleteDate || !dryRunResult) return; if (!confirm(`Really delete ${dryRunResult.would_delete} files?`)) return; setDeleting(true); try { const res = await fetch("/api/ecoflow/admin", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete_before", date: deleteDate, dry_run: false }) }); setDeleteResult(await res.json()); setDryRunResult(null); loadStats() } catch {} setDeleting(false) }
  const tabStyle = (active: boolean) => `px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${active ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400" : "border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Database className="h-4 w-4 text-green-600 dark:text-green-500" /><CardTitle className="text-xs text-green-600 dark:text-green-500 uppercase tracking-widest">R2 Storage</CardTitle></div>
          <button onClick={loadStats} disabled={loading} className="text-xs text-slate-400 hover:text-green-500">{loading ? "Loading..." : "Refresh"}</button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats && <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[["Files", stats.total_files], ["Storage", `${stats.total_mb} MB`], ["Oldest", stats.telemetry_oldest?.split("/")[3] || "—"], ["Newest", stats.telemetry_newest?.split("/")[3] || "—"]].map(([l, v]) => (
            <div key={l} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"><p className="text-[10px] text-slate-400 uppercase">{l}</p><p className="text-sm font-bold font-mono">{v}</p></div>
          ))}
        </div>}
        <div className="flex gap-2">{(["overview", "files", "cleanup"] as const).map(t => <button key={t} className={tabStyle(tab === t)} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}</div>
        {tab === "overview" && stats && <div className="space-y-2">{Object.entries(stats.by_prefix || {}).map(([k, v]) => <div key={k} className="flex justify-between text-xs font-mono p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"><span className="text-slate-400">{k}/</span><span>{v.count} files · {(v.bytes / 1024).toFixed(0)} KB</span></div>)}</div>}
        {tab === "files" && <div><button onClick={loadFiles} disabled={loading} className="mb-3 px-3 py-1.5 rounded-lg text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white">{loading ? "Loading..." : "Load Files"}</button><div className="max-h-64 overflow-y-auto space-y-1">{files.map(f => <div key={f.key} className="flex justify-between items-center text-xs font-mono p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"><span className="text-blue-600 dark:text-blue-400 truncate">{f.key.split("/").slice(-3).join("/")}</span><div className="flex items-center gap-3 ml-2 shrink-0"><span className="text-slate-400">{f.size_kb} KB</span><a href={`/api/ecoflow/admin?action=download&key=${encodeURIComponent(f.key)}&_auth=${encodeURIComponent(token ?? "")}`} target="_blank" className="text-blue-500 hover:text-blue-600"><Download className="h-3.5 w-3.5" /></a></div></div>)}{files.length === 0 && !loading && <p className="text-xs text-slate-400">Click "Load Files" to browse</p>}</div></div>}
        {tab === "cleanup" && <div className="space-y-3"><div className="p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20"><p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-2 uppercase tracking-wider">Delete Old Data</p><div className="flex items-center gap-2 flex-wrap"><input type="date" value={deleteDate} onChange={e => setDeleteDate(e.target.value)} className="px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono" /><button onClick={handleDryRun} disabled={!deleteDate || deleting} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-blue-600 hover:bg-blue-700 text-white">Preview</button>{dryRunResult && <button onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 rounded-lg text-xs font-mono bg-red-600 hover:bg-red-700 text-white">{deleting ? "Deleting..." : `Delete ${dryRunResult.would_delete} files`}</button>}</div>{dryRunResult && <div className="mt-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 text-xs font-mono"><p className="text-blue-600 dark:text-blue-400 font-semibold">Dry Run: {dryRunResult.would_delete} files · {dryRunResult.total_mb} MB</p></div>}{deleteResult && <div className="mt-3 p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 text-xs font-mono"><p className="text-green-600 dark:text-green-400 font-semibold">Deleted {deleteResult.deleted} files</p></div>}</div></div>}
      </CardContent>
    </Card>
  )
}
