import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import documentationService from "../services/documentationService";
import { DOCUMENT_MAPPING } from "../constants";

const ControlsPage = () => {
  const history = useHistory();
  const [controls, setControls] = useState([]);
  const [newControl, setNewControl] = useState({
    category: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const controlsPerPage = 10;

  useEffect(() => {
    loadControls();
  }, []);

  const loadControls = async () => {
    try {
      const data = await documentationService.getControls();
      setControls(data);
    } catch (error) {
      console.error("Error loading controls:", error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newControl.category || !newControl.description) return;

    try {
      const addedControl = await documentationService.addControl({
        category: newControl.category,
        description: newControl.description,
      });

      // Automatically create SoA entry
      const docRefs = DOCUMENT_MAPPING[newControl.category] || ["N/A"];

      for (const doc of docRefs) {
        await documentationService.addSoAEntry({
          controlId: addedControl.id,
          category: addedControl.category,
          description: addedControl.description,
          status: "Planned",
          documentRef: [doc], // save single document per entry
          createdAt: new Date().toISOString(),
        });
      }

      setControls([...controls, addedControl]);
      setNewControl({ category: "", description: "" });
    } catch (error) {
      console.error("Error adding control:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this control?"))
      return;

    try {
      await documentationService.deleteControl(id);
      setControls(controls.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting control:", error);
    }
  };

  // Pagination logic
  const indexOfLastControl = currentPage * controlsPerPage;
  const indexOfFirstControl = indexOfLastControl - controlsPerPage;
  const currentControls = controls.slice(
    indexOfFirstControl,
    indexOfLastControl
  );
  const totalPages = Math.ceil(controls.length / controlsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fixed "Back to Dashboard" button styles
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
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "60px auto 0" }}>
      {/* Back to Dashboard Button */}
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
        <h1 style={{ color: "#2c3e50" }}>🛡️ Control Library</h1>
        <p style={{ color: "#7f8c8d" }}>
          Browse and manage your security controls.
        </p>

        {/* Table */}
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
                Sl.No
              </th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>
                Control
              </th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>
                Description
              </th>
              <th style={{ border: "1px solid #dee2e6", padding: "10px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentControls.map((control, index) => (
              <tr key={control.id}>
                <td style={{ border: "1px solid #dee2e6", padding: "10px" }}>
                  {indexOfFirstControl + index + 1}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px" }}>
                  {control.category}
                </td>
                <td style={{ border: "1px solid #dee2e6", padding: "10px" }}>
                  {control.description}
                </td>
                <td
                  style={{
                    border: "1px solid #dee2e6",
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => handleDelete(control.id)}
                    style={{
                      padding: "5px 10px",
                      border: "none",
                      borderRadius: "6px",
                      background: "#e74c3c",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Improved Pagination controls */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "20px",
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

        {/* Add Form */}
        <form onSubmit={handleAdd} style={{ marginTop: "20px" }}>
          <input
            type="text"
            placeholder="Please Enter Control Number"
            value={newControl.category}
            onChange={(e) =>
              setNewControl({ ...newControl, category: e.target.value })
            }
            style={{
              padding: "10px",
              marginRight: "10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
          <input
            type="text"
            placeholder="Please Enter Control Description"
            value={newControl.description}
            onChange={(e) =>
              setNewControl({ ...newControl, description: e.target.value })
            }
            style={{
              padding: "10px",
              marginRight: "10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              width: "300px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 15px",
              border: "none",
              borderRadius: "6px",
              background: "#27ae60",
              color: "white",
              cursor: "pointer",
            }}
          >
            ➕ Add Control
          </button>
        </form>
      </div>
    </div>
  );
};

export default ControlsPage;
