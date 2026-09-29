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

| Field | Description |
|---|---|
| Assessment Title | Required; a descriptive name for the assessment (e.g., Q1 2026 Vendor Security Assessment). |
| Assign to Vendor | Required; select the vendor to assess. Only vendors with TPRM module access appear in this list. |
| Due Date | Required; the date by which the vendor must submit the assessment. |

Click Next: Select Questions to continue.

#### 4.2.2 Step 2 — Select Questions

Build the assessment by choosing questions from the question bank, organized by section.

1. Use Search questions or Select All to quickly build the question set; the counter (e.g., 0/56 selected) tracks your progress.
2. Expand a section — such as Information Security Governance, Data Protection & Privacy, Security Controls, or Incident Management — to choose individual questions, or check the section box to select all questions in it.
3. Review the summary panel (Title, Vendor, Due Date, Questions) before sending.
4. Click Submit to send the assessment to the selected vendor, or Back to revise the assessment details.

### 4.3 Tracking Sent Assessments

The Conduct TPRM screen lists every assessment you've created, whether still in draft, sent, or completed.

1. Use the filter chips — All, Due, Received, Completed — to narrow the list by stage.
2. Click New Assessment at any time to start another vendor assessment.
3. A "No assessments yet" empty state appears until at least one assessment has been created.

### 4.4 Vendor Assessment Portal

Vendors complete their assigned assessments through their own portal view, which mirrors the admin dashboard but is scoped to that vendor's assessments only.

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
