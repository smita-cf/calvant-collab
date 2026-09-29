const CONSENT_BASE = `${process.env.REACT_APP_CFTB}/consent-service/api/v1`;

const getToken = () => sessionStorage.getItem("token") || "";

const authHeader = (token) => ({
  Authorization: `Bearer ${token || getToken()}`,
  "Content-Type": "application/json",
});

// ── Internal helpers ───────────────────────────────────────────────────────

async function fetchClients() {
  const res = await fetch(`${CONSENT_BASE}/admin/clients`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error(`Failed to fetch clients (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : data?.clients ?? [];
}

async function fetchConsentsForClient(clientId) {
  const res = await fetch(`${CONSENT_BASE}/admin/consents?clientId=${clientId}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error(`Failed to fetch consents for client ${clientId} (${res.status})`);
  const data = await res.json();
  const records = Array.isArray(data) ? data : data?.consents ?? [];
  return records.map((r) => ({ ...r, clientId }));
}

// ── Field mapping helpers ──────────────────────────────────────────────────

function mapStatus(status) {
  if (!status) return "Pending";
  switch (status.toUpperCase()) {
    case "GIVEN":     return "Active";
    case "WITHDRAWN": return "Revoked";
    case "EXPIRED":   return "Expired";
    case "PENDING":   return "Pending";
    default:          return status;
  }
}

function mapAction(statusOrAction) {
  if (!statusOrAction) return "Record Accessed";
  switch ((statusOrAction || "").toUpperCase()) {
    case "GIVEN":     return "Consent Granted";
    case "WITHDRAWN": return "Consent Revoked";
    case "EXPIRED":   return "Consent Expired";
    case "UPDATED":   return "Consent Updated";
    case "VIEWED":    return "Consent Viewed";
    default:          return statusOrAction;
  }
}

function mapSeverity(statusOrAction) {
  if (!statusOrAction) return "Low";
  const s = (statusOrAction || "").toUpperCase();
  if (["WITHDRAWN", "EXPIRED", "CONSENT REVOKED", "CONSENT EXPIRED"].includes(s)) return "High";
  if (["UPDATED", "CONSENT UPDATED", "PREFERENCE CHANGED"].includes(s)) return "Medium";
  return "Low";
}

// ── Public API ─────────────────────────────────────────────────────────────

const consentService = {

  // ── Called by ConsentManagementDashboard + ConsentRecordsPage (zip pages) ─
  // Fetches all clients → all consents per client → merges & maps to the
  // field shape the zip-file pages render (subjectId, subjectName, status etc.)
  getAllConsentRecords: async () => {
    const clients = await fetchClients();
    const activeClients = clients.filter((c) => c.active !== false);

    const results = await Promise.allSettled(
      activeClients.map((c) => fetchConsentsForClient(c.id))
    );

    const merged = results.flatMap((r) =>
      r.status === "fulfilled" ? r.value : []
    );

    return merged.map((r) => ({
      ...r,
      _id:            r._id ?? r.id ?? r.consentRecordId,
      subjectId:      r.subjectId   ?? r.endUserRef ?? "—",
      subjectName:    r.subjectName ?? r.endUserRef ?? "—",
      subjectEmail:   r.subjectEmail ?? "",
      status:         mapStatus(r.status),
      purpose:        r.purpose        ?? r.consentDefinitionId ?? "—",
      channel:        r.channel        ?? r.origin              ?? "—",
      legalBasis:     r.legalBasis     ?? "Consent",
      consentVersion: r.consentVersion ?? r.formId              ?? "—",
      createdAt:      r.createdAt      ?? r.changedAt,
      updatedAt:      r.updatedAt      ?? r.changedAt,
      expiresAt:      r.expiresAt      ?? null,
      ipAddress:      r.ipAddress      ?? "—",
      organization:   r.organization   ?? "",
      department:     r.department     ?? "",
    }));
  },

  // ── Called by AuditTrailsPage + ConsentManagementDashboard (zip pages) ───
  // No global audit endpoint exists, so we fetch histories per consent record.
  getAllAuditTrails: async () => {
    try {
      const clients = await fetchClients();
      const activeClients = clients.filter((c) => c.active !== false);

      const consentResults = await Promise.allSettled(
        activeClients.map((c) => fetchConsentsForClient(c.id))
      );
      const allConsents = consentResults.flatMap((r) =>
        r.status === "fulfilled" ? r.value : []
      );

      // Cap at 100 records to avoid flooding the API
      const capped = allConsents.slice(0, 100);

      const historyResults = await Promise.allSettled(
        capped.map(async (record) => {
          const id = record._id ?? record.id ?? record.consentRecordId;
          if (!id) return [];
          const res = await fetch(
            `${CONSENT_BASE}/admin/consents/${id}/history`,
            { headers: authHeader() }
          );
          if (!res.ok) return [];
          const data = await res.json();
          const entries = Array.isArray(data) ? data : data?.history ?? [];
          return entries.map((h, i) => ({
            _id:       h._id ?? `${id}_h${i}`,
            recordId:  id,
            subjectId: record.subjectId ?? record.endUserRef ?? "—",
            action:    mapAction(h.status ?? h.action),
            actor:     h.actor     ?? h.changedBy ?? "System",
            module:    h.module    ?? h.origin    ?? "Consent Portal",
            severity:  mapSeverity(h.status ?? h.action),
            ipAddress: h.ipAddress ?? "—",
            timestamp: h.changedAt ?? h.createdAt ?? h.timestamp,
            details:   h.details   ?? `${mapAction(h.status)} for ${record.endUserRef ?? id}`,
            changes:   h.changes   ?? null,
          }));
        })
      );

      return historyResults.flatMap((r) =>
        r.status === "fulfilled" ? r.value : []
      );
    } catch (err) {
      console.error("getAllAuditTrails error:", err);
      return [];
    }
  },

  // ── Called by the working ConsentDashboard at /consent ───────────────────

  listClients: async (token) => {
    const res = await fetch(`${CONSENT_BASE}/admin/clients`, {
      headers: authHeader(token),
    });
    if (!res.ok) throw new Error(`Failed to fetch clients (${res.status})`);
    return await res.json();
  },

  listConsents: async (token, clientId) => {
    const res = await fetch(
      `${CONSENT_BASE}/admin/consents?clientId=${clientId}`,
      { headers: authHeader(token) }
    );
    if (!res.ok) throw new Error(`Failed to fetch consents (${res.status})`);
    return await res.json();
  },

  getConsentHistory: async (token, consentRecordId) => {
    const res = await fetch(
      `${CONSENT_BASE}/admin/consents/${consentRecordId}/history`,
      { headers: authHeader(token) }
    );
    if (!res.ok) throw new Error(`Failed to fetch history (${res.status})`);
    return await res.json();
  },

  getUserAuditHistory: async (token, clientId, endUserRef) => {
    const params = new URLSearchParams({ clientId, endUserRef });
    const res = await fetch(
      `${CONSENT_BASE}/admin/consents/user/history?${params}`,
      { headers: authHeader(token) }
    );
    if (!res.ok) throw new Error(`Failed to fetch user audit history (${res.status})`);
    return await res.json();
  },

  listDefinitions: async (token, clientId) => {
    const res = await fetch(
      `${CONSENT_BASE}/admin/clients/${clientId}/definitions`,
      { headers: authHeader(token) }
    );
    if (!res.ok) throw new Error(`Failed to fetch definitions (${res.status})`);
    return await res.json();
  },

  listDefinitionsbyId: async (token, clientId, definationId) => {
    const res = await fetch(
      `${CONSENT_BASE}/admin/clients/${clientId}/definitions/${definationId}`,
      { headers: authHeader(token) }
    );
    if (!res.ok) throw new Error(`Failed to fetch definition (${res.status})`);
    return await res.json();
  },

  createClient: async (token, payload) => {
    const res = await fetch(`${CONSENT_BASE}/admin/clients`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create client (${res.status})`);
    return await res.json();
  },

  deactivateClient: async (token, clientId) => {
    const res = await fetch(`${CONSENT_BASE}/admin/clients/${clientId}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
    if (!res.ok) throw new Error(`Failed to deactivate client (${res.status})`);
    return res.status === 204 ? null : await res.json();
  },

  createDefinition: async (token, clientId, payload) => {
    const res = await fetch(
      `${CONSENT_BASE}/admin/clients/${clientId}/definitions`,
      {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) throw new Error(`Failed to create definition (${res.status})`);
    return await res.json();
  },

  deactivateDefinition: async (token, clientId, definitionId) => {
    const res = await fetch(
      `${CONSENT_BASE}/admin/clients/${clientId}/definitions/${definitionId}`,
      { method: "DELETE", headers: authHeader(token) }
    );
    if (!res.ok) throw new Error(`Failed to deactivate definition (${res.status})`);
    return res.status === 204 ? null : await res.json();
  },
};

export default consentService;