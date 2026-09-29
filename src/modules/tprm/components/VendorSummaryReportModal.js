// // // src/modules/tprm/components/VendorSummaryReportModal.js
// // //
// // // Vendor Summary Report — Admin and Vendor views
// // //
// // // What it shows:
// // //   - Per-questionnaire metadata (title, status, due date, dates)
// // //   - Response breakdown: answered / yes / no / partial / accepted / rejected
// // //   - Anomalies: every question the admin marked REJECTED + severity + admin remark
// // //   - Tasks: one mitigation task per anomaly derived from the admin remark
// // //   - PDF download (jsPDF + autoTable, matches AuditReportsModal style)
// // //
// // // What it does NOT show: any scores, risk ratings, or averageScore
// // //
// // // Props:
// // //   user         — current session user { _id, name, organization }
// // //   organization — org ID string
// // //   onClose      — close handler
// // //   vendorMode   — (bool, default false) true when opened from VendorSection
// // //
// // // Wiring in TPRMSection.js:
// // //   import VendorSummaryReportModal from "../components/VendorSummaryReportModal";
// // //   { modal === "vendor-report" && <VendorSummaryReportModal user={user} organization={org} onClose={() => setModal(null)} /> }
// // //
// // // Add to adminActions array in TPRMSection.js:
// // //   { key: "vendor-report", Icon: Shield, title: "Vendor Reports", subtitle: "Anomalies & mitigation tasks", color: "from-indigo-400 to-indigo-600", onClick: () => setModal("vendor-report") }

// // import React, { useState, useEffect, useCallback } from "react";
// // import { motion } from "framer-motion";
// // import {
// //   X, FileText, Download, ArrowLeft,
// //   AlertTriangle, CheckSquare, Shield, ChevronRight,
// // } from "lucide-react";
// // import jsPDF from "jspdf";
// // import autoTable from "jspdf-autotable";
// // import tprmService from "../services/tprmService";

// // // ─── constants ────────────────────────────────────────────────────────────────

// // const NAVBAR_HEIGHT = 72;
// // const MODAL_GAP     = 32;
// // const API_BASE      = "https://api.calvant.com/tprm-service/api/tprm";
// // const AUTH          = "Basic " + btoa("username:password");

// // const STATUS_CONFIG = {
// //   DRAFT:        { label: "Draft",        cls: "bg-slate-100 text-slate-600" },
// //   SENT:         { label: "Sent",         cls: "bg-blue-100 text-blue-700" },
// //   SUBMITTED:    { label: "Submitted",    cls: "bg-amber-100 text-amber-700" },
// //   UNDER_REVIEW: { label: "Under Review", cls: "bg-violet-100 text-violet-700" },
// //   RESUBMITTED:  { label: "Resubmitted",  cls: "bg-orange-100 text-orange-700" },
// //   APPROVED:     { label: "Approved",     cls: "bg-emerald-100 text-emerald-700" },
// //   REJECTED:     { label: "Rejected",     cls: "bg-red-100 text-red-700" },
// // };

// // // Statuses vendor is allowed to see
// // const VENDOR_VISIBLE = ["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED", "APPROVED", "REJECTED"];

// // // ─── helpers ──────────────────────────────────────────────────────────────────

// // const fmt = (d) => {
// //   if (!d) return "—";
// //   const dt = new Date(d);
// //   if (isNaN(dt)) return "—";
// //   return `${String(dt.getDate()).padStart(2,"0")}-${String(dt.getMonth()+1).padStart(2,"0")}-${dt.getFullYear()}`;
// // };

// // // Derive anomaly severity from vendor's answer
// // const severity = (availability) => {
// //   if (availability === "No")      return "HIGH";
// //   if (availability === "Partial") return "MEDIUM";
// //   return "LOW";
// // };

// // // Build mitigation action from admin remark + severity
// // const mitigationAction = (remark, sev) => {
// //   if (remark && remark !== "No remark provided") return "Mitigate: " + remark;
// //   if (sev === "HIGH")   return "Implement the missing control immediately and provide evidence.";
// //   if (sev === "MEDIUM") return "Strengthen the partial control and document the improvement.";
// //   return "Review the implementation and address the admin's concerns.";
// // };

// // // Build a per-questionnaire report object from raw data
// // const buildReport = (q, responses) => {
// //   const answered  = responses.filter(r => r.availability).length;
// //   const accepted  = responses.filter(r => r.questionStatus === "ACCEPTED").length;
// //   const rejected  = responses.filter(r => r.questionStatus === "REJECTED").length;
// //   const yesCount  = responses.filter(r => r.availability === "Yes").length;
// //   const noCount   = responses.filter(r => r.availability === "No").length;
// //   const partial   = responses.filter(r => r.availability === "Partial").length;

// //   const anomalies = responses
// //     .filter(r => r.questionStatus === "REJECTED")
// //     .map(r => ({
// //       questionId:   r.questionId,
// //       questionText: r.questionText,
// //       topicNo:      r.topicNo,
// //       topicName:    r.topicName,
// //       category:     r.category,
// //       availability: r.availability,
// //       adminRemark:  r.questionRemark || "No remark provided",
// //       severity:     severity(r.availability),
// //     }));

// //   const tasks = anomalies.map(a => ({
// //     taskId:       "TASK-" + a.questionId,
// //     questionText: a.questionText,
// //     topicName:    a.topicName,
// //     category:     a.category,
// //     severity:     a.severity,
// //     action:       mitigationAction(a.adminRemark, a.severity),
// //     adminRemark:  a.adminRemark,
// //     status:       "OPEN",
// //   }));

// //   return {
// //     metadata: {
// //       id:           q.id,
// //       title:        q.title,
// //       status:       q.status,
// //       dueDate:      q.dueDate,
// //       sentAt:       q.sentAt,
// //       submittedAt:  q.submittedAt,
// //       reviewedAt:   q.reviewedAt,
// //       reviewedBy:   q.reviewedBy,
// //       adminComment: q.adminComment,
// //     },
// //     summary:    { answered, accepted, rejected, yesCount, noCount, partialCount: partial },
// //     anomalies,
// //     tasks,
// //   };
// // };

// // // ─── severity badge ───────────────────────────────────────────────────────────

// // const SEV = {
// //   HIGH:   { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
// //   MEDIUM: { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
// //   LOW:    { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
// // };

// // const SeverityBadge = ({ sev }) => {
// //   const s = SEV[sev] || SEV.LOW;
// //   return (
// //     <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
// //       background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
// //       {sev}
// //     </span>
// //   );
// // };

// // const StatusDot = ({ status }) => {
// //   const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
// //   return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>;
// // };

// // // ─── PDF generator ────────────────────────────────────────────────────────────

// // function generatePDF(vendorName, orgName, qReports) {
// //   const doc  = new jsPDF();
// //   const W    = doc.internal.pageSize.getWidth();
// //   const H    = doc.internal.pageSize.getHeight();
// //   const ML   = 14;
// //   const MR   = 14;

// //   // Footer on every page
// //   const drawFooter = (p, total) => {
// //     doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.3);
// //     doc.line(ML, H - 12, W - MR, H - 12);
// //     doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(148, 163, 184);
// //     const left = `Generated for ${orgName} by CalVant`;
// //     doc.text(left, ML, H - 7);
// //     const right = `Page ${p} of ${total}`;
// //     doc.text(right, W - MR - doc.getTextWidth(right), H - 7);
// //   };

// //   // ── Cover ────────────────────────────────────────────────
// //   doc.setFillColor(37, 99, 235);
// //   doc.rect(0, 0, W, 1.5, "F");
// //   doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(30, 41, 59);
// //   doc.text("Vendor Summary Report", ML, 16);
// //   doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(100, 116, 139);
// //   doc.text(`${vendorName}   ·   Generated ${fmt(new Date())}`, ML, 23);
// //   doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.4);
// //   doc.line(ML, 27, W - MR, 27);

// //   // Summary stats box
// //   const totalAnomalies = qReports.reduce((s, q) => s + q.anomalies.length, 0);
// //   const totalTasks     = qReports.reduce((s, q) => s + q.tasks.length, 0);

// //   let y = 35;
// //   doc.setFillColor(241, 245, 249); doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.3);
// //   doc.roundedRect(ML, y, W - ML - MR, 14, 3, 3, "FD");
// //   const stats = [
// //     { label: "Questionnaires", value: String(qReports.length), color: [71, 85, 105] },
// //     { label: "Anomalies",      value: String(totalAnomalies),  color: [220, 38, 38]  },
// //     { label: "Tasks",          value: String(totalTasks),      color: [37, 99, 235]  },
// //   ];
// //   const cw = (W - ML - MR) / 3;
// //   stats.forEach(({ label, value, color }, i) => {
// //     const cx = ML + i * cw + cw / 2;
// //     doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...color);
// //     doc.text(value, cx, y + 7, { align: "center" });
// //     doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
// //     doc.text(label, cx, y + 12, { align: "center" });
// //   });
// //   y += 22;

// //   // ── Per-questionnaire sections ──────────────────────────
// //   qReports.forEach((qr, qi) => {
// //     const { metadata: m, summary: s, anomalies, tasks } = qr;

// //     if (y + 14 > H - 20) { doc.addPage(); y = 16; }

// //     // Section header bar
// //     doc.setFillColor(37, 99, 235);
// //     doc.roundedRect(ML, y, W - ML - MR, 9, 2, 2, "F");
// //     doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(255, 255, 255);
// //     doc.text(`${qi + 1}. ${m.title}   [${m.status}]`, ML + 4, y + 6.2);
// //     y += 13;

// //     // Meta row
// //     doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(71, 85, 105);
// //     doc.text(
// //       ["Due: " + (m.dueDate || "—"), "Submitted: " + fmt(m.submittedAt),
// //        "Reviewed: " + fmt(m.reviewedAt), "Anomalies: " + anomalies.length].join("   ·   "),
// //       ML, y
// //     );
// //     y += 5;

// //     if (m.adminComment) {
// //       doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
// //       const lines = doc.splitTextToSize("Admin comment: " + m.adminComment, W - ML - MR);
// //       doc.text(lines, ML, y);
// //       y += lines.length * 4.5;
// //     }
// //     y += 3;

// //     // Response breakdown table
// //     if (y + 10 > H - 20) { doc.addPage(); y = 16; }
// //     doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(71, 85, 105);
// //     doc.text("Response Breakdown", ML, y); y += 4;

// //     autoTable(doc, {
// //       startY: y,
// //       head: [["Answered", "Yes", "No", "Partial", "Accepted", "Rejected"]],
// //       body: [[s.answered, s.yesCount, s.noCount, s.partialCount, s.accepted, s.rejected]],
// //       headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 8, fontStyle: "bold" },
// //       bodyStyles: { fontSize: 9, halign: "center" },
// //       margin: { left: ML, right: MR, bottom: 18 },
// //       didDrawPage: () => {},
// //     });
// //     y = doc.lastAutoTable.finalY + 6;

// //     // Anomalies table
// //     if (anomalies.length > 0) {
// //       if (y + 14 > H - 20) { doc.addPage(); y = 16; }
// //       doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(153, 27, 27);
// //       doc.text(`Anomalies (${anomalies.length})`, ML, y); y += 4;

// //       autoTable(doc, {
// //         startY: y,
// //         head: [["#", "Section", "Question", "Response", "Severity", "Admin Remark"]],
// //         body: anomalies.map((a, i) => [
// //           i + 1, `${a.topicNo}. ${a.topicName}`, a.questionText,
// //           a.availability || "—", a.severity, a.adminRemark,
// //         ]),
// //         headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 8, fontStyle: "bold" },
// //         bodyStyles: { fontSize: 7.5, valign: "top", overflow: "linebreak", cellPadding: 2.5 },
// //         alternateRowStyles: { fillColor: [255, 245, 245] },
// //         columnStyles: {
// //           0: { cellWidth: 7, halign: "center" }, 1: { cellWidth: 28 },
// //           2: { cellWidth: 50 }, 3: { cellWidth: 15, halign: "center" },
// //           4: { cellWidth: 16, halign: "center" }, 5: { cellWidth: "auto" },
// //         },
// //         rowPageBreak: "avoid", showHead: "everyPage",
// //         margin: { left: ML, right: MR, bottom: 18 },
// //         didParseCell: (d) => {
// //           if (d.section === "body" && d.column.index === 4) {
// //             if (d.cell.raw === "HIGH")   { d.cell.styles.textColor = [153,27,27]; d.cell.styles.fontStyle = "bold"; }
// //             if (d.cell.raw === "MEDIUM") { d.cell.styles.textColor = [154,52,18]; d.cell.styles.fontStyle = "bold"; }
// //             if (d.cell.raw === "LOW")    { d.cell.styles.textColor = [146,64,14]; d.cell.styles.fontStyle = "bold"; }
// //           }
// //         },
// //         didDrawPage: () => {},
// //       });
// //       y = doc.lastAutoTable.finalY + 6;
// //     }

// //     // Mitigation tasks table
// //     if (tasks.length > 0) {
// //       if (y + 14 > H - 20) { doc.addPage(); y = 16; }
// //       doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(29, 78, 216);
// //       doc.text(`Mitigation Tasks (${tasks.length})`, ML, y); y += 4;

// //       autoTable(doc, {
// //         startY: y,
// //         head: [["#", "Section", "Question", "Severity", "Mitigation Action", "Status"]],
// //         body: tasks.map((t, i) => [
// //           i + 1, t.topicName, t.questionText, t.severity, t.action, t.status,
// //         ]),
// //         headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 8, fontStyle: "bold" },
// //         bodyStyles: { fontSize: 7.5, valign: "top", overflow: "linebreak", cellPadding: 2.5 },
// //         alternateRowStyles: { fillColor: [239, 246, 255] },
// //         columnStyles: {
// //           0: { cellWidth: 7, halign: "center" }, 1: { cellWidth: 25 },
// //           2: { cellWidth: 40 }, 3: { cellWidth: 16, halign: "center" },
// //           4: { cellWidth: "auto" }, 5: { cellWidth: 14, halign: "center" },
// //         },
// //         rowPageBreak: "avoid", showHead: "everyPage",
// //         margin: { left: ML, right: MR, bottom: 18 },
// //         didDrawPage: () => {},
// //       });
// //       y = doc.lastAutoTable.finalY + 10;
// //     } else {
// //       doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(22, 101, 52);
// //       doc.text("✓ No anomalies — no mitigation tasks required.", ML, y);
// //       y += 10;
// //     }

// //     // Divider
// //     if (qi < qReports.length - 1) {
// //       doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
// //       doc.line(ML, y, W - MR, y);
// //       y += 6;
// //     }
// //   });

// //   // Add footer to all pages
// //   const totalPages = doc.internal.getNumberOfPages();
// //   for (let p = 1; p <= totalPages; p++) {
// //     doc.setPage(p);
// //     drawFooter(p, totalPages);
// //   }

// //   doc.save(`Vendor_Report_${vendorName}_${fmt(new Date())}.pdf`);
// // }

// // // ─── main component ───────────────────────────────────────────────────────────

// // const VendorSummaryReportModal = ({ user, organization, onClose, vendorMode = false }) => {
// //   const isVendor = vendorMode;
// //   const vendorId = user?._id || user?.id;

// //   // Views: "list" (admin picks a vendor) → "detail" (report) → "tasks" (task list)
// //   const [view,           setView]           = useState(isVendor ? "loading" : "list");
// //   const [vendors,        setVendors]        = useState([]);
// //   const [loadingVendors, setLoadingVendors] = useState(false);
// //   const [selectedVendor, setSelectedVendor] = useState(null); // { id, vendorName }
// //   const [qReports,       setQReports]       = useState([]);   // built from API
// //   const [vendorName,     setVendorName]     = useState("");
// //   const [loading,        setLoading]        = useState(false);
// //   const [taskFilter,     setTaskFilter]     = useState("ALL");

// //   // ── Fetch vendor list (admin only) ────────────────────────
// //   const loadVendors = useCallback(async () => {
// //     setLoadingVendors(true);
// //     try {
// //       const res = await fetch(`${API_BASE}/vendors?organization=${organization}`, { headers: { Authorization: AUTH } });
// //       if (res.ok) setVendors(await res.json());
// //     } catch (_) {}
// //     finally { setLoadingVendors(false); }
// //   }, [organization]);

// //   // ── Fetch questionnaires + responses for a vendor ─────────
// //   const loadReport = useCallback(async (vId, vName) => {
// //     setLoading(true);
// //     setQReports([]);
// //     setVendorName(vName || "");
// //     try {
// //       // 1. Get questionnaires for this vendor
// //       const res = await fetch(`${API_BASE}/questionnaires/vendor/${vId}`, { headers: { Authorization: AUTH } });
// //       if (!res.ok) return;
// //       let questionnaires = await res.json();

// //       // Filter by role: vendor only sees submitted+
// //       if (isVendor) {
// //         questionnaires = questionnaires.filter(q => VENDOR_VISIBLE.includes(q.status));
// //       }

// //       // 2. For each questionnaire, fetch its responses
// //       const built = await Promise.all(
// //         questionnaires.map(async (q) => {
// //           try {
// //             const rRes = await fetch(`${API_BASE}/questionnaires/${q.id}/responses`, { headers: { Authorization: AUTH } });
// //             const responses = rRes.ok ? await rRes.json() : [];
// //             return buildReport(q, responses);
// //           } catch (_) {
// //             return buildReport(q, []);
// //           }
// //         })
// //       );

// //       setQReports(built);
// //       setView("detail");
// //     } catch (_) {}
// //     finally { setLoading(false); }
// //   }, [isVendor]);

// //   // ── Init ──────────────────────────────────────────────────
// //   useEffect(() => {
// //     if (isVendor) {
// //       // Vendor sees their own report directly
// //       loadReport(vendorId, user?.name || "My Report");
// //     } else {
// //       loadVendors();
// //     }
// //   }, [isVendor, vendorId, user, loadVendors, loadReport]);

// //   const openVendorReport = (v) => {
// //     setSelectedVendor(v);
// //     loadReport(v.id, v.vendorName);
// //   };

// //   const goBack = () => {
// //     if (view === "tasks") { setView("detail"); return; }
// //     setView("list");
// //     setSelectedVendor(null);
// //     setQReports([]);
// //   };

// //   // ── Derived ───────────────────────────────────────────────
// //   const allTasks      = qReports.flatMap(q => q.tasks);
// //   const allAnomalies  = qReports.flatMap(q => q.anomalies);
// //   const filteredTasks = taskFilter === "ALL" ? allTasks : allTasks.filter(t => t.severity === taskFilter);

// //   const displayName  = isVendor ? (user?.name || "My Report") : (selectedVendor?.vendorName || "");
// //   const totalAnomalies = allAnomalies.length;
// //   const totalTasks     = allTasks.length;

// //   // ─────────────────────────────────────────────────────────
// //   // RENDER
// //   // ─────────────────────────────────────────────────────────
// //   return (
// //     <div
// //       className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
// //       style={{ paddingTop: NAVBAR_HEIGHT + MODAL_GAP, paddingBottom: MODAL_GAP }}
// //     >
// //       <motion.div
// //         className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto flex flex-col"
// //         style={{ maxHeight: `calc(100vh - ${NAVBAR_HEIGHT + MODAL_GAP * 2}px)` }}
// //         initial={{ opacity: 0, y: -12 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ duration: 0.2, ease: "easeOut" }}
// //       >
// //         {/* ── Header ── */}
// //         <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
// //           <div className="flex items-center gap-3">
// //             {(view === "detail" && !isVendor) || view === "tasks" ? (
// //               <button onClick={goBack}
// //                 className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors mr-1">
// //                 <ArrowLeft size={15} className="text-slate-600" />
// //               </button>
// //             ) : null}

// //             <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
// //               style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
// //               <Shield size={18} color="#fff" />
// //             </div>

// //             <div>
// //               <h2 className="text-lg font-semibold text-slate-800" style={{ margin: 0 }}>
// //                 {view === "list"   ? "Vendor Summary Reports" :
// //                  view === "tasks"  ? `Tasks — ${displayName}` :
// //                  displayName || "Report"}
// //               </h2>
// //               <p className="text-xs text-slate-500" style={{ margin: 0 }}>
// //                 {view === "list"   ? `${vendors.length} vendor(s)` :
// //                  view === "tasks"  ? `${filteredTasks.length} task(s)` :
// //                  view === "detail" && !loading ? `${totalAnomalies} anomaly(s) · ${totalTasks} task(s)` :
// //                  "Loading…"}
// //               </p>
// //             </div>
// //           </div>

// //           <div className="flex items-center gap-2">
// //             {view === "detail" && !loading && qReports.length > 0 && (
// //               <>
// //                 <button onClick={() => setView("tasks")}
// //                   style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px",
// //                     borderRadius:12, fontSize:12, fontWeight:600, cursor:"pointer",
// //                     background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe" }}>
// //                   <CheckSquare size={12} /> Tasks ({totalTasks})
// //                 </button>
// //                 <button
// //                   onClick={() => generatePDF(displayName, organization, qReports)}
// //                   className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
// //                   style={{ border:"none", cursor:"pointer" }}>
// //                   <Download size={13} /> Download PDF
// //                 </button>
// //               </>
// //             )}
// //             {view === "tasks" && (
// //               <button
// //                 onClick={() => generatePDF(displayName, organization, qReports)}
// //                 className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
// //                 style={{ border:"none", cursor:"pointer" }}>
// //                 <Download size={13} /> Download PDF
// //               </button>
// //             )}
// //             <button onClick={onClose}
// //               className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
// //               style={{ border:"none", cursor:"pointer", background:"transparent" }}>
// //               <X size={18} color="#64748b" />
// //             </button>
// //           </div>
// //         </div>

// //         {/* ── Body ── */}
// //         <div className="flex-1 overflow-y-auto px-7 py-5">

// //           {/* ── LIST VIEW (admin picks vendor) ── */}
// //           {view === "list" && (
// //             <div className="space-y-2.5">
// //               {loadingVendors && (
// //                 <div className="flex items-center justify-center h-48">
// //                   <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
// //                 </div>
// //               )}
// //               {!loadingVendors && vendors.length === 0 && (
// //                 <div className="text-center py-14">
// //                   <Shield size={36} color="#cbd5e1" style={{ margin:"0 auto 12px" }} />
// //                   <p className="text-slate-500 font-medium">No active vendors</p>
// //                 </div>
// //               )}
// //               {vendors.map(v => (
// //                 <motion.div key={v.id}
// //                   className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
// //                   initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
// //                   onClick={() => openVendorReport(v)}>
// //                   <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
// //                     style={{ background:"linear-gradient(135deg,#6366f1,#4f46e5)" }}>
// //                     {v.vendorName?.[0]?.toUpperCase() || "V"}
// //                   </div>
// //                   <div className="flex-1 min-w-0">
// //                     <p className="text-sm font-semibold text-slate-800">{v.vendorName}</p>
// //                     <p className="text-xs text-slate-400">{v.organization}</p>
// //                   </div>
// //                   <ChevronRight size={16} color="#94a3b8" />
// //                 </motion.div>
// //               ))}
// //             </div>
// //           )}

// //           {/* ── LOADING ── */}
// //           {(view === "loading" || loading) && (
// //             <div className="flex items-center justify-center h-56">
// //               <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
// //             </div>
// //           )}

// //           {/* ── DETAIL VIEW ── */}
// //           {view === "detail" && !loading && (
// //             <div className="space-y-6">
// //               {/* Banner */}
// //               <div className="rounded-xl p-5 flex items-center justify-between gap-6 flex-wrap"
// //                 style={{ background:"linear-gradient(135deg,#eff6ff,#f0f9ff)", border:"1px solid #bfdbfe" }}>
// //                 <div>
// //                   <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
// //                     {isVendor ? "My Summary" : `Vendor: ${displayName}`}
// //                   </p>
// //                   <p className="text-xs text-slate-400">
// //                     {qReports.length} questionnaire(s) · generated {fmt(new Date())}
// //                   </p>
// //                 </div>
// //                 <div className="flex gap-6">
// //                   <div className="text-center">
// //                     <p className="text-2xl font-black text-red-600">{totalAnomalies}</p>
// //                     <p className="text-xs text-slate-400">Anomalies</p>
// //                   </div>
// //                   <div className="text-center">
// //                     <p className="text-2xl font-black text-blue-600">{totalTasks}</p>
// //                     <p className="text-xs text-slate-400">Tasks</p>
// //                   </div>
// //                 </div>
// //               </div>

// //               {qReports.length === 0 && (
// //                 <div className="text-center py-10">
// //                   <FileText size={32} color="#cbd5e1" style={{ margin:"0 auto 12px" }} />
// //                   <p className="text-slate-500 font-medium">No submitted questionnaires yet</p>
// //                 </div>
// //               )}

// //               {qReports.map((qr, i) => {
// //                 const { metadata: m, summary: s, anomalies, tasks } = qr;
// //                 return (
// //                   <motion.div key={m.id || i}
// //                     className="border border-slate-100 rounded-xl overflow-hidden shadow-sm"
// //                     initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
// //                     transition={{ delay: i * 0.05 }}>

// //                     {/* Card header */}
// //                     <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
// //                       <div className="flex items-center gap-2.5">
// //                         <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
// //                           style={{ background:"linear-gradient(135deg,#6366f1,#4f46e5)" }}>{i + 1}</div>
// //                         <p className="text-sm font-semibold text-slate-800">{m.title}</p>
// //                         <StatusDot status={m.status} />
// //                       </div>
// //                       <span className="text-xs text-slate-400">Due {m.dueDate || "—"}</span>
// //                     </div>

// //                     {/* Response counts */}
// //                     <div className="grid grid-cols-6 divide-x divide-slate-100 border-b border-slate-100">
// //                       {[
// //                         { label:"Answered", value: s.answered,     color:"#64748b" },
// //                         { label:"Yes",      value: s.yesCount,     color:"#059669" },
// //                         { label:"No",       value: s.noCount,      color:"#dc2626" },
// //                         { label:"Partial",  value: s.partialCount, color:"#d97706" },
// //                         { label:"Accepted", value: s.accepted,     color:"#2563eb" },
// //                         { label:"Anomalies",value: anomalies.length, color:"#dc2626" },
// //                       ].map(({ label, value, color }) => (
// //                         <div key={label} className="text-center py-3 px-2">
// //                           <p className="text-lg font-black" style={{ color }}>{value}</p>
// //                           <p className="text-xs text-slate-400">{label}</p>
// //                         </div>
// //                       ))}
// //                     </div>

// //                     {/* Admin comment */}
// //                     {m.adminComment && (
// //                       <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-800">
// //                         <span className="font-semibold">Admin comment: </span>{m.adminComment}
// //                       </div>
// //                     )}

// //                     {/* Anomalies */}
// //                     {anomalies.length > 0 && (
// //                       <div className="px-5 py-3">
// //                         <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
// //                           <AlertTriangle size={11} /> Anomalies ({anomalies.length})
// //                         </p>
// //                         <div className="space-y-2">
// //                           {anomalies.map((a, ai) => (
// //                             <div key={ai} className="rounded-xl p-3"
// //                               style={{ background:"#fff5f5", border:"1px solid #fecaca", borderLeft:"3px solid #ef4444" }}>
// //                               <div className="flex items-start justify-between gap-3 mb-1">
// //                                 <p className="text-xs font-semibold text-slate-800 flex-1">{a.questionText}</p>
// //                                 <SeverityBadge sev={a.severity} />
// //                               </div>
// //                               <div className="flex gap-3 text-xs text-slate-500 flex-wrap">
// //                                 <span className="font-mono text-indigo-600">{a.topicNo}. {a.topicName}</span>
// //                                 <span>Response: <strong>{a.availability || "—"}</strong></span>
// //                               </div>
// //                               {a.adminRemark && a.adminRemark !== "No remark provided" && (
// //                                 <p className="text-xs text-slate-600 mt-1.5 italic">Admin: "{a.adminRemark}"</p>
// //                               )}
// //                             </div>
// //                           ))}
// //                         </div>
// //                       </div>
// //                     )}

// //                     {/* Tasks preview (first 2) */}
// //                     {tasks.length > 0 && (
// //                       <div className="px-5 pb-3">
// //                         <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
// //                           <CheckSquare size={11} /> Mitigation Tasks ({tasks.length})
// //                         </p>
// //                         <div className="space-y-1.5">
// //                           {tasks.slice(0, 2).map((t, ti) => (
// //                             <div key={ti} className="rounded-xl px-3 py-2.5 flex items-start gap-2.5"
// //                               style={{ background:"#eff6ff", border:"1px solid #bfdbfe" }}>
// //                               <SeverityBadge sev={t.severity} />
// //                               <p className="text-xs text-blue-800 flex-1">{t.action}</p>
// //                               <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:10,
// //                                 background:"#dcfce7", color:"#166534" }}>{t.status}</span>
// //                             </div>
// //                           ))}
// //                           {tasks.length > 2 && (
// //                             <p className="text-xs text-blue-500 text-center mt-1">
// //                               +{tasks.length - 2} more — click Tasks to view all
// //                             </p>
// //                           )}
// //                         </div>
// //                       </div>
// //                     )}

// //                     {/* No anomalies */}
// //                     {anomalies.length === 0 && (
// //                       <div className="px-5 py-3 text-xs text-emerald-700 flex items-center gap-2">
// //                         <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center font-bold">✓</span>
// //                         No anomalies — all questions accepted or not yet reviewed.
// //                       </div>
// //                     )}
// //                   </motion.div>
// //                 );
// //               })}
// //             </div>
// //           )}

// //           {/* ── TASKS VIEW ── */}
// //           {view === "tasks" && (
// //             <div className="space-y-4">
// //               {/* Filter */}
// //               <div className="flex gap-1.5 flex-wrap items-center">
// //                 <span className="text-xs text-slate-500 mr-1">Severity:</span>
// //                 {["ALL", "HIGH", "MEDIUM", "LOW"].map(f => (
// //                   <button key={f} onClick={() => setTaskFilter(f)}
// //                     style={{ padding:"4px 12px", borderRadius:8, fontSize:12, fontWeight:600,
// //                       cursor:"pointer", border:"none",
// //                       background: taskFilter === f ? "#4f46e5" : "#f1f5f9",
// //                       color:      taskFilter === f ? "#fff"    : "#475569" }}>
// //                     {f}
// //                     {f !== "ALL" && (
// //                       <span style={{ marginLeft:4, opacity:0.7 }}>
// //                         ({allTasks.filter(t => t.severity === f).length})
// //                       </span>
// //                     )}
// //                   </button>
// //                 ))}
// //               </div>

// //               {filteredTasks.length === 0 && (
// //                 <div className="text-center py-12">
// //                   <CheckSquare size={32} color="#cbd5e1" style={{ margin:"0 auto 10px" }} />
// //                   <p className="text-slate-500 font-medium">No tasks for this filter</p>
// //                 </div>
// //               )}

// //               {filteredTasks.map((t, i) => (
// //                 <motion.div key={i} className="rounded-xl overflow-hidden"
// //                   style={{ border:"1px solid #bfdbfe", borderLeft:"4px solid #3b82f6" }}
// //                   initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
// //                   transition={{ delay: i * 0.03 }}>

// //                   <div className="px-4 py-3" style={{ background:"#eff6ff" }}>
// //                     <div className="flex items-center justify-between gap-3 mb-1.5">
// //                       <div className="flex items-center gap-2">
// //                         <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
// //                           {t.taskId}
// //                         </span>
// //                         <SeverityBadge sev={t.severity} />
// //                       </div>
// //                       <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:10,
// //                         background:"#fef9c3", color:"#854d0e" }}>{t.status}</span>
// //                     </div>
// //                     <p className="text-sm font-semibold text-slate-800 mb-0.5">{t.questionText}</p>
// //                     <p className="text-xs text-slate-500">Section: {t.topicName} · {t.category || "—"}</p>
// //                   </div>

// //                   <div className="px-4 py-3 border-t border-blue-100">
// //                     <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
// //                       Mitigation Action
// //                     </p>
// //                     <p className="text-sm text-slate-700">{t.action}</p>
// //                     {t.adminRemark && t.adminRemark !== "No remark provided" && (
// //                       <p className="text-xs text-slate-500 mt-1.5 italic">Admin remark: "{t.adminRemark}"</p>
// //                     )}
// //                   </div>
// //                 </motion.div>
// //               ))}
// //             </div>
// //           )}
// //         </div>

// //         {/* ── Footer ── */}
// //         <div className="flex-shrink-0 border-t border-slate-100" style={{ padding:"12px 28px 24px" }}>
// //           <button onClick={onClose}
// //             className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-semibold text-slate-600"
// //             style={{ padding:"11px 0", border:"none", cursor:"pointer" }}>
// //             Close
// //           </button>
// //         </div>
// //       </motion.div>
// //     </div>
// //   );
// // };

// // export default VendorSummaryReportModal;

// // src/modules/tprm/components/VendorSummaryReportModal.js
// //
// // Vendor Summary Report — Admin view
// //
// // HOW IT WORKS:
// //   1. Calls tprmService.getQuestionnaires(org) — same call TPRMReportModal uses
// //   2. Groups questionnaires by vendorId to build the vendor list (no separate /vendors endpoint needed)
// //   3. On vendor click → loads responses for each of their questionnaires via tprmService.getResponses(id)
// //   4. Builds anomalies from questionStatus === "REJECTED" responses
// //   5. Builds mitigation tasks (one per anomaly) from the admin's questionRemark
// //
// // Anomaly logic (based on vendor's answer):
// //   availability === "No"      → HIGH severity
// //   availability === "Partial" → MEDIUM severity  (treated same as "No" for anomaly)
// //   availability === "Yes"     but REJECTED → LOW severity (admin found an issue despite yes)
// //
// // Props:
// //   user         — session user { _id, name, organization }
// //   organization — org ID string
// //   onClose      — close handler

// import React, { useState, useEffect, useCallback } from "react";
// import { motion } from "framer-motion";
// import {
//   X, FileText, Download, ArrowLeft,
//   AlertTriangle, CheckSquare, Shield, ChevronRight,
// } from "lucide-react";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import tprmService from "../services/tprmService";

// /* ─── layout constants (match other modals) ──────────────────────────────── */
// const NAVBAR_HEIGHT = 72;
// const MODAL_GAP     = 32;

// /* ─── status display config ──────────────────────────────────────────────── */
// const STATUS_CONFIG = {
//   DRAFT:        { label: "Draft",        cls: "bg-slate-100 text-slate-600" },
//   SENT:         { label: "Sent",         cls: "bg-blue-100 text-blue-700" },
//   SUBMITTED:    { label: "Submitted",    cls: "bg-amber-100 text-amber-700" },
//   UNDER_REVIEW: { label: "Under Review", cls: "bg-violet-100 text-violet-700" },
//   RESUBMITTED:  { label: "Resubmitted",  cls: "bg-orange-100 text-orange-700" },
//   APPROVED:     { label: "Approved",     cls: "bg-emerald-100 text-emerald-700" },
//   REJECTED:     { label: "Rejected",     cls: "bg-red-100 text-red-700" },
// };

// // Only show questionnaires that have been at least submitted
// const REPORTABLE_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED", "APPROVED", "REJECTED"];

// /* ─── helpers ────────────────────────────────────────────────────────────── */
// const fmt = (d) => {
//   if (!d) return "—";
//   const dt = new Date(d);
//   if (isNaN(dt)) return "—";
//   return `${String(dt.getDate()).padStart(2,"0")}-${String(dt.getMonth()+1).padStart(2,"0")}-${dt.getFullYear()}`;
// };

// // Severity based on vendor's answer + the fact admin rejected it
// const getSeverity = (availability) => {
//   if (availability === "No")      return "HIGH";
//   if (availability === "Partial") return "MEDIUM";
//   return "LOW"; // answered "Yes" but admin still rejected → LOW
// };

// const getMitigationAction = (remark, sev) => {
//   if (remark && remark.trim()) return remark.trim();
//   if (sev === "HIGH")   return "Implement the missing control immediately and provide documented evidence.";
//   if (sev === "MEDIUM") return "Strengthen the partial control and document the improvement plan.";
//   return "Review the implementation and address the admin's concerns with supporting evidence.";
// };

// // Build a structured report object from one questionnaire + its responses
// const buildQReport = (q, responses) => {
//   const answered     = responses.filter(r => r.availability).length;
//   const accepted     = responses.filter(r => r.questionStatus === "ACCEPTED").length;
//   const rejected     = responses.filter(r => r.questionStatus === "REJECTED").length;
//   const yesCount     = responses.filter(r => r.availability === "Yes").length;
//   const noCount      = responses.filter(r => r.availability === "No").length;
//   const partialCount = responses.filter(r => r.availability === "Partial").length;

//   // Anomalies = every REJECTED question
//   const anomalies = responses
//     .filter(r => r.questionStatus === "REJECTED")
//     .map(r => {
//       const sev = getSeverity(r.availability);
//       return {
//         questionId:   r.questionId,
//         questionText: r.questionText,
//         topicNo:      r.topicNo,
//         topicName:    r.topicName,
//         category:     r.category,
//         availability: r.availability,
//         description:  r.descriptionOfPractice,
//         adminRemark:  r.questionRemark || "",
//         severity:     sev,
//       };
//     });

//   // One mitigation task per anomaly
//   const tasks = anomalies.map((a, idx) => ({
//     taskId:       `TASK-${String(idx + 1).padStart(3, "0")}`,
//     questionText: a.questionText,
//     topicName:    a.topicName,
//     category:     a.category,
//     severity:     a.severity,
//     action:       getMitigationAction(a.adminRemark, a.severity),
//     adminRemark:  a.adminRemark,
//     status:       "OPEN",
//   }));

//   return {
//     meta: {
//       id:           q.id,
//       title:        q.title,
//       status:       q.status,
//       dueDate:      q.dueDate,
//       submittedAt:  q.submittedAt,
//       reviewedAt:   q.reviewedAt,
//       reviewedBy:   q.reviewedBy,
//       adminComment: q.adminComment,
//     },
//     summary: { answered, accepted, rejected, yesCount, noCount, partialCount, total: responses.length },
//     anomalies,
//     tasks,
//   };
// };

// /* ─── severity badge ─────────────────────────────────────────────────────── */
// const SEV_STYLE = {
//   HIGH:   { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
//   MEDIUM: { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
//   LOW:    { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
// };

// const SeverityBadge = ({ sev }) => {
//   const s = SEV_STYLE[sev] || SEV_STYLE.LOW;
//   return (
//     <span style={{
//       fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
//       background: s.bg, color: s.color, border: `1px solid ${s.border}`,
//       whiteSpace: "nowrap",
//     }}>
//       {sev}
//     </span>
//   );
// };

// const StatusBadge = ({ status }) => {
//   const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
//   return (
//     <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
//       {cfg.label}
//     </span>
//   );
// };

// /* ─── PDF generator ──────────────────────────────────────────────────────── */
// function generatePDF(vendorName, orgName, qReports) {
//   const doc = new jsPDF();
//   const W = doc.internal.pageSize.getWidth();
//   const H = doc.internal.pageSize.getHeight();
//   const ML = 14, MR = 14;

//   const drawFooter = (p, total) => {
//     doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.3);
//     doc.line(ML, H - 12, W - MR, H - 12);
//     doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(148, 163, 184);
//     doc.text(`Generated for ${orgName} by CalVant`, ML, H - 7);
//     const right = `Page ${p} of ${total}`;
//     doc.text(right, W - MR - doc.getTextWidth(right), H - 7);
//   };

//   // Cover
//   doc.setFillColor(37, 99, 235);
//   doc.rect(0, 0, W, 1.5, "F");
//   doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(30, 41, 59);
//   doc.text("Vendor Summary Report", ML, 16);
//   doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(100, 116, 139);
//   doc.text(`${vendorName}   ·   Generated ${fmt(new Date())}`, ML, 23);
//   doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.4);
//   doc.line(ML, 27, W - MR, 27);

//   const totalAnomalies = qReports.reduce((s, q) => s + q.anomalies.length, 0);
//   const totalTasks     = qReports.reduce((s, q) => s + q.tasks.length, 0);

//   let y = 35;
//   doc.setFillColor(241, 245, 249); doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.3);
//   doc.roundedRect(ML, y, W - ML - MR, 14, 3, 3, "FD");
//   const cw = (W - ML - MR) / 3;
//   [
//     { label: "Questionnaires", value: String(qReports.length), color: [71, 85, 105] },
//     { label: "Anomalies",      value: String(totalAnomalies),  color: [220, 38, 38] },
//     { label: "Tasks",          value: String(totalTasks),      color: [37, 99, 235] },
//   ].forEach(({ label, value, color }, i) => {
//     const cx = ML + i * cw + cw / 2;
//     doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...color);
//     doc.text(value, cx, y + 7, { align: "center" });
//     doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 116, 139);
//     doc.text(label, cx, y + 12, { align: "center" });
//   });
//   y += 22;

//   qReports.forEach((qr, qi) => {
//     const { meta: m, summary: s, anomalies, tasks } = qr;

//     if (y + 14 > H - 20) { doc.addPage(); y = 16; }

//     // Section header
//     doc.setFillColor(37, 99, 235);
//     doc.roundedRect(ML, y, W - ML - MR, 9, 2, 2, "F");
//     doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(255, 255, 255);
//     doc.text(`${qi + 1}. ${m.title}   [${m.status}]`, ML + 4, y + 6.2);
//     y += 13;

//     doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(71, 85, 105);
//     doc.text(
//       [`Due: ${m.dueDate || "—"}`, `Submitted: ${fmt(m.submittedAt)}`,
//        `Reviewed: ${fmt(m.reviewedAt)}`, `Anomalies: ${anomalies.length}`].join("   ·   "),
//       ML, y
//     );
//     y += 5;

//     if (m.adminComment) {
//       doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
//       const lines = doc.splitTextToSize(`Admin comment: ${m.adminComment}`, W - ML - MR);
//       doc.text(lines, ML, y);
//       y += lines.length * 4.5;
//     }
//     y += 3;

//     // Response breakdown
//     if (y + 10 > H - 20) { doc.addPage(); y = 16; }
//     doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(71, 85, 105);
//     doc.text("Response Breakdown", ML, y); y += 4;
//     autoTable(doc, {
//       startY: y,
//       head: [["Total", "Answered", "Yes", "No", "Accepted", "Rejected"]],
//       body: [[s.total, s.answered, s.yesCount, s.noCount, s.accepted, s.rejected]],
//       headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 8, fontStyle: "bold" },
//       bodyStyles: { fontSize: 9, halign: "center" },
//       margin: { left: ML, right: MR, bottom: 18 },
//       didDrawPage: () => {},
//     });
//     y = doc.lastAutoTable.finalY + 6;

//     // Anomalies
//     if (anomalies.length > 0) {
//       if (y + 14 > H - 20) { doc.addPage(); y = 16; }
//       doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(153, 27, 27);
//       doc.text(`Anomalies (${anomalies.length})`, ML, y); y += 4;
//       autoTable(doc, {
//         startY: y,
//         head: [["#", "Section", "Question", "Response", "Severity", "Admin Remark"]],
//         body: anomalies.map((a, i) => [
//           i + 1,
//           `${a.topicNo}. ${a.topicName}`,
//           a.questionText,
//           a.availability || "—",
//           a.severity,
//           a.adminRemark || "—",
//         ]),
//         headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 8, fontStyle: "bold" },
//         bodyStyles: { fontSize: 7.5, valign: "top", overflow: "linebreak", cellPadding: 2.5 },
//         alternateRowStyles: { fillColor: [255, 245, 245] },
//         columnStyles: {
//           0: { cellWidth: 7, halign: "center" },
//           1: { cellWidth: 28 },
//           2: { cellWidth: 50 },
//           3: { cellWidth: 15, halign: "center" },
//           4: { cellWidth: 16, halign: "center" },
//           5: { cellWidth: "auto" },
//         },
//         rowPageBreak: "avoid", showHead: "everyPage",
//         margin: { left: ML, right: MR, bottom: 18 },
//         didParseCell: (d) => {
//           if (d.section === "body" && d.column.index === 4) {
//             if (d.cell.raw === "HIGH")   { d.cell.styles.textColor = [153,27,27]; d.cell.styles.fontStyle = "bold"; }
//             if (d.cell.raw === "MEDIUM") { d.cell.styles.textColor = [154,52,18]; d.cell.styles.fontStyle = "bold"; }
//             if (d.cell.raw === "LOW")    { d.cell.styles.textColor = [146,64,14]; d.cell.styles.fontStyle = "bold"; }
//           }
//         },
//         didDrawPage: () => {},
//       });
//       y = doc.lastAutoTable.finalY + 6;
//     }

//     // Tasks
//     if (tasks.length > 0) {
//       if (y + 14 > H - 20) { doc.addPage(); y = 16; }
//       doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(29, 78, 216);
//       doc.text(`Mitigation Tasks (${tasks.length})`, ML, y); y += 4;
//       autoTable(doc, {
//         startY: y,
//         head: [["#", "Section", "Question", "Severity", "Mitigation Action", "Status"]],
//         body: tasks.map((t, i) => [
//           i + 1, t.topicName, t.questionText, t.severity, t.action, t.status,
//         ]),
//         headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 8, fontStyle: "bold" },
//         bodyStyles: { fontSize: 7.5, valign: "top", overflow: "linebreak", cellPadding: 2.5 },
//         alternateRowStyles: { fillColor: [239, 246, 255] },
//         columnStyles: {
//           0: { cellWidth: 7, halign: "center" },
//           1: { cellWidth: 25 },
//           2: { cellWidth: 40 },
//           3: { cellWidth: 16, halign: "center" },
//           4: { cellWidth: "auto" },
//           5: { cellWidth: 14, halign: "center" },
//         },
//         rowPageBreak: "avoid", showHead: "everyPage",
//         margin: { left: ML, right: MR, bottom: 18 },
//         didDrawPage: () => {},
//       });
//       y = doc.lastAutoTable.finalY + 10;
//     } else {
//       doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(22, 101, 52);
//       doc.text("No anomalies — no mitigation tasks required.", ML, y);
//       y += 10;
//     }

//     if (qi < qReports.length - 1) {
//       doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
//       doc.line(ML, y, W - MR, y);
//       y += 6;
//     }
//   });

//   // Footers
//   const totalPages = doc.internal.getNumberOfPages();
//   for (let p = 1; p <= totalPages; p++) {
//     doc.setPage(p);
//     drawFooter(p, totalPages);
//   }

//   doc.save(`Vendor_Report_${vendorName.replace(/\s+/g, "_")}_${fmt(new Date())}.pdf`);
// }

// /* ─── main component ─────────────────────────────────────────────────────── */
// const VendorSummaryReportModal = ({ user, organization, onClose }) => {

//   // view: "list" → "detail" → "tasks"
//   const [view,           setView]           = useState("list");
//   const [vendors,        setVendors]        = useState([]);   // [{ vendorId, vendorName, questionnaires[] }]
//   const [loadingVendors, setLoadingVendors] = useState(true);
//   const [selectedVendor, setSelectedVendor] = useState(null);
//   const [qReports,       setQReports]       = useState([]);
//   const [loadingReport,  setLoadingReport]  = useState(false);
//   const [taskFilter,     setTaskFilter]     = useState("ALL");

//   /* ── Step 1: load all org questionnaires, group by vendor ── */
//   const loadVendors = useCallback(async () => {
//     setLoadingVendors(true);
//     try {
//       const all = await tprmService.getQuestionnaires(organization);
//       const list = Array.isArray(all) ? all : [];

//       // Only include questionnaires that a vendor has submitted
//       const reportable = list.filter(q => REPORTABLE_STATUSES.includes(q.status));

//       // Group by vendorId
//       const byVendor = {};
//       reportable.forEach(q => {
//         const vid = q.vendorId || q.vendorName; // fallback to name if no id
//         if (!vid) return;
//         if (!byVendor[vid]) {
//           byVendor[vid] = {
//             vendorId:        q.vendorId,
//             vendorName:      q.vendorName || "Unknown Vendor",
//             questionnaires:  [],
//           };
//         }
//         byVendor[vid].questionnaires.push(q);
//       });

//       setVendors(Object.values(byVendor));
//     } catch (e) {
//       console.error("Failed to load vendors:", e);
//       setVendors([]);
//     } finally {
//       setLoadingVendors(false);
//     }
//   }, [organization]);

//   useEffect(() => { loadVendors(); }, [loadVendors]);

//   /* ── Step 2: on vendor click, load responses for each questionnaire ── */
//   const openVendorReport = useCallback(async (vendor) => {
//     setSelectedVendor(vendor);
//     setLoadingReport(true);
//     setQReports([]);
//     setView("detail");
//     try {
//       const built = await Promise.all(
//         vendor.questionnaires.map(async (q) => {
//           const responses = await tprmService.getResponses(q.id);
//           return buildQReport(q, Array.isArray(responses) ? responses : []);
//         })
//       );
//       setQReports(built);
//     } catch (e) {
//       console.error("Failed to load report:", e);
//       setQReports([]);
//     } finally {
//       setLoadingReport(false);
//     }
//   }, []);

//   /* ── Navigation ── */
//   const goBack = () => {
//     if (view === "tasks") { setView("detail"); return; }
//     setView("list");
//     setSelectedVendor(null);
//     setQReports([]);
//     setTaskFilter("ALL");
//   };

//   /* ── Derived totals ── */
//   const allAnomalies   = qReports.flatMap(q => q.anomalies);
//   const allTasks       = qReports.flatMap(q => q.tasks);
//   const filteredTasks  = taskFilter === "ALL"
//     ? allTasks
//     : allTasks.filter(t => t.severity === taskFilter);

//   /* ── Render ── */
//   return (
//     <div
//       className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
//       style={{ paddingTop: NAVBAR_HEIGHT + MODAL_GAP, paddingBottom: MODAL_GAP }}
//     >
//       <motion.div
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto flex flex-col"
//         style={{ maxHeight: `calc(100vh - ${NAVBAR_HEIGHT + MODAL_GAP * 2}px)` }}
//         initial={{ opacity: 0, y: -12 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.2, ease: "easeOut" }}
//       >
//         {/* ── Header ── */}
//         <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
//           <div className="flex items-center gap-3">
//             {view !== "list" && (
//               <button onClick={goBack}
//                 className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors mr-1">
//                 <ArrowLeft size={15} className="text-slate-600" />
//               </button>
//             )}
//             <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
//               style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
//               <Shield size={18} color="#fff" />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-slate-800" style={{ margin: 0 }}>
//                 {view === "list"   ? "Vendor Summary Reports" :
//                  view === "tasks"  ? `Tasks — ${selectedVendor?.vendorName}` :
//                  selectedVendor?.vendorName || "Report"}
//               </h2>
//               <p className="text-xs text-slate-500" style={{ margin: 0 }}>
//                 {view === "list"  ? `${vendors.length} vendor(s) with submitted questionnaires` :
//                  view === "tasks" ? `${filteredTasks.length} task(s)` :
//                  loadingReport    ? "Loading responses…" :
//                  `${allAnomalies.length} anomaly(s) · ${allTasks.length} task(s)`}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             {view === "detail" && !loadingReport && qReports.length > 0 && (
//               <>
//                 <button onClick={() => setView("tasks")}
//                   style={{
//                     display: "flex", alignItems: "center", gap: 5,
//                     padding: "7px 12px", borderRadius: 12, fontSize: 12,
//                     fontWeight: 600, cursor: "pointer",
//                     background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe",
//                   }}>
//                   <CheckSquare size={12} /> Tasks ({allTasks.length})
//                 </button>
//                 <button
//                   onClick={() => generatePDF(selectedVendor.vendorName, organization, qReports)}
//                   className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
//                   style={{ border: "none", cursor: "pointer" }}>
//                   <Download size={13} /> PDF
//                 </button>
//               </>
//             )}
//             {view === "tasks" && (
//               <button
//                 onClick={() => generatePDF(selectedVendor.vendorName, organization, qReports)}
//                 className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
//                 style={{ border: "none", cursor: "pointer" }}>
//                 <Download size={13} /> PDF
//               </button>
//             )}
//             <button onClick={onClose}
//               className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
//               style={{ border: "none", cursor: "pointer", background: "transparent" }}>
//               <X size={18} color="#64748b" />
//             </button>
//           </div>
//         </div>

//         {/* ── Body ── */}
//         <div className="flex-1 overflow-y-auto px-7 py-5">

//           {/* ────── LIST VIEW ────── */}
//           {view === "list" && (
//             <div className="space-y-2.5">
//               {loadingVendors ? (
//                 <div className="flex items-center justify-center h-48">
//                   <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//                 </div>
//               ) : vendors.length === 0 ? (
//                 <div className="text-center py-14">
//                   <Shield size={36} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
//                   <p className="text-slate-500 font-medium">No submitted questionnaires yet</p>
//                   <p className="text-slate-400 text-sm mt-1">
//                     Reports are available once a vendor submits a questionnaire
//                   </p>
//                 </div>
//               ) : (
//                 vendors.map((v, i) => (
//                   <motion.div key={v.vendorId || v.vendorName}
//                     className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
//                     initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: i * 0.04 }}
//                     onClick={() => openVendorReport(v)}>
//                     <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-md"
//                       style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
//                       {v.vendorName?.[0]?.toUpperCase() || "V"}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-semibold text-slate-800">{v.vendorName}</p>
//                       <p className="text-xs text-slate-400 mt-0.5">
//                         {v.questionnaires.length} questionnaire(s) ·{" "}
//                         {v.questionnaires.filter(q => q.status === "APPROVED").length} approved ·{" "}
//                         {v.questionnaires.filter(q => q.status === "REJECTED").length} rejected
//                       </p>
//                     </div>
//                     {/* Status dots */}
//                     <div className="flex gap-1 flex-wrap justify-end max-w-[160px]">
//                       {v.questionnaires.slice(0, 3).map(q => (
//                         <StatusBadge key={q.id} status={q.status} />
//                       ))}
//                       {v.questionnaires.length > 3 && (
//                         <span className="text-xs text-slate-400">+{v.questionnaires.length - 3}</span>
//                       )}
//                     </div>
//                     <ChevronRight size={16} color="#94a3b8" className="flex-shrink-0" />
//                   </motion.div>
//                 ))
//               )}
//             </div>
//           )}

//           {/* ────── LOADING REPORT ────── */}
//           {view === "detail" && loadingReport && (
//             <div className="flex items-center justify-center h-56">
//               <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//             </div>
//           )}

//           {/* ────── DETAIL VIEW ────── */}
//           {view === "detail" && !loadingReport && (
//             <div className="space-y-6">
//               {/* Summary banner */}
//               <div className="rounded-xl p-5 flex items-center justify-between gap-6 flex-wrap"
//                 style={{ background: "linear-gradient(135deg,#eff6ff,#f0f9ff)", border: "1px solid #bfdbfe" }}>
//                 <div>
//                   <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
//                     {selectedVendor?.vendorName}
//                   </p>
//                   <p className="text-xs text-slate-400">
//                     {qReports.length} questionnaire(s) · generated {fmt(new Date())}
//                   </p>
//                 </div>
//                 <div className="flex gap-8">
//                   <div className="text-center">
//                     <p className="text-2xl font-black text-red-600">{allAnomalies.length}</p>
//                     <p className="text-xs text-slate-400 mt-0.5">Anomalies</p>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-2xl font-black text-blue-600">{allTasks.length}</p>
//                     <p className="text-xs text-slate-400 mt-0.5">Tasks</p>
//                   </div>
//                 </div>
//               </div>

//               {qReports.length === 0 && (
//                 <div className="text-center py-10">
//                   <FileText size={32} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
//                   <p className="text-slate-500 font-medium">No response data found</p>
//                 </div>
//               )}

//               {qReports.map((qr, i) => {
//                 const { meta: m, summary: s, anomalies, tasks } = qr;
//                 return (
//                   <motion.div key={m.id || i}
//                     className="border border-slate-100 rounded-xl overflow-hidden shadow-sm"
//                     initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: i * 0.06 }}>

//                     {/* Card header */}
//                     <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
//                       <div className="flex items-center gap-2.5 flex-wrap">
//                         <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
//                           style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
//                           {i + 1}
//                         </div>
//                         <p className="text-sm font-semibold text-slate-800">{m.title}</p>
//                         <StatusBadge status={m.status} />
//                       </div>
//                       <span className="text-xs text-slate-400 flex-shrink-0">Due {m.dueDate || "—"}</span>
//                     </div>

//                     {/* Response counts */}
//                     <div className="grid grid-cols-6 divide-x divide-slate-100 border-b border-slate-100">
//                       {[
//                         { label: "Total",    value: s.total,        color: "#64748b" },
//                         { label: "Yes",      value: s.yesCount,     color: "#059669" },
//                         { label: "No",       value: s.noCount,      color: "#dc2626" },
//                         { label: "Accepted", value: s.accepted,     color: "#2563eb" },
//                         { label: "Rejected", value: s.rejected,     color: "#dc2626" },
//                         { label: "Anomalies",value: anomalies.length,color: "#dc2626" },
//                       ].map(({ label, value, color }) => (
//                         <div key={label} className="text-center py-3 px-1">
//                           <p className="text-lg font-black" style={{ color }}>{value}</p>
//                           <p className="text-xs text-slate-400">{label}</p>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Admin comment */}
//                     {m.adminComment && (
//                       <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-800">
//                         <span className="font-semibold">Admin comment: </span>{m.adminComment}
//                       </div>
//                     )}

//                     {/* Anomalies */}
//                     {anomalies.length > 0 ? (
//                       <div className="px-5 py-3">
//                         <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
//                           <AlertTriangle size={11} /> Anomalies ({anomalies.length})
//                         </p>
//                         <div className="space-y-2">
//                           {anomalies.map((a, ai) => (
//                             <div key={ai} className="rounded-xl p-3"
//                               style={{ background: "#fff5f5", border: "1px solid #fecaca", borderLeft: "3px solid #ef4444" }}>
//                               <div className="flex items-start justify-between gap-3 mb-1.5">
//                                 <p className="text-xs font-semibold text-slate-800 flex-1 leading-relaxed">
//                                   {a.questionText}
//                                 </p>
//                                 <SeverityBadge sev={a.severity} />
//                               </div>
//                               <div className="flex gap-3 text-xs text-slate-500 flex-wrap mb-1">
//                                 <span className="font-mono text-indigo-600 font-semibold">
//                                   {a.topicNo}. {a.topicName}
//                                 </span>
//                                 <span>
//                                   Vendor answered: <strong className={
//                                     a.availability === "No" ? "text-red-600" :
//                                     a.availability === "Partial" ? "text-amber-600" :
//                                     "text-emerald-600"
//                                   }>{a.availability || "—"}</strong>
//                                 </span>
//                               </div>
//                               {a.adminRemark && (
//                                 <p className="text-xs text-slate-600 italic mt-1">
//                                   Admin remark: "{a.adminRemark}"
//                                 </p>
//                               )}
//                               {a.description && (
//                                 <p className="text-xs text-slate-500 mt-1">
//                                   Vendor description: {a.description}
//                                 </p>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="px-5 py-3 text-xs text-emerald-700 flex items-center gap-2">
//                         <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center font-bold flex-shrink-0">✓</span>
//                         No anomalies — all questions accepted or not yet reviewed.
//                       </div>
//                     )}

//                     {/* Tasks preview */}
//                     {tasks.length > 0 && (
//                       <div className="px-5 pb-4 border-t border-slate-50 pt-3">
//                         <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
//                           <CheckSquare size={11} /> Mitigation Tasks ({tasks.length})
//                         </p>
//                         <div className="space-y-1.5">
//                           {tasks.slice(0, 2).map((t, ti) => (
//                             <div key={ti} className="rounded-xl px-3 py-2.5 flex items-start gap-2.5"
//                               style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
//                               <SeverityBadge sev={t.severity} />
//                               <p className="text-xs text-blue-800 flex-1 leading-relaxed">{t.action}</p>
//                               <span style={{
//                                 fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10,
//                                 background: "#fef9c3", color: "#854d0e", whiteSpace: "nowrap",
//                               }}>
//                                 {t.status}
//                               </span>
//                             </div>
//                           ))}
//                           {tasks.length > 2 && (
//                             <button
//                               onClick={() => setView("tasks")}
//                               className="w-full text-xs text-blue-500 text-center mt-1 hover:text-blue-700"
//                               style={{ background: "none", border: "none", cursor: "pointer" }}>
//                               +{tasks.length - 2} more — click to view all tasks
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </motion.div>
//                 );
//               })}
//             </div>
//           )}

//           {/* ────── TASKS VIEW ────── */}
//           {view === "tasks" && (
//             <div className="space-y-4">
//               {/* Severity filter */}
//               <div className="flex gap-1.5 flex-wrap items-center">
//                 <span className="text-xs text-slate-500 mr-1 font-medium">Filter by severity:</span>
//                 {["ALL", "HIGH", "MEDIUM", "LOW"].map(f => (
//                   <button key={f} onClick={() => setTaskFilter(f)}
//                     style={{
//                       padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
//                       cursor: "pointer", border: "none",
//                       background: taskFilter === f ? "#4f46e5" : "#f1f5f9",
//                       color:      taskFilter === f ? "#fff"    : "#475569",
//                     }}>
//                     {f}
//                     {f !== "ALL" && (
//                       <span style={{ marginLeft: 4, opacity: 0.75 }}>
//                         ({allTasks.filter(t => t.severity === f).length})
//                       </span>
//                     )}
//                   </button>
//                 ))}
//               </div>

//               {filteredTasks.length === 0 ? (
//                 <div className="text-center py-12">
//                   <CheckSquare size={32} color="#cbd5e1" style={{ margin: "0 auto 10px" }} />
//                   <p className="text-slate-500 font-medium">No tasks for this filter</p>
//                 </div>
//               ) : (
//                 filteredTasks.map((t, i) => (
//                   <motion.div key={i} className="rounded-xl overflow-hidden"
//                     style={{ border: "1px solid #bfdbfe", borderLeft: "4px solid #3b82f6" }}
//                     initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: i * 0.03 }}>

//                     <div className="px-4 py-3" style={{ background: "#eff6ff" }}>
//                       <div className="flex items-center justify-between gap-3 mb-2">
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
//                             {t.taskId}
//                           </span>
//                           <SeverityBadge sev={t.severity} />
//                         </div>
//                         <span style={{
//                           fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
//                           background: "#fef9c3", color: "#854d0e",
//                         }}>
//                           {t.status}
//                         </span>
//                       </div>
//                       <p className="text-sm font-semibold text-slate-800 mb-0.5 leading-relaxed">{t.questionText}</p>
//                       <p className="text-xs text-slate-500">
//                         Section: <span className="font-semibold">{t.topicName}</span>
//                         {t.category && <> · {t.category}</>}
//                       </p>
//                     </div>

//                     <div className="px-4 py-3 border-t border-blue-100">
//                       <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1.5">
//                         Mitigation Action
//                       </p>
//                       <p className="text-sm text-slate-700 leading-relaxed">{t.action}</p>
//                       {t.adminRemark && (
//                         <p className="text-xs text-slate-500 mt-1.5 italic">
//                           Admin remark: "{t.adminRemark}"
//                         </p>
//                       )}
//                     </div>
//                   </motion.div>
//                 ))
//               )}
//             </div>
//           )}
//         </div>

//         {/* ── Footer ── */}
//         <div className="flex-shrink-0 border-t border-slate-100" style={{ padding: "12px 28px 20px" }}>
//           <button onClick={onClose}
//             className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-semibold text-slate-600"
//             style={{ padding: "11px 0", border: "none", cursor: "pointer" }}>
//             Close
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default VendorSummaryReportModal;


import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  X, FileText, Download, ArrowLeft,
  AlertTriangle, CheckSquare, Shield, ChevronRight,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import tprmService from "../services/tprmService";

const NAVBAR_HEIGHT = 72;
const MODAL_GAP     = 32;

const STATUS_CONFIG = {
  DRAFT:        { label: "Draft",        cls: "bg-slate-100 text-slate-600" },
  SENT:         { label: "Sent",         cls: "bg-blue-100 text-blue-700" },
  SUBMITTED:    { label: "Submitted",    cls: "bg-amber-100 text-amber-700" },
  UNDER_REVIEW: { label: "Under Review", cls: "bg-violet-100 text-violet-700" },
  RESUBMITTED:  { label: "Resubmitted",  cls: "bg-orange-100 text-orange-700" },
  APPROVED:     { label: "Approved",     cls: "bg-emerald-100 text-emerald-700" },
  REJECTED:     { label: "Rejected",     cls: "bg-red-100 text-red-700" },
};

const REPORTABLE_STATUSES = ["SUBMITTED","UNDER_REVIEW","RESUBMITTED","APPROVED","REJECTED"];

/* ─── helpers ────────────────────────────────────────────────────────────── */
const fmt = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return "—";
  return `${String(dt.getDate()).padStart(2,"0")}-${String(dt.getMonth()+1).padStart(2,"0")}-${dt.getFullYear()}`;
};

// Severity based on vendor's answer
const getSeverity = (availability) => {
  if (availability === "No")      return "HIGH";
  if (availability === "Partial") return "MEDIUM";
  return "LOW"; // answered "Yes" but admin still rejected
};

const getMitigationAction = (adminRemark, anomalyText, sev) => {
  // Admin's own remark takes priority
  if (adminRemark && adminRemark.trim()) return adminRemark.trim();
  // Then use the question's anomalyText as the action description
  if (anomalyText && anomalyText.trim()) return anomalyText.trim();
  // Fallback generic
  if (sev === "HIGH")   return "Implement the missing control immediately and provide documented evidence.";
  if (sev === "MEDIUM") return "Strengthen the partial control and document the improvement plan.";
  return "Review the implementation and address the admin's concerns with supporting evidence.";
};

/**
 * Build a structured report for one questionnaire.
 *
 * questionMap — { [questionId]: Question } from the question bank
 *   Used to get expectedAnswer and anomalyText per response.
 *
 * Anomaly detection rule:
 *   If response.questionStatus === "REJECTED"  →  anomaly (admin explicitly rejected)
 *   Additionally, if vendor's answer !== question.expectedAnswer → also flag as anomaly
 *   (union of both, deduped by questionId)
 */
const buildQReport = (q, responses, questionMap) => {
  const answered     = responses.filter(r => r.availability).length;
  const accepted     = responses.filter(r => r.questionStatus === "ACCEPTED").length;
  const rejected     = responses.filter(r => r.questionStatus === "REJECTED").length;
  const yesCount     = responses.filter(r => r.availability === "Yes").length;
  const noCount      = responses.filter(r => r.availability === "No").length;
  const partialCount = responses.filter(r => r.availability === "Partial").length;

  const anomalySet = new Map(); // keyed by questionId to avoid duplicates

  responses.forEach(r => {
    const qMeta = questionMap[r.questionId];
    const isRejected     = r.questionStatus === "REJECTED";
    const answerMismatch = qMeta?.expectedAnswer && r.availability && r.availability !== qMeta.expectedAnswer;

    if (isRejected || answerMismatch) {
      if (!anomalySet.has(r.questionId)) {
        const sev = getSeverity(r.availability);
        anomalySet.set(r.questionId, {
          questionId:   r.questionId,
          questionText: r.questionText,
          topicNo:      r.topicNo,
          topicName:    r.topicName,
          category:     r.category,
          availability: r.availability,
          expectedAnswer: qMeta?.expectedAnswer || "Yes",
          anomalyText:  qMeta?.anomalyText || "",
          adminRemark:  r.questionRemark || "",
          severity:     sev,
          // Why flagged
          reason: isRejected ? "REJECTED_BY_ADMIN" : "ANSWER_MISMATCH",
        });
      }
    }
  });

  const anomalies = Array.from(anomalySet.values());

  const tasks = anomalies.map((a, idx) => ({
    taskId:       `TASK-${String(idx + 1).padStart(3,"0")}`,
    questionText: a.questionText,
    topicName:    a.topicName,
    category:     a.category,
    severity:     a.severity,
    action:       getMitigationAction(a.adminRemark, a.anomalyText, a.severity),
    adminRemark:  a.adminRemark,
    anomalyText:  a.anomalyText,
    status:       "OPEN",
  }));

  return {
    meta: {
      id:           q.id,
      title:        q.title,
      status:       q.status,
      dueDate:      q.dueDate,
      submittedAt:  q.submittedAt,
      reviewedAt:   q.reviewedAt,
      reviewedBy:   q.reviewedBy,
      adminComment: q.adminComment,
    },
    summary: { answered, accepted, rejected, yesCount, noCount, partialCount, total: responses.length },
    anomalies,
    tasks,
  };
};

/* ─── severity badge ─────────────────────────────────────────────────────── */
const SEV_STYLE = {
  HIGH:   { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
  MEDIUM: { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
  LOW:    { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
};
const SeverityBadge = ({ sev }) => {
  const s = SEV_STYLE[sev] || SEV_STYLE.LOW;
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:12,
      background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:"nowrap" }}>
      {sev}
    </span>
  );
};
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>;
};

/* ─── PDF generator ──────────────────────────────────────────────────────── */
function generatePDF(vendorName, orgName, qReports) {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ML = 14, MR = 14;

  const drawFooter = (p, total) => {
    doc.setDrawColor(203,213,225); doc.setLineWidth(0.3);
    doc.line(ML, H-12, W-MR, H-12);
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(148,163,184);
    doc.text(`Generated for ${orgName} by CalVant`, ML, H-7);
    const right = `Page ${p} of ${total}`;
    doc.text(right, W-MR-doc.getTextWidth(right), H-7);
  };

  // Cover
  doc.setFillColor(37,99,235); doc.rect(0,0,W,1.5,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(18); doc.setTextColor(30,41,59);
  doc.text("Vendor Summary Report", ML, 16);
  doc.setFont("helvetica","normal"); doc.setFontSize(9.5); doc.setTextColor(100,116,139);
  doc.text(`${vendorName}   ·   Generated ${fmt(new Date())}`, ML, 23);
  doc.setDrawColor(226,232,240); doc.setLineWidth(0.4);
  doc.line(ML, 27, W-MR, 27);

  const totalAnomalies = qReports.reduce((s,q) => s+q.anomalies.length, 0);
  const totalTasks     = qReports.reduce((s,q) => s+q.tasks.length, 0);

  let y = 35;
  doc.setFillColor(241,245,249); doc.setDrawColor(203,213,225); doc.setLineWidth(0.3);
  doc.roundedRect(ML, y, W-ML-MR, 14, 3, 3, "FD");
  const cw = (W-ML-MR)/3;
  [
    { label:"Questionnaires", value:String(qReports.length), color:[71,85,105] },
    { label:"Anomalies",      value:String(totalAnomalies),  color:[220,38,38] },
    { label:"Tasks",          value:String(totalTasks),      color:[37,99,235] },
  ].forEach(({ label,value,color },i) => {
    const cx = ML+i*cw+cw/2;
    doc.setFont("helvetica","bold"); doc.setFontSize(13); doc.setTextColor(...color);
    doc.text(value, cx, y+7, { align:"center" });
    doc.setFont("helvetica","normal"); doc.setFontSize(7.5); doc.setTextColor(100,116,139);
    doc.text(label, cx, y+12, { align:"center" });
  });
  y += 22;

  qReports.forEach((qr, qi) => {
    const { meta:m, summary:s, anomalies, tasks } = qr;
    if (y+14 > H-20) { doc.addPage(); y=16; }

    doc.setFillColor(37,99,235);
    doc.roundedRect(ML, y, W-ML-MR, 9, 2, 2, "F");
    doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(255,255,255);
    doc.text(`${qi+1}. ${m.title}   [${m.status}]`, ML+4, y+6.2);
    y += 13;

    doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(71,85,105);
    doc.text(
      [`Due: ${m.dueDate||"—"}`, `Submitted: ${fmt(m.submittedAt)}`,
       `Reviewed: ${fmt(m.reviewedAt)}`, `Anomalies: ${anomalies.length}`].join("   ·   "),
      ML, y
    );
    y += 5;

    if (m.adminComment) {
      doc.setFont("helvetica","italic"); doc.setFontSize(8); doc.setTextColor(100,116,139);
      const lines = doc.splitTextToSize(`Admin comment: ${m.adminComment}`, W-ML-MR);
      doc.text(lines, ML, y); y += lines.length*4.5;
    }
    y += 3;

    // Response breakdown
    if (y+10 > H-20) { doc.addPage(); y=16; }
    doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(71,85,105);
    doc.text("Response Breakdown", ML, y); y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Total","Answered","Yes","No","Accepted","Rejected"]],
      body: [[s.total, s.answered, s.yesCount, s.noCount, s.accepted, s.rejected]],
      headStyles: { fillColor:[71,85,105], textColor:255, fontSize:8, fontStyle:"bold" },
      bodyStyles: { fontSize:9, halign:"center" },
      margin: { left:ML, right:MR, bottom:18 }, didDrawPage:()=>{},
    });
    y = doc.lastAutoTable.finalY+6;

    // Anomalies
    if (anomalies.length > 0) {
      if (y+14 > H-20) { doc.addPage(); y=16; }
      doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(153,27,27);
      doc.text(`Anomalies (${anomalies.length})`, ML, y); y += 4;
      autoTable(doc, {
        startY: y,
        head: [["#","Section","Question","Response","Expected","Severity","Anomaly / Risk"]],
        body: anomalies.map((a,i) => [
          i+1,
          `${a.topicNo}. ${a.topicName}`,
          a.questionText,
          a.availability || "—",
          a.expectedAnswer,
          a.severity,
          a.anomalyText || a.adminRemark || "—",
        ]),
        headStyles: { fillColor:[220,38,38], textColor:255, fontSize:8, fontStyle:"bold" },
        bodyStyles: { fontSize:7, valign:"top", overflow:"linebreak", cellPadding:2.5 },
        alternateRowStyles: { fillColor:[255,245,245] },
        columnStyles: {
          0: { cellWidth:7, halign:"center" },
          1: { cellWidth:22 },
          2: { cellWidth:38 },
          3: { cellWidth:14, halign:"center" },
          4: { cellWidth:14, halign:"center" },
          5: { cellWidth:14, halign:"center" },
          6: { cellWidth:"auto" },
        },
        rowPageBreak:"avoid", showHead:"everyPage",
        margin: { left:ML, right:MR, bottom:18 },
        didParseCell:(d) => {
          if (d.section==="body" && d.column.index===5) {
            if (d.cell.raw==="HIGH")   { d.cell.styles.textColor=[153,27,27]; d.cell.styles.fontStyle="bold"; }
            if (d.cell.raw==="MEDIUM") { d.cell.styles.textColor=[154,52,18]; d.cell.styles.fontStyle="bold"; }
            if (d.cell.raw==="LOW")    { d.cell.styles.textColor=[146,64,14]; d.cell.styles.fontStyle="bold"; }
          }
        },
        didDrawPage:()=>{},
      });
      y = doc.lastAutoTable.finalY+6;
    }

    // Tasks
    if (tasks.length > 0) {
      if (y+14 > H-20) { doc.addPage(); y=16; }
      doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(29,78,216);
      doc.text(`Mitigation Tasks (${tasks.length})`, ML, y); y += 4;
      autoTable(doc, {
        startY: y,
        head: [["#","Section","Question","Severity","Mitigation / Action","Status"]],
        body: tasks.map((t,i) => [i+1, t.topicName, t.questionText, t.severity, t.action, t.status]),
        headStyles: { fillColor:[37,99,235], textColor:255, fontSize:8, fontStyle:"bold" },
        bodyStyles: { fontSize:7.5, valign:"top", overflow:"linebreak", cellPadding:2.5 },
        alternateRowStyles: { fillColor:[239,246,255] },
        columnStyles: {
          0: { cellWidth:7, halign:"center" }, 1: { cellWidth:25 },
          2: { cellWidth:40 }, 3: { cellWidth:16, halign:"center" },
          4: { cellWidth:"auto" }, 5: { cellWidth:14, halign:"center" },
        },
        rowPageBreak:"avoid", showHead:"everyPage",
        margin: { left:ML, right:MR, bottom:18 }, didDrawPage:()=>{},
      });
      y = doc.lastAutoTable.finalY+10;
    } else {
      doc.setFont("helvetica","italic"); doc.setFontSize(8.5); doc.setTextColor(22,101,52);
      doc.text("No anomalies — no mitigation tasks required.", ML, y);
      y += 10;
    }

    if (qi < qReports.length-1) {
      doc.setDrawColor(226,232,240); doc.setLineWidth(0.3);
      doc.line(ML, y, W-MR, y); y += 6;
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let p=1; p<=totalPages; p++) { doc.setPage(p); drawFooter(p, totalPages); }
  doc.save(`Vendor_Report_${vendorName.replace(/\s+/g,"_")}_${fmt(new Date())}.pdf`);
}

/* ─── main component ─────────────────────────────────────────────────────── */
const VendorSummaryReportModal = ({ user, organization, onClose }) => {

  const [view,           setView]           = useState("list");
  const [vendors,        setVendors]        = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [qReports,       setQReports]       = useState([]);
  const [loadingReport,  setLoadingReport]  = useState(false);
  const [taskFilter,     setTaskFilter]     = useState("ALL");
  const [questionMap,    setQuestionMap]    = useState({}); // { questionId → Question }

  /* ── Load question bank once ── */
  const loadQuestionBank = useCallback(async () => {
    try {
      const questions = await tprmService.getQuestions(organization);
      if (Array.isArray(questions)) {
        const map = {};
        questions.forEach(q => { map[q.id] = q; });
        setQuestionMap(map);
      }
    } catch (_) {}
  }, [organization]);

  /* ── Load vendor list from questionnaires ── */
  const loadVendors = useCallback(async () => {
    setLoadingVendors(true);
    try {
      const all = await tprmService.getQuestionnaires(organization);
      const reportable = (Array.isArray(all) ? all : [])
        .filter(q => REPORTABLE_STATUSES.includes(q.status));

      const byVendor = {};
      reportable.forEach(q => {
        const vid = q.vendorId || q.vendorName;
        if (!vid) return;
        if (!byVendor[vid]) {
          byVendor[vid] = { vendorId: q.vendorId, vendorName: q.vendorName || "Unknown Vendor", questionnaires: [] };
        }
        byVendor[vid].questionnaires.push(q);
      });
      setVendors(Object.values(byVendor));
    } catch (_) {
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  }, [organization]);

  useEffect(() => {
    loadVendors();
    loadQuestionBank();
  }, [loadVendors, loadQuestionBank]);

  /* ── Open vendor report ── */
  const openVendorReport = useCallback(async (vendor) => {
    setSelectedVendor(vendor);
    setLoadingReport(true);
    setQReports([]);
    setView("detail");
    try {
      const built = await Promise.all(
        vendor.questionnaires.map(async (q) => {
          const responses = await tprmService.getResponses(q.id);
          return buildQReport(q, Array.isArray(responses) ? responses : [], questionMap);
        })
      );
      setQReports(built);
    } catch (_) {
      setQReports([]);
    } finally {
      setLoadingReport(false);
    }
  }, [questionMap]);

  const goBack = () => {
    if (view === "tasks") { setView("detail"); return; }
    setView("list"); setSelectedVendor(null); setQReports([]); setTaskFilter("ALL");
  };

  const allAnomalies  = qReports.flatMap(q => q.anomalies);
  const allTasks      = qReports.flatMap(q => q.tasks);
  const filteredTasks = taskFilter === "ALL" ? allTasks : allTasks.filter(t => t.severity === taskFilter);

  /* ── Render ── */
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
      style={{ paddingTop: NAVBAR_HEIGHT+MODAL_GAP, paddingBottom: MODAL_GAP }}>
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto flex flex-col"
        style={{ maxHeight:`calc(100vh - ${NAVBAR_HEIGHT+MODAL_GAP*2}px)` }}
        initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.2, ease:"easeOut" }}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {view !== "list" && (
              <button onClick={goBack} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors mr-1">
                <ArrowLeft size={15} className="text-slate-600" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
              style={{ background:"linear-gradient(135deg,#6366f1,#4f46e5)" }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800" style={{ margin:0 }}>
                {view==="list"  ? "Vendor Summary Reports" :
                 view==="tasks" ? `Tasks — ${selectedVendor?.vendorName}` :
                 selectedVendor?.vendorName || "Report"}
              </h2>
              <p className="text-xs text-slate-500" style={{ margin:0 }}>
                {view==="list"  ? `${vendors.length} vendor(s) with submitted questionnaires` :
                 view==="tasks" ? `${filteredTasks.length} task(s)` :
                 loadingReport  ? "Loading responses…" :
                 `${allAnomalies.length} anomaly(s) · ${allTasks.length} task(s)`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {view==="detail" && !loadingReport && qReports.length>0 && (
              <>
                <button onClick={() => setView("tasks")}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px",
                    borderRadius:12, fontSize:12, fontWeight:600, cursor:"pointer",
                    background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe" }}>
                  <CheckSquare size={12} /> Tasks ({allTasks.length})
                </button>
                <button onClick={() => generatePDF(selectedVendor.vendorName, organization, qReports)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  style={{ border:"none", cursor:"pointer" }}>
                  <Download size={13} /> PDF
                </button>
              </>
            )}
            {view==="tasks" && (
              <button onClick={() => generatePDF(selectedVendor.vendorName, organization, qReports)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                style={{ border:"none", cursor:"pointer" }}>
                <Download size={13} /> PDF
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              style={{ border:"none", cursor:"pointer", background:"transparent" }}>
              <X size={18} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-5">

          {/* LIST */}
          {view==="list" && (
            <div className="space-y-2.5">
              {loadingVendors ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : vendors.length===0 ? (
                <div className="text-center py-14">
                  <Shield size={36} color="#cbd5e1" style={{ margin:"0 auto 12px" }} />
                  <p className="text-slate-500 font-medium">No submitted questionnaires yet</p>
                  <p className="text-slate-400 text-sm mt-1">Reports appear once a vendor submits a questionnaire</p>
                </div>
              ) : vendors.map((v,i) => (
                <motion.div key={v.vendorId||v.vendorName}
                  className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.04 }}
                  onClick={() => openVendorReport(v)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-md"
                    style={{ background:"linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                    {v.vendorName?.[0]?.toUpperCase()||"V"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{v.vendorName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {v.questionnaires.length} questionnaire(s) ·{" "}
                      {v.questionnaires.filter(q=>q.status==="APPROVED").length} approved ·{" "}
                      {v.questionnaires.filter(q=>q.status==="REJECTED").length} rejected
                    </p>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end max-w-[160px]">
                    {v.questionnaires.slice(0,3).map(q => <StatusBadge key={q.id} status={q.status} />)}
                    {v.questionnaires.length>3 && <span className="text-xs text-slate-400">+{v.questionnaires.length-3}</span>}
                  </div>
                  <ChevronRight size={16} color="#94a3b8" className="flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          )}

          {/* LOADING */}
          {view==="detail" && loadingReport && (
            <div className="flex items-center justify-center h-56">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* DETAIL */}
          {view==="detail" && !loadingReport && (
            <div className="space-y-6">
              {/* Banner */}
              <div className="rounded-xl p-5 flex items-center justify-between gap-6 flex-wrap"
                style={{ background:"linear-gradient(135deg,#eff6ff,#f0f9ff)", border:"1px solid #bfdbfe" }}>
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">{selectedVendor?.vendorName}</p>
                  <p className="text-xs text-slate-400">{qReports.length} questionnaire(s) · generated {fmt(new Date())}</p>
                </div>
                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-black text-red-600">{allAnomalies.length}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Anomalies</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-blue-600">{allTasks.length}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Tasks</p>
                  </div>
                </div>
              </div>

              {qReports.length===0 && (
                <div className="text-center py-10">
                  <FileText size={32} color="#cbd5e1" style={{ margin:"0 auto 12px" }} />
                  <p className="text-slate-500 font-medium">No response data found</p>
                </div>
              )}

              {qReports.map((qr,i) => {
                const { meta:m, summary:s, anomalies, tasks } = qr;
                return (
                  <motion.div key={m.id||i}
                    className="border border-slate-100 rounded-xl overflow-hidden shadow-sm"
                    initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.06 }}>

                    <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ background:"linear-gradient(135deg,#6366f1,#4f46e5)" }}>{i+1}</div>
                        <p className="text-sm font-semibold text-slate-800">{m.title}</p>
                        <StatusBadge status={m.status} />
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">Due {m.dueDate||"—"}</span>
                    </div>

                    {/* Response counts */}
                    <div className="grid grid-cols-6 divide-x divide-slate-100 border-b border-slate-100">
                      {[
                        { label:"Total",    value:s.total,          color:"#64748b" },
                        { label:"Yes",      value:s.yesCount,       color:"#059669" },
                        { label:"No",       value:s.noCount,        color:"#dc2626" },
                        { label:"Accepted", value:s.accepted,       color:"#2563eb" },
                        { label:"Rejected", value:s.rejected,       color:"#dc2626" },
                        { label:"Anomalies",value:anomalies.length,  color:"#dc2626" },
                      ].map(({ label,value,color }) => (
                        <div key={label} className="text-center py-3 px-1">
                          <p className="text-lg font-black" style={{ color }}>{value}</p>
                          <p className="text-xs text-slate-400">{label}</p>
                        </div>
                      ))}
                    </div>

                    {m.adminComment && (
                      <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 text-xs text-blue-800">
                        <span className="font-semibold">Admin comment: </span>{m.adminComment}
                      </div>
                    )}

                    {/* Anomalies */}
                    {anomalies.length>0 ? (
                      <div className="px-5 py-3">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <AlertTriangle size={11} /> Anomalies ({anomalies.length})
                        </p>
                        <div className="space-y-2">
                          {anomalies.map((a,ai) => (
                            <div key={ai} className="rounded-xl p-3"
                              style={{ background:"#fff5f5", border:"1px solid #fecaca", borderLeft:"3px solid #ef4444" }}>
                              <div className="flex items-start justify-between gap-3 mb-1.5">
                                <p className="text-xs font-semibold text-slate-800 flex-1 leading-relaxed">{a.questionText}</p>
                                <SeverityBadge sev={a.severity} />
                              </div>
                              <div className="flex gap-3 text-xs text-slate-500 flex-wrap mb-1">
                                <span className="font-mono text-indigo-600 font-semibold">{a.topicNo}. {a.topicName}</span>
                                <span>Answered: <strong className={
                                  a.availability==="No" ? "text-red-600" :
                                  a.availability==="Partial" ? "text-amber-600" : "text-emerald-600"
                                }>{a.availability||"—"}</strong></span>
                                <span>Expected: <strong className="text-slate-700">{a.expectedAnswer}</strong></span>
                              </div>
                              {/* anomalyText from question bank — the core new feature */}
                              {a.anomalyText && (
                                <div className="mt-2 rounded-lg px-3 py-2 flex items-start gap-2"
                                  style={{ background:"#fffbeb", border:"1px solid #fde68a" }}>
                                  <AlertTriangle size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-amber-800 leading-relaxed">{a.anomalyText}</p>
                                </div>
                              )}
                              {a.adminRemark && (
                                <p className="text-xs text-slate-600 italic mt-1.5">Admin remark: "{a.adminRemark}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 py-3 text-xs text-emerald-700 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center font-bold flex-shrink-0">✓</span>
                        No anomalies — all questions compliant or not yet reviewed.
                      </div>
                    )}

                    {/* Tasks preview */}
                    {tasks.length>0 && (
                      <div className="px-5 pb-4 border-t border-slate-50 pt-3">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <CheckSquare size={11} /> Mitigation Tasks ({tasks.length})
                        </p>
                        <div className="space-y-1.5">
                          {tasks.slice(0,2).map((t,ti) => (
                            <div key={ti} className="rounded-xl px-3 py-2.5 flex items-start gap-2.5"
                              style={{ background:"#eff6ff", border:"1px solid #bfdbfe" }}>
                              <SeverityBadge sev={t.severity} />
                              <p className="text-xs text-blue-800 flex-1 leading-relaxed">{t.action}</p>
                              <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:10,
                                background:"#fef9c3", color:"#854d0e", whiteSpace:"nowrap" }}>
                                {t.status}
                              </span>
                            </div>
                          ))}
                          {tasks.length>2 && (
                            <button onClick={() => setView("tasks")}
                              className="w-full text-xs text-blue-500 text-center mt-1 hover:text-blue-700"
                              style={{ background:"none", border:"none", cursor:"pointer" }}>
                              +{tasks.length-2} more — click to view all tasks
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* TASKS */}
          {view==="tasks" && (
            <div className="space-y-4">
              <div className="flex gap-1.5 flex-wrap items-center">
                <span className="text-xs text-slate-500 mr-1 font-medium">Filter by severity:</span>
                {["ALL","HIGH","MEDIUM","LOW"].map(f => (
                  <button key={f} onClick={() => setTaskFilter(f)}
                    style={{ padding:"4px 12px", borderRadius:8, fontSize:12, fontWeight:600,
                      cursor:"pointer", border:"none",
                      background: taskFilter===f ? "#4f46e5" : "#f1f5f9",
                      color:      taskFilter===f ? "#fff"    : "#475569" }}>
                    {f}
                    {f!=="ALL" && <span style={{ marginLeft:4, opacity:0.75 }}>({allTasks.filter(t=>t.severity===f).length})</span>}
                  </button>
                ))}
              </div>

              {filteredTasks.length===0 ? (
                <div className="text-center py-12">
                  <CheckSquare size={32} color="#cbd5e1" style={{ margin:"0 auto 10px" }} />
                  <p className="text-slate-500 font-medium">No tasks for this filter</p>
                </div>
              ) : filteredTasks.map((t,i) => (
                <motion.div key={i} className="rounded-xl overflow-hidden"
                  style={{ border:"1px solid #bfdbfe", borderLeft:"4px solid #3b82f6" }}
                  initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.03 }}>
                  <div className="px-4 py-3" style={{ background:"#eff6ff" }}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">{t.taskId}</span>
                        <SeverityBadge sev={t.severity} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:10,
                        background:"#fef9c3", color:"#854d0e" }}>{t.status}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mb-0.5 leading-relaxed">{t.questionText}</p>
                    <p className="text-xs text-slate-500">
                      Section: <span className="font-semibold">{t.topicName}</span>
                      {t.category && <> · {t.category}</>}
                    </p>
                  </div>
                  <div className="px-4 py-3 border-t border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1.5">Mitigation Action</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{t.action}</p>
                    {t.adminRemark && (
                      <p className="text-xs text-slate-500 mt-1.5 italic">Admin remark: "{t.adminRemark}"</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-100" style={{ padding:"12px 28px 20px" }}>
          <button onClick={onClose}
            className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-semibold text-slate-600"
            style={{ padding:"11px 0", border:"none", cursor:"pointer" }}>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorSummaryReportModal;