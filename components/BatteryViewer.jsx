"use client";
/**
 * components/BatteryViewer.jsx
 * Live battery status component for trudie.dpdns.org
 *
 * Reads from /api/ecoflow/latest (R2 via Cloudflare Worker)
 * Falls back gracefully when data is unavailable.
 *
 * Usage in any page:
 *   import BatteryViewer from "@/components/BatteryViewer";
 *   <BatteryViewer />
 */

import { useState, useEffect } from "react";

function timeAgo(isoString) {
  if (!isoString) return "unknown";
  const diff = (Date.now() - new Date(isoString)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatRuntime(minutes) {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function socColor(soc) {
  if (soc >= 70) return "#4ade80";
  if (soc >= 30) return "#fbbf24";
  return "#f87171";
}

function BatteryArc({ soc }) {
  const radius = 54;
  const cx = 70;
  const cy = 70;
  const strokeWidth = 7;
  const gap = 30;
  const startAngle = 90 + gap / 2;
  const sweep = 360 - gap;
  const filled = (soc / 100) * sweep;
  const color = socColor(soc);

  function polarToXY(angle, r) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(start, end, r) {
    const s = polarToXY(start, r);
    const e = polarToXY(end, r);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const trackEnd = startAngle + sweep;
  const fillEnd = startAngle + filled;

  return (
    <svg width={140} height={140} viewBox="0 0 140 140" aria-label={`Battery at ${soc.toFixed(1)}%`}>
      <path d={arcPath(startAngle, trackEnd, radius)} fill="none"
        stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d={arcPath(startAngle, fillEnd, radius)} fill="none"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        style={{ transition: "stroke 0.5s ease" }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill={color}
        fontSize="22" fontWeight="700" fontFamily="'JetBrains Mono', monospace"
        style={{ transition: "fill 0.5s" }}>
        {soc.toFixed(1)}
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill="rgba(255,255,255,0.4)"
        fontSize="11" fontFamily="'JetBrains Mono', monospace">
        % charged
      </text>
    </svg>
  );
}

function LiveDot({ active }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{
        display: "inline-block", width: 7, height: 7, borderRadius: "50%",
        background: active ? "#4ade80" : "#6b7280",
        animation: active ? "pulse-ring 2s ease infinite" : "none",
      }} />
      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(74,222,128,0.4); }
          70%  { box-shadow: 0 0 0 8px rgba(74,222,128,0); }
          100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
        }
      `}</style>
    </span>
  );
}

function Stat({ label, value, unit, color }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "0.82rem",
    }}>
      <span style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{label}</span>
      <span style={{ color: color || "rgba(255,255,255,0.85)", fontFamily: "'JetBrains Mono', monospace" }}>
        {value}<span style={{ color: "rgba(255,255,255,0.3)", marginLeft: 3, fontSize: "0.75em" }}>{unit}</span>
      </span>
    </div>
  );
}

export default function BatteryViewer({ showFullDashboard = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchData() {
    try {
      const res = await fetch("/api/ecoflow/latest", { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120_000);
    return () => clearInterval(interval);
  }, []);

  const isLive = data && (Date.now() - new Date(data.timestamp_iso)) < 3_600_000;

  const shell = {
    background: "rgba(10,10,14,0.85)", backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16,
    padding: "1.75rem", maxWidth: 340, width: "100%",
    fontFamily: "'Inter', system-ui, sans-serif", color: "rgba(255,255,255,0.85)",
  };

  if (loading) return (
    <div style={shell}>
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem" }}>
        reading the battery...
      </div>
    </div>
  );

  if (error || !data) return (
    <div style={shell}>
      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)",
                    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
        home energy
      </div>
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", lineHeight: 1.6 }}>
        the battery is quiet right now —<br />check back soon
      </div>
    </div>
  );

  const { soc, solar_in, power_out, power_in, temp_c,
          remain_dsg_min, remain_chg_min, timestamp_iso } = data;
  const isCharging = power_in > power_out;
  const isSolarCharging = solar_in > 10;
  const netFlow = power_in - power_out;

  return (
    <div style={shell}>
      <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)",
                        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>
            home energy
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
            EcoFlow Delta Pro 3
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6,
                      fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>
          <LiveDot active={isLive} />
          {timeAgo(timestamp_iso)}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <BatteryArc soc={soc} />
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.05)", borderRadius: 20,
            padding: "4px 10px", fontSize: "0.75rem", marginBottom: 8,
            color: isSolarCharging ? "#fbbf24" : isCharging ? "#4ade80" : "rgba(255,255,255,0.5)",
          }}>
            {isSolarCharging ? "☀ solar" : isCharging ? "↑ charging" : "↓ drawing"}
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: netFlow > 0 ? "#4ade80" : "rgba(255,255,255,0.7)", lineHeight: 1 }}>
            {Math.abs(netFlow).toFixed(0)}
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>W</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: 3 }}>
            {netFlow > 0 ? "net in" : "net out"}
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem" }}>
        {solar_in > 0 && <Stat label="solar input" value={solar_in.toFixed(0)} unit="W" color="#fbbf24" />}
        <Stat label="output" value={power_out.toFixed(0)} unit="W" />
        <Stat label="temperature" value={temp_c} unit="°C" />
        <Stat label={isCharging ? "full in" : "runtime left"}
              value={formatRuntime(isCharging ? remain_chg_min : remain_dsg_min)}
              color={isCharging ? "#4ade80" : undefined} />
      </div>

      {showFullDashboard && (
        <div style={{ marginTop: "1rem", paddingTop: "0.75rem",
                      borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <a href="/personal/energy"
             style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)",
                      textDecoration: "none", letterSpacing: "0.05em" }}>
            full dashboard →
          </a>
        </div>
      )}
    </div>
  );
}
