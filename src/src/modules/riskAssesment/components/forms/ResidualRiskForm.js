import React, { useEffect, useCallback } from "react";
import InputField from "../inputs/InputField";
import SelectField from "../inputs/SelectField";

const ResidualRiskForm = ({ formData = {}, handleInputChange }) => {
  useEffect(() => window.scrollTo(0, 0), []);

  const calculateDeadlineDate = useCallback(() => {
    if (formData.date && formData.numberOfDays) {
      const startDate = new Date(formData.date);
      const days = parseInt(formData.numberOfDays) || 0;
      if (days > 0) {
        const deadlineDate = new Date(startDate);
        deadlineDate.setDate(startDate.getDate() + days);
        return deadlineDate.toISOString().split("T")[0];
      }
    }
    return "";
  }, [formData.date, formData.numberOfDays]);

  useEffect(() => {
    const deadline = calculateDeadlineDate();
    if (deadline && deadline !== formData.deadlineDate) {
      handleInputChange({
        target: { name: "deadlineDate", value: deadline },
      });
    }
  }, [calculateDeadlineDate, formData.deadlineDate, handleInputChange]);

  const likelihoodOptions = [
    { value: 1, label: "1 - Unlikely" },
    { value: 2, label: "2 - Possible" },
    { value: 3, label: "3 - Likely" },
    { value: 4, label: "4 - Almost Certain" },
  ];

  const impactOptions = [
    { value: 1, label: "1 - Low Impact" },
    { value: 2, label: "2 - Medium Impact" },
    { value: 3, label: "3 - High Impact" },
  ];

  const riskActionMapping = {
    Low: ["Accept", "Monitor"],
    Medium: ["Mitigate", "Monitor"],
    High: ["Mitigate"],
  };

  const calculateResidualRiskScore = () => {
    const impact = parseInt(formData.impactAfterTreatment) || 0;
    const likelihood = parseInt(formData.likelihoodAfterTreatment) || 0;
    return impact * likelihood;
  };

  const calculateRiskLevel = (score) => {
    if (score <= 3) return "Low";
    if (score <= 8) return "Medium";
    if (score <= 12) return "High";
    return "Critical";
  };

  const residualRiskScore = calculateResidualRiskScore();
  const residualRiskLevel = calculateRiskLevel(residualRiskScore);

  const summaryCardStyle = {
    background: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
    color: "white",
    padding: "10px 15px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(155, 89, 182, 0.25)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  };

  const calculatedFieldsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "15px",
    background: "#ecf0f1",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "15px",
  };

  const calculatedItemStyle = {
    textAlign: "center",
    background: "white",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  };

  const calculatedLabelStyle = {
    display: "block",
    fontWeight: "500",
    color: "#34495e",
    marginBottom: "4px",
    fontSize: "11px",
    textTransform: "uppercase",
  };

  const calculatedValueStyle = {
    fontSize: "16px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "6px",
    background: "#ffffff",
    color: "#2c3e50",
    border: "1px solid #ecf0f1",
  };

  const summaryItemStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  };

  const summaryLabelStyle = {
    fontSize: "10px",
    opacity: 0.85,
    fontWeight: "500",
    textTransform: "uppercase",
  };

  const summaryValueStyle = {
    fontSize: "14px",
    fontWeight: "700",
  };

  const formStyle = {
    background: "#f8f9fa",
    padding: "20px",
    borderRadius: "12px",
    maxWidth: "700px",
    margin: "0 auto",
    border: "1px solid #e9ecef",
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "Not Set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <div style={formStyle}>
      {/* Task Scheduling */}
      <div
        style={{
          background: "rgba(155, 89, 182, 0.05)",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid rgba(155, 89, 182, 0.1)",
          marginBottom: "15px",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>
          📅 Task Scheduling
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "12px",
          }}
        >
          <InputField
            label="Start Date"
            name="startDateDisplay"
            value={formData.date || ""}
            onChange={() => {}}
            readOnly
            type="date"
          />
          <InputField
            label="Target Date (Days)"
            name="numberOfDays"
            value={formData.numberOfDays || ""}
            onChange={handleInputChange}
            type="number"
            min="1"
            max="365"
          />
        </div>

        {formData.numberOfDays && formData.date && (
          <div
            style={{
              background: "#1abc9c",
              color: "white",
              padding: "12px",
              borderRadius: "8px",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            📅 {formatDateForDisplay(calculateDeadlineDate())}
          </div>
        )}
      </div>

      {/* Residual Risk Assessment */}
      <div
        style={{
          background: "rgba(155, 89, 182, 0.05)",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid rgba(155, 89, 182, 0.1)",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "5px" }}>
          🎯 Residual Risk Assessment
        </h3>
        <p style={{ textAlign: "center", color: "#7f8c8d", fontSize: "12px" }}>
          Result from Risk Assessment
        </p>

        <div style={summaryCardStyle}>
          <div style={summaryItemStyle}>
            <span style={summaryLabelStyle}>Likelihood</span>
            <span style={summaryValueStyle}>
              {formData.probability || "Not Set"}
            </span>
          </div>
          <div style={summaryItemStyle}>
            <span style={summaryLabelStyle}>Impact</span>
            <span style={summaryValueStyle}>
              {formData.impact || "Not Set"}
            </span>
          </div>
          <div style={summaryItemStyle}>
            <span style={summaryLabelStyle}>Risk Score</span>
            <span style={summaryValueStyle}>
              {parseInt(formData.impact) * parseInt(formData.probability) ||
                "Not Set"}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px",
            marginTop: "10px",
          }}
        >
          <SelectField
            label="Likelihood After Treatment"
            name="likelihoodAfterTreatment"
            value={formData.likelihoodAfterTreatment || ""}
            onChange={handleInputChange}
            options={likelihoodOptions}
            placeholder="Select Likelihood"
          />
          <SelectField
            label="Impact After Treatment"
            name="impactAfterTreatment"
            value={formData.impactAfterTreatment || ""}
            onChange={handleInputChange}
            options={impactOptions}
            placeholder="Select Impact"
          />
        </div>

        {formData.likelihoodAfterTreatment && formData.impactAfterTreatment && (
          <div style={calculatedFieldsStyle}>
            <div style={calculatedItemStyle}>
              <label style={calculatedLabelStyle}>Likelihood</label>
              <span style={calculatedValueStyle}>
                {formData.likelihoodAfterTreatment}
              </span>
            </div>
            <div style={calculatedItemStyle}>
              <label style={calculatedLabelStyle}>Impact</label>
              <span style={calculatedValueStyle}>
                {formData.impactAfterTreatment}
              </span>
            </div>
            <div style={calculatedItemStyle}>
              <label style={calculatedLabelStyle}>Risk Score</label>
              <span style={calculatedValueStyle}>{residualRiskScore}</span>
            </div>
            <div style={calculatedItemStyle}>
              <label style={calculatedLabelStyle}>Risk Level</label>
              <span
                style={{
                  ...calculatedValueStyle,
                  backgroundColor:
                    residualRiskLevel === "Low"
                      ? "#d5f4e6"
                      : residualRiskLevel === "Medium"
                      ? "#fef9e7"
                      : residualRiskLevel === "High"
                      ? "#fdf2e9"
                      : "#fadbd8",
                  color:
                    residualRiskLevel === "Low"
                      ? "#27ae60"
                      : residualRiskLevel === "Medium"
                      ? "#f39c12"
                      : residualRiskLevel === "High"
                      ? "#e67e22"
                      : "#e74c3c",
                  border: `1px solid ${
                    residualRiskLevel === "Low"
                      ? "#27ae60"
                      : residualRiskLevel === "Medium"
                      ? "#f39c12"
                      : residualRiskLevel === "High"
                      ? "#e67e22"
                      : "#e74c3c"
                  }`,
                }}
              >
                {residualRiskLevel}
              </span>
            </div>
            {/* Recommended Actions */}
            {residualRiskLevel && riskActionMapping[residualRiskLevel] && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                <h4
                  style={{
                    marginBottom: "8px",
                    fontSize: "12px",
                    color: "#f39c12",
                  }}
                >
                  ⚡ Recommended Actions
                </h4>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  {riskActionMapping[residualRiskLevel].map((action, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "12px",
                        backgroundColor: "#f1c40f",
                        color: "white",
                        fontWeight: "500",
                        fontSize: "10px",
                      }}
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidualRiskForm;
