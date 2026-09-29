//C:\Users\ak192\Downloads\CV_Beta_v1.0.0-Calvant_migration\CV_Beta_v1.0.0-Calvant_migration\src\modules\riskAssesment\pages\TaskManagement.js

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useEffectiveOrg } from "@/hooks/useEffectiveOrg";
import { useRouter, usePathname } from "next/navigation";
import InputField from "../components/inputs/InputField";
import SelectField from "../components/inputs/SelectField";
import TextAreaField from "../components/inputs/TextAreaField";
import taskService from "../services/taskService";
import riskService from "../services/riskService";
import {
  getAllUsers,
  getDepartments,
} from "../../departments/services/userService";

export default function RiskTaskManagement({ riskFormData = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    mounted: isHookMounted,
    isRoot,
    isPrivilegedRole,
    isViewingManagedOrg,
    effectiveOrgId,
    effectiveOrgIds,
    selectedChildOrg,
  } = useEffectiveOrg();
  const today = new Date().toISOString().split("T")[0];

  // ✅ FIX 1: always derive roles as array
  const userRoles = Array.isArray(user?.role) ? user.role : [user?.role || ""];
  const hasAnyRole = (...allowedRoles) =>
    allowedRoles.some((role) => userRoles.includes(role));

  // ✅ FIX 2: stable org ID
  const orgId = effectiveOrgId || "";

  const [tasks, setTasks] = useState([]);
  const [risks, setRisks] = useState([]);
  const [riskOptions, setRiskOptions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ FIX 3: ref for modal scroll preservation
  const modalScrollRef = useRef(null);

  const emptyForm = useCallback(() => ({
    riskId: riskFormData.riskId || "",
    organization: orgId,
    department: "",
    employee: "",
    employeeName: "",
    employeeId: "",
    description: "",
    startDate: today,
    endDate: "",
    priority: "Medium",
  }), [riskFormData.riskId, orgId, today]);

  const [formData, setFormData] = useState(emptyForm);

  const STATUS = {
    PENDING: "Pending",
    COMPLETED_PENDING: "Completed (Pending Approval)",
    APPROVED: "Approved",
  };

  const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];
  const PRIORITY_CONFIG = {
    Low: { color: "#2f9e44", bg: "#ebfbee", border: "#2f9e44" },
    Medium: { color: "#f59f00", bg: "#fff9db", border: "#f59f00" },
    High: { color: "#e8590c", bg: "#fff4e6", border: "#e8590c" },
    Critical: { color: "#c92a2a", bg: "#fff5f5", border: "#c92a2a" },
  };

  // ── Fetch Departments ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isHookMounted) return;
    let mounted = true;
    setIsLoading(true);
    getDepartments()
      .then((d) => {
        if (!mounted) return;
        setDepartments(
          Array.isArray(d)
            ? d.filter((dept) =>
              String(dept.organization) === String(orgId)
            )
            : []
        );
      })
      .catch(console.error)
      .finally(() => mounted && setIsLoading(false));
    return () => { mounted = false; };
  }, [isHookMounted, orgId]);

  // ── Fetch Users ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isHookMounted) return;
    let mounted = true;
    getAllUsers()
      .then((res) => {
        if (!mounted) return;
        setUsers(
          Array.isArray(res)
            ? res.filter((u) =>
              String(u.organization?._id || u.organization) === String(orgId)
            )
            : []
        );
      })
      .catch((err) => { console.error(err); setUsers([]); });
    return () => { mounted = false; };
  }, [isHookMounted, orgId]);

  // ── Fetch Risks ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isHookMounted || !user) return;
    let mounted = true;
    const fetchRisks = async () => {
      try {
        const risksData = await riskService.getAllRisks();
        const allRisks = Array.isArray(risksData)
          ? risksData.filter((r) =>
            String(r.organization?._id || r.organization) === String(orgId)
          )
          : [];
        if (!mounted) return;
        setRisks(allRisks);
        if (!user) return setRiskOptions([]);

        // ✅ FIX 4: check roles array not scalar
        if (hasAnyRole("risk_manager", "root", "super_admin", "aio", "ciso", "dpo")) {
          setRiskOptions(allRisks.map((r) => ({ value: r.riskId, label: r.riskId })));
        } else {
          const deptList = await getDepartments();
          const userDept = (Array.isArray(deptList) ? deptList : []).find(
            (d) => String(d._id) === String(user.department?._id || user.department)
          );
          if (!userDept) return setRiskOptions([]);
          const deptRisks = allRisks.filter((r) => r.department === userDept.name);
          setRiskOptions(deptRisks.map((r) => ({ value: r.riskId, label: r.riskId })));
        }
      } catch (err) {
        console.error(err);
        setRisks([]);
        setRiskOptions([]);
      }
    };
    fetchRisks();
    return () => { mounted = false; };
  }, [isHookMounted, user, orgId]);

  // ── Fetch Tasks ────────────────────────────────────────────────────────────
  // ✅ FIX 5: useCallback so it can be safely called anywhere
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTasks = await taskService.getAllTasks();
      const filtered = riskFormData.riskId
        ? fetchedTasks.filter(
          (t) =>
            t.riskId === riskFormData.riskId &&
            String(t.organization?._id || t.organization) === String(orgId)
        )
        : fetchedTasks.filter(
          (t) => String(t.organization?._id || t.organization) === String(orgId)
        );
      setTasks(filtered);
    } catch (err) {
      console.error(err);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [riskFormData.riskId, orgId]); // ✅ FIX 6: correct deps

  useEffect(() => {
    if (isHookMounted && orgId) fetchTasks();
  }, [isHookMounted, fetchTasks, orgId]);

  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ FIX 7: preserve modal scroll on dept change
  const handleDeptChange = (e) => {
    const { name, value } = e.target;
    const scrollTop = modalScrollRef.current?.scrollTop ?? 0;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      employee: "",
      employeeName: "",
      employeeId: "",
    }));

    requestAnimationFrame(() => {
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = scrollTop;
      }
    });
  };

  const handleEmployeeChange = (e) => {
    const selectedName = e.target.value;
    const selectedUser = users.find((u) => u.name === selectedName);
    setFormData((prev) => ({
      ...prev,
      employee: selectedName,
      employeeName: selectedName,
      employeeId: selectedUser?._id || selectedUser?.id || "",
    }));
  };

  const empOptions = useMemo(() => {
    const selectedDeptObj = departments.find((d) => d.name === formData.department);
    const selectedDeptId = selectedDeptObj?._id || selectedDeptObj?.id;
    if (!selectedDeptId) return [];
    return users
      .filter((u) => {
        if (!u.department) return false;
        if (Array.isArray(u.department))
          return u.department.some((dept) => String(dept) === String(selectedDeptId));
        return String(u.department) === String(selectedDeptId);
      })
      .map((u) => ({ value: u.name, label: u.name }));
  }, [users, departments, formData.department]);

  // ── Save Task ──────────────────────────────────────────────────────────────
  const saveTask = async () => {
    if (!formData.riskId || !formData.department || !formData.startDate || !formData.endDate) {
      alert("Please fill all required fields!");
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("End date cannot be before start date.");
      return;
    }

    const relatedRisk = risks.find((r) => r.riskId === formData.riskId);
    if (
      relatedRisk &&
      (formData.startDate < relatedRisk.startDate ||
        formData.endDate > relatedRisk.endDate)
    ) {
      alert(
        `Task dates must be within the risk period (${relatedRisk.startDate} → ${relatedRisk.endDate})`
      );
      return;
    }

    let employeeName = formData.employee || "";
    let employeeId = formData.employeeId || "";

    // Auto-assign to dept risk_owner if no employee selected
    if (!employeeName && formData.department) {
      const deptObj = departments.find((d) => d.name === formData.department);
      const deptId = deptObj?._id || deptObj?.id;
      const deptRiskOwner = users.find((u) => {
        const uDepts = Array.isArray(u.department) ? u.department : [u.department];
        const uRoles = Array.isArray(u.role) ? u.role : [u.role];
        return (
          uDepts.some((d) => String(d) === String(deptId)) &&
          uRoles.includes("risk_owner")
        );
      });
      if (deptRiskOwner) {
        employeeName = deptRiskOwner.name;
        employeeId = deptRiskOwner._id || deptRiskOwner.id || "";
      }
    }

    // Reporter info
    const reporterUser = users.find((u) => u.name === (user?.name || ""));
    const reporterId = reporterUser?._id || reporterUser?.id || "";

    setIsSaving(true);
    try {
      if (editingTaskId) {
        await taskService.updateTask(
          editingTaskId,
          { ...formData, employee: employeeName, employeeId: employeeId || null, taskId: editingTaskId },
          user?.name || "System"
        );
      } else {
        const assigneeUser = users.find((u) => u.name === employeeName);
        await taskService.saveTask(
          {
            ...formData,
            employee: employeeName,
            employeeId: employeeId || null,
            employeeName: employeeName,
            employeeEmail: assigneeUser?.email || "",
            organization: orgId,
            status: STATUS.PENDING,
            reporter: user?.name || "",
            reporterId: reporterId || null,
            reporterEmail: user?.email || "",
          },
          user?.name || "System"
        );
      }
      await fetchTasks();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${editingTaskId ? "update" : "add"} task.`);
      return;
    } finally {
      setIsSaving(false);
    }

    setFormData(emptyForm());
    setIsModalOpen(false);
    setEditingTaskId(null);
  };

  // ── Delete Task ────────────────────────────────────────────────────────────
  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskService.deleteTask(taskId);
      await fetchTasks();
      if (activeTaskId === taskId) setActiveTaskId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete task.");
    }
  };

  // ── Mark Complete / Approve ────────────────────────────────────────────────
  const markTaskComplete = async (taskId) => {
    const taskToUpdate = tasks.find((t) => t.taskId === taskId);
    if (!taskToUpdate) return;
    // ✅ FIX 8: use hasAnyRole helper (works with array roles)
    const updatedTask = {
      ...taskToUpdate,
      status: hasAnyRole("risk_manager", "risk_owner", "root", "super_admin", "aio", "ciso", "dpo")
        ? STATUS.APPROVED
        : STATUS.COMPLETED_PENDING,
    };
    try {
      await taskService.updateTask(taskId, updatedTask);
      await fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to update task status.");
    }
  };

  // ── Edit Handler ───────────────────────────────────────────────────────────
  // ✅ FIX 9: include organization in edit form
  const editTask = (task) => {
    const matchedUser = users.find((u) => u.name === task.employee);
    setFormData({
      riskId: task.riskId || "",
      organization: orgId,
      department: task.department || "",
      employee: task.employee || "",
      employeeName: task.employeeName || task.employee || "",
      employeeId: task.employeeId || matchedUser?._id || matchedUser?.id || "",
      description: task.description || "",
      startDate: task.startDate || today,
      endDate: task.endDate || "",
      priority: task.priority || "Medium",
    });
    setEditingTaskId(task.taskId);
    setIsModalOpen(true);
  };

  // ✅ FIX 10: "Mark Complete" button — compare employee ID to user ID correctly
  const canMarkComplete = (task) => {
    if (task.status !== STATUS.PENDING) return false;
    const userId = user?._id || user?.id || "";
    return (
      String(task.employeeId) === String(userId) ||
      String(task.employee) === String(user?.name)
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return `${day}-${month}-${year}`;
  };

  const buttonStyle = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "transform 0.1s, opacity 0.2s",
  };

  return (
    <div style={{ padding: "30px", width: "100%", margin: "0", background: "#fff", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #e9ecef", boxSizing: "border-box" }}>


      {/* Task list */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
        {tasks
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .map((task) => {
            const isActive = activeTaskId === task.taskId;
            const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;

            return (
              <div
                key={task.taskId}
                style={{
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  cursor: "pointer",
                  background: isActive ? "#ffffff" : "#fdfdfd",
                  boxShadow: isActive ? "0 8px 24px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.02)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  transform: isActive ? "scale(1.002)" : "scale(1)",
                  zIndex: isActive ? 10 : 1
                }}
                onClick={() => setActiveTaskId(isActive ? null : task.taskId)}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)";
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "4px", background: priorityConfig.border }} />
                
                {/* Collapsed / Header View */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${priorityConfig.bg}`, display: "flex", alignItems: "center", justifyContent: "center", color: priorityConfig.color, border: `1px solid ${priorityConfig.border}30` }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                      <h4 style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "15px", letterSpacing: "0.2px", whiteSpace: isActive ? "normal" : "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {task.description || "Untitled Task"}
                      </h4>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexShrink: 0 }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      {task.employee ? task.employee.split(" ")[0] : "Unassigned"}
                    </span>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: task.status === STATUS.APPROVED ? "#dcfce7" : (task.status === STATUS.COMPLETED_PENDING ? "#fef3c7" : "#f1f5f9"),
                      color: task.status === STATUS.APPROVED ? "#166534" : (task.status === STATUS.COMPLETED_PENDING ? "#92400e" : "#475569"),
                    }}>
                      {task.status}
                    </span>
                    <div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", transform: isActive ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </div>

                {/* Expanded View */}
                {isActive && (
                  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #f1f5f9", fontSize: "14px", lineHeight: "1.6", color: "#475569", animation: "fadeIn 0.3s ease-out" }}>
                    
                    {task.description && (
                      <div style={{ marginBottom: "20px", padding: "16px", background: "#f8fafc", borderRadius: "8px", color: "#334155", fontSize: "13px", lineHeight: "1.6" }}>
                        <strong style={{ display: "block", marginBottom: "4px", color: "#0f172a", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Task Description / Name</strong>
                        {task.description}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#ffffff", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                         <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                         </div>
                         <div>
                           <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Assignee</span>
                           <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>{task.employee || "Unassigned"}</span>
                         </div>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#ffffff", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                         <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                         </div>
                         <div>
                           <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Start Date</span>
                           <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>{formatDate(task.startDate)}</span>
                         </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#ffffff", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                         <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" }}>
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                         </div>
                         <div>
                           <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>End Date</span>
                           <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>{formatDate(task.endDate)}</span>
                         </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", padding: "16px", background: "#f8fafc", borderRadius: "10px" }}>
                      {canMarkComplete(task) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markTaskComplete(task.taskId); }}
                          style={{ ...buttonStyle, background: "#10b981", boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Mark Complete
                        </button>
                      )}
                      {task.status === STATUS.COMPLETED_PENDING &&
                        hasAnyRole("risk_owner", "root", "super_admin", "aio", "ciso", "dpo") && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markTaskComplete(task.taskId); }}
                            style={{ ...buttonStyle, background: "#f59e0b", boxShadow: "0 2px 8px rgba(245, 158, 11, 0.2)" }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Approve
                          </button>
                        )}
                      {task.status === STATUS.APPROVED && (
                        <span style={{ fontSize: 13, color: "#166534", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", background: "#dcfce7", padding: "6px 12px", borderRadius: "20px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Approved
                        </span>
                      )}

                      {hasAnyRole("risk_owner", "root", "super_admin", "aio", "ciso", "dpo") && (
                        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); editTask(task); }}
                            style={{ ...buttonStyle, background: "#ffffff", color: "#475569", border: "1px solid #cbd5e1" }}
                          >
                            Edit Task
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteTask(task.taskId); }}
                            style={{ ...buttonStyle, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Add Task button */}
      {user && hasAnyRole("risk_owner", "root", "super_admin", "aio", "ciso", "dpo") && (
        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          <button
            style={{
              background: "#3b82f6", color: "#fff", border: "none",
              padding: "12px 24px", borderRadius: "10px", cursor: "pointer",
              fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            onClick={() => {
              setFormData(emptyForm());
              setEditingTaskId(null);
              setIsModalOpen(true);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Task
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex",
          justifyContent: "center", alignItems: "center",
          zIndex: 99999, padding: "20px", boxSizing: "border-box",
          animation: "fadeIn 0.2s ease-out"
        }}>
          {/* ✅ FIX 7: ref added here */}
          <div
            ref={modalScrollRef}
            style={{
              background: "#ffffff", padding: "32px", borderRadius: "16px",
              width: "100%", maxWidth: "650px", boxSizing: "border-box",
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
            }}
          >
            <h3 style={{ marginBottom: "24px", fontWeight: "700", color: "#0f172a", fontSize: "22px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
              {editingTaskId ? "Edit Task" : "Create New Task"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                {pathname === "/risk-assessment/tasks" && (
                  <SelectField
                    label="Related Risk"
                    name="riskId"
                    value={formData.riskId}
                    onChange={handleInputChange}
                    options={riskOptions}
                    placeholder="Select related risk"
                  />
                )}
              </div>
              <SelectField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleDeptChange}   // ✅ uses scroll-preserving handler
                options={departments.map((d) => ({ value: d.name, label: d.name }))}
                placeholder="Select department"
              />
              <SelectField
                label="Assign To"
                name="employee"
                value={formData.employee}
                onChange={handleEmployeeChange}
                options={empOptions}
                placeholder="Select employee"
              />

              <div style={{ gridColumn: "1 / -1" }}>
                <TextAreaField
                  label="Task Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the mitigation task..."
                  rows={2}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 10, color: "#475569" }}>
                  Priority Level
                </label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {PRIORITY_OPTIONS.map((p) => {
                    const c = PRIORITY_CONFIG[p];
                    const isSelected = formData.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                        style={{
                          padding: "10px 20px", borderRadius: 8, cursor: "pointer",
                          fontSize: 13, fontWeight: 600,
                          border: "1px solid " + (isSelected ? c.border : "#e2e8f0"),
                          background: isSelected ? c.bg : "#f8fafc",
                          color: isSelected ? c.color : "#64748b",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          boxShadow: isSelected ? `0 2px 8px ${c.border}20` : "none"
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = "#f1f5f9";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = "#f8fafc";
                          }
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
              <InputField
                label="Start Date"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={today}
              />
              <InputField
                label="End Date"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || today}
                max={riskFormData.deadlineDate || undefined}
              />
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
                <button
                  style={{ padding: "10px 24px", borderRadius: "8px", cursor: "pointer", background: "#ffffff", color: "#475569", border: "1px solid #cbd5e1", fontWeight: "600", fontSize: "14px", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#ffffff"}
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTaskId(null);
                    setFormData(emptyForm());
                  }}
                >
                  Cancel
                </button>
                <button
                  style={{
                    padding: "10px 24px", borderRadius: "8px", cursor: "pointer",
                    background: "#3b82f6", color: "#ffffff", border: "none", fontWeight: "600", fontSize: "14px",
                    opacity: isSaving ? 0.7 : 1,
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                    transition: "transform 0.2s, box-shadow 0.2s"
                  }}
                  onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.transform = "translateY(-1px)" }}
                  onMouseLeave={(e) => { if (!isSaving) e.currentTarget.style.transform = "translateY(0)" }}
                  onClick={saveTask}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : editingTaskId ? "Update Task" : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
