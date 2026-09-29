// dpiaApi.js
// Full DPIA API layer aligned with Spring backend routes

import axios from "axios";
import {
  createDpia,
  getAllDpia,
  saveStage1 as apiSaveStage1,
  saveStage2 as apiSaveStage2,
  saveStage3 as apiSaveStage3,
  submitDpia,
  getCompliance as apiGetCompliance,
  patchDepartments
} from "./api";

const BASE = "https://api.calvant.com/dpia-service/api/dpia";

// ─────────────────────────────────────────────────────────────
// DPIA LIFECYCLE
// ─────────────────────────────────────────────────────────────

export async function createAssessment(
  projectName,
  organizationId
) {
  const res = await createDpia(projectName, organizationId);
  return res.data;
}

export async function updateDepartments(id, departmentIds) {
  const res = await patchDepartments(id, departmentIds);
  return res.data;
}

export async function saveStage1(id, payload) {
  const res = await apiSaveStage1(id, payload);
  return res.data;
}

export async function saveStage2(id, payload) {
  const res = await apiSaveStage2(id, payload);
  return res.data;
}

export async function saveStage3(id, payload) {
  const res = await apiSaveStage3(id, payload);
  return res.data;
}

export async function submitAssessment(id) {
  const res = await submitDpia(id);
  return res.data;
}

export async function getAllAssessments(organizationId) {
  const res = await getAllDpia(organizationId);
  return res.data;
}

export async function getAssessment(id) {
  const res = await axios.get(`${BASE}/${id}`);
  return res.data;
}

export async function getCompliance(id) {
  const res = await apiGetCompliance(id);
  return res.data;
}
export async function getComplianceDashboard(id) {
  return getCompliance(id);
}
// ─────────────────────────────────────────────────────────────
// DPIA ASSIGNMENTS
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/dpia/assignments
 */
export async function assignDpia(payload) {
  const res = await axios.post(`${BASE}/assignments`, payload);
  return res.data;
}

/**
 * GET /api/dpia/assignments
 */
export async function getDpiaAssignments(orgId) {
  const res = await axios.get(`${BASE}/assignments`, {
    params: orgId ? { organizationId: orgId } : {},
  });
  return res.data;
}

/**
 * GET /api/dpia/assignments?assignedTo=userId
 */
export async function getMyDpiaAssignments(userId) {
  const res = await axios.get(`${BASE}/assignments`, {
    params: { assignedTo: userId },
  });
  return res.data;
}

/**
 * PUT /api/dpia/assignments/{id}
 */
export async function updateDpiaAssignment(id, payload) {
  const res = await axios.put(`${BASE}/assignments/${id}`, payload);
  return res.data;
}

// ─────────────────────────────────────────────────────────────
// FINDINGS ACTION WORKFLOW
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/dpia/{dpiaId}/findings/action
 */
export async function logDpiaFindingAction(dpiaId, payload) {
  const res = await axios.post(`${BASE}/${dpiaId}/findings/action`, payload);
  return res.data;
}

// ─────────────────────────────────────────────────────────────
// ENUM MAPS
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// PAYLOAD BUILDERS
// ─────────────────────────────────────────────────────────────

export function buildStage1Payload({
  dataSubjects,
  geos,
  dataTypes,
  dataSources,
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
