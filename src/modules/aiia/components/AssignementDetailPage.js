import Link from 'next/link';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Brain,
  Building2,
  Calendar,
  User,
  Target,
  AlertTriangle,
  FileText,
  CheckSquare,
  Clock,
  PartyPopper,
  Shield,
  Plus,
  Check,
  ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { stage1Api, stage2Api } from "../services/aiiaApi";
import { useUser } from "../../../hooks/useUser";
import riskService from "../../riskAssesment/services/riskService";
import { captureActivity } from "../../../services/activities";

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT = "'DM Sans', system-ui, sans-serif";
const BLUE = "#3b82f6";
const DARK = "#0f2247";

// ─── 51-question checklist ────────────────────────────────────────────────────
const CHECKLIST = [
  {
    key: "introductoryQuestions",
    label: "Introductory Questions",
    letter: "A",
    color: "#6366f1",
    subtopics: [
      {
        label: "Role within the organisation",
        items: [
          {
            consideration:
              "Do you have a defined owner who is responsible for oversight and governance of this AI system/tool/process?",
            extraPrompt: null,
            vulnerability:
              "a defined owner who is responsible for oversight and governance of the system",
          },
          {
            consideration:
              "Are roles and responsibilities related to this AI system/tool/process usage documented?",
            extraPrompt: null,
            vulnerability:
              "Defined roles and responsibilities related to this AI system",
          },
        ],
      },
    ],
  },
  {
    key: "fundamentalRightsFairness",
    label: "Fundamental Rights & Fairness",
    letter: "B",
    color: "#8b5cf6",
    subtopics: [
      {
        label: "Basic rights",
        items: [
          {
            consideration:
              "Have you ensured that this AI system/tool/process does not make decisions that may directly affect individuals' rights?",
            extraPrompt: null,
            vulnerability:
              "ensuring that the AI system does not make decisions that may directly affect individuals' rights.",
          },
          {
            consideration:
              "Is this AI system/tool/process' usage proportionate to the intended business purpose?",
            extraPrompt: null,
            vulnerability:
              "Proportionate use of the AI system for the intended business purpose.",
          },
          {
            consideration:
              "Is human review required before relying on AI outputs?",
            extraPrompt: null,
            vulnerability:
              "establishing human review prior to relying on the AI system's outputs.",
          },
        ],
      },
      {
        label: "Bias",
        items: [
          {
            consideration:
              "Could this AI system-generated outputs introduce bias or discriminatory outcomes?",
            extraPrompt: null,
            vulnerability:
              "Ensuring that the AI system-generated outputs do not introduce bias or discriminatory outcomes.",
          },
          {
            consideration:
              "Are users instructed to critically review this AI system outputs for fairness?",
            extraPrompt: null,
            vulnerability:
              "Instructing users to critically review the AI system outputs for fairness.",
          },
          {
            consideration:
              "Are AI tools restricted from use in sensitive decision areas (HR, legal, compliance)?",
            extraPrompt: null,
            vulnerability:
              "restriction for the AI system from use in sensitive decision areas (HR, legal, compliance).",
          },
        ],
      },
      {
        label: "Stakeholder participation",
        items: [
          {
            consideration:
              "Have you ensured that no internal or external stakeholders can be negatively impacted by outputs of this AI system/tool/process?",
            extraPrompt: null,
            vulnerability:
              "Controls to ensure that no internal or external stakeholders can be negatively impacted by outputs of the AI system.",
          },
        ],
      },
    ],
  },
  {
    key: "technologicalRobustness",
    label: "Technological Robustness",
    letter: "C",
    color: "#3b82f6",
    subtopics: [
      {
        label: "Accuracy",
        items: [
          {
            consideration:
              "Are users informed that AI outputs may be inaccurate or incomplete?",
            extraPrompt: null,
            vulnerability:
              "Informing the users that AI outputs may be inaccurate or incomplete.",
          },
          {
            consideration:
              "Is there a review mechanism to validate AI outputs before use?",
            extraPrompt: null,
            vulnerability:
              "review mechanism to validate AI outputs before use.",
          },
        ],
      },
      {
        label: "Reliability",
        items: [
          {
            consideration:
              "Have you ensured that the AI model is not developed and/or trained and/or hosted by a third-party provider?",
            extraPrompt: null,
            vulnerability:
              "ensuring that the AI model is not developed and/or trained and/or hosted by a third-party provider.",
          },
          {
            consideration:
              "Does the Organization control model accuracy, training data, or updates?",
            extraPrompt: null,
            vulnerability:
              "Controlling the AI model accuracy, training data, and/or updates.",
          },
        ],
      },
      {
        label: "Technical implementation",
        items: [
          {
            consideration:
              "Is the AI tool accessed via standard interfaces (web/UI/API) without customization?",
            extraPrompt: null,
            vulnerability:
              "Ensuring that the AI system is accessed via only via standard interfaces (web/UI/API) without customization.",
          },
        ],
      },
      {
        label: "Reproducibility",
        items: [
          {
            consideration:
              "Is output reproducibility dependent on the third-party AI provider?",
            extraPrompt: null,
            vulnerability:
              "Ensuring that the output reproducibility is not dependent on any third-party AI providers.",
          },
        ],
      },
      {
        label: "Explainability",
        items: [
          {
            consideration:
              "Are users able to understand and interpret AI outputs sufficiently for their purpose?",
            extraPrompt: null,
            vulnerability:
              "The user's sufficient understanding and interpretation of the AI outputs for their purpose.",
          },
        ],
      },
    ],
  },
  {
    key: "dataGovernance",
    label: "Data Governance",
    letter: "D",
    color: "#06b6d4",
    subtopics: [
      {
        label: "Data quality and integrity",
        items: [
          {
            consideration:
              "Are employees instructed to avoid input of personal, confidential, or client data into AI prompts?",
            extraPrompt: null,
            vulnerability:
              "Instruction to the employees/users to avoid input of any personal, confidential, or client data into the AI prompts.",
          },
          {
            consideration:
              "Are prompt inputs limited to generic or non-sensitive information?",
            extraPrompt: null,
            vulnerability:
              "Restriction of the prompt inputs to generic or non-sensitive information.",
          },
        ],
      },
      {
        label: "Privacy and data protection",
        items: [
          {
            consideration:
              "Does the AI tool process only organizational data, and no personal data, on behalf of your Organization?",
            extraPrompt:
              "What kind of personal data does the AI system process?",
            vulnerability:
              "Restricting the AI system processing to organizational data, and no personal data.",
          },
          {
            consideration:
              "Has the AI Officer evaluated whether a DPIA is required?",
            extraPrompt: null,
            vulnerability:
              "Evaluation by the AI Officer whether the AI system requires a data privacy impact assessment (DPIA).",
          },
        ],
      },
    ],
  },
  {
    key: "riskManagement",
    label: "Risk Management",
    letter: "E",
    color: "#ef4444",
    subtopics: [
      {
        label: "Risk management",
        items: [
          {
            consideration:
              "Are the risks that may arise from incorrect, misleading, or hallucinated AI-generated outputs identified, assessed and treatment plans established?",
            extraPrompt:
              'Attach the list of the risk assessment if the answer is "yes".',
            vulnerability:
              "Identification, assessment and treatment plans establishment for the risks that may arise from incorrect, misleading or hallucinated AI-generated outputs.",
          },
          {
            consideration:
              "Are AI-generated outputs reviewed by humans before being relied upon for business purposes?",
            extraPrompt: null,
            vulnerability:
              "Review by humans of the AI-generated outputs before being relied upon for business purposes.",
          },
          {
            consideration:
              "Are users trained to critically validate AI-generated outputs?",
            extraPrompt: null,
            vulnerability:
              "user training to critically validate AI-generated outputs.",
          },
          {
            consideration:
              "Are the usage of the AI system/tool restricted to low-risk activities?",
            extraPrompt: null,
            vulnerability:
              "usage-restriction of the AI system to low-risk activities.",
          },
          {
            consideration:
              "Apart from the standard security measures in place, have additional measures been taken to secure the AI system?",
            extraPrompt: null,
            vulnerability:
              "additional applicable AI system security measures apart from the standard security measures.",
          },
          {
            consideration:
              "Are access controls in place to limit who can use AI tools within the organisation?",
            extraPrompt: null,
            vulnerability:
              "access controls to limit who can use the AI system within the organisation.",
          },
        ],
      },
      {
        label: "Alternative procedure",
        items: [
          {
            consideration:
              "Is there a defined alternative process if the AI tool becomes unavailable or unreliable?",
            extraPrompt: null,
            vulnerability:
              "a defined alternative process if the AI system becomes unavailable or unreliable.",
          },
          {
            consideration:
              "Can AI tool usage be suspended or restricted if identified risks materialise?",
            extraPrompt: null,
            vulnerability:
              "Suspension of restriction arrangements of the AI system if identified risks materialise.",
          },
          {
            consideration:
              "Are users instructed on how to proceed without AI-generated outputs when required?",
            extraPrompt: null,
            vulnerability:
              "user instruction on how to proceed without AI-generated outputs when required.",
          },
        ],
      },
      {
        label: "Hacking attacks and corruption",
        items: [
          {
            consideration:
              "Are standard information security controls applied when accessing AI tools (e.g., authentication, secure access)?",
            extraPrompt: null,
            vulnerability:
              "Application of standard information security controls when accessing the AI system (e.g., authentication, secure access).",
          },
          {
            consideration:
              "Are users prevented from sharing credentials or using unauthorised AI tools?",
            extraPrompt: null,
            vulnerability:
              "user prevention from sharing credentials or using unauthorised AI tools.",
          },
          {
            consideration:
              "Has the risk of prompt misuse, output leakage, or malicious manipulation of AI outputs been considered?",
            extraPrompt: null,
            vulnerability:
              "Consideration of risks related to prompt misuse, output leakage, or malicious manipulation of the AI outputs.",
          },
          {
            consideration:
              "Are suitable controls establish to ensure that no one can take advantage of the fact that an ai system is used rather than a human decision?",
            extraPrompt: null,
            vulnerability:
              "Establishing the suitable controls to ensure that no one can take advantage of the fact that the ai system is used rather than a human decision.",
          },
          {
            consideration:
              "Is there a defined process to report and respond to suspected AI-related security incidents?",
            extraPrompt: null,
            vulnerability:
              "a defined process to report and respond to suspected AI-related security incidents.",
          },
        ],
      },
    ],
  },
  {
    key: "accountability",
    label: "Accountability",
    letter: "F",
    color: "#10b981",
    subtopics: [
      {
        label: "Communication",
        items: [
          {
            consideration:
              "Are users informed when they are using or relying on AI-generated outputs?",
            extraPrompt: null,
            vulnerability:
              "Informing the users when they are using or relying on AI-generated outputs.",
          },
          {
            consideration:
              "Are the purpose, capabilities, and limitations of the AI tool communicated to users?",
            extraPrompt: null,
            vulnerability:
              "User information of the purpose, capabilities, and limitations of the AI system in use.",
          },
          {
            consideration:
              "Are users informed that AI outputs are assistive and require human judgment?",
            extraPrompt: null,
            vulnerability:
              "Informing the users that the AI outputs are only assistive in nature and require human judgment.",
          },
          {
            consideration:
              "Are guidelines available on appropriate and inappropriate AI usage?",
            extraPrompt: null,
            vulnerability:
              "guidelines on the appropriate and inappropriate AI usage.",
          },
          {
            consideration:
              "Is there a mechanism for users to raise concerns or feedback related to AI usage?",
            extraPrompt: null,
            vulnerability:
              "a mechanism for users to raise concerns or feedback related to the AI system & its usage.",
          },
        ],
      },
      {
        label: "Verifiability",
        items: [
          {
            consideration:
              "Is documentation available describing how the AI tool is used within the organisation?",
            extraPrompt: null,
            vulnerability:
              "documentation describing how the AI tool is used within the organisation.",
          },
          {
            consideration:
              "Is human oversight in place to review and validate AI outputs?",
            extraPrompt: null,
            vulnerability:
              "human oversight in place to review and validate AI outputs.",
          },
          {
            consideration:
              "Can AI-supported decisions or outputs be reviewed or audited?",
            extraPrompt: null,
            vulnerability:
              "review or audit mechanism of the AI-supported decisions or outputs.",
          },
          {
            consideration:
              "Are AI governance roles (including AI Officer) clearly defined and documented?",
            extraPrompt: null,
            vulnerability:
              "Clear definition and documentation of the AI governance roles.",
          },
          {
            consideration:
              "Are AI usage practices reviewed against new legal or regulatory requirements?",
            extraPrompt: null,
            vulnerability:
              "Review of the AI usage practices against new legal or regulatory requirements.",
          },
        ],
      },
      {
        label: "Archiving",
        items: [
          {
            consideration:
              "Are AI-generated outputs retained or deleted according to retention policies?",
            extraPrompt: null,
            vulnerability:
              "Definition & practice of the AI-generated outputs Retention and deletion policies.",
          },
          {
            consideration:
              "Is access to stored AI outputs restricted to authorised personnel?",
            extraPrompt: null,
            vulnerability:
              "Restricting access of stored AI outputs to authorised personnel.",
          },
          {
            consideration:
              "Are AI outputs protected against unauthorised modification or deletion?",
            extraPrompt: null,
            vulnerability:
              "Protection of AI outputs against unauthorised modification or deletion.",
          },
          {
            consideration:
              "Are retention periods for AI-related records clearly defined?",
            extraPrompt: null,
            vulnerability:
              "Clear definition of retention periods for AI-related records.",
          },
        ],
      },
      {
        label: "Climate adaptation",
        items: [
          {
            consideration:
              "Has the environmental impact of using third-party AI tools been considered?",
            extraPrompt: null,
            vulnerability:
              "Environmental impact consideration of using third-party AI tools.",
          },
          {
            consideration:
              "Is AI usage proportionate to business needs to avoid unnecessary environmental impact?",
            extraPrompt: null,
            vulnerability:
              "Ensuring that the AI system usage is proportionate to business needs, thus avoiding unnecessary environmental impact.",
          },
          {
            consideration:
              "Are responsible-use or efficiency considerations included in AI governance practices?",
            extraPrompt: null,
            vulnerability:
              "Including responsible-use or efficiency considerations in AI governance practices.",
          },
        ],
      },
    ],
  },
];

function buildInitialChecklist() {
  const state = {};
  CHECKLIST.forEach((cat) => {
    state[cat.key] = {};
    cat.subtopics.forEach((sub) => {
      state[cat.key][sub.label] = sub.items.map((item) => ({
        consideration: item.consideration,
        extraPrompt: item.extraPrompt,
        vulnerability: item.vulnerability,
        status: "",
        details: "",
        naReason: "",
      }));
    });
  });
  return state;
}

function getMandatoryErrors(checklist) {
  const errors = [];
  CHECKLIST.forEach((cat) => {
    cat.subtopics.forEach((sub) => {
      (checklist[cat.key]?.[sub.label] || []).forEach((item) => {
        if (item.status === "NA" && !item.naReason?.trim()) {
          errors.push({
            catLabel: cat.label,
            subLabel: sub.label,
            consideration: item.consideration,
          });
        }
      });
    });
  });
  return errors;
}

function getAllItems(checklist) {
  const a = [];
  CHECKLIST.forEach((cat) =>
    cat.subtopics.forEach((sub) =>
      (checklist[cat.key]?.[sub.label] || []).forEach((i) => a.push(i)),
    ),
  );
  return a;
}

function getRiskItems(checklist, aiSystemName) {
  const items = [];
  CHECKLIST.forEach((cat) => {
    cat.subtopics.forEach((sub) => {
      (checklist[cat.key]?.[sub.label] || []).forEach((item) => {
        if (item.status === "No") {
          const systemLabel = aiSystemName ? `the ${aiSystemName}` : "the";
          items.push({
            catLabel: cat.label,
            catColor: cat.color,
            consideration: item.consideration,
            details: item.details,
            vulnerability: item.vulnerability,
            aiSystemName,
            riskStatement: `Risk of sub-optimal business benefits due to potential misuse, failure or compromise of ${systemLabel} AI system because of the lack of ${item.vulnerability}`,
          });
        }
      });
    });
  });
  return items;
}

async function generateRiskId(organization) {
  const y = new Date().getFullYear();
  try {
    const all = await riskService.getAllRisks();
    const orgId = organization?._id || organization;
    const existing = all
      .filter(
        (r) => String(r.organization?._id || r.organization) === String(orgId),
      )
      .map((r) => r.riskId);
    let n = 1,
      id = "";
    do {
      id = `RR-${y}-${n.toString().padStart(3, "0")}`;
      n++;
    } while (existing.includes(id));
    return id;
  } catch {
    return `RR-${y}-${String(Date.now()).slice(-3)}`;
  }
}

async function buildRiskPayload(item, user, assessmentId) {
  const org = user?.organization;
  return {
    riskId: await generateRiskId(org),
    organization: org?._id || org || "",
    department: user?.department ?? user?.departments?.[0]?.name ?? "",
    date: new Date().toISOString().split("T")[0],
    riskType: ["Artificial Intelligence"],
    assetType: "",
    asset: "",
    location: item.aiSystemName || "",
    riskDescription: item.riskStatement,
    additionalControls: item.details || "",
    existingControls: "",
    controlReference: [],
    status: "Open",
    riskLevel: "",
    numberOfDays: "",
    deadlineDate: "",
    additionalNotes: [
      `AI Assessment: ${assessmentId}`,
      `Section: ${item.catLabel}`,
      `Checklist Item: ${item.consideration}`,
      `Answer: No`,
      item.details ? `Notes: ${item.details}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

const STATUS_STYLES = {
  SUBMITTED: { bg: "#dbeafe", color: "#1d4ed8", label: "Submitted" },
  IN_PROGRESS: { bg: "#fef3c7", color: "#b45309", label: "In Progress" },
  DRAFT: { bg: "#f1f5f9", color: "#475569", label: "Draft" },
  APPROVED: { bg: "#d1fae5", color: "#065f46", label: "Approved" },
  REJECTED: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    fontFamily: FONT,
    color: "#1a2233",
    minHeight: "100vh",
    background: "#f4f7fb",
    paddingBottom: 60,
  },
  topBar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #e4eaf4",
    boxShadow: "0 1px 8px rgba(15,34,71,0.06)",
  },
  topBarInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    height: 56,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    borderRadius: 8,
    border: "1.5px solid #dde3ef",
    background: "white",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    color: "#374151",
    fontFamily: FONT,
  },
  crumb: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#9ca3af",
  },
  pill: (bg, c) => ({
    padding: "4px 12px",
    borderRadius: 999,
    background: bg,
    color: c,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.03em",
    marginLeft: "auto",
    whiteSpace: "nowrap",
  }),
  btn: (dis, green) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 18px",
    borderRadius: 8,
    border: "none",
    background: dis
      ? "#e5e7eb"
      : green
        ? "linear-gradient(90deg,#059669,#10b981)"
        : `linear-gradient(90deg,${DARK},${BLUE})`,
    color: dis ? "#9ca3af" : "#fff",
    cursor: dis ? "not-allowed" : "pointer",
    fontSize: 13,
    fontWeight: 700,
    boxShadow: dis ? "none" : "0 3px 10px rgba(15,34,71,0.22)",
    fontFamily: FONT,
    whiteSpace: "nowrap",
  }),
  wrap: { maxWidth: 1100, margin: "0 auto", padding: "26px 24px 40px" },
  banner: {
    background: `linear-gradient(110deg,${DARK} 0%,#1a3a6e 55%,${BLUE} 100%)`,
    borderRadius: 14,
    padding: "24px 28px",
    marginBottom: 22,
    color: "#fff",
    position: "relative",
    overflow: "hidden",
  },
  bannerEye: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: "#7eb3f5",
    marginBottom: 5,
  },
  bannerH: { fontSize: 22, fontWeight: 800, marginBottom: 7 },
  bannerMeta: {
    display: "flex",
    gap: 18,
    flexWrap: "wrap",
    fontSize: 13,
    color: "#bdd4f0",
  },
  bannerMetaItem: { display: "flex", alignItems: "center", gap: 6 },
  prgLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    fontWeight: 700,
    color: "#6b7280",
    marginBottom: 5,
  },
  prgBar: {
    height: 5,
    borderRadius: 3,
    background: "#e5e7eb",
    marginBottom: 20,
    overflow: "hidden",
  },
  prgFill: (p) => ({
    height: "100%",
    width: `${p}%`,
    borderRadius: 3,
    background:
      p === 100
        ? "linear-gradient(90deg,#059669,#10b981)"
        : `linear-gradient(90deg,${DARK},${BLUE})`,
    transition: "width 0.4s ease",
  }),
  stats: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 },
  stat: (a) => ({
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "9px 16px",
    background: "white",
    border: `1.5px solid ${a}28`,
    borderRadius: 10,
    boxShadow: "0 1px 4px rgba(15,34,71,0.05)",
    flex: "1 1 120px",
  }),
  statDot: (a) => ({
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: a,
    flexShrink: 0,
  }),
  statV: { fontSize: 17, fontWeight: 800, color: "#111827", lineHeight: 1 },
  statL: { fontSize: 11, color: "#6b7280", fontWeight: 500 },
  tabs: {
    display: "flex",
    gap: 3,
    background: "white",
    borderRadius: 10,
    padding: 4,
    border: "1px solid #e4eaf4",
    boxShadow: "0 1px 5px rgba(15,34,71,0.05)",
    marginBottom: 20,
    width: "fit-content",
  },
  tab: (a, dis) => ({
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "8px 18px",
    borderRadius: 7,
    border: "none",
    background: a ? `linear-gradient(90deg,${DARK},${BLUE})` : "transparent",
    color: a ? "white" : dis ? "#c4cad4" : "#374151",
    fontSize: 13,
    fontWeight: 700,
    cursor: dis ? "not-allowed" : "pointer",
    transition: "all 0.16s",
    boxShadow: a ? "0 3px 10px rgba(15,34,71,0.18)" : "none",
    fontFamily: FONT,
    opacity: dis ? 0.6 : 1,
  }),
  tabBadge: (a) => ({
    padding: "1px 7px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    background: a ? "rgba(255,255,255,0.22)" : "#f0f4fb",
    color: a ? "white" : DARK,
  }),
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: 14,
    marginBottom: 14,
  },
  card: {
    background: "#fff",
    border: "1px solid #e4eaf4",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(15,34,71,0.06)",
  },
  cHead: (a) => ({
    background: `linear-gradient(90deg,${a}18,transparent)`,
    borderLeft: `4px solid ${a}`,
    padding: "11px 16px",
    display: "flex",
    alignItems: "center",
    gap: 9,
  }),
  cBadge: (a) => ({
    width: 26,
    height: 26,
    borderRadius: 7,
    background: a,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  cTitle: { fontSize: 13, fontWeight: 700, color: "#111827" },
  cBody: { padding: "14px 16px" },
  iRow: (last) => ({
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    paddingBottom: last ? 0 : 11,
    marginBottom: last ? 0 : 11,
    borderBottom: last ? "none" : "1px solid #f1f5f9",
  }),
  iIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    background: "#f7f9fc",
    border: "1px solid #e4eaf4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 2,
  },
  iVal: { fontSize: 13, fontWeight: 600 },
  tBlkLabel: (w) => ({
    fontSize: 10,
    fontWeight: 700,
    color: w ? "#b45309" : "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 3,
    display: "flex",
    alignItems: "center",
    gap: 4,
  }),
  tBlk: (w) => ({
    padding: "9px 11px",
    background: w ? "#fffbeb" : "#f7f9fc",
    border: `1px solid ${w ? "#fde68a" : "#e4eaf4"}`,
    borderRadius: 8,
    fontSize: 12,
    color: "#374151",
    lineHeight: 1.6,
    marginBottom: 10,
  }),
  legend: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 14,
    padding: "9px 14px",
    background: "white",
    border: "1px solid #e4eaf4",
    borderRadius: 9,
  },
  lPill: (bg, c) => ({
    padding: "3px 10px",
    borderRadius: 99,
    background: bg,
    color: c,
    fontSize: 11,
    fontWeight: 700,
  }),
  catWrap: (a, open) => ({
    background: "white",
    border: `1px solid ${open ? a + "45" : "#e4eaf4"}`,
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: open ? `0 3px 16px ${a}12` : "0 1px 5px rgba(15,34,71,0.04)",
    marginBottom: 8,
    transition: "all 0.16s",
  }),
  catBtn: (a, open) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "13px 18px",
    border: "none",
    cursor: "pointer",
    background: open ? a + "0d" : "white",
    textAlign: "left",
    transition: "background 0.16s",
    fontFamily: FONT,
  }),
  catLetter: (a) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    background: a,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    color: "white",
    flexShrink: 0,
  }),
  subPill: (a) => ({
    display: "inline-block",
    fontSize: 10,
    fontWeight: 800,
    color: a,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "4px 9px",
    background: a + "12",
    borderRadius: 6,
    marginBottom: 7,
    marginTop: 7,
  }),
  qWrap: (s, hasErr) => ({
    marginBottom: 7,
    padding: "11px 14px",
    borderRadius: 9,
    border: `1px solid ${hasErr ? "#fca5a5" : s === "No" ? "#fecaca" : s === "NA" ? "#fde68a" : s === "Yes" ? "#bbf7d0" : "#eff1f8"}`,
    background: hasErr
      ? "#fff5f5"
      : s === "No"
        ? "#fff5f5"
        : s === "NA"
          ? "#fffbeb"
          : s === "Yes"
            ? "#f0fdf4"
            : "#fafbfc",
    transition: "all 0.16s",
  }),
  qTop: { display: "flex", alignItems: "flex-start", gap: 9 },
  qBadge: (a) => ({
    fontSize: 10,
    fontWeight: 800,
    color: a,
    background: a + "14",
    padding: "2px 7px",
    borderRadius: 5,
    flexShrink: 0,
    marginTop: 2,
  }),
  qTxt: {
    flex: 1,
    fontSize: 13,
    fontWeight: 500,
    color: "#1a2233",
    lineHeight: 1.55,
  },
  qSel: (s) => ({
    flexShrink: 0,
    padding: "5px 9px",
    borderRadius: 6,
    border: `1.5px solid ${s === "Yes" ? "#10b981" : s === "No" ? "#ef4444" : s === "NA" ? "#f59e0b" : "#cbd5e1"}`,
    background: "white",
    fontSize: 12,
    fontWeight: 700,
    color:
      s === "Yes"
        ? "#10b981"
        : s === "No"
          ? "#ef4444"
          : s === "NA"
            ? "#d97706"
            : "#6b7280",
    cursor: "pointer",
    outline: "none",
    fontFamily: FONT,
  }),
  rWarn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    marginTop: 7,
    marginLeft: 34,
    fontSize: 11,
    fontWeight: 700,
    color: "#dc2626",
  },
  naBox: { marginTop: 8, marginLeft: 34 },
  naLabel: (hasErr) => ({
    fontSize: 11,
    fontWeight: 700,
    color: hasErr ? "#dc2626" : "#d97706",
    marginBottom: 4,
    display: "flex",
    alignItems: "center",
    gap: 4,
  }),
  ta: (borderColor) => ({
    width: "100%",
    boxSizing: "border-box",
    padding: "7px 11px",
    borderRadius: 7,
    border: `1.5px solid ${borderColor || "#e4eaf4"}`,
    background: "white",
    fontSize: 12,
    color: "#374151",
    resize: "vertical",
    fontFamily: FONT,
    outline: "none",
  }),
  taWrap: { marginTop: 7, marginLeft: 34, width: "calc(100% - 34px)" },
  epLabel: (a) => ({
    fontSize: 11,
    fontWeight: 700,
    color: a,
    marginTop: 7,
    marginLeft: 34,
    marginBottom: 3,
  }),
  btmBar: {
    position: "sticky",
    bottom: 16,
    marginTop: 18,
    padding: "13px 18px",
    background: "rgba(255,255,255,0.97)",
    backdropFilter: "blur(10px)",
    border: "1px solid #e4eaf4",
    borderRadius: 12,
    boxShadow: "0 6px 24px rgba(15,34,71,0.09)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  remPill: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    fontWeight: 700,
    color: "#b45309",
    padding: "3px 10px",
    borderRadius: 99,
    background: "#fef3c7",
  },
  rkPill: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    fontWeight: 700,
    color: "#dc2626",
    padding: "3px 10px",
    borderRadius: 99,
    background: "#fee2e2",
  },
  alert: (t) => ({
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    padding: "10px 14px",
    borderRadius: 9,
    marginBottom: 12,
    background: t === "error" ? "#fef2f2" : "#f0fdf4",
    border: `1px solid ${t === "error" ? "#fecaca" : "#bbf7d0"}`,
    color: t === "error" ? "#dc2626" : "#16a34a",
    fontSize: 13,
    fontWeight: 600,
  }),
  doneBanner: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    padding: "14px 18px",
    borderRadius: 12,
    background: "linear-gradient(90deg,#f0fdf4,#dcfce7)",
    border: "1.5px solid #86efac",
    boxShadow: "0 3px 12px rgba(16,185,129,0.09)",
  },

  // ── Details panel (Risk Owner fills before checklist) ──────────────────────
  detailsPanel: {
    background: "#fff",
    border: "1.5px solid #e0edff",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(59,130,246,0.08)",
    marginBottom: 20,
  },
  detailsPanelHead: {
    background: `linear-gradient(90deg,${DARK}0d,${BLUE}0d)`,
    borderBottom: "1px solid #e0edff",
    padding: "13px 18px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  detailsPanelHeadIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: `linear-gradient(135deg,${DARK},${BLUE})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  detailsPanelBody: { padding: "18px 20px" },
  detailsFieldLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 5,
  },
  detailsFieldRequired: { color: "#ef4444", marginLeft: 2 },
  detailsFieldWrap: { marginBottom: 14 },
  detailsSavedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    fontWeight: 700,
    color: "#065f46",
    background: "#d1fae5",
    borderRadius: 99,
    padding: "3px 10px",
    marginLeft: 10,
  },

  // ── Risk Review tab styles ──────────────────────────────────────────────────
  rrSummary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
    gap: 12,
    marginBottom: 20,
  },
  rrStatCard: (a) => ({
    background: "#fff",
    borderRadius: 12,
    padding: "14px 18px",
    border: `1px solid ${a}33`,
    borderLeft: `4px solid ${a}`,
    boxShadow: "0 1px 5px rgba(15,34,71,0.06)",
  }),
  rrStatLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: 5,
  },
  rrStatVal: (a) => ({
    fontSize: 26,
    fontWeight: 800,
    color: a,
    lineHeight: 1,
  }),
  rrStatSub: { fontSize: 11, color: "#9ca3af", marginTop: 3 },
  rrTableWrap: {
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #e4eaf4",
    boxShadow: "0 1px 6px rgba(15,34,71,0.06)",
    overflow: "hidden",
  },
  rrTableHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid #eef1f8",
    background: "linear-gradient(90deg,#0f224708,transparent)",
  },
  rrTableTitle: { fontSize: 14, fontWeight: 700, color: "#111827" },
  rrCountBadge: {
    background: "#eef3fb",
    color: "#1a3a6e",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 700,
  },
  rrTable: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  rrTh: {
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
  rrTd: {
    padding: "12px 14px",
    borderBottom: "1px solid #eef1f8",
    verticalAlign: "top",
  },
  rrSectionTag: (c) => ({
    display: "inline-block",
    background: c + "15",
    color: c,
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 700,
  }),
  rrRiskBox: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 1.55,
    background: "#fff5f5",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "8px 10px",
  },
  rrAddBtn: (st) => ({
    fontFamily: FONT,
    fontSize: 11,
    fontWeight: 700,
    border: "none",
    borderRadius: 6,
    padding: "6px 12px",
    cursor: st === "adding" || st === "added" ? "default" : "pointer",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: 5,
    ...(st === "idle" && { background: "#e0f2fe", color: "#0369a1" }),
    ...(st === "adding" && { background: "#e5e7eb", color: "#9ca3af" }),
    ...(st === "added" && { background: "#dcfce7", color: "#15803d" }),
    ...(st === "error" && { background: "#fef2f2", color: "#b91c1c" }),
  }),
  rrNoRiskBanner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "56px 24px",
    background: "#f0fdf4",
    border: "1.5px solid #86efac",
    borderRadius: 14,
    textAlign: "center",
  },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value, icon: Icon, last }) {
  return (
    <div style={S.iRow(last)}>
      <div style={S.iIcon}>
        <Icon size={12} color="#6b7280" />
      </div>
      <div>
        <div style={S.iLabel}>{label}</div>
        <div style={{ ...S.iVal, color: value ? "#1a2233" : "#d1d5db" }}>
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

// ─── Risk Owner Details Panel ─────────────────────────────────────────────────
// Shown at the top of the Checklist tab when the current user is a Risk Owner
// and business details have not yet been filled in.
function RiskOwnerDetailsPanel({
  assignment,
  assessmentId,
  onDetailsSaved,
  inline = false,
}) {
  const [businessObjective, setBusinessObjective] = useState(
    assignment.businessObjective || "",
  );
  const [intendedUse, setIntendedUse] = useState(assignment.intendedUse || "");
  const [foreseableMisuse, setForeseableMisuse] = useState(
    assignment.foreseableMisuse || "",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const detailsFilled =
    !!assignment.businessObjective && !!assignment.intendedUse;
  const canSave = businessObjective.trim() && intendedUse.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      await stage1Api.update(assessmentId, {
        businessObjective: businessObjective.trim(),
        intendedUse: intendedUse.trim(),
        foreseableMisuse: foreseableMisuse.trim(),
      });
      setSaved(true);
      if (onDetailsSaved)
        onDetailsSaved({ businessObjective, intendedUse, foreseableMisuse });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save details. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const fields = (
    <div style={inline ? {} : S.detailsPanelBody}>
      {/* Business Objective */}
      <div style={S.detailsFieldWrap}>
        <div style={S.detailsFieldLabel}>
          Business Objective <span style={S.detailsFieldRequired}>*</span>
        </div>
        <textarea
          value={businessObjective}
          onChange={(e) => setBusinessObjective(e.target.value)}
          placeholder="Describe the business objective of this AI system..."
          rows={3}
          style={S.ta(
            !businessObjective.trim() && saved === false
              ? "#fca5a5"
              : "#e4eaf4",
          )}
          onFocus={(e) => (e.target.style.borderColor = BLUE)}
          onBlur={(e) => (e.target.style.borderColor = "#e4eaf4")}
        />
      </div>

      {/* Intended Use */}
      <div style={S.detailsFieldWrap}>
        <div style={S.detailsFieldLabel}>
          Intended Use <span style={S.detailsFieldRequired}>*</span>
        </div>
        <textarea
          value={intendedUse}
          onChange={(e) => setIntendedUse(e.target.value)}
          placeholder="Describe how this AI system will be used..."
          rows={3}
          style={S.ta(
            !intendedUse.trim() && saved === false ? "#fca5a5" : "#e4eaf4",
          )}
          onFocus={(e) => (e.target.style.borderColor = BLUE)}
          onBlur={(e) => (e.target.style.borderColor = "#e4eaf4")}
        />
      </div>

      {/* Foreseeable Misuse */}
      <div style={{ ...S.detailsFieldWrap, marginBottom: 0 }}>
        <div style={S.detailsFieldLabel}>
          Foreseeable Misuse
          <span
            style={{
              fontSize: 10,
              color: "#9ca3af",
              fontWeight: 400,
              marginLeft: 6,
              textTransform: "none",
              letterSpacing: 0,
            }}
          >
            (optional)
          </span>
        </div>
        <textarea
          value={foreseableMisuse}
          onChange={(e) => setForeseableMisuse(e.target.value)}
          placeholder="Potential risks or misuse scenarios..."
          rows={3}
          style={S.ta("#e4eaf4")}
          onFocus={(e) => (e.target.style.borderColor = BLUE)}
          onBlur={(e) => (e.target.style.borderColor = "#e4eaf4")}
        />
      </div>

      {error && (
        <div style={{ ...S.alert("error"), marginTop: 12, marginBottom: 0 }}>
          <AlertCircle size={13} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      {/* Save button */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          style={S.btn(!canSave || saving, saved)}
          onClick={handleSave}
          disabled={!canSave || saving}
        >
          {saving ? (
            <>
              <Clock size={13} /> Saving…
            </>
          ) : saved ? (
            <>
              <CheckCircle size={13} /> Saved!
            </>
          ) : (
            <>
              <Save size={13} /> Save Details
            </>
          )}
        </button>
        {!canSave && (
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            Business Objective and Intended Use are required
          </span>
        )}
      </div>
    </div>
  );

  if (inline) return fields;

  return (
    <div style={S.detailsPanel}>
      <div style={S.detailsPanelHead}>
        <div style={S.detailsPanelHeadIcon}>
          <ClipboardList size={14} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
            Step 1 — Assessment Details
            {detailsFilled && (
              <span style={S.detailsSavedBadge}>
                <CheckCircle size={10} /> Filled
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
            Complete these fields before starting the checklist
          </div>
        </div>
      </div>
      {fields}
    </div>
  );
}

// ─── Risk Review Tab ──────────────────────────────────────────────────────────
function RiskReviewTab({ checklist, assessmentId, user, aiSystemName }) {
  const riskItems = getRiskItems(checklist, aiSystemName);
  const [addState, setAddState] = useState({});
  const [toast, setToast] = useState({ show: false, msg: "" });

  function showToast(msg) {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  }

  async function handleAddToRisks(item, key) {
    if (addState[key] === "adding" || addState[key] === "added") return;
    setAddState((p) => ({ ...p, [key]: "adding" }));
    try {
      const payload = await buildRiskPayload(item, user, assessmentId);
      await riskService.saveRisk(payload);
      setAddState((p) => ({ ...p, [key]: "added" }));
      showToast(`✅ ${payload.riskId} added to risk register`);
    } catch (err) {
      console.error(err);
      setAddState((p) => ({ ...p, [key]: "error" }));
      showToast("⚠️ Failed to add risk");
      setTimeout(() => setAddState((p) => ({ ...p, [key]: "idle" })), 3000);
    }
  }

  if (riskItems.length === 0) {
    return (
      <motion.div
        key="rr-norisk"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <div style={S.rrNoRiskBanner}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg,#10b981,#059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={24} color="white" />
          </div>
          <div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#065f46",
                marginBottom: 4,
              }}
            >
              No Risks Flagged
            </div>
            <div style={{ fontSize: 13, color: "#16a34a" }}>
              All checklist items were answered Yes or N/A — no risk entries to
              generate.
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="rr"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div style={S.toast(toast.show)}>{toast.msg}</div>

      <div style={S.rrSummary}>
        {[
          { label: "Total Risks", value: riskItems.length, accent: "#1e6ec8" },
          { label: "Risk Level", value: "High", accent: "#ef4444" },
          { label: "Status", value: "Open", accent: "#f59e0b" },
        ].map(({ label, value, accent }) => (
          <div key={label} style={S.rrStatCard(accent)}>
            <div style={S.rrStatLabel}>{label}</div>
            <div style={S.rrStatVal(accent)}>{value}</div>
            <div style={S.rrStatSub}>Auto-generated</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fef2f2",
          border: "1.5px solid #fca5a5",
          borderRadius: 12,
          padding: "13px 18px",
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 22 }}>🔴</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#b91c1c" }}>
            Overall Risk Level: HIGH
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
            {riskItems.length} risk{riskItems.length !== 1 ? "s" : ""}{" "}
            identified from "No" responses — review and add to risk register as
            needed.
          </div>
        </div>
      </div>

      <div style={S.rrTableWrap}>
        <div style={S.rrTableHead}>
          <div style={S.rrTableTitle}>Risk Register Candidates</div>
          <span style={S.rrCountBadge}>{riskItems.length} risks</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={S.rrTable}>
            <thead>
              <tr>
                {[
                  "#",
                  "Section",
                  "Checklist Item",
                  "Risk Statement",
                  "Notes",
                  "Level",
                  "Action",
                ].map((h) => (
                  <th key={h} style={S.rrTh}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riskItems.map((item, i) => {
                const key = `risk-${i}`;
                const btnState = addState[key] ?? "idle";
                return (
                  <tr
                    key={i}
                    style={{
                      background: i % 2 === 0 ? "#fff" : "#fafbfd",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) =>
                      Array.from(e.currentTarget.cells).forEach(
                        (td) => (td.style.background = "#f0f5ff"),
                      )
                    }
                    onMouseLeave={(e) =>
                      Array.from(e.currentTarget.cells).forEach(
                        (td) => (td.style.background = ""),
                      )
                    }
                  >
                    <td
                      style={{
                        ...S.rrTd,
                        width: 36,
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#9ca3af",
                      }}
                    >
                      {i + 1}
                    </td>
                    <td style={{ ...S.rrTd, minWidth: 110 }}>
                      <span style={S.rrSectionTag(item.catColor)}>
                        {item.catLabel}
                      </span>
                    </td>
                    <td style={{ ...S.rrTd, maxWidth: 240 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: "#374151",
                          lineHeight: 1.5,
                        }}
                      >
                        {item.consideration}
                      </div>
                    </td>
                    <td style={{ ...S.rrTd, maxWidth: 300 }}>
                      <div style={S.rrRiskBox}>{item.riskStatement}</div>
                    </td>
                    <td style={{ ...S.rrTd, maxWidth: 200 }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          lineHeight: 1.5,
                        }}
                      >
                        {item.details || (
                          <span
                            style={{ color: "#d1d5db", fontStyle: "italic" }}
                          >
                            No notes
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={S.rrTd}>
                    </td>
                    <td
                      style={{
                        ...S.rrTd,
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <button
                        style={S.rrAddBtn(btnState)}
                        onClick={() => handleAddToRisks(item, key)}
                        disabled={btnState === "adding" || btnState === "added"}
                      >
                        {btnState === "idle" && (
                          <>
                            <Plus size={11} /> Add to Risks
                          </>
                        )}
                        {btnState === "adding" && "Saving…"}
                        {btnState === "added" && (
                          <>
                            <Check size={11} /> Added
                          </>
                        )}
                        {btnState === "error" && "⚠ Retry"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function AssignmentDetailPage({ assignment, onBack, onSaved }) {
  const user = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stage2Id, setStage2Id] = useState(null);
  const [isCompleted, setIsCompleted] = useState(
    assignment.status === "SUBMITTED" || assignment.status === "APPROVED",
  );
  const [checklist, setChecklist] = useState(() => buildInitialChecklist());
  const [expanded, setExpanded] = useState({ [CHECKLIST[0].key]: true });

  // ── Track assignment details locally so RiskOwnerDetailsPanel updates live ──
  const [assignmentDetails, setAssignmentDetails] = useState({
    businessObjective: assignment.businessObjective || "",
    intendedUse: assignment.intendedUse || "",
    foreseableMisuse: assignment.foreseableMisuse || "",
  });

  // ─── Role detection ────────────────────────────────────────────────────────
  const userRoles = Array.isArray(user?.role)
    ? user.role
    : user?.role
      ? [user.role]
      : [];

  const isRiskOwner = userRoles.some((r) => {
    const s = (
      typeof r === "string" ? r : r?.name || r?.roleName || ""
    ).toLowerCase();
    return (
      s.includes("risk_owner") ||
      s.includes("riskowner") ||
      s.includes("risk owner")
    );
  });

  const isRootOrAIO = userRoles.some((r) => {
    const s = (typeof r === "string" ? r : r?.name || r?.roleName || "")
      .toLowerCase()
      .replace(/[\s_-]/g, "");
    return s.includes("root") || s.includes("aio");
  });

  // Details panel shows for Risk Owner OR Root/AIO — always editable
  const detailsMissing =
    (isRiskOwner || isRootOrAIO) &&
    (!assignmentDetails.businessObjective || !assignmentDetails.intendedUse);

  const assessmentId = assignment._id || assignment.id;

  useEffect(() => {
    loadStage2();
    captureActivity({
      action: 'AIIA_ASSESSMENT_DETAILS_OPENED',
      item: `Opened AI Assessment Details: ${assignment.aiSystemName}`,
      assignmentId: assessmentId
    });
  }, [assessmentId]);

  const loadStage2 = async () => {
    try {
      const resp = await stage2Api.getByStage1(assessmentId);
      const data = resp.data.data;
      if (!data) return;
      const record = Array.isArray(data) ? data[0] : data;
      if (!record) return;
      setStage2Id(record._id || record.id);
      const merged = buildInitialChecklist();
      CHECKLIST.forEach((cat) => {
        cat.subtopics.forEach((sub) => {
          const saved = record[cat.key]?.[sub.label] || [];
          merged[cat.key][sub.label] = sub.items.map((item, i) => ({
            consideration: item.consideration,
            extraPrompt: item.extraPrompt,
            vulnerability: item.vulnerability,
            status: saved[i]?.status || "",
            details: saved[i]?.details || "",
            naReason: saved[i]?.naReason || "",
          }));
        });
      });
      setChecklist(merged);
    } catch {
      /* no record yet */
    }
  };

  const updateItem = (catKey, sub, idx, field, val) => {
    setChecklist((prev) => ({
      ...prev,
      [catKey]: {
        ...prev[catKey],
        [sub]: prev[catKey][sub].map((item, i) =>
          i === idx ? { ...item, [field]: val } : item,
        ),
      },
    }));
  };

  const handleStatus = (catKey, sub, idx, val) => {
    updateItem(catKey, sub, idx, "status", val);
    if (val !== "NA") updateItem(catKey, sub, idx, "naReason", "");
  };

  const allItems = getAllItems(checklist);
  const answered = allItems.filter((i) => i.status !== "").length;
  const total = allItems.length;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  const allAnswered = answered === total && total > 0;
  const noCount = allItems.filter((i) => i.status === "No").length;
  const mandatoryErrors = getMandatoryErrors(checklist);
  const hasMandatoryErrors = mandatoryErrors.length > 0;
  const riskReviewUnlocked = allAnswered && !hasMandatoryErrors;

  const statusStyle = isCompleted
    ? { bg: "#d1fae5", color: "#065f46", label: "Completed" }
    : STATUS_STYLES[assignment.status] || STATUS_STYLES["DRAFT"];

  const handleSave = async () => {
    const answeredItems = allItems.filter((i) => i.status !== "");
    if (answeredItems.length === 0) {
      setError("Please answer at least one question before saving.");
      setTimeout(() => setError(""), 5000);
      return;
    }
    if (hasMandatoryErrors) {
      const names = mandatoryErrors
        .slice(0, 2)
        .map((e) => `"${e.consideration.substring(0, 40)}…"`)
        .join(", ");
      setError(
        `Please provide a reason for N/A items: ${names}${mandatoryErrors.length > 2 ? ` and ${mandatoryErrors.length - 2} more` : ""}`,
      );
      setTimeout(() => setError(""), 7000);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const clPayload = {};
      CHECKLIST.forEach((cat) => {
        clPayload[cat.key] = {};
        cat.subtopics.forEach((sub) => {
          clPayload[cat.key][sub.label] = checklist[cat.key]?.[sub.label] || [];
        });
      });
      const isFullyComplete = allAnswered && !hasMandatoryErrors;
      const payload = {
        stage1Id: assessmentId,
        assessmentType: "FULL",
        status: isFullyComplete ? "COMPLETED" : "IN_PROGRESS",
        answeredCount: answered,
        totalQuestionsCount: total,
        completionPercentage: pct,
        ...clPayload,
      };
      if (stage2Id) {
        await stage2Api.update(stage2Id, payload);
      } else {
        const r = await stage2Api.create(payload);
        setStage2Id(r.data.data?._id || r.data.data?.id);
      }

      if (isFullyComplete) {
        try {
          await stage1Api.update(assessmentId, { status: "SUBMITTED" });
          setIsCompleted(true);
        } catch (e) {
          console.error(e);
        }
      }

      setSuccess(
        isFullyComplete
          ? "Assessment completed and saved!"
          : `Progress saved — ${answered}/${total} answered.`,
      );
      captureActivity({
        action: isFullyComplete ? 'AIIA_ASSESSMENT_COMPLETED' : 'AIIA_ASSESSMENT_SAVED',
        item: isFullyComplete
          ? `Completed AI Assessment: ${assignment.aiSystemName}`
          : `Saved AI Assessment Progress: ${assignment.aiSystemName}`,
        assignmentId: assessmentId,
        completed: isFullyComplete,
        answered
      });
      if (onSaved) onSaved();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  let globalQ = 0;

  return (
    <div style={S.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Top bar */}
      <div style={S.topBar}>
        <div style={S.topBarInner}>
          <button
            style={S.backBtn}
            onClick={() => {
              if (onBack) onBack();
              else router.back();
            }}
          >
            <ArrowLeft size={13} /> Back
          </button>
          <div style={S.crumb}>
            <span>AIIA</span>
            <span style={{ color: "#d1d5db" }}>›</span>
            <span>Assignments</span>
            <span style={{ color: "#d1d5db" }}>›</span>
            <span style={{ color: "#111827", fontWeight: 700 }}>
              {assignment.aiSystemName}
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={S.pill(statusStyle.bg, statusStyle.color)}>
            {statusStyle.label}
          </span>
          {activeTab === "stage2" && (
            <button
              style={S.btn(
                saving || answered === 0 || hasMandatoryErrors,
                allAnswered && !hasMandatoryErrors,
              )}
              onClick={handleSave}
              disabled={saving || answered === 0 || hasMandatoryErrors}
            >
              {saving ? (
                "Saving…"
              ) : answered === 0 ? (
                <>
                  <Clock size={13} /> Answer a question first
                </>
              ) : hasMandatoryErrors ? (
                <>
                  <AlertCircle size={13} /> Fix N/A reasons
                </>
              ) : isCompleted ? (
                <>
                  <CheckCircle size={13} /> Save Changes
                </>
              ) : allAnswered ? (
                <>
                  <CheckCircle size={13} /> Complete & Save
                </>
              ) : (
                <>
                  <Save size={13} /> Save Progress
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div style={S.wrap}>
        {/* Banner */}
        <div style={S.banner}>
          <div
            style={{
              position: "absolute",
              top: -28,
              right: -28,
              width: 140,
              height: 140,
              background:
                "radial-gradient(circle,rgba(99,102,241,0.3) 0%,transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
          <div style={S.bannerEye}>Stage 2 of 2 — AI Impact Assessment</div>
          <div style={S.bannerH}>{assignment.aiSystemName}</div>
          <div style={S.bannerMeta}>
            {assignment.department && (
              <span style={S.bannerMetaItem}>
                <Building2 size={12} /> {assignment.department}
              </span>
            )}
            {assignment.aiSystemOwner && (
              <span style={S.bannerMetaItem}>
                <User size={12} /> {assignment.aiSystemOwner}
              </span>
            )}
            {assignment.dateOfAssessment && (
              <span style={S.bannerMetaItem}>
                <Calendar size={12} />{" "}
                {new Date(assignment.dateOfAssessment).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "numeric" },
                )}
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div style={S.prgLabel}>
          <span>Checklist Completion</span>
          <span style={{ color: pct === 100 ? "#059669" : "#6b7280" }}>
            {pct}%
          </span>
        </div>
        <div style={S.prgBar}>
          <div style={S.prgFill(pct)} />
        </div>

        {/* Stats */}
        <div style={S.stats}>
          {[
            { label: "Answered", value: `${answered}/${total}`, accent: BLUE },
            {
              label: "Progress",
              value: `${pct}%`,
              accent: pct >= 80 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#6366f1",
            },
            {
              label: "Remaining",
              value: total - answered,
              accent: total - answered > 0 ? "#f59e0b" : "#10b981",
            },
          ].map((s, i) => (
            <div key={i} style={S.stat(s.accent)}>
              <div style={S.statDot(s.accent)} />
              <div>
                <div style={S.statV}>{s.value}</div>
                <div style={S.statL}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={S.alert("error")}
            >
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>{error}</div>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={S.alert("success")}
            >
              <CheckCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>{success}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completed banner */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={S.doneBanner}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  flexShrink: 0,
                  background: "linear-gradient(135deg,#10b981,#059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PartyPopper size={16} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 800, color: "#065f46" }}
                >
                  Assessment Completed!
                </div>
                <div style={{ fontSize: 12, color: "#16a34a", marginTop: 1 }}>
                  All 51 items answered and submitted. You can still update
                  answers and re-save.
                </div>
              </div>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 99,
                  background: "#10b981",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                100% Complete
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div style={S.tabs}>
          {[
            { key: "info", label: "Overview", icon: FileText },
            {
              key: "stage2",
              label: "Checklist",
              icon: CheckSquare,
              badge: `${pct}%`,
              // If Risk Owner hasn't filled details yet, show a warning dot on the tab
              warn: detailsMissing,
            },
            {
              key: "risks",
              label: "Risk Review",
              icon: Shield,
              badge: noCount > 0 ? `${noCount}` : null,
              disabled: !riskReviewUnlocked,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => !tab.disabled && setActiveTab(tab.key)}
                style={S.tab(active, tab.disabled)}
                title={
                  tab.disabled
                    ? "Complete all questions and fill N/A reasons to unlock"
                    : ""
                }
              >
                <Icon size={13} /> {tab.label}
                {tab.badge && (
                  <span style={S.tabBadge(active)}>{tab.badge}</span>
                )}
                {tab.warn && (
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#f59e0b",
                      flexShrink: 0,
                      marginLeft: 2,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div style={S.grid}>
                <div style={S.card}>
                  <div style={S.cHead(BLUE)}>
                    <div style={S.cBadge(BLUE)}>
                      <Brain size={13} color="white" />
                    </div>
                    <div style={S.cTitle}>System Details</div>
                  </div>
                  <div style={S.cBody}>
                    <InfoRow
                      label="AI System Name"
                      value={assignment.aiSystemName}
                      icon={Brain}
                    />
                    <InfoRow
                      label="Department"
                      value={assignment.department}
                      icon={Building2}
                    />
                    <InfoRow
                      label="System Owner"
                      value={assignment.aiSystemOwner}
                      icon={User}
                    />
                    <InfoRow
                      label="Assessment Date"
                      value={
                        assignment.dateOfAssessment
                          ? new Date(
                              assignment.dateOfAssessment,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : null
                      }
                      icon={Calendar}
                      last
                    />
                  </div>
                </div>
                <div style={S.card}>
                  <div style={S.cHead("#10b981")}>
                    <div style={S.cBadge("#10b981")}>
                      <Target size={13} color="white" />
                    </div>
                    <div style={S.cTitle}>Objectives & Use</div>
                  </div>
                  <div style={S.cBody}>
                    {isRiskOwner || isRootOrAIO ? (
                      /* ── Editable for Risk Owner / Root / AIO ── */
                      <RiskOwnerDetailsPanel
                        assignment={{ ...assignment, ...assignmentDetails }}
                        assessmentId={assessmentId}
                        onDetailsSaved={(updated) => {
                          setAssignmentDetails((prev) => ({
                            ...prev,
                            ...updated,
                          }));
                        }}
                        inline
                      />
                    ) : (
                      /* ── Read-only for everyone else ── */
                      [
                        {
                          label: "Business Objective",
                          value: assignmentDetails.businessObjective,
                        },
                        {
                          label: "Intended Use",
                          value: assignmentDetails.intendedUse,
                        },
                        assignmentDetails.foreseableMisuse && {
                          label: "Foreseeable Misuse",
                          value: assignmentDetails.foreseableMisuse,
                          warn: true,
                        },
                      ]
                        .filter(Boolean)
                        .map(({ label, value, warn }, i) => (
                          <div key={i}>
                            <div style={S.tBlkLabel(warn)}>
                              {warn && <AlertTriangle size={10} />}
                              {label}
                            </div>
                            <div style={S.tBlk(warn)}>{value || "—"}</div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "stage2" && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >

              {/* Category accordions */}
              {CHECKLIST.map((cat) => {
                const isOpen = !!expanded[cat.key];
                const catItems = cat.subtopics.flatMap(
                  (sub) => checklist[cat.key]?.[sub.label] || [],
                );
                const catAns = catItems.filter((i) => i.status !== "").length;
                const catRisks = catItems.filter(
                  (i) => i.status === "No",
                ).length;
                const catNaErr = catItems.filter(
                  (i) => i.status === "NA" && !i.naReason?.trim(),
                ).length;
                const catPct =
                  catItems.length > 0
                    ? Math.round((catAns / catItems.length) * 100)
                    : 0;

                return (
                  <div key={cat.key} style={S.catWrap(cat.color, isOpen)}>
                    <button
                      style={S.catBtn(cat.color, isOpen)}
                      onClick={() =>
                        setExpanded((p) => ({ ...p, [cat.key]: !p[cat.key] }))
                      }
                    >
                      <div style={S.catLetter(cat.color)}>{cat.letter}</div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#111827",
                            }}
                          >
                            {cat.label}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color:
                                catAns === catItems.length
                                  ? "#059669"
                                  : "#6b7280",
                              padding: "1px 8px",
                              borderRadius: 99,
                              background:
                                catAns === catItems.length
                                  ? "#d1fae5"
                                  : "#f0f2f8",
                            }}
                          >
                            {catAns}/{catItems.length}
                          </span>
                          {catNaErr > 0 && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#b45309",
                                padding: "1px 8px",
                                borderRadius: 99,
                                background: "#fef3c7",
                              }}
                            >
                              📝 {catNaErr} N/A reason
                              {catNaErr !== 1 ? "s" : ""} needed
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            height: 3,
                            width: 150,
                            background: "#e4eaf4",
                            borderRadius: 99,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${catPct}%`,
                              background: cat.color,
                              borderRadius: 99,
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ color: "#9ca3af" }}>
                        {isOpen ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ padding: "4px 18px 16px" }}>
                            {cat.subtopics.map((sub, si) => {
                              const subItems =
                                checklist[cat.key]?.[sub.label] || [];
                              return (
                                <div key={si}>
                                  <div style={S.subPill(cat.color)}>
                                    {sub.label}
                                  </div>
                                  {subItems.map((item, idx) => {
                                    globalQ++;
                                    const qn = globalQ;
                                    const isRisk = item.status === "No";
                                    const isNa = item.status === "NA";
                                    const naErr =
                                      isNa && !item.naReason?.trim();

                                    return (
                                      <div
                                        key={idx}
                                        style={{
                                          ...S.qWrap(item.status, naErr),
                                          marginBottom:
                                            idx < subItems.length - 1 ? 7 : 0,
                                        }}
                                      >
                                        <div style={S.qTop}>
                                          <span style={S.qBadge(cat.color)}>
                                            Q{qn}
                                          </span>
                                          <span style={S.qTxt}>
                                            {item.consideration}
                                          </span>
                                          <select
                                            value={item.status}
                                            onChange={(e) =>
                                              handleStatus(
                                                cat.key,
                                                sub.label,
                                                idx,
                                                e.target.value,
                                              )
                                            }
                                            style={S.qSel(item.status)}
                                          >
                                            <option value="">Select…</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                            <option value="NA">N/A</option>
                                          </select>
                                        </div>

                                        {isNa && (
                                          <div style={S.naBox}>
                                            <div style={S.naLabel(naErr)}>
                                              {naErr && (
                                                <AlertTriangle size={10} />
                                              )}
                                            </div>
                                            <textarea
                                              value={item.naReason}
                                              onChange={(e) =>
                                                updateItem(
                                                  cat.key,
                                                  sub.label,
                                                  idx,
                                                  "naReason",
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="Provide Details (mandatory)"
                                              rows={2}
                                              style={S.ta(
                                                naErr ? "#fca5a5" : "#fde68a",
                                              )}
                                              onFocus={(e) =>
                                                (e.target.style.borderColor =
                                                  naErr ? "#ef4444" : "#f59e0b")
                                              }
                                              onBlur={(e) =>
                                                (e.target.style.borderColor =
                                                  naErr ? "#fca5a5" : "#fde68a")
                                              }
                                            />
                                          </div>
                                        )}
                                        {item.extraPrompt &&
                                          item.status === "Yes" && (
                                            <div>
                                              <div style={S.epLabel(cat.color)}>
                                                {item.extraPrompt}{" "}
                                                <span
                                                  style={{
                                                    fontSize: 10,
                                                    color: "#9ca3af",
                                                    fontWeight: 400,
                                                  }}
                                                >
                                                  (optional)
                                                </span>
                                              </div>
                                              <div style={S.taWrap}>
                                                <textarea
                                                  value={item.details}
                                                  onChange={(e) =>
                                                    updateItem(
                                                      cat.key,
                                                      sub.label,
                                                      idx,
                                                      "details",
                                                      e.target.value,
                                                    )
                                                  }
                                                  placeholder="Provide details…"
                                                  rows={2}
                                                  style={S.ta(cat.color + "70")}
                                                  onFocus={(e) =>
                                                    (e.target.style.borderColor =
                                                      cat.color)
                                                  }
                                                  onBlur={(e) =>
                                                    (e.target.style.borderColor =
                                                      cat.color + "70")
                                                  }
                                                />
                                              </div>
                                            </div>
                                          )}

                                        {isRisk && (
                                          <div style={S.taWrap}>
                                            <textarea
                                              value={item.details}
                                              onChange={(e) =>
                                                updateItem(
                                                  cat.key,
                                                  sub.label,
                                                  idx,
                                                  "details",
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="Provide details (optional)"
                                              rows={2}
                                              style={S.ta("#fecaca")}
                                              onFocus={(e) =>
                                                (e.target.style.borderColor =
                                                  "#ef4444")
                                              }
                                              onBlur={(e) =>
                                                (e.target.style.borderColor =
                                                  "#fecaca")
                                              }
                                            />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Bottom bar */}
              <div style={S.btmBar}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}
                  >
                    {answered}/{total} answered
                  </span>
                  {!allAnswered && (
                    <span style={S.remPill}>
                      <Clock size={11} /> {total - answered} unanswered
                    </span>
                  )}
                  {hasMandatoryErrors && (
                    <span
                      style={{
                        ...S.rkPill,
                        color: "#b45309",
                        background: "#fef3c7",
                      }}
                    >
                      <AlertTriangle size={11} /> {mandatoryErrors.length} N/A
                      reason{mandatoryErrors.length !== 1 ? "s" : ""} missing
                    </span>
                  )}
                </div>
                <button
                  style={S.btn(
                    saving || answered === 0 || hasMandatoryErrors,
                    allAnswered && !hasMandatoryErrors,
                  )}
                  onClick={handleSave}
                  disabled={saving || answered === 0 || hasMandatoryErrors}
                >
                  <Save size={13} />
                  {saving
                    ? "Saving…"
                    : answered === 0
                      ? "Answer a question first"
                      : hasMandatoryErrors
                        ? `Fix ${mandatoryErrors.length} N/A reason${mandatoryErrors.length !== 1 ? "s" : ""}`
                        : allAnswered
                          ? "Complete & Save"
                          : "Save Progress"}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "risks" && riskReviewUnlocked && (
            <RiskReviewTab
              key="risks"
              checklist={checklist}
              assessmentId={assessmentId}
              user={user}
              aiSystemName={assignment.aiSystemName}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AssignmentDetailPageWrapper(props) {
  return <AssignmentDetailPage {...props} />;
}
