// 'use client'



// import React, { useEffect, useState, useMemo } from "react";
// import { useRouter } from "next/navigation"; 
// import { jwtDecode } from "jwt-decode";
// import axios from "axios";
// import api from "../../api/adminApi";
// import useModuleEntitlements from "../../hooks/useModuleEntitlements";

// const RISK_URL   = process.env.NEXT_PUBLIC_SP + "/risk-service/api/risks";
// const VENDOR_URL = process.env.NEXT_PUBLIC_SP + "/tprm-service/api/tprm/vendors";
// const BASIC_TOKEN = btoa("username:password");

// // ── Design tokens (light theme) ────────────────────────────────────────────────
// const C = {
//   pageBg:      "#f4f6f9",
//   white:       "#ffffff",
//   border:      "#e2e8f0",
//   borderLight: "#f0f4f8",
//   text1:       "#1a202c",
//   text2:       "#4a5568",
//   text3:       "#718096",
//   text4:       "#a0aec0",
//   tableBg:     "#f8fafc",
//   rowHover:    "#fafbfc",

//   blue:        "#2563eb",
//   blueLight:   "#eff6ff",
//   cyan:        "#0891b2",
//   cyanLight:   "#ecfeff",
//   green:       "#059669",
//   greenLight:  "#ecfdf5",
//   greenText:   "#166534",
//   greenBg:     "#dcfce7",
//   amber:       "#d97706",
//   amberLight:  "#fffbeb",
//   amberText:   "#92400e",
//   red:         "#dc2626",
//   redLight:    "#fef2f2",
//   redText:     "#991b1b",
//   violet:      "#7c3aed",
//   violetLight: "#f3e8ff",
//   violetText:  "#6b21a8",
//   orange:      "#ea580c",
// };

// // ── Shared styles ──────────────────────────────────────────────────────────────
// const S = {
//   card: {
//     background: C.white,
//     border: `1px solid ${C.border}`,
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   cardHeader: {
//     display: "flex", alignItems: "center", justifyContent: "space-between",
//     padding: "14px 18px", borderBottom: `1px solid ${C.borderLight}`,
//   },
//   cardTitle: {
//     fontSize: 13, fontWeight: 700, color: C.text1,
//     display: "flex", alignItems: "center", gap: 7,
//   },
//   cardSub: { fontSize: 11, color: C.text4, marginTop: 2 },
//   th: {
//     background: C.tableBg, color: C.text4, fontSize: 10, fontWeight: 700,
//     letterSpacing: "0.9px", textTransform: "uppercase",
//     padding: "9px 16px", textAlign: "left", borderBottom: `1px solid ${C.borderLight}`,
//     whiteSpace: "nowrap",
//   },
//   td: {
//     padding: "10px 16px", borderBottom: `1px solid #f7fafc`,
//     fontSize: 12.5, color: C.text2, verticalAlign: "middle",
//   },
// };

// // ── Reusable components ────────────────────────────────────────────────────────
// const Chip = ({ label, bg, color, border, dot }) => (
//   <span style={{
//     display: "inline-flex", alignItems: "center", gap: 4,
//     fontSize: 10, fontWeight: 700, padding: "3px 9px",
//     borderRadius: 20, whiteSpace: "nowrap",
//     background: bg, color,
//     border: border ? `1px solid ${border}` : "none",
//   }}>
//     {dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot, display: "inline-block" }} />}
//     {label}
//   </span>
// );

// const ViewBtn = ({ onClick }) => (
//   <button onClick={onClick} style={{
//     fontSize: 11, fontWeight: 600, color: C.blue, background: C.blueLight,
//     border: `1px solid #dbeafe`, cursor: "pointer",
//     display: "flex", alignItems: "center", gap: 3,
//     padding: "4px 10px", borderRadius: 6,
//   }}>
//     View all →
//   </button>
// );

// const Avatar = ({ name }) => {
//   const letter = (name || "U")[0].toUpperCase();
//   const colors = [
//     { bg: C.blueLight,   color: "#1d4ed8" },
//     { bg: C.violetLight, color: C.violetText },
//     { bg: C.greenBg,     color: C.greenText },
//     { bg: "#dbeafe",     color: "#1e40af" },
//     { bg: "#fef9c3",     color: "#854d0e" },
//   ];
//   const c = colors[letter.charCodeAt(0) % colors.length];
//   return (
//     <div style={{
//       width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
//       display: "flex", alignItems: "center", justifyContent: "center",
//       fontSize: 11, fontWeight: 700, background: c.bg, color: c.color,
//     }}>
//       {letter}
//     </div>
//   );
// };

// const RoleBadge = ({ role }) => {
//   const map = {
//     root:         { bg: "#fef3c7", color: "#92400e" },
//     super_admin:  { bg: C.violetLight, color: C.violetText },
//     ciso:         { bg: "#dbeafe", color: "#1e40af" },
//     risk_manager: { bg: C.greenBg, color: C.greenText },
//   };
//   const s = map[role] || { bg: "#f3f4f6", color: "#374151" };
//   return <Chip label={role?.replace(/_/g, " ") || "user"} bg={s.bg} color={s.color} />;
// };

// const StatusChip = ({ status }) => {
//   const l = status?.toLowerCase();
//   if (l === "open")           return <Chip label="Open"        bg={C.redLight}   color={C.redText}   dot={C.red} />;
//   if (l === "closed")         return <Chip label="Closed"      bg={C.greenBg}    color={C.greenText} dot={C.green} />;
//   if (l?.includes("progress"))return <Chip label="In Progress" bg={C.amberLight} color={C.amberText} dot={C.amber} />;
//   return <Chip label={status || "N/A"} bg="#f3f4f6" color="#374151" />;
// };

// const RiskLevelChip = ({ risk }) => {
//   const l = String(risk.riskLevel || risk.level || "").toLowerCase();
//   if (l === "critical") return <Chip label="Critical" bg={C.redLight}   color={C.redText}   border="#fecaca" />;
//   if (l === "high")     return <Chip label="High"     bg="#fff1f0"      color="#a8071a"     border="#ffa39e" />;
//   if (l === "medium")   return <Chip label="Medium"   bg={C.amberLight} color={C.amberText} border="#fde68a" />;
//   if (l === "low")      return <Chip label="Low"      bg={C.greenLight} color="#065f46"     border="#a7f3d0" />;
//   return <Chip label={risk.riskScore || "—"} bg="#f3f4f6" color="#374151" />;
// };

// const ProgressBar = ({ pct, color, height = 5 }) => (
//   <div style={{ background: "#edf2f7", borderRadius: 100, overflow: "hidden", height }}>
//     <div style={{ width: `${pct}%`, height: "100%", borderRadius: 100, background: color, transition: "width .6s ease" }} />
//   </div>
// );

// // ── Risk Severity + Ecosystem Health card ──────────────────────────────────────
// function RiskSummaryCard({ risks }) {
//   const counts = useMemo(() => {
//     const c = { critical: 0, high: 0, medium: 0, low: 0, closed: 0, inProgress: 0, open: 0 };
//     risks.forEach(r => {
//       const l = String(r.riskLevel || r.level || "").toLowerCase();
//       if (l === "critical") c.critical++;
//       else if (l === "high") c.high++;
//       else if (l === "medium") c.medium++;
//       else if (l === "low") c.low++;
//       const s = String(r.status || "").toLowerCase();
//       if (s === "closed") c.closed++;
//       else if (s.includes("progress")) c.inProgress++;
//       else c.open++;
//     });
//     return c;
//   }, [risks]);

//   const total = risks.length || 1;
//   const healthPct = Math.round((counts.closed / total) * 100);
//   const healthColor = healthPct >= 70 ? C.green : healthPct >= 40 ? C.amber : C.red;
//   const healthLabel = healthPct >= 70 ? "Healthy" : healthPct >= 40 ? "Moderate" : "Needs attention";

//   const bars = [
//     { label: "Critical", count: counts.critical, color: C.red },
//     { label: "High",     count: counts.high,     color: C.orange },
//     { label: "Medium",   count: counts.medium,   color: C.amber },
//     { label: "Low",      count: counts.low,       color: C.green },
//   ];
//   const maxCount = Math.max(...bars.map(b => b.count), 1);

//   return (
//     <div style={S.card}>
//       <div style={S.cardHeader}>
//         <div>
//           <div style={S.cardTitle}>
//             <span style={{ color: C.violet, fontSize: 16 }}>▦</span> Risk Severity
//           </div>
//           <div style={S.cardSub}>Scoped assessment · {risks.length} total</div>
//         </div>
//         <Chip label="Current cycle" bg="#f3f4f6" color="#6b7280" border="#e5e7eb" />
//       </div>

//       <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
//         {bars.map(b => (
//           <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <span style={{ fontSize: 11, fontWeight: 600, color: b.color, width: 52, flexShrink: 0 }}>{b.label}</span>
//             <div style={{ flex: 1, height: 10, background: C.borderLight, borderRadius: 100, overflow: "hidden" }}>
//               <div style={{ width: `${(b.count / maxCount) * 100}%`, height: "100%", background: b.color, borderRadius: 100 }} />
//             </div>
//             <span style={{ fontSize: 11, fontWeight: 700, color: C.text1, width: 20, textAlign: "right" }}>{b.count}</span>
//           </div>
//         ))}
//       </div>

//       <div style={{ padding: "14px 18px", borderTop: `1px solid ${C.borderLight}` }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
//           <span style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: ".8px" }}>
//             Ecosystem Health
//           </span>
//           <span style={{ fontSize: 20, fontWeight: 700, color: healthColor }}>{healthPct}%</span>
//         </div>
//         <ProgressBar pct={healthPct} color={healthColor} height={8} />
//         <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
//           <span style={{ fontSize: 10, color: C.text4, fontWeight: 500 }}>Based on closed / resolved risk ratio</span>
//           <span style={{ fontSize: 10, color: healthColor, fontWeight: 700 }}>{healthLabel}</span>
//         </div>
//         <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
//           {[
//             { val: counts.closed,     label: "Closed",      color: C.green },
//             { val: counts.inProgress, label: "In Progress", color: C.amber },
//             { val: counts.open,       label: "Open",        color: C.red },
//           ].map(s => (
//             <div key={s.label} style={{
//               flex: 1, background: C.tableBg, border: `1px solid ${C.border}`,
//               borderRadius: 8, padding: "7px 10px", textAlign: "center",
//             }}>
//               <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.val}</div>
//               <div style={{ fontSize: 10, color: C.text4, fontWeight: 600, letterSpacing: ".5px" }}>{s.label}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Table helpers ──────────────────────────────────────────────────────────────
// const THead = ({ cols }) => (
//   <thead>
//     <tr>
//       {cols.map((c, i) => (
//         <th key={i} style={{ ...S.th, textAlign: c.right ? "right" : c.center ? "center" : "left" }}>{c.label}</th>
//       ))}
//     </tr>
//   </thead>
// );

// const TRow = ({ children }) => (
//   <tr style={{ transition: "background .15s" }}
//     onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
//     onMouseLeave={e => e.currentTarget.style.background = ""}
//   >
//     {children}
//   </tr>
// );

// // ── Loading ────────────────────────────────────────────────────────────────────
// function LoadingScreen() {
//   return (
//     <div style={{
//       display: "flex", flexDirection: "column", alignItems: "center",
//       justifyContent: "center", height: "90vh", gap: 14, background: C.pageBg,
//     }}>
//       <div style={{
//         width: 36, height: 36, border: `3px solid ${C.border}`,
//         borderTop: `3px solid ${C.blue}`, borderRadius: "50%",
//         animation: "spin .8s linear infinite",
//       }} />
//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//       <span style={{ fontSize: 12, color: C.text3, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
//         Loading Dashboard
//       </span>
//     </div>
//   );
// }

// // ── Main ───────────────────────────────────────────────────────────────────────
// export default function AdminDashboard() {
//   const history = useRouter();
//   const token        = sessionStorage.getItem("token");
//   const user         = JSON.parse(sessionStorage.getItem("user") || "{}");
//   const decoded      = token ? jwtDecode(token) : null;
//   const orgId        = user.organization || decoded?.organization || "";
//   const loggedInRole = (Array.isArray(decoded?.role) ? decoded.role[0] : decoded?.role || "root").toLowerCase();

//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState({ users: [], departments: [], vendors: [], risks: [] });

//   // Vendor Management is a paid-only add-on — never granted during a free
//   // trial (see useModuleEntitlements). Until it's purchased, hide the
//   // "Active Vendors" metric and the Vendor Ledger panel below, and skip the
//   // vendor fetch entirely so a non-entitled org doesn't hit tprm-service.
//   const { loading: entLoading, vendor: vendorEntitled } = useModuleEntitlements();

//   useEffect(() => {
//     if (!token) return;
//     const load = async () => {
//       setLoading(true);
//       try {
//         const [usersRes, deptsRes] = await Promise.allSettled([
//           api.get("/users").catch(() => ({ data: [] })),
//           api.get("/departments").catch(() => ({ data: [] })),
//         ]);
//         const users = Array.isArray(usersRes.value?.data) ? usersRes.value.data : [];
//         const depts = Array.isArray(deptsRes.value?.data) ? deptsRes.value.data : [];
//         const risksRaw = await fetch(RISK_URL, {
//           headers: { Authorization: `Basic ${BASIC_TOKEN}`, "Content-Type": "application/json" },
//         }).then(r => r.ok ? r.json() : []).catch(() => []);
//         const risks = Array.isArray(risksRaw) ? risksRaw : (risksRaw?.content ?? []);
//         const vendors = vendorEntitled
//           ? await axios.get(VENDOR_URL, {
//               headers: { Authorization: `Bearer ${token}` },
//               params: { organization: orgId },
//             }).then(r => Array.isArray(r.data) ? r.data : (r.data?.content ?? [])).catch(() => [])
//           : [];
//         setData({ users, departments: depts, vendors, risks });
//       } catch (err) {
//         console.error("Dashboard load error", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [token, orgId, vendorEntitled]);

//   const deptWorkforce = useMemo(() => {
//     const orgUsers = data.users.filter(u => String(u.organization) === String(orgId));
//     const orgDepts = data.departments.filter(d => String(d.organization) === String(orgId));
//     return orgDepts.map(dept => {
//       const deptId = String(dept._id || dept.id);
//       const count = orgUsers.filter(u => {
//         const d = u.department || u.dept;
//         if (Array.isArray(d)) return d.some(id => String(id) === deptId);
//         return String(d) === deptId;
//       }).length;
//       return {
//         id: deptId, name: dept.name || "Unnamed", count,
//         share: orgUsers.length > 0 ? ((count / orgUsers.length) * 100).toFixed(1) : "0.0",
//       };
//     }).sort((a, b) => b.count - a.count);
//   }, [data.users, data.departments, orgId]);

//   const metrics = [
//     { title: "Total Users",    value: data.users.length,       icon: "👥", accent: C.blue,  accentLight: C.blueLight,  trend: "+12 this month",    trendColor: C.green },
//     { title: "Departments",    value: data.departments.length, icon: "🏛", accent: C.cyan,  accentLight: C.cyanLight,  trend: "Across 3 regions",  trendColor: C.text3 },
//     // Only shown once Vendor Mgmt is actually purchased — hidden for free-trial orgs.
//     ...(vendorEntitled
//       ? [{ title: "Active Vendors", value: data.vendors.length, icon: "🏪", accent: C.green, accentLight: C.greenLight, trend: "+4 onboarded", trendColor: C.green }]
//       : []),
//     { title: "Global Risks",   value: data.risks.length,       icon: "⚠️", accent: C.red,   accentLight: C.redLight,   trend: "6 critical open",   trendColor: C.red },
//   ];

//   const deptAccents = [C.blue, C.cyan, C.violet, C.green, C.amber, C.orange];

//   if (loading || entLoading) return <LoadingScreen />;

//   const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

//   return (
//     <div style={{ background: C.pageBg, minHeight: "100vh", padding: "24px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
//       <div style={{ maxWidth: 1300, margin: "0 auto" }}>

//         {/* ── Header ── */}
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//             <div style={{ width: 38, height: 38, background: C.blue, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛡️</div>
//             <div>
//               <div style={{ fontSize: 20, fontWeight: 700, color: C.text1, letterSpacing: "-.3px" }}>Admin Dashboard</div>
//               <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>Security & Risk Command Centre</div>
//             </div>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 7, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 13px", fontSize: 12, color: C.text2 }}>
//               <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block" }} />
//               Primary Access &nbsp;·&nbsp; <strong>{loggedInRole}</strong>
//             </div>
//             <div style={{ display: "flex", alignItems: "center", gap: 7, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 13px", fontSize: 12, color: C.text2 }}>
//               📅 {today}
//             </div>
//           </div>
//         </div>

//         {/* ── Metric Cards ── */}
//         <div style={{ display: "grid", gridTemplateColumns: `repeat(${metrics.length},1fr)`, gap: 14, marginBottom: 20 }}>
//           {metrics.map((m, i) => (
//             <div key={i} style={{ ...S.card, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
//               <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: m.accent, borderRadius: "4px 0 0 4px" }} />
//               <div style={{ width: 36, height: 36, borderRadius: 9, background: m.accentLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 18 }}>{m.icon}</div>
//               <div style={{ fontSize: 28, fontWeight: 700, color: C.text1, letterSpacing: "-1px", lineHeight: 1 }}>{m.value}</div>
//               <div style={{ fontSize: 11, fontWeight: 600, color: C.text4, textTransform: "uppercase", letterSpacing: ".8px", marginTop: 4 }}>{m.title}</div>
//               <div style={{ fontSize: 11, fontWeight: 600, color: m.trendColor, marginTop: 6 }}>{m.trend}</div>
//             </div>
//           ))}
//         </div>

//         {/* ── Row 2: Risk Summary + Users ── */}
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
//           <RiskSummaryCard risks={data.risks} />

//           <div style={S.card}>
//             <div style={S.cardHeader}>
//               <div>
//                 <div style={S.cardTitle}>👥 Users</div>
//                 <div style={S.cardSub}>Members & access control</div>
//               </div>
//               <ViewBtn onClick={() => history.push("/admin/users")} />
//             </div>
//             <table style={{ width: "100%", borderCollapse: "collapse" }}>
//               <THead cols={[{ label: "Member" }, { label: "Role" }, { label: "Status", center: true }]} />
//               <tbody>
//                 {data.users.slice(0, 6).map((u, i) => (
//                   <TRow key={i}>
//                     <td style={S.td}>
//                       <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
//                         <Avatar name={u.username || u.name || u.email} />
//                         <div>
//                           <div style={{ fontWeight: 600, fontSize: 12.5, color: C.text1 }}>{u.username || u.name || "—"}</div>
//                           <div style={{ fontSize: 11, color: C.text4 }}>{u.email || "—"}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td style={S.td}><RoleBadge role={Array.isArray(u.role) ? u.role[0] : u.role} /></td>
//                     <td style={{ ...S.td, textAlign: "center" }}>
//                       <Chip label="Active" bg={C.greenBg} color={C.greenText} dot={C.green} />
//                     </td>
//                   </TRow>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* ── Risk Ledger ── */}
//         <div style={{ ...S.card, marginBottom: 16 }}>
//           <div style={S.cardHeader}>
//             <div>
//               <div style={S.cardTitle}>🛡 Risk Ledger</div>
//               <div style={S.cardSub}>{data.risks.length} risks in scope · Live tracking</div>
//             </div>
//             <ViewBtn onClick={() => history.push("/admin/risks")} />
//           </div>
//           {data.risks.length === 0 ? (
//             <div style={{ padding: "40px 0", textAlign: "center", fontSize: 12, fontWeight: 700, color: C.text4, textTransform: "uppercase", letterSpacing: "1.5px" }}>No Risks Found</div>
//           ) : (
//             <div style={{ overflowX: "auto" }}>
//               <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                 <THead cols={[{ label: "Risk ID" }, { label: "Department" }, { label: "Category" }, { label: "Description" }, { label: "Level", center: true }, { label: "Status" }, { label: "Updated", right: true }]} />
//                 <tbody>
//                   {data.risks.slice(0, 8).map((r, i) => {
//                     const dt = r.updatedAt || r.createdAt ? new Date(r.updatedAt || r.createdAt) : null;
//                     return (
//                       <TRow key={i}>
//                         <td style={S.td}><span style={{ fontFamily: "monospace", fontSize: 12, color: C.blue, fontWeight: 700 }}>{r.riskId || `RK-${String(i + 1).padStart(3, "0")}`}</span></td>
//                         <td style={S.td}>
//                           <div style={{ fontWeight: 600, fontSize: 12.5, color: C.text1 }}>{r.department || "Global"}</div>
//                           <div style={{ fontSize: 11, color: C.text4 }}>{r.organization || "—"}</div>
//                         </td>
//                         <td style={S.td}><Chip label={r.riskType || "General"} bg={C.violetLight} color={C.violetText} border="#e9d5ff" /></td>
//                         <td style={{ ...S.td, maxWidth: 220 }}><div style={{ fontSize: 12, color: C.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.riskDescription || r.description || "No description."}</div></td>
//                         <td style={{ ...S.td, textAlign: "center" }}><RiskLevelChip risk={r} /></td>
//                         <td style={S.td}><StatusChip status={r.status || "Open"} /></td>
//                         <td style={{ ...S.td, textAlign: "right" }}><span style={{ fontSize: 11, color: C.text4, fontFamily: "monospace" }}>{dt ? dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}</span></td>
//                       </TRow>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* ── Bottom Row ── */}
//         <div style={{ display: "grid", gridTemplateColumns: vendorEntitled ? "1fr 1fr" : "1fr", gap: 16 }}>

//           {/* Vendor Ledger — only for orgs that have actually purchased Vendor Mgmt */}
//           {vendorEntitled && (
//             <div style={S.card}>
//               <div style={S.cardHeader}>
//                 <div>
//                   <div style={S.cardTitle}>🏪 Vendor Ledger</div>
//                   <div style={S.cardSub}>{data.vendors.length} vendors onboarded</div>
//                 </div>
//                 <ViewBtn onClick={() => history.push("/admin/vendors")} />
//               </div>
//               {data.vendors.length === 0 ? (
//                 <div style={{ padding: "40px 0", textAlign: "center", fontSize: 12, color: C.text4, textTransform: "uppercase", letterSpacing: 1.5 }}>No Vendor Data</div>
//               ) : (
//                 <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                   <THead cols={[{ label: "Vendor" }, { label: "Contact" }, { label: "Status" }]} />
//                   <tbody>
//                     {data.vendors.slice(0, 8).map((v, i) => (
//                       <TRow key={i}>
//                         <td style={S.td}><div style={{ fontWeight: 600, fontSize: 12.5, color: C.text1 }}>{v.vendorName || v.name || "—"}</div></td>
//                         <td style={S.td}>
//                           <div style={{ fontSize: 12, color: C.text2 }}>{v.poc || "N/A"}</div>
//                           <div style={{ fontSize: 11, color: C.text4 }}>{v.pocEmail || "No email"}</div>
//                         </td>
//                         <td style={S.td}>
//                           {v.active === false
//                             ? <Chip label="Inactive" bg={C.redLight}  color={C.redText} />
//                             : <Chip label="Active"   bg={C.greenBg}   color={C.greenText} />}
//                         </td>
//                       </TRow>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           )}

//           {/* Workforce Share */}
//           <div style={S.card}>
//             <div style={S.cardHeader}>
//               <div>
//                 <div style={S.cardTitle}>🏛 Workforce Share</div>
//                 <div style={S.cardSub}>Departmental distribution</div>
//               </div>
//               <ViewBtn onClick={() => history.push("/admin/departments")} />
//             </div>
//             {deptWorkforce.length === 0 ? (
//               <div style={{ padding: "40px 0", textAlign: "center", fontSize: 12, color: C.text4, textTransform: "uppercase", letterSpacing: 1.5 }}>No Workforce Data</div>
//             ) : (
//               <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                 <THead cols={[{ label: "Department" }, { label: "Count", center: true }, { label: "Share", right: true }]} />
//                 <tbody>
//                   {deptWorkforce.slice(0, 8).map((dept, i) => {
//                     const accent = deptAccents[i % deptAccents.length];
//                     return (
//                       <TRow key={dept.id}>
//                         <td style={S.td}>
//                           <div style={{ fontWeight: 600, fontSize: 12.5, color: C.text1, marginBottom: 5 }}>{dept.name}</div>
//                           <ProgressBar pct={Number(dept.share)} color={accent} height={5} />
//                         </td>
//                         <td style={{ ...S.td, textAlign: "center" }}>
//                           <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{dept.count}</span>
//                         </td>
//                         <td style={{ ...S.td, textAlign: "right" }}>
//                           <span style={{ fontSize: 12, fontWeight: 700, color: C.text2 }}>{dept.share}%</span>
//                         </td>
//                       </TRow>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             )}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation"; 
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import api from "../../api/adminApi";
import useModuleEntitlements from "../../hooks/useModuleEntitlements";
import integrationApi from "../Toolintegrations/integrationApi";
import { BUILT_IN_PROVIDERS } from "../Toolintegrations/providerMeta";
import { Users, Building2, ShieldAlert, Plug, LayoutDashboard, Shield, Store, Building, ShieldCheck, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const RISK_URL   = process.env.NEXT_PUBLIC_SP + "/risk-service/api/risks";
const VENDOR_URL = process.env.NEXT_PUBLIC_SP + "/tprm-service/api/tprm/vendors";
const LOGGING_BASE_URL = process.env.NEXT_PUBLIC_LOGGING_SERVICE_URL || "https://api.calvant.com/logging-service/api/logs";
const BASIC_TOKEN = btoa("username:password");

// ── Design tokens (light theme) ────────────────────────────────────────────────
const C = {
  pageBg:      "#eef1f8",
  white:       "#ffffff",
  border:      "#e8ebf1",
  borderLight: "#f1f4f8",
  text1:       "#151b2c",
  text2:       "#4a5568",
  text3:       "#718096",
  text4:       "#98a2b3",
  tableBg:     "#f8fafc",
  rowHover:    "#f5f7ff",

  blue:        "#2563eb",
  blueLight:   "#eaf1ff",
  cyan:        "#0891b2",
  cyanLight:   "#e6fbff",
  green:       "#059669",
  greenLight:  "#e9fbf4",
  greenText:   "#166534",
  greenBg:     "#dcfce7",
  amber:       "#d97706",
  amberLight:  "#fffbeb",
  amberText:   "#92400e",
  red:         "#dc2626",
  redLight:    "#fef1f1",
  redText:     "#991b1b",
  violet:      "#7c3aed",
  violetLight: "#f4eeff",
  violetText:  "#6b21a8",
  orange:      "#ea580c",
};

// Gradient pairs for icon tiles — a modern colored-tile look instead of flat
// tinted chips, each with a matching soft glow color for depth.
const GRADIENTS = {
  [C.blue]:   { grad: "linear-gradient(135deg,#60a5fa,#2563eb)", glow: "rgba(37,99,235,0.35)" },
  [C.cyan]:   { grad: "linear-gradient(135deg,#22d3ee,#0891b2)", glow: "rgba(8,145,178,0.35)" },
  [C.green]:  { grad: "linear-gradient(135deg,#34d399,#059669)", glow: "rgba(5,150,105,0.35)" },
  [C.red]:    { grad: "linear-gradient(135deg,#f87171,#dc2626)", glow: "rgba(220,38,38,0.35)" },
  [C.violet]: { grad: "linear-gradient(135deg,#a78bfa,#7c3aed)", glow: "rgba(124,58,237,0.35)" },
  [C.amber]:  { grad: "linear-gradient(135deg,#fbbf24,#d97706)", glow: "rgba(217,119,6,0.35)" },
  [C.orange]: { grad: "linear-gradient(135deg,#fb923c,#ea580c)", glow: "rgba(234,88,12,0.35)" },
};
const gradientFor = (accent) => GRADIENTS[accent] || GRADIENTS[C.blue];

// A small gradient icon tile — used for section-header icons and stat badges,
// giving every glyph a crisp, modern colored surface instead of a flat emoji.
const IconTile = ({ icon, accent, size = 30, radius = 9, fontSize = 15 }) => {
  const g = gradientFor(accent);
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: g.grad, boxShadow: `0 4px 10px -2px ${g.glow}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize, color: "#fff",
    }}>
      {icon}
    </div>
  );
};

// ── Shared styles ──────────────────────────────────────────────────────────────
const S = {
  card: {
    background: "rgba(255, 255, 255, 0.75)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: `1px solid rgba(255, 255, 255, 0.5)`,
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 4px 24px -8px rgba(15,23,42,0.06), inset 0 0 0 1px rgba(255,255,255,0.2)",
    transition: "box-shadow .3s ease, transform .3s ease, border-color .3s ease",
  },
  cardHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 20px", borderBottom: `1px solid ${C.borderLight}`,
  },
  cardTitle: {
    fontSize: 13.5, fontWeight: 700, color: C.text1,
    display: "flex", alignItems: "center", gap: 10,
    letterSpacing: "-0.1px",
  },
  cardSub: { fontSize: 11, color: C.text4, marginTop: 2, fontWeight: 500 },
  th: {
    background: C.tableBg, color: C.text4, fontSize: 10, fontWeight: 700,
    letterSpacing: "0.9px", textTransform: "uppercase",
    padding: "10px 16px", textAlign: "left", borderBottom: `1px solid ${C.borderLight}`,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "11px 16px", borderBottom: `1px solid #f7fafc`,
    fontSize: 12.5, color: C.text2, verticalAlign: "middle",
  },
};

// ── Hover-lift wrapper — every panel rests on a soft ambient shadow and
// lifts into a deeper, cool-toned glow on hover. Keeps the light theme; no
// dark surfaces anywhere.
const HOVER_SHADOW = "0 20px 40px -16px rgba(37, 99, 235, 0.22), 0 4px 12px rgba(15, 23, 42, 0.06)";
const HoverCard = ({ style, children, ...rest }) => (
  <div
    style={{ ...S.card, ...style }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = HOVER_SHADOW;
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.borderColor = "#c7d7fe";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = S.card.boxShadow;
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.borderColor = C.border;
    }}
    {...rest}
  >
    {children}
  </div>
);

// ── Single stat segment inside the metric strip — icon badge + number +
// label, laid out like the reference dashboard's top strip. Highlights on
// its own on hover (cool blue tint), independent of the outer HoverCard.
const StatSegment = ({ metric: m }) => (
  <div
    style={{
      flex: 1, display: "flex", alignItems: "center", gap: 13,
      padding: "13px 18px", borderRadius: 14, cursor: "default",
      transition: "background .18s ease, transform .18s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = m.accentLight;
      e.currentTarget.style.transform = "translateY(-1px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    <IconTile icon={m.icon} accent={m.accent} size={44} radius={13} fontSize={20} />
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 21, fontWeight: 700, color: C.text1, letterSpacing: "-0.4px", lineHeight: 1.15 }}>{m.value}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: C.text3, letterSpacing: ".3px", marginTop: 3, whiteSpace: "nowrap" }}>{m.title}</div>
    </div>
  </div>
);


// ── Reusable components ────────────────────────────────────────────────────────
const Chip = ({ label, bg, color, border, dot }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 10, fontWeight: 700, padding: "3px 9px",
    borderRadius: 20, whiteSpace: "nowrap",
    background: bg, color,
    border: border ? `1px solid ${border}` : "none",
  }}>
    {dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot, display: "inline-block" }} />}
    {label}
  </span>
);

const ViewBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      fontSize: 11.5, fontWeight: 700, color: "#fff",
      background: "linear-gradient(135deg,#3b82f6,#2563eb)",
      border: "none", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 4,
      padding: "7px 14px", borderRadius: 9,
      boxShadow: "0 3px 10px -2px rgba(37,99,235,0.4)",
      transition: "box-shadow .18s ease, transform .18s ease, filter .18s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = "0 6px 16px -2px rgba(37,99,235,0.5)";
      e.currentTarget.style.transform = "translateY(-1px)";
      e.currentTarget.style.filter = "brightness(1.06)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "0 3px 10px -2px rgba(37,99,235,0.4)";
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.filter = "brightness(1)";
    }}
  >
    View all →
  </button>
);

const Avatar = ({ name }) => {
  const letter = (name || "U")[0].toUpperCase();
  const colors = [
    { bg: C.blueLight,   color: "#1d4ed8" },
    { bg: C.violetLight, color: C.violetText },
    { bg: C.greenBg,     color: C.greenText },
    { bg: "#dbeafe",     color: "#1e40af" },
    { bg: "#fef9c3",     color: "#854d0e" },
  ];
  const c = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontWeight: 700, background: c.bg, color: c.color,
    }}>
      {letter}
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const map = {
    root:         { bg: "#fef3c7", color: "#92400e" },
    super_admin:  { bg: C.violetLight, color: C.violetText },
    ciso:         { bg: "#dbeafe", color: "#1e40af" },
    risk_manager: { bg: C.greenBg, color: C.greenText },
  };
  const s = map[role] || { bg: "#f3f4f6", color: "#374151" };
  return <Chip label={role?.replace(/_/g, " ") || "user"} bg={s.bg} color={s.color} />;
};

const StatusChip = ({ status }) => {
  const l = status?.toLowerCase();
  if (l === "open")           return <Chip label="Open"        bg={C.redLight}   color={C.redText}   dot={C.red} />;
  if (l === "closed")         return <Chip label="Closed"      bg={C.greenBg}    color={C.greenText} dot={C.green} />;
  if (l?.includes("progress"))return <Chip label="In Progress" bg={C.amberLight} color={C.amberText} dot={C.amber} />;
  return <Chip label={status || "N/A"} bg="#f3f4f6" color="#374151" />;
};

const RiskLevelChip = ({ risk }) => {
  const l = String(risk.riskLevel || risk.level || "").toLowerCase();
  if (l === "critical") return <Chip label="Critical" bg={C.redLight}   color={C.redText} />;
  if (l === "high")     return <Chip label="High"     bg="#fff1f0"      color="#a8071a" />;
  if (l === "medium")   return <Chip label="Medium"   bg={C.amberLight} color={C.amberText} />;
  if (l === "low")      return <Chip label="Low"      bg={C.greenLight} color="#065f46" />;
  return <Chip label={risk.riskScore || "—"} bg="#f3f4f6" color="#374151" />;
};

const ProgressBar = ({ pct, color, height = 6 }) => (
  <div style={{ background: "rgba(15,23,42,0.06)", borderRadius: 100, overflow: "hidden", height }}>
    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 100, background: color, transition: "width .6s ease" }} />
  </div>
);

const EmptyState = ({ title, icon }) => (
  <div style={{ padding: "48px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
    <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.borderLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.text4, boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}>
      {icon}
    </div>
    <div style={{ fontSize: 13, fontWeight: 700, color: C.text3, letterSpacing: "0.5px" }}>{title}</div>
  </div>
);

// ── Activity Graph Component ───────────────────────────────────────────────────
const ActivityGraph = ({ logs = [] }) => {
  const [period, setPeriod] = useState("Weekly");

  const data = useMemo(() => {
    const counts = {};
    const now = new Date();
    
    logs.forEach(log => {
      const d = new Date(log.timestamp || log.createdAt);
      if (isNaN(d)) return;
      let key;
      if (period === "Weekly") {
        if ((now - d) / (1000 * 60 * 60 * 24) > 7) return;
        key = d.toLocaleDateString("en-US", { weekday: "short" });
      } else if (period === "Monthly") {
        if ((now - d) / (1000 * 60 * 60 * 24) > 30) return;
        key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } else {
        if ((now - d) / (1000 * 60 * 60 * 24) > 365) return;
        key = d.toLocaleDateString("en-US", { month: "short" });
      }
      counts[key] = (counts[key] || 0) + 1;
    });

    const result = [];
    if (period === "Weekly") {
      for(let i=6; i>=0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const k = d.toLocaleDateString("en-US", { weekday: "short" });
        result.push({ name: k, activities: counts[k] || 0 });
      }
    } else if (period === "Monthly") {
      for(let i=29; i>=0; i-=3) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const k = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        result.push({ name: k, activities: counts[k] || 0 });
      }
    } else {
      for(let i=11; i>=0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const k = d.toLocaleDateString("en-US", { month: "short" });
        result.push({ name: k, activities: counts[k] || 0 });
      }
    }
    return result;
  }, [logs, period]);

  return (
    <HoverCard>
      <div style={S.cardHeader}>
        <div>
          <div style={S.cardTitle}><IconTile icon={<Activity size={18} strokeWidth={2.5} />} accent={C.violet} />Activity Logs</div>
          <div style={S.cardSub}>Organization activity overview</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["Weekly", "Monthly", "Yearly"].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 6,
                border: "none", cursor: "pointer",
                background: period === p ? C.blueLight : "transparent",
                color: period === p ? C.blue : C.text3,
                transition: "all .2s ease"
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "20px 20px 5px 0", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.blue} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.text4 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.text4 }} dx={-10} />
            <Tooltip 
              contentStyle={{ borderRadius: 12, border: `1px solid ${C.borderLight}`, boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}
              itemStyle={{ color: C.text1, fontSize: 13, fontWeight: 700 }}
              labelStyle={{ color: C.text4, fontSize: 11, marginBottom: 4 }}
            />
            <Area type="monotone" dataKey="activities" stroke={C.blue} strokeWidth={3} fillOpacity={1} fill="url(#colorAct)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </HoverCard>
  );
};

// ── Risk Severity + Ecosystem Health card ──────────────────────────────────────
function RiskSummaryCard({ risks }) {
  const counts = useMemo(() => {
    const c = { critical: 0, high: 0, medium: 0, low: 0, closed: 0, inProgress: 0, open: 0 };
    risks.forEach(r => {
      const l = String(r.riskLevel || r.level || "").toLowerCase();
      if (l === "critical") c.critical++;
      else if (l === "high") c.high++;
      else if (l === "medium") c.medium++;
      else if (l === "low") c.low++;
      const s = String(r.status || "").toLowerCase();
      if (s === "closed") c.closed++;
      else if (s.includes("progress")) c.inProgress++;
      else c.open++;
    });
    return c;
  }, [risks]);

  const total = risks.length || 1;
  const healthPct = Math.round((counts.closed / total) * 100);
  const healthColor = healthPct >= 70 ? C.green : healthPct >= 40 ? C.amber : C.red;
  const healthLabel = healthPct >= 70 ? "Healthy" : healthPct >= 40 ? "Moderate" : "Needs attention";

  const bars = [
    { label: "Critical", count: counts.critical, color: C.red },
    { label: "High",     count: counts.high,     color: C.orange },
    { label: "Medium",   count: counts.medium,   color: C.amber },
    { label: "Low",      count: counts.low,       color: C.green },
  ];
  const maxCount = Math.max(...bars.map(b => b.count), 1);

  return (
    <HoverCard>
      <div style={S.cardHeader}>
        <div>
          <div style={S.cardTitle}>
            <IconTile icon={<LayoutDashboard size={18} strokeWidth={2.5} />} accent={C.violet} />
            Risk Severity
          </div>
          <div style={S.cardSub}>Scoped assessment · {risks.length} total</div>
        </div>
        <Chip label="Current cycle" bg="#f3f4f6" color="#6b7280" border="#e5e7eb" />
      </div>

      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {bars.map(b => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: b.color, width: 52, flexShrink: 0 }}>{b.label}</span>
            <div style={{ flex: 1, height: 10, background: C.borderLight, borderRadius: 100, overflow: "hidden" }}>
              <div style={{ width: `${(b.count / maxCount) * 100}%`, height: "100%", background: b.color, borderRadius: 100 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.text1, width: 20, textAlign: "right" }}>{b.count}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "14px 18px", borderTop: `1px solid ${C.borderLight}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: ".8px" }}>
            Ecosystem Health
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: healthColor }}>{healthPct}%</span>
        </div>
        <ProgressBar pct={healthPct} color={healthColor} height={8} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 10, color: C.text4, fontWeight: 500 }}>Based on closed / resolved risk ratio</span>
          <span style={{ fontSize: 10, color: healthColor, fontWeight: 700 }}>{healthLabel}</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {[
            { val: counts.closed,     label: "Closed",      color: C.green },
            { val: counts.inProgress, label: "In Progress", color: C.amber },
            { val: counts.open,       label: "Open",        color: C.red },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: C.tableBg, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "7px 10px", textAlign: "center",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: C.text4, fontWeight: 600, letterSpacing: ".5px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </HoverCard>
  );
}

// ── Table helpers ──────────────────────────────────────────────────────────────
const THead = ({ cols }) => (
  <thead>
    <tr>
      {cols.map((c, i) => (
        <th key={i} style={{ ...S.th, textAlign: c.right ? "right" : c.center ? "center" : "left" }}>{c.label}</th>
      ))}
    </tr>
  </thead>
);

const TRow = ({ children }) => (
  <tr style={{ transition: "background .15s" }}
    onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
    onMouseLeave={e => e.currentTarget.style.background = ""}
  >
    {children}
  </tr>
);

// ── Loading ────────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "90vh", gap: 14, background: C.pageBg,
    }}>
      <div style={{
        width: 36, height: 36, border: `3px solid ${C.border}`,
        borderTop: `3px solid ${C.blue}`, borderRadius: "50%",
        animation: "spin .8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: 12, color: C.text3, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
        Loading Dashboard
      </span>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const history = useRouter();
  const token        = sessionStorage.getItem("token");
  const user         = JSON.parse(sessionStorage.getItem("user") || "{}");
  const decoded      = token ? jwtDecode(token) : null;
  const orgId        = user.organization || decoded?.organization || "";
  const loggedInRole = (Array.isArray(decoded?.role) ? decoded.role[0] : decoded?.role || "root").toLowerCase();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ users: [], departments: [], vendors: [], risks: [] });
  const [activityLogs, setActivityLogs] = useState([]);
  const [integrationCount, setIntegrationCount] = useState(0);

  // Vendor Management is a paid-only add-on — never granted during a free
  // trial (see useModuleEntitlements). Until it's purchased, hide the
  // "Active Vendors" metric and the Vendor Ledger panel below, and skip the
  // vendor fetch entirely so a non-entitled org doesn't hit tprm-service.
  const { loading: entLoading, vendor: vendorEntitled } = useModuleEntitlements();

  // ── Integrations connected — same tenantId resolution + counting logic
  // as IntegrationsPage.jsx (built-in providers with saved config + active
  // custom tools), just surfaced here as a single glance-able number.
  useEffect(() => {
    let cancelled = false;
    const loadIntegrationCount = async () => {
      try {
        let tenantId = sessionStorage.getItem("tenantId");
        if (!tenantId) {
          const orgObjId = user?.organization?._id ?? user?.organization;
          if (!orgObjId) return;
          const res = await axios.get(
            `https://api.calvant.com/user-service/api/organizations/${orgObjId}/tenant`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          tenantId = res.data;
          if (tenantId) sessionStorage.setItem("tenantId", tenantId);
        }
        if (!tenantId) return;

        const [config, customs] = await Promise.all([
          integrationApi.getBuiltInConfig(tenantId).catch(() => ({})),
          integrationApi.getAllCustom(tenantId).catch(() => []),
        ]);
        const customList = Array.isArray(customs) ? customs : customs?.data ?? customs?.items ?? [];
        const connectedBuiltIn = BUILT_IN_PROVIDERS.filter(p => !!(config ?? {})[p.configKey ?? p.key]).length;
        const activeCustom = customList.filter(c => c.status === "ACTIVE").length;
        if (!cancelled) setIntegrationCount(connectedBuiltIn + activeCustom);
      } catch (err) {
        console.error("Integration count load error", err);
      }
    };
    if (token) loadIntegrationCount();
    return () => { cancelled = true; };
  }, [token, orgId]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      try {
        const [usersRes, deptsRes] = await Promise.allSettled([
          api.get("/users").catch(() => ({ data: [] })),
          api.get("/departments").catch(() => ({ data: [] })),
        ]);
        const users = Array.isArray(usersRes.value?.data) ? usersRes.value.data : [];
        const depts = Array.isArray(deptsRes.value?.data) ? deptsRes.value.data : [];
        const risksRaw = await fetch(RISK_URL, {
          headers: { Authorization: `Basic ${BASIC_TOKEN}`, "Content-Type": "application/json" },
        }).then(r => r.ok ? r.json() : []).catch(() => []);
        const risks = Array.isArray(risksRaw) ? risksRaw : (risksRaw?.content ?? []);
        const vendors = vendorEntitled
          ? await axios.get(VENDOR_URL, {
              headers: { Authorization: `Bearer ${token}` },
              params: { organization: orgId },
            }).then(r => Array.isArray(r.data) ? r.data : (r.data?.content ?? [])).catch(() => [])
          : [];
        
        if (loggedInRole === "root") {
          const logsRaw = await fetch(LOGGING_BASE_URL, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(r => r.ok ? r.json() : []).catch(() => []);
          const logs = Array.isArray(logsRaw) ? logsRaw : (logsRaw?.content ?? []);
          setActivityLogs(logs);
        }

        setData({ users, departments: depts, vendors, risks });
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, orgId, vendorEntitled, loggedInRole]);

  const deptWorkforce = useMemo(() => {
    const orgUsers = data.users.filter(u => String(u.organization) === String(orgId));
    const orgDepts = data.departments.filter(d => String(d.organization) === String(orgId));
    return orgDepts.map(dept => {
      const deptId = String(dept._id || dept.id);
      const count = orgUsers.filter(u => {
        const d = u.department || u.dept;
        if (Array.isArray(d)) return d.some(id => String(id) === deptId);
        return String(d) === deptId;
      }).length;
      return {
        id: deptId, name: dept.name || "Unnamed", count,
        share: orgUsers.length > 0 ? ((count / orgUsers.length) * 100).toFixed(1) : "0.0",
      };
    }).sort((a, b) => b.count - a.count);
  }, [data.users, data.departments, orgId]);

  const metrics = [
    { title: "Total Users",    value: data.users.length,       icon: <Users size={24} strokeWidth={2.5} />, accent: C.blue,  accentLight: C.blueLight,  trend: "+12 this month",    trendColor: C.green },
    { title: "Departments",    value: data.departments.length, icon: <Building2 size={24} strokeWidth={2.5} />, accent: C.cyan,  accentLight: C.cyanLight,  trend: "Across 3 regions",  trendColor: C.text3 },
    // Only shown once Vendor Mgmt is actually purchased — hidden for free-trial orgs.
    ...(vendorEntitled
      ? [{ title: "Active Vendors", value: data.vendors.length, icon: <Store size={24} strokeWidth={2.5} />, accent: C.green, accentLight: C.greenLight, trend: "+4 onboarded", trendColor: C.green }]
      : []),
    { title: "Global Risks",   value: data.risks.length,       icon: <ShieldAlert size={24} strokeWidth={2.5} />, accent: C.red,   accentLight: C.redLight,   trend: "6 critical open",   trendColor: C.red },
    { title: "Integrations",  value: integrationCount,         icon: <Plug size={24} strokeWidth={2.5} />, accent: C.violet, accentLight: C.violetLight, trend: "Connected tools",  trendColor: C.violet },
  ];

  const deptAccents = [C.blue, C.cyan, C.violet, C.green, C.amber, C.orange];

  if (loading || entLoading) return <LoadingScreen />;

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{
      background: "radial-gradient(circle at 15% 0%, #eef2ff 0%, #eef1f8 38%, #eef1f8 100%)",
      minHeight: "100vh", padding: "28px 24px",
      fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44,
              background: "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
              borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, boxShadow: "0 8px 20px -4px rgba(99,80,238,0.4)",
            }}><ShieldCheck color="#fff" size={24} strokeWidth={2.5} /></div>
            <div>
              <div style={{
                fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px",
                color: C.text1,
              }}>Admin Dashboard</div>
              <div style={{ fontSize: 12.5, color: C.text3, marginTop: 3, fontWeight: 500 }}>Security & Risk Command Centre</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: C.white, border: `1px solid ${C.border}`, boxShadow: "0 1px 2px rgba(15,23,42,0.04)", borderRadius: 10, padding: "7px 14px", fontSize: 12, color: C.text2, fontWeight: 500 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block", boxShadow: `0 0 0 4px ${C.greenLight}` }} />
              Primary Access &nbsp;·&nbsp; <strong style={{ color: C.text1 }}>{loggedInRole}</strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: C.white, border: `1px solid ${C.border}`, boxShadow: "0 1px 2px rgba(15,23,42,0.04)", borderRadius: 10, padding: "7px 14px", fontSize: 12, color: C.text2, fontWeight: 500 }}>
              📅 {today}
            </div>
          </div>
        </div>

        {/* ── Metric Strip — single pill, icon + number + label per stat,
             matching the reference layout, with a cool hover highlight on
             each segment individually rather than a boxed card per metric. ── */}
        <HoverCard style={{ padding: "6px 4px", marginBottom: 22, overflow: "visible" }}>
          <div style={{ display: "flex", alignItems: "stretch" }}>
            {metrics.map((m, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ width: 1, background: C.borderLight, margin: "8px 2px" }} />}
                <StatSegment metric={m} />
              </React.Fragment>
            ))}
          </div>
        </HoverCard>

        {/* ── Row 2: Risk Summary + Activity Graph ── */}
        <div style={{ display: "grid", gridTemplateColumns: loggedInRole === "root" ? "1fr 1fr" : "1fr", gap: 16, marginBottom: 16 }}>
          <RiskSummaryCard risks={data.risks} />
          {loggedInRole === "root" && <ActivityGraph logs={activityLogs} />}
        </div>

        {/* ── Risk Ledger ── */}
        <HoverCard style={{ marginBottom: 16 }}>
          <div style={S.cardHeader}>
            <div>
              <div style={S.cardTitle}><IconTile icon={<Shield size={18} strokeWidth={2.5} />} accent={C.red} />Risk Ledger</div>
              <div style={S.cardSub}>{data.risks.length} risks in scope · Live tracking</div>
            </div>
            <ViewBtn onClick={() => history.push("/admin/risks")} />
          </div>
          {data.risks.length === 0 ? (
            <EmptyState title="No Risks Found" icon={<Shield size={24} strokeWidth={2} />} />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <THead cols={[{ label: "Risk ID" }, { label: "Department" }, { label: "Category" }, { label: "Description" }, { label: "Level", center: true }, /* { label: "Status" }, */ { label: "Updated", right: true }]} />
                <tbody>
                  {data.risks.slice(0, 8).map((r, i) => {
                    const dt = r.updatedAt || r.createdAt ? new Date(r.updatedAt || r.createdAt) : null;
                    return (
                      <TRow key={i}>
                        <td style={S.td}><span style={{ fontFamily: "monospace", fontSize: 12, color: C.blue, fontWeight: 700 }}>{r.riskId || `RK-${String(i + 1).padStart(3, "0")}`}</span></td>
                        <td style={S.td}>
                          <div style={{ fontWeight: 600, fontSize: 12.5, color: C.text1 }}>{r.department || "Global"}</div>
                          <div style={{ fontSize: 11, color: C.text4 }}>{r.organization || "—"}</div>
                        </td>
                        <td style={S.td}><Chip label={r.riskType || "General"} bg={C.violetLight} color={C.violetText} border="#e9d5ff" /></td>
                        <td style={{ ...S.td, maxWidth: 220 }}><div style={{ fontSize: 12, color: C.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.riskDescription || r.description || "No description."}</div></td>
                        <td style={{ ...S.td, textAlign: "center" }}><RiskLevelChip risk={r} /></td>
                        {/* <td style={S.td}><StatusChip status={r.status || "Open"} /></td> */}
                        <td style={{ ...S.td, textAlign: "right" }}><span style={{ fontSize: 11, color: C.text4, fontFamily: "monospace" }}>{dt ? dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}</span></td>
                      </TRow>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </HoverCard>

        {/* ── Bottom Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: vendorEntitled ? "1fr 1fr 1fr" : "1fr 1fr", gap: 16 }}>

          {/* Vendor Ledger — only for orgs that have actually purchased Vendor Mgmt */}
          {vendorEntitled && (
            <HoverCard>
              <div style={S.cardHeader}>
                <div>
                  <div style={S.cardTitle}><IconTile icon={<Store size={18} strokeWidth={2.5} />} accent={C.green} />Vendor Ledger</div>
                  <div style={S.cardSub}>{data.vendors.length} vendors onboarded</div>
                </div>
                <ViewBtn onClick={() => history.push("/admin/vendors")} />
              </div>
              {data.vendors.length === 0 ? (
                <EmptyState title="No Vendor Data" icon={<Store size={24} strokeWidth={2} />} />
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <THead cols={[{ label: "Vendor" }, { label: "Contact" }, { label: "Status" }]} />
                  <tbody>
                    {data.vendors.slice(0, 8).map((v, i) => (
                      <TRow key={i}>
                        <td style={S.td}><div style={{ fontWeight: 600, fontSize: 12.5, color: C.text1 }}>{v.vendorName || v.name || "—"}</div></td>
                        <td style={S.td}>
                          <div style={{ fontSize: 12, color: C.text2 }}>{v.poc || "N/A"}</div>
                          <div style={{ fontSize: 11, color: C.text4 }}>{v.pocEmail || "No email"}</div>
                        </td>
                        <td style={S.td}>
                          {v.active === false
                            ? <Chip label="Inactive" bg={C.redLight}  color={C.redText} />
                            : <Chip label="Active"   bg={C.greenBg}   color={C.greenText} />}
                        </td>
                      </TRow>
                    ))}
                  </tbody>
                </table>
              )}
            </HoverCard>
          )}

          {/* Users Card */}
          <HoverCard>
            <div style={S.cardHeader}>
              <div>
                <div style={S.cardTitle}><IconTile icon={<Users size={18} strokeWidth={2.5} />} accent={C.blue} />Users</div>
                <div style={S.cardSub}>Members & access control</div>
              </div>
              <ViewBtn onClick={() => history.push("/admin/users")} />
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <THead cols={[{ label: "Member" }, { label: "Role" }, { label: "Status", center: true }]} />
              <tbody>
                {data.users.slice(0, 6).map((u, i) => (
                  <TRow key={i}>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <Avatar name={u.username || u.name || u.email} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12.5, color: C.text1 }}>{u.username || u.name || "—"}</div>
                          <div style={{ fontSize: 11, color: C.text4 }}>{u.email || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}><RoleBadge role={Array.isArray(u.role) ? u.role[0] : u.role} /></td>
                    <td style={{ ...S.td, textAlign: "center" }}>
                      <Chip label="Active" bg={C.greenBg} color={C.greenText} dot={C.green} />
                    </td>
                  </TRow>
                ))}
              </tbody>
            </table>
          </HoverCard>

          {/* Workforce Share */}
          <HoverCard>
            <div style={S.cardHeader}>
              <div>
                <div style={S.cardTitle}><IconTile icon={<Building size={18} strokeWidth={2.5} />} accent={C.cyan} />Workforce Share</div>
                <div style={S.cardSub}>Departmental distribution</div>
              </div>
              <ViewBtn onClick={() => history.push("/admin/departments")} />
            </div>
            {deptWorkforce.length === 0 ? (
              <EmptyState title="No Workforce Data" icon={<Building size={24} strokeWidth={2} />} />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <THead cols={[{ label: "Department" }, { label: "Count", center: true }, { label: "Share", right: true }]} />
                <tbody>
                  {deptWorkforce.slice(0, 8).map((dept, i) => {
                    const accent = deptAccents[i % deptAccents.length];
                    return (
                      <TRow key={dept.id}>
                        <td style={S.td}>
                          <div style={{ fontWeight: 600, fontSize: 12.5, color: C.text1, marginBottom: 5 }}>{dept.name}</div>
                          <ProgressBar pct={Number(dept.share)} color={accent} height={5} />
                        </td>
                        <td style={{ ...S.td, textAlign: "center" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{dept.count}</span>
                        </td>
                        <td style={{ ...S.td, textAlign: "right" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.text2 }}>{dept.share}%</span>
                        </td>
                      </TRow>
                    );
                  })}
                </tbody>
              </table>
            )}
          </HoverCard>

        </div>
      </div>
    </div>
  );
}