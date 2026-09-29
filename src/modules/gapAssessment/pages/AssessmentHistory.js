import React, { useEffect, useState, useCallback } from "react";
import gapService from "../services/gapService";
import { useRouter } from "next/navigation";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { History as HistoryIcon } from "lucide-react";

const AssessmentHistory = () => {
  const {
    user,
    mounted,
    isRoot,
    isPrivilegedRole,
    isViewingManagedOrg,
    effectiveOrgId,
    effectiveOrgIds,
    selectedChildOrg,
  } = useEffectiveOrg();
  const [gaps, setGaps] = useState([]);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const router = useRouter();

  /* Window size */
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* Fetch gaps */
  const fetchGaps = useCallback(async () => {
    try {
      const data = await gapService.getGaps();

      const filtered = data.filter(
        (g) => g.organization === effectiveOrgId,
      );

      setGaps(filtered || []);
    } catch (err) {
      console.error(err);
    }
  }, [effectiveOrgId]);

  useEffect(() => {
    if (mounted) {
      fetchGaps();
    }
  }, [fetchGaps, mounted]);

  /* Group gaps by clause */
  const grouped = gaps.reduce((acc, g) => {
    if (!acc[g.clause]) acc[g.clause] = [];
    acc[g.clause].push(g);
    return acc;
  }, {});

  const extractClauseNumber = (clause) => clause.split(" ")[0];

  /* ⭐ SAME LOGIC — only renamed radarData → chartData */
  const chartData = Object.keys(grouped).map((clause) => {
    const arr = grouped[clause];

    const answered = arr.filter(
      (q) => q.docScore !== "" || q.practiceScore !== "",
    );

    const total = answered.reduce(
      (sum, x) => sum + Number(x.totalScore || 0),
      0,
    );

    const maxTotal = answered.length * 4;
    const compliance = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

    return {
      clause: extractClauseNumber(clause),
      compliance: Math.round(compliance),
    };
  });

  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width < 1024;
  const chartHeight = isMobile ? 250 : isTablet ? 400 : 450;

  return (
    <div style={container(windowSize.width)}>
      {/* Back Button */}
      <button
        style={backBtn(isMobile)}
        onClick={() => router.push("/gap-assessment")}
      >
        ← Back to Dashboard
      </button>

      {/* Header */}
      <div style={headerBox(isMobile)}>
        <h1 style={headerTitle(isMobile)}>
          <HistoryIcon size={isMobile ? 20 : 22} /> Assessment Result
        </h1>
        <p style={subText(isMobile)}>
          View previously reviewed documents and their final statuses.
        </p>
      </div>

      {/* ⭐ Line Chart replaces Radar */}
      {chartData.length > 0 && (
        <div style={chartContainer(isMobile)}>
          <h3 style={chartTitle(isMobile)}>Clause Compliance Overview</h3>

          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="clause" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="compliance"
                stroke="#005FCC"
                strokeWidth={3}
                name="Compliance %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Remarks Section */}
      <div style={remarksContainer(isMobile)}>
        {Object.keys(grouped).map((clause) => (
          <div key={clause} style={clauseBox(isMobile)}>
            <h2 style={clauseTitle(isMobile)}>{clause}</h2>

            {grouped[clause].map((item) => (
              <div key={item._id} style={remarkRow(isMobile)}>
                <div style={questionRow(isMobile)}>
                  <strong style={labelStyle}>Question:</strong>
                  <span>{item.question}</span>
                </div>
                <div style={questionRow(isMobile)}>
                  <strong style={labelStyle}>Doc Remark:</strong>
                  <span>{item.docRemarks || "-"}</span>
                </div>
                <div style={questionRow(isMobile)}>
                  <strong style={labelStyle}>Practice Remark:</strong>
                  <span>{item.practiceRemarks || "-"}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
                 <footer
  style={{
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
 background: "white",
      color: "#9ca3af",
    padding: "12px",
    textAlign: "center",
    fontSize: "13px",
    zIndex: 0,
  }}
>
  © {new Date().getFullYear()} CalVant. All rights reserved.
</footer>
    </div>
  );
};

/* ---------------- Styles ---------------- */

const container = (width) => ({
  margin: "0 auto 20px",
  padding: width < 768 ? "10px" : "15px",
  maxWidth: 900,
});

const backBtn = () => ({
  margin: "10px",
  padding: "10px 20px",
  borderRadius: 8,
  background: "#005FCC",
  border: "none",
  color: "#fff",
  cursor: "pointer",
});

const headerBox = () => ({
  background: "white",
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
  textAlign: "center",
  border: "1px solid #e9ecef",
});

const headerTitle = () => ({
  color: "#2c3e50",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
});

const subText = () => ({ color: "#7f8c8d" });

const chartContainer = () => ({
  background: "white",
  borderRadius: 12,
  padding: 20,
  border: "1px solid #e9ecef",
  marginBottom: 25,
});

const chartTitle = () => ({
  textAlign: "center",
  marginBottom: 10,
  fontSize: 18,
  fontWeight: 600,
  color: "#2c3e50",
});

const remarksContainer = () => ({ marginTop: 30 });
const clauseBox = () => ({
  background: "white",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  border: "1px solid #e9ecef",
});
const clauseTitle = () => ({ fontWeight: 700, marginBottom: 10 });
const remarkRow = () => ({
  padding: "10px 0",
  borderBottom: "1px solid #f0f0f0",
});
const questionRow = () => ({ display: "flex", gap: "8px" });
const labelStyle = { minWidth: "100px", fontWeight: 600 };

export default AssessmentHistory;
