// services/documentationService.js
import axios from "axios";

// ⬅️ Update this to your Spring Boot microservice
const API_BASE = `${process.env.NEXT_PUBLIC_SP}/control-soa/api`;
const API_DOCS = `${process.env.NEXT_PUBLIC_SP}/doc-service/api`;

// Generic JSON fetch helper
async function request(url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Request failed");
  }

  // 204 No Content → return null safely
  if (res.status === 204) {
    return null;
  }

  const contentType = res.headers.get("content-type") || "";

  // JSON response
  if (contentType.includes("application/json")) {
    return res.json();
  }

  // Text response fallback (backend might return plain text)
  return res.text();
}

const documentationService = {
  // =========================================================
  //                      S O A   (Spring Boot)
  // =========================================================

  getSoAEntries() {
    return request(`${API_BASE}/soa`);
  },

  addSoAEntry(entry) {
    return request(`${API_BASE}/soa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  },

  updateSoAEntry(id, updatedFields) {
    return request(`${API_BASE}/soa/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
  },

  deleteSoAEntry(id) {
    return request(`${API_BASE}/soa/${id}`, {
      method: "DELETE",
    });
  },

  // =========================================================
  //                  C O N T R O L S   (Spring Boot)
  // =========================================================

  getControls() {
    return request(`${API_BASE}/controls`);
  },

  addControl(control) {
    return request(`${API_BASE}/controls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(control),
    });
  },

  deleteControl(id) {
    return request(`${API_BASE}/controls/${id}`, {
      method: "DELETE",
    });
  },

  // =========================================================
  //                R E P O R T S  (unchanged)
  // =========================================================

  getReports() {
    return request(`${API_BASE}/reports`);
  },

  addReport(report) {
    return request(`${API_BASE}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    });
  },

  // =========================================================
  //                S E T T I N G S (unchanged)
  // =========================================================

  getSettings() {
    return request(`${API_BASE}/settings`);
  },

  saveSettings(newSettings) {
    return request(`${API_BASE}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    });
  },

  // =========================================================
  //               D O C U M E N T S  (Node backend)
  // =========================================================

  getDocuments() {
    return request(`${API_DOCS}/documents`);
  },

  async uploadDocument({
    file,
    soaId,
    controlId,
    uploaderName,
    departmentName,
    organization,
  }) {
    if (!file) throw new Error("File is required");

    const formData = new FormData();
    formData.append("file", file);

    if (soaId) formData.append("soaId", soaId);
    if (controlId) formData.append("controlId", controlId);
    if (uploaderName) formData.append("uploaderName", uploaderName);
    if (departmentName) formData.append("departmentName", departmentName);
    if (organization) formData.append("organization", organization);
    const res = await axios.post(`${API_DOCS}/documents/upload`, formData, {
      headers: {
        // DO NOT set Content-Type for FormData
      },
    });

    return res.data;
  },

  updateApprovalDate(docId, approvalDate) {
    return request(`${API_DOCS}/documents/${docId}/approval`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalDate }),
    });
  },

  deleteDocument(id, comment) {
    return request(`${API_DOCS}/documents/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment }),
    });
  },

  getDocVersions(docId) {
    return request(`${API_DOCS}/documents/versions/${docId}`);
  },

  getDocumentsBySoA(soaId) {
    return request(`${API_DOCS}/documents?soaId=${soaId}`);
  },

  getDocumentsByControl(controlId) {
    return request(`${API_DOCS}/documents?controlId=${controlId}`);
  },

  // =========================================================
  //           Required Docs Per Control (unchanged)
  // =========================================================

  setRequiredDocs(controlId, docs) {
    return request(`${API_BASE}/controls/${controlId}/requiredDocs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docs }),
    });
  },

  getRequiredDocs(controlId) {
    return request(`${API_BASE}/controls/${controlId}/requiredDocs`);
  },

  getMissingDocs(controlId) {
    return request(`${API_BASE}/controls/${controlId}/missingDocs`);
  },
};

export default documentationService;
