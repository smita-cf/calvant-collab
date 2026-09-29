# **Risk Assessment & Risk Treatment (RA-RTP)**

As the next step in Calvant, following completion of the Gap Assessment, you need to conduct a complete Risk Assessment and Risk Treatment Plan (RA-RTP) for your organisation, in accordance with the requirements of **ISO/IEC 27001:2022**.

This phase begins with a Risk Assessment methodology workshop for Risk Owners, followed by regular coordination and guidance as each division completes its RA-RTP.

For this, visit the [**"Risks"**](/help-center/risk-module) module of Calvant.

## Complete the following tasks:

### 1. Access the Risk Dashboard

The Risk Dashboard is the home base for the Risk module. It gives Risk Owners and reviewers an at-a-glance summary of all risks across the organisation, along with one-click access to the workflows used to complete the RA-RTP.

#### 1A. Open the Risk Dashboard

**Risks → Risk Dashboard**

**A.** From the main sidebar, click **'Risks'** to open the Risk Dashboard.

The Risk Dashboard is your home base for the module. It gives you an at-a-glance summary of all risks in your organization. The screen is organized into three zones: the **Overview Zone**, the **Visual Representation Zone**, and the **Quick Actions Zone.**

##### Overview Zone

A row of summary tiles showing **'Total risks'**, and counts by **'Severity' (High / Medium / Low)** and **'Status (Open / Closed)'**.

##### Quick Actions Zone

Gives one-click access to the most common tasks:

- **'Templates'** - Opens the library of Sample Risks you can accept into your risk register
- **'New Risks'** - Launches the guided process to add a new risk
- **'View tasks'** - Shows tasks assigned to you from risk treatment plans
- **'View Risks'** - Opens the departmental risk register/list view
- **'Statment of Applicability'** - Opens the Statement of Applicability screen

##### Visual Representation Zone

- **'Risk Distribution'** — a donut chart showing the proportion of risks by severity level.
- **'Monthly Risk Trends'** — a bar chart showing how many risks were created each month for the selected year, which is filterable by year.

![Figure 1: @ ccaivante e- "Risks Dashboard fu jy ET ©...| : : nd : a © coe ete e: o a a Sirens Mthisk Trends © ers o Vertihe mero. ===»](/Screenshots/Infosec/risk-assessment/1.png)

_Figure 1: Risks Dashboard — sidebar navigation and Quick Actions panel._

### 2. Review Sample Risk Templates

Rather than creating every risk from scratch, Calvant provides a library of pre-built, industrystandard risk templates that Risk Owners can review and accept into their division's risk register.

#### 2A. Open Sample Risks

**Risks → Templates**

**A.** On the Risk Dashboard, click **'Templates'** under Quick Actions to open **'Sample Risks'**. Use the **'Department'** and **'Risk Level'** filters to narrow the list, and the row-level actions — **'Accept'** (adds the template risk to the register as-is), **'Reject'** (dismisses it), or **'View'** (opens a read-only detail view) — to act on individual risks.

![Figure 2: © ara oO: S esa Ie 340 oe: eo o" eo ° sg ane i epeerruarrporiner-~aaaa a 9 on Ds aD © Cravcuneeveeerncrnaecceercaaenenn emmememcnmeetce reais 0 - a](/Screenshots/Infosec/risk-assessment/2.png)

_Figure 2: Sample Risks — Templates library with Accept, Reject, and View actions._

### 3. Record the Risk Assessment — Step 1

If the existing risks from the template are not suitable, Calvant provides a guided process to create a new risk and manage it through a three-step process: **Risk Assessment,** followed by **Treatment Planning**, and then **Task Management**.

**Risks → New Risk → Risk Assessment**

#### 3A. Risk Identification fields

**A.** Click **'New Risk'** from the Quick Actions panel in the main dashboard. Under **Risk Assessment**, complete the:

- **'Risk ID'** - Auto-suggested, or type a new ID.
- **'Department'** - Select the name of the department the particular risk belong to
- **'Date'** - Auto calculated to the present date)
- **'Risk Type'** - Select **'Security'** for the drop down
- **'Asset Type'** - Select the appropriate asset classification from: Public, Private, Sensitive, or Confidential.
- **'Asset'** - Enter the name of asset

![Figure 3: © catvants oO: fc 2 eS](/Screenshots/Infosec/risk-assessment/3.png)

_Figure 3: Risk Assessment — Risk Identification fields._

#### 3B. Threat & Vulnerabilities and risk scoring

**B.** Under **'Threat & Vulnerabilities'**, enter the applicable threat and vulnerability details to calculate the risk score based on:

- **'Threat'** - Select the applicable threat it exploits.
- **'Vulnerabilities'** - Select the applicable vulnerabilities it exploits.
- **'Risk Description'** - Auto-filled from Threat and Vulnerability, or can be edited manually as well.
- **'Likelihood'** - The probability level of the risk occurring.
- **'Existing Controls'** - Controls already implemented that reduce this risk.

As you complete Likelihood and the related fields, CalVant automatically calculates the Impact Score, Likelihood Score, Risk Score, and resulting Risk Level, shown as a colored badge — **Low, Medium, High, or Critical.**

![Figure 4: © coven oO« ° ie e es cp](/Screenshots/Infosec/risk-assessment/4.png)

_Figure 4: Risk Assessment — Threat & Vulnerabilities, risk scoring, and Existing Controls._

Click **'Save'** to save progress, then **'Next'** to proceed to Treatment Planning.

### 4. Define the Treatment Plan — Step 2

This step defines how each division will respond to the risk and which compliance controls apply — the treatment-plan component of the updated risk register deliverable.

**Risks → New Risk → Treatment Planning**

#### 4A. Action, Status, New/Proposed Controls

**A.** Select the **'Action'** — **Mitigate** or **Accept** — based on the risk's severity, and set the **'Status'** — **Open, In Progress**, or **Closed** (based on the risk treatments current status)

Describe any **'New/Proposed Controls'** in the free-text field.

![Figure 5: © conants O- b= I oer 'Treatment Plan ee—_ " Control implementation — 28](/Screenshots/Infosec/risk-assessment/5.png)

_Figure 5: Treatment Planning — Action, Status, and New/Proposed Controls._

#### 4B. Applicable Control(s)

**B.** Under **'Applicable Control(s)'**, select the compliance framework(s) relevant to the risk — in this case select **ISO 27001**.

Calvant then displays the ISO 27001 specific clause and control codes, select ones which apply.

![Figure 6: © corants o- Lo= lak nt 'Applicableall Controls 2.](/Screenshots/Infosec/risk-assessment/6.png)

_Figure 6: Treatment Planning — Applicable Control(s) and the mapped control code._

#### 4C. Task Scheduling

**C.** Under **Task Scheduling**, the **'Start Date'** auto-generates to the present date; enter the **'Number of Days'** allotted for treatment, and Calvant calculates the target completion date.

#### 4D. Residual Risk Assessment

**D.** **Residual Risk Assessment** shows the original Likelihood, Impact, and Risk Score from Step 1. Enter the **'Likelihood After Treatment'** and **'Impact After Treatment'** to calculate the residual Risk Score and Risk Level once controls are applied; **Recommended Actions** are then displayed.

![Figure 7: © conants oO: Fe =. a . adver Treatment ImpactAfter Treatment](/Screenshots/Infosec/risk-assessment/7.png)

_Figure 7: Treatment Planning — Task Scheduling and Residual Risk Assessment._

Click **'Save'** to save progress, then **'Next'** to proceed to Task Management.

### 5. Assign a Mitigation Task — Step 3

The final step converts the treatment plan into a trackable action — a task with an owner and a due date — so the mitigation work is followed through to completion.

**Risks → New Risk → Risk Assessment → Treatment Planning → Task Management**

#### 5A. Add Task

**A.** Under **Action Plan**, click **'Add Task'**.

![Figure 8: © canvant og : == ; Om ersenome o-~-- — : : e —~ pep](/Screenshots/Infosec/risk-assessment/8.png)

_Figure 8: Task Management — Action Plan and the Add Task button._

#### 5B. Complete the Add Task window

**B.** In the **'Add Task'** window, from each drop down complete **'Department', 'Assign To', 'Task Description'**, and **'Priority'** (**Low, Medium, High**, or **Critical**), then set the **'Start Date'** and **'End Date'**.

- Click **'Save Task'** to save it and associate it with the risk, or **'Cancel'** to close without saving — this sends the assignee an email notification with all task details and the deadline.

![Figure 9: © covert O- = o~ Ey](/Screenshots/Infosec/risk-assessment/9.png)

_Figure 9: Add Task — task fields for the mitigation activity._

Clicking on **'Save Task'** will send the assignee an email notification with all required details and deadline of the task assigned to him/her.

Completed tasks and their status can be reviewed from **'View Tasks'** on the dashboard or from the Task module in the sidebar.

### 6. Review the Risk Register

Once risks have been created or accepted, they are added to **'Saved Risk Assessments'** — the division's working risk register, and the source for the updated Risk Register deliverable of this phase.

**Risks → New Risk → Risk Assessment → Treatment Planning → Task Management → View Risks**

#### 6A. Access Saved Risk Assessments

**A.** Access this list via **'View Risks'** in the Quick Actions panel. The Overview Zone shows the total number of risks and a breakdown by severity (**High, Critical, Medium, Low**) and status (**Open, Closed**), along with a timestamp of when the list was last generated. Click a row to open its full details, or click **'Generate SoA'** to jump directly to the Statement of Applicability.

![Figure 10: O on °- = sere ssesnen 59 a: eo eo" oe 52 7](/Screenshots/Infosec/risk-assessment/10.png)

_Figure 10: Saved Risk Assessments — the division's working risk register._

#### 6B. Edit an existing risk

**B.** The existing list of risks can also be edited by scrolling through the list and clicking the **'Edit'** option. This takes the user back to **'Step 1 – Risk Assessment'**, where the existing risk details can be updated or additional details can be entered as required.

**Risks → New Risk → Risk Assessment → Treatment Planning → Task Management → View Risks → Edit Risks**

![Figure 11: © cavant e- G . 78 GB' oe: e° n 7 ms of required competencies 23-04-2026 1 oF Ce © os 6 'mechani bacaus of inasaquate system control fo capturing and Haring content wisence 2s.042006 a etm ome EIB soe e notraqures comoatencae 23.00.2000 1 tow Ce co: . oacaue of rsticed rivlaged acces 0-082028 ° tow Ce oc: ee nops02e 3 ew we EB naoproorine data because of inadequate aching ad documentation of data sources 2008 ° tow Ce co es andor it management processes 08.2028 a ta oe = r. m--a%8 2 ow ct EIB soem sn of svance of» documented poly to-obame ° tow Ce 2 eo 8-08-2008 2 tow Come co: oe](/Screenshots/Infosec/risk-assessment/11.png)

_Figure 11: Edit Risk Assessments._

![Figure 12: © caivant» 6- ale fo} : . s yest classification e nee ec](/Screenshots/Infosec/risk-assessment/12.png)

_Figure 12: Back to Step 1 - Risk Treatments._

### 7. Track Treatment Tasks

Use **'View Tasks'** to monitor progress on every mitigation task raised from risk treatment plans, as part of the ongoing coordination and guidance provided to Risk Owners.

#### 7A. Access View Tasks

**Risks → View Tasks**

**A.** Access it from **'View Tasks'** in the Quick Actions panel. The Overview Zone shows **Total, In Progress, Completed, On Hold**, and **Critical** task counts. Use the **'All'** filter chip or the search box — searching by task or Risk ID — to narrow the list, which shows each task's **Risk ID, Assignee, Priority, Start date, Due Date**, and **Status**.

![Figure 13: © cn 5. I on™ a Brin Bran Olin Bln. : fo o](/Screenshots/Infosec/risk-assessment/13.png)

_Figure 13: View Tasks — tasks assigned from risk treatment plans._

### 8. Generate the Statement of Applicability (SoA)

The SoA is a master record of every control across the selected compliance frameworks, in this case ISO 27001, and whether each is applicable to the organisation — a required artifact for certifications such as ISO 27001, and the second deliverable of this phase.

#### 8A. Access the SoA screen

**Risks → Statement of Applicability**

**A.** Access it via **'Statement of Applicability'** in the Quick Actions panel, or **'Generate SoA'** from Saved Risk Assessments. Use the **'Framework'** filter row to switch between **'All Frameworks'** and a single framework, and the search box to find a control by name, title, or mapped code.

#### 8B. Complete each requirement row

**B.** For each requirement row, review the **Requirement** text and **Framework** tag, toggle the **'Applicable'** checkbox, and record a **'Justification'** — **Risk Identified, Regulatory Requirement**, or **Management Decision** — from the dropdown.

![Figure 14: © chan o- le Ie = » Statement of Applicability SoA romero: YEH :022001070 savoroy ovona eo oven sos rani | wstesr2iios 02700 29 ' e {x0} 2 co i Menezenert 5 e](/Screenshots/Infosec/risk-assessment/14.png)

_Figure 14: Statement of Applicability — requirement rows, Applicable toggle, and Justification._

#### 8C. Save Changes

**C.** Click **'Save Changes'** and confirm to complete the SoA.

With this, the RA-RTP phase is complete: the _updated Risk Register for all divisions_ (including identified risks and treatment plans) and the _Statement of Applicability_ are ready for review.
