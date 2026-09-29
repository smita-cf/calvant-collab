//C:\Users\ak192\Downloads\CalVant-Next-main\CalVant-Next-main\src\modules\taskManagement\components\MyTasksSection.js
"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Zap,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Search,
  ClipboardCheck,
} from "lucide-react";
import taskService from "../services/taskService";

// ─── Constants ────────────────────────────────────────────────
const STATUS_CONFIG = {
  "To-Do":       { bg: "#f1f3f5", color: "#495057", dot: "#868e96" },
  "In Progress": { bg: "#e7f5ff", color: "#1971c2", dot: "#339af0" },
  "Done":        { bg: "#ebfbee", color: "#2f9e44", dot: "#40c057" },
  "On Hold":     { bg: "#fff5f5", color: "#c92a2a", dot: "#fa5252" },
};

const PRIORITY_CONFIG = {
  Low:      { color: "#2f9e44", bg: "#ebfbee", icon: "▼" },
  Medium:   { color: "#f59f00", bg: "#fff9db", icon: "■" },
  High:     { color: "#e8590c", bg: "#fff4e6", icon: "▲" },
  Critical: { color: "#c92a2a", bg: "#fff5f5", icon: "⚑" },
};

// ─── Overdue / Due Soon helpers (derived, not real status values) ─────────────
const DUE_SOON_DAYS = 3;
function isTaskOverdue(t) {
  return !!t.endDate && new Date(t.endDate) < new Date() && t.status !== "Done";
}
function isTaskDueSoon(t) {
  if (!t.endDate || t.status === "Done") return false;
  const diffDays = (new Date(t.endDate) - new Date()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= DUE_SOON_DAYS;
}

// ─── Stat Card (matching TemplatesPage exactly, now clickable) ─
const STAT_CONFIG = {
  Total:         { gradient: "linear-gradient(135deg,#4f8ef7,#2563eb)",  Icon: ClipboardList },
  "In Progress": { gradient: "linear-gradient(135deg,#339af0,#1971c2)",  Icon: Zap },
  Done:          { gradient: "linear-gradient(135deg,#10b981,#059669)",  Icon: CheckCircle2 },
  Overdue:       { gradient: "linear-gradient(135deg,#ef4444,#dc2626)",  Icon: AlertOctagon },
  "Due Soon":    { gradient: "linear-gradient(135deg,#f59e0b,#d97706)",  Icon: Clock },
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
        padding: "14px 16px",
        boxShadow: active ? "0 4px 14px rgba(37,99,235,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: 12,
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
          width: 40, height: 40, borderRadius: 10,
          background: s.gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
      >
        <s.Icon size={16} color="white" strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", lineHeight: 1.1 }}>
          {value}
        </div>
        <div
          style={{
            fontSize: 11, fontWeight: 600, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2,
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
  const c = STATUS_CONFIG[status] || { bg: "#f1f3f5", color: "#495057", dot: "#868e96" };
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 20,
        background: c.bg, color: c.color,
        fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />
      {status || "—"}
    </span>
  );
}

function PriorityPill({ priority }) {
  const c = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["Medium"];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 10px", borderRadius: 20,
        background: c.bg, color: c.color, fontSize: 11, fontWeight: 700,
      }}
    >
      <span style={{ fontSize: 9 }}>{c.icon}</span>
      {priority || "—"}
    </span>
  );
}

// ─── Helpers (LOGIC UNCHANGED) ────────────────────────────────
function formatDate(d) {
  if (!d) return "—";
  const s = d.split("T")[0].split("-");
  return `${s[2]}-${s[1]}-${s[0]}`;
}
function initials(name) {
  return (name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
const AV_COLORS = ["#7950f2","#1971c2","#0ca678","#e8590c","#c2255c","#f59f00","#364fc7"];
function avColor(name) {
  return AV_COLORS[(name || "").charCodeAt(0) % AV_COLORS.length];
}
function Avatar({ name, size = 24 }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: avColor(name), color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  );
}
function resolveSubStartDate(sub) {
  if (sub.startDate) return sub.startDate;
  if (sub.createdAt) return sub.createdAt;
  return null;
}
function resolveSubEndDate(sub) {
  return sub.endDate || sub.dueDate || null;
}

// ─── Main Component ───────────────────────────────────────────
const MyTasks = () => {
  const router = useRouter();
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
  const currentUserName = user?.name || user?.username || "";

  // ── State (LOGIC UNCHANGED, except default filter) ────────
  const [tasks,       setTasks]       = useState([]);
  const [subtasksMap, setSubtasksMap] = useState({});
  const [expanded,    setExpanded]    = useState({});
  const [loading,     setLoading]     = useState(true);
  // ── Default view on load is Overdue, not All ──
  const [statusFilter, setStatusFilter] = useState("overdue");
  const [searchTerm,   setSearchTerm]   = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const TASKS_PER_PAGE = 15;
  const hasFetched = useRef(false);

  // ── Data fetching (LOGIC UNCHANGED) ───────────────────────
  useEffect(() => {
    if (!mounted || !user || hasFetched.current) { setLoading(false); return; }
    hasFetched.current = true;
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const all = await taskService.getAllTasks();
        const userOrgId = effectiveOrgId;
        const mine = all.filter(
          (t) =>
            String(t.organization) === String(userOrgId) &&
            t.employee === currentUserName
        );
        setTasks(mine);
        const subMap = {};
        await Promise.all(
          mine.map(async (t) => {
            try {
              const subs = await taskService.getSubTasks(t.taskId);
              if (subs && subs.length > 0) subMap[t.taskId] = subs;
            } catch (_) {}
          })
        );
        setSubtasksMap(subMap);
      } catch (e) { console.error("Failed to fetch tasks:", e); }
      finally { setLoading(false); }
    };
    fetchTasks();
  }, [mounted, user, effectiveOrgId]);

  const toggleExpand = (taskId) =>
    setExpanded((p) => ({ ...p, [taskId]: !p[taskId] }));

  // ── Filtering & Pagination — status/due filters unified ────
  const filteredTasks = useMemo(() => {
    let r = tasks;
    if (statusFilter === "overdue") {
      r = r.filter(isTaskOverdue);
    } else if (statusFilter === "dueSoon") {
      r = r.filter(isTaskDueSoon);
    } else if (statusFilter !== "all") {
      r = r.filter((t) => t.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      r = r.filter(
        (t) =>
          (t.description || "").toLowerCase().includes(q) ||
          (t.taskId || "").toLowerCase().includes(q)
      );
    }
    return [...r].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [tasks, statusFilter, searchTerm]);

  const totalPages    = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );

  const statusCount = useMemo(() => {
    const c = {};
    tasks.forEach((t) => { c[t.status] = (c[t.status] || 0) + 1; });
    return c;
  }, [tasks]);

  const allStatuses = Object.keys(STATUS_CONFIG).filter((s) => s !== "On Hold" && statusCount[s]);

  // ── Overdue / Due Soon counts — respect search but not the due/status filter itself ──
  const baseForDueCounts = useMemo(() => {
    if (!searchTerm.trim()) return tasks;
    const q = searchTerm.toLowerCase();
    return tasks.filter(
      (t) =>
        (t.description || "").toLowerCase().includes(q) ||
        (t.taskId || "").toLowerCase().includes(q)
    );
  }, [tasks, searchTerm]);

  const overdueCount = useMemo(() => baseForDueCounts.filter(isTaskOverdue).length, [baseForDueCounts]);
  const dueSoonCount = useMemo(() => baseForDueCounts.filter(isTaskDueSoon).length, [baseForDueCounts]);

  const getVisiblePages = (current, total) => {
    const pages = new Set();
    for (let i = 1; i <= Math.min(3, total); i++) pages.add(i);
    for (let i = Math.max(total - 2, 1); i <= total; i++) pages.add(i);
    for (let i = current - 1; i <= current + 1; i++) { if (i >= 1 && i <= total) pages.add(i); }
    return [...pages].sort((a, b) => a - b);
  };

  if (!mounted || !user) {
    return null;
  }

  // ── Stat cards: Total / In Progress / Done / Overdue / Due Soon ──
  const statsData = [
    { label: "Total",       value: tasks.length,                          filterValue: "all" },
    { label: "In Progress", value: statusCount["In Progress"] || 0,        filterValue: "In Progress" },
    { label: "Done",        value: statusCount["Done"] || 0,               filterValue: "Done" },
    { label: "Overdue",     value: overdueCount,                           filterValue: "overdue" },
    { label: "Due Soon",    value: dueSoonCount,                           filterValue: "dueSoon" },
  ];

  const handleFilterClick = (filterValue) => {
    setStatusFilter((prev) => (prev === filterValue ? "all" : filterValue));
    setCurrentPage(1);
  };

  // ── Render (UI matches TemplatesPage exactly) ──────────────
  return (
    <>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <main
          style={{
            flex: 1, maxWidth: 1400, margin: "0 auto", width: "100%",
            padding: "12px 20px 100px", boxSizing: "border-box",
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
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)"; }}
            >
              ← Back to Task Management
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
                  My Tasks
                </h1>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b", fontWeight: 400 }}>
                  Task Management ·{" "}
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>
                    {filteredTasks.length}
                  </span>{" "}
                  task{filteredTasks.length !== 1 ? "s" : ""} assigned to you
                </p>
              </div>
            </div>
          </div>

          {/* ── Stat Cards — clickable filters, same set driving the chips below ── */}
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
                active={statusFilter === s.filterValue}
                onClick={() => handleFilterClick(s.filterValue)}
              />
            ))}
          </section>

          {/* ── Filter bar (matching TemplatesPage toolbar style) ── */}
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
            {/* Status label */}
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0 }}>
              Status
            </span>

            {/* Status chips — ordered Overdue, All, Due Soon, then real statuses */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
              {/* Overdue */}
              <button
                onClick={() => handleFilterClick("overdue")}
                style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
                  background: statusFilter === "overdue" ? "#fff5f5" : "#f8fafc",
                  border: `1.5px solid ${statusFilter === "overdue" ? "#fa5252" : "#e2e8f0"}`,
                  color: statusFilter === "overdue" ? "#c92a2a" : "#64748b",
                }}
              >
                <span style={{ marginRight: 4, display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: statusFilter === "overdue" ? "#fa5252" : "#94a3b8", verticalAlign: "middle" }} />
                {overdueCount} Overdue
              </button>

              {/* All */}
              <button
                onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
                style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
                  background: statusFilter === "all" ? "#eff6ff" : "#f8fafc",
                  border: `1.5px solid ${statusFilter === "all" ? "#3b82f6" : "#e2e8f0"}`,
                  color: statusFilter === "all" ? "#1d4ed8" : "#64748b",
                }}
              >
                All ({tasks.length})
              </button>

              {/* Due Soon */}
              <button
                onClick={() => handleFilterClick("dueSoon")}
                style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
                  background: statusFilter === "dueSoon" ? "#fff9db" : "#f8fafc",
                  border: `1.5px solid ${statusFilter === "dueSoon" ? "#f59f00" : "#e2e8f0"}`,
                  color: statusFilter === "dueSoon" ? "#e67700" : "#64748b",
                }}
              >
                <span style={{ marginRight: 4, display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: statusFilter === "dueSoon" ? "#f59f00" : "#94a3b8", verticalAlign: "middle" }} />
                {dueSoonCount} Due Soon
              </button>

              {/* Real statuses (To-Do / In Progress / Done) */}
              {allStatuses.map((st) => {
                const c      = STATUS_CONFIG[st];
                const active = statusFilter === st;
                return (
                  <button
                    key={st}
                    onClick={() => handleFilterClick(st)}
                    style={{
                      padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
                      background: active ? c.bg : "#f8fafc",
                      border: `1.5px solid ${active ? c.dot : "#e2e8f0"}`,
                      color: active ? c.color : "#64748b",
                    }}
                  >
                    <span style={{ marginRight: 4, display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: active ? c.dot : "#94a3b8", verticalAlign: "middle" }} />
                    {statusCount[st]} {st}
                  </button>
                );
              })}
            </div>

            <div style={{ width: 1, height: 24, background: "#e2e8f0", flexShrink: 0 }} />

            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 180px", maxWidth: 280 }}>
              <Search size={13} color="#94a3b8" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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

            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={() => { setSearchTerm(""); setStatusFilter("all"); setCurrentPage(1); }}
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
            {loading ? (
              <div style={{ textAlign: "center", padding: 80 }}>
                <div
                  style={{
                    width: 32, height: 32, border: "3px solid #e2e8f0",
                    borderTop: "3px solid #3b82f6", borderRadius: "50%",
                    margin: "0 auto 14px", animation: "spin 0.8s linear infinite",
                  }}
                />
                <p style={{ color: "#64748b", fontSize: 13, margin: 0, fontWeight: 500 }}>
                  Loading your tasks...
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800, background: "transparent" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      {[
                        { label: "#",           align: "center", width: 60 },
                        { label: "Task ID",     align: "center", width: 110 },
                        { label: "Description", align: "left",   minWidth: 300 },
                        { label: "Assignee",    align: "left",   width: 150 },
                        { label: "Priority",    align: "center", width: 120 },
                        { label: "Start Date",  align: "center", width: 110 },
                        { label: "Due Date",    align: "center", width: 110 },
                        { label: "Status",      align: "center", width: 140, accent: true },
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
                            ...(width    ? { width }    : {}),
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
                        <td colSpan={8} style={{ padding: "48px 20px", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 48, height: 48, borderRadius: 12,
                                background: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >
                              <ClipboardList size={22} color="white" strokeWidth={1.8} />
                            </div>
                            <p style={{ color: "#64748b", fontWeight: 600, fontSize: 14, margin: 0 }}>
                              No tasks {statusFilter === "overdue" ? "overdue" : statusFilter === "dueSoon" ? "due soon" : "assigned to you"}
                            </p>
                            <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                              Tasks assigned to you will appear here
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedTasks.map((task, displayIndex) => {
                        const subs        = subtasksMap[task.taskId] || [];
                        const hasSubtasks = subs.length > 0;
                        const isExpanded  = !!expanded[task.taskId];
                        const isOverdue   = isTaskOverdue(task);
                        const serialNo    = (currentPage - 1) * TASKS_PER_PAGE + displayIndex + 1;
                        const notLastRow  = displayIndex < paginatedTasks.length - 1;

                        return (
                          <React.Fragment key={task.taskId}>
                            <tr
                              style={{
                                background: serialNo % 2 === 0 ? "transparent" : "rgba(248,250,252,0.6)",
                                borderBottom: "1px solid #f1f5f9",
                                transition: "all 0.15s",
                                borderLeft: "3px solid transparent",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.95)";
                                e.currentTarget.style.borderLeft = "3px solid #cbd5e1";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = serialNo % 2 === 0 ? "transparent" : "rgba(248,250,252,0.6)";
                                e.currentTarget.style.borderLeft = "3px solid transparent";
                              }}
                            >
                              {/* # */}
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "#f3f0ff", padding: "2px 7px", borderRadius: 4 }}>
                                  {serialNo}
                                </span>
                              </td>

                              {/* Task ID */}
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                                  {hasSubtasks && (
                                    <span
                                      onClick={() => toggleExpand(task.taskId)}
                                      style={{
                                        cursor: "pointer", fontSize: 10, color: "#94a3b8",
                                        userSelect: "none", display: "inline-block",
                                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                        transition: "transform 0.15s",
                                      }}
                                    >
                                      ▶
                                    </span>
                                  )}
                                  <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "#f3f0ff", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>
                                    {task.taskId}
                                  </span>
                                  {hasSubtasks && (
                                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{subs.length}</span>
                                  )}
                                </div>
                              </td>

                              {/* Description */}
                              <td style={{ padding: "12px", color: "#475569", fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: 380 }}>
                                  {task.description || "—"}
                                </span>
                              </td>

                              {/* Assignee */}
                              <td style={{ padding: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <Avatar name={task.employee} size={22} />
                                  <span style={{ fontSize: 12, fontWeight: 600, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }}>
                                    {task.employee || "—"}
                                  </span>
                                </div>
                              </td>

                              {/* Priority */}
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <PriorityPill priority={task.priority} />
                              </td>

                              {/* Start Date */}
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <span style={{ fontSize: 12, color: "#64748b" }}>
                                  {formatDate(task.startDate)}
                                </span>
                              </td>

                              {/* Due Date */}
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: isOverdue ? "#ef4444" : "#475569", whiteSpace: "nowrap" }}>
                                  {isOverdue && <span title="Overdue" style={{ marginRight: 4 }}>⚠</span>}
                                  {formatDate(task.endDate)}
                                </span>
                              </td>

                              {/* Status */}
                              <td style={{ padding: "12px", textAlign: "center", background: "rgba(248,250,252,0.5)" }}>
                                <StatusPill status={task.status} />
                              </td>
                            </tr>

                            {/* ── Subtask rows (LOGIC UNCHANGED) ── */}
                            {isExpanded && subs.map((sub, si) => {
                              const subStartDate = resolveSubStartDate(sub);
                              const subEndDate   = resolveSubEndDate(sub);
                              const subOverdue   = subEndDate && new Date(subEndDate) < new Date() && sub.status !== "Done";

                              return (
                                <tr
                                  key={sub.subTaskId}
                                  style={{
                                    background: "rgba(248,245,255,0.7)",
                                    borderBottom: "1px solid #f1f5f9",
                                    borderLeft: "3px solid rgba(124,58,237,0.18)",
                                    transition: "background 0.1s",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(243,240,255,0.95)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(248,245,255,0.7)")}
                                >
                                  {/* # sub */}
                                  <td style={{ padding: "9px 12px", textAlign: "center" }}>
                                    <span style={{ fontSize: 10, color: "#94a3b8" }}>└</span>
                                  </td>

                                  {/* Sub Task ID */}
                                  <td style={{ padding: "9px 12px", textAlign: "center" }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "#f3f0ff", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>
                                      {sub.subTaskId}
                                    </span>
                                  </td>

                                  {/* Sub Description */}
                                  <td style={{ padding: "9px 12px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                      <span style={{ color: "#94a3b8", fontSize: 11 }}>└</span>
                                      <span style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {sub.description || "—"}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Sub Assignee */}
                                  <td style={{ padding: "9px 12px" }}>
                                    {sub.assignee ? (
                                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <Avatar name={sub.assignee} size={20} />
                                        <span style={{ fontSize: 11, color: "#64748b", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                          {sub.assignee}
                                        </span>
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: 11, color: "#94a3b8" }}>—</span>
                                    )}
                                  </td>

                                  {/* Sub Priority */}
                                  <td style={{ padding: "9px 12px", textAlign: "center" }}>
                                    {sub.priority ? <PriorityPill priority={sub.priority} /> : <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>}
                                  </td>

                                  {/* Sub Start Date */}
                                  <td style={{ padding: "9px 12px", textAlign: "center" }}>
                                    <span style={{ fontSize: 12, color: "#64748b" }}>
                                      {formatDate(subStartDate)}
                                    </span>
                                  </td>

                                  {/* Sub Due Date */}
                                  <td style={{ padding: "9px 12px", textAlign: "center" }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: subOverdue ? "#ef4444" : "#64748b" }}>
                                      {subOverdue && <span style={{ marginRight: 3 }}>⚠</span>}
                                      {formatDate(subEndDate)}
                                    </span>
                                  </td>

                                  {/* Sub Status */}
                                  <td style={{ padding: "9px 12px", textAlign: "center", background: "rgba(248,250,252,0.5)" }}>
                                    <StatusPill status={sub.status} />
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
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
                  const isActive  = pageNum === currentPage;
                  const prevPage  = arr[index - 1];
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

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes cardIn  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar       { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </>
  );
};

export default MyTasks;