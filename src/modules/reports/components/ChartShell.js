/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SHARED: ChartShell + helpers  (v3 — title gated behind showTitle)
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides the common card wrapper, loading skeleton, empty state, and
 * custom recharts tooltip used by all chart widgets.
 *
 * `title` only renders when `showTitle` is explicitly true. Trend/line/bar
 * charts already self-label via their axis + legend, so they pass nothing
 * (default false) and keep their original look. Donut/pie charts pass
 * showTitle to surface the module name (e.g. "Risks · By Status") top-left.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from "react";
import { BarChart3 } from "lucide-react";

// ─── CHART SHELL ─────────────────────────────────────────────────────────────
export function ChartShell({ title, showTitle = false, loading, hasData, height, children }) {
  return (
    <div className="h-full bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
      {showTitle && title && (
        <p className="text-xs font-semibold text-slate-600 truncate">{title}</p>
      )}
      <div
        className="flex-1 min-h-0"
        style={height ? { height, flexShrink: 0 } : undefined}
      >
        {loading ? (
          <div className="h-full bg-slate-100/60 rounded-xl animate-pulse" />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// ─── EMPTY CHART ───────────────────────────────────────────────────────────────
export function EmptyChart({ message = "No data in this period" }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
      <BarChart3 size={36} className="text-slate-200" strokeWidth={1.5} />
      <p className="text-xs font-semibold text-slate-400">{message}</p>
    </div>
  );
}

// ─── CUSTOM TOOLTIP ────────────────────────────────────────────────────────────
export function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg text-xs min-w-[140px]">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500 flex-1">{p.name}</span>
          <span className="font-bold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── PIE TOOLTIP ────────────────────────────────────────────────────────────────
export function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg text-xs">
      <p className="font-bold text-slate-700">{d.name}</p>
      <p className="text-slate-500 mt-0.5">{d.value} items</p>
    </div>
  );
}

// ─── SHARED PIE PALETTE ──────────────────────────────────────────────────────
export const PIE_PALETTE = [
  "#10b981","#6366f1","#f59e0b","#ef4444",
  "#3b82f6","#8b5cf6","#14b8a6","#f97316",
];