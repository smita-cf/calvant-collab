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

| Field | Description |
|---|---|
| Audit Type | Internal, External, Certification, or Surveillance. |
| Framework | The compliance framework being audited, e.g., ISO 27001. |
| Lead Auditor | The auditor leading the engagement. |
| Point of Contact | The auditee-side contact for the audit. |
| Opening / Closure Meeting Date | The anchor dates that bound the entire audit engagement. |

Once Opening and Closure Meeting Dates are set, the Phase Ratio Control slider becomes active and auto-calculates the phase dates below it.

1. Drag the slider to set the working-day ratio between Stage 1 and Stage 2 + Reporting; the ratio and day counts update above the bar.
2. Phase Dates for Stage 1 (i.e., Documentation Audit), Stage 2 (i.e., Practice Audit), and Audit Reporting auto-fill from the ratio and anchor dates.
3. Edit any phase date manually — the ratio bar and later phases update instantly to stay in sync.
4. Day counts are working days only (Monday–Friday); both the start and end day are counted.
5. Click Next: Assign Controls to continue to Step 2.

#### 4.2.2 Step 2 — Assign Controls

This step allocates auditors to every control in scope, organized by control section.

1. Each control section (e.g., for ISMS Core, they are Organizational Controls, People Controls, Physical Controls, Technological Controls) lists its total control count and how many are currently assigned.
2. Use Assign whole section to bulk-assign one auditor to every control in that section, or expand a section to assign auditors control by control.
3. Auditors must be outside the control's department, as per the independence rule shown at the top of the screen.
4. Click Create Audit once all sections are assigned to save the audit and add it to Manage Audits.

### 4.3 Managing Audits

Manage Audits is the working register of every audit in the organization, accessible from Manage Audits on the dashboard.

1. **Header stats** — Total audits, plus counts for the active framework, e.g., ISO 27001, KSA PDPL, etc.
2. **Framework filter chips** — switch between All and a specific framework.
3. **Status filter chips** — All, Planned, In Progress, Completed.
4. **Search bar** — find an audit by type, status, or point of contact.

When no audits match the current filters, the screen shows a "No audits found" empty state.

### 4.4 Audit Reports

Audit Reports lists every audit with its compliance score and links to full details, accessible from Audit Reports on the dashboard.

1. Each card shows the audit's Status, Type, and Framework tags, its title, and its POC, Lead Auditor, and date range.
2. The progress bar shows the audit's compliance score, labeled Compliant or Non-Compliant with a percentage.
3. Click View Details to open the full findings for that audit.

### 4.5 Auditor Dashboard (Auditor View)

Auditors land on a scoped Auditor Dashboard that shows only the audits and controls assigned to them.

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

1. The Filter banner shows the active framework and how many audits match it.
2. Each card shows the audit's Status and Framework tags, its title, and the number of controls assigned to the auditor.
3. Click a card to open its findings and create a CAP for any non-compliant control.

### 4.7 Conducting an Audit

Conduct Audit is where auditors submit scores for their assigned controls, accessible from Conduct Audit on the Auditor Dashboard.

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
