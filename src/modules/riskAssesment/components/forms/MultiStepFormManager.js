import React, { useState, useEffect, useCallback } from "react";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import RiskDetailsForm from "./RiskDetailsForm";
import TreatmentPlanForm from "./TreatmentPlanForm";
import ResidualRiskForm from "./ResidualRiskForm";
import riskService from "../../services/riskService";
import TaskManagement from "../../pages/TaskManagement";
import Modal from "../../../../components/navigations/Modal";
import { captureActivity, ACTIONS } from "../../../../services/activities";

import { useFramework } from "../../../../context/FrameworkContex";

const multiStepStyles = `
  .msf-wrapper {
    max-width: 1120px;
    margin: 0 auto;
    padding: 16px 16px 80px 16px;
    min-height: 70vh;
    box-sizing: border-box;
  }

  .msf-layout {
    display: flex;
    flex-direction: column;
    gap: 24px;
    align-items: stretch;
  }

  .msf-stepper {
    position: relative;
    top: 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    background: transparent;
    padding: 10px 0 24px 0;
    z-index: 1;
    margin-bottom: 0px;
  }

  .msf-stepper-line-bg {
    position: absolute;
    top: 24.5px;
    left: 16.66%;
    right: 16.66%;
    height: 3px;
    background: #e2e8f0;
    z-index: 0;
    border-radius: 2px;
  }

  .msf-stepper-line-active {
    position: absolute;
    top: 24.5px;
    left: 16.66%;
    height: 3px;
    background: #3b82f6;
    z-index: 0;
    border-radius: 2px;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .msf-step {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    background: transparent;
    width: 33.33%;
  }

  .msf-step-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.4s ease;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    color: #94a3b8;
  }

  .msf-step-circle.active {
    border-color: #3b82f6;
    color: #3b82f6;
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  .msf-step-circle.completed {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #ffffff;
  }

  .msf-step-label {
    margin-left: 0;
    font-size: 15px;
    font-weight: 600;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: #64748b;
    transition: color 0.3s ease;
  }

  .msf-step-label.active {
    color: #0f172a;
  }

  .msf-step-subtitle {
    font-size: 13px;
    font-weight: 500;
    color: #94a3b8;
    transition: color 0.3s ease;
  }

  .msf-step-label.active .msf-step-subtitle {
    color: #64748b;
  }

  .msf-main {
    margin-bottom: 20px;
  }

  .msf-nav {
    position: fixed;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 100;
    background: transparent;
  }

  .msf-btn {
    padding: 10px 20px;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 600;
    min-width: 110px;
    border: none;
    cursor: pointer;
  }

  .msf-btn--prev {
    background-color: #ffffff;
    color: #7f8c8d;
    border: 1px solid #ecf0f1;
  }

  .msf-btn--save {
    background: linear-gradient(45deg,#6c5ce7,#0984e3);
    color: #ffffff;
  }

  .msf-btn--save:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }

  .msf-btn--next {
    background-color: #3498db;
    color: #ffffff;
  }

  .msf-btn--next:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }

  .msf-btn--submit {
    background: linear-gradient(45deg,#27ae60,#2ecc71);
    color: #ffffff;
  }

  .msf-btn--submit-edit {
    background: linear-gradient(45deg,#e67e22,#f39c12);
    color: #ffffff;
  }

  @media (max-width: 768px) {
    .msf-wrapper { padding: 12px 10px 90px 10px; }
    .msf-stepper {
      padding: 10px 0;
    }
    .msf-stepper-line-bg, .msf-stepper-line-active {
      left: 16.66%;
      right: 16.66%;
      top: 24.5px;
    }
    .msf-step-label { display: none; }
    .msf-main { margin: 0; padding: 16px 12px; }
    .msf-nav {
      bottom: 8px; left: 0; right: 0;
      transform: none; justify-content: center;
      padding: 8px 10px; background: rgba(255,255,255,0.9);
      backdrop-filter: blur(6px); box-sizing: border-box;
    }
    .msf-btn { flex: 1; min-width: 0; font-size: 13px; padding: 8px 10px; }
  }

  @media (min-width: 1200px) { .msf-wrapper { max-width: 1280px; } }
`;

const MultiStepFormManager = ({ onSubmit, focusArea = "risk" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedFrameworks, isAllSelected } = useFramework();

  const searchParams = useSearchParams();
  const existingRiskId = searchParams.get("editRiskId");
  const isEditing = !!existingRiskId;

  const [modal, setModal] = useState({ isOpen: false, title: "", message: "" });

  const showModal = (title, message) =>
    setModal({ isOpen: true, title, message });
  const closeModal = () => setModal((m) => ({ ...m, isOpen: false }));

  const [departments, setDepartments] = useState([]);

  // 1. Normalize User Data using useEffectiveOrg hook
  const {
    user,
    mounted,
    isRoot,
    isPrivilegedRole,
    isViewingManagedOrg,
    effectiveOrgId,
    effectiveOrgIds,
    selectedChildOrg,
  } = useEffectiveOrg();
  const userRoles = Array.isArray(user?.role) ? user.role : [user?.role || ""];
  const isRiskIdentifier = userRoles.includes("risk_manager") && !isPrivilegedRole;

  const [tasks, setTasks] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    riskId: "",
    department: "",
    date: "",
    riskType: [],
    assetType: "",
    asset: "",
    riskDescription: "",
    confidentiality: "",
    threat: [],
    vulnerability: [],
    integrity: "",
    availability: "",
    impact: "",
    probability: "",
    existingControls: "",
    additionalNotes: "",
    controlReference: [],
    additionalControls: "",
    numberOfDays: "",
    deadlineDate: "",
    status: "Open",
    organization: effectiveOrgId,
  });

  // Sync effectiveOrgId into formData when loaded
  useEffect(() => {
    if (mounted && effectiveOrgId && !formData.organization) {
      setFormData((prev) => ({ ...prev, organization: effectiveOrgId }));
    }
  }, [mounted, effectiveOrgId, formData.organization]);

  // Load Departments
  useEffect(() => {
    async function loadDepartments() {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SP}/user-service/api/departments`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        const userOrgId = effectiveOrgId;

        const filtered = Array.isArray(data)
          ? data.filter((dept) => {
            const deptOrgId = dept.organization?._id || dept.organization;
            return String(deptOrgId) === String(userOrgId);
          })
          : [];
        setDepartments(filtered);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    }
    if (mounted && user) loadDepartments();
  }, [mounted, user, effectiveOrgId]);

  const [existingRiskIds, setExistingRiskIds] = useState([]);

  // Load Risks and Initial Data
  useEffect(() => {
    async function loadRisks() {
      const allRisks = await riskService.getAllRisks();
      const userOrgId = effectiveOrgId;

      const orgRiskIds = allRisks
        .filter((risk) => {
          const riskOrgId = risk.organization?._id || risk.organization;
          return String(riskOrgId) === String(userOrgId);
        })
        .map((risk) => risk.riskId);

      setExistingRiskIds(orgRiskIds);

      if (isEditing && existingRiskId) {
        const existingRisk = await riskService.getRiskById(
          existingRiskId,
          effectiveOrgId,
        );
        if (existingRisk) setFormData(existingRisk);
      } else if (!formData.riskId) {
        generateRiskId(orgRiskIds);
      }
    }
    if (mounted && user) loadRisks();
  }, [mounted, isEditing, existingRiskId, user, effectiveOrgId]);

  const generateRiskId = (excludeIds = []) => {
    const currentYear = new Date().getFullYear();
    let nextNumber = 1;
    let newRiskId = "";
    const riskIdsToCheck = excludeIds.length > 0 ? excludeIds : existingRiskIds;

    do {
      const paddedNumber = nextNumber.toString().padStart(3, "0");
      newRiskId = `RR-${currentYear}-${paddedNumber}`;
      nextNumber++;
    } while (riskIdsToCheck.includes(newRiskId));

    setFormData((prev) => ({ ...prev, riskId: newRiskId }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isStep1Valid = () => {
    const duplicateCheck = isEditing
      ? existingRiskIds
        .filter((id) => id !== existingRiskId)
        .includes(formData.riskId)
      : existingRiskIds.includes(formData.riskId);

    return (
      formData.riskId &&
      formData.department &&
      formData.date &&
      formData.riskType &&
      formData.assetType &&
      formData.riskDescription &&
      formData.confidentiality &&
      formData.integrity &&
      formData.availability &&
      formData.probability &&
      !duplicateCheck
    );
  };

  const isStep2Valid = () => {
    const treatmentValid =
      formData.controlReference?.length > 0 && formData.additionalControls;
    const residualValid =
      formData.numberOfDays && parseInt(formData.numberOfDays) > 0;
    return treatmentValid && residualValid;
  };

  const isStep3Valid = () => {
    const tasksForThisRisk = tasks.filter((t) => t.riskId === formData.riskId);
    return tasksForThisRisk.length > 0;
  };

  const handleNext = () => {
    // Check if user has "risk_identifier" role and prevent progression if logic requires it
    if (isRiskIdentifier && currentStep >= 1) {
      showModal(
        "⛔ Access Restricted",
        "Risk Identifiers can save drafts but cannot proceed to Treatment/Tasks.",
      );
      return;
    }
    if (currentStep < 3) {
      const nextStep = currentStep + 1;
      const stepNames = [
        "Risk Assessment",
        "Treatment Planning",
        "Task Management",
      ];
      captureActivity({
        action: ACTIONS.SELECT,
        url: window.location.pathname,
        item: [
          {
            step: nextStep,
            stepName: stepNames[nextStep - 1],
            riskId: formData.riskId,
            from: stepNames[currentStep - 1],
          },
        ],
      });
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSave = async () => {
    try {
      const savedRisk = await riskService.saveRisk(formData);
      const modalData = getModalMessageByStep(currentStep, isEditing);
      showModal(modalData.title, modalData.message);
      // Log step-save activity
      const stepNames = [
        "Risk Assessment Details",
        "Treatment Plan",
        "Task Management",
      ];
      captureActivity({
        action: isEditing ? ACTIONS.UPDATE : ACTIONS.CREATE,
        url: window.location.pathname,
        item: [
          {
            riskId: formData.riskId,
            stepSaved: stepNames[currentStep - 1],
            department: formData.department,
            status: formData.status,
          },
        ],
      });
      if (onSubmit) onSubmit(savedRisk);
    } catch (error) {
      console.error("Error saving draft:", error);
      showModal("❌ Error", "Error saving draft. Please try again.");
    }
  };

  const getModalMessageByStep = (step, isEdit = false) => {
    const status = isEdit ? "Updated" : "Saved";
    switch (step) {
      case 1:
        return {
          title: `Step 1 ${status}!`,
          message: "Risk details saved. Click next for Treatment.",
        };
      case 2:
        return {
          title: `Treatment ${status}!`,
          message: "Risk treatment plan saved. Click next for Task Management.",
        };
      case 3:
        return {
          title: `Tasks ${status}!`,
          message: "Tasks for this risk have been saved.",
        };
      default:
        return { title: "Saved!", message: "Your progress has been saved." };
    }
  };

  const handleSubmit = async () => {
    try {
      const savedRisk = await riskService.saveRisk(formData);
      showModal(
        isEditing
          ? "🎉 Risk Assessment Updated!"
          : "🎉 Risk Assessment Created!",
        "You will be redirected shortly.",
      );
      // Log final submission
      captureActivity({
        action: isEditing ? ACTIONS.UPDATE : ACTIONS.CREATE,
        url: window.location.pathname,
        item: [
          {
            riskId: formData.riskId,
            department: formData.department,
            riskType: (formData.riskType || []).join(", "),
            status: formData.status,
            action: isEditing ? "Full Risk Updated" : "New Risk Submitted",
          },
        ],
      });
      if (onSubmit) onSubmit(savedRisk);
      setTimeout(() => router.push("/risk-assessment/saved"), 1500);
    } catch (error) {
      console.error("Error saving risk:", error);
      showModal("❌ Error", "Error saving risk assessment. Please try again.");
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RiskDetailsForm
            formData={formData}
            handleInputChange={handleInputChange}
            generateRiskId={() => generateRiskId()}
            existingRiskIds={existingRiskIds}
            isEditing={isEditing}
            originalRiskId={existingRiskId}
            departments={departments}
          />
        );
      case 2:
        return (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div
              style={{
                background: "white",
                padding: "15px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <TreatmentPlanForm
                formData={formData}
                handleInputChange={handleInputChange}
                selectedFrameworks={selectedFrameworks}
                isAllSelected={isAllSelected}
              />
              <ResidualRiskForm
                formData={formData}
                handleInputChange={handleInputChange}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <>
            <h4 style={{ marginBottom: "10px", color: "#2c3e50" }}>

            </h4>
            <TaskManagement
              riskFormData={formData}
              tasks={tasks}
              setTasks={setTasks}
            />
          </>
        );
      default:
        return null;
    }
  };

  const getStepLabel = (step) =>
    ["Risk Assessment", "Treatment Planning", "Task Management"][step - 1];

  const getStepSubtitle = (step) =>
    ["Identify and Assess Risks", "Define Response and Controls", "Assign Follow-up Tasks"][step - 1];

  const getNextButtonDisabled = () => {
    if (currentStep === 1) return !isStep1Valid();
    if (currentStep === 2) return !isStep2Valid();
    if (currentStep === 3) return !isStep3Valid();
    return false;
  };

  return (
    <div className="msf-wrapper">
      <style>{multiStepStyles}</style>
      <div className="msf-layout">
        <div className="msf-stepper">
          <div className="msf-stepper-line-bg"></div>
          <div 
            className="msf-stepper-line-active" 
            style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '33.34%' : '66.68%' }}
          ></div>
          
          {[1, 2, 3].map((step) => {
            const isCompleted = currentStep > step;
            const isActive = currentStep === step;
            
            return (
              <div key={step} className="msf-step">
                <div 
                  className={`msf-step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span className={`msf-step-label ${isActive || isCompleted ? 'active' : ''}`}>
                  <span>{getStepLabel(step)}</span>
                  <span className="msf-step-subtitle">
                    {getStepSubtitle(step)}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="msf-main">{renderCurrentStep()}</div>
      </div>

      <div className="msf-nav">
        {currentStep > 1 && (
          <button onClick={handlePrevious} className="msf-btn msf-btn--prev">
            ← Previous
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={getNextButtonDisabled()}
          className="msf-btn msf-btn--save"
        >
          Save
        </button>
        {currentStep < 3 && (
          <button
            onClick={handleNext}
            disabled={getNextButtonDisabled()}
            className="msf-btn msf-btn--next"
          >
            Next →
          </button>
        )}
        {currentStep === 3 && (
          <button
            onClick={handleSubmit}
            className={`msf-btn ${isEditing ? "msf-btn--submit-edit" : "msf-btn--submit"}`}
          >
            {isEditing ? "Save & Finish" : "Submit"}
          </button>
        )}
      </div>

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      />
    </div>
  );
};

export default MultiStepFormManager;
