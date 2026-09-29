import React,{useEffect} from "react";
import TextAreaField from "../inputs/TextAreaField";
import TaskManagement from "../../pages/TaskManagement";
const TreatmentPlanForm = ({ formData, handleInputChange }) => {
  useEffect(() => {
    // always reset to top when component loads
    window.scrollTo(0, 0);
  }, []);

  const summaryCardStyle = {
    background: "linear-gradient(135deg, #e67e22 0%, #d35400 100%)",
    color: "white",
    padding: "20px 30px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 8px 25px rgba(230, 126, 34, 0.3)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  };

  const summaryItemStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  };

  const summaryLabelStyle = {
    fontSize: "12px",
    opacity: "0.9",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const summaryValueStyle = {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  };

  const formStyle = {
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    maxWidth: "900px",
    margin: "0 auto",
    border: "1px solid #e9ecef",
  };

  return (
    <div style={formStyle}>
      {/* Summary Header Card */}
      <div style={summaryCardStyle}>
        <div style={summaryItemStyle}>
          <span style={summaryLabelStyle}>Risk ID</span>
          <span style={summaryValueStyle}>{formData.riskId || "Not Set"}</span>
        </div>
        <div style={summaryItemStyle}>
          <span style={summaryLabelStyle}>Department</span>
          <span style={summaryValueStyle}>
            {formData.department || "Not Set"}
          </span>
        </div>
        <div style={summaryItemStyle}>
          <span style={summaryLabelStyle}>Risk Type</span>
          <span style={summaryValueStyle}>
            {formData.riskType || "Not Set"}
          </span>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          marginBottom: "35px",
          paddingBottom: "20px",
          borderBottom: "3px solid #e67e22",
        }}
      >
        <h2
          style={{
            color: "#2c3e50",
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "8px",
          }}
        >
          🛡️ Treatment Plan & Task Assignment
        </h2>
        <p style={{ color: "#7f8c8d", fontSize: "16px" }}>
          Define controls and mitigation strategies for the identified risk
        </p>
      </div>

      <div
        style={{
          background: "rgba(230, 126, 34, 0.05)",
          padding: "25px",
          borderRadius: "12px",
          border: "1px solid rgba(230, 126, 34, 0.1)",
          marginBottom: "25px",
        }}
      >
        <h3
          style={{
            color: "#2c3e50",
            fontSize: "20px",
            fontWeight: "600",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          🔧 Control Implementation
        </h3>
        <p style={{ color: "#7f8c8d", marginBottom: "25px", fontSize: "14px" }}>
          Specify the control measures and additional safeguards to mitigate the
          identified risk
        </p>

        <TextAreaField
          label="Control Reference"
          name="controlReference"
          value={formData.controlReference || ""}
          onChange={handleInputChange}
          placeholder="Enter the reference ID, standard, or framework control (e.g., ISO 27001:2013 A.9.1.1, NIST CSF ID.AM-1, CIS Control 1.1, etc.)"
          rows={3}
          required
        />

        <TextAreaField
          label="Additional Controls"
          name="additionalControls"
          value={formData.additionalControls || ""}
          onChange={handleInputChange}
          placeholder="Describe any additional control measures, compensating controls, or specific implementation details needed to address this risk effectively..."
          rows={4}
          required
        />
        <TaskManagement riskId={formData.riskId}/>
      </div>
    </div>
  );
};

export default TreatmentPlanForm;
