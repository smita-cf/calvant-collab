class riskService {
  constructor() {
    this.baseUrl = "https://cftoolbackend.duckdns.org/api/risks"; // point to backend
  }

  // --- Get all risks
  async getAllRisks() {
    try {
      const response = await fetch(this.baseUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch risks: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error getting risks:", error);
      return [];
    }
  }

  // --- Get all risk IDs
  async getAllRiskIds() {
    try {
      const risks = await this.getAllRisks();
      return Array.isArray(risks) ? risks.map((r) => r.riskId) : [];
    } catch (error) {
      console.error("Error getting risk IDs:", error);
      return [];
    }
  }

  // --- Save (create or update) risk
  async saveRisk(riskData) {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST", // backend decides insert/update
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(riskData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save risk: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving risk:", error);
      throw error;
    }
  }

  // --- Get one risk
  async getRiskById(riskId) {
    try {
      const response = await fetch(`${this.baseUrl}/${riskId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch risk ${riskId}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting risk by ID:", error);
      return null;
    }
  }

  // --- Delete one risk
  async deleteRisk(riskId) {
    try {
      const response = await fetch(`${this.baseUrl}/${riskId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete risk ${riskId}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting risk:", error);
      return false;
    }
  }
}

export default new riskService();
