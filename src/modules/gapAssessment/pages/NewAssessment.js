// src/modules/gapAssessment/pages/NewAssessment.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import controlService from "../services/controlService";
import documentationService from "../../documentation/services/documentationService";
import {
  Upload,
  X,
  ClipboardCheck,
  Trash,
  Trash2,
  Eye,
  CheckCircle,
  Save,
  ChevronDown,
  Tag,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import gapService from "../services/gapService";
import auditService from "../services/auditService";
import { captureActivity, ACTIONS } from "../../../services/activities";
import Evidence_Modal from "../../integrations/evidencemodal";

import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";

const SOC2_EXCLUDED_FOR_3_CRITERIA = ["Privacy"];

const buildCategoryTree = (rows) => {
  const categoryTree = {};
  rows.forEach((row) => {
    const cat = row.category || "Uncategorized";
    if (!categoryTree[cat]) categoryTree[cat] = {};
    const parts = row.clause.split(".");
    let cursor = categoryTree[cat];
    let currentNode = null;
    for (let depth = 1; depth <= parts.length; depth++) {
      const key = parts.slice(0, depth).join(".");
      if (!cursor[key])
        cursor[key] = { label: key, children: {}, directRows: [] };
      currentNode = cursor[key];
      cursor = currentNode.children;
    }
    currentNode.directRows.push(row);
  });
  return categoryTree;
};

function getCategoryOrder(frameworkCode, category) {
  if (frameworkCode === "SOC2") {
    const SOC2_ORDER = [
      "Common Criteria",
      "Confidentiality",
      "Availability",
      "Process Integrity",
      "Privacy",
    ];
    const idx = SOC2_ORDER.indexOf(category);
    return idx === -1 ? 99 : idx;
  }
  const ISO_ORDER = [
    "ISMS Core",
    "PIMS Core",
    "AI Management System",
    "AI Risk Management",
    "AI Objectives",
    "Organizational Controls",
    "People Controls",
    "Physical Controls",
    "Technological Controls",
    "PIMS Controller Controls",
    "PIMS Processor Controls",
    "Annex A",
    "Annex B",
  ];
  const idx = ISO_ORDER.indexOf(category);
  return idx === -1 ? 50 : idx;
}

const collectRows = (node) => [
  ...(node.directRows || []),
  ...Object.values(node.children || {}).flatMap(collectRows),
];

const collectCategoryRows = (clauseMap) =>
  Object.values(clauseMap).flatMap(collectRows);

const computeScore = (rows) => {
  const answered = rows.filter(
    (r) => r.docScore !== "" || r.practiceScore !== "",
  );
  if (!answered.length) return null;
  const total = answered.reduce((s, r) => s + (r.totalScore || 0), 0);
  return ((total / (answered.length * 4)) * 100).toFixed(2);
};

const computeFilled = (rows) => ({
  answered: rows.filter(
    (r) =>
      r.documentEvidence ||
      r.practiceEvidence ||
      r.documentNotes ||
      r.practiceNotes,
  ).length,
  total: rows.length,
});

const gatherKeys = (clauseMap) => {
  const keys = [];
  const walk = (children) => {
    Object.entries(children || {}).forEach(([k, n]) => {
      keys.push(k);
      walk(n.children);
    });
  };
  walk(clauseMap);
  return keys;
};

const CATEGORY_COLORS = {
  "ISMS Core": {
    bg: "bg-indigo-700",
    text: "text-white",
    hover: "hover:bg-indigo-800",
  },
  "Organizational Controls": {
    bg: "bg-violet-700",
    text: "text-white",
    hover: "hover:bg-violet-800",
  },
  "People Controls": {
    bg: "bg-sky-700",
    text: "text-white",
    hover: "hover:bg-sky-800",
  },
  "Physical Controls": {
    bg: "bg-teal-700",
    text: "text-white",
    hover: "hover:bg-teal-800",
  },
  "Technological Controls": {
    bg: "bg-cyan-700",
    text: "text-white",
    hover: "hover:bg-cyan-800",
  },
  "PIMS Core": {
    bg: "bg-emerald-700",
    text: "text-white",
    hover: "hover:bg-emerald-800",
  },
  "PIMS Controller Controls": {
    bg: "bg-amber-600",
    text: "text-white",
    hover: "hover:bg-amber-700",
  },
  "PIMS Processor Controls": {
    bg: "bg-orange-600",
    text: "text-white",
    hover: "hover:bg-orange-700",
  },
  Uncategorized: {
    bg: "bg-gray-600",
    text: "text-white",
    hover: "hover:bg-gray-700",
  },
  "Common Criteria": {
    bg: "bg-green-800",
    text: "text-white",
    hover: "hover:bg-green-900",
  },
  Confidentiality: {
    bg: "bg-green-700",
    text: "text-white",
    hover: "hover:bg-green-800",
  },
  Availability: {
    bg: "bg-green-600",
    text: "text-white",
    hover: "hover:bg-green-700",
  },
  "Process Integrity": {
    bg: "bg-emerald-600",
    text: "text-white",
    hover: "hover:bg-emerald-700",
  },
  Privacy: {
    bg: "bg-pink-700",
    text: "text-white",
    hover: "hover:bg-pink-800",
  },
  "AI Management System": {
    bg: "bg-orange-700",
    text: "text-white",
    hover: "hover:bg-orange-800",
  },
  "AI Risk Management": {
    bg: "bg-orange-600",
    text: "text-white",
    hover: "hover:bg-orange-700",
  },
  "AI Objectives": {
    bg: "bg-amber-700",
    text: "text-white",
    hover: "hover:bg-amber-800",
  },
  "Annex A": {
    bg: "bg-amber-600",
    text: "text-white",
    hover: "hover:bg-amber-700",
  },
  "Annex B": {
    bg: "bg-yellow-700",
    text: "text-white",
    hover: "hover:bg-yellow-800",
  },
};
const getCatColor = (cat) =>
  CATEGORY_COLORS[cat] || CATEGORY_COLORS["Uncategorized"];

// ─── MLD Document list ────────────────────────────────────────────────────────
const MldDocList = ({ docs, onView }) => {
  if (!docs || docs.length === 0) return null;
  return (
    <div className="mb-1.5">
      <p className="text-[9px] font-bold text-purple-600 uppercase tracking-widest mb-1 flex items-center gap-0.5">
        <FileText size={9} /> MLD ({docs.length})
      </p>
      <div className="flex flex-col gap-0.5">
        {docs.map((doc, i) => (
          <div
            key={doc._id || i}
            className="bg-purple-50 border border-purple-200 rounded px-1.5 py-1"
          >
            <div className="flex items-center gap-1">
              <FileText size={10} className="text-purple-400 flex-shrink-0" />
              <span className="text-[10px] text-purple-800 font-medium truncate flex-1">
                {doc.docName}
              </span>
              {doc.url ? (
                <button
                  type="button"
                  onClick={() => onView(doc)}
                  className="text-[9px] text-purple-600 hover:text-purple-800 flex-shrink-0 flex items-center gap-0.5 font-semibold"
                >
                  <Eye size={9} /> View
                </button>
              ) : (
                <span className="text-[9px] text-gray-400 italic flex-shrink-0">
                  No file
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 pl-3.5">
              {doc.uploaderName && (
                <span className="text-[9px] text-purple-400">
                  by {doc.uploaderName}
                </span>
              )}
              {doc.version && (
                <span className="text-[9px] text-purple-300">
                  v{doc.version}
                </span>
              )}
              {doc.approvalDate ? (
                <span className="text-[9px] text-green-600 font-semibold">
                  ✓ Approved
                </span>
              ) : doc.url ? (
                <span className="text-[9px] text-amber-500">Pending</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Greyed cell ──────────────────────────────────────────────────────────────
const GreyedCell = ({ label }) => (
  <td className="border px-2 py-1.5 align-top bg-gray-50 select-none">
    <div className="flex items-center justify-center opacity-30 min-h-[32px]">
      <span className="text-[9px] text-gray-400 italic text-center">
        {label}
      </span>
    </div>
  </td>
);

// ─── Compact upload button ────────────────────────────────────────────────────
const UploadBtn = ({ color = "blue", label, onChange }) => (
  <label
    className={`cursor-pointer inline-flex items-center gap-0.5 text-[9px] font-bold
    text-${color}-600 hover:text-${color}-800 bg-${color}-50 hover:bg-${color}-100
    border border-${color}-200 hover:border-${color}-400 rounded px-1.5 py-0.5
    transition-colors w-fit`}
  >
    <Upload size={8} /> {label}
    <input type="file" className="hidden" onChange={onChange} />
  </label>
);

// ─── Row Table ────────────────────────────────────────────────────────────────
const RowTable = ({
  rows,
  isAuditor,
  setSelectedDoc,
  handleInputChange,
  handleFileChange,
  handleDeleteFile,
  handleNotesBlur,
  handleAuditorChange,
  mldDocsByControlCode,
  showDocEvidence,
  showPracticeEvidence,
  setEvidenceModal,
  evidenceModal,
  complianceEvidenceMap,
}) => {
  const getMldViewUrl = (doc) => {
    if (!doc?.url) return null;
    if (doc.url.startsWith("http")) return doc.url;
    return `${process.env.NEXT_PUBLIC_SP}/doc-service${doc.url.startsWith("/") ? "" : "/"}${doc.url}`;
  };

  const getCloudEntries = (clause) => {
    const key = clause?.startsWith("A.") ? clause.substring(2) : clause;
    const entries =
      complianceEvidenceMap?.[key] || complianceEvidenceMap?.[clause] || [];
    return entries.filter((e) => e.evidence);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
      <table className="w-max min-w-full text-xs border-collapse table-fixed">
        <thead>
          <tr className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200">
            <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-600 uppercase tracking-wider min-w-[300px] w-[300px]">
              Requirement
            </th>
            <th className="px-3 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider min-w-[250px] w-[250px]">
              Document Evidence
            </th>
            <th
              className={`px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider min-w-[250px] w-[250px] ${!showPracticeEvidence ? "text-slate-400 bg-slate-50" : "text-slate-600"}`}
            >
              Practice Evidence
              {!showPracticeEvidence && (
                <span className="block text-[8px] font-medium italic normal-case mt-0.5">
                  N/A — Type 1
                </span>
              )}
            </th>
            {isAuditor && (
              <>
                <th className="px-2 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider min-w-[160px] w-[160px]">
                  Document Score
                </th>
                <th
                  className={`px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider min-w-[160px] w-[160px] ${!showPracticeEvidence ? "text-slate-400 bg-slate-50" : "text-slate-600"}`}
                >
                  Practice Score
                </th>
                <th className="px-2 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider w-[50px]">
                  Total
                </th>
                <th className="px-2 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider min-w-[130px] w-[130px]">
                  Document Remarks
                </th>
                <th
                  className={`px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider min-w-[130px] w-[130px] ${!showPracticeEvidence ? "text-slate-400 bg-slate-50" : "text-slate-600"}`}
                >
                  Practice Remarks
                </th>
                <th className="px-2 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider min-w-[220px] w-[220px]">
                  Findings *
                </th>
                <th className="px-2 py-2.5 text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider w-[110px]">
                  Overall Findings
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const mldDocs = mldDocsByControlCode?.[row.clause] || [];
            const cloudEntries = getCloudEntries(row.clause);
            const missingFinding =
              isAuditor && (!row.findings || row.findings === "");

            return (
              <tr
                key={row.idx}
                className={`border-b border-slate-100 transition-all duration-200 hover:shadow-sm ${missingFinding ? "bg-red-50/50 hover:bg-red-100/60" : "hover:bg-blue-50/30"}`}
              >
                {/* ── Requirement ── */}
                <td className="px-3 py-3 align-top border-r border-slate-100/50">
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {row.question}
                  </p>
                  {missingFinding && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                      ⚠ Finding required
                    </span>
                  )}
                </td>

                {/* ── Document Evidence ── */}
                <td className="border-r border-gray-100 px-2 py-1.5 align-top">
                  <div className="flex flex-col gap-1">
                    {/* MLD docs */}
                    {mldDocs.length > 0 && (
                      <MldDocList
                        docs={mldDocs}
                        onView={(doc) => {
                          const url = getMldViewUrl(doc);
                          if (url) setSelectedDoc(url);
                        }}
                      />
                    )}

                    {/* Uploaded doc file */}
                    {row.documentEvidence && (
                      <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                        <FileText
                          size={9}
                          className="text-blue-400 flex-shrink-0"
                        />
                        <span className="text-[9px] text-blue-700 font-medium flex-1 truncate">
                          Uploaded
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(row.documentEvidence)}
                          className="text-[9px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                        >
                          <Eye size={9} /> View
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteFile(row.idx, "documentEvidence")
                          }
                          className="text-[9px] text-red-400 hover:text-red-600 font-semibold flex items-center gap-0.5"
                        >
                          <Trash2 size={9} />
                        </button>
                      </div>
                    )}

                    {!mldDocs.length && !row.documentEvidence && (
                      <span className="text-[10px] text-slate-400 italic">No evidence yet</span>
                    )}
                  </div>
                </td>

                {/* ── Practice Evidence ── */}
                {showPracticeEvidence ? (
                  <td className="px-3 py-3 align-top border-r border-slate-100/50">
                    <div className="flex flex-col gap-1.5">
                      {/* Cloud evidence pills */}
                      {cloudEntries.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1">
                            ☁ Cloud ({cloudEntries.length})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {cloudEntries.map((entry, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() =>
                                  setEvidenceModal({
                                    open: true,
                                    data: entry.evidence,
                                  })
                                }
                                title={entry.metricName}
                                className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-600 bg-white border border-blue-200 shadow-sm rounded-full px-2 py-0.5 hover:bg-blue-50 hover:border-blue-300 hover:shadow transition-all"
                              >
                                <Eye size={10} />
                                {cloudEntries.length > 1
                                  ? `E${i + 1}`
                                  : "Evidence"}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Uploaded practice file */}
                      {row.practiceEvidence && (
                        <div className="flex items-center gap-1.5 bg-green-50/50 border border-green-200 rounded-md px-2 py-1 shadow-sm">
                          <FileText
                            size={10}
                            className="text-green-500 flex-shrink-0"
                          />
                          <span className="text-[10px] text-green-700 font-semibold flex-1 truncate">
                            Uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedDoc(row.practiceEvidence)}
                            className="text-[10px] text-green-600 hover:text-green-800 font-bold flex items-center gap-0.5 transition-colors"
                          >
                            <Eye size={10} /> View
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteFile(row.idx, "practiceEvidence")
                            }
                            className="text-[10px] text-red-400 hover:text-red-600 ml-1 transition-colors"
                          >
                            <Trash size={10} />
                          </button>
                        </div>
                      )}

                      {/* Practice Evidence fallback */}
                      {cloudEntries.length === 0 && !row.practiceEvidence && (
                        <span className="text-[10px] text-slate-400 italic">
                          No evidence yet
                        </span>
                      )}
                    </div>
                  </td>
                ) : (
                  <GreyedCell label="N/A — Type 1" />
                )}

                {/* ── Auditor columns ── */}
                {isAuditor && (
                  <>
                    {/* Doc Score */}
                    <td className="px-1.5 py-3 align-top border-r border-slate-100/50">
                      <select
                        value={row.docScore}
                        onChange={(e) =>
                          handleAuditorChange(
                            row.idx,
                            "docScore",
                            e.target.value,
                          )
                        }
                        className="w-full border border-slate-200 rounded-md shadow-sm text-[10px] px-1.5 py-1 bg-white hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all cursor-pointer whitespace-normal text-wrap break-words"
                        title={
                          row.docScore === "0"
                            ? "0 — Non Conformance"
                            : row.docScore === "1"
                              ? "1 — Partial Conformance"
                              : row.docScore === "2"
                                ? "2 — Conformance"
                                : "NA"
                        }
                      >
                        <option value="" className="whitespace-normal break-words text-wrap">NA</option>
                        <option value="0" className="whitespace-normal break-words text-wrap" title="0 — Non Conformance">0 — Non Conformance</option>
                        <option value="1" className="whitespace-normal break-words text-wrap" title="1 — Partial Conformance">1 — Partial Conformance</option>
                        <option value="2" className="whitespace-normal break-words text-wrap" title="2 — Conformance">2 — Conformance</option>
                      </select>
                    </td>

                    {/* Practice Score */}
                    {showPracticeEvidence ? (
                      <td className="px-1.5 py-3 align-top border-r border-slate-100/50">
                        <select
                          value={row.practiceScore}
                          onChange={(e) =>
                            handleAuditorChange(
                              row.idx,
                              "practiceScore",
                              e.target.value,
                            )
                          }
                          className="w-full border border-slate-200 rounded-md shadow-sm text-[10px] px-1.5 py-1 bg-white hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all cursor-pointer whitespace-normal text-wrap break-words"
                          title={
                            row.practiceScore === "0"
                              ? "0 — Non Conformance"
                              : row.practiceScore === "1"
                                ? "1 — Partial Conformance"
                                : row.practiceScore === "2"
                                  ? "2 — Conformance"
                                  : "NA"
                          }
                        >
                          <option value="" className="whitespace-normal break-words text-wrap">NA</option>
                          <option value="0" className="whitespace-normal break-words text-wrap" title="0 — Non Conformance">0 — Non Conformance</option>
                          <option value="1" className="whitespace-normal break-words text-wrap" title="1 — Partial Conformance">1 — Partial Conformance</option>
                          <option value="2" className="whitespace-normal break-words text-wrap" title="2 — Conformance">2 — Conformance</option>
                        </select>
                      </td>
                    ) : (
                      <GreyedCell label="—" />
                    )}

                    {/* Total Score */}
                    <td className="px-1.5 py-3 text-center align-top border-r border-slate-100/50">
                      <span
                        className={`inline-flex items-center justify-center min-w-[24px] h-[24px] text-[11px] font-bold rounded-md shadow-sm ${row.totalScore >= 3
                          ? "text-green-700 bg-green-50 border border-green-200"
                          : row.totalScore >= 1
                            ? "text-amber-700 bg-amber-50 border border-amber-200"
                            : row.totalScore === 0 &&
                              (row.docScore !== "" ||
                                row.practiceScore !== "")
                              ? "text-red-700 bg-red-50 border border-red-200"
                              : "text-slate-500 bg-slate-50 border border-slate-200"
                          }`}
                      >
                        {row.totalScore}
                      </span>
                    </td>

                    {/* Doc Remarks */}
                    <td className="px-1.5 py-3 align-top border-r border-slate-100/50">
                      <textarea
                        value={row.docRemarks}
                        onChange={(e) =>
                          handleAuditorChange(
                            row.idx,
                            "docRemarks",
                            e.target.value,
                          )
                        }
                        className="w-full border border-slate-200 rounded-md shadow-sm text-[10px] px-2 py-1.5 resize-none bg-white hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                        rows={2}
                        placeholder="Doc notes…"
                      />
                    </td>

                    {/* Practice Remarks */}
                    {showPracticeEvidence ? (
                      <td className="px-1.5 py-3 align-top border-r border-slate-100/50">
                        <textarea
                          value={row.practiceRemarks}
                          onChange={(e) =>
                            handleAuditorChange(
                              row.idx,
                              "practiceRemarks",
                              e.target.value,
                            )
                          }
                          className="w-full border border-slate-200 rounded-md shadow-sm text-[10px] px-2 py-1.5 resize-none bg-white hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
                          rows={2}
                          placeholder="Practice notes…"
                        />
                      </td>
                    ) : (
                      <GreyedCell label="—" />
                    )}

                    {/* Findings */}
                    <td
                      className={`w-[110px] min-w-[110px] max-w-[110px] px-1 py-3 align-top border-r border-slate-100/50 ${missingFinding ? "bg-red-50/50" : ""}`}
                    >
                      {(() => {
                        const FINDINGS_OPTIONS = [
                          {
                            value: "",
                            label: "— Select —",
                            cls: "text-slate-400",
                          },
                          {
                            value: "Conformance",
                            label: "Conformance",
                            cls: "text-green-700 bg-green-50",
                          },
                          {
                            value: "Noteworthy Practice",
                            label: "Noteworthy Practice",
                            cls: "text-emerald-700 bg-emerald-50",
                          },
                          {
                            value: "Major Non Conformance",
                            label: "Major Non Conformance",
                            cls: "text-red-700 bg-red-50",
                          },
                          {
                            value: "Minor NC",
                            label: "Minor NC",
                            cls: "text-orange-700 bg-orange-50",
                          },
                          {
                            value: "Observation",
                            label: "Observation",
                            cls: "text-blue-700 bg-blue-50",
                          },
                          {
                            value: "OFI",
                            label: "OFI",
                            cls: "text-blue-700 bg-blue-50",
                          },
                        ];
                        const selected = FINDINGS_OPTIONS.find(
                          (o) => o.value === row.findings,
                        );
                        return (
                          <select
                            value={row.findings || ""}
                            onChange={(e) =>
                              handleAuditorChange(
                                row.idx,
                                "findings",
                                e.target.value,
                              )
                            }
                            className={`w-full border rounded-md shadow-sm text-[10px] px-1.5 py-1 font-semibold focus:outline-none transition-all cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 whitespace-normal text-wrap break-words ${missingFinding
                              ? "border-red-400 ring-1 ring-red-300 bg-red-50/80"
                              : selected
                                ? `${selected.cls} border-slate-200 hover:border-slate-300`
                                : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                          >
                            {FINDINGS_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        );
                      })()}
                    </td>

                    {/* Overall Findings */}
                    <td className="px-1 py-1.5 align-top">
                      <textarea
                        value={row.overallFindings || ""}
                        onChange={(e) =>
                          handleAuditorChange(
                            row.idx,
                            "overallFindings",
                            e.target.value,
                          )
                        }
                        placeholder="Overall narrative…"
                        className="w-full border border-gray-200 rounded text-[10px] px-1 py-0.5 resize-none focus:ring-1 focus:ring-blue-400 focus:outline-none"
                        rows={2}
                      />
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Clause tree ──────────────────────────────────────────────────────────────
const CLAUSE_HEADER = [
  "bg-blue-50 text-gray-700 hover:bg-blue-100 py-1.5",
  "bg-gray-50 text-gray-600 hover:bg-gray-100 py-1",
  "bg-white text-gray-500 hover:bg-gray-50 py-1",
  "bg-white text-gray-400 hover:bg-gray-50 py-0.5",
];
const CLAUSE_LABEL = [
  "text-xs font-semibold",
  "text-xs font-medium",
  "text-[11px] font-medium",
  "text-[11px] font-normal",
];
const CLAUSE_INDENT = [0, 0, 0, 0];

const ClauseNode = ({
  nodeKey,
  node,
  depth,
  expandedNodes,
  onToggle,
  tableProps,
  titleMap,
}) => {
  const isExpanded = expandedNodes[nodeKey] ?? true;
  const hasChildren = Object.keys(node.children || {}).length > 0;
  const title =
    titleMap[nodeKey] || node.directRows?.[0]?.standardRequirement || "";
  const hdrCls = CLAUSE_HEADER[Math.min(depth, CLAUSE_HEADER.length - 1)];
  const lblCls = CLAUSE_LABEL[Math.min(depth, CLAUSE_LABEL.length - 1)];
  const indentPx =
    (CLAUSE_INDENT[Math.min(depth, CLAUSE_INDENT.length - 1)] || 0) + 12;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(nodeKey)}
        style={{ paddingLeft: `${indentPx}px` }}
        className={`w-full text-left flex items-center gap-2 pr-3 transition-colors focus:outline-none ${hdrCls}`}
      >
        <span
          className={`flex-shrink-0 text-blue-300 transition-transform duration-150 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
        >
          <ChevronDown size={12} />
        </span>
        <span className={lblCls}>{node.label}</span>
        {title && (
          <span className="truncate text-[10px] text-gray-800 font-semibold ml-1">
            {title}
          </span>
        )}
      </button>
      {isExpanded && (
        <div>
          {hasChildren &&
            Object.entries(node.children)
              .sort(([a], [b]) =>
                a.localeCompare(b, undefined, { numeric: true }),
              )
              .map(([ck, cn]) => (
                <ClauseNode
                  key={ck}
                  nodeKey={ck}
                  node={cn}
                  depth={depth + 1}
                  expandedNodes={expandedNodes}
                  onToggle={onToggle}
                  tableProps={tableProps}
                  titleMap={titleMap}
                />
              ))}
          {node.directRows?.length > 0 && (
            <div className="border-t border-gray-100">
              <RowTable rows={node.directRows} {...tableProps} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CategoryBlock = ({
  category,
  clauseMap,
  expandedNodes,
  onToggle,
  tableProps,
  titleMap,
}) => {
  const catKey = `__cat__${category}`;
  const isExpanded = expandedNodes[catKey] ?? true;
  const colors = getCatColor(category);
  return (
    <div className="border-b-2 border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(catKey)}
        className={`w-full text-left flex items-center gap-2 px-3 py-2 transition-colors focus:outline-none ${colors.bg} ${colors.text} ${colors.hover}`}
      >
        <span
          className={`flex-shrink-0 transition-transform duration-150 ${isExpanded ? "rotate-0" : "-rotate-90"} opacity-70`}
        >
          <ChevronDown size={15} />
        </span>
        <Tag size={12} className="flex-shrink-0 opacity-60" />
        <span className="text-sm font-bold tracking-wide">{category}</span>
      </button>
      {isExpanded && (
        <div>
          {Object.entries(clauseMap)
            .sort(([a], [b]) =>
              a.localeCompare(b, undefined, { numeric: true }),
            )
            .map(([clauseKey, clauseNode]) => (
              <ClauseNode
                key={clauseKey}
                nodeKey={clauseKey}
                node={clauseNode}
                depth={0}
                expandedNodes={expandedNodes}
                onToggle={onToggle}
                tableProps={tableProps}
                titleMap={titleMap}
              />
            ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const NewAssessment = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [auditContext] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("cv_auditContext");
      if (stored) {
        sessionStorage.removeItem("cv_auditContext");
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to read audit context:", e);
    }
    return null;
  });
  const isAuditMode = !!(auditContext && auditContext.auditId);

  const [lastSaved, setLastSaved] = useState(Date.now());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const {
    user,
    mounted,
    isRoot,
    isPrivilegedRole,
    isViewingManagedOrg,
    effectiveOrgId,
    effectiveOrgIds,
    selectedChildOrg,
  } = useEffectiveOrg();
  const [savingAudit, setSavingAudit] = useState(false);
  const [auditSaveMsg, setAuditSaveMsg] = useState("");
  const [mldDocsByControlCode, setMldDocsByControlCode] = useState({});
  const [evidenceModal, setEvidenceModal] = useState({ open: false, data: [] });
  const [complianceEvidenceMap, setComplianceEvidenceMap] = useState({});

  // ── Fetch compliance evidence ─────────────────────────────────────────────
  useEffect(() => {
    if (!mounted || !user) return;
    const fetchComplianceEvidence = async () => {
      try {
        const orgId = effectiveOrgId;
        const tenantRes = await fetch(
          `https://api.calvant.com/user-service/api/organizations/${orgId}/tenant`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          },
        );
        const tenantId = await tenantRes.text();
        if (!tenantId) return;

        // ── Fetch compliance data + mappings in parallel ──────────────────
        const [
          compRes,
          soc2_27001Res,
          soc2_27701Res,
          ksa_27001Res,
          ksa_27701Res,
          ksa_soc2Res,
        ] = await Promise.all([
          fetch(
            `https://api.calvant.com/compliance-brain/compliance/controls?tenantId=${tenantId}`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            },
          )
            .then((r) => r.json())
            .catch(() => []),
          fetch(
            `https://api.calvant.com/framework/api/mappings/framework/SOC2/ISO27001`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            },
          )
            .then((r) => r.json())
            .catch(() => []),
          fetch(
            `https://api.calvant.com/framework/api/mappings/framework/SOC2/ISO27701`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            },
          )
            .then((r) => r.json())
            .catch(() => []),
          fetch(
            `https://api.calvant.com/framework/api/mappings/framework/KSA_PDPL/ISO27001`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            },
          )
            .then((r) => r.json())
            .catch(() => []),
          fetch(
            `https://api.calvant.com/framework/api/mappings/framework/KSA_PDPL/ISO27701`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            },
          )
            .then((r) => r.json())
            .catch(() => []),
          fetch(
            `https://api.calvant.com/framework/api/mappings/framework/KSA_PDPL/SOC2`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            },
          )
            .then((r) => r.json())
            .catch(() => []),
        ]);

        if (!Array.isArray(compRes)) return;

        // ── Build direct evidence lookup (iso27001/27701/42001) ───────────
        const directMap = {};
        compRes.forEach((item) => {
          if (!item.controlId || !item.evidence) return;
          const key = item.controlId.startsWith("A.")
            ? item.controlId.substring(2)
            : item.controlId;
          const entry = {
            metricName: `${item.cloud} - ${item.controlName}`,
            evidence: item.evidence,
            score: item.score ?? (item.compliant ? 100 : 0),
            frameworkCode: item.frameworkCode,
          };
          if (!directMap[key]) directMap[key] = [];
          directMap[key].push(entry);
          if (!directMap[item.controlId]) directMap[item.controlId] = [];
          directMap[item.controlId].push(entry);
        });

        // ── Build SOC2 mappings index: soc2Code → [{code, framework}] ─────
        const soc2Index = {};
        (soc2_27001Res || []).forEach((m) => {
          if (!soc2Index[m.sourceControlCode])
            soc2Index[m.sourceControlCode] = [];
          soc2Index[m.sourceControlCode].push({
            code: m.targetControlCode,
            framework: "ISO27001",
          });
        });
        (soc2_27701Res || []).forEach((m) => {
          if (!soc2Index[m.sourceControlCode])
            soc2Index[m.sourceControlCode] = [];
          soc2Index[m.sourceControlCode].push({
            code: m.targetControlCode,
            framework: "ISO27701",
          });
        });

        // ── Build KSA_PDPL mappings index ─────────────────────────────────
        const ksaIndex = {};
        (ksa_27001Res || []).forEach((m) => {
          if (!ksaIndex[m.sourceControlCode])
            ksaIndex[m.sourceControlCode] = [];
          ksaIndex[m.sourceControlCode].push({
            code: m.targetControlCode,
            framework: "ISO27001",
          });
        });
        (ksa_27701Res || []).forEach((m) => {
          if (!ksaIndex[m.sourceControlCode])
            ksaIndex[m.sourceControlCode] = [];
          ksaIndex[m.sourceControlCode].push({
            code: m.targetControlCode,
            framework: "ISO27701",
          });
        });
        (ksa_soc2Res || []).forEach((m) => {
          if (!ksaIndex[m.sourceControlCode])
            ksaIndex[m.sourceControlCode] = [];
          ksaIndex[m.sourceControlCode].push({
            code: m.targetControlCode,
            framework: "SOC2",
          });
        });

        // ── Helper: resolve mapped evidence for a control code ────────────
        const resolveMappedEvidence = (controlCode, mappingsIndex) => {
          const entries = mappingsIndex[controlCode] || [];
          const result = [];
          entries.forEach(
            ({ code: sourceCode, framework: sourceFramework }) => {
              const bareCode = sourceCode.startsWith("A.")
                ? sourceCode.substring(2)
                : sourceCode;
              const items = directMap[bareCode] || directMap[sourceCode] || [];
              items.forEach((item) => {
                if (item.evidence)
                  result.push({ ...item, sourceCode, sourceFramework });
              });
            },
          );
          return result;
        };

        // ── Build final map: direct + mapped ─────────────────────────────
        const map = { ...directMap };

        // Add SOC2 mapped evidence
        Object.keys(soc2Index).forEach((soc2Code) => {
          const mapped = resolveMappedEvidence(soc2Code, soc2Index);
          if (mapped.length > 0) {
            if (!map[soc2Code]) map[soc2Code] = [];
            mapped.forEach((e) => {
              if (!map[soc2Code].find((x) => x.metricName === e.metricName))
                map[soc2Code].push(e);
            });
          }
        });

        // Add KSA_PDPL mapped evidence
        Object.keys(ksaIndex).forEach((ksaCode) => {
          const mapped = resolveMappedEvidence(ksaCode, ksaIndex);
          if (mapped.length > 0) {
            if (!map[ksaCode]) map[ksaCode] = [];
            mapped.forEach((e) => {
              if (!map[ksaCode].find((x) => x.metricName === e.metricName))
                map[ksaCode].push(e);
            });
          }
        });

        setComplianceEvidenceMap(map);
      } catch (err) {
        console.error("Failed to fetch compliance evidence:", err);
      }
    };
    fetchComplianceEvidence();
  }, [mounted, user, effectiveOrgId]);

  const [selectedFramework, setSelectedFramework] = useState(
    isAuditMode ? auditContext.frameworkCode : "ISO27001",
  );
  const [soc2Type, setSoc2Type] = useState(
    isAuditMode ? auditContext.soc2Type || "" : "",
  );
  const [soc2Criteria, setSoc2Criteria] = useState(
    isAuditMode ? auditContext.soc2Criteria || "" : "",
  );
  const [soc2Confirmed, setSoc2Confirmed] = useState(isAuditMode);
  const isSoc2 = selectedFramework === "SOC2";

  useEffect(() => {
    if (!isSoc2) {
      setSoc2Type("");
      setSoc2Criteria("");
      setSoc2Confirmed(false);
    }
  }, [isSoc2]);

  const showDocEvidence = true;
  const showPracticeEvidence = !isSoc2 || soc2Type !== "Type1";

  const [expandedNodes, setExpandedNodes] = useState({});
  const toggleNode = useCallback((key) => {
    setExpandedNodes((prev) => ({ ...prev, [key]: !(prev[key] ?? true) }));
  }, []);

  const visibleRows = useMemo(() => {
    if (!isSoc2 || soc2Criteria !== "3") return rows;
    return rows.filter(
      (r) => !SOC2_EXCLUDED_FOR_3_CRITERIA.includes(r.category),
    );
  }, [rows, isSoc2, soc2Criteria]);

  const categoryTree = useMemo(
    () => buildCategoryTree(visibleRows),
    [visibleRows],
  );

  const allNodeKeys = useMemo(() => {
    const keys = [];
    Object.entries(categoryTree).forEach(([cat, clauseMap]) => {
      keys.push(`__cat__${cat}`);
      keys.push(...gatherKeys(clauseMap));
    });
    return keys;
  }, [categoryTree]);

  const expandAll = () =>
    setExpandedNodes(Object.fromEntries(allNodeKeys.map((k) => [k, true])));
  const collapseAll = () =>
    setExpandedNodes(Object.fromEntries(allNodeKeys.map((k) => [k, false])));

  const titleMap = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      if (!map[r.clause]) map[r.clause] = r.standardRequirement;
    });
    return map;
  }, [rows]);

  const getFormattedTime = useCallback(() => {
    const now = new Date(),
      savedTime = new Date(lastSaved);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const savedToday = new Date(
      savedTime.getFullYear(),
      savedTime.getMonth(),
      savedTime.getDate(),
    );
    if (savedToday >= today)
      return `Saved today at ${savedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (savedToday >= yesterday)
      return `Saved yesterday at ${savedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return `Saved ${savedTime.getDate()} ${savedTime.toLocaleDateString("en-US", { month: "short" })} at ${savedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }, [lastSaved]);

  const markUnsaved = useCallback(() => setHasUnsavedChanges(true), []);

  const handleManualSave = () => {
    setHasUnsavedChanges(false);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  };

  useEffect(() => {
    if (rows.length > 0 && user) setLastSaved(Date.now());
  }, [rows, user]);

  const isAuditor = user?.isAuditor || false;

  const getEffectiveDept = () => {
    if (Array.isArray(user?.departments) && user.departments.length > 0) {
      const dept = user.departments[0];
      return typeof dept === "string" ? dept : dept.name;
    }
    return user?.department?.name || "General";
  };

  useEffect(() => {
    if (!mounted || !isAuditor || !isAuditMode || !user || !selectedFramework) return;
    const fetchMldDocs = async () => {
      try {
        const [
          allDocs,
          soaEntries,
          soc2_27001Res,
          soc2_27701Res,
          ksa_27001Res,
          ksa_27701Res,
          ksa_soc2Res,
        ] = await Promise.all([
          documentationService.getDocuments().catch(() => []),
          documentationService.getSoAEntries().catch(() => []),
          fetch(
            `https://api.calvant.com/framework/api/mappings/framework/SOC2/ISO27001`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            },
          )
            .then((r) => r.json())
            .catch(() => []),
          fetch(
            `https://api.calvant.com/framework/api/mappings/framework/SOC2/ISO27701`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            },
          )
            .then((r) => r.json())
            .catch(() => []),
          fetch(
            `https://api.calvant.com/framework/api/mappings/framework/KSA_PDPL/ISO27001`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            },
          )
            .then((r) => r.json())
            .catch(() => []),
          fetch(
            `https://api.calvant.com/framework/api/mappings/framework/KSA_PDPL/ISO27701`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            },
          )
            .then((r) => r.json())
            .catch(() => []),
          fetch(
            `https://api.calvant.com/framework/api/mappings/framework/KSA_PDPL/SOC2`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            },
          )
            .then((r) => r.json())
            .catch(() => []),
        ]);

        const orgDocs = allDocs.filter(
          (d) => d.organization === effectiveOrgId && !d.deleted && d.url,
        );
        const orgSoas = soaEntries.filter(
          (s) => s.organization === effectiveOrgId,
        );

        // ── Build docsBySoaId ─────────────────────────────────────────────
        const docsBySoaId = {};
        orgDocs.forEach((doc) => {
          const sid = String(doc.soaId ?? "");
          if (!sid) return;
          if (!docsBySoaId[sid]) docsBySoaId[sid] = [];
          docsBySoaId[sid].push(doc);
        });
        Object.values(docsBySoaId).forEach((arr) =>
          arr.sort((a, b) => (b.version ?? 0) - (a.version ?? 0)),
        );

        // ── Build direct map: controlCode → docs ─────────────────────────
        const map = {};
        const addDocToMap = (code, doc) => {
          if (!code || !doc) return;
          if (!map[code]) map[code] = [];
          if (!map[code].find((d) => String(d._id) === String(doc._id))) {
            map[code].push({
              _id: doc._id,
              docName: doc.name || doc.url.split("/").pop(),
              url: doc.url,
              version: doc.version,
              uploaderName: doc.uploaderName,
              approvalDate: doc.approvalDate || null,
              nextApprovalDate: doc.nextApprovalDate || null,
            });
          }
        };

        orgSoas.forEach((soa) => {
          const code = String(soa.category || "").trim();
          if (!code) return;
          const sid = String(soa.id ?? "");
          const docsForThisSoa = docsBySoaId[sid] || [];
          if (docsForThisSoa.length === 0) return;
          docsForThisSoa.forEach((doc) => addDocToMap(code, doc));
        });

        // ── Build mappings indexes ────────────────────────────────────────
        const soc2Index = {};
        (soc2_27001Res || []).forEach((m) => {
          if (!soc2Index[m.sourceControlCode])
            soc2Index[m.sourceControlCode] = [];
          soc2Index[m.sourceControlCode].push({
            code: m.targetControlCode,
            framework: "ISO27001",
          });
        });
        (soc2_27701Res || []).forEach((m) => {
          if (!soc2Index[m.sourceControlCode])
            soc2Index[m.sourceControlCode] = [];
          soc2Index[m.sourceControlCode].push({
            code: m.targetControlCode,
            framework: "ISO27701",
          });
        });

        const ksaIndex = {};
        (ksa_27001Res || []).forEach((m) => {
          if (!ksaIndex[m.sourceControlCode])
            ksaIndex[m.sourceControlCode] = [];
          ksaIndex[m.sourceControlCode].push({
            code: m.targetControlCode,
            framework: "ISO27001",
          });
        });
        (ksa_27701Res || []).forEach((m) => {
          if (!ksaIndex[m.sourceControlCode])
            ksaIndex[m.sourceControlCode] = [];
          ksaIndex[m.sourceControlCode].push({
            code: m.targetControlCode,
            framework: "ISO27701",
          });
        });
        (ksa_soc2Res || []).forEach((m) => {
          if (!ksaIndex[m.sourceControlCode])
            ksaIndex[m.sourceControlCode] = [];
          ksaIndex[m.sourceControlCode].push({
            code: m.targetControlCode,
            framework: "SOC2",
          });
        });

        // ── Resolve mapped docs for SOC2 ─────────────────────────────────
        if (selectedFramework === "SOC2") {
          Object.keys(soc2Index).forEach((soc2Code) => {
            (soc2Index[soc2Code] || []).forEach(({ code: sourceCode }) => {
              // Try bare code and A. prefix variant
              const bareCode = sourceCode.startsWith("A.")
                ? sourceCode.substring(2)
                : sourceCode;
              const withPrefix = sourceCode.startsWith("A.")
                ? sourceCode
                : `A.${sourceCode}`;
              [sourceCode, bareCode, withPrefix].forEach((candidate) => {
                (map[candidate] || []).forEach((doc) =>
                  addDocToMap(soc2Code, { ...doc, _id: doc._id }),
                );
              });
            });
          });
        }

        // ── Resolve mapped docs for KSA_PDPL ─────────────────────────────
        if (selectedFramework === "KSA_PDPL") {
          Object.keys(ksaIndex).forEach((ksaCode) => {
            (ksaIndex[ksaCode] || []).forEach(({ code: sourceCode }) => {
              const bareCode = sourceCode.startsWith("A.")
                ? sourceCode.substring(2)
                : sourceCode;
              const withPrefix = sourceCode.startsWith("A.")
                ? sourceCode
                : `A.${sourceCode}`;
              [sourceCode, bareCode, withPrefix].forEach((candidate) => {
                (map[candidate] || []).forEach((doc) =>
                  addDocToMap(ksaCode, { ...doc, _id: doc._id }),
                );
              });
            });
          });
        }

        setMldDocsByControlCode(map);
      } catch (err) {
        console.error("Failed to load MLD docs:", err);
      }
    };
    fetchMldDocs();
  }, [mounted, isAuditor, isAuditMode, user, selectedFramework, effectiveOrgId]);

  useEffect(() => {
    if (!mounted || !user || !selectedFramework) return;
    if (isSoc2 && !isAuditMode && !soc2Confirmed) return;
    const fetchControls = async () => {
      try {
        const controls =
          await controlService.getControlsByFramework(selectedFramework);
        const assignedIds = isAuditMode
          ? auditContext.assignedControlIds || []
          : null;
        const userDeptList = (
          Array.isArray(user.departments) ? user.departments : [user.department]
        )
          .map((d) =>
            (typeof d === "string" ? d : d?.name)?.trim().toLowerCase(),
          )
          .filter(Boolean);

        let filtered = controls;
        if (isAuditMode) {
          filtered = controls.filter(
            (c) => assignedIds.indexOf(c._id || c.controlId || c.id || "") !== -1,
          );
        }

        const mappedRows = filtered
          .flatMap((control, ctrlIdx) =>
            (control.auditQuestions || []).map((q, qIdx) => ({
              idx: ctrlIdx * 1000 + qIdx,
              clause: control.controlCode || control.clause || "",
              standardRequirement:
                control.title || control.standardRequirement || "",
              category: control.category || "Uncategorized",
              question: typeof q === "string" ? q : q.text || String(q),
              questionDepts: (control.departmentIds || []).map((d) =>
                (typeof d === "string" ? d : d?.name || "")
                  .trim()
                  .toLowerCase(),
              ),
              documentEvidence: null,
              practiceEvidence: null,
              practiceNotes: "",
              documentNotes: "",
              docScore:
                (isAuditMode &&
                  auditContext.existingScores?.[control._id]?.docScore) ||
                "",
              practiceScore:
                (isAuditMode &&
                  auditContext.existingScores?.[control._id]?.practiceScore) ||
                "",
              totalScore: 0,
              docRemarks:
                (isAuditMode &&
                  auditContext.existingScores?.[control._id]?.remarks) ||
                "",
              practiceRemarks: "",
              findings: "",
              overallFindings: "",
              gapId: null,
              _controlId: control._id || control.controlId || control.id || "",
              _controlCode: control.controlCode || control.clause || "",
            })),
          )
          .filter((row) => {
            if (isAuditMode) return true;
            if (userDeptList.length === 0) return true;
            return row.questionDepts.some((d) => userDeptList.includes(d));
          });

        mappedRows.forEach((r, i) => {
          r.idx = i;
        });
        setRows(mappedRows);
      } catch (err) {
        console.error("Failed to fetch controls:", err);
      }
    };
    fetchControls();
  }, [mounted, user, selectedFramework, isAuditMode, soc2Confirmed]); // eslint-disable-line

  useEffect(() => {
    if (!mounted || !user) return;
    const fetchGaps = async () => {
      try {
        const gaps = await gapService.getGaps();
        const filteredGaps = gaps.filter((g) => {
          if (g.organization !== effectiveOrgId) return false;
          if (isAuditMode) return g.auditId === auditContext.auditId;
          else return !g.auditId;
        });
        setRows((prev) => {
          if (prev.length === 0) return prev;
          return prev.map((row) => {
            const gap = filteredGaps.find(
              (g) => g.clause === row.clause && g.question === row.question,
            );
            if (!gap) return row;
            const hasGapScore = gap.docScore || gap.practiceScore;
            return {
              ...row,
              documentEvidence: gap.documentURL || row.documentEvidence,
              practiceEvidence: gap.practiceEvidence || row.practiceEvidence,
              practiceNotes: gap.practiceNotes || row.practiceNotes,
              documentNotes: gap.documentNotes || row.documentNotes,
              docScore: hasGapScore ? gap.docScore || "" : row.docScore,
              practiceScore: hasGapScore
                ? gap.practiceScore || ""
                : row.practiceScore,
              totalScore: hasGapScore
                ? (gap.docScore ? parseInt(gap.docScore) : 0) +
                (gap.practiceScore ? parseInt(gap.practiceScore) : 0)
                : row.totalScore,
              docRemarks: gap.docRemarks || row.docRemarks,
              practiceRemarks: gap.practiceRemarks || row.practiceRemarks,
              findings: gap.findings || row.findings || "",
              overallFindings: gap.overallFindings || row.overallFindings || "",
              gapId: gap._id,
            };
          });
        });
      } catch (err) {
        console.error("Failed to fetch gaps:", err);
      }
    };
    fetchGaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, user, effectiveOrgId, rows.length === 0 ? 0 : 1]);

  const handleSubmitAuditScores = async () => {
    const missingFindings = rows.filter(
      (row) => !row.findings || row.findings === "",
    );
    const missingDocScore = rows.filter(
      (row) => !row.docScore || row.docScore === "",
    );
    const missingPracticeScore = showPracticeEvidence
      ? rows.filter((row) => !row.practiceScore || row.practiceScore === "")
      : [];

    if (
      missingFindings.length > 0 ||
      missingDocScore.length > 0 ||
      missingPracticeScore.length > 0
    ) {
      const parts = [];
      if (missingFindings.length > 0)
        parts.push(`${missingFindings.length} missing Finding`);
      if (missingDocScore.length > 0)
        parts.push(`${missingDocScore.length} missing Doc Score`);
      if (missingPracticeScore.length > 0)
        parts.push(`${missingPracticeScore.length} missing Practice Score`);
      setAuditSaveMsg(`⚠ Cannot submit: ${parts.join(" · ")}`);
      expandAll();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSavingAudit(true);
    setAuditSaveMsg("");
    try {
      const scoreMap = {};
      rows.forEach((row) => {
        const cid = row._controlId;
        if (!cid || scoreMap[cid]) return;
        scoreMap[cid] = {
          docScore: row.docScore || "",
          practiceScore: row.practiceScore || "",
          remarks: row.docRemarks || "",
        };
      });
      await Promise.all(
        Object.entries(scoreMap).map(([controlId, s]) =>
          auditService.scoreControl(
            auditContext.auditId,
            controlId,
            s.docScore,
            s.practiceScore,
            s.remarks,
          ),
        ),
      );
      captureActivity({
        action: ACTIONS.UPDATE,
        item: `Audit Session · Submitted scores for ${Object.keys(scoreMap).length} controls for audit ${auditContext.auditId}`,
        url: window.pathname,
      });
      setAuditSaveMsg("Scores submitted successfully!");
      setSavingAudit(false);
      setTimeout(() => router.push("/gap-assessment"), 1500);
    } catch (err) {
      console.error(err);
      setAuditSaveMsg("Submit failed: " + (err.message || "error"));
      setSavingAudit(false);
    }
  };

  const handleInputChange = (i, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      if (field === "docScore" || field === "practiceScore") {
        const doc = updated[i].docScore ? parseInt(updated[i].docScore) : 0;
        const practice = updated[i].practiceScore
          ? parseInt(updated[i].practiceScore)
          : 0;
        updated[i].totalScore = doc + practice;
      }
      return updated;
    });
    markUnsaved();
  };

  const handleFileChange = async (i, file, field) => {
    if (!file) return;
    try {
      const { url } = await gapService.uploadFile(file);
      captureActivity({
        action: ACTIONS.CREATE,
        item: `Audit Session · Uploaded evidence '${file.name}' for control ${rows[i].controlCode}`,
        url: window.pathname,
      });
      const newRow = { ...rows[i], [field]: url };
      setRows((prev) => {
        const u = [...prev];
        u[i] = newRow;
        return u;
      });
      const payload = {
        auditId: isAuditMode ? auditContext?.auditId || null : null,
        clause: newRow.clause,
        question: newRow.question,
        standardRequirement: newRow.standardRequirement,
        documentURL: newRow.documentEvidence || "",
        documentNotes: newRow.documentNotes || "",
        practiceEvidence: newRow.practiceEvidence || "",
        practiceNotes: newRow.practiceNotes || "",
        docScore: newRow.docScore || "",
        practiceScore: newRow.practiceScore || "",
        totalScore: newRow.totalScore || 0,
        docRemarks: newRow.docRemarks || "",
        practiceRemarks: newRow.practiceRemarks || "",
        createdBy: user?.id || "",
        department: getEffectiveDept(),
        organization: effectiveOrgId || "",
      };
      const saved = await gapService.saveEntry(payload);
      handleInputChange(i, "gapId", saved._id);
      markUnsaved();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const handleDeleteFile = async (i, field) => {
    const row = rows[i];
    if (!row[field] || !window.confirm("Delete this file?")) return;
    const fieldMap = {
      documentEvidence: "documentURL",
      practiceEvidence: "practiceEvidence",
    };
    try {
      await gapService.deleteDocumentByUrl(row[field], fieldMap[field]);
      setRows((prev) => {
        const u = [...prev];
        u[i] = { ...u[i], [field]: null };
        return u;
      });
      markUnsaved();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleNotesBlur = async (i) => {
    const r = rows[i];
    if (!r.practiceNotes && !r.documentNotes) return;
    try {
      const saved = await gapService.saveEntry({
        ...r,
        overallFindings: r.overallFindings || "",
        auditId: isAuditMode ? auditContext?.auditId || null : null,
        createdBy: user?.id,
        department: getEffectiveDept(),
        organization: effectiveOrgId || "",
      });
      handleInputChange(i, "gapId", saved._id);
      markUnsaved();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuditorChange = async (i, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      const row = { ...updated[i], [field]: value };
      row.totalScore =
        parseInt(row.docScore || 0) + parseInt(row.practiceScore || 0);
      updated[i] = row;
      return updated;
    });
    const updatedRow = { ...rows[i], [field]: value };
    updatedRow.totalScore =
      parseInt(updatedRow.docScore || 0) +
      parseInt(updatedRow.practiceScore || 0);
    let gapId = updatedRow.gapId;
    try {
      if (!gapId) {
        const created = await gapService.saveEntry({
          auditId: isAuditMode ? auditContext?.auditId || null : null,
          clause: updatedRow.clause,
          question: updatedRow.question,
          standardRequirement: updatedRow.standardRequirement,
          documentURL: updatedRow.documentEvidence || "",
          documentNotes: updatedRow.documentNotes || "",
          practiceEvidence: updatedRow.practiceEvidence || "",
          practiceNotes: updatedRow.practiceNotes || "",
          docScore: updatedRow.docScore || "",
          practiceScore: updatedRow.practiceScore || "",
          totalScore: updatedRow.totalScore || 0,
          docRemarks: updatedRow.docRemarks || "",
          practiceRemarks: updatedRow.practiceRemarks || "",
          findings: updatedRow.findings || "",
          createdBy: user?.id || "",
          department: getEffectiveDept(),
          organization: effectiveOrgId || "",
          overallFindings: updatedRow.overallFindings || "",
        });
        gapId = created._id;
        setRows((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], gapId };
          return updated;
        });
      } else {
        await gapService.updateEntry(gapId, {
          auditId: isAuditMode ? auditContext?.auditId || null : null,
          clause: updatedRow.clause,
          question: updatedRow.question,
          standardRequirement: updatedRow.standardRequirement,
          documentURL: updatedRow.documentEvidence || "",
          documentNotes: updatedRow.documentNotes || "",
          practiceEvidence: updatedRow.practiceEvidence || "",
          practiceNotes: updatedRow.practiceNotes || "",
          docScore: updatedRow.docScore || "",
          practiceScore: updatedRow.practiceScore || "",
          totalScore: updatedRow.totalScore || 0,
          docRemarks: updatedRow.docRemarks || "",
          practiceRemarks: updatedRow.practiceRemarks || "",
          findings: updatedRow.findings || "",
          verifiedBy: user?.id || "",
          organization: effectiveOrgId || "",
          overallFindings: updatedRow.overallFindings || "",
        });
      }
    } catch (err) {
      console.error("Failed to save to gap-service:", err);
    }
    if (isAuditMode && auditContext?.auditId && updatedRow._controlId) {
      try {
        await auditService.scoreControl(
          auditContext.auditId,
          updatedRow._controlId,
          updatedRow.docScore || "",
          updatedRow.practiceScore || "",
          updatedRow.docRemarks || "",
        );
      } catch (err) {
        console.warn("Audit-service sync failed:", err);
      }
    }
    markUnsaved();
  };

  const tableProps = {
    isAuditor,
    setSelectedDoc,
    handleInputChange,
    handleFileChange,
    handleDeleteFile,
    handleNotesBlur,
    handleAuditorChange,
    mldDocsByControlCode,
    showDocEvidence,
    showPracticeEvidence,
    setEvidenceModal,
    evidenceModal,
    complianceEvidenceMap,
  };

  const missingFindingsCount = isAuditor
    ? rows.filter((r) => !r.findings || r.findings === "").length
    : 0;
  const allFindingsFilled = missingFindingsCount === 0;
  const needsSoc2Config = isSoc2 && !isAuditMode && !soc2Confirmed;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shrink-0 shadow-sm">
        <div className="px-3 py-2 max-w-full mx-auto">
          {/* Audit mode banner */}
          {isAuditMode && (
            <div className="flex items-center gap-2 mb-1.5 px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] text-indigo-800 font-medium">
              <ShieldCheck
                size={12}
                className="text-indigo-600 flex-shrink-0"
              />
              <span>
                <strong>{auditContext.auditType}</strong> —{" "}
                <strong>{auditContext.frameworkCode}</strong>
                &nbsp;·&nbsp;{auditContext.assignedControlIds?.length || 0}{" "}
                controls assigned
                {isSoc2 && soc2Type && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-[9px] font-bold">
                    {soc2Type === "Type1"
                      ? "Type 1"
                      : soc2Type === "Type2"
                        ? "Type 2"
                        : "Both"}
                    {soc2Criteria
                      ? ` · ${soc2Criteria === "3" ? "3 Criteria" : "5 Criteria"}`
                      : ""}
                  </span>
                )}
                {isAuditor && !allFindingsFilled && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-[9px] font-bold">
                    ⚠ {missingFindingsCount} findings pending
                  </span>
                )}
                {isAuditor && allFindingsFilled && rows.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 text-[9px] font-bold">
                    ✓ All findings filled
                  </span>
                )}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Left */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => router.push("/gap-assessment")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 transition"
              >
                ← Back
              </button>
              <h1 className="text-sm font-semibold text-gray-800">
                {isAuditMode ? "Conduct Audit" : "New Assessment"}
              </h1>
              {isAuditMode ? (
                <span className="border px-1.5 py-0.5 rounded text-[11px] bg-gray-100 text-gray-500 select-none">
                  {auditContext.frameworkCode}
                </span>
              ) : (
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="border border-gray-300 px-1.5 py-1 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="ISO27001">ISO 27001</option>
                  <option value="ISO27701">ISO 27701</option>
                  <option value="SOC2">SOC 2</option>
                  <option value="ISO42001">ISO 42001</option>
                </select>
              )}
              {isSoc2 && soc2Confirmed && !isAuditMode && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    {soc2Type === "Type1"
                      ? "Type 1"
                      : soc2Type === "Type2"
                        ? "Type 2"
                        : "Both"}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 border border-teal-200">
                    {soc2Criteria === "3" ? "3 Criteria" : "5 Criteria"}
                  </span>
                  <button
                    onClick={() => setSoc2Confirmed(false)}
                    className="text-[9px] text-gray-400 hover:text-gray-600 underline ml-0.5"
                  >
                    change
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span>{getFormattedTime()}</span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 flex-wrap">

              <div className="bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg text-[10px] text-gray-600">
                <span className="font-semibold">{user?.name || "Unknown"}</span>
                <span className="text-gray-400 mx-1">·</span>
                <span className="capitalize">
                  {isAuditor ? "Evaluator" : "Assessor"}
                </span>
                <span className="text-gray-400 mx-1">·</span>
                <span className="font-semibold">{getEffectiveDept()}</span>
              </div>
              {isAuditMode && (
                <div className="flex flex-col items-end gap-0.5">
                  <button
                    onClick={handleSubmitAuditScores}
                    disabled={savingAudit || !allFindingsFilled}
                    title={
                      !allFindingsFilled
                        ? `${missingFindingsCount} rows still need a Finding`
                        : "Submit all scores"
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-[11px] font-semibold rounded-lg transition ${savingAudit || !allFindingsFilled ? "bg-gray-400 cursor-not-allowed opacity-60" : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"}`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingAudit ? "Submitting..." : "Submit Scores"}
                  </button>
                  {!allFindingsFilled && rows.length > 0 && (
                    <span className="text-[9px] text-red-500 font-medium">
                      {missingFindingsCount} finding
                      {missingFindingsCount !== 1 ? "s" : ""} remaining
                    </span>
                  )}
                </div>
              )}
              {!isAuditMode && hasUnsavedChanges && (
                <button
                  onClick={handleManualSave}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-[11px] font-semibold rounded-lg hover:bg-green-700 transition"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              )}
            </div>
          </div>

          {auditSaveMsg && (
            <div
              className={`mt-1.5 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] font-medium ${auditSaveMsg.startsWith("⚠") || auditSaveMsg.startsWith("Submit failed") ? "bg-red-50 border border-red-200 text-red-800" : "bg-green-50 border border-green-200 text-green-800"}`}
            >
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {auditSaveMsg}
            </div>
          )}
          {showSavedMessage && (
            <div className="mt-1.5 px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-1.5 text-green-800 text-[11px] font-medium">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Responses saved
            </div>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="px-3 py-3 max-w-full mx-auto">
          {needsSoc2Config ? (
            <div className="rounded-xl shadow border border-blue-200 bg-white overflow-hidden max-w-lg mx-auto mt-6">
              <div className="bg-green-800 text-white px-5 py-3">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck size={16} /> SOC 2 Assessment Options
                </h2>
                <p className="text-[11px] text-green-100 mt-0.5">
                  Configure your assessment scope.
                </p>
              </div>
              <div className="p-5 flex flex-col gap-5">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    SOC 2 Type <span className="text-red-500">*</span>
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      {
                        value: "Type1",
                        label: "Type 1 — Design",
                        desc: "Design only. Practice evidence columns hidden.",
                      },
                      {
                        value: "Type2",
                        label: "Type 2 — Design + Operation",
                        desc: "Both doc and practice evidence visible.",
                      },
                      {
                        value: "Both",
                        label: "Both",
                        desc: "Full assessment. All columns visible.",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSoc2Type(opt.value)}
                        className={`text-left px-3 py-2 rounded-lg border-2 transition-all ${soc2Type === opt.value ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                      >
                        <div
                          className={`text-xs font-semibold ${soc2Type === opt.value ? "text-purple-700" : "text-gray-800"}`}
                        >
                          {opt.label}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {opt.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Trust Service Criteria{" "}
                    <span className="text-red-500">*</span>
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      {
                        value: "3",
                        label: "3 Criteria (Common Criteria only)",
                        desc: "Security, Availability, Confidentiality. Excludes Privacy.",
                      },
                      {
                        value: "5",
                        label: "5 Criteria (All)",
                        desc: "All categories including Privacy and Processing Integrity.",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSoc2Criteria(opt.value)}
                        className={`text-left px-3 py-2 rounded-lg border-2 transition-all ${soc2Criteria === opt.value ? "border-teal-500 bg-teal-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                      >
                        <div
                          className={`text-xs font-semibold ${soc2Criteria === opt.value ? "text-teal-700" : "text-gray-800"}`}
                        >
                          {opt.label}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {opt.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  disabled={!soc2Type || !soc2Criteria}
                  onClick={() => setSoc2Confirmed(true)}
                  className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${soc2Type && soc2Criteria ? "bg-green-700 text-white hover:bg-green-800 cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                >
                  <CheckCircle size={14} /> Start Assessment →
                </button>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Loading controls…
            </div>
          ) : (
            <div className="rounded-xl shadow-sm border border-gray-200 bg-white overflow-x-auto overflow-y-hidden">
              <div className="w-max min-w-full flex flex-col">
                {isSoc2 && !showPracticeEvidence && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-800">
                    <span className="font-semibold">SOC 2 Type 1:</span>
                    <span>
                      Practice Evidence columns are hidden (design-only
                      assessment)
                    </span>
                  </div>
                )}
                {Object.entries(categoryTree)
                  .sort(
                    ([a], [b]) =>
                      getCategoryOrder(selectedFramework, a) -
                      getCategoryOrder(selectedFramework, b),
                  )
                  .map(([category, clauseMap]) => (
                    <CategoryBlock
                      key={category}
                      category={category}
                      clauseMap={clauseMap}
                      expandedNodes={expandedNodes}
                      onToggle={toggleNode}
                      tableProps={tableProps}
                      titleMap={titleMap}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="shrink-0 bg-white border-t border-gray-200 px-4 py-2 text-center text-[10px] text-gray-400">
        © {new Date().getFullYear()} CalVant. All rights reserved.
      </footer>

      {/* Doc preview modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-[100]"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white rounded-lg p-3 w-full max-w-5xl relative shadow-lg max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-2">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <ClipboardCheck className="text-blue-600" size={16} /> Document
                Preview
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>
            <iframe
              src={
                selectedDoc.startsWith("http")
                  ? selectedDoc
                  : `${process.env.NEXT_PUBLIC_SP}/gap-service${selectedDoc}`
              }
              className="w-full h-[75vh] border rounded-md"
              title="Document Preview"
            />
          </div>
        </div>
      )}

      <Evidence_Modal
        open={evidenceModal.open}
        evidence={evidenceModal.data}
        onClose={() => setEvidenceModal({ open: false, data: [] })}
      />
    </div>
  );
};

export default NewAssessment;
