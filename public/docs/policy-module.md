# CalVant — Risk Module User Guide

*Version 1.1 | July 2026*

## 1. Introduction 

The Policy Module in CalVant helps you create, upload, review, approve, and track the policy documents required for your compliance and information security program. It maps every policy to the controls in frameworks such as ISO 27001, ISO 27701, SOC 2, ISO 42001, and PDPL, and keeps a version-controlled record of what has been submitted, reviewed, and archived. 

This guide follows the module in the order you'll actually use it. 

## 2. Accessing the Policy Module

After logging in to CalVant, use the left-hand navigation sidebar to move between modules. The sidebar gives you access to multiple modulesmoules, along with account settings at the bottom. 

Click the Policy icon in the sidebar to land on your Policies Dashboard. 

## 3. Manual Navigation 

### 3.1 Policies Dashboard

The Policies Dashboard is your home base for the module. It gives you an at-a-glance summary of every policy in your organization, along with quick actions to browse, upload, and manage documents. The screen is organized into three zones: the Overview Zone, the  Quick Actions Zone, and the Visual Representation Zone. 

![Risk Dashboard overview](/Screenshots/Policy/1.png)

#### Overview Zone 

A row of summary tiles showing the total number of policies, and counts by Uploaded, Pending, and Archived. 

#### Quick Actions Zone  

Gives one-click access to the most common tasks: 

Master List of Documents (MLD) — Opens the working register of every policy in your organization. 

Upload Documents — Opens the policy register, entry point for uploading files. 

View Documents — Opens the policy register, entry point for browsing existing files. 

Archived — Opens the Archived Policies page. 

###### Visual Representation Zone 

Document Status — a donut chart showing the proportion of uploaded versus pending documents. 

Upload Trends — a bar chart of documents uploaded each month, filterable by year. 

### 3.2 Policies List View (Master List of Documents)

Opening Master List of Documents, from the dashboard brings you to the Policies screen: the working register of every policy in your organization. Here is what you will find on this page: 

Header stats — Total, Uploaded, SoA Linked, and the count for the active framework. 

Search bar — Find a policy by name, control ID, or C-ID. 

Uploaded filter chips — Switch between All, Uploaded, and Not Uploaded. 

Table columns — Control ID, Policy Name, Related Framework, Type, Control Code, Ownership, Department, CalVant Version, and Status, followed by Submitted By, Submission Date, Approved By, Review Date, Upload, Remarks, Quality Check, and Add Task. 

Sorting the List - Use the dropdown next to the search bar to reorder the table: 

By Framework — groups policies in framework order: 

![Risk Dashboard overview](/Screenshots/Policy/2.png)

### 3.3 Uploading a Policy Document 

Each row in the Master List of Documents carries its own upload and workflow controls, visible on the right side of the table. 

Locate the policy row using search, filters, or sorting. 

Click Upload to attach the document file for that control. 

Once uploaded, the row's Status moves from Upload to Approve/Archive, and CalVant records the Submission Date automatically. 

Now you can also use the Add Task on any row to create a follow-up task without leaving the list. 

![Risk Dashboard overview](/Screenshots/Policy/3.png)

### 3.4 Reviewing, Approving & Quality Check 

After a document is uploaded, the row's action buttons expand to cover the rest of the approval workflow. 

The green check icon confirms the file has been uploaded. 

The Approve button moves the policy from To Approve to Approved once the review is complete. 

Archive removes the policy from the active list and moves it to Archived Policies (Section 3.6). 

History opens the version and audit trail for that policy. 

Quality Check shows an AI quality and completeness percentage for the uploaded file; click Reverify to rescan the document after making any changes to the document. 

### 3.5 Creating a Task 

Click Add Task on any policy row to open the Create Task panel and assign follow-up work for that control. 

Department — required; select the department responsible for the task. 

Assign To — defaults to Auto Assign (Risk Owner); choose a specific person to override it. 

Task Description — required; pre-filled with the policy name and control reference, and editable. 

Start Date and End Date — required; define the task's working window. 

Priority — choose Low, Medium, High, or Critical. 

Remarks — optional notes for the assignee. 

Click Create Task to save it. The task then appears against its policy and in the relevant Task module views. 

![Risk Dashboard overview](/Screenshots/Policy/4.png)

### 3.6 Archiving Policies 

Policies removed from the active Master List of Documents are stored in Archived Policies rather than deleted outright, so a record and reason are always kept. 

Open Archived Policies from the Archived tile on the dashboard, or click Archive on any policy row. 

Header stats show Total Archived and Shown counts for the current search. 

Use the search bar to find an archived policy by name, submitter, or department. 

The table lists Policy Name, CalVant Version, Submitted By, Department, Uploaded On, and Reason (Remarks), with Actions to restore or permanently delete a record. 

With this, you've covered the full Policy Module workflow in CalVant — from monitoring uploads on the Dashboard through to archiving superseded documents. Refer back to any section as needed while managing your policy library. 

![Risk Dashboard overview](/Screenshots/Policy/5.png) 

