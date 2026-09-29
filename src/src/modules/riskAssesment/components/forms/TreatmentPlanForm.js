import React, { useEffect } from "react";
import TextAreaField from "../inputs/TextAreaField";
import { CONTROL_MAPPING } from "../../constants";
import Select from "react-select";

const controlOptions = Object.keys(CONTROL_MAPPING).map((key) => ({
  value: key,
  label: `${key} - ${CONTROL_MAPPING[key].split("\n")[0]}`,
}));

const TreatmentPlanForm = ({ formData, handleInputChange }) => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Determine action plan by risk level
  const getActionPlan = (riskLevel) => {
    switch (riskLevel) {
      case "Low":
        return "Accept";
      case "Medium":
      case "High":
        return "Mitigate";
      default:
        return "Not defined yet";
    }
  };

  const action = getActionPlan(formData.riskLevel);

  // Determine status, removed autoset logic to allow manual control
  const statusValue = formData.status || "Active";

  // Styles
  const formStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    maxWidth: "700px",
    margin: "0 auto",
    border: "1px solid #e9ecef",
  };

  const summaryCardStyle = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    background: "#f39c12",
    color: "white",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
  };

  const summaryItemStyle = {
    flex: 1,
    minWidth: "100px",
    display: "flex",
    flexDirection: "column",
  };

  const summaryLabelStyle = {
    fontSize: "11px",
    opacity: 0.8,
    fontWeight: 500,
    textTransform: "uppercase",
  };

  const summaryValueStyle = {
    fontSize: "16px",
    fontWeight: 700,
  };

  const calculatedItemStyle = {
    flex: 1,
    minWidth: "150px",
    textAlign: "center",
    background: "#fff",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  };

  const calculatedLabelStyle = {
    fontSize: "11px",
    fontWeight: 500,
    marginBottom: "4px",
    color: "#34495e",
    textTransform: "uppercase",
  };

  const calculatedValueStyle = {
    fontSize: "16px",
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: "6px",
    background: "#ffffff",
    color: "#2c3e50",
    border: "1px solid #ecf0f1",
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
          <span style={summaryValueStyle}>{formData.department || "Not Set"}</span>
        </div>
        <div style={summaryItemStyle}>
          <span style={summaryLabelStyle}>Risk Type</span>
          <span style={summaryValueStyle}>{formData.riskType || "Not Set"}</span>
        </div>
      </div>

      {/* Page Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "25px",
          paddingBottom: "12px",
          borderBottom: "2px solid #e67e22",
        }}
      >
        <h2
          style={{
            color: "#2c3e50",
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "6px",
          }}
        >
          🛡️ Treatment Plan
        </h2>
        <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
          Define controls and mitigation plan for the identified risk
        </p>
      </div>

      {/* Action & Status Side by Side */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "15px",
        }}
      >
        <div
          style={{
            ...calculatedItemStyle,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "80px", // ensures both cards have same height
          }}
        >
          <label style={calculatedLabelStyle}>Action</label>
          <span style={calculatedValueStyle}>{action}</span>
        </div>
        <div
          style={{
            ...calculatedItemStyle,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "80px",
          }}
        >
          <label style={calculatedLabelStyle}>Status</label>
          <div style={{ width: "120px" }}>
            <Select
              name="status"
              options={[
                { value: "Active", label: "Active" },
                { value: "Closed", label: "Closed" },
              ]}
              value={{ value: statusValue, label: statusValue }}
              onChange={(selected) =>
                handleInputChange({
                  target: { name: "status", value: selected.value },
                })
              }
              isDisabled={false} // always enabled for manual selection
            />
          </div>
        </div>
      </div>

      {/* Control Implementation Section */}
      <div
        style={{
          background: "rgba(230,126,34,0.03)",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid rgba(230,126,34,0.1)",
          marginBottom: "15px",
        }}
      >
        <h3
          style={{
            color: "#2c3e50",
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "10px",
          }}
        >
          🔧 Control Implementation
        </h3>
        <p style={{ color: "#7f8c8d", fontSize: "12px", marginBottom: "15px" }}>
          Specify the control measures and additional safeguards to mitigate the
          identified risk
        </p>

        <div
          style={{
            background: "#f8f9fa",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
            border: "1px solid #e9ecef",
          }}
        >
          <h4 style={{ marginBottom: "6px" }}>Risk Description</h4>
          <p style={{ fontSize: "13px" }}>
            {formData.riskDescription || "No description available"}
          </p>
        </div>

        <TextAreaField
          label="New/Proposed Controls"
          name="additionalControls"
          value={formData.additionalControls || ""}
          onChange={handleInputChange}
          placeholder="Describe additional control measures..."
          rows={2}
        />

        <p style={{ marginTop: "12px", marginBottom: "6px", fontWeight: 500 }}>
          Applicable Control(s)
        </p>
        <Select
          placeholder="Choose applicable controls"
          isMulti
          name="controlReference"
          options={controlOptions}
          value={(formData.controlReference || []).map((c) => ({
            value: c,
            label: c,
          }))}
          onChange={(selected) =>
            handleInputChange({
              target: {
                name: "controlReference",
                value: selected ? selected.map((s) => s.value) : [],
              },
            })
          }
        />
      </div>
    </div>
  );
};

export default TreatmentPlanForm;
