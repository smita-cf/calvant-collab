import React, { useState, useEffect } from "react";
import { ChevronRight, ShieldCheck, Clock, AlertCircle } from "lucide-react";
import { Modal, ModalHeader, Spinner } from "./ui";
import { getSessionUser } from "../utils/helpers";
import * as dpiaApi from "../services/dpiaApi";
import { useRouter } from "next/navigation";
import { captureActivity, ACTIONS } from "../../../services/activities";
// ─── helpers ──────────────────────────────────────────────────────────────────
function assignmentBadge(status) {
  if (!status) return { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
  const s = status.toUpperCase();
  if (s === "PENDING")
    return { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" };
  if (s === "IN_REVIEW")
    return { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
  if (s === "COMPLETED")
    return { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" };
  if (s === "OVERDUE")
    return { bg: "#fef2f2", color: "#991b1b", border: "#fca5a5" };
  return { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
}

function riskStyle(level) {
  if (!level) return { bg: "#f1f5f9", color: "#64748b" };
  const l = level.toUpperCase();
  if (l === "HIGH") return { bg: "#fee2e2", color: "#991b1b" };
  if (l === "MEDIUM") return { bg: "#fef3c7", color: "#92400e" };
  if (l === "LOW") return { bg: "#d1fae5", color: "#065f46" };
  return { bg: "#f1f5f9", color: "#64748b" };
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function daysUntilDue(dueDate) {
  if (!dueDate) return null;
  const diff = Math.ceil(
    (new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24),
  );
  return diff;
}

// ─── VIEW MY DPIAS MODAL ──────────────────────────────────────────────────────
export function ViewMyDpiasModal({ onClose }) {
  const sessionUser = getSessionUser();
  const userId = sessionUser.id || sessionUser._id || "";

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // expanded assignment
  const [dpiaDetail, setDpiaDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const orgId = sessionUser.organization || sessionUser.organizationId || "";
    dpiaApi
      .getDpiaAssignments(orgId)
      .then((data) => {
        const mine = (data || []).filter(
          (a) => String(a.assignedTo) === String(userId),
        );
        setAssignments(mine);
        setLoading(false);
        captureActivity({
          action: ACTIONS.PAGE_LOAD,
          item: "DPIA · Opened: My Assigned DPIAs Modal",
          url: window.pathname
        });
      })
      .catch(() => setLoading(false));
  }, [userId]);

  function viewDetail(assignment) {
    setSelected(assignment);
    setDetailLoading(true);
    dpiaApi
      .getAssessment(assignment.dpiaId)
      .then((data) => {
        setDpiaDetail(data);
        setDetailLoading(false);
        captureActivity({
          action: ACTIONS.CLICK,
          item: `DPIA · Viewed Detail for Assessment: ${assignment.projectName || assignment.dpiaId}`,
          url: window.pathname,
          dpiaId: assignment.dpiaId
        });
      })
      .catch(() => {
        setDpiaDetail(null);
        setDetailLoading(false);
      });
  }

  function goBack() {
    setSelected(null);
    setDpiaDetail(null);
  }

  // ── List view ──
  const listView = (
    <div>
      {loading && <Spinner />}
      {!loading && assignments.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
          <ShieldCheck
            size={40}
            color="#cbd5e1"
            style={{ margin: "0 auto 14px" }}
          />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
            No DPIAs assigned to you yet.
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12 }}>
            Your root user will assign assessments here.
          </p>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {assignments.map((a) => {
          const badge = assignmentBadge(a.status);
          const overdue = isOverdue(a.dueDate) && a.status !== "COMPLETED";
          const days = daysUntilDue(a.dueDate);
          const rl = riskStyle(a.overallRiskLevel || "");

          return (
            <button
              key={a.id || a._id}
              onClick={() => viewDetail(a)}
              style={{
                textAlign: "left",
                border: "1px solid #f1f5f9",
                borderRadius: 14,
                padding: 16,
                background: "#fff",
                cursor: "pointer",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                      marginBottom: 6,
                      flexWrap: "wrap",
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
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {a.status || "PENDING"}
                    </span>
                    {overdue && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          background: "#fef2f2",
                          color: "#991b1b",
                          padding: "2px 8px",
                          borderRadius: 20,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <AlertCircle size={10} /> Overdue
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {a.projectName || a.dpiaId}
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 12,
                      color: "#94a3b8",
                    }}
                  >
                    Assigned by: {a.assignedByName || "—"} ·{" "}
                    {days !== null ? (
                      days >= 0 ? (
                        <span>
                          Due in{" "}
                          <strong
                            style={{ color: days <= 3 ? "#dc2626" : "#475569" }}
                          >
                            {days}d
                          </strong>
                        </span>
                      ) : (
                        <span style={{ color: "#dc2626" }}>
                          Overdue by {Math.abs(days)}d
                        </span>
                      )
                    ) : (
                      "No due date"
                    )}
                  </p>
                  {a.notes && (
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 12,
                        color: "#64748b",
                        fontStyle: "italic",
                      }}
                    >
                      Note: "{a.notes}"
                    </p>
                  )}
                </div>
                <ChevronRight
                  size={18}
                  color="#cbd5e1"
                  style={{ flexShrink: 0, marginTop: 4 }}
                />
              </div>

              {/* Due date progress bar */}
              {a.dueDate && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Clock size={12} color="#94a3b8" />
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    Due: {a.dueDate}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Detail view ──
  const detailView = selected && (
    <div>
      <button
        onClick={goBack}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#7c3aed",
          fontSize: 13,
          fontWeight: 600,
          padding: 0,
          marginBottom: 16,
        }}
      >
        ← Back to my DPIAs
      </button>

      {detailLoading && <Spinner />}

      {!detailLoading && (
        <>
          {/* Assignment meta */}
          <div
            style={{
              background: "#fdf4ff",
              border: "1px solid #e9d5ff",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 18,
            }}
          >
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 13,
                fontWeight: 700,
                color: "#5b21b6",
              }}
            >
              {selected.projectName || selected.dpiaId}
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                <strong>Due Date:</strong>{" "}
                {selected.dueDate
                  ? new Date(selected.dueDate).toLocaleDateString("en-GB")
                  : "—"}
              </span>
            </div>
            {selected.notes && (
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 12,
                  color: "#7c3aed",
                  fontStyle: "italic",
                }}
              >
                "{selected.notes}"
              </p>
            )}
          </div>

          {/* DPIA details */}
          {dpiaDetail ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#475569",
                }}
              >
                Assessment Details
              </h4>

              {[
                { label: "DPIA ID", value: dpiaDetail.projectName },
                { label: "Organization", value: dpiaDetail.organizationName },
                { label: "Department", value: dpiaDetail.departmentId },
                { label: "Overall Risk", value: dpiaDetail.overallRiskLevel },
              ].map(({ label, value }) =>
                value ? (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "10px 14px",
                      border: "1px solid #f1f5f9",
                      borderRadius: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#94a3b8",
                        minWidth: 130,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: "#1e293b",
                        fontWeight: 500,
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ) : null,
              )}

              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#94a3b8" }}>
                For full compliance findings, use the "Review Findings" action.
              </p>
              <button
                onClick={() => {
                  router.push(`/dpia/${selected.dpiaId}`);
                  onClose();
                }}
                style={{
                  marginTop: 16,
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "#7c3aed",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Conduct DPIA
              </button>
            </div>
          ) : (
            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
                textAlign: "center",
                padding: 24,
              }}
            >
              Could not load DPIA details.
            </p>
          )}
        </>
      )}
    </div>
  );

  return (
    <Modal onClose={onClose} wide={true}>
      <ModalHeader
        title="My Assigned DPIAs"
        subtitle={
          selected
            ? selected.projectName || selected.dpiaId
            : `${assignments.length} assignment${assignments.length !== 1 ? "s" : ""}`
        }
        onClose={onClose}
      />
      <div
        style={{
          padding: "16px 28px 8px",
          maxHeight: "65vh",
          overflowY: "auto",
        }}
      >
        {selected ? detailView : listView}
      </div>
      <div style={{ padding: "12px 28px 24px" }}>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: 11,
            borderRadius: 12,
            background: "#f1f5f9",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            color: "#475569",
          }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

export default ViewMyDpiasModal;

