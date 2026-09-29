'use client'

import React, { Component } from "react";
import API from "../../api/adminApi";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

class UserList extends Component {
  state = {
    users: [],
    departments: [],
    loading: true,
    error: "",
    success: "",
    searchTerm: "",
    editMode: false,
    updatingUserId: null, // to show spinner on individual row
  };

  componentDidMount() {
    this.fetchUsers();
    this.fetchDepartments();
  }

  fetchUsers = async () => {
    try {
      const { data } = await API.get("https://api.calvant.com/user-service/api/users");
      
      const users = data.map((u) => ({
        ...u,
        isAuditor: !!u.isAuditor, 
      }));

      this.setState({ users, loading: false, error: "", success: "" });
    } catch (err) {
      this.setState({
        error: err.response?.data?.error || "Failed to fetch users",
        loading: false,
      });
    }
  };

  fetchDepartments = async () => {
    this.setState({ loading: true });
    try {
      const { data } = await API.get("https://api.calvant.com/user-service/api/departments");
      console.log(data);
      // Get organization from JWT
      const token = sessionStorage.getItem("token");
      const decoded = token ? jwtDecode(token) : null;
      const userOrg = decoded?.organization;

      this.setState({
        departments: Array.isArray(data)
          ? data.filter((dept) => dept.organization === userOrg)
          : [],
        loading: false,
        error: "",
      });
    } catch (err) {
      this.setState({
        error: err.response?.data?.error || "Failed to fetch departments",
        loading: false,
      });
    }
  };

  handleDelete = async (id) => {
    if (!id) {
      console.error("No user ID provided!");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await API.post(
        "/users/delete",
        { id }, 
        { headers: { "Content-Type": "application/json" } },
      );

      this.setState({ success: "User deleted successfully!" });
      this.fetchUsers();
    } catch (err) {
      alert(err.response?.data || "Delete failed");
    }
  };

  handleSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  };

  handleEditToggle = () => {
    this.setState((prev) => ({
      editMode: !prev.editMode,
      success: "",
    }));
  };

  handleRoleChange = (id, newRole) => {
    this.setState((prev) => ({
      users: prev.users.map((u) => (u.id === id ? { ...u, role: newRole } : u)),
    }));
  };

  handleDeptChange = (userId, newDeptId) => {
    this.setState((prev) => ({
      users: prev.users.map((u) =>
        u.id === userId ? { ...u, department: newDeptId } : u,
      ),
    }));
  };

  handleSave = async (user) => {
    console.log("Saving user:", user); // log the user object from state
    this.setState({ updatingUserId: user.id });

    try {
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department:
          user.role !== "super_admin" ? user.department || null : null,
        isAuditor: user.isAuditor || false,
      };

      console.log("Payload sent to backend:", payload); // log payload

      const response = await API.post("/users/update", payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Backend response:", response.data); // log backend response

      this.setState({ success: `${user.name} updated successfully!` });
      this.fetchUsers();
    } catch (err) {
      console.error("Update failed:", err.response?.data || err);
      alert(err.response?.data || "Update failed");
    } finally {
      this.setState({ updatingUserId: null });
    }
  };

  handleAuditorToggle = (id, checked) => {
    this.setState((prev) => ({
      users: prev.users.map((u) =>
        u.id === id ? { ...u, isAuditor: checked } : u,
      ),
    }));
  };

  render() {
    const {
      users,
      departments,
      loading,
      error,
      success,
      searchTerm,
      editMode,
      updatingUserId,
    } = this.state;

    const roles = ["root", "risk_owner", "risk_manager", "risk_identifier"];

    const departmentMap = {};
    departments.forEach((d) => {
      departmentMap[d.id] = d.name;
    });

    const filteredUsers = users.filter((u) => {
      const deptName = u.department ? departmentMap[u.department] || "" : "";

      return [u.name, u.email, u.role, deptName]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });

    if (loading)
      return (  
        <div style={styles.loaderContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading users...</p>
        </div>
      );

    if (error)
      return (
        <p style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
          {error}
        </p>
      );

    return (
      <div style={styles.container}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Users</h2>

        {success && <div style={styles.successBox}>{success}</div>}

        {/* Add and Edit Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link style={styles.addBtn} to="/users/create">
            Add User
          </Link>

          <button onClick={this.handleEditToggle} style={styles.editMainBtn}>
            {editMode ? "Cancel Edit" : "Edit User"}
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={this.handleSearchChange}
          style={styles.searchInput}
        />

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: "#d9edf7", textAlign: "left" }}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Auditor</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "12px" }}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr
                    key={u.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#fff" : "#f3f3f3",
                      transition: "background-color 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e6f7ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? "#fff" : "#f3f3f3")
                    }
                  >
                    <td style={styles.td}>{u.name}</td>
                    <td style={styles.td}>{u.email}</td>

                    {/* Status */}
                    <td style={styles.td}>
                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor:
                            u.status === "active" ? "#e6f7ec" : "#fff4e5",
                          color: u.status === "active" ? "#1a7f43" : "#b76e00",
                        }}
                      >
                        {u.status === "active" ? "Active" : "Pending"}
                      </span>
                    </td>

                    {/* Role */}
                    <td style={styles.td}>
                      {editMode ? (
                        <select
                          value={u.role}
                          onChange={(e) =>
                            this.handleRoleChange(u.id, e.target.value)
                          }
                          style={styles.dropdown}
                        >
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      ) : (
                        u.role
                      )}
                    </td>

                    {/* Department */}
                    <td style={styles.td}>
                      {editMode && u.role !== "super_admin" ? (
                        <select
                          value={u.department || ""}
                          onChange={(e) =>
                            this.handleDeptChange(u.id, e.target.value)
                          }
                          style={styles.dropdown}>
                          <option value="">Select Department</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      ) : u.department ? (
                        // a function will fix it.
                        departmentMap[u.department] || "-"
                      ) : (
                        "-"
                      )}
                    </td>

                    <td style={styles.td}>
                      {editMode ? (
                        <input
                          type="checkbox"
                          checked={!!u.isAuditor}
                          onChange={(e) =>
                            this.handleAuditorToggle(u.id, e.target.checked)
                          }
                        />
                      ) : u.isAuditor ? (
                        "Yes"
                      ) : (
                        "No"
                      )}
                    </td>

                    <td style={styles.td}>
                      {editMode ? (
                        <button
                          onClick={() => this.handleSave(u)}
                          style={styles.saveBtn}
                          disabled={updatingUserId === u.id}
                        >
                          {updatingUserId === u.id ? "Saving..." : "Save"}
                        </button>
                      ) : (
                        <button
                          onClick={() => this.handleDelete(u.id)}
                          style={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "900px",
    margin: "auto",
    fontFamily: "Arial, sans-serif",
  },
  successBox: {
    backgroundColor: "#dff0d8",
    color: "#3c763d",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  addBtn: {
    display: "inline-block",
    padding: "8px 16px",
    backgroundColor: "#5cb85c",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "4px",
  },
  editMainBtn: {
    padding: "8px 16px",
    backgroundColor: "#0275d8",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  searchInput: {
    width: "100%",
    padding: "8px 12px",
    marginTop: "15px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: { padding: "10px", border: "1px solid #ccc" },
  td: { padding: "10px", border: "1px solid #ccc" },
  deleteBtn: {
    padding: "5px 12px",
    backgroundColor: "#d9534f",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "5px 12px",
    backgroundColor: "#5bc0de",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  },
  dropdown: {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f9fafb",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "6px solid #ddd",
    borderTop: "6px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: { marginTop: "15px", color: "#374151", fontWeight: "500" },
};

// Spinner keyframes
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }",
  styleSheet.cssRules.length,
);

export default UserList;
