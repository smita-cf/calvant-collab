import React from "react";
import { ALL_FRAMEWORKS, useFramework } from "../../../context/FrameworkContex";

const FW_COLOR_MAP = {
  [ALL_FRAMEWORKS]: "#64748b",
  "ISO 27001": "#0066cc",
  "ISO 27701": "#00a3ff",
  "SOC 2":     "#ff9900",
  "ISO 42001": "#10b981",
};

const CompactFrameworkFilter = ({
  toggleFramework,
  selectedFrameworks = [],
  isAllSelected,
}) => {
  const { availableFrameworks, frameworksLoading } = useFramework();

  const allOptions = [ALL_FRAMEWORKS, ...availableFrameworks];

  return (
    <div style={{ padding: "8px 0" }}>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
          fontSize: "12px",
          color: "#1e293b",
          fontWeight: 600,
        }}
      >
        <span>Framework Filter</span>
        <div style={{ fontSize: "11px", color: "#64748b" }}>
          Showing data for
        </div>
      </div>

      {/* Active badges */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginBottom: "8px",
          flexWrap: "wrap",
        }}
      >
        {isAllSelected ? (
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "12px",
              background: "#f1f5f9",
              color: "#64748b",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            All Frameworks Selected
          </span>
        ) : (
          selectedFrameworks.map((fw) => (
            <span
              key={fw}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                padding: "2px 8px",
                borderRadius: "12px",
                background: `${FW_COLOR_MAP[fw] || "#999"}18`,
                color: FW_COLOR_MAP[fw] || "#999",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: FW_COLOR_MAP[fw] || "#999",
                }}
              />
              {fw}
            </span>
          ))
        )}
      </div>

      {/* Toggle buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {frameworksLoading ? (
          // Skeleton placeholders while fetching
          [120, 90, 70, 90, 80].map((w, i) => (
            <div
              key={i}
              style={{
                width: w,
                height: 26,
                borderRadius: 14,
                background: "#f1f5f9",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))
        ) : (
          allOptions.map((fw) => {
            const color  = FW_COLOR_MAP[fw] || "#6366f1";
            const active = fw === ALL_FRAMEWORKS
              ? isAllSelected
              : selectedFrameworks.includes(fw);

            return (
              <button
                key={fw}
                onClick={() => toggleFramework(fw)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "14px",
                  border: `1px solid ${active ? color : "#e2e8f0"}`,
                  background: active ? `${color}10` : "white",
                  color: active ? color : "#64748b",
                  fontSize: "11px",
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                title={active ? `Deselect ${fw}` : `Select ${fw}`}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: active ? color : "#e2e8f0",
                  }}
                />
                {fw}
              </button>
            );
          })
        )}
      </div>

      {/* Pulse keyframe for skeleton */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default CompactFrameworkFilter;