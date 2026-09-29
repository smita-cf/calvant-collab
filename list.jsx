import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../../services/api";

export default function UserForm({ userToEdit = null, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "risk_identifier",
    department: "",
    organization: "",
  });
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get current logged-in user
  const user = JSON.parse(sessionStorage.getItem("user"));

  const roles = [
    "super_admin",
    "root",
    "risk_owner",
    "risk_manager",
    "risk_identifier",
  ];

  // Fetch departments filtered by user's organization
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        const decoded = token ? jwtDecode(token) : null;
        const userOrg = decoded?.organization;

        const res = await api.get("/departments");
        const d = res.data;
        setDepartments(
          Array.isArray(d)
            ? d.filter((dept) => dept.organization === userOrg)
            : []
        );
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch organizations (super_admin only)
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);

        if (decoded?.role !== "super_admin") return;

        const res = await api.get("/organizations");
        setOrganizations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch organizations:", err);
      }
    };

    fetchOrganizations();
  }, []);

  // Prefill form for editing
  useEffect(() => {
    if (userToEdit && (departments.length > 0 || organizations.length > 0)) {
      const dept = departments.find((d) => d._id === userToEdit.departmentId);
      const org = organizations.find((o) => o._id === userToEdit.organization);

      setFormData({
        name: userToEdit.name || "",
        email: userToEdit.email || "",
        password: "",
        role: userToEdit.role || "risk_identifier",
        department: dept?._id || "",
        organization: org?._id || "",
      });
    }
  }, [userToEdit, departments, organizations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeptChange = (e) => {
    setFormData((prev) => ({ ...prev, department: e.target.value }));
  };

  const handleOrgChange = (e) => {
    setFormData((prev) => ({ ...prev, organization: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email.toLowerCase(),
        role: formData.role,
        password: !userToEdit ? formData.password : undefined,
        department:
          formData.role === "risk_owner" || formData.role === "risk_identifier"
            ? formData.department
            : undefined,
        organization:
          formData.role === "root" ? formData.organization : undefined,
      };

      if (userToEdit) {
        await api.put(`/users/${userToEdit._id}`, payload);
        alert("User updated successfully!");
      } else {
        await api.post("/users/register", payload);
        alert("User created successfully!");
      }

      onSuccess && onSuccess();
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "risk_identifier",
        department: "",
        organization: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>
          {userToEdit ? "Update User" : "Create User"}
        </h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
              style={styles.input}
            />
          </div>

          {!userToEdit && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                autocomplete="new-password"
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {(formData.role === "risk_owner" ||
            formData.role === "risk_identifier") &&
            user?.role !== "super_admin" && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Department</label>
                <select
                  value={formData.department}
                  onChange={handleDeptChange}
                  required
                  style={styles.select}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

          {formData.role === "root" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Organization</label>
              <select
                value={formData.organization}
                onChange={handleOrgChange}
                required
                style={styles.select}
              >
                <option value="">Select Organization</option>
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" style={styles.primaryBtn} disabled={loading}>
            {loading ? (
              <div style={styles.spinnerWrapper}>
                <div style={styles.spinner}></div>
                <span>Processing...</span>
              </div>
            ) : userToEdit ? (
              "Update User"
            ) : (
              "Create User"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------- RESPONSIVE STYLES ----------------
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "20px", // Adds padding on small mobile screens
    width: "100%",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",        // Takes full width by default
    maxWidth: "600px",    // Stops growing on large screens
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "30px",      // Internal spacing
    boxSizing: "border-box",
  },
  heading: {
    textAlign: "center",
    marginBottom: "25px",
    fontWeight: 600,
    color: "#111827",
    fontSize: "1.5rem",
  },
  form: {
    width: "100%",
  },
  formGroup: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  label: {
    marginBottom: "8px",
    fontWeight: 500,
    color: "#374151",
    fontSize: "0.95rem",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "1rem",
    outline: "none",
    transition: "0.2s",
    background: "#fff",
    width: "100%",
    boxSizing: "border-box", // Ensures padding doesn't break width
  },
  select: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "1rem",
    outline: "none",
    transition: "0.2s",
    background: "#fff",
    width: "100%",
    boxSizing: "border-box",
    appearance: "none", // Makes it look cleaner on some browsers
  },
  primaryBtn: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    fontSize: "16px",
    cursor: "pointer",
    transition: "background 0.2s",
    marginTop: "10px",
  },
  spinnerWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

// Handle spinner animation
try {
  const styleSheet = document.styleSheets[0];
  if (styleSheet) {
    styleSheet.insertRule(
      "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }",
      styleSheet.cssRules.length
    );
  }
} catch (e) {
  // Ignore
}