import React, { useEffect, useState } from "react";
import TextAreaField from "../inputs/TextAreaField";
import { CONTROL_MAPPING } from "../../constants";
import Select from "react-select";
import Joyride, { STATUS } from "react-joyride";

const controlOptions = Object.keys(CONTROL_MAPPING).map((key) => ({
  value: key,
  label: `${key} - ${CONTROL_MAPPING[key].split("\n")[0]}`,
}));

const TreatmentPlanForm = ({ formData, handleInputChange }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [runTour, setRunTour] = useState(false);
  const treatmentPlanTourSteps = [
    {
      target: ".risk-id-summary",
      content: "This shows the Risk ID for the selected risk.",
      placement: "bottom",
    },
    {
      target: ".department-summary",
      content:
        "The department responsible for managing this risk is displayed here.",
      placement: "bottom",
    },
    {
      target: ".risk-type-summary",
      content: "This shows the type of risk identified in the assessment.",
      placement: "bottom",
    },
    {
      target: ".action-field",
      content:
        "This indicates the recommended action based on the residual risk level.",
      placement: "bottom",
    },
    {
      target: ".status-field",
      content: "Here you can update the current status of the treatment plan.",
      placement: "bottom",
    },
    {
      target: ".control-implementation-section",
      content:
        "This section allows you to define control measures and mitigation actions for the risk.",
      placement: "top",
    },
    {
      target: ".risk-description-field",
      content:
        "This displays the risk description generated from the risk assessment.",
      placement: "top",
    },
    {
      target: ".additional-controls-field",
      content:
        "Enter any new or proposed controls that should be implemented to mitigate the risk.",
      placement: "top",
    },
    {
      target: ".control-reference-field",
      content:
        "Select applicable controls from the standard control framework for reference.",
      placement: "top",
    },
  ];

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
  const statusValue = formData.status || "Open";

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
        steps={treatmentPlanTourSteps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
        callback={(data) => {
          const { status } = data;
          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRunTour(false);
          }
        }}
      />
      {/* Summary Header Card */}
      <div className="treatment-summary-card" style={summaryCardStyle}>
        <div className="risk-id-summary" style={summaryItemStyle}>
          <span style={summaryLabelStyle}>Risk ID</span>
          <span style={summaryValueStyle}>{formData.riskId || "Not Set"}</span>
        </div>
        <div className="department-summary" style={summaryItemStyle}>
          <span style={summaryLabelStyle}>Department</span>
          <span style={summaryValueStyle}>
            {formData.department || "Not Set"}
          </span>
        </div>
        <div className="risk-type-summary" style={summaryItemStyle}>
          <span style={summaryLabelStyle}>Risk Type</span>
          <span style={summaryValueStyle}>
            {formData.riskType || "Not Set"}
          </span>
        </div>
      </div>

      {/* Page Header */}

      <div
        className="treatment-page-header"
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
          Treatment Plan
        </h2>
        <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
          Define controls and mitigation plan for the identified risk
        </p>
        <button
          style={{ ...autoGenButtonStyle, marginTop: "10px" }}
          onClick={() => setRunTour(true)}
        >
          Tutorial
        </button>
      </div>

      {/* Action & Status */}
      <div
        className="action-status-section"
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "15px",
        }}
      >
        <div
          className="action-field"
          style={{
            ...calculatedItemStyle,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "80px",
          }}
        >
          <label style={calculatedLabelStyle}>Action</label>
          <span style={calculatedValueStyle}>{action}</span>
        </div>
        <div
          className="status-field"
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
                { value: "Open", label: "Open" },
                { value: "WIP", label: "WIP" },
                { value: "Closed", label: "Closed" },
              ]}
              value={{ value: statusValue, label: statusValue }}
              onChange={(selected) =>
                handleInputChange({
                  target: { name: "status", value: selected.value },
                })
              }
              isDisabled={false}
            />
          </div>
        </div>
      </div>

      {/* Control Implementation Section */}
      <div
        className="control-implementation-section"
        style={{
          background: "rgba(230,126,34,0.03)",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid rgba(230,126,34,0.1)",
          marginBottom: "15px",
        }}
      >
        <h3
          className="control-section-header"
          style={{
            color: "#2c3e50",
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "10px",
          }}
        >
          Control Implementation
        </h3>
        <p style={{ color: "#7f8c8d", fontSize: "12px", marginBottom: "15px" }}>
          Specify the control measures and additional safeguards to mitigate the
          identified risk
        </p>

        <div
          className="risk-description-field"
          style={{
            background: "#f8f9fa",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
            border: "1px solid #e9ecef",
          }}
        >
          <h4 style={{ marginBottom: "6px",  fontWeight: "bold", color: "#495057"  }}>Risk Description</h4>
          <p style={{ fontSize: "13px", color: "#495057",
    fontWeight: 500,}}>
            {formData.riskDescription || "No description available"}
          </p>
        </div>

        <TextAreaField
          className="additional-controls-field"
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
          className="control-reference-field"
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
