import React from "react";

// ─────────────────────────────────────────────
// CUSTOM PIE CHART TOOLTIP
// ─────────────────────────────────────────────
export function CustomPieTooltip({ active, payload, total }) {
  if (active && payload && payload.length) {
    var data = payload[0].payload;
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: "10px 14px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          minWidth: 160,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: "#1e293b",
            fontSize: 13,
            marginBottom: 2,
          }}
        >
          {data.name}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#1e293b",
            marginBottom: 2,
          }}
        >
          {data.value}
        </div>
        <div style={{ fontSize: 11, color: "#64748b" }}>
          {((data.value / (total || 1)) * 100).toFixed(1)}% of total
        </div>
      </div>
    );
  }
  return null;
}

export default CustomPieTooltip;

