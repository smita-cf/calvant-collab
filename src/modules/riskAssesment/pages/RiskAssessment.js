//cf-tool-frontend-main\src\modules\riskAssesment\pages\RiskAssessment.js

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import riskService from "../services/riskService";
import { useFramework } from "../../../context/FrameworkContex";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BarChart3,
  FileText,
  PlusCircle,
  CheckCircle,
  FolderOpen,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Circle,
  XCircle,
  RefreshCw,
  BookOpen,
  X
} from "lucide-react";

import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import Joyride from "react-joyride";
import CustomTooltip from "../components/CustomTooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import { getDepartments } from "../../departments/services/userService";
import { matchesDepartment, getUserRoles, getUserDepartments, isSameOrg } from "@/utils/departmentUtils";

// ── Logging ───────────────────────────────────────────────────────────────────
// Change this if it's resolving to the wrong file location
import { captureActivity, ACTIONS, MODULES } from "../../admin/shell/services/activities"; // ← adjust path to your actual activityService location

function riskMatchesFilter(risk, allowedRiskTypes) {
  const types = Array.isArray(risk.riskType)
    ? risk.riskType.map((t) => t.trim().toLowerCase())
    : risk.riskType
      ? String(risk.riskType)
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
      : [];
  if (types.length === 0) return false;
  const normalizedAllowed = new Set(
    [...allowedRiskTypes].map((t) => t.toLowerCase()),
  );
  return types.some((t) => normalizedAllowed.has(t));
}
// ─────────────────────────────────────────────────────────────────────────────

const RISK_HELP_CONTENT = `
## 1. Introduction

The Risk Module in CalVant helps you identify, assess, treat, and monitor risks across your organization as part of your compliance and information security management program. It supports structured risk assessments aligned to frameworks such as ISO 27001, ISO 27701, ISO 42001, SOC 2, HIPAA, GDPR, DPDPA, KSA PDPL, and NIST CSF 2.

This guide follows the module in the order you'll actually use it.

## 2. Accessing the Risk Module

After logging in to CalVant, use the left-hand navigation sidebar to move between modules. The sidebar gives you access to the Home/Dashboard, Risk, Policy, Audit, and other Task modules, along with account settings at the bottom.

1. Click the Risk icon at the top of the sidebar to land on your Risk Dashboard.
2. Your logged-in user name appears in the top-right of the dashboard header.

## 3. Key Terminology

A short list of terms that are specific to CalVant's risk workflow rather than self-explanatory from the screen itself:

> **Note:** Screens described in this guide reflect the CalVant interface as of July 2026. Minor labels or layouts may change with future product updates.

| Term | Meaning |
|---|---|
| Threat & Vulnerability | The threat is the potential cause of harm to an asset (e.g., Malware Infection); the vulnerability is the weakness it exploits (e.g., Unpatched Software). CalVant pairs the two when scoring a risk. |
| Risk Score | Calculated as Likelihood × Impact. It determines the Risk Level badge shown on the risk (see Section 5). |
| Treatment Plan | The response chosen for a risk — Mitigate, Accept, Transfer, or Avoid — tracked through Open, In Progress, or Closed. |
| Applicable Control(s) | The framework-specific controls (e.g., ISO 27001, SOC 2, GDPR) applied to treat the risk. |
| Residual Risk | The risk level that remains once treatment and controls have been applied. |
| SoA | Statement of Applicability — the master record of every control across your frameworks and whether each applies to your organization. |

## 4. Manual Navigation

With the vocabulary in place, this section walks through every screen in the module in the order you'll use them day to day — starting at the dashboard and ending at the Statement of Applicability.

### 4.1 Risk Dashboard

The Risk Dashboard is your home base for the module. It gives you an at-a-glance summary of all risks in your organization, along with quick actions to create, browse, and manage risks.

![Risk Dashboard overview](/Screenshots/Risk/risk-home.png)

1. **Summary tiles** — total risks, and counts by severity (High / Medium / Low) and status (Open / Closed).
2. **Risk Distribution** — a donut chart showing the proportion of risks by severity level.
3. **Monthly Risk Trends** — a bar chart showing how many risks were created each month for the selected year, filterable by year.

The Quick Actions panel gives one-click access to the most common tasks:

| Field | Description |
|---|---|
| Templates | Opens the library of Sample Risks you can accept into your risk register (Section 4.3). |
| New Risk | Launches the guided wizard to add a new risk (Section 4.2). |
| View Tasks | Shows tasks assigned to you from risk treatment plans (Section 4.5). |
| View Risks | Opens the departmental risk register/list view (Section 4.4). |
| SoA | Opens the Statement of Applicability screen (Section 4.6). |

Use the refresh icon next to your name to reload dashboard data, or the Guide button for in-app help.

### 4.2 Creating a New Risk

CalVant uses a guided, three-step wizard to create a new risk: Risk Assessment, then Treatment Planning, then Task Management. You can move between steps with Previous and Next, and use Save to save your progress at any point.

1. From the Risk Dashboard, click New Risk under Quick Actions (or Add Risk).
2. Complete Step 1: Risk Assessment to identify and score the risk.
3. Complete Step 2: Treatment Planning to define the response and mitigating controls.
4. Complete Step 3: Task Management to assign follow-up tasks, e.g., to an owner, with a due date.

#### 4.2.1 Step 1 — Risk Assessment

This step captures the core details of the risk: what it is, where it lives, and how severe it is.

![Risk Assessment overview](/Screenshots/Risk/risk-assessment.png)

| Field | Description |
|---|---|
| Risk ID | Auto-suggested (e.g., RR-2026-001), or click Generate New ID. CalVant warns you if the ID already exists. |
| Department | The department that owns or is affected by the risk. |
| Date | The date the risk is being recorded (defaults to today). |
| Risk Type | Category of the risk, e.g., Privacy, Artificial Intelligence, Operational. |
| Asset Type / Asset | The classification and name of the affected asset. |

![Risk Fields overview](/Screenshots/Risk/risk-assessent-fields.png)

| Field | Description |
|---|---|
| Threat / Vulnerabilities | Select the applicable threat and one or more vulnerabilities it exploits. |
| Risk Description | Auto-filled from the Threat and Vulnerabilities selected, or entered manually. |
| Likelihood | The probability level of the risk occurring. |
| Existing Controls | Controls already implemented that reduce this risk. |

As you complete Likelihood and the related fields, CalVant automatically calculates the Impact Score, Likelihood Score, Risk Score, and resulting Risk Level, shown as a colored badge — Low, Medium, High, or Critical.

> **Tip:** Click Save to save your progress at any point, or Next to continue to Treatment Planning.

#### 4.2.2 Step 2 — Treatment Planning

This step defines how the organization will respond to the risk and which compliance controls apply.

![Risk Treatment overview](/Screenshots/Risk/risk-treatment.png)

| Field | Description |
|---|---|
| Action | The treatment strategy for the risk — Mitigate or Accept. |
| Status | Current status of the treatment — Open, In Progress, or Closed. |
| New/Proposed Controls | Free-text field to describe new controls proposed to treat the risk. |

![Risk Applicable Controls overview](/Screenshots/Risk/risk-applicable-ctrls.png)

Under Applicable Control(s), select the compliance framework(s) relevant to this risk — for example ISO 27001, KSA PDPL, GDPR, DPDPA, HIPAA, or SOC 2. CalVant then displays the specific control codes that apply.

| Field | Description |
|---|---|
| Start Date | The date treatment work begins. Auto generated to the present date. |
| Number of Days | How many days are allotted to complete treatment; CalVant calculates and displays the target completion date. |

Residual Risk Assessment shows the original Likelihood, Impact, and Risk Score from Step 1 for reference. Enter the Likelihood After Treatment and Impact After Treatment to calculate the residual Risk Score and Risk Level once controls are applied.

> **Caution:** If a treatment deadline passes without the risk being closed, CalVant flags it on the risk detail view with a message such as "Deadline missed by X days." Review overdue risks regularly.

#### 4.2.3 Step 3 — Task Management

The final step converts the treatment plan into a trackable action plan — tasks with an owner and due date so the mitigation work is followed through to completion.

![Risk Task overview](/Screenshots/Risk/risk-task.png)

Click Add Task to create a task for the risk. Completed tasks and their status can be reviewed from View Tasks on the dashboard (Section 4.5), or from the Task module in the sidebar.

Complete the following fields to create a mitigation task for the selected risk:

| Field | Description |
|---|---|
| Department | Select the department responsible for completing the task. |
| Assign To | Select the employee who will be responsible for the task. |
| Task Description | Enter a brief description of the mitigation activity to be performed. |
| Priority | Select the task priority: Low, Medium, High, or Critical. |
| Start Date | Select the date on which work on the task is expected to begin. |
| End Date | Select the target completion date for the task. |
| Save Task | Saves the task and associates it with the current risk. |
| Cancel | Closes the window without saving the task. |

> **Tip:** Once all three steps are completed and saved, the new risk appears in your risk register and is reflected immediately in the Risk Dashboard counts and charts.

### 4.3 Using Risk Templates (Sample Risks)

Rather than creating every risk from scratch, CalVant provides a library of pre-built, industry-standard risk templates you can review and accept into your risk register. Access this from Templates on the Risk Dashboard.

![Risk Sample overview](/Screenshots/Risk/risk-sample.png)

The screen shows summary counts (Total, High, Critical, Medium, Low) and a filterable, sortable list of template risks. Use the Dept and Risk Level filters to narrow the list, or the row-level actions to act on individual risks:

| Field | Description |
|---|---|
| Accept | Adds the template risk to your organization's risk register as-is. |
| Reject | Dismisses the template risk without adding it. |
| View | Opens a read-only detail view of the full risk before you decide. |

> **Tip:** Using templates is the fastest way to populate your risk register when adopting a new framework — CalVant's sample library includes risks specific to each supported framework.

### 4.4 Viewing Saved Risk Assessments

Once risks have been created or accepted, they're listed under Saved Risk Assessments, accessible via View Risks on the dashboard. This is your working risk register.

![Risk Saved overview](/Screenshots/Risk/risk-saved.png)

The screen shows the total number of risks and a breakdown by severity (High, Critical, Medium, Low) and status (Open, Closed), along with a timestamp of when the list was last generated. Each row shows the Risk ID and Description — click a row to open its full details. From here you can also click Generate SoA to jump directly to the Statement of Applicability (Section 4.6).

### 4.5 Viewing Tasks

The View Tasks screen lists every task assigned to you from risk treatment plans across your organization. Access it from View Tasks on the Risk Dashboard.

![Risk Tasks overview](/Screenshots/Risk/risk-tasks.png)

Summary tiles show Total, In Progress, Completed, On Hold, and Critical task counts. Use the All filter chip or the search box, searching by task or Risk ID, to narrow the list.

| Field | Description |
|---|---|
| Task ID / Description | The unique identifier and a short summary of the task. |
| Risk ID | The risk this task was created to treat. |
| Assignee / Priority | Who is responsible for the task, and its urgency. |
| Start Date / Due Date | The scheduled window for completing the task. |
| Status | Current progress, e.g., In Progress, Completed, On Hold. |

If no tasks are currently assigned to you, the table shows a "No tasks assigned to you" empty state.

### 4.6 Generating a Statement of Applicability (SoA)

The SoA is a master record of every control across your selected compliance frameworks, and whether each is applicable to your organization — a required artifact for certifications such as ISO 27001. Access it from Statement of Applicability on the dashboard, or Generate SoA from the Saved Risk Assessments screen.

![Risk SoA overview](/Screenshots/Risk/risk-soa.png)

Summary tiles show Total Controls, controls marked SoA Applicable, controls with mappings, and the count for the active framework (e.g., ISO 27001).

1. Use the Global Filter banner or the Framework filter row to switch between viewing All Frameworks or a single framework.
2. Use the search box to find a control by name, title, or mapped code, and the sort dropdown to reorder results, e.g., Control Code A→Z.
3. For each requirement row, review the Requirement text and Framework tag, toggle the Applicable checkbox, and record a Justification, e.g., Risk Identified, Regulatory Requirement, Management Decision or etc., from the dropdown.
4. Click Save Changes after updating applicability or justifications.

## 5. Status & Quality Reference

### Risk Level Badges

| Level | Meaning |
|---|---|
| Low | Minimal likelihood/impact combination — monitor only. |
| Medium | Moderate risk — treatment recommended within a reasonable timeframe. |
| High | Significant risk — prioritize treatment planning. |
| Critical | Severe risk — requires immediate attention and treatment. |

### Risk Status

| Status | Meaning |
|---|---|
| Open | The risk has been identified but treatment is not yet complete. |
| Closed | Treatment has been completed and the risk is resolved or accepted at its residual level. |

## 6. Tips, Best Practices

1. Start from Sample Risks when adopting a new framework to save time, then refine descriptions and scores to match your environment.
2. Complete the Threat and Vulnerabilities fields before writing a manual Risk Description — CalVant can auto-fill much of the text for you.
3. Review the Monthly Risk Trends chart periodically to spot spikes in newly identified risks.
4. Set realistic Number of Days values in Task Scheduling so target completion dates stay meaningful and deadlines aren't missed.
5. Revisit the SoA whenever you onboard a new compliance framework or change your control environment.

> **Tip:** Keep justifications specific and consistent — auditors will review the SoA closely during certification audits.
`;

// const cleanedContent = RISK_HELP_CONTENT.replace(
//   /<!-- Start of picture text -->[\s\S]*?<!-- End of picture text -->/g,
//   ""
// );



const RiskAssessment = () => {
  const router = useRouter();
  const chartsContainerRef = useRef(null);


  // ── Framework context ─────────────────────────────────────────────────────
  const { selectedFrameworks, isAllSelected, availableFrameworks } =
    useFramework();

  // Compute allowed risk types for active filter (null = ALL, no filter)
  const allowedRiskTypes = useMemo(() => {
    if (isAllSelected) return null;
    const allowed = new Set();
    selectedFrameworks.forEach((fwId) => {
      const fw = availableFrameworks?.find((f) => f.id === fwId);
      if (fw && fw.riskTypes) {
        fw.riskTypes.forEach((rt) => allowed.add(rt));
      }
    });
    // Fallback: if somehow no risk types matched, we allow nothing or everything?
    // If no risk types are defined for the framework, it might show 0 risks.
    // That's expected if we enforce riskTypes filtering.
    return allowed;
  }, [selectedFrameworks, isAllSelected, availableFrameworks]);

  const {
    user,
    mounted,
    isRoot,
    isRiskOwner,
    isPrivilegedRole,
    isViewingManagedOrg,
    effectiveOrgId,
  } = useEffectiveOrg();

  const userRoles = Array.isArray(user?.role) ? user.role : [user?.role || ""];

  const deptLabel =
    isPrivilegedRole || isViewingManagedOrg
      ? "All"
      : (user?.departments || []).map((d) => d.name).join(", ") || "Your";

  const [run, setRun] = useState(false);
  const [departmentName, setDepartmentName] = useState("Your");
  const [allRisks, setAllRisks] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showHelpDoc, setShowHelpDoc] = useState(false);

  // ── hasMounted: prevents Framer Motion from replaying initial animations on page refresh ──
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);
  // ── Framework-filtered view of risks ──────────────────────────────────────
  const filteredRisks = useMemo(() => {
    if (!allowedRiskTypes) return allRisks;
    return allRisks.filter((r) => riskMatchesFilter(r, allowedRiskTypes));
  }, [allRisks, allowedRiskTypes]);

  // ── Available years (from filteredRisks) ──────────────────────────────────
  const availableYears = useMemo(
    () => [
      ...new Set(
        filteredRisks
          .map((r) => {
            const date = r.createdAt || r.created_at;
            return date ? new Date(date).getFullYear() : null;
          })
          .filter(Boolean),
      ),
    ],
    [filteredRisks],
  );

  // ── Monthly risk data (from filteredRisks) ────────────────────────────────
  const monthlyRiskData = useMemo(() => {
    const months = [
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
    ].map((name) => ({ name, value: 0 }));
    filteredRisks.forEach((risk) => {
      const dateStr = risk.createdAt || risk.created_at;
      if (!dateStr) return;
      const date = new Date(dateStr);
      if (date.getFullYear() === selectedYear)
        months[date.getMonth()].value += 1;
    });
    return months;
  }, [filteredRisks, selectedYear]);

  // ── Stats computed from filteredRisks ────────────────────────────────────
  const riskStats = useMemo(() => {
    return filteredRisks.reduce(
      (acc, risk) => {
        acc.total++;
        let score = 0;
        if ((risk.status || "").toLowerCase() === "closed") {
          score = parseInt(risk.likelihoodAfterTreatment || 0) * parseInt(risk.impactAfterTreatment || 0);
        } else {
          const impact = Math.max(
            parseInt(risk.confidentiality) || 0,
            parseInt(risk.integrity) || 0,
            parseInt(risk.availability) || 0,
          );
          score = impact * (parseInt(risk.probability) || 0);
        }

        const level = score <= 3 ? "low" : score <= 8 ? "medium" : "high";
        acc[level]++;
        (risk.status || "").toLowerCase() === "closed"
          ? acc.closed++
          : acc.open++;
        return acc;
      },
      { total: 0, low: 0, medium: 0, high: 0, open: 0, closed: 0 },
    );
  }, [filteredRisks]);

  const steps = [
    {
      target: "#dashboard-header",
      content: `Welcome to your ${deptLabel} risk management dashboard.`,
    },
    { target: "#stats-grid", content: "Quick metrics overview at a glance." },
    {
      target: "#charts-container",
      content: "Visual risk distribution and trends analysis.",
    },
    {
      target: "#action-cards",
      content: "Quick access to all risk management tools.",
    },
  ];

  // ── ResizeObserver fix ────────────────────────────────────────────────────
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(
        () => window.dispatchEvent(new Event("resize")),
        150,
      );
    });
    if (chartsContainerRef.current)
      resizeObserver.observe(chartsContainerRef.current);
    return () => {
      if (chartsContainerRef.current)
        resizeObserver.unobserve(chartsContainerRef.current);
      clearTimeout(window.resizeTimeout);
    };
  }, []);

  const redirectTimerRef = useRef(null);

  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      // Don't redirect immediately — user may be null for one render cycle
      // while useEffectiveOrg re-derives from sessionStorage after login.
      // Only redirect if user is STILL null after 800ms.
      redirectTimerRef.current = setTimeout(() => {
        router.push("/");
      }, 800);
    } else {
      // User resolved — cancel any pending redirect
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    }

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [mounted, user, router]);

  // useEffect(() => {
  //   collapseSidebar();
  // }, [collapseSidebar]);

  // ── Load org/dept risks — root & privileged see all, risk owner sees all in org, others see own dept ──
  const loadRiskStats = useCallback(async () => {
    if (!user || !effectiveOrgId) return;

    // ── LOG: fires only when user is confirmed real ──
    captureActivity({ action: ACTIONS.VISITED, module: MODULES.RISK, url: "/risk-assessment" });

    try {
      const [risks, departmentsList] = await Promise.all([
        riskService.getAllRisks(),
        getDepartments().catch(() => []),
      ]);
      if (!Array.isArray(risks)) return;

      // Privileged roles (root, super_admin, etc.) and org managers see all.
      const seeAll = isRoot || isPrivilegedRole || isViewingManagedOrg;
      const userDepts = getUserDepartments(user);

      const departmentRisks = risks.filter((risk) => {
        if (!isSameOrg(risk.organization, effectiveOrgId)) {
          return false;
        }
        if (seeAll) return true;
        return matchesDepartment(risk.department, userDepts, departmentsList);
      });

      setAllRisks(departmentRisks);
      setDepartmentName(
        seeAll
          ? "All"
          : userDepts
            .map((d) => (typeof d === "string" ? d : d?.name))
            .filter(Boolean)
            .join(", ") || "Your",
      );
    } catch (error) {
      console.error("Error loading risk stats:", error);
    }
  }, [user, isRoot, isRiskOwner, isPrivilegedRole, isViewingManagedOrg, effectiveOrgId]);

  useEffect(() => {
    loadRiskStats();
  }, [loadRiskStats]);


  // ─────────────────────────────────────────────────────────────────────────

  if (!mounted || !user) return null;

  // ── Chart data (from filteredRisks / riskStats) ──────────────────────────
  const pieData = [
    {
      name: "Low Risk",
      value: riskStats.low,
      color: "#10b981",
      desc: `${riskStats.low} low impact risks`,
    },
    {
      name: "Medium Risk",
      value: riskStats.medium,
      color: "#f59e0b",
      desc: `${riskStats.medium} medium risks`,
    },
    {
      name: "High Risk",
      value: riskStats.high,
      color: "#ef4444",
      desc: `${riskStats.high} high priority risks`,
    },
  ].filter((d) => d.value > 0);

  const realQuarterlyData = filteredRisks.reduce((acc, risk) => {
    const dateStr = risk.createdAt || risk.created_at;
    if (!dateStr) return acc;
    const q = `Q${Math.floor(new Date(dateStr).getMonth() / 3) + 1}`;
    acc[q] = (acc[q] || 0) + 1;
    return acc;
  }, {});

  const barData = [
    {
      name: "Q1",
      value: realQuarterlyData.Q1 || 0,
      desc: "Jan-Mar: Risk assessments created",
    },
    {
      name: "Q2",
      value: realQuarterlyData.Q2 || 0,
      desc: "Apr-Jun: Risk assessments created",
    },
    {
      name: "Q3",
      value: realQuarterlyData.Q3 || 0,
      desc: "Jul-Sep: Risk assessments created",
    },
    {
      name: "Q4",
      value: realQuarterlyData.Q4 || 0,
      desc: "Oct-Dec: Risk assessments created",
    },
  ];

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg min-w-[200px]">
          <div className="font-semibold text-slate-800 text-sm mb-1">
            {data.name}
          </div>
          <div className="text-xl font-bold text-slate-900 mb-1">
            {data.value}
          </div>
          <div className="text-xs text-slate-600">{data.desc}</div>
          <div className="text-xs text-slate-500 mt-1">
            {((data.value / (riskStats.total || 1)) * 100).toFixed(1)}% of total
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
          <div className="font-semibold text-slate-800 text-sm mb-1">
            {data.name}
          </div>
          <div className="text-xl font-bold text-slate-900 mb-1">
            {data.value}
          </div>
          <div className="text-xs text-slate-600 mb-1">{data.desc}</div>
          <div className="text-xs text-slate-500">Total Risks</div>
        </div>
      );
    }
    return null;
  };

  const actionCards = [
    {
      id: "templates",
      icon: FolderOpen,
      title: "Templates",
      subtitle: "Sample Risks",
      path: "/risk-assessment/templates",
      color: "from-violet-400 to-violet-500",
    },
    {
      id: "add",
      icon: PlusCircle,
      title: "New Risks",
      subtitle: "Add Risk",
      path: "/risk-assessment/add",
      color: "from-emerald-400 to-emerald-500",
      primary: true,
    },
    {
      id: "tasks",
      icon: CheckCircle,
      title: "View Tasks",
      subtitle: "Assigned",
      path: "/risk-assessment/my-tasks",
      color: "from-amber-400 to-amber-500",
    },
    {
      id: "risks",
      icon: AlertTriangle,
      title: "View Risks",
      subtitle: "Departmental",
      path: "/risk-assessment/saved",
      color: "from-red-400 to-red-500",
      show: userRoles.some((r) =>
        [
          "risk_owner",
          "risk_manager",
          "risk_identifier",
          "super_admin",
          "root",
        ].includes(r),
      ),
    },
    {
      id: "soa",
      icon: FileText,
      title: "Statement of Applicability",
      subtitle: "SoA",
      path: "/risk-assessment/soa",
      color: "from-sky-400 to-sky-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 flex flex-col overflow-hidden">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 lg:py-6 pb-20 lg:pb-26 overflow-hidden">
        <Joyride
          steps={steps.map(s => ({ ...s, disableBeacon: true }))}
          run={run}
          continuous
          showSkipButton
          scrollToFirstStep
          scrollOffset={200}
          tooltipComponent={CustomTooltip}
          styles={{
            options: {
              primaryColor: "#3b82f6",
              width: 300,
              overlayColor: "rgba(0, 0, 0, 0.5)",
            },
            spotlight: {
              borderRadius: "12px",
              boxShadow: "0 0 0 3px #ffffff, 0 0 0 6px #3b82f6, 0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }
          }}
        />

        {/* ── Professional Header ── */}
        <motion.header
          id="dashboard-header"
          className="bg-white/80 backdrop-blur-md border border-slate-100/50 rounded-xl shadow-md mb-2 lg:mb-2 p-4 lg:p-5 !text-left"
          style={{
            textAlign: "left",
            width: "100%",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
          initial={hasMounted ? { opacity: 0, y: -15 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between w-full">
            <div
              className="flex items-center gap-4 flex-1"
              style={{
                justifyContent: "flex-start",
                textAlign: "left",
                alignItems: "flex-start",
              }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0" style={{ textAlign: "left" }}>
                {/* Title row – framework badges sit inline */}
                <div
                  className="flex items-center justify-start gap-2 flex-wrap"
                  style={{ justifyContent: "flex-start" }}
                >
                  <h1 className="text-xl font-semibold text-slate-800">
                    Risks Dashboard
                  </h1>

                  {/* Framework filter pills – only shown when a specific filter is active */}
                  {!isAllSelected &&
                    selectedFrameworks.map((fwId) => {
                      const fwObj = availableFrameworks?.find((f) => f.id === fwId);
                      const bg = fwObj?.color ? fwObj.color + "15" : "#f1f5f9";
                      const color = fwObj?.color || "#334155";
                      const border = fwObj?.color ? fwObj.color + "40" : "#cbd5e1";
                      return (
                        <span
                          key={fwId}
                          title={`Showing risks filtered by ${fwId}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: bg,
                            color: color,
                            border: `1px solid ${border}`,
                            fontSize: 11,
                            fontWeight: 700,
                            boxShadow: `0 0 0 2px ${border}33`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: color || "#94a3b8",
                              flexShrink: 0,
                            }}
                          />
                          {fwId}
                        </span>
                      );
                    })}
                </div>

                {/* Department + total row */}
                <p className="text-sm text-slate-600">
                  {departmentName} •{" "}
                  <span className="font-bold text-slate-900">
                    {riskStats.total}
                  </span>{" "}
                  total risks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-full ${isRoot ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}
              >
                {isRoot
                  ? "Root"
                  : userRoles[0]
                    ? userRoles[0].replace("_", " ")
                    : "User"}
              </span>
              <span className="text-sm font-semibold text-slate-600">
                {user?.name || "User"}
              </span>
              <motion.button
                onClick={() => {
                  captureActivity({ action: ACTIONS.CLICK, module: MODULES.RISK, item: "Refresh Dashboard", url: "/risk-assessment" });
                  loadRiskStats();
                }}
                title="Refresh"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={15} className="text-slate-500" />
              </motion.button>
              <motion.button
                onClick={() => {
                  captureActivity({ action: ACTIONS.CLICK, module: MODULES.RISK, item: "Open Help Doc", url: "/risk-assessment" });
                  setShowHelpDoc(true);
                }}
                title="Help Documentation"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen size={15} className="text-slate-500" />
              </motion.button>
              <motion.button
                className="px-4 py-2 bg-white text-blue-500 border border-blue-200 hover:bg-blue-50 rounded-full shadow-[0_2px_10px_rgba(59,130,246,0.15)] transition-all duration-200 flex items-center gap-2 text-sm font-bold"
                onClick={() => {
                  captureActivity({ action: ACTIONS.CLICK, module: MODULES.RISK, item: "Open Guide", url: "/risk-assessment" });
                  setRun(false);
                  setTimeout(() => setRun(true), 100);
                }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span>Tutorial</span>
              </motion.button>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 w-full min-w-0">
          {/* Left: Stats + Actions */}
          <div className="space-y-8 lg:space-y-10 w-full min-w-0">
            {/* Stats Grid */}
            <motion.section
              id="stats-grid"
              className="grid grid-cols-2 md:grid-cols-3 gap-4 items-stretch"
              initial={hasMounted ? { opacity: 0, y: 15 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {[
                { Icon: BarChart3, value: riskStats.total, label: "Total", color: "from-blue-400 to-blue-500" },
                { Icon: AlertTriangle, value: riskStats.high, label: "High", color: "from-red-400 to-red-500" },
                { Icon: XCircle, value: riskStats.medium, label: "Medium", color: "from-orange-400 to-orange-500" },
                { Icon: CheckCircle2, value: riskStats.low, label: "Low", color: "from-emerald-400 to-emerald-500" },
                { Icon: Circle, value: riskStats.open, label: "Open", color: "from-sky-400 to-sky-500" },
                { Icon: CheckCircle, value: riskStats.closed, label: "Closed", color: "from-purple-400 to-purple-500" },
              ].map(({ Icon, value, label, color }, i) => (
                <motion.div
                  key={label}
                  className="group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center gap-3 h-full min-h-[84px] hover:bg-white"
                  onClick={() => {
                    // ── LOG: stat card click ──────────────────────────────
                    captureActivity({ action: ACTIONS.CLICK, module: MODULES.RISK, item: `Stat Card - ${label}`, url: "/risk-assessment" });
                    router.push(`/risk-assessment/saved?filter=${encodeURIComponent(label)}`);
                  }}
                  initial={hasMounted ? { opacity: 0, y: 20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-md flex-shrink-0`}
                  >
                    <Icon
                      size={16}
                      className="lg:size-18 text-white drop-shadow-sm"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-lg lg:text-xl font-semibold text-slate-800 block leading-tight group-hover:text-slate-900">
                      {value}
                    </span>
                    <span className="text-[11px] lg:text-xs font-semibold text-slate-600 uppercase tracking-wide leading-snug block pb-0.5">
                      {label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.section>

            {/* Quick Actions */}
            <motion.section
              id="action-cards"
              className="space-y-1"
              initial={hasMounted ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-6 px-1">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-15">
                <AnimatePresence>
                  {actionCards.map(
                    (
                      {
                        id,
                        icon: Icon,
                        title,
                        subtitle,
                        path,
                        color,
                        primary,
                        show = true,
                      },
                      index,
                    ) =>
                      show && (
                        <motion.div
                          key={id}
                          className={`group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-xl p-4 h-full flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-white transition-all duration-300 cursor-pointer ${primary ? "ring-2 ring-emerald-200/50 bg-gradient-to-br " + color : ""}`}
                          initial={hasMounted ? { opacity: 0, scale: 0.9 } : false}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4, delay: 0.4 + index * 0.06 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            // ── LOG: action card click ────────────────────
                            captureActivity({ action: ACTIONS.CLICK, module: MODULES.RISK, item: `Action Card - ${title}`, url: "/risk-assessment" });
                            router.push(path);
                          }}
                        >
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-md flex-shrink-0 ${primary ? "bg-white/20 backdrop-blur-sm" : `bg-gradient-to-br ${color}`}`}
                          >
                            <Icon
                              size={20}
                              className="text-white drop-shadow-sm"
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <h4 className="text-sm lg:text-base font-semibold text-center text-slate-800 leading-tight mb-1 px-1 truncate group-hover:text-blue-600 transition-colors duration-200">
                              {title}
                            </h4>
                            <p className="text-xs font-bold text-center text-slate-600 px-1 truncate">
                              {subtitle}
                            </p>
                          </div>
                        </motion.div>
                      ),
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>

          {/* Right: Charts */}
          <div
            ref={chartsContainerRef}
            id="charts-container"
            className="space-y-4 lg:space-y-3 w-full min-w-0"
          >
            {/* Pie chart */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl p-6 lg:p-7 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-400 h-80 flex flex-col w-full min-w-0"
              initial={hasMounted ? { opacity: 0, scale: 0.95 } : false}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="mb-1 px-1 flex-shrink-0">
                <h3 className="text-base lg:text-lg font-semibold text-slate-800">
                  Risk Distribution
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  All active risk levels
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0 w-full min-w-0">
                {riskStats.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" debounce={50}>
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
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
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
                        {riskStats.total}
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <BarChart3
                      size={40}
                      className="text-slate-400 mb-4"
                      strokeWidth={1.5}
                    />
                    <p className="text-lg font-semibold text-slate-500 mb-2">
                      No Data
                    </p>
                    <p className="text-sm text-slate-500 max-w-xs">
                      {!isAllSelected
                        ? `No risks found for ${selectedFrameworks.join(" + ")}`
                        : "Start by adding risk assessments"}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Bar chart */}
            <motion.div
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid #f1f5f9",
                borderRadius: "16px",
                padding: "24px",
                height: "288px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                transition: "all 0.4s ease",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                minWidth: 0,
              }}
              whileHover={{ scale: 1.01 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#1e293b",
                      marginBottom: "4px",
                    }}
                  >
                    Monthly Risk Trends
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    Number of risks created each month
                  </p>
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{
                    fontSize: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    background: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                  }}
                >
                  {availableYears.length > 0 ? (
                    availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))
                  ) : (
                    <option value={selectedYear}>{selectedYear}</option>
                  )}
                </select>
              </div>

              <div style={{ width: "100%", height: "100%", minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <BarChart
                    data={monthlyRiskData}
                    margin={{ top: 15, right: 15, left: -5, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke="#f1f5f9"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar
                      dataKey="value"
                      fill="url(#riskGradient)"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Help Documentation Modal */}
      <AnimatePresence>
        {showHelpDoc && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelpDoc(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-500" />
                  <h3 className="text-base font-semibold text-slate-800">
                    Risk Module Help
                  </h3>
                </div>
                <button
                  onClick={() => setShowHelpDoc(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X size={16} className="text-slate-500" />
                </button>
              </div>

              {/* Rendered markdown */}
              <div className="overflow-y-auto px-6 py-5 prose-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-xl font-bold text-slate-900 mb-2 mt-4" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-base font-semibold text-slate-800 mt-5 mb-2" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-sm font-semibold text-slate-800 mt-4 mb-1.5" {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4 className="text-sm font-semibold text-slate-700 mt-3 mb-1" {...props} />
                    ),
                    h6: ({ node, ...props }) => (
                      <h6 className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-3 mb-1" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-semibold text-slate-800" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="text-sm text-slate-600 mb-3 leading-relaxed" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-inside space-y-1.5 mb-3" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="text-sm text-slate-700" {...props} />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full text-sm border border-slate-200 rounded-lg" {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="bg-slate-50" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="text-left font-semibold text-slate-700 px-3 py-2 border-b border-slate-200" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="px-3 py-2 border-b border-slate-100 text-slate-600 align-top" {...props} />
                    ),
                    a: ({ node, ...props }) => (

                      <a className="text-blue-600 hover:text-blue-700 hover:underline font-medium cursor-pointer"
                        {...props}
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      />
                    ),
                    hr: () => <hr className="my-4 border-slate-100" />,
                    em: ({ node, ...props }) => (
                      <em className="text-xs text-slate-400 not-italic" {...props} />
                    ),
                  }}
                >
                  {RISK_HELP_CONTENT}
                </ReactMarkdown>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-slate-100/50 shadow-lg px-6 py-4 lg:px-8 lg:py-5 sticky bottom-0 z-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm lg:text-base text-slate-600 font-medium">
            © {new Date().getFullYear()} CalVant. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RiskAssessment;