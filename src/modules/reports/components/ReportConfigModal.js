/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ReportConfigModal.jsx  (v2 — no data source picker)
 * ─────────────────────────────────────────────────────────────────────────────
 * Allows users to view and edit a report config's schedule settings:
 *   • Report name
 *   • Interval type (Daily, Weekly, Monthly, Quarterly, Yearly, Custom)
 *   • Interval value (for Custom types)
 *   • Active toggle
 *
 * CHANGED FROM v1:
 *   • Data source selection removed from this modal entirely. Users now pick
 *     duration first (here), then KPI tiles later on the dashboard canvas
 *     (CustomDashboardModal / template gallery). `dataSources` is sent as
 *     ALL available sources at creation time and is narrowed implicitly as
 *     panels are added — the dashboard canvas does not currently write back
 *     to config.dataSources, so this is a permissive default, not a live sync.
 *
 * Calls PATCH /api/reports/config/:id/active for toggle-only changes.
 * Calls POST /api/reports/config for creating new configs.
 * For full edits it deletes + recreates (backend has no PUT config endpoint).
 *
 * Props:
 *   config      – existing ReportConfig object | null (null = create mode)
 *   organization – string
 *   userId      – string
 *   availableSources – string[]   (used silently to populate dataSources)
 *   onSave      – (savedConfig) => void
 *   onClose     – () => void
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, RefreshCw, ToggleLeft, ToggleRight,
  Save, Trash2, Plus
} from "lucide-react";

const BASE_URL = "https://api.calvant.com/reports-service/api/reports";
// const BASE_URL ="http://localhost:8085/api/reports"
function getToken() {
  try { return sessionStorage.getItem("token") || ""; } catch { return ""; }
}

// ─── interval options ─────────────────────────────────────────────────────────
const INTERVAL_OPTIONS = [
  { value: "DAILY",    label: "Daily",    needsValue: false },
  { value: "WEEKLY",   label: "Weekly",   needsValue: false },
  { value: "MONTHLY",  label: "Monthly",  needsValue: false },
  { value: "QUARTERLY",label: "Quarterly",needsValue: false },
  { value: "YEARLY",   label: "Yearly",   needsValue: false },
  { value: "HOURLY",   label: "Hourly",   needsValue: false },
  { value: "CUSTOM_DAYS",   label: "Every N days",   needsValue: true, unit: "days"   },
  { value: "CUSTOM_MONTHS", label: "Every N months", needsValue: true, unit: "months" },
  { value: "CUSTOM_YEARS",  label: "Every N years",  needsValue: true, unit: "years"  },
];

const INTERVAL_ICONS = {
  DAILY: "🗓️", WEEKLY: "📅", MONTHLY: "🗃️", QUARTERLY: "📊",
  YEARLY: "🗓️", HOURLY: "⏰", CUSTOM_DAYS: "⚙️", CUSTOM_MONTHS: "⚙️", CUSTOM_YEARS: "⚙️",
};

// ─── week-start options ───────────────────────────────────────────────────────
// Different orgs run their business week differently (e.g. Sat -> Fri instead
// of the ISO default Mon -> Sun). This is set once here, at setup time, and
// drives every "weekly" window/label on the dashboard so all orgs aren't
// forced onto the same calendar week.
const WEEK_DAY_OPTIONS = [
  { value: "MONDAY", label: "Mon" },
  { value: "TUESDAY", label: "Tue" },
  { value: "WEDNESDAY", label: "Wed" },
  { value: "THURSDAY", label: "Thu" },
  { value: "FRIDAY", label: "Fri" },
  { value: "SATURDAY", label: "Sat" },
  { value: "SUNDAY", label: "Sun" },
];

function weekEndLabel(startDay) {
  const idx = WEEK_DAY_OPTIONS.findIndex((d) => d.value === startDay);
  if (idx === -1) return "";
  const endIdx = (idx + 6) % 7;
  return WEEK_DAY_OPTIONS[endIdx].label;
}

function weekSpanLabel(startDay, endDay) {
  const startIdx = WEEK_DAY_OPTIONS.findIndex((d) => d.value === startDay);
  const endIdx = WEEK_DAY_OPTIONS.findIndex((d) => d.value === endDay);
  if (startIdx === -1 || endIdx === -1) return "";
  const diff = ((endIdx - startIdx) % 7 + 7) % 7;
  const days = diff === 0 ? 7 : diff + 1;
  return `${days}-day week`;
}

// ─── helpers ──────────────────────────────────────────────────────────────────
async function apiCall(method, path, body) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── component ────────────────────────────────────────────────────────────────
export default function ReportConfigModal({
  config,
  organization,
  userId,
  availableSources = [],
  onSave,
  onDelete,
  onClose,
}) {
  const isCreate = !config;

  const [reportName, setReportName] = useState(config?.reportName ?? "");
  const [intervalType, setIntervalType] = useState(
    config?.intervalType ?? "DAILY"
  );
  const [intervalValue, setIntervalValue] = useState(
    config?.intervalValue ?? 1
  );
  const [weekStartDay, setWeekStartDay] = useState(config?.weekStartDay ?? "MONDAY");
  const [weekEndDay, setWeekEndDay] = useState(config?.weekEndDay ?? "SUNDAY");
  const [active, setActive] = useState(config?.active ?? true);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState(null);

  const selectedInterval = INTERVAL_OPTIONS.find((o) => o.value === intervalType);

  // ── save ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!reportName.trim()) { setError("Report name is required."); return; }

    setSaving(true);
    setError(null);
    try {
      // dataSources is no longer user-selected — send every available source.
      // KPI tiles added later on the dashboard determine what's actually used.
      const resolvedDataSources = config?.dataSources?.length
        ? config.dataSources
        : availableSources;

      const payload = {
        reportName: reportName.trim(),
        organization,
        userId,
        createdBy: userId,
        dataSources: resolvedDataSources,
        intervalType,
        intervalValue: 1,
        weekStartDay,
        weekEndDay,
        active,
      };

      let saved;
      if (isCreate) {
        const res = await apiCall("POST", "/config", payload);
        saved = res.data;
      } else {
        const res = await apiCall("PUT", `/config/${config.id}`, payload);
        saved = res.data;
      }
      onSave(saved);
      onClose();
    } catch (e) {
      setError(e.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [reportName, weekStartDay, weekEndDay, isCreate, config, organization, userId, availableSources, onSave, onClose]);

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!config?.id) return;
    setDeleting(true);
    setError(null);
    try {
      await apiCall("DELETE", `/config/${config.id}`);
      onDelete?.(config.id);
      onClose();
    } catch (e) {
      setError(e.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }, [config, onDelete, onClose]);

  // ── toggle active only (quick toggle) ─────────────────────────────────────
  const handleToggleActive = useCallback(async () => {
    if (isCreate) { setActive((v) => !v); return; }
    const next = !active;
    setActive(next);
    try {
      await apiCall("PATCH", `/config/${config.id}/active?active=${next}`);
    } catch (e) {
      setActive(!next); // revert
      setError(e.message);
    }
  }, [active, isCreate, config]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 32, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {isCreate ? "New Report Schedule" : "Edit Report Schedule"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isCreate
                  ? "Set how often this report should run — you'll pick KPIs next"
                  : `Editing "${config.reportName}"`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-slate-500 text-2xl leading-none mt-0.5"
            >
              ×
            </button>
          </div>

          {/* active toggle */}
          {!isCreate && (
            <button
              onClick={handleToggleActive}
              className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold
                border transition-all
                ${active
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-50 border-slate-200 text-slate-500"
                }`}
            >
              {active
                ? <ToggleRight size={14} className="text-emerald-500" />
                : <ToggleLeft size={14} />}
              {active ? "Active — running on schedule" : "Paused — not running"}
            </button>
          )}
        </div>

        {/* body */}
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto space-y-5">

          {/* report name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Report name
            </label>
            <input
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g. Weekly Compliance Summary"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                text-slate-700 transition-all"
            />
          </div>

          {/* week window */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Week starts on
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEK_DAY_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setWeekStartDay(d.value)}
                  className={`py-2 rounded-lg border-2 text-[11px] font-semibold transition-all
                    ${weekStartDay === d.value
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                      : "border-slate-150 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white"
                    }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Week ends on
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEK_DAY_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setWeekEndDay(d.value)}
                  className={`py-2 rounded-lg border-2 text-[11px] font-semibold transition-all
                    ${weekEndDay === d.value
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                      : "border-slate-150 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white"
                    }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Your week will run {WEEK_DAY_OPTIONS.find((d) => d.value === weekStartDay)?.label}
              {" → "}
              {WEEK_DAY_OPTIONS.find((d) => d.value === weekEndDay)?.label}
              {" · "}
              {weekSpanLabel(weekStartDay, weekEndDay)}. Every weekly chart and date range on the
              dashboard will follow this.
            </p>
          </div>


          {/* hint for create mode */}
          {isCreate && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 text-xs text-indigo-600">
              Once this schedule is created, open it from the sidebar and use{" "}
              <strong>+ Custom Panel</strong> to choose which KPIs to track.
            </div>
          )}

          {/* error */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5 text-xs text-rose-600">
              {error}
            </div>
          )}
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isCreate && (
              confirmDelete ? (
                <>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold
                      hover:bg-rose-600 disabled:opacity-60 transition-colors flex items-center gap-1.5"
                  >
                    {deleting ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Confirm delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold
                      hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                    text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent
                    hover:border-rose-100 transition-all"
                >
                  <Trash2 size={12} /> Delete schedule
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium px-2 py-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold
                hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed
                active:scale-95 transition-all shadow-sm flex items-center gap-2"
            >
              {saving
                ? <RefreshCw size={13} className="animate-spin" />
                : isCreate ? <Plus size={13} /> : <Save size={13} />}
              {isCreate ? "Create schedule" : "Save changes"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}