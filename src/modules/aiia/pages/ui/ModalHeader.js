import React from "react";
import { X } from "lucide-react";

// ─────────────────────────────────────────────
// MODAL HEADER
// ─────────────────────────────────────────────
export function ModalHeader(props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 28px 16px",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <div>
        <h2
          style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "#1e293b" }}
        >
          {props.title}
        </h2>
        {props.subtitle && (
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
            {props.subtitle}
          </p>
        )}
      </div>
      <button
        onClick={props.onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 6,
          borderRadius: 8,
        }}
      >
        <X size={20} color="#94a3b8" />
      </button>
    </div>
  );
}

export default ModalHeader;

