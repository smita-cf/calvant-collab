// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { useHistory } from "react-router-dom";
// import {
//   ShieldCheck,
//   Search,
//   RefreshCw,
//   X,
//   User,
//   Mail,
//   Globe,
//   Calendar,
//   Info,
//   ArrowLeft,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   AlertCircle,
//   Download,
//   History,
//   RotateCcw,
// } from "lucide-react";
// import consentService from "../services/consentService";

// // ── Status helpers ─────────────────────────────────────────────────────────
// const STATUS_CONFIG = {
//   Active:   { bg: "#ebfbee", color: "#2f9e44", dot: "#40c057", Icon: CheckCircle2 },
//   Revoked:  { bg: "#fff5f5", color: "#c92a2a", dot: "#fa5252", Icon: XCircle },
//   Expired:  { bg: "#fff9db", color: "#e67700", dot: "#f59f00", Icon: Clock },
//   Pending:  { bg: "#f3f0ff", color: "#5f3dc4", dot: "#7c5cbf", Icon: AlertCircle },
// };

// const COLUMNS = [
//   { key: "subjectId",       label: "Subject ID",   width: 120 },
//   { key: "subjectName",     label: "Name",         width: 160 },
//   { key: "purpose",         label: "Purpose",      width: 200 },
//   { key: "status",          label: "Status",       width: 110 },
//   { key: "channel",         label: "Channel",      width: 120 },
//   { key: "legalBasis",      label: "Legal Basis",  width: 150 },
//   { key: "consentVersion",  label: "Version",      width: 90  },
//   { key: "createdAt",       label: "Created",      width: 110 },
//   { key: "expiresAt",       label: "Expires",      width: 110 },
// ];

// const EMPTY_FILTERS = { clientId: "", status: "", search: "" };

// function fmtDate(d) {
//   if (!d) return "—";
//   return new Date(d).toLocaleDateString("en-GB", {
//     day: "2-digit", month: "short", year: "numeric",
//   });
// }

// // ── Detail Panel ───────────────────────────────────────────────────────────
// function ConsentDetailPanel({ record, onClose }) {
//   if (!record) return null;
//   const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.Active;

//   return (
//     <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 420, zIndex: 50, background: "#fff", borderLeft: "1px solid #e2e8f0", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
//       {/* Header */}
//       <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg,#f0fdfa,#f8fafc)" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//             <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#0d9488,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
//               <ShieldCheck size={22} color="#fff" />
//             </div>
//             <div>
//               <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{record.subjectName}</div>
//               <div style={{ fontSize: 12, color: "#64748b" }}>{record.subjectId}</div>
//             </div>
//           </div>
//           <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#64748b" }}>
//             <X size={16} />
//           </button>
//         </div>
//         <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: cfg.bg, color: cfg.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
//           <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
//           {record.status}
//         </div>
//       </div>

//       {/* Body */}
//       <div style={{ padding: "20px 24px", flex: 1 }}>
//         <Section label="Consent Details">
//           <Row icon={<Info size={14} />} label="Purpose" value={record.purpose} />
//           <Row icon={<Globe size={14} />} label="Channel" value={record.channel} />
//           <Row icon={<ShieldCheck size={14} />} label="Legal Basis" value={record.legalBasis} />
//           <Row icon={<Info size={14} />} label="Version" value={record.consentVersion} />
//         </Section>
//         <Section label="Data Subject">
//           <Row icon={<User size={14} />} label="Name" value={record.subjectName} />
//           <Row icon={<Mail size={14} />} label="Email" value={record.subjectEmail} />
//           <Row icon={<Globe size={14} />} label="IP Address" value={record.ipAddress} />
//         </Section>
//         <Section label="Timeline">
//           <Row icon={<Calendar size={14} />} label="Created" value={fmtDate(record.createdAt)} />
//           <Row icon={<Calendar size={14} />} label="Updated" value={fmtDate(record.updatedAt)} />
//           <Row icon={<Calendar size={14} />} label="Expires" value={fmtDate(record.expiresAt)} />
//         </Section>
//       </div>

//       {/* Footer */}
//       <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
//         {record.status === "Active" && (
//           <button style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #fca5a5", background: "#fff5f5", color: "#c92a2a", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
//             Revoke Consent
//           </button>
//         )}
//         <button style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
//           <Download size={14} /> Export
//         </button>
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
// const ConsentRecordsPage = () => {
//   const history = useHistory();
//   const token = sessionStorage.getItem("token") || "";

//   const [clients, setClients]           = useState([]);
//   const [records, setRecords]           = useState([]);
//   const [loading, setLoading]           = useState(true);
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const [sortKey, setSortKey]           = useState("createdAt");
//   const [sortDir, setSortDir]           = useState("desc");

//   // ── Filters — same pattern as working ConsentDashboard ──────────────────
//   const [filters, setFilters]           = useState(EMPTY_FILTERS);
//   const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);

//   // ── Load clients for the organisation dropdown ───────────────────────────
//   const loadClients = useCallback(async () => {
//     try {
//       const data = await consentService.listClients(token);
//       setClients(Array.isArray(data) ? data : data?.clients ?? []);
//     } catch { /* silent */ }
//   }, [token]);

//   // ── Load records: all clients → consents per client → merge ─────────────
//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       let clientList = clients;
//       if (clientList.length === 0) {
//         const data = await consentService.listClients(token);
//         clientList = Array.isArray(data) ? data : data?.clients ?? [];
//         setClients(clientList);
//       }
//       const activeClients = clientList.filter((c) => c.active !== false);
//       const results = await Promise.all(
//         activeClients.map((c) =>
//           consentService.listConsents(token, c.id).catch(() => null)
//         )
//       );
//       // Attach clientId to each record so filtering works
//       const merged = results.flatMap((r, i) => {
//         const rows = Array.isArray(r) ? r : r?.consents ?? [];
//         return rows.map((rec) => ({ ...rec, clientId: activeClients[i].id }));
//       });
//       setRecords(merged);
//     } catch (e) {
//       console.error("Failed to load consent records:", e);
//     } finally {
//       setLoading(false);
//     }
//   }, [token, clients]);

//   useEffect(() => { loadClients(); }, [loadClients]);
//   useEffect(() => { load(); }, [load]);

//   const applyFilters = () => setActiveFilters({ ...filters });
//   const resetFilters = () => { setFilters(EMPTY_FILTERS); setActiveFilters(EMPTY_FILTERS); };

//   const clientName = (id) => clients.find((c) => c.id === id)?.name ?? id ?? "—";

//   // ── Filter + sort ────────────────────────────────────────────────────────
//   const filtered = useMemo(() => {
//     let list = [...records];

//     // Organisation / client filter (dropdown)
//     if (activeFilters.clientId) {
//       list = list.filter((r) => r.clientId === activeFilters.clientId);
//     }

//     // Status filter
//     if (activeFilters.status) {
//       list = list.filter((r) =>
//         (r.status ?? "").toUpperCase() === activeFilters.status.toUpperCase()
//       );
//     }

//     // Text search — subject name, ref, purpose, email
//     if (activeFilters.search.trim()) {
//       const q = activeFilters.search.toLowerCase();
//       list = list.filter(
//         (r) =>
//           (r.subjectName ?? r.endUserRef ?? "").toLowerCase().includes(q) ||
//           (r.subjectId  ?? r.endUserRef ?? "").toLowerCase().includes(q) ||
//           (r.endUserRef ?? "").toLowerCase().includes(q) ||
//           (r.purpose ?? r.consentDefinitionId ?? "").toLowerCase().includes(q) ||
//           (r.subjectEmail ?? "").toLowerCase().includes(q)
//       );
//     }

//     // Sort
//     list.sort((a, b) => {
//       let av = a[sortKey] || "", bv = b[sortKey] || "";
//       if (sortDir === "desc") [av, bv] = [bv, av];
//       return String(av).localeCompare(String(bv));
//     });

//     return list;
//   }, [records, activeFilters, sortKey, sortDir]);

//   const handleSort = (key) => {
//     if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
//     else { setSortKey(key); setSortDir("asc"); }
//   };

//   const totalWidth = COLUMNS.reduce((a, c) => a + c.width, 0);

//   return (
//     <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0fdfa 0%,#f8fafc 60%,#eef2ff 100%)", padding: "24px 24px 80px" }}>

//       {/* ── Page Header ── */}
//       <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, background: "#fff", borderRadius: 16, padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
//         <button onClick={() => history.push("/consent-management")} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 13, fontWeight: 600 }}>
//           <ArrowLeft size={16} /> Back
//         </button>
//         <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#0d9488,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
//           <ShieldCheck size={22} color="#fff" />
//         </div>
//         <div style={{ flex: 1 }}>
//           <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>Consent Records</h1>
//           <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{filtered.length} of {records.length} records</p>
//         </div>
//         <button onClick={load} style={{ background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 10, padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#0f766e", fontSize: 13, fontWeight: 600 }}>
//           <RefreshCw size={14} /> Refresh
//         </button>
//       </div>

//       {/* ── Filter Bar — same pattern as working ConsentDashboard ── */}
//       <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "16px 20px", marginBottom: 16 }}>
//         <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>

//           {/* Organisation / Client dropdown */}
//           <div style={{ flex: "0 0 200px" }}>
//             <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Organisation</label>
//             <select
//               value={filters.clientId}
//               onChange={(e) => setFilters((f) => ({ ...f, clientId: e.target.value }))}
//               style={{ width: "100%", height: 38, border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#334155", padding: "0 10px", background: "#fff", outline: "none" }}
//             >
//               <option value="">All organisations</option>
//               {clients.map((c) => (
//                 <option key={c.id} value={c.id}>{c.name}</option>
//               ))}
//             </select>
//           </div>

//           {/* Status dropdown */}
//           <div style={{ flex: "0 0 160px" }}>
//             <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</label>
//             <select
//               value={filters.status}
//               onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
//               style={{ width: "100%", height: 38, border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#334155", padding: "0 10px", background: "#fff", outline: "none" }}
//             >
//               <option value="">All statuses</option>
//               <option value="GIVEN">GIVEN</option>
//               <option value="WITHDRAWN">WITHDRAWN</option>
//               <option value="EXPIRED">EXPIRED</option>
//             </select>
//           </div>

//           {/* Text search */}
//           <div style={{ flex: 1, minWidth: 220 }}>
//             <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Search</label>
//             <div style={{ position: "relative" }}>
//               <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
//               <input
//                 value={filters.search}
//                 onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
//                 onKeyDown={(e) => e.key === "Enter" && applyFilters()}
//                 placeholder="Search by name, ID, purpose…"
//                 style={{ width: "100%", paddingLeft: 36, paddingRight: 12, height: 38, border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#334155", outline: "none", background: "#fff", boxSizing: "border-box" }}
//               />
//             </div>
//           </div>

//           {/* Apply */}
//           <button
//             onClick={applyFilters}
//             style={{ height: 38, padding: "0 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
//           >
//             <Search size={14} /> Apply
//           </button>

//           {/* Reset */}
//           {Object.values(activeFilters).some(Boolean) && (
//             <button
//               onClick={resetFilters}
//               style={{ height: 38, padding: "0 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
//             >
//               <RotateCcw size={13} /> Reset
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ── Table ── */}
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
//                     {col.label}{sortKey === col.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr><td colSpan={COLUMNS.length} style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>Loading consent records…</td></tr>
//               ) : filtered.length === 0 ? (
//                 <tr><td colSpan={COLUMNS.length} style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>No records found</td></tr>
//               ) : (
//                 filtered.map((record, idx) => {
//                   const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.Active;
//                   const isSelected = selectedRecord?._id === record._id;
//                   return (
//                     <tr
//                       key={record._id ?? record.id ?? idx}
//                       onClick={() => setSelectedRecord(isSelected ? null : record)}
//                       style={{ background: isSelected ? "#f0fdfa" : idx % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }}
//                       onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
//                       onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa"; }}
//                     >
//                       <td style={{ padding: "11px 14px", fontSize: 12, fontWeight: 700, color: "#0f766e", fontFamily: "monospace" }}>{record.subjectId ?? record.endUserRef}</td>
//                       <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{record.subjectName ?? record.endUserRef}</td>
//                       <td style={{ padding: "11px 14px", fontSize: 12, color: "#475569", maxWidth: 200 }}>
//                         <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={record.purpose ?? record.consentDefinitionId}>{record.purpose ?? record.consentDefinitionId}</span>
//                       </td>
//                       <td style={{ padding: "11px 14px" }}>
//                         <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: cfg.bg, color: cfg.color, borderRadius: 16, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
//                           <div style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot }} />
//                           {record.status}
//                         </span>
//                       </td>
//                       <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{record.channel ?? record.origin ?? "—"}</td>
//                       <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{record.legalBasis ?? "—"}</td>
//                       <td style={{ padding: "11px 14px" }}>
//                         <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{record.consentVersion ?? record.formId ?? "—"}</span>
//                       </td>
//                       <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{fmtDate(record.createdAt)}</td>
//                       <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{fmtDate(record.expiresAt)}</td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* ── Detail Panel ── */}
//       {selectedRecord && (
//         <>
//           <div onClick={() => setSelectedRecord(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 49, backdropFilter: "blur(2px)" }} />
//           <ConsentDetailPanel record={selectedRecord} onClose={() => setSelectedRecord(null)} />
//         </>
//       )}
//     </div>
//   );
// };

// export default ConsentRecordsPage;

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  X,
  User,
  Mail,
  Globe,
  Calendar,
  Info,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  RotateCcw,
} from "lucide-react";
import consentService from "../services/consentService";

// ── Status config — mapped to actual backend values ────────────────────────
const STATUS_CONFIG = {
  // Backend values (GIVEN / WITHDRAWN / EXPIRED)
  GIVEN:     { bg: "#ebfbee", color: "#2f9e44", dot: "#40c057", label: "GIVEN"     },
  WITHDRAWN: { bg: "#fff5f5", color: "#c92a2a", dot: "#fa5252", label: "WITHDRAWN" },
  EXPIRED:   { bg: "#fff9db", color: "#e67700", dot: "#f59f00", label: "EXPIRED"   },
  // Mapped display values (from consentService.mapStatus)
  Active:    { bg: "#ebfbee", color: "#2f9e44", dot: "#40c057", label: "Active"    },
  Revoked:   { bg: "#fff5f5", color: "#c92a2a", dot: "#fa5252", label: "Revoked"   },
  Expired:   { bg: "#fff9db", color: "#e67700", dot: "#f59f00", label: "Expired"   },
  Pending:   { bg: "#f3f0ff", color: "#5f3dc4", dot: "#7c5cbf", label: "Pending"   },
};

const STATUS_OPTIONS = ["All", "GIVEN", "WITHDRAWN", "EXPIRED"];

const COLUMNS = [
  { key: "subjectId",       label: "Subject ID",   width: 140 },
  { key: "subjectName",     label: "Name",         width: 160 },
  { key: "purpose",         label: "Purpose",      width: 200 },
  { key: "status",          label: "Status",       width: 120 },
  { key: "channel",         label: "Channel",      width: 120 },
  { key: "legalBasis",      label: "Legal Basis",  width: 150 },
  { key: "consentVersion",  label: "Version",      width: 90  },
  { key: "createdAt",       label: "Created",      width: 120 },
  { key: "expiresAt",       label: "Expires",      width: 120 },
];

const EMPTY_FILTERS = { clientId: "", status: "", search: "" };

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8", label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      borderRadius: 16, padding: "3px 10px",
      fontSize: 11, fontWeight: 700,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ── Detail Panel ───────────────────────────────────────────────────────────
function ConsentDetailPanel({ record, onClose }) {
  if (!record) return null;
  const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.Active;

  return (
    <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 420, zIndex: 50, background: "#fff", borderLeft: "1px solid #e2e8f0", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(135deg,#f0fdfa,#f8fafc)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#0d9488,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{record.subjectName}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{record.subjectId}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#64748b" }}>
            <X size={16} />
          </button>
        </div>
        <StatusBadge status={record.status} />
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px", flex: 1 }}>
        <Section label="Consent Details">
          <Row icon={<Info size={14} />}      label="Purpose"    value={record.purpose} />
          <Row icon={<Globe size={14} />}     label="Channel"    value={record.channel} />
          <Row icon={<ShieldCheck size={14} />} label="Legal Basis" value={record.legalBasis} />
          <Row icon={<Info size={14} />}      label="Version"    value={record.consentVersion} />
        </Section>
        <Section label="Data Subject">
          <Row icon={<User size={14} />}  label="Name"       value={record.subjectName} />
          <Row icon={<Mail size={14} />}  label="Email"      value={record.subjectEmail} />
          <Row icon={<Globe size={14} />} label="IP Address" value={record.ipAddress} />
        </Section>
        <Section label="Timeline">
          <Row icon={<Calendar size={14} />} label="Created" value={fmtDate(record.createdAt)} />
          <Row icon={<Calendar size={14} />} label="Updated" value={fmtDate(record.updatedAt)} />
          <Row icon={<Calendar size={14} />} label="Expires" value={fmtDate(record.expiresAt)} />
        </Section>
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
        <button style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Download size={14} /> Export
        </button>
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
const ConsentRecordsPage = () => {
  const history = useHistory();
  const token   = sessionStorage.getItem("token") || "";

  const [clients, setClients]               = useState([]);
  const [records, setRecords]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [sortKey, setSortKey]               = useState("createdAt");
  const [sortDir, setSortDir]               = useState("desc");
  const [filters, setFilters]               = useState(EMPTY_FILTERS);
  const [activeFilters, setActiveFilters]   = useState(EMPTY_FILTERS);

  const loadClients = useCallback(async () => {
    try {
      const data = await consentService.listClients(token);
      setClients(Array.isArray(data) ? data : data?.clients ?? []);
    } catch { /* silent */ }
  }, [token]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await consentService.getAllConsentRecords();
      setRecords(Array.isArray(data) ? data : []);
    } catch { setRecords([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);
  useEffect(() => { load(); }, [load]);

  const applyFilters = () => setActiveFilters({ ...filters });
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setActiveFilters(EMPTY_FILTERS); };

  const filtered = useMemo(() => {
    let list = [...records];
    if (activeFilters.clientId) list = list.filter((r) => r.clientId === activeFilters.clientId);
    if (activeFilters.status)   list = list.filter((r) => (r.status ?? "").toUpperCase() === activeFilters.status.toUpperCase());
    if (activeFilters.search.trim()) {
      const q = activeFilters.search.toLowerCase();
      list = list.filter((r) =>
        (r.subjectName ?? "").toLowerCase().includes(q) ||
        (r.subjectId   ?? "").toLowerCase().includes(q) ||
        (r.endUserRef  ?? "").toLowerCase().includes(q) ||
        (r.purpose     ?? "").toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let av = a[sortKey] || "", bv = b[sortKey] || "";
      if (sortDir === "desc") [av, bv] = [bv, av];
      return String(av).localeCompare(String(bv));
    });
    return list;
  }, [records, activeFilters, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const totalWidth = COLUMNS.reduce((a, c) => a + c.width, 0);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0fdfa 0%,#f8fafc 60%,#eef2ff 100%)", padding: "24px 24px 80px" }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, background: "#fff", borderRadius: 16, padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" }}>
        <button onClick={() => history.push("/consent-management")} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#0d9488,#0f766e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShieldCheck size={22} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>Consent Records</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{filtered.length} of {records.length} records</p>
        </div>
        <button onClick={load} style={{ background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 10, padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#0f766e", fontSize: 13, fontWeight: 600 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>

          {/* Organisation / Client */}
          <div style={{ flex: "0 0 200px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Organisation</label>
            <select
              value={filters.clientId}
              onChange={(e) => setFilters((f) => ({ ...f, clientId: e.target.value }))}
              style={{ width: "100%", height: 38, border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#334155", padding: "0 10px", background: "#fff", outline: "none" }}
            >
              <option value="">All organisations</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Status */}
          <div style={{ flex: "0 0 160px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              style={{ width: "100%", height: 38, border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#334155", padding: "0 10px", background: "#fff", outline: "none" }}
            >
              <option value="">All statuses</option>
              <option value="GIVEN">Active</option>
              <option value="WITHDRAWN">Revoked</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Search</label>
            <div style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                placeholder="Search by name, ID, purpose…"
                style={{ width: "100%", paddingLeft: 36, paddingRight: 12, height: 38, border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#334155", outline: "none", background: "#fff", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Apply */}
          <button onClick={applyFilters} style={{ height: 38, padding: "0 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0d9488,#0f766e)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Search size={14} /> Apply
          </button>

          {/* Reset */}
          {Object.values(activeFilters).some(Boolean) && (
            <button onClick={resetFilters} style={{ height: 38, padding: "0 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
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
                <tr><td colSpan={COLUMNS.length} style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>Loading consent records…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={COLUMNS.length} style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 14 }}>No records found</td></tr>
              ) : (
                filtered.map((record, idx) => {
                  const isSelected = selectedRecord?._id === record._id;
                  return (
                    <tr
                      key={record._id ?? record.id ?? idx}
                      onClick={() => setSelectedRecord(isSelected ? null : record)}
                      style={{ background: isSelected ? "#f0fdfa" : idx % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafafa"; }}
                    >
                      <td style={{ padding: "11px 14px", fontSize: 12, fontWeight: 700, color: "#0f766e", fontFamily: "monospace" }}>{record.subjectId ?? record.endUserRef}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{record.subjectName ?? record.endUserRef}</td>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: "#475569", maxWidth: 200 }}>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={record.purpose ?? record.consentDefinitionId}>{record.purpose ?? record.consentDefinitionId}</span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <StatusBadge status={record.status} />
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{record.channel ?? record.origin ?? "—"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{record.legalBasis ?? "—"}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{record.consentVersion ?? record.formId ?? "—"}</span>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{fmtDate(record.createdAt)}</td>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{fmtDate(record.expiresAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Panel ── */}
      {selectedRecord && (
        <>
          <div onClick={() => setSelectedRecord(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 49, backdropFilter: "blur(2px)" }} />
          <ConsentDetailPanel record={selectedRecord} onClose={() => setSelectedRecord(null)} />
        </>
      )}
    </div>
  );
};

export default ConsentRecordsPage;