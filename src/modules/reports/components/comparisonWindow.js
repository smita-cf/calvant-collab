/**
 * ─────────────────────────────────────────────────────────────────────────────
 * comparisonWindow.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for turning a Comparison Period preset
 * ("Previous Period" / "Previous Relative Period" / "Same Period Last Year" /
 * "Custom") into a concrete { from, to } date window.
 *
 * IMPORTANT: this must be called at READ time (on every render / data fetch),
 * not once at Save time. The three relative presets are defined relative to
 * "today" — if you resolve them once and persist the resulting dates on the
 * panel, they silently go stale the moment a day passes without the panel
 * being re-saved (see PanelBuilderModal / DashboardEngine history for the
 * bug this fixed). Only "custom" is a genuinely fixed, user-picked range and
 * is safe to persist as concrete from/to.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Approximate day-span per granularity — used to size the comparison
// baseline window (e.g. a monthly KPI's "Previous Period" looks ~30 days
// back). Mirrors the KPI Duration granularity vocabulary (day/week/month/year).
export const GRANULARITY_DAYS = { day: 1, week: 7, month: 30, year: 365 };

/** Look up the day-span for a panel's own KPI Duration granularity. */
export function getDurationDaysForPanel(panel) {
  const granularity = panel?.duration?.granularity ?? "day";
  return GRANULARITY_DAYS[granularity] ?? 7;
}

/**
 * Format a {from, to} ISO date pair into a short, human-readable range for
 * display next to a KPI's comparison delta — e.g. "23 Jun – 30 Jun" or
 * "23 Jun 2025 – 30 Jun 2025" when the range falls outside the current year.
 * This is what actually makes the comparison legible to an end user: instead
 * of an unexplained "vs comparison" figure, they see the exact window it
 * came from.
 */
export function formatComparisonRange(from, to) {
  if (!from || !to) return "";
  try {
    const f = new Date(from);
    const t = new Date(to);
    const currentYear = new Date().getFullYear();
    const needsYear = f.getFullYear() !== currentYear || t.getFullYear() !== currentYear || f.getFullYear() !== t.getFullYear();
    const opts = needsYear
      ? { day: "2-digit", month: "short", year: "numeric" }
      : { day: "2-digit", month: "short" };
    return `${f.toLocaleDateString("en-GB", opts)} – ${t.toLocaleDateString("en-GB", opts)}`;
  } catch {
    return "";
  }
}

/**
 * Resolve a comparison config into a concrete { from, to } window, computed
 * against the CURRENT date. Safe to call on every render — it does not
 * mutate or depend on any previously-resolved dates.
 *
 * @param {{ compareTo?: string, from?: string, to?: string }} comparison
 * @param {number} durationDays - day-span for the panel's own duration/groupBy granularity
 */
export function resolveComparisonWindow(comparison, durationDays = 7) {
  if (!comparison || comparison.compareTo === "custom" || !comparison.compareTo) {
    // Custom is the one preset that's genuinely fixed — trust the stored dates.
    return { from: comparison?.from, to: comparison?.to };
  }

  const today = new Date();
  const days = durationDays || 7;

  if (comparison.compareTo === "same_period_last_year") {
    const from = new Date(today); from.setFullYear(from.getFullYear() - 1); from.setDate(from.getDate() - days);
    const to = new Date(today); to.setFullYear(to.getFullYear() - 1);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
  }

  if (comparison.compareTo === "previous_relative_period") {
    // Same calendar period one cycle back (e.g. last month)
    const from = new Date(today); from.setMonth(from.getMonth() - 1); from.setDate(from.getDate() - days);
    const to = new Date(today); to.setMonth(to.getMonth() - 1);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
  }

  // previous_period — the window immediately preceding the current lookback window
  const from = new Date(today); from.setDate(from.getDate() - days * 2);
  const to = new Date(today); to.setDate(to.getDate() - days);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}