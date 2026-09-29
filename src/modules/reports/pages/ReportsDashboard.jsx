/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ReportsDashboard.jsx  (v7 — Bigin-style view switcher dropdown)
 * ─────────────────────────────────────────────────────────────────────────────
 * Key changes from v6:
 * 1. View switcher dropdown in the header (like Bigin's dashboard selector):
 * - Shows current view name + sharing badge as the trigger
 * - Dropdown lists all views with their sharing info
 * - "+ New View" at the bottom of the dropdown list
 * - Search/filter within the dropdown
 * 2. Active view tracked via activeViewId; only that view's panels are
 * passed to DashboardEngine (single-view rendering).
 * 3. "Add View" button removed from header — the dropdown is the entry
 * point for both switching and creating views.
 * 4. Persistent notification dots replace toast alerts for new panels.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  HelpCircle,
  Plus,
  X,
  Check,
  Lock,
  Globe,
  Users,
  UserPlus,
  ChevronDown,
  Search,
  Eye,
  Trash2,
  Settings,          // ← add this
} from "lucide-react";

import DashboardEngine from "../components/DashboardEngine";
import ReportConfigModal from "../components/ReportConfigModal";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { useDashboardExport } from "../../../hooks/useDashboardExport";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE_URL = "https://api.calvant.com/reports-service/api/reports";
const INTERVAL_TYPE_TO_KEY = {
  DAILY: "7d",
  WEEKLY: "7d",
  MONTHLY: "90d",
  QUARTERLY: "90d",
  YEARLY: "custom",
  HOURLY: "7d",
  CUSTOM_DAYS: "7d",
  CUSTOM_MONTHS: "90d",
  CUSTOM_YEARS: "custom",
};

const MAX_VIEWS_PER_CONFIG = 2;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getDefaultOrg() {
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

function getToken() {
  try {
    return (
      sessionStorage.getItem("token") || localStorage.getItem("token") || ""
    );
  } catch {
    return "";
  }
}

// Mirrors backend WeekRangeUtil — used as a fallback so the badge still shows
// something sensible even before primaryConfig.weekRangeLabel comes back from
// the API (or for configs saved before that field existed).
const WEEK_DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
function clientWeekRangeLabel(weekStartDay, weekEndDay) {
  try {
    const startIdx = WEEK_DAY_ORDER.indexOf(weekStartDay || "MONDAY");
    const endIdx = WEEK_DAY_ORDER.indexOf(weekEndDay || "SUNDAY");
    if (startIdx === -1) return "";
    const today = new Date();
    const todayIdx = (today.getDay() + 6) % 7;
    const diffToStart = (todayIdx - startIdx + 7) % 7;
    const start = new Date(today);
    start.setDate(start.getDate() - diffToStart);

    let span = endIdx === -1 ? 6 : ((endIdx - startIdx) % 7 + 7) % 7;
    if (span === 0) span = 6;

    const end = new Date(start);
    end.setDate(end.getDate() + span);
    const fmt = (d) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    return `${fmt(start)} - ${fmt(end)}`;
  } catch {
    return "";
  }
}

async function fetchOrCreatePrimaryConfig(organization, userId, token) {
  if (!organization) {
    return { ok: false, reason: "NO_ORG", cfg: null };
  }
  try {
    const qs = new URLSearchParams({ organization });
    if (userId) qs.set("userId", userId);
    const res = await fetch(`${BASE_URL}/config/primary?${qs.toString()}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) {
      return { ok: false, reason: `HTTP_${res.status}`, cfg: null };
    }
    const json = await res.json();
    const cfg = json?.data ?? null;
    return {
      ok: true,
      reason: null,
      cfg: cfg ? { ...cfg, id: cfg.id ?? cfg._id } : null,
    };
  } catch (e) {
    return { ok: false, reason: "NETWORK_ERROR", cfg: null };
  }
}

async function fetchScheduleViews(scheduleId, userEmail, token) {
  if (!scheduleId) return { views: [], totalCount: 0 };
  try {
    const qs = new URLSearchParams();
    if (userEmail) qs.set("userEmail", userEmail);
    const res = await fetch(`${BASE_URL}/config/${scheduleId}/views?${qs.toString()}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) return { views: [], totalCount: 0 };
    const json = await res.json();
    const data = json?.data ?? {};
    return {
      views: Array.isArray(data.views) ? data.views : [],
      totalCount: data.totalCount ?? 0,
    };
  } catch {
    return { views: [], totalCount: 0 };
  }
}

async function saveScheduleViewsRemote(scheduleId, organization, views, token) {
  if (!scheduleId) return { ok: false, status: "NO_CONFIG" };
  try {
    const res = await fetch(
      `${BASE_URL}/config/${scheduleId}/views?organization=${encodeURIComponent(organization)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(views),
      },
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, status: json.status || "ERROR", message: json.message };
    }
    return { ok: true, data: json.data ?? views };
  } catch (e) {
    return { ok: false, status: "NETWORK_ERROR", message: e?.message };
  }
}

async function generateNowRemote(configId, token) {
  if (!configId) return { ok: false, status: "NO_CONFIG" };
  try {
    const res = await fetch(`${BASE_URL}/generate/${configId}`, {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: json.status || "ERROR", message: json.message };
    return { ok: true, data: json.data };
  } catch (e) {
    return { ok: false, status: "NETWORK_ERROR", message: e?.message };
  }
}

async function deleteScheduleViewRemote(scheduleId, viewId, organization, token) {
  if (!scheduleId || !viewId) return { ok: false, status: "NO_CONFIG" };
  try {
    const res = await fetch(
      `${BASE_URL}/config/${scheduleId}/views/${viewId}?organization=${encodeURIComponent(organization)}`,
      {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      },
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: json.status || "ERROR", message: json.message };
    return { ok: true, data: json.data };
  } catch (e) {
    return { ok: false, status: "NETWORK_ERROR", message: e?.message };
  }
}

// ─── SHARING BADGE ────────────────────────────────────────────────────────────
function SharingBadge({ view, compact = false }) {
  if (!view) return null;
  const { sharing, sharedWith = [] } = view;

  if (sharing === "me") {
    return (
      <span className={`inline-flex items-center gap-1 ${compact ? "text-[10px]" : "text-xs"} text-slate-400`}>
        <Lock size={compact ? 9 : 10} />
        Only me
      </span>
    );
  }
  if (sharing === "all") {
    return (
      <span className={`inline-flex items-center gap-1 ${compact ? "text-[10px]" : "text-xs"} text-emerald-600`}>
        <Globe size={compact ? 9 : 10} />
        All members
      </span>
    );
  }
  if (sharing === "custom") {
    if (!sharedWith || sharedWith.length === 0) {
      return (
        <span className={`inline-flex items-center gap-1 ${compact ? "text-[10px]" : "text-xs"} text-violet-500`}>
          <Users size={compact ? 9 : 10} />
          Custom
        </span>
      );
    }
    const first = sharedWith[0];
    const rest = sharedWith.length - 1;
    return (
      <span className={`inline-flex items-center gap-1 ${compact ? "text-[10px]" : "text-xs"} text-violet-500`}>
        <Users size={compact ? 9 : 10} />
        {first}{rest > 0 ? ` +${rest} more` : ""}
      </span>
    );
  }
  return null;
}

// ─── VIEW SWITCHER DROPDOWN ───────────────────────────────────────────────────
function ViewSwitcherDropdown({
  views = [],
  activeViewId,
  onSelect,
  onNewView,
  onDeleteView,
  deletingViewId = null,
  disabled = false,
  totalViewCount
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const ref = useRef(null);
  const searchRef = useRef(null);

  const activeView = views.find((v) => v.id === activeViewId) ?? views[0] ?? null;

  const filtered = useMemo(() => {
    if (!search.trim()) return views;
    const q = search.toLowerCase();
    return views.filter((v) => (v.label ?? "").toLowerCase().includes(q));
  }, [views, search]);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
        setConfirmDeleteId(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 60);
    }
  }, [open]);

  const handleSelect = (viewId) => {
    onSelect(viewId);
    setOpen(false);
    setSearch("");
    setConfirmDeleteId(null);
  };

  const handleNew = () => {
    setOpen(false);
    setSearch("");
    setConfirmDeleteId(null);
    onNewView();
  };

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-xl border transition-all
          ${open
            ? "bg-white border-indigo-300 shadow-md"
            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
          }
          disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] max-w-[260px]
        `}
      >
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
            {activeView?.label ?? "Select view"}
          </p>
          {activeView && (
            <div className="mt-0.5">
              <SharingBadge view={activeView} compact />
            </div>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.13 }}
            className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
          >
            <div className="px-3 pt-3 pb-2">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search views…"
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 focus:bg-white transition-all placeholder:text-slate-300 text-slate-700"
                />
              </div>
            </div>

            <div className="px-2 pb-1 max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-slate-400">
                  No views match "{search}"
                </div>
              ) : (
                filtered.map((view) => {
                  const isActive = view.id === activeViewId;
                  const isConfirming = confirmDeleteId === view.id;
                  const isDeleting = deletingViewId === view.id;
                  return (
                    <div
                      key={view.id}
                      className={`
                        group w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all
                        ${isActive ? "bg-indigo-50" : "hover:bg-slate-50"}
                      `}
                    >
                      <button
                        onClick={() => handleSelect(view.id)}
                        className={`flex-1 flex items-center gap-3 min-w-0 text-left ${isActive ? "text-indigo-700" : "text-slate-700"}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? "bg-indigo-100" : "bg-slate-100"}`}>
                          <Eye size={13} className={isActive ? "text-indigo-500" : "text-slate-400"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isActive ? "text-indigo-700" : "text-slate-700"}`}>
                            {view.label || "Untitled"}
                          </p>
                          <div className="mt-0.5">
                            <SharingBadge view={view} compact />
                          </div>
                        </div>
                        {isActive && (
                          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                      </button>
                      {onDeleteView && (
                        isConfirming ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                              onDeleteView(view.id);
                            }}
                            disabled={isDeleting}
                            className="flex-shrink-0 px-2 py-1.5 rounded-lg bg-rose-500 text-white text-[10px] font-bold hover:bg-rose-600 disabled:opacity-60 transition-colors"
                          >
                            {isDeleting ? "…" : "Confirm"}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(view.id); }}
                            title="Delete view"
                            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        )
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-slate-100 p-2">
              <button
                onClick={handleNew}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                  <Plus size={13} className="text-indigo-500" />
                </div>
                <span className="text-xs font-semibold text-indigo-600">
                  New Dashboard
                </span>
                {totalViewCount > 0 && (
                  <span className="ml-auto text-[10px] text-slate-400 font-medium">
                    {totalViewCount}/{MAX_VIEWS_PER_CONFIG}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SHARING OPTIONS ───────────────────────────────────
const SHARING_OPTIONS = [
  { key: "me", icon: Lock, title: "Just me", description: "Only you can see this view", color: "indigo" },
  { key: "all", icon: Globe, title: "All members", description: "Everyone in your organization can see this view", color: "emerald" },
  { key: "custom", icon: Users, title: "Custom", description: "Choose specific people to share with", color: "violet" },
];

function SharingCard({ icon: Icon, title, description, color, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all ${
        selected ? `border-${color}-400 bg-${color}-50` : "border-slate-150 bg-slate-50 hover:border-slate-200 hover:bg-white"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? `bg-${color}-100` : "bg-white border border-slate-200"}`}>
        <Icon size={16} className={selected ? `text-${color}-600` : "text-slate-400"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${selected ? `text-${color}-800` : "text-slate-700"}`}>{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{description}</p>
      </div>
      {selected && (
        <div className={`w-5 h-5 rounded-full bg-${color}-500 flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Check size={11} className="text-white" />
        </div>
      )}
    </button>
  );
}

function buildNewView({ label, sharing, sharedWith, createdBy }) {
  return {
    id: `view_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label,
    sharing,
    sharedWith: sharing === "custom" ? sharedWith : [],
    createdBy,
    panels: [],
  };
}

// ─── ADD VIEW MODAL ───────────────────────────────────────────────────────────
function AddViewModal({ createdBy, onCreate, onClose }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [sharing, setSharing] = useState("all");
  const [customEmails, setCustomEmails] = useState("");
  const [saving, setSaving] = useState(false);

  const nameValid = name.trim().length > 0;

  const handleCreate = useCallback(async () => {
    if (!nameValid) return;
    setSaving(true);
    try {
      const view = buildNewView({
        label: name.trim(),
        sharing,
        sharedWith: customEmails.split(",").map((e) => e.trim()).filter(Boolean),
        createdBy,
      });
      await onCreate(view);
      onClose();
    } finally {
      setSaving(false);
    }
  }, [name, sharing, customEmails, createdBy, nameValid, onCreate, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 36, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">New Dashboard</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {step === 0 ? "Give your view a name" : "Choose who can see it"}
              </p>
            </div>
            <button onClick={onClose} className="text-slate-300 hover:text-slate-500 p-1"><X size={16} /></button>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            {[0, 1].map((i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < step ? "bg-indigo-500 w-4" : i === step ? "bg-indigo-400 w-6" : "bg-slate-200 w-4"}`} />
            ))}
          </div>
        </div>

        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">View name</label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && nameValid) setStep(1); }}
                    placeholder="e.g. Risk Overview"
                    className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 text-slate-800 transition-all placeholder:text-slate-300"
                  />
                </div>
                <p className="text-[11px] text-slate-400">You can add components and arrange the layout after creating the view.</p>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }} className="space-y-3">
                {SHARING_OPTIONS.map((opt) => (
                  <SharingCard key={opt.key} icon={opt.icon} title={opt.title} description={opt.description} color={opt.color} selected={sharing === opt.key} onClick={() => setSharing(opt.key)} />
                ))}
                <AnimatePresence>
                  {sharing === "custom" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="pt-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Share with (comma-separated emails)</label>
                        <div className="relative">
                          <UserPlus size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            value={customEmails}
                            onChange={(e) => setCustomEmails(e.target.value)}
                            placeholder="alice@acme.com, bob@acme.com"
                            className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 text-slate-700 transition-all"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button onClick={() => (step === 0 ? onClose() : setStep(0))} className="text-sm text-slate-500 hover:text-slate-700 font-medium px-2 py-1">
            {step === 0 ? "Cancel" : "← Back"}
          </button>
          {step === 0 ? (
            <button disabled={!nameValid} onClick={() => setStep(1)} className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm">
              Next →
            </button>
          ) : (
            <button disabled={saving} onClick={handleCreate} className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 active:scale-95 transition-all shadow-sm flex items-center gap-2">
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
              Create Dashboard
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── VIEW LIMIT MODAL ─────────────────────────────────────────────────────────
function ViewLimitModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
            <HelpCircle size={20} className="text-amber-500" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">View limit reached</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            You can have up to {MAX_VIEWS_PER_CONFIG} dashboards. To add more, please contact your admin.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all">
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-12 text-center">
      <RefreshCw size={22} className="text-indigo-300 animate-spin" />
      <p className="text-sm text-slate-400">Loading your dashboard…</p>
    </div>
  );
}

function ErrorState({ reason, onRetry }) {
  const message =
    reason === "NO_ORG"
      ? "We couldn't determine your organization. Try signing in again."
      : "We couldn't load your dashboard. This is usually a temporary connection issue.";

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-12 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
        <WifiOff size={20} className="text-rose-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-600">{message}</p>
        <p className="text-xs text-slate-400 mt-1">Check your connection and try again.</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold text-indigo-600 transition-colors"
      >
        <RefreshCw size={13} /> Retry
      </motion.button>
    </div>
  );
}

// ─── NEW-PANEL TRACKING ─────────────────────────────────────────────────────────
function diffNewPanelIds(previousViews, nextViews) {
  const prevMap = new Map(previousViews.map((v) => [v.id, v]));
  const added = [];
  for (const view of nextViews) {
    const prevView = prevMap.get(view.id);
    if (!prevView) continue;
    const prevIds = new Set((prevView.panels ?? []).map((p) => p.id));
    for (const panel of view.panels ?? []) {
      if (!prevIds.has(panel.id)) added.push(panel.id);
    }
  }
  return added;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ReportsDashboard() {
  const [organization] = useState(getDefaultOrg);
  const [user] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("user") || "{}"); }
    catch { return {}; }
  });

  const primaryRole = useMemo(() => {
    if (!user) return "";
    const roles = Array.isArray(user.role) ? user.role : user.role ? [user.role] : [];
    const priority = ["root","super_admin","ciso","dpo","aio","ai_officer","privacy_officer","audit_manager","risk_manager","admin","department_user"];
    return priority.find((r) => roles.map((x) => x.toLowerCase()).includes(r)) || roles[0] || "";
  }, [user]);

  const [primaryConfig, setPrimaryConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(null);
  const [configBootstrapped, setConfigBootstrapped] = useState(false);
  const [availableSources, setAvailableSources] = useState([]);
  const [totalViewCount, setTotalViewCount] = useState(0);

  const [customViews, setCustomViews] = useState([]);
  const [activeViewId, setActiveViewId] = useState(null);
  const [viewsLoading, setViewsLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showAddViewModal, setShowAddViewModal] = useState(false);

  const [interval, setIntervalKey] = useState("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const comparisonFilters = useMemo(() => ({ enabled: false, from: "", to: "" }), []);
  const dimensionFilters = useMemo(() => ({ department: [], client: [], branch: [] }), []);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => { setHasMounted(true); }, []);
  const exportAreaRef = useRef(null);

  const activeView = useMemo(
    () => customViews.find((v) => v.id === activeViewId) ?? customViews[0] ?? null,
    [customViews, activeViewId],
  );

  const syntheticConfig = useMemo(() => {
  if (!primaryConfig) return null;
  return {
    id: primaryConfig.id,
    label: primaryConfig.reportName,
    dataSources: primaryConfig.dataSources ?? [],
    dataModule: null,
    weekStartDay: primaryConfig.weekStartDay ?? "MONDAY",   // ← add this
    weekEndDay: primaryConfig.weekEndDay ?? "SUNDAY",
    views: [],
  };
}, [primaryConfig]);

  const filters = useMemo(() => ({ interval, customFrom, customTo }), [interval, customFrom, customTo]);
  const hasActiveDashboard = !!primaryConfig;

  // ── "new panel" markers — a dot stays on a panel until it's hovered ───────
  const newPanelsStorageKey = primaryConfig?.id ? `calvant_new_panels_${primaryConfig.id}` : null;
  const [newPanelIds, setNewPanelIds] = useState(() => new Set());

  useEffect(() => {
    if (!newPanelsStorageKey) return;
    try {
      const stored = JSON.parse(localStorage.getItem(newPanelsStorageKey) || "[]");
      setNewPanelIds(new Set(stored));
    } catch {
      setNewPanelIds(new Set());
    }
  }, [newPanelsStorageKey]);

  const markPanelSeen = useCallback((panelId) => {
    setNewPanelIds((prev) => {
      if (!prev.has(panelId)) return prev;
      const next = new Set(prev);
      next.delete(panelId);
      if (newPanelsStorageKey) {
        try { localStorage.setItem(newPanelsStorageKey, JSON.stringify([...next])); } catch {}
      }
      return next;
    });
  }, [newPanelsStorageKey]);

  const handleCustomViewsChange = useCallback(
    async (views) => {
      const previous = customViews;
      setCustomViews(views);

      const result = await saveScheduleViewsRemote(
        primaryConfig?.id, organization, views, getToken(),
      );
      if (result.ok) {
        setTotalViewCount(views.length);
        const addedIds = diffNewPanelIds(previous, views);
        if (addedIds.length) {
          setNewPanelIds((prev) => {
            const next = new Set(prev);
            addedIds.forEach((id) => next.add(id));
            if (newPanelsStorageKey) {
              try { localStorage.setItem(newPanelsStorageKey, JSON.stringify([...next])); } catch {}
            }
            return next;
          });
        }
      }
      if (!result.ok) {
        if (result.status === "VIEW_LIMIT_REACHED") {
          setCustomViews(previous);
          setShowLimitModal(true);
        }
      }
    },
    [primaryConfig, organization, customViews, newPanelsStorageKey],
  );

  const handleNewViewClick = useCallback(() => {
    if (totalViewCount >= MAX_VIEWS_PER_CONFIG) {
      setShowLimitModal(true);
      return;
    }
    setShowAddViewModal(true);
  }, [totalViewCount]);

  const handleCreateView = useCallback(
    async (newView) => {
      const updated = [...customViews, newView];
      await handleCustomViewsChange(updated);
      setActiveViewId(newView.id);
    },
    [customViews, handleCustomViewsChange],
  );

  const [deletingViewId, setDeletingViewId] = useState(null);
  const handleDeleteView = useCallback(
    async (viewId) => {
      setDeletingViewId(viewId);
      const result = await deleteScheduleViewRemote(primaryConfig?.id, viewId, organization, getToken());
      setDeletingViewId(null);

      if (!result.ok) return;

      const remaining = customViews.filter((v) => v.id !== viewId);
      setCustomViews(remaining);
      setTotalViewCount(remaining.length);

      if (activeViewId === viewId) {
        setActiveViewId(remaining[0]?.id ?? null);
      }
    },
    [primaryConfig, organization, customViews, activeViewId],
  );

  const loadPrimaryConfig = useCallback(async () => {
    setConfigLoading(true);
    setConfigError(null);

    const { ok, reason, cfg } = await fetchOrCreatePrimaryConfig(
      organization,
      user?.id || user?.userId,
      getToken(),
    );

    setPrimaryConfig(cfg);
    setConfigError(ok ? null : reason);
    setConfigLoading(false);

    if (cfg?.id) {
      generateNowRemote(cfg.id, getToken());
      setViewsLoading(true);
      const { views, totalCount } = await fetchScheduleViews(cfg.id, user?.email || "", getToken());
      setCustomViews(views);
      setTotalViewCount(totalCount);
      if (views.length > 0) setActiveViewId(views[0].id);
      setViewsLoading(false);
    }

    const mapped = INTERVAL_TYPE_TO_KEY[cfg?.intervalType] ?? "7d";
    setIntervalKey(mapped);
  }, [organization, user]);

  useEffect(() => {
    if (configBootstrapped) return;
    setConfigBootstrapped(true);

    if (!organization) {
      // No org resolved from session — surface it instead of spinning forever.
      setConfigLoading(false);
      setConfigError("NO_ORG");
      return;
    }
    loadPrimaryConfig();
  }, [configBootstrapped, organization, loadPrimaryConfig]);

  const handleRetryConfig = useCallback(() => {
    loadPrimaryConfig();
  }, [loadPrimaryConfig]);

  const fetchAvailableSources = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/sources`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error("no sources");
      const json = await res.json();
      const sources = Array.isArray(json.data) ? json.data : [];
      if (sources.length) setAvailableSources(sources);
      else throw new Error("empty");
    } catch {
      setAvailableSources(["risks", "audit", "tasks", "dpia", "documents", "aiia"]);
    }
  }, []);

  useEffect(() => { fetchAvailableSources(); }, [fetchAvailableSources]);

  useEffect(() => {
    try {
      Object.keys(localStorage).filter((k) => k.startsWith("calvant_schedule_views_")).forEach((k) => localStorage.removeItem(k));
    } catch {}
  }, []);

  const { results, comparisonResults, getComparisonForWindow, getRiskComparisonForWindow, getAuditComparisonForWindow, getTaskComparisonForWindow, getResultsForWindow, getKpiResultsForWindow, getRiskPeriodSeries, getRiskSnapshot, riskDimensionOptions, getAuditPeriodSeries, getAuditSnapshot, auditDimensionOptions, getTaskPeriodSeries, getTaskSnapshot, taskDimensionOptions, dimensionOptions, loading, error, refetch, lastFetched, online, orgId } =
    useDashboardData(syntheticConfig, organization, filters, comparisonFilters, dimensionFilters);
  const { exportPDF } =
    useDashboardExport({ config: syntheticConfig, results, comparisonResults });

  const handleConfigSaved = (saved) => {
    setPrimaryConfig((prev) => ({ ...prev, ...saved, id: saved.id ?? saved._id ?? prev?.id }));
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-lg border-b border-slate-100/70 px-5 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
              <BarChart3 size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-500 hidden sm:block">Reports</span>
          </div>

          <div className="w-px h-6 bg-slate-200 flex-shrink-0 hidden sm:block" />

          {hasActiveDashboard && (
            <ViewSwitcherDropdown
              views={customViews}
              activeViewId={activeViewId ?? customViews[0]?.id}
              onSelect={setActiveViewId}
              onNewView={handleNewViewClick}
              onDeleteView={handleDeleteView}
              deletingViewId={deletingViewId}
              disabled={viewsLoading}
              totalViewCount={totalViewCount}
            />
          )}
          {hasActiveDashboard && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowConfigModal(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 flex-shrink-0"
              title="Edit schedule & week settings"
            >
              <Settings size={13} className="text-slate-500" />
            </motion.button>
          )}
          {!hasActiveDashboard && !configLoading && (
            <span className="text-sm font-semibold text-slate-400">
              {configError ? "Couldn't load dashboard" : "No dashboard"}
            </span>
          )}

          {hasActiveDashboard && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border
                border-indigo-100 text-indigo-600 text-[11px] font-semibold flex-shrink-0"
              title={`Week starts ${primaryConfig?.weekStartDay ?? "MONDAY"}`}
            >
              {primaryConfig?.weekRangeLabel || clientWeekRangeLabel(primaryConfig?.weekStartDay, primaryConfig?.weekEndDay)}
            </span>
          )}

          <div className="flex-1" />

          <div className="flex items-center gap-2 flex-wrap">
            {lastFetched && (
              <span className="text-xs text-slate-400 hidden lg:block">{lastFetched.toLocaleTimeString()}</span>
            )}

            <motion.button
              onClick={refetch}
              disabled={loading || !hasActiveDashboard}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 disabled:opacity-40"
              title="Refresh data"
            >
              <RefreshCw size={13} className="text-slate-500" style={loading ? { animation: "spin 1s linear infinite" } : {}} />
            </motion.button>

            {hasActiveDashboard && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => exportPDF(exportAreaRef)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-600 transition-colors"
                title="Download PDF"
              >
                <Download size={13} /> Download PDF
              </motion.button>
            )}

            <span className="text-xs font-bold px-2.5 py-1.5 rounded-full bg-violet-50 text-violet-700 hidden md:block">
              {user?.name || "User"}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 overflow-y-auto flex flex-col">
        {configLoading ? (
          <LoadingState />
        ) : !primaryConfig ? (
          <ErrorState reason={configError} onRetry={handleRetryConfig} />
        ) : (
          <div ref={exportAreaRef} className="pb-4">
            <motion.div
              initial={hasMounted ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <DashboardEngine
                dashboardName={activeView?.label ?? primaryConfig.reportName}
                customViews={customViews}
                activeViewId={activeViewId ?? customViews[0]?.id}
                onCustomViewsChange={handleCustomViewsChange}
                results={results}
                comparisonResults={comparisonResults}
                getComparisonForWindow={getComparisonForWindow}
                getRiskComparisonForWindow={getRiskComparisonForWindow}
                getAuditComparisonForWindow={getAuditComparisonForWindow}
                getTaskComparisonForWindow={getTaskComparisonForWindow}
                getResultsForWindow={getResultsForWindow}
                getKpiResultsForWindow={getKpiResultsForWindow}
                getRiskPeriodSeries={getRiskPeriodSeries}
                getRiskSnapshot={getRiskSnapshot}
                riskDimensionOptions={riskDimensionOptions}
                getAuditPeriodSeries={getAuditPeriodSeries}
                getAuditSnapshot={getAuditSnapshot}
                auditDimensionOptions={auditDimensionOptions}
                getTaskPeriodSeries={getTaskPeriodSeries}
                getTaskSnapshot={getTaskSnapshot}
                taskDimensionOptions={taskDimensionOptions}
                dimensionOptions={dimensionOptions}
                loading={loading}
                viewsLoading={viewsLoading}
                error={error}
                userRole={primaryRole}
                orgId={organization}
                newPanelIds={newPanelIds}
                onPanelSeen={markPanelSeen}
              />
            </motion.div>
          </div>
        )}
      </main>

      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-100/60 px-5 py-3">
        <p className="text-xs text-slate-400 text-center">
          © {new Date().getFullYear()} CalVant · Reports ·{" "}
          {totalViewCount}/{MAX_VIEWS_PER_CONFIG} views
        </p>
      </footer>

      <AnimatePresence>
        {showConfigModal && (
          <ReportConfigModal
            config={primaryConfig}
            organization={organization}
            userId={user?.id || user?.userId || ""}
            availableSources={availableSources.length ? availableSources : ["risks", "audit", "tasks", "dpia", "documents", "aiia"]}
            onSave={(saved) => { handleConfigSaved(saved); setShowConfigModal(false); }}
            onClose={() => setShowConfigModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddViewModal && (
          <AddViewModal
            createdBy={user?.email || ""}
            onCreate={handleCreateView}
            onClose={() => setShowAddViewModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLimitModal && (
          <ViewLimitModal onClose={() => setShowLimitModal(false)} />
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}