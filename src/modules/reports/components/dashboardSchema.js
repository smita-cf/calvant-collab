/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DASHBOARD CONFIGURATION SCHEMA
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Hierarchy:
 *   DashboardConfig
 *     └── views[]
 *           └── panels[]
 *                 └── kpis[]
 *
 * Every entity has a unique `id`. The engine resolves `componentType` strings
 * against the KPI Registry to get the actual React component.
 *
 * Supported componentType values (see kpiRegistry.js):
 *   TrendLineChart | TrendAreaChart | TrendBarChart | DonutStatusChart |
 *   StatCard | DepartmentBreakdown | ScoreGauge | TableWidget
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────

/** @type {import('./types').DataSource} */
const API_BASE = "https://api.calvant.com/reports-service/api/reports";

// const API_BASE ="http://localhost:8085/api/reports"
function resultsEndpoint(org) {
  return `${API_BASE}/results?organization=${encodeURIComponent(org)}`;
}

// ─── MODULE DATA EXTRACTORS ──────────────────────────────────────────────────
// These are serialisable string keys resolved at runtime by the engine.
// Each key maps to a pure function in `dataExtractors.js`.
//
// Format:  "<module>.<field>"   or   "<module>.<field>.<subField>"

// ─── PREDEFINED TEMPLATE LIBRARY ─────────────────────────────────────────────

export const DASHBOARD_TEMPLATES = {

  // ── 1. RISK DASHBOARD ──────────────────────────────────────────────────────
  risks: {
      id: "risks",
      label: "Risk Dashboard",
      description: "Monitor risks identified, in mitigation, and by treatment type",
      icon: "AlertTriangle",
      accent: "#ef4444",
      gradient: "from-rose-500 to-red-600",
      dataModule: "risks",
      endpoint: resultsEndpoint,
      views: [
        {
          id: "risks-overview",
          label: "Overview",
          icon: "LayoutDashboard",
          layout: { columns: 3, rows: "auto", gap: 16 },
          panels: [
            {
              id: "risk-stat-identified",
              colSpan: 1, rowSpan: 1,
              kpis: [{
                id: "kpi-risk-identified",
                componentType: "StatCard",
                title: "Risks Identified",
                icon: "AlertTriangle",
                color: "rose",
                props: { extractor: "risks.risksIdentifiedCount", trend: true },
              }],
            },
            {
              id: "risk-stat-mitigation",
              colSpan: 1, rowSpan: 1,
              kpis: [{
                id: "kpi-risk-mitigation",
                componentType: "StatCard",
                title: "In Mitigation",
                icon: "AlertCircle",
                color: "orange",
                props: { extractor: "risks.risksInMitigationCount", trend: true },
              }],
            },
            {
              id: "risk-trend-panel",
              colSpan: 2, rowSpan: 2,
              kpis: [{
                id: "kpi-risk-trend",
                componentType: "TrendAreaChart",
                title: "Risks Identified & In Mitigation",
                props: {
                  series: [
                    { key: "identified", label: "Identified",  extractor: "risks.risksIdentifiedCount",   color: "#ef4444" },
                    { key: "mitigation", label: "In Mitigation", extractor: "risks.risksInMitigationCount", color: "#f97316" },
                  ],
                },
              }],
            },
            {
              id: "risk-donut-panel",
              colSpan: 1, rowSpan: 2,
              kpis: [{
                id: "kpi-risk-treatment",
                componentType: "DonutStatusChart",
                title: "By Treatment Type",
                props: { extractor: "risks.risksByTreatmentType" },
              }],
            },
          ],
        },
      ],
    },

  // ── 2. COMPLIANCE DASHBOARD ────────────────────────────────────────────────
  compliance: {
    id: "compliance",
    label: "Compliance Dashboard",
    description: "Track control applicability, implementation and framework readiness",
    icon: "ShieldCheck",
    accent: "#10b981",
    gradient: "from-emerald-500 to-teal-600",
    dataModule: "compliance",      // matches ComplianceDataProvider.getSourceName()
    endpoint: resultsEndpoint,
    views: [
      {
        id: "compliance-overview",
        label: "Overview",
        icon: "LayoutDashboard",
        layout: { columns: 3, rows: "auto", gap: 16 },
        panels: [
          {
            id: "compliance-stat-applicable",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-compliance-applicable",
              componentType: "StatCard",
              title: "Applicable Controls",
              icon: "ClipboardList",
              color: "emerald",
              props: { extractor: "compliance.applicableControls", trend: true },
            }],
          },
          {
            id: "compliance-stat-implemented",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-compliance-implemented",
              componentType: "StatCard",
              title: "Implemented",
              icon: "CheckCircle2",
              color: "blue",
              props: { extractor: "compliance.implementedControls", trend: true },
            }],
          },
          {
            id: "compliance-stat-percentage",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-compliance-percentage",
              componentType: "StatCard",
              title: "Compliance %",
              icon: "ShieldCheck",
              color: "teal",
              props: { extractor: "compliance.compliancePercentage", format: "percent", trend: true },
            }],
          },
          {
            id: "compliance-stat-auto",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-compliance-auto",
              componentType: "StatCard",
              title: "Auto-Compliant",
              icon: "Activity",
              color: "indigo",
              props: { extractor: "compliance.autoCompliantControls", trend: true },
            }],
          },
          {
            id: "compliance-stat-manual",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-compliance-manual",
              componentType: "StatCard",
              title: "Manual-Compliant",
              icon: "FileText",
              color: "violet",
              props: { extractor: "compliance.manualCompliantControls", trend: true },
            }],
          },
          {
            id: "compliance-stat-total",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-compliance-total",
              componentType: "StatCard",
              title: "Total Controls",
              icon: "BarChart3",
              color: "slate",
              props: { extractor: "compliance.totalControls", trend: true },
            }],
          },
          {
            id: "compliance-trend-panel",
            colSpan: 2, rowSpan: 2,
            kpis: [{
              id: "kpi-compliance-trend",
              componentType: "TrendAreaChart",
              title: "Compliance Trend",
              props: {
                series: [
                  { key: "applicable",  label: "Applicable",  extractor: "compliance.applicableControls",  color: "#10b981" },
                  { key: "implemented", label: "Implemented", extractor: "compliance.implementedControls", color: "#3b82f6" },
                ],
              },
            }],
          },
          {
            id: "compliance-gauge-panel",
            colSpan: 1, rowSpan: 2,
            kpis: [{
              id: "kpi-compliance-gauge",
              componentType: "ScoreGauge",
              title: "Overall Compliance %",
              props: { extractor: "compliance.compliancePercentage", max: 100 },
            }],
          },
        ],
      },
      {
        id: "compliance-frameworks",
        label: "By Framework",
        icon: "Layers",
        layout: { columns: 1, rows: "auto", gap: 16 },
        panels: [
          {
            id: "compliance-fw-table",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-compliance-fw-table",
              componentType: "TableWidget",
              title: "Framework Readiness",
              props: {
                // No hardcoded column list — TableWidget derives columns from
                // whatever keys exist on each framework's breakdown object at
                // runtime, so adding/removing a framework in the backend needs
                // no frontend change at all.
                extractor: "compliance.frameworkBreakdown",
              },
            }],
          },
          {
            id: "compliance-fw-bar",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-compliance-fw-bar",
              componentType: "TrendBarChart",
              title: "Applicable vs Implemented by Framework",
              props: {
                series: [
                  { key: "iso27001-applicable",  label: "ISO27001 Applicable",  extractor: "compliance.frameworkBreakdown.ISO27001.applicableControls",  color: "#10b981" },
                  { key: "iso27001-implemented", label: "ISO27001 Implemented", extractor: "compliance.frameworkBreakdown.ISO27001.implementedControls", color: "#3b82f6" },
                  { key: "soc2-applicable",       label: "SOC2 Applicable",      extractor: "compliance.frameworkBreakdown.SOC2.applicableControls",      color: "#f59e0b" },
                  { key: "soc2-implemented",      label: "SOC2 Implemented",     extractor: "compliance.frameworkBreakdown.SOC2.implementedControls",     color: "#a855f7" },
                ],
              },
            }],
          },
        ],
      },
    ],
  },

  // ── 3. AUDIT DASHBOARD ─────────────────────────────────────────────────────
  audit: {
    id: "audit",
    label: "Audit Dashboard",
    description: "Track compliance audits, findings and resolution status",
    icon: "ClipboardList",
    accent: "#f59e0b",
    gradient: "from-amber-500 to-orange-600",
    dataModule: "audit",
    endpoint: resultsEndpoint,
    views: [
      {
        id: "audit-overview",
        label: "Overview",
        icon: "LayoutDashboard",
        layout: { columns: 3, rows: "auto", gap: 16 },
        panels: [
          {
            id: "audit-stat-total",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-audit-total",
              componentType: "StatCard",
              title: "Total Audits",
              icon: "ClipboardList",
              color: "amber",
              props: { extractor: "audit.total", trend: true },
            }],
          },
          {
            id: "audit-stat-findings",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-audit-findings",
              componentType: "StatCard",
              title: "Total Findings",
              icon: "AlertCircle",
              color: "rose",
              props: { extractor: "audit.totalFindings", trend: true },
            }],
          },
          {
            id: "audit-stat-open",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-audit-open",
              componentType: "StatCard",
              title: "Open Audits",
              icon: "Clock",
              color: "orange",
              props: { extractor: "audit.byStatus.Open", trend: true },
            }],
          },
          {
            id: "audit-trend",
            colSpan: 2, rowSpan: 2,
            kpis: [{
              id: "kpi-audit-trend",
              componentType: "TrendLineChart",
              title: "Audit & Findings Trend",
              props: {
                series: [
                  { key: "total",    label: "Audits",   extractor: "audit.total",         color: "#f59e0b" },
                  { key: "findings", label: "Findings", extractor: "audit.totalFindings",  color: "#ef4444" },
                ],
              },
            }],
          },
          {
            id: "audit-status-donut",
            colSpan: 1, rowSpan: 2,
            kpis: [{
              id: "kpi-audit-status",
              componentType: "DonutStatusChart",
              title: "Audit Status",
              props: { extractor: "audit.byStatus" },
            }],
          },
        ],
      },
      {
        id: "audit-findings",
        label: "Findings",
        icon: "Search",
        layout: { columns: 2, rows: "auto", gap: 16 },
        panels: [
          {
            id: "audit-findings-trend",
            colSpan: 2, rowSpan: 1,
            kpis: [{
              id: "kpi-audit-findings-trend",
              componentType: "TrendBarChart",
              title: "Findings Over Time",
              props: {
                series: [
                  { key: "findings", label: "Findings", extractor: "audit.totalFindings", color: "#ef4444" },
                ],
              },
            }],
          },
          {
            id: "audit-findings-dept",
            colSpan: 2, rowSpan: 1,
            kpis: [{
              id: "kpi-audit-dept",
              componentType: "DepartmentBreakdown",
              title: "Findings by Department",
              props: { extractor: "audit.byDepartment", accent: "#f59e0b" },
            }],
          },
        ],
      },
    ],
  },

  // ── 3. TASKS DASHBOARD ─────────────────────────────────────────────────────
  tasks: {
    id: "tasks",
    label: "Tasks Dashboard",
    description: "Manage action items, deadlines and overdue tracking",
    icon: "CheckSquare",
    accent: "#8b5cf6",
    gradient: "from-violet-500 to-purple-600",
    dataModule: "tasks",
    endpoint: resultsEndpoint,
    views: [
      {
        id: "tasks-overview",
        label: "Overview",
        icon: "LayoutDashboard",
        layout: { columns: 3, rows: "auto", gap: 16 },
        panels: [
          {
            id: "tasks-stat-total",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-tasks-total",
              componentType: "StatCard",
              title: "Total Tasks",
              icon: "CheckSquare",
              color: "violet",
              props: { extractor: "tasks.total", trend: true },
            }],
          },
          {
            id: "tasks-stat-overdue",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-tasks-overdue",
              componentType: "StatCard",
              title: "Overdue",
              icon: "AlertCircle",
              color: "rose",
              props: { extractor: "tasks.overdue", trend: true },
            }],
          },
          {
            id: "tasks-stat-completed",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-tasks-completed",
              componentType: "StatCard",
              title: "Completed",
              icon: "CheckCircle2",
              color: "emerald",
              props: { extractor: "tasks.byStatus.Completed", trend: true },
            }],
          },
          {
            id: "tasks-trend",
            colSpan: 2, rowSpan: 2,
            kpis: [{
              id: "kpi-tasks-trend",
              componentType: "TrendAreaChart",
              title: "Task Trend",
              props: {
                series: [
                  { key: "total",   label: "Total",   extractor: "tasks.total",   color: "#8b5cf6" },
                  { key: "overdue", label: "Overdue", extractor: "tasks.overdue", color: "#ef4444" },
                ],
              },
            }],
          },
          {
            id: "tasks-status-donut",
            colSpan: 1, rowSpan: 2,
            kpis: [{
              id: "kpi-tasks-status",
              componentType: "DonutStatusChart",
              title: "By Status",
              props: { extractor: "tasks.byStatus" },
            }],
          },
        ],
      },
    ],
  },

  // ── 4. DPIA DASHBOARD ──────────────────────────────────────────────────────
  dpia: {
    id: "dpia",
    label: "DPIA Dashboard",
    description: "Data Protection Impact Assessments tracking and completion",
    icon: "ShieldCheck",
    accent: "#3b82f6",
    gradient: "from-blue-500 to-indigo-600",
    dataModule: "dpia",
    endpoint: resultsEndpoint,
    views: [
      {
        id: "dpia-overview",
        label: "Overview",
        icon: "LayoutDashboard",
        layout: { columns: 2, rows: "auto", gap: 16 },
        panels: [
          {
            id: "dpia-stat-total",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-dpia-total",
              componentType: "StatCard",
              title: "Total DPIAs",
              icon: "ShieldCheck",
              color: "blue",
              props: { extractor: "dpia.total", trend: true },
            }],
          },
          {
            id: "dpia-stat-completion",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-dpia-completion",
              componentType: "ScoreGauge",
              title: "Avg Completion",
              props: { extractor: "dpia.avgCompletion", max: 100, unit: "%" },
            }],
          },
          {
            id: "dpia-trend",
            colSpan: 2, rowSpan: 2,
            kpis: [{
              id: "kpi-dpia-trend",
              componentType: "TrendLineChart",
              title: "DPIA Progress",
              props: {
                series: [
                  { key: "total",         label: "Total",      extractor: "dpia.total",         color: "#3b82f6" },
                  { key: "avgCompletion", label: "Completion", extractor: "dpia.avgCompletion", color: "#10b981" },
                ],
              },
            }],
          },
          {
            id: "dpia-status-donut",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-dpia-status",
              componentType: "DonutStatusChart",
              title: "By Status",
              props: { extractor: "dpia.byStatus" },
            }],
          },
          {
            id: "dpia-dept",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-dpia-dept",
              componentType: "DepartmentBreakdown",
              title: "By Department",
              props: { extractor: "dpia.byDepartment", accent: "#3b82f6" },
            }],
          },
        ],
      },
    ],
  },

  // ── 5. DOCUMENTS DASHBOARD ─────────────────────────────────────────────────
  documents: {
    id: "documents",
    label: "Documents Dashboard",
    description: "Document registry with approval status and pending reviews",
    icon: "FileText",
    accent: "#10b981",
    gradient: "from-emerald-500 to-teal-600",
    dataModule: "documents",
    endpoint: resultsEndpoint,
    views: [
      {
        id: "docs-overview",
        label: "Overview",
        icon: "LayoutDashboard",
        layout: { columns: 3, rows: "auto", gap: 16 },
        panels: [
          {
            id: "docs-stat-total",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-docs-total",
              componentType: "StatCard",
              title: "Total Documents",
              icon: "FileText",
              color: "emerald",
              props: { extractor: "documents.total", trend: true },
            }],
          },
          {
            id: "docs-stat-approved",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-docs-approved",
              componentType: "StatCard",
              title: "Approved",
              icon: "CheckCircle2",
              color: "blue",
              props: { extractor: "documents.approved", trend: true },
            }],
          },
          {
            id: "docs-stat-pending",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-docs-pending",
              componentType: "StatCard",
              title: "Pending Approval",
              icon: "Clock",
              color: "amber",
              props: { extractor: "documents.pendingApproval", trend: true },
            }],
          },
          {
            id: "docs-trend",
            colSpan: 2, rowSpan: 2,
            kpis: [{
              id: "kpi-docs-trend",
              componentType: "TrendAreaChart",
              title: "Document Flow",
              props: {
                series: [
                  { key: "total",    label: "Total",    extractor: "documents.total",          color: "#10b981" },
                  { key: "approved", label: "Approved", extractor: "documents.approved",        color: "#3b82f6" },
                  { key: "pending",  label: "Pending",  extractor: "documents.pendingApproval", color: "#f59e0b" },
                ],
              },
            }],
          },
          {
            id: "docs-status-donut",
            colSpan: 1, rowSpan: 2,
            kpis: [{
              id: "kpi-docs-status",
              componentType: "DonutStatusChart",
              title: "Approval Status",
              props: {
                staticSlices: [
                  { extractor: "documents.approved",        name: "Approved"         },
                  { extractor: "documents.pendingApproval", name: "Pending Approval" },
                ],
              },
            }],
          },
        ],
      },
    ],
  },

  // ── 6. AIIA DASHBOARD ──────────────────────────────────────────────────────
  aiia: {
    id: "aiia",
    label: "AIIA Dashboard",
    description: "AI Impact Assessments across Stage 1 and Stage 2 workflows",
    icon: "Activity",
    accent: "#6366f1",
    gradient: "from-indigo-500 to-violet-600",
    dataModule: "aiia",
    endpoint: resultsEndpoint,
    views: [
      {
        id: "aiia-overview",
        label: "Overview",
        icon: "LayoutDashboard",
        layout: { columns: 3, rows: "auto", gap: 16 },
        panels: [
          {
            id: "aiia-stat-s1",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-aiia-s1",
              componentType: "StatCard",
              title: "Stage 1 Total",
              icon: "Activity",
              color: "indigo",
              props: { extractor: "aiia.stage1Total", trend: true },
            }],
          },
          {
            id: "aiia-stat-s1-completed",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-aiia-s1-completed",
              componentType: "StatCard",
              title: "S1 Completed",
              icon: "CheckCircle2",
              color: "emerald",
              props: { extractor: "aiia.stage1Completed", trend: true },
            }],
          },
          {
            id: "aiia-stat-s2",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-aiia-s2",
              componentType: "StatCard",
              title: "Stage 2 Total",
              icon: "BarChart3",
              color: "purple",
              props: { extractor: "aiia.stage2Total", trend: true },
            }],
          },
          {
            id: "aiia-trend",
            colSpan: 2, rowSpan: 2,
            kpis: [{
              id: "kpi-aiia-trend",
              componentType: "TrendLineChart",
              title: "AIIA Pipeline",
              props: {
                series: [
                  { key: "stage1Total",     label: "S1 Total",     extractor: "aiia.stage1Total",     color: "#6366f1" },
                  { key: "stage1Completed", label: "S1 Completed", extractor: "aiia.stage1Completed", color: "#10b981" },
                  { key: "stage2Total",     label: "S2 Total",     extractor: "aiia.stage2Total",     color: "#a855f7" },
                ],
              },
            }],
          },
          {
            id: "aiia-donut",
            colSpan: 1, rowSpan: 2,
            kpis: [{
              id: "kpi-aiia-status",
              componentType: "DonutStatusChart",
              title: "Stage Breakdown",
              props: {
                staticSlices: [
                  { extractor: "aiia.stage1Draft",     name: "S1 Draft"     },
                  { extractor: "aiia.stage1Completed", name: "S1 Completed" },
                  { extractor: "aiia.stage2Total",     name: "S2 Total"     },
                  { extractor: "aiia.stage2Assigned",  name: "S2 Assigned"  },
                  { extractor: "aiia.stage2Completed", name: "S2 Completed" },
                ],
              },
            }],
          },
        ],
      },
      {
        id: "aiia-stages",
        label: "Stage Detail",
        icon: "Layers",
        layout: { columns: 2, rows: "auto", gap: 16 },
        panels: [
          {
            id: "aiia-s1-bar",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-aiia-s1-bar",
              componentType: "TrendBarChart",
              title: "Stage 1 Progress",
              props: {
                series: [
                  { key: "stage1Total",     label: "Total",     extractor: "aiia.stage1Total",     color: "#6366f1" },
                  { key: "stage1Draft",     label: "Draft",     extractor: "aiia.stage1Draft",     color: "#f59e0b" },
                  { key: "stage1Completed", label: "Completed", extractor: "aiia.stage1Completed", color: "#10b981" },
                ],
              },
            }],
          },
          {
            id: "aiia-s2-bar",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-aiia-s2-bar",
              componentType: "TrendBarChart",
              title: "Stage 2 Progress",
              props: {
                series: [
                  { key: "stage2Total",     label: "Total",     extractor: "aiia.stage2Total",     color: "#a855f7" },
                  { key: "stage2Assigned",  label: "Assigned",  extractor: "aiia.stage2Assigned",  color: "#3b82f6" },
                  { key: "stage2Completed", label: "Completed", extractor: "aiia.stage2Completed", color: "#10b981" },
                ],
              },
            }],
          },
        ],
      },
    ],
  },

  // ── 7. EXECUTIVE OVERVIEW (MULTI-MODULE COMPOSITE) ────────────────────────
  executive: {
    id: "executive",
    label: "Executive Overview",
    description: "Cross-module summary for leadership — risks, audits, tasks and more at a glance",
    icon: "LayoutDashboard",
    accent: "#64748b",
    gradient: "from-slate-600 to-slate-800",
    dataModule: null,            // composite — uses all modules
    endpoint: resultsEndpoint,
    views: [
      {
        id: "exec-summary",
        label: "Summary",
        icon: "LayoutDashboard",
        layout: { columns: 3, rows: "auto", gap: 16 },
        panels: [
          {
            id: "exec-risks",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-exec-risks",
              componentType: "StatCard",
              title: "Total Risks",
              icon: "AlertTriangle",
              color: "rose",
              props: { extractor: "risks.total", trend: true },
            }],
          },
          {
            id: "exec-audits",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-exec-audits",
              componentType: "StatCard",
              title: "Total Audits",
              icon: "ClipboardList",
              color: "amber",
              props: { extractor: "audit.total", trend: true },
            }],
          },
          {
            id: "exec-tasks",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-exec-tasks",
              componentType: "StatCard",
              title: "Total Tasks",
              icon: "CheckSquare",
              color: "violet",
              props: { extractor: "tasks.total", trend: true },
            }],
          },
          {
            id: "exec-multi-trend",
            colSpan: 3, rowSpan: 2,
            kpis: [{
              id: "kpi-exec-multi",
              componentType: "TrendLineChart",
              title: "All Modules Trend",
              props: {
                series: [
                  { key: "risks",   label: "Risks",   extractor: "risks.total",   color: "#ef4444" },
                  { key: "audits",  label: "Audits",  extractor: "audit.total",   color: "#f59e0b" },
                  { key: "tasks",   label: "Tasks",   extractor: "tasks.total",   color: "#8b5cf6" },
                  { key: "dpias",   label: "DPIAs",   extractor: "dpia.total",    color: "#3b82f6" },
                  { key: "docs",    label: "Docs",    extractor: "documents.total", color: "#10b981" },
                ],
              },
            }],
          },
          {
            id: "exec-dpias",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-exec-dpias",
              componentType: "StatCard",
              title: "DPIAs",
              icon: "ShieldCheck",
              color: "blue",
              props: { extractor: "dpia.total", trend: true },
            }],
          },
          {
            id: "exec-docs",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-exec-docs",
              componentType: "StatCard",
              title: "Documents",
              icon: "FileText",
              color: "emerald",
              props: { extractor: "documents.total", trend: true },
            }],
          },
          {
            id: "exec-overdue-tasks",
            colSpan: 1, rowSpan: 1,
            kpis: [{
              id: "kpi-exec-overdue",
              componentType: "StatCard",
              title: "Overdue Tasks",
              icon: "AlertCircle",
              color: "rose",
              props: { extractor: "tasks.overdue", trend: true },
            }],
          },
        ],
      },
    ],
  },
};

// ─── MODULES (for the Component Builder's "Module" selector) ────────────────
// Derived from AVAILABLE_EXTRACTORS module prefixes — used to filter the
// Data field dropdown down to one module at a time, Bigin-style.
export const MODULES = [
  { id: "risks",      label: "Risks"      },
  { id: "compliance", label: "Compliance" },
  { id: "audit",      label: "Audit"      },
  { id: "tasks",      label: "Tasks"      },
  { id: "dpia",       label: "DPIA"       },
  { id: "documents",  label: "Documents"  },
  { id: "aiia",       label: "AIIA"       },
];

// ─── Duration X-axis grouping (charts) ───────────────────────────────────────
export const GROUP_BY_OPTIONS = [
  { key: "day",   label: "By Day"   },
  { key: "week",  label: "By Week"  },
  { key: "month", label: "By Month" },
  { key: "year",  label: "By Year"  },
];

// ─── KPI comparison period ────────────────────────────────────────────────────
export const COMPARE_TO_OPTIONS = [
  { key: "previous_period",          label: "Previous Period"          },
  { key: "previous_relative_period", label: "Previous Relative Period" },
  { key: "same_period_last_year",    label: "Same Period Last Year"    },
  { key: "custom",                   label: "Custom"                   },
];

export const OBJECTIVE_OPTIONS = [
  { key: "increase_positive", label: "Consider increase in value as positive" },
  { key: "increase_negative", label: "Consider increase in value as negative" },
];

export const TARGET_METER_TYPES = [
  { key: "dial_gauge",     label: "Dial Gauge",    hint: "Single needle gauge" },
  { key: "traffic_lights", label: "Traffic Lights", hint: "Red/amber/green gauge" },
  { key: "single_bar",     label: "Single Bar",    hint: "One bar, one target" },
  { key: "multiple_bar",   label: "Multiple Bar",  hint: "One bar per user/role" },
];

export const TARGET_FOR_OPTIONS = [
  { key: "specific_users", label: "Specific Users" },
  { key: "specific_roles", label: "Specific Roles" },
];

export const TARGET_TYPE_OPTIONS = [
  { key: "common",     label: "Common Target" },
  { key: "individual", label: "Individual Target" },
];

// ─── Chart "More Options" — grouping ─────────────────────────────────────────
export const SORT_BY_OPTIONS = [
  { key: "value_desc", label: "Value Descending" },
  { key: "value_asc",  label: "Value Ascending"  },
  { key: "label_asc",  label: "Label Ascending"  },
  { key: "label_desc", label: "Label Descending" },
];

export const MAX_GROUPING_OPTIONS = [5, 10, 15, 20, 30, 40, 50, 75];

// ─── DEFAULT TEMPLATE ORDER (for sidebar) ────────────────────────────────────
export const TEMPLATE_ORDER = [
  "executive",
  "risks",
  "compliance",
  "audit",
  "tasks",
  "dpia",
  "documents",
  "aiia",
];

// ─── CUSTOM DASHBOARD BUILDER HELPERS ────────────────────────────────────────

/** All available component types the builder can select */
export const AVAILABLE_COMPONENTS = [
  { type: "StatCard",            label: "Stat Card",        icon: "Hash"        },
  { type: "TrendLineChart",      label: "Line Chart",       icon: "TrendingUp"  },
  { type: "TrendAreaChart",      label: "Area Chart",       icon: "Layers"      },
  { type: "TrendBarChart",       label: "Bar Chart",        icon: "BarChart2"   },
  { type: "DonutStatusChart",    label: "Donut Chart",      icon: "PieChart"    },
  { type: "ScoreGauge",          label: "Score Gauge",      icon: "Gauge"       },
  { type: "DepartmentBreakdown", label: "Dept Breakdown",   icon: "Building2"   },
  { type: "TableWidget",         label: "Data Table",       icon: "Table"       },
];

/** All module data paths users can pick from in the builder */
export const AVAILABLE_EXTRACTORS = [
  { extractor: "risks.risksIdentifiedCount",  label: "Risks · Identified"   },
  { extractor: "risks.risksInMitigationCount", label: "Risks · In Mitigation" },
  { extractor: "risks.risksByTreatmentType",  label: "Risks · By Treatment Type"},
  { extractor: "compliance.totalControls",                label: "Compliance · Total Controls"        },
  { extractor: "compliance.applicableControls",           label: "Compliance · Applicable"            },
  { extractor: "compliance.implementedControls",          label: "Compliance · Implemented"           },
  { extractor: "compliance.autoCompliantControls",        label: "Compliance · Auto-Compliant"        },
  { extractor: "compliance.manualCompliantControls",      label: "Compliance · Manual-Compliant"      },
  { extractor: "compliance.compliancePercentage",          label: "Compliance · Compliance %"          },
  { extractor: "compliance.frameworkBreakdown.ISO27001.compliancePercentage",  label: "Compliance · ISO27001 %" },
  { extractor: "compliance.frameworkBreakdown.ISO27701.compliancePercentage",  label: "Compliance · ISO27701 %" },
  { extractor: "compliance.frameworkBreakdown.ISO42001.compliancePercentage",  label: "Compliance · ISO42001 %" },
  { extractor: "compliance.frameworkBreakdown.SOC2.compliancePercentage",      label: "Compliance · SOC2 %"     },
  { extractor: "compliance.frameworkBreakdown.GDPR.compliancePercentage",      label: "Compliance · GDPR %"     },
  { extractor: "compliance.frameworkBreakdown.KSA_PDPL.compliancePercentage",  label: "Compliance · KSA PDPL %" },
  { extractor: "compliance.frameworkBreakdown.DPDPA.compliancePercentage",     label: "Compliance · DPDPA %"    },
  { extractor: "compliance.frameworkBreakdown.NIST_CSF2.compliancePercentage", label: "Compliance · NIST CSF2 %"},
  { extractor: "compliance.frameworkBreakdown.HIPPA.compliancePercentage",     label: "Compliance · HIPAA %"    },
  { extractor: "audit.total",              label: "Audit · Total"              },
  { extractor: "audit.totalFindings",      label: "Audit · Findings"           },
  { extractor: "audit.byStatus",           label: "Audit · By Status"          },
  { extractor: "tasks.total",              label: "Tasks · Total"              },
  { extractor: "tasks.overdue",            label: "Tasks · Overdue"            },
  { extractor: "tasks.byStatus",           label: "Tasks · By Status"          },
  { extractor: "dpia.total",               label: "DPIA · Total"               },
  { extractor: "dpia.avgCompletion",       label: "DPIA · Avg Completion"      },
  { extractor: "dpia.byStatus",            label: "DPIA · By Status"           },
  { extractor: "documents.total",          label: "Documents · Total"          },
  { extractor: "documents.approved",       label: "Documents · Approved"       },
  { extractor: "documents.pendingApproval",label: "Documents · Pending"        },
  { extractor: "aiia.stage1Total",         label: "AIIA · S1 Total"            },
  { extractor: "aiia.stage1Draft",         label: "AIIA · S1 Draft"            },
  { extractor: "aiia.stage1Completed",     label: "AIIA · S1 Completed"        },
  { extractor: "aiia.stage2Total",         label: "AIIA · S2 Total"            },
  { extractor: "aiia.stage2Assigned",      label: "AIIA · S2 Assigned"         },
  { extractor: "aiia.stage2Completed",     label: "AIIA · S2 Completed"        },
];