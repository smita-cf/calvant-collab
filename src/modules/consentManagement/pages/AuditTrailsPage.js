// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { useHistory } from "react-router-dom";
// import {
//   GitBranch,
//   Search,
//   RefreshCw,
//   ArrowLeft,
//   X,
//   Calendar,
//   User,
//   Globe,
//   Info,
//   Activity,
//   Shield,
//   AlertTriangle,
//   CheckCircle2,
//   Eye,
// } from "lucide-react";
// import consentService from "../services/consentService";

// // ── Severity helpers ───────────────────────────────────────────────────────
// const SEVERITY_CONFIG = {
//   High:   { bg: "#fff5f5", color: "#c92a2a", dot: "#fa5252" },
//   Medium: { bg: "#fff9db", color: "#e67700", dot: "#f59f00" },
//   Low:    { bg: "#ebfbee", color: "#2f9e44", dot: "#40c057" },
// };

// const ACTION_ICONS = {
//   "Consent Granted":    { icon: CheckCircle2, color: "#2f9e44" },
//   "Consent Revoked":    { icon: X, color: "#c92a2a" },
//   "Consent Updated":    { icon: Activity, color: "#1971c2" },
//   "Consent Viewed":     { icon: Eye, color: "#7c5cbf" },
//   "Consent Expired":    { icon: AlertTriangle, color: "#e67700" },
//   "Preference Changed": { icon: Activity, color: "#0891b2" },
//   "Export Requested":   { icon: Info, color: "#475569" },
//   "Record Accessed":    { icon: Shield, color: "#0d9488" },
// };

// const COLUMNS = [
//   { key: "timestamp", label: "Timestamp",   width: 150 },
//   { key: "action",    label: "Action",       width: 180 },
//   { key: "subjectId", label: "Subject ID",   width: 120 },
//   { key: "actor",     label: "Actor",        width: 150 },
//   { key: "module",    label: "Module",       width: 130 },
//   { key: "severity",  label: "Severity",     width: 100 },
//   { key: "ipAddress", label: "IP Address",   width: 140 },
// ];

// function fmtDateTime(d) {
//   if (!d) return "—";
//   return new Date(d).toLocaleString("en-GB", {
//     day: "2-digit", month: "short", year: "numeric",
//     hour: "2-digit", minute: "2-digit",
//   });
// }

// // ── Detail Panel ───────────────────────────────────────────────────────────
// function AuditDetailPanel({ trail, onClose }) {
//   if (!trail) return null;
//   const sev = SEVERITY_CONFIG[trail.severity] || SEVERITY_CONFIG.Low;
//   const ActionMeta = ACTION_ICONS[trail.action] || { icon: Activity, color: "#475569" };
//   const ActionIcon = ActionMeta.icon;

//   return (
//     <div
//       style={{
//         position: "fixed", right: 0, top: 0, bottom: 0,
//         width: 420, zIndex: 50,
//         background: "#fff",
//         borderLeft: "1px solid #e2e8f0",
//         boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
//         display: "flex", flexDirection: "column",
//         overflowY: "auto",
//       }}
//     >
//       {/* Header */}
//       <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg,#f5f3ff,#f8fafc)" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//             <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
//               <GitBranch size={22} color="#fff" />
//             </div>
//             <div>
//               <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{trail.action}</div>
//               <div style={{ fontSize: 12, color: "#64748b" }}>{trail._id}</div>
//             </div>
//           </div>
//           <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#64748b" }}>
//             <X size={16} />
//           </button>
//         </div>
//         <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: sev.bg, color: sev.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
//           <div style={{ width: 6, height: 6, borderRadius: "50%", background: sev.dot }} />
//           {trail.severity} Severity
//         </div>
//       </div>

//       {/* Body */}
//       <div style={{ padding: "20px 24px", flex: 1 }}>
//         <Section label="Event Details">
//           <Row icon={<Activity size={14} />} label="Action" value={trail.action} />
//           <Row icon={<Info size={14} />} label="Module" value={trail.module} />
//           <Row icon={<Info size={14} />} label="Details" value={trail.details} />
//         </Section>

//         <Section label="Subject & Actor">
//           <Row icon={<User size={14} />} label="Subject ID" value={trail.subjectId} />
//           <Row icon={<User size={14} />} label="Actor" value={trail.actor} />
//           <Row icon={<Globe size={14} />} label="IP Address" value={trail.ipAddress} />
//         </Section>

//         <Section label="Timestamp">
//           <Row icon={<Calendar size={14} />} label="Time" value={fmtDateTime(trail.timestamp)} />
//           <Row icon={<Info size={14} />} label="Record ID" value={trail.recordId} />
//         </Section>

//         {trail.changes && (
//           <Section label="Changes">
//             <div style={{ background: "#f8fafc", borderRadius: 10, padding: 12, fontSize: 12, color: "#475569" }}>
//               <div><strong>Before:</strong> {trail.changes.before}</div>
//               <div style={{ marginTop: 4 }}><strong>After:</strong> {trail.changes.after}</div>
//             </div>
//           </Section>
//         )}
//       </div>
//     </div>
//   );
// }

// function Section({ label, children }) {
//   return (
//     <div style={{ marginBottom: 20 }}>
//       <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{label}</div>
//       <div style={{ background: "#f8fafc", borderRadius: 10, padding: "4px 0" }}>{children}</div>
//     </div>
//   );
// }

// function Row({ icon, label, value }) {
//   return (
//     <div style={{ display: "flex", alignItems: "flex-start", padding: "8px 12px", borderBottom: "1px solid #f1f5f9", gap: 10 }}>
//       <span style={{ color: "#94a3b8", marginTop: 2, flexShrink: 0 }}>{icon}</span>
//       <span style={{ fontSize: 12, color: "#94a3b8", width: 90, flexShrink: 0 }}>{label}</span>
//       <span style={{ fontSize: 13, color: "#334155", fontWeight: 500, flex: 1, wordBreak: "break-word" }}>{value || "—"}</span>
//     </div>
//   );
// }

// // ── Main Component ─────────────────────────────────────────────────────────
// const AuditTrailsPage = () => {
//   const history = useHistory();
//   const [trails, setTrails] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [severityFilter, setSeverityFilter] = useState("All");
//   const [selectedTrail, setSelectedTrail] = useState(null);
//   const [sortKey, setSortKey] = useState("timestamp");
//   const [sortDir, setSortDir] = useState("desc");

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const data = await consentService.getAllAuditTrails();
//       setTrails(Array.isArray(data) ? data : []);
//     } catch { setTrails([]); }
//     finally { setLoading(false); }
//   }, []);

//   useEffect(() => { load(); }, [load]);

//   const filtered = useMemo(() => {
//     let list = [...trails];
//     if (severityFilter !== "All") list = list.filter((t) => t.severity === severityFilter);
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       list = list.filter(
//         (t) =>
//           t.action?.toLowerCase().includes(q) ||
//           t.subjectId?.toLowerCase().includes(q) ||
//           t.actor?.toLowerCase().includes(q) ||
//           t.module?.toLowerCase().includes(q) ||
//           t.details?.toLowerCase().includes(q)
//       );
//     }
//     list.sort((a, b) => {
//       let av = a[sortKey] || "", bv = b[sortKey] || "";
//       if (sortDir === "desc") [av, bv] = [bv, av];
//       return String(av).localeCompare(String(bv));
//     });
//     return list;
//   }, [trails, search, severityFilter, sortKey, sortDir]);

//   const handleSort = (key) => {
//     if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
//     else { setSortKey(key); setSortDir("asc"); }
//   };

//   // ── Summary counters ──────────────────────────────────────────────────────
//   const summary = useMemo(() => ({
//     total: trails.length,
//     high: trails.filter((t) => t.severity === "High").length,
//     medium: trails.filter((t) => t.severity === "Medium").length,
//     low: trails.filter((t) => t.severity === "Low").length,
//   }), [trails]);

//   const totalWidth = COLUMNS.reduce((a, c) => a + c.width, 0);

//   return (
//     <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f5f3ff 0%,#f8fafc 60%,#eef2ff 100%)", padding: "24px 24px 80px" }}>
//       {/* Page Header */}
//       <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, background: "#fff", borderRadius: 16, padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
//         <button onClick={() => history.push("/consent-management")} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 13, fontWeight: 600 }}>
//           <ArrowLeft size={16} /> Back
//         </button>
//         <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
//           <GitBranch size={22} color="#fff" />
//         </div>
//         <div style={{ flex: 1 }}>
//           <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>Audit Trails</h1>
//           <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{filtered.length} of {trails.length} events</p>
//         </div>
//         <button onClick={load} style={{ background: "#f5f3ff", border: "1px solid #c4b5fd", borderRadius: 10, padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#4f46e5", fontSize: 13, fontWeight: 600 }}>
//           <RefreshCw size={14} /> Refresh
//         </button>
//       </div>

//       {/* Summary Cards */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
//         {[
//           { label: "Total Events", value: summary.total, color: "#4f46e5", bg: "#f5f3ff" },
//           { label: "High Severity", value: summary.high, color: "#c92a2a", bg: "#fff5f5" },
//           { label: "Medium Severity", value: summary.medium, color: "#e67700", bg: "#fff9db" },
//           { label: "Low Severity", value: summary.low, color: "#2f9e44", bg: "#ebfbee" },
//         ].map((c) => (
//           <div key={c.label} style={{ background: c.bg, border: `1.5px solid ${c.color}22`, borderRadius: 14, padding: "14px 18px" }}>
//             <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</div>
//             <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 2 }}>{c.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* Filter Bar */}
//       <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
//         <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
//           <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search by action, actor, module…"
//             style={{ width: "100%", paddingLeft: 36, paddingRight: 12, height: 38, border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#334155", outline: "none", background: "#fff", boxSizing: "border-box" }}
//           />
//         </div>

//         {["All", "High", "Medium", "Low"].map((s) => {
//           const active = severityFilter === s;
//           const cfg = SEVERITY_CONFIG[s];
//           return (
//             <button
//               key={s}
//               onClick={() => setSeverityFilter(s)}
//               style={{
//                 padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1.5px solid",
//                 background: active ? (cfg?.bg || "#e2e8f0") : "#fff",
//                 color: active ? (cfg?.color || "#1e293b") : "#64748b",
//                 borderColor: active ? (cfg?.dot || "#cbd5e1") : "#e2e8f0",
//                 transition: "all 0.15s",
//               }}
//             >
//               {s}
//             </button>
//           );
//         })}
//       </div>

//       {/* Table */}
//       <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
//         <div style={{ overflowX: "auto" }}>
//           <table style={{ width: Math.max(totalWidth, 900), borderCollapse: "collapse" }}>
//             <thead>
//               <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
//                 {COLUMNS.map((col) => (
//                   <th
//                     key={col.key}
//                     onClick={() => handleSort(col.key)}
//                     style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", width: col.width, whiteSpace: "nowrap", userSelect: "none" }}
//                   >
//                     {col.label}
//                     {sortKey === col.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={COLUMNS.length} style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>
//                     Loading audit trail events…
//                   </td>
//                 </tr>
//               ) : filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan={COLUMNS.length} style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>
//                     No events found
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((trail, idx) => {
//                   const sev = SEVERITY_CONFIG[trail.severity] || SEVERITY_CONFIG.Low;
//                   const ActionMeta = ACTION_ICONS[trail.action] || { icon: Activity, color: "#475569" };
//                   const ActionIcon = ActionMeta.icon;
//                   const isSelected = selectedTrail?._id === trail._id;

//                   return (
//                     <tr
//                       key={trail._id}
//                       onClick={() => setSelectedTrail(isSelected ? null : trail)}
//                       style={{
//                         background: isSelected ? "#f5f3ff" : idx % 2 === 0 ? "#fff" : "#fafafa",
//                         borderBottom: "1px solid #f1f5f9",
//                         cursor: "pointer",
//                         transition: "background 0.15s",
//                       }}
//                       onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
//                       onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa"; }}
//                     >
//                       <td style={{ padding: "11px 14px", fontSize: 11, color: "#64748b", fontFamily: "monospace", whiteSpace: "nowrap" }}>{fmtDateTime(trail.timestamp)}</td>
//                       <td style={{ padding: "11px 14px" }}>
//                         <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: ActionMeta.color }}>
//                           <ActionIcon size={13} />
//                           {trail.action}
//                         </span>
//                       </td>
//                       <td style={{ padding: "11px 14px", fontSize: 12, fontWeight: 700, color: "#4f46e5", fontFamily: "monospace" }}>{trail.subjectId}</td>
//                       <td style={{ padding: "11px 14px", fontSize: 12, color: "#334155", fontWeight: 500 }}>{trail.actor}</td>
//                       <td style={{ padding: "11px 14px" }}>
//                         <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{trail.module}</span>
//                       </td>
//                       <td style={{ padding: "11px 14px" }}>
//                         <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: sev.bg, color: sev.color, borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
//                           <div style={{ width: 5, height: 5, borderRadius: "50%", background: sev.dot }} />
//                           {trail.severity}
//                         </span>
//                       </td>
//                       <td style={{ padding: "11px 14px", fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{trail.ipAddress}</td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Detail Panel */}
//       {selectedTrail && (
//         <>
//           <div
//             onClick={() => setSelectedTrail(null)}
//             style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 49, backdropFilter: "blur(2px)" }}
//           />
//           <AuditDetailPanel trail={selectedTrail} onClose={() => setSelectedTrail(null)} />
//         </>
//       )}
//     </div>
//   );
// };

// export default AuditTrailsPage;

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
  GitBranch,
  Search,
  RefreshCw,
  ArrowLeft,
  X,
  Calendar,
  User,
  Globe,
  Info,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Eye,
  RotateCcw,
  Building2,
} from "lucide-react";
import consentService from "../services/consentService";

// ── Severity config ────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  High:   { bg: "#fff5f5", color: "#c92a2a", dot: "#fa5252" },
  Medium: { bg: "#fff9db", color: "#e67700", dot: "#f59f00" },
  Low:    { bg: "#ebfbee", color: "#2f9e44", dot: "#40c057" },
};

const ACTION_ICONS = {
  "Consent Granted":    { icon: CheckCircle2, color: "#2f9e44" },
  "Consent Revoked":    { icon: X,            color: "#c92a2a" },
  "Consent Updated":    { icon: Activity,     color: "#1971c2" },
  "Consent Viewed":     { icon: Eye,          color: "#7c5cbf" },
  "Consent Expired":    { icon: AlertTriangle, color: "#e67700" },
  "Preference Changed": { icon: Activity,     color: "#0891b2" },
  "Export Requested":   { icon: Info,         color: "#475569" },
  "Record Accessed":    { icon: Shield,       color: "#0d9488" },
};

const COLUMNS = [
  { key: "timestamp", label: "Timestamp",  width: 150 },
  { key: "action",    label: "Action",     width: 180 },
  { key: "subjectId", label: "Subject ID", width: 130 },
  { key: "actor",     label: "Actor",      width: 150 },
  { key: "module",    label: "Module",     width: 130 },
  { key: "severity",  label: "Severity",   width: 100 },
  { key: "ipAddress", label: "IP Address", width: 140 },
];

function fmtDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Detail Panel ───────────────────────────────────────────────────────────
function AuditDetailPanel({ trail, onClose }) {
  if (!trail) return null;
  const sev = SEVERITY_CONFIG[trail.severity] || SEVERITY_CONFIG.Low;
  const ActionMeta = ACTION_ICONS[trail.action] || { icon: Activity, color: "#475569" };
  const ActionIcon = ActionMeta.icon;

  return (
    <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 420, zIndex: 50, background: "#fff", borderLeft: "1px solid #e2e8f0", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg,#f5f3ff,#f8fafc)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GitBranch size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{trail.action}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{trail._id}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#64748b" }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: sev.bg, color: sev.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: sev.dot }} />
          {trail.severity} Severity
        </div>
      </div>

      <div style={{ padding: "20px 24px", flex: 1 }}>
        <Section label="Event Details">
          <Row icon={<Activity size={14} />} label="Action"  value={trail.action}  />
          <Row icon={<Info size={14} />}     label="Module"  value={trail.module}  />
          <Row icon={<Info size={14} />}     label="Details" value={trail.details} />
        </Section>
        <Section label="Subject & Actor">
          <Row icon={<User size={14} />}  label="Subject ID" value={trail.subjectId} />
          <Row icon={<User size={14} />}  label="Actor"      value={trail.actor}     />
          <Row icon={<Globe size={14} />} label="IP Address" value={trail.ipAddress} />
        </Section>
        <Section label="Timestamp">
          <Row icon={<Calendar size={14} />} label="Time"      value={fmtDateTime(trail.timestamp)} />
          <Row icon={<Info size={14} />}     label="Record ID" value={trail.recordId}               />
        </Section>
        {trail.changes && (
          <Section label="Changes">
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 12, fontSize: 12, color: "#475569" }}>
              <div><strong>Before:</strong> {trail.changes.before}</div>
              <div style={{ marginTop: 4 }}><strong>After:</strong> {trail.changes.after}</div>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{label}</div>
      <div style={{ background: "#f8fafc", borderRadius: 10, padding: "4px 0" }}>{children}</div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", padding: "8px 12px", borderBottom: "1px solid #f1f5f9", gap: 10 }}>
      <span style={{ color: "#94a3b8", marginTop: 2, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 12, color: "#94a3b8", width: 90, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#334155", fontWeight: 500, flex: 1, wordBreak: "break-word" }}>{value || "—"}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
const AuditTrailsPage = () => {
  const history = useHistory();
  const token   = sessionStorage.getItem("token") || "";

  // ── User audit search state (company + user ref) ──────────────────────
  const [clients, setClients]             = useState([]);
  const [auditClientId, setAuditClientId] = useState("");
  const [auditUserRef, setAuditUserRef]   = useState("");
  const [auditLoading, setAuditLoading]   = useState(false);
  const [auditFetched, setAuditFetched]   = useState(false);

  // ── All-trails state (bulk load for the table) ─────────────────────────
  const [trails, setTrails]               = useState([]);
  const [loading, setLoading]             = useState(false);
  const [loadedAll, setLoadedAll]         = useState(false);

  // ── Shared filter + sort state ─────────────────────────────────────────
  const [search, setSearch]               = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [sortKey, setSortKey]             = useState("timestamp");
  const [sortDir, setSortDir]             = useState("desc");

  // ── Load clients for dropdown ─────────────────────────────────────────
  const loadClients = useCallback(async () => {
    try {
      const data = await consentService.listClients(token);
      setClients(Array.isArray(data) ? data : data?.clients ?? []);
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => { loadClients(); }, [loadClients]);

  // ── Fetch user audit history (company + user ref) ─────────────────────
  const fetchUserAudit = async () => {
    if (!auditClientId || !auditUserRef.trim()) return;
    setAuditLoading(true);
    setAuditFetched(false);
    setTrails([]);
    try {
      const data = await consentService.getUserAuditHistory(token, auditClientId, auditUserRef.trim());
      const entries = Array.isArray(data) ? data : data?.history ?? [];
      // Map to display shape
      const mapped = entries.map((h, i) => ({
        _id:       h._id ?? `h${i}`,
        recordId:  h.consentRecordId ?? h.recordId ?? "—",
        subjectId: auditUserRef,
        action:    mapAction(h.status ?? h.action),
        actor:     h.actor     ?? h.changedBy ?? "System",
        module:    h.module    ?? h.origin    ?? "Consent Portal",
        severity:  mapSeverity(h.status ?? h.action),
        ipAddress: h.ipAddress ?? "—",
        timestamp: h.changedAt ?? h.createdAt ?? h.timestamp,
        details:   h.details   ?? `${mapAction(h.status)} for ${auditUserRef}`,
        changes:   h.changes   ?? null,
      }));
      setTrails(mapped);
      setAuditFetched(true);
    } catch {
      setTrails([]);
      setAuditFetched(true);
    } finally {
      setAuditLoading(false);
    }
  };

  // ── Load all trails (bulk, for browsing) ─────────────────────────────
  const loadAllTrails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await consentService.getAllAuditTrails();
      setTrails(Array.isArray(data) ? data : []);
      setLoadedAll(true);
      setAuditFetched(false);
    } catch { setTrails([]); }
    finally { setLoading(false); }
  }, []);

  // ── Filter + sort ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...trails];
    if (severityFilter !== "All") list = list.filter((t) => t.severity === severityFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        (t.action    ?? "").toLowerCase().includes(q) ||
        (t.subjectId ?? "").toLowerCase().includes(q) ||
        (t.actor     ?? "").toLowerCase().includes(q) ||
        (t.module    ?? "").toLowerCase().includes(q) ||
        (t.details   ?? "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let av = a[sortKey] || "", bv = b[sortKey] || "";
      if (sortDir === "desc") [av, bv] = [bv, av];
      return String(av).localeCompare(String(bv));
    });
    return list;
  }, [trails, search, severityFilter, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const summary = useMemo(() => ({
    total:  trails.length,
    high:   trails.filter((t) => t.severity === "High").length,
    medium: trails.filter((t) => t.severity === "Medium").length,
    low:    trails.filter((t) => t.severity === "Low").length,
  }), [trails]);

  const totalWidth = COLUMNS.reduce((a, c) => a + c.width, 0);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f5f3ff 0%,#f8fafc 60%,#eef2ff 100%)", padding: "24px 24px 80px" }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, background: "#fff", borderRadius: 16, padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
        <button onClick={() => history.push("/consent-management")} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <GitBranch size={22} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>Audit Trails</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{filtered.length} of {trails.length} events</p>
        </div>
      </div>

      {/* ── User Audit Search Card ── */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#4f46e5,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>Search by User</span>
        </div>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
          View the complete consent audit trail for a specific user across a client.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>

          {/* Company / Client dropdown */}
          <div style={{ flex: "0 0 220px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <Building2 size={11} style={{ display: "inline", marginRight: 4 }} />
              Company / Client
            </label>
            <select
              value={auditClientId}
              onChange={(e) => setAuditClientId(e.target.value)}
              style={{ width: "100%", height: 40, border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#334155", padding: "0 12px", background: "#fff", outline: "none" }}
            >
              <option value="">— Select company —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* End User Ref input */}
          <div style={{ flex: "0 0 260px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <User size={11} style={{ display: "inline", marginRight: 4 }} />
              End User Ref
            </label>
            <div style={{ position: "relative" }}>
              <User size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                value={auditUserRef}
                onChange={(e) => setAuditUserRef(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUserAudit()}
                placeholder="e.g. user-ref-abc123"
                style={{ width: "100%", paddingLeft: 36, paddingRight: 12, height: 40, border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#334155", outline: "none", background: "#fff", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Fetch button */}
          <button
            onClick={fetchUserAudit}
            disabled={auditLoading || !auditClientId || !auditUserRef.trim()}
            style={{ height: 40, padding: "0 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4f46e5,#6366f1)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: (!auditClientId || !auditUserRef.trim()) ? 0.5 : 1 }}
          >
            {auditLoading ? (
              <div style={{ width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            ) : <Search size={14} />}
            {auditLoading ? "Loading…" : "Fetch History"}
          </button>

          {/* Divider */}
          <div style={{ height: 40, width: 1, background: "#e2e8f0", margin: "0 4px" }} />

          {/* Load all button */}
          <button
            onClick={loadAllTrails}
            disabled={loading}
            style={{ height: 40, padding: "0 16px", borderRadius: 10, border: "1.5px solid #c4b5fd", background: "#f5f3ff", color: "#4f46e5", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={13} style={{ animation: loading ? "spin 0.7s linear infinite" : "none" }} />
            Load All Trails
          </button>

          {/* Reset */}
          {(auditFetched || loadedAll) && (
            <button
              onClick={() => { setTrails([]); setAuditFetched(false); setLoadedAll(false); setAuditClientId(""); setAuditUserRef(""); setSearch(""); setSeverityFilter("All"); }}
              style={{ height: 40, padding: "0 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <RotateCcw size={13} /> Clear
            </button>
          )}
        </div>

        {/* Context label */}
        {auditFetched && (
          <div style={{ marginTop: 12, padding: "8px 14px", background: "#f5f3ff", borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4f46e5", fontWeight: 600 }}>
            <User size={13} />
            Showing audit trail for: <span style={{ fontFamily: "monospace" }}>{auditUserRef}</span>
            &nbsp;·&nbsp;
            {clients.find(c => c.id === auditClientId)?.name ?? auditClientId}
          </div>
        )}
      </div>

      {/* ── Summary Cards (only when data loaded) ── */}
      {trails.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Total Events",    value: summary.total,  color: "#4f46e5", bg: "#f5f3ff" },
            { label: "High Severity",   value: summary.high,   color: "#c92a2a", bg: "#fff5f5" },
            { label: "Medium Severity", value: summary.medium, color: "#e67700", bg: "#fff9db" },
            { label: "Low Severity",    value: summary.low,    color: "#2f9e44", bg: "#ebfbee" },
          ].map((c) => (
            <div key={c.label} style={{ background: c.bg, border: `1.5px solid ${c.color}22`, borderRadius: 14, padding: "14px 18px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter Bar (only when data loaded) ── */}
      {trails.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by action, actor, module…"
              style={{ width: "100%", paddingLeft: 36, paddingRight: 12, height: 38, border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#334155", outline: "none", background: "#fff", boxSizing: "border-box" }}
            />
          </div>
          {["All", "High", "Medium", "Low"].map((s) => {
            const active = severityFilter === s;
            const cfg = SEVERITY_CONFIG[s];
            return (
              <button key={s} onClick={() => setSeverityFilter(s)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1.5px solid", background: active ? (cfg?.bg || "#e2e8f0") : "#fff", color: active ? (cfg?.color || "#1e293b") : "#64748b", borderColor: active ? (cfg?.dot || "#cbd5e1") : "#e2e8f0", transition: "all 0.15s" }}>
                {s}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Empty state ── */}
      {!auditFetched && !loadedAll && trails.length === 0 && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 60, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <GitBranch size={40} style={{ color: "#c4b5fd", marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "#475569", marginBottom: 6 }}>No audit data loaded</p>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>Search by user ref above, or click "Load All Trails" to browse all events.</p>
        </div>
      )}

      {/* ── Table ── */}
      {trails.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: Math.max(totalWidth, 900), borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
                  {COLUMNS.map((col) => (
                    <th key={col.key} onClick={() => handleSort(col.key)} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", width: col.width, whiteSpace: "nowrap", userSelect: "none" }}>
                      {col.label}{sortKey === col.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={COLUMNS.length} style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>Loading audit trail events…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={COLUMNS.length} style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>No events match the current filters</td></tr>
                ) : (
                  filtered.map((trail, idx) => {
                    const sev = SEVERITY_CONFIG[trail.severity] || SEVERITY_CONFIG.Low;
                    const ActionMeta = ACTION_ICONS[trail.action] || { icon: Activity, color: "#475569" };
                    const ActionIcon = ActionMeta.icon;
                    const isSelected = selectedTrail?._id === trail._id;
                    return (
                      <tr
                        key={trail._id ?? idx}
                        onClick={() => setSelectedTrail(isSelected ? null : trail)}
                        style={{ background: isSelected ? "#f5f3ff" : idx % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa"; }}
                      >
                        <td style={{ padding: "11px 14px", fontSize: 11, color: "#64748b", fontFamily: "monospace", whiteSpace: "nowrap" }}>{fmtDateTime(trail.timestamp)}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: ActionMeta.color }}>
                            <ActionIcon size={13} />{trail.action}
                          </span>
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 12, fontWeight: 700, color: "#4f46e5", fontFamily: "monospace" }}>{trail.subjectId}</td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: "#334155", fontWeight: 500 }}>{trail.actor}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{trail.module}</span>
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: sev.bg, color: sev.color, borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: sev.dot }} />
                            {trail.severity}
                          </span>
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{trail.ipAddress}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Detail Panel ── */}
      {selectedTrail && (
        <>
          <div onClick={() => setSelectedTrail(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 49, backdropFilter: "blur(2px)" }} />
          <AuditDetailPanel trail={selectedTrail} onClose={() => setSelectedTrail(null)} />
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── Field mapping helpers (same as consentService) ─────────────────────────
function mapAction(s) {
  if (!s) return "Record Accessed";
  switch (s.toUpperCase()) {
    case "GIVEN":     return "Consent Granted";
    case "WITHDRAWN": return "Consent Revoked";
    case "EXPIRED":   return "Consent Expired";
    case "UPDATED":   return "Consent Updated";
    default:          return s;
  }
}

function mapSeverity(s) {
  if (!s) return "Low";
  const u = s.toUpperCase();
  if (["WITHDRAWN", "EXPIRED"].includes(u)) return "High";
  if (["UPDATED"].includes(u)) return "Medium";
  return "Low";
}

export default AuditTrailsPage;