// services/documentationService.js
import axios from "axios";
const API_BASE = "https://cftoolbackend.duckdns.org/api";

// Helper for JSON requests (GET/POST JSON)
async function request(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Request failed");
  }
  return res.json();
}

const documentationService = {
  // --- SoA ---
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

  // --- Controls ---
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
    return request(`${API_BASE}/controls/${id}`, { method: "DELETE" });
  },

  // --- Reports ---
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

  // --- Settings ---
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

  // --- Documents ---
  getDocuments() {
    return request(`${API_BASE}/documents`);
  },

  /**
   * Upload a document file.
   * @param {File} file - the selected file
   * @param {string} soaId - optional SoA id
   * @param {string} controlId - optional Control id
   */
  async uploadDocument({
    file,
    soaId,
    controlId,
    uploaderName,
    departmentName,
  }) {
    if (!file) throw new Error("File is required");

    const formData = new FormData();
    formData.append("file", file); // must match multer.single("file")
    if (soaId) formData.append("soaId", soaId);
    if (controlId) formData.append("controlId", controlId);

    // ✅ Add uploader info
    if (uploaderName) formData.append("uploaderName", uploaderName);
    if (departmentName) formData.append("departmentName", departmentName);

    // Use axios to send multipart/form-data
    const res = await axios.post(`${API_BASE}/documents/upload`, formData, {
      headers: {
        // Do NOT set Content-Type manually for FormData!
      },
    });

    return res.data;
  },
  updateApprovalDate(docId, approvalDate) {
    return request(`${API_BASE}/documents/${docId}/approval`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalDate }),
    });
  },
  /**
   * Delete a document by ID
   * @param {string|number} id - Document ID
   */
  deleteDocument(id) {
    return request(`${API_BASE}/documents/${id}`, { method: "DELETE" });
  },
  getDocumentsBySoA(soaId) {
    return request(`${API_BASE}/documents?soaId=${soaId}`);
  },
  getDocumentsByControl(controlId) {
    return request(`${API_BASE}/documents?controlId=${controlId}`);
  },

  // --- Required Docs per Control ---
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
