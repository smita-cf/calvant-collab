import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  FilePlus2,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import gapService from "../../gapAssessment/services/gapService";

const GapAssessmentDashboard = ({ refreshTrigger }) => {
  const history = useHistory();
  const [gapStats, setGapStats] = useState({
    total: 0,
    closed: 0,
    open: 0,
  });

  useEffect(() => {
    loadGapStats();
  }, [refreshTrigger]);

  const loadGapStats = async () => {
    try {
      const gaps = await gapService.getGaps();
      const closed = gaps.filter((g) => g.status === "Closed").length;
      const open = gaps.length - closed;

      setGapStats({
        total: gaps.length,
        closed,
        open,
      });
    } catch (error) {
      console.error("Error loading gap stats:", error);
    }
  };

  // 🔹 Styles
  const pageStyle = {
    marginTop: "50px",
    padding: "10px",
    maxWidth: "900px",
    margin: "50px auto 0",
  };

  const headerStyle = {
    background: "white",
    borderRadius: "8px",
    padding: "14px",
    marginBottom: "20px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e9ecef",
    textAlign: "center",
  };

  const statsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  };

  const statCardStyle = {
    background: "white",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    textAlign: "center",
    border: "1px solid #e9ecef",
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  const actionsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  };

  const actionCardStyle = {
    background: "white",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    textAlign: "center",
    border: "1px solid #e9ecef",
    transition: "all 0.2s ease",
    cursor: "pointer",
    color: "white",
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <ShieldCheck size={24} color="#2980b9" />
          <h1 style={{ color: "#2c3e50", marginBottom: "6px", fontSize: "22px" }}>
            Gap Assessment Dashboard
          </h1>
        </div>
        <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
          Track, manage, and resolve compliance gaps across your organization
        </p>
      </div>

      {/* Stats Cards */}
      <div style={statsStyle}>
        {/* Total */}
        <div
          style={{ ...statCardStyle, borderLeft: "4px solid #2980b9" }}
          onClick={() => history.push("/gap-assessment/history")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <FileText size={28} color="#2980b9" />
          <h2 style={{ color: "#2980b9", margin: "6px 0", fontSize: "26px" }}>
            {gapStats.total}
          </h2>
          <p style={{ color: "#7f8c8d", margin: 0, fontSize: "13px", fontWeight: "600" }}>
            Total Gaps
          </p>
        </div>

        {/* Closed */}
        <div
          style={{ ...statCardStyle, borderLeft: "4px solid #27ae60" }}
          onClick={() => history.push("/gap-assessment/history?status=closed")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <CheckCircle2 size={28} color="#27ae60" />
          <h2 style={{ color: "#27ae60", margin: "6px 0", fontSize: "26px" }}>
            {gapStats.closed}
          </h2>
          <p style={{ color: "#7f8c8d", margin: 0, fontSize: "13px", fontWeight: "600" }}>
            Closed Gaps
          </p>
        </div>

        {/* Open */}
        <div
          style={{ ...statCardStyle, borderLeft: "4px solid #e74c3c" }}
          onClick={() => history.push("/gap-assessment/history?status=open")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <AlertTriangle size={28} color="#e74c3c" />
          <h2 style={{ color: "#e74c3c", margin: "6px 0", fontSize: "26px" }}>
            {gapStats.open}
          </h2>
          <p style={{ color: "#7f8c8d", margin: 0, fontSize: "13px", fontWeight: "600" }}>
            Open Gaps
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={actionsStyle}>
        <div
          style={{
            ...actionCardStyle,
            background: "linear-gradient(135deg, #16a085 0%, #1abc9c 100%)",
          }}
          onClick={() => history.push("/gap-assessment/new")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <FilePlus2 size={34} color="white" />
          <h3 style={{ margin: "8px 0 4px", fontSize: "16px", fontWeight: "600" }}>
            New Assessment
          </h3>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
            Start a new gap assessment process
          </p>
        </div>

        <div
          style={{
            ...actionCardStyle,
            background: "linear-gradient(135deg, #f39c12 0%, #d35400 100%)",
          }}
          onClick={() => history.push("/gap-assessment/history")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <FileText size={34} color="white" />
          <h3 style={{ margin: "8px 0 4px", fontSize: "16px", fontWeight: "600" }}>
            Assessment History
          </h3>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
            View past gap assessments
          </p>
        </div>
      </div>
    </div>
  );
};

export default GapAssessmentDashboard;
