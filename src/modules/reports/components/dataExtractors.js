/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DATA EXTRACTORS  (v2 — dimension-aware)
 * ─────────────────────────────────────────────────────────────────────────────
 * All public API is unchanged. The dimension filter is applied transparently
 * inside resolveMapValue and resolveTrendSeries when a `filters` arg is passed.
 *
 * Real API shape (one result entry):
 *   result.data = {
 *     risks:     { total, avgScore, maxScore, byStatus:{…}, byDepartment:{…} }
 *     audit:     { total, totalFindings, byStatus, byDepartment }
 *     tasks:     { total, overdue, byStatus, byDepartment }
 *     dpia:      { total, avgCompletion, byStatus, byDepartment }
 *     documents: { total, approved, pendingApproval }
 *     aiia:      { stage1Total, stage1Draft, stage1Completed,
 *                  stage2Total, stage2Assigned, stage2Completed }
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── safeNum ──────────────────────────────────────────────────────────────────
function safeNum(v) {
  if (v == null) return 0;
  if (typeof v === "object" && "$numberLong" in v) return Number(v.$numberLong);
  return Number(v) || 0;
}

// ─── resolveByPath ────────────────────────────────────────────────────────────
export function resolveByPath(obj, path) {
  if (!path || obj == null) return undefined;
  const val = path.split(".").reduce((acc, key) => {
    if (acc == null) return undefined;
    return acc[key];
  }, obj);
  if (val != null && typeof val === "object" && "$numberLong" in val) {
    return Number(val.$numberLong);
  }
  return val;
}

// ─── resolveSingleValue ───────────────────────────────────────────────────────
export function resolveSingleValue(result, path) {
  const data = result?.data;
  if (!data || !path) return { value: null, delta: null };

  const raw = resolveByPath(data, path);
  if (raw == null) return { value: null, delta: null };

  if (typeof raw === "object" && !Array.isArray(raw) && "value" in raw) {
    return { value: safeNum(raw.value), delta: raw.delta ?? null };
  }

  return { value: typeof raw === "number" ? raw : safeNum(raw), delta: null };
}

// ─── resolveByUserValues ──────────────────────────────────────────────────────
// Powers Target Meter's "Multiple Bar" mode. Looks up the real per-user task
// breakdown at `data.tasks.byEmployee` (added by TaskDataProvider on the
// backend: { [employeeId]: { employeeName, total, done, overdue, inProgress } })
// and projects it onto the userIds selected in the panel builder.
//
// The metric to read per user is taken from the tail segment of the panel's
// existing `extractor` path so it stays in sync with whatever the org-wide
// single value is already pointing at — e.g. extractor "tasks.overdue" reads
// each user's `.overdue`, "tasks.total" reads `.total`, etc.
//
// Returns null (not an empty object) when there's no byEmployee data at all,
// so callers can tell "feature not available yet" apart from "available but
// this particular user has zero".  Returns { [userId]: number|null } otherwise
// — null for a specific id means that id has no matching record (e.g. the
// employeeId doesn't appear in any task), which the UI should treat as
// "unknown" rather than silently rendering 0.
export function resolveByUserValues(result, extractor, userIds) {
  if (!userIds?.length) return null;
  const byEmployee = result?.data?.tasks?.byEmployee;
  if (!byEmployee || typeof byEmployee !== "object") return null;

  const metric = (extractor ?? "").split(".").pop() || "total";
  const out = {};
  userIds.forEach((id) => {
    const stat = byEmployee[id];
    out[id] = stat && metric in stat ? safeNum(stat[metric]) : null;
  });
  return out;
}

// ─── resolveTrendSeries ───────────────────────────────────────────────────────
// durationField: optional key like "createdAt", "closedAt" etc. — the date
// field to use as the x-axis label. ReportResult stores *daily aggregate
// snapshots*, so per-entry the only available date is generatedAt; if a
// durationField is set, we look for it inside entry.data first (in case a
// future data shape includes it), then fall back to generatedAt.
export function resolveTrendSeries(result, seriesConfigs, _labelExtractor, durationField) {
  const series_ = result?._series;
  if (!series_?.length || !seriesConfigs?.length) return { points: [] };

  const expandedSeries = [];
  for (const s of seriesConfigs) {
    const extractor = s.extractor ?? s.key;
    const sampleVal = resolveByPath(
      series_[series_.length - 1]?.data,
      extractor
    );
    if (sampleVal && typeof sampleVal === "object" && !Array.isArray(sampleVal)) {
      Object.keys(sampleVal).forEach((dept, i) => {
        expandedSeries.push({
          key: `${extractor.replace(/\./g, "_")}_${dept.replace(/\s+/g, "_")}`,
          label: dept,
          extractor: `${extractor}.${dept}`,
          color: s.color,
          _autoColorIndex: i,
        });
      });
    } else {
      expandedSeries.push(s);
    }
  }

  const AUTO_COLORS = [
    "#6366f1","#ef4444","#10b981","#f59e0b","#3b82f6",
    "#a855f7","#06b6d4","#f97316","#84cc16","#ec4899",
  ];

  const points = series_.map((entry) => {
    // Prefer durationField from within entry.data (future per-record shape),
    // then from the entry itself (e.g. entry.closedAt), then generatedAt.
    // `_periodLabel` is set by useDashboardData's bucketByPeriod when a
    // week/month/year grouping was requested — use it as the x-axis label
    // in that case instead of always formatting a single day.
    const labelDate =
      (durationField && resolveByPath(entry.data, durationField)) ||
      (durationField && entry[durationField]) ||
      entry.generatedAt;
    const point = { name: entry._periodLabel ?? fmtDate(labelDate) };
    for (const s of expandedSeries) {
      const extractor = s.extractor ?? s.key;
      const dataKey = s.key ?? extractor.replace(/\./g, "_");
      point[dataKey] = safeNum(resolveByPath(entry.data, extractor));
    }
    return point;
  });

  const coloredSeries = expandedSeries.map((s) => ({
    ...s,
    color:
      s._autoColorIndex !== undefined
        ? AUTO_COLORS[s._autoColorIndex % AUTO_COLORS.length]
        : s.color,
  }));

  return { points, expandedSeries: coloredSeries };
}

// ─── applyChartGrouping ────────────────────────────────────────────────────
// Shared "More Options" post-processing for chart data:
//   sortBy        "value_desc" | "value_asc" | "label_asc" | "label_desc"
//   maxGrouping   5 | 10 | 15 | 20 | 30 | 40 | 50 | 75 — caps how many
//                 categories/points are kept (extras are dropped, matching
//                 the "Max grp N" behaviour seen in Bigin).
// `points` is an array of { name, ...valueKeys }. `primaryKey` is the data
// key used to rank by value (first series/data key when omitted).
export function applyChartGrouping(points, { sortBy, maxGrouping, primaryKey } = {}) {
  if (!Array.isArray(points) || points.length === 0) return points;
  const key = primaryKey ?? Object.keys(points[0]).find((k) => k !== "name");

  let sorted = points;
  switch (sortBy) {
    case "value_desc":
      sorted = [...points].sort((a, b) => safeNum(b[key]) - safeNum(a[key]));
      break;
    case "value_asc":
      sorted = [...points].sort((a, b) => safeNum(a[key]) - safeNum(b[key]));
      break;
    case "label_asc":
      sorted = [...points].sort((a, b) => String(a.name).localeCompare(String(b.name)));
      break;
    case "label_desc":
      sorted = [...points].sort((a, b) => String(b.name).localeCompare(String(a.name)));
      break;
    default:
      sorted = points;
  }

  const limit = Number(maxGrouping) || points.length;
  let limited = sorted.slice(0, limit);

  // If we sorted purely by value/label for ranking but the chart is
  // chronological (no explicit sort requested), restore original (time)
  // order after capping so trend lines still read left-to-right in time.
  if (!sortBy) {
    const kept = new Set(limited.map((p) => p.name));
    limited = points.filter((p) => kept.has(p.name));
  }

  return limited;
}

// ─── applyMapGrouping ──────────────────────────────────────────────────────
// Same idea as applyChartGrouping but for { name, value } slice arrays
// (DonutStatusChart / map-based breakdowns).
export function applyMapGrouping(slices, { sortBy, maxGrouping } = {}) {
  if (!Array.isArray(slices) || slices.length === 0) return slices;

  let sorted = slices;
  switch (sortBy) {
    case "value_desc":
      sorted = [...slices].sort((a, b) => safeNum(b.value) - safeNum(a.value));
      break;
    case "value_asc":
      sorted = [...slices].sort((a, b) => safeNum(a.value) - safeNum(b.value));
      break;
    case "label_asc":
      sorted = [...slices].sort((a, b) => String(a.name).localeCompare(String(b.name)));
      break;
    case "label_desc":
      sorted = [...slices].sort((a, b) => String(b.name).localeCompare(String(a.name)));
      break;
    default:
      sorted = [...slices].sort((a, b) => safeNum(b.value) - safeNum(a.value));
  }

  const limit = Number(maxGrouping) || sorted.length;
  return sorted.slice(0, limit);
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

// ─── resolveMapValue ──────────────────────────────────────────────────────────
export function resolveMapValue(result, path) {
  const data = result?.data;
  if (!data || !path) return {};

  const raw = resolveByPath(data, path);
  if (raw == null) return {};

  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object") {
    const slices = raw
      .map((item) => ({
        name: item.name ?? item.label ?? item.status ?? String(item),
        value: safeNum(item.value ?? item.count ?? 0),
      }))
      .filter((s) => s.value > 0);
    return { slices };
  }

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const map = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, safeNum(v)])
    );
    return { map };
  }

  return {};
}

// ─── resolveTableRows ─────────────────────────────────────────────────────────
export function resolveTableRows(result, path) {
  const data = result?.data;
  if (!data || !path) return { rows: [] };

  const raw = resolveByPath(data, path);
  if (raw == null) return { rows: [] };

  if (Array.isArray(raw)) return { rows: raw };

  if (typeof raw === "object") {
    const rows = Object.entries(raw)
      .map(([department, value]) => ({ department, value: safeNum(value) }))
      .filter((r) => r.value > 0);
    const map = Object.fromEntries(rows.map((r) => [r.department, r.value]));
    return { rows, map };
  }

  return { rows: [] };
}

// ─── resolveFrameworkTable ────────────────────────────────────────────────────
// For maps-of-objects, e.g. compliance.frameworkBreakdown:
//   { ISO27001: { totalControls, applicableControls, compliancePercentage, ... },
//     SOC2:     { totalControls, applicableControls, compliancePercentage, ... } }
// Produces one row per top-level key, with every numeric sub-field as a column —
// dynamic over however many frameworks/keys exist in the live payload, no
// hardcoded list of names anywhere.
export function resolveFrameworkTable(result, path) {
  const data = result?.data;
  if (!data || !path) return { rows: [] };

  const raw = resolveByPath(data, path);
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return { rows: [] };
  }

  const rows = Object.entries(raw).map(([key, metrics]) => {
    const row = { name: key };
    if (metrics != null && typeof metrics === "object") {
      for (const [metricKey, metricVal] of Object.entries(metrics)) {
        row[metricKey] = safeNum(metricVal);
      }
    }
    return row;
  });

  return { rows };
}

/** True if a resolved table value is a map-of-objects (needs dynamic columns)
 * rather than a flat map-of-numbers (existing department/value table path). */
export function isObjectMap(raw) {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return false;
  return Object.values(raw).some((v) => v != null && typeof v === "object" && !Array.isArray(v));
}