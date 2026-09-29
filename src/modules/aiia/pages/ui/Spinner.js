import React from "react";
import { RefreshCw } from "lucide-react";

// ─────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────
export function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}
    >
      <RefreshCw
        size={22}
        color="#3b82f6"
        style={{ animation: "spin 1s linear infinite" }}
      />
      <style>
        {
          "@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }"
        }
      </style>
    </div>
  );
}

export default Spinner;

