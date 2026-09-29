import Link from 'next/link';
// //C:\Users\ak192\Downloads\cf-tool-frontend-prod (6)\cf-tool-frontend-prod\src\modules\dpia\components\Stage3Form.js


// import React, { useState, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { FONT, BLUE, DARK } from "./shared";

// // ─── Data ─────────────────────────────────────────────────────────────────────
// const PII_RIGHTS = [
//   "Process through which a PII Principal could receive detailed information about their Personal Data",
//   "Process through which a PII Principal would be granted access to copies of their Personal Data",
//   "Process through which a PII Principal would be able to rectify any inaccurate or incomplete Personal Data",
//   "Process through which a PII Principal would be able to erase or purge their Personal Data",
//   "Process through which a PII Principal would be able to export their Personal Data into a machine-readable format",
//   "Process through which a PII Principal would be able to object to data processing activities",
//   "Process through which a PII Principal would be able to restrict data processing activities",
//   "Process through which a PII Principal would be able to object to automated decision-making activities and request human intervention",
// ];
// const PROJECT_TYPES = [
//   "Application Managed Services",
//   "Financial Solutions",
//   "Consulting",
//   "Analytics",
//   "Healthcare Solutions",
//   "Other — Admin & Facilities",
//   "Infrastructure Hosting",
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
//   section: { marginBottom: 24 },
//   card: (hasError) => ({
//     background: "#fff",
//     border: `1px solid ${hasError ? "#fca5a5" : "#e4eaf4"}`,
//     borderRadius: 12,
//     marginBottom: 14,
//     overflow: "hidden",
//     boxShadow: hasError
//       ? "0 0 0 3px rgba(239,68,68,0.10)"
//       : "0 1px 5px rgba(15,34,71,0.05)",
//     transition: "border-color 0.2s, box-shadow 0.2s",
//   }),
//   cardHead: (a) => ({
//     background: `linear-gradient(90deg,${a}18,transparent)`,
//     borderLeft: `4px solid ${a}`,
//     padding: "11px 18px",
//     display: "flex",
//     gap: 10,
//     alignItems: "flex-start",
//   }),
//   qNum: (a) => ({
//     background: a,
//     color: "#fff",
//     borderRadius: "50%",
//     width: 24,
//     height: 24,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: 11,
//     fontWeight: 800,
//     flexShrink: 0,
//     marginTop: 1,
//   }),
//   qText: {
//     fontSize: "13.5px",
//     fontWeight: 600,
//     color: "#111827",
//     lineHeight: 1.5,
//   },
//   qNote: {
//     fontSize: "11.5px",
//     color: "#6b7280",
//     marginTop: 3,
//     lineHeight: 1.5,
//   },
//   requiredBadge: {
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 4,
//     fontSize: 10,
//     fontWeight: 700,
//     color: "#ef4444",
//     background: "#fef2f2",
//     border: "1px solid #fecaca",
//     borderRadius: 4,
//     padding: "1px 6px",
//     marginTop: 4,
//     letterSpacing: "0.3px",
//   },
//   errorMsg: {
//     fontSize: "11.5px",
//     color: "#ef4444",
//     fontWeight: 600,
//     marginTop: 6,
//     display: "flex",
//     alignItems: "center",
//     gap: 4,
//   },
//   body: { padding: "14px 18px" },

//   subRow: {
//     borderTop: "1px solid #eef1f8",
//     padding: "12px 18px",
//     display: "flex",
//     flexDirection: "column",
//     gap: 10,
//   },
//   subRowHead: { display: "flex", flexDirection: "column", gap: 3 },
//   subQNum: {
//     fontSize: "11.5px",
//     fontWeight: 800,
//     color: "#6b7280",
//     textTransform: "uppercase",
//     letterSpacing: "0.5px",
//   },
//   subQText: {
//     fontSize: "13px",
//     fontWeight: 600,
//     color: "#374151",
//     lineHeight: 1.5,
//   },
//   subQNote: {
//     fontSize: "11.5px",
//     color: "#9ca3af",
//     lineHeight: 1.4,
//     fontStyle: "italic",
//   },
//   subRadioRow: {
//     display: "flex",
//     width: "100%",
//     border: "1px solid #e4eaf4",
//     borderRadius: 7,
//     overflow: "hidden",
//   },
//   subRadioOpt: (sel, a) => ({
//     flex: 1,
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//     padding: "8px 14px",
//     background: sel ? `${a}12` : "#f9fafc",
//     borderRight: "1px solid #e4eaf4",
//     cursor: "pointer",
//     fontSize: 13,
//     color: sel ? a : "#374151",
//     fontWeight: sel ? 700 : 400,
//     transition: "all 0.13s",
//   }),
//   subRadioOptLast: (sel, a) => ({
//     flex: 1,
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//     padding: "8px 14px",
//     background: sel ? `${a}12` : "#f9fafc",
//     cursor: "pointer",
//     fontSize: 13,
//     color: sel ? a : "#374151",
//     fontWeight: sel ? 700 : 400,
//     transition: "all 0.13s",
//   }),

//   radioRow: { display: "flex", gap: 8, flexWrap: "wrap" },
//   radioBtn: (sel, a) => ({
//     display: "flex",
//     alignItems: "center",
//     gap: 7,
//     padding: "7px 14px",
//     background: sel ? `${a}12` : "#f7f9fc",
//     border: `1.5px solid ${sel ? a : "#dde3ef"}`,
//     borderRadius: 8,
//     cursor: "pointer",
//     fontSize: 13,
//     color: sel ? a : "#374151",
//     fontWeight: sel ? 700 : 400,
//     transition: "all 0.13s",
//   }),
//   chkGrid: (cols) => ({
//     display: "grid",
//     gridTemplateColumns: `repeat(${cols},1fr)`,
//     gap: 8,
//   }),
//   chkBtn: (sel, a) => ({
//     display: "flex",
//     alignItems: "flex-start",
//     gap: 8,
//     padding: "8px 12px",
//     background: sel ? `${a}12` : "#f7f9fc",
//     border: `1.5px solid ${sel ? a : "#dde3ef"}`,
//     borderRadius: 8,
//     cursor: "pointer",
//     fontSize: "12.5px",
//     color: sel ? a : "#374151",
//     fontWeight: sel ? 700 : 400,
//     transition: "all 0.13s",
//     lineHeight: 1.4,
//   }),
//   inp: (hasError) => ({
//     width: "100%",
//     border: `1px solid ${hasError ? "#fca5a5" : "#dde3ef"}`,
//     borderRadius: 7,
//     padding: "8px 12px",
//     fontSize: 13,
//     color: "#1a2233",
//     background: hasError ? "#fff8f8" : "#fff",
//     outline: "none",
//     boxSizing: "border-box",
//     fontFamily: FONT,
//   }),
//   textarea: (hasError) => ({
//     width: "100%",
//     border: `1px solid ${hasError ? "#fca5a5" : "#dde3ef"}`,
//     borderRadius: 7,
//     padding: "9px 12px",
//     fontSize: 13,
//     color: "#1a2233",
//     background: hasError ? "#fff8f8" : "#fff",
//     outline: "none",
//     boxSizing: "border-box",
//     minHeight: 80,
//     resize: "vertical",
//     fontFamily: FONT,
//   }),
//   label: {
//     fontSize: 12,
//     fontWeight: 600,
//     color: "#374151",
//     marginBottom: 5,
//     display: "block",
//   },
//   grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
//   tableWrap: { overflowX: "auto", marginTop: 10 },
//   table: { width: "100%", borderCollapse: "collapse", fontSize: "12.5px" },
//   th: {
//     background: "#f0f4fb",
//     color: "#374151",
//     fontWeight: 700,
//     padding: "8px 10px",
//     textAlign: "left",
//     borderBottom: "2px solid #dde3ef",
//   },
//   td: { padding: "7px 8px", borderBottom: "1px solid #eef1f8" },
//   addBtn: {
//     marginTop: 10,
//     background: "transparent",
//     border: "1.5px dashed #93c5fd",
//     color: "#3b82f6",
//     borderRadius: 7,
//     padding: "6px 14px",
//     fontSize: 12,
//     cursor: "pointer",
//     fontWeight: 600,
//     fontFamily: FONT,
//   },
//   rth: {
//     background: "#f0f4fb",
//     padding: "8px 10px",
//     fontWeight: 700,
//     fontSize: 12,
//     color: "#374151",
//     borderBottom: "2px solid #dde3ef",
//     textAlign: "left",
//   },
//   rtd: {
//     padding: "8px 10px",
//     borderBottom: "1px solid #eef1f8",
//     verticalAlign: "middle",
//   },
//   alertBox: (c, bg, b) => ({
//     fontSize: "12.5px",
//     color: c,
//     lineHeight: 1.6,
//     marginBottom: 12,
//     background: bg,
//     border: `1px solid ${b}`,
//     borderRadius: 8,
//     padding: "10px 14px",
//   }),
//   btnRow: { display: "flex", justifyContent: "space-between", marginTop: 8 },
//   backBtn: {
//     background: "transparent",
//     border: `1.5px solid ${BLUE}`,
//     color: BLUE,
//     borderRadius: 8,
//     padding: "10px 22px",
//     fontSize: 13,
//     fontWeight: 700,
//     cursor: "pointer",
//     fontFamily: FONT,
//   },
//   submitBtn: (d) => ({
//     background: d ? "#9ca3af" : "linear-gradient(90deg,#059669,#10b981)",
//     color: "#fff",
//     border: "none",
//     borderRadius: 10,
//     padding: "11px 28px",
//     fontSize: 14,
//     fontWeight: 700,
//     cursor: d ? "not-allowed" : "pointer",
//     boxShadow: d ? "none" : "0 4px 14px #10b98144",
//     fontFamily: FONT,
//   }),
//   validationBanner: {
//     background: "#fef2f2",
//     border: "1.5px solid #fca5a5",
//     borderRadius: 10,
//     padding: "14px 18px",
//     marginBottom: 20,
//     display: "flex",
//     alignItems: "flex-start",
//     gap: 12,
//   },
//   validationBannerIcon: {
//     fontSize: 20,
//     flexShrink: 0,
//     marginTop: 1,
//   },
//   validationBannerTitle: {
//     fontSize: 13,
//     fontWeight: 800,
//     color: "#991b1b",
//     marginBottom: 4,
//   },
//   validationBannerList: {
//     fontSize: 12,
//     color: "#b91c1c",
//     lineHeight: 1.7,
//     margin: 0,
//     paddingLeft: 16,
//   },
//   progressBar: {
//     height: 4,
//     borderRadius: 2,
//     background: "#e5e7eb",
//     marginBottom: 20,
//     overflow: "hidden",
//   },
//   progressFill: (pct) => ({
//     height: "100%",
//     width: `${pct}%`,
//     background:
//       pct === 100
//         ? "linear-gradient(90deg,#059669,#10b981)"
//         : "linear-gradient(90deg,#3b82f6,#6366f1)",
//     borderRadius: 2,
//     transition: "width 0.3s ease",
//   }),
//   progressLabel: {
//     fontSize: 11,
//     fontWeight: 700,
//     color: "#6b7280",
//     marginBottom: 6,
//     display: "flex",
//     justifyContent: "space-between",
//   },
// };

// // ─── Sub-components ───────────────────────────────────────────────────────────
// const Rdo = ({ sel, onChange, label, accent }) => (
//   <label style={S.radioBtn(sel, accent)}>
//     <input
//       type="radio"
//       checked={sel}
//       onChange={onChange}
//       style={{ accentColor: accent, width: 14, height: 14 }}
//     />
//     {label}
//   </label>
// );

// const YN = ({ val, setVal, accent = "#3b82f6" }) => (
//   <div style={S.radioRow}>
//     <Rdo
//       sel={val === "yes"}
//       onChange={() => setVal("yes")}
//       label="Yes"
//       accent={accent}
//     />
//     <Rdo
//       sel={val === "no"}
//       onChange={() => setVal("no")}
//       label="No"
//       accent={accent}
//     />
//   </div>
// );

// function InlineSubQ({
//   num,
//   question,
//   note,
//   accent = "#3b82f6",
//   children,
//   visible = true,
//   hasError = false,
// }) {
//   return (
//     <div
//       style={{
//         ...S.subRow,
//         background: visible ? (hasError ? "#fff8f8" : "#fff") : "#f9fafb",
//         opacity: visible ? 1 : 0.45,
//         pointerEvents: visible ? "auto" : "none",
//         transition: "opacity 0.2s, background 0.2s",
//         borderLeft: hasError && visible ? "3px solid #fca5a5" : undefined,
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "flex-start",
//           justifyContent: "space-between",
//           gap: 8,
//         }}
//       >
//         <div style={S.subRowHead}>
//           <span style={S.subQNum}>{num}</span>
//           <span
//             style={{ ...S.subQText, color: visible ? "#374151" : "#9ca3af" }}
//           >
//             {question}
//           </span>
//           {note && <span style={S.subQNote}>{note}</span>}
//           {hasError && visible && (
//             <span style={S.errorMsg}>⚠ This field is required</span>
//           )}
//         </div>
//         {!visible && (
//           <span
//             style={{
//               flexShrink: 0,
//               fontSize: 10,
//               fontWeight: 700,
//               color: "#9ca3af",
//               background: "#f3f4f6",
//               border: "1px solid #e5e7eb",
//               borderRadius: 5,
//               padding: "2px 7px",
//               letterSpacing: "0.4px",
//               marginTop: 2,
//               whiteSpace: "nowrap",
//             }}
//           >
//             🔒 Requires "Yes" above
//           </span>
//         )}
//       </div>
//       {children}
//     </div>
//   );
// }

// function InlineYN({ val, setVal, accent = "#3b82f6" }) {
//   return (
//     <div style={S.subRadioRow}>
//       <label style={S.subRadioOpt(val === "yes", accent)}>
//         <input
//           type="radio"
//           checked={val === "yes"}
//           onChange={() => setVal("yes")}
//           style={{ accentColor: accent, width: 14, height: 14 }}
//         />
//         a. Yes
//       </label>
//       <label style={S.subRadioOptLast(val === "no", accent)}>
//         <input
//           type="radio"
//           checked={val === "no"}
//           onChange={() => setVal("no")}
//           style={{ accentColor: accent, width: 14, height: 14 }}
//         />
//         b. No
//       </label>
//     </div>
//   );
// }

// const SectionHeader = ({ num, title, color = "#3b82f6" }) => (
//   <div
//     style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}
//   >
//     <div
//       style={{
//         background: color,
//         color: "#fff",
//         borderRadius: 8,
//         padding: "4px 10px",
//         fontSize: 12,
//         fontWeight: 800,
//       }}
//     >
//       {num}
//     </div>
//     <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
//       {title}
//     </div>
//   </div>
// );

// const QCard = ({
//   num,
//   question,
//   note,
//   accent = "#3b82f6",
//   children,
//   hasError = false,
//   fieldRef,
// }) => (
//   <div style={S.card(hasError)} ref={fieldRef}>
//     <div style={S.cardHead(accent)}>
//       <div style={S.qNum(accent)}>{num}</div>

//       <div>
//         <div style={S.qText}>{question}</div>

//         {/* ✅ FIXED NOTE RENDERING */}
//         {note && (
//           <div
//             style={{
//               ...S.qNote,
//               whiteSpace: "pre-line", // 🔥 ensures \n works
//             }}
//           >
//             {note}
//           </div>
//         )}

//         {hasError && <div style={S.requiredBadge}>⚠ Required</div>}
//       </div>
//     </div>

//     <div style={S.body}>{children}</div>
//   </div>
// );

// const QCardWithSubs = ({
//   num,
//   question,
//   note,
//   accent = "#3b82f6",
//   bodyChildren,
//   subChildren,
//   hasError = false,
//   fieldRef,
// }) => (
//   <div style={S.card(hasError)} ref={fieldRef}>
//     <div style={S.cardHead(accent)}>
//       <div style={S.qNum(accent)}>{num}</div>
//       <div>
//         <div style={S.qText}>{question}</div>
//         {note && <div style={S.qNote}>{note}</div>}
//         {hasError && <div style={S.requiredBadge}>⚠ Required</div>}
//       </div>
//     </div>
//     <div style={S.body}>{bodyChildren}</div>
//     {subChildren}
//   </div>
// );

// // ─── Stage3Form ───────────────────────────────────────────────────────────────
// export default function Stage3Form({ onBack, onSubmit, loading, initialData }) {
//   const router = useRouter();
//   const [submitted, setSubmitted] = useState(false);

//   // Refs for scrolling to first error
//   const fieldRefs = useRef({});
//   const setRef = (key) => (el) => {
//     if (el) fieldRefs.current[key] = el;
//   };

//   const [pirRef, setPirRef] = useState(initialData?.pirRef || "");
//   const [piiInvRef, setPiiInvRef] = useState(initialData?.piiInvRef || "");
//   const [dfdRef, setDfdRef] = useState(initialData?.dfdRef || "");
//   const [sdLead, setSdLead] = useState(initialData?.sdLead || "");
//   const [ocLead, setOcLead] = useState(initialData?.ocLead || "");
//   const [privacyAuditor, setPrivacyAuditor] = useState(
//     initialData?.privacyAuditor || "",
//   );
//   const [dpo, setDpo] = useState(initialData?.dpo || "");
//   const [projectName, setProjectName] = useState(
//     initialData?.projectName || "",
//   );
//   const [projectTypes, setProjectTypes] = useState(
//     initialData?.projectTypes || [],
//   );
//   const [projectDesc, setProjectDesc] = useState(
//     initialData?.projectDesc || "",
//   );
//   const [hosted, setHosted] = useState(initialData?.hosted || "");

//   const [periodicReview, setPeriodicReview] = useState(
//     initialData?.periodicReview || "",
//   );
//   const [lastReviewDate, setLastReviewDate] = useState(
//     initialData?.lastReviewDate || "",
//   );
//   const [evaluateNecessity, setEvaluateNecessity] = useState(
//     initialData?.evaluateNecessity || "",
//   );
//   const [dataDeleted, setDataDeleted] = useState(
//     initialData?.dataDeleted || "",
//   );

//   const [geoReceived, setGeoReceived] = useState(
//     initialData?.geoReceived || "",
//   );
//   const [geoStored, setGeoStored] = useState(initialData?.geoStored || "");
//   const [geoTransferred, setGeoTransferred] = useState(
//     initialData?.geoTransferred || "",
//   );
//   const [transferOutside, setTransferOutside] = useState(
//     initialData?.transferOutside || "",
//   );
//   const [notifyTransfer, setNotifyTransfer] = useState(
//     initialData?.notifyTransfer || "",
//   );
//   const [transferMechanisms, setTransferMechanisms] = useState(
//     initialData?.transferMechanisms || "",
//   );

//   const [hasThirdParties, setHasThirdParties] = useState(
//     initialData?.hasThirdParties || "",
//   );
//   const [thirdParties, setThirdParties] = useState(
//     initialData?.thirdParties || [{ name: "", purpose: "" }],
//   );
//   const [tpDueDiligence, setTpDueDiligence] = useState(
//     initialData?.tpDueDiligence || "",
//   );
//   const [tpNotify, setTpNotify] = useState(initialData?.tpNotify || "");
//   const [tpDeletion, setTpDeletion] = useState(initialData?.tpDeletion || "");
//   const [tpBreachReport, setTpBreachReport] = useState(
//     initialData?.tpBreachReport || "",
//   );

//   const [contractClauses, setContractClauses] = useState(
//     initialData?.contractClauses || "",
//   );
//   const [contractReview, setContractReview] = useState(
//     initialData?.contractReview || "",
//   );
//   const [contractReviewDate, setContractReviewDate] = useState(
//     initialData?.contractReviewDate || "",
//   );

//   const [hasSubContractors, setHasSubContractors] = useState(
//     initialData?.hasSubContractors || "",
//   );
//   const [subHowHired, setSubHowHired] = useState(
//     initialData?.subHowHired || "",
//   );
//   const [subIndividualUndertaking, setSubIndividualUndertaking] = useState(
//     initialData?.subIndividualUndertaking || "",
//   );
//   const [subVendorUndertaking, setSubVendorUndertaking] = useState(
//     initialData?.subVendorUndertaking || "",
//   );
//   const [subBreachReport, setSubBreachReport] = useState(
//     initialData?.subBreachReport || "",
//   );

//   const [rights, setRights] = useState(
//     initialData?.rights || PII_RIGHTS.reduce((a, r) => ({ ...a, [r]: "" }), {}),
//   );
//   const [rightsNA, setRightsNA] = useState(initialData?.rightsNA || false);

//   const [analytics, setAnalytics] = useState(initialData?.analytics || "");
//   const [breachNotification, setBreachNotification] = useState(
//     initialData?.breachNotification || "",
//   );
//   const [notificationTimeline, setNotificationTimeline] = useState(
//     initialData?.notificationTimeline || "Within 72 Hours",
//   );

//   const toggleProjectType = (v) =>
//     setProjectTypes((p) =>
//       p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
//     );

//   // ─── Validation ───────────────────────────────────────────────────────────
//   function getErrors() {
//     const e = {};

//     // §1
//     if (!pirRef.trim()) e.pirRef = true;
//     if (!piiInvRef.trim()) e.piiInvRef = true;
//     if (!dfdRef.trim()) e.dfdRef = true;

//     // §2
//     if (!sdLead.trim()) e.sdLead = true;
//     if (!ocLead.trim()) e.ocLead = true;
//     if (!privacyAuditor.trim()) e.privacyAuditor = true;
//     if (!dpo.trim()) e.dpo = true;

//     // §3
//     if (!projectName.trim()) e.projectName = true;
//     if (projectTypes.length === 0) e.projectTypes = true;
//     if (!projectDesc.trim()) e.projectDesc = true;
//     if (!hosted) e.hosted = true;

//     // §4
//     if (!periodicReview) e.periodicReview = true;
//     if (periodicReview === "yes" && !lastReviewDate.trim())
//       e.lastReviewDate = true;
//     if (!evaluateNecessity) e.evaluateNecessity = true;

//     // §5
//     if (!dataDeleted) e.dataDeleted = true;

//     // §6
//     if (!geoReceived.trim()) e.geoReceived = true;
//     if (!geoStored.trim()) e.geoStored = true;
//     if (!geoTransferred.trim()) e.geoTransferred = true;
//     if (!transferOutside) e.transferOutside = true;
//     if (transferOutside === "yes") {
//       if (!notifyTransfer) e.notifyTransfer = true;
//       if (!transferMechanisms) e.transferMechanisms = true;
//     }

//     // §7
//     if (!hasThirdParties) e.hasThirdParties = true;
//     if (hasThirdParties === "yes") {
//       if (!tpDueDiligence) e.tpDueDiligence = true;
//       if (!tpNotify) e.tpNotify = true;
//       if (!tpDeletion) e.tpDeletion = true;
//       if (!tpBreachReport) e.tpBreachReport = true;
//     }

//     // §8
//     if (!contractClauses) e.contractClauses = true;
//     if (!contractReview) e.contractReview = true;
//     if (contractReview === "yes" && !contractReviewDate.trim())
//       e.contractReviewDate = true;

//     // §9
//     if (!hasSubContractors) e.hasSubContractors = true;
//     if (hasSubContractors === "yes") {
//       if (!subHowHired) e.subHowHired = true;
//       if (
//         (subHowHired === "Individually Hired (Independent Contractors)" ||
//           subHowHired === "Both") &&
//         !subIndividualUndertaking
//       )
//         e.subIndividualUndertaking = true;
//       if (
//         (subHowHired === "Hired through Contract with Third party Vendors" ||
//           subHowHired === "Both") &&
//         !subVendorUndertaking
//       )
//         e.subVendorUndertaking = true;
//       if (!subBreachReport) e.subBreachReport = true;
//     }

//     // §10
//     if (!rightsNA) {
//       const unanswered = PII_RIGHTS.filter((r) => !rights[r]);
//       if (unanswered.length > 0) e.rights = true;
//     }

//     // §11
//     if (!analytics) e.analytics = true;

//     // §12
//     if (!breachNotification) e.breachNotification = true;
//     if (breachNotification === "yes" && !notificationTimeline.trim())
//       e.notificationTimeline = true;

//     return e;
//   }

//   // Compute progress as % of required fields answered
//   function getProgress() {
//     const allErrors = getErrors();
//     // count total required keys (rough estimate using all possible fields)
//     const requiredKeys = [
//       "pirRef",
//       "piiInvRef",
//       "dfdRef",
//       "sdLead",
//       "ocLead",
//       "privacyAuditor",
//       "dpo",
//       "projectName",
//       "projectTypes",
//       "projectDesc",
//       "hosted",
//       "periodicReview",
//       "evaluateNecessity",
//       "dataDeleted",
//       "geoReceived",
//       "geoStored",
//       "geoTransferred",
//       "transferOutside",
//       "hasThirdParties",
//       "contractClauses",
//       "contractReview",
//       "hasSubContractors",
//       "rights",
//       "analytics",
//       "breachNotification",
//     ];
//     const errorCount = Object.keys(allErrors).length;
//     // Total possible errors at any state — we use answered required fields
//     const answeredRequired = requiredKeys.filter((k) => !allErrors[k]).length;
//     return Math.round((answeredRequired / requiredKeys.length) * 100);
//   }

//   const errors = submitted ? getErrors() : {};
//   const errorCount = Object.keys(errors).length;
//   const progress = getProgress();

//   const ERROR_LABELS = {
//     pirRef: "1.1 PIR Reference",
//     piiInvRef: "1.2 PII Inventory Reference",
//     dfdRef: "1.3 DFD Reference",
//     sdLead: "2.1 Service Delivery Lead",
//     ocLead: "2.2 Operations Compliance Lead",
//     privacyAuditor: "2.3 Privacy Auditor",
//     dpo: "2.4 Data Protection Officer",
//     projectName: "3.1 Project Name",
//     projectTypes: "3.2 Project Type",
//     projectDesc: "3.3 Project Description",
//     hosted: "3.4 Hosting Location",
//     periodicReview: "4.1 Periodic Review",
//     lastReviewDate: "4.1.1 Last Review Date",
//     evaluateNecessity: "4.2 Evaluate Necessity",
//     dataDeleted: "5.1 Data Deletion",
//     geoReceived: "6.1 Geographic Location (Received)",
//     geoStored: "6.2 Geographic Location (Stored)",
//     geoTransferred: "6.3 Geographic Location (Transferred)",
//     transferOutside: "6.4 Transfer Outside Country",
//     notifyTransfer: "6.4.1 Notify on Transfer",
//     transferMechanisms: "6.4.2 Transfer Mechanisms",
//     hasThirdParties: "7.1 Third Parties",
//     tpDueDiligence: "7.1.2 Third Party Due Diligence",
//     tpNotify: "7.1.3 Notify PII Principals (Third Party)",
//     tpDeletion: "7.1.4 Third Party Data Deletion",
//     tpBreachReport: "7.1.5 Third Party Breach Reporting",
//     contractClauses: "8.1 Contract Clauses",
//     contractReview: "8.2 Contract Periodic Review",
//     contractReviewDate: "8.2.1 Last Contract Review Date",
//     hasSubContractors: "9.1 Sub-Contractors",
//     subHowHired: "9.1.1 Sub-Contractor Hiring Method",
//     subIndividualUndertaking: "9.1.1.1 Individual Sub-Contractor Undertaking",
//     subVendorUndertaking: "9.1.1.2 Vendor Sub-Contractor Undertaking",
//     subBreachReport: "9.1.2 Sub-Contractor Breach Reporting",
//     rights: "10.1 PII Principal Rights",
//     analytics: "11.1 Data Analytics",
//     breachNotification: "12.1 Breach Notification",
//     notificationTimeline: "12.1.1 Notification Timeline",
//   };

//   async function handleSubmit() {
//     setSubmitted(true);
//     const errs = getErrors();
//     if (Object.keys(errs).length > 0) {
//       // Scroll to first error
//       const firstKey = Object.keys(errs)[0];
//       const el = fieldRefs.current[firstKey];
//       if (el) {
//         el.scrollIntoView({ behavior: "smooth", block: "center" });
//       } else {
//         // fallback: scroll to top
//         window.scrollTo({ top: 0, behavior: "smooth" });
//       }
//       return;
//     }

//     const payload = {
//       pirRef,
//       piiInvRef,
//       dfdRef,
//       sdLead,
//       ocLead,
//       privacyAuditor,
//       dpo,
//       projectName,
//       projectTypes,
//       projectDesc,
//       hosted,
//       periodicReview,
//       lastReviewDate,
//       evaluateNecessity,
//       dataDeleted,
//       geoReceived,
//       geoStored,
//       geoTransferred,
//       transferOutside,
//       notifyTransfer,
//       transferMechanisms,
//       hasThirdParties,
//       thirdParties,
//       tpDueDiligence,
//       tpNotify,
//       tpDeletion,
//       tpBreachReport,
//       contractClauses,
//       contractReview,
//       contractReviewDate,
//       hasSubContractors,
//       subHowHired,
//       subIndividualUndertaking,
//       subVendorUndertaking,
//       subBreachReport,
//       rights,
//       rightsNA,
//       analytics,
//       breachNotification,
//       notificationTimeline,
//     };

//     const id = await onSubmit(payload);
//     if (id) {
//       router.push(`/dpia/compliance/${id}`);
//     }
//   }

//   return (
//     <div style={S.wrap}>
//       <link
//         href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
//         rel="stylesheet"
//       />

//       {/* Banner */}
//       <div style={S.banner}>
//         <div style={S.bannerEye}>Stage 3 of 3</div>
//         <div style={S.bannerH}>Data Protection Impact Assessment (DPIA)</div>
//         <div style={S.bannerSub}>
//           Data Protection Compliance Questionnaire — complete all sections and
//           submit.
//         </div>
//       </div>

//       {/* Progress bar */}
//       <div>
//         <div style={S.progressLabel}>
//           <span>Completion Progress</span>
//           <span style={{ color: progress === 100 ? "#059669" : "#6b7280" }}>
//             {progress}%
//           </span>
//         </div>
//         <div style={S.progressBar}>
//           <div style={S.progressFill(progress)} />
//         </div>
//       </div>

//       {/* Validation banner (shown after submit attempt) */}
//       {submitted && errorCount > 0 && (
//         <div style={S.validationBanner}>
//           <span style={S.validationBannerIcon}>🚫</span>
//           <div>
//             <div style={S.validationBannerTitle}>
//               {errorCount} required field{errorCount > 1 ? "s" : ""} need
//               {errorCount === 1 ? "s" : ""} to be completed before submitting
//             </div>
//             <ul style={S.validationBannerList}>
//               {Object.keys(errors).map((key) => (
//                 <li
//                   key={key}
//                   style={{ cursor: "pointer", textDecoration: "underline" }}
//                   onClick={() => {
//                     const el = fieldRefs.current[key];
//                     if (el)
//                       el.scrollIntoView({
//                         behavior: "smooth",
//                         block: "center",
//                       });
//                   }}
//                 >
//                   {ERROR_LABELS[key] || key}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}

//       {/* §1 PIR Info */}
//       <div style={S.section}>
//         <SectionHeader
//           num="1"
//           title="Privacy Impact Record (PIR) Information"
//           color="#3b82f6"
//         />
//         <QCard
//           num="1.1"
//           question="Privacy Impact Record (PIR) Reference"
//           accent="#3b82f6"
//           hasError={!!errors.pirRef}
//           fieldRef={setRef("pirRef")}
//         >
//           <input
//             style={S.inp(!!errors.pirRef)}
//             value={pirRef}
//             onChange={(e) => setPirRef(e.target.value)}
//             placeholder="Enter PIR reference number…"
//           />
//           {errors.pirRef && (
//             <div style={S.errorMsg}>⚠ This field is required</div>
//           )}
//         </QCard>
//         <QCard
//           num="1.2"
//           question="PII Inventory Reference"
//           accent="#3b82f6"
//           hasError={!!errors.piiInvRef}
//           fieldRef={setRef("piiInvRef")}
//         >
//           <div style={S.grid2}>
//             <div>
//               <label style={S.label}>Reference</label>
//               <input
//                 style={S.inp(!!errors.piiInvRef)}
//                 value={piiInvRef}
//                 onChange={(e) => setPiiInvRef(e.target.value)}
//                 placeholder="PII Inventory reference…"
//               />
//             </div>
//             <div>
//               <label style={S.label}>Personal Data Elements</label>
//               <input
//                 style={S.inp(false)}
//                 placeholder="Summary of data elements…"
//               />
//             </div>
//           </div>
//           {errors.piiInvRef && (
//             <div style={S.errorMsg}>⚠ PII Inventory Reference is required</div>
//           )}
//         </QCard>
//         <QCard
//           num="1.3"
//           question="Data Flow Diagram (DFD) Reference"
//           accent="#3b82f6"
//           hasError={!!errors.dfdRef}
//           fieldRef={setRef("dfdRef")}
//         >
//           <input
//             style={S.inp(!!errors.dfdRef)}
//             value={dfdRef}
//             onChange={(e) => setDfdRef(e.target.value)}
//             placeholder="Enter DFD reference…"
//           />
//           {errors.dfdRef && (
//             <div style={S.errorMsg}>⚠ This field is required</div>
//           )}
//         </QCard>
//       </div>

//       {/* §2 Stakeholders */}
//       <div style={S.section}>
//         <SectionHeader
//           num="2"
//           title="Project Stakeholder Information"
//           color="#0ea5e9"
//         />
//         {[
//           ["2.1", "Service Delivery Lead", sdLead, setSdLead, "sdLead"],
//           ["2.2", "Operations Compliance Lead", ocLead, setOcLead, "ocLead"],
//           [
//             "2.3",
//             "Privacy Auditor",
//             privacyAuditor,
//             setPrivacyAuditor,
//             "privacyAuditor",
//           ],
//           ["2.4", "Data Protection Officer", dpo, setDpo, "dpo"],
//         ].map(([num, lbl, val, setter, key]) => (
//           <QCard
//             key={num}
//             num={num}
//             question={lbl}
//             accent="#0ea5e9"
//             hasError={!!errors[key]}
//             fieldRef={setRef(key)}
//           >
//             <input
//               style={S.inp(!!errors[key])}
//               value={val}
//               onChange={(e) => setter(e.target.value)}
//               placeholder="Enter name…"
//             />
//             {errors[key] && (
//               <div style={S.errorMsg}>⚠ This field is required</div>
//             )}
//           </QCard>
//         ))}
//       </div>

//       {/* §3 General Info */}
//       <div style={S.section}>
//         <SectionHeader
//           num="3"
//           title="General Information & Background"
//           color="#8b5cf6"
//         />
//         <QCard
//           num="3.1"
//           question="Project Name"
//           accent="#8b5cf6"
//           hasError={!!errors.projectName}
//           fieldRef={setRef("projectName")}
//         >
//           <input
//             style={S.inp(!!errors.projectName)}
//             value={projectName}
//             onChange={(e) => setProjectName(e.target.value)}
//             placeholder="Enter project name…"
//           />
//           {errors.projectName && (
//             <div style={S.errorMsg}>⚠ This field is required</div>
//           )}
//         </QCard>
//         <QCard
//           num="3.2"
//           question="Which of the following best describes this Project? (Select all that apply)"
//           accent="#8b5cf6"
//           hasError={!!errors.projectTypes}
//           fieldRef={setRef("projectTypes")}
//         >
//           <div style={S.chkGrid(3)}>
//             {PROJECT_TYPES.map((pt) => (
//               <label
//                 key={pt}
//                 style={S.chkBtn(projectTypes.includes(pt), "#8b5cf6")}
//               >
//                 <input
//                   type="checkbox"
//                   checked={projectTypes.includes(pt)}
//                   onChange={() => toggleProjectType(pt)}
//                   style={{
//                     accentColor: "#8b5cf6",
//                     width: 14,
//                     height: 14,
//                     marginTop: 2,
//                     flexShrink: 0,
//                   }}
//                 />
//                 <span>{pt}</span>
//               </label>
//             ))}
//           </div>
//           {errors.projectTypes && (
//             <div style={S.errorMsg}>
//               ⚠ Please select at least one project type
//             </div>
//           )}
//         </QCard>
//         <QCard
//           num="3.3"
//           question="Provide a detailed description of the Project and the processing activities involved, including objectives."
//           accent="#8b5cf6"
//           hasError={!!errors.projectDesc}
//           fieldRef={setRef("projectDesc")}
//         >
//           <textarea
//             style={S.textarea(!!errors.projectDesc)}
//             value={projectDesc}
//             onChange={(e) => setProjectDesc(e.target.value)}
//             placeholder="Describe the project nature, processing activities, and objectives…"
//           />
//           {errors.projectDesc && (
//             <div style={S.errorMsg}>⚠ This field is required</div>
//           )}
//         </QCard>
//         <QCard
//           num="3.4"
//           question="Where is the application (database) hosted?"
//           accent="#8b5cf6"
//           hasError={!!errors.hosted}
//           fieldRef={setRef("hosted")}
//         >
//           <div style={S.radioRow}>
//             {["On Premise", "Cloud Platform", "Both"].map((v) => (
//               <Rdo
//                 key={v}
//                 sel={hosted === v}
//                 onChange={() => setHosted(v)}
//                 label={v}
//                 accent="#8b5cf6"
//               />
//             ))}
//           </div>
//           {errors.hosted && (
//             <div style={{ ...S.errorMsg, marginTop: 8 }}>
//               ⚠ Please select a hosting option
//             </div>
//           )}
//         </QCard>
//       </div>

//       {/* §4 Data Use */}
//       <div style={S.section}>
//         <SectionHeader num="4" title="Data Use" color="#f59e0b" />
//         <QCardWithSubs
//           num="4.1"
//           question="Is a periodic review performed at least annually by Compliance Team / Designated Individuals to ensure Personal Data is processed in line with the notice?"
//           accent="#f59e0b"
//           hasError={!!errors.periodicReview}
//           fieldRef={setRef("periodicReview")}
//           bodyChildren={
//             <>
//               <YN
//                 val={periodicReview}
//                 setVal={setPeriodicReview}
//                 accent="#f59e0b"
//               />
//               {errors.periodicReview && (
//                 <div style={{ ...S.errorMsg, marginTop: 8 }}>
//                   ⚠ Please select Yes or No
//                 </div>
//               )}
//             </>
//           }
//           subChildren={
//             <InlineSubQ
//               num="4.1.1"
//               question="Date of last periodic review (DD/MM/YYYY)"
//               accent="#f59e0b"
//               visible={periodicReview === "yes"}
//               hasError={!!errors.lastReviewDate}
//             >
//               <div ref={setRef("lastReviewDate")}>
//                 <input
//                   style={{ ...S.inp(!!errors.lastReviewDate), maxWidth: 200 }}
//                   value={lastReviewDate}
//                   onChange={(e) => setLastReviewDate(e.target.value)}
//                   placeholder="DD/MM/YYYY"
//                 />
//               </div>
//             </InlineSubQ>
//           }
//         />
//         <QCard
//           num="4.2"
//           question="Does the Compliance Team evaluate the necessity of the Personal Data collected from PII Principals?"
//           accent="#f59e0b"
//           hasError={!!errors.evaluateNecessity}
//           fieldRef={setRef("evaluateNecessity")}
//         >
//           <YN
//             val={evaluateNecessity}
//             setVal={setEvaluateNecessity}
//             accent="#f59e0b"
//           />
//           {errors.evaluateNecessity && (
//             <div style={{ ...S.errorMsg, marginTop: 8 }}>
//               ⚠ Please select Yes or No
//             </div>
//           )}
//         </QCard>
//       </div>

//       {/* §5 Retention */}
//       <div style={S.section}>
//         <SectionHeader
//           num="5"
//           title="Data Retention and Disposal"
//           color="#10b981"
//         />
//         <QCard
//           num="5.1"
//           question="If Personal Data is stored in the organization's environment, is it being deleted at the end of the processing requirement?"
//           accent="#10b981"
//           hasError={!!errors.dataDeleted}
//           fieldRef={setRef("dataDeleted")}
//         >
//           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//             {[
//               "Personal Data is being deleted from the organization's environment/ systems",
//               "Despite Regulatory Obligations or retention period identified, Personal Data not deleted",
//             ].map((v) => (
//               <Rdo
//                 key={v}
//                 sel={dataDeleted === v}
//                 onChange={() => setDataDeleted(v)}
//                 label={v}
//                 accent="#10b981"
//               />
//             ))}
//           </div>
//           {errors.dataDeleted && (
//             <div style={{ ...S.errorMsg, marginTop: 8 }}>
//               ⚠ Please select an option
//             </div>
//           )}
//         </QCard>
//       </div>

//       {/* §6 Data Transfer */}
//       <div style={S.section}>
//         <SectionHeader num="6" title="Data Transfer" color="#6366f1" />
//         <QCard
//           num="6.1"
//           question="From which geographic location(s) is the Personal Data received from PII Principals?"
//           accent="#6366f1"
//           hasError={!!errors.geoReceived}
//           fieldRef={setRef("geoReceived")}
//         >
//           <input
//             style={S.inp(!!errors.geoReceived)}
//             value={geoReceived}
//             onChange={(e) => setGeoReceived(e.target.value)}
//             placeholder="e.g. India, United States…"
//           />
//           {errors.geoReceived && (
//             <div style={S.errorMsg}>⚠ This field is required</div>
//           )}
//         </QCard>
//         <QCard
//           num="6.2"
//           question="In which geographic location(s) is the Personal Data stored in the organization's environment?"
//           accent="#6366f1"
//           hasError={!!errors.geoStored}
//           fieldRef={setRef("geoStored")}
//         >
//           <input
//             style={S.inp(!!errors.geoStored)}
//             value={geoStored}
//             onChange={(e) => setGeoStored(e.target.value)}
//             placeholder="e.g. India…"
//           />
//           {errors.geoStored && (
//             <div style={S.errorMsg}>⚠ This field is required</div>
//           )}
//         </QCard>
//         <QCard
//           num="6.3"
//           question="To which geographic location(s) is the Personal Data transferred? (Internal teams / Third parties)"
//           accent="#6366f1"
//           hasError={!!errors.geoTransferred}
//           fieldRef={setRef("geoTransferred")}
//         >
//           <input
//             style={S.inp(!!errors.geoTransferred)}
//             value={geoTransferred}
//             onChange={(e) => setGeoTransferred(e.target.value)}
//             placeholder="e.g. United States, Europe…"
//           />
//           {errors.geoTransferred && (
//             <div style={S.errorMsg}>⚠ This field is required</div>
//           )}
//         </QCard>

//         <QCardWithSubs
//           num="6.4"
//           question="Is Personal Data stored in the organization's environment transferred outside the originating country?"
//           accent="#6366f1"
//           hasError={!!errors.transferOutside}
//           fieldRef={setRef("transferOutside")}
//           bodyChildren={
//             <>
//               <YN
//                 val={transferOutside}
//                 setVal={setTransferOutside}
//                 accent="#6366f1"
//               />
//               {errors.transferOutside && (
//                 <div style={{ ...S.errorMsg, marginTop: 8 }}>
//                   ⚠ Please select Yes or No
//                 </div>
//               )}
//             </>
//           }
//           subChildren={
//             <>
//               <InlineSubQ
//                 num="6.4.1"
//                 question="Do you notify the user (PII Principals) and obtain written authorization prior to transferring Personal Data obtained from the user outside the originating country?"
//                 note="Note: Prior approval may be part of explicit consent."
//                 accent="#6366f1"
//                 visible={transferOutside === "yes"}
//                 hasError={!!errors.notifyTransfer}
//               >
//                 <div ref={setRef("notifyTransfer")}>
//                   <InlineYN
//                     val={notifyTransfer}
//                     setVal={setNotifyTransfer}
//                     accent="#6366f1"
//                   />
//                 </div>
//               </InlineSubQ>
//               <InlineSubQ
//                 num="6.4.2"
//                 question="Are appropriate data transfer mechanisms in place to safeguard the transmission of Personal Data obtained from the user (PII Principals) outside the originating country?"
//                 note="(e.g. Standard Contractual Clauses, Binding Corporate Rules, Approvals from regulators, EU-US Privacy Shield, etc.)"
//                 accent="#6366f1"
//                 visible={transferOutside === "yes"}
//                 hasError={!!errors.transferMechanisms}
//               >
//                 <div ref={setRef("transferMechanisms")}>
//                   <InlineYN
//                     val={transferMechanisms}
//                     setVal={setTransferMechanisms}
//                     accent="#6366f1"
//                   />
//                 </div>
//               </InlineSubQ>
//             </>
//           }
//         />
//       </div>

//       {/* §7 Third Parties */}
//       <div style={S.section}>
//         <SectionHeader
//           num="7"
//           title="Third Party Agencies (Excluding Sub-Contractors)"
//           color="#ec4899"
//         />
//         <QCardWithSubs
//           num="7.1"
//           question="Do you contract third parties for processing of Personal Data in order to provide services?"
//           note="Note: Please contact Legal in case of any queries regarding contractual clauses."
//           accent="#ec4899"
//           hasError={!!errors.hasThirdParties}
//           fieldRef={setRef("hasThirdParties")}
//           bodyChildren={
//             <>
//               <YN
//                 val={hasThirdParties}
//                 setVal={setHasThirdParties}
//                 accent="#ec4899"
//               />
//               {errors.hasThirdParties && (
//                 <div style={{ ...S.errorMsg, marginTop: 8 }}>
//                   ⚠ Please select Yes or No
//                 </div>
//               )}
//             </>
//           }
//           subChildren={
//             <>
//               <InlineSubQ
//                 num="7.1.1"
//                 question="Details of third party organizations having access to Personal Data"
//                 accent="#ec4899"
//                 visible={hasThirdParties === "yes"}
//               >
//                 <div style={S.tableWrap}>
//                   <table style={S.table}>
//                     <thead>
//                       <tr>
//                         <th style={S.th}>Third Party</th>
//                         <th style={S.th}>Purpose / Justification</th>
//                         <th style={{ ...S.th, width: 40 }}></th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {thirdParties.map((tp, i) => (
//                         <tr key={i}>
//                           <td style={S.td}>
//                             <input
//                               style={S.inp(false)}
//                               value={tp.name}
//                               onChange={(e) => {
//                                 const n = [...thirdParties];
//                                 n[i] = { ...n[i], name: e.target.value };
//                                 setThirdParties(n);
//                               }}
//                               placeholder="Third party name…"
//                             />
//                           </td>
//                           <td style={S.td}>
//                             <input
//                               style={S.inp(false)}
//                               value={tp.purpose}
//                               onChange={(e) => {
//                                 const n = [...thirdParties];
//                                 n[i] = { ...n[i], purpose: e.target.value };
//                                 setThirdParties(n);
//                               }}
//                               placeholder="Purpose…"
//                             />
//                           </td>
//                           <td style={S.td}>
//                             <button
//                               style={{
//                                 background: "none",
//                                 border: "none",
//                                 color: "#ef4444",
//                                 cursor: "pointer",
//                                 fontSize: 16,
//                               }}
//                               onClick={() =>
//                                 setThirdParties(
//                                   thirdParties.filter((_, idx) => idx !== i),
//                                 )
//                               }
//                             >
//                               ×
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//                 <button
//                   style={S.addBtn}
//                   onClick={() =>
//                     setThirdParties([
//                       ...thirdParties,
//                       { name: "", purpose: "" },
//                     ])
//                   }
//                 >
//                   + Add Third Party
//                 </button>
//               </InlineSubQ>

//               <InlineSubQ
//                 num="7.1.2"
//                 question="Is due diligence / screening performed on the third parties to assess their privacy and security posture?"
//                 accent="#ec4899"
//                 visible={hasThirdParties === "yes"}
//                 hasError={!!errors.tpDueDiligence}
//               >
//                 <div ref={setRef("tpDueDiligence")}>
//                   <InlineYN
//                     val={tpDueDiligence}
//                     setVal={setTpDueDiligence}
//                     accent="#ec4899"
//                   />
//                 </div>
//               </InlineSubQ>

//               <InlineSubQ
//                 num="7.1.3"
//                 question="Do you notify the user (PII Principals) and obtain written authorization prior to contracting a third party?"
//                 accent="#ec4899"
//                 visible={hasThirdParties === "yes"}
//                 hasError={!!errors.tpNotify}
//               >
//                 <div ref={setRef("tpNotify")}>
//                   <InlineYN
//                     val={tpNotify}
//                     setVal={setTpNotify}
//                     accent="#ec4899"
//                   />
//                 </div>
//               </InlineSubQ>

//               <InlineSubQ
//                 num="7.1.4"
//                 question="Is Personal Data being / will be deleted or returned to the organization's after end of processing?"
//                 accent="#ec4899"
//                 visible={hasThirdParties === "yes"}
//                 hasError={!!errors.tpDeletion}
//               >
//                 <div
//                   ref={setRef("tpDeletion")}
//                   style={{ display: "flex", flexDirection: "column", gap: 8 }}
//                 >
//                   {[
//                     "All Personal Data deleted by the third parties including any backups.",
//                     "Personal Data is being / will be returned to the organization and deleted from the third parties environment",
//                     "No Contractual obligation imposed by the organization on third parties to delete Personal Data, hence not deleted.",
//                     "Not Applicable since no Personal Data is backed up / retained by the Third parties.",
//                   ].map((v) => (
//                     <Rdo
//                       key={v}
//                       sel={tpDeletion === v}
//                       onChange={() => setTpDeletion(v)}
//                       label={v}
//                       accent="#ec4899"
//                     />
//                   ))}
//                 </div>
//               </InlineSubQ>

//               <InlineSubQ
//                 num="7.1.5"
//                 question="Does the contract include obligations on reporting any data breach to the organization?"
//                 accent="#ec4899"
//                 visible={hasThirdParties === "yes"}
//                 hasError={!!errors.tpBreachReport}
//               >
//                 <div ref={setRef("tpBreachReport")}>
//                   <InlineYN
//                     val={tpBreachReport}
//                     setVal={setTpBreachReport}
//                     accent="#ec4899"
//                   />
//                 </div>
//               </InlineSubQ>
//             </>
//           }
//         />
//       </div>

//       {/* §8 Contractual */}
//       <div style={S.section}>
//         <SectionHeader
//           num="8"
//           title="Contractual Obligations"
//           color="#f97316"
//         />
//         <QCard
//           num="8.1"
//           question="Does your contract with third parties capture clauses as required by relevant privacy law?"
//           note={[
//             "Clauses may include:",
//             "1. Limiting processing per documented instructions",
//             "2. Imposing confidentiality restrictions on people handling Personal Data",
//             "3. Requiring the third party vendor to implement appropriate technical and organizational safeguards",
//             "4. Restrictions on third party vendors for contracting other sub-processors",
//             "5. Ensuring sub-processors (if engaged) follow the same obligations",
//             "6. Assistance in processing PII Principals' rights requests",
//             "7. Deleting or returning Personal Data at the end of service or upon request",
//             "8. Preparing data flow diagrams and PII inventories",
//             "9. Right to audit clauses",
//             "10. Notifying data breaches to the Organization",
//             "11. Assistance in performing DPIAs",
//             "12. Data transfer restrictions and related compliance requirements",
//           ].join("\n")}
//           accent="#f97316"
//           hasError={!!errors.contractClauses}
//           fieldRef={setRef("contractClauses")}
//         >
//           <YN
//             val={contractClauses}
//             setVal={setContractClauses}
//             accent="#f97316"
//           />

//           {errors.contractClauses && (
//             <div style={{ ...S.errorMsg, marginTop: 8 }}>
//               ⚠ Please select Yes or No
//             </div>
//           )}
//         </QCard>
//         <QCardWithSubs
//           num="8.2"
//           question="Is a periodic review performed at least annually to ensure Personal Data is processed by contracted third parties as contractually agreed?"
//           accent="#f97316"
//           hasError={!!errors.contractReview}
//           fieldRef={setRef("contractReview")}
//           bodyChildren={
//             <>
//               <YN
//                 val={contractReview}
//                 setVal={setContractReview}
//                 accent="#f97316"
//               />
//               {errors.contractReview && (
//                 <div style={{ ...S.errorMsg, marginTop: 8 }}>
//                   ⚠ Please select Yes or No
//                 </div>
//               )}
//             </>
//           }
//           subChildren={
//             <InlineSubQ
//               num="8.2.1"
//               question="Date of last periodic review (DD/MM/YYYY)"
//               accent="#f97316"
//               visible={contractReview === "yes"}
//               hasError={!!errors.contractReviewDate}
//             >
//               <div ref={setRef("contractReviewDate")}>
//                 <input
//                   style={{
//                     ...S.inp(!!errors.contractReviewDate),
//                     maxWidth: 200,
//                   }}
//                   value={contractReviewDate}
//                   onChange={(e) => setContractReviewDate(e.target.value)}
//                   placeholder="DD/MM/YYYY"
//                 />
//               </div>
//             </InlineSubQ>
//           }
//         />
//       </div>

//       {/* §9 Sub-Contractors */}
//       <div style={S.section}>
//         <SectionHeader num="9" title="Sub Contractors" color="#14b8a6" />
//         <div style={S.alertBox("#065f46", "#f0fdf9", "#a7f3d0")}>
//           Subcontracting refers to the practice of hiring an outside individual
//           to perform specific parts of a business contract or project.
//         </div>
//         <QCardWithSubs
//           num="9.1"
//           question="Do you hire Sub Contractors for processing of Personal Data in order to provide services?"
//           accent="#14b8a6"
//           hasError={!!errors.hasSubContractors}
//           fieldRef={setRef("hasSubContractors")}
//           bodyChildren={
//             <>
//               <YN
//                 val={hasSubContractors}
//                 setVal={setHasSubContractors}
//                 accent="#14b8a6"
//               />
//               {errors.hasSubContractors && (
//                 <div style={{ ...S.errorMsg, marginTop: 8 }}>
//                   ⚠ Please select Yes or No
//                 </div>
//               )}
//             </>
//           }
//           subChildren={
//             <>
//               <InlineSubQ
//                 num="9.1.1"
//                 question="How are the Sub Contractors hired?"
//                 accent="#14b8a6"
//                 visible={hasSubContractors === "yes"}
//                 hasError={!!errors.subHowHired}
//               >
//                 <div ref={setRef("subHowHired")} style={S.radioRow}>
//                   {[
//                     "Individually Hired (Independent Contractors)",
//                     "Hired through Contract with Third party Vendors",
//                     "Both",
//                   ].map((v) => (
//                     <Rdo
//                       key={v}
//                       sel={subHowHired === v}
//                       onChange={() => setSubHowHired(v)}
//                       label={v}
//                       accent="#14b8a6"
//                     />
//                   ))}
//                 </div>
//               </InlineSubQ>

//               {(subHowHired ===
//                 "Individually Hired (Independent Contractors)" ||
//                 subHowHired === "Both") && (
//                 <InlineSubQ
//                   num="9.1.1.1"
//                   visible={hasSubContractors === "yes"}
//                   question="Are appropriate undertakings pertaining to Data Privacy and Protection obtained (e.g. NDA) prior to onboarding individually hired Sub Contractors?"
//                   accent="#14b8a6"
//                   hasError={!!errors.subIndividualUndertaking}
//                 >
//                   <div
//                     ref={setRef("subIndividualUndertaking")}
//                     style={{ display: "flex", flexDirection: "column", gap: 8 }}
//                   >
//                     {[
//                       "Yes",
//                       "No",
//                       "Undertaking obtained but no clauses pertaining to Data Privacy and Protection.",
//                     ].map((v) => (
//                       <Rdo
//                         key={v}
//                         sel={subIndividualUndertaking === v}
//                         onChange={() => setSubIndividualUndertaking(v)}
//                         label={v}
//                         accent="#14b8a6"
//                       />
//                     ))}
//                   </div>
//                 </InlineSubQ>
//               )}

//               {(subHowHired ===
//                 "Hired through Contract with Third party Vendors" ||
//                 subHowHired === "Both") && (
//                 <InlineSubQ
//                   num="9.1.1.2"
//                   visible={hasSubContractors === "yes"}
//                   question="Are appropriate undertakings pertaining to Data Privacy and Protection obtained prior to onboarding Sub Contractors hired through third party vendors?"
//                   accent="#14b8a6"
//                   hasError={!!errors.subVendorUndertaking}
//                 >
//                   <div
//                     ref={setRef("subVendorUndertaking")}
//                     style={{ display: "flex", flexDirection: "column", gap: 8 }}
//                   >
//                     {[
//                       "Yes",
//                       "No",
//                       "Undertaking obtained from Third Party for the Sub Contractors but no clauses pertaining to Data Privacy and Protection enforced by the organization on the third party vendors through the Contract.",
//                     ].map((v) => (
//                       <Rdo
//                         key={v}
//                         sel={subVendorUndertaking === v}
//                         onChange={() => setSubVendorUndertaking(v)}
//                         label={v}
//                         accent="#14b8a6"
//                       />
//                     ))}
//                   </div>
//                 </InlineSubQ>
//               )}

//               <InlineSubQ
//                 num="9.1.2"
//                 question="Does the contract / agreement include obligations on reporting any data breach to the organization?"
//                 accent="#14b8a6"
//                 visible={hasSubContractors === "yes"}
//                 hasError={!!errors.subBreachReport}
//               >
//                 <div ref={setRef("subBreachReport")}>
//                   <InlineYN
//                     val={subBreachReport}
//                     setVal={setSubBreachReport}
//                     accent="#14b8a6"
//                   />
//                 </div>
//               </InlineSubQ>
//             </>
//           }
//         />
//       </div>

//       {/* §10 PII Rights */}
//       <div style={S.section}>
//         <SectionHeader num="10" title="PII Principals Rights" color="#a855f7" />
//         <QCard
//           num="10.1"
//           question="In case PII is stored within the organization's environment, which of the following capabilities is available to process PII Principals' requests?"
//           accent="#a855f7"
//           hasError={!!errors.rights}
//           fieldRef={setRef("rights")}
//         >
//           {errors.rights && (
//             <div
//               style={{
//                 ...S.alertBox("#991b1b", "#fef2f2", "#fecaca"),
//                 marginBottom: 10,
//               }}
//             >
//               ⚠ Please answer Yes or No for all processes, or mark as Not
//               Applicable
//             </div>
//           )}
//           <table style={S.table}>
//             <thead>
//               <tr>
//                 <th style={S.rth}>Process</th>
//                 <th style={{ ...S.rth, width: 60, textAlign: "center" }}>
//                   Yes
//                 </th>
//                 <th style={{ ...S.rth, width: 60, textAlign: "center" }}>No</th>
//               </tr>
//             </thead>
//             <tbody>
//               {PII_RIGHTS.map((right, i) => (
//                 <tr
//                   key={i}
//                   style={{
//                     background:
//                       !rightsNA && errors.rights && !rights[right]
//                         ? "#fff5f5"
//                         : i % 2 === 0
//                           ? "#fff"
//                           : "#f8fafd",
//                   }}
//                 >
//                   <td style={S.rtd}>{right}</td>
//                   <td style={{ ...S.rtd, textAlign: "center" }}>
//                     <input
//                       type="radio"
//                       checked={rights[right] === "yes"}
//                       onChange={() =>
//                         setRights((p) => ({ ...p, [right]: "yes" }))
//                       }
//                       style={{ accentColor: "#a855f7" }}
//                       disabled={rightsNA}
//                     />
//                   </td>
//                   <td style={{ ...S.rtd, textAlign: "center" }}>
//                     <input
//                       type="radio"
//                       checked={rights[right] === "no"}
//                       onChange={() =>
//                         setRights((p) => ({ ...p, [right]: "no" }))
//                       }
//                       style={{ accentColor: "#a855f7" }}
//                       disabled={rightsNA}
//                     />
//                   </td>
//                 </tr>
//               ))}
//               <tr style={{ background: "#fdf4ff" }}>
//                 <td style={{ ...S.rtd, fontStyle: "italic", color: "#6b7280" }}>
//                   Not Applicable — no Organizational Systems / Databases hosting
//                   Client's Personal Data are used.
//                 </td>
//                 <td colSpan={2} style={{ ...S.rtd, textAlign: "center" }}>
//                   <label
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       gap: 6,
//                       cursor: "pointer",
//                     }}
//                   >
//                     <input
//                       type="checkbox"
//                       checked={rightsNA}
//                       onChange={(e) => setRightsNA(e.target.checked)}
//                       style={{ accentColor: "#a855f7" }}
//                     />
//                     Not Applicable
//                   </label>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </QCard>
//       </div>

//       {/* §11 Analytics */}
//       <div style={S.section}>
//         <SectionHeader num="11" title="Data Analytics" color="#84cc16" />
//         <QCard
//           num="11.1"
//           question="Do you carry out data analytics, automated profiling or machine learning based processing using Personal Data as part of your Project?"
//           accent="#84cc16"
//           hasError={!!errors.analytics}
//           fieldRef={setRef("analytics")}
//         >
//           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//             {[
//               "Yes (As per the contract with the Client)",
//               "Yes (Not defined in the contract with the Client)",
//               "No",
//             ].map((v) => (
//               <Rdo
//                 key={v}
//                 sel={analytics === v}
//                 onChange={() => setAnalytics(v)}
//                 label={v}
//                 accent="#84cc16"
//               />
//             ))}
//           </div>
//           {errors.analytics && (
//             <div style={{ ...S.errorMsg, marginTop: 8 }}>
//               ⚠ Please select an option
//             </div>
//           )}
//         </QCard>
//       </div>

//       {/* §12 Data Breach */}
//       <div style={S.section}>
//         <SectionHeader
//           num="12"
//           title="Data Breach and Notification"
//           color="#ef4444"
//         />
//         <QCardWithSubs
//           num="12.1"
//           question="Is there any commitment as per the notice to the user (PII Principals) on Data Breach notification timelines?"
//           accent="#ef4444"
//           hasError={!!errors.breachNotification}
//           fieldRef={setRef("breachNotification")}
//           bodyChildren={
//             <>
//               <YN
//                 val={breachNotification}
//                 setVal={setBreachNotification}
//                 accent="#ef4444"
//               />
//               {errors.breachNotification && (
//                 <div style={{ ...S.errorMsg, marginTop: 8 }}>
//                   ⚠ Please select Yes or No
//                 </div>
//               )}
//             </>
//           }
//           subChildren={
//             <InlineSubQ
//               num="12.1.1"
//               question="Please mention the notification timeline identified by the user (PII Principals)"
//               accent="#ef4444"
//               visible={breachNotification === "yes"}
//               hasError={!!errors.notificationTimeline}
//             >
//               <div ref={setRef("notificationTimeline")}>
//                 <input
//                   style={{
//                     ...S.inp(!!errors.notificationTimeline),
//                     maxWidth: 240,
//                   }}
//                   value={notificationTimeline}
//                   onChange={(e) => setNotificationTimeline(e.target.value)}
//                   placeholder="e.g. Within 72 Hours"
//                 />
//               </div>
//             </InlineSubQ>
//           }
//         />
//       </div>

//       {/* Validation summary at bottom */}
//       {submitted && errorCount > 0 && (
//         <div style={{ ...S.validationBanner, marginBottom: 16 }}>
//           <span style={S.validationBannerIcon}>🚫</span>
//           <div>
//             <div style={S.validationBannerTitle}>
//               Please complete all {errorCount} required field
//               {errorCount > 1 ? "s" : ""} before submitting.
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Navigation */}
//       <div style={S.btnRow}>
//         <button style={S.backBtn} onClick={onBack} disabled={loading}>
//           ← Back to Stage 2
//         </button>
//         <button
//           style={S.submitBtn(loading)}
//           onClick={handleSubmit}
//           disabled={loading}
//         >
//           {loading ? "Submitting…" : "✓ Submit Assessment"}
//         </button>
//       </div>
//     </div>
//   );
// }


















// C:\Users\ak192\Downloads\cf-tool-frontend-prod (6)\cf-tool-frontend-prod\src\modules\dpia\components\Stage3Form.js

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FONT, BLUE, DARK } from "./shared";

// ─── Data (UNCHANGED) ────────────────────────────────────────────────────────
const PII_RIGHTS = [
  "Process through which a PII Principal could receive detailed information about their Personal Data",
  "Process through which a PII Principal would be granted access to copies of their Personal Data",
  "Process through which a PII Principal would be able to rectify any inaccurate or incomplete Personal Data",
  "Process through which a PII Principal would be able to erase or purge their Personal Data",
  "Process through which a PII Principal would be able to export their Personal Data into a machine-readable format",
  "Process through which a PII Principal would be able to object to data processing activities",
  "Process through which a PII Principal would be able to restrict data processing activities",
  "Process through which a PII Principal would be able to object to automated decision-making activities and request human intervention",
];
const PROJECT_TYPES = [
  "Application Managed Services","Financial Solutions","Consulting","Analytics",
  "Healthcare Solutions","Other — Admin & Facilities","Infrastructure Hosting",
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

  // Banner
  banner: {
    background: T.cardBg, backdropFilter: "blur(8px)",
    border: T.cardBorder, borderRadius: T.cardRadius,
    boxShadow: T.cardShadow, padding: "18px 24px",
    marginBottom: 20, display: "flex", alignItems: "center", gap: 16,
    animation: "fadeUp 0.4s ease both",
  },
  bannerIcon: {
    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
    background: "linear-gradient(135deg,#10b981,#059669)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
    fontSize: 22, color: "#fff", fontWeight: 900,
  },
  bannerEye: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "#f0fdf4", border: "1px solid #86efac",
    borderRadius: 20, padding: "3px 10px",
    fontSize: 11, fontWeight: 700, color: "#15803d", marginBottom: 6,
  },
  bannerH: { fontSize: 18, fontWeight: 700, color: T.text, margin: 0, lineHeight: 1.2 },
  bannerSub: { fontSize: 13, color: T.subText, marginTop: 4, lineHeight: 1.6 },

  // Progress
  progressWrap: {
    background: T.cardBg, backdropFilter: "blur(8px)",
    border: T.cardBorder, borderRadius: 10,
    padding: "14px 18px", marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  progressLabel: {
    fontSize: 12, fontWeight: 600, color: T.subText,
    marginBottom: 8, display: "flex", justifyContent: "space-between",
  },
  progressBar: {
    height: 6, borderRadius: 3,
    background: "#e2e8f0", overflow: "hidden",
  },
  progressFill: (pct) => ({
    height: "100%", width: `${pct}%`,
    background: pct === 100
      ? "linear-gradient(90deg,#10b981,#059669)"
      : "linear-gradient(90deg,#3b82f6,#6366f1)",
    borderRadius: 3, transition: "width 0.3s ease",
  }),

  // Validation banner
  validationBanner: {
    background: "#fef2f2", border: "1.5px solid #fca5a5",
    borderRadius: 12, padding: "14px 18px", marginBottom: 20,
    display: "flex", alignItems: "flex-start", gap: 12,
    boxShadow: "0 2px 8px rgba(239,68,68,0.08)",
  },
  validationBannerIcon: { fontSize: 20, flexShrink: 0, marginTop: 1 },
  validationBannerTitle: { fontSize: 13, fontWeight: 800, color: "#991b1b", marginBottom: 4 },
  validationBannerList: { fontSize: 12, color: "#b91c1c", lineHeight: 1.7, margin: 0, paddingLeft: 16 },

  // Section header
  sectionHeader: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
  },
  sectionBadge: (c) => ({
    background: `linear-gradient(135deg,${c},${c}cc)`,
    color: "#fff", borderRadius: 8,
    padding: "4px 12px", fontSize: 12, fontWeight: 800,
    boxShadow: `0 2px 6px ${c}44`,
  }),
  sectionTitle: { fontSize: 14, fontWeight: 800, color: T.text },

  // Q Cards
  card: (hasError) => ({
    background: T.cardBg, backdropFilter: "blur(8px)",
    border: `1px solid ${hasError ? "#fca5a5" : "rgba(241,245,249,0.8)"}`,
    borderRadius: T.cardRadius, marginBottom: 14, overflow: "hidden",
    boxShadow: hasError ? "0 0 0 3px rgba(239,68,68,0.08)" : T.cardShadow,
    transition: "border-color 0.2s, box-shadow 0.2s",
  }),
  cardHead: (a) => ({
    background: `${a}12`, borderLeft: `4px solid ${a}`,
    padding: "12px 18px", display: "flex", gap: 10, alignItems: "flex-start",
    borderBottom: T.tdBorder,
  }),
  qNum: (a) => ({
    background: `linear-gradient(135deg,${a},${a}cc)`,
    color: "#fff", borderRadius: "50%",
    width: 26, height: 26,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1,
    boxShadow: `0 2px 6px ${a}44`,
  }),
  qText: { fontSize: 13.5, fontWeight: 600, color: T.text, lineHeight: 1.5 },
  qNote: { fontSize: 11.5, color: T.subText, marginTop: 3, lineHeight: 1.5, whiteSpace: "pre-line" },
  requiredBadge: {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 10, fontWeight: 700, color: "#ef4444",
    background: "#fef2f2", border: "1px solid #fecaca",
    borderRadius: 4, padding: "1px 6px", marginTop: 4, letterSpacing: "0.3px",
  },
  errorMsg: {
    fontSize: 11.5, color: "#ef4444", fontWeight: 600,
    marginTop: 6, display: "flex", alignItems: "center", gap: 4,
  },
  body: { padding: "14px 18px" },

  // Sub rows (inline questions)
  subRow: {
    borderTop: T.tdBorder, padding: "12px 18px",
    display: "flex", flexDirection: "column", gap: 10,
  },
  subRowHead: { display: "flex", flexDirection: "column", gap: 3 },
  subQNum: {
    fontSize: 11.5, fontWeight: 800, color: T.mutedText,
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  subQText: { fontSize: 13, fontWeight: 600, color: T.subText, lineHeight: 1.5 },
  subQNote: { fontSize: 11.5, color: T.mutedText, lineHeight: 1.4, fontStyle: "italic" },
  subRadioRow: {
    display: "flex", width: "100%",
    border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden",
  },
  subRadioOpt: (sel, a) => ({
    flex: 1, display: "flex", alignItems: "center", gap: 8,
    padding: "8px 14px",
    background: sel ? `${a}12` : "#f8fafc",
    borderRight: T.tdBorder, cursor: "pointer",
    fontSize: 13, color: sel ? a : T.subText,
    fontWeight: sel ? 700 : 400, transition: "all 0.13s",
  }),
  subRadioOptLast: (sel, a) => ({
    flex: 1, display: "flex", alignItems: "center", gap: 8,
    padding: "8px 14px",
    background: sel ? `${a}12` : "#f8fafc",
    cursor: "pointer", fontSize: 13, color: sel ? a : T.subText,
    fontWeight: sel ? 700 : 400, transition: "all 0.13s",
  }),

  // Radio / checkbox
  radioRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  radioBtn: (sel, a) => ({
    display: "flex", alignItems: "center", gap: 7,
    padding: "7px 14px",
    background: sel ? `${a}12` : "#f8fafc",
    border: `1.5px solid ${sel ? a : "#e2e8f0"}`,
    borderRadius: 8, cursor: "pointer",
    fontSize: 13, color: sel ? a : T.subText,
    fontWeight: sel ? 700 : 400, transition: "all 0.13s",
  }),
  chkGrid: (cols) => ({
    display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 8,
  }),
  chkBtn: (sel, a) => ({
    display: "flex", alignItems: "flex-start", gap: 8,
    padding: "8px 12px",
    background: sel ? `${a}12` : "#f8fafc",
    border: `1.5px solid ${sel ? a : "#e2e8f0"}`,
    borderRadius: 8, cursor: "pointer",
    fontSize: 12.5, color: sel ? a : T.subText,
    fontWeight: sel ? 700 : 400, transition: "all 0.13s", lineHeight: 1.4,
  }),

  // Inputs
  inp: (hasError) => ({
    width: "100%",
    border: `1px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`,
    borderRadius: 8, padding: "8px 12px",
    fontSize: 13, color: T.text,
    background: hasError ? "#fff8f8" : "#fff",
    outline: "none", boxSizing: "border-box", fontFamily: T.font,
    transition: "border-color 0.15s, box-shadow 0.15s",
  }),
  textarea: (hasError) => ({
    width: "100%",
    border: `1px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`,
    borderRadius: 8, padding: "9px 12px",
    fontSize: 13, color: T.text,
    background: hasError ? "#fff8f8" : "#fff",
    outline: "none", boxSizing: "border-box",
    minHeight: 80, resize: "vertical", fontFamily: T.font,
    transition: "border-color 0.15s",
  }),
  label: { fontSize: 12, fontWeight: 600, color: T.subText, marginBottom: 5, display: "block" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },

  // Table
  tableWrap: { overflowX: "auto", marginTop: 10 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12.5 },
  th: {
    background: T.thBg, color: T.thColor, fontWeight: 700,
    padding: "10px 12px", textAlign: "left", borderBottom: T.thBorder,
    fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em",
  },
  td: { padding: "7px 8px", borderBottom: T.tdBorder },
  addBtn: {
    marginTop: 10, background: "transparent",
    border: "1.5px dashed #93c5fd", color: "#3b82f6",
    borderRadius: 8, padding: "6px 14px",
    fontSize: 12, cursor: "pointer", fontWeight: 600, fontFamily: T.font,
    transition: "all 0.15s",
  },
  rth: {
    background: T.thBg, padding: "10px 12px",
    fontWeight: 700, fontSize: 11, color: T.thColor,
    borderBottom: T.thBorder, textAlign: "left",
    textTransform: "uppercase", letterSpacing: "0.04em",
  },
  rtd: { padding: "8px 10px", borderBottom: T.tdBorder, verticalAlign: "middle" },

  alertBox: (c, bg, b) => ({
    fontSize: 12.5, color: c, lineHeight: 1.6, marginBottom: 12,
    background: bg, border: `1px solid ${b}`,
    borderRadius: 8, padding: "10px 14px",
  }),

  // Section wrapper
  section: { marginBottom: 24 },

  // Nav buttons
  btnRow: { display: "flex", justifyContent: "space-between", marginTop: 8 },
  backBtn: {
    background: "#fff", border: "1.5px solid #3b82f6", color: "#3b82f6",
    borderRadius: 9, padding: "10px 24px", fontSize: 13, fontWeight: 700,
    cursor: "pointer", fontFamily: T.font, transition: "all 0.2s",
    boxShadow: "0 1px 4px rgba(37,99,235,0.1)",
  },
  submitBtn: (d) => ({
    background: d ? "#e2e8f0" : "linear-gradient(135deg,#10b981,#059669)",
    color: d ? "#94a3b8" : "#fff",
    border: "none", borderRadius: 10,
    padding: "11px 28px", fontSize: 14, fontWeight: 700,
    cursor: d ? "not-allowed" : "pointer",
    boxShadow: d ? "none" : "0 4px 14px rgba(16,185,129,0.3)",
    fontFamily: T.font, transition: "all 0.2s",
  }),
};

// ─── Sub-components (restyled, logic unchanged) ───────────────────────────────
const Rdo = ({ sel, onChange, label, accent }) => (
  <label style={S.radioBtn(sel, accent)}>
    <input type="radio" checked={sel} onChange={onChange}
      style={{ accentColor: accent, width: 14, height: 14 }} />
    {label}
  </label>
);

const YN = ({ val, setVal, accent = "#3b82f6" }) => (
  <div style={S.radioRow}>
    <Rdo sel={val === "yes"} onChange={() => setVal("yes")} label="Yes" accent={accent} />
    <Rdo sel={val === "no"} onChange={() => setVal("no")} label="No" accent={accent} />
  </div>
);

function InlineSubQ({ num, question, note, accent = "#3b82f6", children, visible = true, hasError = false }) {
  return (
    <div style={{
      ...S.subRow,
      background: visible ? (hasError ? "#fff8f8" : "#fff") : "#f9fafb",
      opacity: visible ? 1 : 0.45,
      pointerEvents: visible ? "auto" : "none",
      transition: "opacity 0.2s, background 0.2s",
      borderLeft: hasError && visible ? "3px solid #fca5a5" : undefined,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={S.subRowHead}>
          <span style={S.subQNum}>{num}</span>
          <span style={{ ...S.subQText, color: visible ? T.subText : T.mutedText }}>{question}</span>
          {note && <span style={S.subQNote}>{note}</span>}
          {hasError && visible && <span style={S.errorMsg}>⚠ This field is required</span>}
        </div>
        {!visible && (
          <span style={{
            flexShrink: 0, fontSize: 10, fontWeight: 700, color: T.mutedText,
            background: "#f3f4f6", border: "1px solid #e5e7eb",
            borderRadius: 5, padding: "2px 7px", letterSpacing: "0.4px",
            marginTop: 2, whiteSpace: "nowrap",
          }}>🔒 Requires "Yes" above</span>
        )}
      </div>
      {children}
    </div>
  );
}

function InlineYN({ val, setVal, accent = "#3b82f6" }) {
  return (
    <div style={S.subRadioRow}>
      <label style={S.subRadioOpt(val === "yes", accent)}>
        <input type="radio" checked={val === "yes"} onChange={() => setVal("yes")}
          style={{ accentColor: accent, width: 14, height: 14 }} />
        a. Yes
      </label>
      <label style={S.subRadioOptLast(val === "no", accent)}>
        <input type="radio" checked={val === "no"} onChange={() => setVal("no")}
          style={{ accentColor: accent, width: 14, height: 14 }} />
        b. No
      </label>
    </div>
  );
}

const SectionHeader = ({ num, title, color = "#3b82f6" }) => (
  <div style={S.sectionHeader}>
    <div style={S.sectionBadge(color)}>{num}</div>
    <div style={S.sectionTitle}>{title}</div>
  </div>
);

const QCard = ({ num, question, note, accent = "#3b82f6", children, hasError = false, fieldRef }) => (
  <div style={S.card(hasError)} ref={fieldRef}>
    <div style={S.cardHead(accent)}>
      <div style={S.qNum(accent)}>{num}</div>
      <div>
        <div style={S.qText}>{question}</div>
        {note && <div style={S.qNote}>{note}</div>}
        {hasError && <div style={S.requiredBadge}>⚠ Required</div>}
      </div>
    </div>
    <div style={S.body}>{children}</div>
  </div>
);

const QCardWithSubs = ({ num, question, note, accent = "#3b82f6", bodyChildren, subChildren, hasError = false, fieldRef }) => (
  <div style={S.card(hasError)} ref={fieldRef}>
    <div style={S.cardHead(accent)}>
      <div style={S.qNum(accent)}>{num}</div>
      <div>
        <div style={S.qText}>{question}</div>
        {note && <div style={S.qNote}>{note}</div>}
        {hasError && <div style={S.requiredBadge}>⚠ Required</div>}
      </div>
    </div>
    <div style={S.body}>{bodyChildren}</div>
    {subChildren}
  </div>
);

// ─── Stage3Form ───────────────────────────────────────────────────────────────
export default function Stage3Form({ onBack, onSubmit, loading, initialData }) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const fieldRefs = useRef({});
  const setRef = (key) => (el) => { if (el) fieldRefs.current[key] = el; };

  // ── ALL STATE UNCHANGED ───────────────────────────────────────────────────
  const [pirRef, setPirRef] = useState(initialData?.pirRef || "");
  const [piiInvRef, setPiiInvRef] = useState(initialData?.piiInvRef || "");
  const [dfdRef, setDfdRef] = useState(initialData?.dfdRef || "");
  const [sdLead, setSdLead] = useState(initialData?.sdLead || "");
  const [ocLead, setOcLead] = useState(initialData?.ocLead || "");
  const [privacyAuditor, setPrivacyAuditor] = useState(initialData?.privacyAuditor || "");
  const [dpo, setDpo] = useState(initialData?.dpo || "");
  const [projectName, setProjectName] = useState(initialData?.projectName || "");
  const [projectTypes, setProjectTypes] = useState(initialData?.projectTypes || []);
  const [projectDesc, setProjectDesc] = useState(initialData?.projectDesc || "");
  const [hosted, setHosted] = useState(initialData?.hosted || "");
  const [periodicReview, setPeriodicReview] = useState(initialData?.periodicReview || "");
  const [lastReviewDate, setLastReviewDate] = useState(initialData?.lastReviewDate || "");
  const [evaluateNecessity, setEvaluateNecessity] = useState(initialData?.evaluateNecessity || "");
  const [dataDeleted, setDataDeleted] = useState(initialData?.dataDeleted || "");
  const [geoReceived, setGeoReceived] = useState(initialData?.geoReceived || "");
  const [geoStored, setGeoStored] = useState(initialData?.geoStored || "");
  const [geoTransferred, setGeoTransferred] = useState(initialData?.geoTransferred || "");
  const [transferOutside, setTransferOutside] = useState(initialData?.transferOutside || "");
  const [notifyTransfer, setNotifyTransfer] = useState(initialData?.notifyTransfer || "");
  const [transferMechanisms, setTransferMechanisms] = useState(initialData?.transferMechanisms || "");
  const [hasThirdParties, setHasThirdParties] = useState(initialData?.hasThirdParties || "");
  const [thirdParties, setThirdParties] = useState(initialData?.thirdParties || [{ name:"", purpose:"" }]);
  const [tpDueDiligence, setTpDueDiligence] = useState(initialData?.tpDueDiligence || "");
  const [tpNotify, setTpNotify] = useState(initialData?.tpNotify || "");
  const [tpDeletion, setTpDeletion] = useState(initialData?.tpDeletion || "");
  const [tpBreachReport, setTpBreachReport] = useState(initialData?.tpBreachReport || "");
  const [contractClauses, setContractClauses] = useState(initialData?.contractClauses || "");
  const [contractReview, setContractReview] = useState(initialData?.contractReview || "");
  const [contractReviewDate, setContractReviewDate] = useState(initialData?.contractReviewDate || "");
  const [hasSubContractors, setHasSubContractors] = useState(initialData?.hasSubContractors || "");
  const [subHowHired, setSubHowHired] = useState(initialData?.subHowHired || "");
  const [subIndividualUndertaking, setSubIndividualUndertaking] = useState(initialData?.subIndividualUndertaking || "");
  const [subVendorUndertaking, setSubVendorUndertaking] = useState(initialData?.subVendorUndertaking || "");
  const [subBreachReport, setSubBreachReport] = useState(initialData?.subBreachReport || "");
  const [rights, setRights] = useState(initialData?.rights || PII_RIGHTS.reduce((a, r) => ({ ...a, [r]:"" }), {}));
  const [rightsNA, setRightsNA] = useState(initialData?.rightsNA || false);
  const [analytics, setAnalytics] = useState(initialData?.analytics || "");
  const [breachNotification, setBreachNotification] = useState(initialData?.breachNotification || "");
  const [notificationTimeline, setNotificationTimeline] = useState(initialData?.notificationTimeline || "Within 72 Hours");

  const toggleProjectType = (v) =>
    setProjectTypes((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);

  // ── ALL VALIDATION LOGIC UNCHANGED ───────────────────────────────────────
  function getErrors() {
    const e = {};
    if (!pirRef.trim()) e.pirRef = true;
    if (!piiInvRef.trim()) e.piiInvRef = true;
    if (!dfdRef.trim()) e.dfdRef = true;
    if (!sdLead.trim()) e.sdLead = true;
    if (!ocLead.trim()) e.ocLead = true;
    if (!privacyAuditor.trim()) e.privacyAuditor = true;
    if (!dpo.trim()) e.dpo = true;
    if (!projectName.trim()) e.projectName = true;
    if (projectTypes.length === 0) e.projectTypes = true;
    if (!projectDesc.trim()) e.projectDesc = true;
    if (!hosted) e.hosted = true;
    if (!periodicReview) e.periodicReview = true;
    if (periodicReview === "yes" && !lastReviewDate.trim()) e.lastReviewDate = true;
    if (!evaluateNecessity) e.evaluateNecessity = true;
    if (!dataDeleted) e.dataDeleted = true;
    if (!geoReceived.trim()) e.geoReceived = true;
    if (!geoStored.trim()) e.geoStored = true;
    if (!geoTransferred.trim()) e.geoTransferred = true;
    if (!transferOutside) e.transferOutside = true;
    if (transferOutside === "yes") {
      if (!notifyTransfer) e.notifyTransfer = true;
      if (!transferMechanisms) e.transferMechanisms = true;
    }
    if (!hasThirdParties) e.hasThirdParties = true;
    if (hasThirdParties === "yes") {
      if (!tpDueDiligence) e.tpDueDiligence = true;
      if (!tpNotify) e.tpNotify = true;
      if (!tpDeletion) e.tpDeletion = true;
      if (!tpBreachReport) e.tpBreachReport = true;
    }
    if (!contractClauses) e.contractClauses = true;
    if (!contractReview) e.contractReview = true;
    if (contractReview === "yes" && !contractReviewDate.trim()) e.contractReviewDate = true;
    if (!hasSubContractors) e.hasSubContractors = true;
    if (hasSubContractors === "yes") {
      if (!subHowHired) e.subHowHired = true;
      if ((subHowHired === "Individually Hired (Independent Contractors)" || subHowHired === "Both") && !subIndividualUndertaking) e.subIndividualUndertaking = true;
      if ((subHowHired === "Hired through Contract with Third party Vendors" || subHowHired === "Both") && !subVendorUndertaking) e.subVendorUndertaking = true;
      if (!subBreachReport) e.subBreachReport = true;
    }
    if (!rightsNA) {
      const unanswered = PII_RIGHTS.filter((r) => !rights[r]);
      if (unanswered.length > 0) e.rights = true;
    }
    if (!analytics) e.analytics = true;
    if (!breachNotification) e.breachNotification = true;
    if (breachNotification === "yes" && !notificationTimeline.trim()) e.notificationTimeline = true;
    return e;
  }

  function getProgress() {
    const allErrors = getErrors();
    const requiredKeys = [
      "pirRef","piiInvRef","dfdRef","sdLead","ocLead","privacyAuditor","dpo",
      "projectName","projectTypes","projectDesc","hosted","periodicReview",
      "evaluateNecessity","dataDeleted","geoReceived","geoStored","geoTransferred",
      "transferOutside","hasThirdParties","contractClauses","contractReview",
      "hasSubContractors","rights","analytics","breachNotification",
    ];
    const answeredRequired = requiredKeys.filter((k) => !allErrors[k]).length;
    return Math.round((answeredRequired / requiredKeys.length) * 100);
  }

  const errors = submitted ? getErrors() : {};
  const errorCount = Object.keys(errors).length;
  const progress = getProgress();

  const ERROR_LABELS = {
    pirRef:"1.1 PIR Reference", piiInvRef:"1.2 PII Inventory Reference", dfdRef:"1.3 DFD Reference",
    sdLead:"2.1 Service Delivery Lead", ocLead:"2.2 Operations Compliance Lead",
    privacyAuditor:"2.3 Privacy Auditor", dpo:"2.4 Data Protection Officer",
    projectName:"3.1 Project Name", projectTypes:"3.2 Project Type",
    projectDesc:"3.3 Project Description", hosted:"3.4 Hosting Location",
    periodicReview:"4.1 Periodic Review", lastReviewDate:"4.1.1 Last Review Date",
    evaluateNecessity:"4.2 Evaluate Necessity", dataDeleted:"5.1 Data Deletion",
    geoReceived:"6.1 Geographic Location (Received)", geoStored:"6.2 Geographic Location (Stored)",
    geoTransferred:"6.3 Geographic Location (Transferred)", transferOutside:"6.4 Transfer Outside Country",
    notifyTransfer:"6.4.1 Notify on Transfer", transferMechanisms:"6.4.2 Transfer Mechanisms",
    hasThirdParties:"7.1 Third Parties", tpDueDiligence:"7.1.2 Third Party Due Diligence",
    tpNotify:"7.1.3 Notify PII Principals (Third Party)", tpDeletion:"7.1.4 Third Party Data Deletion",
    tpBreachReport:"7.1.5 Third Party Breach Reporting", contractClauses:"8.1 Contract Clauses",
    contractReview:"8.2 Contract Periodic Review", contractReviewDate:"8.2.1 Last Contract Review Date",
    hasSubContractors:"9.1 Sub-Contractors", subHowHired:"9.1.1 Sub-Contractor Hiring Method",
    subIndividualUndertaking:"9.1.1.1 Individual Sub-Contractor Undertaking",
    subVendorUndertaking:"9.1.1.2 Vendor Sub-Contractor Undertaking",
    subBreachReport:"9.1.2 Sub-Contractor Breach Reporting", rights:"10.1 PII Principal Rights",
    analytics:"11.1 Data Analytics", breachNotification:"12.1 Breach Notification",
    notificationTimeline:"12.1.1 Notification Timeline",
  };

  // ── SUBMIT LOGIC UNCHANGED ────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitted(true);
    const errs = getErrors();
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      const el = fieldRefs.current[firstKey];
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); }
      else { window.scrollTo({ top: 0, behavior: "smooth" }); }
      return;
    }
    const payload = {
      pirRef, piiInvRef, dfdRef, sdLead, ocLead, privacyAuditor, dpo,
      projectName, projectTypes, projectDesc, hosted, periodicReview, lastReviewDate,
      evaluateNecessity, dataDeleted, geoReceived, geoStored, geoTransferred,
      transferOutside, notifyTransfer, transferMechanisms, hasThirdParties, thirdParties,
      tpDueDiligence, tpNotify, tpDeletion, tpBreachReport, contractClauses, contractReview,
      contractReviewDate, hasSubContractors, subHowHired, subIndividualUndertaking,
      subVendorUndertaking, subBreachReport, rights, rightsNA, analytics,
      breachNotification, notificationTimeline,
    };
    const id = await onSubmit(payload);
    if (id) { router.push(`/dpia/compliance/${id}`); }
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
        <div style={S.bannerIcon}>✅</div>
        <div>
          <div style={S.bannerEye}>Stage 3 of 3</div>
          <div style={S.bannerH}>Data Protection Impact Assessment (DPIA)</div>
          <div style={S.bannerSub}>Data Protection Compliance Questionnaire — complete all sections and submit.</div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={S.progressWrap}>
        <div style={S.progressLabel}>
          <span>Completion Progress</span>
          <span style={{ color: progress === 100 ? "#059669" : T.subText, fontWeight: 700 }}>{progress}%</span>
        </div>
        <div style={S.progressBar}><div style={S.progressFill(progress)} /></div>
      </div>

      {/* ── Validation banner ── */}
      {submitted && errorCount > 0 && (
        <div style={S.validationBanner}>
          <span style={S.validationBannerIcon}>🚫</span>
          <div>
            <div style={S.validationBannerTitle}>
              {errorCount} required field{errorCount > 1 ? "s" : ""} need{errorCount === 1 ? "s" : ""} to be completed before submitting
            </div>
            <ul style={S.validationBannerList}>
              {Object.keys(errors).map((key) => (
                <li key={key} style={{ cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => { const el = fieldRefs.current[key]; if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); }}>
                  {ERROR_LABELS[key] || key}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── §1 PIR Info ── */}
      <div style={S.section}>
        <SectionHeader num="1" title="Privacy Impact Record (PIR) Information" color="#3b82f6" />
        <QCard num="1.1" question="Privacy Impact Record (PIR) Reference" accent="#3b82f6" hasError={!!errors.pirRef} fieldRef={setRef("pirRef")}>
          <input style={S.inp(!!errors.pirRef)} value={pirRef} onChange={(e) => setPirRef(e.target.value)} placeholder="Enter PIR reference number…"
            onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px #3b82f620"; }}
            onBlur={(e) => { e.target.style.borderColor = errors.pirRef ? "#fca5a5" : "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
          {errors.pirRef && <div style={S.errorMsg}>⚠ This field is required</div>}
        </QCard>
        <QCard num="1.2" question="PII Inventory Reference" accent="#3b82f6" hasError={!!errors.piiInvRef} fieldRef={setRef("piiInvRef")}>
          <div style={S.grid2}>
            <div>
              <label style={S.label}>Reference</label>
              <input style={S.inp(!!errors.piiInvRef)} value={piiInvRef} onChange={(e) => setPiiInvRef(e.target.value)} placeholder="PII Inventory reference…"
                onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px #3b82f620"; }}
                onBlur={(e) => { e.target.style.borderColor = errors.piiInvRef ? "#fca5a5" : "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
            </div>
            <div>
              <label style={S.label}>Personal Data Elements</label>
              <input style={S.inp(false)} placeholder="Summary of data elements…"
                onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px #3b82f620"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
            </div>
          </div>
          {errors.piiInvRef && <div style={S.errorMsg}>⚠ PII Inventory Reference is required</div>}
        </QCard>
        <QCard num="1.3" question="Data Flow Diagram (DFD) Reference" accent="#3b82f6" hasError={!!errors.dfdRef} fieldRef={setRef("dfdRef")}>
          <input style={S.inp(!!errors.dfdRef)} value={dfdRef} onChange={(e) => setDfdRef(e.target.value)} placeholder="Enter DFD reference…"
            onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px #3b82f620"; }}
            onBlur={(e) => { e.target.style.borderColor = errors.dfdRef ? "#fca5a5" : "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
          {errors.dfdRef && <div style={S.errorMsg}>⚠ This field is required</div>}
        </QCard>
      </div>

      {/* ── §2 Stakeholders ── */}
      <div style={S.section}>
        <SectionHeader num="2" title="Project Stakeholder Information" color="#0ea5e9" />
        {[
          ["2.1","Service Delivery Lead",sdLead,setSdLead,"sdLead"],
          ["2.2","Operations Compliance Lead",ocLead,setOcLead,"ocLead"],
          ["2.3","Privacy Auditor",privacyAuditor,setPrivacyAuditor,"privacyAuditor"],
          ["2.4","Data Protection Officer",dpo,setDpo,"dpo"],
        ].map(([num, lbl, val, setter, key]) => (
          <QCard key={num} num={num} question={lbl} accent="#0ea5e9" hasError={!!errors[key]} fieldRef={setRef(key)}>
            <input style={S.inp(!!errors[key])} value={val} onChange={(e) => setter(e.target.value)} placeholder="Enter name…"
              onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; e.target.style.boxShadow = "0 0 0 3px #0ea5e920"; }}
              onBlur={(e) => { e.target.style.borderColor = errors[key] ? "#fca5a5" : "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
            {errors[key] && <div style={S.errorMsg}>⚠ This field is required</div>}
          </QCard>
        ))}
      </div>

      {/* ── §3 General Info ── */}
      <div style={S.section}>
        <SectionHeader num="3" title="General Information & Background" color="#8b5cf6" />
        <QCard num="3.1" question="Project Name" accent="#8b5cf6" hasError={!!errors.projectName} fieldRef={setRef("projectName")}>
          <input style={S.inp(!!errors.projectName)} value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Enter project name…"
            onFocus={(e) => { e.target.style.borderColor = "#8b5cf6"; e.target.style.boxShadow = "0 0 0 3px #8b5cf620"; }}
            onBlur={(e) => { e.target.style.borderColor = errors.projectName ? "#fca5a5" : "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
          {errors.projectName && <div style={S.errorMsg}>⚠ This field is required</div>}
        </QCard>
        <QCard num="3.2" question="Which of the following best describes this Project? (Select all that apply)" accent="#8b5cf6" hasError={!!errors.projectTypes} fieldRef={setRef("projectTypes")}>
          <div style={S.chkGrid(3)}>
            {PROJECT_TYPES.map((pt) => (
              <label key={pt} style={S.chkBtn(projectTypes.includes(pt), "#8b5cf6")}>
                <input type="checkbox" checked={projectTypes.includes(pt)} onChange={() => toggleProjectType(pt)}
                  style={{ accentColor: "#8b5cf6", width: 14, height: 14, marginTop: 2, flexShrink: 0 }} />
                <span>{pt}</span>
              </label>
            ))}
          </div>
          {errors.projectTypes && <div style={S.errorMsg}>⚠ Please select at least one project type</div>}
        </QCard>
        <QCard num="3.3" question="Provide a detailed description of the Project and the processing activities involved, including objectives." accent="#8b5cf6" hasError={!!errors.projectDesc} fieldRef={setRef("projectDesc")}>
          <textarea style={S.textarea(!!errors.projectDesc)} value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)}
            placeholder="Describe the project nature, processing activities, and objectives…"
            onFocus={(e) => { e.target.style.borderColor = "#8b5cf6"; e.target.style.boxShadow = "0 0 0 3px #8b5cf620"; }}
            onBlur={(e) => { e.target.style.borderColor = errors.projectDesc ? "#fca5a5" : "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
          {errors.projectDesc && <div style={S.errorMsg}>⚠ This field is required</div>}
        </QCard>
        <QCard num="3.4" question="Where is the application (database) hosted?" accent="#8b5cf6" hasError={!!errors.hosted} fieldRef={setRef("hosted")}>
          <div style={S.radioRow}>
            {["On Premise","Cloud Platform","Both"].map((v) => (
              <Rdo key={v} sel={hosted === v} onChange={() => setHosted(v)} label={v} accent="#8b5cf6" />
            ))}
          </div>
          {errors.hosted && <div style={{ ...S.errorMsg, marginTop: 8 }}>⚠ Please select a hosting option</div>}
        </QCard>
      </div>

      {/* ── §4 Data Use ── */}
      <div style={S.section}>
        <SectionHeader num="4" title="Data Use" color="#f59e0b" />
        <QCardWithSubs num="4.1"
          question="Is a periodic review performed at least annually by Compliance Team / Designated Individuals to ensure Personal Data is processed in line with the notice?"
          accent="#f59e0b" hasError={!!errors.periodicReview} fieldRef={setRef("periodicReview")}
          bodyChildren={<>
            <YN val={periodicReview} setVal={setPeriodicReview} accent="#f59e0b" />
            {errors.periodicReview && <div style={{ ...S.errorMsg, marginTop: 8 }}>⚠ Please select Yes or No</div>}
          </>}
          subChildren={
            <InlineSubQ num="4.1.1" question="Date of last periodic review (DD/MM/YYYY)" accent="#f59e0b"
              visible={periodicReview === "yes"} hasError={!!errors.lastReviewDate}>
              <div ref={setRef("lastReviewDate")}>
                <input style={{ ...S.inp(!!errors.lastReviewDate), maxWidth: 200 }} value={lastReviewDate}
                  onChange={(e) => setLastReviewDate(e.target.value)} placeholder="DD/MM/YYYY" />
              </div>
            </InlineSubQ>
          }
        />
        <QCard num="4.2" question="Does the Compliance Team evaluate the necessity of the Personal Data collected from PII Principals?" accent="#f59e0b" hasError={!!errors.evaluateNecessity} fieldRef={setRef("evaluateNecessity")}>
          <YN val={evaluateNecessity} setVal={setEvaluateNecessity} accent="#f59e0b" />
          {errors.evaluateNecessity && <div style={{ ...S.errorMsg, marginTop: 8 }}>⚠ Please select Yes or No</div>}
        </QCard>
      </div>

      {/* ── §5 Retention ── */}
      <div style={S.section}>
        <SectionHeader num="5" title="Data Retention and Disposal" color="#10b981" />
        <QCard num="5.1" question="If Personal Data is stored in the organization's environment, is it being deleted at the end of the processing requirement?" accent="#10b981" hasError={!!errors.dataDeleted} fieldRef={setRef("dataDeleted")}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Personal Data is being deleted from the organization's environment/ systems",
              "Despite Regulatory Obligations or retention period identified, Personal Data not deleted",
            ].map((v) => <Rdo key={v} sel={dataDeleted === v} onChange={() => setDataDeleted(v)} label={v} accent="#10b981" />)}
          </div>
          {errors.dataDeleted && <div style={{ ...S.errorMsg, marginTop: 8 }}>⚠ Please select an option</div>}
        </QCard>
      </div>

      {/* ── §6 Data Transfer ── */}
      <div style={S.section}>
        <SectionHeader num="6" title="Data Transfer" color="#6366f1" />
        <QCard num="6.1" question="From which geographic location(s) is the Personal Data received from PII Principals?" accent="#6366f1" hasError={!!errors.geoReceived} fieldRef={setRef("geoReceived")}>
          <input style={S.inp(!!errors.geoReceived)} value={geoReceived} onChange={(e) => setGeoReceived(e.target.value)} placeholder="e.g. India, United States…"
            onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px #6366f120"; }}
            onBlur={(e) => { e.target.style.borderColor = errors.geoReceived ? "#fca5a5" : "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
          {errors.geoReceived && <div style={S.errorMsg}>⚠ This field is required</div>}
        </QCard>
        <QCard num="6.2" question="In which geographic location(s) is the Personal Data stored in the organization's environment?" accent="#6366f1" hasError={!!errors.geoStored} fieldRef={setRef("geoStored")}>
          <input style={S.inp(!!errors.geoStored)} value={geoStored} onChange={(e) => setGeoStored(e.target.value)} placeholder="e.g. India…"
            onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px #6366f120"; }}
            onBlur={(e) => { e.target.style.borderColor = errors.geoStored ? "#fca5a5" : "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
          {errors.geoStored && <div style={S.errorMsg}>⚠ This field is required</div>}
        </QCard>
        <QCard num="6.3" question="To which geographic location(s) is the Personal Data transferred? (Internal teams / Third parties)" accent="#6366f1" hasError={!!errors.geoTransferred} fieldRef={setRef("geoTransferred")}>
          <input style={S.inp(!!errors.geoTransferred)} value={geoTransferred} onChange={(e) => setGeoTransferred(e.target.value)} placeholder="e.g. United States, Europe…"
            onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px #6366f120"; }}
            onBlur={(e) => { e.target.style.borderColor = errors.geoTransferred ? "#fca5a5" : "#e2e8f0"; e.target.style.boxShadow = "none"; }} />
          {errors.geoTransferred && <div style={S.errorMsg}>⚠ This field is required</div>}
        </QCard>
        <QCardWithSubs num="6.4" question="Is Personal Data stored in the organization's environment transferred outside the originating country?" accent="#6366f1" hasError={!!errors.transferOutside} fieldRef={setRef("transferOutside")}
          bodyChildren={<>
            <YN val={transferOutside} setVal={setTransferOutside} accent="#6366f1" />
            {errors.transferOutside && <div style={{ ...S.errorMsg, marginTop: 8 }}>⚠ Please select Yes or No</div>}
          </>}
          subChildren={<>
            <InlineSubQ num="6.4.1" question="Do you notify the user (PII Principals) and obtain written authorization prior to transferring Personal Data obtained from the user outside the originating country?" note="Note: Prior approval may be part of explicit consent." accent="#6366f1" visible={transferOutside === "yes"} hasError={!!errors.notifyTransfer}>
              <div ref={setRef("notifyTransfer")}><InlineYN val={notifyTransfer} setVal={setNotifyTransfer} accent="#6366f1" /></div>
            </InlineSubQ>
            <InlineSubQ num="6.4.2" question="Are appropriate data transfer mechanisms in place to safeguard the transmission of Personal Data obtained from the user (PII Principals) outside the originating country?" note="(e.g. Standard Contractual Clauses, Binding Corporate Rules, Approvals from regulators, EU-US Privacy Shield, etc.)" accent="#6366f1" visible={transferOutside === "yes"} hasError={!!errors.transferMechanisms}>
              <div ref={setRef("transferMechanisms")}><InlineYN val={transferMechanisms} setVal={setTransferMechanisms} accent="#6366f1" /></div>
            </InlineSubQ>
          </>}
        />
      </div>

      {/* ── §7 Third Parties ── */}
      <div style={S.section}>
        <SectionHeader num="7" title="Third Party Agencies (Excluding Sub-Contractors)" color="#ec4899" />
        <QCardWithSubs num="7.1" question="Do you contract third parties for processing of Personal Data in order to provide services?" note="Note: Please contact Legal in case of any queries regarding contractual clauses." accent="#ec4899" hasError={!!errors.hasThirdParties} fieldRef={setRef("hasThirdParties")}
          bodyChildren={<>
            <YN val={hasThirdParties} setVal={setHasThirdParties} accent="#ec4899" />
            {errors.hasThirdParties && <div style={{ ...S.errorMsg, marginTop: 8 }}>⚠ Please select Yes or No</div>}
          </>}
          subChildren={<>
            <InlineSubQ num="7.1.1" question="Details of third party organizations having access to Personal Data" accent="#ec4899" visible={hasThirdParties === "yes"}>
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr><th style={S.th}>Third Party</th><th style={S.th}>Purpose / Justification</th><th style={{ ...S.th, width: 40 }}></th></tr>
                  </thead>
                  <tbody>
                    {thirdParties.map((tp, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "rgba(248,250,252,0.6)" }}>
                        <td style={S.td}><input style={S.inp(false)} value={tp.name} onChange={(e) => { const n = [...thirdParties]; n[i] = { ...n[i], name: e.target.value }; setThirdParties(n); }} placeholder="Third party name…" /></td>
                        <td style={S.td}><input style={S.inp(false)} value={tp.purpose} onChange={(e) => { const n = [...thirdParties]; n[i] = { ...n[i], purpose: e.target.value }; setThirdParties(n); }} placeholder="Purpose…" /></td>
                        <td style={S.td}><button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }} onClick={() => setThirdParties(thirdParties.filter((_, idx) => idx !== i))}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button style={S.addBtn} onClick={() => setThirdParties([...thirdParties, { name:"", purpose:"" }])}>+ Add Third Party</button>
            </InlineSubQ>
            <InlineSubQ num="7.1.2" question="Is due diligence / screening performed on the third parties to assess their privacy and security posture?" accent="#ec4899" visible={hasThirdParties === "yes"} hasError={!!errors.tpDueDiligence}>
              <div ref={setRef("tpDueDiligence")}><InlineYN val={tpDueDiligence} setVal={setTpDueDiligence} accent="#ec4899" /></div>
            </InlineSubQ>
            <InlineSubQ num="7.1.3" question="Do you notify the user (PII Principals) and obtain written authorization prior to contracting a third party?" accent="#ec4899" visible={hasThirdParties === "yes"} hasError={!!errors.tpNotify}>
              <div ref={setRef("tpNotify")}><InlineYN val={tpNotify} setVal={setTpNotify} accent="#ec4899" /></div>
            </InlineSubQ>
            <InlineSubQ num="7.1.4" question="Is Personal Data being / will be deleted or returned to the organization's after end of processing?" accent="#ec4899" visible={hasThirdParties === "yes"} hasError={!!errors.tpDeletion}>
              <div ref={setRef("tpDeletion")} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["All Personal Data deleted by the third parties including any backups.","Personal Data is being / will be returned to the organization and deleted from the third parties environment","No Contractual obligation imposed by the organization on third parties to delete Personal Data, hence not deleted.","Not Applicable since no Personal Data is backed up / retained by the Third parties."].map((v) => (
                  <Rdo key={v} sel={tpDeletion === v} onChange={() => setTpDeletion(v)} label={v} accent="#ec4899" />
                ))}
              </div>
            </InlineSubQ>
            <InlineSubQ num="7.1.5" question="Does the contract include obligations on reporting any data breach to the organization?" accent="#ec4899" visible={hasThirdParties === "yes"} hasError={!!errors.tpBreachReport}>
              <div ref={setRef("tpBreachReport")}><InlineYN val={tpBreachReport} setVal={setTpBreachReport} accent="#ec4899" /></div>
            </InlineSubQ>
          </>}
        />
      </div>

      {/* ── §8 Contractual ── */}
      <div style={S.section}>
        <SectionHeader num="8" title="Contractual Obligations" color="#f97316" />
        <QCard num="8.1"
          question="Does your contract with third parties capture clauses as required by relevant privacy law?"
          note={["Clauses may include:","1. Limiting processing per documented instructions","2. Imposing confidentiality restrictions on people handling Personal Data","3. Requiring the third party vendor to implement appropriate technical and organizational safeguards","4. Restrictions on third party vendors for contracting other sub-processors","5. Ensuring sub-processors (if engaged) follow the same obligations","6. Assistance in processing PII Principals' rights requests","7. Deleting or returning Personal Data at the end of service or upon request","8. Preparing data flow diagrams and PII inventories","9. Right to audit clauses","10. Notifying data breaches to the Organization","11. Assistance in performing DPIAs","12. Data transfer restrictions and related compliance requirements"].join("\n")}
          accent="#f97316" hasError={!!errors.contractClauses} fieldRef={setRef("contractClauses")}>
          <YN val={contractClauses} setVal={setContractClauses} accent="#f97316" />
          {errors.contractClauses && <div style={{ ...S.errorMsg, marginTop: 8 }}>⚠ Please select Yes or No</div>}
        </QCard>
        <QCardWithSubs num="8.2" question="Is a periodic review performed at least annually to ensure Personal Data is processed by contracted third parties as contractually agreed?" accent="#f97316" hasError={!!errors.contractReview} fieldRef={setRef("contractReview")}
          bodyChildren={<>
            <YN val={contractReview} setVal={setContractReview} accent="#f97316" />
            {errors.contractReview && <div style={{ ...S.errorMsg, marginTop: 8 }}>⚠ Please select Yes or No</div>}
          </>}
          subChildren={
            <InlineSubQ num="8.2.1" question="Date of last periodic review (DD/MM/YYYY)" accent="#f97316" visible={contractReview === "yes"} hasError={!!errors.contractReviewDate}>
              <div ref={setRef("contractReviewDate")}>
                <input style={{ ...S.inp(!!errors.contractReviewDate), maxWidth: 200 }} value={contractReviewDate} onChange={(e) => setContractReviewDate(e.target.value)} placeholder="DD/MM/YYYY" />
              </div>
            </InlineSubQ>
          }
        />
      </div>

      {/* ── §9 Sub-Contractors ── */}
      <div style={S.section}>
        <SectionHeader num="9" title="Sub Contractors" color="#14b8a6" />
        <div style={S.alertBox("#065f46","#f0fdf9","#a7f3d0")}>
          Subcontracting refers to the practice of hiring an outside individual to perform specific parts of a business contract or project.
        </div>
        <QCardWithSubs num="9.1" question="Do you hire Sub Contractors for processing of Personal Data in order to provide services?" accent="#14b8a6" hasError={!!errors.hasSubContractors} fieldRef={setRef("hasSubContractors")}
          bodyChildren={<>
            <YN val={hasSubContractors} setVal={setHasSubContractors} accent="#14b8a6" />
            {errors.hasSubContractors && <div style={{ ...S.errorMsg, marginTop: 8 }}>⚠ Please select Yes or No</div>}
          </>}
          subChildren={<>
            <InlineSubQ num="9.1.1" question="How are the Sub Contractors hired?" accent="#14b8a6" visible={hasSubContractors === "yes"} hasError={!!errors.subHowHired}>
              <div ref={setRef("subHowHired")} style={S.radioRow}>
                {["Individually Hired (Independent Contractors)","Hired through Contract with Third party Vendors","Both"].map((v) => (
                  <Rdo key={v} sel={subHowHired === v} onChange={() => setSubHowHired(v)} label={v} accent="#14b8a6" />
                ))}
              </div>
            </InlineSubQ>
            {(subHowHired === "Individually Hired (Independent Contractors)" || subHowHired === "Both") && (
              <InlineSubQ num="9.1.1.1" visible={hasSubContractors === "yes"} question="Are appropriate undertakings pertaining to Data Privacy and Protection obtained (e.g. NDA) prior to onboarding individually hired Sub Contractors?" accent="#14b8a6" hasError={!!errors.subIndividualUndertaking}>
                <div ref={setRef("subIndividualUndertaking")} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Yes","No","Undertaking obtained but no clauses pertaining to Data Privacy and Protection."].map((v) => (
                    <Rdo key={v} sel={subIndividualUndertaking === v} onChange={() => setSubIndividualUndertaking(v)} label={v} accent="#14b8a6" />
                  ))}
                </div>
              </InlineSubQ>
            )}
            {(subHowHired === "Hired through Contract with Third party Vendors" || subHowHired === "Both") && (
              <InlineSubQ num="9.1.1.2" visible={hasSubContractors === "yes"} question="Are appropriate undertakings pertaining to Data Privacy and Protection obtained prior to onboarding Sub Contractors hired through third party vendors?" accent="#14b8a6" hasError={!!errors.subVendorUndertaking}>
                <div ref={setRef("subVendorUndertaking")} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Yes","No","Undertaking obtained from Third Party for the Sub Contractors but no clauses pertaining to Data Privacy and Protection enforced by the organization on the third party vendors through the Contract."].map((v) => (
                    <Rdo key={v} sel={subVendorUndertaking === v} onChange={() => setSubVendorUndertaking(v)} label={v} accent="#14b8a6" />
                  ))}
                </div>
              </InlineSubQ>
            )}
            <InlineSubQ num="9.1.2" question="Does the contract / agreement include obligations on reporting any data breach to the organization?" accent="#14b8a6" visible={hasSubContractors === "yes"} hasError={!!errors.subBreachReport}>
              <div ref={setRef("subBreachReport")}><InlineYN val={subBreachReport} setVal={setSubBreachReport} accent="#14b8a6" /></div>
            </InlineSubQ>
          </>}
        />
      </div>

      {/* ── §10 PII Rights ── */}
      <div style={S.section}>
        <SectionHeader num="10" title="PII Principals Rights" color="#a855f7" />
        <QCard num="10.1" question="In case PII is stored within the organization's environment, which of the following capabilities is available to process PII Principals' requests?" accent="#a855f7" hasError={!!errors.rights} fieldRef={setRef("rights")}>
          {errors.rights && (
            <div style={{ ...S.alertBox("#991b1b","#fef2f2","#fecaca"), marginBottom: 10 }}>
              ⚠ Please answer Yes or No for all processes, or mark as Not Applicable
            </div>
          )}
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.rth}>Process</th>
                  <th style={{ ...S.rth, width: 60, textAlign: "center" }}>Yes</th>
                  <th style={{ ...S.rth, width: 60, textAlign: "center" }}>No</th>
                </tr>
              </thead>
              <tbody>
                {PII_RIGHTS.map((right, i) => (
                  <tr key={i} style={{ background: !rightsNA && errors.rights && !rights[right] ? "#fff5f5" : i % 2 === 0 ? "#fff" : "rgba(248,250,252,0.5)" }}>
                    <td style={S.rtd}>{right}</td>
                    <td style={{ ...S.rtd, textAlign: "center" }}>
                      <input type="radio" checked={rights[right] === "yes"} onChange={() => setRights((p) => ({ ...p, [right]:"yes" }))} style={{ accentColor: "#a855f7" }} disabled={rightsNA} />
                    </td>
                    <td style={{ ...S.rtd, textAlign: "center" }}>
                      <input type="radio" checked={rights[right] === "no"} onChange={() => setRights((p) => ({ ...p, [right]:"no" }))} style={{ accentColor: "#a855f7" }} disabled={rightsNA} />
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "#fdf4ff" }}>
                  <td style={{ ...S.rtd, fontStyle: "italic", color: T.subText }}>Not Applicable — no Organizational Systems / Databases hosting Client's Personal Data are used.</td>
                  <td colSpan={2} style={{ ...S.rtd, textAlign: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
                      <input type="checkbox" checked={rightsNA} onChange={(e) => setRightsNA(e.target.checked)} style={{ accentColor: "#a855f7" }} />
                      Not Applicable
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </QCard>
      </div>

      {/* ── §11 Analytics ── */}
      <div style={S.section}>
        <SectionHeader num="11" title="Data Analytics" color="#84cc16" />
        <QCard num="11.1" question="Do you carry out data analytics, automated profiling or machine learning based processing using Personal Data as part of your Project?" accent="#84cc16" hasError={!!errors.analytics} fieldRef={setRef("analytics")}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Yes (As per the contract with the Client)","Yes (Not defined in the contract with the Client)","No"].map((v) => (
              <Rdo key={v} sel={analytics === v} onChange={() => setAnalytics(v)} label={v} accent="#84cc16" />
            ))}
          </div>
          {errors.analytics && <div style={{ ...S.errorMsg, marginTop: 8 }}>⚠ Please select an option</div>}
        </QCard>
      </div>

      {/* ── §12 Data Breach ── */}
      <div style={S.section}>
        <SectionHeader num="12" title="Data Breach and Notification" color="#ef4444" />
        <QCardWithSubs num="12.1" question="Is there any commitment as per the notice to the user (PII Principals) on Data Breach notification timelines?" accent="#ef4444" hasError={!!errors.breachNotification} fieldRef={setRef("breachNotification")}
          bodyChildren={<>
            <YN val={breachNotification} setVal={setBreachNotification} accent="#ef4444" />
            {errors.breachNotification && <div style={{ ...S.errorMsg, marginTop: 8 }}>⚠ Please select Yes or No</div>}
          </>}
          subChildren={
            <InlineSubQ num="12.1.1" question="Please mention the notification timeline identified by the user (PII Principals)" accent="#ef4444" visible={breachNotification === "yes"} hasError={!!errors.notificationTimeline}>
              <div ref={setRef("notificationTimeline")}>
                <input style={{ ...S.inp(!!errors.notificationTimeline), maxWidth: 240 }} value={notificationTimeline} onChange={(e) => setNotificationTimeline(e.target.value)} placeholder="e.g. Within 72 Hours" />
              </div>
            </InlineSubQ>
          }
        />
      </div>

      {/* ── Bottom validation summary ── */}
      {submitted && errorCount > 0 && (
        <div style={{ ...S.validationBanner, marginBottom: 16 }}>
          <span style={S.validationBannerIcon}>🚫</span>
          <div>
            <div style={S.validationBannerTitle}>
              Please complete all {errorCount} required field{errorCount > 1 ? "s" : ""} before submitting.
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <div style={S.btnRow}>
        <button style={S.backBtn} onClick={onBack} disabled={loading}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#eff6ff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}>
          ← Back to Stage 2
        </button>
        <button style={S.submitBtn(loading)} onClick={handleSubmit} disabled={loading}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(16,185,129,0.35)"; }}}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 14px rgba(16,185,129,0.3)"; }}>
          {loading ? "Submitting…" : "✓ Submit Assessment"}
        </button>
      </div>
    </div>
  );
}
