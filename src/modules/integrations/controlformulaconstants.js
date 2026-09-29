// src/modules/riskAssesment/controlformulaconstants.js

/**
 * CONTROL_FORMULA_MAPPING
 * Full mapping of every controlId → formula / measurement logic.
 * Shown in the Evidence column when no live evidence data is available.
 * Aligned with ISO 27001:2022 control names from CONTROL_MAPPING.
 */
export const CONTROL_FORMULA_MAPPING = {

    // ── Section 5 – Organisational Controls ───────────────────────────────────

    "5.1": "Policies for Information Security: (Approved & Published Security Policies / Total Required Policies) × 100",
    "5.2": "Information Security Roles & Responsibilities: (Roles with Documented Security Responsibilities / Total Security Roles Defined) × 100",
    "5.3": "Segregation of Duties: (Roles with SoD-compliant Policy Assignments / Total IAM Roles) × 100",
    "5.4": "Management Responsibilities / MFA: (Users with MFA Enabled / Total IAM Users) × 100",
    "5.5": "Contact with Authorities: (Documented Authority Contacts Reviewed in Period / Total Required Authority Contacts) × 100",
    "5.6": "Contact with Special Interest Groups: (Active Group Memberships Reviewed / Total Registered Memberships) × 100",
    "5.7": "Threat Intelligence: (Threats Detected & Actioned / Total Threats Identified in Period) × 100",
    "5.8": "Information Security in Project Management: (Projects with Security Review Completed / Total Active Projects) × 100",
    "5.9": "Asset Inventory: (Assets with Assigned Owner / Total Discovered Assets) × 100",
    "5.10": "Acceptable Use of Assets: (Users with Signed Acceptable Use Agreement / Total Active Users) × 100",
    "5.11": "Return of Assets: (Assets Returned upon Offboarding / Total Assets Assigned to Departed Users) × 100",
    "5.12": "Classification of Information: (Information Assets with Classification Label / Total Information Assets) × 100",
    "5.13": "Labelling of Information: (Labelled Information Assets / Total Classified Information Assets) × 100",
    "5.14": "Information Transfer: (Transfer Agreements in Place / Total Active Data Transfer Channels) × 100",
    "5.15": "Access Control: (Approved & Active User Accounts / Total User Accounts) × 100",
    "5.16": "Identity Management: (Identities with Verified Lifecycle Records / Total Managed Identities) × 100",
    "5.17": "Authentication Information: Password policy configured with minimum length, complexity, rotation interval & MFA enforced",
    "5.18": "Access Rights: (Access Rights Reviewed & Recertified in Period / Total Access Rights Granted) × 100",
    "5.19": "Information Security in Supplier Relationships: (Suppliers with Active Security Assessment / Total Registered Suppliers) × 100",
    "5.20": "Supplier Agreements: (Suppliers with Information Security Clauses in Contract / Total Active Supplier Contracts) × 100",
    "5.21": "ICT Supply Chain Security: (ICT Suppliers with Verified Security Controls / Total ICT Suppliers) × 100",
    "5.22": "Supplier Service Monitoring: (SLA Obligations Met / Total SLA Obligations in Period) × 100",
    "5.23": "Cloud Services Recording: (Cloud Services Recorded & Approved in Config / Total Active Cloud Services) × 100",
    "5.24": "Incident Management Planning: (Incident Response Plan Steps Documented & Tested / Total Required Plan Steps) × 100",
    "5.25": "Incident Assessment: (Security Events Classified & Triaged within SLA / Total Security Events Raised) × 100",
    "5.26": "Incident Response: (Incidents Resolved within Target Resolution Time / Total Resolved Incidents) × 100",
    "5.27": "Learning from Incidents: (Post-Incident Reviews Completed / Total Major Incidents in Period) × 100",
    "5.28": "Evidence Collection: (Incidents with Documented & Preserved Evidence / Total Incidents Raised) × 100",
    "5.29": "Business Continuity: (Completed DR Steps / Total Required DR Steps) × 100",
    "5.30": "ICT Readiness / Uptime: (System Uptime Datapoints / Total Monitoring Datapoints) × 100",
    "5.31": "Legal & Regulatory Compliance: (Applicable Requirements with Documented Compliance / Total Identified Requirements) × 100",
    "5.32": "Intellectual Property Rights: (Licensed Software Assets in Compliance / Total Software Assets in Use) × 100",
    "5.33": "Records Protection / Backup: (Successfully Completed Backup Jobs / Total Scheduled Backup Jobs) × 100",
    "5.34": "PII Privacy Protection: (Systems Handling PII with Privacy Controls Implemented / Total PII-Processing Systems) × 100",
    "5.35": "Independent Security Review: (Audit Findings Remediated in Period / Total Audit Findings Raised) × 100",
    "5.36": "Compliance with Policies & Standards: (Controls Assessed as Compliant / Total Controls in Scope) × 100",
    "5.37": "Documented Operating Procedures: (Operational Procedures Documented & Approved / Total Required Operating Procedures) × 100",

    // ── Section 6 – People Controls ───────────────────────────────────────────

    "6.1": "Screening: (Employees with Completed Pre-Employment Screening / Total New Hires in Period) × 100",
    "6.2": "Terms & Conditions of Employment: (Employees with Signed Security Terms / Total Active Employees) × 100",
    "6.3": "Security Awareness Training: (Employees who Completed Security Training / Total Active Employees) × 100",
    "6.4": "Disciplinary Process: (Documented Disciplinary Cases Handled per Policy / Total Security Policy Violations) × 100",
    "6.5": "Responsibilities after Termination: (Offboarded Users with Access Revoked within SLA / Total Offboarded Users in Period) × 100",
    "6.6": "Confidentiality Agreements: (Employees & Contractors with Signed NDA / Total Employees & Contractors) × 100",
    "6.7": "Remote Working: (Remote Workers with Compliant Endpoint & VPN Configuration / Total Remote Workers) × 100",
    "6.8": "Security Event Reporting: (Security Events Reported through Official Channel / Total Security Events Identified) × 100",

    // ── Section 7 – Physical Controls ─────────────────────────────────────────

    "7.1": "Physical Security Perimeter: (Secure Perimeter Zones with Access Controls Verified / Total Defined Secure Zones) × 100",
    "7.2": "Physical Entry Controls: (Access Points with Working Entry Controls / Total Physical Access Points) × 100",
    "7.3": "Securing Offices, Rooms & Facilities: (Facilities with Security Measures Verified / Total Facilities in Scope) × 100",
    "7.4": "Physical Security Monitoring: (CCTV / Sensor Coverage Points Active / Total Required Monitoring Points) × 100",
    "7.5": "Physical & Environmental Threat Protection: (Threats with Mitigation Controls in Place / Total Identified Physical Threats) × 100",
    "7.6": "Working in Secure Areas: (Secure Area Access Incidents Reported & Resolved / Total Secure Area Access Events) × 100",
    "7.7": "Clear Desk & Clear Screen: (Workstations Compliant on Spot Check / Total Workstations Audited) × 100",
    "7.8": "Equipment Siting & Protection: (Equipment with Documented Siting & Protection Review / Total Equipment Assets) × 100",
    "7.9": "Security of Off-Premises Assets: (Off-Premises Assets with Active Security Controls / Total Off-Premises Assets) × 100",
    "7.10": "Storage Media: (Storage Media Accounted for in Asset Register / Total Storage Media in Use) × 100",
    "7.11": "Supporting Utilities: (Utility Checks Passed / Total Scheduled Utility Inspections) × 100",
    "7.12": "Cabling Security: (Cable Runs with Physical Protection Verified / Total Cable Runs in Scope) × 100",
    "7.13": "Equipment Maintenance: (Equipment with Maintenance Up to Date / Total Equipment Assets Requiring Maintenance) × 100",
    "7.14": "Secure Disposal or Re-use of Equipment: (Devices Securely Wiped or Destroyed per Policy / Total Decommissioned Devices) × 100",

    // ── Section 8 – Technological Controls ────────────────────────────────────

    "8.1": "User Endpoint Devices: (Endpoints with EDR, Encryption & Patch Compliance / Total Managed Endpoints) × 100",
    "8.2": "Privileged Access Rights: (Privileged Accounts Reviewed & Recertified in Period / Total Privileged Accounts) × 100",
    "8.3": "Information Access Restriction: (IAM Users Compliant with MFA + Password Policy / Total IAM Users) × 100",
    "8.4": "Access to Source Code: (Repositories with Role-Based Access Control Enforced / Total Source Code Repositories) × 100",
    "8.5": "Secure Authentication: (Systems with MFA or Certificate-Based Auth Enabled / Total Systems Requiring Authentication) × 100",
    "8.6": "Capacity Management: Active Capacity Incidents + Active Alarms = 0 → 100% Compliant | Any Active Incident or Alarm → 0%",
    "8.7": "Protection Against Malware: (Endpoints with Active & Updated Anti-Malware / Total Managed Endpoints) × 100",
    "8.8": "Technical Vulnerability Management: (Known Vulnerabilities Remediated within SLA / Total Vulnerabilities Identified in Period) × 100",
    "8.9": "Configuration Management: (Config Changes within Approved Change Window / Total Config Changes Recorded) × 100",
    "8.10": "Information Deletion: (Data Deletion Requests Fulfilled within Policy Timeframe / Total Data Deletion Requests) × 100",
    "8.11": "Data Masking: (Systems with PII / Sensitive Data Masking Implemented / Total Systems Handling Sensitive Data) × 100",
    "8.12": "Data Leakage Prevention: (DLP Policy Violations Blocked or Resolved / Total DLP Policy Violation Events) × 100",
    "8.13": "Information Backup: (Successfully Completed Backup Jobs / Total Scheduled Backup Jobs) × 100",
    "8.14": "Redundancy of Processing Facilities: (Critical Systems with Active Redundancy Verified / Total Critical Systems) × 100",
    "8.15": "Logging: (Systems with Centralised Logging Enabled & Retained per Policy / Total Systems in Scope) × 100",
    "8.16": "Monitoring Activities: (Security Monitoring Alerts Reviewed within SLA / Total Security Monitoring Alerts Generated) × 100",
    "8.17": "Clock Synchronisation: (Systems Synchronised to Approved NTP Source / Total Systems in Scope) × 100",
    "8.18": "Use of Privileged Utility Programs: (Privileged Tool Usage Events with Approval Record / Total Privileged Tool Usage Events) × 100",
    "8.19": "Software Installation on Operational Systems: (Approved Software Installations / Total Software Installation Events) × 100",
    "8.20": "Network Security Management: (Network Segments with Security Controls Verified / Total Network Segments) × 100",
    "8.21": "Security of Network Services: (Network Service SLAs with Security Requirements Met / Total Network Service SLAs) × 100",
    "8.22": "Segregation of Networks: (Network Zones with Enforced Segmentation Policy / Total Defined Network Zones) × 100",
    "8.23": "Web Filtering: (Web Access Requests Filtered & Logged / Total Web Access Requests) × 100",
    "8.24": "Cryptography: (KMS Keys using Approved Algorithm Spec / Total KMS Keys in Use) × 100",
    "8.25": "Secure Development Life Cycle: (Development Stages with Security Gate Passed / Total SDLC Stages in Scope) × 100",
    "8.26": "Application Security Requirements: (Applications with Documented Security Requirements / Total Applications in Development) × 100",
    "8.27": "Secure System Architecture: (Systems Designed & Reviewed against Secure Architecture Principles / Total Systems in Scope) × 100",
    "8.28": "Secure Coding: (Code Repositories with SAST Scan Passing / Total Active Code Repositories) × 100",
    "8.29": "Security Testing: (Releases with Completed Security Test Evidence / Total Production Releases in Period) × 100",
    "8.30": "Outsourced Development: (Outsourced Development Engagements with Security Review Completed / Total Outsourced Engagements) × 100",
    "8.31": "Environment Separation: (Authorized Cross-Environment Events / Total Cross-Environment Events) × 100 | SCP enforced → Compliant",
    "8.32": "Change Management: (Changes Processed through Approved Change Management Process / Total Changes Raised) × 100",
    "8.33": "Test Information: (Test Environments using Anonymised or Synthetic Data / Total Test Environments) × 100",
    "8.34": "Audit Testing Protection: (Audit Activities Completed without System Impact / Total Audit Testing Activities) × 100",

    // ── Vendor / Service-specific ──────────────────────────────────────────────

    "GuardDuty": "GuardDuty Findings: No Active HIGH or CRITICAL Findings → 100% Compliant | Active Findings Present → 0%",
};