// import React, { useState, useEffect, useMemo } from "react";
// import {
//   ChevronDown,
//   ChevronRight,
//   Plus,
//   Target,
//   MessageSquarePlus,
//   AlertTriangle,
//   FileText,
//   ArrowLeft,
//   Save,
//   CheckCircle2,
//   Clock,
//   XCircle,
//   Table2,
//   ClipboardList,
//   ShieldCheck,
// } from "lucide-react";
// import { Modal, ModalHeader, Spinner } from "../ui";
// import {
//   getSessionUser,
//   inputStyle,
//   selectStyle,
//   labelStyle,
//   btnPrimary,
// } from "../../utils/helpers";
// import { useControls } from "../../hooks/useControls";
// import auditService from "../../services/auditService";
// import gapService from "../../services/gapService";
// import taskService from "../../../taskManagement/services/taskService";
// import { captureActivity, ACTIONS } from "../../../../services/activities";
// import { useFramework } from "../../../../context/FrameworkContex";

// // ── Findings Badge ───────────────────────────────────────────────────────────
// const NC_STYLES = {
//   "Major NC": { bg: "#fef2f2", border: "#fecaca", color: "#991b1b", dot: "#ef4444" },
//   "Minor NC": { bg: "#fff7ed", border: "#fed7aa", color: "#92400e", dot: "#f97316" },
// };

// function FindingsBadge({ value }) {
//   const s = NC_STYLES[value] || { bg: "#f1f5f9", border: "#e2e8f0", color: "#475569", dot: "#94a3b8" };
//   return (
//     <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: s.bg, color: s.color, border: "1px solid " + s.border }}>
//       <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
//       {value}
//     </span>
//   );
// }

// const STATUS_STYLES = {
//   Open: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
//   "In Progress": { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
//   Closed: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
// };

// function StatusPill({ value }) {
//   const s = STATUS_STYLES[value] || STATUS_STYLES["Open"];
//   return (
//     <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: s.bg, color: s.color, border: "1px solid " + s.border }}>
//       {value || "Open"}
//     </span>
//   );
// }

// // ── Active filter banner — fully dynamic ─────────────────────────────────────
// function ActiveFilterBanner({ allowedFrameworks, isAllSelected, totalAudits, filteredCount }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "8px 14px", borderRadius: 10, marginBottom: 14, background: isAllSelected ? "#f0f4ff" : "#fffbeb", border: "1px solid " + (isAllSelected ? "#c7d2fe" : "#fcd34d"), fontSize: 12 }}>
//       <ShieldCheck size={13} color={isAllSelected ? "#4338ca" : "#b45309"} style={{ flexShrink: 0 }} />
//       <span style={{ fontWeight: 700, color: isAllSelected ? "#4338ca" : "#b45309" }}>Filter:</span>
//       {isAllSelected ? (
//         <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: "#e0e7ff", color: "#4338ca", border: "1px solid #c7d2fe" }}>
//           All Frameworks
//         </span>
//       ) : (
//         allowedFrameworks.map(fw => (
//           <span key={fw.code} style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: fw.color + "18", color: fw.color, border: `1px solid ${fw.color}55` }}>
//             {fw.label}
//           </span>
//         ))
//       )}
//       <span style={{ fontSize: 11, color: "#64748b", marginLeft: "auto" }}>
//         {filteredCount} of {totalAudits} audits
//       </span>
//     </div>
//   );
// }

// // ── Add Task Modal ───────────────────────────────────────────────────────────
// function AddTaskModal({ auditId, gap, auditors, onClose, onCreated }) {
//   const sessionUser = getSessionUser();
//   const rawUser = sessionStorage.getItem("user");
//   const user = rawUser ? JSON.parse(rawUser) : null;
//   const orgId = user?.organization?._id || user?.organization || "";
//   const changedBy = user?.name || user?.username || "System";
//   const reporterId = user?.id || user?._id || "";

//   const [form, setForm] = useState({
//     description: gap ? "CAP: " + (gap.question || "").slice(0, 80) : "",
//     assignee: "", assigneeId: "",
//     priority: gap?.priority || "Medium",
//     startDate: new Date().toISOString().split("T")[0],
//     endDate: gap?.dueDate || "",
//     status: "To-Do",
//   });
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   function handleSubmit() {
//     if (!form.description.trim()) { setError("Description is required."); return; }
//     setSaving(true); setError("");
//     const assignedAuditor = auditors.find(a => a.name === form.assignee);
//     const employeeId = form.assigneeId || assignedAuditor?.id || assignedAuditor?._id || null;
//     const employeeName = form.assignee || changedBy;
//     const payload = {
//       description: form.description.trim(),
//       employee: employeeName, employeeId: form.assignee ? employeeId : (reporterId || null),
//       employeeName, employeeEmail: assignedAuditor?.email || user?.email || "",
//       reporter: changedBy, reporterId: reporterId || null, reporterEmail: user?.email || "",
//       priority: form.priority, startDate: form.startDate, endDate: form.endDate || null,
//       status: form.status, auditId, organization: orgId,
//       department: user?.department?.[0] || user?.department || "",
//     };
//     taskService.saveTask(payload, changedBy)
//       .then(() => { setSaving(false); if (onCreated) onCreated(); onClose(); })
//       .catch(err => { setError(err.message || "Failed to create task."); setSaving(false); });
//   }

//   const overlayStyle = { position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center" };
//   const boxStyle = { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(0,0,0,0.3)", fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: "hidden" };
//   const field = { display: "flex", flexDirection: "column", gap: 5 };
//   const lbl = { fontSize: 12, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em" };
//   const inp = { padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#f8fafc", color: "#1e293b", boxSizing: "border-box", width: "100%" };
//   const sel = { ...inp, cursor: "pointer", appearance: "none" };

//   return (
//     <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
//       <div style={boxStyle}>
//         <div style={{ background: "linear-gradient(135deg, #1e293b, #312e81)", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <ClipboardList size={18} color="#818cf8" />
//             <div>
//               <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Create Corrective Action Task</div>
//               {gap && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{gap.clause} · <FindingsBadge value={gap.findings} /></div>}
//             </div>
//           </div>
//           <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
//         </div>
//         <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
//           <div style={field}>
//             <label style={lbl}>Description <span style={{ color: "#ef4444" }}>*</span></label>
//             <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the corrective action..." style={{ ...inp, resize: "vertical" }} />
//           </div>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
//             <div style={field}>
//               <label style={lbl}>Assign To</label>
//               <div style={{ position: "relative" }}>
//                 <select value={form.assignee} onChange={e => { const a = auditors.find(x => x.name === e.target.value); setForm(p => ({ ...p, assignee: e.target.value, assigneeId: a?.id || a?._id || "" })); }} style={sel}>
//                   <option value="">Self ({changedBy})</option>
//                   {auditors.map(a => <option key={a._id || a.id} value={a.name}>{a.name}</option>)}
//                 </select>
//                 <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: 9, top: 11, pointerEvents: "none" }} />
//               </div>
//             </div>
//             <div style={field}>
//               <label style={lbl}>Priority</label>
//               <div style={{ position: "relative" }}>
//                 <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={sel}>
//                   {["Critical", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
//                 </select>
//                 <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: 9, top: 11, pointerEvents: "none" }} />
//               </div>
//             </div>
//             <div style={field}>
//               <label style={lbl}>Start Date</label>
//               <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} style={inp} />
//             </div>
//             <div style={field}>
//               <label style={lbl}>Due Date</label>
//               <input type="date" value={form.endDate} min={form.startDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} style={inp} />
//             </div>
//           </div>
//           {error && <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#991b1b", fontWeight: 600 }}>{error}</div>}
//         </div>
//         <div style={{ padding: "14px 22px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 8, background: "#f8fafc" }}>
//           <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Cancel</button>
//           <button onClick={handleSubmit} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: saving ? "#94a3b8" : "#4f46e5", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
//             <ClipboardList size={13} />{saving ? "Creating..." : "Create Task"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── CAP Spreadsheet ──────────────────────────────────────────────────────────
// function CapSpreadsheet({ ncGaps, findings, auditors, auditId, onBack, onSaved }) {
//   const [rows, setRows] = useState(() =>
//     ncGaps.map(gap => {
//       const existingCap = gap.cap || {};
//       return { gapId: gap._id || gap.id, clause: gap.clause, question: gap.question, findings: gap.findings, docRemarks: gap.docRemarks || "", practiceRemarks: gap.practiceRemarks || "", totalScore: gap.totalScore, dueDate: existingCap.dueDate || "", rootCause: existingCap.rootCause || "", assignedTo: existingCap.assignedTo || "", priority: existingCap.priority || "Medium", status: existingCap.status || "Open", _dirty: false, _saved: !!(existingCap.rootCause || existingCap.assignedTo) };
//     })
//   );
//   const [saving, setSaving] = useState(false);
//   const [saveMsg, setSaveMsg] = useState("");
//   const [addTaskFor, setAddTaskFor] = useState(null);
//   const [taskCreatedFor, setTaskCreatedFor] = useState({});

//   function updateRow(idx, field, value) {
//     setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value, _dirty: true, _saved: false } : r));
//   }

//   function handleSaveAll() {
//     setSaving(true); setSaveMsg("");
//     const dirtyRows = rows.filter(r => r._dirty);
//     if (dirtyRows.length === 0) { setSaving(false); setSaveMsg("Nothing to save."); return; }
//     Promise.all(dirtyRows.map(row => gapService.updateEntry(row.gapId, { cap: { rootCause: row.rootCause, assignedTo: row.assignedTo, dueDate: row.dueDate, priority: row.priority, status: row.status } })))
//       .then(() => {
//         captureActivity({ action: ACTIONS.UPDATE, item: [{ detail: "Audit · Updated CAP items", auditId }], url: "/gap-assessment" });
//         setRows(prev => prev.map(r => r._dirty ? { ...r, _dirty: false, _saved: true } : r));
//         setSaveMsg("All CAPs saved successfully."); setSaving(false);
//         if (onSaved) onSaved();
//       })
//       .catch(err => { setSaveMsg("Save failed: " + (err.message || "error")); setSaving(false); });
//   }

//   const dirtyCount = rows.filter(r => r._dirty).length;
//   const cell = { padding: "12px 14px", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", verticalAlign: "top", fontSize: 12, color: "#334155", background: "#fff" };
//   const headerCell = { padding: "11px 14px", background: "#1e293b", color: "#e2e8f0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderRight: "1px solid #334155", borderBottom: "2px solid #0f172a", whiteSpace: "nowrap", position: "sticky", top: 0, zIndex: 2 };
//   const editInput = { width: "100%", fontSize: 12, padding: "5px 7px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc", color: "#1e293b", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" };
//   const editSelect = { ...editInput, appearance: "none", cursor: "pointer", paddingRight: 22 };

//   return (
//     <div style={{ position: "fixed", top: 60, left: 0, right: 0, bottom: 0, zIndex: 999, background: "#f1f5f9", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
//       <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "0 24px", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
//           <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "6px 10px", borderRadius: 8 }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
//             <ArrowLeft size={15} /> Back
//           </button>
//           <div style={{ width: 1, height: 22, background: "#334155" }} />
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <Table2 size={16} color="#6366f1" />
//             <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>Corrective Action Plan</span>
//             <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "#312e81", color: "#c7d2fe", border: "1px solid #4338ca" }}>{rows.length} findings</span>
//           </div>
//         </div>
//         {dirtyCount > 0 && <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>{dirtyCount} unsaved — save in footer ↓</span>}
//       </div>

//       <div style={{ flex: 1, overflow: "auto" }}>
//         <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1500, tableLayout: "fixed" }}>
//           <colgroup>
//             <col style={{ width: 44 }} /><col style={{ width: 80 }} /><col style={{ width: 110 }} />
//             <col style={{ width: 200 }} /><col style={{ width: 160 }} /><col style={{ width: 160 }} />
//             <col style={{ width: 55 }} /><col style={{ width: 240 }} /><col style={{ width: 140 }} />
//             <col style={{ width: 115 }} /><col style={{ width: 90 }} /><col style={{ width: 100 }} /><col style={{ width: 110 }} />
//           </colgroup>
//           <thead>
//             <tr>
//               {["#", "Clause", "Finding Type", "Requirement", "Doc Remarks", "Practice Remarks", "Score", "Root Cause Analysis (5Y)", "Assigned To", "Due Date", "Priority", "Status", "Task"].map(h => (
//                 <th key={h} style={headerCell}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row, idx) => {
//               const isMajor = row.findings === "Major NC";
//               const rowAccent = isMajor ? "#ef4444" : "#f97316";
//               const rowBg = row._dirty ? (isMajor ? "#fff8f8" : "#fffbf5") : row._saved ? "#f0fdf4" : "#fff";
//               const rowStyle = { ...cell, background: rowBg };
//               const hasTask = !!taskCreatedFor[row.gapId];
//               return (
//                 <tr key={row.gapId || idx} style={{ borderLeft: "4px solid " + rowAccent }}>
//                   <td style={{ ...rowStyle, textAlign: "center", fontWeight: 700, color: "#94a3b8", fontSize: 11 }}>
//                     {idx + 1}
//                     {row._saved && !row._dirty && <div style={{ marginTop: 4 }}><CheckCircle2 size={13} color="#22c55e" /></div>}
//                     {row._dirty && <div style={{ marginTop: 4 }}><Clock size={13} color="#f59e0b" /></div>}
//                   </td>
//                   <td style={rowStyle}><span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, background: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: 5, border: "1px solid #e2e8f0", display: "inline-block" }}>{row.clause}</span></td>
//                   <td style={rowStyle}><FindingsBadge value={row.findings} /></td>
//                   <td style={{ ...rowStyle, lineHeight: 1.5 }}><span style={{ fontSize: 12, color: "#1e293b", fontWeight: 500 }}>{row.question}</span></td>
//                   <td style={rowStyle}><p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: row.docRemarks ? "#334155" : "#94a3b8", fontStyle: row.docRemarks ? "normal" : "italic" }}>{row.docRemarks || "—"}</p></td>
//                   <td style={rowStyle}><p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: row.practiceRemarks ? "#334155" : "#94a3b8", fontStyle: row.practiceRemarks ? "normal" : "italic" }}>{row.practiceRemarks || "—"}</p></td>
//                   <td style={{ ...rowStyle, textAlign: "center" }}>
//                     {row.totalScore != null ? (
//                       <span style={{ fontSize: 13, fontWeight: 700, color: row.totalScore >= 3 ? "#16a34a" : row.totalScore >= 2 ? "#d97706" : "#dc2626" }}>
//                         {row.totalScore}<span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>/4</span>
//                       </span>
//                     ) : "—"}
//                   </td>
//                   <td style={rowStyle}><textarea rows={3} value={row.rootCause} onChange={e => updateRow(idx, "rootCause", e.target.value)} placeholder="Why? Why? Why? Why? Why?" style={editInput} /></td>
//                   <td style={rowStyle}>
//                     <div style={{ position: "relative" }}>
//                       <select value={row.assignedTo} onChange={e => updateRow(idx, "assignedTo", e.target.value)} style={editSelect}>
//                         <option value="">Select owner…</option>
//                         {auditors.map(a => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
//                       </select>
//                       <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: 7, top: 8, pointerEvents: "none" }} />
//                     </div>
//                   </td>
//                   <td style={rowStyle}><input type="date" value={row.dueDate} onChange={e => updateRow(idx, "dueDate", e.target.value)} style={{ ...editInput, resize: "none" }} /></td>
//                   <td style={rowStyle}>
//                     <div style={{ position: "relative" }}>
//                       <select value={row.priority} onChange={e => updateRow(idx, "priority", e.target.value)} style={{ ...editSelect, fontWeight: 700, color: row.priority === "High" ? "#dc2626" : row.priority === "Medium" ? "#d97706" : "#16a34a" }}>
//                         {["High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
//                       </select>
//                       <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: 7, top: 8, pointerEvents: "none" }} />
//                     </div>
//                   </td>
//                   <td style={rowStyle}>
//                     <div style={{ position: "relative" }}>
//                       <select value={row.status} onChange={e => updateRow(idx, "status", e.target.value)} style={editSelect}>
//                         {["Open", "In Progress", "Closed"].map(s => <option key={s}>{s}</option>)}
//                       </select>
//                       <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: 7, top: 8, pointerEvents: "none" }} />
//                     </div>
//                     <div style={{ marginTop: 5 }}><StatusPill value={row.status} /></div>
//                   </td>
//                   <td style={{ ...rowStyle, textAlign: "center", verticalAlign: "middle" }}>
//                     {hasTask ? (
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
//                         <CheckCircle2 size={16} color="#22c55e" />
//                         <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>Task created</span>
//                         <button onClick={() => setAddTaskFor(row)} style={{ marginTop: 2, fontSize: 10, padding: "2px 8px", borderRadius: 6, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", cursor: "pointer", fontWeight: 600 }}>+ Another</button>
//                       </div>
//                     ) : (
//                       <button onClick={() => setAddTaskFor(row)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, background: "#4f46e5", border: "none", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(79,70,229,0.3)" }} onMouseEnter={e => e.currentTarget.style.background = "#4338ca"} onMouseLeave={e => e.currentTarget.style.background = "#4f46e5"}>
//                         <ClipboardList size={11} /> Add Task
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//         {rows.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>No NC findings found for this audit.</div>}
//       </div>

//       <div style={{ background: "#1e293b", borderTop: "1px solid #334155", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 16 }}>
//         <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
//           {[
//             { label: "Major NC", count: rows.filter(r => r.findings === "Major NC").length, color: "#fca5a5" },
//             { label: "Minor NC", count: rows.filter(r => r.findings === "Minor NC").length, color: "#fdba74" },
//             { label: "Open", count: rows.filter(r => r.status === "Open").length, color: "#fca5a5" },
//             { label: "In Progress", count: rows.filter(r => r.status === "In Progress").length, color: "#93c5fd" },
//             { label: "Closed", count: rows.filter(r => r.status === "Closed").length, color: "#86efac" },
//             { label: "Tasks", count: Object.keys(taskCreatedFor).length, color: "#a5f3fc" },
//           ].map(s => (
//             <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
//               <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }} />
//               <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>{s.label}:</span>
//               <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{s.count}</span>
//             </div>
//           ))}
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
//           {saveMsg && <span style={{ fontSize: 12, fontWeight: 600, color: saveMsg.startsWith("Save failed") ? "#fca5a5" : "#86efac" }}>{saveMsg}</span>}
//           {dirtyCount > 0 && <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>{dirtyCount} unsaved</span>}
//           <button onClick={handleSaveAll} disabled={saving || dirtyCount === 0} style={{ display: "flex", alignItems: "center", gap: 6, background: dirtyCount > 0 ? "#4f46e5" : "#334155", color: dirtyCount > 0 ? "#fff" : "#64748b", border: "none", borderRadius: 8, cursor: dirtyCount > 0 ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, padding: "7px 16px" }}>
//             <Save size={14} />{saving ? "Saving…" : "Save All CAPs"}
//           </button>
//         </div>
//       </div>

//       {addTaskFor && (
//         <AddTaskModal
//           auditId={auditId} gap={addTaskFor} auditors={auditors}
//           onClose={() => setAddTaskFor(null)}
//           onCreated={() => setTaskCreatedFor(prev => { const next = { ...prev }; next[addTaskFor.gapId] = true; return next; })}
//         />
//       )}
//     </div>
//   );
// }

// // ── Review Findings Modal ────────────────────────────────────────────────────
// export function ReviewFindingsModal(props) {
//   const { onClose, auditors = [], initialAuditId } = props;
//   const sessionUser = getSessionUser();
//   const userName = sessionUser.id || "";

//   useEffect(() => {
//     captureActivity({ action: ACTIONS.CLICK, item: [{ detail: "Audit · Viewed 'Review Findings' list" }], url: "/gap-assessment" });
//   }, []);

//   // ── Framework context — dynamic ───────────────────────────────────────────
//   const { selectedFrameworks, isAllSelected, availableFrameworks } = useFramework();

//   const allowedFrameworks = useMemo(() => {
//     if (isAllSelected) return availableFrameworks;
//     return selectedFrameworks.map(label => availableFrameworks.find(fw => fw.id === label)).filter(Boolean);
//   }, [selectedFrameworks, isAllSelected, availableFrameworks]);

//   const allowedCodes = useMemo(() => allowedFrameworks.map(fw => fw.code), [allowedFrameworks]);

//   const [audits, setAudits] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selected, setSelected] = useState(null);
//   const [showCap, setShowCap] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [findings, setFindings] = useState([]);
//   const [newFinding, setNewFinding] = useState(null);
//   const [ncGaps, setNcGaps] = useState([]);
//   const [ncLoading, setNcLoading] = useState(false);

//   useEffect(() => {
//     if (selected) {
//       captureActivity({ action: ACTIONS.CLICK, item: [{ detail: "Audit · Started findings review session", auditId: selected.id, framework: selected.frameworkCode }], url: "/gap-assessment" });
//     }
//   }, [selected?.id]);

//   useEffect(() => {
//     if (showCap) captureActivity({ action: ACTIONS.CLICK, item: [{ detail: "Audit · Opened CAP Management spreadsheet" }], url: "/gap-assessment" });
//   }, [showCap]);

//   const ctrlResult = useControls(selected ? selected.frameworkCode : null);
//   const apiControls = ctrlResult.controls;

//   const myControls = selected ? (selected.controls || []).filter(c => c.assignedTo === userName) : [];

//   useEffect(() => {
//     auditService.getAudits()
//       .then(data => {
//         const mine = (data || []).filter(a => (a.controls || []).some(c => c.assignedTo === userName));
//         setAudits(mine);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, [userName]);


//   useEffect(() => {
//     if (!selected) return;

//     let cancelled = false;
//     const fetchGaps = (attempt = 1) => {
//       // Only set loading true on the very first attempt of this effect run —
//       // NOT on the retry — so ncLoading stays true continuously through both
//       // attempts instead of briefly flipping false between them (which is
//       // what let Step 2 below catch a false "empty and done" state).
//       if (attempt === 1) setNcLoading(true);
//       gapService.getGaps()
//         .then(allGaps => {
//           if (cancelled) return;
//           const nc = (allGaps || []).filter(g => String(g.auditId) === String(selected.id) && (g.findings === "Major NC" || g.findings === "Minor NC"));

//           if (nc.length === 0 && attempt === 1 && initialAuditId) {
//             setTimeout(() => { if (!cancelled) fetchGaps(2); }, 1500);
//             return; // stay in loading state — do NOT setNcLoading(false) here
//           }

//           setNcGaps(nc);
//           setNcLoading(false);
//         })
//         .catch(() => { if (!cancelled) setNcLoading(false); });
//     };

//     setNcGaps([]);
//     fetchGaps();

//     return () => { cancelled = true; };
//   }, [selected, initialAuditId]);

//   // ── One-time flag: ensures the trace-to-source auto-open logic below
//   // runs exactly once per visit. Without this, re-checking showCap/selected
//   // on every render would silently reopen the CAP view every time the user
//   // clicks "Back" — since the conditions that triggered it the first time
//   // are all still true.
//   const autoOpenHandled = React.useRef(false);

//   // ── Step 1: once the audits list has loaded, select the audit that
//   // matches initialAuditId (from Task Management's trace-to-source nav).
//   useEffect(() => {
//     if (!initialAuditId || autoOpenHandled.current) return;
//     if (audits.length === 0) return;
//     const match = audits.find((a) => String(a.id) === String(initialAuditId));
//     if (match) {
//       selectAudit(match);
//     } else {
//       // Audit list loaded but no match found (e.g. not assigned to this
//       // user) — stop trying so this doesn't keep re-checking forever.
//       autoOpenHandled.current = true;
//     }
//   }, [initialAuditId, audits]); // eslint-disable-line react-hooks/exhaustive-deps

//   // ── Step 2: once that audit's NC gaps have finished loading, decide
//   // whether to auto-open the CAP view — then mark as handled so this
//   // NEVER fires again, even if the user navigates back afterward.
//   useEffect(() => {
//     if (!initialAuditId || autoOpenHandled.current) return;
//     if (!selected) return;
//     if (ncLoading) return; // still fetching (including mid-retry) — wait
//     // At this point ncLoading is false, meaning fetchGaps has fully settled
//     // (either succeeded on attempt 1, or completed attempt 2's retry).
//     autoOpenHandled.current = true;
//     if (ncGaps.length > 0) {
//       setShowCap(true);
//     }
//   }, [initialAuditId, selected, ncLoading, ncGaps]);



//   // Filter audits by allowed framework codes
//   const filteredAudits = useMemo(() => {
//     return audits.filter(a => allowedCodes.includes(a.frameworkCode));
//   }, [audits, allowedCodes]);

//   function selectAudit(audit) { setSelected(audit); setFindings(audit.findings || []); }
//   function resetToList() { setSelected(null); setShowCap(false); setNewFinding(null); setNcGaps([]); setError(""); }

//   function submitNewFinding() {
//     if (!newFinding || !newFinding.control || !newFinding.severity || !newFinding.description) return;
//     setSaving(true);
//     auditService.addFinding(selected.id, newFinding)
//       .then(updatedAudit => {
//         captureActivity({ action: ACTIONS.CREATE, item: [{ detail: "Audit · Added finding", auditId: selected.id, control: newFinding.control, severity: newFinding.severity }], url: "/gap-assessment" });
//         setFindings(updatedAudit.findings || []); setNewFinding(null); setSaving(false);
//       })
//       .catch(err => { setError(err.message); setSaving(false); });
//   }

//   function statusBadge(s) {
//     if (!s) return { bg: "#f1f5f9", color: "#475569" };
//     const u = s.toUpperCase();
//     if (u === "COMPLETED") return { bg: "#d1fae5", color: "#065f46" };
//     if (u === "IN_PROGRESS" || u === "IN PROGRESS") return { bg: "#dbeafe", color: "#1e40af" };
//     if (u === "PLANNED") return { bg: "#fef3c7", color: "#92400e" };
//     return { bg: "#f1f5f9", color: "#475569" };
//   }
//   function displayStatus(s) {
//     if (!s) return "";
//     return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace("_", " ");
//   }

//   // Look up fw meta from context (no hardcoded CODE_META needed)
//   function getFwMeta(code) {
//     const fw = availableFrameworks.find(f => f.code === code);
//     return fw ? { label: fw.label, color: fw.color, bg: fw.color + "18", border: fw.color + "55" } : { label: code, color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };
//   }

//   if (showCap && selected) {
//     return (
//       <CapSpreadsheet
//         ncGaps={ncGaps} findings={findings} auditors={auditors} auditId={selected.id}
//         onBack={() => setShowCap(false)}
//         onSaved={() => { auditService.getAudits().then(data => { const fresh = (data || []).find(a => a.id === selected.id); if (fresh) setFindings(fresh.findings || []); }).catch(() => { }); }}
//       />
//     );
//   }

//   return (
//     <Modal onClose={onClose} wide={true}>
//       <ModalHeader
//         title="Review Findings"
//         subtitle={selected ? selected.auditType + " — " + getFwMeta(selected.frameworkCode).label : "Select an audit"}
//         onClose={onClose}
//       />
//       <div style={{ padding: "16px 28px 24px", maxHeight: "72vh", overflowY: "auto" }}>
//         {loading && <Spinner />}

//         {!selected && !loading && (
//           <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//             <ActiveFilterBanner allowedFrameworks={allowedFrameworks} isAllSelected={isAllSelected} totalAudits={audits.length} filteredCount={filteredAudits.length} />

//             {filteredAudits.map(audit => {
//               const badge = statusBadge(audit.status);
//               const fwMeta = getFwMeta(audit.frameworkCode);
//               const myCount = (audit.controls || []).filter(c => c.assignedTo === userName).length;
//               return (
//                 <button key={audit.id} onClick={() => selectAudit(audit)} style={{ textAlign: "left", border: "1px solid #f1f5f9", borderRadius: 14, padding: 16, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                   <div>
//                     <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
//                       <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: badge.bg, color: badge.color }}>{displayStatus(audit.status)}</span>
//                       <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: fwMeta.bg, color: fwMeta.color, border: "1px solid " + fwMeta.border }}>{fwMeta.label}</span>
//                     </div>
//                     <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{audit.auditType} — {fwMeta.label}</p>
//                     <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>{myCount} control{myCount !== 1 ? "s" : ""} assigned to you</p>
//                   </div>
//                   <ChevronRight size={18} color="#cbd5e1" />
//                 </button>
//               );
//             })}

//             {filteredAudits.length === 0 && (
//               <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 20 }}>
//                 {audits.length > 0 ? "No audits match the current framework filter." : "No audits assigned to you."}
//               </p>
//             )}
//           </div>
//         )}

//         {selected && (
//           <div>
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
//               <button onClick={resetToList} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontSize: 13, fontWeight: 600, padding: 0 }}>← Back</button>
//               <div style={{ display: "flex", gap: 8 }}>
//                 <button onClick={() => setNewFinding({ control: "", severity: "Medium", description: "", controlId: "" })} style={{ ...btnPrimary, background: "#7c3aed", fontSize: 12, padding: "7px 14px", display: "flex", alignItems: "center", gap: 6 }}>
//                   <Plus size={13} /> Add Finding
//                 </button>
//                 <button onClick={() => setShowCap(true)} disabled={ncLoading || ncGaps.length === 0} style={{ ...btnPrimary, background: ncGaps.length > 0 ? "#4f46e5" : "#94a3b8", cursor: ncGaps.length > 0 ? "pointer" : "not-allowed", fontSize: 12, padding: "7px 14px", display: "flex", alignItems: "center", gap: 6 }}>
//                   <Target size={13} /> Create CAP
//                   {ncGaps.length > 0 && <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{ncGaps.length}</span>}
//                 </button>
//               </div>
//             </div>

//             <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#1d4ed8", fontWeight: 600 }}>
//               Your assigned controls ({myControls.length}):{" "}
//               {myControls.map(c => { const meta = (apiControls || []).find(ac => ac.controlId === c.controlId) || {}; return meta.clause || c.controlId; }).join(", ")}
//             </div>

//             <div style={{ marginBottom: 8 }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
//                 <AlertTriangle size={15} color="#dc2626" />
//                 <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Non-Conformities</span>
//                 {!ncLoading && (
//                   <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 9px", borderRadius: 20, background: ncGaps.length > 0 ? "#fef2f2" : "#f1f5f9", color: ncGaps.length > 0 ? "#991b1b" : "#64748b", border: "1px solid " + (ncGaps.length > 0 ? "#fecaca" : "#e2e8f0") }}>
//                     {ncGaps.length} found
//                   </span>
//                 )}
//               </div>
//               {ncLoading && <Spinner />}
//               {!ncLoading && ncGaps.length === 0 && (
//                 <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13, border: "1px dashed #e2e8f0", borderRadius: 12, marginBottom: 16 }}>
//                   No Major NC or Minor NC findings recorded for this audit yet.
//                 </div>
//               )}
//               {!ncLoading && ncGaps.length > 0 && (
//                 <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
//                   {ncGaps.map((gap, idx) => {
//                     const isMajor = gap.findings === "Major NC";
//                     const hasCap = !!(gap.cap && (gap.cap.rootCause || gap.cap.assignedTo));
//                     return (
//                       <div key={gap._id || gap.id || idx} style={{ border: "1px solid " + (isMajor ? "#fecaca" : "#fed7aa"), borderLeft: "4px solid " + (isMajor ? "#ef4444" : "#f97316"), borderRadius: 12, padding: "14px 16px", background: isMajor ? "#fff5f5" : "#fffbf5" }}>
//                         <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10, alignItems: "center" }}>
//                           <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, background: "#f1f5f9", color: "#334155", padding: "2px 9px", borderRadius: 6, border: "1px solid #e2e8f0" }}>{gap.clause}</span>
//                           <FindingsBadge value={gap.findings} />
//                           {gap.totalScore != null && <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginLeft: "auto" }}>Score: {gap.totalScore} / 4</span>}
//                           {hasCap && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "#ede9fe", color: "#6d28d9" }}>✓ CAP attached</span>}
//                         </div>
//                         <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#1e293b", lineHeight: 1.5 }}>{gap.question}</p>
//                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//                           {[{ label: "Doc Remarks", val: gap.docRemarks, color: "#6366f1" }, { label: "Practice Remarks", val: gap.practiceRemarks, color: "#10b981" }].map(rm => (
//                             <div key={rm.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px" }}>
//                               <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
//                                 <FileText size={11} color={rm.color} />
//                                 <span style={{ fontSize: 10, fontWeight: 700, color: rm.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{rm.label}</span>
//                               </div>
//                               <p style={{ margin: 0, fontSize: 12, color: rm.val ? "#334155" : "#94a3b8", fontStyle: rm.val ? "normal" : "italic", lineHeight: 1.5 }}>{rm.val || "No remarks recorded"}</p>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//             {newFinding && (
//               <div style={{ border: "2px solid #ddd6fe", borderRadius: 14, padding: 20, marginTop: 16, background: "rgba(237,233,254,0.35)", display: "flex", flexDirection: "column", gap: 12 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                   <Plus size={15} color="#7c3aed" />
//                   <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#5b21b6" }}>New Finding</h4>
//                 </div>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//                   <div>
//                     <label style={labelStyle}>Control Clause</label>
//                     <div style={{ position: "relative" }}>
//                       <select value={newFinding.control} onChange={e => { const s = (apiControls || []).find(c => c.clause === e.target.value) || {}; setNewFinding(p => ({ ...p, control: e.target.value, controlId: s.controlId || e.target.value })); }} style={selectStyle}>
//                         <option value="">Select control...</option>
//                         {myControls.map(c => { const meta = (apiControls || []).find(ac => ac.controlId === c.controlId) || {}; return <option key={c.controlId} value={meta.clause || c.controlId}>{meta.clause || c.controlId}{meta.label ? " — " + meta.label : ""}</option>; })}
//                       </select>
//                       <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: 8, top: 11, pointerEvents: "none" }} />
//                     </div>
//                   </div>
//                   <div>
//                     <label style={labelStyle}>Severity</label>
//                     <div style={{ position: "relative" }}>
//                       <select value={newFinding.severity} onChange={e => setNewFinding(p => ({ ...p, severity: e.target.value }))} style={selectStyle}>
//                         {["High", "Medium", "Low"].map(s => <option key={s}>{s}</option>)}
//                       </select>
//                       <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: 8, top: 11, pointerEvents: "none" }} />
//                     </div>
//                   </div>
//                   <div style={{ gridColumn: "1 / -1" }}>
//                     <label style={labelStyle}>Description</label>
//                     <textarea rows={3} value={newFinding.description} onChange={e => setNewFinding(p => ({ ...p, description: e.target.value }))} placeholder="Describe the finding..." style={{ ...inputStyle, resize: "none" }} />
//                   </div>
//                 </div>
//                 <div style={{ display: "flex", gap: 8 }}>
//                   <button onClick={submitNewFinding} disabled={saving} style={{ ...btnPrimary, background: saving ? "#94a3b8" : "#7c3aed" }}>{saving ? "Saving..." : "Add Finding"}</button>
//                   <button onClick={() => setNewFinding(null)} style={{ padding: "10px 18px", borderRadius: 12, background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>Cancel</button>
//                 </div>
//               </div>
//             )}

//             {error && <div style={{ marginTop: 10, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#991b1b" }}>{error}</div>}
//           </div>
//         )}
//       </div>
//     </Modal>
//   );
// }

// export default ReviewFindingsModal;


import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Target,
  MessageSquarePlus,
  AlertTriangle,
  FileText,
  ArrowLeft,
  Save,
  CheckCircle2,
  Clock,
  XCircle,
  Table2,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { Modal, ModalHeader, Spinner } from "../ui";
import {
  getSessionUser,
  inputStyle,
  selectStyle,
  labelStyle,
  btnPrimary,
} from "../../utils/helpers";
import { useControls } from "../../hooks/useControls";
import auditService from "../../services/auditService";
import gapService from "../../services/gapService";
import taskService from "../../../taskManagement/services/taskService";
import { captureActivity, ACTIONS } from "../../../../services/activities";
import { useFramework } from "../../../../context/FrameworkContex";

// ── Findings Badge ───────────────────────────────────────────────────────────
const NC_STYLES = {
  "Major NC": { bg: "#fef2f2", border: "#fecaca", color: "#991b1b", dot: "#ef4444" },
  "Minor NC": { bg: "#fff7ed", border: "#fed7aa", color: "#92400e", dot: "#f97316" },
};

function FindingsBadge({ value }) {
  const s = NC_STYLES[value] || { bg: "#f1f5f9", border: "#e2e8f0", color: "#475569", dot: "#94a3b8" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: s.bg, color: s.color, border: "1px solid " + s.border }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {value}
    </span>
  );
}

const STATUS_STYLES = {
  Open: { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
  "In Progress": { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  Closed: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
};

function StatusPill({ value }) {
  const s = STATUS_STYLES[value] || STATUS_STYLES["Open"];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: s.bg, color: s.color, border: "1px solid " + s.border }}>
      {value || "Open"}
    </span>
  );
}

// ── Active filter banner — fully dynamic ─────────────────────────────────────
function ActiveFilterBanner({ allowedFrameworks, isAllSelected, totalAudits, filteredCount }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "8px 14px", borderRadius: 10, marginBottom: 14, background: isAllSelected ? "#f0f4ff" : "#fffbeb", border: "1px solid " + (isAllSelected ? "#c7d2fe" : "#fcd34d"), fontSize: 12 }}>
      <ShieldCheck size={13} color={isAllSelected ? "#4338ca" : "#b45309"} style={{ flexShrink: 0 }} />
      <span style={{ fontWeight: 700, color: isAllSelected ? "#4338ca" : "#b45309" }}>Filter:</span>
      {isAllSelected ? (
        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: "#e0e7ff", color: "#4338ca", border: "1px solid #c7d2fe" }}>
          All Frameworks
        </span>
      ) : (
        allowedFrameworks.map(fw => (
          <span key={fw.code} style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: fw.color + "18", color: fw.color, border: `1px solid ${fw.color}55` }}>
            {fw.label}
          </span>
        ))
      )}
      <span style={{ fontSize: 11, color: "#64748b", marginLeft: "auto" }}>
        {filteredCount} of {totalAudits} audits
      </span>
    </div>
  );
}

// ── Add Task Modal ───────────────────────────────────────────────────────────
function AddTaskModal({ auditId, gap, auditors, onClose, onCreated }) {
  const sessionUser = getSessionUser();
  const rawUser = sessionStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const orgId = user?.organization?._id || user?.organization || "";
  const changedBy = user?.name || user?.username || "System";
  const reporterId = user?.id || user?._id || "";

  const [form, setForm] = useState({
    description: gap ? "CAP: " + (gap.question || "").slice(0, 80) : "",
    assignee: "", assigneeId: "",
    priority: gap?.priority || "Medium",
    startDate: new Date().toISOString().split("T")[0],
    endDate: gap?.dueDate || "",
    status: "To-Do",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!form.description.trim()) { setError("Description is required."); return; }
    setSaving(true); setError("");
    const assignedAuditor = auditors.find(a => a.name === form.assignee);
    const employeeId = form.assigneeId || assignedAuditor?.id || assignedAuditor?._id || null;
    const employeeName = form.assignee || changedBy;
    const payload = {
      description: form.description.trim(),
      employee: employeeName, employeeId: form.assignee ? employeeId : (reporterId || null),
      employeeName, employeeEmail: assignedAuditor?.email || user?.email || "",
      reporter: changedBy, reporterId: reporterId || null, reporterEmail: user?.email || "",
      priority: form.priority, startDate: form.startDate, endDate: form.endDate || null,
      status: form.status, auditId, organization: orgId,
      department: user?.department?.[0] || user?.department || "",
    };
    taskService.saveTask(payload, changedBy)
      .then(() => { setSaving(false); if (onCreated) onCreated(); onClose(); })
      .catch(err => { setError(err.message || "Failed to create task."); setSaving(false); });
  }

  const overlayStyle = { position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center" };
  const boxStyle = { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(0,0,0,0.3)", fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: "hidden" };
  const field = { display: "flex", flexDirection: "column", gap: 5 };
  const lbl = { fontSize: 12, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.04em" };
  const inp = { padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#f8fafc", color: "#1e293b", boxSizing: "border-box", width: "100%" };
  const sel = { ...inp, cursor: "pointer", appearance: "none" };

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={boxStyle}>
        <div style={{ background: "linear-gradient(135deg, #1e293b, #312e81)", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ClipboardList size={18} color="#818cf8" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Create Corrective Action Task</div>
              {gap && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{gap.clause} · <FindingsBadge value={gap.findings} /></div>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={field}>
            <label style={lbl}>Description <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the corrective action..." style={{ ...inp, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={field}>
              <label style={lbl}>Assign To</label>
              <div style={{ position: "relative" }}>
                <select value={form.assignee} onChange={e => { const a = auditors.find(x => x.name === e.target.value); setForm(p => ({ ...p, assignee: e.target.value, assigneeId: a?.id || a?._id || "" })); }} style={sel}>
                  <option value="">Self ({changedBy})</option>
                  {auditors.map(a => <option key={a._id || a.id} value={a.name}>{a.name}</option>)}
                </select>
                <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: 9, top: 11, pointerEvents: "none" }} />
              </div>
            </div>
            <div style={field}>
              <label style={lbl}>Priority</label>
              <div style={{ position: "relative" }}>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={sel}>
                  {["Critical", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
                </select>
                <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: 9, top: 11, pointerEvents: "none" }} />
              </div>
            </div>
            <div style={field}>
              <label style={lbl}>Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} style={inp} />
            </div>
            <div style={field}>
              <label style={lbl}>Due Date</label>
              <input type="date" value={form.endDate} min={form.startDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} style={inp} />
            </div>
          </div>
          {error && <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#991b1b", fontWeight: 600 }}>{error}</div>}
        </div>
        <div style={{ padding: "14px 22px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 8, background: "#f8fafc" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: saving ? "#94a3b8" : "#4f46e5", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <ClipboardList size={13} />{saving ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CAP Spreadsheet ──────────────────────────────────────────────────────────
function CapSpreadsheet({ ncGaps, findings, auditors, auditId, onBack, onSaved }) {
  const [rows, setRows] = useState(() =>
    ncGaps.map(gap => {
      const existingCap = gap.cap || {};
      return { gapId: gap._id || gap.id, clause: gap.clause, question: gap.question, findings: gap.findings, docRemarks: gap.docRemarks || "", practiceRemarks: gap.practiceRemarks || "", totalScore: gap.totalScore, dueDate: existingCap.dueDate || "", rootCause: existingCap.rootCause || "", assignedTo: existingCap.assignedTo || "", priority: existingCap.priority || "Medium", status: existingCap.status || "Open", _dirty: false, _saved: !!(existingCap.rootCause || existingCap.assignedTo) };
    })
  );
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [addTaskFor, setAddTaskFor] = useState(null);
  const [taskCreatedFor, setTaskCreatedFor] = useState({});

  function updateRow(idx, field, value) {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value, _dirty: true, _saved: false } : r));
  }

  function handleSaveAll() {
    setSaving(true); setSaveMsg("");
    const dirtyRows = rows.filter(r => r._dirty);
    if (dirtyRows.length === 0) { setSaving(false); setSaveMsg("Nothing to save."); return; }
    Promise.all(dirtyRows.map(row => gapService.updateEntry(row.gapId, { cap: { rootCause: row.rootCause, assignedTo: row.assignedTo, dueDate: row.dueDate, priority: row.priority, status: row.status } })))
      .then(() => {
        captureActivity({ action: ACTIONS.UPDATE, item: [{ detail: "Audit · Updated CAP items", auditId }], url: "/gap-assessment" });
        setRows(prev => prev.map(r => r._dirty ? { ...r, _dirty: false, _saved: true } : r));
        setSaveMsg("All CAPs saved successfully."); setSaving(false);
        if (onSaved) onSaved();
      })
      .catch(err => { setSaveMsg("Save failed: " + (err.message || "error")); setSaving(false); });
  }

  const dirtyCount = rows.filter(r => r._dirty).length;
  const cell = { padding: "12px 14px", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", verticalAlign: "top", fontSize: 12, color: "#334155", background: "#fff" };
  const headerCell = { padding: "11px 14px", background: "#1e293b", color: "#e2e8f0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderRight: "1px solid #334155", borderBottom: "2px solid #0f172a", whiteSpace: "nowrap", position: "sticky", top: 0, zIndex: 2 };
  const editInput = { width: "100%", fontSize: 12, padding: "5px 7px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc", color: "#1e293b", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" };
  const editSelect = { ...editInput, appearance: "none", cursor: "pointer", paddingRight: 22 };

  return (
    <div style={{ position: "fixed", top: 60, left: 0, right: 0, bottom: 0, zIndex: 999, background: "#f1f5f9", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "0 24px", height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "6px 10px", borderRadius: 8 }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ width: 1, height: 22, background: "#334155" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Table2 size={16} color="#6366f1" />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>Corrective Action Plan</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "#312e81", color: "#c7d2fe", border: "1px solid #4338ca" }}>{rows.length} findings</span>
          </div>
        </div>
        {dirtyCount > 0 && <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>{dirtyCount} unsaved — save in footer ↓</span>}
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1500, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 44 }} /><col style={{ width: 80 }} /><col style={{ width: 110 }} />
            <col style={{ width: 200 }} /><col style={{ width: 160 }} /><col style={{ width: 160 }} />
            <col style={{ width: 55 }} /><col style={{ width: 240 }} /><col style={{ width: 140 }} />
            <col style={{ width: 115 }} /><col style={{ width: 90 }} /><col style={{ width: 100 }} /><col style={{ width: 110 }} />
          </colgroup>
          <thead>
            <tr>
              {["#", "Clause", "Finding Type", "Requirement", "Doc Remarks", "Practice Remarks", "Score", "Root Cause Analysis (5Y)", "Assigned To", "Due Date", "Priority", "Status", "Task"].map(h => (
                <th key={h} style={headerCell}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isMajor = row.findings === "Major NC";
              const rowAccent = isMajor ? "#ef4444" : "#f97316";
              const rowBg = row._dirty ? (isMajor ? "#fff8f8" : "#fffbf5") : row._saved ? "#f0fdf4" : "#fff";
              const rowStyle = { ...cell, background: rowBg };
              const hasTask = !!taskCreatedFor[row.gapId];
              return (
                <tr key={row.gapId || idx} style={{ borderLeft: "4px solid " + rowAccent }}>
                  <td style={{ ...rowStyle, textAlign: "center", fontWeight: 700, color: "#94a3b8", fontSize: 11 }}>
                    {idx + 1}
                    {row._saved && !row._dirty && <div style={{ marginTop: 4 }}><CheckCircle2 size={13} color="#22c55e" /></div>}
                    {row._dirty && <div style={{ marginTop: 4 }}><Clock size={13} color="#f59e0b" /></div>}
                  </td>
                  <td style={rowStyle}><span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, background: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: 5, border: "1px solid #e2e8f0", display: "inline-block" }}>{row.clause}</span></td>
                  <td style={rowStyle}><FindingsBadge value={row.findings} /></td>
                  <td style={{ ...rowStyle, lineHeight: 1.5 }}><span style={{ fontSize: 12, color: "#1e293b", fontWeight: 500 }}>{row.question}</span></td>
                  <td style={rowStyle}><p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: row.docRemarks ? "#334155" : "#94a3b8", fontStyle: row.docRemarks ? "normal" : "italic" }}>{row.docRemarks || "—"}</p></td>
                  <td style={rowStyle}><p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: row.practiceRemarks ? "#334155" : "#94a3b8", fontStyle: row.practiceRemarks ? "normal" : "italic" }}>{row.practiceRemarks || "—"}</p></td>
                  <td style={{ ...rowStyle, textAlign: "center" }}>
                    {row.totalScore != null ? (
                      <span style={{ fontSize: 13, fontWeight: 700, color: row.totalScore >= 3 ? "#16a34a" : row.totalScore >= 2 ? "#d97706" : "#dc2626" }}>
                        {row.totalScore}<span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>/4</span>
                      </span>
                    ) : "—"}
                  </td>
                  <td style={rowStyle}><textarea rows={3} value={row.rootCause} onChange={e => updateRow(idx, "rootCause", e.target.value)} placeholder="Why? Why? Why? Why? Why?" style={editInput} /></td>
                  <td style={rowStyle}>
                    <div style={{ position: "relative" }}>
                      <select value={row.assignedTo} onChange={e => updateRow(idx, "assignedTo", e.target.value)} style={editSelect}>
                        <option value="">Select owner…</option>
                        {auditors.map(a => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
                      </select>
                      <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: 7, top: 8, pointerEvents: "none" }} />
                    </div>
                  </td>
                  <td style={rowStyle}><input type="date" value={row.dueDate} onChange={e => updateRow(idx, "dueDate", e.target.value)} style={{ ...editInput, resize: "none" }} /></td>
                  <td style={rowStyle}>
                    <div style={{ position: "relative" }}>
                      <select value={row.priority} onChange={e => updateRow(idx, "priority", e.target.value)} style={{ ...editSelect, fontWeight: 700, color: row.priority === "High" ? "#dc2626" : row.priority === "Medium" ? "#d97706" : "#16a34a" }}>
                        {["High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
                      </select>
                      <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: 7, top: 8, pointerEvents: "none" }} />
                    </div>
                  </td>
                  <td style={rowStyle}>
                    <div style={{ position: "relative" }}>
                      <select value={row.status} onChange={e => updateRow(idx, "status", e.target.value)} style={editSelect}>
                        {["Open", "In Progress", "Closed"].map(s => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: 7, top: 8, pointerEvents: "none" }} />
                    </div>
                    <div style={{ marginTop: 5 }}><StatusPill value={row.status} /></div>
                  </td>
                  <td style={{ ...rowStyle, textAlign: "center", verticalAlign: "middle" }}>
                    {hasTask ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={16} color="#22c55e" />
                        <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>Task created</span>
                        <button onClick={() => setAddTaskFor(row)} style={{ marginTop: 2, fontSize: 10, padding: "2px 8px", borderRadius: 6, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", cursor: "pointer", fontWeight: 600 }}>+ Another</button>
                      </div>
                    ) : (
                      <button onClick={() => setAddTaskFor(row)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, background: "#4f46e5", border: "none", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(79,70,229,0.3)" }} onMouseEnter={e => e.currentTarget.style.background = "#4338ca"} onMouseLeave={e => e.currentTarget.style.background = "#4f46e5"}>
                        <ClipboardList size={11} /> Add Task
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>No NC findings found for this audit.</div>}
      </div>

      <div style={{ background: "#1e293b", borderTop: "1px solid #334155", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 16 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: "Major NC", count: rows.filter(r => r.findings === "Major NC").length, color: "#fca5a5" },
            { label: "Minor NC", count: rows.filter(r => r.findings === "Minor NC").length, color: "#fdba74" },
            { label: "Open", count: rows.filter(r => r.status === "Open").length, color: "#fca5a5" },
            { label: "In Progress", count: rows.filter(r => r.status === "In Progress").length, color: "#93c5fd" },
            { label: "Closed", count: rows.filter(r => r.status === "Closed").length, color: "#86efac" },
            { label: "Tasks", count: Object.keys(taskCreatedFor).length, color: "#a5f3fc" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>{s.label}:</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{s.count}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {saveMsg && <span style={{ fontSize: 12, fontWeight: 600, color: saveMsg.startsWith("Save failed") ? "#fca5a5" : "#86efac" }}>{saveMsg}</span>}
          {dirtyCount > 0 && <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>{dirtyCount} unsaved</span>}
          <button onClick={handleSaveAll} disabled={saving || dirtyCount === 0} style={{ display: "flex", alignItems: "center", gap: 6, background: dirtyCount > 0 ? "#4f46e5" : "#334155", color: dirtyCount > 0 ? "#fff" : "#64748b", border: "none", borderRadius: 8, cursor: dirtyCount > 0 ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, padding: "7px 16px" }}>
            <Save size={14} />{saving ? "Saving…" : "Save All CAPs"}
          </button>
        </div>
      </div>

      {addTaskFor && (
        <AddTaskModal
          auditId={auditId} gap={addTaskFor} auditors={auditors}
          onClose={() => setAddTaskFor(null)}
          onCreated={() => setTaskCreatedFor(prev => { const next = { ...prev }; next[addTaskFor.gapId] = true; return next; })}
        />
      )}
    </div>
  );
}

// ── Review Findings Modal ────────────────────────────────────────────────────
export function ReviewFindingsModal(props) {
  const { onClose, auditors = [], initialAuditId } = props;
  const sessionUser = getSessionUser();
  const userName = sessionUser.id || "";

  useEffect(() => {
    captureActivity({ action: ACTIONS.CLICK, item: [{ detail: "Audit · Viewed 'Review Findings' list" }], url: "/gap-assessment" });
  }, []);

  // ── Framework context — dynamic ───────────────────────────────────────────
  const { selectedFrameworks, isAllSelected, availableFrameworks } = useFramework();

  const allowedFrameworks = useMemo(() => {
    if (isAllSelected) return availableFrameworks;
    return selectedFrameworks.map(label => availableFrameworks.find(fw => fw.id === label)).filter(Boolean);
  }, [selectedFrameworks, isAllSelected, availableFrameworks]);

  const allowedCodes = useMemo(() => allowedFrameworks.map(fw => fw.code), [allowedFrameworks]);

  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showCap, setShowCap] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [findings, setFindings] = useState([]);
  const [newFinding, setNewFinding] = useState(null);
  const [ncGaps, setNcGaps] = useState([]);
  const [ncLoading, setNcLoading] = useState(false);

  useEffect(() => {
    if (selected) {
      captureActivity({ action: ACTIONS.CLICK, item: [{ detail: "Audit · Started findings review session", auditId: selected.id, framework: selected.frameworkCode }], url: "/gap-assessment" });
    }
  }, [selected?.id]);

  useEffect(() => {
    if (showCap) captureActivity({ action: ACTIONS.CLICK, item: [{ detail: "Audit · Opened CAP Management spreadsheet" }], url: "/gap-assessment" });
  }, [showCap]);

  const ctrlResult = useControls(selected ? selected.frameworkCode : null);
  const apiControls = ctrlResult.controls;

  const myControls = selected ? (selected.controls || []).filter(c => c.assignedTo === userName) : [];

  useEffect(() => {
    auditService.getAudits()
      .then(data => {
        const mine = (data || []).filter(a => (a.controls || []).some(c => c.assignedTo === userName));
        setAudits(mine);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userName]);

  // ── Plain gaps fetch — no retry logic here. This is identical behavior
  // to the original manual-only version. All trace-to-source retry/polling
  // logic lives entirely in Step 2 below, where it belongs, since only that
  // effect knows whether we arrived via Task Management (initialAuditId).
  useEffect(() => {
    if (!selected) return;
    setNcLoading(true); setNcGaps([]);
    gapService.getGaps()
      .then(allGaps => {
        const nc = (allGaps || []).filter(g => String(g.auditId) === String(selected.id) && (g.findings === "Major NC" || g.findings === "Minor NC"));
        setNcGaps(nc); setNcLoading(false);
      })
      .catch(() => setNcLoading(false));
  }, [selected]);

  // ── Trace-to-source auto-open guards ───────────────────────────────────
  // autoOpenHandled locks the whole flow once we've either succeeded or
  // given up — so it never re-triggers on Back navigation.
  // autoOpenAttempts lets Step 2 poll a few times in case the very first
  // fetch(es) race ahead of session/org context being fully warmed up on a
  // fresh page load (which was the root cause of "0 findings" on first try).
  const autoOpenHandled = React.useRef(false);
  const autoOpenAttempts = React.useRef(0);
  const MAX_AUTO_OPEN_ATTEMPTS = 5;

  // ── Step 1: once the audits list has loaded, select the audit that
  // matches initialAuditId (from Task Management's trace-to-source nav).
  useEffect(() => {
    if (!initialAuditId || autoOpenHandled.current) return;
    if (audits.length === 0) return;
    const match = audits.find((a) => String(a.id) === String(initialAuditId));
    if (match) {
      if (!selected) selectAudit(match);
    } else {
      // Audit list loaded but no match found (e.g. not assigned to this
      // user) — stop trying so this doesn't keep re-checking forever.
      autoOpenHandled.current = true;
    }
  }, [initialAuditId, audits, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step 2: once the audit's NC gaps have settled (ncLoading === false),
  // open the CAP view if we have data. If we don't yet, poll a few more
  // times before giving up — this is what fixes the race where a fresh
  // page load's first fetch quietly returns empty before session/org
  // context is fully ready, which a warm in-app click never hits.
  useEffect(() => {
    if (!initialAuditId || autoOpenHandled.current || !selected) return;
    if (ncLoading) return;

    if (ncGaps.length > 0) {
      autoOpenHandled.current = true;
      setShowCap(true);
      return;
    }

    autoOpenAttempts.current += 1;
    if (autoOpenAttempts.current >= MAX_AUTO_OPEN_ATTEMPTS) {
      autoOpenHandled.current = true; // genuinely 0 findings — stop polling
      return;
    }

    const t = setTimeout(() => {
      setNcLoading(true);
      gapService.getGaps()
        .then(allGaps => {
          const nc = (allGaps || []).filter(g => String(g.auditId) === String(selected.id) && (g.findings === "Major NC" || g.findings === "Minor NC"));
          setNcGaps(nc);
          setNcLoading(false);
        })
        .catch(() => setNcLoading(false));
    }, 900);

    return () => clearTimeout(t);
  }, [initialAuditId, selected, ncLoading, ncGaps]);

  // Filter audits by allowed framework codes
  const filteredAudits = useMemo(() => {
    return audits.filter(a => allowedCodes.includes(a.frameworkCode));
  }, [audits, allowedCodes]);

  function selectAudit(audit) { setSelected(audit); setFindings(audit.findings || []); }
  function resetToList() { setSelected(null); setShowCap(false); setNewFinding(null); setNcGaps([]); setError(""); }

  function submitNewFinding() {
    if (!newFinding || !newFinding.control || !newFinding.severity || !newFinding.description) return;
    setSaving(true);
    auditService.addFinding(selected.id, newFinding)
      .then(updatedAudit => {
        captureActivity({ action: ACTIONS.CREATE, item: [{ detail: "Audit · Added finding", auditId: selected.id, control: newFinding.control, severity: newFinding.severity }], url: "/gap-assessment" });
        setFindings(updatedAudit.findings || []); setNewFinding(null); setSaving(false);
      })
      .catch(err => { setError(err.message); setSaving(false); });
  }

  function statusBadge(s) {
    if (!s) return { bg: "#f1f5f9", color: "#475569" };
    const u = s.toUpperCase();
    if (u === "COMPLETED") return { bg: "#d1fae5", color: "#065f46" };
    if (u === "IN_PROGRESS" || u === "IN PROGRESS") return { bg: "#dbeafe", color: "#1e40af" };
    if (u === "PLANNED") return { bg: "#fef3c7", color: "#92400e" };
    return { bg: "#f1f5f9", color: "#475569" };
  }
  function displayStatus(s) {
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace("_", " ");
  }

  // Look up fw meta from context (no hardcoded CODE_META needed)
  function getFwMeta(code) {
    const fw = availableFrameworks.find(f => f.code === code);
    return fw ? { label: fw.label, color: fw.color, bg: fw.color + "18", border: fw.color + "55" } : { label: code, color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };
  }

  if (showCap && selected) {
    return (
      <CapSpreadsheet
        ncGaps={ncGaps} findings={findings} auditors={auditors} auditId={selected.id}
        onBack={() => setShowCap(false)}
        onSaved={() => { auditService.getAudits().then(data => { const fresh = (data || []).find(a => a.id === selected.id); if (fresh) setFindings(fresh.findings || []); }).catch(() => { }); }}
      />
    );
  }

  return (
    <Modal onClose={onClose} wide={true}>
      <ModalHeader
        title="Review Findings"
        subtitle={selected ? selected.auditType + " — " + getFwMeta(selected.frameworkCode).label : "Select an audit"}
        onClose={onClose}
      />
      <div style={{ padding: "16px 28px 24px", maxHeight: "72vh", overflowY: "auto" }}>
        {loading && <Spinner />}

        {!selected && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ActiveFilterBanner allowedFrameworks={allowedFrameworks} isAllSelected={isAllSelected} totalAudits={audits.length} filteredCount={filteredAudits.length} />

            {filteredAudits.map(audit => {
              const badge = statusBadge(audit.status);
              const fwMeta = getFwMeta(audit.frameworkCode);
              const myCount = (audit.controls || []).filter(c => c.assignedTo === userName).length;
              return (
                <button key={audit.id} onClick={() => selectAudit(audit)} style={{ textAlign: "left", border: "1px solid #f1f5f9", borderRadius: 14, padding: 16, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: badge.bg, color: badge.color }}>{displayStatus(audit.status)}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: fwMeta.bg, color: fwMeta.color, border: "1px solid " + fwMeta.border }}>{fwMeta.label}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{audit.auditType} — {fwMeta.label}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>{myCount} control{myCount !== 1 ? "s" : ""} assigned to you</p>
                  </div>
                  <ChevronRight size={18} color="#cbd5e1" />
                </button>
              );
            })}

            {filteredAudits.length === 0 && (
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 20 }}>
                {audits.length > 0 ? "No audits match the current framework filter." : "No audits assigned to you."}
              </p>
            )}
          </div>
        )}

        {selected && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <button onClick={resetToList} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontSize: 13, fontWeight: 600, padding: 0 }}>← Back</button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setNewFinding({ control: "", severity: "Medium", description: "", controlId: "" })} style={{ ...btnPrimary, background: "#7c3aed", fontSize: 12, padding: "7px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                  <Plus size={13} /> Add Finding
                </button>
                <button onClick={() => setShowCap(true)} disabled={ncLoading || ncGaps.length === 0} style={{ ...btnPrimary, background: ncGaps.length > 0 ? "#4f46e5" : "#94a3b8", cursor: ncGaps.length > 0 ? "pointer" : "not-allowed", fontSize: 12, padding: "7px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                  <Target size={13} /> Create CAP
                  {ncGaps.length > 0 && <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{ncGaps.length}</span>}
                </button>
              </div>
            </div>

            <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#1d4ed8", fontWeight: 600 }}>
              Your assigned controls ({myControls.length}):{" "}
              {myControls.map(c => { const meta = (apiControls || []).find(ac => ac.controlId === c.controlId) || {}; return meta.clause || c.controlId; }).join(", ")}
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={15} color="#dc2626" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Non-Conformities</span>
                {!ncLoading && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 9px", borderRadius: 20, background: ncGaps.length > 0 ? "#fef2f2" : "#f1f5f9", color: ncGaps.length > 0 ? "#991b1b" : "#64748b", border: "1px solid " + (ncGaps.length > 0 ? "#fecaca" : "#e2e8f0") }}>
                    {ncGaps.length} found
                  </span>
                )}
              </div>
              {ncLoading && <Spinner />}
              {!ncLoading && ncGaps.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13, border: "1px dashed #e2e8f0", borderRadius: 12, marginBottom: 16 }}>
                  No Major NC or Minor NC findings recorded for this audit yet.
                </div>
              )}
              {!ncLoading && ncGaps.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                  {ncGaps.map((gap, idx) => {
                    const isMajor = gap.findings === "Major NC";
                    const hasCap = !!(gap.cap && (gap.cap.rootCause || gap.cap.assignedTo));
                    return (
                      <div key={gap._id || gap.id || idx} style={{ border: "1px solid " + (isMajor ? "#fecaca" : "#fed7aa"), borderLeft: "4px solid " + (isMajor ? "#ef4444" : "#f97316"), borderRadius: 12, padding: "14px 16px", background: isMajor ? "#fff5f5" : "#fffbf5" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10, alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, background: "#f1f5f9", color: "#334155", padding: "2px 9px", borderRadius: 6, border: "1px solid #e2e8f0" }}>{gap.clause}</span>
                          <FindingsBadge value={gap.findings} />
                          {gap.totalScore != null && <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginLeft: "auto" }}>Score: {gap.totalScore} / 4</span>}
                          {hasCap && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "#ede9fe", color: "#6d28d9" }}>✓ CAP attached</span>}
                        </div>
                        <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#1e293b", lineHeight: 1.5 }}>{gap.question}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {[{ label: "Doc Remarks", val: gap.docRemarks, color: "#6366f1" }, { label: "Practice Remarks", val: gap.practiceRemarks, color: "#10b981" }].map(rm => (
                            <div key={rm.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                                <FileText size={11} color={rm.color} />
                                <span style={{ fontSize: 10, fontWeight: 700, color: rm.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{rm.label}</span>
                              </div>
                              <p style={{ margin: 0, fontSize: 12, color: rm.val ? "#334155" : "#94a3b8", fontStyle: rm.val ? "normal" : "italic", lineHeight: 1.5 }}>{rm.val || "No remarks recorded"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {newFinding && (
              <div style={{ border: "2px solid #ddd6fe", borderRadius: 14, padding: 20, marginTop: 16, background: "rgba(237,233,254,0.35)", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Plus size={15} color="#7c3aed" />
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#5b21b6" }}>New Finding</h4>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Control Clause</label>
                    <div style={{ position: "relative" }}>
                      <select value={newFinding.control} onChange={e => { const s = (apiControls || []).find(c => c.clause === e.target.value) || {}; setNewFinding(p => ({ ...p, control: e.target.value, controlId: s.controlId || e.target.value })); }} style={selectStyle}>
                        <option value="">Select control...</option>
                        {myControls.map(c => { const meta = (apiControls || []).find(ac => ac.controlId === c.controlId) || {}; return <option key={c.controlId} value={meta.clause || c.controlId}>{meta.clause || c.controlId}{meta.label ? " — " + meta.label : ""}</option>; })}
                      </select>
                      <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: 8, top: 11, pointerEvents: "none" }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Severity</label>
                    <div style={{ position: "relative" }}>
                      <select value={newFinding.severity} onChange={e => setNewFinding(p => ({ ...p, severity: e.target.value }))} style={selectStyle}>
                        {["High", "Medium", "Low"].map(s => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: 8, top: 11, pointerEvents: "none" }} />
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Description</label>
                    <textarea rows={3} value={newFinding.description} onChange={e => setNewFinding(p => ({ ...p, description: e.target.value }))} placeholder="Describe the finding..." style={{ ...inputStyle, resize: "none" }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={submitNewFinding} disabled={saving} style={{ ...btnPrimary, background: saving ? "#94a3b8" : "#7c3aed" }}>{saving ? "Saving..." : "Add Finding"}</button>
                  <button onClick={() => setNewFinding(null)} style={{ padding: "10px 18px", borderRadius: 12, background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>Cancel</button>
                </div>
              </div>
            )}

            {error && <div style={{ marginTop: 10, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#991b1b" }}>{error}</div>}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ReviewFindingsModal;