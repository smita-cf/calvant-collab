// src/modules/gapAssessment/pages/NewAssessment.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import controlService from "../services/controlService";
import {
  Upload,
  X,
  ClipboardCheck,
  Trash,
  Eye,
  CheckCircle,
  Save,
  ChevronDown,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import gapService from "../services/gapService";
import auditService from "../services/auditService";

// ─── Tree Builder ─────────────────────────────────────────────────────────────
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

// ─── Category colour map ──────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  "ISMS Core": {
    bg: "bg-indigo-700",
    text: "text-white",
    hover: "hover:bg-indigo-800",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  "Organizational Controls": {
    bg: "bg-violet-700",
    text: "text-white",
    hover: "hover:bg-violet-800",
    badge: "bg-violet-100 text-violet-800 border-violet-200",
  },
  "People Controls": {
    bg: "bg-sky-700",
    text: "text-white",
    hover: "hover:bg-sky-800",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
  },
  "Physical Controls": {
    bg: "bg-teal-700",
    text: "text-white",
    hover: "hover:bg-teal-800",
    badge: "bg-teal-100 text-teal-800 border-teal-200",
  },
  "Technological Controls": {
    bg: "bg-cyan-700",
    text: "text-white",
    hover: "hover:bg-cyan-800",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
  "PIMS Core": {
    bg: "bg-emerald-700",
    text: "text-white",
    hover: "hover:bg-emerald-800",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  "PIMS Controller Controls": {
    bg: "bg-amber-600",
    text: "text-white",
    hover: "hover:bg-amber-700",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  "PIMS Processor Controls": {
    bg: "bg-orange-600",
    text: "text-white",
    hover: "hover:bg-orange-700",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
  },
  Uncategorized: {
    bg: "bg-gray-600",
    text: "text-white",
    hover: "hover:bg-gray-700",
    badge: "bg-gray-100 text-gray-700 border-gray-200",
  },
};
const getCatColor = (cat) =>
  CATEGORY_COLORS[cat] || CATEGORY_COLORS["Uncategorized"];

// ─── Shared badges ────────────────────────────────────────────────────────────
const ScoreBadge = ({ score, light = false }) => {
  if (score === null)
    return (
      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium border bg-white/20 text-white/70 border-white/20">
        —
      </span>
    );
  const pct = parseFloat(score);
  const cls = light
    ? pct >= 70
      ? "bg-green-50 text-green-700 border-green-200"
      : pct >= 40
        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
        : "bg-red-50 text-red-600 border-red-200"
    : pct >= 70
      ? "bg-green-400/30 text-green-100 border-green-400/40"
      : pct >= 40
        ? "bg-yellow-400/30 text-yellow-100 border-yellow-400/40"
        : "bg-red-400/30 text-red-100 border-red-300/40";
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${cls}`}
    >
      {score}%
    </span>
  );
};

const ProgressBadge = ({ answered, total, light = false }) => {
  const allDone = answered === total && total > 0;
  const partial = answered > 0 && !allDone;
  const cls = light
    ? allDone
      ? "bg-green-50 text-green-700 border-green-200"
      : partial
        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
        : "bg-gray-50 text-gray-500 border-gray-200"
    : allDone
      ? "bg-green-400/30 text-green-100 border-green-400/40"
      : partial
        ? "bg-yellow-400/30 text-yellow-100 border-yellow-400/40"
        : "bg-white/20 text-white/70 border-white/20";
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${cls}`}
    >
      {answered}/{total}
    </span>
  );
};

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
}) => (
  <div className="overflow-x-auto">
    <table
      className={`${isAuditor ? "min-w-[720px]" : "w-full"} text-xs sm:text-sm border-collapse`}
    >
      <thead className="bg-gray-50">
        <tr>
          <th className="border px-2 sm:px-3 py-2 text-left">Requirement</th>
          <th className="border px-2 sm:px-3 py-2">Document Evidence</th>
          <th className="border px-2 sm:px-3 py-2">Practice Evidence</th>
          {isAuditor && (
            <>
              <th className="border px-2 sm:px-3 py-2">Doc Score</th>
              <th className="border px-2 sm:px-3 py-2">Practice Score</th>
              <th className="border px-2 sm:px-3 py-2">Total Score</th>
              <th className="border px-2 sm:px-3 py-2">Doc Remarks</th>
              <th className="border px-2 sm:px-3 py-2">Practice Remarks</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.idx} className="hover:bg-blue-50 transition-colors">
            <td className="border px-2 sm:px-3 py-2 align-top font-medium">
              {row.question}
            </td>

            {/* Document Evidence */}
            <td className="border px-2 sm:px-3 py-2 align-top">
              {!isAuditor && (
                <label className="cursor-pointer text-blue-600 hover:underline text-[11px] sm:text-xs">
                  <Upload size={14} className="inline mr-1" /> Upload
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(
                        row.idx,
                        e.target.files[0],
                        "documentEvidence",
                      )
                    }
                  />
                </label>
              )}
              {row.documentEvidence && (
                <div className="mt-1 space-x-1">
                  <button
                    onClick={() => setSelectedDoc(row.documentEvidence)}
                    className="text-[11px] sm:text-xs text-blue-600 hover:underline"
                  >
                    <Eye size={14} className="inline mr-1" /> View
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteFile(row.idx, "documentEvidence")
                    }
                    className="text-[11px] sm:text-xs text-red-500 hover:underline"
                  >
                    <Trash size={14} className="inline mr-1" /> Delete
                  </button>
                </div>
              )}
              <textarea
                className="w-full border rounded mt-2 px-1 py-0.5 text-[11px] sm:text-xs"
                rows={2}
                value={row.documentNotes || ""}
                placeholder="Notes..."
                onChange={(e) =>
                  handleInputChange(row.idx, "documentNotes", e.target.value)
                }
                onBlur={() => handleNotesBlur(row.idx)}
              />
            </td>

            {/* Practice Evidence */}
            <td className="border px-2 sm:px-3 py-2 align-top">
              {!isAuditor && (
                <label className="cursor-pointer text-green-600 hover:underline text-[11px] sm:text-xs">
                  <Upload size={14} className="inline mr-1" /> Upload
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(
                        row.idx,
                        e.target.files[0],
                        "practiceEvidence",
                      )
                    }
                  />
                </label>
              )}
              {row.practiceEvidence && (
                <div className="mt-1 space-x-1">
                  <button
                    onClick={() => setSelectedDoc(row.practiceEvidence)}
                    className="text-[11px] sm:text-xs text-green-600 hover:underline"
                  >
                    <Eye size={14} className="inline mr-1" /> View
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteFile(row.idx, "practiceEvidence")
                    }
                    className="text-[11px] sm:text-xs text-red-500 hover:underline"
                  >
                    <Trash size={14} className="inline mr-1" /> Delete
                  </button>
                </div>
              )}
              <textarea
                className="w-full border rounded mt-2 px-1 py-0.5 text-[11px] sm:text-xs"
                rows={2}
                value={row.practiceNotes || ""}
                placeholder="Notes..."
                onChange={(e) =>
                  handleInputChange(row.idx, "practiceNotes", e.target.value)
                }
                onBlur={() => handleNotesBlur(row.idx)}
              />
            </td>

            {isAuditor && (
              <>
                <td className="border px-2 py-2">
                  <select
                    value={row.docScore}
                    onChange={(e) =>
                      handleAuditorChange(row.idx, "docScore", e.target.value)
                    }
                    className="w-full border rounded text-[11px]"
                  >
                    <option value="">NA</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </td>
                <td className="border px-2 py-2">
                  <select
                    value={row.practiceScore}
                    onChange={(e) =>
                      handleAuditorChange(
                        row.idx,
                        "practiceScore",
                        e.target.value,
                      )
                    }
                    className="w-full border rounded text-[11px]"
                  >
                    <option value="">NA</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </td>
                <td className="border px-2 py-2 text-center font-bold">
                  {row.totalScore}
                </td>
                <td className="border px-2 py-2">
                  <textarea
                    value={row.docRemarks}
                    onChange={(e) =>
                      handleAuditorChange(row.idx, "docRemarks", e.target.value)
                    }
                    className="w-full border rounded text-[11px]"
                    rows={2}
                  />
                </td>
                <td className="border px-2 py-2">
                  <textarea
                    value={row.practiceRemarks}
                    onChange={(e) =>
                      handleAuditorChange(
                        row.idx,
                        "practiceRemarks",
                        e.target.value,
                      )
                    }
                    className="w-full border rounded text-[11px]"
                    rows={2}
                  />
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Clause depth styles ──────────────────────────────────────────────────────
const CLAUSE_HEADER = [
  "bg-blue-100 text-gray-800 hover:bg-blue-200 py-2.5",
  "bg-blue-50  text-gray-700 hover:bg-blue-100 py-2",
  "bg-gray-50  text-gray-600 hover:bg-gray-100 py-1.5",
  "bg-white    text-gray-500 hover:bg-gray-50  py-1",
];
const CLAUSE_LABEL = [
  "text-sm font-semibold",
  "text-sm font-medium",
  "text-xs font-medium",
  "text-xs font-normal",
];
const CLAUSE_INDENT = [0, 16, 32, 48];

// ─── Recursive Clause Node ────────────────────────────────────────────────────
const ClauseNode = ({
  nodeKey,
  node,
  depth,
  expandedNodes,
  onToggle,
  tableProps,
  titleMap,
}) => {
  const allRows = useMemo(() => collectRows(node), [node]);
  const isExpanded = expandedNodes[nodeKey] ?? true;
  const hasChildren = Object.keys(node.children || {}).length > 0;
  const title =
    titleMap[nodeKey] || node.directRows?.[0]?.standardRequirement || "";
  const score = computeScore(allRows);
  const { answered, total } = computeFilled(allRows);
  const hdrCls = CLAUSE_HEADER[Math.min(depth, CLAUSE_HEADER.length - 1)];
  const lblCls = CLAUSE_LABEL[Math.min(depth, CLAUSE_LABEL.length - 1)];
  const indentPx =
    (CLAUSE_INDENT[Math.min(depth, CLAUSE_INDENT.length - 1)] || 0) + 16;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(nodeKey)}
        style={{ paddingLeft: `${indentPx}px` }}
        className={`w-full text-left flex items-center justify-between gap-3 pr-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${hdrCls}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`flex-shrink-0 text-blue-400 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
          >
            <ChevronDown size={14} />
          </span>
          <span className={lblCls}>{node.label}</span>
          {title && (
            <span className="truncate text-xs text-gray-400 ml-1">{title}</span>
          )}
        </div>
        <div
          className="flex items-center gap-2 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ProgressBadge answered={answered} total={total} light />
          <ScoreBadge score={score} light />
        </div>
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
              <div className="text-right pr-4 py-1.5 text-xs font-semibold text-gray-500 bg-white border-t border-gray-100">
                {(() => {
                  const s = computeScore(node.directRows);
                  const cls = !s
                    ? "text-gray-400"
                    : parseFloat(s) >= 70
                      ? "text-green-600"
                      : parseFloat(s) >= 40
                        ? "text-yellow-600"
                        : "text-red-500";
                  return (
                    <>
                      Score:{" "}
                      <span className={cls}>
                        {s ? `${s}%` : "Yet to Calculate"}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Category Block ───────────────────────────────────────────────────────────
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
  const allRows = useMemo(() => collectCategoryRows(clauseMap), [clauseMap]);
  const score = computeScore(allRows);
  const { answered, total } = computeFilled(allRows);

  return (
    <div className="border-b-2 border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(catKey)}
        className={`w-full text-left flex items-center justify-between gap-3 px-4 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${colors.bg} ${colors.text} ${colors.hover}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"} text-white/80`}
          >
            <ChevronDown size={18} />
          </span>
          <Tag size={15} className="flex-shrink-0 opacity-70" />
          <span className="text-base font-bold tracking-wide">{category}</span>
        </div>
        <div
          className="flex items-center gap-2 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ProgressBadge answered={answered} total={total} light={false} />
          <ScoreBadge score={score} light={false} />
        </div>
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

  // ── Audit context ────────────────────────────────────────────────────────────
  const auditContext = location.state || null;
  const isAuditMode = !!(auditContext && auditContext.auditId);

  // ── State ────────────────────────────────────────────────────────────────────
  const [lastSaved, setLastSaved] = useState(Date.now());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(false);
  const [savingAudit, setSavingAudit] = useState(false);
  const [auditSaveMsg, setAuditSaveMsg] = useState("");

  const [selectedFramework, setSelectedFramework] = useState(
    isAuditMode ? auditContext.frameworkCode : "ISO27001",
  );

  const [expandedNodes, setExpandedNodes] = useState({});
  const toggleNode = useCallback((key) => {
    setExpandedNodes((prev) => ({ ...prev, [key]: !(prev[key] ?? true) }));
  }, []);

  const categoryTree = useMemo(() => buildCategoryTree(rows), [rows]);
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

  // ── Load session user ────────────────────────────────────────────────────────
  useEffect(() => {
    const rawUser = sessionStorage.getItem("user");
    if (rawUser) {
      const parsedUser = JSON.parse(rawUser);
      setUser(parsedUser);
      setUserRole(parsedUser.isAuditor || false);
    }
  }, []);

  const isAuditor = userRole;

  const getEffectiveDept = () => {
    if (Array.isArray(user?.departments) && user.departments.length > 0) {
      const dept = user.departments[0];
      return typeof dept === "string" ? dept : dept.name;
    }
    return user?.department?.name || "General";
  };

  // ── Fetch controls ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !selectedFramework) return;

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
        if (isAuditMode && assignedIds && assignedIds.length > 0) {
          filtered = controls.filter(
            (c) =>
              assignedIds.indexOf(c._id || c.controlId || c.id || "") !== -1,
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
              gapId: null,
              // ── KEY: store BOTH the mongo _id (for audit-service) and the controlCode (for display)
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
  }, [user, selectedFramework, isAuditMode]);

  // ── Fetch existing gap data ──────────────────────────────────────────────────
  // In audit mode:   only load gaps that belong to THIS auditId.
  //                  This ensures each audit gets its own fresh checklist and
  //                  scores from audit A never bleed into audit B.
  // In normal mode:  load by org only (existing behaviour — no auditId filter).
  useEffect(() => {
    if (!user) return;
    const fetchGaps = async () => {
      try {
        const gaps = await gapService.getGaps();

        const filteredGaps = gaps.filter((g) => {
          // Always scope to the same organisation
          if (g.organization !== user.organization) return false;

          if (isAuditMode) {
            // In audit mode ONLY match gaps that were saved for this specific audit.
            // Gaps with no auditId were saved by a normal assessment — ignore them
            // here so they don't overwrite the auditor's scores.
            return g.auditId === auditContext.auditId;
          } else {
            // Normal mode: match gaps that have NO auditId (standard assessment gaps)
            return !g.auditId;
          }
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
  }, [user, rows.length === 0 ? 0 : 1]);

  // ── Submit ALL scores to audit-service (audit mode — final submit button) ────
  const handleSubmitAuditScores = async () => {
    setSavingAudit(true);
    setAuditSaveMsg("");
    try {
      // One score per controlId — take values from first question row of each control
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

      setAuditSaveMsg("Scores submitted successfully!");
      setSavingAudit(false);
      setTimeout(() => router.push("/gap-assessment"), 1500);
    } catch (err) {
      console.error(err);
      setAuditSaveMsg("Submit failed: " + (err.message || "error"));
      setSavingAudit(false);
    }
  };

  // ── Standard handlers ────────────────────────────────────────────────────────
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
        organization: user?.organization || "",
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
        auditId: isAuditMode ? auditContext?.auditId || null : null,
        createdBy: user?.id,
        department: getEffectiveDept(),
        organization: user?.organization || "",
      });
      handleInputChange(i, "gapId", saved._id);
      markUnsaved();
    } catch (err) {
      console.error(err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // handleAuditorChange — THE KEY FIX
  //
  // Previously: saved to gap-service only, then audit-service only on final Submit.
  // Now:        saves to BOTH gap-service AND audit-service on every change,
  //             so the audit dashboard progress bar always reflects the real state.
  //
  // Score logic:
  //   • gap-service  → per question row (clause + question as key)
  //   • audit-service → per control (_controlId as key), using the SAME score value
  //     because one control = one score entry in AuditControl.
  //     We aggregate by taking the score from the FIRST question of each control
  //     (all questions in a control share the same docScore/practiceScore).
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAuditorChange = async (i, field, value) => {
    // 1. Update local state immediately so the UI is responsive
    setRows((prev) => {
      const updated = [...prev];
      const row = { ...updated[i], [field]: value };
      row.totalScore =
        parseInt(row.docScore || 0) + parseInt(row.practiceScore || 0);
      updated[i] = row;
      return updated;
    });

    // Get the updated row values synchronously for the API calls below
    const updatedRow = { ...rows[i], [field]: value };
    updatedRow.totalScore =
      parseInt(updatedRow.docScore || 0) +
      parseInt(updatedRow.practiceScore || 0);

    // 2. Save to gap-service (persists per question, org-scoped)
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
          createdBy: user?.id || "",
          department: getEffectiveDept(),
          organization: user?.organization || "",
        });
        gapId = created._id;
        // Update the row's gapId in state so subsequent changes use PUT not POST
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
          verifiedBy: user?.id || "",
          organization: user?.organization || "",
        });
      }
    } catch (err) {
      console.error("Failed to save to gap-service:", err);
    }

    // 3. ── AUDIT-SERVICE SYNC (audit mode only) ──────────────────────────────
    //    Push the score to audit-service immediately so the dashboard progress
    //    bar is always accurate — no need to wait for the final Submit button.
    //
    //    audit-service stores ONE score per control (_controlId), not per question.
    //    So we send the current row's scores, which represent the control's score.
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
        // Non-fatal — gap-service already saved; audit sync will retry on Submit
        console.warn("Audit-service sync failed (will retry on Submit):", err);
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
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-gray-50 shrink-0">
        <div className="px-4 py-2 sm:px-6 sm:py-3 max-w-7xl mx-auto">
          {isAuditMode && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-800 font-medium">
              <ShieldCheck
                size={14}
                className="text-indigo-600 flex-shrink-0"
              />
              <span>
                Conducting: <strong>{auditContext.auditType}</strong> —{" "}
                <strong>{auditContext.frameworkCode}</strong>
                &nbsp;·&nbsp;Showing your{" "}
                {auditContext.assignedControlIds?.length || 0} assigned control
                {auditContext.assignedControlIds?.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
            {/* LEFT */}
            <div className="flex gap-3 items-center flex-wrap">
              <button
                onClick={() => router.push("/gap-assessment")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition"
              >
                ← Back to Dashboard
              </button>

              <h1 className="text-sm sm:text-base font-semibold text-gray-800">
                {isAuditMode ? "Conduct Audit" : "New Assessment"}
              </h1>

              {isAuditMode ? (
                <span className="border px-2 py-1 rounded text-sm bg-gray-100 text-gray-500 select-none">
                  {auditContext.frameworkCode}
                </span>
              ) : (
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="border px-2 py-1 rounded text-sm"
                >
                  <option value="ISO27001">ISO 27001</option>
                  <option value="ISO27701">ISO 27701</option>
                </select>
              )}

              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-green-600 font-medium hidden sm:flex">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{getFormattedTime()}</span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <button
                  onClick={expandAll}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition text-gray-600"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition text-gray-600"
                >
                  Collapse All
                </button>
              </div>

              <div className="bg-blue-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-gray-700 min-w-[200px] sm:min-w-[240px]">
                <div className="truncate">
                  Logged in as:{" "}
                  <span className="font-semibold">
                    {user?.name || "Unknown"}
                  </span>
                </div>
                <div className="truncate">
                  Role:{" "}
                  <span className="font-semibold capitalize">
                    {isAuditor ? "Evaluator" : "Assessor"}
                  </span>{" "}
                  | <span className="font-semibold">{getEffectiveDept()}</span>
                </div>
              </div>

              {/* Audit mode: Submit Scores — sends all scores to audit-service as a final confirmation */}
              {isAuditMode && (
                <button
                  onClick={handleSubmitAuditScores}
                  disabled={savingAudit}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingAudit ? "Submitting..." : "Submit Scores"}</span>
                </button>
              )}

              {!isAuditMode && hasUnsavedChanges && (
                <button
                  onClick={handleManualSave}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-green-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-green-700 transition"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              )}
            </div>
          </div>

          {auditSaveMsg && (
            <div
              className={`mb-2 p-2 rounded-lg flex items-center gap-2 text-sm font-medium ${auditSaveMsg.startsWith("Submit failed") ? "bg-red-50 border border-red-200 text-red-800" : "bg-green-50 border border-green-200 text-green-800"}`}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {auditSaveMsg}
            </div>
          )}

          {showSavedMessage && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800 text-sm font-medium">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              Your responses have been saved
            </div>
          )}
        </div>
      </header>

      {/* SCROLLABLE CONTENT */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 max-w-7xl mx-auto">
          {rows.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Loading controls…
            </div>
          ) : (
            <div className="rounded-xl shadow border border-gray-200 bg-white overflow-hidden">
              {Object.entries(categoryTree)
                .sort(([a], [b]) => a.localeCompare(b))
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
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="shrink-0 bg-white border-t border-gray-200 p-3 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} CalVant. All rights reserved.
      </footer>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-[100]"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white rounded-lg p-4 w-full max-w-5xl relative shadow-lg max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <ClipboardCheck className="text-blue-600" size={18} /> Document
                Preview
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={20} />
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
    </div>
  );
};

export default NewAssessment;
