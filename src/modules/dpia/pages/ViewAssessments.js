import Link from 'next/link';
// //C:\Users\ak192\Downloads\cf-tool-frontend-prod (6)\cf-tool-frontend-prod\src\modules\dpia\pages\ViewAssessments.js


// import React, { useEffect, useState, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { useUser } from "../../../hooks/useUser";
// import { getAllAssessments } from "../services/dpiaApi";
// import { ArrowLeft, Plus, RefreshCw } from "lucide-react";

// // ─── Styles ──────────────────────────────────────────────────────────────────
// const S = {
//   root: {
//     minHeight: "100vh",
//     background:
//       "linear-gradient(160deg, #eef3fb 0%, #f4f7fd 50%, #edf5f3 100%)",
//     fontFamily: "'DM Sans', sans-serif",
//     padding: "32px 24px",
//   },
//   maxW: { maxWidth: 1100, margin: "0 auto" },

//   header: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 28,
//     paddingBottom: 20,
//     borderBottom: "1px solid #dde3ef",
//     animation: "fadeUp 0.4s ease both",
//   },
//   headerLeft: { display: "flex", alignItems: "center", gap: 14 },
//   logo: {
//     background: "linear-gradient(135deg, #0f2247, #1e6ec8)",
//     borderRadius: 10,
//     width: 40,
//     height: 40,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     color: "#fff",
//     fontWeight: 900,
//     fontSize: 18,
//   },
//   logoText: { fontSize: 18, fontWeight: 800, color: "#0f2247" },
//   logoSub: { fontSize: 12, color: "#6b7280", fontWeight: 500 },

//   backBtn: {
//     background: "transparent",
//     border: "1.5px solid #dde3ef",
//     color: "#374151",
//     borderRadius: 8,
//     padding: "8px 14px",
//     fontSize: 12,
//     fontWeight: 700,
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     gap: 6,
//     transition: "all 0.15s",
//   },
//   newBtn: {
//     background: "linear-gradient(90deg, #1a3a6e, #1e6ec8)",
//     color: "#fff",
//     border: "none",
//     borderRadius: 9,
//     padding: "10px 18px",
//     fontSize: 13,
//     fontWeight: 700,
//     cursor: "pointer",
//     boxShadow: "0 4px 14px #1e4d8c33",
//     display: "flex",
//     alignItems: "center",
//     gap: 7,
//   },

//   summaryRow: {
//     display: "grid",
//     gridTemplateColumns: "repeat(4, 1fr)",
//     gap: 14,
//     marginBottom: 24,
//     animation: "fadeUp 0.4s ease 0.1s both",
//   },
//   statCard: (accent) => ({
//     background: "#fff",
//     border: `1px solid ${accent}33`,
//     borderRadius: 12,
//     padding: "14px 18px",
//     boxShadow: "0 1px 5px rgba(15,34,71,0.06)",
//     borderLeft: `4px solid ${accent}`,
//   }),
//   statLabel: {
//     fontSize: 11,
//     fontWeight: 700,
//     color: "#6b7280",
//     textTransform: "uppercase",
//     letterSpacing: "0.8px",
//     marginBottom: 4,
//   },
//   statValue: (accent) => ({
//     fontSize: 26,
//     fontWeight: 800,
//     color: accent,
//     lineHeight: 1,
//   }),
//   statSub: { fontSize: 11, color: "#9ca3af", marginTop: 3 },

//   tableCard: {
//     background: "#fff",
//     borderRadius: 14,
//     border: "1px solid #e4eaf4",
//     boxShadow: "0 1px 6px rgba(15,34,71,0.06)",
//     overflow: "hidden",
//     animation: "fadeUp 0.4s ease 0.2s both",
//   },
//   tableHead: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: "16px 20px",
//     borderBottom: "1px solid #eef1f8",
//     background: "linear-gradient(90deg, #0f224708 0%, transparent 100%)",
//   },
//   tableTitle: { fontSize: 14, fontWeight: 700, color: "#111827" },
//   tableCount: {
//     background: "#eef3fb",
//     color: "#1a3a6e",
//     borderRadius: 20,
//     padding: "3px 10px",
//     fontSize: 12,
//     fontWeight: 700,
//   },
//   tableWrap: { overflowX: "auto" },
//   table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
//   th: {
//     background: "#f0f4fb",
//     color: "#374151",
//     fontWeight: 700,
//     padding: "10px 16px",
//     textAlign: "left",
//     borderBottom: "2px solid #dde3ef",
//     whiteSpace: "nowrap",
//     fontSize: 12,
//     textTransform: "uppercase",
//     letterSpacing: "0.5px",
//   },
//   td: {
//     padding: "13px 16px",
//     borderBottom: "1px solid #eef1f8",
//     verticalAlign: "middle",
//   },

//   statusBadge: (status) => {
//     const map = {
//       SUBMITTED: { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
//       IN_PROGRESS: { bg: "#fffbeb", color: "#b45309", border: "#fcd34d" },
//       DRAFT: { bg: "#f0f4fb", color: "#1a3a6e", border: "#bdd4f0" },
//     };
//     const s = map[status] || map.DRAFT;
//     return {
//       display: "inline-block",
//       background: s.bg,
//       color: s.color,
//       border: `1px solid ${s.border}`,
//       borderRadius: 20,
//       padding: "3px 10px",
//       fontSize: 11,
//       fontWeight: 700,
//     };
//   },

//   riskBadge: (risk) => {
//     const map = {
//       HIGH: { bg: "#fef2f2", color: "#b91c1c", border: "#fca5a5" },
//       MEDIUM: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
//       LOW: { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
//     };
//     const r = map[risk] || {
//       bg: "#f0f4fb",
//       color: "#6b7280",
//       border: "#dde3ef",
//     };
//     return {
//       display: "inline-flex",
//       alignItems: "center",
//       gap: 5,
//       background: r.bg,
//       color: r.color,
//       border: `1px solid ${r.border}`,
//       borderRadius: 20,
//       padding: "3px 10px",
//       fontSize: 11,
//       fontWeight: 700,
//     };
//   },

//   actionBtn: (accent, disabled) => ({
//     background: "transparent",
//     border: `1.5px solid ${disabled ? "#e4eaf4" : accent}`,
//     color: disabled ? "#d1d5db" : accent,
//     borderRadius: 7,
//     padding: "5px 12px",
//     fontSize: 12,
//     fontWeight: 700,
//     cursor: disabled ? "not-allowed" : "pointer",
//     transition: "all 0.13s",
//     marginRight: 6,
//   }),

//   scopeBanner: {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     background: "#f5f3ff",
//     border: "1px solid #ddd6fe",
//     borderRadius: 10,
//     padding: "10px 16px",
//     marginBottom: 16,
//     fontSize: 13,
//     color: "#5b21b6",
//     fontWeight: 600,
//   },

//   emptyBox: {
//     padding: "60px 20px",
//     textAlign: "center",
//     color: "#9ca3af",
//     fontSize: 14,
//   },
//   errBox: {
//     background: "#fef2f2",
//     border: "1.5px solid #fca5a5",
//     borderRadius: 10,
//     padding: "14px 18px",
//     color: "#b91c1c",
//     fontSize: 13,
//     fontWeight: 600,
//     marginBottom: 20,
//   },
// };

// const DOT = { HIGH: "🔴", MEDIUM: "🟡", LOW: "🟢" };

// // ─── Component ────────────────────────────────────────────────────────────────
// export default function ViewAssessments() {
//   const user = useUser();
//   const organizationId = effectiveOrgId;
//   const router = useRouter();

//   // ── Role detection ────────────────────────────────────────────────────────
//   const userRoles = Array.isArray(user?.role) ? user.role : [user?.role || ""];
// const isRoot = user?.role?.some((r) => {
//   const s = (typeof r === "string" ? r : r?.name || r?.roleName || "")
//     .toLowerCase()
//     .replace(/[\s_-]/g, "");

//   return ["root",  "dpo"].some(role => s.includes(role));
// });
//   const isRiskOwner =
//     userRoles.includes("risk_owner") || userRoles.includes("risk_manager");
//   const userDepartment = user?.department;

//   const [dpias, setDpias] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [hovered, setHovered] = useState(null);
//   const [filter, setFilter] = useState("ALL");

//   const loadData = useCallback(() => {
//     setLoading(true);
//     getAllAssessments(organizationId)
//       .then((data) => setDpias(Array.isArray(data) ? data : []))
//       .catch((err) =>
//         setError(
//           err?.response?.data?.message ||
//             err?.message ||
//             "Failed to load assessments",
//         ),
//       )
//       .finally(() => setLoading(false));
//   }, [organizationId]);

//   useEffect(() => {
//     loadData();
//   }, [loadData]);

//   // ── Scope: risk owners see only their department ──────────────────────────
//   const baseDpias =
//     isRiskOwner && userDepartment
//       ? dpias.filter((d) =>
//           (Array.isArray(d.departmentId) ? d.departmentId : []).includes(
//             userDepartment,
//           ),
//         )
//       : dpias;

//   // ── Stats ─────────────────────────────────────────────────────────────────
//   const total = baseDpias.length;
//   const submitted = baseDpias.filter((d) => d.status === "SUBMITTED").length;
//   const inProgress = baseDpias.filter((d) => d.status === "IN_PROGRESS").length;
//   const highRisk = baseDpias.filter(
//     (d) => d.overallRiskLevel === "HIGH",
//   ).length;

//   // ── Filter ────────────────────────────────────────────────────────────────
//   const filtered = baseDpias.filter((d) => {
//     if (filter === "ALL") return true;
//     if (filter === "SUBMITTED") return d.status === "SUBMITTED";
//     if (filter === "IN_PROGRESS") return d.status === "IN_PROGRESS";
//     if (filter === "DRAFT") return d.status === "DRAFT";
//     if (filter === "HIGH") return d.overallRiskLevel === "HIGH";
//     return true;
//   });

//   const filterBtns = [
//     { key: "ALL", label: `All (${total})`, accent: "#1a3a6e" },
//     { key: "SUBMITTED", label: `Submitted (${submitted})`, accent: "#10b981" },
//     {
//       key: "IN_PROGRESS",
//       label: `In Progress (${inProgress})`,
//       accent: "#f59e0b",
//     },
//     { key: "HIGH", label: `High Risk (${highRisk})`, accent: "#ef4444" },
//   ];

//   return (
//     <div style={S.root}>
//       <link
//         href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
//         rel="stylesheet"
//       />
//       <style>{`
//         @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none} }
//         @keyframes fadeIn { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none} }
//         .dpia-row:hover { background: #f0f5ff !important; }
//         .action-btn:hover { filter: brightness(0.92); }
//       `}</style>

//       <div style={S.maxW}>
//         {/* Header */}
//         <div style={S.header}>
//           <div style={S.headerLeft}>
//             <div style={S.logo}>U</div>
//             <div>
//               <div style={S.logoText}>DPIA Assessments</div>
//               <div style={S.logoSub}>
//                 {isRiskOwner && userDepartment
//                   ? `Showing assessments for your department: ${userDepartment}`
//                   : "All assessments for your organization"}
//               </div>
//             </div>
//           </div>
//           <div style={{ display: "flex", gap: 10 }}>
//             <button style={S.backBtn} onClick={() => router.push("/dpia")}>
//               <ArrowLeft size={14} /> Dashboard
//             </button>
//             {!isRiskOwner && (
//               <button
//                 style={S.newBtn}
//                 onClick={() => router.push("/dpia/new")}
//               >
//                 <Plus size={14} /> New Assessment
//               </button>
//             )}
//             <button
//               onClick={loadData}
//               style={{ ...S.backBtn, padding: "8px 10px" }}
//               title="Refresh"
//             >
//               <RefreshCw
//                 size={14}
//                 style={loading ? { animation: "spin 1s linear infinite" } : {}}
//               />
//             </button>
//           </div>
//         </div>

//         {/* Scope banner for risk owners */}
//         {isRiskOwner && (
//           <div style={S.scopeBanner}>
//             🏢 You are viewing assessments scoped to your department
//             {userDepartment ? `: "${userDepartment}"` : ""}. Contact your admin
//             to update department assignments.
//           </div>
//         )}

//         {/* Summary */}
//         <div style={S.summaryRow}>
//           {[
//             {
//               label: "Total Assessments",
//               value: total,
//               accent: "#1e6ec8",
//               sub: isRiskOwner ? "In your department" : "All projects",
//             },
//             {
//               label: "Submitted",
//               value: submitted,
//               accent: "#10b981",
//               sub: "Compliance run",
//             },
//             {
//               label: "In Progress",
//               value: inProgress,
//               accent: "#f59e0b",
//               sub: "Awaiting completion",
//             },
//             {
//               label: "High Risk",
//               value: highRisk,
//               accent: "#ef4444",
//               sub: "Needs attention",
//             },
//           ].map(({ label, value, accent, sub }) => (
//             <div key={label} style={S.statCard(accent)}>
//               <div style={S.statLabel}>{label}</div>
//               <div style={S.statValue(accent)}>{loading ? "—" : value}</div>
//               <div style={S.statSub}>{sub}</div>
//             </div>
//           ))}
//         </div>

//         {error && <div style={S.errBox}>⚠ {error}</div>}

//         {/* Filters */}
//         <div
//           style={{
//             display: "flex",
//             gap: 8,
//             marginBottom: 14,
//             flexWrap: "wrap",
//           }}
//         >
//           {filterBtns.map(({ key, label, accent }) => (
//             <button
//               key={key}
//               onClick={() => setFilter(key)}
//               style={{
//                 background: filter === key ? `${accent}14` : "#fff",
//                 border: `1.5px solid ${filter === key ? accent : "#dde3ef"}`,
//                 color: filter === key ? accent : "#374151",
//                 borderRadius: 8,
//                 padding: "6px 14px",
//                 fontSize: 12,
//                 fontWeight: filter === key ? 700 : 500,
//                 cursor: "pointer",
//                 transition: "all 0.13s",
//               }}
//             >
//               {label}
//             </button>
//           ))}
//         </div>

//         {/* Table */}
//         <div style={S.tableCard}>
//           <div style={S.tableHead}>
//             <div style={S.tableTitle}>DPIA Assessments</div>
//             {!loading && (
//               <span style={S.tableCount}>{filtered.length} shown</span>
//             )}
//           </div>

//           {loading ? (
//             <div style={S.emptyBox}>
//               <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
//               Loading assessments…
//             </div>
//           ) : filtered.length === 0 ? (
//             <div style={S.emptyBox}>
//               <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
//               <div
//                 style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}
//               >
//                 No assessments found
//               </div>
//               <div>
//                 {isRiskOwner
//                   ? "No assessments are assigned to your department yet."
//                   : "Try a different filter or create a new assessment."}
//               </div>
//             </div>
//           ) : (
//             <div style={S.tableWrap}>
//               <table style={S.table}>
//                 <thead>
//                   <tr>
//                     {[
//                       "DPIA ID",
//                       "Status",
//                       "Risk Level",
//                       "Created",
//                       "Actions",
//                     ].map((h) => (
//                       <th key={h} style={S.th}>
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filtered.map((dpia, i) => (
//                     <tr
//                       key={dpia.id}
//                       className="dpia-row"
//                       style={{
//                         background:
//                           hovered === i
//                             ? "#f0f5ff"
//                             : i % 2 === 0
//                               ? "#fff"
//                               : "#fafbfd",
//                         animation: `fadeIn 0.2s ease both`,
//                         animationDelay: `${i * 0.03}s`,
//                       }}
//                       onMouseEnter={() => setHovered(i)}
//                       onMouseLeave={() => setHovered(null)}
//                     >
//                       <td
//                         style={{ ...S.td, fontWeight: 600, color: "#111827" }}
//                       >
//                         {dpia.projectName || "—"}
//                       </td>
//                       <td style={S.td}>
//                         <span style={S.statusBadge(dpia.status)}>
//                           {dpia.status || "DRAFT"}
//                         </span>
//                       </td>
//                       <td style={S.td}>
//                         {dpia.overallRiskLevel ? (
//                           <span style={S.riskBadge(dpia.overallRiskLevel)}>
//                             {DOT[dpia.overallRiskLevel] || "⚪"}{" "}
//                             {dpia.overallRiskLevel}
//                           </span>
//                         ) : (
//                           <span style={{ color: "#9ca3af", fontSize: 12 }}>
//                             Not assessed
//                           </span>
//                         )}
//                       </td>
//                       <td style={{ ...S.td, color: "#6b7280", fontSize: 12 }}>
//                         {dpia.createdDate
//                           ? new Date(dpia.createdDate).toLocaleDateString(
//                               "en-GB",
//                               {
//                                 day: "2-digit",
//                                 month: "short",
//                                 year: "numeric",
//                               },
//                             )
//                           : "—"}
//                       </td>
//                       <td style={S.td}>
//                         <button
//                           className="action-btn"
//                           style={S.actionBtn("#1e6ec8", false)}
//                           onClick={() => router.push(`/dpia/${dpia.id}`)}
//                         >
//                           Open
//                         </button>
//                         <button
//                           className="action-btn"
//                           style={S.actionBtn(
//                             "#10b981",
//                             dpia.status !== "SUBMITTED",
//                           )}
//                           disabled={dpia.status !== "SUBMITTED"}
//                           onClick={() =>
//                             dpia.status === "SUBMITTED" &&
//                             router.push(`/dpia/compliance/${dpia.id}`)
//                           }
//                           title={
//                             dpia.status !== "SUBMITTED"
//                               ? "Submit the assessment first"
//                               : "View compliance results"
//                           }
//                         >
//                           Compliance
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



















// C:\Users\ak192\Downloads\cf-tool-frontend-prod (6)\cf-tool-frontend-prod\src\modules\dpia\pages\ViewAssessments.js

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import { getAllAssessments } from "../services/dpiaApi";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
} from "lucide-react";

// ─── Stat Card (matches TemplatesPage StatCard) ───────────────────────────────
const STAT_CONFIG = {
  "Total Assessments": {
    gradient: "linear-gradient(135deg,#4f8ef7,#2563eb)",
    Icon: ClipboardList,
  },
  Submitted: {
    gradient: "linear-gradient(135deg,#10b981,#059669)",
    Icon: CheckCircle2,
  },
  "In Progress": {
    gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
    Icon: ShieldAlert,
  },
  "High Risk": {
    gradient: "linear-gradient(135deg,#ef4444,#dc2626)",
    Icon: AlertOctagon,
  },
};

function StatCard({ value, label, sub, index }) {
  const s = STAT_CONFIG[label] || STAT_CONFIG["Total Assessments"];
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #f1f5f9",
        borderRadius: 12,
        padding: "14px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "default",
        transition: "box-shadow 0.2s",
        animation: `cardIn 0.4s ease ${index * 0.05}s both`,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.09)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)")
      }
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
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
            fontSize: 22,
            fontWeight: 700,
            color: "#1e293b",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginTop: 2,
          }}
        >
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 1 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    SUBMITTED: { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
    IN_PROGRESS: { bg: "#fffbeb", color: "#b45309", border: "#fcd34d" },
    DRAFT: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  };
  const s = map[status] || map.DRAFT;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.03em",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {status || "DRAFT"}
    </span>
  );
}

// ─── Risk Level Pill ──────────────────────────────────────────────────────────
function RiskLevelPill({ level }) {
  const DOT = { HIGH: "🔴", MEDIUM: "🟡", LOW: "🟢" };
  const map = {
    HIGH: { bg: "#fef2f2", color: "#b91c1c", border: "#fca5a5" },
    MEDIUM: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    LOW: { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  };
  if (!level) {
    return (
      <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 500 }}>
        Not assessed
      </span>
    );
  }
  const r = map[level] || { bg: "#f0f4fb", color: "#6b7280", border: "#dde3ef" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: r.bg,
        color: r.color,
        border: `1px solid ${r.border}`,
      }}
    >
      {DOT[level] || "⚪"} {level}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ViewAssessments() {
  const {
    user,
    mounted,
    isRoot: hookIsRoot,
    isPrivilegedRole,
    isViewingManagedOrg,
    effectiveOrgId,
    effectiveOrgIds,
    selectedChildOrg,
  } = useEffectiveOrg();
  const organizationId = effectiveOrgId;
  const router = useRouter();

  // ── Role detection (UNCHANGED) ────────────────────────────────────────────
  const userRoles = Array.isArray(user?.role) ? user.role : [user?.role || ""];
  const isRoot = isPrivilegedRole;
  const isRiskOwner =
    userRoles.includes("risk_owner") || userRoles.includes("risk_manager");
  const userDepartment = user?.department;

  const [dpias, setDpias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const loadData = useCallback(() => {
    setLoading(true);
    getAllAssessments(organizationId)
      .then((data) => setDpias(Array.isArray(data) ? data : []))
      .catch((err) =>
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load assessments",
        ),
      )
      .finally(() => setLoading(false));
  }, [organizationId]);

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [loadData, mounted]);

  // ── Scope (UNCHANGED) ────────────────────────────────────────────────────
  const baseDpias =
    isRiskOwner && userDepartment
      ? dpias.filter((d) =>
          (Array.isArray(d.departmentId) ? d.departmentId : []).includes(
            userDepartment,
          ),
        )
      : dpias;

  // ── Stats (UNCHANGED) ────────────────────────────────────────────────────
  const total = baseDpias.length;
  const submitted = baseDpias.filter((d) => d.status === "SUBMITTED").length;
  const inProgress = baseDpias.filter((d) => d.status === "IN_PROGRESS").length;
  const highRisk = baseDpias.filter((d) => d.overallRiskLevel === "HIGH").length;

  // ── Filter (UNCHANGED) ───────────────────────────────────────────────────
  const filtered = baseDpias.filter((d) => {
    if (filter === "ALL") return true;
    if (filter === "SUBMITTED") return d.status === "SUBMITTED";
    if (filter === "IN_PROGRESS") return d.status === "IN_PROGRESS";
    if (filter === "DRAFT") return d.status === "DRAFT";
    if (filter === "HIGH") return d.overallRiskLevel === "HIGH";
    return true;
  });

  const filterBtns = [
    { key: "ALL", label: `All (${total})`, accent: "#2563eb" },
    { key: "SUBMITTED", label: `Submitted (${submitted})`, accent: "#059669" },
    { key: "IN_PROGRESS", label: `In Progress (${inProgress})`, accent: "#d97706" },
    { key: "HIGH", label: `High Risk (${highRisk})`, accent: "#dc2626" },
  ];

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#f8fafc",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <main
          style={{
            flex: 1,
            maxWidth: 1400,
            margin: "0 auto",
            width: "100%",
            padding: "20px 20px 100px",
            boxSizing: "border-box",
          }}
        >
          {/* ── Back + Action buttons ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <button
              onClick={() => router.push("/dpia")}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(37,99,235,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(37,99,235,0.3)";
              }}
            >
              <ArrowLeft size={14} /> Dashboard
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              {!isRiskOwner && (
                <button
                  onClick={() => router.push("/dpia/new")}
                  style={{
                    padding: "10px 20px",
                    background: "linear-gradient(135deg,#10b981,#059669)",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 16px rgba(16,185,129,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(16,185,129,0.3)";
                  }}
                >
                  <Plus size={14} /> New Assessment
                </button>
              )}
              <button
                onClick={loadData}
                title="Refresh"
                style={{
                  padding: "10px 14px",
                  background: "white",
                  color: "#475569",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8fafc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                <RefreshCw
                  size={14}
                  style={
                    loading ? { animation: "spin 1s linear infinite" } : {}
                  }
                />
              </button>
            </div>
          </div>

          {/* ── Header card ── */}
          <div
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(241,245,249,0.8)",
              borderRadius: 14,
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              padding: "18px 24px 16px",
              marginBottom: 16,
              animation: "fadeUp 0.4s ease both",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                }}
              >
                <ClipboardList size={22} color="white" strokeWidth={2} />
              </div>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1e293b",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  DPIA Assessments
                </h1>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: 13,
                    color: "#64748b",
                    fontWeight: 400,
                  }}
                >
                  {isRiskOwner && userDepartment
                    ? `Showing assessments for your department: "${userDepartment}"`
                    : "All assessments for your organization"}{" "}
                  ·{" "}
                  <span
                    style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}
                  >
                    {loading ? "—" : filtered.length}
                  </span>{" "}
                  shown
                </p>
              </div>
            </div>
          </div>

          {/* ── Scope banner for risk owners ── */}
          {isRiskOwner && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 10,
                padding: "10px 16px",
                marginBottom: 16,
                fontSize: 13,
                color: "#1d4ed8",
                fontWeight: 600,
                animation: "fadeUp 0.4s ease 0.05s both",
              }}
            >
              🏢 You are viewing assessments scoped to your department
              {userDepartment ? `: "${userDepartment}"` : ""}. Contact your
              admin to update department assignments.
            </div>
          )}

          {/* ── Stat Cards ── */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
              marginBottom: 18,
            }}
          >
            {[
              {
                label: "Total Assessments",
                value: loading ? "—" : total,
                sub: isRiskOwner ? "In your department" : "All projects",
              },
              {
                label: "Submitted",
                value: loading ? "—" : submitted,
                sub: "Compliance run",
              },
              {
                label: "In Progress",
                value: loading ? "—" : inProgress,
                sub: "Awaiting completion",
              },
              {
                label: "High Risk",
                value: loading ? "—" : highRisk,
                sub: "Needs attention",
              },
            ].map((s, i) => (
              <StatCard
                key={s.label}
                value={s.value}
                label={s.label}
                sub={s.sub}
                index={i}
              />
            ))}
          </section>

          {/* ── Error ── */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1.5px solid #fca5a5",
                borderRadius: 10,
                padding: "14px 18px",
                color: "#b91c1c",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertOctagon size={16} /> {error}
            </div>
          )}

          {/* ── Filter chips ── */}
          <div
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(241,245,249,0.8)",
              borderRadius: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              padding: "12px 16px",
              marginBottom: 16,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              animation: "fadeUp 0.4s ease 0.2s both",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#475569",
                marginRight: 4,
                flexShrink: 0,
              }}
            >
              Filter:
            </span>
            {filterBtns.map(({ key, label, accent }) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 13px",
                    borderRadius: 20,
                    cursor: "pointer",
                    border: "none",
                    background: active ? "#eff6ff" : "#f8fafc",
                    outline: active
                      ? `1.5px solid ${accent}`
                      : "1.5px solid transparent",
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    color: active ? accent : "#64748b",
                    boxShadow: active
                      ? `0 0 0 3px ${accent}1a`
                      : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {active && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: accent,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {label}
                </button>
              );
            })}
          </div>

          {/* ── Table card ── */}
          <div
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(8px)",
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1px solid rgba(241,245,249,0.8)",
              overflow: "hidden",
              animation: "fadeUp 0.4s ease 0.25s both",
              marginBottom: 16,
            }}
          >
            {/* Table header bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid #f1f5f9",
                background: "rgba(248,250,252,0.6)",
              }}
            >
              <span
                style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}
              >
                DPIA Assessments
              </span>
              {!loading && (
                <span
                  style={{
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    borderRadius: 20,
                    padding: "3px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    border: "1px solid #bfdbfe",
                  }}
                >
                  {filtered.length} shown
                </span>
              )}
            </div>

            {loading ? (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <RefreshCw
                    size={20}
                    color="white"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                </div>
                <p
                  style={{
                    color: "#64748b",
                    fontWeight: 600,
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  Loading assessments…
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  padding: "60px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <ClipboardList size={22} color="white" strokeWidth={1.8} />
                </div>
                <p
                  style={{
                    color: "#1e293b",
                    fontWeight: 600,
                    fontSize: 14,
                    margin: "0 0 4px",
                  }}
                >
                  No assessments found
                </p>
                <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
                  {isRiskOwner
                    ? "No assessments are assigned to your department yet."
                    : "Try a different filter or create a new assessment."}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 650,
                    background: "transparent",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#f8fafc",
                        borderBottom: "2px solid #e2e8f0",
                      }}
                    >
                      {[
                        { label: "#", align: "center", width: 60 },
                        { label: "DPIA ID", align: "left", minWidth: 200 },
                        { label: "Status", align: "center", width: 130 },
                        { label: "Risk Level", align: "center", width: 140 },
                        { label: "Created", align: "center", width: 130 },
                        { label: "Actions", align: "center", width: 220, accent: true },
                      ].map(({ label, align, width, minWidth, accent }) => (
                        <th
                          key={label}
                          style={{
                            padding: "11px 12px",
                            textAlign: align,
                            fontWeight: 700,
                            fontSize: 11,
                            color: accent ? "#3b82f6" : "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
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
                    {filtered.map((dpia, i) => (
                      <tr
                        key={dpia.id}
                        style={{
                          background:
                            i % 2 === 0 ? "transparent" : "rgba(248,250,252,0.6)",
                          borderBottom: "1px solid #f1f5f9",
                          transition: "all 0.15s ease",
                          borderLeft: "3px solid transparent",
                          animation: `fadeUp 0.2s ease ${i * 0.03}s both`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.95)";
                          e.currentTarget.style.borderLeft =
                            "3px solid #cbd5e1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            i % 2 === 0
                              ? "transparent"
                              : "rgba(248,250,252,0.6)";
                          e.currentTarget.style.borderLeft =
                            "3px solid transparent";
                        }}
                      >
                        {/* # */}
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#7c3aed",
                              background: "#f3f0ff",
                              padding: "2px 7px",
                              borderRadius: 4,
                            }}
                          >
                            {i + 1}
                          </span>
                        </td>

                        {/* DPIA ID / Project Name */}
                        <td
                          style={{
                            padding: "12px",
                            color: "#475569",
                            fontSize: 13,
                            fontWeight: 600,
                            lineHeight: 1.5,
                          }}
                        >
                          {dpia.projectName || "—"}
                        </td>

                        {/* Status */}
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <StatusPill status={dpia.status} />
                        </td>

                        {/* Risk Level */}
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <RiskLevelPill level={dpia.overallRiskLevel} />
                        </td>

                        {/* Created */}
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            color: "#64748b",
                            fontSize: 12,
                          }}
                        >
                          {dpia.createdDate
                            ? new Date(dpia.createdDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td
                          style={{
                            padding: "10px 12px",
                            textAlign: "center",
                            background: "rgba(248,250,252,0.5)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              justifyContent: "center",
                              alignItems: "center",
                              flexWrap: "nowrap",
                            }}
                          >
                            {/* Open */}
                            <button
                              onClick={() => router.push(`/dpia/${dpia.id}`)}
                              style={{
                                background:
                                  "linear-gradient(135deg,#3b82f6,#2563eb)",
                                color: "white",
                                border: "none",
                                padding: "5px 12px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                boxShadow: "0 1px 4px rgba(37,99,235,0.2)",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 10px rgba(37,99,235,0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                  "0 1px 4px rgba(37,99,235,0.2)";
                              }}
                            >
                              👁 Open
                            </button>

                            {/* Compliance */}
                            <button
                              disabled={dpia.status !== "SUBMITTED"}
                              onClick={() =>
                                dpia.status === "SUBMITTED" &&
                                router.push(`/dpia/compliance/${dpia.id}`)
                              }
                              title={
                                dpia.status !== "SUBMITTED"
                                  ? "Submit the assessment first"
                                  : "View compliance results"
                              }
                              style={{
                                background:
                                  dpia.status === "SUBMITTED"
                                    ? "linear-gradient(135deg,#10b981,#059669)"
                                    : "transparent",
                                color:
                                  dpia.status === "SUBMITTED"
                                    ? "white"
                                    : "#94a3b8",
                                border:
                                  dpia.status === "SUBMITTED"
                                    ? "none"
                                    : "1.5px solid #e2e8f0",
                                padding: "5px 12px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor:
                                  dpia.status !== "SUBMITTED"
                                    ? "not-allowed"
                                    : "pointer",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                boxShadow:
                                  dpia.status === "SUBMITTED"
                                    ? "0 1px 4px rgba(16,185,129,0.2)"
                                    : "none",
                                transition: "all 0.2s",
                                opacity: dpia.status !== "SUBMITTED" ? 0.5 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (dpia.status === "SUBMITTED") {
                                  e.currentTarget.style.transform =
                                    "translateY(-1px)";
                                  e.currentTarget.style.boxShadow =
                                    "0 4px 10px rgba(16,185,129,0.3)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                  dpia.status === "SUBMITTED"
                                    ? "0 1px 4px rgba(16,185,129,0.2)"
                                    : "none";
                              }}
                            >
                              ✓ Compliance
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* ── Footer (matches TemplatesPage) ── */}
        <footer
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            borderTop: "1px solid rgba(241,245,249,0.8)",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
            padding: "14px 24px",
            position: "sticky",
            bottom: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{ maxWidth: 1400, margin: "0 auto", textAlign: "center" }}
          >
            <p
              style={{
                fontSize: 13,
                color: "#64748b",
                fontWeight: 500,
                margin: 0,
              }}
            >
              © {new Date().getFullYear()} CalVant. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes cardIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </>
  );
}
