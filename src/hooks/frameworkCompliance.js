// frameworkComplianceHook.js
// Drop-in hook for DashboardLoggedIn to load all 4 framework compliance stats.
// Uses the async getFrameworkCompliance from complianceData.js which merges
// both auto (localStorage) and manual (DB) data.

import { useState, useEffect } from "react";
import { getFrameworkCompliance } from "../integrations/complianceData";

const FRAMEWORKS = ["ISO27001", "ISO27701", "SOC2", "ISO42001"];

const EMPTY = { totalControls: 0, compliant: 0, partial: 0, nonCompliant: 0 };

export function useFrameworkCompliance() {
  const [data, setData] = useState({
    ISO27001: EMPTY,
    ISO27701: EMPTY,
    SOC2:     EMPTY,
    ISO42001: EMPTY,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all(
      FRAMEWORKS.map(async (fw) => {
        const result = await getFrameworkCompliance(fw);
        return [fw, result];
      })
    ).then((results) => {
      if (cancelled) return;
      const merged = {};
      results.forEach(([fw, result]) => { merged[fw] = result; });
      setData(merged);
      setLoading(false);
    }).catch((err) => {
      console.error("Framework compliance load error:", err);
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  return { frameworkComplianceData: data, loading };
}