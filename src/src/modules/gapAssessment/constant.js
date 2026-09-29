// constants.js
export const ISO_27001_CLAUSES = [
  {
    clause: "4.1 Understanding the organization and its context",
    standardRequirement:
      "The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcome(s) of its information security management system.",
    auditQuestions: [
      "Have the internal and external issues that are relevant to the organization's ISMS been determined?",
      "Have the impact and the risk associated with the issues been determined?",
      "Has a remediation plan for issues been documented?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause:
      "4.2 Understanding the needs and expectations of interested parties",
    standardRequirement:
      "The organization shall determine: a) interested parties that are relevant to the information security management system; and b) the requirements of these interested parties relevant to information security.",
    auditQuestions: [
      "Has the organization determined the interested parties that are relevant to the ISMS?",
      "Has the organization determined the needs and expectations of these interested parties?",
      "Have the requirements of these interested parties been determined, including legal, regulatory, and contractual requirements?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause:
      "4.3 Determining the scope of the information security management system",
    standardRequirement:
      "The organization shall determine the boundaries and applicability of the information security management system to establish its scope. Consider external and internal issues, requirements of interested parties, and interfaces and dependencies with other organizations.",
    auditQuestions: [
      "Have the boundaries and applicability of the ISMS been determined to establish its scope, taking into consideration the external and internal issues, the requirements of interested parties, and the interfaces and dependencies with other organizations?",
      "Has the organization defined the scope of ISMS including the in-scope departments, interfaces, dependencies, and locations?",
      "Is the ISMS scope documented?",
    ],
    department: ["ISMS Steering Committee"],
  },
  {
    clause: "4.4 Information security management system",
    standardRequirement:
      "The organization shall establish, implement, maintain and continually improve an information security management system, in accordance with the requirements of this International Standard.",
    auditQuestions: ["Has the organization determined the relevant document?"],
    department: ["ISMS Steering Committee"],
  },
  {
    clause: "5.1 Leadership and commitment",
    standardRequirement:
      "Top management shall demonstrate leadership and commitment with respect to the ISMS by establishing policy, objectives, integrating requirements into processes, ensuring resources, and communicating the importance of information security.",
    auditQuestions: [
      "Is the organization’s leadership commitment to the ISMS demonstrated by establishing the information security policy and objectives, compatible with the strategic direction of the organization, and in promotion of continual improvement?",
      "Has the leadership ensured the integration of the ISMS requirements into its business processes?",
      "Has the leadership ensured resources are available for the ISMS, and directed and supported individuals, including management, who contribute to its effectiveness?",
      "Has the leadership communicated the importance of effective information security and conformance to ISMS requirements?",
      "Has the leadership directed and supported relevant roles to contribute to the effectiveness of the ISMS?",
    ],
    department: ["ISMS Steering Committee"],
  },
  {
    clause: "5.2 Policy",
    standardRequirement:
      "Top management shall establish an information security policy that is appropriate to the purpose of the organization, includes objectives, commitment to satisfy applicable requirements, and continual improvement.",
    auditQuestions: [
      "Is there an established information security policy that is appropriate to ISMS?",
      "Does the information security policy provide a framework for setting objectives and demonstrate commitment for continual improvement of the ISMS?",
      "Is the policy documented and communicated to employees and relevant interested parties?",
    ],
    department: ["ISMS Steering Committee"],
  },
  {
    clause: "5.3 Organizational roles, responsibilities and authorities",
    standardRequirement:
      "Top management shall ensure responsibilities and authorities for roles relevant to information security are assigned and communicated.",
    auditQuestions: [
      "Are the roles, responsibilities, and authorities relevant to ISMS scope clearly defined and communicated?",
      "Is the organization chart defined and in line with the defined roles and responsibilities?",
      "Are the responsibilities and authorities for conformance and reporting on ISMS performance assigned?",
    ],
    department: ["ISMS Steering Committee"],
  },
  {
    clause: "6.1.1 Actions to address risks and opportunities - General",
    standardRequirement:
      "The organization shall consider the issues referred to in 4.1 and 4.2 and determine risks and opportunities to ensure the ISMS achieves its intended outcomes, prevents/reduces undesired effects, and achieves continual improvement.",
    auditQuestions: [
      "Have the internal and external issues, and the requirements of interested parties been considered to determine the risks and opportunities that need to be addressed to ensure that the ISMS achieves its outcome?",
      "Have actions to address risks and opportunities been planned, and integrated into the ISMS processes, and are they evaluated for effectiveness?",
      "Has an information security risk assessment process that establishes the criteria for performing information security risk assessments, including risk acceptance criteria been defined?",
      "Is the information security risk assessment process repeatable and does it produce consistent, valid and comparable results?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "6.1.2 Information security risk assessment",
    standardRequirement:
      "The organization shall define and apply an information security risk assessment process to identify, analyse, and evaluate information security risks.",
    auditQuestions: [
      "Does the information security risk assessment process identify risks associated with loss of confidentiality, integrity and availability for information within the scope of the ISMS, and are risk owners identified?",
      "Are information security risks analysed to assess the realistic likelihood and potential consequences that would result if they were to occur, and have the levels of risk been determined?",
      "Are information security risks compared to the established risk criteria and prioritised?",
      "Is documented information about the information security risk assessment process available?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "6.1.3 Information security risk treatment",
    standardRequirement:
      "The organization shall define and apply an information security risk treatment process to select treatment options, determine necessary controls, compare to Annex A, produce Statement of Applicability, and formulate a risk treatment plan.",
    auditQuestions: [
      "Is there an information security risk treatment process to select appropriate risk treatment options for the results of the information security risk assessment, and are controls determined to implement the risk treatment option chosen?",
      "Have the controls determined been compared with ISO/IEC 27001:2022 Annex A to verify that no necessary controls have been missed?",
      "Has a Statement of Applicability been produced to justify Annex A exclusions and inclusions together with the control implementation status?",
      "Has the organization formulated an information security risk treatment plan and obtained the risk owners’ approval for residual risk acceptance?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "6.2 Information security objectives and planning to achieve them",
    standardRequirement:
      "The information security objectives shall be consistent with the policy, measurable, take into account requirements and risk results, be communicated, and updated as appropriate.",
    auditQuestions: [
      "Have measurable ISMS objectives and targets been established, documented and communicated throughout the organization?",
      "In setting its objectives, has the organization determined what needs to be done, when and by whom?",
      "Is everyone within the organization’s control aware of the importance of the information security policy, their contribution to the effectiveness of the ISMS and the implications of not conforming?",
      "Has the organization determined the need for internal and external communications relevant to the ISMS, including what to communicate, when, with whom, and by whom, and the processes by which this is achieved?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "7.1 Resources",
    standardRequirement:
      "The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the ISMS.",
    auditQuestions: [
      "Has the organization determined the resources needed for ISMS?",
    ],
    department: ["ISMS Steering Committee"],
  },
  {
    clause: "7.2 Competence",
    standardRequirement:
      "The organization shall ensure persons doing work under its control affecting IS performance are competent through education, training, or experience.",
    auditQuestions: [
      "Has the organization determined the competency of the persons relevant to ISMS?",
      "Has the organization taken corrective measures to acquire the necessary competency of the persons relevant to ISMS?",
      "Has the organization retained information as evidence for showcasing that the persons relevant to ISMS have necessary competency?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "7.3 Awareness",
    standardRequirement:
      "The organization shall ensure persons are aware of the information security policy, their contribution to ISMS effectiveness, and implications of not conforming.",
    auditQuestions: [
      "Has the organization defined and documented an Information Security Awareness Plan?",
      "Do employees undergo security awareness sessions upon hire and on a periodic basis?",
      "Does the organization have a method to evaluate the effectiveness of the awareness training?",
      "How does the organization ensure that employees are aware of the information security policy?",
      "Are employees aware of the implications of not conforming to information security requirements?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "7.4 Communication",
    standardRequirement:
      "The organization shall determine the need for internal and external communications relevant to ISMS, including what, when, with whom, who, and how communication is performed.",
    auditQuestions: [
      "Has the organization developed an internal and external communication plan?",
      "Does the communication plan include details of what to share, when to share, with whom to share, how to share, and who is responsible for sharing?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "7.5.1 Documented information - General",
    standardRequirement:
      "The organization shall control documented information required by ISO 27001 and necessary for the ISMS effectiveness.",
    auditQuestions: [
      "Has the organization determined the documented information necessary for the effectiveness of the ISMS?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "7.5.2 Creating and updating documented information",
    standardRequirement:
      "The organization shall ensure documented information is created and updated appropriately.",
    auditQuestions: [
      "Is documented information in the appropriate format, and has it been identified, reviewed and approved for suitability?",
      "Has the organization defined naming conventions including document title, date, author and approval?",
      "While creating and updating documents, does the organization ensure integrity by capturing version numbers and appropriate approvals?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "7.5.3 Control of documented information",
    standardRequirement:
      "The organization shall control documented information to ensure it is available and suitable for use, and protected from loss of confidentiality, integrity, and availability.",
    auditQuestions: [
      "Does the organization have a process to control the distribution of documented information to ensure it is only available to intended persons?",
      "Does the organization protect documented information from loss of confidentiality, integrity and availability?",
      "Is documented information properly stored and adequately preserved for legibility?",
      "Has the organization identified and documented information of external origin?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "8.1 Operational planning and control",
    standardRequirement:
      "The organization shall plan, implement, and control processes needed to meet ISMS requirements and achieve objectives. Documented information shall be retained. Changes and outsourced processes shall be controlled.",
    auditQuestions: [
      "Does the organization have a programme to ensure that the ISMS achieves its outcomes, requirements and objectives?",
      "Is documented evidence retained to demonstrate that processes have been carried out as planned?",
      "Are changes planned and controlled, and unintended changes reviewed to mitigate any adverse results?",
      "How does the organization control outsourced processes/services relevant to ISMS?",
      "Does the organization have documented information as evidence to ensure that the processes are carried out and implemented as planned?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "8.2 Information security risk assessment",
    standardRequirement:
      "The organization shall perform information security risk assessments at planned intervals or when significant changes occur, using criteria established in 6.1.2. Documented results shall be retained.",
    auditQuestions: [
      "Are information security risk assessments performed at planned intervals or when significant changes occur, and is documented information retained?",
      "Does the organization retain relevant documented information of the results of the information security risk assessments?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "8.3 Information security risk treatment",
    standardRequirement:
      "The organization shall implement the information security risk treatment plan and retain documented information of the results.",
    auditQuestions: [
      "Has the information security risk treatment plan been implemented as per the information risk treatment plan?",
      "Does the organization retain relevant documented information of the results of the information security risk treatment?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "9.1 Monitoring, measurement, analysis and evaluation",
    standardRequirement:
      "The organization shall evaluate information security performance and ISMS effectiveness, including methods, frequency, responsibilities, and analysis of results.",
    auditQuestions: [
      "Is the information security performance and effectiveness of the ISMS evaluated?",
      "How does the organization determine the processes and controls that need to be monitored and controlled?",
      "How does the organization determine the methods for monitoring, measurement, analysis and evaluation of security processes and controls?",
      "How does the organization ensure that the selected methods produce comparable, repeatable and reproducible results?",
      "Has the organization determined the frequency for monitoring, measurement, analysis and evaluation of security processes and controls?",
      "Has the organization determined when to analyze the results of monitoring, measurement, analysis and evaluation of security processes and controls?",
      "Has the organization determined what needs to be monitored and measured, when, and by whom?",
      "Is documented information retained as evidence of the results of monitoring and measurement?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "9.2 Internal audit - 9.2.1 General",
    standardRequirement:
      "The organization shall conduct internal audits at planned intervals to provide information on ISMS effectiveness and conformity.",
    auditQuestions: [
      "Does the organization plan, establish, implement and maintain an internal audit program?",
      "Has the organization defined the objective and criteria for the internal audit?",
      "Are internal audits conducted periodically to check that the ISMS is effective and conforms to ISO/IEC 27001:2022 and the organization’s requirements?",
      "Are audits performed by competent personnel?",
      "How does the organization ensure objectivity and impartiality of the audit?",
      "Are the results of the internal audit reported to relevant management personnel?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "9.2 Internal audit - 9.2.2 Internal audit programme",
    standardRequirement:
      "An internal audit programme shall be planned, established, implemented and maintained, considering the importance of the processes and results of previous audits.",
    auditQuestions: [
      "Has the organization defined the frequency, methods, responsibilities and requirements for the audit program?",
      "Does the audit program take into consideration the importance of the process during the audit?",
      "Are documented information about the audit programme and audit results retained?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "9.3 Management review - 9.3.1 General",
    standardRequirement:
      "Top management shall review the organization’s ISMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness.",
    auditQuestions: [
      "Does the Top Management review the effectiveness of ISMS at planned intervals?",
      "Does the review consider results from previous management reviews?",
    ],
    department: ["ISMS Steering Committee"],
  },
  {
    clause: "9.3 Management review - 9.3.2 Management review inputs",
    standardRequirement:
      "Inputs to management review shall include status of actions from previous reviews, changes in external/internal issues, performance, feedback, and risk treatment results.",
    auditQuestions: [
      "Does the review consider changes to internal and external issues?",
      "Does the review consider changes to the needs and expectations of interested parties?",
      "Does the review consider monitoring and measurement results, audit results, feedback from interested parties, risk assessment and risk treatment outcomes?",
    ],
    department: ["ISMS Steering Committee"],
  },
  {
    clause: "9.3 Management review - 9.3.3 Management review results",
    standardRequirement:
      "Outputs from management review shall include decisions related to continual improvement, changes needed to ISMS, and resource needs.",
    auditQuestions: [
      "Do the outputs of the review include decisions related to continual improvement and any needs for changes to ISMS?",
      "Has the organization retained documented information as evidence for the results of management reviews?",
      "Are the results of the management review documented, acted upon and communicated to interested parties as appropriate?",
    ],
    department: ["ISMS Steering Committee"],
  },
  {
    clause: "10.1 Continual improvement",
    standardRequirement:
      "The organization shall continually improve the suitability, adequacy and effectiveness of the ISMS.",
    auditQuestions: [
      "Does the organization continually improve the suitability, adequacy and effectiveness of the ISMS?",
      "Are improvement opportunities identified and implemented?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
  {
    clause: "10.2 Nonconformity and corrective action",
    standardRequirement:
      "When a nonconformity occurs, the organization shall react, control, correct, evaluate causes, implement actions, and review effectiveness to prevent recurrence.",
    auditQuestions: [
      "What are the steps taken by the organization on the nonconformities identified?",
      "Does the organization take actions to control and correct the nonconformities?",
      "Does the organization identify the root cause for the nonconformity?",
      "Does the organization take steps to eliminate the root cause?",
      "Does the organization take steps to identify similar nonconformities within the organization?",
      "Does the organization take steps to review the effectiveness of corrective actions taken?",
      "Is documented information retained as evidence of the nature of non-conformities, actions taken and the results?",
    ],
    department: ["Information Security Officer (ISO)"],
  },
];

export const ISO_27001_CONTROL = [
  {
    clause: "5.1 Policies for information security",
    standardRequirement:
      "Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.",
    auditQuestions: [
      "Do Security policies exist?",
      "Are all policies approved by management?",
      "Are policies properly communicated to employees?",
      "Are security policies subject to review?",
      "Are the reviews conducted at regular intervals?",
    ],
    departments: ["ISMS Steering Committee"],
  },
  {
    clause: "5.2 Information security roles and responsibilities",
    standardRequirement:
      "Information security roles and responsibilities shall be defined and allocated according to the organization needs.",
    auditQuestions: [
      "Are the employees properly briefed on their information security roles and responsibilities prior to being granted access to the organization’s information and other associated assets?",
      "Are responsibilities for the protection of individual assets and information security risk management, including acceptance of residual risks, defined?",
    ],
    departments: ["ISMS Steering Committee"],
  },
  {
    clause: "5.3 Segregation of duties",
    standardRequirement:
      "Conflicting duties and conflicting areas of responsibility shall be segregated.",
    auditQuestions: [
      "Are duties and areas of responsibility separated to reduce opportunities for unauthorized modification or misuse of information or services?",
    ],
    departments: ["ISMS Steering Committee"],
  },
  {
    clause: "5.4 Management responsibilities",
    standardRequirement:
      "Management shall require all personnel to apply information security in accordance with the established information security policy, topic-specific policies and procedures of the organization.",
    auditQuestions: [
      "Does management demonstrate support of the information security policy, topic-specific policies, procedures and information security controls?",
      "Does management ensure personnel achieve a level of awareness of information security relevant to their roles and responsibilities?",
      "Does management ensure personnel are provided with adequate resources and project planning time for implementing the organization’s security-related processes and controls?",
    ],
    departments: ["ISMS Steering Committee"],
  },
  {
    clause: "5.5 Contact with authorities",
    standardRequirement:
      "Appropriate contacts with relevant authorities shall be maintained for information security purposes.",
    auditQuestions: [
      "Does the organization maintain contacts with relevant authorities for information security?",
      "Is the contact process documented and communicated?",
    ],
    departments: ["Information Security Officer (ISO)"],
  },
  {
    clause: "5.6 Contact with special interest groups",
    standardRequirement:
      "Contacts with special interest groups or forums on information security shall be maintained.",
    auditQuestions: [
      "Does the organization participate in relevant information security interest groups?",
      "Are interactions documented and reviewed periodically?",
    ],
    departments: ["Information Security Officer (ISO)"],
  },
  {
    clause: "5.7 Threat intelligence",
    standardRequirement:
      "Information about potential threats shall be collected and analyzed to strengthen information security.",
    auditQuestions: [
      "Does the organization maintain a threat intelligence program?",
      "Are threat intelligence reports analyzed and used to improve security controls?",
    ],
    departments: ["Information Security Officer (ISO)"],
  },
  {
    clause: "5.8 Information security in project management",
    standardRequirement:
      "Information security shall be embedded into project management activities.",
    auditQuestions: [
      "Are security requirements included in project plans?",
      "Are security risks evaluated in all project phases?",
    ],
    departments: ["Information Security Officer (ISO)"],
  },
  {
    clause: "5.9 Inventory of information and other associated assets",
    standardRequirement:
      "An inventory of information assets shall be maintained, including ownership and classification.",
    auditQuestions: [
      "Is there a complete inventory of information and assets?",
      "Is ownership and classification defined for each asset?",
    ],
    departments: ["Admin & Facilities", "IT Department"],
  },
  {
    clause: "5.10 Acceptable use of information and other associated assets",
    standardRequirement:
      "Rules for acceptable use of assets shall be defined and communicated to users.",
    auditQuestions: [
      "Are acceptable use policies defined and communicated?",
      "Are employees trained on acceptable use policies?",
    ],
    departments: ["Admin & Facilities", "IT Department"],
  },
  {
    clause: "5.11 Return of assets",
    standardRequirement:
      "Procedures shall ensure the return of assets upon termination or change of employment.",
    auditQuestions: [
      "Is there a documented process for asset return?",
      "Are returned assets verified and recorded?",
    ],
    departments: ["Admin & Facilities", "IT Department"],
  },
  {
    clause: "5.12 Classification of information",
    standardRequirement:
      "Information shall be classified based on sensitivity and value.",
    auditQuestions: [
      "Are information classification rules defined?",
      "Is classification communicated to all employees?",
    ],
    departments: ["Admin & Facilities", "IT Department"],
  },
  {
    clause: "5.13 Labelling of information",
    standardRequirement:
      "Information shall be labelled according to its classification to ensure appropriate handling.",
    auditQuestions: [
      "Are labels applied to sensitive information?",
      "Are labelling standards communicated and enforced?",
    ],
    departments: ["Admin & Facilities", "IT Department"],
  },
  {
    clause: "5.14 Information transfer",
    standardRequirement:
      "Information transfer shall be protected and controlled according to its classification.",
    auditQuestions: [
      "Are procedures defined to secure information transfer?",
      "Are encryption and secure channels used as required?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "5.15 Access control",
    standardRequirement:
      "Access to information and assets shall be restricted based on roles and responsibilities.",
    auditQuestions: [
      "Are access controls defined per role?",
      "Are access permissions reviewed periodically?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "5.16 Identity management",
    standardRequirement:
      "Identity and authentication management processes shall be in place for users.",
    auditQuestions: [
      "Are identity management procedures documented?",
      "Are accounts created, modified, and removed following the process?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "5.17 Authentication information",
    standardRequirement:
      "Authentication credentials and methods shall be securely managed.",
    auditQuestions: [
      "Are passwords, tokens, and certificates properly managed?",
      "Is multi-factor authentication implemented where required?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "5.18 Access rights",
    standardRequirement:
      "Users shall have access rights based on their roles and responsibilities.",
    auditQuestions: [
      "Are access rights reviewed periodically?",
      "Is a process defined to assign, revoke, and modify access?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "5.19 Information security in supplier relationships",
    standardRequirement:
      "Information security requirements shall be established for suppliers and third parties.",
    auditQuestions: [
      "Are security requirements included in supplier contracts?",
      "Are suppliers evaluated for security compliance?",
    ],
    departments: ["Vendor Management", "Procurement"],
  },
  {
    clause: "5.20 Addressing information security within supplier agreements",
    standardRequirement:
      "Information security requirements shall be included in supplier agreements.",
    auditQuestions: [
      "Are supplier agreements reviewed for security requirements?",
      "Are deviations addressed through contract clauses?",
    ],
    departments: ["Vendor Management", "Procurement"],
  },
  {
    clause: "5.21 Managing information security in the ICT supply chain",
    standardRequirement:
      "Information security shall be managed throughout the ICT supply chain.",
    auditQuestions: [
      "Are ICT suppliers evaluated for information security risks?",
      "Are supplier security requirements monitored?",
    ],
    departments: ["Vendor Management", "Procurement"],
  },
  {
    clause:
      "5.22 Monitoring, review and change management of supplier services",
    standardRequirement:
      "Supplier services shall be monitored for security compliance and managed for changes.",
    auditQuestions: [
      "Are supplier services periodically reviewed for security compliance?",
      "Is there a process for change management in supplier services?",
    ],
    departments: ["Vendor Management", "Procurement"],
  },
  {
    clause: "5.23 Information security for use of cloud services",
    standardRequirement:
      "Cloud services shall be securely configured and monitored.",
    auditQuestions: [
      "Are cloud service security controls in place?",
      "Is usage monitored and access restricted based on policy?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause:
      "5.24 Information security incident management planning and preparation",
    standardRequirement:
      "Procedures shall be in place to prepare for and respond to security incidents.",
    auditQuestions: [
      "Are incident management procedures documented?",
      "Is staff trained for incident response?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "5.29 Information security during disruption",
    standardRequirement:
      "Information security shall be maintained during disruptions to normal operations.",
    auditQuestions: [
      "Are business continuity and disaster recovery plans aligned with information security?",
      "Are staff aware of procedures to follow during disruptions?",
    ],
    departments: ["Information Security Officer (ISO)"],
  },
  {
    clause: "5.31 Legal, statutory, regulatory and contractual requirements",
    standardRequirement:
      "Compliance with legal, statutory, regulatory, and contractual requirements shall be ensured.",
    auditQuestions: [
      "Are applicable laws and regulations identified and complied with?",
      "Are contracts reviewed for legal and regulatory compliance?",
    ],
    departments: ["Legal"],
  },
  {
    clause: "5.32 Intellectual property rights",
    standardRequirement:
      "Intellectual property rights shall be protected and managed.",
    auditQuestions: [
      "Are IP assets identified and protected?",
      "Are processes in place to manage IP risks?",
    ],
    departments: ["Legal"],
  },
  {
    clause: "5.33 Protection of records",
    standardRequirement:
      "Records shall be protected from unauthorized access, loss, or destruction.",
    auditQuestions: [
      "Are records identified, classified, and protected?",
      "Are retention and disposal schedules followed?",
    ],
    departments: ["Legal"],
  },
  {
    clause:
      "5.34 Privacy and protection of personal identifiable information (PII)",
    standardRequirement:
      "PII shall be collected, processed, stored, and destroyed in compliance with privacy laws.",
    auditQuestions: [
      "Are PII data handling policies defined and enforced?",
      "Is staff trained on privacy requirements?",
    ],
    departments: ["Legal"],
  },
  {
    clause: "5.35 Independent review of information security",
    standardRequirement:
      "Independent reviews of information security shall be conducted periodically.",
    auditQuestions: [
      "Are independent audits or assessments performed?",
      "Are audit findings tracked and remediated?",
    ],
    departments: ["Legal"],
  },
  {
    clause:
      "5.36 Compliance with policies, rules and standards for information security",
    standardRequirement:
      "Compliance with internal policies, rules and standards shall be ensured.",
    auditQuestions: [
      "Is policy compliance monitored and enforced?",
      "Are violations reported and addressed?",
    ],
    departments: ["Legal"],
  },
  {
    clause: "5.37 Documented operating procedures",
    standardRequirement:
      "Documented procedures shall be maintained for operational processes.",
    auditQuestions: [
      "Are documented procedures available for operational processes?",
      "Are procedures reviewed and updated periodically?",
    ],
    departments: ["Legal"],
  },
  {
    clause: "6.1 Screening",
    standardRequirement:
      "Employees shall be screened appropriately before hiring.",
    auditQuestions: [
      "Are pre-employment background checks conducted?",
      "Are screening records retained?",
    ],
    departments: ["HR"],
  },
  {
    clause: "6.2 Terms and conditions of employment",
    standardRequirement:
      "Employment terms shall include information security responsibilities.",
    auditQuestions: [
      "Are employment contracts including information security clauses?",
      "Are employees aware of their responsibilities?",
    ],
    departments: ["HR"],
  },
  {
    clause: "6.3 Information security awareness, education and training",
    standardRequirement:
      "Employees shall receive information security awareness and training appropriate to their role.",
    auditQuestions: [
      "Are awareness programs implemented?",
      "Are employees periodically trained?",
      "Is effectiveness of training evaluated?",
    ],
    departments: ["HR"],
  },
  {
    clause: "6.4 Disciplinary process",
    standardRequirement:
      "Disciplinary processes shall exist for noncompliance with information security policies.",
    auditQuestions: [
      "Are disciplinary actions documented and applied?",
      "Is there a process for enforcement?",
    ],
    departments: ["HR"],
  },
  {
    clause: "6.5 Responsibilities after termination or change of employment",
    standardRequirement:
      "Responsibilities of personnel after leaving or changing roles shall be defined.",
    auditQuestions: [
      "Are processes in place to revoke access upon termination?",
      "Are responsibilities reassigned as needed?",
    ],
    departments: ["HR"],
  },
  {
    clause: "6.6 Confidentiality or non-disclosure agreements",
    standardRequirement:
      "Employees shall sign confidentiality or non-disclosure agreements.",
    auditQuestions: [
      "Are NDAs signed and stored?",
      "Are employees aware of obligations under NDA?",
    ],
    departments: ["HR"],
  },
  {
    clause: "6.7 Remote working",
    standardRequirement:
      "Remote working shall follow security policies and guidelines.",
    auditQuestions: [
      "Are remote work policies defined?",
      "Are remote access controls in place?",
    ],
    departments: ["HR"],
  },
  {
    clause: "6.8 Information security event reporting",
    standardRequirement:
      "Information security events shall be reported and managed appropriately.",
    auditQuestions: [
      "Are employees aware of reporting procedures?",
      "Are events logged and investigated?",
    ],
    departments: ["HR"],
  },
  {
    clause: "7.1 Physical security perimeters",
    standardRequirement:
      "Physical security perimeters shall protect facilities and assets.",
    auditQuestions: [
      "Are facility perimeters secured?",
      "Are access points monitored?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "7.2 Physical entry",
    standardRequirement:
      "Physical entry to sensitive areas shall be controlled.",
    auditQuestions: [
      "Are access controls implemented at entry points?",
      "Are visitors logged and escorted?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "7.3 Securing offices, rooms and facilities",
    standardRequirement:
      "Offices, rooms, and facilities shall be secured appropriately.",
    auditQuestions: [
      "Are physical barriers and locks in place?",
      "Are security procedures communicated?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "7.4 Physical security monitoring",
    standardRequirement:
      "Monitoring systems shall detect and alert on unauthorized access or threats.",
    auditQuestions: [
      "Are cameras and monitoring systems deployed?",
      "Are alerts reviewed regularly?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "7.5 Protecting against physical and environmental threats",
    standardRequirement:
      "Measures shall protect against environmental hazards and physical threats.",
    auditQuestions: [
      "Are fire, flood, and other environmental controls in place?",
      "Are environmental risks assessed regularly?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "7.6 Working in secure areas",
    standardRequirement:
      "Personnel working in secure areas shall follow security procedures.",
    auditQuestions: [
      "Are secure area access policies defined?",
      "Are employees trained on secure area procedures?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "7.7 Clear desk and clear screen",
    standardRequirement:
      "Desks and screens shall be cleared of sensitive information when unattended.",
    auditQuestions: [
      "Are clear desk and clear screen policies implemented?",
      "Are employees following these policies?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "7.8 Equipment siting and protection",
    standardRequirement:
      "Equipment shall be sited and protected to reduce risks.",
    auditQuestions: [
      "Is equipment protected against theft and damage?",
      "Are equipment placement guidelines followed?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "7.9 Security of assets off-premises",
    standardRequirement:
      "Assets taken off-premises shall be secured and tracked.",
    auditQuestions: [
      "Are policies for off-premises assets defined?",
      "Are off-premises assets monitored?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "7.10 Storage media",
    standardRequirement: "Storage media shall be securely stored and handled.",
    auditQuestions: [
      "Are storage devices protected according to classification?",
      "Are disposal procedures followed?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "7.11 Supporting utilities",
    standardRequirement:
      "Utilities supporting IT and information systems shall be secure.",
    auditQuestions: [
      "Are power and HVAC systems secured?",
      "Are utilities monitored for failures?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "7.12 Cabling security",
    standardRequirement:
      "Cabling carrying sensitive information shall be protected.",
    auditQuestions: [
      "Are network cables physically secured?",
      "Are cabling risks assessed and mitigated?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "7.13 Equipment maintenance",
    standardRequirement:
      "Equipment shall be maintained to ensure security and operational continuity.",
    auditQuestions: [
      "Is maintenance documented?",
      "Are maintenance procedures followed?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "7.14 Secure disposal or re-use of equipment",
    standardRequirement:
      "Equipment shall be securely disposed of or sanitized for reuse.",
    auditQuestions: [
      "Are secure disposal procedures implemented?",
      "Are logs of disposal maintained?",
    ],
    departments: ["Admin & Facilities"],
  },
  {
    clause: "8.1 User end point devices",
    standardRequirement:
      "Information stored on, processed by, or accessible via user end point devices shall be protected.",
    auditQuestions: [
      "Is there a process for the registration of user endpoint devices?",
      "Is software installation restricted on user endpoint devices?",
      "Are USB ports disabled on user endpoint devices?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.2 Privileged access rights",
    standardRequirement:
      "The allocation and use of privileged access rights shall be restricted and managed.",
    auditQuestions: [
      "What are the criteria for assigning access privileges?",
      "Are privileged access rights reviewed periodically?",
    ],
    departments: ["Information Security Officer (ISO)"],
  },
  {
    clause: "8.3 Information access restriction",
    standardRequirement:
      "Access to information and systems shall be restricted based on business and security requirements.",
    auditQuestions: [
      "Are access restrictions enforced based on roles and responsibilities?",
      "Are unauthorized access attempts logged and reviewed?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.4 Access to source code",
    standardRequirement:
      "Access to source code shall be restricted to authorized personnel only.",
    auditQuestions: [
      "Are developers granted source code access based on need?",
      "Is access to source code logged and monitored?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.5 Secure authentication",
    standardRequirement:
      "Authentication mechanisms shall be secure and managed according to organizational policies.",
    auditQuestions: [
      "Are strong authentication mechanisms implemented?",
      "Is multi-factor authentication enforced where applicable?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.6 Capacity management",
    standardRequirement:
      "Information processing facilities shall be managed to meet capacity and performance requirements securely.",
    auditQuestions: [
      "Are system capacities monitored and reviewed?",
      "Are upgrades or changes documented and approved?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.7 Protection against malware",
    standardRequirement:
      "Systems shall be protected against malware through prevention, detection, and recovery controls.",
    auditQuestions: [
      "Are anti-malware solutions deployed and updated?",
      "Is malware detection monitored and incidents responded to promptly?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.8 Management of technical vulnerabilities",
    standardRequirement:
      "Vulnerabilities in systems shall be identified, assessed, and mitigated.",
    auditQuestions: [
      "Are vulnerability assessments conducted regularly?",
      "Are identified vulnerabilities remediated and tracked?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.9 Configuration management",
    standardRequirement:
      "Secure configurations shall be defined, implemented, and maintained for information systems.",
    auditQuestions: [
      "Are system configurations documented and approved?",
      "Are configuration changes reviewed and tested before deployment?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.10 Information deletion",
    standardRequirement:
      "Information shall be deleted securely when no longer required.",
    auditQuestions: [
      "Are secure deletion procedures implemented?",
      "Is deletion logged and verified?",
    ],
    departments: ["Information Security Officer (ISO)"],
  },
  {
    clause: "8.11 Data masking",
    standardRequirement:
      "Sensitive data shall be masked when used in non-production environments.",
    auditQuestions: [
      "Is sensitive data masked in test or development systems?",
      "Are masking procedures periodically reviewed?",
    ],
    departments: ["Information Security Officer (ISO)"],
  },
  {
    clause: "8.12 Data leakage prevention",
    standardRequirement:
      "Controls shall prevent unauthorized transfer or disclosure of sensitive information.",
    auditQuestions: [
      "Are DLP solutions implemented?",
      "Are DLP incidents investigated and remediated?",
    ],
    departments: ["Information Security Officer (ISO)"],
  },
  {
    clause: "8.13 Information backup",
    standardRequirement:
      "Information shall be backed up according to defined policies and procedures.",
    auditQuestions: [
      "Are backups performed regularly?",
      "Are backup restorations tested periodically?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.14 Redundancy of information processing facilities",
    standardRequirement:
      "Critical systems shall have redundant facilities to ensure continuity.",
    auditQuestions: [
      "Are redundant systems tested for failover?",
      "Are redundancy plans documented and maintained?",
    ],
    departments: ["Information Security Officer (ISO)"],
  },
  {
    clause: "8.15 Logging",
    standardRequirement:
      "Information systems shall generate and retain logs to support monitoring and incident investigation.",
    auditQuestions: [
      "Are logs enabled for critical systems?",
      "Are logs reviewed regularly for anomalies?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.16 Monitoring activities",
    standardRequirement:
      "Monitoring mechanisms shall detect and respond to security events.",
    auditQuestions: [
      "Are monitoring tools implemented and operational?",
      "Are alerts investigated and escalated appropriately?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.17 Clock synchronization",
    standardRequirement:
      "System clocks shall be synchronized to ensure accurate time-stamping of events.",
    auditQuestions: [
      "Are system clocks synchronized using a reliable time source?",
      "Is synchronization monitored and logged?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.18 Use of privileged utility programs",
    standardRequirement:
      "Use of privileged programs shall be restricted, controlled, and monitored.",
    auditQuestions: [
      "Are privileged utilities access controlled?",
      "Are usage logs reviewed periodically?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.19 Installation of software on operational systems",
    standardRequirement:
      "Software installations shall be authorized, tested, and documented.",
    auditQuestions: [
      "Are software installations approved and documented?",
      "Are unauthorized software installations prevented?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.20 Network security",
    standardRequirement:
      "Networks shall be protected from unauthorized access and attacks.",
    auditQuestions: [
      "Are network security controls implemented?",
      "Is network activity monitored for suspicious behavior?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.24 Use of cryptography",
    standardRequirement:
      "Cryptographic controls shall be used to protect confidentiality, integrity, and authenticity.",
    auditQuestions: [
      "Are cryptographic methods implemented according to policy?",
      "Are keys managed securely?",
    ],
    departments: ["IT Infra"],
  },
  {
    clause: "8.25 Secure development life cycle",
    standardRequirement:
      "Security requirements shall be integrated into the development lifecycle.",
    auditQuestions: [
      "Are developers trained on secure coding?",
      "Are security requirements incorporated into project plans?",
    ],
    departments: ["IT Applications"],
  },
  {
    clause: "8.30 Outsourced development",
    standardRequirement:
      "Security requirements shall be included in outsourced development contracts.",
    auditQuestions: [
      "Are third-party development contracts reviewed for security?",
      "Are outsourced deliverables tested for compliance?",
    ],
    departments: ["IT Applications"],
  },
  {
    clause: "8.31 Separation of development, test and production environments",
    standardRequirement:
      "Development, testing, and production environments shall be separated to prevent unauthorized access or changes.",
    auditQuestions: [
      "Are environment separations documented and enforced?",
      "Are access permissions reviewed for each environment?",
    ],
    departments: ["IT Applications"],
  },
  {
    clause: "8.32 Change management",
    standardRequirement:
      "Changes to systems shall follow a formal change management process.",
    auditQuestions: [
      "Are changes approved, tested, and documented?",
      "Is rollback planning included for changes?",
    ],
    departments: ["IT Infra", "IT Applications"],
  },
  {
    clause: "8.33 Test information",
    standardRequirement:
      "Test information shall be controlled to prevent exposure of sensitive data.",
    auditQuestions: [
      "Is test data sanitized before use?",
      "Are test environments isolated from production?",
    ],
    departments: ["IT Infra", "IT Applications"],
  },
  {
    clause: "8.34 Protection of information systems during audit testing",
    standardRequirement:
      "Audit tests and other assurance activities involving assessment of operational systems shall be planned and agreed between the tester and appropriate management.",
    auditQuestions: [
      "Is there a system audit and assurance plan?",
      "Are privacy laws and regulations listed?",
      "Are audit calendars and recent audit reports maintained?",
      "Is there a procedure for protecting PII data during audits?",
      "Are personnel involved in system operations trained and aware of responsibilities?",
    ],
    departments: ["IT Infra", "IT Applications"],
  },
];


const uniqueDepartments1 = [...new Set(ISO_27001_CLAUSES.map(item => item.department))];


const uniqueDepartments2 = [...new Set(ISO_27001_CONTROL.map(item => item.departments))];

const allUniqueDepartments = [...new Set([...uniqueDepartments1, ...uniqueDepartments2].flat())];
console.log("All Unique Departments:", allUniqueDepartments);
