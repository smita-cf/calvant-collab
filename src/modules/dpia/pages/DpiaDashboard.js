//C:\Users\ak192\Downloads\CV_Beta_v1.0.0-Calvant_migration-2\CV_Beta_v1.0.0-Calvant_migration-2\src\modules\dpia\pages\DpiaDashboard.js

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import { getAllAssessments } from "../services/dpiaApi";
import { captureActivity, ACTIONS } from "../../../services/activities";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Joyride, { STATUS } from "react-joyride";
import {
  ShieldCheck,
  ClipboardList,
  BarChart3,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  UserCheck,
  Layers,
  Search,
  HelpCircle,
  BookOpen
} from "lucide-react";

// ── Modal imports ─────────────────────────────────────────────────────────────
import AssignDpiaModal from "../components/AssignDpiaModal";
import ManageDpiaAssignmentsModal from "../components/ManageDpiaAssignmentsModal";
import ViewMyDpiasModal from "../components/ViewMyDpiaModal";
import ReviewDpiaFindingsModal from "../components/ReviewDpiaFindingsModal";
import {
  getAllUsers,
  getDepartments,
} from "../../departments/services/userService";
import HelpDocModal from "@/components/shared/HelpDocModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMonthLabel(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short" });
  } catch {
    return null;
  }
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────
function PieTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        minWidth: 150,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: "#1e293b",
          fontSize: 13,
          marginBottom: 2,
        }}
      >
        {d.name}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#1e293b",
          marginBottom: 2,
        }}
      >
        {d.value}
      </div>
      <div style={{ fontSize: 11, color: "#64748b" }}>
        {((d.value / (total || 1)) * 100).toFixed(1)}% of total
      </div>
    </div>
  );
}

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      }}
    >
      <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 13 }}>
        {d.name}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>
        {d.value}
      </div>
      <div style={{ fontSize: 11, color: "#64748b" }}>assessments</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const {
    user,
    mounted,
    isRoot: hookIsRoot,
    isPrivilegedRole,
    isViewingManagedOrg,
    effectiveOrgId,
    effectiveOrgIds,
    selectedChildOrg,
  } = useEffectiveOrg();
  const isRoot = isPrivilegedRole;
  const organizationId = effectiveOrgId;
  const router = useRouter();
  const chartsContainerRef = useRef(null);
  const pageLoggedRef = useRef(false);
  const [departments, setDepartments] = useState([]);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

  // ── Role detection ────────────────────────────────────────────────────────
  const userRoles = Array.isArray(user?.role) ? user.role : [user?.role || ""];
  const isRiskOwner =
    userRoles.includes("risk_owner") || userRoles.includes("risk_manager");

  const [dpias, setDpias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [riskOwners, setRiskOwners] = useState([]);
  const [run, setRun] = useState(false);

  const [showHelpDoc, setShowHelpDoc] = useState(false);

const DPIA_HELP_CONTENT = `
## 1. Introduction

The Impact Assessment Module in CalVant helps you identify, evaluate, and document the privacy and AI governance risks associated with your organization's data processing activities and AI systems. It supports several linked assessment types — Risk Assessments, Data Protection Impact Assessments and AI Impact Assessments — aligned to frameworks such as GDPR, DPDPA, KSA PDPL, CCPA, ISO 27701, ISO 42001, EU AI Act, etc.

## 2. Accessing the Impact Assessment Module

1. Click the DPIA icon in the sidebar to land on your DPIA Dashboard, the risk icon to land on your Risk Dashboard, or the AIIA icon to land on your AI Impact Assessment Dashboard.

## 3. Key Terminology

A short list of terms that are specific to CalVant's policy workflow rather than self-explanatory from the screen itself:

| Term | Definition |
|---|---|
| DPIA | Data Protection Impact Assessment — a structured review of how personal data is collected, used, and protected, used to identify privacy risk before high-risk processing begins. |
| AIIA | AI Impact Assessment — a structured review of an AI system's business objective, intended use, and foreseeable misuse, used to identify AI governance risk before deployment. |

## 4. Manual Navigation

### 4.1 DPIA Dashboard

The DPIA Dashboard is your home base for privacy impact assessments. It gives you an at-a-glance summary of every DPIA in your organization, along with quick actions to browse, plan, and manage them.

![DPIA Dashboard overview](/Screenshots/ImpactAssessments/DPIA/dpia-dashboard.png)

1. **Summary tiles** — Total, Submitted, In Progress, and Pending DPIA counts.
2. **Audit Status** — shows a "No Assessments Yet" state until the first DPIA is created.
3. **Audit Trends** — a bar chart of DPIAs created each month; shows "No Trend Data" until assessments carry date fields.

The Quick Actions panel gives one-click access to the most common tasks:

| Field | Description |
|---|---|
| View DPIAs | Opens the browsable list (Section 4.4). |
| Plan DPIAs | Plan DPIA starts the assignment wizard (Section 4.2). |
| Manage DPIAs | Manage DPIA opens the editable assignment register (Section 4.5). |

### 4.2 Planning a DPIA

CalVant uses a guided, two-step wizard to plan a DPIA: Select Assessment, then Set Details.

![DPIA Plan overview](/Screenshots/ImpactAssessments/DPIA/dpia-plan.png)

1. From the DPIA Dashboard, click Plan DPIA under Quick Actions.
2. Step 1 — Select Assessment: choose an existing draft assessment from the list, or click New DPIA to create one.
3. Click Next: Set Details to continue.

![DPIA Plan 2 overview](/Screenshots/ImpactAssessments/DPIA/dpia-plan2.png)

| Field | Description |
|---|---|
| Department | Required; the department the DPIA relates to. |
| Assign To (Risk Owner) | Required; the individual responsible for completing the DPIA. |
| Due Date | Required; the date the DPIA must be completed by. |
| Notes / Instructions | Optional context or instructions for the Risk Owner. |

Click Assign DPIA to save the assignment and notify the selected Risk Owner.

### 4.3 Completing a DPIA

Once assigned, the Risk Owner completes the DPIA through a three-stage questionnaire: PII Inventory, Personal Data Elements, and DPIA Questionnaire.

![DPIA Conduct overview](/Screenshots/ImpactAssessments/DPIA/dpia-conduct.png)

1. **PII Inventory** — captures the anticipated data subjects (e.g., Current Employee, Customer's Customer, Business Contact) and the geographies or jurisdictions in which they reside (e.g., Europe, United States, California, etc.), and other details related to the data subjects and the collection of data.
2. **Personal Data Elements** — a checklist of the specific data elements collected as part of the activity.
3. **DPIA Questionnaire** — captures compliance and obligation questions used to determine the overall risk posture of the processing activity.

Each question supports multi-select checkboxes where more than one answer applies. Progress through the three stages using the tabs at the top of the screen.

### 4.4 Viewing DPIA Assessments

The View DPIAs screen lists every DPIA in your organization for browsing, independent of the Manage DPIA edit workflow described in Section 4.5.

![DPIA View overview](/Screenshots/ImpactAssessments/DPIA/dpia-view.png)

### 4.5 Managing DPIA Assessments

![DPIA Manage overview](/Screenshots/ImpactAssessments/DPIA/dpia-manage.png)

1. Assignments List — search by project, assignee, or status; each row shows the DPIA ID, a Status badge (e.g., Completed, Assigned), Assigned To, and Due Date.
2. Click the edit (pencil) icon on a row to open Edit Assignment and update its details.
3. Use the search bar to quickly locate a specific assignment within the full register (e.g., 19 assignments).

### 4.6 AI Impact Assessment (AIIA) Dashboard

The AI Impact Assessment Dashboard is your home base for AI governance risk. It gives you an at-a-glance summary of every AIIA in your organization, along with quick actions to browse, plan, and manage them.

![AIIA Dashboard overview](/Screenshots/ImpactAssessments/AI/aiia-dashboard.png)

1. **Summary tiles** — Total, Approved, Completed, Pending, and Avg Complete percentage.
2. **Assessment Status** — shows a "No Assessments" state until the first AIIA is created.
3. **Assessment Trends** — a monthly distribution chart.

The Quick Actions panel mirrors the DPIA Dashboard:

| Field | Description |
|---|---|
| View Assessments | Browses all AIIA records. |
| Plan Assessment | Starts a new AIIA (Section 4.7). |
| Manage AIIA | Opens the editable register (Section 4.8). |

### 4.7 Planning an AI Impact Assessment

Click Plan Assessment under Quick Actions on the AIIA Dashboard to open the Plan AI Assessment panel.

![AIIA Dashboard overview](/Screenshots/ImpactAssessments/AI/aiia-plan.png)

1. Enter the AI System Name (e.g., Customer Support Chatbot).
2. Select the Department responsible for the AI system.
3. Confirm or update the Assessment Date (defaults to today).
4. Click Create Assessment to save.

### 4.8 Completing & Managing an AIIA

Opening an assessment from Manage AIIA, or from an assignment in My Assignments, starts a two-step wizard: Assessment Details, then Assign Risk Owners.

![AIIA Dashboard overview](/Screenshots/ImpactAssessments/AI/aiia-plan2.png)


| Field | Description |
|---|---|
| AI System Name | Required; editable name of the AI system. |
| Department | Required; the department responsible for the AI system. |
| Business Objective | Required; the intended business goal of the AI system. |
| Intended Use | Required; how the AI system is meant to be used. |
| Foreseeable Misuse | Optional; potential risks or misuse scenarios for the AI system. |
| AI System Owner Email | Required; contact for the AI system owner. |
| Assessment Date | The date the assessment is recorded. |
| Status | DRAFT until the assessment is submitted for review. |

Click Next: Assign Risk Owners to continue to Step 2 and assign the assessment for completion.

### 4.9 My Assignments

My Assignments lists every AIIA assigned to you for review and completion, accessible from the sidebar or a notification link.

![AIIA Dashboard overview](/Screenshots/ImpactAssessments/AI/aiia-assessments.png)

1. **Summary tiles** — Pending, Completed, and Total assignment counts.
2. **Pending Action tab** — lists assessments awaiting your input, each with its Business Objective summary and a Start Assessment button.
3. Click Refresh to reload the latest assignment data.

![AIIA Dashboard overview](/Screenshots/ImpactAssessments/AI/aiia-completed.png)

The Completed tab lists assessments you have finished; it shows a "No completed assignments" empty state until at least one AIIA is completed.

## 5. Status & Quality Reference

### DPIA Status

| Status | Meaning |
|---|---|
| Draft | The DPIA has been created but not yet assigned to a Risk Owner. |
| Assigned | The DPIA has been sent to a Risk Owner and is awaiting completion. |
| In Progress | The Risk Owner has started but not yet finished the questionnaire. |
| Completed | The Risk Owner has finished all checklist items. |
| Submitted | The completed DPIA has been submitted for compliance review. |
| High Risk | The assessment's responses indicate a high-risk processing activity requiring closer review. |

### AIIA Status

| Status | Meaning |
|---|---|
| Draft | The assessment has been created; Business Objective, Intended Use, and Foreseeable Misuse are not yet complete. |
| Pending / Action Required | Awaiting the assigned Risk Owner's input in My Assignments. |
| Completed | The Risk Owner has completed the assessment. |
| Approved | The assessment has been reviewed and approved. |

## 6. Tips, Best Practices

### DPIA Frameworks

1. Trigger a DPIA whenever a new or changed processing activity involves large-scale, sensitive, or cross-border personal data, so privacy risk is assessed before processing begins — aligned to obligations under GDPR, DPDPA, KSA PDPL, and similar frameworks.
2. Complete the PII Inventory stage accurately; the data subjects and geographies selected there determine which jurisdiction-specific obligations apply later in the questionnaire.
3. Revisit a completed DPIA whenever the underlying processing activity changes materially — new data elements, a new purpose, or a new jurisdiction.

### AIIA Frameworks

1. Trigger an AIIA whenever a new AI system is proposed or materially changed, so its business objective, intended use, and foreseeable misuse are documented before deployment — aligned to frameworks such as ISO 42001 and the EU AI Act.
2. Keep Foreseeable Misuse specific and scenario-based; vague entries weaken the Risk Owner's ability to plan mitigating controls.
3. Revisit an approved AIIA whenever the AI system is retrained, retuned, or repurposed for a new business objective.

## 7. Additional Information

1. Set realistic Due Dates when planning a DPIA or AIIA, so assignments are completed before the associated processing activity or AI system goes live.
2. Review My Assignments regularly if you are a Risk Owner, so pending DPIAs and AIIAs don't lapse past their due date.
`;

  const steps = [
    {
      target: "#dashboard-header",
      content: "Welcome to your DPIA dashboard. Manage data protection impact assessments efficiently.",
    },
    {
      target: "#stats-grid",
      content: "A quick summary of assessments categorized by status.",
    },
    {
      target: "#action-cards",
      content: "Plan new assessments, manage assignments, or review submitted audits.",
    },
    {
      target: "#charts-container",
      content: "Visual status metrics and monthly DPIA trends.",
    },
  ];

  useEffect(() => {
    if (!organizationId) return;

    getAllUsers()
      .then((users) => {
        const owners = (users || []).filter(
          (u) =>
            Array.isArray(u.role) &&
            u.role.some((r) => r.toLowerCase() === "risk_owner"),
        );
        setRiskOwners(owners);
      })
      .catch((err) => console.error("Failed to load users", err));

    getDepartments()
      .then((data) => {
        const filtered = (data || []).filter(
          (d) =>
            String(d.organizationId || d.organization) ===
            String(organizationId),
        );
        setDepartments(filtered);
      })
      .catch((err) => console.error("Failed to load departments", err));
  }, [organizationId]);

  const loadData = useCallback(() => {
    if (!organizationId) return;

    setError(null);
    setLoadingStats(true);
    setLoading(true);

    getAllAssessments(organizationId)
      .then((data) => {
        setDpias(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message || err?.message || "Failed to load",
        );
      })
      .finally(() => {
        setLoadingStats(false);
        setLoading(false);
      });
  }, [organizationId]);

  // Load data only after the user is confirmed present to avoid unauthenticated requests
  useEffect(() => {
    if (!mounted || !user || !organizationId) return;

    // Load dashboard data
    loadData();

    // Log page load only once
    if (!pageLoggedRef.current) {
      pageLoggedRef.current = true;

      captureActivity({
        action: ACTIONS.PAGE_LOAD,
        item: "DPIA Dashboard",
        url: window.location.pathname,
      });
    }
  }, [mounted, user, organizationId, loadData]);
  // Fix recharts in flex containers
  useEffect(() => {
    const roTimer = { current: null };
    const ro = new ResizeObserver(() => {
      clearTimeout(roTimer.current);
      roTimer.current = setTimeout(
        () => window.dispatchEvent(new Event("resize")),
        150,
      );
    });
    const el = chartsContainerRef.current;
    if (el) ro.observe(el);
    return () => {
      clearTimeout(roTimer.current);
      if (el) ro.unobserve(el);
      ro.disconnect();
    };
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const total = dpias.length;
  const submitted = dpias.filter((d) => d.status === "SUBMITTED").length;
  const inProgress = dpias.filter((d) => d.status === "IN_PROGRESS").length;
  const pending = dpias.filter((d) => d.status === "PENDING").length;
  const highRisk = dpias.filter((d) => d.overallRiskLevel === "HIGH").length;

  // ── Pie data ──────────────────────────────────────────────────────────────
  const pieData = [
    { name: "Submitted", value: submitted, color: "#10b981" },
    { name: "In Progress", value: inProgress, color: "#6366f1" },
    { name: "Pending", value: pending, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  // ── Bar data ──────────────────────────────────────────────────────────────
  const monthlyMap = dpias.reduce((acc, d) => {
    const m = getMonthLabel(d.createdDate);
    if (m) acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  const barData = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].map((m) => ({ name: m, value: monthlyMap[m] || 0 }));
  const BAR_COLORS = [
    "#3b82f6",
    "#60a5fa",
    "#93c5fd",
    "#bfdbfe",
    "#dbeafe",
    "#eff6ff",
    "#e0f2fe",
    "#bae6fd",
    "#7dd3fc",
    "#38bdf8",
    "#0ea5e9",
    "#0284c7",
  ];

  // ── Stat cards ────────────────────────────────────────────────────────────
  const statCards = [
    {
      label: "Total",
      value: total,
      Icon: FileText,
      color: "from-blue-400 to-blue-500",
    },
    {
      label: "Submitted",
      value: submitted,
      Icon: CheckCircle2,
      color: "from-emerald-400 to-emerald-500",
    },
    {
      label: "In Progress",
      value: inProgress,
      Icon: Clock,
      color: "from-violet-400 to-violet-500",
    },
    {
      label: "Pending",
      value: pending,
      Icon: FileText,
      color: "from-amber-400 to-amber-500",
    },
  ];

  // ── Quick actions ─────────────────────────────────────────────────────────
  const rootActions = [
    {
      key: "view",
      Icon: Eye,
      title: "View DPIAs",
      subtitle: "Browse all assessments",
      color: "from-emerald-400 to-emerald-600",
      onClick: () => {
        captureActivity({
          action: ACTIONS.CLICK,
          item: "DPIA · Opened: View DPIAs",
          url: window.pathname,
        });
        router.push("/dpia/assessments");
      },
    },
    {
      key: "assign",
      Icon: UserCheck,
      title: "Plan DPIA",
      subtitle: "Assign to a risk owner",
      color: "from-violet-400 to-violet-600",
      onClick: () => {
        captureActivity({
          action: ACTIONS.CLICK,
          item: "DPIA · Opened: Plan DPIA Modal",
          url: window.pathname,
        });
        setModal("assign");
      },
    },
    {
      key: "manage",
      Icon: Layers,
      title: "Manage DPIA",
      subtitle: "View & edit assignments",
      color: "from-purple-400 to-purple-600",
      onClick: () => {
        captureActivity({
          action: ACTIONS.CLICK,
          item: "DPIA · Opened: Manage DPIA Modal",
          url: window.pathname,
        });
        setModal("manage");
      },
    },
  ];

  const riskOwnerActions = [
    {
      key: "myDpias",
      Icon: ShieldCheck,
      title: "Conduct DPIA",
      subtitle: "View your assigned assessments",
      color: "from-violet-400 to-violet-600",
      onClick: () => {
        captureActivity({
          action: ACTIONS.CLICK,
          item: "DPIA · Opened: Conduct DPIA Modal",
          url: window.pathname,
        });
        setModal("myDpias");
      },
    },
    {
      key: "view",
      Icon: Eye,
      title: "Review DPIAs",
      subtitle: "Browse all assessments",
      color: "from-emerald-400 to-emerald-600",
      onClick: () => router.push("/dpia/assessments"),
    },
  ];

  const defaultActions = [
    {
      key: "new",
      Icon: Plus,
      title: "New Assessment",
      subtitle: "Start a new DPIA",
      color: "from-blue-400 to-blue-600",
      onClick: () => router.push("/dpia/new"),
    },
    {
      key: "view",
      Icon: Eye,
      title: "View Assessments",
      subtitle: "Browse all assessments",
      color: "from-emerald-400 to-emerald-600",
      onClick: () => router.push("/dpia/assessments"),
    },
    {
      key: "compliance",
      Icon: ShieldCheck,
      title: "Compliance",
      subtitle: "Review submitted findings",
      color: "from-violet-400 to-violet-600",
      onClick: () => router.push("/dpia/assessments"),
    },
    {
      key: "reports",
      Icon: BarChart3,
      title: "Reports",
      subtitle: "Risk level overview",
      color: "from-amber-400 to-amber-500",
      onClick: () => router.push("/dpia/assessments"),
    },
  ];

  const quickActions = isRoot
    ? rootActions
    : isRiskOwner
      ? riskOwnerActions
      : defaultActions;

  // ── Role badge ────────────────────────────────────────────────────────────
  const roleBadge = isRoot
    ? { label: "Root", style: "bg-blue-100 text-blue-700" }
    : isRiskOwner
      ? { label: "Risk Owner", style: "bg-violet-100 text-violet-700" }
      : null;

  // ── Loading gate ──────────────────────────────────────────────────────────
  // Show spinner while the useEffectiveOrg hook is resolving on hard reload.
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  // Confirmed unauthenticated — render nothing
  if (!user) return null;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 flex flex-col overflow-hidden"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <Joyride
        steps={steps}
        run={run}
        continuous
        showSkipButton
        scrollToFirstStep
        styles={{ options: { primaryColor: "#3b82f6", width: 300 } }}
        callback={(data) => {
          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status))
            setRun(false);
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-28">
        {/* ── HEADER ── */}
        <motion.header
          id="dashboard-header"
          className="bg-white/80 backdrop-blur-md border border-slate-100/50 rounded-xl shadow-md mb-2 lg:mb-2 p-4 lg:p-5 !text-left"
          style={{
            textAlign: "left",
            width: "100%",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            justifyItems: "flex-start"
          }}
          initial={hasMounted ? { opacity: 0, y: -15 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  DPIA Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {roleBadge && (
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${roleBadge.style}`}
                >
                  {roleBadge.label}
                </span>
              )}
              <span className="text-sm font-semibold text-slate-600">
                {user?.name || "User"}
              </span>
              <motion.button
                onClick={loadData}
                title="Refresh"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw
                  size={15}
                  className="text-slate-500"
                  style={
                    loading ? { animation: "spin 1s linear infinite" } : {}
                  }
                />
              </motion.button>
              <motion.button
                onClick={() => setShowHelpDoc(true)}
                title="Help Documentation"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen size={15} className="text-slate-500" />
              </motion.button>
              <motion.button
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                onClick={() => {
                  setRun(false);
                  setTimeout(() => setRun(true), 100);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <HelpCircle size={18} />
                <span>Guide</span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
            ⚠ {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 h-full">
          {/* ── LEFT COLUMN ── */}
          <div className="space-y-8 lg:space-y-10">
            {/* Stat Cards — root / default only (risk owners see assignment summary) */}
            {!isRiskOwner && (
              <motion.section
                id="stats-grid"
                className="grid grid-cols-2 md:grid-cols-3 gap-4 items-stretch"
                initial={hasMounted ? { opacity: 0, y: 15 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {statCards.map((stat, i) => {
                  const Icon = stat.Icon;
                  return (
                    <motion.div
                      key={stat.label}
                      className="group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-default flex items-center gap-3 h-full min-h-[72px] hover:bg-white"
                      initial={hasMounted ? { opacity: 0, y: 20 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm flex-shrink-0`}
                      >
                        <Icon size={16} className="text-white drop-shadow-sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-base lg:text-lg font-bold text-slate-800 block leading-none group-hover:text-slate-900 mb-0.5">
                          {loadingStats ? "—" : stat.value}
                        </span>
                        <span className="text-[10px] lg:text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none block">
                          {stat.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.section>
            )}

            {/* Risk owner — assigned summary card */}
            {isRiskOwner && (
              <motion.div
                id="stats-grid"
                className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-xl p-5 shadow-sm"
                initial={hasMounted ? { opacity: 0, y: 15 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center shadow-md">
                    <UserCheck size={18} className="text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">
                    DPIAs assigned to {user?.name || "you"}
                  </h3>
                </div>
                <p className="text-sm text-slate-500">
                  Open "My DPIAs" to view your assigned assessments, or "Review
                  Findings" to log remediation actions against compliance
                  issues.
                </p>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.section
              id="action-cards"
              className="space-y-1"
              initial={hasMounted ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-6 px-1">
                Quick Actions
              </h3>
              <div
                className={`grid gap-3 h-15 ${isRiskOwner ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-3"
                  }`}
              >
                <AnimatePresence>
                  {quickActions.map((action, i) => {
                    const Icon = action.Icon;
                    return (
                      <motion.div
                        key={action.key}
                        className={`group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-xl p-4 h-full flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-white transition-all duration-300 cursor-pointer`}
                        initial={hasMounted ? { opacity: 0, scale: 0.93 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={action.onClick}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md mb-3 flex-shrink-0`}
                        >
                          <Icon
                            size={20}
                            className="text-white drop-shadow-sm"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-sm lg:text-base font-semibold text-center text-slate-800 leading-tight mb-1 px-1 truncate group-hover:text-blue-600 transition-colors duration-200">
                            {action.title}
                          </h4>
                          <p className="text-xs font-bold text-center text-slate-600 px-1 truncate">
                            {action.subtitle}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>

          {/* ── RIGHT COLUMN: CHARTS ── */}
          <div id="charts-container" ref={chartsContainerRef} className="space-y-4 lg:space-y-3">
            {/* Pie Chart */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl p-6 lg:p-7 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-400 h-80 flex flex-col"
              initial={hasMounted ? { opacity: 0, scale: 0.95 } : false}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="mb-1 px-1 flex-shrink-0">
                <h3 className="text-base lg:text-lg font-semibold text-slate-800">
                  Assessment Status
                </h3>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0">
                {total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={66}
                        paddingAngle={2}
                        stroke="white"
                        strokeWidth={3}
                      >
                        {pieData.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip total={total} />} />
                      <text
                        x="50%"
                        y="42%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#475569"
                        fontSize={12}
                        fontWeight={600}
                      >
                        Total
                      </text>
                      <text
                        x="50%"
                        y="52%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#111827"
                        fontSize={20}
                        fontWeight={700}
                      >
                        {total}
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <ShieldCheck
                      size={40}
                      className="text-slate-300 mb-3"
                      strokeWidth={1.5}
                    />
                    <p className="text-base font-semibold text-slate-400 mb-1">
                      No Assessments Yet
                    </p>
                    <p className="text-sm text-slate-400">
                      Create your first DPIA to get started
                    </p>
                  </div>
                )}
              </div>
              {total > 0 && (
                <div className="flex gap-4 justify-center mt-2">
                  {pieData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: d.color,
                        }}
                      />
                      {d.name}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Bar Chart */}
            <motion.div
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid #f1f5f9",
                borderRadius: "16px",
                padding: "24px",
                height: "288px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                transition: "all 0.4s ease",
              }}
              initial={hasMounted ? { opacity: 0, scale: 0.95 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.01 }}
            >
              <div style={{ marginBottom: "14px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#1e293b",
                    marginBottom: "4px",
                  }}
                >
                  Assessment Trends
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  Assessments by month{" "}
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                    {total} total
                  </span>
                </p>
              </div>
              <div style={{ flex: 1 }}>
                {barData.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      barCategoryGap="25%"
                    >
                      <CartesianGrid
                        vertical={false}
                        stroke="#f8fafc"
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "#6b7280",
                          fontWeight: 500,
                        }}
                      />
                      <YAxis hide />
                      <Tooltip content={<BarTooltip />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24}>
                        {barData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={BAR_COLORS[i % BAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      textAlign: "center",
                    }}
                  >
                    <BarChart3
                      size={40}
                      style={{
                        color: "#cbd5f5",
                        marginBottom: "8px",
                      }}
                      strokeWidth={1.5}
                    />
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#94a3b8",
                        marginBottom: "4px",
                      }}
                    >
                      No Trend Data
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <HelpDocModal
        open={showHelpDoc}
        onClose={() => setShowHelpDoc(false)}
        title="DPIA Help"
        content={DPIA_HELP_CONTENT}
      />

      {/* ── FOOTER ── */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-slate-100/50 shadow-lg px-8 py-5 sticky bottom-0 z-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} CalVant. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── MODALS ── */}
      {modal === "assign" && (
        <AssignDpiaModal
          onClose={() => setModal(null)}
          onSaved={loadData}
          riskOwners={riskOwners}
          departments={departments}
        />
      )}
      {modal === "manage" && (
        <ManageDpiaAssignmentsModal
          onClose={() => setModal(null)}
          onSaved={loadData}
          riskOwners={riskOwners}
          departments={departments}
        />
      )}
      {modal === "myDpias" && (
        <ViewMyDpiasModal onClose={() => setModal(null)} />
      )}
      {modal === "findings" && (
        <ReviewDpiaFindingsModal onClose={() => setModal(null)} />
      )}
    </div>
  );
}
