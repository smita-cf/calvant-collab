
//C:\Users\ak192\Downloads\cf-tool-frontend-prod (5)\cf-tool-frontend-prod\src\modules\riskAssesment\pages\MyTasks.js

"use client";


import React, { useEffect, useState, useMemo, useRef } from "react";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Zap,
  CheckCircle2,
  PauseCircle,
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
  "Pending":                      { bg: "#fff9db", color: "#e67700", dot: "#f59f00" },
  "Completed (Pending Approval)": { bg: "#e7f5ff", color: "#1971c2", dot: "#339af0" },
  "Approved":                     { bg: "#ebfbee", color: "#2f9e44", dot: "#40c057" },
};

const PRIORITY_CONFIG = {
  Low:      { color: "#2f9e44", bg: "#ebfbee", icon: "▼" },
  Medium:   { color: "#f59f00", bg: "#fff9db", icon: "■" },
  High:     { color: "#e8590c", bg: "#fff4e6", icon: "▲" },
  Critical: { color: "#c92a2a", bg: "#fff5f5", icon: "⚑" },
};

const PRIORITY_WEIGHT = { Critical: 0, High: 1, Medium: 2, Low: 3 };

// Flex weights — Description is widest, Status second, rest balanced
const COLUMNS = [
  { key: "id",          label: "Task ID",     flex: 1.1 },
  { key: "description", label: "Description", flex: 2.8 },
  { key: "riskId",      label: "Risk ID",     flex: 1.1 },
  { key: "assignee",    label: "Assignee",    flex: 1.4 },
  { key: "priority",    label: "Priority",    flex: 1.0 },
  { key: "startDate",   label: "Start Date",  flex: 1.1 },
  { key: "dueDate",     label: "Due Date",    flex: 1.1 },
  { key: "status",      label: "Status",      flex: 1.7 },
];

// Per-column hard minimums in px — scroll only below this total (~837px)
const COL_MIN = {
  id: 88, description: 160, riskId: 88, assignee: 110,
  priority: 85, startDate: 88, dueDate: 88, status: 130,
};
const ABSOLUTE_MIN = Object.values(COL_MIN).reduce((a, b) => a + b, 0);

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "—";
  const s = d.split("T")[0].split("-");
  return `${s[2]}-${s[1]}-${s[0]}`;
}
function initials(name) {
  return (name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}
const AV_COLORS = ["#7950f2","#1971c2","#0ca678","#e8590c","#c2255c","#f59f00","#364fc7"];
function avColor(name) { return AV_COLORS[(name || "").charCodeAt(0) % AV_COLORS.length]; }

function Avatar({ name, size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: avColor(name), color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
}

function StatusPill({ status }) {
  const c = STATUS_CONFIG[status] || { bg: "#f1f3f5", color: "#495057", dot: "#868e96" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20,
      background: c.bg, color: c.color, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {status || "—"}
    </span>
  );
}

function PriorityPill({ priority }) {
  const c = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["Medium"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 8px", borderRadius: 4,
      background: c.bg, color: c.color, fontSize: 11, fontWeight: 700,
    }}>
      <span style={{ fontSize: 9 }}>{c.icon}</span>
      {priority || "—"}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────
const STAT_STYLES = {
  "Total":       { gradient: "from-blue-400 to-blue-500",       Icon: ClipboardList },
  "In Progress": { gradient: "from-sky-400 to-sky-500",         Icon: Zap           },
  "Completed":   { gradient: "from-emerald-400 to-emerald-500", Icon: CheckCircle2  },
  "On Hold":     { gradient: "from-amber-400 to-amber-500",     Icon: PauseCircle   },
  "Critical":    { gradient: "from-red-400 to-red-500",         Icon: AlertOctagon  },
};

function StatCard({ value, label, index }) {
  const s = STAT_STYLES[label] || STAT_STYLES["Total"];
  return (
    <div
      className="group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-lg p-4 lg:p-3.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-default flex items-center gap-2 hover:bg-white"
      style={{ animation: `cardIn 0.4s ease ${index * 0.05}s both` }}
    >
      <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
        <s.Icon size={16} className="text-white drop-shadow-sm" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-lg lg:text-xl font-semibold text-slate-800 block leading-tight group-hover:text-slate-900">
          {value}
        </span>
        <span className="text-xs lg:text-sm font-medium text-slate-600 uppercase tracking-wide">
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Hook: watch actual rendered container width ──────────────
function useContainerWidth(ref) {
  const [width, setWidth] = useState(9999);
  useEffect(() => {
    if (!ref.current) return;
    const update = () => {
      if (ref.current) setWidth(ref.current.clientWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

// ─── Build grid columns string ────────────────────────────────
// Uses minmax so each column respects its minimum but fills available space.
// If container is wide enough, all columns fit; otherwise scroll activates.
function buildGridCols(containerWidth) {
  const totalFlex = COLUMNS.reduce((a, c) => a + c.flex, 0);
  return COLUMNS.map(c => {
    const pct = ((c.flex / totalFlex) * 100).toFixed(3);
    return `minmax(${COL_MIN[c.key]}px, ${pct}fr)`;
  }).join(" ");
}

// ─── Main Component ───────────────────────────────────────────
const MyTasks = ({ riskId = null }) => {
  const router          = useRouter();
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

  const [tasks,        setTasks]        = useState([]);
  const [subtasksMap,  setSubtasksMap]  = useState({});
  const [expanded,     setExpanded]     = useState({});
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm,   setSearchTerm]   = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const TASKS_PER_PAGE = 15;
  const hasFetched = useRef(false);

  const tableWrapRef   = useRef(null);
  const containerWidth = useContainerWidth(tableWrapRef);

  // gridCols: always fills 100% using fr; minWidth triggers scroll only < 837px
  const gridCols = buildGridCols(containerWidth);

  // Reset when riskId changes
  useEffect(() => {
    hasFetched.current = false;
    setTasks([]);
    setSubtasksMap({});
  }, [riskId]);

  useEffect(() => {
    if (!mounted || !user || hasFetched.current) { setLoading(false); return; }
    hasFetched.current = true;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const all = await taskService.getAllTasks();
        const userOrgId = effectiveOrgId;
        const mine = all.filter(t => {
          if (String(t.organization) !== String(userOrgId)) return false;
          if (t.employee !== currentUserName) return false;
          if (riskId) {
            if (t.riskId !== riskId) return false;
          } else {
            if (!t.riskId) return false;
          }
          return true;
        });
        setTasks(mine);

        const subMap = {};
        await Promise.all(mine.map(async t => {
          try {
            const subs = await taskService.getSubTasks(t.taskId);
            if (subs && subs.length > 0) subMap[t.taskId] = subs;
          } catch (_) {}
        }));
        setSubtasksMap(subMap);
      } catch (e) {
        console.error("Failed to fetch tasks:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [mounted, user, effectiveOrgId, riskId]);

  const toggleExpand = (taskId) =>
    setExpanded(p => ({ ...p, [taskId]: !p[taskId] }));

  const filteredTasks = useMemo(() => {
    let r = tasks;
    if (statusFilter !== "all") r = r.filter(t => t.status === statusFilter);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      r = r.filter(t =>
        (t.description || "").toLowerCase().includes(q) ||
        (t.taskId || "").toLowerCase().includes(q) ||
        (t.riskId || "").toLowerCase().includes(q)
      );
    }
    return [...r].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [tasks, statusFilter, searchTerm]);

  const totalPages     = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE
  );

  const statusCount = useMemo(() => {
    const c = {};
    tasks.forEach(t => { c[t.status] = (c[t.status] || 0) + 1; });
    return c;
  }, [tasks]);

  const allStatuses = Object.keys(statusCount);

  const statsData = [
    { value: tasks.length,                                        label: "Total" },
    { value: statusCount["In Progress"] || 0,                     label: "In Progress" },
    { value: statusCount["Done"] || statusCount["Approved"] || 0, label: "Completed" },
    { value: statusCount["On Hold"] || 0,                         label: "On Hold" },
    { value: tasks.filter(t => t.priority === "Critical").length, label: "Critical" },
  ];

  // minWidth:0 + overflow:hidden on every cell is the key that lets CSS Grid
  // compress cells rather than overflow the container.
  const cell    = (extra = {}) => ({ padding: "8px 10px",  borderRight: "1px solid #f1f5f9", display: "flex", alignItems: "center", minWidth: 0, overflow: "hidden", ...extra });
  const cellL   = (extra = {}) => ({ padding: "11px 10px", borderRight: "1px solid #f1f5f9", display: "flex", alignItems: "center", minWidth: 0, overflow: "hidden", ...extra });
  const cellEnd = ()            => ({ padding: "8px 10px",  display: "flex", alignItems: "center", minWidth: 0, overflow: "hidden" });

  if (!mounted || !user) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 flex flex-col overflow-hidden">

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 lg:py-8 pb-24 lg:pb-28 overflow-hidden">

          {/* ── Back button ── */}
          <div className="mb-3">
            <button
              onClick={() => router.push("/risk-assessment")}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              ← Back to Risk Assessment
            </button>
          </div>

          {/* ── Header ── */}
          <header className="bg-white/80 backdrop-blur-md border border-slate-100/50 rounded-xl shadow-md mb-4 lg:mb-4 p-4 lg:p-5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ClipboardCheck className="w-6 h-6 lg:w-7 lg:h-7 text-white drop-shadow-sm" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-semibold text-slate-800 leading-tight">
                    View Tasks
                  </h1>
                  <p className="text-sm lg:text-base text-slate-600 mt-1">
                    Risk Assessment •{" "}
                    <span className="font-bold text-lg text-slate-900">
                      {filteredTasks.length}
                    </span>{" "}
                    task{filteredTasks.length !== 1 ? "s" : ""} assigned to you
                    {riskId && (
                      <span className="ml-2 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                        {riskId}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {riskId && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">Scoped to Risk</div>
                  <div className="text-base font-bold text-purple-700">{riskId}</div>
                </div>
              )}
            </div>
          </header>

          {/* ── Stat Cards ── */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
            {statsData.map((s, i) => (
              <StatCard key={s.label} {...s} index={i} />
            ))}
          </section>

          {/* ── Filter Bar ── */}
          <div
            className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-xl shadow-sm mb-4 px-4 py-3 flex flex-wrap gap-2 items-center"
            style={{ animation: "fadeUp 0.4s ease 0.2s both" }}
          >
            <div
              onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "5px 12px",
                borderRadius: 20, cursor: "pointer",
                background: statusFilter === "all" ? "#f3f0ff" : "#f8fafc",
                border: `1.5px solid ${statusFilter === "all" ? "#7950f2" : "transparent"}`,
                fontSize: 12, fontWeight: 700,
                color: statusFilter === "all" ? "#7950f2" : "#64748b",
                boxShadow: statusFilter === "all" ? "0 0 0 3px #7950f225" : "none",
                transition: "all 0.15s",
              }}
            >
              {tasks.length} All
            </div>

            {allStatuses.map(st => {
              const c      = STATUS_CONFIG[st] || { bg: "#f1f3f5", color: "#495057", dot: "#868e96" };
              const active = statusFilter === st;
              return (
                <div
                  key={st}
                  onClick={() => { setStatusFilter(active ? "all" : st); setCurrentPage(1); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "5px 12px",
                    borderRadius: 20, cursor: "pointer",
                    background: active ? c.bg : "#f8fafc",
                    border: `1.5px solid ${active ? c.dot : "transparent"}`,
                    fontSize: 12, fontWeight: 700, color: active ? c.color : "#64748b",
                    boxShadow: active ? `0 0 0 3px ${c.dot}25` : "none",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? c.dot : "#94a3b8" }} />
                  {statusCount[st]} {st}
                </div>
              );
            })}

            <div style={{ width: 1, height: 26, background: "#e2e8f0", flexShrink: 0 }} />

            <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 300 }}>
              <Search
                size={13}
                color="#94a3b8"
                style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              />
              <input
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search by task, risk ID..."
                style={{ width: "100%", padding: "7px 10px 7px 30px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#f8fafc", boxSizing: "border-box", transition: "all 0.2s" }}
                onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.background = "#fff"; }}
                onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; }}
              />
            </div>

            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={() => { setSearchTerm(""); setStatusFilter("all"); setCurrentPage(1); }}
                style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* ── Table ── */}
          {loading ? (
            <div className="text-center py-20">
              <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTop: "3px solid #3b82f6", borderRadius: "50%", margin: "0 auto 14px", animation: "spin 0.8s linear infinite" }} />
              <p className="text-slate-500 text-sm font-medium">Loading your tasks...</p>
            </div>
          ) : (
            /*
             * tableWrapRef — ResizeObserver reads the true rendered width here.
             * overflow-x: auto — only scrolls when content < ABSOLUTE_MIN (837px).
             * On 1366px laptop with sidebar (~1050px content), no scroll triggers.
             */
            <div
              ref={tableWrapRef}
              className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-xl shadow-md mb-5"
              style={{ animation: "fadeUp 0.4s ease 0.25s both", width: "100%", overflowX: "auto" }}
            >
              {/* Inner wrapper — always 100% wide; minWidth is the hard floor */}
              <div style={{ width: "100%", minWidth: ABSOLUTE_MIN + "px" }}>

                {/* Table header */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: gridCols,
                  background: "#f8fafc",
                  borderBottom: "2px solid #e2e8f0",
                  width: "100%",
                }}>
                  {COLUMNS.map((col, i) => (
                    <div
                      key={col.key}
                      style={{
                        padding: "10px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.7px",
                        borderRight: i < COLUMNS.length - 1 ? "1px solid #e2e8f0" : "none",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        minWidth: 0,
                      }}
                    >
                      {col.label}
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {paginatedTasks.length === 0 && (
                  <div className="text-center py-16 px-5 text-slate-400">
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-md">
                        <ClipboardList size={22} className="text-white" strokeWidth={1.8} />
                      </div>
                    </div>
                    <p className="text-base font-bold text-slate-600 mb-1">No tasks assigned to you</p>
                    <p className="text-sm text-slate-400">
                      {riskId ? `No tasks found for risk ${riskId}` : "Tasks assigned to you will appear here"}
                    </p>
                  </div>
                )}

                {/* Task rows */}
                {paginatedTasks.map((task, idx) => {
                  const subs        = subtasksMap[task.taskId] || [];
                  const hasSubtasks = subs.length > 0;
                  const isExpanded  = !!expanded[task.taskId];
                  const isOverdue   = task.endDate && new Date(task.endDate) < new Date() && task.status !== "Done" && task.status !== "Approved";
                  const notLastRow  = idx < paginatedTasks.length - 1;

                  return (
                    <React.Fragment key={task.taskId}>

                      {/* Parent task row */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: gridCols,
                          width: "100%",
                          borderBottom: (notLastRow || isExpanded) ? "1px solid #f1f5f9" : "none",
                          background: "transparent",
                          borderLeft: "3px solid transparent",
                          transition: "all 0.1s",
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; e.currentTarget.style.borderLeft = "3px solid #cbd5e1"; }}
                        onMouseOut={e  => { e.currentTarget.style.background = "transparent";             e.currentTarget.style.borderLeft = "3px solid transparent"; }}
                      >
                        {/* Task ID */}
                        <div style={cellL({ gap: 5 })}>
                          {hasSubtasks && (
                            <span
                              onClick={() => toggleExpand(task.taskId)}
                              style={{ cursor: "pointer", fontSize: 10, color: "#94a3b8", userSelect: "none", display: "inline-block", flexShrink: 0, transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
                            >▶</span>
                          )}
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "#f3f0ff", padding: "2px 5px", borderRadius: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {task.taskId}
                          </span>
                          {hasSubtasks && (
                            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>{subs.length}</span>
                          )}
                        </div>

                        {/* Description */}
                        <div style={cellL()}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                            {task.description || "—"}
                          </span>
                        </div>

                        {/* Risk ID */}
                        <div style={cell()}>
                          {task.riskId
                            ? <span style={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8", background: "#eff6ff", padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.riskId}</span>
                            : <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                          }
                        </div>

                        {/* Assignee */}
                        <div style={cell({ gap: 5 })}>
                          <Avatar name={task.employee} size={20} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {task.employee || "—"}
                          </span>
                        </div>

                        {/* Priority */}
                        <div style={cell()}>
                          <PriorityPill priority={task.priority} />
                        </div>

                        {/* Start Date */}
                        <div style={cell()}>
                          <span style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{formatDate(task.startDate)}</span>
                        </div>

                        {/* Due Date */}
                        <div style={cell()}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: isOverdue ? "#dc2626" : "#475569", whiteSpace: "nowrap" }}>
                            {isOverdue && <span title="Overdue" style={{ marginRight: 4 }}>⚠</span>}
                            {formatDate(task.endDate)}
                          </span>
                        </div>

                        {/* Status */}
                        <div style={cellEnd()}>
                          <StatusPill status={task.status} />
                        </div>
                      </div>
                      {/* /Parent row */}

                      {/* Subtask rows */}
                      {isExpanded && subs.map((sub, si) => {
                        const subEndDate = sub.endDate || sub.dueDate || null;
                        const subOverdue = subEndDate && new Date(subEndDate) < new Date() && sub.status !== "Done";
                        const subIsLast  = si === subs.length - 1 && !notLastRow;
                        return (
                          <div
                            key={sub.subTaskId}
                            style={{
                              display: "grid",
                              gridTemplateColumns: gridCols,
                              width: "100%",
                              borderBottom: subIsLast ? "none" : "1px solid #f1f5f9",
                              background: "rgba(250,251,255,0.8)",
                              borderLeft: "3px solid rgba(124,58,237,0.12)",
                              transition: "background 0.1s",
                            }}
                            onMouseOver={e => e.currentTarget.style.background = "rgba(245,243,255,0.95)"}
                            onMouseOut={e  => e.currentTarget.style.background = "rgba(250,251,255,0.8)"}
                          >
                            {/* Subtask ID */}
                            <div style={{ padding: "9px 10px 9px 28px", borderRight: "1px solid #f1f5f9", display: "flex", alignItems: "center", minWidth: 0, overflow: "hidden" }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "#f3f0ff", padding: "2px 5px", borderRadius: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {sub.subTaskId}
                              </span>
                            </div>

                            {/* Subtask Description */}
                            <div style={{ padding: "9px 10px 9px 14px", borderRight: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 5, minWidth: 0, overflow: "hidden" }}>
                              <span style={{ color: "#94a3b8", fontSize: 11, flexShrink: 0 }}>└</span>
                              <span style={{ fontSize: 12, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {sub.description || "—"}
                              </span>
                            </div>

                            {/* Subtask Risk ID */}
                            <div style={cell()}>
                              {task.riskId
                                ? <span style={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8", background: "#eff6ff", padding: "2px 6px", borderRadius: 4, opacity: 0.6 }}>{task.riskId}</span>
                                : <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                              }
                            </div>

                            {/* Subtask Assignee */}
                            <div style={cell({ gap: 5 })}>
                              {sub.assignee ? (
                                <>
                                  <Avatar name={sub.assignee} size={18} />
                                  <span style={{ fontSize: 11, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.assignee}</span>
                                </>
                              ) : <span style={{ fontSize: 11, color: "#94a3b8" }}>—</span>}
                            </div>

                            {/* Subtask Priority */}
                            <div style={cell()}>
                              {sub.priority ? <PriorityPill priority={sub.priority} /> : <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>}
                            </div>

                            {/* Subtask Start Date */}
                            <div style={cell()}>
                              <span style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>{formatDate(sub.startDate || sub.createdAt)}</span>
                            </div>

                            {/* Subtask Due Date */}
                            <div style={cell()}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: subOverdue ? "#dc2626" : "#64748b", whiteSpace: "nowrap" }}>
                                {subOverdue && <span style={{ marginRight: 3 }}>⚠</span>}
                                {formatDate(subEndDate)}
                              </span>
                            </div>

                            {/* Subtask Status */}
                            <div style={cellEnd()}>
                              <StatusPill status={sub.status} />
                            </div>
                          </div>
                        );
                      })}
                      {/* /Subtask rows */}

                    </React.Fragment>
                  );
                })}

              </div>{/* /inner wrapper */}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 flex-wrap">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: "6px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontWeight: 700, color: currentPage === 1 ? "#94a3b8" : "#475569" }}
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} style={{
                  padding: "6px 12px", border: "1.5px solid", borderRadius: 8,
                  borderColor: currentPage === p ? "#3b82f6" : "#e2e8f0",
                  background: currentPage === p ? "#3b82f6" : "#fff",
                  color: currentPage === p ? "#fff" : "#475569",
                  fontWeight: 700, cursor: "pointer",
                }}>{p}</button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: "6px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontWeight: 700, color: currentPage === totalPages ? "#94a3b8" : "#475569" }}
              >›</button>
            </div>
          )}

        </main>

        {/* ── Footer ── */}
        <footer className="bg-white/90 backdrop-blur-md border-t border-slate-100/50 shadow-lg px-6 py-4 lg:px-8 lg:py-5 sticky bottom-0 z-50">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm lg:text-base text-slate-600 font-medium">
              © {new Date().getFullYear()} CalVant. All rights reserved.
            </p>
          </div>
        </footer>

      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes cardIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </>
  );
};

export default MyTasks;
