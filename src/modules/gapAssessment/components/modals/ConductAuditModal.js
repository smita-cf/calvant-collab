//C:\Users\ak192\Downloads\CV_Beta_v1.0.0-Calvant_migration-2\CV_Beta_v1.0.0-Calvant_migration-2\src\modules\gapAssessment\components\modals\ConductAuditModal.js

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Modal, ModalHeader, Spinner } from "../ui";
import {
  getSessionUser,
  statusBadge,
  displayStatus,
  inputStyle,
  selectStyle,
  labelStyle,
  btnPrimary,
} from "../../utils/helpers";
import { useControls } from "../../hooks/useControls";
import auditService from "../../services/auditService";
import {
  useFramework,
  ALL_FRAMEWORKS,
} from "../../../../context/FrameworkContex";
import { captureActivity, ACTIONS, MODULES } from "../../../../services/activities";

// ── CONDUCT_CAT_COLORS is intentionally hardcoded ────────────────────────────
// This is category-level UI theming (ISMS Core, People Controls, etc.),
// not a framework registry duplicate. It does not need to change when a new
// framework is added to frameworkService.js.
var CONDUCT_CAT_COLORS = {
  "ISMS Core": { hdr: "#3730a3", hdrText: "#fff", rowBg: "#eef2ff" },
  "Organizational Controls": {
    hdr: "#5b21b6",
    hdrText: "#fff",
    rowBg: "#f5f3ff",
  },
  "People Controls": { hdr: "#0369a1", hdrText: "#fff", rowBg: "#f0f9ff" },
  "Physical Controls": { hdr: "#0f766e", hdrText: "#fff", rowBg: "#f0fdfa" },
  "Technological Controls": {
    hdr: "#0e7490",
    hdrText: "#fff",
    rowBg: "#ecfeff",
  },
  "PIMS Core": { hdr: "#047857", hdrText: "#fff", rowBg: "#f0fdf4" },
  "PIMS Controller Controls": {
    hdr: "#b45309",
    hdrText: "#fff",
    rowBg: "#fffbeb",
  },
  "PIMS Processor Controls": {
    hdr: "#c2410c",
    hdrText: "#fff",
    rowBg: "#fff7ed",
  },
  "Common Criteria": { hdr: "#166534", hdrText: "#fff", rowBg: "#f0fdf4" },
  "Additional Criteria": { hdr: "#14532d", hdrText: "#fff", rowBg: "#dcfce7" },
  "AI Management System": { hdr: "#c2410c", hdrText: "#fff", rowBg: "#fff7ed" },
  "AI Risk Management": { hdr: "#ea580c", hdrText: "#fff", rowBg: "#ffedd5" },
  "AI Objectives": { hdr: "#d97706", hdrText: "#fff", rowBg: "#fffbeb" },
  "Annex A": { hdr: "#b45309", hdrText: "#fff", rowBg: "#fef3c7" },
  "Annex B": { hdr: "#92400e", hdrText: "#fff", rowBg: "#fde68a" },
};

function getConductCatColor(cat) {
  return (
    CONDUCT_CAT_COLORS[cat] || {
      hdr: "#475569",
      hdrText: "#fff",
      rowBg: "#f8fafc",
    }
  );
}

// ── Color helper ─────────────────────────────────────────────────────────────
function hexToMeta(hex = "#64748b") {
  return {
    color: hex,
    bg: hex + "18",
    border: hex + "66",
  };
}

// ── Filter banner ─────────────────────────────────────────────────────────────
function ActiveFilterBanner({
  allowedCodes,
  totalAudits,
  filteredCount,
  fwMetaByCode,
  isAllSelected,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
        padding: "8px 14px",
        borderRadius: 10,
        marginBottom: 14,
        background: isAllSelected ? "#f0f4ff" : "#fffbeb",
        border: "1px solid " + (isAllSelected ? "#c7d2fe" : "#fcd34d"),
        fontSize: 12,
      }}
    >
      <ShieldCheck
        size={13}
        color={isAllSelected ? "#4338ca" : "#b45309"}
        style={{ flexShrink: 0 }}
      />
      <span
        style={{
          fontWeight: 700,
          color: isAllSelected ? "#4338ca" : "#b45309",
        }}
      >
        Filter:
      </span>
      {isAllSelected ? (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 9px",
            borderRadius: 20,
            background: "#e0e7ff",
            color: "#4338ca",
            border: "1px solid #c7d2fe",
          }}
        >
          All Frameworks
        </span>
      ) : (
        allowedCodes.map(function (code) {
          var m = fwMetaByCode[code] || {
            label: code,
            color: "#64748b",
            bg: "#f1f5f9",
            border: "#e2e8f0",
          };
          return (
            <span
              key={code}
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 9px",
                borderRadius: 20,
                background: m.bg,
                color: m.color,
                border: "1px solid " + m.border,
              }}
            >
              {m.label}
            </span>
          );
        })
      )}
      <span style={{ fontSize: 11, color: "#64748b", marginLeft: "auto" }}>
        {filteredCount} of {totalAudits} audits assigned to you
      </span>
    </div>
  );
}

// ── Team Progress Modal ───────────────────────────────────────────────────────
function TeamProgressModal({
  audit,
  userMap,
  currentUserId,
  fwMetaByCode,
  onClose,
}) {
  var fwMeta = fwMetaByCode[audit.frameworkCode] || {
    label: audit.frameworkCode,
    color: "#64748b",
    bg: "#f1f5f9",
    border: "#e2e8f0",
  };

  var leadId = audit.leadAuditor || "";

  // Build per-auditor stats from audit.controls
  var auditorMap = {};
  (audit.controls || []).forEach(function (c) {
    if (!c.assignedTo) return;
    if (!auditorMap[c.assignedTo]) {
      auditorMap[c.assignedTo] = { total: 0, scored: 0 };
    }
    auditorMap[c.assignedTo].total += 1;
    var hasScore =
      (c.docScore !== "" && c.docScore != null) ||
      (c.practiceScore !== "" && c.practiceScore != null);
    if (hasScore) auditorMap[c.assignedTo].scored += 1;
  });

  // Sort: current user first, then lead, then rest alphabetically
  var auditorIds = Object.keys(auditorMap).sort(function (a, b) {
    if (a === currentUserId) return -1;
    if (b === currentUserId) return 1;
    if (a === leadId) return -1;
    if (b === leadId) return 1;
    var nameA = userMap[a] || a;
    var nameB = userMap[b] || b;
    return nameA.localeCompare(nameB);
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15,23,42,0.45)",
      }}
      onClick={function (e) {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 520,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
          margin: "0 16px",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#ede9fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={16} color="#7c3aed" />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                Team Progress
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
                {audit.auditType} —{" "}
                <span style={{ fontWeight: 700, color: fwMeta.color }}>
                  {fwMeta.label}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              color: "#94a3b8",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Lead auditor info strip */}
        <div
          style={{
            padding: "9px 20px",
            background: "#eff6ff",
            borderBottom: "1px solid #dbeafe",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
          }}
        >
          <ShieldCheck size={12} color="#2563eb" style={{ flexShrink: 0 }} />
          <span style={{ color: "#64748b" }}>Lead Auditor:</span>
          <span style={{ fontWeight: 700, color: "#1e293b" }}>
            {leadId === currentUserId
              ? "You"
              : userMap[leadId] || leadId || "—"}
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: "#64748b",
            }}
          >
            {auditorIds.length} auditor{auditorIds.length !== 1 ? "s" : ""}{" "}
            assigned
          </span>
        </div>

        {/* Auditor rows */}
        <div
          style={{
            maxHeight: 420,
            overflowY: "auto",
            padding: "14px 18px 18px",
          }}
        >
          {auditorIds.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 13,
                padding: 32,
              }}
            >
              No auditors assigned yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {auditorIds.map(function (uid) {
                var stats = auditorMap[uid];
                var pct =
                  stats.total > 0
                    ? Math.round((stats.scored / stats.total) * 100)
                    : 0;
                var isLead = uid === leadId;
                var isYou = uid === currentUserId;

                var baseName = userMap[uid] || uid;
                var displayName = isYou ? baseName + " (You)" : baseName;

                var avatarInitial = baseName.charAt(0).toUpperCase();

                // Pick accent color
                var accentColor = isYou
                  ? "#2563eb"
                  : isLead
                    ? "#7c3aed"
                    : "#64748b";
                var accentBg = isYou
                  ? "#dbeafe"
                  : isLead
                    ? "#ede9fe"
                    : "#f1f5f9";
                var cardBg = isYou ? "#eff6ff" : isLead ? "#faf5ff" : "#fff";
                var cardBorder = isYou
                  ? "#bfdbfe"
                  : isLead
                    ? "#ddd6fe"
                    : "#e2e8f0";

                return (
                  <div
                    key={uid}
                    style={{
                      border: "1px solid " + cardBorder,
                      borderRadius: 12,
                      padding: "12px 14px",
                      background: cardBg,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      {/* Left: avatar + name */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: accentBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 800,
                            color: accentColor,
                            flexShrink: 0,
                          }}
                        >
                          {avatarInitial}
                        </div>
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#1e293b",
                              lineHeight: 1.3,
                            }}
                          >
                            {displayName}
                          </p>
                          <div
                            style={{ display: "flex", gap: 5, marginTop: 3 }}
                          >
                            {isLead && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "1px 7px",
                                  borderRadius: 10,
                                  background: "#ede9fe",
                                  color: "#7c3aed",
                                }}
                              >
                                Lead Auditor
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: percentage */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: pct === 100 ? "#059669" : accentColor,
                            lineHeight: 1,
                          }}
                        >
                          {pct}%
                        </span>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 10,
                            color: "#94a3b8",
                          }}
                        >
                          {stats.scored}/{stats.total} controls
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div
                      style={{
                        height: 6,
                        background: "#f1f5f9",
                        borderRadius: 4,
                        overflow: "hidden",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: pct + "%",
                          borderRadius: 4,
                          background:
                            pct === 100
                              ? "#10b981"
                              : isYou
                                ? "#3b82f6"
                                : isLead
                                  ? "#8b5cf6"
                                  : "#94a3b8",
                          transition: "width 0.4s",
                        }}
                      />
                    </div>

                    {/* Score breakdown tags */}
                    <div style={{ display: "flex", gap: 10 }}>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 8,
                          background: "#d1fae5",
                          color: "#065f46",
                          fontWeight: 600,
                        }}
                      >
                        {stats.scored} scored
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 8,
                          background: "#fef3c7",
                          color: "#92400e",
                          fontWeight: 600,
                        }}
                      >
                        {stats.total - stats.scored} pending
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 8,
                          background: "#f1f5f9",
                          color: "#475569",
                          fontWeight: 600,
                        }}
                      >
                        {stats.total} total
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export function ConductAuditModal(props) {
  var router = useRouter();

  var onClose = props.onClose;
  var history = props.history;
  var sessionUser = getSessionUser();
  var userId = sessionUser.id || sessionUser._id || "";

  // ── Global framework context ──────────────────────────────────────────────
  var fwCtx = useFramework();
  var selectedFrameworks = fwCtx.selectedFrameworks;
  var isAllSelected = fwCtx.isAllSelected;
  var availableFrameworks = fwCtx.availableFrameworks;

  var fwLabelToCode = React.useMemo(
    function () {
      return Object.fromEntries(
        availableFrameworks.map(function (fw) {
          return [fw.id, fw.code];
        }),
      );
    },
    [availableFrameworks],
  );

  var fwMetaByCode = React.useMemo(
    function () {
      var map = {};
      availableFrameworks.forEach(function (fw) {
        var m = hexToMeta(fw.color);
        map[fw.code] = {
          label: fw.label,
          color: m.color,
          bg: m.bg,
          border: m.border,
        };
      });
      return map;
    },
    [availableFrameworks],
  );

  var allowedCodes = React.useMemo(
    function () {
      if (isAllSelected)
        return availableFrameworks.map(function (fw) {
          return fw.code;
        });
      return selectedFrameworks
        .map(function (label) {
          return fwLabelToCode[label];
        })
        .filter(Boolean);
    },
    [selectedFrameworks, isAllSelected, availableFrameworks, fwLabelToCode],
  );

  // ── Local state ───────────────────────────────────────────────────────────
  var _audits = useState([]);
  var audits = _audits[0];
  var setAudits = _audits[1];
  var _loading = useState(true);
  var loading = _loading[0];
  var setLoading = _loading[1];
  var _selected = useState(null);
  var selected = _selected[0];
  var setSelected = _selected[1];
  var _saving = useState(false);
  var saving = _saving[0];
  var setSaving = _saving[1];
  var _error = useState("");
  var error = _error[0];
  var setError = _error[1];
  var _success = useState("");
  var success = _success[0];
  var setSuccess = _success[1];
  var _expanded = useState({});
  var expanded = _expanded[0];
  var setExpanded = _expanded[1];
  var _scores = useState({});
  var scores = _scores[0];
  var setScores = _scores[1];
  var _fullControls = useState([]);
  var fullControls = _fullControls[0];
  var setFullControls = _fullControls[1];
  var _ctrlLoading = useState(false);
  var ctrlLoading = _ctrlLoading[0];
  var setCtrlLoading = _ctrlLoading[1];

  // ── User map: userId → display name ──────────────────────────────────────
  var _userMap = useState({});
  var userMap = _userMap[0];
  var setUserMap = _userMap[1];

  // ── Team Progress sub-modal state ─────────────────────────────────────────
  var _teamAudit = useState(null);
  var teamAudit = _teamAudit[0];
  var setTeamAudit = _teamAudit[1];

  // ── Fetch all users once to resolve IDs → names ───────────────────────────
  useEffect(function () {
    auditService
      .getAllUsers()
      .then(function (data) {
        var map = {};
        (data || []).forEach(function (u) {
          var id = u.id || u._id || "";
          var name =
            u.firstName && u.lastName
              ? u.firstName + " " + u.lastName
              : u.firstName || u.lastName || u.name || u.email || id;
          if (id) map[id] = name;
        });
        setUserMap(map);
      })
      .catch(function () {
        // fail silently — IDs used as fallback
      });
  }, []);

  // ── Logging ───────────────────────────────────────────────────────────────
  useEffect(function () {
    captureActivity({
      action: ACTIONS.VISITED,
      item: [{ detail: "Audit · Viewed 'Conduct Audit' list" }],
      url: "/gap-assessment",
    });
  }, []);

  useEffect(
    function () {
      if (selected) {
        captureActivity({
          action: ACTIONS.CLICK,
          item: [
            {
              detail: "Audit · Started conducting session",
              auditId: selected.id,
              framework: selected.frameworkCode,
            },
          ],
          url: "/gap-assessment",
        });
      }
    },
    [selected?.id],
  );

  // ── Load audits assigned to current user ──────────────────────────────────
  useEffect(
    function () {
      auditService
        .getAudits()
        .then(function (data) {
          var mine = (data || []).filter(function (a) {
            return (a.controls || []).some(function (c) {
              return c.assignedTo === userId;
            });
          });
          setAudits(mine);
          setLoading(false);
        })
        .catch(function () {
          setLoading(false);
        });
    },
    [userId],
  );

  // Filter by global framework context
  var filteredAudits = React.useMemo(
    function () {
      return audits.filter(function (a) {
        return allowedCodes.includes(a.frameworkCode);
      });
    },
    [audits, allowedCodes],
  );

  // ── Load controls for the selected audit ─────────────────────────────────
  useEffect(
    function () {
      if (!selected) return;
      setCtrlLoading(true);
      setFullControls([]);
      auditService
        .getControlsByFramework(selected.frameworkCode)
        .then(function (data) {
          var all = (data || []).map(auditService.normaliseControl);
          var myControlIds = (selected.controls || [])
            .filter(function (c) {
              return c.assignedTo === userId;
            })
            .map(function (c) {
              return c.controlId;
            });
          var mine = all.filter(function (c) {
            return myControlIds.indexOf(c.controlId) !== -1;
          });
          var pre = {};
          (selected.controls || [])
            .filter(function (c) {
              return c.assignedTo === userId;
            })
            .forEach(function (c) {
              pre[c.controlId] = {
                docScore: c.docScore || "",
                practiceScore: c.practiceScore || "",
                remarks: c.remarks || "",
              };
            });
          setScores(pre);
          var cats = {};
          mine.forEach(function (c) {
            cats["cat__" + (c.category || "Other")] = true;
          });
          mine.forEach(function (c) {
            cats["ctrl__" + c.controlId] = true;
          });
          setExpanded(cats);
          setFullControls(mine);
          setCtrlLoading(false);
        })
        .catch(function () {
          setCtrlLoading(false);
        });
    },
    [selected, userId],
  );

  // ── Helpers ───────────────────────────────────────────────────────────────
  function setScore(controlId, field, val) {
    setScores(function (prev) {
      var entry = Object.assign({}, prev[controlId] || {});
      entry[field] = val;
      return Object.assign({}, prev, { [controlId]: entry });
    });
  }

  function toggleExpand(key) {
    setExpanded(function (prev) {
      return Object.assign({}, prev, { [key]: !(prev[key] !== false) });
    });
  }

  function groupByCategory(controls) {
    var groups = {};
    controls.forEach(function (c) {
      var cat = c.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    });
    return groups;
  }

  function submitAll() {
    setSaving(true);
    setError("");
    setSuccess("");
    var promises = fullControls.map(function (c) {
      var s = scores[c.controlId] || {};
      return auditService.scoreControl(
        selected.id,
        c.controlId,
        s.docScore || "",
        s.practiceScore || "",
        s.remarks || "",
      );
    });
    Promise.all(promises)
      .then(function () {
        captureActivity({
          action: ACTIONS.UPDATED,
          item: [
            {
              detail: "Audit · Submitted audit session scores",
              auditId: selected.id,
              framework: selected.frameworkCode,
            },
          ],
          url: "/gap-assessment",
        });
        setSuccess("All scores submitted!");
        setSaving(false);
      })
      .catch(function (err) {
        setError(err.message || "Submit failed");
        setSaving(false);
      });
  }

  function scoredCount() {
    return fullControls.filter(function (c) {
      var s = scores[c.controlId] || {};
      return s.docScore !== "" || s.practiceScore !== "";
    }).length;
  }

  var categoryGroups = groupByCategory(fullControls);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Modal onClose={onClose} wide={true}>
        <ModalHeader
          title="Conduct Audit"
          subtitle={
            selected
              ? selected.auditType +
                " — " +
                ((fwMetaByCode[selected.frameworkCode] || {}).label ||
                  selected.frameworkCode)
              : "Select an audit to conduct"
          }
          onClose={onClose}
        />
        <div style={{ padding: "0 0 0", maxHeight: "80vh", overflowY: "auto" }}>
          {/* ── LIST VIEW ──────────────────────────────────────────────────── */}
          {!selected && (
            <div style={{ padding: "16px 24px 24px" }}>
              <ActiveFilterBanner
                allowedCodes={allowedCodes}
                totalAudits={audits.length}
                filteredCount={filteredAudits.length}
                fwMetaByCode={fwMetaByCode}
                isAllSelected={isAllSelected}
              />

              {loading && <Spinner />}
              {!loading && filteredAudits.length === 0 && (
                <div
                  style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}
                >
                  <AlertCircle
                    size={32}
                    color="#cbd5e1"
                    style={{ margin: "0 auto 12px" }}
                  />
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                    {audits.length > 0
                      ? "No audits for the active framework filter are assigned to you."
                      : "No audits assigned to you yet."}
                  </p>
                </div>
              )}

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {filteredAudits.map(function (audit) {
                  var isLeadAuditor = audit.leadAuditor === userId;
                  var badge = statusBadge(audit.status);
                  var fwMeta = fwMetaByCode[audit.frameworkCode] || {
                    label: audit.frameworkCode,
                    color: "#64748b",
                    bg: "#f1f5f9",
                    border: "#e2e8f0",
                  };

                  var allControls = audit.controls || [];
                  var totalCount = allControls.length;
                  var totalAnswered = allControls.filter(function (c) {
                    return (
                      (c.docScore !== "" && c.docScore != null) ||
                      (c.practiceScore !== "" && c.practiceScore != null)
                    );
                  }).length;
                  var overallPct =
                    totalCount > 0
                      ? Math.round((totalAnswered / totalCount) * 100)
                      : 0;

                  var myControls = allControls.filter(function (c) {
                    return c.assignedTo === userId;
                  });
                  var myCount = myControls.length;
                  var myAnswered = myControls.filter(function (c) {
                    return (
                      (c.docScore !== "" && c.docScore != null) ||
                      (c.practiceScore !== "" && c.practiceScore != null)
                    );
                  }).length;
                  var myPct =
                    myCount > 0 ? Math.round((myAnswered / myCount) * 100) : 0;

                  // Lead auditor display
                  var leadId = audit.leadAuditor || "";
                  var leadDisplayName =
                    leadId === userId
                      ? "You"
                      : userMap[leadId] || leadId || "—";

                  return (
                    <div
                      key={audit.id}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 14,
                        background: "#fff",
                        overflow: "hidden",
                      }}
                    >
                      {/* ── Card info area ── */}
                      <div style={{ padding: "14px 16px 12px" }}>
                        {/* Badges + lead auditor row */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 8,
                            flexWrap: "wrap",
                            gap: 6,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 10px",
                                borderRadius: 20,
                                background: badge.bg,
                                color: badge.color,
                              }}
                            >
                              {displayStatus(audit.status)}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: 20,
                                background: fwMeta.bg,
                                color: fwMeta.color,
                                border: "1px solid " + fwMeta.border,
                              }}
                            >
                              {fwMeta.label}
                            </span>
                          </div>
                          {/* Lead auditor label — visible for all users */}
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 11,
                            }}
                          >
                            <ShieldCheck
                              size={11}
                              color={leadId === userId ? "#2563eb" : "#94a3b8"}
                            />
                            <span
                              style={{
                                fontWeight: leadId === userId ? 700 : 500,
                                color:
                                  leadId === userId ? "#2563eb" : "#64748b",
                              }}
                            >
                              {leadDisplayName}
                            </span>
                          </span>
                        </div>

                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#1e293b",
                          }}
                        >
                          {audit.auditType} — {fwMeta.label}
                        </p>
                        <p
                          style={{
                            margin: "3px 0 10px",
                            fontSize: 12,
                            color: "#94a3b8",
                          }}
                        >
                          Due: {audit.endDate} · {myCount} control
                          {myCount !== 1 ? "s" : ""} assigned to you
                        </p>

                        {/* Dual progress bars */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 5,
                          }}
                        >
                          {isLeadAuditor && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: "#94a3b8",
                                  width: 82,
                                  flexShrink: 0,
                                }}
                              >
                                Overall
                              </span>
                              <div
                                style={{
                                  flex: 1,
                                  height: 5,
                                  background: "#f1f5f9",
                                  borderRadius: 3,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: overallPct + "%",
                                    borderRadius: 3,
                                    transition: "width 0.4s",
                                    background:
                                      overallPct === 100
                                        ? "#10b981"
                                        : "#94a3b8",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  flexShrink: 0,
                                  width: 44,
                                  textAlign: "right",
                                  color:
                                    overallPct === 100 ? "#059669" : "#64748b",
                                }}
                              >
                                {totalAnswered}/{totalCount}
                              </span>
                            </div>
                          )}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: "#2563eb",
                                width: 82,
                                flexShrink: 0,
                              }}
                            >
                              My Controls
                            </span>
                            <div
                              style={{
                                flex: 1,
                                height: 5,
                                background: "#dbeafe",
                                borderRadius: 3,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: myPct + "%",
                                  borderRadius: 3,
                                  transition: "width 0.4s",
                                  background:
                                    myPct === 100 ? "#10b981" : "#3b82f6",
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                flexShrink: 0,
                                width: 44,
                                textAlign: "right",
                                color: myPct === 100 ? "#059669" : "#2563eb",
                              }}
                            >
                              {myAnswered}/{myCount}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ── Action buttons row ── */}
                      <div
                        style={{
                          display: "flex",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        {/* Conduct Audit */}
                        <button
                          onClick={function () {
                            var myControlIds = (audit.controls || [])
                              .filter(function (c) { return c.assignedTo === userId; })
                              .map(function (c) { return c.controlId; });

                            var auditContext = {
                              auditId: audit.id,
                              auditType: audit.auditType,
                              frameworkCode: audit.frameworkCode,
                              soc2Type: audit.soc2Type || "",
                              soc2Criteria: audit.soc2Criteria || "",
                              assignedControlIds: myControlIds,
                              existingScores: (audit.controls || [])
                                .filter(function (c) { return c.assignedTo === userId; })
                                .reduce(function (acc, c) {
                                  acc[c.controlId] = {
                                    docScore: c.docScore || "",
                                    practiceScore: c.practiceScore || "",
                                    remarks: c.remarks || "",
                                  };
                                  return acc;
                                }, {}),
                            };

                            sessionStorage.setItem("cv_auditContext", JSON.stringify(auditContext));
                            router.push("/gap-assessment/new");
                            onClose();
                          }}
                          style={{
                            flex: 1,
                            padding: "10px 0",
                            border: "none",
                            borderBottomLeftRadius: 14,
                            borderBottomRightRadius: isLeadAuditor ? 0 : 14,
                            background: "#4f46e5",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                          }}
                          onMouseEnter={function (e) {
                            e.currentTarget.style.background = "#4338ca";
                          }}
                          onMouseLeave={function (e) {
                            e.currentTarget.style.background = "#4f46e5";
                          }}
                        >
                          Conduct Audit
                          <ChevronRight size={13} />
                        </button>

                        {/* Team Progress — only visible to the lead auditor */}
                        {isLeadAuditor && (
                          <button
                            onClick={function (e) {
                              e.stopPropagation();
                              setTeamAudit(audit);
                            }}
                            style={{
                              flex: 1,
                              padding: "10px 0",
                              border: "none",
                              borderBottomRightRadius: 14,
                              background: "#f8fafc",
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#7c3aed",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                            }}
                            onMouseEnter={function (e) {
                              e.currentTarget.style.background = "#f5f3ff";
                            }}
                            onMouseLeave={function (e) {
                              e.currentTarget.style.background = "#f8fafc";
                            }}
                          >
                            <Users size={13} />
                            Team Progress
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── DETAIL VIEW ────────────────────────────────────────────────── */}
          {selected && (
            <div>
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  background: "#fff",
                  borderBottom: "1px solid #e2e8f0",
                  padding: "10px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <button
                  onClick={function () {
                    setSelected(null);
                    setSuccess("");
                    setError("");
                    setFullControls([]);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#2563eb",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  ← Back
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    {scoredCount()}/{fullControls.length} scored
                  </span>
                  <button
                    onClick={submitAll}
                    disabled={saving || fullControls.length === 0}
                    style={Object.assign({}, btnPrimary, {
                      background:
                        saving || fullControls.length === 0
                          ? "#94a3b8"
                          : "#2563eb",
                      padding: "8px 18px",
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    })}
                  >
                    {saving ? (
                      <RefreshCw size={13} />
                    ) : (
                      <CheckCircle2 size={13} />
                    )}
                    {saving ? "Saving..." : "Submit All"}
                  </button>
                </div>
              </div>

              {ctrlLoading && (
                <div style={{ padding: 24 }}>
                  <Spinner />
                </div>
              )}

              {!ctrlLoading && fullControls.length === 0 && (
                <p
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: 13,
                  }}
                >
                  No controls found for {selected.frameworkCode}.
                </p>
              )}

              {!ctrlLoading &&
                Object.keys(categoryGroups)
                  .sort()
                  .map(function (cat) {
                    var catKey = "cat__" + cat;
                    var catOpen = expanded[catKey] !== false;
                    var catColor = getConductCatColor(cat);
                    var controls = categoryGroups[cat];
                    return (
                      <div
                        key={cat}
                        style={{ borderBottom: "2px solid #e2e8f0" }}
                      >
                        <button
                          onClick={function () {
                            toggleExpand(catKey);
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            border: "none",
                            cursor: "pointer",
                            background: catColor.hdr,
                            color: catColor.hdrText,
                            padding: "10px 20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <ChevronDown
                              size={16}
                              style={{
                                transform: catOpen
                                  ? "rotate(0deg)"
                                  : "rotate(-90deg)",
                                transition: "transform 0.2s",
                              }}
                            />
                            {cat}{" "}
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 500,
                                opacity: 0.8,
                              }}
                            >
                              ({controls.length} control
                              {controls.length !== 1 ? "s" : ""})
                            </span>
                          </div>
                          <span style={{ fontSize: 11, opacity: 0.85 }}>
                            {
                              controls.filter(function (c) {
                                var s = scores[c.controlId] || {};
                                return s.docScore || s.practiceScore;
                              }).length
                            }
                            /{controls.length} scored
                          </span>
                        </button>

                        {catOpen &&
                          controls.map(function (ctrl) {
                            var ctrlKey = "ctrl__" + ctrl.controlId;
                            var ctrlOpen = expanded[ctrlKey] !== false;
                            var s = scores[ctrl.controlId] || {};
                            var isScored =
                              s.docScore !== "" || s.practiceScore !== "";
                            var questions = ctrl.auditQuestions || [];
                            return (
                              <div
                                key={ctrl.controlId}
                                style={{ borderBottom: "1px solid #e2e8f0" }}
                              >
                                <button
                                  onClick={function () {
                                    toggleExpand(ctrlKey);
                                  }}
                                  style={{
                                    width: "100%",
                                    textAlign: "left",
                                    border: "none",
                                    cursor: "pointer",
                                    background: catColor.rowBg,
                                    padding: "10px 24px 10px 36px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      minWidth: 0,
                                    }}
                                  >
                                    <ChevronDown
                                      size={13}
                                      color="#64748b"
                                      style={{
                                        transform: ctrlOpen
                                          ? "rotate(0deg)"
                                          : "rotate(-90deg)",
                                        transition: "transform 0.2s",
                                        flexShrink: 0,
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: "#2563eb",
                                        background: "#dbeafe",
                                        padding: "2px 8px",
                                        borderRadius: 12,
                                        flexShrink: 0,
                                      }}
                                    >
                                      {ctrl.clause}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: "#1e293b",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {ctrl.label}
                                    </span>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      padding: "2px 8px",
                                      borderRadius: 10,
                                      flexShrink: 0,
                                      marginLeft: 8,
                                      background: isScored
                                        ? "#d1fae5"
                                        : "#f1f5f9",
                                      color: isScored ? "#065f46" : "#94a3b8",
                                    }}
                                  >
                                    {isScored ? "✓ Scored" : "Pending"}
                                  </span>
                                </button>

                                {ctrlOpen && (
                                  <div style={{ background: "#fff" }}>
                                    {questions.length > 0 && (
                                      <div
                                        style={{
                                          padding: "10px 32px 0",
                                          borderTop: "1px solid #f1f5f9",
                                        }}
                                      >
                                        <p
                                          style={{
                                            margin: "0 0 6px",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#94a3b8",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                          }}
                                        >
                                          Audit Questions
                                        </p>
                                        {questions.map(function (q, qi) {
                                          var qText =
                                            typeof q === "string"
                                              ? q
                                              : q.text || String(q);
                                          return (
                                            <div
                                              key={qi}
                                              style={{
                                                display: "flex",
                                                gap: 8,
                                                marginBottom: 6,
                                                padding: "6px 0",
                                                borderBottom:
                                                  "1px solid #f8fafc",
                                              }}
                                            >
                                              <span
                                                style={{
                                                  fontSize: 11,
                                                  fontWeight: 700,
                                                  color: "#94a3b8",
                                                  flexShrink: 0,
                                                  minWidth: 18,
                                                }}
                                              >
                                                {qi + 1}.
                                              </span>
                                              <p
                                                style={{
                                                  margin: 0,
                                                  fontSize: 12,
                                                  color: "#334155",
                                                  lineHeight: 1.5,
                                                }}
                                              >
                                                {qText}
                                              </p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    <div
                                      style={{
                                        padding: "12px 32px 16px",
                                        background: "#fafafa",
                                        borderTop: "1px solid #f1f5f9",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "grid",
                                          gridTemplateColumns: "1fr 1fr",
                                          gap: 12,
                                        }}
                                      >
                                        <div>
                                          <label
                                            style={Object.assign(
                                              {},
                                              labelStyle,
                                              { marginBottom: 4 },
                                            )}
                                          >
                                            Document Score
                                          </label>
                                          <select
                                            value={s.docScore || ""}
                                            onChange={function (e) {
                                              setScore(
                                                ctrl.controlId,
                                                "docScore",
                                                e.target.value,
                                              );
                                            }}
                                            style={selectStyle}
                                          >
                                            <option value="">N/A</option>
                                            <option value="0">
                                              0 — Not implemented
                                            </option>
                                            <option value="1">
                                              1 — Partially implemented
                                            </option>
                                            <option value="2">
                                              2 — Fully implemented
                                            </option>
                                          </select>
                                        </div>
                                        <div>
                                          <label
                                            style={Object.assign(
                                              {},
                                              labelStyle,
                                              { marginBottom: 4 },
                                            )}
                                          >
                                            Practice Score
                                          </label>
                                          <select
                                            value={s.practiceScore || ""}
                                            onChange={function (e) {
                                              setScore(
                                                ctrl.controlId,
                                                "practiceScore",
                                                e.target.value,
                                              );
                                            }}
                                            style={selectStyle}
                                          >
                                            <option value="">N/A</option>
                                            <option value="0">
                                              0 — Not practised
                                            </option>
                                            <option value="1">
                                              1 — Partially practised
                                            </option>
                                            <option value="2">
                                              2 — Fully practised
                                            </option>
                                          </select>
                                        </div>
                                        <div style={{ gridColumn: "1 / -1" }}>
                                          <label
                                            style={Object.assign(
                                              {},
                                              labelStyle,
                                              { marginBottom: 4 },
                                            )}
                                          >
                                            Remarks
                                          </label>
                                          <textarea
                                            rows={2}
                                            value={s.remarks || ""}
                                            onChange={function (e) {
                                              setScore(
                                                ctrl.controlId,
                                                "remarks",
                                                e.target.value,
                                              );
                                            }}
                                            placeholder="Observations, evidence references, gaps found..."
                                            style={Object.assign(
                                              {},
                                              inputStyle,
                                              { resize: "none" },
                                            )}
                                          />
                                        </div>
                                      </div>
                                      {(s.docScore !== "" ||
                                        s.practiceScore !== "") && (
                                        <div
                                          style={{
                                            marginTop: 8,
                                            fontSize: 12,
                                            color: "#475569",
                                            fontWeight: 600,
                                          }}
                                        >
                                          Total:{" "}
                                          {parseInt(s.docScore || 0) +
                                            parseInt(s.practiceScore || 0)}{" "}
                                          / 4
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}

              <div style={{ padding: "12px 24px 20px" }}>
                {error && (
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#991b1b",
                      marginBottom: 10,
                    }}
                  >
                    {error}
                  </div>
                )}
                {success && (
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#166534",
                    }}
                  >
                    {success}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Team Progress sub-modal (rendered outside Modal to avoid stacking) ── */}
      {teamAudit && (
        <TeamProgressModal
          audit={teamAudit}
          userMap={userMap}
          currentUserId={userId}
          fwMetaByCode={fwMetaByCode}
          onClose={function () {
            setTeamAudit(null);
          }}
        />
      )}
    </>
  );
}

export default ConductAuditModal;
