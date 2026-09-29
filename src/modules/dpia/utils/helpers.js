// ─────────────────────────────────────────────
// SESSION USER
// ─────────────────────────────────────────────
export function getSessionUser() {
  var raw = sessionStorage.getItem("user");
  return raw ? JSON.parse(raw) : {};
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
export function statusBadge(s) {
  if (!s) return { bg: "#f1f5f9", color: "#475569" };
  var u = s.toUpperCase();
  if (u === "COMPLETED") return { bg: "#d1fae5", color: "#065f46" };
  if (u === "IN_PROGRESS" || u === "IN PROGRESS")
    return { bg: "#dbeafe", color: "#1e40af" };
  if (u === "PLANNED") return { bg: "#fef3c7", color: "#92400e" };
  return { bg: "#f1f5f9", color: "#475569" };
}

export function severityBadge(s) {
  if (!s) return { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
  var u = s.toUpperCase();
  if (u === "HIGH")
    return { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" };
  if (u === "MEDIUM")
    return { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" };
  return { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" };
}

export function displayStatus(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace("_", " ");
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
export var inputStyle = {
  width: "100%",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 13,
  background: "#f8fafc",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export var selectStyle = Object.assign({}, inputStyle, {
  appearance: "none",
  WebkitAppearance: "none",
});

export var labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 5,
};

export var btnPrimary = {
  border: "none",
  cursor: "pointer",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 13,
  padding: "10px 22px",
  color: "#fff",
};

