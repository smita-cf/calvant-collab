// import React, { useEffect, useState } from "react";
// import InputField from "../inputs/InputField";
// import SelectField from "../inputs/SelectField";
// import TextAreaField from "../inputs/TextAreaField";

// const RiskDetailsForm = ({
//   formData,
//   handleInputChange,
//   generateRiskId,
//   existingRiskIds = [],
//   isEditing = false,
//   originalRiskId = "",
// }) => {
//   useEffect(() => {
//     // always reset to top when component loads
//     window.scrollTo(0, 0);
//   }, []);
//   useEffect(() => {
//     if (!formData.riskId && !isEditing) {
//       generateRiskId();
//     }
//   }, [formData.riskId, isEditing, generateRiskId]);
//   useEffect(() => {
//     if (!formData.riskType) {
//       handleInputChange({ target: { name: "riskType", value: "Operational" } });
//     }
//   }, [formData.riskType, handleInputChange]);

//   useEffect(() => {
//     if (!formData.date) {
//       const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD
//       handleInputChange({ target: { name: "date", value: today } });
//     }
//   }, [formData.date, handleInputChange]);
//   const riskTypeOptions = [
//     { value: "Operational", label: "Operational" },
//     { value: "Tactical", label: "Tactical" },
//     { value: "Strategic", label: "Strategic" },
//   ];

//   const assetTypeOptions = [
//     { value: "Public", label: "Public" },
//     { value: "Private", label: "Private" },
//     { value: "Sensitive", label: "Sensitive" },
//     { value: "Confidential", label: "Confidential" },
//   ];

//   // Example threat-vulnerability mapping
//   const threatVulnerabilityMapping = {
//     "Phishing Attack": {
//       vulnerabilities: ["Weak Email Filters", "Lack of User Awareness"],
//       description:
//         "Employees may fall victim to phishing due to weak email filters or lack of awareness.",
//     },
//     "Malware Infection": {
//       vulnerabilities: ["Outdated Antivirus", "Unpatched Software"],
//       description:
//         "Systems may be compromised if antivirus is outdated or patches are missing.",
//     },
//     "Insider Threat": {
//       vulnerabilities: ["Weak Access Controls", "Excessive Privileges"],
//       description:
//         "Unauthorized actions from insiders due to poor access management.",
//     },
//   };

//   const [selectedThreat, setSelectedThreat] = useState("");
//   const [selectedVulnerabilities, setSelectedVulnerabilities] = useState([]);

//   useEffect(() => {
//     if (selectedThreat && selectedVulnerabilities.length > 0) {
//       const newDescription = `Risk of loss of information due to ${selectedThreat} because of ${selectedVulnerabilities.join(
//         ", "
//       )}`;

//       handleInputChange({
//         target: { name: "riskDescription", value: newDescription },
//       });
//     }
//   }, [selectedThreat, selectedVulnerabilities]);

//   //auto populate
//   const assetCIAValues = {
//     Public: { confidentiality: 1, integrity: 1, availability: 1 },
//     Private: { confidentiality: 2, integrity: 2, availability: 2 },
//     Sensitive: { confidentiality: 3, integrity: 3, availability: 2 },
//     Confidential: { confidentiality: 3, integrity: 3, availability: 3 },
//   };

//   const ciaOptions = [
//     { value: 1, label: "1 - Low" },
//     { value: 2, label: "2 - Medium" },
//     { value: 3, label: "3 - High" },
//   ];
//   const liklihoodOptions = [
//     { value: 1, label: "1 - Unlikely" },
//     { value: 2, label: "2 - Mostly" },
//     { value: 3, label: "3 - Possible" },
//     { value: 4, label: "4 - Almost Likely" },
//   ];

//   const calculateImpact = () => {
//     return Math.max(
//       parseInt(formData.confidentiality) || 0,
//       parseInt(formData.integrity) || 0,
//       parseInt(formData.availability) || 0
//     );
//   };

//   const calculateAsset = () => {
//     return (
//       parseInt(formData.confidentiality) +
//       parseInt(formData.integrity) +
//       parseInt(formData.availability)
//     );
//   };
//   useEffect(() => {
//     if (formData.assetType && assetCIAValues[formData.assetType]) {
//       const { confidentiality, integrity, availability } =
//         assetCIAValues[formData.assetType];
//       handleInputChange({
//         target: { name: "confidentiality", value: confidentiality },
//       });
//       handleInputChange({ target: { name: "integrity", value: integrity } });
//       handleInputChange({
//         target: { name: "availability", value: availability },
//       });
//     }
//   }, [formData.assetType]);

//   const calculateRiskLevel = () => {
//     const impact = calculateImpact();
//     const probability = parseInt(formData.probability) || 0;
//     const riskScore = impact * probability;

//     if (riskScore <= 3)
//       return { level: "Low", color: "#27ae60", bgColor: "#d5f4e6", riskScore };
//     if (riskScore <= 8)
//       return {
//         level: "Medium",
//         color: "#f39c12",
//         bgColor: "#fef9e7",
//         riskScore,
//       };
//     if (riskScore <= 12)
//       return { level: "High", color: "#e67e22", bgColor: "#fdf2e9", riskScore };
//     return {
//       level: "Critical",
//       color: "#e74c3c",
//       bgColor: "#fadbd8",
//       riskScore,
//     };
//   };

//   const isDuplicateRiskId = () => {
//     if (isEditing && formData.riskId === originalRiskId) {
//       return false; // Not a duplicate if it's the same risk being edited
//     }
//     return existingRiskIds.includes(formData.riskId);
//   };

//   const formStyle = {
//     background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
//     padding: "40px",
//     borderRadius: "16px",
//     boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
//     maxWidth: "900px",
//     margin: "0 auto",
//     border: "1px solid #e9ecef",
//   };

//   const headerStyle = {
//     textAlign: "center",
//     marginBottom: "35px",
//     paddingBottom: "20px",
//     borderBottom: "3px solid #3498db",
//     position: "relative",
//   };

//   const titleStyle = {
//     color: "#2c3e50",
//     fontSize: "28px",
//     fontWeight: "700",
//     marginBottom: "8px",
//     letterSpacing: "0.5px",
//   };

//   const subtitleStyle = {
//     color: "#7f8c8d",
//     fontSize: "16px",
//     fontWeight: "400",
//   };

//   const gridStyle = {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
//     gap: "25px",
//     marginBottom: "30px",
//   };

//   const fullWidthStyle = {
//     gridColumn: "1 / -1",
//   };

//   const riskIdSectionStyle = {
//     background: "rgba(52, 152, 219, 0.05)",
//     padding: "25px",
//     borderRadius: "12px",
//     border: "1px solid rgba(52, 152, 219, 0.1)",
//     marginBottom: "30px",
//   };

//   const riskIdHeaderStyle = {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "20px",
//   };

//   const autoGenButtonStyle = {
//     background: "#3498db",
//     color: "white",
//     border: "none",
//     padding: "8px 16px",
//     borderRadius: "6px",
//     fontSize: "12px",
//     cursor: "pointer",
//     fontWeight: "600",
//     transition: "all 0.3s ease",
//   };

//   const sectionStyle = {
//     background: "rgba(52, 152, 219, 0.05)",
//     padding: "25px",
//     borderRadius: "12px",
//     border: "1px solid rgba(52, 152, 219, 0.1)",
//     marginBottom: "25px",
//   };

//   const sectionTitleStyle = {
//     color: "#2c3e50",
//     fontSize: "20px",
//     fontWeight: "600",
//     marginBottom: "20px",
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//   };

//   const ciaGridStyle = {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
//     gap: "20px",
//   };

//   const calculatedFieldsStyle = {
//     display: "grid",
//     gridTemplateColumns: "repeat(2, 1fr)", // 2 columns
//     gap: "20px",
//     background: "linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)",
//     padding: "25px",
//     borderRadius: "12px",
//     marginTop: "25px",
//   };

//   const calculatedItemStyle = {
//     textAlign: "center",
//     background: "white",
//     padding: "20px",
//     borderRadius: "10px",
//     boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
//   };

//   const calculatedLabelStyle = {
//     display: "block",
//     fontWeight: "600",
//     color: "#34495e",
//     marginBottom: "10px",
//     fontSize: "14px",
//     textTransform: "uppercase",
//     letterSpacing: "1px",
//   };

//   const calculatedValueStyle = {
//     fontSize: "24px",
//     fontWeight: "700",
//     padding: "8px 16px",
//     borderRadius: "8px",
//     background: "#ffffff",
//     color: "#2c3e50",
//     border: "2px solid #ecf0f1",
//   };

//   const duplicateWarningStyle = {
//     color: "#e74c3c",
//     fontSize: "12px",
//     marginTop: "5px",
//     fontWeight: "600",
//   };

//   const riskLevel = calculateRiskLevel();

//   const responsiveStyle = `
//     @media (max-width: 768px) {
//       .risk-form {
//         padding: 25px 20px !important;
//         margin: 0 10px !important;
//       }
//       .risk-grid {
//         grid-template-columns: 1fr !important;
//         gap: 20px !important;
//       }
//       .cia-grid {
//         grid-template-columns: 1fr !important;
//       }
//       .calculated-fields {
//         grid-template-columns: 1fr !important;
//       }
//       .form-title {
//         font-size: 24px !important;
//       }
//       .risk-id-header {
//         flex-direction: column !important;
//         gap: 15px !important;
//         align-items: flex-start !important;
//       }
//     }
//     @media (max-width: 480px) {
//       .risk-form {
//         padding: 20px 15px !important;
//       }
//     }
//   `;

//   return (
//     <>
//       <style>{responsiveStyle}</style>
//       <div style={formStyle} className="risk-form">
//         <div style={headerStyle}>
//           <h2 style={titleStyle} className="form-title">
//             📋 Risk Details Assessment
//           </h2>
//           <p style={subtitleStyle}>
//             Complete all fields to evaluate the risk comprehensively
//           </p>
//         </div>

//         {/* Risk ID Section */}
//         <div style={riskIdSectionStyle}>
//           <div style={riskIdHeaderStyle} className="risk-id-header">
//             <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}>
//               🆔 Risk Identification
//             </h3>
//             {!isEditing && (
//               <button
//                 style={autoGenButtonStyle}
//                 onClick={generateRiskId}
//                 onMouseEnter={(e) =>
//                   (e.target.style.backgroundColor = "#2980b9")
//                 }
//                 onMouseLeave={(e) =>
//                   (e.target.style.backgroundColor = "#3498db")
//                 }
//               >
//                 🔄 Generate New ID
//               </button>
//             )}
//           </div>

//           <div style={gridStyle} className="risk-grid">
//             <div>
//               <InputField
//                 label="Risk ID"
//                 name="riskId"
//                 value={formData.riskId || ""}
//                 onChange={handleInputChange}
//                 placeholder="Auto-generated or enter custom ID"
//                 required
//                 readOnly={isEditing}
//               />
//               {isDuplicateRiskId() && (
//                 <div style={duplicateWarningStyle}>
//                   ⚠️ This Risk ID already exists. Please use a different ID.
//                 </div>
//               )}
//             </div>

//             <InputField
//               label="Department"
//               name="department"
//               value={formData.department || ""}
//               onChange={handleInputChange}
//               placeholder="Enter department name (e.g., IT, Finance, HR)"
//               required
//             />

//             <InputField
//               label="Date"
//               name="date"
//               type="date"
//               value={formData.date || ""}
//               onChange={handleInputChange}
//               required
//               readOnly
//             />

//             <SelectField
//               label="Risk Type"
//               name="riskType"
//               value={formData.riskType || ""}
//               onChange={handleInputChange}
//               options={riskTypeOptions}
//               placeholder="Select the type of risk"
//               required
//             />

//             <SelectField
//               label="Asset Type"
//               name="assetType"
//               value={formData.assetType || ""}
//               onChange={handleInputChange}
//               options={assetTypeOptions}
//               placeholder="Select asset classification"
//               required
//             />

//             <InputField
//               label="Asset"
//               name="location"
//               value={formData.location || ""}
//               onChange={handleInputChange}
//               placeholder="Enter the asset"
//               required
//             />
//           </div>
//         </div>
        

//         <div style={fullWidthStyle}>
//           <TextAreaField
//             label="Risk Description"
//             name="riskDescription"
//             value={formData.riskDescription || ""}
//             onChange={handleInputChange}
//             placeholder="This will be auto-filled when Threat & Vulnerabilities are selected"
//             rows={4}
//             required
//           />
//         </div>

//         <div style={sectionStyle}>
//           <h3 style={sectionTitleStyle}>🔒 CIA Triad Assessment</h3>
//           <p
//             style={{ color: "#7f8c8d", marginBottom: "20px", fontSize: "14px" }}
//           >
//             Auto-Populated Confidentiality, Integrity, and Availability (1 = Low
//             , 3 = High)
//           </p>

//           <div style={ciaGridStyle} className="cia-grid">
//             <SelectField
//               label="Confidentiality Impact"
//               name="confidentiality"
//               value={formData.confidentiality || ""}
//               onChange={handleInputChange}
//               options={ciaOptions}
//               placeholder="0-Select Asset Type"
//               required
//               readOnly
//             />

//             <SelectField
//               label="Integrity Impact"
//               name="integrity"
//               value={formData.integrity || ""}
//               onChange={handleInputChange}
//               options={ciaOptions}
//               placeholder="0-Select Asset Type"
//               required
//               readOnly
//             />

//             <SelectField
//               label="Availability Impact"
//               name="availability"
//               value={formData.availability || ""}
//               onChange={handleInputChange}
//               options={ciaOptions}
//               placeholder="0-Select Asset Type"
//               required
//               readOnly
//             />
//           </div>
//         </div>

//         <SelectField
//           label="Liklihood"
//           name="probability"
//           value={formData.probability || ""}
//           onChange={handleInputChange}
//           options={liklihoodOptions}
//           placeholder="Select probability level"
//           required
//         />

//         <div style={calculatedFieldsStyle} className="calculated-fields">
//           <div style={calculatedItemStyle}>
//             <label style={calculatedLabelStyle}>Asset Value</label>
//             <span style={calculatedValueStyle}>{calculateAsset()}</span>
//           </div>

//           <div style={calculatedItemStyle}>
//             <label style={calculatedLabelStyle}>Calculated Impact</label>
//             <span style={calculatedValueStyle}>{calculateImpact()}</span>
//           </div>

//           <div style={calculatedItemStyle}>
//             <label style={calculatedLabelStyle}>Risk Score</label>
//             <span style={calculatedValueStyle}>{riskLevel.riskScore}</span>
//           </div>

//           <div style={calculatedItemStyle}>
//             <label style={calculatedLabelStyle}>Risk Level</label>
//             <span
//               style={{
//                 ...calculatedValueStyle,
//                 backgroundColor: riskLevel.bgColor,
//                 color: riskLevel.color,
//                 border: `2px solid ${riskLevel.color}`,
//               }}
//             >
//               {riskLevel.level}
//             </span>
//           </div>
//         </div>

//         <div style={fullWidthStyle}>
//           <TextAreaField
//             label="Existing Controls"
//             name="existingcontrols"
//             value={formData.existingcontrols || ""}
//             onChange={handleInputChange}
//             placeholder="Controls which are already implemented..."
//             rows={3}
//           />
//         </div>

//         <div style={fullWidthStyle}>
//           <TextAreaField
//             label="Additional Notes"
//             name="additionalNotes"
//             value={formData.additionalNotes || ""}
//             onChange={handleInputChange}
//             placeholder="Any additional context, assumptions, or considerations..."
//             rows={3}
//           />
//         </div>
//       </div>
//     </>
//   );
// };

// export default RiskDetailsForm;





































import React, { useEffect, useState } from "react";
import InputField from "../inputs/InputField";
import SelectField from "../inputs/SelectField";
import TextAreaField from "../inputs/TextAreaField";

const RiskDetailsForm = ({
  formData,
  handleInputChange,
  generateRiskId,
  existingRiskIds = [],
  isEditing = false,
  originalRiskId = "",
}) => {
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
      const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD
      handleInputChange({ target: { name: "date", value: today } });
    }
  }, [formData.date, handleInputChange]);

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

  // Threat and Vulnerability options
  const threatOptions = [
    "Phishing Attack",
    "Malware Infection",
    "Insider Threat",
    "DDoS Attack",
    "Data Breach",
    "Others",
  ];

  const vulnerabilityOptions = [
    "Weak Email Filters",
    "Lack of User Awareness",
    "Outdated Antivirus",
    "Unpatched Software",
    "Weak Access Controls",
    "Excessive Privileges",
    "Others",
  ];

  // State for threats and vulnerabilities (INDEPENDENT)
  const [selectedThreats, setSelectedThreats] = useState([]);
  const [customThreat, setCustomThreat] = useState("");
  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState([]);
  const [customVulnerability, setCustomVulnerability] = useState("");

  // Handle threat selection (multiple)
  const handleThreatChange = (threat) => {
    setSelectedThreats((prev) =>
      prev.includes(threat) ? prev.filter((t) => t !== threat) : [...prev, threat]
    );
  };

  // Handle vulnerability selection (multiple)
  const handleVulnerabilityChange = (vulnerability) => {
    setSelectedVulnerabilities((prev) =>
      prev.includes(vulnerability)
        ? prev.filter((v) => v !== vulnerability)
        : [...prev, vulnerability]
    );
  };

  // Auto-populate risk description when threats and vulnerabilities change
  useEffect(() => {
    if (selectedThreats.length > 0 && selectedVulnerabilities.length > 0) {
      // Format threats (handle "Others")
      const threatsText = selectedThreats
        .map((t) => (t === "Others" ? `Custom Threat: ${customThreat}` : t))
        .join(", ");

      // Format vulnerabilities (handle "Others")
      const vulnerabilitiesText = selectedVulnerabilities
        .map((v) => (v === "Others" ? `Custom Vulnerability: ${customVulnerability}` : v))
        .join(", ");

      const newDescription = `Risk of loss of information due to ${threatsText} because of ${vulnerabilitiesText}`;

      handleInputChange({
        target: { name: "riskDescription", value: newDescription },
      });
    }
  }, [selectedThreats, selectedVulnerabilities, customThreat, customVulnerability, handleInputChange]);

  //auto populate
  const assetCIAValues = {
    Public: { confidentiality: 1, integrity: 1, availability: 1 },
    Private: { confidentiality: 2, integrity: 2, availability: 2 },
    Sensitive: { confidentiality: 3, integrity: 3, availability: 2 },
    Confidential: { confidentiality: 3, integrity: 3, availability: 3 },
  };

  const ciaOptions = [
    { value: 1, label: "1 - Low" },
    { value: 2, label: "2 - Medium" },
    { value: 3, label: "3 - High" },
  ];
  const liklihoodOptions = [
    { value: 1, label: "1 - Unlikely" },
    { value: 2, label: "2 - Mostly" },
    { value: 3, label: "3 - Possible" },
    { value: 4, label: "4 - Almost Likely" },
  ];

  const calculateImpact = () => {
    return Math.max(
      parseInt(formData.confidentiality) || 0,
      parseInt(formData.integrity) || 0,
      parseInt(formData.availability) || 0
    );
  };

  const calculateAsset = () => {
    return (
      parseInt(formData.confidentiality) +
      parseInt(formData.integrity) +
      parseInt(formData.availability)
    );
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

  const calculateRiskLevel = () => {
    const impact = calculateImpact();
    const probability = parseInt(formData.probability) || 0;
    const riskScore = impact * probability;

    if (riskScore <= 3)
      return { level: "Low", color: "#27ae60", bgColor: "#d5f4e6", riskScore };
    if (riskScore <= 8)
      return {
        level: "Medium",
        color: "#f39c12",
        bgColor: "#fef9e7",
        riskScore,
      };
    if (riskScore <= 12)
      return { level: "High", color: "#e67e22", bgColor: "#fdf2e9", riskScore };
    return {
      level: "Critical",
      color: "#e74c3c",
      bgColor: "#fadbd8",
      riskScore,
    };
  };

  const isDuplicateRiskId = () => {
    if (isEditing && formData.riskId === originalRiskId) {
      return false; // Not a duplicate if it's the same risk being edited
    }
    return existingRiskIds.includes(formData.riskId);
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

  const headerStyle = {
    textAlign: "center",
    marginBottom: "35px",
    paddingBottom: "20px",
    borderBottom: "3px solid #3498db",
    position: "relative",
  };

  const titleStyle = {
    color: "#2c3e50",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
    letterSpacing: "0.5px",
  };

  const subtitleStyle = {
    color: "#7f8c8d",
    fontSize: "16px",
    fontWeight: "400",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
    marginBottom: "30px",
  };

  const fullWidthStyle = {
    gridColumn: "1 / -1",
  };

  const riskIdSectionStyle = {
    background: "rgba(52, 152, 219, 0.05)",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid rgba(52, 152, 219, 0.1)",
    marginBottom: "30px",
  };

  const riskIdHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
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

  const sectionStyle = {
    background: "rgba(52, 152, 219, 0.05)",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid rgba(52, 152, 219, 0.1)",
    marginBottom: "25px",
  };

  const sectionTitleStyle = {
    color: "#2c3e50",
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const ciaGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  };

  const calculatedFieldsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)", // 2 columns
    gap: "20px",
    background: "linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)",
    padding: "25px",
    borderRadius: "12px",
    marginTop: "25px",
  };

  const calculatedItemStyle = {
    textAlign: "center",
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  };

  const calculatedLabelStyle = {
    display: "block",
    fontWeight: "600",
    color: "#34495e",
    marginBottom: "10px",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  };

  const calculatedValueStyle = {
    fontSize: "24px",
    fontWeight: "700",
    padding: "8px 16px",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#2c3e50",
    border: "2px solid #ecf0f1",
  };

  const duplicateWarningStyle = {
    color: "#e74c3c",
    fontSize: "12px",
    marginTop: "5px",
    fontWeight: "600",
  };

  // ✅ NEW: Checkbox styles for threats and vulnerabilities
  const checkboxContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "15px",
    padding: "15px",
    background: "#f9f9f9",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  };

  const checkboxStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  };

  const checkboxInputStyle = {
    cursor: "pointer",
    width: "18px",
    height: "18px",
  };

  const checkboxLabelStyle = {
    cursor: "pointer",
    fontSize: "14px",
    color: "#2c3e50",
    fontWeight: "500",
  };

  const customInputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    fontFamily: "inherit",
    marginTop: "8px",
  };

  const riskLevel = calculateRiskLevel();

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
      .checkbox-container {
        grid-template-columns: 1fr !important;
      }
    }
    @media (max-width: 480px) {
      .risk-form {
        padding: 20px 15px !important;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyle}</style>
      <div style={formStyle} className="risk-form">
        <div style={headerStyle}>
          <h2 style={titleStyle} className="form-title">
            📋 Risk Details Assessment
          </h2>
          <p style={subtitleStyle}>
            Complete all fields to evaluate the risk comprehensively
          </p>
        </div>

        {/* Risk ID Section */}
        <div style={riskIdSectionStyle}>
          <div style={riskIdHeaderStyle} className="risk-id-header">
            <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}>
              🆔 Risk Identification
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
                🔄 Generate New ID
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
              />
              {isDuplicateRiskId() && (
                <div style={duplicateWarningStyle}>
                  ⚠️ This Risk ID already exists. Please use a different ID.
                </div>
              )}
            </div>

            <InputField
              label="Department"
              name="department"
              value={formData.department || ""}
              onChange={handleInputChange}
              placeholder="Enter department name (e.g., IT, Finance, HR)"
              required
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
            />

            <SelectField
              label="Asset Type"
              name="assetType"
              value={formData.assetType || ""}
              onChange={handleInputChange}
              options={assetTypeOptions}
              placeholder="Select asset classification"
              required
            />

            <InputField
              label="Asset"
              name="location"
              value={formData.location || ""}
              onChange={handleInputChange}
              placeholder="Enter the asset"
              required
            />
          </div>
        </div>

        {/* ✅ NEW: Threat & Vulnerabilities Section (INDEPENDENT) */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>🔥 Threats & Vulnerabilities</h3>

          {/* Threats Section */}
          <div style={{ marginBottom: "25px" }}>
            <label style={{ ...calculatedLabelStyle, marginBottom: "10px" }}>
              Select Threats (Multiple)
            </label>
            <div style={checkboxContainerStyle} className="checkbox-container">
              {threatOptions.map((threat) => (
                <label key={threat} style={checkboxStyle}>
                  <input
                    type="checkbox"
                    checked={selectedThreats.includes(threat)}
                    onChange={() => handleThreatChange(threat)}
                    style={checkboxInputStyle}
                  />
                  <span style={checkboxLabelStyle}>{threat}</span>
                </label>
              ))}
            </div>

            {/* Custom Threat Input (only if "Others" selected) */}
            {selectedThreats.includes("Others") && (
              <div>
                <label style={{ ...calculatedLabelStyle, marginTop: "12px" }}>
                  Specify Custom Threat
                </label>
                <input
                  type="text"
                  value={customThreat}
                  onChange={(e) => setCustomThreat(e.target.value)}
                  placeholder="Enter custom threat..."
                  style={customInputStyle}
                />
              </div>
            )}
          </div>

          {/* Vulnerabilities Section */}
          <div>
            <label style={{ ...calculatedLabelStyle, marginBottom: "10px" }}>
              Select Vulnerabilities (Multiple)
            </label>
            <div style={checkboxContainerStyle} className="checkbox-container">
              {vulnerabilityOptions.map((vulnerability) => (
                <label key={vulnerability} style={checkboxStyle}>
                  <input
                    type="checkbox"
                    checked={selectedVulnerabilities.includes(vulnerability)}
                    onChange={() => handleVulnerabilityChange(vulnerability)}
                    style={checkboxInputStyle}
                  />
                  <span style={checkboxLabelStyle}>{vulnerability}</span>
                </label>
              ))}
            </div>

            {/* Custom Vulnerability Input (only if "Others" selected) */}
            {selectedVulnerabilities.includes("Others") && (
              <div>
                <label style={{ ...calculatedLabelStyle, marginTop: "12px" }}>
                  Specify Custom Vulnerability
                </label>
                <input
                  type="text"
                  value={customVulnerability}
                  onChange={(e) => setCustomVulnerability(e.target.value)}
                  placeholder="Enter custom vulnerability..."
                  style={customInputStyle}
                />
              </div>
            )}
          </div>
        </div>

        <div style={fullWidthStyle}>
          <TextAreaField
            label="Risk Description"
            name="riskDescription"
            value={formData.riskDescription || ""}
            onChange={handleInputChange}
            placeholder="This will be auto-filled when Threat & Vulnerabilities are selected"
            rows={4}
            required
          />
        </div>

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>🔒 CIA Triad Assessment</h3>
          <p
            style={{ color: "#7f8c8d", marginBottom: "20px", fontSize: "14px" }}
          >
            Auto-Populated Confidentiality, Integrity, and Availability (1 = Low
            , 3 = High)
          </p>

          <div style={ciaGridStyle} className="cia-grid">
            <SelectField
              label="Confidentiality Impact"
              name="confidentiality"
              value={formData.confidentiality || ""}
              onChange={handleInputChange}
              options={ciaOptions}
              placeholder="0-Select Asset Type"
              required
              readOnly
            />

            <SelectField
              label="Integrity Impact"
              name="integrity"
              value={formData.integrity || ""}
              onChange={handleInputChange}
              options={ciaOptions}
              placeholder="0-Select Asset Type"
              required
              readOnly
            />

            <SelectField
              label="Availability Impact"
              name="availability"
              value={formData.availability || ""}
              onChange={handleInputChange}
              options={ciaOptions}
              placeholder="0-Select Asset Type"
              required
              readOnly
            />
          </div>
        </div>

        <SelectField
          label="Liklihood"
          name="probability"
          value={formData.probability || ""}
          onChange={handleInputChange}
          options={liklihoodOptions}
          placeholder="Select probability level"
          required
        />

        <div style={calculatedFieldsStyle} className="calculated-fields">
          <div style={calculatedItemStyle}>
            <label style={calculatedLabelStyle}>Asset Value</label>
            <span style={calculatedValueStyle}>{calculateAsset()}</span>
          </div>

          <div style={calculatedItemStyle}>
            <label style={calculatedLabelStyle}>Calculated Impact</label>
            <span style={calculatedValueStyle}>{calculateImpact()}</span>
          </div>

          <div style={calculatedItemStyle}>
            <label style={calculatedLabelStyle}>Risk Score</label>
            <span style={calculatedValueStyle}>{riskLevel.riskScore}</span>
          </div>

          <div style={calculatedItemStyle}>
            <label style={calculatedLabelStyle}>Risk Level</label>
            <span
              style={{
                ...calculatedValueStyle,
                backgroundColor: riskLevel.bgColor,
                color: riskLevel.color,
                border: `2px solid ${riskLevel.color}`,
              }}
            >
              {riskLevel.level}
            </span>
          </div>
        </div>

        <div style={fullWidthStyle}>
          <TextAreaField
            label="Existing Controls"
            name="existingcontrols"
            value={formData.existingcontrols || ""}
            onChange={handleInputChange}
            placeholder="Controls which are already implemented..."
            rows={3}
          />
        </div>

        <div style={fullWidthStyle}>
          <TextAreaField
            label="Additional Notes"
            name="additionalNotes"
            value={formData.additionalNotes || ""}
            onChange={handleInputChange}
            placeholder="Any additional context, assumptions, or considerations..."
            rows={3}
          />
        </div>
      </div>
    </>
  );
};

export default RiskDetailsForm;
