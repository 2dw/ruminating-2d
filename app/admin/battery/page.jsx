"use client";
/**
 * app/admin/battery/page.jsx
 * Admin UI for EcoFlow R2 data management.
 * Protected — only accessible with admin credentials.
 *
 * Features:
 *  - Storage stats overview
 *  - Browse and download files by date range
 *  - Delete old data with dry-run preview
 *  - Age distribution report
 */

import { useState, useEffect } from "react";

const API = "/api/ecoflow/admin";

function useAdminApi(secret) {
  const headers = {
    "Authorization": `Bearer ${secret}`,
    "Content-Type": "application/json",
  };

  const get = (action, params = {}) => {
    const qs = new URLSearchParams({ action, ...params }).toString();
    return fetch(`${API}?${qs}`, { headers }).then(r => r.json());
  };

  const post = (body) =>
    fetch(API, { method: "POST", headers, body: JSON.stringify(body) }).then(r => r.json());

  return { get, post };
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = "#39d353" }) {
  return (
    <div style={{
      background: "#161b22", border: "1px solid #30363d", borderRadius: 10,
      padding: "1rem 1.25rem", minWidth: 150,
    }}>
      <div style={{ color: "#8b949e", fontSize: 11, textTransform: "uppercase",
                    letterSpacing: "0.07em", marginBottom: 6 }}>{label}</div>
      <div style={{ color, fontSize: "1.8rem", fontWeight: 700, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: "#8b949e", fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BatteryAdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const [stats, setStats] = useState(null);
  const [files, setFiles] = useState([]);
  const [ageReport, setAgeReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("overview");

  // Delete state
  const [deleteDate, setDeleteDate] = useState("");
  const [dryRunResult, setDryRunResult] = useState(null);
  const [deleteResult, setDeleteResult] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const api = useAdminApi(secret);

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    const result = await api.get("stats");
    setLoading(false);
    if (result.error === "Unauthorized") {
      setAuthError("Invalid secret");
    } else if (result.bucket) {
      setAuthed(true);
      setStats(result);
    } else {
      setAuthError("Unexpected error");
    }
  }

  async function loadFiles() {
    setLoading(true);
    const result = await api.get("list", { prefix: "telemetry/daily/" });
    setFiles(result.files || []);
    setLoading(false);
  }

  async function loadAgeReport() {
    setLoading(true);
    const result = await api.get("age_report");
    setAgeReport(result);
    setLoading(false);
  }

  async function handleDryRun() {
    if (!deleteDate) return;
    setDeleting(true);
    const result = await api.post({ action: "delete_before", date: deleteDate, dry_run: true });
    setDryRunResult(result);
    setDeleteResult(null);
    setDeleting(false);
  }

  async function handleDelete() {
    if (!deleteDate || !dryRunResult) return;
    if (!confirm(`Really delete ${dryRunResult.would_delete} files? This cannot be undone.`)) return;
    setDeleting(true);
    const result = await api.post({ action: "delete_before", date: deleteDate, dry_run: false });
    setDeleteResult(result);
    setDryRunResult(null);
    // Refresh stats
    const newStats = await api.get("stats");
    setStats(newStats);
    setDeleting(false);
  }

  async function downloadFile(key) {
    const qs = new URLSearchParams({ action: "download", key }).toString();
    window.open(`${API}?${qs}&_auth=${encodeURIComponent(secret)}`, "_blank");
  }

  // ── Auth screen ──────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0d1117", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace", color: "#e6edf3",
      }}>
        <div style={{
          background: "#161b22", border: "1px solid #30363d", borderRadius: 12,
          padding: "2.5rem", width: 360,
        }}>
          <h2 style={{ color: "#39d353", marginBottom: "0.25rem", fontSize: "1.2rem" }}>
            ⚡ Battery Data Admin
          </h2>
          <p style={{ color: "#8b949e", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
            Manage EcoFlow R2 storage
          </p>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              placeholder="Admin secret"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              style={{
                width: "100%", background: "#0d1117", border: "1px solid #30363d",
                color: "#e6edf3", padding: "10px 14px", borderRadius: 8,
                marginBottom: 12, fontFamily: "inherit", fontSize: "0.9rem",
              }}
            />
            {authError && (
              <p style={{ color: "#f85149", fontSize: "0.8rem", marginBottom: 8 }}>{authError}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", background: "#238636", color: "white", border: "none",
                padding: 11, borderRadius: 8, cursor: "pointer", fontSize: "1rem",
                fontWeight: 600, fontFamily: "inherit",
              }}
            >
              {loading ? "Checking..." : "Access Admin"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin UI ─────────────────────────────────────────────────────────────

  const cardStyle = {
    background: "#161b22", border: "1px solid #30363d", borderRadius: 10,
    padding: "1.25rem",
  };

  const tabStyle = (active) => ({
    padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem",
    background: active ? "#238636" : "transparent",
    color: active ? "white" : "#8b949e",
    border: active ? "1px solid #2ea043" : "1px solid #30363d",
  });

  return (
    <div style={{
      minHeight: "100vh", background: "#0d1117", color: "#e6edf3",
      fontFamily: "'JetBrains Mono', monospace", padding: "2rem",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem",
                      marginBottom: "1.5rem", paddingBottom: "1rem",
                      borderBottom: "1px solid #30363d" }}>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
            ⚡ Battery R2 Admin
          </h1>
          <span style={{ color: "#8b949e", fontSize: "0.8rem" }}>
            {stats?.bucket}
          </span>
          <button
            onClick={() => setAuthed(false)}
            style={{ marginLeft: "auto", background: "transparent", border: "1px solid #30363d",
                     color: "#8b949e", padding: "4px 12px", borderRadius: 6, cursor: "pointer",
                     fontSize: "0.78rem" }}
          >
            Logout
          </button>
        </div>

        {/* Stats row */}
        {stats && (
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <StatCard label="Total Files" value={stats.total_files} />
            <StatCard label="Storage Used" value={`${stats.total_mb} MB`}
                      sub={`${stats.used_pct}% of 10GB free`} color="#58a6ff" />
            <StatCard label="Oldest Data" value={stats.telemetry_oldest?.split("/")[3] || "—"}
                      color="#e3b341" />
            <StatCard label="Newest Data" value={stats.telemetry_newest?.split("/")[3] || "—"}
                      color="#39d353" />
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {["overview", "files", "cleanup"].map(t => (
            <button key={t} style={tabStyle(tab === t)} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === "overview" && stats && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, fontSize: "0.85rem", color: "#8b949e",
                           textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Storage by Type
              </h3>
              {Object.entries(stats.by_prefix || {}).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between",
                                      padding: "6px 0", borderBottom: "1px solid #21262d",
                                      fontSize: "0.82rem" }}>
                  <span style={{ color: "#8b949e" }}>{k}/</span>
                  <span>{v.count} files · {(v.bytes / 1024).toFixed(0)} KB</span>
                </div>
              ))}
            </div>
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, fontSize: "0.85rem", color: "#8b949e",
                           textTransform: "uppercase", letterSpacing: "0.07em" }}>
                R2 Free Tier
              </h3>
              {Object.entries(stats.r2_free_tier_info || {}).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between",
                                      padding: "6px 0", borderBottom: "1px solid #21262d",
                                      fontSize: "0.82rem" }}>
                  <span style={{ color: "#8b949e" }}>{k.replace(/_/g, " ")}</span>
                  <span style={{ color: "#39d353" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files tab */}
        {tab === "files" && (
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem",
                          marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "0.85rem", color: "#8b949e",
                           textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Daily Telemetry Files
              </h3>
              <button onClick={loadFiles} disabled={loading}
                style={{ background: "#1f6feb", color: "white", border: "none",
                         padding: "4px 12px", borderRadius: 6, cursor: "pointer",
                         fontSize: "0.78rem" }}>
                {loading ? "Loading..." : "Load Files"}
              </button>
            </div>
            <div style={{ maxHeight: 500, overflowY: "auto" }}>
              {files.map(f => (
                <div key={f.key} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "7px 0", borderBottom: "1px solid #21262d", fontSize: "0.8rem",
                }}>
                  <span style={{ color: "#58a6ff", fontFamily: "monospace" }}>
                    {f.key.split("/").slice(-3).join("/")}
                  </span>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <span style={{ color: "#8b949e" }}>{f.size_kb} KB</span>
                    <button
                      onClick={() => downloadFile(f.key)}
                      style={{ background: "transparent", border: "1px solid #30363d",
                               color: "#58a6ff", padding: "2px 8px", borderRadius: 4,
                               cursor: "pointer", fontSize: "0.75rem" }}
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
              {files.length === 0 && (
                <p style={{ color: "#8b949e", fontSize: "0.82rem" }}>
                  Click "Load Files" to browse
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cleanup tab */}
        {tab === "cleanup" && (
          <div style={{ display: "grid", gap: "1rem" }}>
            <div style={{ ...cardStyle, borderColor: "rgba(248,113,113,0.3)" }}>
              <h3 style={{ marginTop: 0, fontSize: "0.85rem", color: "#f85149",
                           textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Delete Old Data
              </h3>
              <p style={{ color: "#8b949e", fontSize: "0.82rem", marginBottom: "1rem" }}>
                Deletes all hourly and daily telemetry files older than the chosen date.
                Backfill archive and latest snapshot are never deleted.
                Always run a dry run first.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end",
                            flexWrap: "wrap" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#8b949e",
                                  marginBottom: 4 }}>
                    Delete everything before:
                  </label>
                  <input
                    type="date"
                    value={deleteDate}
                    onChange={e => setDeleteDate(e.target.value)}
                    style={{
                      background: "#0d1117", border: "1px solid #30363d", color: "#e6edf3",
                      padding: "8px 12px", borderRadius: 8, fontFamily: "inherit",
                    }}
                  />
                </div>
                <button
                  onClick={handleDryRun}
                  disabled={!deleteDate || deleting}
                  style={{ background: "#1f6feb", color: "white", border: "none",
                           padding: "9px 16px", borderRadius: 8, cursor: "pointer",
                           fontSize: "0.85rem" }}
                >
                  Preview (dry run)
                </button>
                {dryRunResult && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{ background: "#b91c1c", color: "white", border: "none",
                             padding: "9px 16px", borderRadius: 8, cursor: "pointer",
                             fontSize: "0.85rem" }}
                  >
                    {deleting ? "Deleting..." : `Delete ${dryRunResult.would_delete} files`}
                  </button>
                )}
              </div>

              {dryRunResult && (
                <div style={{ marginTop: "1rem", background: "rgba(31,111,235,0.1)",
                              border: "1px solid rgba(31,111,235,0.3)",
                              borderRadius: 8, padding: "1rem", fontSize: "0.82rem" }}>
                  <div style={{ color: "#58a6ff", fontWeight: 600, marginBottom: 6 }}>
                    Dry Run Preview
                  </div>
                  <div>Would delete: <strong>{dryRunResult.would_delete} files</strong></div>
                  <div>Space freed: <strong>{dryRunResult.total_mb} MB</strong></div>
                  <div style={{ color: "#8b949e" }}>Oldest: {dryRunResult.oldest}</div>
                  <div style={{ color: "#8b949e" }}>Newest: {dryRunResult.newest}</div>
                </div>
              )}

              {deleteResult && (
                <div style={{ marginTop: "1rem", background: "rgba(57,211,83,0.1)",
                              border: "1px solid rgba(57,211,83,0.3)",
                              borderRadius: 8, padding: "1rem", fontSize: "0.82rem" }}>
                  <div style={{ color: "#39d353", fontWeight: 600 }}>
                    ✓ Deleted {deleteResult.deleted} files before {deleteResult.cutoff_date}
                  </div>
                </div>
              )}
            </div>

            {/* Age report */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem",
                            marginBottom: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "0.85rem", color: "#8b949e",
                             textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Data Age Distribution
                </h3>
                <button onClick={loadAgeReport} disabled={loading}
                  style={{ background: "#1f6feb", color: "white", border: "none",
                           padding: "4px 12px", borderRadius: 6, cursor: "pointer",
                           fontSize: "0.78rem" }}>
                  {loading ? "..." : "Run Report"}
                </button>
              </div>
              {ageReport && (
                <div>
                  {Object.entries(ageReport.age_distribution).map(([range, count]) => (
                    <div key={range} style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "6px 0", borderBottom: "1px solid #21262d", fontSize: "0.82rem",
                    }}>
                      <span style={{ color: "#8b949e" }}>{range} old</span>
                      <span>{count} daily files</span>
                    </div>
                  ))}
                  <p style={{ color: "#8b949e", fontSize: "0.75rem", marginBottom: 0, marginTop: 8 }}>
                    Suggested: keep last 2 years, archive older data locally before deleting
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
