// docs/introDocs.js

export const INTRO_DOCS = {
  intro: {
    title: "Introduction to CalVant",
    content: `
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

[→ Full Risk Module guide](doc:risk-management)

### 7.2 Policy Management

Your security program is defined by its policies. The Policy Module provides a version-controlled repository to ensure these documents remain active, reviewed, and updated.

- **Key Concept:** The Master List of Documents (MLD) acts as your central registry, tracking every policy required for your frameworks. It features a built-in AI Quality Check that evaluates uploaded files for completeness and compliance depth.
- **Workflow Steps:** Locate a policy requirement → Click Upload to attach your PDF/Doc → Monitor status shift from 'To Upload' to 'To Approve' → Conduct Admin Review and trigger the AI Quality check → Approve or Archive past versions to preserve the audit trail.

[→ Full Policy Module guide](doc:policy-management)

### 7.3 Audit Management

Internal and external reviews are simplified with the Audit Module, which maps audit actions directly to framework controls and provides tailored workspaces for administrators and auditors.

- **Key Concept:** The Phase Ratio Control is an interactive slider that automatically splits the timeframe between your audit's Opening and Closure meetings into three distinct, working-day phases (Documentation Audit, Practice Audit, and Reporting).
- **Workflow Steps:** Set audit scope and anchor dates → Drag the Phase Ratio slider to auto-generate phase windows → Assign auditors to controls (enforcing independence rules) → Conduct audit from the specialized Auditor View → Issue Corrective Action Plans (CAPs) for non-compliant controls.

[→ Full Audit Module guide](doc:audit-management)

### 7.4 Task Management

The Task Module serves as the centralized execution engine of Calvant. It aggregates, tracks, and manages every tactical action generated across other platform modules.

- **Key Concept:** Centralization ensures that a mitigation task from a risk plan, a remediation item from an audit finding, or a review request from a policy document all appear in one unified 'To-Do, In-Progress, Done, On-Hold' backlog.
- **Workflow Steps:** Access the Action Plan → Assign tasks to departments or specific owners → Track progression via real-time status updates → Log detailed work logs and remarks directly inside the task details view.

[→ Full Task Module guide](doc:task-management)

### 7.5 Compliance Management

The Compliance Module is your real-time readiness dashboard, synthesizing data from all other activities to show your overall alignment with active regulatory frameworks.

- **Key Concept:** Live sync integration connects your compliance register with modern cloud infrastructures, pulling live evidence and calculating current status automatically.
- **Workflow Steps:** Open the Compliance Dashboard → Access the 'Detailed View' of unified controls → Trigger a 'Sync from Cloud' to refresh evidence parameters → Identify gaps and click 'Add CAP' to instantly create a remediation task.

[→ Full Compliance Module guide](doc:compliance-management)

### 7.6 Vendor Management

Secure your supply chain with Third-Party Risk Management (TPRM) tools, designed to evaluate and monitor external supplier compliance.

- **Key Concept:** The specialized Vendor Assessment Portal lets suppliers log in securely and respond directly to your custom compliance questionnaires, completely eliminating manual email files.
- **Workflow Steps:** Grant your vendor platform access → Open the TPRM Wizard → Select pre-built security questions from the shared question bank → Send assessment with a clear due date → Track progress on the dashboard and approve or reject submissions based on vendor answers.

[→ Full Vendor / TPRM Module guide](doc:vendor-management)

### 7.7 Risk Assessments, Impact Assessments, and Others

Beyond general security audits, certain high-risk operational activities require specialized, proactive evaluations. Calvant provides guided wizards to systematically assess risks before operations go live.

- **Data Protection Impact Assessment (DPIA):** A specialized assessment designed for operations involving personal data. It guides you through a multi-stage review (PII Inventories, Personal Data Elements check, and regulatory questionnaires) to identify cybersec and compliance threats under GDPR or regional privacy frameworks.
- **AI Impact Assessment (AIIA):** Aligned with ISO 42001 and the EU AI Act, this impact assessment evaluates the introduction of AI and machine learning systems. It requires documenting the system's Business Objective, Intended Use, and assessing scenarios of Foreseeable Misuse to design appropriate guardrails and operational controls.

[→ DPIA & AIIA detailed guide](doc:impact-assessments)

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
`,
  },

  "risk-management": {
    title: "Risk Module Guide",
    content: `
# CalVant
### Digital Compliance Management — Risk Module
**End-User Guide**

A step-by-step guide to identifying, assessing, treating, and tracking risks in CalVant

Version 1.0 | July 2026
© 2026 CalVant. All rights reserved.

---

## Table of Contents

1. Introduction
2. Accessing the Risk Module
3. Key Terminology
4. Manual Navigation
   - 4.1 Risk Dashboard
   - 4.2 Creating a New Risk
     - 4.2.1 Step 1 — Risk Assessment
     - 4.2.2 Step 2 — Treatment Planning
     - 4.2.3 Step 3 — Task Management
   - 4.3 Using Risk Templates (Sample Risks)
   - 4.4 Viewing Saved Risk Assessments
   - 4.5 Viewing Tasks
   - 4.6 Generating a Statement of Applicability (SoA)
5. Status & Quality Reference
6. Tips, Best Practices & Troubleshooting

---

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

[← Back to Introduction](doc:intro)
`,
  },

  "policy-management": {
    title: "Policy Module Guide",
    content: `
# CalVant
### Digital Compliance Management — Policy Module
**End-User Guide**
Version 1.0 | July 2026
© 2026 CalVant. All rights reserved.

---

## Table of Contents

1. Introduction
2. Accessing the Policy Module
3. Key Terminology
4. Manual Navigation
   - 4.1 Policies Dashboard
   - 4.2 Policies List View (Master List of Documents)
   - 4.3 Uploading a Policy Document
   - 4.4 Reviewing, Approving & Quality Check
   - 4.5 Creating a Task
   - 4.6 Archiving Policies
5. Status & Quality Reference
6. Tips, Best Practices & Troubleshooting

---

## 1. Introduction

The Policy Module in CalVant helps you create, upload, review, approve, and track the policy documents required for your compliance and information security program. It maps every policy to the controls in frameworks such as ISO 27001, ISO 27701, SOC 2, ISO 42001, and PDPL, and keeps a version-controlled record of what has been submitted, reviewed, and archived.

## 2. Accessing the Policy Module

After logging in to CalVant, use the left-hand navigation sidebar to move between modules. The sidebar gives you access to the Home/Dashboard, Risk, Policy, Audit, and other Task modules, along with account settings at the bottom.

1. Click the Policy icon in the sidebar to land on your Policies Dashboard.
2. Your logged-in user name and role (e.g., Root) appear in the top-right of the dashboard header.

## 3. Key Terminology

A short list of terms that are specific to CalVant's policy workflow rather than self-explanatory from the screen itself:

| Term | Definition |
|---|---|
| MLD (Master List of Documents) | The complete, filterable list of every policy record in the system — CalVant's working name for the Policies list screen. |
| SoA Linked | A policy connected to an entry in the Statement of Applicability, shown in the header stats and as a green SoA tag on each row. |

## 4. Manual Navigation

With the vocabulary in place, this section walks through every screen in the module in the order you'll use them day to day — starting at the dashboard and ending at the archive.

### 4.1 Policies Dashboard

The Policies Dashboard is your home base for the module. It gives you an at-a-glance summary of every policy in your organization, along with quick actions to browse, upload, and manage documents.

![Policy Dashboard overview](/Screenshots/Policy/policy-home.png)

1. **Summary tiles** — total policies, and counts by Uploaded, Pending, and Archived.
2. **Document Status** — a donut chart showing the proportion of uploaded versus pending documents.
3. **Upload Trends** — a bar chart of documents uploaded each month, filterable by year; shows "No Upload Data" until documents are uploaded.

The Quick Actions panel gives one-click access to the most common tasks. Master List of Documents, Upload Documents, and View Documents all open the same Policies list screen described in Section 4.2 — only the entry point differs. Archived is the one tile that opens a separate screen, covered in Section 4.6.

### 4.2 Policies List View (Master List of Documents)

Opening Master List of Documents, Upload Documents, or View Documents from the dashboard brings you to the same Policies screen: the working register of every policy in your organization.

![Policy Dashboard overview](/Screenshots/Policy/mld.png)

1. **Header stats** — Total, Uploaded, SoA Linked, and the count for the active framework (e.g., ISO 27001).
2. **Search bar** — find a policy by name, control ID, or C-ID.
3. **Uploaded filter chips** — switch between All, Uploaded, and Not Uploaded.
4. **Table columns** — Control ID, Policy Name, Related Framework, Type, Control Code, Ownership, Department, CalVant Version, and Status, followed by Submitted By, Submission Date, Approved By, Review Date, Upload, Remarks, Quality Check, and Add Task.

#### Sorting the List

Use the dropdown next to the search bar to reorder the table.

![MLD Sort overview](/Screenshots/Policy/mld-sort.png)

1. **By Framework** — groups policies in framework order: ISO 27001 → ISO 27701 → SOC 2 → ISO 42001 → PDPL.
2. **Policy Name (A → Z)** — alphabetical order.
3. **Control ID (↑ Asc / ↓ Desc, grouped by framework)** — orders rows by control reference.
4. **SoA Linked First** — surfaces policies already connected to the Statement of Applicability.
5. **SoA Date (Newest / Oldest)** — orders rows by when the SoA link was created.

### 4.3 Uploading a Policy Document

Each row in the Master List of Documents carries its own upload and workflow controls, visible on the right side of the table.

![MLD Upload overview](/Screenshots/Policy/mld-upload.png)

1. Locate the policy row using search, filters, or sorting.
2. Click Upload to attach the document file for that control.
3. Once uploaded, the row's Status moves from To Upload to To Approve, and CalVant records the Submission Date automatically.
4. Use Add Task on any row to create a follow-up task without leaving the list — covered in Section 4.5.

### 4.4 Reviewing, Approving & Quality Check

After a document is uploaded, the row's action buttons expand to cover the rest of the approval workflow.

![MLD Review overview](/Screenshots/Policy/mld-review.png)

1. The green check icon confirms the file has been uploaded; click it to open and review the document.
2. Approve moves the policy from To Approve to Approved once the review is complete.
3. Archive removes the policy from the active list and moves it to Archived Policies (Section 4.6).
4. History opens the version and audit trail for that policy.
5. Quality Check shows an AI quality and completeness percentage (e.g., C · 0%) for the uploaded file; click Re-verify to rescan the document after making changes.

### 4.5 Creating a Task

Click Add Task on any policy row to open the Create Task panel and assign follow-up work for that control.

![MLD Task overview](/Screenshots/Policy/mld-task.png)

1. **Department** — required; select the department responsible for the task.
2. **Assign To** — defaults to Auto Assign (Risk Owner); choose a specific person to override it.
3. **Task Description** — required; pre-filled with the policy name and control reference, and editable.
4. **Start Date and End Date** — required; define the task's working window.
5. **Priority** — choose Low, Medium, High, or Critical.
6. **Remarks** — optional notes for the assignee.
7. **Click Create Task to save it.** The task then appears against its policy and in the relevant Task module views.

### 4.6 Archiving Policies

Policies removed from the active Master List of Documents are stored in Archived Policies rather than deleted outright, so a record and reason are always kept.

![Archive overview](/Screenshots/Policy/archive.png)

1. Open Archived Policies from the Archived tile on the dashboard, or click Archive on any policy row.
2. Header stats show Total Archived and Shown counts for the current search.
3. Use the search bar to find an archived policy by name, submitter, or department.
4. The table lists Policy Name, CalVant Version, Submitted By, Department, Uploaded On, and Reason (Remarks), with Actions to restore or permanently delete a record.

When no policies have been archived, the screen shows a **No Archived Policies** empty state.

## 5. Status & Quality Reference

### Document Status (Dashboard Tiles)

| Status | Meaning |
|---|---|
| Total | All policies currently tracked in the Master List of Documents. |
| Uploaded | Policies with a file attached and submitted for review. |
| Pending | Policies awaiting upload; shown as To Upload in the list. |
| Archived | Policies removed from the active list and stored in Archived Policies. |

### Row Status (Master List of Documents)

| Status | Meaning |
|---|---|
| To Upload | No document has been attached to this control yet. |
| To Approve | A document has been uploaded and is awaiting review. |
| Approved | The document has been reviewed and accepted. |
| Archived | The policy has been moved out of the active list. |

## 6. Tips, Best Practices

1. Use the By Framework sort when preparing for a certification audit, so policies follow the same order as your framework.
2. Review the Quality Check score and click Re-verify before approving a document, so incomplete files aren't approved by mistake.
3. Use the Uploaded and Not Uploaded filter chips to focus on outstanding submissions ahead of a review cycle.
4. Set realistic Start and End Dates when creating a task so follow-up work stays on schedule.
5. Archive superseded policy versions instead of deleting them, so a Reason and audit trail are preserved.


[← Back to Introduction](doc:intro)
`,
  },

  "audit-management": {
    title: "Audit Module Guide",
    content: `
# CalVant
### Digital Compliance Management — Audit Module
**End-User Guide**
Version 1.0 | July 2026
© 2026 CalVant. All rights reserved.

---

## Table of Contents

1. Introduction
2. Accessing the Audit Module
3. Key Terminology
4. Manual Navigation
   - 4.1 Audit Dashboard (Admin View)
   - 4.2 Planning an Audit
     - 4.2.1 Step 1 — Audit Details
     - 4.2.2 Step 2 — Assign Controls
   - 4.3 Managing Audits
   - 4.4 Audit Reports
   - 4.5 Auditor Dashboard (Auditor View)
   - 4.6 Reviewing Findings
   - 4.7 Conducting an Audit
5. Status & Quality Reference
6. Tips, Best Practices

---

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

[← Back to Introduction](doc:intro)
`,
  },

  "task-management": {
    title: "Task Module Guide",
    content: `
# CalVant
### Digital Compliance Management — Task Module
**End-User Guide**
Version 1.0 | July 2026
© 2026 CalVant. All rights reserved.

---

## Table of Contents

1. Introduction
2. Accessing the Task Module
   - 2.1 How Task Module Integrates with Calvant
   - 2.2 Typical workflow
3. Key Terminology
4. Manual Navigation
   - 4.1 Task Dashboard
   - 4.2 Action Plan
   - 4.3 Creating a Task
   - 4.4 My Task
   - 4.5 Task Actions
   - 4.6 Viewing Task Details
5. Status & Quality Reference
6. Tips, Best Practices & Troubleshooting

---

## 1. Introduction

The Task Module is the centralized task management workspace in CalVant. Tasks created from Risk, Compliance, Policy, Audit, and other modules are managed here, allowing users to assign, monitor, update, and complete activities from a single location.

## 2. Accessing the Task Module

1. Click the Task icon in the sidebar to land on your Task Dashboard.

### 2.1 How Task Module Integrates with Calvant

The Task Module serves as the execution layer of CalVant. While other modules identify compliance requirements, risks, gaps, policies, audits, and vendor activities, the Task Module enables organizations to assign ownership, track progress, and monitor completion of the actions required to achieve compliance.

Tasks may originate from or support multiple modules, including:

1. **Risk Assessment** – Risk treatment and mitigation activities.
2. **Compliance** – Control implementation and remediation.
3. **Policy** – Policy drafting, review, approval, and periodic review.
4. **TPRM** – Vendor assessments, evidence collection, and follow-up actions.
5. **Audit** – Corrective actions arising from audit findings.

### 2.2 Typical Workflow

Identify Requirement/Risk → Create Task → Assign Owner → Track Progress → Complete Task → Change Task Status → Receive Notification

## 3. Key Terminology

| Term | Definition |
|---|---|
| Assignee | User responsible for completing the task |
| Reporter | User who created the task |

## 4. Manual Navigation

### 4.1 Task Dashboard

![Task Dashboard overview](/Screenshots/Task/task-dashboard.png)

1. Summary tiles display task counts by status.
2. Task Distribution provides an overview of task status.
3. Quick Actions provide access to Manage Tasks and My Tasks.

### 4.2 Action Plan (Manage Tasks)

![Task Manage overview](/Screenshots/Task/task-manage.png)

1. View all tasks across modules.
2. Filter by status, priority and assignee.
3. Search tasks.
4. Select Create Task to add a new task.

### 4.3 Creating a Task

![Task Creation overview](/Screenshots/Task/task-add.png)

1. Select Department and Assignee.
2. Enter the task description.
3. Specify Start Date, End Date and Priority.
4. Add remarks if required.
5. Click Create Task.

### 4.4 My Tasks

![My Task overview](/Screenshots/Task/my-task.png)

1. Displays tasks assigned to the logged-in user.
2. Review task counts by status.
3. Use filters and search to locate tasks quickly.

### 4.5 Task Actions

![Task Actions overview](/Screenshots/Task/task-actions.png)

1. View opens task details.
2. Edit updates task information.
3. Delete permanently removes the task.

### 4.6 Viewing Task Details

![Task Details overview](/Screenshots/Task/task-details.png)

1. Review task status, assignee, reporter and priority.
2. Track history, remarks and work log.
3. View subtasks where available.

## 5. Status Reference

| Status | Meaning |
|---|---|
| To-Do | Task has not been started |
| In Progress | Work is currently underway |
| Done | Task has been completed |
| On Hold | Task is temporarily paused |

## 6. Tips & Best Practices

1. Assign every task to the appropriate department and owner.
2. Use remarks and work logs to record important updates.
3. Review overdue tasks periodically.

[← Back to Introduction](doc:intro)
`,
  },

  "compliance-management": {
    title: "Compliance Module Guide",
    content: `
# CalVant
### Digital Compliance Management — Compliance Module
**End-User Guide**
Version 1.0 | July 2026
© 2026 CalVant. All rights reserved.

---

## Table of Contents

1. Introduction
2. Accessing the Policy Module
3. Key Terminology
4. Manual Navigation
   - 4.1 Compliance Dashboard
   - 4.2 Detailed View
5. Status & Quality Reference
6. Tips, Best Practices & Troubleshooting

---

## 1. Introduction

The Compliance Module provides a unified view of compliance requirements across selected frameworks. It enables users to monitor compliance status, review applicable controls, track evidence availability, manage corrective action plans (CAPs), and monitor overall compliance progress.

## 2. Accessing the Compliance Module

1. Log in to CalVant.
2. Select Compliance from the left navigation menu.
3. The Compliance Dashboard opens, displaying overall compliance metrics and framework summaries.

## 3. Key Terminology

A short list of terms that are specific to CalVant's policy workflow rather than self-explanatory from the screen itself:

| Term | Definition |
|---|---|
| Unified ID | Unique identifier assigned to a unified control. |
| CAP | Corrective Action Plan |

## 4. Manual Navigation

### 4.1 Compliance Dashboard

![Compliance Dashboard overview](/Screenshots/Compliance/comp-home.png)

1. Summary tiles display Total Controls, Compliant and Non-Compliant controls.
2. Framework summary displays compliance percentage for the selected framework.
3. Overall Control Status visualizes compliant and non-compliant controls.
4. Select Detailed View to open the detailed compliance register.

### 4.2 Detailed View

![Compliance Dashboard overview](/Screenshots/Compliance/comp-detailed.png)

1. Search controls using Unified ID, control name or metric.
2. Use Sync from Cloud to refresh live cloud evidence.
3. Use Manage CAP to review or manage corrective action plans.
4. Use Refresh Snapshot to update the compliance view.
5. Review each requirement, associated framework, metric, target, current status and evidence.
6. Select Add CAP to create a corrective action plan for a requirement.

## 5. Status & Quality Reference

### Document Status (Dashboard Tiles)

| Status | Meaning |
|---|---|
| Total Control | Total number of compliance controls tracked for the selected framework(s). |
| Compliant | Controls that currently meet all applicable compliance requirements. |
| Non-Compliant | Controls that require remediation or corrective action. |

### Requirement Status (Detailed View)

| Status | Meaning |
|---|---|
| Compliant | The requirement currently satisfies the expected compliance criteria. |
| Non-compliant | The requirement does not meet the expected compliance criteria and requires remediation. |
| Document Available | The document has been reviewed and accepted. |
| Document Required | Required supporting evidence has not yet been uploaded. |

## 6. Tips, Best Practices

1. Refresh the snapshot before reviewing compliance results.
2. Upload supporting evidence before creating CAPs where applicable.
3. Review non-compliant controls regularly.
4. Keep framework mappings and evidence current.

[← Back to Introduction](doc:intro)
`,
  },

  "vendor-management": {
    title: "Vendor / TPRM Module Guide",
    content: `
# CalVant
### Digital Compliance Management — Vendor Module
**End-User Guide**
Version 1.0 | July 2026
© 2026 CalVant. All rights reserved.

---

## Table of Contents

1. Introduction
2. Accessing the Vendor Module
3. Key Terminology
4. Manual Navigation
   - 4.1 TPRM Dashboard
   - 4.2 Creating a New Vendor Assessment
     - 4.2.1 Step 1 — Assessment Details
     - 4.2.2 Step 2 — Select Questions
   - 4.3 Tracking Sent Assessments
   - 4.4 Vendor Assessment Portal
5. Status & Quality Reference
6. Tips, Best Practices & Troubleshooting

---

## 1. Introduction

The Vendor Module in CalVant helps you assess, monitor, and manage the risk posed by third-party vendors as part of your Third Party Risk Management (TPRM) program. It lets you build vendor assessments from a structured question bank, send them to vendors, and track each response from submission through to approval.

## 2. Accessing the Vendor Module

1. Click the Vendor icon in the sidebar to land on your Third Party Risk Management Dashboard.
2. Your logged-in user name and role appear in the top-right of the dashboard header.
3. Vendors have their own view and access their own assigned assessments through the Vendor Assessment Portal (Section 4.4) using their vendor login.

## 3. Key Terminology

A short list of terms that are specific to CalVant's policy workflow rather than self-explanatory from the screen itself:

| Field | Description |
|---|---|
| TPRM | Third Party Risk Management — the process of assessing and monitoring risk posed by vendors and other third parties. |
| Vendor | The third-party organization being assessed. A vendor must have TPRM module access before an assessment can be assigned to it. |
| Vendor Portal | The vendor-facing view where an assigned vendor completes and submits an assessment. |
| Status Guide | The reference panel in the Vendor Portal explaining what each assessment status means from the vendor's perspective. |

## 4. Manual Navigation

### 4.1 TPRM Dashboard

The TPRM Dashboard is your home base for third-party risk management. It gives you an at-a-glance summary of every vendor assessment in your organization, along with quick actions to manage questions, send assessments, and review vendors.

![Vendor Dashboard overview](/Screenshots/Vendor/vendor-dashboard.png)

1. **Summary tiles** — Total, Sent, Submitted, Approved, and Rejected assessment counts.
2. **Assessment Status** — shows a "No Assessments Yet" state until the first TPRM assessment is created.
3. **Assessment Trends** — a bar chart of assessments created each month; shows "No Trend Data" until assessments carry date fields.

The Quick Actions panel gives one-click access to the most common tasks:

| Status | Meaning |
|---|---|
| TPRM Questions | Opens the question bank |
| Plan TPRM | Starts the assessment wizard |
| Vendor Report | Opens vendor scores for review and approval |

### 4.2 Creating a New Vendor Assessment

CalVant uses a guided, two-step wizard to create and send a vendor assessment: Assessment Details, then Select Questions.

#### 4.2.1 Step 1 — Assessment Details

From the TPRM Dashboard, click Plan TPRM under Quick Actions to open Conduct TPRM, then click New Assessment.

![Conduct Assessment overview](/Screenshots/Vendor/vendor-conduct.png)

| Field | Description |
|---|---|
| Assessment Title | Required; a descriptive name for the assessment (e.g., Q1 2026 Vendor Security Assessment). |
| Assign to Vendor | Required; select the vendor to assess. Only vendors with TPRM module access appear in this list. |
| Due Date | Required; the date by which the vendor must submit the assessment. |

Click Next: Select Questions to continue.

#### 4.2.2 Step 2 — Select Questions

Build the assessment by choosing questions from the question bank, organized by section.

![Vendor Question overview](/Screenshots/Vendor/vendor-question.png)

1. Use Search questions or Select All to quickly build the question set; the counter (e.g., 0/56 selected) tracks your progress.
2. Expand a section — such as Information Security Governance, Data Protection & Privacy, Security Controls, or Incident Management — to choose individual questions, or check the section box to select all questions in it.
3. Review the summary panel (Title, Vendor, Due Date, Questions) before sending.
4. Click Submit to send the assessment to the selected vendor, or Back to revise the assessment details.

### 4.3 Tracking Sent Assessments

The Conduct TPRM screen lists every assessment you've created, whether still in draft, sent, or completed.

![Vendor Track overview](/Screenshots/Vendor/vendor-track.png)

1. Use the filter chips — All, Due, Received, Completed — to narrow the list by stage.
2. Click New Assessment at any time to start another vendor assessment.
3. A "No assessments yet" empty state appears until at least one assessment has been created.

### 4.4 Vendor Assessment Portal

Vendors complete their assigned assessments through their own portal view, which mirrors the admin dashboard but is scoped to that vendor's assessments only.

![Vendor Assessment overview](/Screenshots/Vendor/vendor-assessment.png)

1. **Summary tiles** — Total, Pending, Submitted, Approved, and Rejected counts for the logged-in vendor.
2. **Assessment Status** — shows "No assessments yet" until an assessment is assigned to the vendor.
3. **Assessments panel** — filter by All, Sent, Submitted, Under_review, or Approved to track progress.
4. **Status Guide** — explains each status in plain language so the vendor knows what action, if any, is required.

## 5. Status & Quality Reference

### TPRM Assessment Status (Admin View)

| Status | Meaning |
|---|---|
| Sent | The assessment has been sent to the vendor and is awaiting a response. |
| Submitted | The vendor has submitted the assessment; it is awaiting admin review. |
| Approved | The submission has been reviewed and approved. |
| Rejected | The submission has been reviewed and rejected. |

### Vendor Portal Status Guide

| Status | Meaning |
|---|---|
| Pending Answer | The admin has sent the vendor a questionnaire to fill out. |
| Submitted | The vendor has submitted the assessment; the admin is reviewing it. |
| Approved | The admin has approved the vendor's submission. |
| Rejected | The admin has rejected the submission; the vendor should check the comments. |

## 6. Tips, Best Practices

1. Grant a vendor TPRM module access before planning an assessment; otherwise the Assign to Vendor field will show "No vendors found with TPRM module access".
2. Use Select All at the section level to send a standard, framework-aligned question set, then remove sections that don't apply to a specific vendor's engagement.
3. Set realistic Due Dates in Assessment Details so vendors have adequate time to respond before escalation is needed.
4. Review the Vendor Report regularly to identify vendors nearing rejection or requiring follow-up.
5. Share the Status Guide with new vendors so they understand what Pending Answer, Submitted, Approved, and Rejected mean for their next action.

> **Tip:** Keep the question bank current by reviewing TPRM question categories periodically to reflect changes in your compliance requirements.

[← Back to Introduction](doc:intro)
`,
  },

  "impact-assessments": {
    title: "DPIA & AIIA Guide",
    content: `
# CalVant
### Digital Compliance Management — Impact Assessments Module
**End-User Guide**

A step-by-step guide to identifying, assessing, treating, and tracking various types of risks in CalVant (DPIA, AIIA, Risk Assessment, etc.)

Version 1.0 | July 2026
© 2026 CalVant. All rights reserved.

---

## Table of Contents

1. Introduction
2. Accessing the Impact Assessment Module
3. Key Terminology
4. Manual Navigation
   - 4.1 DPIA Dashboard
   - 4.2 Planning a DPIA
   - 4.3 Completing a DPIA
   - 4.4 Viewing DPIA Assessments
   - 4.5 Managing DPIA Assignments
   - 4.6 AI Impact Assessment (AIIA) Dashboard
   - 4.7 Planning an AI Impact Assessment
   - 4.8 Completing & Managing an AIIA
   - 4.9 My Assignments
5. Status & Quality Reference
6. Tips, Best Practices & Troubleshooting
7. Additional Information

---

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

[← Back to Introduction](doc:intro)
`,
  },
};
