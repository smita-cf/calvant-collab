// C:\Users\ak192\Downloads\CalVant-Next-master (3)\CalVant-Next-master\src\modules\documentation\pages\MLD.js



//Working Model
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import documentationService from "../services/documentationService";
import controlService from "../services/controlService";
import taskService from "../../taskManagement/services/taskService";          // ← NEW
import { getAllUsers, getDepartments } from "../../departments/services/userService"; // ← NEW
//import { useDocChecker, APPROVAL_THRESHOLD, BORDERLINE_THRESHOLD, getComplianceStatus } from "./useDocChecker";
import { useDocChecker, APPROVAL_THRESHOLD } from "./useDocChecker";          // ← NEW (doc-checker)
import { VerifyCell, ApproveGateModal } from "./VerifyCell";                  // ← NEW (doc-checker)
import { FileText,  Trash2, UploadCloud, Calendar, Check, ArrowUpDown, ArrowUp, ArrowDown, Plus, X  } from "lucide-react";
import Modal from "../../../components/navigations/Modal";
import Joyride, { STATUS } from "react-joyride";
import { useFramework, ALL_FRAMEWORKS } from "../../../context/FrameworkContex";
import { captureActivity, ACTIONS } from "../../../services/activities";


const MAPPINGS_API = "https://api.calvant.com/framework/api/mappings/framework";
const OWNERSHIP_API = "https://api.calvant.com/control-ownership-service/api/control-ownership";

async function fetchMappingPair(src, tgt) {
  const token = sessionStorage.getItem("token");
  try {
    const res = await fetch(`${MAPPINGS_API}/${src}/${tgt}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return res.ok ? res.json() : [];
  } catch { return []; }
}

async function fetchOwnershipsByFramework(frameworkCode) {
  const token = sessionStorage.getItem("token");
  try {
    const res = await fetch(`${OWNERSHIP_API}/by-framework/${frameworkCode}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return res.ok ? res.json() : [];
  } catch { return []; }
}

// ── Sort helpers ───────────────────────────────────────────────────────────
function naturalSortKey(code = "") {
  return code
    .split(/(\d+)/)
    .map((p) => (p !== "" && !isNaN(p) ? p.padStart(8, "0") : p.toLowerCase()))
    .join("");
}

const SOC2_PREFIX_ORDER = ["CC", "A", "C", "PI", "P"];
function soc2SortKey(code = "") {
  const upper = code.trim().toUpperCase();
  const prefix = (upper.match(/^([A-Z]+)/) || ["", ""])[1];
  const idx = SOC2_PREFIX_ORDER.indexOf(prefix);
  return (idx >= 0 ? String(idx).padStart(2, "0") : "99") + naturalSortKey(code);
}

function isoSortKey(code = "") {
  const isNumeric = /^\d/.test(code.trim());
  return (isNumeric ? "0" : "1") + naturalSortKey(code);
}

function frameworkSortKey(code = "", fw = "") {
  const c = code.trim().toUpperCase();
  if (fw === "SOC2") return soc2SortKey(c);
  if (fw === "KSA_PDPL") {
    const num = c.replace(/^ARTICLE-?/, "");
    return "0:" + num.split(".").map((n) => n.padStart(5, "0")).join(".");
  }
  const isAnnex = c.startsWith("A.");
  const isNumeric = /^\d+(\.\d+)*$/.test(c);
  const bucket = isNumeric ? "0" : isAnnex ? "1" : "2";
  const normalized = isNumeric
    ? c.split(".").map((n) => n.padStart(5, "0")).join(".")
    : isAnnex
      ? c.replace("A.", "").split(".").map((n) => n.padStart(5, "0")).join(".")
      : c;
  return `${bucket}:${normalized}`;
}

// ── Status helpers ─────────────────────────────────────────────────────────
function deriveStatus(soaEntry, doc) {
  if (!soaEntry || !doc) return "to_upload";
  if (doc.deleted) return "rework";
  if (!doc.approvalDate) return "to_approve";
  if (doc.nextApprovalDate && new Date(doc.nextApprovalDate) < new Date()) return "rework";
  return "approved";
}

const STATUS_CONFIG = {
  to_upload: { label: "To Upload", bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" },
  to_approve: { label: "To Approve", bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
  live: { label: "Live", bg: "#dcfce7", color: "#166534", border: "#86efac" },
  rework: { label: "Rework", bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
  approved: { label: "Approved", bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.to_upload;
  return (
    <span style={{
      display: "inline-block", fontSize: "11px", fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}`,
      padding: "3px 9px", borderRadius: "12px", whiteSpace: "nowrap", letterSpacing: "0.2px",
    }}>
      {cfg.label}
    </span>
  );
};

// ── Badges ─────────────────────────────────────────────────────────────────
const FrameworkBadge = ({ framework, color }) => {
  const hex = color || "#64748b";
  const c = { bg: `${hex}18`, border: hex, text: hex };
  return (
    <span style={{
      display: "inline-block", fontSize: "10px", fontWeight: 700,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: "2px 7px", borderRadius: "10px", whiteSpace: "nowrap",
    }}>
      {framework}
    </span>
  );
};

const FrameworkCell = ({ framework, mappings, colorMap }) => {
  const mapped = useMemo(() => {
    if (!mappings || mappings.length === 0) return [];
    const seen = new Set();
    return mappings.reduce((acc, m) => {
      if (m.framework && m.framework !== framework && !seen.has(m.framework)) {
        seen.add(m.framework);
        acc.push(m.framework);
      }
      return acc;
    }, []);
  }, [mappings, framework]);

  const allFrameworks = [framework, ...mapped];
  const hiddenCount = mapped.length;

  return (
    <div 
      style={{ position: "relative", display: "inline-block", cursor: hiddenCount > 0 ? "pointer" : "default" }}
      onMouseEnter={(e) => { if(hiddenCount > 0) e.currentTarget.lastChild.style.display = "flex"; }}
      onMouseLeave={(e) => { if(hiddenCount > 0) e.currentTarget.lastChild.style.display = "none"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "2px 4px 2px 2px", borderRadius: "12px" }}>
        <FrameworkBadge framework={framework} color={colorMap[framework]} />
        {hiddenCount > 0 && (
          <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 700, paddingRight: "4px" }}>+{hiddenCount} ▼</span>
        )}
      </div>
      
      {hiddenCount > 0 && (
        <div style={{ display: "none", position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "4px", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: "8px", flexDirection: "column", gap: "6px", zIndex: 100, minWidth: "max-content" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", paddingBottom: "2px", borderBottom: "1px solid #f1f5f9" }}>Mapped Frameworks</div>
          {mapped.map((fw) => <FrameworkBadge key={fw} framework={fw} color={colorMap[fw]} />)}
        </div>
      )}
    </div>
  );
};

// ── Sortable column header ─────────────────────────────────────────────────
const SortableHeader = ({ label, subLabel, sortKey, currentSort, onSort, style = {} }) => {
  const isActive = currentSort.key === sortKey;
  const isAsc = isActive && currentSort.dir === "asc";
  const isDesc = isActive && currentSort.dir === "desc";
  return (
    <th onClick={() => onSort(sortKey)} style={{
      padding: "4px 8px", textAlign: "center", borderBottom: "2px solid #e2e8f0",
      fontWeight: 700, fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em",
      whiteSpace: "nowrap", cursor: "pointer", userSelect: "none",
      background: isActive ? "#f0f4ff" : "#f8fafc", transition: "background 0.15s", ...style,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
        <span>{label}</span>
        {isAsc ? <ArrowUp size={13} style={{ color: "#667eea" }} />
          : isDesc ? <ArrowDown size={13} style={{ color: "#667eea" }} />
            : <ArrowUpDown size={13} style={{ color: "#cbd5e1" }} />}
      </div>
      {subLabel && (
        <span style={{ display: "block", fontSize: "9px", fontWeight: 500, color: "#8b5cf6", marginTop: "2px" }}>
          {subLabel}
        </span>
      )}
    </th>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── ADD TASK MODAL  (NEW — self-contained, zero impact on existing logic) ────
// ─────────────────────────────────────────────────────────────────────────────
const TASK_PRIORITY = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", CRITICAL: "Critical" };
const PRIORITY_CFG = {
  Low: { color: "#2f9e44", bg: "#ebfbee", icon: "▼" },
  Medium: { color: "#f59f00", bg: "#fff9db", icon: "■" },
  High: { color: "#e8590c", bg: "#fff4e6", icon: "▲" },
  Critical: { color: "#c92a2a", bg: "#fff5f5", icon: "⚑" },
};

function AddTaskModal({ row, user, users, departments, onClose, onSuccess, effectiveOrgId }) {
  const today = new Date().toISOString().split("T")[0];
  const currentUserName = user?.name || user?.username || "System";

  // Build employee options from all users in the org
  const empOptions = useMemo(() => {
    return (users || []).filter((u) => u.name).map((u) => ({
      value: String(u._id || u.id || ""),
      label: u.name,
    }));
  }, [users]);

  const [form, setForm] = useState({
    department: "",
    employeeId: "",
    employee: "",
    employeeName: "",
    description: row
      ? `Policy: ${row.docName} | Control: ${row.controlCode} (${row.cId})`
      : "",
    startDate: today,
    endDate: "",
    priority: TASK_PRIORITY.MEDIUM,
    remarks: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setF = (patch) => setForm((p) => ({ ...p, ...patch }));

  const handleSave = async () => {
    if (!form.department || !form.startDate || !form.endDate || !form.description.trim()) {
      setError("Please fill all required fields (Department, Description, Start Date, End Date).");
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date cannot be before start date.");
      return;
    }
    setError("");

    // ── resolve assignee (mirrors TaskManagement.saveTask logic exactly) ──
    let employeeName = form.employeeName || form.employee || "";
    if (!employeeName) {
      // auto-assign: prefer risk owner of the chosen department
      const owner = users.find((u) => {
        const dObj = departments.find((d) => String(d._id || d.id) === String(u.department));
        const isOwner = Array.isArray(u.role) ? u.role.includes("risk_owner") : u.role === "risk_owner";
        return dObj?.name === form.department && isOwner;
      });
      employeeName = owner ? owner.name : currentUserName;
    }

    // resolve emails exactly as TaskManagement does (stored on task so mail-service needs no changes)
    const assigneeUser = users.find((u) => u.name === employeeName);
    const employeeEmail = assigneeUser?.email || assigneeUser?.emailAddress || "";
    const reporterUser = users.find((u) => u.name === currentUserName);
    const reporterEmail = reporterUser?.email || reporterUser?.emailAddress || user?.email || "";

    setSaving(true);
    try {
      /**
       * Payload is IDENTICAL in shape to TaskManagement.saveTask payload.
       * source: "Compliance" + controlId flags it as a Compliance task in
       * TaskManagement's getSourceModule() helper — no backend change needed.
       */
      const payload = {
        // context linkage
        riskId: undefined,
        auditId: undefined,
        source: "Policy",          // ← shows "Compliance" badge in TaskManagement
        controlId: row?.cId || "",        // ← identifies the originating control
        controlCode: row?.controlCode || "",
        framework: row?.framework || "",
        policyName: row?.docName || "",

        // standard task fields (unchanged from TaskManagement)
        organization: effectiveOrgId,
        department: form.department,
        employee: employeeName,
        employeeName: employeeName,
        employeeEmail: employeeEmail,
        description: form.description.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        status: "To-Do",
        priority: form.priority || TASK_PRIORITY.MEDIUM,
        reporter: currentUserName,
        reporterEmail: reporterEmail,
        remarks: form.remarks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await taskService.saveTask(payload, currentUserName);

      captureActivity({
        action: ACTIONS.CREATE,
        item: `Documentation · Created task for control ${row?.cId} — "${form.description.trim()}"`,
        url: "/documentation/mld",
      });

      onSuccess?.();
      onClose();
    } catch (e) {
      console.error("Add task failed:", e);
      setError("Failed to create task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Modal overlay ──────────────────────────────────────────────────────────
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 10001, padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
        fontFamily: "'DM Sans', sans-serif",
        animation: "taskModalIn 0.22s ease",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f1f5f9", padding: "18px 22px 10px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
              <Plus size={18} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em" }}>
                Create Task
              </h3>
              {row ? (
                <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, background: "#e0e7ff", color: "#4338ca", padding: "2px 8px", borderRadius: 6 }}>
                    {row.cId}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 6 }}>
                    {row.controlCode}
                  </span>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                    {row.docName}
                  </span>
                </div>
              ) : (
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                  Fill in the task details below
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "1.5px solid #e2e8f0", background: "white", borderRadius: 8,
              width: 30, height: 30, cursor: "pointer", fontSize: 16, color: "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fca5a5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 22px 0" }}>
          <div style={{ display: "grid", gap: 14 }}>

            {/* Department */}
            <div>
              <label style={labelStyle}>Department <span style={{ color: "#c92a2a" }}>*</span></label>
              <select
                value={form.department}
                onChange={(e) => setF({ department: e.target.value, employee: "", employeeName: "", employeeId: "" })}
                style={selectStyle}
              >
                <option value="">Select department…</option>
                {departments.map((d) => (
                  <option key={d._id || d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Assign To */}
            <div>
              <label style={labelStyle}>Assign To</label>
              <select
                value={form.employeeId || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = users.find((u) => String(u._id || u.id) === val);
                  const name = matched?.name || "";
                  setF({ employeeId: val, employee: name, employeeName: name });
                }}
                style={selectStyle}
              >
                <option value="">— Auto Assign (Risk Owner) —</option>
                {empOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {form.employeeName && (
                <div style={{ marginTop: 4, fontSize: 11, color: "#2f9e44", fontWeight: 600 }}>
                  ✓ Assigned to: {form.employeeName}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Task Description <span style={{ color: "#c92a2a" }}>*</span></label>
              <textarea
                value={form.description}
                onChange={(e) => setF({ description: e.target.value })}
                rows={3}
                placeholder="Describe the task…"
                style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
              />
            </div>

            {/* Dates */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Start Date <span style={{ color: "#c92a2a" }}>*</span></label>
                <input
                  type="date" value={form.startDate} min={today}
                  onChange={(e) => setF({ startDate: e.target.value, endDate: form.endDate < e.target.value ? "" : form.endDate })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>End Date <span style={{ color: "#c92a2a" }}>*</span></label>
                <input
                  type="date" value={form.endDate} min={form.startDate || today}
                  onChange={(e) => setF({ endDate: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label style={labelStyle}>Priority</label>
              <div style={{ display: "flex", gap: 8 }}>
                {Object.values(TASK_PRIORITY).map((p) => {
                  const cfg = PRIORITY_CFG[p];
                  const sel = form.priority === p;
                  return (
                    <button
                      key={p} type="button"
                      onClick={() => setF({ priority: p })}
                      style={{
                        fontSize: 12, fontWeight: 600, padding: "6px 14px",
                        borderRadius: 20, border: "1.5px solid", cursor: "pointer", transition: "all 0.15s",
                        background: sel ? cfg.color : "#f8fafc",
                        borderColor: sel ? cfg.color : "#cbd5e1",
                        color: sel ? "#fff" : "#64748b",
                        display: "flex", alignItems: "center", gap: 4, flex: 1, justifyItems: "center", justifyContent: "center"
                      }}
                    >
                      <span style={{ fontSize: 10 }}>{cfg.icon}</span> {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label style={labelStyle}>Remarks</label>
              <textarea
                value={form.remarks}
                onChange={(e) => setF({ remarks: e.target.value })}
                rows={2} placeholder="Optional notes…"
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {error && (
              <div style={{ fontSize: 12, color: "#c92a2a", fontWeight: 600, background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 6, padding: "8px 12px" }}>
                ⚠ {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16, padding: "16px 22px 22px", borderTop: "1px solid #f1f5f9" }}>
          <button onClick={onClose} style={{
            padding: "10px 22px", borderRadius: 12, border: "1.5px solid #e2e8f0",
            background: "white", color: "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer",
            transition: "all 0.15s", display: "inline-block"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            Cancel
          </button>
          <button
            onClick={handleSave} disabled={saving}
            style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: saving ? "#94a3b8" : "linear-gradient(135deg,#3b82f6,#2563eb)",
              color: "#fff", fontWeight: 700, fontSize: 13,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {saving ? "Creating…" : <><Plus size={14} /> Create Task</>}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes taskModalIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}

// shared micro-styles for AddTaskModal inputs
const inputStyle = {
  width: "100%",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 13,
  background: "#f8fafc",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer"
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 5,
};

// ─────────────────────────────────────────────────────────────────────────────
// ── MLD Component ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const getResolvedDepartmentInfo = (currentUser, allDepartments) => {
  if (!currentUser) return { ids: [], names: [] };
  const depts = currentUser.departments || (currentUser.department ? (Array.isArray(currentUser.department) ? currentUser.department : [currentUser.department]) : []);
  const ids = [];
  const names = [];

  depts.forEach((dept) => {
    if (!dept) return;
    if (typeof dept === "object") {
      const idVal = dept._id || dept.id || "";
      if (idVal) ids.push(String(idVal).toLowerCase());
      
      if (dept.name) {
        names.push(String(dept.name));
      } else if (idVal) {
        const found = allDepartments.find((d) => String(d._id) === String(idVal) || String(d.id) === String(idVal));
        if (found && found.name) {
          names.push(String(found.name));
        }
      }
    } else if (typeof dept === "string") {
      ids.push(dept.toLowerCase());
      const found = allDepartments.find((d) => String(d._id) === String(dept) || String(d.id) === String(dept));
      if (found && found.name) {
        names.push(String(found.name));
      } else {
        names.push(dept);
      }
    }
  });

  return { ids, names };
};

// ── StatCard Component ──────────────────────────────────────────────────────
const StatCard = ({ value, label, index, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: active ? "#eff6ff" : "white",
      border: active ? "1.5px solid #3b82f6" : "1px solid #e2e8f0",
      borderRadius: 12, padding: "16px",
      display: "flex", flexDirection: "column", gap: 4,
      boxShadow: active ? "0 4px 12px rgba(59,130,246,0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s ease-in-out",
      transform: active ? "translateY(-2px)" : "none",
      animation: `fadeUp 0.3s ease ${0.1 + index * 0.05}s both`,
      position: "relative", overflow: "hidden",
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        e.currentTarget.style.borderColor = "#cbd5e1";
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
        e.currentTarget.style.borderColor = "#e2e8f0";
      }
    }}
  >
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontSize: 24, fontWeight: 800, color: active ? "#1d4ed8" : "#1e293b", letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </span>
    </div>
    <span style={{ fontSize: 12, fontWeight: 700, color: active ? "#3b82f6" : "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </span>
  </div>
);

const MLD = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    mounted,
    isRoot,
    isPrivilegedRole,
    isViewingManagedOrg,
    effectiveOrgId,
    effectiveOrgIds,
    selectedChildOrg,
  } = useEffectiveOrg();
  const { selectedFrameworks, toggleFramework, isAllSelected, availableFrameworks } = useFramework();
  const [allDepartments, setAllDepartments] = useState([]);
  const fwColorMap = useMemo(
    () => Object.fromEntries(availableFrameworks.map((fw) => [fw.code, fw.color])),
    [availableFrameworks]
  );

  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null, showCancel: false });
  const [userMap, setUserMap] = useState({});
  const [docVersions, setDocVersions] = useState({});
  const [showButtons, setShowButtons] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ open: false, docId: null, comment: "" });
  const [backendControls, setBackendControls] = useState([]);
  const [controlsLoading, setControlsLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [soas, setSoas] = useState([]);
  const [uploading, setUploading] = useState({});
  const [soaSearch, setSoaSearch] = useState("");
  const [soaSort, setSoaSort] = useState("framework");
  const [colSort, setColSort] = useState({ key: "uploadDate", dir: "desc" });
  const [uploadFilter, setUploadFilter] = useState("ALL");
  const [ownershipMap, setOwnershipMap] = useState({});
  const [ownershipLoading, setOwnershipLoading] = useState(false);

  // ── NEW: Add Task state ────────────────────────────────────────────────────
  const [addTaskModal, setAddTaskModal] = useState({ open: false, row: null });
  const [taskUsers, setTaskUsers] = useState([]);
  const [taskDepartments, setTaskDepartments] = useState([]);
  const [taskSuccessMsg, setTaskSuccessMsg] = useState("");

  // ── NEW: Doc-checker state ─────────────────────────────────────────────────
  const checker = useDocChecker();
  const [gateModal, setGateModal] = useState({ open: false, docId: null });

  // Load users + departments once (needed for AddTaskModal) — does NOT touch
  // any existing state; purely additive.
  // Hydrate any previously-verified docs on page load (one batch, not per-row)
  useEffect(() => {
    const uploadedDocIds = documents
      .filter((d) => !d.deleted && d.id)
      .map((d) => d.id);
    if (uploadedDocIds.length > 0) {
      checker.hydrateDocs(uploadedDocIds);
    }
  }, [documents]);

  // Read search parameters to pre-select filters (e.g. when coming from the Dashboard Upload card)
  useEffect(() => {
    const initialSort = searchParams.get("sort");
    const initialFilter = searchParams.get("filter");
    if (initialSort) {
      setSoaSort(initialSort);
    }
    if (initialFilter) {
      setUploadFilter(initialFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!effectiveOrgId) return;
    getAllUsers()
      .then((r) => Array.isArray(r)
        ? setTaskUsers(r.filter((u) => u.organization === effectiveOrgId))
        : [])
      .catch(console.error);
    getDepartments()
      .then((d) => Array.isArray(d)
        ? setTaskDepartments(d.filter((dept) => dept.organization === effectiveOrgId))
        : [])
      .catch(console.error);
  }, [effectiveOrgId]); // eslint-disable-line

  const fwLabelToCode = useMemo(
    () => Object.fromEntries(availableFrameworks.map((fw) => [fw.id, fw.code])),
    [availableFrameworks]
  );
  const fwOrder = useMemo(
    () => Object.fromEntries(availableFrameworks.map((fw, i) => [fw.code, i])),
    [availableFrameworks]
  );

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mappingsByControl, setMappingsByControl] = useState({});
  const [mappingsLoading, setMappingsLoading] = useState(false);
  const [joyrideRun, setJoyrideRun] = useState(false);
  const [frameworkFilter, setFrameworkFilter] = useState("ALL");
  const [uploadTimestamps, setUploadTimestamps] = useState({});
  const [highlightedRowKey, setHighlightedRowKey] = useState(null);

  const joyrideSteps = [
    { target: "#mld-header", content: "Master List of Policies." },
    { target: "#mld-search", content: "Filter by policy name." },
    { target: "#mld-sort", content: "Sort policies." },
    { target: "#mld-upload-filter", content: "Filter by upload status." },
    { target: "#mld-upload-table", content: "All required policies." },
    { target: "#mld-upload-btn", content: "Click to upload a policy." },
  ];

  useEffect(() => {
    const h = () => {
      setShowButtons(window.scrollY <= lastScrollY);
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, [lastScrollY]);

  useEffect(() => {
    captureActivity({
      action: ACTIONS.PAGE_LOAD,
      item: [{ detail: "Documentation · Viewed Master List of Policies" }],
      url: "/documentation/mld",
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = sessionStorage.getItem("token");
    fetch("https://api.calvant.com/user-service/api/departments", {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllDepartments(data);
        }
      })
      .catch(console.error);
  }, [mounted]);

  useEffect(() => {
    if (previewModalOpen) {
      captureActivity({
        action: ACTIONS.CLICK,
        item: [{ detail: "Documentation · Opened policy preview" }],
        url: "/documentation/mld",
      });
    }
  }, [previewModalOpen]);

  useEffect(() => {
    if (deleteModal.open) {
      captureActivity({
        action: ACTIONS.CLICK,
        item: [{ detail: "Documentation · Opened delete confirmation", docId: deleteModal.docId }],
        url: "/documentation/mld",
      });
    }
  }, [deleteModal.open]);

  useEffect(() => {
    if (availableFrameworks.length === 0) return;
    (async () => {
      setMappingsLoading(true);
      try {
        const codes = availableFrameworks.map((fw) => fw.code);
        const pairs = codes.flatMap((src) =>
          codes.filter((tgt) => tgt !== src).map((tgt) => [src, tgt])
        );
        const results = await Promise.all(pairs.map(([src, tgt]) => fetchMappingPair(src, tgt)));
        const map = {};
        pairs.forEach(([src, tgt], i) => {
          const data = Array.isArray(results[i]) ? results[i] : [];
          data.forEach((m) => {
            const k = `${src}:${m.sourceControlCode}`;
            if (!map[k]) map[k] = [];
            if (!map[k].find((e) => e.code === m.targetControlCode && e.framework === tgt))
              map[k].push({ code: m.targetControlCode, framework: tgt });
          });
        });
        Object.keys(map).forEach((k) =>
          map[k].sort((a, b) => naturalSortKey(a.code).localeCompare(naturalSortKey(b.code)))
        );
        setMappingsByControl(map);
      } catch (err) {
        console.error("Mappings error:", err);
      } finally {
        setMappingsLoading(false);
      }
    })();
  }, [availableFrameworks]);

  useEffect(() => {
    if (availableFrameworks.length === 0) return;
    (async () => {
      setOwnershipLoading(true);
      try {
        const results = await Promise.all(
          availableFrameworks.map((fw) => fetchOwnershipsByFramework(fw.code))
        );
        const map = {};
        availableFrameworks.forEach((fw, i) => {
          const records = Array.isArray(results[i]) ? results[i] : [];
          records.forEach((r) => {
            const key = `${(r.frameworkCode || "").trim()}:${(r.controlCode || "").trim()}`;
            if (!map[key]) map[key] = { owner: null, manager: null };
            if (r.ownerRole === "process_owner") map[key].owner = r;
            else if (r.ownerRole === "process_manager") map[key].manager = r;
          });
        });
        setOwnershipMap(map);
      } catch (err) {
        console.error("Ownership error:", err);
      } finally {
        setOwnershipLoading(false);
      }
    })();
  }, [availableFrameworks]);

  useEffect(() => {
    if (availableFrameworks.length === 0) return;
    (async () => {
      setControlsLoading(true);
      try {
        const results = await Promise.all(
          availableFrameworks.map((fw) => controlService.getControlsByFramework(fw.code).catch(() => []))
        );
        setBackendControls(
          availableFrameworks.flatMap((fw, i) =>
            (results[i] || []).map((c) => ({ ...c, _framework: fw.code }))
          )
        );
      } catch (err) {
        console.error("Controls error:", err);
        setBackendControls([]);
      } finally {
        setControlsLoading(false);
      }
    })();
  }, [availableFrameworks]);

  const refreshDocuments = useCallback(async () => {
    try {
      const docs = (await documentationService.getDocuments()) || [];
      const orgDocs = docs.filter((d) => d.organization === effectiveOrgId);
      
      const { ids: userDeptIds, names: resolvedNames } = getResolvedDepartmentInfo(user, allDepartments);

      // Extra fallback: if allDepartments hadn't loaded yet, also resolve directly from user.department
      const directName =
        user?.department?.name ||
        allDepartments.find(
          (d) =>
            String(d._id) === String(user?.department?._id || user?.department) ||
            String(d.id) === String(user?.department?._id || user?.department)
        )?.name ||
        null;

      const allResolvedNames = [
        ...resolvedNames,
        ...(directName && !resolvedNames.includes(directName) ? [directName] : []),
      ];
      const lowercaseUserDeptNames = allResolvedNames.map((n) => n.toLowerCase());

      const filteredDocs = orgDocs.filter((doc) => {
        const docDept = String(doc.departmentName || doc.department || doc.dept || "").toLowerCase();
        return (
          isPrivilegedRole ||
          !docDept ||
          lowercaseUserDeptNames.includes(docDept) ||
          userDeptIds.includes(docDept)
        );
      });

      setDocuments(filteredDocs);
      const soaList = (await documentationService.getSoAEntries()) || [];
      const orgSoas = soaList.filter((s) => s.organization === effectiveOrgId);
      setSoas(orgSoas);
    } catch (err) {
      console.error("Docs error:", err);
      setDocuments([]);
      setSoas([]);
    }
  }, [effectiveOrgId, user, allDepartments, isPrivilegedRole]);

  useEffect(() => {
    if (mounted) {
      refreshDocuments();
    }
  }, [refreshDocuments, mounted]);

  // Build rows
  const allDocRows = useMemo(() => {
    if (controlsLoading || backendControls.length === 0) return [];
    
    const { ids: userDeptIds, names: userDeptNames } = getResolvedDepartmentInfo(user, allDepartments);

    const soaMap = {};
    soas.forEach((soa) => {
      const fw = (soa.framework || "").trim();
      const cat = String(soa.category).trim();
      const docRef = (soa.documentRef?.[0] || "").trim();
      if (!cat) return;
      if (fw && docRef) soaMap[`${fw}:${cat}:${docRef}`] = soa;
      if (fw) soaMap[`${fw}:${cat}`] = soa;
      if (!fw && docRef) soaMap[`${cat}:${docRef}`] = soa;
      if (!fw) soaMap[cat] = soa;
    });

    const rows = [];
    const seen = new Set();
    backendControls.forEach((ctrl) => {
      const docsList = ctrl.documents && ctrl.documents.length > 0
        ? ctrl.documents
        : [{ doc: "", type: "", dept: "" }];
      const framework = ctrl._framework || "ISO27001";
      const cat = (ctrl.controlCode || "").trim();
      if (!cat) return;

      docsList.forEach(({ doc, type, dept }) => {
        if (!doc) return;

        // Department Access Check (unless privileged/admin)
        const docDeptVal = String(dept || "").toLowerCase();
        const lowercaseUserDeptNames = userDeptNames.map((n) => n.toLowerCase());
        const hasAccess =
          isPrivilegedRole ||
          !docDeptVal ||
          lowercaseUserDeptNames.includes(docDeptVal) ||
          userDeptIds.includes(docDeptVal);
        if (!hasAccess) return;

        const docName = doc.trim();
        const key = `${framework}:${cat}:${docName}`;
        if (seen.has(key)) return;
        seen.add(key);
        const soaEntry =
          soaMap[`${framework}:${cat}:${docName}`] || soaMap[`${framework}:${cat}`] || null;
        const cId = (ctrl.unifiedId || "").trim() || `C-${framework}-${cat}`;
        rows.push({
          rowKey: key, cId, docName, docType: type || "", docDept: dept || "",
          controlCode: cat, controlTitle: ctrl.title || ctrl.description || "",
          framework, soaEntry, controlMongoId: ctrl._id || ctrl.id || null,
        });
      });
    });
    return rows;
  }, [backendControls, controlsLoading, soas, user, allDepartments, isPrivilegedRole]);

  // ── Column sort handler ────────────────────────────────────────────────
  const handleColSort = useCallback((key) => {
    setColSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
    setSoaSort("none");
  }, []);

  // Filter + Sort
  const filteredDocRows = useMemo(() => {
    let list = [...allDocRows];

    if (!isAllSelected) {
      const mldFrameworks = selectedFrameworks.map((fw) => fwLabelToCode[fw]).filter(Boolean);
      list = list.filter((r) => mldFrameworks.includes(r.framework));
    }

    if (uploadFilter !== "ALL") {
      list = list.filter((r) => {
        const soaId = r.soaEntry?.id ?? null;
        const doc = soaId
          ? documents.filter((d) => String(d.soaId) === String(soaId) && !d.deleted).sort((a, b) => b.version - a.version)[0]
          : null;
        const isUploaded = !!doc;
        return uploadFilter === "uploaded" ? isUploaded : !isUploaded;
      });
    }

    if (soaSearch.trim()) {
      const q = soaSearch.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.docName.toLowerCase().includes(q) ||
          r.controlCode.toLowerCase().includes(q) ||
          r.cId.toLowerCase().includes(q) ||
          (r.controlTitle || "").toLowerCase().includes(q) ||
          (mappingsByControl[`${r.framework}:${r.controlCode}`] || []).some((m) =>
            m.code.toLowerCase().includes(q)
          )
      );
    }

    if (colSort.key && soaSort === "none") {
      list.sort((a, b) => {
        const getDoc = (row) => {
          const soaId = row.soaEntry?.id ?? null;
          if (!soaId) return null;
          return documents
            .filter((d) => String(d.soaId) === String(soaId) && !d.deleted)
            .sort((x, y) => y.version - x.version)[0] || null;
        };
        let valA, valB;
        switch (colSort.key) {
          case "cId": valA = a.cId.toLowerCase(); valB = b.cId.toLowerCase(); break;
          case "uploadDate": {
            const dA = getDoc(a); const dB = getDoc(b);
            valA = dA?.createdAt ? new Date(dA.createdAt).getTime() : 0;
            valB = dB?.createdAt ? new Date(dB.createdAt).getTime() : 0; break;
          }
          case "submissionDate": {
            const dA = getDoc(a); const dB = getDoc(b);
            valA = dA?.approvalDate ? new Date(dA.approvalDate).getTime() : 0;
            valB = dB?.approvalDate ? new Date(dB.approvalDate).getTime() : 0; break;
          }
          case "reviewDate": {
            const dA = getDoc(a); const dB = getDoc(b);
            valA = dA?.nextApprovalDate ? new Date(dA.nextApprovalDate).getTime() : 0;
            valB = dB?.nextApprovalDate ? new Date(dB.nextApprovalDate).getTime() : 0; break;
          }
          case "docName": valA = a.docName.toLowerCase(); valB = b.docName.toLowerCase(); break;
          case "controlCode":
            valA = frameworkSortKey(a.controlCode, a.framework);
            valB = frameworkSortKey(b.controlCode, b.framework); break;
          case "status": {
            const order = { approved: 0, live: 1, to_approve: 2, rework: 3, to_upload: 4 };
            const dA = getDoc(a); const dB = getDoc(b);
            valA = order[deriveStatus(a.soaEntry, dA)] ?? 9;
            valB = order[deriveStatus(b.soaEntry, dB)] ?? 9; break;
          }
          default: return 0;
        }
        if (typeof valA === "string") {
          return colSort.dir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return colSort.dir === "asc" ? valA - valB : valB - valA;
      });
      return list;
    }

    switch (soaSort) {
      case "framework":
        list.sort((a, b) => {
          const fd = (fwOrder[a.framework] ?? 9) - (fwOrder[b.framework] ?? 9);
          return fd !== 0
            ? fd
            : frameworkSortKey(a.controlCode, a.framework).localeCompare(
              frameworkSortKey(b.controlCode, b.framework)
            );
        });
        break;
      case "name": list.sort((a, b) => a.docName.localeCompare(b.docName)); break;
      case "control_asc":
        list.sort((a, b) => {
          if (frameworkFilter !== "ALL") {
            return frameworkSortKey(a.controlCode, a.framework).localeCompare(
              frameworkSortKey(b.controlCode, b.framework)
            );
          }
          const fd = (fwOrder[a.framework] ?? 9) - (fwOrder[b.framework] ?? 9);
          return fd !== 0
            ? fd
            : frameworkSortKey(a.controlCode, a.framework).localeCompare(
              frameworkSortKey(b.controlCode, b.framework)
            );
        });
        break;
      case "control_desc":
        list.sort((a, b) => {
          if (frameworkFilter !== "ALL") {
            return frameworkSortKey(b.controlCode, b.framework).localeCompare(
              frameworkSortKey(a.controlCode, a.framework)
            );
          }
          const fd = (fwOrder[b.framework] ?? 9) - (fwOrder[a.framework] ?? 9);
          return fd !== 0
            ? fd
            : frameworkSortKey(b.controlCode, b.framework).localeCompare(
              frameworkSortKey(a.controlCode, a.framework)
            );
        });
        break;
      case "soa_first":
        list.sort((a, b) => {
          if (a.soaEntry && !b.soaEntry) return -1;
          if (!a.soaEntry && b.soaEntry) return 1;
          return a.docName.localeCompare(b.docName);
        });
        break;
      case "date_newest":
        list.sort((a, b) =>
          (b.soaEntry?.createdAt ? new Date(b.soaEntry.createdAt).getTime() : 0) -
          (a.soaEntry?.createdAt ? new Date(a.soaEntry.createdAt).getTime() : 0)
        );
        break;
      case "date_oldest":
        list.sort((a, b) =>
          (a.soaEntry?.createdAt ? new Date(a.soaEntry.createdAt).getTime() : 0) -
          (b.soaEntry?.createdAt ? new Date(b.soaEntry.createdAt).getTime() : 0)
        );
        break;
      default: break;
    }
    return list;
  }, [
    allDocRows, soaSearch, soaSort, colSort, frameworkFilter,
    mappingsByControl, uploadFilter, documents, isAllSelected,
    selectedFrameworks, fwLabelToCode, fwOrder,
  ]);

  useEffect(() => {
    const openControlId = searchParams.get("openControlId");
    if (!openControlId || filteredDocRows.length === 0) return;
    const match = filteredDocRows.find((r) => r.cId === openControlId);
    if (match) {
      setHighlightedRowKey(match.rowKey);
      setTimeout(() => {
        document.getElementById(`policy-row-${match.rowKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      // clear the highlight after a few seconds
      const t = setTimeout(() => setHighlightedRowKey(null), 4000);
      return () => clearTimeout(t);
    }
  }, [searchParams, filteredDocRows]);

  const getLatestDocForSoA = (soaId) => {
    // Resolve user's department info for access check
    const { ids: userDeptIds, names: userDeptNames } = getResolvedDepartmentInfo(user, allDepartments);
    const lowercaseUserDeptNames = userDeptNames.map((n) => n.toLowerCase());
    // Filter documents belonging to the given SoA and that the user has access to
    const accessibleDocs = documents
      .filter((d) => String(d.soaId) === String(soaId))
      .filter((d) => {
        const docDept = String(d.departmentName || d.department || d.dept || "").toLowerCase();
        return (
          isPrivilegedRole ||
          !docDept ||
          lowercaseUserDeptNames.includes(docDept) ||
          userDeptIds.includes(docDept)
        );
      })
      .sort((a, b) => b.version - a.version);
    return accessibleDocs.find((d) => !d.deleted) || accessibleDocs[0];
  };

  // Counts
  const totalDocsToUpload = allDocRows.length;
  const docCount = useMemo(() => {
    // Inline department filtering here so all deps are declared explicitly.
    // Previously this called getLatestDocForSoA() which captured user/allDepartments
    // via closure but those were missing from the dep array — causing the count
    // to be wrong (often 0) when allDepartments loaded after documents.
    const { ids: userDeptIds, names: userDeptNames } = getResolvedDepartmentInfo(user, allDepartments);
    const lcNames = userDeptNames.map((n) => n.toLowerCase());

    return allDocRows.filter((row) => {
      const soaId = row.soaEntry?.id ?? null;
      if (!soaId) return false;
      const doc = documents
        .filter((d) => String(d.soaId) === String(soaId))
        .filter((d) => {
          const dept = String(d.departmentName || d.department || d.dept || "").toLowerCase();
          return isPrivilegedRole || !dept || lcNames.includes(dept) || userDeptIds.includes(dept);
        })
        .filter((d) => !d.deleted)
        .sort((a, b) => b.version - a.version)[0];
      return !!doc;
    }).length;
  }, [allDocRows, documents, user, allDepartments, isPrivilegedRole]);

  const frameworkCounts = useMemo(
    () => Object.fromEntries(
      availableFrameworks.map((fw) => [fw.code, allDocRows.filter((r) => r.framework === fw.code).length])
    ),
    [allDocRows, availableFrameworks]
  );

  const handlePreviewClick = (soaEntry) => {
    const doc = documents.find((d) => String(d.soaId) === String(soaEntry.id) && !d.deleted);
    if (doc) {
      captureActivity({
        action: ACTIONS.CLICK,
        item: "Documentation · Previewed policy for control " + (soaEntry.clause || soaEntry.controlCode || soaEntry.id),
        url: "/documentation/mld",
      });
      const baseUrl = `${process.env.NEXT_PUBLIC_SP}/doc-service`;
      setPreviewUrl(baseUrl + encodeURI(doc.url.startsWith("/") ? doc.url : `/${doc.url}`));
      setPreviewModalOpen(true);
    } else {
      setModal({
        isOpen: true, title: "No Document Found", message: "No Document to preview",
        showCancel: false, onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
      });
    }
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setPreviewUrl("");
  };

  const handleSingleButtonUpload = async (soaId, rowDocDept) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        setUploading((p) => ({ ...p, [soaId]: true }));

        // Priority 1: use the department already on this row (set by backend control data)
        // Priority 2: resolve from user profile + allDepartments lookup
        // Priority 3: fallback to raw department id stored on user
        let primaryDeptName = rowDocDept ? rowDocDept.trim() : "";
        if (!primaryDeptName) {
          const { names: resolvedDeptNames } = getResolvedDepartmentInfo(user, allDepartments);
          primaryDeptName = resolvedDeptNames[0]
            ? resolvedDeptNames[0]
            : (
                // last-resort: pull from user.department directly if it's a populated object
                user?.department?.name ||
                // or look it up by the raw ID in allDepartments
                allDepartments.find(
                  (d) =>
                    String(d._id) === String(user?.department?._id || user?.department) ||
                    String(d.id) === String(user?.department?._id || user?.department)
                )?.name ||
                ""
              );
        }
        // Normalise: store consistently in UPPERCASE so filter comparisons work
        primaryDeptName = (primaryDeptName || "N/A").toUpperCase();
        await documentationService.uploadDocument({
          file, soaId, controlId: "",
          uploaderName: user?.name ?? "Unknown",
          departmentName: primaryDeptName,
          organization: effectiveOrgId,
        });
        captureActivity({
          action: ACTIONS.CREATE,
          item: "Documentation · Uploaded policy '" + file.name + "' for SoA " + soaId,
          url: "/documentation/mld",
        });
        setUploadTimestamps((prev) => ({ ...prev, [soaId]: Date.now() }));
        setModal({
          isOpen: true, title: "Success", message: "Policy uploaded successfully!",
          showCancel: false, onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
        });
        await refreshDocuments();
      } catch (err) {
        console.error("Upload failed:", err);
        setModal({
          isOpen: true, title: "Failure", message: "Upload Failed — please try again.",
          showCancel: false, onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
        });
      } finally {
        setUploading((p) => ({ ...p, [soaId]: false }));
      }
    };
    input.click();
  };

  const sortAscLabel = () => {
    if (frameworkFilter === "SOC2") return "Control ID (CC → A → C → PI → P)";
    if (frameworkFilter === "KSA_PDPL") return "Control ID (Article-1 → Article-2 → …)";
    if (frameworkFilter === "ALL") return "Control ID (↑ Asc, grouped by framework)";
    return "Control ID (4.x…10.x → A.x…)";
  };
  const sortDescLabel = () => {
    if (frameworkFilter === "SOC2") return "Control ID (P → PI → C → A → CC)";
    if (frameworkFilter === "KSA_PDPL") return "Control ID (… → Article-2 → Article-1)";
    if (frameworkFilter === "ALL") return "Control ID (↓ Desc, grouped by framework)";
    return "Control ID (Z → A.x → 10.x…4.x)";
  };

  const filterPill = (active) => ({
    padding: "6px 14px", borderRadius: "20px",
    border: `1.5px solid ${active ? "#3b82f6" : "#e2e8f0"}`,
    background: active ? "#3b82f6" : "#f8fafc",
    color: active ? "#fff" : "#475569",
    fontWeight: active ? 700 : 500, fontSize: "12px",
    cursor: "pointer", transition: "all 0.15s ease",
  });

  return (
    <div style={{ padding: "4px 2px 6px", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .mld-table-wrapper {
          width: 100%; overflow-x: auto;
          max-height: 72vh; overflow-y: auto;
          padding-bottom: 120px;
        }
        .mld-table {
          width: 100%; border-collapse: collapse;
          min-width: 1500px; background: transparent;
        }
        .mld-table thead tr th {
          position: sticky; top: 0; z-index: 10;
          padding: 11px 12px; font-weight: 700; font-size: 11px;
          color: #64748b; text-transform: uppercase; letter-spacing: 0.06em;
          white-space: nowrap; background: #f8fafc;
        }
        .mld-table tbody tr:hover td { background: #f8fafc !important; }
        .mld-table tbody tr { transition: background 0.15s; }
        .ownership-chip {
          display: inline-block; font-size: 10px;
          padding: 2px 7px; border-radius: 8px;
          font-weight: 600; white-space: nowrap;
        }
        /* ── Add Task button ── */
        .add-task-btn {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 6px; border: none;
          background: linear-gradient(135deg,#3b82f6,#2563eb); color: #fff; box-shadow: 0 4px 12px rgba(37,99,235,0.3);
          font-size: 11px; font-weight: 700; cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .add-task-btn:hover { background: #003d99; transform: translateY(-1px); }
        .add-task-btn:active { transform: translateY(0); }
      `}</style>

      <Joyride
        steps={joyrideSteps} run={joyrideRun} continuous scrollToFirstStep showSkipButton
        styles={{ options: { zIndex: 10000 } }}
        callback={({ status }) => {
          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) setJoyrideRun(false);
        }}
      />

      {/* ── Back button ── */}
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => router.push("/documentation")}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg,#3b82f6,#2563eb)",
            color: "white", border: "none", borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.35)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)"; }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* ── Header card ── */}
      <div id="mld-header" style={{
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(241,245,249,0.8)", borderRadius: 14,
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        padding: "18px 24px 16px", marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>
              <FileText size={22} color="white" strokeWidth={2} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em", lineHeight: 1.2 }}>Policies</h1>
              <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#64748b", fontWeight: 400 }}>Upload and manage your policies</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setJoyrideRun(true)}
              style={{
                padding: "10px 20px", borderRadius: 10,
                background: "linear-gradient(90deg,#ffb74d,#ff9800)",
                border: "none", color: "white", fontWeight: 600, fontSize: 13,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                boxShadow: "0 4px 12px rgba(255,152,0,0.3)", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(255,152,0,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(255,152,0,0.3)"; }}
            >
              Tutorial
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {/* !controlsLoading && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 14, marginBottom: 18,
          }}
        >
          <StatCard value={totalDocsToUpload} label="Total" index={0} active={false} />
          <StatCard value={docCount} label="Uploaded" index={1} active={false} />
          <StatCard value={allDocRows.filter((r) => r.soaEntry).length} label="SoA Linked" index={2} active={false} />
          {availableFrameworks.map((fw, i) => (
            <StatCard key={fw.code} value={frameworkCounts[fw.code] || 0} label={fw.label} index={3 + i} active={false} />
          ))}
        </section>
      ) */}

      {/* ── Filter / Toolbar ── */}
      <div style={{
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(241,245,249,0.8)", borderRadius: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        padding: "8px 16px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 8,
        flexWrap: "wrap", overflow: "visible",
        position: "relative", zIndex: 100,
      }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", flex: 1 }}>
          <input
            id="mld-search" type="text"
            placeholder="Search policy, control ID or C-ID…"
            value={soaSearch} onChange={(e) => setSoaSearch(e.target.value)}
            style={{ padding: "7px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13,
                outline: "none", background: "#f8fafc", boxSizing: "border-box",
                transition: "all 0.2s", color: "#1e293b", fontWeight: 600, minWidth: 240 }}
            onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
          />
          <select
            id="mld-sort" value={soaSort}
            onChange={(e) => { setSoaSort(e.target.value); setColSort({ key: null, dir: "asc" }); }}
            style={{ padding: "6px 11px", border: "1.5px solid #e2e8f0", borderRadius: 8,
                fontSize: 13, background: "#f8fafc", cursor: "pointer", outline: "none",
                fontWeight: 600, color: "#1e293b", transition: "all 0.15s" }}
            onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
          >
            <option value="framework">By Framework (27001 → 27701 → SOC2 → 42001 → PDPL)</option>
            <option value="name">Policy Name (A → Z)</option>
            <option value="control_asc">{sortAscLabel()}</option>
            <option value="control_desc">{sortDescLabel()}</option>
            <option value="soa_first">SoA Linked First</option>
            <option value="date_newest">SoA Date (Newest)</option>
            <option value="date_oldest">SoA Date (Oldest)</option>
            {soaSort === "none" && <option value="none">Column Sort Active</option>}
          </select>

          <div style={{ width: 1, height: 24, background: "#e2e8f0", flexShrink: 0 }} />
          <div id="mld-upload-filter" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Upload Status</span>
            {[
              { val: "ALL", label: "All" },
              { val: "uploaded", label: "✓ Uploaded" },
              { val: "not_uploaded", label: "✗ Not Uploaded" },
            ].map(({ val, label }) => (
              <button key={val} style={filterPill(uploadFilter === val)} onClick={() => setUploadFilter(val)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
          Showing {filteredDocRows.length} of {totalDocsToUpload}</span>
      </div>

      {mappingsLoading && (
        <div style={{ marginBottom: "8px", fontSize: "12px", color: "#8b5cf6", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", border: "2px solid #8b5cf6", borderTop: "2px solid transparent", animation: "spin 0.8s linear infinite" }} />
          Loading cross-framework mappings…
        </div>
      )}

      {/* Task success toast */}
      {taskSuccessMsg && (
        <div style={{
          marginBottom: "10px", padding: "10px 16px", borderRadius: "8px",
          background: "#d1fae5", border: "1px solid #6ee7b7", color: "#065f46",
          fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px",
        }}>
          ✓ {taskSuccessMsg}
          <button
            onClick={() => setTaskSuccessMsg("")}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#065f46", fontSize: "16px" }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── Table card ── */}
      <div style={{
        background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)",
        borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: "1px solid rgba(241,245,249,0.8)",
        overflow: "hidden", marginBottom: 16,
      }}>
          <div className="mld-table-wrapper">
          <table id="mld-upload-table" className="mld-table">
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <SortableHeader label="Control ID" sortKey="cId" currentSort={colSort} onSort={handleColSort} />
                <th style={thStyle}>Policy Name</th>
                <th style={thStyle}>Related Framework</th>
                <th style={thStyle}>Type</th>
                <SortableHeader label="Control Code" sortKey="controlCode" currentSort={colSort} onSort={handleColSort} />
                <th style={thStyle}>Ownership</th>
                <th style={thStyle}>Department</th>
                <SortableHeader label="CalVant Version" sortKey="version" currentSort={colSort} onSort={handleColSort} />
                <SortableHeader label="Status" sortKey="status" currentSort={colSort} onSort={handleColSort} />
                <th style={thStyle}>Submitted By</th>
                <SortableHeader label="Submission Date" sortKey="submissionDate" currentSort={colSort} onSort={handleColSort} />
                <th style={thStyle}>Approved By</th>
                <SortableHeader label="Review Date" sortKey="reviewDate" currentSort={colSort} onSort={handleColSort} />
                <th style={thStyle}>Upload</th>
                <th style={thStyle}>Remarks</th>
                {/* ── NEW column: doc-checker ── */}
                <th style={{ ...thStyle, background: "#eef9f0", color: "#166534" }}>
                  Quality Check
                </th>
                {/* ── NEW column ── */}
                <th style={{ ...thStyle, background: "#f0f4ff", color: "#3b5bdb" }}>
                  Add Task
                </th>
              </tr>
            </thead>

            <tbody>
              {controlsLoading ? (
                <tr>
                  <td colSpan="17" style={{ textAlign: "center", padding: "32px", color: "#667eea" }}>
                    Loading policies from server…
                  </td>
                </tr>
              ) : filteredDocRows.length === 0 ? (
                <tr>
                  <td colSpan="17" style={{ textAlign: "center", padding: "18px", color: "#7f8c8d" }}>
                    No policies found
                  </td>
                </tr>
              ) : (
                filteredDocRows.map(
                  ({ rowKey, cId, docName, docType, docDept, controlCode, controlTitle, soaEntry, framework, controlMongoId }, idx) => {
                    const soaId = soaEntry?.id ?? null;
                    const doc = soaId ? getLatestDocForSoA(soaId) : null;
                    const isUploaded = !!doc && !doc.deleted;
                    const isSoaLinked = !!soaEntry;
                    const mappings = mappingsByControl[`${framework}:${controlCode}`] || [];
                    const rowBg = isSoaLinked ? "#f0fff4" : "#ffffff";
                    const status = deriveStatus(soaEntry, doc && !doc.deleted ? doc : null);
                    const submissionDate = doc?.approvalDate
                      ? new Date(doc.approvalDate).toISOString().split("T")[0] : "—";
                    const reviewDate = doc?.nextApprovalDate
                      ? new Date(doc.nextApprovalDate).toISOString().split("T")[0] : "—";
                    const ownership = ownershipMap[`${framework.trim()}:${controlCode.trim()}`] || {};
                    const approvedBy = doc?.approvedBy || doc?.approverName || (doc?.approvalDate ? "—" : "—");


                    // The row object we'll pass into AddTaskModal
                    const taskRow = { rowKey, cId, docName, docType, docDept, controlCode, controlTitle, soaEntry, framework, controlMongoId };


                    // The row object we'll pass into the doc-checker hook.
                    // mldDocName is intentionally row.docName (the MLD's
                    // expected title for this control) — NOT doc.name —
                    // since the whole point of the check is verifying the
                    // uploaded file's title matches what the MLD says it
                    // should be.
                    const docCheckRow = isUploaded && doc ? {
                      docId: doc.id,
                      docUrl: doc.url,
                      docName,
                      organizationId: effectiveOrgId,
                      soaId: soaEntry?.id,
                      controlId: cId,
                      // ── NEW: framework-aware control mapping ──
                      // Lets doc-checker-service factor coverage of this control's actual
                      // requirements directly into the policyStatements score (see
                      // GroqAuditService). Sourced straight from this row's already-destructured
                      // values — no extra fetch needed.
                      framework,
                      controlCode,
                      controlTitle,
                    } : null;


                    const handleApprove = async () => {
                      if (!doc) return;
                      // ── NEW: doc-checker gate ──────────────────────────
                      // Block approval until the document has cleared the
                      // quality check (title match + score >= APPROVAL_THRESHOLD).
                      if (!checker.canApprove(doc.id)) {
                        setGateModal({ open: true, docId: doc.id });
                        return;
                      }
                      const today = new Date(), next = new Date();
                      next.setDate(today.getDate() + 365);
                      try {
                        const updated = await documentationService.updateApprovalDate(doc.id, today.getTime(), next.getTime());
                        setDocuments((prev) => prev.map((d) => (d.id === doc.id ? updated : d)));
                        captureActivity({
                          action: ACTIONS.UPDATE,
                          item: "Documentation · Approved policy '" + (doc.docName || doc.id) + "' for control " + (soaEntry?.clause || soaEntry?.controlCode || ""),
                          url: "/documentation/mld",
                        });
                        setModal({
                          isOpen: true, title: "Success", message: "Policy Approved",
                          showCancel: false, onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
                        });
                      } catch (err) {
                        console.error(err);
                        setModal({
                          isOpen: true, title: "Failed", message: "Approval Failed",
                          showCancel: false, onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
                        });
                      }
                    };


                    return (
                      <tr
                        key={rowKey}
                        id={`policy-row-${rowKey}`}   // ← add this
                        style={{
                          borderBottom: "1px solid #f1f1f1",
                          backgroundColor: rowKey === highlightedRowKey ? "#fff3cd" : rowBg,  // ← highlight
                          transition: "background-color 0.3s ease",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isSoaLinked ? "#e6f9ed" : "#f8f9fa"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = rowBg; }}
                      >
                        {/* Control ID */}
                        <td style={{ padding: "4px 8px", verticalAlign: "middle", maxWidth: "180px" }}>
                          <span style={{
                            display: "block", fontFamily: "monospace", fontWeight: 700,
                            color: "#3b5bdb", fontSize: "12px", background: "#f1f5f9",
                            border: "1px solid #c5d4fb", borderRadius: "5px", padding: "2px 6px",
                            whiteSpace: "nowrap", width: "fit-content",
                          }}>
                            {cId}
                          </span>
                        </td>


                        {/* Policy Name */}
                        <td
                          onClick={() => {
                            if (!soaEntry) return;
                            if (doc?.deleted || !doc?.url) {
                              setModal({ isOpen: true, title: "Document Deleted", message: "This document was deleted.", showCancel: false, onConfirm: () => setModal((m) => ({ ...m, isOpen: false })) });
                              return;
                            }
                            if (isUploaded) handlePreviewClick(soaEntry);
                          }}
                          style={{ padding: "4px 8px", verticalAlign: "middle", cursor: isUploaded && soaEntry ? "pointer" : "default", color: doc?.deleted ? "#999" : "#2c3e50", fontSize: "12px", fontWeight: 500 }}
                        >
                          {docName}
                          {isSoaLinked && (
                            <span style={{ display: "inline-block", marginLeft: "6px", fontSize: "10px", fontWeight: 700, background: "#28a745", color: "white", padding: "1px 6px", borderRadius: "10px", verticalAlign: "middle" }}>
                              SoA
                            </span>
                          )}
                        </td>


                        {/* Related Framework */}
                        <td style={{ padding: "4px 8px", textAlign: "center", verticalAlign: "middle" }}>
                          <FrameworkCell framework={framework} mappings={mappings} colorMap={fwColorMap} />
                        </td>


                        {/* Type */}
                        <td style={{ padding: "4px 8px", textAlign: "center", verticalAlign: "middle", color: "#6c757d", fontSize: "12px" }}>
                          {docType || "—"}
                        </td>


                        {/* Control Code + title */}
                        <td style={{ padding: "4px 8px", verticalAlign: "middle", maxWidth: "220px" }}>
                          <span style={{ display: "block", fontFamily: "monospace", fontWeight: 700, fontSize: "12px", color: "#374151" }}>
                            {controlCode}
                          </span>
                          {controlTitle && (
                            <span style={{ display: "block", fontSize: "10px", color: "#6b7280", marginTop: "4px", lineHeight: 1.4, whiteSpace: "normal", wordBreak: "break-word" }}>
                              {controlTitle}
                            </span>
                          )}
                        </td>


                        {/* Ownership */}
                        <td style={{ padding: "4px 8px", textAlign: "center", verticalAlign: "middle" }}>
                          {ownershipLoading ? (
                            <span style={{ fontSize: "11px", color: "#aaa" }}>…</span>
                          ) : ownership.owner || ownership.manager ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "center" }}>
                              {ownership.owner && (
                                <span className="ownership-chip" style={{ background: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd" }}>
                                  👤 {ownership.owner.ownerName || "—"}
                                </span>
                              )}
                              {ownership.manager && (
                                <span className="ownership-chip" style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
                                  🔧 {ownership.manager.ownerName || "—"}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#aaa", fontStyle: "italic" }}>Unassigned</span>
                          )}
                        </td>


                        {/* Department */}
                        <td style={{ padding: "4px 8px", textAlign: "center", verticalAlign: "middle", color: "#475569", fontSize: "11px", fontWeight: 500, fontSize: "13px" }}>
                          {docDept || "—"}
                        </td>


                        {/* CalVant Version */}
                        <td style={{ padding: "4px 8px", textAlign: "center", verticalAlign: "middle", color: "#475569", fontSize: "11px", fontWeight: 500 }}>
                          {doc?.version != null ? (
                            <span style={{ background: "#f0f4ff", color: "#3b5bdb", border: "1px solid #c5d4fb", borderRadius: "6px", padding: "2px 8px", fontSize: "12px", fontWeight: 700 }}>
                              v{doc.version}
                            </span>
                          ) : "—"}
                        </td>


                        {/* Status */}
                        <td style={{ padding: "4px 8px", textAlign: "center", verticalAlign: "middle" }}>
                          <StatusBadge status={status} />
                        </td>


                        {/* Submitted By */}
                        <td style={{ padding: "4px 8px", textAlign: "center", verticalAlign: "middle", color: "#475569", fontSize: "11px", fontWeight: 500 }}>
                          {doc?.uploaderName ?? "—"}
                        </td>


                        {/* Submission Date */}
                        <td style={{ padding: "4px 8px", textAlign: "center", verticalAlign: "middle", color: "#475569", fontSize: "11px", fontWeight: 500 }}>
                          {submissionDate}
                        </td>


                        {/* Approved By */}
                        <td style={{ padding: "4px 8px", textAlign: "center", verticalAlign: "middle", color: "#475569", fontSize: "11px", fontWeight: 500 }}>
                          {doc?.approvalDate ? (approvedBy || user?.name || "—") : "—"}
                        </td>


                        {/* Review Date */}
                        <td style={{ padding: "4px 8px", textAlign: "center", verticalAlign: "middle", color: "#475569", fontSize: "11px", fontWeight: 500 }}>
                          {reviewDate}
                        </td>


                        {/* Upload + inline actions */}
                        <td style={{ padding: "4px 8px", textAlign: "center", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                            {soaId ? (
                              <button
                                id="mld-upload-btn"
                                onClick={() => !isUploaded && handleSingleButtonUpload(soaId, docDept)}
                                disabled={isUploaded || uploading[soaId]}
                                style={{
                                  backgroundColor: isUploaded ? "#ecfdf5" : "#f1f5f9",
                                  border: isUploaded ? "1px solid #10b981" : "1px solid #cbd5e1",
                                  borderRadius: "6px", padding: "4px 8px",
                                  cursor: isUploaded ? "default" : "pointer",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: isUploaded ? "#059669" : "#475569", minWidth: "120px",
                                  fontWeight: 600, fontSize: "12px",
                                }}
                              >
                                {uploading[soaId] ? (
                                  <><UploadCloud size={14} style={{ marginRight: "6px" }} />Uploading…</>
                                ) : isUploaded ? (
                                  <><Check size={14} style={{ marginRight: "6px" }} />Uploaded</>
                                ) : (
                                  <><UploadCloud size={14} style={{ marginRight: "6px" }} />Upload</>
                                )}
                              </button>
                            ) : (
                              <span style={{ fontSize: "11px", color: "#aaa", fontStyle: "italic", whiteSpace: "nowrap" }}>Not assessed</span>
                            )}


                            {isUploaded && soaId && (
                              <div 
                                style={{ position: "relative", marginTop: "4px", width: "100%", maxWidth: "120px" }}
                                tabIndex={-1}
                                onBlur={(e) => {
                                  if (!e.currentTarget.contains(e.relatedTarget)) {
                                    e.currentTarget.lastChild.style.display = "none";
                                  }
                                }}
                              >
                                <button 
                                  onClick={(e) => { 
                                    const dd = e.currentTarget.nextElementSibling;
                                    dd.style.display = dd.style.display === "flex" ? "none" : "flex"; 
                                  }}
                                  style={{ backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, width: "100%" }}
                                >
                                  Actions <span style={{ fontSize: "9px" }}>▼</span>
                                </button>
                                
                                <div style={{ display: "none", position: "absolute", top: "100%", right: "0", marginTop: "4px", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: "6px", flexDirection: "column", gap: "4px", zIndex: 100, minWidth: "120px" }}>
                                  {doc?.approvalDate ? (
                                    <div style={{ backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #10b981", padding: "4px 6px", borderRadius: "4px", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
                                      Approved
                                    </div>
                                  ) : (
                                    <button
                                      onClick={handleApprove}
                                      title={checker.canApprove(doc.id)
                                        ? "Approve this policy"
                                        : `Requires a passing quality check (≥${APPROVAL_THRESHOLD}% with matching title)`}
                                      style={{
                                        backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #10b981", borderRadius: "4px", padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 600, width: "100%",
                                        opacity: checker.canApprove(doc.id) ? 1 : 0.45,
                                      }}
                                    >
                                      Approve
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setDeleteModal({ open: true, docId: doc.id, comment: "" })}
                                    style={{ backgroundColor: "#fef3c7", color: "#d97706", border: "1px solid #f59e0b", borderRadius: "4px", padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 600, width: "100%" }}
                                  >
                                    Archive
                                  </button>
                                  <button
                                    onClick={async () => {
                                      captureActivity({ action: ACTIONS.CLICK, item: "Documentation · Checked version history for document " + doc.id, url: "/documentation/mld" });
                                      const versions = await documentationService.getDocVersions(doc.id);
                                      const safe = versions.filter((v) => v.organization === effectiveOrgId);
                                      setDocVersions((prev) => ({ ...prev, [doc.id]: safe }));
                                      setModal({
                                        isOpen: true, 
                                        title: <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Calendar size={18} color="#3b82f6" /> Version History</div>,
                                        showCancel: false,
                                        onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
                                        message: (
                                          <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                                            <thead>
                                              <tr style={{ backgroundColor: "#f8fafc" }}>
                                                {["CalVant Version", "Submitted By", "Submission Date", "Remarks", "Deleted At"].map((h) => (
                                                  <th key={h} style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                                                ))}
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {safe.map((v, i) => (
                                                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                                  <td style={{ padding: "10px 12px", fontSize: "12px", fontWeight: 500, color: "#334155" }}>v{v.version}</td>
                                                  <td style={{ padding: "10px 12px", fontSize: "12px", color: "#475569" }}>{v.uploaderName}</td>
                                                  <td style={{ padding: "10px 12px", fontSize: "12px", color: "#475569" }}>{v.approvalDate ? new Date(v.approvalDate).toLocaleDateString() : "—"}</td>
                                                  <td style={{ padding: "10px 12px", fontSize: "12px", color: "#475569", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={v.deleteComment || ""}>{v.deleteComment ?? "—"}</td>
                                                  <td style={{ padding: "10px 12px", fontSize: "12px", color: "#475569" }}>{v.deletedAt ? new Date(v.deletedAt).toLocaleDateString() : "—"}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        ),
                                      });
                                    }}
                                    style={{ backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #3b82f6", borderRadius: "4px", padding: "4px 6px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, width: "100%" }}
                                  >
                                    History
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>


                        {/* Remarks */}
                        <td style={{ padding: "4px 8px", textAlign: "center", color: "#2c3e50", fontSize: "12px" }}>
                          {doc?.deleteComment ?? "—"}
                        </td>


                        {/* ── NEW: Quality Check cell (doc-checker) ── */}
                        <td style={{ padding: "4px 8px", textAlign: "center", verticalAlign: "middle", background: "#f6fbf7" }}>
                          {docCheckRow ? (
                            <VerifyCell
                              row={docCheckRow}
                              onVerify={checker.verify}
                              result={checker.getResult(doc.id)}
                              busy={checker.isVerifying(doc.id)}
                              error={checker.getError(doc.id)}
                            />
                          ) : (
                            <span style={{ fontSize: "11px", color: "#aaa", fontStyle: "italic" }}>—</span>
                          )}
                        </td>


                        {/* ── NEW: Add Task cell ── */}
                        <td style={{ padding: "4px 8px", textAlign: "center", verticalAlign: "middle", background: "#f8f9ff" }}>
                          <button
                            className="add-task-btn"
                            onClick={() => setAddTaskModal({ open: true, row: taskRow })}
                            title={`Create a task for control ${cId}`}
                          >
                            <Plus size={12} />
                            Add Task
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Preview Modal */}
      {previewModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", display: "flex",
          justifyContent: "center", alignItems: "flex-start", paddingTop: "80px", zIndex: 999,
        }}>
          <div style={{ background: "white", borderRadius: "12px", width: "85vw", height: "85vh", overflow: "hidden", position: "relative" }}>
            <button
              onClick={closePreviewModal}
              style={{ position: "absolute", top: "12px", right: "12px", background: "#e74c3c", color: "white", border: "none", borderRadius: "50%", width: "30px", height: "30px", fontWeight: 600, cursor: "pointer", zIndex: 1 }}
            >
              ×
            </button>
            <iframe src={previewUrl} title="Preview Policy" style={{ width: "100%", height: "100%", border: "none" }} />
          </div>
        </div>
      )}

      <Modal
        isOpen={modal.isOpen} title={modal.title} message={modal.message}
        onClose={() => setModal((m) => ({ ...m, isOpen: false }))}
        onConfirm={modal.onConfirm} showCancel={modal.showCancel}
      />

      <Modal
        isOpen={deleteModal.open} 
        title={<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Trash2 size={18} color="#ef4444" /> Archive Policy</div>} 
        showCancel
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={async () => {
          try {
            await documentationService.deleteDocument(deleteModal.docId, deleteModal.comment);
            captureActivity({
              action: ACTIONS.DELETE,
              item: "Documentation · Archived policy " + deleteModal.docId + (deleteModal.comment ? " — Reason: " + deleteModal.comment : ""),
              url: "/documentation/mld",
            });
            setDocuments((prev) =>
              prev.map((d) =>
                d.id === deleteModal.docId
                  ? { ...d, deleteComment: deleteModal.comment, deleted: true, archivedAt: new Date().toISOString() }
                  : d
              )
            );
            setDeleteModal({ open: false });
            setModal({
              isOpen: true, title: "Archived",
              message: "Policy moved to Archive. You can permanently delete it from the Archived section in the dashboard.",
              showCancel: false, onConfirm: () => setModal((m) => ({ ...m, isOpen: false })),
            });
          } catch (e) { console.error(e); }
        }}
        message={
          <div style={{ textAlign: "left" }}>
            <p style={{ marginBottom: "16px", fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
              This policy will be moved to <strong>Archive</strong>. You can permanently delete it from the dashboard's Archived section.
            </p>
            <textarea
              placeholder="Enter reason for archiving (Remarks)..."
              value={deleteModal.comment}
              onChange={(e) => setDeleteModal((m) => ({ ...m, comment: e.target.value }))}
              style={{ 
                width: "100%", minHeight: 90, padding: "12px", borderRadius: "8px", 
                border: "1px solid #cbd5e1", backgroundColor: "#f8fafc",
                fontSize: "13px", color: "#334155", outline: "none", resize: "none",
                fontFamily: "inherit", boxSizing: "border-box"
              }}
              onFocus={(e) => { e.target.style.border = "1px solid #3b82f6"; e.target.style.backgroundColor = "#ffffff"; }}
              onBlur={(e) => { e.target.style.border = "1px solid #cbd5e1"; e.target.style.backgroundColor = "#f8fafc"; }}
            />
          </div>
        }
      />

      {/* ── NEW: Doc-checker approval gate modal ── */}
      {gateModal.open && (
        <ApproveGateModal
          docId={gateModal.docId}
          checker={checker}
          onClose={() => setGateModal({ open: false, docId: null })}
        />
      )}

      {/* ── NEW: Add Task Modal ── */}
      {addTaskModal.open && (
        <AddTaskModal
          row={addTaskModal.row}
          user={user}
          users={taskUsers}
          departments={taskDepartments}
          effectiveOrgId={effectiveOrgId}
          onClose={() => setAddTaskModal({ open: false, row: null })}
          onSuccess={() => {
            const name = addTaskModal.row?.docName || addTaskModal.row?.cId || "control";
            setTaskSuccessMsg(`Task created for "${name}" — visible in Task Management & My Tasks.`);
            setTimeout(() => setTaskSuccessMsg(""), 6000);
          }}
        />
      )}

      <footer style={{
        position: "fixed", bottom: 0, left: 0, width: "100%",
        background: "white", color: "#9ca3af", padding: "12px",
        textAlign: "center", fontSize: "13px", zIndex: 700,
      }}>
        © {new Date().getFullYear()} CalVant. All rights reserved.
      </footer>
    </div>
  );
};

// shared TH style to avoid repetition
const thStyle = {
  padding: "4px 8px", textAlign: "center", borderBottom: "2px solid #e2e8f0",
  fontWeight: 700, fontSize: 11,
  color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em",
  whiteSpace: "nowrap", background: "#f8fafc"
};

export default MLD;
