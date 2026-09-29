# CalVant — Audit Module User Guide

*Version 1.1 | July 2026*

## 1. Introduction 

The Audit Module in CalVant helps you plan, schedule, conduct, and report on internal and external audits across your compliance program. It maps every audit to the controls in frameworks such as ISO 27001, ISO 27701, SOC 2, ISO 42001, and PDPL, and gives admins and auditors separate, role-based views of the same audit lifecycle — from planning through findings and reporting. 

This guide follows the module in the order you'll actually use it, covering the Admin view first and the Auditor view second. 

## 2. Accessing the Audit Module

After logging in to CalVant, use the left-hand navigation sidebar to move between modules. Click the Audit icon in the sidebar to land on your Audit Dashboard. 

The dashboard and its Quick Actions differ by role: Admin users see the full Audit Management dashboard; Auditors see a scoped Audit Dashboard limited to their assigned controls. 

## 3. Manual Navigation 

## 3.1 Audit Dashboard (Admin View)

![Risk Dashboard overview](/Screenshots/Audit/1.png) 

The Audit Dashboard is the home base for the module. It gives an at-a-glance summary of every audit in the organization, along with quick actions to plan, manage, and report on audits. The screen is organized into three zones: the Overview Zone, the Quick Actions Zone, and the Visual Representation Zone. 

#### Overview Zone 

A row of summary tiles showing Total, Planned, In Progress, Completed, and Findings counts. 

#### Quick Actions Zone  

Gives one-click access to the most common tasks: 

Plan Audit — Launches the guided process to schedule and assign controls for a new audit. 

Manage Audits — Opens the list of existing audits to view or edit. 

Audit Reports — Opens completed and in-progress audits to review findings and scores. 

###### Visual Representation Zone 

Audit Status — a donut chart of audits by status. 

Audit Trends — a bar chart of audits created each month, filterable by year. 

## 3.2 Planning an Audit 

![Risk Dashboard overview](/Screenshots/Audit/2.png) 

CalVant uses a guided, two-step process to plan a new audit: Audit Details, then Assign Controls. 

From the Audit Dashboard, click Plan Audit under the Quick Actions Zone. 

A Global Filter Active banner at the top of the page shows which framework scope is currently active. Use Next and Back to move between steps, or Create Audit once both steps are complete. 

## 3.2.1 Step 1 — Audit Details 

This step captures the audit's type, framework, personnel, and schedule: 

Audit Type — Internal, External, Certification, or Surveillance. 

Framework — The compliance framework being audited, e.g., ISO 27001 or ISO 42001. 

Lead Auditor — The auditor leading the engagement. 

Point of Contact — The auditee-side contact for the audit. 

Opening Meeting Date and Closure Meeting Date — The anchor dates that bound the entire audit engagement, grouped under Audit Anchor Dates. 

![Risk Dashboard overview](/Screenshots/Audit/3.png) 

Below the anchor dates sits the Phase Ratio Control, a slider that splits the working days between the Opening and Closure Meeting Dates into 

a. Stage 1 - Documentation 

b. Stage 2 - Practice 

- c. Reporting 

And auto-calculates each phase's dates. 

Before both anchor dates are set, CalVant shows a prompt to set them to enable phase autocalculation. Once both dates are set, the slider becomes active and displays the working-day count for each stage — day counts are working days only (Monday–Friday), and both the start and end day are counted. 

Beneath the Phase Ratio Control, the Phase Dates panel shows the auto-calculated, editable start and end dates for 

a. Stage 1 - Documentation Audit 

b. Stage 2 - Practice Audit 

c. Reporting 

Phase dates auto-fill from the ratio slider; editing any phase date manually updates the ratio bar and later phases instantly to stay in sync. 

Click Next: Assign Controls to continue to Step 2. 

## 3.2.2 Step 2 — Assign Controls 

![Risk Dashboard overview](/Screenshots/Audit/4.png) 

This step allocates auditors to every control in scope, organized by control section. 

Each control section — grouped according to the selected framework lists its total control count and how many are currently assigned. 

Use Assign whole section to bulk-assign one auditor to every control in that section, or expand a section to assign auditors clause by clause and control by control. 

![Risk Dashboard overview](/Screenshots/Audit/5.png) 

Auditors must be outside the control's department, as per the independence rule shown at the top of the screen. 

Click Create Audit once all sections are assigned to save the audit and add it to Manage Audits. 

## 3.3 Managing Audits 

![Risk Dashboard overview](/Screenshots/Audit/6.png) 

Manage Audits is the working register of every audit in the organization, accessible from Manage Audits in the Quick Actions Zone. 

![Risk Dashboard overview](/Screenshots/Audit/7.png) 

Header stats — Total audits, plus counts for each framework in use, e.g., ISO 42001, ISO 27001, etc. 

Status filter chips — All, Planned, In Progress, Completed. 

Search bar — Find an audit by type, status, or point of contact. 

Audit cards — Each card shows the audit's Status, Type, and Framework tags, its title, Opening and Closure dates, POC, Lead Auditor, control count, and finding count, with an edit action to open that audit's details. 

![Risk Dashboard overview](/Screenshots/Audit/8.png) 

Opening an audit for editing returns you to the same two-step Audit Details / Assign Controls layout used when planning an audit, pre-filled with the audit's current values, including its Status. Use Save Changes to keep your edits, or Cancel to discard them. 

![Risk Dashboard overview](/Screenshots/Audit/10.png)

## 3.4 Audit Reports 

![Risk Dashboard overview](/Screenshots/Audit/11.png) 

Audit Reports lists every audit with its compliance score and links to full details, accessible from Audit Reports in the Quick Actions Zone. 

Each card shows the audit's Status, Type, and Framework tags, its title, its POC, Lead Auditor, and date range. 

The progress bar shows the audit's compliance score, labeled Compliant or Non-Compliant with a percentage. 

Click View Details to open the full findings for that audit. 

![Risk Dashboard overview](/Screenshots/Audit/12.png) 

The detail view lists every control in the audit, showing each control's code and title, its Document Evidence score _(Doc)_ and Practice Evidence score _(Practice)_ , and the auditor it is assigned to. Use Download Report to export the audit's findings, or Back to List to return to the Audit Reports list. 

## 3.5 Audit Dashboard (Auditor View) 

![Risk Dashboard overview](/Screenshots/Audit/14.png) 

Auditors land on a scoped Audit Dashboard that shows only the audits and controls assigned to them. 

### Controls Assigned panel 

Directs the login auditor to Conduct Audit to view and score their assigned controls. 

#### Quick Actions Zone 

Gives one-click access to the auditor's tasks. 

Conduct Audit — Opens assigned controls for scoring. 

Review Findings — Opens completed control assessments to view and add findings and create a Corrective Action Plan. 

###### Visual Representation Zone 

Audit Status — a donut chart showing the total number of audits the auditor is part of. 

Audit Trends — a bar chart of audits created each month, filterable by year. 

## 3.6 Conducting an Audit 

![Risk Dashboard overview](/Screenshots/Audit/15.png) 

Conduct Audit is where auditors views scores for their assigned controls. 

A filter banner shows the active framework of the audits assigned to the auditor. 

Each card shows the audit's Status and Framework tags, the auditor's role badge and the due date. 

The Overall progress bar shows you all controls in the audit; My Controls shows only the controls assigned to the logged-in auditor. 

Click Team Progress to expand and view how other auditors on the engagement are progressing, including each auditor's name and how many controls they have scored. 

![Risk Dashboard overview](/Screenshots/Audit/16.png) 

Click the card to open Conduct Audit and begin submitting scores. 

Inside a control section, controls are grouped by clause and sub-clause. For each control, record the Document Evidence and Practice Evidence (via Upload), the Document Score and Practice Evidence Score, and CalVant calculates the Total. 

Doc Remarks and Prac Remarks capture supporting notes, and Findings and Overall Findings capture the auditor's assessment for that control. 

## 3.7 Reviewing Findings 

![Risk Dashboard overview](/Screenshots/Audit/17.png) 

Review Findings lists the audits with controls assigned to the auditor, accessible from the Quick Actions Zone. 

A filter banner shows the active framework and how many audits match it. 

Each card shows the audit's Status and Framework tags, its title, and the number of controls assigned to the auditor. 

Click a card to open its findings. 

![Risk Dashboard overview](/Screenshots/Audit/18.png) 

The findings screen lists the auditor's assigned controls by code and, under Non-Conformities, shows every control that was scored as non-compliant. 

Each non-conformity shows its clause code, a finding type badge, its score, the control's requirement text, and Document and Practice remarks recorded during scoring. Use Add Finding to record an additional finding, or Create CAP to open the Corrective Action Plan for the audit's non-conformities. 

![Risk Dashboard overview](/Screenshots/Audit/19.png) 

The Corrective Action Plan screen lists each non-conformity with its clause, finding type, requirement, Doc and Practice remarks, and score, alongside a Root Cause Analysis using the Five Whys technique. 

![Risk Dashboard overview](/Screenshots/Audit/20.png) 

For each finding, set an owner under Assigned To, a Due Date, and a Priority, and track its Status (e.g., Open). Click Add Task to open the Create Corrective Action Task panel, where the task description is pre-filled from the finding's requirement; set Assign To (defaults to the current auditor), Priority, Start Date, and Due Date, then save the task to track remediation. 

With this, you've covered the full Audit Module workflow in CalVant — from planning an audit on the Admin Dashboard through to an auditor scoring controls and raising a Corrective Action Plan. Refer back to any section as needed while running your audit program. 

