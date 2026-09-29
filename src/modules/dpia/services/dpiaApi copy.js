// dpiaApi.js  — updated for multi-org + full question/answer audit trail
//
// KEY CHANGES vs previous version:
//  1. createAssessment() now accepts organizationName so it's stored in the DB.
//  2. saveStage3() now sends the raw form state directly to the backend.
//     The Stage3Mapper in Java builds the QuestionAnswer audit trail server-side,
//     so buildStage3Payload() is NO LONGER CALLED for stage 3.
//  3. buildStage1Payload() and buildStage2Payload() are kept — they still convert
//     UI labels to enum names before sending to Stage1/Stage2 endpoints.

import {
  createDpia,
  getAllDpia,
  saveStage1 as apiSaveStage1,
  saveStage2 as apiSaveStage2,
  saveStage3 as apiSaveStage3,
  submitDpia,
  getCompliance as apiGetCompliance,
} from "../services/api";

// ─── DPIA Lifecycle ──────────────────────────────────────────────────────────

/**
 * POST /api/dpia?projectName=...&organizationId=...&organizationName=...
 * @param {string} projectName
 * @param {string} organizationId   — opaque tenant ID
 * @param {string} organizationName — human-readable org name (stored for audit)
 */
export async function createAssessment(
  projectName,
  organizationId,
  organizationName,
) {
  const res = await createDpia(projectName, organizationId, organizationName);
  return res.data;
}

/** PUT /api/dpia/{id}/stage1 */
export async function saveStage1(id, stage1Payload) {
  const res = await apiSaveStage1(id, stage1Payload);
  return res.data;
}

/** PUT /api/dpia/{id}/stage2 */
export async function saveStage2(id, stage2Payload) {
  const res = await apiSaveStage2(id, stage2Payload);
  return res.data;
}

/**
 * PUT /api/dpia/{id}/stage3
 *
 * Sends the raw Stage3Form state to the backend.
 * The Java Stage3Mapper builds the QuestionAnswer audit trail server-side.
 * No payload transformation is done in the frontend for stage 3.
 *
 * @param {string} id
 * @param {object} stage3FormState — raw state from Stage3Form.jsx
 */
export async function saveStage3(id, stage3FormState) {
  const res = await apiSaveStage3(id, stage3FormState);
  return res.data;
}

/** POST /api/dpia/{id}/submit */
export async function submitAssessment(id) {
  const res = await submitDpia(id);
  return res.data;
}

/** GET /api/dpia */
export async function getAllAssessments(organizationId) {
  const res = await getAllDpia(organizationId);
  return res.data;
}

/** GET /api/dpia/{id}/compliance */
export async function getCompliance(id) {
  const res = await apiGetCompliance(id);
  return res.data;
}

// ─── Enum label → Java enum name maps ────────────────────────────────────────
// Used by buildStage1Payload only (Stage 2 & 3 no longer need frontend mapping)

const DEPT_CAT_ENUM = {
  "PII Controller": "CONTROLLER",
  "PII Processor": "PROCESSOR",
  "Both (a) and (b)": "BOTH",
  Subprocessor: "SUBPROCESSOR",
};

const DATA_SUBJECT_ENUM = {
  "Current employee": "CURRENT_EMPLOYEE",
  "Former Employee": "FORMER_EMPLOYEE",
  "Customer's Employee": "CUSTOMERS_EMPLOYEE",
  "Customer's Customer": "CUSTOMERS_CUSTOMER",
  "Business Contact": "BUSINESS_CONTACT",
  Other: "OTHER",
};

const PERSONAL_DATA_TYPE_ENUM = {
  pii: "PII",
  spi: "SPI",
  special: "SPECIAL_CATEGORIES",
  device: "DEVICE_IDENTIFIERS",
  behavioral: "BEHAVIORAL_DEMOGRAPHIC",
  location: "LOCATION",
};

const DATA_SOURCE_ENUM = {
  "Direct submission by the Data Subject": "DIRECT_SUBMISSION",
  Customer: "CUSTOMER",
  "Third party vendor or partner": "THIRD_PARTY",
  "Active and automated collection, surveillance, tracking, or monitoring":
    "AUTOMATED_COLLECTION",
  "System or team internal to the organization": "INTERNAL_SYSTEM",
  Other: "OTHER",
};

const INDIVIDUAL_COUNT_ENUM = {
  "<25": "LESS_THAN_25",
  "26 - 100": "BETWEEN_26_AND_100",
  "101 - 1000": "BETWEEN_101_AND_1000",
  "1001 - 100,000": "BETWEEN_1001_AND_100000",
  "100,000 +": "MORE_THAN_100000",
};

const toEnumList = (labels, map) => (labels || []).map((l) => map[l] ?? l);

// ─── Payload Builders ────────────────────────────────────────────────────────

/**
 * Stage 1 — still transforms UI labels to enum names before sending.
 * The Java Stage1Mapper.attachAuditTrail() will run server-side after receipt.
 */
export function buildStage1Payload({
  dataSubjects,
  geos,
  dataTypes,
  dataSources,
  dataTypeExamples,
  rows,
  indivCount,
  shareInternal,
  internalTeams,
  minors,
  deptCat,
}) {
  return {
    dataSubjects: toEnumList(dataSubjects, DATA_SUBJECT_ENUM),
    geographies: geos,
    personalDataTypes: toEnumList(dataTypes, PERSONAL_DATA_TYPE_ENUM),
    dataSources: toEnumList(dataSources, DATA_SOURCE_ENUM),
    applicationMappings: rows.map((r) => ({
      applicationName: r.appName,
      dataSubjects: r.dataSubject ? [r.dataSubject] : [],
      personalDataElements: r.personalData ? [r.personalData] : [],
      storageFormat: r.storageFormat,
      integratedApplications: r.integratedApps ? [r.integratedApps] : [],
      applicableCountries: r.country ? [r.country] : [],
      storageLocation: r.accessedBy,
      deletionMethod: r.deletionMethod,
    })),
    anticipatedIndividualsCount:
      INDIVIDUAL_COUNT_ENUM[indivCount] ?? indivCount,
    sharesWithInternalTeams: shareInternal === "Yes",
    internalTransfers:
      shareInternal === "Yes"
        ? internalTeams.map((t) => ({
            teamName: t.teamName,
            department: t.location,
            country: t.location,
            dataShared: t.personalData ? [t.personalData] : [],
            purposeOfTransfer: t.purpose,
          }))
        : [],
    targetedToMinors: minors === "Yes",
    departmentCategory: DEPT_CAT_ENUM[deptCat] ?? deptCat,
  };
}

/**
 * Stage 2 — structure unchanged; Java Stage2Mapper.attachAuditTrail() runs server-side.
 */
export function buildStage2Payload({ checked, customElements, applications }) {
  const applicationsList = applications.map((app) => ({
    applicationName: app,
    personalDataTypes: Array.isArray(checked[app])
      ? checked[app]
      : Array.from(checked[app] || []),
    processingActivities: [],
    storageLocation: null,
    retentionPeriod: null,
  }));
  return {
    applications: applicationsList,
    customElements: (customElements || []).map((e) => ({
      label: e.label,
      selectedApplications: e.selectedApplications || [],
    })),
  };
}

// NOTE: buildStage3Payload() has been REMOVED.
// Stage 3 form state is sent directly to the backend via saveStage3().
// The Java Stage3Mapper handles all normalisation and audit-trail generation.
