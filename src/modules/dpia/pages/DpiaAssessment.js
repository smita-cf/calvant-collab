import Link from 'next/link';


import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import Stage1Form from "../components/Stage1Form";
import Stage2Form from "../components/Stage2Form";
import Stage3Form from "../components/Stage3Form";
import {
  createAssessment,
  saveStage1,
  saveStage2,
  saveStage3,
  submitAssessment,
  buildStage1Payload,
  buildStage2Payload,
} from "../services/dpiaApi";
import { captureActivity, ACTIONS } from "../../../services/activities";
import axios from "axios";
import {
  ClipboardList,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

const API = "https://api.calvant.com/dpia-service/api/dpia";

// ─── All logic helpers UNCHANGED ─────────────────────────────────────────────

function extractError(err) {
  const data = err?.response?.data;
  if (data) {
    if (typeof data === "object") {
      return data.message || data.error || JSON.stringify(data);
    }
    return String(data);
  }
  return err?.message || "Unknown error";
}

const STAGES = [
  { num: 1, label: "PII Inventory", sub: "Data subjects & collection" },
  { num: 2, label: "Personal Data Elements", sub: "Data element checklist" },
  { num: 3, label: "DPIA Questionnaire", sub: "Compliance & obligations" },
];

function qa(answers, questionId, fallback = "") {
  if (!Array.isArray(answers)) return fallback;
  const entry = answers.find((a) => a.questionId === questionId);
  return entry?.rawAnswer ?? fallback;
}

function mapStage1(s1) {
  if (!s1) return null;
  const rows = (s1.applicationMappings || []).map((m) => ({
    appName: m.applicationName || "",
    dataSubject: (m.dataSubjects || [])[0] || "",
    personalData: (m.personalDataElements || [])[0] || "",
    storageFormat: m.storageFormat || "Digital",
    integratedApps: (m.integratedApplications || [])[0] || "",
    accessedBy: m.storageLocation || "",
    country: (m.applicableCountries || [])[0] || "",
    retention: m.retentionPeriod || "",
    deletionMethod: m.deletionMethod || "",
  }));
  const internalTeams = (s1.internalTransfers || []).map((t) => ({
    teamName: t.teamName || "",
    location: t.department || t.country || "",
    personalData: (t.dataShared || [])[0] || "",
    purpose: t.purposeOfTransfer || "",
  }));
  const COUNT_REVERSE = {
    LESS_THAN_25: "<25",
    BETWEEN_26_AND_100: "26 - 100",
    BETWEEN_101_AND_1000: "101 - 1000",
    BETWEEN_1001_AND_100000: "1001 - 100,000",
    MORE_THAN_100000: "100,000 +",
  };
  const indivCount =
    COUNT_REVERSE[s1.anticipatedIndividualsCount] ||
    s1.anticipatedIndividualsCount ||
    "";
  const DEPT_REVERSE = {
    CONTROLLER: "PII Controller",
    PROCESSOR: "PII Processor",
    BOTH: "Both (a) and (b)",
    SUBPROCESSOR: "Subprocessor",
  };
  const deptCat =
    DEPT_REVERSE[s1.departmentCategory] || s1.departmentCategory || "";
  const emptyRow = () => ({
    appName: "",
    dataSubject: "",
    personalData: "",
    storageFormat: "Digital",
    integratedApps: "",
    accessedBy: "",
    country: "",
    retention: "",
    deletionMethod: "",
  });
  return {
    dataSubjects: s1.dataSubjects || [],
    geos: s1.geographies || [],
    dataTypes: s1.personalDataTypes || [],
    dataSources: s1.dataSources || [],
    dataTypeExamples: s1.dataTypeExamples || {},
    rows: rows.length
      ? rows
      : [
          { ...emptyRow(), appName: "A1" },
          { ...emptyRow(), appName: "A2" },
          { ...emptyRow(), appName: "A3" },
          { ...emptyRow(), appName: "A4" },
        ],
    indivCount,
    shareInternal:
      s1.sharesWithInternalTeams === true
        ? "Yes"
        : s1.sharesWithInternalTeams === false
          ? "No"
          : "",
    internalTeams: internalTeams.length
      ? internalTeams
      : [{ teamName: "", location: "", personalData: "", purpose: "" }],
    minors:
      s1.targetedToMinors === true
        ? "Yes"
        : s1.targetedToMinors === false
          ? "No"
          : "",
    deptCat,
  };
}

function mapStage2(s2) {
  if (!s2) return null;
  const checked = {};
  const appNames = [];
  (s2.applications || []).forEach((app) => {
    const name = app.applicationName || app;
    appNames.push(name);
    checked[name] = app.personalDataTypes || [];
  });
  return {
    checked,
    applications: appNames,
    customElements: (s2.customElements || []).map((e) => ({
      label: e.label || "",
      selectedApplications: e.selectedApplications || [],
    })),
  };
}

function mapStage3(s3) {
  if (!s3) return null;
  const answers = s3.answers || [];
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
  const rights = {};
  PII_RIGHTS.forEach((right, i) => {
    rights[right] = qa(answers, `Q10.1.${i + 1}`, "");
  });
  const rightsNAEntry = answers.find((a) => a.questionId === "Q10.1");
  const rightsNA = rightsNAEntry?.answer === "not_applicable";
  const thirdParties = (s3.thirdParties || []).length
    ? s3.thirdParties.map((tp) => ({ name: tp.name || "", purpose: tp.purpose || "" }))
    : [{ name: "", purpose: "" }];
  return {
    pirRef: s3.pirRef || "",
    piiInvRef: s3.piiInventoryRef || "",
    dfdRef: s3.dfdRef || "",
    sdLead: s3.serviceDeliveryLead || "",
    ocLead: s3.operationsComplianceLead || "",
    privacyAuditor: s3.privacyAuditor || "",
    dpo: s3.dataProtectionOfficer || "",
    projectName: s3.projectName || "",
    projectTypes: s3.projectTypes || [],
    projectDesc: s3.projectDescription || "",
    hosted: s3.hostedOn || "",
    periodicReview: qa(answers, "Q4.1"),
    lastReviewDate: qa(answers, "Q4.1.1"),
    evaluateNecessity: qa(answers, "Q4.2"),
    dataDeleted: qa(answers, "Q5.1"),
    geoReceived: s3.geoDataReceived || "",
    geoStored: s3.geoDataStored || "",
    geoTransferred: s3.geoDataTransferred || "",
    transferOutside: qa(answers, "Q6.4"),
    notifyTransfer: qa(answers, "Q6.4.1"),
    transferMechanisms: qa(answers, "Q6.4.2"),
    hasThirdParties: qa(answers, "Q7.1"),
    thirdParties,
    tpDueDiligence: qa(answers, "Q7.1.2"),
    tpNotify: qa(answers, "Q7.1.3"),
    tpDeletion: qa(answers, "Q7.1.4"),
    tpBreachReport: qa(answers, "Q7.1.5"),
    contractClauses: qa(answers, "Q8.1"),
    contractReview: qa(answers, "Q8.2"),
    contractReviewDate: qa(answers, "Q8.2.1"),
    hasSubContractors: qa(answers, "Q9.1"),
    subHowHired: qa(answers, "Q9.1.1"),
    subIndividualUndertaking: qa(answers, "Q9.1.1.1"),
    subVendorUndertaking: qa(answers, "Q9.1.1.2"),
    subBreachReport: qa(answers, "Q9.1.2"),
    rights,
    rightsNA,
    analytics: qa(answers, "Q11.1"),
    breachNotification: qa(answers, "Q12.1"),
    notificationTimeline: s3.breachNotificationTimeline || "Within 72 Hours",
  };
}

// ─── Toast (restyled to match TemplatesPage palette) ─────────────────────────
function Toast({ message, type, onDismiss }) {
  const stableOnDismiss = useCallback(onDismiss, [onDismiss]);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(stableOnDismiss, 4000);
    return () => clearTimeout(t);
  }, [message, stableOnDismiss]);
  if (!message) return null;

  const isError = type === "error";
  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        right: 24,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: isError ? "#fef2f2" : "#f0fdf4",
        border: `1.5px solid ${isError ? "#fca5a5" : "#86efac"}`,
        color: isError ? "#b91c1c" : "#15803d",
        borderRadius: 10,
        padding: "11px 18px",
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
        animation: "slideUp 0.2s ease",
        maxWidth: 380,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: isError
            ? "linear-gradient(135deg,#ef4444,#dc2626)"
            : "linear-gradient(135deg,#10b981,#059669)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isError ? (
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>✕</span>
        ) : (
          <CheckCircle2 size={14} color="#fff" strokeWidth={2.5} />
        )}
      </div>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: isError ? "#b91c1c" : "#15803d",
          fontWeight: 800,
          fontSize: 16,
          lineHeight: 1,
          padding: "0 2px",
          opacity: 0.7,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DpiaAssessment() {
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
  const organizationId = effectiveOrgId;
  const router = useRouter();
  const { id: routeId } = useParams();

  const isEditMode = Boolean(routeId) && routeId !== "new";

  const [stage, setStage] = useState(1);
  const [dpiaId, setDpiaId] = useState(routeId || null);
  const [loading, setLoading] = useState(false);
  const [initErr, setInitErr] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const stageInfo = STAGES.find((s) => s.num === stage);
    if (stageInfo) {
      captureActivity({
        action: ACTIONS.SELECT,
        item: `DPIA · Step ${stage}: ${stageInfo.label}`,
        url: window.pathname,
        dpiaId,
      });
    }
  }, [stage, dpiaId]);

  const notify = (message, type = "success") => setToast({ message, type });
  const clearToast = () => setToast({ message: "", type: "success" });

  const [stage1Data, setStage1Data] = useState(null);
  const [stage2Data, setStage2Data] = useState(null);
  const [stage3Data, setStage3Data] = useState(null);

  const organizationName =
    localStorage.getItem("organizationName") ||
    sessionStorage.getItem("organizationName") ||
    "";

  const orgInitial = organizationName
    ? organizationName.trim()[0].toUpperCase()
    : organizationId
      ? organizationId.trim()[0].toUpperCase()
      : "D";

  // ── Init (UNCHANGED) ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        if (isEditMode) {
          const { data: dpia } = await axios.get(`${API}/${routeId}`);
          if (!cancelled) {
            setDpiaId(dpia.id);
            setStage1Data(mapStage1(dpia.stage1));
            setStage2Data(mapStage2(dpia.stage2));
            setStage3Data(mapStage3(dpia.stage3));
            if (dpia.stage3) setStage(3);
            else if (dpia.stage2) setStage(2);
            else setStage(1);
          }
        } else {
          console.log(organizationId);
          const dpia = await createAssessment("", organizationId);
          if (!cancelled) setDpiaId(dpia.id);
        }
      } catch (err) {
        if (!cancelled) setInitErr(extractError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [mounted, routeId, isEditMode, organizationId, organizationName]);

  useEffect(() => {
    if (dpiaId) {
      captureActivity({
        action: ACTIONS.PAGE_LOAD,
        item: `DPIA · ${isEditMode ? "Opened" : "Created"} Assessment ID: ${dpiaId}`,
        url: window.pathname,
        dpiaId,
      });
    }
  }, [dpiaId, isEditMode]);

  // ── Stage handlers (UNCHANGED) ────────────────────────────────────────────
  async function handleStage1Save(formState) {
    try {
      setLoading(true);
      setStage1Data(formState);
      await saveStage1(dpiaId, buildStage1Payload(formState));
      notify("Stage 1 saved successfully");
      setStage(2);
    } catch (err) {
      notify(`Failed to save Stage 1: ${extractError(err)}`, "error");
    } finally {
      setLoading(false);
    }
  }

  const getApplicationsFromRows = () => {
    if (!stage1Data?.rows) return [];
    const rows = stage1Data.rows.filter((r) => r.appName?.trim());
    const counts = {};
    rows.forEach((r) => {
      counts[r.appName.trim()] = (counts[r.appName.trim()] || 0) + 1;
    });
    const occurrence = {};
    return rows.map((r) => {
      const base = r.appName.trim();
      if (counts[base] > 1) {
        occurrence[base] = (occurrence[base] || 0) + 1;
        const subject = r.dataSubject?.trim();
        return subject ? `${base} (${subject})` : `${base} (${occurrence[base]})`;
      }
      return base;
    });
  };

  async function handleStage2Save(formState) {
    try {
      setLoading(true);
      setStage2Data(formState);
      await saveStage2(dpiaId, buildStage2Payload(formState));
      notify("Stage 2 saved successfully");
      setStage(3);
    } catch (err) {
      notify(`Failed to save Stage 2: ${extractError(err)}`, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleStage3Save(formState) {
    try {
      setLoading(true);
      setStage3Data(formState);
      await saveStage3(dpiaId, formState);
      await submitAssessment(dpiaId);
      captureActivity({
        action: ACTIONS.UPDATE,
        item: `DPIA · Submitted Assessment ID: ${dpiaId}`,
        url: window.pathname,
        dpiaId,
      });
      notify("Assessment submitted successfully!");
      return dpiaId;
    } catch (err) {
      notify(`Failed to submit: ${extractError(err)}`, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (initErr) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; }
        `}</style>
        <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', sans-serif", padding: "32px 20px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div
              style={{
                background: "#fef2f2",
                border: "1.5px solid #fca5a5",
                borderRadius: 14,
                padding: "24px 28px",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#ef4444,#dc2626)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(220,38,38,0.3)",
                }}
              >
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>!</span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#b91c1c", marginBottom: 4 }}>
                  Could not load assessment
                </div>
                <div style={{ fontSize: 13, color: "#dc2626", marginBottom: 14 }}>{initErr}</div>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    background: "linear-gradient(135deg,#ef4444,#dc2626)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 2px 8px rgba(220,38,38,0.25)",
                  }}
                >
                  <RefreshCw size={13} /> Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeUp  { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes cardIn  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#f8fafc",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Loading overlay ── */}
        {loading && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,34,71,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9000,
              backdropFilter: "blur(2px)",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(8px)",
                borderRadius: 16,
                padding: "28px 40px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
                border: "1px solid rgba(241,245,249,0.8)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                }}
              >
                <RefreshCw
                  size={20}
                  color="#fff"
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                {isEditMode ? "Loading assessment…" : "Saving to server…"}
              </div>
            </div>
          </div>
        )}

        <Toast message={toast.message} type={toast.type} onDismiss={clearToast} />

        <main
          style={{
            flex: 1,
            maxWidth: 1100,
            margin: "0 auto",
            width: "100%",
            padding: "20px 20px 100px",
            boxSizing: "border-box",
          }}
        >
          {/* ── Back button ── */}
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => router.push("/dpia")}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)";
              }}
            >
              <ArrowLeft size={14} /> Dashboard
            </button>
          </div>

          {/* ── Header card ── */}
          <div
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(241,245,249,0.8)",
              borderRadius: 14,
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              padding: "18px 24px 16px",
              marginBottom: 16,
              animation: "fadeUp 0.4s ease both",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              {/* Icon box */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                  fontSize: 20,
                  color: "#fff",
                  fontWeight: 900,
                }}
              >
                {orgInitial}
              </div>

              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1e293b",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  {isEditMode ? "Edit DPIA Assessment" : "New DPIA Assessment"}
                </h1>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: 13,
                    color: "#64748b",
                    fontWeight: 400,
                  }}
                >
                  {organizationName
                    ? `${organizationName} — Data Protection Compliance`
                    : "Data Protection Compliance — DPIA Assessment"}
                </p>
              </div>

              {/* Badges */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {isEditMode && (
                  <span
                    style={{
                      background: "#fffbeb",
                      border: "1px solid #fcd34d",
                      borderRadius: 20,
                      padding: "4px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#b45309",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    ✏ Editing
                  </span>
                )}
                {dpiaId && (
                  <span
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: 20,
                      padding: "4px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#1d4ed8",
                    }}
                  >
                    ID: {dpiaId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Stepper ── */}
          <div
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(241,245,249,0.8)",
              borderRadius: 14,
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              overflow: "hidden",
              marginBottom: 20,
              display: "flex",
              animation: "fadeUp 0.4s ease 0.1s both",
            }}
          >
            {STAGES.map((s, i) => {
              const active = stage === s.num;
              const done = stage > s.num;
              const isLast = i === STAGES.length - 1;

              return (
                <div
                  key={s.num}
                  onClick={() => done && setStage(s.num)}
                  style={{
                    flex: 1,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: done ? "pointer" : "default",
                    borderRight: isLast ? "none" : "1px solid #f1f5f9",
                    background: active
                      ? "linear-gradient(135deg,#eff6ff,#dbeafe)"
                      : done
                        ? "#f8fafc"
                        : "#fff",
                    transition: "background 0.2s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (done && !active)
                      e.currentTarget.style.background = "#eff6ff";
                  }}
                  onMouseLeave={(e) => {
                    if (done && !active)
                      e.currentTarget.style.background = "#f8fafc";
                  }}
                >
                  {/* Step circle */}
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 13,
                      background: active
                        ? "linear-gradient(135deg,#3b82f6,#2563eb)"
                        : done
                          ? "linear-gradient(135deg,#10b981,#059669)"
                          : "#e2e8f0",
                      color: active || done ? "#fff" : "#94a3b8",
                      boxShadow: active
                        ? "0 4px 12px rgba(37,99,235,0.3)"
                        : done
                          ? "0 4px 12px rgba(16,185,129,0.25)"
                          : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    {done ? <CheckCircle2 size={16} strokeWidth={2.5} /> : s.num}
                  </div>

                  {/* Labels */}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: active ? "#1d4ed8" : done ? "#1e293b" : "#64748b",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: active ? "#3b82f6" : "#94a3b8",
                        marginTop: 2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {s.sub}
                    </div>
                  </div>

                  {/* Active indicator bottom bar */}
                  {active && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: "linear-gradient(90deg,#3b82f6,#2563eb)",
                        borderRadius: "0 0 0 0",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Stage Forms (child components — untouched) ── */}
          <div style={{ animation: "fadeUp 0.4s ease 0.15s both" }}>
            {stage === 1 && (
              <Stage1Form
                initialData={stage1Data}
                onNext={handleStage1Save}
                loading={loading}
              />
            )}
            {stage === 2 && (
              <Stage2Form
                rows={stage1Data?.rows || []}
                applications={getApplicationsFromRows()}
                initialData={stage2Data}
                onBack={() => setStage(1)}
                onNext={handleStage2Save}
                loading={loading}
              />
            )}
            {stage === 3 && (
              <Stage3Form
                initialData={stage3Data}
                onBack={() => setStage(2)}
                onSubmit={handleStage3Save}
                loading={loading}
              />
            )}
          </div>
        </main>

        {/* ── Footer (matches TemplatesPage) ── */}
        <footer
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            borderTop: "1px solid rgba(241,245,249,0.8)",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
            padding: "14px 24px",
            position: "sticky",
            bottom: 0,
            zIndex: 50,
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#64748b", fontWeight: 500, margin: 0 }}>
              © {new Date().getFullYear()} CalVant. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
