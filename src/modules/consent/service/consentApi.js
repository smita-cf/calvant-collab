// //const CONSENT_BASE = `${process.env.REACT_APP_SP}/consent-service/api/v1`;

// class ConsentService {

//   // ── CLIENTS ───────────────────────────────────────────────

//   async listClients(token) {
//     try {
//       const res = await fetch(`${CONSENT_BASE}/admin/clients`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Failed to fetch clients");
//       return await res.json();
//     } catch (err) {
//       console.error("Error fetching clients:", err);
//       return null;
//     }
//   }

//   async createClient(token, payload) {
//     try {
//       const res = await fetch(`${CONSENT_BASE}/admin/clients`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Failed to create client");
//       return await res.json();
//     } catch (err) {
//       console.error("Error creating client:", err);
//       throw err;
//     }
//   }

//   async deactivateClient(token, clientId) {
//     try {
//       const res = await fetch(`${CONSENT_BASE}/admin/clients/${clientId}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Failed to deactivate client");
//       return res.status === 204 ? null : await res.json();
//     } catch (err) {
//       console.error("Error deactivating client:", err);
//       throw err;
//     }
//   }

//   // ── CONSENT DEFINITIONS ───────────────────────────────────

//   async listDefinitions(token, clientId) {
//     try {
//       const res = await fetch(`${CONSENT_BASE}/admin/clients/${clientId}/definitions`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Failed to fetch definitions");
//       return await res.json();
//     } catch (err) {
//       console.error("Error fetching definitions:", err);
//       return null;
//     }
//   }

//     async listDefinitionsbyId(token, clientId , definationId) {
//     try {
//       const res = await fetch(`${CONSENT_BASE}/admin/clients/${clientId}/definitions/${definationId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Failed to fetch definitions");
//       return await res.json();
//     } catch (err) {
//       console.error("Error fetching definitions:", err);
//       return null;
//     }
//   }

//   async createDefinition(token, clientId, payload) {
//     try {
//       const res = await fetch(`${CONSENT_BASE}/admin/clients/${clientId}/definitions`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Failed to create definition");
//       return await res.json();
//     } catch (err) {
//       console.error("Error creating definition:", err);
//       throw err;
//     }
//   }

//   async deactivateDefinition(token, clientId, definitionId) {
//     try {
//       const res = await fetch(`${CONSENT_BASE}/admin/clients/${clientId}/definitions/${definitionId}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Failed to deactivate definition");
//       return res.status === 204 ? null : await res.json();
//     } catch (err) {
//       console.error("Error deactivating definition:", err);
//       throw err;
//     }
//   }

//   // ── CONSENT RECORDS ───────────────────────────────────────

//   async listConsents(token , clientId) {
//     try {
//       const res = await fetch(`${CONSENT_BASE}/admin/consents?clientId=${clientId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Failed to fetch consent records");
//       return await res.json();
//     } catch (err) {
//       console.error("Error fetching consent records:", err);
//       return null;
//     }
//   }

//   // ── AUDIT HISTORY ─────────────────────────────────────────

//   async getConsentHistory(token, consentRecordId) {
//     try {
//       const res = await fetch(`${CONSENT_BASE}/admin/consents/${consentRecordId}/history`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Failed to fetch consent history");
//       return await res.json();
//     } catch (err) {
//       console.error("Error fetching consent history:", err);
//       return null;
//     }
//   }

//   async getUserAuditHistory(token, clientId, endUserRef) {
//     try {
//       const params = new URLSearchParams({ clientId, endUserRef });
//       const res = await fetch(`${CONSENT_BASE}/admin/consents/user/history?${params}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Failed to fetch user audit history");
//       return await res.json();
//     } catch (err) {
//       console.error("Error fetching user audit history:", err);
//       return null;
//     }
//   }
// }

// export default new ConsentService();