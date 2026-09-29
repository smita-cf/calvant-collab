/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FilterBar.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-select chips for department, client, and branch filtering.
 * Options are built dynamically from dimensionOptions (from useDashboardData).
 *
 * Props:
 *   dimensionOptions   { departments: [], clients: [], branches: [] }
 *   value              { department: [], client: [], branch: [] }
 *   onChange           (newValue) => void
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";

// ─── chip row ─────────────────────────────────────────────────────────────────
function ChipGroup({
  label,
  options,
  selected,
  onToggle,
  onClearGroup,
  accent,
}) {
  if (!options?.length) return null;

  return (
    <div className="flex items-start gap-2 flex-wrap">
      <span
        className="text-[10px] font-bold uppercase tracking-widest flex-shrink-0 mt-1"
        style={{ color: accent }}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5 flex-1">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all
                ${
                  active
                    ? "border-transparent text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              style={active ? { background: accent } : {}}
            >
              {opt}
            </button>
          );
        })}
        {selected.length > 0 && (
          <button
            onClick={onClearGroup}
            className="px-2 py-1 rounded-full text-[11px] text-slate-400 hover:text-slate-600
              hover:bg-slate-100 transition-all"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function FilterBar({ dimensionOptions, value, onChange }) {
  const [open, setOpen] = useState(false);

  const {
    departments = [],
    clients = [],
    branches = [],
  } = dimensionOptions ?? {};
  const hasAnyOptions =
    departments.length > 0 || clients.length > 0 || branches.length > 0;

  if (!hasAnyOptions) return null;

  const selected = value ?? { department: [], client: [], branch: [] };

  const totalActive =
    (selected.department?.length ?? 0) +
    (selected.client?.length ?? 0) +
    (selected.branch?.length ?? 0);

  const toggle = (group, val) => {
    const current = selected[group] ?? [];
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    onChange({ ...selected, [group]: next });
  };

  const clearGroup = (group) => onChange({ ...selected, [group]: [] });

  const clearAll = () => onChange({ department: [], client: [], branch: [] });

  return (
    <div className="relative self-start">
      {/* trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
          border transition-all duration-200
          ${
            open || totalActive > 0
              ? "bg-indigo-50 border-indigo-200 text-indigo-700"
              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
          }`}
      >
        <SlidersHorizontal size={12} />
        Filters
        {totalActive > 0 && (
          <span
            className="ml-0.5 bg-indigo-600 text-white rounded-full w-4 h-4
            flex items-center justify-center text-[10px] font-bold"
          >
            {totalActive}
          </span>
        )}
        <ChevronDown
          size={11}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* clear all badge (when filters active + panel closed) */}
      {totalActive > 0 && !open && (
        <button
          onClick={clearAll}
          className="ml-1 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5
            px-1.5 py-1 rounded-lg hover:bg-slate-100 transition-all inline-flex"
        >
          <X size={10} /> Clear all
        </button>
      )}

      {/* dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed right-6 z-[200] bg-white rounded-2xl shadow-2xl
  border border-slate-100 p-4 min-w-[320px] max-w-[420px] space-y-3
  max-h-[70vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Filter data
              </p>
              {totalActive > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                >
                  Clear all
                </button>
              )}
            </div>

            <ChipGroup
              label="Department"
              options={departments}
              selected={selected.department ?? []}
              onToggle={(v) => toggle("department", v)}
              onClearGroup={() => clearGroup("department")}
              accent="#6366f1"
            />
            <ChipGroup
              label="Client"
              options={clients}
              selected={selected.client ?? []}
              onToggle={(v) => toggle("client", v)}
              onClearGroup={() => clearGroup("client")}
              accent="#10b981"
            />
            <ChipGroup
              label="Branch"
              options={branches}
              selected={selected.branch ?? []}
              onToggle={(v) => toggle("branch", v)}
              onClearGroup={() => clearGroup("branch")}
              accent="#f59e0b"
            />

            <button
              onClick={() => setOpen(false)}
              className="w-full mt-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs
                font-semibold hover:bg-slate-200 transition-colors"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
