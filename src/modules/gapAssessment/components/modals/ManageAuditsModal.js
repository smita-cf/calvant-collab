
// import React, { useState, useEffect } from "react";
// import {
//   Search,
//   Edit3,
//   ChevronDown,
//   ChevronRight,
//   Layers,
//   ShieldCheck,
//   X,
//   RefreshCw,
// } from "lucide-react";
// import { Modal, ModalHeader, Spinner } from "../ui";
// import {
//   statusBadge,
//   displayStatus,
//   inputStyle,
//   selectStyle,
//   labelStyle,
//   btnPrimary,
// } from "../../utils/helpers";
// import { useControls } from "../../hooks/useControls";
// import auditService from "../../services/auditService";
// import { captureActivity, ACTIONS } from "../../../../services/activities";
// import {
//   useFramework,
//   ALL_FRAMEWORKS,
// } from "../../../../context/FrameworkContex";

// // ── Status config — 5 tabs
// const STATUS_TABS = [
//   { key: "All",         label: "All"         },
//   { key: "Planned",     label: "Planned"     },  // PLANNED
//   { key: "In Progress", label: "In Progress" },  // IN_PROGRESS
//   { key: "Completed",   label: "Completed"   },  // COMPLETED
// ];

// // ── Open badge — grey styling for audits with no status
// const OPEN_BADGE = { color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };

// // ── Color helper ──────────────────────────────────────────────────────────────
// function hexToMeta(hex = "#64748b") {
//   return { color: hex, bg: hex + "18", border: hex + "66" };
// }

// // ── Resolve badge for a given audit (handles null/empty → "Open" grey) ────────
// function resolveAuditBadge(audit) {
//   const s = audit.status;
//   // if (!s || s === "") {
//   //   return { color: OPEN_BADGE.color, bg: OPEN_BADGE.bg, label: "Open" };
//   // }
//   const badge = statusBadge(s);
//   return { ...badge, label: displayStatus(s) };
// }


// //date conversion helper in dd-mm-yyyy format, 
// function formatDate(dateString) {
//   if (!dateString) return "—";

//   const date = new Date(dateString);

//   return date
//     .toLocaleDateString("en-GB")
//     .replace(/\//g, "-");
// }

// // ── Shared filter banner ──────────────────────────────────────────────────────
// function ActiveFilterBanner({ allowedCodes, fwMetaByCode, isAllSelected }) {
//   return (
//     <div
//       className="flex items-center gap-2 flex-wrap px-3.5 py-2 rounded-xl border mb-3 text-xs flex-shrink-0"
//       style={{
//         background:  isAllSelected ? "#f0f4ff" : "#fffbeb",
//         borderColor: isAllSelected ? "#c7d2fe" : "#fcd34d",
//       }}
//     >
//       <ShieldCheck size={13} color={isAllSelected ? "#4338ca" : "#b45309"} className="flex-shrink-0" />
//       <span className="font-bold" style={{ color: isAllSelected ? "#4338ca" : "#b45309" }}>
//         Showing audits for:
//       </span>
//       {isAllSelected ? (
//         <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
//           All Frameworks
//         </span>
//       ) : (
//         allowedCodes.map((code) => {
//           const m = fwMetaByCode[code] || { label: code, color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };
//           return (
//             <span
//               key={code}
//               className="text-xs font-bold px-2.5 py-0.5 rounded-full"
//               style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
//             >
//               {m.label}
//             </span>
//           );
//         })
//       )}
//     </div>
//   );
// }

// export function ManageAuditsModal({ onClose, onSaved, auditors = [] }) {

//   useEffect(() => {
//     captureActivity({
//       action: ACTIONS.CLICK,
//       item: [{ detail: "Audit · Viewed 'Manage Audits' list" }],
//       url: "/gap-assessment",
//     });
//   }, []);

//   // ── Global framework context ──────────────────────────────────────────────
//   const { selectedFrameworks, isAllSelected, availableFrameworks } = useFramework();

//   // Derived maps — no hardcoded framework names
//   const fwLabelToCode = React.useMemo(
//     () => Object.fromEntries(availableFrameworks.map((fw) => [fw.id, fw.code])),
//     [availableFrameworks],
//   );

//   const fwMetaByCode = React.useMemo(() => {
//     const map = {};
//     availableFrameworks.forEach((fw) => {
//       const m = hexToMeta(fw.color);
//       map[fw.code] = { label: fw.label, color: m.color, bg: m.bg, border: m.border };
//     });
//     return map;
//   }, [availableFrameworks]);

//   const allowedCodes = React.useMemo(() => {
//     if (isAllSelected) return availableFrameworks.map((fw) => fw.code);
//     return selectedFrameworks.map((label) => fwLabelToCode[label]).filter(Boolean);
//   }, [selectedFrameworks, isAllSelected, availableFrameworks, fwLabelToCode]);

//   const [audits,        setAudits]        = useState([]);
//   const [loading,       setLoading]       = useState(true);
//   const [editing,       setEditing]       = useState(null);
//   const [editStep,      setEditStep]      = useState(1);
//   const [search,        setSearch]        = useState("");
//   const [error,         setError]         = useState("");
//   const [editBuf,       setEditBuf]       = useState({});
//   const [expanded,      setExpanded]      = useState({});

//   // ── Status filter + framework pill filter ─────────────────────────────────
//   const [statusFilter,    setStatusFilter]    = useState("All");
//   const [activeFramework, setActiveFramework] = useState("All"); // "All" or a frameworkCode

//   const { controls: apiControls = [], loading: ctrlLoading, error: ctrlError } =
//     useControls(editBuf.frameworkCode || availableFrameworks[0]?.code || "ISO27001");

//   useEffect(() => {
//     auditService.getAudits()
//       .then((data) => { setAudits(data || []); setLoading(false); })
//       .catch((err)  => { setError(err.message); setLoading(false); });
//   }, []);

//   useEffect(() => {
//     if (!apiControls || apiControls.length === 0) return;
//     setEditBuf((prev) => {
//       if (!prev.frameworkCode) return prev;
//       const merged = apiControls.map((c) => {
//         const existing = (prev.controls || []).find((x) => x.controlId === c.controlId);
//         return { controlId: c.controlId, assignedTo: existing ? existing.assignedTo : "" };
//       });
//       return { ...prev, controls: merged };
//     });
//   }, [apiControls]);

//   // ── Reset framework pill filter when allowedCodes change ─────────────────
//   useEffect(() => {
//     setActiveFramework("All");
//   }, [allowedCodes.join(",")]);

//   // ── Status match helper ───────────────────────────────────────────────────
//   // "Open"     = no status set at all (null / undefined / "")
//   // "Planned"  = status === "PLANNED"
//   function matchesStatus(audit, filter) {
//     if (filter === "All")         return true;
//     if (filter === "Planned")     return audit.status === "PLANNED";
//     if (filter === "In Progress") return audit.status === "IN_PROGRESS";
//     if (filter === "Completed")   return audit.status === "COMPLETED";
//     return true;
//   }

//   // ── Filtered list: framework context + framework pill + status + search ───
//   const filtered = audits.filter((a) => {
//     const inAllowed       = allowedCodes.includes(a.frameworkCode);
//     const inFrameworkPill = activeFramework === "All" || a.frameworkCode === activeFramework;
//     const inStatus        = matchesStatus(a, statusFilter);
//     const inSearch        =
//       (a.auditType || "").toLowerCase().includes(search.toLowerCase()) ||
//       (a.status    || "").toLowerCase().includes(search.toLowerCase()) ||
//       (a.poc       || "").toLowerCase().includes(search.toLowerCase());
//     return inAllowed && inFrameworkPill && inStatus && inSearch;
//   });

//   function startEdit(audit) {
//     setEditing(audit.id);
//     setEditStep(1);
//     setExpanded({});
//     setEditBuf({
//       auditType:          audit.auditType          || "",
//       frameworkCode:      audit.frameworkCode       || allowedCodes[0] || "",
//       leadAuditor:        audit.leadAuditor         || "",
//       poc:                audit.poc                 || "",
//       status:             audit.status              || "PLANNED",
//       openingMeetingDate: audit.openingMeetingDate  || "",
//       stage1StartDate:    audit.stage1StartDate     || "",
//       stage1EndDate:      audit.stage1EndDate       || "",
//       stage2StartDate:    audit.stage2StartDate     || "",
//       stage2EndDate:      audit.stage2EndDate       || "",
//       reportingStartDate: audit.reportingStartDate  || "",
//       reportingEndDate:   audit.reportingEndDate    || "",
//       closureMeetingDate: audit.closureMeetingDate  || "",
//       controls: (audit.controls || []).map((c) => ({
//         controlId:  c.controlId,
//         assignedTo: c.assignedTo || "",
//       })),
//     });
//   }

//   function setBuf(k, v) { setEditBuf((p) => ({ ...p, [k]: v })); }

//   function setAssignee(controlId, assignedTo) {
//     setEditBuf((prev) => ({
//       ...prev,
//       controls: (prev.controls || []).map((c) =>
//         c.controlId === controlId ? { ...c, assignedTo } : c
//       ),
//     }));
//   }

//   function assignSection(catControlIds, auditorId) {
//     if (!auditorId) return;
//     setEditBuf((prev) => ({
//       ...prev,
//       controls: (prev.controls || []).map((c) => {
//         if (!catControlIds.includes(c.controlId)) return c;
//         const eligible   = eligibleAuditors(c.controlId);
//         const isEligible = eligible.some((a) => String(a._id || a.id) === String(auditorId));
//         return isEligible ? { ...c, assignedTo: auditorId } : c;
//       }),
//     }));
//   }

//   function toggleSection(key) {
//     setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
//   }

//   function resolveAuditorName(idOrName) {
//     if (!idOrName) return "—";
//     const found = auditors.find(
//       (a) => String(a._id || a.id) === String(idOrName) || a.name === idOrName
//     );
//     return found ? found.name : idOrName;
//   }

//   function eligibleAuditors(controlId) {
//     const ctrl = apiControls.find((c) => c.controlId === controlId);
//     if (!ctrl || !ctrl.departmentIds || ctrl.departmentIds.length === 0) return auditors;
//     const controlDeptIds = ctrl.departmentIds.map(String);
//     return auditors.filter((a) => {
//       let userDeptIds = [];
//       if (Array.isArray(a.departments)) {
//         userDeptIds = a.departments.map((d) =>
//           String(typeof d === "object" ? d._id || d.id || "" : d)
//         );
//       } else if (Array.isArray(a.departmentIds)) {
//         userDeptIds = a.departmentIds.map(String);
//       } else if (a.department) {
//         userDeptIds = [String(typeof a.department === "object" ? a.department._id || a.department.id : a.department)];
//       }
//       return !userDeptIds.some((uid) => controlDeptIds.includes(uid));
//     });
//   }

//   function groupControls(controls) {
//     const grouped = {};
//     controls.forEach((ctrl) => {
//       const category = ctrl.category || ctrl.sectionType || "Other";
//       if (!grouped[category]) grouped[category] = {};
//       const prefix = (ctrl.clause || "").split(".")[0] || "Other";
//       if (!grouped[category][prefix]) grouped[category][prefix] = [];
//       grouped[category][prefix].push(ctrl);
//     });
//     return grouped;
//   }

//   function saveEdit(audit) {
//     const updated = { ...audit, ...editBuf };
//     auditService.updateAudit(audit.id, updated)
//       .then((saved) => {
//         captureActivity({
//           action: ACTIONS.UPDATE,
//           item: [{ detail: "Audit · Updated audit", auditId: audit.id, status: updated.status }],
//           url: "/gap-assessment",
//         });
//         setAudits((prev) => prev.map((a) => (a.id === audit.id ? saved : a)));
//         setEditing(null);
//         if (onSaved) onSaved();
//       })
//       .catch((err) => setError(err.message));
//   }

//   // ── Counts per framework (within allowedCodes, respects status filter) ────
//   // "All" tab count = everything regardless of status, per the requirement
//   const counts = React.useMemo(() => {
//     const c = { All: 0 };
//     allowedCodes.forEach((k) => {
//       // Framework pill count respects the current status filter
//       const n = audits.filter((a) =>
//         a.frameworkCode === k && matchesStatus(a, statusFilter)
//       ).length;
//       c[k] = n;
//       // "All" pill always counts everything regardless of status
//       c.All += audits.filter((a) => a.frameworkCode === k).length;
//     });
//     // But when a non-All status is selected, the "All" pill count should still
//     // reflect all audits for context; recalculate cleanly:
//     c.All = audits.filter((a) => allowedCodes.includes(a.frameworkCode)).length;
//     return c;
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [audits, allowedCodes, statusFilter]);

//   // Framework pill counts DO update with status filter (for per-framework pills)
//   const frameworkCounts = React.useMemo(() => {
//     const c = {};
//     allowedCodes.forEach((k) => {
//       c[k] = audits.filter((a) =>
//         a.frameworkCode === k && matchesStatus(a, statusFilter)
//       ).length;
//     });
//     return c;
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [audits, allowedCodes, statusFilter]);

//   const phaseLabel    = { fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", margin: "10px 0 6px" };
//   const dateRangeGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
//   const selectWrapper = { position: "relative" };
//   const chevronStyle  = { position: "absolute", right: 12, top: 12, pointerEvents: "none" };

//   return (
//     <Modal onClose={onClose} wide={true}>

//       {/* ── FIXED HEADER ──────────────────────────────────────────────────── */}
//       <div className="flex-shrink-0">
//         <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
//               <ShieldCheck size={18} className="text-white" />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-slate-800">Manage Audits</h2>
//               <p className="text-xs text-slate-500">
//                 {editing
//                   ? "Edit audit"
//                   : `${filtered.length} of ${audits.length} audits`}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             {editing && (
//               <button
//                 onClick={() => setEditing(null)}
//                 className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-200 transition-colors"
//               >
//                 ← Back to List
//               </button>
//             )}
//             <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
//               <X size={18} className="text-slate-500" />
//             </button>
//           </div>
//         </div>

//         {/* Filter area — only in list view */}
//         {!editing && (
//           <div className="px-7 pt-4 pb-2">

//             {/* 1. Showing audits for banner */}
//             <ActiveFilterBanner
//               allowedCodes={allowedCodes}
//               fwMetaByCode={fwMetaByCode}
//               isAllSelected={isAllSelected}
//             />

//             {/* 2. Framework pills — horizontal scroll, single row, no wrap */}
//             <div
//               style={{
//                 display: "flex",
//                 gap: 6,
//                 overflowX: "auto",
//                 overflowY: "hidden",
//                 scrollbarWidth: "none",
//                 msOverflowStyle: "none",
//                 paddingBottom: 4,
//                 marginBottom: 6,
//                 flexWrap: "nowrap",
//               }}
//             >
//               <style>{`.fw-pill-scroll::-webkit-scrollbar{display:none}`}</style>

//               {/* "All" pill */}
//               <button
//                 onClick={() => setActiveFramework("All")}
//                 style={{
//                   flexShrink: 0,
//                   fontSize: 12,
//                   fontWeight: 500,
//                   padding: "2px 6px",
//                   borderRadius: 20,
//                   border: activeFramework === "All" ? "1.5px solid #4f46e5" : "1.5px solid #e2e8f0",
//                   background: activeFramework === "All" ? "#4f46e5" : "#f8fafc",
//                   color: activeFramework === "All" ? "#fff" : "#475569",
//                   cursor: "pointer",
//                   whiteSpace: "nowrap",
//                   transition: "all 0.15s",
//                   boxShadow: activeFramework === "All" ? "0 1px 4px rgba(79,70,229,0.25)" : "none",
//                 }}
//               >
//                 All: {counts.All || 0}
//               </button>

//               {/* Per-framework pills */}
//               {allowedCodes.map((code) => {
//                 const m       = fwMetaByCode[code] || { label: code, color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };
//                 const isActive = activeFramework === code;
//                 return (
//                   <button
//                     key={code}
//                     onClick={() => setActiveFramework(isActive ? "All" : code)}
//                     style={{
//                       flexShrink: 0,
//                       fontSize: 12,
//                       fontWeight: 600,
//                       padding: "2px 8px",
//                       borderRadius: 20,
//                       whiteSpace: "nowrap",
//                       cursor: "pointer",
//                       transition: "all 0.15s",
//                       ...(isActive
//                         ? {
//                             background:  m.color,
//                             color:       "#fff",
//                             border:      `1.5px solid ${m.color}`,
//                             boxShadow:   "0 1px 4px rgba(0,0,0,0.18)",
//                           }
//                         : {
//                             background:  m.bg,
//                             color:       m.color,
//                             border:      `1.5px solid ${m.border}`,
//                           }),
//                     }}
//                   >
//                     {m.label}: {frameworkCounts[code] ?? 0}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* 3. Status filter tabs — All, Open, Planned, In Progress, Completed */}
//             <div className="flex gap-1.5 flex-wrap mb-3">
//               {STATUS_TABS.map(({ key, label }) => (
//                 <button
//                   key={key}
//                   onClick={() => setStatusFilter(key)}
//                   className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
//                     statusFilter === key
//                       ? "bg-indigo-600 text-white shadow-sm"
//                       : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                   }`}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </div>

//             <div className="relative mb-2">
//               <Search size={14} color="#94a3b8" className="absolute left-3 top-[11px]" />
//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search by type, status, POC..."
//                 style={{ ...inputStyle, paddingLeft: 36 }}
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── SCROLLABLE BODY ───────────────────────────────────────────────── */}
//       <div
//         className="flex-1 overflow-y-auto px-7 pb-4"
//         style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
//       >
//         <style>{`div::-webkit-scrollbar{display:none}`}</style>

//         {loading && <Spinner />}
//         {error   && <p className="text-red-600 text-sm mt-2">{error}</p>}

//         {/* ── LIST VIEW ─────────────────────────────────────────────────── */}
//         {!editing && (
//           <div className="space-y-2.5 mt-2">
//             {filtered.map((audit) => {
//               const resolved = resolveAuditBadge(audit);
//               const fwMeta   = fwMetaByCode[audit.frameworkCode] || {
//                 label: audit.frameworkCode, color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0",
//               };
//               return (
//                 <div
//                   key={audit.id}
//                   className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
//                 >
//                   <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: resolved.color }} />
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 mb-1 flex-wrap">
//                       {/* Status badge — "Open" shown in grey for null/empty status */}
//                       <span
//                         className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
//                         style={{ background: resolved.bg, color: resolved.color }}
//                       >
//                         {resolved.label}
//                       </span>
//                       <span className="text-xs text-slate-400 font-medium">{audit.auditType}</span>
//                       <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: fwMeta.bg, color: fwMeta.color, border: `1px solid ${fwMeta.border}` }}>
//                         {fwMeta.label}
//                       </span>
//                     </div>
//                     <p className="text-sm font-semibold text-slate-800 mb-0.5">{audit.auditType} — {fwMeta.label}</p>
//                     <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
//                       <span>Opening: {formatDate(audit.openingMeetingDate)} · Closure: {formatDate(audit.closureMeetingDate)}</span>
//                       <span>POC: {resolveAuditorName(audit.poc)} · Lead: {resolveAuditorName(audit.leadAuditor)}</span>
//                       <span>{(audit.controls || []).length} controls · {(audit.findings || []).length} findings</span>
//                     </div>
//                   </div>
//                   <button onClick={() => startEdit(audit)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0">
//                     <Edit3 size={15} color="#94a3b8" />
//                   </button>
//                 </div>
//               );
//             })}

//             {!loading && filtered.length === 0 && (
//               <p className="text-center text-slate-400 text-sm py-12">
//                 {audits.length > 0
//                   ? "No audits match the current filters."
//                   : "No audits found."}
//               </p>
//             )}
//           </div>
//         )}

//         {/* ── EDIT VIEW ─────────────────────────────────────────────────── */}
//         {editing && (() => {
//           const audit = audits.find((a) => a.id === editing);
//           if (!audit) return null;
//           return (
//             <div className="mt-4">
//               {/* Step tabs */}
//               <div className="flex gap-2 mb-6">
//                 {[{ step: 1, label: "Audit Details" }, { step: 2, label: "Assign Controls" }].map(({ step: s, label }) => (
//                   <button
//                     key={s}
//                     onClick={() => setEditStep(s)}
//                     className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all
//                       ${editStep === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
//                   >
//                     <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0
//                       ${editStep === s ? "bg-white text-indigo-600" : "bg-slate-300 text-white"}`}>
//                       {s}
//                     </span>
//                     {label}
//                   </button>
//                 ))}
//               </div>

//               {/* Step 1: Audit Details */}
//               {editStep === 1 && (
//                 <div className="flex flex-col gap-3">
//                   <div style={dateRangeGrid}>
//                     <div>
//                       <label style={labelStyle}>Audit Type</label>
//                       <div style={selectWrapper}>
//                         <select value={editBuf.auditType} onChange={(e) => setBuf("auditType", e.target.value)} style={selectStyle}>
//                           <option value="">Select type...</option>
//                           {["Internal", "External", "Certification", "Surveillance"].map((t) => <option key={t}>{t}</option>)}
//                         </select>
//                         <ChevronDown size={15} color="#94a3b8" style={chevronStyle} />
//                       </div>
//                     </div>
//                     <div>
//                       <label style={labelStyle}>Framework</label>
//                       <div style={selectWrapper}>
//                         <select value={editBuf.frameworkCode} onChange={(e) => setBuf("frameworkCode", e.target.value)} style={selectStyle}>
//                           {allowedCodes.map((code) => (
//                             <option key={code} value={code}>
//                               {fwMetaByCode[code]?.label || code}
//                             </option>
//                           ))}
//                         </select>
//                         <ChevronDown size={15} color="#94a3b8" style={chevronStyle} />
//                       </div>
//                     </div>
//                   </div>

//                   <div style={dateRangeGrid}>
//                     <div>
//                       <label style={labelStyle}>Lead Auditor</label>
//                       <div style={selectWrapper}>
//                         <select value={editBuf.leadAuditor} onChange={(e) => setBuf("leadAuditor", e.target.value)} style={selectStyle}>
//                           <option value="">Select lead auditor...</option>
//                           {auditors.map((a) => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
//                         </select>
//                         <ChevronDown size={15} color="#94a3b8" style={chevronStyle} />
//                       </div>
//                     </div>
//                     <div>
//                       <label style={labelStyle}>Point of Contact</label>
//                       <div style={selectWrapper}>
//                         <select value={editBuf.poc} onChange={(e) => setBuf("poc", e.target.value)} style={selectStyle}>
//                           <option value="">Select contact...</option>
//                           {auditors.map((a) => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
//                         </select>
//                         <ChevronDown size={15} color="#94a3b8" style={chevronStyle} />
//                       </div>
//                     </div>
//                   </div>

//                   <div style={{ maxWidth: "50%" }}>
//                     <label style={labelStyle}>Status</label>
//                     <div style={selectWrapper}>
//                       <select value={editBuf.status} onChange={(e) => setBuf("status", e.target.value)} style={selectStyle}>
//                         {["PLANNED", "IN_PROGRESS", "COMPLETED"].map((s) => <option key={s}>{s}</option>)}
//                       </select>
//                       <ChevronDown size={15} color="#94a3b8" style={chevronStyle} />
//                     </div>
//                   </div>

//                   <div style={{ borderTop: "1px solid #e2e8f0" }} />

//                   <div>
//                     <p style={phaseLabel}>Audit Opening Meeting</p>
//                     <input type="date" value={editBuf.openingMeetingDate} onChange={(e) => setBuf("openingMeetingDate", e.target.value)} style={{ ...inputStyle, maxWidth: "50%" }} />
//                   </div>
//                   <div>
//                     <p style={phaseLabel}>Stage 1 / Documentation Audit</p>
//                     <div style={dateRangeGrid}>
//                       <div><label style={labelStyle}>Start Date</label><input type="date" value={editBuf.stage1StartDate} min={editBuf.openingMeetingDate || undefined} max={editBuf.closureMeetingDate || undefined} onChange={(e) => setBuf("stage1StartDate", e.target.value)} style={inputStyle} /></div>
//                       <div><label style={labelStyle}>End Date</label><input type="date" value={editBuf.stage1EndDate} min={editBuf.stage1StartDate || editBuf.openingMeetingDate || undefined} max={editBuf.closureMeetingDate || undefined} onChange={(e) => setBuf("stage1EndDate", e.target.value)} style={inputStyle} /></div>
//                     </div>
//                   </div>
//                   <div>
//                     <p style={phaseLabel}>Stage 2 / Practice Audit</p>
//                     <div style={dateRangeGrid}>
//                       <div><label style={labelStyle}>Start Date</label><input type="date" value={editBuf.stage2StartDate} min={editBuf.stage1EndDate || editBuf.openingMeetingDate || undefined} max={editBuf.closureMeetingDate || undefined} onChange={(e) => setBuf("stage2StartDate", e.target.value)} style={inputStyle} /></div>
//                       <div><label style={labelStyle}>End Date</label><input type="date" value={editBuf.stage2EndDate} min={editBuf.stage2StartDate || editBuf.stage1EndDate || undefined} max={editBuf.closureMeetingDate || undefined} onChange={(e) => setBuf("stage2EndDate", e.target.value)} style={inputStyle} /></div>
//                     </div>
//                   </div>
//                   <div>
//                     <p style={phaseLabel}>Audit Reporting</p>
//                     <div style={dateRangeGrid}>
//                       <div><label style={labelStyle}>Start Date</label><input type="date" value={editBuf.reportingStartDate} min={editBuf.stage2EndDate || editBuf.openingMeetingDate || undefined} max={editBuf.closureMeetingDate || undefined} onChange={(e) => setBuf("reportingStartDate", e.target.value)} style={inputStyle} /></div>
//                       <div><label style={labelStyle}>End Date</label><input type="date" value={editBuf.reportingEndDate} min={editBuf.reportingStartDate || editBuf.stage2EndDate || undefined} max={editBuf.closureMeetingDate || undefined} onChange={(e) => setBuf("reportingEndDate", e.target.value)} style={inputStyle} /></div>
//                     </div>
//                   </div>
//                   <div>
//                     <p style={phaseLabel}>Closure Meeting</p>
//                     <input type="date" value={editBuf.closureMeetingDate} min={editBuf.reportingEndDate || editBuf.openingMeetingDate || undefined} onChange={(e) => setBuf("closureMeetingDate", e.target.value)} style={{ ...inputStyle, maxWidth: "50%" }} />
//                   </div>

//                   <div className="flex justify-end pt-3 border-t border-slate-100">
//                     <button onClick={() => setEditStep(2)} className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all">
//                       Next: Assign Controls →
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Step 2: Assign Controls */}
//               {editStep === 2 && (
//                 <div>
//                   <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3.5 py-2.5 mb-4">
//                     <Layers size={14} color="#3b82f6" />
//                     <p className="text-xs font-semibold text-blue-700 m-0">
//                       Assign auditors to each control, or use the section dropdown to bulk-assign.
//                     </p>
//                   </div>
//                   {ctrlLoading && <Spinner />}
//                   {ctrlError && <p className="text-red-600 text-sm">Could not load controls: {ctrlError}</p>}
//                   <div className="flex flex-col gap-2.5">
//                     {(() => {
//                       const grouped = groupControls(apiControls);
//                       return Object.keys(grouped).sort().map((category) => {
//                         const catControlIds = [];
//                         Object.values(grouped[category]).forEach((arr) => arr.forEach((c) => catControlIds.push(c.controlId)));
//                         const assignedCount = catControlIds.filter((id) => {
//                           const found = (editBuf.controls || []).find((c) => c.controlId === id);
//                           return found && found.assignedTo;
//                         }).length;
//                         const sectionEligibleMap = {};
//                         catControlIds.forEach((id) => eligibleAuditors(id).forEach((a) => { sectionEligibleMap[String(a._id || a.id)] = a; }));
//                         const sectionEligible = Object.values(sectionEligibleMap);
//                         return (
//                           <div key={category} className="mb-4">
//                             <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-200 gap-2.5" style={{ borderRadius: expanded[category] ? "10px 10px 0 0" : 10 }}>
//                               <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={() => toggleSection(category)}>
//                                 <ChevronRight size={14} className="flex-shrink-0 transition-transform duration-200" style={{ transform: expanded[category] ? "rotate(90deg)" : "rotate(0deg)" }} />
//                                 <span className="font-bold text-sm">{category}</span>
//                                 <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${assignedCount === catControlIds.length ? "bg-green-200 text-green-800" : "bg-blue-100 text-blue-700"}`}>
//                                   {assignedCount}/{catControlIds.length} assigned
//                                 </span>
//                               </div>
//                               <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
//                                 <select
//                                   value={(() => {
//                                     const vals = catControlIds.map((id) => { const f = (editBuf.controls || []).find((c) => c.controlId === id); return f ? f.assignedTo || "" : ""; });
//                                     const allSame = vals.length > 0 && vals.every((v) => v !== "" && v === vals[0]);
//                                     return allSame ? vals[0] : "";
//                                   })()}
//                                   onChange={(e) => assignSection(catControlIds, e.target.value)}
//                                   className="text-xs py-1.5 pl-2 pr-6 rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer appearance-none min-w-36"
//                                 >
//                                   <option value="" disabled>Assign whole section…</option>
//                                   {sectionEligible.map((a) => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
//                                 </select>
//                                 <ChevronDown size={12} color="#94a3b8" className="absolute right-2 top-2 pointer-events-none" />
//                               </div>
//                             </div>
//                             {expanded[category] && Object.keys(grouped[category]).sort().map((prefix) => (
//                               <div key={prefix} className="mt-2">
//                                 <div className="text-xs font-semibold text-slate-500 mb-1.5 pl-1.5">Clause {prefix}</div>
//                                 {grouped[category][prefix].map((ctrl) => {
//                                   const assignment    = (editBuf.controls || []).find((c) => c.controlId === ctrl.controlId) || {};
//                                   const eligible      = eligibleAuditors(ctrl.controlId);
//                                   const currentId     = assignment.assignedTo || "";
//                                   const currentInList = !currentId || eligible.some((a) => String(a._id || a.id) === String(currentId));
//                                   const currentAuditor = !currentInList ? auditors.find((a) => String(a._id || a.id) === String(currentId)) : null;
//                                   return (
//                                     <div key={ctrl.controlId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50 mb-1.5">
//                                       <div className="flex-1">
//                                         <div className="text-xs font-bold text-blue-600">{ctrl.clause}</div>
//                                         <div className="text-xs text-slate-600">{ctrl.label}</div>
//                                       </div>
//                                       <select value={currentId} onChange={(e) => setAssignee(ctrl.controlId, e.target.value)} className="w-40 text-xs px-2 py-1.5 rounded-lg border border-slate-200">
//                                         <option value="">Assign auditor...</option>
//                                         {currentAuditor && <option value={String(currentAuditor._id || currentAuditor.id)}>{currentAuditor.name}</option>}
//                                         {eligible.map((a) => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
//                                       </select>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             ))}
//                           </div>
//                         );
//                       });
//                     })()}
//                     {!ctrlLoading && apiControls.length === 0 && (
//                       <p className="text-slate-400 text-sm text-center py-5">No controls found for {editBuf.frameworkCode}.</p>
//                     )}
//                   </div>

//                   <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
//                     <button onClick={() => setEditStep(1)} className="text-slate-500 text-sm font-semibold bg-none border-none cursor-pointer px-0 py-2 hover:text-slate-700 transition-colors">
//                       ← Back
//                     </button>
//                     <div className="flex gap-2">
//                       <button onClick={() => saveEdit(audit)} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow transition-all">
//                         Save Changes
//                       </button>
//                       <button onClick={() => setEditing(null)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-all border-none cursor-pointer">
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })()}
//       </div>
//     </Modal>
//   );
// }

// export default ManageAuditsModal;

import React, { useState, useEffect } from "react";
import {
  Search,
  Edit3,
  ChevronDown,
  ChevronRight,
  Layers,
  ShieldCheck,
  X,
  RefreshCw,
} from "lucide-react";
import { Modal, ModalHeader, Spinner } from "../ui";
import {
  statusBadge,
  displayStatus,
  inputStyle,
  selectStyle,
  labelStyle,
  btnPrimary,
} from "../../utils/helpers";
import { useControls } from "../../hooks/useControls";
import auditService from "../../services/auditService";
// FIX: ACTIONS.UPDATE no longer exists in the finalized taxonomy — it was
// renamed to ACTIONS.UPDATED. Referencing the old name resolves to
// `undefined` at runtime and posts action: undefined to the logging
// service. Also importing MODULES — neither captureActivity call in this
// file passed a module, so both defaulted to MODULES.SYSTEM in
// buildPayload() and were silently dropped by the human-only capture
// filter in activities.js. This modal belongs to the Audit module.
import { captureActivity, ACTIONS, MODULES } from "../../../admin/shell/services/activities";
import {
  useFramework,
  ALL_FRAMEWORKS,
} from "../../../../context/FrameworkContex";

// ── Status config — 5 tabs
const STATUS_TABS = [
  { key: "All",         label: "All"         },
  { key: "Planned",     label: "Planned"     },  // PLANNED
  { key: "In Progress", label: "In Progress" },  // IN_PROGRESS
  { key: "Completed",   label: "Completed"   },  // COMPLETED
];

// ── Open badge — grey styling for audits with no status
const OPEN_BADGE = { color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };

// ── Color helper ──────────────────────────────────────────────────────────────
function hexToMeta(hex = "#64748b") {
  return { color: hex, bg: hex + "18", border: hex + "66" };
}

// ── Resolve badge for a given audit (handles null/empty → "Open" grey) ────────
function resolveAuditBadge(audit) {
  const s = audit.status;
  // if (!s || s === "") {
  //   return { color: OPEN_BADGE.color, bg: OPEN_BADGE.bg, label: "Open" };
  // }
  const badge = statusBadge(s);
  return { ...badge, label: displayStatus(s) };
}


//date conversion helper in dd-mm-yyyy format, 
function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return date
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");
}

// ── Shared filter banner ──────────────────────────────────────────────────────
function ActiveFilterBanner({ allowedCodes, fwMetaByCode, isAllSelected }) {
  return (
    <div
      className="flex items-center gap-2 flex-wrap px-3.5 py-2 rounded-xl border mb-3 text-xs flex-shrink-0"
      style={{
        background:  isAllSelected ? "#f0f4ff" : "#fffbeb",
        borderColor: isAllSelected ? "#c7d2fe" : "#fcd34d",
      }}
    >
      <ShieldCheck size={13} color={isAllSelected ? "#4338ca" : "#b45309"} className="flex-shrink-0" />
      <span className="font-bold" style={{ color: isAllSelected ? "#4338ca" : "#b45309" }}>
        Showing audits for:
      </span>
      {isAllSelected ? (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
          All Frameworks
        </span>
      ) : (
        allowedCodes.map((code) => {
          const m = fwMetaByCode[code] || { label: code, color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };
          return (
            <span
              key={code}
              className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
            >
              {m.label}
            </span>
          );
        })
      )}
    </div>
  );
}

export function ManageAuditsModal({ onClose, onSaved, auditors = [] }) {

  useEffect(() => {
    // FIX: added module: MODULES.AUDIT — was missing, defaulted to
    // MODULES.SYSTEM, and would have been silently dropped by the
    // capture-time human-only filter in activities.js.
    captureActivity({
      action: ACTIONS.CLICK,
      module: MODULES.AUDIT,
      item: [{ detail: "Audit · Viewed 'Manage Audits' list" }],
      url: "/gap-assessment",
    });
  }, []);

  // ── Global framework context ──────────────────────────────────────────────
  const { selectedFrameworks, isAllSelected, availableFrameworks } = useFramework();

  // Derived maps — no hardcoded framework names
  const fwLabelToCode = React.useMemo(
    () => Object.fromEntries(availableFrameworks.map((fw) => [fw.id, fw.code])),
    [availableFrameworks],
  );

  const fwMetaByCode = React.useMemo(() => {
    const map = {};
    availableFrameworks.forEach((fw) => {
      const m = hexToMeta(fw.color);
      map[fw.code] = { label: fw.label, color: m.color, bg: m.bg, border: m.border };
    });
    return map;
  }, [availableFrameworks]);

  const allowedCodes = React.useMemo(() => {
    if (isAllSelected) return availableFrameworks.map((fw) => fw.code);
    return selectedFrameworks.map((label) => fwLabelToCode[label]).filter(Boolean);
  }, [selectedFrameworks, isAllSelected, availableFrameworks, fwLabelToCode]);

  const [audits,        setAudits]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [editing,       setEditing]       = useState(null);
  const [editStep,      setEditStep]      = useState(1);
  const [search,        setSearch]        = useState("");
  const [error,         setError]         = useState("");
  const [editBuf,       setEditBuf]       = useState({});
  const [expanded,      setExpanded]      = useState({});

  // ── Status filter + framework pill filter ─────────────────────────────────
  const [statusFilter,    setStatusFilter]    = useState("All");
  const [activeFramework, setActiveFramework] = useState("All"); // "All" or a frameworkCode

  const { controls: apiControls = [], loading: ctrlLoading, error: ctrlError } =
    useControls(editBuf.frameworkCode || availableFrameworks[0]?.code || "ISO27001");

  useEffect(() => {
    auditService.getAudits()
      .then((data) => { setAudits(data || []); setLoading(false); })
      .catch((err)  => { setError(err.message); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!apiControls || apiControls.length === 0) return;
    setEditBuf((prev) => {
      if (!prev.frameworkCode) return prev;
      const merged = apiControls.map((c) => {
        const existing = (prev.controls || []).find((x) => x.controlId === c.controlId);
        return { controlId: c.controlId, assignedTo: existing ? existing.assignedTo : "" };
      });
      return { ...prev, controls: merged };
    });
  }, [apiControls]);

  // ── Reset framework pill filter when allowedCodes change ─────────────────
  useEffect(() => {
    setActiveFramework("All");
  }, [allowedCodes.join(",")]);

  // ── Status match helper ───────────────────────────────────────────────────
  // "Open"     = no status set at all (null / undefined / "")
  // "Planned"  = status === "PLANNED"
  function matchesStatus(audit, filter) {
    if (filter === "All")         return true;
    if (filter === "Planned")     return audit.status === "PLANNED";
    if (filter === "In Progress") return audit.status === "IN_PROGRESS";
    if (filter === "Completed")   return audit.status === "COMPLETED";
    return true;
  }

  // ── Filtered list: framework context + framework pill + status + search ───
  const filtered = audits.filter((a) => {
    const inAllowed       = allowedCodes.includes(a.frameworkCode);
    const inFrameworkPill = activeFramework === "All" || a.frameworkCode === activeFramework;
    const inStatus        = matchesStatus(a, statusFilter);
    const inSearch        =
      (a.auditType || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.status    || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.poc       || "").toLowerCase().includes(search.toLowerCase());
    return inAllowed && inFrameworkPill && inStatus && inSearch;
  });

  function startEdit(audit) {
    setEditing(audit.id);
    setEditStep(1);
    setExpanded({});
    setEditBuf({
      auditType:          audit.auditType          || "",
      frameworkCode:      audit.frameworkCode       || allowedCodes[0] || "",
      leadAuditor:        audit.leadAuditor         || "",
      poc:                audit.poc                 || "",
      status:             audit.status              || "PLANNED",
      openingMeetingDate: audit.openingMeetingDate  || "",
      stage1StartDate:    audit.stage1StartDate     || "",
      stage1EndDate:      audit.stage1EndDate       || "",
      stage2StartDate:    audit.stage2StartDate     || "",
      stage2EndDate:      audit.stage2EndDate       || "",
      reportingStartDate: audit.reportingStartDate  || "",
      reportingEndDate:   audit.reportingEndDate    || "",
      closureMeetingDate: audit.closureMeetingDate  || "",
      controls: (audit.controls || []).map((c) => ({
        controlId:  c.controlId,
        assignedTo: c.assignedTo || "",
      })),
    });
  }

  function setBuf(k, v) { setEditBuf((p) => ({ ...p, [k]: v })); }

  function setAssignee(controlId, assignedTo) {
    setEditBuf((prev) => ({
      ...prev,
      controls: (prev.controls || []).map((c) =>
        c.controlId === controlId ? { ...c, assignedTo } : c
      ),
    }));
  }

  function assignSection(catControlIds, auditorId) {
    if (!auditorId) return;
    setEditBuf((prev) => ({
      ...prev,
      controls: (prev.controls || []).map((c) => {
        if (!catControlIds.includes(c.controlId)) return c;
        const eligible   = eligibleAuditors(c.controlId);
        const isEligible = eligible.some((a) => String(a._id || a.id) === String(auditorId));
        return isEligible ? { ...c, assignedTo: auditorId } : c;
      }),
    }));
  }

  function toggleSection(key) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function resolveAuditorName(idOrName) {
    if (!idOrName) return "—";
    const found = auditors.find(
      (a) => String(a._id || a.id) === String(idOrName) || a.name === idOrName
    );
    return found ? found.name : idOrName;
  }

  function eligibleAuditors(controlId) {
    const ctrl = apiControls.find((c) => c.controlId === controlId);
    if (!ctrl || !ctrl.departmentIds || ctrl.departmentIds.length === 0) return auditors;
    const controlDeptIds = ctrl.departmentIds.map(String);
    return auditors.filter((a) => {
      let userDeptIds = [];
      if (Array.isArray(a.departments)) {
        userDeptIds = a.departments.map((d) =>
          String(typeof d === "object" ? d._id || d.id || "" : d)
        );
      } else if (Array.isArray(a.departmentIds)) {
        userDeptIds = a.departmentIds.map(String);
      } else if (a.department) {
        userDeptIds = [String(typeof a.department === "object" ? a.department._id || a.department.id : a.department)];
      }
      return !userDeptIds.some((uid) => controlDeptIds.includes(uid));
    });
  }

  function groupControls(controls) {
    const grouped = {};
    controls.forEach((ctrl) => {
      const category = ctrl.category || ctrl.sectionType || "Other";
      if (!grouped[category]) grouped[category] = {};
      const prefix = (ctrl.clause || "").split(".")[0] || "Other";
      if (!grouped[category][prefix]) grouped[category][prefix] = [];
      grouped[category][prefix].push(ctrl);
    });
    return grouped;
  }

  function saveEdit(audit) {
    const updated = { ...audit, ...editBuf };
    auditService.updateAudit(audit.id, updated)
      .then((saved) => {
        // FIX: ACTIONS.UPDATE -> ACTIONS.UPDATED (canonical taxonomy —
        // UPDATE was retired). Added module: MODULES.AUDIT — was missing,
        // defaulted to MODULES.SYSTEM, and would have been silently dropped
        // by the capture-time human-only filter in activities.js.
        captureActivity({
          action: ACTIONS.UPDATED,
          module: MODULES.AUDIT,
          item: [{ detail: "Audit · Updated audit", auditId: audit.id, status: updated.status }],
          url: "/gap-assessment",
        });
        setAudits((prev) => prev.map((a) => (a.id === audit.id ? saved : a)));
        setEditing(null);
        if (onSaved) onSaved();
      })
      .catch((err) => setError(err.message));
  }

  // ── Counts per framework (within allowedCodes, respects status filter) ────
  // "All" tab count = everything regardless of status, per the requirement
  const counts = React.useMemo(() => {
    const c = { All: 0 };
    allowedCodes.forEach((k) => {
      // Framework pill count respects the current status filter
      const n = audits.filter((a) =>
        a.frameworkCode === k && matchesStatus(a, statusFilter)
      ).length;
      c[k] = n;
      // "All" pill always counts everything regardless of status
      c.All += audits.filter((a) => a.frameworkCode === k).length;
    });
    // But when a non-All status is selected, the "All" pill count should still
    // reflect all audits for context; recalculate cleanly:
    c.All = audits.filter((a) => allowedCodes.includes(a.frameworkCode)).length;
    return c;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audits, allowedCodes, statusFilter]);

  // Framework pill counts DO update with status filter (for per-framework pills)
  const frameworkCounts = React.useMemo(() => {
    const c = {};
    allowedCodes.forEach((k) => {
      c[k] = audits.filter((a) =>
        a.frameworkCode === k && matchesStatus(a, statusFilter)
      ).length;
    });
    return c;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audits, allowedCodes, statusFilter]);

  const phaseLabel    = { fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", margin: "10px 0 6px" };
  const dateRangeGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
  const selectWrapper = { position: "relative" };
  const chevronStyle  = { position: "absolute", right: 12, top: 12, pointerEvents: "none" };

  return (
    <Modal onClose={onClose} wide={true}>

      {/* ── FIXED HEADER ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Manage Audits</h2>
              <p className="text-xs text-slate-500">
                {editing
                  ? "Edit audit"
                  : `${filtered.length} of ${audits.length} audits`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editing && (
              <button
                onClick={() => setEditing(null)}
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

        {/* Filter area — only in list view */}
        {!editing && (
          <div className="px-7 pt-4 pb-2">

            {/* 1. Showing audits for banner */}
            <ActiveFilterBanner
              allowedCodes={allowedCodes}
              fwMetaByCode={fwMetaByCode}
              isAllSelected={isAllSelected}
            />

            {/* 2. Framework pills — horizontal scroll, single row, no wrap */}
            <div
              style={{
                display: "flex",
                gap: 6,
                overflowX: "auto",
                overflowY: "hidden",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                paddingBottom: 4,
                marginBottom: 6,
                flexWrap: "nowrap",
              }}
            >
              <style>{`.fw-pill-scroll::-webkit-scrollbar{display:none}`}</style>

              {/* "All" pill */}
              <button
                onClick={() => setActiveFramework("All")}
                style={{
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "2px 6px",
                  borderRadius: 20,
                  border: activeFramework === "All" ? "1.5px solid #4f46e5" : "1.5px solid #e2e8f0",
                  background: activeFramework === "All" ? "#4f46e5" : "#f8fafc",
                  color: activeFramework === "All" ? "#fff" : "#475569",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  boxShadow: activeFramework === "All" ? "0 1px 4px rgba(79,70,229,0.25)" : "none",
                }}
              >
                All: {counts.All || 0}
              </button>

              {/* Per-framework pills */}
              {allowedCodes.map((code) => {
                const m       = fwMetaByCode[code] || { label: code, color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };
                const isActive = activeFramework === code;
                return (
                  <button
                    key={code}
                    onClick={() => setActiveFramework(isActive ? "All" : code)}
                    style={{
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      ...(isActive
                        ? {
                            background:  m.color,
                            color:       "#fff",
                            border:      `1.5px solid ${m.color}`,
                            boxShadow:   "0 1px 4px rgba(0,0,0,0.18)",
                          }
                        : {
                            background:  m.bg,
                            color:       m.color,
                            border:      `1.5px solid ${m.border}`,
                          }),
                    }}
                  >
                    {m.label}: {frameworkCounts[code] ?? 0}
                  </button>
                );
              })}
            </div>

            {/* 3. Status filter tabs — All, Open, Planned, In Progress, Completed */}
            <div className="flex gap-1.5 flex-wrap mb-3">
              {STATUS_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === key
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative mb-2">
              <Search size={14} color="#94a3b8" className="absolute left-3 top-[11px]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by type, status, POC..."
                style={{ ...inputStyle, paddingLeft: 36 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── SCROLLABLE BODY ───────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-7 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`div::-webkit-scrollbar{display:none}`}</style>

        {loading && <Spinner />}
        {error   && <p className="text-red-600 text-sm mt-2">{error}</p>}

        {/* ── LIST VIEW ─────────────────────────────────────────────────── */}
        {!editing && (
          <div className="space-y-2.5 mt-2">
            {filtered.map((audit) => {
              const resolved = resolveAuditBadge(audit);
              const fwMeta   = fwMetaByCode[audit.frameworkCode] || {
                label: audit.frameworkCode, color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0",
              };
              return (
                <div
                  key={audit.id}
                  className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: resolved.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {/* Status badge — "Open" shown in grey for null/empty status */}
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: resolved.bg, color: resolved.color }}
                      >
                        {resolved.label}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{audit.auditType}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: fwMeta.bg, color: fwMeta.color, border: `1px solid ${fwMeta.border}` }}>
                        {fwMeta.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mb-0.5">{audit.auditType} — {fwMeta.label}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                      <span>Opening: {formatDate(audit.openingMeetingDate)} · Closure: {formatDate(audit.closureMeetingDate)}</span>
                      <span>POC: {resolveAuditorName(audit.poc)} · Lead: {resolveAuditorName(audit.leadAuditor)}</span>
                      <span>{(audit.controls || []).length} controls · {(audit.findings || []).length} findings</span>
                    </div>
                  </div>
                  <button onClick={() => startEdit(audit)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0">
                    <Edit3 size={15} color="#94a3b8" />
                  </button>
                </div>
              );
            })}

            {!loading && filtered.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-12">
                {audits.length > 0
                  ? "No audits match the current filters."
                  : "No audits found."}
              </p>
            )}
          </div>
        )}

        {/* ── EDIT VIEW ─────────────────────────────────────────────────── */}
        {editing && (() => {
          const audit = audits.find((a) => a.id === editing);
          if (!audit) return null;
          return (
            <div className="mt-4">
              {/* Step tabs */}
              <div className="flex gap-2 mb-6">
                {[{ step: 1, label: "Audit Details" }, { step: 2, label: "Assign Controls" }].map(({ step: s, label }) => (
                  <button
                    key={s}
                    onClick={() => setEditStep(s)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${editStep === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                  >
                    <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0
                      ${editStep === s ? "bg-white text-indigo-600" : "bg-slate-300 text-white"}`}>
                      {s}
                    </span>
                    {label}
                  </button>
                ))}
              </div>

              {/* Step 1: Audit Details */}
              {editStep === 1 && (
                <div className="flex flex-col gap-3">
                  <div style={dateRangeGrid}>
                    <div>
                      <label style={labelStyle}>Audit Type</label>
                      <div style={selectWrapper}>
                        <select value={editBuf.auditType} onChange={(e) => setBuf("auditType", e.target.value)} style={selectStyle}>
                          <option value="">Select type...</option>
                          {["Internal", "External", "Certification", "Surveillance"].map((t) => <option key={t}>{t}</option>)}
                        </select>
                        <ChevronDown size={15} color="#94a3b8" style={chevronStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Framework</label>
                      <div style={selectWrapper}>
                        <select value={editBuf.frameworkCode} onChange={(e) => setBuf("frameworkCode", e.target.value)} style={selectStyle}>
                          {allowedCodes.map((code) => (
                            <option key={code} value={code}>
                              {fwMetaByCode[code]?.label || code}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={15} color="#94a3b8" style={chevronStyle} />
                      </div>
                    </div>
                  </div>

                  <div style={dateRangeGrid}>
                    <div>
                      <label style={labelStyle}>Lead Auditor</label>
                      <div style={selectWrapper}>
                        <select value={editBuf.leadAuditor} onChange={(e) => setBuf("leadAuditor", e.target.value)} style={selectStyle}>
                          <option value="">Select lead auditor...</option>
                          {auditors.map((a) => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
                        </select>
                        <ChevronDown size={15} color="#94a3b8" style={chevronStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Point of Contact</label>
                      <div style={selectWrapper}>
                        <select value={editBuf.poc} onChange={(e) => setBuf("poc", e.target.value)} style={selectStyle}>
                          <option value="">Select contact...</option>
                          {auditors.map((a) => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
                        </select>
                        <ChevronDown size={15} color="#94a3b8" style={chevronStyle} />
                      </div>
                    </div>
                  </div>

                  <div style={{ maxWidth: "50%" }}>
                    <label style={labelStyle}>Status</label>
                    <div style={selectWrapper}>
                      <select value={editBuf.status} onChange={(e) => setBuf("status", e.target.value)} style={selectStyle}>
                        {["PLANNED", "IN_PROGRESS", "COMPLETED"].map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={15} color="#94a3b8" style={chevronStyle} />
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #e2e8f0" }} />

                  <div>
                    <p style={phaseLabel}>Audit Opening Meeting</p>
                    <input type="date" value={editBuf.openingMeetingDate} onChange={(e) => setBuf("openingMeetingDate", e.target.value)} style={{ ...inputStyle, maxWidth: "50%" }} />
                  </div>
                  <div>
                    <p style={phaseLabel}>Stage 1 / Documentation Audit</p>
                    <div style={dateRangeGrid}>
                      <div><label style={labelStyle}>Start Date</label><input type="date" value={editBuf.stage1StartDate} min={editBuf.openingMeetingDate || undefined} max={editBuf.closureMeetingDate || undefined} onChange={(e) => setBuf("stage1StartDate", e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>End Date</label><input type="date" value={editBuf.stage1EndDate} min={editBuf.stage1StartDate || editBuf.openingMeetingDate || undefined} max={editBuf.closureMeetingDate || undefined} onChange={(e) => setBuf("stage1EndDate", e.target.value)} style={inputStyle} /></div>
                    </div>
                  </div>
                  <div>
                    <p style={phaseLabel}>Stage 2 / Practice Audit</p>
                    <div style={dateRangeGrid}>
                      <div><label style={labelStyle}>Start Date</label><input type="date" value={editBuf.stage2StartDate} min={editBuf.stage1EndDate || editBuf.openingMeetingDate || undefined} max={editBuf.closureMeetingDate || undefined} onChange={(e) => setBuf("stage2StartDate", e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>End Date</label><input type="date" value={editBuf.stage2EndDate} min={editBuf.stage2StartDate || editBuf.stage1EndDate || undefined} max={editBuf.closureMeetingDate || undefined} onChange={(e) => setBuf("stage2EndDate", e.target.value)} style={inputStyle} /></div>
                    </div>
                  </div>
                  <div>
                    <p style={phaseLabel}>Audit Reporting</p>
                    <div style={dateRangeGrid}>
                      <div><label style={labelStyle}>Start Date</label><input type="date" value={editBuf.reportingStartDate} min={editBuf.stage2EndDate || editBuf.openingMeetingDate || undefined} max={editBuf.closureMeetingDate || undefined} onChange={(e) => setBuf("reportingStartDate", e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>End Date</label><input type="date" value={editBuf.reportingEndDate} min={editBuf.reportingStartDate || editBuf.stage2EndDate || undefined} max={editBuf.closureMeetingDate || undefined} onChange={(e) => setBuf("reportingEndDate", e.target.value)} style={inputStyle} /></div>
                    </div>
                  </div>
                  <div>
                    <p style={phaseLabel}>Closure Meeting</p>
                    <input type="date" value={editBuf.closureMeetingDate} min={editBuf.reportingEndDate || editBuf.openingMeetingDate || undefined} onChange={(e) => setBuf("closureMeetingDate", e.target.value)} style={{ ...inputStyle, maxWidth: "50%" }} />
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button onClick={() => setEditStep(2)} className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-md transition-all">
                      Next: Assign Controls →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Assign Controls */}
              {editStep === 2 && (
                <div>
                  <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3.5 py-2.5 mb-4">
                    <Layers size={14} color="#3b82f6" />
                    <p className="text-xs font-semibold text-blue-700 m-0">
                      Assign auditors to each control, or use the section dropdown to bulk-assign.
                    </p>
                  </div>
                  {ctrlLoading && <Spinner />}
                  {ctrlError && <p className="text-red-600 text-sm">Could not load controls: {ctrlError}</p>}
                  <div className="flex flex-col gap-2.5">
                    {(() => {
                      const grouped = groupControls(apiControls);
                      return Object.keys(grouped).sort().map((category) => {
                        const catControlIds = [];
                        Object.values(grouped[category]).forEach((arr) => arr.forEach((c) => catControlIds.push(c.controlId)));
                        const assignedCount = catControlIds.filter((id) => {
                          const found = (editBuf.controls || []).find((c) => c.controlId === id);
                          return found && found.assignedTo;
                        }).length;
                        const sectionEligibleMap = {};
                        catControlIds.forEach((id) => eligibleAuditors(id).forEach((a) => { sectionEligibleMap[String(a._id || a.id)] = a; }));
                        const sectionEligible = Object.values(sectionEligibleMap);
                        return (
                          <div key={category} className="mb-4">
                            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-200 gap-2.5" style={{ borderRadius: expanded[category] ? "10px 10px 0 0" : 10 }}>
                              <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={() => toggleSection(category)}>
                                <ChevronRight size={14} className="flex-shrink-0 transition-transform duration-200" style={{ transform: expanded[category] ? "rotate(90deg)" : "rotate(0deg)" }} />
                                <span className="font-bold text-sm">{category}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${assignedCount === catControlIds.length ? "bg-green-200 text-green-800" : "bg-blue-100 text-blue-700"}`}>
                                  {assignedCount}/{catControlIds.length} assigned
                                </span>
                              </div>
                              <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={(() => {
                                    const vals = catControlIds.map((id) => { const f = (editBuf.controls || []).find((c) => c.controlId === id); return f ? f.assignedTo || "" : ""; });
                                    const allSame = vals.length > 0 && vals.every((v) => v !== "" && v === vals[0]);
                                    return allSame ? vals[0] : "";
                                  })()}
                                  onChange={(e) => assignSection(catControlIds, e.target.value)}
                                  className="text-xs py-1.5 pl-2 pr-6 rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer appearance-none min-w-36"
                                >
                                  <option value="" disabled>Assign whole section…</option>
                                  {sectionEligible.map((a) => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
                                </select>
                                <ChevronDown size={12} color="#94a3b8" className="absolute right-2 top-2 pointer-events-none" />
                              </div>
                            </div>
                            {expanded[category] && Object.keys(grouped[category]).sort().map((prefix) => (
                              <div key={prefix} className="mt-2">
                                <div className="text-xs font-semibold text-slate-500 mb-1.5 pl-1.5">Clause {prefix}</div>
                                {grouped[category][prefix].map((ctrl) => {
                                  const assignment    = (editBuf.controls || []).find((c) => c.controlId === ctrl.controlId) || {};
                                  const eligible      = eligibleAuditors(ctrl.controlId);
                                  const currentId     = assignment.assignedTo || "";
                                  const currentInList = !currentId || eligible.some((a) => String(a._id || a.id) === String(currentId));
                                  const currentAuditor = !currentInList ? auditors.find((a) => String(a._id || a.id) === String(currentId)) : null;
                                  return (
                                    <div key={ctrl.controlId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50 mb-1.5">
                                      <div className="flex-1">
                                        <div className="text-xs font-bold text-blue-600">{ctrl.clause}</div>
                                        <div className="text-xs text-slate-600">{ctrl.label}</div>
                                      </div>
                                      <select value={currentId} onChange={(e) => setAssignee(ctrl.controlId, e.target.value)} className="w-40 text-xs px-2 py-1.5 rounded-lg border border-slate-200">
                                        <option value="">Assign auditor...</option>
                                        {currentAuditor && <option value={String(currentAuditor._id || currentAuditor.id)}>{currentAuditor.name}</option>}
                                        {eligible.map((a) => <option key={a._id || a.id} value={a._id || a.id}>{a.name}</option>)}
                                      </select>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        );
                      });
                    })()}
                    {!ctrlLoading && apiControls.length === 0 && (
                      <p className="text-slate-400 text-sm text-center py-5">No controls found for {editBuf.frameworkCode}.</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                    <button onClick={() => setEditStep(1)} className="text-slate-500 text-sm font-semibold bg-none border-none cursor-pointer px-0 py-2 hover:text-slate-700 transition-colors">
                      ← Back
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(audit)} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow transition-all">
                        Save Changes
                      </button>
                      <button onClick={() => setEditing(null)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-all border-none cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </Modal>
  );
}

export default ManageAuditsModal;