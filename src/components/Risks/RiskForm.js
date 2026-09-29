import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import API from "../../api/api";

const API_URL = "/risks";

const safeNumber = (value) => Number(value) || 0;

const getLevelColor = (level) => {
  switch (level) {
    case "High":
      return "#f8d7da";
    case "Medium":
      return "#fff3cd";
    case "Low":
      return "#d4edda";
    default:
      return "#f8f9fa";
  }
};

export default function RiskForm() {
  const { id } = useParams();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    riskId: "",
    riskDescription: "",
    department: "",
    riskType: "Strategic",
    riskLevel: "Low",
    riskScore: 0,
    asset: "",
    assetType: "Private",
    confidentiality: 1,
    integrity: 1,
    availability: 1,
    impact: 1,
    likelihood: 1,
    existingControls: "",
    additionalControls: "",
    additionalNotes: "",
    status: "Active",
    deadlineDate: "",
  });

  const calculateRiskScoreAndLevel = (currentFormData) => {
    const c = safeNumber(currentFormData.confidentiality);
    const i = safeNumber(currentFormData.integrity);
    const a = safeNumber(currentFormData.availability);

    const calculatedImpact = Math.max(c, i, a);
    const likelihood = safeNumber(currentFormData.likelihood);

    const finalRiskScore = calculatedImpact * likelihood;

    let newRiskLevel = "Low";
    if (finalRiskScore >= 10) {
      newRiskLevel = "High";
    } else if (finalRiskScore >= 5) {
      newRiskLevel = "Medium";
    }

    setFormData((p) => ({
      ...p,
      impact: calculatedImpact,
      riskScore: finalRiskScore,
      riskLevel: newRiskLevel,
    }));
  };

  const fetchDepartments = async () => {
    try {
      const res = await API.get("/departments");
      const userString = sessionStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;

      let filteredDepartments = res.data || [];

      if (user && user.role === "root") {
        const userOrganization = user.organization;

        if (userOrganization) {
          filteredDepartments = filteredDepartments.filter(
            (department) => department.organization === userOrganization
          );
        }
      }

      setDepartments(filteredDepartments);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  const fetchRisk = async () => {
    try {
      const res = await API.get(`${API_URL}/${id}`);
      const r = res.data;

      setFormData((p) => ({
        ...p,
        riskId: r.riskId || "",
        riskDescription: r.riskDescription || "",
        department: r.department || "",
        riskType: r.riskType || "Strategic",
        riskLevel: r.riskLevel || "Low",
        riskScore: r.riskScore || 0,
        asset: r.asset || "",
        assetType: r.assetType || "Private",
        confidentiality: r.confidentiality || 1,
        integrity: r.integrity || 1,
        availability: r.availability || 1,
        impact: r.impact || 1,
        likelihood: r.likelihood || 1,
        existingControls: r.existingControls || "",
        additionalControls: r.additionalControls || "",
        additionalNotes: r.additionalNotes || "",
        status: r.status || "Active",
        deadlineDate: r.deadlineDate ? r.deadlineDate.split("T")[0] : "",
      }));
    } catch (err) {
      console.error("Failed to fetch risk", err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    if (id) fetchRisk();
    calculateRiskScoreAndLevel(formData);
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (
      ["confidentiality", "integrity", "availability", "likelihood"].includes(
        name
      )
    ) {
      calculateRiskScoreAndLevel(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post(API_URL, formData);
      history.push("/risks");
    } catch (err) {
      console.error(err);
      alert("Failed to save risk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", marginLeft: "200px" }}>
      <h2>{id ? "Edit Risk" : "Add Risk"}</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        {[
          ["Risk ID", "riskId"],
          ["Risk Description", "riskDescription", "textarea"],
          ["Asset", "asset"],
          ["Existing Controls", "existingControls", "textarea"],
          ["Additional Controls", "additionalControls", "textarea"],
          ["Additional Notes", "additionalNotes", "textarea"],
        ].map(([label, name, type]) => (
          <div key={name} style={styles.group}>
            <label>{label}</label>
            {type === "textarea" ? (
              <textarea
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required={name === "riskDescription"}
                style={styles.textarea}
              />
            ) : (
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required={name === "riskId"}
                style={styles.input}
              />
            )}
          </div>
        ))}

        <div style={styles.group}>
          <label>Department</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">Select</option>
            {departments.map((d) => (
              <option key={d._id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {[
          ["Risk Type", "riskType", ["Strategic", "Operational", "Tactical"]],
          [
            "Asset Type",
            "assetType",
            ["Public", "Private", "Protected", "Confidential"],
          ],
          ["Status", "status", ["Open", "WIP", "Closed"]],
        ].map(([label, name, options]) => (
          <div key={name} style={styles.group}>
            <label>{label}</label>
            <select
              name={name}
              value={formData[name]}
              onChange={handleChange}
              style={styles.input}
            >
              {options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}

        <h3>Impact Assessment (1-3)</h3>
        {["confidentiality", "integrity", "availability"].map((field) => (
          <div key={field} style={styles.group}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <input
              type="number"
              min="1"
              max="3"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        ))}

        <div style={styles.group}>
          <label>Auto-Calculated Impact (Max C, I, A)</label>
          <input readOnly value={formData.impact} style={styles.input} />
        </div>

        <div style={styles.group}>
          <label>Likelihood (1-4)</label>
          <input
            type="number"
            min="1"
            max="4"
            name="likelihood"
            value={formData.likelihood}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.group}>
          <label>Risk Score (Impact x Likelihood)</label>
          <input
            readOnly
            value={formData.riskScore}
            style={{ ...styles.input, fontWeight: "bold" }}
          />
        </div>

        <div style={styles.group}>
          <label>Risk Level (Calculated)</label>
          <input
            readOnly
            value={formData.riskLevel}
            style={{
              ...styles.input,
              fontWeight: "bold",
              backgroundColor: getLevelColor(formData.riskLevel),
            }}
          />
        </div>

        <div style={styles.group}>
          <label>Deadline Date</label>
          <input
            type="date"
            name="deadlineDate"
            value={formData.deadlineDate}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <button disabled={loading} style={styles.submitButton}>
          {loading ? "Saving..." : "Save Risk"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  group: { marginBottom: "1rem", display: "flex", flexDirection: "column" },
  input: { padding: 8, borderRadius: 6, border: "1px solid #ccc" },
  textarea: {
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ccc",
    minHeight: 60,
  },
  submitButton: {
    background: "#2563eb",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
};
