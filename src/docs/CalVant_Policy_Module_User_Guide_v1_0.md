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

1. **Summary tiles** — total policies, and counts by Uploaded, Pending, and Archived.
2. **Document Status** — a donut chart showing the proportion of uploaded versus pending documents.
3. **Upload Trends** — a bar chart of documents uploaded each month, filterable by year; shows "No Upload Data" until documents are uploaded.

The Quick Actions panel gives one-click access to the most common tasks. Master List of Documents, Upload Documents, and View Documents all open the same Policies list screen described in Section 4.2 — only the entry point differs. Archived is the one tile that opens a separate screen, covered in Section 4.6.

### 4.2 Policies List View (Master List of Documents)

Opening Master List of Documents, Upload Documents, or View Documents from the dashboard brings you to the same Policies screen: the working register of every policy in your organization.

1. **Header stats** — Total, Uploaded, SoA Linked, and the count for the active framework (e.g., ISO 27001).
2. **Search bar** — find a policy by name, control ID, or C-ID.
3. **Uploaded filter chips** — switch between All, Uploaded, and Not Uploaded.
4. **Table columns** — Control ID, Policy Name, Related Framework, Type, Control Code, Ownership, Department, CalVant Version, and Status, followed by Submitted By, Submission Date, Approved By, Review Date, Upload, Remarks, Quality Check, and Add Task.

#### Sorting the List

Use the dropdown next to the search bar to reorder the table.

1. **By Framework** — groups policies in framework order: ISO 27001 → ISO 27701 → SOC 2 → ISO 42001 → PDPL.
2. **Policy Name (A → Z)** — alphabetical order.
3. **Control ID (↑ Asc / ↓ Desc, grouped by framework)** — orders rows by control reference.
4. **SoA Linked First** — surfaces policies already connected to the Statement of Applicability.
5. **SoA Date (Newest / Oldest)** — orders rows by when the SoA link was created.

### 4.3 Uploading a Policy Document

Each row in the Master List of Documents carries its own upload and workflow controls, visible on the right side of the table.

1. Locate the policy row using search, filters, or sorting.
2. Click Upload to attach the document file for that control.
3. Once uploaded, the row's Status moves from To Upload to To Approve, and CalVant records the Submission Date automatically.
4. Use Add Task on any row to create a follow-up task without leaving the list — covered in Section 4.5.

### 4.4 Reviewing, Approving & Quality Check

After a document is uploaded, the row's action buttons expand to cover the rest of the approval workflow.

1. The green check icon confirms the file has been uploaded; click it to open and review the document.
2. Approve moves the policy from To Approve to Approved once the review is complete.
3. Archive removes the policy from the active list and moves it to Archived Policies (Section 4.6).
4. History opens the version and audit trail for that policy.
5. Quality Check shows an AI quality and completeness percentage (e.g., C · 0%) for the uploaded file; click Re-verify to rescan the document after making changes.

### 4.5 Creating a Task

Click Add Task on any policy row to open the Create Task panel and assign follow-up work for that control.

1. **Department** — required; select the department responsible for the task.
2. **Assign To** — defaults to Auto Assign (Risk Owner); choose a specific person to override it.
3. **Task Description** — required; pre-filled with the policy name and control reference, and editable.
4. **Start Date and End Date** — required; define the task's working window.
5. **Priority** — choose Low, Medium, High, or Critical.
6. **Remarks** — optional notes for the assignee.
7. **Click Create Task to save it.** The task then appears against its policy and in the relevant Task module views.

### 4.6 Archiving Policies

Policies removed from the active Master List of Documents are stored in Archived Policies rather than deleted outright, so a record and reason are always kept.

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
