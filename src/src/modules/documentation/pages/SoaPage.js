import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import documentationService from "../services/documentationService";
import { DOCUMENT_MAPPING } from "../constants";

const STATUS_OPTIONS = ["Implemented", "Planned", "Not Applicable"];
const JUSTIFICATION_OPTIONS = [
  "Risk Identified",
  "Regulatory Requirement",
  "Management Decision",
  "Other",
];

const SoaPage = () => {
  const history = useHistory();
  const [controls, setControls] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const controlsPerPage = 8;

  useEffect(() => {
    const fetchControls = async () => {
      try {
        const storedControls = await documentationService.getControls();
        const soaEntries = await documentationService.getSoAEntries();

        const controlsWithRefs = storedControls.map((control) => {
          // get all SoA entries for this control
          const soaEntriesForControl = soaEntries.filter(
            (e) => e.controlId === control.id
          );

          // flatten all documentRefs from all entries
          const documentRefs = soaEntriesForControl.flatMap(
            (e) => e.documentRef
          );

          return {
            ...control,
            status: soaEntriesForControl[0]?.status || "Planned", // or handle multiple statuses
            justification:
              soaEntriesForControl[0]?.justification || "Risk Identified",
            documentRef: documentRefs.length > 0 ? documentRefs : ["N/A"],
          };
        });

        setControls(controlsWithRefs);
      } catch (error) {
        console.error("Error fetching controls:", error);
      }
    };
    fetchControls();
  }, []);

  // Pagination logic
  const indexOfLastControl = currentPage * controlsPerPage;
  const indexOfFirstControl = indexOfLastControl - controlsPerPage;
  const currentControls = controls.slice(
    indexOfFirstControl,
    indexOfLastControl
  );
  const totalPages = Math.ceil(controls.length / controlsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updatedControls = controls.map((c) =>
        c.id === id ? { ...c, status: newStatus } : c
      );
      setControls(updatedControls);

      const control = updatedControls.find((c) => c.id === id);
      if (!control) return;

      const existingEntries = await documentationService.getSoAEntries();
      const existingEntry = existingEntries.find((e) => e.controlId === id);

      if (existingEntry) {
        for (const doc of control.documentRef) {
          const existingEntryForDoc = existingEntries.find(
            (e) => e.controlId === control.id && e.documentRef[0] === doc
          );

          if (existingEntryForDoc) {
            await documentationService.updateSoAEntry(existingEntryForDoc.id, {
              status: control.status,
              documentRef: [doc],
              justification: control.justification,
              updatedAt: new Date().toISOString(),
            });
          } else {
            await documentationService.addSoAEntry({
              controlId: control.id,
              category: control.category,
              description: control.description,
              status: control.status,
              documentRef: [doc],
              justification: control.justification,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch (error) {
      console.error("Error updating SoA entry:", error);
    }
  };

  const handleJustificationChange = async (id, newJustification) => {
    try {
      const updatedControls = controls.map((c) =>
        c.id === id ? { ...c, justification: newJustification } : c
      );
      setControls(updatedControls);

      const control = updatedControls.find((c) => c.id === id);
      if (!control) return;

      const existingEntries = await documentationService.getSoAEntries();
      const existingEntry = existingEntries.find((e) => e.controlId === id);

      if (existingEntry) {
        await documentationService.updateSoAEntry(existingEntry.id, {
          status: control.status,
          documentRef: control.documentRef,
          justification: newJustification,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error updating justification:", error);
    }
  };

  // Back to Dashboard button styles and handlers
  const backBtnStyle = {
    position: "fixed",
    top: "30px",
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

  // Pagination button styles
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
        marginTop: "60px",
        padding: "20px",
        maxWidth: "1000px",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <button
        style={backBtnStyle}
        onClick={() => history.push("/documentation")}
        onMouseEnter={handleBackBtnMouseEnter}
        onMouseLeave={handleBackBtnMouseLeave}
      >
        ← Back to Dashboard
      </button>

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "25px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
          border: "1px solid #e9ecef",
        }}
      >
        <h1 style={{ color: "#2c3e50" }}>
          📑 Statement of Applicability (SoA)
        </h1>
        <p style={{ color: "#7f8c8d" }}>
          Manage the status of your security controls.
        </p>

        <table
          style={{
            width: "100%",
            marginTop: "20px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa" }}>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>
                Sl.no
              </th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>
                Control
              </th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>
                Description
              </th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>
                Document Reference
              </th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>
                Justification
              </th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let rowCounter = 0; // Declare here inside an IIFE
              return currentControls.flatMap((control) =>
                control.documentRef.map((doc, docIndex) => {
                  rowCounter++;
                  return (
                    <tr key={`${control.id}-${docIndex}`}>
                      {docIndex === 0 && (
                        <>
                          <td rowSpan={control.documentRef.length}>
                            {rowCounter}
                          </td>
                          <td rowSpan={control.documentRef.length}>
                            {control.category}
                          </td>
                          <td rowSpan={control.documentRef.length}>
                            {control.description}
                          </td>
                        </>
                      )}
                      <td>{doc}</td>
                      {docIndex === 0 && (
                        <>
                          <td rowSpan={control.documentRef.length}>
                            <select
                              value={control.justification}
                              onChange={(e) =>
                                handleJustificationChange(
                                  control.id,
                                  e.target.value
                                )
                              }
                            >
                              {JUSTIFICATION_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td rowSpan={control.documentRef.length}>
                            <select
                              value={control.status}
                              onChange={(e) =>
                                handleStatusChange(control.id, e.target.value)
                              }
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              );
            })()}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "30px",
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
            >
              Next →
            </button>
          </div>
        )}

        <div
          style={{
            position: "fixed",
            bottom: "30px",
            left: "30px",
            zIndex: 100,
          }}
        >
          <button
            onClick={() => history.push("/documentation/mld")}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(45deg, #3498db, #2980b9)",
              color: "white",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(52, 152, 219, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1)";
              e.target.style.boxShadow = "0 6px 20px rgba(52, 152, 219, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 4px 15px rgba(52, 152, 219, 0.3)";
            }}
            title="Go to MLD"
          >
            MLD
          </button>
        </div>

        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: 100,
          }}
        >
          <button
            onClick={() => history.push("/risk-assessment/saved")}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(45deg, #3498db, #2980b9)",
              color: "white",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(52, 152, 219, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1)";
              e.target.style.boxShadow = "0 6px 20px rgba(52, 152, 219, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 4px 15px rgba(52, 152, 219, 0.3)";
            }}
            title="Go to MLD"
          >
            📁
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoaPage;