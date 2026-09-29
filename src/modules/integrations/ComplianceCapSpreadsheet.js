import React, { useState, useMemo } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Clock,
  Table2,
  ClipboardList,
  ChevronDown,
  Eye,
  AlertTriangle,
  TrendingUp,
  Target,
  Zap,
  Filter,
} from "lucide-react";
import { CircularProgress } from "@material-ui/core";
import { useFramework } from "../../context/FrameworkContex";
import Evidence_Modal from "./evidencemodal"; // adjust path as needed

// ─── Helpers ─────────────────────────────────────────────────────────────────


const PRIORITY_COLORS = {
  Critical: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
  High:     { bg: "#fff7ed", color: "#92400e", border: "#fed7aa" },
  Medium:   { bg: "#fefce8", color: "#854d0e", border: "#fde68a" },
  Low:      { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
};

const STATUS_COLORS = {
  "To-Do":       { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
  "In Progress": { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  "Closed":      { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
};

const fmt = (v) => {
  if (v === null || v === undefined) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
};

const hasEvidence = (evidence) => {
  if (!evidence) return false;
  if (typeof evidence === "string") {
    try {
      const p = JSON.parse(evidence);
      if (Array.isArray(p)) return p.length > 0;
      if (typeof p === "object") return Object.keys(p).length > 0;
      return false;
    } catch { return evidence.length > 0 && !evidence.startsWith('"Graph API error'); }
  }
  if (Array.isArray(evidence)) return evidence.length > 0;
  if (typeof evidence === "object") return Object.keys(evidence).length > 0;
  return false;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FrameworkBadge({ code, availableFrameworks }) {
  const fwObj = availableFrameworks?.find(f => f.code === code) || { label: code, color: "#64748b" };
  const bg = fwObj.color ? fwObj.color + "15" : "#f1f5f9";
  const border = fwObj.color ? fwObj.color + "40" : "#cbd5e1";
  const color = fwObj.color || "#334155";
  return (
    <span style={{
      display: "inline-block", fontSize: 10, fontWeight: 700,
      padding: "2px 7px", borderRadius: 5,
      backgroundColor: bg, border: `1px solid ${border}`, color: color,
      whiteSpace: "nowrap", letterSpacing: 0.2,
    }}>{fwObj.label || code}</span>
  );
}

function ScoreGap({ current, target }) {
  const c = fmt(current);
  const t = fmt(target);
  const hasCurrent = c !== null;
  const hasTarget  = t !== null;

  if (!hasCurrent && !hasTarget) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>No data</span>
      </div>
    );
  }

  const gap = (hasTarget && hasCurrent) ? (t - c) : null;
  const gapColor = gap === null ? "#94a3b8" : gap <= 0 ? "#16a34a" : gap <= 20 ? "#d97706" : "#dc2626";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#94a3b8", width: 42 }}>Current</span>
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: hasCurrent
            ? (c >= 70 ? "#16a34a" : c >= 40 ? "#d97706" : "#dc2626")
            : "#94a3b8",
        }}>
          {hasCurrent ? `${c.toFixed(1)}%` : "—"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#94a3b8", width: 42 }}>Target</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: hasTarget ? "#1565c0" : "#94a3b8" }}>
          {hasTarget ? `${t.toFixed(1)}%` : "—"}
        </span>
      </div>
      {gap !== null && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          fontSize: 10, fontWeight: 700, color: gapColor,
          padding: "1px 6px", borderRadius: 20,
          backgroundColor: `${gapColor}14`,
          border: `1px solid ${gapColor}33`,
          marginTop: 2,
        }}>
          {gap <= 0 ? "✓ Met" : `▲ Gap: ${gap.toFixed(1)}%`}
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ value }) {
  const s = PRIORITY_COLORS[value] || PRIORITY_COLORS.Medium;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{value}</span>
  );
}

function StatusBadge({ value }) {
  const s = STATUS_COLORS[value] || STATUS_COLORS["To-Do"];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{value}</span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ComplianceCapSpreadsheet
 *
 * Props:
 *   filteredData      – the same filteredData array from RiskAssessmentTable
 *   manualScores      – { [controlId]: number }
 *   manualTargetScores– { [controlId]: number }
 *   auditors          – []
 *   tenantId          – string
 *   activeFramework   – string
 *   isAllFrameworks   – bool
 *   onBack            – () => void
 *   taskService       – imported taskService
 */
export default function ComplianceCapSpreadsheet({
  availableFrameworks = [],

  filteredData = [],
  manualScores = {},
  manualTargetScores = {},
  auditors = [],
  tenantId,
  activeFramework,
  isAllFrameworks,
  onBack,
  taskService,
}) {
  // ── Derive "needs attention" rows ─────────────────────────────────────────
  const capRows = useMemo(() => {
    const rows = [];

    for (const group of filteredData) {
      const current = fmt(manualScores[group.controlId]);
      const target  = fmt(manualTargetScores[group.controlId]);

      // Compute live score from metrics (average)
      let liveScore = null;
      if (group.metrics && group.metrics.length > 0) {
        const scores = group.metrics
          .map(m => fmt(m.currentPerformance))
          .filter(s => s !== null);
        if (scores.length > 0) liveScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      }

      const effectiveCurrent = current !== null ? current : liveScore;
      const needsAttention =
        effectiveCurrent === null ||          // no score at all
        target === null ||                    // no target
        (target !== null && effectiveCurrent !== null && effectiveCurrent < target); // gap exists

      if (!needsAttention) continue;

      // Collect all evidence across metrics
      const allEvidence = (group.metrics || [])
        .filter(m => hasEvidence(m.evidence))
        .map(m => m.evidence);

      rows.push({
        controlId:   group.controlId,
        controlCode: group.controlCode || group.controlId,
        controlName: group.controlName || "",
        metric:      group.metric || "",
        framework:   group._framework || (group.frameworks?.[0]) || activeFramework,
        frameworks:  group.frameworks || [],
        current:     effectiveCurrent,
        target,
        status:      group.status,
        allEvidence,
        // editable fields
        rootCause:   "",
        assignee:    "",
        assigneeId:  "",
        priority:    "Medium",
        taskStatus:  "To-Do",
        dueDate:     "",
        _dirty:      false,
        _taskCreated: false,
        _saving:     false,
        source: "Compliance",
      });
    }

    return rows;
  }, [filteredData, manualScores, manualTargetScores, activeFramework]);

  const [rows, setRows]               = useState(() => capRows);
  const [evidenceModal, setEvidenceModal] = useState({ open: false, data: [] });
  const [saveMsg, setSaveMsg]         = useState("");
  const [globalSaving, setGlobalSaving] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("All");

  const updateRow = (idx, field, value) => {
    setRows(prev => prev.map((r, i) =>
      i === idx ? { ...r, [field]: value, _dirty: true } : r
    ));
  };

  // ── Create Task for a single row ──────────────────────────────────────────
  const handleCreateTask = async (idx) => {
    const row = rows[idx];
    const rawUser = sessionStorage.getItem("user");
    const user    = rawUser ? JSON.parse(rawUser) : null;
    const orgId   = user?.organization?._id || user?.organization || "";
    const changedBy = user?.name || user?.username || "System";
    const reporterId = user?.id || user?._id || "";

    if (!row.rootCause.trim()) {
      setSaveMsg(`⚠️ Add root cause for ${row.controlCode} before creating task.`);
      setTimeout(() => setSaveMsg(""), 3500);
      return;
    }

    setRows(prev => prev.map((r, i) => i === idx ? { ...r, _saving: true } : r));

    try {
      const assignedAuditor = auditors.find(a =>
        (a.id || a._id) === row.assigneeId || a.name === row.assignee
      );
      const payload = {
        description: `CAP: ${row.controlCode} — ${row.controlName.slice(0, 80)}`,
        employee:     row.assignee || changedBy,
        employeeId:   row.assigneeId || reporterId || null,
        employeeName: row.assignee || changedBy,
        employeeEmail: assignedAuditor?.email || user?.email || "",
        reporter:     changedBy,
        reporterId:   reporterId || null,
        reporterEmail: user?.email || "",
        priority:     row.priority,
        startDate:    new Date().toISOString().split("T")[0],
        endDate:      row.dueDate || null,
        status:       "To-Do",
        organization: orgId,
        department:   user?.department?.[0] || user?.department || "",
        source:       "Compliance",
        controlId:    row.controlId,
        rootCause:    row.rootCause,
        notes:        `Gap: ${row.current !== null ? row.current.toFixed(1) : "N/A"}% → Target: ${row.target !== null ? row.target.toFixed(1) : "N/A"}%`,
      };

      await taskService.saveTask(payload, changedBy);
      setRows(prev => prev.map((r, i) =>
        i === idx ? { ...r, _taskCreated: true, _saving: false, _dirty: false } : r
      ));
      setSaveMsg(`✅ Task created for ${row.controlCode}`);
    } catch (err) {
      setRows(prev => prev.map((r, i) => i === idx ? { ...r, _saving: false } : r));
      setSaveMsg(`❌ Failed: ${err.message || "unknown error"}`);
    }
    setTimeout(() => setSaveMsg(""), 4000);
  };

  // ── Create all dirty tasks at once ────────────────────────────────────────
  const handleSaveAll = async () => {
    const dirtyWithCause = rows.filter(r => r._dirty && r.rootCause.trim() && !r._taskCreated);
    if (dirtyWithCause.length === 0) {
      setSaveMsg("No rows ready to save (add root cause first).");
      setTimeout(() => setSaveMsg(""), 3000);
      return;
    }
    setGlobalSaving(true);
    let ok = 0, fail = 0;
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i]._dirty || !rows[i].rootCause.trim() || rows[i]._taskCreated) continue;
      try {
        await handleCreateTask(i);
        ok++;
      } catch { fail++; }
    }
    setGlobalSaving(false);
    setSaveMsg(`✅ ${ok} task(s) created${fail ? `, ${fail} failed` : ""}.`);
    setTimeout(() => setSaveMsg(""), 4000);
  };

  const dirtyCount    = rows.filter(r => r._dirty && r.rootCause.trim() && !r._taskCreated).length;
  const createdCount  = rows.filter(r => r._taskCreated).length;

  const displayedRows = priorityFilter === "All"
    ? rows
    : rows.filter(r => r.priority === priorityFilter);

  // ── Styles ────────────────────────────────────────────────────────────────
  const headerCell = {
    padding: "11px 14px",
    background: "#0f172a",
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    borderRight: "1px solid #1e293b",
    borderBottom: "2px solid #020617",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    zIndex: 2,
  };
  const cell = {
    padding: "11px 13px",
    borderRight: "1px solid #f1f5f9",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "top",
    fontSize: 12,
    color: "#334155",
    background: "#fff",
  };
  const editInput = {
    width: "100%",
    fontSize: 12,
    padding: "6px 8px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 7,
    background: "#f8fafc",
    color: "#1e293b",
    boxSizing: "border-box",
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
    transition: "border-color 0.15s",
  };
  const editSelect = {
    ...editInput,
    appearance: "none",
    cursor: "pointer",
    paddingRight: 26,
    resize: "none",
  };

  // ── Summary stats ─────────────────────────────────────────────────────────
  const avgGap = useMemo(() => {
    const gaps = rows
      .filter(r => r.current !== null && r.target !== null)
      .map(r => r.target - r.current);
    if (!gaps.length) return null;
    return (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1);
  }, [rows]);

  return (
    <div style={{
      position: "fixed", top: 60, left: 0, right: 0, bottom: 0, zIndex: 998,
      background: "#f1f5f9", display: "flex", flexDirection: "column",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(90deg, #0f172a 0%, #1e293b 100%)",
        borderBottom: "1px solid #1e293b",
        padding: "0 24px", height: 52,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexShrink: 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={onBack} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#94a3b8", display: "flex", alignItems: "center",
            gap: 6, fontSize: 13, fontWeight: 600, padding: "6px 10px",
            borderRadius: 8, transition: "color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
          >
            <ArrowLeft size={15} /> Back
          </button>

          <div style={{ width: 1, height: 24, background: "#334155" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Table2 size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", letterSpacing: -0.3 }}>
                Corrective Action Plan
              </div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>
                Controls requiring attention · {rows.length} findings
              </div>
            </div>
          </div>

          {/* stats pills */}
          <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
            {[
              { icon: <AlertTriangle size={11} />, label: "Findings",  val: rows.length,  color: "#f97316" },
              { icon: <TrendingUp size={11} />,    label: "Avg Gap",   val: avgGap ? `${avgGap}%` : "—", color: "#6366f1" },
              { icon: <CheckCircle2 size={11} />,  label: "Tasks",     val: createdCount, color: "#22c55e" },
            ].map(s => (
              <div key={s.label} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 20,
                background: `${s.color}18`, border: `1px solid ${s.color}33`,
              }}>
                <span style={{ color: s.color }}>{s.icon}</span>
                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{s.label}:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Priority filter */}
          <div style={{ position: "relative" }}>
            <Filter size={12} color="#64748b" style={{ position: "absolute", left: 9, top: 9, pointerEvents: "none" }} />
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              style={{
                paddingLeft: 28, paddingRight: 28, paddingTop: 7, paddingBottom: 7,
                borderRadius: 8, border: "1px solid #334155",
                background: "#1e293b", color: "#cbd5e1",
                fontSize: 12, fontWeight: 600, cursor: "pointer", appearance: "none",
              }}
            >
              {["All", "Critical", "High", "Medium", "Low"].map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <ChevronDown size={12} color="#64748b" style={{ position: "absolute", right: 9, top: 9, pointerEvents: "none" }} />
          </div>

          {saveMsg && (
            <span style={{ fontSize: 12, fontWeight: 600, color: saveMsg.startsWith("❌") ? "#f87171" : saveMsg.startsWith("⚠️") ? "#fbbf24" : "#86efac" }}>
              {saveMsg}
            </span>
          )}
          {dirtyCount > 0 && !saveMsg && (
            <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>
              {dirtyCount} ready to save
            </span>
          )}
          <button
            onClick={handleSaveAll}
            disabled={globalSaving || dirtyCount === 0}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 18px", borderRadius: 9, border: "none",
              background: dirtyCount > 0 ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "#334155",
              color: dirtyCount > 0 ? "#fff" : "#64748b",
              fontSize: 13, fontWeight: 700, cursor: dirtyCount > 0 ? "pointer" : "not-allowed",
              boxShadow: dirtyCount > 0 ? "0 2px 10px rgba(99,102,241,0.35)" : "none",
              transition: "all 0.2s",
            }}
          >
            {globalSaving ? <CircularProgress size={13} style={{ color: "#fff" }} /> : <Save size={14} />}
            {globalSaving ? "Creating…" : "Create All Tasks"}
          </button>
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {rows.length === 0 ? (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CheckCircle2 size={32} color="#059669" />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
              All controls are on track!
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
              No controls have a gap between current and target scores.
            </div>
          </div>
        </div>
      ) : (

        /* ── Table ────────────────────────────────────────────────────────── */
        <div style={{ flex: 1, overflow: "auto" }}>
          <table style={{
            borderCollapse: "collapse", width: "100%",
            minWidth: 1600, tableLayout: "fixed",
          }}>
            <colgroup>
              <col style={{ width: 42 }} />
              <col style={{ width: 90 }} />
              {isAllFrameworks && <col style={{ width: 100 }} />}
              <col style={{ width: 190 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 230 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 110 }} />
            </colgroup>
            <thead>
              <tr>
                {[
                  "#",
                  "Control ID",
                  ...(isAllFrameworks ? ["Framework"] : []),
                  "Control Name / Metric",
                  "Evidence",
                  "Score Gap",
                  "Root Cause (5-Why)",
                  "Assigned To",
                  "Due Date",
                  "Priority",
                  "Status",
                  "Task",
                  "Actions",
                ].map(h => <th key={h} style={headerCell}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((row, idx) => {
                // Find original index for state updates
                const origIdx = rows.indexOf(row);
                const gap = (row.target !== null && row.current !== null)
                  ? (row.target - row.current) : null;
                const severity = gap === null ? "unknown" : gap > 30 ? "critical" : gap > 10 ? "high" : "low";
                const accentColor = severity === "critical" ? "#ef4444"
                  : severity === "high" ? "#f97316" : "#eab308";

                const rowBg = row._taskCreated
                  ? "#f0fdf4"
                  : row._dirty ? "#fefce8" : "#fff";

                const c = { ...cell, background: rowBg };

                return (
                  <tr key={row.controlId} style={{ borderLeft: `3px solid ${accentColor}` }}>

                    {/* # */}
                    <td style={{ ...c, textAlign: "center", fontWeight: 700, color: "#94a3b8", fontSize: 11 }}>
                      {idx + 1}
                      <div style={{ marginTop: 4 }}>
                        {row._taskCreated && <CheckCircle2 size={12} color="#22c55e" />}
                        {row._dirty && !row._taskCreated && <Clock size={12} color="#f59e0b" />}
                      </div>
                    </td>

                    {/* Control ID */}
                    <td style={c}>
                      <span style={{
                        fontSize: 11, fontFamily: "monospace", fontWeight: 700,
                        background: "#f1f5f9", color: "#334155",
                        padding: "2px 7px", borderRadius: 5,
                        border: "1px solid #e2e8f0", display: "inline-block",
                        marginBottom: 4,
                      }}>
                        {row.controlCode}
                      </span>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                        {row.status === "connected" ? (
                          <span style={{ color: "#1976d2" }}>● Connected</span>
                        ) : row.status === "mapped" ? (
                          <span style={{ color: "#2e7d32" }}>● Mapped</span>
                        ) : (
                          <span style={{ color: "#f44336" }}>○ Disconnected</span>
                        )}
                      </div>
                    </td>

                    {/* Framework (ALL mode only) */}
                    {isAllFrameworks && (
                      <td style={c}>
                        {row.frameworks.length > 0
                          ? row.frameworks.map(fw => <div key={fw} style={{ marginBottom: 3 }}><FrameworkBadge code={fw} availableFrameworks={availableFrameworks} /></div>)
                          : <FrameworkBadge code={row.framework} availableFrameworks={availableFrameworks} />
                        }
                      </td>
                    )}

                    {/* Control Name */}
                    <td style={c}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", lineHeight: 1.5, marginBottom: 3 }}>
                        {row.controlName || "—"}
                      </div>
                      {row.metric && row.metric !== row.controlName && (
                        <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.4 }}>
                          {row.metric}
                        </div>
                      )}
                    </td>

                    {/* Evidence */}
                    <td style={{ ...c, textAlign: "center" }}>
                      {row.allEvidence.length > 0 ? (
                        <button
                          onClick={() => setEvidenceModal({
                            open: true,
                            data: row.allEvidence.length === 1 ? row.allEvidence[0] : row.allEvidence,
                          })}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "5px 10px", borderRadius: 7,
                            border: "1px solid #93c5fd",
                            background: "#eff6ff", color: "#1d4ed8",
                            fontSize: 11, fontWeight: 700, cursor: "pointer",
                          }}
                        >
                          <Eye size={12} /> View ({row.allEvidence.length})
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: "#cbd5e1", fontStyle: "italic" }}>No evidence</span>
                      )}
                    </td>

                    {/* Score Gap */}
                    <td style={c}>
                      <ScoreGap current={row.current} target={row.target} />
                    </td>

                    {/* Root Cause */}
                    <td style={c}>
                      <textarea
                        rows={3}
                        value={row.rootCause}
                        onChange={e => updateRow(origIdx, "rootCause", e.target.value)}
                        placeholder="Why? Why? Why? Why? Why?&#10;(5-Why analysis)"
                        style={editInput}
                        onFocus={e => e.target.style.borderColor = "#6366f1"}
                        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                      />
                    </td>

                    {/* Assigned To */}
                    <td style={c}>
                      <div style={{ position: "relative" }}>
                        <select
                          value={row.assigneeId}
                          onChange={e => {
                            const a = auditors.find(x => (x.id || x._id) === e.target.value);
                            updateRow(origIdx, "assigneeId", e.target.value);
                            updateRow(origIdx, "assignee", a?.name || "");
                          }}
                          style={editSelect}
                          onFocus={e => e.target.style.borderColor = "#6366f1"}
                          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                        >
                          <option value="">Unassigned</option>
                          {auditors.map(a => (
                            <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={11} color="#94a3b8" style={{ position: "absolute", right: 8, top: 9, pointerEvents: "none" }} />
                      </div>
                    </td>

                    {/* Due Date */}
                    <td style={c}>
                      <input
                        type="date"
                        value={row.dueDate}
                        onChange={e => updateRow(origIdx, "dueDate", e.target.value)}
                        style={{ ...editInput, resize: "none" }}
                        onFocus={e => e.target.style.borderColor = "#6366f1"}
                        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                      />
                    </td>

                    {/* Priority */}
                    <td style={c}>
                      <div style={{ position: "relative" }}>
                        <select
                          value={row.priority}
                          onChange={e => updateRow(origIdx, "priority", e.target.value)}
                          style={{
                            ...editSelect,
                            fontWeight: 700,
                            color: PRIORITY_COLORS[row.priority]?.color || "#334155",
                          }}
                          onFocus={e => e.target.style.borderColor = "#6366f1"}
                          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                        >
                          {["Critical", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
                        </select>
                        <ChevronDown size={11} color="#94a3b8" style={{ position: "absolute", right: 8, top: 9, pointerEvents: "none" }} />
                      </div>
                      <div style={{ marginTop: 5 }}><PriorityBadge value={row.priority} /></div>
                    </td>

                    {/* Status */}
                    <td style={c}>
                      <div style={{ position: "relative" }}>
                        <select
                          value={row.taskStatus}
                          onChange={e => updateRow(origIdx, "taskStatus", e.target.value)}
                          style={editSelect}
                          onFocus={e => e.target.style.borderColor = "#6366f1"}
                          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                        >
                          {["To-Do", "In Progress", "Closed"].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={11} color="#94a3b8" style={{ position: "absolute", right: 8, top: 9, pointerEvents: "none" }} />
                      </div>
                      <div style={{ marginTop: 5 }}><StatusBadge value={row.taskStatus} /></div>
                    </td>

                    {/* Task status indicator */}
                    <td style={{ ...c, textAlign: "center", verticalAlign: "middle" }}>
                      {row._taskCreated ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <CheckCircle2 size={18} color="#22c55e" />
                          <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>Created</span>
                        </div>
                      ) : row._dirty ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <Zap size={15} color="#f59e0b" />
                          <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700 }}>Pending</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 10, color: "#cbd5e1" }}>—</span>
                      )}
                    </td>

                    {/* Create Task button */}
                    <td style={{ ...c, textAlign: "center", verticalAlign: "middle" }}>
                      {row._taskCreated ? (
                        <button
                          onClick={() => updateRow(origIdx, "_taskCreated", false)}
                          style={{
                            fontSize: 10, padding: "3px 9px", borderRadius: 6,
                            border: "1px solid #bbf7d0", background: "#f0fdf4",
                            color: "#166534", cursor: "pointer", fontWeight: 600,
                          }}
                        >
                          + Another
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCreateTask(origIdx)}
                          disabled={row._saving || !row.rootCause.trim()}
                          title={!row.rootCause.trim() ? "Add root cause first" : "Create CAP task"}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "6px 11px", borderRadius: 8, border: "none",
                            background: row.rootCause.trim()
                              ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
                              : "#e2e8f0",
                            color: row.rootCause.trim() ? "#fff" : "#94a3b8",
                            fontSize: 11, fontWeight: 700,
                            cursor: row.rootCause.trim() ? "pointer" : "not-allowed",
                            boxShadow: row.rootCause.trim() ? "0 2px 6px rgba(79,70,229,0.3)" : "none",
                            whiteSpace: "nowrap",
                            transition: "all 0.15s",
                          }}
                        >
                          {row._saving
                            ? <CircularProgress size={11} style={{ color: "#fff" }} />
                            : <ClipboardList size={11} />
                          }
                          {row._saving ? "Creating…" : "Add Task"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Bottom Status Bar ─────────────────────────────────────────────── */}
      <div style={{
        background: "#0f172a", borderTop: "1px solid #1e293b",
        padding: "8px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexShrink: 0, gap: 16,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: "Total Findings", count: rows.length,                                           color: "#f97316" },
            { label: "With Root Cause", count: rows.filter(r => r.rootCause.trim()).length,           color: "#6366f1" },
            { label: "Tasks Created",   count: createdCount,                                          color: "#22c55e" },
            { label: "Pending",         count: rows.filter(r => r._dirty && !r._taskCreated).length,  color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{s.label}:</span>
              <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700 }}>{s.count}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#475569" }}>
          Showing {displayedRows.length} of {rows.length} findings
          {priorityFilter !== "All" && (
            <span style={{ color: "#6366f1", fontWeight: 700 }}> · {priorityFilter} only</span>
          )}
        </div>
      </div>

      {/* Evidence Modal */}
      <Evidence_Modal
        open={evidenceModal.open}
        evidence={evidenceModal.data}
        onClose={() => setEvidenceModal({ open: false, data: [] })}
      />
    </div>
  );
}