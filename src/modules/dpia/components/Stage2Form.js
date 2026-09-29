import Link from 'next/link';
// //C:\Users\ak192\Downloads\cf-tool-frontend-prod (6)\cf-tool-frontend-prod\src\modules\dpia\components\Stage2Form.js

// import React, { useState, useEffect, useMemo } from "react";
// import { FONT, BLUE, DARK, APP_COLORS } from "./shared";

// const OTHERS_COUNT = 10;

// // ─── Fallback hardcoded list (used only when Stage 1 has no personalData) ─────
// const FALLBACK_SECTIONS = [
//   {
//     id: "pii",
//     label: "Personally Identifiable Information (PII)",
//     color: "#3b82f6",
//     desc: "Data elements that can identify or contact a single person",
//     items: [
//       "Name",
//       "Gender",
//       "Age and date of birth",
//       "Marital status",
//       "Citizenship",
//       "Nationality",
//       "Languages spoken",
//       "Veteran status",
//       "Disability status",
//       "Business and personal address",
//       "Business and personal phone number",
//       "Business and personal email address",
//       "Employment history",
//       "Job-related history",
//       "Employee relations",
//       "Internal identification numbers (Emp Id)",
//       "Identity verification information",
//       "Labor relations",
//       "Photographs or video records",
//       "Family",
//       "Contacts",
//       "Expatriate information",
//       "Relocation information",
//       "Certificates and licenses",
//       "Demographic",
//       "Education and training",
//       "Lifestyle",
//       "Habits",
//       "Personal communications",
//       "Compliance records",
//       "Community and charitable services",
//       "Compensation/remuneration related matters",
//       "Payroll",
//       "Transaction",
//       "Income",
//       "Assets",
//       "Internet and email use, including IP addresses",
//       "Government-issued identification numbers",
//       "Health & Medical Records",
//       "Racial or ethnic origin",
//       "Political opinions",
//       "Religious beliefs",
//       "Criminal history",
//       "Genetic details",
//       "Biometric",
//       "Credit information",
//       "Account numbers",
//       "Personal financial information",
//       "Credit score",
//       "Background investigation reports",
//     ],
//   },
// ];

// // ─── Styles ───────────────────────────────────────────────────────────────────
// const S = {
//   wrap: { fontFamily: FONT, color: "#1a2233", paddingBottom: 40 },
//   banner: {
//     background: `linear-gradient(110deg,${DARK} 0%,#1a3a6e 60%,${BLUE} 100%)`,
//     borderRadius: 14,
//     padding: "22px 28px",
//     marginBottom: 24,
//     color: "#fff",
//   },
//   bannerEye: {
//     fontSize: 11,
//     fontWeight: 700,
//     letterSpacing: "2.5px",
//     textTransform: "uppercase",
//     color: "#7eb3f5",
//     marginBottom: 5,
//   },
//   bannerH: { fontSize: 21, fontWeight: 800, marginBottom: 8 },
//   bannerSub: { fontSize: 13, color: "#bdd4f0", lineHeight: 1.6 },
//   summary: {
//     background: "#f0f4fb",
//     border: "1px solid #dde3ef",
//     borderRadius: 10,
//     padding: "12px 18px",
//     marginBottom: 16,
//     display: "flex",
//     gap: 16,
//     flexWrap: "wrap",
//     alignItems: "center",
//   },
//   pill: (c) => ({
//     fontSize: 12,
//     fontWeight: 700,
//     color: c,
//     background: `${c}12`,
//     padding: "3px 10px",
//     borderRadius: 20,
//   }),
//   emptyBanner: {
//     background: "#fffbeb",
//     border: "1.5px solid #fcd34d",
//     borderRadius: 10,
//     padding: "14px 18px",
//     marginBottom: 16,
//     fontSize: 13,
//     color: "#92400e",
//     fontWeight: 600,
//   },
//   sectionCard: {
//     background: "#fff",
//     border: "1px solid #e4eaf4",
//     borderRadius: 12,
//     marginBottom: 16,
//     overflow: "hidden",
//     boxShadow: "0 1px 5px rgba(15,34,71,0.06)",
//   },
//   sectionHead: (c) => ({
//     background: `linear-gradient(90deg,${c}18,transparent)`,
//     borderLeft: `4px solid ${c}`,
//     padding: "12px 18px",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//   }),
//   sectionTitle: (c) => ({ fontSize: 13, fontWeight: 700, color: c }),
//   sectionDesc: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
//   sectionCount: (c) => ({
//     background: `${c}18`,
//     color: c,
//     borderRadius: 20,
//     padding: "2px 10px",
//     fontSize: 11,
//     fontWeight: 700,
//   }),
//   colTable: { width: "100%", borderCollapse: "collapse" },
//   colTh: (c) => ({
//     background: `${c}12`,
//     color: c,
//     fontWeight: 700,
//     fontSize: 12,
//     padding: "10px 12px",
//     textAlign: "center",
//     borderBottom: `2px solid ${c}`,
//     borderRight: "1px solid #eef1f8",
//     whiteSpace: "nowrap",
//   }),
//   colThLabel: {
//     background: "#f0f4fb",
//     color: "#374151",
//     fontWeight: 700,
//     fontSize: 12,
//     padding: "10px 12px",
//     textAlign: "left",
//     borderBottom: "2px solid #dde3ef",
//     borderRight: "1px solid #eef1f8",
//     minWidth: 200,
//   },
//   colTd: (chk, c) => ({
//     padding: "8px 12px",
//     borderBottom: "1px solid #eef1f8",
//     borderRight: "1px solid #eef1f8",
//     textAlign: "center",
//     background: chk ? `${c}08` : "#fff",
//     transition: "background 0.12s",
//     cursor: "pointer",
//   }),
//   colTdLabel: (any, c) => ({
//     padding: "8px 12px",
//     borderBottom: "1px solid #eef1f8",
//     borderRight: "1px solid #eef1f8",
//     fontSize: 12.5,
//     color: any ? c : "#374151",
//     fontWeight: any ? 600 : 400,
//     background: any ? `${c}06` : "#fff",
//   }),
//   checkbox: (c) => ({
//     accentColor: c,
//     width: 16,
//     height: 16,
//     cursor: "pointer",
//   }),
//   selectRow: {
//     display: "flex",
//     gap: 6,
//     padding: "8px 16px",
//     borderBottom: "1px solid #eef1f8",
//     background: "#fafbfd",
//     flexWrap: "wrap",
//   },
//   selectBtn: (c) => ({
//     fontSize: 11,
//     fontWeight: 700,
//     color: c,
//     cursor: "pointer",
//     background: "none",
//     border: `1px solid ${c}44`,
//     borderRadius: 6,
//     padding: "3px 10px",
//     fontFamily: FONT,
//   }),
//   othersCard: {
//     background: "#fff",
//     border: "1px solid #e4eaf4",
//     borderRadius: 12,
//     marginBottom: 16,
//     overflow: "hidden",
//     boxShadow: "0 1px 5px rgba(15,34,71,0.06)",
//   },
//   othersHead: {
//     background: "#f9fafc",
//     borderLeft: "4px solid #6b7280",
//     padding: "12px 18px",
//     fontSize: 13,
//     fontWeight: 700,
//     color: "#374151",
//   },
//   otherRow: (i) => ({
//     display: "flex",
//     alignItems: "center",
//     gap: 12,
//     padding: "10px 16px",
//     background: i % 2 === 0 ? "#fff" : "#fafbfd",
//     borderBottom: "1px solid #eef1f8",
//   }),
//   otherInput: {
//     flex: 1,
//     border: "1px solid #dde3ef",
//     borderRadius: 7,
//     padding: "6px 10px",
//     fontSize: 13,
//     color: "#1a2233",
//     outline: "none",
//     background: "#fff",
//     fontFamily: FONT,
//   },
//   otherChk: (c) => ({
//     display: "flex",
//     alignItems: "center",
//     gap: 4,
//     fontSize: 12,
//     fontWeight: 600,
//     color: c,
//     cursor: "pointer",
//   }),
//   btnRow: { display: "flex", justifyContent: "space-between", marginTop: 8 },
//   backBtn: {
//     background: "transparent",
//     border: `1.5px solid ${BLUE}`,
//     color: BLUE,
//     borderRadius: 8,
//     padding: "9px 22px",
//     fontSize: 13,
//     fontWeight: 700,
//     cursor: "pointer",
//     fontFamily: FONT,
//   },
//   nextBtn: (d) => ({
//     background: d ? "#9ca3af" : `linear-gradient(90deg,${DARK},${BLUE})`,
//     color: "#fff",
//     border: "none",
//     borderRadius: 10,
//     padding: "11px 28px",
//     fontSize: 14,
//     fontWeight: 700,
//     cursor: d ? "not-allowed" : "pointer",
//     boxShadow: d ? "none" : "0 4px 14px #1e4d8c44",
//     fontFamily: FONT,
//   }),
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// /**
//  * Parse a comma-separated personalData string into a trimmed array.
//  */
// function parseElements(str) {
//   return (str || "")
//     .split(",")
//     .map((e) => e.trim())
//     .filter(Boolean);
// }

// /**
//  * Derive one entry per valid Stage 1 row containing:
//  *   colLabel  — unique column label (includes dataSubject for clarity)
//  *   elements  — personal data elements (empty since column is hidden in Stage 1)
//  *
//  * Since Personal Data Elements column is hidden in Stage 1, elements will be empty.
//  * Users will freely select elements in Stage 2 using the table.
//  *
//  * Example:
//  *   Row: appName="HR Portal", dataSubject="Current Employee", personalData=""
//  *   → { colLabel: "HR Portal (Current Employee)", elements: [] }
//  */
// function deriveAppEntries(rows) {
//   if (!rows || rows.length === 0) return [];
//   const validRows = rows.filter((r) => r.appName?.trim());
//   if (validRows.length === 0) return [];

//   // Count occurrences of each appName to detect duplicates
//   const counts = {};
//   validRows.forEach((r) => {
//     const base = r.appName.trim();
//     counts[base] = (counts[base] || 0) + 1;
//   });

//   const occurrence = {};
//   return validRows.map((r) => {
//     const base = r.appName.trim();
//     let colLabel = base;
    
//     // Include dataSubject in column label for clarity
//     const subject = r.dataSubject?.trim();
//     if (subject) {
//       colLabel = `${base} (${subject})`;
//     } else if (counts[base] > 1) {
//       // If no subject selected, use occurrence number for duplicates
//       occurrence[base] = (occurrence[base] || 0) + 1;
//       colLabel = `${base} (${occurrence[base]})`;
//     }
    
//     // 🟢 IMPORTANT: Personal Data Elements column is hidden in Stage 1
//     // So personalData will be empty. Users select them freely here in Stage 2.
//     return { 
//       colLabel, 
//       elements: parseElements(r.personalData) 
//     };
//   });
// }

// // ─── Stage2Form ───────────────────────────────────────────────────────────────
// export default function Stage2Form({
//   rows = [],
//   applications = [],
//   initialData = {},
//   onBack,
//   onNext,
//   loading,
// }) {
//   // ── Derive one entry per Stage 1 row: { colLabel, elements } ───────────────
//   // appEntries drives BOTH the columns (appList) and the per-column row list
//   const appEntries = useMemo(() => {
//     const entries = deriveAppEntries(rows);
//     if (entries.length > 0) return entries;
//     // Fallback: use applications prop with no pre-known elements
//     const fromProp = (applications || []).filter((a) => a?.trim());
//     const labels = fromProp.length > 0 ? fromProp : ["A1", "A2", "A3", "A4"];
//     return labels.map((colLabel) => ({ colLabel, elements: [] }));
//   }, [rows, applications]);

//   // Flat list of column labels — used for headers, pills, handlers
//   const appList = useMemo(() => appEntries.map((e) => e.colLabel), [appEntries]);

//   // Map colLabel → Set of elements that belong to it (from Stage 1)
//   // Since Stage 1 elements are now empty, this will be empty Sets
//   const appElementsMap = useMemo(
//     () => Object.fromEntries(appEntries.map((e) => [e.colLabel, new Set(e.elements)])),
//     [appEntries]
//   );

//   // All unique elements across all rows (union) — used as the row list
//   // Since Stage 1 elements are empty, this will be empty initially
//   const allElements = useMemo(() => {
//     const seen = new Set();
//     appEntries.forEach((e) => e.elements.forEach((el) => seen.add(el)));
//     return [...seen];
//   }, [appEntries]);

//   // Always show the full hardcoded list.
//   // Users can freely select any element for any column.
//   const sections = FALLBACK_SECTIONS;

//   const getColor = (app) =>
//     APP_COLORS[appList.indexOf(app) % APP_COLORS.length];

//   // ── State ──────────────────────────────────────────────────────────────────
//   const initChecked = () => {
//     // Edit mode: restore from saved data
//     if (initialData?.checked) {
//       return Object.fromEntries(
//         Object.entries(initialData.checked).map(([k, v]) => [k, new Set(v)])
//       );
//     }
//     // Fresh mode: start with empty selections (since Stage 1 elements are empty)
//     return Object.fromEntries(
//       appList.map((app) => [app, new Set()])
//     );
//   };

//   const [checked, setChecked] = useState(initChecked);
//   const [others, setOthers] = useState(() => {
//     if (initialData?.customElements?.length) {
//       const arr = Array(OTHERS_COUNT)
//         .fill(null)
//         .map(() => ({ label: "", apps: new Set() }));
//       initialData.customElements.forEach((e, i) => {
//         if (i < OTHERS_COUNT)
//           arr[i] = {
//             label: e.label || "",
//             apps: new Set(e.selectedApplications || []),
//           };
//       });
//       return arr;
//     }
//     return Array(OTHERS_COUNT)
//       .fill(null)
//       .map(() => ({ label: "", apps: new Set() }));
//   });

//   // Sync checked state when appEntries changes (e.g. navigating back to Stage 1)
//   useEffect(() => {
//     setChecked((prev) => {
//       const next = { ...prev };
//       appList.forEach((app) => {
//         // Only initialise missing columns — don't overwrite user edits
//         if (!next[app]) next[app] = new Set();
//       });
//       return next;
//     });
//   }, [appList]);

//   // ── Handlers ───────────────────────────────────────────────────────────────
//   const toggle = (app, item) =>
//     setChecked((prev) => {
//       const s = new Set(prev[app]);
//       s.has(item) ? s.delete(item) : s.add(item);
//       return { ...prev, [app]: s };
//     });

//   const selectAll = (app, items) =>
//     setChecked((prev) => ({
//       ...prev,
//       [app]: new Set([...prev[app], ...items]),
//     }));

//   const clearAll = (app, items) =>
//     setChecked((prev) => {
//       const s = new Set(prev[app]);
//       items.forEach((i) => s.delete(i));
//       return { ...prev, [app]: s };
//     });

//   const selectAllItems = (items) =>
//     setChecked((prev) => {
//       const n = { ...prev };
//       appList.forEach((a) => {
//         n[a] = new Set([...n[a], ...items]);
//       });
//       return n;
//     });

//   const clearAllItems = (items) =>
//     setChecked((prev) => {
//       const n = { ...prev };
//       appList.forEach((a) => {
//         const s = new Set(n[a]);
//         items.forEach((i) => s.delete(i));
//         n[a] = s;
//       });
//       return n;
//     });

//   const countFor = (app) => checked[app]?.size || 0;
//   const totalSelected = appList.reduce((sum, a) => sum + countFor(a), 0);

//   const updOtherLabel = (i, label) => {
//     const n = [...others];
//     n[i] = { ...n[i], label };
//     setOthers(n);
//   };

//   const toggleOtherApp = (i, app) => {
//     const n = [...others];
//     const apps = new Set(n[i].apps);
//     apps.has(app) ? apps.delete(app) : apps.add(app);
//     n[i] = { ...n[i], apps };
//     setOthers(n);
//   };

//   const handleNext = () => {
//     const checkedArrays = Object.fromEntries(
//       appList.map((a) => [a, Array.from(checked[a] || [])])
//     );
//     const customElements = others
//       .filter((o) => o.label.trim() !== "")
//       .map((o) => ({
//         label: o.label,
//         selectedApplications: Array.from(o.apps),
//       }));
//     onNext({ checked: checkedArrays, customElements, applications: appList });
//   };

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <div style={S.wrap}>
//       <link
//         href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
//         rel="stylesheet"
//       />

//       {/* Banner */}
//       <div style={S.banner}>
//         <div style={S.bannerEye}>Stage 2 of 3</div>
//         <div style={S.bannerH}>Personal Data Elements</div>
//         <div style={S.bannerSub}>
//           Select personal data elements collected per application. Columns are
//           drawn from the Application Names and Data Subjects entered in Stage 1.
//           Freely select any elements for each application.
//         </div>
//       </div>

//       {/* Selection summary */}
//       <div style={S.summary}>
//         <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
//           Total selected:{" "}
//           <strong style={{ color: "#1a2233" }}>{totalSelected}</strong>
//         </span>
//         {appList.map((app) => (
//           <span key={app} style={S.pill(getColor(app))}>
//             {app}: {countFor(app)}
//           </span>
//         ))}
//       </div>

//       {/* Sections */}
//       {sections.map((section) => {
//         const totalInSection = appList.reduce(
//           (sum, a) =>
//             sum + section.items.filter((i) => checked[a]?.has(i)).length,
//           0
//         );
//         return (
//           <div key={section.id} style={S.sectionCard}>
//             {/* Section header */}
//             <div style={S.sectionHead(section.color)}>
//               <div>
//                 <div style={S.sectionTitle(section.color)}>{section.label}</div>
//                 <div style={S.sectionDesc}>{section.desc}</div>
//               </div>
//               {totalInSection > 0 && (
//                 <span style={S.sectionCount(section.color)}>
//                   {totalInSection} selected
//                 </span>
//               )}
//             </div>

//             {/* Quick select / clear row */}
//             <div style={S.selectRow}>
//               <span
//                 style={{
//                   fontSize: 11,
//                   color: "#9ca3af",
//                   fontWeight: 600,
//                   alignSelf: "center",
//                 }}
//               >
//                 Quick select:
//               </span>
//               {appList.map((app) => (
//                 <React.Fragment key={app}>
//                   <button
//                     style={S.selectBtn(getColor(app))}
//                     onClick={() => selectAll(app, section.items)}
//                   >
//                     {app}: All
//                   </button>
//                   <button
//                     style={S.selectBtn("#9ca3af")}
//                     onClick={() => clearAll(app, section.items)}
//                   >
//                     {app}: Clear
//                   </button>
//                 </React.Fragment>
//               ))}
//               <button
//                 style={S.selectBtn(section.color)}
//                 onClick={() => selectAllItems(section.items)}
//               >
//                 All: Select
//               </button>
//               <button
//                 style={S.selectBtn("#9ca3af")}
//                 onClick={() => clearAllItems(section.items)}
//               >
//                 All: Clear
//               </button>
//             </div>

//             {/* Column table */}
//             <div style={{ overflowX: "auto" }}>
//               <table style={S.colTable}>
//                 <thead>
//                   <tr>
//                     <th style={S.colThLabel}>Data Element</th>
//                     {appList.map((app) => (
//                       <th key={app} style={S.colTh(getColor(app))}>
//                         <div>{app}</div>
//                         <div
//                           style={{
//                             fontSize: 10,
//                             fontWeight: 400,
//                             opacity: 0.8,
//                             marginTop: 2,
//                           }}
//                         >
//                           {countFor(app)} selected
//                         </div>
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {section.items.map((item, rowIdx) => {
//                     const anyChecked = appList.some((a) =>
//                       checked[a]?.has(item)
//                     );
//                     return (
//                       <tr
//                         key={item}
//                         style={{
//                           background: rowIdx % 2 === 0 ? "#fff" : "#fafbfd",
//                         }}
//                       >
//                         <td style={S.colTdLabel(anyChecked, section.color)}>
//                           {item}
//                         </td>
//                         {appList.map((app) => {
//                           const isChecked = checked[app]?.has(item) || false;
//                           // Since Stage 1 elements are now empty, no items are prefilled
//                           const isPrefilled = appElementsMap[app]?.has(item);
//                           return (
//                             <td
//                               key={app}
//                               style={{
//                                 ...S.colTd(isChecked, getColor(app)),
//                                 background: isChecked
//                                   ? `${getColor(app)}08`
//                                   : isPrefilled
//                                   ? `${getColor(app)}04`
//                                   : "#fff",
//                               }}
//                               onClick={() => toggle(app, item)}
//                             >
//                               <input
//                                 type="checkbox"
//                                 checked={isChecked}
//                                 onChange={() => toggle(app, item)}
//                                 onClick={(e) => e.stopPropagation()}
//                                 style={S.checkbox(getColor(app))}
//                               />
//                             </td>
//                           );
//                         })}
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         );
//       })}

//       {/* Others */}
//       <div style={S.othersCard}>
//         <div style={S.othersHead}>
//           Others — Please Specify Additional Custom Elements
//         </div>
//         {others.map((other, i) => (
//           <div key={i} style={S.otherRow(i)}>
//             <span
//               style={{
//                 fontSize: 12,
//                 color: "#9ca3af",
//                 fontWeight: 700,
//                 width: 22,
//                 flexShrink: 0,
//               }}
//             >
//               {i + 1}
//             </span>
//             <input
//               style={S.otherInput}
//               value={other.label}
//               placeholder="Specify additional data element…"
//               onChange={(e) => updOtherLabel(i, e.target.value)}
//             />
//             {other.label.trim() !== "" && (
//               <div style={{ display: "flex", gap: 10 }}>
//                 {appList.map((app) => (
//                   <label key={app} style={S.otherChk(getColor(app))}>
//                     <input
//                       type="checkbox"
//                       checked={other.apps.has(app)}
//                       onChange={() => toggleOtherApp(i, app)}
//                       style={{ accentColor: getColor(app) }}
//                     />
//                     {app}
//                   </label>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Navigation */}
//       <div style={S.btnRow}>
//         <button style={S.backBtn} onClick={onBack} disabled={loading}>
//           ← Back to Stage 1
//         </button>
//         <button
//           style={S.nextBtn(loading)}
//           onClick={handleNext}
//           disabled={loading}
//         >
//           {loading ? "Saving…" : "Save & Continue → Stage 3"}
//         </button>
//       </div>
//     </div>
//   );
// }












// C:\Users\ak192\Downloads\cf-tool-frontend-prod (6)\cf-tool-frontend-prod\src\modules\dpia\components\Stage2Form.js

import React, { useState, useEffect, useMemo } from "react";
import { FONT, BLUE, DARK, APP_COLORS } from "./shared";

const OTHERS_COUNT = 10;

// ─── Fallback hardcoded list (UNCHANGED) ─────────────────────────────────────
const FALLBACK_SECTIONS = [
  {
    id: "pii",
    label: "Personally Identifiable Information (PII)",
    color: "#3b82f6",
    desc: "Data elements that can identify or contact a single person",
    items: [
      "Name","Gender","Age and date of birth","Marital status","Citizenship","Nationality",
      "Languages spoken","Veteran status","Disability status","Business and personal address",
      "Business and personal phone number","Business and personal email address",
      "Employment history","Job-related history","Employee relations",
      "Internal identification numbers (Emp Id)","Identity verification information",
      "Labor relations","Photographs or video records","Family","Contacts",
      "Expatriate information","Relocation information","Certificates and licenses",
      "Demographic","Education and training","Lifestyle","Habits","Personal communications",
      "Compliance records","Community and charitable services",
      "Compensation/remuneration related matters","Payroll","Transaction","Income","Assets",
      "Internet and email use, including IP addresses","Government-issued identification numbers",
      "Health & Medical Records","Racial or ethnic origin","Political opinions",
      "Religious beliefs","Criminal history","Genetic details","Biometric",
      "Credit information","Account numbers","Personal financial information",
      "Credit score","Background investigation reports",
    ],
  },
];

// ─── Theme tokens matching TemplatesPage ─────────────────────────────────────
const T = {
  font: "'DM Sans', sans-serif",
  cardBg: "rgba(255,255,255,0.85)",
  cardBorder: "1px solid rgba(241,245,249,0.8)",
  cardRadius: 14,
  cardShadow: "0 2px 12px rgba(0,0,0,0.06)",
  thBg: "#f8fafc",
  thColor: "#64748b",
  thBorder: "2px solid #e2e8f0",
  tdBorder: "1px solid #f1f5f9",
  text: "#1e293b",
  subText: "#64748b",
  mutedText: "#94a3b8",
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  wrap: { fontFamily: T.font, color: T.text, paddingBottom: 40 },

  banner: {
    background: T.cardBg,
    backdropFilter: "blur(8px)",
    border: T.cardBorder,
    borderRadius: T.cardRadius,
    boxShadow: T.cardShadow,
    padding: "18px 24px",
    marginBottom: 20,
    display: "flex", alignItems: "center", gap: 16,
    animation: "fadeUp 0.4s ease both",
  },
  bannerIcon: {
    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
    background: "linear-gradient(135deg,#3b82f6,#2563eb)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
    fontSize: 22, color: "#fff", fontWeight: 900,
  },
  bannerEye: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "#eff6ff", border: "1px solid #bfdbfe",
    borderRadius: 20, padding: "3px 10px",
    fontSize: 11, fontWeight: 700, color: "#1d4ed8", marginBottom: 6,
  },
  bannerH: { fontSize: 18, fontWeight: 700, color: T.text, margin: 0, lineHeight: 1.2 },
  bannerSub: { fontSize: 13, color: T.subText, marginTop: 4, lineHeight: 1.6 },

  // Summary bar
  summary: {
    background: T.cardBg,
    backdropFilter: "blur(8px)",
    border: T.cardBorder,
    borderRadius: 10,
    padding: "12px 18px",
    marginBottom: 16,
    display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  summaryLabel: { fontSize: 12, color: T.subText, fontWeight: 600 },
  pill: (c) => ({
    fontSize: 12, fontWeight: 700, color: c,
    background: `${c}12`, padding: "3px 10px",
    borderRadius: 20, border: `1px solid ${c}33`,
  }),

  // Section cards
  sectionCard: {
    background: T.cardBg,
    backdropFilter: "blur(8px)",
    border: T.cardBorder,
    borderRadius: T.cardRadius,
    marginBottom: 16, overflow: "hidden",
    boxShadow: T.cardShadow,
    animation: "fadeUp 0.3s ease both",
  },
  sectionHead: (c) => ({
    background: `${c}12`,
    borderLeft: `4px solid ${c}`,
    padding: "13px 18px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: T.tdBorder,
  }),
  sectionTitle: (c) => ({ fontSize: 13, fontWeight: 700, color: c }),
  sectionDesc: { fontSize: 11, color: T.mutedText, marginTop: 2 },
  sectionCount: (c) => ({
    background: `${c}18`, color: c,
    borderRadius: 20, padding: "3px 10px",
    fontSize: 11, fontWeight: 700,
    border: `1px solid ${c}33`,
  }),

  // Table
  colTable: { width: "100%", borderCollapse: "collapse" },
  colTh: (c) => ({
    background: `${c}12`, color: c,
    fontWeight: 700, fontSize: 11,
    padding: "10px 12px", textAlign: "center",
    borderBottom: `2px solid ${c}44`,
    borderRight: T.tdBorder,
    whiteSpace: "nowrap",
    textTransform: "uppercase", letterSpacing: "0.04em",
  }),
  colThLabel: {
    background: T.thBg, color: T.thColor,
    fontWeight: 700, fontSize: 11,
    padding: "10px 12px", textAlign: "left",
    borderBottom: T.thBorder,
    borderRight: T.tdBorder, minWidth: 220,
    textTransform: "uppercase", letterSpacing: "0.04em",
  },
  colTd: (chk, c) => ({
    padding: "8px 12px",
    borderBottom: T.tdBorder,
    borderRight: T.tdBorder,
    textAlign: "center",
    background: chk ? `${c}08` : "#fff",
    transition: "background 0.12s", cursor: "pointer",
  }),
  colTdLabel: (any, c) => ({
    padding: "8px 12px",
    borderBottom: T.tdBorder,
    borderRight: T.tdBorder,
    fontSize: 12.5,
    color: any ? c : T.text,
    fontWeight: any ? 600 : 400,
    background: any ? `${c}06` : "#fff",
  }),
  checkbox: (c) => ({ accentColor: c, width: 16, height: 16, cursor: "pointer" }),

  // Quick select row
  selectRow: {
    display: "flex", gap: 6, padding: "8px 16px",
    borderBottom: T.tdBorder,
    background: "rgba(248,250,252,0.6)", flexWrap: "wrap",
  },
  selectBtn: (c) => ({
    fontSize: 11, fontWeight: 700, color: c, cursor: "pointer",
    background: "none", border: `1px solid ${c}44`,
    borderRadius: 6, padding: "3px 10px", fontFamily: T.font,
    transition: "all 0.15s",
  }),

  // Others card
  othersCard: {
    background: T.cardBg,
    backdropFilter: "blur(8px)",
    border: T.cardBorder,
    borderRadius: T.cardRadius,
    marginBottom: 16, overflow: "hidden",
    boxShadow: T.cardShadow,
  },
  othersHead: {
    background: "#f8fafc",
    borderLeft: "4px solid #64748b",
    padding: "13px 18px",
    fontSize: 13, fontWeight: 700, color: T.text,
    borderBottom: T.tdBorder,
  },
  otherRow: (i) => ({
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 16px",
    background: i % 2 === 0 ? "#fff" : "rgba(248,250,252,0.6)",
    borderBottom: T.tdBorder,
  }),
  otherInput: {
    flex: 1, border: "1px solid #e2e8f0",
    borderRadius: 8, padding: "7px 10px",
    fontSize: 13, color: T.text, outline: "none",
    background: "#fff", fontFamily: T.font,
    transition: "border-color 0.15s",
  },
  otherChk: (c) => ({
    display: "flex", alignItems: "center", gap: 4,
    fontSize: 12, fontWeight: 600, color: c, cursor: "pointer",
  }),

  // Nav buttons
  btnRow: { display: "flex", justifyContent: "space-between", marginTop: 8 },
  backBtn: {
    background: "#fff",
    border: "1.5px solid #3b82f6",
    color: "#3b82f6", borderRadius: 9,
    padding: "10px 24px", fontSize: 13, fontWeight: 700,
    cursor: "pointer", fontFamily: T.font,
    transition: "all 0.2s",
    boxShadow: "0 1px 4px rgba(37,99,235,0.1)",
  },
  nextBtn: (d) => ({
    background: d ? "#e2e8f0" : "linear-gradient(135deg,#3b82f6,#2563eb)",
    color: d ? "#94a3b8" : "#fff",
    border: "none", borderRadius: 10,
    padding: "11px 28px", fontSize: 14, fontWeight: 700,
    cursor: d ? "not-allowed" : "pointer",
    boxShadow: d ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
    fontFamily: T.font, transition: "all 0.2s",
  }),
};

// ─── ALL LOGIC HELPERS UNCHANGED ─────────────────────────────────────────────
function parseElements(str) {
  return (str || "").split(",").map((e) => e.trim()).filter(Boolean);
}

function deriveAppEntries(rows) {
  if (!rows || rows.length === 0) return [];
  const validRows = rows.filter((r) => r.appName?.trim());
  if (validRows.length === 0) return [];
  const counts = {};
  validRows.forEach((r) => { const base = r.appName.trim(); counts[base] = (counts[base] || 0) + 1; });
  const occurrence = {};
  return validRows.map((r) => {
    const base = r.appName.trim();
    let colLabel = base;
    const subject = r.dataSubject?.trim();
    if (subject) { colLabel = `${base} (${subject})`; }
    else if (counts[base] > 1) { occurrence[base] = (occurrence[base] || 0) + 1; colLabel = `${base} (${occurrence[base]})`; }
    return { colLabel, elements: parseElements(r.personalData) };
  });
}

// ─── Stage2Form ───────────────────────────────────────────────────────────────
export default function Stage2Form({ rows = [], applications = [], initialData = {}, onBack, onNext, loading }) {
  // ── ALL LOGIC UNCHANGED ───────────────────────────────────────────────────
  const appEntries = useMemo(() => {
    const entries = deriveAppEntries(rows);
    if (entries.length > 0) return entries;
    const fromProp = (applications || []).filter((a) => a?.trim());
    const labels = fromProp.length > 0 ? fromProp : ["A1","A2","A3","A4"];
    return labels.map((colLabel) => ({ colLabel, elements: [] }));
  }, [rows, applications]);

  const appList = useMemo(() => appEntries.map((e) => e.colLabel), [appEntries]);
  const appElementsMap = useMemo(
    () => Object.fromEntries(appEntries.map((e) => [e.colLabel, new Set(e.elements)])),
    [appEntries]
  );
  const allElements = useMemo(() => {
    const seen = new Set();
    appEntries.forEach((e) => e.elements.forEach((el) => seen.add(el)));
    return [...seen];
  }, [appEntries]);

  const sections = FALLBACK_SECTIONS;
  const getColor = (app) => APP_COLORS[appList.indexOf(app) % APP_COLORS.length];

  const initChecked = () => {
    if (initialData?.checked) {
      return Object.fromEntries(Object.entries(initialData.checked).map(([k, v]) => [k, new Set(v)]));
    }
    return Object.fromEntries(appList.map((app) => [app, new Set()]));
  };

  const [checked, setChecked] = useState(initChecked);
  const [others, setOthers] = useState(() => {
    if (initialData?.customElements?.length) {
      const arr = Array(OTHERS_COUNT).fill(null).map(() => ({ label: "", apps: new Set() }));
      initialData.customElements.forEach((e, i) => {
        if (i < OTHERS_COUNT) arr[i] = { label: e.label || "", apps: new Set(e.selectedApplications || []) };
      });
      return arr;
    }
    return Array(OTHERS_COUNT).fill(null).map(() => ({ label: "", apps: new Set() }));
  });

  useEffect(() => {
    setChecked((prev) => {
      const next = { ...prev };
      appList.forEach((app) => { if (!next[app]) next[app] = new Set(); });
      return next;
    });
  }, [appList]);

  const toggle = (app, item) => setChecked((prev) => {
    const s = new Set(prev[app]); s.has(item) ? s.delete(item) : s.add(item);
    return { ...prev, [app]: s };
  });
  const selectAll = (app, items) => setChecked((prev) => ({ ...prev, [app]: new Set([...prev[app], ...items]) }));
  const clearAll = (app, items) => setChecked((prev) => {
    const s = new Set(prev[app]); items.forEach((i) => s.delete(i)); return { ...prev, [app]: s };
  });
  const selectAllItems = (items) => setChecked((prev) => {
    const n = { ...prev }; appList.forEach((a) => { n[a] = new Set([...n[a], ...items]); }); return n;
  });
  const clearAllItems = (items) => setChecked((prev) => {
    const n = { ...prev }; appList.forEach((a) => { const s = new Set(n[a]); items.forEach((i) => s.delete(i)); n[a] = s; }); return n;
  });
  const countFor = (app) => checked[app]?.size || 0;
  const totalSelected = appList.reduce((sum, a) => sum + countFor(a), 0);
  const updOtherLabel = (i, label) => { const n = [...others]; n[i] = { ...n[i], label }; setOthers(n); };
  const toggleOtherApp = (i, app) => {
    const n = [...others]; const apps = new Set(n[i].apps);
    apps.has(app) ? apps.delete(app) : apps.add(app); n[i] = { ...n[i], apps }; setOthers(n);
  };
  const handleNext = () => {
    const checkedArrays = Object.fromEntries(appList.map((a) => [a, Array.from(checked[a] || [])]));
    const customElements = others.filter((o) => o.label.trim() !== "")
      .map((o) => ({ label: o.label, selectedApplications: Array.from(o.apps) }));
    onNext({ checked: checkedArrays, customElements, applications: appList });
  };

  return (
    <div style={S.wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:#f8fafc}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
      `}</style>

      {/* ── Banner ── */}
      <div style={S.banner}>
        <div style={S.bannerIcon}>🗂</div>
        <div>
          <div style={S.bannerEye}>Stage 2 of 3</div>
          <div style={S.bannerH}>Personal Data Elements</div>
          <div style={S.bannerSub}>
            Select personal data elements collected per application. Columns are drawn from the
            Application Names and Data Subjects entered in Stage 1. Freely select any elements for each application.
          </div>
        </div>
      </div>

      {/* ── Selection summary ── */}
      <div style={S.summary}>
        <span style={S.summaryLabel}>
          Total selected: <strong style={{ color: T.text }}>{totalSelected}</strong>
        </span>
        {appList.map((app) => (
          <span key={app} style={S.pill(getColor(app))}>{app}: {countFor(app)}</span>
        ))}
      </div>

      {/* ── Sections ── */}
      {sections.map((section) => {
        const totalInSection = appList.reduce(
          (sum, a) => sum + section.items.filter((i) => checked[a]?.has(i)).length, 0
        );
        return (
          <div key={section.id} style={S.sectionCard}>
            {/* Section header */}
            <div style={S.sectionHead(section.color)}>
              <div>
                <div style={S.sectionTitle(section.color)}>{section.label}</div>
                <div style={S.sectionDesc}>{section.desc}</div>
              </div>
              {totalInSection > 0 && (
                <span style={S.sectionCount(section.color)}>{totalInSection} selected</span>
              )}
            </div>

            {/* Quick select row */}
            <div style={S.selectRow}>
              <span style={{ fontSize: 11, color: T.mutedText, fontWeight: 600, alignSelf: "center" }}>Quick select:</span>
              {appList.map((app) => (
                <React.Fragment key={app}>
                  <button style={S.selectBtn(getColor(app))} onClick={() => selectAll(app, section.items)}>{app}: All</button>
                  <button style={S.selectBtn("#94a3b8")} onClick={() => clearAll(app, section.items)}>{app}: Clear</button>
                </React.Fragment>
              ))}
              <button style={S.selectBtn(section.color)} onClick={() => selectAllItems(section.items)}>All: Select</button>
              <button style={S.selectBtn("#94a3b8")} onClick={() => clearAllItems(section.items)}>All: Clear</button>
            </div>

            {/* Column table */}
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={S.colTable}>
                <thead>
                  <tr>
                    <th style={S.colThLabel}>Data Element</th>
                    {appList.map((app) => (
                      <th key={app} style={S.colTh(getColor(app))}>
                        <div>{app}</div>
                        <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.8, marginTop: 2 }}>
                          {countFor(app)} selected
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, rowIdx) => {
                    const anyChecked = appList.some((a) => checked[a]?.has(item));
                    return (
                      <tr key={item} style={{ background: rowIdx % 2 === 0 ? "#fff" : "rgba(248,250,252,0.5)" }}>
                        <td style={S.colTdLabel(anyChecked, section.color)}>{item}</td>
                        {appList.map((app) => {
                          const isChecked = checked[app]?.has(item) || false;
                          const isPrefilled = appElementsMap[app]?.has(item);
                          return (
                            <td key={app} style={{
                              ...S.colTd(isChecked, getColor(app)),
                              background: isChecked ? `${getColor(app)}08` : isPrefilled ? `${getColor(app)}04` : "#fff",
                            }} onClick={() => toggle(app, item)}>
                              <input type="checkbox" checked={isChecked}
                                onChange={() => toggle(app, item)}
                                onClick={(e) => e.stopPropagation()}
                                style={S.checkbox(getColor(app))} />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* ── Others ── */}
      <div style={S.othersCard}>
        <div style={S.othersHead}>Others — Please Specify Additional Custom Elements</div>
        {others.map((other, i) => (
          <div key={i} style={S.otherRow(i)}>
            <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700, background: "#f3f0ff", padding: "2px 7px", borderRadius: 4, flexShrink: 0 }}>
              {i + 1}
            </span>
            <input style={S.otherInput} value={other.label}
              placeholder="Specify additional data element…"
              onChange={(e) => updOtherLabel(i, e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
            {other.label.trim() !== "" && (
              <div style={{ display: "flex", gap: 10 }}>
                {appList.map((app) => (
                  <label key={app} style={S.otherChk(getColor(app))}>
                    <input type="checkbox" checked={other.apps.has(app)}
                      onChange={() => toggleOtherApp(i, app)} style={{ accentColor: getColor(app) }} />
                    {app}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Navigation ── */}
      <div style={S.btnRow}>
        <button style={S.backBtn} onClick={onBack} disabled={loading}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#eff6ff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}>
          ← Back to Stage 1
        </button>
        <button style={S.nextBtn(loading)} onClick={handleNext} disabled={loading}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.35)"; }}}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 14px rgba(37,99,235,0.3)"; }}>
          {loading ? "Saving…" : "Save & Continue → Stage 3"}
        </button>
      </div>
    </div>
  );
}
