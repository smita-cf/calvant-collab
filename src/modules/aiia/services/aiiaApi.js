// src/modules/aiia/services/aiiaApi.js
import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CFTB}/aiia-service/`;

// const API_BASE_URL = `http://localhost:4020/`

const aiiaApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the current user's organizationId from sessionStorage.
 * Throws if not found so callers surface the problem early.
 */
const getOrganizationId = () => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const orgId = user?.organizationId || user?.organization;
  if (!orgId) throw new Error('organizationId not found in session. Please log in again.');
  return orgId;
};

// ─── Interceptors ─────────────────────────────────────────────────────────────

aiiaApi.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('authToken');
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (user?.organizationId || user?.organization)
      config.headers['X-Organization'] = user.organizationId || user.organization;
    return config;
  },
  error => Promise.reject(error)
);

aiiaApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 1 API METHODS
// All read/update/delete endpoints include organizationId as a query param.
// ═══════════════════════════════════════════════════════════════════════════

export const stage1Api = {
  /** organizationId must be present in the data payload */
  create: (data) => {
    const orgId = getOrganizationId();
    return aiiaApi.post('/api/stage1/create', { ...data, organizationId: orgId });
  },

  getAll: () => {
    const orgId = getOrganizationId();
    return aiiaApi.get('/api/stage1/list/all', { params: { organizationId: orgId } });
  },

  getById: (id) => {
    const orgId = getOrganizationId();
    return aiiaApi.get(`/api/stage1/${id}`, { params: { organizationId: orgId } });
  },

  update: (id, data) => {
    const orgId = getOrganizationId();
    return aiiaApi.put(`/api/stage1/${id}`, data, { params: { organizationId: orgId } });
  },

  delete: (id) => {
    const orgId = getOrganizationId();
    return aiiaApi.delete(`/api/stage1/${id}`, { params: { organizationId: orgId } });
  },

  getByStatus: (status) => {
    const orgId = getOrganizationId();
    return aiiaApi.get(`/api/stage1/list/status/${status}`, { params: { organizationId: orgId } });
  },

  getByDepartment: (dept) => {
    const orgId = getOrganizationId();
    return aiiaApi.get(`/api/stage1/list/department/${dept}`, { params: { organizationId: orgId } });
  },

  getByOwner: (owner) => {
    const orgId = getOrganizationId();
    return aiiaApi.get(`/api/stage1/list/owner/${owner}`, { params: { organizationId: orgId } });
  },

  getRecent: () => {
    const orgId = getOrganizationId();
    return aiiaApi.get('/api/stage1/recent/last-30-days', { params: { organizationId: orgId } });
  },

  searchByName: (name) => {
    const orgId = getOrganizationId();
    return aiiaApi.get(`/api/stage1/search/name/${name}`, { params: { organizationId: orgId } });
  },

  countByStatus: (status) => {
    const orgId = getOrganizationId();
    return aiiaApi.get(`/api/stage1/count/status/${status}`, { params: { organizationId: orgId } });
  },

  getByAssignedTo: (userId) => {
    const orgId = getOrganizationId();
    return aiiaApi.get(`/api/stage1/list/assigned-to/${userId}`, { params: { organizationId: orgId } });
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// STAGE 2 API METHODS
// ═══════════════════════════════════════════════════════════════════════════

export const stage2Api = {
  /** organizationId must be present in the data payload */
  create: (data) => {
    const orgId = getOrganizationId();
    return aiiaApi.post('/api/stage2/create', { ...data, organizationId: orgId });
  },

  getAll: () => {
    const orgId = getOrganizationId();
    return aiiaApi.get('/api/stage2/list/all', { params: { organizationId: orgId } });
  },

  getById: (id) => {
    const orgId = getOrganizationId();
    return aiiaApi.get(`/api/stage2/${id}`, { params: { organizationId: orgId } });
  },

  getByStage1: (stage1Id) => {
    const orgId = getOrganizationId();
    return aiiaApi.get(`/api/stage2/stage1/${stage1Id}`, { params: { organizationId: orgId } });
  },

  update: (id, data) => {
    const orgId = getOrganizationId();
    return aiiaApi.put(`/api/stage2/${id}`, data, { params: { organizationId: orgId } });
  },

  delete: (id) => {
    const orgId = getOrganizationId();
    return aiiaApi.delete(`/api/stage2/${id}`, { params: { organizationId: orgId } });
  },

  getByStatus: (status) => {
    const orgId = getOrganizationId();
    return aiiaApi.get(`/api/stage2/list/status/${status}`, { params: { organizationId: orgId } });
  },

  getByType: (type) => {
    const orgId = getOrganizationId();
    return aiiaApi.get(`/api/stage2/list/type/${type}`, { params: { organizationId: orgId } });
  },

  getIncomplete: (threshold = 50) => {
    const orgId = getOrganizationId();
    return aiiaApi.get('/api/stage2/incomplete', { params: { organizationId: orgId, threshold } });
  },

  getRecent: () => {
    const orgId = getOrganizationId();
    return aiiaApi.get('/api/stage2/recent/last-7-days', { params: { organizationId: orgId } });
  },

  countByStatus: (status) => {
    const orgId = getOrganizationId();
    return aiiaApi.get(`/api/stage2/count/status/${status}`, { params: { organizationId: orgId } });
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// RISK ASSESSMENT API METHODS
// ═══════════════════════════════════════════════════════════════════════════

export const risksApi = {
  create: (data) => aiiaApi.post('/api/risks/create', data),
  getAll: () => aiiaApi.get('/api/risks/list/all'),
  getById: (id) => aiiaApi.get(`/api/risks/${id}`),
  getByStage1: (stage1Id) => aiiaApi.get(`/api/risks/stage1/${stage1Id}`),
  update: (id, data) => aiiaApi.put(`/api/risks/${id}`, data),
  delete: (id) => aiiaApi.delete(`/api/risks/${id}`),
  getByCategory: (category) => aiiaApi.get(`/api/risks/category/${category}`),
  getHighSeverity: () => aiiaApi.get('/api/risks/severity/high'),
  getOverdue: () => aiiaApi.get('/api/risks/overdue'),
  getByMitigationStatus: (status) => aiiaApi.get(`/api/risks/mitigation-status/${status}`),
  getByOwner: (ownerName) => aiiaApi.get(`/api/risks/owner/${ownerName}`),
  getDashboardSummary: () => aiiaApi.get('/api/risks/dashboard/summary')
};

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOG API METHODS
// ═══════════════════════════════════════════════════════════════════════════

export const auditApi = {
  create: (data) => aiiaApi.post('/api/audit-logs/create', data),
  getAll: () => aiiaApi.get('/api/audit-logs/list/all'),
  getById: (id) => aiiaApi.get(`/api/audit-logs/${id}`),
  getByStage1: (stage1Id) => aiiaApi.get(`/api/audit-logs/stage1/${stage1Id}`),
  getByUserId: (userId) => aiiaApi.get(`/api/audit-logs/user/${userId}`),
  getByEmail: (email) => aiiaApi.get(`/api/audit-logs/email/${email}`),
  getByAction: (action) => aiiaApi.get(`/api/audit-logs/action/${action}`),
  getByEntityType: (entityType) => aiiaApi.get(`/api/audit-logs/entity-type/${entityType}`),
  getByEntityId: (entityId) => aiiaApi.get(`/api/audit-logs/entity/${entityId}`),
  getAuditTrail: (stage1Id, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return aiiaApi.get(`/api/audit-logs/audit-trail/${stage1Id}?${params}`);
  },
  getRecent: () => aiiaApi.get('/api/audit-logs/recent/last-24-hours'),
  countByAction: (action) => aiiaApi.get(`/api/audit-logs/count/action/${action}`),
  countByUser: (userId) => aiiaApi.get(`/api/audit-logs/count/user/${userId}`),
  cleanup: (days) => aiiaApi.delete(`/api/audit-logs/cleanup/older-than-days/${days}`)
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY METHODS
// ═══════════════════════════════════════════════════════════════════════════

export const aiiaUtils = {
  getAllUsers: () => aiiaApi.get('/api/users'),
  getUsersByDepartment: (dept) => aiiaApi.get(`/api/users/department/${dept}`),
  getRiskOwners: () => aiiaApi.get('/api/users/role/risk_owner'),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return aiiaApi.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default { stage1Api, stage2Api, risksApi, auditApi, aiiaUtils };