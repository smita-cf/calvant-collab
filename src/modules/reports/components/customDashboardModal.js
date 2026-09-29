/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CustomDashboardModal.jsx  (v3 — no view placement, mixed-bag templates)
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes from v2:
 *   1. Removed Step 0 (view placement) entirely — there is only one view now,
 *      so every panel and every template's panels go straight into it.
 *   2. Template gallery selection no longer creates a new view. It calls
 *      onAppendTemplate(panels) which merges the template's panels into the
 *      existing single dashboard view — this is what makes the canvas a
 *      genuine mixed bag (risk + audit + DPIA tiles side by side).
 *   3. onSave payload simplified: { panel, isEdit, originalPanelId }
 *      (viewId / viewLabel removed — the parent always targets the one view)
 *
 * Props:
 *   editingPanel     { panel } | null
 *   onClose          () => void
 *   onSave           ({ panel, isEdit, originalPanelId }) => void
 *   onAppendTemplate (panels[]) => void
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AVAILABLE_EXTRACTORS } from "./dashboardSchema";

// ─── builder-selectable chart types ──────────────────────────────────────────
const AVAILABLE_COMPONENTS = [
  {
    type: "StatCard",
    label: "Stat Card",
    icon: "🔢",
    hint: "Single number with optional trend",
  },
  {
    type: "TrendLineChart",
    label: "Line Chart",
    icon: "📈",
    hint: "Multi-series line over time",
  },
  {
    type: "TrendBarChart",
    label: "Bar Chart",
    icon: "📊",
    hint: "Grouped bars for comparisons",
  },
  {
    type: "DonutStatusChart",
    label: "Donut Chart",
    icon: "🍩",
    hint: "Status / category breakdown",
  },
];

const TREND_TYPES = new Set(["TrendLineChart", "TrendBarChart"]);

const SERIES_COLORS = [
  "#6366f1",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#a855f7",
  "#06b6d4",
  "#f97316",
];

const MAP_EXTRACTORS = new Set([
  "risks.byStatus",
  "risks.byDepartment",
  "audit.byStatus",
  "audit.byDepartment",
  "tasks.byStatus",
  "tasks.byDepartment",
  "dpia.byStatus",
  "dpia.byDepartment",
]);

// ─── PREDEFINED TEMPLATE GALLERY ──────────────────────────────────────────────
// Every template here is intentionally cross-segment — each one mixes tiles
// from multiple modules (risks, audit, tasks, dpia, documents, aiia) rather
// than being scoped to a single source. There is no single-segment template;
// "mixed bag" is the gallery's default, not an opt-in option. Selecting a
// template APPENDS its panels into the single dashboard view, so users can
// also layer multiple templates together over time.
const PANEL_TEMPLATES = [
  {
    id: "tpl_compliance_snapshot",
    label: "Compliance Snapshot",
    icon: "🧩",
    description: "One headline number from every segment, at a glance",
    panels: [
      { componentType: "StatCard", title: "Risks · Total", props: { extractor: "risks.total" } },
      { componentType: "StatCard", title: "Audit · Total", props: { extractor: "audit.total" } },
      { componentType: "StatCard", title: "Tasks · Overdue", props: { extractor: "tasks.overdue" } },
      { componentType: "StatCard", title: "DPIA · Total", props: { extractor: "dpia.total" } },
      { componentType: "StatCard", title: "Documents · Pending", props: { extractor: "documents.pendingApproval" } },
      { componentType: "StatCard", title: "AIIA · S1 Total", props: { extractor: "aiia.stage1Total" } },
    ],
  },
  {
    id: "tpl_open_items",
    label: "Open Items Across Modules",
    icon: "⚠️",
    description: "What's still open or overdue, pulled from risk, audit, tasks and DPIA",
    panels: [
      { componentType: "StatCard", title: "Risks · Open", props: { extractor: "risks.byStatus.Open" } },
      { componentType: "StatCard", title: "Audit · Open", props: { extractor: "audit.byStatus.Open" } },
      { componentType: "StatCard", title: "Tasks · Overdue", props: { extractor: "tasks.overdue" } },
      { componentType: "StatCard", title: "Documents · Pending", props: { extractor: "documents.pendingApproval" } },
      {
        componentType: "TrendLineChart",
        title: "Open Items Over Time",
        props: {
          series: [
            { key: "risks_open", label: "Risks · Open", extractor: "risks.byStatus.Open", color: "#ef4444" },
            { key: "tasks_overdue", label: "Tasks · Overdue", extractor: "tasks.overdue", color: "#f97316" },
          ],
        },
      },
    ],
  },
  {
    id: "tpl_status_breakdowns",
    label: "Status Breakdowns",
    icon: "🍩",
    description: "Side-by-side status donuts from risk, audit, tasks and DPIA",
    panels: [
      { componentType: "DonutStatusChart", title: "Risks · By Status", props: { extractor: "risks.byStatus" } },
      { componentType: "DonutStatusChart", title: "Audit · By Status", props: { extractor: "audit.byStatus" } },
      { componentType: "DonutStatusChart", title: "Tasks · By Status", props: { extractor: "tasks.byStatus" } },
      { componentType: "DonutStatusChart", title: "DPIA · By Status", props: { extractor: "dpia.byStatus" } },
    ],
  },
  {
    id: "tpl_trend_watch",
    label: "Trend Watch",
    icon: "📈",
    description: "Multi-module trend line plus the totals driving it",
    panels: [
      {
        componentType: "TrendLineChart",
        title: "All Modules Trend",
        props: {
          series: [
            { key: "risks", label: "Risks", extractor: "risks.total", color: "#ef4444" },
            { key: "audits", label: "Audits", extractor: "audit.total", color: "#f59e0b" },
            { key: "tasks", label: "Tasks", extractor: "tasks.total", color: "#8b5cf6" },
            { key: "dpias", label: "DPIAs", extractor: "dpia.total", color: "#3b82f6" },
          ],
        },
      },
      { componentType: "StatCard", title: "Risks · Total", props: { extractor: "risks.total" } },
      { componentType: "StatCard", title: "Audit · Total", props: { extractor: "audit.total" } },
      { componentType: "StatCard", title: "Tasks · Total", props: { extractor: "tasks.total" } },
    ],
  },
  {
    id: "tpl_pipeline_progress",
    label: "Pipeline Progress",
    icon: "🤖",
    description: "DPIA completion and AIIA stage progress, with documents pending review",
    panels: [
      { componentType: "ScoreGauge", title: "DPIA · Avg Completion", props: { extractor: "dpia.avgCompletion" } },
      { componentType: "StatCard", title: "AIIA · S1 Completed", props: { extractor: "aiia.stage1Completed" } },
      { componentType: "StatCard", title: "AIIA · S2 Completed", props: { extractor: "aiia.stage2Completed" } },
      { componentType: "StatCard", title: "Documents · Approved", props: { extractor: "documents.approved" } },
      { componentType: "StatCard", title: "Documents · Pending", props: { extractor: "documents.pendingApproval" } },
    ],
  },
];

// Materialise a template into fresh panels with unique ids (no view wrapper)
function instantiateTemplatePanels(template) {
  const ts = Date.now();
  return template.panels.map((p, i) => ({
    id: `custom_panel_${ts}_${i}`,
    componentType: p.componentType,
    title: p.title,
    props: p.props,
  }));
}

// ─── sub-components ───────────────────────────────────────────────────────────
function Label({ children, hint }) {
  return (
    <div className="mb-1.5">
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
        {children}
      </span>
      {hint && (
        <span className="ml-2 text-[11px] text-slate-400 normal-case font-normal tracking-normal">
          {hint}
        </span>
      )}
    </div>
  );
}

function Steps({ current, total }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300
            ${i < current ? "bg-indigo-500 w-4" : i === current ? "bg-indigo-400 w-6" : "bg-slate-200 w-4"}`}
        />
      ))}
    </div>
  );
}

function ExtractorSelect({
  value,
  onChange,
  placeholder = "Select a data field…",
  scalarOnly = false,
}) {
  const filtered = scalarOnly
    ? AVAILABLE_EXTRACTORS.filter((e) => !MAP_EXTRACTORS.has(e.extractor))
    : AVAILABLE_EXTRACTORS;

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
      className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-sm
        text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300
        focus:border-indigo-400 transition-all cursor-pointer appearance-none
        bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 fill%3D%22none%22 viewBox%3D%220 0 20 20%22%3E%3Cpath stroke%3D%22%236b7280%22 stroke-linecap%3D%22round%22 stroke-linejoin%3D%22round%22 stroke-width%3D%221.5%22 d%3D%22m6 8 4 4 4-4%22%2F%3E%3C%2Fsvg%3E')]
        bg-[position:right_0.5rem_center] bg-[size:1.25rem] pr-8"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {Object.entries(groups).map(([mod, items]) => (
        <optgroup key={mod} label={`── ${mod}`}>
          {items.map((e) => (
            <option key={e.extractor} value={e.extractor}>
              {e.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function SeriesRow({ series, index, onChange, onRemove, canRemove }) {
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
          className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs
            focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
        <div className="relative flex items-center gap-1">
          <div
            className="w-6 h-6 rounded-md border-2 border-white shadow-sm cursor-pointer"
            style={{ backgroundColor: series.color }}
          />
          <input
            type="color"
            value={series.color}
            onChange={(e) => onChange(index, "color", e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(index)}
            className="w-6 h-6 rounded-full bg-rose-100 text-rose-500 hover:bg-rose-200
              flex items-center justify-center text-sm font-bold transition-colors"
          >
            ×
          </button>
        )}
      </div>
      <ExtractorSelect
        value={series.extractor}
        onChange={(v) => {
          onChange(index, "extractor", v);
          if (!series.key || series.key.startsWith("series"))
            onChange(index, "key", v.replace(/\./g, "_"));
          // Auto-set label from the KPI display name unless user already customised it
          const defaultLabel = `Series ${index + 1}`;
          if (!series.label || series.label === defaultLabel || series.label === series.extractor) {
            const found = AVAILABLE_EXTRACTORS.find((e) => e.extractor === v);
            if (found) onChange(index, "label", found.label);
          }
        }}
        placeholder="Select data field for this series…"
      />
    </motion.div>
  );
}

function ReviewRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-4">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">
        {label}
      </span>
      <span
        className={`text-xs text-slate-700 text-right ${mono ? "font-mono" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── main modal ───────────────────────────────────────────────────────────────
export default function CustomDashboardModal({
  editingPanel = null,
  onClose,
  onSave,
  onAppendTemplate,
}) {
  const isEdit = !!editingPanel;
  const ep = editingPanel?.panel ?? null;

  // step -1 = template gallery (skipped when editing)
  // step 0 = chart type, 1 = data, 2 = review
  // when editing, skip gallery and start at step 0
  const [step, setStep] = useState(isEdit ? 0 : -1);

  // step 0 — title is auto-derived from the first selected KPI label; no user input
  const [chartType, setChart] = useState(ep?.componentType ?? "");

  // step 1 — pre-fill from existing panel props
  const [series, setSeries] = useState(() => {
    if (ep?.props?.series?.length) return ep.props.series;
    return [
      {
        key: "series1",
        label: "Series 1",
        extractor: "",
        color: SERIES_COLORS[0],
      },
    ];
  });
  const [singleExtractor, setSingleExtractor] = useState(
    ep?.props?.extractor ?? "",
  );

  const isTrend = TREND_TYPES.has(chartType);
  const isDonut = chartType === "DonutStatusChart";
  const isSingle = chartType === "StatCard";

  const addSeries = () =>
    setSeries((prev) => [
      ...prev,
      {
        key: `series${prev.length + 1}`,
        label: `Series ${prev.length + 1}`,
        extractor: "",
        color: SERIES_COLORS[prev.length % SERIES_COLORS.length],
      },
    ]);

  const updateSeries = (i, field, value) =>
    setSeries((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    );
  const removeSeries = (i) =>
    setSeries((prev) => prev.filter((_, idx) => idx !== i));

  // ── step validation ───────────────────────────────────────────────────────
  const step0Valid = chartType !== "";
  const step1Valid = isTrend
    ? series.some((s) => s.extractor)
    : singleExtractor !== "";

  const totalSteps = 3;

  const handleSave = () => {
    const panelId = isEdit ? ep.id : `custom_panel_${Date.now()}`;
    // Derive title: first series label (trend) or extractor label (single/donut)
    const derivedTitle = isTrend
      ? (series.find((s) => s.extractor)?.label ?? chartType)
      : (AVAILABLE_EXTRACTORS.find((e) => e.extractor === singleExtractor)?.label ?? singleExtractor);
    const panel = {
      id: panelId,
      componentType: chartType,
      title: derivedTitle,
      props: isTrend
        ? { series: series.filter((s) => s.extractor && s.key) }
        : { extractor: singleExtractor },
    };
    onSave({
      panel,
      isEdit,
      originalPanelId: ep?.id,
    });
    onClose();
  };

  const handleSelectTemplate = (template) => {
    const panels = instantiateTemplatePanels(template);
    onAppendTemplate?.(panels);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
      bg-black/40 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {isEdit ? "Edit Panel" : "Custom Panel"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {step === -1 && "Start from a template or build your own"}
                {step === 0 && "Pick a chart type"}
                {step === 1 && "Choose the data fields to display"}
                {step === 2 && "Review and add to your dashboard"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-slate-500 text-2xl leading-none mt-0.5"
            >
              ×
            </button>
          </div>
          {step >= 0 && <Steps current={step} total={totalSteps} />}
        </div>

        {/* body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-5">
          <AnimatePresence mode="wait">
            {/* STEP -1 — template gallery */}
            {step === -1 && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="space-y-2"
              >
                <p className="text-[11px] text-slate-400 mb-1">
                  Templates add their tiles to your dashboard — pick as many as you like to build a mixed view.
                </p>
                {PANEL_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className="w-full flex items-start gap-3 px-3.5 py-3 rounded-xl border-2 border-slate-150
                      bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
                  >
                    <span className="text-xl leading-none mt-0.5">{tpl.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700">{tpl.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{tpl.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {tpl.panels.length} panel{tpl.panels.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setStep(0)}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200
                    text-xs font-semibold text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50
                    transition-all mt-1"
                >
                  + Build a custom panel instead
                </button>
              </motion.div>
            )}

            {/* STEP 0 — chart type */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <div>
                  <Label>Chart type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_COMPONENTS.map((c) => (
                      <button
                        key={c.type}
                        onClick={() => setChart(c.type)}
                        className={`rounded-xl border-2 p-3 text-left transition-all
                          ${
                            chartType === c.type
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-slate-150 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/40"
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-lg">{c.icon}</span>
                          <span
                            className={`text-xs font-semibold ${chartType === c.type ? "text-indigo-700" : "text-slate-700"}`}
                          >
                            {c.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight pl-7">
                          {c.hint}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 1 — data */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {isTrend && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label hint="each series = one line/bar">
                        Data Series
                      </Label>
                      <button
                        onClick={addSeries}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span className="text-base leading-none">+</span> Add
                        Series
                      </button>
                    </div>
                    <AnimatePresence>
                      {series.map((s, i) => (
                        <div key={i} className="mb-2">
                          <SeriesRow
                            series={s}
                            index={i}
                            onChange={updateSeries}
                            onRemove={removeSeries}
                            canRemove={series.length > 1}
                          />
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                {(isSingle || isDonut) && (
                  <div>
                    <Label
                      hint={
                        isDonut
                          ? "object map like risks.byStatus"
                          : "scalar e.g. risks.total"
                      }
                    >
                      Data field
                    </Label>
                    <ExtractorSelect
                      value={singleExtractor}
                      onChange={setSingleExtractor}
                      scalarOnly={isSingle}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2 — review */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <div className="rounded-xl bg-slate-50 border border-slate-100 divide-y divide-slate-100">
                  <ReviewRow label="Chart type" value={chartType} />
                  {isTrend ? (
                    <div className="px-4 py-3">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Series
                      </p>
                      {series
                        .filter((s) => s.extractor)
                        .map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 mb-1.5"
                          >
                            <div
                              className="w-3 h-3 rounded-sm flex-shrink-0"
                              style={{ backgroundColor: s.color }}
                            />
                            <span className="text-xs font-medium text-slate-700">
                              {s.label}
                            </span>
                            <span className="text-xs text-slate-400 ml-auto font-mono">
                              {s.extractor}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <ReviewRow label="Extractor" value={singleExtractor} mono />
                  )}
                </div>
                <p className="text-xs text-slate-400 text-center">
                  This panel will be added to your dashboard.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              if (step === -1 || (step === 0 && isEdit)) onClose();
              else if (step === 0) setStep(-1);
              else setStep(step - 1);
            }}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium px-2 py-1"
          >
            {step === -1 || (isEdit && step === 0) ? "Cancel" : "← Back"}
          </button>
          {step === -1 ? null : step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 0 && !step0Valid) ||
                (step === 1 && !step1Valid)
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
              <span>✓</span> Add Component
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}