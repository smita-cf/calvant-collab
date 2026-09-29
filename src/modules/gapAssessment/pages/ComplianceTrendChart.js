import React from "react";
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

const ComplianceTrendChart = ({ data, title = "Compliance Trend" }) => {
  if (!data || data.length === 0) return null;

  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
        border: "1px solid #e9ecef",
        marginBottom: 25,
      }}
    >
      <h3
        style={{
          textAlign: "center",
          marginBottom: 10,
          fontSize: 18,
          fontWeight: 600,
          color: "#2c3e50",
        }}
      >
        {title}
      </h3>

      <div style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="AWS" stroke="#FF9900" strokeWidth={3} />
            <Line type="monotone" dataKey="GCP" stroke="#4285F4" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComplianceTrendChart;
