import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import riskService from "../../riskAssesment/services/riskService";
import { FileText, FileSpreadsheet, Shield, BookOpen } from "lucide-react"; // 🔹 Added Lucide icons

const Documentation = () => {
  const history = useHistory();
  const [controlStats, setControlStats] = useState({
    total: 0,
    withControls: 0,
    withoutControls: 0,
  });




  // User and role loaded once
  const user = JSON.parse(sessionStorage.getItem("user"));
  const role = user?.role || "";







  useEffect(() => {
    loadControlStats();
  }, []);

  const loadControlStats = async () => {
    try {
      const risks = await riskService.getAllRisks();
      const withControls = risks.filter((r) => r.controlReference).length;
      const withoutControls = risks.length - withControls;

      setControlStats({
        total: risks.length,
        withControls,
        withoutControls,
      });
    } catch (error) {
      console.error("Error loading control stats:", error);
    }
  };

  // Styles
  const pageStyle = {
    marginTop: "50px",
    padding: "10px",
    maxWidth: "900px",
    margin: "50px auto 0",
  };

  const headerStyle = {
    background: "white",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "15px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e9ecef",
    textAlign: "center",
  };

  const statsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
    marginBottom: "15px",
  };

  const statCardStyle = {
    background: "white",
    padding: "12px",
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
    gap: "12px",
  };

  const actionCardStyle = {
    background: "white",
    padding: "14px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    textAlign: "center",
    border: "1px solid #e9ecef",
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  const iconStyle = { width: 36, height: 36, marginBottom: 10 };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ color: "#2c3e50", marginBottom: "8px", fontSize: "22px" }}>
          <FileText size={22} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Documentation Dashboard
        </h1>
        <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
          Generate and manage your Statement of Applicability (SoA) and control
          documentation.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={statsStyle}>
        <div
          style={{ ...statCardStyle, borderLeft: "3px solid #9b59b6" }}
          onClick={() => history.push("/documentation/soa")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <h2 style={{ color: "#9b59b6", margin: "0 0 6px 0", fontSize: "28px" }}>
            {controlStats.total}
          </h2>
          <p style={{ color: "#7f8c8d", margin: 0, fontSize: "13px", fontWeight: "600" }}>
            Total Risks
          </p>
        </div>

        <div
          style={{ ...statCardStyle, borderLeft: "3px solid #27ae60" }}
          onClick={() => history.push("/documentation/soa")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <h2 style={{ color: "#27ae60", margin: "0 0 6px 0", fontSize: "28px" }}>
            {controlStats.withControls}
          </h2>
          <p style={{ color: "#7f8c8d", margin: 0, fontSize: "13px", fontWeight: "600" }}>
            With Controls
          </p>
        </div>

        <div
          style={{ ...statCardStyle, borderLeft: "3px solid #e74c3c" }}
          onClick={() => history.push("/documentation/soa")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <h2 style={{ color: "#e74c3c", margin: "0 0 6px 0", fontSize: "28px" }}>
            {controlStats.withoutControls}
          </h2>
          <p style={{ color: "#7f8c8d", margin: 0, fontSize: "13px", fontWeight: "600" }}>
            Without Controls
          </p>
        </div>
      </div>

      {/* Quick Actions */}
<div style={actionsStyle}>
  {/* Only Super Admin Actions */}
  {role === "super_admin" && (
    <>
      {/* SoA */}
      <div
        style={{
          ...actionCardStyle,
          background: "linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)",
          color: "white",
        }}
        onClick={() => history.push("/documentation/soa")}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <FileSpreadsheet style={iconStyle} />
        <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>Generate SoA</h3>
        <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
          Automatically create Statement of Applicability from controls
        </p>
      </div>

      {/* Control Library */}
      <div
        style={{
          ...actionCardStyle,
          background: "linear-gradient(135deg, #f39c12 0%, #d35400 100%)",
          color: "white",
        }}
        onClick={() => history.push("/documentation/controls")}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <Shield style={iconStyle} />
        <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>Control Library</h3>
        <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
          Browse and manage security controls
        </p>
      </div>
    </>
  )}

  {/* Accessible to all roles */}
  <div
    style={{
      ...actionCardStyle,
      background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
      color: "white",
    }}
    onClick={() => history.push("/documentation/mld")}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
  >
    <BookOpen style={iconStyle} />
    <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>MLD</h3>
    <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
      Master List of Documents
    </p>
  </div>
</div>
    </div>
  );
};
export default Documentation;

