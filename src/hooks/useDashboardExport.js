/**
 * ─────────────────────────────────────────────────────────────────────────────
 * useDashboardExport  (v2 — export fix + comparison export)
 * ─────────────────────────────────────────────────────────────────────────────
 * FIX: exportCSV and exportSnapshot now receive the active dashboard config
 *      and only export the dataSources that config declares.
 *
 * NEW:  exportComparison — side-by-side CSV of primary vs comparison window.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf"

// ─── helpers ──────────────────────────────────────────────────────────────────

function download(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function safeNum(v) {
  if (v == null) return 0;
  if (typeof v === "object" && "$numberLong" in v) return Number(v.$numberLong);
  return Number(v) || 0;
}

/**
 * Flatten result.data into a key→value row, scoped to the allowed sources.
 * e.g. { "risks.total": 12, "risks.avgScore": 4.2, … }
 */
function flattenResult(resultData, allowedSources) {
  const row = {};
  for (const source of allowedSources) {
    const mod = resultData?.[source];
    if (!mod || typeof mod !== "object") continue;
    flattenObject(mod, source, row);
  }
  return row;
}

function flattenObject(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const key = `${prefix}.${k}`;
    if (v != null && typeof v === "object" && !Array.isArray(v) && !("$numberLong" in v)) {
      flattenObject(v, key, out);
    } else {
      out[key] = safeNum(v);
    }
  }
}

/**
 * Build CSV from an array of flat-row objects.
 * All keys across all rows become columns.
 */
function rowsToCSV(rows) {
  if (!rows.length) return "";
  const allKeys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const header = allKeys.join(",");
  const body = rows
    .map((r) =>
      allKeys.map((k) => {
        const v = r[k] ?? "";
        return typeof v === "string" && v.includes(",") ? `"${v}"` : v;
      }).join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}

// ─── allowed sources from config ─────────────────────────────────────────────

function getAllowedSources(config, result) {
  // Prefer explicit dataSources from the config; fall back to all keys in data
  if (config?.dataSources?.length) return config.dataSources;
  return Object.keys(result?.data ?? {});
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useDashboardExport({
  config,
  results,
  comparisonResults = [],
}) {
  const latestResult = results?.[0] ?? null;
  const latestComparison = comparisonResults?.[0] ?? null;

  // ── Config JSON ──────────────────────────────────────────────────────────
  const exportConfig = useCallback(() => {
    const payload = JSON.stringify(config ?? {}, null, 2);
    download(
      `calvant-dashboard-config-${config?.id ?? "unknown"}.json`,
      payload,
      "application/json"
    );
  }, [config]);

  // ── Snapshot JSON (only selected dataSources) ────────────────────────────
  const exportSnapshot = useCallback(() => {
    if (!latestResult) return;
    const allowed = getAllowedSources(config, latestResult);
    const scoped = Object.fromEntries(
      Object.entries(latestResult.data ?? {}).filter(([k]) =>
        allowed.includes(k)
      )
    );
    const payload = JSON.stringify(
      {
        reportId: latestResult.reportId,
        generatedAt: latestResult.generatedAt,
        dashboardId: config?.id,
        data: scoped,
      },
      null,
      2
    );
    download(
      `calvant-snapshot-${config?.id ?? "data"}-${Date.now()}.json`,
      payload,
      "application/json"
    );
  }, [config, latestResult]);

  // ── CSV (only selected dataSources) ─────────────────────────────────────
  const exportCSV = useCallback(() => {
    const series = latestResult?._series ?? [];
    if (!series.length) return;

    const allowed = getAllowedSources(config, latestResult);

    const rows = series.map((entry) => ({
      generatedAt: entry.generatedAt ?? "",
      ...flattenResult(entry.data, allowed),
    }));

    download(
      `calvant-data-${config?.id ?? "export"}-${Date.now()}.csv`,
      rowsToCSV(rows),
      "text/csv"
    );
  }, [config, latestResult]);

  // ── Comparison CSV (primary vs comparison, side-by-side) ─────────────────
  const exportComparison = useCallback(() => {
    if (!latestResult) return;
    const allowed = getAllowedSources(config, latestResult);

    const primaryRow = {
      period: "Primary",
      generatedAt: latestResult.generatedAt ?? "",
      ...flattenResult(latestResult.data, allowed),
    };

    const rows = [primaryRow];

    if (latestComparison) {
      rows.push({
        period: "Comparison",
        generatedAt: latestComparison.generatedAt ?? "",
        ...flattenResult(latestComparison.data, allowed),
      });
    }

    download(
      `calvant-comparison-${config?.id ?? "export"}-${Date.now()}.csv`,
      rowsToCSV(rows),
      "text/csv"
    );
  }, [config, latestResult, latestComparison]);

  // ── PDF (screenshot of DOM ref) ──────────────────────────────────────────
  const exportPDF = useCallback(async (exportAreaRef) => {
    if (!exportAreaRef?.current) return;
    try {
      const canvas = await html2canvas(exportAreaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f8fafc",
      });
      const imgData = canvas.toDataURL("image/png");

      // jsPDF via CDN — import dynamically to keep the bundle lean
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`calvant-dashboard-${config?.id ?? "report"}-${Date.now()}.pdf`);
    } catch (err) {
      console.error("[exportPDF]", err);
    }
  }, [config]);

  return { exportConfig, exportSnapshot, exportCSV, exportComparison, exportPDF };
}