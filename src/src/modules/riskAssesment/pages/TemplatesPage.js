// import React, { useEffect, useState } from "react";
// import templateRiskService from "../services/templateRiskService";
// import riskService from "../services/riskService";

// const RiskTemplateTable = () => {
//   const [risks, setRisks] = useState([]);
//   const [savingId, setSavingId] = useState(null);
//   const [removingId, setRemovingId] = useState(null);
//   const [selectedRisk, setSelectedRisk] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [showConfirmDialog, setShowConfirmDialog] = useState(false);
//   const [riskToRemove, setRiskToRemove] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const risksPerPage = 5;

//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await templateRiskService.getAllTemplateRisks();
//       setRisks(data);
//     };
//     fetchData();
//   }, []);

//   // Handle Accept (Add Risk)
//   const handleAcceptRisk = async (risk, index) => {
//     try {
//       setSavingId(index);

//       const existingRisks = await riskService.getAllRisks();
//       const currentYear = new Date().getFullYear();
//       const maxNumber = existingRisks.reduce((max, r) => {
//         const match = r.riskId.match(/RR-\d{4}-(\d+)/);
//         if (match) {
//           const num = parseInt(match[1], 10);
//           return num > max ? num : max;
//         }
//         return max;
//       }, 0);
//       const nextNumber = String(maxNumber + 1).padStart(3, "0");
//       const nextRiskId = `RR-${currentYear}-${nextNumber}`;

//       const newRisk = {
//         ...risk,
//         riskId: nextRiskId,
//         probability: String(risk.probability),
//         numberOfDays: String(risk.numberOfDays),
//         likelihoodAfterTreatment: String(risk.likelihoodAfterTreatment),
//         impactAfterTreatment: String(risk.impactAfterTreatment),
//         controlReference: Array.isArray(risk.controlReference)
//           ? risk.controlReference
//           : [risk.controlReference].filter(Boolean),
//         vulnerability: Array.isArray(risk.vulnerability)
//           ? risk.vulnerability
//           : [risk.vulnerability].filter(Boolean),
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//         status: "Active",
//       };

//       await riskService.saveRisk(newRisk);
//       alert(`Risk template ${index + 1} accepted and added successfully!`);
//     } catch (error) {
//       console.error(error);
//       alert(`Failed to accept risk template: ${error.message}`);
//     } finally {
//       setSavingId(null);
//     }
//   };

//   // Handle Reject (Remove Risk)
//   const handleRejectRisk = (index) => {
//     setRiskToRemove(index);
//     setShowConfirmDialog(true);
//   };

//   const confirmRejectRisk = () => {
//     setRemovingId(riskToRemove);
//     setTimeout(() => {
//       const newRisks = risks.filter((_, index) => index !== riskToRemove);
//       setRisks(newRisks);
//       setRemovingId(null);
//       setShowConfirmDialog(false);
//       setRiskToRemove(null);
//       alert(`Risk template ${riskToRemove + 1} has been removed from view.`);
//     }, 500);
//   };

//   const cancelRejectRisk = () => {
//     setShowConfirmDialog(false);
//     setRiskToRemove(null);
//   };

//   // Handle View Full Risk
//   const handleViewFullRisk = (risk, index) => {
//     setSelectedRisk({ ...risk, serialNo: index + 1 });
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setSelectedRisk(null);
//   };

//   // Get risk level color
//   const getRiskLevelColor = (riskLevel) => {
//     switch (riskLevel?.toLowerCase()) {
//       case "high":
//         return "#ffcccb"; // Light red
//       case "medium":
//         return "#ffffcc"; // Light yellow
//       case "low":
//         return "#ccffcc"; // Light green
//       default:
//         return "#f0f0f0"; // Light gray
//     }
//   };

//   // Button styles
//   const buttonBaseStyle = {
//     padding: "8px 16px",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer",
//     fontSize: "14px",
//     fontWeight: "500",
//     margin: "0 4px",
//     minWidth: "70px",
//     transition: "all 0.2s ease",
//   };

//   const acceptButtonStyle = {
//     ...buttonBaseStyle,
//     backgroundColor: "#28a745",
//     color: "white",
//   };

//   const rejectButtonStyle = {
//     ...buttonBaseStyle,
//     backgroundColor: "#dc3545",
//     color: "white",
//   };

//   const viewButtonStyle = {
//     ...buttonBaseStyle,
//     backgroundColor: "#007bff",
//     color: "white",
//   };

//   // Main table styles
//   const tableStyles = {
//     width: "100%",
//     borderCollapse: "collapse",
//     fontSize: "14px",
//     backgroundColor: "white",
//     boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//   };

//   const headerStyles = {
//     backgroundColor: "#f8f9fa",
//     padding: "16px 12px",
//     textAlign: "center",
//     fontWeight: "600",
//     fontSize: "15px",
//     border: "2px solid #dee2e6",
//     position: "sticky",
//     top: 0,
//     zIndex: 10,
//   };

//   const cellStyles = {
//     padding: "12px",
//     border: "1px solid #dee2e6",
//     textAlign: "left",
//     verticalAlign: "top",
//   };

//   // Pagination logic
//   const indexOfLastRisk = currentPage * risksPerPage;
//   const indexOfFirstRisk = indexOfLastRisk - risksPerPage;
//   const currentRisks = risks.slice(indexOfFirstRisk, indexOfLastRisk);
//   const totalPages = Math.ceil(risks.length / risksPerPage);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div
//       style={{
//         padding: "20px",
//         backgroundColor: "#f8f9fa",
//         minHeight: "100vh",
//       }}
//     >
//       <h2
//         style={{
//           fontSize: "2rem",
//           fontWeight: "bold",
//           marginBottom: "20px",
//           textAlign: "center",
//           color: "#333",
//         }}
//       >
//         Sample Risks
//       </h2>

//       <div
//         style={{
//           overflowX: "auto",
//           backgroundColor: "white",
//           borderRadius: "8px",
//           boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//         }}
//       >
//         <table style={tableStyles}>
//           <thead>
//             <tr>
//               <th style={{ ...headerStyles, width: "80px" }}>Risk ID</th>
//               <th style={{ ...headerStyles, width: "45%" }}>
//                 Risk Description
//               </th>
//               <th style={{ ...headerStyles, width: "100px" }}>Risk Score</th>
//               <th style={{ ...headerStyles, width: "120px" }}>Risk Level</th>
//               <th
//                 style={{
//                   ...headerStyles,
//                   width: "280px",
//                   backgroundColor: "#e3f2fd",
//                 }}
//               >
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentRisks.map((risk, index) => (
//               <tr
//                 key={index}
//                 style={{
//                   backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
//                   opacity: removingId === index ? 0.3 : 1,
//                   transform: removingId === index ? "scale(0.98)" : "scale(1)",
//                   transition: "all 0.3s ease",
//                 }}
//               >
//                 {/* Risk ID (Serial Number) */}
//                 <td
//                   style={{
//                     ...cellStyles,
//                     textAlign: "center",
//                     fontWeight: "600",
//                   }}
//                 >
//                   {indexOfFirstRisk + index + 1}
//                 </td>

//                 {/* Risk Description */}
//                 <td style={{ ...cellStyles, lineHeight: "1.5" }}>
//                   {risk.riskDescription}
//                 </td>

//                 {/* Risk Score */}
//                 <td
//                   style={{
//                     ...cellStyles,
//                     textAlign: "center",
//                     fontWeight: "600",
//                     fontSize: "16px",
//                   }}
//                 >
//                   {risk.riskScore}
//                 </td>

//                 {/* Risk Level */}
//                 <td
//                   style={{
//                     ...cellStyles,
//                     textAlign: "center",
//                     backgroundColor: getRiskLevelColor(risk.riskLevel),
//                     fontWeight: "600",
//                     fontSize: "14px",
//                   }}
//                 >
//                   {risk.riskLevel}
//                 </td>

//                 {/* Action Buttons */}
//                 <td
//                   style={{
//                     ...cellStyles,
//                     textAlign: "center",
//                     backgroundColor: "#f8f9fa",
//                   }}
//                 >
//                   <button
//                     onClick={() => handleAcceptRisk(risk, index)}
//                     disabled={savingId === index || removingId === index}
//                     style={{
//                       ...acceptButtonStyle,
//                       opacity:
//                         savingId === index || removingId === index ? 0.6 : 1,
//                       cursor:
//                         savingId === index || removingId === index
//                           ? "not-allowed"
//                           : "pointer",
//                     }}
//                     onMouseOver={(e) => {
//                       if (savingId !== index && removingId !== index) {
//                         e.target.style.backgroundColor = "#218838";
//                       }
//                     }}
//                     onMouseOut={(e) => {
//                       if (savingId !== index && removingId !== index) {
//                         e.target.style.backgroundColor = "#28a745";
//                       }
//                     }}
//                   >
//                     {savingId === index ? "Adding..." : "Accept"}
//                   </button>

//                   <button
//                     onClick={() => handleRejectRisk(index)}
//                     disabled={savingId === index || removingId === index}
//                     style={{
//                       ...rejectButtonStyle,
//                       opacity:
//                         savingId === index || removingId === index ? 0.6 : 1,
//                       cursor:
//                         savingId === index || removingId === index
//                           ? "not-allowed"
//                           : "pointer",
//                     }}
//                     onMouseOver={(e) => {
//                       if (savingId !== index && removingId !== index) {
//                         e.target.style.backgroundColor = "#c82333";
//                       }
//                     }}
//                     onMouseOut={(e) => {
//                       if (savingId !== index && removingId !== index) {
//                         e.target.style.backgroundColor = "#dc3545";
//                       }
//                     }}
//                   >
//                     {removingId === index ? "Removing..." : "Reject"}
//                   </button>

//                   <button
//                     onClick={() => handleViewFullRisk(risk, index)}
//                     disabled={savingId === index || removingId === index}
//                     style={{
//                       ...viewButtonStyle,
//                       opacity:
//                         savingId === index || removingId === index ? 0.6 : 1,
//                       cursor:
//                         savingId === index || removingId === index
//                           ? "not-allowed"
//                           : "pointer",
//                     }}
//                     onMouseOver={(e) => {
//                       if (savingId !== index && removingId !== index) {
//                         e.target.style.backgroundColor = "#0056b3";
//                       }
//                     }}
//                     onMouseOut={(e) => {
//                       if (savingId !== index && removingId !== index) {
//                         e.target.style.backgroundColor = "#007bff";
//                       }
//                     }}
//                   >
//                     View Full Risk
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         {/* Pagination controls */}
//         {totalPages > 1 && (
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               marginTop: "10px 0",
//               gap: "10px",
//             }}
//           >
//             <button
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               style={{
//                 padding: "8px 14px",
//                 borderRadius: "6px",
//                 border: "1px solid #007bff",
//                 background: currentPage === 1 ? "#e9ecef" : "white",
//                 color: currentPage === 1 ? "#6c757d" : "#007bff",
//                 cursor: currentPage === 1 ? "not-allowed" : "pointer",
//               }}
//             >
//               Prev
//             </button>

//             {[...Array(totalPages).keys()].map((num) => (
//               <button
//                 key={num}
//                 onClick={() => paginate(num + 1)}
//                 style={{
//                   padding: "8px 14px",
//                   borderRadius: "6px",
//                   border: "1px solid #007bff",
//                   backgroundColor:
//                     currentPage === num + 1 ? "#007bff" : "white",
//                   color: currentPage === num + 1 ? "white" : "#007bff",
//                   cursor: "pointer",
//                 }}
//               >
//                 {num + 1}
//               </button>
//             ))}

//             <button
//               onClick={() =>
//                 setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//               }
//               disabled={currentPage === totalPages}
//               style={{
//                 padding: "8px 14px",
//                 borderRadius: "6px",
//                 border: "1px solid #007bff",
//                 background: currentPage === totalPages ? "#e9ecef" : "white",
//                 color: currentPage === totalPages ? "#6c757d" : "#007bff",
//                 cursor: currentPage === totalPages ? "not-allowed" : "pointer",
//               }}
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Confirmation Dialog */}
//       {showConfirmDialog && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             backgroundColor: "rgba(0, 0, 0, 0.5)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1000,
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: "white",
//               padding: "30px",
//               borderRadius: "8px",
//               boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
//               maxWidth: "400px",
//               textAlign: "center",
//             }}
//           >
//             <h3 style={{ marginBottom: "20px", color: "#333" }}>
//               Confirm Rejection
//             </h3>
//             <p
//               style={{
//                 marginBottom: "25px",
//                 color: "#666",
//                 lineHeight: "1.5",
//               }}
//             >
//               Are you sure you want to remove Risk Template {riskToRemove + 1}{" "}
//               from view? This action cannot be undone.
//             </p>
//             <div>
//               <button
//                 onClick={cancelRejectRisk}
//                 style={{
//                   ...buttonBaseStyle,
//                   backgroundColor: "#6c757d",
//                   color: "white",
//                   marginRight: "10px",
//                 }}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmRejectRisk}
//                 style={{
//                   ...buttonBaseStyle,
//                   backgroundColor: "#dc3545",
//                   color: "white",
//                 }}
//               >
//                 Remove
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Full Risk Modal */}
//       {showModal && selectedRisk && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             backgroundColor: "rgba(0, 0, 0, 0.5)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1000,
//             overflow: "auto",
//             padding: "20px",
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: "white",
//               padding: "30px",
//               borderRadius: "8px",
//               boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
//               maxWidth: "800px",
//               width: "100%",
//               maxHeight: "90vh",
//               overflow: "auto",
//             }}
//           >
//             <div
//               style={{
//                 position: "sticky",
//                 top: -30,
//                 background: "#fff",
//                 zIndex: 10,
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginBottom: "25px",
//                 marginTop: "-30px",
//                 padding: "20px",
//                 borderBottom: "2px solid #eee",
//                 paddingBottom: "15px",
//                 width: "100%",
//               }}
//             >
//               {" "}
//               <h3 style={{ margin: 0, color: "#333", fontSize: "1.5rem" }}>
//                 Sample Risk {selectedRisk.serialNo} - Full Details
//               </h3>
//               <button
//                 onClick={closeModal}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   fontSize: "24px",
//                   cursor: "pointer",
//                   color: "#666",
//                   padding: "5px",
//                 }}
//               >
//                 ×
//               </button>
//             </div>

//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "1fr 1fr",
//                 gap: "20px",
//                 fontSize: "14px",
//               }}
//             >
//               {[
//                 { label: "Department", value: selectedRisk.department },
//                 { label: "Risk Type", value: selectedRisk.riskType },
//                 { label: "Asset Type", value: selectedRisk.assetType },
//                 { label: "Asset", value: selectedRisk.asset },
//                 // ✅ Move Risk Description here (before Risk Score)
//                 {
//                   label: "Risk Description",
//                   value: selectedRisk.riskDescription,
//                 },

//                 { label: "Risk Score", value: selectedRisk.riskScore },
//                 { label: "Risk Level", value: selectedRisk.riskLevel },
//                 { label: "Likelihood", value: selectedRisk.probability },
//                 {
//                   label: "Likelihood After Treatment",
//                   value: selectedRisk.likelihoodAfterTreatment,
//                 },
//                 {
//                   label: "Impact After Treatment",
//                   value: selectedRisk.impactAfterTreatment,
//                 },
//               ].map((item, idx) => (
//                 <div
//                   key={idx}
//                   style={{
//                     padding: "12px",
//                     backgroundColor: "#f8f9fa",
//                     borderRadius: "4px",
//                     border: "1px solid #e9ecef",
//                   }}
//                 >
//                   <div
//                     style={{
//                       fontWeight: "600",
//                       marginBottom: "5px",
//                       color: "#495057",
//                     }}
//                   >
//                     {item.label}:
//                   </div>
//                   <div style={{ color: "#333", lineHeight: "1.5" }}>
//                     {item.value || "N/A"}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
//               <div
//                 style={{
//                   flex: 1,
//                   padding: "12px",
//                   backgroundColor: "#f8f9fa",
//                   borderRadius: "4px",
//                   border: "1px solid #e9ecef",
//                 }}
//               >
//                 <div
//                   style={{
//                     fontWeight: "600",
//                     marginBottom: "8px",
//                     color: "#495057",
//                   }}
//                 >
//                   Existing Controls:
//                 </div>
//                 <div style={{ color: "#333", lineHeight: "1.5" }}>
//                   {selectedRisk.existingControls || "None specified"}
//                 </div>
//               </div>

//               <div
//                 style={{
//                   flex: 1,
//                   padding: "12px",
//                   backgroundColor: "#f8f9fa",
//                   borderRadius: "4px",
//                   border: "1px solid #e9ecef",
//                 }}
//               >
//                 <div
//                   style={{
//                     fontWeight: "600",
//                     marginBottom: "8px",
//                     color: "#495057",
//                   }}
//                 >
//                   Risk Owner:
//                 </div>
//                 <div style={{ color: "#333", lineHeight: "1.5" }}>
//                   {selectedRisk.riskOwner || "Unassigned"}
//                 </div>
//               </div>
//             </div>

//             <div style={{ marginTop: "20px" }}>
//               <div
//                 style={{
//                   padding: "12px",
//                   backgroundColor: "#f8f9fa",
//                   borderRadius: "4px",
//                   border: "1px solid #e9ecef",
//                 }}
//               >
//                 <div
//                   style={{
//                     fontWeight: "600",
//                     marginBottom: "8px",
//                     color: "#495057",
//                   }}
//                 >
//                   Risk Treatment Plan:
//                 </div>
//                 <div style={{ color: "#333", lineHeight: "1.5" }}>
//                   {selectedRisk.riskTreatmentPlan ||
//                     "No treatment plan specified"}
//                 </div>
//               </div>
//             </div>

//             <div
//               style={{
//                 marginTop: "25px",
//                 display: "flex",
//                 justifyContent: "flex-end",
//               }}
//             >
//               <button
//                 onClick={closeModal}
//                 style={{
//                   ...buttonBaseStyle,
//                   backgroundColor: "#ff0000ff",
//                   color: "white",
//                 }}
//               >
//                 Close
//               </button>
//               <button
//                 onClick={() =>
//                   handleAcceptRisk(selectedRisk, selectedRisk.serialNo - 1)
//                 }
//                 style={{
//                   ...buttonBaseStyle,
//                   backgroundColor: "#007bff",
//                   color: "white",
//                 }}
//               >
//                 Accept
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RiskTemplateTable;



import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import templateRiskService from "../services/templateRiskService";
import riskService from "../services/riskService";

const RiskTemplateTable = () => {
  const [risks, setRisks] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [riskToRemove, setRiskToRemove] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const risksPerPage = 5;
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      const data = await templateRiskService.getAllTemplateRisks();
      setRisks(data);
    };
    fetchData();
  }, []);

  // Handle Accept (Add Risk)
  const handleAcceptRisk = async (risk, index) => {
    try {
      setSavingId(index);

      const existingRisks = await riskService.getAllRisks();
      const currentYear = new Date().getFullYear();
      const maxNumber = existingRisks.reduce((max, r) => {
        const match = r.riskId.match(/RR-\d{4}-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      const nextNumber = String(maxNumber + 1).padStart(3, "0");
      const nextRiskId = `RR-${currentYear}-${nextNumber}`;

      const newRisk = {
        ...risk,
        riskId: nextRiskId,
        date:new Date().toISOString().split("T")[0],
        probability: String(risk.probability),
        numberOfDays: String(risk.numberOfDays),
        likelihoodAfterTreatment: String(risk.likelihoodAfterTreatment),
        impactAfterTreatment: String(risk.impactAfterTreatment),
        controlReference: Array.isArray(risk.controlReference)
          ? risk.controlReference
          : [risk.controlReference].filter(Boolean),
        vulnerability: Array.isArray(risk.vulnerability)
          ? risk.vulnerability
          : [risk.vulnerability].filter(Boolean),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "Active",
      };

      await riskService.saveRisk(newRisk);
      alert(`Risk template ${index + 1} accepted and added successfully!`);
    } catch (error) {
      console.error(error);
      alert(`Failed to accept risk template: ${error.message}`);
    } finally {
      setSavingId(null);
    }
  };

  // Handle Reject (Remove Risk)
  const handleRejectRisk = (index) => {
    setRiskToRemove(index);
    setShowConfirmDialog(true);
  };

  const confirmRejectRisk = () => {
    setRemovingId(riskToRemove);
    setTimeout(() => {
      const newRisks = risks.filter((_, index) => index !== riskToRemove);
      setRisks(newRisks);
      setRemovingId(null);
      setShowConfirmDialog(false);
      setRiskToRemove(null);
      alert(`Risk template ${riskToRemove + 1} has been removed from view.`);
    }, 500);
  };

  const cancelRejectRisk = () => {
    setShowConfirmDialog(false);
    setRiskToRemove(null);
  };

  // Handle View Full Risk
  const handleViewFullRisk = (risk, index) => {
    setSelectedRisk({ ...risk, serialNo: index + 1 });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRisk(null);
  };

  // Get risk level color
  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case "high":
        return "#ffcccb";
      case "medium":
        return "#ffffcc";
      case "low":
        return "#ccffcc";
      default:
        return "#f0f0f0";
    }
  };

  // Button styles
  const buttonBaseStyle = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    margin: "0 4px",
    minWidth: "70px",
    transition: "all 0.2s ease",
  };

  const acceptButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "#28a745",
    color: "white",
  };

  const rejectButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "#dc3545",
    color: "white",
  };

  const viewButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "#007bff",
    color: "white",
  };

  // Fixed "Back to Dashboard" button styles (NEW)
  const backBtnStyle = {
    position: "fixed",
    top: "20px",
    right: "120px",
    padding: "10px 20px",
    borderRadius: "6px",
    backgroundColor: "#005FCC",
    border: "none",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0, 95, 204, 0.3)",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    zIndex: 99,
  };

  const handleBackBtnMouseEnter = (e) => {
    e.target.style.backgroundColor = "#0046a3";
    e.target.style.boxShadow = "0 6px 12px rgba(0, 70, 163, 0.5)";
    e.target.style.transform = "translateY(-2px)";
  };

  const handleBackBtnMouseLeave = (e) => {
    e.target.style.backgroundColor = "#005FCC";
    e.target.style.boxShadow = "0 4px 8px rgba(0, 95, 204, 0.3)";
    e.target.style.transform = "translateY(0)";
  };

  // Main table styles
  const tableStyles = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const headerStyles = {
    backgroundColor: "#f8f9fa",
    padding: "16px 12px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "15px",
    border: "2px solid #dee2e6",
    position: "sticky",
    top: 0,
    zIndex: 10,
  };

  const cellStyles = {
    padding: "12px",
    border: "1px solid #dee2e6",
    textAlign: "left",
    verticalAlign: "top",
  };

  // Pagination logic
  const indexOfLastRisk = currentPage * risksPerPage;
  const indexOfFirstRisk = indexOfLastRisk - risksPerPage;
  const currentRisks = risks.slice(indexOfFirstRisk, indexOfLastRisk);
  const totalPages = Math.ceil(risks.length / risksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // NEW Pagination button styles
  const paginationButtonStyle = {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "1px solid #007bff",
    margin: "0 4px",
    cursor: "pointer",
    fontWeight: "600",
    backgroundColor: "white",
    color: "#007bff",
    userSelect: "none",
    transition: "all 0.2s ease",
  };

  const activePageStyle = {
    backgroundColor: "#007bff",
    color: "white",
    cursor: "default",
  };

  const disabledButtonStyle = {
    backgroundColor: "#e9ecef",
    color: "#6c757d",
    cursor: "not-allowed",
    border: "1px solid #dee2e6",
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* NEW: Back to Dashboard Button */}
      <button
        style={backBtnStyle}
        onClick={() => history.push("/risk-assessment")}
        onMouseEnter={handleBackBtnMouseEnter}
        onMouseLeave={handleBackBtnMouseLeave}
      >
        ← Back to Dashboard
      </button>

      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "20px",
          textAlign: "center",
          color: "#333",
        }}
      >
        Sample Risks
      </h2>

      <div
        style={{
          overflowX: "auto",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={{ ...headerStyles, width: "80px" }}>Risk ID</th>
              <th style={{ ...headerStyles, width: "45%" }}>
                Risk Description
              </th>
              <th style={{ ...headerStyles, width: "100px" }}>Risk Score</th>
              <th style={{ ...headerStyles, width: "120px" }}>Risk Level</th>
              <th
                style={{
                  ...headerStyles,
                  width: "280px",
                  backgroundColor: "#e3f2fd",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRisks.map((risk, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                  opacity: removingId === index ? 0.3 : 1,
                  transform: removingId === index ? "scale(0.98)" : "scale(1)",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Risk ID (Serial Number) */}
                <td
                  style={{
                    ...cellStyles,
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {indexOfFirstRisk + index + 1}
                </td>

                {/* Risk Description */}
                <td style={{ ...cellStyles, lineHeight: "1.5" }}>
                  {risk.riskDescription}
                </td>

                {/* Risk Score */}
                <td
                  style={{
                    ...cellStyles,
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "16px",
                  }}
                >
                  {risk.riskScore}
                </td>

                {/* Risk Level */}
                <td
                  style={{
                    ...cellStyles,
                    textAlign: "center",
                    backgroundColor: getRiskLevelColor(risk.riskLevel),
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  {risk.riskLevel}
                </td>

                {/* Action Buttons */}
                <td
                  style={{
                    ...cellStyles,
                    textAlign: "center",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <button
                    onClick={() => handleAcceptRisk(risk, index)}
                    disabled={savingId === index || removingId === index}
                    style={{
                      ...acceptButtonStyle,
                      opacity:
                        savingId === index || removingId === index ? 0.6 : 1,
                      cursor:
                        savingId === index || removingId === index
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onMouseOver={(e) => {
                      if (savingId !== index && removingId !== index) {
                        e.target.style.backgroundColor = "#218838";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (savingId !== index && removingId !== index) {
                        e.target.style.backgroundColor = "#28a745";
                      }
                    }}
                  >
                    {savingId === index ? "Adding..." : "Accept"}
                  </button>

                  <button
                    onClick={() => handleRejectRisk(index)}
                    disabled={savingId === index || removingId === index}
                    style={{
                      ...rejectButtonStyle,
                      opacity:
                        savingId === index || removingId === index ? 0.6 : 1,
                      cursor:
                        savingId === index || removingId === index
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onMouseOver={(e) => {
                      if (savingId !== index && removingId !== index) {
                        e.target.style.backgroundColor = "#c82333";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (savingId !== index && removingId !== index) {
                        e.target.style.backgroundColor = "#dc3545";
                      }
                    }}
                  >
                    {removingId === index ? "Removing..." : "Reject"}
                  </button>

                  <button
                    onClick={() => handleViewFullRisk(risk, index)}
                    disabled={savingId === index || removingId === index}
                    style={{
                      ...viewButtonStyle,
                      opacity:
                        savingId === index || removingId === index ? 0.6 : 1,
                      cursor:
                        savingId === index || removingId === index
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onMouseOver={(e) => {
                      if (savingId !== index && removingId !== index) {
                        e.target.style.backgroundColor = "#0056b3";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (savingId !== index && removingId !== index) {
                        e.target.style.backgroundColor = "#007bff";
                      }
                    }}
                  >
                    View Full Risk
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* NEW: Improved Pagination controls */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                ...paginationButtonStyle,
                ...(currentPage === 1 ? disabledButtonStyle : {}),
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 1) {
                  e.target.style.backgroundColor = "#0056b3";
                  e.target.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 1) {
                  e.target.style.backgroundColor = "white";
                  e.target.style.color = "#007bff";
                }
              }}
            >
              ← Prev
            </button>

            {[...Array(totalPages).keys()].map((num) => {
              const pageNum = num + 1;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  style={{
                    ...paginationButtonStyle,
                    ...(isActive ? activePageStyle : {}),
                  }}
                  disabled={isActive}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = "#e7f1ff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = "white";
                    }
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={{
                ...paginationButtonStyle,
                ...(currentPage === totalPages ? disabledButtonStyle : {}),
              }}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) {
                  e.target.style.backgroundColor = "#0056b3";
                  e.target.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== totalPages) {
                  e.target.style.backgroundColor = "white";
                  e.target.style.color = "#007bff";
                }
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: "20px", color: "#333" }}>
              Confirm Rejection
            </h3>
            <p
              style={{
                marginBottom: "25px",
                color: "#666",
                lineHeight: "1.5",
              }}
            >
              Are you sure you want to remove Risk Template {riskToRemove + 1}{" "}
              from view? This action cannot be undone.
            </p>
            <div>
              <button
                onClick={cancelRejectRisk}
                style={{
                  ...buttonBaseStyle,
                  backgroundColor: "#6c757d",
                  color: "white",
                  marginRight: "10px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectRisk}
                style={{
                  ...buttonBaseStyle,
                  backgroundColor: "#dc3545",
                  color: "white",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Full Risk Modal */}
      {showModal && selectedRisk && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            overflow: "auto",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: -30,
                background: "#fff",
                zIndex: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
                marginTop: "-30px",
                padding: "20px",
                borderBottom: "2px solid #eee",
                paddingBottom: "15px",
                width: "100%",
              }}
            >
              <h3 style={{ margin: 0, color: "#333", fontSize: "1.5rem" }}>
                Sample Risk {selectedRisk.serialNo} - Full Details
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                  padding: "5px",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                fontSize: "14px",
              }}
            >
              {[
                { label: "Department", value: selectedRisk.department },
                { label: "Risk Type", value: selectedRisk.riskType },
                { label: "Asset Type", value: selectedRisk.assetType },
                { label: "Asset", value: selectedRisk.asset },
                {
                  label: "Risk Description",
                  value: selectedRisk.riskDescription,
                },
                { label: "Risk Score", value: selectedRisk.riskScore },
                { label: "Risk Level", value: selectedRisk.riskLevel },
                { label: "Likelihood", value: selectedRisk.probability },
                {
                  label: "Likelihood After Treatment",
                  value: selectedRisk.likelihoodAfterTreatment,
                },
                {
                  label: "Impact After Treatment",
                  value: selectedRisk.impactAfterTreatment,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "12px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "5px",
                      color: "#495057",
                    }}
                  >
                    {item.label}:
                  </div>
                  <div style={{ color: "#333", lineHeight: "1.5" }}>
                    {item.value || "N/A"}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
              <div
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  border: "1px solid #e9ecef",
                }}
              >
                <div
                  style={{
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#495057",
                  }}
                >
                  Existing Controls:
                </div>
                <div style={{ color: "#333", lineHeight: "1.5" }}>
                  {selectedRisk.existingControls || "None specified"}
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  border: "1px solid #e9ecef",
                }}
              >
                <div
                  style={{
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#495057",
                  }}
                >
                  Risk Owner:
                </div>
                <div style={{ color: "#333", lineHeight: "1.5" }}>
                  {selectedRisk.riskOwner || "Unassigned"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                  border: "1px solid #e9ecef",
                }}
              >
                <div
                  style={{
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#495057",
                  }}
                >
                  Risk Treatment Plan:
                </div>
                <div style={{ color: "#333", lineHeight: "1.5" }}>
                  {selectedRisk.riskTreatmentPlan ||
                    "No treatment plan specified"}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "25px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  ...buttonBaseStyle,
                  backgroundColor: "#6c757d",
                  color: "white",
                }}
              >
                Close
              </button>
              <button
                onClick={() =>
                  handleAcceptRisk(selectedRisk, selectedRisk.serialNo - 1)
                }
                style={{
                  ...buttonBaseStyle,
                  backgroundColor: "#007bff",
                  color: "white",
                }}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskTemplateTable;
