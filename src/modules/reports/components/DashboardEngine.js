/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DashboardEngine.jsx  (v9 — KPI duration unified with chart groupBy)
 * ─────────────────────────────────────────────────────────────────────────────
 * v9 changes:
 *   - KPI panels (StatCard/ScoreGauge/TargetMeter) no longer use a separate
 *     getKpiResultsForWindow / DEFAULT_KPI_DURATION day-count concept. They
 *     now use the SAME granularity vocabulary as charts (Day/Week/Month/
 *     Year), stored as panel.duration.granularity, resolved via
 *     getResultsForWindow(granularity, 1, criteriaFilters) — i.e. "the
 *     latest single bucket of that granularity" (By Month = latest
 *     snapshot within the current month).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, {
  Suspense,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  LayoutDashboard, Pencil, Trash2, Copy, Maximize2, Printer,
  X as XIcon, GripVertical,
} from "lucide-react";
import { resolveComponent } from "./kpiRegistry";
import {
  resolveSingleValue,
  resolveTrendSeries,
  resolveMapValue,
  resolveTableRows,
  resolveFrameworkTable,
  resolveByPath,
  resolveByUserValues,
  isObjectMap,
  applyChartGrouping,
  applyMapGrouping,
} from "./dataExtractors";
import PanelBuilderModal from "./PanelBuilderModal";
import { resolveTargetUsers } from "./targetAudience";
import { resolveComparisonWindow, getDurationDaysForPanel, formatComparisonRange } from "./comparisonWindow";
import { COMPARE_TO_OPTIONS } from "./dashboardSchema";

const ResponsiveGridLayout = WidthProvider(Responsive);

const SINGLE_VIEW_ID    = "main";
const SINGLE_VIEW_LABEL = "Dashboard";

// ─── grid constants ───────────────────────────────────────────────────────────
const GRID_COLS    = { lg: 12, md: 12, sm: 6, xs: 4 };
const GRID_BREAKS  = { lg: 1024, md: 768, sm: 480, xs: 0 };
const ROW_HEIGHT   = 80;
const DEFAULT_W    = 3; 
const DEFAULT_H    = 3; 
const MAX_PANELS_PER_VIEW = 10;
const MIN_W = 2;
const MIN_H = 3;

const CHART_TYPES = new Set([
  "TrendLineChart", "TrendAreaChart", "TrendBarChart", "DonutStatusChart",
]);

const KPI_TYPES = new Set(["StatCard", "ScoreGauge", "TargetMeter"]);

const TREND_COMPONENT_TYPES = new Set(["TrendLineChart", "TrendAreaChart", "TrendBarChart"]);
function panelSignature(panel) {
  const props = panel.props ?? {};
  if (Array.isArray(props.series) && props.series.length) {
    const extractors = props.series.map((s) => s.extractor).filter(Boolean).sort().join("|");
    return `${panel.componentType}::${extractors}`;
  }
  return `${panel.componentType}::${props.extractor ?? ""}`;
}

function minSizeFor(componentType) {
  if (CHART_TYPES.has(componentType)) return { minW: 4, minH: 4 };
  if (componentType === "TableWidget") return { minW: 4, minH: 4 };
  return { minW: MIN_W, minH: MIN_H };
}

function clampLayout({ x, y, w, h }, componentType) {
  const { minW, minH } = minSizeFor(componentType);
  const safeW = Math.max(Number(w) || DEFAULT_W, minW);
  const safeH = Math.max(Number(h) || DEFAULT_H, minH);
  return {
    x: Math.max(Number(x) || 0, 0),
    y: Math.max(Number(y) || 0, 0),
    w: safeW,
    h: safeH,
  };
}
const FOOTPRINTS = {
  StatCard: { w: 2, h: 2 },
  ScoreGauge: { w: 2, h: 2 },
  TargetMeter: { w: 2, h: 2 },
  default: { w: 3, h: 3 }
};

function ensureLayout(panel, fallbackIndex = 0) {
  const footprint = FOOTPRINTS[panel.componentType] || FOOTPRINTS.default;
  // Only fall back to a fresh default position when the panel has no
  // stored layout yet. The old check (`w !== 3`) treated any panel
  // whose stored width happened to be 3 as "unmigrated," discarding a
  // just-computed x/y on the very next render — if that discarded
  // position was what kept two panels out of the same column, the
  // "needs repair" check below tripped again, causing an infinite
  // pushViewUpdate → PUT → re-render → repair loop (the runaway
  // `views?organization=...` requests in the Network tab).
  if (panel.layout && Number.isFinite(panel.layout.w) && Number.isFinite(panel.layout.h)) {
    return clampLayout(panel.layout, panel.componentType);
  }
  const { minW, minH } = minSizeFor(panel.componentType);
  const w = Math.max(footprint.w, minW);
  const h = Math.max(footprint.h, minH);

  const perRow = Math.floor(GRID_COLS.lg / w) || 1;
  const x = (fallbackIndex % perRow) * w;
  const y = Math.floor(fallbackIndex / perRow) * h;

  return clampLayout({ x, y, w, h }, panel.componentType);
}

function findOpenSlot(layouts, w = DEFAULT_W, h = DEFAULT_H) {
  const cols = GRID_COLS.lg;
  const occupied = layouts.map((l) => ({ x: l.x, y: l.y, w: l.w, h: l.h }));
  const maxY = occupied.reduce((m, l) => Math.max(m, l.y + l.h), 0);
  for (let y = 0; y <= maxY + h; y++) {
    for (let x = 0; x <= cols - w; x++) {
      const collides = occupied.some(
        (l) => x < l.x + l.w && x + w > l.x && y < l.y + l.h && y + h > l.y
      );
      if (!collides) return { x, y, w, h };
    }
  }
  return { x: 0, y: maxY, w, h };
}

// ─── data resolution ──────────────────────────────────────────────────────────
function resolveKpiData(kpiConfig, result) {
  const { componentType, props = {} } = kpiConfig;
  const grouping = props.grouping ?? {}; // { sortBy, maxGrouping } — Chart "More Options"
  switch (componentType) {
    case "StatCard":
    case "ScoreGauge":
      return resolveSingleValue(result, props.extractor ?? kpiConfig.extractor ?? "");
    case "TargetMeter": {
      const extractor = props.extractor ?? kpiConfig.extractor ?? "";
      const base = resolveSingleValue(result, extractor);
      const userIds = props.targetFor?.userIds ?? [];
      if (!userIds.length) return base;
      const byUser = resolveByUserValues(result, extractor, userIds);
      // byUser is null when data.tasks.byEmployee isn't present at all (e.g.
      // a non-task data source, or backend not yet updated) — in that case we
      // fall through to the old shared-value placeholder behaviour rather
      // than attaching an empty object that would look like "real but empty".
      return byUser ? { ...base, byUser } : base;
    }
    case "TrendLineChart":
    case "TrendAreaChart":
    case "TrendBarChart": {
      const resolved = resolveTrendSeries(result, props.series ?? [], props.labelExtractor);
      if (!grouping.sortBy && !grouping.maxGrouping) return resolved;
      const primaryKey = resolved.expandedSeries?.[0]?.key;
      return { ...resolved, points: applyChartGrouping(resolved.points, { ...grouping, primaryKey }) };
    }
    case "DonutStatusChart":
    case "DepartmentBreakdown": {
      const extractor = props.extractor ?? kpiConfig.extractor ?? "";
      if (props.staticSlices) return { slices: props.staticSlices };
      const resolved = resolveMapValue(result, extractor);
      if (!resolved.slices) return resolved;
      return { ...resolved, slices: applyMapGrouping(resolved.slices, grouping) };
    }
    case "TableWidget": {
      const extractor = props.extractor ?? kpiConfig.extractor ?? "";
      const raw = resolveByPath(result?.data, extractor);
      if (isObjectMap(raw)) {
        return resolveFrameworkTable(result, extractor);
      }
      return resolveTableRows(result, extractor);
    }
    default:
      return {};
  }
}

// ─── KpiWrapper ───────────────────────────────────────────────────────────────
const KpiWrapper = memo(function KpiWrapper({ kpiConfig, results, comparisonResults, comparisonWindow, loading }) {
  const Component = useMemo(() => resolveComponent(kpiConfig.componentType), [kpiConfig.componentType]);

  const result = useMemo(() => {
    if (!results?.length) return null;
    const reportId = kpiConfig.reportId;
    if (!reportId) return results[0] ?? null;
    return results.find((r) => r?.reportId === reportId) ?? results[0] ?? null;
  }, [results, kpiConfig.reportId]);

  const compResult = useMemo(() => comparisonResults?.[0] ?? null, [comparisonResults]);

  const resolvedDataBase = useMemo(() => {
    if (!result) return null;
    try { return resolveKpiData(kpiConfig, result); } catch { return null; }
  }, [result, kpiConfig]);

  const comparisonData = useMemo(() => {
    if (!compResult) return null;
    try { return resolveKpiData(kpiConfig, compResult); } catch { return null; }
  }, [compResult, kpiConfig]);

  // Resolve targetFor user IDs → display names for Target Meter panels.
  // resolveKpiData is synchronous and can't make a network call, so this
  // runs separately and merges the names into resolvedData once available.
  const userIds = kpiConfig.componentType === "TargetMeter"
    ? kpiConfig.props?.targetFor?.userIds ?? []
    : [];
  const userIdsKey = userIds.join(",");
  const [userLabels, setUserLabels] = useState({});

  useEffect(() => {
    if (!userIds.length) { setUserLabels({}); return; }
    let cancelled = false;
    resolveTargetUsers(userIds)
      .then((rows) => {
        if (cancelled) return;
        const map = {};
        rows.forEach((u) => { map[u.id] = u.name ?? u.email ?? u.id; });
        setUserLabels(map);
      })
      .catch(() => { if (!cancelled) setUserLabels({}); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIdsKey]);

  const resolvedData = useMemo(() => {
    if (!resolvedDataBase) return resolvedDataBase;
    return userIds.length ? { ...resolvedDataBase, userLabels } : resolvedDataBase;
  }, [resolvedDataBase, userLabels, userIdsKey]);

  return (
    <Suspense fallback={<SkeletonCard />}>
      <Component
        kpiConfig={kpiConfig}
        resolvedData={resolvedData}
        comparisonData={comparisonData}
        comparisonWindow={comparisonWindow}
        loading={loading || !result}
      />
    </Suspense>
  );
});

// ─── SkeletonCard ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="h-full rounded-2xl bg-slate-50 animate-pulse flex flex-col gap-3 p-5">
      <div className="h-3 w-1/3 bg-slate-200 rounded-full" />
      <div className="flex-1 bg-slate-100 rounded-xl" />
    </div>
  );
}

// ─── Fullscreen overlay ───────────────────────────────────────────────────────
function FullscreenOverlay({ panel, results, comparisonResults, comparisonWindow, loading, onClose }) {
  if (typeof document === "undefined") return null;
  
  // We add a dedicated container class to ensure it ignores parent styles
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col"
        style={{ height: "85vh" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <XIcon size={18} className="text-slate-500" />
        </button>
        
        {/* Force flex-1 here to ensure content expands to fill the modal */}
        <div className="flex-1 p-8 overflow-auto">
          <KpiWrapper
            kpiConfig={panel}
            results={results}
            comparisonResults={comparisonResults}
            comparisonWindow={comparisonWindow}
            loading={loading}
          />
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ─── Panel card ───────────────────────────────────────────────────────────────
const PanelCard = memo(function PanelCard({
  panel, results, comparisonResults, comparisonWindow, loading,
  onEdit, onDelete, onClone, justAdded,
  isNew, onHover
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const printRef = useRef(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank", "width=800,height=600");
    w.document.write(`
      <html><head><title>CalVant Panel — ${panel.title}</title>
      <link rel="stylesheet" href="${window.location.origin}/index.css">
      </head><body style="padding:32px;font-family:Segoe UI,sans-serif">
      <h3 style="color:#475569;font-size:13px;margin-bottom:16px">${panel.title}</h3>
      ${printRef.current.innerHTML}
      </body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
  };
  const isSmall = panel.layout?.w < 3;
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const confirmTimeoutRef = useRef(null);

  useEffect(() => () => { if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current); }, []);

  const handleDeleteClick = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      confirmTimeoutRef.current = setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
    if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    setConfirmingDelete(false);
    onDelete();
  };

  return (
    <>
      <div 
          onMouseEnter={onHover}
          className={`relative h-full w-full rounded-2xl bg-white shadow-sm border transition-shadow overflow-hidden group ${
            justAdded ? "border-indigo-400 ring-2 ring-indigo-200" : "border-slate-100"
          } ${isSmall ? "p-3" : "p-5"}`} // <--- Apply the padding class directly here
        >
        {/* Persistent Notification Dot */}
        {isNew && (
          <div 
            className="absolute top-3 right-3 w-3 h-3 bg-indigo-500 rounded-full shadow border-2 border-white z-20 group-hover:opacity-0 transition-opacity duration-200"
            title="New Panel"
          />
        )}

        {/* Drag handle */}
        <div
          className="drag-handle absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100
            transition-opacity cursor-grab active:cursor-grabbing p-1 rounded-lg
            text-slate-300 hover:text-slate-500 hover:bg-slate-50"
        >
          <GripVertical size={14} />
        </div>

        {/* Action bar */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm px-1 py-0.5">
          <ActionBtn icon={Pencil}    title="Edit"       onClick={onEdit}                color="indigo" />
          <ActionBtn icon={Copy}      title="Clone"      onClick={onClone}               color="amber"  />
          <ActionBtn icon={Maximize2} title="Fullscreen" onClick={() => setFullscreen(true)} color="sky" />
          <ActionBtn icon={Printer}   title="Print"      onClick={handlePrint}           color="slate"  />
          <div className="w-px h-4 bg-slate-200 mx-0.5" />
          {confirmingDelete ? (
            <button
              onClick={handleDeleteClick}
              title="Click again to confirm delete"
              className="px-1.5 h-6 rounded-lg flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 animate-pulse"
            >
              <Trash2 size={11} /> Sure?
            </button>
          ) : (
            <ActionBtn icon={Trash2} title="Delete" onClick={handleDeleteClick} color="rose" />
          )}
        </div>

        {/* In PanelCard, wrap the KpiWrapper in a div that strictly fills the container */}
        <div ref={printRef} className="h-full w-full overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0"> {/* min-h-0 is crucial for flex charts to shrink */}
            <KpiWrapper
              kpiConfig={panel}
              results={results}
              comparisonResults={comparisonResults}
              comparisonWindow={comparisonWindow}
              loading={loading}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {fullscreen && (
          <FullscreenOverlay
            panel={panel}
            results={results}
            comparisonResults={comparisonResults}
            comparisonWindow={comparisonWindow}
            loading={loading}
            onClose={() => setFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
});

function ActionBtn({ icon: Icon, title, onClick, color }) {
  const colors = {
    indigo: "hover:bg-indigo-50 hover:text-indigo-600",
    amber:  "hover:bg-amber-50  hover:text-amber-600",
    sky:    "hover:bg-sky-50    hover:text-sky-600",
    slate:  "hover:bg-slate-100 hover:text-slate-700",
    rose:   "hover:bg-rose-50   hover:text-rose-600",
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors text-slate-400 ${colors[color] || ""}`}
    >
      <Icon size={11} />
    </button>
  );
}

// ─── EmptyCanvas ──────────────────────────────────────────────────────────────
function EmptyCanvas({ onAddPanel, onSuggestedDashboard }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center shadow-inner">
        <LayoutDashboard size={26} className="text-indigo-300" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-600 mb-1">No panels yet</p>
        <p className="text-xs text-slate-400 max-w-xs">
          Choose how you'd like to set up this dashboard.
        </p>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={() => onSuggestedDashboard()}
          className="flex flex-col items-center gap-2 px-6 py-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50 hover:border-indigo-400 hover:bg-indigo-100 transition-all w-44"
        >
          <span className="text-2xl">✨</span>
          <span className="text-sm font-bold text-indigo-700">Suggested Dashboard</span>
          <span className="text-[11px] text-indigo-400 leading-snug">Pick a ready-made layout based on your goals</span>
        </button>

        <button
          onClick={() => onAddPanel()}
          className="flex flex-col items-center gap-2 px-6 py-5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-white transition-all w-44"
        >
          <span className="text-2xl">🎛️</span>
          <span className="text-sm font-bold text-slate-700">Customized Components</span>
          <span className="text-[11px] text-slate-400 leading-snug">Add KPIs and charts exactly how you want</span>
        </button>
      </div>
    </div>
  );
}

// ─── Suggested Dashboard Modal ────────────────────────────────────────────────
export const SUGGESTED_TEMPLATES = [
  {
    id: "risk",
    label: "Risk Overview",
    icon: "🛡️",
    description: "High-level risk posture and departmental exposure.",
    panels: [
      { title: "Total Risks", componentType: "StatCard", extractor: "risks.total" },
      { title: "Risk Avg Score", componentType: "StatCard", extractor: "risks.avgScore" },
      { title: "Risks by Status", componentType: "DonutStatusChart", extractor: "risks.byStatus" },
      { title: "By Department", componentType: "DepartmentBreakdown", extractor: "risks.byDepartment" }
    ]
  },
  {
    id: "audit",
    label: "Audit Summary",
    icon: "📋",
    description: "Audit completion rates, findings, and status.",
    panels: [
      { title: "Total Audits", componentType: "StatCard", extractor: "audit.total" },
      { title: "Total Findings", componentType: "StatCard", extractor: "audit.totalFindings" },
      { title: "Audit Status", componentType: "DonutStatusChart", extractor: "audit.byStatus" }
    ]
  },
  {
    id: "compliance",
    label: "Compliance Tracker",
    icon: "✅",
    description: "Framework compliance progress and control status.",
    panels: [
      { title: "Compliance %", componentType: "StatCard", extractor: "compliance.compliancePercentage" },
      { title: "Applicable Controls", componentType: "StatCard", extractor: "compliance.applicableControls" },
      { title: "Framework Readiness", componentType: "TableWidget", extractor: "compliance.frameworkBreakdown" }
    ]
  },
  {
    id: "tasks",
    label: "Task Dashboard",
    icon: "📌",
    description: "Task completion, overdue items, and workload.",
    panels: [
      { title: "Total Tasks", componentType: "StatCard", extractor: "tasks.total" },
      { title: "Overdue Tasks", componentType: "StatCard", extractor: "tasks.overdue" },
      { title: "Tasks by Status", componentType: "DonutStatusChart", extractor: "tasks.byStatus" }
    ]
  },
  {
    id: "dpo",
    label: "Privacy & DPIA",
    icon: "🔒",
    description: "DPIA status and privacy metrics.",
    panels: [
      { title: "Total DPIAs", componentType: "StatCard", extractor: "dpia.total" },
      { title: "Avg Completion", componentType: "ScoreGauge", extractor: "dpia.avgCompletion" },
      { title: "DPIA Status", componentType: "DonutStatusChart", extractor: "dpia.byStatus" }
    ]
  },
  {
    id: "ai",
    label: "AI Governance",
    icon: "🤖",
    description: "AI impact assessment and pipeline tracking.",
    panels: [
      { title: "S1 Total", componentType: "StatCard", extractor: "aiia.stage1Total" },
      { title: "S1 Completed", componentType: "StatCard", extractor: "aiia.stage1Completed" },
      { title: "S2 Total", componentType: "StatCard", extractor: "aiia.stage2Total" },
      { title: "AIIA Pipeline", componentType: "TrendLineChart", extractor: "aiia.stage1Total" }
    ]
  }
];

function SuggestedDashboardModal({ onClose, onAppendTemplate, userRole }) {
  const [selected, setSelected] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());

  // Logic to filter templates based on role
  const templates = useMemo(() => {
    const role = (userRole || "").toLowerCase();
    // Define role permissions
    const map = {
      root: ["risk", "audit", "compliance", "tasks", "ai"],
      ciso: ["risk", "compliance", "audit"],
      ai_officer: ["ai", "risk"],
      risk_manager: ["risk", "audit"],
      department_user: ["tasks"]
    };
    const allowedKeys = map[role] || ["tasks", "compliance"]; // Default fallback
    return SUGGESTED_TEMPLATES.filter(t => allowedKeys.includes(t.id));
  }, [userRole]);

  const handleSelect = (tpl) => {
    setSelected(tpl);
    setPreviewing(tpl);
  };

  const handleAdd = async () => {
    if (!selected || !onAppendTemplate) return;
    setAdding(true);

    // Map the template panels into the FULL panel shape PanelBuilderModal
    // expects, not just { title, componentType, props:{extractor} }.
    // Without these fields, editing a template-added panel later drops it
    // into PanelBuilderModal with an empty module / missing duration /
    // missing series, which fails validation or renders no data.
    const KPI_TYPES = new Set(["StatCard", "ScoreGauge", "TargetMeter"]);
    const TREND_TYPES = new Set(["TrendLineChart", "TrendBarChart"]);

    const panels = selected.panels.map((p) => {
      const id = `suggested_${selected.id}_${p.title.replace(/\s+/g, '_')}_${Date.now()}`;
      const module = p.extractor.split(".")[0];
      const isKpi = KPI_TYPES.has(p.componentType);
      const isTrend = TREND_TYPES.has(p.componentType);

      const props = isTrend
        ? { series: [{ key: "series1", label: p.title, extractor: p.extractor, color: "#6366f1" }] }
        : { extractor: p.extractor };

      return {
        id,
        title: p.title,
        componentType: p.componentType,
        module,
        ...(isTrend ? { groupBy: "day" } : {}),
        ...(isKpi ? { duration: { granularity: "day" } } : {}),
        props,
      };
    });

    onAppendTemplate(panels);
    setAddedIds(new Set(panels.map((p) => p.id)));
    setAdding(false);
    setTimeout(onClose, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 36, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">✨ Suggested Dashboards</h2>
            <p className="text-xs text-slate-400 mt-0.5">Pick a template to get started instantly.</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 p-1">
            <XIcon size={16} />
          </button>
        </div>

        <div className="flex" style={{ minHeight: 360 }}>
          <div className="w-56 border-r border-slate-100 p-3 flex flex-col gap-2 overflow-y-auto">
            {SUGGESTED_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleSelect(tpl)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  selected?.id === tpl.id
                    ? "bg-indigo-50 border border-indigo-200"
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <span className="text-xl">{tpl.icon}</span>
                <div>
                  <p className={`text-xs font-semibold ${selected?.id === tpl.id ? "text-indigo-700" : "text-slate-700"}`}>
                    {tpl.label}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{tpl.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex-1 p-5 flex flex-col gap-4">
            {!previewing ? (
              <div className="flex-1 flex items-center justify-center text-slate-300 text-sm">
                ← Select a template to preview
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-1">
                    {previewing.icon} {previewing.label}
                  </p>
                  <p className="text-xs text-slate-400">{previewing.description}</p>
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Panels that will be added
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {previewing.panels.map((panel, i) => (
                    <div
                      key={i}
                      className={`relative px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        addedIds.size > 0
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      {panel.title}
                      {addedIds.size > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center shadow">
                          !
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5">
            Cancel
          </button>
          <button
            disabled={!selected || adding}
            onClick={handleAdd}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm flex items-center gap-2"
          >
            {adding ? (
              <><RefreshCw size={13} className="animate-spin" /> Adding…</>
            ) : (
              <>✨ Add {selected?.panels.length ?? ""} Panels</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── DashboardEngine ──────────────────────────────────────────────────────────
export default function DashboardEngine({
  dashboardName,
  customViews = [],
  activeViewId,
  onCustomViewsChange,
  results,
  comparisonResults = [],
  getComparisonForWindow,
  getRiskComparisonForWindow,
  getAuditComparisonForWindow,
  getTaskComparisonForWindow,
  getResultsForWindow,
  getRiskPeriodSeries,
  getRiskSnapshot,
  riskDimensionOptions,
  getAuditPeriodSeries,
  getAuditSnapshot,
  auditDimensionOptions,
  getTaskPeriodSeries,
  getTaskSnapshot,
  taskDimensionOptions,
  dimensionOptions,
  loading,
  viewsLoading = false,
  error,
  userRole = "",
  orgId,
  newPanelIds = new Set(),
  onPanelSeen,
}) {
  const [showBuilder,  setShowBuilder]  = useState(false);
  const [showPanelLimitBanner, setShowPanelLimitBanner] = useState(false);
  const [showSuggestedModal, setShowSuggestedModal] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);
  const [isDragging,   setIsDragging]   = useState(false);
  const [justAddedId,  setJustAddedId]  = useState(null);

  const needsLayoutRepairRef = useRef(null);
  const view = customViews.find((v) => v.id === activeViewId) ?? customViews[0] ?? null;

  const pushViewUpdate = useCallback((updatedView) => {
    const exists = customViews.some((v) => v.id === updatedView.id);
    const nextViews = exists
      ? customViews.map((v) => (v.id === updatedView.id ? updatedView : v))
      : [...customViews, updatedView];
    onCustomViewsChange?.(nextViews);
  }, [customViews, onCustomViewsChange]);

  const panelsWithLayout = useMemo(() => {
    if (!view?.panels?.length) return [];
    const withLayout = view.panels.map((p, i) => ({ ...p, layout: ensureLayout(p, i) }));

    const distinctX = new Set(withLayout.map((p) => p.layout.x));
    const allSameColumn = withLayout.length > 1 && distinctX.size === 1;

    const hasOverlap = withLayout.some((p, i) =>
      withLayout.some((q, j) => i !== j &&
        p.layout.x < q.layout.x + q.layout.w && p.layout.x + p.layout.w > q.layout.x &&
        p.layout.y < q.layout.y + q.layout.h && p.layout.y + p.layout.h > q.layout.y
      )
    );

    if (!allSameColumn && !hasOverlap) return withLayout;

    const placed = [];
    for (const p of withLayout) {
      const occupied = placed.map((q) => ({ x: q.layout.x, y: q.layout.y, w: q.layout.w, h: q.layout.h }));
      const slot = findOpenSlot(occupied, p.layout.w, p.layout.h);
      placed.push({ ...p, layout: slot });
    }
    needsLayoutRepairRef.current = placed;
    return placed;
  }, [view]);

  const rglLayout = useMemo(
    () => panelsWithLayout.map((p) => {
      const { minW, minH } = minSizeFor(p.componentType);
      return { i: p.id, x: p.layout.x, y: p.layout.y, w: p.layout.w, h: p.layout.h, minW, minH };
    }),
    [panelsWithLayout]
  );

  // Resolved window + human-readable label per panel, purely for DISPLAY —
  // this is what lets a StatCard show "vs 23 Jun – 30 Jun" instead of an
  // unexplained "vs comparison" figure. Kept separate from
  // comparisonResultsByPanel (which does the actual data fetch) so it isn't
  // recomputed whenever the getter callbacks change identity.
  const comparisonWindowByPanel = useMemo(() => {
    const map = {};
    for (const p of panelsWithLayout) {
      if (!p.comparison?.enabled) continue;
      const { from, to } = resolveComparisonWindow(p.comparison, getDurationDaysForPanel(p));
      if (!from || !to) continue;
      const presetLabel = COMPARE_TO_OPTIONS.find((o) => o.key === p.comparison.compareTo)?.label ?? "Custom";
      map[p.id] = { from, to, presetLabel, rangeLabel: formatComparisonRange(from, to) };
    }
    return map;
  }, [panelsWithLayout]);

  const comparisonResultsByPanel = useMemo(() => {
    const map = {};
    for (const p of panelsWithLayout) {
      if (p.comparison?.enabled) {
        // Resolve the window HERE, on every render, against "today" — not
        // whatever was frozen into the panel at Save time. Relative presets
        // ("Previous Period" / "Previous Relative Period" / "Same Period
        // Last Year") are meant to roll forward every day; only "custom"
        // is a fixed range, and that case still reads directly from
        // p.comparison.from/to inside resolveComparisonWindow.
        const { from, to } = resolveComparisonWindow(p.comparison, getDurationDaysForPanel(p));
        if (!from || !to) { map[p.id] = comparisonResults; continue; }

        // Risks/audit/tasks are live-only modules — never in rawResults —
        // so their comparison window must be fetched via the module-specific
        // getters (own date field + own criteria shape), not the generic
        // report-snapshot getComparisonForWindow, which will always return
        // [] for these modules. Same dispatch pattern as resultsByPanel below.
        if (p.module === "risks") {
          map[p.id] = typeof getRiskComparisonForWindow === "function"
            ? getRiskComparisonForWindow(from, to, p.criteriaFilters)
            : [];
        } else if (p.module === "audit") {
          map[p.id] = typeof getAuditComparisonForWindow === "function"
            ? getAuditComparisonForWindow(from, to, p.criteriaFilters)
            : [];
        } else if (p.module === "tasks") {
          map[p.id] = typeof getTaskComparisonForWindow === "function"
            ? getTaskComparisonForWindow(from, to, p.criteriaFilters)
            : [];
        } else {
          map[p.id] = typeof getComparisonForWindow === "function"
            ? getComparisonForWindow(from, to)
            : [];
        }
      } else {
        map[p.id] = comparisonResults;
      }
    }
    return map;
  }, [
    panelsWithLayout,
    getComparisonForWindow,
    getRiskComparisonForWindow,
    getAuditComparisonForWindow,
    getTaskComparisonForWindow,
    comparisonResults,
  ]);

  // Per-panel results — ONE windowing concept for everything, driven by
  // getResultsForWindow(granularity, maxGrouping, criteriaFilters):
  //   - Charts/maps: granularity = panel.groupBy (day/week/month/year),
  //     maxGrouping = panel.props.grouping.maxGrouping (5..75 periods).
  //   - KPIs (StatCard/ScoreGauge/TargetMeter): granularity =
  //     panel.duration.granularity (day/week/month/year), maxGrouping = 1
  //     — i.e. "the latest single bucket of that granularity" (By Month =
  //     latest snapshot within the current month).
  const resultsByPanel = useMemo(() => {
    const map = {};
    for (const p of panelsWithLayout) {
      const isKpi = KPI_TYPES.has(p.componentType);
      const granularity = isKpi ? (p.duration?.granularity ?? "day") : (p.groupBy ?? "day");
      const maxGrouping = isKpi ? 1 : p.props?.grouping?.maxGrouping;

      const isTrendComponent = TREND_COMPONENT_TYPES.has(p.componentType);

      if (p.module === "risks") {
        if (isTrendComponent) {
          map[p.id] = typeof getRiskPeriodSeries === "function"
            ? getRiskPeriodSeries(granularity, maxGrouping, p.criteriaFilters)
            : [];
        } else if (isKpi) {
          // StatCard/ScoreGauge/TargetMeter: the "current value" must use the
          // SAME duration window as the Comparison Period (maxGrouping=1 →
          // the latest single bucket of panel.duration.granularity), or the
          // KPI ends up comparing an all-time total against a 1-day window
          // and produces a nonsensical delta (e.g. 56 vs 1 → "+5500%").
          map[p.id] = typeof getRiskPeriodSeries === "function"
            ? getRiskPeriodSeries(granularity, 1, p.criteriaFilters)
            : typeof getRiskSnapshot === "function" ? getRiskSnapshot(p.criteriaFilters) : [];
        } else {
          // Donut/Table/DepartmentBreakdown — all-time distribution snapshot.
          map[p.id] = typeof getRiskSnapshot === "function" ? getRiskSnapshot(p.criteriaFilters) : [];
        }
        continue;
      }

      if (p.module === "audit") {
        if (isTrendComponent) {
          map[p.id] = typeof getAuditPeriodSeries === "function"
            ? getAuditPeriodSeries(granularity, maxGrouping, p.criteriaFilters)
            : [];
        } else if (isKpi) {
          map[p.id] = typeof getAuditPeriodSeries === "function"
            ? getAuditPeriodSeries(granularity, 1, p.criteriaFilters)
            : typeof getAuditSnapshot === "function" ? getAuditSnapshot(p.criteriaFilters) : [];
        } else {
          map[p.id] = typeof getAuditSnapshot === "function" ? getAuditSnapshot(p.criteriaFilters) : [];
        }
        continue;
      }

      if (p.module === "tasks") {
        if (isTrendComponent) {
          map[p.id] = typeof getTaskPeriodSeries === "function"
            ? getTaskPeriodSeries(granularity, maxGrouping, p.criteriaFilters)
            : [];
        } else if (isKpi) {
          map[p.id] = typeof getTaskPeriodSeries === "function"
            ? getTaskPeriodSeries(granularity, 1, p.criteriaFilters)
            : typeof getTaskSnapshot === "function" ? getTaskSnapshot(p.criteriaFilters) : [];
        } else {
          map[p.id] = typeof getTaskSnapshot === "function" ? getTaskSnapshot(p.criteriaFilters) : [];
        }
        continue;
      }

      map[p.id] = typeof getResultsForWindow === "function"
        ? getResultsForWindow(granularity, maxGrouping, p.criteriaFilters)
        : results;
    }
    return map;
  }, [panelsWithLayout, getResultsForWindow, getRiskPeriodSeries, getRiskSnapshot, getAuditPeriodSeries, getAuditSnapshot, getTaskPeriodSeries, getTaskSnapshot, results]);
const lastRepairSignatureRef = useRef(null);

  // Reset the breaker whenever the active view changes, so switching
  // dashboards doesn't inherit a stale signature that blocks a
  // legitimate repair on a different view.
  useEffect(() => {
    lastRepairSignatureRef.current = null;
  }, [view?.id]);

  useEffect(() => {
    if (!needsLayoutRepairRef.current || !view) return;
    const repairedPanels = needsLayoutRepairRef.current;
    needsLayoutRepairRef.current = null;

    const signature = repairedPanels
      .map((p) => `${p.id}:${p.layout.x},${p.layout.y},${p.layout.w},${p.layout.h}`)
      .join("|");
    if (signature === lastRepairSignatureRef.current) {
      // Already pushed this exact layout — the detector is re-flagging
      // an already-repaired layout. Stop instead of re-issuing the same
      // PUT indefinitely.
      return;
    }
    lastRepairSignatureRef.current = signature;

    pushViewUpdate({ ...view, panels: repairedPanels.map(({ layout, ...rest }) => ({ ...rest, layout })) });
  }, [panelsWithLayout, view, pushViewUpdate]);

  const currentOccupiedLayout = useCallback(() => {
    if (!view?.panels?.length) return [];
    return view.panels.map((p, i) => {
      const l = ensureLayout(p, i);
      return { i: p.id, x: l.x, y: l.y, w: l.w, h: l.h };
    });
  }, [view]);

  const commitLayout = useCallback((layout) => {
    if (!view) return;
    const byId = Object.fromEntries(layout.map((l) => [l.i, l]));
    const updatedPanels = view.panels.map((p) => {
      const l = byId[p.id];
      if (!l) return p;
      return { ...p, layout: clampLayout({ x: l.x, y: l.y, w: l.w, h: l.h }, p.componentType) };
    });
    pushViewUpdate({ ...view, panels: updatedPanels });
  }, [view, pushViewUpdate]);

  const savePanel = useCallback(({ panel, isEdit, originalPanelId }) => {
    if (!isEdit && (view?.panels?.length ?? 0) >= MAX_PANELS_PER_VIEW) {
      setShowPanelLimitBanner(true);
      return;
    }

    let updatedView;
    if (view) {
      if (isEdit && originalPanelId) {
        updatedView = { ...view, panels: view.panels.map((p) => (p.id === originalPanelId ? { ...panel, layout: p.layout } : p)) };
      } else {
        const { minW, minH } = minSizeFor(panel.componentType);
        const slot = findOpenSlot(currentOccupiedLayout(), minW, minH);
        const newPanel = { ...panel, layout: slot };
        updatedView = { ...view, panels: [...view.panels, newPanel] };
        setJustAddedId(panel.id);
      }
    } else {
      // Use the new footprint logic instead of hardcoded DEFAULT_W/H
      const footprint = FOOTPRINTS[panel.componentType] || FOOTPRINTS.default;
      const slot = findOpenSlot(currentOccupiedLayout(), footprint.w, footprint.h);
      const newPanel = { ...panel, layout: slot };
      updatedView = { ...view, panels: [...view.panels, newPanel] };
      setJustAddedId(panel.id);
    }
    pushViewUpdate(updatedView);
  }, [view, currentOccupiedLayout, pushViewUpdate]);

  const appendTemplatePanels = useCallback((panels) => {
    const existingSignatures = new Set((view?.panels ?? []).map(panelSignature));
    const currentCount = view?.panels?.length ?? 0;
    const remaining = MAX_PANELS_PER_VIEW - currentCount;
    if (remaining <= 0) {
      setShowPanelLimitBanner(true);
      return { addedCount: 0, skippedCount: panels.length };
    }
    const panelsToAdd = panels.slice(0, remaining);
    const skippedByLimit = panels.length - panelsToAdd.length;
    const deduped = [];
    for (const p of panelsToAdd) {
      const sig = panelSignature(p);
      if (existingSignatures.has(sig)) continue;
      existingSignatures.add(sig);
      deduped.push(p);
    }
    const skippedCount = panels.length - deduped.length;

    if (deduped.length === 0) return { addedCount: 0, skippedCount };

    let runningLayout = currentOccupiedLayout();
    const placed = deduped.map((p) => {
      const { minW, minH } = minSizeFor(p.componentType);
      const slot = findOpenSlot(runningLayout, minW, minH);
      runningLayout = [...runningLayout, { i: p.id, ...slot }];
      return { ...p, layout: slot };
    });
    const updatedView = view
      ? { ...view, panels: [...view.panels, ...placed] }
      : { id: SINGLE_VIEW_ID, label: SINGLE_VIEW_LABEL, panels: placed };
    pushViewUpdate(updatedView);
    return { addedCount: placed.length, skippedCount: skippedCount + skippedByLimit };
  }, [view, currentOccupiedLayout, pushViewUpdate]);

  const deletePanel = useCallback((panelId) => {
    if (!view) return;
    pushViewUpdate({ ...view, panels: view.panels.filter((p) => p.id !== panelId) });
  }, [view, pushViewUpdate]);

  const clonePanel = useCallback((panel) => {
    if (!view) return;
    if ((view?.panels?.length ?? 0) >= MAX_PANELS_PER_VIEW) {
      setShowPanelLimitBanner(true);
      return;
    }
    const { minW, minH } = minSizeFor(panel.componentType);
    const slot = findOpenSlot(currentOccupiedLayout(), panel.layout?.w ?? minW, panel.layout?.h ?? minH);
    const cloned = { ...panel, id: `custom_panel_clone_${Date.now()}`, title: `${panel.title} (Copy)`, layout: slot };
    pushViewUpdate({ ...view, panels: [...view.panels, cloned] });
  }, [view, currentOccupiedLayout, pushViewUpdate]);

  useEffect(() => {
    if (!justAddedId) return;
    const t = setTimeout(() => setJustAddedId(null), 2200);
    return () => clearTimeout(t);
  }, [justAddedId]);

  if (error) {
    return (
      <div className="p-8 text-center text-rose-500 text-sm">
        Failed to load dashboard data: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        id="kpis-container"
        data-html2canvas-ignore="true"
        className="flex items-center justify-between"
      >
        <div>
          {dashboardName && (
            <h2 className="text-sm font-bold text-slate-700">{dashboardName}</h2>
          )}
          {panelsWithLayout.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              {panelsWithLayout.length}/{MAX_PANELS_PER_VIEW} panel{panelsWithLayout.length !== 1 ? "s" : ""}{" "}
              <span className="text-slate-300">· drag the grip to move · drag a corner to resize</span>
            </p>
          )}
        </div>
        {showPanelLimitBanner && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            <span>⚠ Maximum {MAX_PANELS_PER_VIEW} panels per view reached.</span>
            <button onClick={() => setShowPanelLimitBanner(false)} className="ml-2 text-amber-400 hover:text-amber-600">✕</button>
          </div>
        )}

          <button
            onClick={() => {
              if ((view?.panels?.length ?? 0) >= MAX_PANELS_PER_VIEW) {
                setShowPanelLimitBanner(true);
                return;
              }
              setEditingPanel(null);
              setShowBuilder(true);
            }}
            disabled={(view?.panels?.length ?? 0) >= MAX_PANELS_PER_VIEW}
            title={(view?.panels?.length ?? 0) >= MAX_PANELS_PER_VIEW ? `Maximum ${MAX_PANELS_PER_VIEW} panels reached` : "Add a new panel"}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white
              text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm
              disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
          <span className="text-base leading-none">＋</span>
          <span className="whitespace-nowrap">Add Component</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          id="charts-container"
          key={viewsLoading ? "views-loading" : "main"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {viewsLoading ? (
            <div className="mt-2 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 flex flex-col gap-3 animate-pulse">
                  <div className="h-3 w-1/3 bg-slate-100 rounded-full" />
                  <div className="h-32 bg-slate-50 rounded-xl" />
                </div>
              ))}
            </div>
          ) : !view || panelsWithLayout.length === 0 ? (
            <EmptyCanvas
              onAddPanel={() => { setEditingPanel(null); setShowBuilder(true); }}
              onSuggestedDashboard={() => setShowSuggestedModal(true)}
            />
          ) : (
            <div
              className={`relative mt-2 rounded-2xl overflow-hidden transition-colors ${
                isDragging ? "bg-grid-indicator" : ""
              }`}
            >
              <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: rglLayout, md: rglLayout, sm: rglLayout, xs: rglLayout }}
                breakpoints={GRID_BREAKS}
                cols={GRID_COLS}
                rowHeight={ROW_HEIGHT}
                margin={[16, 16]}
                draggableHandle=".drag-handle"
                resizeHandles={["se", "sw", "ne", "nw", "e", "w", "n", "s"]}
                onDragStart={() => setIsDragging(true)}
                onDragStop={(layout) => { setIsDragging(false); commitLayout(layout); }}
                onResizeStart={() => setIsDragging(true)}
                onResizeStop={(layout) => {
                  setIsDragging(false);
                  commitLayout(layout);
                }}
                compactType="vertical"
                preventCollision={true}
                isBounded={false}
              >
                {panelsWithLayout.map((panel) => (
                  <div key={panel.id}>
                    <PanelCard
                      panel={panel}
                      results={resultsByPanel[panel.id] ?? results}
                      comparisonResults={comparisonResultsByPanel[panel.id] ?? comparisonResults}
                      comparisonWindow={comparisonWindowByPanel[panel.id] ?? null}
                      loading={loading}
                      justAdded={justAddedId === panel.id}
                      isNew={newPanelIds?.has(panel.id)}
                      onHover={() => onPanelSeen?.(panel.id)}
                      onEdit={() => { setEditingPanel({ panel }); setShowBuilder(true); }}
                      onDelete={() => deletePanel(panel.id)}
                      onClone={() => clonePanel(panel)}
                    />
                  </div>
                ))}
              </ResponsiveGridLayout>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showBuilder && (
          <PanelBuilderModal
            editingPanel={editingPanel}
            existingPanels={view?.panels ?? []}
            dimensionOptions={dimensionOptions}
            riskDimensionOptions={riskDimensionOptions}
            auditDimensionOptions={auditDimensionOptions}
            taskDimensionOptions={taskDimensionOptions}
            orgId={orgId}
            onClose={() => { setShowBuilder(false); setEditingPanel(null); }}
            onSave={savePanel}
            onAppendTemplate={appendTemplatePanels}
            userRole={userRole}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSuggestedModal && (
          <SuggestedDashboardModal
            onAppendTemplate={appendTemplatePanels}
            onClose={() => setShowSuggestedModal(false)}
            userRole={userRole} // Ensure this is passed!
          />
        )}
      </AnimatePresence>

      <style>{`
        .bg-grid-indicator {
          background-image:
            linear-gradient(to right, #eef2ff 1px, transparent 1px),
            linear-gradient(to bottom, #eef2ff 1px, transparent 1px);
          background-size: calc((100% - 16px) / 12) ${ROW_HEIGHT}px;
          background-position: 8px 8px;
        }
        .react-grid-item.react-grid-placeholder {
          background: #6366f1 !important;
          opacity: 0.12 !important;
          border-radius: 16px;
        }
        .react-grid-item > .react-resizable-handle {
          opacity: 0;
          transition: opacity 0.15s;
        }
        .react-grid-item:hover > .react-resizable-handle {
          opacity: 1;
        }
        .react-grid-item.resizing {
          box-shadow: 0 0 0 2px #6366f1, 0 8px 24px rgba(99,102,241,0.18);
        }
        .react-grid-item.react-draggable-dragging {
          box-shadow: 0 12px 28px rgba(15,23,42,0.18);
          z-index: 30;
        }
      `}</style>
    </div>
  );
}