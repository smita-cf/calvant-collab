import React, { useState, useEffect } from "react";
import { AlertTriangle, Target, FileText, X, Download } from "lucide-react";
import { Modal, ModalHeader, Spinner } from "../ui";
import { statusBadge, displayStatus } from "../../utils/helpers";
import { useControls } from "../../hooks/useControls";
import { useFramework } from "../../../../context/FrameworkContex.js";
import auditService from "../../services/auditService";
import gapService from "../../services/gapService";
import { captureActivity, ACTIONS } from "../../../../services/activities";
import { getAllUsers } from "../../../departments/services/userService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─────────────────────────────────────────────
// COLOR HELPERS  (no framework names hardcoded)
// ─────────────────────────────────────────────

/**
 * Given a hex color, derive the chip trio used for badges and cards.
 * Keeps visual style consistent with the rest of the dynamic system.
 */
function hexToMeta(hex = "#64748b") {
  return {
    color:  hex,
    bg:     hex + "18",   // ~10% opacity fill
    border: hex + "66",   // ~40% opacity border
  };
}

// ─────────────────────────────────────────────
// FILTER HELPER
// ─────────────────────────────────────────────

function auditMatchesFilter(audit, activeCodes) {
  if (!activeCodes) return true;
  return activeCodes.has(audit.frameworkCode);
}

// ─────────────────────────────────────────────
// PURE HELPERS  (unchanged logic)
// ─────────────────────────────────────────────

function resolveAssigneeName(assignedTo, users = []) {
  if (!assignedTo) return "—";
  const found = users.find((u) => String(u._id || u.id) === String(assignedTo));
  return found ? found.name : assignedTo;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dd   = String(d.getDate()).padStart(2, "0");
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function resolveOrganizationName(sessionUser) {
  if (!sessionUser) return "—";
  if (sessionUser.organization && typeof sessionUser.organization === "object") {
    return sessionUser.organization.name || sessionUser.organization.title || "—";
  }
  if (sessionUser.orgName)          return sessionUser.orgName;
  if (sessionUser.tenant?.name)     return sessionUser.tenant.name;
  if (sessionUser.organizationName) return sessionUser.organizationName;
  if (sessionUser.company)          return sessionUser.company;
  return "—";
}

var NC_STYLES = {
  "Major NC": { bg: "#fef2f2", color: "#991b1b", border: "#fecaca", dot: "#ef4444" },
  "Minor NC": { bg: "#fff7ed", color: "#92400e", border: "#fed7aa", dot: "#f97316" },
};

function NcBadge({ value }) {
  var s = NC_STYLES[value] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0", dot: "#94a3b8" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
      background: s.bg, color: s.color, border: "1px solid " + s.border,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {value}
    </span>
  );
}

function CapStatusPill({ status }) {
  var map = {
    "Open":        { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
    "In Progress": { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    "Closed":      { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
  };
  var s = map[status] || map["Open"];
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
      background: s.bg, color: s.color, border: "1px solid " + s.border,
    }}>
      {status || "Open"}
    </span>
  );
}

// ─────────────────────────────────────────────
// FETCH ORGANIZATION BY ID  (unchanged)
// ─────────────────────────────────────────────

const fetchOrganizationById = async (id) => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = "Bearer " + token;
  const baseUrl  = process.env.NEXT_PUBLIC_SP || "";
  const response = await fetch(`${baseUrl}/user-service/api/organizations`, { headers });
  if (!response.ok) return null;
  const organizations = await response.json();
  return organizations.find((org) => String(org._id || org.id) === String(id));
};

// ─────────────────────────────────────────────
// PDF DOWNLOAD  (unchanged)
// ─────────────────────────────────────────────

const handleDownloadReport = (
  audit,
  apiControls      = [],
  users            = [],
  ncGaps           = [],
  organizationName = "—",
) => {
  const doc    = new jsPDF();
  const pageW  = doc.internal.pageSize.getWidth();
  const pageH  = doc.internal.pageSize.getHeight();
  const marginL = 14;
  const marginR = 14;

  const drawFooter = (pageNum, totalPages) => {
    const ruleY = pageH - 12;
    const textY = pageH - 7;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(marginL, ruleY, pageW - marginR, ruleY);

    doc.setFontSize(7.5);

    const prefixText = "Generated for ";
    const orgText    = organizationName || "—";
    const suffixText = "  by ";

    doc.setFont("helvetica", "normal");
    const prefixW = doc.getTextWidth(prefixText);
    doc.setFont("helvetica", "bold");
    const orgW    = doc.getTextWidth(orgText);
    doc.setFont("helvetica", "normal");
    const suffixW = doc.getTextWidth(suffixText);

    let curX = marginL;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(prefixText, curX, textY);
    curX += prefixW;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(orgText, curX, textY);
    curX += orgW;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(suffixText, curX, textY);
    curX += suffixW;

    const logoH = 4.5;
    const logoW = 14;
    const logoY = textY - logoH + 1.5;

    let logoRendered = false;
    try {
      doc.addImage("/image.png", "PNG", curX, logoY, logoW, logoH);
      logoRendered = true;
    } catch (_) {}

    if (!logoRendered) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235);
      doc.text("CalVant", curX, textY);
    }

    const pageLabel = `Page ${pageNum} of ${totalPages}`;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    const labelW = doc.getTextWidth(pageLabel);
    doc.text(pageLabel, pageW - marginR - labelW, textY);
  };

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageW, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text("Audit Report", marginL, 16);

  const pillParts = [
    audit.auditType || "—",
    audit.frameworkCode || "—",
    formatDate(audit.openingMeetingDate),
  ];
  const separator    = "   ·   ";
  const fullPillText = pillParts.join(separator);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const pillTotalW = doc.getTextWidth(fullPillText);
  const pillPadH   = 3.5;
  const pillPadW   = 8;
  const pillRectW  = pillTotalW + pillPadW * 2;
  const pillRectH  = 7;
  const pillX      = pageW - marginR - pillRectW;
  const pillY      = 10;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(pillX, pillY, pillRectW, pillRectH, 3, 3, "FD");

  let pillCurX = pillX + pillPadW;
  const pillTextY      = pillY + pillPadH + 0.5;
  const segmentColors  = [[30, 41, 59], [37, 99, 235], [100, 116, 139]];
  const sepColor       = [148, 163, 184];

  pillParts.forEach((part, i) => {
    doc.setFont("helvetica", i === 0 ? "bold" : "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...segmentColors[i]);
    doc.text(part, pillCurX, pillTextY);
    pillCurX += doc.getTextWidth(part);
    if (i < pillParts.length - 1) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...sepColor);
      doc.text(separator, pillCurX, pillTextY);
      pillCurX += doc.getTextWidth(separator);
    }
  });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(marginL, 22, pageW - marginR, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const metaStartY = 30;
  const metaLines  = [
    ["Audit Type:",   audit.auditType || "—"],
    ["Framework:",    audit.frameworkCode || "—"],
    ["POC:",          resolveAssigneeName(audit.poc, users)],
    ["Lead Auditor:", resolveAssigneeName(audit.leadAuditor, users)],
    ["Opening:",      formatDate(audit.openingMeetingDate)],
    ["Closure:",      formatDate(audit.closureMeetingDate)],
  ];
  metaLines.forEach(([label, value], i) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(label, marginL, metaStartY + i * 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(value, marginL + 30, metaStartY + i * 6);
  });

  const controlsStartY = metaStartY + metaLines.length * 6 + 6;

  const controlsWithScoresAndCap = (audit.controls || []).filter((c) => {
    const hasDocScore      = c.docScore != null && c.docScore !== "";
    const hasPracticeScore = c.practiceScore != null && c.practiceScore !== "";
    const hasCap           = ncGaps.some(
      (g) => g.controlId === c.controlId && g.cap && Object.keys(g.cap).length > 0,
    );
    return hasDocScore && hasPracticeScore && hasCap;
  });

  const controlsRows = controlsWithScoresAndCap.map((c) => {
    const meta = apiControls.find((ac) => ac.controlId === c.controlId) || {};
    return [
      meta.clause || c.controlId,
      meta.label  || meta.clause || c.controlId,
      resolveAssigneeName(c.assignedTo, users),
      c.docScore,
      c.practiceScore,
    ];
  });

  autoTable(doc, {
    startY: controlsStartY + 4,
    body:   controlsRows,
    headStyles:         { fillColor: [37, 99, 235], textColor: 255, fontSize: 9, fontStyle: "bold" },
    bodyStyles:         { fontSize: 9 },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    rowPageBreak:       "avoid",
    margin:             { bottom: 18 },
    didDrawPage:        function () {},
  });

  let cursorY = doc.lastAutoTable.finalY + 10;
  if (cursorY + 14 > pageH - 18) { doc.addPage(); cursorY = 16; }

  const allFindingGaps = ncGaps;

  if (allFindingGaps.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("No findings recorded for this audit.", marginL, cursorY);
    cursorY += 8;
  } else {
    const findingsRows = allFindingGaps.map((gap) => {
      const clauseAndReq = `${gap.clause || "—"}\n${gap.question || "—"}`;
      return [gap.findings || "—", clauseAndReq, gap.overallFindings || "—"];
    });

    autoTable(doc, {
      startY: cursorY,
      head:   [["Type", "Clause & Requirement", "Overall Findings"]],
      body:   findingsRows,
      headStyles:         { fillColor: [109, 40, 217], textColor: 255, fontSize: 8, fontStyle: "bold" },
      bodyStyles:         { fontSize: 8, valign: "top", overflow: "linebreak", cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 243, 255] },
      columnStyles:       { 0: { cellWidth: 22 }, 1: { cellWidth: 80 }, 2: { cellWidth: "auto" } },
      rowPageBreak:       "avoid",
      showHead:           "everyPage",
      margin:             { bottom: 18 },
      didParseCell: function (data) {
        if (data.section === "body") {
          if (data.column.index === 0) {
            const FINDING_STYLES = {
              "Major NC":            { fill: [254, 226, 226], text: [153, 27, 27] },
              "Minor NC":            { fill: [255, 247, 237], text: [146, 64, 14] },
              "Conformance":         { fill: [220, 252, 231], text: [22, 101, 52] },
              "Noteworthy Practice": { fill: [209, 250, 229], text: [6, 95, 70] },
              "Observation":         { fill: [219, 234, 254], text: [29, 78, 216] },
              "OFI":                 { fill: [219, 234, 254], text: [29, 78, 216] },
            };
            const fs = FINDING_STYLES[data.cell.raw];
            if (fs) {
              data.cell.styles.fillColor = fs.fill;
              data.cell.styles.textColor = fs.text;
              data.cell.styles.fontStyle = "bold";
            }
          }
          if (data.cell.raw === "—") {
            data.cell.styles.textColor = [148, 163, 184];
            data.cell.styles.fontStyle = "italic";
          }
        }
      },
      didDrawPage: function () {},
    });
    cursorY = doc.lastAutoTable.finalY + 10;
  }

  if (cursorY + 10 > pageH - 18) { doc.addPage(); cursorY = 16; }

  const totalControls = controlsWithScoresAndCap.length;
  const totalScore    = controlsWithScoresAndCap.reduce((sum, c) => {
    return sum + parseInt(c.docScore || 0) + parseInt(c.practiceScore || 0);
  }, 0);
  const maxScore    = totalControls * 4;
  const pct         = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const isCompliant = totalControls === 0 || pct === 100;

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(p, totalPages);
  }

  doc.save(`${audit.auditType}_${audit.frameworkCode}_Report.pdf`);
};

// ─────────────────────────────────────────────
// AUDIT REPORTS MODAL
// ─────────────────────────────────────────────

export function AuditReportsModal(props) {
  var onClose = props.onClose;

  // ── State ─────────────────────────────────────────────────────────────
  var [audits,           setAudits]           = useState([]);
  var [loading,          setLoading]          = useState(true);
  var [selected,         setSelected]         = useState(null);
  var [users,            setUsers]            = useState([]);
  var [ncGaps,           setNcGaps]           = useState([]);
  var [ncLoading,        setNcLoading]        = useState(false);
  var [organizationName, setOrganizationName] = useState("—");

  var [sessionUser] = useState(function () {
    try {
      const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  // ── Framework context ─────────────────────────────────────────────────
  var fwCtx              = useFramework();
  var selectedFrameworks = fwCtx.selectedFrameworks;   // label strings e.g. "ISO 27001"
  var isAllSelected      = fwCtx.isAllSelected;
  var availableFrameworks = fwCtx.availableFrameworks; // [{ id, code, label, color, ... }]

  // Derived maps — no hardcoded framework names
  var fwLabelToCode = React.useMemo(function () {
    return Object.fromEntries(availableFrameworks.map(function (fw) {
      return [fw.id, fw.code];
    }));
  }, [availableFrameworks]);

  // code → { label, color, bg, border }  (replaces CODE_META + AUDIT_FW_BADGE)
  var fwMetaByCode = React.useMemo(function () {
    var map = {};
    availableFrameworks.forEach(function (fw) {
      var m = hexToMeta(fw.color);
      map[fw.code] = { label: fw.label, color: m.color, bg: m.bg, border: m.border };
    });
    return map;
  }, [availableFrameworks]);

  // label → { bg, color, border }  (replaces AUDIT_FW_BADGE — used in filter banner)
  var fwBadgeByLabel = React.useMemo(function () {
    var map = {};
    availableFrameworks.forEach(function (fw) {
      var m = hexToMeta(fw.color);
      map[fw.id] = { bg: m.bg, color: m.color, border: m.border };
    });
    return map;
  }, [availableFrameworks]);

  // Active filter set — replaces AUDIT_FW_CODE_MAP inline usage
  var activeCodes = React.useMemo(function () {
    if (isAllSelected) return null;
    var s = new Set();
    selectedFrameworks.forEach(function (label) {
      var code = fwLabelToCode[label];
      if (code) s.add(code);
    });
    return s;
  }, [selectedFrameworks, isAllSelected, fwLabelToCode]);

  var displayedAudits = React.useMemo(function () {
    return audits.filter(function (a) { return auditMatchesFilter(a, activeCodes); });
  }, [audits, activeCodes]);

  var selectedFramework = selected ? selected.frameworkCode : null;
  var ctrlResult        = useControls(selectedFramework);
  var apiControls       = ctrlResult.controls;

  // ── Org name resolution ───────────────────────────────────────────────
  useEffect(function () {
    const localName = resolveOrganizationName(sessionUser);
    if (localName && localName !== "—") { setOrganizationName(localName); return; }
    if (!sessionUser) return;
    const orgId =
      sessionUser.organization && typeof sessionUser.organization === "object"
        ? sessionUser.organization._id || sessionUser.organization.id
        : sessionUser.organization;
    if (!orgId) return;
    fetchOrganizationById(orgId)
      .then(function (org) { if (org) setOrganizationName(org.name || org.title || "—"); })
      .catch(function () {});
  }, []);

  // ── Activity logging ──────────────────────────────────────────────────
  useEffect(function () {
    captureActivity({
      action: ACTIONS.CLICK,
      item:   [{ detail: "Audit · Viewed 'Reports' list" }],
      url:    "/gap-assessment",
    });
  }, []);

  useEffect(function () {
    if (selected) {
      captureActivity({
        action: ACTIONS.CLICK,
        item:   [{ detail: "Audit · Opened report view", auditId: selected.id, framework: selected.frameworkCode }],
        url:    "/gap-assessment",
      });
    }
  }, [selected?.id]);

  // ── Data loading ──────────────────────────────────────────────────────
  useEffect(function () {
    Promise.all([auditService.getAudits(), getAllUsers()])
      .then(function (results) {
        setAudits(
          (results[0] || []).filter(function (a) { return a.status !== "PLANNED"; }),
        );
        setUsers(results[1] || []);
        setLoading(false);
      })
      .catch(function () { setLoading(false); });
  }, []);

  // ── NC gaps loading ───────────────────────────────────────────────────
  useEffect(function () {
    if (!selected) return;
    setNcLoading(true);
    setNcGaps([]);
    gapService
      .getGaps()
      .then(function (allGaps) {
        var nc = (allGaps || []).filter(function (g) {
          return (
            String(g.auditId) === String(selected.id) &&
            g.findings &&
            g.findings !== ""
          );
        });
        setNcGaps(nc);
        setNcLoading(false);
      })
      .catch(function () { setNcLoading(false); });
  }, [selected]);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <Modal onClose={onClose} wide={true}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

        {/* ── FIXED HEADER ──────────────────────────────────────────── */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-slate-100">

            {/* Left: icon + title */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: "linear-gradient(135deg,#60a5fa,#2563eb)" }}
              >
                <FileText size={18} color="#fff" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800" style={{ margin: 0 }}>
                  Audit Reports
                </h2>
                <p className="text-xs text-slate-500" style={{ margin: 0 }}>
                  {selected
                    ? `${selected.auditType} — ${fwMetaByCode[selected.frameworkCode]?.label || selected.frameworkCode}`
                    : "View completed audit details"}
                </p>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2">
              {selected && (
                <button
                  onClick={function () { setSelected(null); setNcGaps([]); }}
                  className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-200 transition-colors"
                  style={{ border: "none", cursor: "pointer" }}
                >
                  ← Back to List
                </button>
              )}

              {selected && (
                <button
                  onClick={function () {
                    captureActivity({
                      action: ACTIONS.CLICK,
                      item:   [{ detail: "Audit · Downloaded report", auditId: selected.id, framework: selected.frameworkCode }],
                      url:    "/gap-assessment",
                    });
                    handleDownloadReport(selected, apiControls, users, ncGaps, organizationName);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  style={{ border: "none", cursor: "pointer", boxShadow: "0 1px 4px rgba(37,99,235,.35)" }}
                >
                  <Download size={13} />
                  Download Report
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                style={{ border: "none", cursor: "pointer", background: "transparent" }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ────────────────────────────────────── */}
        <div
          className="px-7 py-5"
          style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`.__ar_body::-webkit-scrollbar{display:none}`}</style>

          {loading && <Spinner />}

          {/* ── LIST VIEW ─────────────────────────────────────────── */}
          {!selected && !loading && (
            <div className="space-y-2.5">

              {/* Framework filter banner */}
              {!isAllSelected && (
                <div
                  className="flex items-start gap-2.5 px-3.5 py-2.5 mb-4 rounded-xl border border-blue-200"
                  style={{
                    background:  "linear-gradient(135deg,#eff6ff,#f0f9ff)",
                    borderLeft:  "4px solid #3b82f6",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#3b82f6", marginTop: 2 }}
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M5.5 1v4M5.5 7.5v.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-blue-800 mb-1">Framework Filter Active</div>
                    <div className="flex items-center gap-1.5 flex-wrap text-xs text-blue-900">
                      <span>Showing audits for</span>
                      {selectedFrameworks.map(function (label, i) {
                        // Use dynamic badge derived from availableFrameworks
                        var s = fwBadgeByLabel[label] || { bg: "#f1f5f9", color: "#334155", border: "#cbd5e1" };
                        return (
                          <span key={label} className="inline-flex items-center gap-1">
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{
                                background: s.bg,
                                color:      s.color,
                                border:     "1px solid " + s.border,
                              }}
                            >
                              {label}
                            </span>
                            {i < selectedFrameworks.length - 1 && (
                              <span className="text-slate-400">+</span>
                            )}
                          </span>
                        );
                      })}
                      <span className="text-slate-400">·</span>
                      <span className="font-bold text-blue-700">
                        {displayedAudits.length} of {audits.length} audit{audits.length !== 1 ? "s" : ""} shown
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Audit cards */}
              {displayedAudits.map(function (audit) {
                var badge  = statusBadge(audit.status);
                // Dynamic lookup — falls back gracefully for unknown codes
                var fwMeta = fwMetaByCode[audit.frameworkCode] || {
                  label: audit.frameworkCode, color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0",
                };
                var controls   = audit.controls || [];
                var totalScore = controls.reduce(function (sum, c) {
                  return (
                    sum
                    + (c.docScore      != null && c.docScore      !== "" ? parseInt(c.docScore)      : 0)
                    + (c.practiceScore != null && c.practiceScore !== "" ? parseInt(c.practiceScore) : 0)
                  );
                }, 0);
                var maxScore = controls.length * 4;
                var pct      = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

                return (
                  <div
                    key={audit.id}
                    className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: badge.color }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            {displayStatus(audit.status)}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{audit.auditType}</span>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: fwMeta.bg, color: fwMeta.color, border: `1px solid ${fwMeta.border}` }}
                          >
                            {fwMeta.label}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-slate-800 mb-0.5" style={{ margin: 0 }}>
                          {audit.auditType} — {fwMeta.label}
                        </p>

                        <div className="flex flex-wrap gap-x-3 text-xs text-slate-400" style={{ marginTop: 2 }}>
                          <span>
                            POC: {resolveAssigneeName(audit.poc, users)}
                            {audit.leadAuditor
                              ? " · Lead: " + resolveAssigneeName(audit.leadAuditor, users)
                              : ""}
                          </span>
                          <span>
                            {formatDate(audit.openingMeetingDate)} → {formatDate(audit.closureMeetingDate)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 mt-2.5 pt-2.5 border-t border-slate-100">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width:      pct + "%",
                                background: pct === 100 ? "#34d399" : "#60a5fa",
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-bold flex-shrink-0"
                            style={{ color: pct === 100 ? "#059669" : "#2563eb" }}
                          >
                            {pct === 100 ? "Compliant (100%)" : `Non-Compliant (${pct}%)`}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={function () { setSelected(audit); }}
                        className="flex-shrink-0 px-3.5 py-1.5 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors"
                        style={{
                          background: "#eff6ff",
                          color:      "#2563eb",
                          border:     "1px solid #bfdbfe",
                          cursor:     "pointer",
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Empty state */}
              {displayedAudits.length === 0 && (
                <div className="text-center py-12">
                  <FileText size={36} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
                  <p className="text-slate-500 font-medium" style={{ margin: "0 0 4px" }}>
                    No completed audits yet
                  </p>
                  <p className="text-slate-400 text-sm" style={{ margin: 0 }}>
                    Audits with status In Progress or Completed will appear here
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── DETAIL VIEW ───────────────────────────────────────── */}
          {selected && (
            <div className="space-y-5">

              {/* Controls */}
              <div>
                <h4
                  className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3"
                  style={{ margin: "0 0 12px" }}
                >
                  Controls
                </h4>
                <div className="flex flex-col gap-2">
                  {(selected.controls || []).map(function (ctrl) {
                    var meta = apiControls.find(function (c) { return c.controlId === ctrl.controlId; }) || {};
                    return (
                      <div
                        key={ctrl.controlId}
                        className="flex justify-between items-center border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                        style={{ padding: "10px 14px" }}
                      >
                        <div>
                          <span
                            className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"
                            style={{ marginRight: 8 }}
                          >
                            {meta.clause || ctrl.controlId}
                          </span>
                          <span className="text-sm text-slate-700">
                            {meta.label || meta.clause || ctrl.controlId}
                          </span>
                          <p className="text-xs text-slate-400" style={{ margin: "4px 0 0" }}>
                            Assigned: {resolveAssigneeName(ctrl.assignedTo, users)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="text-xs text-slate-500" style={{ margin: 0 }}>
                            Doc: <strong className="text-slate-700">{ctrl.docScore || "—"}</strong>
                          </p>
                          <p className="text-xs text-slate-500" style={{ margin: 0 }}>
                            Practice: <strong className="text-slate-700">{ctrl.practiceScore || "—"}</strong>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NC Findings + CAP */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} color="#dc2626" />
                  <h4
                    className="text-xs font-bold text-slate-500 uppercase tracking-wider"
                    style={{ margin: 0 }}
                  >
                    Non-Conformities &amp; Corrective Action Plans
                  </h4>
                  {!ncLoading && (
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        background: ncGaps.length > 0 ? "#fef2f2" : "#f1f5f9",
                        color:      ncGaps.length > 0 ? "#991b1b" : "#64748b",
                        border:     "1px solid " + (ncGaps.length > 0 ? "#fecaca" : "#e2e8f0"),
                      }}
                    >
                      {ncGaps.length} found
                    </span>
                  )}
                </div>

                {ncLoading && <Spinner />}

                {!ncLoading && ncGaps.length === 0 && (
                  <p className="text-sm text-slate-400" style={{ fontStyle: "italic" }}>
                    No Major NC or Minor NC findings for this audit.
                  </p>
                )}

                {!ncLoading &&
                  ncGaps.map(function (gap, idx) {
                    var isMajor    = gap.findings === "Major NC";
                    var cardBorder = isMajor ? "#fecaca" : "#fed7aa";
                    var cardBg     = isMajor ? "#fff5f5" : "#fffbf5";
                    var cap        = gap.cap || null;

                    return (
                      <div
                        key={gap._id || gap.id || idx}
                        className="rounded-xl overflow-hidden mb-3"
                        style={{
                          border:     "1px solid " + cardBorder,
                          borderLeft: "4px solid " + (isMajor ? "#ef4444" : "#f97316"),
                        }}
                      >
                        {/* Gap header */}
                        <div style={{ padding: "12px 14px", background: cardBg }}>
                          <div className="flex gap-2 mb-2 items-center flex-wrap">
                            <span
                              className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                              style={{ border: "1px solid #e2e8f0" }}
                            >
                              {gap.clause}
                            </span>
                            <NcBadge value={gap.findings} />
                            {gap.totalScore != null && (
                              <span className="text-xs font-semibold text-slate-500 ml-auto">
                                Score: {gap.totalScore} / 4
                              </span>
                            )}
                            {cap ? (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
                                ✓ CAP attached
                              </span>
                            ) : (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                No CAP yet
                              </span>
                            )}
                          </div>
                          <p
                            className="text-sm font-semibold text-slate-800 leading-relaxed"
                            style={{ margin: "0 0 10px" }}
                          >
                            {gap.question}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: "Doc Remarks",      val: gap.docRemarks,      color: "#6366f1" },
                              { label: "Practice Remarks", val: gap.practiceRemarks, color: "#10b981" },
                            ].map(function (rm) {
                              return (
                                <div
                                  key={rm.label}
                                  className="bg-white border border-slate-200 rounded-lg"
                                  style={{ padding: "8px 10px" }}
                                >
                                  <p
                                    className="text-xs font-bold uppercase tracking-wide"
                                    style={{ color: rm.color, margin: "0 0 3px" }}
                                  >
                                    {rm.label}
                                  </p>
                                  <p
                                    className="text-xs leading-relaxed"
                                    style={{
                                      margin:    0,
                                      color:     rm.val ? "#334155" : "#94a3b8",
                                      fontStyle: rm.val ? "normal" : "italic",
                                    }}
                                  >
                                    {rm.val || "No remarks recorded"}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* CAP section */}
                        {cap && (
                          <div
                            style={{
                              padding:    "12px 14px",
                              background: "#f5f3ff",
                              borderTop:  "1px solid #ddd6fe",
                            }}
                          >
                            <div className="flex items-center gap-1.5 mb-2">
                              <Target size={13} color="#6d28d9" />
                              <span className="text-xs font-bold text-violet-700 uppercase tracking-wide">
                                Corrective Action Plan
                              </span>
                              <CapStatusPill status={cap.status} />
                            </div>
                            <p
                              className="text-sm text-purple-900 leading-relaxed"
                              style={{
                                margin:    "0 0 10px",
                                fontStyle: cap.rootCause ? "normal" : "italic",
                              }}
                            >
                              {cap.rootCause || "Root cause not yet recorded."}
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { label: "Assigned To", val: resolveAssigneeName(cap.assignedTo, users) },
                                { label: "Due Date",    val: cap.dueDate || "—" },
                                {
                                  label: "Priority",
                                  val:   cap.priority || "—",
                                  color:
                                    cap.priority === "High"   ? "#dc2626" :
                                    cap.priority === "Medium" ? "#d97706" : "#16a34a",
                                },
                              ].map(function (item) {
                                return (
                                  <div
                                    key={item.label}
                                    className="bg-violet-100 rounded-lg"
                                    style={{ padding: "8px 10px" }}
                                  >
                                    <p
                                      className="text-xs font-bold text-violet-600 uppercase tracking-wide"
                                      style={{ margin: "0 0 2px" }}
                                    >
                                      {item.label}
                                    </p>
                                    <p
                                      className="text-sm font-bold"
                                      style={{ margin: 0, color: item.color || "#4c1d95" }}
                                    >
                                      {item.val}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* No CAP nudge */}
                        {!cap && (
                          <div
                            style={{
                              padding:    "10px 14px",
                              background: "#fffbeb",
                              borderTop:  "1px solid #fde68a",
                            }}
                          >
                            <p
                              className="text-xs text-amber-800"
                              style={{ margin: 0, fontStyle: "italic" }}
                            >
                              No CAP created yet. Use Review Findings → Create CAP to add one.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* ── PINNED CLOSE FOOTER ────────────────────────────────────── */}
        <div
          className="flex-shrink-0 border-t border-slate-100"
          style={{ padding: "12px 28px 24px" }}
        >
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-semibold text-slate-600"
            style={{ padding: "11px 0", border: "none", cursor: "pointer" }}
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
}

export default AuditReportsModal;