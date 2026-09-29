/**
 * ─────────────────────────────────────────────────────────────────────────────
 * WIDGET: TargetMeter  (v2 — Dial Gauge / Traffic Lights / Single Bar / Multiple Bar)
 * ─────────────────────────────────────────────────────────────────────────────
 * Props from KpiWrapper:
 *   kpiConfig.title            – label
 *   kpiConfig.props.target     – the 100% goal value
 *   kpiConfig.props.extractor
 *   kpiConfig.props.meterType  – "dial_gauge" | "traffic_lights" | "single_bar" | "multiple_bar"
 *   kpiConfig.props.targetType – "common" | "individual"
 *   kpiConfig.props.targetFor  – { type: "specific_users"|"specific_roles", role?, userIds: [] }
 *   kpiConfig.color            – Tailwind colour token
 *
 *   resolvedData.value         – current value (org-wide scalar)
 *   resolvedData.byUser        – OPTIONAL: { [userId]: number|null } — real
 *                                 per-user values once the backend's
 *                                 data.tasks.byEmployee map is populated for
 *                                 this org. A given id maps to null if no
 *                                 matching record exists for that user; ids
 *                                 not present in byUser, or byUser being
 *                                 entirely absent, fall back to the org-wide
 *                                 `value`, clearly labeled as a placeholder.
 *   comparisonData.value       – previous period value (optional)
 *   loading                    – boolean
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

const BAR_COLORS = {
  rose:    { bar: "bg-gradient-to-r from-rose-400  to-rose-600",    text: "text-rose-600",    hex: "#e11d48" },
  orange:  { bar: "bg-gradient-to-r from-orange-400 to-orange-600", text: "text-orange-600",  hex: "#ea580c" },
  amber:   { bar: "bg-gradient-to-r from-amber-400 to-amber-600",   text: "text-amber-600",   hex: "#d97706" },
  emerald: { bar: "bg-gradient-to-r from-emerald-400 to-emerald-600",text: "text-emerald-600",hex: "#059669" },
  blue:    { bar: "bg-gradient-to-r from-blue-400  to-blue-600",    text: "text-blue-600",    hex: "#2563eb" },
  indigo:  { bar: "bg-gradient-to-r from-indigo-400 to-indigo-600", text: "text-indigo-600",  hex: "#4f46e5" },
  violet:  { bar: "bg-gradient-to-r from-violet-400 to-violet-600", text: "text-violet-600",  hex: "#7c3aed" },
  slate:   { bar: "bg-gradient-to-r from-slate-400 to-slate-600",   text: "text-slate-600",   hex: "#475569" },
};

function pctOf(value, target) {
  if (value == null || !target) return 0;
  return Math.min(100, Math.max(0, Math.round((Number(value) / Number(target)) * 100)));
}

function statusColorFor(pct) {
  return pct >= 100 ? "text-emerald-600 bg-emerald-50" :
         pct >= 75  ? "text-indigo-600 bg-indigo-50"   :
         pct >= 50  ? "text-amber-600 bg-amber-50"      :
                       "text-rose-600 bg-rose-50";
}

// ── Header (shared across all 4 types) ──────────────────────────────────────
function MeterHeader({ title, barClass, pct, hidePct }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${barClass.replace("bg-gradient-to-r ", "")} flex items-center justify-center shadow-sm flex-shrink-0`}>
          <Target size={14} className="text-white" />
        </div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate">{title}</span>
      </div>
      {!hidePct && (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColorFor(pct)}`}>
          {pct}%
        </span>
      )}
    </div>
  );
}

// ── Single Bar (existing behaviour, unchanged visually) ─────────────────────
function SingleBarBody({ value, target, compValue, loading, barClass, textClass }) {
  const pct = useMemo(() => pctOf(value, target), [value, target]);
  const compPct = useMemo(() => (compValue == null || !target ? null : pctOf(compValue, target)), [compValue, target]);

  return (
    <>
      {loading ? (
        <div className="h-5 w-24 bg-slate-100 rounded animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${textClass}`}>{value ?? "—"}</span>
          {target && <span className="text-sm text-slate-400 font-medium">/ {target}</span>}
        </div>
      )}

      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: loading ? "0%" : `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className={`h-full rounded-full ${barClass}`}
          />
        </div>
        {compPct !== null && !loading && (
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${compPct}%` }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="h-full rounded-full bg-slate-300"
              />
            </div>
            <span className="text-[10px] text-slate-400 flex-shrink-0">prev {compPct}%</span>
          </div>
        )}
      </div>

      {!loading && target && (
        <div className="flex items-center justify-between text-[10px] text-slate-400 -mt-1">
          <span>0</span>
          <span className={`font-semibold ${textClass}`}>Target: {target}</span>
        </div>
      )}
    </>
  );
}

// ── Multiple Bar — one row per selected user/role member ────────────────────
// `byUser` (when present) holds real per-user values keyed by id, sourced from
// the backend's data.tasks.byEmployee map. A row only falls back to the
// shared org-wide `value` when byUser is entirely absent (feature not wired
// for this data source) OR this specific id has no matching record — and in
// either case that row is flagged via `isPlaceholder` so the badge only shows
// when it's actually needed, instead of always.
function MultipleBarBody({ value, target, individualTargets, targetFor, userLabels, byUser, loading, barClass, textClass }) {
  const rows = useMemo(() => {
    const ids = targetFor?.userIds ?? [];
    if (!ids.length) return [];
    return ids.map((id) => {
      const hasReal = byUser != null && byUser[id] != null;
      return {
        id,
        label: userLabels?.[id] ?? id,
        value: hasReal ? byUser[id] : value, // real per-user value, or shared fallback
        target: individualTargets?.[id] ?? target,
        isPlaceholder: !hasReal,
      };
    });
  }, [targetFor, value, userLabels, byUser, individualTargets, target]);

  if (!rows.length) {
    return (
      <p className="text-[11px] text-slate-400">
        No users selected — pick Specific Users or Specific Roles in the panel builder.
      </p>
    );
  }

  const anyPlaceholder = rows.some((r) => r.isPlaceholder);

  return (
    <div className="space-y-2.5">
      {anyPlaceholder && (
        <span className="inline-block text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full w-fit">
          Shared value — per-user data not yet connected
        </span>
      )}
      {rows.map((row) => {
        const pct = pctOf(row.value, row.target);
        return (
          <div key={row.id} className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600 truncate">{row.label}</span>
              <span className="text-slate-400 flex-shrink-0">{loading ? "—" : `${row.value ?? "—"} / ${row.target ?? "—"}`}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: loading ? "0%" : `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${barClass}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Dial Gauge — semicircle needle ───────────────────────────────────────────
function DialGaugeBody({ value, target, loading, hex, textClass }) {
  const pct = useMemo(() => pctOf(value, target), [value, target]);
  // Needle sweeps -90deg (0%) to +90deg (100%) across a semicircle
  const angle = -90 + (pct / 100) * 180;

  return (
    <div className="flex flex-col items-center gap-2 py-1">
      <svg viewBox="0 0 200 110" className="w-full max-w-[200px]">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={hex}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 251.2} 251.2`}
        />
        <g transform={`rotate(${angle} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="35" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="100" r="6" fill="#475569" />
      </svg>
      {loading ? (
        <div className="h-5 w-20 bg-slate-100 rounded animate-pulse" />
      ) : (
        <div className="text-center -mt-2">
          <span className={`text-xl font-bold ${textClass}`}>{value ?? "—"}</span>
          {target && <span className="text-xs text-slate-400 font-medium ml-1">/ {target}</span>}
        </div>
      )}
    </div>
  );
}

// ── Traffic Lights — same gauge shape, red/amber/green zones ────────────────
function TrafficLightsBody({ value, target, loading, textClass }) {
  const pct = useMemo(() => pctOf(value, target), [value, target]);
  const angle = -90 + (pct / 100) * 180;

  return (
    <div className="flex flex-col items-center gap-2 py-1">
      <svg viewBox="0 0 200 110" className="w-full max-w-[200px]">
        <path d="M 20 100 A 80 80 0 0 1 83 23"  fill="none" stroke="#f87171" strokeWidth="14" strokeLinecap="round" />
        <path d="M 83 23  A 80 80 0 0 1 117 23" fill="none" stroke="#fbbf24" strokeWidth="14" />
        <path d="M 117 23 A 80 80 0 0 1 180 100" fill="none" stroke="#34d399" strokeWidth="14" strokeLinecap="round" />
        <g transform={`rotate(${angle} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="35" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="100" r="6" fill="#1e293b" />
      </svg>
      {loading ? (
        <div className="h-5 w-20 bg-slate-100 rounded animate-pulse" />
      ) : (
        <div className="text-center -mt-2">
          <span className={`text-xl font-bold ${textClass}`}>{value ?? "—"}</span>
          {target && <span className="text-xs text-slate-400 font-medium ml-1">/ {target}</span>}
        </div>
      )}
    </div>
  );
}



const TargetMeter = memo(function TargetMeter({ kpiConfig, resolvedData, comparisonData, loading }) {
  const { title, color = "indigo", props = {} } = kpiConfig;
  const { target, meterType = "single_bar", targetFor, targetType = "common", individualTargets } = props;
  const { value, byUser, userLabels } = resolvedData ?? {};
  const compValue = comparisonData?.value ?? null;

  const { bar: barClass, text: textClass, hex } = BAR_COLORS[color] ?? BAR_COLORS.indigo;
  const pct = useMemo(() => pctOf(value, target), [value, target]);

  // Which body renders is decided solely by the meter type the user picked
  // in the panel builder (Dial Gauge / Traffic Lights / Single Bar / Multiple
  // Bar). `targetType` ("common" vs "individual") only affects which target
  // value(s) are used — it must NOT also gate which body renders, or picking
  // "Individual Target" on a Dial Gauge / Traffic Lights / Single Bar panel
  // renders BOTH that gauge AND the per-user row list stacked underneath it
  // (the org-wide gauge plus a duplicate breakdown below).
  const isMultiple = meterType === "multiple_bar";
  const hidePctInHeader = meterType === "dial_gauge" || meterType === "traffic_lights" || isMultiple;

  return (
    <motion.div
      whileHover={{ scale: 1.015, translateY: -1 }}
      transition={{ duration: 0.2 }}
      className="h-full bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl p-4 shadow-sm hover:shadow-md flex flex-col gap-3 transition-shadow"
    >
      <MeterHeader title={title} barClass={barClass} pct={pct} hidePct={hidePctInHeader} />

      {meterType === "dial_gauge" && (
        <DialGaugeBody value={value} target={target} loading={loading} hex={hex} textClass={textClass} />
      )}

      {meterType === "traffic_lights" && (
        <TrafficLightsBody value={value} target={target} loading={loading} textClass={textClass} />
      )}

      {isMultiple && (
        <MultipleBarBody
          value={value} target={target} individualTargets={individualTargets} targetFor={targetFor} userLabels={userLabels}
          byUser={byUser}
          loading={loading} barClass={barClass} textClass={textClass}
        />
      )}

      {!isMultiple && meterType !== "dial_gauge" && meterType !== "traffic_lights" && (
        <SingleBarBody
          value={value} target={target} compValue={compValue} loading={loading}
          barClass={barClass} textClass={textClass}
        />
      )}
    </motion.div>
  );
});

export default TargetMeter;