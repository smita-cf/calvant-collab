/**
 * ─────────────────────────────────────────────────────────────────────────────
 * WIDGET: DonutStatusChart  (v2 — opts into shell title)
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a donut chart from either:
 *   resolvedData.map    – { key: value } object (from extractor)
 *   resolvedData.slices – [{ name, value }]      (from staticSlices)
 *
 * Passes showTitle to ChartShell so the module name (e.g. "Risks · By Status")
 * renders top-left — this is the ONLY chart type that opts in. Other chart
 * widgets (TrendLineChart, TrendBarChart, etc.) should NOT pass showTitle.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { memo, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartShell, PieTooltip, EmptyChart, PIE_PALETTE } from "./ChartShell";

const DonutStatusChart = memo(function DonutStatusChart({ kpiConfig, resolvedData, loading }) {
  const slices = useMemo(() => {
    if (resolvedData?.slices?.length) return resolvedData.slices;
    if (resolvedData?.map) {
      return Object.entries(resolvedData.map)
        .map(([name, value]) => ({ name, value }))
        .filter((s) => s.value > 0);
    }
    return [];
  }, [resolvedData]);

  return (
    <ChartShell title={kpiConfig.title} showTitle loading={loading} height={190}>
      {slices.length === 0 ? <EmptyChart message="No status breakdown available" /> : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={slices} dataKey="value" nameKey="name"
              cx="50%" cy="50%" innerRadius={42} outerRadius={72}
              paddingAngle={3} stroke="white" strokeWidth={2}>
              {slices.map((_, i) => (
                <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, color: "#64748b" }} iconType="circle" iconSize={7} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  );
});

export default DonutStatusChart;