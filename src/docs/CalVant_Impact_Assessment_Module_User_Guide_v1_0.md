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

1. From the DPIA Dashboard, click Plan DPIA under Quick Actions.
2. Step 1 — Select Assessment: choose an existing draft assessment from the list, or click New DPIA to create one.
3. Click Next: Set Details to continue.

Step 2 — Set Details captures the following fields:

| Field | Description |
|---|---|
| Department | Required; the department the DPIA relates to. |
| Assign To (Risk Owner) | Required; the individual responsible for completing the DPIA. |
| Due Date | Required; the date the DPIA must be completed by. |
| Notes / Instructions | Optional context or instructions for the Risk Owner. |

Click Assign DPIA to save the assignment and notify the selected Risk Owner.

### 4.3 Completing a DPIA

Once assigned, the Risk Owner completes the DPIA through a three-stage questionnaire: PII Inventory, Personal Data Elements, and DPIA Questionnaire.

1. **PII Inventory** — captures the anticipated data subjects (e.g., Current Employee, Customer's Customer, Business Contact) and the geographies or jurisdictions in which they reside (e.g., Europe, United States, California, etc.), and other details related to the data subjects and the collection of data.
2. **Personal Data Elements** — a checklist of the specific data elements collected as part of the activity.
3. **DPIA Questionnaire** — captures compliance and obligation questions used to determine the overall risk posture of the processing activity.

Each question supports multi-select checkboxes where more than one answer applies. Progress through the three stages using the tabs at the top of the screen.

### 4.4 Viewing DPIA Assessments

The View DPIAs screen lists every DPIA in your organization for browsing, independent of the Manage DPIA edit workflow described in Section 4.5.

### 4.5 Managing DPIA Assessments

1. **Assignments List** — search by project, assignee, or status; each row shows the DPIA ID, a Status badge (e.g., Completed, Assigned), Assigned To, and Due Date.
2. Click the edit (pencil) icon on a row to open Edit Assignment and update its details.
3. Use the search bar to quickly locate a specific assignment within the full register (e.g., 19 assignments).

### 4.6 AI Impact Assessment (AIIA) Dashboard

The AI Impact Assessment Dashboard is your home base for AI governance risk. It gives you an at-a-glance summary of every AIIA in your organization, along with quick actions to browse, plan, and manage them.

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

1. Enter the AI System Name (e.g., Customer Support Chatbot).
2. Select the Department responsible for the AI system.
3. Confirm or update the Assessment Date (defaults to today).
4. Click Create Assessment to save.

### 4.8 Completing & Managing an AIIA

Opening an assessment from Manage AIIA, or from an assignment in My Assignments, starts a two-step wizard: Assessment Details, then Assign Risk Owners.

**Step 1 — Assessment Details:**

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

1. **Summary tiles** — Pending, Completed, and Total assignment counts.
2. **Pending Action tab** — lists assessments awaiting your input, each with its Business Objective summary and a Start Assessment button.
3. Click Refresh to reload the latest assignment data.

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
