import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, RefreshCw, Save, AlertCircle } from "lucide-react";
import "./PlanAssessmentModal.css";
import {
  getAllUsers,
  getDepartments,
} from "../../../modules/departments/services/userService";
import { useUser } from "../../../hooks/useUser";
import { captureActivity } from "../../../services/activities";

function PlanAssessmentModal({ onClose, onSaved }) {
  const user = useUser();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState([]);
  const [riskOwners, setRiskOwners] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingOwners, setLoadingOwners] = useState(false);

  // ─── Organization ─────────────────────────────────────────────────────────
  const organizationId = user?.organizationId || user?.organization || null;

  // ─── Role detection ───────────────────────────────────────────────────────
  const userRoles = Array.isArray(user?.role)
    ? user.role
    : user?.role
      ? [user.role]
      : [];

  const isRootOrAIO = userRoles.some((r) => {
    const s = (typeof r === "string" ? r : r?.name || r?.roleName || "")
      .toLowerCase()
      .replace(/[\s_-]/g, "");
    return s.includes("root") || s.includes("aio");
  });

  const [form, setForm] = useState({
    aiSystemName: "",
    department: "",
    businessObjective: "",
    intendedUse: "",
    foreseableMisuse: "",
    riskOwners: [],
    dateOfAssessment: new Date().toISOString().split("T")[0],
  });

  const selectedDeptName =
    departments.find((d) => d.id === form.department)?.name || form.department;

  useEffect(() => {
    fetchDepartmentsAndUsers();
    captureActivity({
      action: "AIIA_PLAN_MODAL_OPENED",
      item: "Opened Plan AI Assessment Modal",
    });
  }, []);

  // Re-filter risk owners whenever department or users list changes
  useEffect(() => {
    if (form.department && allUsers.length > 0) {
      fetchRiskOwnersForDepartment(form.department);
    } else {
      setRiskOwners([]);
      setForm((prev) => ({ ...prev, riskOwners: [] }));
    }
  }, [form.department, allUsers]);

  const fetchDepartmentsAndUsers = async () => {
    try {
      setLoadingDepts(true);
      setError("");

      const usersResponse = await getAllUsers();
      const users =
        usersResponse.data ??
        (Array.isArray(usersResponse) ? usersResponse : []);
      setAllUsers(users);

      const deptsResponse = await getDepartments();
      const depts =
        deptsResponse.data ??
        (Array.isArray(deptsResponse) ? deptsResponse : []);

      const departmentObjects = depts
        .map((d) => ({
          id: d._id || d.id,
          name: d.name || d.departmentName || d.title || "",
        }))
        .filter((d) => d.id && d.name);

      const unique = Array.from(
        new Map(departmentObjects.map((d) => [d.id, d])).values(),
      );
      setDepartments(unique);
      setLoadingDepts(false);
    } catch (err) {
      console.error("Error fetching departments and users:", err);
      setError("Failed to load departments. Please check your connection.");
      setLoadingDepts(false);
    }
  };

  const fetchRiskOwnersForDepartment = (selectedDeptId) => {
    setLoadingOwners(true);

    const owners = allUsers.filter((u) => {
      const userDeptIds = Array.isArray(u.department)
        ? u.department
        : u.department
          ? [u.department]
          : [];

      const inDept = userDeptIds.some((id) => {
        const idStr = typeof id === "string" ? id : id?._id || id?.id || "";
        return idStr === selectedDeptId;
      });

      if (!inDept) return false;

      const roles = Array.isArray(u.role) ? u.role : u.role ? [u.role] : [];
      const rolesAlt = Array.isArray(u.roles)
        ? u.roles
        : u.roles
          ? [u.roles]
          : [];
      const allRoles = [...roles, ...rolesAlt];

      return allRoles.some((r) => {
        const roleStr = (
          typeof r === "string" ? r : r?.name || r?.roleName || ""
        )
          .toLowerCase()
          .replace(/[\s_-]/g, "");
        return roleStr.includes("riskowner");
      });
    });

    setRiskOwners(owners);

    // Auto-select if exactly one risk owner found
    if (owners.length === 1) {
      const singleId = owners[0]._id || owners[0].id || owners[0].userId;
      setForm((prev) => ({ ...prev, riskOwners: [singleId] }));
    } else {
      setForm((prev) => ({ ...prev, riskOwners: [] }));
    }

    setLoadingOwners(false);
  };

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ─── Validation ───────────────────────────────────────────────────────────
  const baseValid = !!(form.aiSystemName && form.department);

  const detailsValid = isRootOrAIO
    ? true
    : !!(form.businessObjective && form.intendedUse);

  const canSave =
    baseValid && detailsValid && form.riskOwners.length > 0 && !!organizationId;

  const handleSave = async () => {
    if (!organizationId) {
      setError("Organization information is missing. Please log in again.");
      return;
    }

    if (!canSave) {
      setError(
        form.riskOwners.length === 0
          ? "Please select at least one risk owner."
          : "Please fill in all required fields.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        organizationId, // ✅ multi-tenancy field
        aiSystemName: form.aiSystemName,
        department: form.department,
        businessObjective: form.businessObjective,
        intendedUse: form.intendedUse,
        foreseableMisuse: form.foreseableMisuse,
        assignedRiskOwners: form.riskOwners,
        dateOfAssessment: form.dateOfAssessment,
        status: "DRAFT",
        aiSystemOwner: user?.name || user?.username || "System",
      };
      //  `${process.env.NEXT_PUBLIC_CFTB}/aiia-service/api/stage1/create`,
      const token =
        sessionStorage.getItem("authToken") || sessionStorage.getItem("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_CFTB}/aiia-service/api/stage1/create`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      if (
        response.data.status === "SUCCESS" ||
        response.status === 201 ||
        response.status === 200
      ) {
        captureActivity({
          action: "AIIA_ASSESSMENT_PLANNED",
          item: `Planned AI Assessment: ${form.aiSystemName}`,
          aiSystemName: form.aiSystemName,
          department: form.department,
          assignedRiskOwners: form.riskOwners,
        });
        onSaved();
      } else {
        setError(response.data.message || "Failed to create assessment");
      }
    } catch (err) {
      console.error("Error creating assessment:", err);
      if (err.response?.status === 401) {
        setError("Unauthorized. Please login again.");
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || "Invalid data provided");
      } else if (err.message?.includes("Network")) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to create assessment. Please try again.");
      }
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Plan AI Assessment</h2>
            <p className="modal-subtitle">
              Fill in the details to create a new assessment
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-section">
            {/* Organization missing warning */}
            {!organizationId && (
              <div
                className="alert alert-danger"
                style={{ marginBottom: "1rem" }}
              >
                <AlertCircle size={16} />
                <p>
                  Organization information is missing from your session. Please
                  log out and log in again.
                </p>
              </div>
            )}

            {/* AI System Name */}
            <div className="form-group required">
              <label className="form-label">AI System Name</label>
              <input
                type="text"
                className="form-control"
                value={form.aiSystemName}
                onChange={(e) => setField("aiSystemName", e.target.value)}
                placeholder="e.g., Customer Support Chatbot"
              />
            </div>

            {/* Department */}
            <div className="form-group required">
              <label className="form-label">Department</label>
              <div className="select-wrapper">
                <select
                  className="form-control"
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                  disabled={loadingDepts || departments.length === 0}
                >
                  <option value="">
                    {loadingDepts
                      ? "Loading departments..."
                      : "Select Department..."}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
              {departments.length === 0 && !loadingDepts && (
                <small style={{ color: "#ef4444", marginTop: "0.5rem" }}>
                  No departments available
                </small>
              )}
            </div>

            {/* Risk Owner — appears once dept is chosen */}
            {form.department && (
              <div className="form-group required">
                <label className="form-label">
                  Risk Owner
                  {form.department && riskOwners.length > 0 && (
                    <span
                      style={{
                        color: "#94a3b8",
                        fontWeight: 500,
                        marginLeft: 4,
                      }}
                    >
                      ({riskOwners.length} available)
                    </span>
                  )}
                </label>
                <div className="select-wrapper">
                  <select
                    className="form-control"
                    value={form.riskOwners[0] || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        riskOwners: e.target.value ? [e.target.value] : [],
                      }))
                    }
                    disabled={loadingOwners || riskOwners.length === 0}
                    style={{
                      opacity: loadingOwners ? 0.6 : 1,
                      background:
                        riskOwners.length === 1 ? "#fdf4ff" : undefined,
                      borderColor:
                        riskOwners.length === 1 ? "#c4b5fd" : undefined,
                    }}
                  >
                    <option value="">
                      {loadingOwners
                        ? "Loading risk owners..."
                        : riskOwners.length === 0
                          ? `No risk owners found in ${selectedDeptName}`
                          : "Select risk owner..."}
                    </option>
                    {riskOwners.map((owner) => {
                      const ownerId = owner._id || owner.id || owner.userId;
                      const ownerName =
                        owner.name ||
                        `${owner.firstName || ""} ${owner.lastName || ""}`.trim();
                      const ownerEmail =
                        owner.email || owner.emailAddress || "";
                      return (
                        <option key={ownerId} value={ownerId}>
                          {ownerName}
                          {ownerEmail ? ` — ${ownerEmail}` : ""}
                        </option>
                      );
                    })}
                  </select>
                  {loadingOwners ? (
                    <RefreshCw size={14} className="select-icon spinning" />
                  ) : (
                    <ChevronDown size={14} className="select-icon" />
                  )}
                </div>
                {form.department && riskOwners.length === 1 && (
                  <small
                    style={{
                      color: "#6b7280",
                      marginTop: "0.4rem",
                      display: "block",
                    }}
                  >
                    ✓ Auto-selected — only one risk owner in {selectedDeptName}
                  </small>
                )}
                {form.department &&
                  riskOwners.length === 0 &&
                  !loadingOwners && (
                    <small
                      style={{
                        color: "#ef4444",
                        marginTop: "0.4rem",
                        display: "block",
                      }}
                    >
                      No risk owners found — contact your administrator.
                    </small>
                  )}
              </div>
            )}

            {/* Business fields — hidden for Root/AIO */}
            {!isRootOrAIO && (
              <>
                <div className="form-group required">
                  <label className="form-label">Business Objective</label>
                  <textarea
                    className="form-control"
                    value={form.businessObjective}
                    onChange={(e) =>
                      setField("businessObjective", e.target.value)
                    }
                    placeholder="Describe the business objective of this AI system..."
                    rows={3}
                  />
                </div>

                <div className="form-group required">
                  <label className="form-label">Intended Use</label>
                  <textarea
                    className="form-control"
                    value={form.intendedUse}
                    onChange={(e) => setField("intendedUse", e.target.value)}
                    placeholder="Describe how this system will be used..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Foreseeable Misuse</label>
                  <textarea
                    className="form-control"
                    value={form.foreseableMisuse}
                    onChange={(e) =>
                      setField("foreseableMisuse", e.target.value)
                    }
                    placeholder="Potential risks or misuse scenarios..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Assessment Date */}
            <div className="form-group">
              <label className="form-label">Assessment Date</label>
              <input
                type="date"
                className="form-control"
                value={form.dateOfAssessment}
                onChange={(e) => setField("dateOfAssessment", e.target.value)}
              />
            </div>

            {/* Info note for Root/AIO */}
            {isRootOrAIO && (
              <div className="info-box" style={{ marginTop: "0.5rem" }}>
                <AlertCircle size={16} />
                <p>
                  Business Objective, Intended Use, and Foreseeable Misuse will
                  be completed by the assigned Risk Owner before they begin the
                  assessment.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="button-group">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className={`btn btn-success ${!canSave || saving ? "disabled" : ""}`}
              onClick={handleSave}
              disabled={!canSave || saving}
            >
              <Save size={16} />
              {saving ? "Creating..." : "Create Assessment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanAssessmentModal;
