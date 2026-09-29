/**
 * ─────────────────────────────────────────────────────────────────────────────
 * KPI WIDGET REGISTRY  (v2 — adds TargetMeter, uses updated TrendLineChart)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { lazy } from "react";

export const KPI_REGISTRY = {
  StatCard:            lazy(() => import("./StatCard")),
  TrendLineChart:      lazy(() => import("./TrendLineChart")),   // v2 — benchmarks
  TrendAreaChart:      lazy(() => import("./TrendAreaChart")),
  TrendBarChart:       lazy(() => import("./TrendBarChart")),
  DonutStatusChart:    lazy(() => import("./DonutStatusChart")),
  ScoreGauge:          lazy(() => import("./ScoreGauge")),
  TargetMeter:         lazy(() => import("./TargetMeter")),       // NEW

  DepartmentBreakdown: lazy(() =>
    import("./ScoreGauge").then((m) => ({ default: m.DepartmentBreakdown }))
  ),
  TableWidget: lazy(() =>
    import("./ScoreGauge").then((m) => ({ default: m.TableWidget }))
  ),
};

export function resolveComponent(componentType) {
  const Component = KPI_REGISTRY[componentType];
  if (!Component) {
    console.warn(`[KPI Registry] Unknown componentType: "${componentType}". Rendering fallback.`);
    return UnknownWidget;
  }
  return Component;
}

function UnknownWidget({ kpiConfig }) {
  return (
    <div className="h-full flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Unknown Widget</p>
        <code className="text-[10px] text-rose-500 mt-1 block">{kpiConfig?.componentType}</code>
      </div>
    </div>
  );
}