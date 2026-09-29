/**
 * ─────────────────────────────────────────────────────────────────────────────
 * WIDGET: ScoreGauge
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { memo } from "react";

const ScoreGauge = memo(function ScoreGauge({
  kpiConfig,
  resolvedData,
  loading,
}) {
  const { max = 10, unit = "" } = kpiConfig.props ?? {};
  const value = resolvedData?.value ?? 0;
  const pct = Math.min(100, (value / max) * 100);
  const color = pct < 40 ? "#10b981" : pct < 70 ? "#f59e0b" : "#ef4444";

  // SVG arc
  const R = 52;
  const circ = Math.PI * R; // half circle circumference
  const dash = (pct / 100) * circ;

  return (
    <div className="h-full bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl shadow-sm p-4 flex flex-col items-center justify-center gap-2">
      <p className="text-xs font-bold text-slate-600 uppercase tracking-wide self-start">
        {kpiConfig.title}
      </p>
      {loading ? (
        <div className="w-28 h-16 bg-slate-100 rounded animate-pulse" />
      ) : (
        <>
          <svg width="120" height="70" viewBox="0 0 120 70">
            {/* Background track */}
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Value arc */}
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{ transition: "stroke-dasharray 0.6s ease" }}
            />
            <text
              x="60"
              y="58"
              textAnchor="middle"
              fontSize="18"
              fontWeight="700"
              fill="#1e293b"
            >
              {Number(value).toFixed(unit === "%" ? 0 : 1)}
              {unit}
            </text>
          </svg>
          <div className="flex justify-between w-full px-2 text-[10px] text-slate-400 font-medium">
            <span>0</span>
            <span>
              {max}
              {unit}
            </span>
          </div>
        </>
      )}
    </div>
  );
});

export default ScoreGauge;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * WIDGET: DepartmentBreakdown
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const DepartmentBreakdown = memo(function DepartmentBreakdown({
  kpiConfig,
  resolvedData,
  loading,
}) {
  const { accent = "#6366f1" } = kpiConfig.props ?? {};
  const entries = resolvedData?.rows?.length
    ? resolvedData.rows
        .filter((r) => r.value > 0)
        .sort((a, b) => b.value - a.value)
        .map((r) => [r.department, r.value])
    : Object.entries(resolvedData?.map ?? {})
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a);

  const maxVal = entries[0]?.[1] ?? 1;

  return (
    <div className="h-full bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
      <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
        {kpiConfig.title}
      </p>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No department data</p>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {entries.map(([dept, val]) => (
            <div key={dept}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-slate-600 font-medium truncate max-w-[140px]">
                  {dept}
                </span>
                <span className="font-bold text-slate-800">{val}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(val / maxVal) * 100}%`,
                    background: accent,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * WIDGET: TableWidget
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const TableWidget = memo(function TableWidget({
  kpiConfig,
  resolvedData,
  loading,
}) {
  const { columns = [] } = kpiConfig.props ?? {};

  // Dynamic mode: resolvedData.rows already contains full row objects
  // (e.g. from resolveFrameworkTable — { name: "ISO27001", applicableControls: 122, ... }).
  // Static mode (unchanged): build {department, value} rows from resolvedData.map.
  const dynamicRows = resolvedData?.rows;
  const rows = Array.isArray(dynamicRows) && dynamicRows.length > 0
    ? dynamicRows
    : Object.entries(resolvedData?.map ?? {})
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ department: k, value: v }))
        .sort((a, b) => b.value - a.value);

  // If no explicit columns were configured and we're in dynamic mode, derive
  // columns from whatever keys are present on the first row — this is what
  // makes the table adapt automatically to however many metrics/frameworks
  // exist in the live payload, with no hardcoded list anywhere.
  const effectiveColumns = columns.length > 0
    ? columns
    : (rows[0]
        ? Object.keys(rows[0]).map((key) => ({
            key,
            label: key === "name" ? "Framework" : key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
            align: key === "name" ? "left" : "right",
          }))
        : []);

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
      <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
        {kpiConfig.title}
      </p>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              {effectiveColumns.map((col) => (
                <th
                  key={col.key}
                  className={`pb-2 font-semibold text-slate-500 uppercase tracking-wide ${col.align === "right" ? "text-right" : "text-left"}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
              >
                {effectiveColumns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-2 text-slate-700 ${col.align === "right" ? "text-right font-bold" : ""}`}
                  >
                    {col.key.toLowerCase().includes("percentage") && typeof row[col.key] === "number"
                      ? `${row[col.key].toFixed(1)}%`
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={effectiveColumns.length}
                  className="py-4 text-center text-slate-400 italic"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
});