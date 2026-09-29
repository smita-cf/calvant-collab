import React, { useEffect, useState } from "react";
import InputField from "../inputs/InputField";
import SelectField from "../inputs/SelectField";
import TextAreaField from "../inputs/TextAreaField";
import Select from "react-select";
import Joyride, { STATUS } from "react-joyride";

const RiskDetailsForm = ({
  formData,
  handleInputChange,
  generateRiskId,
  existingRiskIds = [],
  isEditing = false,
  originalRiskId = "",
  departments = [],
}) => {
  const [runTour, setRunTour] = useState(false);
  const steps = [
    {
      target: ".risk-id-field",
      content:
        "This is your Risk ID. You can auto-generate or enter a custom one.",
      placement: "bottom",
    },
    {
      target: ".department-field",
      content: "Select the department responsible for this risk.",
      placement: "bottom",
    },
    {
      target: ".type-select",
      content:
        "Choose a Risk Type.Operational are ....,Tactical are ..... or Strategic which are ....... .",
      placement: "bottom",
    },
    {
      target: ".asset-type-field",
      content: "Select the classification of the asset.",
      placement: "bottom",
    },
    {
      target: ".asset-field",
      content: "Enter the specific asset or location this risk pertains to.",
      placement: "bottom",
    },
    {
      target: ".threat-select",
      content:
        "Choose a threat. You can also enter a custom threat if not listed.",
      placement: "bottom",
    },
    {
      target: ".vulnerability-select",
      content: "Pick one or more vulnerabilities associated with this threat.",
      placement: "bottom",
    },
    {
      target: ".risk-description-field",
      content:
        "The risk description is auto-generated based on your threat and vulnerabilities.",
      placement: "top",
    },
    {
      target: ".likelihood-field",
      content: "Select the probability level of this risk occurring.",
      placement: "bottom",
    },
    {
      target: ".impact-score-field",
      content: "This shows the calculated Impact Score based on CIA values.",
      placement: "top",
    },
    {
      target: ".risk-score-field",
      content: "The Risk Score is calculated as Impact × Likelihood.",
      placement: "top",
    },
    {
      target: ".risk-level-field",
      content:
        "The Risk Level is derived from the Risk Score. Low for a score between 1-3, Medium for a score between 4-6 , High score greater than 6).",
      placement: "top",
    },
    {
      target: ".existing-controls-field",
      content: "Enter any controls that are already in place for this risk.",
      placement: "bottom",
    },
  ];

  // State for Threat & Vulnerabilities
  const [selectedThreat, setSelectedThreat] = useState("");
  const [isCustomThreat, setIsCustomThreat] = useState(false);
  const [customThreatInput, setCustomThreatInput] = useState("");
  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState([]);
  const [showCustomVulInput, setShowCustomVulInput] = useState(false);
  const [customVulnerability, setCustomVulnerability] = useState("");

  // Threat-Vulnerability Mapping
  const threatVulnerabilityMapping = {
    "Phishing Attack": {
      vulnerabilities: ["Weak Email Filters", "Lack of User Awareness"],
      description:
        "Employees may fall victim to phishing due to weak email filters or lack of awareness.",
    },
    "Malware Infection": {
      vulnerabilities: ["Outdated Antivirus", "Unpatched Software"],
      description:
        "Systems may be compromised if antivirus is outdated or patches are missing.",
    },
    "Insider Threat": {
      vulnerabilities: ["Weak Access Controls", "Excessive Privileges"],
      description:
        "Unauthorized actions from insiders due to poor access management.",
    },
  };

  // Collate All Unique Vulnerabilities
  const allVulnerabilities = [
    ...new Set(
      Object.values(threatVulnerabilityMapping).flatMap(
        (v) => v.vulnerabilities
      )
    ),
  ];

  // Threat Options - Always show all predefined + Others
  const threatOptions = [
    ...Object.keys(threatVulnerabilityMapping).map((t) => ({
      value: t,
      label: t,
    })),
    { value: "Others", label: "Others" },
  ];

  // Vulnerability Options Logic - UPDATED
  let vulOptionsArr = [];
  if (isCustomThreat) {
    // Custom threat: show ALL vulnerabilities + Others
    vulOptionsArr = [
      ...allVulnerabilities.map((v) => ({ value: v, label: v })),
      { value: "Others", label: "Others" },
    ];
  } else if (selectedThreat && threatVulnerabilityMapping[selectedThreat]) {
    // Standard threat: only those vulnerabilities for the threat + Others
    vulOptionsArr = [
      ...threatVulnerabilityMapping[selectedThreat].vulnerabilities.map(
        (v) => ({ value: v, label: v })
      ),
      { value: "Others", label: "Others" },
    ];
  } else {
    // Nothing selected yet
    vulOptionsArr = [{ value: "Others", label: "Others" }];
  }

  // Helper function to format list with proper English grammar
  const formatListWithAnd = (items) => {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return items.join(" and ");
    return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
  };

  // Threat Selection Handler
  const handleThreatChange = (option) => {
    if (!option) {
      setSelectedThreat("");
      setIsCustomThreat(false);
      setCustomThreatInput("");
      setSelectedVulnerabilities([]);
      setCustomVulnerability("");
      setShowCustomVulInput(false);
      handleInputChange({ target: { name: "threat", value: "" } });
      handleInputChange({ target: { name: "vulnerability", value: [] } });
      return;
    }

    if (option.value === "Others") {
      setIsCustomThreat(true);
      setSelectedThreat("");
      setCustomThreatInput("");
      setSelectedVulnerabilities([]);
      setCustomVulnerability("");
      setShowCustomVulInput(false);
      handleInputChange({ target: { name: "threat", value: "" } });
      handleInputChange({ target: { name: "vulnerability", value: [] } });
    } else {
      setIsCustomThreat(false);
      setSelectedThreat(option.value);
      setCustomThreatInput("");
      setSelectedVulnerabilities([]);
      setCustomVulnerability("");
      setShowCustomVulInput(false);
      handleInputChange({ target: { name: "threat", value: option.value } });
      handleInputChange({ target: { name: "vulnerability", value: [] } });
    }
  };

  // Vulnerability Selection Handler
  const handleVulnerabilityChange = (options) => {
    const vulArr = options ? options.map((o) => o.value) : [];

    // Separate Others from regular vulnerabilities
    const hasOthers = vulArr.includes("Others");
    const regularVulnerabilities = vulArr.filter((v) => v !== "Others");

    setSelectedVulnerabilities(regularVulnerabilities);
    setShowCustomVulInput(hasOthers);

    // Save selected (excluding Others)
    handleInputChange({
      target: {
        name: "vulnerability",
        value: regularVulnerabilities,
      },
    });

    if (!hasOthers) {
      setCustomVulnerability("");
    }
  };

  // Custom Threat Input Handler
  const handleCustomThreat = (e) => {
    const val = e.target.value;
    setCustomThreatInput(val);
    handleInputChange({ target: { name: "threat", value: val } });
  };

  // Custom Vulnerability Input Handler
  const handleCustomVulnerability = (e) => {
    const val = e.target.value;
    setCustomVulnerability(val);

    // Parse comma-separated values
    const customVulArray = val
      .split(",")
      .map((s) => s.trim())
      .filter((v) => v);

    // Combine selected vulnerabilities with custom ones
    const finalVulArray = [...selectedVulnerabilities, ...customVulArray];

    handleInputChange({
      target: {
        name: "vulnerability",
        value: finalVulArray,
      },
    });
  };
  useEffect(() => {
    if (isEditing && formData.threat) {
      // --- Sync Threat ---
      const isStandardThreat = Object.keys(threatVulnerabilityMapping).includes(
        formData.threat
      );

      if (isStandardThreat) {
        setSelectedThreat(formData.threat);
        setIsCustomThreat(false);
        setCustomThreatInput("");
      } else {
        setIsCustomThreat(true);
        setSelectedThreat("");
        setCustomThreatInput(formData.threat);
      }

      // --- Sync Vulnerabilities ---
      // Ensure we handle both string (from DB) and array (from local state)
      const rawVuls = Array.isArray(formData.vulnerability)
        ? formData.vulnerability
        : formData.vulnerability
        ? formData.vulnerability.split(",").map((s) => s.trim())
        : [];

      if (rawVuls.length > 0) {
        const standardItems = rawVuls.filter((v) =>
          allVulnerabilities.includes(v)
        );
        const customItems = rawVuls.filter(
          (v) => !allVulnerabilities.includes(v)
        );

        setSelectedVulnerabilities(standardItems);

        if (customItems.length > 0) {
          setShowCustomVulInput(true);
          setCustomVulnerability(customItems.join(", "));
        } else {
          setShowCustomVulInput(false);
          setCustomVulnerability("");
        }
      }
    }
  }, [isEditing, formData.threat]); // Added formData.threat to dependency to ensure it fires when data arrives
  // Auto-fill Risk Description - UPDATED with better formatting
  useEffect(() => {
    // Determine actual threat string
    let threatValue = isCustomThreat ? customThreatInput : selectedThreat;

    // Create the combined vulnerability array
    let vulArray = [...selectedVulnerabilities];
    if (showCustomVulInput && customVulnerability) {
      const customParts = customVulnerability
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);
      vulArray = [...vulArray, ...customParts];
    }

    // ONLY update if we actually have a selection (prevents wiping data on mount)
    if (threatValue || vulArray.length > 0) {
      const vulnerabilitiesFormatted = formatListWithAnd(vulArray);
      const desc = `Risk of loss of information due to ${threatValue}${
        vulnerabilitiesFormatted
          ? " because of " + vulnerabilitiesFormatted
          : ""
      }`;

      // Update parent formData
      handleInputChange({ target: { name: "riskDescription", value: desc } });
      handleInputChange({ target: { name: "threat", value: threatValue } });
      handleInputChange({ target: { name: "vulnerability", value: vulArray } });
    }
  }, [
    selectedThreat,
    customThreatInput,
    selectedVulnerabilities,
    customVulnerability,
    showCustomVulInput,
    isCustomThreat,
  ]);

  // ============ ORIGINAL HOOKS ============
  useEffect(() => {
    // always reset to top when component loads
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!formData.riskId && !isEditing) {
      generateRiskId();
    }
  }, [formData.riskId, isEditing, generateRiskId]);

  useEffect(() => {
    if (!formData.riskType) {
      handleInputChange({ target: { name: "riskType", value: "Operational" } });
    }
  }, [formData.riskType, handleInputChange]);

  useEffect(() => {
    if (!formData.date) {
      const today = new Date().toISOString().split("T")[0];
      handleInputChange({ target: { name: "date", value: today } });
    }
  }, [formData.date, handleInputChange]);

  // ============ OPTION ARRAYS ============
  const riskTypeOptions = [
    { value: "Operational", label: "Operational" },
    { value: "Tactical", label: "Tactical" },
    { value: "Strategic", label: "Strategic" },
  ];

  const assetTypeOptions = [
    { value: "Public", label: "Public" },
    { value: "Private", label: "Private" },
    { value: "Sensitive", label: "Sensitive" },
    { value: "Confidential", label: "Confidential" },
  ];

  const ciaOptions = [
    { value: 1, label: "1 - Low" },
    { value: 2, label: "2 - Medium" },
    { value: 3, label: "3 - High" },
  ];

  const likelihoodOptions = [
    { value: 1, label: "1 - Unlikely" },
    { value: 2, label: "2 - Possible" },
    { value: 3, label: "3 - Likely" },
    { value: 4, label: "4 - Almost Certain" },
  ];

  // ============ ASSET CIA AUTO-POPULATE ============
  const assetCIAValues = {
    Public: { confidentiality: 1, integrity: 1, availability: 1 },
    Private: { confidentiality: 2, integrity: 2, availability: 2 },
    Sensitive: { confidentiality: 3, integrity: 3, availability: 2 },
    Confidential: { confidentiality: 3, integrity: 3, availability: 3 },
  };

  useEffect(() => {
    if (formData.assetType && assetCIAValues[formData.assetType]) {
      const { confidentiality, integrity, availability } =
        assetCIAValues[formData.assetType];
      handleInputChange({
        target: { name: "confidentiality", value: confidentiality },
      });
      handleInputChange({ target: { name: "integrity", value: integrity } });
      handleInputChange({
        target: { name: "availability", value: availability },
      });
    }
  }, [formData.assetType]);

  // ============ CALCULATIONS ============
  const calculateImpact = () => {
    const c = parseInt(formData.confidentiality) || 0;
    const i = parseInt(formData.integrity) || 0;
    const a = parseInt(formData.availability) || 0;
    formData.impact = Math.max(c, i, a);
    return Math.max(c, i, a);
  };

  const calculateRiskLevel = (score) => {
    if (score <= 3) return "Low";
    if (score <= 8) return "Medium";
    if (score <= 12) return "High";
    return "Critical";
  };

  // Auto-calculate Risk Score & Risk Level
  useEffect(() => {
    const impact = calculateImpact();
    const probability = parseInt(formData.probability) || 0;
    const riskScore = impact * probability;
    const riskLevel = calculateRiskLevel(riskScore);
    handleInputChange({ target: { name: "riskScore", value: riskScore } });
    handleInputChange({ target: { name: "riskLevel", value: riskLevel } });
  }, [
    formData.confidentiality,
    formData.integrity,
    formData.availability,
    formData.probability,
  ]);

  // ============ DUPLICATE CHECK ============
  const isDuplicateRiskId = () => {
    if (isEditing && formData.riskId === originalRiskId) {
      return false;
    }
    return existingRiskIds.includes(formData.riskId);
  };

  // ============ STYLES ============
  const formStyle = {
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
    maxWidth: "800px",
    margin: "0 auto",
    border: "1px solid #e9ecef",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "2px solid #3498db",
  };

  const titleStyle = {
    color: "#2c3e50",
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "4px",
  };

  const subtitleStyle = {
    color: "#7f8c8d",
    fontSize: "13px",
    fontWeight: "400",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  };

  const riskIdSectionStyle = {
    background: "rgba(52, 152, 219, 0.03)",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid rgba(52, 152, 219, 0.1)",
    marginBottom: "20px",
  };

  const sectionStyle = {
    background: "rgba(52, 152, 219, 0.03)",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid rgba(52, 152, 219, 0.1)",
    marginBottom: "15px",
  };

  const sectionTitleStyle = {
    color: "#2c3e50",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "10px",
  };

  const calculatedFieldsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    background: "#f4f6f7",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "15px",
  };

  const calculatedItemStyle = {
    textAlign: "center",
    background: "white",
    padding: "12px",
    borderRadius: "6px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  };

  const calculatedLabelStyle = {
    display: "block",
    fontWeight: "500",
    color: "#34495e",
    marginBottom: "6px",
    fontSize: "12px",
    textTransform: "uppercase",
  };

  const calculatedValueStyle = {
    fontSize: "18px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "6px",
    background: "#ffffff",
    color: "#2c3e50",
    border: "1px solid #ecf0f1",
  };

  const fullWidthStyle = {
    gridColumn: "1 / -1",
  };

  const duplicateWarningStyle = {
    color: "#e74c3c",
    fontSize: "12px",
    marginTop: "5px",
    fontWeight: "600",
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

  const riskIdHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  };

  const selectLabelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
    color: "#2c3e50",
    fontSize: "14px",
  };

  const selectControlStyle = {
    control: (base) => ({
      ...base,
      borderRadius: "6px",
      borderColor: "#d1d5db",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3498db",
      },
    }),
  };

  // Responsive CSS
  const responsiveStyle = `
    @media (max-width: 768px) {
      .risk-form {
        padding: 25px 20px !important;
        margin: 0 10px !important;
      }
      .risk-grid {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
      }
      .cia-grid {
        grid-template-columns: 1fr !important;
      }
      .calculated-fields {
        grid-template-columns: 1fr !important;
      }
      .form-title {
        font-size: 24px !important;
      }
      .risk-id-header {
        flex-direction: column !important;
        gap: 15px !important;
        align-items: flex-start !important;
      }
    }
    @media (max-width: 480px) {
      .risk-form {
        padding: 20px 15px !important;
      }
      .form-title {
        font-size: 20px !important;
      }
    }
  `;

  // ============ RENDER ============
  return (
    <>
      <style>{responsiveStyle}</style>
      <div style={formStyle} className="risk-form">
        <Joyride
          steps={steps}
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
        <button
          style={{ ...autoGenButtonStyle, marginTop: "10px" }}
          onClick={() => setRunTour(true)}
        >
          Tutorial
        </button>

        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle} className="form-title">
            Risk Assessment
          </h2>
          <p style={subtitleStyle}>Identify and Assess Risks</p>
        </div>

        {/* Risk ID Section */}
        <div style={riskIdSectionStyle}>
          <div style={riskIdHeaderStyle} className="risk-id-header">
            <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}>
              Risk Identification
            </h3>
            {!isEditing && (
              <button
                style={autoGenButtonStyle}
                onClick={generateRiskId}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#2980b9")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#3498db")
                }
              >
                Generate New ID
              </button>
            )}
          </div>

          <div style={gridStyle} className="risk-grid">
            <div>
              <InputField
                label="Risk ID"
                name="riskId"
                value={formData.riskId || ""}
                onChange={handleInputChange}
                placeholder="Auto-generated or enter custom ID"
                required
                readOnly={isEditing}
                className="risk-id-field"
              />
              {isDuplicateRiskId() && (
                <div style={duplicateWarningStyle}>
                  ⚠️ This Risk ID already exists. Please use a different ID.
                </div>
              )}
            </div>

            <SelectField
              label="Department"
              name="department"
              value={formData.department || ""}
              onChange={handleInputChange}
              options={departments.map((dept) => ({
                value: dept.name,
                label: dept.name,
              }))}
              placeholder="Select Department"
              required
              className="department-field"
            />

            <InputField
              label="Date"
              name="date"
              type="date"
              value={formData.date || ""}
              onChange={handleInputChange}
              required
              readOnly
            />

            <SelectField
              label="Risk Type"
              name="riskType"
              value={formData.riskType || ""}
              onChange={handleInputChange}
              options={riskTypeOptions}
              placeholder="Select the type of risk"
              required
              className="type-select"
            />

            <SelectField
              label="Asset Type"
              name="assetType"
              value={formData.assetType || ""}
              onChange={handleInputChange}
              options={assetTypeOptions}
              placeholder="Select asset classification"
              required
              className="asset-type-field"
            />

            <InputField
              label="Asset"
              name="location"
              value={formData.location || ""}
              onChange={handleInputChange}
              placeholder="Enter the asset"
              className="asset-field"
            />
          </div>
        </div>

        {/* Threat & Vulnerabilities Section */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Threat & Vulnerabilities</h3>
          <div style={gridStyle} className="risk-grid">
            {/* Threat Dropdown */}
            <div>
              <label style={selectLabelStyle}>Threat</label>
              <Select
                value={
                  isCustomThreat
                    ? { value: "Others", label: "Others" }
                    : selectedThreat
                    ? { value: selectedThreat, label: selectedThreat }
                    : null
                }
                onChange={handleThreatChange}
                options={threatOptions}
                placeholder="Select Threat"
                isClearable
                styles={selectControlStyle}
                className="threat-select"
              />
            </div>

            {/* Custom Threat Input */}
            {isCustomThreat && (
              <InputField
                label="Threat (Custom)"
                name="threat"
                value={customThreatInput}
                onChange={handleCustomThreat}
                placeholder="Enter custom threat"
                required
              />
            )}

            {/* Vulnerabilities Dropdown */}
            <div>
              <label style={selectLabelStyle}>Vulnerabilities</label>
              <Select
                isMulti
                value={[
                  ...selectedVulnerabilities.map((v) => ({
                    value: v,
                    label: v,
                  })),
                  ...(showCustomVulInput
                    ? [{ value: "Others", label: "Others" }]
                    : []),
                ]}
                onChange={handleVulnerabilityChange}
                options={vulOptionsArr}
                placeholder="Select Vulnerabilities"
                isClearable
                styles={selectControlStyle}
                className="vulnerability-select"
              />
            </div>

            {/* Custom Vulnerability Input */}
            {showCustomVulInput && (
              <InputField
                label="Vulnerabilities (Custom, comma-separated)"
                name="customVulnerability"
                value={customVulnerability}
                onChange={handleCustomVulnerability}
                placeholder="Enter custom vulnerabilities separated by commas"
              />
            )}
          </div>
        </div>

        {/* Risk Description */}
        <div style={fullWidthStyle}>
          <TextAreaField
            label="Risk Description"
            name="riskDescription"
            value={formData.riskDescription || ""}
            onChange={handleInputChange}
            placeholder="This will be auto-filled when Threat & Vulnerabilities are selected"
            rows={4}
            required
            className="risk-description-field"
          />
        </div>

        {/* Likelihood */}
        <SelectField
          label="Likelihood"
          name="probability"
          value={formData.probability || ""}
          onChange={handleInputChange}
          options={likelihoodOptions}
          placeholder="Select probability level"
          required
          className="likelihood-field"
        />

        {/* Calculated Fields */}
        <div style={calculatedFieldsStyle} className="calculated-fields">
          <div style={calculatedItemStyle} className="impact-score-field">
            <label style={calculatedLabelStyle}>Impact Score</label>
            <span style={calculatedValueStyle}>{calculateImpact() || 0}</span>
          </div>

          <div style={calculatedItemStyle}>
            <label style={calculatedLabelStyle}>Likelihood Score</label>
            <span style={calculatedValueStyle}>
              {formData.probability || 0}
            </span>
          </div>

          <div style={calculatedItemStyle} className="risk-score-field">
            <label style={calculatedLabelStyle}>Risk Score</label>
            <span style={calculatedValueStyle}>{formData.riskScore || 0}</span>
          </div>

          <div style={calculatedItemStyle} className="risk-level-field">
            <label style={calculatedLabelStyle}>Risk Level</label>
            <span
              style={{
                ...calculatedValueStyle,
                backgroundColor:
                  formData.riskLevel === "Low"
                    ? "#d5f4e6"
                    : formData.riskLevel === "Medium"
                    ? "#fef9e7"
                    : formData.riskLevel === "High"
                    ? "#fdf2e9"
                    : "#fadbd8",
                color:
                  formData.riskLevel === "Low"
                    ? "#27ae60"
                    : formData.riskLevel === "Medium"
                    ? "#f39c12"
                    : formData.riskLevel === "High"
                    ? "#e67e22"
                    : "#e74c3c",
                border: `2px solid ${
                  formData.riskLevel === "Low"
                    ? "#27ae60"
                    : formData.riskLevel === "Medium"
                    ? "#f39c12"
                    : formData.riskLevel === "High"
                    ? "#e67e22"
                    : "#e74c3c"
                }`,
              }}
            >
              {formData.riskLevel || "Not Identified"}
            </span>
          </div>
        </div>

        {/* Existing Controls */}
        <div style={fullWidthStyle}>
          <TextAreaField
            label="Existing Controls"
            name="existingcontrols"
            value={formData.existingcontrols || ""}
            onChange={handleInputChange}
            placeholder="Controls which are already implemented..."
            rows={3}
            className="existing-controls-field"
          />
        </div>

        {/* CIA Section
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>🔐 Confidentiality, Integrity & Availability</h3>
          <div style={gridStyle} className="cia-grid">
            <SelectField
              label="Confidentiality"
              name="confidentiality"
              value={formData.confidentiality || ""}
              onChange={handleInputChange}
              options={ciaOptions}
              placeholder="Select Confidentiality Level"
              required
            />

            <SelectField
              label="Integrity"
              name="integrity"
              value={formData.integrity || ""}
              onChange={handleInputChange}
              options={ciaOptions}
              placeholder="Select Integrity Level"
              required
            />

            <SelectField
              label="Availability"
              name="availability"
              value={formData.availability || ""}
              onChange={handleInputChange}
              options={ciaOptions}
              placeholder="Select Availability Level"
              required
            />
          </div>
        </div> */}
      </div>
    </>
  );
};

export default RiskDetailsForm;
