// services/api.js  — updated for multi-org support
//
// CHANGE: createDpia() now passes organizationName as a query param
// so it's stored alongside organizationId in the DPIAAssessment document.

import axios from "axios";

const BASE = "https://api.calvant.com/dpia-service/api/dpia";

/**
 * POST /api/dpia
 * Creates a new assessment for the given organisation.
 *
 * @param {string|null} projectName     — optional; backend auto-generates if omitted
 * @param {string|null} organizationId  — opaque tenant ID
 */
export const createDpia = (projectName, organizationId) =>
  axios.post(BASE, null, { params: { projectName, organizationId } });

export const patchDepartments = (id, departmentIds) =>
  axios.patch(`${BASE}/${id}/departments`, departmentIds);

export const getAllDpia = (organizationId) =>
  axios.get(BASE, { params: organizationId ? { organizationId } : {} });

export const saveStage1 = (id, payload) =>
  axios.put(`${BASE}/${id}/stage1`, payload);

export const saveStage2 = (id, payload) =>
  axios.put(`${BASE}/${id}/stage2`, payload);

/**
 * PUT /api/dpia/{id}/stage3
 * Sends raw Stage3Form state — backend Stage3Mapper handles normalisation.
 */
export const saveStage3 = (id, payload) =>
  axios.put(`${BASE}/${id}/stage3`, payload);

export const submitDpia = (id) => axios.post(`${BASE}/${id}/submit`);

export const getDpiaById = (id) => axios.get(`${BASE}/${id}`);

export const getCompliance = (id) =>
  axios.get(`${BASE}/${id}/compliance-dashboard`);
