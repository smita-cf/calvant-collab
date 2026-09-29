/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ViewManagerModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the lifecycle of custom dashboard views:
 *   • Create a new empty view
 *   • Rename an existing view
 *   • Delete a view (with confirmation)
 *
 * Props:
 *   views       – current custom views array [{ id, label, panels }]
 *   onSave      – (updatedViews) => void
 *   onClose     – () => void
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Pencil, Plus, Check, X } from "lucide-react";

export default function ViewManagerModal({ views = [], onSave, onClose }) {
  const [localViews, setLocalViews] = useState(
    views.map((v) => ({ ...v }))
  );
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [newLabel, setNewLabel] = useState("");
  const [showNew, setShowNew] = useState(false);

  // ── add view ────────────────────────────────────────────────────────────
  const handleAdd = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    const id = `custom_view_${Date.now()}`;
    setLocalViews((prev) => [...prev, { id, label: trimmed, panels: [] }]);
    setNewLabel("");
    setShowNew(false);
  };

  // ── start rename ─────────────────────────────────────────────────────────
  const startEdit = (view) => {
    setEditingId(view.id);
    setEditLabel(view.label);
    setDeletingId(null);
  };

  // ── confirm rename ────────────────────────────────────────────────────────
  const confirmEdit = () => {
    const trimmed = editLabel.trim();
    if (!trimmed) return;
    setLocalViews((prev) =>
      prev.map((v) => (v.id === editingId ? { ...v, label: trimmed } : v))
    );
    setEditingId(null);
  };

  // ── delete ────────────────────────────────────────────────────────────────
  const confirmDelete = (id) => {
    setLocalViews((prev) => prev.filter((v) => v.id !== id));
    setDeletingId(null);
  };

  const hasDirty =
    JSON.stringify(localViews) !== JSON.stringify(views);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 32, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Manage Views</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Create, rename, or delete custom dashboard views
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-4 max-h-[55vh] overflow-y-auto space-y-2">
          {localViews.length === 0 && !showNew && (
            <p className="text-sm text-slate-400 text-center py-6 italic">
              No custom views yet. Create one below.
            </p>
          )}

          <AnimatePresence>
            {localViews.map((view) => (
              <motion.div
                key={view.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/60 group"
              >
                {editingId === view.id ? (
                  <>
                    <input
                      autoFocus
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm
                        focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                    />
                    <button
                      onClick={confirmEdit}
                      className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200
                        flex items-center justify-center transition-colors"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200
                        flex items-center justify-center transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </>
                ) : deletingId === view.id ? (
                  <>
                    <span className="flex-1 text-sm text-rose-600 font-medium">
                      Delete "{view.label}"?
                    </span>
                    <button
                      onClick={() => confirmDelete(view.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold
                        hover:bg-rose-600 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold
                        hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-slate-700 truncate">
                      {view.label}
                    </span>
                    <span className="text-xs text-slate-400 mr-1">
                      {view.panels?.length ?? 0} panel{view.panels?.length !== 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={() => startEdit(view)}
                      className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 bg-slate-100
                        text-slate-500 hover:bg-indigo-100 hover:text-indigo-600
                        flex items-center justify-center transition-all"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(view.id);
                        setEditingId(null);
                      }}
                      className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 bg-slate-100
                        text-slate-500 hover:bg-rose-100 hover:text-rose-600
                        flex items-center justify-center transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* new view row */}
          <AnimatePresence>
            {showNew && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40"
              >
                <input
                  autoFocus
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") setShowNew(false);
                  }}
                  placeholder="View name…"
                  className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                />
                <button
                  onClick={handleAdd}
                  disabled={!newLabel.trim()}
                  className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center
                    hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={() => setShowNew(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200
                    flex items-center justify-center transition-colors"
                >
                  <X size={13} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!showNew && (
            <button
              onClick={() => setShowNew(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                border-2 border-dashed border-slate-200 text-slate-400 hover:text-slate-600
                hover:border-slate-300 transition-all text-xs font-semibold"
            >
              <Plus size={13} />
              New view
            </button>
          )}
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium px-2 py-1"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(localViews); onClose(); }}
            disabled={!hasDirty}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold
              hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-95 transition-all shadow-sm"
          >
            Save changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}