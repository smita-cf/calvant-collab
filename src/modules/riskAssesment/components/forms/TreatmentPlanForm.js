//C:\Users\ak192\Downloads\CV_Beta_v1.0.0-Calvant_migration\CV_Beta_v1.0.0-Calvant_migration\src\modules\riskAssesment\components\forms\TreatmentPlanForm.js

// TreatmentPlanForm — fixed stale controlOptions closure
import React, { useState, useEffect, useCallback } from "react";
import TextAreaField from "../inputs/TextAreaField";
import Select from "react-select";
import Joyride, { STATUS } from "react-joyride";
import CustomTooltip from "../CustomTooltip";
import controlService from "../../services/controlService";
import { useFramework } from "../../../../context/FrameworkContex";
import { getAutoSelectedControlsForFramework } from "../../../../utils/frameworkMappings";

const normalizeCode = (c) => {
  const s = String(c || "").trim();

  // GDPR/PDPL pattern: "Article-<number>..." — extract just the number
  const articleMatch = s.match(/^article[-\s]?(\d+)/i);
  if (articleMatch) return articleMatch[1];

  // Default: strip everything non-alphanumeric, lowercase
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
};
const ControlTree = ({
  availableFrameworks,
  data,
  selectedValues,
  onToggle,
  autoSelectedControls = {},
}) => {
  const [expanded, setExpanded] = useState({});
  const toggle = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      style={{
        border: "1px solid rgba(226, 232, 240, 0.8)",
        borderRadius: "12px",
        maxHeight: "550px",
        overflowY: "auto",
        padding: "16px",
        background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
        boxShadow: "inset 0 2px 10px rgba(0,0,0,0.02)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "16px",
        alignItems: "start",
      }}
    >
      {data.map((fw) => {
        const fwKey = `fw-${fw.framework}`;
        const fwObj = availableFrameworks?.find((f) => f.code === fw.framework);
        const fwColor = fwObj?.color || "#3b82f6";
        
        // Ensure a slightly darker stop for the gradient
        const darkColor = fwColor === "#3b82f6" ? "#1d4ed8" : fwColor; // Simplified for default, in real app could use a shade generator

        return (
          <div key={fw.framework} style={{ width: "100%" }}>
            <div
              onClick={() => toggle(fwKey)}
              style={{
                cursor: "pointer",
                padding: "14px 18px",
                background: `linear-gradient(135deg, ${fwColor}dd 0%, ${darkColor} 100%)`,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                color: "#ffffff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "6px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {expanded[fwKey] ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                )}
              </div>
              <span style={{ fontWeight: "600", fontSize: "14px", letterSpacing: "0.3px", flex: 1 }}>
                {fw.framework} Framework
              </span>
              
              {autoSelectedControls[fw.framework] &&
                autoSelectedControls[fw.framework].length > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "20px",
                      backgroundColor: "#ffffff",
                      color: darkColor,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    }}
                  >
                    {autoSelectedControls[fw.framework].length} Auto-mapped
                  </span>
                )}
            </div>

            {expanded[fwKey] && (
              <div style={{ 
                marginTop: "12px", 
                marginLeft: "14px", 
                borderLeft: `2px dashed ${fwColor}66`, 
                paddingLeft: "16px",
                maxHeight: "350px",
                overflowY: "auto",
                paddingRight: "10px", // space for scrollbar
              }}>
                {fw.categories.map((cat) => {
                  const catKey = `cat-${fw.framework}-${cat.name}`;
                  return (
                    <div key={cat.name} style={{ marginBottom: "12px" }}>
                      <div
                        onClick={() => toggle(catKey)}
                        style={{
                          cursor: "pointer",
                          padding: "10px 14px",
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          fontWeight: "600",
                          color: "#1e293b",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = fwColor;
                          e.currentTarget.style.backgroundColor = `${fwColor}08`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.backgroundColor = "#ffffff";
                        }}
                      >
                        <div
                          style={{
                            marginRight: "10px",
                            transform: expanded[catKey] ? "rotate(90deg)" : "rotate(0deg)",
                            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            color: fwColor,
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </div>
                        <span style={{ flex: 1, fontSize: "13px" }}>{cat.name}</span>
                        <span style={{ fontSize: "10px", color: fwColor, fontWeight: "600", background: `${fwColor}15`, padding: "3px 10px", borderRadius: "12px" }}>
                          {cat.controls.length} controls
                        </span>
                      </div>
                      
                      {expanded[catKey] && (
                        <div style={{ 
                          marginTop: "8px", 
                          display: "grid", 
                          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
                          gap: "10px" 
                        }}>
                          {cat.controls.map((ctrl) => {
                            const isSelected = selectedValues.includes(ctrl.id);
                            const isAutoSelected = !!autoSelectedControls[fw.framework]?.some(
                              (code) => normalizeCode(code) === normalizeCode(ctrl.controlCode)
                            );
                            
                            const activeColor = isAutoSelected ? "#10b981" : fwColor;
                            const isActive = isSelected || isAutoSelected;

                            return (
                              <label
                                key={ctrl.id}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  padding: "12px 14px",
                                  background: isActive ? `${activeColor}08` : "#ffffff",
                                  borderRadius: "8px",
                                  border: `1px solid ${isActive ? `${activeColor}50` : "#e2e8f0"}`,
                                  cursor: isAutoSelected ? "not-allowed" : "pointer",
                                  boxShadow: isActive ? `0 4px 12px ${activeColor}15` : "0 2px 4px rgba(0,0,0,0.02)",
                                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                  position: "relative",
                                  overflow: "hidden"
                                }}
                                title={isAutoSelected ? "Auto-selected from mapping" : ctrl.title}
                                onMouseEnter={(e) => {
                                  if (!isAutoSelected) {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.08)";
                                    e.currentTarget.style.borderColor = fwColor;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isAutoSelected) {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = isActive ? `0 4px 12px ${activeColor}15` : "0 2px 4px rgba(0,0,0,0.02)";
                                    e.currentTarget.style.borderColor = isActive ? `${activeColor}50` : "#e2e8f0";
                                  }
                                }}
                              >
                                {isAutoSelected && (
                                  <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: "#10b981" }} />
                                )}
                                <div style={{
                                  width: "20px", height: "20px", 
                                  borderRadius: "6px", 
                                  border: `2px solid ${isActive ? activeColor : "#cbd5e1"}`,
                                  background: isActive ? activeColor : "#fff",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  marginRight: "12px", marginTop: "2px",
                                  flexShrink: 0,
                                  transition: "all 0.2s"
                                }}>
                                  {isActive && (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  )}
                                  <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={() => {
                                      if (!isAutoSelected) onToggle(ctrl.id);
                                    }}
                                    disabled={isAutoSelected}
                                    style={{ display: "none" }}
                                  />
                                </div>

                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ color: "#0f172a", fontWeight: "600", fontSize: "13px" }}>{ctrl.controlCode}</span>
                                    {isAutoSelected && (
                                      <span style={{ fontSize: "9px", fontWeight: 700, color: "#059669", background: "#dcfce7", padding: "2px 6px", borderRadius: "4px", letterSpacing: "0.5px" }}>AUTO</span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: "12px", lineHeight: "1.4", color: "#475569", fontWeight: "400" }}>{ctrl.title}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const TreatmentPlanForm = ({
  formData,
  handleInputChange,
  selectedFrameworks = [],
  isAllSelected = true,
}) => {
  const { availableFrameworks } = useFramework();
  const [runTour, setRunTour] = useState(false);
  const [controlOptions, setControlOptions] = useState([]);
  const [isLoadingControls, setIsLoadingControls] = useState(false);
  const [autoSelectedControls, setAutoSelectedControls] = useState({});
  const [idToMeta, setIdToMeta] = useState({});
  const isAutoUpdatingRef = React.useRef(false);
  const controlReferenceRef = React.useRef(formData.controlReference);

  useEffect(() => {
    controlReferenceRef.current = formData.controlReference;
  }, [formData.controlReference]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ── KEY FIX: accept treeData param to avoid stale controlOptions closure ──
  const updateAutoSelectedMappedControls = useCallback(
    async (selectedControlIds, metaMap, treeData) => {
      const map = metaMap || idToMeta;
      const tree = treeData || controlOptions; // ← use passed value, never stale

      if (!selectedControlIds || selectedControlIds.length === 0) {
        setAutoSelectedControls({});
        return;
      }

      if (Object.keys(map).length === 0) return;

      try {
        const controlsByFramework = {};

        selectedControlIds.forEach((id) => {
          const meta = map[id];
          if (!meta) return;
          if (!controlsByFramework[meta.framework])
            controlsByFramework[meta.framework] = [];
          controlsByFramework[meta.framework].push(meta.controlCode);
        });

        const mappedFrameworks =
          availableFrameworks?.filter(
            (f) => f.isMapped && f.mappingSources?.length > 0,
          ) || [];

        const newAutoSelectedControls = {};
        const allAutoSelectedIds = [];

        for (const fwObj of mappedFrameworks) {
          const validSources = fwObj.mappingSources;
          if (validSources.length === 0) continue;

          const mergedCodes = await getAutoSelectedControlsForFramework(
            fwObj.code,
            validSources,
            controlsByFramework,
            {
              driverFrameworks: availableFrameworks
                .filter((f) => !f.isMapped)
                .map((f) => f.code),
              mappedFrameworks: availableFrameworks
                .filter((f) => f.isMapped)
                .map((f) => f.code),
            },
          );

          console.log(`mergedCodes for ${fwObj.code}:`, mergedCodes);

          if (mergedCodes.length === 0) continue;

          newAutoSelectedControls[fwObj.code] = mergedCodes;

          // ← use tree instead of controlOptions — never stale
          const treeFw = tree.find((fw) => fw.framework === fwObj.code);
          if (!treeFw) continue;

          const codeToId = {};
          treeFw.categories.forEach((cat) =>
            cat.controls.forEach((ctrl) => {
              codeToId[normalizeCode(ctrl.controlCode)] = ctrl.id;
            }),
          );

          console.log(
            "GDPR codeToId keys (sample):",
            Object.keys(codeToId).slice(0, 5),
          );
          console.log(
            "GDPR mergedCodes normalized (sample):",
            mergedCodes.slice(0, 5).map(normalizeCode),
          );

          if (fwObj.code === "GDPR") {
            console.log(
              "GDPR tree control codes (raw, first 5):",
              treeFw.categories
                .flatMap((cat) => cat.controls.map((c) => c.controlCode))
                .slice(0, 5),
            );
            console.log(
              "GDPR mapping codes (raw, first 5):",
              mergedCodes.slice(0, 5),
            );
          }
          const autoIds = mergedCodes
            .map((code) => codeToId[normalizeCode(code)])
            .filter(Boolean);

          allAutoSelectedIds.push(...autoIds);
        }

        setAutoSelectedControls(newAutoSelectedControls);

        const mappedFrameworksWithResults = new Set(
          Object.keys(newAutoSelectedControls),
        );

        const manualIds = (controlReferenceRef.current || []).filter((id) => {
          const meta = map[id];
          if (!meta) return true;
          if (mappedFrameworksWithResults.has(meta.framework)) return false;
          return true;
        });

        const merged = [...new Set([...manualIds, ...allAutoSelectedIds])];

        // ← ADD THIS
        console.log("Final merged controlReference:", merged);
        console.log("manualIds:", manualIds);
        console.log("allAutoSelectedIds:", allAutoSelectedIds);

        isAutoUpdatingRef.current = true;
        handleInputChange({
          target: { name: "controlReference", value: merged },
        });
      } catch (error) {
        console.error("Error updating auto-selected controls:", error);
        setAutoSelectedControls({});
      }
    },
    [idToMeta, controlOptions, handleInputChange, availableFrameworks],
  );

  // ── Fetch controls whenever riskType OR active frameworks change ──────────
  useEffect(() => {
    const fetchControls = async () => {
      const selectedTypes = Array.isArray(formData.riskType)
        ? formData.riskType
        : [];
      if (selectedTypes.length === 0) {
        setControlOptions([]);
        setIdToMeta({});
        setAutoSelectedControls({});
        return;
      }

      const activeFWCodes = isAllSelected
        ? new Set(availableFrameworks.map((f) => f.code))
        : new Set(
            selectedFrameworks
              .map(
                (fwId) => availableFrameworks?.find((f) => f.id === fwId)?.code,
              )
              .filter(Boolean),
          );

      setIsLoadingControls(true);
      try {
        const frameworksToFetch = new Set();

        selectedTypes.forEach((type) => {
          const key = String(type).toLowerCase();
          availableFrameworks?.forEach((fwObj) => {
            if (
              fwObj.riskTypes &&
              fwObj.riskTypes.some((rt) => rt.toLowerCase() === key)
            ) {
              if (activeFWCodes.has(fwObj.code))
                frameworksToFetch.add(fwObj.code);
            }
          });
        });

        availableFrameworks?.forEach((fwObj) => {
          if (fwObj.isMapped && fwObj.mappingSources?.length > 0) {
            if (fwObj.mappingSources.some((src) => frameworksToFetch.has(src)))
              frameworksToFetch.add(fwObj.code);
          }
        });

        const allowed = [...frameworksToFetch].filter((fw) => {
          if (activeFWCodes.has(fw)) return true;
          const fwObj = availableFrameworks?.find((f) => f.code === fw);
          if (fwObj?.isMapped) return true;
          return false;
        });

        const fetchPromises = allowed.map(async (frameworkCode) => {
          const data =
            await controlService.getControlsByFramework(frameworkCode);
          const categories = data.reduce((acc, ctrl) => {
            const cat = ctrl.category || "General";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(ctrl);
            return acc;
          }, {});
          return {
            framework: frameworkCode,
            isMapped:
              availableFrameworks?.find((f) => f.code === frameworkCode)
                ?.isMapped ?? false,
            categories: Object.keys(categories).map((catName) => ({
              name: catName,
              controls: categories[catName],
            })),
          };
        });

        const results = (await Promise.all(fetchPromises)).filter(Boolean);

        results.sort((a, b) => {
          const aMapped = availableFrameworks?.find(
            (f) => f.code === a.framework,
          )?.isMapped
            ? 1
            : 0;
          const bMapped = availableFrameworks?.find(
            (f) => f.code === b.framework,
          )?.isMapped
            ? 1
            : 0;
          return aMapped - bMapped;
        });

        setControlOptions(results);

        const map = {};
        results.forEach((fw) =>
          fw.categories.forEach((cat) =>
            cat.controls.forEach((ctrl) => {
              map[ctrl.id] = {
                controlCode: ctrl.controlCode,
                framework: fw.framework,
              };
            }),
          ),
        );
        setIdToMeta(map);
        console.log("idToMeta frameworks:", [
          ...new Set(Object.values(map).map((m) => m.framework)),
        ]);
        // ← pass results directly — guaranteed fresh, never stale
        if (formData.controlReference?.length > 0) {
          updateAutoSelectedMappedControls(
            formData.controlReference,
            map,
            results,
          );
        }
      } catch (error) {
        console.error("Error fetching controls:", error);
      } finally {
        setIsLoadingControls(false);
      }
    };
    fetchControls();
  }, [formData.riskType, selectedFrameworks, isAllSelected]);

  // ── Recompute when user manually toggles a control ────────────────────────
  useEffect(() => {
    if (Object.keys(idToMeta).length === 0) return;

    if (isAutoUpdatingRef.current) {
      isAutoUpdatingRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (formData.controlReference && formData.controlReference.length > 0) {
        // ← pass controlOptions explicitly so it's never stale here either
        updateAutoSelectedMappedControls(
          formData.controlReference,
          undefined,
          controlOptions,
        );
      } else {
        setAutoSelectedControls({});
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [
    formData.controlReference,
    idToMeta,
    updateAutoSelectedMappedControls,
    controlOptions,
  ]);

  const treatmentPlanTourSteps = [
    {
      target: ".risk-id-summary",
      content: "This shows the Risk ID.",
      placement: "bottom",
    },
    {
      target: ".department-summary",
      content: "The department responsible.",
      placement: "bottom",
    },
    {
      target: ".risk-type-summary",
      content: "The type of risk identified.",
      placement: "bottom",
    },
    {
      target: ".action-field",
      content: "Recommended action based on residual risk.",
      placement: "bottom",
    },
    {
      target: ".status-field",
      content: "Update the current status.",
      placement: "bottom",
    },
    {
      target: ".control-implementation-section",
      content: "Define control measures.",
      placement: "top",
    },
    {
      target: ".risk-description-field",
      content: "Risk description.",
      placement: "top",
    },
    {
      target: ".additional-controls-field",
      content: "New or proposed controls.",
      placement: "top",
    },
    {
      target: ".control-reference-field",
      content: "Select applicable controls.",
      placement: "top",
    },
  ];

  const getActionPlan = (riskLevel) => {
    switch (riskLevel) {
      case "Low":
        return "Accept";
      case "Medium":
      case "High":
        return "Mitigate";
      default:
        return "Not defined yet";
    }
  };

  const action = getActionPlan(formData.riskLevel);
  const statusValue = formData.status || "Open";

  const handleControlToggle = (id) => {
    const current = Array.isArray(formData.controlReference)
      ? formData.controlReference
      : [];
    const newValue = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    handleInputChange({
      target: { name: "controlReference", value: newValue },
    });
  };

  const hasAIType =
    Array.isArray(formData.riskType) &&
    formData.riskType.some(
      (t) => String(t).toLowerCase() === "artificial intelligence",
    );

  const formStyle = {
    margin: "0 auto",
  };
  const summaryCardStyle = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    background: "#f39c12",
    color: "white",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
  };
  const summaryItemStyle = {
    flex: 1,
    minWidth: "100px",
    display: "flex",
    flexDirection: "column",
  };
  const summaryLabelStyle = {
    fontSize: "11px",
    opacity: 0.8,
    fontWeight: 500,
    textTransform: "uppercase",
  };
  const summaryValueStyle = { fontSize: "16px", fontWeight: 700 };
  const calculatedItemStyle = {
    flex: 1,
    minWidth: "150px",
    textAlign: "center",
    background: "#fff",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  };
  const calculatedLabelStyle = {
    fontSize: "11px",
    fontWeight: 500,
    marginBottom: "4px",
    color: "#34495e",
    textTransform: "uppercase",
  };
  const calculatedValueStyle = {
    fontSize: "16px",
    fontWeight: 600,
    padding: "4px 8px",
    borderRadius: "6px",
    background: "#ffffff",
    color: "#2c3e50",
    border: "1px solid #ecf0f1",
  };
  const autoGenButtonStyle = {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  };

  return (
    <div style={formStyle}>
      <Joyride
        steps={treatmentPlanTourSteps.map(s => ({ ...s, disableBeacon: true }))}
        run={runTour}
        continuous
        showSkipButton
        scrollOffset={200}
        tooltipComponent={CustomTooltip}
        styles={{
          options: {
            zIndex: 10000,
            overlayColor: "rgba(0, 0, 0, 0.5)",
          },
          spotlight: {
            borderRadius: "12px",
            boxShadow: "0 0 0 3px #ffffff, 0 0 0 6px #3b82f6, 0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          }
        }}
        callback={(data) => {
          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status))
            setRunTour(false);
        }}
      />

      <div className="treatment-summary-card" style={summaryCardStyle}>
        <div className="risk-id-summary" style={summaryItemStyle}>
          <span style={summaryLabelStyle}>Risk ID</span>
          <span style={summaryValueStyle}>{formData.riskId || "Not Set"}</span>
        </div>
        <div className="department-summary" style={summaryItemStyle}>
          <span style={summaryLabelStyle}>Department</span>
          <span style={summaryValueStyle}>
            {formData.department || "Not Set"}
          </span>
        </div>
        <div className="risk-type-summary" style={summaryItemStyle}>
          <span style={summaryLabelStyle}>Risk Type</span>
          <span style={summaryValueStyle}>
            {Array.isArray(formData.riskType)
              ? formData.riskType.join(", ")
              : formData.riskType || "Not Set"}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          background: "#f8f9fa",
          padding: "10px 15px",
          borderRadius: "8px",
          border: "1px solid #e9ecef"
        }}
      >
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#ffffff",
            color: "#3b82f6",
            border: "1px solid #bfdbfe",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(59, 130, 246, 0.15)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            margin: 0
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.transform = "translateY(0)"; }}
          onClick={() => setRunTour(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Tutorial
        </button>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <div className="action-field" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#34495e", textTransform: "uppercase" }}>Action:</label>
            <span style={{ fontSize: "14px", fontWeight: 600, padding: "4px 12px", borderRadius: "12px", background: "#3498db", color: "#fff" }}>{action}</span>
          </div>
          <div style={{ width: "1px", height: "24px", background: "#dee2e6" }}></div>
          <div className="status-field" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#34495e", textTransform: "uppercase" }}>Status:</label>
            <div style={{ width: "130px" }}>
              <Select
                name="status"
                options={[
                  { value: "Open", label: "Open" },
                  { value: "WIP", label: "WIP" },
                  { value: "Closed", label: "Closed" },
                ]}
                value={{ value: statusValue, label: statusValue }}
                onChange={(selected) =>
                  handleInputChange({
                    target: { name: "status", value: selected.value },
                  })
                }
                styles={{
                  control: (base) => ({ ...base, minHeight: "32px", height: "32px" }),
                  valueContainer: (base) => ({ ...base, padding: "0 8px" }),
                  input: (base) => ({ ...base, margin: 0, padding: 0 }),
                  indicatorsContainer: (base) => ({ ...base, height: "32px" }),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="control-implementation-section"
        style={{
          background: "rgba(230,126,34,0.03)",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid rgba(230,126,34,0.1)",
          marginBottom: "15px",
        }}
      >
        <h3
          style={{
            color: "#2c3e50",
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "10px",
          }}
        >
          Control Implementation
        </h3>

        <div
          className="risk-description-field"
          style={{
            background: "#f8f9fa",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
            border: "1px solid #e9ecef",
          }}
        >
          <h4
            style={{
              marginBottom: "6px",
              fontWeight: "bold",
              color: "#495057",
            }}
          >
            Risk Description
          </h4>
          <p style={{ fontSize: "13px", color: "#495057", fontWeight: 500 }}>
            {formData.riskDescription || "No description available"}
          </p>
        </div>

        <TextAreaField
          className="additional-controls-field"
          label="New/Proposed Controls"
          name="additionalControls"
          value={formData.additionalControls || ""}
          onChange={handleInputChange}
          placeholder="Describe additional control measures..."
          rows={2}
        />

        <div style={{ marginTop: "12px", marginBottom: "6px" }}>
          <p style={{ margin: 0, fontWeight: 500 }}>
            Applicable Control(s){" "}
            {isLoadingControls && (
              <small style={{ color: "#3498db" }}>(Loading...)</small>
            )}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "4px",
            }}
          >
            {/* Dynamic auto-selected badges — one per mapped framework */}
            {!isLoadingControls &&
              Object.keys(autoSelectedControls).map((fwCode) => {
                const count = autoSelectedControls[fwCode].length;
                if (count === 0) return null;
                const fwObj = availableFrameworks?.find(
                  (f) => f.code === fwCode,
                );
                const color = fwObj?.color || "#1b5e20";
                const bg = color + "15";
                const border = color + "40";
                return (
                  <span
                    key={fwCode}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 10,
                      backgroundColor: bg,
                      color,
                      border: `1px solid ${border}`,
                      display: "inline-block",
                    }}
                  >
                    + {fwObj?.label || fwCode} auto-selected
                  </span>
                );
              })}

            {!isLoadingControls && hasAIType && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 10,
                  backgroundColor: "#fff3e0",
                  color: "#e65100",
                  border: "1px solid #ffcc80",
                  display: "inline-block",
                }}
              >
                🤖 ISO 42001 controls loaded
              </span>
            )}
          </div>
        </div>

        {isLoadingControls ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              border: "1px dashed #ccc",
            }}
          >
            Loading Control Tree...
          </div>
        ) : (
          <>
            <div className="control-reference-field">
              <ControlTree
                availableFrameworks={availableFrameworks}
                data={controlOptions}
                selectedValues={formData.controlReference || []}
                autoSelectedControls={autoSelectedControls}
                onToggle={handleControlToggle}
              />
            </div>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                flexWrap: "wrap",
                gap: "5px",
              }}
            >
              {(formData.controlReference || [])
                .filter((id) => idToMeta[id]) // ← only show IDs we know about
                .map((id) => {
                  const meta = idToMeta[id];
                  const fwObj = availableFrameworks?.find(
                    (f) => f.code === meta.framework,
                  );
                  const badge = fwObj
                    ? {
                        bg: fwObj.color ? fwObj.color + "15" : "#e0e0e0",
                        color: fwObj.color || "#616161",
                        border: fwObj.color ? fwObj.color + "40" : "#bdbdbd",
                      }
                    : { bg: "#e0e0e0", color: "#616161", border: "#bdbdbd" };
                  return (
                    <span
                      key={id}
                      title={meta.framework}
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {meta.controlCode}
                    </span>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TreatmentPlanForm;
