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

**Risk Identification fields:**

| Field | Description |
|---|---|
| Risk ID | Auto-suggested (e.g., RR-2026-001), or click Generate New ID. CalVant warns you if the ID already exists. |
| Department | The department that owns or is affected by the risk. |
| Date | The date the risk is being recorded (defaults to today). |
| Risk Type | Category of the risk, e.g., Privacy, Artificial Intelligence, Operational. |
| Asset Type / Asset | The classification and name of the affected asset. |

**Threat, Vulnerability & Scoring fields:**

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

| Field | Description |
|---|---|
| Action | The treatment strategy for the risk — Mitigate or Accept. |
| Status | Current status of the treatment — Open, In Progress, or Closed. |
| New/Proposed Controls | Free-text field to describe new controls proposed to treat the risk. |

Under Applicable Control(s), select the compliance framework(s) relevant to this risk — for example ISO 27001, KSA PDPL, GDPR, DPDPA, HIPAA, or SOC 2. CalVant then displays the specific control codes that apply.

| Field | Description |
|---|---|
| Start Date | The date treatment work begins. Auto generated to the present date. |
| Number of Days | How many days are allotted to complete treatment; CalVant calculates and displays the target completion date. |

Residual Risk Assessment shows the original Likelihood, Impact, and Risk Score from Step 1 for reference. Enter the Likelihood After Treatment and Impact After Treatment to calculate the residual Risk Score and Risk Level once controls are applied.

> **Caution:** If a treatment deadline passes without the risk being closed, CalVant flags it on the risk detail view with a message such as "Deadline missed by X days." Review overdue risks regularly.

#### 4.2.3 Step 3 — Task Management

The final step converts the treatment plan into a trackable action plan — tasks with an owner and due date so the mitigation work is followed through to completion.

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

The screen shows summary counts (Total, High, Critical, Medium, Low) and a filterable, sortable list of template risks. Use the Dept and Risk Level filters to narrow the list, or the row-level actions to act on individual risks:

| Field | Description |
|---|---|
| Accept | Adds the template risk to your organization's risk register as-is. |
| Reject | Dismisses the template risk without adding it. |
| View | Opens a read-only detail view of the full risk before you decide. |

> **Tip:** Using templates is the fastest way to populate your risk register when adopting a new framework — CalVant's sample library includes risks specific to each supported framework.

### 4.4 Viewing Saved Risk Assessments

Once risks have been created or accepted, they're listed under Saved Risk Assessments, accessible via View Risks on the dashboard. This is your working risk register.

The screen shows the total number of risks and a breakdown by severity (High, Critical, Medium, Low) and status (Open, Closed), along with a timestamp of when the list was last generated. Each row shows the Risk ID and Description — click a row to open its full details. From here you can also click Generate SoA to jump directly to the Statement of Applicability (Section 4.6).

### 4.5 Viewing Tasks

The View Tasks screen lists every task assigned to you from risk treatment plans across your organization. Access it from View Tasks on the Risk Dashboard.

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
