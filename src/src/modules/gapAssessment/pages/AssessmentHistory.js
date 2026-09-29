import React, { useEffect, useState } from "react";
import gapService from "../services/gapService";
import { useHistory } from "react-router-dom";
import { ArrowLeft, ArrowRight, History as HistoryIcon } from "lucide-react";

const AssessmentHistory = () => {
  const [gaps, setGaps] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const gapsPerPage = 5;
  const history = useHistory();

  useEffect(() => {
    const fetchGaps = async () => {
      try {
        const data = await gapService.getGaps();
        setGaps(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGaps();
  }, []);

  const indexOfLastGap = currentPage * gapsPerPage;
  const indexOfFirstGap = indexOfLastGap - gapsPerPage;
  const currentGaps = gaps.slice(indexOfFirstGap, indexOfLastGap);
  const totalPages = Math.ceil(gaps.length / gapsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Button Styles
  const backBtnStyle = {
    position: "fixed",
    top: "35px",
    right: "30px",
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
    gap: "8px",
    zIndex: 99,
  };

  const handleBackBtnMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = "#0046a3";
    e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 70, 163, 0.5)";
    e.currentTarget.style.transform = "translateY(-2px)";
  };

  const handleBackBtnMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = "#005FCC";
    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 95, 204, 0.3)";
    e.currentTarget.style.transform = "translateY(0)";
  };

  return (
    <div style={{ marginTop: 60, padding: 15, maxWidth: 900, margin: "60px auto 0" }}>
      {/* Back Button */}
      <button
        style={backBtnStyle}
        onClick={() => history.push("/gap-assessment")}
        onMouseEnter={handleBackBtnMouseEnter}
        onMouseLeave={handleBackBtnMouseLeave}
        title="Back to Gap Assessment Dashboard"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      {/* Header */}
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
          border: "1px solid #e9ecef",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#2c3e50", fontSize: 22, display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
          <HistoryIcon size={22} /> Assessment History
        </h1>
        <p style={{ color: "#7f8c8d", fontSize: 14 }}>
          View previously reviewed documents and their final statuses.
        </p>
      </div>

      {/* Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Sl.No</th>
            <th style={thStyle}>Document Name</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Score</th>
            <th style={thStyle}>Missing Sections</th>
          </tr>
        </thead>
        <tbody>
          {currentGaps.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 12 }}>
                No assessment history found
              </td>
            </tr>
          ) : (
            currentGaps.map((gap, index) => (
              <tr key={gap.docId}>
                <td style={tdStyle}>{indexOfFirstGap + index + 1}</td>
                <td style={tdStyle}>{gap.docName || "Unnamed Document"}</td>
                <td style={tdStyle}>{gap.status}</td>
                <td style={tdStyle}>{gap.score ?? "-"}</td>
                <td style={tdStyle}>{(gap.missing_sections || []).join(", ") || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {/* Prev */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={paginationButtonStyle(currentPage === 1)}
          >
            <ArrowLeft size={16} /> Prev
          </button>

          {/* Page Numbers */}
          {[...Array(totalPages).keys()].map((num) => {
            const pageNum = num + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => paginate(pageNum)}
                disabled={isActive}
                style={pageButtonStyle(isActive)}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next */}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={paginationButtonStyle(currentPage === totalPages)}
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// Styles
const thStyle = { padding: 12, borderBottom: "1px solid #e9ecef", background: "#f8f9fa" };
const tdStyle = { padding: 12, borderBottom: "1px solid #e9ecef" };

const paginationButtonStyle = (disabled) => ({
  padding: "8px 14px",
  borderRadius: 6,
  border: "1px solid #0056b3",
  margin: "0 4px",
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: 600,
  backgroundColor: disabled ? "#e9ecef" : "white",
  color: disabled ? "#6c757d" : "#0056b3",
  userSelect: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
});

const pageButtonStyle = (isActive) => ({
  padding: "8px 14px",
  borderRadius: 6,
  border: "1px solid #0056b3",
  margin: "0 4px",
  cursor: isActive ? "default" : "pointer",
  fontWeight: 600,
  backgroundColor: isActive ? "#0056b3" : "white",
  color: isActive ? "white" : "#0056b3",
  userSelect: "none",
});

export default AssessmentHistory;
