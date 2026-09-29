# CalVant — Risk Module User Guide

*Version 1.1 | July 2026*

## 1. Introduction

The Risk Module in CalVant helps you identify, assess, treat, and monitor risks across your organization as part of your compliance and information security management program. It supports structured risk assessments aligned to frameworks such as ISO 27001, ISO 27701, ISO 42001, SOC 2, HIPAA, GDPR, DPDPA, KSA PDPL, and NIST CSF 2. 

This guide follows the module in the order you'll actually use it. 

## 2. Accessing the Risk Module 

After logging in to CalVant, use the left-hand navigation sidebar to move between modules. The sidebar gives you access to the multiple modules, along with account settings at the bottom. 

Click the Risk icon at the top of the sidebar to land on your Risk Dashboard. 

![Risk Dashboard overview](/Screenshots/Risk/1.png) 

## 3. Manual Navigation 

### 3.1  Risk Dashboard 

The Risk Dashboard is your home base for the module. It gives you an at-a-glance summary of all risks in your organization. The screen is organized into three zones: the Overview Zone, the Visual Representation Zone, and the Quick Actions Zone. 

#### Overview Zone 

A row of summary tiles showing total risks, and counts by severity (High / Medium / Low) and status (Open / Closed). 

#### Quick Actions Zone 

Gives one-click access to the most common tasks: 

Templates - Opens the library of Sample Risks you can accept into your risk register 

New Risks - Launches the guided process to add a new risk 

View tasks - Shows tasks assigned to you from risk treatment plans 

View Risks - Opens the departmental risk register/list view 

Statment of Applicability- Opens the Statement of Applicability screen 

###### Visual Representation Zone 

Risk Distribution — a donut chart showing the proportion of risks by severity level. 

Monthly Risk Trends — a bar chart showing how many risks were created each month for the selected year, filterable by year. 

### 3.2  Using Risk Templates (Sample Risks) 

Rather than creating every risk from scratch, CalVant provides a library of pre-built, industrystandard risk templates you can review and accept into your risk register. Access this from Templates in the Quick Actions Zone on the Risk Dashboard. 

The screen's Overview Zone shows summary counts (Total, High, Critical, Medium, Low) above a filterable, sortable list of template risks. Use the Dept and Risk Level filters to narrow the list, or the row-level actions to act on individual risks: 

Accept -  Adds the template risk to your organization's risk register as-is. 

Reject -  Dismisses the template risk without adding it. 

View - Opens a read-only detail view of the full risk before you decide. 

![Risk Dashboard overview](/Screenshots/Risk/3.png) 

### 3.3  Creating a New Risk 

CalVant uses a guided, three-step process to create a new risk: Risk Assessment, then Treatment Planning, then Task Management. You can move between steps with Previous and Next, and use Save to save your progress at any point. 

From the Risk Dashboard, click New Risk under the Quick Actions Zone (or Add Risk). 

Complete Step 1: Risk Assessment to identify and score the risk. 

Complete Step 2: Treatment Planning to define the response and mitigating controls. 

Complete Step 3: Task Management to assign follow-up tasks, e.g., to an owner, with a due date. 

### 3.3.1  Step 1 — Risk Assessment 

![Risk Dashboard overview](/Screenshots/Risk/4.png) 

_The first step captures the core details of the risk: what it is, where it is, and how severe it is. It begins with the Risk Identification fields:_ 

Risk ID - Auto-suggested (e.g., RR-2026-001), or click Generate New ID. CalVant warns you if the ID already exists. 

Department -  The department that owns or is affected by the risk. 

Date -  The date the risk is being recorded (defaults to today). 

Risk Type -  Category of the risk, e.g., Privacy, Artificial Intelligence, Operational. 

Asset Type - The classification of the affected asset (Public, Private, Sensitive, Confidential) 

Asset - The classification and name of the affected asset. 

![Risk Dashboard overview](/Screenshots/Risk/5.png) 

_The next part of the same step captures Threat & Vulnerabilities and calculates the risk score:_ 

Threat - Select the applicable threat it exploits. 

Vulnerabilities - Select the applicable vulnerabilities it exploits. 

Risk Description - Auto-filled from the Threat and Vulnerabilities selected, or entered manually. 

Likelihood - The probability level of the risk occurring. 

Existing Controls -  Controls already implemented that reduce this risk. 

As you complete Likelihood and the related fields, CalVant automatically calculates the Impact Score, Likelihood Score, Risk Score, and resulting Risk Level, shown as a colored badge — Low, Medium, High, or Critical. 

### 3.3.2  Step 2 — Treatment Planning 

_This step defines how the organization will respond to the risk and which compliance controls apply._ 

![Risk Dashboard overview](/Screenshots/Risk/6.png) 

Action - The treatment strategy for the risk based on its severity — Mitigate or Accept. 

Status -  Current status of the treatment — Open, In Progress, or Closed. 

New/Proposed Controls Free-text field to describe new controls proposed to treat the risk. 

Under Applicable Control(s), select the compliance framework(s) relevant to this risk — for example ISO 27001, KSA PDPL, GDPR, DPDPA, HIPAA, SOC 2 or etc. 

CalVant then displays the specific control codes that you have now selected and hence applies. 

![Risk Dashboard overview](/Screenshots/Risk/7.png) 

_The Task Scheduling section on this same step captures:_ 

Start Date - The date treatment work begins. Auto-generated to the present date. 

Number of Days - How many days are allotted to complete treatment. Once number of days are alloted CalVant calculates and displays the target completion date. 

Residual Risk Assessment - shows the original Likelihood, Impact, and Risk Score from Step 1 for reference. 

Now you have to enter the Likelihood of the risk to ocur again after Treatment and Impact After Treatment to calculate the residual Risk Score and Risk Level once controls are applied. 

Recommended Actions will also be displayed at the bottom. 

![Risk Dashboard overview](/Screenshots/Risk/8.png) 

### 3.3.3  Step 3 — Task Management

The final step converts the treatment plan into a trackable action plan — tasks with an owner and due date so the mitigation work is followed through to completion. 

![Risk Dashboard overview](/Screenshots/Risk/9.png) 

Complete the following fields to create a mitigation task for the selected risk: 

![Risk Dashboard overview](/Screenshots/Risk/10.png)  

_CalVant — Risk Module User Guide_ 

Department - Select the department responsible for completing the task. 

Assign To -  Select the employee who will be responsible for the task. 

Task Description -  Enter a brief description of the mitigation activity to be performed. 

Priority -  Select the task priority: Low, Medium, High, or Critical. 

Start Date - Select the date on which work on the task is expected to begin. 

End Date - Select the target completion date for the task. 

Save Task - Saves the task and associates it with the current risk. 

Cancel - Closes the window without saving the task. 

Click Add Task to create a task for the risk which will send the assignee an email notification with all required details and deadline of the task assigned to him/her. 

Completed tasks and their status can be reviewed from View Tasks on the dashboard or from the Task module in the sidebar. 

### 3.4  Viewing Saved Risk Assessments 

![Risk Dashboard overview](/Screenshots/Risk/11.png) 

Once risks have been created or accepted, you will be automatically redirected to list under Saved Risk Assessments, which is also accessible via View Risks in the Quick Actions Zone on the dashboard. This is your working risk register. 

The screen's Overview Zone shows the total number of risks and a breakdown by severity (High, Critical, Medium, Low) and status (Open, Closed), along with a timestamp of when the list was last generated. Each row shows the Risk ID and Description — click a row to open its full details. From here you can also click Generate SoA to jump directly to the Statement of Applicability. 

### 3.5  Viewing Tasks 

![Risk Dashboard overview](/Screenshots/Risk/12.png) 

The View Tasks screen lists every task assigned to you from risk treatment plans across your organization. Access it from View Tasks in the Quick Actions Zone on the Risk Dashboard. 

_CalVant — Risk Module User Guide_ 

The Overview Zone shows Total, In Progress, Completed, On Hold, and Critical task counts. Use the All filter chip or the search box, searching by task or Risk ID, to narrow the list. 

Task ID / Description - The unique identifier and a short summary of the task. 

Risk ID -  The risk this task was created to treat. 

Assignee / Priority -  Who is responsible for the task, and its urgency. 

Start Date / Due Date -  The scheduled window for completing the task. 

Status - Current progress, e.g., In Progress, Completed, On Hold. 

### 3.6  Generating a Statement of Applicability (SoA) 

![Risk Dashboard overview](/Screenshots/Risk/13.png) 

The SoA is a master record of every control across your selected compliance frameworks, and whether each is applicable to your organization — a required artifact for certifications such as ISO 27001. 

Access it from Statement of Applicability in the Quick Actions Zone on the dashboard, or Generate SoA from the Saved Risk Assessments screen. 

The Overview Zone shows Total Controls, controls marked SoA Applicable, controls with mappings, and the count for the active frameworks. 

Use the Framework filter row to switch between viewing All Frameworks or a single framework. 

Use the search box to find a control by name, title, or mapped code, and the sort dropdown to reorder results. 

For each requirement row, review the Requirement text and Framework tag, toggle the Applicable checkbox, and record a Justification — e.g., Risk Identified, Regulatory Requirement, Management Decision, or others from the dropdown menu. 

Click Save Changes button highlighted in green on top left after completion of the process, and click on confirm. 

With this, you've covered the full Risk Module workflow in CalVant — from identifying a risk on the Dashboard through to generating your Statement of Applicability. Refer back to any section as needed while building out your risk register. 

_CalVant — Risk Module User Guide_ 
