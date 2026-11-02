"use client"
// Translucent mouse over info card for the distributed energy resources on the
// microgrid schematic. Shows full nameplate technical specifications, field
// photos hosted on R2 with direct URL links, and operational status.
import { ExternalLink, X } from "lucide-react"
import {
  MICROGRID_DERS,
  type MicrogridDerId,
} from "@/config/microgrid-ders"

interface DerInfoCardProps {
  derId: MicrogridDerId
  left: number
  top: number
  width: number
  dark?: boolean
  onClose?: () => void
}

export function DerInfoCard({
  derId,
  left,
  top,
  width,
  dark = true,
  onClose,
}: DerInfoCardProps) {
  const der = MICROGRID_DERS[derId]

  return (
    <div
      role="dialog"
      aria-label={`${der.title} specifications and photos`}
      className="absolute z-50 overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-150"
      style={{
        left,
        top,
        width,
        background: dark
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(255, 255, 255, 0.68)",
        backdropFilter: "blur(24px) saturate(190%)",
        WebkitBackdropFilter: "blur(24px) saturate(190%)",
        border: dark
          ? "1px solid rgba(255, 255, 255, 0.22)"
          : "1px solid rgba(255, 255, 255, 0.85)",
        boxShadow: dark
          ? "0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.35)"
          : "0 24px 60px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.95)",
        color: dark ? "#ffffff" : "#0f172a",
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between gap-2 px-4 pt-3.5 pb-2.5"
        style={{
          background: dark
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(255, 255, 255, 0.45)",
          borderBottom: dark
            ? "1px solid rgba(255, 255, 255, 0.12)"
            : "1px solid rgba(226, 232, 240, 0.8)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
            style={{
              background: der.accent,
              boxShadow: `0 0 10px ${der.accent}`,
            }}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`text-xs font-bold tracking-tight font-sans ${
                  dark ? "text-white" : "text-slate-900"
                }`}
              >
                {der.title}
              </h4>
              <span
                className="text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold border"
                style={{
                  backgroundColor: `${der.accent}20`,
                  borderColor: `${der.accent}55`,
                  color: der.accent,
                }}
              >
                {der.statusBadge}
              </span>
            </div>
            <p
              className={`text-[11px] font-medium mt-0.5 ${
                dark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {der.subtitle}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={`p-1 rounded-md transition-colors ${
              dark
                ? "text-slate-400 hover:text-white hover:bg-white/10"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Close card"
            aria-label="Close card"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="max-h-[380px] overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
        {/* Photo Gallery with URL Links */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider font-mono ${
                dark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Field Asset Photos
            </span>
            <span
              className={`text-[10px] font-mono ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              assets.trudie.dpdns.org
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {der.photos.map((photo) => (
              <div key={photo.filename} className="space-y-1">
                <a
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Open ${photo.caption} full size`}
                  className="group relative block h-20 overflow-hidden rounded-lg shadow-sm"
                  style={{
                    border: dark
                      ? "1px solid rgba(255, 255, 255, 0.18)"
                      : "1px solid rgba(226, 232, 240, 0.9)",
                    background: dark
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="p-1 rounded bg-white/90 text-slate-900 shadow">
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </a>
                <a
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-[9px] font-mono hover:underline truncate font-semibold ${
                    dark
                      ? "text-sky-300 hover:text-sky-200"
                      : "text-blue-700 hover:text-blue-900"
                  }`}
                  title={photo.url}
                >
                  {photo.filename}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Nameplate Specifications */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider font-mono ${
                dark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Nameplate Technical Specifications
            </span>
          </div>

          <dl
            className="rounded-xl px-3 py-1 shadow-sm divide-y divide-dashed"
            style={{
              background: dark
                ? "rgba(255, 255, 255, 0.04)"
                : "rgba(255, 255, 255, 0.5)",
              border: dark
                ? "1px solid rgba(255, 255, 255, 0.12)"
                : "1px solid rgba(226, 232, 240, 0.8)",
              borderColor: dark
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(226, 232, 240, 0.8)",
            }}
          >
            {der.specs.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-2 py-1"
                style={{
                  borderBottomColor: dark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(203, 213, 225, 0.6)",
                }}
              >
                <dt
                  className={`text-[10px] uppercase tracking-wide font-sans font-semibold ${
                    dark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {row.label}
                </dt>
                <dd
                  className={`text-right font-mono text-[11px] font-semibold ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Operating condition notice */}
        <div
          className="rounded-xl p-2.5"
          style={{
            backgroundColor: `${der.accent}14`,
            border: `1px solid ${der.accent}35`,
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-wider mb-0.5 font-mono"
            style={{ color: der.accent }}
          >
            Operating Status
          </p>
          <p
            className={`text-[10px] leading-relaxed font-sans font-medium ${
              dark ? "text-slate-200" : "text-slate-800"
            }`}
          >
            {der.operatingCondition}
          </p>
        </div>
      </div>
    </div>
  )
}
