
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import riskService from "../services/riskService";
import documentationService from "../../documentation/services/documentationService";
import { DOCUMENT_MAPPING } from "../../documentation/constants";
import { CONTROL_MAPPING } from "../constants";
import DigitalTimer from "../components/DigitalTimer";
import { getDepartments } from "../../departments/services/userService";

const SavedRisksPage = () => {
  const history = useHistory();
  const [savedRisks, setSavedRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentName, setDepartmentName] = useState("");
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [showModal, setShowModal] = useState(false);


    const [redirectMessage, setRedirectMessage] = useState("");


  useEffect(() => {
    loadSavedRisks();
  }, []);

const loadSavedRisks = async () => {
  try {
    setLoading(true);
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) return;

    const risks = await riskService.getAllRisks();
    if (!Array.isArray(risks)) {
      setSavedRisks([]);
      return;
    }

    let filteredRisks;

    if (user.role === "super_admin") {
      // Show all risks for super admins
      filteredRisks = risks;
    } else {
      // Filter risks by user's department for other roles
      const deptName = user.department?.name || "";
      filteredRisks = risks.filter((risk) => risk.department === deptName);
    }

    setDepartmentName(user.department?.name || "All Departments");
    setSavedRisks(filteredRisks);
  } catch (error) {
    console.error("Error loading risks:", error);
    setSavedRisks([]);
  } finally {
    setLoading(false);
  }
};


  const handleEditRisk = (riskId) => {
    history.push("/risk-assessment/add", { editRiskId: riskId });
  };

  const handleDeleteRisk = async (riskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this risk?"
    );
    if (!confirmed) return;

    const success = await riskService.deleteRisk(riskId);
    if (success) {
      setSavedRisks((prev) => prev.filter((r) => r.riskId !== riskId));
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case "Low":
        return { bgColor: "#d5f4e6", color: "#155724" };
      case "Medium":
        return { bgColor: "#fef9e7", color: "#856404" };
      case "High":
        return { bgColor: "#fdf2e9", color: "#721c24" };
      case "Critical":
        return { bgColor: "#fadbd8", color: "#721c24" };
      default:
        return { bgColor: "#e9ecef", color: "#495057" };
    }
  };

  const calculateRiskLevel = (risk) => {
    const impact = Math.max(
      parseInt(risk.confidentiality) || 0,
      parseInt(risk.integrity) || 0,
      parseInt(risk.availability) || 0
    );
    const probability = parseInt(risk.probability) || 0;
    const riskScore = impact * probability;

    if (riskScore <= 3) return "Low";
    if (riskScore <= 8) return "Medium";
    if (riskScore <= 12) return "High";
    return "Critical";
  };

  const calculateRiskScore = (risk) => {
    const impact = Math.max(
      parseInt(risk.confidentiality) || 0,
      parseInt(risk.integrity) || 0,
      parseInt(risk.availability) || 0
    );
    const probability = parseInt(risk.probability) || 0;
    return impact * probability;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const compareControls = (a, b) => {
    const aParts = a.split(".").map((p) => (isNaN(p) ? p : Number(p)));
    const bParts = b.split(".").map((p) => (isNaN(p) ? p : Number(p)));

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] ?? 0;
      const bVal = bParts[i] ?? 0;

      if (typeof aVal === "number" && typeof bVal === "number") {
        if (aVal !== bVal) return aVal - bVal;
      } else {
        const result = String(aVal).localeCompare(String(bVal));
        if (result !== 0) return result;
      }
    }
    return 0;
  };

  const getTaskAssignmentText = (risk) => {
    if (!risk.date) return null;

    const startDate = new Date(risk.date);
    const today = new Date();

    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `📅 Task starts in ${Math.abs(diffDays)} day${
        Math.abs(diffDays) !== 1 ? "s" : ""
      }`;
    }

    if (risk.numberOfDays) {
      const deadlineDate = new Date(startDate);
      deadlineDate.setDate(deadlineDate.getDate() + Number(risk.numberOfDays));
      const remaining = Math.floor(
        (deadlineDate - today) / (1000 * 60 * 60 * 24)
      );

      if (remaining >= 0) {
        return `📅 ${remaining} day${
          remaining !== 1 ? "s" : ""
        } left until deadline`;
      } else {
        return `📅 Deadline missed by ${Math.abs(remaining)} day${
          Math.abs(remaining) !== 1 ? "s" : ""
        }`;
      }
    }

    return `📅 Started ${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  const pageStyle = {
    marginTop: "80px",
    padding: "20px",
    maxWidth: "1200px",
    margin: "80px auto 0",
    overflowY: "auto",
    height: "calc(100vh - 80px)",
  };

  const headerStyle = {
    background: "white",
    borderRadius: "15px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 5px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e9ecef",
    textAlign: "center",
  };

  const backBtnStyle = {
    position: "fixed",
    top: "35px",
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

  // Responsive Styles
  const responsiveStyle = `
    @media (max-width: 1024px) {
      table {
        font-size: 14px !important;
      }
      th, td {
        padding: 12px 8px !important;
      }
      button {
        font-size: 11px !important;
        padding: 6px 12px !important;
      }
    }

    @media (max-width: 768px) {
      table {
        font-size: 12px !important;
      }
      th, td {
        padding: 10px 6px !important;
      }
      button {
        font-size: 10px !important;
        padding: 5px 10px !important;
        margin-right: 4px !important;
      }
      .risk-form {
        padding: 20px 15px !important;
      }
    }

    @media (max-width: 480px) {
      table {
        font-size: 11px !important;
      }
      th, td {
        padding: 8px 4px !important;
      }
      button {
        font-size: 9px !important;
        padding: 4px 8px !important;
        margin-right: 3px !important;
      }
      .header-style {
        padding: 20px 15px !important;
      }
    }
  `;

  if (loading) {
    return (
      <div style={{ ...pageStyle, textAlign: "center", paddingTop: "100px" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
        <h2>Loading Saved Risk Assessments...</h2>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <style>{responsiveStyle}</style>

      {/* Digital Timer */}
      <DigitalTimer />

      {/* Back to Dashboard Button */}
      <button
        style={backBtnStyle}
        onClick={() => history.push("/risk-assessment")}
        onMouseEnter={handleBackBtnMouseEnter}
        onMouseLeave={handleBackBtnMouseLeave}
      >
        ← Back to Dashboard
      </button>

      {/* Header */}
      <div style={headerStyle} className="header-style">
        <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>
          📁 Saved Risk Assessments
        </h1>
        <p style={{ color: "#7f8c8d", fontSize: "16px" }}>
          View, edit, and manage your completed risk assessments
        </p>
      </div>

      {/* Table */}
      {savedRisks.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>📋</div>
          <h2 style={{ color: "#2c3e50", marginBottom: "15px" }}>
            No Risks Assigned Yet
          </h2>
          <p style={{ color: "#7f8c8d", marginBottom: "25px" }}>
            Keep up the good work
          </p>
          <button
            onClick={() => history.push("/risk-assessment/add")}
            style={{
              background: "linear-gradient(45deg, #3498db, #2980b9)",
              color: "white",
              border: "none",
              padding: "15px 30px",
              borderRadius: "50px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            🚀 Create First Risk Assessment
          </button>
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
            marginBottom: "30px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "900px",
            }}
          >
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                <th
                  style={{
                    padding: "16px 12px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "15px",
                    border: "2px solid #dee2e6",
                    color: "#495057",
                  }}
                >
                  Risk ID
                </th>
                <th
                  style={{
                    padding: "16px 12px",
                    textAlign: "left",
                    fontWeight: "600",
                    fontSize: "15px",
                    border: "2px solid #dee2e6",
                    color: "#495057",
                  }}
                >
                  Description
                </th>
                <th
                  style={{
                    padding: "16px 12px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "15px",
                    border: "2px solid #dee2e6",
                    color: "#495057",
                  }}
                >
                  Current Risk Score
                </th>
                <th
                  style={{
                    padding: "16px 12px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "15px",
                    border: "2px solid #dee2e6",
                    color: "#495057",
                  }}
                >
                  Current Risk Level
                </th>
                <th
                  style={{
                    padding: "16px 12px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "15px",
                    border: "2px solid #dee2e6",
                    background: "#e3f2fd",
                    color: "#495057",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {savedRisks.map((risk, idx) => {
                const riskLevel = calculateRiskLevel(risk);
                const riskScore = calculateRiskScore(risk);
                const riskColors = getRiskLevelColor(riskLevel);

                return (
                  <tr
                    key={risk.riskId}
                    style={{
                      background: idx % 2 === 0 ? "#ffffff" : "#f9f9f9",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#2c3e50",
                      }}
                    >
                      {risk.riskId}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        color: "#495057",
                        maxWidth: "none",
                        overflowWrap: "break-word",
                        whiteSpace: "normal",
                        cursor: "pointer",
                        userSelect: "text",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        transition: "all 0.2s ease",
                      }}
                      title="Click to view risk details"
                      onClick={() => {
                        setSelectedRisk(risk);
                        setShowModal(true);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(52, 152, 219, 0.05)";
                        e.currentTarget.style.color = "#3498db";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#495057";
                      }}
                    >
                      <span
                        role="img"
                        aria-label="view"
                        style={{
                          fontSize: "1.2em",
                          minWidth: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        👁️
                      </span>
                      <span>{risk.riskDescription || "—"}</span>
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#2c3e50",
                        fontSize: "16px",
                      }}
                    >
                      {riskScore}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        background: riskColors.bgColor,
                        color: riskColors.color,
                        fontWeight: "600",
                        borderRadius: "6px",
                      }}
                    >
                      {riskLevel}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        background: "#f8f9fa",
                        display: "flex",
                        gap: "6px",
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRisk(risk.riskId);
                        }}
                        style={{
                          background: "linear-gradient(45deg, #3498db, #2980b9)",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-1px)";
                          e.target.style.boxShadow =
                            "0 4px 12px rgba(52, 152, 219, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRisk(risk.riskId);
                        }}
                        style={{
                          background: "transparent",
                          color: "#e74c3c",
                          border: "1px solid #e74c3c",
                          padding: "8px 16px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#e74c3c";
                          e.target.style.color = "white";
                          e.target.style.boxShadow =
                            "0 4px 12px rgba(231, 76, 60, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.color = "#e74c3c";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for View - FULLY WORKING */}
      {showModal && selectedRisk && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "40px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "transparent",
                border: "none",
                fontSize: "28px",
                cursor: "pointer",
                color: "#333",
                fontWeight: "bold",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#e74c3c";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#333";
              }}
            >
              ×
            </button>

            {/* Modal Title */}
            <h2
              style={{
                margin: "0 0 30px 0",
                color: "#2c3e50",
                fontSize: "1.5rem",
                fontWeight: "700",
                borderBottom: "2px solid #e9ecef",
                paddingBottom: "15px",
              }}
            >
              Risk Details: {selectedRisk.riskId}
            </h2>

            {/* Content Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {/* Risk Details Section */}
              <div
                style={{
                  padding: "16px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    color: "#2c3e50",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                  }}
                >
                  📋 Risk Information
                </h4>
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.8",
                    color: "#495057",
                  }}
                >
                  <p>
                    <strong>Risk Type:</strong> {selectedRisk.riskType || "—"}
                  </p>
                  <p>
                    <strong>Department:</strong>{" "}
                    {selectedRisk.department || "—"}
                  </p>
                  <p>
                    <strong>Asset Type:</strong> {selectedRisk.assetType || "—"}
                  </p>
                  <p>
                    <strong>Asset:</strong> {selectedRisk.location || "—"}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(selectedRisk.date) || "—"}
                  </p>
                </div>
              </div>

              {/* Risk Scoring Section */}
              <div
                style={{
                  padding: "16px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    color: "#2c3e50",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                  }}
                >
                  📊 Risk Scoring
                </h4>
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.8",
                    color: "#495057",
                  }}
                >
                  <p>
                    <strong>Confidentiality:</strong>{" "}
                    {selectedRisk.confidentiality || "—"}
                  </p>
                  <p>
                    <strong>Integrity:</strong> {selectedRisk.integrity || "—"}
                  </p>
                  <p>
                    <strong>Availability:</strong>{" "}
                    {selectedRisk.availability || "—"}
                  </p>
                  <p>
                      <strong>Impact:</strong>{" "}
  {Math.max(
    parseInt(selectedRisk.confidentiality) || 0,
    parseInt(selectedRisk.integrity) || 0,
    parseInt(selectedRisk.availability) || 0
  )}
</p>
<p>
                    <strong>Likelihood:</strong> {selectedRisk.probability || "—"}
                  </p>
                  <p>
                    <strong>Current Risk Score:</strong>{" "}
                    <span style={{ fontWeight: "700", color: "#e74c3c" }}>
                      {calculateRiskScore(selectedRisk)}
                    </span>
                  </p>
                  <p>
                    <strong>Current Risk Level:</strong>{" "}
                    <span
                      style={{
                        fontWeight: "700",
                        ...getRiskLevelColor(
                          calculateRiskLevel(selectedRisk)
                        ),
                        padding: "4px 8px",
                        borderRadius: "4px",
                        display: "inline-block",
                      }}
                    >
                      {calculateRiskLevel(selectedRisk)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div
              style={{
                padding: "16px",
                background: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef",
                marginBottom: "20px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px 0",
                  color: "#2c3e50",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                }}
              >
                📝 Description
              </h4>
              <p
                style={{
                  margin: 0,
                  color: "#495057",
                  lineHeight: "1.6",
                  fontSize: "14px",
                }}
              >
                {selectedRisk.riskDescription || "No description provided"}
              </p>
            </div>

            {/* Treatment Plan */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  padding: "16px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    color: "#2c3e50",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                  }}
                >
                  🛡️ Treatment Plan
                </h4>
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.8",
                    color: "#495057",
                  }}
                >
                  <p>
                    <strong>Treatment Strategy:</strong>{" "}
                    {selectedRisk.treatmentStrategy || "—"}
                  </p>
                  <p>
                    <strong>Response:</strong> {selectedRisk.riskResponse || "—"}
                  </p>
                  <p>
                    <strong>Control Reference:</strong>{" "}
                    {Array.isArray(selectedRisk.controlReference)
                      ? selectedRisk.controlReference.join(", ")
                      : selectedRisk.controlReference || "—"}
                  </p>
                  <p>
                    <strong>Number of Days:</strong>{" "}
                    {selectedRisk.numberOfDays || "—"}
                  </p>
                </div>
              </div>

              {/* Residual Risk */}
              <div
                style={{
                  padding: "16px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    color: "#2c3e50",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                  }}
                >
                  ✅ Residual Risk
                </h4>
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.8",
                    color: "#495057",
                  }}
                >
                  <p>
                    <strong>Likelihood After Treatment:</strong>{" "}
                    {selectedRisk.likelihoodAfterTreatment || "—"}
                  </p>
                  <p>
                    <strong>Impact After Treatment:</strong>{" "}
                    {selectedRisk.impactAfterTreatment || "—"}
                  </p>
                  <p>
                    <strong>Risk Owner:</strong> {selectedRisk.riskOwner || "—"}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedRisk.status || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Task Info */}
            {selectedRisk.date && (
              <div
                style={{
                  padding: "16px",
                  background: "rgba(155, 89, 182, 0.1)",
                  borderRadius: "8px",
                  border: "1px solid rgba(155, 89, 182, 0.3)",
                  marginBottom: "20px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#8e44ad",
                    fontWeight: "600",
                  }}
                >
                  {getTaskAssignmentText(selectedRisk)}
                </p>
              </div>
            )}

            {/* Controls Reference */}
            {selectedRisk.controlReference && (
              <div
                style={{
                  padding: "16px",
                  background: "rgba(230, 126, 34, 0.1)",
                  borderRadius: "8px",
                  border: "1px solid rgba(230, 126, 34, 0.3)",
                  marginBottom: "20px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#d35400",
                    fontWeight: "600",
                  }}
                >
                  🛡️ Controls:{" "}
                  {Array.isArray(selectedRisk.controlReference)
                    ? selectedRisk.controlReference.join(", ")
                    : selectedRisk.controlReference}
                </p>
              </div>
            )}

            {/* Modal Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                paddingTop: "20px",
                borderTop: "1px solid #e9ecef",
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px 24px",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#5a6268";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#6c757d";
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  handleEditRisk(selectedRisk.riskId);
                }}
                style={{
                  padding: "10px 24px",
                  background: "linear-gradient(45deg, #3498db, #2980b9)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(52, 152, 219, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                ✏️ Edit Risk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Button (Floating) */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          left: "30px",
          zIndex: 100,
        }}
      >
        <button
          onClick={() => history.push("/risk-assessment/add")}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(45deg, #27ae60, #2ecc71)",
            color: "white",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(39, 174, 96, 0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.1)";
            e.target.style.boxShadow = "0 6px 20px rgba(39, 174, 96, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 15px rgba(39, 174, 96, 0.3)";
          }}
          title="Add New Risk Assessment"
        >
          +
        </button>
      </div>

      {/* Generate SoA Button (Floating) */}
      {/* Generate SoA Button (Floating) */}
<div
  style={{
    position: "fixed",
    bottom: "30px",
    right: "30px",
    zIndex: 100,
  }}
>
  <button
    onClick={async () => {
      if (savedRisks.length === 0) {
        alert("No risks available to generate SoA ❌");
        return;
      }

      try {
        for (const risk of savedRisks) {
          if (risk.controlReference) {
            let controlRefs = [];
            if (Array.isArray(risk.controlReference)) {
              controlRefs = risk.controlReference;
            } else if (typeof risk.controlReference === "string") {
              controlRefs = risk.controlReference
                .split(",")
                .map((ref) => ref.trim())
                .filter((ref) => ref.length > 0);
            }

            const existingControls =
              await documentationService.getControls();
            const existingCategories = new Set(
              existingControls.map((c) => c.category)
            );

            controlRefs = [...new Set(controlRefs)].sort(compareControls);

            for (const ref of controlRefs) {
              if (existingCategories.has(ref)) {
                console.log(
                  `⚠️ Control ${ref} already exists, skipping`
                );
                continue;
              }

              const description =
                CONTROL_MAPPING[ref] || "No description available";

              const addedControl =
                await documentationService.addControl({
                  category: ref,
                  description,
                });

              const docRefs = DOCUMENT_MAPPING[ref] || ["N/A"];

                    for (const doc of docRefs) {
                      await documentationService.addSoAEntry({
                        controlId: addedControl.id,
                        category: addedControl.category,
                        description: addedControl.description,
                        status: "Planned",
                        documentRef: [doc], // single document per entry
                        createdAt: new Date().toISOString(),
                      });
                    }
            }
          }
        }

        // Role-based redirect
        const user = JSON.parse(sessionStorage.getItem("user"));
        const role = user?.role || "";
        if (role === "super_admin") {
          setRedirectMessage(" Redirecting to Soa Page.");
          history.push("/documentation/soa");
        } else {
          setRedirectMessage("⚠️ You do not have permission to access SoA. Redirecting to master list of documents...");
          setTimeout(() => {
            setRedirectMessage(""); // Clear after redirect
            history.push("/documentation/mld");
          }, 2000);
        }
      } catch (error) {
        console.error("Error generating SoA:", error);
        alert("⚠️ Failed to generate SoA. Check console.");
      }
    }}
    style={{
      padding: "12px 25px",
      borderRadius: "50px",
      background: "linear-gradient(45deg, #8e44ad, #9b59b6)",
      color: "white",
      border: "none",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 4px 15px rgba(155, 89, 182, 0.3)",
      transition: "all 0.3s ease",
    }}
    title="Generate Statement of Applicability"
    onMouseEnter={(e) => {
      e.target.style.transform = "scale(1.05)";
      e.target.style.boxShadow =
        "0 6px 20px rgba(155, 89, 182, 0.4)";
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = "scale(1)";
      e.target.style.boxShadow =
        "0 4px 15px rgba(155, 89, 182, 0.3)";
    }}
  >
    📄 Generate SoA
  </button>
</div>

    </div>
  );
};

export default SavedRisksPage;
