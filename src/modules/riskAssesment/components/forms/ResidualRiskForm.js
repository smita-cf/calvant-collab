import React, { useEffect, useCallback, useState } from "react";
import InputField from "../inputs/InputField";
import SelectField from "../inputs/SelectField";
import Joyride, { STATUS } from "react-joyride";
import CustomTooltip from "../CustomTooltip";

const ResidualRiskForm = ({ formData = {}, handleInputChange }) => {
  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  const [runTour, setRunTour] = useState(false);
  const residualRiskSteps = [
    {
      target: ".start-date-field",
      content:
        "This is the start date for the task schedule. It auto-fills to the risk assessment date.",
      placement: "bottom",
    },
    {
      target: ".number-of-days-field",
      content:
        "Enter the number of days to complete this task. The deadline will be calculated automatically.",
      placement: "bottom",
    },
    {
      target: ".deadline-date-field",
      content:
        "This shows the calculated deadline based on the start date and number of days.",
      placement: "bottom",
    },
    {
      target: ".residual-likelihood-summary",
      content: "This shows the Likelihood from the original risk assessment.",
      placement: "top",
    },
    {
      target: ".residual-impact-summary",
      content: "This shows the Impact from the original risk assessment.",
      placement: "top",
    },
    {
      target: ".residual-risk-score-summary",
      content: "The Risk Score calculated as Impact × Likelihood.",
      placement: "top",
    },
    {
      target: ".likelihood-after-treatment-field",
      content: "Select the Likelihood after treatment for this residual risk.",
      placement: "bottom",
    },
    {
      target: ".impact-after-treatment-field",
      content: "Select the Impact after treatment for this residual risk.",
      placement: "bottom",
    },
    {
      target: ".residual-likelihood-calculated",
      content: "This displays the Likelihood after treatment.",
      placement: "top",
    },
    {
      target: ".residual-impact-calculated",
      content: "This displays the Impact after treatment.",
      placement: "top",
    },
    {
      target: ".residual-risk-score-calculated",
      content:
        "This is the calculated Residual Risk Score based on Likelihood and Impact after treatment.",
      placement: "top",
    },
    {
      target: ".residual-risk-level-calculated",
      content:
        "This shows the Risk Level derived from the Residual Risk Score (Low, Medium, High).",
      placement: "top",
    },
    {
      target: ".recommended-actions-field",
      content: "Recommended actions based on the Residual Risk Level.",
      placement: "bottom",
    },
  ];

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

  const getTintColors = (level) => {
    switch (level) {
      case "Low": return { bg: "#f0fdf4", border: "#bbf7d0", card: "#ffffff", shadow: "rgba(34, 197, 94, 0.15)" };
      case "Medium": return { bg: "#fffbeb", border: "#fde68a", card: "#ffffff", shadow: "rgba(245, 158, 11, 0.15)" };
      case "High": return { bg: "#fef2f2", border: "#fecaca", card: "#ffffff", shadow: "rgba(239, 68, 68, 0.15)" };
      case "Critical": return { bg: "#fff1f2", border: "#fecdd3", card: "#ffffff", shadow: "rgba(225, 29, 72, 0.15)" };
      default: return { bg: "#f8fafc", border: "#e2e8f0", card: "#ffffff", shadow: "rgba(0,0,0,0.08)" };
    }
  };
  const tints = getTintColors(residualRiskLevel);

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
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    background: tints.bg,
    border: `1px solid ${tints.border}`,
    padding: "15px",
    borderRadius: "10px",
    marginTop: "15px",
  };

  const calculatedItemStyle = {
    textAlign: "center",
    background: tints.card,
    padding: "10px",
    borderRadius: "8px",
    boxShadow: `0 2px 8px ${tints.shadow}`,
    border: `1px solid ${tints.border}`,
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
    flex: 1,
    minWidth: "100px",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    textAlign: "center",
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
    margin: "0 auto",
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
  const autoGenButtonStyle = {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  };

  return (
    <div style={formStyle}>
      <Joyride
        steps={residualRiskSteps.map(s => ({ ...s, disableBeacon: true }))}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        scrollOffset={200}
        tooltipComponent={CustomTooltip}
        styles={{
          options: {
            zIndex: 10000,
            overlayColor: "rgba(0, 0, 0, 0.5)",
          },
          spotlight: {
            borderRadius: "12px",
            boxShadow: "0 0 0 3px #ffffff, 0 0 0 6px #3b82f6, 0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          }
        }}
        callback={(data) => {
          const { status } = data;
          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRunTour(false);
          }
        }}
      />
      <div
        style={{
          background: "rgba(155, 89, 182, 0.05)",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid rgba(155, 89, 182, 0.1)",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#000", margin: 0 }}>
            Task Scheduling
          </h3>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#ffffff",
              color: "#3b82f6",
              border: "1px solid #bfdbfe",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(59, 130, 246, 0.15)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              margin: 0
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.transform = "translateY(0)"; }}
            onClick={() => setRunTour(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Tutorial
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "12px",
          }}
        >
          <InputField
            className="start-date-field"
            label="Start Date"
            name="startDateDisplay"
            value={formData.date || ""}
            onChange={() => {}}
            readOnly
            type="date"
          />
          <InputField
            className="number-of-days-field"
            label="Number of Days"
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
            className="deadline-date-field"
            style={{
              background: "#1abc9c",
              color: "white",
              padding: "12px",
              borderRadius: "8px",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {formatDateForDisplay(calculateDeadlineDate())}
          </div>
        )}
      </div>

      <div
        style={{
          background: "rgba(155, 89, 182, 0.05)",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid rgba(155, 89, 182, 0.1)",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#000", marginBottom: "5px" }}>
          Residual Risk Assessment
        </h3>
        <p style={{ textAlign: "center", color: "#7f8c8d", fontSize: "12px" }}>
          Result from Risk Assessment
        </p>

        <div style={summaryCardStyle}>
          <div className="residual-likelihood-summary" style={summaryItemStyle}>
            <span style={summaryLabelStyle}>Likelihood</span>
            <span style={summaryValueStyle}>
              {formData.probability || "Not Set"}
            </span>
          </div>
          <div className="residual-impact-summary" style={summaryItemStyle}>
            <span style={summaryLabelStyle}>Impact</span>
            <span style={summaryValueStyle}>
              {formData.impact || "Not Set"}
            </span>
          </div>
          <div className="residual-risk-score-summary" style={summaryItemStyle}>
            <span style={summaryLabelStyle}>Risk Score</span>
            <span style={summaryValueStyle}>
              {parseInt(formData.impact) * parseInt(formData.probability) ||
                "Not Set"}
            </span>
          </div>
          <div className="residual-risk-level-summary" style={summaryItemStyle}>
            <span style={summaryLabelStyle}>Risk Level</span>
            <span style={summaryValueStyle}>
              {formData.riskLevel || "Not Set"}
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
            className="likelihood-after-treatment-field"
            label="Likelihood After Treatment"
            name="likelihoodAfterTreatment"
            value={formData.likelihoodAfterTreatment || ""}
            onChange={handleInputChange}
            options={likelihoodOptions}
            placeholder="Select Likelihood"
          />
          <SelectField
            className="impact-after-treatment-field"
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
            <div
              className="residual-likelihood-calculated"
              style={calculatedItemStyle}
            >
              <label style={calculatedLabelStyle}>Likelihood</label>
              <span style={calculatedValueStyle}>
                {formData.likelihoodAfterTreatment}
              </span>
            </div>
            <div
              className="residual-impact-calculated"
              style={calculatedItemStyle}
            >
              <label style={calculatedLabelStyle}>Impact</label>
              <span style={calculatedValueStyle}>
                {formData.impactAfterTreatment}
              </span>
            </div>
            <div
              className="residual-risk-score-calculated"
              style={calculatedItemStyle}
            >
              <label style={calculatedLabelStyle}>Risk Score</label>
              <span style={calculatedValueStyle}>{residualRiskScore}</span>
            </div>
            <div
              className="residual-risk-level-calculated"
              style={calculatedItemStyle}
            >
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidualRiskForm;
