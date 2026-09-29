//cf-tool-frontend-main\src\modules\dashboard\DashboardLoggedIn.js

"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Joyride from "react-joyride";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import CompliancePie from "./CompliancePie";
import {
  BarChart3, ClipboardCheck, FileText, CheckSquare, ShieldCheck,
  TrendingUp, Activity, Award, Zap, Brain, ArrowUpRight
} from "lucide-react";

import { INTRO_DOCS } from "@/docs/introDocs";

import HelpDocModal from "@/components/shared/HelpDocModal";
import { HelpCircle } from "lucide-react"; // check your existing lucide-react import line first — add HelpCircle if missing

import riskService from "../riskAssesment/services/riskService";
import documentationService from "../documentation/services/documentationService";
import controlService from "../documentation/services/controlService";
import gapService from "../gapAssessment/services/gapService";
import taskService from "../taskManagement/services/taskService";
import tprmService from "../tprm/services/tprmService";
import { getAllAssessments } from "../dpia/services/dpiaApi";
import { stage1Api } from "../aiia/services/aiiaApi";
import "./DashboardLoggedIn.css";
import { useFramework } from "../../context/FrameworkContex";
import { getFrameworkCompliance } from "../integrations/complianceData";
import { useUI } from "../../context/UIContext";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import useModuleEntitlements from "@/modules/admin/hooks/useModuleEntitlements";
import { getDepartments } from "../departments/services/userService";
import { matchesDepartment, getUserDepartments, isSameOrg } from "@/utils/departmentUtils";
import { isStrictAuditor } from "../../utils/roleUtils";

// ─── Framework filter helpers ─────────────────────────────────────────────────
function _getAllowedRiskTypes(activeDashboardCodes) {
  const TYPE_MAP = [
    { type: "Security", fw: ["ISO27001", "SOC2"] },
    { type: "Cyber", fw: ["ISO27001", "SOC2"] },
    { type: "Fraud", fw: ["ISO27001"] },
    { type: "Privacy", fw: ["ISO27701", "SOC2", "KSA_PDPL"] },
    { type: "Artificial Intelligence", fw: ["ISO42001"] },
  ];
  const allowed = new Set();
  TYPE_MAP.forEach(({ type, fw }) => {
    if (fw.some((code) => activeDashboardCodes.has(code))) allowed.add(type);
  });
  return allowed;
}

function _riskMatchesFilter(risk, allowedRiskTypes) {
  const types = Array.isArray(risk.riskType)
    ? risk.riskType.map((t) => t.trim().toLowerCase())
    : risk.riskType ? String(risk.riskType).split(",").map((s) => s.trim().toLowerCase()).filter(Boolean) : [];
  if (types.length === 0) return false;
  const normalizedAllowed = new Set([...allowedRiskTypes].map((t) => t.toLowerCase()));
  return types.some((t) => normalizedAllowed.has(t));
}

function _normalizeFrameworkCode(raw) {
  return (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function _auditMatchesFrameworks(audit, normalizedSelectedFW) {
  if (!audit) return false;
  const raw = audit.frameworkCode || audit.framework;
  if (!raw) return false;
  const rawValues = Array.isArray(raw) ? raw : [raw];
  const auditCodes = rawValues.map(_normalizeFrameworkCode).filter(Boolean);
  return normalizedSelectedFW.some((fw) => auditCodes.some((code) => code === fw));
}

const isJwtExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

// ─── Task due-date helpers (derived, not real status values) ─────────────────
const DUE_SOON_DAYS = 3;
function _isTaskOverdue(t) {
  return !!t.endDate && new Date(t.endDate) < new Date() && t.status !== "Done";
}
function _isTaskDueSoon(t) {
  if (!t.endDate || t.status === "Done") return false;
  const diffDays = (new Date(t.endDate) - new Date()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= DUE_SOON_DAYS;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const CARD_H = 300;

function getComplianceLayout(count) {
  if (count <= 6) return { colSpan: 2, tileCols: 2 };
  if (count <= 12) return { colSpan: 3, tileCols: 3 };
  return { colSpan: 4, tileCols: 3 };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const PieSection = ({ data, legend, centerValue, centerLabel }) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 0, position: "relative" }}>
    <div style={{ width: "100%", height: "118px", position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius="70%"
            outerRadius="88%"
            paddingAngle={3}
            dataKey="value"
            animationDuration={900}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || "#e2e8f0"} />
            ))}
          </Pie>
          <Tooltip
            position={{ y: -15 }}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid rgba(102, 126, 234, 0.25)",
              background: "rgba(245, 243, 255, 0.95)",
              fontSize: "11px",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
              padding: "4px 8px",
            }}
            itemStyle={{
              color: "#4f46e5",
              fontWeight: 600,
            }}
            separator={data[0]?.name === "No Data" ? "" : " : "}
            formatter={(v, n) => n === "No Data" ? ["No Data", ""] : [`${v}`, n]}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerValue !== undefined && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none"
        }}>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{centerValue}</div>
          {centerLabel && <div style={{ fontSize: "9px", fontWeight: 650, color: "#64748b", marginTop: "2px" }}>{centerLabel}</div>}
        </div>
      )}
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "10px" }}>
      {legend.map(([color, val, label]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: "#475569" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
          {val} {label}
        </div>
      ))}
    </div>
  </div>
);

const CardHeader = ({ icon, iconGradient, title, total, totalLabel, filterTags, selectedFWs, isAllSelected, tagBg, tagColor, tagBorder }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexShrink: 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
      <div style={{ width: 36, height: 36, borderRadius: "8px", flexShrink: 0, background: iconGradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#0f172a", margin: 0, lineHeight: 1.2, whiteSpace: "nowrap" }}>
          {title}
        </h3>
        {filterTags && !isAllSelected && selectedFWs?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginTop: "3px" }}>
            {selectedFWs.map((fw) => (
              <span key={fw} style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 10, background: tagBg, color: tagColor, border: `1px solid ${tagBorder}`, whiteSpace: "nowrap" }}>
                {fw}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "8px" }}>
      <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{total}</div>
      <div style={{ fontSize: "10px", fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "2px" }}>
        {totalLabel}
      </div>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const DashboardLoggedIn = () => {
  const router = useRouter();
  const dropdownRef = useRef(null);
  const idleTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const [orgPickerOpen, setOrgPickerOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);

  const [showChangePassword] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [frameworkOpen, setFrameworkOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
    const originalHtmlBg = document.documentElement.style.backgroundColor;
    const originalBodyBg = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = "#f8fafc";
    document.body.style.backgroundColor = "#f8fafc";
    return () => {
      document.documentElement.style.backgroundColor = originalHtmlBg;
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, []);
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showTprm, setShowTprm] = useState(false);
  const [activeFw, setActiveFw] = useState(null);
  const [orgTprmEnabled, setOrgTprmEnabled] = useState(false);
  const { runTour, setRunTour,showHelp, setShowHelp } = useUI();

      const [showHelpDoc, setShowHelpDoc] = useState(false);
  
  const HOME_DASHBOARD_HELP_CONTENT = `
  # CALVANT
### Digital Compliance Management — User Manual
Version 1.0 | July 2026
© 2026 CalVant. All rights reserved.

---

## Table of Contents


1. **Introduction**
   - 1.1 Purpose of this User Manual
   - 1.2 Intended Audience
   - 1.3 How to Use this Manual
2. **Understanding Digital Compliance Management**
   - 2.1 What is Digital Compliance and Why It Matters?
   - 2.2 Types of Digital Compliance Topics
   - 2.3 Global Digital Compliance Frameworks
3. **Steps to Comply**
   - 3.1 The Seven-Step Implementation Methodology
4. **Introducing Calvant**
   - 4.1 Core Capabilities
   - 4.2 End-to-End Digital Compliance Workflow in Calvant
5. **Getting Started**
   - 5.1 Logging In
   - 5.2 User Roles and Permissions
6. **Understanding the Calvant Workspace**
   - 6.1 The Home Dashboard
7. **Core Modules & Key Workflows**
   - 7.1 Risk Management
   - 7.2 Policy Management
   - 7.3 Audit Management
   - 7.4 Task Management
   - 7.5 Compliance Management
   - 7.6 Vendor Management
   - 7.7 Risk Assessments, Impact Assessments, and Others
8. **Operational Best Practices**
9. **FAQ**
   - 9.1 Frequently Asked Questions
10. **Platform Readiness Quiz**
11. **Answer Key & Explanations**

---

## 1. Introduction

Welcome to Calvant, an all-in-one corporate digital compliance management ecosystem designed to streamline how your organization governs operational, cybersec, and compliance frameworks. In an era where data security and regulatory alignment dictate business trust, Calvant replaces fragmented, static spreadsheets with a dynamic, centralized workspace.

### 1.1 Purpose of this User Manual

This Introductory User Manual is designed to give you a cohesive, high-level understanding of Calvant. It acts as your primary gateway to the platform's features, breaking down complex compliance processes into a logical roadmap. It guides you from absolute setup to everyday risk mitigation, document management, and third-party vendor analysis without overwhelming you with dry data models.

### 1.2 Intended Audience

This manual is written exclusively for users—whether you are a compliance officer overseeing the entire corporate program, an auditor evaluating control evidence, a risk owner responsible for mitigating threats, or an executive looking at operational health dashboards. It assumes no previous configuration knowledge, addressing you in a professional, practical tone.

### 1.3 How to Use this Manual

Begin with Section 2 and 3 to understand the strategic concepts of digital compliance and the structured 7-step implementation methodology that underpins Calvant. From there, explore Section 4 to familiarize yourself with Calvant's interface, and dive into the focused module overviews in Sections 5 through 11 to see how each separate workflow—from policy approvals to vendor risk assessments—functions harmoniously within a single dashboard environment.

---

## 2. Understanding Digital Compliance Management

Compliance is often viewed as a static checklist—a periodic burden to obtain a security certification or satisfy a legal requirement. However, digital compliance is a continuous posture of operational resilience and cybersec defense.

### 2.1 What is Digital Compliance and Why It Matters?

Digital compliance involves aligning your technological infrastructure, human workflows, physical spaces, and corporate policies with global standards. By moving compliance from paper records to an integrated software solution, your organization transforms abstract rules into living metrics. This continuous visibility builds massive customer trust, protects your intellectual property, and significantly mitigates the financial and reputational impacts of cybersec breaches.

### 2.2 Types of Digital Compliance Topics

Rather than treating risk, policies, and audits as isolated silos, Calvant merges them into functional areas:

| Compliance Topic | Target Area |
|---|---|
| Data Privacy & Protection | Rules around how personal data (of customers, employees, or users) is collected, stored, used, and shared. This is usually the starting point for most businesses, and the area most laws focus on. |
| Risk Management | Identifying things that could go wrong — a data leak, a vendor failure, a system outage — before they happen, and deciding how seriously to treat each one. |
| Policy Governance | The written rules your organisation follows (e.g. a Data Retention Policy or an Access Control Policy) and making sure they are current, approved, and actually followed. |
| Audit & Assurance | Independently checking whether your controls are actually working the way you say they are — internally, or by an external auditor. |
| Third-Party / Vendor Risk | Making sure the vendors and partners you share data with are not the weak link in your compliance chain. |
| AI Governance | A newer but fast-growing category — assessing the risks introduced when your business builds or uses AI tools, especially where personal data is involved. |
| Task Management | Assigning clear ownership so that compliance work doesn't fall through the cracks between people and departments. |

### 2.3 Global Digital Compliance Frameworks

Calvant is built to natively support and cross-map multiple international frameworks. This ensures that a single operational task or policy document can simultaneously satisfy several standards, including:

| Sl No | Standard / Framework | Data Privacy | Cybersecurity | AI |
|---|---|---|---|---|
| 1 | ISO/IEC 27001 | | ✓ | |
| 2 | ISO/IEC 27701 | ✓ | ✓ | |
| 3 | KSA PDPL (Personal Data Protection Law) | ✓ | | |
| 4 | HIPAA (Health Insurance Portability and Accountability Act) | ✓ | ✓ | |
| 5 | EU AI Act | | | ✓ |
| 6 | ISO/IEC 42001 (AI Management System) | | | ✓ |
| 7 | SOC 2 Type II | ✓ | ✓ | |
| 8 | GDPR (General Data Protection Regulation) | ✓ | | |
| 9 | NIST Cybersecurity Framework (CSF) | | ✓ | |
| 10 | PCI DSS (Payment Card Industry Data Security Standard) | | ✓ | |
| 11 | CCPA / CPRA (California Consumer Privacy Act) | ✓ | | |
| 12 | NIST AI RMF (AI Risk Management Framework) | | | ✓ |
| 13 | ISO/IEC 23894 (Artificial Intelligence — Risk Management) | | | ✓ |
| 14 | CMMC (Cybersecurity Maturity Model Certification) | | ✓ | |
| 15 | ISO/IEC 27017 (Cloud Security Controls) | | ✓ | |
| 16 | ISO/IEC 27018 (Cloud Privacy Protection) | ✓ | | |
| 17 | UAE PDPL (Personal Data Protection Law) | ✓ | | |
| 18 | Singapore PDPA (Personal Data Protection Act) | ✓ | | |
| 19 | COPPA (Children's Online Privacy Protection Act) | ✓ | | |
| 20 | CIS Controls (Center for Internet Security) | | ✓ | |

This is where Calvant comes in for your assistance.

---

## 3. Steps to Comply

Achieving an auditable compliance posture requires a structured, repeatable methodology. Calvant has codified this journey into a 7-step cycle that guides users from discovery to continuous monitoring.

### 3.1 The Seven-Step Implementation Methodology

1. **Framework Selection:** Identify the regulatory requirements and corporate standards (e.g., ISO 27001, SOC 2) applicable to your business.
2. **Statement of Applicability (SoA):** Establish exactly which security and operational controls apply to your unique environment, providing logical justifications for any exclusions.
3. **Risk & Threat Identification:** Uncover internal and external vulnerabilities that could impact corporate assets, assessing their likelihood and business impact.
4. **Treatment & Mitigation:** Formulate targeted action plans to address high-level risks, assigning clear tasks to operational personnel with explicit completion windows.
5. **Policy & Documentation Mapping:** Author and publish official policy documents linked to specific controls, validating their completeness and quality via automated checks.
6. **Internal Auditing:** Schedule and execute detailed reviews where independent internal or external auditors verify that documented policies are practiced in daily workflows.
7. **External Audit and Certification:** Extend your safety perimeter to third-party providers via structured vendor assessments and perform targeted impact reviews before launching major data or AI processing systems.

---

## 4. Introducing Calvant

Calvant is a comprehensive Digital Compliance Management SaaS platform. It acts as the operational nervous system for your compliance journey, translating complex legal standards into straightforward task lists and visual dashboards.

### 4.1 Core Capabilities

- **Dynamic Risk Registers:** Map real-world threats and calculate risk indices (Likelihood x Impact) instantly.
- **Integrated Task Management:** Centralize mitigation items from risk plans, audit findings, and policy gaps.
- **Automated Phase Scaling:** Plan audits with advanced sliders that auto-allocate prep and execution phases.
- **Interactive Vendor Portal:** Send secure questionnaires to external partners and track responses without cluttered email threads.
- **Comprehensive Impact Wizards:** Lead risk owners through systematic multi-stage risk assessments and impact assessments before deploying complex models or data pipelines.

### 4.2 End-to-End Digital Compliance Workflow in Calvant

The beauty of Calvant lies in its cross-module integration. When you record a risk in the Risk Module, it prompts you to link an applicable control. That control refers to a mandate within your Statement of Applicability (SoA). To satisfy that control, the Policy Module prompts you to upload a document. If that document is missing or expired, a task is auto-generated in the Task Module. Finally, during an audit, the Audit Module pulls that uploaded document and task log as verifiable evidence for your auditor. It is an end-to-end loop that guarantees readiness.

---

## 5. Getting Started

Accessing Calvant requires an active corporate account. Upon registration, you will receive a secure portal link customized to your corporate domain.

### 5.1 Logging In

1. Navigate to your organization's specific Calvant URL.
2. Enter your corporate email and secure password.
3. Complete any required multi-factor authentication (MFA) prompts to enter the workspace.

> **Platform Tip:** Calvant represents this 7-step cycle in its digital sidebar, allowing users to move seamlessly between risk analysis, policy uploads, internal audits, and third-party monitoring.

### 5.2 User Roles and Permissions

To preserve security and segment duties, Calvant assigns strict roles to each profile. Your interface features and available modules will adapt depending on your assigned level:

- **Admin:** Complete access to the workspace, global configurations, security settings, and team role assignments.
- **Auditor:** Restricted, read-only view focused entirely on assessing controls, viewing submitted evidence, and logging audit findings.
- **Risk Owner:** Focused on executing assigned mitigation tasks, uploading documents for assigned policy areas, and completing localized impact assessments.
- **Vendor:** External, secure access limited strictly to completing and submitting assigned third-party risk questionnaires.
- Other roles include Risk Managers, Process Owners, Process Managers and etc.

---

## 6. Understanding the Calvant Workspace

The Calvant dashboard is structured to present essential information at a glance, allowing you to gauge operational health without getting lost in raw tables.

### 6.1 The Home Dashboard

When you log in, your home view centers on visual metrics:

- **Summary Tiles:** Instant counters displaying total active risks, uploaded policies, ongoing audits, and open tasks.
- **Overall Compliance Progress:** A global percentage meter tracking your readiness score across all active frameworks.
- **Activity Trends:** Bar charts tracking your document uploads and audit schedules month-by-month.
- **Notification Center:** Alerts detailing newly assigned tasks, upcoming audit deadlines, and vendor responses awaiting review.
- **User Profile:** Located in the top-right header, showing your logged-in username, department, and active role.

---

## 7. Core Modules & Key Workflows

To help you master the platform, this section summarizes the seven specialized modules that make up the Calvant suite.

### 7.1 Risk Management

The Risk Module is where your security strategy begins. It provides a structured space to document corporate vulnerabilities, calculate risk scores, and plan treatments.

- **Key Concept:** Risk score calculation is based on Likelihood x Impact, generating colored severity badges (Low, Medium, High, Critical). Users can either log custom risks from scratch or utilize pre-built, industry-specific Risk Templates from the shared library to populate their registers instantly.
- **Workflow Steps:** Launch the Risk Wizard → Assess & Score the Threat → Plan Treatment (Mitigate, Accept, Transfer, or Avoid) → Choose Applicable Framework Controls → Schedule Mitigation Tasks with clear timelines.

### 7.2 Policy Management

Your security program is defined by its policies. The Policy Module provides a version-controlled repository to ensure these documents remain active, reviewed, and updated.

- **Key Concept:** The Master List of Documents (MLD) acts as your central registry, tracking every policy required for your frameworks. It features a built-in AI Quality Check that evaluates uploaded files for completeness and compliance depth.
- **Workflow Steps:** Locate a policy requirement → Click Upload to attach your PDF/Doc → Monitor status shift from 'To Upload' to 'To Approve' → Conduct Admin Review and trigger the AI Quality check → Approve or Archive past versions to preserve the audit trail.

### 7.3 Audit Management

Internal and external reviews are simplified with the Audit Module, which maps audit actions directly to framework controls and provides tailored workspaces for administrators and auditors.

- **Key Concept:** The Phase Ratio Control is an interactive slider that automatically splits the timeframe between your audit's Opening and Closure meetings into three distinct, working-day phases (Documentation Audit, Practice Audit, and Reporting).
- **Workflow Steps:** Set audit scope and anchor dates → Drag the Phase Ratio slider to auto-generate phase windows → Assign auditors to controls (enforcing independence rules) → Conduct audit from the specialized Auditor View → Issue Corrective Action Plans (CAPs) for non-compliant controls.

### 7.4 Task Management

The Task Module serves as the centralized execution engine of Calvant. It aggregates, tracks, and manages every tactical action generated across other platform modules.

- **Key Concept:** Centralization ensures that a mitigation task from a risk plan, a remediation item from an audit finding, or a review request from a policy document all appear in one unified 'To-Do, In-Progress, Done, On-Hold' backlog.
- **Workflow Steps:** Access the Action Plan → Assign tasks to departments or specific owners → Track progression via real-time status updates → Log detailed work logs and remarks directly inside the task details view.

### 7.5 Compliance Management

The Compliance Module is your real-time readiness dashboard, synthesizing data from all other activities to show your overall alignment with active regulatory frameworks.

- **Key Concept:** Live sync integration connects your compliance register with modern cloud infrastructures, pulling live evidence and calculating current status automatically.
- **Workflow Steps:** Open the Compliance Dashboard → Access the 'Detailed View' of unified controls → Trigger a 'Sync from Cloud' to refresh evidence parameters → Identify gaps and click 'Add CAP' to instantly create a remediation task.

### 7.6 Vendor Management

Secure your supply chain with Third-Party Risk Management (TPRM) tools, designed to evaluate and monitor external supplier compliance.

- **Key Concept:** The specialized Vendor Assessment Portal lets suppliers log in securely and respond directly to your custom compliance questionnaires, completely eliminating manual email files.
- **Workflow Steps:** Grant your vendor platform access → Open the TPRM Wizard → Select pre-built security questions from the shared question bank → Send assessment with a clear due date → Track progress on the dashboard and approve or reject submissions based on vendor answers.

### 7.7 Risk Assessments, Impact Assessments, and Others

Beyond general security audits, certain high-risk operational activities require specialized, proactive evaluations. Calvant provides guided wizards to systematically assess risks before operations go live.

- **Data Protection Impact Assessment (DPIA):** A specialized assessment designed for operations involving personal data. It guides you through a multi-stage review (PII Inventories, Personal Data Elements check, and regulatory questionnaires) to identify cybersec and compliance threats under GDPR or regional privacy frameworks.
- **AI Impact Assessment (AIIA):** Aligned with ISO 42001 and the EU AI Act, this impact assessment evaluates the introduction of AI and machine learning systems. It requires documenting the system's Business Objective, Intended Use, and assessing scenarios of Foreseeable Misuse to design appropriate guardrails and operational controls.

---

## 8. Operational Best Practices

To maximize the value of Calvant and maintain a pristine compliance posture, integrate these habits into your weekly operations:

- **Leverage Templates Early:** When adopting a new framework, populate your risk and policy modules using Calvant's pre-built libraries rather than drafting them from scratch.
- **Utilize the Phase Slider:** When planning an audit, rely on the Phase Ratio Control slider to calculate realistic phase timelines, and finalize anchor meeting dates before adjusting ratios.
- **Continuous Evidence Refreshes:** Before any internal review, use 'Sync from Cloud' and 'Refresh Snapshot' inside the Compliance Module to ensure your reports feature real-time data.
- **Collaborative Vendor Scoring:** Use the Vendor Status Guide to onboard external suppliers. Clearly explaining the 'Pending, Submitted, Under Review, Approved' lifecycle reduces communication friction.
- **Proactive Impact Assessments:** Initiate DPIAs and AIIAs during the design phase of new projects—never after deployment—so security and cybersec boundaries are built directly into systems.

---

## 9. FAQ

### 9.1 Frequently Asked Questions

**Q1: What is the difference between a general risk assessment and a DPIA/AIIA?**
A general risk assessment focuses on broad corporate threats (e.g., server downtime, physical security). DPIAs and AIIAs are specialized, deep-dive impact assessments focused on privacy compliance (for personal data processing) and AI governance (for algorithm deployments under frameworks like ISO 42001), respectively.

**Q2: Does archiving a policy delete it permanently?**
No. Calvant maintains a strict audit trail. Archiving removes a policy document from your active Master List of Documents (MLD) but safely stores it in the Archived Policies view with documented remarks and versions for external auditors.

**Q3: How does the Task Module integrate with other features?**
The Task Module is Calvant's execution layer. Anytime a risk needs mitigation, a policy requires editing, or an audit uncovers a gap, a task is created. These tasks are consolidated into a single backlog, keeping the entire compliance program moving forward.

---

## 10. Platform Readiness Quiz

Before starting your compliance journey on Calvant, take this quick self-assessment to test your platform knowledge:

1. Which module acts as the centralized execution layer where tasks from risk, audits, and policies are managed?
   Options: A) Compliance Module | B) Task Module | C) Policy Module | D) Vendor Module

2. What critical anchor parameters must be selected before Calvant's Audit Phase Ratio slider becomes active?
   Options: A) Auditor names | B) Opening and Closure Meeting Dates | C) Assigned departments | D) Framework tags

3. If a policy document is superseded by a newer version, how should you handle it in Calvant?
   Options: A) Delete it immediately | B) Archive it to preserve the audit trail | C) Leave it on the list | D) Ignore it

4. When introducing a new machine learning system, which specialized impact assessment should be triggered?
   Options: A) DPIA (Data Protection Impact Assessment) | B) Statement of Applicability (SoA) | C) AIIA (AI Impact Assessment) | D) General Threat Survey

5. How do you refresh real-time compliance metrics after uploading new evidence?
   Options: A) Log out and log back in | B) Click 'Sync from Cloud' and 'Refresh Snapshot' | C) Re-upload the policy | D) Create a new task

---

## 11. Answer Key & Explanations

1. **B.** The Task Module aggregates all mitigation and remediation activities into a single workspace.
2. **B.** The slider uses Opening and Closure dates to auto-calculate the Stage 1 and Stage 2 timeline.
3. **B.** Archiving removes the document from active lists while maintaining the version history for auditors.
4. **C.** An AIIA is specifically tailored to evaluate AI governance and foreseeable misuse under ISO 42001.
5. **B.** Sync and Snapshot refreshes compliance calculations based on current evidence.

  `;

  // ── useEffectiveOrg ───────────────────────────────────────────────────────
const {
    user, mounted, isPartnerOrg, isPartnerRoot, isOrgManager, managedOrgs,
    isViewingManagedOrg, isPrivilegedRole, isRoot, isRiskOwner, effectiveOrgId, effectiveOrgIds,
    selectedChildOrg, childOrgs, childOrgsLoading
  } = useEffectiveOrg();

  const showOrgSwitcher = isPartnerRoot || isOrgManager;

  useEffect(() => {
    if (mounted && !user) setSessionExpired(true);
  }, [mounted, user]);

  const handleSelectChildOrg = (org) => {
    sessionStorage.setItem("selectedChildOrg", JSON.stringify(org));
    window.dispatchEvent(new Event("childOrgChanged"));
    window.location.reload();
  };

  const handleClearChildOrg = () => {
    sessionStorage.removeItem("selectedChildOrg");
    window.dispatchEvent(new Event("childOrgChanged"));
    window.location.reload();
  };

  const navigateToModule = useCallback((route) => {
  if (showOrgSwitcher && !selectedChildOrg) {
    setPendingRoute(route);
    setOrgPickerOpen(true);
    return;
  }
  router.push(route);
}, [showOrgSwitcher, selectedChildOrg, router]);

const handlePickOrgForModule = (org) => {
  sessionStorage.setItem("selectedChildOrg", JSON.stringify(org));
  window.dispatchEvent(new Event("childOrgChanged"));
  setOrgPickerOpen(false);
  const route = pendingRoute;
  setPendingRoute(null);
  if (route) router.push(route);
};

  // Consolidates the array of IDs needed for external API loops
// Consolidates the array of IDs needed for external API loops
const orgIdsToFetch = useMemo(() => {
  if (selectedChildOrg) {
    return [String(selectedChildOrg._id || selectedChildOrg.id)];
  }

  if (isPartnerRoot || isOrgManager) {
    if (childOrgs.length > 0) {
      return childOrgs.map((o) => String(o._id || o.id));
    }
    if (isOrgManager && managedOrgs.length > 0) {
      return managedOrgs.map(String); // ← available immediately
    }
    // isPartnerRoot but childOrgs still loading → use own org as temp
    return effectiveOrgId ? [String(effectiveOrgId)] : [];
  }

  return effectiveOrgId ? [String(effectiveOrgId)] : [];
}, [isPartnerRoot, isOrgManager, selectedChildOrg, childOrgs, managedOrgs, effectiveOrgId]);

  // ── Idle / JWT timer ──────────────────────────────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const resetIdleTimer = () => { lastActivityRef.current = Date.now(); };
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));
    idleTimerRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= IDLE_TIMEOUT_MS && isJwtExpired(token)) {
        setSessionExpired(true);
        clearInterval(idleTimerRef.current);
      }
    }, 5000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      clearInterval(idleTimerRef.current);
    };
  }, []);

  // tprmEnabled fetch — uses effectiveOrgId
  useEffect(() => {
    if (!effectiveOrgId) return;
    fetch(`https://api.calvant.com/user-service/api/organizations`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.json())
      .then((orgs) => {
        const org = Array.isArray(orgs) ? orgs.find((o) => String(o._id) === String(effectiveOrgId)) : null;
        if (org && typeof org.tprmEnabled === "boolean") {
          setShowTprm(org.tprmEnabled);
          setOrgTprmEnabled(org.tprmEnabled);
        }
      })
      .catch((err) => console.error("Failed to fetch org for tprmEnabled:", err));
  }, [effectiveOrgId]);

  // ── Click-outside handler ─────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showChangePassword) return;
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setFrameworkOpen(false);
        setTemplatesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showChangePassword]);

  // ── Joyride ───────────────────────────────────────────────────────────────
  const tourSteps = [
    { target: "#compliance-module", content: "Real-time compliance summary." },
    { target: "#risk-module", content: "Overview of risks in your department." },
    { target: "#task-module", content: "Tasks assigned to you." },
    { target: "#gap-module", content: "Gap Assessment against standards." },
    { target: "#doc-module", content: "Compliance document upload status." },
  ];
  const handleJoyrideCallback = ({ status }) => {
    if (["finished", "skipped"].includes(status)) setRunTour(false);
  };

  // ── Framework context ─────────────────────────────────────────────────────
  const { selectedFrameworks, isAllSelected, availableFrameworks, showDpia, showAiia } = useFramework();
  const { dpia: dpiaEntitled, aiia: aiiaEntitled, vendor: vendorEntitled } = useModuleEntitlements();

  const displayDpia = dpiaEntitled || showDpia;
  const displayAiia = aiiaEntitled || showAiia;
  // showTprm previously only turned true from the legacy Organization.tprmEnabled
  // flag (fetched below) — a field the OLD manual admin-panel org-configuration
  // flow used to set by hand. Self-serve/billing-driven signups never write it,
  // so a genuinely paid-for Vendor Mgmt add-on stayed hidden with no way to turn
  // it on. Billing-service's entitlement is the real source of truth now (same
  // decision already made for the Integrations page), so auto-show the card the
  // moment the add-on is entitled; the toggle below still lets someone hide it.
  useEffect(() => {
    if (vendorEntitled) setShowTprm(true);
  }, [vendorEntitled]);

  const fwLabelToCode = useMemo(() => Object.fromEntries(availableFrameworks.map((fw) => [fw.id, fw.code])), [availableFrameworks]);
  const complianceFrameworkCodes = useMemo(() => availableFrameworks.map((fw) => fw.code), [availableFrameworks]);

  // ── API error handler ─────────────────────────────────────────────────────
  const handleApiError = useCallback((error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      setSessionExpired(true);
      return true;
    }
    return false;
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ══════════════════════════════════════════════════════════════════════════

  // ── RISK ──────────────────────────────────────────────────────────────────
  const [allRisks, setAllRisks] = useState([]);

  const loadRiskStats = useCallback(async () => {
    if (!effectiveOrgId) return;
    try {
      const [risks, departmentsList] = await Promise.all([
        riskService.getAllRisks(),
        getDepartments().catch(() => []),
      ]);
      if (!Array.isArray(risks)) return;
      const seeAll = isPrivilegedRole || isViewingManagedOrg;
      const userDepts = getUserDepartments(user);
      setAllRisks(
        risks.filter((risk) => {
          if (!isSameOrg(risk.organization, effectiveOrgId)) {
            return false;
          }
          if (seeAll) return true;
          return matchesDepartment(risk.department, userDepts, departmentsList);
        })
      );
    } catch (err) {
      handleApiError(err);
    }
  }, [user, handleApiError, effectiveOrgId, isPrivilegedRole, isRiskOwner, isViewingManagedOrg]);

  useEffect(() => { loadRiskStats(); }, [loadRiskStats]);

  const allowedRiskTypesForDashboard = useMemo(() => {
    if (isAllSelected) return null;
    const activeCodes = new Set();
    selectedFrameworks.forEach((fw) => {
      const code = fwLabelToCode[fw];
      if (code) activeCodes.add(code);
    });
    return _getAllowedRiskTypes(activeCodes);
  }, [selectedFrameworks, isAllSelected, fwLabelToCode]);

  const filteredRisks = useMemo(() => {
    if (!allowedRiskTypesForDashboard) return allRisks;
    return allRisks.filter((r) => _riskMatchesFilter(r, allowedRiskTypesForDashboard));
  }, [allRisks, allowedRiskTypesForDashboard]);

  const riskStats = useMemo(() => filteredRisks.reduce((acc, risk) => {
    acc.total++;
    let score = 0;
    if (risk.status?.toLowerCase() === "closed") {
      score = parseInt(risk.likelihoodAfterTreatment || 0) * parseInt(risk.impactAfterTreatment || 0);
    } else {
      const impact = Math.max(parseInt(risk.confidentiality) || 0, parseInt(risk.integrity) || 0, parseInt(risk.availability) || 0);
      score = impact * (parseInt(risk.probability) || 0);
    }
    const level = score <= 3 ? "low" : score <= 8 ? "medium" : "high";
    acc[level]++;
    risk.status?.toLowerCase() === "closed" ? acc.closed++ : acc.open++;
    return acc;
  }, { total: 0, low: 0, medium: 0, high: 0, open: 0, closed: 0 }), [filteredRisks]);

  // ── DOCUMENTATION ─────────────────────────────────────────────────────────
  const [documentStats, setDocumentStats] = useState({ total: 0, uploaded: 0, pending: 0 });

  const getTotalFromBackendControls = useCallback((controls, currentUser) => {
    const roles = Array.isArray(currentUser?.role) ? currentUser.role : [currentUser?.role];
    const isAdmin = roles.some((r) => ["root", "super_admin", "ciso", "dpo", "aio"].includes(r));
    const userDeptNames = (currentUser?.departments || []).map((d) => (d.name || "").toLowerCase());
    const docsSet = new Set();
    controls.forEach((ctrl) => {
      if (!ctrl.documents?.length) return;
      const ctrlDepts = (ctrl.departmentIds || []).map((d) => (d || "").toLowerCase());
      const docDepts = ctrl.documents.map((d) => (d.dept || "").toLowerCase()).filter(Boolean);
      const allDepts = [...ctrlDepts, ...docDepts];
      const hasAccess = isAdmin || allDepts.length === 0 || allDepts.some((d) => userDeptNames.includes(d));
      if (!hasAccess) return;
      ctrl.documents.forEach(({ doc }) => { if (doc) docsSet.add(doc); });
    });
    return docsSet.size;
  }, []);

  const loadDocumentStats = useCallback(async () => {
    if (!user) return;
    try {
      const activeFWCodes = isAllSelected
        ? availableFrameworks.map((fw) => _normalizeFrameworkCode(fw.code))
        : selectedFrameworks.map(_normalizeFrameworkCode);

      const [docs, soaList, ...controlResults] = await Promise.all([
        documentationService.getDocuments().catch(() => []),
        documentationService.getSoAEntries().catch(() => []),
        ...availableFrameworks.map((fw) => controlService.getControlsByFramework(fw.code).catch(() => [])),
      ]);

      const soaFrameworkMap = {};
      (soaList || []).forEach((soa) => { if (soa.id) soaFrameworkMap[String(soa.id)] = soa.framework; });

      const orgDocs = (docs || [])
        .filter((d) => effectiveOrgIds.has(String(d.organization)))
        .map((doc) => ({
          ...doc,
          framework: soaFrameworkMap[String(doc.soaId)] || doc.framework || null,
        }));

      const frameworkDocs = orgDocs.filter((doc) => activeFWCodes.includes(_normalizeFrameworkCode(doc.framework)));

      const frameworkControls = availableFrameworks
        .flatMap((fw, i) => (controlResults[i] || []).map((c) => ({ ...c, _fw: _normalizeFrameworkCode(fw.code) })))
        .filter((ctrl) => activeFWCodes.includes(ctrl._fw));

      const totalRequired = getTotalFromBackendControls(frameworkControls, user);
      const uploaded = frameworkDocs.filter((doc) => !!doc.url).length;

      setDocumentStats({ total: totalRequired, uploaded, pending: Math.max(0, totalRequired - uploaded) });
    } catch (err) {
      handleApiError(err);
    }
  }, [user, selectedFrameworks, isAllSelected, availableFrameworks, getTotalFromBackendControls, handleApiError, effectiveOrgIds]);

  useEffect(() => { loadDocumentStats(); }, [loadDocumentStats]);

  // ── GAP & AUDITS ──────────────────────────────────────────────────────────
  const [allAudits, setAllAudits] = useState([]);
  const [allGaps, setAllGaps] = useState([]);
  const [allControlsForGap, setAllControlsForGap] = useState([]);

  const loadGapStats = useCallback(async () => {
    if (orgIdsToFetch.length === 0) return;
    try {
      const auditArrays = await Promise.all(
        orgIdsToFetch.map((id) =>
          fetch(`https://api.calvant.com/audit/api/audits?organization=${encodeURIComponent(id)}`, {
            headers: { "Content-Type": "application/json" },
          }).then((r) => r.json()).catch(() => [])
        )
      );
      const auditsRaw = auditArrays.flat();

      const [gaps, ...controlResults] = await Promise.all([
        gapService.getGaps().catch(() => []),
        ...availableFrameworks.map((fw) => controlService.getControlsByFramework(fw.code).catch(() => [])),
      ]);

      setAllAudits(Array.isArray(auditsRaw) ? auditsRaw : []);
      setAllGaps(gaps);
      setAllControlsForGap(availableFrameworks.flatMap((fw, i) => (controlResults[i] || []).map((c) => ({ ...c, _fw: _normalizeFrameworkCode(fw.code) }))));
    } catch (err) {
      handleApiError(err);
    }
  }, [availableFrameworks, handleApiError, orgIdsToFetch]);

  useEffect(() => { loadGapStats(); }, [loadGapStats]);

  const auditStats = useMemo(() => {
    const activeFWCodes = isAllSelected
      ? availableFrameworks.map((fw) => _normalizeFrameworkCode(fw.code))
      : selectedFrameworks.map(_normalizeFrameworkCode);

    const filtered = allAudits.filter((a) => _auditMatchesFrameworks(a, activeFWCodes));

    const totalFindings = filtered.reduce(
      (sum, a) => sum + (Array.isArray(a.findings) ? a.findings.length : 0),
      0
    );

    return {
      total: filtered.length,
      planned: filtered.filter((a) => (a.status || "").toUpperCase() === "PLANNED").length,
      inProgress: filtered.filter((a) => (a.status || "").toUpperCase() === "IN_PROGRESS").length,
      completed: filtered.filter((a) => (a.status || "").toUpperCase() === "COMPLETED").length,
      findings: totalFindings,
    };
  }, [allAudits, selectedFrameworks, isAllSelected, availableFrameworks]);

  const gapStats = useMemo(() => {
    const seeAll = isPrivilegedRole || isViewingManagedOrg;
    const deptNames = (user?.departments || []).map((d) => (d.name || "").trim().toLowerCase());
    const activeFWCodes = isAllSelected ? availableFrameworks.map((fw) => _normalizeFrameworkCode(fw.code)) : selectedFrameworks.map(_normalizeFrameworkCode);
    const filteredControls = allControlsForGap.filter((c) => activeFWCodes.includes(c._fw));

    const totalCount = filteredControls.reduce((acc, item) => {
      const itemDepts = (item.departmentIds || item.departments || []).map((d) => (typeof d === "string" ? d : d.name || d).trim().toLowerCase());
      const hasAccess = isPrivilegedRole || itemDepts.some((d) => deptNames.includes(d));
      return hasAccess ? acc + (item.auditQuestions?.length || 1) : acc;
    }, 0);

    const filteredGaps = allGaps.filter((g) => {
      if (!effectiveOrgIds.has(String(g.organization?._id || g.organization))) return false;
      if (seeAll) return true;
      return deptNames.includes(String(g.department || "").trim().toLowerCase());
    });

    const closedCount = filteredGaps.filter((g) => (g.docScore !== "" && g.docScore !== undefined) || (g.practiceScore !== "" && g.practiceScore !== undefined)).length;

    return { total: totalCount, closed: closedCount, open: Math.max(0, totalCount - closedCount) };
  }, [allGaps, allControlsForGap, user, selectedFrameworks, isAllSelected, availableFrameworks, effectiveOrgIds, isPrivilegedRole, isViewingManagedOrg]);

  // ── FRAMEWORK COMPLIANCE ──────────────────────────────────────────────────
  const [frameworkComplianceData, setFrameworkComplianceData] = useState({});

  useEffect(() => {
    if (complianceFrameworkCodes.length === 0) return;
    let cancelled = false;
    Promise.all(
      complianceFrameworkCodes.map(async (fw) => {
        try {
          const result = await getFrameworkCompliance(fw);
          return [fw, { fullyCompliant: result.compliant ?? 0, nonCompliant: result.nonCompliant ?? 0, partial: result.partial ?? 0, totalControls: result.totalControls ?? 0 }];
        } catch {
          return [fw, { fullyCompliant: 0, nonCompliant: 0, partial: 0, totalControls: 0 }];
        }
      })
    ).then((results) => { if (!cancelled) setFrameworkComplianceData(Object.fromEntries(results)); });
    return () => { cancelled = true; };
  }, [complianceFrameworkCodes]);

  const filteredFrameworkCompliance = useMemo(() => {
    if (isAllSelected) return frameworkComplianceData;
    const activeKeys = new Set(selectedFrameworks.map((fw) => fwLabelToCode[fw]).filter(Boolean));
    return Object.fromEntries(Object.entries(frameworkComplianceData).filter(([k]) => activeKeys.has(k)));
  }, [frameworkComplianceData, selectedFrameworks, isAllSelected, fwLabelToCode]);

  const fwTotal = useMemo(() => Object.values(filteredFrameworkCompliance).reduce((s, f) => s + f.totalControls, 0), [filteredFrameworkCompliance]);
  const fwCompliant = useMemo(() => Object.values(filteredFrameworkCompliance).reduce((s, f) => s + f.fullyCompliant, 0), [filteredFrameworkCompliance]);
  const fwPartial = useMemo(() => Object.values(filteredFrameworkCompliance).reduce((s, f) => s + (f.partial || 0), 0), [filteredFrameworkCompliance]);
  const fwNonCompliant = useMemo(() => Object.values(filteredFrameworkCompliance).reduce((s, f) => s + (f.nonCompliant || 0), 0), [filteredFrameworkCompliance]);

  // ── TASKS ─────────────────────────────────────────────────────────────────
  // Total / Completed / Overdue / Due Soon — visibility rule: root sees the
  // whole org's tasks; everyone else sees only tasks assigned to them.
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, overdue: 0, dueSoon: 0 });

  const loadTaskStats = useCallback(async () => {
    try {
      const tasks = await taskService.getAllTasks();
      if (!Array.isArray(tasks) || !user) return;

      const orgTasks = tasks.filter((t) => effectiveOrgIds.has(String(t.organization?._id || t.organization)));

      const visibleTasks = isRoot
        ? orgTasks
        : orgTasks.filter((t) => {
            const emp = t.employee;
            if (!emp) return false;
            return (
              String(emp) === String(user?._id || user?.id) ||
              emp === user?.name ||
              emp === user?.username
            );
          });

      setTaskStats({
        total: visibleTasks.length,
        completed: visibleTasks.filter((t) => t.status === "Done").length,
        overdue: visibleTasks.filter(_isTaskOverdue).length,
        dueSoon: visibleTasks.filter(_isTaskDueSoon).length,
      });
    } catch (err) {
      console.error("Error loading task stats:", err);
    }
  }, [user, effectiveOrgIds, isRoot]);

  useEffect(() => { loadTaskStats(); }, [loadTaskStats]);

  // ── TPRM ──────────────────────────────────────────────────────────────────
  const [tprmStats, setTprmStats] = useState({ total: 0, draft: 0, sent: 0, submitted: 0, approved: 0, rejected: 0 });
  
  const loadTprmStats = useCallback(async () => {
    if (orgIdsToFetch.length === 0) return;
    try {
      if (orgIdsToFetch.length > 1) {
        const results = await Promise.all(
          orgIdsToFetch.map((id) =>
            tprmService.getStats(id).catch(() => ({ total: 0, draft: 0, sent: 0, submitted: 0, approved: 0, rejected: 0 }))
          )
        );
        const aggregated = results.reduce((acc, r) => ({
          draft: acc.draft + (r.draft || 0),
          sent: acc.sent + (r.sent || 0),
          submitted: acc.submitted + (r.submitted || 0),
          approved: acc.approved + (r.approved || 0),
          rejected: acc.rejected + (r.rejected || 0),
        }), { draft: 0, sent: 0, submitted: 0, approved: 0, rejected: 0 });
        aggregated.total = aggregated.draft + aggregated.sent + aggregated.submitted + aggregated.approved + aggregated.rejected;
        setTprmStats(aggregated);
      } else {
        const r = await tprmService.getStats(orgIdsToFetch[0]);
        const draft = r.draft || 0;
        const sent = r.sent || 0;
        const submitted = r.submitted || 0;
        const approved = r.approved || 0;
        const rejected = r.rejected || 0;
        setTprmStats({
          draft,
          sent,
          submitted,
          approved,
          rejected,
          total: draft + sent + submitted + approved + rejected
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [orgIdsToFetch]);

  useEffect(() => { loadTprmStats(); }, [loadTprmStats]);

  // ── DPIA ──────────────────────────────────────────────────────────────────
  const [dpiaStats, setDpiaStats] = useState({ total: 0, submitted: 0, inProgress: 0, draft: 0, highRisk: 0 });

  const loadDpiaStats = useCallback(async () => {
    if (orgIdsToFetch.length === 0) return;
    try {
      const allDpias = (await Promise.all(orgIdsToFetch.map((id) => getAllAssessments(id).catch(() => [])))).flat();
      setDpiaStats({
        total: allDpias.length,
        submitted: allDpias.filter((d) => d.status === "SUBMITTED").length,
        inProgress: allDpias.filter((d) => d.status === "IN_PROGRESS").length,
        draft: allDpias.filter((d) => d.status === "DRAFT").length,
        highRisk: allDpias.filter((d) => d.overallRiskLevel === "HIGH").length,
      });
    } catch (err) {
      console.error("Error loading DPIA stats:", err);
    }
  }, [orgIdsToFetch]);

  useEffect(() => { loadDpiaStats(); }, [loadDpiaStats]);

  // ── AIIA ──────────────────────────────────────────────────────────────────
  const [aiiaStats, setAiiaStats] = useState({ total: 0, approved: 0, submitted: 0, draft: 0, pending: 0 });

  const loadAiiaStats = useCallback(async () => {
    try {
      const assessments = (await stage1Api.getAll())?.data?.data || [];
      setAiiaStats({
        total: assessments.length,
        approved: assessments.filter((a) => a.status === "APPROVED").length,
        submitted: assessments.filter((a) => a.status === "SUBMITTED").length,
        draft: assessments.filter((a) => a.status === "DRAFT").length,
        pending: assessments.filter((a) => a.status === "DRAFT" || a.status === "SUBMITTED").length,
      });
    } catch (err) {
      console.error("Error loading AIIA stats:", err);
    }
  }, []);

  useEffect(() => { loadAiiaStats(); }, [loadAiiaStats]);

  // ══════════════════════════════════════════════════════════════════════════
  // DERIVED VALUES
  // ══════════════════════════════════════════════════════════════════════════

  const getPieChartData = (data) => data.every((d) => !d.value) ? [{ name: "No Data", value: 1, color: "#e2e8f0" }] : data;

  const visibleFwList = useMemo(() => availableFrameworks.filter((fw) => isAllSelected || selectedFrameworks.includes(fw.id)), [availableFrameworks, isAllSelected, selectedFrameworks]);

  const compColSpan = 2;

  const highlightedFwData = useMemo(() => {
    if (!activeFw) {
      return { label: "Overall Compliance", sub: "Combined average of active standards", fullyCompliant: fwCompliant, partial: fwPartial, nonCompliant: fwNonCompliant, totalControls: fwTotal, color: "#f43f5e" };
    }
    const fw = visibleFwList.find((f) => f.code === activeFw);
    const d = frameworkComplianceData[activeFw] ?? { fullyCompliant: 0, nonCompliant: 0, partial: 0, totalControls: 0 };
    return { label: fw?.label ?? activeFw, sub: fw?.sub || fw?.description || "Compliance standard status", fullyCompliant: d.fullyCompliant, partial: d.partial, nonCompliant: d.nonCompliant, totalControls: d.totalControls, color: fw?.color ?? "#f43f5e" };
  }, [activeFw, visibleFwList, frameworkComplianceData, fwCompliant, fwPartial, fwNonCompliant, fwTotal]);

  const showTprmActive = showTprm && vendorEntitled;
  const isAuditorOnly = isStrictAuditor(user);

  // Module breakdown contributions to ensure: Total = Pending + Completed
  // 1. Risks
  const riskTotalVal = isAuditorOnly ? 0 : riskStats.total;
  const riskPendingVal = isAuditorOnly ? 0 : riskStats.open;
  const riskCompletedVal = isAuditorOnly ? 0 : riskStats.closed;

  // 2. Audits
  const auditTotalVal = auditStats.total;
  const auditPendingVal = auditStats.planned + auditStats.inProgress;
  const auditCompletedVal = auditStats.completed;

  // 3. Compliance
  const complianceTotalVal = fwTotal;
  const compliancePendingVal = fwTotal - fwCompliant;
  const complianceCompletedVal = fwCompliant;

  // 4. Tasks
  const taskTotalVal = taskStats.total;
  const taskCompletedVal = taskStats.completed;
  const taskOverdueVal = taskStats.overdue;
  const taskOnTrackVal = Math.max(0, taskTotalVal - taskCompletedVal - taskOverdueVal);
  const taskPendingVal = taskOverdueVal + taskOnTrackVal;

  // 5. Documentation (Policies) - Capped to ensure exact math matching
  const docCompletedVal = isAuditorOnly ? 0 : Math.min(documentStats.uploaded, documentStats.total);
  const docPendingVal = isAuditorOnly ? 0 : documentStats.pending;
  const docTotalVal = isAuditorOnly ? 0 : (docCompletedVal + docPendingVal);

  // 6. DPIA
  const dpiaTotalVal = (displayDpia && !isAuditorOnly) ? (dpiaStats.submitted + dpiaStats.inProgress + dpiaStats.draft) : 0;
  const dpiaPendingVal = (displayDpia && !isAuditorOnly) ? (dpiaStats.inProgress + dpiaStats.draft) : 0;
  const dpiaCompletedVal = (displayDpia && !isAuditorOnly) ? dpiaStats.submitted : 0;

  // 7. AIIA
  const aiiaTotalVal = (displayAiia && !isAuditorOnly) ? (aiiaStats.pending + aiiaStats.approved) : 0;
  const aiiaPendingVal = (displayAiia && !isAuditorOnly) ? aiiaStats.pending : 0;
  const aiiaCompletedVal = (displayAiia && !isAuditorOnly) ? aiiaStats.approved : 0;

  // 8. TPRM
  const tprmTotalVal = (showTprmActive && !isAuditorOnly) ? (tprmStats.sent + tprmStats.submitted + tprmStats.draft + tprmStats.approved + tprmStats.rejected) : 0;
  const tprmPendingVal = (showTprmActive && !isAuditorOnly) ? (tprmStats.sent + tprmStats.submitted + tprmStats.draft) : 0;
  const tprmCompletedVal = (showTprmActive && !isAuditorOnly) ? (tprmStats.approved + tprmStats.rejected) : 0;

  // Overall sums
  const overallTotal = riskTotalVal + auditTotalVal + complianceTotalVal + taskTotalVal + docTotalVal + dpiaTotalVal + aiiaTotalVal + tprmTotalVal;
  const overallPending = riskPendingVal + auditPendingVal + compliancePendingVal + taskPendingVal + docPendingVal + dpiaPendingVal + aiiaPendingVal + tprmPendingVal;
  const overallCompleted = riskCompletedVal + auditCompletedVal + complianceCompletedVal + taskCompletedVal + docCompletedVal + dpiaCompletedVal + aiiaCompletedVal + tprmCompletedVal;

  const overallProgress = `${Math.round((overallCompleted / (overallTotal || 1)) * 100)}%`;

  const cardStyle = { height: `${CARD_H}px`, overflow: "hidden", boxSizing: "border-box" };

  // ── Loading spinner ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "120px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <div style={{ fontSize: 16, color: "#64748b", fontWeight: 500 }}>Loading dashboard…</div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  if (!mounted) return null;

  if (isPartnerOrg && childOrgsLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-page-bg">
      {/* Floating background blobs */}
      {[
        { top: "10%", left: "5%", size: "200px", color: "rgba(59,130,246,0.1)", anim: "6s" },
        { top: "60%", left: "80%", size: "150px", color: "rgba(139,92,246,0.08)", anim: "8s reverse" },
        { top: "70%", left: "50%", size: "100px", color: "rgba(16,185,129,0.06)", anim: "7s" },
      ].map(({ top, left, size, color, anim }, i) => (
        <div key={i} style={{ position: "absolute", top, left, width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, animation: `float ${anim} ease-in-out infinite`, pointerEvents: "none" }} />
      ))}

      <Joyride steps={tourSteps} run={runTour} callback={handleJoyrideCallback} continuous showSkipButton styles={{ options: { primaryColor: "#3b82f6", zIndex: 3000 } }} />

      <main style={{ flex: 1 }} className="w-full max-w-[1200px] mx-auto px-5 py-[10px] box-border overflow-x-visible lg:max-w-full lg:px-[14px] lg:pb-[50px] sm:px-3 sm:pb-[40px] 2xl:max-w-[1400px] 2xl:px-5 2xl:pt-8 2xl:pb-[70px]">
        {/* ── Partner Org Switcher Banner ─────────────────────────────── */}
        {isPartnerOrg && (
          <div style={{ marginBottom: 12, padding: "10px 16px", background: "white", borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldCheck size={16} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                  {selectedChildOrg ? "Viewing organization" : "Viewing consolidated data"}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                  {selectedChildOrg ? selectedChildOrg.name : "All Assigned Organizations"}
                </div>
              </div>
              {selectedChildOrg && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginLeft: 8 }}>
                  {(selectedChildOrg.frameworks || []).map((fw) => (
                    <span key={fw} style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>{fw}</span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select
                value={selectedChildOrg?._id || selectedChildOrg?.id || ""}
                onChange={(e) => {
                  if (!e.target.value) {
                    handleClearChildOrg();
                    return;
                  }
                  const org = childOrgs.find((o) => (o._id || o.id) === e.target.value);
                  if (org) handleSelectChildOrg(org);
                }}
                style={{ fontSize: 12, padding: "5px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: "#0f172a", cursor: "pointer", outline: "none" }}
              >
                <option value="">— All Assigned Organizations —</option>
                {childOrgs.map((org) => (
                  <option key={org._id || org.id} value={org._id || org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ── EXECUTIVE SUMMARY BANNER ──────────────────────────────────────── */}
        <motion.div
          initial={hasMounted ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-[1400px] mx-auto px-4 2xl:max-w-[1600px] w-full"
          style={{ marginBottom: "20px", position: "relative", zIndex: 40, boxSizing: "border-box" }}
        >
          <div className="stats-strip-container">
            {[
              {
                icon: <TrendingUp size={18} color="#1d4ed8" />,
                iconBg: "rgba(59, 130, 246, 0.1)",
                value: overallTotal,
                label: "Overall Activities",
                tipTitle: "Total Activities Breakdown",
                tipColor: "#1d4ed8",
                tip: [
                  `Risk Management: ${riskTotalVal}`,
                  `Audits: ${auditTotalVal}`,
                  `Compliance: ${complianceTotalVal}`,
                  `Task Management: ${taskTotalVal}`,
                  `Documentation: ${docTotalVal}`,
                  displayDpia && `DPIA: ${dpiaTotalVal}`,
                  displayAiia && `AIIA: ${aiiaTotalVal}`,
                  showTprmActive && `TPRM: ${tprmTotalVal}`
                ].filter(Boolean).join("\n"),
                tipPos: { top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "8px" }
              },
              {
                icon: <Activity size={18} color="#b45309" />,
                iconBg: "rgba(245, 158, 11, 0.1)",
                value: overallPending,
                label: "Pending Items",
                tipTitle: "Pending Items Breakdown",
                tipColor: "#b45309",
                tip: [
                  `Open Risks: ${riskPendingVal}`,
                  `Pending Audits: ${auditPendingVal}`,
                  `Non/Partial Compliance: ${compliancePendingVal}`,
                  `Pending Tasks: ${taskPendingVal} (Overdue: ${taskOverdueVal}, On Track: ${taskOnTrackVal})`,
                  `Pending Docs: ${docPendingVal}`,
                  displayDpia && `DPIA In-Progress/Draft: ${dpiaPendingVal}`,
                  displayAiia && `AIIA Pending: ${aiiaPendingVal}`,
                  showTprmActive && `TPRM Pending: ${tprmPendingVal}`
                ].filter(Boolean).join("\n"),
                tipPos: { top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "8px" }
              },
              {
                icon: <Award size={18} color="#047857" />,
                iconBg: "rgba(16, 185, 129, 0.1)",
                value: overallCompleted,
                label: "Completed Items",
                tipTitle: "Completed Items Breakdown",
                tipColor: "#047857",
                tip: [
                  `Closed Risks: ${riskCompletedVal}`,
                  `Completed Audits: ${auditCompletedVal}`,
                  `Compliant Controls: ${complianceCompletedVal}`,
                  `Completed Tasks: ${taskCompletedVal}`,
                  `Uploaded Docs: ${docCompletedVal}`,
                  displayDpia && `DPIA Submitted: ${dpiaCompletedVal}`,
                  displayAiia && `AIIA Approved: ${aiiaCompletedVal}`,
                  showTprmActive && `TPRM Approved/Rejected: ${tprmCompletedVal}`
                ].filter(Boolean).join("\n"),
                tipPos: { top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "8px" }
              },
              {
                icon: <Zap size={18} color="#6d28d9" />,
                iconBg: "rgba(139, 92, 246, 0.1)",
                value: overallProgress,
                label: "Overall Progress",
                tipTitle: "Overall Progress Calculation",
                tipColor: "#6d28d9",
                tip: `(${overallCompleted} / ${overallTotal || 1}) × 100`,
                tipPos: { top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "8px" }
              },
            ].map((card, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="stats-strip-divider" />}
                <div
                  className="stats-strip-item"
                  onMouseEnter={(e) => { const t = e.currentTarget.querySelector(".tip"); if (t) t.style.opacity = "1"; }}
                  onMouseLeave={(e) => { const t = e.currentTarget.querySelector(".tip"); if (t) t.style.opacity = "0"; }}
                >
                  <div className="stats-icon-container" style={{ background: card.iconBg }}>
                    {card.icon}
                  </div>
                  
                  <div style={{ minWidth: 0 }}>
                    <div className="stats-value">{card.value}</div>
                    <div className="stats-label">{card.label}</div>
                  </div>

                  <div className="tip" style={{
                    position: "absolute",
                    ...card.tipPos,
                    zIndex: 99999,
                    background: "rgba(15, 23, 42, 0.98)",
                    color: "white",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    fontSize: "11px",
                    width: "280px",
                    textAlign: "left",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    pointerEvents: "none",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.4)",
                    border: `1px solid ${card.tipColor}30`,
                    whiteSpace: "pre-line",
                    backdropFilter: "blur(12px)"
                  }}>
                    <div style={{ fontWeight: 800, marginBottom: 6, color: card.tipColor, fontSize: "12px" }}>{card.tipTitle}</div>
                    <div style={{ fontSize: 10, lineHeight: 1.6, color: "rgba(255, 255, 255, 0.9)" }}>{card.tip}</div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* ── MODULE CARDS GRID ─────────────────────────────────────────────── */}
        <div className="dashboard-grid max-w-[1400px] mx-auto 2xl:max-w-[1600px]" style={{ gridAutoRows: `${CARD_H}px` }}>
          {/* FRAMEWORK COMPLIANCE */}
          <motion.div id="compliance-module" initial={hasMounted ? { opacity: 0, y: 20 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className={`compliance-span-${compColSpan} module-card-premium accent-rose`} style={{ ...cardStyle }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg, #f43f5e, #e11d48)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck className="rotate-icon" size={18} color="white" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>Framework Compliance</h3>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{fwTotal}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>total controls</div>
              </div>
            </div>

            {visibleFwList.length === 0 ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, color: "#64748b", padding: 20, textAlign: "center" }}>
                <ShieldCheck size={40} color="#cbd5e1" />
                <div style={{ fontSize: 14, fontWeight: 600 }}>No Active Frameworks Selected</div>
                <div style={{ fontSize: 11, color: "#94a3b8", maxWidth: 280 }}>Select one or more compliance standards in the framework selector at the top.</div>
              </div>
            ) : visibleFwList.length === 1 ? (
              (() => {
                const fw = visibleFwList[0];
                const d = frameworkComplianceData[fw.code] ?? { fullyCompliant: 0, nonCompliant: 0, partial: 0, totalControls: 0 };
                const score = d.totalControls > 0 ? Math.round((d.fullyCompliant / d.totalControls) * 100) : 0;
                const tileColor = fw.color ?? "#f43f5e";
                return (
                  <div style={{ display: "flex", alignItems: "stretch", gap: 24, flex: 1, minHeight: 0, width: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, width: "150px" }}>
                      <CompliancePie compliant={d.fullyCompliant} nonCompliant={d.nonCompliant} partial={d.partial} size={120} fontSize="18px" />
                      <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5" style={{ background: score >= 80 ? "rgba(16,185,129,0.08)" : score >= 50 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)", color: score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444", border: score >= 80 ? "1px solid rgba(16,185,129,0.15)" : score >= 50 ? "1px solid rgba(245,158,11,0.15)" : "1px solid rgba(239,68,68,0.15)" }}>
                          <span className="breathing-status-dot" style={{ background: score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444" }} />
                          {score >= 80 ? "Optimized" : score >= 50 ? "Improving" : "At Risk"}
                        </span>
                      </div>
                    </div>
                    <div style={{ width: 1, background: "rgba(226,232,240,0.5)", flexShrink: 0, alignSelf: "stretch" }} />
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, justifyContent: "center" }}>
                      <span style={{ fontSize: "9px", fontWeight: 800, color: tileColor, textTransform: "uppercase", letterSpacing: "0.08em" }}>Active Compliance Standard</span>
                      <h4 style={{ fontSize: "19px", fontWeight: 800, color: "#1e293b", margin: "2px 0 4px 0", cursor: "pointer", display: "inline-block" }} onClick={() => navigateToModule("/compliances")}>{fw.label}</h4>
                      <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 12px 0", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fw.description || fw.sub || "Continuous security and compliance monitoring"}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 700, color: "#475569", marginBottom: "2px" }}>
                            <span>Compliant</span><span>{d.fullyCompliant} / {d.totalControls}</span>
                          </div>
                          <div className="sleek-progress-container">
                            <div className="sleek-progress-bar" style={{ width: `${d.totalControls > 0 ? (d.fullyCompliant / d.totalControls) * 100 : 0}%`, background: "#10b981" }} />
                          </div>
                        </div>
                        {d.partial > 0 && (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 700, color: "#475569", marginBottom: "2px" }}>
                              <span>Partial</span><span>{d.partial} / {d.totalControls}</span>
                            </div>
                            <div className="sleek-progress-container">
                              <div className="sleek-progress-bar" style={{ width: `${(d.partial / d.totalControls) * 100}%`, background: "#f59e0b" }} />
                            </div>
                          </div>
                        )}
                        {d.nonCompliant > 0 && (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 700, color: "#475569", marginBottom: "2px" }}>
                              <span>Non-Compliant</span><span>{d.nonCompliant} / {d.totalControls}</span>
                            </div>
                            <div className="sleek-progress-container">
                              <div className="sleek-progress-bar" style={{ width: `${(d.nonCompliant / d.totalControls) * 100}%`, background: "#ef4444" }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div style={{ display: "flex", alignItems: "stretch", gap: "20px", flex: 1, minHeight: 0, width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, flexShrink: 0, width: "155px" }}>
                  <CompliancePie compliant={highlightedFwData.fullyCompliant} nonCompliant={highlightedFwData.nonCompliant} partial={highlightedFwData.partial} size={110} fontSize="16px" />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%" }}>
                    <div style={{ fontSize: "11px", fontWeight: 850, color: highlightedFwData.color, textTransform: "uppercase", letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "150px" }}>{highlightedFwData.label}</div>
                    <div style={{ fontSize: "8.5px", color: "#94a3b8", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "150px", marginTop: "1px" }}>{highlightedFwData.sub}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: "8.5px", fontWeight: 700, color: "#475569", width: "100%", marginTop: "4px" }}>
                    {[{ color: "#10b981", label: "Compliant", val: highlightedFwData.fullyCompliant }, ...(highlightedFwData.partial > 0 ? [{ color: "#f59e0b", label: "Partial", val: highlightedFwData.partial }] : []), { color: "#ef4444", label: "Non-Compliant", val: highlightedFwData.nonCompliant }].map(({ color, label, val }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span className="breathing-status-dot" style={{ background: color, width: 5, height: 5 }} />{label}</span><span style={{ color: "#1e293b" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ width: 1, background: "rgba(226,232,240,0.5)", flexShrink: 0, alignSelf: "stretch" }} />
                <div className="custom-slim-scrollbar" style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: visibleFwList.length > 4 ? "auto" : "visible", overflowX: "hidden", paddingRight: visibleFwList.length > 4 ? "6px" : "0px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: visibleFwList.length <= 3 ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: visibleFwList.length === 2 ? "12px" : "8px" }}>
                    {visibleFwList.map((fw) => {
                      const d = frameworkComplianceData[fw.code] ?? { fullyCompliant: 0, nonCompliant: 0, partial: 0, totalControls: 0 };
                      const score = d.totalControls > 0 ? Math.round((d.fullyCompliant / d.totalControls) * 100) : 0;
                      const tileColor = fw.color ?? "#f43f5e";
                      const glowClass = fw.code.toLowerCase().replace(/[^a-z0-9]/g, "") + "-glow";
                      const isHovered = activeFw === fw.code;
                      const showInnerProgress = visibleFwList.length <= 3;
                      const cardHeight = visibleFwList.length === 2 ? "90px" : visibleFwList.length === 3 ? "56px" : "auto";
                      return (
                        <div key={fw.code} className={`framework-glass-card ${glowClass} ${isHovered ? "active-glow-item" : ""}`} style={{ padding: "8px 10px", borderRadius: "10px", gap: "10px", height: cardHeight, boxSizing: "border-box", display: "flex", alignItems: "center" }} onMouseEnter={() => setActiveFw(fw.code)} onMouseLeave={() => setActiveFw(null)} onClick={(e) => { e.stopPropagation(); navigateToModule("/compliances"); }}>
                          <CompliancePie compliant={d.fullyCompliant} nonCompliant={d.nonCompliant} partial={d.partial} size={visibleFwList.length === 2 ? 46 : 38} fontSize={visibleFwList.length === 2 ? "11px" : "9px"} showPercentage={true} />
                          <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "2px 0" }}>
                            <div>
                              <div style={{ fontSize: visibleFwList.length === 2 ? "12px" : "10px", fontWeight: 800, color: tileColor, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fw.label}</div>
                              <div style={{ fontSize: "7.5px", color: "#64748b", lineHeight: 1.1, marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fw.sub || fw.description}</div>
                            </div>
                            {showInnerProgress ? (
                              <div style={{ marginTop: "4px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}><span style={{ fontSize: visibleFwList.length === 2 ? "12px" : "10px", fontWeight: 800, color: "#1e293b" }}>{score}%</span><span style={{ fontSize: "8px", fontWeight: 600, color: "#94a3b8" }}>({d.fullyCompliant}/{d.totalControls})</span></div>
                                <div className="sleek-progress-container" style={{ height: "4px" }}><div className="sleek-progress-bar" style={{ width: `${score}%`, background: tileColor }} /></div>
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginTop: "2px" }}><span style={{ fontSize: "10px", fontWeight: 800, color: "#334155" }}>{score}%</span><span style={{ fontSize: "8px", fontWeight: 600, color: "#94a3b8" }}>({d.totalControls})</span></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* RISK */}
          {!isAuditorOnly && (
            <motion.div id="risk-module" initial={hasMounted ? { opacity: 0, y: 20 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} whileTap={{ scale: 0.98 }} onClick={() => navigateToModule("/risk-assessment")} className="module-card-premium accent-blue" style={{ ...cardStyle }}>
              <CardHeader icon={<BarChart3 size={20} color="white" />} iconGradient="linear-gradient(135deg, #3b82f6, #1d4ed8)" title="Risks" total={riskStats.total} totalLabel={isAllSelected ? "Total Risks" : "Filtered Risks"} filterTags selectedFWs={selectedFrameworks} isAllSelected={isAllSelected} tagBg="#e0f2fe" tagColor="#0369a1" tagBorder="#bae6fd" />
              <PieSection
                data={getPieChartData([
                  { name: "Low", value: riskStats.low, color: "#22c55e" },
                  { name: "Medium", value: riskStats.medium, color: "#f59e0b" },
                  { name: "High", value: riskStats.high, color: "#ef4444" }
                ])}
                legend={[["#22c55e", riskStats.low, "Low"], ["#f59e0b", riskStats.medium, "Med"], ["#ef4444", riskStats.high, "High"], ["#9ca3af", riskStats.open, "Open"]]}
                centerValue={riskStats.total}
                centerLabel="Total"
              />
            </motion.div>
          )}

          {/* TASK */}
          <motion.div id="task-module" initial={hasMounted ? { opacity: 0, y: 20 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} whileTap={{ scale: 0.98 }} onClick={() => navigateToModule("/task-management")} className="module-card-premium accent-amber" style={{ ...cardStyle }}>
            <CardHeader icon={<CheckSquare size={20} color="white" />} iconGradient="linear-gradient(135deg, #f59e0b, #d97706)" title="Tasks" total={taskStats.total} totalLabel="Total Tasks" filterTags={false} isAllSelected={isAllSelected} />
            <PieSection
              data={getPieChartData([
                { name: "Completed", value: taskStats.completed, color: "#22c55e" },
                { name: "Overdue", value: taskStats.overdue, color: "#ef4444" },
                { name: "On Track", value: taskOnTrackVal, color: "#f59e0b" },
              ])}
              legend={[
                ["#22c55e", taskStats.completed, "Done"],
                ["#ef4444", taskStats.overdue, "Overdue"],
                ["#f59e0b", taskOnTrackVal, "On Track"],
              ]}
              centerValue={taskStats.total}
              centerLabel="Total"
            />
          </motion.div>

          {/* AUDITS */}
          <motion.div id="gap-module" initial={hasMounted ? { opacity: 0, y: 20 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} whileTap={{ scale: 0.98 }} onClick={() => navigateToModule("/gap-assessment")} className="module-card-premium accent-green" style={{ ...cardStyle }}>
            <CardHeader icon={<ClipboardCheck size={16} color="white" />} iconGradient="linear-gradient(135deg, #10b981, #059669)" title="Audits" total={auditTotalVal} totalLabel={isAllSelected ? "Total Audits" : "Filtered Audits"} filterTags selectedFWs={selectedFrameworks} isAllSelected={isAllSelected} tagBg="#ecfdf5" tagColor="#059669" tagBorder="#d1fae5" />
            <PieSection
              data={getPieChartData([
                { name: "Planned", value: auditStats.planned, color: "#f59e0b" },
                { name: "In Progress", value: auditStats.inProgress, color: "#6366f1" },
                { name: "Completed", value: auditStats.completed, color: "#10b981" },
              ])}
              legend={[
                ["#f59e0b", auditStats.planned, "Planned"],
                ["#6366f1", auditStats.inProgress, "In Progress"],
                ["#10b981", auditStats.completed, "Completed"],
              ]}
              centerValue={auditTotalVal}
              centerLabel="Total"
            />
          </motion.div>

          {/* POLICIES */}
          {!isAuditorOnly && (
            <motion.div id="doc-module" initial={hasMounted ? { opacity: 0, y: 20 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} whileTap={{ scale: 0.98 }} onClick={() => navigateToModule("/documentation")} className="module-card-premium accent-violet" style={{ ...cardStyle }}>
              <CardHeader icon={<FileText size={16} color="white" />} iconGradient="linear-gradient(135deg, #8b5cf6, #7c3aed)" title="Policies" total={docTotalVal} totalLabel={isAllSelected ? "Total Policies" : "Filtered Policies"} filterTags selectedFWs={selectedFrameworks} isAllSelected={isAllSelected} tagBg="#f3e8ff" tagColor="#7c3aed" tagBorder="#ddd6fe" />
              <PieSection
                data={getPieChartData([
                  { name: "Uploaded", value: docCompletedVal, color: "#22c55e" },
                  { name: "Pending", value: docPendingVal, color: "#ef4444" }
                ])}
                legend={[["#22c55e", docCompletedVal, "Uploaded"], ["#ef4444", docPendingVal, "Pending"]]}
                centerValue={docTotalVal}
                centerLabel="Total"
              />
            </motion.div>
          )}

          {/* DPIA */}
          {displayDpia && !isAuditorOnly && (
            <motion.div id="dpia-module" initial={hasMounted ? { opacity: 0, y: 20 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} whileTap={{ scale: 0.98 }} onClick={() => navigateToModule("/dpia")} className="module-card-premium accent-sky" style={{ ...cardStyle }}>
              <CardHeader icon={<ShieldCheck size={16} color="white" />} iconGradient="linear-gradient(135deg, #0ea5e9, #0284c7)" title="DPIA" total={dpiaTotalVal} totalLabel="Total Assessments" filterTags={false} isAllSelected={isAllSelected} />
              <PieSection data={getPieChartData([{ name: "Submitted", value: dpiaStats.submitted, color: "#10b981" }, { name: "In Progress", value: dpiaStats.inProgress, color: "#6366f1" }, { name: "Draft", value: dpiaStats.draft, color: "#f59e0b" }])} legend={[["#10b981", dpiaStats.submitted, "Submitted"], ["#6366f1", dpiaStats.inProgress, "In Progress"], ["#f59e0b", dpiaStats.draft, "Draft"]]} centerValue={dpiaTotalVal} centerLabel="Total" />
            </motion.div>
          )}

          {/* TPRM */}
          {showTprm && vendorEntitled && !isAuditorOnly && (
            <motion.div id="tprm-module" initial={hasMounted ? { opacity: 0, y: 20 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} whileTap={{ scale: 0.98 }} onClick={() => navigateToModule("/tprm")} className="module-card-premium accent-indigo" style={{ ...cardStyle }}>
              <CardHeader icon={<ShieldCheck size={16} color="white" />} iconGradient="linear-gradient(135deg, #6366f1, #4f46e5)" title="TPRM" total={tprmTotalVal} totalLabel="Total Assessments" filterTags={false} isAllSelected={isAllSelected} />
              <PieSection
                data={getPieChartData([
                  { name: "Approved", value: tprmStats.approved, color: "#10b981" },
                  { name: "Submitted", value: tprmStats.submitted, color: "#f59e0b" },
                  { name: "Sent", value: tprmStats.sent, color: "#3b82f6" },
                  { name: "Rejected", value: tprmStats.rejected, color: "#ef4444" }
                ])}
                legend={[["#10b981", tprmStats.approved, "Approved"], ["#f59e0b", tprmStats.submitted, "Submitted"], ["#3b82f6", tprmStats.sent, "Sent"]]}
                centerValue={tprmTotalVal}
                centerLabel="Total"
              />
            </motion.div>
          )}

          {/* AIIA */}
          {displayAiia && !isAuditorOnly && (
            <motion.div id="aiia-module" initial={hasMounted ? { opacity: 0, y: 20 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }} whileTap={{ scale: 0.98 }} onClick={() => navigateToModule("/aiia")} className="module-card-premium accent-fuchsia" style={{ ...cardStyle }}>
              <CardHeader icon={<Brain size={16} color="white" />} iconGradient="linear-gradient(135deg, #d946ef, #a21caf)" title="AIIA" total={aiiaTotalVal} totalLabel="Total Assessments" filterTags={false} isAllSelected={isAllSelected} />
              <PieSection data={getPieChartData([{ name: "Approved", value: aiiaStats.approved, color: "#10b981" }, { name: "Submitted", value: aiiaStats.submitted, color: "#6366f1" }, { name: "Draft", value: aiiaStats.draft, color: "#f59e0b" }])} legend={[["#10b981", aiiaStats.approved, "Approved"], ["#6366f1", aiiaStats.submitted, "Submitted"], ["#f59e0b", aiiaStats.draft, "Draft"]]} centerValue={aiiaTotalVal} centerLabel="Total" />
            </motion.div>
          )}
        </div>
      </main>

      <HelpDocModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        docs={INTRO_DOCS}
        initialDocId="intro"
      />

      {orgPickerOpen && (
  <div
    style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5000 }}
    onClick={() => { setOrgPickerOpen(false); setPendingRoute(null); }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ background: "white", borderRadius: 12, padding: 24, width: 360, maxWidth: "90vw", maxHeight: "70vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0" }}>
        Select an organization
      </h3>
      <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 16px 0" }}>
        You're viewing consolidated data across multiple organizations. Choose one to continue.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {childOrgs.length === 0 && (
          <div style={{ fontSize: 12, color: "#94a3b8", padding: "8px 0" }}>
            Loading organizations…
          </div>
        )}
        {childOrgs.map((org) => (
          <button
            key={org._id || org.id}
            onClick={() => handlePickOrgForModule(org)}
            style={{ textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#0f172a" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#eef2ff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
          >
            {org.name}
          </button>
        ))}
      </div>
      <button
        onClick={() => { setOrgPickerOpen(false); setPendingRoute(null); }}
        style={{ marginTop: 16, width: "100%", padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
      >
        Cancel
      </button>
    </div>
  </div>
)}

      <footer className="w-full bg-white border-t border-gray-200 mt-auto px-4 py-5 sm:px-3 sm:py-4">
        <div className="w-full max-w-[1400px] mx-auto 2xl:max-w-[1600px]">
          <div className="flex justify-center items-center gap-3 mt-2">
            {(orgTprmEnabled || vendorEntitled) && (
              <button onClick={() => setShowTprm((v) => !v)} className="px-3 py-1.5 text-xs font-semibold bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors flex items-center gap-1.5">
                {showTprm ? "Hide" : "Show"} TPRM
              </button>
            )}
            <div className="text-gray-400 text-[13px] leading-6 tracking-[0.3px] sm:text-[12px] 2xl:text-[14px]">
              © {new Date().getFullYear()} CalVant. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLoggedIn;
