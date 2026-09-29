import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import RiskDetailsForm from "./RiskDetailsForm";
import TreatmentPlanForm from "./TreatmentPlanForm";
import ResidualRiskForm from "./ResidualRiskForm";
import riskService from "../../services/riskService";
import TaskManagementSection from "../../components/TaskManagementSection"
import Modal from "../../../../components/navigations/Modal";

const multiStepStyles = `
  .msf-wrapper {
    max-width: 1120px;
    margin: 0 auto;
    padding: 16px 16px 80px 16px;
    min-height: 70vh;
    box-sizing: border-box;
  }

  .msf-layout {
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr);
    gap: 16px;
    align-items: flex-start;
  }

  .msf-stepper {
    position: sticky;
    top: 90px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    z-index: 1;
  }

  .msf-step {
    display: flex;
    align-items: center;
  }

  .msf-step-circle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
  }

  .msf-step-label {
    margin-left: 8px;
    font-size: 13px;
    font-weight: 500;
  }

  .msf-main {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
    border: 1px solid #e9ecef;
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

  /* MOBILE (stepper on top, full-width form, nav bar stacked) */
  @media (max-width: 768px) {
    .msf-wrapper {
      padding: 12px 10px 90px 10px;
    }

    .msf-layout {
      grid-template-columns: 1fr;
    }

    .msf-stepper {
      position: static;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .msf-step {
      margin-bottom: 0;
    }

    .msf-step-label {
      display: none; /* keep just circles on very small screens */
    }

    .msf-main {
      margin: 0;
      padding: 16px 12px;
    }

    .msf-nav {
      bottom: 8px;
      left: 0;
      right: 0;
      transform: none;
      justify-content: center;
      padding: 8px 10px;
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(6px);
      box-sizing: border-box;
    }

    .msf-btn {
      flex: 1;
      min-width: 0;
      font-size: 13px;
      padding: 8px 10px;
    }
  }

  /* LARGE DESKTOP */
  @media (min-width: 1200px) {
    .msf-wrapper {
      max-width: 1280px;
    }
  }
`;

const MultiStepFormManager = ({ onSubmit, focusArea = "risk" }) => {
  const router = useRouter();
  const pathname = usePathname();

  const existingRiskId = location.state?.editRiskId;
  const isEditing = !!existingRiskId;

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const showModal = (title, message) => {
    setModal({ isOpen: true, title, message });
  };

  const closeModal = () => {
    setModal((m) => ({ ...m, isOpen: false }));
  };

  const [departments, setDepartments] = useState([]);
  const [user, setUser] = useState(null);

useEffect(() => {
  const storedUser = sessionStorage.getItem("user");

  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);
  const [tasks, setTasks] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    riskId: "",
    department: "",
    date: "",
    riskType: "",
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
    organization: user.organization,
  });

  useEffect(() => {
    async function loadDepartments() {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SP}/user-service/api/departments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        const filtered = Array.isArray(data)
          ? data.filter((dept) => dept.organization === user?.organization)
          : [];
        setDepartments(filtered);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    }
    loadDepartments();
  }, []);

  const [existingRiskIds, setExistingRiskIds] = useState([]);

  useEffect(() => {
    async function loadRisks() {
      const allRisks = await riskService.getAllRisks();
      const orgRiskIds = allRisks
        .filter((risk) => risk.organization === user.department.organization)
        .map((risk) => risk.riskId);

      setExistingRiskIds(orgRiskIds);

      if (isEditing && existingRiskId) {
        const existingRisk = await riskService.getRiskById(existingRiskId);
        if (existingRisk) setFormData(existingRisk);
      } else if (!formData.riskId) {
        generateRiskId(orgRiskIds);
      }
    }
    loadRisks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, existingRiskId]);

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
      formData.controlReference && formData.additionalControls;
    const residualValid =
      formData.numberOfDays && parseInt(formData.numberOfDays) > 0;
    return treatmentValid && residualValid;
  };

  const isStep3Valid = () => {
    const tasksForThisRisk = tasks.filter((t) => t.riskId === formData.riskId);
    return tasksForThisRisk.length > 0;
  };

  const handleNext = () => {
    if (user.role === "risk_identifier" && currentStep >= 1) {
      showModal("⛔ Access Restricted", "You can save and exit only.");
      return;
    }
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSave = async () => {
    try {
      const savedRisk = await riskService.saveRisk(formData);
      const modalData = getModalMessageByStep(currentStep, isEditing);
      showModal(modalData.title, modalData.message);
      if (onSubmit) onSubmit(savedRisk);
    } catch (error) {
      console.error("Error saving draft:", error);
      showModal("❌ Error", "Error saving draft. Please try again.");
    }
  };

  const getModalMessageByStep = (step, isEdit = false) => {
    switch (step) {
      case 1:
        return {
          title: isEdit ? "Step 1 Updated!" : "Step 1 Saved!",
          message:
            "Risk details have been saved successfully. Click next for Treatment",
        };
      case 2:
        return {
          title: isEdit ? "Treatment Updated!" : "Treatment Saved!",
          message:
            "Risk treatment plan has been saved. Click next for Task Management",
        };
      case 3:
        return {
          title: isEdit ? "Tasks Updated!" : "Tasks Saved!",
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
          ? "🎉 Risk Assessment Updated Successfully!"
          : "🎉 Risk Assessment Created Successfully!",
        "You will be redirected shortly."
      );
      if (onSubmit) onSubmit(savedRisk);
      setTimeout(() => router.push("/risk-assessment/saved"), 1000);
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
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
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
              📋 Task Management
            </h4>
            <TaskManagementSection
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

  const getStepLabel = (step) => {
    const labels = ["Risk Assessment", "Treatment Planning", "Task Management"];
    return labels[step - 1];
  };

  const getNextButtonDisabled = () => {
    switch (currentStep) {
      case 1:
        return !isStep1Valid();
      case 2:
        return !isStep2Valid();
      case 3:
        return !isStep3Valid();
      default:
        return false;
    }
  };

  const stepBg = (step) =>
    currentStep === step
      ? "#2980b9"
      : currentStep > step
      ? "#3498db"
      : "#ecf0f1";
  const stepColor = (step) =>
    currentStep >= step ? "#ffffff" : "#7f8c8d";
  const stepLabelColor = (step) =>
    currentStep >= step ? "#3498db" : "#7f8c8d";

  return (
    <div className="msf-wrapper">
      <style>{multiStepStyles}</style>

      <div className="msf-layout">
        {/* Stepper */}
        <div className="msf-stepper">
          {[1, 2, 3].map((step) => (
            <div key={step} className="msf-step">
              <div
                className="msf-step-circle"
                style={{
                  backgroundColor: stepBg(step),
                  color: stepColor(step),
                  transform: currentStep === step ? "scale(1.15)" : "scale(1)",
                  boxShadow:
                    currentStep >= step
                      ? "0 2px 8px rgba(52,152,219,0.3)"
                      : "none",
                }}
              >
                {step}
              </div>
              <span
                className="msf-step-label"
                style={{
                  fontWeight: currentStep === step ? 600 : 500,
                  color: stepLabelColor(step),
                }}
              >
                {getStepLabel(step)}
              </span>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="msf-main">{renderCurrentStep()}</div>
      </div>

      {/* Navigation */}
      <div className="msf-nav">
        {currentStep > 1 && (
          <button
            onClick={handlePrevious}
            className="msf-btn msf-btn--prev"
          >
            ← Previous
          </button>
        )}

        <button
          onClick={handleSave}
          disabled={
            (currentStep === 1 && !isStep1Valid()) ||
            (currentStep === 2 && !isStep2Valid()) ||
            (currentStep === 3 && !isStep3Valid())
          }
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
            className={`msf-btn ${
              isEditing ? "msf-btn--submit-edit" : "msf-btn--submit"
            }`}
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