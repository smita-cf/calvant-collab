import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import riskService from "../services/riskService";
import { getDepartments } from "../../departments/services/userService";
import {
  BarChart3,
  FileText,
  PlusCircle,
  CheckCircle,
  FolderOpen,
} from "lucide-react";

const RiskAssessment = () => {
  const history = useHistory();

  const [user] = useState(() => JSON.parse(sessionStorage.getItem("user")));

  const [riskStats, setRiskStats] = useState({
    total: 0,
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
    open: 0,
    closed: 0,
  });

  const [departmentName, setDepartmentName] = useState("");

  useEffect(() => {
    if (!user) {
      history.push("/");
    }
  }, [user, history]);

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

  const loadRiskStats = useCallback(async () => {
    if (!user) return;
    try {
      const risks = await riskService.getAllRisks();
      if (!Array.isArray(risks)) return;

      const departments = await getDepartments();
      const deptName = departments.find(
        (d) => d.id === user.departmentId
      )?.name;
      if (!deptName) return;

      const departmentRisks = risks.filter(
        (risk) => risk.department === user.department?.name
      );
      
      const stats = departmentRisks.reduce(
        (acc, risk) => {
          acc.total++;
          const level = calculateRiskLevel(risk);
          acc[level.toLowerCase()]++;
          if (risk.status === "Active") acc.open++;
          else acc.closed++;
          return acc;
        },
        {
          total: 0,
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
          open: 0,
          closed: 0,
        }
      );

      setRiskStats(stats);
      setDepartmentName(deptName);
    } catch (error) {
      console.error("Error loading risk stats:", error);
    }
  }, [user]);

  useEffect(() => {
    loadRiskStats();
  }, [loadRiskStats]);

  if (!user) return null;

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

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ color: "#2c3e50", marginBottom: "8px", fontSize: "22px" }}>
          <BarChart3 size={24} style={{ marginRight: "8px" }} />
          Risk Management Dashboard
        </h1>
        <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
          Identify, Manage, and Treat Risk.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={statsStyle}>
        <div
          style={{ ...statCardStyle, borderLeft: "3px solid #3498db" }}
          onClick={() => history.push("/risk-assessment/saved")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{ color: "#3498db", margin: "0 0 6px 0", fontSize: "28px" }}
          >
            {riskStats.total}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Total Risks
          </p>
        </div>
        <div
          style={{ ...statCardStyle, borderLeft: "3px solid #27ae60" }}
          onClick={() => history.push("/risk-assessment/saved")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{ color: "#27ae60", margin: "0 0 6px 0", fontSize: "28px" }}
          >
            {riskStats.low}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Low Risk
          </p>
        </div>
        <div
          style={{ ...statCardStyle, borderLeft: "3px solid #f39c12" }}
          onClick={() => history.push("/risk-assessment/saved")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{ color: "#f39c12", margin: "0 0 6px 0", fontSize: "28px" }}
          >
            {riskStats.medium}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Medium Risk
          </p>
        </div>
        <div
          style={{ ...statCardStyle, borderLeft: "3px solid #e74c3c" }}
          onClick={() => history.push("/risk-assessment/saved")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{ color: "#e74c3c", margin: "0 0 6px 0", fontSize: "28px" }}
          >
            {riskStats.high + riskStats.critical}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            High Risk
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={actionsStyle}>
        <div
          style={actionCardStyle}
          onClick={() => history.push("/risk-assessment/templates")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-3px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <FileText size={32} style={{ marginBottom: "10px", color: "#3498db" }} />
          <h3
            style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#2c3e50" }}
          >
            Sample Risks
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#7f8c8d" }}>
            Choose your Risk from This Repository
          </p>
        </div>

        <div
          style={{
            ...actionCardStyle,
            background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
            color: "white",
          }}
          onClick={() => history.push("/risk-assessment/add")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-3px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <PlusCircle size={32} style={{ marginBottom: "10px" }} />
          <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>Add New Risk</h3>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
            Identify a New Risk
          </p>
        </div>

        <div
          style={actionCardStyle}
          onClick={() => history.push("/risk-assessment/my-tasks")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-3px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <CheckCircle size={32} style={{ marginBottom: "10px", color: "#2ecc71" }} />
          <h3
            style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#2c3e50" }}
          >
            My Tasks
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#7f8c8d" }}>
            View Tasks Assigned to You
          </p>
        </div>

        {(user.role === "risk_owner" || user.role === "risk_manager" ||user.role === "super_admin") && (
          <div
            style={actionCardStyle}
            onClick={() => history.push("/risk-assessment/saved")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-3px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <FolderOpen size={32} style={{ marginBottom: "10px", color: "#2c3e50" }} />
            <h3
              style={{
                margin: "0 0 6px 0",
                fontSize: "16px",
                color: "#2c3e50",
              }}
            >
              View Saved Risks
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#7f8c8d" }}>
              View Identified Risk for your Department
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAssessment;
