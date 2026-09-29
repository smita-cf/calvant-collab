// frameworkMappings.js
// Fetches mappings from your backend

// ════════════════════════════════════════════════════════════════════════════
// API ENDPOINT
// ════════════════════════════════════════════════════════════════════════════

const MAPPINGS_API = "https://api.calvant.com/framework/api/mappings/framework";

/**
 * Get SOC2 controls that map to a specific ISO27001 control
 */
export async function getSOC2ControlsForISO27001(isoControl) {
  if (!isoControl) return [];

  try {
    const response = await fetch(`${MAPPINGS_API}/SOC2/ISO27001`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      console.warn(
        `ISO27001 mappings fetch failed: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const mappings = await response.json();
    const filtered = mappings.filter(
      (m) =>
        m.targetControlCode === isoControl && m.sourceFrameworkCode === "SOC2",
    );
    const soc2Codes = new Set(filtered.map((m) => m.sourceControlCode));
    return Array.from(soc2Codes).sort();
  } catch (error) {
    console.error(
      `Error fetching SOC2 controls for ISO27001 ${isoControl}:`,
      error,
    );
    return [];
  }
}

/**
 * Get SOC2 controls that map to a specific ISO27701 control
 */
export async function getSOC2ControlsForISO27701(isoControl) {
  if (!isoControl) return [];

  try {
    const response = await fetch(`${MAPPINGS_API}/SOC2/ISO27701`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      console.warn(
        `ISO27701 mappings fetch failed: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const mappings = await response.json();
    const filtered = mappings.filter(
      (m) =>
        m.targetControlCode === isoControl && m.sourceFrameworkCode === "SOC2",
    );
    const soc2Codes = new Set(filtered.map((m) => m.sourceControlCode));
    return Array.from(soc2Codes).sort();
  } catch (error) {
    console.error(
      `Error fetching SOC2 controls for ISO27701 ${isoControl}:`,
      error,
    );
    return [];
  }
}

/**
 * Get all ISO27001 controls that a SOC2 control maps to
 */
export async function getISO27001ControlsForSOC2(soc2Control) {
  if (!soc2Control) return [];

  try {
    const response = await fetch(`${MAPPINGS_API}/SOC2/ISO27001`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      console.warn(
        `ISO27001 mappings fetch failed: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const mappings = await response.json();
    const filtered = mappings.filter(
      (m) =>
        m.sourceControlCode === soc2Control && m.sourceFrameworkCode === "SOC2",
    );
    const iso27001Codes = new Set(filtered.map((m) => m.targetControlCode));
    return Array.from(iso27001Codes).sort();
  } catch (error) {
    console.error(
      `Error fetching ISO27001 controls for SOC2 ${soc2Control}:`,
      error,
    );
    return [];
  }
}

/**
 * Get all ISO27701 controls that a SOC2 control maps to
 */
export async function getISO27701ControlsForSOC2(soc2Control) {
  if (!soc2Control) return [];

  try {
    const response = await fetch(`${MAPPINGS_API}/SOC2/ISO27701`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      console.warn(
        `ISO27701 mappings fetch failed: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const mappings = await response.json();
    const filtered = mappings.filter(
      (m) =>
        m.sourceControlCode === soc2Control && m.sourceFrameworkCode === "SOC2",
    );
    const iso27701Codes = new Set(filtered.map((m) => m.targetControlCode));
    return Array.from(iso27701Codes).sort();
  } catch (error) {
    console.error(
      `Error fetching ISO27701 controls for SOC2 ${soc2Control}:`,
      error,
    );
    return [];
  }
}

/**
 * Get all mappings between two frameworks
 */
export async function getFrameworkToFrameworkMappings(
  sourceFramework,
  targetFramework,
) {
  if (!sourceFramework || !targetFramework) return [];

  try {
    const response = await fetch(
      `${MAPPINGS_API}/${sourceFramework}/${targetFramework}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      },
    );

    if (!response.ok) {
      console.warn(
        `Mappings fetch failed: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching mappings between ${sourceFramework} and ${targetFramework}:`,
      error,
    );
    return [];
  }
}

/**
 * Get auto-selected SOC2 controls based on user's ISO selection.
 * Fetches mappings from backend for each selected ISO control.
 * @param {string} framework - "iso27001" or "iso27701"
 * @param {Array} selectedISOControls - Array of ISO control codes
 * @returns {Promise<Array>} Array of unique auto-selected SOC2 control codes
 */
export async function getAutoSelectedSOC2Controls(
  framework,
  selectedISOControls,
) {
  if (!selectedISOControls || selectedISOControls.length === 0) return [];

  try {
    const autoSelected = new Set();

    const promises = selectedISOControls.map((isoControl) => {
      const getFn =
        framework === "iso27701"
          ? getSOC2ControlsForISO27701
          : getSOC2ControlsForISO27001;
      return getFn(isoControl);
    });

    const results = await Promise.all(promises);

    results.forEach((soc2Controls) => {
      if (Array.isArray(soc2Controls)) {
        soc2Controls.forEach((soc2) => autoSelected.add(soc2));
      }
    });

    return Array.from(autoSelected).sort();
  } catch (error) {
    console.error("Error getting auto-selected SOC2 controls:", error);
    return [];
  }
}

/**
 * Get auto-selected KSA_PDPL controls based on user's ISO selection.
 * Mirrors getAutoSelectedSOC2Controls but uses PDPL mapping helpers.
 * @param {string} framework - "iso27001" or "iso27701"
 * @param {Array} selectedISOControls - Array of ISO control codes
 * @returns {Promise<Array>} Array of unique auto-selected KSA_PDPL control codes
 */
export async function getAutoSelectedPDPLControls(
  framework,
  selectedISOControls,
) {
  if (!selectedISOControls || selectedISOControls.length === 0) return [];

  try {
    const autoSelected = new Set();

    const promises = selectedISOControls.map((isoControl) => {
      const getFn =
        framework === "iso27701"
          ? getKSAPDPLControlsForISO27701
          : getKSAPDPLControlsForISO27001;
      return getFn(isoControl);
    });

    const results = await Promise.all(promises);

    results.forEach((pdplControls) => {
      if (Array.isArray(pdplControls)) {
        pdplControls.forEach((code) => autoSelected.add(code));
      }
    });

    return Array.from(autoSelected).sort();
  } catch (error) {
    console.error("Error getting auto-selected KSA_PDPL controls:", error);
    return [];
  }
}

/**
 * Get mapping details between ISO and SOC2
 */
export async function getMappingDetails(isoControl, framework) {
  if (!isoControl || !framework) return [];

  try {
    const response = await fetch(`${MAPPINGS_API}/SOC2/${framework}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    if (!response.ok) return [];

    const mappings = await response.json();
    return mappings.filter((m) => m.targetControlCode === isoControl);
  } catch (error) {
    console.error(`Error fetching mapping details for ${isoControl}:`, error);
    return [];
  }
}

/**
 * Cache layer — stores fetched mappings to reduce backend calls
 */
const mappingCache = new Map();

async function getCachedMappings(cacheKey, fetchFn) {
  if (mappingCache.has(cacheKey)) {
    return mappingCache.get(cacheKey);
  }
  const result = await fetchFn();
  mappingCache.set(cacheKey, result);
  return result;
}

/**
 * Clear mapping cache
 */
export function clearMappingCache() {
  mappingCache.clear();
  console.log("Mapping cache cleared");
}

/**
 * Preload mappings for a list of ISO controls.
 * Reduces latency by fetching multiple at once.
 * @param {string} framework - "iso27001" or "iso27701"
 * @param {Array} isoControls - Array of ISO control codes
 */
export async function preloadMappings(framework, isoControls) {
  if (!isoControls || isoControls.length === 0) return;

  try {
    const promises = isoControls.map((isoControl) => {
      const getFn =
        framework === "iso27701"
          ? getSOC2ControlsForISO27701
          : getSOC2ControlsForISO27001;
      return getCachedMappings(`${framework}:${isoControl}`, () =>
        getFn(isoControl),
      );
    });

    await Promise.all(promises);
    console.log(
      `Preloaded mappings for ${isoControls.length} ${framework} controls`,
    );
  } catch (error) {
    console.error("Error preloading mappings:", error);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// KSA_PDPL MAPPINGS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get KSA_PDPL controls that map to a specific ISO27001 control
 */
export async function getKSAPDPLControlsForISO27001(isoControl) {
  if (!isoControl) return [];
  try {
    const response = await fetch(`${MAPPINGS_API}/KSA_PDPL/ISO27001`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    if (!response.ok) return [];
    const mappings = await response.json();
    const codes = new Set(
      mappings
        .filter((m) => m.targetControlCode === isoControl)
        .map((m) => m.sourceControlCode),
    );
    return Array.from(codes).sort();
  } catch (err) {
    console.error(
      `Error fetching KSA_PDPL controls for ISO27001 ${isoControl}:`,
      err,
    );
    return [];
  }
}

/**
 * Get KSA_PDPL controls that map to a specific ISO27701 control
 */
export async function getKSAPDPLControlsForISO27701(isoControl) {
  if (!isoControl) return [];
  try {
    const response = await fetch(`${MAPPINGS_API}/KSA_PDPL/ISO27701`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    if (!response.ok) return [];
    const mappings = await response.json();
    const codes = new Set(
      mappings
        .filter((m) => m.targetControlCode === isoControl)
        .map((m) => m.sourceControlCode),
    );
    return Array.from(codes).sort();
  } catch (err) {
    console.error(
      `Error fetching KSA_PDPL controls for ISO27701 ${isoControl}:`,
      err,
    );
    return [];
  }
}

/**
 * Get all ISO/SOC2 controls that a KSA_PDPL article maps to
 */
export async function getMappingsForKSAPDPL(pdplArticle, targetFramework) {
  if (!pdplArticle || !targetFramework) return [];
  try {
    const response = await fetch(
      `${MAPPINGS_API}/KSA_PDPL/${targetFramework}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      },
    );
    if (!response.ok) return [];
    const mappings = await response.json();
    const codes = new Set(
      mappings
        .filter((m) => m.sourceControlCode === pdplArticle)
        .map((m) => m.targetControlCode),
    );
    return Array.from(codes).sort();
  } catch (err) {
    console.error(
      `Error fetching ${targetFramework} controls for KSA_PDPL ${pdplArticle}:`,
      err,
    );
    return [];
  }
}

// ════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Generic function to get auto-selected controls for a framework based on mapping sources.
 * @param {string} targetFrameworkCode - The framework we want to auto-select controls in (e.g. SOC2, GDPR)
 * @param {Array} mappingSources - Array of framework codes it maps from (e.g. ["ISO27001"])
 * @param {Object} selectedControlsMap - Object mapping source framework codes to arrays of selected control codes
 */
export async function getAutoSelectedControlsForFramework(
  targetFrameworkCode,
  mappingSources,
  selectedControlsMap,
  options = {},
) {
  const autoSelected = new Set();

  if (!targetFrameworkCode || !mappingSources || !selectedControlsMap) {
    return [];
  }

  const TARGET = targetFrameworkCode.toUpperCase();

  // ✅ CONFIG-DRIVEN (no hidden hardcoding in logic)
  const DRIVER_FRAMEWORKS = options.driverFrameworks || [];
  const MAPPED_FRAMEWORKS = options.mappedFrameworks || [];

  const normalizeCode = (c) => {
    const s = String(c || "").trim();
    const articleMatch = s.match(/^article[-\s]?(\d+)/i);
    if (articleMatch) return articleMatch[1].toUpperCase();
    return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
  };

  try {
    const promises = mappingSources.map(async (sourceFw) => {
      if (!sourceFw) return [];

      const SOURCE = sourceFw.toUpperCase();

      // ✅ FIX 1: Prevent circular mapping
      if (SOURCE === TARGET) return [];

      // ✅ FIX 2: Only allow valid mapping sources
      if (!mappingSources.includes(sourceFw)) return [];

      // ✅ FIX 3: Only allow driver frameworks
      if (!DRIVER_FRAMEWORKS.includes(SOURCE)) return [];

      // ✅ FIX 6: Prevent mapping from mapped frameworks (avoid loops)
      if (MAPPED_FRAMEWORKS.includes(SOURCE)) return [];

      const selectedCodes = selectedControlsMap[sourceFw];
      if (!selectedCodes || selectedCodes.length === 0) return [];

      const selectedSet = new Set(selectedCodes.map(normalizeCode));

      try {
        const mappings = await getCachedMappings(`${SOURCE}:${TARGET}`, () =>
          getFrameworkToFrameworkMappings(SOURCE, TARGET),
        );

        if (!Array.isArray(mappings)) return [];

        const matched = new Set();

        mappings.forEach((m) => {
          const srcFw = String(m.sourceFrameworkCode || SOURCE).toUpperCase();
          const tgtFw = String(m.targetFrameworkCode || TARGET).toUpperCase();

          // ✅ STRICT matching only (FIX 4)
          if (srcFw === SOURCE && tgtFw === TARGET) {
            const srcCode = normalizeCode(m.sourceControlCode);
            if (selectedSet.has(srcCode)) {
              matched.add(m.targetControlCode);
            }
          }
        });

        return Array.from(matched);
      } catch (err) {
        console.error(`Mapping fetch failed for ${SOURCE} → ${TARGET}`, err);
        return [];
      }
    });

    const results = await Promise.all(promises);

    // ✅ FIX 5: Proper aggregation
    results.forEach((arr) => {
      if (Array.isArray(arr)) {
        arr.forEach((c) => autoSelected.add(c));
      }
    });

    return Array.from(autoSelected).sort();
  } catch (error) {
    console.error(
      `Error getting auto-selected controls for ${targetFrameworkCode}:`,
      error,
    );
    return [];
  }
}

const frameworkMappingsModule = {
  getSOC2ControlsForISO27001,
  getSOC2ControlsForISO27701,
  getISO27001ControlsForSOC2,
  getISO27701ControlsForSOC2,
  getFrameworkToFrameworkMappings,
  getAutoSelectedSOC2Controls,
  getAutoSelectedPDPLControls,
  getMappingDetails,
  clearMappingCache,
  preloadMappings,
  getKSAPDPLControlsForISO27001,
  getKSAPDPLControlsForISO27701,
  getMappingsForKSAPDPL,
  getAutoSelectedControlsForFramework,
};

export default frameworkMappingsModule;
