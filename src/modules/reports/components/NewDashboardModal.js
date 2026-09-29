/**
 * ─────────────────────────────────────────────────────────────────────────────
 * NewDashboardModal.jsx  (v2 — simplified, no run-schedule)
 * ─────────────────────────────────────────────────────────────────────────────
 * Step 1: Name the dashboard
 * Step 2: Choose sharing (Me / All / Custom users)
 *
 * The backend always uses DAILY refresh internally — no need to surface
 * intervalType / intervalValue here. The dashboard is always live-fetching
 * the last X days of data from upstream services.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Globe, Users, RefreshCw, X, Check, UserPlus,
} from "lucide-react";

const BASE_URL = "https://api.calvant.com/reports-service/api/reports";
// const BASE_URL ="http://localhost:8085/api/reports"
function getToken() {
  try { return sessionStorage.getItem("token") || localStorage.getItem("token") || ""; }
  catch { return ""; }
}

async function apiPost(path, body) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

function SharingCard({ icon: Icon, title, description, color, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all ${
        selected
          ? `border-${color}-400 bg-${color}-50`
          : "border-slate-150 bg-slate-50 hover:border-slate-200 hover:bg-white"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        selected ? `bg-${color}-100` : "bg-white border border-slate-200"
      }`}>
        <Icon size={16} className={selected ? `text-${color}-600` : "text-slate-400"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${selected ? `text-${color}-800` : "text-slate-700"}`}>
          {title}
        </p>
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

const SHARING_OPTIONS = [
  { key: "me",     icon: Lock,  title: "Just me",      description: "Only you can view and edit this dashboard",          color: "indigo"  },
  { key: "all",    icon: Globe, title: "All members",   description: "Everyone in your organization can view this dashboard", color: "emerald" },
  { key: "custom", icon: Users, title: "Custom",        description: "Choose specific people or teams to share with",      color: "violet"  },
];

export default function NewDashboardModal({
  organization,
  userId,
  availableSources = [],
  onSave,
  onClose,
}) {
  const [step,         setStep]         = useState(0);
  const [name,         setName]         = useState("");
  const [sharing,      setSharing]      = useState("me");
  const [customEmails, setCustomEmails] = useState("");
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState(null);

  const nameValid = name.trim().length > 0;

  const handleCreate = useCallback(async () => {
    if (!nameValid) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        reportName: name.trim(),
        organization,
        userId,
        createdBy: userId,
        dataSources: availableSources,
        // Internal refresh cadence — not exposed to the user.
        // The backend always fetches live data for the last X days,
        // so this just controls how often the DB record is refreshed.
        intervalType: "DAILY",
        intervalValue: 1,
        active: true,
        sharing,
        sharedWith: sharing === "custom"
          ? customEmails.split(",").map((e) => e.trim()).filter(Boolean)
          : [],
      };
      const res = await apiPost("/config", payload);
      onSave(res.data ?? res);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to create dashboard.");
    } finally {
      setSaving(false);
    }
  }, [name, organization, userId, availableSources, sharing, customEmails, nameValid, onSave, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 36, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">New Dashboard</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {step === 0 ? "Give your dashboard a name" : "Choose who can see it"}
              </p>
            </div>
            <button onClick={onClose} className="text-slate-300 hover:text-slate-500 p-1">
              <X size={16} />
            </button>
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 mt-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < step  ? "bg-indigo-500 w-4" :
                  i === step ? "bg-indigo-400 w-6" :
                  "bg-slate-200 w-4"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">

            {/* Step 0: Name */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Dashboard name
                  </label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && nameValid) setStep(1); }}
                    placeholder="e.g. Weekly Compliance Overview"
                    className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm font-medium
                      focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                      text-slate-800 transition-all placeholder:text-slate-300"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  You can add Components and configure KPIs after creating the dashboard.
                  Data is always fetched live so you'll see the latest figures when you open it.
                </p>
              </motion.div>
            )}

            {/* Step 1: Sharing */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                {SHARING_OPTIONS.map((opt) => (
                  <SharingCard
                    key={opt.key}
                    icon={opt.icon}
                    title={opt.title}
                    description={opt.description}
                    color={opt.color}
                    selected={sharing === opt.key}
                    onClick={() => setSharing(opt.key)}
                  />
                ))}

                <AnimatePresence>
                  {sharing === "custom" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Share with (comma-separated emails)
                        </label>
                        <div className="relative">
                          <UserPlus size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            value={customEmails}
                            onChange={(e) => setCustomEmails(e.target.value)}
                            placeholder="alice@acme.com, bob@acme.com"
                            className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs
                              focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400
                              text-slate-700 transition-all"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-3 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5 text-xs text-rose-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => { if (step === 0) onClose(); else setStep(0); }}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium px-2 py-1"
          >
            {step === 0 ? "Cancel" : "← Back"}
          </button>

          {step === 0 ? (
            <button
              disabled={!nameValid}
              onClick={() => setStep(1)}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold
                hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed
                active:scale-95 transition-all shadow-sm"
            >
              Next →
            </button>
          ) : (
            <button
              disabled={saving}
              onClick={handleCreate}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold
                hover:bg-emerald-700 disabled:opacity-60 active:scale-95 transition-all shadow-sm
                flex items-center gap-2"
            >
              {saving
                ? <RefreshCw size={13} className="animate-spin" />
                : <Check size={13} />}
              Create Dashboard
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
