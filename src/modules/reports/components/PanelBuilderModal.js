/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PanelBuilderModal.jsx  (v5 — KPI duration restored)
 * ─────────────────────────────────────────────────────────────────────────────
 * Steps (new panel):
 * 0  Category        (KPI / Charts)
 * 1  Visualization   (Stat Card / Score Gauge / Target Meter
 * OR Line / Bar / Donut) — with mini preview
 * 2  Data config     (module, metric, duration, comparison, benchmarks)
 * 3  Review & save
 *
 * v5 changes:
 *   - KPI panels (StatCard/ScoreGauge/TargetMeter) get back a Duration
 *     control — 7D / 14D / 90D / Custom — shown ONLY for KPI category.
 *     This is a plain date-range window so a KPI's value (and its
 *     Comparison Period baseline) means "latest snapshot within the
 *     last N days" instead of an unqualified all-time latest.
 *   - Charts/maps still have exactly ONE duration concept: groupBy
 *     (Duration X-axis: Day/Week/Month/Year) + Max Grouping in
 *     "More Options" — no separate lookback picker for charts.
 *   - resolveComparisonWindow now derives its day-span from the KPI's
 *     own selected duration instead of a hardcoded 7 days.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, GitCompareArrows, Filter } from "lucide-react";
import {
  AVAILABLE_EXTRACTORS, MODULES, GROUP_BY_OPTIONS,
  COMPARE_TO_OPTIONS, OBJECTIVE_OPTIONS, SORT_BY_OPTIONS, MAX_GROUPING_OPTIONS,
  TARGET_METER_TYPES, TARGET_FOR_OPTIONS, TARGET_TYPE_OPTIONS,
} from "./dashboardSchema";
import { fetchAssignableUsers, filterUsersByRole, ASSIGNABLE_ROLES } from "./targetAudience";
import { GRANULARITY_DAYS, resolveComparisonWindow } from "./comparisonWindow";

// ─── constants ────────────────────────────────────────────────────────────────

const PANEL_CATEGORIES = [
  { id: "kpi",          label: "KPI",           icon: "🔢", description: "Single-value visualizations" },
  { id: "chart",        label: "Charts",        icon: "📊", description: "Trend & analytical charts"    },
  // { id: "target_meter", label: "Target Meter",  icon: "📏", description: "Progress toward a goal value" },
];

const COMPONENT_TYPES = [
  {
    category: "KPI",
    items: [
      { type: "StatCard",    label: "Stat Card",    icon: "🔢", hint: "Single number with trend indicator" },
      { type: "ScoreGauge",  label: "Score Gauge",  icon: "🎯", hint: "Circular gauge for 0–100 scores"    },
    ],
  },
  {
    category: "Chart",
    items: [
      { type: "TrendLineChart",   label: "Line Chart", icon: "📈", hint: "Multi-series line with optional benchmarks" },
      { type: "TrendBarChart",    label: "Bar Chart",  icon: "📊", hint: "Grouped bars — great for comparisons"      },
      { type: "DonutStatusChart", label: "Donut",      icon: "🍩", hint: "Status / category breakdown"              },
    ],
  },
];

const TREND_TYPES = new Set(["TrendLineChart", "TrendBarChart"]);
const MAP_TYPES   = new Set(["DonutStatusChart", "DepartmentBreakdown"]);

const SERIES_COLORS = ["#6366f1","#ef4444","#10b981","#f59e0b","#3b82f6","#a855f7","#06b6d4","#f97316"];

// GRANULARITY_DAYS now lives in ./comparisonWindow (shared with DashboardEngine,
// which must resolve the same presets at read-time rather than trusting
// whatever was frozen into the panel at save time).

const CRITERIA_DIMENSIONS = [
  { key: "department", label: "Department" },
  { key: "client",     label: "Client"     },
  { key: "branch",     label: "Branch"     },
];

// Risks module doesn't have byDepartment/byClient/byBranch maps (it's a raw
// record list) and has no client/branch fields at all — so it gets its own
// dimension set, switched in based on the selected module (see isRiskModule).
const RISK_CRITERIA_DIMENSIONS = [
  { key: "department", label: "Department", hint: "also determines which risk owner is shown" },
  { key: "riskLevel",  label: "Risk Level" },
  { key: "riskType",   label: "Type" },
];

const AUDIT_CRITERIA_DIMENSIONS = [
  { key: "status",        label: "Status" },
  { key: "auditType",     label: "Type" },
  { key: "frameworkCode", label: "Framework" },
];

const TASK_CRITERIA_DIMENSIONS = [
  { key: "status",        label: "Status" },
  { key: "employee",      label: "Owner" },
  { key: "relatedModule", label: "Related Module" },
];

// Mirrors DashboardEngine's panelSignature — two panels are "the same panel testing it out"
// if they're the same component type showing the same underlying data
// field(s), regardless of generated id/title.
function panelSignature(panel) {
  const props = panel.props ?? {};
  if (Array.isArray(props.series) && props.series.length) {
    const extractors = props.series.map((s) => s.extractor).filter(Boolean).sort().join("|");
    return `${panel.componentType}::${extractors}`;
  }
  return `${panel.componentType}::${props.extractor ?? ""}`;
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StepDots({ current, total }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current  ? "bg-indigo-500 w-4" :
            i === current ? "bg-indigo-400 w-6" :
            "bg-slate-200 w-4"
          }`}
        />
      ))}
    </div>
  );
}

function FieldLabel({ children, hint }) {
  return (
    <div className="mb-1.5">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{children}</span>
      {hint && <span className="ml-2 text-[11px] text-slate-400 normal-case font-normal">{hint}</span>}
    </div>
  );
}

function ExtractorSelect({ value, onChange, scalarOnly = false, moduleFilter = "", placeholder = "Select a data field…" }) {
  const MAP_EXTRACTORS = new Set([
    "risks.risksByTreatmentType",
    "audit.byStatus", "audit.byType", "audit.byFramework",
    "tasks.byStatus", "tasks.byModule",
    "dpia.byStatus", "dpia.byDepartment",
  ]);

  const byScope = scalarOnly
    ? AVAILABLE_EXTRACTORS.filter((e) => !MAP_EXTRACTORS.has(e.extractor))
    : AVAILABLE_EXTRACTORS;

  const filtered = moduleFilter
    ? byScope.filter((e) => e.extractor.split(".")[0] === moduleFilter)
    : byScope;

  const groups = useMemo(() => {
    const map = {};
    for (const e of filtered) {
      const mod = e.extractor.split(".")[0];
      const key = mod.charAt(0).toUpperCase() + mod.slice(1);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    return map;
  }, [filtered]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-700
        focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all
        cursor-pointer appearance-none
        bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 fill%3D%22none%22 viewBox%3D%220 0 20 20%22%3E%3Cpath stroke%3D%22%236b7280%22 stroke-linecap%3D%22round%22 stroke-linejoin%3D%22round%22 stroke-width%3D%221.5%22 d%3D%22m6 8 4 4 4-4%22%2F%3E%3C%2Fsvg%3E')]
        bg-[position:right_0.5rem_center] bg-[size:1.25rem] pr-8"
    >
      <option value="" disabled>{placeholder}</option>
      {Object.entries(groups).map(([mod, items]) => (
        <optgroup key={mod} label={`── ${mod}`}>
          {items.map((e) => (
            <option key={e.extractor} value={e.extractor}>{e.label}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function SeriesRow({ series, index, onChange, onRemove, canRemove, moduleFilter }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15 }}
      className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-2"
    >
      <div className="flex gap-2 items-center">
        <input
          value={series.label}
          onChange={(e) => onChange(index, "label", e.target.value)}
          placeholder="Series label"
          className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
        <div className="relative flex items-center gap-1">
          <div className="w-6 h-6 rounded-md border-2 border-white shadow-sm cursor-pointer" style={{ backgroundColor: series.color }} />
          <input
            type="color" value={series.color}
            onChange={(e) => onChange(index, "color", e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(index)}
            className="w-6 h-6 rounded-full bg-rose-100 text-rose-500 hover:bg-rose-200 flex items-center justify-center text-sm font-bold"
          >
            ×
          </button>
        )}
      </div>
      <ExtractorSelect
        value={series.extractor}
        scalarOnly
        moduleFilter={moduleFilter}
        onChange={(v) => {
          onChange(index, "extractor", v);
          if (!series.key || series.key.startsWith("series")) onChange(index, "key", v.replace(/\./g, "_"));
          const found = AVAILABLE_EXTRACTORS.find((e) => e.extractor === v);
          const defaultLabel = `Series ${index + 1}`;
          if (found && (!series.label || series.label === defaultLabel || series.label === series.extractor)) {
            onChange(index, "label", found.label);
          }
        }}
        placeholder="Select data field…"
      />
    </motion.div>
  );
}

function BenchmarkRow({ bm, index, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={bm.value}
        onChange={(e) => onChange(index, "value", Number(e.target.value))}
        placeholder="Value"
        className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 text-center bg-white"
      />
      <input
        value={bm.label}
        onChange={(e) => onChange(index, "label", e.target.value)}
        placeholder="Label (e.g. Target)"
        className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
      />
      <div className="relative w-7 h-7 flex-shrink-0">
        <div className="w-full h-full rounded-md border-2 border-white shadow-sm" style={{ backgroundColor: bm.color }} />
        <input type="color" value={bm.color} onChange={(e) => onChange(index, "color", e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
      </div>
      <button onClick={() => onRemove(index)} className="text-slate-400 hover:text-rose-500 transition-colors">
        <Minus size={13} />
      </button>
    </div>
  );
}

// ─── KPI Duration (By Day / By Week / By Month / By Year) ────────────────────
// The ONLY duration control KPI panels have — same granularity concept as
// the chart X-axis. "By Month" means the value reflects the latest snapshot
// within the current month; the Comparison Period baseline below shifts by
// one period of that same granularity.
function DurationSection({ granularity, onChange }) {
  return (
    <div>
      <FieldLabel hint="which period the latest snapshot is taken from">Duration</FieldLabel>
      <div className="flex gap-2 flex-wrap">
        {GROUP_BY_OPTIONS.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => onChange(g.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
              granularity === g.key
                ? "border-indigo-400 bg-indigo-50 text-indigo-600"
                : "border-slate-150 bg-slate-50 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Criteria filter (AND-conjunction, Bigin style) ───────────────────────────
function CriteriaFilterSection({ rows, onChange, dimensions, valueOptions }) {
  const addRow = () => onChange([...rows, { dimension: dimensions[0]?.key ?? "department", values: [] }]);
  const updateRow = (i, field, value) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <FieldLabel hint="AND — every row must match">Criteria filter (optional)</FieldLabel>
        <button onClick={addRow} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
          <Plus size={12} /> Add
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="text-[11px] text-slate-400">No criteria — this panel shows org-wide data.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => {
            const options = valueOptions[row.dimension] ?? [];
            const dim = dimensions.find((d) => d.key === row.dimension);
            return (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 space-y-2">
                <div className="flex items-center gap-2">
                  <Filter size={11} className="text-slate-400 flex-shrink-0" />
                  <select
                    value={row.dimension}
                    onChange={(e) => updateRow(i, "dimension", e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    {dimensions.map((d) => (
                      <option key={d.key} value={d.key}>{d.label}</option>
                    ))}
                  </select>
                  <span className="text-[10px] font-bold text-slate-400">is any of</span>
                  <button onClick={() => removeRow(i)} className="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0">
                    <Minus size={13} />
                  </button>
                </div>
                {dim?.hint && <p className="text-[10px] text-slate-400 -mt-1">{dim.hint}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {options.length === 0 && <span className="text-[10px] text-slate-400">No {dim?.label ?? row.dimension} values found in current data.</span>}
                  {options.map((opt) => {
                    const checked = row.values.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateRow(i, "values", checked ? row.values.filter((v) => v !== opt) : [...row.values, opt])}
                        className={`px-2 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                          checked ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Comparison section ───────────────────────────────────────────────────────
function ComparisonSection({ comparison, onChange }) {
  const { enabled, from, to, compareTo = "same_period_last_year", objective = "increase_positive" } = comparison;

  // Default "previous year" when first enabled
  const enable = () => {
    const d = new Date();
    const prevYear = new Date(d);
    prevYear.setFullYear(d.getFullYear() - 1);
    onChange({
      enabled: true,
      compareTo: "same_period_last_year",
      objective: "increase_positive",
      from: prevYear.toISOString().slice(0, 10),
      to: d.toISOString().slice(0, 10),
    });
  };

  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => enabled ? onChange({ ...comparison, enabled: false }) : enable()}
        className={`w-full flex items-center justify-between px-3.5 py-3 transition-colors ${
          enabled ? "bg-violet-50 border-b border-violet-100" : "bg-slate-50 hover:bg-slate-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <GitCompareArrows size={13} className={enabled ? "text-violet-600" : "text-slate-400"} />
          <span className={`text-[11px] font-bold uppercase tracking-widest ${enabled ? "text-violet-700" : "text-slate-500"}`}>
            Comparison period
          </span>
        </div>
        {/* Toggle pill */}
        <div className={`relative w-8 h-4 rounded-full transition-colors ${enabled ? "bg-violet-500" : "bg-slate-200"}`}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${enabled ? "left-4" : "left-0.5"}`} />
        </div>
      </button>

      {/* Compare To / Objective / date pickers (visible when enabled) */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 py-3 space-y-3 bg-violet-50/40">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Compare to</label>
                <select
                  value={compareTo}
                  onChange={(e) => onChange({ ...comparison, compareTo: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  {COMPARE_TO_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Objective</label>
                <select
                  value={objective}
                  onChange={(e) => onChange({ ...comparison, objective: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  {OBJECTIVE_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                  ))}
                </select>
              </div>

              {compareTo === "custom" && (
                <>
                  <p className="text-[10px] text-slate-400">
                    Show this panel's data alongside a second date window for side-by-side comparison.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">From</label>
                      <input
                        type="date" value={from}
                        onChange={(e) => onChange({ ...comparison, from: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">To</label>
                      <input
                        type="date" value={to} min={from}
                        onChange={(e) => onChange({ ...comparison, to: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// resolveComparisonWindow is now imported from ./comparisonWindow and is
// used here ONLY to render a live preview on the Review step — it is no
// longer used to bake concrete dates into the saved panel (see handleSave).

function ReviewRow({ label, value, mono }) {
  // 1. If it's a null or undefined, render a placeholder
  if (value == null) return null;

  // 2. If it's an object, try to extract a string value,
  //    otherwise, print the type or a warning to the screen instead of crashing
  let displayValue = value;
  if (typeof value === 'object') {
     // If it's an array, join it; if it's an object, try specific keys
     if (Array.isArray(value)) displayValue = value.join(', ');
     else displayValue = value.title || value.label || value.extractor || JSON.stringify(value);
  }

  // Final safety check: if we somehow still have an object,
  // return a stringified version so React doesn't throw.
  if (typeof displayValue === 'object') displayValue = "Error: Invalid object passed";

  return (
    <div className="flex items-center justify-between px-4 py-3 gap-4">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">
        {label}
      </span>
      <span className={`text-xs text-slate-700 text-right ${mono ? "font-mono" : "font-medium"}`}>
        {String(displayValue)}
      </span>
    </div>
  );
}

// Lightweight, non-library preview shown on each visualization card in Step 1.
// These are static placeholders — not live charts. Built with SVG/CSS rather
// than Unicode glyphs so they render identically across browsers and fonts
// (the old "▇▃▆▅" / "◜82%◝" glyphs rendered as uniform blocks on some systems).
function VisualizationPreview({ type }) {
  switch (type) {
    case "StatCard":
      return (
        <div className="text-center">
          <div className="text-base font-bold text-slate-700 leading-none">12,458</div>
          <div className="text-[10px] font-semibold text-emerald-500 mt-1">↑ 12%</div>
        </div>
      );

    case "ScoreGauge":
      return (
        <div
          className="relative w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "conic-gradient(#6366f1 0deg 295deg, #e2e8f0 295deg 360deg)" }}
        >
          <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center">
            <span className="text-[9px] font-bold text-slate-700">82%</span>
          </div>
        </div>
      );

    case "TargetMeter":
      return (
        <div className="w-12 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full rounded-full bg-indigo-500" style={{ width: "65%" }} />
        </div>
      );

    case "TrendLineChart":
      return (
        <svg viewBox="0 0 40 20" className="w-10 h-6">
          <polyline
            points="2,16 12,7 22,13 38,3"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "TrendBarChart":
      return (
        <svg viewBox="0 0 40 20" className="w-10 h-6">
          <rect x="2"  y="8"  width="6" height="12" rx="1.5" fill="#6366f1" />
          <rect x="12" y="3"  width="6" height="17" rx="1.5" fill="#6366f1" />
          <rect x="22" y="10" width="6" height="10" rx="1.5" fill="#6366f1" />
          <rect x="32" y="6"  width="6" height="14" rx="1.5" fill="#6366f1" />
        </svg>
      );

    case "DonutStatusChart":
      return (
        <div
          className="relative w-9 h-9 rounded-full"
          style={{ background: "conic-gradient(#6366f1 0deg 150deg, #a855f7 150deg 230deg, #e2e8f0 230deg 360deg)" }}
        >
          <div className="absolute inset-[7px] rounded-full bg-white" />
        </div>
      );

    default:
      return <span className="text-xl">📦</span>;
  }
}

// Same idea as VisualizationPreview, but for the four Target Meter sub-types
// (Dial Gauge / Traffic Lights / Single Bar / Multiple Bar) shown in
// TargetMeterTypeSection. Static SVG/CSS mockups, not live data.
function TargetMeterPreview({ type }) {
  switch (type) {
    case "dial_gauge":
      return (
        <svg viewBox="0 0 40 24" className="w-9 h-6">
          <path d="M4 21 A16 16 0 0 1 36 21" fill="none" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
          <path d="M4 21 A16 16 0 0 1 36 21" fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round"
                strokeDasharray="32 50.3" />
          <line x1="20" y1="21" x2="26" y2="9" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="21" r="1.6" fill="#475569" />
        </svg>
      );

    case "traffic_lights":
      return (
        <svg viewBox="0 0 40 24" className="w-9 h-6">
          <path d="M4 21 A16 16 0 0 1 15 6" fill="none" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
          <path d="M15 6 A16 16 0 0 1 25 6" fill="none" stroke="#fbbf24" strokeWidth="4" />
          <path d="M25 6 A16 16 0 0 1 36 21" fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
          <line x1="20" y1="21" x2="27" y2="11" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="21" r="1.6" fill="#1e293b" />
        </svg>
      );

    case "single_bar":
      return (
        <div className="w-9 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full rounded-full bg-indigo-500" style={{ width: "70%" }} />
        </div>
      );

    case "multiple_bar":
      return (
        <div className="flex flex-col gap-1 w-9">
          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: "85%" }} />
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-400" style={{ width: "55%" }} />
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-300" style={{ width: "35%" }} />
          </div>
        </div>
      );

    default:
      return <span className="text-base">🎯</span>;
  }
}

function TargetMeterTypeSection({ value, onChange }) {
  return (
    <div>
      <FieldLabel hint="how the target is visualized">Target Meter Type</FieldLabel>
      <div className="grid grid-cols-2 gap-2">
        {TARGET_METER_TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`px-3 py-2.5 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
              value === t.key ? "border-indigo-400 bg-indigo-50" : "border-slate-150 bg-slate-50 hover:border-indigo-300"
            }`}
          >
            <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <TargetMeterPreview type={t.key} />
            </span>
            <span className="min-w-0">
              <p className="text-xs font-semibold text-slate-700">{t.label}</p>
              <p className="text-[10px] text-slate-400">{t.hint}</p>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SetTargetForSection({ targetFor, onTargetForChange, selectedRole, onRoleChange,
  selectedUserIds, onUserIdsChange, roleFilteredUsers, usersLoading, targetType, onTargetTypeChange }) {
  const toggleUser = (id) =>
    onUserIdsChange(selectedUserIds.includes(id) ? selectedUserIds.filter((u) => u !== id) : [...selectedUserIds, id]);

  return (
    <div className="space-y-3">
      <div>
        <FieldLabel hint="who this target applies to">Set Target for</FieldLabel>
        <select
          value={targetFor}
          onChange={(e) => { onTargetForChange(e.target.value); onUserIdsChange([]); onRoleChange(""); }}
          className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="" disabled>Select…</option>
          {TARGET_FOR_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>

      {targetFor === "specific_roles" && (
        <div>
          <FieldLabel>Role</FieldLabel>
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="" disabled>Select a role…</option>
            {ASSIGNABLE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      )}

      {(targetFor === "specific_users" || (targetFor === "specific_roles" && selectedRole)) && (
        <div>
          <FieldLabel hint={usersLoading ? "loading…" : `${roleFilteredUsers.length} available`}>Select Users</FieldLabel>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto border border-slate-100 rounded-xl p-2">
            {roleFilteredUsers.map((u) => {
              const checked = selectedUserIds.includes(u.id ?? u._id);
              return (
                <button
                  key={u.id ?? u._id}
                  type="button"
                  onClick={() => toggleUser(u.id ?? u._id)}
                  className={`px-2 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                    checked ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  {u.name ?? u.email ?? u.id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <FieldLabel hint="one shared target, or one target per selected person">Target Type</FieldLabel>
        <div className="flex gap-2">
          {TARGET_TYPE_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => onTargetTypeChange(o.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${
                targetType === o.key ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-slate-150 bg-slate-50 text-slate-500"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── main modal ───────────────────────────────────────────────────────────────
export default function PanelBuilderModal({ editingPanel = null, existingPanels = [], dimensionOptions = {}, riskDimensionOptions = {}, auditDimensionOptions = {}, taskDimensionOptions = {}, orgId, onClose, onSave }) {
  const isEdit = !!editingPanel;
  const ep = editingPanel?.panel ?? null;

  // Derive the initial category from the existing panel's component type when editing.
const initialCategory = useMemo(() => {
  if (!ep?.componentType) return "";
  if (ep.componentType === "TargetMeter") return "target_meter";
  const found = COMPONENT_TYPES.find((c) => c.items.some((i) => i.type === ep.componentType));
  return found?.category === "KPI" ? "kpi" : found?.category === "Chart" ? "chart" : "";
}, [ep]);

  const [category, setCategory] = useState(initialCategory);
  const [step, setStep] = useState(0);
  const [chartType, setChartType] = useState(ep?.componentType ?? "");

  // Component Name — required, must be unique within the current view.
  const [componentName, setComponentName] = useState(ep?.title ?? "");
  // Module — narrows the Data field dropdown.
  const [module, setModule] = useState(ep?.module ?? "");
  // Criteria filter rows (AND-conjunction): [{ dimension, values }]
  const [criteriaRows, setCriteriaRows] = useState(() => {
    const cf = ep?.criteriaFilters;
    if (!cf) return [];
    return Object.entries(cf)
      .filter(([, values]) => Array.isArray(values) && values.length)
      .map(([dimension, values]) => ({ dimension, values }));
  });
  // Duration X-axis grouping (charts): day | week | month | year — this is
  // now the ONLY duration concept charts have, combined with maxGrouping below.
  const [groupBy, setGroupBy] = useState(ep?.groupBy ?? "day");
  // Chart "More Options" grouping
  const [sortBy, setSortBy] = useState(ep?.props?.grouping?.sortBy ?? "");
  const [maxGrouping, setMaxGrouping] = useState(ep?.props?.grouping?.maxGrouping ?? 5);

  // Trend series
  const [series, setSeries] = useState(() => {
    if (ep?.props?.series?.length) return ep.props.series;
    return [{ key: "series1", label: "Series 1", extractor: "", color: SERIES_COLORS[0] }];
  });

  // Single / donut / gauge / target
  const [singleExtractor, setSingleExtractor] = useState(ep?.props?.extractor ?? "");
  const [targetValue, setTargetValue] = useState(ep?.props?.target ?? "");
  // Per-user targets when targetType === "individual": { [userId]: number }
  const [individualTargets, setIndividualTargets] = useState(ep?.props?.individualTargets ?? {});

  const [targetMeterType, setTargetMeterType] = useState(ep?.props?.meterType ?? "single_bar");
  const [targetFor, setTargetFor]       = useState(ep?.props?.targetFor?.type ?? "");
  const [allUsers, setAllUsers]         = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState(ep?.props?.targetFor?.userIds ?? []);
  const [selectedRole, setSelectedRole] = useState(ep?.props?.targetFor?.role ?? "");
  const [targetType, setTargetType]     = useState(ep?.props?.targetType ?? "common");

  // Duration (KPI only) — separate from chart groupBy/maxGrouping in storage,
  // but the SAME granularity concept (Day/Week/Month/Year). This is what
  // makes a StatCard's value, and its Comparison Period, actually mean
  // something: "By Month" = latest snapshot within the current month.
  const [kpiGranularity, setKpiGranularity] = useState(ep?.duration?.granularity ?? "day");

  // Benchmarks for trend charts
  const [benchmarks, setBenchmarks] = useState(() => ep?.props?.benchmarks ?? []);

  // ── Comparison (per-panel, KPI only) ──────────────────────────────────────
  const [comparison, setComparison] = useState(() => {
    if (ep?.comparison) return ep.comparison;
    const d = new Date();
    const prev = new Date(d);
    prev.setFullYear(d.getFullYear() - 1);
    return {
      enabled: false,
      from: prev.toISOString().slice(0, 10),
      to: d.toISOString().slice(0, 10),
    };
  });

  const isTrend  = TREND_TYPES.has(chartType);
  const isMap    = MAP_TYPES.has(chartType);
  const isTarget = chartType === "TargetMeter";
  
    // Load the assignable-users picker once, when Target Meter + "Specific Users/Roles" is reached
  const fetchedUsersRef = useRef(false);

  useEffect(() => {
    if (!isTarget || !orgId || fetchedUsersRef.current) return;
    fetchedUsersRef.current = true;
    setUsersLoading(true);
    fetchAssignableUsers(orgId)
      .then((res) => setAllUsers(Array.isArray(res) ? res : res?.data ?? []))
      .catch((e) => { console.error("fetchAssignableUsers failed:", e); setAllUsers([]); })
      .finally(() => setUsersLoading(false));
  }, [isTarget, orgId]);

  const roleFilteredUsers = useMemo(
    () => (selectedRole ? filterUsersByRole(allUsers, selectedRole) : allUsers),
    [allUsers, selectedRole]
  );


  const isKpiCategory = category === "kpi" || category === "target_meter";

  // Visualization options available for the currently selected category.
  const visualizationItems = useMemo(() => {
    if (category === "kpi")   return COMPONENT_TYPES.find((c) => c.category === "KPI")?.items ?? [];
    if (category === "chart") return COMPONENT_TYPES.find((c) => c.category === "Chart")?.items ?? [];
    return [];
  }, [category]);

  const addSeries = () =>
    setSeries((prev) => [
      ...prev,
      { key: `series${prev.length + 1}`, label: `Series ${prev.length + 1}`, extractor: "", color: SERIES_COLORS[prev.length % SERIES_COLORS.length] },
    ]);

  const updateSeries  = (i, field, value) => setSeries((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  const removeSeries  = (i) => setSeries((prev) => prev.filter((_, idx) => idx !== i));
  const addBenchmark  = () => setBenchmarks((prev) => prev.length ? prev : [{ value: 0, label: "Target", color: "#ef4444" }]);
  const updateBenchmark = (i, field, value) => setBenchmarks((prev) => prev.map((b, idx) => idx === i ? { ...b, [field]: value } : b));
  const removeBenchmark = (i) => setBenchmarks((prev) => prev.filter((_, idx) => idx !== i));

  // Validation
  const step0Valid = category !== "";
  const step1Valid = category === "target_meter" ? !!targetMeterType : chartType !== "";
  const trimmedName = componentName.trim();
  const nameTaken = useMemo(() => {
    if (!trimmedName) return false;
    return existingPanels.some(
      (p) => p.id !== ep?.id && (p.title ?? "").trim().toLowerCase() === trimmedName.toLowerCase()
    );
  }, [existingPanels, trimmedName, ep]);
  const step2Valid =
    trimmedName !== "" && module !== "" && !nameTaken &&
    (isTrend ? series.some((s) => s.extractor) : singleExtractor !== "");

  const totalSteps = 4;

  const [duplicateError, setDuplicateError] = useState(null);

  const handleSave = () => {
    if (nameTaken) {
      setDuplicateError("A component with this name already exists in this view.");
      return;
    }

    const panelId = isEdit ? ep.id : `panel_${Date.now()}`;

    const grouping = (sortBy || maxGrouping) ? { sortBy, maxGrouping: Number(maxGrouping) || 5 } : undefined;

    const props = isTrend
      ? {
          series: series.filter((s) => s.extractor && s.key),
          ...(grouping ? { grouping } : {}),
          ...(benchmarks.length ? { benchmarks: benchmarks.slice(0, 1) } : {}),
        }
        : isTarget
        ? {
            extractor: singleExtractor,
            target: targetValue ? Number(targetValue) : undefined,
            meterType: targetMeterType,
            targetType,
            ...(targetType === "individual" && Object.keys(individualTargets).length ? {
              individualTargets: Object.fromEntries(
                Object.entries(individualTargets)
                  .filter(([, v]) => v !== "" && v != null)
                  .map(([id, v]) => [id, Number(v)])
              ),
            } : {}),
            ...(targetFor ? {
              targetFor: {
                type: targetFor,
                ...(targetFor === "specific_roles" ? { role: selectedRole } : {}),
                userIds: selectedUserIds,
              },
            } : {}),
          }
      : isMap
      ? { extractor: singleExtractor, ...(grouping ? { grouping } : {}) }
      : { extractor: singleExtractor };

    // Criteria filter rows → { department: [...], client: [...], branch: [...] }
    const criteriaFilters = criteriaRows.reduce((acc, row) => {
      if (row.values.length) {
        acc[row.dimension] = [...(acc[row.dimension] ?? []), ...row.values];
      }
      return acc;
    }, {});

    // KPI duration — the only duration concept KPI panels have, same
    // granularity vocabulary as the chart X-axis (day/week/month/year).
    const duration = isKpiCategory ? { granularity: kpiGranularity } : undefined;

    // Persist the comparison config as the PRESET, not a resolved date
    // window. "Previous Period" / "Previous Relative Period" / "Same Period
    // Last Year" are all relative to "today" — if we bake them into a
    // concrete {from, to} here and store that forever, the panel silently
    // goes stale the moment a day passes without re-saving it (DashboardEngine
    // now recomputes the real window on every render via resolveComparisonWindow,
    // using the panel's own duration granularity). "Custom" is the one case
    // that's genuinely a fixed, user-picked range, so its from/to ARE persisted.
    const storedComparison = comparison.enabled
      ? (comparison.compareTo === "custom"
          ? { enabled: true, compareTo: "custom", objective: comparison.objective, from: comparison.from, to: comparison.to }
          : { enabled: true, compareTo: comparison.compareTo, objective: comparison.objective })
      : comparison;

    const panel = {
      id: panelId,
      componentType: chartType,
      title: trimmedName,
      module,
      ...(Object.keys(criteriaFilters).length ? { criteriaFilters } : {}),
      ...(isTrend ? { groupBy } : {}),
      ...(duration ? { duration } : {}),
      props,
      // Store comparison config on the panel itself (KPI only) — preset key
      // only for relative presets; see storedComparison comment above.
      ...(comparison.enabled ? { comparison: storedComparison } : {}),
    };

    // Block adding (not editing) a panel that already exists on the
    // dashboard with the same component type + data field — this is the
    // same restriction templates previously used, applied to the manual builder too.
    if (!isEdit) {
      const sig = panelSignature(panel);
      const isDuplicate = existingPanels.some((p) => panelSignature(p) === sig);
      if (isDuplicate) {
        setDuplicateError("A panel showing this exact data already exists on this dashboard.");
        return;
      }
    }

    onSave({ panel, isEdit, originalPanelId: ep?.id });
    onClose();
  };

  const categoryLabel = (id) => PANEL_CATEGORIES.find((c) => c.id === id)?.label ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {isEdit ? "Edit Component" : "Add Component"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {step === 0 && "Choose a category"}
                {step === 1 && "Choose a visualization"}
                {step === 2 && "Configure data, duration & comparison"}
                {step === 3 && "Review and add to dashboard"}
              </p>
            </div>
            <button onClick={onClose} className="p-1 text-slate-300 hover:text-slate-500">
              <X size={16} />
            </button>
          </div>
          <StepDots current={step} total={totalSteps} />
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[62vh] overflow-y-auto space-y-4">
          <AnimatePresence mode="wait">

            {/* Step 0: Choose Category */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="space-y-3">
                <FieldLabel>Choose what you'd like to add</FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  {PANEL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        if (cat.id === "target_meter") {
                          setChartType("TargetMeter");
                          return;
                        }
                        // Changing category invalidates a previously chosen visualization
                        // from the other category.
                        setChartType((prev) => {
                          const stillValid = COMPONENT_TYPES
                            .find((c) => (cat.id === "kpi" ? c.category === "KPI" : c.category === "Chart"))
                            ?.items.some((i) => i.type === prev);
                          return stillValid ? prev : "";
                        });
                      }}
                      className={`flex flex-col items-center gap-1.5 px-3.5 py-4 rounded-xl border-2 transition-all text-center ${
                        category === cat.id
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-slate-150 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      <span className="text-2xl leading-none">{cat.icon}</span>
                      <span className="text-sm font-semibold text-slate-700">{cat.label}</span>
                      <span className="text-[11px] text-slate-400">{cat.description}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: Choose Visualization */}
            {step === 1 && category !== "target_meter" && (
              <motion.div key="step1-viz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="space-y-2">
                <FieldLabel hint={category === "kpi" ? "single-value formats" : "trend & breakdown formats"}>
                  {categoryLabel(category)} visualizations
                </FieldLabel>
                <div className="grid grid-cols-1 gap-2.5">
                  {visualizationItems.map((c) => (
                    <button
                      key={c.type}
                      onClick={() => setChartType(c.type)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 transition-all text-left ${
                        chartType === c.type
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-slate-150 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      <div className="w-16 h-12 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0">
                        <VisualizationPreview type={c.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700">{c.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{c.hint}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && category === "target_meter" && (
              <motion.div key="step1-meter" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}>
                <TargetMeterTypeSection value={targetMeterType} onChange={setTargetMeterType} />
              </motion.div>
            )}

            {/* Step 2: Data config */}
            {step === 2 && (
              <motion.div key="step2-config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="space-y-5">

                {/* Component Name */}
                <div>
                  <FieldLabel hint="shown on the panel and must be unique in this view">Component Name</FieldLabel>
                  <input
                    value={componentName}
                    onChange={(e) => { setComponentName(e.target.value); setDuplicateError(null); }}
                    placeholder="e.g. Task Due By Month"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all text-slate-700 ${
                      nameTaken ? "border-rose-300 focus:ring-rose-300" : "border-slate-200 focus:ring-indigo-300"
                    }`}
                  />
                  {nameTaken && (
                    <p className="text-[11px] text-rose-500 mt-1">A component already exists with this name in this view.</p>
                  )}
                </div>

                {/* Module */}
                <div>
                  <FieldLabel hint="narrows which data fields are available">Module</FieldLabel>
                  <select
                    value={module}
                    onChange={(e) => {
                      setModule(e.target.value);
                      setSingleExtractor("");
                      setSeries((prev) => prev.map((s) => ({ ...s, extractor: "" })));
                      setCriteriaRows([]); // dimension set differs per module (e.g. risks has no client/branch)
                    }}
                    className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-700
                      focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select a module…</option>
                    {MODULES.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Trend: series */}
                {isTrend && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <FieldLabel hint="one line or bar per series">Data Series</FieldLabel>
                      <button onClick={addSeries} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    <AnimatePresence>
                      {series.map((s, i) => (
                        <div key={i} className="mb-2">
                          <SeriesRow series={s} index={i} onChange={updateSeries} onRemove={removeSeries} canRemove={series.length > 1} moduleFilter={module} />
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Single / donut / gauge */}
                {!isTrend && (
                  <div>
                    <FieldLabel hint={isMap ? "object map like risks.byStatus" : "scalar e.g. risks.total"}>
                      Data field
                    </FieldLabel>
                    <ExtractorSelect value={singleExtractor} onChange={setSingleExtractor} scalarOnly={!isMap} moduleFilter={module} />
                  </div>
                )}

                {/* Criteria filter — dimension set depends on module: risks uses its own
                    raw-record fields (department/riskLevel/riskType), everything else uses
                    the generic precomputed department/client/branch maps. */}
                <CriteriaFilterSection
                  rows={criteriaRows}
                  onChange={setCriteriaRows}
                  dimensions={
                    module === "risks" ? RISK_CRITERIA_DIMENSIONS :
                    module === "audit" ? AUDIT_CRITERIA_DIMENSIONS :
                    module === "tasks" ? TASK_CRITERIA_DIMENSIONS :
                    CRITERIA_DIMENSIONS
                  }
                  valueOptions={
                    module === "risks"
                      ? {
                          department: riskDimensionOptions?.departments ?? [],
                          riskLevel: riskDimensionOptions?.riskLevels ?? [],
                          riskType: riskDimensionOptions?.riskTypes ?? [],
                        }
                      : module === "audit"
                      ? {
                          status: auditDimensionOptions?.statuses ?? [],
                          auditType: auditDimensionOptions?.auditTypes ?? [],
                          frameworkCode: auditDimensionOptions?.frameworks ?? [],
                        }
                      : module === "tasks"
                      ? {
                          status: taskDimensionOptions?.statuses ?? [],
                          employee: taskDimensionOptions?.owners ?? [],
                          relatedModule: taskDimensionOptions?.relatedModules ?? [],
                        }
                      : {
                          department: dimensionOptions?.departments ?? [],
                          client: dimensionOptions?.clients ?? [],
                          branch: dimensionOptions?.branches ?? [],
                        }
                  }
                />

                {isTarget && (
                  <SetTargetForSection
                    targetFor={targetFor} onTargetForChange={setTargetFor}
                    selectedRole={selectedRole} onRoleChange={setSelectedRole}
                    selectedUserIds={selectedUserIds} onUserIdsChange={setSelectedUserIds}
                    roleFilteredUsers={roleFilteredUsers} usersLoading={usersLoading}
                    targetType={targetType} onTargetTypeChange={setTargetType}
                  />
                )}
                {/* Target value (TargetMeter only) */}
                {isTarget && targetType === "common" && (
                  <div>
                    <FieldLabel hint="the 100% / goal value">Target value</FieldLabel>
                    <input
                      type="number" min="0" value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700 transition-all"
                    />
                  </div>
                )}

                {isTarget && targetType === "individual" && (
                  <div>
                    <FieldLabel hint="one goal value per selected person">Target values</FieldLabel>
                    {selectedUserIds.length === 0 ? (
                      <p className="text-[11px] text-slate-400">Select users above to set individual targets.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedUserIds.map((id) => {
                          const u = roleFilteredUsers.find((x) => (x.id ?? x._id) === id);
                          return (
                            <div key={id} className="flex items-center gap-2">
                              <span className="flex-1 text-xs font-medium text-slate-600 truncate">
                                {u?.name ?? u?.email ?? id}
                              </span>
                              <input
                                type="number" min="0"
                                value={individualTargets[id] ?? ""}
                                onChange={(e) => setIndividualTargets((prev) => ({ ...prev, [id]: e.target.value }))}
                                placeholder="e.g. 100"
                                className="w-24 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Duration (KPI only) — 7D/14D/90D/Custom. The only duration
                    concept KPI panels have; drives the snapshot window and the
                    Comparison Period baseline below. */}
                {isKpiCategory && (
                  <DurationSection
                    granularity={kpiGranularity}
                    onChange={setKpiGranularity}
                  />
                )}

                {/* Duration (X-axis): the ONLY duration control for charts.
                    Combined with "Maximum grouping" below, e.g. By Week + 75
                    = the last 75 weeks from today. */}
                {isTrend && (
                  <div>
                    <FieldLabel hint="how points are grouped along the x-axis — paired with Max Grouping below">Duration (X-axis)</FieldLabel>
                    <div className="flex gap-2 flex-wrap">
                      {GROUP_BY_OPTIONS.map((g) => (
                        <button
                          key={g.key}
                          type="button"
                          onClick={() => setGroupBy(g.key)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                            groupBy === g.key
                              ? "border-indigo-400 bg-indigo-50 text-indigo-600"
                              : "border-slate-150 bg-slate-50 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50"
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benchmark for y-axis — trend charts only, single benchmark max */}
                {isTrend && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <FieldLabel hint="one reference line on the y-axis">Benchmark for y-axis</FieldLabel>
                      {benchmarks.length === 0 && (
                        <button onClick={addBenchmark} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                          <Plus size={12} /> Add
                        </button>
                      )}
                    </div>
                    {benchmarks.length === 0 ? (
                      <p className="text-[11px] text-slate-400">No benchmark yet — add one reference line to mark a target or threshold.</p>
                    ) : (
                      <div className="space-y-2">
                        {benchmarks.map((bm, i) => (
                          <BenchmarkRow key={i} bm={bm} index={i} onChange={updateBenchmark} onRemove={removeBenchmark} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* More Options — grouping (charts only). Maximum grouping is
                    what actually bounds the time window in combination with
                    Duration (X-axis) above — e.g. By Week + Max 75 = last 75 weeks. */}
                {(isTrend || isMap) && (
                  <div className="rounded-xl border border-slate-100 p-3.5 space-y-3 bg-slate-50/60">
                    <FieldLabel hint={isTrend ? "ordering, and how many periods back to show" : "how categories/bars are ordered and capped"}>More Options</FieldLabel>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      >
                        <option value="">Default (chronological / as returned)</option>
                        {SORT_BY_OPTIONS.map((o) => (
                          <option key={o.key} value={o.key}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Maximum grouping{isTrend ? ` (last ${maxGrouping} ${GROUP_BY_OPTIONS.find((g) => g.key === groupBy)?.label.replace("By ", "").toLowerCase()}s)` : ""}
                      </label>
                      <select
                        value={maxGrouping}
                        onChange={(e) => setMaxGrouping(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      >
                        {MAX_GROUPING_OPTIONS.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* ── Comparison period (KPI only, per spec) ── */}
                {isKpiCategory && (
                  <ComparisonSection comparison={comparison} onChange={setComparison} />
                )}

              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div key="step3-review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="space-y-3">
                <div className="rounded-xl bg-slate-50 border border-slate-100 divide-y divide-slate-100">
                  <ReviewRow label="Name" value={trimmedName} />
                  <ReviewRow label="Category" value={categoryLabel(category)} />
                  <ReviewRow label="Visualization" value={visualizationItems.find((v) => v.type === chartType)?.label ?? chartType} />
                  <ReviewRow label="Module" value={MODULES.find((m) => m.id === module)?.label ?? module} />
                  {criteriaRows.filter((r) => r.values.length).length > 0 && (
                    <ReviewRow
                      label="Criteria"
                      value={criteriaRows.filter((r) => r.values.length).map((r) => `${r.dimension}: ${r.values.join("/")}`).join("  AND  ")}
                    />
                  )}
                  {isKpiCategory && (
                    <ReviewRow
                      label="Duration"
                      value={GROUP_BY_OPTIONS.find((g) => g.key === kpiGranularity)?.label}
                    />
                  )}
                  {isTrend && <ReviewRow label="X-axis" value={GROUP_BY_OPTIONS.find((g) => g.key === groupBy)?.label} />}
                  {(isTrend || isMap) && sortBy && <ReviewRow label="Sort By" value={SORT_BY_OPTIONS.find((o) => o.key === sortBy)?.label} />}
                  {(isTrend || isMap) && <ReviewRow label="Max Grouping" value={maxGrouping} />}

                <div className="px-4 py-3">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Configuration</p>
                  <div className="text-xs text-slate-700 font-medium">
                    {isTrend ? (
                      series.map((s, i) => (
                        <div key={i} className="mb-1">
                          {String(s.label || "Series")}
                          <span className="font-mono text-slate-400 ml-1">({String(s.extractor || "No Field")})</span>
                        </div>
                      ))
                    ) : (
                      <div>Field: <span className="font-mono">{String(singleExtractor || "None")}</span></div>
                    )}
                  </div>
                </div>

                  {/* Comparison Section — the {from,to} shown here is a live
                      preview only (computed against today, right now) and is
                      NOT what gets persisted for relative presets. The actual
                      window is recomputed the same way by DashboardEngine on
                      every render, so it never goes stale. */}
                  {comparison.enabled && (
                    <div className="px-4 py-3 flex items-center gap-2">
                      <GitCompareArrows size={11} className="text-violet-500 flex-shrink-0" />
                      <span className="text-[11px] text-slate-500">
                        Comparison: {COMPARE_TO_OPTIONS.find((o) => o.key === comparison.compareTo)?.label ?? "Custom"}
                        {(() => {
                          const preview = resolveComparisonWindow(comparison, GRANULARITY_DAYS[kpiGranularity] ?? 7);
                          return preview.from && preview.to ? ` (${preview.from} → ${preview.to})` : "";
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 text-center">
                  {isEdit ? "Your changes will be saved." : "This panel will be added to your dashboard."}
                </p>

                {duplicateError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-600 text-center">
                    {duplicateError}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              setDuplicateError(null);
              if (step === 0) onClose();
              else setStep(step - 1);
            }}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium px-2 py-1"
          >
            {step === 0 ? "Cancel" : "← Back"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => { setDuplicateError(null); setStep(step + 1); }}
              disabled={
                (step === 0 && !step0Valid) ||
                (step === 1 && !step1Valid) ||
                (step === 2 && !step2Valid)
              }
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold
                hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed
                active:scale-95 transition-all shadow-sm"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold
                hover:bg-emerald-700 active:scale-95 transition-all shadow-sm flex items-center gap-2"
            >
              ✓ {isEdit ? "Save Changes" : "Add Component"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}