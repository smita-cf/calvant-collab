



// C:\Users\ak192\Downloads\cf-tool-frontend-prod (6)\cf-tool-frontend-prod\src\modules\dpia\components\ManageDpiaAssignmentsModal.js

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X, ShieldCheck, Save, RefreshCw, Edit3, Search,
  ChevronDown, User, Calendar, FileText,
} from "lucide-react";
import { getSessionUser } from "../utils/helpers";
import * as dpiaApi from "../services/dpiaApi";
import { captureActivity, ACTIONS } from "../../../services/activities";

/* ─── constants ──────────────────────────────────────────────────────────── */
const NAVBAR_HEIGHT = 72;
const MODAL_GAP = 32;

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function assignmentBadge(status) {
  if (!status) return { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
  const s = status.toUpperCase();
  if (s === "PENDING") return { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" };
  if (s === "IN_REVIEW") return { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
  if (s === "COMPLETED") return { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" };
  if (s === "OVERDUE") return { bg: "#fef2f2", color: "#991b1b", border: "#fca5a5" };
  return { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
}

function resolveDeptName(rawDept, departments) {
  if (!rawDept) return "";
  const raw = String(rawDept).trim();
  const byName = departments.find(d => (d.name || "").toLowerCase() === raw.toLowerCase());
  if (byName) return byName.name;
  const byId = departments.find(
    d => String(d._id || "").toLowerCase() === raw.toLowerCase() ||
      String(d.id || "").toLowerCase() === raw.toLowerCase(),
  );
  if (byId) return byId.name;
  return raw;
}

/* ─── component ──────────────────────────────────────────────────────────── */
export function ManageDpiaAssignmentsModal({ onClose, onSaved, riskOwners = [], departments = [] }) {
  const sessionUser = getSessionUser();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [step, setStep] = useState(1);
  const [editBuf, setEditBuf] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ── load ── */
  function load() {
    const orgId = sessionUser.organization || sessionUser.organizationId || "";
    dpiaApi
      .getDpiaAssignments(orgId)
      .then(data => { setAssignments(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
    captureActivity({ action: "DPIA_MANAGE_MODAL_OPENED", item: "Opened Manage DPIA Assignments Modal", url: window.pathname });
  }, []);

  /* ── filtered list ── */
  const filtered = assignments.filter(a => {
    const q = search.toLowerCase();
    return (
      (a.projectName || "").toLowerCase().includes(q) ||
      (a.assignedToName || "").toLowerCase().includes(q) ||
      (a.status || "").toLowerCase().includes(q)
    );
  });

  /* ── edit ── */
  function startEdit(a) {
    setEditing(a.id || a._id);
    const resolvedDept = resolveDeptName(a.department, departments);
    setEditBuf({
      status: a.status || "PENDING",
      dueDate: a.dueDate || "",
      priority: a.priority || "Medium",
      assignedTo: a.assignedTo || "",
      department: resolvedDept,
      notes: a.notes || "",
    });
    setStep(2);
    setError("");
    captureActivity({ action: ACTIONS.CLICK, item: `DPIA · Editing Assignment for Assessment: ${a.projectName || a.dpiaId}`, url: window.pathname });
  }

  function setField(k, v) {
    setEditBuf(p => {
      const next = { ...p, [k]: v };
      if (k === "department") next.assignedTo = "";
      return next;
    });
  }

  /* ── filtered vendors ── */
  const filteredRiskOwners = editBuf.department
    ? riskOwners.filter(owner => {
      const ownerDepts = Array.isArray(owner.department)
        ? owner.department
        : owner.department ? [owner.department] : [];
      if (ownerDepts.length === 0) return false;
      const selectedDeptObj = departments.find(d => d.name === editBuf.department);
      const selectedDeptId = selectedDeptObj?._id || selectedDeptObj?.id || "";
      const selectedDeptName = editBuf.department;
      return ownerDepts.some(dept => {
        const deptStr = String(dept || "").trim().toLowerCase();
        return deptStr === selectedDeptId.toLowerCase() || deptStr === selectedDeptName.toLowerCase();
      });
    })
    : riskOwners;


  //change  date format  to dd-mm-yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "—";

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };



  /* auto-select single vendor */
  useEffect(() => {
    if (step !== 2) return;
    if (filteredRiskOwners.length === 1) {
      setEditBuf(p => ({ ...p, assignedTo: String(filteredRiskOwners[0]._id || filteredRiskOwners[0].id) }));
    } else if (filteredRiskOwners.length === 0) {
      setEditBuf(p => ({ ...p, assignedTo: "" }));
    }
  }, [editBuf.department, step]);

  const canSave = editBuf.assignedTo && editBuf.dueDate && editBuf.department;

  /* ── save ── */
  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      const owner = riskOwners.find(u => String(u._id || u.id) === editBuf.assignedTo);
      const updated = { ...editBuf, assignedToName: owner ? owner.name : editBuf.assignedTo };
      const saved = await dpiaApi.updateDpiaAssignment(editing, updated);
      setAssignments(prev => prev.map(x => (x.id === editing || x._id === editing) ? saved : x));
      if (onSaved) onSaved();
      const selectedAssignment = assignments.find(a => (a.id || a._id) === editing);
      captureActivity({
        action: ACTIONS.UPDATE,
        item: `DPIA · Updated Assignment: ${selectedAssignment?.projectName || selectedAssignment?.dpiaId}`,
        url: window.pathname,
      });
      setStep(1);
      setEditing(null);
    } catch (err) {
      setError(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  const selectedAssignment = assignments.find(a => (a.id || a._id) === editing);

  /* ── render ── */
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
      style={{ paddingTop: NAVBAR_HEIGHT + MODAL_GAP, paddingBottom: MODAL_GAP }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-auto flex flex-col"
        style={{ maxHeight: `calc(100vh - ${NAVBAR_HEIGHT + MODAL_GAP * 2}px)` }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: "linear-gradient(135deg, #9f7aea, #7c3aed)" }}>
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Manage DPIA Assignments</h2>
              <p className="text-xs text-slate-500">
                {step === 1
                  ? `${assignments.length} assignment${assignments.length !== 1 ? "s" : ""}`
                  : "Edit assignment details"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                onClick={() => { setStep(1); setEditing(null); setError(""); }}
                className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                ← Back to List
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <X size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* ── Step tabs ── */}
        <div className="flex gap-2 px-6 pt-5 pb-0 flex-shrink-0">
          {["Assignments List", "Edit Assignment"].map((label, i) => (
            <button
              key={i}
              onClick={() => i === 0 && setStep(1)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={step === i + 1
                ? { background: "#7c3aed", color: "#fff" }
                : { background: "#f1f5f9", color: "#64748b" }
              }
            >
              <span
                className="w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                style={step === i + 1
                  ? { background: "#fff", color: "#7c3aed" }
                  : { background: "#cbd5e1", color: "#fff" }
                }
              >
                {i + 1}
              </span>
              {label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ────── Step 1: Assignments List ────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by project, assignee, status..."
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50"
                />
              </div>

              {/* min-h keeps modal stable */}
              <div className="min-h-[320px] space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: "#7c3aed", borderTopColor: "transparent" }} />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48">
                    <ShieldCheck size={36} className="text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">
                      {assignments.length === 0 ? "No DPIA assignments yet." : "No results for your search."}
                    </p>
                  </div>
                ) : (
                  filtered.map((a, i) => {
                    const aId = a.id || a._id;
                    const badge = assignmentBadge(a.status);
                    const deptDisplay = resolveDeptName(a.department, departments);
                    return (
                      <motion.div
                        key={aId}
                        className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
                              style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}>
                              {a.status || "PENDING"}
                            </span>
                            {deptDisplay && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: "#f3f0ff", color: "#6d28d9", border: "1px solid #ede9fe" }}>
                                {deptDisplay}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-slate-800 truncate">{a.projectName || a.dpiaId}</p>
                          <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                            <span><span className="font-medium">Assigned to:</span> {a.assignedToName || a.assignedTo}</span>
                            <span>
                              <span className="font-medium">Due:</span> {formatDate(a.dueDate)}
                            </span>
                          </div>
                          {a.notes && <p className="text-xs text-slate-400 italic mt-0.5 truncate">"{a.notes}"</p>}
                        </div>
                        <button
                          onClick={() => startEdit(a)}
                          className="p-2 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0"
                          title="Edit"
                        >
                          <Edit3 size={15} className="text-slate-400" />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ────── Step 2: Edit Assignment ────── */}
          {step === 2 && selectedAssignment && (
            <div className="space-y-4 max-w-lg">
              {/* selected pill */}
              <div className="flex items-center gap-3 rounded-xl px-4 py-3 border"
                style={{ background: "#fdf4ff", borderColor: "#e9d5ff" }}>
                <ShieldCheck size={18} style={{ color: "#7c3aed" }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: "#5b21b6" }}>
                    {selectedAssignment.projectName || selectedAssignment.dpiaId}
                  </p>
                  <p className="text-xs" style={{ color: "#a78bfa" }}>{selectedAssignment.status}</p>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <FileText size={12} /> Department *
                </label>
                <div className="relative">
                  <select
                    value={editBuf.department}
                    onChange={e => setField("department", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none appearance-none bg-white pr-9"
                  >
                    <option value="">Select department...</option>
                    {departments.map(d => (
                      <option key={d._id || d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {editBuf.department && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    Showing {filteredRiskOwners.length} risk owner{filteredRiskOwners.length !== 1 ? "s" : ""} from {editBuf.department}
                    {filteredRiskOwners.length === 1 ? " — auto-selected" : ""}
                  </p>
                )}
              </div>

              {/* Assign to */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <User size={12} /> Assign To (Risk Owner) *
                </label>
                <div className="relative">
                  <select
                    value={editBuf.assignedTo}
                    onChange={e => setField("assignedTo", e.target.value)}
                    disabled={filteredRiskOwners.length === 0}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none appearance-none bg-white pr-9"
                    style={{
                      opacity: filteredRiskOwners.length === 0 ? 0.5 : 1,
                      background: filteredRiskOwners.length === 1 ? "#fdf4ff" : undefined,
                      borderColor: filteredRiskOwners.length === 1 ? "#c4b5fd" : undefined,
                    }}
                  >
                    <option value="">
                      {!editBuf.department
                        ? "Select department first..."
                        : filteredRiskOwners.length === 0
                          ? "No risk owners in this department"
                          : "Select risk owner..."}
                    </option>
                    {filteredRiskOwners.map(u => (
                      <option key={u._id || u.id} value={u._id || u.id}>{u.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Due date */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={12} /> Due Date *
                </label>
                <input
                  type="date"
                  value={editBuf.dueDate}
                  onChange={e => setField("dueDate", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Notes / Instructions</label>
                <textarea
                  rows={3}
                  value={editBuf.notes}
                  onChange={e => setField("notes", e.target.value)}
                  placeholder="Any context or instructions for the risk owner..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
                />
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

              <button
                onClick={handleSave}
                disabled={saving || !canSave}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-white text-sm font-semibold rounded-xl shadow transition-all"
                style={{ background: saving || !canSave ? "#94a3b8" : "#7c3aed", cursor: saving || !canSave ? "not-allowed" : "pointer" }}
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ManageDpiaAssignmentsModal;