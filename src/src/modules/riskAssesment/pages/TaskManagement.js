 






import React, { useState, useEffect, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import InputField from "../components/inputs/InputField";
import SelectField from "../components/inputs/SelectField";
import TextAreaField from "../components/inputs/TextAreaField";
import taskService from "../services/taskService";
import riskService from "../services/riskService";
import {
  getAllUsers,
  getDepartments,
} from "../../departments/services/userService";

export default function TaskManagement({ riskFormData = {} }) {
  const history = useHistory();
  const location = useLocation();
  const rawUser = sessionStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  const today = new Date().toISOString().split("T")[0];

  const [tasks, setTasks] = useState([]);
  const [risks, setRisks] = useState([]);
  const [riskOptions, setRiskOptions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    riskId: riskFormData.riskId || "",
    department: "",
    employee: "",
    employeeName: "",
    description: "",
    startDate: today,
    endDate: "",
  });

  const STATUS = {
    PENDING: "Pending",
    COMPLETED_PENDING: "Completed (Pending Approval)",
    APPROVED: "Approved",
  };

  // --- Fetch Departments ---
  useEffect(() => {
    let mounted = true;
    getDepartments()
      .then(
        (deptRes) =>
          mounted && setDepartments(Array.isArray(deptRes) ? deptRes : [])
      )
      .catch((err) => console.error("Failed to load departments:", err));
    return () => (mounted = false);
  }, []);

  // --- Fetch Users ---
  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      try {
        const userRes = await getAllUsers();
        if (!mounted) return;
        const userList = Array.isArray(userRes) ? userRes : [];
        setUsers(userList);

        userList.forEach((u) =>
          console.log(u.name, "department:", u.department)
        );
      } catch (err) {
        console.error("Failed to load users:", err);
        setUsers([]);
      }
    };
    fetchUsers();
    return () => (mounted = false);
  }, []);

  // --- Fetch Risks ---
  useEffect(() => {
    let mounted = true;
    const fetchRisks = async () => {
      try {
        const risksData = await riskService.getAllRisks();
        const allRisks = Array.isArray(risksData) ? risksData : [];
        if (!mounted) return;
        setRisks(allRisks);

        if (!user) return setRiskOptions([]);

        if (user.role === "risk_manager") {
          setRiskOptions(
            allRisks.map((r) => ({ value: r.riskId, label: r.riskId }))
          );
        } else {
          const deptList = await getDepartments();
          const userDept = (Array.isArray(deptList) ? deptList : []).find(
            (d) => String(d._id) === String(user.department)
          );
          if (!userDept) return setRiskOptions([]);

          const deptRisks = allRisks.filter(
            (r) => r.department === userDept.name
          );
          setRiskOptions(
            deptRisks.map((r) => ({ value: r.riskId, label: r.riskId }))
          );
        }
      } catch (err) {
        console.error("Error loading risks:", err);
        setRisks([]);
        setRiskOptions([]);
      }
    };
    fetchRisks();
    return () => (mounted = false);
  }, [user]);

  // --- Fetch Tasks ---
  useEffect(() => {
    let mounted = true;
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await taskService.getAllTasks();
        if (!mounted) return;
        const filteredTasks = riskFormData.riskId
          ? fetchedTasks.filter((t) => t.riskId === riskFormData.riskId)
          : fetchedTasks;
        setTasks(Array.isArray(filteredTasks) ? filteredTasks : []);
      } catch (err) {
        console.error("Failed to load tasks:", err);
        setTasks([]);
      }
    };
    fetchTasks();
    return () => (mounted = false);
  }, [riskFormData.riskId]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`[Input Change] name: ${name}, value: ${value}`);
    if (!name) return;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "department") {
      console.log(
        `[Department Change] resetting employee because department changed`
      );
      setFormData((prev) => ({ ...prev, department: value, employee: "" }));
    }
  };

  const handleDeptChange = (e) => {
    const { name, value } = e.target;
    console.log(`[Department Dropdown] Selected department id: ${value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      employee: "",
      employeeName: "",
    }));
  };

  // --- Employee options based on selected department ---
  const empOptions = useMemo(() => {
  const options = (users || [])
    .filter((u) => u.department?._id && String(u.department._id) === String(formData.department))
    .map((u) => ({ value: u._id, label: u.name }));

  return options;
}, [users, formData.department]);

  const addTask = async () => {
    if (
      !formData.riskId ||
      !formData.department ||
      !formData.startDate ||
      !formData.endDate
    ) {
      alert("Please fill all required fields!");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("End date cannot be before start date.");
      return;
    }

    const relatedRisk = risks.find((r) => r.riskId === formData.riskId);
    if (relatedRisk) {
      if (
        formData.startDate < relatedRisk.startDate ||
        formData.endDate > relatedRisk.endDate
      ) {
        alert(
          `Task dates must be within the risk period (${relatedRisk.startDate} → ${relatedRisk.endDate})`
        );
        return;
      }
    }

    const existingTasks = tasks.filter((t) => t.riskId === formData.riskId);
    const newTaskId = `T-${existingTasks.length + 1}`;

    let employeeId = formData.employee || "";
    let employeeName = formData.employeeName || "";
    if (employeeId && !employeeName) {
      const found = users.find((u) => String(u._id) === String(employeeId));
      employeeName = found ? found.name : "";
    }

    const newTask = {
      ...formData,
      employee: employeeId,
      employeeName,
      riskId: riskFormData.riskId || formData.riskId,
      taskId: newTaskId,
      status: STATUS.PENDING,
    };

    try {
      await taskService.saveTask(newTask);
      const updatedTasks = await taskService.getAllTasks();
      const filteredTasks = riskFormData.riskId
        ? updatedTasks.filter((t) => t.riskId === riskFormData.riskId)
        : updatedTasks;
      setTasks(filteredTasks);
    } catch (err) {
      console.error("Failed to add task:", err);
      alert("Failed to add task. See console for details.");
      return;
    }

    setFormData({
      riskId: riskFormData.riskId || "",
      department: "",
      employee: "",
      employeeName: "",
      description: "",
      startDate: today,
      endDate: "",
    });
  };

  const markTaskComplete = async (taskId) => {
    const taskToUpdate = tasks.find((t) => t.taskId === taskId);
    if (!taskToUpdate) return;

    const updatedTask = {
      ...taskToUpdate,
      status: ["risk_manager", "risk_owner"].includes(user?.role)
        ? STATUS.APPROVED
        : STATUS.COMPLETED_PENDING,
    };

    await taskService.updateTask(taskId, updatedTask);
    setTasks((prev) =>
      prev.map((t) => (t.taskId === taskId ? updatedTask : t))
    );
  };

  const buttonStyle = {
    minWidth: "50px",
    padding: "4px 8px",
    borderRadius: "5px",
    border: "none",
    fontSize: "13px",
    color: "#fff",
    cursor: "pointer",
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return `${day}-${month}-${year}`;
  };

  // NEW: Fixed "Back to Dashboard" button styles
  const backBtnStyle = {
    position: "fixed",
    top: "40px",
    right: "120px",
    padding: "10px 20px",
    borderRadius: "6px",
    backgroundColor: "#005FCC",
    border: "none",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0, 95, 204, 0.3)",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    zIndex: 99,
  };

  const handleBackBtnMouseEnter = (e) => {
    e.target.style.backgroundColor = "#0046a3";
    e.target.style.boxShadow = "0 6px 12px rgba(0, 70, 163, 0.5)";
    e.target.style.transform = "translateY(-2px)";
  };

  const handleBackBtnMouseLeave = (e) => {
    e.target.style.backgroundColor = "#005FCC";
    e.target.style.boxShadow = "0 4px 8px rgba(0, 95, 204, 0.3)";
    e.target.style.transform = "translateY(0)";
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "auto" }}>
      {/* NEW: Back to Dashboard Button */}
      {/* <button
        style={backBtnStyle}
        onClick={() => history.push("/risk-assessment")}
        onMouseEnter={handleBackBtnMouseEnter}
        onMouseLeave={handleBackBtnMouseLeave}
      >
        ← Back to Dashboard
      </button> 1*/}

      <h2 style={{ textAlign: "center" }}>Action Plan</h2>
      <p
        style={{
          textAlign: "center",
          color: "#7f8c8d",
          fontSize: "16px",
          marginBottom: "15px",
        }}
      >
        Tasks to treat identified Risks.
      </p>

      {user && ["risk_owner", "risk_manager"].includes(user.role) && (
        <div style={{ display: "grid", gap: "20px", marginBottom: "30px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            {location.pathname === "/risk-assessment/tasks" && (
              <SelectField
                label="Related Risk"
                name="riskId"
                value={formData.riskId}
                onChange={handleInputChange}
                options={riskOptions}
                placeholder="Select related risk"
              />
            )}

            <SelectField
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleDeptChange}
              options={departments.map((d) => ({
                value: d._id,
                label: d.name,
              }))}
              placeholder="Select department"
            />

            <SelectField
              label="Assign To"
              name="employee"
              value={formData.employee}
              onChange={handleInputChange}
              options={empOptions}
              placeholder="Select employee"
            />

            <TextAreaField
              label="Task Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the mitigation task..."
              rows={1}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
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
          </div>

          <button
            onClick={addTask}
            style={{
              background: "#3498db",
              color: "#fff",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ➕ Add Task
          </button>
        </div>
      )}

      <div>
        <h3>📋 Assigned Tasks</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "15px",
          }}
        >
          <thead>
            <tr style={{ background: "#f4f6f8" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Description
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Assignee
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Start Date
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                End Date
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Status
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks
              .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
              .map((task) => (
                <tr key={task.taskId}>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {task.description}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {task.employeeName ||
                      users.find((u) => String(u._id) === String(task.employee))
                        ?.name ||
                      "—"}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {formatDate(task.startDate)}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {formatDate(task.endDate)}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {task.status}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {task.status === STATUS.PENDING &&
                      String(task.employee) === String(user?.id) && (
                        <button
                          onClick={() => markTaskComplete(task.taskId)}
                          style={{ ...buttonStyle, background: "#2ecc71" }}
                        >
                          ✅
                        </button>
                      )}

                    {task.status === STATUS.COMPLETED_PENDING &&
                      (["risk_manager", "risk_owner"].includes(user?.role) ? (
                        <button
                          onClick={() => markTaskComplete(task.taskId)}
                          style={{ ...buttonStyle, background: "#f39c12" }}
                        >
                          ✅ Approved
                        </button>
                      ) : (
                        <span>✅ Waiting for approval</span>
                      ))}

                    {task.status === STATUS.APPROVED && (
                      <span>✅ Approved</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
