
import Link from 'next/link';
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowUpRight } from "lucide-react";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import ReactDOM from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveTaskSource } from "../utils/taskSourceResolver";
import {
  ClipboardList,
  Zap,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Search,
  Plus,
  ClipboardCheck,
  ShieldAlert,
  Archive,
  RotateCcw,
  Trash2,
  ChevronDown,
} from "lucide-react";
import InputField from "../components copy/inputs/InputField";
import SelectField from "../components copy/inputs/SelectField";
import TextAreaField from "../components copy/inputs/TextAreaField";
import TaskDetailPanel from "./Taskdetailpanel";
import taskService from "../services/taskService";
import riskService from "../services/riskService";
import {
  getAllUsers,
  getDepartments,
} from "../../departments/services/userService";
import auditService from "../../gapAssessment/services/auditService";

// ── Logging ───────────────────────────────────────────────────────────────────
import { captureActivity, ACTIONS, MODULES } from "../../admin/shell/services/activities";

// ── Shared Styles ─────────────────────────────────────────────────────────────
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

const selectStyle = Object.assign({}, inputStyle, {
  appearance: "none",
  WebkitAppearance: "none",
});

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 5,
};

const btnPrimary = {
  border: "none",
  cursor: "pointer",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 13,
  padding: "10px 22px",
  color: "#fff",
};

// ─── Constants (LOGIC UNCHANGED) ──────────────────────────────
const STATUS = {
  TODO: "To-Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  ON_HOLD: "On Hold",
};
const PRIORITY = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};
const STATUS_CONFIG = {
  "To-Do": { bg: "#f1f3f5", color: "#495057", dot: "#868e96" },
  "In Progress": { bg: "#e7f5ff", color: "#1971c2", dot: "#339af0" },
  Done: { bg: "#ebfbee", color: "#2f9e44", dot: "#40c057" },
  "On Hold": { bg: "#fff5f5", color: "#c92a2a", dot: "#fa5252" },
};
const PRIORITY_CONFIG = {
  Low: { color: "#2f9e44", bg: "#ebfbee", icon: "▼" },
  Medium: { color: "#f59f00", bg: "#fff9db", icon: "■" },
  High: { color: "#e8590c", bg: "#fff4e6", icon: "▲" },
  Critical: { color: "#c92a2a", bg: "#fff5f5", icon: "⚑" },
};
function getSourceModule(task) {
  // Prioritize the explicit Type / SubType chosen in the create/edit form.
  if (task.type === "Module Based" && task.subType) {
    const MODULE_SOURCE_MAP = {
      Risk: { label: "Risk", bg: "#e7f5ff", color: "#1971c2" },
      Audit: { label: "Audit", bg: "#fff9db", color: "#e67700" },
      Policies: { label: "Policy", bg: "#fdf4ff", color: "#7e22ce" },
      DPIA: { label: "DPIA", bg: "#fdf4ff", color: "#7c3aed" },
      AIIA: { label: "AIIA", bg: "#eff6ff", color: "#2563eb" },
      Compliance: { label: "Compliance", bg: "#f0fdf4", color: "#166534" },
      Reports: { label: "Reports", bg: "#f0f9ff", color: "#0369a1" },
      Vendor: { label: "Vendor", bg: "#fdf2f8", color: "#be185d" },
    };
    if (MODULE_SOURCE_MAP[task.subType]) return MODULE_SOURCE_MAP[task.subType];
  }
  if (task.type === "Framework Based" && task.subType) {
    return { label: task.subType, bg: "#eef2ff", color: "#4338ca" };
  }
  if (task.type === "General") {
    return { label: "General", bg: "#f1f3f5", color: "#868e96" };
  }

  // Legacy fallback — for tasks created before Type/SubType existed, or
  // auto-created directly by Risk/Audit/DPIA/Policy/Compliance modules.
  if (task.source === "Policy") return { label: "Policy", bg: "#fdf4ff", color: "#7e22ce" };
  if (task.source === "Compliance" || task.controlId) return { label: "Compliance", bg: "#f0fdf4", color: "#166534" };
  if (task.riskId) return { label: "Risk", bg: "#e7f5ff", color: "#1971c2" };
  if (task.auditId) return { label: "Audit", bg: "#fff9db", color: "#e67700" };
  if (task.dpiaId || task.source === "DPIA") return { label: "DPIA", bg: "#fdf4ff", color: "#7c3aed" };
  return { label: "General", bg: "#f1f3f5", color: "#868e96" };
}
const statusOptions = Object.values(STATUS);
const priorityOptions = Object.values(PRIORITY);

// ─── Task Type / SubType (NEW) ─────────────────────────────────────────────
// Type renamed: Module Based / Framework Based / General — Type and Sub Type
// are both mandatory on the create/edit form now.
const TASK_TYPES = ["Module Based", "Framework Based", "General"];
// Module Based sub types — Reports and Vendor added alongside the originals.
const MODULE_SUBTYPES = ["Risk", "Audit", "Policies", "DPIA", "AIIA", "Compliance", "Reports", "Vendor"];
// General type only ever has one sub type value.
const GENERAL_SUBTYPES = ["General"];
// Framework Based sub types — client-subscribed framework codes only
// (dropdown shows the code, not the full framework name).
const FRAMEWORK_OPTIONS = [
  "ISO 42001:2023",
  "KSA PDPL",
  "DPDPA",
  "ISR V3.1",
  "NIST CSF 2.0",
  "HIPAA",
  "GDPR",
  "ISO 27001:2022",
  "CSCRF",
  "SOC2",
  "ISO 27701:2025",
  "ISO 27017:2015",
  "EU AI ACT",
  "PCI DSS V4.0.1",
];

// ─── Overdue / Due Soon helpers ────────────────────────────────
const DUE_SOON_DAYS = 3;
function isOverdueTask(t) {
  return !!t.endDate && new Date(t.endDate) < new Date() && t.status !== STATUS.DONE;
}
function isDueSoonTask(t) {
  if (!t.endDate || t.status === STATUS.DONE) return false;
  const diffDays = (new Date(t.endDate) - new Date()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= DUE_SOON_DAYS;
}

// ─── Stat Card (matching TemplatesPage exactly, now clickable) ─
const STAT_CONFIG = {
  Total: { gradient: "linear-gradient(135deg,#4f8ef7,#2563eb)", Icon: ClipboardList },
  "In Progress": { gradient: "linear-gradient(135deg,#339af0,#1971c2)", Icon: Zap },
  Done: { gradient: "linear-gradient(135deg,#10b981,#059669)", Icon: CheckCircle2 },
  Overdue: { gradient: "linear-gradient(135deg,#ef4444,#dc2626)", Icon: AlertOctagon },
  "On Track": { gradient: "linear-gradient(135deg,#f59e0b,#d97706)", Icon: Clock },
};

function StatCard({ value, label, index, active, onClick }) {
  const s = STAT_CONFIG[label] || STAT_CONFIG["Total"];
  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        border: `1.5px solid ${active ? "#3b82f6" : "#f1f5f9"}`,
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: active ? "0 4px 14px rgba(37,99,235,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        transition: "box-shadow 0.2s, border-color 0.2s",
        animation: `cardIn 0.4s ease ${index * 0.05}s both`,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.09)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = active ? "0 4px 14px rgba(37,99,235,0.15)" : "0 1px 4px rgba(0,0,0,0.05)")
      }
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: s.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
      >
        <s.Icon size={16} color="white" strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1e293b",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginTop: 2,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Pills (matching TemplatesPage style) ─────────────────────
function StatusPill({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG["To-Do"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        background: c.bg,
        color: c.color,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />
      {status}
    </span>
  );
}

function PriorityPill({ priority }) {
  const c = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["Medium"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 20,
        background: c.bg,
        color: c.color,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      <span style={{ fontSize: 9 }}>{c.icon}</span>
      {priority}
    </span>
  );
}

// ─── Helpers (LOGIC UNCHANGED) ────────────────────────────────
function formatDate(d) {
  if (!d) return "—";
  const s = d.split("T")[0].split("-");
  return `${s[2]}-${s[1]}-${s[0]}`;
}
function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function initials(name) {
  return (name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
const AV_COLORS = ["#7950f2", "#1971c2", "#0ca678", "#e8590c", "#c2255c", "#f59f00", "#364fc7"];
function avColor(name) {
  return AV_COLORS[(name || "").charCodeAt(0) % AV_COLORS.length];
}
function resolveEmployeeName(employeeField, users) {
  if (!employeeField) return null;
  const byId = users.find((u) => String(u._id || u.id) === String(employeeField));
  return byId ? byId.name : employeeField;
}

function Avatar({ name, size = 26 }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: avColor(name), color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, fontWeight: "700", flexShrink: 0, userSelect: "none",
      }}
    >
      {initials(name)}
    </div>
  );
}

// ─── Portal InlineSelect (LOGIC UNCHANGED) ────────────────────
function InlineSelect({ value, options, onSave, renderValue, disabled }) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const triggerRef = React.useRef();
  const portalRef = React.useRef();
  const openDropdown = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (open) { setOpen(false); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setDropPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  };
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (portalRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div ref={triggerRef} style={{ display: "inline-block" }}>
      <div onClick={openDropdown} style={{ cursor: disabled ? "default" : "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
        {renderValue(value)}
        {!disabled && <span style={{ fontSize: 9, color: "#94a3b8" }}>▾</span>}
      </div>
      {open && ReactDOM.createPortal(
        <div
          ref={portalRef}
          style={{
            position: "fixed", top: dropPos.top, left: dropPos.left,
            background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,.12)", zIndex: 99999,
            minWidth: 150, overflow: "hidden", animation: "portalDropIn 0.12s ease",
          }}
        >
          {options.map((opt) => (
            <div
              key={opt}
              onMouseDown={(e) => { e.stopPropagation(); onSave(opt); setOpen(false); }}
              style={{
                padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: opt === value ? "#f8fafc" : "#fff", color: "#334155",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseOut={(e) => (e.currentTarget.style.background = opt === value ? "#f8fafc" : "#fff")}
            >
              {opt}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

// ─── Portal InlineAssignee (LOGIC UNCHANGED) ──────────────────
function InlineAssignee({ employeeField, users, onSave, disabled }) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const triggerRef = React.useRef();
  const portalRef = React.useRef();
  const displayName = resolveEmployeeName(employeeField, users) || "Unassigned";
  const openDropdown = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (open) { setOpen(false); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setDropPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  };
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (portalRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div ref={triggerRef} style={{ display: "inline-block" }}>
      <div
        onClick={openDropdown}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          cursor: disabled ? "default" : "pointer",
          padding: "2px 4px", borderRadius: 6, transition: "background 0.15s",
        }}
        onMouseOver={(e) => { if (!disabled) e.currentTarget.style.background = "#f1f5f9"; }}
        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Avatar name={displayName} size={22} />
        <span title={displayName} style={{ fontSize: 12, fontWeight: 600, color: "#334155", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayName}
        </span>
        {!disabled && <span style={{ fontSize: 9, color: "#94a3b8" }}>▾</span>}
      </div>
      {open && ReactDOM.createPortal(
        <div
          ref={portalRef}
          style={{
            position: "fixed", top: dropPos.top, left: dropPos.left,
            background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,.12)", zIndex: 99999,
            minWidth: 190, maxHeight: 240, overflowY: "auto",
            animation: "portalDropIn 0.12s ease",
          }}
        >
          {users.map((u) => (
            <div
              key={u._id || u.id}
              onMouseDown={(e) => { e.stopPropagation(); onSave(u.name); setOpen(false); }}
              style={{
                padding: "8px 12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                background: u.name === displayName ? "#f8fafc" : "#fff",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseOut={(e) => (e.currentTarget.style.background = u.name === displayName ? "#f8fafc" : "#fff")}
            >
              <Avatar name={u.name} size={22} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{u.name}</span>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

// ─── Status Change Modal (restyled to match TemplatesPage modals) ──
function StatusChangeModal({ currentStatus, newStatus, onConfirm, onCancel }) {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState(false);
  const textRef = React.useRef();
  useEffect(() => { setTimeout(() => textRef.current?.focus(), 80); }, []);
  const handleConfirm = () => {
    if (!remarks.trim()) { setError(true); return; }
    onConfirm(remarks.trim());
  };
  return (
    <div
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.02)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1400, padding: 20,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "white", borderRadius: 14, padding: "32px 28px",
          maxWidth: 460, width: "100%", textAlign: "center",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          animation: "fadeUp 0.25s ease both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 52, height: 52, borderRadius: 12,
            margin: "0 auto 16px",
            background: "linear-gradient(135deg,#f59e0b,#d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <ShieldAlert size={22} color="white" strokeWidth={2} />
        </div>
        <h3 style={{ margin: "0 0 8px", color: "#1e293b", fontSize: 17, fontWeight: 700 }}>
          Status Change
        </h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 18 }}>
          <StatusPill status={currentStatus} />
          <span style={{ color: "#94a3b8", fontSize: 14 }}>→</span>
          <StatusPill status={newStatus} />
        </div>
        <p style={{ color: "#64748b", margin: "0 0 14px", fontSize: 13, lineHeight: 1.6 }}>
          Remarks <span style={{ color: "#ef4444" }}>*</span>
          <span style={{ fontWeight: 400, marginLeft: 4 }}>(required)</span>
        </p>
        <textarea
          ref={textRef}
          value={remarks}
          onChange={(e) => { setRemarks(e.target.value); if (e.target.value.trim()) setError(false); }}
          placeholder="Explain the reason for this status change..."
          rows={3}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 8,
            border: `1.5px solid ${error ? "#ef4444" : "#e2e8f0"}`,
            fontSize: 13, resize: "vertical", boxSizing: "border-box",
            outline: "none", background: error ? "#fef2f2" : "#f8fafc",
            textAlign: "left",
          }}
          onFocus={(e) => { e.target.style.borderColor = error ? "#ef4444" : "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.1)"; }}
          onBlur={(e) => { e.target.style.borderColor = error ? "#ef4444" : "#e2e8f0"; e.target.style.background = error ? "#fef2f2" : "#f8fafc"; e.target.style.boxShadow = "none"; }}
        />
        {error && (
          <div style={{ marginTop: 6, fontSize: 12, color: "#ef4444", fontWeight: 600, textAlign: "left" }}>
            ⚠ Please enter remarks before changing the status.
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 22px", borderRadius: 8, border: "1.5px solid #e2e8f0",
              background: "white", color: "#475569", fontWeight: 600, fontSize: 13, cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "10px 22px", borderRadius: 8,
              background: "linear-gradient(135deg,#3b82f6,#2563eb)",
              color: "white", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37,99,235,0.25)", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.25)"; }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function TaskManagement({ riskFormData = {}, auditFormData = {} }) {
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
  const today = new Date().toISOString().split("T")[0];
  const currentUserName = user?.name || user?.username || "System";

  const userRoles = Array.isArray(user?.role) ? user.role : [user?.role || ""];
  const hasAnyRole = (...roles) => roles.some((r) => userRoles.includes(r));
  const canEdit = hasAnyRole("risk_owner", "root", "super_admin");
  // NEW: archive / restore / permanent-delete is root-level only
  const canArchive = hasAnyRole("root", "super_admin");
  // NEW: Department Task broadened visibility — risk_owner / process_owner only
  const canSeeDeptTasks = hasAnyRole("risk_owner", "process_owner");

  const scopedRiskId = riskFormData?.riskId || null;
  const scopedAuditId = auditFormData?.auditId || null;
  const userOrgId = effectiveOrgId;

  // NEW: active vs archived ("bin") view, driven by ?view=archived
  const viewMode = searchParams.get("view") === "archived" ? "archived" : "active";
  const incomingFilter = searchParams.get("filter");
  const isCreateMode = searchParams.get("openCreate") === "true";

  const contextLabel = scopedRiskId
    ? "Risk Assessment"
    : scopedAuditId
      ? "Audit"
      : viewMode === "archived"
        ? "Archived Tasks"
        : "Task Management";
  const contextScopeId = scopedRiskId || scopedAuditId || null;
  const [audits, setAudits] = useState([]);

  useEffect(() => {
    auditService.getAudits().then((data) => setAudits(Array.isArray(data) ? data : []));
  }, []);

  const [tasks, setTasks] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskSuccessData, setTaskSuccessData] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const TASKS_PER_PAGE = 15;
  const [statusModal, setStatusModal] = useState(null);
  // ── "due" = derived Overdue/Due Soon filter. "mine" = My Task / Reported
  // Task scoping (subset of what's already visible). "assignee"/"reporter"
  // now hold the selected USER ID (not name) — fixes the "selected name not
  // showing" bug, since native <select> matching on name could silently fail
  // on whitespace/case mismatches; ids are guaranteed unique. ──
  const [filters, setFilters] = useState({ status: "", assignee: "", reporter: "", search: "", due: "", mine: "" });

  useEffect(() => {
    const incoming = searchParams.get("filter");
    if (!incoming) return;
    if (incoming === "done") {
      setFilters((p) => ({ ...p, status: STATUS.DONE, due: "", mine: "" }));
    } else if (incoming === "overdue" || incoming === "onTrack") {
      setFilters((p) => ({ ...p, status: "", due: incoming, mine: "" }));
    } else if (incoming === "all") {
      setFilters((p) => ({ ...p, status: "", due: "", mine: "" }));
    } else if (incoming === "myTask") {
      setFilters((p) => ({ ...p, status: "", due: "", mine: "assigned" }));
    } else if (incoming === "reportedTask") {
      setFilters((p) => ({ ...p, status: "", due: "", mine: "reported" }));
    } else if (incoming === "departmentTask") {
      setFilters((p) => ({ ...p, status: "", due: "", mine: "" }));
    }
  }, [searchParams]);

  // scroll-hide back (LOGIC UNCHANGED)
  const [showBack, setShowBack] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  useEffect(() => {
    const h = () => { setShowBack(window.scrollY <= lastScrollY); setLastScrollY(window.scrollY); };
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, [lastScrollY]);

  const emptyForm = () => ({
    taskId: "", riskId: scopedRiskId || "", auditId: scopedAuditId || "",
    organization: effectiveOrgId || "", department: "",
    employee: "", employeeName: "", employeeId: "",
    description: "", startDate: today, endDate: "",
    status: STATUS.TODO, priority: PRIORITY.MEDIUM, remarks: "",
    type: "", subType: "", // NEW
    createdAt: null, updatedAt: null, originalTask: null,
  });
  const [formData, setFormData] = useState(emptyForm());
  const formDataRef = React.useRef(null);
  const setForm = (val) => {
    const next = typeof val === "function" ? val(formDataRef.current || emptyForm()) : val;
    formDataRef.current = next;
    setFormData(next);
  };

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    let m = true;
    setIsLoading(true);
    getDepartments()
      .then((d) => m && setDepartments(Array.isArray(d) ? d.filter((dept) => dept.organization === effectiveOrgId) : []))
      .catch(console.error)
      .finally(() => m && setIsLoading(false));
    return () => (m = false);
  }, [effectiveOrgId]);

  useEffect(() => {
    let m = true;
    getAllUsers()
      .then((r) => m && setUsers(Array.isArray(r) ? r.filter((u) => u.organization === effectiveOrgId) : []))
      .catch(console.error);
    return () => (m = false);
  }, [effectiveOrgId]);

  // ── Visibility rule:
  //   • root sees the whole org's tasks.
  //   • everyone else sees tasks where they are the ASSIGNEE *or* the
  //     REPORTER (previously reporter-only tasks were invisible — fixed).
  //   • Department Task (risk_owner/process_owner only) broadens further to
  //     the whole department, ignoring assignee/reporter.
  //   • Archived view fetches the bin instead, and is root/super_admin only.
  const fetchTasks = useCallback(async () => {
    if (userOrgId) {
      captureActivity({ action: ACTIONS.VISITED, module: MODULES.TASK });
    }

    try {
      const all = viewMode === "archived"
        ? await taskService.getArchivedTasks()
        : await taskService.getAllTasks();
      const orgTasks = all.filter((t) => String(t.organization) === String(userOrgId));

      let scoped;
      if (scopedRiskId) scoped = orgTasks.filter((t) => t.riskId === scopedRiskId);
      else if (scopedAuditId) scoped = orgTasks.filter((t) => t.auditId === scopedAuditId);
      else scoped = orgTasks;

      if (viewMode === "archived") {
        // The bin is a root-level concept — nobody else sees its contents.
        scoped = canArchive ? scoped : [];
      } else if (!isRoot) {
        if (incomingFilter === "departmentTask" && canSeeDeptTasks) {
          const deptNames = (user?.departments || []).map((d) => (d.name || "").trim().toLowerCase());
          scoped = scoped.filter(
            (t) => t.department && deptNames.includes(String(t.department).trim().toLowerCase()),
          );
        } else {
          scoped = scoped.filter((t) => {
            const emp = t.employee;
            const rep = t.reporter;
            const isAssignee = !!emp && (
              String(emp) === String(user?._id || user?.id) ||
              emp === currentUserName ||
              emp === user?.name
            );
            const isReporter = !!rep && (
              rep === currentUserName ||
              rep === user?.name ||
              String(rep) === String(user?._id || user?.id)
            );
            return isAssignee || isReporter;
          });
        }
      }

      setTasks(scoped);
    } catch (e) { console.error(e); }
  }, [scopedRiskId, scopedAuditId, userOrgId, isRoot, user, currentUserName, viewMode, canArchive, canSeeDeptTasks, incomingFilter]);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const empOptions = useMemo(() => {
    return (users || []).filter((u) => u.name).map((u) => ({ value: String(u._id || u.id || ""), label: u.name }));
  }, [users]);

  const inlineUpdate = useCallback(async (taskId, patch) => {
    const task = tasks.find((t) => t.taskId === taskId);
    if (!task) return;
    const updated = { ...task, ...patch, updatedAt: new Date().toISOString() };
    try {
      await taskService.updateTask(taskId, updated, currentUserName);
      setTasks((prev) => prev.map((t) => (t.taskId === taskId ? updated : t)));
      if (selectedTask?.taskId === taskId) setSelectedTask(updated);

      if (!("status" in patch)) {
        captureActivity({
          action: ACTIONS.MODIFIED,
          module: MODULES.TASK,
          item: `${taskId} - ${Object.keys(patch).join(", ")} changed`,
        });
      }
    } catch { alert("Failed to update"); }
  }, [tasks, currentUserName, selectedTask]);

  const requestStatusChange = useCallback((taskId, newStatus) => {
    const task = tasks.find((t) => t.taskId === taskId);
    if (!task || task.status === newStatus) return;
    setStatusModal({ taskId, currentStatus: task.status, newStatus });
  }, [tasks]);

  const confirmStatusChange = useCallback(async (remarks) => {
    if (!statusModal) return;
    const { taskId, currentStatus, newStatus } = statusModal;
    setStatusModal(null);
    await inlineUpdate(taskId, { status: newStatus, remarks });
    captureActivity({
      action: ACTIONS.UPDATED,
      module: MODULES.TASK,
      item: `Status changed (${taskId}): ${currentStatus} → ${newStatus}`,
    });
  }, [statusModal, inlineUpdate]);

  const handleTaskUpdate = useCallback((updated) => {
    setTasks((prev) => prev.map((t) => (t.taskId === updated.taskId ? updated : t)));
    setSelectedTask(updated);
  }, []);

  const openAddModal = () => {
    setEditingTaskId(null);
    setTaskSuccessData(null);
    const ef = emptyForm();
    formDataRef.current = ef;
    setFormData(ef);
    setIsModalOpen(true);
  };

  // NEW: dashboard's "Create Task" quick action links here with ?openCreate=true
  useEffect(() => {
    if (searchParams.get("openCreate") === "true" && canEdit && viewMode === "active") {
      openAddModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, canEdit, viewMode]);

  const editTask = (task) => {
    captureActivity({ action: ACTIONS.CLICK, module: MODULES.TASK, item: `Edit Task - ${task.taskId}` });
    setEditingTaskId(task.taskId);
    const resolvedName = resolveEmployeeName(task.employee, users);
    const matchedUser = users.find((u) => u.name === resolvedName);
    setForm({
      taskId: task.taskId, riskId: task.riskId || "", auditId: task.auditId || "",
      organization: task.organization || effectiveOrgId || "",
      department: task.department || "",
      employee: resolvedName || "", employeeId: matchedUser?._id || "",
      employeeName: resolvedName || "", description: task.description || "",
      startDate: task.startDate || today, endDate: task.endDate || "",
      status: task.status || STATUS.TODO, priority: task.priority || PRIORITY.MEDIUM,
      remarks: task.remarks || "",
      type: task.type || "", subType: task.subType || "", // NEW
      createdAt: task.createdAt || null,
      updatedAt: task.updatedAt || null, originalTask: task,
    });
    setIsModalOpen(true);
  };

  const saveTask = async () => {
    const fd = formDataRef.current || formData;
    if (!fd.department || !fd.startDate || !fd.endDate || !fd.description || !fd.type || !fd.subType) {
      alert("Please fill all required fields, including Type and Sub Type!"); return;
    }
    if (new Date(fd.endDate) < new Date(fd.startDate)) {
      alert("End date cannot be before start date."); return;
    }
    let employeeName = fd.employeeName || fd.employee || "";
    if (!employeeName) {
      if (fd.department) {
        const myDeptObj = departments.find((d) => String(d._id || d.id) === String(user?.department));
        if (myDeptObj?.name === fd.department) {
          employeeName = currentUserName;
        } else {
          const owner = users.find((u) => {
            const dObj = departments.find((d) => String(d._id || d.id) === String(u.department));
            const isOwner = Array.isArray(u.role) ? u.role.includes("risk_owner") : u.role === "risk_owner";
            return dObj?.name === fd.department && isOwner;
          });
          employeeName = owner ? owner.name : currentUserName;
        }
      } else { employeeName = currentUserName; }
    }
    const assigneeUser = users.find((u) => u.name === employeeName);
    const employeeEmail = assigneeUser?.email || assigneeUser?.emailAddress || "";
    const reporterUser = users.find((u) => u.name === currentUserName);
    const reporterEmail = reporterUser?.email || reporterUser?.emailAddress || user?.email || "";
    setIsSaving(true);
    try {
      const payload = {
        taskId: fd.taskId, riskId: fd.riskId || undefined, auditId: fd.auditId || undefined,
        organization: effectiveOrgId, department: fd.department,
        employee: employeeName, employeeName, employeeEmail,
        description: fd.description, startDate: fd.startDate, endDate: fd.endDate,
        status: editingTaskId ? fd.status : STATUS.TODO,
        priority: fd.priority || PRIORITY.MEDIUM,
        type: fd.type || undefined, subType: fd.subType || undefined, // NEW
        reporter: currentUserName, reporterEmail, remarks: fd.remarks,
        createdAt: fd.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (editingTaskId) {
        await taskService.updateTask(editingTaskId, payload, currentUserName);
        setTasks((prev) => prev.map((t) => (t.taskId === editingTaskId ? { ...t, ...payload } : t)));
        captureActivity({ action: ACTIONS.UPDATED, module: MODULES.TASK, item: `${editingTaskId} - ${fd.description}` });
      } else {
        await taskService.saveTask(payload, currentUserName);
        await fetchTasks();
          captureActivity({ action: ACTIONS.CREATED, module: MODULES.TASK, item: fd.description });
        }
        if (editingTaskId || !isCreateMode) {
          setIsModalOpen(false);
          setEditingTaskId(null);
        } else {
          setTaskSuccessData(payload);
        }
    } catch { alert(`Failed to ${editingTaskId ? "update" : "add"} task.`); }
    finally { setIsSaving(false); }
  };

  // ── CHANGED: Delete → Archive / Restore / Permanent Delete ──────────────────

  // Soft-delete — moves the task to the Archive/bin, disappears from this list.
  const archiveTask = async (taskId) => {
    if (!window.confirm("Archive this task? It will move to the Archive.")) return;
    try {
      await taskService.archiveTask(taskId, currentUserName);
      setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
      if (selectedTask?.taskId === taskId) setSelectedTask(null);
      captureActivity({ action: ACTIONS.UPDATED, module: MODULES.TASK, item: `Archived - ${taskId}` });
    } catch { alert("Failed to archive task."); }
  };

  // Brings a task back out of the Archive/bin into active tasks.
  const restoreTask = async (taskId) => {
    if (!window.confirm("Restore this task back to active tasks?")) return;
    try {
      await taskService.restoreTask(taskId, currentUserName);
      setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
      if (selectedTask?.taskId === taskId) setSelectedTask(null);
      captureActivity({ action: ACTIONS.UPDATED, module: MODULES.TASK, item: `Restored - ${taskId}` });
    } catch { alert("Failed to restore task."); }
  };

  // Permanent removal — only ever called from the Archive/bin view.
  const permanentDeleteTask = async (taskId) => {
    if (!window.confirm("Permanently delete this task? This cannot be undone.")) return;
    try {
      await taskService.deleteTask(taskId, currentUserName);
      setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
      if (selectedTask?.taskId === taskId) setSelectedTask(null);
      captureActivity({ action: ACTIONS.DELETE, module: MODULES.TASK, item: `Permanently deleted - ${taskId}` });
    } catch { alert("Failed to permanently delete task."); }
  };

  const filteredTasks = useMemo(() => {
    const s = (filters.search || "").toLowerCase();
    return tasks.filter((t) => {
      if (filters.status && t.status !== filters.status) return false;
      if (filters.due === "overdue" && !isOverdueTask(t)) return false;
      if (filters.due === "onTrack" && (t.status === STATUS.DONE || isOverdueTask(t))) return false;

      // CHANGED: assignee filter now keyed by user id — fixes selected-name display bug
      if (filters.assignee) {
        const selUser = users.find((u) => String(u._id || u.id) === filters.assignee);
        const r = resolveEmployeeName(t.employee, users);
        if (!selUser || r !== selUser.name) return false;
      }
      // NEW: reporter filter (replaces the old priority filter)
      if (filters.reporter) {
        const selUser = users.find((u) => String(u._id || u.id) === filters.reporter);
        if (!selUser || t.reporter !== selUser.name) return false;
      }
      // NEW: My Task / Reported Task scoping (from the dashboard stat cards)
      if (filters.mine === "assigned") {
        const r = resolveEmployeeName(t.employee, users);
        const isMine = r === currentUserName || r === user?.name || String(t.employee) === String(user?._id || user?.id);
        if (!isMine) return false;
      }
      if (filters.mine === "reported") {
        const isMine = t.reporter === currentUserName || t.reporter === user?.name;
        if (!isMine) return false;
      }

      if (s) {
        const n = (resolveEmployeeName(t.employee, users) || "").toLowerCase();
        if (!(t.description || "").toLowerCase().includes(s) && !n.includes(s)) return false;
      }
      return true;
    });
  }, [tasks, filters, users, currentUserName, user]);

  const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
  const paginatedTasks = useMemo(() => {
    const safeDate = (d) => { if (!d) return 0; const t = new Date(d).getTime(); return isNaN(t) ? 0 : t; };
    return [...filteredTasks]
      .sort((a, b) => { const diff = safeDate(b.createdAt) - safeDate(a.createdAt); if (diff !== 0) return diff; return safeDate(b.updatedAt) - safeDate(a.updatedAt); })
      .slice((currentPage - 1) * TASKS_PER_PAGE, currentPage * TASKS_PER_PAGE);
  }, [filteredTasks, currentPage]);
  useEffect(() => setCurrentPage(1), [filteredTasks.length]);

  const statusCount = useMemo(() => {
    const c = { [STATUS.TODO]: 0, [STATUS.IN_PROGRESS]: 0, [STATUS.DONE]: 0, [STATUS.ON_HOLD]: 0 };
    filteredTasks.forEach((t) => { if (c[t.status] !== undefined) c[t.status]++; });
    return c;
  }, [filteredTasks]);

  // Overdue / Due Soon are computed from the *unfiltered-by-due* set of tasks
  // (still respecting status/assignee/reporter/search) so counts stay meaningful
  // while a due filter is active.
  const baseForDueCounts = useMemo(() => {
    const s = (filters.search || "").toLowerCase();
    return tasks.filter((t) => {
      if (filters.status && t.status !== filters.status) return false;
      if (filters.assignee) {
        const selUser = users.find((u) => String(u._id || u.id) === filters.assignee);
        const r = resolveEmployeeName(t.employee, users);
        if (!selUser || r !== selUser.name) return false;
      }
      if (filters.reporter) {
        const selUser = users.find((u) => String(u._id || u.id) === filters.reporter);
        if (!selUser || t.reporter !== selUser.name) return false;
      }
      if (s) {
        const n = (resolveEmployeeName(t.employee, users) || "").toLowerCase();
        if (!(t.description || "").toLowerCase().includes(s) && !n.includes(s)) return false;
      }
      return true;
    });
  }, [tasks, filters.status, filters.assignee, filters.reporter, filters.search, users]);

  const overdueCount = useMemo(() => baseForDueCounts.filter(isOverdueTask).length, [baseForDueCounts]);
  const onTrackCount = useMemo(() => baseForDueCounts.filter((t) => t.status !== STATUS.DONE && !isOverdueTask(t)).length, [baseForDueCounts]);

  // ── Unified filter model used by BOTH the stat cards and the chip row ──
  const filterItems = [
    { label: "Total", value: tasks.length, filterType: "clear" },
    { label: "In Progress", value: statusCount["In Progress"] || 0, filterType: "status", filterValue: STATUS.IN_PROGRESS },
    { label: "Done", value: statusCount["Done"] || 0, filterType: "status", filterValue: STATUS.DONE },
    { label: "Overdue", value: overdueCount, filterType: "due", filterValue: "overdue" },
    { label: "On Track", value: onTrackCount, filterType: "due", filterValue: "onTrack" },
  ];

  const isFilterActive = (item) => {
    if (item.filterType === "clear") return !filters.status && !filters.due;
    if (item.filterType === "status") return filters.status === item.filterValue;
    if (item.filterType === "due") return filters.due === item.filterValue;
    return false;
  };

  const handleFilterClick = (item) => {
    if (item.filterType === "clear") {
      setFilters((p) => ({ ...p, status: "", due: "" }));
      return;
    }
    if (item.filterType === "status") {
      setFilters((p) => ({ ...p, due: "", status: p.status === item.filterValue ? "" : item.filterValue }));
      return;
    }
    if (item.filterType === "due") {
      setFilters((p) => ({ ...p, status: "", due: p.due === item.filterValue ? "" : item.filterValue }));
    }
  };

  const statsData = filterItems;

  const getVisiblePages = (current, total) => {
    const pages = new Set();
    for (let i = 1; i <= Math.min(3, total); i++) pages.add(i);
    for (let i = Math.max(total - 2, 1); i <= total; i++) pages.add(i);
    for (let i = current - 1; i <= current + 1; i++) { if (i >= 1 && i <= total) pages.add(i); }
    return [...pages].sort((a, b) => a - b);
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <>
      <div style={{ minHeight: "100vh", display: isCreateMode ? "none" : "flex", flexDirection: "column", overflow: "hidden" }}>
        <main
          style={{
            flex: 1, maxWidth: 1650, margin: "0 auto", width: "100%",
            padding: "4px 2px 6px", boxSizing: "border-box",
          }}
        >
          {/* ── Back button (matching TemplatesPage) ── */}
          <div style={{ marginBottom: 12 }}>
            <button
              onClick={() => router.push("/task-management")}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                color: "white", border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                transition: "all 0.2s",
                transform: showBack ? "translateY(0)" : "translateY(-120%)",
                opacity: showBack ? 1 : 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)"; }}
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* ── Header card (matching TemplatesPage exactly) ── */}
          <div
            style={{
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(241,245,249,0.8)", borderRadius: 14,
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              padding: "18px 24px 16px", marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                  }}
                >
                  <ClipboardCheck size={22} color="white" strokeWidth={2} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                    {viewMode === "archived" ? "Archived Tasks" : "Action Plan"}
                    {contextScopeId && (
                      <span
                        style={{
                          marginLeft: 10, fontSize: 11, fontWeight: 700,
                          padding: "2px 9px", borderRadius: 10,
                          background: scopedAuditId ? "#fff9db" : "#e7f5ff",
                          color: scopedAuditId ? "#e67700" : "#1971c2",
                        }}
                      >
                        {contextScopeId}
                      </span>
                    )}
                  </h1>
                  <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b", fontWeight: 400 }}>
                    {contextLabel} ·{" "}
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>
                      {filteredTasks.length}
                    </span>{" "}
                    task{filteredTasks.length !== 1 ? "s" : ""} shown
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* NEW: Active ⇄ Archive toggle — root/super_admin only */}
                {canArchive && (
                  <button
                    onClick={() =>
                      router.push(viewMode === "archived" ? "/task-management/tasks" : "/task-management/tasks?view=archived")
                    }
                    style={{
                      padding: "10px 20px", borderRadius: 10,
                      background: "white", border: "1.5px solid #e2e8f0",
                      color: "#475569", fontWeight: 600, fontSize: 13,
                      cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
                  >
                    {viewMode === "archived" ? (
                      <>← Back to Active Tasks</>
                    ) : (
                      <><Archive size={15} /> View Archive</>
                    )}
                  </button>
                )}
                {canEdit && viewMode === "active" && (
                  <button
                    onClick={openAddModal}
                    style={{
                      padding: "10px 20px", borderRadius: 10,
                      background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                      border: "none", color: "white", fontWeight: 600, fontSize: 13,
                      cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                      boxShadow: "0 4px 12px rgba(37,99,235,0.3)", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.35)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)"; }}
                  >
                    <Plus size={15} /> Create Task
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Stat Cards — Total / In Progress / Done / Overdue / Due Soon, clickable filters ── */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 14, marginBottom: 18,
            }}
          >
            {statsData.map((s, i) => (
              <StatCard
                key={s.label}
                value={s.value}
                label={s.label}
                index={i}
                active={isFilterActive(s)}
                onClick={() => handleFilterClick(s)}
              />
            ))}
          </section>

          {/* ── Filter / Toolbar (matching TemplatesPage style) ── */}
          <div
            style={{
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(241,245,249,0.8)", borderRadius: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              padding: "8px 16px", marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8,
              flexWrap: "wrap", overflow: "visible",
              animation: "fadeUp 0.4s ease 0.2s both",
              position: "relative", zIndex: 100,
            }}
          >
            {/* Status chips (unified with the stat cards above) */}
            {/* <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0 }}>
              Status
            </span> */}
            
            {/* Assignee — CHANGED: value now keyed by user id, fixes selected-name bug */}
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0 }}>
              Assignee
            </span>
            <select
              value={filters.assignee}
              onChange={(e) => setFilters((p) => ({ ...p, assignee: e.target.value }))}
              style={{
                padding: "6px 11px", border: "1.5px solid #e2e8f0", borderRadius: 8,
                fontSize: 13, background: "#f8fafc", cursor: "pointer", outline: "none",
                fontWeight: 600, color: "#1e293b", transition: "all 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
            >
              <option value="">All Assignees</option>
              {users.map((u) => <option key={u._id || u.id} value={String(u._id || u.id)}>{u.name}</option>)}
            </select>

            <div style={{ width: 1, height: 24, background: "#e2e8f0", flexShrink: 0 }} />

            {/* Reporter — NEW, replaces the old Priority filter */}
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0 }}>
              Reporter
            </span>
            <select
              value={filters.reporter}
              onChange={(e) => setFilters((p) => ({ ...p, reporter: e.target.value }))}
              style={{
                padding: "6px 11px", border: "1.5px solid #e2e8f0", borderRadius: 8,
                fontSize: 13, background: "#f8fafc", cursor: "pointer", outline: "none",
                fontWeight: 600, color: "#1e293b", transition: "all 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
            >
              <option value="">All Reporters</option>
              {users.map((u) => <option key={u._id || u.id} value={String(u._id || u.id)}>{u.name}</option>)}
            </select>

            <div style={{ width: 1, height: 24, background: "#e2e8f0", flexShrink: 0 }} />

            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 180px", maxWidth: 280 }}>
              <Search size={13} color="#94a3b8" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                placeholder="Search tasks..."
                style={{
                  width: "100%", padding: "7px 10px 7px 30px",
                  border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13,
                  outline: "none", background: "#f8fafc", boxSizing: "border-box",
                  transition: "all 0.2s", color: "#1e293b",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {(filters.search || filters.status || filters.assignee || filters.reporter || filters.due || filters.mine) && (
              <button
                onClick={() => setFilters({ status: "", assignee: "", reporter: "", search: "", due: "", mine: "" })}
                style={{
                  padding: "6px 12px", borderRadius: 8, border: "1.5px solid #fca5a5",
                  background: "transparent", color: "#e74c3c", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#e74c3c"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e74c3c"; }}
              >
                ✕ Clear
              </button>
            )}

            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
              {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* ── Table card (matching TemplatesPage exactly) ── */}
          <div
            style={{
              background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)",
              borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1px solid rgba(241,245,249,0.8)",
              overflow: "hidden", animation: "fadeUp 0.4s ease 0.25s both", marginBottom: 16,
            }}
          >
            {isLoading ? (
              <div style={{ textAlign: "center", padding: 80 }}>
                <div
                  style={{
                    width: 32, height: 32, border: "3px solid #e2e8f0",
                    borderTop: "3px solid #3b82f6", borderRadius: "50%",
                    margin: "0 auto 14px", animation: "spin 0.8s linear infinite",
                  }}
                />
                <p style={{ color: "#64748b", fontSize: 13, margin: 0, fontWeight: 500 }}>Loading tasks...</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900, background: "transparent" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      {[
                        { label: "#", align: "center", width: 60 },
                        { label: "Task", align: "left", minWidth: 240 },
                        { label: "Source", align: "center", width: 100 },
                        { label: "Source ID", align: "center", width: 120 },
                        { label: "Status", align: "center", width: 130 },
                        { label: "Assignee", align: "left", width: 160 },
                        { label: "Reporter", align: "left", width: 140 },
                        { label: "Priority", align: "center", width: 110 },
                        { label: "Created Date", align: "center", width: 110 },
                        { label: "Due Date", align: "center", width: 110 },
                        { label: "Actions", align: "center", width: 150, accent: true },
                      ].map(({ label, align, width, minWidth, accent }) => (
                        <th
                          key={label}
                          style={{
                            padding: "11px 12px", textAlign: align,
                            fontWeight: 700, fontSize: 11,
                            color: accent ? "#3b82f6" : "#64748b",
                            textTransform: "uppercase", letterSpacing: "0.06em",
                            whiteSpace: "nowrap",
                            background: accent ? "#eff6ff" : "transparent",
                            ...(width ? { width } : {}),
                            ...(minWidth ? { minWidth } : {}),
                          }}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTasks.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ padding: "48px 20px", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 48, height: 48, borderRadius: 12,
                                background: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >
                              {viewMode === "archived" ? (
                                <Archive size={22} color="white" strokeWidth={1.8} />
                              ) : (
                                <ClipboardList size={22} color="white" strokeWidth={1.8} />
                              )}
                            </div>
                            <p style={{ color: "#64748b", fontWeight: 600, fontSize: 14, margin: 0 }}>
                              {viewMode === "archived" ? "The archive is empty." : "No tasks to display."}
                            </p>
                            {canEdit && viewMode === "active" && (
                              <span
                                style={{ color: "#3b82f6", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                                onClick={openAddModal}
                              >
                                + Create a task
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedTasks.map((task, displayIndex) => {
                        const serialNo = (currentPage - 1) * TASKS_PER_PAGE + displayIndex + 1;
                        const isOverdue = isOverdueTask(task);
                        const source = getSourceModule(task);
                        const sourceId = task.riskId
                          || (task.auditId ? (audits.find((a) => a.id === task.auditId)?.auditId || task.auditId) : null)
                          || task.dpiaRefId || task.dpiaId
                          || task.aiiaRefId || task.aiiaId
                          || task.controlId
                          || null;
                        // const isReporter = !canEdit;
                        // const inlineDisabled = isReporter || viewMode === "archived";
                        const resolvedAssigneeName = resolveEmployeeName(task.employee, users);
                        const isTaskAssignee = !!task.employee && (
                          resolvedAssigneeName === currentUserName ||
                          resolvedAssigneeName === user?.name ||
                          String(task.employee) === String(user?._id || user?.id)
                        );
                        const isTaskReporter = !!task.reporter && (
                          task.reporter === currentUserName ||
                          task.reporter === user?.name ||
                          String(task.reporter) === String(user?._id || user?.id)
                        );

                        const archived = viewMode === "archived";
                        // The assignee can update their own task's status, but cannot reassign it.
                        const statusDisabled = archived || (!canEdit && !isTaskAssignee);
                        // Only the reporter (who created the task) or a privileged role can reassign it.
                        const assigneeDisabled = archived || (!canEdit && !isTaskReporter);
                        // Priority stays privileged-only, unchanged from before.
                        const priorityDisabled = archived || !canEdit;
                        const isSelected = selectedTask?.taskId === task.taskId;

                        return (
                          <tr
                            key={task.taskId}
                            style={{
                              background: isSelected ? "rgba(239,246,255,0.8)" : serialNo % 2 === 0 ? "transparent" : "rgba(248,250,252,0.6)",
                              borderBottom: "1px solid #f1f5f9",
                              transition: "all 0.15s",
                              borderLeft: "3px solid transparent",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = "rgba(255,255,255,0.95)";
                                e.currentTarget.style.borderLeft = "3px solid #cbd5e1";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = serialNo % 2 === 0 ? "transparent" : "rgba(248,250,252,0.6)";
                                e.currentTarget.style.borderLeft = "3px solid transparent";
                              }
                            }}
                          >
                            {/* # */}
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "#f3f0ff", padding: "2px 7px", borderRadius: 4 }}>
                                {serialNo}
                              </span>
                            </td>

                            {/* Task */}
                            <td style={{ padding: "12px", cursor: "pointer" }} onClick={() => setSelectedTask(task)}>
                              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#7950f2", background: "#f3f0ff", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0 }}>
                                  {task.taskId}
                                </span>
                                <span title={task.description} style={{ fontSize: 13, fontWeight: 500, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                                  {task.description}
                                </span>
                              </div>
                              {task.department && (
                                <div style={{ fontSize: 11, color: "#94a3b8" }}>{task.department}</div>
                              )}
                            </td>

                            {/* Source */}
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: source.color, background: source.bg, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                                {source.label}
                              </span>
                            </td>

                            {/* Source ID */}
                            <td style={{ padding: "12px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                              {sourceId ? (
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                  <span title={sourceId} style={{ fontSize: 11, fontWeight: 700, color: source.color, background: source.bg, padding: "3px 10px", borderRadius: 20, display: "inline-block", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {sourceId}
                                  </span>
                                  {(() => {
                                    const dest = resolveTaskSource(task);
                                    if (!dest) return null;
                                    return (
                                      <button
                                        title={`Go to ${dest.label}`}
                                        onClick={() => {
                                          captureActivity({
                                            action: ACTIONS.CLICK,
                                            module: MODULES.TASK,
                                            item: `Trace to Source (${dest.label}) - ${task.taskId}`,
                                          });
                                          router.push(dest.route);
                                        }}
                                        style={{
                                          border: "none", background: "transparent", color: source.color,
                                          cursor: "pointer", padding: 2, display: "inline-flex",
                                          alignItems: "center", borderRadius: 6, transition: "background 0.15s",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = source.bg)}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                      >
                                        <ArrowUpRight size={13} strokeWidth={2.5} />
                                      </button>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                              )}
                            </td>

                            {/* Status */}
                            <td style={{ padding: "12px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                              <InlineSelect
                                value={task.status}
                                options={statusOptions}
                                onSave={(val) => requestStatusChange(task.taskId, val)}
                                renderValue={(val) => <StatusPill status={val} />}
                                disabled={statusDisabled}
                              />
                            </td>

                            {/* Assignee */}
                            <td style={{ padding: "12px" }} onClick={(e) => e.stopPropagation()}>
                              <InlineAssignee
                                employeeField={task.employee}
                                users={users}
                                onSave={(name) => inlineUpdate(task.taskId, { employee: name, employeeName: name })}
                                disabled={assigneeDisabled}
                              />
                            </td>

                            {/* Reporter */}
                            <td style={{ padding: "12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Avatar name={task.reporter || currentUserName} size={22} />
                                <span title={task.reporter || currentUserName} style={{ fontSize: 12, fontWeight: 600, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }}>
                                  {task.reporter || currentUserName}
                                </span>
                              </div>
                            </td>

                            {/* Priority */}
                            <td style={{ padding: "12px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                              <InlineSelect
                                value={task.priority || PRIORITY.MEDIUM}
                                options={priorityOptions}
                                onSave={(val) => inlineUpdate(task.taskId, { priority: val })}
                                renderValue={(val) => <PriorityPill priority={val} />}
                                disabled={priorityDisabled}
                              />
                            </td>

                            {/* Created Date — NEW, before Due Date */}
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>
                                {formatDate(task.createdAt)}
                              </span>
                            </td>

                            {/* Due Date */}
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: isOverdue ? "#ef4444" : "#475569", whiteSpace: "nowrap" }}>
                                {isOverdue && <span title="Overdue" style={{ marginRight: 4 }}>⚠</span>}
                                {formatDate(task.endDate)}
                              </span>
                            </td>

                            {/* Actions */}
                            <td style={{ padding: "10px 12px", textAlign: "center", background: "rgba(248,250,252,0.5)" }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center", flexWrap: "nowrap" }}>
                                {/* View — always available */}
                                <button
                                  onClick={() => {
                                    captureActivity({ action: ACTIONS.CLICK, module: MODULES.TASK, item: `View Task - ${task.taskId}` });
                                    setSelectedTask(task);
                                  }}
                                  style={{
                                    background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "white",
                                    border: "none", padding: "5px 10px", borderRadius: 6,
                                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                                    whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 3,
                                    boxShadow: "0 1px 4px rgba(37,99,235,0.2)", transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 10px rgba(37,99,235,0.3)"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(37,99,235,0.2)"; }}
                                >
                                  👁 View
                                </button>

                                {/* ACTIVE VIEW: Edit + Archive */}
                                {viewMode === "active" && canEdit && (
                                  <button
                                    onClick={() => editTask(task)}
                                    style={{
                                      background: "transparent", color: "#3b82f6",
                                      border: "1.5px solid #bfdbfe", padding: "5px 10px", borderRadius: 6,
                                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                                      whiteSpace: "nowrap", transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.color = "white"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#3b82f6"; }}
                                  >
                                    ✎ Edit
                                  </button>
                                )}
                                {viewMode === "active" && canArchive && (
                                  <button
                                    onClick={() => archiveTask(task.taskId)}
                                    style={{
                                      background: "transparent", color: "#d97706",
                                      border: "1.5px solid #fde68a", padding: "5px 10px", borderRadius: 6,
                                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                                      whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 3,
                                      transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#d97706"; e.currentTarget.style.color = "white"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d97706"; }}
                                  >
                                    <Archive size={11} /> Archive
                                  </button>
                                )}

                                {/* ARCHIVED VIEW: Restore + Delete Permanently */}
                                {viewMode === "archived" && canArchive && (
                                  <>
                                    <button
                                      onClick={() => restoreTask(task.taskId)}
                                      style={{
                                        background: "transparent", color: "#059669",
                                        border: "1.5px solid #a7f3d0", padding: "5px 10px", borderRadius: 6,
                                        fontSize: 11, fontWeight: 600, cursor: "pointer",
                                        whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 3,
                                        transition: "all 0.2s",
                                      }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "#059669"; e.currentTarget.style.color = "white"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#059669"; }}
                                    >
                                      <RotateCcw size={11} /> Restore
                                    </button>
                                    <button
                                      onClick={() => permanentDeleteTask(task.taskId)}
                                      style={{
                                        background: "transparent", color: "#e74c3c",
                                        border: "1.5px solid #fca5a5", padding: "5px 10px", borderRadius: 6,
                                        fontSize: 11, fontWeight: 600, cursor: "pointer",
                                        whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 3,
                                        transition: "all 0.2s",
                                      }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = "#e74c3c"; e.currentTarget.style.color = "white"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e74c3c"; }}
                                    >
                                      <Trash2 size={11} /> Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Pagination (matching TemplatesPage exactly) ── */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex", justifyContent: "center", alignItems: "center",
                  padding: "14px 16px", gap: 6, flexWrap: "wrap",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "6px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8,
                    background: "#fff", fontWeight: 700,
                    color: currentPage === 1 ? "#94a3b8" : "#475569",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  ‹
                </button>
                {getVisiblePages(currentPage, totalPages).map((pageNum, index, arr) => {
                  const isActive = pageNum === currentPage;
                  const prevPage = arr[index - 1];
                  return (
                    <React.Fragment key={pageNum}>
                      {prevPage && pageNum - prevPage > 1 && (
                        <span style={{ padding: "0 4px", color: "#94a3b8", fontSize: 13 }}>…</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={isActive}
                        style={{
                          padding: "6px 12px", borderRadius: 8, border: "1.5px solid",
                          borderColor: isActive ? "#3b82f6" : "#e2e8f0",
                          background: isActive ? "#3b82f6" : "#fff",
                          color: isActive ? "#fff" : "#475569",
                          fontWeight: 700, cursor: isActive ? "default" : "pointer",
                        }}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "6px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8,
                    background: "#fff", fontWeight: 700,
                    color: currentPage === totalPages ? "#94a3b8" : "#475569",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </main>

        {/* ── Footer (matching TemplatesPage exactly) ── */}
        <footer
          style={{
            background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
            borderTop: "1px solid rgba(241,245,249,0.8)",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
            padding: "14px 24px", position: "sticky", bottom: 0, zIndex: 50,
          }}
        >
          <div style={{ maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500, margin: 0 }}>
              © {new Date().getFullYear()} CalVant. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* ── Task Detail Panel (LOGIC UNCHANGED) ── */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          users={users}
          departments={departments}
          currentUser={user}
        />
      )}

      {/* ── Status Change Modal ── */}
      {statusModal && (
        <StatusChangeModal
          currentStatus={statusModal.currentStatus}
          newStatus={statusModal.newStatus}
          onConfirm={confirmStatusChange}
          onCancel={() => setStatusModal(null)}
        />
      )}

      {/* ── Create / Edit Task Modal (matching TemplatesPage modal style) ── */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, padding: 20,
          }}
          onClick={() => { if (!isCreateMode) { setIsModalOpen(false); setEditingTaskId(null); } }}
        >
          <div
            style={{
              background: "white", borderRadius: 12, padding: "20px 24px",
              maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
              animation: "fadeUp 0.25s ease both",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {taskSuccessData ? (
              <div style={{ textAlign: "center", padding: "20px 10px" }}>
                <div style={{ width: 64, height: 64, background: "#d1fae5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <CheckCircle2 size={32} color="#059669" strokeWidth={2.5} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#064e3b", margin: "0 0 8px" }}>Task Created Successfully!</h2>
                <p style={{ color: "#475569", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
                  Your task <strong>{taskSuccessData.description}</strong> has been successfully assigned to <strong>{taskSuccessData.employeeName}</strong>.
                </p>
                
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px 20px", textAlign: "left", marginBottom: 24, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>DEPARTMENT</span>
                    <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 700 }}>{taskSuccessData.department}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>PRIORITY</span>
                    <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 700 }}>{taskSuccessData.priority}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>DUE DATE</span>
                    <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 700 }}>{taskSuccessData.endDate}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button
                    onClick={() => router.push("/task-management")}
                    style={{
                      padding: "12px 24px", borderRadius: 10, border: "1.5px solid #e2e8f0",
                      background: "white", color: "#475569", fontWeight: 700, fontSize: 14, cursor: "pointer",
                      transition: "all 0.2s", flex: 1, display: "flex", justifyContent: "center", alignItems: "center"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                  >
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => { setTaskSuccessData(null); openAddModal(); }}
                    style={{
                      padding: "12px 24px", borderRadius: 10, border: "none",
                      background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
                      transition: "all 0.2s", flex: 1, boxShadow: "0 4px 12px rgba(37,99,235,0.3)", display: "flex", justifyContent: "center", alignItems: "center"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.4)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)"; }}
                  >
                    Add Task
                  </button>
                </div>
              </div>
            ) : (
              <>
              {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
                  <ClipboardCheck size={18} color="white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em" }}>
                    {editingTaskId ? "Edit Task" : "Create Task"}
                    {contextScopeId && (
                      <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 10, background: scopedAuditId ? "#fff9db" : "#e7f5ff", color: scopedAuditId ? "#e67700" : "#1971c2" }}>
                        {contextLabel}: {contextScopeId}
                      </span>
                    )}
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                    Fill in the task details below
                  </p>
                </div>
              </div>
              <button
                onClick={() => { if (isCreateMode) { router.push("/task-management"); } else { setIsModalOpen(false); setEditingTaskId(null); } }}
                  style={{
                    border: "1.5px solid #e2e8f0", background: "white", borderRadius: 8,
                    width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "#64748b",
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <label style={labelStyle}>Department *</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={formData.department}
                    onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value, employee: "", employeeName: "", employeeId: "" }))}
                    style={selectStyle}
                    disabled={!!editingTaskId}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                  <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
                </div>
              </div>

              {/* ── Type / Sub Type — both mandatory ── */}
              <div>
                <label style={labelStyle}>Type *</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={formData.type}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value, subType: "" }))}
                    style={selectStyle}
                  >
                    <option value="">Select type</option>
                    {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
                </div>
              </div>
                {formData.type === "Module Based" && (
                  <div>
                    <label style={labelStyle}>Sub Type *</label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={formData.subType}
                        onChange={(e) => setForm((prev) => ({ ...prev, subType: e.target.value }))}
                        style={selectStyle}
                      >
                        <option value="">Select module</option>
                        {MODULE_SUBTYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
                    </div>
                  </div>
                )}
                {formData.type === "Framework Based" && (
                  <div>
                    <label style={labelStyle}>Sub Type *</label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={formData.subType}
                        onChange={(e) => setForm((prev) => ({ ...prev, subType: e.target.value }))}
                        style={selectStyle}
                        disabled={FRAMEWORK_OPTIONS.length === 0}
                      >
                        <option value="">{FRAMEWORK_OPTIONS.length ? "Select framework" : "No frameworks configured yet"}</option>
                        {FRAMEWORK_OPTIONS.map((f) => <option key={f.value || f} value={f.value || f}>{f.label || f}</option>)}
                      </select>
                      <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
                    </div>
                  </div>
                )}
                {formData.type === "General" && (
                  <div>
                    <label style={labelStyle}>Sub Type *</label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={formData.subType}
                        onChange={(e) => setForm((prev) => ({ ...prev, subType: e.target.value }))}
                        style={selectStyle}
                      >
                        <option value="">Select sub type</option>
                        {GENERAL_SUBTYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
                    </div>
                  </div>
                )}
              {/* Type and Subtype were in a grid before, but they are now vertically stacked for full width. */}
              <div>
                <label style={labelStyle}>Assign To</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={formData.employeeId || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matched = users.find((u) => String(u._id || u.id) === val);
                      const name = matched?.name || "";
                      const next = { ...(formDataRef.current || {}), employeeId: val, employee: name, employeeName: name };
                      formDataRef.current = next;
                      setFormData(next);
                    }}
                    style={selectStyle}
                  >
                    <option value="">-- Auto Assign (Risk Owner) --</option>
                    {empOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
                </div>
                {formData.employeeName && (
                  <div style={{ marginTop: 5, fontSize: 11, color: "#10b981", fontWeight: 600 }}>
                    ✓ Assigned to: {formData.employeeName}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Task Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the task..."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      const ns = e.target.value;
                      setForm((prev) => ({ ...prev, startDate: ns, endDate: prev.endDate && prev.endDate < ns ? "" : prev.endDate }));
                    }}
                    min={today}
                    style={{ ...inputStyle, color: formData.startDate ? "#1e293b" : "#94a3b8", textTransform: formData.startDate ? "none" : "uppercase" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                    min={formData.startDate || today}
                    style={{ ...inputStyle, color: formData.endDate ? "#1e293b" : "#94a3b8", textTransform: formData.endDate ? "none" : "uppercase" }}
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label style={labelStyle}>Priority</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {priorityOptions.map((p) => {
                    const c = PRIORITY_CONFIG[p];
                    const active = formData.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setForm((prev) => ({ ...prev, priority: p })); }}
                        style={{
                          fontSize: 12, fontWeight: 600, padding: "6px 14px",
                          borderRadius: 20, border: "1.5px solid", cursor: "pointer", transition: "all 0.15s",
                          background: active ? c.color : "#f8fafc",
                          borderColor: active ? c.color : "#cbd5e1",
                          color: active ? "#fff" : "#64748b",
                          display: "flex", alignItems: "center", gap: 4, flex: 1, justifyItems: "center", justifyContent: "center"
                        }}
                      >
                        <span style={{ fontSize: 10 }}>{c.icon}</span> {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {editingTaskId && (
                <div>
                  <label style={labelStyle}>Status</label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={formData.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                      style={selectStyle}
                    >
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
                  </div>
                </div>
              )}

              <div>
                <label style={labelStyle}>Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Optional notes..."
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {/* Modal footer buttons */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                <button
                  type="button"
                  onClick={() => { if (isCreateMode) { router.push("/task-management"); } else { setIsModalOpen(false); setEditingTaskId(null); } }}
                    style={{
                      padding: "10px 22px", borderRadius: 12, border: "1.5px solid #e2e8f0",
                      background: "white", color: "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer",
                      transition: "all 0.15s",
                      display: "inline-block"
                    }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveTask}
                  disabled={isSaving}
                  style={{ ...btnPrimary, background: isSaving ? "#94a3b8" : "linear-gradient(135deg,#3b82f6,#2563eb)" }}
                >
                  {isSaving ? "Saving..." : editingTaskId ? "Update Task" : "Create Task"}
                </button>
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes cardIn  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes portalDropIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar       { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </>
  );
}