import Link from 'next/link';
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import { getCompliance } from "../services/dpiaApi";
import riskService from "../../riskAssesment/services/riskService";

const SEV = {
  HIGH: { bg: "#fef2f2", color: "#b91c1c", border: "#fca5a5", dot: "🔴" },
  MEDIUM: { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", dot: "🟡" },
  LOW: { bg: "#f0fdf4", color: "#15803d", border: "#86efac", dot: "🟢" },
};
const STA = {
  "Non-Compliant": { bg: "#fef2f2", color: "#b91c1c", border: "#fca5a5" },
  Compliant: { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
};

const S = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(160deg,#eef3fb,#f4f7fd 50%,#edf5f3)",
    fontFamily: "'DM Sans',sans-serif",
    padding: "32px 24px",
  },
  maxW: { maxWidth: 1200, margin: "0 auto" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: "1px solid #dde3ef",
  },
  logo: {
    background: "linear-gradient(135deg,#0f2247,#1e6ec8)",
    borderRadius: 10,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 900,
    fontSize: 18,
  },
  logoText: { fontSize: 18, fontWeight: 800, color: "#0f2247" },
  logoSub: { fontSize: 12, color: "#6b7280", fontWeight: 500 },
  backBtn: {
    background: "transparent",
    border: "1.5px solid #3b82f6",
    color: "#3b82f6",
    borderRadius: 8,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif",
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 14,
    marginBottom: 24,
  },
  statCard: (a) => ({
    background: "#fff",
    borderRadius: 12,
    padding: "16px 20px",
    border: `1px solid ${a}33`,
    borderLeft: `4px solid ${a}`,
    boxShadow: "0 1px 5px rgba(15,34,71,0.06)",
  }),
  statLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: 6,
  },
  statVal: (a) => ({ fontSize: 28, fontWeight: 800, color: a, lineHeight: 1 }),
  statSub: { fontSize: 11, color: "#9ca3af", marginTop: 4 },
  banner: (r) => ({
    background: SEV[r]?.bg || "#f0f4fb",
    border: `1.5px solid ${SEV[r]?.border || "#dde3ef"}`,
    borderRadius: 12,
    padding: "14px 20px",
    marginBottom: 24,
    display: "flex",
    alignItems: "center",
    gap: 12,
  }),
  bannerTxt: (r) => ({
    fontSize: 15,
    fontWeight: 800,
    color: SEV[r]?.color || "#374151",
  }),
  bannerSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  filterRow: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  filterBtn: (on, a) => ({
    background: on ? `${a}14` : "#fff",
    border: `1.5px solid ${on ? a : "#dde3ef"}`,
    color: on ? a : "#374151",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: on ? 700 : 500,
    cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif",
  }),
  card: {
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #e4eaf4",
    boxShadow: "0 1px 6px rgba(15,34,71,0.06)",
    overflow: "hidden",
  },
  cardHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #eef1f8",
    background: "linear-gradient(90deg,#0f224708,transparent)",
  },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "#111827" },
  countBadge: {
    background: "#eef3fb",
    color: "#1a3a6e",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 700,
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    background: "#f0f4fb",
    color: "#374151",
    fontWeight: 700,
    padding: "10px 14px",
    textAlign: "left",
    borderBottom: "2px solid #dde3ef",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #eef1f8",
    verticalAlign: "top",
  },
  badge: (map, k) => {
    const s = map[k] || { bg: "#f0f4fb", color: "#6b7280", border: "#dde3ef" };
    return {
      display: "inline-block",
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: 20,
      padding: "3px 10px",
      fontSize: 11,
      fontWeight: 700,
      whiteSpace: "nowrap",
    };
  },
  sectionTag: {
    display: "inline-block",
    background: "#eef3fb",
    color: "#1a3a6e",
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
  },
  emptyBox: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
  },
  errBox: {
    background: "#fef2f2",
    border: "1.5px solid #fca5a5",
    borderRadius: 10,
    padding: "14px 18px",
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 20,
  },
  addBtn: (st) => ({
    fontFamily: "'DM Sans',sans-serif",
    fontSize: 11,
    fontWeight: 700,
    border: "none",
    borderRadius: 6,
    padding: "5px 10px",
    cursor: st === "adding" || st === "added" ? "default" : "pointer",
    whiteSpace: "nowrap",
    ...(st === "idle" && { background: "#e0f2fe", color: "#0369a1" }),
    ...(st === "adding" && { background: "#e5e7eb", color: "#9ca3af" }),
    ...(st === "added" && { background: "#dcfce7", color: "#15803d" }),
    ...(st === "error" && { background: "#fef2f2", color: "#b91c1c" }),
  }),
  toast: (show) => ({
    position: "fixed",
    bottom: 28,
    left: "50%",
    transform: show
      ? "translateX(-50%) translateY(0)"
      : "translateX(-50%) translateY(20px)",
    background: "#0f2247",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 22px",
    fontSize: 13,
    fontWeight: 600,
    zIndex: 9999,
    pointerEvents: "none",
    opacity: show ? 1 : 0,
    transition: "all 0.25s ease",
  }),
};

// ─── Generate Risk ID — mirrors MultiStepFormManager exactly ─────────────────
// 1. getAllRisks() (no org param — same as MultiStepFormManager)
// 2. Filter client-side by org._id
// 3. Find next unused RR-YYYY-NNN (3-digit padded, same as MultiStepFormManager)
async function generateRiskId(organization) {
  const currentYear = new Date().getFullYear();
  try {
    const allRisks = await riskService.getAllRisks();
    const userOrgId = organization?._id || organization;

    // Mirror the same client-side org filter as MultiStepFormManager
    const orgRiskIds = allRisks
      .filter((risk) => {
        const riskOrgId = risk.organization?._id || risk.organization;
        return String(riskOrgId) === String(userOrgId);
      })
      .map((risk) => risk.riskId);

    // Mirror the same do-while loop with padStart(3) as MultiStepFormManager
    let nextNumber = 1;
    let newRiskId = "";
    do {
      const paddedNumber = nextNumber.toString().padStart(3, "0");
      newRiskId = `RR-${currentYear}-${paddedNumber}`;
      nextNumber++;
    } while (orgRiskIds.includes(newRiskId));

    return newRiskId;
  } catch {
    // Fallback if fetch fails
    return `RR-${currentYear}-${String(Date.now()).slice(-3)}`;
  }
}

// ─── Build risk payload ───────────────────────────────────────────────────────
async function buildRiskPayload(row, user, assessmentId, effectiveOrgId) {
  const org = effectiveOrgId;
  const riskId = await generateRiskId(org);
  const severity = (row.severity || "").toUpperCase();
  const riskLevel =
    severity === "HIGH" ? "High" : severity === "MEDIUM" ? "Medium" : "Low";
  const today = new Date().toISOString().split("T")[0];

  return {
    riskId,
    organization: org?._id || org || "",
    department: user?.department ?? user?.departments?.[0]?.name ?? "",
    date: today,
    riskType: ["Privacy"],
    assetType: "",
    asset: "",
    location: "",
    // Only the risk scenario sentence — nothing else
    riskDescription: row.risk || "",
    additionalControls: row.recommendation ?? "",
    existingControls: "",
    controlReference: [],
    status: "Open",
    riskLevel,
    numberOfDays: "",
    deadlineDate: "",
    // Full DPIA context stored separately for audit
    additionalNotes: [
      `DPIA Assessment: ${assessmentId}`,
      `Section: ${row.section}  |  Q${row.questionNumber ?? ""}`,
      row.questionText ? `Issue: ${row.questionText}` : null,
      row.nonCompliance ? `Gap: ${row.nonCompliance}` : null,
      row.recommendation ? `Recommendation: ${row.recommendation}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ComplianceDashboard() {
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
  const { id } = useParams();
  const router = useRouter();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [addState, setAddState] = useState({});
  const [toast, setToast] = useState({ show: false, msg: "" });

  useEffect(() => {
    getCompliance(id)
      .then(setResult)
      .catch((err) =>
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load compliance data",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  function showToast(msg) {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  }

  async function handleAddToRisks(row, rowKey) {
    if (addState[rowKey] === "adding" || addState[rowKey] === "added") return;
    setAddState((p) => ({ ...p, [rowKey]: "adding" }));
    try {
      const payload = await buildRiskPayload(row, user, id, effectiveOrgId);
      await riskService.saveRisk(payload);
      setAddState((p) => ({ ...p, [rowKey]: "added" }));
      showToast(`✅ ${payload.riskId} added to risk register`);
    } catch (err) {
      console.error("Failed to add risk:", err);
      setAddState((p) => ({ ...p, [rowKey]: "error" }));
      showToast("⚠️ Failed to add risk");
      setTimeout(() => setAddState((p) => ({ ...p, [rowKey]: "idle" })), 3000);
    }
  }

  const issues = (result?.issues ?? [])
    .map((r) => ({
      ...r,
      severity: typeof r.severity === "object" ? r.severity?.name : r.severity,
    }))
    .sort((a, b) => (a.helper1 ?? 0) - (b.helper1 ?? 0));

  const filtered = issues.filter((r) => {
    if (filter === "ALL") return true;
    if (filter === "Non-Compliant")
      return r.complianceStatus === "Non-Compliant";
    return (r.severity || "").toUpperCase() === filter;
  });

  const overallRisk =
    result?.highCount > 0
      ? "HIGH"
      : result?.mediumCount > 0
        ? "MEDIUM"
        : result?.lowCount > 0
          ? "LOW"
          : null;

  return (
    <div style={S.root}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}} .cr-row:hover td{background:#f0f5ff!important}`}</style>

      <div style={S.toast(toast.show)}>{toast.msg}</div>

      <div style={S.maxW}>
        {/* Header */}
        <div style={S.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={S.logo}>U</div>
            <div>
              <div style={S.logoText}>Compliance Results</div>
              <div style={S.logoSub}>
                {effectiveOrgId?.name ??
                  effectiveOrgId ??
                  "Organisation"}{" "}
                · Assessment: {id}
              </div>
            </div>
          </div>
          <button style={S.backBtn} onClick={() => router.push("/dpia")}>
            ← Back
          </button>
        </div>

        {error && <div style={S.errBox}>⚠ {error}</div>}

        {/* Stats */}
        <div style={S.summaryRow}>
          {[
            {
              label: "Total Issues",
              value: result?.totalIssues ?? "—",
              accent: "#1e6ec8",
            },
            {
              label: "High Severity",
              value: result?.highCount ?? "—",
              accent: "#ef4444",
            },
            {
              label: "Medium Severity",
              value: result?.mediumCount ?? "—",
              accent: "#f59e0b",
            },
            {
              label: "Low Severity",
              value: result?.lowCount ?? "—",
              accent: "#10b981",
            },
          ].map(({ label, value, accent }) => (
            <div key={label} style={S.statCard(accent)}>
              <div style={S.statLabel}>{label}</div>
              <div style={S.statVal(accent)}>{loading ? "—" : value}</div>
              <div style={S.statSub}>Non-compliant findings</div>
            </div>
          ))}
        </div>

        {/* Risk banner */}
        {!loading && overallRisk && (
          <div style={S.banner(overallRisk)}>
            <span style={{ fontSize: 24 }}>{SEV[overallRisk]?.dot}</span>
            <div>
              <div style={S.bannerTxt(overallRisk)}>
                Overall Risk Level: {overallRisk}
              </div>
              <div style={S.bannerSub}>
                {result.highCount} high · {result.mediumCount} medium ·{" "}
                {result.lowCount} low
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={S.filterRow}>
          {[
            { key: "ALL", label: `All (${issues.length})`, accent: "#1a3a6e" },
            {
              key: "Non-Compliant",
              label: `Non-Compliant (${issues.filter((r) => r.complianceStatus === "Non-Compliant").length})`,
              accent: "#b91c1c",
            },
            {
              key: "HIGH",
              label: `High (${result?.highCount ?? 0})`,
              accent: "#ef4444",
            },
            {
              key: "MEDIUM",
              label: `Medium (${result?.mediumCount ?? 0})`,
              accent: "#f59e0b",
            },
            {
              key: "LOW",
              label: `Low (${result?.lowCount ?? 0})`,
              accent: "#10b981",
            },
          ].map(({ key, label, accent }) => (
            <button
              key={key}
              style={S.filterBtn(filter === key, accent)}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div style={S.cardTitle}>Compliance Findings</div>
            {!loading && (
              <span style={S.countBadge}>{filtered.length} shown</span>
            )}
          </div>

          {loading ? (
            <div style={S.emptyBox}>⏳ Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={S.emptyBox}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>
                {filter === "ALL" ? "✅" : "🔍"}
              </div>
              <div style={{ fontWeight: 600, color: "#374151" }}>
                {filter === "ALL"
                  ? "No compliance issues found"
                  : `No ${filter} issues`}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {[
                      "Section",
                      "Question",
                      "Status",
                      "Severity",
                      "Risk",
                      "Recommendation",
                      "Action",
                    ].map((h) => (
                      <th key={h} style={S.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => {
                    const rowKey = `${row.section}-Q${row.questionNumber}-${i}`;
                    const btnState = addState[rowKey] ?? "idle";
                    const sevKey = (row.severity || "").toUpperCase();
                    return (
                      <tr
                        key={i}
                        className="cr-row"
                        style={{
                          background: i % 2 === 0 ? "#fff" : "#fafbfd",
                          animation: `fadeIn 0.15s ease both`,
                          animationDelay: `${i * 0.025}s`,
                        }}
                      >
                        <td style={{ ...S.td, minWidth: 90 }}>
                          <span style={S.sectionTag}>{row.section || "—"}</span>
                          {row.questionNumber && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "#9ca3af",
                                marginTop: 2,
                              }}
                            >
                              Q{row.questionNumber}
                            </div>
                          )}
                        </td>

                        <td style={{ ...S.td, maxWidth: 300 }}>
                          <div
                            style={{
                              fontSize: 12.5,
                              color: "#374151",
                              lineHeight: 1.5,
                            }}
                          >
                            {row.questionText || "—"}
                          </div>
                          {row.nonCompliance && (
                            <div
                              style={{
                                fontSize: 11.5,
                                color: "#b91c1c",
                                fontStyle: "italic",
                                marginTop: 4,
                              }}
                            >
                              ↳ {row.nonCompliance}
                            </div>
                          )}
                        </td>

                        <td style={S.td}>
                          <span style={S.badge(STA, row.complianceStatus)}>
                            {row.complianceStatus}
                          </span>
                        </td>

                        <td style={S.td}>
                          <span style={S.badge(SEV, sevKey)}>
                            {SEV[sevKey]?.dot} {row.severity}
                          </span>
                        </td>

                        {/* Risk — only the scenario sentence */}
                        <td style={{ ...S.td, maxWidth: 260 }}>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#374151",
                              lineHeight: 1.5,
                              background: SEV[sevKey]?.bg || "#f9fafb",
                              border: `1px solid ${SEV[sevKey]?.border || "#e5e7eb"}`,
                              borderRadius: 8,
                              padding: "8px 10px",
                            }}
                          >
                            {row.risk || "—"}
                          </div>
                        </td>

                        <td style={{ ...S.td, maxWidth: 280 }}>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#6b7280",
                              lineHeight: 1.5,
                            }}
                          >
                            {row.recommendation || "—"}
                          </div>
                        </td>

                        <td
                          style={{
                            ...S.td,
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          <button
                            style={S.addBtn(btnState)}
                            onClick={() => handleAddToRisks(row, rowKey)}
                            disabled={
                              btnState === "adding" || btnState === "added"
                            }
                          >
                            {btnState === "idle" && "＋ Add to Risks"}
                            {btnState === "adding" && "Saving…"}
                            {btnState === "added" && "✓ Added"}
                            {btnState === "error" && "⚠ Retry"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

