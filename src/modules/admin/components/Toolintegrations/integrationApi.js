
// src/modules/admin/components/Integrations/integrationApi.js
const BASE = process.env.NEXT_PUBLIC_COMPLIANCE_BRAIN_URL || 'https://api.calvant.com/compliance-brain';
//const BASE = process.env.NEXT_PUBLIC_COMPLIANCE_BRAIN_URL || 'http://localhost:4014';
const getHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const integrationApi = {

  getBuiltInConfig: (tenantId) =>
    fetch(`${BASE}/api/integrations/${tenantId}`, { headers: getHeaders() })
      .then(r => r.json()),

  saveBuiltIn: (tenantId, provider, payload) =>
    fetch(`${BASE}/api/integrations/${tenantId}/${provider}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }).then(r => r.json()),

  removeBuiltIn: (tenantId, provider) =>
    fetch(`${BASE}/api/integrations/${tenantId}/${provider}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(r => r.json()),

  testBuiltIn: (tenantId, provider) =>
    fetch(`${BASE}/api/integrations/${tenantId}/${provider}/test`, {
      method: 'POST',
      headers: getHeaders(),
    }).then(r => r.json()),

  getAllCustom: (tenantId) =>
    fetch(`${BASE}/api/integrations/${tenantId}/custom`, { headers: getHeaders() })
      .then(r => r.json()),

  createCustom: (tenantId, payload) =>
    fetch(`${BASE}/api/integrations/${tenantId}/custom`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }).then(r => r.json()),

  updateCustom: (tenantId, id, payload) =>
    fetch(`${BASE}/api/integrations/${tenantId}/custom/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }).then(r => r.json()),

  deleteCustom: (tenantId, id) =>
    fetch(`${BASE}/api/integrations/${tenantId}/custom/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(r => r.json()),

  toggleCustom: (tenantId, id) =>
    fetch(`${BASE}/api/integrations/${tenantId}/custom/${id}/toggle`, {
      method: 'POST',
      headers: getHeaders(),
    }).then(r => r.json()),

  triggerSync: (tenantId) =>
    fetch(`${BASE}/compliance/sync?tenantId=${tenantId}`, {
      method: 'POST',
      headers: getHeaders(),
    }).then(r => r.json()),
};

export default integrationApi;