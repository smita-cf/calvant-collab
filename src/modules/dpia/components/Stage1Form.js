import Link from 'next/link';
// //C:\Users\ak192\Downloads\cf-tool-frontend-prod (6)\cf-tool-frontend-prod\src\modules\dpia\components\Stage1Form.js


// import React, { useState, useRef, useEffect } from "react";
// import { FONT, BLUE, DARK } from "./shared";

// // ─── Full personal data element list (shared with Stage 2) ────────────────────
// export const PERSONAL_DATA_OPTIONS = [
//   "Name",
//   "Gender",
//   "Age and date of birth",
//   "Marital status",
//   "Citizenship",
//   "Nationality",
//   "Languages spoken",
//   "Veteran status",
//   "Disability status",
//   "Business and personal address",
//   "Business and personal phone number",
//   "Business and personal email address",
//   "Employment history",
//   "Job-related history",
//   "Employee relations",
//   "Internal identification numbers (Emp Id)",
//   "Identity verification information",
//   "Labor relations",
//   "Photographs or video records",
//   "Family",
//   "Contacts",
//   "Expatriate information",
//   "Relocation information",
//   "Certificates and licenses",
//   "Demographic",
//   "Education and training",
//   "Lifestyle",
//   "Habits",
//   "Personal communications",
//   "Compliance records",
//   "Community and charitable services",
//   "Compensation/remuneration related matters",
//   "Payroll",
//   "Transaction",
//   "Income",
//   "Assets",
//   "Internet and email use, including IP addresses",
//   "Government-issued identification numbers",
//   "Health & Medical Records",
//   "Racial or ethnic origin",
//   "Political opinions",
//   "Religious beliefs",
//   "Criminal history",
//   "Genetic details",
//   "Biometric",
//   "Credit information",
//   "Account numbers",
//   "Personal financial information",
//   "Credit score",
//   "Background investigation reports",
// ];

// // ─── Data ─────────────────────────────────────────────────────────────────────
// const DATA_SUBJECTS = [
//   "Current employee",
//   "Former Employee",
//   "Customer's Employee",
//   "Customer's Customer",
//   "Business Contact",
//   "Users",
//   "Other",
// ];
// const GEOS = [
//   "Europe",
//   "Russia",
//   "Latin America",
//   "Middle East/ Africa",
//   "China",
//   "Asia Pacific",
//   "United States",
//   "Canada",
//   "California",
//   "Other",
// ];
// const DATA_TYPES = [
//   {
//     id: "pii",
//     label: "Personally Identifiable Information (PII)",
//     color: "#3b82f6",
//     desc: "Data elements that can identify or contact a single person",
//     ex: "Name, Gender, Citizenship, Veteran status, Employment history, Government-issued IDs, etc.",
//   },
//   {
//     id: "spi",
//     label: "Sensitive Personal Information (SPI)",
//     color: "#8b5cf6",
//     desc: "Data elements which may pose heightened risks if disclosed or compromised",
//     ex: "Health & Medical Records, Biometric, Credit information, Account numbers, Background reports",
//   },
//   {
//     id: "special",
//     label: "Special Categories of Data",
//     color: "#ef4444",
//     desc: "Highly sensitive data that may result in harm if disclosed or compromised",
//     ex: "Racial/ethnic origin, Political opinions, Religious beliefs, Criminal history, Genetic details",
//   },
//   {
//     id: "device",
//     label: "Device Identifiers",
//     color: "#f59e0b",
//     desc: "Data elements linked to specific electronic devices or equipment",
//     ex: "Internet and email use, including IP addresses",
//   },
//   {
//     id: "behavioral",
//     label: "Behavioral or Demographic Information",
//     color: "#10b981",
//     desc: "Data elements categorizing individuals based on personal characteristics or behaviors",
//     ex: "Age, Marital status, Nationality, Languages, Lifestyle, Compensation, Payroll",
//   },
//   {
//     id: "location",
//     label: "Location Information",
//     color: "#ec4899",
//     desc: "Data elements identifying or used to identify the location of an individual",
//     ex: "GPS, network triangulation, check-ins, beacon pings, location from IP address",
//   },
// ];
// const DATA_SOURCES = [
//   "Direct submission by the Data Subject",
//   "Customer",
//   "Third party vendor or partner",
//   "Active and automated collection, surveillance, tracking, or monitoring",
//   "System or team internal to the Organization",
//   "Other",
// ];
// const INDIVIDUAL_COUNTS = [
//   "<25",
//   "26 - 100",
//   "101 - 1000",
//   "1001 - 100,000",
//   "100,000 +",
// ];
// const DEPT_CATS = [
//   "PII Controller",
//   "PII Processor",
//   "Both (a) and (b)",
//   "Subprocessor",
// ];
// const ACCENTS = [
//   "#3b82f6",
//   "#8b5cf6",
//   "#ef4444",
//   "#f59e0b",
//   "#10b981",
//   "#ec4899",
//   "#0ea5e9",
//   "#6366f1",
//   "#14b8a6",
//   "#f97316",
// ];

// // ─── TABLE COLUMNS (Personal Data Elements column HIDDEN) ────────────────────
// const TABLE_COLS = [
//   {
//     key: "appName",
//     label: "Application / Document Name / Process",
//     placeholder: "e.g. HR Portal",
//   },
//   {
//     key: "dataSubject",
//     label: "Data Subject",
//     placeholder: "e.g. Current Employee",
//   },
//   // ❌ HIDDEN: Personal Data Elements column removed per requirement
//   // Users will define data elements in Stage 2 instead
//   {
//     key: "storageFormat",
//     label: "Data Storage Format",
//     placeholder: "Digital / Physical",
//   },
//   {
//     key: "integratedApps",
//     label: "Integrated Applications",
//     placeholder: "e.g. SAP, Workday",
//   },
//   { key: "accessedBy", label: "Accessed By", placeholder: "e.g. HR Team" },
//   { key: "country", label: "Country", placeholder: "e.g. India" },
//   { key: "retention", label: "Retention Period", placeholder: "e.g. 5 years" },
//   {
//     key: "deletionMethod",
//     label: "Method of Data Deletion",
//     placeholder: "e.g. Secure erase",
//   },
// ];

// const mkEmptyRow = (appName = "") => ({
//   appName,
//   dataSubject: "",
//   // personalData field still exists in state, just not shown in table
//   personalData: "",
//   storageFormat: "Digital",
//   integratedApps: "",
//   accessedBy: "",
//   country: "",
//   retention: "",
//   deletionMethod: "",
// });

// // ─── Styles ───────────────────────────────────────────────────────────────────
// const S = {
//   wrap: { fontFamily: FONT, color: "#1a2233", paddingBottom: 40 },
//   banner: {
//     background: `linear-gradient(110deg,${DARK} 0%,#1a3a6e 60%,${BLUE} 100%)`,
//     borderRadius: 14,
//     padding: "24px 28px",
//     marginBottom: 28,
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
//   bannerH: { fontSize: 22, fontWeight: 800, marginBottom: 8 },
//   bannerSub: { fontSize: 13, color: "#bdd4f0", lineHeight: 1.7, maxWidth: 820 },
//   card: {
//     background: "#fff",
//     border: "1px solid #e4eaf4",
//     borderRadius: 12,
//     marginBottom: 18,
//     overflow: "hidden",
//     boxShadow: "0 2px 8px rgba(15,34,71,0.07)",
//   },
//   cardHead: (a) => ({
//     background: `linear-gradient(90deg,${a}1a,transparent)`,
//     borderLeft: `4px solid ${a}`,
//     padding: "13px 20px",
//     display: "flex",
//     alignItems: "center",
//     gap: 12,
//   }),
//   badge: (a) => ({
//     background: a,
//     color: "#fff",
//     borderRadius: "50%",
//     width: 26,
//     height: 26,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: 12,
//     fontWeight: 800,
//     flexShrink: 0,
//   }),
//   cardTitle: { fontWeight: 700, fontSize: 14, color: "#111827" },
//   body: { padding: "18px 20px" },
//   grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
//   grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 },
//   grid5: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 },
//   optBtn: (sel, a) => ({
//     display: "flex",
//     alignItems: "flex-start",
//     gap: 9,
//     padding: "9px 13px",
//     background: sel ? `${a}12` : "#f7f9fc",
//     border: `1.5px solid ${sel ? a : "#dde3ef"}`,
//     borderRadius: 8,
//     cursor: "pointer",
//     fontSize: 13,
//     color: sel ? a : "#374151",
//     fontWeight: sel ? 700 : 400,
//     transition: "all 0.14s",
//     lineHeight: 1.4,
//   }),
//   chk: (a) => ({
//     accentColor: a,
//     width: 15,
//     height: 15,
//     marginTop: 2,
//     flexShrink: 0,
//   }),
//   dtCard: (sel, c) => ({
//     border: `2px solid ${sel ? c : "#e4eaf4"}`,
//     borderRadius: 10,
//     padding: "13px 15px",
//     background: sel ? `${c}0d` : "#f9fafc",
//     cursor: "pointer",
//     transition: "all 0.15s",
//   }),
//   dtHead: { display: "flex", alignItems: "center", gap: 8, marginBottom: 5 },
//   dtLabel: (sel, c) => ({
//     fontWeight: 700,
//     fontSize: 13,
//     color: sel ? c : "#374151",
//   }),
//   dtDesc: {
//     fontSize: "11.5px",
//     color: "#6b7280",
//     lineHeight: 1.5,
//     marginBottom: 4,
//   },
//   tableWrap: { overflowX: "auto" },
//   table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
//   th: {
//     background: "#f0f4fb",
//     color: "#374151",
//     fontWeight: 700,
//     padding: "9px 10px",
//     textAlign: "left",
//     borderBottom: "2px solid #dde3ef",
//     whiteSpace: "nowrap",
//     fontSize: 12,
//   },
//   td: {
//     padding: "6px 7px",
//     borderBottom: "1px solid #eef1f8",
//     verticalAlign: "middle",
//   },
//   inp: {
//     width: "100%",
//     border: "1px solid #dde3ef",
//     borderRadius: 6,
//     padding: "5px 8px",
//     fontSize: 12,
//     color: "#1a2233",
//     background: "#fff",
//     outline: "none",
//     boxSizing: "border-box",
//     fontFamily: FONT,
//   },
//   addBtn: {
//     marginTop: 10,
//     background: "transparent",
//     border: "1.5px dashed #93c5fd",
//     color: "#3b82f6",
//     borderRadius: 8,
//     padding: "7px 16px",
//     fontSize: 12,
//     cursor: "pointer",
//     fontWeight: 600,
//     fontFamily: FONT,
//   },
//   delBtn: {
//     background: "transparent",
//     border: "none",
//     color: "#ef4444",
//     cursor: "pointer",
//     fontSize: 16,
//     lineHeight: 1,
//     padding: "2px 6px",
//     borderRadius: 4,
//   },
//   radioRow: { display: "flex", gap: 10, flexWrap: "wrap" },
//   radioBtn: (sel, a) => ({
//     display: "flex",
//     alignItems: "center",
//     gap: 7,
//     padding: "8px 14px",
//     background: sel ? `${a}12` : "#f7f9fc",
//     border: `1.5px solid ${sel ? a : "#dde3ef"}`,
//     borderRadius: 8,
//     cursor: "pointer",
//     fontSize: 13,
//     color: sel ? a : "#374151",
//     fontWeight: sel ? 700 : 400,
//     transition: "all 0.14s",
//   }),
//   subCard: {
//     background: "#f7f9fc",
//     border: "1px solid #e4eaf4",
//     borderRadius: 10,
//     padding: 16,
//     marginTop: 12,
//   },
//   nextBtn: (d) => ({
//     background: d ? "#9ca3af" : `linear-gradient(90deg,${DARK},${BLUE})`,
//     color: "#fff",
//     border: "none",
//     borderRadius: 10,
//     padding: "12px 32px",
//     fontSize: 14,
//     fontWeight: 700,
//     cursor: d ? "not-allowed" : "pointer",
//     marginTop: 24,
//     boxShadow: d ? "none" : "0 4px 14px #1e4d8c44",
//     letterSpacing: "0.3px",
//     fontFamily: FONT,
//   }),
//   rowNum: {
//     color: "#9ca3af",
//     fontWeight: 700,
//     textAlign: "center",
//     fontSize: 11,
//   },
// };

// // ─── EditableCell ─────────────────────────────────────────────────────────────
// function EditableCell({ value, placeholder, onChange, highlight }) {
//   const [focused, setFocused] = useState(false);
//   return (
//     <input
//       style={{
//         width: "100%",
//         border: `1.5px solid ${focused ? (highlight ? "#10b981" : "#3b82f6") : highlight && value ? "#10b98166" : "#dde3ef"}`,
//         borderRadius: 6,
//         padding: "5px 8px",
//         fontSize: 12,
//         color: "#1a2233",
//         background: highlight && value ? "#f0fdf9" : "#fff",
//         outline: "none",
//         boxSizing: "border-box",
//         fontFamily: FONT,
//         fontWeight: highlight ? 700 : 400,
//         boxShadow: focused
//           ? `0 0 0 3px ${highlight ? "#10b98120" : "#3b82f620"}`
//           : "none",
//         transition: "all 0.15s",
//       }}
//       value={value}
//       placeholder={placeholder}
//       onChange={(e) => onChange(e.target.value)}
//       onFocus={() => setFocused(true)}
//       onBlur={() => setFocused(false)}
//     />
//   );
// }



// // ─── Stage1Form ───────────────────────────────────────────────────────────────
// export default function Stage1Form({ onNext, loading, initialData }) {
//   const [dataSubjects, setDataSubjects] = useState(
//     initialData?.dataSubjects || [],
//   );
//   const [geos, setGeos] = useState(initialData?.geos || []);
//   const [dataTypes, setDataTypes] = useState(initialData?.dataTypes || []);
//   const [dataSources, setDataSources] = useState(
//     initialData?.dataSources || [],
//   );
//   const [dataTypeExamples, setDataTypeExamples] = useState(
//     initialData?.dataTypeExamples ||
//       Object.fromEntries(DATA_TYPES.map((dt) => [dt.id, dt.ex])),
//   );
//   const [rows, setRows] = useState(
//     initialData?.rows || [
//       mkEmptyRow("A1"),
//       mkEmptyRow("A2"),
//       mkEmptyRow("A3"),
//       mkEmptyRow("A4"),
//     ],
//   );
//   const [indivCount, setIndivCount] = useState(initialData?.indivCount || "");
//   const [shareInternal, setShareInternal] = useState(
//     initialData?.shareInternal || "",
//   );
//   const [internalTeams, setInternalTeams] = useState(
//     initialData?.internalTeams || [
//       { teamName: "", location: "", personalData: "", purpose: "" },
//     ],
//   );
//   const [minors, setMinors] = useState(initialData?.minors || "");
//   const [deptCat, setDeptCat] = useState(initialData?.deptCat || "");

//   const toggle = (arr, set, val) =>
//     set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  
//   const updRow = (i, k, v) => {
//     const n = [...rows];
//     n[i] = { ...n[i], [k]: v };
//     setRows(n);
//   };
  
//   const updTeam = (i, k, v) => {
//     const n = [...internalTeams];
//     n[i] = { ...n[i], [k]: v };
//     setInternalTeams(n);
//   };
  
//   const delRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

//   function handleNext() {
//     onNext({
//       dataSubjects,
//       geos,
//       dataTypes,
//       dataSources,
//       dataTypeExamples,
//       rows,
//       indivCount,
//       shareInternal,
//       internalTeams,
//       minors,
//       deptCat,
//     });
//   }

//   return (
//     <div style={S.wrap}>
//       <link
//         href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
//         rel="stylesheet"
//       />

//       {/* Banner */}
//       <div style={S.banner}>
//         <div style={S.bannerEye}>Stage 1 of 3</div>
//         <div style={S.bannerH}>PII Inventory Assessment</div>
//         <div style={S.bannerSub}>
//           Gain visibility into personal data collected — data subjects,
//           elements, purposes, storage, recipients, cross-border transfers,
//           retention requirements, and deletion procedures.
//         </div>
//       </div>

//       {/* Q1 — Data Subjects */}
//       <div style={S.card}>
//         <div style={S.cardHead("#3b82f6")}>
//           <div style={S.badge("#3b82f6")}>1</div>
//           <div style={S.cardTitle}>
//             Who is the anticipated Data Subject? (Select all that apply)
//           </div>
//         </div>
//         <div style={S.body}>
//           <div style={S.grid3}>
//             {DATA_SUBJECTS.map((s, i) => (
//               <label
//                 key={s}
//                 style={S.optBtn(dataSubjects.includes(s), ACCENTS[i])}
//               >
//                 <input
//                   type="checkbox"
//                   checked={dataSubjects.includes(s)}
//                   onChange={() => toggle(dataSubjects, setDataSubjects, s)}
//                   style={S.chk(ACCENTS[i])}
//                 />
//                 <span>
//                   {String.fromCharCode(97 + i)}. {s}
//                 </span>
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Q2 — Geographies */}
//       <div style={S.card}>
//         <div style={S.cardHead("#0ea5e9")}>
//           <div style={S.badge("#0ea5e9")}>2</div>
//           <div style={S.cardTitle}>
//             In what geographies or jurisdictions do the individuals reside?
//             (Select all that apply)
//           </div>
//         </div>
//         <div style={S.body}>
//           <div style={S.grid5}>
//             {GEOS.map((g, i) => (
//               <label key={g} style={S.optBtn(geos.includes(g), "#0ea5e9")}>
//                 <input
//                   type="checkbox"
//                   checked={geos.includes(g)}
//                   onChange={() => toggle(geos, setGeos, g)}
//                   style={S.chk("#0ea5e9")}
//                 />
//                 <span>
//                   {String.fromCharCode(97 + i)}. {g}
//                 </span>
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Q3 — Data Types */}
//       <div style={S.card}>
//         <div style={S.cardHead("#8b5cf6")}>
//           <div style={S.badge("#8b5cf6")}>3</div>
//           <div style={S.cardTitle}>
//             What type or types of Personal Data will be collected or processed?
//             (Select all that apply)
//           </div>
//         </div>
//         <div style={S.body}>
//           <div style={S.grid2}>
//             {DATA_TYPES.map((dt) => {
//               const sel = dataTypes.includes(dt.id);
//               return (
//                 <div
//                   key={dt.id}
//                   style={S.dtCard(sel, dt.color)}
//                   onClick={() => toggle(dataTypes, setDataTypes, dt.id)}
//                 >
//                   <div style={S.dtHead}>
//                     <input
//                       type="checkbox"
//                       checked={sel}
//                       readOnly
//                       style={S.chk(dt.color)}
//                     />
//                     <div style={S.dtLabel(sel, dt.color)}>{dt.label}</div>
//                   </div>
//                   <div style={S.dtDesc}>{dt.desc}</div>
//                   <div
//                     onClick={(e) => e.stopPropagation()}
//                     style={{ marginTop: 4 }}
//                   >
//                     <textarea
//                       value={dataTypeExamples[dt.id]}
//                       onChange={(e) =>
//                         setDataTypeExamples((prev) => ({
//                           ...prev,
//                           [dt.id]: e.target.value,
//                         }))
//                       }
//                       placeholder="Enter examples…"
//                       rows={2}
//                       style={{
//                         width: "100%",
//                         fontSize: 11,
//                         fontStyle: "italic",
//                         color: sel ? dt.color : "#9ca3af",
//                         background: "transparent",
//                         border: `1px dashed ${sel ? dt.color + "66" : "#e5e7eb"}`,
//                         borderRadius: 5,
//                         padding: "4px 7px",
//                         outline: "none",
//                         resize: "vertical",
//                         fontFamily: FONT,
//                         lineHeight: 1.5,
//                         boxSizing: "border-box",
//                         cursor: "text",
//                         transition: "border-color 0.15s, color 0.15s",
//                       }}
//                       onFocus={(e) => (e.target.style.borderColor = dt.color)}
//                       onBlur={(e) =>
//                         (e.target.style.borderColor = sel
//                           ? dt.color + "66"
//                           : "#e5e7eb")
//                       }
//                       title="Click to edit examples"
//                     />
//                     <div
//                       style={{
//                         fontSize: 10,
//                         color: "#c4c9d4",
//                         marginTop: 2,
//                         textAlign: "right",
//                       }}
//                     >
//                       ✏ editable
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* Q4 — Data Sources */}
//       <div style={S.card}>
//         <div style={S.cardHead("#f59e0b")}>
//           <div style={S.badge("#f59e0b")}>4</div>
//           <div style={S.cardTitle}>
//             From what source or sources will Personal Data be collected or
//             obtained? (Select all that apply)
//           </div>
//         </div>
//         <div style={S.body}>
//           <div style={S.grid2}>
//             {DATA_SOURCES.map((s, i) => (
//               <label
//                 key={s}
//                 style={S.optBtn(dataSources.includes(s), "#f59e0b")}
//               >
//                 <input
//                   type="checkbox"
//                   checked={dataSources.includes(s)}
//                   onChange={() => toggle(dataSources, setDataSources, s)}
//                   style={S.chk("#f59e0b")}
//                 />
//                 <span>
//                   {String.fromCharCode(97 + i)}. {s}
//                 </span>
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Q5 — PII Inventory Table (WITHOUT Personal Data Elements column) */}
//       <div style={S.card}>
//         <div style={S.cardHead("#10b981")}>
//           <div style={S.badge("#10b981")}>5</div>
//           <div>
//             <div style={S.cardTitle}>
//               Application Details — Overview Table
//             </div>
//             <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 3 }}>
//               Define applications, data subjects, and storage details here. Personal data elements will be selected in Stage 2.
//             </div>
//           </div>
//         </div>
//         <div style={S.body}>
//           <div style={S.tableWrap}>
//             <table style={S.table}>
//               <thead>
//                 <tr>
//                   <th style={{ ...S.th, width: 36 }}>#</th>
//                   {TABLE_COLS.map((c) => (
//                     <th
//                       key={c.key}
//                       style={{ ...S.th, minWidth: 120 }}
//                     >
//                       {c.label}
//                     </th>
//                   ))}
//                   <th style={{ ...S.th, width: 40 }}>Del</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {rows.map((row, i) => (
//                   <tr
//                     key={i}
//                     style={{ background: i % 2 === 0 ? "#fff" : "#f9fafc" }}
//                   >
//                     <td style={{ ...S.td, ...S.rowNum }}>{i + 1}</td>
//                     {TABLE_COLS.map((c) => (
//                       <td
//                         key={c.key}
//                         style={S.td}
//                       >
//                         <EditableCell
//                           value={row[c.key]}
//                           placeholder={c.placeholder}
//                           onChange={(v) => updRow(i, c.key, v)}
//                           highlight={c.key === "appName"}
//                         />
//                       </td>
//                     ))}
//                     <td style={S.td}>
//                       <button
//                         style={S.delBtn}
//                         onClick={() => delRow(i)}
//                         title="Remove row"
//                       >
//                         ×
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <button
//             style={S.addBtn}
//             onClick={() => setRows([...rows, mkEmptyRow()])}
//           >
//             + Insert Row
//           </button>
//         </div>
//       </div>

//       {/* Q6 — Individual Count */}
//       <div style={S.card}>
//         <div style={S.cardHead("#6366f1")}>
//           <div style={S.badge("#6366f1")}>6</div>
//           <div style={S.cardTitle}>
//             What is the anticipated number of Individuals having their data
//             collected or otherwise processed?
//           </div>
//         </div>
//         <div style={S.body}>
//           <div style={S.radioRow}>
//             {INDIVIDUAL_COUNTS.map((c, i) => (
//               <label key={c} style={S.radioBtn(indivCount === c, "#6366f1")}>
//                 <input
//                   type="radio"
//                   checked={indivCount === c}
//                   onChange={() => setIndivCount(c)}
//                   style={S.chk("#6366f1")}
//                 />
//                 {String.fromCharCode(97 + i)}. {c}
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Q7 — Internal Sharing */}
//       <div style={S.card}>
//         <div style={S.cardHead("#14b8a6")}>
//           <div style={S.badge("#14b8a6")}>7</div>
//           <div style={S.cardTitle}>
//             Do you share any personal information to other internal Organizational
//             teams?
//           </div>
//         </div>
//         <div style={S.body}>
//           <div style={S.radioRow}>
//             {["Yes", "No"].map((v) => (
//               <label key={v} style={S.radioBtn(shareInternal === v, "#14b8a6")}>
//                 <input
//                   type="radio"
//                   checked={shareInternal === v}
//                   onChange={() => setShareInternal(v)}
//                   style={S.chk("#14b8a6")}
//                 />
//                 {v}
//               </label>
//             ))}
//           </div>
//           {shareInternal === "Yes" && (
//             <div style={S.subCard}>
//               <div
//                 style={{
//                   fontSize: 13,
//                   fontWeight: 700,
//                   color: "#14b8a6",
//                   marginBottom: 12,
//                 }}
//               >
//                 7.1 — Internal Teams Details
//               </div>
//               <table style={S.table}>
//                 <thead>
//                   <tr>
//                     <th style={{ ...S.th, width: 40 }}>#</th>
//                     {[
//                       "Internal Team Name",
//                       "Team Location",
//                       "Personal Data Transferred",
//                       "Purpose for Disclosing",
//                     ].map((h) => (
//                       <th key={h} style={S.th}>
//                         {h}
//                       </th>
//                     ))}
//                     <th style={{ ...S.th, width: 40 }}>Del</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {internalTeams.map((t, i) => (
//                     <tr key={i}>
//                       <td style={{ ...S.td, ...S.rowNum }}>{i + 1}</td>
//                       {["teamName", "location", "personalData", "purpose"].map(
//                         (k) => (
//                           <td key={k} style={S.td}>
//                             <input
//                               style={S.inp}
//                               value={t[k]}
//                               onChange={(e) => updTeam(i, k, e.target.value)}
//                             />
//                           </td>
//                         ),
//                       )}
//                       <td style={S.td}>
//                         <button
//                           style={S.delBtn}
//                           onClick={() =>
//                             setInternalTeams(
//                               internalTeams.filter((_, idx) => idx !== i),
//                             )
//                           }
//                         >
//                           ×
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               <button
//                 style={S.addBtn}
//                 onClick={() =>
//                   setInternalTeams([
//                     ...internalTeams,
//                     {
//                       teamName: "",
//                       location: "",
//                       personalData: "",
//                       purpose: "",
//                     },
//                   ])
//                 }
//               >
//                 + Add Team
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Q8 — Minors */}
//       <div style={S.card}>
//         <div style={S.cardHead("#f97316")}>
//           <div style={S.badge("#f97316")}>8</div>
//           <div style={S.cardTitle}>
//             Could this Project be targeted towards or enable communications with
//             minor children aged 16 or younger?
//           </div>
//         </div>
//         <div style={S.body}>
//           <div style={S.radioRow}>
//             {["Yes", "No"].map((v) => (
//               <label key={v} style={S.radioBtn(minors === v, "#f97316")}>
//                 <input
//                   type="radio"
//                   checked={minors === v}
//                   onChange={() => setMinors(v)}
//                   style={S.chk("#f97316")}
//                 />
//                 {v}
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Q9 — Department Category */}
//       <div style={S.card}>
//         <div style={S.cardHead("#a855f7")}>
//           <div style={S.badge("#a855f7")}>9</div>
//           <div style={S.cardTitle}>
//             To which category does the department belong?
//           </div>
//         </div>
//         <div style={S.body}>
//           <div style={S.grid2}>
//             {DEPT_CATS.map((c, i) => (
//               <label key={c} style={S.radioBtn(deptCat === c, "#a855f7")}>
//                 <input
//                   type="radio"
//                   checked={deptCat === c}
//                   onChange={() => setDeptCat(c)}
//                   style={S.chk("#a855f7")}
//                 />
//                 {String.fromCharCode(97 + i)}. {c}
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div style={{ display: "flex", justifyContent: "flex-end" }}>
//         <button
//           style={S.nextBtn(loading)}
//           onClick={handleNext}
//           disabled={loading}
//         >
//           {loading ? "Saving…" : "Save & Continue → Stage 2"}
//         </button>
//       </div>
//     </div>
//   );
// }
















// C:\Users\ak192\Downloads\cf-tool-frontend-prod (6)\cf-tool-frontend-prod\src\modules\dpia\components\Stage1Form.js

import React, { useState, useRef, useEffect } from "react";
import { FONT, BLUE, DARK } from "./shared";

// ─── Full personal data element list (shared with Stage 2) ────────────────────
export const PERSONAL_DATA_OPTIONS = [
  "Name","Gender","Age and date of birth","Marital status","Citizenship",
  "Nationality","Languages spoken","Veteran status","Disability status",
  "Business and personal address","Business and personal phone number",
  "Business and personal email address","Employment history","Job-related history",
  "Employee relations","Internal identification numbers (Emp Id)",
  "Identity verification information","Labor relations","Photographs or video records",
  "Family","Contacts","Expatriate information","Relocation information",
  "Certificates and licenses","Demographic","Education and training","Lifestyle",
  "Habits","Personal communications","Compliance records",
  "Community and charitable services","Compensation/remuneration related matters",
  "Payroll","Transaction","Income","Assets",
  "Internet and email use, including IP addresses",
  "Government-issued identification numbers","Health & Medical Records",
  "Racial or ethnic origin","Political opinions","Religious beliefs",
  "Criminal history","Genetic details","Biometric","Credit information",
  "Account numbers","Personal financial information","Credit score",
  "Background investigation reports",
];

// ─── Data ─────────────────────────────────────────────────────────────────────
const DATA_SUBJECTS = [
  "Current employee","Former Employee","Customer's Employee",
  "Customer's Customer","Business Contact","Users","Other",
];
const GEOS = [
  "Europe","Russia","Latin America","Middle East/ Africa","China",
  "Asia Pacific","United States","Canada","California","Other",
];
const DATA_TYPES = [
  { id:"pii", label:"Personally Identifiable Information (PII)", color:"#3b82f6",
    desc:"Data elements that can identify or contact a single person",
    ex:"Name, Gender, Citizenship, Veteran status, Employment history, Government-issued IDs, etc." },
  { id:"spi", label:"Sensitive Personal Information (SPI)", color:"#8b5cf6",
    desc:"Data elements which may pose heightened risks if disclosed or compromised",
    ex:"Health & Medical Records, Biometric, Credit information, Account numbers, Background reports" },
  { id:"special", label:"Special Categories of Data", color:"#ef4444",
    desc:"Highly sensitive data that may result in harm if disclosed or compromised",
    ex:"Racial/ethnic origin, Political opinions, Religious beliefs, Criminal history, Genetic details" },
  { id:"device", label:"Device Identifiers", color:"#f59e0b",
    desc:"Data elements linked to specific electronic devices or equipment",
    ex:"Internet and email use, including IP addresses" },
  { id:"behavioral", label:"Behavioral or Demographic Information", color:"#10b981",
    desc:"Data elements categorizing individuals based on personal characteristics or behaviors",
    ex:"Age, Marital status, Nationality, Languages, Lifestyle, Compensation, Payroll" },
  { id:"location", label:"Location Information", color:"#ec4899",
    desc:"Data elements identifying or used to identify the location of an individual",
    ex:"GPS, network triangulation, check-ins, beacon pings, location from IP address" },
];
const DATA_SOURCES = [
  "Direct submission by the Data Subject","Customer",
  "Third party vendor or partner",
  "Active and automated collection, surveillance, tracking, or monitoring",
  "System or team internal to the Organization","Other",
];
const INDIVIDUAL_COUNTS = ["<25","26 - 100","101 - 1000","1001 - 100,000","100,000 +"];
const DEPT_CATS = ["PII Controller","PII Processor","Both (a) and (b)","Subprocessor"];
const ACCENTS = ["#3b82f6","#8b5cf6","#ef4444","#f59e0b","#10b981","#ec4899","#0ea5e9","#6366f1","#14b8a6","#f97316"];

// ─── TABLE COLUMNS ────────────────────────────────────────────────────────────
const TABLE_COLS = [
  { key:"appName", label:"Application / Document Name / Process", placeholder:"e.g. HR Portal" },
  { key:"dataSubject", label:"Data Subject", placeholder:"e.g. Current Employee" },
  { key:"storageFormat", label:"Data Storage Format", placeholder:"Digital / Physical" },
  { key:"integratedApps", label:"Integrated Applications", placeholder:"e.g. SAP, Workday" },
  { key:"accessedBy", label:"Accessed By", placeholder:"e.g. HR Team" },
  { key:"country", label:"Country", placeholder:"e.g. India" },
  { key:"retention", label:"Retention Period", placeholder:"e.g. 5 years" },
  { key:"deletionMethod", label:"Method of Data Deletion", placeholder:"e.g. Secure erase" },
];

const mkEmptyRow = (appName = "") => ({
  appName, dataSubject:"", personalData:"", storageFormat:"Digital",
  integratedApps:"", accessedBy:"", country:"", retention:"", deletionMethod:"",
});

// ─── Theme tokens matching TemplatesPage ─────────────────────────────────────
const T = {
  font: "'DM Sans', sans-serif",
  cardBg: "rgba(255,255,255,0.85)",
  cardBorder: "1px solid rgba(241,245,249,0.8)",
  cardRadius: 14,
  cardShadow: "0 2px 12px rgba(0,0,0,0.06)",
  inputBorder: "1px solid #e2e8f0",
  inputRadius: 8,
  inputFontSize: 13,
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

  // Banner → glassmorphism card matching TemplatesPage header card
  banner: {
    background: T.cardBg,
    backdropFilter: "blur(8px)",
    border: T.cardBorder,
    borderRadius: T.cardRadius,
    boxShadow: T.cardShadow,
    padding: "18px 24px",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 16,
    animation: "fadeUp 0.4s ease both",
  },
  bannerIcon: (color) => ({
    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
    background: `linear-gradient(135deg,${color},${color}cc)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: `0 4px 12px ${color}44`,
    fontSize: 22, color: "#fff", fontWeight: 900,
  }),
  bannerEye: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "#eff6ff", border: "1px solid #bfdbfe",
    borderRadius: 20, padding: "3px 10px",
    fontSize: 11, fontWeight: 700, color: "#1d4ed8", marginBottom: 6,
  },
  bannerH: { fontSize: 18, fontWeight: 700, color: T.text, margin: 0, lineHeight: 1.2 },
  bannerSub: { fontSize: 13, color: T.subText, marginTop: 4, lineHeight: 1.6, maxWidth: 820 },

  // Cards
  card: {
    background: T.cardBg,
    backdropFilter: "blur(8px)",
    border: T.cardBorder,
    borderRadius: T.cardRadius,
    marginBottom: 16,
    overflow: "hidden",
    boxShadow: T.cardShadow,
    animation: "fadeUp 0.3s ease both",
  },
  cardHead: (a) => ({
    background: `${a}12`,
    borderLeft: `4px solid ${a}`,
    padding: "13px 20px",
    display: "flex", alignItems: "center", gap: 12,
    borderBottom: T.tdBorder,
  }),
  badge: (a) => ({
    background: `linear-gradient(135deg,${a},${a}cc)`,
    color: "#fff", borderRadius: "50%",
    width: 28, height: 28,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 800, flexShrink: 0,
    boxShadow: `0 2px 6px ${a}44`,
  }),
  cardTitle: { fontWeight: 700, fontSize: 13, color: T.text },
  cardSubTitle: { fontSize: 11.5, color: T.subText, marginTop: 2 },
  body: { padding: "18px 20px" },

  // Grids
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 },
  grid5: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 },

  // Option buttons
  optBtn: (sel, a) => ({
    display: "flex", alignItems: "flex-start", gap: 9,
    padding: "9px 13px",
    background: sel ? `${a}12` : "#f8fafc",
    border: `1.5px solid ${sel ? a : "#e2e8f0"}`,
    borderRadius: 8, cursor: "pointer",
    fontSize: 13, color: sel ? a : T.subText,
    fontWeight: sel ? 700 : 400,
    transition: "all 0.14s", lineHeight: 1.4,
  }),
  chk: (a) => ({ accentColor: a, width: 15, height: 15, marginTop: 2, flexShrink: 0 }),

  // Data type cards
  dtCard: (sel, c) => ({
    border: `1.5px solid ${sel ? c : "#e2e8f0"}`,
    borderRadius: 10, padding: "13px 15px",
    background: sel ? `${c}0d` : "#f8fafc",
    cursor: "pointer", transition: "all 0.15s",
    boxShadow: sel ? `0 2px 8px ${c}22` : "none",
  }),
  dtHead: { display: "flex", alignItems: "center", gap: 8, marginBottom: 5 },
  dtLabel: (sel, c) => ({ fontWeight: 700, fontSize: 13, color: sel ? c : T.text }),
  dtDesc: { fontSize: 11.5, color: T.subText, lineHeight: 1.5, marginBottom: 4 },

  // Table
  tableWrap: { overflowX: "auto", WebkitOverflowScrolling: "touch" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    background: T.thBg, color: T.thColor,
    fontWeight: 700, padding: "10px 12px",
    textAlign: "left", borderBottom: T.thBorder,
    whiteSpace: "nowrap", fontSize: 11,
    textTransform: "uppercase", letterSpacing: "0.04em",
  },
  td: { padding: "7px 8px", borderBottom: T.tdBorder, verticalAlign: "middle" },
  rowNum: {
    color: "#7c3aed", fontWeight: 700, textAlign: "center",
    fontSize: 11, background: "#f3f0ff", padding: "2px 7px", borderRadius: 4,
    display: "inline-block",
  },

  // Inputs
  inp: {
    width: "100%", border: T.inputBorder, borderRadius: T.inputRadius,
    padding: "7px 10px", fontSize: T.inputFontSize, color: T.text,
    background: "#fff", outline: "none", boxSizing: "border-box",
    fontFamily: T.font, transition: "border-color 0.15s, box-shadow 0.15s",
  },

  // Buttons
  addBtn: {
    marginTop: 10,
    background: "transparent", border: "1.5px dashed #93c5fd",
    color: "#3b82f6", borderRadius: 8,
    padding: "7px 16px", fontSize: 12,
    cursor: "pointer", fontWeight: 600, fontFamily: T.font,
    transition: "all 0.15s",
  },
  delBtn: {
    background: "transparent", border: "none",
    color: "#ef4444", cursor: "pointer",
    fontSize: 16, lineHeight: 1, padding: "2px 6px", borderRadius: 4,
    transition: "background 0.15s",
  },

  // Radio row
  radioRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  radioBtn: (sel, a) => ({
    display: "flex", alignItems: "center", gap: 7,
    padding: "8px 14px",
    background: sel ? `${a}12` : "#f8fafc",
    border: `1.5px solid ${sel ? a : "#e2e8f0"}`,
    borderRadius: 8, cursor: "pointer",
    fontSize: 13, color: sel ? a : T.subText,
    fontWeight: sel ? 700 : 400, transition: "all 0.14s",
  }),

  // Sub card
  subCard: {
    background: "rgba(248,250,252,0.7)",
    backdropFilter: "blur(4px)",
    border: T.cardBorder, borderRadius: 10,
    padding: 16, marginTop: 12,
  },
  subCardTitle: (a) => ({ fontSize: 13, fontWeight: 700, color: a, marginBottom: 12 }),

  // Next button
  nextBtn: (d) => ({
    background: d ? "#e2e8f0" : "linear-gradient(135deg,#3b82f6,#2563eb)",
    color: d ? "#94a3b8" : "#fff",
    border: "none", borderRadius: 10,
    padding: "12px 32px", fontSize: 14, fontWeight: 700,
    cursor: d ? "not-allowed" : "pointer",
    marginTop: 24,
    boxShadow: d ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
    letterSpacing: "0.3px", fontFamily: T.font,
    transition: "all 0.2s",
  }),
};

// ─── EditableCell ─────────────────────────────────────────────────────────────
function EditableCell({ value, placeholder, onChange, highlight }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      style={{
        width: "100%",
        border: `1.5px solid ${
          focused
            ? highlight ? "#10b981" : "#3b82f6"
            : highlight && value ? "#10b98166" : "#e2e8f0"
        }`,
        borderRadius: 7,
        padding: "6px 9px",
        fontSize: 12,
        color: T.text,
        background: highlight && value ? "#f0fdf9" : "#fff",
        outline: "none",
        boxSizing: "border-box",
        fontFamily: T.font,
        fontWeight: highlight ? 700 : 400,
        boxShadow: focused
          ? `0 0 0 3px ${highlight ? "#10b98120" : "#3b82f620"}`
          : "none",
        transition: "all 0.15s",
      }}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

// ─── Stage1Form ───────────────────────────────────────────────────────────────
export default function Stage1Form({ onNext, loading, initialData }) {
  // ── ALL STATE UNCHANGED ───────────────────────────────────────────────────
  const [dataSubjects, setDataSubjects] = useState(initialData?.dataSubjects || []);
  const [geos, setGeos] = useState(initialData?.geos || []);
  const [dataTypes, setDataTypes] = useState(initialData?.dataTypes || []);
  const [dataSources, setDataSources] = useState(initialData?.dataSources || []);
  const [dataTypeExamples, setDataTypeExamples] = useState(
    initialData?.dataTypeExamples || Object.fromEntries(DATA_TYPES.map((dt) => [dt.id, dt.ex])),
  );
  const [rows, setRows] = useState(
    initialData?.rows || [mkEmptyRow("A1"), mkEmptyRow("A2"), mkEmptyRow("A3"), mkEmptyRow("A4")],
  );
  const [indivCount, setIndivCount] = useState(initialData?.indivCount || "");
  const [shareInternal, setShareInternal] = useState(initialData?.shareInternal || "");
  const [internalTeams, setInternalTeams] = useState(
    initialData?.internalTeams || [{ teamName:"", location:"", personalData:"", purpose:"" }],
  );
  const [minors, setMinors] = useState(initialData?.minors || "");
  const [deptCat, setDeptCat] = useState(initialData?.deptCat || "");

  // ── ALL LOGIC UNCHANGED ───────────────────────────────────────────────────
  const toggle = (arr, set, val) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  const updRow = (i, k, v) => { const n = [...rows]; n[i] = { ...n[i], [k]: v }; setRows(n); };
  const updTeam = (i, k, v) => { const n = [...internalTeams]; n[i] = { ...n[i], [k]: v }; setInternalTeams(n); };
  const delRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  function handleNext() {
    onNext({ dataSubjects, geos, dataTypes, dataSources, dataTypeExamples, rows, indivCount, shareInternal, internalTeams, minors, deptCat });
  }

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
        <div style={S.bannerIcon("#3b82f6")}>📋</div>
        <div>
          <div style={S.bannerEye}>Stage 1 of 3</div>
          <div style={S.bannerH}>PII Inventory Assessment</div>
          <div style={S.bannerSub}>
            Gain visibility into personal data collected — data subjects, elements, purposes,
            storage, recipients, cross-border transfers, retention requirements, and deletion procedures.
          </div>
        </div>
      </div>

      {/* ── Q1 — Data Subjects ── */}
      <div style={S.card}>
        <div style={S.cardHead("#3b82f6")}>
          <div style={S.badge("#3b82f6")}>1</div>
          <div style={S.cardTitle}>Who is the anticipated Data Subject? (Select all that apply)</div>
        </div>
        <div style={S.body}>
          <div style={S.grid3}>
            {DATA_SUBJECTS.map((s, i) => (
              <label key={s} style={S.optBtn(dataSubjects.includes(s), ACCENTS[i])}>
                <input type="checkbox" checked={dataSubjects.includes(s)}
                  onChange={() => toggle(dataSubjects, setDataSubjects, s)} style={S.chk(ACCENTS[i])} />
                <span>{String.fromCharCode(97 + i)}. {s}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Q2 — Geographies ── */}
      <div style={S.card}>
        <div style={S.cardHead("#0ea5e9")}>
          <div style={S.badge("#0ea5e9")}>2</div>
          <div style={S.cardTitle}>In what geographies or jurisdictions do the individuals reside? (Select all that apply)</div>
        </div>
        <div style={S.body}>
          <div style={S.grid5}>
            {GEOS.map((g, i) => (
              <label key={g} style={S.optBtn(geos.includes(g), "#0ea5e9")}>
                <input type="checkbox" checked={geos.includes(g)}
                  onChange={() => toggle(geos, setGeos, g)} style={S.chk("#0ea5e9")} />
                <span>{String.fromCharCode(97 + i)}. {g}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Q3 — Data Types ── */}
      <div style={S.card}>
        <div style={S.cardHead("#8b5cf6")}>
          <div style={S.badge("#8b5cf6")}>3</div>
          <div style={S.cardTitle}>What type or types of Personal Data will be collected or processed? (Select all that apply)</div>
        </div>
        <div style={S.body}>
          <div style={S.grid2}>
            {DATA_TYPES.map((dt) => {
              const sel = dataTypes.includes(dt.id);
              return (
                <div key={dt.id} style={S.dtCard(sel, dt.color)}
                  onClick={() => toggle(dataTypes, setDataTypes, dt.id)}>
                  <div style={S.dtHead}>
                    <input type="checkbox" checked={sel} readOnly style={S.chk(dt.color)} />
                    <div style={S.dtLabel(sel, dt.color)}>{dt.label}</div>
                  </div>
                  <div style={S.dtDesc}>{dt.desc}</div>
                  <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 4 }}>
                    <textarea
                      value={dataTypeExamples[dt.id]}
                      onChange={(e) => setDataTypeExamples((prev) => ({ ...prev, [dt.id]: e.target.value }))}
                      placeholder="Enter examples…" rows={2}
                      style={{
                        width: "100%", fontSize: 11, fontStyle: "italic",
                        color: sel ? dt.color : T.mutedText,
                        background: "transparent",
                        border: `1px dashed ${sel ? dt.color + "66" : "#e2e8f0"}`,
                        borderRadius: 6, padding: "4px 7px", outline: "none",
                        resize: "vertical", fontFamily: T.font, lineHeight: 1.5,
                        boxSizing: "border-box", cursor: "text", transition: "all 0.15s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = dt.color)}
                      onBlur={(e) => (e.target.style.borderColor = sel ? dt.color + "66" : "#e2e8f0")}
                      title="Click to edit examples"
                    />
                    <div style={{ fontSize: 10, color: "#c4c9d4", marginTop: 2, textAlign: "right" }}>✏ editable</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Q4 — Data Sources ── */}
      <div style={S.card}>
        <div style={S.cardHead("#f59e0b")}>
          <div style={S.badge("#f59e0b")}>4</div>
          <div style={S.cardTitle}>From what source or sources will Personal Data be collected or obtained? (Select all that apply)</div>
        </div>
        <div style={S.body}>
          <div style={S.grid2}>
            {DATA_SOURCES.map((s, i) => (
              <label key={s} style={S.optBtn(dataSources.includes(s), "#f59e0b")}>
                <input type="checkbox" checked={dataSources.includes(s)}
                  onChange={() => toggle(dataSources, setDataSources, s)} style={S.chk("#f59e0b")} />
                <span>{String.fromCharCode(97 + i)}. {s}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Q5 — PII Inventory Table ── */}
      <div style={S.card}>
        <div style={S.cardHead("#10b981")}>
          <div style={S.badge("#10b981")}>5</div>
          <div>
            <div style={S.cardTitle}>Application Details — Overview Table</div>
            <div style={S.cardSubTitle}>
              Define applications, data subjects, and storage details here. Personal data elements will be selected in Stage 2.
            </div>
          </div>
        </div>
        <div style={S.body}>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr style={{ background: T.thBg }}>
                  <th style={{ ...S.th, width: 40, textAlign: "center" }}>#</th>
                  {TABLE_COLS.map((c) => (
                    <th key={c.key} style={{ ...S.th, minWidth: 130 }}>{c.label}</th>
                  ))}
                  <th style={{ ...S.th, width: 44, textAlign: "center" }}>Del</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{
                    background: i % 2 === 0 ? "#fff" : "rgba(248,250,252,0.6)",
                    borderBottom: T.tdBorder,
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.95)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "rgba(248,250,252,0.6)"}
                  >
                    <td style={{ ...S.td, textAlign: "center" }}>
                      <span style={S.rowNum}>{i + 1}</span>
                    </td>
                    {TABLE_COLS.map((c) => (
                      <td key={c.key} style={S.td}>
                        <EditableCell value={row[c.key]} placeholder={c.placeholder}
                          onChange={(v) => updRow(i, c.key, v)} highlight={c.key === "appName"} />
                      </td>
                    ))}
                    <td style={{ ...S.td, textAlign: "center" }}>
                      <button style={S.delBtn} onClick={() => delRow(i)} title="Remove row"
                        onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button style={S.addBtn} onClick={() => setRows([...rows, mkEmptyRow()])}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#3b82f6"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#93c5fd"; }}>
            + Insert Row
          </button>
        </div>
      </div>

      {/* ── Q6 — Individual Count ── */}
      <div style={S.card}>
        <div style={S.cardHead("#6366f1")}>
          <div style={S.badge("#6366f1")}>6</div>
          <div style={S.cardTitle}>What is the anticipated number of Individuals having their data collected or otherwise processed?</div>
        </div>
        <div style={S.body}>
          <div style={S.radioRow}>
            {INDIVIDUAL_COUNTS.map((c, i) => (
              <label key={c} style={S.radioBtn(indivCount === c, "#6366f1")}>
                <input type="radio" checked={indivCount === c} onChange={() => setIndivCount(c)} style={S.chk("#6366f1")} />
                {String.fromCharCode(97 + i)}. {c}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Q7 — Internal Sharing ── */}
      <div style={S.card}>
        <div style={S.cardHead("#14b8a6")}>
          <div style={S.badge("#14b8a6")}>7</div>
          <div style={S.cardTitle}>Do you share any personal information to other internal Organizational teams?</div>
        </div>
        <div style={S.body}>
          <div style={S.radioRow}>
            {["Yes","No"].map((v) => (
              <label key={v} style={S.radioBtn(shareInternal === v, "#14b8a6")}>
                <input type="radio" checked={shareInternal === v} onChange={() => setShareInternal(v)} style={S.chk("#14b8a6")} />
                {v}
              </label>
            ))}
          </div>
          {shareInternal === "Yes" && (
            <div style={S.subCard}>
              <div style={S.subCardTitle("#14b8a6")}>7.1 — Internal Teams Details</div>
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr style={{ background: T.thBg }}>
                      <th style={{ ...S.th, width: 40, textAlign: "center" }}>#</th>
                      {["Internal Team Name","Team Location","Personal Data Transferred","Purpose for Disclosing"].map((h) => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                      <th style={{ ...S.th, width: 44, textAlign: "center" }}>Del</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internalTeams.map((t, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "rgba(248,250,252,0.6)", borderBottom: T.tdBorder }}>
                        <td style={{ ...S.td, textAlign: "center" }}><span style={S.rowNum}>{i + 1}</span></td>
                        {["teamName","location","personalData","purpose"].map((k) => (
                          <td key={k} style={S.td}>
                            <input style={S.inp} value={t[k]} onChange={(e) => updTeam(i, k, e.target.value)} />
                          </td>
                        ))}
                        <td style={{ ...S.td, textAlign: "center" }}>
                          <button style={S.delBtn} onClick={() => setInternalTeams(internalTeams.filter((_, idx) => idx !== i))}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button style={S.addBtn}
                onClick={() => setInternalTeams([...internalTeams, { teamName:"", location:"", personalData:"", purpose:"" }])}>
                + Add Team
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Q8 — Minors ── */}
      <div style={S.card}>
        <div style={S.cardHead("#f97316")}>
          <div style={S.badge("#f97316")}>8</div>
          <div style={S.cardTitle}>Could this Project be targeted towards or enable communications with minor children aged 16 or younger?</div>
        </div>
        <div style={S.body}>
          <div style={S.radioRow}>
            {["Yes","No"].map((v) => (
              <label key={v} style={S.radioBtn(minors === v, "#f97316")}>
                <input type="radio" checked={minors === v} onChange={() => setMinors(v)} style={S.chk("#f97316")} />
                {v}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Q9 — Department Category ── */}
      <div style={S.card}>
        <div style={S.cardHead("#a855f7")}>
          <div style={S.badge("#a855f7")}>9</div>
          <div style={S.cardTitle}>To which category does the department belong?</div>
        </div>
        <div style={S.body}>
          <div style={S.grid2}>
            {DEPT_CATS.map((c, i) => (
              <label key={c} style={S.radioBtn(deptCat === c, "#a855f7")}>
                <input type="radio" checked={deptCat === c} onChange={() => setDeptCat(c)} style={S.chk("#a855f7")} />
                {String.fromCharCode(97 + i)}. {c}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={S.nextBtn(loading)} onClick={handleNext} disabled={loading}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.35)"; }}}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 14px rgba(37,99,235,0.3)"; }}>
          {loading ? "Saving…" : "Save & Continue → Stage 2"}
        </button>
      </div>
    </div>
  );
}
