# CalVant — Compliance Module User Guide

*Version 1.1 | July 2026*

## 1. Introduction 

The Compliance Module in CalVant provides a unified view of compliance requirements across selected frameworks. It lets you monitor compliance status, review applicable controls, track evidence availability, manage corrective action plans (CAPs), and follow overall compliance progress. 

This guide follows the module in the order you'll actually use it. 

## 2. Accessing the Compliance Module

After logging in to CalVant, use the left-hand navigation sidebar to move between modules. Click Compliances in the sidebar to land on your Compliance Dashboard. 

The Compliances section of the sidebar expands into two views: Detailed View and Reports. 

## 3. Manual Navigation 

### 3.1 Compliance Dashboard

![Risk Dashboard overview](/Screenshots/Compliance/1.png)

The Compliance Dashboard is the home base for the module. It gives an at-a-glance summary of compliance status across your selected frameworks. The screen is organized into three zones: the Overview Zone, the Quick Panel Zone, and the Visual Representation Zone. 

## Overview Zone 

A row of summary tiles showing Total Controls, Compliant, and Non-Compliant counts. 

## Quick Panel Zone

Gives one-click access to: 

Detailed View — Opens the detailed compliance register. 

##### Visual Representation Zone 

A donut chart per framework (e.g., ISO 27001) showing that framework's compliance percentage. 

An Overall Control Status donut chart showing the split between Compliant and NonCompliant controls across all frameworks, alongside the total control count and overall compliance score. 

## 3.2 Detailed View 

![Risk Dashboard overview](/Screenshots/Compliance/2.png)

Detailed View is the working register of every unified control across your selected frameworks, accessible from Detailed View on the dashboard, or directly from  Detailed View in the sidebar. 

A banner at the top of the screen confirms the current Organization ID, the number of controls marked SoA Applicable, and the active framework filter. 

Use Search Controls to find a control by Unified ID, control name, or metric. 

Use Sync from Cloud to insert live evidence from you cloud environment. 

Use Manage CAP to review or manage corrective action plans. A CAP (Corrective Action Plan) is the remediation plan created for a non-compliant requirement. 

Use Refresh Snapshot to update the compliance view. 

![Risk Dashboard overview](/Screenshots/Compliance/3.png)

A legend indicates row status: Connected means the control's evidence is pulled from live cloud data, Not Connected means the evidence requires manual upload, and Document Available and Document Required indicate whether supporting documentation has been provided. 

A summary line shows how many requirements are currently displayed against the total available rows, and notes any active filter, e.g., Filtered to SoA applicable controls. 

### _Each row in the register shows:_ 

Unified ID — The control's unified identifier assigned to each control of this dashboard. 

Requirement ID — The clause number and title of the requirement or the framework currently under use. 

Frameworks — The compliance framework(s) the requirement maps to. 

Metric — The measurable indicator associated with the requirement, where applicable. 

Target — The expected evidence target for the requirement. 

![Risk Dashboard overview](/Screenshots/Compliance/4.png)

Current — The current evidence state for the requirement, shown as Available, Unavailable, or “—“ when not yet assessed. 

Evidence / Formula — Attached evidence or supporting documents for the requirement. 

CAP Task — An Add CAP button used to create a corrective action plan for that requirement. 

Expanding a requirement lists its associated evidence documents as is already created under the Master List of Documents in Calvant (e.g., ISMS Manual, ISMS Scope), each with its own Target and Current availability status and linked evidence file. 

![Risk Dashboard overview](/Screenshots/Compliance/5.png)

## 3.3 Reports 

Reports shows compliance trends over time, accessible from Compliances → Reports in the sidebar. 

The Compliance Trend chart plots compliance percentage over the months, broken down by connected source, e.g., AWS, GCP, M365. 

![Risk Dashboard overview](/Screenshots/Compliance/6.png) 