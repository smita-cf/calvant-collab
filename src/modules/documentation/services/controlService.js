// controlService.js
// Centralised frontend service for the /api/controls/* endpoints.
// All four pages (MLD, SoaPage, SavedRisksPage, TreatmentPlanForm) import from here.

const BASE = process.env.NEXT_PUBLIC_SP
  ? `${process.env.NEXT_PUBLIC_SP}/framework/api/controls`
  : "/api/controls";

const controlService = {
  /**
   * Returns all Controls for a framework code (e.g. "ISO27001").
   * Used by TreatmentPlanForm to build the control tree.
   * Each item shape:
   *   { id, frameworkId, controlCode, title, category, sectionType,
   *     description, auditQuestions[], departmentIds[], documents[] }
   */
  getControlsByFramework: async (frameworkCode) => {
    const res = await fetch(`${BASE}/framework/${frameworkCode}`);
    if (!res.ok) throw new Error(`Controls fetch failed: ${res.status}`);
    return res.json();
  },

  /**
   * Fetches a single Control by its MongoDB _id.
   * Used by SavedRisksPage to resolve stored controlReference ids.
   */
  getControlById: async (id) => {
    const res = await fetch(`${BASE}/${id}`);
    if (!res.ok) throw new Error(`Control not found: ${id} (${res.status})`);
    return res.json();
  },
};

export default controlService;