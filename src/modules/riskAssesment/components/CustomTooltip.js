// C:\Users\user\Downloads\CalVant-Next-main_Arghya\CalVant-Next-main\src\modules\riskAssesment\components\CustomTooltip.js

import React from 'react';

const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
  size
}) => {
  return (
    <div
      {...tooltipProps}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: "20px",
        padding: "24px",
        width: "360px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.8) inset",
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
      }}
    >
      {step.title && (
        <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: 700, color: "#0f172a", paddingRight: "24px" }}>
          {step.title}
        </h3>
      )}
      <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#475569", marginBottom: "28px" }}>
        {step.content}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Step indicator pills */}
        <div style={{ display: "flex", gap: "6px" }}>
          {Array.from({ length: size }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? "20px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: i === index ? "#3b82f6" : "#e2e8f0",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {index > 0 && (
            <button
              {...backProps}
              style={{
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#ffffff"}
            >
              Back
            </button>
          )}
          {continuous && !isLastStep && (
            <button
              {...primaryProps}
              style={{
                background: "#3b82f6",
                border: "none",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              Next
            </button>
          )}
          {isLastStep && (
            <button
              {...primaryProps}
              style={{
                background: "#10b981",
                border: "none",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              Finish
            </button>
          )}
        </div>
      </div>

      {/* Skip/Close Button */}
      <button
        {...skipProps}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "transparent",
          border: "none",
          color: "#94a3b8",
          cursor: "pointer",
          padding: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          transition: "background 0.2s, color 0.2s"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  );
};

export default CustomTooltip;
