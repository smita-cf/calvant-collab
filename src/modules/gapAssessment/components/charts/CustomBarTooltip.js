import React from "react";

// ─────────────────────────────────────────────
// CUSTOM BAR CHART TOOLTIP
// ─────────────────────────────────────────────
export function CustomBarTooltip({ active, payload }) {
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
        <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>
          {data.value}
        </div>
        <div style={{ fontSize: 11, color: "#64748b" }}>audits</div>
      </div>
    );
  }
  return null;
}

export default CustomBarTooltip;

