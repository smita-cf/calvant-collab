/**
 * ─────────────────────────────────────────────────────────────────────────────
 * useDashboardData  (v7 — per-module KPI comparison windows)
 * ─────────────────────────────────────────────────────────────────────────────
 * v7 changes (fix: KPI Comparison Period not working for risks/audit/tasks):
 *   - getComparisonForWindow(from, to) only ever read `rawResults`, which no
 *     longer contains risk/audit/task data (those are LIVE_ONLY_SOURCES — see
 *     fetchLiveRisks/fetchLiveAudits/fetchLiveTasks below). Any KPI panel on
 *     the "risks"/"audit"/"tasks" module got `[]` back for its comparison
 *     window every time, so the Comparison Period bar never showed a delta.
 *   - Added getRiskComparisonForWindow / getAuditComparisonForWindow /
 *     getTaskComparisonForWindow(from, to, overrideDimensionFilters), mirroring
 *     getComparisonForWindow's date-range semantics but reading liveRisks /
 *     liveAudits / liveTasks and filtering by each record's own date field
 *     (date / openingMeetingDate / createdAt respectively) plus that module's
 *     own criteria shape (department/riskLevel/riskType,
 *     status/auditType/frameworkCode, status/employee/relatedModule) — same
 *     filtering rules already used by getRiskSnapshot/getAuditSnapshot/
 *     getTaskSnapshot, just scoped to a date window first.
 *   - DashboardEngine now dispatches comparison-window fetching by
 *     panel.module, the same way it already dispatches resultsByPanel.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";

const BASE_URL = "https://api.calvant.com/reports-service/api/reports";
// const BASE_URL ="http://localhost:8085/api/reports"
function getToken() {
  try {
    return sessionStorage.getItem("token") || "";
  } catch {
    return "";
  }
}

function getOrgId(orgId) {
  if (orgId) return orgId;
  try {
    return (
      sessionStorage.getItem("orgId") ||
      JSON.parse(sessionStorage.getItem("user") || "{}").organization ||
      JSON.parse(sessionStorage.getItem("user") || "{}").organizationId ||
      ""
    );
  } catch {
    return "";
  }
}

// ─── dimension filter ─────────────────────────────────────────────────────────
// Prunes byDepartment / byClient / byBranch maps in result.data to only the
// selected values. Scalar totals are left unchanged (they reflect whole-org).
// Exported so DashboardEngine can apply a PER-PANEL criteria filter (set via
// the panel builder's "Criteria filter" rows) without duplicating this logic.
export function applyDimensionFilters(rawResults, dimensionFilters) {
  if (!dimensionFilters) return rawResults;
  const { department = [], client = [], branch = [] } = dimensionFilters;
  const hasFilter =
    department.length > 0 || client.length > 0 || branch.length > 0;
  if (!hasFilter) return rawResults;

  return rawResults.map((r) => {
    if (!r.data) return r;
    const filteredData = { ...r.data };

    // For every module key, prune map-type sub-fields
    for (const moduleKey of Object.keys(filteredData)) {
      const mod = filteredData[moduleKey];
      if (!mod || typeof mod !== "object") continue;
      const prunedMod = { ...mod };

      if (department.length > 0 && prunedMod.byDepartment) {
        prunedMod.byDepartment = Object.fromEntries(
          Object.entries(prunedMod.byDepartment).filter(([k]) =>
            department.includes(k),
          ),
        );
      }
      if (client.length > 0 && prunedMod.byClient) {
        prunedMod.byClient = Object.fromEntries(
          Object.entries(prunedMod.byClient).filter(([k]) =>
            client.includes(k),
          ),
        );
      }
      if (branch.length > 0 && prunedMod.byBranch) {
        prunedMod.byBranch = Object.fromEntries(
          Object.entries(prunedMod.byBranch).filter(([k]) =>
            branch.includes(k),
          ),
        );
      }

      // ── Recompute scalar totals from the pruned breakdown map ──────────
      // Without this, Criteria filter only pruned byDepartment/byClient/
      // byBranch maps — but most KPI panels (StatCard/ScoreGauge/
      // TargetMeter) read a scalar like "risks.total", which was never
      // touched, so the filter silently did nothing for them. Re-derive
      // count-like scalar fields (total/overdue/totalFindings — anything
      // summable, not avg/max/percentage/score) from whichever dimension
      // map was actually filtered.
      const prunedMapForRecompute =
        (department.length > 0 && prunedMod.byDepartment) ||
        (client.length > 0 && prunedMod.byClient) ||
        (branch.length > 0 && prunedMod.byBranch);

      if (prunedMapForRecompute) {
        const filteredSum = Object.values(prunedMapForRecompute).reduce(
          (sum, v) => sum + (Number(v) || 0),
          0,
        );
        for (const fieldKey of Object.keys(prunedMod)) {
          const isCountField =
            typeof prunedMod[fieldKey] === "number" &&
            /^(total|count|overdue)/i.test(fieldKey) &&
            !/avg|max|percentage|score/i.test(fieldKey);
          if (isCountField) {
            prunedMod[fieldKey] = filteredSum;
          }
        }
      }

      filteredData[moduleKey] = prunedMod;
    }
    return { ...r, data: filteredData };
  });
}

// ─── configId scope filter ────────────────────────────────────────────────────
// Ensures results from other schedules' configs never bleed into this view.
function applyConfigScope(rawResults, configId) {
  if (!configId) return rawResults;
  return rawResults.filter((r) => r.configId === configId);
}

// ─── date window filter (page-level header filter only) ──────────────────────
function applyDateWindow(rawResults, filters) {
  if (!filters?.interval || filters.interval === "all") return rawResults;

  if (filters.interval === "custom") {
    if (!filters.customFrom) return rawResults;
    const from = new Date(filters.customFrom);
    from.setHours(0, 0, 0, 0);
    const to = filters.customTo ? new Date(filters.customTo) : new Date();
    to.setHours(23, 59, 59, 999);
    return rawResults.filter((r) => {
      const d = new Date(r.generatedAt);
      return d >= from && d <= to;
    });
  }

  const days = { "7d": 7, "14d": 14, "90d": 90 }[filters.interval];
  if (!days) return rawResults;
  const cutoff = new Date(Date.now() - days * 86_400_000);
  return rawResults.filter((r) => new Date(r.generatedAt) >= cutoff);
}

// ─── generic own-date-range filter (for LIVE risk/audit/task records) ───────
// Mirrors the from/to windowing already used by getComparisonForWindow, but
// generalized to any flat record array + whichever field holds that record's
// own date (risks: "date", audits: "openingMeetingDate", tasks: "createdAt")
// instead of a report snapshot's `generatedAt`.
function filterRecordsByDateRange(records, dateField, from, to) {
  if (!from) return records;
  const fromDate = new Date(from);
  fromDate.setHours(0, 0, 0, 0);
  const toDate = to ? new Date(to) : new Date();
  toDate.setHours(23, 59, 59, 999);
  return records.filter((r) => {
    const raw = r?.[dateField];
    if (!raw) return false;
    const d = new Date(raw);
    return d >= fromDate && d <= toDate;
  });
}

// ─── shape into results array ────────────────────────────────────────────────
function toResultsShape(filtered, dimensionFilters) {
  if (filtered.length === 0) return [];
  const dimFiltered = dimensionFilters
    ? filtered.map((entry) => ({
        ...entry,
        data:
          applyDimensionFilters([entry], dimensionFilters)[0]?.data ??
          entry.data,
      }))
    : filtered;
  const latest = dimFiltered[dimFiltered.length - 1];
  return [
    {
      reportId: "snapshot",
      generatedAt: latest.generatedAt,
      data: latest.data,
      _series: dimFiltered,
    },
  ];
}

// ─── collect available dimension values from all results ────────────────────
function extractDimensionOptions(rawResults) {
  const departments = new Set();
  const clients = new Set();
  const branches = new Set();

  for (const r of rawResults) {
    if (!r.data) continue;
    for (const mod of Object.values(r.data)) {
      if (!mod || typeof mod !== "object") continue;
      if (mod.byDepartment)
        Object.keys(mod.byDepartment).forEach((k) => departments.add(k));
      if (mod.byClient)
        Object.keys(mod.byClient).forEach((k) => clients.add(k));
      if (mod.byBranch)
        Object.keys(mod.byBranch).forEach((k) => branches.add(k));
    }
  }

  return {
    departments: [...departments].sort(),
    clients: [...clients].sort(),
    branches: [...branches].sort(),
  };
}

// ─── collect available dimension values from LIVE risk records ──────────────
// Risks are raw records (department/riskLevel/riskType directly on each
// record), not the byDepartment/byClient/byBranch maps the generic extractor
// above reads — so this walks the flat liveRisks array instead of rawResults.
// riskType is a list per risk record, so its values are unioned across all
// risks rather than read as a single field.
function extractRiskDimensionOptions(risks) {
  const departments = new Set();
  const riskLevels = new Set();
  const riskTypes = new Set();

  for (const r of risks) {
    if (r.department) departments.add(r.department);
    if (r.riskLevel) riskLevels.add(r.riskLevel);
    if (Array.isArray(r.riskType)) r.riskType.forEach((t) => riskTypes.add(t));
  }

  return {
    departments: [...departments].sort(),
    riskLevels: [...riskLevels].sort(),
    riskTypes: [...riskTypes].sort(),
  };
}

// ─── period bucketing (day / week / month / year) ────────────────────────────
// Buckets `results` by the requested granularity. Last snapshot written to a
// given period wins — i.e. for "month" we keep the most recent generatedAt
// within that month, which is also the correct "running total" value (a
// running total's last value IS its sum-to-date — nothing more to sum).
const WEEK_DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function periodKeyAndLabel(generatedAt, granularity, weekStartDay = "MONDAY", weekEndDay = "SUNDAY") {
  const d = new Date(generatedAt);
  switch (granularity) {
    case "year": {
      const y = d.getFullYear();
      return { key: `${y}`, label: `${y}` };
    }
    case "month": {
      const y = d.getFullYear();
      const m = d.getMonth();
      const label = d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
      return { key: `${y}-${String(m).padStart(2, "0")}`, label };
    }
    case "week": {
      const startIdx = WEEK_DAY_ORDER.indexOf(weekStartDay || "MONDAY");
      const endIdx = WEEK_DAY_ORDER.indexOf(weekEndDay || "SUNDAY");
      const safeStartIdx = startIdx === -1 ? 0 : startIdx;
      const todayIdx = (d.getDay() + 6) % 7;
      const diff = (todayIdx - safeStartIdx + 7) % 7;

      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - diff);

      let span = endIdx === -1 ? 6 : ((endIdx - safeStartIdx) % 7 + 7) % 7;
      if (span === 0) span = 6;

      const end = new Date(start);
      end.setDate(end.getDate() + span);

      const key = start.toISOString().slice(0, 10);
      const fmt = (dt) => dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      const label = `${fmt(start)} - ${fmt(end)}`;
      return { key, label };
    }
    case "day":
    default: {
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      return { key, label };
    }
  }
}

function bucketByPeriod(results, granularity = "day", weekStartDay = "MONDAY", weekEndDay = "SUNDAY") {
  const map = new Map();
  for (const r of results) {
    const { key, label } = periodKeyAndLabel(r.generatedAt, granularity, weekStartDay, weekEndDay);
    map.set(key, { ...r, _periodLabel: label });
  }
  return [...map.values()].sort(
    (a, b) => new Date(a.generatedAt) - new Date(b.generatedAt),
  );
}

// ─── risk period bucketing (own-date, not report-snapshot based) ────────────
// RiskDataProvider/risk records carry their own `date` field, independent of
// which day a report happened to run — so risks bucket by that own date,
// not by report-snapshot day like the other modules.
//
// Unlike bucketByPeriod (which only ever produces a point for periods that
// actually have a report snapshot), this ALWAYS returns a contiguous run of
// `count` periods ending at today — any period with no matching risk gets an
// explicit zero-value entry rather than being skipped. Skipping empty
// periods made the chart interpolate a smooth line straight across
// arbitrarily long gaps (e.g. 3 weeks with no risks looked identical to a
// real trend), and it also meant the series didn't necessarily reach
// "today" if the most recent risk was several periods old.
function granularityStepDate(date, granularity, count) {
  const d = new Date(date);
  switch (granularity) {
    case "year":
      d.setFullYear(d.getFullYear() - count);
      return d;
    case "month":
      d.setMonth(d.getMonth() - count);
      return d;
    case "week":
      d.setDate(d.getDate() - count * 7);
      return d;
    case "day":
    default:
      d.setDate(d.getDate() - count);
      return d;
  }
}

const DEFAULT_RISK_WINDOW = 10;

function buildRiskSeriesWindow(risks, granularity, maxGrouping, weekStartDay, weekEndDay) {
  const count = maxGrouping || DEFAULT_RISK_WINDOW;

  // Group risks by period key WITHOUT dropping periods that end up empty —
  // we need to know which periods are genuinely empty vs. just unpopulated,
  // and fill every period in the final window either way.
  const bucketMap = new Map(); // key -> risks[]
  for (const r of risks) {
    if (!r?.date) continue;
    const { key } = periodKeyAndLabel(r.date, granularity, weekStartDay, weekEndDay);
    if (!bucketMap.has(key)) bucketMap.set(key, []);
    bucketMap.get(key).push(r);
  }

  const today = new Date();
  const series = [];
  for (let i = count - 1; i >= 0; i--) {
    const periodDate = granularityStepDate(today, granularity, i);
    const { key, label } = periodKeyAndLabel(periodDate, granularity, weekStartDay, weekEndDay);
    const bucketRisks = bucketMap.get(key) ?? []; // no risks that period → zero-value entry
    series.push({
      generatedAt: periodDate.toISOString(),
      _periodLabel: label,
      data: riskBucketToData(bucketRisks),
    });
  }
  return series;
}

function riskBucketToData(bucketRisks) {
  const risksIdentifiedCount = bucketRisks.length;
  const risksInMitigationCount = bucketRisks.filter((r) => r.inMitigation === true).length;
  const risksByTreatmentType = {};
  for (const r of bucketRisks) {
    const t = r.treatmentType ?? "Unknown";
    risksByTreatmentType[t] = (risksByTreatmentType[t] || 0) + 1;
  }
  return { risks: { risksIdentifiedCount, risksInMitigationCount, risksByTreatmentType } };
}

function auditBucketToData(bucketAudits) {
  const total = bucketAudits.length;
  const byStatus = {};
  const byType = {};
  const byFramework = {};
  for (const a of bucketAudits) {
    const s = a.status ?? "UNKNOWN";
    byStatus[s] = (byStatus[s] || 0) + 1;
    const t = a.auditType ?? "UNKNOWN";
    byType[t] = (byType[t] || 0) + 1;
    const f = a.frameworkCode ?? "UNKNOWN";
    byFramework[f] = (byFramework[f] || 0) + 1;
  }
  return { audit: { total, byStatus, byType, byFramework } };
}

function taskBucketToData(bucketTasks) {
  const total = bucketTasks.length;
  const byStatus = {};
  const byModule = {};
  for (const t of bucketTasks) {
    const s = t.status ?? "UNKNOWN";
    byStatus[s] = (byStatus[s] || 0) + 1;
    const m = t.relatedModule ?? "General";
    byModule[m] = (byModule[m] || 0) + 1;
  }
  return { tasks: { total, byStatus, byModule } };
}

// Generalized version of buildRiskSeriesWindow — takes the raw records,
// which own-date field to bucket by, and a bucket→data mapper, so
// audits/tasks don't need their own copy of the window-building logic.
// (buildRiskSeriesWindow itself is left untouched to avoid any risk of
// regressing the already-working risk panels.)
function buildOwnDateSeriesWindow(records, dateField, toBucketData, granularity, maxGrouping, weekStartDay, weekEndDay) {
  const count = maxGrouping || DEFAULT_RISK_WINDOW;
  const bucketMap = new Map();
  for (const r of records) {
    const d = r?.[dateField];
    if (!d) continue;
    const { key } = periodKeyAndLabel(d, granularity, weekStartDay, weekEndDay);
    if (!bucketMap.has(key)) bucketMap.set(key, []);
    bucketMap.get(key).push(r);
  }
  const today = new Date();
  const series = [];
  for (let i = count - 1; i >= 0; i--) {
    const periodDate = granularityStepDate(today, granularity, i);
    const { key, label } = periodKeyAndLabel(periodDate, granularity, weekStartDay, weekEndDay);
    const bucketRecords = bucketMap.get(key) ?? [];
    series.push({
      generatedAt: periodDate.toISOString(),
      _periodLabel: label,
      data: toBucketData(bucketRecords),
    });
  }
  return series;
}

// ─── dimension options from LIVE audit/task records ──────────────────────────
function extractAuditDimensionOptions(audits) {
  const statuses = new Set();
  const auditTypes = new Set();
  const frameworks = new Set();
  for (const a of audits) {
    if (a.status) statuses.add(a.status);
    if (a.auditType) auditTypes.add(a.auditType);
    if (a.frameworkCode) frameworks.add(a.frameworkCode);
  }
  return { statuses: [...statuses].sort(), auditTypes: [...auditTypes].sort(), frameworks: [...frameworks].sort() };
}

function extractTaskDimensionOptions(tasks) {
  const statuses = new Set();
  const owners = new Set();
  const relatedModules = new Set();
  for (const t of tasks) {
    if (t.status) statuses.add(t.status);
    if (t.employee) owners.add(t.employee);
    if (t.relatedModule) relatedModules.add(t.relatedModule);
  }
  return { statuses: [...statuses].sort(), owners: [...owners].sort(), relatedModules: [...relatedModules].sort() };
}

// ─── hook ─────────────────────────────────────────────────────────────────────
export function useDashboardData(
  config,
  orgIdProp,
  filters,
  comparisonFilters,
  dimensionFilters,
) {
  const orgId = useMemo(() => getOrgId(orgIdProp), [orgIdProp]);
  const configId = config?.id ?? null;
  const weekStartDay = config?.weekStartDay ?? "MONDAY";
  const weekEndDay = config?.weekEndDay ?? "SUNDAY";
  const [rawResults, setRawResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [online, setOnline] = useState(true);

  const lastFetchedRef = useRef(null);

  const bumpLastFetched = useCallback(() => {
    const now = new Date();
    if (!lastFetchedRef.current || now - lastFetchedRef.current > 1_000) {
      lastFetchedRef.current = now;
      setLastFetched(now);
    }
  }, []);

  const [liveRisks, setLiveRisks] = useState([]);

  const fetchLiveRisks = useCallback(async () => {
    if (!orgId) return;
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/risks/live?organization=${encodeURIComponent(orgId)}`, {
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const risks = json?.data?.risks ?? [];
      setLiveRisks(Array.isArray(risks) ? risks : []);
    } catch {
      // leave liveRisks at its previous value — don't blank out a working chart on a transient failure
    }
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    fetchLiveRisks();
  }, [fetchLiveRisks]);

  const [liveAudits, setLiveAudits] = useState([]);

  const fetchLiveAudits = useCallback(async () => {
    if (!orgId) return;
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/audits/live?organization=${encodeURIComponent(orgId)}`, {
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const audits = json?.data?.audits ?? [];
      setLiveAudits(Array.isArray(audits) ? audits : []);
    } catch {
      // leave liveAudits at its previous value
    }
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    fetchLiveAudits();
  }, [fetchLiveAudits]);

  const [liveTasks, setLiveTasks] = useState([]);

  const fetchLiveTasks = useCallback(async () => {
    if (!orgId) return;
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/tasks/live?organization=${encodeURIComponent(orgId)}`, {
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const tasks = json?.data?.tasks ?? [];
      setLiveTasks(Array.isArray(tasks) ? tasks : []);
    } catch {
      // leave liveTasks at its previous value
    }
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    fetchLiveTasks();
  }, [fetchLiveTasks]);

  // ── REST fetch ───────────────────────────────────────────────────────────
  const fetch_ = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(
        `${BASE_URL}/results?organization=${encodeURIComponent(orgId)}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      const json = await res.json();
      const arr = Array.isArray(json.data) ? json.data : [];
      const scoped = applyConfigScope(arr, configId);
      const sorted = [...scoped].sort(
        (a, b) => new Date(a.generatedAt) - new Date(b.generatedAt),
      );
      setRawResults(sorted);
      bumpLastFetched();
      setOnline(true);
    } catch (e) {
      setError(e.message || "Unknown error");
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }, [orgId, configId, bumpLastFetched]);

  useEffect(() => {
    if (!orgId) return;
    // Reset results immediately on schedule switch so stale data from the
    // previous config doesn't flash before the new fetch completes.
    setRawResults([]);
    fetch_();
  }, [fetch_]);

  // ── ad-hoc comparison window (per-panel KPI "Compare to") ──────────────────
  // NOTE: only valid for report-snapshot-backed modules. Risks/audit/tasks
  // are live-only and never appear in rawResults — use
  // getRiskComparisonForWindow / getAuditComparisonForWindow /
  // getTaskComparisonForWindow for those modules instead (see below).
  const getComparisonForWindow = useCallback((from, to) => {
    if (!from) return [];
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const windowedRaw = rawResults.filter((r) => {
      const d = new Date(r.generatedAt);
      return d >= fromDate && d <= toDate;
    });

    const dimFiltered = applyDimensionFilters(windowedRaw, dimensionFilters);
    return toResultsShape(bucketByPeriod(dimFiltered, "day"), dimensionFilters);
  }, [rawResults, dimensionFilters]);

  // ── per-module comparison windows — risks / audit / tasks ─────────────────
  // Same [from, to] semantics as getComparisonForWindow above, but scoped to
  // each module's own live records + own-date field + own criteria shape
  // (identical filtering rules to getRiskSnapshot/getAuditSnapshot/
  // getTaskSnapshot), so KPI panels on these modules get a real Comparison
  // Period instead of always reading an empty rawResults window.
  const getRiskComparisonForWindow = useCallback((from, to, overrideDimensionFilters) => {
    if (!from) return [];
    const cf = overrideDimensionFilters ?? {};
    const dept = cf.department ?? [];
    const riskLevel = cf.riskLevel ?? [];
    const riskType = cf.riskType ?? [];

    const windowed = filterRecordsByDateRange(liveRisks, "date", from, to);
    const scoped = windowed.filter((r) => {
      if (dept.length && !dept.includes(r.department)) return false;
      if (riskLevel.length && !riskLevel.includes(r.riskLevel)) return false;
      if (riskType.length && !(Array.isArray(r.riskType) && r.riskType.some((t) => riskType.includes(t)))) return false;
      return true;
    });

    return [{
      reportId: "risk-comparison-snapshot",
      generatedAt: to ?? new Date().toISOString(),
      data: riskBucketToData(scoped),
    }];
  }, [liveRisks]);

  const getAuditComparisonForWindow = useCallback((from, to, overrideDimensionFilters) => {
    if (!from) return [];
    const cf = overrideDimensionFilters ?? {};
    const status = cf.status ?? [];
    const auditType = cf.auditType ?? [];
    const frameworkCode = cf.frameworkCode ?? [];

    const windowed = filterRecordsByDateRange(liveAudits, "openingMeetingDate", from, to);
    const scoped = windowed.filter((a) => {
      if (status.length && !status.includes(a.status)) return false;
      if (auditType.length && !auditType.includes(a.auditType)) return false;
      if (frameworkCode.length && !frameworkCode.includes(a.frameworkCode)) return false;
      return true;
    });

    return [{
      reportId: "audit-comparison-snapshot",
      generatedAt: to ?? new Date().toISOString(),
      data: auditBucketToData(scoped),
    }];
  }, [liveAudits]);

  const getTaskComparisonForWindow = useCallback((from, to, overrideDimensionFilters) => {
    if (!from) return [];
    const cf = overrideDimensionFilters ?? {};
    const status = cf.status ?? [];
    const employee = cf.employee ?? [];
    const relatedModule = cf.relatedModule ?? [];

    const windowed = filterRecordsByDateRange(liveTasks, "createdAt", from, to);
    const scoped = windowed.filter((t) => {
      if (status.length && !status.includes(t.status)) return false;
      if (employee.length && !employee.includes(t.employee)) return false;
      if (relatedModule.length && !relatedModule.includes(t.relatedModule)) return false;
      return true;
    });

    return [{
      reportId: "task-comparison-snapshot",
      generatedAt: to ?? new Date().toISOString(),
      data: taskBucketToData(scoped),
    }];
  }, [liveTasks]);

  // ── per-panel PRIMARY window (grouping-driven) — CHARTS / MAPS ─────────────
  // granularity: "day" | "week" | "month" | "year" — how points are bucketed.
  // maxGrouping: how many of the most-recent buckets to keep (5..75).
  // overrideDimensionFilters: a single panel's own Criteria Filter
  // (department/client/branch), independent of the dashboard-wide FilterBar.
  const getResultsForWindow = useCallback((
    granularity = "day",
    maxGrouping,
    overrideDimensionFilters,
  ) => {
    const effectiveDimFilters = overrideDimensionFilters ?? dimensionFilters;
    const dimFiltered = applyDimensionFilters(rawResults, effectiveDimFilters);
    let bucketed = bucketByPeriod(dimFiltered, granularity, weekStartDay, weekEndDay);
    if (maxGrouping) {
      bucketed = bucketed.slice(-maxGrouping);
    }
    return toResultsShape(bucketed, effectiveDimFilters);
  }, [rawResults, dimensionFilters, weekStartDay, weekEndDay]);

  // ── risk period series — CHARTS / KPIs on the "risks" module ──────────────
  // Reads liveRisks (fetched fresh from GET /risks/live — see fetchLiveRisks
  // above), NOT rawResults — risks are no longer persisted into ReportResult
  // snapshots at all (see backend ReportService.LIVE_ONLY_SOURCES), so there
  // is nothing to read off rawResults for this module anymore.
  //
  // Always returns a CONTIGUOUS window of periods ending at today (default
  // 10 when the panel doesn't specify maxGrouping) — a period with no
  // matching risk shows an explicit 0 rather than being dropped, so gaps in
  // risk creation read as flat zero, not as an interpolated line jumping
  // across however many empty periods happened to occur.
  //
  // Criteria filtering here is risk-specific — department / riskLevel /
  // riskType — a different shape than the generic dimensionFilters
  // (department/client/branch maps), which don't exist on raw risk records.
  // riskType is a list per risk record, so it's a "some value matches"
  // check, not an equality check like the others. Deliberately reads
  // overrideDimensionFilters directly rather than falling back to the
  // page-level dimensionFilters, since mixing them in would silently
  // misapply a page-level client/branch filter that doesn't exist on risks.
  const getRiskPeriodSeries = useCallback((
    granularity = "day",
    maxGrouping,
    overrideDimensionFilters,
  ) => {
    const cf = overrideDimensionFilters ?? {};
    const dept = cf.department ?? [];
    const riskLevel = cf.riskLevel ?? [];
    const riskType = cf.riskType ?? [];

    const scopedRisks = liveRisks.filter((r) => {
      if (dept.length && !dept.includes(r.department)) return false;
      if (riskLevel.length && !riskLevel.includes(r.riskLevel)) return false;
      if (riskType.length && !(Array.isArray(r.riskType) && r.riskType.some((t) => riskType.includes(t)))) return false;
      return true;
    });

    const series_ = buildRiskSeriesWindow(scopedRisks, granularity, maxGrouping, weekStartDay, weekEndDay);
    if (!series_.length) return [];

    const lastEntry = series_[series_.length - 1];
    return [{
      reportId: "risk-period-snapshot",
      generatedAt: lastEntry.generatedAt,
      data: lastEntry.data,
      _series: series_,
    }];
  }, [liveRisks, weekStartDay, weekEndDay]);

  // ── audit period series — bucketed by each audit's own openingMeetingDate ──
  const getAuditPeriodSeries = useCallback((
    granularity = "day",
    maxGrouping,
    overrideDimensionFilters,
  ) => {
    const cf = overrideDimensionFilters ?? {};
    const status = cf.status ?? [];
    const auditType = cf.auditType ?? [];
    const frameworkCode = cf.frameworkCode ?? [];

    const scopedAudits = liveAudits.filter((a) => {
      if (status.length && !status.includes(a.status)) return false;
      if (auditType.length && !auditType.includes(a.auditType)) return false;
      if (frameworkCode.length && !frameworkCode.includes(a.frameworkCode)) return false;
      return true;
    });

    const series_ = buildOwnDateSeriesWindow(scopedAudits, "openingMeetingDate", auditBucketToData, granularity, maxGrouping, weekStartDay, weekEndDay);
    if (!series_.length) return [];

    const lastEntry = series_[series_.length - 1];
    return [{
      reportId: "audit-period-snapshot",
      generatedAt: lastEntry.generatedAt,
      data: lastEntry.data,
      _series: series_,
    }];
  }, [liveAudits, weekStartDay, weekEndDay]);

  const auditDimensionOptions = useMemo(
    () => extractAuditDimensionOptions(liveAudits),
    [liveAudits],
  );

  // ── task period series — bucketed by each task's own createdAt ────────────
  const getTaskPeriodSeries = useCallback((
    granularity = "day",
    maxGrouping,
    overrideDimensionFilters,
  ) => {
    const cf = overrideDimensionFilters ?? {};
    const status = cf.status ?? [];
    const employee = cf.employee ?? [];
    const relatedModule = cf.relatedModule ?? [];

    const scopedTasks = liveTasks.filter((t) => {
      if (status.length && !status.includes(t.status)) return false;
      if (employee.length && !employee.includes(t.employee)) return false;
      if (relatedModule.length && !relatedModule.includes(t.relatedModule)) return false;
      return true;
    });

    const series_ = buildOwnDateSeriesWindow(scopedTasks, "createdAt", taskBucketToData, granularity, maxGrouping, weekStartDay, weekEndDay);
    if (!series_.length) return [];

    const lastEntry = series_[series_.length - 1];
    return [{
      reportId: "task-period-snapshot",
      generatedAt: lastEntry.generatedAt,
      data: lastEntry.data,
      _series: series_,
    }];
  }, [liveTasks, weekStartDay, weekEndDay]);

  // ── snapshot aggregates — for non-trend widgets (StatCard/Donut/etc) ──────
  // getXPeriodSeries buckets by date and returns only the LATEST bucket's
  // data — correct for a trend line, but wrong for a snapshot widget: a
  // Donut/StatCard showing "risks created today" is almost always empty.
  // These ignore date-bucketing and aggregate the full criteria-filtered
  // population instead, matching what the live endpoint's own totals mean.
  const getRiskSnapshot = useCallback((overrideDimensionFilters) => {
    const cf = overrideDimensionFilters ?? {};
    const dept = cf.department ?? [];
    const riskLevel = cf.riskLevel ?? [];
    const riskType = cf.riskType ?? [];
    const scopedRisks = liveRisks.filter((r) => {
      if (dept.length && !dept.includes(r.department)) return false;
      if (riskLevel.length && !riskLevel.includes(r.riskLevel)) return false;
      if (riskType.length && !(Array.isArray(r.riskType) && r.riskType.some((t) => riskType.includes(t)))) return false;
      return true;
    });
    return [{ reportId: "risk-snapshot", generatedAt: new Date().toISOString(), data: riskBucketToData(scopedRisks) }];
  }, [liveRisks]);

  const getAuditSnapshot = useCallback((overrideDimensionFilters) => {
    const cf = overrideDimensionFilters ?? {};
    const status = cf.status ?? [];
    const auditType = cf.auditType ?? [];
    const frameworkCode = cf.frameworkCode ?? [];
    const scopedAudits = liveAudits.filter((a) => {
      if (status.length && !status.includes(a.status)) return false;
      if (auditType.length && !auditType.includes(a.auditType)) return false;
      if (frameworkCode.length && !frameworkCode.includes(a.frameworkCode)) return false;
      return true;
    });
    return [{ reportId: "audit-snapshot", generatedAt: new Date().toISOString(), data: auditBucketToData(scopedAudits) }];
  }, [liveAudits]);

  const getTaskSnapshot = useCallback((overrideDimensionFilters) => {
    const cf = overrideDimensionFilters ?? {};
    const status = cf.status ?? [];
    const employee = cf.employee ?? [];
    const relatedModule = cf.relatedModule ?? [];
    const scopedTasks = liveTasks.filter((t) => {
      if (status.length && !status.includes(t.status)) return false;
      if (employee.length && !employee.includes(t.employee)) return false;
      if (relatedModule.length && !relatedModule.includes(t.relatedModule)) return false;
      return true;
    });
    return [{ reportId: "task-snapshot", generatedAt: new Date().toISOString(), data: taskBucketToData(scopedTasks) }];
  }, [liveTasks]);

  const taskDimensionOptions = useMemo(
    () => extractTaskDimensionOptions(liveTasks),
    [liveTasks],
  );

  // ── risk dimension options — for PanelBuilderModal's risk Criteria filter ──
  const riskDimensionOptions = useMemo(
    () => extractRiskDimensionOptions(liveRisks),
    [liveRisks],
  );

  // ── per-panel PRIMARY window — KPIs ─────────────────────────────────────────
  // KPIs (StatCard/ScoreGauge/TargetMeter) need their own duration so the
  // "current value" and its Comparison Period actually mean something —
  // e.g. "7D" = the latest snapshot within the last 7 days. This is a plain
  // date-range filter (mirrors the old applyDateWindow), independent of the
  // chart grouping/maxGrouping concept above.
  // duration: { key: "7d"|"14d"|"90d"|"custom", customFrom, customTo }
  const getKpiResultsForWindow = useCallback((
    duration,
    overrideDimensionFilters,
  ) => {
    const effectiveDimFilters = overrideDimensionFilters ?? dimensionFilters;
    const windowed = applyDateWindow(rawResults, {
      interval: duration?.key ?? "7d",
      customFrom: duration?.customFrom,
      customTo: duration?.customTo,
    });
    const dimFiltered = applyDimensionFilters(windowed, effectiveDimFilters);
    return toResultsShape(bucketByPeriod(dimFiltered, "day"), effectiveDimFilters);
  }, [rawResults, dimensionFilters]);

  // ── SSE subscription (the ONLY source of "live" updates — no polling) ─────
  useEffect(() => {
    if (!orgId) return;
    const url = `${BASE_URL}/stream?organization=${encodeURIComponent(orgId)}`;
    const es = new EventSource(url);

    es.addEventListener("report-update", (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (configId && payload.configId !== configId) return;
        setRawResults((prev) => {
          const alreadyExists = prev.some(
            (r) => r.generatedAt === payload.generatedAt,
          );
          if (alreadyExists) return prev;
          return [...prev, payload].sort(
            (a, b) => new Date(a.generatedAt) - new Date(b.generatedAt),
          );
        });
        bumpLastFetched();
        setOnline(true);
      } catch {}
    });

    es.onerror = () => {
      // No interval-based reconnect/poll — connection just goes idle.
      // Data stays exactly as last fetched until the user hits refresh.
      setOnline(false);
      es.close();
    };

    return () => es.close();
  }, [orgId, configId, bumpLastFetched]);

  // ── Primary results (page-level date window + dimension filter, day-grouped) ─
  const filteredResults = useMemo(
    () => applyDateWindow(rawResults, filters),
    [rawResults, filters],
  );

  const dimensionFiltered = useMemo(
    () => applyDimensionFilters(filteredResults, dimensionFilters),
    [filteredResults, dimensionFilters],
  );

  const results = useMemo(
    () => toResultsShape(bucketByPeriod(dimensionFiltered, "day"), dimensionFilters),
    [dimensionFiltered, dimensionFilters],
  );

  // ── Comparison results (separate date window, same dimension filter) ──────
  const comparisonResults = useMemo(() => {
    if (!comparisonFilters?.enabled) return [];

    const { from, to } = comparisonFilters;
    if (!from) return [];

    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = to ? new Date(to) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const windowedRaw = rawResults.filter((r) => {
      const d = new Date(r.generatedAt);
      return d >= fromDate && d <= toDate;
    });

    const dimFiltered = applyDimensionFilters(windowedRaw, dimensionFilters);

    return toResultsShape(bucketByPeriod(dimFiltered, "day"), dimensionFilters);
  }, [rawResults, comparisonFilters, dimensionFilters]);

  // ── Available dimension options for FilterBar / Criteria Filter dropdowns ─
  const dimensionOptions = useMemo(
    () => extractDimensionOptions(rawResults),
    [rawResults],
  );

  // ── combined manual refresh — covers both persisted results AND live risks ─
  // so the header's refresh button actually updates risk panels too, now
  // that risks are served live instead of coming along with fetch_().
  const refetchAll = useCallback(() => {
    fetch_();
    fetchLiveRisks();
    fetchLiveAudits();
    fetchLiveTasks();
  }, [fetch_, fetchLiveRisks, fetchLiveAudits, fetchLiveTasks]);

  return {
    results,
    getComparisonForWindow,
    getRiskComparisonForWindow,
    getAuditComparisonForWindow,
    getTaskComparisonForWindow,
    getResultsForWindow,
    getRiskPeriodSeries,
    getRiskSnapshot,
    getAuditPeriodSeries,
    getAuditSnapshot,
    getTaskPeriodSeries,
    getTaskSnapshot,
    getKpiResultsForWindow,
    comparisonResults,
    dimensionOptions,
    riskDimensionOptions,
    auditDimensionOptions,
    taskDimensionOptions,
    loading,
    error,
    refetch: refetchAll,
    lastFetched,
    online,
    orgId,
  };
}