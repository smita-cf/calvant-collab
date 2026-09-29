/**
 * riskDescriptionHelper.js
 *
 * Handles both old (JSON-serialized) and new (plain text) risk descriptions.
 *
 * Old format (legacy, stored as JSON string):
 *   {"cause":"...","consequence":"...","scenario":"...","likelihood":"...","impactDescription":"..."}
 *
 * New format (plain text, sections separated by double newline):
 *   Issue: ...
 *
 *   Gap: ...
 *
 *   Risk: ...
 *
 *   Recommendation: ...
 */

/**
 * Parse a riskDescription string into a structured object.
 * Returns { issue, gap, risk, recommendation } — all strings, may be empty.
 */
export function parseRiskDescription(raw) {
  if (!raw) return {};

  // ── Try legacy JSON format ────────────────────────────────────────────────
  if (raw.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      return {
        issue: parsed.cause || "",
        gap: parsed.consequence || "",
        risk: parsed.scenario || "",
        recommendation: parsed.impactDescription || "",
        likelihood: parsed.likelihood || "",
      };
    } catch {
      // Not valid JSON — fall through to plain text parsing
    }
  }

  // ── Plain text format ─────────────────────────────────────────────────────
  const result = {};
  const sections = raw.split(/\n\n+/);
  sections.forEach((section) => {
    const line = section.trim();
    if (line.startsWith("Issue: ")) result.issue = line.replace("Issue: ", "");
    else if (line.startsWith("Gap: ")) result.gap = line.replace("Gap: ", "");
    else if (line.startsWith("Risk: "))
      result.risk = line.replace("Risk: ", "");
    else if (line.startsWith("Recommendation: "))
      result.recommendation = line.replace("Recommendation: ", "");
  });
  return result;
}

/**
 * Render a riskDescription string as a React-friendly array of labeled sections.
 * Returns an array of { label, text } objects for non-empty fields only.
 */
export function getRiskDescriptionSections(raw) {
  const parsed = parseRiskDescription(raw);
  return [
    { label: "Issue", text: parsed.issue },
    { label: "Gap", text: parsed.gap },
    { label: "Risk", text: parsed.risk },
    { label: "Recommendation", text: parsed.recommendation },
  ].filter((s) => s.text);
}
