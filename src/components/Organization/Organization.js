import React, { Component } from "react";
import API from "../../api/api";

class Organization extends Component {
  state = {
    organizations: [],
    loading: true,
    error: "",
    success: "",
    newOrg: "",
    editMode: false,
    updatingOrgId: null,
    searchTerm: "",
  };

  componentDidMount() {
    this.fetchOrganizations();
  }

  fetchOrganizations = async () => {
    try {
      const { data } = await API.get("/organizations");
      this.setState({
        organizations: data,
        loading: false,
        error: "",
        success: "",
      });
    } catch (err) {
      this.setState({
        error: err.response?.data?.error || "Failed to fetch organizations",
        loading: false,
      });
    }
  };

  handleAddOrg = async () => {
    const { newOrg } = this.state;
    if (!newOrg.trim())
      return this.setState({ error: "Organization name is required" });
    this.setState({ loading: true });
    try {
      const res = await API.post("/organizations", { name: newOrg });
      this.setState((prev) => ({
        organizations: [...prev.organizations, res.data],
        newOrg: "",
        success: "Organization added successfully!",
        error: "",
      }));
    } catch (err) {
      this.setState({
        error: err.response?.data?.error || "Failed to add organization",
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this organization?"))
      return;
    this.setState({ updatingOrgId: id });
    try {
      await API.delete(`/organizations/${id}`);
      this.setState((prev) => ({
        organizations: prev.organizations.filter((org) => org.id !== id),
        success: "Organization deleted successfully!",
        error: "",
      }));
    } catch (err) {
      this.setState({
        error: err.response?.data?.error || "Delete failed",
      });
    } finally {
      this.setState({ updatingOrgId: null });
    }
  };

  handleSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  };

  render() {
    const {
      organizations,
      loading,
      error,
      success,
      newOrg,
      updatingOrgId,
      searchTerm,
    } = this.state;

    const filteredOrgs = organizations.filter((o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading)
      return (
        <div style={styles.loaderContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading organizations...</p>
        </div>
      );

    return (
      <div style={styles.container}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Organizations
        </h2>

        {success && <div style={styles.successBox}>{success}</div>}
        {error && (
          <div
            style={{
              ...styles.successBox,
              backgroundColor: "#f8d7da",
              color: "#721c24",
            }}
          >
            {error}
          </div>
        )}

        {/* Add Organization */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
          }}
        >
          <input
            type="text"
            placeholder="New Organization Name"
            value={newOrg}
            onChange={(e) => this.setState({ newOrg: e.target.value })}
            style={styles.searchInput}
          />
          <button
            onClick={this.handleAddOrg}
            style={styles.addBtn}
            disabled={loading}
          >
            Add
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={this.handleSearchChange}
          style={styles.searchInput}
        />

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: "#d9edf7", textAlign: "left" }}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    style={{ textAlign: "center", padding: "12px" }}
                  >
                    No organizations found.
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org, index) => (
                  <tr
                    key={org._id}
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
                    <td style={styles.td}>{org.name}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => this.handleDelete(org.id)}
                        style={styles.deleteBtn}
                        disabled={updatingOrgId === org._id}
                      >
                        {updatingOrgId === org._id ? "Deleting..." : "Delete"}
                      </button>
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
    padding: "8px 16px",
    backgroundColor: "#5cb85c",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  searchInput: {
    width: "100%",
    padding: "8px 12px",
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
  styleSheet.cssRules.length
);

export default Organization;
