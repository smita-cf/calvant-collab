import React from "react";
import { useFramework, ALL_FRAMEWORKS } from "../context/FrameworkContex";

const CompactFrameworkFilter = () => {
  const {
    selectedFrameworks,
    toggleFramework,
    isAllSelected,
    availableFrameworks,
    frameworkColorMap,
  } = useFramework();

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px", fontWeight: 600 }}>
        <span>Framework Filter</span>
        <span style={{ fontSize: "11px", color: "#64748b" }}>Showing data for</span>
      </div>

      {/* Active badges */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "8px", flexWrap: "wrap" }}>
        {isAllSelected ? (
          <span style={{ padding: "2px 8px", borderRadius: "12px", background: "#f1f5f9", color: "#3b82f6", fontSize: "11px", fontWeight: 600 }}>
            All Frameworks
          </span>
        ) : (
          selectedFrameworks.map((fw) => (
            <span key={fw} style={{ padding: "2px 8px", borderRadius: "12px", background: `${frameworkColorMap[fw]}18`, color: frameworkColorMap[fw], fontSize: "11px", fontWeight: 600 }}>
              {fw}
            </span>
          ))
        )}
      </div>

      {/* Toggle buttons — fully dynamic, no hardcoded list */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {[ALL_FRAMEWORKS, ...availableFrameworks.map((f) => f.id)].map((fw) => {
          const color = frameworkColorMap[fw];
          const active = fw === ALL_FRAMEWORKS ? isAllSelected : selectedFrameworks.includes(fw);
          return (
            <button
              key={fw}
              onClick={() => toggleFramework(fw)}
              style={{
                padding: "4px 10px",
                borderRadius: "14px",
                border: `1px solid ${active ? color : "#e2e8f0"}`,
                background: active ? `${color}10` : "white",
                color: active ? color : "#64748b",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              {fw}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CompactFrameworkFilter;