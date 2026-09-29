// Mapping of control IDs to document references
export const DOCUMENT_MAPPING = {
  5.1: {
    type: ["POL"],
    dept: ["ISMS Steering Committee"],
    docs: ["Information Security Policy"],
  },
  5.2: {
    type: ["DOC"],
    dept: ["ISMS Steering Committee"],
    docs: ["Roles, Responsibilities and Authorities"],
  },
  5.3: {
    type: ["DOC"],
    dept: ["ISMS Steering Committee"],
    docs: ["Roles, Responsibilities and Authorities"],
  },
  5.4: {
    type: ["SOP"],
    dept: ["ISMS Steering Committee"],
    docs: ["Human Resource Security Management Procedure"],
  },
  5.5: {
    type: ["LOG"],
    dept: ["Information Security Officer (ISO)"],
    docs: ["Contact With Authorities"],
  },
  5.6: {
    type: ["LOG"],
    dept: ["Information Security Officer (ISO)"],
    docs: ["Contact With Special Interest Group"],
  },
  5.7: {
    type: ["POL"],
    dept: ["Information Security Officer (ISO)"],
    docs: ["Threat Intelligence Policy"],
  },
  5.8: {
    type: ["POL", "Guideline"],
    dept: ["Information Security Officer (ISO)"],
    docs: ["Information Security Policy", "SDLC PROCESS & SECURE CODING"],
  },
  5.9: {
    type: ["POL"],
    dept: ["Admin & Facilities", "IT Department"],
    docs: ["Asset Management Policy"],
  },
  "5.10": {
    type: ["POL", "POL"],
    dept: ["Admin & Facilities", "IT Department"],
    docs: ["Asset Management Policy", "Acceptable Use of Assets Policy"],
  },
  5.11: {
    type: ["POL"],
    dept: ["Admin & Facilities", "IT Department"],
    docs: ["Asset Management Policy"],
  },
  5.12: {
    type: ["POL"],
    dept: ["Admin & Facilities", "IT Department"],
    docs: ["Asset Management Policy"],
  },
  5.13: {
    type: ["POL"],
    dept: ["Admin & Facilities", "IT Department"],
    docs: ["Asset Management Policy"],
  },
  5.14: {
    type: ["SOP", "POL"],
    dept: ["IT Infra"],
    docs: ["Communication Security Procedure", "Email Security Policy"],
  },
  5.15: {
    type: ["POL", "LOG"],
    dept: ["IT Infra"],
    docs: ["Access Control Policy", "Access Control Matrix (ACM)"],
  },
  5.16: {
    type: ["POL"],
    dept: ["IT Infra"],
    docs: ["Access Control Policy"],
  },
  5.17: {
    type: ["POL"],
    dept: ["IT Infra"],
    docs: ["Access Control Policy"],
  },
  5.18: {
    type: ["POL"],
    dept: ["IT Infra"],
    docs: ["Access Control Policy"],
  },
  5.19: {
    type: ["SOP"],
    dept: ["Vendor Management", "Procurement"],
    docs: ["Supplier Relationship Management Procedure"],
  },
  "5.20": {
    type: ["SOP"],
    dept: ["Vendor Management", "Procurement"],
    docs: ["Supplier Relationship Management Procedure"],
  },
  5.21: {
    type: ["SOP"],
    dept: ["Vendor Management", "Procurement"],
    docs: ["Supplier Relationship Management Procedure"],
  },
  5.22: {
    type: ["SOP"],
    dept: ["Vendor Management", "Procurement"],
    docs: ["Supplier Relationship Management Procedure"],
  },
  5.23: {
    type: ["POL"],
    dept: ["IT Infra"],
    docs: ["Cloud Security Policy"],
  },
  5.24: {
    type: ["SOP"],
    dept: ["IT Infra"],
    docs: ["Security Incident Management Procedure"],
  },
  5.25: {
    type: ["SOP"],
    dept: ["IT Infra"],
    docs: ["Security Incident Management Procedure"],
  },
  5.26: {
    type: ["SOP"],
    dept: ["IT Infra"],
    docs: ["Security Incident Management Procedure"],
  },
  5.27: {
    type: ["SOP"],
    dept: ["IT Infra"],
    docs: ["Security Incident Management Procedure"],
  },
  5.28: {
    type: ["SOP"],
    dept: ["IT Infra"],
    docs: ["Security Incident Management Procedure"],
  },
  5.29: {
    type: ["SOP"],
    dept: ["Information Security Officer (ISO)"],
    docs: ["Business Continuity Management Procedure"],
  },
  "5.30": {
    type: ["SOP"],
    dept: ["Information Security Officer (ISO)"],
    docs: ["Business Continuity Management Procedure"],
  },
  5.31: {
    type: ["POL", "SOP"],
    dept: ["Legal"],
    docs: ["Compliance_Policy", "Finance"],
  },
  5.32: {
    type: ["POL", "DOC", "DOC"],
    dept: ["Legal"],
    docs: [
      "Compliance_Policy",
      "NDA sample that's executed with third parties and employees",
      "Disclosure of all IPRs",
    ],
  },
  5.33: { type: ["POL"], dept: ["Legal"], docs: ["Compliance_Policy"] },
  5.34: { type: ["POL"], dept: ["Legal"], docs: ["Compliance_Policy"] },
  5.35: { type: ["POL"], dept: ["Legal"], docs: ["Compliance_Policy"] },
  5.36: { type: ["POL"], dept: ["Legal"], docs: ["Compliance_Policy"] },
  5.37: {
    type: ["SOP"],
    dept: ["Legal"],
    docs: ["Operations Security Procedure"],
  },

  6.1: {
    type: ["SOP", "POL"],
    dept: ["HR"],
    docs: [
      "Human Resource Security Management Procedure",
      "Background Verification Policy",
    ],
  },
  6.2: {
    type: ["SOP"],
    dept: ["HR"],
    docs: ["Human Resource Security Management Procedure"],
  },
  6.3: {
    type: ["SOP", "DOC"],
    dept: ["HR"],
    docs: [
      "Human Resource Security Management Procedure",
      "Awareness Training",
    ],
  },
  6.4: {
    type: ["SOP"],
    dept: ["HR"],
    docs: ["Human Resource Security Management Procedure"],
  },
  6.5: {
    type: ["SOP"],
    dept: ["HR"],
    docs: ["Human Resource Security Management Procedure"],
  },
  6.6: {
    type: ["SOP"],
    dept: ["HR"],
    docs: ["Communication Security Procedure"],
  },
  6.7: {
    type: ["POL"],
    dept: ["HR"],
    docs: ["Mobile Device & Teleworking Policy"],
  },
  6.8: {
    type: ["SOP", "DOC"],
    dept: ["HR"],
    docs: [
      "Security Incident Management Procedure",
      "Incidents captured in JIRA Tool",
    ],
  },

  7.1: {
    type: ["SOP"],
    dept: ["Admin & Facilities"],
    docs: ["Physical & Environmental Security Procedure"],
  },
  7.2: {
    type: ["SOP"],
    dept: ["Admin & Facilities"],
    docs: ["Physical & Environmental Security Procedure"],
  },
  7.3: {
    type: ["SOP"],
    dept: ["Admin & Facilities"],
    docs: ["Physical & Environmental Security Procedure"],
  },
  7.4: {
    type: ["PRO"],
    dept: ["Admin & Facilities"],
    docs: ["Physical & Environmental Security Procedure"],
  },
  7.5: {
    type: ["SOP"],
    dept: ["Admin & Facilities"],
    docs: ["Physical & Environmental Security Procedure"],
  },
  7.6: {
    type: ["SOP"],
    dept: ["Admin & Facilities"],
    docs: ["Physical & Environmental Security Procedure"],
  },
  7.7: {
    type: ["POL"],
    dept: ["Admin & Facilities"],
    docs: ["Clear Desk & Clear Screen Policy"],
  },
  7.8: {
    type: ["SOP"],
    dept: ["Admin & Facilities"],
    docs: ["Physical & Environmental Security Procedure"],
  },
  7.9: {
    type: "",
    dept: ["Admin & Facilities"],
    docs: ["ISMS_SOP_Physical & Environmental Security Procedure"],
  },
  "7.10": {
    type: ["POL", "SOP"],
    dept: ["Admin & Facilities"],
    docs: [
      "Asset Management Policy",
      "Physical & Environmental Security Procedure",
    ],
  },
  7.11: {
    type: ["SOP"],
    dept: ["Admin & Facilities"],
    docs: ["Physical & Environmental Security Procedure"],
  },
  7.12: {
    type: ["SOP"],
    dept: ["Admin & Facilities"],
    docs: ["Physical & Environmental Security Procedure"],
  },
  7.13: {
    type: ["SOP"],
    dept: ["Admin & Facilities"],
    docs: ["Physical & Environmental Security Procedure"],
  },
  7.14: {
    type: ["SOP"],
    dept: ["Admin & Facilities"],
    docs: ["Physical & Environmental Security Procedure"],
  },

  8.1: {
    type: ["POL", "SOP"],
    dept: ["IT Infra"],
    docs: [
      "Mobile Device & Teleworking Policy",
      "Physical & Environmental Security Procedure",
    ],
  },
  8.2: {
    type: ["POL"],
    dept: ["Information Security Officer (ISO)"],
    docs: ["Access Control Policy"],
  },
  8.3: {
    type: ["POL"],
    dept: ["IT Infra"],
    docs: ["Access Control Policy"],
  },
  8.4: {
    type: ["POL"],
    dept: ["IT Infra"],
    docs: ["Access Control Policy"],
  },
  8.5: {
    type: ["POL"],
    dept: ["IT Infra"],
    docs: ["Access Control Policy"],
  },
  8.6: {
    type: ["SOP"],
    dept: ["IT Infra"],
    docs: ["Operations Security Procedure"],
  },
  8.7: {
    type: ["SOP", "SOP", "POL", "Plan"],
    dept: ["IT Infra"],
    docs: [
      "Operations Security Procedure",
      "Malware Management Procedure",
      "OS_Patch_Policy",
      "Windows_Patching_Activity_Plan_and_Impact",
    ],
  },
  8.8: {
    type: ["SOP"],
    dept: ["IT Infra"],
    docs: ["Operations Security Procedure"],
  },
  8.9: {
    type: ["SOP"],
    dept: ["IT Infra"],
    docs: ["Operations Security Procedure"],
  },
  "8.10": {
    type: ["POL"],
    dept: ["Information Security Officer (ISO)"],
    docs: ["Data Retention and Data Deletion Policy"],
  },
  8.11: {
    type: ["POL"],
    dept: ["Information Security Officer (ISO)"],
    docs: ["Data Masking Policy"],
  },
  8.12: {
    type: ["POL"],
    dept: ["Information Security Officer (ISO)"],
    docs: ["Data Leakage Prevention Policy"],
  },
  8.13: {
    type: ["SOP", "POL"],
    dept: ["IT Infra"],
    docs: ["Operations Security Procedure", "Data Backup and Recovery Policy"],
  },
  8.14: {
    type: ["SOP"],
    dept: ["Information Security Officer (ISO)"],
    docs: ["Business Continuity Management Procedure"],
  },
  8.15: {
    type: ["PRO"],
    dept: ["IT Infra"],
    docs: ["Operations Security Procedure"],
  },
  8.16: {
    type: ["POL"],
    dept: ["IT Infra"],
    docs: ["Physical & Environmental Security Procedure"],
  },
  8.17: {
    type: ["PRO"],
    dept: ["IT Infra"],
    docs: ["Operations Security Procedure"],
  },
  8.18: {
    type: ["POL"],
    dept: ["IT Infra"],
    docs: ["Access Control Policy"],
  },
  8.19: {
    type: ["PRO"],
    dept: ["IT Infra"],
    docs: ["Communication Security Procedure"],
  },
  "8.20": {
    type: ["PRO"],
    dept: ["IT Infra"],
    docs: ["Communication Security Procedure"],
  },
  8.21: {
    type: ["PRO"],
    dept: ["IT Infra"],
    docs: ["Communication Security Procedure"],
  },
  8.22: {
    type: ["PRO"],
    dept: ["IT Infra"],
    docs: ["Communication Security Procedure"],
  },
  8.23: {
    type: ["PRO"],
    dept: ["IT Infra"],
    docs: ["Communication Security Procedure"],
  },
  8.24: {
    type: ["POL"],
    dept: ["IT Infra"],
    docs: ["Encryption Policy"],
  },
  8.25: {
    type: ["Guidelines"],
    dept: ["IT Applications"],
    docs: ["SDLC PROCESS & SECURE CODING"],
  },
  8.26: {
    type: ["Guidelines"],
    dept: ["IT Applications"],
    docs: ["SDLC PROCESS & SECURE CODING"],
  },
  8.27: {
    type: ["Guidelines"],
    dept: ["IT Applications"],
    docs: ["SDLC PROCESS & SECURE CODING"],
  },
  8.28: {
    type: ["Guidelines"],
    dept: ["IT Applications"],
    docs: ["SDLC PROCESS & SECURE CODING"],
  },
  8.29: {
    type: ["Guidelines"],
    dept: ["IT Applications"],
    docs: ["SDLC PROCESS & SECURE CODING"],
  },
  "8.30": {
    type: ["Guidelines"],
    dept: ["IT Applications"],
    docs: ["SDLC PROCESS & SECURE CODING"],
  },
  8.31: {
    type: ["SOP", "Guidelines"],
    dept: ["IT Applications"],
    docs: ["Operations Security Procedure", "SDLC PROCESS & SECURE CODING"],
  },
  8.32: {
    type: ["SOP", "SOP", "Guidelines"],
    dept: ["IT Infra", "IT Applications"],
    docs: [
      "Operations Security Procedure",
      "Change Management Procedure",
      "SDLC PROCESS & SECURE CODING",
    ],
  },
  8.33: {
    type: ["Guideline"],
    dept: ["IT Infra", "IT Applications"],
    docs: ["SDLC PROCESS & SECURE CODING"],
  },
  8.34: {
    type: ["SOP"],
    dept: ["IT Infra", "IT Applications"],
    docs: ["Operations Security Procedure"],
  },
};

export const getExpandedDocumentRows = () => {
  const rows = [];

  Object.entries(DOCUMENT_MAPPING).forEach(([control, item]) => {
    const types = Array.isArray(item.type) ? item.type : [item.type];
    const depts = Array.isArray(item.dept) ? item.dept : [item.dept];
    const docs = Array.isArray(item.docs) ? item.docs : [item.docs];

    const maxLength = Math.max(types.length, depts.length, docs.length);

    for (let i = 0; i < maxLength; i++) {
      rows.push({
        control,
        type: types[i] ?? types[0],
        dept: depts[i] ?? depts[0],
        doc: docs[i] ?? docs[0],
      });
    }
  });

  return rows;
};
