"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "./SessionContext";
import { captureActivity, ACTIONS } from "../services/activities";
import { fetchFrameworks } from "./frameworkService";

export const ALL_FRAMEWORKS = "ALL Frameworks";

// Single place to define color + path per framework id.
// If your API already returns color/path, delete this and use API data directly.

const DEFAULT_META = { color: "#64748b", path: "/" };

const normalizeFw = (s) => (s ? String(typeof s === "object" ? s.id || s.code || s.name || "" : s).toUpperCase().replace(/[\s\-_]/g, "") : "");

const DPIA_NORMS = new Set(["ISO27701", "SOC2", "KSAPDPL", "GDPR", "DPDPA", "HIPAA"]);
const AIIA_NORMS = new Set(["ISO42001", "EUAIACT"]);

export const MODULE_FRAMEWORK_SUPPORT = {
  dpia: new Set(["ISO 27701", "ISO27701", "SOC 2", "SOC2", "KSA PDPL", "KSA_PDPL", "KSAPDPL", "GDPR", "DPDPA"]),
  aiia: new Set(["ISO 42001", "ISO42001", "EU AI Act", "EUAIACT"]),
};

// FrameworkContext.jsx

export const computeModuleVisibility = (
  selectedFrameworks,
  availableFrameworks = [],
) => {
  // Resolve the actual list to check against
  const rawList = selectedFrameworks.includes(ALL_FRAMEWORKS)
    ? availableFrameworks.map((fw) => fw.id || fw.code || fw.name || fw)
    : selectedFrameworks;

  const normalizedToCheck = rawList.map(normalizeFw);

  const showDpia = normalizedToCheck.some((fw) => DPIA_NORMS.has(fw));
  const showAiia = normalizedToCheck.some((fw) => AIIA_NORMS.has(fw));

  return { showDpia, showAiia };
};

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem("selectedFrameworks");
    if (!raw) return [ALL_FRAMEWORKS];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // ignore
  }
  return [ALL_FRAMEWORKS];
};

const FrameworkContext = createContext();

export const FrameworkProvider = ({ children }) => {
  const [availableFrameworks, setAvailableFrameworks] = useState([]);
  const [frameworksLoading, setFrameworksLoading] = useState(true);
  const [selectedFrameworks, setSelectedFrameworks] = useState(loadFromStorage);

  const frameworkColorMap = React.useMemo(
    () => ({
      [ALL_FRAMEWORKS]: "#64748b",
      ...Object.fromEntries(availableFrameworks.map((fw) => [fw.id, fw.color])),
    }),
    [availableFrameworks],
  );
  const { isAuthenticated } = useSession();
  useEffect(() => {
    if (!isAuthenticated) {
      setAvailableFrameworks([]);
      setFrameworksLoading(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return; // wait until logged in

    setFrameworksLoading(true);

    fetchFrameworks()
      .then((frameworks) => {
        setAvailableFrameworks(frameworks);
      })
      .catch((err) => {
        console.error("[FrameworkContext] Failed to load frameworks:", err);
        setAvailableFrameworks([]); // API is source of truth; no static fallback needed
      })
      .finally(() => setFrameworksLoading(false));
  }, [isAuthenticated]); // ← re-runs when auth state changes

  useEffect(() => {
    localStorage.setItem(
      "selectedFrameworks",
      JSON.stringify(selectedFrameworks),
    );
  }, [selectedFrameworks]);

  const toggleFramework = (framework) => {
    if (framework === ALL_FRAMEWORKS) {
      captureActivity({
        action: ACTIONS.SELECT,
        url: typeof window !== "undefined" ? window.pathname : "/",
        item: [{ frameworkFilter: "All Frameworks" }],
      });
      setSelectedFrameworks([ALL_FRAMEWORKS]);
      return;
    }

    setSelectedFrameworks((prev) => {
      let next;
      if (prev.includes(ALL_FRAMEWORKS)) {
        next = [framework];
      } else {
        const isSelected = prev.includes(framework);
        next = isSelected
          ? prev.filter((f) => f !== framework)
          : [...prev, framework];
        if (next.length === 0) next = [ALL_FRAMEWORKS];
        const allSelected = availableFrameworks.every((f) => next.includes(f));
        if (allSelected) next = [ALL_FRAMEWORKS];
      }
      captureActivity({
        action: ACTIONS.SELECT,
        url: typeof window !== "undefined" ? window.pathname : "/",
        item: [
          {
            frameworkFilter: next.includes(ALL_FRAMEWORKS)
              ? "All Frameworks"
              : next.join(", "),
          },
        ],
      });
      return next;
    });
  };

  const isFrameworkActive = (fw) => {
    if (fw === ALL_FRAMEWORKS)
      return selectedFrameworks.includes(ALL_FRAMEWORKS);
    if (selectedFrameworks.includes(ALL_FRAMEWORKS)) return true;
    return selectedFrameworks.includes(fw);
  };

  const isAllSelected = selectedFrameworks.includes(ALL_FRAMEWORKS);

  // Backward-compat shim
  const selectedFramework = isAllSelected
    ? ALL_FRAMEWORKS
    : selectedFrameworks.join(", ");

  const setSelectedFramework = (fw) => {
    setSelectedFrameworks(fw === ALL_FRAMEWORKS ? [ALL_FRAMEWORKS] : [fw]);
  };

  const moduleVisibility = computeModuleVisibility(
    selectedFrameworks,
    availableFrameworks,
  );

  return (
    <FrameworkContext.Provider
      value={{
        availableFrameworks, // ← replaces the old AVAILABLE_FRAMEWORKS export
        frameworkColorMap,
        frameworksLoading,
        selectedFrameworks,
        toggleFramework,
        isFrameworkActive,
        isAllSelected,
        selectedFramework,
        setSelectedFramework,
        showDpia: moduleVisibility.showDpia,
        showAiia: moduleVisibility.showAiia,
      }}
    >
      {children}
    </FrameworkContext.Provider>
  );
};

export const useFramework = () => useContext(FrameworkContext);
