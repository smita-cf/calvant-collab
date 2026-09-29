

import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import taskService from "../services/taskService";
import { ChevronDown } from "lucide-react";

// ─── Configs ──────────────────────────────────────────────────
const STATUS_CONFIG = {
  "To-Do":       { bg: "#f1f3f5", color: "#495057", dot: "#868e96" },
  "In Progress": { bg: "#e7f5ff", color: "#1971c2", dot: "#339af0" },
  "Done":        { bg: "#ebfbee", color: "#2f9e44", dot: "#40c057" },
  "On Hold":     { bg: "#fff5f5", color: "#c92a2a", dot: "#fa5252" },
};

const CHANGE_TYPE_CONFIG = {
  CREATED:          { icon: "✦", color: "#7950f2", label: "Task Created" },
  STATUS:           { icon: "◎", color: "#1971c2", label: "Status Changed" },
  ASSIGNEE:         { icon: "◈", color: "#0ca678", label: "Assignee Changed" },
  REMARKS:          { icon: "◇", color: "#f59f00", label: "Remarks Updated" },
  START_DATE:       { icon: "◷", color: "#e8590c", label: "Start Date Changed" },
  END_DATE:         { icon: "◷", color: "#e8590c", label: "End Date Changed" },
  DELETED:          { icon: "✕", color: "#c92a2a", label: "Task Deleted" },
  SUBTASK_CREATED:  { icon: "⊕", color: "#7950f2", label: "Subtask Created" },
  SUBTASK_STATUS:   { icon: "◎", color: "#1971c2", label: "Subtask Status Changed" },
  SUBTASK_ASSIGNEE: { icon: "◈", color: "#0ca678", label: "Subtask Assignee Changed" },
  SUBTASK_DELETED:  { icon: "⊖", color: "#c92a2a", label: "Subtask Deleted" },
  PRIORITY:         { icon: "⚡", color: "#f59f00", label: "Priority Changed" },
  SUBTASK_PRIORITY: { icon: "⚡", color: "#f59f00", label: "Subtask Priority Changed" },
  SUBTASK_REMARKS:  { icon: "💬", color: "#f59f00", label: "Subtask Remarks Added" },
};

const STATUS_OPTIONS = ["To-Do", "In Progress", "Done", "On Hold"];

const PRIORITY_CONFIG = {
  Low:      { color: "#2f9e44", bg: "#ebfbee", icon: "▼" },
  Medium:   { color: "#f59f00", bg: "#fff9db", icon: "■" },
  High:     { color: "#e8590c", bg: "#fff4e6", icon: "▲" },
  Critical: { color: "#c92a2a", bg: "#fff5f5", icon: "⚑" },
};

// ─── Helpers ──────────────────────────────────────────────────
function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function formatDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("T")[0].split("-");
  return `${day}-${m}-${y}`;
}
function initials(name) {
  return (name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}
const AV_COLORS = ["#7950f2","#1971c2","#0ca678","#e8590c","#c2255c","#f59f00","#364fc7"];
function avColor(name) { return AV_COLORS[(name || "").charCodeAt(0) % AV_COLORS.length]; }

// ─── Shared components ────────────────────────────────────────
function Avatar({ name, size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: avColor(name), color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: "700", flexShrink: 0, userSelect: "none",
    }}>{initials(name)}</div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["To-Do"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 6,
      background: cfg.bg, color: cfg.color,
      fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot }} />
      {status}
    </span>
  );
}

function SubTaskStatusPill({ status, onClick, disabled }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["To-Do"];
  return (
    <span onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
      cursor: disabled ? "default" : "pointer",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot }} />
      {status}
      {!disabled && <span style={{ fontSize: 8, opacity: 0.6 }}>▾</span>}
    </span>
  );
}

const sidebarLabel = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "#64748b", textTransform: "uppercase",
  letterSpacing: "0.8px", marginBottom: 6,
};

// Portal dropdown
function StatusDropdownCell({ status, subTaskId, openStatusFor, setOpenStatusFor, onSelect, disabled }) {
  const triggerRef = React.useRef(null);
  const portalRef  = React.useRef(null);
  const [dropPos, setDropPos] = React.useState({ top: 0, left: 0 });
  const isOpen = openStatusFor === subTaskId;

  const handleOpen = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (isOpen) { setOpenStatusFor(null); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setDropPos({ top: rect.bottom + 4, left: rect.right - 140 });
    setOpenStatusFor(subTaskId);
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (portalRef.current?.contains(e.target)) return;
      setOpenStatusFor(null);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, setOpenStatusFor]);

  return (
    <div ref={triggerRef}>
      <SubTaskStatusPill status={status} onClick={handleOpen} disabled={disabled} />
      {isOpen && typeof document !== "undefined" && ReactDOM.createPortal(
        <div ref={portalRef} style={{
          position: "fixed", top: dropPos.top, left: dropPos.left,
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 8, boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
          zIndex: 99999, minWidth: 140, overflow: "hidden",
        }}>
          {STATUS_OPTIONS.map(opt => (
            <div key={opt}
              onMouseDown={e => { e.stopPropagation(); onSelect(opt); setOpenStatusFor(null); }}
              style={{ padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, background: opt === status ? "#f8fafc" : "#fff", color: STATUS_CONFIG[opt]?.color || "#475569" }}
              onMouseOver={e => e.currentTarget.style.background = "#f1f5f9"}
              onMouseOut={e => e.currentTarget.style.background = opt === status ? "#f8fafc" : "#fff"}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_CONFIG[opt]?.dot, display: "inline-block", marginRight: 7 }} />
              {opt}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

function PriorityDropdownCell({ priority, taskIdOrSubTaskId, openPriorityFor, setOpenPriorityFor, onSelect, disabled }) {
  const triggerRef = React.useRef(null);
  const portalRef  = React.useRef(null);
  const [dropPos, setDropPos] = React.useState({ top: 0, left: 0 });
  const isOpen = openPriorityFor === taskIdOrSubTaskId;

  const handleOpen = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (isOpen) { setOpenPriorityFor(null); return; }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setDropPos({ top: rect.bottom + 4, left: rect.left });
    setOpenPriorityFor(taskIdOrSubTaskId);
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (portalRef.current?.contains(e.target)) return;
      setOpenPriorityFor(null);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, setOpenPriorityFor]);

  const pc = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["Medium"];

  return (
    <div ref={triggerRef} style={{ display: "inline-block" }}>
      <span onClick={handleOpen} style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "2px 8px", borderRadius: 6,
        background: pc.bg, color: pc.color,
        fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
        cursor: disabled ? "default" : "pointer",
        transition: "background 0.15s",
      }}
      onMouseOver={e => { if (!disabled) e.currentTarget.style.background = "#f1f5f9"; }}
      onMouseOut={e => { if (!disabled) e.currentTarget.style.background = pc.bg; }}
      >
        {pc.icon} {priority}
        {!disabled && <span style={{ fontSize: 8, opacity: 0.6 }}>▾</span>}
      </span>
      {isOpen && typeof document !== "undefined" && ReactDOM.createPortal(
        <div ref={portalRef} style={{
          position: "fixed", top: dropPos.top, left: dropPos.left,
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 8, boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
          zIndex: 99999, minWidth: 120, overflow: "hidden",
        }}>
          {Object.keys(PRIORITY_CONFIG).map(opt => (
            <div key={opt}
              onMouseDown={e => { e.stopPropagation(); onSelect(opt); setOpenPriorityFor(null); }}
              style={{ padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, background: opt === priority ? "#f8fafc" : "#fff", color: PRIORITY_CONFIG[opt]?.color || "#475569" }}
              onMouseOver={e => e.currentTarget.style.background = "#f1f5f9"}
              onMouseOut={e => e.currentTarget.style.background = opt === priority ? "#f8fafc" : "#fff"}
            >
              <span style={{ marginRight: 6 }}>{PRIORITY_CONFIG[opt].icon}</span>
              {opt}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

// Status Change Modal
function StatusChangeModal({ currentStatus, newStatus, onConfirm, onCancel }) {
  const [remarks, setRemarks] = React.useState("");
  const [error, setError]     = React.useState(false);
  const textRef = React.useRef();
  React.useEffect(() => { setTimeout(() => textRef.current?.focus(), 80); }, []);

  const handleConfirm = () => {
    if (!remarks.trim()) { setError(true); return; }
    onConfirm(remarks.trim());
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10002, padding: 20, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg, #1e3a5f, #1e40af)", padding: "18px 22px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#93c5fd", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Status Change</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <StatusBadge status={currentStatus} />
            <span style={{ color: "#93c5fd", fontSize: 14 }}>→</span>
            <StatusBadge status={newStatus} />
          </div>
        </div>
        <div style={{ padding: "20px 22px" }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 8 }}>
            Remarks <span style={{ color: "#dc2626" }}>*</span>
            <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: 12, marginLeft: 6 }}>(required)</span>
          </label>
          <textarea ref={textRef} value={remarks}
            onChange={e => { setRemarks(e.target.value); if (e.target.value.trim()) setError(false); }}
            placeholder="Explain the reason for this status change..." rows={3}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${error ? "#dc2626" : "#e2e8f0"}`, fontSize: 13, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", outline: "none", background: error ? "#fef2f2" : "#f8fafc", transition: "border-color 0.15s, background 0.15s" }}
            onFocus={e => { e.target.style.borderColor = error ? "#dc2626" : "#3b82f6"; e.target.style.background = "#fff"; }}
            onBlur={e  => { e.target.style.borderColor = error ? "#dc2626" : "#e2e8f0"; e.target.style.background = error ? "#fef2f2" : "#f8fafc"; }}
            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleConfirm(); if (e.key === "Escape") onCancel(); }}
          />
          {error && <div style={{ marginTop: 6, fontSize: 12, color: "#dc2626", fontWeight: 600 }}>⚠ Please enter remarks before changing the status.</div>}
        </div>
        <div style={{ padding: "0 22px 20px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleConfirm} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

function InlineAssigneeCell({ assignee, users, onSelect, disabled }) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef();
  const portalRef = useRef();
  const displayName = assignee || "Unassigned";

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
    <div ref={triggerRef} style={{ display: "inline-block", maxWidth: "100%" }}>
      <div
        onClick={openDropdown}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          cursor: disabled ? "default" : "pointer",
          padding: "2px 4px", borderRadius: 6, transition: "background 0.15s",
          maxWidth: "100%"
        }}
        onMouseOver={(e) => { if (!disabled) e.currentTarget.style.background = "#f1f5f9"; }}
        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Avatar name={displayName} size={20} />
        <span title={displayName} style={{ fontSize: 11, fontWeight: 600, color: "#475569", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayName.split(" ")[0]}
        </span>
      </div>
      {open && ReactDOM.createPortal(
        <div
          ref={portalRef}
          style={{
            position: "fixed", top: dropPos.top, left: dropPos.left,
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,.12)", zIndex: 99999,
            minWidth: 160, maxHeight: 220, overflowY: "auto"
          }}
        >
          {users.map((u) => (
            <div
              key={u._id || u.id}
              onMouseDown={(e) => { e.stopPropagation(); onSelect(u.name); setOpen(false); }}
              style={{
                padding: "8px 12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                background: u.name === displayName ? "#f8fafc" : "#fff",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              onMouseOut={(e) => (e.currentTarget.style.background = u.name === displayName ? "#f8fafc" : "#fff")}
            >
              <Avatar name={u.name} size={20} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{u.name}</span>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function TaskDetailPanel({ task, onClose, onUpdate, users = [], departments = [], currentUser }) {
  const resolveName = (idOrName, list = []) => {
    if (!idOrName) return null;
    const item = list.find(x => x._id === idOrName || x.id === idOrName || x.name === idOrName);
    return item ? item.name : idOrName;
  };

  const [activeTab, setActiveTab]     = useState("history");
  const [logs, setLogs]               = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [remarks, setRemarks]                 = useState(task?.remarks || "");
  const [isSavingRemarks, setIsSavingRemarks] = useState(false);
  const remarksRef                            = useRef(null);
  const hasRemarksChanged                     = remarks.trim() !== (task?.remarks || "").trim();

  const [savingStatus, setSavingStatus] = useState(false);
  const [statusModal, setStatusModal]   = useState(null);

  const [workLogs, setWorkLogs]     = useState([]);
  const [newWorkLog, setNewWorkLog] = useState({ description: "", hours: "" });

  const [subTasks, setSubTasks]               = useState([]);
  const [subTasksOpen, setSubTasksOpen]       = useState(true);
  const [subTasksLoading, setSubTasksLoading] = useState(false);
  const [showAddSubTask, setShowAddSubTask]   = useState(false);
  const [newSubTask, setNewSubTask]           = useState({ description: "", assignee: "", endDate: "", status: "To-Do", priority: "Medium" });
  const [savingSubTask, setSavingSubTask]     = useState(false);

  const [openStatusFor, setOpenStatusFor]           = useState(null);
  const [subTaskStatusModal, setSubTaskStatusModal] = useState(null);
  const [openPriorityFor, setOpenPriorityFor]       = useState(null);

  const panelRef = useRef(null);

  const userRoles         = Array.isArray(currentUser?.role) ? currentUser.role : [currentUser?.role || ""];
  const isOwner           = userRoles.some(r => ["risk_owner", "root", "super_admin", "aio", "ciso", "dpo"].includes(r));
  const canManageSubTasks = isOwner;
  const changedBy         = currentUser?.name || currentUser?.username || "System";

  const refreshLogs = async () => {
    if (!task?.taskId) return;
    try { const data = await taskService.getTaskLogs(task.taskId); setLogs(data || []); }
    catch { setLogs([]); }
  };

  const refreshSubTasks = async () => {
    if (!task?.taskId) return;
    setSubTasksLoading(true);
    try { const data = await taskService.getSubTasks(task.taskId); setSubTasks(data || []); }
    catch { setSubTasks([]); }
    finally { setSubTasksLoading(false); }
  };

  useEffect(() => {
    let m = true;
    if (!task?.taskId) return;
    setLogsLoading(true);
    Promise.all([
      taskService.getTaskLogs(task.taskId),
      taskService.getSubTasks(task.taskId),
      taskService.getWorkLogs ? taskService.getWorkLogs(task.taskId) : Promise.resolve([]),
    ]).then(([logsData, subData, wlData]) => {
      if (!m) return;
      setLogs(logsData || []);
      setSubTasks(subData || []);
      setWorkLogs(wlData || []);
    }).catch(console.error).finally(() => { if (m) setLogsLoading(false); });
    setRemarks(task?.remarks || "");
    return () => { m = false; };
  }, [task?.taskId, task?.remarks]);

  useEffect(() => {
    const onMouseDown = (e) => {
      if (statusModal || subTaskStatusModal) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") { if (statusModal || subTaskStatusModal) return; onClose(); }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onMouseDown); document.removeEventListener("keydown", onKey); };
  }, [onClose, statusModal, subTaskStatusModal]);

  const handleStatusChange = (newStatus) => {
    if (newStatus === task.status) return;
    setStatusModal({ currentStatus: task.status, newStatus });
  };

  const confirmStatusChange = async (remarksText) => {
    const { newStatus } = statusModal;
    setStatusModal(null);
    setSavingStatus(true);
    try {
      const updated = { ...task, status: newStatus, remarks: remarksText };
      await taskService.updateTask(task.taskId, updated, changedBy);
      setRemarks(remarksText);
      onUpdate(updated);
      await refreshLogs();
    } catch { alert("Failed to update status"); }
    finally { setSavingStatus(false); }
  };

  const handleSaveRemarks = async () => {
    if (!hasRemarksChanged) return;
    setIsSavingRemarks(true);
    try {
      const updated = { ...task, remarks };
      await taskService.updateTask(task.taskId, updated, changedBy);
      onUpdate(updated);
      await refreshLogs();
    } catch { alert("Failed to save remarks"); }
    finally { setIsSavingRemarks(false); }
  };

  const handleAddWorkLog = async () => {
    if (!newWorkLog.description.trim() || !newWorkLog.hours) return;
    try {
      const entry = { taskId: task.taskId, author: changedBy, description: newWorkLog.description.trim(), hours: parseFloat(newWorkLog.hours), time: new Date().toISOString() };
      if (taskService.addWorkLog) await taskService.addWorkLog(task.taskId, entry);
      setWorkLogs(prev => [entry, ...prev]);
      setNewWorkLog({ description: "", hours: "" });
    } catch { alert("Failed to save work log"); }
  };

  const handleCreateSubTask = async () => {
    if (!newSubTask.description.trim()) { alert("Description is required."); return; }
    if (newSubTask.endDate) {
      const subEnd    = new Date(newSubTask.endDate);
      const taskStart = task?.startDate ? new Date(task.startDate.split("T")[0]) : null;
      const taskEnd   = task?.endDate   ? new Date(task.endDate.split("T")[0])   : null;
      if (taskStart && subEnd < taskStart) { alert(`Due date cannot be before the parent task start date (${formatDate(task.startDate)}).`); return; }
      if (taskEnd   && subEnd > taskEnd)   { alert(`Due date cannot be after the parent task end date (${formatDate(task.endDate)}).`);    return; }
    }
    setSavingSubTask(true);
    try {
      await taskService.createSubTask(task.taskId, {
        description: newSubTask.description.trim(),
        assignee: newSubTask.assignee || null,
        endDate:  newSubTask.endDate  || null,
        status:   newSubTask.status   || "To-Do",
        priority: newSubTask.priority || "Medium",
      }, changedBy);
      setNewSubTask({ description: "", assignee: "", endDate: "", status: "To-Do", priority: "Medium" });
      setShowAddSubTask(false);
      await refreshSubTasks();
      await refreshLogs();
    } catch { alert("Failed to create subtask"); }
    finally { setSavingSubTask(false); }
  };

  const handleSubTaskStatusChange = (subTask, newStatus) => {
    setOpenStatusFor(null);
    if (newStatus === subTask.status) return;
    setSubTaskStatusModal({ subTask, newStatus });
  };

  const confirmSubTaskStatusChange = async (remarksText) => {
    const { subTask, newStatus } = subTaskStatusModal;
    setSubTaskStatusModal(null);
    try {
      await taskService.updateSubTask(task.taskId, subTask.subTaskId, { status: newStatus, remarks: remarksText }, changedBy);
      setSubTasks(prev => prev.map(s => s.subTaskId === subTask.subTaskId ? { ...s, status: newStatus, remarks: remarksText } : s));
      await refreshLogs();
    } catch { alert("Failed to update subtask status"); }
  };

  const handleSubTaskAssigneeChange = async (subTask, newAssignee) => {
    if (newAssignee === subTask.assignee) return;
    try {
      await taskService.updateSubTask(task.taskId, subTask.subTaskId, { assignee: newAssignee }, changedBy);
      setSubTasks(prev => prev.map(s => s.subTaskId === subTask.subTaskId ? { ...s, assignee: newAssignee } : s));
      await refreshLogs();
    } catch { alert("Failed to update subtask assignee"); }
  };

  const handleSubTaskPriorityChange = async (subTask, newPriority) => {
    if (newPriority === subTask.priority) return;
    try {
      await taskService.updateSubTask(task.taskId, subTask.subTaskId, { priority: newPriority }, changedBy);
      setSubTasks(prev => prev.map(s => s.subTaskId === subTask.subTaskId ? { ...s, priority: newPriority } : s));
      await refreshLogs();
    } catch { alert("Failed to update subtask priority"); }
  };

  const handlePriorityChange = async (newPriority) => {
    if (newPriority === task.priority) return;
    try {
      const updated = { ...task, priority: newPriority };
      await taskService.updateTask(task.taskId, updated, changedBy);
      onUpdate(updated);
      await refreshLogs();
    } catch { alert("Failed to update priority"); }
  };

  const handleDeleteSubTask = async (subTask) => {
    if (!window.confirm(`Delete subtask "${subTask.description}"?`)) return;
    try {
      await taskService.deleteSubTask(task.taskId, subTask.subTaskId, changedBy);
      setSubTasks(prev => prev.filter(s => s.subTaskId !== subTask.subTaskId));
      await refreshLogs();
    } catch { alert("Failed to delete subtask"); }
  };

  const doneCount   = subTasks.filter(s => s.status === "Done").length;
  const totalCount  = subTasks.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const ST_COLS = "minmax(200px, 1fr) 110px 150px 110px 140px 30px";

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.2)", zIndex: 1000, backdropFilter: "blur(2px)" }} />

      {/* Panel */}
      <div ref={panelRef} style={{
        position: "fixed", top: 0, right: 0,
        width: "min(840px, 100vw)", height: "100vh",
        background: "#fff", zIndex: 1001,
        display: "flex", flexDirection: "column",
        boxShadow: "-4px 0 32px rgba(15,23,42,0.1), -1px 0 0 #e2e8f0",
        animation: "slideIn 0.28s cubic-bezier(0.4,0,0.2,1)",
        fontFamily: "'DM Sans', -apple-system, sans-serif",
      }}>

        {/* ── Top bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #f1f5f9", flexShrink: 0, background: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", background: "#f3f0ff", padding: "4px 10px", borderRadius: 6, letterSpacing: "0.5px" }}>
              {task?.taskId}
            </span>
            <StatusBadge status={task?.status} />
            {task?.priority && (() => {
              const pc = PRIORITY_CONFIG[task.priority];
              return pc ? (
                <span style={{ fontSize: 12, fontWeight: 700, color: pc.color, background: pc.bg, padding: "4px 10px", borderRadius: 6 }}>
                  {pc.icon} {task.priority}
                </span>
              ) : null;
            })()}
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, padding: "4px 8px", borderRadius: 6, lineHeight: 1, transition: "color 0.15s, background 0.15s" }}
            onMouseOver={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }}
            onMouseOut={e  => { e.currentTarget.style.background = "none";     e.currentTarget.style.color = "#94a3b8"; }}>✕</button>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ── Left: main content ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", borderRight: "1px solid #f1f5f9" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 19, fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>
              {task?.description || "Untitled Task"}
            </h2>

            {/* ── Subtasks ── */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}
                  onClick={() => setSubTasksOpen(o => !o)}>
                  <span style={{ fontSize: 10, color: "#94a3b8", display: "inline-block", transform: subTasksOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▶</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Subtasks</span>
                  {totalCount > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", background: "#e2e8f0", padding: "2px 8px", borderRadius: 12 }}>
                      {doneCount}/{totalCount}
                    </span>
                  )}
                </div>
                {canManageSubTasks && subTasksOpen && (
                  <button onClick={() => setShowAddSubTask(true)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", fontSize: 12, fontWeight: 700, padding: "2px 6px", display: "flex", alignItems: "center", gap: 3 }}>
                    + Add subtask
                  </button>
                )}
              </div>

              {subTasksOpen && (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                  {totalCount > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 14px", borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
                      <div style={{ flex: 1, height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${progressPct}%`, background: progressPct === 100 ? "#40c057" : "#3b82f6", borderRadius: 3, transition: "width 0.4s ease" }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: progressPct === 100 ? "#2f9e44" : "#64748b", whiteSpace: "nowrap" }}>{progressPct}% Done</span>
                    </div>
                  )}

                  <div style={{ overflowX: "auto" }}>
                    <div style={{ minWidth: 780 }}>
                      {totalCount > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: ST_COLS, gap: 12, padding: "8px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", alignItems: "center" }}>
                      {["Work", "Priority", "Assignee", "Due Date", "Status", ""].map((h, i) => (
                        <span key={i} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h}</span>
                      ))}
                    </div>
                  )}

                  {subTasksLoading ? (
                    <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading...</div>
                  ) : subTasks.map((st, idx) => {
                    const pc = PRIORITY_CONFIG[st.priority] || PRIORITY_CONFIG["Medium"];
                    const stEndDate = st.endDate || st.dueDate || null;
                    const isOverdue = stEndDate && new Date(stEndDate) < new Date() && st.status !== "Done";
                    const isLast    = idx === subTasks.length - 1 ;
                    return (
                      <div key={st.subTaskId} style={{
                        display: "grid", gridTemplateColumns: ST_COLS, gap: 12,
                        alignItems: "center", padding: "8px 16px",
                        borderBottom: isLast ? "none" : "1px solid #f1f5f9",
                        background: "#fff", transition: "background 0.1s", minWidth: 0,
                      }}
                        onMouseOver={e => e.currentTarget.style.background = "#fafbff"}
                        onMouseOut={e  => e.currentTarget.style.background = "#fff"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0, overflow: "hidden" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "#f3f0ff", padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap", flexShrink: 0 }}>{st.subTaskId}</span>
                          <span title={st.description} style={{
                            fontSize: 12, fontWeight: 500,
                            color: st.status === "Done" ? "#94a3b8" : "#0f172a",
                            textDecoration: st.status === "Done" ? "line-through" : "none",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            minWidth: 0, flex: 1,
                          }}>{st.description}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", overflow: "hidden" }}>
                          <PriorityDropdownCell
                            priority={st.priority || "Medium"}
                            taskIdOrSubTaskId={st.subTaskId}
                            openPriorityFor={openPriorityFor}
                            setOpenPriorityFor={setOpenPriorityFor}
                            onSelect={(opt) => handleSubTaskPriorityChange(st, opt)}
                            disabled={!canManageSubTasks}
                          />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", overflow: "hidden" }}>
                          <InlineAssigneeCell
                            assignee={st.assignee}
                            users={users}
                            disabled={!canManageSubTasks}
                            onSelect={(newAssignee) => handleSubTaskAssigneeChange(st, newAssignee)}
                          />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", overflow: "hidden" }}>
                          {stEndDate
                            ? <span style={{ fontSize: 11, fontWeight: isOverdue ? 700 : 400, color: isOverdue ? "#dc2626" : "#475569", whiteSpace: "nowrap" }}>
                                {isOverdue && "⚠ "}{formatDate(stEndDate)}
                              </span>
                            : <span style={{ fontSize: 11, color: "#cbd5e1" }}>—</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                          <StatusDropdownCell
                            status={st.status}
                            subTaskId={st.subTaskId}
                            openStatusFor={openStatusFor}
                            setOpenStatusFor={setOpenStatusFor}
                            onSelect={(opt) => handleSubTaskStatusChange(st, opt)}
                            disabled={!canManageSubTasks}
                          />
                        </div>
                        {canManageSubTasks
                          ? <button onClick={() => handleDeleteSubTask(st)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", fontSize: 13, padding: 0, lineHeight: 1 }}
                              onMouseOver={e => e.target.style.color = "#dc2626"}
                              onMouseOut={e  => e.target.style.color = "#cbd5e1"}>✕</button>
                          : <span />}
                      </div>
                    );
                  })}

                  {!subTasksLoading && subTasks.length === 0 && !showAddSubTask && (
                    <div style={{ padding: "16px 14px", color: "#94a3b8", fontSize: 12, textAlign: "center" }}>
                      No subtasks yet.
                      {canManageSubTasks && (
                        <span style={{ color: "#3b82f6", cursor: "pointer", fontWeight: 600, marginLeft: 4 }} onClick={() => setShowAddSubTask(true)}>+ Add one</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
                  {canManageSubTasks && showAddSubTask && (
                    <div style={{
                      padding: "16px 20px",
                      background: "#f8fafc", 
                      borderTop: subTasks.length > 0 ? "1px solid #e2e8f0" : "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Add New Subtask</span>
                        <button onClick={() => { setShowAddSubTask(false); setNewSubTask({ description: "", assignee: "", endDate: "", status: "To-Do", priority: "Medium" }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16 }}>✕</button>
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#000", marginBottom: 6, display: "block" }}>What needs to be done? *</label>
                        <input autoFocus
                          placeholder="Describe the subtask..."
                          value={newSubTask.description}
                          onChange={e => setNewSubTask(p => ({ ...p, description: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleCreateSubTask();
                            if (e.key === "Escape") { setShowAddSubTask(false); setNewSubTask({ description: "", assignee: "", endDate: "", status: "To-Do", priority: "Medium" }); }
                          }}
                          style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff", boxSizing: "border-box" }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Assignee</label>
                          <div style={{ position: "relative" }}>
                            <select value={newSubTask.assignee} onChange={e => setNewSubTask(p => ({ ...p, assignee: e.target.value }))}
                              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer", boxSizing: "border-box", appearance: "none" }}>
                              <option value="">Unassigned</option>
                              {users.map(u => <option key={u._id} value={u.name}>{u.name}</option>)}
                            </select>
                            <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Due Date</label>
                          <input type="date"
                            value={newSubTask.endDate || ""}
                            min={task?.startDate ? task.startDate.split("T")[0] : undefined}
                            max={task?.endDate   ? task.endDate.split("T")[0]   : undefined}
                            onChange={e => setNewSubTask(p => ({ ...p, endDate: e.target.value }))}
                            style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer", boxSizing: "border-box", color: newSubTask.endDate ? "inherit" : "#94a3b8", textTransform: newSubTask.endDate ? "none" : "uppercase" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Priority</label>
                          <div style={{ position: "relative" }}>
                            <select value={newSubTask.priority || "Medium"} onChange={e => setNewSubTask(p => ({ ...p, priority: e.target.value }))}
                              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer", boxSizing: "border-box", appearance: "none" }}>
                              {Object.keys(PRIORITY_CONFIG).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6, display: "block" }}>Status</label>
                          <div style={{ position: "relative" }}>
                            <select value={newSubTask.status} onChange={e => setNewSubTask(p => ({ ...p, status: e.target.value }))}
                              style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer", boxSizing: "border-box", appearance: "none" }}>
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                        <button onClick={() => { setShowAddSubTask(false); setNewSubTask({ description: "", assignee: "", endDate: "", status: "To-Do", priority: "Medium" }); }}
                          style={{ background: "#fff", border: "1px solid #e2e8f0", cursor: "pointer", color: "#475569", fontSize: 13, padding: "8px 16px", fontWeight: 700, borderRadius: 8 }}>Cancel</button>
                        <button onClick={handleCreateSubTask} disabled={savingSubTask}
                          style={{ background: "#3b82f6", border: "none", cursor: savingSubTask ? "not-allowed" : "pointer", color: "#fff", fontSize: 13, padding: "8px 20px", fontWeight: 700, borderRadius: 8 }}
                          >Create Subtask</button>
                      </div>
                    </div>
                  )}
            </div>
          )}
        </div>

            {/* ── Tabs ── */}
            <div style={{ display: "flex", gap: 20, borderBottom: "2px solid #f1f5f9", marginBottom: 20 }}>
              {/* {["history", "remarks", "worklog"].map(tab => ( */}
               
               {["history", "remarks"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "8px 4px", border: "none", background: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 600,
                  color: activeTab === tab ? "#3b82f6" : "#94a3b8",
                  borderBottom: activeTab === tab ? "2px solid #3b82f6" : "2px solid transparent",
                  marginBottom: "-2px", textTransform: "capitalize", transition: "color 0.15s",
                }}>
                  {tab === "worklog" ? "Work Log" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* ── History tab ── */}
            {activeTab === "history" && (
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 15, top: 8, bottom: 8, width: 1, background: "#e2e8f0" }} />
                {logsLoading ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading...</div>
                ) : logs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 13 }}>No history yet.</div>
                ) : logs.map((log, idx) => {
                  const cfg = CHANGE_TYPE_CONFIG[log.changeType] || { icon: "•", color: "#94a3b8", label: log.changeType };
                  return (
                    <div key={idx} style={{ display: "flex", gap: 14, paddingBottom: 20, position: "relative" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: cfg.color + "15", display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color, zIndex: 1, fontSize: 14, flexShrink: 0 }}>
                        {cfg.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                          {cfg.label}
                          <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 8, fontSize: 12 }}>{formatDateTime(log.changedAt)}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "4px 0" }}>
                          <Avatar name={log.changedBy} size={18} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{log.changedBy}</span>
                        </div>
                        {log.oldValue && (
                          <div style={{ fontSize: 12, marginTop: 4 }}>
                            <span style={{ textDecoration: "line-through", color: "#fa5252", background: "#fff5f5", padding: "1px 6px", borderRadius: 4 }}>{log.oldValue}</span>
                            <span style={{ margin: "0 6px", color: "#94a3b8" }}>→</span>
                            <span style={{ color: "#40c057", background: "#ebfbee", padding: "1px 6px", borderRadius: 4 }}>{log.newValue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Remarks tab ── */}
            {activeTab === "remarks" && (
              <div>
                <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                    {!hasRemarksChanged ? "✏️ Edit remarks below. Changes will be logged in history." : "⚠️ You have unsaved changes."}
                  </p>
                  {hasRemarksChanged && (
                    <button onClick={handleSaveRemarks} disabled={isSavingRemarks}
                      style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: isSavingRemarks ? "#94a3b8" : "#3b82f6", color: "#fff", fontWeight: 700, fontSize: 12, cursor: isSavingRemarks ? "not-allowed" : "pointer" }}>
                      {isSavingRemarks ? "Saving..." : "Save"}
                    </button>
                  )}
                </div>
                <textarea ref={remarksRef} value={remarks} onChange={e => setRemarks(e.target.value)}
                  placeholder="Add remarks or notes about this task..."
                  style={{ width: "100%", minHeight: 160, padding: 14, fontSize: 13, border: hasRemarksChanged ? "1.5px solid #3b82f6" : "1.5px solid #e2e8f0", borderRadius: 8, background: hasRemarksChanged ? "#eff6ff" : "#fff", resize: "vertical", outline: "none", fontFamily: "inherit", transition: "border 0.2s, background 0.2s", boxSizing: "border-box" }} />
                {logs.filter(l => l.changeType === "REMARKS").length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>Remarks History</p>
                    {logs.filter(l => l.changeType === "REMARKS").map((log, i) => (
                      <div key={i} style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 8, marginBottom: 8, borderLeft: "3px solid #f59f00" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                          <Avatar name={log.changedBy} size={18} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{log.changedBy}</span>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>{formatDateTime(log.changedAt)}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#475569" }}>{log.newValue}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Work Log tab ── */}
            {activeTab === "worklog" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input type="text" placeholder="What did you work on?" value={newWorkLog.description}
                    onChange={e => setNewWorkLog(p => ({ ...p, description: e.target.value }))}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = "#3b82f6"}
                    onBlur={e  => e.target.style.borderColor = "#e2e8f0"} />
                  <input type="number" placeholder="Hrs" value={newWorkLog.hours}
                    onChange={e => setNewWorkLog(p => ({ ...p, hours: e.target.value }))}
                    style={{ width: 70, padding: "8px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = "#3b82f6"}
                    onBlur={e  => e.target.style.borderColor = "#e2e8f0"} />
                </div>
                <button onClick={handleAddWorkLog}
                  style={{ padding: "7px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                  Log Work
                </button>
                {workLogs.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>
                      Work Logged ({workLogs.reduce((s, w) => s + (parseFloat(w.hours) || 0), 0).toFixed(1)}h Total)
                    </p>
                    {workLogs.map((w, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{w.description}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                            <Avatar name={w.author} size={16} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{w.author}</span>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>· {formatDateTime(w.time)}</span>
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, color: "#3b82f6", fontSize: 13 }}>{w.hours}h</span>
                      </div>
                    ))}
                  </div>
                )}
                {workLogs.length === 0 && (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 13 }}>No work logged yet.</div>
                )}
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div style={{ width: 240, flexShrink: 0, overflowY: "auto", padding: "24px 18px", background: "#f8fafc", borderLeft: "1px solid #e2e8f0" }}>
            <p style={{ ...sidebarLabel, marginBottom: 18, fontSize: 12, color: "#475569", fontWeight: 700 }}>Details</p>

            {/* Status */}
            <div style={{ marginBottom: 18 }}>
              <label style={sidebarLabel}>Status</label>
              <StatusDropdownCell
                status={task?.status || "To-Do"}
                subTaskId="__main_task__"
                openStatusFor={openStatusFor}
                setOpenStatusFor={setOpenStatusFor}
                onSelect={(newStatus) => handleStatusChange(newStatus)}
                disabled={savingStatus}
              />
              {savingStatus && <p style={{ fontSize: 10, color: "#94a3b8", margin: "4px 0 0" }}>Saving...</p>}
            </div>

            {/* Assignee */}
            <div style={{ marginBottom: 18 }}>
              <label style={sidebarLabel}>Assignee</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={resolveName(task?.employee, users)} size={22} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{resolveName(task?.employee, users) || "Unassigned"}</span>
              </div>
            </div>

            {/* Reporter */}
            <div style={{ marginBottom: 18 }}>
              <label style={sidebarLabel}>Reporter</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar name={resolveName(task?.reporter, users)} size={22} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{resolveName(task?.reporter, users) || "—"}</span>
              </div>
            </div>

            {/* Department */}
            <div style={{ marginBottom: 18 }}>
              <label style={sidebarLabel}>Department</label>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{resolveName(task?.department, departments) || "—"}</span>
            </div>

            {/* Priority */}
            <div style={{ marginBottom: 18 }}>
              <label style={sidebarLabel}>Priority</label>
              <PriorityDropdownCell
                priority={task?.priority || "Medium"}
                taskIdOrSubTaskId="__main_task__"
                openPriorityFor={openPriorityFor}
                setOpenPriorityFor={setOpenPriorityFor}
                onSelect={handlePriorityChange}
                disabled={!isOwner}
              />
            </div>

            {/* Risk ID */}
            {task?.riskId && (
              <div style={{ marginBottom: 18 }}>
                <label style={sidebarLabel}>Risk ID</label>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1971c2", background: "#e7f5ff", padding: "2px 8px", borderRadius: 4 }}>
                  {task.riskId}
                </span>
              </div>
            )}

            {/* Audit ID */}
            {task?.auditId && (
              <div style={{ marginBottom: 18 }}>
                <label style={sidebarLabel}>Audit ID</label>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#e67700", background: "#fff9db", padding: "2px 8px", borderRadius: 4 }}>
                  {task.auditId}
                </span>
              </div>
            )}

            {/* ✅ DPIA ID — shows nomenclature e.g. 693-DPIA-2026-001 */}
            {task?.dpiaId && (
              <div style={{ marginBottom: 18 }}>
                <label style={sidebarLabel}>DPIA ID</label>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", background: "#fdf4ff", padding: "2px 8px", borderRadius: 4 }}>
                  {task.dpiaRefId || task.dpiaId}
                </span>
              </div>
            )}

            {/* Dates */}
            <div style={{ marginBottom: 18 }}>
              <label style={sidebarLabel}>Dates</label>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>
                <span style={{ color: "#475569", marginRight: 4 }}>Start</span>{formatDate(task?.startDate)}
              </div>
              <div style={{ fontSize: 12, color: "#475569" }}>
                <span style={{ color: "#475569", marginRight: 4 }}>End</span>{formatDate(task?.endDate)}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", margin: "16px 0" }} />

            <div style={{ fontSize: 11, color: "#475569", marginBottom: 3 }}>Created: {formatDateTime(task?.createdAt)}</div>
            <div style={{ fontSize: 11, color: "#475569" }}>Updated: {formatDateTime(task?.updatedAt)}</div>

            {totalCount > 0 && (
              <>
                <div style={{ borderTop: "1px solid #e2e8f0", margin: "16px 0" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ ...sidebarLabel, fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 0 }}>Subtasks</label>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: 12 }}>
                    {doneCount}/{totalCount}
                  </span>
                </div>
                <div style={{ height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progressPct}%`, background: progressPct === 100 ? "#40c057" : "#3b82f6", borderRadius: 3, transition: "width 0.4s" }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {statusModal && (
        <StatusChangeModal currentStatus={statusModal.currentStatus} newStatus={statusModal.newStatus} onConfirm={confirmStatusChange} onCancel={() => setStatusModal(null)} />
      )}

      {subTaskStatusModal && (
        <StatusChangeModal currentStatus={subTaskStatusModal.subTask.status} newStatus={subTaskStatusModal.newStatus} onConfirm={confirmSubTaskStatusChange} onCancel={() => setSubTaskStatusModal(null)} />
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes dropIn  { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}