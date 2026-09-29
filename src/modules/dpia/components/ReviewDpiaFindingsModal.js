import React, { useState, useEffect } from "react";
import {
  ChevronRight, ShieldCheck, MessageSquarePlus, CheckCircle2,
  AlertCircle, RefreshCw, ChevronDown,
} from "lucide-react";
import { Modal, ModalHeader, Spinner } from "./ui";
import {
  getSessionUser, inputStyle, selectStyle, labelStyle, btnPrimary,
} from "../utils/helpers";
import {
  getMyDpiaAssignments, getComplianceDashboard, logDpiaFindingAction,
} from "../services/dpiaApi";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function severityColor(s) {
  const u = (s || "").toUpperCase();
  if (u === "HIGH")     return { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" };
  if (u === "CRITICAL") return { bg: "#ffedd5", color: "#7c2d12", border: "#fdba74" };
  if (u === "MEDIUM")   return { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" };
  return { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" };
}

function actionStatusBadge(status) {
  const s = (status || "").toUpperCase();
  if (s === "RESOLVED")    return { bg: "#d1fae5", color: "#065f46" };
  if (s === "IN_PROGRESS") return { bg: "#dbeafe", color: "#1e40af" };
  if (s === "PENDING")     return { bg: "#fef3c7", color: "#92400e" };
  return { bg: "#f1f5f9", color: "#475569" };
}

// ─────────────────────────────────────────────
// REVIEW DPIA FINDINGS MODAL  (risk owner)
// ─────────────────────────────────────────────
export function ReviewDpiaFindingsModal({ onClose }) {
  const sessionUser = getSessionUser();
  const userId = sessionUser.id || sessionUser._id || "";

  const [assignments,  setAssignments]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState(null);   // chosen assignment
  const [dashboard,    setDashboard]    = useState(null);   // compliance issues
  const [dashLoading,  setDashLoading]  = useState(false);
  const [error,        setError]        = useState("");
  const [actionForm,   setActionForm]   = useState(null);   // { issueKey, ... }
  const [saving,       setSaving]       = useState(false);
  const [actionStatus, setActionStatus] = useState({});     // { issueKey: { status, note } }
  const [filterSev,    setFilterSev]    = useState("ALL");

  useEffect(() => {
    getMyDpiaAssignments(userId)
      .then(data => setAssignments(data || []))
      .catch(err => setError(err.message || "Failed to load assignments"))
      .finally(() => setLoading(false));
  }, [userId]);

  async function openAssignment(a) {
    setSelected(a);
    setDashboard(null);
    setDashLoading(true);
    setActionForm(null);
    setActionStatus({});
    try {
      const data = await getComplianceDashboard(a.dpiaId);
      setDashboard(data);
      // Seed existing actions if returned
      const statusMap = {};
      (data?.issues || []).forEach(issue => {
        const key = `${issue.section}-${issue.questionNumber}`;
        if (issue.actionStatus) {
          statusMap[key] = { status: issue.actionStatus, note: issue.actionNote || "" };
        }
      });
      setActionStatus(statusMap);
    } catch {
      setDashboard(null);
    } finally {
      setDashLoading(false);
    }
  }

  function issueKey(issue) {
    return `${issue.section}-${issue.questionNumber}`;
  }

  async function submitAction() {
    if (!actionForm) return;
    setSaving(true);
    setError("");
    try {
      await logDpiaFindingAction(selected.dpiaId, {
        section:        actionForm.section,
        questionNumber: actionForm.questionNumber,
        actionStatus:   actionForm.status,
        actionNote:     actionForm.note,
        actionBy:       userId,
      });
      // Update local state
      setActionStatus(prev => ({
        ...prev,
        [issueKey(actionForm)]: { status: actionForm.status, note: actionForm.note },
      }));
      setActionForm(null);
    } catch (err) {
      setError(err.message || "Failed to log action");
    } finally {
      setSaving(false);
    }
  }

  const filteredIssues = (dashboard?.issues || []).filter(issue =>
    filterSev === "ALL" ? true : (issue.severity || "").toUpperCase() === filterSev
  );

  const resolvedCount = Object.values(actionStatus).filter(a => a.status === "RESOLVED").length;
  const totalIssues   = (dashboard?.issues || []).length;

  return (
    <Modal onClose={onClose} wide={true}>
      <ModalHeader
        title="Review DPIA Findings"
        subtitle={selected ? (selected.projectName || `DPIA ${selected.dpiaId?.slice(-8)}`) : "Select a DPIA"}
        onClose={onClose}
      />

      <div style={{ padding: "16px 28px 8px", maxHeight: "74vh", overflowY: "auto" }}>
        {loading && <Spinner />}
        {error && (
          <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, fontSize: 13, color: "#991b1b", marginBottom: 12 }}>
            {error}
          </div>
        )}

        {/* ── Assignment list ── */}
        {!loading && !selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {assignments.map(a => (
              <button
                key={a.id}
                onClick={() => openAssignment(a)}
                style={{ textAlign: "left", border: "1px solid #f1f5f9", borderRadius: 14, padding: 16, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ShieldCheck size={18} color="#fff" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                      {a.projectName || `DPIA ${a.dpiaId?.slice(-8)}`}
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
                      Due: {a.dueDate || "—"} · {a.status}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} color="#cbd5e1" />
              </button>
            ))}
            {assignments.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                <AlertCircle size={32} color="#e2e8f0" style={{ margin: "0 auto 12px" }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>No DPIA assignments found.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Findings detail ── */}
        {selected && (
          <div>
            <button
              onClick={() => { setSelected(null); setDashboard(null); setActionForm(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 16 }}
            >
              ← Back to list
            </button>

            {dashLoading && <Spinner />}

            {!dashLoading && dashboard && (
              <>
                {/* Summary bar */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "Total",     value: totalIssues,           color: "#475569", bg: "#f8fafc" },
                    { label: "High",      value: dashboard.highCount,   color: "#991b1b", bg: "#fee2e2" },
                    { label: "Medium",    value: dashboard.mediumCount, color: "#92400e", bg: "#fef3c7" },
                    { label: "Resolved",  value: resolvedCount,         color: "#065f46", bg: "#d1fae5" },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} style={{ background: bg, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color }}>{value ?? 0}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600 }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                {totalIssues > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                      <span>Remediation Progress</span>
                      <span style={{ fontWeight: 700, color: "#7c3aed" }}>
                        {resolvedCount}/{totalIssues} resolved
                      </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "#e2e8f0", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.round((resolvedCount / totalIssues) * 100)}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 4, transition: "width 0.4s" }} />
                    </div>
                  </div>
                )}

                {/* Severity filter */}
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {["ALL", "HIGH", "MEDIUM", "LOW"].map(sev => (
                    <button
                      key={sev}
                      onClick={() => setFilterSev(sev)}
                      style={{ padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: filterSev === sev ? "#7c3aed" : "#f1f5f9", color: filterSev === sev ? "#fff" : "#475569" }}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                {/* Issues list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredIssues.map((issue, i) => {
                    const sev    = severityColor(issue.severity);
                    const key    = issueKey(issue);
                    const action = actionStatus[key];
                    const abadge = action ? actionStatusBadge(action.status) : null;

                    return (
                      <div key={i} style={{ border: `1px solid ${sev.border}`, borderRadius: 12, overflow: "hidden" }}>
                        {/* Issue header */}
                        <div style={{ padding: "12px 14px", background: sev.bg + "55" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                                  {issue.severity}
                                </span>
                                <span style={{ fontSize: 11, fontFamily: "monospace", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 6 }}>
                                  {issue.section} · Q{issue.questionNumber}
                                </span>
                                {abadge && (
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: abadge.bg, color: abadge.color }}>
                                    {action.status.replace("_", " ")}
                                  </span>
                                )}
                              </div>
                              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#334155" }}>
                                {issue.nonCompliance}
                              </p>
                              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#64748b" }}>
                                <strong>Risk:</strong> {issue.risk}
                              </p>
                              <p style={{ margin: 0, fontSize: 12, color: "#475569", fontStyle: "italic" }}>
                                <strong>Recommendation:</strong> {issue.recommendation}
                              </p>
                              {action?.note && (
                                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#7c3aed", fontWeight: 600 }}>
                                  Action note: {action.note}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => setActionForm({
                                section:        issue.section,
                                questionNumber: issue.questionNumber,
                                status:         action?.status || "IN_PROGRESS",
                                note:           action?.note   || "",
                              })}
                              style={{ flexShrink: 0, background: action ? "#f5f3ff" : "#7c3aed", color: action ? "#7c3aed" : "#fff", border: action ? "1px solid #ddd6fe" : "none", cursor: "pointer", fontSize: 12, fontWeight: 700, padding: "7px 12px", borderRadius: 9, display: "flex", alignItems: "center", gap: 5 }}
                            >
                              <MessageSquarePlus size={13} />
                              {action ? "Update" : "Log Action"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredIssues.length === 0 && (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                      <CheckCircle2 size={32} color="#10b981" style={{ margin: "0 auto 8px" }} />
                      <p style={{ margin: 0, fontSize: 13, color: "#065f46", fontWeight: 600 }}>No {filterSev !== "ALL" ? filterSev.toLowerCase() : ""} issues found.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {!dashLoading && !dashboard && (
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 24 }}>
                Could not load compliance findings.
              </p>
            )}

            {/* ── Log Action form ── */}
            {actionForm && (
              <div style={{ border: "2px solid #a5b4fc", borderRadius: 14, padding: 20, marginTop: 16, background: "rgba(238,242,255,0.6)", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MessageSquarePlus size={16} color="#4f46e5" />
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#3730a3" }}>
                    Log Remediation Action
                  </h4>
                  <span style={{ fontSize: 11, fontFamily: "monospace", background: "#e0e7ff", color: "#3730a3", padding: "2px 7px", borderRadius: 6 }}>
                    {actionForm.section} · Q{actionForm.questionNumber}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Action Status</label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={actionForm.status}
                        onChange={e => setActionForm(p => ({ ...p, status: e.target.value }))}
                        style={selectStyle}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                      <ChevronDown size={14} color="#94a3b8" style={{ position: "absolute", right: 10, top: 11, pointerEvents: "none" }} />
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Action Note</label>
                    <textarea
                      rows={3}
                      value={actionForm.note}
                      onChange={e => setActionForm(p => ({ ...p, note: e.target.value }))}
                      placeholder="Describe the action taken or planned..."
                      style={{ ...inputStyle, resize: "none" }}
                    />
                  </div>
                </div>

                {error && (
                  <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#991b1b" }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={submitAction}
                    disabled={saving}
                    style={{ ...btnPrimary, flex: 1, background: saving ? "#94a3b8" : "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    {saving ? <RefreshCw size={13} /> : <CheckCircle2 size={13} />}
                    {saving ? "Saving..." : "Save Action"}
                  </button>
                  <button
                    onClick={() => { setActionForm(null); setError(""); }}
                    style={{ padding: "10px 20px", borderRadius: 12, background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: "12px 28px 24px" }}>
        <button onClick={onClose} style={{ width: "100%", padding: 11, borderRadius: 12, background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>
          Close
        </button>
      </div>
    </Modal>
  );
}

export default ReviewDpiaFindingsModal;