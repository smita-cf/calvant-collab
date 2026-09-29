import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import RiskDetailsForm from "./RiskDetailsForm";
import TreatmentPlanForm from "./TreatmentPlanForm";
import ResidualRiskForm from "./ResidualRiskForm";
import riskService from "../../services/riskService";
import TaskManagement from "../../pages/TaskManagement";

const MultiStepFormManager = ({ onSubmit, focusArea = "risk" }) => {
  const history = useHistory();
  const location = useLocation();

  const existingRiskId = location.state?.editRiskId;
  const isEditing = !!existingRiskId;

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    async function loadDepartments() {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch("https://cftoolbackend.duckdns.org/api/users/departments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDepartments(data);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    }
    loadDepartments();
  }, []);

  const user = JSON.parse(sessionStorage.getItem("user"));
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
    threat: "",
    vulnerability: "",
    integrity: "",
    availability: "",
    impact: "",
    probability: "",
    existingControls: "",
    additionalNotes: "",
    controlReference: "",
    additionalControls: "",
    numberOfDays: "",
    deadlineDate: "",
  });

  const [existingRiskIds, setExistingRiskIds] = useState([]);

  useEffect(() => {
    async function loadRisks() {
      const allRiskIds = await riskService.getAllRiskIds();
      setExistingRiskIds(allRiskIds);

      if (isEditing && existingRiskId) {
        const existingRisk = await riskService.getRiskById(existingRiskId);
        if (existingRisk) {
          setFormData(existingRisk);
        }
      } else if (!formData.riskId) {
        generateRiskId(allRiskIds);
      }
    }
    loadRisks();
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

    setFormData((prevData) => ({ ...prevData, riskId: newRiskId }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
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
      formData.location &&
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
      alert("⛔ Access Restricted You can save and exit.");
      return;
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSave = async () => {
    try {
      const savedRisk = await riskService.saveRisk(formData);
      alert(isEditing ? "💾 Changes Saved!" : "💾 Draft Saved!");
      if (onSubmit) onSubmit(savedRisk);
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("❌ Error saving draft. Please try again.");
    }
  };

  const handleSubmit = async () => {
    try {
      const savedRisk = await riskService.saveRisk(formData);
      alert(
        isEditing
          ? "🎉 Risk Assessment Updated Successfully!"
          : "🎉 Risk Assessment Created Successfully!"
      );
      if (onSubmit) onSubmit(savedRisk);
      setTimeout(() => history.push("/risk-assessment/saved"), 1000);
    } catch (error) {
      console.error("Error saving risk:", error);
      alert("❌ Error saving risk assessment. Please try again.");
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
              />
              <h4 style={{ marginBottom: "10px", color: "#2c3e50" }}>
                ⚖️ Residual Risk
              </h4>
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

  const getStepLabel = (step) => {
    const labels = [
      "Risk Assessment",
      "Treatment Planning",
      "Task Management",
    ];
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

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "15px",
        minHeight: "70vh",
      }}
    >
      {/* Stepper */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "15px",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          zIndex: 900,
        }}
      >
        {[1, 2, 3].map((step, index) => (
          <div
            key={step}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: index < 2 ? "30px" : 0,
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  currentStep === step
                    ? "#2980b9"
                    : currentStep > step
                    ? "#3498db"
                    : "#ecf0f1",
                color: currentStep >= step ? "white" : "#7f8c8d",
                fontWeight: "600",
                fontSize: "14px",
                transform: currentStep === step ? "scale(1.15)" : "scale(1)",
                transition: "all 0.3s ease",
                boxShadow:
                  currentStep >= step
                    ? "0 2px 8px rgba(52, 152, 219, 0.3)"
                    : "none",
              }}
            >
              {step}
            </div>
            <span
              style={{
                marginLeft: "8px",
                fontSize: "12px",
                fontWeight: currentStep === step ? 600 : 500,
                color: currentStep >= step ? "#3498db" : "#7f8c8d",
              }}
            >
              {getStepLabel(step)}
            </span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: "120px",
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e9ecef",
        }}
      >
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          display: "flex",
          gap: "10px",
          zIndex: 100,
        }}
      >
        {currentStep > 1 && (
          <button
            onClick={handlePrevious}
            style={{
              padding: "10px 20px",
              backgroundColor: "white",
              color: "#7f8c8d",
              border: "1px solid #ecf0f1",
              borderRadius: "30px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              minWidth: "110px",
            }}
          >
            ← Previous
          </button>
        )}

        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(45deg,#6c5ce7,#0984e3)",
            color: "white",
            border: "none",
            borderRadius: "30px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            minWidth: "110px",
          }}
        >
          💾 Save
        </button>

        {currentStep < 3 && (
          <button
            onClick={handleNext}
            disabled={getNextButtonDisabled()}
            style={{
              padding: "10px 20px",
              backgroundColor: getNextButtonDisabled() ? "#bdc3c7" : "#3498db",
              color: "white",
              border: "none",
              borderRadius: "30px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: getNextButtonDisabled() ? "not-allowed" : "pointer",
              minWidth: "110px",
            }}
          >
            Next →
          </button>
        )}

        {currentStep === 3 && (
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 20px",
              background: isEditing
                ? "linear-gradient(45deg,#e67e22,#f39c12)"
                : "linear-gradient(45deg,#27ae60,#2ecc71)",
              color: "white",
              border: "none",
              borderRadius: "30px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              minWidth: "110px",
            }}
          >
            {isEditing ? "Save & Finish" : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MultiStepFormManager;
