/**
 * ─────────────────────────────────────────────────────────────────────────────
 * WIDGET: StatCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Displays a single metric with optional comparison period delta.
 *
 * Props from KpiWrapper:
 *   kpiConfig.title        – display label
 *   kpiConfig.icon         – lucide icon name string
 *   kpiConfig.color        – Tailwind colour name ("rose", "amber", …)
 *   kpiConfig.props.format – "decimal" | "percent" | undefined (integer)
 *   kpiConfig.props.trend  – boolean, show built-in delta badge
 *
 *   resolvedData.value     – current scalar value
 *   resolvedData.delta     – number | null  (pre-computed by extractor)
 *   comparisonData.value   – comparison period scalar value (when Compare active)
 *   comparisonWindow       – { from, to, presetLabel, rangeLabel } | null —
 *                            the resolved date window the comparison value
 *                            actually came from, so the label can read
 *                            "vs 23 Jun – 30 Jun" instead of an unexplained
 *                            "vs comparison" (see comparisonWindow.js)
 *   loading                – boolean
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, AlertCircle, Clock, CheckCircle2, CheckSquare,
  ShieldCheck, FileText, Activity, BarChart3, ClipboardList,
  TrendingUp, TrendingDown, Minus,
} from "lucide-react";

// ─── ICON REGISTRY ────────────────────────────────────────────────────────────
const ICONS = {
  AlertTriangle, AlertCircle, Clock, CheckCircle2, CheckSquare,
  ShieldCheck, FileText, Activity, BarChart3, ClipboardList,
};

// ─── COLOUR MAPS ─────────────────────────────────────────────────────────────
const GRADIENTS = {
  rose:    "from-rose-400 to-rose-600",
  orange:  "from-orange-400 to-orange-600",
  amber:   "from-amber-400 to-amber-600",
  emerald: "from-emerald-400 to-emerald-600",
  blue:    "from-blue-400 to-blue-600",
  indigo:  "from-indigo-400 to-indigo-600",
  violet:  "from-violet-400 to-violet-600",
  purple:  "from-purple-400 to-purple-600",
  slate:   "from-slate-400 to-slate-600",
};

// ─── FORMAT VALUE ─────────────────────────────────────────────────────────────
function formatValue(value, format) {
  if (value == null) return "—";
  if (format === "decimal") return Number(value).toFixed(1);
  if (format === "percent") return `${Number(value).toFixed(0)}%`;
  return String(value);
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
const StatCard = memo(function StatCard({
  kpiConfig,
  resolvedData,
  comparisonData,
  comparisonWindow,
  loading,
}) {
  const { title, icon, color = "slate", props = {} } = kpiConfig;
  const { format, trend } = props;
  const { value, delta } = resolvedData ?? {};
  const compValue = comparisonData?.value ?? null;
  // "increase_negative" means a rise in value should read as bad (red) and a
  // drop should read as good (green) — e.g. open risks, overdue tasks.
  const objective = kpiConfig.comparison?.objective ?? "increase_positive";
  const increaseIsGood = objective !== "increase_negative";

  const IconComp = ICONS[icon] ?? BarChart3;
  const gradient = GRADIENTS[color] ?? GRADIENTS.slate;

  // ── comparison delta (current vs comparison period) ───────────────────────
  const { compDelta, compDeltaPct, compDeltaDir } = useMemo(() => {
    if (value == null || compValue == null) {
      return { compDelta: null, compDeltaPct: null, compDeltaDir: 0 };
    }
    const diff = Number(value) - Number(compValue);
    const pct  = compValue !== 0 ? (diff / Math.abs(compValue)) * 100 : null;
    return {
      compDelta:    diff,
      compDeltaPct: pct,
      compDeltaDir: diff > 0 ? 1 : diff < 0 ? -1 : 0,
    };
  }, [value, compValue]);

  // ── built-in trend delta (from extractor, not comparison) ─────────────────
  const deltaIsGood = delta > 0 ? increaseIsGood : delta < 0 ? !increaseIsGood : null;
  const DeltaIcon  = delta == null || delta === 0 ? Minus : deltaIsGood ? TrendingUp : TrendingDown;
  const deltaColor = delta == null ? "text-slate-400"
    : deltaIsGood  ? "text-emerald-500"
    : "text-rose-500";

  const compIsGood = compDeltaDir > 0 ? increaseIsGood : compDeltaDir < 0 ? !increaseIsGood : null;
  const CompIcon  = compDeltaDir === 0 ? Minus : compIsGood ? TrendingUp : TrendingDown;
  const compColor = compDeltaDir === 0 ? "text-slate-400"
    : compIsGood ? "text-emerald-500"
    : "text-rose-500";

  return (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl p-4 shadow-sm hover:shadow-md flex flex-col gap-2 transition-shadow"
    >
      {/* Top row: icon + value + label */}
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
          <IconComp size={18} className="text-white drop-shadow-sm" />
        </div>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="h-6 w-12 bg-slate-100 rounded animate-pulse mb-1" />
          ) : (
            <span className="text-2xl font-bold text-slate-800 block leading-tight">
              {formatValue(value, format)}
            </span>
          )}
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide truncate block">
            {title}
          </span>
        </div>

        {/* Built-in trend delta badge */}
        {trend && delta != null && !loading && (
          <span className={`flex items-center gap-1 text-xs font-bold flex-shrink-0 ${deltaColor}`}>
            <DeltaIcon size={12} />
            {delta > 0 ? "+" : ""}{delta}
          </span>
        )}
      </div>

      {/* Comparison row — only when comparisonData is present. The label
          shows the ACTUAL resolved window ("vs 23 Jun – 30 Jun") rather than
          a generic "vs comparison" — end users have no way to guess what a
          preset name like "Previous Period" resolves to on any given day,
          so we just show them the dates. The preset name is still available
          as a hover tooltip for anyone who wants it. */}
      {!loading && compValue != null && (
        <div
          className="flex items-center justify-between pt-1.5 border-t border-slate-100 mt-0.5"
          title={comparisonWindow?.presetLabel ? `${comparisonWindow.presetLabel} · ${comparisonWindow.from} – ${comparisonWindow.to}` : undefined}
        >
          <span className="text-[10px] text-slate-400 font-medium">
            {comparisonWindow?.rangeLabel ? `vs ${comparisonWindow.rangeLabel}` : "vs comparison"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-semibold">
              {formatValue(compValue, format)}
            </span>
            {compDelta != null && (
              <span className={`flex items-center gap-0.5 text-[11px] font-bold ${compColor}`}>
                <CompIcon size={11} />
                {compDelta > 0 ? "+" : ""}{formatValue(compDelta, format)}
                {compDeltaPct != null && (
                  <span className="text-[10px] font-medium opacity-70 ml-0.5">
                    ({compDeltaPct > 0 ? "+" : ""}{compDeltaPct.toFixed(0)}%)
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
});

export default StatCard;