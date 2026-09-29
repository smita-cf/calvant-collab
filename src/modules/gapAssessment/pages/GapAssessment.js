import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ClipboardList,
  BarChart3,
  Users,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  BookOpen
} from "lucide-react";
import Joyride, { STATUS } from "react-joyride";
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

import {
  PlanAuditModal,
  ManageAuditsModal,
  AuditReportsModal,
  ConductAuditModal,
  ReviewFindingsModal,
} from "../components/modals";
import { CustomPieTooltip, CustomBarTooltip } from "../components/charts";
import { getSessionUser } from "../utils/helpers";
import auditService from "../services/auditService";
import { useFramework } from "../../../context/FrameworkContex";
import CompactFrameworkFilter from "../../documentation/pages/CompactFrameworkFilter";
// FIX: ACTIONS.PAGE_LOAD and ACTIONS.SELECT no longer exist in the finalized
// taxonomy (activities.js exports VISITED/CLICK/CREATED/MODIFIED/UPDATED/
// LOGGED_IN/LOGOUT/DELETE/UPLOAD/DOWNLOAD only). Referencing a removed
// constant resolves to `undefined` at runtime. Also importing MODULES —
// every captureActivity call on this page was missing a module, which
// defaults to MODULES.SYSTEM in buildPayload(), and the capture-time
// human-only filter in activities.js now silently drops anything tagged
// SYSTEM. This page is the Audit module, so all call sites below are
// tagged MODULES.AUDIT.
import { captureActivity, ACTIONS, MODULES } from "../../admin/shell/services/activities";
import HelpDocModal from "@/components/shared/HelpDocModal";

// ─────────────────────────────────────────────────────────────────────────────
// Normalize a raw framework code string for comparison
// "ISO 27001" → "ISO27001", "iso_27001" → "ISO27001", "SOC 2" → "SOC2"
// ─────────────────────────────────────────────────────────────────────────────
function normalizeFw(raw) {
  return (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// Returns true if the audit's frameworkCode matches any of the pre-normalized selected codes
function auditMatchesFrameworks(audit, normalizedSelectedFW) {
  if (!audit) return false;
  const raw = audit.frameworkCode || audit.framework;
  if (!raw) return false;
  const rawValues = Array.isArray(raw) ? raw : [raw];
  const auditCodes = rawValues.map(normalizeFw).filter(Boolean);
  return normalizedSelectedFW.some((fw) =>
    auditCodes.some((code) => code === fw),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Month labels
// ─────────────────────────────────────────────────────────────────────────────
const MONTHS = [
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
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function AuditDashboard() {
  const router = useRouter();
  const sessionUser = getSessionUser();
  const chartsContainerRef = useRef(null);
  const searchParams = useSearchParams();
  const openAuditId = searchParams.get("openAuditId");

  // ── Role detection ────────────────────────────────────────────────────────
  const userRoles = Array.isArray(sessionUser.role)
    ? sessionUser.role
    : [sessionUser.role || ""];
  const isRoot = userRoles.some((r) => {
    const s = (typeof r === "string" ? r : r?.name || r?.roleName || "")
      .toLowerCase()
      .replace(/[\s_-]/g, "");
    return ["root", "ciso", "aio", "dpo"].some((role) => s.includes(role));
  });

  // ── Local state ───────────────────────────────────────────────────────────
  const [modal, setModal] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);
  const [auditors, setAuditors] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [allAudits, setAllAudits] = useState([]);
  const [run, setRun] = useState(false);

  const [showHelpDoc, setShowHelpDoc] = useState(false);

  const AUDIT_HELP_CONTENT = `
## Introduction

The Audit Module in CalVant helps you plan, schedule, conduct, and report on internal and external audits across your compliance program. It maps every audit to the controls in frameworks such as ISO 27001, ISO 27701, SOC 2, ISO 42001, and PDPL, and gives admins and auditors separate, role-based views of the same audit lifecycle — from planning through findings and reporting.

## 2. Accessing the Audit Module

1. Click the Audit icon in the sidebar to land on your Audit Dashboard. Your logged-in user name and role appear in the top-right of the dashboard header.
2. The dashboard and Quick Actions differ by role: Admin users see the full Audit Management dashboard (Section 4.1); Auditors see a scoped Auditor Dashboard limited to their assigned controls (Section 4.5).

## 3. Key Terminology

A short list of terms that are specific to CalVant's policy workflow rather than self-explanatory from the screen itself:

| Term | Definition |
|---|---|
| Phase Ratio Control | A slider that splits the working days between the Opening and Closure Meeting Dates into Stage 1 (Documentation), Stage 2 (Practice), and Reporting, and auto-calculates each phase's dates. |
| CAP (Corrective Action Plan) | The remediation plan created for a non-compliant finding during Review Findings. |

## 4. Manual Navigation

### 4.1 Audit Dashboard

The Audit Dashboard is the home base for the module. It gives an at-a-glance summary of every audit in the organization, along with quick actions to plan, manage, and report on audits.

![Audit Dashboard overview](/Screenshots/Audit/audit-home.png)

1. **Summary tiles** — Total, Planned, In Progress, Completed, and Findings counts.
2. **Audit Status** — a donut chart of audits by status; shows "No Audits Yet" until an audit is planned.
3. **Audit Trends** — a bar chart of audits created each month, filterable by year; shows "No Trend Data" until an audit has a date field.

The Quick Actions panel gives one-click access to the most common tasks:

| Field | Description |
|---|---|
| Plan Audit | Launches the guided wizard to schedule and assign controls for a new audit (Section 4.2). |
| Manage Audits | Opens the list of existing audits to view or edit (Section 4.3). |
| Audit Reports | Opens completed and in-progress audits to review findings and scores (Section 4.4). |

### 4.2 Planning an Audit

CalVant uses a guided, two-step wizard to plan a new audit: Audit Details, then Assign Controls. Use Next and Back to move between steps, or Create Audit once both steps are complete.

1. From the Audit Dashboard, click Plan Audit under Quick Actions.
2. Complete Step 1: Audit Details to define the audit's type, framework, personnel, and schedule.
3. Complete Step 2: Assign Controls to allocate auditors to every control in scope.
4. Click Create Audit to save the audit and add it to Manage Audits.

#### 4.2.1 Step 1 — Audit Details

This step captures the audit's type, personnel, and schedule.

![Audit Plan overview](/Screenshots/Audit/audit-plan.png)

| Field | Description |
|---|---|
| Audit Type | Internal, External, Certification, or Surveillance. |
| Framework | The compliance framework being audited, e.g., ISO 27001. |
| Lead Auditor | The auditor leading the engagement. |
| Point of Contact | The auditee-side contact for the audit. |
| Opening / Closure Meeting Date | The anchor dates that bound the entire audit engagement. |

![Audit Plan overview](/Screenshots/Audit/audit-plan2.png)

Once Opening and Closure Meeting Dates are set, the Phase Ratio Control slider becomes active and auto-calculates the phase dates below it.

![Audit Plan Dates overview](/Screenshots/Audit/audit-dates.png)

1. Drag the slider to set the working-day ratio between Stage 1 and Stage 2 + Reporting; the ratio and day counts update above the bar.
2. Phase Dates for Stage 1 (i.e., Documentation Audit), Stage 2 (i.e., Practice Audit), and Audit Reporting auto-fill from the ratio and anchor dates.
3. Edit any phase date manually — the ratio bar and later phases update instantly to stay in sync.
4. Day counts are working days only (Monday–Friday); both the start and end day are counted.
5. Click Next: Assign Controls to continue to Step 2.

#### 4.2.2 Step 2 — Assign Controls

This step allocates auditors to every control in scope, organized by control section.

![Audit Plan Dates overview](/Screenshots/Audit/control-assign.png)

1. Each control section (e.g., for ISMS Core, they are Organizational Controls, People Controls, Physical Controls, Technological Controls) lists its total control count and how many are currently assigned.
2. Use Assign whole section to bulk-assign one auditor to every control in that section, or expand a section to assign auditors control by control.
3. Auditors must be outside the control's department, as per the independence rule shown at the top of the screen.
4. Click Create Audit once all sections are assigned to save the audit and add it to Manage Audits.

### 4.3 Managing Audits

Manage Audits is the working register of every audit in the organization, accessible from Manage Audits on the dashboard.

![Audit Manage overview](/Screenshots/Audit/audit-manage.png)

1. **Header stats** — Total audits, plus counts for the active framework, e.g., ISO 27001, KSA PDPL, etc.
2. **Framework filter chips** — switch between All and a specific framework.
3. **Status filter chips** — All, Planned, In Progress, Completed.
4. **Search bar** — find an audit by type, status, or point of contact.

When no audits match the current filters, the screen shows a "No audits found" empty state.

### 4.4 Audit Reports

Audit Reports lists every audit with its compliance score and links to full details, accessible from Audit Reports on the dashboard.

![Audit Reports overview](/Screenshots/Audit/audit-reports.png)

1. Each card shows the audit's Status, Type, and Framework tags, its title, and its POC, Lead Auditor, and date range.
2. The progress bar shows the audit's compliance score, labeled Compliant or Non-Compliant with a percentage.
3. Click View Details to open the full findings for that audit.

### 4.5 Auditor Dashboard (Auditor View)

Auditors land on a scoped Auditor Dashboard that shows only the audits and controls assigned to them.

![Auditor Dashboard overview](/Screenshots/Audit/auditor-dashboard.png)

1. The Controls Assigned panel names the logged-in auditor and directs them to Conduct Audit to view and score their assigned controls.
2. **Audit Status** — a donut chart showing the total number of audits the auditor is part of.
3. **Audit Trends** — a bar chart of audits created each month, filterable by year.

The Quick Actions panel gives one-click access to the auditor's tasks:

| Field | Description |
|---|---|
| Conduct Audit | Opens assigned controls for scoring (Section 4.7). |
| Review Findings | Opens completed control assessments to view findings and create a CAP (Section 4.6). |

### 4.6 Reviewing Findings

Review Findings lists the audits with controls assigned to the auditor, accessible from Review Findings on the Auditor Dashboard.

![Audit Findings overview](/Screenshots/Audit/audit-findings.png)

1. The Filter banner shows the active framework and how many audits match it.
2. Each card shows the audit's Status and Framework tags, its title, and the number of controls assigned to the auditor.
3. Click a card to open its findings and create a CAP for any non-compliant control.

### 4.7 Conducting an Audit

Conduct Audit is where auditors submit scores for their assigned controls, accessible from Conduct Audit on the Auditor Dashboard.

![Audit Findings overview](/Screenshots/Audit/conduct-audit.png)

1. Each card shows the audit's Status and Framework tags, the auditor's role badge, and the due date.
2. The Overall progress bar tracks all controls in the audit; My Controls tracks only the controls assigned to the logged-in auditor.
3. Click Team Progress to expand and view how other auditors on the engagement are progressing.
4. Click the card to open Conduct Audit and begin submitting scores.

## 5. Status & Quality Reference

### Audit Status (Dashboard Tiles)

| Status | Meaning |
|---|---|
| Total | All audits currently tracked in the Audit Dashboard. |
| Planned | Audits created but not yet started. |
| In Progress | Audits with at least one control assessment underway. |
| Completed | Audits where all assigned controls have been scored and reported. |
| Findings | The count of non-compliant controls identified across all audits. |

### Audit Status (Card / Report)

| Status | Meaning |
|---|---|
| Planned | The audit has been created and controls assigned, but work has not begun. |
| In Progress | Auditors are actively scoring assigned controls. |
| Completed | All controls have been scored and the audit is closed. |

The Compliant / Non-Compliant label on an audit card reflects the percentage of assessed controls that passed, shown alongside the progress bar in Audit Reports.

## 6. Tips, Best Practices

1. Set Opening and Closure Meeting Dates before adjusting Phase Ratio Control, so phase dates auto-calculate correctly.
2. Use Assign whole section for standard frameworks, then fine-tune individual control assignments only where independence rules require a different auditor.
3. Review the Audit Status donut and Findings tile regularly to spot audits falling behind schedule.
4. Track My Controls against Overall progress in Conduct Audit, so individual auditor workloads stay visible against the full audit.
5. Create a CAP as soon as a finding is marked non-compliant in Review Findings, so remediation isn't delayed until the closure meeting.
`;

  const steps = [
    {
      target: "#dashboard-header",
      content: "Welcome to your Gap Assessment dashboard.",
    },
    {
      target: "#stats-grid",
      content: "Quick metrics overview of planned, in-progress, and completed audits.",
    },
    {
      target: "#action-cards",
      content: "Plan audits, manage assessments, and view comprehensive reports.",
    },
    {
      target: "#charts-container",
      content: "Visualize audit status distribution and monthly trends.",
    },
  ];

  // ── Framework context — fully dynamic ─────────────────────────────────────
  const {
    selectedFrameworks,
    toggleFramework,
    isAllSelected,
    availableFrameworks,
  } = useFramework();

  const fwKey = selectedFrameworks.join(",");

  // Pre-normalized selected framework codes for audit matching
  const normalizedSelectedFW = useMemo(() => {
    if (isAllSelected)
      return availableFrameworks.map((fw) => normalizeFw(fw.code));
    return selectedFrameworks.map((label) => {
      const fw = availableFrameworks.find((f) => f.id === label);
      return fw ? normalizeFw(fw.code) : normalizeFw(label);
    });
  }, [fwKey, isAllSelected, availableFrameworks]);

  const filteredAudits = useMemo(() => {
    if (isAllSelected) return allAudits;
    if (allAudits.length === 0) return [];
    return allAudits.filter((a) =>
      auditMatchesFrameworks(a, normalizedSelectedFW),
    );
  }, [allAudits, isAllSelected, normalizedSelectedFW]);

  // ── Stats derived from filteredAudits ─────────────────────────────────────
  const filteredStats = useMemo(() => {
    const totalFindings = filteredAudits.reduce(
      (sum, a) => sum + (Array.isArray(a.findings) ? a.findings.length : 0),
      0,
    );
    return {
      total: filteredAudits.length,
      planned: filteredAudits.filter((a) => a.status === "PLANNED").length,
      inProgress: filteredAudits.filter((a) => a.status === "IN_PROGRESS")
        .length,
      completed: filteredAudits.filter((a) => a.status === "COMPLETED").length,
      findings: totalFindings,
    };
  }, [filteredAudits]);

  // ── Year selector ─────────────────────────────────────────────────────────
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const availableYears = useMemo(
    () => [
      ...new Set(
        filteredAudits
          .map((a) => {
            const d = a.createdAt || a.startDate;
            return d ? new Date(d).getFullYear() : null;
          })
          .filter(Boolean),
      ),
    ],
    [filteredAudits],
  );

  // ── Monthly bar data ──────────────────────────────────────────────────────
  const barData = useMemo(() => {
    const counts = new Array(12).fill(0);
    filteredAudits.forEach((audit) => {
      const dateField = audit.openingMeetingDate;
      if (!dateField) return;
      const d = new Date(dateField);
      if (isNaN(d.getTime())) return;
      if (d.getFullYear() !== selectedYear) return;
      counts[d.getMonth()] += 1;
    });
    return MONTHS.map((name, i) => ({ name, value: counts[i] }));
  }, [filteredAudits, selectedYear]);

  // ── Pie data ──────────────────────────────────────────────────────────────
  const pieData = useMemo(
    () =>
      [
        { name: "Planned", value: filteredStats.planned, color: "#f59e0b" },
        {
          name: "In Progress",
          value: filteredStats.inProgress,
          color: "#6366f1",
        },
        { name: "Completed", value: filteredStats.completed, color: "#10b981" },
      ].filter((d) => d.value > 0),
    [filteredStats],
  );

  // ── ResizeObserver ────────────────────────────────────────────────────────
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(
        () => window.dispatchEvent(new Event("resize")),
        150,
      );
    });
    if (chartsContainerRef.current) ro.observe(chartsContainerRef.current);
    return () => {
      if (chartsContainerRef.current) ro.unobserve(chartsContainerRef.current);
      clearTimeout(window.resizeTimeout);
    };
  }, []);

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadData = useCallback(() => {
    setLoadingStats(true);
    auditService
      .getAllUsers()
      .then((users) => {
        const filtered = (users || []).filter((u) => {
          const roles = Array.isArray(u.role) ? u.role : [u.role || ""];
          const hasAuditorRole = roles.some((r) => {
            const roleString = (
              typeof r === "string" ? r : r?.name || r?.roleName || ""
            ).toLowerCase();
            return roleString === "auditor";
          });
          return hasAuditorRole || u.isAuditor;
        });
        setAuditors(filtered);
      })
      .catch(() => { });

    auditService
      .getAudits()
      .then((data) => {
        setAllAudits(data || []);
        setLoadingStats(false);
      })
      .catch(() => setLoadingStats(false));
  }, []);

  // ── Auto-open Review Findings modal when arriving from Task Management's
  // "trace to source" link (?openAuditId=...). Runs once per navigation;
  // ReviewFindingsModal itself handles selecting the right audit and jumping
  // into the CAP view once its own audits list has loaded.
  useEffect(() => {
    if (openAuditId) {
      captureActivity({
        action: ACTIONS.CLICK,
        module: MODULES.AUDIT,
        item: "Gap Assessment · Auto-opened Review Findings from Task Management",
        url: "/gap-assessment",
      });
      setModal("findings");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAuditId]);

  useEffect(() => {
    // FIX: ACTIONS.PAGE_LOAD -> ACTIONS.VISITED (canonical taxonomy).
    // Added module: MODULES.AUDIT — without it this event defaulted to
    // MODULES.SYSTEM and is now silently dropped by the capture-time
    // human-module allowlist in activities.js.
    captureActivity({
      action: ACTIONS.VISITED,
      module: MODULES.AUDIT,
      item: "Gap Assessment Dashboard",
      url: "/gap-assessment",
    });
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (fwKey) {
      // FIX: ACTIONS.SELECT -> ACTIONS.CLICK (canonical taxonomy — SELECT
      // was retired). Added module: MODULES.AUDIT for the same reason as above.
      captureActivity({
        action: ACTIONS.CLICK,
        module: MODULES.AUDIT,
        item:
          "Gap Assessment Filter · Selected: " +
          (isAllSelected ? "All Frameworks" : selectedFrameworks.join(", ")),
        url: "/gap-assessment",
      });
    }
  }, [fwKey, isAllSelected, selectedFrameworks]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const rootActions = [
    {
      key: "plan",
      Icon: ClipboardList,
      title: "Plan Audit",
      subtitle: "Schedule & assign controls",
      color: "from-blue-400 to-blue-600",
    },
    {
      key: "manage",
      Icon: Layers,
      title: "Manage Audits",
      subtitle: "View & edit existing audits",
      color: "from-violet-400 to-violet-600",
    },
    {
      key: "reports",
      Icon: BarChart3,
      title: "Audit Reports",
      subtitle: "View findings & scores",
      color: "from-emerald-400 to-emerald-600",
    },
  ];
  const auditorActions = [
    {
      key: "conduct",
      Icon: ClipboardList,
      title: "Conduct Audit",
      subtitle: "Submit scores for assigned controls",
      color: "from-blue-400 to-blue-600",
    },
    {
      key: "findings",
      Icon: AlertCircle,
      title: "Review Findings",
      subtitle: "View findings & create CAP",
      color: "from-rose-400 to-rose-600",
    },
  ];
  const actions = isRoot ? rootActions : auditorActions;

  const statCards = [
    {
      label: "Total",
      value: filteredStats.total,
      Icon: FileText,
      color: "from-blue-400 to-blue-500",
    },
    {
      label: "Planned",
      value: filteredStats.planned,
      Icon: Clock,
      color: "from-amber-400 to-amber-500",
    },
    {
      label: "In Progress",
      value: filteredStats.inProgress,
      Icon: RefreshCw,
      color: "from-violet-400 to-violet-500",
    },
    {
      label: "Completed",
      value: filteredStats.completed,
      Icon: CheckCircle2,
      color: "from-emerald-400 to-emerald-500",
    },
    {
      label: "Findings",
      value: filteredStats.findings,
      Icon: AlertCircle,
      color: "from-rose-400 to-rose-500",
    },
  ];

  // Derive active framework labels for header badges — from context, no hardcoded map
  const activeFwBadges = useMemo(() => {
    if (isAllSelected) return [];
    return selectedFrameworks
      .map((label) => {
        const fw = availableFrameworks.find((f) => f.id === label);
        return fw ? { label: fw.label, color: fw.color } : null;
      })
      .filter(Boolean);
  }, [selectedFrameworks, isAllSelected, availableFrameworks]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 flex flex-col overflow-hidden"
      style={{ fontFamily: "'Segoe UI',system-ui,sans-serif" }}
    >
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
        {/* HEADER */}
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
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-slate-800">
                    Audit Management
                  </h1>
                  {activeFwBadges.map((fw) => (
                    <span
                      key={fw.label}
                      title={`Showing audits filtered by ${fw.label}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: fw.color + "18",
                        color: fw.color,
                        border: `1px solid ${fw.color}55`,
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: fw.color,
                          flexShrink: 0,
                        }}
                      />
                      {fw.label}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-600">
                  {isRoot ? "Root Dashboard" : "Auditor Dashboard"} •{" "}
                  <span className="font-bold text-slate-900">
                    {filteredStats.total}
                  </span>{" "}
                  {isAllSelected ? "total audits" : "filtered audits"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-full ${isRoot ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}
              >
                {isRoot ? "Root" : "Auditor"}
              </span>
              <span className="text-sm font-semibold text-slate-600">
                {sessionUser.name || "User"}
              </span>
              <motion.button
                onClick={loadData}
                title="Refresh"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={15} className="text-slate-500" />
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 h-full">
          {/* LEFT COLUMN */}
          <div className="space-y-8 lg:space-y-10">
            {/* Stat Cards */}
            {isRoot && (
              <motion.section
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

            {/* Auditor summary */}
            {!isRoot && (
              <motion.div
                className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-xl p-5 shadow-sm"
                initial={hasMounted ? { opacity: 0, y: 15 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center shadow-md">
                    <Users size={18} className="text-white" />
                  </div>
                  <h3 className="text-sm text-slate-700 font-semibold">
                    Controls assigned to {sessionUser.name || "you"}
                  </h3>
                </div>
                <p className="text-sm text-slate-500">
                  Open "Conduct Audit" to view and score your assigned controls.
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
                className={`grid gap-3 h-15 ${isRoot ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-3"}`}
              >
                <AnimatePresence>
                  {actions.map((action, i) => {
                    const Icon = action.Icon;
                    return (
                      <motion.div
                        key={action.key}
                        className={`group bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-xl p-4 h-full flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-white transition-all duration-300 cursor-pointer`}
                        initial={hasMounted ? { opacity: 0, scale: 0.93 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          captureActivity({
                            action: ACTIONS.CLICK,
                            module: MODULES.AUDIT,
                            item:
                              "Gap Assessment · Opened modal: " + action.title,
                            url: "/gap-assessment",
                          });
                          setModal(action.key);
                        }}
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

          {/* RIGHT COLUMN: CHARTS */}
          <div id="charts-container" ref={chartsContainerRef} className="space-y-4 lg:space-y-3">
            {/* PIE CHART */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm border border-slate-100/50 rounded-2xl p-6 lg:p-7 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-400 h-80 flex flex-col"
              initial={hasMounted ? { opacity: 0, scale: 0.95 } : false}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="mb-1 px-1 flex-shrink-0">
                <h3 className="text-base lg:text-lg font-semibold text-slate-800">
                  Audit Status
                </h3>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0">
                {filteredStats.total > 0 ? (
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
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={
                          <CustomPieTooltip total={filteredStats.total} />
                        }
                      />
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
                        {filteredStats.total}
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
                      {isAllSelected ? "No Audits Yet" : "No Matching Audits"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {isAllSelected
                        ? "Plan your first audit to get started"
                        : `No audits found for ${selectedFrameworks.join(" + ")}`}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* BAR CHART */}
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
                      marginBottom: "2px",
                    }}
                  >
                    Audit Trends
                  </h3>
                  <p style={{ fontSize: "12px", color: "#475569" }}>
                    Audits created each month{" "}
                    <span
                      style={{
                        marginLeft: 4,
                        padding: "1px 8px",
                        borderRadius: 12,
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {barData.reduce((s, d) => s + d.value, 0)} total
                    </span>
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

              <div style={{ width: "100%", flex: 1, minHeight: 0 }}>
                {barData.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 15, right: 15, left: -5, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient
                          id="auditBarGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="95%"
                            stopColor="#a5b4fc"
                            stopOpacity={0.6}
                          />
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
                        tick={{
                          fontSize: 11,
                          fill: "#94a3b8",
                          fontWeight: 500,
                        }}
                      />
                      <YAxis hide />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar
                        dataKey="value"
                        fill="url(#auditBarGradient)"
                        radius={[5, 5, 0, 0]}
                        barSize={24}
                        animationDuration={800}
                      />
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
                      style={{ color: "#cbd5e1", marginBottom: 12 }}
                      strokeWidth={1.5}
                    />
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#94a3b8",
                        marginBottom: 4,
                      }}
                    >
                      No Trend Data
                    </p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>
                      {isAllSelected
                        ? "Audits need a date field (createdAt or startDate) for trends"
                        : `No audits found for ${selectedFrameworks.join(" + ")}`}
                    </p>
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
        title="Gap Assessment Help"
        content={AUDIT_HELP_CONTENT}
      />

      {/* FOOTER */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-slate-100/50 shadow-lg px-8 py-5 sticky bottom-0 z-50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} CalVant. All rights reserved.
          </p>
        </div>
      </footer>

      {/* MODALS */}
      {modal === "plan" && (
        <PlanAuditModal
          onClose={() => setModal(null)}
          onSaved={loadData}
          auditors={auditors}
        />
      )}
      {modal === "manage" && (
        <ManageAuditsModal
          onClose={() => setModal(null)}
          onSaved={loadData}
          auditors={auditors}
        />
      )}
      {modal === "reports" && (
        <AuditReportsModal onClose={() => setModal(null)} />
      )}
      {modal === "conduct" && (
        <ConductAuditModal onClose={() => setModal(null)} router={router} />
      )}
      {modal === "findings" && (
        <ReviewFindingsModal
          onClose={() => setModal(null)}
          auditors={auditors}
          initialAuditId={openAuditId}
        />
      )}
    </div>
  );
}

export default AuditDashboard;